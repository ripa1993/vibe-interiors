// Antibagno del WC grande, muro ovest: scarpiera IKEA MACKAPÄR bianca, 80 x 35 x 102 cm (dalla scheda del prodotto: ante scorrevoli in vetro, ripiani regolabili, gambe metalliche anteriori,
// fissaggio a muro). Dimensioni dalla scheda; spessori, altezza gambe (10) e dettagli delle ante sono stime. I ripiani sono disegnati piani (il viewer non ruota i box): in realta' si inclinano.
// Posizione: contro il muro ovest (x -382), a nord dell'antibagno (y 148,5..228,5), fronte verso est; lascia libero il passaggio dalla porta sud (x -370..-290 -> resta libero da x -347).
// Sopra la scarpiera: stampa incorniciata 40 x 50 (z 122..172), centrata sul mobile. Misure in cm.
module.exports = function scarpieraAntibagno({ box, tube, group }) {
  const WHT = [244, 244, 242, 255], GL = [190, 215, 225, 70], CHR = [200, 202, 206, 255];
  const P = '/Scarpiera/';
  const XW = -382, D = 35, W = 80, Hh = 102, LEG = 10, T = 1.8;
  const x0 = XW, x1 = XW + D, y1 = 228.5, y0 = y1 - W, zb = LEG;
  group('antibagno-scarpiera', () => {
    box(P + 'Fianco_S', WHT, x0, y0, zb, x1, y0 + T, Hh);
    box(P + 'Fianco_N', WHT, x0, y1 - T, zb, x1, y1, Hh);
    box(P + 'Fondo', WHT, x0, y0 + T, zb, x0 + 0.8, y1 - T, Hh);
    box(P + 'Base', WHT, x0 + 0.8, y0 + T, zb, x1, y1 - T, zb + T);
    box(P + 'Top', WHT, x0, y0, Hh - T, x1, y1, Hh);
    const inner = (Hh - T - (zb + T)) / 4;                          // 3 ripiani interni, 4 vani
    for (let i = 1; i <= 3; i++) { const z = zb + T + inner * i; box(P + 'Ripiano_' + i, WHT, x0 + 0.8, y0 + T, z - 0.8, x1 - 2.5, y1 - T, z + 0.8); }
    for (const [i, ya] of [[1, y0 + T - 0.3], [2, (y0 + y1) / 2 - 0.5]]) {   // due ante in vetro scorrevoli su due guide (una davanti all'altra)
      const xf = i === 1 ? x1 - 0.6 : x1 - 2.0, ye = ya + W / 2 - T + 0.3 + 0.5;
      box(P + 'Anta_' + i + '_Vetro', GL, xf - 0.4, ya, zb + T + 1, xf, ye, Hh - T - 1);
      box(P + 'Anta_' + i + '_Telaio_Alto', WHT, xf - 0.8, ya, Hh - T - 2.5, xf, ye, Hh - T - 1);
      box(P + 'Anta_' + i + '_Telaio_Basso', WHT, xf - 0.8, ya, zb + T + 1, xf, ye, zb + T + 2.5);
      const hy = i === 1 ? ye - 2 : ya + 2;
      tube(P + 'Anta_' + i + '_Maniglia', CHR, [[xf + 0.8, hy, 48], [xf + 0.8, hy, 62]], [0.6, 0.6], 8);
    }
    box(P + 'Guida', WHT, x1 - 2.6, y0 + T, Hh - T - 1, x1, y1 - T, Hh - T);
    { // stampa sul muro ovest sopra la scarpiera: cornice rovere 40 x 50, passepartout, fondo, sole e linea (stessa grafica delle stampe del WC grande)
      const xw = XW, yc = (y0 + y1) / 2, w = 40, h = 50, z0 = 122, t = 1.5, ya = yc - w / 2, yb = yc + w / 2, OAK = [200, 164, 116, 255];
      const bx = (n, c, p0, za, p1, zb, a0, a1) => box(P + 'Stampa' + n, c, xw + a0, p0, za, xw + a1, p1, zb);
      bx('_Basso', OAK, ya, z0, yb, z0 + t, 0, 2); bx('_Alto', OAK, ya, z0 + h - t, yb, z0 + h, 0, 2);
      bx('_S', OAK, ya, z0 + t, ya + t, z0 + h - t, 0, 2); bx('_N', OAK, yb - t, z0 + t, yb, z0 + h - t, 0, 2);
      bx('_Passepartout', [248, 246, 240, 255], ya + t, z0 + t, yb - t, z0 + h - t, 0.5, 1);
      bx('_Fondo', [226, 214, 194, 255], ya + 4, z0 + 4, yb - 4, z0 + h - 4, 1, 1.2);
      bx('_Linea', [120, 150, 125, 255], ya + 4, z0 + h * 0.34, yb - 4, z0 + h * 0.34 + 2.5, 1.2, 1.4);
      tube(P + 'Stampa_Sole', [214, 140, 100, 255], [[xw + 1.2, yc, z0 + h * 0.6], [xw + 1.5, yc, z0 + h * 0.6]], [6.5, 6.5], 20);
    }
    for (const y of [y0 + 3, y1 - 3]) tube(P + 'Gamba_' + Math.round(y), CHR, [[x1 - 3, y, 0], [x1 - 3, y, zb]], [1.1, 1.1], 10);   // gambe metalliche anteriori
  });
};
