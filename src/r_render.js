/* ===== ZEICHNEN: Tinte und Aquarell ===== */
const INK = "#1d2742";
const cv = $("cv"), ctx = cv.getContext("2d");
let VW = 0, VH = 0, Z = 1, DPR = 1, camX = 0, camY = 0;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2); VW = window.innerWidth; VH = window.innerHeight;
  cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
  Z = clamp(VH / (15 * TS), 0.7, 2);
}
const RS = 2, CH = 8, chunks = new Map();
function jx(x, y, k) { return (hs(x, y, k) - 0.5) * 7; }
function mixHex(a, b, k) { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const m = s => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k); return "rgb(" + m(16) + "," + m(8) + "," + m(0) + ")"; }
function tcol(x, y) {
  const v = T[y] ? T[y][x] : 0, z = ZN[y] && ZN[y][x];
  if (v === 2) return ["#e0d3a6", "#d3c593"][(hs(x, y, 1) * 2) | 0];
  if (v === 3) return y >= AREA_SPLIT4 ? ["#5cc3d0", "#4fb5c6"][(hs(x, y, 1) * 2) | 0] : ["#7fb6d8", "#6fa8cf"][(hs(x, y, 1) * 2) | 0];
  if ((v === 0 || v === 5) && y < AREA_SPLIT) { const base = ["#43803f", "#3b7539"][(hs(x, y, 1) * 2) | 0]; let d = 0; for (const [dx, dy] of [[2, 0], [-2, 0], [0, 2], [0, -2], [3, 0], [-3, 0], [0, 3], [0, -3]]) { const t2 = T[y + dy] ? T[y + dy][x + dx] : 0; if (t2 === 0 || t2 === 5 || t2 === undefined) d++; } return d >= 5 ? mixHex(base, "#17381f", .1 + .05 * d) : base; }
  if ((v === 0 || v === 5) && y >= AREA_SPLIT4) return ["#2a5878", "#244d6c"][(hs(x, y, 1) * 2) | 0];
  if (v === 0 || v === 5) return y < AREA_SPLIT ? ["#43803f", "#3b7539"][(hs(x, y, 1) * 2) | 0] : y < AREA_SPLIT3 ? ["#3a3560", "#332e57"][(hs(x, y, 1) * 2) | 0] : ["#2f3a72", "#283266"][(hs(x, y, 1) * 2) | 0];
  const zi = ZINFO[z || "wiese"] || ZINFO.wiese, lf = .5 + .5 * Math.sin(x * .21 + Math.sin(y * .17) * 1.8) * Math.cos(y * .19 + x * .07); return mixHex(zi.col, zi.col2, Math.min(1, hs(x, y, 1) * 0.4 + lf * 0.45));
}
const cls = (x, y) => { const v = T[y] ? T[y][x] : 0; return v === 0 || v === 5 ? 0 : v === 3 ? 3 : 1; };
function wob(c, x1, y1, x2, y2, seed) { const mx = (x1 + x2) / 2 + (hs(x1 | 0, y1 | 0, seed) - 0.5) * 3, my = (y1 + y2) / 2 + (hs(x2 | 0, y2 | 0, seed + 1) - 0.5) * 3; c.moveTo(x1, y1); c.quadraticCurveTo(mx, my, x2, y2); }
function corner(cx, cy) { return [cx * TS + jx(cx, cy, 11), cy * TS + jx(cx, cy, 12)]; }
function bamboo(c, px, py, seed, n, hgt) {
  c.lineJoin = c.lineCap = "round";
  for (let i = 0; i < n; i++) {
    const sx = px + 3 + hs(seed, i, 71) * 26, top = py + 30 - hgt - hs(seed, i, 72) * 10, w = 3.4 + hs(seed, i, 73) * 1.4, lean = (hs(seed, i, 74) - 0.5) * 3;
    const g = ["#6fb063", "#5fa055", "#7cbc6c"][(hs(seed, i, 75) * 3) | 0];
    c.strokeStyle = INK; c.lineWidth = w + 2.2; c.beginPath(); c.moveTo(sx, py + 31); c.lineTo(sx + lean, top); c.stroke();
    c.strokeStyle = g; c.lineWidth = w; c.beginPath(); c.moveTo(sx, py + 31); c.lineTo(sx + lean, top); c.stroke();
    c.strokeStyle = "rgba(20,50,30,.75)"; c.lineWidth = 1.5; c.beginPath(); for (let k = 1; k < 4; k++) { const yy = py + 31 - (31 - (top - py)) * k / 4; c.moveTo(sx - w / 2 - .5, yy); c.lineTo(sx + w / 2 + .5, yy); } c.stroke();
    if (hs(seed, i, 76) < 0.7) { c.fillStyle = g; c.strokeStyle = INK; c.lineWidth = 1.4; const ly = top + 5 + hs(seed, i, 77) * 8, d = hs(seed, i, 78) < .5 ? -1 : 1; c.beginPath(); c.moveTo(sx + lean, ly); c.quadraticCurveTo(sx + lean + d * 9, ly - 7, sx + lean + d * 15, ly - 2); c.quadraticCurveTo(sx + lean + d * 8, ly + 1, sx + lean, ly); c.fill(); c.stroke(); }
  }
}
function bush(c, px, py, seed, col, flowers) {
  c.lineJoin = "round"; c.fillStyle = "rgba(20,40,30,.2)"; c.beginPath(); c.ellipse(px + 16, py + 28, 13, 4, 0, 0, 7); c.fill();
  c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.moveTo(px + 4, py + 27); c.bezierCurveTo(px, py + 12, px + 12, py + 2, px + 17, py + 7); c.bezierCurveTo(px + 24, py + 1, px + 34, py + 12, px + 29, py + 27); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = "rgba(255,255,255,.25)"; c.lineWidth = 2; c.beginPath(); c.moveTo(px + 9, py + 14); c.quadraticCurveTo(px + 13, py + 8, px + 18, py + 10); c.stroke();
  c.strokeStyle = "rgba(20,60,30,.5)"; c.lineWidth = 1.3; c.beginPath(); c.moveTo(px + 12, py + 22); c.lineTo(px + 15, py + 17); c.moveTo(px + 21, py + 22); c.lineTo(px + 24, py + 16); c.stroke();
  if (flowers) { c.fillStyle = ["#f6b2c4", "#f5d36a", "#fff"][(hs(seed, 1, 79) * 3) | 0]; c.strokeStyle = INK; c.lineWidth = 1; [[11, 14], [21, 11], [25, 20]].forEach(p => { c.beginPath(); c.arc(px + p[0], py + p[1], 2.3, 0, 7); c.fill(); c.stroke(); }); }
}
function crystals(c, px, py, seed, col) {
  c.lineJoin = "round"; c.fillStyle = "rgba(0,0,20,.25)"; c.beginPath(); c.ellipse(px + 16, py + 29, 13, 4, 0, 0, 7); c.fill();
  const sp = [[8, 30, 5, 17, 16], [16, 31, 6, 26, 24], [24, 30, 5, 15, 14]];
  sp.forEach((s, i) => { const x = px + s[0], y = py + s[1], w = s[2], h = s[3]; c.fillStyle = i === 1 ? col : (i ? "#7fb9ee" : "#a2d4ff"); c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x - w, y); c.lineTo(x - w * .8, y - h * .65); c.lineTo(x, y - h - 4); c.lineTo(x + w * .8, y - h * .6); c.lineTo(x + w, y); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.moveTo(x - w * .5, y - 2); c.lineTo(x - w * .45, y - h * .6); c.lineTo(x - 1, y - h); c.lineTo(x - 1, y - 2); c.closePath(); c.fill(); });
}
function shroom(c, px, py, seed, big) {
  const cols = ["#d46aa8", "#8f6ad8", "#e8a05a", "#5aa8e0"];
  const n = big ? 3 : 2;
  for (let i = 0; i < n; i++) { const x = px + 7 + i * 9 + hs(seed, i, 61) * 3, h = 8 + hs(seed, i, 62) * 10, r = 6 + hs(seed, i, 63) * 4; const col = cols[(hs(seed, i, 64) * 4) | 0];
    c.fillStyle = "#efe6f3"; c.strokeStyle = INK; c.lineWidth = 1.8; c.fillRect(x - 1.8, py + 30 - h, 3.6, h); c.strokeRect(x - 1.8, py + 30 - h, 3.6, h);
    c.fillStyle = col; c.beginPath(); c.ellipse(x, py + 30 - h, r, r * .7, 0, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.arc(x - r * .35, py + 30 - h - r * .3, 1.4, 0, 7); c.arc(x + r * .3, py + 30 - h - r * .35, 1.1, 0, 7); c.fill(); }
}
function stalag(c, px, py, seed) {
  c.lineJoin = "round"; c.fillStyle = "rgba(0,0,20,.25)"; c.beginPath(); c.ellipse(px + 16, py + 29, 12, 4, 0, 0, 7); c.fill();
  c.fillStyle = "#9ea0b8"; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(px + 6, py + 30); c.lineTo(px + 13, py + 3); c.lineTo(px + 19, py + 16); c.lineTo(px + 23, py + 9); c.lineTo(px + 27, py + 30); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = "rgba(255,255,255,.3)"; c.beginPath(); c.moveTo(px + 11, py + 24); c.lineTo(px + 13, py + 8); c.lineTo(px + 15, py + 24); c.closePath(); c.fill();
  c.strokeStyle = "rgba(30,30,60,.5)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(px + 18, py + 22); c.lineTo(px + 22, py + 28); c.stroke();
}
function cloudpuff(c, px, py, seed, big) {
  c.lineJoin = "round"; if (!big) { c.fillStyle = "rgba(10,20,60,.2)"; c.beginPath(); c.ellipse(px + 16, py + 29, 13, 4, 0, 0, 7); c.fill(); }
  const P = [[9, 22, 7], [17, 17, 9], [25, 22, 7], [16, 24, 8]], F2 = col => { c.fillStyle = col; P.forEach(p => { c.beginPath(); c.arc(px + p[0], py + p[1], p[2], 0, 7); c.fill(); }); };
  c.fillStyle = INK; P.forEach(p => { c.beginPath(); c.arc(px + p[0], py + p[1], p[2] + 2, 0, 7); c.fill(); }); F2(big ? "rgba(235,240,255,.95)" : "#f4f7ff");
  c.fillStyle = "rgba(150,170,230,.45)"; c.beginPath(); c.ellipse(px + 16, py + 28, 11, 3.5, 0, 0, 7); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.arc(px + 14, py + 14, 3, 0, 7); c.fill();
}
function starstone(c, px, py, seed) {
  c.lineJoin = "round"; c.fillStyle = "rgba(10,20,60,.25)"; c.beginPath(); c.ellipse(px + 16, py + 29, 12, 4, 0, 0, 7); c.fill();
  c.fillStyle = "#8d93c4"; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(px + 8, py + 30); c.lineTo(px + 9, py + 8); c.quadraticCurveTo(px + 16, py + 1, px + 23, py + 8); c.lineTo(px + 24, py + 30); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = "#ffe27a"; sparkle(c, px + 16, py + 15, 5.5); c.strokeStyle = "rgba(20,20,70,.5)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(px + 11, py + 24); c.lineTo(px + 15, py + 26); c.moveTo(px + 18, py + 25); c.lineTo(px + 21, py + 22); c.stroke();
}
function moonbloom(c, px, py, seed) {
  c.lineJoin = c.lineCap = "round"; c.fillStyle = "rgba(10,20,60,.2)"; c.beginPath(); c.ellipse(px + 16, py + 29, 9, 3, 0, 0, 7); c.fill();
  [[10, 18], [16, 8], [22, 16]].forEach((p, i) => { c.strokeStyle = INK; c.lineWidth = 3.4; c.beginPath(); c.moveTo(px + 16 + (p[0] - 16) * .3, py + 30); c.quadraticCurveTo(px + p[0], py + 24, px + p[0], py + p[1] + 4); c.stroke(); c.strokeStyle = "#6fb08a"; c.lineWidth = 1.6; c.stroke();
    c.fillStyle = "#fff3b8"; c.strokeStyle = INK; c.lineWidth = 1.8; c.beginPath(); c.arc(px + p[0], py + p[1], 5, .6, Math.PI * 2 - .6); c.arc(px + p[0] + 2.4, py + p[1] - .6, 4, Math.PI * 2 - .9, .9, true); c.closePath(); c.fill(); c.stroke(); });
}
function spire(c, px, py, seed) {
  c.lineJoin = "round"; c.fillStyle = "rgba(10,10,40,.3)"; c.beginPath(); c.ellipse(px + 16, py + 29, 12, 4, 0, 0, 7); c.fill();
  c.fillStyle = "#5e5a86"; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(px + 6, py + 30); c.lineTo(px + 11, py + 8); c.lineTo(px + 15, py + 14); c.lineTo(px + 18, py - 2); c.lineTo(px + 23, py + 12); c.lineTo(px + 27, py + 30); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = "#ffe85a"; c.lineWidth = 1.8; c.beginPath(); c.moveTo(px + 18, py + 2); c.lineTo(px + 15, py + 12); c.lineTo(px + 19, py + 15); c.lineTo(px + 14, py + 26); c.stroke();
}
function coral(c, px, py, seed) {
  const col = ["#f27a8c", "#f5a05a", "#d86ab8", "#ff8f7a"][Math.abs(seed) % 4]; c.lineJoin = c.lineCap = "round";
  c.fillStyle = "rgba(10,40,70,.25)"; c.beginPath(); c.ellipse(px + 16, py + 29, 13, 4, 0, 0, 7); c.fill();
  const br = (x0, y0, x1, y1, x2, y2) => { for (const [w, st] of [[7, INK], [4.2, col]]) { c.strokeStyle = st; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke(); } };
  br(px + 16, py + 30, px + 14, py + 16, px + 9, py + 5); br(px + 15, py + 18, px + 22, py + 14, px + 25, py + 4); br(px + 16, py + 30, px + 22, py + 22, px + 28, py + 17); br(px + 12, py + 12, px + 7, py + 12, px + 4, py + 8);
  c.fillStyle = "rgba(255,255,255,.55)"; [[9, 5], [25, 4], [28, 17], [4, 8]].forEach(p => { c.beginPath(); c.arc(px + p[0], py + p[1], 1.6, 0, 7); c.fill(); });
}
function kelp(c, px, py, seed) {
  c.lineJoin = c.lineCap = "round"; c.fillStyle = "rgba(10,40,70,.2)"; c.beginPath(); c.ellipse(px + 16, py + 29, 11, 3.5, 0, 0, 7); c.fill();
  for (let i = 0; i < 3; i++) { const bx = px + 8 + i * 8, h = 22 + ((seed + i * 7) % 8), sw = (i - 1) * 3; for (const [w, st] of [[5.2, INK], [3, ["#3f9a62", "#56ae6c", "#2f8a58"][i]]]) { c.strokeStyle = st; c.lineWidth = w; c.beginPath(); c.moveTo(bx, py + 30); c.bezierCurveTo(bx - 6 + sw, py + 30 - h * .35, bx + 6 + sw, py + 30 - h * .7, bx + sw, py + 30 - h); c.stroke(); } }
}
function shellDeco(c, px, py, seed) {
  const col = ["#fbe3d4", "#f6c4cf", "#f7e2a2"][Math.abs(seed) % 3]; c.lineJoin = "round";
  c.fillStyle = "rgba(60,40,10,.22)"; c.beginPath(); c.ellipse(px + 16, py + 28, 13, 4, 0, 0, 7); c.fill();
  c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.moveTo(px + 16, py + 27); c.bezierCurveTo(px + 1, py + 22, px + 2, py + 6, px + 16, py + 5); c.bezierCurveTo(px + 30, py + 6, px + 31, py + 22, px + 16, py + 27); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = "rgba(120,70,50,.55)"; c.lineWidth = 1.3; c.beginPath(); for (let i = -2; i <= 2; i++) { c.moveTo(px + 16, py + 26); c.lineTo(px + 16 + i * 5.2, py + 8 + Math.abs(i) * 2); } c.stroke();
  c.fillStyle = "#f4f0ff"; c.strokeStyle = INK; c.lineWidth = 1.3; c.beginPath(); c.arc(px + 16, py + 22, 2.6, 0, 7); c.fill(); c.stroke();
}
function sandrock(c, px, py, seed) {
  c.lineJoin = "round"; c.fillStyle = "rgba(60,40,10,.22)"; c.beginPath(); c.ellipse(px + 16, py + 28, 13, 4, 0, 0, 7); c.fill();
  c.fillStyle = "#cbb68a"; c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.moveTo(px + 4, py + 28); c.quadraticCurveTo(px + 2, py + 12, px + 13, py + 8); c.quadraticCurveTo(px + 22, py + 4, px + 28, py + 14); c.quadraticCurveTo(px + 31, py + 22, px + 28, py + 28); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = "rgba(90,70,40,.5)"; c.lineWidth = 1.3; c.beginPath(); c.moveTo(px + 10, py + 14); c.lineTo(px + 14, py + 20); c.lineTo(px + 11, py + 26); c.moveTo(px + 21, py + 12); c.lineTo(px + 24, py + 19); c.stroke();
  c.fillStyle = "rgba(255,255,255,.3)"; c.beginPath(); c.ellipse(px + 12, py + 12, 4, 2, -.5, 0, 7); c.fill();
}
function anemone(c, px, py, seed) {
  const col = ["#c46af0", "#f06a9a", "#6ab8f0"][Math.abs(seed) % 3]; c.lineJoin = c.lineCap = "round";
  c.fillStyle = "rgba(10,40,70,.25)"; c.beginPath(); c.ellipse(px + 16, py + 29, 12, 4, 0, 0, 7); c.fill();
  for (let i = -3; i <= 3; i++) { for (const [w, st] of [[4.4, INK], [2.4, col]]) { c.strokeStyle = st; c.lineWidth = w; c.beginPath(); c.moveTo(px + 16 + i * 2, py + 26); c.quadraticCurveTo(px + 16 + i * 5, py + 14, px + 16 + i * 6.5, py + 8 + Math.abs(i) * 1.5); c.stroke(); } c.fillStyle = "#fff4c0"; c.beginPath(); c.arc(px + 16 + i * 6.5, py + 8 + Math.abs(i) * 1.5, 1.8, 0, 7); c.fill(); }
  c.fillStyle = "#e9b88a"; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.ellipse(px + 16, py + 26, 8, 4.5, 0, 0, 7); c.fill(); c.stroke();
}
function wreckBits(c, px, py, seed) {
  c.lineJoin = "round"; c.fillStyle = "rgba(10,20,40,.28)"; c.beginPath(); c.ellipse(px + 16, py + 29, 14, 4, 0, 0, 7); c.fill();
  if (seed % 2) { c.fillStyle = "#8a6444"; c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.moveTo(px + 6, py + 28); c.lineTo(px + 7, py + 12); c.quadraticCurveTo(px + 16, py + 7, px + 25, py + 12); c.lineTo(px + 26, py + 28); c.quadraticCurveTo(px + 16, py + 32, px + 6, py + 28); c.fill(); c.stroke(); c.strokeStyle = "#5a5a66"; c.lineWidth = 2.4; [14, 22].forEach(yy => { c.beginPath(); c.moveTo(px + 6.5, py + yy); c.quadraticCurveTo(px + 16, py + yy + 3, px + 26, py + yy); c.stroke(); }); }
  else { c.fillStyle = "#7a5a3c"; c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.rect(px + 4, py + 16, 24, 7); c.fill(); c.stroke(); c.save(); c.translate(px + 18, py + 12); c.rotate(-.35); c.beginPath(); c.rect(-12, -4, 24, 6); c.fill(); c.stroke(); c.restore(); c.strokeStyle = "#6a6a78"; c.lineWidth = 2.4; c.beginPath(); c.arc(px + 24, py + 10, 3.2, 0, 7); c.moveTo(px + 24, py + 13); c.lineTo(px + 24, py + 22); c.stroke(); }
  c.fillStyle = "rgba(90,180,140,.4)"; c.beginPath(); c.ellipse(px + 10, py + 24, 6, 3, 0, 0, 7); c.fill();
}
function paintChunk(gx, gy) {
  const cvs = document.createElement("canvas"); cvs.width = cvs.height = CH * TS * RS; const c = cvs.getContext("2d");
  c.scale(RS, RS); c.translate(-gx * CH * TS, -gy * CH * TS); c.lineJoin = c.lineCap = "round";
  const x0 = gx * CH, y0 = gy * CH, ok = (x, y) => x >= 0 && y >= 0 && x < WW && y < WH;
  // 1 Untergrund
  for (let y = y0 - 1; y <= y0 + CH; y++) for (let x = x0 - 1; x <= x0 + CH; x++) {
    if (!ok(x, y)) continue; const a = corner(x, y), b = corner(x + 1, y), d = corner(x + 1, y + 1), e = corner(x, y + 1);
    c.fillStyle = tcol(x, y); c.beginPath(); c.moveTo(a[0] - .6, a[1] - .6); c.lineTo(b[0] + .6, b[1] - .6); c.lineTo(d[0] + .6, d[1] + .6); c.lineTo(e[0] - .6, e[1] + .6); c.closePath(); c.fill();
  }
  // 2 Bodenstruktur: Aquarellflecken, Gras, Risse, Kiesel
  for (let y = y0 - 1; y <= y0 + CH; y++) for (let x = x0 - 1; x <= x0 + CH; x++) {
    if (!ok(x, y)) continue; const v = T[y][x], px = x * TS, py = y * TS, z = ZN[y][x], a1 = y < AREA_SPLIT, a3 = y >= AREA_SPLIT3 && y < AREA_SPLIT4, a4 = y >= AREA_SPLIT4;
    if (v === 0 || v === 5) continue;
    for (let k = 0; k < 2; k++) { c.fillStyle = hs(x, y, 80 + k) < .5 ? "rgba(255,255,255,.07)" : "rgba(20,30,60,.06)"; c.beginPath(); c.arc(px + hs(x, y, 82 + k) * 32, py + hs(x, y, 84 + k) * 32, 9 + hs(x, y, 86 + k) * 9, 0, 7); c.fill(); }
    if (v === 3) continue;
    if (a1 && v !== 2) { // Grasbüschel
      const gc = z === "dorf" ? "rgba(110,120,60,.55)" : "rgba(40,100,50,.62)"; c.strokeStyle = gc; c.lineWidth = 1.5; c.beginPath();
      const nb = z === "dorf" ? 2 : 6;
      for (let i = 0; i < nb; i++) { const bx = px + 3 + hs(x, y, 90 + i) * 26, by = py + 8 + hs(x, y, 100 + i) * 22; c.moveTo(bx, by); c.lineTo(bx - 2.5, by - 7); c.moveTo(bx, by); c.lineTo(bx + .5, by - 9); c.moveTo(bx, by); c.lineTo(bx + 3, by - 6); }
      c.stroke();
      if (hs(x, y, 110) < (z === "wiese" || z === "wind" ? .16 : .06)) { const fx = px + 6 + hs(x, y, 111) * 20, fy = py + 10 + hs(x, y, 112) * 16; c.fillStyle = ["#fff6d8", "#f8b4c8", "#f6d760", "#c9b4f0"][(hs(x, y, 113) * 4) | 0]; c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.arc(fx, fy, 2.7, 0, 7); c.fill(); c.stroke(); c.strokeStyle = "#3c7a3a"; c.beginPath(); c.moveTo(fx, fy + 2.7); c.lineTo(fx, fy + 8); c.stroke(); }
    } else if (a1) { // Weg: Kiesel
      c.fillStyle = "rgba(120,100,60,.45)"; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(px + 4 + hs(x, y, 120 + i) * 24, py + 5 + hs(x, y, 125 + i) * 22, 2 + hs(x, y, 130 + i) * 1.5, 1.4, 0, 0, 7); c.fill(); }
    } else if (a4) { // Meeresboden: Sandwellen, Muscheln, Blasen
      c.strokeStyle = z === "tiefe" ? "rgba(20,40,110,.35)" : "rgba(120,90,50,.32)"; c.lineWidth = 1.5;
      if (hs(x, y, 140) < .55) { const cx0 = px + 3 + hs(x, y, 141) * 10, cy0 = py + 8 + hs(x, y, 142) * 16; c.beginPath(); c.moveTo(cx0, cy0); c.quadraticCurveTo(cx0 + 6, cy0 - 4, cx0 + 12, cy0); c.quadraticCurveTo(cx0 + 18, cy0 + 4, cx0 + 24, cy0); c.stroke(); }
      if (hs(x, y, 143) < .16) { const sx = px + 5 + hs(x, y, 144) * 22, sy = py + 6 + hs(x, y, 145) * 20; c.fillStyle = ["#fff3e6", "#f6b8c4", "#f5dc9a"][(hs(x, y, 146) * 3) | 0]; c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.arc(sx, sy, 2.6, Math.PI, 0); c.lineTo(sx + 2.6, sy + 1.5); c.lineTo(sx - 2.6, sy + 1.5); c.closePath(); c.fill(); c.stroke(); }
      if (hs(x, y, 147) < .1 && z !== "strand") { c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 1; c.fillStyle = "rgba(255,255,255,.25)"; for (let k = 0; k < 2; k++) { c.beginPath(); c.arc(px + 6 + hs(x, y, 148 + k) * 20, py + 6 + hs(x, y, 150 + k) * 20, 2 + k, 0, 7); c.fill(); c.stroke(); } }
    } else if (a3) { // Himmelsboden: Wolkenschlieren und Sternfunken
      c.strokeStyle = v === 2 ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.5)"; c.lineWidth = 1.6; if (hs(x, y, 140) < .4) { const cx0 = px + 4 + hs(x, y, 141) * 12, cy0 = py + 8 + hs(x, y, 142) * 16; c.beginPath(); c.moveTo(cx0, cy0); c.quadraticCurveTo(cx0 + 6, cy0 - 4, cx0 + 12, cy0); c.quadraticCurveTo(cx0 + 16, cy0 + 3, cx0 + 20, cy0 - 1); c.stroke(); }
      if (hs(x, y, 143) < .3) { c.fillStyle = "rgba(255,238,160,.85)"; sparkle(c, px + 3 + hs(x, y, 144) * 26, py + 3 + hs(x, y, 145) * 26, 2 + hs(x, y, 149) * 1.6); }
      if (hs(x, y, 146) < .18) { c.fillStyle = "rgba(120,130,200,.35)"; c.beginPath(); c.ellipse(px + 6 + hs(x, y, 147) * 20, py + 22 + hs(x, y, 148) * 6, 4, 2, 0, 0, 7); c.fill(); }
    } else { // Höhlenboden: Risse, Funkeln
      c.strokeStyle = "rgba(40,40,90,.35)"; c.lineWidth = 1.3; if (hs(x, y, 140) < .45) { const cx0 = px + 5 + hs(x, y, 141) * 18, cy0 = py + 6 + hs(x, y, 142) * 18; c.beginPath(); c.moveTo(cx0, cy0); c.lineTo(cx0 + 5, cy0 + 3); c.lineTo(cx0 + 4, cy0 + 8); c.lineTo(cx0 + 10, cy0 + 10); c.stroke(); }
      if (hs(x, y, 143) < .5) { c.fillStyle = "rgba(255,255,255,.4)"; c.beginPath(); c.arc(px + hs(x, y, 144) * 30, py + hs(x, y, 145) * 30, 1.6, 0, 7); c.fill(); }
      if (hs(x, y, 146) < .25) { c.fillStyle = "rgba(90,90,140,.45)"; c.beginPath(); c.ellipse(px + 6 + hs(x, y, 147) * 20, py + 22 + hs(x, y, 148) * 6, 3, 2, 0, 0, 7); c.fill(); }
    }
  }
  // 2b Wegrand: weiche Kante und Randsteine, wo Weg an Gras grenzt
  for (let y = y0 - 1; y <= y0 + CH; y++) for (let x = x0 - 1; x <= x0 + CH; x++) {
    if (!ok(x, y) || y >= AREA_SPLIT || T[y][x] !== 2) continue; const px = x * TS, py = y * TS;
    for (const [dx, dy, gx1, gy1, gx2, gy2, rx, ry, rw, rh] of [[0, -1, 0, py, 0, py + 9, px, py, TS, 9], [0, 1, 0, py + TS, 0, py + TS - 9, px, py + TS - 9, TS, 9], [-1, 0, px, 0, px + 9, 0, px, py, 9, TS], [1, 0, px + TS, 0, px + TS - 9, 0, px + TS - 9, py, 9, TS]]) {
      const nv = T[y + dy] ? T[y + dy][x + dx] : 0; if (nv !== 1) continue;
      const g = c.createLinearGradient(gx1, gy1, gx2, gy2); g.addColorStop(0, "rgba(90,70,30,.28)"); g.addColorStop(1, "rgba(90,70,30,0)"); c.fillStyle = g; c.fillRect(rx, ry, rw, rh);
      if (hs(x, y, 170 + dx * 3 + dy) < .45) { const sx = dx ? (dx > 0 ? px + TS - 3 : px + 3) : px + 6 + hs(x, y, 171) * 20, sy = dy ? (dy > 0 ? py + TS - 3 : py + 3) : py + 6 + hs(x, y, 172) * 20; c.fillStyle = "#b9ad8c"; c.strokeStyle = "rgba(29,39,66,.55)"; c.lineWidth = 1; c.beginPath(); c.ellipse(sx, sy, 3.2, 2.4, 0, 0, 7); c.fill(); c.stroke(); }
    }
  }
  // 3 Innenschatten an Wänden
  for (let y = y0 - 1; y <= y0 + CH; y++) for (let x = x0 - 1; x <= x0 + CH; x++) {
    if (!ok(x, y) || cls(x, y) !== 1) continue; const px = x * TS, py = y * TS, sh = (x1, y1, w, h, gx1, gy1, gx2, gy2) => { const g = c.createLinearGradient(gx1, gy1, gx2, gy2); g.addColorStop(0, "rgba(10,20,40,.28)"); g.addColorStop(1, "rgba(10,20,40,0)"); c.fillStyle = g; c.fillRect(x1, y1, w, h); };
    if (cls(x, y - 1) === 0) sh(px, py, TS, 12, 0, py, 0, py + 12); if (cls(x - 1, y) === 0) sh(px, py, 10, TS, px, 0, px + 10, 0); if (cls(x + 1, y) === 0) sh(px + TS - 10, py, 10, TS, px + TS, 0, px + TS - 10, 0); if (cls(x, y + 1) === 0) sh(px, py + TS - 8, TS, 8, 0, py + TS, 0, py + TS - 8);
  }
  // 4 Tintenkanten
  for (let y = y0 - 1; y <= y0 + CH; y++) for (let x = x0 - 1; x <= x0 + CH; x++) {
    if (!ok(x, y)) continue; c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath();
    const A = corner(x, y), B = corner(x + 1, y), D = corner(x + 1, y + 1), E = corner(x, y + 1);
    if (cls(x, y) !== cls(x, y - 1)) wob(c, A[0], A[1], B[0], B[1], 5); if (cls(x, y) !== cls(x, y + 1)) wob(c, E[0], E[1], D[0], D[1], 6);
    if (cls(x, y) !== cls(x - 1, y)) wob(c, A[0], A[1], E[0], E[1], 7); if (cls(x, y) !== cls(x + 1, y)) wob(c, B[0], B[1], D[0], D[1], 8);
    c.globalAlpha = .88; c.stroke(); c.globalAlpha = 1;
  }
  // 5 Wände und Deko, von oben nach unten
  for (let y = y0 - 1; y <= y0 + CH + 1; y++) for (let x = x0 - 1; x <= x0 + CH; x++) {
    if (!ok(x, y)) continue; const v = T[y][x], px = x * TS, py = y * TS, z = ZN[y][x], a1 = y < AREA_SPLIT, a3 = y >= AREA_SPLIT3 && y < AREA_SPLIT4, a4 = y >= AREA_SPLIT4;
    if (v === 0 || v === 5) {
      if (a1) { const open = cls(x, y + 1) === 1 || cls(x, y - 1) === 1; c.strokeStyle = "rgba(10,40,20,.35)"; c.lineWidth = 1.4; c.beginPath(); for (let i = 0; i < 3; i++) { const sx = px + 4 + hs(x, y, 30 + i) * 24, sy = py + 4 + hs(x, y, 40 + i) * 24; c.moveTo(sx, sy); c.lineTo(sx + 5, sy + 6); } c.stroke(); bamboo(c, px, py, x * 131 + y, open ? 5 : 4, open ? 36 : 30); }
      else if (a4) { c.strokeStyle = "rgba(6,20,40,.5)"; c.lineWidth = 1.4; c.beginPath(); for (let i = 0; i < 3; i++) { const sx = px + 3 + hs(x, y, 30 + i) * 24, sy = py + 3 + hs(x, y, 40 + i) * 22; c.moveTo(sx, sy); c.quadraticCurveTo(sx + 6, sy + 2, sx + 5, sy + 9); } c.stroke();
        if (hs(x, y, 150) < .32) { c.fillStyle = ["rgba(240,120,140,.55)", "rgba(245,170,90,.5)", "rgba(190,110,210,.5)"][(hs(x, y, 155) * 3) | 0]; c.beginPath(); c.arc(px + 6 + hs(x, y, 151) * 20, py + 8 + hs(x, y, 152) * 16, 2.4 + hs(x, y, 153) * 2.4, 0, 7); c.fill(); }
        if (hs(x, y, 154) < .1) { c.strokeStyle = "rgba(210,240,255,.55)"; c.lineWidth = 1.1; c.beginPath(); c.arc(px + 8 + hs(x, y, 156) * 16, py + 6 + hs(x, y, 157) * 16, 2.6, 0, 7); c.stroke(); } }
      else if (z && ZINFO[z] && ZINFO[z].a === 3 || y >= AREA_SPLIT3) { c.strokeStyle = "rgba(10,14,50,.55)"; c.lineWidth = 1.4; c.beginPath(); for (let i = 0; i < 4; i++) { const sx = px + 3 + hs(x, y, 30 + i) * 24, sy = py + 3 + hs(x, y, 40 + i) * 22; c.moveTo(sx, sy); c.lineTo(sx + 6, sy + 8); } c.stroke();
        if (hs(x, y, 150) < .5) { c.fillStyle = "rgba(255,244,190,.85)"; sparkle(c, px + 4 + hs(x, y, 151) * 24, py + 4 + hs(x, y, 152) * 24, 1.6 + hs(x, y, 153) * 1.6); }
        if (hs(x, y, 154) < .12) cloudpuff(c, px, py - 4, x * 3 + y, true); }
      else { c.strokeStyle = "rgba(10,8,30,.5)"; c.lineWidth = 1.4; c.beginPath(); for (let i = 0; i < 4; i++) { const sx = px + 3 + hs(x, y, 30 + i) * 24, sy = py + 3 + hs(x, y, 40 + i) * 22; c.moveTo(sx, sy); c.lineTo(sx + 6, sy + 8); } c.stroke();
        if (hs(x, y, 150) < .25) { c.strokeStyle = "rgba(140,130,200,.35)"; c.lineWidth = 1.3; c.beginPath(); const sx = px + 6 + hs(x, y, 151) * 16, sy = py + 8 + hs(x, y, 152) * 14; c.moveTo(sx, sy); c.lineTo(sx + 6, sy + 4); c.lineTo(sx + 5, sy + 10); c.stroke(); } }
    } else if (v === 4) {
      c.fillStyle = a3 ? "rgba(20,24,70,.22)" : a1 ? "rgba(10,40,20,.25)" : "rgba(10,10,40,.3)"; c.beginPath(); c.ellipse(px + 16, py + 28, 14, 5, 0, 0, 7); c.fill();
      if (a1) { const r = hs(x, y, 9); if (r < .5) bamboo(c, px, py, x * 17 + y * 3, 6, 34); else bush(c, px, py, x * 7 + y, z === "wald" ? "#4f9150" : z === "wind" ? "#8cc468" : "#68ad5a", z !== "wald"); }
      else if (a4) { const r = hs(x, y, 9), sd = x * 5 + y; if (z === "strand") (r < .45 ? shellDeco(c, px, py, sd) : r < .8 ? sandrock(c, px, py, sd) : kelp(c, px, py, sd)); else if (z === "koralle") (r < .55 ? coral(c, px, py, sd) : r < .8 ? anemone(c, px, py, sd) : kelp(c, px, py, sd)); else if (z === "gezeit") (r < .4 ? shellDeco(c, px, py, sd) : r < .7 ? kelp(c, px, py, sd) : coral(c, px, py, sd)); else if (z === "wrack") (r < .6 ? wreckBits(c, px, py, sd) : r < .85 ? kelp(c, px, py, sd) : sandrock(c, px, py, sd)); else crystals(c, px, py, sd, r < .5 ? "#58d6f0" : "#8f86ff"); }
      else if (a3) { const r = hs(x, y, 9); if (z === "wolke") cloudpuff(c, px, py, x * 5 + y); else if (z === "sternwarte") (r < .5 ? starstone(c, px, py, x * 5 + y) : cloudpuff(c, px, py, x * 5 + y)); else if (z === "mondsee") moonbloom(c, px, py, x * 5 + y); else if (z === "gewitter") spire(c, px, py, x * 5 + y); else crystals(c, px, py, x * 5 + y, r < .5 ? "#6fe8c0" : "#e48ad8"); }
      else if (z === "pilz") shroom(c, px, py, x * 5 + y, true);
      else if (z === "saal" || z === "becken") crystals(c, px, py, x * 5 + y, hs(x, y, 5) < .5 ? "#8fd2ff" : "#c9a8ff");
      else stalag(c, px, py, x * 5 + y);
    } else if (v === 1 && z === "pilz" && hs(x, y, 160) < .1) shroom(c, px, py, x * 3 + y, false);
  }
  c.fillStyle = "rgba(60,50,30,.05)"; for (let i = 0; i < 120; i++) c.fillRect(gx * CH * TS + hs(gx, gy, 50 + i) * CH * TS, gy * CH * TS + hs(gx, gy, 200 + i) * CH * TS, 1.5, 1.5);
  return cvs;
}
function getChunk(gx, gy) {
  const k = gx + "," + gy; let ch = chunks.get(k);
  if (ch) { chunks.delete(k); chunks.set(k, ch); return ch; }
  ch = paintChunk(gx, gy); chunks.set(k, ch);
  if (chunks.size > 44) chunks.delete(chunks.keys().next().value);
  return ch;
}

