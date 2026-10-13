// Genera scene.json della casa (Piano Primo) direttamente, senza SketchUp.
// Tutte le misure sono in cm (x = destra, y = su in pianta, z = altezza); l'output è in pollici.
// Origine: angolo interno in basso a sinistra del soggiorno.
// Uso: node projects/casa-costanza/house.js [file_output]   (default: scene.json accanto a questo file)
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2] || path.join(__dirname, 'scene.json');
const SOGG_D = 501;                              // profondità interna del soggiorno (prima 401: probabile errore di misura)
const DY = SOGG_D - 401;                          // spostamento delle parti ancorate al muro in alto
const H = 330;                                   // altezza uniforme dei locali
let SPAWN;
const inch = v => +(v / 2.54).toFixed(3);

// colori: pareti tutte bianche (C.wall = misurato, C.est = stimato: la distinzione resta nei nomi/commenti); da rimuovere nei lavori in arancio
const WALL_WHITE = [250, 250, 248, 255];                         // pareti bianche (prima: beige = misurato, azzurro = stimato)
const C = { wall: WALL_WHITE, est: WALL_WHITE, rem: [226, 160, 130, 255],
            floor: [190, 184, 178, 255], wood: [150, 110, 70, 255], glass: [150, 190, 220, 90],
            white: [245, 245, 245, 255], gas: [230, 200, 60, 255], water: [80, 130, 210, 255],
            heater: [215, 215, 222, 255] };

const items = [];

// Gruppi attivabili nel viewer (tutti spenti di default). Gli oggetti senza gruppo sono sempre visibili.
//   defGroup(id, etichetta, categoria, [variante])  -> gruppi con la stessa `variante` sono mutuamente esclusivi (es. cucina v1 / v2)
//   group(id, () => { ...box()/tube()/slab()... })  -> tutto cio' che disegni dentro prende il gruppo `id`
const GROUPS = [];
const DEFAULT_ON = ['divano-v2', 'tavolo', 'soggiorno-libreria', 'soggiorno-tv', 'parete-testata', 'mensole-testata', 'porta-camera', 'armadio-v2', 'comodini', 'letto-v1', 'wc-grande-arredo', 'antibagno-scarpiera', 'antibagno-elvarli', 'ingresso-attaccapanni', 'ingresso-stampe-mensola', 'wc-piccolo-arredo', 'cucina-v2', 'camera-nord', 'soggiorno-billy', 'ripostiglio-stagione', 'ripostiglio-pulizia', 'luci'];   // accesi al caricamento del viewer
const defGroup = (id, label, cat, variant) => GROUPS.push(Object.assign({ id, label, cat }, variant ? { variant } : {}, DEFAULT_ON.includes(id) ? { on: true } : {}));
const lights = [];                                                  // sorgenti per la modalita' notte del viewer (cm -> pollici); vedi luci.js
const light = d => lights.push(Object.assign({ t: 'spot', g: 'luci' }, d, { p: d.p.map(v => +(v / 2.54).toFixed(3)) }));
const group = (id, fn) => { const from = items.length; fn(); for (let k = from; k < items.length; k++) items[k].g = id; };
defGroup('attacchi-cucina', 'Attacchi cucina', 'Attacchi');
defGroup('attacchi-wc-grande', 'Attacchi WC grande', 'Attacchi');
defGroup('attacchi-wc-piccolo', 'Attacchi WC piccolo', 'Attacchi');
defGroup('wc-grande-arredo', 'WC grande · doccia, lavasciuga, water, bidet, mobile lavabo (sui attacchi esistenti)', 'WC grande');
defGroup('antibagno-scarpiera', 'Antibagno WC grande · scarpiera MACKAPÄR (IKEA) sul muro ovest', 'WC grande');
defGroup('antibagno-elvarli', 'Antibagno WC grande · guardaroba ELVARLI (IKEA) sul muro est', 'WC grande');
defGroup('ingresso-attaccapanni', 'Ingresso · attaccapanni da parete moderno, dopo il calorifero', 'Ingresso');
defGroup('ingresso-stampe-mensola', 'Ingresso · mensola alta e 3 stampe sul muro sud', 'Ingresso');
defGroup('wc-piccolo-arredo', 'WC piccolo · bidet, water, lavabo da hotel (sui attacchi esistenti)', 'WC piccolo');
defGroup('cucina-v1', 'Cucina v1 · penisola colazione', 'Cucina', 'cucina');   // le varianti della cucina sono mutuamente esclusive (stessa `variant`)
defGroup('soggiorno-divano', 'Soggiorno · divano ad L + tappeto + lampada', 'Soggiorno', 'divano');
defGroup('divano-v1', 'Soggiorno · divano Cavarelli lineare', 'Soggiorno', 'divano');
defGroup('divano-v2', 'Soggiorno · divano letto IKEA Barsloev con chaise, di fronte alla TV', 'Soggiorno', 'divano');
defGroup('divano-v3', 'Soggiorno · divano IKEA ruotato verso la TV a est, chaise a nord', 'Soggiorno', 'divano');   // i due divani sono varianti: uno esclude l'altro
defGroup('parete-testata', 'Camera sud · parete della testata verde salvia', 'Camera sud');
defGroup('mensole-testata', 'Camera sud · mensole minimali sulla parete verde', 'Camera sud');
defGroup('porta-camera', 'Camera sud · porta scorrevole Corn (Leroy Merlin)', 'Camera sud');
defGroup('armadio', 'Camera sud · armadio PAX angolare (sud-ovest)', 'Camera sud', 'armadio');
defGroup('armadio-v2', 'Camera sud · armadio v2: 2 PAX da 100 + ante a specchio + TV 43" + BESTA (parete ovest)', 'Camera sud', 'armadio');   // varianti: una esclude l'altra
defGroup('comodini', 'Camera sud · 2 comodini Halston', 'Camera sud');
defGroup('letto-v1', 'Camera sud · letto IKEA Gladstad 160x200', 'Camera sud');
defGroup('camera-nord', 'Camera nord · camera ospiti: libreria nella nicchia, divano letto, cassettiera, tavolino, tappeto', 'Camera nord');
defGroup('tavolo', 'Soggiorno · tavolo allungabile + 4 sedie', 'Soggiorno');
defGroup('soggiorno-libreria', 'Soggiorno · libreria a mensole nella nicchia', 'Soggiorno');
defGroup('soggiorno-billy', 'Soggiorno · composizione BILLY (IKEA) sul muro sud, a ovest della porta', 'Soggiorno');
defGroup('ripostiglio-stagione', 'Ripostiglio ovest · cambio di stagione (asta, scatole, valigie)', 'Ripostigli');
defGroup('ripostiglio-pulizia', 'Ripostiglio est · pulizia (scope, aspirapolvere, detersivi)', 'Ripostigli');
defGroup('luci', 'Illuminazione · punti luce a soffitto e applique in tutte le stanze', 'Illuminazione');
defGroup('soggiorno-tv', 'Soggiorno · mobile TV + TV + pianta', 'Soggiorno', 'tv');
defGroup('soggiorno-tv-est', 'Soggiorno · TV a est, parete attrezzata', 'Soggiorno', 'tv');   // varianti: una esclude l'altra
defGroup('cucina-v5', 'Cucina v5 · come la v3, penisola tondeggiante al posto del bancone a sud', 'Cucina', 'cucina');
defGroup('cucina-v4', 'Cucina v4 · come la v3, frigo e trasversale scambiati', 'Cucina', 'cucina');
defGroup('cucina-v3', 'Cucina v3 · come la v1, senza penisola', 'Cucina', 'cucina');
defGroup('cucina-v2', 'Cucina v2 · linea ovest + penisola stretta', 'Cucina', 'cucina');
const box = (n, c, x0, y0, z0, x1, y1, z1) =>
  items.push({ n, c, box: [x0, y0, z0, x1, y1, z1].map(inch) });
