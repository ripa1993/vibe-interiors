// Test bedroom (a minimal project to validate the multi-project site): 400 x 350 cm room, door on the south wall, window on the east wall,
// double bed against the north wall, two nightstands, 4-door wardrobe against the west wall. Measures in cm (made up), converted to inches.
// The helpers (box, group, defGroup, camera, write...) come from scripts/scene-kit.js, shared with the other generators.
// Usage: node projects/camera-test/room.js [output_file]   (default: rewrites scene.json next to this file)
const path = require('path');
const kit = require('../../scripts/scene-kit').createScene({ defaultOn: ['bed', 'wardrobe'] });
const { box, group, defGroup } = kit;

const WALL = [236, 233, 228, 255], FLOOR = [190, 158, 122, 255], OAK = [176, 140, 98, 255], WHITE = [228, 225, 218, 255], METAL = [58, 60, 66, 255];
const H = 260, T = 10, W = 400, D = 350;

defGroup('bed', 'Double bed and nightstands', 'Furniture');
defGroup('wardrobe', '4-door wardrobe', 'Furniture');

// floor and walls (the interior is x 0..400, y 0..350)
box('/Room/Floor', FLOOR, -T, -T, -4, W + T, D + T, 0);
box('/Room/Wall_West', WALL, -T, -T, 0, 0, D + T, H);
box('/Room/Wall_North', WALL, 0, D, 0, W, D + T, H);
// south wall with the door (opening 90 x 210, x 100..190)
box('/Room/Wall_South_A', WALL, -T, -T, 0, 100, 0, H);
box('/Room/Wall_South_B', WALL, 190, -T, 0, W + T, 0, H);
box('/Room/Wall_South_Lintel', WALL, 100, -T, 210, 190, 0, H);
// east wall with the window (opening y 120..260, sill 90, lintel 220)
box('/Room/Wall_East_A', WALL, W, -T, 0, W + T, 120, H);
box('/Room/Wall_East_B', WALL, W, 260, 0, W + T, D + T, H);
box('/Room/Wall_East_Sill', WALL, W, 120, 0, W + T, 260, 90);
box('/Room/Wall_East_Lintel', WALL, W, 120, 220, W + T, 260, H);
box('/Room/Window_Glass', [170, 205, 225, 80], W + 4, 120, 90, W + 6, 260, 220);

// bed 160 x 200, headboard against the north wall
group('bed', () => {
  const bed = (n, c, x0, y0, z0, x1, y1, z1) => box('/Room/Bed/' + n, c, x0, y0, z0, x1, y1, z1);
  bed('Frame', OAK, 120, 150, 12, 280, 350, 32);
  bed('Leg_A', OAK, 120, 150, 0, 128, 158, 12); bed('Leg_B', OAK, 272, 150, 0, 280, 158, 12);
  bed('Leg_C', OAK, 120, 342, 0, 128, 350, 12); bed('Leg_D', OAK, 272, 342, 0, 280, 350, 12);
  bed('Headboard', OAK, 118, 344, 12, 282, 350, 105);
  bed('Mattress', [238, 236, 230, 255], 122, 154, 32, 278, 346, 52);
  bed('Duvet', [150, 168, 160, 255], 122, 154, 52, 278, 285, 58);
  bed('Pillow_Left', [248, 246, 240, 255], 132, 310, 52, 198, 340, 64);
  bed('Pillow_Right', [248, 246, 240, 255], 202, 310, 52, 268, 340, 64);
  for (const [k, x0] of [['Left', 72], ['Right', 288]]) {
    bed('Nightstand_' + k, OAK, x0, 310, 0, x0 + 40, 350, 45);
    bed('Nightstand_' + k + '_Drawer', [150, 118, 82, 255], x0 + 2, 308, 22, x0 + 38, 310, 42);
  }
});

// wardrobe 200 x 60 x 240 against the west wall (y 60..260), 4 doors
group('wardrobe', () => {
  const arm = (n, c, x0, y0, z0, x1, y1, z1) => box('/Room/Wardrobe/' + n, c, x0, y0, z0, x1, y1, z1);
  arm('Body', WHITE, 0, 60, 0, 58, 260, 240);
  for (let i = 0; i < 4; i++) {
    const y0 = 60 + i * 50;
    arm('Door_' + (i + 1), [240, 238, 232, 255], 58, y0 + 0.5, 4, 60, y0 + 49.5, 238);
    arm('Handle_' + (i + 1), METAL, 60, y0 + (i % 2 ? 6 : 42), 110, 62.5, y0 + (i % 2 ? 8 : 44), 140);
  }
});

// rug
box('/Room/Rug', [204, 198, 188, 255], 90, 40, 0, 310, 160, 1.2);

const out = process.argv[2] || path.join(__dirname, 'scene.json');
kit.write(out, {
  camera: kit.camera([640, -360, 960], [200, 175, 40]),
  spawn: kit.spawn([145, 40], 90),
  ceiling: kit.ceiling([[0, 0], [W, 0], [W, D], [0, D]], H, H + 2),
});
console.log('wrote', path.relative(process.cwd(), out), '-', kit.items.length, 'items');
