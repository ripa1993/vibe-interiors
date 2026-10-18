// Prints the rooms the Plan sheet finds in a project: name, net area and the interior sides in cm.
// Usage: node scripts/plan-report.mjs <project-id> [--with-removed] [--json]
//   --with-removed  also counts the walls named ...Removed / ...Rimosso (the "Removed elements" group switched on)
// Handy to compare the model with hand-made measures (see the import-floor-plan skill) without opening the browser.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildPlan } from '../public/plan.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2), id = args.find(a => !a.startsWith('--'));
if (!id) { console.error('usage: node scripts/plan-report.mjs <project-id> [--with-removed] [--json]'); process.exit(2); }
const dir = path.join(ROOT, 'projects', id);
if (!fs.existsSync(path.join(dir, 'scene.json'))) { console.error(`no projects/${id}/scene.json`); process.exit(2); }
const read = f => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch { return {}; } };
const plan = buildPlan(read('scene.json'), new Set(args.includes('--with-removed') ? ['removed'] : []), read('project.json'));

const rooms = plan.rooms.map(r => ({
  name: r.name, named: r.named, area_m2: Math.round(r.area * 100) / 100, rect: r.rect,
  sides_cm: r.sides.map(s => Math.round(s.len)), vertices: r.poly.length,
}));
if (args.includes('--json')) { console.log(JSON.stringify({ project: id, walls: plan.walls.length, rooms }, null, 2)); process.exit(0); }
if (!rooms.length) { console.log(`${id}: ${plan.walls.length} wall shapes, no closed room found (is every room closed by walls, with lintels over the doors?)`); process.exit(0); }
console.log(`${id}: ${plan.walls.length} wall shapes, ${rooms.length} closed room(s), interior sides in cm\n`);
for (const r of rooms) console.log(`${r.name.padEnd(22)} ${r.area_m2.toFixed(2).padStart(7)} m2   ${r.rect ? 'rectangle' : r.vertices + ' corners'}   ${r.sides_cm.join(' x ')}${r.rect ? '   (width x depth)' : ''}`);