const slab = (n, c, poly, z0, z1, holes = []) =>
  items.push({ n, c, slab: { o: poly.map(p => p.map(inch)), h: holes.map(h => h.map(p => p.map(inch))), z: [inch(z0), inch(z1)] } });
const tray = (n, c, poly, zFloor, zTop) =>
  items.push({ n, c, tray: { o: poly.map(p => p.map(inch)), z: [inch(zFloor), inch(zTop)] } });
const tube = (n, c, p, r, seg = 8) =>
  items.push({ n, c, tube: { p: p.map(q => q.map(inch)), r: r.map(inch), n: seg } });
const rbox = (n, c, b, r, top, bot = 0) =>
  items.push({ n, c, rbox: { b: b.map(inch), r: inch(r), top: inch(top), bot: inch(bot) } });
const quad = (a, b, c, d) => [a, b, c, d].map(p => p.map(inch));
// falso stipite in un vano su muro lungo X (spessore y0..y1): due montanti e una traversa di 4 cm, nessuna anta
// stesso falso stipite per vani su muri lungo Y (spessore x0..x1, apertura y0..y1)
const stipiteY = (nome, x0, x1, y0, y1, h = 210, w = 4) => {
  box(nome + '_A', C.wood, x0, y0, 0, x1, y0 + w, h);
  box(nome + '_B', C.wood, x0, y1 - w, 0, x1, y1, h);
  box(nome + '_Alto', C.wood, x0, y0 + w, h - w, x1, y1 - w, h);
};
const stipiteX = (nome, x0, x1, y0, y1, h = 210, w = 4) => {
  box(nome + '_Sx', C.wood, x0, y0, 0, x0 + w, y1, h);
  box(nome + '_Dx', C.wood, x1 - w, y0, 0, x1, y1, h);
  box(nome + '_Alto', C.wood, x0 + w, y0, h - w, x1 - w, y1, h);
};

// ---------- spessori (cm): M = misurato, S = stima ----------
const T_SOPRA = 50;    // S  muro sopra (COT + soggiorno), spesso nel mappale
const T_SOTTO = 50;    // M  muro tra soggiorno e ripostigli
const T_PROP = 50;     // S  prop terzi (destra)
const T_SX = 50;       // S  muro sinistro letto grande / ripostigli
const T_STREET = 50;  // S  muro verso la strada
const T_RIP_LETTO = 11; // M  ripostigli / letto grande
const T_DIV = 11;      // M  COT / soggiorno e COT / WC
const T_TRAM = 11;     // S  tramezzi ripostigli
const T_ALA = 30;      // S  muri dell'ala in alto e muro sinistro WC

// ---------- pavimento (contorno esterno dell'area rossa) ----------
const L = x => (695 + DY) + 0.233 * (x + 25);            // linea interna del tetto obliquo (ala in alto)
const FLOOR_POLY = [[-412, -50], [-19, -50], [-19, -581], [480, -581], [480, L(480) + 30], [-55, L(-55) + 30],
   [-55, 451 + DY], [-412, 451 + DY]];
slab('/Piano/Pavimento', C.floor, FLOOR_POLY, -10, 0);
items[items.length - 1].tex = { url: 'textures/parquet-rovere.png', tile: 120 / 2.54 };   // parquet rovere a listoni (tile di 120 cm); il viewer lo mette sulle facce piane

// ---------- SOGGIORNO 430 x 401, interno x 0..430, y 0..401 ----------
// muro destro (prop terzi) su tutta l'altezza della casa
box('/Sogg/Muro_Destro', C.est, 430, -581, 0, 430 + T_PROP, L(480) + 30, H);

