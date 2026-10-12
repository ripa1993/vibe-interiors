// Cucina v4 · COPIA DELLA v3 con la COLONNA FRIGO nella GAMBA CORTA DELLA L (il tratto trasversale che sporge verso il centro della COT): il trasversale e' accorciato a 40 (x -111..-71)
// e il frigo sta alla sua estremita' est (x -71..-11), con l'anta sul lato nord. Al posto del vecchio frigo (n-211..n-151) c'e' una base da 60 con tre cassetti, con piano e pensile.
// (v3, a sua volta:) Cucina v3 · COPIA DELLA v1 SENZA IL BANCONE "SNACK" IN ROVERE della penisola (via anche gambe, sgabelli, sospensioni e oggetti sul bancone). Restano il mobile ad angolo e
// il TRATTO TRASVERSALE con i tre cassettoni e il suo piano in ardesia (x -171..-13).
// (Testo originale della v1:) Cucina v1 · "Penisola colazione" — pensata per lo STATO FINALE (divisorio COT/soggiorno e muro basso della COT rimossi).
//
// Linea ovest (lungo il muro con gli attacchi), da sud a nord:
//   mobile ad angolo (con il tratto trasversale che si salda alla penisola) · colonna FORNELLO (piano a induzione + forno, cappa integrata
//   nel pensile) · frigo INCASSATO (ante bianche a filo, gole, cappello a 250 cm) · lavastoviglie da 60 · mobile LAVELLO diritto
//   (60 x 91) con il lavello rettangolare (vasca + gocciolatoio) sotto la finestra e il rubinetto contro il muro ovest: come nella cucina v2.
// Parete nord (quella dello scaldabagno): niente mobili: parete LIBERA da x -109 al divisorio, sotto la caldaia, con la griglia di aerazione del gas in vista.
// Pensili alti (da 145 a 250 cm), chiusi, a filo, a tratti; sopra il lavello, mensole A GIORNO a gradini, con pianta a triangolo /
//   trapezio che sfumano nel muro. Rivestimento in pietra tra piano e pensili, come nella cucina attuale.
// Un elettrodomestico appoggiato (non incassato) sul piano d'angolo: macchina caffe' a cialde, sotto il pensile a sinistra della cappa e ruotata di 45° verso chi la usa. Microonde e friggitrice ad aria sono
//   stati tolti e salvati in elettrodomestici-extra.js.
// PENISOLA: bancone in rovere profondo 35 cm (x -13..22), VUOTO SOTTO, su gambe d'acciaio, agganciato al trasversale; due sgabelli
//   infilati sotto il piano e due sospensioni, per la colazione in due. La cucina si apre solo a nord, con ~100 cm di passaggio.
//
// Tutte le misure sono in cm, stime di progetto (non rilievi). `n` e' la y del muro nord interno della COT.
module.exports = function cucinaV4({ box: _box, tube: _tube, rbox: _rbox, slab: _slab, group, n }) {
  // SHY sposta in y tutto cio' che viene disegnato mentre e' diverso da 0 (serve per scambiare le colonne frigo / fornello)
  let SHY = 0;
  const box = (nm, c, x0, y0, z0, x1, y1, z1) => _box(nm, c, x0, y0 + SHY, z0, x1, y1 + SHY, z1);
  const tube = (nm, c, p, r, seg) => _tube(nm, c, p.map(q => [q[0], q[1] + SHY, q[2]]), r, seg);
  const rbox = (nm, c, b, r, top, bot) => _rbox(nm, c, [b[0], b[1] + SHY, b[2], b[3], b[4] + SHY, b[5]], r, top, bot);
  const slab = (nm, c, poly, z0, z1) => _slab(nm, c, poly.map(([x, y]) => [x, y + SHY]), z0, z1);

  const WH = [236, 233, 226, 255];       // laccato bianco caldo
  const DK = [58, 60, 64, 255];          // ardesia scura (piano di lavoro)
  const OAK = [196, 158, 108, 255];      // rovere
  const ST = [188, 191, 196, 255];       // acciaio
  const BLK = [40, 42, 46, 255];         // nero opaco
  const STONE = [112, 114, 120, 255];    // pietra a spacco
  const P = '/CucinaV4/';

  group('cucina-v4', () => {
    // ---------- zoccoli (rientrati di 5 cm) ----------
    box(P + 'Zoccolo_Linea', BLK, -171, n - 357, 0, -116, n - 6, 10);                      // angolo e linea

    // ---------- mobile ad angolo (60 x 60): si salda al trasversale della penisola ----------
    box(P + 'Angolo_Corpo', WH, -171, n - 362, 10, -112, n - 302, 90);

    // v4: al posto della colonna frigo (n-211..n-151) c'e' un MOBILE BASSO da 60 con tre cassetti, a filo con il piano del fornello; il frigo e' nella gamba corta della L
    SHY = -91;                                                          // v4 (scambio): la base a cassetti passa da n-211..n-151 a n-302..n-242
    box(P + 'Base_Cassetti_Frigo', WH, -171, n - 211, 10, -112, n - 151, 90);
    for (let k = 0; k < 3; k++) {
      const z0 = 12 + k * 26.5, z1 = z0 + 25;
      box(P + 'Base_Cassetti_Frigo_Fronte_' + k, WH, -112, n - 210.5, z0, -110, n - 151.5, z1);
      tube(P + 'Base_Cassetti_Frigo_Maniglia_' + k, ST, [[-108.8, n - 195, z1 - 4], [-108.8, n - 167, z1 - 4]], [0.8, 0.8], 8);
    }
    rbox(P + 'Piano_Cassetti_Frigo', DK, [-171, n - 212, 90, -109, n - 150, 94], 1.2, 0.6);
    SHY = 0;

    // ---------- mobili bassi, linea ovest (profondita' 60, piano a 90), da y n-241 a n-6 ----------
    box(P + 'Base_Corpo_Fornello', WH, -171, n - 241, 10, -112, n - 151, 90);               // colonna fornello (90), subito dopo l'angolo
    SHY = 0;                                                            // colonna fornello (v4): n-241..n-151, accanto alla lavastoviglie
    // sotto il piano cottura: FORNO da incasso (60 x 60, centrato su y = n-196), cassetto basso e fianchi (n-241..n-151)
    const GLASS = [28, 30, 34, 255];
    box(P + 'Forno_Fianco_Sud', WH, -112, n - 240, 12, -110, n - 226.5, 88);
    box(P + 'Forno_Fianco_Nord', WH, -112, n - 165.5, 12, -110, n - 152, 88);
    box(P + 'Forno_Comandi', ST, -112, n - 226, 76, -110, n - 166, 88);                  // mostrina comandi
    for (let k = 0; k < 3; k++) {                                                          // 3 manopole
      const y = n - 214 + k * 18;
      tube(P + 'Forno_Manopola_' + k, BLK, [[-110, y, 82], [-107, y, 82]], [1.8, 1.8], 12);
    }
    box(P + 'Forno_Sportello', GLASS, -112, n - 226, 30, -110, n - 166, 75);             // sportello in vetro nero
    tube(P + 'Forno_Maniglia', ST, [[-108.2, n - 222, 70], [-108.2, n - 170, 70]], [0.9, 0.9], 10);
    box(P + 'Forno_Cassetto', WH, -112, n - 226, 12, -110, n - 166, 29);
    tube(P + 'Forno_Cassetto_Maniglia', ST, [[-108.8, n - 206, 24], [-108.8, n - 186, 24]], [0.8, 0.8]);
    SHY = 0;
    // LAVASTOVIGLIE da 60 (come nella cucina v2), subito a nord del frigo (n-151..n-91), fronte in acciaio verso il corridoio di lavoro
    box(P + 'Base_Lavastoviglie', WH, -171, n - 151, 10, -114, n - 91, 90);
    box(P + 'Lavastoviglie_Sportello', ST, -114, n - 150.5, 12, -112, n - 91.5, 78);
    box(P + 'Lavastoviglie_Comandi', BLK, -114, n - 150.5, 79, -112, n - 91.5, 88);
    tube(P + 'Lavastoviglie_Maniglia', ST, [[-110.8, n - 143, 70], [-110.8, n - 99, 70]], [0.9, 0.9], 10);
    // MOBILE LAVELLO (60 x 91, come nella v2): corpo diritto fino alla parete nord, anta sul tratto verso la lavastoviglie, tratto d'angolo cieco
    box(P + 'Base_Lavello', WH, -171, n - 91, 10, -112, n - 6, 90);
    box(P + 'Lavello_Anta_Ovest', WH, -112, n - 90.5, 12, -110, n - 48.5, 88);
    tube(P + 'Lavello_Maniglia_Ovest', ST, [[-108.8, n - 52, 58], [-108.8, n - 52, 82]], [0.8, 0.8], 8);

    // ---------- parete NORD (quella dello scaldabagno): mobile a cassetti e mobile basso sotto la caldaia ----------
    // piano di lavoro (ardesia) in due pezzi: angolo+trasversale (in fondo, con la penisola) e linea (n-241..n-6); paraschizzi in pietra
    // piano in ardesia: linea ovest + angolo smussato + lavastoviglie mini (profilo unico, sbalzo 1,5 cm)
    slab(P + 'Piano_Lavoro', DK, [[-171, n - 151], [-109, n - 151], [-109, n - 6], [-171, n - 6]], 90, 94);                    // linea ovest (lavastoviglie + lavello)
    // dal lavello (x -109) al divisorio (x -11) la parete nord e' libera: niente mobili ne' piano, resta in vista la griglia di aerazione del gas
    rbox(P + 'Piano_Fornello', DK, [-171, n - 241, 90, -109, n - 151, 94], 1.5, 0.8);                // sopra la colonna fornello
    box(P + 'Paraschizzi_Fornello', STONE, -171, n - 241, 94, -169, n - 151, 145);
    box(P + 'Paraschizzi_Pietra', STONE, -171, n - 151, 94, -169, n - 6, 145);
    box(P + 'Paraschizzi_Cassetti', STONE, -171, n - 302, 94, -169, n - 241, 145);
    box(P + 'Paraschizzi_Angolo', STONE, -171, n - 362, 94, -169, n - 302, 145);

    // lavello d'angolo sotto la finestra, come nella v2: vasca singola + gocciolatoio verso nord, rubinetto a collo di cigno contro il muro OVEST, dietro la vasca
    slab(P + 'Lavello_Piano', ST, [[-167, n - 84], [-115, n - 84], [-115, n - 12], [-167, n - 12]], 94, 94.5);
    slab(P + 'Lavello_Vasca', [150, 154, 160, 255], [[-163, n - 80], [-119, n - 80], [-119, n - 44], [-163, n - 44]], 94.5, 95);
    for (let k = 0; k < 6; k++)                                                          // scanalature del gocciolatoio
      box(P + 'Lavello_Scanalatura_' + k, [128, 132, 138, 255], -164 + k * 7.2, n - 38, 94.5, -162 + k * 7.2, n - 16, 94.8);
    tube(P + 'Lavello_Scarico', [196, 198, 204, 255], [[-141, n - 62, 95], [-141, n - 62, 95.4]], [2.4, 2.4], 14);
    tube(P + 'Lavello_Rubinetto', ST, [[-166, n - 62, 94.5], [-166, n - 62, 120], [-163, n - 62, 128], [-156, n - 62, 131], [-149, n - 62, 126]], [1.4, 1.4, 1.4, 1.4, 1.4], 10);

    SHY = 0;
    // piano cottura a induzione + cappa (centro y = n-196)
    box(P + 'Piano_Cottura', BLK, -166, n - 226, 94, -114, n - 166, 94.6);
    for (const [k, x, y, r] of [[0, -153, n - 213, 7], [1, -153, n - 179, 5.5], [2, -127, n - 213, 5.5], [3, -127, n - 179, 7]]) {
      tube(P + 'Fuoco_' + k, [96, 98, 106, 255], [[x, y, 94.7], [x, y, 95]], [r, r], 16);
    }
    SHY = 0;

    // ---------- pensili alti (profondita' 35, da 145 a 250), chiusi, a filo, a due tratti: sopra il fornello e dopo il frigo ----------
    // il frigo (colonna 200 + cappello 250) interrompe la fila; cappa INTEGRATA nell'anta a ribalta sopra il fornello
    box(P + 'Pensili_Corpo_Fornello', WH, -171, n - 241, 145, -137, n - 151, 250);
    SHY = -91;                                                          // v4 (scambio): pensile sopra la base a cassetti, n-302..n-242
    box(P + 'Pensili_Corpo_Sopra_Cassetti', WH, -171, n - 211, 145, -137, n - 151, 250);                // v4: sopra la base cassetti, dove era il frigo
    box(P + 'Pensili_Anta_Sopra_Cassetti', WH, -137, n - 210.5, 146, -135, n - 151.5, 249);
    box(P + 'Pensili_Gola_Sopra_Cassetti', BLK, -137, n - 210.5, 144.2, -134.8, n - 151.5, 145.4);
    SHY = 0;
    box(P + 'Pensili_Corpo_Dopo_Frigo', WH, -171, n - 150, 145, -137, n - 82, 250);                // si fermano prima dell'angolo: la finestra resta libera
    box(P + 'Pensile_Sinistro_Corpo', WH, -171, n - 362, 145, -137, n - 302, 250);               // a sinistra della cappa, sopra l'angolo con gli elettrodomestici
    box(P + 'Pensile_Sinistro_Anta', WH, -137, n - 361.5, 146, -135, n - 302.5, 249);
    box(P + 'Pensile_Sinistro_Gola', BLK, -137, n - 361.5, 145.2, -134.8, n - 302.5, 146.4);
    const cols = [[n - 240.5, n - 231.5, 'Fianco_S'], [n - 231, n - 161, 'Cappa'], [n - 160.5, n - 151.5, 'Fianco_N'],
                  [n - 149.5, n - 116.5, 'Anta0'], [n - 116, n - 82.5, 'Anta1']];
    for (const [y0, y1, nm] of cols) {
      const z0 = 146, z1 = 249;
      if (nm === 'Cappa') {
        box(P + 'Cappa_Ribalta', ST, -137, y0, z0, -135, y1, 168);                           // ribalta in acciaio (70 cm) sulla cappa
        box(P + 'Pensili_Anta_Sopra_Cappa', WH, -137, y0, 169, -135, y1, z1);
      } else {
        box(P + 'Pensili_Basso_' + nm, WH, -137, y0, z0, -135, y1, z1);
      }
      box(P + 'Pensili_Gola_' + nm, BLK, -137, y0, z0 - 0.8, -134.8, y1, z0 + 0.4);
    }

    // ---------- mensole A GIORNO a gradini sopra il lavello, a nord del pensile dopo il frigo (lato ovest) ----------
    // pianta a triangolo / trapezio: partono dalla profondita' dei pensili e vanno a sfumare nel muro verso l'angolo; piu' corte salendo
    {
      const y0 = n - 82;                                                          // fine del pensile
      const lv = [[150, n - 14, 35, 0], [178, n - 24, 32, 7], [206, n - 34, 29, 0], [234, n - 44, 26, 6]];     // [z, y finale, profondita' iniziale, profondita' finale]
      lv.forEach(([z, yf, D, d], i) => {
        slab(P + 'Mensola_Giorno_' + i, OAK, [[-171, y0], [-171 + D, y0], [-171 + d, yf], [-171, yf]], z, z + 3);
      });
      // qualche oggetto, vicino al lato profondo
      tube(P + 'Mensola_Vaso', [60, 120, 130, 255], [[-156, n - 70, 153], [-156, n - 70, 173]], [5, 5], 14);
      box(P + 'Mensola_Libro_0', [150, 50, 50, 255], -167, n - 78, 181, -146, n - 72, 199);
      box(P + 'Mensola_Libro_1', [60, 90, 140, 255], -167, n - 71, 181, -146, n - 66, 193);
      tube(P + 'Mensola_Vaso_Terracotta', [190, 100, 70, 255], [[-158, n - 74, 209], [-158, n - 74, 217]], [4.5, 4.5], 14);
      rbox(P + 'Mensola_Pianta', [90, 140, 80, 255], [-164, n - 80, 217, -152, n - 68, 229], 5, 5, 5);
      rbox(P + 'Mensola_Ciotola', [226, 218, 200, 255], [-165, n - 80, 237, -149, n - 66, 244], 8, 2, 4);
    }

    // ---------- elettrodomestico appoggiato (non incassato) sul piano d'angolo, fronte a nord ----------
    // macchina caffe' a cialde 19 x 30 x 34, sotto il pensile a sinistra della cappa, RUOTATA di 45° verso chi la usa (corridoio di lavoro, a nord-est);
    // con serbatoio dietro, vaschetta davanti e tazza. Pezzi ruotati = poligoni in pianta (nel viewer niente rotazioni)
    {
      const cx = -150, cy = n - 340, k = Math.SQRT1_2;
      const R = (s, t) => [cx + (s + t) * k, cy + (t - s) * k];                       // s = lungo la larghezza (destra), t = in avanti (verso nord-est)
      const rect = (s0, s1, t0, t1) => [R(s0, t0), R(s1, t0), R(s1, t1), R(s0, t1)];  // antiorario
      slab(P + 'Caffe_Corpo', [190, 45, 45, 255], rect(-9.5, 9.5, -15, 15), 94, 128);
      slab(P + 'Caffe_Serbatoio', [200, 222, 242, 150], rect(-7.5, 7.5, -19, -15), 100, 128);
      slab(P + 'Caffe_Vaschetta', BLK, rect(-7.5, 7.5, 15, 23), 94, 97.5);
      tube(P + 'Caffe_Erogatore', ST, [[...R(0, 15), 118], [...R(0, 20), 118]], [1.6, 1.6], 10);
      tube(P + 'Caffe_Tazza', [236, 233, 226, 255], [[...R(0, 19), 97.5], [...R(0, 19), 105.5]], [3.8, 3.8], 14);
    }

    // ---------- GAMBA CORTA DELLA L (verso il centro della COT): tratto trasversale da 40 con un'anta + COLONNA FRIGO all'estremo est ----------
    box(P + 'Zoccolo_Trasversale', BLK, -106, n - 357, 0, -76, n - 307, 10);
    box(P + 'Trasversale_Corpo', WH, -111, n - 362, 10, -71, n - 302, 90);          // 40 x 60, dopo il mobile d'angolo
    box(P + 'Trasversale_Retro', WH, -109, n - 363, 10, -71, n - 362, 90);            // fianco verso il corridoio
    // anta normale (40 x 76, cerniere a ovest) al posto dei tre cassettoni, accanto al frigo
    box(P + 'Trasversale_Anta', WH, -110, n - 302, 12, -72, n - 300, 88);
    tube(P + 'Trasversale_Maniglia', ST, [[-77, n - 298.8, 58], [-77, n - 298.8, 82]], [0.8, 0.8], 8);
    rbox(P + 'Trasversale_Piano', DK, [-171, n - 362, 90, -71, n - 302, 94], 1.5, 0.8);               // angolo + trasversale
    // pezzo di PARETE: PROLUNGAMENTO di Muro_Sotto_Resta (muro sud della COT, spessore 11, y 128..139) verso est, da x -109 a -11, a coprire il RETRO del frigo (la sua faccia sud, perche'
    // l'anta e' a nord); alto come la casa
    box(P + 'Parete_Retro_Frigo', [250, 250, 248, 255], -109, n - 373, 0, -11, n - 362, 330);
    // ELEMENTO A GIORNO sopra il trasversale (z 145..250, x -135..-71, y 139..199): collega il pensile sopra l'angolo (a ovest) al cappello del frigo (a est); aperto sul lato NORD,
    // con il muro sud come schiena; cielo e fondo da 2 cm, due ripiani in rovere, libri e una piantina
    box(P + 'Giorno_Cielo', WH, -135, n - 362, 248, -71, n - 302, 250);
    box(P + 'Giorno_Fondo', WH, -135, n - 362, 145, -71, n - 302, 147);
    for (const z of [182, 216]) rbox(P + 'Giorno_Ripiano_' + z, OAK, [-135, n - 361.5, z, -71, n - 302, z + 2.2], 0.5, 0.4);
    box(P + 'Giorno_Libro_0', [150, 50, 50, 255], -134, n - 358, 147, -128, n - 338, 172);
    box(P + 'Giorno_Libro_1', [60, 90, 140, 255], -127.5, n - 358, 147, -122, n - 338, 168);
    box(P + 'Giorno_Libro_2', [196, 176, 120, 255], -121.5, n - 358, 147, -116, n - 338, 174);
    tube(P + 'Giorno_Vaso_0', [236, 232, 220, 255], [[-95, n - 340, 147], [-95, n - 340, 156], [-95, n - 340, 162]], [4, 5.2, 2.6], 14);
    tube(P + 'Giorno_Pianta_0', [90, 140, 80, 255], [[-95, n - 340, 162], [-95, n - 340, 176]], [1, 5.5], 10);
    rbox(P + 'Giorno_Cesto', [196, 170, 120, 255], [-132, n - 358, 184.2, -104, n - 318, 204], 4, 2, 2);
    rbox(P + 'Giorno_Ciotola', [226, 218, 200, 255], [-98, n - 350, 218.2, -76, n - 330, 226], 8, 2, 4);
    // frigorifero INCASSATO (colonna 60 x 60) all'estremo est: anta sul lato NORD (guarda il centro della COT, verso il corridoio di lavoro), gole a ovest = cerniere a est
    box(P + 'Zoccolo_Frigo', BLK, -71, n - 357, 0, -16, n - 307, 10);
    box(P + 'Frigo_Colonna', WH, -71, n - 362, 10, -11, n - 302, 200);
    box(P + 'Frigo_Anta_Congelatore', WH, -70.5, n - 302, 12, -11.5, n - 300, 100);
    box(P + 'Frigo_Anta_Frigorifero', WH, -70.5, n - 302, 101.5, -11.5, n - 300, 199);
    box(P + 'Frigo_Gola_Congelatore', BLK, -70.5, n - 300, 22, -69.5, n - 299.8, 92);
    box(P + 'Frigo_Gola_Frigorifero', BLK, -70.5, n - 300, 110, -69.5, n - 299.8, 190);
    box(P + 'Frigo_Cappello_Corpo', WH, -71, n - 362, 201, -11, n - 302, 250);
    box(P + 'Frigo_Cappello_Anta', WH, -70.5, n - 302, 202, -11.5, n - 300, 249);
    box(P + 'Frigo_Cappello_Gola', BLK, -70.5, n - 300, 207, -69.5, n - 299.8, 241);
  });
};
