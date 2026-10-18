---
name: import-floor-plan
description: Use when the user wants to model a real flat, house or room from its floor plan, technical drawings, photos or hand-made measurements, or to keep refining the walls of an existing project. Runs an open-ended loop (drawing, then room by room, then photos) that the user ends when they are happy.
---

# Import a floor plan (refine the walls until the user says stop)

The goal is a generator script whose walls match the real place. The user decides when it is done: never declare it finished, never stop proposing the next step. Reply in the user's language; repo files stay English except the user's project data.

## Ground rules
- **Never invent silently.** Every number in the generator carries a tag: `// measured` (tape or printed dimension) or `// estimate` (read off a picture or guessed). At the end of every round list the estimates still open.
- **One change at a time**, and say what moved: "Bedroom width 392 -> 400 (measured)". Never "fix" a measured number to make another one fit; ask.
- **Clear (interior) measures** between finished wall faces are what people measure by hand. Ask once whether a number is interior or exterior; wall thicknesses are separate numbers.
- **Coordinates**: cm, x right, y up in plan, z up; origin at an inner corner of the first room; keep it fixed for the whole project.
- Use `kit.wall(name, color, [x0, y0, x1, y1], height, openings)` from `scripts/scene-kit.js` (opening = `{from, to, sill, head}` along the wall's long side; a door is `{from, to, head: 210}`, a window adds `sill`). Keep a table of rooms / walls / openings at the top of the script so each measure lives in one place.
- Walls to be demolished are named `..._Removed` (they join the "Removed elements" group, hidden by default). Furniture is not part of this skill (`add-furniture`).
- Doors need lintels (`head` < wall height) so the Plan sheet can close the rooms; an arch or curved opening is a `mesh` item and is ignored by the Plan sheet (tell the user).

## Start
Find or create the project: `projects/<id>/` with a generator (`project.json` `generator`). If it does not exist, run the `bootstrap-new-project` skill first (empty room), then come back.
Then say, in your own words: "Share the technical drawing first if you have it (even a photo or a screenshot). Then we go room by room with your hand-made measures. In the end you share photos so we can check the result. You decide when we are done."

## Phase 1: the technical drawing (skip if there is none)
1. Ask for the image(s). Ask for **one printed dimension** (or a known size such as a door) to get the scale; say how reliable it is (about 3% from pixels) and that everything read from the drawing is an `estimate` until the user confirms it by hand.
2. Read it into a short table, and show it back: overall outline, each room's name and clear size, wall thicknesses (thick = bearing, thin = partition), every door and window (width, which wall, distance from a corner), niches, columns, chimney breasts. Name what you took each number to mean and what is a guess (hinge side, hidden thicknesses) and wait for a correction before coding.
3. Write the walls with `kit.wall`, add the rooms to `project.json` `rooms` (name + a point inside, cm), run the generator, then `node scripts/plan-report.mjs <id>`. Open rooms or fewer rooms than expected mean a gap in a wall or a missing lintel: fix before going on.
4. Show the result: headless screenshot of `/<id>/?view=Top` and of the Plan sheet (see "Testing the viewer headlessly" in `CLAUDE.md`), or ask the user to look at `http://localhost:4173/<id>/`.

## Phase 2: room by room with hand-made measures
Pick the room the user prefers (default: the biggest). For each room ask, a few at a time:
- clear **width x depth**, and a **diagonal** if the room might not be a rectangle (two equal diagonals confirm a rectangle);
- **ceiling height**;
- **wall thicknesses** (the reveal of a door or window shows it);
- **doors**: width, height, distance from the nearest corner; **windows**: width, sill and head heights, distance from a corner;
- niches, columns, boilers, radiators, meter cupboards, slanted walls (two points on the slant).
After each room: update the table, regenerate, run `node scripts/plan-report.mjs <id>` and compare each room's sides with what the user measured. Report differences above 1 cm in a small table (user value, model value). A room that cannot match means the neighbouring wall thickness or the origin is wrong, not "round it". Mark the room's numbers `// measured`.
Keep going room by room until the user says that is all the measuring they will do.

## Phase 3: validate with photos
Ask for photos (listing photos are fine). For each one, in this order:
1. Say where the camera must be and which way it looks, and check handedness (looking south, left is east; looking west, left is south): a left/right slip once put a radiator on the wrong wall.
2. Get px/cm from something the user measured **in the same plane** (a door opening, a niche); never compare objects at different depths.
3. Wide-angle pictures mislead: treat mismatches around 15% as perspective and change the model only for clear contradictions (a missing feature, an element on the wrong wall).
4. Render the same viewpoint to compare: `/<id>/?cam=ex,ey,ez,tx,ty,tz,fov` (inches) beats guessing.
Report "photo N: consistent / contradicts X" and propose the fix, never apply a photo-derived change to a measured number without asking.

## The loop
After every round ask what is next: another room, more photos, a correction, or "done". Offer to run `check-and-publish` when the user is happy. When the user says done: `npm test`, `npm run thumbs` (new picture for the project card), give the final list of what is measured and what is still an estimate, and propose the commit; do not commit or push without asking.