/* ----- Tonling-Zeichnung ----- */
const hexA = (h, a) => "rgba(" + [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(",") + "," + a + ")";
function sparkle(c, x, y, r) { c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r * .8, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r * .8, y); c.quadraticCurveTo(x, y, x, y - r); c.closePath(); c.fill(); }
function emblem(c, rr, x, y, u, col, t) {
  c.fillStyle = hexA(col, .55); c.strokeStyle = INK; c.lineWidth = Math.max(1.4, u * .22); c.beginPath();
  if (rr === 2) { c.moveTo(x, y - u); c.lineTo(x + u * .8, y); c.lineTo(x, y + u); c.lineTo(x - u * .8, y); c.closePath(); }
  else if (rr === 3) { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? u * .45 : u * 1.1; i ? c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : c.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); }
  else if (rr >= 5) { for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12 - t * .8, q = i % 2 ? u * .7 : u * 1.45; i ? c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : c.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#fff"; c.beginPath(); c.arc(x, y, u * .38, 0, 7); c.fill(); c.stroke(); return; }
  else { for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8 + t * .6, q = i % 2 ? u * .62 : u * 1.2; i ? c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : c.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); }
  c.fill(); c.stroke();
}
/* ----- Höhlen-Tonlinge (Bereich 2): eigene Körperformen, keine Pilzkappen ----- */
const FS = (c, col) => { c.fillStyle = col; c.fill(); c.stroke(); };
function cEye(c, x, y, r, bl, s) { const lw = c.lineWidth; c.lineWidth = Math.max(1.3, s * .03); c.fillStyle = "#fff"; c.beginPath(); c.ellipse(x, y, r, r * bl, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = INK; c.beginPath(); c.ellipse(x + r * .15, y + r * .05, r * .52, r * .62 * bl, 0, 0, 7); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.arc(x - r * .12, y - r * .22 * bl, r * .18, 0, 7); c.fill(); c.lineWidth = lw; }
function cBlush(c, x, y, s, a) { c.fillStyle = "rgba(255,120,120," + (a || .35) + ")"; c.beginPath(); c.arc(x, y, s * .045, 0, 7); c.fill(); }
const FORMS = {
  kiesel(c, s, sp, t, bc, bl) { // Kieselstein mit einem großen Auge und Moos
    c.fillStyle = bc; [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * s * .17, s * .6, s * .1, s * .06, 0, 0, 7); FS(c, bc); });
    c.beginPath(); c.moveTo(-.4 * s, .3 * s); c.quadraticCurveTo(-.5 * s, -.05 * s, -.2 * s, -.1 * s); c.quadraticCurveTo(0, -.2 * s, .22 * s, -.08 * s); c.quadraticCurveTo(.5 * s, 0, .42 * s, .32 * s); c.quadraticCurveTo(.3 * s, .62 * s, 0, .62 * s); c.quadraticCurveTo(-.3 * s, .62 * s, -.4 * s, .3 * s); c.closePath(); FS(c, bc);
    c.strokeStyle = "rgba(60,60,80,.4)"; c.lineWidth = s * .025; c.beginPath(); c.moveTo(-.3 * s, .02 * s); c.lineTo(-.22 * s, .12 * s); c.lineTo(-.28 * s, .2 * s); c.moveTo(.3 * s, .4 * s); c.lineTo(.22 * s, .46 * s); c.lineTo(.27 * s, .54 * s); c.stroke(); c.strokeStyle = INK;
    c.lineWidth = Math.max(1.6, s * .045); c.fillStyle = "#7fb36a"; [[-.14, -.1, .08], [.02, -.15, .1], [.17, -.08, .07]].forEach(p => { c.beginPath(); c.arc(p[0] * s, p[1] * s, p[2] * s, 0, 7); c.fill(); c.stroke(); });
    cEye(c, 0, .24 * s, s * .15, bl, s); c.beginPath(); c.moveTo(-.07 * s, .46 * s); c.quadraticCurveTo(0, .5 * s, .07 * s, .46 * s); c.stroke(); cBlush(c, -.27 * s, .38 * s, s); cBlush(c, .27 * s, .38 * s, s);
  },
  tropfi(c, s, sp, t, bc, bl) { // Tropfwurm: Ringelkörper mit Tropfen-Fühlern
    const seg = [[-.36, .5, .13], [-.17, .46, .15], [.03, .44, .17]];
    seg.forEach((g, i) => { const w = Math.sin(t * 4 + i) * s * .03; c.beginPath(); c.ellipse(g[0] * s, g[1] * s + w, g[2] * s, g[2] * s * .95, 0, 0, 7); FS(c, i % 2 ? sp.capc : bc); });
    c.beginPath(); c.ellipse(.17 * s, .24 * s, .26 * s, .27 * s, 0, 0, 7); FS(c, bc);
    c.strokeStyle = INK; [-1, 1].forEach(d => { const bx = .17 * s + d * .1 * s, sw = Math.sin(t * 3 + d) * s * .03; c.beginPath(); c.moveTo(bx, -.02 * s); c.quadraticCurveTo(bx + d * .12 * s, -.22 * s, bx + d * .2 * s + sw, -.26 * s); c.stroke(); c.beginPath(); c.moveTo(bx + d * .2 * s + sw, -.4 * s); c.quadraticCurveTo(bx + d * .27 * s + sw, -.3 * s, bx + d * .2 * s + sw, -.24 * s); c.quadraticCurveTo(bx + d * .13 * s + sw, -.3 * s, bx + d * .2 * s + sw, -.4 * s); FS(c, sp.capc); });
    cEye(c, .08 * s, .22 * s, s * .08, bl, s); cEye(c, .27 * s, .22 * s, s * .08, bl, s); c.beginPath(); c.moveTo(.13 * s, .36 * s); c.quadraticCurveTo(.17 * s, .4 * s, .22 * s, .36 * s); c.stroke(); cBlush(c, .02 * s, .33 * s, s); cBlush(c, .34 * s, .33 * s, s);
  },
  funzel(c, s, sp, t, bc, bl) { // Funzel: flauschige Fledermaus
    const fl = Math.sin(t * 5) * .06;
    [-1, 1].forEach(d => { c.beginPath(); c.moveTo(d * .3 * s, .15 * s); c.quadraticCurveTo(d * .55 * s, (.0 + fl) * s, d * .68 * s, (.12 + fl) * s); c.quadraticCurveTo(d * .6 * s, .2 * s, d * .62 * s, .3 * s); c.quadraticCurveTo(d * .5 * s, .26 * s, d * .46 * s, .36 * s); c.quadraticCurveTo(d * .38 * s, .3 * s, d * .32 * s, .4 * s); c.closePath(); FS(c, sp.capc); });
    [-1, 1].forEach(d => { c.beginPath(); c.moveTo(d * .1 * s, -.02 * s); c.lineTo(d * .3 * s, -.5 * s); c.lineTo(d * .36 * s, .02 * s); c.closePath(); FS(c, bc); c.fillStyle = "rgba(240,150,170,.7)"; c.beginPath(); c.moveTo(d * .17 * s, -.03 * s); c.lineTo(d * .29 * s, -.34 * s); c.lineTo(d * .31 * s, -.01 * s); c.closePath(); c.fill(); });
    c.beginPath(); c.ellipse(0, .25 * s, .34 * s, .36 * s, 0, 0, 7); FS(c, bc);
    c.strokeStyle = "rgba(90,70,120,.45)"; c.lineWidth = s * .025; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * s * .06, .5 * s); c.lineTo(i * s * .08, .58 * s); c.stroke(); } c.strokeStyle = INK; c.lineWidth = Math.max(1.6, s * .045);
    cEye(c, -.13 * s, .2 * s, s * .1, bl, s); cEye(c, .13 * s, .2 * s, s * .1, bl, s);
    c.fillStyle = "#fff"; c.beginPath(); c.moveTo(-.04 * s, .37 * s); c.lineTo(0, .46 * s); c.lineTo(.04 * s, .37 * s); c.closePath(); c.fill(); c.stroke(); cBlush(c, -.24 * s, .34 * s, s); cBlush(c, .24 * s, .34 * s, s);
    [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * .12 * s, .62 * s, .08 * s, .05 * s, 0, 0, 7); FS(c, bc); });
  },
  schlurf(c, s, sp, t, bc, bl) { // Schlurf: Höhlenkäfer
    c.strokeStyle = INK; c.lineWidth = Math.max(2.4, s * .06); [-1, 1].forEach(d => [0, 1, 2].forEach(k => { c.beginPath(); c.moveTo(d * .34 * s, (.28 + k * .1) * s); c.quadraticCurveTo(d * .5 * s, (.3 + k * .12) * s, d * .56 * s, (.46 + k * .1 + Math.sin(t * 6 + k + d) * .02) * s); c.stroke(); }));
    c.lineWidth = Math.max(1.8, s * .05); [-1, 1].forEach(d => { c.beginPath(); c.moveTo(d * .08 * s, -.12 * s); c.quadraticCurveTo(d * .2 * s, -.4 * s, d * .34 * s, -.38 * s + Math.sin(t * 4 + d) * s * .02); c.stroke(); c.fillStyle = sp.capc; c.beginPath(); c.arc(d * .34 * s, -.38 * s + Math.sin(t * 4 + d) * s * .02, s * .045, 0, 7); c.fill(); c.stroke(); });
    c.lineWidth = Math.max(2, s * .06); c.beginPath(); c.ellipse(0, .4 * s, .42 * s, .3 * s, 0, 0, 7); FS(c, sp.capc);
    c.strokeStyle = "rgba(30,15,50,.5)"; c.lineWidth = s * .03; c.beginPath(); c.moveTo(0, .12 * s); c.lineTo(0, .7 * s); c.stroke(); c.fillStyle = "rgba(255,255,255,.3)"; [[-.2, .35], [.2, .35], [-.2, .52], [.2, .52]].forEach(p => { c.beginPath(); c.arc(p[0] * s, p[1] * s, s * .05, 0, 7); c.fill(); }); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    c.beginPath(); c.ellipse(0, .06 * s, .26 * s, .22 * s, 0, 0, 7); FS(c, bc);
    cEye(c, -.1 * s, .04 * s, s * .08, bl, s); cEye(c, .1 * s, .04 * s, s * .08, bl, s); c.beginPath(); c.moveTo(-.05 * s, .16 * s); c.quadraticCurveTo(0, .2 * s, .05 * s, .16 * s); c.stroke();
  },
  glimmling(c, s, sp, t, bc, bl) { // Glimmling: Igel mit Kristallstacheln
    for (let i = -3; i <= 3; i++) { const a = -Math.PI / 2 + i * .46, r0 = .34, r1 = .62 + (i % 2 ? .0 : .1), bx = Math.cos(a) * r0 * s, by = (.24 + Math.sin(a) * r0 * .95) * s, tx = Math.cos(a) * r1 * s, ty = (.24 + Math.sin(a) * r1 * .95) * s, nx = -Math.sin(a) * .07 * s, ny = Math.cos(a) * .07 * s;
      c.beginPath(); c.moveTo(bx - nx, by - ny); c.lineTo(tx, ty); c.lineTo(bx + nx, by + ny); c.closePath(); FS(c, sp.capc); c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.moveTo(bx - nx, by - ny); c.lineTo(tx, ty); c.lineTo(bx, by); c.closePath(); c.fill(); }
    c.beginPath(); c.ellipse(0, .3 * s, .4 * s, .34 * s, 0, 0, 7); FS(c, bc);
    c.beginPath(); c.ellipse(0, .38 * s, .24 * s, .2 * s, 0, 0, 7); FS(c, "#f6efe2");
    cEye(c, -.12 * s, .27 * s, s * .08, bl, s); cEye(c, .12 * s, .27 * s, s * .08, bl, s); c.fillStyle = INK; c.beginPath(); c.ellipse(0, .38 * s, s * .04, s * .03, 0, 0, 7); c.fill(); cBlush(c, -.22 * s, .4 * s, s); cBlush(c, .22 * s, .4 * s, s);
    [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * .18 * s, .62 * s, .09 * s, .05 * s, 0, 0, 7); FS(c, bc); });
  },
  echolot(c, s, sp, t, bc, bl) { // Echolot: Falter, der Echos aussendet
    const fl = .85 + .15 * Math.sin(t * 6);
    [-1, 1].forEach(d => { c.save(); c.translate(d * .1 * s, .18 * s); c.scale(d * fl, 1);
      c.beginPath(); c.ellipse(.3 * s, -.04 * s, .3 * s, .38 * s, -.35, 0, 7); FS(c, sp.capc); c.beginPath(); c.ellipse(.22 * s, .3 * s, .2 * s, .2 * s, .3, 0, 7); FS(c, sp.capc);
      c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.arc(.34 * s, -.1 * s, s * .09, 0, 7); c.fill(); c.fillStyle = "rgba(40,30,90,.5)"; c.beginPath(); c.arc(.34 * s, -.1 * s, s * .04, 0, 7); c.fill(); c.restore(); });
    c.beginPath(); c.ellipse(0, .3 * s, .17 * s, .3 * s, 0, 0, 7); FS(c, bc);
    c.beginPath(); c.ellipse(0, .0, .2 * s, .18 * s, 0, 0, 7); FS(c, bc);
    c.lineWidth = Math.max(1.6, s * .04); [-1, 1].forEach(d => { c.beginPath(); c.moveTo(d * .07 * s, -.14 * s); c.quadraticCurveTo(d * .2 * s, -.4 * s, d * .3 * s, -.38 * s); c.stroke(); for (let k = 0; k < 3; k++) { const px = d * (.13 + k * .05) * s, py = (-.26 - k * .04) * s; c.beginPath(); c.moveTo(px, py); c.lineTo(px + d * .05 * s, py - .06 * s); c.stroke(); } });
    cEye(c, -.08 * s, .0, s * .07, bl, s); cEye(c, .08 * s, .0, s * .07, bl, s);
    c.strokeStyle = hexA(sp.capc, .7); c.lineWidth = Math.max(1.6, s * .035); for (let k = 0; k < 2; k++) { const ph = ((t * .9 + k * .5) % 1); c.globalAlpha = (1 - ph) * .8; c.beginPath(); c.arc(0, -.05 * s, s * (.3 + ph * .35), -Math.PI * .85, -Math.PI * .15); c.stroke(); } c.globalAlpha = 1; c.strokeStyle = INK;
  },
  stalagnuss(c, s, sp, t, bc, bl) { // Stalagnuss: Gürteltier mit Steinpanzer
    [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * .24 * s, .62 * s, .1 * s, .06 * s, 0, 0, 7); FS(c, bc); });
    [-1, 0, 1].forEach(d => { c.beginPath(); c.moveTo(d * .18 * s - .06 * s, -.04 * s); c.lineTo(d * .18 * s, (-.3 - (d ? 0 : .1)) * s); c.lineTo(d * .18 * s + .06 * s, -.04 * s); c.closePath(); FS(c, "#b79b78"); });
    c.beginPath(); c.ellipse(0, .2 * s, .46 * s, .4 * s, 0, Math.PI, 0); c.lineTo(.46 * s, .3 * s); c.quadraticCurveTo(.4 * s, .55 * s, 0, .56 * s); c.quadraticCurveTo(-.4 * s, .55 * s, -.46 * s, .3 * s); c.closePath(); FS(c, sp.capc);
    c.strokeStyle = "rgba(40,25,10,.55)"; c.lineWidth = s * .035; [.0, .13, .26].forEach((y, i) => { c.beginPath(); c.moveTo((-.44 + i * .03) * s, (.14 + y) * s); c.quadraticCurveTo(0, (.04 + y) * s, (.44 - i * .03) * s, (.14 + y) * s); c.stroke(); }); c.strokeStyle = INK;
    c.lineWidth = Math.max(2, s * .06); c.beginPath(); c.ellipse(0, .46 * s, .27 * s, .2 * s, 0, 0, 7); FS(c, bc);
    cEye(c, -.1 * s, .43 * s, s * .065, bl, s); cEye(c, .1 * s, .43 * s, s * .065, bl, s); c.fillStyle = INK; c.beginPath(); c.ellipse(0, .53 * s, s * .035, s * .025, 0, 0, 7); c.fill();
    [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * .24 * s, .32 * s, .06 * s, .08 * s, 0, 0, 7); FS(c, bc); });
  },
  kristallo(c, s, sp, t, bc, bl) { // Kristallo: schwebender Kristall-Golem
    const fy = Math.sin(t * 2.4) * s * .03; c.save(); c.translate(0, fy);
    [-1, 1].forEach(d => { const hx = d * (.56 + Math.sin(t * 2 + d) * .02) * s, hy = .24 * s; c.beginPath(); c.moveTo(hx, hy - .13 * s); c.lineTo(hx + .09 * s, hy); c.lineTo(hx, hy + .13 * s); c.lineTo(hx - .09 * s, hy); c.closePath(); FS(c, sp.capc); });
    const P = [[0, -.4], [.3, -.12], [.3, .4], [0, .62], [-.3, .4], [-.3, -.12]];
    c.beginPath(); P.forEach((p, i) => i ? c.lineTo(p[0] * s, p[1] * s) : c.moveTo(p[0] * s, p[1] * s)); c.closePath(); FS(c, bc);
    c.fillStyle = hexA(sp.capc, .35); c.beginPath(); c.moveTo(0, -.4 * s); c.lineTo(.3 * s, -.12 * s); c.lineTo(.3 * s, .4 * s); c.lineTo(0, .62 * s); c.lineTo(0, .12 * s); c.closePath(); c.fill();
    c.fillStyle = "rgba(255,255,255,.5)"; c.beginPath(); c.moveTo(0, -.4 * s); c.lineTo(-.3 * s, -.12 * s); c.lineTo(-.14 * s, -.06 * s); c.lineTo(0, -.2 * s); c.closePath(); c.fill();
    c.lineWidth = Math.max(1.4, s * .03); c.strokeStyle = "rgba(20,40,90,.5)"; c.beginPath(); c.moveTo(0, .12 * s); c.lineTo(-.3 * s, -.12 * s); c.moveTo(0, .12 * s); c.lineTo(0, -.4 * s); c.moveTo(0, .12 * s); c.lineTo(0, .62 * s); c.stroke(); c.strokeStyle = INK;
    [-1, 1].forEach(d => { c.fillStyle = hexA(sp.capc, .9); c.beginPath(); c.moveTo(d * .16 * s, .18 * s); c.lineTo(d * .24 * s, .24 * s); c.lineTo(d * .16 * s, .32 * s); c.lineTo(d * .08 * s, .24 * s); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#fff"; c.beginPath(); c.arc(d * .16 * s, .23 * s, s * .02, 0, 7); c.fill(); });
    c.restore();
  },
  dunkelwisp(c, s, sp, t, bc, bl) { // Dunkelwisp: Irrlicht aus dunkler Flamme
    const w = Math.sin(t * 3) * .05, w2 = Math.sin(t * 4 + 1) * .05;
    c.beginPath(); c.moveTo((.02 + w) * s, -.62 * s); c.quadraticCurveTo(.2 * s, -.3 * s, .38 * s, .1 * s); c.quadraticCurveTo(.46 * s, .4 * s, .3 * s, .56 * s); c.lineTo((.22 + w2) * s, .72 * s); c.lineTo(.12 * s, .58 * s); c.lineTo((.0 - w) * s, .76 * s); c.lineTo(-.12 * s, .58 * s); c.lineTo((-.22 - w2) * s, .72 * s); c.lineTo(-.3 * s, .56 * s); c.quadraticCurveTo(-.46 * s, .4 * s, -.38 * s, .1 * s); c.quadraticCurveTo(-.18 * s, -.3 * s, (.02 + w) * s, -.62 * s); c.closePath(); FS(c, bc);
    c.fillStyle = hexA(sp.capc, .55); c.beginPath(); c.moveTo((.02 + w) * s, -.3 * s); c.quadraticCurveTo(.2 * s, -.0 * s, .25 * s, .25 * s); c.quadraticCurveTo(.25 * s, .5 * s, 0, .55 * s); c.quadraticCurveTo(-.25 * s, .5 * s, -.25 * s, .25 * s); c.quadraticCurveTo(-.2 * s, -.0 * s, (.02 + w) * s, -.3 * s); c.closePath(); c.fill();
    c.fillStyle = "#fff"; [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * .12 * s, .22 * s, s * .07, s * .09 * bl, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = sp.capc; c.beginPath(); c.arc(d * .12 * s, .23 * s, s * .035, 0, 7); c.fill(); c.fillStyle = "#fff"; });
    c.beginPath(); c.arc(0, .38 * s, s * .05, 0.1, Math.PI - .1); c.stroke();
    c.fillStyle = hexA(sp.capc, .8); for (let i = 0; i < 3; i++) { const ph = (t * .5 + i / 3) % 1; c.beginPath(); c.arc(Math.sin(i * 2 + t) * s * .3, (.4 - ph * 1.1) * s, s * .025 * (1 - ph), 0, 7); c.fill(); }
  },
  hallsaenger(c, s, sp, t, bc, bl) { // Hallsänger: singender Axolotl
    const wv = Math.sin(t * 3);
    [-1, 1].forEach(d => [0, 1, 2].forEach(k => { const a = -.5 + k * .55; c.beginPath(); c.moveTo(d * .3 * s, (.08 + k * .08) * s); c.quadraticCurveTo(d * (.5 + k * .03) * s, (-.05 + k * .08 + wv * .03) * s, d * (.6 + (k === 1 ? .04 : 0)) * s, (-.12 + k * .17 + wv * .04 * d) * s); c.lineWidth = Math.max(2.2, s * .05); c.stroke(); c.fillStyle = sp.capc; for (let j = 0; j < 2; j++) { c.beginPath(); c.ellipse(d * (.5 + j * .05) * s, (-.02 + k * .13 + j * .02 + wv * .03) * s, s * .06, s * .03, d * (-.5 + k * .5), 0, 7); c.fill(); } }));
    c.lineWidth = Math.max(2, s * .06); c.beginPath(); c.ellipse(0, .52 * s, .26 * s, .15 * s, 0, 0, 7); FS(c, bc); [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * .16 * s, .64 * s, .08 * s, .045 * s, 0, 0, 7); FS(c, bc); });
    c.beginPath(); c.ellipse(0, .2 * s, .42 * s, .33 * s, 0, 0, 7); FS(c, bc);
    cEye(c, -.2 * s, .08 * s, s * .065, bl, s); cEye(c, .2 * s, .08 * s, s * .065, bl, s);
    const mo = .09 + (Math.sin(t * 4) * .5 + .5) * .06; c.fillStyle = "#6a2a4a"; c.beginPath(); c.ellipse(0, .33 * s, s * .12, s * mo, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#f08aa0"; c.beginPath(); c.ellipse(0, .37 * s, s * .07, s * .035, 0, 0, 7); c.fill();
    cBlush(c, -.3 * s, .24 * s, s, .45); cBlush(c, .3 * s, .24 * s, s, .45);
    c.fillStyle = INK; c.lineWidth = Math.max(1.4, s * .035); [[-.2, -.38], [.18, -.5]].forEach((p, i) => { const q = Math.sin(t * 2 + i * 2) * s * .04; c.beginPath(); c.ellipse(p[0] * s, p[1] * s + q, s * .05, s * .035, -.4, 0, 7); c.fill(); c.beginPath(); c.moveTo(p[0] * s + s * .04, p[1] * s + q); c.lineTo(p[0] * s + s * .04, p[1] * s + q - s * .14); c.stroke(); });
  },
  amethyst(c, s, sp, t, bc, bl) { // Amethystling: Geoden-Schildkröte
    [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * .36 * s, .55 * s, .1 * s, .07 * s, 0, 0, 7); FS(c, bc); });
    c.beginPath(); c.ellipse(0, .2 * s, .5 * s, .4 * s, 0, Math.PI, 0); c.lineTo(.5 * s, .32 * s); c.quadraticCurveTo(.4 * s, .52 * s, 0, .52 * s); c.quadraticCurveTo(-.4 * s, .52 * s, -.5 * s, .32 * s); c.closePath(); FS(c, "#9a93a8");
    c.save(); c.beginPath(); c.ellipse(0, .15 * s, .34 * s, .25 * s, 0, Math.PI, 0); c.lineTo(.34 * s, .22 * s); c.lineTo(-.34 * s, .22 * s); c.closePath(); c.clip(); c.fillStyle = sp.capc; c.fillRect(-s, -s, 2 * s, 2 * s);
    c.fillStyle = "#eadcff"; c.strokeStyle = "rgba(60,20,100,.6)"; c.lineWidth = Math.max(1.2, s * .025); [[-.26, .2, .3], [-.12, .2, .4], [.03, .2, .46], [.17, .2, .36], [.28, .2, .26]].forEach((p, i) => { c.beginPath(); c.moveTo((p[0] - .07) * s, p[1] * s); c.lineTo((p[0] + (i - 2) * .01) * s, (p[1] - p[2] * .55) * s); c.lineTo((p[0] + .07) * s, p[1] * s); c.closePath(); c.fill(); c.stroke(); }); c.restore(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    c.beginPath(); c.ellipse(0, .15 * s, .34 * s, .25 * s, 0, Math.PI, 0); c.stroke();
    c.beginPath(); c.ellipse(0, .44 * s, .26 * s, .19 * s, 0, 0, 7); FS(c, bc);
    cEye(c, -.1 * s, .41 * s, s * .065, bl, s); cEye(c, .1 * s, .41 * s, s * .065, bl, s); c.beginPath(); c.moveTo(-.05 * s, .52 * s); c.quadraticCurveTo(0, .56 * s, .05 * s, .52 * s); c.stroke();
  },
  sonnenkern(c, s, sp, t, bc, bl) { // Sonnenkern: kleine Sonne mit Ring
    c.save(); c.translate(0, .15 * s); c.rotate(t * .5); c.fillStyle = sp.capc; for (let i = 0; i < 12; i++) { c.rotate(Math.PI / 6); const L = i % 2 ? .62 : .54; c.beginPath(); c.moveTo(-.07 * s, -.36 * s); c.lineTo(0, -L * s); c.lineTo(.07 * s, -.36 * s); c.closePath(); c.fill(); c.stroke(); } c.restore();
    const g = c.createRadialGradient(0, .15 * s, s * .05, 0, .15 * s, s * .38); g.addColorStop(0, "#fffbe0"); g.addColorStop(1, "#ffd96a");
    c.beginPath(); c.arc(0, .15 * s, .38 * s, 0, 7); FS(c, g);
    cEye(c, -.13 * s, .1 * s, s * .08, bl, s); cEye(c, .13 * s, .1 * s, s * .08, bl, s); c.beginPath(); c.arc(0, .2 * s, s * .12, .15, Math.PI - .15); c.stroke(); cBlush(c, -.25 * s, .24 * s, s, .55); cBlush(c, .25 * s, .24 * s, s, .55);
    c.save(); c.translate(0, .15 * s); c.rotate(-.35); c.strokeStyle = "rgba(255,170,40,.9)"; c.lineWidth = Math.max(2, s * .04); c.beginPath(); c.ellipse(0, 0, s * .6, s * .15, 0, 0, Math.PI); c.stroke(); c.restore(); c.strokeStyle = INK;
  }
};

