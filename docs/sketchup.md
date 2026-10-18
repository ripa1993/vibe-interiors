# The SketchUp route (optional)

Read this before modelling in SketchUp through the SketchUp MCP. The default route (generator scripts) needs none of it: see "Workflow for every model change" in `CLAUDE.md`. Everything here is about the live SketchUp model: the workflow, the SDK facts, the Python helpers for `build_model`, the exporter to `scene.json`, and the construction patterns that depend on the SketchUp SDK. Keep adding SketchUp discoveries here, not in `CLAUDE.md`.

## Workflow for the SketchUp route
1. Change the model with `mcp__sketchup__build_model`.
2. Export the live model: call `session_state["dump_scene"]()` inside `build_model` and return it in `result` (code below).
3. `Write` the JSON to `<repo>/projects/<name>/scene.json` (valid JSON, a single object). The page reloads itself in about a second and keeps the user's orbit angle.
4. Verify with a headless screenshot (see "Testing the viewer headlessly" in `CLAUDE.md`) and read the PNG.
5. Only call `save_model` when the user asks for a `.skp`.

Cost tip: the whole scene goes through Claude's output twice (tool result, then Write). Keep it small: boxes as `box`, curved things as parametric primitives (`tube`, `slab`, `tray`, `rbox`), never as thousands of triangles. Round numbers to 3 decimals.

## Why the repo exports from the live model (research already done, don't redo)
- No free viewer found that auto-refreshes a `.skp`. SketchUp Viewer for Desktop was discontinued on 2025-04-22.
- Innerscene web viewer (innerscene.com/tools/skp-viewer) opens `.skp` in the browser (parses locally), and can be driven with Playwright (`input[type=file]`, first one), but it rendered every colour as grey-white and ignored the saved camera. The desktop app `Innerscene 3D Viewer.app` did not reload as the user expected ("not working as expected").
- Parsing `.skp` outside SketchUp is the weak point; exporting the live model through the MCP (this project) avoids it and gives exact geometry, colours and camera.

## SketchUp MCP: facts and gotchas
- **Server**: Trimble's official SketchUp Connector for Claude, configured in the committed `.mcp.json` (the same as `claude mcp add --scope project --transport http sketchup https://api.sketchup.com/mcp/v1/sketchup/mcp`; each user approves the server once and signs in with a Trimble ID; the name `sketchup` gives the tools the `mcp__sketchup__*` prefix used here; setup page: https://help.sketchup.com/en/sketchup-claude-connector). It runs in the cloud, creates new files only (cannot edit an existing `.skp`) and a free account generates up to 30 models. The help page lists the tools `get_docs`, `evaluate_py`, `save_model`, while the workflow below was written with `build_model`, `list_skills`, `read_skill`: the tool set seems to have changed between versions (unverified), so look up the current names (ToolSearch) before relying on the ones below.
**Before the first `build_model` of a conversation**: `list_skills`, then `read_skill` for every *baseline* skill: `sketchup-sdk`, `sketchup-clean-geometry`, `sketchup-components`, `sketchup-assembly-structure`, `sketchup-camera`, `sketchup-styles`, `sketchup-solid-cleanup`. Read contextual ones when relevant (`sketchup-rounded-corners`, `sketchup-scenes`, `sketchup-part-boundaries`). Pass `clean: true` on the first call of a new task.

