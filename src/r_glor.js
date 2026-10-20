/* ===== Die beiden Glorreichen: Karminstern (Bereich 3) und Seelenmeer (Bereich 4), komplett eigene Gestalten ===== */
function ghost5(c, x, y, r, t, ph) { // winzige Seele
  const w = Math.sin(t * 4 + ph) * r * .15;
  glow4(c, x, y, r * 2.6, "#ffffff", .5);
  c.beginPath(); c.moveTo(x - r, y + r * .9); c.quadraticCurveTo(x - r * 1.1, y - r * 1.2, x, y - r * 1.2); c.quadraticCurveTo(x + r * 1.1, y - r * 1.2, x + r, y + r * .9);
  c.quadraticCurveTo(x + r * .5 + w, y + r * .5, x, y + r * 1.0); c.quadraticCurveTo(x - r * .5 - w, y + r * .5, x - r, y + r * .9); c.closePath();
  c.fillStyle = "rgba(255,255,255,.93)"; c.fill(); c.lineWidth = Math.max(1, r * .22); c.strokeStyle = INK; c.stroke();
  c.fillStyle = INK; c.beginPath(); c.arc(x - r * .36, y - r * .2, r * .17, 0, 7); c.arc(x + r * .36, y - r * .2, r * .17, 0, 7); c.fill();
}
Object.assign(FORMS, {
  karminstern(c, s, sp, t, bc, bl) { // Sturmkönigin: gekrönter Karmin-Stern, Blitze kreisen um sie, ein Kometenschweif weht hinter ihr
    const cy = .1 * s, pulse = 1 + Math.sin(t * 3.2) * .025;
    glow4(c, 0, cy, s * 1.3, "#ff3040", .55);
    const orb = front => { for (let i = 0; i < 8; i++) { const a = t * .85 + i * Math.PI / 4, sn = Math.sin(a); if ((sn >= 0) !== front) continue; const x = Math.cos(a) * .84 * s, y = cy + sn * .26 * s, r = s * (.075 + .02 * sn); glow4(c, x, y, r * 2.6, "#ffb0b8", .6); star4(c, x, y, r, 5, .45); FS(c, "#ffd0d4"); } };
    orb(false);
    const k8 = Math.floor(t * 9);
    for (let k = 0; k < 4; k++) { const a0 = k * 1.571 + .8 + Math.sin(t * .6 + k) * .25; if (((k8 + k * 3) % 5) === 0) continue; c.beginPath(); let x = Math.cos(a0) * s * .6, y = cy + Math.sin(a0) * s * .6; c.moveTo(x, y); for (let j = 1; j <= 5; j++) { const rr = s * (.6 + .12 * j), off = (((k8 * 7 + k * 13 + j * 5) % 9) - 4) * s * .022; c.lineTo(Math.cos(a0) * rr - Math.sin(a0) * off, cy + Math.sin(a0) * rr + Math.cos(a0) * off); } c.strokeStyle = INK; c.lineWidth = s * .075; c.stroke(); c.strokeStyle = "#fff6a0"; c.lineWidth = s * .033; c.stroke(); }
    wave4(c, -.18 * s, .5 * s, .85 * s, .13 * s, t, 0, "#d01c38", s * .09, 0, 1); wave4(c, .18 * s, .5 * s, .8 * s, .13 * s, t, 1.6, "#ff5a6a", s * .075, 0, 1); wave4(c, 0, .52 * s, .95 * s, .1 * s, t, 3.1, "#ffd0d6", s * .05, 0, 1);
    c.save(); c.translate(0, cy); c.scale(pulse, pulse); c.rotate(Math.sin(t * 1.3) * .05);
    const g = c.createRadialGradient(0, -.12 * s, .05 * s, 0, 0, .72 * s); g.addColorStop(0, "#ff9ea4"); g.addColorStop(.6, "#e0303c"); g.addColorStop(1, "#9a1028");
    star4(c, 0, 0, .7 * s, 5, .62); c.fillStyle = g; c.fill(); c.stroke();
    c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = s * .03; c.beginPath(); c.arc(0, 0, .5 * s, Math.PI * 1.15, Math.PI * 1.45); c.stroke(); c.strokeStyle = INK;
    c.beginPath(); c.ellipse(0, .02 * s, .31 * s, .28 * s, 0, 0, 7); FS(c, "#ffe6e8");
    cEye(c, -.12 * s, -.02 * s, s * .08, bl, s); cEye(c, .12 * s, -.02 * s, s * .08, bl, s);
    c.lineWidth = s * .04; c.beginPath(); c.moveTo(-.2 * s, -.14 * s); c.lineTo(-.06 * s, -.1 * s); c.moveTo(.2 * s, -.14 * s); c.lineTo(.06 * s, -.1 * s); c.stroke();
    mouth4(c, 0, .13 * s, s, true); cBlush(c, -.22 * s, .09 * s, s, .5); cBlush(c, .22 * s, .09 * s, s, .5);
    c.restore();
    c.beginPath(); c.moveTo(-.22 * s, -.38 * s); c.lineTo(-.24 * s, -.62 * s); c.lineTo(-.11 * s, -.5 * s); c.lineTo(0, -.78 * s); c.lineTo(.11 * s, -.5 * s); c.lineTo(.24 * s, -.62 * s); c.lineTo(.22 * s, -.38 * s); c.closePath(); FS(c, "#ffd84a");
    glow4(c, 0, -.52 * s, s * .2, "#ff4060", .8); c.beginPath(); c.moveTo(0, -.62 * s); c.lineTo(.06 * s, -.52 * s); c.lineTo(0, -.42 * s); c.lineTo(-.06 * s, -.52 * s); c.closePath(); FS(c, "#ff3050");
    orb(true);
    for (let i = 0; i < 6; i++) { const ph = (t * .5 + i / 6) % 1, x = Math.sin(i * 2.3) * .6 * s, y = .5 * s - ph * 1.3 * s; c.save(); c.globalAlpha = Math.sin(ph * Math.PI); c.fillStyle = "#fff0a0"; c.beginPath(); c.arc(x, y, s * .018, 0, 7); c.fill(); c.restore(); }
  },
  seelenmeer(c, s, sp, t, bc, bl) { // Seelenmeer: eine aufragende Welle, in der ein ganzes Meer von Seelen treibt; Perlenkrone, Strudel darunter
    glow4(c, 0, 0, s * 1.35, "#ff4a6a", .5);
    for (let k = 0; k < 3; k++) { const rx = s * (.62 - k * .13 + Math.sin(t * 2 + k) * .02), ry = s * (.15 - k * .03), a0 = t * (1.4 + k * .5) * (k % 2 ? -1 : 1); c.strokeStyle = INK; c.lineWidth = s * .07; c.beginPath(); c.ellipse(0, .6 * s, rx, ry, 0, a0, a0 + 4.4); c.stroke(); c.strokeStyle = k === 1 ? "#ff9aa8" : "#ffe0e6"; c.lineWidth = s * .035; c.stroke(); }
    c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    const g = c.createLinearGradient(0, -.6 * s, 0, .6 * s); g.addColorStop(0, "#ffe9ec"); g.addColorStop(.45, "#ff8c9e"); g.addColorStop(1, "#a01c48");
    c.beginPath(); c.moveTo(-.5 * s, .58 * s); c.bezierCurveTo(-.74 * s, .1 * s, -.5 * s, -.52 * s, -.02 * s, -.6 * s); c.bezierCurveTo(.4 * s, -.66 * s, .68 * s, -.3 * s, .52 * s, .08 * s); c.bezierCurveTo(.48 * s, .24 * s, .56 * s, .42 * s, .5 * s, .58 * s);
    for (let i = 4; i >= -4; i--) c.quadraticCurveTo((i * .125 + .06) * s, (.68 + Math.sin(t * 3 + i) * .03) * s, (i * .125 - .06 * 0) * s - .0, .58 * s); c.closePath(); c.fillStyle = g; c.fill(); c.stroke();
    for (let k = 0; k < 3; k++) { const y0 = (-.05 + k * .2) * s; c.beginPath(); for (let x = -.5; x <= .5; x += .06) { const y = y0 + Math.sin(x * 9 + t * 2.4 + k * 1.7) * s * .04; x === -.5 ? c.moveTo(x * s, y) : c.lineTo(x * s, y); } c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = s * .03; c.stroke(); }
    c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    c.beginPath(); c.moveTo(-.52 * s, -.12 * s); c.bezierCurveTo(-.66 * s, -.7 * s, -.12 * s, -1.08 * s, .36 * s, -.97 * s); c.bezierCurveTo(.74 * s, -.9 * s, .86 * s, -.5 * s, .62 * s, -.36 * s); c.bezierCurveTo(.68 * s, -.6 * s, .5 * s, -.72 * s, .3 * s, -.66 * s); c.bezierCurveTo(.04 * s, -.6 * s, -.26 * s, -.4 * s, -.52 * s, -.12 * s); c.closePath(); FS(c, "#fff4f6");
    c.strokeStyle = "rgba(255,150,170,.7)"; c.lineWidth = s * .03; c.beginPath(); c.moveTo(-.3 * s, -.5 * s); c.quadraticCurveTo(0, -.9 * s, .4 * s, -.78 * s); c.stroke(); c.strokeStyle = INK;
    for (let i = 0; i < 4; i++) { const ph = (t * .7 + i / 4) % 1, x = (.66 + ph * .22) * s, y = (-.5 - ph * .35 + ph * ph * .5) * s; c.save(); c.globalAlpha = 1 - ph; c.beginPath(); c.arc(x, y, s * .03, 0, 7); FS(c, "#ffffff"); c.restore(); }
    for (let i = 0; i < 6; i++) { const ph = (t * .14 + i / 6) % 1, x = Math.sin(i * 1.9 + t * .45) * .3 * s, y = (.28 - ph * .62) * s; c.save(); c.globalAlpha = Math.min(1, Math.sin(ph * Math.PI) * 2); ghost5(c, x, y, s * .06, t, i * 1.3); c.restore(); }
    c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .05);
    cEye(c, -.17 * s, .16 * s, s * .1, bl, s); cEye(c, .17 * s, .16 * s, s * .1, bl, s); mouth4(c, 0, .33 * s, s, true); cBlush(c, -.3 * s, .3 * s, s, .55); cBlush(c, .3 * s, .3 * s, s, .55);
    for (let i = 0; i < 5; i++) { const x = (i - 2) * .17 * s, y = -1.12 * s + Math.sin(t * 2.2 + i * 1.2) * .035 * s; glow4(c, x, y, s * .16, "#ffffff", .7); c.lineWidth = Math.max(1.4, s * .03); c.beginPath(); c.arc(x, y, s * .06, 0, 7); FS(c, i === 2 ? "#ffd0d8" : "#fff4f6"); }
  }
});
