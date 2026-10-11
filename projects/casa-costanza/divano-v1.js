// Divano v1 · modello "Cavarelli" (Poltronesofa), configurazione LINEARE 286 x 103 x 89: tre moduli di seduta da 85,3 e due fianchi sottili da 15.
// Resa dalle foto di prodotto: blocchi di seduta bassi (43 da terra) a trapuntatura (3 x 2 cuscini per modulo, con le righe
// di cucitura in vista sul fronte e sul piano), schienale a cuscini separati trapuntati 2 x 2 con bottone centrale e inclinati all'indietro, spalla bassa
// dietro, fianchi sottili piu' alti verso il dorso, quasi nessuno zoccolo. Tre moduli in tre toni, come nella foto (verde bosco, verde prato, sabbia).
// Dati del produttore: lineare 286 x 103 x 89, modulo pouf 80 x 80 x 43. Spessori, inclinazione e tessuti sono stime dalla foto.
// Posizione (dallo schizzo dell'utente): addossato al muro est (x 430), dritto, con il lato corto a ridosso del calorifero sul muro sud (y 0..10).
// Misure in cm, stime di progetto. Non include tappeto ne' lampada.
module.exports = function divanoV1({ box, tube, rbox, slab, group, n }) {
  // [seduta, parti scure (spalla, fianco)]
  const TONES = [[[84, 104, 72, 255], [66, 82, 58, 255]],       // verde bosco (lato sud)
                 [[128, 164, 72, 255], [104, 136, 60, 255]],    // verde prato
                 [[200, 188, 164, 255], [170, 158, 136, 255]]]; // sabbia (lato nord)
  const BTN = [58, 70, 50, 255];
  const BLK = [40, 42, 46, 255];
  const P = '/DivanoV1/';
  const XW = 327, XE = 430, YS = 12, YN = 298;      // ingombro: 103 x 286
  const SIDE = 15, MW = (YN - YS - 2 * SIDE) / 3;    // fianchi 15, moduli 85,3
  const XS = 406;                                    // fine della zona seduta (profondita' 79), poi la spalla fino al muro

  group('divano-v1', () => {
    box(P + 'Ombra_Basamento', BLK, XW + 4, YS + 4, 0, XE - 4, YN - 4, 3);                           // zoccolino rientrato

    // fianchi sottili: bassi davanti, piu' alti verso il dorso; stesso tono del modulo vicino
    for (const [nm, y0, y1, t] of [['Sud', YS, YS + SIDE, 0], ['Nord', YN - SIDE, YN, 2]]) {
      rbox(P + 'Fianco_' + nm + '_Basso', TONES[t][1], [XW, y0, 3, XE, y1, 54], 5, 5);
      rbox(P + 'Fianco_' + nm + '_Alto', TONES[t][1], [370, y0, 3, XE, y1, 72], 5, 5);
    }

    for (let k = 0; k < 3; k++) {
      const [FAB, FABD] = TONES[k];
      const y0 = YS + SIDE + k * MW, y1 = y0 + MW;
      // seduta trapuntata: 3 (lungo y) x 2 (lungo x) cuscini morbidi, 43 da terra; le righe di cucitura si leggono sul fronte e sul piano
      const pw = MW / 3, pd = (XS - XW) / 2;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++)
        rbox(P + 'Seduta_' + k + '_' + i + j, FAB, [XW + j * pd + 0.2, y0 + i * pw + 0.2, 3, XW + (j + 1) * pd + (j ? 0 : 1.5), y0 + (i + 1) * pw - 0.2, 43], 4.5, 5.5);
      // spalla bassa dietro la seduta
      rbox(P + 'Spalla_' + k, FABD, [XS - 0.5, y0 + 0.3, 3, XE, y1 - 0.3, 58], 3, 3);
      // cuscino di schiena trapuntato 2 x 2 con bottone, inclinato indietro (i quadrotti alti sono spostati verso il muro)
      const hw = (MW - 1.6) / 2;
      for (let c = 0; c < 2; c++) for (let r = 0; r < 2; r++) {
        const xb = 391 + r * 7, z0 = 43 + r * 20, ya = y0 + 0.8 + c * hw;                 // le due file si sovrappongono: nessun gradino
        rbox(P + 'Schiena_' + k + '_' + c + r, FAB, [xb, ya + 0.2, z0, xb + 22, ya + hw - 0.2, z0 + 26], 7, 8, 3);
      }
      tube(P + 'Schiena_Bottone_' + k, BTN, [[391 + 3.5 - 0.6, y0 + MW / 2, 43 + 22], [391 + 3.5 - 2.2, y0 + MW / 2, 43 + 22]], [1.3, 1.3], 10);
    }
  });
};
