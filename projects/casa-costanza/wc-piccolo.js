// Arredo del WC PICCOLO (bagno di servizio dell'ala: x -25..190, y 734 (tramezzo) fino al muro nord OBLIQUO y = L(x), L(-25) = 795, L(190) = 845), sugli attacchi
// del gruppo 'attacchi-wc-piccolo':
//  - muro nord (obliquo, 13 gradi), da sinistra (ovest) a destra: BIDET (mandate a x 2 e 14, scarico a y L-25) poi WATER (placca incassata x 43..68, scarico a y L-14).
//    Il muro e' inclinato: i due sanitari sono ruotati di 13 gradi con la schiena sul muro (poligoni `slab` in pianta, il viewer non ruota) e la loro linea
//    centrale passa per lo scarico esistente. La tazza resta a ~25 cm dal tramezzo.
//  - muro est (x 190 - 17 = 173, spostato): lavabo piccolo "da hotel" con colonna (mandate z 52 a y 784/796, scarico z 45 a y 790 nascosti dalla colonna), specchio tondo con cornice
//    in ottone e asciugamani da ospiti su un gancio.
//  - decorazioni minime: stampa sul tramezzo (di fronte al water), piantina sul davanzale della finestra, portarotolo.
// Misure in cm.
module.exports = function wcPiccolo({ box, tube, rbox, slab, tray, group, L, XT }) {
  const DX = XT - 190;                                           // il muro est del WC e' stato spostato: il lavabo segue (era x 190)
  const P = '/WCPiccolo/';
  const CER = [248, 248, 246, 255], WHT = [242, 242, 240, 255], CHR = [200, 202, 206, 255], BRS = [190, 156, 96, 255], OAK = [200, 164, 116, 255];
  const rr = (x0, y0, x1, y1, r, seg = 4) => {
    const pts = [];
    for (const [cx, cy, a0] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]])
      for (let k = 0; k <= seg; k++) { const a = (a0 + 90 * k / seg) * Math.PI / 180; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return pts;
  };
  // riferimento locale al muro obliquo: u lungo il muro (verso est), v dalla faccia del muro verso la stanza (perpendicolare)
  const sl = 0.233, nn = Math.hypot(1, sl), T = [1 / nn, sl / nn], N = [sl / nn, -1 / nn];
  const frameAt = (dx, dy, vd) => [dx - (vd - 0.8) * N[0], dy - (vd - 0.8) * N[1]];      // origine sul muro, tale che il punto (dx, dy) sta a distanza vd dal muro
  const mk = (o) => (u, v) => [+(o[0] + u * T[0] + v * N[0]).toFixed(3), +(o[1] + u * T[1] + v * N[1]).toFixed(3)];
  const poly = (W, pts) => pts.map(([u, v]) => W(u, v)).reverse();        // (u,v) e' orario in (x,y): inverti per avere un poligono antiorario
  const pw = (W, u, v, z) => { const p = W(u, v); return [p[0], p[1], z]; };

  group('wc-piccolo-arredo', () => {
    // ---------- bidet (scarico a (8, L(8) - 25)) ----------
    const WB = mk(frameAt(8, L(8) - 25, 25));
    slab(P + 'Bidet_Corpo', CER, poly(WB, rr(-18, 0, 18, 50, 15)), 0, 40, [poly(WB, rr(-11.5, 8, 11.5, 43, 10))]);
    tray(P + 'Bidet_Vasca', CER, poly(WB, rr(-11.3, 8.2, 11.3, 42.8, 9.8)), 12, 40);
    tube(P + 'Bidet_Rubinetto', CHR, [pw(WB, 0, 5, 40), pw(WB, 0, 5, 49), pw(WB, 0, 9, 51)], [1.6, 1.2, 1.0], 10);

    // ---------- water con cassetta incassata (placca x 43..68), scarico a (55, L(55) - 14) ----------
    const WW = mk(frameAt(55, L(55) - 14, 14));
    slab(P + 'Water_Tazza', CER, poly(WW, rr(-18, 0, 18, 50, 15)), 0, 40, [poly(WW, rr(-11.5, 7, 11.5, 44, 10))]);
    tray(P + 'Water_Vasca', CER, poly(WW, rr(-11.3, 7.2, 11.3, 43.8, 9.8)), 14, 40);
    slab(P + 'Water_Sedile', WHT, poly(WW, rr(-17, 1.5, 17, 49, 14)), 40, 43, [poly(WW, rr(-11.5, 7, 11.5, 44, 10))]);
    // portarotolo sul muro, a destra del water (x ~ 84)
    const ox = 84, oy = L(ox), cx = ox + 7 * N[0], cy = oy + 7 * N[1];
    tube(P + 'Portarotolo_Rotolo', WHT, [[cx - 5 * T[0], cy - 5 * T[1], 68], [cx + 5 * T[0], cy + 5 * T[1], 68]], [5.5, 5.5], 16);
    tube(P + 'Portarotolo_Asta', CHR, [[ox + 1 * N[0], oy + 1 * N[1], 68], [cx + 6 * T[0], cy + 6 * T[1], 68]], [0.5, 0.5], 6);

    // ---------- lavabo piccolo da hotel sul muro est (45 x 32, colonna, rubinetto monoforo), mandate z 52 e scarico z 45 dietro la colonna ----------
    slab(P + 'Lavabo_Bacino', CER, rr(158 + DX, 767.5, 190 + DX, 812.5, 7), 76, 84, [rr(162 + DX, 772, 186 + DX, 808, 9)]);
    tray(P + 'Lavabo_Vasca', CER, rr(162.2 + DX, 772.2, 185.8 + DX, 807.8, 8.8), 78.5, 84);
    tube(P + 'Lavabo_Colonna', CER, [[179 + DX, 790, 0], [179 + DX, 790, 76]], [8, 5], 20);
    tube(P + 'Lavabo_Rubinetto', CHR, [[186.5 + DX, 790, 84], [186.5 + DX, 790, 94], [182.5 + DX, 790, 96.5]], [1.6, 1.2, 1.0], 10);
    tube(P + 'Lavabo_Sapone', [225, 232, 236, 255], [[188 + DX, 777, 84], [188 + DX, 777, 91]], [1.8, 1.8], 12);
    // specchio tondo con cornice in ottone, 2 asciugamani ospiti su un gancio
    tube(P + 'Specchio_Cornice', BRS, [[190 + DX, 790, 140], [188.8 + DX, 790, 140]], [23.6, 23.6], 36);
    tube(P + 'Specchio', [190, 208, 218, 255], [[188.8 + DX, 790, 140], [188.4 + DX, 790, 140]], [22, 22], 36);
    tube(P + 'Gancio_Asciugamano', BRS, [[190 + DX, 826, 118], [186.5 + DX, 826, 118]], [0.9, 0.9], 8);
    box(P + 'Asciugamano_Ospiti', [236, 238, 236, 255], 187.5 + DX, 819, 80, 189.5 + DX, 833, 118);
    box(P + 'Asciugamano_Ospiti_Riga', [170, 188, 168, 255], 187.4 + DX, 819, 88, 189.6 + DX, 833, 92);

    // ---------- decorazioni minime ----------
    const { pot, plant, frame, GRN2 } = require('./decor.js')({ box, tube, P });
    frame('Stampa_Water', 13, 135, 30, 40, 734, -1, [40, 44, 50, 255], [226, 214, 194, 255], [214, 140, 100, 255], [120, 150, 125, 255]);   // sul tramezzo, davanti al water
    pot('Vaso_Davanzale', -31, 767, 100, 9, 3.6, 4.6, CER);                                     // sul davanzale della finestra (x -55..-25, frame a x -43..-37)
    plant('Pianta_Davanzale', -31, 767, 108, 7, 22, 6, GRN2);
  });
};
