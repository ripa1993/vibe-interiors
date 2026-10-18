// "Pianta": top view of the walls only, with the interior measures of every closed room, as a vector sheet (SVG) that can be printed or downloaded.
//   buildPlan(data, enabled, meta)  pure geometry (also imported by scripts/smoke.js in Node): walls at SLICE_Z, rooms found by flood fill
//   planSvg(plan, opts)             the SVG sheet (cm in the viewBox, physical size in mm at a standard scale)
//   openPlan({...})                 full-screen overlay with paper choice, Stampa (browser print / PDF), SVG and PNG download
//
// How it works
//  - walls = `box` and `slab` items with no group (the fixed shell) that cross the cut height SLICE_Z (100 cm, so doors and windows show as gaps);
//    items of the implicit group "rimossi" (walls to be demolished) count only while that group is on and are drawn dashed; glass (alpha < 255) is skipped.
//    `faces` meshes (arches, SketchUp-exported walls that are not boxes) are NOT used: unverified for scenes exported from SketchUp.
//  - rooms = closed empty regions of a 1 cm grid cut just under the top of the walls (doors and windows are closed by their lintels there),
//    traced to a polygon, simplified and snapped to the exact wall coordinates; every side >= MIN_SIDE is dimensioned, plus the net area.
//  - names come from project.json  "rooms": [{"name": "Camera", "at": [x, y]}]  (cm, a point inside the room); unnamed rooms are "Stanza N".
const CELL = 1, SLICE_Z = 100, MIN_AREA = 0.8, MIN_SIDE = 30, IN = 2.54, SNAP = 2.5;
const REMOVED = 'rimossi';
const SCALES = [20, 25, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500];
const PAPERS = { a4: [297, 210], a3: [420, 297] };

// ---------------------------------------------------------------- geometry
function shapesAt(data, enabled, z) {
  const out = [];
  for (const it of data.items) {
    if (!(it.box || it.slab)) continue;
    if (it.c && it.c[3] < 255) continue;                                  // glass
    const gs = [].concat(it.g || []);
    const removed = gs.includes(REMOVED) || (!gs.length && /Rimosso/.test(it.n));
    if (!removed && gs.length) continue;                                  // furniture and other groups
    if (removed && !enabled.has(REMOVED)) continue;
    if (it.box) {
      const b = it.box.map(v => v * IN);
      if (b[2] <= z && b[5] >= z) out.push({ pts: [[b[0], b[1]], [b[3], b[1]], [b[3], b[4]], [b[0], b[4]]], holes: [], top: b[5], removed });
    } else {
      const { o, h = [], z: zz } = it.slab, z0 = zz[0] * IN, z1 = zz[1] * IN;
      if (z0 <= z && z1 >= z) out.push({ pts: o.map(p => [p[0] * IN, p[1] * IN]), holes: h.map(l => l.map(p => [p[0] * IN, p[1] * IN])), top: z1, removed });
    }
  }
  return out;
}

const inPoly = (o, x, y) => { let c = false; for (let a = 0, b = o.length - 1; a < o.length; b = a++) if ((o[a][1] > y) !== (o[b][1] > y) && x < (o[b][0] - o[a][0]) * (y - o[a][1]) / (o[b][1] - o[a][1]) + o[a][0]) c = !c; return c; };
const bboxOf = pts => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return { x0, y0, x1, y1 }; };

function perp(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
  return l ? Math.abs(dx * (p[1] - a[1]) - dy * (p[0] - a[0])) / l : Math.hypot(p[0] - a[0], p[1] - a[1]);
}
function dp(pts, tol) {
  if (pts.length < 3) return pts;
  let idx = 0, dmax = 0;
  for (let i = 1; i < pts.length - 1; i++) { const d = perp(pts[i], pts[0], pts[pts.length - 1]); if (d > dmax) { dmax = d; idx = i; } }
  return dmax > tol ? dp(pts.slice(0, idx + 1), tol).slice(0, -1).concat(dp(pts.slice(idx), tol)) : [pts[0], pts[pts.length - 1]];
}
function simplifyClosed(pts, tol) {
  let far = 0, dm = -1;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]); if (d > dm) { dm = d; far = i; } }
  return dp(pts.slice(0, far + 1), tol).slice(0, -1).concat(dp(pts.slice(far).concat([pts[0]]), tol).slice(0, -1));
}
function dropCollinear(pts, eps = 1e-6) {
  let cur = pts, changed = true;
  while (changed && cur.length > 3) {
    changed = false; const keep = [];
    for (let i = 0; i < cur.length; i++) {
      const a = cur[(i + cur.length - 1) % cur.length], b = cur[i], c = cur[(i + 1) % cur.length];
      if (Math.abs((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])) <= eps || (a[0] === b[0] && a[1] === b[1])) changed = true; else keep.push(b);
    }
    cur = keep;
  }
  return cur;
}

