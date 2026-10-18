// Smoke test (npm test): generators in sync with scene.json, static build, dev server routes and, when Chrome is available, the viewer in a browser.
// Usage: node scripts/smoke.js        Exit code 1 if any check fails; warnings (stale thumbnails, no Chrome) don't fail.
const fs = require('fs'), path = require('path'), os = require('os'), net = require('net');
const { spawn, spawnSync } = require('child_process');
const { listProjects, projectInfo, thumbStatus, findChrome } = require('./projects');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..'), PROJECTS = path.join(ROOT, 'projects');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'skp-smoke-'));
let fails = 0, warns = 0;
const ok = (name, cond, detail = '') => { if (cond) console.log('  ok  ', name); else { fails++; console.log('  FAIL', name, detail ? '— ' + detail : ''); } };
const warn = msg => { warns++; console.log('  warn', msg); };
const section = t => console.log('\n' + t);
const ids = listProjects(PROJECTS);

function freePort() {
  return new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
}

(async () => {
  let server;
  try {
    section('projects');
    ok(`found ${ids.length} project(s): ${ids.join(', ')}`, ids.length > 0);
    for (const id of ids) {
      let scene; try { scene = JSON.parse(fs.readFileSync(path.join(PROJECTS, id, 'scene.json'), 'utf8')); } catch (e) { ok(`${id}: scene.json is valid JSON`, false, e.message); continue; }
      ok(`${id}: scene.json has ${scene.items?.length} items, camera and units`, Array.isArray(scene.items) && scene.items.length > 0 && !!scene.camera && scene.units === 'inches');
      const st = thumbStatus(PROJECTS, id);
      if (st === 'stale') warn(`${id}: thumb.jpg is older than scene.json, run npm run thumbs`);
      else if (st === 'unknown') warn(`${id}: thumb.jpg without thumb.json, run npm run thumbs`);
      else if (st === 'none') warn(`${id}: no thumbnail committed (the list shows a placeholder unless the build can run Chrome)`);
      const gen = projectInfo(PROJECTS, id).generator;
      if (gen) {                                                   // the committed scene.json must be what its generator writes today
        const out = path.join(TMP, id + '-scene.json');
        const r = spawnSync(process.execPath, [path.join(PROJECTS, id, gen), out], { cwd: ROOT, encoding: 'utf8' });
        const same = r.status === 0 && fs.existsSync(out) && fs.readFileSync(out).equals(fs.readFileSync(path.join(PROJECTS, id, 'scene.json')));
        ok(`${id}: scene.json is up to date with ${gen}`, same, r.status ? r.stderr.split('\n')[0] : 'run the generator and commit the result');
      }
    }

    section('plan sheet (public/plan.mjs)');
    const { buildPlan, planSvg } = await import(pathToFileURL(path.join(ROOT, 'public/plan.mjs')).href);
    const plans = {};
    for (const id of ids) {
      const data = JSON.parse(fs.readFileSync(path.join(PROJECTS, id, 'scene.json'), 'utf8'));
      let meta = {}; try { meta = JSON.parse(fs.readFileSync(path.join(PROJECTS, id, 'project.json'), 'utf8')); } catch {}
      const plan = plans[id] = buildPlan(data, new Set(), meta);
      ok(`${id}: plan has walls and at least one closed room (${plan.rooms.length} found)`, plan.walls.length > 0 && plan.rooms.length > 0);
      ok(`${id}: every room has a net area > 0 and at least one dimensioned side`, plan.rooms.every(r => r.area > 0 && r.sides.length > 0));
      if (plan.rooms.length) ok(`${id}: planSvg fits A4 and A3 at a standard scale`, ['a4', 'a3'].every(pp => { const o = planSvg(plan, { paper: pp, title: id }); return [20, 25, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500].includes(o.scale) && /^<svg/.test(o.svg); }));
      if (data.items.some(i => /Rimosso/.test(i.n) && !i.g)) ok(`${id}: walls to be demolished are drawn (dashed) only when "rimossi" is on`, plan.walls.every(w => !w.removed) && buildPlan(data, new Set(['rimossi']), meta).walls.some(w => w.removed));
    }
    if (plans['camera-test']) {                                      // the small fixture has exact known measures: 400 x 350 cm interior
      const r = plans['camera-test'].rooms[0];
      ok('camera-test: the room is "Camera da letto", 14.0 m2, sides 400 and 350 cm', r && r.name === 'Camera da letto' && Math.abs(r.area - 14) < 0.05 && r.sides.map(s => Math.round(s.len)).sort().join() === '350,400', r && JSON.stringify(r.sides.map(s => s.len)));
    }

    section('static build');
    const dist = path.join(TMP, 'dist');
    const b = spawnSync(process.execPath, [path.join(__dirname, 'build-static.js'), '--no-thumbs'], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, SKP_DIST: dist } });
    ok('build-static.js --no-thumbs exits 0', b.status === 0, b.stderr.split('\n')[0]);
    const has = f => fs.existsSync(path.join(dist, f));
    ok('dist has index.html, projects.json, plan.mjs, fonts, three, _headers', ['index.html', 'projects.json', 'plan.mjs', 'fonts/geist.woff2', 'fonts/geist-mono.woff2', 'three/build/three.module.js', '_headers'].every(has));
    for (const id of ids) ok(`dist/${id}/ has index.html, scene.json, textures where used`, has(`${id}/index.html`) && has(`${id}/scene.json`) && (!fs.existsSync(path.join(PROJECTS, id, 'textures')) || has(`${id}/textures`)));
    if (has('projects.json')) ok('dist/projects.json lists every project', JSON.parse(fs.readFileSync(path.join(dist, 'projects.json'), 'utf8')).map(p => p.id).join() === ids.join());
    ok('viewer in dist reaches shared files with ../ and is marked static', /\.\.\/three\//.test(fs.readFileSync(path.join(dist, ids[0], 'index.html'), 'utf8')) && /STATIC_BUILD = true/.test(fs.readFileSync(path.join(dist, ids[0], 'index.html'), 'utf8')));

    section('dev server');
    const port = await freePort(), base = `http://127.0.0.1:${port}`;
    server = spawn(process.execPath, [path.join(ROOT, 'server.js'), String(port)], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    await new Promise((res, rej) => { server.stdout.on('data', d => /Open http/.test(d) && res()); server.on('exit', c => rej(new Error('server exited ' + c))); setTimeout(() => rej(new Error('server did not start')), 8000); });
    const get = async (u, opt = {}) => fetch(base + u, { redirect: 'manual', ...opt });
    ok('/ is the list (200 html)', (await get('/')).status === 200);
    const list = await (await get('/projects.json')).json();
    ok('/projects.json lists every project', list.map(p => p.id).join() === ids.join());
    for (const id of ids) {
      ok(`/${id} redirects to /${id}/`, (await get('/' + id)).status === 302 && (await get('/' + id)).headers.get('location') === `/${id}/`);
      ok(`/${id}/ serves the viewer`, (await get(`/${id}/`)).status === 200);
      const sc = await get(`/${id}/scene.json`); ok(`/${id}/scene.json is JSON`, sc.status === 200 && Array.isArray((await sc.json()).items));
    }
    ok('unknown project and path traversal are refused', (await get('/nope/')).status === 404 && [403, 404].includes((await get(`/${ids[0]}/..%2f..%2fserver.js`)).status));
    ok('/plan.mjs and /<id>/project.json are served', (await get('/plan.mjs')).status === 200 && (await get(`/${ids[0]}/project.json`)).status === (fs.existsSync(path.join(PROJECTS, ids[0], 'project.json')) ? 200 : 404));
    ok('fonts and shared libs are served', (await get('/fonts/geist.woff2')).status === 200 && (await get('/three/build/three.module.js')).status === 200 && (await get('/vendor/oidn-weights/rt_hdr_alb_nrm_small.tza')).status === 200);

    section('browser');
    let chromium; try { ({ chromium } = require('playwright-core')); } catch {}
    const exe = findChrome();
    if (!chromium || !exe) warn('no Chrome / playwright-core: browser checks skipped (set CHROME_PATH)');
    else {
      const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
      const open = async (url, w = 1300, h = 800) => {
        const p = await browser.newPage({ viewport: { width: w, height: h } });
        p.errors = [];
        p.on('pageerror', e => p.errors.push('pageerror: ' + e.message));
        p.on('console', m => m.type() === 'error' && p.errors.push('console: ' + m.text()));
        p.on('response', r => r.status() >= 400 && !/favicon/.test(r.url()) && p.errors.push(`HTTP ${r.status()} ${r.url()}`));
        await p.goto(base + url, { waitUntil: 'networkidle' });
        return p;
      };
      const loaded = p => p.waitForFunction(() => /objects/.test(document.getElementById('status').textContent), null, { timeout: 120000 });

      const home = await open('/');
      await home.waitForSelector('a.card');
      ok('list shows one card per project, no errors', (await home.$$eval('a.card', c => c.length)) === ids.length && !home.errors.length, home.errors.join('; '));
      const withThumb = list.filter(p => p.thumb).length;
      await home.waitForTimeout(500);
      ok(`thumbnails load (${withThumb} expected)`, (await home.$$eval('a.card img', i => i.filter(x => x.naturalWidth > 0).length)) === withThumb);
      await home.close();

      for (const id of ids) {
        const info = list.find(p => p.id === id), p = await open(`/${id}/`);
        await loaded(p);
        ok(`${id}: viewer loads ${info.items} objects without errors`, (await p.textContent('#status')).startsWith(info.items + ' objects') && !p.errors.length, p.errors.join('; '));
        // camera dropdown
        await p.click('#camBtn');
        ok(`${id}: camera dropdown opens (aria-expanded)`, (await p.getAttribute('#camBtn', 'aria-expanded')) === 'true' && await p.isVisible('#views'));
        await p.click('#views button >> nth=1');
        ok(`${id}: choosing a view folds it and writes ?view`, (await p.getAttribute('#camBtn', 'aria-expanded')) === 'false' && !(await p.isVisible('#views')) && /[?&]view=/.test(p.url()));
        // settings dropdown
        await p.click('#setBtn');
        ok(`${id}: settings dropdown opens, a click elsewhere folds it`, await p.isVisible('#setmenu') && (await p.mouse.click(650, 500), !(await p.isVisible('#setmenu'))));
        // groups
        const scene = JSON.parse(fs.readFileSync(path.join(PROJECTS, id, 'scene.json'), 'utf8'));
        if ((scene.groups || []).length) {
          await p.click('#gbtn');
          const before = p.url(), box = p.locator('#groups label input').first(), was = await box.isChecked();
          await box.click(); await p.waitForTimeout(300);
          ok(`${id}: toggling a group updates the URL (?g=)`, (await box.isChecked()) !== was && p.url() !== before);
          const w = (await p.$eval('#groups', e => e.getBoundingClientRect().width));
          ok(`${id}: groups panel is 380 px wide`, Math.round(w) === 380, 'width ' + w);
        }
        // plan sheet: opens, labels every room, paper change, closes with Esc
        await p.click('#planbtn'); await p.waitForSelector('#plan svg');
        const nLabels = await p.evaluate(() => [...document.querySelectorAll('#plan svg text')].filter(t => t.querySelector('tspan')).length);
        ok(`${id}: the plan sheet opens with one label per room (${plans[id].rooms.length})`, nLabels === plans[id].rooms.length, 'labels ' + nLabels);
        const s4 = await p.textContent('#plan svg'); await p.selectOption('#plan-paper', 'a3');
        ok(`${id}: switching to A3 redraws the sheet`, /A3/.test(await p.textContent('#plan svg')) && s4 !== await p.textContent('#plan svg'));
        await p.keyboard.press('Escape');
        ok(`${id}: Esc closes the plan sheet`, (await p.$('#plan')) === null);
        // implicit "Elementi rimossi" group
        if (scene.items.some(i => /Rimosso/.test(i.n) && !i.g)) ok(`${id}: "Elementi rimossi" group exists and is off`, (await p.locator('#groups label', { hasText: 'Elementi rimossi' }).count()) === 1 && !(await p.locator('#groups label', { hasText: 'Elementi rimossi' }).locator('input').isChecked()));
        await p.close();
      }

      if (ids.length >= 2) {                                         // reload events reach only the viewers of the changed project
        const pages = [];
        for (const id of ids.slice(0, 2)) {
          const p = await open(`/${id}/`); await loaded(p);
          await p.evaluate(() => { window.__r = 0; new EventSource('events').addEventListener('reload', () => window.__r++); });
          pages.push(p);
        }
        await pages[0].waitForTimeout(600);
        const f = path.join(PROJECTS, ids[0], 'scene.json'); fs.writeFileSync(f, fs.readFileSync(f));   // same bytes: only the mtime changes
        await pages[0].waitForTimeout(2000);
        const r = await Promise.all(pages.map(p => p.evaluate(() => window.__r)));
        ok(`touching ${ids[0]} reloads its viewer and not ${ids[1]}`, r[0] >= 1 && r[1] === 0, JSON.stringify(r));
        for (const p of pages) await p.close();
      }
      await browser.close();
    }
  } catch (e) {
    fails++; console.log('  FAIL unexpected error —', e.stack || e);
  } finally {
    if (server) server.kill();
    fs.rmSync(TMP, { recursive: true, force: true });
  }
  console.log(`\n${fails ? 'FAILED' : 'passed'}: ${fails} failure(s), ${warns} warning(s)`);
  process.exit(fails ? 1 : 0);
})();
