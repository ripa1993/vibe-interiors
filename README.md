# vibe-interiors

An interior design experiment made with Claude Code: a local, auto-refreshing 3D preview for building models, and the models themselves.

A small Node server watches the `projects/<name>/scene.json` files; when you open a project, a three.js page in the browser redraws the scene every time its file changes, keeping your camera. A model is a plain `scene.json`, usually written by a generator script (see [Getting started](#getting-started)); it can also come from other tools, SketchUp included (see [Working with SketchUp files](#working-with-sketchup-skp-files)).

## Getting started

You need Node.js 20+ and a modern browser. [Claude Code](https://claude.com/claude-code) is optional but recommended: the repo ships skills that walk you through the whole process. Chrome is only needed for the thumbnails and the browser tests.

**1. Run the viewer**

```bash
git clone <this repo> && cd vibe-interiors
npm install
node server.js 4173        # then open http://localhost:4173
```

You land on the project list, with two examples: `camera-test` (a minimal bedroom, the easiest one to read) and `casa-costanza` (a large real flat with Italian labels).

**2. Create your own project**

- *With Claude Code* (easiest): open the folder in Claude Code and run `/bootstrap-new-project`. It asks a few basic questions (name, what the place is, rough sizes), creates `projects/<name>/` with a working generator and shows it in the viewer at `http://localhost:4173/<name>/`.
- *By hand*: copy `projects/camera-test/` to `projects/<name>/`, change the title in `project.json` and the numbers at the top of `room.js` (centimetres), then run `node projects/<name>/room.js`. That writes `scene.json`; reload the list and your project is there.

**3. Design in it**

Edit the table of measures at the top of the generator and run it again: the page redraws by itself and keeps your camera. From there:

- `/import-floor-plan`: model the real place step by step. Share the technical drawing first if you have one, then go room by room with your hand-made measures, and finally share photos to validate the result. You decide when it is done.
- `/add-furniture`: add furniture, appliances, lights or alternative layouts as switchable groups, and compare them in the **Groups** panel.
- **Plan** button, or `node scripts/plan-report.mjs <name>`: the interior measures of every room, to check the model against your tape measure; the sheet can be printed or saved as PDF, SVG, PNG.
- **First person**, **Night** and **Render** to look at the result like a visitor.

**4. Check and share**

`/check-and-publish` runs the tests (`npm test`), refreshes the project thumbnails (`npm run thumbs`), reviews the changes and commits or pushes when you ask. See [Skills for Claude Code](#skills-for-claude-code) for all of them, and [Static publishing](#static-publishing) to put the viewer on any static host.

## Running the viewer

```bash
npm install
node server.js 4173
open http://localhost:4173
```

`/` lists the projects (every `projects/<name>/` folder with a `scene.json`) and `/<name>/` opens the viewer for that project: the URL can be bookmarked, view parameters included (`/casa-costanza/?view=Iso+2`). The argument is the port (default 4173). Stop the server with `pkill -f "node server.js"`. It only needs a restart when `server.js` changes; for `public/viewer.html` and `public/index.html` a page reload is enough.

## The viewer

| What | How |
|---|---|
| Camera views (Saved, Iso, Iso 2, Front, Back, Left, Right, Top, Interior) | camera icon in the toolbar, or keys `1`–`9` |
| Zoom | `+` / `−`, mouse wheel, pinch |
| Fly (camera and orbit target together) | `W A S D` or arrows, `Q`/`E` down/up, `Shift` = faster |
| Dimensions of the model, or of the clicked object | gear menu → **Dims**, or `M` |
| Units (cm / in / m) | gear menu, or `U` |
| Click an object to dimension it, hover tooltip | gear menu → **Click to measure**, or `K` |
| Ambient occlusion | gear menu → **AO**, or `O` |
| Path-traced render (WebGPU, with denoiser) | **Render**, or `T` |
| Save the image on screen as PNG | **PNG**, or `P` |
| Night mode (lights on) | **Night**, or `N` |
| Walk through the model | **First person**, or `F` (`Esc` exits) |
| Top view of the walls with the interior measures of each room | **Plan** (see below) |
| Switchable groups of objects (furniture, variants, plumbing), all off by default | **Groups** button, bottom left, or `G` |

- The view survives a reload through the URL: `?view=Iso+2` or `?cam=ex,ey,ez,tx,ty,tz,fov` (values in inches).
- **Groups** are switched on from the panel, by category (each category title folds and unfolds with a click); the state is in the URL (`?g=kitchen-v1,bathroom`). Two groups with the same `variant` exclude each other (for example kitchen v1 / v2), the others are independent.
- Items whose name contains `Rimosso` or `Removed` (walls to be demolished) and that have no group join the implicit group **Removed elements**: off by default (the "after the works" state), drawn when switched on. "All on" leaves it out.
- Hovering an object shows its name and size.

## `scene.json` format

```jsonc
{ "units": "inches",
  "camera": { "eye": [x, y, z], "target": [x, y, z], "up": [0, 0, 1], "fov": 35 },
  "groups": [ { "id": "kitchen-v1", "label": "Kitchen v1", "cat": "Kitchen", "variant": "kitchen" } ],
  "items": [ { "n": "/Group/Sub/Leaf", "c": [r, g, b, a], "g": "kitchen-v1", "box": [x0, y0, z0, x1, y1, z1] } ] }
```

`groups` and `g` are optional: an item with `g` (an id or a list) is shown only if at least one of its groups is on; items without `g` are always shown.

Z is the vertical axis. Each item has exactly one geometry key: `box`, `faces`, `tube`, `slab`, `tray`, `rbox`. The full description is in [`CLAUDE.md`](CLAUDE.md).

## Repo layout

```
server.js              dev server: project list, viewer, one reload channel (SSE) per project
public/index.html      the project list (cards with a thumbnail)
public/viewer.html     the viewer (three.js), served at /<name>/
public/plan.mjs        the Plan sheet (walls from above + interior measures), also used by the tests
scripts/               static build (build-static.js), project discovery (projects.js), generator helpers (scene-kit.js), smoke test (smoke.js)
projects/<name>/       one model per folder: scene.json, textures/, thumb.jpg, project.json (optional) and, if there is one, the generator
CLAUDE.md              project notes, generator and SketchUp workflows, tricks
```

## Static publishing

`npm run build` creates `dist/` (ignored by git): `index.html` (the project list), `<name>/` with the viewer, `scene.json`, textures and thumbnail of each project, and the shared three.js modules, with relative paths, `noindex` / `robots.txt` and no automatic reload (just reload the page). No Node server is needed: it works on any static host, even in a sub-folder. A `_headers` file with the cache rules is written too, for hosts that read that format.

**Thumbnails.** The build takes a screenshot of every project with headless Chrome (`playwright-core`, Chrome from `CHROME_PATH` or the standard locations), using the camera saved in the scene or the `thumbView` view of `project.json`. If Chrome is not available (typical of hosted build environments) it uses `projects/<name>/thumb.jpg` if it exists, otherwise it shows a placeholder. To generate and commit the thumbnails locally: `npm run thumbs`.

## Plan: interior measures

The **Plan** button (desktop only) opens a vector sheet with only the walls seen from above and the interior measures of every closed room, plus the net area. It can be printed (also to PDF from the browser dialog, A4 or A3, at a standard scale) or downloaded as SVG and PNG. Rooms are found from the geometry; to name them, list them in `projects/<name>/project.json` with an inner point in cm: `"rooms": [{"name": "Bedroom", "at": [200, 175]}]`. Limit: walls exported as generic meshes (`faces`) are not used.

## Adding another model

Create `projects/<name>/` with a `scene.json` (by hand, from a generator script, or exported from another tool such as SketchUp): it shows up in the list at `/` by itself (no restart, just reload the page) and opens at `/<name>/`. Textures go in `projects/<name>/textures/` and the scene refers to them with a relative path (`textures/x.png`). In `projects/<name>/project.json` you can set `title`, `description`, `thumbView` (camera preset for the thumbnail, e.g. `"Iso 2"`), `generator` (the script that writes the scene) and `rooms`. `projects/camera-test/` is a minimal example. The format is described in `CLAUDE.md`.

## Skills for Claude Code

The repo ships four skills in `.claude/skills/`, available as soon as you open it with Claude Code (invoke them as `/<name>` or just describe what you want):

| Skill | What it does |
|---|---|
| `bootstrap-new-project` | asks a few basic questions and sets up a new `projects/<name>/` folder with a working generator, shown in the viewer |
| `import-floor-plan` | model a real place step by step: technical drawing first, then room by room with your hand-made measures, then photos to validate. You decide when it is done |
| `add-furniture` | add furniture, appliances, lights or variants as switchable groups, from a datasheet, a photo or plain measures |
| `check-and-publish` | run the tests, refresh the thumbnails, review the changes, commit and push when you ask |

## Tests

`npm test` runs `scripts/smoke.js`: the generators reproduce the committed `scene.json` files, the static build has the expected files, the server routes answer and, if Chrome is available, the viewer opens without errors (list, menus, groups, per-project reload, plan sheet). Stale thumbnails are reported as a warning: regenerate them with `npm run thumbs`.

## Testing the viewer from the command line

The automatic screenshots use `playwright-core` with the installed Chrome, headless with software GL. The method is described in `CLAUDE.md`, in the "Testing the viewer headlessly" section. Scripts and temporary images do not belong in the repo.

## Requirements

Node.js and a modern browser. Runtime dependencies (three.js, a path tracer, fonts) are installed by `npm install`.

## Working with SketchUp (.skp) files

SketchUp is optional: the viewer never reads `.skp` files, only the exported `scene.json`. If you model in SketchUp through the [SketchUp Connector for Claude](https://help.sketchup.com/en/sketchup-claude-connector) (Trimble's MCP service, enabled from Claude's connector settings with a Trimble ID), the repo can follow your live model:

- **SketchUp to viewer:** with the MCP connected, Claude builds in the live model and exports it with the exporter described in `CLAUDE.md` (`session_state["dump_scene"]`, section "SketchUp MCP: facts and gotchas"); the result is written to `projects/<name>/scene.json` and the viewer refreshes by itself. No save of the `.skp` is needed for the preview. Units: the SketchUp API is inches only, the same as `scene.json`; the generators work in cm and convert.
- **Viewer to SketchUp:** there is no export from `scene.json` to `.skp`. A model written by a generator script exists only in the viewer; to get it into SketchUp it has to be rebuilt through the MCP.
- **Saving a `.skp`:** `save_model` on the MCP returns a download link. The connector runs in the cloud, creates new files only (it cannot edit an existing `.skp`) and, on a free account, generates up to 30 models, so a file is only saved when you ask for one (details in `CLAUDE.md`).
- **Why it works this way:** reading `.skp` outside SketchUp was the weak point (a web viewer rendered the colours flat and ignored the saved camera, and the free SketchUp Viewer for Desktop was discontinued), so the repo exports geometry from the live model instead.

SketchUp is a trademark of Trimble; this project is not affiliated with or endorsed by Trimble.

## License

- Code (`server.js`, `public/`, `scripts/`): [MIT](LICENSE).
- Content (`projects/`, textures included): [CC BY 4.0](LICENSE-content). The parquet texture was procedurally generated with Claude.
- Geist and Geist Mono fonts ([SIL OFL 1.1](https://openfontlicense.org)), from the `@fontsource-variable` npm package; [Phosphor](https://phosphoricons.com) icons (MIT).
- An interior design experiment made with Claude Code. Not affiliated with or endorsed by IKEA or by any other brand mentioned in the comments and in the module names.
