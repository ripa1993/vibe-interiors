// Cucina v2 · "Linea ovest + penisola stretta nel muro" — pensata per lo STATO FINALE (divisorio COT/soggiorno e muro basso della COT rimossi).
// Schema dello schizzo dell'utente (pianta, nord in alto), tutto a colonna lungo il muro ovest, da sud a nord:
//   FRIGO incassato (colonna 60) · cassettoni 60 · FUOCHI (piano a induzione + forno sotto, cappa a ribalta) · LAVASTOVIGLIE 60 · LAVELLO d'angolo sotto la finestra.
// Dal lavello la linea gira a est lungo la parete nord (quella dello scaldabagno): elemento a GIORNO da 45 (lascia libera la griglia di aerazione del gas) + mobile sotto la caldaia, che si
//   ferma sul tratto di muro da 72 cm che resta (x -11..0).
// (il piano continua poi a nord sopra il calorifero, come mensola a sbalzo)
// PENISOLA STRETTA = SNACK profondo 35 (x -20..15), VUOTO SOTTO con una sola gamba cilindrica d'acciaio all'estremo sud, incastonato nel tratto di muro che resta (x -11..0): il piano prosegue la linea
//   verso sud (y n-197..n-72) senza toccare il calorifero sul lato soggiorno. Due sgabelli sul lato soggiorno, una sospensione.
// Pensili alti (145..250, profondi 35) solo dove non c'e' la finestra. Passaggio libero tra la linea ovest e la penisola: ~93 cm.
// Misure in cm, stime di progetto. `n` e' la y del muro nord interno della COT.
module.exports = function cucinaV2({ box, tube, rbox, slab, group, n, light }) {
  const SG = [124, 146, 128, 255];       // verde salvia (ante dei bassi)
  const WH = [236, 233, 226, 255];       // laccato bianco (pensili)
  const QZ = [214, 210, 202, 255];       // piano in quarzo chiaro
  const OAK = [196, 158, 108, 255];
  const ST = [188, 191, 196, 255];
  const BLK = [40, 42, 46, 255];
  const GLASS = [28, 30, 34, 255];
  const STONE = [196, 190, 180, 255];    // rivestimento chiaro
  const P = '/CucinaV2/';
  const X0 = -171, X1 = -111;            // linea ovest: profondita' 60

  group('cucina-v2', () => {
    // ---------- zoccoli (rientrati di 5 cm) ----------
    box(P + 'Zoccolo_Ovest', BLK, X0, n - 357, 0, X1 - 5, n - 6, 10);
    box(P + 'Zoccolo_Nord', BLK, X1 - 5, n - 42, 0, -16, n - 6, 10);

    // ---------- FRIGO incassato (colonna 60 x 60, h 200 + cappello a 250); gole a sud = cerniere a nord ----------
    box(P + 'Frigo_Colonna', SG, X0, n - 362, 10, X1, n - 302, 200);
    box(P + 'Frigo_Anta_Congelatore', SG, X1, n - 361.5, 12, X1 + 2, n - 302.5, 100);
    box(P + 'Frigo_Anta_Frigorifero', SG, X1, n - 361.5, 101.5, X1 + 2, n - 302.5, 199);
    box(P + 'Frigo_Gola_Congelatore', BLK, X1, n - 361.5, 22, X1 + 2.2, n - 360.5, 92);
    box(P + 'Frigo_Gola_Frigorifero', BLK, X1, n - 361.5, 110, X1 + 2.2, n - 360.5, 190);
    box(P + 'Frigo_Cappello_Corpo', WH, X0, n - 362, 201, X1, n - 302, 250);
    box(P + 'Frigo_Cappello_Anta', WH, X1, n - 361.5, 202, X1 + 2, n - 302.5, 249);

    // ---------- basi della linea ovest (h 90, piano a 94) ----------
    box(P + 'Base_Cassettoni', SG, X0, n - 302, 10, X1, n - 242, 90);
    for (let k = 0; k < 3; k++) {
      const z0 = 12 + k * 26.5, z1 = z0 + 25;
      box(P + 'Cassettone_' + k, SG, X1, n - 301.5, z0, X1 + 2, n - 242.5, z1);
      tube(P + 'Cassettone_Maniglia_' + k, ST, [[X1 + 3.2, n - 292, z1 - 4], [X1 + 3.2, n - 252, z1 - 4]], [0.8, 0.8], 8);
    }
    box(P + 'Base_Fornello', SG, X0, n - 242, 10, X1, n - 152, 90);
    // forno da incasso sotto il piano cottura (centro y = n-197): sportello in vetro nero, mostrina comandi, cassetto basso
    box(P + 'Forno_Fianco_Sud', SG, X1, n - 241.5, 12, X1 + 2, n - 227.5, 88);
    box(P + 'Forno_Fianco_Nord', SG, X1, n - 166.5, 12, X1 + 2, n - 152.5, 88);
    box(P + 'Forno_Comandi', ST, X1, n - 227, 76, X1 + 2, n - 167, 88);
    for (let k = 0; k < 3; k++)
      tube(P + 'Forno_Manopola_' + k, BLK, [[X1 + 2, n - 215 + k * 18, 82], [X1 + 5, n - 215 + k * 18, 82]], [1.8, 1.8], 12);
    box(P + 'Forno_Sportello', GLASS, X1, n - 227, 30, X1 + 2, n - 167, 75);
    tube(P + 'Forno_Maniglia', ST, [[X1 + 3.2, n - 223, 70], [X1 + 3.2, n - 171, 70]], [0.9, 0.9], 10);
    box(P + 'Forno_Cassetto', SG, X1, n - 227, 12, X1 + 2, n - 167, 29);
    tube(P + 'Forno_Cassetto_Maniglia', ST, [[X1 + 3.2, n - 207, 24], [X1 + 3.2, n - 187, 24]], [0.8, 0.8], 8);
    // lavastoviglie 60 (fronte in acciaio)
    box(P + 'Base_Lavastoviglie', SG, X0, n - 152, 10, X1 - 2, n - 92, 90);
    box(P + 'Lavastoviglie_Sportello', ST, X1 - 2, n - 151.5, 12, X1, n - 92.5, 78);
    box(P + 'Lavastoviglie_Comandi', BLK, X1 - 2, n - 151.5, 79, X1, n - 92.5, 88);
    tube(P + 'Lavastoviglie_Maniglia', ST, [[X1 + 1.2, n - 144, 70], [X1 + 1.2, n - 100, 70]], [0.9, 0.9], 10);
    // mobile sotto il lavello (60 x 92, angolo)
    box(P + 'Base_Lavello', SG, X0, n - 92, 10, X1, n - 47, 90);
    box(P + 'Base_Lavello_Angolo', SG, X0, n - 47, 10, X1 + 0, n - 6, 90);
    box(P + 'Lavello_Anta_0', SG, X1, n - 91.5, 12, X1 + 2, n - 48.5, 88);
    tube(P + 'Lavello_Maniglia', ST, [[X1 + 3.2, n - 52, 58], [X1 + 3.2, n - 52, 82]], [0.8, 0.8], 8);

    // ---------- parete NORD (scaldabagno): cassetti da 45, poi mobile sotto la caldaia (altezza standard, piano a 94) ----------
    // ELEMENTO A GIORNO (45 x 47): niente schienale ne' ante; il vano basso (z 12..52) resta LIBERO davanti alla griglia di aerazione del gas
    // (x -101..-81, z 15..37, sulla parete): non appoggiarci nulla davanti. Sul ripiano alto solo oggetti.
    box(P + 'Nord_Giorno_Fianco_Ovest', SG, X1, n - 47, 10, X1 + 2, n, 90);
    box(P + 'Nord_Giorno_Fianco_Est', SG, -68, n - 47, 10, -66, n, 90);
    box(P + 'Nord_Giorno_Fondo', SG, X1 + 2, n - 47, 10, -68, n - 6, 12);
    box(P + 'Nord_Giorno_Cielo', SG, X1 + 2, n - 47, 88, -68, n, 90);
    rbox(P + 'Nord_Giorno_Ripiano', OAK, [X1 + 2, n - 46, 52, -68, n - 2, 54.5], 1, 0.5);
    box(P + 'Nord_Giorno_Libro_0', [150, 50, 50, 255], -105, n - 36, 54.5, -86, n - 28, 70);
    box(P + 'Nord_Giorno_Libro_1', [60, 90, 140, 255], -105, n - 27, 54.5, -86, n - 19, 66);
    rbox(P + 'Nord_Giorno_Cesto', [196, 170, 120, 255], [-83, n - 40, 54.5, -70, n - 12, 70], 5, 2, 2);
    rbox(P + 'Nord_Giorno_Cesto_Basso', [196, 170, 120, 255], [-77, n - 40, 12, -69, n - 20, 30], 3, 1, 1);          // a destra della griglia, non davanti
    box(P + 'Nord_Mobile_Corpo', SG, -66, n - 47, 10, -11, n - 6, 90);
    box(P + 'Nord_Mobile_Anta', SG, -65, n - 49, 12, -12, n - 47, 88);
    tube(P + 'Nord_Mobile_Maniglia', ST, [[-20, n - 50.2, 48], [-20, n - 50.2, 78]], [0.8, 0.8], 8);

    // ---------- piano in quarzo: un solo profilo (ovest + angolo + nord fino a x -66); rivestimento chiaro sul muro ovest ----------
    slab(P + 'Piano_Lavoro', QZ, [[X0, n - 302], [X1 + 1.5, n - 302], [X1 + 1.5, n - 48.5], [-11, n - 48.5], [-11, n - 6], [X0, n - 6]], 90, 94);
    box(P + 'Paraschizzi_Ovest', STONE, X0, n - 302, 94, X0 + 2, n - 6, 145);

    // ---------- macchina del caffe' a cialde (19 x 27 x 34), appoggiata sul piano subito a nord del frigo, sotto il pensile, fronte verso est (corridoio di lavoro) ----------
    {
      const yc = n - 286.5;
      box(P + 'Caffe_Corpo', [190, 45, 45, 255], -166, yc - 9.5, 94, -139, yc + 9.5, 128);
      box(P + 'Caffe_Serbatoio', [200, 222, 242, 150], -170, yc - 7.5, 100, -166, yc + 7.5, 128);
      box(P + 'Caffe_Vaschetta', BLK, -139, yc - 7.5, 94, -131, yc + 7.5, 97.5);
      tube(P + 'Caffe_Erogatore', ST, [[-146, yc, 118], [-136, yc, 118]], [1.6, 1.6], 10);
      tube(P + 'Caffe_Tazza', [236, 233, 226, 255], [[-135, yc, 97.5], [-135, yc, 105.5]], [3.8, 3.8], 14);
    }

    // ---------- piano cottura a induzione (centro y = n-197) ----------
    box(P + 'Piano_Cottura', BLK, -166, n - 227, 94, -114, n - 167, 94.6);
    for (const [k, x, y, r] of [[0, -153, n - 214, 7], [1, -153, n - 180, 5.5], [2, -127, n - 214, 5.5], [3, -127, n - 180, 7]])
      tube(P + 'Fuoco_' + k, [96, 98, 106, 255], [[x, y, 94.7], [x, y, 95]], [r, r], 16);

    // ---------- lavello d'angolo sotto la finestra: vasca singola + gocciolatoio a nord, rubinetto a collo di cigno contro il muro ovest, dietro la vasca, con il beccuccio sopra la vasca, rubinetto a collo di cigno ----------
    slab(P + 'Lavello_Piano', ST, [[-167, n - 84], [-115, n - 84], [-115, n - 12], [-167, n - 12]], 94, 94.5);
    slab(P + 'Lavello_Vasca', [150, 154, 160, 255], [[-163, n - 80], [-119, n - 80], [-119, n - 44], [-163, n - 44]], 94.5, 95);
    for (let k = 0; k < 6; k++)                                                          // scanalature del gocciolatoio
      box(P + 'Lavello_Scanalatura_' + k, [128, 132, 138, 255], -164 + k * 7.2, n - 38, 94.5, -162 + k * 7.2, n - 16, 94.8);
    tube(P + 'Lavello_Scarico', [196, 198, 204, 255], [[-141, n - 62, 95], [-141, n - 62, 95.4]], [2.4, 2.4], 14);
    tube(P + 'Lavello_Rubinetto', ST, [[-166, n - 62, 94.5], [-166, n - 62, 120], [-163, n - 62, 128], [-156, n - 62, 131], [-149, n - 62, 126]], [1.4, 1.4, 1.4, 1.4, 1.4], 10);

    // ---------- pensili alti (profondita' 35, 145..250), chiusi: sopra i cassettoni, la cappa, la lavastoviglie ----------
    box(P + 'Pensile_Cassettoni_Corpo', WH, X0, n - 302, 145, X0 + 35, n - 242, 250);
    box(P + 'Pensile_Cassettoni_Anta', WH, X0 + 35, n - 301.5, 146, X0 + 37, n - 242.5, 249);
    box(P + 'Pensile_Lavastoviglie_Corpo', WH, X0, n - 152, 145, X0 + 35, n - 92, 250);
    box(P + 'Pensile_Lavastoviglie_Anta', WH, X0 + 35, n - 151.5, 146, X0 + 37, n - 92.5, 249);
    box(P + 'Pensile_Cappa_Corpo', WH, X0, n - 242, 145, X0 + 35, n - 152, 250);
    box(P + 'Cappa_Ribalta', ST, X0 + 35, n - 241.5, 146, X0 + 37, n - 152.5, 168);                // cappa a ribalta in acciaio
    box(P + 'Pensile_Cappa_Anta', WH, X0 + 35, n - 241.5, 169, X0 + 37, n - 152.5, 249);
    for (const [nm, y0, y1] of [['Cassettoni', n - 301.5, n - 242.5], ['Cappa', n - 241.5, n - 152.5], ['Lavastoviglie', n - 151.5, n - 92.5]])
      box(P + 'Pensile_Gola_' + nm, BLK, X0 + 35, y0, 144.2, X0 + 37.2, y1, 145.4);

    // ---------- due mensole in rovere sopra il lavello (la finestra resta libera, sul muro nord) ----------
    for (const [k, z] of [[0, 150], [1, 188]]) {
      box(P + 'Mensola_Sopra_Lavello_' + k, OAK, X0, n - 90, z, X0 + 22, n - 28, z + 3);
    }
    tube(P + 'Mensola_Vaso', [60, 120, 130, 255], [[-158, n - 70, 153], [-158, n - 70, 173]], [5, 5], 14);
    rbox(P + 'Mensola_Pianta', [90, 140, 80, 255], [-165, n - 62, 191, -151, n - 48, 205], 6, 6, 6);

    // ---------- PENISOLA STRETTA = SNACK (piano in rovere profondo 35, x -20..15, y n-197..n-72: 125 cm, 62 a testa), VUOTO SOTTO, sgabelli dal lato soggiorno ----------
    // incastonata nel tratto di muro che resta (x -11..0, y n-72..n): il piano finisce contro il muro; calorifero sul lato soggiorno a y > n-59
    // il piano continua verso nord sopra il calorifero (lato soggiorno, x 0..15) come una MENSOLA a sbalzo, aggirando il tratto di muro (x -11..0)
    slab(P + 'Penisola_Piano', OAK, [[-20, n - 197], [15, n - 197], [15, n - 0.5], [0, n - 0.5], [0, n - 72], [-11, n - 72], [-11, n - 47], [-20, n - 47]], 90, 95);
    rbox(P + 'Mensola_Calorifero_Libro_0', [150, 50, 50, 255], [3, n - 40, 95, 13, n - 22, 98], 0.6, 0.3);
    rbox(P + 'Mensola_Calorifero_Libro_1', [60, 90, 140, 255], [3, n - 40, 98, 13, n - 22, 100.5], 0.6, 0.3);
    tube(P + 'Mensola_Calorifero_Vaso', [190, 100, 70, 255], [[8, n - 12, 95], [8, n - 12, 105]], [4.5, 4.5], 14);
    rbox(P + 'Mensola_Calorifero_Pianta', [90, 140, 80, 255], [3, n - 16, 105, 13, n - 8, 117], 4, 4, 4);
    // una sola gamba: cilindro d'acciaio (diametro 9) all'estremo sud, lontano dal muro (il resto del piano e' a sbalzo dal muro)
    tube(P + 'Penisola_Gamba', ST, [[-2.5, n - 187, 0], [-2.5, n - 187, 90]], [4.5, 4.5], 24);
    // due sgabelli dal lato soggiorno (sedile in rovere, gambe in acciaio nero), seduta infilata ~13 cm sotto il piano
    for (const [k, y] of [[0, n - 166], [1, n - 104]]) {
      const x = 28;
      tube(P + 'Sgabello_Sedile_' + k, OAK, [[x, y, 64], [x, y, 68]], [17, 17], 20);
      for (const [j, sx, sy] of [[0, 1, 1], [1, 1, -1], [2, -1, 1], [3, -1, -1]])
        tube(P + 'Sgabello_Gamba_' + k + '_' + j, BLK, [[x + 13 * sx, y + 13 * sy, 0], [x + 10 * sx, y + 10 * sy, 64]], [1.1, 1.1], 8);
      tube(P + 'Sgabello_Anello_' + k, BLK, [[x - 12, y, 26], [x + 12, y, 26]], [1, 1], 8);
    }
    // sulla penisola: sospensione e un po' di colazione
    tube(P + 'Sospensione_Cavo', BLK, [[-3, n - 135, 330], [-3, n - 135, 205]], [0.35, 0.35], 6);
    tube(P + 'Sospensione_Rosone', BLK, [[-3, n - 135, 327], [-3, n - 135, 330]], [3.5, 3.5], 12);
    rbox(P + 'Sospensione_Paralume', [250, 232, 185, 200], [-17, n - 149, 175, 11, n - 121, 205], 14, 13.5, 13.5);
    light({ p: [-3, n - 135, 173], a: 72, pen: 0.7, c: [255, 214, 160], i: 150, sh: 1, g: 'cucina-v2' });   // luce sotto il paralume (il paralume stesso si accende in house.js)
    // due tovagliette all'americana (40 x 26) davanti agli sgabelli, con piatto, tazza e posate
    for (const [k, y, mug] of [[0, n - 166, [232, 232, 236, 255]], [1, n - 104, [96, 146, 190, 255]]]) {
      rbox(P + 'Tovaglietta_' + k, k === 0 ? [214, 180, 130, 255] : [150, 172, 150, 255], [-12, y - 20, 95, 14, y + 20, 95.5], 1, 0.2);
      tube(P + 'Piatto_' + k, [240, 238, 232, 255], [[2, y - 3, 95.5], [2, y - 3, 96.6]], [9.5, 9.5], 24);
      tube(P + 'Tazza_' + k, mug, [[-5, y + 12, 95.5], [-5, y + 12, 104]], [3.8, 3.8], 14);
      box(P + 'Forchetta_' + k, ST, 11.5, y - 12, 95.5, 12.4, y - 2, 95.9);
      box(P + 'Coltello_' + k, ST, 11.5, y + 2, 95.5, 12.4, y + 12, 95.9);
    }
  });
};
