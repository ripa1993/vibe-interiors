// Libreria a mensole in cartongesso nella NICCHIA del soggiorno (muro nord, x 288..377, profonda 43 da y = n, alta 200 sotto l'architrave).
// Sei mensole bianche da 2,5 cm (interasse 32) e un montante centrale; sopra, libri (sfumature arcobaleno, qualche costa nei colori della bandiera trans,
// libri LGBTQI+ in generale: i titoli non si disegnano, si vedono solo le coste colorate), una bandierina arcobaleno e piantine (serpente, pothos
// ricadente, succulente, una piantina alta). Misure in cm, stime di progetto. `n` e' la y del muro nord interno del soggiorno.
module.exports = function libreriaNicchia({ box, tube, rbox, slab, group, n }) {
  const X0 = 288, X1 = 377, XM = 332.5, D = 43;                 // nicchia: larghezza 89, profondita' 43, centro del montante
  const PL = [244, 242, 238, 255];                              // cartongesso bianco
  const GR = [84, 128, 82, 255], GR2 = [60, 110, 70, 255], POT = [200, 190, 175, 255], TC = [190, 100, 70, 255];
  const RAIN = [[208, 56, 56, 255], [232, 138, 48, 255], [236, 200, 70, 255], [80, 160, 90, 255], [60, 110, 190, 255], [130, 80, 170, 255]];
  const TRANS = [[110, 190, 230, 255], [240, 150, 190, 255], [245, 245, 245, 255], [240, 150, 190, 255], [110, 190, 230, 255]];
  const NEUT = [[40, 42, 46, 255], [150, 120, 90, 255], [210, 200, 180, 255], [90, 96, 110, 255]];
  const P = '/LibreriaNicchia/';
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let nb = 0;

  group('soggiorno-libreria', () => {
    // ---------- struttura: mensole e montante ----------
    const SZ = [10, 42, 74, 106, 138, 170];
    SZ.forEach((z, i) => box(P + 'Mensola_' + i, PL, X0, n, z, X1, n + D - 1, z + 2.5));
    box(P + 'Montante_Centrale', PL, XM - 1.25, n, 10, XM + 1.25, n + D - 1, 172.5);

    // libri in piedi, a filo davanti (a 4 cm dal bordo), da xa a xb sulla mensola z (cima della mensola = z + 2.5)
    const books = (xa, xb, z, pal, hmin = 20, hmax = 28, dmin = 17, dmax = 22) => {
      let x = xa;
      while (x < xb - 2.2) {
        const w = Math.min(2.2 + rnd() * 2.6, xb - x), h = hmin + rnd() * (hmax - hmin), d = dmin + rnd() * (dmax - dmin);
        const c = pal[Math.floor(rnd() * pal.length)];
        box(P + 'Libro_' + nb++, c, x, n + 4, z + 2.5, x + w, n + 4 + d, z + 2.5 + h);
        x += w + 0.15;
      }
      return x;
    };
    const stack = (x, y, z, list) => {                                  // libri orizzontali impilati: [colore, spessore, larghezza]
      let zz = z + 2.5;
      for (const [c, t, w] of list) { box(P + 'Libro_Piatto_' + nb++, c, x, y, zz, x + w, y + 17, zz + t); zz += t; }
      return zz;
    };
    const plant = (x, y, z, h, c) => {                                  // vaso + fogliame a cono
      tube(P + 'Vaso_' + nb++, POT, [[x, y, z + 2.5], [x, y, z + 2.5 + 7]], [3.6, 4.6], 14);
      tube(P + 'Pianta_' + nb++, c, [[x, y, z + 9.5], [x, y, z + 9.5 + h * 0.55], [x, y, z + 9.5 + h]], [1.2, 4.5, 1.5], 12);
    };

    // ---------- mensola 0 (z 10): libri piatti a sinistra, cesto a destra ----------
    stack(290, n + 6, SZ[0], [[RAIN[4], 3, 24], [RAIN[0], 2.6, 22], [TRANS[1], 2.4, 21], [NEUT[2], 2.2, 20]]);
    rbox(P + 'Cesto', [196, 170, 120, 255], [337, n + 6, 12.5, 371, n + 36, 30], 5, 2, 2);
    // ---------- mensola 1 (z 42): libri arcobaleno a sinistra, serpente + libri trans a destra ----------
    books(289.5, 331, SZ[1], RAIN);
    plant(371, n + 18, SZ[1], 24, GR2);
    books(335, 365, SZ[1], TRANS, 21, 27);
    // ---------- mensola 2 (z 74): pothos ricadente a sinistra, libri trans/neutri a destra ----------
    tube(P + 'Vaso_Pothos', TC, [[296, n + 18, 76.5], [296, n + 18, 84]], [4, 5], 14);
    tube(P + 'Pothos_Foglie', GR, [[296, n + 18, 84], [296, n + 18, 92], [296, n + 18, 98]], [1.5, 4.5, 1.8], 12);
    tube(P + 'Pothos_Tralcio_0', GR, [[299, n + 22, 82], [304, n + 25, 80], [308, n + 27, 72], [309, n + 28, 60]], [0.7, 0.7, 0.6, 0.5], 6);
    tube(P + 'Pothos_Tralcio_1', GR2, [[293, n + 22, 82], [290, n + 26, 79], [290, n + 30, 70], [291, n + 31, 58]], [0.7, 0.7, 0.6, 0.5], 6);
    books(312, 331, SZ[2], NEUT.concat(RAIN));
    books(335, 368, SZ[2], TRANS.concat(NEUT), 21, 28);
    // ---------- mensola 3 (z 106): libri a sinistra, 3 succulente a destra ----------
    books(289.5, 322, SZ[3], RAIN.concat(NEUT), 22, 29);
    for (const [k, x] of [[0, 340], [1, 352], [2, 365]]) {
      tube(P + 'Succulenta_Vaso_' + k, k === 1 ? [226, 218, 200, 255] : TC, [[x, n + 12, 108.5], [x, n + 12, 113]], [3.2, 3.8], 12);
      rbox(P + 'Succulenta_' + k, k === 2 ? [110, 150, 120, 255] : GR, [x - 3.2, n + 8.8, 113, x + 3.2, n + 15.2, 119 + k * 1.5], 3, 3, 1);
    }
    // ---------- mensola 4 (z 138): bandierina arcobaleno + libri a sinistra, libri e piantina a destra ----------
    {
      const fx = 292, fy = n + 8, fz = 140.5;                           // asta + 6 strisce da 2 cm
      tube(P + 'Bandierina_Asta', [60, 60, 64, 255], [[fx, fy, fz], [fx, fy, fz + 24]], [0.3, 0.3], 8);
      RAIN.forEach((c, k) => box(P + 'Bandierina_Striscia_' + k, c, fx + 0.3, fy - 0.2, fz + 22 - (k + 1) * 2, fx + 18, fy + 0.2, fz + 22 - k * 2));
    }
    books(313, 331, SZ[4], RAIN, 22, 28);
    books(335, 358, SZ[4], TRANS.concat(RAIN), 21, 27);
    plant(368, n + 18, SZ[4], 14, GR);
    // ---------- mensola 5 (z 170, sotto l'architrave a 200): piantina alta + libri piatti ----------
    tube(P + 'Vaso_Alto', POT, [[300, n + 20, 172.5], [300, n + 20, 181]], [4.5, 5.5], 14);
    tube(P + 'Pianta_Alta', GR2, [[300, n + 20, 181], [300, n + 20, 189], [300, n + 20, 197]], [1.4, 7, 2], 14);
    stack(340, n + 8, SZ[5], [[TRANS[1], 2.6, 25], [RAIN[4], 2.4, 24], [RAIN[2], 2.2, 23]]);
    plant(372, n + 18, SZ[5], 14, GR);
  });
};
