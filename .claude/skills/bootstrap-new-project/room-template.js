// __TITLE__: generator of projects/__ID__/scene.json. All measures in cm (x right, y up in the plan, z up); the output is in inches.
// Usage: node projects/__ID__/room.js [output_file]   (default: rewrites scene.json next to this file)
// The helpers (box, wall, group, defGroup, camera, spawn, ceiling, write...) come from scripts/scene-kit.js.
// Keep the tag of every number up to date: "measured" = taken with a tape or read on a drawing, "estimate" = guessed.
const path = require('path');
const kit = require('../../scripts/scene-kit').createScene({ defaultOn: [] });   // ids of the groups that start switched on
const { box, wall } = kit;

// ---------- dimensions (cm) ----------
const W = __W__, D = __D__, H = __H__;                          // interior width (x), depth (y), height                          estimate
const T = 10;                                                    // wall thickness                                                 estimate
const DOOR = { from: 100, to: 190, head: 210 };                  // south wall, x range of the opening and its height              estimate
const WINDOW = { from: 120, to: 260, sill: 90, head: 220 };      // east wall, y range, sill and head heights                     estimate

const C = { wall: [236, 233, 228, 255], floor: [190, 158, 122, 255], glass: [170, 205, 225, 80] };

// ---------- shell: the interior is x 0..W, y 0..D ----------
box('/Room/Floor', C.floor, -T, -T, -4, W + T, D + T, 0);
wall('/Room/Wall_West', C.wall, [-T, -T, 0, D + T], H);
wall('/Room/Wall_North', C.wall, [0, D, W, D + T], H);
wall('/Room/Wall_South', C.wall, [-T, -T, W + T, 0], H, [DOOR]);
wall('/Room/Wall_East', C.wall, [W, -T, W + T, D + T], H, [WINDOW]);
box('/Room/Window_Glass', C.glass, W + 4, WINDOW.from, WINDOW.sill, W + 6, WINDOW.to, WINDOW.head);   // glass: alpha < 255, so the plan sheet ignores it

// ---------- furniture goes in groups (see the add-furniture skill) ----------
// kit.defGroup('bed', 'Bed', 'Furniture');
// kit.group('bed', () => { box('/Room/Bed/Frame', [176, 140, 98, 255], 120, 150, 12, 280, 350, 32); });

const out = process.argv[2] || path.join(__dirname, 'scene.json');
kit.write(out, {
  camera: kit.camera([W * 1.6, -D * 1.1, Math.max(W, D) * 2.4], [W / 2, D / 2, 40]),
  spawn: kit.spawn([(DOOR.from + DOOR.to) / 2, 40], 90),         // first person starts just inside the door, looking north
  ceiling: kit.ceiling([[0, 0], [W, 0], [W, D], [0, D]], H, H + 2),
});
console.log('wrote', path.relative(process.cwd(), out), '-', kit.items.length, 'items');
