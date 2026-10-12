// Ante a SPECCHIO per i due PAX da 100 della variante `armadio-v2` (gruppo separato, si accende insieme a `armadio-v2`).
// Per ogni PAX due ante a battente da 50 (come le ante a specchio PAX): cornice bianca da 2 cm, specchio incassato (appena in rilievo), maniglia a barra verticale
// bianca sul lato di chiusura al centro. Altezza ante 196 (da 4 a 200). Cornice 1,8 e maniglia sono stime; il colore dello specchio e' una resa (grigio-azzurro chiaro).
// Misure in cm, stime di progetto.
module.exports = function armadioAnte({ box, tube, rbox, slab, group, n }) {
  const FR = [240, 240, 238, 255], MIR = [196, 212, 222, 255], HND = [236, 236, 238, 255];
  const P = '/ArmadioAnte/';
  const XF = 31 + 58;                                  // fronte dei PAX
  const Z0 = 4, Z1 = 200, F = 1.8;                     // ante: altezza 196, cornice 1,8

  group('armadio-v2', () => {
    for (const [pn, y0] of [['S', -521], ['N', -241]]) {                     // i due PAX da 100: sud (y -521..-421) e nord (y -241..-141)
      for (let k = 0; k < 2; k++) {
        const a0 = y0 + k * 50 + 0.15, a1 = y0 + (k + 1) * 50 - 0.15, Q = P + pn + k + '_';
        rbox(Q + 'Anta', FR, [XF, a0, Z0, XF + 2, a1, Z1], 0.5, 0.4);
        box(Q + 'Specchio', MIR, XF + 2, a0 + F, Z0 + F, XF + 2.4, a1 - F, Z1 - F);
        // maniglia a barra verticale sul bordo verso il centro del PAX (k=0: bordo nord, k=1: bordo sud)
        const hy = k === 0 ? a1 - 4 : a0 + 4;
        box(Q + 'Maniglia', HND, XF + 2, hy - 0.8, 96, XF + 4.5, hy + 0.8, 124);
      }
    }
  });
};
