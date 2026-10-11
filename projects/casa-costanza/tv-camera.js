// TV da circa 43" (16:9: schermo 95 x 54) appesa a parete nella camera a sud, sul muro OVEST, TRA I DUE PAX da 100 della variante `armadio-v2`
// (lo spazio tra i due PAX e' y -421..-241, 180 cm, centrato su y -331, di fronte al letto). Quota: centro a ~125 da terra. Spessore 4,5.
// Se e' acceso l'armadio v1 (angolare) la TV finisce contro il suo modulo a cassetti: usarla con `armadio-v2`. Misure in cm, stime di progetto.
module.exports = function tvCamera({ box, tube, rbox, slab, group, n }) {
  const P = '/TVCamera/';
  const XW = 31, YC = -331, TW = 95.3, TH = 53.6, ZC = 125;
  const y0 = YC - TW / 2, y1 = YC + TW / 2, z0 = ZC - TH / 2, z1 = ZC + TH / 2;
  group('tv-camera', () => {
    rbox(P + 'TV_Corpo', [26, 28, 32, 255], [XW, y0, z0, XW + 4.5, y1, z1], 0.8, 0.4);
    box(P + 'TV_Schermo', [16, 18, 24, 255], XW + 4.4, y0 + 1.2, z0 + 1.2, XW + 4.6, y1 - 1.2, z1 - 1.2);
    box(P + 'TV_Staffa', [50, 52, 56, 255], XW - 0.01, YC - 8, ZC - 8, XW + 0.5, YC + 8, ZC + 8);
  });
};
