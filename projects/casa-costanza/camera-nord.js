// Camera nord (camera piccola dell'ala in alto) arredata come CAMERA OSPITI. Un solo gruppo `camera-nord`:
//  - libreria a mensole nella NICCHIA del muro nord obliquo (x 270..380, profonda 15, alta 270), stile quella del soggiorno (cartongesso bianco, mensole da 2,5, montante
//    centrale, libri, piantine, bandierina) ma con sporgenza di 12 cm fuori dalla nicchia (15 cm da soli sono pochi per i libri) e con cesto di asciugamani per gli ospiti;
//  - divano letto IKEA BRIMNES (struttura 205 x 87 con 2 cassetti, materasso 80 x 200): schienale contro il muro est, fronte a ovest, y 636..841, cosi' a nord resta libero il passaggio
//    verso la libreria; materasso, 4 cuscini grandi (come nella foto IKEA); stampa sul muro sopra;
//  - cassettiera LUNGA (150 x 40 x 80, 6 cassetti) sul muro sud, a est del passaggio della porta (x 232..382), con lampada, libri, piantina e 2 stampe; tavolino rotondo con lampada sul muro ovest tra porta e calorifero; tappeto; piantina vicino alla porta.
// Il muro nord e' obliquo (13 gradi): le parti appoggiate alla libreria usano un riferimento locale (u lungo il muro, v verso la stanza) e poligoni `slab`; i libri sono box che seguono la linea.
// Il secondo letto estraibile del BRIMNES non e' modellato. Misure in cm, stime di progetto. `L(x)` = y della faccia interna del muro obliquo.
module.exports = function cameraNord({ box, tube, rbox, slab, group, L }) {
  const P = '/CameraNord/';
  const PL = [244, 242, 238, 255], OAK = [200, 164, 116, 255], DK = [40, 44, 50, 255];
  const GR = [84, 128, 82, 255], GR2 = [60, 110, 70, 255], POT = [200, 190, 175, 255], TC = [190, 100, 70, 255], CREAM = [240, 228, 200, 255];
  const RAIN = [[208, 56, 56, 255], [232, 138, 48, 255], [236, 200, 70, 255], [80, 160, 90, 255], [60, 110, 190, 255], [130, 80, 170, 255]];
  const TRANS = [[110, 190, 230, 255], [240, 150, 190, 255], [245, 245, 245, 255], [240, 150, 190, 255], [110, 190, 230, 255]];
  const NEUT = [[40, 42, 46, 255], [150, 120, 90, 255], [210, 200, 180, 255], [90, 96, 110, 255]];
  let seed = 11, nb = 0;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const rr = (x0, y0, x1, y1, r, seg = 4) => {                   // rettangolo arrotondato (nel riferimento in cui lo si usa)
    const pts = [];
    for (const [cx, cy, a0] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]])
      for (let k = 0; k <= seg; k++) { const a = (a0 + 90 * k / seg) * Math.PI / 180; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return pts;
  };

  group('camera-nord', () => {
    // =================== LIBRERIA NELLA NICCHIA ===================
    const NX0 = 270, NX1 = 380, D = 27;                           // nicchia in x; sporgenza verticale totale delle mensole dal fondo della nicchia
    const yb = x => L(x) + 15;                                    // fondo della nicchia
    const SZ = [10, 42, 74, 106, 138, 170, 202];
    const shelfPoly = (xa, xb, d) => [[xa, yb(xa) - d], [xb, yb(xb) - d], [xb, yb(xb) + 0.4], [xa, yb(xa) + 0.4]];   // antiorario
    SZ.forEach((z, i) => slab(P + 'Libreria_Mensola_' + i, PL, shelfPoly(NX0, NX1, D), z, z + 2.5));
    slab(P + 'Libreria_Montante', PL, shelfPoly(324, 326.5, D), 10, 204.5);
    // riferimento locale: u lungo il muro (verso est), v dal fondo della nicchia verso la stanza
    const sl = 0.233, nn = Math.hypot(1, sl), T = [1 / nn, sl / nn], N = [sl / nn, -1 / nn], O = [NX0, yb(NX0)];
    const W = (u, v) => [O[0] + u * T[0] + v * N[0], O[1] + u * T[1] + v * N[1]];
    const poly = pts => pts.map(([u, v]) => W(u, v)).reverse();
    const flat = (nm, c, u0, v0, u1, v1, z0, z1, r = 0.4) => slab(P + nm, c, poly(rr(u0, v0, u1, v1, r, 2)), z0, z1);
    const books = (xa, xb, z, pal, hmin = 20, hmax = 28, dmin = 16, dmax = 20) => {
      let x = xa;
      while (x < xb - 2.2) {
        const w = Math.min(2.2 + rnd() * 2.6, xb - x), h = hmin + rnd() * (hmax - hmin), d = dmin + rnd() * (dmax - dmin), ya = yb(x) - 0.6;
        box(P + 'Libro_' + nb++, pal[Math.floor(rnd() * pal.length)], x, ya - d, z + 2.5, x + w, ya, z + 2.5 + h);
        x += w + 0.15;
      }
    };
    const stack = (u, v, z, list) => {                            // libri piatti impilati: [colore, spessore, larghezza]
      let zz = z + 2.5;
      for (const [c, t, w] of list) { flat('Libro_Piatto_' + nb++, c, u, v, u + w, v + 16, zz, zz + t, 0.3); zz += t; }
    };
    const pot = (u, v, z, h, c, pc = POT) => {                    // vaso + fogliame a cono
      const [x, y] = W(u, v);
      tube(P + 'Vaso_' + nb++, pc, [[x, y, z + 2.5], [x, y, z + 9.5]], [3.6, 4.6], 14);
      tube(P + 'Pianta_' + nb++, c, [[x, y, z + 9.5], [x, y, z + 9.5 + h * 0.55], [x, y, z + 9.5 + h]], [1.2, 4.5, 1.5], 12);
    };
    // mensola 0 (z 10): cesto con asciugamani per gli ospiti + libri piatti + libri in piedi
    slab(P + 'Cesto_Ospiti', [196, 170, 120, 255], poly(rr(3, 1, 47, 23, 5)), 12.5, 30);
    flat('Asciugamano_0', [248, 248, 246, 255], 5, 3, 45, 21, 30, 33, 2.5);
    flat('Asciugamano_1', [170, 188, 168, 255], 6, 4, 44, 20, 33, 36, 2.5);
    flat('Asciugamano_2', [248, 248, 246, 255], 5, 3, 45, 21, 36, 39, 2.5);
    stack(60, 3, SZ[0], [[RAIN[4], 3, 24], [RAIN[0], 2.6, 22], [TRANS[1], 2.4, 21], [NEUT[2], 2.2, 20]]);
    books(355, 378, SZ[0], NEUT, 18, 24);
    // mensola 1 (z 42): libri arcobaleno, libri trans, serpente
    books(272, 322, SZ[1], RAIN);
    books(329, 362, SZ[1], TRANS, 21, 27);
    pot(101, 13, SZ[1], 24, GR2);
    // mensola 2 (z 74): pothos ricadente a sinistra, libri
    {
      const [px, py] = W(11, 13);
      tube(P + 'Vaso_Pothos', TC, [[px, py, 76.5], [px, py, 84]], [4, 5], 14);
      tube(P + 'Pothos_Foglie', GR, [[px, py, 84], [px, py, 92], [px, py, 98]], [1.5, 4.5, 1.8], 12);
      tube(P + 'Pothos_Tralcio_0', GR, [[px + 3, py - 4, 82], [px + 8, py - 7, 80], [px + 11, py - 9, 72], [px + 12, py - 10, 60]], [0.7, 0.7, 0.6, 0.5], 6);
      tube(P + 'Pothos_Tralcio_1', GR2, [[px - 3, py - 4, 82], [px - 6, py - 8, 79], [px - 6, py - 12, 70], [px - 5, py - 13, 58]], [0.7, 0.7, 0.6, 0.5], 6);
    }
    books(293, 322, SZ[2], NEUT.concat(RAIN));
    books(329, 376, SZ[2], TRANS.concat(NEUT), 21, 28);
    // mensola 3 (z 106): libri, 3 succulente
    books(272, 322, SZ[3], RAIN.concat(NEUT), 22, 29);
    [[0, 70, TC], [1, 84, [226, 218, 200, 255]], [2, 98, TC]].forEach(([k, u, pc]) => {
      const [x, y] = W(u, 11);
      tube(P + 'Succulenta_Vaso_' + k, pc, [[x, y, 108.5], [x, y, 113]], [3.2, 3.8], 12);
      rbox(P + 'Succulenta_' + k, k === 2 ? [110, 150, 120, 255] : GR, [x - 3.2, y - 3.2, 113, x + 3.2, y + 3.2, 119 + k * 1.5], 3, 3, 1);
    });
    // mensola 4 (z 138): bandierina arcobaleno, libri, piantina
    {
      const [fx, fy] = W(5, 8), fz = 140.5;
      tube(P + 'Bandierina_Asta', [60, 60, 64, 255], [[fx, fy, fz], [fx, fy, fz + 24]], [0.3, 0.3], 8);
      RAIN.forEach((c, k) => box(P + 'Bandierina_Striscia_' + k, c, fx + 0.3, fy - 0.2, fz + 22 - (k + 1) * 2, fx + 16, fy + 0.2, fz + 22 - k * 2));
    }
    books(295, 322, SZ[4], RAIN, 22, 28);
    books(329, 356, SZ[4], TRANS.concat(RAIN), 21, 27);
    pot(99, 13, SZ[4], 14, GR);
    // mensola 5 (z 170): foto incorniciata, libri piatti, lucina LED
    flat('Foto_Cornice', OAK, 10, 9, 33, 10.8, 172.5, 196, 0.2);
    flat('Foto_Immagine', [226, 214, 194, 255], 11.5, 8.6, 31.5, 9.3, 174, 194.5, 0.2);
    books(304, 322, SZ[5], NEUT.concat(TRANS), 22, 27);
    stack(62, 3, SZ[5], [[TRANS[1], 2.6, 25], [RAIN[4], 2.4, 24], [RAIN[2], 2.2, 23]]);
    {
      const [lx, ly] = W(95, 12);
      tube(P + 'Lucina_Base', CREAM, [[lx, ly, 172.5], [lx, ly, 182]], [4, 4.5], 14);
      tube(P + 'Lucina_Paralume', [250, 232, 190, 255], [[lx, ly, 180], [lx, ly, 193]], [5.5, 3.5], 14);
    }
    // mensola 6 (z 202, in alto): piante ricadenti
    pot(14, 13, SZ[6], 10, GR);
    pot(92, 13, SZ[6], 10, GR2, TC);
    for (const [u, k] of [[14, 0], [92, 1]]) {
      const [x, y] = W(u, 13);
      tube(P + 'Tralcio_Alto_' + k, k ? GR2 : GR, [[x + 2, y - 3, 209], [x + 2, y - 15, 207], [x + 3, y - 20, 195], [x + 3, y - 21, 184]], [0.8, 0.8, 0.6, 0.5], 6);
    }

    // =================== DIVANO LETTO IKEA BRIMNES (struttura 205 x 87, 2 cassetti, schienale lungo il muro est) ===================
    // Dalla scheda IKEA: struttura 205 x 87, h 58 (schienale), materasso 80 x 200, 2 cassetti sul lato lungo, base a doghe, secondo letto estraibile (non modellato).
    // Forme (altezza del bordo 32, schienale 58 sul lato muro, cassetti sul fronte) sono stime dalla foto, non dal disegno quotato. Materasso e cuscini non sono inclusi nel prodotto.
    {
      const BX0 = 343, BX1 = 430, BY0 = 636, BY1 = 841, WH = [244, 242, 238, 255], BN = P + 'Brimnes_';
      box(BN + 'Schienale', WH, BX1 - 2.5, BY0, 0, BX1, BY1, 58);                                  // pannello lungo il muro est
      box(BN + 'Fianco_Sud', WH, BX0, BY0, 0, BX1 - 2.5, BY0 + 2.5, 58);
      box(BN + 'Fianco_Nord', WH, BX0, BY1 - 2.5, 0, BX1 - 2.5, BY1, 46);
      box(BN + 'Fronte_Alto', WH, BX0, BY0 + 2.5, 29, BX0 + 2.5, BY1 - 2.5, 32);                    // traversa sopra i cassetti
      box(BN + 'Fronte_Basso', WH, BX0, BY0 + 2.5, 0, BX0 + 2.5, BY1 - 2.5, 3);
      box(BN + 'Doghe', [214, 180, 130, 255], BX0 + 2.5, BY0 + 2.5, 29, BX1 - 2.5, BY1 - 2.5, 32);
      box(BN + 'Cassetti_Fondo', [226, 224, 218, 255], BX0 + 2.5, BY0 + 2.5, 3, BX1 - 2.5, BY1 - 2.5, 29);   // vano chiuso dietro i fronti
      for (let k = 0; k < 2; k++) {
        const y0 = BY0 + 2.5 + k * 100.5, y1 = y0 + 99.5;
        box(BN + 'Cassetto_Fronte_' + k, [250, 250, 248, 255], BX0 - 1, y0, 3.4, BX0 + 0.6, y1, 28.6);
        tube(BN + 'Cassetto_Maniglia_' + k, [190, 192, 196, 255], [[BX0 - 1.6, y0 + 38, 24], [BX0 - 1.6, y1 - 38, 24]], [0.7, 0.7], 8);
      }
      rbox(BN + 'Materasso', [214, 204, 188, 255], [BX0 + 4, BY0 + 3, 32, BX1 - 2.5, BY1 - 3, 47], 3, 3, 2);   // materasso 80 x 200 con lenzuolo beige (spessore 15, stima)
      // cuscini grandi appoggiati allo schienale (come nella foto IKEA: grigio, grigio a rombi, avorio, tortora)
      [[BY0 + 8, 'Cuscino_0', [196, 184, 164, 255], 46], [BY0 + 52, 'Cuscino_1', [120, 122, 134, 255], 52], [BY0 + 104, 'Cuscino_2', [232, 230, 224, 255], 46], [BY0 + 150, 'Cuscino_3', [112, 112, 122, 255], 46]].forEach(([y, nm, c, w]) =>
        rbox(BN + nm, c, [BX1 - 24, y, 47, BX1 - 2.5, y + w, 47 + 40], 7, 7, 4));
    }

    // stampa sul muro est sopra il divano e sul muro ovest sopra la cassettiera (cornice + passepartout + sfondo + sole): sporgono dalla faccia del muro
    const printX = (nm, yc, z0, w, h, xw, s, bg, sun, line) => {
      const y0 = yc - w / 2, t = 1.5, d = a => xw + s * a;
      const bx = (n, c, ya, za, yb2, zb, a0, a1) => box(P + nm + n, c, Math.min(d(a0), d(a1)), ya, za, Math.max(d(a0), d(a1)), yb2, zb);
      bx('_Basso', DK, y0, z0, y0 + w, z0 + t, 0, 2); bx('_Alto', DK, y0, z0 + h - t, y0 + w, z0 + h, 0, 2);
      bx('_Sx', DK, y0, z0 + t, y0 + t, z0 + h - t, 0, 2); bx('_Dx', DK, y0 + w - t, z0 + t, y0 + w, z0 + h - t, 0, 2);
      bx('_Passepartout', [248, 246, 240, 255], y0 + t, z0 + t, y0 + w - t, z0 + h - t, 0.5, 1);
      bx('_Fondo', bg, y0 + 5, z0 + 5, y0 + w - 5, z0 + h - 5, 1, 1.2);
      bx('_Linea', line, y0 + 5, z0 + h * 0.34, y0 + w - 5, z0 + h * 0.34 + 3, 1.2, 1.4);
      const r = Math.min(w, h) * 0.17;
      tube(P + nm + '_Sole', sun, [[d(1.2), yc, z0 + h * 0.6], [d(1.5), yc, z0 + h * 0.6]].map(p => p), [r, r], 20);
    };
    printX('Stampa_Divano', 738.5, 105, 100, 68, 430, -1, [212, 224, 208, 255], [226, 160, 120, 255], [120, 150, 125, 255]);

    // =================== CASSETTIERA LUNGA sul muro sud (x 232..382, y 551.4..591.4, h 80): 3 colonne x 2 cassetti, fronte verso nord ===================
    {
      const CX0 = 232, CX1 = 382, CY0 = 551.4, CY1 = 591.4, CW = [226, 230, 222, 255], BRS = [190, 156, 96, 255], DX = (CX1 - CX0) / 3;
      for (const [x, y] of [[CX0 + 4, CY0 + 4], [CX0 + 4, CY1 - 4], [CX1 - 4, CY0 + 4], [CX1 - 4, CY1 - 4], [(CX0 + CX1) / 2, CY0 + 4], [(CX0 + CX1) / 2, CY1 - 4]])
        tube(P + 'Cassettiera_Piede_' + x + '_' + y, [58, 50, 44, 255], [[x, y, 0], [x, y, 8]], [1.8, 1.8], 8);
      box(P + 'Cassettiera_Corpo', CW, CX0, CY0, 8, CX1, CY1, 78);
      rbox(P + 'Cassettiera_Piano', OAK, [CX0 - 1.5, CY0, 78, CX1 + 1.5, CY1 + 1.5, 80.5], 1.5, 1);
      const zs = [10, 43, 76.5];
      for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) {
        const xa = CX0 + k * DX + 1, xb = CX0 + (k + 1) * DX - 1, xc = (xa + xb) / 2;
        box(P + 'Cassettiera_Fronte_' + r + k, [236, 238, 232, 255], xa, CY1, zs[r] + 0.6, xb, CY1 + 1.4, zs[r + 1] - 0.6);
        tube(P + 'Cassettiera_Maniglia_' + r + k, BRS, [[xc - 5, CY1 + 2.3, zs[r + 1] - 7], [xc + 5, CY1 + 2.3, zs[r + 1] - 7]], [0.5, 0.5], 8);
      }
      // sopra: lampada, pila di libri, piantina; sul muro due stampe
      const lx = 252, ly = 568;
      tube(P + 'Lampada_Cassettiera_Base', CREAM, [[lx, ly, 80.5], [lx, ly, 89], [lx, ly, 98]], [5.5, 6.2, 1.2], 14);
      tube(P + 'Lampada_Cassettiera_Paralume', [250, 232, 190, 255], [[lx, ly, 95], [lx, ly, 113]], [11, 7.5], 18);
      box(P + 'Cassettiera_Libro_0', NEUT[1], 296, 560, 80.5, 318, 578, 83);
      box(P + 'Cassettiera_Libro_1', RAIN[3], 297, 561, 83, 316, 577, 85);
      tube(P + 'Cassettiera_Vaso', POT, [[364, 566, 80.5], [364, 566, 88.5]], [3.8, 4.8], 14);
      tube(P + 'Cassettiera_Pianta', GR, [[364, 566, 88.5], [364, 566, 98], [364, 566, 106]], [1.2, 4.8, 1.6], 12);
      const { frame } = require('./decor.js')({ box, tube, P });
      frame('Stampa_Cassettiera_A', 268, 112, 38, 52, 551, -1, DK, [226, 214, 194, 255], [214, 140, 100, 255], [120, 150, 125, 255]);
      frame('Stampa_Cassettiera_B', 318, 120, 50, 38, 551, -1, DK, [212, 224, 208, 255], [226, 160, 120, 255], [120, 150, 125, 255]);
    }

    // =================== TAVOLINO ROTONDO tra porta e calorifero (muro ovest), tappeto, piantina ===================
    {
      const tx = 209, ty = 702;
      tube(P + 'Tavolino_Base', DK, [[tx, ty, 0], [tx, ty, 1.5]], [11, 11], 20);
      tube(P + 'Tavolino_Gamba', DK, [[tx, ty, 1.5], [tx, ty, 42]], [1.6, 1.6], 10);
      tube(P + 'Tavolino_Piano', OAK, [[tx, ty, 42], [tx, ty, 44.5]], [19, 19], 28);
      tube(P + 'Tavolino_Lampada_Base', [226, 218, 200, 255], [[tx + 6, ty - 6, 44.5], [tx + 6, ty - 6, 52], [tx + 6, ty - 6, 58]], [4.5, 5, 1], 14);
      tube(P + 'Tavolino_Lampada_Paralume', [250, 232, 190, 255], [[tx + 6, ty - 6, 56], [tx + 6, ty - 6, 71]], [9, 6], 18);
      tube(P + 'Tavolino_Caraffa', [190, 220, 230, 160], [[tx - 8, ty + 6, 44.5], [tx - 8, ty + 6, 56]], [3, 2], 12);
      tube(P + 'Tavolino_Bicchiere', [190, 220, 230, 160], [[tx - 2, ty + 11, 44.5], [tx - 2, ty + 11, 51]], [2.4, 2.8], 12);
    }
    {
      const [px, py] = [203, 566];
      tube(P + 'Piantina_Angolo_Vaso', TC, [[px, py, 0], [px, py, 26]], [8, 11], 20);
      const GRN2 = [96, 142, 98, 255];
      for (let k = 0; k < 8; k++) {
        const a = 2 * Math.PI * k / 8 + 0.4 * (k % 2), l = 62 + 14 * ((k * 5) % 3) / 2, ca = Math.cos(a), sa = Math.sin(a);
        tube(P + 'Piantina_Angolo_Foglia_' + k, k % 2 ? GRN2 : GR, [[px + ca, py + sa, 26], [px + ca * 6, py + sa * 6, 26 + l * 0.6], [px + ca * 13, py + sa * 13, 26 + l]], [0.3, 2.8, 0.2], 6);
      }
    }
    slab(P + 'Tappeto', [196, 204, 188, 255], rr(255, 672, 375, 832, 4), 0, 1.2);
    slab(P + 'Tappeto_Bordo', [214, 220, 204, 255], rr(259, 676, 371, 828, 3), 1.2, 1.5, [rr(265, 682, 365, 822, 2)]);
  });
};
