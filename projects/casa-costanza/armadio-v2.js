// Armadio v2 · DUE PAX da 100, bianchi, senza ante, uno a ciascun estremo (sinistra e destra) della parete OVEST della camera a sud (x 31, y -531..-131).
// Ognuno e' un modulo da 100, profondo 58 (misura PAX) e alto 201 (tipica PAX). Sud (y -521..-421): 2 aste + ripiano alto e basso. Nord (y -241..-141): 3 ripiani
// e 5 cassetti. In mezzo restano 180 cm (y -421..-241), occupati dalla composizione BESTA (a filo, senza spazi) e dalla TV; verso i muri sud e nord restano 10 cm per lato. Montanti da 1,8, fondi da 0,5: stime.
// E' una variante di `armadio` (stessa `variant`): accendere uno spegne l'altro. Misure in cm, stime di progetto.
module.exports = function armadioV2({ box, tube, rbox, slab, group, n }) {
  const OAK = [244, 243, 240, 255], OAKD = [226, 225, 222, 255], OAKF = [250, 249, 247, 255], STL = [198, 200, 204, 255], BLK = [60, 56, 50, 255];
  const P = '/ArmadioV2/';
  const T = 1.8, H = 201, PL = 8;
  const X0 = 31, X1 = 31 + 58;                           // contro il muro ovest, profondo 58, aperto verso est

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

  group('armadio-v2', () => {
    // ---------- PAX sud: y -531..-431 (100): 2 aste + ripiano alto e basso ----------
    const s0 = -521, s1 = s0 + 100;
    carcass('S1', s0, s1); shelf(P + 'S1_Ripiano_Alto', s0, s1, 190); shelf(P + 'S1_Ripiano_Basso', s0, s1, 14);
    rail(P + 'S1_Asta_0', s0, s1, 184); rail(P + 'S1_Asta_1', s0, s1, 98);

    // ---------- PAX nord: y -241..-141 (100): 3 ripiani in alto e 5 cassetti ----------
    const n0 = -241, n1 = n0 + 100;
    carcass('N1', n0, n1);
    for (const [k, z] of [[0, 187], [1, 160], [2, 130]]) shelf(P + 'N1_Ripiano_' + k, n0, n1, z);
    shelf(P + 'N1_Ripiano_Cassetti', n0, n1, 102);
    for (let k = 0; k < 5; k++) {
      const z0 = PL + T + 0.4 + k * 18.2;
      box(P + 'N1_Cassetto_' + k, OAKF, X1 - 3, n0 + T + 0.3, z0, X1 - 1.2, n1 - T - 0.3, z0 + 17.4);
      box(P + 'N1_Cassetto_Ombra_' + k, BLK, X1 - 3.2, n0 + T + 0.3, z0 + 17.4, X1 - 1, n1 - T - 0.3, z0 + 18.2);
    }
  });
};
