// Costruisce la versione STATICA in dist/ (per Cloudflare Pages o qualunque hosting statico): nessun server, nessun aggiornamento automatico.
// dist/index.html = elenco progetti, dist/<id>/ = viewer + scene.json + textures + thumb.jpg di ogni projects/<id>/, dist/three e dist/vendor condivisi.
// Le miniature sono screenshot fatti con Chrome headless (playwright-core). Senza Chrome (es. Cloudflare Pages) si usa projects/<id>/thumb.jpg se esiste.
// Uso: node scripts/build-static.js [--save-thumbs] [--no-thumbs]
//   --save-thumbs: scrive anche projects/<id>/thumb.jpg da committare (errore se manca Chrome); --no-thumbs: salta gli screenshot (usa solo projects/<id>/thumb.jpg)
const fs = require('fs'), path = require('path'), http = require('http');
const { listProjects, projectInfo, sceneHash, thumbStatus, findChrome, FONTS, fontPath } = require('./projects');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.SKP_DIST ? path.resolve(process.env.SKP_DIST) : path.join(ROOT, 'dist');   // SKP_DIST: build somewhere else (used by scripts/smoke.js)
const PROJECTS = path.join(ROOT, 'projects');
const THREE = path.join(ROOT, 'node_modules/three');
const SAVE_THUMBS = process.argv.includes('--save-thumbs'), NO_THUMBS = process.argv.includes('--no-thumbs');

const copyDir = (from, to, filter = () => true) => {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b, filter);
    else if (filter(a)) fs.copyFileSync(a, b);
  }
};
const NOINDEX = '<meta name="robots" content="noindex, nofollow">\n';

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// elenco dei progetti
const ids = listProjects(PROJECTS);
if (!ids.length) { console.error('nessun progetto in projects/ (serve projects/<id>/scene.json)'); process.exit(1); }

// viewer di ogni progetto: marca la build statica e vieta l'indicizzazione dei motori di ricerca
const viewer = fs.readFileSync(path.join(ROOT, 'public/viewer.html'), 'utf8')
  .replace('<title>', NOINDEX + '<script>window.STATIC_BUILD = true;</script>\n<title>');
for (const id of ids) {
  const from = path.join(PROJECTS, id), to = path.join(OUT, id);
  fs.mkdirSync(to, { recursive: true });
  fs.writeFileSync(path.join(to, 'index.html'), viewer);
  fs.copyFileSync(path.join(from, 'scene.json'), path.join(to, 'scene.json'));
  if (fs.existsSync(path.join(from, 'project.json'))) fs.copyFileSync(path.join(from, 'project.json'), path.join(to, 'project.json'));   // room names for the plan sheet
  if (fs.existsSync(path.join(from, 'textures'))) copyDir(path.join(from, 'textures'), path.join(to, 'textures'));
  if (fs.existsSync(path.join(from, 'thumb.jpg'))) fs.copyFileSync(path.join(from, 'thumb.jpg'), path.join(to, 'thumb.jpg'));   // fallback se non si può fare lo screenshot
}

fs.copyFileSync(path.join(ROOT, 'public/plan.mjs'), path.join(OUT, 'plan.mjs'));   // plan sheet module, imported by the viewers as ../plan.mjs

// font self-hosted (Geist, Geist Mono): /fonts/<nome>.woff2, come in server.js
fs.mkdirSync(path.join(OUT, 'fonts'), { recursive: true });
for (const name of Object.keys(FONTS)) fs.copyFileSync(fontPath(ROOT, name), path.join(OUT, 'fonts', name));

// three.js servito dallo stesso sito (stessi percorsi relativi di server.js): serve solo build/ (moduli ES) e le utility OrbitControls
copyDir(path.join(THREE, 'build'), path.join(OUT, 'three/build'), f => /three\.(module|core|webgpu|tsl)\.js$/.test(f));   // webgpu + tsl: WebGPU path tracer
copyDir(path.join(THREE, 'examples/jsm/controls'), path.join(OUT, 'three/examples/jsm/controls'));
copyDir(path.join(THREE, 'examples/jsm/postprocessing'), path.join(OUT, 'three/examples/jsm/postprocessing'), f => /\.js$/.test(f));   // path tracer (Pass.js) + occlusione ambientale (EffectComposer, GTAOPass)
copyDir(path.join(THREE, 'examples/jsm/shaders'), path.join(OUT, 'three/examples/jsm/shaders'), f => /(Copy|Output|GTAO|PoissonDenoise)Shader\.js$/.test(f));
fs.mkdirSync(path.join(OUT, 'three/examples/jsm/math'), { recursive: true });
fs.copyFileSync(path.join(THREE, 'examples/jsm/math/SimplexNoise.js'), path.join(OUT, 'three/examples/jsm/math/SimplexNoise.js'));
// path tracers (pulsante Render): sorgenti ES delle librerie (la versione WebGPU non ha un bundle), il denoiser OIDN con i soli pesi usati
for (const pkg of ['three-gpu-pathtracer', 'three-mesh-bvh']) copyDir(path.join(ROOT, 'node_modules', pkg, 'src'), path.join(OUT, 'vendor', pkg, 'src'), f => /\.js$/.test(f));
for (const [pkg, files] of [['oidn-web', ['dist/oidn.js']], ['@pmndrs/upscaler', null], ['oidn-weights', ['rt_hdr_alb_nrm_small.tza']]]) {
  const from = path.join(ROOT, 'node_modules', pkg), to = path.join(OUT, 'vendor', pkg);
  if (!files) { copyDir(path.join(from, 'dist'), path.join(to, 'dist'), f => /\.js$/.test(f)); continue; }
  for (const f of files) { fs.mkdirSync(path.dirname(path.join(to, f)), { recursive: true }); fs.copyFileSync(path.join(from, f), path.join(to, f)); }
}

