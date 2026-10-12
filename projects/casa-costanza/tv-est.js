// Variante "TV a EST" del soggiorno: parete attrezzata sul muro est (x 430, y 0..501) con TV da 55" su pannello a doghe, mobile BASSO a tre parti (struttura in grigio chiaro), due
// colonne ai lati (una a giorno con libri e piante, una chiusa con anta in vetro) e due mensole sospese sopra la TV. Mobile "strutturato", non solo una fila sotto.
// Allineata all'ANGOLO NORD della parete est: l'ultima colonna e' contro il muro nord (y 501) e la parete va da y 231 a 501 (le quote y qui sotto sono quelle di costruzione,
// prima dello spostamento di +116). Disposizione (y crescente verso nord): colonna a giorno (y 115..160) · mobile basso 180 (y 160..340: cassetti 60 | nicchia aperta per la soundbar 60 | ante 60)
// · colonna chiusa con vetro (y 340..385); pannello a doghe dietro la TV (y 160..340, z 45..200); TV centrata a y 250, centro a z 125; mensole sospese a z 178 e 196.
// Misure in cm, stime di progetto. Va usata con un divano rivolto a EST: i gruppi `tavolo`, `divano-v1`, `divano-v2` e `soggiorno-divano` oggi sono pensati per la TV a nord e
// si sovrappongono a questa parete (x > 388): vanno spenti o riposizionati.
module.exports = function tvEst({ box: _box, tube: _tube, rbox: _rbox, slab, group, n }) {
  // tutta la parete e' disegnata con y 115..385 e poi spostata di +116: la colonna chiusa va a filo del muro NORD (y 501, angolo nord-est), il mobile arriva a y 231..501
  const DY = n - 385;
  const box = (nm, c, x0, y0, z0, x1, y1, z1) => _box(nm, c, x0, y0 + DY, z0, x1, y1 + DY, z1);
  const rbox = (nm, c, b, r, top, bot) => _rbox(nm, c, [b[0], b[1] + DY, b[2], b[3], b[4] + DY, b[5]], r, top, bot);
  const tube = (nm, c, p, r, seg) => _tube(nm, c, p.map(q => [q[0], q[1] + DY, q[2]]), r, seg);
  const ANT = [176, 178, 182, 255], OAK = [200, 164, 116, 255], WAL = [124, 96, 70, 255], GLS = [150, 170, 178, 110], BLK = [30, 32, 36, 255];
  const P = '/TVEst/';
  const XE = 430;
  const YC = 250;                                           // asse della TV
  const BD = 42, TD = 38;                                   // profondita' del mobile basso e delle colonne

  group('soggiorno-tv-est', () => {
    // ---------- pannello a doghe dietro la TV (y 160..340, z 45..200): doghe da 3,6 con distanza 1,4, su un fondo scuro ----------
    box(P + 'Pannello_Fondo', BLK, XE - 1.2, 160, 45, XE, 340, 200);
    for (let k = 0; k < 36; k++) box(P + 'Doga_' + k, WAL, XE - 3, 160 + k * 5, 45, XE - 1.2, 160 + k * 5 + 3.6, 200);
    // ---------- TV 55": 123 x 71, centro a y 250, z 125 (sul pannello) ----------
    rbox(P + 'TV_Corpo', [26, 28, 32, 255], [XE - 7.5, YC - 61.5, 89.5, XE - 3, YC + 61.5, 160.5], 0.8, 0.4);
    box(P + 'TV_Schermo', [16, 18, 24, 255], XE - 7.6, YC - 60, 91, XE - 7.4, YC + 60, 159);

    // ---------- mobile BASSO (180 x 42 x 45, su zoccolo da 8): cassetti | nicchia | ante ----------
    const b0 = 160, b1 = 340, xb = XE - BD;
    box(P + 'Basso_Zoccolo', BLK, xb + 3, b0 + 3, 0, XE - 3, b1 - 3, 8);
    box(P + 'Basso_Fondo', ANT, xb, b0, 8, XE, b1, 10);
    box(P + 'Basso_Cielo', ANT, xb, b0, 43, XE, b1, 45);
    for (const y of [b0, b0 + 59, b0 + 119, b1 - 2]) box(P + 'Basso_Montante_' + y, ANT, xb, y, 10, XE, y + 2, 43);
    box(P + 'Basso_Schiena', ANT, XE - 0.5, b0, 10, XE, b1, 43);
    // cassetti (3 da 60 x 11): fronti in rovere
    for (let k = 0; k < 3; k++) {
      const z0 = 10.4 + k * 11.1;
      box(P + 'Basso_Cassetto_' + k, OAK, xb - 1.6, b0 + 2.3, z0, xb + 0.2, b0 + 58.7, z0 + 10.6);
    }
    // nicchia centrale aperta (60): ripiano a meta' con soundbar, console e un libro
    box(P + 'Basso_Nicchia_Ripiano', ANT, xb + 1, b0 + 61, 26, XE - 0.5, b0 + 118, 27.6);
    rbox(P + 'Soundbar', BLK, [xb + 12, b0 + 75, 27.6, xb + 22, b0 + 105, 33], 1.5, 1);
    rbox(P + 'Console', [236, 232, 224, 255], [xb + 10, b0 + 68, 10.4, xb + 28, b0 + 82, 15.5], 1, 0.8);
    // due ante a battente (60)
    for (let k = 0; k < 2; k++)
      box(P + 'Basso_Anta_' + k, OAK, xb - 1.6, b0 + 121.3 + k * 29.4, 10.4, xb + 0.2, b0 + 121.3 + (k + 1) * 29.4 - 0.7, 42.6);

    // ---------- colonna A GIORNO (sud, y 115..160, 45 x 38 x 200): libri e piante ----------
    const s0 = 115, s1 = 160, xs = XE - TD;
    box(P + 'ColS_Zoccolo', BLK, xs + 3, s0 + 2, 0, XE - 3, s1 - 1, 8);
    box(P + 'ColS_Fianco_Sud', ANT, xs, s0, 8, XE, s0 + 2, 200);
    box(P + 'ColS_Fianco_Nord', ANT, xs, s1 - 2, 8, XE, s1, 200);
    box(P + 'ColS_Schiena', ANT, XE - 0.5, s0 + 2, 8, XE, s1 - 2, 198);
    box(P + 'ColS_Cielo', ANT, xs, s0, 198, XE, s1, 200);
    for (const [k, z] of [[0, 8], [1, 40], [2, 72], [3, 104], [4, 136], [5, 168]]) box(P + 'ColS_Ripiano_' + k, OAK, xs, s0 + 2, z, XE - 0.5, s1 - 2, z + 2);
    let y = s0 + 4;
    for (const [w, h, c] of [[2.6, 24, [112, 96, 82, 255]], [3, 27, [214, 206, 188, 255]], [2.4, 22, [78, 96, 110, 255]], [3.2, 26, [196, 168, 120, 255]], [2.8, 23, [150, 110, 96, 255]]]) {
      box(P + 'ColS_Libro_' + y.toFixed(1), c, xs + 6, y, 74, xs + 25, y + w, 74 + h); y += w + 0.2;
    }
    tube(P + 'ColS_Vaso_0', [236, 232, 220, 255], [[xs + 18, s0 + 22, 106], [xs + 18, s0 + 22, 114], [xs + 18, s0 + 22, 120]], [3.6, 4.6, 2.4], 14);
    tube(P + 'ColS_Pianta_0', [90, 140, 80, 255], [[xs + 18, s0 + 22, 120], [xs + 18, s0 + 22, 132]], [1, 5], 10);
    tube(P + 'ColS_Pianta_1', [96, 130, 84, 255], [[xs + 20, s0 + 22, 138], [xs + 20, s0 + 22, 148]], [3.4, 4.6], 14);
    tube(P + 'ColS_Pianta_1_Fogliame', [96, 130, 84, 255], [[xs + 20, s0 + 22, 148], [xs + 20, s0 + 22, 158]], [4.6, 1.2], 12);
    rbox(P + 'ColS_Cesto', [196, 170, 120, 255], [xs + 6, s0 + 6, 10, xs + 32, s1 - 6, 30], 4, 2, 2);

    // ---------- colonna CHIUSA (nord, y 340..385): anta bassa in rovere, anta alta con vetro ----------
    const t0 = 340, t1 = 385;
    box(P + 'ColN_Zoccolo', BLK, xs + 3, t0 + 1, 0, XE - 3, t1 - 2, 8);
    box(P + 'ColN_Fianco_Sud', ANT, xs, t0, 8, XE, t0 + 2, 200);
    box(P + 'ColN_Fianco_Nord', ANT, xs, t1 - 2, 8, XE, t1, 200);
    box(P + 'ColN_Schiena', ANT, XE - 0.5, t0 + 2, 8, XE, t1 - 2, 198);
    box(P + 'ColN_Cielo', ANT, xs, t0, 198, XE, t1, 200);
    box(P + 'ColN_Fondo', ANT, xs, t0 + 2, 8, XE, t1 - 2, 10);
    for (const z of [60, 120, 150, 178]) box(P + 'ColN_Ripiano_' + z, OAK, xs + 0.5, t0 + 2, z, XE - 0.5, t1 - 2, z + 2);
    box(P + 'ColN_Anta_Bassa', OAK, xs - 1.6, t0 + 2.3, 10.4, xs + 0.2, t1 - 2.3, 118);
    box(P + 'ColN_Anta_Alta_Telaio_S', ANT, xs - 1.6, t0 + 2.3, 120, xs + 0.2, t0 + 5.5, 198);
    box(P + 'ColN_Anta_Alta_Telaio_N', ANT, xs - 1.6, t1 - 5.5, 120, xs + 0.2, t1 - 2.3, 198);
    box(P + 'ColN_Anta_Alta_Telaio_B', ANT, xs - 1.6, t0 + 5.5, 120, xs + 0.2, t1 - 5.5, 123);
    box(P + 'ColN_Anta_Alta_Telaio_T', ANT, xs - 1.6, t0 + 5.5, 195, xs + 0.2, t1 - 5.5, 198);
    box(P + 'ColN_Anta_Alta_Vetro', GLS, xs - 1.0, t0 + 5.5, 123, xs - 0.4, t1 - 5.5, 195);
    // qualche oggetto dietro il vetro
    rbox(P + 'ColN_Scatole', [226, 218, 200, 255], [xs + 6, t0 + 8, 152, xs + 28, t1 - 8, 168], 2, 1);
    tube(P + 'ColN_Vaso', [60, 120, 130, 255], [[xs + 16, YC + 115, 180], [xs + 16, YC + 115, 190]], [3.4, 3.4], 14);

    // ---------- due mensole sospese sopra la TV (z 178, 150 cm; z 196, 100 cm), in rovere ----------
    rbox(P + 'Mensola_Alta_0', OAK, [XE - 22, YC - 75, 178, XE, YC + 75, 180.5], 0.6, 0.5);
    rbox(P + 'Mensola_Alta_1', OAK, [XE - 18, YC - 20, 196, XE, YC + 80, 198.5], 0.6, 0.5);
    rbox(P + 'Alta_Libri_0', [150, 110, 90, 255], [XE - 16, YC - 60, 180.5, XE - 3, YC - 38, 184.5], 0.5, 0.3);
    rbox(P + 'Alta_Libri_1', [88, 104, 124, 255], [XE - 15.5, YC - 59, 184.5, XE - 3.5, YC - 39, 187.5], 0.5, 0.3);
    tube(P + 'Alta_Vaso', [236, 232, 220, 255], [[XE - 11, YC + 45, 180.5], [XE - 11, YC + 45, 188], [XE - 11, YC + 45, 194]], [3.6, 4.4, 2.2], 14);
    tube(P + 'Alta_Pianta', [96, 130, 84, 255], [[XE - 11, YC + 45, 194], [XE - 11, YC + 45, 204]], [1, 4.5], 10);
    tube(P + 'Alta_Cornice', [60, 56, 52, 255], [[XE - 7, YC + 30, 198.5], [XE - 7, YC + 30, 214]], [0.8, 0.8], 6);
  });
};
