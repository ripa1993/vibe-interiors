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
  let server, fxServer;
  try {
    section('projects');
    ok(`found ${ids.length} project(s): ${ids.join(', ')}`, ids.length > 0);
    if (!ids.length) throw new Error('no project in projects/ (needs projects/<id>/scene.json): nothing to test');
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
      if (data.items.some(i => /Rimosso|Removed/.test(i.n) && !i.g)) ok(`${id}: walls to be demolished are drawn (dashed) only when "removed" is on`, plan.walls.every(w => !w.removed) && buildPlan(data, new Set(['removed']), meta).walls.some(w => w.removed));
    }
    if (plans['camera-test']) {                                      // the small fixture has exact known measures: 400 x 350 cm interior
      const r = plans['camera-test'].rooms[0];
      ok('camera-test: the room is "Bedroom", 14.0 m2, sides 400 and 350 cm', r && r.name === 'Bedroom' && Math.abs(r.area - 14) < 0.05 && r.sides.map(s => Math.round(s.len)).sort().join() === '350,400', r && JSON.stringify(r.sides.map(s => s.len)));
    }

    {   // robustness of the plan sheet, on a small scene built with the kit
      const mk = column => {
        const k = require('./scene-kit').createScene(), C = [200, 200, 200, 255];
        k.box('/Floor', C, -10, -10, -4, 410, 360, 0);
        k.wall('/West', C, [-10, -10, 0, 360], 260); k.wall('/North', C, [0, 350, 400, 360], 260); k.wall('/East', C, [400, -10, 410, 360], 260);
        k.wall('/South', C, [-10, -10, 410, 0], 260, [{ from: 100, to: 190, head: 210 }]);
        if (column) k.box('/Column', C, 300, 200, 0, 330, 230, 300);       // ungrouped, taller than the walls
        return JSON.parse(JSON.stringify({ items: k.items }));
      };
      ok('plan: a room with a door has 1 closed room', buildPlan(mk(false), new Set(), {}).rooms.length === 1);
      ok('plan: a column taller than the walls does not open the doors (still 1 room)', buildPlan(mk(true), new Set(), {}).rooms.length === 1);
      {   // 270 cm walls with a window whose head is 255 cm: only 15 cm under the top
        const k = require('./scene-kit').createScene(), C = [200, 200, 200, 255];
        k.box('/Floor', C, -10, -10, -4, 410, 360, 0);
        k.wall('/West', C, [-10, -10, 0, 360], 270); k.wall('/North', C, [0, 350, 400, 360], 270); k.wall('/South', C, [-10, -10, 410, 0], 270);
        k.wall('/East', C, [400, -10, 410, 360], 270, [{ from: 100, to: 250, head: 255 }]);
        ok('plan: a window ending 15 cm under the wall top still leaves a closed room', buildPlan(JSON.parse(JSON.stringify({ items: k.items })), new Set(), {}).rooms.length === 1);
      }
      const warn0 = console.warn; console.warn = () => {};
      let threw = false, bp; try { bp = buildPlan(mk(false), new Set(), { rooms: [{ name: 'x' }, { name: { x: 1 }, at: [200, 175] }, { name: 'ok', at: [200, 175] }] }); } catch { threw = true; }
      console.warn = warn0;
      ok('plan: a "rooms" entry without "at" or with a non-text name is skipped, the others still name their room', !threw && bp.rooms.length === 1 && bp.rooms[0].name === 'ok');
    }

    section('helpers and skills');
    {
      const k = require('./scene-kit').createScene();
      k.wall('/W', [1, 2, 3], [0, 0, 400, 10], 260, [{ from: 100, to: 190 }, { from: 250, to: 330, sill: 90, head: 220 }]);
      ok('kit.wall: segments, sill and lintel pieces for a door and a window', k.items.map(i => i.n).join() === '/W_Seg1,/W_Lintel1,/W_Seg2,/W_Sill2,/W_Lintel2,/W_Seg3', k.items.map(i => i.n).join());
      let threw = false; try { k.wall('/X', [1, 2, 3], [0, 0, 400, 10], 260, [{ from: 100, to: 190 }, { from: 150, to: 200 }]); } catch { threw = true; }
      ok('kit.wall refuses overlapping openings', threw);
      k.light({ p: [10, 10, 100], i: 100 }); k.light({ p: [10, 10, 100], g: 'lamps' });
      ok('kit.light adds no default group, only the one passed', k.lights[0].g === undefined && k.lights[1].g === 'lamps');
    }
    if (ids.includes('camera-test')) {
      const r = spawnSync(process.execPath, [path.join(__dirname, 'plan-report.mjs'), 'camera-test', '--json'], { cwd: ROOT, encoding: 'utf8' });
      let j = {}; try { j = JSON.parse(r.stdout); } catch {}
      ok('plan-report.mjs camera-test --json lists "Bedroom", 14 m2', r.status === 0 && j.rooms?.[0]?.name === 'Bedroom' && Math.abs(j.rooms[0].area_m2 - 14) < 0.05, r.stderr);
    }
    {
      let mcp = {}; try { mcp = JSON.parse(fs.readFileSync(path.join(ROOT, '.mcp.json'), 'utf8')); } catch {}
      const sk = mcp.mcpServers?.sketchup;
      ok('.mcp.json declares the "sketchup" http server (tools are named mcp__sketchup__*)', sk?.type === 'http' && /^https:\/\/api\.sketchup\.com\//.test(sk.url || ''));
    }
    const skillsDir = path.join(ROOT, '.claude/skills');
    const skills = fs.existsSync(skillsDir) ? fs.readdirSync(skillsDir).filter(d => fs.existsSync(path.join(skillsDir, d, 'SKILL.md'))) : [];
    ok(`skills present (${skills.join(', ')})`, ['bootstrap-new-project', 'import-floor-plan', 'add-furniture', 'check-and-publish'].every(n => skills.includes(n)));
    for (const name of skills) {
      const txt = fs.readFileSync(path.join(skillsDir, name, 'SKILL.md'), 'utf8'), fm = (txt.match(/^---\n([\s\S]*?)\n---\n/) || [])[1] || '';
      const desc = (fm.match(/^description:\s*(.+)$/m) || [])[1] || '';
      ok(`skill ${name}: front matter has name = folder and a description`, new RegExp(`^name:\\s*${name}\\s*$`, 'm').test(fm) && desc.length > 40 && desc.length <= 1024 && !/TODO|TBD/.test(txt));
    }
    {   // the bootstrap template, filled in, writes a valid scene with one closed room of the requested size
      const tpl = fs.readFileSync(path.join(skillsDir, 'bootstrap-new-project/room-template.js'), 'utf8')
        .replace(/__TITLE__/g, 'Template test').replace(/__ID__/g, 'template-test').replace('__W__', '450').replace('__D__', '320').replace('__H__', '270')
        .replace("require('../../scripts/scene-kit')", `require(${JSON.stringify(path.join(__dirname, 'scene-kit.js'))})`);
      const gen = path.join(TMP, 'room.js'), out = path.join(TMP, 'template-scene.json');
      fs.writeFileSync(gen, tpl);
      const r = spawnSync(process.execPath, [gen, out], { cwd: ROOT, encoding: 'utf8' });
      let room; if (r.status === 0) room = buildPlan(JSON.parse(fs.readFileSync(out, 'utf8')), new Set(), { rooms: [{ name: 'Room', at: [225, 160] }] }).rooms[0];
      ok('bootstrap template: generates a closed 450 x 320 cm room named "Room"', !!room && room.name === 'Room' && room.sides.map(x => Math.round(x.len)).sort().join() === '320,450', r.stderr);
    }

    section('i18n (public/i18n.mjs)');
    {
      const { DICTS, LANGS } = await import(pathToFileURL(path.join(ROOT, 'public/i18n.mjs')).href);
      const keys = l => Object.keys(DICTS[l]).sort(), params = x => (x.match(/\{(\w+)\}/g) || []).sort().join();
      ok(`i18n: ${LANGS.join(' and ')} have exactly the same keys`, LANGS.every(l => keys(l).join() === keys('en').join()), LANGS.map(l => keys('en').filter(k => !(k in DICTS[l])).join()).join(' / '));
      const bad = keys('en').filter(k => LANGS.some(l => !DICTS[l][k] || params(DICTS[l][k]) !== params(DICTS.en[k])));
      ok('i18n: no empty string and the same {params} in every language', bad.length === 0, bad.join(', '));
      const used = new Set(['p.bar.one', 'p.bar.many', 'p.landscape', 'p.portrait', ...['Saved', 'Iso', 'Iso 2', 'Front', 'Back', 'Left', 'Right', 'Top', 'Interior'].map(n => 'view.' + n)]);   // keys built at run time
      for (const f of ['index.html', 'viewer.html', 'plan.mjs']) {
        const src = fs.readFileSync(path.join(ROOT, 'public', f), 'utf8');
        for (const m of src.matchAll(/\bt\('([^']+)'/g)) if (!m[1].endsWith('.')) used.add(m[1]);   // 'view.' + name and 'p.' + orient are covered above
        for (const m of src.matchAll(/data-i18n(?:-title|-aria|-html)?="([^"]+)"/g)) used.add(m[1]);
      }
      const missing = [...used].filter(k => !(k in DICTS.en));
      ok('i18n: every key used by the UI exists in the dictionary', missing.length === 0, missing.join(', '));
      const unused = keys('en').filter(k => !used.has(k));
      if (unused.length) warn('i18n: keys never used: ' + unused.join(', '));
    }

    section('static build');
    const dist = path.join(TMP, 'dist');
    const b = spawnSync(process.execPath, [path.join(__dirname, 'build-static.js'), '--no-thumbs'], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, SKP_DIST: dist } });
    ok('build-static.js --no-thumbs exits 0', b.status === 0, b.stderr.split('\n')[0]);
    const has = f => fs.existsSync(path.join(dist, f));
    ok('dist has index.html, projects.json, plan.mjs, i18n.mjs, licence texts, fonts, three, _headers', ['index.html', 'projects.json', 'plan.mjs', 'i18n.mjs', 'licenses/three.txt', 'licenses/oidn-weights.txt', 'fonts/geist.woff2', 'fonts/geist-mono.woff2', 'three/build/three.module.js', '_headers'].every(has));
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
    const raw = reqPath => new Promise(res => { const c = net.connect(port, '127.0.0.1', () => c.write(`GET ${reqPath} HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n`)); let b = ''; c.on('data', d => b += d); c.on('end', () => res({ status: +(b.match(/^HTTP\/1\.1 (\d+)/) || [])[1], body: b })); c.on('error', () => res({ status: 0, body: '' })); });
    const traversal = ['/three/../../server.js', '/three/..%2f..%2fserver.js', '/vendor/../../server.js', '/vendor/..%2f..%2fserver.js', '/fonts/../server.js', `/${ids[0]}/textures/../../server.js`, `/${ids[0]}/textures/..%2f..%2fserver.js`, '/..%2fserver.js', '/%2e%2e/server.js'];
    const bad = []; for (const tp of traversal) { const r = await raw(tp); if (![403, 404].includes(r.status) || /createServer/.test(r.body)) bad.push(`${tp} -> ${r.status}`); }
    ok(`path traversal is refused on the wire (${traversal.length} variants, raw socket)`, bad.length === 0, bad.join('; '));
    ok('unknown project and path traversal are refused', (await get('/nope/')).status === 404 && [403, 404].includes((await get(`/${ids[0]}/..%2f..%2fserver.js`)).status));
    ok('/plan.mjs, /i18n.mjs and /<id>/project.json are served', (await get('/plan.mjs')).status === 200 && (await get('/i18n.mjs')).status === 200 && (await get(`/${ids[0]}/project.json`)).status === (fs.existsSync(path.join(PROJECTS, ids[0], 'project.json')) ? 200 : 404));
    ok('fonts and shared libs are served', (await get('/fonts/geist.woff2')).status === 200 && (await get('/three/build/three.module.js')).status === 200 && (await get('/vendor/oidn-weights/rt_hdr_alb_nrm_small.tza')).status === 200);

    // a second server on a throw-away projects folder: hostile names, a broken project.json and two projects to touch
    const fxDir = path.join(TMP, 'fx-projects'), fxBox = name => ({ n: name, c: [200, 160, 120, 255], box: [-20, -20, 0, 20, 20, 40] });
    const fxScene = items => JSON.stringify({ units: 'inches', camera: { eye: [60, -60, 40], target: [0, 0, 8], up: [0, 0, 1], fov: 35 }, items });
    fs.mkdirSync(path.join(fxDir, 'xss'), { recursive: true });
    fs.writeFileSync(path.join(fxDir, 'xss/scene.json'), fxScene([fxBox('/Room/<img src=x onerror=window.__xss=1>/Table')]));
    fs.writeFileSync(path.join(fxDir, 'xss/project.json'), JSON.stringify({ title: '<b>bold</b> title', description: '<i>x</i>', rooms: [{ name: 'no position' }] }));
    fs.mkdirSync(path.join(fxDir, 'em'), { recursive: true });
    fs.writeFileSync(path.join(fxDir, 'em/scene.json'), JSON.stringify({ units: 'inches', camera: { eye: [0, -120, 20], target: [0, 0, 10], up: [0, 0, 1], fov: 35 }, items: [
      { n: '/Plain', c: [255, 200, 100, 255], box: [-30, -10, 0, -10, 10, 20] }, { n: '/Glow', c: [255, 200, 100, 255], em: 1, box: [10, -10, 0, 30, 10, 20] }] }));
    for (const n of ['a', 'b']) { fs.mkdirSync(path.join(fxDir, n), { recursive: true }); fs.copyFileSync(path.join(PROJECTS, ids[0], 'scene.json'), path.join(fxDir, n, 'scene.json')); }
    const fxPort = await freePort(), fxBase = `http://127.0.0.1:${fxPort}`;
    fxServer = spawn(process.execPath, [path.join(ROOT, 'server.js'), String(fxPort)], { cwd: ROOT, env: { ...process.env, PROJECTS_DIR: fxDir }, stdio: ['ignore', 'pipe', 'pipe'] });
    await new Promise((res, rej) => { fxServer.stdout.on('data', d => /Open http/.test(d) && res()); fxServer.on('exit', c => rej(new Error('fixture server exited ' + c))); setTimeout(() => rej(new Error('fixture server did not start')), 8000); });
    ok('PROJECTS_DIR serves another folder (4 fixture projects)', (await (await fetch(fxBase + '/projects.json')).json()).length === 4);

    section('browser');
    let chromium; try { ({ chromium } = require('playwright-core')); } catch {}
    const exe = findChrome();
    if (!chromium || !exe) warn('no Chrome / playwright-core: browser checks skipped (set CHROME_PATH)');
    else {
      const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
      const open = async (url, w = 1300, h = 800, origin = base) => {
        const p = await browser.newPage({ viewport: { width: w, height: h }, locale: 'en-US' });   // the tests read English labels; Italian is checked on its own below
        p.errors = [];
        p.on('pageerror', e => p.errors.push('pageerror: ' + e.message));
        p.on('console', m => m.type() === 'error' && p.errors.push('console: ' + m.text()));
        p.on('response', r => r.status() >= 400 && !/favicon/.test(r.url()) && p.errors.push(`HTTP ${r.status()} ${r.url()}`));
        await p.goto(origin + url, { waitUntil: 'networkidle' });
        return p;
      };
      const loaded = p => p.waitForFunction(() => /objects|oggetti/.test(document.getElementById('status').textContent), null, { timeout: 120000 });

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
        // implicit "Removed elements" group
        if (scene.items.some(i => /Rimosso|Removed/.test(i.n) && !i.g)) ok(`${id}: "Removed elements" group exists and is off`, (await p.locator('#groups label', { hasText: 'Removed elements' }).count()) === 1 && !(await p.locator('#groups label', { hasText: 'Removed elements' }).locator('input').isChecked()));
        await p.close();
      }

      {   // UI language: ?lang=it, the Italian toolbar still fits, the switch in the gear menu saves the choice
        const hl = await open('/?lang=it'); await hl.waitForSelector('a.card');
        ok('i18n: ?lang=it shows the project list in Italian', (await hl.textContent('h1')) === 'Progetti' && (await hl.$eval('html', e => e.lang)) === 'it');
        await hl.close();
        const it = await open(`/${ids[0]}/?lang=it`); await loaded(it);
        ok('i18n: ?lang=it shows the toolbar in Italian', (await it.textContent('#fpbtn')) === 'Prima persona' && (await it.textContent('#planbtn')) === 'Pianta' && (await it.$eval('html', e => e.lang)) === 'it' && !it.errors.length, it.errors.join('; '));
        const up = await open(`/${ids[0]}/?lang=IT`); await loaded(up);
        ok('i18n: ?lang=IT (upper case) is understood', (await up.textContent('#fpbtn')) === 'Prima persona'); await up.close();
        const right = await it.$eval('#bar', e => e.getBoundingClientRect().right);
        ok('i18n: the Italian toolbar fits the window', right < 1300 - 8, 'right edge ' + Math.round(right));
        await it.click('#setBtn'); await it.click('#langrow button[data-lang="en"]'); await loaded(it);
        ok('i18n: the gear-menu switch changes the language and saves it', (await it.textContent('#fpbtn')) === 'First person' && (await it.evaluate(() => localStorage.getItem('lang'))) === 'en' && !/[?&]lang=/.test(it.url()));
        await it.close();
      }

      {   // shortcuts, menus, groups, phones (read-only against the real projects)
        const p = await open(`/${ids[0]}/`); await loaded(p);
        await p.keyboard.press('n'); const nightOn = await p.$eval('#nightbtn', e => e.classList.contains('active')); await p.keyboard.press('n');
        ok('keys: plain N toggles Night (positive control) and the button says aria-pressed', nightOn && (await p.getAttribute('#nightbtn', 'aria-pressed')) === 'false');
        await p.keyboard.press('Control+n'); await p.keyboard.press('Meta+f');
        ok('keys: browser chords (Ctrl+N, Cmd+F) do not trigger viewer shortcuts', !(await p.$eval('#nightbtn', e => e.classList.contains('active'))) && !(await p.evaluate(() => window.fpState && window.fpState())));
        {   // Shift + W flies faster in orbit mode: no errors, and the camera really moves (the URL keeps ?cam after the key is released)
          const before = new URL(p.url()).searchParams.get('cam'), nErr = p.errors.length;
          await p.keyboard.down('Shift'); await p.keyboard.down('w'); await p.waitForTimeout(500); await p.keyboard.up('w'); await p.keyboard.up('Shift'); await p.waitForTimeout(200);
          const after = new URL(p.url()).searchParams.get('cam');
          ok('keys: Shift + W moves the camera in orbit mode without errors', p.errors.length === nErr && !!after && after !== before, p.errors.slice(nErr).join('; '));
        }
        await p.click('#camBtn'); await p.keyboard.press('Escape');
        ok('keys: Esc folds the camera dropdown', !(await p.isVisible('#views')));
        if (JSON.parse(fs.readFileSync(path.join(PROJECTS, ids[0], 'scene.json'), 'utf8')).groups?.some(g => g.on)) {
          await p.click('#gbtn'); await p.click('#groups .acts button >> nth=1'); await p.waitForTimeout(300);
          await p.reload({ waitUntil: 'networkidle' }); await loaded(p);
          ok('groups: "All off" survives a reload when the scene has default-on groups', (await p.textContent('#gbtn')) === 'Groups');
        }
        await p.click('#gbtn');
        if (await p.locator('#groups label input').count()) {
          await p.locator('#groups label input').first().focus(); await p.keyboard.press('Space');
          ok('groups: Space on a checkbox toggles the group and keeps the focus on it', (await p.evaluate(() => document.activeElement && document.activeElement.type)) === 'checkbox');
        }
        const head = p.locator('#groups h4.cat').first(); await head.focus(); await p.keyboard.press('Enter');
        ok('groups: a category header folds from the keyboard (aria-expanded)', (await p.locator('#groups h4.cat').first().getAttribute('aria-expanded')) === 'false');
        await p.close();
        for (const lang of ['en', 'it']) {
          const m = await open(`/${ids[0]}/?lang=${lang}`, 390, 844); await loaded(m); await m.click('#morebtn'); await m.waitForTimeout(300);
          const box = await m.$$eval('#views button', bs => ({ n: bs.length, minW: Math.min(...bs.map(b => b.getBoundingClientRect().width)), right: Math.max(...bs.map(b => b.getBoundingClientRect().right)) }));
          ok(`mobile (390 px, ${lang}): every camera view button is visible and inside the window`, box.n === 9 && box.minW > 20 && box.right <= 390, JSON.stringify(box));
          await m.close();
        }
      }

      {   // hostile project data and broken metadata (fixture server)
        const hl = await open('/', 1300, 800, fxBase); await hl.waitForSelector('a.card');
        ok('xss: project titles and descriptions are shown as text on the list', (await hl.$$eval('a.card h2', h => h.map(x => x.textContent))).includes('<b>bold</b> title') && (await hl.$$eval('a.card h2 b, a.card p i', e => e.length)) === 0);
        await hl.close();
        const x = await open('/xss/', 1300, 800, fxBase); await loaded(x);
        await x.mouse.move(650, 400); await x.waitForTimeout(500);
        ok('xss: the hover tooltip shows an item name as text, not as HTML', (await x.isVisible('#tip')) && (await x.$$eval('#tip img', i => i.length)) === 0 && /<img/.test(await x.textContent('#tip')) && (await x.evaluate(() => window.__xss)) === undefined);
        await x.click('#planbtn'); await x.waitForSelector('#plan');
        ok('plan: a project.json "rooms" entry without "at" does not break the Plan button', !x.errors.length, x.errors.join('; '));
        await x.close();
      }

      {   // night mode: an "em" item glows, a plain one does not (mean brightness of the pixels where each box is drawn)
        const g = await open('/em/?night=1', 1300, 800, fxBase); await loaded(g); await g.waitForTimeout(800);
        const helper = await browser.newPage();
        const lum = async x => { const b64 = (await g.screenshot({ clip: { x: x - 8, y: 392, width: 16, height: 16 } })).toString('base64');
          return helper.evaluate(async d => { const im = new Image(); im.src = 'data:image/png;base64,' + d; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const p = x.getImageData(0, 0, im.width, im.height).data; let s = 0; for (let i = 0; i < p.length; i += 4) s += p[i] + p[i + 1] + p[i + 2]; return s / (p.length / 4 * 3); }, b64); };
        const plain = await lum(436), glow = await lum(864);
        ok('night: an "em" item glows and a plain one stays dark', glow > plain + 40, `plain ${plain.toFixed(0)}, glow ${glow.toFixed(0)}`);
        await helper.close(); await g.close();
      }

      {   // reload events reach only the viewers of the changed project (fixture copies: the real files are never touched)
        const pages = [];
        for (const id of ['a', 'b']) {
          const p = await open(`/${id}/`, 1300, 800, fxBase); await loaded(p);
          await p.evaluate(() => { window.__r = 0; new EventSource('events').addEventListener('reload', () => window.__r++); });
          pages.push(p);
        }
        await pages[0].waitForTimeout(600);
        const f = path.join(fxDir, 'a/scene.json'); fs.writeFileSync(f, fs.readFileSync(f));   // same bytes: only the mtime changes
        await pages[0].waitForTimeout(2000);
        const r = await Promise.all(pages.map(p => p.evaluate(() => window.__r)));
        ok('touching one project reloads its viewer and not the other one', r[0] >= 1 && r[1] === 0, JSON.stringify(r));
        for (const p of pages) await p.close();
      }
      await browser.close();
    }
  } catch (e) {
    fails++; console.log('  FAIL unexpected error —', e.stack || e);
  } finally {
    if (server) server.kill();
    if (fxServer) fxServer.kill();
    fs.rmSync(TMP, { recursive: true, force: true });
  }
  console.log(`\n${fails ? 'FAILED' : 'passed'}: ${fails} failure(s), ${warns} warning(s)`);
  process.exit(fails ? 1 : 0);
})();
