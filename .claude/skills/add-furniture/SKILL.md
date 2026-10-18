---
name: add-furniture
description: Use when the user wants to add a piece of furniture, an appliance, a light or a layout variant to a project, from a datasheet, a dimensioned drawing, a photo or plain measures. Models it as a switchable group so variants can be compared in the viewer.
---

# Add furniture or a variant as a switchable group

Everything the user can switch on and off in the viewer's **Groups** panel is a group. Furniture and variants always live in groups; the fixed shell (walls, floor) never does. Reply in the user's language; repo files stay English except the user's project data.

## 1. Understand what to add
Ask only what is missing, one question at a time:
- which project and which room (and where in it: against which wall, how far from a corner);
- what it is and its overall size (W x D x H in cm); if the user has a **datasheet or dimensioned drawing** (they may paste a PNG), read it into a small table first: overall W/D/H, body depth, door depth, handle protrusion, rear spacers, foot height, split lines. Drawings often give two depths (body, and body + door + handle): the door is a separate part that sticks out. Convert mm to cm. Say back what each number was taken to mean and what is a guess (hinge side, colours) and wait for a correction;
- is it **a new piece** or **an alternative to an existing one** (a variant: only one of them can be on at a time).

## 2. Check the space before drawing
- Run `node scripts/plan-report.mjs <id>`: is the wall long enough, is the clear room size what you assumed?
- Look at neighbours: other groups on the same wall, door swings, radiators, windows. After coding, run a numeric overlap check of the new boxes against the wall boxes and against the other items and report overlaps above 1 cm and any blocked clearance (door that cannot open, aisle under 60 cm).

## 3. Model it
In the project's generator (`project.json` `generator`), using `scripts/scene-kit.js`:
```js
kit.defGroup('wardrobe-v2', 'Wardrobe v2: 2 x 100 cm with mirrored doors', 'Bedroom', 'wardrobe');   // id, label, category, [variant]
kit.group('wardrobe-v2', () => {
  box('/Room/Wardrobe_v2/Body', WHITE, x0, y0, 0, x1, y1, 240);
  // ...
});
```
- **Variants**: groups sharing the same last argument (`'wardrobe'`) exclude each other; independent pieces have none. List the ids that should start switched on in `createScene({ defaultOn: [...] })`.
- **Unique leaf names** (`/Room/Wardrobe_v2/Body`, not `/Body`): the viewer, hover and dimensions use them.
- **Shapes**: `box` for anything axis-aligned (shelves, doors as thin boxes with a 0.5 cm gap, handles as boxes or 0.8 cm `tube`s 1-2 cm off the face); `rbox` for rounded worktops, shades, appliance bodies; `tube` (14-20 segments for round stools and jars) for legs and handles; `slab` for any polygon in plan (a rotated or corner piece), `tray` for basins. The viewer cannot rotate a box: rotate in plan with `slab`, or map your own local frame.
- A new variant of a module = copy the base module, rename the group id and the item prefix, change only the block that differs (transplant a block from another variant with the same coordinates). Several modules can share a file; large ones get their own file required by the generator.
- **Lights** (a pendant, a spot): `kit.light({ p: [x, y, z], i: ..., sh: 1, g: '<group id>' })` just below the lamp, and mark the shade `em: 1` on the item if it should glow at night; a lamp without a `light` entry only looks like one.
- Estimates (colours, hidden thicknesses) get an `// estimate` comment, measured values `// measured`.

## 4. Verify and show
1. Regenerate (`node projects/<id>/<generator>.js`) and run `npm test` (also checks that `scene.json` equals the generator's output).
2. Show it: headless screenshot of `/<id>/?g=<group ids>&cam=...` or ask the user to open `/<id>/` and tick the group; compare variants side by side when there are several.
3. Ask what is next: adjust it, add the alternative, move on. Do not commit or push without asking; `check-and-publish` does that cleanly.
