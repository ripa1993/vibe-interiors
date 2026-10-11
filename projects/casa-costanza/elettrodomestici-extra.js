// Elettrodomestici da appoggio salvati per il futuro: MICROONDE e FRIGGITRICE AD ARIA.
// Erano nella cucina v1 (sul piano d'angolo, fronti a nord) e sono stati tolti; qui il disegno resta pronto da riusare.
//
// Per riattivarli:
//   1) in house.js: defGroup('cucina-extra', 'Cucina · microonde e friggitrice', 'Cucina');
//   2) in house.js, dopo il require di cucina-v1: require('./elettrodomestici-extra.js')({ box, tube, rbox, group, n: yT0 });
//   (sono un gruppo a parte: indipendente dalle varianti della cucina, spento di default)
//
// Misure in cm. `n` e' la y del muro nord interno della COT. Posizione di partenza (da cambiare a piacere):
//   microonde 45 x 34 x 28 a x -168..-123, friggitrice 30 x 36 x 33 a x -116..-86, entrambi a y n-360..n-324, z da 94 (sul piano d'angolo).
module.exports = function elettrodomesticiExtra({ box, tube, rbox, group, n }) {
  const BLK = [40, 42, 46, 255];
  const ST = [188, 191, 196, 255];
  const P = '/CucinaExtra/';
  const GL = [22, 24, 28, 255];

  group('cucina-extra', () => {
    // microonde 45 x 34 x 28 (angolo ovest)
    rbox(P + 'Microonde_Corpo', [60, 62, 68, 255], [-168, n - 358, 94, -123, n - 324, 122], 2, 1.2);
    box(P + 'Microonde_Vetro', GL, -166, n - 324, 96, -141, n - 322.8, 120);
    box(P + 'Microonde_Comandi', ST, -139, n - 324, 96, -125, n - 322.8, 120);
    for (const [k, z] of [[0, 110], [1, 102]]) tube(P + 'Microonde_Manopola_' + k, BLK, [[-132, n - 322.8, z], [-132, n - 320.8, z]], [2.2, 2.2], 12);
    tube(P + 'Microonde_Maniglia', ST, [[-142.5, n - 321.5, 98], [-142.5, n - 321.5, 118]], [0.8, 0.8]);
    // friggitrice ad aria 30 x 36 x 33
    rbox(P + 'Friggitrice_Corpo', [34, 36, 40, 255], [-116, n - 360, 94, -86, n - 324, 127], 7, 6);
    box(P + 'Friggitrice_Cestello', [52, 54, 60, 255], -114, n - 324, 96, -88, n - 322.8, 110);
    tube(P + 'Friggitrice_Maniglia', ST, [[-110, n - 321.4, 108], [-92, n - 321.4, 108]], [0.9, 0.9], 10);
    box(P + 'Friggitrice_Display', [70, 130, 200, 255], -108, n - 324, 114, -94, n - 322.8, 122);
  });
};
