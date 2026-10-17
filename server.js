// Serves every projects/<id>/scene.json and pushes a reload event to the browsers viewing that project.
// Usage: node server.js [port]        (/ = project list, /<id>/ = viewer; the old `node server.js scene.json port` form still starts, the file is ignored)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { ID_RE, listProjects, projectInfo } = require('./scripts/projects');

const args = process.argv.slice(2);
if (args[0] && /\.json$/i.test(args[0])) { console.warn(`note: "${args[0]}" is ignored, all projects under projects/ are served`); args.shift(); }
const PORT = Number(args[0] || process.env.PORT || 4173);
const PUBLIC = path.join(__dirname, 'public');
const PROJECTS = path.join(__dirname, 'projects');
const THREE = path.join(__dirname, 'node_modules', 'three');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
               '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const clients = new Map();                                        // project id -> Set of SSE responses

function send(res, code, type, body) {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

function serveFile(res, file) {
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'text/plain', 'not found');
    send(res, 200, MIME[path.extname(file)] || 'application/octet-stream', data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;
  if (p === '/favicon.ico') return send(res, 204, 'image/x-icon', '');
  if (p === '/') return serveFile(res, path.join(PUBLIC, 'index.html'));
  if (p === '/projects.json') return send(res, 200, 'application/json', JSON.stringify(listProjects(PROJECTS).map(id => projectInfo(PROJECTS, id))));
  if (p.startsWith('/vendor/')) {                                  // path tracer (Render button): only the packages it needs
    const f = path.normalize(path.join(__dirname, 'node_modules', p.slice('/vendor/'.length)));
    if (!/node_modules[\\/](three-gpu-pathtracer|three-mesh-bvh|oidn-web|oidn-weights|@pmndrs[\\/]upscaler)[\\/]/.test(f)) return send(res, 403, 'text/plain', 'forbidden');
    return serveFile(res, f);
  }
  if (p.startsWith('/three/')) {
    const f = path.normalize(path.join(THREE, p.slice('/three/'.length)));
    if (!f.startsWith(THREE)) return send(res, 403, 'text/plain', 'forbidden');
    return serveFile(res, f);
  }
  const m = p.match(/^\/([^/]+)(\/.*)?$/);
  if (m && ID_RE.test(m[1]) && fs.existsSync(path.join(PROJECTS, m[1], 'scene.json'))) {
    const id = m[1], rest = m[2];
    if (rest === undefined) { res.writeHead(302, { Location: `/${id}/${url.search}` }); return res.end(); }   // relative URLs in the viewer need the trailing slash
    if (rest === '/') return serveFile(res, path.join(PUBLIC, 'viewer.html'));
    if (rest === '/events') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
      res.write('retry: 1000\n\n');
      if (!clients.has(id)) clients.set(id, new Set());
      clients.get(id).add(res);
      req.on('close', () => clients.get(id).delete(res));
      return;
    }
    if (rest === '/scene.json' || rest === '/thumb.jpg' || rest.startsWith('/textures/')) {
      const base = path.join(PROJECTS, id), f = path.normalize(path.join(base, rest));
      if (!f.startsWith(base + path.sep)) return send(res, 403, 'text/plain', 'forbidden');
      return serveFile(res, f);
    }
  }
  send(res, 404, 'text/plain', 'not found');
});

// Watch projects/ recursively (not single files): editors and writers often replace the file (new inode).
const timers = new Map();
fs.watch(PROJECTS, { recursive: true }, (event, name) => {
  const parts = String(name || '').split(path.sep);
  if (parts.length !== 2 || parts[1] !== 'scene.json') return;
  const id = parts[0];
  clearTimeout(timers.get(id));
  timers.set(id, setTimeout(() => {
    const set = clients.get(id) || new Set(), stamp = Date.now();
    console.log(new Date().toLocaleTimeString(), id, 'changed ->', set.size, 'client(s)');
    for (const c of set) c.write(`event: reload\ndata: ${stamp}\n\n`);
  }, 150));
});

server.listen(PORT, '127.0.0.1', () => {
  const ids = listProjects(PROJECTS);
  console.log(`Serving ${ids.length} project(s): ${ids.join(', ') || '(none)'}`);
  console.log(`Open http://localhost:${PORT}`);
});
