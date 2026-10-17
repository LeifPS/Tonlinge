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
  if (v === 3) return ["#7fb6d8", "#6fa8cf"][(hs(x, y, 1) * 2) | 0];
  if (v === 0 || v === 5) return y < AREA_SPLIT ? ["#43803f", "#3b7539"][(hs(x, y, 1) * 2) | 0] : ["#3a3560", "#332e57"][(hs(x, y, 1) * 2) | 0];
  const zi = ZINFO[z || "wiese"] || ZINFO.wiese; return mixHex(zi.col, zi.col2, hs(x, y, 1) * 0.55);
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
    if (!ok(x, y)) continue; const v = T[y][x], px = x * TS, py = y * TS, z = ZN[y][x], a1 = y < AREA_SPLIT;
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
    } else { // Höhlenboden: Risse, Funkeln
      c.strokeStyle = "rgba(40,40,90,.35)"; c.lineWidth = 1.3; if (hs(x, y, 140) < .45) { const cx0 = px + 5 + hs(x, y, 141) * 18, cy0 = py + 6 + hs(x, y, 142) * 18; c.beginPath(); c.moveTo(cx0, cy0); c.lineTo(cx0 + 5, cy0 + 3); c.lineTo(cx0 + 4, cy0 + 8); c.lineTo(cx0 + 10, cy0 + 10); c.stroke(); }
      if (hs(x, y, 143) < .5) { c.fillStyle = "rgba(255,255,255,.4)"; c.beginPath(); c.arc(px + hs(x, y, 144) * 30, py + hs(x, y, 145) * 30, 1.6, 0, 7); c.fill(); }
      if (hs(x, y, 146) < .25) { c.fillStyle = "rgba(90,90,140,.45)"; c.beginPath(); c.ellipse(px + 6 + hs(x, y, 147) * 20, py + 22 + hs(x, y, 148) * 6, 3, 2, 0, 0, 7); c.fill(); }
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
    if (!ok(x, y)) continue; const v = T[y][x], px = x * TS, py = y * TS, z = ZN[y][x], a1 = y < AREA_SPLIT;
    if (v === 0 || v === 5) {
      if (a1) { const open = cls(x, y + 1) === 1 || cls(x, y - 1) === 1; c.strokeStyle = "rgba(10,40,20,.35)"; c.lineWidth = 1.4; c.beginPath(); for (let i = 0; i < 3; i++) { const sx = px + 4 + hs(x, y, 30 + i) * 24, sy = py + 4 + hs(x, y, 40 + i) * 24; c.moveTo(sx, sy); c.lineTo(sx + 5, sy + 6); } c.stroke(); bamboo(c, px, py, x * 131 + y, open ? 5 : 4, open ? 36 : 30); }
      else { c.strokeStyle = "rgba(10,8,30,.5)"; c.lineWidth = 1.4; c.beginPath(); for (let i = 0; i < 4; i++) { const sx = px + 3 + hs(x, y, 30 + i) * 24, sy = py + 3 + hs(x, y, 40 + i) * 22; c.moveTo(sx, sy); c.lineTo(sx + 6, sy + 8); } c.stroke();
        if (hs(x, y, 150) < .25) { c.strokeStyle = "rgba(140,130,200,.35)"; c.lineWidth = 1.3; c.beginPath(); const sx = px + 6 + hs(x, y, 151) * 16, sy = py + 8 + hs(x, y, 152) * 14; c.moveTo(sx, sy); c.lineTo(sx + 6, sy + 4); c.lineTo(sx + 5, sy + 10); c.stroke(); } }
    } else if (v === 3) {
      c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 1.6; c.beginPath(); const wx = px + 6 + hs(x, y, 20) * 10, wy = py + 10 + hs(x, y, 21) * 12; c.moveTo(wx, wy); c.quadraticCurveTo(wx + 5, wy - 4, wx + 10, wy); c.quadraticCurveTo(wx + 15, wy + 4, wx + 20, wy); c.stroke();
    } else if (v === 4) {
      if (a1) { const r = hs(x, y, 9); if (r < .5) bamboo(c, px, py, x * 17 + y * 3, 6, 34); else bush(c, px, py, x * 7 + y, z === "wald" ? "#4f9150" : z === "wind" ? "#8cc468" : "#68ad5a", z !== "wald"); }
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
  else { for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8 + t * .6, q = i % 2 ? u * .62 : u * 1.2; i ? c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : c.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); }
  c.fill(); c.stroke();
}
function drawTonling(c, sp, cx, cy, size, t, mut, opts = {}) {
  const s = size, wob2 = Math.sin(t * 5 + cx * 0.1) * 0.04, bounce = Math.abs(Math.sin(t * 3 + cy * 0.1)) * s * 0.08;
  c.save(); c.translate(cx, cy - bounce); c.scale(1 + wob2, 1 - wob2); c.lineJoin = c.lineCap = "round";
  c.lineWidth = Math.max(2, s * 0.06); c.strokeStyle = INK;
  const rc = RAR[sp.r].col;
  if (sp.r >= 3 || sp.x === "glow") { const g = c.createRadialGradient(0, 0, s * .1, 0, 0, s * (sp.r >= 3 ? 1.1 : .85)); g.addColorStop(0, sp.r === 4 ? "rgba(255,225,100,.55)" : sp.r === 3 ? "rgba(170,110,240,.45)" : "rgba(255,230,160,.4)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.beginPath(); c.arc(0, 0, s * 1.1, 0, 7); c.fill(); }
  if (sp.r === 4) { c.save(); c.rotate(t * .35); c.fillStyle = "rgba(255,226,110,.28)"; for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); c.beginPath(); c.moveTo(0, 0); c.lineTo(-s * .12, -s * 1.15); c.lineTo(s * .12, -s * 1.15); c.closePath(); c.fill(); } c.restore(); }
  const alpha = mut === "glas" ? 0.72 : 1; c.globalAlpha = alpha;
  // Körper
  c.fillStyle = mut === "stern" ? "#cdbbf0" : sp.body; c.beginPath(); c.ellipse(0, s * .2, s * .38, s * .4, 0, 0, 7); c.fill(); c.stroke();
  if (sp.mark === "spots") { c.fillStyle = "rgba(160,100,60,.35)"; [[-.15, .3], [.12, .1], [.1, .4]].forEach(p => { c.beginPath(); c.arc(p[0] * s, p[1] * s, s * .05, 0, 7); c.fill(); }); }
  if (sp.mark === "stripes") { c.strokeStyle = "rgba(160,110,30,.5)"; c.lineWidth = s * .04; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-s * .3, s * (.12 + i * .13)); c.quadraticCurveTo(0, s * (.18 + i * .13), s * .3, s * (.12 + i * .13)); c.stroke(); } c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06); }
  if (sp.mark === "fringe") { c.strokeStyle = "rgba(60,90,50,.55)"; c.lineWidth = s * .03; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * s * .09, s * .5); c.lineTo(i * s * .09, s * .6); c.stroke(); } c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06); }
  if (sp.r >= 2) { const rr = sp.r, col = RAR[rr].col; c.save(); c.beginPath(); c.ellipse(0, s * .2, s * .38, s * .4, 0, 0, 7); c.clip();
    if (rr >= 3) { const g = c.createLinearGradient(0, -s * .2, 0, s * .6); g.addColorStop(0, "rgba(255,255,255,.5)"); g.addColorStop(.45, "rgba(255,255,255,0)"); g.addColorStop(1, hexA(col, rr === 4 ? .55 : .4)); c.fillStyle = g; c.fillRect(-s, -s, s * 2, s * 2); }
    c.restore(); emblem(c, rr, 0, s * .45, s * (rr === 2 ? .07 : .09), col, t); }
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
  c.globalAlpha = 1;
  if (mut === "glas") { c.strokeStyle = "rgba(255,255,255,.8)"; c.lineWidth = s * .03; c.beginPath(); c.arc(0, s * .2, s * .3, Math.PI * 1.1, Math.PI * 1.5); c.stroke(); }
  if (mut === "funkel" || mut === "stern") { c.fillStyle = mut === "stern" ? "#f1e3ff" : "#fff3b0"; for (let i = 0; i < 5; i++) { const a = t * 1.4 + i * 1.26, rr = s * (.5 + .1 * Math.sin(t * 2 + i)); const sx = Math.cos(a) * rr, sy = Math.sin(a) * rr * .8; c.beginPath(); c.moveTo(sx, sy - s * .06); c.lineTo(sx + s * .02, sy); c.lineTo(sx, sy + s * .06); c.lineTo(sx - s * .02, sy); c.closePath(); c.fill(); } }
  if (sp.r >= 2) { const n = sp.r === 2 ? 2 : sp.r === 3 ? 4 : 6, col = sp.r === 4 ? "#fff0a0" : sp.r === 3 ? "#e2c8ff" : "#cfe4ff"; c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = Math.max(1, s * .02);
    for (let i = 0; i < n; i++) { const a = t * (.7 + sp.r * .12) + i * Math.PI * 2 / n, rr2 = s * (.66 + .08 * Math.sin(t * 2 + i * 2)), pu = .55 + .45 * Math.sin(t * 4 + i * 1.7); sparkle(c, Math.cos(a) * rr2, Math.sin(a) * rr2 * .85 + s * .1, s * .09 * pu + s * .02); } }
  c.restore();
}

