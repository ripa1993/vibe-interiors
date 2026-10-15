// Costruisce la versione STATICA del viewer in dist/ (per Cloudflare Pages o qualunque hosting statico): nessun server, nessun aggiornamento automatico.
// Uso: node scripts/build-static.js [percorso/scene.json]    (default: projects/casa-costanza/scene.json)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');
const SCENE = path.resolve(process.argv[2] || path.join(ROOT, 'projects/casa-costanza/scene.json'));
const THREE = path.join(ROOT, 'node_modules/three');

const copyDir = (from, to, filter = () => true) => {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b, filter);
    else if (filter(a)) fs.copyFileSync(a, b);
  }
};

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// pagina: marca la build statica e vieta l'indicizzazione dei motori di ricerca
let html = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');
html = html.replace('<title>', '<meta name="robots" content="noindex, nofollow">\n<script>window.STATIC_BUILD = true;</script>\n<title>');
fs.writeFileSync(path.join(OUT, 'index.html'), html);
fs.copyFileSync(SCENE, path.join(OUT, 'scene.json'));
if (fs.existsSync(path.join(ROOT, 'public/textures'))) copyDir(path.join(ROOT, 'public/textures'), path.join(OUT, 'textures'));

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
fs.writeFileSync(path.join(OUT, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n/scene.json\n  Cache-Control: no-cache\n');
fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log('dist/ pronta:', fs.readdirSync(OUT).join(', '), '| scena:', path.relative(ROOT, SCENE), (fs.statSync(SCENE).size / 1e6).toFixed(2) + ' MB');
