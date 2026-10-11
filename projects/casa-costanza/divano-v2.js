// Divano v2 · IKEA BARSLOEV, divano letto a 3 posti con chaise longue (Tibbleby beige/grigio), posto DI FRONTE ALLA TV.
// Dalla scheda tecnica (disegno quotato): ingombro 236 x 153, altezza 90, profondita' del corpo 84, braccioli alti 63 e spessi 18, seduta a 46,
// chaise larga 70 (lunga 153 dal dorso, seduta 122), schienale a cuscini separati. Il meccanismo letto (cassettone estraibile) non e' modellato,
// solo le due cinghie sul fronte. Forme, spessori dei cuscini e piedini sono stime dal disegno.
// Posizione: spostato di 71 cm a est rispetto all'asse della TV (x 204), centro x 275 (x 157..393), schiena a sud (y 243), rivolto a nord verso la TV; chaise sul lato est (a destra di chi si siede).
// Misure in cm, stime di progetto. Non include tappeto ne' lampada.
module.exports = function divanoV2({ box, tube, rbox, slab, group, n }) {
  const FAB = [198, 190, 174, 255];      // Tibbleby beige
  const FABD = [168, 164, 154, 255];     // grigio-beige: braccioli e dorsale
  const CUSH = [188, 184, 176, 255];     // cuscini di schiena, un filo piu' scuri
  const LEG = [58, 50, 44, 255];
  const STRAP = [90, 90, 94, 255];
  const P = '/DivanoV2/';
  const CX = 275, W = 236, XW = CX - W / 2, XE = CX + W / 2;       // x 157..393
  const YB = 243, DM = 84, YF = YB + DM, YC = YB + 153;            // schiena, fronte del corpo, fine del chaise
  const AT = 18, XA = XW + AT, XC0 = XE - AT - 70;                 // fine braccio ovest; inizio chaise (70 di larghezza), x 234..304
  const XC1 = XE - AT;                                             // fine chaise, poi il bracciolo est

  group('divano-v2', () => {
    // piedini (8 cm)
    for (const [x, y] of [[XW + 6, YB + 6], [XW + 6, YF - 6], [XC0 - 4, YB + 6], [XC0 - 4, YF - 6], [XE - 6, YB + 6], [XC1 - 6, YC - 6], [XC0 + 4, YC - 6]])
      box(P + 'Piede_' + x + '_' + y, LEG, x - 3, y - 3, 0, x + 3, y + 3, 8);

    // ---------- corpo: base (cassa del letto) fino a 30, dorsale, braccioli ----------
    rbox(P + 'Base_Corpo', FAB, [XA, YB, 8, XC0, YF, 30], 3, 2);                          // sotto le due sedute principali
    rbox(P + 'Base_Chaise', FAB, [XC0, YB, 8, XC1, YC, 30], 3, 2);                         // chaise: dal dorso fino al fondo, 153
    rbox(P + 'Dorsale', FABD, [XA, YB, 8, XC1, YB + 14, 62], 4, 4);                         // schiena posteriore
    rbox(P + 'Bracciolo_Ovest', FABD, [XW, YB, 8, XA, YF, 63], 5, 5);                       // 18 x 84 x 63
    rbox(P + 'Bracciolo_Est', FABD, [XC1, YB, 8, XE, YB + 122, 63], 5, 5);                  // bracciolo basso lungo il chaise
    // due cinghie del cassetto letto, sul fronte del corpo
    for (let k = 0; k < 2; k++) {
      const x = XA + ((XC0 - XA) / 2) * (k + 0.5);                                         // al centro di ciascuna seduta
      tube(P + 'Cinghia_' + k, STRAP, [[x, YF + 0.5, 20], [x, YF + 0.5, 12]], [1.3, 1.3], 8);
    }

    // ---------- sedute (cuscini fino a 46): due sul corpo + una lunga sul chaise ----------
    const seatW = (XC0 - XA) / 2;
    for (let k = 0; k < 2; k++)
      rbox(P + 'Seduta_' + k, FAB, [XA + k * seatW + 0.4, YB + 14, 30, XA + (k + 1) * seatW - 0.4, YF, 46], 5, 5);
    rbox(P + 'Seduta_Chaise', FAB, [XC0 + 0.4, YB + 14, 30, XC1, YC, 46], 5, 5);

    // ---------- cuscini di schiena (3, alti fino a 90, appena inclinati): 2 sul corpo + 1 sul chaise ----------
    const bw = (XC1 - XA) / 3;
    for (let k = 0; k < 3; k++) {
      rbox(P + 'Schiena_Bassa_' + k, CUSH, [XA + k * bw + 0.5, YB + 14, 46, XA + (k + 1) * bw - 0.5, YB + 30, 70], 6, 5, 2);
      rbox(P + 'Schiena_Alta_' + k, CUSH, [XA + k * bw + 0.5, YB + 14, 66, XA + (k + 1) * bw - 0.5, YB + 27, 90], 6, 6);
    }
    // cuscino bracciolo sul chaise (il "poggiatesta" a lato, come nel disegno)
    rbox(P + 'Cuscino_Bracciolo', CUSH, [XC1 - 15, YB + 30, 63, XC1, YB + 90, 78], 5, 5, 2);
  });
};