// muro sopra (y 401..451): da sinistra a destra
const yT0 = 401 + DY, yT1 = yT0 + T_SOPRA;
{ // muro sopra il WC con nicchia e finestra uguali a quelle della COT (stima: nicchia 64 x 43 da terra a soffitto, finestra 42 x 165, davanzale granito a 80, centro x -222)
  const nx0 = -254, nx1 = -190, wx0 = -232, wx1 = -190, yN = yT0, FR2 = [150, 120, 60, 255];
  box('/WC/Muro_Sopra_A', C.est, -412, yT0, 0, nx0, yT1, H);
  box('/WC/Muro_Sopra_B', C.est, nx1, yT0, 0, -171, yT1, H);
  // fondo della nicchia del WC: foro passante per la finestra (x wx0..wx1, z 80..245), telaio esterno in bronzo sul filo del muro
  box('/WC/Nicchia_Fondo_A', C.est, nx0, yT1 - 7, 0, wx0, yT1, H);
  box('/WC/Nicchia_Fondo_Sotto', C.est, wx0, yT1 - 7, 0, wx1, yT1, 80);
  box('/WC/Nicchia_Fondo_Sopra', C.est, wx0, yT1 - 7, 245, wx1, yT1, H);
  box('/WC/Finestra_Esterno_Sx', [150, 120, 60, 255], wx0, yT1 - 2, 80, wx0 + 3, yT1, 245);
  box('/WC/Finestra_Esterno_Dx', [150, 120, 60, 255], wx1 - 3, yT1 - 2, 80, wx1, yT1, 245);
  box('/WC/Finestra_Esterno_Basso', [150, 120, 60, 255], wx0 + 3, yT1 - 2, 80, wx1 - 3, yT1, 83);
  box('/WC/Finestra_Esterno_Alto', [150, 120, 60, 255], wx0 + 3, yT1 - 2, 242, wx1 - 3, yT1, 245);
  box('/WC/Davanzale_Granito', [140, 140, 135, 255], nx0, yN, 78, nx1, yN + 27, 80);
  box('/WC/Spalla_Finestra_Sx', C.est, nx0, yN + 25, 80, wx0, yN + 43, H);          // spalla a ovest: la finestra e' appoggiata al lato est della nicchia
  box('/WC/Sopra_Finestra', C.est, wx0, yN + 25, 245, wx1, yN + 43, H);
  box('/WC/Finestra_Telaio_Sx', FR2, wx0, yN + 24, 80, wx0 + 3, yN + 28, 245);
  box('/WC/Finestra_Telaio_Dx', FR2, wx1 - 3, yN + 24, 80, wx1, yN + 28, 245);
  box('/WC/Finestra_Telaio_Basso', FR2, wx0 + 3, yN + 24, 80, wx1 - 3, yN + 28, 83);
  box('/WC/Finestra_Telaio_Alto', FR2, wx0 + 3, yN + 24, 242, wx1 - 3, yN + 28, 245);
  box('/WC/Finestra_Vetro', C.glass, wx0 + 3, yN + 25.5, 83, wx1 - 3, yN + 26.5, 242);
  // scaldasalviette (dalla foto: parte da ~70 cm e sale fino a ~235, dopo la placca di scarico verso sud) e attacchi dei sanitari (stima)
  box('/WC/Scaldasalviette', C.white, -187, 420, 70, -182, 475, 235);
  const CW = [80, 130, 210, 255], HW = [200, 70, 60, 255], DR = [150, 150, 155, 255], MET = [190, 190, 195, 255];
  group('attacchi-wc-grande', () => tube('/WC/Valvola_Scaldasalviette_1', MET, [[-182, 425, 66], [-187, 425, 66]], [1.2, 1.2]));
  group('attacchi-wc-grande', () => tube('/WC/Valvola_Scaldasalviette_2', MET, [[-182, 470, 66], [-187, 470, 66]], [1.2, 1.2]));
  group('attacchi-wc-grande', () => box('/WC/Placca_Scarico', [240, 235, 215, 255], -184, 481, 100, -182, 498, 125));                    // placca di scarico del water sul muro est, ~17 x 25
  group('attacchi-wc-grande', () => tube('/WC/Water_Scarico', DR, [[-222, 488, 0], [-222, 488, 12]], [5.5, 5.5]));                       // scarico del water a pavimento
  group('attacchi-wc-grande', () => tube('/WC/Bidet_Acqua_Fredda', CW, [[-182, 430, 22], [-187, 430, 22]], [1, 1]));
  group('attacchi-wc-grande', () => tube('/WC/Bidet_Acqua_Calda', HW, [[-182, 418, 22], [-187, 418, 22]], [1, 1]));
  group('attacchi-wc-grande', () => tube('/WC/Bidet_Scarico', DR, [[-222, 430, 0], [-222, 430, 10]], [2.5, 2.5]));
  group('attacchi-wc-grande', () => tube('/WC/Lavabo_Acqua_Fredda', CW, [[-182, 324, 52], [-187, 324, 52]], [1, 1]));
  group('attacchi-wc-grande', () => tube('/WC/Lavabo_Acqua_Calda', HW, [[-182, 336, 52], [-187, 336, 52]], [1, 1]));
  group('attacchi-wc-grande', () => tube('/WC/Lavabo_Scarico', DR, [[-182, 330, 45], [-188, 330, 45]], [2, 2]));
}
// fondo della nicchia COT: foro passante per la finestra (x -171..-129, z 80..245), con telaio esterno in bronzo sul filo del muro
box('/COT/Nicchia_Fondo_A', C.wall, -129, yT1 - 7, 0, -107, yT1, H);
box('/COT/Nicchia_Fondo_Sotto', C.wall, -171, yT1 - 7, 0, -129, yT1, 80);
box('/COT/Nicchia_Fondo_Sopra', C.wall, -171, yT1 - 7, 245, -129, yT1, H);
box('/COT/Finestra_Esterno_Sx', [150, 120, 60, 255], -171, yT1 - 2, 80, -168, yT1, 245);
box('/COT/Finestra_Esterno_Dx', [150, 120, 60, 255], -132, yT1 - 2, 80, -129, yT1, 245);
box('/COT/Finestra_Esterno_Basso', [150, 120, 60, 255], -168, yT1 - 2, 80, -132, yT1, 83);
box('/COT/Finestra_Esterno_Alto', [150, 120, 60, 255], -168, yT1 - 2, 242, -132, yT1, 245);
box('/COT/Muro_Sopra_Scaldabagno', C.wall, -107, yT0, 0, 0, yT1, H);     // 96 cm + divisorio
box('/Sogg/Muro_Sopra_A', C.wall, 120, yT0, 0, 288, yT1, H);             // 168 cm pieni
box('/Sogg/Nicchia_Fondo', C.wall, 288, yT1 - 7, 0, 377, yT1, H);        // nicchia 89 cm, fondo
box('/Sogg/Nicchia_Architrave', C.wall, 288, yT0, 200, 377, yT1, H);     // sopra la nicchia (alta 200)
box('/Sogg/Muro_Sopra_B', C.wall, 377, yT0, 0, 430, yT1, H);             // 53 cm pieni
// arco 120 cm: piedritti a 150, semicerchio r=60, vertice a 210. Solo la parte sopra l'arco è muro.
{
  const P = []; for (let i = 0; i <= 12; i++) { const a = Math.PI - Math.PI * i / 12; P.push([60 + 60 * Math.cos(a), 150 + 60 * Math.sin(a)]); }
  const faces = [];
  for (let i = 0; i < 12; i++) {
    const [a, b] = [P[i], P[i + 1]];
    for (const y of [yT0, yT1]) faces.push(quad([a[0], y, a[1]], [b[0], y, b[1]], [b[0], y, H], [a[0], y, H]));
    faces.push(quad([a[0], yT0, a[1]], [b[0], yT0, b[1]], [b[0], yT1, b[1]], [a[0], yT1, a[1]]));
  }
  faces.push(quad([0, yT0, H], [120, yT0, H], [120, yT1, H], [0, yT1, H]));
  items.push({ n: '/Sogg/Arco_Architrave', c: C.wall, faces });
}