Object.assign(FORMS, {
  wolkli(c, s, sp, t, bc, bl) { // Wölkli: Wölkchen mit Regentropfen
    [[0, .3, .3], [-.27, .38, .2], [.27, .38, .2], [-.14, .1, .2], [.16, .12, .22]].forEach(p => { c.beginPath(); c.arc(p[0] * s, p[1] * s, p[2] * s, 0, 7); c.fillStyle = bc; c.fill(); });
    c.beginPath(); [[0, .3, .3], [-.27, .38, .2], [.27, .38, .2], [-.14, .1, .2], [.16, .12, .22]].forEach(p => { c.moveTo(p[0] * s + p[2] * s, p[1] * s); c.arc(p[0] * s, p[1] * s, p[2] * s, 0, 7); }); c.stroke();
    [[0, .3, .3], [-.27, .38, .2], [.27, .38, .2], [-.14, .1, .2], [.16, .12, .22]].forEach(p => { c.beginPath(); c.arc(p[0] * s, p[1] * s, p[2] * s - c.lineWidth * .5, 0, 7); c.fillStyle = bc; c.fill(); });
    c.fillStyle = "rgba(150,190,240,.4)"; c.beginPath(); c.ellipse(0, .5 * s, .4 * s, .1 * s, 0, 0, 7); c.fill();
    cEye(c, -.11 * s, .25 * s, s * .075, bl, s); cEye(c, .11 * s, .25 * s, s * .075, bl, s); c.beginPath(); c.arc(0, .33 * s, s * .05, .2, Math.PI - .2); c.stroke(); cBlush(c, -.22 * s, .35 * s, s); cBlush(c, .22 * s, .35 * s, s);
    c.fillStyle = sp.capc; c.lineWidth = Math.max(1.3, s * .03); [-.2, 0, .2].forEach((x, i) => { const ph = (t * .9 + i / 3) % 1, y = (.58 + ph * .2) * s; c.globalAlpha = 1 - ph; c.beginPath(); c.moveTo(x * s, y - s * .06); c.quadraticCurveTo(x * s + s * .04, y, x * s, y + s * .03); c.quadraticCurveTo(x * s - s * .04, y, x * s, y - s * .06); c.fill(); }); c.globalAlpha = 1;
  },
  pustel(c, s, sp, t, bc, bl) { // Pustel: Pusteblume
    c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .05); c.beginPath(); c.moveTo(0, .28 * s); c.quadraticCurveTo(s * .04, .45 * s, 0, .62 * s); c.stroke();
    [-1, 1].forEach(d => { c.beginPath(); c.moveTo(0, .5 * s); c.quadraticCurveTo(d * .2 * s, .42 * s, d * .26 * s, .56 * s); c.quadraticCurveTo(d * .12 * s, .6 * s, 0, .5 * s); FS(c, "#8fcf78"); });
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + Math.sin(t * 1.5) * .05, x1 = Math.cos(a) * .22 * s, y1 = .0 + Math.sin(a) * .22 * s, x2 = Math.cos(a) * .5 * s, y2 = Math.sin(a) * .5 * s; c.lineWidth = Math.max(1.2, s * .025); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.fillStyle = "#fff"; c.beginPath(); c.arc(x2, y2, s * .055, 0, 7); c.fill(); c.stroke(); }
    c.lineWidth = Math.max(2, s * .06); c.beginPath(); c.arc(0, 0, .26 * s, 0, 7); FS(c, bc);
    cEye(c, -.09 * s, -.02 * s, s * .07, bl, s); cEye(c, .09 * s, -.02 * s, s * .07, bl, s); c.beginPath(); c.arc(0, .06 * s, s * .05, .2, Math.PI - .2); c.stroke(); cBlush(c, -.18 * s, .07 * s, s); cBlush(c, .18 * s, .07 * s, s);
  },
  zirpel(c, s, sp, t, bc, bl) { // Zirpel: rundes Küken mit Haarschopf
    c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .045); [-1, 1].forEach(d => { c.beginPath(); c.moveTo(d * .12 * s, .56 * s); c.lineTo(d * .13 * s, .66 * s); c.lineTo(d * .22 * s, .68 * s); c.moveTo(d * .13 * s, .66 * s); c.lineTo(d * .07 * s, .68 * s); c.stroke(); });
    c.lineWidth = Math.max(2, s * .06); [-1, 0, 1].forEach(d => { c.beginPath(); c.moveTo(d * .06 * s - .04 * s, -.12 * s); c.quadraticCurveTo(d * .1 * s, -.4 * s - Math.abs(d) * -.04 * s, d * .14 * s + (d ? d * .05 * s : 0), -.34 * s); c.quadraticCurveTo(d * .08 * s, -.2 * s, d * .06 * s + .04 * s, -.12 * s); FS(c, sp.capc); });
    c.beginPath(); c.ellipse(0, .25 * s, .4 * s, .38 * s, 0, 0, 7); FS(c, bc);
    const fl = Math.sin(t * 6) * .04; [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * .38 * s, (.3 + fl) * s, .1 * s, .17 * s, d * .5, 0, 7); FS(c, sp.capc); });
    cEye(c, -.14 * s, .15 * s, s * .08, bl, s); cEye(c, .14 * s, .15 * s, s * .08, bl, s);
    c.beginPath(); c.moveTo(-.07 * s, .28 * s); c.lineTo(0, .4 * s); c.lineTo(.07 * s, .28 * s); c.closePath(); FS(c, "#f2a030"); cBlush(c, -.27 * s, .3 * s, s); cBlush(c, .27 * s, .3 * s, s);
  },
  schnuppi(c, s, sp, t, bc, bl) { // Schnuppi: pummeliger Stern mit Schweif
    const g = c.createLinearGradient(-.7 * s, -.6 * s, 0, .1 * s); g.addColorStop(0, "rgba(255,230,140,0)"); g.addColorStop(1, "rgba(255,230,140,.7)"); c.fillStyle = g; c.beginPath(); c.moveTo(-.1 * s, .1 * s); c.lineTo(-.72 * s, -.62 * s); c.lineTo(-.55 * s, -.66 * s); c.lineTo(.1 * s, .0); c.closePath(); c.fill();
    c.save(); c.translate(0, .2 * s); c.rotate(Math.sin(t * 1.4) * .08); c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? .22 * s : .5 * s; const x = Math.cos(a) * q, y = Math.sin(a) * q; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); c.lineJoin = "round"; c.lineWidth = Math.max(3, s * .1); c.strokeStyle = INK; c.stroke(); c.fillStyle = bc; c.fill(); c.lineWidth = Math.max(2, s * .05); c.restore();
    cEye(c, -.1 * s, .2 * s, s * .07, bl, s); cEye(c, .1 * s, .2 * s, s * .07, bl, s); c.beginPath(); c.arc(0, .29 * s, s * .05, .1, Math.PI - .1); c.stroke(); cBlush(c, -.2 * s, .3 * s, s); cBlush(c, .2 * s, .3 * s, s);
    [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * .13 * s, .66 * s, .08 * s, .045 * s, 0, 0, 7); FS(c, sp.capc); });
  },
  nachtkauz(c, s, sp, t, bc, bl) { // Nachtkauz: Eule
    [-1, 1].forEach(d => { c.beginPath(); c.moveTo(d * .12 * s, -.12 * s); c.lineTo(d * .3 * s, -.46 * s); c.lineTo(d * .36 * s, -.04 * s); c.closePath(); FS(c, sp.capc); });
    [-1, 1].forEach(d => { c.beginPath(); c.moveTo(d * .3 * s, .1 * s); c.quadraticCurveTo(d * .56 * s, .3 * s, d * .44 * s, .56 * s); c.quadraticCurveTo(d * .3 * s, .5 * s, d * .28 * s, .4 * s); c.closePath(); FS(c, sp.capc); });
    c.beginPath(); c.ellipse(0, .22 * s, .36 * s, .42 * s, 0, 0, 7); FS(c, bc);
    c.strokeStyle = "rgba(60,40,20,.4)"; c.lineWidth = s * .03; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-.12 * s, (.38 + i * .1) * s); c.lineTo(0, (.44 + i * .1) * s); c.lineTo(.12 * s, (.38 + i * .1) * s); c.stroke(); } c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    [-1, 1].forEach(d => { c.beginPath(); c.arc(d * .15 * s, .12 * s, .15 * s, 0, 7); FS(c, "#f8f0dc"); }); cEye(c, -.15 * s, .12 * s, s * .1, bl, s); cEye(c, .15 * s, .12 * s, s * .1, bl, s);
    c.beginPath(); c.moveTo(-.05 * s, .24 * s); c.lineTo(0, .34 * s); c.lineTo(.05 * s, .24 * s); c.closePath(); FS(c, "#f2a030");
    [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * .14 * s, .64 * s, .09 * s, .04 * s, 0, 0, 7); FS(c, "#f2a030"); });
  },
  mondling(c, s, sp, t, bc, bl) { // Mondling: Sichelmond mit Schlafmütze
    const fl = Math.sin(t * 1.6) * s * .03; c.save(); c.translate(0, fl);
    c.beginPath(); c.arc(0, .2 * s, .46 * s, .5806, 4.9427); c.arc(.2 * s, .12 * s, .38 * s, 4.4555, 1.0765, true); c.closePath(); FS(c, bc);
    c.fillStyle = "rgba(160,150,90,.35)"; [[-.3, .1, .05], [-.36, .32, .04]].forEach(p => { c.beginPath(); c.arc(p[0] * s, p[1] * s, p[2] * s, 0, 7); c.fill(); });
    cEye(c, -.22 * s, .16 * s, s * .06, Math.min(bl, .45), s); c.beginPath(); c.arc(-.22 * s, .32 * s, s * .05, .1, Math.PI - .1); c.stroke(); cBlush(c, -.34 * s, .27 * s, s);
    c.beginPath(); c.moveTo(-.18 * s, -.1 * s); c.quadraticCurveTo(-.02 * s, -.5 * s, .34 * s, -.46 * s); c.quadraticCurveTo(.12 * s, -.3 * s, .1 * s, -.12 * s); c.closePath(); FS(c, sp.capc);
    c.fillStyle = "#fff"; c.beginPath(); c.arc(.36 * s, -.46 * s, s * .06, 0, 7); c.fill(); c.stroke();
    c.fillStyle = "#fff3a0"; sparkle(c, .42 * s, .14 * s, s * .09 + Math.sin(t * 3) * s * .015); c.restore();
  },
  wolkenwal(c, s, sp, t, bc, bl) { // Wolkenwal: fliegender Wal
    const sw = Math.sin(t * 2.2) * .05;
    c.beginPath(); c.moveTo(.3 * s, .22 * s); c.quadraticCurveTo(.56 * s, .2 * s, .6 * s, (-.06 + sw) * s); c.lineWidth = Math.max(5, s * .13); c.stroke(); c.lineWidth = Math.max(3, s * .08); c.strokeStyle = sp.capc; c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    [-1, 1].forEach(d => { c.beginPath(); c.ellipse((.6 + d * .09) * s, (-.12 + sw) * s, .12 * s, .06 * s, d * .7, 0, 7); FS(c, sp.capc); });
    c.beginPath(); c.ellipse(0, .22 * s, .46 * s, .32 * s, 0, 0, 7); FS(c, bc);
    c.save(); c.beginPath(); c.ellipse(0, .22 * s, .46 * s, .32 * s, 0, 0, 7); c.clip(); c.fillStyle = "#eef6ff"; c.beginPath(); c.ellipse(-.04 * s, .42 * s, .5 * s, .2 * s, 0, 0, 7); c.fill(); c.restore();
    c.beginPath(); c.ellipse(0, .22 * s, .46 * s, .32 * s, 0, 0, 7); c.stroke();
    c.beginPath(); c.ellipse(.0, .3 * s, .14 * s, .06 * s, -.5, 0, 7); FS(c, sp.capc);
    cEye(c, -.24 * s, .14 * s, s * .065, bl, s); c.beginPath(); c.moveTo(-.4 * s, .26 * s); c.quadraticCurveTo(-.32 * s, .36 * s, -.2 * s, .3 * s); c.stroke(); cBlush(c, -.34 * s, .22 * s, s);
    c.fillStyle = "#fff"; [[-.04, -.2, .09], [.08, -.3, .07], [-.12, -.34, .06]].forEach((p, i) => { c.beginPath(); c.arc(p[0] * s, (p[1] - Math.sin(t * 2 + i) * .02) * s, p[2] * s, 0, 7); c.fill(); c.stroke(); });
    c.strokeStyle = sp.capc; c.lineWidth = Math.max(2, s * .04); c.beginPath(); c.moveTo(.0, -.04 * s); c.lineTo(0, -.14 * s); c.stroke(); c.strokeStyle = INK;
  },
  blitzling(c, s, sp, t, bc, bl) { // Blitzling: lebender Blitz
    const fl = Math.sin(t * 20) > .6 ? 1 : 0; c.lineWidth = Math.max(2, s * .06);
    c.beginPath(); c.moveTo(.1 * s, -.6 * s); c.lineTo(-.36 * s, .14 * s); c.lineTo(-.06 * s, .12 * s); c.lineTo(-.2 * s, .66 * s); c.lineTo(.4 * s, -.1 * s); c.lineTo(.08 * s, -.08 * s); c.lineTo(.3 * s, -.6 * s); c.closePath(); c.lineWidth = Math.max(3, s * .1); c.stroke(); c.fillStyle = fl ? "#fffbd0" : bc; c.fill();
    c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.moveTo(.12 * s, -.5 * s); c.lineTo(-.18 * s, .0 * s); c.lineTo(-.04 * s, -.02 * s); c.closePath(); c.fill(); c.lineWidth = Math.max(2, s * .05);
    cEye(c, -.0 * s, -.28 * s, s * .06, bl, s); cEye(c, .15 * s, -.28 * s, s * .06, bl, s); c.beginPath(); c.arc(.08 * s, -.18 * s, s * .04, .1, Math.PI - .1); c.stroke();
    c.strokeStyle = sp.capc; c.lineWidth = Math.max(1.5, s * .035); for (let i = 0; i < 4; i++) { const a = t * 3 + i * 1.6, r = s * (.42 + .06 * Math.sin(t * 9 + i)); c.beginPath(); c.moveTo(Math.cos(a) * r, Math.sin(a) * r * .9); c.lineTo(Math.cos(a) * (r + s * .1) + s * .03, Math.sin(a) * (r + s * .1) * .9 - s * .03); c.stroke(); } c.strokeStyle = INK;
  },
  lichtfuchs(c, s, sp, t, bc, bl) { // Lichtfuchs: Fuchs mit Nordlicht-Schweif
    const w = Math.sin(t * 2.4) * .05; const g = c.createLinearGradient(.3 * s, .6 * s, .6 * s, -.5 * s); g.addColorStop(0, "#4fd6a8"); g.addColorStop(.6, "#8aa8f0"); g.addColorStop(1, "#d48af0");
    c.beginPath(); c.moveTo(.22 * s, .5 * s); c.quadraticCurveTo(.7 * s, (.5 + w) * s, .6 * s, -.1 * s); c.quadraticCurveTo((.68 + w) * s, -.46 * s, .5 * s, -.56 * s); c.quadraticCurveTo(.38 * s, -.1 * s, .3 * s, .22 * s); c.closePath(); FS(c, g);
    [-1, 1].forEach(d => { c.beginPath(); c.moveTo(d * .12 * s, -.08 * s); c.lineTo(d * .3 * s, -.5 * s); c.lineTo(d * .38 * s, -.0 * s); c.closePath(); FS(c, bc); c.fillStyle = sp.capc; c.beginPath(); c.moveTo(d * .18 * s, -.08 * s); c.lineTo(d * .3 * s, -.36 * s); c.lineTo(d * .33 * s, -.04 * s); c.closePath(); c.fill(); });
    c.beginPath(); c.ellipse(0, .46 * s, .24 * s, .18 * s, 0, 0, 7); FS(c, bc);
    c.beginPath(); c.moveTo(-.4 * s, .14 * s); c.quadraticCurveTo(-.46 * s, -.08 * s, 0, -.1 * s); c.quadraticCurveTo(.46 * s, -.08 * s, .4 * s, .14 * s); c.quadraticCurveTo(.34 * s, .3 * s, .14 * s, .34 * s); c.lineTo(0, .38 * s); c.lineTo(-.14 * s, .34 * s); c.quadraticCurveTo(-.34 * s, .3 * s, -.4 * s, .14 * s); c.closePath(); FS(c, bc);
    c.fillStyle = "#fff"; c.beginPath(); c.moveTo(-.4 * s, .14 * s); c.quadraticCurveTo(-.3 * s, .24 * s, -.14 * s, .34 * s); c.lineTo(-.28 * s, .26 * s); c.closePath(); c.fill(); c.beginPath(); c.moveTo(.4 * s, .14 * s); c.quadraticCurveTo(.3 * s, .24 * s, .14 * s, .34 * s); c.lineTo(.28 * s, .26 * s); c.closePath(); c.fill();
    cEye(c, -.15 * s, .1 * s, s * .07, bl, s); cEye(c, .15 * s, .1 * s, s * .07, bl, s); c.fillStyle = INK; c.beginPath(); c.ellipse(0, .3 * s, s * .04, s * .03, 0, 0, 7); c.fill();
  },
  aurorella(c, s, sp, t, bc, bl) { // Aurorella: schwebende Qualle mit Nordlicht
    const fy = Math.sin(t * 1.8) * s * .03; c.save(); c.translate(0, fy);
    const cols = ["#4fd6a8", "#58b0f0", "#a066e0", "#e48ad8", "#4fd6a8"];
    cols.forEach((col, i) => { const x = (-.3 + i * .15) * s; c.beginPath(); c.moveTo(x, .24 * s); for (let k = 1; k <= 6; k++) c.lineTo(x + Math.sin(t * 2.2 + i + k * .9) * s * .05, .24 * s + k * s * .08); c.lineWidth = Math.max(3.5, s * .075); c.strokeStyle = INK; c.stroke(); c.lineWidth = Math.max(1.8, s * .04); c.strokeStyle = col; c.stroke(); });
    c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06); c.beginPath(); c.moveTo(-.46 * s, .26 * s); c.quadraticCurveTo(-.5 * s, -.5 * s, 0, -.5 * s); c.quadraticCurveTo(.5 * s, -.5 * s, .46 * s, .26 * s); c.quadraticCurveTo(.3 * s, .32 * s, .15 * s, .26 * s); c.quadraticCurveTo(0, .34 * s, -.15 * s, .26 * s); c.quadraticCurveTo(-.3 * s, .32 * s, -.46 * s, .26 * s); c.closePath();
    const g = c.createLinearGradient(0, -.5 * s, 0, .3 * s); g.addColorStop(0, "#a8f0d8"); g.addColorStop(.55, bc); g.addColorStop(1, "#d8a8f4"); FS(c, g);
    c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.ellipse(-.2 * s, -.28 * s, .1 * s, .05 * s, -.6, 0, 7); c.fill();
    cEye(c, -.15 * s, -.05 * s, s * .08, bl, s); cEye(c, .15 * s, -.05 * s, s * .08, bl, s); c.beginPath(); c.arc(0, .06 * s, s * .05, .1, Math.PI - .1); c.stroke(); cBlush(c, -.28 * s, .05 * s, s); cBlush(c, .28 * s, .05 * s, s); c.restore();
  },
  kometarius(c, s, sp, t, bc, bl) { // Kometarius: Komet mit langem Schweif
    const g = c.createLinearGradient(.1 * s, .1 * s, .75 * s, -.7 * s); g.addColorStop(0, "rgba(120,190,255,.9)"); g.addColorStop(1, "rgba(120,190,255,0)");
    c.fillStyle = g; c.beginPath(); c.moveTo(.18 * s, -.12 * s); c.quadraticCurveTo(.5 * s, -.52 * s, .82 * s, -.66 * s); c.quadraticCurveTo(.5 * s, -.3 * s, .34 * s, .06 * s); c.closePath(); c.fill();
    c.fillStyle = "rgba(255,255,255,.7)"; for (let i = 0; i < 5; i++) { const ph = (t * .6 + i / 5) % 1; c.beginPath(); c.arc((.25 + ph * .5) * s, (-.1 - ph * .5) * s + Math.sin(i * 3) * s * .04, s * .028 * (1 - ph), 0, 7); c.fill(); }
    c.beginPath(); c.arc(-.04 * s, .2 * s, .36 * s, 0, 7); const rg = c.createRadialGradient(-.12 * s, .1 * s, s * .05, 0, .2 * s, s * .38); rg.addColorStop(0, "#ffffff"); rg.addColorStop(1, bc); FS(c, rg);
    c.fillStyle = "rgba(90,120,200,.35)"; [[-.2, .32, .06], [.08, .38, .05], [.1, .12, .04]].forEach(p => { c.beginPath(); c.arc(p[0] * s, p[1] * s, p[2] * s, 0, 7); c.fill(); });
    cEye(c, -.17 * s, .2 * s, s * .075, bl, s); cEye(c, .08 * s, .2 * s, s * .075, bl, s); c.beginPath(); c.arc(-.05 * s, .3 * s, s * .06, .1, Math.PI - .1); c.stroke(); cBlush(c, -.27 * s, .3 * s, s); cBlush(c, .17 * s, .3 * s, s);
  },
  weltenstern(c, s, sp, t, bc, bl) { // Weltenstern: Kompassstern in einer kleinen Galaxie
    c.save(); c.translate(0, .15 * s); c.rotate(t * .25);
    for (let k = 0; k < 3; k++) { c.save(); c.rotate(k * Math.PI * 2 / 3); c.strokeStyle = hexA(sp.capc, .55); c.lineWidth = Math.max(2, s * .05); c.beginPath(); for (let a = 0; a < 3.4; a += .2) { const r = (.12 + a * .12) * s; a ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(Math.cos(a) * r, Math.sin(a) * r); } c.stroke(); c.restore(); }
    c.fillStyle = "#fff6c8"; for (let i = 0; i < 10; i++) { const a = i * 2.4 + t * .4, r = s * (.35 + (i % 5) * .05); c.beginPath(); c.arc(Math.cos(a) * r, Math.sin(a) * r, s * .018, 0, 7); c.fill(); } c.restore();
    c.strokeStyle = INK; c.lineWidth = Math.max(2.5, s * .07); c.fillStyle = bc; c.beginPath();
    for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + i * Math.PI / 8, q = i % 4 === 0 ? .68 * s : i % 2 === 0 ? .42 * s : .24 * s; const x = Math.cos(a) * q, y = .15 * s + Math.sin(a) * q; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); c.stroke(); c.fill();
    c.beginPath(); c.arc(0, .15 * s, .24 * s, 0, 7); const g = c.createRadialGradient(0, .1 * s, s * .02, 0, .15 * s, s * .26); g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#ffd96a"); c.lineWidth = Math.max(2, s * .05); FS(c, g);
    cEye(c, -.09 * s, .12 * s, s * .065, bl, s); cEye(c, .09 * s, .12 * s, s * .065, bl, s); c.beginPath(); c.arc(0, .2 * s, s * .06, .1, Math.PI - .1); c.stroke();
  }
});

