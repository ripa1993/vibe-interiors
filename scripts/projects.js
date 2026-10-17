// Project discovery shared by server.js (dev) and scripts/build-static.js: a project is any projects/<id>/ folder with a scene.json.
// Optional projects/<id>/project.json: {"title": "...", "description": "...", "thumbView": "Iso 2"} (thumbView = camera preset used for the thumbnail).
const fs = require('fs'), path = require('path');

const ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

function listProjects(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory() && ID_RE.test(e.name) && fs.existsSync(path.join(dir, e.name, 'scene.json')))
    .map(e => e.name).sort();
}

const titleOf = id => id.replace(/[-_]+/g, ' ').replace(/^./, c => c.toUpperCase());

function projectInfo(dir, id) {
  const base = path.join(dir, id);
  let meta = {}, items = null;
  try { meta = JSON.parse(fs.readFileSync(path.join(base, 'project.json'), 'utf8')); } catch {}
  try { items = JSON.parse(fs.readFileSync(path.join(base, 'scene.json'), 'utf8')).items.length; } catch {}
  return { id, title: meta.title || titleOf(id), description: meta.description || '', thumbView: meta.thumbView || null,
           items, thumb: fs.existsSync(path.join(base, 'thumb.jpg')) };
}

// Self-hosted fonts (npm @fontsource-variable, SIL OFL 1.1), served at /fonts/<name> by server.js and copied to dist/fonts/ by the build
const FONTS = { 'geist.woff2': 'geist/files/geist-latin-wght-normal.woff2', 'geist-mono.woff2': 'geist-mono/files/geist-mono-latin-wght-normal.woff2' };
const fontPath = (root, name) => FONTS[name] && path.join(root, 'node_modules/@fontsource-variable', FONTS[name]);

module.exports = { ID_RE, listProjects, projectInfo, FONTS, fontPath };