// muro sotto (y -50..0): porta 80 cm a x 204..284, altezza 210
const yB0 = -T_SOTTO;
box('/Sogg/Muro_Sotto_A', C.wall, -412, yB0, 0, 204, 0, H);
box('/Sogg/Muro_Sotto_B', C.wall, 284, yB0, 0, 430, 0, H);
box('/Sogg/Muro_Sotto_Architrave', C.wall, 204, yB0, 210, 284, 0, H);
box('/Sogg/Calorifero', C.white, 310, 0, 8, 396, 10, 89);          // dalla foto: tra porta e muro destro (lato prop terzi), ~86 x 81, stima
stipiteX('/Sogg/Porta_Stipite', 204, 284, yB0, 0);

// ---------- COT 160 x 362: interno x -171..-11, y 39..401 ----------
box('/COT/Muro_Div_Resta', C.wall, -T_DIV, 329 + DY, 0, 0, yT0, H);             // 72 cm che restano
box('/Sogg/Calorifero_Div', C.white, 0, yT0 - 59, 8, 10, yT0 - 1, 70);   // dalla foto: sul tratto da 72 cm, lato soggiorno, ~58 x 62, a filo verso il disimpegno/arco (dalla foto), stima
const OP = 190;                                                    // larghezza stimata dell'apertura ad arco (passavivande), dalle foto
box('/COT/Muro_Div_Rimosso_Sx', C.rem, -T_DIV, 39 + DY - T_DIV, 0, 0, 329 + DY - OP, H);   // muro pieno lato corridoio
box('/COT/Muro_Div_Rimosso', C.rem, -T_DIV, 329 + DY - OP, 0, 0, 329 + DY, 105);   // oggi mezza parete / passavivande, h 105 stimata, aperta sopra     // da togliere
{ // arco sopra l'apertura (stima: larghezza OP, imposta 190, freccia 60 -> vertice 250), parte del divisorio da rimuovere
  const ya = 329 + DY - OP, yb = 329 + DY, zs = 190, rise = 60, span = yb - ya, ymid = (ya + yb) / 2;
  const R = span * span / (8 * rise) + rise / 2, zc = zs + rise - R, N = 24;
  const P = []; for (let i = 0; i <= N; i++) { const y = ya + span * i / N; P.push([y, zc + Math.sqrt(R * R - (y - ymid) * (y - ymid))]); }
  const faces = [];
  for (let i = 0; i < N; i++) {
    const [a, b] = [P[i], P[i + 1]];
    for (const x of [-T_DIV, 0]) faces.push(quad([x, a[0], a[1]], [x, b[0], b[1]], [x, b[0], H], [x, a[0], H]));
    faces.push(quad([-T_DIV, a[0], a[1]], [-T_DIV, b[0], b[1]], [0, b[0], b[1]], [0, a[0], a[1]]));
  }
  faces.push(quad([-T_DIV, ya, H], [-T_DIV, yb, H], [0, yb, H], [0, ya, H]));
  items.push({ n: '/COT/Arco_Div_Rimosso', c: C.rem, faces });
}
box('/COT/Muro_Sx', C.wall, -171 - T_DIV, 28 + DY, 0, -171, yT0, H);            // muro verso WC, resta
box('/COT/Muro_Sotto_Resta', C.wall, -171, 28 + DY, 0, -109, 39 + DY, H);            // 62 cm che restano
{ // muro basso della COT da rimuovere, con la porta della COT (vano 80 x 210 vicino al corridoio, stima)
  const y0 = 28 + DY, y1 = 39 + DY;
  box('/COT/Muro_Sotto_Rimosso_A', C.rem, -109, y0, 0, -100, y1, H);
  box('/COT/Muro_Sotto_Rimosso_B', C.rem, -20, y0, 0, -T_DIV, y1, H);
  box('/COT/Muro_Sotto_Rimosso_Architrave', C.rem, -100, y0, 210, -20, y1, H);
  stipiteX('/COT/Porta_Stipite_Rimosso', -100, -20, y0, y1);
}
{ // arco tra corridoio e soggiorno (dalla foto), DA RIMUOVERE nei lavori: apertura 100 cm, piedritti a 190, vertice a 240 (disimpegno a 2,40 m); muro 11 cm a x -11..0
  const yA = 14, yB = 114, ys = 190, r = 50, ym = (yA + yB) / 2;
  box('/Corridoio/Arco_Spalla_A_Rimosso', C.rem, -T_DIV, 0, 0, 0, yA, H);
  box('/Corridoio/Arco_Spalla_B_Rimosso', C.rem, -T_DIV, yB, 0, 0, 28 + DY, H);
  const P = []; for (let i = 0; i <= 12; i++) { const a = Math.PI - Math.PI * i / 12; P.push([ym + r * Math.cos(a), ys + r * Math.sin(a)]); }
  const faces = [];
  for (let i = 0; i < 12; i++) {
    const [a, b] = [P[i], P[i + 1]];
    for (const x of [-T_DIV, 0]) faces.push(quad([x, a[0], a[1]], [x, b[0], b[1]], [x, b[0], H], [x, a[0], H]));
    faces.push(quad([-T_DIV, a[0], a[1]], [-T_DIV, b[0], b[1]], [0, b[0], b[1]], [0, a[0], a[1]]));
  }
  faces.push(quad([-T_DIV, yA, H], [-T_DIV, yB, H], [0, yB, H], [0, yA, H]));
  items.push({ n: '/Corridoio/Arco_Architrave_Rimosso', c: C.rem, faces });
}
box('/Corridoio/Calorifero', C.white, -300, 0, 8, -240, 10, 98);   // dalla foto: sul muro destro, vicino all'ingresso, ~60 x 90, stima
// --- nicchia COT (dalla foto): davanzale in granito a 80, finestra stretta (42 cm) arretrata, contatore e tubi gas sotto ---
const yN = yT0;                                                   // fronte della nicchia; fondo a yN + 43
box('/COT/Davanzale_Granito', [140, 140, 135, 255], -171, yN, 78, -107, yN + 27, 80);
box('/COT/Spalla_Finestra_Dx', C.wall, -129, yN + 25, 80, -107, yN + 43, H);
box('/COT/Sopra_Finestra', C.wall, -171, yN + 25, 245, -129, yN + 43, H);
const FR = [150, 120, 60, 255];                                  // telaio bronzo
box('/COT/Finestra_Telaio_Sx', FR, -171, yN + 24, 80, -168, yN + 28, 245);
box('/COT/Finestra_Telaio_Dx', FR, -132, yN + 24, 80, -129, yN + 28, 245);
box('/COT/Finestra_Telaio_Basso', FR, -168, yN + 24, 80, -132, yN + 28, 83);
box('/COT/Finestra_Telaio_Alto', FR, -168, yN + 24, 242, -132, yN + 28, 245);
box('/COT/Finestra_Vetro', C.glass, -168, yN + 25.5, 83, -132, yN + 26.5, 242);           // 42 x 165 circa, appoggiata al lato ovest della nicchia (dalle foto), stima
box('/COT/Contatore_Gas', [190, 190, 195, 255], -163, yN + 24, 15, -141, yN + 42, 50);   // stima 22 x 18 x 35
group('attacchi-cucina', () => tube('/COT/Tubo_Gas_1', C.gas, [[-127, yN + 36, 5], [-127, yN + 36, 70]], [1.2, 1.2]));
group('attacchi-cucina', () => tube('/COT/Tubo_Gas_2', C.gas, [[-121, yN + 36, 5], [-121, yN + 36, 70]], [1.2, 1.2]));
group('attacchi-cucina', () => tube('/COT/Collettore_Gas', [190, 150, 60, 255], [[-150, yN + 38, 72], [-118, yN + 38, 72]], [1.5, 1.5]));
// griglia di aerazione del gas (dalla foto): sotto la caldaia, a ovest, ~20 x 22, dal basso a ~15 cm da terra; centro x ~ -91 (stima, da foto in prospettiva)
box('/COT/Griglia_Aerazione_Gas', [244, 244, 244, 255], -101, yT0 - 1.2, 15, -81, yT0, 37);
for (let k = 0; k < 7; k++) box('/COT/Griglia_Aerazione_Gas_Lama_' + k, [200, 200, 202, 255], -99.5, yT0 - 1.6, 17 + k * 2.8, -82.5, yT0 - 1.2, 18.6 + k * 2.8);
// --- scaldabagno / caldaia murale (foto + misure tue): 40 x 34 x 74, a 12 cm dal muro destro (divisorio, x = -T_DIV), fondo a 110 (dalla foto: ~107-110), centro a ~147 ---
const bx1 = -T_DIV - 12, bx0 = bx1 - 40, bxc = (bx0 + bx1) / 2;   // x -63..-23, asse -43
box('/COT/Caldaia', [250, 250, 250, 255], bx0, yT0 - 34, 110, bx1, yT0, 184);
tube('/COT/Caldaia_Scarico', [250, 250, 250, 255],
  [[bxc, yT0 - 8, 184], [bxc, yT0 - 8, 207], [bxc - 4, yT0 - 8, 214], [bxc - 11, yT0 - 8, 217], [bxc - 31, yT0 - 8, 217], [bxc - 31, yT0, 217]], [5, 5, 5, 5, 5, 5]);
