// Composizione BESTA (IKEA) APPESA sotto la TV della camera a sud, nello spazio tra i due PAX da 100 della variante `armadio-v2` (muro OVEST, y -421..-241: i PAX arrivano a filo, senza spazi).
// Solo blocchi appesi (a muro), in un'unica fila sotto la TV: tre moduli da 60 x 40 x 38 (180 in tutto, centrati su y -331) a z 32..70, quindi sopra il pavimento
// e a 28 cm dalla TV (che parte da 98): a sinistra (sud) un modulo con un'anta, al centro un modulo APERTO con un ripiano e libri, a destra (nord) un modulo con due cassetti.
// Telaio bianco da 2 cm, fronti piatti verde grigio (ricordano i comodini), push-open (niente maniglie). Misure e composizione: scelte di progetto. Misure in cm.
module.exports = function bestaCamera({ box, tube, rbox, slab, group, n }) {
  const WHT = [244, 243, 240, 255], GRN = [100, 116, 102, 255], SHD = [200, 199, 196, 255];
  const P = '/Besta/';
  const X0 = 31, D = 40, X1 = X0 + D, T = 2, W = 60;

  const unit = (nm, y0, z0, h, doors) => {                                  // un modulo da 60 x 40 x h, ante piatte
    const y1 = y0 + W, Q = P + nm + '_';
    box(Q + 'Fondo', WHT, X0, y0, z0, X1, y1, z0 + T);
    box(Q + 'Cielo', WHT, X0, y0, z0 + h - T, X1, y1, z0 + h);
    box(Q + 'Fianco_S', WHT, X0, y0, z0 + T, X1, y0 + T, z0 + h - T);
    box(Q + 'Fianco_N', WHT, X0, y1 - T, z0 + T, X1, y1, z0 + h - T);
    box(Q + 'Schiena', SHD, X0, y0 + T, z0 + T, X0 + 0.5, y1 - T, z0 + h - T);
    const w = (W - 0.4) / doors;
    for (let k = 0; k < doors; k++)
      box(Q + 'Anta_' + k, GRN, X1 - 0.5, y0 + 0.2 + k * w + 0.15, z0 + 0.3, X1 + 1.3, y0 + 0.2 + (k + 1) * w - 0.15, z0 + h - 0.3);
  };

  group('besta', () => {
    const yA = -421, yB = -361, yC = -301;                                  // sud: -421..-361, centro: -361..-301, nord: -301..-241
    const Z = 32, H = 38;                                                  // tutti appesi: z 32..70
    // sud: un'anta
    unit('H_S', yA, Z, H, 1);
    // centro: modulo aperto (nessuna anta) con un ripiano a meta' e qualche libro
    {
      const y1 = yB + W, Q = P + 'H_C_';
      box(Q + 'Fondo', WHT, X0, yB, Z, X1, y1, Z + T);
      box(Q + 'Cielo', WHT, X0, yB, Z + H - T, X1, y1, Z + H);
      box(Q + 'Fianco_S', WHT, X0, yB, Z + T, X1, yB + T, Z + H - T);
      box(Q + 'Fianco_N', WHT, X0, y1 - T, Z + T, X1, y1, Z + H - T);
      box(Q + 'Schiena', SHD, X0, yB + T, Z + T, X0 + 0.5, y1 - T, Z + H - T);
      box(Q + 'Ripiano', WHT, X0 + 0.5, yB + T, Z + 18, X1 - 1, y1 - T, Z + 19.6);
      rbox(Q + 'Libro_0', [120, 70, 60, 255], [X0 + 4, yB + 8, Z + T, X0 + 28, yB + 13, Z + 16.5], 0.5, 0.3);
      rbox(Q + 'Libro_1', [60, 90, 140, 255], [X0 + 4, yB + 13.3, Z + T, X0 + 28, yB + 17.8, Z + 15.5], 0.5, 0.3);
      rbox(Q + 'Libro_2', [196, 176, 120, 255], [X0 + 4, yB + 18.2, Z + T, X0 + 28, yB + 23, Z + 16], 0.5, 0.3);
      tube(Q + 'Cesto', [196, 170, 120, 255], [[X0 + 20, yB + 42, Z + 19.6], [X0 + 20, yB + 42, Z + 28]], [8, 9], 16);
    }
    // nord: due cassetti
    {
      const y1 = yC + W, Q = P + 'H_N_';
      box(Q + 'Fondo', WHT, X0, yC, Z, X1, y1, Z + T);
      box(Q + 'Cielo', WHT, X0, yC, Z + H - T, X1, y1, Z + H);
      box(Q + 'Fianco_S', WHT, X0, yC, Z + T, X1, yC + T, Z + H - T);
      box(Q + 'Fianco_N', WHT, X0, y1 - T, Z + T, X1, y1, Z + H - T);
      box(Q + 'Schiena', SHD, X0, yC + T, Z + T, X0 + 0.5, y1 - T, Z + H - T);
      for (let k = 0; k < 2; k++)
        box(Q + 'Cassetto_' + k, GRN, X1 - 0.5, yC + 0.35, Z + 0.3 + k * 18.7, X1 + 1.3, y1 - 0.35, Z + 18.7 + k * 18.7 - 0.15);
    }
    // sopra il piano: un vasetto con una piantina a sud, due libri piatti e un piattino a nord
    tube(P + 'Vaso_0', [236, 232, 220, 255], [[X0 + 20, yA + 30, Z + H], [X0 + 20, yA + 30, Z + H + 10], [X0 + 20, yA + 30, Z + H + 18]], [4, 5.5, 2.5], 14);
    tube(P + 'Pianta_0', [90, 140, 80, 255], [[X0 + 20, yA + 30, Z + H + 18], [X0 + 20, yA + 30, Z + H + 32]], [1.2, 5.5], 10);
    rbox(P + 'Libri_0', [120, 70, 60, 255], [X0 + 8, yC + 12, Z + H, X0 + 30, yC + 34, Z + H + 3.5], 0.6, 0.4);
    rbox(P + 'Libri_1', [196, 176, 120, 255], [X0 + 9, yC + 13, Z + H + 3.5, X0 + 29, yC + 33, Z + H + 6], 0.6, 0.4);
  });
};
