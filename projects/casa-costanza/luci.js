// Punti luce a soffitto (z 330) e applique, stanza per stanza. Un solo gruppo `luci` (categoria Illuminazione). Gli oggetti sono semplici corpi illuminanti bianchi con diffusore caldo:
// il viewer non emette luce, servono solo come posizione/ingombro. Posizioni scelte al centro di ogni locale o sopra gli arredi principali; stime di progetto, nessuna misura dell'utente.
//  - ingresso (corridoio x -382..-11, y 0..128): binario BÄVE 120 cm lungo l'asse y 64 (x -256..-136); antibagno: plafoniera tonda; WC grande: plafoniera (solo la principale);
//  - cucina (x -171..-11, y 139..501): binario IKEA BÄVE 120 cm con 5 faretti orientabili, al centro (x -91, y 260..380; stesso componente del soggiorno);
//  - soggiorno (x 0..430, y 0..501): sospensione sopra il tavolo (x 330, y 115, calata a 175 cm) + binario BÄVE 120 cm sulla zona divano / TV (x 140..260, y 330);
//  - camera sud (x 31..430, y -531..-131): plafoniera centrale + 2 applique da lettura sulla parete est, sopra i comodini (y -223 e -439, z 120);
//  - camera nord (ospiti, x 188..430, y 551..~870): plafoniera centrale; WC piccolo (x -25..173, y 734..~820): plafoniera.
// Misure in cm.
module.exports = function luci({ box, tube, group, L, items, light }) {
  const P = '/Luci/', WHT = [248, 248, 244, 255], WARM = [255, 238, 200, 255], CHR = [200, 202, 206, 255];
  const Z = 330;
  group('luci', () => {
    const glow = () => { items[items.length - 1].em = 1; };                       // la voce appena creata si accende in modalita' notte
    const SRC = [255, 214, 160];                                                // luce calda 2700 K
    const lamp = (x, y, z, o) => light(Object.assign({ p: [x, y, z], d: [0, 0, -1], a: 68, pen: 0.5, c: SRC, i: 240, sh: 1 }, o));   // sorgente del viewer (spot verso il basso, ombre)
    const plaf = (nm, x, y, r, o) => { tube(P + nm, WHT, [[x, y, Z - 4], [x, y, Z]], [r, r], 28); tube(P + nm + '_Diffusore', WARM, [[x, y, Z - 5], [x, y, Z - 4]], [r * 0.86, r * 0.86], 28); glow(); lamp(x, y, Z - 6, o); };
    const spot = (nm, x, y) => { tube(P + nm, WHT, [[x, y, Z - 2.5], [x, y, Z]], [4.5, 4.5], 16); tube(P + nm + '_Lente', WARM, [[x, y, Z - 3.2], [x, y, Z - 2.5]], [3, 3], 16); };
    const bave = (nm, xc, yc, axis) => {                              // binario IKEA BÄVE 120 cm con 5 faretti LED orientabili, bianco (scheda: binario 120, testa dei faretti 3 cm); asse 'y' o 'x'
      const P2 = P + nm + '_', pt = (u, v, z) => axis === 'y' ? [xc + v, yc + u, z] : [xc + u, yc + v, z];
      const b = (n, c, u0, v0, z0, u1, v1, z1) => axis === 'y' ? box(n, c, xc + v0, yc + u0, z0, xc + v1, yc + u1, z1) : box(n, c, xc + u0, yc + v0, z0, xc + u1, yc + v1, z1);
      b(P2 + 'Binario', WHT, -60, -1.5, Z - 2.2, 60, 1.5, Z);
      for (let i = 0; i < 5; i++) {                                    // faretti a 12 cm dalle estremita' e 24 cm tra loro; orientati in alternanza da un lato e dall'altro
        const u = -48 + i * 24, d = i % 2 ? 4 : -4;
        b(P2 + 'Faretto_' + i + '_Base', WHT, u - 1.5, -1.5, Z - 4.2, u + 1.5, 1.5, Z - 2.2);
        tube(P2 + 'Faretto_' + i, WHT, [pt(u, 0, Z - 4.2), pt(u, d * 0.6, Z - 8), pt(u, d, Z - 12)], [1.2, 1.5, 1.5], 12);
        tube(P2 + 'Faretto_' + i + '_Lente', WARM, [pt(u, d, Z - 12), pt(u, d * 1.06, Z - 12.5)], [1.2, 1.2], 12); glow();
      }
      lamp(...pt(0, 0, Z - 8), { a: 62, i: 300 });                       // una sola sorgente per tutto il binario (5 teste = 1 spot largo con ombre)
    };
    // ingresso / corridoio
    bave('Ingresso', -196, 64, 'x');   // al centro del corridoio (x -256..-136, y 64)
    // WC grande: antibagno + locale (solo la plafoniera principale, niente faretto in doccia)
    plaf('Antibagno', -282, 184, 18);
    plaf('WC_Grande', -282, 370, 22);
    // cucina
    bave('Cucina', -91, 320, 'y');   // al centro della cucina (x -91, y 260..380)
    // soggiorno: sospensione sul tavolo + binario
    tube(P + 'Tavolo_Cavo', CHR, [[330, 115, Z], [330, 115, 196]], [0.3, 0.3], 6);
    tube(P + 'Tavolo_Paralume', WHT, [[330, 115, 176], [330, 115, 196]], [26, 10], 28);
    tube(P + 'Tavolo_Diffusore', WARM, [[330, 115, 175.5], [330, 115, 176]], [24, 24], 28); glow();
    lamp(330, 115, 174, { a: 65, i: 180 });
    bave('Soggiorno', 200, 330, 'x');   // sulla zona divano / TV (x 140..260, y 330)
    // camera sud: plafoniera + 2 applique sulla parete est
    plaf('CameraSud', 230, -331, 24);
    for (const [nm, y] of [['N', -223], ['S', -439]]) {
      box(P + 'Applique_' + nm + '_Piastra', WHT, 428, y - 3.5, 112, 430, y + 3.5, 128);
      tube(P + 'Applique_' + nm + '_Braccio', CHR, [[428, y, 120], [421, y, 120]], [0.6, 0.6], 8);
      tube(P + 'Applique_' + nm + '_Paralume', WARM, [[421, y, 113], [421, y, 130]], [3.5, 5.5], 16); glow();
      lamp(421, y, 122, { d: [-0.55, 0, -0.83], a: 48, pen: 0.8, i: 90, sh: 0 });
    }
    // ripostigli: sorgenti delle barre LED (le barre stanno in ripostigli.js, in house.js sono rese luminose)
    lamp(130, -85, 324, { a: 70, i: 110 });
    lamp(370, -85, 324, { a: 70, i: 110 });
    // camera nord e WC piccolo (muro nord obliquo: y = L(x) ~ 845..901)
    plaf('CameraNord', 310, 700, 22);
    plaf('WC_Piccolo', 75, 776, 16);
  });
};
