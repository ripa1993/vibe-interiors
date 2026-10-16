// Armadio v3 · CABINA ARMADIO dietro un muro davanti al letto (camera a sud, interno x 31..430, y -531..-131). Alternativa a `armadio-v2` (stessa `variant`).
// Idea: un tramezzo lungo quanto il letto (167, y -414,5..-247,5, centrato su y -331) davanti ai PIEDI del letto (testiera a est, pediera a x 218), alto fino al soffitto.
// Sul lato letto (est) la TV 43" a parete; sul lato ovest la cabina: due PAX da 150 x 58 (y -481..-181) con ante scorrevoli (2 pannelli da 76, binari alto/basso; ogni modulo = metà aste doppie + metà ripiani con 5 cassetti), e alle estremita' (y -531..-481 e -181..-131) due librerie aperte 50 x 28 x 201 (tipo BILLY, con libri): parete ovest completa.
// La cabina e' aperta ai due lati corti del tramezzo (passaggi da ~116 cm verso i muri nord e sud); corridoio netto 66 cm con le ante. Quote: tramezzo spesso 10, faccia est a x WX1 = 168 (50 cm dalla pediera),
// quindi lato cabina x 158: corridoio tra PAX (fronte x 89) e tramezzo = 69 cm. Sposta WX1 per cambiare il rapporto corridoio / passaggio ai piedi del letto. Misure in cm, stime di progetto.
module.exports = function armadioV3({ box, tube, rbox, slab, group, n, light }) {
  const OAK = [244, 243, 240, 255], OAKD = [226, 225, 222, 255], OAKF = [250, 249, 247, 255], STL = [198, 200, 204, 255], BLK = [60, 56, 50, 255], WALL = [250, 250, 248, 255];
  const P = '/ArmadioV3/';
  const T = 1.8, H = 201, PL = 8, HW = 330;
  const X0 = 31, X1 = 31 + 58;                           // PAX contro il muro ovest, profondi 58, aperti verso est
  const YC = -331, WX1 = 168, WT = 10, WX0 = WX1 - WT, WY0 = YC - 83.5, WY1 = YC + 83.5;

  const carcass = (nm, y0, y1) => {
    const Q = P + nm + '_';
    box(Q + 'Zoccolo', BLK, X0 + 1, y0 + 1, 0, X1 - 3, y1 - 1, PL);
    box(Q + 'Cielo', OAK, X0, y0, H - T, X1, y1, H);
    box(Q + 'Fondo', OAK, X0, y0, PL, X1, y1, PL + T);
    box(Q + 'Fianco_S', OAK, X0, y0, PL + T, X1, y0 + T, H - T);
    box(Q + 'Fianco_N', OAK, X0, y1 - T, PL + T, X1, y1, H - T);
    box(Q + 'Schiena', OAKD, X0, y0 + T, PL + T, X0 + 0.5, y1 - T, H - T);
  };
  const shelf = (nm, y0, y1, z) => box(nm, OAKF, X0 + 0.5, y0 + T, z, X1 - 1.5, y1 - T, z + 1.6);
  const rail = (nm, y0, y1, z) => tube(nm, STL, [[X0 + 29, y0 + T, z], [X0 + 29, y1 - T, z]], [1.3, 1.3], 10);

  group('armadio-v3', () => {
    // ---------- tramezzo davanti al letto, fino al soffitto ----------
    box(P + 'Muro_Letto', WALL, WX0, WY0, 0, WX1, WY1, HW);

    // ---------- TV 43" sul lato letto (est), centro a 125 da terra ----------
    const TW = 95.3, TH = 53.6, ZC = 125, y0 = YC - TW / 2, y1 = YC + TW / 2, z0 = ZC - TH / 2, z1 = ZC + TH / 2;
    rbox(P + 'TV_Corpo', [26, 28, 32, 255], [WX1, y0, z0, WX1 + 4.5, y1, z1], 0.8, 0.4);
    box(P + 'TV_Schermo', [16, 18, 24, 255], WX1 + 4.4, y0 + 1.2, z0 + 1.2, WX1 + 4.6, y1 - 1.2, z1 - 1.2);
    box(P + 'TV_Staffa', [50, 52, 56, 255], WX1 - 0.01, YC - 8, ZC - 8, WX1 + 0.5, YC + 8, ZC + 8);

    // ---------- 2 mensole flottanti sopra la TV, corte e sfalzate (bassa 50 spostata a sud z 163, alta 45 spostata a nord z 190), con una piantina in vaso e qualche libro ----------
    const { pot, plant, GRN2, TERRA } = require('./decor.js')({ box, tube, P });
    const WOOD = [150, 110, 70, 255];
    box(P + 'Mensola_0', WOOD, WX1, YC - 48, 163, WX1 + 20, YC + 2, 165.5);
    box(P + 'Mensola_1', WOOD, WX1, YC - 8, 190, WX1 + 20, YC + 37, 192.5);
    pot('Vaso_Mensola', WX1 + 10, YC + 22, 192.5, 8, 3.8, 4.8, TERRA);
    plant('Pianta_Mensola', WX1 + 10, YC + 22, 198.5, 7, 14, 6, GRN2);
    box(P + 'Mensola_Libro_0', [120, 134, 112, 255], WX1 + 3, YC - 44, 165.5, WX1 + 16, YC - 40, 183);
    box(P + 'Mensola_Libro_1', [186, 120, 96, 255], WX1 + 3, YC - 39.8, 165.5, WX1 + 16, YC - 36.5, 180);
    box(P + 'Mensola_Libro_2', [90, 106, 122, 255], WX1 + 3, YC - 36.3, 165.5, WX1 + 16, YC - 33, 181.5);
    box(P + 'Mensola_Libro_3', [226, 218, 200, 255], WX1 + 4, YC - 28, 165.5, WX1 + 15, YC - 6, 168.5);

    // ---------- 2 PAX da 150 (y -481..-181) + librerie aperte da 50 alle due estremita' (y -531..-481 e -181..-131): parete completa ----------
    const drawers = (k, y0, y1) => {                                   // ripiani + 5 cassetti nel vano y0..y1
      shelf(P + k + '_Ripiano_Cassetti', y0, y1, 102);
      for (const [j, z] of [[0, 187], [1, 160], [2, 130]]) shelf(P + k + '_Ripiano_' + j, y0, y1, z);
      for (let j = 0; j < 5; j++) {
        const zz = PL + T + 0.4 + j * 18.2;
        box(P + k + '_Cassetto_' + j, OAKF, X1 - 3, y0 + T + 0.3, zz, X1 - 1.2, y1 - T - 0.3, zz + 17.4);
        box(P + k + '_Cassetto_Ombra_' + j, BLK, X1 - 3.2, y0 + T + 0.3, zz + 17.4, X1 - 1, y1 - T - 0.3, zz + 18.2);
      }
    };
    const aste = (k, y0, y1) => { shelf(P + k + '_Ripiano_Basso', y0, y1, 14); rail(P + k + '_Asta_0', y0, y1, 184); rail(P + k + '_Asta_1', y0, y1, 98); };
    const mods = [['M1', -481, 'aste', 'cassetti'], ['M2', -331, 'cassetti', 'aste']];   // [nome, y0, vano sud, vano nord]; montante centrale a meta' (75 + 75)
    for (const [k, y0, left, right] of mods) {
      const y1 = y0 + 150, ym = y0 + 75;
      carcass(k, y0, y1);
      box(P + k + '_Montante', OAK, X0 + 0.5, ym - T / 2, PL + T, X1 - 1, ym + T / 2, H - T);
      shelf(P + k + '_Ripiano_Alto_S', y0, ym + T / 2, 190); shelf(P + k + '_Ripiano_Alto_N', ym - T / 2, y1, 190);
      for (const [nm, kind, ya, yb] of [['S', left, y0, ym + T / 2], ['N', right, ym - T / 2, y1]]) {
        if (kind === 'aste') aste(k + '_' + nm, ya, yb); else drawers(k + '_' + nm, ya, yb);
      }
    }

    // ---------- ante scorrevoli PAX: 2 pannelli da 76 per modulo su due binari (uno dietro, uno davanti, 2 cm di sovrapposizione), cornice bianca + inserto ----------
    const TRK = [90, 90, 92, 255], DOOR = [238, 238, 235, 255], INS = [226, 226, 222, 255];
    for (const [k, y0] of mods) {
      box(P + k + '_Binario_Alto', TRK, X1, y0 + 0.5, 199.4, X1 + 4.6, y0 + 149.5, 201);
      box(P + k + '_Binario_Basso', TRK, X1, y0 + 0.5, 2, X1 + 4.6, y0 + 149.5, 4);
      for (let j = 0; j < 2; j++) {
        const xa = X1 + (j ? 3.0 : 0.8), ya = j ? y0 + 149.5 - 76 : y0 + 0.5, yb = ya + 76;
        box(P + k + '_Anta_' + j, DOOR, xa, ya, 4, xa + 1.6, yb, 199.4);
        box(P + k + '_Anta_Inserto_' + j, INS, xa + 1.6, ya + 3, 8, xa + 1.9, yb - 3, 195.4);
        box(P + k + '_Anta_Maniglia_' + j, STL, xa + 1.6, j ? ya + 3.5 : yb - 5.5, 90, xa + 2.4, j ? ya + 5.5 : yb - 3.5, 120);
      }
    }

    // ---------- librerie aperte 50 x 28 x 201 (tipo BILLY) alle due estremita': fianchi, schiena, 5 ripiani, libri e oggetti (decorazione stimata) ----------
    const BCOL = [[120, 134, 112], [200, 190, 170], [90, 106, 122], [186, 120, 96], [226, 218, 200], [60, 70, 76], [160, 150, 130]];
    let bk = 0;
    for (const [nm, y0, fill] of [['S', -531, [9, 6, 0, 8, 7, 5]], ['N', -181, [8, 0, 7, 6, 9, 6]]]) {
      const y1 = y0 + 50, D = 28, N = P + 'Libreria_' + nm + '_';
      box(N + 'Fianco_S', OAK, X0, y0, 1, X0 + D, y0 + T, H);
      box(N + 'Fianco_N', OAK, X0, y1 - T, 1, X0 + D, y1, H);
      box(N + 'Schiena', OAKD, X0, y0 + T, 1, X0 + 0.4, y1 - T, H);
      box(N + 'Base', OAK, X0 + 0.4, y0 + T, 1, X0 + D, y1 - T, 1 + T);
      box(N + 'Top', OAK, X0, y0, H - T, X0 + D, y1, H);
      const gap = (H - T - (1 + T)) / 6, floors = [1 + T];
      for (let i = 1; i <= 5; i++) { const z = 1 + T + gap * i - 0.8; box(N + 'Ripiano_' + i, OAKF, X0 + 0.4, y0 + T, z, X0 + D - 0.5, y1 - T, z + 1.6); floors.push(z + 1.6); }
      floors.forEach((zf, r) => {
        let ys = y0 + T + 1.2;
        for (let j = 0; j < fill[r] && ys < y1 - T - 3; j++, bk++) {
          const w = 1.6 + ((bk * 7) % 5) * 0.5, h = Math.min(20 + ((bk * 11) % 6) * 1.8 - (j % 3 === 2 ? 4 : 0), gap - 3), c = BCOL[bk % BCOL.length];
          box(N + 'Libro_' + r + '_' + j, [c[0], c[1], c[2], 255], X0 + 4, ys, zf, X0 + D - 4, ys + w, zf + h);
          ys += w + 0.1;
        }
      });
    }

    // ---------- luce della cabina (il tramezzo fa ombra alla plafoniera della camera) ----------
    tube(P + 'Plafoniera', [248, 248, 244, 255], [[95, YC, 326], [95, YC, 330]], [16, 16], 24);
    tube(P + 'Plafoniera_Diffusore', [255, 238, 200, 255], [[95, YC, 325], [95, YC, 326]], [14, 14], 24);
    if (light) light({ p: [95, YC, 324], d: [0, 0, -1], a: 68, pen: 0.5, c: [255, 214, 160], i: 240, sh: 1, g: 'armadio-v3' });
  });
};