/* Meerestiere: eigene Körperformen */
Object.assign(FORMS, {
  krabbel(c, s, sp, t, bc, bl) { // Krabbel: Krabbe mit Scheren
    const sw = Math.sin(t * 5) * s * .02;
    c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .05); [-1, 1].forEach(d => [0, 1, 2].forEach(k => { c.beginPath(); c.moveTo(d * .3 * s, (.38 + k * .07) * s); c.quadraticCurveTo(d * .5 * s, (.36 + k * .09) * s, d * .58 * s, (.52 + k * .07) * s + (k % 2 ? sw : -sw)); c.stroke(); }));
    [-1, 1].forEach(d => { c.lineWidth = Math.max(2, s * .06); c.beginPath(); c.moveTo(d * .34 * s, .3 * s); c.quadraticCurveTo(d * .52 * s, .2 * s, d * .5 * s, (.04 + sw / s) * s); c.stroke(); c.beginPath(); c.ellipse(d * .5 * s, -.02 * s, .15 * s, .13 * s, d * .3, 0, 7); FS(c, sp.capc); c.beginPath(); c.moveTo(d * .5 * s, -.1 * s); c.lineTo(d * .5 * s + d * .02 * s, -.02 * s); c.lineTo(d * .62 * s, -.1 * s); c.stroke(); });
    c.beginPath(); c.ellipse(0, .36 * s, .44 * s, .3 * s, 0, 0, 7); FS(c, bc);
    c.strokeStyle = INK; c.lineWidth = Math.max(1.6, s * .04); [-1, 1].forEach(d => { c.beginPath(); c.moveTo(d * .1 * s, .12 * s); c.lineTo(d * .13 * s, -.02 * s); c.stroke(); cEye(c, d * .13 * s, -.06 * s, s * .08, bl, s); });
    c.fillStyle = sp.capc; c.beginPath(); c.ellipse(0, .22 * s, .26 * s, .1 * s, 0, Math.PI, 0); FS(c, sp.capc);
    c.beginPath(); c.moveTo(-.07 * s, .46 * s); c.quadraticCurveTo(0, .52 * s, .07 * s, .46 * s); c.stroke(); cBlush(c, -.24 * s, .4 * s, s); cBlush(c, .24 * s, .4 * s, s);
  },
  quallo(c, s, sp, t, bc, bl) { // Quallo: Qualle mit wehenden Fäden
    for (let i = -3; i <= 3; i++) { const bx = i * .1 * s, ph = t * 3 + i * .9; c.strokeStyle = INK; c.lineWidth = Math.max(3, s * .07); c.beginPath(); c.moveTo(bx, .3 * s); c.bezierCurveTo(bx + Math.sin(ph) * s * .08, .46 * s, bx - Math.sin(ph) * s * .08, .58 * s, bx + Math.sin(ph + 1) * s * .06, (.7 + (i % 2) * .04) * s); c.stroke(); c.strokeStyle = i % 2 ? sp.capc : "#f3ecff"; c.lineWidth = Math.max(1.6, s * .035); c.stroke(); }
    c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06); c.beginPath(); c.moveTo(-.46 * s, .3 * s); c.bezierCurveTo(-.5 * s, -.3 * s, .5 * s, -.3 * s, .46 * s, .3 * s); for (let i = 4; i >= -4; i--) c.quadraticCurveTo(i * .115 * s + .057 * s, (.38 + (i % 2) * .05) * s, i * .115 * s - .057 * s, .3 * s); c.closePath(); FS(c, bc);
    c.fillStyle = hexA(sp.capc, .35); c.beginPath(); c.ellipse(0, .06 * s, .36 * s, .2 * s, 0, Math.PI, 0); c.fill();
    c.fillStyle = "rgba(255,255,255,.5)"; c.beginPath(); c.ellipse(-.2 * s, -.02 * s, .09 * s, .05 * s, -.5, 0, 7); c.fill();
    c.strokeStyle = INK; cEye(c, -.13 * s, .14 * s, s * .09, bl, s); cEye(c, .13 * s, .14 * s, s * .09, bl, s); c.beginPath(); c.moveTo(-.05 * s, .26 * s); c.quadraticCurveTo(0, .3 * s, .05 * s, .26 * s); c.stroke(); cBlush(c, -.26 * s, .24 * s, s); cBlush(c, .26 * s, .24 * s, s);
  },
  geisterkrake(c, s, sp, t, bc, bl) { // Geisterkrake: Krake mit Schleiern
    for (let i = 0; i < 6; i++) { const a = (i - 2.5) * .26, bx = Math.sin(a * 2.2) * .3 * s, ph = t * 2.4 + i * 1.1; c.strokeStyle = INK; c.lineWidth = Math.max(3.4, s * .09); c.beginPath(); c.moveTo(bx, .36 * s); c.bezierCurveTo(bx + Math.sin(ph) * s * .12, .5 * s, bx - Math.sin(ph) * s * .12, .62 * s, bx + Math.sin(ph + 1.2) * s * .1 + (i - 2.5) * s * .03, .72 * s); c.stroke(); c.strokeStyle = sp.capc; c.lineWidth = Math.max(1.8, s * .045); c.stroke(); }
    c.beginPath(); c.moveTo(-.34 * s, .38 * s); c.bezierCurveTo(-.5 * s, -.1 * s, -.26 * s, -.46 * s, 0, -.46 * s); c.bezierCurveTo(.26 * s, -.46 * s, .5 * s, -.1 * s, .34 * s, .38 * s); c.quadraticCurveTo(0, .46 * s, -.34 * s, .38 * s); c.closePath(); FS(c, bc);
    c.fillStyle = hexA(sp.capc, .3); c.beginPath(); c.ellipse(0, -.2 * s, .26 * s, .14 * s, 0, 0, 7); c.fill();
    c.fillStyle = "rgba(255,255,255,.5)"; c.beginPath(); c.ellipse(-.14 * s, -.24 * s, .06 * s, .1 * s, -.4, 0, 7); c.fill();
    c.strokeStyle = INK; cEye(c, -.14 * s, .06 * s, s * .1, bl, s); cEye(c, .14 * s, .06 * s, s * .1, bl, s); c.beginPath(); c.arc(0, .24 * s, s * .05, 0, Math.PI); c.stroke(); cBlush(c, -.26 * s, .2 * s, s); cBlush(c, .26 * s, .2 * s, s);
  }
});
function drawTonling(c, sp, cx, cy, size, t, mut, opts = {}) {
  const s = size, wob2 = Math.sin(t * 5 + cx * 0.1) * 0.04, bounce = Math.abs(Math.sin(t * 3 + cy * 0.1)) * s * 0.08;
  c.save(); c.translate(cx, cy - bounce); c.scale(1 + wob2, 1 - wob2); c.lineJoin = c.lineCap = "round";
  c.lineWidth = Math.max(2, s * 0.06); c.strokeStyle = INK;
  const rc = RAR[sp.r].col;
  if (sp.r >= 3 || sp.x === "glow") { const g = c.createRadialGradient(0, 0, s * .1, 0, 0, s * (sp.r >= 3 ? 1.1 : .85)); g.addColorStop(0, sp.r === 5 ? "rgba(255,70,70,.6)" : sp.r === 4 ? "rgba(255,225,100,.55)" : sp.r === 3 ? "rgba(170,110,240,.45)" : "rgba(255,230,160,.4)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.beginPath(); c.arc(0, 0, s * 1.1, 0, 7); c.fill(); }
  if (sp.r === 5) { c.save(); c.rotate(-t * .3); c.fillStyle = "rgba(255,60,70,.22)"; for (let i = 0; i < 12; i++) { c.rotate(Math.PI / 6); c.beginPath(); c.moveTo(0, 0); c.lineTo(-s * .09, -s * 1.3); c.lineTo(s * .09, -s * 1.3); c.closePath(); c.fill(); } c.restore(); const pr = (t * .8) % 1; c.strokeStyle = "rgba(255,90,90," + (.6 * (1 - pr)) + ")"; c.lineWidth = s * .04; c.beginPath(); c.arc(0, s * .2, s * (.45 + pr * .8), 0, 7); c.stroke(); }
  if (sp.r === 4) { c.save(); c.rotate(t * .35); c.fillStyle = "rgba(255,226,110,.28)"; for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); c.beginPath(); c.moveTo(0, 0); c.lineTo(-s * .12, -s * 1.15); c.lineTo(s * .12, -s * 1.15); c.closePath(); c.fill(); } c.restore(); }
  const alpha = mut === "glas" ? 0.72 : 1; c.globalAlpha = alpha;
  if (FORMS[sp.id]) { c.lineWidth = Math.max(2, s * .06); c.strokeStyle = INK; const bcol = mut === "stern" ? "#cdbbf0" : sp.body, bl0 = (Math.floor(t * 0.7) % 5 === 0 && (t * 0.7) % 1 < .12) ? 0.3 : 1; FORMS[sp.id](c, s, sp, t, bcol, bl0); } else {
  // Körper
  c.fillStyle = mut === "stern" ? "#cdbbf0" : sp.body; c.beginPath(); c.ellipse(0, s * .2, s * .38, s * .4, 0, 0, 7); c.fill(); c.stroke();
  if (sp.mark === "spots") { c.fillStyle = "rgba(160,100,60,.35)"; [[-.15, .3], [.12, .1], [.1, .4]].forEach(p => { c.beginPath(); c.arc(p[0] * s, p[1] * s, s * .05, 0, 7); c.fill(); }); }
  if (sp.mark === "stripes") { c.strokeStyle = "rgba(160,110,30,.5)"; c.lineWidth = s * .04; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-s * .3, s * (.12 + i * .13)); c.quadraticCurveTo(0, s * (.18 + i * .13), s * .3, s * (.12 + i * .13)); c.stroke(); } c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06); }
  if (sp.mark === "fringe") { c.strokeStyle = "rgba(60,90,50,.55)"; c.lineWidth = s * .03; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * s * .09, s * .5); c.lineTo(i * s * .09, s * .6); c.stroke(); } c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06); }
  if (sp.r >= 2) { const rr = sp.r, col = RAR[rr].col; c.save(); c.beginPath(); c.ellipse(0, s * .2, s * .38, s * .4, 0, 0, 7); c.clip();
    if (rr >= 3) { const g = c.createLinearGradient(0, -s * .2, 0, s * .6); g.addColorStop(0, "rgba(255,255,255,.5)"); g.addColorStop(.45, "rgba(255,255,255,0)"); g.addColorStop(1, hexA(col, rr === 4 ? .55 : .4)); c.fillStyle = g; c.fillRect(-s, -s, s * 2, s * 2); }
    c.restore(); if ([...sp.id].reduce((a, ch) => a + ch.charCodeAt(0) * 7, 0) % 3 === 0) emblem(c, rr, 0, s * .45, s * (rr === 2 ? .07 : .09), col, t); }
  // Füße
  c.fillStyle = sp.body; [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * s * .17, s * .6, s * .09, s * .05, 0, 0, 7); c.fill(); c.stroke(); });
  // Augen
  c.fillStyle = INK; const bl = (Math.floor(t * 0.7) % 5 === 0 && (t * 0.7) % 1 < .12) ? 0.3 : 1;
  [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * s * .12, s * .22, s * .05, s * .07 * bl, 0, 0, 7); c.fill(); });
  if (sp.r >= 2) { c.fillStyle = "#fff"; [-1, 1].forEach(d => { c.beginPath(); c.arc(d * s * .12 - s * .018, s * .2, s * .02, 0, 7); c.fill(); }); }
  c.fillStyle = "rgba(255,120,120," + (sp.r >= 4 ? ".55" : ".35") + ")"; [-1, 1].forEach(d => { c.beginPath(); c.arc(d * s * .22, s * .33, s * .05, 0, 7); c.fill(); });
  // Kappe
  const cc = sp.capc; c.fillStyle = cc; c.lineWidth = Math.max(2, s * .06); c.strokeStyle = INK;
  c.beginPath();
  switch (sp.cap) {
    case "flat": c.ellipse(0, -s * .17, s * .5, s * .15, 0, Math.PI, 0); c.closePath(); break;
    case "bell": c.moveTo(-s * .3, -s * .05); c.quadraticCurveTo(-s * .32, -s * .5, 0, -s * .5); c.quadraticCurveTo(s * .32, -s * .5, s * .3, -s * .05); c.closePath(); break;
    case "umbrella": c.moveTo(-s * .52, -s * .05); c.quadraticCurveTo(0, -s * .72, s * .52, -s * .05); for (let i = 3; i >= -3; i--) c.arc(i * s * .15, -s * .05, s * .075, 0, Math.PI); c.closePath(); break;
    case "drop": c.moveTo(0, -s * .72); c.quadraticCurveTo(s * .4, -s * .2, s * .32, -s * .05); c.lineTo(-s * .32, -s * .05); c.quadraticCurveTo(-s * .4, -s * .2, 0, -s * .72); break;
    case "cone": c.moveTo(-s * .36, -s * .03); c.lineTo(0, -s * .72); c.lineTo(s * .36, -s * .03); c.closePath(); break;
    case "crystal": c.moveTo(0, -s * .78); c.lineTo(s * .3, -s * .3); c.lineTo(s * .22, -s * .02); c.lineTo(-s * .22, -s * .02); c.lineTo(-s * .3, -s * .3); c.closePath(); break;
    case "crown": c.moveTo(-s * .32, -s * .02); c.lineTo(-s * .34, -s * .5); c.lineTo(-s * .17, -s * .3); c.lineTo(0, -s * .62); c.lineTo(s * .17, -s * .3); c.lineTo(s * .34, -s * .5); c.lineTo(s * .32, -s * .02); c.closePath(); break;
    case "helm": c.ellipse(0, -s * .1, s * .42, s * .3, 0, Math.PI, 0); c.lineTo(s * .5, -s * .08); c.lineTo(-s * .5, -s * .08); c.closePath(); break;
    case "lantern": c.ellipse(0, -s * .12, s * .42, s * .25, 0, Math.PI, 0); c.closePath(); break;
    case "leafs": c.ellipse(0, -s * .12, s * .4, s * .2, 0, Math.PI, 0); c.closePath(); break;
    case "spiral": c.ellipse(0, -s * .12, s * .42, s * .28, 0, Math.PI, 0); c.closePath(); break;
    default: c.ellipse(0, -s * .06, s * .44, s * .34, 0, Math.PI, 0); c.closePath();
  }
  c.fill(); c.stroke();
  c.fillStyle = "rgba(255,255,255,.35)"; c.beginPath(); c.ellipse(-s * .14, -s * .2, s * .07, s * .04, -0.6, 0, 7); c.fill();
  if (sp.cap === "spiral") { c.strokeStyle = "rgba(40,20,70,.5)"; c.lineWidth = s * .03; c.beginPath(); for (let a = 0; a < 9; a += .4) c.lineTo(Math.cos(a) * a * s * .018, -s * .16 + Math.sin(a) * a * s * .009); c.stroke(); }
  if (sp.cap === "leafs") { c.fillStyle = cc; c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .05); [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * s * .16, -s * .44, s * .13, s * .06, d * .8, 0, 7); c.fill(); c.stroke(); }); }
  if (sp.cap === "helm") { c.strokeStyle = "rgba(40,20,10,.55)"; c.lineWidth = s * .035; c.beginPath(); c.moveTo(0, -s * .38); c.lineTo(0, -s * .1); c.stroke(); c.fillStyle = "#fff4b0"; c.strokeStyle = INK; c.lineWidth = Math.max(1.6, s * .04); c.beginPath(); c.arc(s * .25, -s * .22, s * .09, 0, 7); c.fill(); c.stroke(); c.globalAlpha = .28; c.fillStyle = "#fff0a0"; c.beginPath(); c.arc(s * .25, -s * .22, s * .2, 0, 7); c.fill(); c.globalAlpha = 1; }
  if (sp.cap === "lantern") { c.fillStyle = "#ffe08a"; c.beginPath(); c.arc(0, -s * .5, s * .1, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(0, -s * .3); c.lineTo(0, -s * .42); c.stroke(); }
  if (sp.x === "chimes") { c.strokeStyle = INK; c.lineWidth = s * .03; [-1, 0, 1].forEach((d, i) => { c.beginPath(); c.moveTo(d * s * .2, -s * .04); c.lineTo(d * s * .2, s * (.08 + .04 * i)); c.stroke(); c.fillStyle = "#fff6c0"; c.beginPath(); c.arc(d * s * .2, s * (.1 + .04 * i), s * .03, 0, 7); c.fill(); }); }
  }
  c.globalAlpha = 1;
  if (mut === "glas") { c.strokeStyle = "rgba(255,255,255,.8)"; c.lineWidth = s * .03; c.beginPath(); c.arc(0, s * .2, s * .3, Math.PI * 1.1, Math.PI * 1.5); c.stroke(); }
  if (mut === "funkel" || mut === "stern") { c.fillStyle = mut === "stern" ? "#f1e3ff" : "#fff3b0"; for (let i = 0; i < 5; i++) { const a = t * 1.4 + i * 1.26, rr = s * (.5 + .1 * Math.sin(t * 2 + i)); const sx = Math.cos(a) * rr, sy = Math.sin(a) * rr * .8; c.beginPath(); c.moveTo(sx, sy - s * .06); c.lineTo(sx + s * .02, sy); c.lineTo(sx, sy + s * .06); c.lineTo(sx - s * .02, sy); c.closePath(); c.fill(); } }
  if (sp.r >= 2) { const n = sp.r === 2 ? 2 : sp.r === 3 ? 4 : sp.r === 4 ? 6 : 9, col = sp.r === 5 ? "#ffb4ae" : sp.r === 4 ? "#fff0a0" : sp.r === 3 ? "#e2c8ff" : "#cfe4ff"; c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = Math.max(1, s * .02);
    for (let i = 0; i < n; i++) { const a = t * (.7 + sp.r * .12) + i * Math.PI * 2 / n, rr2 = s * (.66 + .08 * Math.sin(t * 2 + i * 2)), pu = .55 + .45 * Math.sin(t * 4 + i * 1.7); sparkle(c, Math.cos(a) * rr2, Math.sin(a) * rr2 * .85 + s * .1, s * .09 * pu + s * .02); } }
  c.restore();
}

