// Soggiorno, muro SUD (faccia interna y 0), a ovest della porta (x 204..284): composizione di librerie IKEA BILLY bianche, 160 x 28 x 202 cm = 40 + 80 + 40 (misure standard IKEA:
// larghezze 40 e 80, profondita' 28, altezza 202, 4 ripiani regolabili + fondo e top, schiena sottile, piedini 1 cm). Ogni modulo ha i suoi fianchi (affiancati, come nella realta').
// Moduli laterali (40) con anta a vetro; modulo centrale (80) aperto con libri e oggetti. Posizione x 8..168: 8 cm dall'arco/muro ovest (x 0) e 36 cm liberi fino allo stipite della porta (x 204).
// Libri e oggetti sui ripiani sono decorazioni stimate. Misure in cm.
module.exports = function billySoggiorno({ box, tube, group }) {
  const WHT = [244, 244, 242, 255], BACK = [232, 232, 230, 255], GL = [190, 215, 225, 70];
  const P = '/BillySogg/';
  const D = 28, H = 202, T = 2, F = 1, X0 = 8;
  const cols = [[120, 134, 112], [200, 190, 170], [90, 106, 122], [186, 120, 96], [226, 218, 200], [60, 70, 76], [160, 150, 130]];
  let k = 0;
  const unit = (id, xa, W, glass, fillN) => {
    const xb = xa + W, N = P + id + '_';
    box(N + 'Fianco_O', WHT, xa, 0, F, xa + T, D, H);
    box(N + 'Fianco_E', WHT, xb - T, 0, F, xb, D, H);
    box(N + 'Schiena', BACK, xa + T, 0, F, xb - T, 0.4, H);
    box(N + 'Base', WHT, xa + T, 0.4, F, xb - T, D, F + T);
    box(N + 'Top', WHT, xa, 0, H - T, xb, D, H);
    const gap = (H - T - (F + T)) / 5, floors = [F + T];
    for (let i = 1; i <= 4; i++) { const z = F + T + gap * i - 0.8; box(N + 'Ripiano_' + i, WHT, xa + T, 0.4, z, xb - T, D - 0.5, z + 1.6); floors.push(z + 1.6); }
    floors.forEach((z0, r) => {                                       // libri in piedi, altezze e colori variabili, riempimento diverso per vano
      const n = fillN[r]; if (!n) return;
      let xs = xa + T + 1.2;
      for (let b = 0; b < n && xs < xb - T - 3; b++, k++) {
        const w = 1.6 + ((k * 7) % 5) * 0.5, h = Math.min(20 + ((k * 11) % 6) * 1.8 - (b % 3 === 2 ? 4 : 0), gap - 3), c = cols[k % cols.length];
        box(N + 'Libro_' + r + '_' + b, [c[0], c[1], c[2], 255], xs, 4, z0, xs + w, D - 4, z0 + h);
        xs += w + 0.1;
      }
    });
    if (glass) {                                                      // anta a vetro con telaio bianco sottile, davanti al modulo
      box(N + 'Anta_Vetro', GL, xa + T, D, F + T + 1, xb - T, D + 0.5, H - T - 1);
      box(N + 'Anta_Telaio_Alto', WHT, xa + T, D, H - T - 3, xb - T, D + 0.9, H - T - 1);
      box(N + 'Anta_Telaio_Basso', WHT, xa + T, D, F + T + 1, xb - T, D + 0.9, F + T + 3);
      box(N + 'Anta_Telaio_O', WHT, xa + T, D, F + T + 3, xa + T + 2, D + 0.9, H - T - 3);
      box(N + 'Anta_Telaio_E', WHT, xb - T - 2, D, F + T + 3, xb - T, D + 0.9, H - T - 3);
      tube(N + 'Anta_Maniglia', [200, 202, 206, 255], [[xb - T - 4, D + 1.4, 95], [xb - T - 4, D + 1.4, 109]], [0.5, 0.5], 8);
    }
  };
  group('soggiorno-billy', () => {
    unit('A', X0, 40, true, [7, 5, 6, 4, 6]);
    unit('B', X0 + 40, 80, false, [14, 0, 11, 9, 12]);
    box(P + 'B_Scatola_Alta', [226, 218, 200, 255], X0 + 46, 4, 2 + 40.4 + 1.6, X0 + 74, D - 4, 2 + 40.4 + 1.6 + 14);   // scatole nel vano 2 del modulo centrale (vuoto di libri)
    box(P + 'B_Scatola_Scura', [60, 70, 76, 255], X0 + 78, 4, 2 + 40.4 + 1.6, X0 + 112, D - 4, 2 + 40.4 + 1.6 + 12);
    unit('C', X0 + 120, 40, true, [5, 6, 4, 7, 5]);
  });
};
