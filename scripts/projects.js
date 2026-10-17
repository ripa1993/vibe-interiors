// Project discovery shared by server.js (dev) and scripts/build-static.js: a project is any projects/<id>/ folder with a scene.json.
// Optional projects/<id>/project.json: {"title": "...", "description": "...", "thumbView": "Iso 2"} (thumbView = camera preset used for the thumbnail).
const fs = require('fs'), path = require('path'), crypto = require('crypto');

const ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

function listProjects(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory() && ID_RE.test(e.name) && fs.existsSync(path.join(dir, e.name, 'scene.json')))
    .map(e => e.name).sort();
}

const titleOf = id => id.replace(/[-_]+/g, ' ').replace(/^./, c => c.toUpperCase());

// projectInfo parses scene.json (428 KB for the big model), so it is cached per project and refreshed only when scene.json, project.json or thumb.jpg change
const infoCache = new Map();
const mtime = f => { try { return fs.statSync(f).mtimeMs; } catch { return 0; } };
function projectInfo(dir, id) {
  const base = path.join(dir, id);
  const sig = ['scene.json', 'project.json', 'thumb.jpg'].map(f => mtime(path.join(base, f))).join('|');
  const hit = infoCache.get(base);
  if (hit && hit.sig === sig) return hit.info;
  let meta = {}, items = null;
  try { meta = JSON.parse(fs.readFileSync(path.join(base, 'project.json'), 'utf8')); } catch {}
  try { items = JSON.parse(fs.readFileSync(path.join(base, 'scene.json'), 'utf8')).items.length; } catch {}
  const info = { id, title: meta.title || titleOf(id), description: meta.description || '', thumbView: meta.thumbView || null, generator: meta.generator || null,
                 items, thumb: fs.existsSync(path.join(base, 'thumb.jpg')) };
  infoCache.set(base, { sig, info });
  return info;
}

// A committed thumb.jpg goes stale when scene.json changes. `npm run thumbs` writes thumb.json = {scene: <hash of scene.json>}; this compares it:
// 'none' (no thumb.jpg), 'unknown' (thumb.jpg without thumb.json), 'ok', 'stale'
const sceneHash = (dir, id) => crypto.createHash('sha1').update(fs.readFileSync(path.join(dir, id, 'scene.json'))).digest('hex').slice(0, 12);
function thumbStatus(dir, id) {
  const base = path.join(dir, id);
  if (!fs.existsSync(path.join(base, 'thumb.jpg'))) return 'none';
  let rec; try { rec = JSON.parse(fs.readFileSync(path.join(base, 'thumb.json'), 'utf8')); } catch { return 'unknown'; }
  return rec.scene === sceneHash(dir, id) ? 'ok' : 'stale';
}

// Self-hosted fonts (npm @fontsource-variable, SIL OFL 1.1), served at /fonts/<name> by server.js and copied to dist/fonts/ by the build
const FONTS = { 'geist.woff2': 'geist/files/geist-latin-wght-normal.woff2', 'geist-mono.woff2': 'geist-mono/files/geist-mono-latin-wght-normal.woff2' };
const fontPath = (root, name) => FONTS[name] && path.join(root, 'node_modules/@fontsource-variable', FONTS[name]);

// Chrome for the headless screenshots / smoke test: CHROME_PATH, else the usual macOS / Linux locations
function findChrome() {
  const c = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
             '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  return c.find(f => f && fs.existsSync(f));
}

module.exports = { ID_RE, listProjects, projectInfo, sceneHash, thumbStatus, findChrome, FONTS, fontPath };
