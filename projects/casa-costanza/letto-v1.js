// Letto v1 · IKEA GLADSTAD, letto imbottito con 2 contenitori (Kabusa grigio chiaro), versione 160 x 200, nella CAMERA A SUD (interno x 31..430, y -531..-131).
// Dalla scheda IKEA e dal disegno quotato: ingombro 167 x 212, testiera = pannello piatto alto 95, telaio alto 33, rete a doghe, 2 contenitori su ruote
// (interno 96 x 57, alti 17, escursione 60) TUTTI E DUE SULLO STESSO LATO LUNGO, con frontale imbottito e cinghia; piedini, tessuto grigio chiaro (tre toni). Il materasso (non incluso) e il piumone sono stime.
// Posizione: testiera contro il muro EST (x 430), centrato in larghezza sulla camera (y -331), lato lungo 200 verso ovest (x 218..430):
// libero davanti alla porta a nord (x 200..290, a 116 cm) e alla porta-finestra a sud.
// Misure in cm, stime di progetto.
module.exports = function lettoV1({ box: _box, tube: _tube, rbox: _rbox, slab, group, n }) {
  // il letto e' disegnato con la testiera a ovest (x 31) e poi SPECCHIATO in x (x' = 461 - x): testiera contro il muro EST (x 430)
  const MX = 461;
  const box = (nm, c, x0, y0, z0, x1, y1, z1) => _box(nm, c, MX - x1, y0, z0, MX - x0, y1, z1);
  const rbox = (nm, c, b, r, top, bot) => _rbox(nm, c, [MX - b[3], b[1], b[2], MX - b[0], b[4], b[5]], r, top, bot);
  const tube = (nm, c, p, r, seg) => _tube(nm, c, p.map(q => [MX - q[0], q[1], q[2]]), r, seg);
  const G1 = [182, 180, 176, 255], G2 = [164, 162, 158, 255], G3 = [200, 198, 194, 255];   // tre toni di grigio
  const LEG = [40, 42, 46, 255];
  const WHT = [244, 242, 238, 255];
  const P = '/LettoV1/';
  const XH = 31, YC = -331;                                // coordinate di costruzione (testiera a ovest, poi specchiata): asse a meta' camera
  const TH = 6, LM = 200, WM = 160, FR = 3.5, FT = 6;      // testiera 6 cm, materasso 160 x 200, fianchi 3,5, pediera 6 (ingombro 212)
  const x0 = XH, x1 = XH + TH, x2 = x1 + LM, x3 = x2 + FT;  // testiera x0..x1, vano materasso x1..x2, pediera x2..x3 (ingombro 212)
  const y0 = YC - WM / 2 - FR, y1 = YC + WM / 2 + FR;       // ingombro 167

  group('letto-v1', () => {
    // ---------- piedini d'acciaio (12 cm) ----------
    for (const [x, y] of [[x0 + 6, y0 + 5], [x0 + 6, y1 - 5], [x3 - 6, y0 + 5], [x3 - 6, y1 - 5], [x1 + 90, y0 + 5], [x1 + 90, y1 - 5]])
      box(P + 'Piede_' + x + '_' + y, LEG, x - 2.5, y - 2.5, 0, x + 2.5, y + 2.5, 12);

    // ---------- telaio imbottito (alto 33): testiera = pannello piatto largo 167 alto 95; fianchi e pediera bassi; rete a doghe ----------
    rbox(P + 'Testiera', G2, [x0, y0, 10, x1, y1, 95], 3, 4);                                    // 167 x 6 x 95
    rbox(P + 'Fianco_Sud', G1, [x1, y0, 12, x2, y0 + FR, 33], 1.5, 1);                           // lato senza contenitori: pannello pieno
    rbox(P + 'Pediera', G1, [x2, y0, 12, x3, y1, 33], 2, 1.5);                                    // alta 33
    rbox(P + 'Base_Rete', G3, [x1, y0 + FR, 12, x2, y1 - FR, 20], 1, 1);                          // rete a doghe, coperta dal materasso
    // ---------- 2 contenitori su ruote, TUTTI E DUE SUL LATO NORD (verso la porta), uno dopo l'altro: frontali imbottiti larghi 96, alti ~19, con cinghia di apertura ----------
    rbox(P + 'Fianco_Nord_Cielo', G1, [x1, y1 - FR, 30.5, x2, y1, 33], 1, 1);                    // fascia piena sopra i frontali
    for (let k = 0; k < 2; k++) {
      const xa = x1 + 3 + k * 98;
      rbox(P + 'Contenitore_' + k, G3, [xa, y1 - 1.5, 12, xa + 96, y1 + 0.8, 30], 1.5, 1);
      tube(P + 'Contenitore_Cinghia_' + k, G2, [[xa + 48, y1 + 1, 28], [xa + 48, y1 + 1.2, 20]], [1.8, 1.8], 8);
      for (const dx of [10, 86])                                                                   // ruote
        tube(P + 'Contenitore_Ruota_' + k + '_' + dx, LEG, [[xa + dx, y1 - 5, 4], [xa + dx, y1 - 5, 4.1]], [3.2, 3.2], 10);
    }

    // ---------- materasso, due cuscini, piumone (stime) ----------
    rbox(P + 'Materasso', WHT, [x1 + 0.5, YC - WM / 2, 20, x2 - 0.5, YC + WM / 2, 42], 3, 3);
    for (const [k, dy] of [[0, -38], [1, 38]])
      rbox(P + 'Cuscino_' + k, [236, 234, 230, 255], [x1 + 4, YC + dy - 25, 42, x1 + 4 + 18, YC + dy + 25, 55], 5, 5);
    rbox(P + 'Piumone', [212, 208, 200, 255], [x1 + 70, y0 + 1, 40, x2 + 1, y1 - 1, 49], 4, 4);
  });
};