group('attacchi-cucina', () => tube('/COT/Attacco_Gas', C.gas, [[-171, 356 + DY, 55], [-166, 356 + DY, 55]], [1, 1]));
group('attacchi-cucina', () => tube('/COT/Attacco_Acqua_1', C.water, [[-171, 351 + DY, 55], [-166, 351 + DY, 55]], [1, 1]));
group('attacchi-cucina', () => tube('/COT/Attacco_Acqua_2', C.water, [[-171, 341 + DY, 55], [-166, 341 + DY, 55]], [1, 1]));

// ---------- WC GRANDE (stima): interno x -382..-182, y 39..401 ----------
box('/WC/Vasca_Rimosso', C.rem, -382, yT0 - 170, 0, -312, yT0, 55);   // vasca (da rimuovere, al suo posto una doccia): stima 170 x 70 x 55, lungo il muro ovest, lato corto contro il muro nord
box('/WC/Muro_Sx', C.est, -412, 28 + DY, 0, -382, yT0, H);
{ // WC grande (stime): antibagno 90 cm in basso, tramezzo con porta 70 x 210, porta 80 x 210 verso il corridoio (solo vani, nessuna anta)
  const yb0 = 28 + DY, yb1 = 39 + DY, yp0 = yb1 + 90, yp1 = yp0 + 11, xr = -171 - T_DIV;
  box('/WC/Muro_Sotto_A', C.est, -382, yb0, 0, -370, yb1, H);
  box('/WC/Muro_Sotto_B', C.est, -290, yb0, 0, xr, yb1, H);
  box('/WC/Muro_Sotto_Architrave', C.est, -370, yb0, 210, -290, yb1, H);
  stipiteX('/WC/Sotto_Stipite', -370, -290, yb0, yb1);
  box('/WC/Tramezzo_A', C.est, -382, yp0, 0, -317, yp1, H);
  box('/WC/Tramezzo_B', C.est, -247, yp0, 0, xr, yp1, H);
  box('/WC/Tramezzo_Architrave', C.est, -317, yp0, 210, -247, yp1, H);
  stipiteX('/WC/Tramezzo_Stipite', -317, -247, yp0, yp1);
}
{ // muro sinistro del corridoio con la porta d'ingresso (stima 90 x 210, centrata nel corridoio, anta chiusa)
  const cy = (28 + DY) / 2, d0 = cy - 45, d1 = cy + 45;
  SPAWN = { p: [-382 + 60, cy].map(inch), yaw: 0 };                       // prima persona: appena dentro la porta d'ingresso, sguardo verso est (+x)
  box('/Ingresso/Muro_A', C.est, -412, 0, 0, -382, d0, H);
  box('/Ingresso/Muro_B', C.est, -412, d1, 0, -382, 28 + DY, H);
  box('/Ingresso/Architrave', C.est, -412, d0, 210, -382, d1, H);
  box('/Ingresso/Stipite_A', [90, 65, 45, 255], -412, d0, 0, -382, d0 + 5, 212);
  box('/Ingresso/Stipite_B', [90, 65, 45, 255], -412, d1 - 5, 0, -382, d1, 212);
  box('/Ingresso/Stipite_Alto', [90, 65, 45, 255], -412, d0, 207, -382, d1, 212);
}

