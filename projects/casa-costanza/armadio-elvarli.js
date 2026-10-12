// Antibagno del WC grande, muro est: guardaroba IKEA ELVARLI bianco, combinazione 84,4 x 55 x 216 cm (dalla scheda del prodotto: 2 montanti, 3 ripiani 80 x 51,
// 1 asta appendiabiti 80, 1 cassetto 80 x 51, traversa di stabilizzazione). Dimensioni e componenti dalla scheda; forma dei montanti (2 montanti per lato, davanti e dietro),
// altezze dei ripiani, dell'asta e del cassetto sono stime (la scheda dice 'a muro', il sistema reale poggia a terra con staffe a muro: qui e' fissato a terra).
// Posizione: schiena contro il muro est (x -182), fronte verso ovest, y 143..227,4 nei 90 cm dell'antibagno (tra muro sud y 139 e tramezzo y 229); a 10 cm dallo stipite della porta nord (x -247).
// Misure in cm.
module.exports = function armadioElvarli({ box, tube, group }) {
  const WHT = [246, 246, 244, 255], CHR = [200, 202, 206, 255];
  const P = '/Elvarli/';
  const XE = -182, D = 55, W = 84.4, H = 216, PW = 2.2, PD = 3.5, SH = 51;
  const x0 = XE - D, y0 = 143, y1 = y0 + W;
  group('antibagno-elvarli', () => {
    for (const [s, ya] of [['S', y0], ['N', y1 - PW]]) {
      box(P + 'Montante_Fronte_' + s, WHT, x0, ya, 0, x0 + PD, ya + PW, H);
      box(P + 'Montante_Retro_' + s, WHT, XE - PD, ya, 0, XE, ya + PW, H);
    }
    const ys0 = y0 + PW, ys1 = y1 - PW, xs0 = XE - SH;                    // ripiani 80 x 51 tra i montanti, appoggiati dietro
    for (const [i, z] of [[1, 8], [2, 125], [3, 205]]) box(P + 'Ripiano_' + i, WHT, xs0, ys0, z, XE - PD, ys1, z + 1.6);
    box(P + 'Traversa', WHT, x0 + PD, ys0, H - 6, xs0 + 1, ys1, H - 3);        // traversa di stabilizzazione in alto, davanti
    tube(P + 'Asta', CHR, [[-209, ys0, 190], [-209, ys1, 190]], [1.1, 1.1], 12);   // asta appendiabiti 80, sotto il ripiano alto
    box(P + 'Cassetto_Fondo', WHT, xs0 + 1, ys0 + 0.5, 30, XE - PD - 1, ys1 - 0.5, 31.2);   // cassetto 80 x 51: fondo, lati e frontale
    box(P + 'Cassetto_Lato_S', WHT, xs0 + 1, ys0 + 0.5, 30, XE - PD - 1, ys0 + 1.7, 48);
    box(P + 'Cassetto_Lato_N', WHT, xs0 + 1, ys1 - 1.7, 30, XE - PD - 1, ys1 - 0.5, 48);
    box(P + 'Cassetto_Retro', WHT, XE - PD - 2.2, ys0 + 0.5, 30, XE - PD - 1, ys1 - 0.5, 48);
    box(P + 'Cassetto_Frontale', WHT, xs0 - 1.6, ys0 + 0.2, 28, xs0, ys1 - 0.2, 50);
    tube(P + 'Cassetto_Maniglia', CHR, [[xs0 - 1.6, (ys0 + ys1) / 2 - 7, 46], [xs0 - 1.6, (ys0 + ys1) / 2 + 7, 46]], [0.6, 0.6], 8);
  });
};
