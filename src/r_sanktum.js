/* ===== Sanktum Magus: Malerei (Backstein, Regale, Teppiche, Zauberdinge), im gleichen handgezeichneten Stil ===== */
const SKC = { wall: "#1b2550", wall2: "#222f60", brick: "#0f1632", lip: "#566fc0", cyan: "#6ae6ff", vio: "#9a7aff", gold: "#f5cf63", car: "#2d49bd", car2: "#253ca4", carL: "#6f8cff" };
const BOOKC = ["#b84a4a", "#4a7ac8", "#d9b04a", "#5ab08a", "#8a5ac8", "#c86a9a", "#e8e0c0", "#3a9aa8", "#c8844a"];
const skZ = (x, y) => (ZN[y] && ZN[y][x]) || "halle";
function skFloorBase(x, y, z) {
  const zi = ZINFO[z] || ZINFO.halle, k = hs(x, y, 1);
  if (z === "archiv" || z === "galerie" || z === "lese") return mixHex("#6a6c9e", "#5c5e90", k);
  if (z === "halle" || z === "thron") return (x + y) % 2 ? mixHex(zi.col, "#ffffff", .06) : mixHex(zi.col2, "#000000", .1);
  if (z === "hof") return mixHex("#5f8ab8", "#4f7aa8", k);
  if (z === "gewaechs") return mixHex("#3f8a86", "#357c78", k);
  if (z === "spiegel") return mixHex("#8c9ad4", "#7a88c4", k);
  if (z === "zellen") return mixHex("#434a78", "#3a4070", k);
  if (z === "labor") return mixHex("#4f7a90", "#456f84", k);
  return mixHex(zi.col, zi.col2, k * .8);
}
function skStar(c, x, y, r, n, inner) { c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, q = i % 2 ? r * inner : r; i ? c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : c.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); }
function skBooks(c, px, py, w, h, seed, rows) { // Buchrücken in Reihen
  for (let r = 0; r < rows; r++) { const ry = py + r * (h / rows); let bx = px + 1.5; let i = 0; while (bx < px + w - 3) { const bw = 2.6 + hs(seed, r * 31 + i, 5) * 2.6, bh = h / rows - 2.4 - hs(seed, r * 31 + i, 6) * 2.6; c.fillStyle = BOOKC[(hs(seed, r * 31 + i, 7) * BOOKC.length) | 0]; c.fillRect(bx, ry + (h / rows - 1.6) - bh, bw, bh); c.fillStyle = "rgba(0,0,10,.28)"; c.fillRect(bx + bw - .8, ry + (h / rows - 1.6) - bh, .8, bh); if (hs(seed, r * 31 + i, 8) < .18) { c.fillStyle = "rgba(255,230,150,.7)"; c.fillRect(bx + 1, ry + (h / rows - 1.6) - bh + 2, bw - 2, 1); } bx += bw + .4; i++; }
    c.fillStyle = "#2a1d3a"; c.fillRect(px, ry + h / rows - 1.7, w, 2.2); }
}
function skShelfFace(c, px, py, seed) { // Regal von vorn, eine Kachel
  c.fillStyle = "#33264a"; c.fillRect(px, py, TS, TS); c.fillStyle = "#1e1530"; c.fillRect(px, py, TS, 2.4); skBooks(c, px + 1, py + 3, TS - 2, TS - 5, seed, 3);
  c.strokeStyle = INK; c.lineWidth = 1.4; c.strokeRect(px + .7, py + .7, TS - 1.4, TS - 1.4);
}
function skBrick(c, px, py, x, y, face, z) {
  c.fillStyle = face ? SKC.wall2 : SKC.wall; c.fillRect(px, py, TS, TS);
  c.strokeStyle = SKC.brick; c.lineWidth = 1.3; c.beginPath(); for (let r = 0; r < 4; r++) { const yy = py + r * 8 + .5; c.moveTo(px, yy); c.lineTo(px + TS, yy); const off = (r + x + y) % 2 ? 0 : 8; for (let bx = px + off; bx < px + TS; bx += 16) { c.moveTo(bx + .5, yy); c.lineTo(bx + .5, yy + 8); } } c.stroke();
  for (let i = 0; i < 3; i++) { c.fillStyle = hs(x, y, 20 + i) < .5 ? "rgba(120,150,255,.10)" : "rgba(0,0,20,.16)"; c.fillRect(px + hs(x, y, 23 + i) * 24, py + hs(x, y, 26 + i) * 26, 7 + hs(x, y, 29 + i) * 5, 5); }
}
function skMirrorFace(c, px, py, x, y) {
  c.fillStyle = "#6f7fc0"; c.fillRect(px, py, TS, TS); const g = c.createLinearGradient(px, py, px + TS, py + TS); g.addColorStop(0, "#e8f0ff"); g.addColorStop(.5, "#9fb6ee"); g.addColorStop(1, "#dce6ff"); c.fillStyle = g; c.fillRect(px + 3, py + 3, TS - 6, TS - 6);
  c.strokeStyle = "rgba(255,255,255,.85)"; c.lineWidth = 2; c.beginPath(); c.moveTo(px + 8, py + TS - 6); c.lineTo(px + 18, py + 6); c.moveTo(px + 16, py + TS - 6); c.lineTo(px + 22, py + 14); c.stroke();
  c.strokeStyle = SKC.gold; c.lineWidth = 2.2; c.strokeRect(px + 2, py + 2, TS - 4, TS - 4); c.strokeStyle = INK; c.lineWidth = 1.4; c.strokeRect(px + .7, py + .7, TS - 1.4, TS - 1.4);
}
function skGlassFace(c, px, py, x, y) {
  c.fillStyle = "#235a5c"; c.fillRect(px, py, TS, TS); const g = c.createLinearGradient(px, py, px, py + TS); g.addColorStop(0, "#9ff0e0"); g.addColorStop(1, "#3aa89a"); c.fillStyle = g; c.fillRect(px + 2, py + 2, TS - 4, TS - 4);
  c.strokeStyle = "#1a4a48"; c.lineWidth = 2; c.beginPath(); c.moveTo(px + TS / 2, py); c.lineTo(px + TS / 2, py + TS); c.moveTo(px, py + TS / 2); c.lineTo(px + TS, py + TS / 2); c.stroke();
  c.fillStyle = "rgba(255,255,255,.5)"; c.beginPath(); c.moveTo(px + 5, py + 5); c.lineTo(px + 12, py + 5); c.lineTo(px + 5, py + 14); c.closePath(); c.fill();
}
function skTorch(c, px, py) { // Wandfackel mit blau-türkiser Flamme (animierte Flamme kommt als Glühen obendrauf)
  c.strokeStyle = INK; c.lineWidth = 2; c.fillStyle = "#5a5f82"; c.beginPath(); c.moveTo(px + 12, py + 26); c.lineTo(px + 20, py + 26); c.lineTo(px + 18, py + 16); c.lineTo(px + 14, py + 16); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = "#3a3f62"; c.beginPath(); c.moveTo(px + 11, py + 16); c.lineTo(px + 21, py + 16); c.lineTo(px + 24, py + 11); c.lineTo(px + 8, py + 11); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = "#5aeaff"; c.beginPath(); c.moveTo(px + 16, py + 1); c.quadraticCurveTo(px + 23, py + 7, px + 19, py + 11); c.quadraticCurveTo(px + 16, py + 12, px + 13, py + 11); c.quadraticCurveTo(px + 9, py + 7, px + 16, py + 1); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = "#eaffff"; c.beginPath(); c.ellipse(px + 16, py + 8, 2.4, 3.4, 0, 0, 7); c.fill();
}
function skWindow(c, px, py, x, y) { // gotisches Fenster mit Mondschein
  c.fillStyle = "#0d1030"; c.beginPath(); c.moveTo(px + 6, py + 28); c.lineTo(px + 6, py + 12); c.quadraticCurveTo(px + 16, py - 4, px + 26, py + 12); c.lineTo(px + 26, py + 28); c.closePath(); c.fill();
  const g = c.createLinearGradient(px, py, px, py + 30); g.addColorStop(0, "#9ab6ff"); g.addColorStop(1, "#4a5ed8"); c.fillStyle = g; c.beginPath(); c.moveTo(px + 8, py + 27); c.lineTo(px + 8, py + 12.5); c.quadraticCurveTo(px + 16, py - .5, px + 24, py + 12.5); c.lineTo(px + 24, py + 27); c.closePath(); c.fill();
  c.strokeStyle = "#0d1030"; c.lineWidth = 1.6; c.beginPath(); c.moveTo(px + 16, py + 2); c.lineTo(px + 16, py + 27); c.moveTo(px + 8, py + 17); c.lineTo(px + 24, py + 17); c.stroke(); c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(px + 6, py + 28); c.lineTo(px + 6, py + 12); c.quadraticCurveTo(px + 16, py - 4, px + 26, py + 12); c.lineTo(px + 26, py + 28); c.stroke();
  c.fillStyle = "rgba(255,255,255,.75)"; skStar(c, px + 12, py + 10, 2.4, 4, .4); c.fill();
}
function skBanner(c, px, py, seed) {
  const col = ["#3c58d8", "#7a4ad0", "#c84a6a", "#2a9a98"][(hs(seed, 1, 3) * 4) | 0]; c.strokeStyle = INK; c.lineWidth = 2; c.fillStyle = "#c9a540"; c.fillRect(px + 7, py + 1, 18, 3); c.strokeRect(px + 7, py + 1, 18, 3);
  c.fillStyle = col; c.beginPath(); c.moveTo(px + 9, py + 4); c.lineTo(px + 23, py + 4); c.lineTo(px + 23, py + 27); c.lineTo(px + 16, py + 22); c.lineTo(px + 9, py + 27); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = SKC.gold; skStar(c, px + 16, py + 13, 4.4, 5, .45); c.fill(); c.lineWidth = 1; c.stroke();
}
function skRunes(c, px, py, x, y, a) { c.save(); c.strokeStyle = a || "rgba(130,200,255,.28)"; c.lineWidth = 1.2; c.beginPath(); const cx = px + 16, cy = py + 16, r = 9; for (let i = 0; i < 3; i++) { const an = hs(x, y, 60 + i) * 6.28; c.moveTo(cx + Math.cos(an) * 3, cy + Math.sin(an) * 3); c.lineTo(cx + Math.cos(an + 1.4) * r, cy + Math.sin(an + 1.4) * r); } c.stroke(); c.restore(); }
/* ----- Dekoration ----- */
function skShadow(c, px, py, r) { c.fillStyle = "rgba(0,0,25,.32)"; c.beginPath(); c.ellipse(px + 16, py + 28, r || 13, 5, 0, 0, 7); c.fill(); }
function skPillar(c, px, py) { skShadow(c, px, py, 12); c.strokeStyle = INK; c.lineWidth = 2.2; c.fillStyle = "#6a76b8"; c.beginPath(); c.rect(px + 7, py - 14, 18, 42); c.fill(); c.stroke(); c.fillStyle = "#8c98d4"; c.fillRect(px + 8, py - 13, 5, 40); c.fillStyle = "#4e5898"; c.beginPath(); c.moveTo(px + 4, py + 28); c.lineTo(px + 28, py + 28); c.lineTo(px + 26, py + 22); c.lineTo(px + 6, py + 22); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(px + 4, py - 14); c.lineTo(px + 28, py - 14); c.lineTo(px + 26, py - 20); c.lineTo(px + 6, py - 20); c.closePath(); c.fill(); c.stroke(); c.strokeStyle = "rgba(20,30,90,.55)"; c.lineWidth = 1.3; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(px + 13 + k * 4, py - 12); c.lineTo(px + 13 + k * 4, py + 22); c.stroke(); } c.fillStyle = SKC.cyan; c.globalAlpha = .8; skStar(c, px + 16, py + 4, 3, 4, .4); c.fill(); c.globalAlpha = 1; }
function skStatue(c, px, py, seed) { skShadow(c, px, py, 13); c.strokeStyle = INK; c.lineWidth = 2.2; c.fillStyle = "#59639c"; c.beginPath(); c.rect(px + 5, py + 18, 22, 10); c.fill(); c.stroke(); c.fillStyle = "#8a96d0"; c.beginPath(); c.moveTo(px + 9, py + 18); c.lineTo(px + 8, py - 2); c.quadraticCurveTo(px + 16, py - 8, px + 24, py - 2); c.lineTo(px + 23, py + 18); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.arc(px + 16, py - 9, 6, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#5a66a8"; c.beginPath(); c.moveTo(px + 8, py - 12); c.lineTo(px + 16, py - 26); c.lineTo(px + 24, py - 12); c.closePath(); c.fill(); c.stroke(); c.strokeStyle = SKC.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(px + 22, py + 2); c.lineTo(px + 28, py - 14); c.stroke(); c.fillStyle = SKC.cyan; skStar(c, px + 28, py - 16, 3.6, 4, .4); c.fill(); }
function skShelfProp(c, px, py, seed) { skShadow(c, px, py, 14); c.strokeStyle = INK; c.lineWidth = 2; c.fillStyle = "#33264a"; c.beginPath(); c.rect(px + 2, py - 16, 28, 44); c.fill(); c.stroke(); skBooks(c, px + 4, py - 14, 24, 40, seed, 4); c.strokeRect(px + 2, py - 16, 28, 44); }
function skTable(c, px, py, seed) { skShadow(c, px, py, 13); c.strokeStyle = INK; c.lineWidth = 2; c.fillStyle = "#4a3866"; c.beginPath(); c.rect(px + 4, py + 6, 24, 18); c.fill(); c.stroke(); c.fillStyle = "#6a5890"; c.beginPath(); c.rect(px + 2, py + 2, 28, 10); c.fill(); c.stroke(); c.fillStyle = "#f0e6c8"; c.beginPath(); c.moveTo(px + 6, py + 3); c.lineTo(px + 15, py + 5); c.lineTo(px + 15, py + 11); c.lineTo(px + 6, py + 9); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(px + 17, py + 5); c.lineTo(px + 26, py + 3); c.lineTo(px + 26, py + 9); c.lineTo(px + 17, py + 11); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#6af0ff"; c.beginPath(); c.arc(px + 24, py - 1, 2.6, 0, 7); c.fill(); }
function skCauldron(c, px, py, seed) { skShadow(c, px, py, 13); c.strokeStyle = INK; c.lineWidth = 2.2; c.fillStyle = "#2a2f48"; c.beginPath(); c.moveTo(px + 5, py + 8); c.quadraticCurveTo(px + 2, py + 28, px + 16, py + 28); c.quadraticCurveTo(px + 30, py + 28, px + 27, py + 8); c.closePath(); c.fill(); c.stroke(); c.fillStyle = hs(seed, 1, 2) < .5 ? "#5af0b8" : "#c08aff"; c.beginPath(); c.ellipse(px + 16, py + 8, 11, 4, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.arc(px + 12, py + 7, 1.6, 0, 7); c.arc(px + 19, py + 9, 1.2, 0, 7); c.fill(); c.strokeStyle = "#3a3f62"; c.lineWidth = 2.4; c.beginPath(); c.moveTo(px + 8, py + 28); c.lineTo(px + 6, py + 32); c.moveTo(px + 24, py + 28); c.lineTo(px + 26, py + 32); c.stroke(); }
function skPlant(c, px, py, seed) { skShadow(c, px, py, 12); const col = ["#3aa88a", "#58c8a0", "#8a6ad8", "#c86aa8"][(hs(seed, 1, 4) * 4) | 0]; c.strokeStyle = INK; c.lineWidth = 2; for (let i = 0; i < 5; i++) { const a = -1.9 + i * .45 + hs(seed, i, 9) * .2, l = 14 + hs(seed, i, 10) * 14; c.fillStyle = i % 2 ? col : "#2e8a78"; c.beginPath(); c.moveTo(px + 16, py + 26); c.quadraticCurveTo(px + 16 + Math.cos(a) * l * .8 - 6, py + 26 + Math.sin(a) * l * .5, px + 16 + Math.cos(a) * l, py + 26 + Math.sin(a) * l); c.quadraticCurveTo(px + 16 + Math.cos(a) * l * .8 + 6, py + 26 + Math.sin(a) * l * .5, px + 16, py + 26); c.fill(); c.stroke(); } c.fillStyle = "#e8fff6"; for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(px + 9 + hs(seed, i, 11) * 14, py + 4 + hs(seed, i, 12) * 8, 2.2, 0, 7); c.fill(); } }
function skCrystal(c, px, py, seed) { skShadow(c, px, py, 12); const col = hs(seed, 1, 5) < .5 ? "#7fdcff" : "#c8a0ff"; c.lineJoin = "round"; for (const [x, y, w, h] of [[8, 28, 5, 20], [16, 29, 7, 32], [24, 28, 5, 17]]) { c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(px + x - w, py + y); c.lineTo(px + x - w / 2, py + y - h); c.lineTo(px + x + w / 2, py + y - h * .85); c.lineTo(px + x + w, py + y); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "rgba(255,255,255,.5)"; c.beginPath(); c.moveTo(px + x - w / 2, py + y); c.lineTo(px + x - w / 2, py + y - h * .8); c.lineTo(px + x, py + y - h * .9); c.lineTo(px + x - 1, py + y); c.closePath(); c.fill(); } }
function skBrazier(c, px, py) { skShadow(c, px, py, 11); c.strokeStyle = INK; c.lineWidth = 2; c.fillStyle = "#3a3f62"; c.beginPath(); c.moveTo(px + 9, py + 28); c.lineTo(px + 23, py + 28); c.lineTo(px + 19, py + 14); c.lineTo(px + 13, py + 14); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(px + 6, py + 14); c.lineTo(px + 26, py + 14); c.lineTo(px + 22, py + 6); c.lineTo(px + 10, py + 6); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#5aeaff"; c.beginPath(); c.moveTo(px + 16, py - 10); c.quadraticCurveTo(px + 24, py - 2, px + 21, py + 6); c.lineTo(px + 11, py + 6); c.quadraticCurveTo(px + 8, py - 2, px + 16, py - 10); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#eaffff"; c.beginPath(); c.ellipse(px + 16, py + 1, 2.8, 4.4, 0, 0, 7); c.fill(); }
function skBannerProp(c, px, py, seed) { skShadow(c, px, py, 10); c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.moveTo(px + 16, py + 28); c.lineTo(px + 16, py - 18); c.stroke(); c.strokeStyle = "#8a94c8"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(px + 16, py + 28); c.lineTo(px + 16, py - 18); c.stroke(); const col = ["#3c58d8", "#7a4ad0", "#c84a6a", "#2a9a98"][(hs(seed, 1, 3) * 4) | 0]; c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(px + 16, py - 16); c.lineTo(px + 30, py - 14); c.lineTo(px + 30, py + 8); c.lineTo(px + 23, py + 4); c.lineTo(px + 16, py + 8); c.closePath(); c.fill(); c.stroke(); c.fillStyle = SKC.gold; skStar(c, px + 23, py - 4, 4, 5, .45); c.fill(); }
function skThrone(c, px, py) { skShadow(c, px, py, 16); c.strokeStyle = INK; c.lineWidth = 2.4; c.fillStyle = "#4a2f8a"; c.beginPath(); c.moveTo(px - 6, py + 28); c.lineTo(px - 6, py - 30); c.lineTo(px + 6, py - 40); c.lineTo(px + 16, py - 32); c.lineTo(px + 26, py - 40); c.lineTo(px + 38, py - 30); c.lineTo(px + 38, py + 28); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#6a4ac8"; c.beginPath(); c.rect(px, py - 4, 32, 32); c.fill(); c.stroke(); c.fillStyle = SKC.gold; skStar(c, px + 16, py - 20, 8, 5, .45); c.fill(); c.stroke(); c.beginPath(); c.rect(px - 8, py + 8, 48, 8); c.fillStyle = "#c9a540"; c.fill(); c.stroke(); }
function skCage(c, px, py) { skShadow(c, px, py, 13); c.strokeStyle = INK; c.lineWidth = 2; c.fillStyle = "rgba(40,48,80,.55)"; c.beginPath(); c.rect(px + 4, py - 6, 24, 34); c.fill(); c.stroke(); c.strokeStyle = "#5a6294"; c.lineWidth = 2.4; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(px + 8 + i * 5.4, py - 6); c.lineTo(px + 8 + i * 5.4, py + 28); c.stroke(); } c.beginPath(); c.moveTo(px + 4, py + 8); c.lineTo(px + 28, py + 8); c.stroke(); c.fillStyle = "#e8e0c0"; c.beginPath(); c.arc(px + 22, py + 22, 3, 0, 7); c.fill(); }
function skChains(c, px, py) { skShadow(c, px, py, 10); c.strokeStyle = INK; c.lineWidth = 2; c.fillStyle = "#6a6f94"; for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(px + 16 + (k % 2 ? 2 : -2), py - 12 + k * 6, 3.2, 4.4, 0, 0, 7); c.fill(); c.stroke(); } c.beginPath(); c.arc(px + 16, py + 26, 4, 0, 7); c.fill(); c.stroke(); }
function skMirrorProp(c, px, py, seed) { skShadow(c, px, py, 12); c.strokeStyle = INK; c.lineWidth = 2.2; c.fillStyle = SKC.gold; c.beginPath(); c.ellipse(px + 16, py + 6, 12, 20, 0, 0, 7); c.fill(); c.stroke(); const g = c.createLinearGradient(px + 6, py - 10, px + 26, py + 22); g.addColorStop(0, "#f4f8ff"); g.addColorStop(.5, "#9fb6ee"); g.addColorStop(1, "#e0eaff"); c.fillStyle = g; c.beginPath(); c.ellipse(px + 16, py + 6, 9, 17, 0, 0, 7); c.fill(); c.stroke(); c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = 2; c.beginPath(); c.moveTo(px + 11, py + 14); c.lineTo(px + 17, py - 4); c.stroke(); }
function skRail(c, px, py, x, y) { c.strokeStyle = INK; c.lineWidth = 2.4; c.fillStyle = "#7a86c8"; const h = T[y] && T[y][x - 1] === 4 && T[y][x + 1] === 4; if (h || !(T[y - 1] && T[y - 1][x] === 4)) { c.beginPath(); c.rect(px, py + 12, TS, 6); c.fill(); c.stroke(); for (let i = 0; i < 3; i++) { c.beginPath(); c.rect(px + 4 + i * 11, py + 16, 4, 12); c.fillStyle = "#5a66a8"; c.fill(); c.stroke(); } } else { c.beginPath(); c.rect(px + 12, py, 8, TS); c.fillStyle = "#7a86c8"; c.fill(); c.stroke(); } }
function skGlobe(c, px, py) { skShadow(c, px, py, 12); c.strokeStyle = INK; c.lineWidth = 2; c.fillStyle = "#4a3866"; c.beginPath(); c.rect(px + 10, py + 20, 12, 8); c.fill(); c.stroke(); c.fillStyle = "#58b8d8"; c.beginPath(); c.arc(px + 16, py + 6, 13, 0, 7); c.fill(); c.stroke(); c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = 1.4; c.beginPath(); c.ellipse(px + 16, py + 6, 13, 5, 0, 0, 7); c.moveTo(px + 16, py - 7); c.lineTo(px + 16, py + 19); c.stroke(); c.fillStyle = "#c9a540"; c.fillRect(px + 14.5, py - 10, 3, 4); }
function skChest(c, px, py) { skShadow(c, px, py, 12); c.strokeStyle = INK; c.lineWidth = 2; c.fillStyle = "#6a3f8a"; c.beginPath(); c.rect(px + 4, py + 10, 24, 16); c.fill(); c.stroke(); c.beginPath(); c.moveTo(px + 4, py + 10); c.quadraticCurveTo(px + 16, py - 2, px + 28, py + 10); c.fill(); c.stroke(); c.fillStyle = SKC.gold; c.fillRect(px + 14, py + 10, 4, 8); c.strokeRect(px + 14, py + 10, 4, 8); }
function skClockProp(c, px, py) { skShadow(c, px, py, 12); c.strokeStyle = INK; c.lineWidth = 2.2; c.fillStyle = "#6a4a88"; c.beginPath(); c.rect(px + 8, py - 18, 16, 46); c.fill(); c.stroke(); c.fillStyle = "#f0e6c8"; c.beginPath(); c.arc(px + 16, py - 6, 9, 0, 7); c.fill(); c.stroke(); c.lineWidth = 1.8; c.beginPath(); c.moveTo(px + 16, py - 6); c.lineTo(px + 16, py - 12); c.moveTo(px + 16, py - 6); c.lineTo(px + 21, py - 4); c.stroke(); c.fillStyle = SKC.gold; c.beginPath(); c.arc(px + 16, py + 14, 4, 0, 7); c.fill(); c.stroke(); }
function skDeco(c, px, py, x, y, z, kind, seed) {
  switch (kind) { case "pillar": return skPillar(c, px, py); case "statue": return skStatue(c, px, py, seed); case "shelf": return skShelfProp(c, px, py, seed); case "table": return skTable(c, px, py, seed); case "cauldron": return skCauldron(c, px, py, seed); case "plant": return skPlant(c, px, py, seed); case "crystal": return skCrystal(c, px, py, seed); case "brazier": return skBrazier(c, px, py); case "banner": return skBannerProp(c, px, py, seed); case "throne": return skThrone(c, px, py); case "cage": return skCage(c, px, py); case "chains": return skChains(c, px, py); case "mirror": return skMirrorProp(c, px, py, seed); case "rail": return skRail(c, px, py, x, y); case "globe": return skGlobe(c, px, py); case "chest": return skChest(c, px, py); case "clock": return skClockProp(c, px, py); case "orrery": return; }
  skPillar(c, px, py);
}
/* ----- Chunk ----- */
function paintSanctum(gx, gy) {
  const L = LAYERS[LAYER], cvs = document.createElement("canvas"); cvs.width = cvs.height = CH * TS * RS; const c = cvs.getContext("2d");
  c.scale(RS, RS); c.translate(-gx * CH * TS, -gy * CH * TS); c.lineJoin = c.lineCap = "round";
  const x0 = gx * CH, y0 = gy * CH, ok = (x, y) => x >= 0 && y >= 0 && x < WW && y < WH, V = (x, y) => (T[y] ? T[y][x] : 0), isF = (x, y) => { const v = V(x, y); return v === 1 || v === 2 || v === 4 && !(L.dk && L.dk[x + "," + y] === undefined && false); };
  // Boden
  for (let y = y0 - 1; y <= y0 + CH; y++) for (let x = x0 - 1; x <= x0 + CH; x++) {
    if (!ok(x, y)) continue; const v = V(x, y), z = skZ(x, y), px = x * TS, py = y * TS;
    if (v === 0 || v === 5) continue;
    if (v === 3) { const g = c.createLinearGradient(px, py, px + TS, py + TS); g.addColorStop(0, "#3a86e8"); g.addColorStop(1, "#7a5ae0"); c.fillStyle = g; c.fillRect(px, py, TS + .5, TS + .5); c.strokeStyle = "rgba(180,240,255,.55)"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(px + 3, py + 10); c.quadraticCurveTo(px + 10, py + 6, px + 17, py + 10); c.quadraticCurveTo(px + 24, py + 14, px + 30, py + 10); c.moveTo(px + 2, py + 22); c.quadraticCurveTo(px + 9, py + 18, px + 16, py + 22); c.stroke(); continue; }
    if (v === 2) { c.fillStyle = hs(x, y, 2) < .5 ? SKC.car : SKC.car2; c.fillRect(px, py, TS + .5, TS + .5); c.strokeStyle = SKC.gold; c.lineWidth = 1.4; c.globalAlpha = .8; if (!(V(x, y - 1) === 2)) { c.beginPath(); c.moveTo(px, py + 2.5); c.lineTo(px + TS, py + 2.5); c.stroke(); } if (!(V(x, y + 1) === 2)) { c.beginPath(); c.moveTo(px, py + TS - 2.5); c.lineTo(px + TS, py + TS - 2.5); c.stroke(); } if (!(V(x - 1, y) === 2)) { c.beginPath(); c.moveTo(px + 2.5, py); c.lineTo(px + 2.5, py + TS); c.stroke(); } if (!(V(x + 1, y) === 2)) { c.beginPath(); c.moveTo(px + TS - 2.5, py); c.lineTo(px + TS - 2.5, py + TS); c.stroke(); } c.globalAlpha = 1;
      c.strokeStyle = SKC.carL; c.globalAlpha = .35; c.lineWidth = 1.2; c.beginPath(); c.moveTo(px + 16, py + 6); c.lineTo(px + 26, py + 16); c.lineTo(px + 16, py + 26); c.lineTo(px + 6, py + 16); c.closePath(); c.stroke(); c.globalAlpha = 1; continue; }
    c.fillStyle = skFloorBase(x, y, z); c.fillRect(px, py, TS + .5, TS + .5);
    c.strokeStyle = "rgba(10,16,50,.28)"; c.lineWidth = 1.2; c.beginPath();
    if (z === "archiv" || z === "galerie" || z === "lese") { for (let k = 1; k < 4; k++) { c.moveTo(px, py + k * 8 + .5); c.lineTo(px + TS, py + k * 8 + .5); } c.moveTo(px + ((x * 3 + y) % 2 ? 10 : 22), py); c.lineTo(px + ((x * 3 + y) % 2 ? 10 : 22), py + 8); c.moveTo(px + 16, py + 16); c.lineTo(px + 16, py + 24); }
    else if (z === "halle" || z === "thron") { c.rect(px + .5, py + .5, TS - 1, TS - 1); if ((x + y) % 2 === 0 && hs(x, y, 3) < .5) { c.moveTo(px + 6, py + 6); c.lineTo(px + 26, py + 26); } }
    else if (z === "hof") { c.rect(px + .5, py + .5, TS - 1, TS - 1); c.moveTo(px + 16, py); c.lineTo(px + 16, py + 12); c.moveTo(px, py + 20); c.lineTo(px + 16, py + 20); }
    else if (z === "spiegel") { c.moveTo(px + 4, py + TS - 4); c.lineTo(px + 18, py + 4); c.moveTo(px + 14, py + TS - 4); c.lineTo(px + 24, py + 12); }
    else if (z === "gewaechs") { for (let k = 0; k < 3; k++) { const sx = px + 4 + hs(x, y, 40 + k) * 24, sy = py + 8 + hs(x, y, 44 + k) * 18; c.moveTo(sx, sy); c.lineTo(sx - 2, sy - 6); c.moveTo(sx, sy); c.lineTo(sx + 3, sy - 5); } }
    else { c.rect(px + .5, py + .5, TS - 1, TS - 1); }
    c.stroke();
    if (hs(x, y, 70) < .05) skRunes(c, px, py, x, y); if (hs(x, y, 71) < .08) { c.fillStyle = "rgba(160,220,255,.5)"; sparkle(c, px + 5 + hs(x, y, 72) * 22, py + 5 + hs(x, y, 73) * 22, 2); }
    if (z === "orrerium") { const d = Math.hypot(x - 80, y - 13); if (Math.abs(d - 4) < .5 || Math.abs(d - 7) < .5 || Math.abs(d - 10) < .5) { c.fillStyle = "rgba(255,225,130,.35)"; c.fillRect(px, py, TS, TS); } }
  }
  // Rand-Schatten an Wänden
  for (let y = y0 - 1; y <= y0 + CH; y++) for (let x = x0 - 1; x <= x0 + CH; x++) {
    if (!ok(x, y)) continue; const v = V(x, y); if (v === 0 || v === 5 || v === 3) continue; const px = x * TS, py = y * TS;
    const sh = (x1, y1, w, h, gx1, gy1, gx2, gy2) => { const g = c.createLinearGradient(gx1, gy1, gx2, gy2); g.addColorStop(0, "rgba(5,8,35,.5)"); g.addColorStop(1, "rgba(5,8,35,0)"); c.fillStyle = g; c.fillRect(x1, y1, w, h); };
    if (V(x, y - 1) === 0) sh(px, py, TS, 14, 0, py, 0, py + 14); if (V(x - 1, y) === 0) sh(px, py, 10, TS, px, 0, px + 10, 0); if (V(x + 1, y) === 0) sh(px + TS - 10, py, 10, TS, px + TS, 0, px + TS - 10, 0);
  }
  // Wände, Fronten und Leere
  for (let y = y0 - 1; y <= y0 + CH + 1; y++) for (let x = x0 - 1; x <= x0 + CH; x++) {
    if (!ok(x, y)) continue; const v = V(x, y), z = skZ(x, y), px = x * TS, py = y * TS;
    if (z === "leere" && (v === 0 || v === 5)) { const g = c.createLinearGradient(px, py, px, py + TS); g.addColorStop(0, "#0d1130"); g.addColorStop(1, "#171c46"); c.fillStyle = g; c.fillRect(px, py, TS + .5, TS + .5); if (hs(x, y, 80) < .5) { c.fillStyle = "rgba(190,210,255,.8)"; c.fillRect(px + hs(x, y, 81) * 28, py + hs(x, y, 82) * 28, 1.6, 1.6); } if (hs(x, y, 83) < .12) { c.fillStyle = "rgba(160,90,255,.22)"; c.beginPath(); c.ellipse(px + 16, py + 16, 14, 9, hs(x, y, 84), 0, 7); c.fill(); } continue; }
    if (v === 0 || v === 5) {
      const face = isFl(x, y + 1), top = isFl(x, y - 1);
      if (z === "archiv" && face) skShelfFace(c, px, py, x * 7 + y); else if (z === "spiegel" && face) skMirrorFace(c, px, py, x, y); else if (z === "gewaechs" && face) skGlassFace(c, px, py, x, y); else skBrick(c, px, py, x, y, face, z);
      if (face && z !== "archiv" && z !== "spiegel" && z !== "gewaechs") { const r = hs(x, y, 77); if (r < .16 && !isTorchNear(x, y)) skTorch(c, px, py); else if (r < .25 && z !== "zellen") skWindow(c, px, py, x, y); else if (r < .31 && (z === "thron" || z === "halle" || z === "galerie")) skBanner(c, px, py, x * 3 + y); }
      if (top && !face) { c.fillStyle = SKC.lip; c.fillRect(px, py + TS - 8, TS, 8); c.fillStyle = "rgba(255,255,255,.18)"; c.fillRect(px, py + TS - 8, TS, 2); c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.moveTo(px, py + TS - 7.5); c.lineTo(px + TS, py + TS - 7.5); c.stroke(); }
      if (face) { c.fillStyle = "rgba(5,8,35,.3)"; c.fillRect(px, py + TS - 5, TS, 5); }
    } else if (v === 4) {
      const kind = (L.dk && L.dk[x + "," + y]) || (z === "archiv" ? "shelf" : "pillar"); skDeco(c, px, py, x, y, z, kind, x * 7 + y);
    }
  }
  // Tintenkanten Boden/Wand
  c.strokeStyle = INK; c.lineWidth = 2.4; c.globalAlpha = .9;
  for (let y = y0 - 1; y <= y0 + CH; y++) for (let x = x0 - 1; x <= x0 + CH; x++) { if (!ok(x, y)) continue; const a = V(x, y) === 0 || V(x, y) === 5 ? 0 : 1; const px = x * TS, py = y * TS; c.beginPath();
    if (a === 0) { if (V(x, y + 1) !== 0 && V(x, y + 1) !== 5 && y + 1 < WH) { c.moveTo(px, py + TS); c.lineTo(px + TS, py + TS); } } else { if (V(x, y - 1) === 0 || V(x, y - 1) === 5) { c.moveTo(px, py); c.lineTo(px + TS, py); } if (V(x - 1, y) === 0 || V(x - 1, y) === 5) { c.moveTo(px, py); c.lineTo(px, py + TS); } if (V(x + 1, y) === 0 || V(x + 1, y) === 5) { c.moveTo(px + TS, py); c.lineTo(px + TS, py + TS); } }
    c.stroke(); }
  c.globalAlpha = 1; return cvs;
  function isFl(x, y) { const v = V(x, y); return v !== 0 && v !== 5 && ok(x, y) && skZ(x, y) !== "leere"; }
  function isTorchNear(x, y) { return false; }
}