// ---------- RIPOSTIGLI: y -120..-50 ----------
box('/Rip/Muro_Sx', C.est, -19, -131, 0, 31, -50, H);                // continua il muro sinistro fino al soggiorno
// tramezzo con vano 60x210 (porta a soffietto, solo falso stipite, nessuna anta) centrato nei 70 cm di profondità
const tramezzo = (nome, x0, x1) => {
  const o0 = -120 + 5, o1 = -50 - 5;                         // vano y -115..-55
  box(nome + '_A', C.est, x0, -120, 0, x1, o0, H);
  box(nome + '_B', C.est, x0, o1, 0, x1, -50, H);
  box(nome + '_Architrave', C.est, x0, o0, 210, x1, o1, H);
  box(nome + '_Stipite_A', C.wood, x0, o0, 0, x1, o0 + 4, 210);   // falso stipite: 4 cm
  box(nome + '_Stipite_B', C.wood, x0, o1 - 4, 0, x1, o1, 210);
  box(nome + '_Stipite_Alto', C.wood, x0, o0, 206, x1, o1, 210);
};
tramezzo('/Rip/Tramezzo_Sx', 191, 191 + T_TRAM);        // RIP sx 31..191 (160)
tramezzo('/Rip/Tramezzo_Dx', 297 - T_TRAM, 297);        // RIP dx 297..430 (133)

// ---------- LETTO GRANDE 399 x 400: interno x 31..430, y -531..-131 ----------
const yR1 = -120, yR0 = yR1 - T_RIP_LETTO;
box('/Letto1/Muro_Sx', C.est, 31 - T_SX, -581, 0, 31, -120, H);
box('/Letto1/Muro_Sopra_A', C.wall, 31, yR0, 0, 200, yR1, H);              // 69 + calorifero
box('/Letto1/Muro_Sopra_B', C.wall, 290, yR0, 0, 430, yR1, H);             // 140 pieni
box('/Letto1/Muro_Sopra_Architrave', C.wall, 200, yR0, 210, 290, yR1, H);  // porta 90, h 210
stipiteX('/Letto1/Porta_Stipite', 200, 290, yR0, yR1);
box('/Letto1/Calorifero', C.white, 100, yR0 - 10, 10, 200, yR0, 70);       // stima 100x10x60
const yW0 = -581, yW1 = -531;
box('/Letto1/Calorifero_Sud', C.white, 315, yW1 - 0, 8, 375, yW1 + 10, 105);   // dalle foto: sul muro sud, a est della porta-finestra, ~60 x 97, stima
box('/Letto1/Muro_Sotto_A', C.est, 31 - T_SX, yW0, 0, 189, yW1, H);        // 158 pieni
box('/Letto1/Muro_Sotto_B', C.est, 309, yW0, 0, 430, yW1, H);
box('/Letto1/Architrave_Finestra', C.est, 189, yW0, 250, 309, yW1, H);   // porta-finestra stimata 120 x 250
{
  const ym = (yW0 + yW1) / 2;                                    // porta-finestra a due ante, a terra (telaio bronzo, 2 vetri)
  box('/Letto1/PF_Telaio_Sx', FR, 189, ym - 3, 0, 192, ym + 3, 250);
  box('/Letto1/PF_Telaio_Dx', FR, 306, ym - 3, 0, 309, ym + 3, 250);
  box('/Letto1/PF_Montante', FR, 247, ym - 3, 0, 251, ym + 3, 250);
  box('/Letto1/PF_Telaio_Alto', FR, 192, ym - 3, 247, 306, ym + 3, 250);
  box('/Letto1/PF_Soglia', FR, 192, ym - 3, 0, 306, ym + 3, 2);
  box('/Letto1/PF_Vetro_Sx', C.glass, 192, ym - 0.5, 2, 247, ym + 0.5, 247);
  box('/Letto1/PF_Vetro_Dx', C.glass, 251, ym - 0.5, 2, 306, ym + 0.5, 247);
}

