// Ingresso (corridoio), muro sud (y 0) dopo il calorifero (x -300..-240): 1 attaccapanni da parete moderni, bianchi: barra orizzontale con steli verticali che terminano in dischi-appendi
// (forma dalla foto: barra con 10 dischi di 4..6 cm di diametro... stimati: raggi 1,4..3,1 cm; ingombro ~66 x 37 cm). Dimensioni da foto, nessuna scheda: stime.
// Le coordinate dei dischi sono i pixel della foto (u = (px - 175) * 0,04 cm, v = -(py - 765) * 0,04 cm rispetto alla barra). I dischi sporgono 3,5 cm dal muro, la barra 1,5.
// Misure in cm.
module.exports = function attaccapanni({ box, tube, group }) {
  const WHT = [244, 244, 242, 255];
  const P = '/Attaccapanni/';
  const S = 0.04, px = x => (x - 175) * S, py = y => -(y - 765) * S;
  const DISCS = [[175, 765, 75], [1815, 765, 52], [460, 610, 36], [730, 265, 78], [1210, 470, 35], [1480, 590, 50], [460, 880, 72], [1215, 880, 50], [1480, 1005, 35], [730, 1195, 50]];
  const STEMS = [[460, 610, 880], [730, 265, 1195], [1210, 470, 880], [1480, 590, 1005]];
  const yw = 0;                                                  // faccia interna del muro sud del corridoio; gli oggetti sporgono verso +y
  const rack = (nm, x0, zb) => {
    tube(P + nm + '_Barra', WHT, [[x0 + px(175), yw + 1.5, zb], [x0 + px(1815), yw + 1.5, zb]], [0.45, 0.45], 8);
    STEMS.forEach(([sx, a, b], i) => tube(P + nm + '_Stelo_' + i, WHT, [[x0 + px(sx), yw + 1.5, zb + py(a)], [x0 + px(sx), yw + 1.5, zb + py(b)]], [0.45, 0.45], 8));
    DISCS.forEach(([dx, dy, r], i) => tube(P + nm + '_Disco_' + i, WHT, [[x0 + px(dx), yw + 2.2, zb + py(dy)], [x0 + px(dx), yw + 3.5, zb + py(dy)]], [r * S, r * S], 20));
  };
  group('ingresso-attaccapanni', () => {
    rack('A', -158, 140);                                        // centrato tra il calorifero (x -240) e l'arco (x -11): da x -158 a -92, barra a 140 cm, dischi da 123 a 160
  });
};