/* ----- Figuren ----- */
function drawPerson(c, x, y, col, hat, opt, t) {
  const bob = opt.moving ? Math.abs(Math.sin(t * 10)) * 2 : Math.sin(t * 2 + x) * 0.8, sc = 1.1;
  c.save(); c.translate(x, y); c.scale(sc, sc); c.lineJoin = c.lineCap = "round"; c.lineWidth = 2; c.strokeStyle = INK;
  c.fillStyle = "rgba(20,30,40,.22)"; c.beginPath(); c.ellipse(0, 1, 10, 4, 0, 0, 7); c.fill();
  c.fillStyle = col; c.beginPath(); c.ellipse(0, -9 - bob, 8, 10, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = "#f2d3b0"; c.beginPath(); c.arc(0, -22 - bob, 6.5, 0, 7); c.fill(); c.stroke();
  if (opt.beard) { c.fillStyle = "#e8e2d2"; c.beginPath(); c.ellipse(0, -17 - bob, 5.5, 4, 0, 0, Math.PI); c.fill(); c.stroke(); }
  c.fillStyle = hat; c.beginPath(); c.ellipse(0, -26 - bob, 9, 3, 0, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.ellipse(0, -29 - bob, 5.5, 5, 0, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = INK; const fx = opt.face || 0; c.beginPath(); c.arc(-2.4 + fx * 1.2, -22 - bob, 0.9, 0, 7); c.arc(2.4 + fx * 1.2, -22 - bob, 0.9, 0, 7); c.fill();
  c.restore();
}
/* Was jemand in der Hand hält: "i:<Art>" für ein Instrument, "t:<Tonling>:<Mutation>" für einen Tonling */
function drawHeld(c, x, y, face, hd, t, moving) {
  if (!hd) return; const f = face || 1, p = hd.split(":"), bob = moving ? Math.abs(Math.sin(t * 10)) * 2 : 0;
  if (p[0] === "i") { c.save(); c.translate(x + f * 11, y - 16 - bob); c.rotate(f * .35); drawIcon(c, kindIcon(p[1]) || "flute", -9, -9, 18); c.restore(); }
  else if (SP[p[1]]) { c.save(); c.translate(x + f * 17, y - 9 - bob * .5); drawTonling(c, SP[p[1]], 0, 0, 22, t, p[2] || null); c.restore(); }
}
function drawHouse(c, h) {
  const x = h.x * TS, y = h.y * TS, w = h.w * TS, hh = h.h * TS;
  c.save(); c.lineJoin = "round"; c.lineWidth = 2.5; c.strokeStyle = INK;
  c.fillStyle = "#f0e2c0"; c.fillRect(x + 3, y + 22, w - 6, hh - 22); c.strokeRect(x + 3, y + 22, w - 6, hh - 22);
  c.fillStyle = h.roof; c.beginPath(); c.moveTo(x - 6, y + 28); c.lineTo(x + w / 2, y - 12); c.lineTo(x + w + 6, y + 28); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = "rgba(0,0,0,.25)"; c.lineWidth = 1.5; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(x - 6 + i * 9, y + 28 - i * 6); c.lineTo(x + w / 2, y + 28 - i * 11); c.stroke(); }
  c.strokeStyle = INK; c.lineWidth = 2.5; c.fillStyle = "#6a4a2c"; const dx = x + w / 2 - 8; c.fillRect(dx, y + hh - 26, 16, 26); c.strokeRect(dx, y + hh - 26, 16, 26);
  c.fillStyle = "#bde3f2"; c.fillRect(x + 12, y + 34, 14, 14); c.strokeRect(x + 12, y + 34, 14, 14);
  if (h.sign) { c.fillStyle = "#e9d9a8"; c.fillRect(x + w - 40, y + hh - 24, 34, 15); c.strokeRect(x + w - 40, y + hh - 24, 34, 15); c.fillStyle = INK; c.font = "11px 'Patrick Hand',cursive"; c.textAlign = "center"; c.fillText(h.sign, x + w - 23, y + hh - 13); }
  c.restore();
}
function drawGate(c, open, t) {
  const x = GATE.x * TS, y = GATE.y * TS, w = GATE.w * TS;
  c.save(); c.lineWidth = 2.5; c.strokeStyle = INK; c.lineJoin = "round";
  c.fillStyle = "#5a5f7d"; c.fillRect(x - 10, y - 10, 14, TS + 14); c.strokeRect(x - 10, y - 10, 14, TS + 14); c.fillRect(x + w - 4, y - 10, 14, TS + 14); c.strokeRect(x + w - 4, y - 10, 14, TS + 14);
  c.fillRect(x - 10, y - 18, w + 20, 12); c.strokeRect(x - 10, y - 18, w + 20, 12);
  if (!open) { c.fillStyle = "#7b5b3a"; for (let i = 0; i < 6; i++) { const px = x + 6 + i * ((w - 12) / 5.5); c.fillRect(px, y - 6, 7, TS + 6); c.strokeRect(px, y - 6, 7, TS + 6); } c.fillStyle = "#e9c46a"; c.beginPath(); c.arc(x + w / 2, y + TS / 2, 6, 0, 7); c.fill(); c.stroke(); }
  else { c.fillStyle = "rgba(255,255,255,.12)"; c.fillRect(x + 4, y - 6, w - 8, TS + 6); }
  c.restore();
}

/* ----- Icons für Leiste und Fenster ----- */
function drawIcon(c, kind, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s / 40, s / 40); c.lineJoin = c.lineCap = "round"; c.lineWidth = 2.4; c.strokeStyle = INK;
  const F = (col) => { c.fillStyle = col; c.fill(); c.stroke(); };
  switch (kind) {
    case "flute": c.beginPath(); c.moveTo(6, 30); c.lineTo(32, 8); c.lineTo(35, 12); c.lineTo(9, 34); c.closePath(); F("#d9a15a"); c.fillStyle = INK; [[14, 26], [19, 22], [24, 18]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 1.6, 0, 7); c.fill(); }); break;
    case "lute": c.beginPath(); c.ellipse(15, 27, 11, 9, -.7, 0, 7); F("#c98a4a"); c.beginPath(); c.moveTo(21, 21); c.lineTo(35, 7); c.stroke(); c.beginPath(); c.arc(15, 27, 2.5, 0, 7); c.fillStyle = INK; c.fill(); break;
    case "tamb": c.beginPath(); c.arc(20, 21, 14, 0, 7); F("#f0d9a0"); c.fillStyle = "#e0b04a"; [0, 1.57, 3.14, 4.7].forEach(a => { c.beginPath(); c.arc(20 + Math.cos(a) * 14, 21 + Math.sin(a) * 14, 3, 0, 7); c.fill(); c.stroke(); }); break;
    case "harp": c.beginPath(); c.moveTo(8, 34); c.quadraticCurveTo(4, 8, 22, 6); c.quadraticCurveTo(34, 8, 30, 34); c.closePath(); F("#9fd0a0"); c.lineWidth = 1.3; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(13 + i * 4.5, 12 + i * 2); c.lineTo(13 + i * 4.5, 32); c.stroke(); } break;
    case "violin": c.beginPath(); c.ellipse(16, 27, 9, 8, -.7, 0, 7); F("#b57c4a"); c.beginPath(); c.ellipse(24, 19, 6, 5, -.7, 0, 7); F("#b57c4a"); c.beginPath(); c.moveTo(27, 16); c.lineTo(36, 6); c.stroke(); c.beginPath(); c.moveTo(6, 15); c.lineTo(34, 33); c.stroke(); break;
    case "bells": c.beginPath(); c.moveTo(6, 8); c.lineTo(34, 8); c.stroke(); [[10, 14], [20, 20], [30, 14]].forEach((p, i) => { c.beginPath(); c.moveTo(p[0], 8); c.lineTo(p[0], p[1]); c.stroke(); c.beginPath(); c.moveTo(p[0] - 5, p[1] + 12); c.quadraticCurveTo(p[0] - 5, p[1], p[0], p[1]); c.quadraticCurveTo(p[0] + 5, p[1], p[0] + 5, p[1] + 12); c.closePath(); F(["#9fd6ee", "#c9a8f0", "#f6d97a"][i]); }); break;
    case "bag": c.beginPath(); c.moveTo(10, 14); c.quadraticCurveTo(4, 34, 12, 35); c.lineTo(28, 35); c.quadraticCurveTo(36, 34, 30, 14); c.closePath(); F("#c9915a"); c.beginPath(); c.moveTo(12, 14); c.quadraticCurveTo(20, 8, 28, 14); c.stroke(); break;
    case "idx": c.beginPath(); c.moveTo(6, 8); c.lineTo(20, 11); c.lineTo(34, 8); c.lineTo(34, 33); c.lineTo(20, 36); c.lineTo(6, 33); c.closePath(); F("#f3e7c6"); c.beginPath(); c.moveTo(20, 11); c.lineTo(20, 36); c.stroke(); break;
    case "inv": c.beginPath(); c.moveTo(12, 6); c.lineTo(28, 6); c.lineTo(28, 12); c.quadraticCurveTo(36, 20, 30, 33); c.lineTo(10, 33); c.quadraticCurveTo(4, 20, 12, 12); c.closePath(); F("rgba(190,230,240,.85)"); c.fillStyle = "#a066e0"; c.beginPath(); c.arc(20, 26, 4, 0, 7); c.fill(); break;
    case "qst": c.beginPath(); c.rect(8, 6, 24, 30); F("#f5ecd0"); c.lineWidth = 1.6; [14, 20, 26].forEach(yy => { c.beginPath(); c.moveTo(12, yy); c.lineTo(28, yy); c.stroke(); }); break;
    case "note": c.beginPath(); c.ellipse(15, 29, 7, 5, -.4, 0, 7); F("#fff"); c.beginPath(); c.moveTo(21, 27); c.lineTo(21, 7); c.lineTo(31, 11); c.stroke(); break;
  }
  c.restore();
}
const kindIcon = k => ({ flute: "flute", lute: "lute", tamb: "tamb", harp: "harp", violin: "violin", bells: "bells" }[k]);

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
  for (let gy = Math.max(0, g0y); gy <= Math.min(Math.floor(WH / CH), g1y); gy++) for (let gx = Math.max(0, g0x); gx <= Math.min(Math.floor(WW / CH), g1x); gx++) { const ch = getChunk(gx, gy); c.drawImage(ch, gx * CH * TS, gy * CH * TS, CH * TS, CH * TS); }
  // Tor
  drawGate(c, S.flags.gateOpen, t);
  // Dinge nach Tiefe sortiert
  const items = [];
  HOUSES.forEach(h => { if (h.x * TS < ox + vw + 40 && (h.x + h.w) * TS > ox - 40 && h.y * TS < oy + vh + 40 && (h.y + h.h) * TS > oy - 40) items.push({ y: (h.y + h.h) * TS, f: () => drawHouse(c, h) }); });
  Object.keys(NPCS).forEach(id => { const n = NPCS[id]; if (n.secret && !S.flags["open_" + id]) return; const px = n.x * TS + TS / 2, py = n.y * TS + TS - 4; if (px < ox - 40 || px > ox + vw + 40 || py < oy - 60 || py > oy + vh + 60) return;
    items.push({ y: py, f: () => { drawPerson(c, px, py, n.col, n.hat, { beard: n.beard, face: g.px > px ? 1 : -1 }, t); const m = npcMark(id); if (m) { c.save(); c.font = "bold 26px 'Caveat Brush',cursive"; c.textAlign = "center"; c.lineWidth = 4; c.strokeStyle = INK; c.fillStyle = m === "!" ? "#ffd23f" : m === "?" ? "#7bd88f" : "#9ad3ff"; const by = py - 62 + Math.sin(t * 4) * 3; c.strokeText(m, px, by); c.fillText(m, px, by); c.restore(); } } }); });
  items.push({ y: g.py + 6, f: () => { drawPerson(c, g.px, g.py + 6, "#3f9ea0", "#d24e4e", { moving: g.moving, face: g.face }, t); drawHeld(c, g.px, g.py + 6, g.face, g.hd, t, g.moving); } });
  if (typeof drawOthers === "function") drawOthers(c, items, t, ox, oy, vw, vh);
  items.sort((a, b) => a.y - b.y).forEach(it => it.f());
  // Glühen in Höhlen
  c.globalCompositeOperation = "lighter";
  const tx0 = Math.max(0, Math.floor(ox / TS)), tx1 = Math.min(WW - 1, Math.ceil((ox + vw) / TS)), ty0 = Math.max(0, Math.floor(oy / TS)), ty1 = Math.min(WH - 1, Math.ceil((oy + vh) / TS));
  for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) if (T[y][x] === 4 && y >= AREA_SPLIT) { const z = ZN[y][x]; if (z === "saal" || z === "becken" || z === "pilz") { const gr = c.createRadialGradient(x * TS + 16, y * TS + 14, 2, x * TS + 16, y * TS + 14, 44); gr.addColorStop(0, z === "pilz" ? "rgba(220,120,255,.38)" : "rgba(110,190,255,.38)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(x * TS - 30, y * TS - 30, 94, 94); } }
  c.globalCompositeOperation = "source-over";
  c.restore();
  // Dunkelheit
  const zi = ZINFO[zoneAt(g.px / TS | 0, g.py / TS | 0)], dk = Math.max(zi.dark, zi.a === 1 ? nightAmt() * 0.58 : 0);
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
    if (night) { const r = 14 + pul * 8; const g2 = c.createRadialGradient(fx, fy, 0, fx, fy, r); g2.addColorStop(0, "rgba(220,255,140," + (0.55 * pul + .1) + ")"); g2.addColorStop(1, "rgba(220,255,140,0)"); c.fillStyle = g2; c.beginPath(); c.arc(fx, fy, r, 0, 7); c.fill(); }
    else if (zi.a === 2) { c.fillStyle = "rgba(170,190,255," + (0.12 + 0.2 * pul) + ")"; c.beginPath(); c.arc(fx, fy, 1.6 + pul, 0, 7); c.fill(); }
    else if (i % 2 === 0) { c.fillStyle = "rgba(255,246,190," + (0.1 + 0.18 * pul) + ")"; c.beginPath(); c.arc(fx, fy, 1.6, 0, 7); c.fill(); }
  }
  if (dk > 0.3) { const sx2 = (g.px - ox) * Z, sy2 = (g.py - oy - 12) * Z, wr = 150 * Z, wg = c.createRadialGradient(sx2, sy2, 4, sx2, sy2, wr); wg.addColorStop(0, "rgba(255,225,160,.20)"); wg.addColorStop(1, "rgba(255,225,160,0)"); c.fillStyle = wg; c.fillRect(sx2 - wr, sy2 - wr, wr * 2, wr * 2); }
  c.globalCompositeOperation = "source-over";
  c.setTransform(DPR * Z, 0, 0, DPR * Z, 0, 0);
  return { ox, oy };
}
