# skp-watch

Local live preview for models built in SketchUp through the SketchUp MCP (`mcp__sketchup__*`).
A small Node server watches a scene file (`projects/<name>/scene.json`); a three.js page in the browser redraws it whenever the file changes.
The viewer (`server.js`, `public/`) doesn't depend on a particular model. Each model lives in its own folder under `projects/`; a `scene.json` from a previous session is not ground truth, overwrite it.

## Keep this file up to date (self-documentation)
While drawing new items, **add what you learn to this file as you go**, not at the end of the session. Do it right after the discovery, in the same turn if possible, so it isn't lost when the context ends.

Add an entry when:
- an SDK call, parameter or behaviour surprised you (an error, a missing method, a silent failure) and you found the fix or workaround;
- you built a new kind of geometry (a shape, a joint, an opening, a pattern) and found a construction that works (or one that doesn't);
- you added a viewer feature, a scene.json type, or a helper function;
- the user states a preference or corrects your approach.

How:
- Put it in the matching section: SDK gotchas under "SketchUp MCP: facts and gotchas", reusable construction under "Design patterns that worked", code under "Python helpers", viewer changes under "Viewer implementation notes" and the schema table, preferences under "User preferences". Create a section if none fits.
- Write the **rule plus the reason** in one or two lines, with a short code snippet only when it saves re-deriving something. Mark things you did not verify as unverified.
- If a helper is added or changed, update the code block here so the next session can copy it as is. Update the "Ideas not done yet" list (remove what's done).
- If an older entry turns out wrong, fix or delete it, don't just add a contradicting one.

What not to write:
- Anything specific to the model being drawn (its name, rooms, dimensions, layout, colours, object names). Keep entries generic: describe the technique, not the object. Use neutral example names (`Unit_A`, `Slab_A`).
- Things already obvious from the code or from `git`-style history, or one-off state of the current session (URLs, save counts, temporary files).

Tell the user in one short line when you add something ("Annotato in CLAUDE.md: ..."), so they can veto it.

## User preferences
- Writes in Italian: answer in Italian.
- Thinks in metric (cm / m), but the SketchUp API is **inches only**. Convert when quoting sizes (1 in = 2.54 cm); the viewer already shows cm by default.
- Wants a free, local, auto-refreshing way to look at the model. This project is that solution (see "Why this exists").
- Likes to see results: after a change, push the scene and verify with a screenshot before reporting.
- Appreciates being told clearly what was verified and what was not (e.g. "checked in the preview, not reopened in SketchUp").
- Don't save a new `.skp` unless asked (see "Saves").

## Layout
```
skp-watch/
  server.js          static server + SSE; watches the scene file's directory and pushes "reload" events
  public/index.html  the viewer (three.js via importmap, served from node_modules/three)
  projects/<name>/   one folder per model: scene.json (what the viewer draws) and, when SketchUp is not available, a generator script (see the fallback below)
  package.json, node_modules/three
  server.log         output of the background server (git-ignored)
```
Current model: `projects/casa-costanza/` (`house.js` generates its `scene.json`).

### Run / stop
```bash
cd ~/skp-watch && (nohup node server.js projects/casa-costanza/scene.json 4173 > server.log 2>&1 &)   # http://localhost:4173
pgrep -f "node server.js"            # is it running?
pkill -f "node server.js"            # stop (do this before restarting after editing server.js)
open http://localhost:4173
```
- Editing `public/index.html` needs only a browser refresh (Cmd+R). Editing `server.js` needs a restart.
- The server stops when the Mac restarts. It watches the **directory** (editors/writers replace files), debounced 150 ms.
- Routes: `/` page, `/scene.json`, `/events` (SSE), `/three/*` (three.js), `/favicon.ico` (204).
- The page uses only RELATIVE URLs (`scene.json`, `events`, `./three/...`, `textures/...`), so the same `public/index.html` also works from a static host under any subpath. `npm run build` (`scripts/build-static.js`) writes `dist/` for Cloudflare Pages: sets `window.STATIC_BUILD` (no EventSource), copies the scene, textures and the three.js modules it needs, adds `noindex` headers. Keep new asset URLs in scenes relative (`textures/x.png`, not `/textures/x.png`).

## Workflow for every model change
1. Change the model with `mcp__sketchup__build_model`.
2. Export the live model: call `session_state["dump_scene"]()` inside `build_model` and return it in `result` (code below).
3. `Write` the JSON to `~/skp-watch/projects/<name>/scene.json` (valid JSON, a single object). The page reloads itself in about a second and keeps the user's orbit angle.
4. Verify with a headless screenshot (see "Testing") and read the PNG.
5. Only call `save_model` when the user asks for a `.skp`.

**Fallback when `mcp__sketchup__*` is not connected** (it can fail silently: ToolSearch finds nothing): write the scene with a parametric Node script (`projects/<name>/house.js`: dimensions in cm in a table, `defGroup(id, label, cat, [variant])` + `group(id, () => {...})` to tag whatever is drawn inside as a switchable group, `box`/`slab`/`tube`/`faces` helpers, converts to inches, writes `scene.json`). Walls with openings = boxes (segments + lintel + sill); only curved lintels (arch) need a hand-made `faces` mesh (quads between the arch polyline and the top edge, plus the intrados). The result exists only in the viewer, not in SketchUp: say so.

Cost tip: the whole scene goes through Claude's output twice (tool result, then Write). Keep it small: boxes as `box`, curved things as parametric primitives (`tube`, `slab`, `tray`, `rbox`), never as thousands of triangles. Round numbers to 3 decimals.

## scene.json schema
```jsonc
{ "units": "inches",
  "camera": {"eye":[x,y,z], "target":[x,y,z], "up":[x,y,z], "fov":35},   // applied on FIRST load only; "up" is ignored (always Z up)
  "groups": [ {"id":"cucina-v1", "label":"Cucina v1", "cat":"Cucina", "variant":"cucina"} ],   // optional: switchable groups, see below
  "items": [ {"n":"/Group/Sub/Leaf", "c":[r,g,b,a], "g":"cucina-v1", <exactly one geometry key>} ] }
```
Z is up (same as SketchUp). `n` is the group path (the tooltip shows the last two parts). `c` is the colour 0-255.

| key | meaning |
|---|---|
| `box: [x0,y0,z0,x1,y1,z1]` | axis-aligned box; optional `tex: {url, tile, face}` puts a repeating image on one face (see "Textures / patterns") |
| `faces: [ [[x,y,z],...], {"v":[outer], "h":[[hole],...]} ]` | generic mesh. Plain faces are fan-triangulated (**convex only**). Faces with holes are projected to 2D and triangulated |
| `tube: {p:[[x,y,z],...], r:[...], n}` | circular section along a path, per-station radius, smooth normals, flat end caps (pipes, faucets, handles, drains) |
| `slab: {o:[[x,y]...], h:[[[x,y]...],...], z:[z0,z1]}` | flat slab with polygon holes, extruded along +Z (worktops, floors with openings); optional item-level `tex: {url, tile}` repeats an image on the top/bottom caps in WORLD x,y (tile = inches per repeat), sides stay `c`: used for a wood floor |
| `tray: {o:[[x,y]...], z:[zFloor,zTop]}` | open-top tray, smooth inward walls + flat floor (sinks, basins, bowls with a rounded-rectangle plan) |
| `rbox: {b:[x0,y0,z0,x1,y1,z1], r, top, bot}` | rounded box: plan corner radius `r`, filleted top edge radius `top`, optional filleted bottom edge `bot` (default 0). Retro appliances, doors |

`loft` is emitted by the exporter if a prim has `type: "loft"`, but **the viewer has no loft handler** (use `rbox`, or add one to `geometryFor`).
Outlines are `EdgesGeometry` with a 20° threshold; materials are `MeshStandardMaterial`, double-sided, alpha < 255 makes them transparent.

## Viewer features (public/index.html)
- **Camera presets** (buttons, keys 1-9): Saved (file camera), Iso, Iso 2, Front, Back, Left, Right, Top, Interior (66" eye height from near the min corner, fov 60). They are computed from the bounding box, so they follow the geometry. The active preset is highlighted in blue.
- **The view survives a refresh through the URL**: a preset click writes `?view=<name>` (e.g. `?view=Iso+2`); any orbit/zoom writes `?cam=ex,ey,ez,tx,ty,tz,fov` (and clears `view`). On first load `?cam` wins, then `?view`, then the camera saved in `scene.json`. Scene reloads (file changes) never touch the camera. `history.replaceState` is used, so no history entries pile up. Open `http://localhost:4173/?view=Top` to start in a given view.
- **Zoom** `+` / `−` buttons and keys (dolly toward the orbit target; clamped 5…4000 in).
- **Keyboard fly**: `W/A/S/D` or arrow keys move camera+orbit target together on the floor plane (forward = view direction projected on XY), `Q`/`E` down/up, `Shift` = 3x faster (160 in/s base); the URL `?cam` is saved on key release. Dims therefore moved to key `M`.
- **Dims** (key `M`): overall W/D/H of the whole model as dimension lines; **click an object** to dimension just that object (click again to clear); **hover** tooltip with name + size. **Unit button** (key `U`) cycles cm / in / m.
- **Prima persona** button (key `F`, `Esc` exits; `?fp=1` starts in it): walk through the house at 66" eye height, fov 70. `W/A/S/D` or arrows move/strafe (80"/s, Shift 240"/s), `Q/E` turn left/right, click on the canvas to start mouse-look (pointer lock, no button held), click again to stop (pitch limited; Esc releases the lock). Spawn = `spawn: {p:[x,y], yaw}` in `scene.json` (inches, yaw degrees from +X ccw; `house.js` puts it just inside the entrance door, facing east); without it, near the min corner looking at the centre. Collision = circle (6") against `box`/`rbox`/`slab` items with z between 8" and 62" (built with the meshes, so hidden groups / `Rimosso` items don't block), axis-separated sliding; if the start is already inside something you can walk out. Exiting restores the orbit camera. **Pitfall**: `OrbitControls.update()` still re-aims the camera at its target when `enabled=false`, so the render loop skips it in FPV. `window.fpState()` exposes `{x,y,yaw,pitch}` for headless tests (load takes ~8 s under swiftshader, wait for the status line before reading it).
- **Gruppi** button (key `G`, shown only when the scene has groups): a panel with one checkbox per group, listed by category; **everything is off by default**, except groups with `"on": true` in `scene.json` `groups` (the generator's `DEFAULT_ON` list in `house.js`), applied on first load only when the URL has no `?g`. An item with `"g": "id"` (or a list of ids) is drawn only when one of its groups is on; items without `g` are always drawn. Groups sharing the same `variant` are mutually exclusive (turning one on turns the other off), others are independent. "Accendi tutto" picks the first group of each variant set. The enabled ids live in the URL (`?g=id1,id2`), so a refresh keeps them. Ids used by items but missing from `groups` appear under "Altro". Each category title is a collapsible header (`›` closed / `v` open, click to toggle; closed headers show how many of their groups are on; the state is kept in `localStorage`, not in the URL). Off groups aren't built (hover, dims and click ignore them), like `Rimosso` items; the status line still counts all items.
- **Rimossi** button (key `R`): items whose name contains `Rimosso` (walls to be demolished) are hidden by default ("after the works" state); the button shows them again, highlighted in orange. Name demolition candidates `..._Rimosso` and colour them differently in the scene. The toggle isn't kept in the URL.
- Live status dot (green = SSE connected) + object count + last-reload time.
- Reloads rebuild the meshes but keep the orbit camera, the selection and the dimensions.

## Testing the viewer headlessly (what worked)
`playwright-core` is **not** installed in the project (it was installed in a throwaway scratchpad). Install where needed: `npm i playwright-core`. Use the installed Chrome, with software GL:
```js
const { chromium } = require('playwright-core');
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1300, height: 820 }, deviceScaleFactor: 2 });   // 2x for detail
p.on('pageerror', e => console.log('page error:', e.message));
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.click('#views button:text-is("Iso 2")');           // presets, #zin / #zout, #dims, #unit are all clickable
await p.screenshot({ path: 'shot.png', clip: { x:150, y:100, width:1000, height:640 } });   // clip to zoom on an area
```
Then `Read` the PNG. Write scripts and images to the session scratchpad directory, not the project. The built-in browser tools (`mcp__Claude_Browser__*`) were **not** available in the CLI session.

## Why this exists (research already done, don't redo)
- No free viewer found that auto-refreshes a `.skp`. SketchUp Viewer for Desktop was discontinued on 2025-04-22.
- Innerscene web viewer (innerscene.com/tools/skp-viewer) opens `.skp` in the browser (parses locally), and can be driven with Playwright (`input[type=file]`, first one), but it rendered every colour as grey-white and ignored the saved camera. The desktop app `Innerscene 3D Viewer.app` did not reload as the user expected ("not working as expected").
- Parsing `.skp` outside SketchUp is the weak point; exporting the live model through the MCP (this project) avoids it and gives exact geometry, colours and camera.

## SketchUp MCP: facts and gotchas
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

## Design patterns that worked (reusable)
- **Recessed fixtures (anything sunk into a slab)**: cut the host slab with `slab_poly_geom` holes (rounded `rounded_rect` holes), put an open `tray_geom` inside inset by ~0.03" so its walls never z-fight with the cut faces, and lower/hollow whatever solid sits below it. Use one material for a rim and the tray it frames, otherwise coplanar faces z-fight visibly.
- **Rounded boxes with a filleted top**: `loft_geom` of `rounded_rect` rings with a quarter-circle fillet at the top (rings at 15°…90°), softened except the cap rings; export as `rbox`.
- **Curved pipes and handles**: `add_tube` paths (straight run, then a semicircular arch built from ~14 points, then down); tiny cylinders (`tube` with 2 stations) work for flanges, bosses and rings.
- **Walls with openings** (not exercised yet, but the exporter supports it): faces with inner loops export as `{"v":..., "h":[...]}` and the viewer triangulates them with the Newell normal's dominant axis dropped.
- Keep every geometry leaf a *leaf group* (no children) if it should be a valid Solid; use parent groups only for organisation.
- **Validating a model against the user's photos** (listing photos, wide-angle): (1) say where the camera is and which way it looks, then check handedness (looking south, left = east; looking west, left = south), a left/right slip once put a radiator on the wrong side of a door; (2) get px/cm from something the user measured in the same plane (a door luce, a niche width) and don't compare objects at different depths; (3) wide-angle views at different depths mislead, so treat small mismatches (~15%) as perspective and only change the model for clear contradictions (a missing feature, an element on the wrong wall); (4) a render from the same viewpoint (`?cam=ex,ey,ez,tx,ty,tz,fov` in inches) beats guessing; (5) the user marks future demolitions: name them `..._Rimosso` so the Rimossi toggle hides them.
- **Furniture variants as switchable groups** (script-generated models): one module per variant (`projects/<name>/cucina-v1.js`, exporting `function ({ box, tube, rbox, group, n })`), required by the generator, with everything drawn inside `group('<id>', () => {...})` and declared with `defGroup(id, label, cat, 'variant')` (same `variant` = mutually exclusive). Design the variant for the *final* state of the walls and say so (it overlaps items named `Rimosso` when those are shown). Useful primitives: `rbox` for worktops/shades (rounded), `tube(..., seg)` with `seg` 14-20 for round stools/jars/globes, thin boxes for slats and door fronts, handles as 0.8 cm tubes 1-2 cm off the face.
- **Generator tricks that paid off while furnishing**: (1) pieces that need a rotation (45° corner sink, rotated appliance) = `slab` polygons in plan (the viewer has no rotation; `slab` takes any CCW polygon + a z range), tubes just rotate their path; (2) to swap or move whole blocks of a module wrap its helpers with a y-shift (`let SHY`, `box = (...) => _box(..y0+SHY..)`) instead of renumbering coordinates; (3) after each furniture change run a numeric check from `scene.json` (item bounding boxes vs. walls and vs. each other, clear space in front of doors/appliances, widths of aisles) and render from the user's viewpoint (`?g=<group>&cam=...`): it caught a fridge whose door could not open and overlaps of 1 cm; (4) keep removed-but-maybe-later pieces in their own module (`elettrodomestici-extra.js`) with re-enable instructions in the header.
- Openings in thick walls with boxes: segments + lintel + sill, plus a 4 cm "false jamb" (two posts + head) when the user wants doors drawn without leaves; niches = a full-height wall box behind (e.g. 7 cm left of the wall) + side/lintel boxes, window set back inside it; sloped walls get split into several `slab` polygons (a recess = a slice with its inner edge offset).

- **Sanitary fixtures in the script generator** (`wc-grande.js`): furnish *on top of the existing plumbing connections* (`attacchi-*` groups): put each fixture's centre on its connection's coordinate and check the footprint covers the floor drain. `slab(n,c,poly,z0,z1,holes)` (now accepts holes) + `tray(n,c,poly,zFloor,zTop)` helpers in `house.js` give recessed basins/bowls (rounded-rect `rr()` polygons, tray inset 0.2 cm from the hole, thick ceramic top so the tray floor stays above the slab bottom). A fixture whose centre is < half its width from a wall needs a recess (window niche) or a narrower rear body, check with a numeric box-overlap script against the wall boxes. Shower = low tray + thin transparent boxes (alpha 70) + chrome rail; washing machine = `rbox` + 2-station `tube` along X for the porthole.
- **Fixtures against a sloped (oblique) wall** (`wc-piccolo.js`): the viewer can't rotate boxes, so build the fixture in a local frame (u along the wall, v from the wall) and map the rounded-rect polygons to world x,y (`slab` + `tray`; the map flips handedness, so reverse the point list to stay CCW). Put the local origin so the existing drain lies on the fixture's centre line, then push the fixture 0.8 cm off the wall and verify with `max(y - L(x))` over the polygon vertices (<= 0). Shared plant/pot/print helpers live in `decor.js`.
- **Reusing a furniture module in another room / orientation**: call the existing module with wrapped helpers instead of copying it: `box/rbox/tube` mapped through `X' = a - X, Y' = b - Y` (a 180° turn keeps handedness; mirrors flip it), min/max re-sorted for `box` and `rbox.b`, `group: (id, fn) => fn()` so everything lands in the caller's group, and rename the item prefix. Shelving in a niche of an oblique wall: shelves as parallelogram `slab`s (vertical sides flush with the niche sides, front/back parallel to the wall), books as axis-aligned boxes whose back follows `L(x)` (gap < 1 cm per book), large objects (baskets, towels, flat books) as `slab`s in the local (u along wall, v into room) frame.
- **Cheap decor in the script generator**: potted plant = conical 2-station `tube` pot + ~8 leaf `tube`s with 3 stations and radii `[0.3, 2.6, 0.2]` fanned out (keep horizontal reach small near walls/glass); wall print = 4 frame bars + mat + background boxes + a 2-station `tube` along the wall normal as a disc, with a `yw`/direction parameter so it works on any wall; folded towel = thin box 3-4 cm in front of a radiator. Numeric overlap checks flag false positives for tubes along the wall normal (the radius is added to every axis).
- **Modelling from a manufacturer datasheet / dimensioned drawing** (the user may paste a PNG): read it into a small table first (overall W/D/H, body depth, door depth, handle protrusion, rear spacers, foot height, split line, handle and logo heights) and convert mm to inches with `MM = 1/25.4`. Build in **world coordinates** inside an identity group so tube paths and `rbox` specs coincide. Drawings often show *two* depth numbers (body vs. body + door + handle): the door is a separate rounded box that protrudes from the body, and gaps between parts are real (a few mm), so leave them. State the interpretation back to the user (what each number was taken to mean, e.g. hinge side is a guess).
- **Rounded door pair**: upper door `top` fillet, lower door `bot` fillet (`rbox` with `bot`), both with the same plan radius; the cabinet behind is a plain `rbox` with a small radius; leave the doors overlapping the cabinet by ~0.4" so no seam shows from the side.
- **Patching a few items without re-sending the whole scene**: don't regenerate `scene.json` by hand. Run a small node script that parses it, drops the items whose `n` starts with a path prefix, pushes the new items, and rewrites one item per line:
  ```js
  const s = JSON.parse(fs.readFileSync(f,'utf8')); s.items = s.items.filter(i => !i.n.startsWith(PREFIX)); s.items.push(/* new items */);
  fs.writeFileSync(f, '{"units":"inches","camera":'+JSON.stringify(s.camera)+',"items":[\n'+s.items.map(i=>JSON.stringify(i)).join(',\n')+'\n]}\n');
  ```
  The new items' numbers come from the registries returned by the `build_model` call (return `session_state["prims"]`/`["tubes"]` subsets, not the full scene). Remember to `pop` the old keys from `session_state["prims"]`/`["tubes"]` when you delete or rename a part.

### Textures / patterns (user pastes a pattern image and says "apply it to X")
**The SketchUp texture API (verified this session):**
- `rep = ImageRep(); rep.set_data(bytes(rgba_list), width, height, 32, 0)` (**data first**; byte order is **RGBA**, not BGRA; last arg is row padding). Then `tex = Texture.from_image_rep(rep)` (one argument), `tex.set_dimensions(tile_w_in, tile_h_in)` (inches covered by one tile), `mat = Material(); mat.set_name(...); mat.set_texture(tex); model.add_materials([mat])`.
- Map a face while building it: `geom.face_set_front_material(face_idx, [(SUPoint2D(u,v), vertex_index), ...up to 4], mat)`. The pairs are **(SUPoint2D, vertex index)** in that order; plain tuples or the reverse order raise confusing errors. Use UV in **tile units** (`x / tile`, `z / tile`), faces with `normal.y < -0.9` are the "front" of a door box.
- `model.remove_materials([mat])` and `model.purge_unused_materials()` exist; probe materials/groups should be deleted when an experiment is done.
- No filesystem in the sandbox, so the image must travel **inside the code**: shrink and quantize it first (PIL on the Mac is available: `python3 -c "import PIL"`), then pack to 2 bits per pixel as hex. Recipe that worked: crop a region free of watermarks, `resize((64,64), LANCZOS)`, `.quantize(colors=4, method=MEDIANCUT, dither=NONE)`, mirror 2x2 (flip/mirror pastes) to make it **seamless** (128x128), `byte = p0 | p1<<2 | p2<<4 | p3<<6` as `'%02x'`, 8192 hex chars; decode in the sandbox with `int(hex[i:i+2], 16)` and `(b >> 2*k) & 3`. Keep the palette tuple list in the code. Run-length encoding does not help on noisy art. Always pad/truncate the hex to the expected length so a copy slip can't break the image size.
- Stock images often carry a watermark: **crop it out** and tell the user.
- Rebuild only the textured leaf (e.g. a door group inside a component definition): erase the old group in the definition, add the new one; every instance updates.

**Viewer side:** the full-resolution tile goes in `public/textures/<name>.png` (served at `/textures/<name>.png`; build the seamless mirrored version with PIL too). In `scene.json` add `"tex": {"url":"/textures/x.png","tile":36,"face":"-y"}` to a **`box`** item: that face gets the texture repeated every `tile` inches, the other faces use `c` as plain colour (set `c` to the edge colour). Boxes (one face) and slabs (top/bottom caps, world x,y) support `tex`. The exporter doesn't emit `tex` yet: after exporting, add it with the node patch below (match on the leaf name), and keep `session_state["tex"][leaf] = {...}` as the record of what was textured.
```js
for (const i of s.items) if (i.n.endsWith('/Door_Front')) { i.c = [edge r,g,b,255]; i.tex = {url:'/textures/x.png', tile:36, face:'-y'}; }
```
Unverified: how the UV/tile scale renders inside SketchUp itself (only the web preview was looked at). Mirror-tiled patterns show a visible symmetry; use a larger crop if that matters.

## Viewer implementation notes / pitfalls found
- `slab` **requires `h`** (use `h: []` when there are no holes): without it `slabGeometry` throws and the whole scene silently stays on "waiting for valid scene.json…". `load()` now logs the real exception with `console.error('scene load failed:', e)`, so run the headless script and read the console first.
- Scene is Z-up: `THREE.Object3D.DEFAULT_UP.set(0,0,1)` and `camera.up.set(0,0,1)`. **Never set `camera.up` from the file** (SketchUp's saved up-vector has roll; OrbitControls then tilts the model as soon as you orbit). `applyCamera` and all presets force `(0,0,1)`.
- `load` is reassigned to refresh dimensions/selection after each reload; labels are DOM elements projected every frame and hidden when off-screen/behind the camera; the toolbar has `z-index: 5`.
- Lighting that looked right: `HemisphereLight(0xffffff, 0xb4b8c0, 2.4)` + `DirectionalLight(0xffffff, 2.2)` with `shadow.bias=-0.0005`, `shadow.normalBias=0.6` (without them the surfaces show a moiré of shadow acne).
- Colours: `new THREE.Color(r/255, g/255, b/255).convertSRGBToLinear()`.
- The Interior preset and `Top` preset use a tiny offset for Top (`[0,-0.001,1]`) to avoid the Z-up gimbal degeneracy.

## Ideas not done yet
- A `loft` handler in the viewer; `rbox`-style primitives for other rounded shapes.
- "Interior clear size" annotation and a two-point measure tool.
- Auto-orbit/turntable, scene tabs (several saved views), exporting the preview as PNG from the page.
- A watcher that downloads the `.skp` after `save_model` and opens it in a viewer (not needed so far).
