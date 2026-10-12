// Arredo del WC GRANDE (interno x -382..-182, y 240..501 dopo il tramezzo dell'antibagno), disegnato sugli attacchi gia' presenti (gruppo 'attacchi-wc-grande'):
//  - porta del tramezzo (y 229..240) centrata nel WC: x -317..-247;
//  - muro est (x -182), da sud a nord: mobile lavabo (attacchi y 324/336, scarico y 330) · bidet (y 430) · water (scarico a pavimento x -222, y 488, placca incassata sul muro)
//    con lo scaldasalviette (y 420..475, da z 70) sopra al bidet;
//  - il water sta nella NICCHIA della finestra (x -254..-190): la tazza e' larga 36 e il suo centro dista solo 13 dal muro nord (y 501), quindi esce di 5 cm nella nicchia e
//    ha un corpo posteriore stretto (x -191..-183) per non toccare lo spigolo del muro;
//  - muro ovest (x -382): doccia 70 x 170 al posto della vasca (y 331..501) con vetro, e a sud la lavasciuga 60 x 60 x 85 accanto alla doccia (y 268..328) con un pensile sopra.
// Gli attacchi della doccia e della lavasciuga NON sono nel modello (non ci sono dati): miscelatore e soffione sono messi sul muro nord, carico/scarico lavasciuga da portare.
// Decorazioni: 2 piante (pavimento e davanzale), 3 stampe, asciugamani, tappeto, oggetti sul lavabo.
// Misure in cm.
module.exports = function wcGrande({ box, tube, rbox, slab, tray, group }) {
  const P = '/WCArredo/';
  const WHT = [242, 242, 240, 255], CER = [248, 248, 246, 255], CHR = [200, 202, 206, 255], OAK = [200, 164, 116, 255], OAK2 = [210, 176, 130, 255];
  const GL = [170, 205, 220, 70], DK = [40, 44, 50, 255];
  const rr = (x0, y0, x1, y1, r, seg = 4) => {                // rettangolo arrotondato antiorario (4 * (seg + 1) punti)
    const pts = [];
    for (const [cx, cy, a0] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]])
      for (let k = 0; k <= seg; k++) { const a = (a0 + 90 * k / seg) * Math.PI / 180; pts.push([+(cx + r * Math.cos(a)).toFixed(3), +(cy + r * Math.sin(a)).toFixed(3)]); }
    return pts;
  };
  const XW = -382, XE = -182;                                  // facce interne dei muri ovest ed est

  group('wc-grande-arredo', () => {
    // ---------- doccia 70 x 170 (al posto della vasca), lato corto contro il muro nord ----------
    const sx0 = XW, sx1 = XW + 70, sy0 = 331, sy1 = 501;
    box(P + 'Doccia_Piatto', CER, sx0, sy0, 0, sx1, sy1, 4);
    tube(P + 'Doccia_Scarico', CHR, [[-347, 360, 4], [-347, 360, 4.3]], [5, 5], 16);
    box(P + 'Doccia_Vetro_Fisso', GL, sx1 - 2.5, 431, 4, sx1 - 1.5, sy1, 202);               // pannello fisso verso il water (y 431..501)
    box(P + 'Doccia_Vetro_Scorrevole', GL, sx1 - 1.2, 333, 6, sx1 - 0.2, 433, 200);            // anta scorrevole (y 333..433), sovrapposta di 2 cm al fisso
    box(P + 'Doccia_Vetro_Testata', GL, sx0 + 1, sy0 - 0.5, 4, sx1 - 2, sy0 + 0.5, 202);       // pannello fisso lato lavasciuga
    box(P + 'Doccia_Binario', CHR, sx1 - 3.2, sy0, 202, sx1 + 0.8, sy1, 204);
    box(P + 'Doccia_Montante', CHR, sx1 - 2.5, sy0 - 1, 4, sx1 - 0.5, sy0 + 1, 204);
    tube(P + 'Doccia_Maniglia', CHR, [[sx1 + 0.4, 346, 92], [sx1 + 0.4, 346, 122]], [1.1, 1.1], 8);
    // miscelatore e soffione sul muro nord (x -347)
    box(P + 'Doccia_Miscelatore', CHR, -355, 497, 104, -339, 501, 116);
    tube(P + 'Doccia_Leva', CHR, [[-347, 497, 110], [-347, 493, 110]], [1.3, 1.3], 8);
    tube(P + 'Doccia_Colonna', CHR, [[-347, 499.5, 116], [-347, 499.5, 204], [-347, 494, 208], [-347, 482, 208]], [1, 1, 1, 1], 8);
    tube(P + 'Doccia_Soffione', CHR, [[-347, 476, 206.5], [-347, 476, 208.5]], [11, 11], 24);

    // ---------- lavasciuga 60 x 60 x 85 accanto alla doccia (a sud), fronte verso est, pensile sopra ----------
    const wy0 = 268, wy1 = 328, wyc = (wy0 + wy1) / 2;
    rbox(P + 'Lavasciuga_Corpo', WHT, [XW + 0.5, wy0, 2, XW + 60.5, wy1, 85], 1.5, 1);
    box(P + 'Lavasciuga_Piedi_A', DK, XW + 3, wy0 + 3, 0, XW + 8, wy0 + 8, 2);
    box(P + 'Lavasciuga_Piedi_B', DK, XW + 3, wy1 - 8, 0, XW + 8, wy1 - 3, 2);
    box(P + 'Lavasciuga_Piedi_C', DK, XW + 53, wy0 + 3, 0, XW + 58, wy0 + 8, 2);
    box(P + 'Lavasciuga_Piedi_D', DK, XW + 53, wy1 - 8, 0, XW + 58, wy1 - 3, 2);
    const fx = XW + 60.5;                                        // fronte (x -321.5)
    box(P + 'Lavasciuga_Pannello', DK, fx, wy0 + 6, 74, fx + 0.4, wy1 - 6, 83);
    tube(P + 'Lavasciuga_Manopola', CHR, [[fx + 0.4, wy1 - 14, 78.5], [fx + 1.6, wy1 - 14, 78.5]], [3, 3], 16);
    tube(P + 'Lavasciuga_Oblo_Anello', CHR, [[fx, wyc, 40], [fx + 1.4, wyc, 40]], [23, 23], 28);
    tube(P + 'Lavasciuga_Oblo_Vetro', [70, 95, 120, 190], [[fx + 1.4, wyc, 40], [fx + 1.9, wyc, 40]], [18, 18], 28);
    box(P + 'Pensile_Lavasciuga', WHT, XW, wy0, 150, XW + 30, wy1, 210);                         // pensile 60 x 30 x 60
    box(P + 'Pensile_Anta_A', OAK, XW + 30, wy0 + 0.5, 150.5, XW + 30.6, wyc - 0.5, 209.5);
    box(P + 'Pensile_Anta_B', OAK, XW + 30, wyc + 0.5, 150.5, XW + 30.6, wy1 - 0.5, 209.5);

    // ---------- muro est: mobile lavabo sospeso 70 x 46 (attacchi y 324/336, scarico y 330 dentro al mobile, z 45..52) ----------
    const vx0 = -229, vx1 = XE - 1, vy0 = 295, vy1 = 365, vyc = 330;
    box(P + 'Mobile_Corpo', OAK, vx0 + 1, vy0 + 1, 28, vx1, vy1 - 1, 64);
    box(P + 'Mobile_Cassetto_Alto', OAK2, vx0, vy0 + 1, 47, vx0 + 1, vy1 - 1, 63.5);
    box(P + 'Mobile_Cassetto_Basso', OAK2, vx0, vy0 + 1, 28.5, vx0 + 1, vy1 - 1, 46);
    slab(P + 'Mobile_Piano_Lavabo', CER, rr(vx0, vy0 - 1, vx1, vy1 + 1, 3), 64, 84, [rr(-225, 307, -195, 353, 8)]);   // piano in ceramica con vasca integrata
    tray(P + 'Mobile_Vasca', CER, rr(-224.8, 307.2, -195.2, 352.8, 7.8), 69, 84);
    tube(P + 'Mobile_Rubinetto', CHR, [[-187, vyc, 84], [-187, vyc, 95], [-191, vyc, 98.5], [-197, vyc, 96]], [1.8, 1.4, 1.1, 1.0], 10);
    box(P + 'Specchio', [190, 208, 218, 255], XE - 2, vy0, 105, XE - 0.3, vy1, 195);
    box(P + 'Specchio_Luce', [255, 248, 225, 255], XE - 3, vy0 + 5, 195.5, XE - 0.3, vy1 - 5, 198);

    // ---------- bidet (centro y 430, scarico x -222) ----------
    slab(P + 'Bidet_Corpo', CER, rr(-238, 412, XE - 1, 448, 16), 0, 40, [rr(-231, 418.5, -197, 441.5, 11)]);
    tray(P + 'Bidet_Vasca', CER, rr(-230.8, 418.7, -197.2, 441.3, 10.8), 12, 40);
    tube(P + 'Bidet_Rubinetto', CHR, [[-191, 430, 40], [-191, 430, 49], [-196, 430, 51]], [1.6, 1.2, 1.0], 10);

    // ---------- water a pavimento con cassetta incassata (placca y 481..498), scarico x -222, y 488, tazza nella nicchia ----------
    slab(P + 'Water_Tazza', CER, rr(-240, 470, -190.5, 506, 15), 0, 40, [rr(-233, 477, -198, 499, 9)]);
    tray(P + 'Water_Vasca', CER, rr(-232.8, 477.2, -198.2, 498.8, 8.8), 14, 40);
    rbox(P + 'Water_Corpo_Posteriore', CER, [-192, 473, 0, XE - 1, 500, 38], 3, 2);
    slab(P + 'Water_Sedile', WHT, rr(-238, 471.5, -191, 504.5, 14), 40, 43, [rr(-232.5, 477.5, -198.5, 498.5, 9)]);
    // ---------- decorazioni ----------
    const { pot, plant, frame, GRN2, TERRA, SAGE } = require('./decor.js')({ box, tube, P });
    pot('Vaso_Pavimento', -282, 480, 0, 26, 9, 11, TERRA);        // pianta alta contro il muro nord, tra doccia e nicchia
    plant('Pianta_Pavimento', -282, 480, 24, 9, 46, 16, GRN2);
    pot('Vaso_Davanzale', -243, 514, 80, 8, 3.6, 4.8, CER);       // piantina sul davanzale della nicchia (la finestra e' piu' avanti, y ~526)
    plant('Pianta_Davanzale', -243, 514, 86, 7, 16, 6, GRN2);
    frame('Stampa_N1', -308, 125, 22, 30, 501, 1, DK, [226, 214, 194, 255], [214, 140, 100, 255], [120, 150, 125, 255]);
    frame('Stampa_N2', -280, 125, 22, 30, 501, 1, DK, [150, 176, 160, 255], [240, 226, 190, 255], [60, 90, 80, 255]);
    frame('Stampa_Porta', -233, 130, 36, 52, 240, -1, OAK, [60, 82, 104, 255], [232, 190, 110, 255], [200, 210, 220, 255]);   // sul tramezzo, a est della porta
    // asciugamano sullo scaldasalviette (davanti, x -191..-187) e uno piccolo, tappeto davanti alla doccia, oggetti sul piano del lavabo
    box(P + 'Asciugamano_Grande', [236, 238, 236, 255], -191, 428, 112, -187, 466, 205);
    box(P + 'Asciugamano_Strisce', SAGE, -191.1, 428, 150, -186.9, 466, 156);
    box(P + 'Asciugamano_Piccolo', SAGE, -190, 432, 88, -187, 462, 108);
    slab(P + 'Tappeto_Bagno', SAGE, rr(-305, 345, -262, 415, 4), 0, 1);
    tube(P + 'Dispenser_Sapone', [225, 232, 236, 255], [[-198, 358, 84], [-198, 358, 93]], [2.4, 2.4], 12);
    tube(P + 'Dispenser_Pompa', CHR, [[-198, 358, 93], [-198, 358, 96], [-201, 358, 96.5]], [0.6, 0.6, 0.6], 6);
    tube(P + 'Bicchiere', [225, 232, 236, 90], [[-203, 302, 84], [-203, 302, 92]], [2.6, 3.0], 14);
    box(P + 'Vassoio_Piano', OAK2, -214, 300, 84, -196, 304, 85);
  });
};