// outer boundary of the cells labelled `id` as grid-corner vertices, interior on the left (counter-clockwise)
function traceOuter(lab, W, H, id, bb) {
  const next = new Map(), key = (i, j) => j * (W + 1) + i;
  const add = (ai, aj, bi, bj) => { const k = key(ai, aj), e = [bi, bj], a = next.get(k); a ? a.push(e) : next.set(k, [e]); };
  for (let j = bb.j0; j <= bb.j1; j++) for (let i = bb.i0; i <= bb.i1; i++) {
    if (lab[j * W + i] !== id) continue;
    if (j === 0 || lab[(j - 1) * W + i] !== id) add(i, j, i + 1, j);
    if (i === W - 1 || lab[j * W + i + 1] !== id) add(i + 1, j, i + 1, j + 1);
    if (j === H - 1 || lab[(j + 1) * W + i] !== id) add(i + 1, j + 1, i, j + 1);
    if (i === 0 || lab[j * W + i - 1] !== id) add(i, j + 1, i, j);
  }
  let best = null, bestA = 0;
  while (next.size) {
    const k0 = next.keys().next().value, start = [k0 % (W + 1), Math.floor(k0 / (W + 1))], loop = [];
    let cur = start;
    do {
      loop.push(cur);
      const k = key(cur[0], cur[1]), arr = next.get(k);
      if (!arr) break;
      const e = arr.pop(); if (!arr.length) next.delete(k);
      cur = e;
    } while (cur[0] !== start[0] || cur[1] !== start[1]);
    let a = 0; for (let i = 0; i < loop.length; i++) { const p = loop[i], q = loop[(i + 1) % loop.length]; a += p[0] * q[1] - q[0] * p[1]; }
    if (a > bestA) { bestA = a; best = loop; }
  }
  return best;
}

