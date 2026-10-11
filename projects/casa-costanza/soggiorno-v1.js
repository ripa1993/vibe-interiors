// Soggiorno v1 (due gruppi indipendenti: 'soggiorno-divano' = divano + tappeto + lampada, 'soggiorno-tv' = mobile TV + TV + pianta) · divano ad L addossato al muro est + TV sul muro nord (stato finale: kitchen aperta, arco a ovest).
// Interno soggiorno: x 0..430, y 0..n (n = y del muro nord interno). Muro est a x=430; il tratto di muro nord con la TV e' x 120..288.
//   - Divano ad L 280 x 180: braccio corto sul muro est (x 335..430, y 300..385), braccio lungo con la schiena a sud (x 150..430, y 205..300),
//     seduta rivolta alla TV a nord; la schiena resta a 205 cm dal muro sud (libero davanti alla porta).
//   - Mobile TV basso in rovere (x 125..283, profondo 40) con TV a parete da 55" centrata sul tratto di muro (x 204).
//   - Tappeto, lampada ad arco, pianta nell'angolo nord-est, cuscini.
// Misure in cm, stime di progetto. Non tocca la porta (x 204..284 a sud, libero fino a y 170) ne' il calorifero (x 310..396, y 0..10).
module.exports = function soggiornoV1({ box, tube, rbox, slab, group, n }) {
  const FAB = [148, 144, 136, 255];      // tessuto grigio caldo
  const FABD = [128, 124, 118, 255];
  const CUS1 = [190, 112, 82, 255];      // cuscini terracotta
  const CUS2 = [214, 178, 96, 255];      // senape
  const RUG = [214, 204, 188, 255];
  const OAK = [196, 158, 108, 255];
  const WH = [236, 233, 226, 255];
  const BLK = [34, 36, 40, 255];
  const ST = [188, 191, 196, 255];
  const GRN = [84, 128, 82, 255];
  const POT = [200, 190, 175, 255];
  const P = '/SoggiornoV1/';
  const TVX = 204;                       // centro del tratto di muro nord

  group('soggiorno-divano', () => {
    // ---------- tappeto ----------
    rbox(P + 'Tappeto', RUG, [140, 223, 0, 380, 443, 1.2], 2, 0.4);

    // ---------- divano ad L (280 x 180, profondo 95): braccio CORTO sul muro est, braccio lungo con la schiena a sud, rivolto alla TV ----------
    const xW = 150, yS = 205, yM = 300, yE = 385;      // braccio lungo: x 150..430, y 205..300 · braccio corto: x 335..430, y 300..385
    for (const [x, y] of [[xW + 6, yS + 6], [290, yS + 6], [422, yS + 6], [xW + 6, yM - 6], [340, yM - 6], [340, yE - 6], [422, yE - 6]])
      box(P + 'Divano_Piede_' + x + '_' + y, BLK, x - 2, y - 2, 0, x + 2, y + 2, 10);
    rbox(P + 'Divano_Seduta_Lungo', FAB, [xW, yS, 10, 430, yM, 40], 4, 2);
    rbox(P + 'Divano_Seduta_Corto', FAB, [335, yM, 10, 430, yE, 40], 4, 2);
    rbox(P + 'Divano_Schienale_Lungo', FABD, [xW, yS, 10, 430, yS + 18, 86], 5, 3);        // schiena a sud
    rbox(P + 'Divano_Schienale_Corto', FABD, [412, yS + 18, 10, 430, yE, 86], 5, 3);       // schiena sul muro est
    rbox(P + 'Divano_Bracciolo_Ovest', FABD, [xW, yS + 18, 10, xW + 12, yM, 62], 4, 3);
    rbox(P + 'Divano_Bracciolo_Nord', FABD, [335, yE - 12, 10, 412, yE, 62], 4, 3);
    for (let k = 0; k < 4; k++)                                                            // cuscini di seduta
      rbox(P + 'Divano_Cuscino_Seduta_' + k, FAB, [xW + 13 + k * 62, yS + 19, 40, xW + 13 + (k + 1) * 62 - 1.5, yM - 1, 47], 3, 2);
    rbox(P + 'Divano_Cuscino_Seduta_Corto', FAB, [338, yM + 1, 40, 411, yE - 13, 47], 3, 2);
    rbox(P + 'Divano_Cuscino_Dorso_1', CUS1, [190, yS + 19, 47, 235, yS + 37, 82], 3, 3);
    rbox(P + 'Divano_Cuscino_Dorso_2', CUS2, [320, yS + 19, 47, 365, yS + 37, 80], 3, 3);
    rbox(P + 'Divano_Cuscino_Dorso_3', CUS1, [394, 323, 47, 412, 363, 80], 3, 3);

    // ---------- lampada ad arco (a nord del divano) ----------
    tube(P + 'Lampada_Base', BLK, [[410, 408, 0], [410, 408, 3]], [12, 12], 18);
    tube(P + 'Lampada_Stelo', BLK, [[410, 408, 3], [410, 408, 170]], [0.9, 0.9], 8);
    tube(P + 'Lampada_Paralume', [244, 232, 214, 255], [[410, 408, 150], [410, 408, 182]], [9, 15], 18);

  });

  group('soggiorno-tv', () => {
    // ---------- mobile TV + TV a parete ----------
    const y0 = n - 40;
    rbox(P + 'MobileTV_Corpo', OAK, [125, y0, 12, 283, n, 45], 1.5, 0.8);
    box(P + 'MobileTV_Zoccolo', BLK, 128, y0 + 3, 0, 280, n - 3, 12);
    for (const [k, x0, x1] of [[0, 126, 183], [1, 184, 244], [2, 245, 282]])
      rbox(P + 'MobileTV_Anta_' + k, WH, [x0, y0 - 1.2, 14, x1, y0, 43], 0.8, 0.5);
    for (const x of [180, 241])
      tube(P + 'MobileTV_Maniglia_' + x, ST, [[x - 4, y0 - 2.4, 36], [x - 4, y0 - 2.4, 26]], [0.5, 0.5], 8);
    rbox(P + 'TV_Corpo', BLK, [TVX - 61.5, n - 4.5, 100, TVX + 61.5, n - 0.5, 171], 0.8, 0.4);   // 55": 123 x 71
    box(P + 'TV_Schermo', [16, 18, 24, 255], TVX - 60, n - 4.6, 101.5, TVX + 60, n - 4.4, 169.5);
    rbox(P + 'MobileTV_Soundbar', BLK, [TVX - 45, y0 + 4, 45, TVX + 45, y0 + 12, 52], 2, 1);
    rbox(P + 'MobileTV_Vaso', POT, [262, n - 24, 45, 276, n - 10, 62], 6, 3);
    tube(P + 'MobileTV_Pianta_Stelo', GRN, [[269, n - 17, 62], [269, n - 17, 85]], [0.7, 4.5], 10);

    // ---------- pianta verde nell'angolo nord-est ----------
    tube(P + 'Pianta_Vaso', POT, [[408, 480, 0], [408, 480, 34]], [15, 17], 18);
    tube(P + 'Pianta_Fogliame_1', GRN, [[408, 480, 34], [408, 480, 92], [408, 480, 130]], [3, 17, 8], 14);
    tube(P + 'Pianta_Fogliame_2', GRN, [[401, 475, 34], [404, 476, 80], [407, 477, 112]], [2, 12, 6], 12);
  });
};