/* ----- Figuren ----- */
/* ===== Menschen: handgezeichnete Figuren mit eigenem Aussehen ===== */
const SK = { a: "#f4d9bd", b: "#e8bd92", c: "#c58b60", d: "#8a5638", e: "#f7e0cd" };
// Aussehen: skin, hair (Farbe), hs (Frisur), ht (Hutart), ho (Hutfarbe), of (Kleidung), ac (Akzent), bd (Bart), bc (Bartfarbe), gl (Brille), it (Gegenstand), w (Breite), h (Höhe)
const NPC_LOOK = {
  tilda:   { skin: "a", hair: "#7a4a24", hs: "braid", ht: "band", ho: "#9a3f2c", of: "tunic", ac: "#f2c94c", it: "feder", w: 1 },
  marlo:   { skin: "b", hair: "#d9d4c4", hs: "tuft", ht: "cap", ho: "#4a4170", of: "apron", ac: "#f0e8d0", bd: "full", bc: "#ece6d6", gl: "round", w: 1.12, h: .96 },
  ysa:     { skin: "c", hair: "#3a2418", hs: "twin", ht: "none", ho: "#6b2a3a", of: "dress", ac: "#f6c8d0", w: .92, h: .94 },
  okko:    { skin: "b", hair: "#5a3a20", hs: "short", ht: "pointy", ho: "#2f5e4a", of: "vest", ac: "#8a6a3a", bd: "full", bc: "#6a4a2a", it: "pack", w: 1.08, h: 1.04 },
  bora:    { skin: "d", hair: "#1e1a1a", hs: "curly", ht: "none", ho: "#2e3b7a", of: "tunic", ac: "#f0c040", it: "scarf", w: .95 },
  fenn:    { skin: "a", hair: "#c98a2a", hs: "wavy", ht: "goggles", ho: "#6b5320", of: "vest", ac: "#e8e0b0", it: "scarf", w: .92, h: 1.02 },
  mooma:   { skin: "b", hair: "#c8c8c0", hs: "bun", ht: "hood", ho: "#4d6a3a", of: "cloak", ac: "#6e8a56", it: "staff", w: .98, h: .92 },
  kerrin:  { skin: "c", hair: "#4a3020", hs: "short", ht: "helmet", ho: "#c9a02a", of: "vest", ac: "#8a8fb8", bd: "full", bc: "#4a3020", it: "pick", w: 1.18, h: .95 },
  dunn:    { skin: "b", hair: "#3a2a1a", hs: "short", ht: "cap", ho: "#5e3b1c", of: "vest", ac: "#e0d0a0", bd: "mustache", bc: "#3a2a1a", w: 1.25, h: 1.05 },
  lioba:   { skin: "e", hair: "#2a2a3a", hs: "long", ht: "hood", ho: "#2f6e69", of: "cloak", ac: "#a8e4de", it: "lantern", w: .94 },
  stimmer: { skin: "a", hair: "#e0dccc", hs: "tuft", ht: "pointy", ho: "#6a3a7a", of: "robe", ac: "#f0d878", bd: "braid", bc: "#e6e2d4", gl: "round", it: "fork", w: 1, h: 1.04 },
  astra:   { skin: "d", hair: "#1e1830", hs: "pony", ht: "star", ho: "#2a3a80", of: "robe", ac: "#ffe27a", it: "scope", w: .98, h: 1.04 },
  pim:     { skin: "b", hair: "#7a4a2a", hs: "short", ht: "beanie", ho: "#7a4a2a", of: "apron", ac: "#f4d890", it: "pack", w: 1.2, h: .9 },
  selene:  { skin: "e", hair: "#e8e4fa", hs: "long", ht: "moon", ho: "#5a4a9a", of: "dress", ac: "#fff2b8", w: .9, h: 1.04 },
  nox:     { skin: "d", hair: "#201830", hs: "short", ht: "hood", ho: "#3a2a5a", of: "cloak", ac: "#8a72c0", w: .96, h: 1.06 },
  gero:    { skin: "a", hair: "#aaaabc", hs: "bald", ht: "floppy", ho: "#3a3a5a", of: "cloak", ac: "#6a6a90", bd: "full", bc: "#c8c8d6", it: "staff", w: 1.1, h: .94 },
  wenzel:  { skin: "c", hair: "#2a8a70", hs: "wavy", ht: "goggles", ho: "#2a6a5a", of: "tunic", ac: "#f0f0c0", w: .9, h: .98 },
  rufus:   { skin: "a", hair: "#b0743a", hs: "curly", ht: "band", ho: "#7a4a22", of: "apron", ac: "#e8c890", it: "pack", w: 1.05, h: .98 },
  brum:    { skin: "b", hair: "#4a3a2a", hs: "short", ht: "floppy", ho: "#4a5a30", of: "vest", ac: "#8a6a3a", bd: "full", bc: "#5a4430", it: "pick", w: 1.22, h: 1.02 },
  gilda:   { skin: "e", hair: "#a050b0", hs: "pony", ht: "none", ho: "#6a3a7a", of: "dress", ac: "#f0c0f0", w: .92, h: .98 },
  orla:    { skin: "c", hair: "#1a2a4a", hs: "bun", ht: "goggles", ho: "#2a5a80", of: "tunic", ac: "#bfe4f8", it: "scope", w: .94, h: 1 },
  zeno:    { skin: "d", hair: "#d8d4e8", hs: "long", ht: "pointy", ho: "#4a3a8a", of: "robe", ac: "#c8d8ff", bd: "braid", bc: "#e0dcf0", gl: "round", w: 1, h: 1.06 },
  mira:    { skin: "a", hair: "#c05a30", hs: "wavy", ht: "band", ho: "#a8503a", of: "tunic", ac: "#fff0d8", it: "feder", w: .95, h: 1 },
  tarn:    { skin: "c", hair: "#2a2a30", hs: "bald", ht: "cap", ho: "#2a5870", of: "apron", ac: "#e8d8a8", bd: "full", bc: "#3a3a40", it: "pack", w: 1.18, h: .96 },
  korin:   { skin: "e", hair: "#f0a0b8", hs: "twin", ht: "none", ho: "#8a2a4a", of: "dress", ac: "#ffd8e0", w: .9, h: .96 },
  ebbe:    { skin: "d", hair: "#2a6a60", hs: "long", ht: "hood", ho: "#2a6a68", of: "cloak", ac: "#a8e0d8", it: "staff", w: .98, h: 1.04 },
  hake:    { skin: "b", hair: "#9a9a9a", hs: "short", ht: "floppy", ho: "#3a2a1a", of: "vest", ac: "#c8a060", bd: "full", bc: "#b0b0b0", gl: "round", it: "pick", w: 1.2, h: .98 },
  tiefa:   { skin: "c", hair: "#1a3a6a", hs: "pony", ht: "goggles", ho: "#1a2a60", of: "tunic", ac: "#58d0e0", it: "lantern", w: .92, h: 1 },
  saenger: { skin: "e", hair: "#f4eaff", hs: "long", ht: "crown", ho: "#6a4aa0", of: "robe", ac: "#d8c0ff", it: "orb", w: .94, h: 1.08 },
  hueterin:{ skin: "e", hair: "#f6f0dc", hs: "long", ht: "crown", ho: "#d8b84a", of: "robe", ac: "#fff6d0", it: "orb", w: .96, h: 1.1 },
  echo:    { skin: "b", hair: "#7a6aa0", hs: "short", ht: "hood", ho: "#5a4a8a", of: "cloak", ac: "#d0c4f0", it: "ears", w: 1, h: .98 }
};
/* ===== Figur-Editor: Auswahlmöglichkeiten und Kodierung ===== */
const CUS = {
  sk: ["a", "b", "c", "d", "e"],
  hs: ["short", "bun", "long", "curly", "pony", "twin", "braid", "wavy", "tuft", "bald"],
  hc: ["#3a2418", "#6b4423", "#c98a2a", "#1e1a1a", "#c8c8c0", "#a8442a", "#e8dcb0", "#2a8a70", "#6a8ae0", "#d86aa0"],
  ht: ["none", "floppy", "pointy", "cap", "beanie", "band", "hood", "goggles", "star", "crown"],
  hoc: ["#d24e4e", "#2e3b7a", "#2f5e4a", "#6a3a7a", "#c9a02a", "#4a4a5a", "#e08a3a", "#2a8a9a", "#f0e0b0", "#d86aa0"],
  of: ["tunic", "vest", "dress", "robe", "apron", "cloak"],
  oc: ["#3f9ea0", "#e39a3b", "#d8697a", "#7c8fd0", "#6fa88a", "#9a7ad0", "#c9a14a", "#c04848", "#8a6a4a", "#e8e0d0"],
  ac: ["#f2c94c", "#f6c8d0", "#e8e0b0", "#a8e4de", "#c8d0ff", "#ffb088", "#fff", "#9a3f2c"],
  it: ["satchel", "none", "pack", "scarf", "staff", "lantern", "feder"],
  gl: ["none", "round"],
  bd: ["none", "full", "mustache", "braid"]
};
const CUS_DEF = { sk: 0, hs: 0, hc: 1, ht: 1, hoc: 0, of: 0, oc: 0, ac: 0, it: 0, gl: 0, bd: 0 }, CUS_KEYS = Object.keys(CUS_DEF);
function cusNorm(o) { const r = {}; CUS_KEYS.forEach(k => { const v = o && Number.isInteger(o[k]) ? o[k] : CUS_DEF[k]; r[k] = Math.max(0, Math.min(CUS[k].length - 1, v)); }); return r; }
const cusCode = o => CUS_KEYS.map(k => cusNorm(o)[k].toString(36)).join("");
function cusDecode(str) { if (!str || str.length !== CUS_KEYS.length) return null; const o = {}; CUS_KEYS.forEach((k, i) => { o[k] = parseInt(str[i], 36); }); return cusNorm(o); }
function cusLook(o) { o = cusNorm(o); const hc = CUS.hc[o.hc], bd = CUS.bd[o.bd]; return { col: CUS.oc[o.oc], hat: CUS.hoc[o.hoc], look: { skin: CUS.sk[o.sk], hair: hc, hs: CUS.hs[o.hs], ht: CUS.ht[o.ht], ho: CUS.hoc[o.hoc], of: CUS.of[o.of], ac: CUS.ac[o.ac], it: CUS.it[o.it] === "none" ? undefined : CUS.it[o.it], gl: CUS.gl[o.gl] === "none" ? undefined : "round", bd: bd === "none" ? undefined : bd, bc: shade(hc, .1), w: 1 } }; }
const PLAYER_LOOK = { skin: "a", hair: "#6b4423", hs: "short", ht: "floppy", ho: "#d24e4e", of: "tunic", ac: "#f2c94c", it: "satchel", w: 1 };
const _lookCache = {};
function lookFor(col, hat) {
  const k = col + hat; if (_lookCache[k]) return _lookCache[k]; let h = 0; for (let i = 0; i < k.length; i++) h = (h * 33 + k.charCodeAt(i)) | 0; h = Math.abs(h);
  const pick = (a, n) => a[(h >> n) % a.length];
  return _lookCache[k] = { skin: pick(["a", "b", "c", "d", "e"], 1), hair: pick(["#3a2418", "#7a4a24", "#c98a2a", "#1e1a1a", "#c8c8c0", "#8a3a2a"], 4), hs: pick(["short", "bun", "long", "curly", "pony", "twin", "braid", "wavy"], 7), ht: pick(["floppy", "cap", "beanie", "band", "none", "pointy"], 10), ho: hat, of: pick(["tunic", "vest", "dress", "robe", "apron"], 13), ac: pick(["#f2c94c", "#f6c8d0", "#e8e0b0", "#a8e4de"], 16), it: pick(["none", "pack", "scarf", "satchel", "none"], 19), w: 1 };
}
let ME = null; function meLook() { return ME || (ME = cusLook(S.look)); } function meReset() { ME = null; }
function shade(hex, k) { return mixHex(hex, k > 0 ? "#ffffff" : "#101830", Math.abs(k)); }
function drawPerson(c, x, y, col, hat, opt, t) {
  const L = opt.look || lookFor(col, hat), mv = !!opt.moving, ph = t * 10, bob = mv ? Math.abs(Math.sin(ph)) * 1.7 : Math.sin(t * 2 + x) * .6, f = opt.face || 1;
  const k = L.w || 1, sc = 1.12 * (L.h || 1), skin = SK[L.skin] || SK.a, of = L.of || "tunic", long = of === "robe" || of === "dress" || of === "cloak";
  const hx = f * .9, hy = -26.5 - bob, sw = mv ? Math.sin(ph) : Math.sin(t * 1.5 + x) * .25;
  c.save(); c.translate(x, y); c.scale(sc, sc); c.lineJoin = c.lineCap = "round"; c.strokeStyle = INK; c.lineWidth = 1.9;
  const fillStroke = (fs) => { c.fillStyle = fs; c.fill(); c.stroke(); };
  // Schatten
  c.fillStyle = "rgba(20,30,40,.24)"; c.beginPath(); c.ellipse(0, 1, 10.5 * k, 3.8, 0, 0, 7); c.fill();
  // hinten: Umhang, Rucksack, Zopf
  if (of === "cloak") { c.beginPath(); c.moveTo(-6 * k, -21 - bob); c.quadraticCurveTo(-11 * k, -9, -11.5 * k, -2 + Math.sin(t * 2 + x) * .6); c.lineTo(11.5 * k, -2 - Math.sin(t * 2 + x) * .6); c.quadraticCurveTo(11 * k, -9, 6 * k, -21 - bob); c.closePath(); fillStroke(shade(L.ac, -.18)); }
  if (L.it === "pack") { c.beginPath(); c.ellipse(-f * 6.6 * k, -15 - bob, 4.4, 6.2, 0, 0, 7); fillStroke(L.ac); c.beginPath(); c.moveTo(-f * 9.5 * k, -17 - bob); c.lineTo(-f * 3.8 * k, -17 - bob); c.stroke(); }
  if (L.hs === "long" || L.hs === "wavy") { c.beginPath(); c.moveTo(hx - 8, hy - 2); c.lineTo(hx - 8.4, hy + 10 + Math.sin(t * 2 + x) * .5); c.quadraticCurveTo(hx, hy + 12.5, hx + 8.4, hy + 10 - Math.sin(t * 2 + x) * .5); c.lineTo(hx + 8, hy - 2); c.closePath(); fillStroke(L.hair); }
  if (L.hs === "pony") { const sg = Math.sin(t * 3 + x) * 1.6 + (mv ? Math.sin(ph) * 1.5 : 0); c.beginPath(); c.moveTo(hx - f * 6, hy - 4); c.quadraticCurveTo(hx - f * (13 + sg), hy - 2, hx - f * (11 + sg), hy + 9); c.quadraticCurveTo(hx - f * 8, hy + 3, hx - f * 5, hy); c.closePath(); fillStroke(L.hair); }
  if (L.ht === "hood") { c.beginPath(); c.ellipse(hx, hy - .5, 9.4, 9.2, 0, 0, 7); fillStroke(L.ho); }
  // Beine und Füße
  const boot = "#4a3524"; if (long) { for (const s of [-1, 1]) { const fx = s * 3.2 + (mv ? s * Math.sin(ph) * 2.2 : 0); c.beginPath(); c.ellipse(fx, -.8 - (mv && s * Math.sin(ph) > .5 ? 1.4 : 0), 3.2, 2, 0, 0, 7); fillStroke(boot); } }
  else { for (const s of [-1, 1]) { const sg = mv ? s * Math.sin(ph) * 3 : 0, lift = mv ? Math.max(0, s * Math.sin(ph + 1.6)) * 1.6 : 0; c.beginPath(); c.moveTo(s * 2.6, -9); c.lineTo(s * 2.6 + sg * .5, -3 - lift); c.lineWidth = 5; c.strokeStyle = INK; c.stroke(); c.lineWidth = 2.6; c.strokeStyle = of === "vest" ? "#6a5a48" : "#54627e"; c.stroke(); c.lineWidth = 1.9; c.strokeStyle = INK; c.beginPath(); c.ellipse(s * 2.6 + sg * .6, -1.6 - lift, 3.4, 2.3, 0, 0, 7); fillStroke(boot); } }
  // Körper
  const top = -20.5 - bob, hem = long ? -3.4 : -8.6, hw = (of === "robe" || of === "dress" ? 9.2 : of === "cloak" ? 8.2 : 7) * k;
  c.beginPath(); c.moveTo(-5.4 * k, top); c.quadraticCurveTo(0, top - 2.2, 5.4 * k, top); c.quadraticCurveTo(7 * k, top + 6, hw, hem); c.quadraticCurveTo(0, hem + 2.6, -hw, hem); c.quadraticCurveTo(-7 * k, top + 6, -5.4 * k, top); c.closePath();
  fillStroke(col);
  c.save(); c.clip(); c.fillStyle = "rgba(15,25,60,.14)"; c.fillRect(f > 0 ? 1.5 : -20, -40, 18.5, 40); c.fillStyle = "rgba(255,255,255,.22)"; c.fillRect(-f * 7 * k - 1, -40, 3, 40);
  if (of === "robe" || of === "dress") { c.strokeStyle = L.ac; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-hw, hem + .6); c.quadraticCurveTo(0, hem + 3.6, hw, hem + .6); c.stroke(); }
  if (of === "robe" && L.ht === "star") { c.fillStyle = L.ac; for (const [sx, sy] of [[-3, -14], [3.5, -9], [-2, -6.5]]) sparkle(c, sx, sy - bob * .3, 1.7); }
  if (of === "apron") { c.fillStyle = L.ac; c.fillRect(-4.2 * k, -17 - bob, 8.4 * k, 14); c.strokeStyle = "rgba(29,39,66,.5)"; c.lineWidth = 1; c.strokeRect(-4.2 * k, -17 - bob, 8.4 * k, 14); }
  if (of === "vest") { c.fillStyle = L.ac; c.beginPath(); c.moveTo(-5.4 * k, top + 1); c.lineTo(0, top + 8); c.lineTo(5.4 * k, top + 1); c.lineTo(5.4 * k, hem); c.lineTo(-5.4 * k, hem); c.closePath(); c.globalAlpha = .55; c.fill(); c.globalAlpha = 1; }
  if (of === "tunic" || of === "dress") { c.fillStyle = L.ac; c.fillRect(-hw, (of === "dress" ? -15.5 : -13.8) - bob * .6, hw * 2, 2.6); c.strokeStyle = "rgba(29,39,66,.45)"; c.lineWidth = .9; c.strokeRect(-hw, (of === "dress" ? -15.5 : -13.8) - bob * .6, hw * 2, 2.6); }
  c.restore(); c.strokeStyle = INK; c.lineWidth = 1.9;
  // Arme
  for (const s of [-1, 1]) { const ax = s * 6.4 * k, ay = top + 2, hxp = s * (8 * k) + s * (s === f ? -sw : sw) * 1.3, hyp = -11 - bob + Math.abs(sw) * .4 * (s === f ? 1 : -1);
    if (L.it === "ears" && s === f) { c.beginPath(); c.moveTo(ax, ay); c.lineTo(hxp + s * 1, top - 5); c.lineWidth = 5.6; c.strokeStyle = INK; c.stroke(); c.lineWidth = 3.2; c.strokeStyle = col; c.stroke(); c.lineWidth = 1.9; c.strokeStyle = INK; c.beginPath(); c.arc(hxp + s * 1, top - 5.6, 2.1, 0, 7); fillStroke(skin); continue; }
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(hxp, hyp); c.lineWidth = 5.6; c.strokeStyle = INK; c.stroke(); c.lineWidth = 3.2; c.strokeStyle = of === "vest" || of === "apron" ? shade(skin, -.12) : col; c.stroke(); c.lineWidth = 1.9; c.strokeStyle = INK;
    c.beginPath(); c.arc(hxp, hyp + .6, 2.1, 0, 7); fillStroke(skin);
    // Gegenstände in der Hand
    const side = s === -f; // der Arm, der vom Betrachter weg zeigt, hält den Gegenstand
    if (L.it === "staff" && s === f) { c.beginPath(); c.moveTo(hxp, 1); c.lineTo(hxp, -39 - bob); c.lineWidth = 4.4; c.stroke(); c.lineWidth = 2.2; c.strokeStyle = "#8a6a40"; c.stroke(); c.strokeStyle = INK; c.lineWidth = 1.9; c.beginPath(); c.arc(hxp, -40 - bob, 2.6, 0, 7); fillStroke(L.ac); }
    if (L.it === "lantern" && s === f) { const sg = Math.sin(t * 2.2 + x) * 1.2; c.beginPath(); c.moveTo(hxp, hyp + 2); c.lineTo(hxp + sg, hyp + 6); c.stroke(); c.save(); c.globalCompositeOperation = "lighter"; const g = c.createRadialGradient(hxp + sg, hyp + 10, 0, hxp + sg, hyp + 10, 12); g.addColorStop(0, "rgba(255,225,140,.55)"); g.addColorStop(1, "rgba(255,225,140,0)"); c.fillStyle = g; c.fillRect(hxp + sg - 12, hyp - 2, 24, 24); c.restore(); c.beginPath(); c.rect(hxp + sg - 2.6, hyp + 6, 5.2, 6.4); fillStroke("#ffe08a"); }
    if (L.it === "fork" && s === f) { c.beginPath(); c.moveTo(hxp, hyp - 1); c.lineTo(hxp, hyp - 8); c.moveTo(hxp - 2, hyp - 15); c.lineTo(hxp - 2, hyp - 8.5); c.lineTo(hxp + 2, hyp - 8.5); c.lineTo(hxp + 2, hyp - 15); c.lineWidth = 2.2; c.strokeStyle = "#e8eef6"; c.stroke(); }
    if (L.it === "scope" && s === f) { c.beginPath(); c.moveTo(hxp - f * 1, hyp - 1); c.lineTo(hxp + f * 8, hyp - 12); c.lineWidth = 5.4; c.strokeStyle = INK; c.stroke(); c.lineWidth = 3.2; c.strokeStyle = "#c99a3a"; c.stroke(); c.strokeStyle = INK; c.lineWidth = 1.9; }
    if (L.it === "pick" && s === f) { c.beginPath(); c.moveTo(hxp, 1); c.lineTo(hxp + f * 2, -19); c.lineWidth = 4; c.stroke(); c.lineWidth = 2; c.strokeStyle = "#8a6a40"; c.stroke(); c.strokeStyle = INK; c.lineWidth = 1.9; c.beginPath(); c.moveTo(hxp + f * 2 - 6, -18); c.quadraticCurveTo(hxp + f * 2, -23, hxp + f * 2 + 6, -18); c.lineWidth = 2.6; c.stroke(); c.strokeStyle = "#c8d0e0"; c.lineWidth = 1.2; c.stroke(); c.strokeStyle = INK; c.lineWidth = 1.9; }
    if (L.it === "orb" && s === f) { const gl = .6 + .4 * Math.sin(t * 2.4); c.save(); c.globalCompositeOperation = "lighter"; const g = c.createRadialGradient(hxp, hyp - 6, 0, hxp, hyp - 6, 13); g.addColorStop(0, "rgba(255,240,170," + (.7 * gl) + ")"); g.addColorStop(1, "rgba(255,240,170,0)"); c.fillStyle = g; c.fillRect(hxp - 13, hyp - 19, 26, 26); c.restore(); c.beginPath(); c.arc(hxp, hyp - 6, 3.1, 0, 7); fillStroke("#fff4c0"); }
    if (L.it === "feder" && s === f) { c.beginPath(); c.ellipse(hxp, hyp - 5, 1.6, 5, f * .3, 0, 7); fillStroke(L.ac); }
  }
  if (L.it === "satchel") { c.beginPath(); c.moveTo(-f * 5.2 * k, top + .5); c.lineTo(f * 5 * k, -9.5); c.lineWidth = 2.6; c.strokeStyle = "#8a5a32"; c.stroke(); c.strokeStyle = INK; c.lineWidth = 1.9; c.beginPath(); c.roundRect ? c.roundRect(f * 3.6 * k - 3.6, -13, 7.2, 6.8, 1.6) : c.rect(f * 3.6 * k - 3.6, -13, 7.2, 6.8); fillStroke("#b57a42"); }
  if (L.it === "scarf") { c.beginPath(); c.moveTo(-5 * k, top - .4); c.quadraticCurveTo(0, top + 2.6, 5 * k, top - .4); c.lineTo(5 * k, top + 2.2); c.quadraticCurveTo(0, top + 5.4, -5 * k, top + 2.2); c.closePath(); fillStroke(L.ac); const wv = Math.sin(t * 3 + x) * 2 + (mv ? 2 : 0); c.beginPath(); c.moveTo(-f * 4, top + 1.5); c.quadraticCurveTo(-f * (9 + wv), top + 2 + wv * .3, -f * (12 + wv), top + 6 + wv * .6); c.lineTo(-f * (10 + wv), top + 8 + wv * .6); c.quadraticCurveTo(-f * (7 + wv), top + 5, -f * 3, top + 4); c.closePath(); fillStroke(L.ac); }
  // Kopf
  if (L.it === "ears") { for (const s of [-1, 1]) { c.beginPath(); c.ellipse(hx + s * 8.2, hy + .5, 3.2, 4.6, s * .25, 0, 7); fillStroke(skin); c.beginPath(); c.ellipse(hx + s * 8.2, hy + .7, 1.2, 2.4, s * .25, 0, 7); c.fillStyle = "rgba(190,90,90,.45)"; c.fill(); } }
  else { for (const s of [-1, 1]) { c.beginPath(); c.arc(hx + s * 6.8, hy + 1, 1.9, 0, 7); fillStroke(skin); } }
  c.beginPath(); c.ellipse(hx, hy, 7.3, 7.6, 0, 0, 7); fillStroke(skin);
  c.save(); c.beginPath(); c.ellipse(hx, hy, 7.3, 7.6, 0, 0, 7); c.clip(); c.fillStyle = "rgba(160,90,50,.13)"; c.fillRect(hx + (f > 0 ? 2.5 : -9), hy - 9, 7, 18); c.restore();
  // Haarvorderteil
  const hc = L.hair, hs0 = L.hs || "short", hatOn = L.ht && L.ht !== "none";
  if (hs0 !== "bald" && L.ht !== "hood" && L.ht !== "helmet" && L.ht !== "beanie") {
    if (hs0 === "curly") { for (let i = 0; i < 7; i++) { const a = Math.PI * (1.02 + i * .16); c.beginPath(); c.arc(hx + Math.cos(a) * 6.6, hy - 1 + Math.sin(a) * 6.4, 3.1, 0, 7); fillStroke(hc); } }
    else { c.beginPath(); c.moveTo(hx - 7.6, hy + 1); c.quadraticCurveTo(hx - 8.4, hy - 9.5, hx, hy - 9); c.quadraticCurveTo(hx + 8.4, hy - 9.5, hx + 7.6, hy + 1); c.quadraticCurveTo(hx + 6.4, hy - 3.6, hx + 2.4, hy - 4.2); c.quadraticCurveTo(hx - 2, hy - 2.6, hx - 3.4, hy - 4.6); c.quadraticCurveTo(hx - 6.4, hy - 3.6, hx - 7.6, hy + 1); c.closePath(); fillStroke(hc); }
    if (hs0 === "bun") { c.beginPath(); c.arc(hx, hy - 10.4, 3.7, 0, 7); fillStroke(hc); }
    if (hs0 === "twin") { for (const s of [-1, 1]) { c.beginPath(); c.arc(hx + s * 8.4, hy - 4.6, 3.3, 0, 7); fillStroke(hc); } }
    if (hs0 === "braid") { for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(hx - f * (7.2 + (i % 2) * .8), hy + 3 + i * 3.2, 2.2, 2, 0, 0, 7); fillStroke(i % 2 ? shade(hc, -.15) : hc); } }
    if (hs0 === "tuft") { c.strokeStyle = INK; c.beginPath(); c.moveTo(hx - 1, hy - 8.6); c.quadraticCurveTo(hx, hy - 12, hx + 2.6, hy - 10.4); c.stroke(); c.strokeStyle = hc; c.lineWidth = 1.2; c.stroke(); c.strokeStyle = INK; c.lineWidth = 1.9; }
  }
  // Gesicht
  const ex = 2.7, ey = hy + .6, lk = f * 1.3;
  c.fillStyle = "rgba(230,110,110,.38)"; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(hx + s * 4.6 + lk * .5, hy + 3.2, 1.7, 1.1, 0, 0, 7); c.fill(); }
  c.fillStyle = INK; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(hx + s * ex + lk, ey, 1, 1.25, 0, 0, 7); c.fill(); }
  if (!(L.hs === "bald" && 0)) { c.strokeStyle = shade(hc, -.3); c.lineWidth = 1.1; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(hx + s * ex + lk - 1.6, ey - 2.4 - (s === f ? .4 : 0)); c.lineTo(hx + s * ex + lk + 1.6, ey - 2.8 + (s === f ? .3 : 0)); c.stroke(); } c.strokeStyle = INK; c.lineWidth = 1.9; }
  c.beginPath(); c.arc(hx + lk, hy + 4.2, 1.9, .15 * Math.PI, .85 * Math.PI); c.lineWidth = 1.2; c.stroke(); c.lineWidth = 1.9;
  if (L.gl === "round") { c.lineWidth = 1.2; c.fillStyle = "rgba(200,230,255,.35)"; for (const s of [-1, 1]) { c.beginPath(); c.arc(hx + s * ex + lk, ey, 2.9, 0, 7); c.fill(); c.stroke(); } c.beginPath(); c.moveTo(hx + lk - .2, ey); c.lineTo(hx + lk + .2, ey); c.stroke(); c.lineWidth = 1.9; }
  // Bart
  if (L.bd) { const bc = L.bc || "#ddd"; if (L.bd === "mustache") { c.beginPath(); c.moveTo(hx + lk, hy + 3.1); c.quadraticCurveTo(hx + lk - 4.6, hy + 1.6, hx + lk - 6, hy + 4.4); c.quadraticCurveTo(hx + lk - 2.4, hy + 4.8, hx + lk, hy + 3.9); c.quadraticCurveTo(hx + lk + 2.4, hy + 4.8, hx + lk + 6, hy + 4.4); c.quadraticCurveTo(hx + lk + 4.6, hy + 1.6, hx + lk, hy + 3.1); c.closePath(); fillStroke(bc); }
    else { c.beginPath(); c.moveTo(hx - 7.1, hy + 1.4); c.quadraticCurveTo(hx - 7.4, hy + 9.6, hx, hy + (L.bd === "braid" ? 12.4 : 11)); c.quadraticCurveTo(hx + 7.4, hy + 9.6, hx + 7.1, hy + 1.4); c.quadraticCurveTo(hx + 4.6, hy + 3.2, hx, hy + 3.2); c.quadraticCurveTo(hx - 4.6, hy + 3.2, hx - 7.1, hy + 1.4); c.closePath(); fillStroke(bc); if (L.bd === "braid") { c.beginPath(); c.ellipse(hx, hy + 14.8, 1.9, 2.6, 0, 0, 7); fillStroke(bc); c.beginPath(); c.arc(hx, hy + 18, 1.3, 0, 7); fillStroke(L.ac); }
      c.beginPath(); c.arc(hx + lk, hy + 5.1, 1.4, .1 * Math.PI, .9 * Math.PI); c.lineWidth = 1.1; c.stroke(); c.lineWidth = 1.9; } }
  // Kopfbedeckung
  const ho = L.ho || hat, ht = L.ht || "none", rim = (rx) => { c.beginPath(); c.ellipse(hx, hy - 5.6, rx, 3, 0, 0, 7); fillStroke(shade(ho, -.08)); };
  if (ht === "floppy") { rim(10.6); c.beginPath(); c.moveTo(hx - 6, hy - 6); c.quadraticCurveTo(hx - 6.4, hy - 14.4, hx, hy - 14.4); c.quadraticCurveTo(hx + 6.4, hy - 14.4, hx + 6, hy - 6); c.closePath(); fillStroke(ho); c.fillStyle = L.ac; c.fillRect(hx - 6, hy - 8.6, 12, 2); }
  if (ht === "pointy") { rim(10.4); c.beginPath(); c.moveTo(hx - 6.4, hy - 6); c.quadraticCurveTo(hx - 3, hy - 14, hx + f * 5 + 2, hy - 21 + Math.sin(t * 2 + x) * .8); c.quadraticCurveTo(hx + 3, hy - 13, hx + 6.4, hy - 6); c.closePath(); fillStroke(ho); c.fillStyle = L.ac || "#f2c94c"; c.fillRect(hx - 6, hy - 8.8, 12, 2); }
  if (ht === "star") { rim(10.4); c.beginPath(); c.moveTo(hx - 6.4, hy - 6); c.quadraticCurveTo(hx - 3, hy - 14, hx + 1, hy - 22); c.quadraticCurveTo(hx + 3.4, hy - 13, hx + 6.4, hy - 6); c.closePath(); fillStroke(ho); c.fillStyle = L.ac; sparkle(c, hx - .6, hy - 11.6, 2.6); c.fillStyle = L.ac; sparkle(c, hx + 1, hy - 23, 2.4); }
  if (ht === "cap") { c.beginPath(); c.moveTo(hx - 7.4, hy - 3.8); c.quadraticCurveTo(hx - 8, hy - 13, hx, hy - 13); c.quadraticCurveTo(hx + 8, hy - 13, hx + 7.4, hy - 3.8); c.closePath(); fillStroke(ho); c.beginPath(); c.ellipse(hx + f * 7.6, hy - 4.4, 4.4, 1.8, 0, 0, 7); fillStroke(shade(ho, -.12)); }
  if (ht === "beanie") { c.beginPath(); c.moveTo(hx - 7.7, hy - 2.8); c.quadraticCurveTo(hx - 8.4, hy - 13.6, hx, hy - 13.6); c.quadraticCurveTo(hx + 8.4, hy - 13.6, hx + 7.7, hy - 2.8); c.closePath(); fillStroke(ho); c.fillStyle = L.ac; c.fillRect(hx - 7.9, hy - 5.6, 15.8, 3); c.strokeRect(hx - 7.9, hy - 5.6, 15.8, 3); c.beginPath(); c.arc(hx, hy - 15.2, 2.6, 0, 7); fillStroke(L.ac); }
  if (ht === "band") { c.beginPath(); c.moveTo(hx - 7.4, hy - 3.6); c.quadraticCurveTo(hx, hy - 7.6, hx + 7.4, hy - 3.6); c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); c.lineWidth = 1.5; c.strokeStyle = ho; c.stroke(); c.strokeStyle = INK; c.lineWidth = 1.9; if (L.it === "feder") { c.beginPath(); c.ellipse(hx - f * 6.6, hy - 9, 1.6, 5, -f * .5, 0, 7); fillStroke(L.ac); } }
  if (ht === "hood") { c.beginPath(); c.moveTo(hx - 8.4, hy + 2); c.quadraticCurveTo(hx - 9.6, hy - 11, hx, hy - 11.4); c.quadraticCurveTo(hx + 9.6, hy - 11, hx + 8.4, hy + 2); c.quadraticCurveTo(hx + 7, hy - 5.6, hx, hy - 6.4); c.quadraticCurveTo(hx - 7, hy - 5.6, hx - 8.4, hy + 2); c.closePath(); fillStroke(ho); }
  if (ht === "helmet") { c.beginPath(); c.moveTo(hx - 7.9, hy - 3); c.quadraticCurveTo(hx - 8.4, hy - 13.4, hx, hy - 13.4); c.quadraticCurveTo(hx + 8.4, hy - 13.4, hx + 7.9, hy - 3); c.closePath(); fillStroke(ho); c.beginPath(); c.moveTo(hx - 9.2, hy - 3); c.lineTo(hx + 9.2, hy - 3); c.lineWidth = 2.6; c.stroke(); c.lineWidth = 1.9; c.save(); c.globalCompositeOperation = "lighter"; const lg = c.createRadialGradient(hx + f * 2, hy - 8, 0, hx + f * 2, hy - 8, 9); lg.addColorStop(0, "rgba(255,240,150,.6)"); lg.addColorStop(1, "rgba(255,240,150,0)"); c.fillStyle = lg; c.fillRect(hx - 8, hy - 18, 20, 20); c.restore(); c.beginPath(); c.arc(hx + f * 2, hy - 8.4, 2.1, 0, 7); fillStroke("#fff2a0"); }
  if (ht === "goggles") { c.beginPath(); c.moveTo(hx - 8, hy - 4.6); c.lineTo(hx + 8, hy - 4.6); c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke(); c.lineWidth = 1.1; c.strokeStyle = ho; c.stroke(); c.strokeStyle = INK; c.lineWidth = 1.6; for (const s of [-1, 1]) { c.beginPath(); c.arc(hx + s * 3.6, hy - 6.8, 3, 0, 7); fillStroke("rgba(150,220,240,.75)"); } c.lineWidth = 1.9; }
  if (ht === "moon") { c.beginPath(); c.arc(hx, hy - 9.2, 4.2, Math.PI * .1, Math.PI * 1.9); c.arc(hx + 1.8, hy - 9.6, 3.4, Math.PI * 1.8, Math.PI * .2, true); c.closePath(); fillStroke(ho === "#5a4a9a" ? "#fff0a8" : ho); }
  if (ht === "crown") { c.beginPath(); c.moveTo(hx - 6, hy - 6); c.lineTo(hx - 6.4, hy - 12.6); c.lineTo(hx - 3, hy - 9.4); c.lineTo(hx, hy - 14); c.lineTo(hx + 3, hy - 9.4); c.lineTo(hx + 6.4, hy - 12.6); c.lineTo(hx + 6, hy - 6); c.closePath(); fillStroke(ho); c.fillStyle = "#fff"; c.beginPath(); c.arc(hx, hy - 8.4, 1.1, 0, 7); c.fill(); }
  c.restore();
}
/* Was jemand in der Hand hält: "i:<Art>" für ein Instrument, "t:<Tonling>:<Mutation>" für einen Tonling */
function drawHeld(c, x, y, face, hd, t, moving) {
  if (!hd) return; const f = face || 1, p = hd.split(":"), bob = moving ? Math.abs(Math.sin(t * 10)) * 2 : 0;
  if (p[0] === "i") { c.save(); c.translate(x + f * 11, y - 16 - bob); c.rotate(f * .35); drawIcon(c, kindIcon(p[1]) || "flute", -9, -9, 18); c.restore(); }
  else if (SP[p[1]]) { c.save(); c.translate(x + f * 17, y - 9 - bob * .5); drawTonling(c, SP[p[1]], 0, 0, 22, t, p[2] || null); c.restore(); }
}
function drawHouse(c, h, t) {
  const x = h.x * TS, y = h.y * TS, w = h.w * TS, hh = h.h * TS, sd = h.x * 7 + h.y * 13, J = (i, a) => (hs(sd, i, 5) - .5) * a;
  const wl = (pts, close) => { c.beginPath(); pts.forEach((p, i) => { const px = p[0] + J(i * 2, 2.2), py = p[1] + J(i * 2 + 1, 2.2); i ? c.lineTo(px, py) : c.moveTo(px, py); }); if (close) c.closePath(); };
  c.save(); c.lineJoin = c.lineCap = "round"; c.strokeStyle = INK;
  // Bodenschatten und Gras am Fuß
  c.fillStyle = "rgba(40,30,10,.22)"; c.beginPath(); c.ellipse(x + w / 2 + 4, y + hh + 1, w / 2 + 8, 6, 0, 0, 7); c.fill();
  // Wand
  const wx = x + 3, wy = y + 22, ww = w - 6, wh = hh - 22, wall = h.wall || "#f3e6c6";
  wl([[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]], true); c.lineWidth = 2.6; c.fillStyle = wall; c.fill(); c.stroke();
  c.save(); wl([[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]], true); c.clip();
  // Papierschatten rechts und Bretter/Putz
  c.fillStyle = "rgba(120,80,30,.14)"; c.fillRect(wx + ww * .72, wy, ww * .3, wh);
  c.strokeStyle = "rgba(110,80,40,.32)"; c.lineWidth = 1.1; for (let r = 1; r * 9 < wh; r++) { c.beginPath(); const yy = wy + r * 9 + J(r, 1.4); c.moveTo(wx, yy); for (let i = 1; i <= 6; i++) c.lineTo(wx + ww * i / 6, yy + J(r * 7 + i, 1.6)); c.stroke(); }
  c.strokeStyle = "rgba(110,80,40,.22)"; for (let i = 0; i < 9; i++) { const bx = wx + 3 + hs(sd, i, 11) * (ww - 6), by = wy + 4 + hs(sd, i, 12) * (wh - 8); c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 2.4, by - 3.2); c.stroke(); }
  c.fillStyle = "rgba(255,255,255,.28)"; c.fillRect(wx, wy, 4, wh);
  c.restore(); c.strokeStyle = INK;
  // Fenster mit Kreuz, Läden und Blumenkasten
  const win = (fx, fy) => { c.lineWidth = 2.4; c.fillStyle = "#c8ebf6"; c.fillRect(fx, fy, 15, 15); c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.moveTo(fx + 2, fy + 12); c.lineTo(fx + 8, fy + 2); c.lineTo(fx + 11, fy + 2); c.lineTo(fx + 4.4, fy + 12); c.closePath(); c.fill(); c.strokeRect(fx, fy, 15, 15); c.lineWidth = 1.6; c.beginPath(); c.moveTo(fx + 7.5, fy); c.lineTo(fx + 7.5, fy + 15); c.moveTo(fx, fy + 7.5); c.lineTo(fx + 15, fy + 7.5); c.stroke();
    c.lineWidth = 2; for (const s of [-1, 1]) { const sx = s < 0 ? fx - 5 : fx + 15; c.fillStyle = h.shut || "#7aa08a"; c.fillRect(sx, fy, 5, 15); c.strokeRect(sx, fy, 5, 15); c.lineWidth = 1; c.beginPath(); c.moveTo(sx + 1, fy + 4); c.lineTo(sx + 4, fy + 4); c.moveTo(sx + 1, fy + 8); c.lineTo(sx + 4, fy + 8); c.moveTo(sx + 1, fy + 12); c.lineTo(sx + 4, fy + 12); c.stroke(); c.lineWidth = 2; }
    c.fillStyle = "#9a6a3c"; c.fillRect(fx - 2, fy + 15, 19, 5); c.strokeRect(fx - 2, fy + 15, 19, 5); for (let i = 0; i < 4; i++) { c.fillStyle = ["#e86a7a", "#f6d760", "#fff4d8", "#f0a0c0"][i]; c.beginPath(); c.arc(fx + 1 + i * 4.6, fy + 14, 2.2, 0, 7); c.fill(); c.lineWidth = 1; c.stroke(); } c.lineWidth = 2; };
  win(x + 14, y + 33); if (w >= 4 * TS - 2) win(x + w - 29, y + 33);
  // Tür mit Bogen und Knauf
  const dx = x + w / 2 - 9, dy = y + hh - 28; c.lineWidth = 2.6; c.beginPath(); c.moveTo(dx, y + hh); c.lineTo(dx, dy + 8); c.quadraticCurveTo(dx + 9, dy - 3, dx + 18, dy + 8); c.lineTo(dx + 18, y + hh); c.closePath(); c.fillStyle = h.door ? "#7a5030" : "#6a4a2c"; c.fill(); c.stroke();
  c.strokeStyle = "rgba(20,10,0,.4)"; c.lineWidth = 1.1; for (const o of [6, 12]) { c.beginPath(); c.moveTo(dx + o, dy + 4); c.lineTo(dx + o, y + hh); c.stroke(); } c.fillStyle = "#f2c94c"; c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.arc(dx + 14.4, y + hh - 11, 1.7, 0, 7); c.fill(); c.stroke();
  c.fillStyle = "#cfc4a4"; c.lineWidth = 1.6; c.beginPath(); c.rect(dx - 3, y + hh - 2, 24, 3.4); c.fill(); c.stroke();
  // Schornstein mit Rauch
  const cx0 = x + w * .68; c.lineWidth = 2.4; c.fillStyle = "#b8896a"; c.fillRect(cx0, y - 8, 9, 20); c.strokeRect(cx0, y - 8, 9, 20); c.lineWidth = 1; c.strokeStyle = "rgba(60,30,10,.4)"; c.beginPath(); c.moveTo(cx0, y - 1); c.lineTo(cx0 + 9, y - 1); c.moveTo(cx0, y + 5); c.lineTo(cx0 + 9, y + 5); c.stroke(); c.strokeStyle = INK; c.lineWidth = 2.4; c.fillStyle = "#8f664b"; c.fillRect(cx0 - 2, y - 11, 13, 4); c.strokeRect(cx0 - 2, y - 11, 13, 4);
  if (t !== undefined) for (let i = 0; i < 3; i++) { const u = (t * .28 + i / 3) % 1; c.fillStyle = "rgba(240,236,226," + (.7 * (1 - u)) + ")"; c.strokeStyle = "rgba(29,39,66," + (.5 * (1 - u)) + ")"; c.lineWidth = 1.2; c.beginPath(); c.arc(cx0 + 4.5 + Math.sin(t + i * 2) * 3 + u * 6, y - 15 - u * 26, 3 + u * 5, 0, 7); c.fill(); c.stroke(); }
  // Dach: Schindelreihen mit Halbkreisen
  c.strokeStyle = INK; const rl = x - 7, rr = x + w + 7, ap = y - 13, ey = y + 29, roof = h.roof;
  wl([[rl, ey], [x + w / 2, ap], [rr, ey]], true); c.lineWidth = 2.8; c.fillStyle = roof; c.fill(); c.stroke();
  c.save(); wl([[rl, ey], [x + w / 2, ap], [rr, ey]], true); c.clip();
  c.fillStyle = "rgba(255,240,200,.18)"; c.beginPath(); c.moveTo(rl, ey); c.lineTo(x + w / 2, ap); c.lineTo(x + w / 2 - 6, ap); c.lineTo(rl, ey - 2); c.fill();
  c.fillStyle = "rgba(20,10,30,.2)"; c.beginPath(); c.moveTo(x + w / 2, ap); c.lineTo(rr, ey); c.lineTo(x + w / 2, ey); c.closePath(); c.fill();
  c.strokeStyle = "rgba(29,39,66,.5)"; c.lineWidth = 1.3; for (let r = 0; r < 5; r++) { const yy = ap + 9 + r * 8; for (let i = -1; i < w / 9 + 2; i++) { const sx = x - 8 + i * 9 + (r % 2) * 4.5; c.beginPath(); c.arc(sx, yy, 4.6, .1 * Math.PI, .9 * Math.PI); c.stroke(); } }
  c.restore();
  // Dachkante als dicke Tinte und Giebelfenster
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(rl, ey); c.lineTo(rr, ey); c.stroke(); c.fillStyle = "rgba(0,0,0,.13)"; c.fillRect(rl + 3, ey + 1, rr - rl - 6, 4);
  c.fillStyle = "#ffe9a0"; c.lineWidth = 2; c.beginPath(); c.arc(x + w / 2 - 4, y + 12, 4.4, 0, 7); c.fill(); c.stroke();
  if (h.sign) { c.fillStyle = "#f0dfae"; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.rect(x + w - 42, y + hh - 24, 36, 16); c.fill(); c.stroke(); c.beginPath(); c.moveTo(x + w - 36, y + hh - 24); c.lineTo(x + w - 36, y + hh - 29); c.moveTo(x + w - 12, y + hh - 24); c.lineTo(x + w - 12, y + hh - 29); c.stroke(); c.fillStyle = INK; c.font = "12px 'Patrick Hand',cursive"; c.textAlign = "center"; c.textBaseline = "alphabetic"; c.fillText(h.sign, x + w - 24, y + hh - 12); }
  c.restore();
}
function drawGate(c, open, t, G0, star) {
  const x = G0.x * TS, y = G0.y * TS, w = G0.w * TS;
  c.save(); c.lineWidth = 2.5; c.strokeStyle = INK; c.lineJoin = "round";
  const stone = star ? "#4a4f8a" : "#5a5f7d"; c.fillStyle = stone; c.fillRect(x - 10, y - 10, 14, TS + 14); c.strokeRect(x - 10, y - 10, 14, TS + 14); c.fillRect(x + w - 4, y - 10, 14, TS + 14); c.strokeRect(x + w - 4, y - 10, 14, TS + 14);
  c.fillRect(x - 10, y - 18, w + 20, 12); c.strokeRect(x - 10, y - 18, w + 20, 12);
  if (star) { c.fillStyle = "#ffe27a"; [[x + 6, y - 2], [x + w + 4, y - 2], [x + w / 2, y - 12]].forEach(p => sparkle(c, p[0], p[1], 5 + Math.sin(t * 3 + p[0]) * 1.5)); }
  if (!open) { c.fillStyle = star ? "#6a6fb8" : "#7b5b3a"; for (let i = 0; i < 6; i++) { const px = x + 6 + i * ((w - 12) / 5.5); c.fillRect(px, y - 6, 7, TS + 6); c.strokeRect(px, y - 6, 7, TS + 6); } c.fillStyle = star ? "#fff2a0" : "#e9c46a"; c.beginPath(); if (star) { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 3.5 : 8; i ? c.lineTo(x + w / 2 + Math.cos(a) * q, y + TS / 2 + Math.sin(a) * q) : c.moveTo(x + w / 2 + Math.cos(a) * q, y + TS / 2 + Math.sin(a) * q); } c.closePath(); } else c.arc(x + w / 2, y + TS / 2, 6, 0, 7); c.fill(); c.stroke(); }
  else { c.fillStyle = "rgba(255,255,255,.12)"; c.fillRect(x + 4, y - 6, w - 8, TS + 6); }
  c.restore();
}

