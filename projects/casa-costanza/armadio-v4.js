// Armadio v4 · CABINA ARMADIO chiusa: copia di `armadio-v3` senza i mobili (niente PAX con ante, niente librerie) ma con il muro davanti al letto prolungato da sud a nord (y -531..-131, fino al muro nord).
// Guardando il muro dal letto: a SINISTRA (sud) uno specchio a figura intera accanto alla TV, a DESTRA (nord) un'apertura ad arco di 100 cm (y -231..-131, piedritti a 170, vertice a 220) senza spalla: a nord finisce
// direttamente nel muro nord esistente; e' l'accesso alla cabina; il calorifero (x 100..200) resta in fondo, contro il muro nord. TV con mensole e piantina sul lato letto (est). Cabina x 31..158, y -531..-131; lungo il muro OVEST 4 PAX da 100 x 58
// aperti, senza ante (aste doppie, cassetti, asta lunga + scarpe, aste doppie + ripiano alto); corridoio netto 69 cm (x 89..158); sul retro del muro uncini; in fondo (sud) pouf; tappeto passatoia.
// Misure in cm, stime di progetto. Variante di `armadio` (stessa `variant`).
module.exports = function armadioV4({ box, tube, rbox, slab, group, n, light, mesh }) {
  const OAK = [244, 243, 240, 255], OAKD = [226, 225, 222, 255], OAKF = [250, 249, 247, 255], STL = [198, 200, 204, 255], BLK = [60, 56, 50, 255], WALL = [250, 250, 248, 255];
  const P = '/ArmadioV4/';
  const T = 1.8, H = 201, PL = 8, HW = 330;
  const X0 = 31, X1 = 31 + 58;                           // PAX contro il muro ovest, profondi 58, aperti verso est
  const YC = -331, WX1 = 168, WT = 10, WX0 = WX1 - WT, WY0 = -531, WY1 = -141, OY0 = -231, OY1 = -131, ZS = 170;   // muro dal muro sud al calorifero (y -141); apertura ad arco OY0..OY1

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

  group('armadio-v4', () => {
    // ---------- tramezzo davanti al letto, fino al soffitto ----------
    // muro con apertura ad arco a destra (guardando il muro dal letto = lato nord): piedritti fino a ZS, semicerchio r = meta' larghezza; senza spalla a destra: l'arco finisce nel muro nord esistente (y -131)
    box(P + 'Muro_Letto_Sud', WALL, WX0, WY0, 0, WX1, OY0, HW);
    {
      const R = (OY1 - OY0) / 2, YM = (OY0 + OY1) / 2, ZT = ZS + R, N = 14, pts = [];
      for (let i = 0; i <= N; i++) { const a = Math.PI - Math.PI * i / N; pts.push([YM + R * Math.cos(a), ZS + R * Math.sin(a)]); }
      const qs = [];
      for (let i = 0; i < N; i++) {
        const [a, b] = [pts[i], pts[i + 1]];
        for (const x of [WX0, WX1]) qs.push([[x, a[0], a[1]], [x, b[0], b[1]], [x, b[0], ZT], [x, a[0], ZT]]);   // timpani sui due lati
        qs.push([[WX0, a[0], a[1]], [WX0, b[0], b[1]], [WX1, b[0], b[1]], [WX1, a[0], a[1]]]);                  // intradosso curvo
      }
      mesh(P + 'Muro_Letto_Arco', WALL, qs);
      box(P + 'Muro_Letto_Architrave', WALL, WX0, OY0, ZT, WX1, OY1, HW);
    }
    // specchio a figura intera a sinistra, sul lato letto (sud del muro), accanto alla TV
    box(P + 'Specchio_Cornice', [236, 236, 233, 255], WX1, -512, 12, WX1 + 1.6, -422, 192);
    box(P + 'Specchio', [196, 212, 222, 255], WX1 + 1.6, -510, 14, WX1 + 1.8, -424, 190);

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

    // ---------- 4 PAX da 100 x 58 aperti, senza ante, a tutta parete ovest (y -531..-131) ----------
    const drawers = (k, y0, y1) => {
      shelf(P + k + '_Ripiano_Cassetti', y0, y1, 102);
      for (const [j, z] of [[0, 187], [1, 160], [2, 130]]) shelf(P + k + '_Ripiano_' + j, y0, y1, z);
      for (let j = 0; j < 5; j++) {
        const zz = PL + T + 0.4 + j * 18.2;
        box(P + k + '_Cassetto_' + j, OAKF, X1 - 3, y0 + T + 0.3, zz, X1 - 1.2, y1 - T - 0.3, zz + 17.4);
        box(P + k + '_Cassetto_Ombra_' + j, BLK, X1 - 3.2, y0 + T + 0.3, zz + 17.4, X1 - 1, y1 - T - 0.3, zz + 18.2);
      }
    };
    const SH = [[170, 120, 90], [60, 60, 66], [200, 190, 170], [140, 100, 84]];
    const mods = [['M1', -531, 'aste'], ['M2', -431, 'cassetti'], ['M3', -331, 'lunga'], ['M4', -231, 'aste']];
    for (const [k, y0, kind] of mods) {
      const y1 = y0 + 100;
      carcass(k, y0, y1);
      shelf(P + k + '_Ripiano_Alto', y0, y1, 190);
      if (kind === 'aste') { shelf(P + k + '_Ripiano_Basso', y0, y1, 14); rail(P + k + '_Asta_0', y0, y1, 184); rail(P + k + '_Asta_1', y0, y1, 98); }
      else if (kind === 'lunga') {                                       // asta lunga per abiti + 3 ripiani scarpe in basso con qualche scatola
        rail(P + k + '_Asta', y0, y1, 184);
        for (const [j, z] of [[0, 14], [1, 34], [2, 54]]) {
          shelf(P + k + '_Scarpe_' + j, y0, y1, z);
          for (let q = 0; q < 3; q++) { const c = SH[(j + q) % SH.length]; box(P + k + '_Scarpa_' + j + '_' + q, [c[0], c[1], c[2], 255], X0 + 6, y0 + 8 + q * 28, z + 1.6, X0 + 26, y0 + 30 + q * 28, z + 11); }
        }
      } else drawers(k, y0, y1);
    }

    // ---------- retro del muro (x 158): 4 uncini a 170 cm, nel tratto verso il fondo ----------
    for (let q = 0; q < 4; q++) tube(P + 'Uncino_' + q, STL, [[WX0 - 0.1, -490 + q * 45, 170], [WX0 - 5, -490 + q * 45, 170], [WX0 - 6.5, -490 + q * 45, 173]], [0.5, 0.5, 0.5], 8);

    // ---------- fondo della cabina (sud): pouf, tappeto passatoia ----------
    rbox(P + 'Pouf', [150, 160, 146, 255], [108, -508, 0, 148, -468, 40], 6, 4);
    box(P + 'Tappeto', [205, 196, 176, 255], 96, -520, 0, 156, -150, 0.8);

    // ---------- luci della cabina: 2 plafoniere (il muro fa ombra a quella della camera) ----------
    for (const [k, y, sh] of [[0, -440, 1], [1, -230, 0]]) {
      tube(P + 'Plafoniera_' + k, [248, 248, 244, 255], [[120, y, 326], [120, y, 330]], [16, 16], 24);
      tube(P + 'Plafoniera_Diffusore_' + k, [255, 238, 200, 255], [[120, y, 325], [120, y, 326]], [14, 14], 24);
      if (light) light({ p: [120, y, 324], d: [0, 0, -1], a: 68, pen: 0.5, c: [255, 214, 160], i: 240, sh, g: 'armadio-v4' });
    }
  });
};
