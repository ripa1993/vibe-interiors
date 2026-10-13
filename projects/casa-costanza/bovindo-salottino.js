// Salottino davanti al "bovindo" (le 3 finestre dritte affiancate sul muro ovest dell'ala, y 562..712, davanti alle quali c'e' il disimpegno x -25..173, y 551..723):
// tavolino tondo antico (piano in noce r 22 a 60 cm, colonna tornita su tre piedini, centrino, vasetto con fiori, due tazzine) e DUE POLTRONE ANTICHE (bergere in noce con
// gambe a cabriole, schienale imbottito, braccioli, cuscino) ruotate di ~45 gradi verso il tavolino, su un tappeto tondo verde salvia (r 70, bordo crema). Tutto stimato, nessuna misura dell'utente.
// Le poltrone sono 56 x 58 cm, a x 54, y 597 e 677 (specchiate rispetto alla mezzeria y 637): lasciano libero il passaggio verso le due porte (est y 580..670; sud x 95..165).
// Pezzi ruotati = poligoni in pianta (`slab`) e tubi: nel viewer niente rotazioni. Misure in cm.
// Opzioni: { id, prefix, chairs: [[nome, x, y, dir?]] (dir = direzione del davanti, default verso il tavolino), tx, ty = centro del tavolino }. Due varianti (stesso `variant` in house.js): 'bovindo-salottino' (2 poltrone) e 'bovindo-salottino-1' (UNA poltrona con lo SCHIENALE VERSO LA PARETE NORD (y 723), angolata di 28 gradi verso le finestre per guardare fuori; tavolino a lato, davanti alla finestra, a x 12, y 622).
module.exports = function bovindoSalottino({ box, tube, slab, group }, { id = 'bovindo-salottino', prefix = '/Salottino/', chairs = [['Poltrona_Sud', 54, 597], ['Poltrona_Nord', 54, 677]], tx = 14, ty = 637 } = {}) {
  const P = prefix;
  const WALNUT = [98, 64, 42, 255], WALNUT2 = [120, 80, 52, 255], GOLD = [176, 138, 64, 255], GOLD2 = [196, 160, 86, 255], CREAM = [244, 240, 228, 255], CER = [236, 233, 226, 255];
  const rr = (u0, v0, u1, v1, r, seg = 4) => {                         // rettangolo arrotondato antiorario (4 * (seg + 1) punti), coordinate locali
    const pts = [];
    for (const [cx, cy, a0] of [[u1 - r, v0 + r, -90], [u1 - r, v1 - r, 0], [u0 + r, v1 - r, 90], [u0 + r, v0 + r, 180]])
      for (let k = 0; k <= seg; k++) { const a = (a0 + 90 * k / seg) * Math.PI / 180; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return pts;
  };
  const YC = 637, TX = tx, TY = ty, TR = 22;      // YC = mezzeria del tappeto / delle finestre; TX, TY = centro del tavolino                                      // tavolino: centro e raggio

  group(id, () => {
    // tappeto TONDO (r 70, centro x 45, y 637: sfiora il muro delle finestre): bordo crema, campo verde salvia, anello piu' scuro e medaglione crema al centro
    const RX = 45;
    tube(P + 'Tappeto_Bordo', [226, 214, 190, 255], [[RX, YC, 0], [RX, YC, 0.6]], [70, 70], 48);
    tube(P + 'Tappeto_Campo', [150, 172, 150, 255], [[RX, YC, 0.6], [RX, YC, 0.8]], [64, 64], 48);
    tube(P + 'Tappeto_Anello', [126, 150, 128, 255], [[RX, YC, 0.8], [RX, YC, 1.0]], [44, 44], 48);
    tube(P + 'Tappeto_Campo_Interno', [150, 172, 150, 255], [[RX, YC, 1.0], [RX, YC, 1.2]], [38, 38], 48);
    tube(P + 'Tappeto_Medaglione', [226, 214, 190, 255], [[RX, YC, 1.2], [RX, YC, 1.4]], [16, 16], 36);

    // ---------- tavolino tondo ----------
    tube(P + 'Tavolo_Piano', WALNUT2, [[TX, TY, 60], [TX, TY, 63]], [TR, TR], 36);
    tube(P + 'Tavolo_Bordo', WALNUT, [[TX, TY, 58.5], [TX, TY, 60]], [TR - 2, TR - 2], 36);
    tube(P + 'Tavolo_Colonna', WALNUT, [[TX, TY, 4], [TX, TY, 10], [TX, TY, 24], [TX, TY, 40], [TX, TY, 50], [TX, TY, 58.5]], [4, 2.4, 3.4, 2, 2.8, 4.5], 16);   // colonna tornita
    for (let k = 0; k < 3; k++) {                                         // tre piedini a ricciolo
      const a = 2 * Math.PI * k / 3 + Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
      tube(P + 'Tavolo_Piede_' + k, WALNUT, [[TX, TY, 8], [TX + c * 8, TY + s * 8, 5], [TX + c * 14, TY + s * 14, 2], [TX + c * 17, TY + s * 17, 0.8]], [2.2, 1.8, 1.5, 1.2], 8);
    }
    tube(P + 'Tavolo_Centrino', CREAM, [[TX, TY, 63], [TX, TY, 63.25]], [14, 14], 28);
    tube(P + 'Tavolo_Vasetto', CER, [[TX, TY, 63.25], [TX, TY, 68], [TX, TY, 76]], [3.2, 4.6, 2.4], 16);
    [[-1.5, 0.5, 8, [214, 90, 90, 255]], [1.2, -1, 12, [236, 190, 90, 255]], [0.4, 1.5, 15, [244, 244, 240, 255]], [-0.8, -1.4, 10, [150, 120, 190, 255]]].forEach(([dx, dy, h, c], i) => {
      tube(P + 'Fiore_Stelo_' + i, [90, 140, 80, 255], [[TX, TY, 75], [TX + dx * 2, TY + dy * 2, 75 + h * 0.6], [TX + dx * 3.5, TY + dy * 3.5, 75 + h]], [0.3, 0.3, 0.3], 6);
      tube(P + 'Fiore_Corolla_' + i, c, [[TX + dx * 3.5, TY + dy * 3.5, 75 + h], [TX + dx * 3.7, TY + dy * 3.7, 75 + h + 2.4]], [2, 2], 10);
    });
    for (const [i, dx, dy] of [[0, -9, 11], [1, 10, -9]]) {              // due tazzine con piattino
      tube(P + `Tazzina_${i}_Piattino`, CER, [[TX + dx, TY + dy, 63.25], [TX + dx, TY + dy, 63.9]], [5, 5], 18);
      tube(P + `Tazzina_${i}`, CER, [[TX + dx, TY + dy, 63.9], [TX + dx, TY + dy, 69]], [2.6, 3.3], 14);
    }

    // ---------- due poltrone antiche, ruotate verso il tavolino ----------
    const chair = (id, cx, cy, dir) => {
      const L = Math.hypot(TX - cx, TY - cy), dx = dir ? dir[0] : (TX - cx) / L, dy = dir ? dir[1] : (TY - cy) / L;     // direzione "davanti": `dir` se data, altrimenti verso il tavolino
      const W = (u, v) => [+(cx + u * dy + v * dx).toFixed(2), +(cy - u * dx + v * dy).toFixed(2)];   // locale (u a destra, v avanti) -> mondo
      const poly = (u0, v0, u1, v1, r) => rr(u0, v0, u1, v1, r).map(([u, v]) => W(u, v));
      const Q = P + id + '_';
      // gambe a cabriole (davanti e dietro, due per lato)
      for (const [i, [lu, lv]] of [[1, 1], [1, -1], [-1, 1], [-1, -1]].map((p, i) => [i, [p[0] * 22.5, p[1] * 24]])) {
        const sgn = lu > 0 ? 1 : -1, off = [0, 0.8, 1.8, 1.1, 0], zs = [0, 6, 16, 26, 34];
        tube(Q + 'Gamba_' + i, WALNUT, zs.map((z, k) => [...W(lu + sgn * off[k] * 0.4, lv + (lv > 0 ? 1 : -1) * off[k]), z]), [1.2, 1.1, 1.7, 2.3, 2.2], 8);
      }
      slab(Q + 'Cinta', WALNUT, poly(-26, -27, 26, 27, 4), 31, 37);                      // cintura in noce
      slab(Q + 'Cuscino', GOLD, poly(-25, -24, 25, 27, 5), 37, 46);                      // cuscino di seduta
      slab(Q + 'Schienale', GOLD, poly(-24.5, -30, 24.5, -23, 3), 42, 98);               // schienale imbottito
      slab(Q + 'Schienale_Capitonne', GOLD2, poly(-18, -23.2, 18, -22, 2), 56, 90);      // pannello centrale chiaro
      for (const [i, su] of [[0, -1], [1, 1]]) {
        tube(Q + 'Montante_Dietro_' + i, WALNUT, [[...W(su * 26, -28), 33], [...W(su * 26, -28), 100]], [1.7, 1.5], 8);       // montanti posteriori
        tube(Q + 'Montante_Davanti_' + i, WALNUT, [[...W(su * 26.5, 20), 37], [...W(su * 26.5, 20), 63]], [1.5, 1.3], 8);        // sostegno del bracciolo
        tube(Q + 'Bracciolo_' + i, WALNUT, [[...W(su * 26.5, -27), 66], [...W(su * 27.5, -6), 68.5], [...W(su * 26.5, 20), 65]], [1.6, 1.8, 1.6], 8);
        slab(Q + 'Bracciolo_Pad_' + i, GOLD, poly(su > 0 ? 25.2 : -28, -20, su > 0 ? 28 : -25.2, 17, 1), 66, 70);              // cuscinetto del bracciolo
      }
      const rail = [-26, -20, -13, -6, 0, 6, 13, 20, 26].map(u => [...W(u, -28.5), 99.5 + 3.5 * (1 - (u / 26) ** 2)]);          // traversa superiore a arco, intagliata
      tube(Q + 'Traversa', WALNUT, rail, rail.map(() => 1.6), 8);
    };
    for (const [nm, cx, cy, dir] of chairs) chair(nm, cx, cy, dir);
  });
};