// TODO (foto camera piccola, non misurate): sul TRAMEZZO ovest (stesso muro della porta, a nord di essa) ci sono il calorifero (~90 x 98) e sopra
// un'apertura con specchio e mensole (~96 x 97, da ~118 a ~215 cm, ~15 prof.). La porta e' a vetri con sopraluce (luce ~90, telaio fino a >= 255).
// La nicchia della scrivania e' sul muro nord (vedi Muro_Obliquo / Nicchia_Scrivania). Resta ignota la lunghezza N-S della camera piccola: la porta puo' essere piu' a nord.
// ---------- ALA IN ALTO (stima): WC piccolo + letto piccolo, tetto obliquo ----------
{ // muro sinistro dell'ala con 3 finestre dritte affiancate sul cortile (stima: 3 x 50 = 150 cm, a terra, alte 240, centrate nell'antibagno; l'inferriata curva non e' modellata)
  const cy = 537 + DY, d0 = cy - 75, d1 = cy + 75, x0 = -55, x1 = -55 + T_ALA, xm = (x0 + x1) / 2, top = L(-55) + 30;
  box('/Ala/Muro_Sx_A', C.est, x0, yT1, 0, x1, d0, H);
  const wy0 = 745, wy1 = wy0 + 45, wz0 = 100, wz1 = 220;                    // finestra del WC piccolo sul cortile: ~45 x 120, davanzale a 100 (dalla foto, stima)
  box('/Ala/Muro_Sx_B1', C.est, x0, d1, 0, x1, wy0, H);
  box('/Ala/Muro_Sx_B2', C.est, x0, wy1, 0, x1, top, H);
  box('/Ala/Muro_Sx_WC_Sotto', C.est, x0, wy0, 0, x1, wy1, wz0);
  box('/Ala/Muro_Sx_WC_Sopra', C.est, x0, wy0, wz1, x1, wy1, H);
  box('/Ala/WC_Finestra_Telaio_A', FR, xm - 3, wy0, wz0, xm + 3, wy0 + 3, wz1);
  box('/Ala/WC_Finestra_Telaio_B', FR, xm - 3, wy1 - 3, wz0, xm + 3, wy1, wz1);
  box('/Ala/WC_Finestra_Telaio_Basso', FR, xm - 3, wy0 + 3, wz0, xm + 3, wy1 - 3, wz0 + 3);
  box('/Ala/WC_Finestra_Telaio_Alto', FR, xm - 3, wy0 + 3, wz1 - 3, xm + 3, wy1 - 3, wz1);
  box('/Ala/WC_Finestra_Vetro', C.glass, xm - 0.5, wy0 + 3, wz0 + 3, xm + 0.5, wy1 - 3, wz1 - 3);
  box('/Ala/Muro_Sx_Architrave', C.est, x0, d0, 240, x1, d1, H);
  for (let k = 0; k <= 3; k++) {                                   // montanti: due esterni e due divisori
    const y = d0 + 50 * k;
    box('/Ala/Finestra_Montante_' + k, FR, xm - 3, Math.max(d0, y - 3), 0, xm + 3, Math.min(d1, y + 3), 240);
  }
  box('/Ala/Finestra_Telaio_Alto', FR, xm - 3, d0, 237, xm + 3, d1, 240);
  box('/Ala/Finestra_Soglia', FR, xm - 3, d0, 0, xm + 3, d1, 2);
  for (let k = 0; k < 3; k++) box('/Ala/Finestra_Vetro_' + k, C.glass, xm - 0.5, d0 + 50 * k + 3, 2, xm + 0.5, d0 + 50 * (k + 1) - 3, 237);
}
{ // muro nord obliquo, con la nicchia della scrivania (stima dalla foto: x 270..380 = ~110 cm, profonda 15, alta 270)
  const obl = (nome, xa, xb, off, z0, z1) => slab(nome, C.est, [[xa, L(xa) + off], [xb, L(xb) + off], [xb, L(xb) + 30], [xa, L(xa) + 30]], z0, z1);
  obl('/Ala/Muro_Obliquo_A', -55, 270, 0, 0, H);
  obl('/Ala/Muro_Obliquo_B', 380, 480, 0, 0, H);
  obl('/Ala/Nicchia_Scrivania_Fondo', 270, 380, 15, 0, 270);
  obl('/Ala/Nicchia_Scrivania_Sopra', 270, 380, 0, 270, H);
}
const XT = 173;   // x della faccia ovest del tramezzo tra antibagno/WC piccolo e camera piccola (era 190). 173 + 15 di spessore = 188: camera larga ~242 fino al muro est (x 430), come nella foto (letto 160 + 2 comodini da 40)
{ // tramezzo antibagno / camera piccola con vano 80 x 210 vicino all'ingresso dall'arco (stima, solo stipite)
  const d0 = 480 + DY, d1 = d0 + 90, topIn = L(XT + 7), top = L(XT + 15) + 3;   // top: i box entrano di qualche cm nel muro obliquo (L..L+30), cosi' non restano fessure ne' z-fight; topIn: filo interno medio
  box('/Ala/Tramezzo_Letto_A', C.est, XT, yT1, 0, XT + 15, d0, H);
  const r0 = 742, r1 = Math.min(r0 + 96, topIn - 6), zr0 = 118, zr1 = 215;                      // apertura con specchio e mensole (ex porta), allineata al WC piccolo: y 742..838 (stima dalla foto)
  box('/Ala/Tramezzo_Letto_B_Basso', C.est, XT, d1, 0, XT + 15, top, zr0);
  box('/Ala/Tramezzo_Letto_B_Alto', C.est, XT, d1, zr1, XT + 15, top, H);
  box('/Ala/Tramezzo_Letto_B_Lato_A', C.est, XT, d1, zr0, XT + 15, r0, zr1);
  box('/Ala/Tramezzo_Letto_B_Lato_B', C.est, XT, r1, zr0, XT + 15, top, zr1);
  box('/Ala/Apertura_Specchio_Fondo', [120, 85, 55, 255], XT, r0, zr0, XT + 8, r1, zr1);   // fondo in legno, nicchia profonda ~7 cm
  { // calorifero a colonne (stesse misure del blocco originale: x XT+15..XT+25, y 735..826, z 8..106): 10 colonne verticali + 2 collettori
    const cx = XT + 20, y0 = 735, w = 91, n = 10, pitch = w / n;
    for (let k = 0; k < n; k++) tube('/Ala/Calorifero_Camera_Colonna_' + k, C.white, [[cx, y0 + pitch * (k + 0.5), 12], [cx, y0 + pitch * (k + 0.5), 102]], [4.3, 4.3], 12);
    box('/Ala/Calorifero_Camera_Collettore_Basso', C.white, cx - 4.5, y0, 8, cx + 4.5, y0 + w, 14);
    box('/Ala/Calorifero_Camera_Collettore_Alto', C.white, cx - 4.5, y0, 100, cx + 4.5, y0 + w, 106);
  }
  box('/Ala/Tramezzo_Letto_Architrave', C.est, XT, d0, 255, XT + 15, d1, H);                     // porta con sopraluce: vano fino a 255
  box('/Ala/Tramezzo_Letto_Sopraluce', C.glass, XT + 6, d0 + 4, 212, XT + 9, d1 - 4, 252);          // sopraluce vetrato
  stipiteY('/Ala/Tramezzo_Letto_Stipite', XT, XT + 15, d0, d1, 210);
}
{ // tramezzo del WC piccolo con vano 70 x 210 spostato a destra/est (dalla foto, stima, solo stipite)
  const y0 = 623 + DY, y1 = 634 + DY;
  box('/Ala/Tramezzo_WC_A', C.est, -25, y0, 0, XT - 78, y1, H);
  box('/Ala/Tramezzo_WC_B', C.est, XT - 8, y0, 0, XT, y1, H);
  box('/Ala/Tramezzo_WC_Architrave', C.est, XT - 78, y0, 210, XT - 8, y1, H);
  stipiteX('/Ala/Tramezzo_WC_Stipite', XT - 78, XT - 8, y0, y1);
  // attacchi del WC piccolo (stima dalle foto 33 e 34): water e bidet verso la finestra (ovest), lavabo sul muro est
  const WCW = [80, 130, 210, 255], WHW = [200, 70, 60, 255], WDR = [150, 150, 155, 255];
  group('attacchi-wc-piccolo', () => box('/Ala/WCp_Placca_Scarico', [240, 235, 215, 255], 43, L(55) - 3, 100, 68, L(55), 125));        // placca di scarico sulla parete di fondo, ~25 x 25
  group('attacchi-wc-piccolo', () => tube('/Ala/WCp_Water_Scarico', WDR, [[55, L(55) - 14, 0], [55, L(55) - 14, 12]], [5.5, 5.5]));
  group('attacchi-wc-piccolo', () => tube('/Ala/WCp_Bidet_Acqua_Fredda', WCW, [[2, L(2), 22], [2, L(2) - 4, 22]], [1, 1]));
  group('attacchi-wc-piccolo', () => tube('/Ala/WCp_Bidet_Acqua_Calda', WHW, [[14, L(14), 22], [14, L(14) - 4, 22]], [1, 1]));
  group('attacchi-wc-piccolo', () => tube('/Ala/WCp_Bidet_Scarico', WDR, [[8, L(8) - 25, 0], [8, L(8) - 25, 10]], [2.5, 2.5]));
  group('attacchi-wc-piccolo', () => tube('/Ala/WCp_Lavabo_Acqua_Fredda', WCW, [[XT, 784, 52], [XT - 5, 784, 52]], [1, 1]));
  group('attacchi-wc-piccolo', () => tube('/Ala/WCp_Lavabo_Acqua_Calda', WHW, [[XT, 796, 52], [XT - 5, 796, 52]], [1, 1]));
  group('attacchi-wc-piccolo', () => tube('/Ala/WCp_Lavabo_Scarico', WDR, [[XT, 790, 45], [XT - 6, 790, 45]], [2, 2]));
}


