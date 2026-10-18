---
name: check-and-publish
description: Use before committing or pushing changes in this repo, when the user says check, test, publish, commit or push, or wants to share the repo. Runs the checks, refreshes thumbnails, reviews what would be committed, and only commits or pushes when asked.
---

# Check, then publish

Reply in the user's language; commit messages and repo files in English.

## 1. Look at what changed
`git status -sb` and `git diff --stat`. Say what is there in one or two lines. Flag anything that should not be committed: `server.log`, `dist/`, `node_modules/`, screenshots, `.env`, local settings, `CLAUDE.local.md` (all git-ignored; if one shows up as untracked, stop and tell the user), and anything that looks like personal data (an address, an email, a phone number, photos) in project folders, comments or commit history.

## 2. Make the generated files current
- For every project whose generator changed (`project.json` `generator`): rerun it so `scene.json` is what the script writes today.
- `npm run thumbs` when a project's scene changed, or when `npm test` warns about a stale or missing thumbnail (needs Chrome; it rewrites `projects/<id>/thumb.jpg` and `thumb.json`). Look at the new picture before committing it.

## 3. Run the checks
`npm test` (about a minute; it needs Chrome for the browser block). It must end with `passed: 0 failure(s)`. Warnings are not failures but report each one: stale or missing thumbnails, no Chrome. On a failure, show the failing line and fix the cause; do not weaken the test.
If you changed the viewer, the server or the build, also take a headless screenshot of the list and of one project (see "Testing the viewer headlessly" in `CLAUDE.md`) and look at it.

## 4. Update the notes when the change deserves it
If you learned something about the SDK, built a new kind of geometry, added a viewer feature or a `scene.json` type, or the user stated a preference, `CLAUDE.md` (or `docs/sketchup.md` for SketchUp SDK facts) gets one or two lines in the matching section (no model-specific data), and the README if a user-facing behaviour changed. Tell the user in one line what you added.

## 5. Commit and push: only when asked
- If the user has not clearly asked to commit, propose the message and ask. If they asked, commit with a short English message (what and why), then push. Never force-push; never rewrite history without an explicit request and a backup (`git bundle create ~/backup.bundle --all`).
- Before the first publication of the repo, check that history and files are clean: search the tree and `git log -p` for names of streets, emails, phone numbers, keys; confirm every image and texture is the user's or freely licensed; confirm `LICENSE` and `LICENSE-content` say what the user wants.
- After pushing, show `git status -sb` and the new commit hash. If the repo is deployed from the remote, the deployment notes (if any) are in the untracked `CLAUDE.local.md`.
