// Ingresso (corridoio), muro sud (y 0): mensola alta e 3 stampe, sopra/accanto al calorifero (x -300..-240) e all'attaccapanni (x -158..-92). L'arco sta a x -11.
//  - mensola flottante in rovere lunga 200 x 18 x 3,5 cm (x -232..-32) a 198 cm da terra, con libri, vasetto, pianta e scatola;
//  - stampe: sopra il calorifero (30 x 40), tra calorifero e attaccapanni (36 x 46), dopo l'attaccapanni (32 x 42), z 125..171; stesso helper `frame` delle altre stampe.
// Tutto stimato, nessuna misura dell'utente. Misure in cm.
module.exports = function ingressoDecor({ box, tube, group }) {
  const P = '/IngressoDecor/';
  const { pot, plant, frame, GRN2, TERRA, SAGE } = require('./decor.js')({ box, tube, P });
  const OAK = [200, 164, 116, 255], DK = [40, 44, 50, 255], CER = [248, 248, 246, 255];
  group('ingresso-stampe-mensola', () => {
    const zs = 198, zt = zs + 3.5, d = 18;
    box(P + 'Mensola', OAK, -232, 0, zs, -32, d, zt);
    // sopra la mensola
    [[-224, 3, [200, 90, 80, 255]], [-221, 2.6, [60, 90, 110, 255]], [-219, 3.2, [226, 190, 110, 255]]].forEach(([x, h, c], i) => box(P + 'Libro_' + i, c, x, 3, zt, x + 3, 14, zt + 9 + h * 0.5 * i)); // pila di libri in piedi, altezze diverse
    pot('Vaso_Mensola', -170, 9, zt, 8, 3.8, 4.8, TERRA);
    plant('Pianta_Mensola', -170, 9, zt + 6, 7, 16, 6, GRN2);
    tube(P + 'Vaso_Alto', CER, [[-110, 9, zt], [-110, 9, zt + 22]], [4.5, 2.2], 20);                                   // vaso bianco alto
    tube(P + 'Ramo_1', SAGE, [[-110, 9, zt + 21], [-106, 9, zt + 36], [-103, 9, zt + 46]], [0.3, 0.5, 0.2], 6);
    box(P + 'Scatola', DK, -66, 3, zt, -42, 15, zt + 8);
    // stampe sul muro (sporgono verso +y: s = -1)
    frame('Stampa_1', -285, 128, 30, 40, 0, -1, DK, [226, 214, 194, 255], [214, 140, 100, 255], [120, 150, 125, 255]);
    frame('Stampa_2', -219, 125, 36, 46, 0, -1, OAK, [150, 176, 160, 255], [240, 226, 190, 255], [60, 90, 80, 255]);
    frame('Stampa_3', -80, 129, 32, 42, 0, -1, DK, [60, 82, 104, 255], [232, 190, 110, 255], [200, 210, 220, 255]);
  });
};