- Tools: `build_model` (Python against the live model), `save_model` (returns a download URL + thumbnail), `list_skills`, `read_skill`. There is **no tool to list saved designs** and none to render.
- **Saves are limited (30 per quota, see `saves_remaining` in the result).** The preview needs no save: it reads the live model.
- Session expires after 30 min of inactivity (6 h max). Then the model is gone. `session_state` (a plain dict) survives calls until the model is recreated, and can hold functions.
- Sandbox: no `import`, no `open`, no `exec/eval/type/setattr`, **no `any()` / `all()`** (use loops), no filesystem or network. `math` is preloaded. Functions defined in one call are *not* visible in the next unless stored in `session_state`.
- Units are inches. X width, Y depth, Z up. Walls are always 5" thick (skill rule).
- Transforms: `group.get_transform().values` is a flat list of 16 (column-major); there is **no `.to_a()`**. Build parts at their own origin and place them with `set_transform` (assembly-structure skill), but keep the exporter's coordinate rules in mind (below).
- `get_bounding_box()` returns `min_point[i]` / `max_point[i]` (subscript, not call).
- Faces: `f.get_outer_loop().get_vertices()`, `f.get_inner_loops()`, `f.get_num_inner_loops()`, `f.get_front_material().get_color()` (`.red/.green/.blue/.alpha`). `face.get_vertices()` returns only the outer loop.
- A face with holes: `geom.add_face(outer)` then `geom.face_add_inner_loop(face_idx, loop)` with the loop in **reversed** winding; also add the hole's jamb faces. Prefer **inner loops over splitting walls**; for countertop-style slabs see `slab_poly_geom` below.
- `build_model` is not transactional: on error, earlier mutations stay. Check `model_snapshot.totals` and group boxes after a failure.
- Materials: create with `Material()`, set name+colour, then `model.add_materials([m])`; check for existing names first (duplicates silently drop geometry). Apply per face (`set_front_material` and `set_back_material`), `group.set_material` is unreliable.
- Components: the same definition can't be tweaked per instance; to vary one instance make a second definition.
- **Overlapping solids are accepted silently** (two groups can occupy the same space). Watch the snapshot's bbox intersections and design clearances explicitly (e.g. something recessed into a solid box needs the box lowered or hollowed, otherwise it's hidden inside).
- Swept tubes: the skill's `build_swept_path` uses fixed-orientation rings and only works for paths mostly along X. For arbitrary 3D paths use the parallel-transport `tube_geom` below (triangles, then soften all edges except the end-cap rings).
- Camera (`sketchup-camera` skill): `cam.set_orientation(eye, target, up)`, `cam.enable_perspective()`, `cam.set_perspective_frustum_fov(fov)`, **`model.set_camera(cam)`** (mandatory for the file's opening view).
- Style (`sketchup-styles` skill): `RenderingOptionKey` / `TypedValue(bool_value=...)` etc. Keys that worked: `BACKGROUND_COLOR`, `DRAW_GROUND`, `DRAW_HORIZON`, `DRAW_SILHOUETTES`, `SILHOUETTE_WIDTH`, `DRAW_DEPTH_QUE`, `HIGHLIGHT_COLOR`, `LOCKED_COLOR`.
- Solid check: `group.compute_volume()` is not None for a valid solid (nested children disqualify). Run `validate_model_solids()` from the solid-cleanup skill before saving something the user will edit.

## Python helpers for `build_model` (copy into a call; redefine every call, or keep in `session_state`)
Colours/boxes/transform:
```python
def get_or_create_material(name, r, g, b, a=255):
    existing = {m.get_name(): m for m in model.get_materials()}
    if name in existing:
        return existing[name]
    mat = Material(); mat.set_name(name); mat.set_color(SUColor(r, g, b, a))
    model.add_materials([mat]); return mat

def apply_material(group, mat):
    for face in group.get_entities().get_faces():
        face.set_front_material(mat); face.set_back_material(mat)

def tf(tx=0, ty=0, tz=0):
    return SUTransformation([1,0,0,0, 0,1,0,0, 0,0,1,0, tx,ty,tz,1])

def make_quad_box(w, d, h):   # origin at (0,0,0), six quads
    geom = GeometryInput()
    geom.set_vertices([SUPoint3D(0,0,0),SUPoint3D(w,0,0),SUPoint3D(w,d,0),SUPoint3D(0,d,0),
                       SUPoint3D(0,0,h),SUPoint3D(w,0,h),SUPoint3D(w,d,h),SUPoint3D(0,d,h)])
    for fv in [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7],[0,3,2,1]]:
        lp = LoopInput()
        for i in fv: lp.add_vertex_index(i)
        _, geom = geom.add_face(lp)
    return geom

def add_group_geom(parent_entities, name, geom, mat, tx=0, ty=0, tz=0):
    g = Group(); parent_entities.add_group(g)          # add to the parent BEFORE filling
    g.get_entities().fill(geom, weld_vertices=True)
    g.set_name(name); apply_material(g, mat); g.set_transform(tf(tx, ty, tz)); return g
```
Rounded plans, slabs with holes, trays, lofts (all faces outward / inward as noted):
```python
def rounded_rect(x0, y0, x1, y1, r, seg=4):            # CCW from above, 4*(seg+1) points
    pts = []
    for cx, cy, a0 in ((x1-r, y0+r, -90), (x1-r, y1-r, 0), (x0+r, y1-r, 90), (x0+r, y0+r, 180)):
        for k in range(seg + 1):
            a = math.radians(a0 + 90.0 * k / seg)
            pts.append((cx + r*math.cos(a), cy + r*math.sin(a)))
    return pts

def slab_poly_geom(outer, holes, z0, z1):               # outer CCW, holes CCW (point lists of (x,y))
    n = len(outer)
    verts = [SUPoint3D(x, y, z0) for x, y in outer] + [SUPoint3D(x, y, z1) for x, y in outer]
    hb = []
    for h in holes:
        hb.append(len(verts))
        verts += [SUPoint3D(x, y, z0) for x, y in h] + [SUPoint3D(x, y, z1) for x, y in h]
    geom = GeometryInput(); geom.set_vertices(verts)
    def loop(idx):
        lp = LoopInput()
        for i in idx: lp.add_vertex_index(i)
        return lp
    top, geom = geom.add_face(loop([n + i for i in range(n)]))
    for h, b in zip(holes, hb):
        m = len(h); geom = geom.face_add_inner_loop(top, loop([b + m + i for i in range(m-1, -1, -1)]))
    bot, geom = geom.add_face(loop([i for i in range(n-1, -1, -1)]))
    for h, b in zip(holes, hb):
        m = len(h); geom = geom.face_add_inner_loop(bot, loop([b + i for i in range(m)]))
    for i in range(n):
        j = (i + 1) % n; _, geom = geom.add_face(loop([i, j, n + j, n + i]))
    for h, b in zip(holes, hb):
        m = len(h)
        for i in range(m):
            j = (i + 1) % m; _, geom = geom.add_face(loop([b + j, b + i, b + m + i, b + m + j]))
    return geom

def tray_geom(prof, depth):                              # open top; floor z=0, walls up to z=depth, normals inward/up
    m = len(prof)
    geom = GeometryInput()
    geom.set_vertices([SUPoint3D(x, y, 0) for x, y in prof] + [SUPoint3D(x, y, depth) for x, y in prof])
    def loop(idx):
        lp = LoopInput()
        for i in idx: lp.add_vertex_index(i)
        return lp
    _, geom = geom.add_face(loop(list(range(m))))
    for i in range(m):
        j = (i + 1) % m; _, geom = geom.add_face(loop([m + i, m + j, j, i]))
    return geom

def loft_geom(rings):                                    # equal-length CCW rings [(x,y,z)], bottom to top, flat caps
    m = len(rings[0]); verts = [SUPoint3D(*p) for ring in rings for p in ring]
    geom = GeometryInput(); geom.set_vertices(verts)
    def loop(idx):
        lp = LoopInput()
        for i in idx: lp.add_vertex_index(i)
        return lp
    for i in range(len(rings) - 1):
        for j in range(m):
            j2 = (j + 1) % m
            b0, b1, t0, t1 = i*m + j, i*m + j2, (i+1)*m + j, (i+1)*m + j2
            _, geom = geom.add_face(loop([b0, b1, t1])); _, geom = geom.add_face(loop([b0, t1, t0]))
    _, geom = geom.add_face(loop([m-1-k for k in range(m)]))
    last = (len(rings) - 1) * m
    _, geom = geom.add_face(loop([last + k for k in range(m)]))
    return geom, m
```
Tubes (parallel-transport frames; works for any 3D path; outward normals; ring order CCW about the path direction):
```python
def v_sub(a, b): return (a[0]-b[0], a[1]-b[1], a[2]-b[2])
def v_dot(a, b): return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
def v_cross(a, b): return (a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0])
def v_norm(a):
    l = math.sqrt(v_dot(a, a)); return (a[0]/l, a[1]/l, a[2]/l)

def tube_geom(path, radii, n):
    k = len(path)
    tans = [v_norm(v_sub(path[min(i+1, k-1)], path[max(i-1, 0)])) for i in range(k)]
    helper = (1, 0, 0) if abs(tans[0][0]) < 0.9 else (0, 1, 0)
    e1 = v_norm(v_cross(tans[0], helper))
    geom = GeometryInput(); verts, rings = [], []
    for i in range(k):
        t = tans[i]; d = v_dot(e1, t)
        e1 = v_norm((e1[0]-d*t[0], e1[1]-d*t[1], e1[2]-d*t[2])); e2 = v_cross(t, e1)
        ring = []
        for j in range(n):
            a = 2*math.pi*j/n; c, s = math.cos(a), math.sin(a); p, r = path[i], radii[i]
            verts.append(SUPoint3D(p[0]+r*(c*e1[0]+s*e2[0]), p[1]+r*(c*e1[1]+s*e2[1]), p[2]+r*(c*e1[2]+s*e2[2])))
            ring.append(len(verts) - 1)
        rings.append(ring)
    geom.set_vertices(verts)
    def face(idx):
        lp = LoopInput()
        for i in idx: lp.add_vertex_index(i)
        return lp
    for i in range(k - 1):
        rb, rt = rings[i], rings[i+1]
        for j in range(n):
            j2 = (j + 1) % n
            _, geom = geom.add_face(face([rb[j], rb[j2], rt[j2]])); _, geom = geom.add_face(face([rb[j], rt[j2], rt[j]]))
    _, geom = geom.add_face(face(list(reversed(rings[0])))); _, geom = geom.add_face(face(rings[-1]))
    return geom

for key in ("tubes", "prims"):
    if key not in session_state: session_state[key] = {}

def soften_except_caps(g, capn):                         # soft body, crisp end-cap rings
    for e in g.get_entities().get_edges():
        fs = e.get_faces()
        if len(fs) == 2:
            cap = False
            for f in fs:
                if f.get_num_vertices() == capn: cap = True
            e.set_soft(not cap); e.set_smooth(not cap)

def rbox_rings(b, r, top, bot=0.0):                      # rings for loft_geom: plan radius r, top fillet, optional bottom fillet
    x0, y0, z0, x1, y1, z1 = b
    specs = []
    if bot > 0:
        for deg in (90, 75, 60, 45, 30, 15):
            t = math.radians(deg); specs.append((bot * (1 - math.cos(t)), z0 + bot - bot * math.sin(t)))
        specs.append((0.0, z0 + bot))
    else:
        specs.append((0.0, z0))
    specs.append((0.0, z1 - top))
    for deg in (15, 30, 45, 60, 75, 90):
        t = math.radians(deg); specs.append((top * (1 - math.cos(t)), z1 - top + top * math.sin(t)))
    return [[(px, py, zz) for px, py in rounded_rect(x0 + ins, y0 + ins, x1 - ins, y1 - ins, max(r - ins, 0.05))] for ins, zz in specs]
# usage: geom, m = loft_geom(rbox_rings(b, r, top, bot)); g = add_group_geom(...); soften_except_caps(g, m)
#        session_state["prims"][name] = {"type": "rbox", "b": b, "r": r, "top": top, "bot": bot}   # world coords

def add_tube(parent_entities, name, path, radii, mat, n=12):
    g = add_group_geom(parent_entities, name, tube_geom(path, radii, n), mat)
    soften_except_caps(g, n)
    session_state["tubes"][name] = {"p": [list(p) for p in path], "r": list(radii), "n": n}   # LOCAL coords, see exporter rules
    return g
```
Parametric specs for the viewer are registered next to the SketchUp geometry:
```python
session_state["prims"]["Slab_A"] = {"type": "slab", "o": [[x,y],...], "h": [[[x,y],...]], "z": [z0, z1]}
session_state["prims"]["Tray_A"] = {"type": "tray", "o": [[x,y],...], "z": [zFloor, zTop]}
session_state["prims"]["Box_A"]  = {"type": "rbox", "b": [x0,y0,z0,x1,y1,z1], "r": 2.6, "top": 2.6}
```

### Exporter (store in `session_state["dump_scene"]`, call it, return `result = {"scene": s}`)
**Rules it relies on**
- `tubes` and `prims` are looked up by the **leaf group name**, so leaf names must be unique across the model (a duplicate name made one object take another's shape once). Name parts uniquely, e.g. `Unit_A_Body`, not `Body`.
- `tube` paths are stored in the group's **local** coordinates and the exporter applies the full world matrix. `slab` / `tray` / `rbox` specs must be stored in **world** coordinates (the exporter does not transform them).
- Anything else: 6 axis-aligned quads become a `box`; other leaves are exported as meshes.
- If you edit a part later, update its `session_state` spec too, or the preview will show the old shape.
```python
def mul(a, b):
    r = [0.0] * 16
    for c in range(4):
        for rr in range(4):
            r[c*4 + rr] = sum(a[k*4 + rr] * b[c*4 + k] for k in range(4))
    return r
def apply(m, p):
    x, y, z = p
    return [m[0]*x + m[4]*y + m[8]*z + m[12], m[1]*x + m[5]*y + m[9]*z + m[13], m[2]*x + m[6]*y + m[10]*z + m[14]]
def color_of(mat):
    if mat is None: return None
    c = mat.get_color(); return [c.red, c.green, c.blue, c.alpha]
def r3(v): return [round(x, 3) for x in v]
def loop_pts(loop, m):
    return [apply(m, [v.get_position().x, v.get_position().y, v.get_position().z]) for v in loop.get_vertices()]

def collect(ents, m, path, leaves):
    faces = []
    for f in ents.get_faces():
        outer = loop_pts(f.get_outer_loop(), m)
        holes = [loop_pts(l, m) for l in f.get_inner_loops()] if f.get_num_inner_loops() > 0 else []
        faces.append((outer, holes, color_of(f.get_front_material())))
    if faces: leaves.append((path, faces, m))
    for g in ents.get_groups():
        collect(g.get_entities(), mul(m, list(g.get_transform().values)), path + "/" + g.get_name(), leaves)
    for i in ents.get_instances():
        collect(i.get_component_definition().get_entities(), mul(m, list(i.get_transform().values)), path + "/" + i.get_name(), leaves)

def as_box(faces):
    if len(faces) != 6: return None
    pts = [p for vs, hs, c in faces for p in vs]
    lo = [min(p[i] for p in pts) for i in range(3)]; hi = [max(p[i] for p in pts) for i in range(3)]
    for vs, hs, c in faces:
        if len(vs) != 4 or hs: return None
        flat = False
        for i in range(3):
            if max(p[i] for p in vs) - min(p[i] for p in vs) < 1e-6: flat = True
        if not flat: return None
        for p in vs:
            for i in range(3):
                if abs(p[i] - lo[i]) > 1e-6 and abs(p[i] - hi[i]) > 1e-6: return None
    return r3(lo + hi)

def dump_scene():
    cam = model.get_camera(); o = cam.get_orientation()
    leaves = []; collect(model.get_entities(), [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1], "", leaves)
    tubes, prims, items = session_state.get("tubes", {}), session_state.get("prims", {}), []
    for path, faces, m in leaves:
        c, leaf = faces[0][2], path.split("/")[-1]
        if leaf in tubes:
            t = tubes[leaf]
            items.append({"n": path, "c": c, "tube": {"p": [r3(apply(m, p)) for p in t["p"]], "r": t["r"], "n": t["n"]}}); continue
        if leaf in prims:
            p = prims[leaf]; item = {"n": path, "c": c}
            item[p["type"]] = {k: v for k, v in p.items() if k != "type"}; items.append(item); continue
        box = as_box(faces)
        if box: items.append({"n": path, "c": c, "box": box}); continue
        fl = []
        for vs, hs, _ in faces:
            fl.append({"v": [r3(p) for p in vs], "h": [[r3(p) for p in h] for h in hs]} if hs else [r3(p) for p in vs])
        items.append({"n": path, "c": c, "faces": fl})
    return {"units": "inches",
            "camera": {"eye": r3([o[0].x, o[0].y, o[0].z]), "target": r3([o[1].x, o[1].y, o[1].z]),
                       "up": r3([o[2].x, o[2].y, o[2].z]), "fov": cam.get_perspective_frustum_fov()},
            "items": items}
session_state["dump_scene"] = dump_scene
```
Note: if the session expired or `clean: true` was used, `session_state["dump_scene"]` and the `tubes`/`prims` registries are gone: redefine the exporter and re-register the specs of any tube/slab/tray/rbox parts.

## Construction patterns that depend on the SketchUp SDK
- **Recessed fixtures (anything sunk into a slab)**: cut the host slab with `slab_poly_geom` holes (rounded `rounded_rect` holes), put an open `tray_geom` inside inset by ~0.03" so its walls never z-fight with the cut faces, and lower/hollow whatever solid sits below it. Use one material for a rim and the tray it frames, otherwise coplanar faces z-fight visibly.
- **Rounded boxes with a filleted top**: `loft_geom` of `rounded_rect` rings with a quarter-circle fillet at the top (rings at 15°…90°), softened except the cap rings; export as `rbox`.
- **Curved pipes and handles**: `add_tube` paths (straight run, then a semicircular arch built from ~14 points, then down); tiny cylinders (`tube` with 2 stations) work for flanges, bosses and rings.
- **Walls with openings** (not exercised yet, but the exporter supports it): faces with inner loops export as `{"v":..., "h":[...]}` and the viewer triangulates them with the Newell normal's dominant axis dropped.
- Keep every geometry leaf a *leaf group* (no children) if it should be a valid Solid; use parent groups only for organisation.
- **Modelling from a manufacturer datasheet / dimensioned drawing** (the user may paste a PNG): read it into a small table first (overall W/D/H, body depth, door depth, handle protrusion, rear spacers, foot height, split line, handle and logo heights) and convert mm to inches with `MM = 1/25.4`. Build in **world coordinates** inside an identity group so tube paths and `rbox` specs coincide. Drawings often show *two* depth numbers (body vs. body + door + handle): the door is a separate rounded box that protrudes from the body, and gaps between parts are real (a few mm), so leave them. State the interpretation back to the user (what each number was taken to mean, e.g. hinge side is a guess).
- **Patching a few items without re-sending the whole scene**: don't regenerate `scene.json` by hand. Run a small node script that parses it, drops the items whose `n` starts with a path prefix, pushes the new items, and rewrites one item per line:
  ```js
  const s = JSON.parse(fs.readFileSync(f,'utf8')); s.items = s.items.filter(i => !i.n.startsWith(PREFIX)); s.items.push(/* new items */);
  fs.writeFileSync(f, '{"units":"inches","camera":'+JSON.stringify(s.camera)+',"items":[\n'+s.items.map(i=>JSON.stringify(i)).join(',\n')+'\n]}\n');
  ```
  The new items' numbers come from the registries returned by the `build_model` call (return `session_state["prims"]`/`["tubes"]` subsets, not the full scene). Remember to `pop` the old keys from `session_state["prims"]`/`["tubes"]` when you delete or rename a part.

## Textures with the SketchUp API (user pastes a pattern image and says "apply it to X")
**The SketchUp texture API (verified this session):**
- `rep = ImageRep(); rep.set_data(bytes(rgba_list), width, height, 32, 0)` (**data first**; byte order is **RGBA**, not BGRA; last arg is row padding). Then `tex = Texture.from_image_rep(rep)` (one argument), `tex.set_dimensions(tile_w_in, tile_h_in)` (inches covered by one tile), `mat = Material(); mat.set_name(...); mat.set_texture(tex); model.add_materials([mat])`.
- Map a face while building it: `geom.face_set_front_material(face_idx, [(SUPoint2D(u,v), vertex_index), ...up to 4], mat)`. The pairs are **(SUPoint2D, vertex index)** in that order; plain tuples or the reverse order raise confusing errors. Use UV in **tile units** (`x / tile`, `z / tile`), faces with `normal.y < -0.9` are the "front" of a door box.
- `model.remove_materials([mat])` and `model.purge_unused_materials()` exist; probe materials/groups should be deleted when an experiment is done.
- No filesystem in the sandbox, so the image must travel **inside the code**: shrink and quantize it first (PIL on the Mac is available: `python3 -c "import PIL"`), then pack to 2 bits per pixel as hex. Recipe that worked: crop a region free of watermarks, `resize((64,64), LANCZOS)`, `.quantize(colors=4, method=MEDIANCUT, dither=NONE)`, mirror 2x2 (flip/mirror pastes) to make it **seamless** (128x128), `byte = p0 | p1<<2 | p2<<4 | p3<<6` as `'%02x'`, 8192 hex chars; decode in the sandbox with `int(hex[i:i+2], 16)` and `(b >> 2*k) & 3`. Keep the palette tuple list in the code. Run-length encoding does not help on noisy art. Always pad/truncate the hex to the expected length so a copy slip can't break the image size.
- Stock images often carry a watermark: **crop it out** and tell the user.
- Rebuild only the textured leaf (e.g. a door group inside a component definition): erase the old group in the definition, add the new one; every instance updates.

Unverified: how the UV/tile scale renders inside SketchUp itself (only the web preview was looked at). Mirror-tiled patterns show a visible symmetry; use a larger crop if that matters.