export function buildPlan(data, enabled = new Set(), meta = {}) {
  const walls = shapesAt(data, enabled, SLICE_Z);
  if (!walls.length) return { walls: [], rooms: [], bounds: null };
  const top = Math.max(...walls.map(w => w.top)), roomZ = top - 20;
  const solid = shapesAt(data, enabled, roomZ);
  const all = walls.concat(solid), allPts = all.flatMap(s => s.pts);
  const bb = bboxOf(allPts), gx0 = bb.x0 - 20, gy0 = bb.y0 - 20;
  const W = Math.ceil((bb.x1 - bb.x0 + 40) / CELL), H = Math.ceil((bb.y1 - bb.y0 + 40) / CELL);
  const g = new Uint8Array(W * H);                                         // 1 = wall at roomZ
  for (const s of solid) {
    const sb = bboxOf(s.pts), isRect = s.pts.length === 4 && !s.holes.length && s.pts.every(p => (p[0] === sb.x0 || p[0] === sb.x1) && (p[1] === sb.y0 || p[1] === sb.y1));
    const i0 = Math.max(0, Math.ceil((sb.x0 - gx0) / CELL - 0.5)), i1 = Math.min(W - 1, Math.floor((sb.x1 - gx0) / CELL - 0.5));
    const j0 = Math.max(0, Math.ceil((sb.y0 - gy0) / CELL - 0.5)), j1 = Math.min(H - 1, Math.floor((sb.y1 - gy0) / CELL - 0.5));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const x = gx0 + (i + 0.5) * CELL, y = gy0 + (j + 0.5) * CELL;
      if (isRect || (inPoly(s.pts, x, y) && !s.holes.some(h => inPoly(h, x, y)))) g[j * W + i] = 1;
    }
  }
  // closed regions
  const lab = new Int32Array(W * H), queue = new Int32Array(W * H), regions = [];
  for (let st = 0; st < W * H; st++) {
    if (g[st] || lab[st]) continue;
    const id = regions.length + 1; let qh = 0, qt = 0; queue[qt++] = st; lab[st] = id;
    const r = { id, cells: 0, sx: 0, sy: 0, i0: W, j0: H, i1: 0, j1: 0, border: false };
    while (qh < qt) {
      const c = queue[qh++], i = c % W, j = (c / W) | 0;
      r.cells++; r.sx += i; r.sy += j;
      if (i < r.i0) r.i0 = i; if (i > r.i1) r.i1 = i; if (j < r.j0) r.j0 = j; if (j > r.j1) r.j1 = j;
      if (i === 0 || j === 0 || i === W - 1 || j === H - 1) r.border = true;
      if (i + 1 < W && !g[c + 1] && !lab[c + 1]) { lab[c + 1] = id; queue[qt++] = c + 1; }
      if (i > 0 && !g[c - 1] && !lab[c - 1]) { lab[c - 1] = id; queue[qt++] = c - 1; }
      if (j + 1 < H && !g[c + W] && !lab[c + W]) { lab[c + W] = id; queue[qt++] = c + W; }
      if (j > 0 && !g[c - W] && !lab[c - W]) { lab[c - W] = id; queue[qt++] = c - W; }
    }
    regions.push(r);
  }
  // names from project.json
  const named = new Map();
  for (const rm of meta.rooms || []) {
    const i = Math.floor((rm.at[0] - gx0) / CELL), j = Math.floor((rm.at[1] - gy0) / CELL);
    const id = i >= 0 && j >= 0 && i < W && j < H ? lab[j * W + i] : 0;
    if (id && !regions[id - 1].border) named.set(id, rm.name);
    else if (typeof console !== 'undefined') console.warn(`plan: room "${rm.name}" at [${rm.at}] is not inside a closed room`);
  }
  // exact coordinates to snap the traced corners to
  const xs = [...new Set(all.flatMap(s => s.pts.map(p => p[0])))], ys = [...new Set(all.flatMap(s => s.pts.map(p => p[1])))];
  const snap = (v, list) => { let b = v, d = SNAP; for (const c of list) if (Math.abs(c - v) < d) { d = Math.abs(c - v); b = c; } return b; };

  const rooms = []; let n = 0;
  for (const r of regions.filter(r => !r.border).sort((a, b) => b.cells - a.cells)) {
    const area = r.cells * CELL * CELL / 1e4, name = named.get(r.id);
    if (!name && area < MIN_AREA) continue;
    const loop = traceOuter(lab, W, H, r.id, r);
    if (!loop) continue;
    let poly = dropCollinear(loop.map(([i, j]) => [i, j]));
    poly = dropCollinear(simplifyClosed(poly, 1.5));
    poly = dropCollinear(poly.map(([i, j]) => [snap(gx0 + i * CELL, xs), snap(gy0 + j * CELL, ys)]));
    let cx = gx0 + (r.sx / r.cells + 0.5) * CELL, cy = gy0 + (r.sy / r.cells + 0.5) * CELL;
    const ci = Math.floor((cx - gx0) / CELL), cj = Math.floor((cy - gy0) / CELL);
    if (lab[cj * W + ci] !== r.id) {                                       // centroid outside (L shapes): nearest cell of the room
      let bd = 1e18;
      for (let j = r.j0; j <= r.j1; j++) for (let i = r.i0; i <= r.i1; i++) if (lab[j * W + i] === r.id) { const d = (i - ci) ** 2 + (j - cj) ** 2; if (d < bd) { bd = d; cx = gx0 + (i + 0.5) * CELL; cy = gy0 + (j + 0.5) * CELL; } }
    }
    const edges = poly.map((a, i) => { const b = poly[(i + 1) % poly.length]; return { a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]) }; });
    const rect = poly.length === 4 && edges.every(e => e.a[0] === e.b[0] || e.a[1] === e.b[1]);
    let sides = edges.filter(e => e.len >= MIN_SIDE);
    if (rect) {                                                           // width on the lower side, depth on the left side: the opposite ones say the same
      const lo = edges.filter(e => e.a[1] === e.b[1]).sort((p, q) => p.a[1] - q.a[1])[0], le = edges.filter(e => e.a[0] === e.b[0]).sort((p, q) => p.a[0] - q.a[0])[0];
      sides = [lo, le].filter(Boolean);
    }
    rooms.push({ id: r.id, name: name || `Stanza ${++n}`, named: !!name, poly, edges, sides, rect, area, label: [cx, cy] });
  }
  return { walls, rooms, bounds: bboxOf(walls.flatMap(w => w.pts)), sliceZ: SLICE_Z, roomZ };
}

