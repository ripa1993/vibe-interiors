// Shared helpers for the generator scripts (projects/<name>/*.js that write a scene.json without SketchUp).
// All inputs are in cm (x = right, y = up in plan, z = height); the output is in inches. See CLAUDE.md "scene.json schema".
//   const kit = require('../../scripts/scene-kit').createScene({ defaultOn: ['id', ...] });
//   const { box, slab, tray, tube, rbox, mesh, group, defGroup, light, items, inch } = kit;
//   ...draw...
//   kit.write(OUT, { camera: kit.camera(eyeCm, targetCm), spawn: kit.spawn([x, y], yawDeg), ceiling: kit.ceiling(polyCm, z0, z1) });
// `items` is the live array: generators may push raw items or patch the last one (e.g. `items[items.length - 1].tex = {...}`).
const fs = require('fs');

function createScene({ defaultOn = [] } = {}) {
  const items = [], GROUPS = [], lights = [];
  const inch = v => +(v / 2.54).toFixed(3);
  const pt = p => p.map(inch);
  const add = item => items.push(item);

  const box = (n, c, x0, y0, z0, x1, y1, z1) => add({ n, c, box: [x0, y0, z0, x1, y1, z1].map(inch) });
  const slab = (n, c, poly, z0, z1, holes = []) => add({ n, c, slab: { o: poly.map(pt), h: holes.map(h => h.map(pt)), z: [inch(z0), inch(z1)] } });
  const tray = (n, c, poly, zFloor, zTop) => add({ n, c, tray: { o: poly.map(pt), z: [inch(zFloor), inch(zTop)] } });
  const tube = (n, c, p, r, seg = 8) => add({ n, c, tube: { p: p.map(pt), r: r.map(inch), n: seg } });
  const rbox = (n, c, b, r, top, bot = 0) => add({ n, c, rbox: { b: b.map(inch), r: inch(r), top: inch(top), bot: inch(bot) } });
  const quad = (a, b, c, d) => [a, b, c, d].map(pt);
  const mesh = (n, c, qs) => add({ n, c, faces: qs.map(q => quad(...q)) });   // item 'faces' from quads in cm (arches and non-axis-aligned shapes)

  // Switchable groups (all off in the viewer unless in `defaultOn`; items without a group are always drawn).
  //   defGroup(id, label, category, [variant])  -> groups with the same `variant` are mutually exclusive
  //   group(id, () => { ...box()/tube()/slab()... })  -> everything drawn inside takes the group `id`
  const defGroup = (id, label, cat, variant) => GROUPS.push(Object.assign({ id, label, cat }, variant ? { variant } : {}, defaultOn.includes(id) ? { on: true } : {}));
  const group = (id, fn) => { const from = items.length; fn(); for (let k = from; k < items.length; k++) items[k].g = id; };
  // Night-mode light source (position in cm; the rest as in the schema: d, a, pen, c, i, r, sh, g)
  const light = d => lights.push(Object.assign({ t: 'spot', g: 'luci' }, d, { p: d.p.map(inch) }));

  const camera = (eye, target, fov = 35) => ({ eye: eye.map(inch), target: target.map(inch), up: [0, 0, 1], fov });
  const spawn = (p, yaw) => ({ p: p.map(inch), yaw });
  const ceiling = (poly, z0, z1) => ({ o: poly.map(pt), z: [inch(z0), inch(z1)] });

  // one item per line, so a diff of scene.json stays readable; keys that are absent are omitted
  function write(out, { camera: cam, spawn: sp, ceiling: ce }) {
    const head = ['"units":"inches"', '"camera":' + JSON.stringify(cam)];
    if (sp) head.push('"spawn":' + JSON.stringify(sp));
    if (ce) head.push('"ceiling":' + JSON.stringify(ce));
    if (lights.length) head.push('"lights":' + JSON.stringify(lights));
    if (GROUPS.length) head.push('"groups":' + JSON.stringify(GROUPS));
    fs.writeFileSync(out, '{' + head.join(',') + ',"items":[\n' + items.map(i => JSON.stringify(i)).join(',\n') + '\n]}\n');
  }

  return { items, GROUPS, lights, inch, box, slab, tray, tube, rbox, quad, mesh, defGroup, group, light, camera, spawn, ceiling, write };
}

module.exports = { createScene };
