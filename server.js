// Watches a scene JSON file and pushes a reload event to connected browsers.
// Usage: node server.js [path/to/scene.json] [port]
const http = require('http');
const fs = require('fs');
const path = require('path');

const SCENE = path.resolve(process.argv[2] || path.join(__dirname, 'scene.json'));
const PORT = Number(process.argv[3] || process.env.PORT || 4173);
const PUBLIC = path.join(__dirname, 'public');
const THREE = path.join(__dirname, 'node_modules', 'three');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css' };
const clients = new Set();

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
  if (url.pathname === '/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
    res.write('retry: 1000\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  if (url.pathname === '/favicon.ico') return send(res, 204, 'image/x-icon', '');
  if (url.pathname === '/scene.json') return serveFile(res, SCENE);
  if (url.pathname.startsWith('/three/')) {
    const f = path.normalize(path.join(THREE, url.pathname.slice('/three/'.length)));
    if (!f.startsWith(THREE)) return send(res, 403, 'text/plain', 'forbidden');
    return serveFile(res, f);
  }
  const rel = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const f = path.normalize(path.join(PUBLIC, rel));
  if (!f.startsWith(PUBLIC)) return send(res, 403, 'text/plain', 'forbidden');
  serveFile(res, f);
});

// Watch the directory, not the file: editors and writers often replace the file (new inode).
let timer = null;
fs.watch(path.dirname(SCENE), (event, name) => {
  if (name !== path.basename(SCENE)) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    const stamp = Date.now();
    console.log(new Date().toLocaleTimeString(), 'changed ->', clients.size, 'client(s)');
    for (const c of clients) c.write(`event: reload\ndata: ${stamp}\n\n`);
  }, 150);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Watching ${SCENE}`);
  console.log(`Open http://localhost:${PORT}`);
});
