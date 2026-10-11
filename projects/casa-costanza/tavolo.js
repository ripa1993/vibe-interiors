// Tavolo allungabile EMMA (Mobili Fiver) grigio cemento con gambe incrociate nere + 4 sedie in plastica grigia, a SUD del divano, parallelo al suo schienale.
// Dalla scheda tecnica del tavolo (disegno quotato): piano 140 (chiuso) x 90 x 8 di spessore, altezza totale 75, luce sotto il piano 67; quattro piedi
// d'acciaio nero (feet) a terra e quattro gambe a sezione rettangolare che si incrociano a X, con piastre sotto il piano. Allunghe da 40: 140 / 180 / 220
// (qui disegnato CHIUSO, cambia LEN). Sedie "Carlotta" dal disegno quotato fornito dall'utente: ingombro 49 x 51 x 78, seduta a 46,5, schienale a fascia che avvolge (tre fasce, due feritoie).
// Posizione: lato lungo lungo x (parallelo allo schienale del divano a y 243), spostato verso est (centro x 330, x 260..400, a 30 cm dal muro est), bordo nord a y 160 -> 83 cm dallo schienale.
// Misure in cm, stime di progetto.
module.exports = function tavolo({ box, tube, rbox, slab, group, n }) {
  const LEN = 140, WID = 90, TH = 8, H = 75;                       // piano
  const CX = 330, YN = 160, YS = YN - WID, CY = (YN + YS) / 2;     // centro e bordi del piano
  const TOP = [148, 148, 146, 255];                                // grigio cemento
  const TOPS = [136, 136, 134, 255];                               // fianco / allunga
  const BLK = [38, 40, 44, 255];
  const CH = [140, 142, 146, 255], CHD = [120, 122, 126, 255];     // sedie grigie
  const P = '/Tavolo/';

  group('tavolo', () => {
    // ---------- piano: due semipiani con la linea dell'allunga al centro ----------
    const x0 = CX - LEN / 2, x1 = CX + LEN / 2;
    rbox(P + 'Piano_Ovest', TOP, [x0, YS, H - TH, CX - 0.2, YN, H], 1.2, 1);
    rbox(P + 'Piano_Est', TOP, [CX + 0.2, YS, H - TH, x1, YN, H], 1.2, 1);
    // ---------- gambe incrociate: da 4 piedi a terra a 4 piastre sotto il piano (profilo dal disegno, in pianta il sistema e' simmetrico per punto) ----------
    const F = (u, v) => [x0 + u, YN - v];                          // u dal bordo ovest, v dal bordo nord (come nel disegno)
    const legs = [[[27, 31], [95, 58]], [[113, 58], [45, 32]], [[40, 70], [98, 32]], [[100, 22], [45, 60]]];   // [piede, attacco al piano]
    legs.forEach(([a, b], k) => {
      const [fx, fy] = F(...a), [tx, ty] = F(...b);
      tube(P + 'Gamba_' + k, BLK, [[fx, fy, 0], [tx, ty, H - TH - 1]], [3.4, 3.4], 8);
      box(P + 'Piede_' + k, BLK, fx - 6, fy - 6, 0, fx + 6, fy + 6, 1.2);
      box(P + 'Piastra_' + k, BLK, tx - 6, ty - 6, H - TH - 1, tx + 6, ty + 6, H - TH);
    });

    // ---------- 4 sedie CARLOTTA (dal disegno quotato): seduta 45 x 46 a 46,5; schienale a fascia che AVVOLGE chi si siede (mezzo cerchio di raggio 24,5, tre fasce con
    // due feritoie) tra 54 e 78; quattro gambe sottili; ingombro 49 x 51 x 78. Colore grigio. `d` = +1 se lo schienale e' a nord (la sedia guarda a sud), -1 al contrario ----------
    const arcBand = (nm, cx, cyc, d, R, z0, z1, a0, a1) => {                 // fascia ad arco (spessore 2) tra gli angoli a0..a1 (gradi, 0 = est, 90 = dietro)
      const pts = [], N = 14;
      for (let i = 0; i <= N; i++) { const t = (a0 + (a1 - a0) * i / N) * Math.PI / 180; pts.push([cx + R * Math.cos(t), cyc + d * R * Math.sin(t)]); }
      for (let i = N; i >= 0; i--) { const t = (a0 + (a1 - a0) * i / N) * Math.PI / 180; pts.push([cx + (R - 2) * Math.cos(t), cyc + d * (R - 2) * Math.sin(t)]); }
      let A = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; A += p[0] * q[1] - q[0] * p[1]; }
      slab(nm, CH, A < 0 ? pts.reverse() : pts, z0, z1);                        // il viewer vuole i poligoni antiorari
    };
    const chair = (nm, cx, cy, d) => {
      const Q = P + 'Sedia_' + nm + '_';
      rbox(Q + 'Seduta', CH, [cx - 22.5, cy - 23, 42, cx + 22.5, cy + 23, 46.5], 7, 3);
      const cyc = cy + d * 5, R = 24.5;                                         // centro dell'arco: il dorso sporge ~6 cm oltre la seduta
      arcBand(Q + 'Fascia_Alta', cx, cyc, d, R, 71, 78, 0, 180);
      arcBand(Q + 'Fascia_Media', cx, cyc, d, R, 62.5, 69.5, 0, 180);
      arcBand(Q + 'Fascia_Bassa', cx, cyc, d, R, 54, 61, 0, 180);
      arcBand(Q + 'Orecchio_Est', cx, cyc, d, R, 54, 78, 0, 14);                // le due "orecchie" ad anello che chiudono le feritoie ai lati
      arcBand(Q + 'Orecchio_Ovest', cx, cyc, d, R, 54, 78, 166, 180);
      arcBand(Q + 'Montante_Centrale', cx, cyc, d, R, 54, 78, 86, 94);          // listello centrale tra le due feritoie
      for (const sx of [1, -1]) {
        // gambe anteriori: leggermente aperte; posteriori: salgono fino alla fascia bassa del dorso
        tube(Q + 'Gamba_Ant_' + sx, CHD, [[cx + sx * 21, cy - d * 21, 43], [cx + sx * 19.75, cy - d * 23.5, 0]], [2.6, 1.7], 10);
        tube(Q + 'Gamba_Post_' + sx, CHD, [[cx + sx * 19.75, cy + d * 21.5, 0], [cx + sx * 20, cy + d * 22.5, 46], [cx + sx * 17.3, cy + d * 22.3, 56]], [1.7, 2.6, 2.4], 10);
      }
    };
    for (const [k, dx] of [[0, -LEN / 4], [1, LEN / 4]]) {                        // lato nord (verso il divano) e lato sud: 2 per lato, tirate fuori di ~13 cm
      chair('N' + k, CX + dx, YN + 13, +1);
      chair('S' + k, CX + dx, YS - 13, -1);
    }
    // sul tavolo: vassoio con una caraffa verde (come nella foto)
    tube(P + 'Vassoio', [236, 233, 226, 255], [[CX - 12, CY, H], [CX - 12, CY, H + 1.2]], [14, 14], 24);
    tube(P + 'Caraffa', [150, 190, 160, 255], [[CX + 8, CY + 4, H], [CX + 8, CY + 4, H + 12], [CX + 8, CY + 4, H + 22]], [4, 5.5, 1.8], 14);
  });
};
