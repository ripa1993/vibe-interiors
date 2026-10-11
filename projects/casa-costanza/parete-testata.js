// Parete dietro la testata del letto: pittura VERDE salvia sul muro EST della camera a sud (faccia interna x 430, da y -531 a -131), in tono con i comodini Halston
// (che sono [88,106,86]; la parete e' piu' chiara e piu' morbida per non farli sparire). Resa con un pannello sottile (0,3 cm) davanti al muro: nel viewer il muro
// est e' un unico blocco che comprende anche il soggiorno, quindi non si puo' colorare solo la camera senza questo. Misure in cm.
module.exports = function parete({ box, group }) {
  group('parete-testata', () => {
    box('/PareteTestata/Pittura_Verde', [116, 134, 112, 255], 429.7, -531, 0, 430, -131, 330);
  });
};
