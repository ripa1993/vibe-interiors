---
name: bootstrap-new-project
description: Use when someone wants to try this repo with their own model, start a new project, set up a new projects/<name> folder, or asks how to get started. Asks a few basic questions, creates the folder with a working generator, and shows it in the viewer.
---

# Bootstrap a new project

Set up `projects/<id>/` so the person sees their own (empty) room in the viewer within a few minutes, then hand over to the right next step. Reply in the user's language; everything written into the repo stays in English except the user's own project data (labels, room names), which may be in any language.

## 0. Pre-flight (do it, don't interrogate)
- `node -v` (needs a recent Node, 20+) and whether `node_modules/` exists. If not, ask before running `npm install`.
- Chrome for thumbnails and the browser tests: `node -e "console.log(require('./scripts/projects').findChrome() || 'none')"`. If none, say it's optional (thumbnails then need `CHROME_PATH` or are skipped) and go on.
- Is the SketchUp MCP connected (`mcp__sketchup__*` tools available)? Remember the answer for question 6.

## 1. Questions: ONE at a time, short, with a default
Use the question tool when you have one, otherwise plain text. Skip what the user already told you.
1. **Folder name** (`projects/<id>`): lowercase, digits, `-` and `_`, starting with a letter or digit (the repo rejects anything else). Default: ask them to describe the place and propose one.
2. **Title and one-line description** (shown on the project list card). Default: the title-cased id, no description.
3. **What is it**: a single room, a flat/house with several rooms, or something else (shop, studio...). This decides the starting point.
4. **Starting point**:
   - *Empty room from its sizes*: ask interior width x depth x height in cm (rough values are fine, they are tagged `estimate`). Default.
   - *From a floor plan or drawings*: create the empty room first, then continue with the `import-floor-plan` skill.
   - *Copy of `camera-test`*: a furnished example to play with.
5. **Language of their data** (room names, group labels): any; the repo's own UI and docs stay English.
6. **How to model**: the generator script (default: free, no SketchUp needed, the model exists only in the viewer) or the SketchUp MCP (only if connected: read `docs/sketchup.md` and follow it, the project folder then holds just `scene.json`).

## 2. Create the project
Generator route (default):
1. `mkdir -p projects/<id>` and copy `.claude/skills/bootstrap-new-project/room-template.js` to `projects/<id>/room.js`, replacing `__TITLE__`, `__ID__`, `__W__`, `__D__`, `__H__` (for a copy of `camera-test`: copy `room.js` and `project.json` from it instead and adapt the names).
2. `projects/<id>/project.json`: `{"title": "...", "description": "...", "generator": "room.js", "rooms": [{"name": "<room name>", "at": [W/2, D/2]}]}` (cm; `rooms` names the room on the Plan sheet).
3. `node projects/<id>/room.js` writes `scene.json`.
4. Check it: `node scripts/plan-report.mjs <id>` must list one room with the sizes the user gave.
5. Start the viewer if it is not running: `node server.js 4173` in the background (see "Run / stop" in `CLAUDE.md`), and give `http://localhost:4173/<id>/`. Offer a headless screenshot (see "Testing the viewer headlessly" in `CLAUDE.md`) if the user cannot open a browser.
6. `npm test` must stay green (it also checks that `scene.json` equals what the generator writes).

## 3. Hand over
Tell the user, briefly:
- where the numbers live (the table at the top of `room.js`) and that re-running the script refreshes the viewer by itself;
- the toolbar basics: camera icon (views), gear (dims, units, click to measure, AO), Plan (printable measures), Groups (bottom-left);
- the next step: `import-floor-plan` to model the real place, `add-furniture` to furnish it, `check-and-publish` before committing.
- Do NOT commit or push; ask first. New project folders need `npm run thumbs` once to get a card picture (run it when the user is happy with the first view).
