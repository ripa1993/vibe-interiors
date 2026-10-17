// Camera da letto di prova (progetto minimo per validare la funzione multi-progetto): stanza 400 x 350 cm, porta a sud, finestra a est,
// letto matrimoniale contro il muro nord, due comodini, armadio a 4 ante contro il muro ovest. Misure in cm (inventate), convertite in pollici.
// Uso: node projects/camera-test/room.js   (riscrive scene.json)
const fs = require('fs'), path = require('path');
const IN = 1 / 2.54, r3 = v => Math.round(v * IN * 1000) / 1000;
const items = [];
const box = (n, c, x0, y0, z0, x1, y1, z1, g) => items.push({ n, c, ...(g ? { g } : {}), box: [x0, y0, z0, x1, y1, z1].map(r3) });

const WALL = [236, 233, 228, 255], FLOOR = [190, 158, 122, 255], OAK = [176, 140, 98, 255], WHITE = [228, 225, 218, 255], METAL = [58, 60, 66, 255];
const H = 260, T = 10, W = 400, D = 350;

// pavimento e pareti (la stanza interna è x 0..400, y 0..350)
box('/Camera/Pavimento', FLOOR, -T, -T, -4, W + T, D + T, 0);
box('/Camera/Muro_Ovest', WALL, -T, -T, 0, 0, D + T, H);
box('/Camera/Muro_Nord', WALL, 0, D, 0, W, D + T, H);
// muro sud con la porta (luce 90 x 210, x 100..190)
box('/Camera/Muro_Sud_A', WALL, -T, -T, 0, 100, 0, H);
box('/Camera/Muro_Sud_B', WALL, 190, -T, 0, W + T, 0, H);
box('/Camera/Muro_Sud_Architrave', WALL, 100, -T, 210, 190, 0, H);
// muro est con la finestra (luce y 120..260, davanzale 90, architrave 220)
box('/Camera/Muro_Est_A', WALL, W, -T, 0, W + T, 120, H);
box('/Camera/Muro_Est_B', WALL, W, 260, 0, W + T, D + T, H);
box('/Camera/Muro_Est_Davanzale', WALL, W, 120, 0, W + T, 260, 90);
box('/Camera/Muro_Est_Architrave', WALL, W, 120, 220, W + T, 260, H);
box('/Camera/Finestra_Vetro', [170, 205, 225, 80], W + 4, 120, 90, W + 6, 260, 220);

// letto 160 x 200, testata contro il muro nord
const bed = (n, c, x0, y0, z0, x1, y1, z1) => box('/Camera/Letto/' + n, c, x0, y0, z0, x1, y1, z1, 'letto');
bed('Struttura', OAK, 120, 150, 12, 280, 350, 32);
bed('Gambe_A', OAK, 120, 150, 0, 128, 158, 12); bed('Gambe_B', OAK, 272, 150, 0, 280, 158, 12);
bed('Gambe_C', OAK, 120, 342, 0, 128, 350, 12); bed('Gambe_D', OAK, 272, 342, 0, 280, 350, 12);
bed('Testata', OAK, 118, 344, 12, 282, 350, 105);
bed('Materasso', [238, 236, 230, 255], 122, 154, 32, 278, 346, 52);
bed('Piumino', [150, 168, 160, 255], 122, 154, 52, 278, 285, 58);
bed('Cuscino_Sx', [248, 246, 240, 255], 132, 310, 52, 198, 340, 64);
bed('Cuscino_Dx', [248, 246, 240, 255], 202, 310, 52, 268, 340, 64);
for (const [k, x0] of [['Sx', 72], ['Dx', 288]]) {
  bed('Comodino_' + k, OAK, x0, 310, 0, x0 + 40, 350, 45);
  bed('Comodino_' + k + '_Cassetto', [150, 118, 82, 255], x0 + 2, 308, 22, x0 + 38, 310, 42);
}

// armadio 200 x 60 x 240 contro il muro ovest (y 60..260), 4 ante
const arm = (n, c, x0, y0, z0, x1, y1, z1) => box('/Camera/Armadio/' + n, c, x0, y0, z0, x1, y1, z1, 'armadio');
arm('Corpo', WHITE, 0, 60, 0, 58, 260, 240);
for (let i = 0; i < 4; i++) {
  const y0 = 60 + i * 50;
  arm('Anta_' + (i + 1), [240, 238, 232, 255], 58, y0 + 0.5, 4, 60, y0 + 49.5, 238);
  arm('Maniglia_' + (i + 1), METAL, 60, y0 + (i % 2 ? 6 : 42), 110, 62.5, y0 + (i % 2 ? 8 : 44), 140);
}

// tappeto
box('/Camera/Tappeto', [204, 198, 188, 255], 90, 40, 0, 310, 160, 1.2);

const s = {
  units: 'inches',
  camera: { eye: [640, -360, 960].map(r3), target: [200, 175, 40].map(r3), up: [0, 0, 1], fov: 35 },
  spawn: { p: [145, 40].map(r3), yaw: 90 },
  ceiling: { o: [[0, 0], [W, 0], [W, D], [0, D]].map(p => p.map(r3)), z: [H, H + 2].map(r3) },
  groups: [
    { id: 'letto', label: 'Letto matrimoniale e comodini', cat: 'Arredo', on: true },
    { id: 'armadio', label: 'Armadio a 4 ante', cat: 'Arredo', on: true },
  ],
  items,
};
const out = path.join(__dirname, 'scene.json');
fs.writeFileSync(out, '{"units":"inches","camera":' + JSON.stringify(s.camera) + ',"spawn":' + JSON.stringify(s.spawn) + ',"ceiling":' + JSON.stringify(s.ceiling) +
  ',"groups":' + JSON.stringify(s.groups) + ',"items":[\n' + items.map(i => JSON.stringify(i)).join(',\n') + '\n]}\n');
console.log('scritto', path.relative(process.cwd(), out), '-', items.length, 'oggetti');
