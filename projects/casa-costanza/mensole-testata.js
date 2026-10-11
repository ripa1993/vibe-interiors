// Mensole minimali sulla parete verde salvia dietro la testata (muro EST della camera a sud, faccia interna x 430): due mensole a ripiano sottile in rovere chiaro
// (18 cm di profondita', 2,5 di spessore) sopra la testiera (che arriva a 95): una piu' lunga a z 132 (110 cm, centrata sul letto, y -331) e una corta a z 158 (70 cm,
// spostata verso nord). Sopra, pochi libri (in piedi e piatti, toni spenti), un vasetto e una piantina. Misure in cm, stime di progetto.
module.exports = function mensoleTestata({ box, tube, rbox, group }) {
  const OAK = [208, 178, 132, 255];
  const P = '/MensoleTestata/';
  const XW = 430, D = 18, T = 2.5;
  const YC = -331;

  group('mensole-testata', () => {
    // mensola bassa: 110 cm, z 132
    const z1 = 132, ya = YC - 55, yb = YC + 55;
    rbox(P + 'Mensola_Bassa', OAK, [XW - D, ya, z1, XW, yb, z1 + T], 0.6, 0.5);
    let y = ya + 6;                                                       // 6 libri in piedi, da sud verso nord, con qualche vuoto
    for (const [w, h, c] of [[3, 24, [112, 96, 82, 255]], [2.4, 21, [214, 206, 188, 255]], [3.2, 26, [78, 96, 110, 255]], [2.6, 22, [176, 142, 112, 255]], [3, 25, [226, 220, 206, 255]], [2.2, 20, [96, 108, 92, 255]]]) {
      box(P + 'Libro_' + y.toFixed(1), c, XW - 15, y, z1 + T, XW - 2, y + w, z1 + T + h);
      y += w + 0.2;
    }
    tube(P + 'Vaso_0', [236, 232, 220, 255], [[XW - 9, yb - 12, z1 + T], [XW - 9, yb - 12, z1 + T + 8], [XW - 9, yb - 12, z1 + T + 14]], [3.4, 4.4, 2.2], 14);
    tube(P + 'Pianta_0', [96, 130, 84, 255], [[XW - 9, yb - 12, z1 + T + 14], [XW - 9, yb - 12, z1 + T + 26]], [1, 5], 10);

    // mensola alta: 70 cm, z 158, spostata verso nord
    const z2 = 158, yc = YC + 22, yd = yc + 70, ye = yc;
    rbox(P + 'Mensola_Alta', OAK, [XW - D, ye, z2, XW, yd, z2 + T], 0.6, 0.5);
    let zz = z2 + T;                                                       // 3 libri piatti + una tazza
    for (const [h, w, c] of [[3.2, 24, [88, 104, 124, 255]], [2.6, 21, [226, 220, 206, 255]], [2.4, 22, [150, 118, 96, 255]]]) {
      box(P + 'Libro_Piatto_' + zz.toFixed(1), c, XW - 16, yc + 8, zz, XW - 16 + w, yc + 8 + 17, zz + h);
      zz += h;
    }
    tube(P + 'Tazza_0', [232, 228, 218, 255], [[XW - 9, yc + 52, z2 + T], [XW - 9, yc + 52, z2 + T + 8.5]], [4, 4], 14);
  });
};