// ---------------------------------------------------------------- sheet
const fmt = v => v.toLocaleString('it-IT', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Fits the plan on the paper at the smallest standard scale; returns the SVG string and the sheet data
export function planSvg(plan, { paper = 'a4', title = 'Pianta' } = {}) {
  const { bounds: b } = plan, PAD = 25, BAND_MM = 12, MARGIN = 10;
  const bw = b.x1 - b.x0 + 2 * PAD, bh = b.y1 - b.y0 + 2 * PAD;
  let best = null;
  for (const orient of ['landscape', 'portrait']) {
    const [pw, ph] = orient === 'landscape' ? PAPERS[paper] : [PAPERS[paper][1], PAPERS[paper][0]];
    const N = SCALES.find(s => bw * 10 / s <= pw - 2 * MARGIN && bh * 10 / s + BAND_MM <= ph - 2 * MARGIN) || SCALES[SCALES.length - 1];
    if (!best || N < best.N) best = { N, orient, pw, ph };
  }
  const { N } = best, mm = N / 10;                                         // cm per mm of paper
  const band = BAND_MM * mm, vbW = bw, vbH = bh + band, wMm = bw / mm, hMm = vbH / mm;
  const fs = 2.8 * mm, fsRoom = 3.2 * mm, tx = x => x - b.x0 + PAD, ty = y => b.y1 - y + PAD;
  const d = pts => pts.map((p, i) => (i ? 'L' : 'M') + tx(p[0]).toFixed(1) + ' ' + ty(p[1]).toFixed(1)).join('') + 'Z';
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW.toFixed(1)} ${vbH.toFixed(1)}" width="${wMm.toFixed(1)}mm" height="${hMm.toFixed(1)}mm" font-family="Geist, system-ui, -apple-system, Segoe UI, sans-serif">`;
  svg += `<rect width="${vbW.toFixed(1)}" height="${vbH.toFixed(1)}" fill="#fff"/>`;
  for (const w of plan.walls) {
    const path = d(w.pts) + w.holes.map(d).join('');
    svg += w.removed
      ? `<path d="${path}" fill="none" stroke="#b5532a" stroke-width="${(0.3 * mm).toFixed(2)}" stroke-dasharray="${(1.6 * mm).toFixed(1)} ${(1 * mm).toFixed(1)}" fill-rule="evenodd"/>`
      : `<path d="${path}" fill="#2b303b" stroke="#2b303b" stroke-width="${(0.1 * mm).toFixed(2)}" stroke-linejoin="miter" fill-rule="evenodd"/>`;
  }
  const sw = (0.12 * mm).toFixed(2);
  for (const r of plan.rooms) {
    const rb = bboxOf(r.poly), k = Math.max(0.6, Math.min(1, Math.min(rb.x1 - rb.x0, rb.y1 - rb.y0) / (4.6 * fs))), rfs = fs * k, low = Math.min(rb.x1 - rb.x0, rb.y1 - rb.y0) < 5.5 * fs;   // small rooms: smaller type, and a one-line label with the sides closer to the wall, so nothing collides
    for (const e of r.sides) {
      const dx = e.b[0] - e.a[0], dy = e.b[1] - e.a[1], l = e.len, nx = -dy / l, ny = dx / l, off = (low ? 0.7 : 1.1) * rfs;   // inward normal (counter-clockwise polygon)
      const p = [e.a[0] + nx * off, e.a[1] + ny * off], q = [e.b[0] + nx * off, e.b[1] + ny * off];
      const X1 = tx(p[0]), Y1 = ty(p[1]), X2 = tx(q[0]), Y2 = ty(q[1]), tk = 0.45 * rfs, ux = (X2 - X1) / l, uy = (Y2 - Y1) / l;
      svg += `<g stroke="#667085" stroke-width="${sw}"><path d="M${X1.toFixed(1)} ${Y1.toFixed(1)}L${X2.toFixed(1)} ${Y2.toFixed(1)}M${(X1 - uy * tk).toFixed(1)} ${(Y1 + ux * tk).toFixed(1)}L${(X1 + uy * tk).toFixed(1)} ${(Y1 - ux * tk).toFixed(1)}M${(X2 - uy * tk).toFixed(1)} ${(Y2 + ux * tk).toFixed(1)}L${(X2 + uy * tk).toFixed(1)} ${(Y2 - ux * tk).toFixed(1)}"/></g>`;
      let ang = Math.atan2(Y2 - Y1, X2 - X1) * 180 / Math.PI; if (ang > 90) ang -= 180; else if (ang <= -90) ang += 180;
      svg += `<text transform="translate(${((X1 + X2) / 2).toFixed(1)} ${((Y1 + Y2) / 2).toFixed(1)}) rotate(${ang.toFixed(1)})" text-anchor="middle" dominant-baseline="central" font-size="${rfs.toFixed(1)}" fill="#1c2330" stroke="#fff" stroke-width="${(0.9 * mm * k).toFixed(2)}" paint-order="stroke">${Math.round(e.len)}</text>`;
    }
    const lx = tx(r.label[0]), ly = ty(r.label[1]);
    svg += low
      ? `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="${(fsRoom * k).toFixed(1)}" fill="#1c2330" stroke="#fff" stroke-width="${(0.9 * mm * k).toFixed(2)}" paint-order="stroke"><tspan font-weight="600">${esc(r.name)}</tspan><tspan fill="#667085">  ·  ${fmt(Math.round(r.area * 10) / 10)} m²</tspan></text>`
      : `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" fill="#1c2330" stroke="#fff" stroke-width="${(0.9 * mm).toFixed(2)}" paint-order="stroke"><tspan font-size="${(fsRoom * k).toFixed(1)}" font-weight="600">${esc(r.name)}</tspan><tspan x="${lx.toFixed(1)}" dy="${(fsRoom * k * 1.25).toFixed(1)}" font-size="${rfs.toFixed(1)}" fill="#667085">${fmt(Math.round(r.area * 10) / 10)} m²</tspan></text>`;
  }
  const r1 = bh + band * 0.4, r2 = bh + band * 0.8, date = new Date().toLocaleDateString('it-IT');
  svg += `<path d="M0 ${bh.toFixed(1)}H${vbW.toFixed(1)}" stroke="#c9ced8" stroke-width="${sw}"/>`;
  svg += `<text x="${(3 * mm).toFixed(1)}" y="${r1.toFixed(1)}" font-size="${(3.4 * mm).toFixed(1)}" font-weight="600" fill="#1c2330">${esc(title)}</text>`;
  svg += `<text x="${(vbW - 3 * mm).toFixed(1)}" y="${r1.toFixed(1)}" text-anchor="end" font-size="${(3 * mm).toFixed(1)}" fill="#1c2330">Scala 1:${N}</text>`;
  svg += `<text x="${(3 * mm).toFixed(1)}" y="${r2.toFixed(1)}" font-size="${(2.5 * mm).toFixed(1)}" fill="#667085">Pianta, quote interne in cm, taglio a ${plan.sliceZ} cm</text>`;
  svg += `<text x="${(vbW - 3 * mm).toFixed(1)}" y="${r2.toFixed(1)}" text-anchor="end" font-size="${(2.5 * mm).toFixed(1)}" fill="#667085">${paper.toUpperCase()} ${best.orient === 'landscape' ? 'orizzontale' : 'verticale'}  ·  ${date}</text>`;
  svg += '</svg>';
  return { svg, scale: N, orient: best.orient, wMm, hMm, paper };
}