function drawGate4(c, open, t, G0) {
  const x = G0.x * TS, y = G0.y * TS, w = G0.w * TS;
  c.save(); c.lineWidth = 2.5; c.strokeStyle = INK; c.lineJoin = "round";
  c.fillStyle = "#3f7a8c"; c.fillRect(x - 10, y - 10, 14, TS + 14); c.strokeRect(x - 10, y - 10, 14, TS + 14); c.fillRect(x + w - 4, y - 10, 14, TS + 14); c.strokeRect(x + w - 4, y - 10, 14, TS + 14);
  c.fillRect(x - 10, y - 18, w + 20, 12); c.strokeRect(x - 10, y - 18, w + 20, 12);
  c.fillStyle = "#fbe3d4"; [[x - 3, y + 6], [x + w + 3, y + 6], [x + w / 2, y - 12]].forEach(p => { c.beginPath(); c.moveTo(p[0], p[1] + 7); c.bezierCurveTo(p[0] - 11, p[1] + 4, p[0] - 9, p[1] - 8, p[0], p[1] - 8); c.bezierCurveTo(p[0] + 9, p[1] - 8, p[0] + 11, p[1] + 4, p[0], p[1] + 7); c.fill(); c.stroke(); });
  if (!open) { c.fillStyle = "#8fd8d6"; for (let i = 0; i < 6; i++) { const px = x + 6 + i * ((w - 12) / 5.5); c.fillRect(px, y - 6, 7, TS + 6); c.strokeRect(px, y - 6, 7, TS + 6); }
    c.fillStyle = "#fff4f8"; c.beginPath(); c.arc(x + w / 2, y + TS / 2, 7, 0, 7); c.fill(); c.stroke(); c.fillStyle = "rgba(190,150,255,.7)"; c.beginPath(); c.arc(x + w / 2 - 2, y + TS / 2 - 2, 2.2, 0, 7); c.fill(); }
  else { c.fillStyle = "rgba(180,240,255,.16)"; c.fillRect(x + 4, y - 6, w - 8, TS + 6); for (let i = 0; i < 3; i++) { const u = (t * .4 + i / 3) % 1; c.fillStyle = "rgba(255,255,255," + (.7 * (1 - u)) + ")"; c.beginPath(); c.arc(x + 14 + i * 28, y + TS - u * (TS + 6), 2 + i % 2, 0, 7); c.fill(); } }
  c.restore();
}
/* ----- Icons für Leiste und Fenster ----- */
function drawIcon(c, kind, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s / 40, s / 40); c.lineJoin = c.lineCap = "round"; c.lineWidth = 2.4; c.strokeStyle = INK;
  const F = (col) => { c.fillStyle = col; c.fill(); c.stroke(); };
  switch (kind) {
    case "flute": c.beginPath(); c.moveTo(6, 30); c.lineTo(32, 8); c.lineTo(35, 12); c.lineTo(9, 34); c.closePath(); F("#d9a15a"); c.fillStyle = INK; [[14, 26], [19, 22], [24, 18]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 1.6, 0, 7); c.fill(); }); break;
    case "fork": c.lineCap = "round"; c.beginPath(); c.moveTo(20, 37); c.lineTo(20, 22); c.moveTo(12, 5); c.lineTo(12, 15); c.quadraticCurveTo(12, 23, 20, 23); c.quadraticCurveTo(28, 23, 28, 15); c.lineTo(28, 5); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.lineWidth = 3; c.strokeStyle = "#e4e9f2"; c.stroke(); c.fillStyle = "#f3b92f"; c.beginPath(); c.arc(20, 37, 2.6, 0, 7); c.fill(); break;
    case "horn": c.beginPath(); c.moveTo(7, 8); c.quadraticCurveTo(6, 32, 26, 31); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.lineWidth = 3.2; c.strokeStyle = "#e8c070"; c.stroke(); c.lineWidth = 2.4; c.beginPath(); c.moveTo(25, 24); c.lineTo(36, 19); c.lineTo(36, 38); c.lineTo(25, 35); c.closePath(); F("#f6e2a8"); c.beginPath(); c.arc(7, 7, 2.8, 0, 7); c.fillStyle = INK; c.fill(); break;
    case "bowl": c.beginPath(); c.moveTo(5, 19); c.quadraticCurveTo(5, 37, 20, 37); c.quadraticCurveTo(35, 37, 35, 19); c.closePath(); F("#c9a24a"); c.beginPath(); c.ellipse(20, 19, 15, 4.5, 0, 0, 7); F("#f0d080"); c.strokeStyle = "rgba(90,60,10,.5)"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(9, 29); c.quadraticCurveTo(20, 34, 31, 29); c.stroke(); c.strokeStyle = INK; c.lineWidth = 3.4; c.beginPath(); c.moveTo(33, 5); c.lineTo(24, 17); c.stroke(); c.fillStyle = "#e07a6a"; c.beginPath(); c.arc(33, 5, 3, 0, 7); c.fill(); c.lineWidth = 2.4; c.stroke(); break;
    case "sharp": c.beginPath(); c.moveTo(8, 35); c.quadraticCurveTo(3, 10, 21, 9); c.quadraticCurveTo(35, 10, 31, 35); c.closePath(); F("#b9a8f0"); c.lineWidth = 1.3; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(13 + i * 4.5, 15 + i * 2); c.lineTo(13 + i * 4.5, 33); c.stroke(); } c.fillStyle = "#ffe27a"; c.lineWidth = 1.6; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 2.4 : 6; i ? c.lineTo(20 + Math.cos(a) * q, 6 + Math.sin(a) * q) : c.moveTo(20 + Math.cos(a) * q, 6 + Math.sin(a) * q); } c.closePath(); c.fill(); c.stroke(); break;
    case "organ": [[6, 22, 12], [12.5, 16, 18], [19, 10, 24], [25.5, 16, 18], [32, 22, 12]].forEach((p, i) => { c.beginPath(); c.rect(p[0] - 2.6, p[1], 5.6, p[2] + 6); F(["#d8d0f0", "#c0b4ee", "#ffe9a0", "#c0b4ee", "#d8d0f0"][i]); c.beginPath(); c.ellipse(p[0] + .2, p[1] + 9, 1.2, 1.8, 0, 0, 7); c.fillStyle = INK; c.fill(); }); c.beginPath(); c.rect(3, 33, 34, 4); F("#8a6a4a"); break;
    case "lute": c.beginPath(); c.ellipse(15, 27, 11, 9, -.7, 0, 7); F("#c98a4a"); c.beginPath(); c.moveTo(21, 21); c.lineTo(35, 7); c.stroke(); c.beginPath(); c.arc(15, 27, 2.5, 0, 7); c.fillStyle = INK; c.fill(); break;
    case "tamb": c.beginPath(); c.arc(20, 21, 14, 0, 7); F("#f0d9a0"); c.fillStyle = "#e0b04a"; [0, 1.57, 3.14, 4.7].forEach(a => { c.beginPath(); c.arc(20 + Math.cos(a) * 14, 21 + Math.sin(a) * 14, 3, 0, 7); c.fill(); c.stroke(); }); break;
    case "harp": c.beginPath(); c.moveTo(8, 34); c.quadraticCurveTo(4, 8, 22, 6); c.quadraticCurveTo(34, 8, 30, 34); c.closePath(); F("#9fd0a0"); c.lineWidth = 1.3; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(13 + i * 4.5, 12 + i * 2); c.lineTo(13 + i * 4.5, 32); c.stroke(); } break;
    case "violin": c.beginPath(); c.ellipse(16, 27, 9, 8, -.7, 0, 7); F("#b57c4a"); c.beginPath(); c.ellipse(24, 19, 6, 5, -.7, 0, 7); F("#b57c4a"); c.beginPath(); c.moveTo(27, 16); c.lineTo(36, 6); c.stroke(); c.beginPath(); c.moveTo(6, 15); c.lineTo(34, 33); c.stroke(); break;
    case "bells": c.beginPath(); c.moveTo(6, 8); c.lineTo(34, 8); c.stroke(); [[10, 14], [20, 20], [30, 14]].forEach((p, i) => { c.beginPath(); c.moveTo(p[0], 8); c.lineTo(p[0], p[1]); c.stroke(); c.beginPath(); c.moveTo(p[0] - 5, p[1] + 12); c.quadraticCurveTo(p[0] - 5, p[1], p[0], p[1]); c.quadraticCurveTo(p[0] + 5, p[1], p[0] + 5, p[1] + 12); c.closePath(); F(["#9fd6ee", "#c9a8f0", "#f6d97a"][i]); }); break;
    case "ocarina": c.beginPath(); c.moveTo(4, 24); c.quadraticCurveTo(6, 10, 20, 11); c.quadraticCurveTo(34, 12, 36, 25); c.quadraticCurveTo(33, 33, 20, 33); c.quadraticCurveTo(8, 33, 4, 24); c.closePath(); F("#d9a878"); c.fillStyle = INK; [[13, 21], [19, 18], [25, 20], [29, 25]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 1.9, 0, 7); c.fill(); }); c.beginPath(); c.moveTo(7, 15); c.lineTo(3, 9); c.lineWidth = 4; c.stroke(); break;
    case "drum": c.beginPath(); c.moveTo(7, 14); c.lineTo(7, 31); c.quadraticCurveTo(20, 38, 33, 31); c.lineTo(33, 14); c.closePath(); F("#b57c4a"); c.beginPath(); c.ellipse(20, 14, 13, 5, 0, 0, 7); F("#f2e4c0"); c.lineWidth = 1.5; c.beginPath(); c.moveTo(9, 20); c.lineTo(15, 32); c.lineTo(21, 20); c.lineTo(27, 32); c.lineTo(31, 22); c.stroke(); c.lineWidth = 2.4; c.beginPath(); c.moveTo(26, 4); c.lineTo(17, 12); c.stroke(); break;
    case "kalimba": c.beginPath(); c.rect(6, 8, 28, 26); F("#c98a4a"); [[11, 22], [15.5, 17], [20, 14], [24.5, 17], [29, 22]].forEach((p, i) => { c.beginPath(); c.rect(p[0] - 1.8, p[1], 3.6, 31 - p[1]); F(["#e8d8b0", "#f0e4c4", "#ffe9a0", "#f0e4c4", "#e8d8b0"][i]); }); c.beginPath(); c.arc(20, 28, 2.4, 0, 7); c.fillStyle = INK; c.fill(); break;
    case "pan": [[6, 10], [12, 13], [18, 16], [24, 19], [30, 22]].forEach((p, i) => { c.beginPath(); c.rect(p[0] - 2.6, p[1], 5.4, 30 - p[1]); F(["#bfe4f8", "#a8d8f2", "#c8c0f8", "#a8d8f2", "#bfe4f8"][i]); c.fillStyle = INK; c.beginPath(); c.ellipse(p[0] + .1, p[1] + 1.6, 1.4, 1.1, 0, 0, 7); c.fill(); }); c.beginPath(); c.moveTo(4, 24); c.lineTo(34, 30); c.lineWidth = 3.4; c.stroke(); c.lineWidth = 1.6; c.strokeStyle = "#c9915a"; c.stroke(); break;
    case "glass": [[10, 24, 8], [20, 20, 11], [30, 24, 8]].forEach((p, i) => { c.beginPath(); c.ellipse(p[0], p[1], p[2], 5, 0, 0, 7); F(["rgba(170,220,255,.85)", "rgba(210,190,255,.85)", "rgba(170,240,230,.85)"][i]); }); c.beginPath(); c.moveTo(4, 34); c.lineTo(36, 34); c.stroke(); c.fillStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.ellipse(16, 18, 3, 1.2, -.3, 0, 7); c.fill(); break;
    case "gong": c.lineWidth = 3; c.beginPath(); c.moveTo(4, 36); c.lineTo(6, 6); c.lineTo(34, 6); c.lineTo(36, 36); c.stroke(); c.lineWidth = 2.4; c.beginPath(); c.arc(20, 21, 11, 0, 7); F("#d9b24a"); c.beginPath(); c.arc(20, 21, 5.5, 0, 7); F("#f2d878"); c.beginPath(); c.moveTo(20, 6); c.lineTo(20, 10); c.stroke(); break;
    case "conch": c.beginPath(); c.moveTo(6, 27); c.quadraticCurveTo(6, 11, 22, 9); c.quadraticCurveTo(34, 10, 35, 22); c.quadraticCurveTo(30, 33, 17, 33); c.quadraticCurveTo(6, 33, 6, 27); c.closePath(); F("#fbd8cc"); c.lineWidth = 1.4; c.beginPath(); c.moveTo(12, 28); c.quadraticCurveTo(14, 16, 24, 15); c.quadraticCurveTo(29, 15, 29, 21); c.stroke(); c.beginPath(); c.moveTo(17, 28); c.quadraticCurveTo(19, 22, 24, 21); c.stroke(); c.lineWidth = 2.4; c.fillStyle = "#f6a8b8"; c.beginPath(); c.moveTo(6, 27); c.quadraticCurveTo(3, 34, 10, 36); c.quadraticCurveTo(14, 33, 12, 28); c.fill(); c.stroke(); break;
    case "tube": c.beginPath(); c.moveTo(6, 30); c.lineTo(30, 6); c.lineTo(36, 12); c.lineTo(12, 36); c.closePath(); F("#8fb0a8"); c.strokeStyle = "rgba(30,60,60,.55)"; c.lineWidth = 1.6; [[14, 22], [20, 16], [26, 10]].forEach(p => { c.beginPath(); c.moveTo(p[0] - 2, p[1] + 3); c.lineTo(p[0] + 3, p[1] - 2); c.stroke(); }); c.strokeStyle = INK; c.lineWidth = 2.4; c.fillStyle = "#e8f6f4"; c.beginPath(); c.ellipse(33, 9, 4.4, 3, .8, 0, 7); c.fill(); c.stroke(); break;
    case "chorus": c.beginPath(); c.moveTo(6, 30); c.quadraticCurveTo(4, 12, 20, 8); c.quadraticCurveTo(36, 12, 34, 30); c.quadraticCurveTo(20, 36, 6, 30); c.closePath(); F("#fdf2fa"); [[12, 21], [20, 16], [28, 21]].forEach((p, i) => { c.beginPath(); c.arc(p[0], p[1], 3.2, 0, 7); F(["#f6b8d8", "#b9a8f0", "#9fe0e8"][i]); }); c.fillStyle = "#ffe27a"; c.lineWidth = 1.4; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 2 : 4.8; i ? c.lineTo(20 + Math.cos(a) * q, 28 + Math.sin(a) * q) : c.moveTo(20 + Math.cos(a) * q, 28 + Math.sin(a) * q); } c.closePath(); c.fill(); c.stroke(); break;
    case "bag": c.beginPath(); c.moveTo(10, 14); c.quadraticCurveTo(4, 34, 12, 35); c.lineTo(28, 35); c.quadraticCurveTo(36, 34, 30, 14); c.closePath(); F("#c9915a"); c.beginPath(); c.moveTo(12, 14); c.quadraticCurveTo(20, 8, 28, 14); c.stroke(); break;
    case "idx": c.beginPath(); c.moveTo(6, 8); c.lineTo(20, 11); c.lineTo(34, 8); c.lineTo(34, 33); c.lineTo(20, 36); c.lineTo(6, 33); c.closePath(); F("#f3e7c6"); c.beginPath(); c.moveTo(20, 11); c.lineTo(20, 36); c.stroke(); break;
    case "inv": c.beginPath(); c.moveTo(12, 6); c.lineTo(28, 6); c.lineTo(28, 12); c.quadraticCurveTo(36, 20, 30, 33); c.lineTo(10, 33); c.quadraticCurveTo(4, 20, 12, 12); c.closePath(); F("rgba(190,230,240,.85)"); c.fillStyle = "#a066e0"; c.beginPath(); c.arc(20, 26, 4, 0, 7); c.fill(); break;
    case "qst": c.beginPath(); c.rect(8, 6, 24, 30); F("#f5ecd0"); c.lineWidth = 1.6; [14, 20, 26].forEach(yy => { c.beginPath(); c.moveTo(12, yy); c.lineTo(28, yy); c.stroke(); }); break;
    case "note": c.beginPath(); c.ellipse(15, 29, 7, 5, -.4, 0, 7); F("#fff"); c.beginPath(); c.moveTo(21, 27); c.lineTo(21, 7); c.lineTo(31, 11); c.stroke(); break;
  }
  c.restore();
}
const kindIcon = k => ({ horn: "horn", bowl: "bowl", sharp: "sharp", organ: "organ", fork: "fork", flute: "flute", lute: "lute", tamb: "tamb", harp: "harp", violin: "violin", bells: "bells", ocarina: "ocarina", drum: "drum", kalimba: "kalimba", pan: "pan", glass: "glass", gong: "gong", conch: "conch", tube: "tube", chorus: "chorus" }[k]);