// intestazioni Cloudflare Pages: niente indicizzazione, niente cache lunga su scene.json
fs.writeFileSync(path.join(OUT, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n/*/scene.json\n  Cache-Control: no-cache\n/projects.json\n  Cache-Control: no-cache\n/three/*\n  Cache-Control: public, max-age=86400\n/vendor/*\n  Cache-Control: public, max-age=86400\n/fonts/*\n  Cache-Control: public, max-age=86400\n');
fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');

// ---------- miniature: screenshot del viewer in Chrome headless, servito da dist/ ----------
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
async function makeThumbs() {
  if (NO_THUMBS) return { done: [], why: '--no-thumbs' };
  let chromium;
  try { ({ chromium } = require('playwright-core')); } catch { return { done: [], why: 'playwright-core non installato' }; }
  const exe = findChrome();
  if (!exe) return { done: [], why: 'Chrome non trovato (imposta CHROME_PATH)' };
  const srv = http.createServer((req, res) => {
    const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let f = path.normalize(path.join(OUT, u));
    if (!f.startsWith(OUT)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    fs.readFile(f, (err, data) => {
      if (err) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(data);
    });
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port, done = [];
  const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    for (const id of ids) {
      const page = await browser.newPage({ viewport: { width: 1200, height: 750 }, deviceScaleFactor: 1 });
      try {
        const view = projectInfo(PROJECTS, id).thumbView;
        await page.goto(`http://127.0.0.1:${port}/${id}/` + (view ? '?view=' + encodeURIComponent(view) : ''), { waitUntil: 'networkidle' });
        await page.waitForFunction(() => /objects/.test(document.getElementById('status').textContent), null, { timeout: 120000 });
        await page.addStyleTag({ content: '#bar, #gbtn, #groups, #fphint, #tip, #labels { display: none !important; }' });
        await page.waitForTimeout(1500);                                   // first frames + textures
        const out = path.join(OUT, id, 'thumb.jpg');
        await page.screenshot({ path: out, type: 'jpeg', quality: 82 });
        done.push(id);
      } catch (e) { console.warn(`miniatura di ${id} non generata:`, e.message.split('\n')[0]); }
      await page.close();
    }
  } finally { await browser.close(); srv.close(); }
  return { done };
}

(async () => {
  const { done, why } = await makeThumbs();
  if (why) console.warn('miniature non generate:', why);
  if (SAVE_THUMBS) {
    if (done.length !== ids.length) { console.error('--save-thumbs: miniature mancanti, niente da salvare'); process.exit(1); }
    for (const id of done) {
      fs.copyFileSync(path.join(OUT, id, 'thumb.jpg'), path.join(PROJECTS, id, 'thumb.jpg'));
      fs.writeFileSync(path.join(PROJECTS, id, 'thumb.json'), JSON.stringify({ scene: sceneHash(PROJECTS, id) }) + '\n');   // lets the build / npm test notice a stale thumbnail
    }
  }
  for (const id of ids) if (!done.includes(id)) {                      // miniatura committata: avvisa se la scena è cambiata dopo
    const st = thumbStatus(PROJECTS, id);
    if (st === 'stale') console.warn(`attenzione: projects/${id}/thumb.jpg è vecchia (scene.json è cambiato): esegui npm run thumbs`);
    else if (st === 'unknown') console.warn(`nota: projects/${id}/thumb.jpg senza thumb.json, non so se è aggiornata: esegui npm run thumbs`);
  }
  // elenco + pagina iniziale (la miniatura c'è se è stata generata o copiata da projects/<id>/thumb.jpg)
  const info = ids.map(id => ({ ...projectInfo(PROJECTS, id), thumb: fs.existsSync(path.join(OUT, id, 'thumb.jpg')) }));
  fs.writeFileSync(path.join(OUT, 'projects.json'), JSON.stringify(info));
  fs.writeFileSync(path.join(OUT, 'index.html'), fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8').replace('<title>', NOINDEX + '<title>'));
  console.log('dist/ pronta:', fs.readdirSync(OUT).join(', '), '| progetti:', info.map(p => `${p.id} (${p.thumb ? (done.includes(p.id) ? 'miniatura generata' : 'miniatura da projects/') : 'senza miniatura'})`).join(', '));
})().catch(e => { console.error(e); process.exit(1); });
