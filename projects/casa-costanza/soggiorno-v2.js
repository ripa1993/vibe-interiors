// Soggiorno v2 · variante dalla piantina "bozza A" (piano primo, scala 1:100): divano dritto a 3 posti, tavolo OVALE 150 x 90 con 6 sedie e TV sul muro EST.
// Interno soggiorno: x 0..430, y 0..501 (n). Le misure sono ricavate dal disegno ingrandito, calibrato sul soggiorno (0,61 px/cm):
//   - divano: 215 x 90 circa, schiena a OVEST (x 86), seduta verso EST, a 80 cm dal muro sud (y 80..295); due cuscini quadrati ruotati di 45 gradi sulle sedute.
//   - tavolo ovale 150 x 90, asse lungo in direzione ovest-est, centro (253, 380); sedie 2 + 2 sui lati lunghi e 1 per testa, centri a ~48 cm dall'asse (rientrano sotto il piano).
//   - MOBILE BASSO a EST: la fascia bianca profonda 44 cm lungo il muro (x 386..430), divisa a y 303 in due parti, e' un mobile basso (cosi' lo ha indicato l'utente); la TV non e' disegnata: la metto APPESA al muro est sull'asse del divano (y 184), sopra il mobile.
//   - composizione appesa a NORD del muro est (y 330..490): cinque quadri a galleria, mensola flottante con libri, vaso e piantina, pianta grande + oggetti sul mobile basso. Tutto stimato.
// STIME (non sulla piantina): altezza del mobile basso (55) e le sue ante (3 + 2), TV da 55" (123 x 71) con centro a 125 da terra, altezze e colori di divano, tavolo e sedie; la barra lunga
// disegnata nel mezzo della fascia (nel disegno sembra una maniglia o una scanalatura) non e' modellata. Il mobile parte da y 10 per non toccare il calorifero (x 310..396, y 0..10).
// E' un'alternativa a `divano-*`, `soggiorno-divano`, `tavolo` e `soggiorno-tv*`: con questo gruppo acceso vanno spenti (si sovrapporrebbero). Misure in cm.
module.exports = function soggiornoV2({ box, tube, rbox, slab, group, n }) {
  const FAB = [176, 172, 164, 255];      // tessuto grigio chiaro (seduta e schienale)
  const FABD = [152, 148, 140, 255];     // braccioli e fondo
  const CUS1 = [112, 128, 144, 255];     // cuscini quadrati: grigio-azzurro
  const CUS2 = [158, 166, 174, 255];
  const LEG = [44, 40, 36, 255];
  const OAK = [196, 158, 108, 255];      // piano del tavolo
  const BLK = [38, 40, 44, 255];
  const CH = [140, 142, 146, 255], CHD = [120, 122, 126, 255];   // sedie grigie
  const WH = [240, 239, 236, 255], WH2 = [247, 246, 243, 255];   // unita' bianca e ante
  const TVB = [28, 30, 34, 255], SCR = [12, 14, 18, 255];
  const P = '/SoggiornoV2/';

  group('soggiorno-v2', () => {
    // ---------- divano 3 posti: schiena a ovest, y 80..295 ----------
    const XB = 86, XF = 176, YS = 80, YN = 295, AW = 12, BT = 16;       // schiena, fronte, sud, nord, larghezza braccioli, spessore schienale
    rbox(P + 'Divano_Base', FABD, [XB, YS, 8, XF, YN, 40], 6, 3);
    rbox(P + 'Divano_Schienale', FAB, [XB, YS, 40, XB + BT, YN, 85], 5, 6);
    rbox(P + 'Divano_Bracciolo_Sud', FABD, [XB, YS, 40, XF, YS + AW, 62], 5, 5);
    rbox(P + 'Divano_Bracciolo_Nord', FABD, [XB, YN - AW, 40, XF, YN, 62], 5, 5);
    const sw = (YN - YS - 2 * AW) / 3;                                    // larghezza di una seduta (~63,7)
    for (let i = 0; i < 3; i++) {
      const y0 = YS + AW + i * sw;
      rbox(P + 'Divano_Seduta_' + (i + 1), FAB, [XB + BT, y0 + 0.4, 40, XF - 1, y0 + sw - 0.4, 52], 4, 4);
      rbox(P + 'Divano_Cuscino_Schiena_' + (i + 1), FAB, [XB + BT, y0 + 2, 52, XB + BT + 9, y0 + sw - 2, 80], 4, 4);
    }
    for (const [x, y] of [[XB + 6, YS + 6], [XB + 6, YN - 6], [XF - 6, YS + 6], [XF - 6, YN - 6]]) tube(P + 'Divano_Piede_' + x + '_' + y, LEG, [[x, y, 0], [x, y, 8]], [2.5, 2.5], 10);
    // due cuscini quadrati (lato 42) ruotati di 45 gradi, appoggiati sulle sedute: in pianta sono due rombi (stima: spostati di 8 cm a est rispetto al disegno per non toccare i cuscini di schiena)
    const diamond = (cx, cy, d) => [[cx, cy - d], [cx + d, cy], [cx, cy + d], [cx - d, cy]];
    slab(P + 'Cuscino_Quadrato_1', CUS1, diamond(148, 186, 29.7), 52, 62);
    slab(P + 'Cuscino_Quadrato_2', CUS2, diamond(142, 131, 29.7), 52, 62);

    // ---------- tavolo ovale 150 x 90 (altezza 75), centro (253, 380) ----------
    const TX = 253, TY = 380, A = 75, B = 45;
    slab(P + 'Tavolo_Piano', OAK, Array.from({ length: 48 }, (_, k) => [TX + A * Math.cos(2 * Math.PI * k / 48), TY + B * Math.sin(2 * Math.PI * k / 48)]), 71, 75);
    // cavalletti: piastre 8 x 48 a TX +-38, corte abbastanza (y +-24) da lasciare libere le sedute dei lati lunghi (che iniziano a y +-26) e le teste (x oltre +-46)
    for (const sx of [-1, 1]) rbox(P + 'Tavolo_Cavalletto_' + (sx < 0 ? 'Ovest' : 'Est'), BLK, [TX + sx * 38 - 4, TY - 24, 0, TX + sx * 38 + 4, TY + 24, 71], 1.5, 1);
    box(P + 'Tavolo_Traversa', BLK, TX - 38, TY - 2, 30, TX + 38, TY + 2, 35);

    // sedie 45 x 50 x 85 (seduta a 46,5), costruite con il davanti verso +y e poi ruotate di multipli di 90 gradi attorno al proprio centro
    const chair = (name, cx, cy, deg) => {
      const th = deg * Math.PI / 180, c = Math.round(Math.cos(th)), s = Math.round(Math.sin(th));
      const W = (x, y) => [cx + x * c - y * s, cy + x * s + y * c];
      const bx = (nm, col, x0, y0, z0, x1, y1, z1, fn = box, ...r) => {
        const a = W(x0, y0), b = W(x1, y1), bb = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), z0, Math.max(a[0], b[0]), Math.max(a[1], b[1]), z1];
        return fn === box ? box(nm, col, bb[0], bb[1], bb[2], bb[3], bb[4], bb[5]) : rbox(nm, col, bb, ...r);
      };
      bx(P + name + '_Seduta', CH, -22.5, -22, 42, 22.5, 22, 46.5, rbox, 3, 1.5);
      bx(P + name + '_Schienale', CHD, -22.5, -25, 46.5, 22.5, -21, 85, rbox, 2, 2);
      for (const [x, y] of [[-19, -19], [19, -19], [-19, 19], [19, 19]]) {
        const p = W(x, y);
        tube(P + name + '_Gamba_' + x + '_' + y, BLK, [[p[0], p[1], 0], [p[0], p[1], 42]], [1.6, 1.6], 8);
      }
    };
    chair('Sedia_N1', TX - 35, TY + 48, 180);                              // lato nord: guardano a sud
    chair('Sedia_N2', TX + 35, TY + 48, 180);
    chair('Sedia_S1', TX - 35, TY - 48, 0);                                // lato sud: guardano a nord
    chair('Sedia_S2', TX + 35, TY - 48, 0);
    chair('Sedia_O', TX - 69, TY, -90);                                    // testa ovest: guarda a est
    chair('Sedia_E', TX + 68, TY, 90);                                     // testa est: guarda a ovest

    // ---------- mobile basso a est: fascia profonda 44 (x 386..430) alta 55, divisa a y 303; TV appesa al muro sull'asse del divano ----------
    const XE = 430, UD = 44, UY0 = 10, UY1 = n, UH = 54.5, YD = 303;
    box(P + 'Mobile_Zoccolo', BLK, XE - UD + 4, UY0 + 1, 0, XE - 2, UY1 - 1, 6);
    box(P + 'Mobile_Corpo', WH, XE - UD + 2, UY0, 6, XE, UY1, UH - 2.5);
    box(P + 'Mobile_Piano', OAK, XE - UD, UY0, UH - 2.5, XE, UY1, UH);
    const parts = (a, b, k) => Array.from({ length: k }, (_, i) => [a + (b - a) * i / k, a + (b - a) * (i + 1) / k]);
    [...parts(UY0, YD, 3), ...parts(YD, UY1, 2)].forEach(([a, b], i) => box(P + 'Mobile_Anta_' + (i + 1), WH2, XE - UD, a + 0.3, 7, XE - UD + 2, b - 0.3, UH - 3));
    const YC = 184;                                                         // asse del divano (centro di y 80..295 = 187,5; arrotondato all'asse dei cuscini)
    const TW = 123, TH = 71, TZ = 125, XT = XE - 7.5;                       // TV 55" appesa: corpo x 422,5..426,5, staffa fino al muro; centro a 125 da terra (35 cm sopra il piano del mobile)
    box(P + 'TV_Staffa', BLK, XT + 4, YC - 9, TZ - 6, XE, YC + 9, TZ + 6);
    rbox(P + 'TV_Corpo', TVB, [XT, YC - TW / 2, TZ - TH / 2, XT + 4, YC + TW / 2, TZ + TH / 2], 1, 1);
    box(P + 'TV_Schermo', SCR, XT - 0.2, YC - TW / 2 + 1.2, TZ - TH / 2 + 1.2, XT, YC + TW / 2 - 1.2, TZ + TH / 2 - 1.2);

    // ---------- composizione a NORD del muro est (y 330..490): quadri, mensola con oggetti e pianta sul mobile (decorazione stimata) ----------
    // Adattatore: gli helper di decor.js lavorano su un muro lungo x (x = lungo il muro, y = distanza dal muro); qui il muro e' x 430, quindi x -> y del mondo e y -> 430 - distanza
    const bE = (nm, c, xa, ya, za, xb, yb, zb) => box(nm, c, XE - yb, xa, za, XE - ya, xb, zb);
    const tE = (nm, c, p, r, seg) => tube(nm, c, p.map(([x, y, z]) => [XE - y, x, z]), r, seg);
    const { pot, plant, frame, GRN2, TERRA, SAGE } = require('./decor.js')({ box: bE, tube: tE, P: P + 'Est_' });
    const DK = [40, 44, 50, 255], CER = [244, 242, 236, 255], SAND = [226, 214, 194, 255];
    // galleria di cinque quadri sulla stessa parete, z 125..215, y 330..463 (stampe 40 x 50, 30 x 40, 50 x 40, 24 x 30, 30 x 30)
    frame('Quadro_1', 330, 125, 40, 50, 0, -1, OAK, [150, 176, 160, 255], [240, 226, 190, 255], [60, 90, 80, 255]);
    frame('Quadro_2', 377, 150, 30, 40, 0, -1, DK, SAND, [214, 140, 100, 255], [120, 150, 125, 255]);
    frame('Quadro_3', 413, 120, 50, 40, 0, -1, [240, 238, 232, 255], [60, 82, 104, 255], [232, 190, 110, 255], [200, 210, 220, 255]);
    frame('Quadro_4', 330, 182, 24, 30, 0, -1, DK, [226, 190, 170, 255], [250, 240, 224, 255], [150, 100, 90, 255]);
    frame('Quadro_5', 425, 168, 30, 30, 0, -1, OAK, [190, 204, 196, 255], [214, 140, 100, 255], [90, 110, 100, 255]);
    // mensola flottante in rovere 90 x 14 a 224 da terra, sopra i quadri: libri, vaso con rami secchi, piantina con foglie che scendono
    const ZS = 224, ZT = ZS + 3.2;
    bE(P + 'Est_Mensola', OAK, 345, 0, ZS, 435, 14, ZT);
    [[350, 22, [200, 90, 80, 255]], [353.4, 19, [60, 90, 110, 255]], [356.8, 17, [226, 190, 110, 255]]].forEach(([y, h, c], i) => bE(P + 'Est_Libro_' + i, c, y, 2, ZT, y + 3, 12, ZT + h));
    tE(P + 'Est_Vaso', CER, [[392, 7, ZT], [392, 7, ZT + 24]], [4.5, 2.4], 20);
    tE(P + 'Est_Ramo_1', SAGE, [[392, 7, ZT + 23], [388, 7, ZT + 38], [385, 7, ZT + 50]], [0.3, 0.5, 0.2], 6);
    tE(P + 'Est_Ramo_2', SAGE, [[392, 7, ZT + 23], [397, 6, ZT + 36], [401, 6, ZT + 46]], [0.3, 0.5, 0.2], 6);
    pot('Vaso_Mensola', 421, 8.5, ZT, 8, 3.8, 4.8, TERRA);
    plant('Pianta_Mensola', 421, 8.5, ZT + 6, 7, 18, 5, GRN2);
    for (const [x, l] of [[418, 24], [424, 32], [430, 18]]) tE(P + 'Est_Rampicante_' + x, GRN2, [[x, 13, ZT + 2], [x + 1, 14.5, ZT - l * 0.5], [x, 14, ZT - l]], [0.3, 1.6, 0.2], 6);
    // sul piano del mobile, a nord: pila di libri, ciotola, vaso e una pianta grande (ficus) nell'angolo nord-est
    const ZP = UH;
    [[345, 28, 5, [226, 190, 110, 255]], [347, 24, 4, [60, 90, 110, 255]], [346, 20, 3, [200, 90, 80, 255]]].forEach(([y, w, h, c], i) => bE(P + 'Est_Pila_' + i, c, y, 8, ZP + i * 4 + (i ? 0 : 0), y + w, 8 + 20, ZP + i * 4 + h));
    tE(P + 'Est_Ciotola', CER, [[418, 20, ZP], [418, 20, ZP + 7]], [3.5, 9], 24);
    tE(P + 'Est_Vasetto', BLK, [[444, 14, ZP], [444, 14, ZP + 26]], [3.8, 2.2], 20);
    pot('Vaso_Grande', 480, 18, ZP, 26, 11, 14, CER);
    tE(P + 'Est_Tronco', [96, 74, 56, 255], [[480, 18, ZP + 24], [480, 18, ZP + 78]], [1.2, 1], 8);
    plant('Pianta_Grande', 480, 18, ZP + 70, 11, 48, 16, GRN2);
  });
};
