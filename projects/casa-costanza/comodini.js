// Due comodini accanto al letto (camera sud): tavolino HALSTON 40 x 48h, verde scuro effetto legno, con vano (deghi.it).
// Dalla scheda del prodotto: dimensioni 40 x 38 cm, altezza 48, verde scuro effetto legno; la forma del vano:
// forma presa dalla foto (profilo a "C": piano, ripiano basso con bordino, pannello pieno con incavo circolare); dimensioni dalla scheda: 40 x 38 cm, altezza 48; spessori stimati. Posizione: addossati al muro est ai due lati della testiera del letto, a 5 cm dal letto, fronte verso ovest.
// Misure in cm, stime di progetto.
module.exports = function comodini({ box, tube, rbox, slab, group, n }) {
  const GRN = [88, 106, 86, 255], GRND = [70, 88, 70, 255], INT = [86, 112, 94, 255], BLK = [40, 42, 46, 255];
  const P = '/Comodini/';
  const XE = 430, W = 38, D = 40, H = 48;                       // scheda: 40 x 38, h 48 -> 40 di profondita' (x, dal muro) e 38 di larghezza (y); il fondo e' contro il muro est
  const YBED0 = -414.5, YBED1 = -247.5;                          // ingombro del letto in y (167)
  const x0 = XE - D;

  group('comodini', () => {
    // Forma dalla foto: profilo a "C" (in alto un piano che sporge, in basso un ripiano con un bordino, dietro un pannello pieno contro il muro) con un grande incavo
    // circolare sul pannello; si sta in piedi sul pavimento, senza gambe. Pannello 6, piano alto 4,5, ripiano basso 4,5 (con bordino da 1,5 sui tre lati aperti).
    const table = (nm, ya) => {
      const yb = ya + W, Q = P + nm + '_';
      rbox(Q + 'Piano', GRN, [x0, ya, H - 4.5, XE, yb, H], 1.0, 0.8);
      box(Q + 'Pannello', GRN, XE - 6, ya, 4.5, XE, yb, H - 4.5);
      rbox(Q + 'Ripiano', GRN, [x0, ya, 0, XE, yb, 4.5], 1.0, 0.8);
      box(Q + 'Bordino_Fronte', GRN, x0, ya, 4.5, x0 + 1.5, yb, 6);
      box(Q + 'Bordino_Sud', GRN, x0 + 1.5, ya, 4.5, XE - 6, ya + 1.5, 6);
      box(Q + 'Bordino_Nord', GRN, x0 + 1.5, yb - 1.5, 4.5, XE - 6, yb, 6);
      // incavo circolare sul pannello (raggio 15, centro a meta' altezza): disco piu' scuro appena incassato nella faccia interna
      const yc = ya + W / 2, zc = 4.5 + (H - 9) / 2;
      tube(Q + 'Incavo', GRND, [[XE - 6.1, yc, zc], [XE - 5.6, yc, zc]], [15.5, 15.5], 28);
    };
    table('Sud', YBED0 - 5 - W);          // y -459.5..-419.5
    table('Nord', YBED1 + 5);             // y -242.5..-202.5
    // sul ripiano basso due libri; sui piani un vasetto con una piantina e un libro
    rbox(P + 'Sud_Libri_Basso_0', [236, 232, 220, 255], [x0 + 6, YBED0 - 5 - W + 8, 6, x0 + 28, YBED0 - 5 - W + 30, 9.5], 0.6, 0.4);
    rbox(P + 'Sud_Libri_Basso_1', [196, 176, 120, 255], [x0 + 7, YBED0 - 5 - W + 9, 9.5, x0 + 27, YBED0 - 5 - W + 29, 12], 0.6, 0.4);
    rbox(P + 'Sud_Libro', [120, 70, 60, 255], [x0 + 8, YBED0 - 5 - W + 8, H, x0 + 28, YBED0 - 5 - W + 28, H + 3], 0.8, 0.5);
    tube(P + 'Nord_Vasetto', [236, 232, 220, 255], [[XE - 14, YBED1 + 5 + 20, H], [XE - 14, YBED1 + 5 + 20, H + 12], [XE - 14, YBED1 + 5 + 20, H + 20]], [4.2, 5.5, 2.5], 14);
    tube(P + 'Nord_Pianta', [90, 140, 80, 255], [[XE - 14, YBED1 + 5 + 20, H + 20], [XE - 14, YBED1 + 5 + 20, H + 30]], [1.2, 5], 10);
  });
};
