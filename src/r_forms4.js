/* ===== Rauschmeer-Tonlinge (Bereich 4): eigene, aufwendige Körperformen ===== */
const mx4 = (a, b, k) => mixHex(a, b, k);
function wave4(c, x0, y0, len, amp, t, ph, col, w, dirx, diry) { // wehender Faden mit Kontur
  const n = 12; c.beginPath(); for (let i = 0; i <= n; i++) { const u = i / n, sw = Math.sin(t * 2.6 + ph + u * 3.2) * amp * u; const x = x0 + dirx * len * u + (diry ? 0 : 0) + sw * (diry ? 1 : 0) * 1, y = y0 + diry * len * u + sw * (dirx ? 1 : 0); i ? c.lineTo(x, y) : c.moveTo(x, y); }
  c.strokeStyle = INK; c.lineWidth = w + 2.6; c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.stroke(); }
function bubbles4(c, s, t, n, x0, y0, spread, col) {
  for (let i = 0; i < n; i++) { const ph = (t * .32 + i / n) % 1, x = x0 + Math.sin(i * 2.7 + t * 1.4) * spread * s + (i - n / 2) * s * .05, y = y0 - ph * s * .9, r = s * (.025 + .02 * ((i * 7) % 3)); c.save(); c.globalAlpha = Math.sin(ph * Math.PI) * .85; c.strokeStyle = col || "#ffffff"; c.lineWidth = Math.max(1, s * .02); c.fillStyle = "rgba(255,255,255,.28)"; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke(); c.restore(); }
}
function mouth4(c, x, y, s, open) { c.strokeStyle = INK; c.lineWidth = Math.max(1.5, s * .04); c.beginPath(); if (open) { c.arc(x, y, s * .05, 0, Math.PI); c.closePath(); c.fillStyle = "#8a3040"; c.fill(); c.stroke(); } else { c.moveTo(x - s * .06, y); c.quadraticCurveTo(x, y + s * .06, x + s * .06, y); c.stroke(); } }
function glow4(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, hexA(col, a)); g.addColorStop(1, hexA(col, 0)); c.save(); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore(); }
function star4(c, x, y, r, n, inner) { c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, q = i % 2 ? r * inner : r; i ? c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : c.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); }
Object.assign(FORMS, {
  muschling(c, s, sp, t, bc, bl) { // Muschling: kleine Muschel, die auf- und zuklappt, mit Perle
    const op = (Math.sin(t * 1.7) * .5 + .5) * .08 * s;
    c.beginPath(); c.moveTo(-.46 * s, .4 * s); c.quadraticCurveTo(-.5 * s, .7 * s, 0, .7 * s); c.quadraticCurveTo(.5 * s, .7 * s, .46 * s, .4 * s); c.closePath(); FS(c, mx4(sp.capc, "#ffffff", .15));
    c.strokeStyle = "rgba(120,50,70,.4)"; c.lineWidth = s * .025; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * .06 * s, .44 * s); c.lineTo(i * .17 * s, .66 * s); c.stroke(); } c.strokeStyle = INK;
    c.beginPath(); c.ellipse(0, .3 * s, .34 * s, .28 * s, 0, 0, 7); FS(c, bc);
    cEye(c, -.12 * s, .3 * s, s * .085, bl, s); cEye(c, .12 * s, .3 * s, s * .085, bl, s); mouth4(c, 0, .43 * s, s, false); cBlush(c, -.24 * s, .4 * s, s); cBlush(c, .24 * s, .4 * s, s);
    const g = c.createLinearGradient(0, -.4 * s, 0, .2 * s); g.addColorStop(0, mx4(sp.capc, "#ffffff", .45)); g.addColorStop(1, sp.capc);
    c.beginPath(); c.moveTo(-.5 * s, .2 * s - op); c.quadraticCurveTo(-.56 * s, -.34 * s, 0, -.4 * s); c.quadraticCurveTo(.56 * s, -.34 * s, .5 * s, .2 * s - op); for (let i = 4; i >= -4; i--) c.quadraticCurveTo(i * .125 * s + .06 * s, (.27 - op / s + (i % 2) * .03) * s, i * .125 * s - .06 * s, .2 * s - op); c.closePath(); FS(c, g);
    c.strokeStyle = "rgba(120,50,70,.45)"; c.lineWidth = s * .03; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(0, .2 * s - op); c.quadraticCurveTo(i * .1 * s, -.1 * s, i * .15 * s, -.3 * s + Math.abs(i) * .02 * s); c.stroke(); } c.strokeStyle = INK;
    c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.ellipse(-.22 * s, -.18 * s, .08 * s, .04 * s, -.6, 0, 7); c.fill();
    const pg = c.createRadialGradient(.36 * s, .54 * s, 0, .38 * s, .56 * s, s * .09); pg.addColorStop(0, "#fff"); pg.addColorStop(1, "#e8d8f4"); c.beginPath(); c.arc(.36 * s, .56 * s, s * .08, 0, 7); c.lineWidth = Math.max(1.5, s * .035); FS(c, pg);
  },
  sandling(c, s, sp, t, bc, bl) { // Sandling: Sandhügel mit kleiner Sandburg und Fähnchen
    c.beginPath(); c.moveTo(-.46 * s, .62 * s); c.quadraticCurveTo(-.5 * s, .1 * s, -.2 * s, .02 * s); c.quadraticCurveTo(0, -.04 * s, .2 * s, .02 * s); c.quadraticCurveTo(.5 * s, .1 * s, .46 * s, .62 * s); c.quadraticCurveTo(0, .72 * s, -.46 * s, .62 * s); c.closePath(); FS(c, bc);
    c.strokeStyle = "rgba(170,120,50,.5)"; c.lineWidth = s * .035; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-.38 * s, (.28 + i * .13) * s); c.quadraticCurveTo(0, (.36 + i * .13) * s, .38 * s, (.28 + i * .13) * s); c.stroke(); } c.strokeStyle = INK;
    c.fillStyle = "rgba(180,130,60,.55)"; [[-.3, .55], [.28, .5], [.1, .6]].forEach(p => { c.beginPath(); c.arc(p[0] * s, p[1] * s, s * .018, 0, 7); c.fill(); });
    [-1, 1].forEach(d => { c.beginPath(); c.moveTo(d * .1 * s, -.0 * s); c.lineTo(d * .1 * s, -.22 * s); c.lineTo(d * .02 * s, -.22 * s); c.lineTo(d * .02 * s, -.28 * s); c.lineTo(d * .06 * s, -.28 * s); c.lineTo(d * .06 * s, -.3 * s); c.lineTo(d * .14 * s, -.3 * s); c.lineTo(d * .14 * s, 0); FS(c, mx4(sp.capc, "#fff0c0", .35)); });
    c.beginPath(); c.moveTo(-.12 * s, .02 * s); c.lineTo(-.12 * s, -.34 * s); c.lineTo(-.04 * s, -.34 * s); c.lineTo(-.04 * s, -.4 * s); c.lineTo(.04 * s, -.4 * s); c.lineTo(.04 * s, -.34 * s); c.lineTo(.12 * s, -.34 * s); c.lineTo(.12 * s, .02 * s); c.closePath(); FS(c, mx4(sp.capc, "#fff0c0", .55));
    c.beginPath(); c.arc(0, -.14 * s, s * .05, Math.PI, 0); c.lineTo(s * .05, -.04 * s); c.lineTo(-s * .05, -.04 * s); c.closePath(); c.fillStyle = "#6a4a2a"; c.fill();
    const fw = Math.sin(t * 5) * s * .03; c.beginPath(); c.moveTo(0, -.4 * s); c.lineTo(0, -.58 * s); c.stroke(); c.beginPath(); c.moveTo(0, -.58 * s); c.quadraticCurveTo(s * .1, -.6 * s + fw, s * .2, -.54 * s + fw); c.lineTo(0, -.5 * s); c.closePath(); FS(c, "#e0503a");
    cEye(c, -.15 * s, .34 * s, s * .09, bl, s); cEye(c, .15 * s, .34 * s, s * .09, bl, s); mouth4(c, 0, .5 * s, s, false); cBlush(c, -.28 * s, .46 * s, s); cBlush(c, .28 * s, .46 * s, s);
    [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * .16 * s, .7 * s, .09 * s, .05 * s, 0, 0, 7); FS(c, bc); });
  },
  tangel(c, s, sp, t, bc, bl) { // Tangel: Seetang-Wicht mit wehenden Blättern
    for (let i = -2; i <= 2; i++) { const bx = i * .13 * s, h = (.55 + (2 - Math.abs(i)) * .08) * s, ph = t * 2.2 + i * .9; c.beginPath(); c.moveTo(bx - .05 * s, 0); c.bezierCurveTo(bx - .1 * s + Math.sin(ph) * .08 * s, -h * .35, bx + .1 * s + Math.sin(ph + 1) * .1 * s, -h * .7, bx + i * .06 * s + Math.sin(ph + 2) * .1 * s, -h); c.bezierCurveTo(bx + .12 * s + Math.sin(ph + 1) * .08 * s, -h * .65, bx + .12 * s, -h * .3, bx + .05 * s, 0); c.closePath(); FS(c, i % 2 ? sp.capc : mx4(sp.capc, "#a8e8a0", .35)); c.strokeStyle = "rgba(20,80,40,.45)"; c.lineWidth = s * .02; c.beginPath(); c.moveTo(bx, 0); c.quadraticCurveTo(bx + Math.sin(ph) * .05 * s, -h * .5, bx + i * .05 * s, -h * .85); c.stroke(); c.strokeStyle = INK; }
    c.beginPath(); c.ellipse(0, .3 * s, .38 * s, .36 * s, 0, 0, 7); FS(c, bc);
    c.fillStyle = hexA(sp.capc, .35); [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * .22 * s, .52 * s, .08 * s, .14 * s, d * .4, 0, 7); c.fill(); });
    c.beginPath(); c.moveTo(-.14 * s, .62 * s); c.quadraticCurveTo(0, .72 * s, .14 * s, .62 * s); c.stroke();
    cEye(c, -.13 * s, .26 * s, s * .09, bl, s); cEye(c, .13 * s, .26 * s, s * .09, bl, s); mouth4(c, 0, .42 * s, s, false); cBlush(c, -.25 * s, .38 * s, s); cBlush(c, .25 * s, .38 * s, s);
    [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * .38 * s, .42 * s + Math.sin(t * 3 + d) * s * .02, .09 * s, .05 * s, d * .5, 0, 7); FS(c, sp.capc); });
    bubbles4(c, s, t, 3, 0, .5 * s, .4, "#bfe8ff");
  },
  blubbi(c, s, sp, t, bc, bl) { // Blubbi: Wasserblase mit Gesicht, Flossen, aufsteigende Bläschen
    const wob = Math.sin(t * 3) * s * .02;
    [-1, 1].forEach(d => { c.beginPath(); c.moveTo(d * .38 * s, .3 * s); c.quadraticCurveTo(d * .66 * s, (.16 + wob / s) * s, d * .62 * s, .46 * s); c.quadraticCurveTo(d * .5 * s, .44 * s, d * .38 * s, .42 * s); c.closePath(); FS(c, sp.capc); });
    const g = c.createRadialGradient(-.12 * s, .1 * s, s * .02, 0, .26 * s, s * .5); g.addColorStop(0, "#ffffff"); g.addColorStop(.5, bc); g.addColorStop(1, mx4(sp.capc, bc, .5));
    c.beginPath(); c.ellipse(0, .26 * s, .4 * s + wob, .42 * s - wob, 0, 0, 7); FS(c, g);
    c.strokeStyle = "rgba(255,255,255,.85)"; c.lineWidth = s * .04; c.beginPath(); c.arc(0, .26 * s, s * .32, Math.PI * 1.08, Math.PI * 1.45); c.stroke(); c.fillStyle = "rgba(255,255,255,.8)"; c.beginPath(); c.arc(-.2 * s, -.02 * s, s * .035, 0, 7); c.fill(); c.strokeStyle = INK;
    c.beginPath(); c.moveTo(0, -.2 * s); c.quadraticCurveTo(-.06 * s, -.34 * s, 0, -.4 * s); c.quadraticCurveTo(.06 * s, -.34 * s, 0, -.2 * s); FS(c, sp.capc);
    cEye(c, -.14 * s, .24 * s, s * .1, bl, s); cEye(c, .14 * s, .24 * s, s * .1, bl, s); mouth4(c, 0, .4 * s, s, true); cBlush(c, -.27 * s, .36 * s, s); cBlush(c, .27 * s, .36 * s, s);
    bubbles4(c, s, t, 4, .28 * s, .1 * s, .3, "#ffffff");
  },
  seestern(c, s, sp, t, bc, bl) { // Sternfüßler: Seestern mit fünf Armen, Punkten und Gesicht
    c.save(); c.translate(0, .22 * s); const wig = Math.sin(t * 2.4) * .06;
    c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5 + (i % 2 ? 0 : wig * Math.sin(t * 3 + i)), q = i % 2 ? .22 * s : .6 * s; const x = Math.cos(a) * q, y = Math.sin(a) * q * .95; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath();
    const g = c.createRadialGradient(0, 0, s * .05, 0, 0, s * .6); g.addColorStop(0, mx4(sp.capc, "#fff0d8", .5)); g.addColorStop(1, sp.capc); c.lineWidth = Math.max(2.6, s * .075); FS(c, g);
    c.fillStyle = "rgba(255,240,200,.85)"; c.lineWidth = Math.max(1, s * .02); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * Math.PI * 2 / 5; for (let j = 1; j <= 3; j++) { c.beginPath(); c.arc(Math.cos(a) * j * .17 * s, Math.sin(a) * j * .16 * s, s * (.032 - j * .003), 0, 7); c.fill(); } }
    c.restore(); c.beginPath(); c.ellipse(0, .28 * s, .26 * s, .24 * s, 0, 0, 7); FS(c, bc);
    cEye(c, -.1 * s, .24 * s, s * .08, bl, s); cEye(c, .1 * s, .24 * s, s * .08, bl, s); mouth4(c, 0, .38 * s, s, false); cBlush(c, -.2 * s, .34 * s, s); cBlush(c, .2 * s, .34 * s, s);
  },
  wrackwurm(c, s, sp, t, bc, bl) { // Wrackwurm: Ringelwurm in einer morschen Planke, mit Bullauge und Seepocken
    c.beginPath(); c.moveTo(-.5 * s, .72 * s); c.lineTo(-.46 * s, .42 * s); c.lineTo(.46 * s, .42 * s); c.lineTo(.5 * s, .72 * s); c.closePath(); FS(c, mx4(sp.capc, "#b89a72", .35));
    c.strokeStyle = "rgba(50,30,10,.55)"; c.lineWidth = s * .03; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * .18 * s, .44 * s); c.lineTo(i * .19 * s, .7 * s); c.stroke(); } c.beginPath(); c.moveTo(-.48 * s, .56 * s); c.lineTo(.48 * s, .56 * s); c.stroke(); c.strokeStyle = INK;
    c.fillStyle = "#e8e0d0"; [[-.36, .46], [.3, .5], [.4, .66]].forEach(p => { c.beginPath(); c.arc(p[0] * s, p[1] * s, s * .045, Math.PI, 0); c.lineTo(p[0] * s + s * .045, p[1] * s + s * .02); c.lineTo(p[0] * s - s * .045, p[1] * s + s * .02); c.closePath(); c.fill(); c.stroke(); });
    const sw = Math.sin(t * 2.2) * s * .08; const seg = [[0, .38, .24], [sw * .4, .16, .22], [sw * .8, -.04, .2], [sw, -.22, .19]];
    seg.forEach((g, i) => { c.beginPath(); c.ellipse(g[0], g[1] * s, g[2] * s, g[2] * s * .86, 0, 0, 7); FS(c, i % 2 ? mx4(bc, sp.capc, .35) : bc); });
    c.beginPath(); c.ellipse(sw, -.3 * s, .27 * s, .25 * s, 0, 0, 7); FS(c, bc);
    c.strokeStyle = INK; c.lineWidth = Math.max(1.8, s * .045); [-1, 1].forEach(d => { c.beginPath(); c.moveTo(sw + d * .1 * s, -.5 * s); c.quadraticCurveTo(sw + d * .2 * s, -.7 * s, sw + d * .26 * s + Math.sin(t * 3 + d) * s * .03, -.66 * s); c.stroke(); c.fillStyle = "#e8d890"; c.beginPath(); c.arc(sw + d * .26 * s + Math.sin(t * 3 + d) * s * .03, -.66 * s, s * .04, 0, 7); c.fill(); c.stroke(); });
    cEye(c, sw - .1 * s, -.32 * s, s * .08, bl, s); cEye(c, sw + .1 * s, -.32 * s, s * .08, bl, s); mouth4(c, sw, -.17 * s, s, false); cBlush(c, sw - .2 * s, -.22 * s, s); cBlush(c, sw + .2 * s, -.22 * s, s);
    c.beginPath(); c.arc(-.3 * s, .6 * s, s * .08, 0, 7); c.fillStyle = "#8ac0d8"; c.fill(); c.stroke(); c.beginPath(); c.arc(-.3 * s, .6 * s, s * .05, 0, 7); c.fillStyle = "#cfeaf6"; c.fill();
  },
  korallo(c, s, sp, t, bc, bl) { // Korallo: Korallenwesen mit verzweigtem Geweih und Polypen
    const br = (x0, y0, a, len, d) => { const sw = Math.sin(t * 2 + x0 * 9 + d) * .06; const x1 = x0 + Math.sin(a + sw) * len, y1 = y0 - Math.cos(a + sw) * len; c.strokeStyle = INK; c.lineWidth = Math.max(3.4, s * .08 - d * s * .015); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.strokeStyle = d % 2 ? mx4(sp.capc, "#ffb0b0", .4) : sp.capc; c.lineWidth = Math.max(1.8, s * .045 - d * s * .01); c.stroke(); if (d < 2) { br(x1, y1, a - .6, len * .66, d + 1); br(x1, y1, a + .6, len * .66, d + 1); } else { c.fillStyle = "#ffe0e8"; c.strokeStyle = INK; c.lineWidth = Math.max(1.2, s * .025); c.beginPath(); c.arc(x1, y1, s * .035, 0, 7); c.fill(); c.stroke(); } };
    br(-.2 * s, 0, -.34, .27 * s, 0); br(.2 * s, 0, .34, .27 * s, 0); br(0, -.02 * s, 0, .32 * s, 0);
    c.beginPath(); c.ellipse(0, .32 * s, .4 * s, .36 * s, 0, 0, 7); FS(c, bc);
    c.fillStyle = hexA(sp.capc, .5); [[-.26, .5], [.28, .46], [.0, .62], [.22, .62], [-.18, .6]].forEach(p => { c.beginPath(); c.arc(p[0] * s, p[1] * s, s * .035, 0, 7); c.fill(); });
    cEye(c, -.13 * s, .28 * s, s * .09, bl, s); cEye(c, .13 * s, .28 * s, s * .09, bl, s); mouth4(c, 0, .44 * s, s, false); cBlush(c, -.26 * s, .4 * s, s); cBlush(c, .26 * s, .4 * s, s);
  },
  tiefenlicht(c, s, sp, t, bc, bl) { // Tiefenlicht: Anglerfisch mit leuchtendem Köder
    const pu = .7 + .3 * Math.sin(t * 3), lx = Math.sin(t * 1.6) * s * .08;
    glow4(c, lx - .02 * s, -.42 * s, s * .6, sp.capc, .55 * pu);
    c.strokeStyle = INK; c.lineWidth = Math.max(2.4, s * .06); c.beginPath(); c.moveTo(.02 * s, -.04 * s); c.quadraticCurveTo(-.1 * s, -.5 * s, lx - .02 * s, -.42 * s); c.stroke();
    c.beginPath(); c.arc(lx - .02 * s, -.42 * s, s * .09, 0, 7); const lg = c.createRadialGradient(lx - .02 * s, -.42 * s, 0, lx - .02 * s, -.42 * s, s * .09); lg.addColorStop(0, "#ffffff"); lg.addColorStop(1, sp.capc); FS(c, lg);
    c.beginPath(); c.moveTo(.4 * s, .3 * s); c.quadraticCurveTo(.7 * s, .12 * s + Math.sin(t * 4) * s * .03, .66 * s, .54 * s); c.quadraticCurveTo(.52 * s, .46 * s, .4 * s, .42 * s); c.closePath(); FS(c, mx4(bc, sp.capc, .35));
    const g = c.createLinearGradient(0, -.1 * s, 0, .7 * s); g.addColorStop(0, bc); g.addColorStop(1, mx4(bc, "#5a78b8", .55)); c.beginPath(); c.ellipse(0, .32 * s, .46 * s, .38 * s, 0, 0, 7); FS(c, g);
    c.fillStyle = hexA(sp.capc, .9); [[-.3, .2], [-.18, .08], [.14, .06], [.3, .18]].forEach((p, i) => { c.beginPath(); c.arc(p[0] * s, p[1] * s, s * .022 * (.7 + .3 * Math.sin(t * 4 + i)), 0, 7); c.fill(); });
    cEye(c, -.15 * s, .22 * s, s * .11, bl, s); cEye(c, .15 * s, .22 * s, s * .11, bl, s);
    c.beginPath(); c.moveTo(-.28 * s, .46 * s); c.quadraticCurveTo(0, .62 * s, .28 * s, .46 * s); c.quadraticCurveTo(0, .52 * s, -.28 * s, .46 * s); c.fillStyle = "#6a2a40"; c.fill(); c.stroke(); c.fillStyle = "#fff"; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * .075 * s - .02 * s, .5 * s - Math.abs(i) * .008 * s); c.lineTo(i * .075 * s, .43 * s + Math.abs(i) * .004 * s + .02 * s); c.lineTo(i * .075 * s + .02 * s, .5 * s - Math.abs(i) * .008 * s); c.fill(); }
    cBlush(c, -.32 * s, .36 * s, s); cBlush(c, .32 * s, .36 * s, s);
  },
  perlchen(c, s, sp, t, bc, bl) { // Perlchen: schillernde Perle in einer offenen Muschel
    const op = (Math.sin(t * 1.3) * .5 + .5) * .06 * s;
    c.beginPath(); c.moveTo(-.5 * s, .44 * s); c.quadraticCurveTo(-.54 * s, .74 * s, 0, .74 * s); c.quadraticCurveTo(.54 * s, .74 * s, .5 * s, .44 * s); c.quadraticCurveTo(0, .52 * s, -.5 * s, .44 * s); c.closePath(); FS(c, mx4("#d8c0f0", "#ffffff", .2));
    c.strokeStyle = "rgba(110,80,150,.4)"; c.lineWidth = s * .025; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * .05 * s, .52 * s); c.lineTo(i * .17 * s, .72 * s); c.stroke(); } c.strokeStyle = INK;
    for (let i = 0; i < 6; i++) { const a = t * .5 + i * 1.05; c.save(); c.globalAlpha = .5; star4(c, Math.cos(a) * s * .52, .12 * s + Math.sin(a * 1.3) * s * .34, s * .05, 4, .35); c.fillStyle = i % 2 ? "#fff6c8" : "#e8d0ff"; c.fill(); c.restore(); }
    const ph = t * .6, g = c.createLinearGradient(Math.cos(ph) * s * .4, -.2 * s, -Math.cos(ph) * s * .4, .6 * s); g.addColorStop(0, "#ffffff"); g.addColorStop(.3, "#ffe4f0"); g.addColorStop(.55, "#e4e0ff"); g.addColorStop(.8, "#d4f4ee"); g.addColorStop(1, "#fff0d4");
    c.beginPath(); c.arc(0, .2 * s, s * .4, 0, 7); c.lineWidth = Math.max(2.4, s * .065); FS(c, g);
    c.fillStyle = "rgba(255,255,255,.85)"; c.beginPath(); c.ellipse(-.18 * s, -.02 * s, .1 * s, .06 * s, -.7, 0, 7); c.fill();
    cEye(c, -.12 * s, .2 * s, s * .09, bl, s); cEye(c, .12 * s, .2 * s, s * .09, bl, s); mouth4(c, 0, .34 * s, s, false); cBlush(c, -.24 * s, .3 * s, s, .45); cBlush(c, .24 * s, .3 * s, s, .45);
    c.beginPath(); c.moveTo(-.5 * s, .44 * s - op); c.quadraticCurveTo(-.5 * s, .3 * s, -.32 * s, .34 * s); c.quadraticCurveTo(-.36 * s, .46 * s - op, -.5 * s, .44 * s - op); FS(c, "#e4cdf8"); c.beginPath(); c.moveTo(.5 * s, .44 * s - op); c.quadraticCurveTo(.5 * s, .3 * s, .32 * s, .34 * s); c.quadraticCurveTo(.36 * s, .46 * s - op, .5 * s, .44 * s - op); FS(c, "#e4cdf8");
  },
  tiefsee(c, s, sp, t, bc, bl) { // Tiefseekönig: gepanzerter Königsfisch mit Leuchtpunkten, Krone und Flossenumhang
    const pu = .6 + .4 * Math.sin(t * 2.6);
    glow4(c, 0, .3 * s, s * .75, sp.capc, .3 * pu);
    c.beginPath(); c.moveTo(-.34 * s, .1 * s); c.quadraticCurveTo(-.78 * s, .3 * s + Math.sin(t * 2) * s * .04, -.62 * s, .7 * s); c.lineTo(-.3 * s, .5 * s); c.closePath(); FS(c, mx4(sp.capc, "#8ab0ff", .4)); c.beginPath(); c.moveTo(.34 * s, .1 * s); c.quadraticCurveTo(.78 * s, .3 * s + Math.sin(t * 2 + 1) * s * .04, .62 * s, .7 * s); c.lineTo(.3 * s, .5 * s); c.closePath(); FS(c, mx4(sp.capc, "#8ab0ff", .4));
    const g = c.createLinearGradient(0, -.1 * s, 0, .7 * s); g.addColorStop(0, mx4(bc, "#ffffff", .2)); g.addColorStop(1, mx4(bc, sp.capc, .5)); c.beginPath(); c.ellipse(0, .34 * s, .42 * s, .4 * s, 0, 0, 7); FS(c, g);
    c.strokeStyle = "rgba(30,50,130,.4)"; c.lineWidth = s * .025; for (let r = 0; r < 3; r++) for (let i = -2; i <= 2; i++) { c.beginPath(); c.arc(i * .13 * s + (r % 2) * .065 * s, (.46 + r * .1) * s, s * .06, 0.2, Math.PI - .2); c.stroke(); } c.strokeStyle = INK;
    c.fillStyle = "#bfffff"; [[-.3, .3], [.3, .3], [-.34, .46], [.34, .46]].forEach((p, i) => { c.beginPath(); c.arc(p[0] * s, p[1] * s, s * .025 * (.7 + .3 * Math.sin(t * 4 + i)), 0, 7); c.fill(); });
    [-1, 1].forEach(d => { c.beginPath(); c.moveTo(d * .1 * s, .5 * s); c.quadraticCurveTo(d * .14 * s + Math.sin(t * 3 + d) * s * .03, .66 * s, d * .08 * s, .76 * s); c.lineWidth = Math.max(1.6, s * .04); c.stroke(); });
    cEye(c, -.15 * s, .26 * s, s * .1, bl, s); cEye(c, .15 * s, .26 * s, s * .1, bl, s); mouth4(c, 0, .42 * s, s, false); cBlush(c, -.28 * s, .38 * s, s); cBlush(c, .28 * s, .38 * s, s);
    c.beginPath(); c.moveTo(-.3 * s, -.0 * s); c.lineTo(-.34 * s, -.38 * s); c.lineTo(-.17 * s, -.18 * s); c.lineTo(0, -.5 * s); c.lineTo(.17 * s, -.18 * s); c.lineTo(.34 * s, -.38 * s); c.lineTo(.3 * s, 0); c.closePath(); const cg = c.createLinearGradient(0, -.5 * s, 0, 0); cg.addColorStop(0, "#fff0a0"); cg.addColorStop(1, "#e0a820"); c.lineWidth = Math.max(2.2, s * .06); FS(c, cg);
    [[-.34, -.38], [0, -.5], [.34, -.38]].forEach(p => { c.beginPath(); c.arc(p[0] * s, p[1] * s, s * .035, 0, 7); FS(c, "#5ad8ff"); });
  },
  urperle(c, s, sp, t, bc, bl) { // Urperle: Nautilus mit goldener Urperle, strahlend
    const rot = t * .25; glow4(c, 0, .2 * s, s * .8, "#ffe27a", .45);
    for (let i = 0; i < 4; i++) { const bx = (-.24 + i * .16) * s, ph = t * 2 + i; c.beginPath(); c.moveTo(bx, .5 * s); c.bezierCurveTo(bx + Math.sin(ph) * s * .08, .62 * s, bx - Math.sin(ph) * s * .08, .7 * s, bx + Math.sin(ph + 1) * s * .06, .78 * s); c.strokeStyle = INK; c.lineWidth = Math.max(3, s * .07); c.stroke(); c.strokeStyle = "#ffe8c0"; c.lineWidth = Math.max(1.6, s * .035); c.stroke(); }
    const g = c.createRadialGradient(-.1 * s, .0, s * .05, 0, .2 * s, s * .5); g.addColorStop(0, "#fff6d0"); g.addColorStop(.55, "#ffe08a"); g.addColorStop(1, "#e8b040");
    c.beginPath(); c.moveTo(-.42 * s, .46 * s); c.bezierCurveTo(-.6 * s, -.1 * s, -.1 * s, -.5 * s, .2 * s, -.34 * s); c.bezierCurveTo(.56 * s, -.14 * s, .5 * s, .4 * s, .3 * s, .5 * s); c.closePath(); c.lineWidth = Math.max(2.4, s * .065); FS(c, g);
    c.strokeStyle = "rgba(150,90,10,.75)"; c.lineWidth = s * .04; c.beginPath(); for (let a = 0; a < 11; a += .3) { const r = (.04 + a * .027) * s; const x = .0 * s + Math.cos(a + rot * 0) * r, y = .06 * s + Math.sin(a) * r * .9; a ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    c.strokeStyle = "rgba(150,90,10,.55)"; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-.2 * s + i * .12 * s, .42 * s); c.quadraticCurveTo(-.22 * s + i * .14 * s, .2 * s, -.1 * s + i * .14 * s, -.12 * s); c.stroke(); } c.strokeStyle = INK;
    c.beginPath(); c.ellipse(.05 * s, .5 * s, .34 * s, .24 * s, 0, 0, 7); FS(c, mx4(bc, "#f0a860", .35));
    const pg = c.createRadialGradient(-.02 * s, -.0, 0, 0, .06 * s, s * .13); pg.addColorStop(0, "#ffffff"); pg.addColorStop(.5, "#fff0a8"); pg.addColorStop(1, "#f0c040"); c.beginPath(); c.arc(0, .06 * s, s * .12, 0, 7); c.lineWidth = Math.max(2, s * .05); FS(c, pg);
    cEye(c, -.08 * s, .46 * s, s * .085, bl, s); cEye(c, .18 * s, .46 * s, s * .085, bl, s); mouth4(c, .05 * s, .6 * s, s, false); cBlush(c, -.18 * s, .56 * s, s, .5); cBlush(c, .28 * s, .56 * s, s, .5);
    for (let i = 0; i < 4; i++) { const a = t * 1.1 + i * 1.57, r = s * (.52 + .05 * Math.sin(t * 2 + i)); c.save(); c.globalAlpha = .8; star4(c, Math.cos(a) * r, .14 * s + Math.sin(a) * r * .8, s * .05, 4, .3); c.fillStyle = "#fff6c0"; c.strokeStyle = "rgba(200,150,30,.7)"; c.lineWidth = 1; c.fill(); c.stroke(); c.restore(); }
  },
  abgrundsonne(c, s, sp, t, bc, bl) { // Abgrundsonne: glühende Sonne aus der Tiefe mit Strahlenkranz und heißen Blasen
    const pu = 1 + .06 * Math.sin(t * 3); glow4(c, 0, .2 * s, s * .95, "#ff8a2a", .55);
    c.save(); c.translate(0, .2 * s); c.rotate(t * .35);
    for (let i = 0; i < 12; i++) { c.save(); c.rotate(i * Math.PI / 6); const L = (i % 2 ? .62 : .74) * s * (1 + .06 * Math.sin(t * 4 + i)); c.beginPath(); c.moveTo(-.09 * s, -.42 * s); c.quadraticCurveTo(0, -L * 1.02, .09 * s, -.42 * s); c.closePath(); FS(c, i % 2 ? "#ffb040" : "#ff7a28"); c.restore(); }
    c.restore();
    const g = c.createRadialGradient(-.1 * s, .08 * s, s * .02, 0, .2 * s, s * .46 * pu); g.addColorStop(0, "#fff8d0"); g.addColorStop(.45, "#ffd060"); g.addColorStop(1, "#ff8a2a");
    c.beginPath(); c.arc(0, .2 * s, s * .43 * pu, 0, 7); c.lineWidth = Math.max(2.6, s * .07); FS(c, g);
    c.strokeStyle = "rgba(200,70,10,.5)"; c.lineWidth = s * .03; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(0, .2 * s, s * (.3 - i * .07), Math.PI * (.15 + i * .4) + t * .3, Math.PI * (.6 + i * .4) + t * .3); c.stroke(); } c.strokeStyle = INK;
    cEye(c, -.13 * s, .16 * s, s * .09, bl, s); cEye(c, .13 * s, .16 * s, s * .09, bl, s); mouth4(c, 0, .34 * s, s, true); cBlush(c, -.26 * s, .28 * s, s, .55); cBlush(c, .26 * s, .28 * s, s, .55);
    for (let i = 0; i < 4; i++) { const ph = (t * .4 + i / 4) % 1, x = (-.3 + i * .2) * s + Math.sin(t * 2 + i) * s * .04, y = .7 * s - ph * s * 1.0, r = s * (.03 + .015 * (i % 2)); c.save(); c.globalAlpha = Math.sin(ph * Math.PI) * .8; c.fillStyle = "#ffd070"; c.strokeStyle = "rgba(200,90,10,.8)"; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke(); c.restore(); }
  },
  seelenmeer(c, s, sp, t, bc, bl) { // Seelenmeer: gläserner Geisterqualle, in ihrem Körper wogt ein ganzes Meer, Seelenlichter kreisen
    glow4(c, 0, .1 * s, s * 1.0, "#ff4a5a", .4);
    for (let i = 0; i < 7; i++) { const bx = (i - 3) * .11 * s, ph = t * 2 + i * .8; c.beginPath(); c.moveTo(bx, .34 * s); c.bezierCurveTo(bx + Math.sin(ph) * s * .12, .5 * s, bx - Math.sin(ph) * s * .12, .64 * s, bx + Math.sin(ph + 1.3) * s * .1, (.78 + (i % 2) * .05) * s); c.strokeStyle = INK; c.lineWidth = Math.max(3.4, s * .085); c.stroke(); c.strokeStyle = i % 2 ? "#ff8a96" : "#ffe0e4"; c.lineWidth = Math.max(1.8, s * .045); c.stroke(); }
    const g = c.createLinearGradient(0, -.5 * s, 0, .4 * s); g.addColorStop(0, "#ffe8ea"); g.addColorStop(1, "#ffb0b8");
    c.beginPath(); c.moveTo(-.5 * s, .36 * s); c.bezierCurveTo(-.62 * s, -.3 * s, -.3 * s, -.58 * s, 0, -.58 * s); c.bezierCurveTo(.3 * s, -.58 * s, .62 * s, -.3 * s, .5 * s, .36 * s); for (let i = 4; i >= -4; i--) c.quadraticCurveTo(i * .11 * s + .055 * s, (.46 + (i % 2) * .05) * s, i * .11 * s - .055 * s, .36 * s); c.closePath(); c.lineWidth = Math.max(2.6, s * .07); FS(c, g);
    c.save(); c.beginPath(); c.moveTo(-.46 * s, .34 * s); c.bezierCurveTo(-.58 * s, -.28 * s, -.28 * s, -.54 * s, 0, -.54 * s); c.bezierCurveTo(.28 * s, -.54 * s, .58 * s, -.28 * s, .46 * s, .34 * s); c.closePath(); c.clip();
    for (let k = 0; k < 3; k++) { const y0 = (.0 + k * .15) * s; c.beginPath(); for (let x = -.6; x <= .6; x += .06) { const y = y0 + Math.sin(x * 9 + t * 2.4 + k * 1.5) * s * .045; x === -.6 ? c.lineTo(x * s, y) : c.lineTo(x * s, y); } c.lineTo(.6 * s, .6 * s); c.lineTo(-.6 * s, .6 * s); c.closePath(); c.fillStyle = k === 0 ? "rgba(224,48,60,.38)" : k === 1 ? "rgba(255,90,100,.32)" : "rgba(255,150,160,.3)"; c.fill(); }
    c.restore();
    c.strokeStyle = "rgba(255,255,255,.85)"; c.lineWidth = s * .04; c.beginPath(); c.arc(0, .0, s * .44, Math.PI * 1.1, Math.PI * 1.4); c.stroke(); c.strokeStyle = INK;
    cEye(c, -.15 * s, .12 * s, s * .1, bl, s); cEye(c, .15 * s, .12 * s, s * .1, bl, s); mouth4(c, 0, .26 * s, s, false); cBlush(c, -.28 * s, .24 * s, s, .5); cBlush(c, .28 * s, .24 * s, s, .5);
    for (let i = 0; i < 5; i++) { const a = t * .9 + i * 1.257, r = s * (.62 + .04 * Math.sin(t * 2 + i)), x = Math.cos(a) * r, y = -.0 * s + Math.sin(a) * r * .55; c.save(); glow4(c, x, y, s * .13, "#ffd0d6", .8); c.fillStyle = "#fff"; c.strokeStyle = "rgba(224,48,60,.8)"; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, s * .03, 0, 7); c.fill(); c.stroke(); c.restore(); }
    c.beginPath(); c.moveTo(-.3 * s, -.5 * s); c.lineTo(-.34 * s, -.82 * s); c.lineTo(-.15 * s, -.62 * s); c.lineTo(0, -.9 * s); c.lineTo(.15 * s, -.62 * s); c.lineTo(.34 * s, -.82 * s); c.lineTo(.3 * s, -.5 * s); c.closePath(); const cg = c.createLinearGradient(0, -.9 * s, 0, -.5 * s); cg.addColorStop(0, "#ffffff"); cg.addColorStop(1, "#ff6070"); c.lineWidth = Math.max(2.2, s * .055); FS(c, cg);
  }
});