/* ----- Hauptbild ----- */
function render(g, t) {
  const c = ctx; c.setTransform(DPR * Z, 0, 0, DPR * Z, 0, 0);
  const vw = VW / Z, vh = VH / Z;
  camX = clamp(g.px, vw / 2, WW * TS - vw / 2); camY = clamp(g.py, vh / 2, WH * TS - vh / 2);
  if (WW * TS < vw) camX = WW * TS / 2; if (WH * TS < vh) camY = WH * TS / 2;
  const ox = camX - vw / 2, oy = camY - vh / 2;
  c.fillStyle = "#2a3350"; c.fillRect(0, 0, vw, vh);
  c.save(); c.translate(-ox, -oy);
  const g0x = Math.floor(ox / (CH * TS)), g1x = Math.floor((ox + vw) / (CH * TS)), g0y = Math.floor(oy / (CH * TS)), g1y = Math.floor((oy + vh) / (CH * TS));
  for (let gy = Math.max(0, g0y); gy <= Math.min(Math.floor(WH / CH), g1y); gy++) for (let gx = Math.max(0, g0x); gx <= Math.min(Math.floor(WW / CH), g1x); gx++) { const ch = getChunk(gx, gy); c.drawImage(ch, gx * CH * TS, gy * CH * TS, CH * TS + 1.5, CH * TS + 1.5); }
  // Wasser: bewegte Wellen und Glitzer
  { const wx0 = Math.max(0, Math.floor(ox / TS)), wx1 = Math.min(WW - 1, Math.ceil((ox + vw) / TS)), wy0 = Math.max(0, Math.floor(oy / TS)), wy1 = Math.min(WH - 1, Math.ceil((oy + vh) / TS)); c.save(); c.lineCap = "round"; c.lineJoin = "round";
    for (let y = wy0; y <= wy1; y++) for (let x = wx0; x <= wx1; x++) {
      if (T[y][x] !== 3) continue; const px = x * TS, py = y * TS, ph = hs(x, y, 300) * 6.28;
      for (let k = 0; k < 2; k++) { const u = (t * (.35 + .1 * k) + hs(x, y, 301 + k)) % 1, wxp = px + 2 + u * 22, wyp = py + 8 + k * 14 + hs(x, y, 303 + k) * 6 + Math.sin(t * 1.6 + ph + k * 2) * 1.5, al = Math.sin(u * Math.PI);
        c.globalAlpha = .75 * al; c.strokeStyle = "#f4fbff"; c.lineWidth = 1.7; c.beginPath(); c.moveTo(wxp, wyp); c.quadraticCurveTo(wxp + 4, wyp - 3.5, wxp + 8, wyp); c.quadraticCurveTo(wxp + 12, wyp + 3.5, wxp + 16, wyp); c.stroke(); }
      const sp = Math.sin(t * 2.3 + ph * 3); if (sp > .86 && hs(x, y, 305) < .5) { c.globalAlpha = (sp - .86) * 6; c.fillStyle = "#fff"; sparkle(c, px + 5 + hs(x, y, 306) * 22, py + 5 + hs(x, y, 307) * 22, 2.2); }
    } c.restore(); }
  // Tor
  drawGate(c, S.flags.gateOpen, t, GATE, false); drawGate(c, S.flags.gate3Open, t, GATE3, true); drawGate4(c, S.flags.gate4Open, t, GATE4);
  // Dinge nach Tiefe sortiert
  const items = [];
  HOUSES.forEach(h => { if (h.x * TS < ox + vw + 40 && (h.x + h.w) * TS > ox - 40 && h.y * TS < oy + vh + 40 && (h.y + h.h) * TS > oy - 40) items.push({ y: (h.y + h.h) * TS, f: () => drawHouse(c, h, t) }); });
  Object.keys(NPCS).forEach(id => { const n = NPCS[id]; if (n.secret && !S.flags["open_" + id]) return; const px = n.x * TS + TS / 2, py = n.y * TS + TS - 4; if (px < ox - 40 || px > ox + vw + 40 || py < oy - 60 || py > oy + vh + 60) return;
    items.push({ y: py, f: () => { drawPerson(c, px, py, n.col, n.hat, { look: NPC_LOOK[id], face: g.px > px ? 1 : -1 }, t); const m = npcMark(id); if (m) { c.save(); c.font = "bold 26px 'Caveat Brush',cursive"; c.textAlign = "center"; c.lineWidth = 4; c.strokeStyle = INK; c.fillStyle = m === "!" ? "#ffd23f" : m === "?" ? "#7bd88f" : "#9ad3ff"; const by = py - 62 + Math.sin(t * 4) * 3; c.strokeText(m, px, by); c.fillText(m, px, by); c.restore(); } } }); });
  items.push({ y: g.py + 6, f: () => { { const ml = meLook(); drawPerson(c, g.px, g.py + 6, ml.col, ml.hat, { moving: g.moving, face: g.face, look: ml.look }, t); }; drawHeld(c, g.px, g.py + 6, g.face, g.hd, t, g.moving); } });
  if (typeof drawOthers === "function") drawOthers(c, items, t, ox, oy, vw, vh);
  items.sort((a, b) => a.y - b.y).forEach(it => it.f());
  // Glühen in Höhlen
  c.globalCompositeOperation = "lighter";
  const tx0 = Math.max(0, Math.floor(ox / TS)), tx1 = Math.min(WW - 1, Math.ceil((ox + vw) / TS)), ty0 = Math.max(0, Math.floor(oy / TS)), ty1 = Math.min(WH - 1, Math.ceil((oy + vh) / TS));
  for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) if (T[y][x] === 4 && y >= AREA_SPLIT) { const z = ZN[y][x]; if (z === "saal" || z === "becken" || z === "pilz" || z === "nordlicht" || z === "sternwarte" || z === "gewitter" || z === "tiefe") { const gr = c.createRadialGradient(x * TS + 16, y * TS + 14, 2, x * TS + 16, y * TS + 14, 44); gr.addColorStop(0, z === "pilz" ? "rgba(220,120,255,.38)" : z === "nordlicht" ? "rgba(110,255,200,.38)" : z === "sternwarte" ? "rgba(255,225,120,.34)" : z === "gewitter" ? "rgba(255,240,120,.3)" : z === "tiefe" ? "rgba(80,230,255,.4)" : "rgba(110,190,255,.38)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x * TS - 30, y * TS - 30, 94, 94); } }
  c.globalCompositeOperation = "source-over";
  c.restore();
  // Dunkelheit
  const zi = ZINFO[zoneAt(g.px / TS | 0, g.py / TS | 0)], dk = Math.max(zi.dark, zi.a === 1 ? nightAmt() * 0.58 : zi.a === 4 && zi.dark < .3 ? nightAmt() * 0.46 : 0);
  if (dk > 0.01) {
    if (!render.dk) render.dk = document.createElement("canvas"); const d = render.dk; if (d.width !== cv.width || d.height !== cv.height) { d.width = cv.width; d.height = cv.height; }
    const dc = d.getContext("2d"); dc.setTransform(1, 0, 0, 1, 0, 0); dc.globalCompositeOperation = "source-over"; dc.clearRect(0, 0, d.width, d.height);
    dc.fillStyle = zi.a === 1 ? "rgba(12,16,52,1)" : "rgba(10,10,36,1)"; dc.globalAlpha = dk; dc.fillRect(0, 0, d.width, d.height); dc.globalAlpha = 1;
    dc.globalCompositeOperation = "destination-out"; const sx = (g.px - ox) * Z * DPR, sy = (g.py - oy - 12) * Z * DPR, rr = (zi.a === 1 ? 330 : 270) * Z * DPR; const gr = dc.createRadialGradient(sx, sy, rr * 0.15, sx, sy, rr); gr.addColorStop(0, "rgba(0,0,0,.95)"); gr.addColorStop(1, "rgba(0,0,0,0)"); dc.fillStyle = gr; dc.fillRect(0, 0, d.width, d.height);
    c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(d, 0, 0);
  }
  // Vignette und Lichtstaub
  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  const vg = c.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.35, VW / 2, VH / 2, Math.max(VW, VH) * 0.78); vg.addColorStop(0, "rgba(10,12,34,0)"); vg.addColorStop(1, zi.a === 1 ? "rgba(10,18,40,.38)" : "rgba(8,6,28,.55)"); c.fillStyle = vg; c.fillRect(0, 0, VW, VH);
  c.globalCompositeOperation = "lighter";
  const night = zi.a === 1 && nightAmt() > 0.5, nm = 46;
  for (let i = 0; i < nm; i++) {
    const sp = 6 + hs(i, 1, 7) * 10, fx = ((hs(i, 2, 7) * (VW + 200) + t * sp * (hs(i, 3, 7) < .5 ? 1 : -1) * 0.6) % (VW + 200) + VW + 200) % (VW + 200) - 100, fy = ((hs(i, 4, 7) * (VH + 200) - t * sp * 0.7) % (VH + 200) + VH + 200) % (VH + 200) - 100 + Math.sin(t * 0.8 + i) * 12;
    const pul = 0.5 + 0.5 * Math.sin(t * 1.6 + i * 2.1);
    if (night) { /* keine Leuchtpartikel bei Nacht */ }
    else if (zi.a >= 2) { c.fillStyle = "rgba(170,190,255," + (0.12 + 0.2 * pul) + ")"; c.beginPath(); c.arc(fx, fy, 1.6 + pul, 0, 7); c.fill(); }
    else if (i % 2 === 0) { c.fillStyle = "rgba(255,246,190," + (0.1 + 0.18 * pul) + ")"; c.beginPath(); c.arc(fx, fy, 1.6, 0, 7); c.fill(); }
  }
  if (dk > 0.3) { const sx2 = (g.px - ox) * Z, sy2 = (g.py - oy - 12) * Z, wr = 150 * Z, wg = c.createRadialGradient(sx2, sy2, 4, sx2, sy2, wr); wg.addColorStop(0, "rgba(255,225,160,.20)"); wg.addColorStop(1, "rgba(255,225,160,0)"); c.fillStyle = wg; c.fillRect(sx2 - wr, sy2 - wr, wr * 2, wr * 2); }
  c.globalCompositeOperation = "source-over";
  c.setTransform(DPR * Z, 0, 0, DPR * Z, 0, 0);
  return { ox, oy };
}
