// Helper decorativi condivisi dai moduli arredo (piante, vasi, stampe). Uso: const { pot, plant, frame, GRN2, TERRA } = require('./decor.js')({ box, tube, P });
module.exports = function decor({ box, tube, P }) {
  const DK = [40, 44, 50, 255];
  const GRN = [74, 122, 84, 255], GRN2 = [96, 142, 98, 255], TERRA = [190, 112, 84, 255], SAGE = [170, 188, 168, 255];
  const pot = (nm, x, y, z0, h, r0, r1, c) => {                // vaso conico con bordo
    tube(P + nm, c, [[x, y, z0], [x, y, z0 + h]], [r0, r1], 20);
    tube(P + nm + '_Bordo', c, [[x, y, z0 + h - 0.5], [x, y, z0 + h + 1.2]], [r1 + 0.7, r1 + 0.7], 20);
  };
  const plant = (nm, x, y, z0, n, len, reach, c) => {          // foglie = tubi affusolati che si aprono a raggiera
    for (let k = 0; k < n; k++) {
      const a = 2 * Math.PI * k / n + 0.5 * (k % 2), l = len * (0.7 + 0.3 * ((k * 5) % 3) / 2);
      const ca = Math.cos(a), sa = Math.sin(a);
      tube(P + nm + '_Foglia_' + k, k % 2 ? c : GRN, [[x + ca, y + sa, z0], [x + ca * reach * 0.5 * l / len, y + sa * reach * 0.5 * l / len, z0 + l * 0.6], [x + ca * reach * l / len, y + sa * reach * l / len, z0 + l]], [0.3, 2.6, 0.2], 6);
    }
  };
  // stampe: cornice + passepartout + fondo + cerchio e linea (yw = faccia del muro, s = verso in cui sporgono: +1 muro nord, -1 tramezzo)
  const frame = (nm, x0, z0, w, h, yw, s, fcol, bg, sun, line) => {
    const d = a => yw - s * a, t = 1.5;
    const bx = (n, c, xa, za, xb, zb, a0, a1) => box(P + nm + n, c, xa, Math.min(d(a0), d(a1)), za, xb, Math.max(d(a0), d(a1)), zb);
    bx('_Basso', fcol, x0, z0, x0 + w, z0 + t, 0, 2); bx('_Alto', fcol, x0, z0 + h - t, x0 + w, z0 + h, 0, 2);
    bx('_Sx', fcol, x0, z0 + t, x0 + t, z0 + h - t, 0, 2); bx('_Dx', fcol, x0 + w - t, z0 + t, x0 + w, z0 + h - t, 0, 2);
    bx('_Passepartout', [248, 246, 240, 255], x0 + t, z0 + t, x0 + w - t, z0 + h - t, 0.5, 1);
    bx('_Fondo', bg, x0 + 4, z0 + 4, x0 + w - 4, z0 + h - 4, 1, 1.2);
    bx('_Linea', line, x0 + 4, z0 + h * 0.34, x0 + w - 4, z0 + h * 0.34 + 2.5, 1.2, 1.4);
    const r = Math.min(w, h) * 0.17;
    tube(P + nm + '_Sole', sun, [[x0 + w / 2, d(1.2), z0 + h * 0.6], [x0 + w / 2, d(1.5), z0 + h * 0.6]], [r, r], 20);
  };
  return { pot, plant, frame, GRN, GRN2, TERRA, SAGE };
};
