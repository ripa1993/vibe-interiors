// Porta SCORREVOLE CORN (Leroy Merlin), MDF grigio, 92,5 x 211,5 con binario "industrial", sulla porta della camera a sud (vano nel muro nord a y -131..-120,
// x 200..290, alto 210). Il sito non e' leggibile dal modello (403): misure del pannello dal nome del prodotto, aspetto dalla foto fornita dall'utente
// (pannello liscio grigio chiaro venato in orizzontale con 3 scanalature orizzontali, senza maniglia in vista; binario a barra nera piatta, lunga circa
// il doppio dell'anta, con due carrelli a ruota tonda e piastre nere sul bordo alto dell'anta). Spessore (4) e dimensioni del binario sono stime.
// Montaggio (scelta di progetto): sul lato STANZA del muro (y -131), pannello a 10 cm dal muro e a 3 cm da terra; chiuso copre il vano (x 200..292,5);
// e' disegnata APERTA (OPEN = true: pannello a x 292,5..385; false = chiusa), scorrendo verso EST (x fino a 385), perche' a ovest c'e' il calorifero (x 100..200). Il pannello resta davanti ai falsi stipiti del vano.
// Misure in cm, stime di progetto.
module.exports = function portaCamera({ box, tube, rbox, slab, group, n }) {
  const GR = [190, 188, 184, 255], GRD = [150, 148, 144, 255], BLK = [38, 40, 44, 255];
  const P = '/PortaCamera/';
  const YW = -131;                                  // faccia del muro, lato camera
  const y0 = YW - 10, y1 = y0 + 4;                  // pannello: spessore 4, a 6 cm dal muro, lato camera = y0
  const OPEN = true;                                // anta APERTA: scorrevole tutta a est, vano libero (chiusa: x 200..292,5)
  const x0 = OPEN ? 292.5 : 200, x1 = x0 + 92.5, z0 = 3, z1 = z0 + 211.5;
  const RZ = 228;                                   // quota del centro della barra del binario

  group('porta-camera', () => {
    rbox(P + 'Pannello', GR, [x0, y0, z0, x1, y1, z1], 0.6, 0.6);
    // 3 scanalature orizzontali (dal disegno: a ~36%, 68% e 90% dall'alto) + qualche venatura chiara/scura leggera
    for (const f of [0.36, 0.68, 0.90]) box(P + 'Scanalatura_' + f, GRD, x0 + 0.5, y0 - 0.15, z1 - f * 211.5, x1 - 0.5, y0 + 0.15, z1 - f * 211.5 + 0.6);
    // binario industrial: barra nera piatta da 192 (da x 198 a 390), distanziali al muro, due carrelli a ruota tonda con piastra sul bordo alto dell'anta, fermi
    box(P + 'Binario', BLK, 198, y0 - 3.4, RZ - 2.5, 390, y0 - 0.5, RZ + 2.5);
    for (const x of [206, 255, 330, 383])
      tube(P + 'Binario_Distanziale_' + x, BLK, [[x, YW, RZ], [x, y0 - 0.5, RZ]], [1.5, 1.5], 10);
    for (const [k, x] of [[0, x0 + 15], [1, x1 - 15]]) {
      tube(P + 'Carrello_Ruota_' + k, BLK, [[x, y0 - 5.0, RZ], [x, y0 - 3.4, RZ]], [5.2, 5.2], 20);                    // ruota tonda davanti al binario
      tube(P + 'Carrello_Bullone_' + k, [70, 72, 76, 255], [[x, y0 - 5.4, RZ], [x, y0 - 5.0, RZ]], [1.4, 1.4], 10);
      box(P + 'Carrello_Piastra_' + k, BLK, x - 1.8, y0 - 3.4, z1 - 14, x + 1.8, y0 - 1.6, RZ);                         // piastra dal bordo alto dell'anta alla ruota
    }
    for (const x of [198, 388]) box(P + 'Binario_Fermo_' + x, BLK, x, y0 - 3.9, RZ - 3, x + 2, y0 - 0.1, RZ + 3);
    // guida a terra a meta' corsa
    box(P + 'Guida_Pavimento', BLK, 330, y0 + 0.5, 0, 331.5, y1 - 0.5, 1.2);
  });
};
