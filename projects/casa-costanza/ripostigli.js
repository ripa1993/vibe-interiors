// Due ripostigli (y -120..-50, profondi 70, alti 330), porta nel tramezzo (vano 52 libero, y -111..-59, nessuna anta); la parete y -120 e' quella SUD (confina con la camera padronale), y -50 quella NORD (soggiorno).
//  - 'ripostiglio-stagione' (ovest, x 31..191, 160 cm): fondo (x 31..86) con asta appendiabiti profonda 55 a 175 cm, sacche copriabito, scatole trasparenti sotto, ripiano alto con valigie;
//    lungo il muro sud una scaffalatura a montanti da 80 x 30 (x 90..170) alta 240 con scatole trasparenti etichettate, valigie e sacchi sottovuoto in alto; atrio libero x 170..191 davanti alla porta.
//  - 'ripostiglio-pulizia' (est, x 297..430, 133 cm): sulla parete est un'asta a ganci (z 158) con scopa, mocio, spazzolone, paletta e aspirapolvere a stelo, una presa a 20 cm da terra;
//    lungo il muro sud scaffali da 62 x 28 (x 350..412) con cestelli, spugne, flaconi e detersivi in alto; sul muro nord stendino pieghevole e asse da stiro appesi; a terra, nell'angolo sud vicino alla porta (fuori dal passaggio), secchio e aspirapolvere
//    cilindrico: corridoio libero ~40 cm tra scaffali e muro nord. Una barra LED a soffitto per ripostiglio.
// Tutto stimato, nessuna misura dell'utente. Misure in cm.
module.exports = function ripostigli({ box, tube, rbox, group }) {
  const WHT = [244, 244, 242, 255], CHR = [200, 202, 206, 255], GL = [200, 220, 230, 110], LED = [250, 250, 245, 255];
  const YS = -120, YN = -50;
  const pal = [[120, 134, 112], [200, 190, 170], [90, 106, 122], [186, 120, 96], [226, 218, 200], [60, 70, 76]];
  const col = k => [...pal[k % pal.length], 255];

  group('ripostiglio-stagione', () => {
    const P = '/RipStagione/';
    tube(P + 'Asta', CHR, [[58, YS + 1, 175], [58, YN - 1, 175]], [1.1, 1.1], 12);
    box(P + 'Ripiano_Alto', WHT, 31, YS, 196, 86, YN, 198);
    for (let k = 0; k < 9; k++) {                                       // sacche copriabito e cappotti sull'asta
      const y = YS + 4 + k * 7.6;
      box(P + 'Capo_' + k, k % 3 === 0 ? [236, 234, 228, 255] : col(k + 2), 34, y, 62, 84, y + 5, 172);
      box(P + 'Gancio_' + k, CHR, 57, y + 1.5, 172, 59, y + 3.5, 178);
    }
    rbox(P + 'Valigia_1', [88, 100, 116, 255], [36, YS + 4, 198, 84, YS + 40, 226], 2, 2);
    rbox(P + 'Valigia_2', [186, 120, 96, 255], [40, YS + 44, 198, 80, YN - 4, 218], 2, 2);
    box(P + 'Scatola_Bassa_1', GL, 36, YS + 2, 2, 84, YS + 34, 34); box(P + 'Scatola_Bassa_1_Coperchio', WHT, 35, YS + 1, 34, 85, YS + 35, 36);
    box(P + 'Scatola_Bassa_2', GL, 36, YS + 36, 2, 84, YS + 68, 34); box(P + 'Scatola_Bassa_2_Coperchio', WHT, 35, YS + 35, 34, 85, YS + 69, 36);
    // scaffalatura a montanti lungo il muro sud: x 90..170, profondita' 35
    const x0 = 90, x1 = 170, y1 = YS + 30, H = 240, lv = [3, 52, 100, 148, 196, 238];
    for (const [i, x] of [[0, x0], [1, x1 - 2]]) for (const [j, y] of [[0, YS], [1, y1 - 2]]) box(P + `Montante_${i}${j}`, WHT, x, y, 0, x + 2, y + 2, H);
    lv.forEach((z, i) => box(P + 'Ripiano_' + i, WHT, x0, YS, z, x1, y1, z + 1.8));
    let k = 0;
    for (let i = 0; i < 4; i++) {                                       // 4 file di scatole trasparenti con etichetta colorata e coperchio
      const z0 = lv[i] + 1.8, h = lv[i + 1] - z0 - 6 - (i % 2) * 4;
      [[x0 + 2.5, x0 + 40], [x0 + 41, x1 - 2.5]].forEach(([xa, xb], j) => {
        box(P + `Bin_${i}_${j}`, GL, xa, YS + 2, z0, xb, y1 - 2.5, z0 + h);
        box(P + `Bin_${i}_${j}_Coperchio`, WHT, xa - 0.5, YS + 1.5, z0 + h, xb + 0.5, y1 - 2, z0 + h + 1.6);
        box(P + `Bin_${i}_${j}_Etichetta`, col(k++), xa + 8, y1 - 2.6, z0 + h * 0.4, xb - 8, y1 - 2.4, z0 + h * 0.4 + 6);
      });
    }
    rbox(P + 'Valigia_3', [70, 78, 90, 255], [x0 + 3, YS + 3, lv[4] + 1.8, x0 + 40, y1 - 4, lv[4] + 36], 2, 2);
    rbox(P + 'Valigia_4', [200, 190, 170, 255], [x0 + 43, YS + 3, lv[4] + 1.8, x1 - 3, y1 - 4, lv[4] + 30], 2, 2);
    for (let b = 0; b < 3; b++) rbox(P + 'Sacco_Sottovuoto_' + b, [226, 226, 232, 200], [x0 + 3 + b * 25, YS + 3, lv[5] + 1.8, x0 + 26 + b * 25, y1 - 4, lv[5] + 14], 1.5, 1.5);
    box(P + 'Luce', LED, 100, -87, 326, 160, -83, 329);
  });

  group('ripostiglio-pulizia', () => {
    const P = '/RipPulizia/';
    const XE = 430;
    tube(P + 'Asta_Ganci', CHR, [[XE - 1.5, YS + 2, 158], [XE - 1.5, YN - 2, 158]], [0.6, 0.6], 10);
    const hang = (nm, y, c, z0, z1, r = 1.1) => tube(P + nm + '_Manico', c, [[XE - 4.5, y, z0], [XE - 4.5, y, z1]], [r, r], 10);
    hang('Scopa', -112, [150, 120, 80, 255], 38, 157); box(P + 'Scopa_Testa', [60, 64, 70, 255], XE - 17, -112 - 1.5, 28, XE - 1, -112 + 1.5, 40);
    hang('Mocio', -100, [150, 120, 80, 255], 38, 157); tube(P + 'Mocio_Testa', [190, 200, 210, 255], [[XE - 4.5, -100, 16], [XE - 4.5, -100, 38]], [5.5, 5.5], 14);
    hang('Spazzolone', -88, [60, 100, 150, 255], 36, 157); box(P + 'Spazzolone_Testa', [200, 70, 60, 255], XE - 15, -88 - 2, 28, XE - 1, -88 + 2, 36);
    box(P + 'Paletta', [60, 100, 150, 255], XE - 5, -76 - 7, 112, XE - 1, -76 + 7, 150); box(P + 'Paletta_Bordo', [40, 70, 110, 255], XE - 7, -76 - 7, 112, XE - 5, -76 + 7, 118);
    tube(P + 'Stelo_Corpo', [90, 96, 104, 255], [[XE - 4.5, -62, 60], [XE - 4.5, -62, 150]], [2.2, 2.2], 12);
    box(P + 'Stelo_Batteria', [40, 44, 50, 255], XE - 8, -62 - 3.5, 118, XE - 1.5, -62 + 3.5, 138);
    box(P + 'Stelo_Bocchetta', [60, 66, 74, 255], XE - 18, -62 - 6, 52, XE - 3, -62 + 6, 58);
    box(P + 'Presa', WHT, XE - 2, -70, 20, XE, -62, 28);
    // scaffali lungo il muro sud: x 322..412, profondita' 30
    const x0 = 350, x1 = 412, y1 = YS + 28, H = 214, lv = [8, 60, 110, 160, 210];
    for (const [i, x] of [[0, x0], [1, x1 - 2]]) for (const [j, y] of [[0, YS], [1, y1 - 2]]) box(P + `Montante_${i}${j}`, WHT, x, y, 0, x + 2, y + 2, H);
    lv.forEach((z, i) => box(P + 'Ripiano_' + i, WHT, x0, YS, z, x1, y1, z + 1.8));
    [[x0 + 3, x0 + 30], [x0 + 32, x1 - 3]].forEach(([xa, xb], j) => rbox(P + 'Cestello_' + j, [200, 184, 150, 255], [xa, YS + 2, lv[0] + 1.8, xb, y1 - 2, lv[0] + 22], 2, 1.5));
    [[x0 + 4, [240, 210, 90, 255]], [x0 + 22, [90, 170, 200, 255]], [x0 + 40, [240, 240, 236, 255]]].forEach(([x, c], j) =>
      box(P + 'Panni_' + j, c, x, YS + 4, lv[1] + 1.8, x + 15, y1 - 4, lv[1] + 12 + (j % 2) * 4));
    let k = 0;
    for (const i of [2, 3]) for (let b = 0; b < 5; b++, k++) {         // flaconi e spray
      const x = x0 + 8 + b * 11, z = lv[i] + 1.8, c = col(k + i), h = 18 + (k % 3) * 3;
      tube(P + `Flacone_${i}_${b}`, c, [[x, YS + 14, z], [x, YS + 14, z + h]], [3.2, 3.2], 12);
      box(P + `Flacone_${i}_${b}_Tappo`, [240, 240, 236, 255], x - 1.5, YS + 12.5, z + h, x + 1.5, YS + 15.5, z + h + 2.5);
    }
    for (let b = 0; b < 3; b++) rbox(P + 'Tanica_' + b, [236, 236, 232, 255], [x0 + 4 + b * 19, YS + 3, lv[4] + 1.8, x0 + 21 + b * 19, y1 - 4, lv[4] + 24], 2, 2);
    // muro nord: stendino pieghevole e asse da stiro appesi
    box(P + 'Stendino', [205, 208, 212, 255], 336, YN - 4, 40, 372, YN, 175);
    box(P + 'Asse_Da_Stiro', [170, 180, 200, 255], 380, YN - 4, 45, 410, YN, 172);
    tube(P + 'Secchio', [120, 160, 200, 255], [[310, -106, 0], [310, -106, 28]], [9, 11], 16);
    rbox(P + 'Aspirapolvere', [90, 96, 104, 255], [324, -118, 0, 346, -96, 22], 5, 4);
    box(P + 'Luce', LED, 340, -87, 326, 400, -83, 329);
  });
};