// ---------- arredi (gruppi) ----------
require('./wc-grande.js')({ box, tube, rbox, slab, tray, group });
require('./wc-piccolo.js')({ box, tube, rbox, slab, tray, group, L, XT });
require('./cucina-v1.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./cucina-v2.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./cucina-v3.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./cucina-v4.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./cucina-v5.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./soggiorno-v1.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./divano-v1.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./divano-v2.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./divano-v3.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./libreria-nicchia.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./tv-est.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./tavolo.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./letto-v1.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./comodini.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./armadio.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./armadio-v2.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./armadio-ante.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./tv-camera.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./parete-testata.js')({ box, group });
require('./mensole-testata.js')({ box, tube, rbox, group });
require('./besta-camera.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./porta-camera.js')({ box, tube, rbox, slab, group, n: yT0 });
require('./billy-soggiorno.js')({ box, tube, group });
require('./ripostigli.js')({ box, tube, rbox, group });
for (const i of items) if (i.n === '/RipStagione/Luce' || i.n === '/RipPulizia/Luce') i.em = 1;   // barre LED luminose in modalita' notte
require('./luci.js')({ box, tube, group, L, items, light });
require('./camera-nord.js')({ box, tube, rbox, slab, group, L });
require('./scarpiera-antibagno.js')({ box, tube, group });
require('./armadio-elvarli.js')({ box, tube, group });
require('./attaccapanni-ingresso.js')({ box, tube, group });
require('./ingresso-decor.js')({ box, tube, group });

// ---------- scena ----------
const scene = {
  units: 'inches',
  camera: { eye: [700, -1500, 1200].map(inch), target: [34, 131 + DY / 2, 0].map(inch), up: [0, 0, 1], fov: 35 },
  items,
};
fs.writeFileSync(OUT, '{"units":"inches","camera":' + JSON.stringify(scene.camera) + ',"spawn":' + JSON.stringify(SPAWN) + ',"ceiling":' + JSON.stringify({ o: FLOOR_POLY.map(p => p.map(inch)), z: [inch(H), inch(H + 3)] }) + ',"lights":' + JSON.stringify(lights) + ',"groups":' + JSON.stringify(GROUPS) + ',"items":[\n' +
  items.map(i => JSON.stringify(i)).join(',\n') + '\n]}\n');
console.log('items:', items.length, '->', OUT);