// ---------------------------------------------------------------- overlay (browser only)
export function openPlan({ data, enabled, meta = {}, title = 'Pianta', id = 'progetto' }) {
  document.getElementById('plan')?.remove();
  const plan = buildPlan(data, enabled, meta);
  const el = document.createElement('div');
  el.id = 'plan'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Pianta');
  el.innerHTML = `<style>
    #plan { position: fixed; inset: 0; z-index: 20; background: var(--bg, #f4f5f7); display: flex; flex-direction: column; font: 13px/1.4 var(--sans, system-ui, sans-serif); color: var(--ink, #1c2330); }
    #plan .pbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 10px 14px; background: #fff; border-bottom: 1px solid var(--line, #dfe3ea); }
    #plan .pbar b { font-weight: 600; margin-right: auto; }
    #plan .pbar select { font: inherit; padding: 3px 6px; border: 1px solid var(--line-strong, #c9ced8); border-radius: 6px; background: #fff; }
    #plan .pbody { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; padding: 16px; overflow: auto; }
    #plan .sheet { background: #fff; border: 1px solid var(--line, #dfe3ea); box-shadow: 0 8px 24px rgba(28,35,48,.10); max-width: 100%; max-height: 100%; display: flex; }
    #plan .sheet svg { display: block; width: auto; height: auto; max-width: 100%; max-height: calc(100vh - 110px); }
    #plan .msg { color: var(--muted, #667085); }
    @media print { body > *:not(#plan) { display: none !important; } #plan { position: static; background: #fff; display: block; }
      #plan .pbar { display: none; } #plan .pbody { padding: 0; display: block; overflow: visible; }
      #plan .sheet { border: 0; box-shadow: none; display: block; } #plan .sheet svg { width: var(--w) !important; height: var(--h) !important; max-width: none; max-height: none; } }
  </style>
  <div class="pbar"><b>Pianta · ${plan.rooms.length} ${plan.rooms.length === 1 ? 'stanza' : 'stanze'}</b>
    <label>Foglio <select id="plan-paper"><option value="a4">A4</option><option value="a3">A3</option></select></label>
    <button id="plan-print" title="Apre la stampa del browser: da lì anche Salva come PDF">Stampa</button><button id="plan-svg">Scarica SVG</button><button id="plan-png">Scarica PNG</button><button id="plan-close" title="Chiudi (Esc)">Chiudi</button></div>
  <div class="pbody"><div class="sheet" id="plan-sheet"></div></div>`;
  document.body.appendChild(el);
  const sheet = el.querySelector('#plan-sheet'), pageStyle = document.createElement('style');
  document.head.appendChild(pageStyle);
  let cur = null;
  const render = () => {
    if (!plan.bounds) { sheet.innerHTML = '<p class="msg" style="padding:24px">Nessun muro trovato: servono oggetti <code>box</code> o <code>slab</code> senza gruppo che attraversino i 100 cm di altezza.</p>'; return; }
    cur = planSvg(plan, { paper: el.querySelector('#plan-paper').value, title });
    sheet.innerHTML = cur.svg;
    const s = sheet.querySelector('svg'); s.style.setProperty('--w', cur.wMm.toFixed(1) + 'mm'); s.style.setProperty('--h', cur.hMm.toFixed(1) + 'mm');
    pageStyle.textContent = `@media print { @page { size: ${cur.paper.toUpperCase()} ${cur.orient}; margin: 10mm; } }`;
  };
  const download = (blob, ext) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${id}-pianta-${cur.paper}.${ext}`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
  const close = () => { el.remove(); pageStyle.remove(); document.removeEventListener('keydown', onKey, true); };
  const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } else e.stopPropagation(); };   // the viewer's shortcuts stay quiet while the sheet is open
  document.addEventListener('keydown', onKey, true);
  el.querySelector('#plan-paper').onchange = render;
  el.querySelector('#plan-close').onclick = close;
  el.querySelector('#plan-print').onclick = () => cur && window.print();
  el.querySelector('#plan-svg').onclick = () => cur && download(new Blob([cur.svg], { type: 'image/svg+xml' }), 'svg');
  el.querySelector('#plan-png').onclick = () => {
    if (!cur) return;
    const dpi = 200, w = Math.round(cur.wMm / 25.4 * dpi), h = Math.round(cur.hMm / 25.4 * dpi), img = new Image();
    img.onload = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0, w, h); c.toBlob(b => download(b, 'png'), 'image/png'); };
    img.src = URL.createObjectURL(new Blob([cur.svg.replace(/width="[\d.]+mm" height="[\d.]+mm"/, `width="${w}" height="${h}"`)], { type: 'image/svg+xml' }));   // fonts inside an <img> are system ones
  };
  render();
  el.querySelector('#plan-print').focus();
  return plan;
}
