// Armadio PAX angolare (IKEA), BIANCO (variante bianca), SENZA ante, nell'angolo SUD-OVEST della camera a sud (angolo interno x 31, y -531).
// Dal disegno quotato: in pianta una L: lato lungo 187,8 x profondo 58 (modulo angolo con aste 74,8 (qui ridotto a 50) + modulo con cassetti 99,8; il lato inizia a 12,7 dal muro)
// e lato corto profondo 35 lungo 102,3 (due elementi: 52,5 a mensole e 49,8 con le scarpiere bianche); ingombro 187,8 x 160,3. Altezza 201 (misura tipica PAX, non
// letta dal disegno). Montanti da 1,8 e fondi da 0,5 sono stime dalle foto.
// Disposizione (scelta di progetto): il lato lungo (58 di profondita') lungo il muro OVEST, da y -531 a -343; il lato corto (35) lungo il muro SUD, da x 89 a 191,
// con il fronte verso nord; entrambi aperti verso la stanza. Il lato corto arriva a x 191, a ~2 cm dal telaio della porta-finestra (x 189..309).
// Misure in cm, stime di progetto.
module.exports = function armadio({ box, tube, rbox, slab, group, n }) {
  const OAK = [244, 243, 240, 255], OAKD = [226, 225, 222, 255], OAKF = [250, 249, 247, 255], STL = [198, 200, 204, 255], WHT = [244, 242, 238, 255], BLK = [60, 56, 50, 255];   // bianco (era rovere con mordente bianco)
  const P = '/Armadio/';
  const T = 1.8, H = 201, PL = 8;                       // montanti, altezza totale, zoccolo
  const XW = 31, YS = -531;                              // angolo sud-ovest interno

  // elemento aperto: dir 'E' = aperto verso est (lungo il muro ovest), 'N' = aperto verso nord (lungo il muro sud)
  const carcass = (nm, x0, y0, x1, y1, dir) => {
    const Q = P + nm + '_';
    box(Q + 'Zoccolo', BLK, dir === 'E' ? x0 + 1 : x0 + 1, dir === 'E' ? y0 + 1 : y0 + 1, 0, dir === 'E' ? x1 - 3 : x1 - 1, dir === 'E' ? y1 - 1 : y1 - 3, PL);
    box(Q + 'Cielo', OAK, x0, y0, H - T, x1, y1, H);
    box(Q + 'Fondo', OAK, x0, y0, PL, x1, y1, PL + T);
    if (dir === 'E') {
      box(Q + 'Fianco_S', OAK, x0, y0, PL + T, x1, y0 + T, H - T);
      box(Q + 'Fianco_N', OAK, x0, y1 - T, PL + T, x1, y1, H - T);
      box(Q + 'Schiena', OAKD, x0, y0 + T, PL + T, x0 + 0.5, y1 - T, H - T);
    } else {
      box(Q + 'Fianco_O', OAK, x0, y0, PL + T, x0 + T, y1, H - T);
      box(Q + 'Fianco_E', OAK, x1 - T, y0, PL + T, x1, y1, H - T);
      box(Q + 'Schiena', OAKD, x0 + T, y0, PL + T, x1 - T, y0 + 0.5, H - T);
    }
  };
  const shelf = (nm, x0, y0, x1, y1, dir, z) => dir === 'E'
    ? box(nm, OAKF, x0 + 0.5, y0 + T, z, x1 - 1.5, y1 - T, z + 1.6)
    : box(nm, OAKF, x0 + T, y0 + 0.5, z, x1 - T, y1 - 1.5, z + 1.6);

  group('armadio', () => {
    // ---------- lato lungo (profondo 58) lungo il muro ovest: parte a 12,7 dal muro sud ----------
    const ax0 = XW, ax1 = XW + 58;
    const a1y0 = YS + 12.7, a1y1 = a1y0 + 50, a2y0 = a1y1, a2y1 = a2y0 + 99.8;
    // modulo d'angolo (largo 50 su richiesta; nel disegno IKEA 74,8): ripiano alto e due aste (alta e media)
    carcass('A1', ax0, a1y0, ax1, a1y1, 'E');
    shelf(P + 'A1_Ripiano_Alto', ax0, a1y0, ax1, a1y1, 'E', 190);
    shelf(P + 'A1_Ripiano_Basso', ax0, a1y0, ax1, a1y1, 'E', 14);
    for (const [k, z] of [[0, 184], [1, 98]])
      tube(P + 'A1_Asta_' + k, STL, [[ax0 + 29, a1y0 + T, z], [ax0 + 29, a1y1 - T, z]], [1.3, 1.3], 10);
    // modulo con cassetti (99,8): 3 ripiani in alto, 5 cassetti in basso
    carcass('A2', ax0, a2y0, ax1, a2y1, 'E');
    for (const [k, z] of [[0, 187], [1, 160], [2, 130]]) shelf(P + 'A2_Ripiano_' + k, ax0, a2y0, ax1, a2y1, 'E', z);
    shelf(P + 'A2_Ripiano_Cassetti', ax0, a2y0, ax1, a2y1, 'E', 102);
    for (let k = 0; k < 5; k++) {
      const z0 = PL + T + 0.4 + k * 18.2;
      box(P + 'A2_Cassetto_' + k, OAKF, ax1 - 3, a2y0 + T + 0.3, z0, ax1 - 1.2, a2y1 - T - 0.3, z0 + 17.4);
      box(P + 'A2_Cassetto_Ombra_' + k, BLK, ax1 - 3.2, a2y0 + T + 0.3, z0 + 17.4, ax1 - 1, a2y1 - T - 0.3, z0 + 18.2);
    }

    // ---------- lato corto (profondo 35) lungo il muro sud: dal fronte del lato lungo (x 89) verso est, 102,3 ----------
    const by0 = YS, by1 = YS + 35, b1x0 = ax1, b1x1 = b1x0 + 52.5, b2x0 = b1x1, b2x1 = b2x0 + 49.8;
    carcass('B1', b1x0, by0, b1x1, by1, 'N');
    for (let k = 0; k < 5; k++) shelf(P + 'B1_Ripiano_' + k, b1x0, by0, b1x1, by1, 'N', 38 + k * 32);
    carcass('B2', b2x0, by0, b2x1, by1, 'N');
    for (let k = 0; k < 7; k++)                                  // scarpiere bianche (7), poco inclinate: dalla foto
      rbox(P + 'B2_Scarpiera_' + k, WHT, [b2x0 + T + 0.5, by0 + 3, 20 + k * 25, b2x1 - T - 0.5, by1 - 1, 23 + k * 25], 0.6, 0.5);
  });
};
