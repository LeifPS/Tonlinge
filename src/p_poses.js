/* ===== NPC-Posen: sitzen, liegen, angeln, reden, arbeiten, tanzen ... ===== */
const POSES = {
  tilda: { p: "hum" }, marlo: { p: "read", seat: "crate" }, ysa: { p: "dance" }, okko: { p: "fish", alt: "read" }, bora: { p: "lie", dir: 1 },
  fenn: { p: "wave" }, mooma: { p: "sit", seat: "stump" }, kerrin: { p: "work", dir: 1 }, dunn: { p: "talk", side: 1 }, lioba: { p: "sit", seat: "ground" },
  stimmer: { p: "hum" }, astra: { p: "scope" }, pim: { p: "sit", seat: "crate" }, selene: { p: "lie", dir: -1, sky: 1 }, nox: { p: "fish", alt: "sit" },
  gero: { p: "talk", side: -1 }, wenzel: { p: "read", seat: "stump" }, hueterin: { p: "hum" }, echo: { p: "sit", seat: "stump" }, rufus: { p: "talk", side: 1 },
  brum: { p: "work", dir: -1 }, gilda: { p: "dance" }, orla: { p: "scope" }, zeno: { p: "read", seat: "stump" }, mira: { p: "fish", alt: "wave" },
  tarn: { p: "sit", seat: "crate" }, korin: { p: "sit", seat: "ground" }, ebbe: { p: "fish", alt: "sit" }, hake: { p: "fish", alt: "sit" },
  tiefa: { p: "look" }, saenger: { p: "hum" }
};
const _poseCache = {}, AMB_SOLID = [];
function poseOf(id) {
  if (_poseCache[id]) return _poseCache[id];
  const n = NPCS[id], base = POSES[id] || { p: "look" }; let P = Object.assign({ seat: "stump", dir: 1 }, base);
  if (P.p === "fish") { // nächstes Wasser in der Nähe suchen
    let best = null, bd = 1e9; for (let dy = -8; dy <= 8; dy++) for (let dx = -8; dx <= 8; dx++) { const x = n.x + dx, y = n.y + dy; if (!T[y] || T[y][x] !== 3 || Math.abs(dx) < 2 && Math.abs(dy) < 2) continue; const d = Math.hypot(dx, dy * 1.4); if (d < bd) { bd = d; best = [x, y]; } }
    if (best && bd < 9) { P.wx = best[0]; P.wy = best[1]; } else P = Object.assign({ seat: "stump", dir: 1 }, base, { p: base.alt || "sit" });
  }
  if (P.p === "talk") { // Platz für den Gesprächspartner
    const fl = v => v === 1 || v === 2; let s = P.side || 1; if (!(T[n.y] && fl(T[n.y][n.x + s]))) s = -s; P.side = s; P.amb = true;
    AMB_SOLID.push([n.x * TS + TS / 2 + s * 30, n.y * TS + TS - 4]);
  }
  _poseCache[id] = P; return P;
}
function ambLook(id) {
  const r = k => hs(id.length * 13 + id.charCodeAt(0), k, 77), pk = (a, k) => a[Math.floor(r(k) * a.length) % a.length];
  const col = pk(CUS.oc, 1), ho = pk(CUS.hoc, 2);
  return { col, hat: ho, look: { skin: pk(CUS.sk, 3), hair: pk(CUS.hc, 4), hs: pk(CUS.hs, 5), ht: pk(["none", "cap", "floppy", "band", "beanie"], 6), ho, of: pk(["tunic", "vest", "apron", "dress"], 7), ac: pk(CUS.ac, 8), w: .88 + r(9) * .25, h: .92 + r(10) * .14 } };
}
function seatDraw(c, px, py, kind) {
  c.save(); c.lineJoin = "round"; c.strokeStyle = INK; c.lineWidth = 1.9;
  if (kind === "ground") { c.fillStyle = "rgba(20,30,40,.22)"; c.beginPath(); c.ellipse(px, py + 1, 13, 4.4, 0, 0, 7); c.fill(); }
  else if (kind === "crate") { c.fillStyle = "rgba(20,30,40,.22)"; c.beginPath(); c.ellipse(px, py + 2, 16, 4.6, 0, 0, 7); c.fill(); c.fillStyle = "#b98a54"; c.beginPath(); c.roundRect(px - 12, py - 10, 24, 12, 2); c.fill(); c.stroke(); c.strokeStyle = "rgba(29,39,66,.5)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(px - 12, py - 4); c.lineTo(px + 12, py - 4); c.moveTo(px - 4, py - 10); c.lineTo(px - 4, py + 2); c.stroke(); }
  else { c.fillStyle = "rgba(20,30,40,.22)"; c.beginPath(); c.ellipse(px, py + 2, 16, 4.6, 0, 0, 7); c.fill(); c.fillStyle = "#8d6a42"; c.beginPath(); c.moveTo(px - 10, py - 9); c.lineTo(px - 11, py + 1); c.quadraticCurveTo(px, py + 5, px + 11, py + 1); c.lineTo(px + 10, py - 9); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#c9a56e"; c.beginPath(); c.ellipse(px, py - 9, 10, 4, 0, 0, 7); c.fill(); c.stroke(); c.strokeStyle = "rgba(29,39,66,.35)"; c.lineWidth = 1; c.beginPath(); c.ellipse(px, py - 9, 5.4, 2.1, 0, 0, 7); c.stroke(); }
  c.restore();
}
function sitDraw(c, px, py, n, L, face, T, kind, gest) {
  seatDraw(c, px, py, kind); const gr = kind === "ground", sc = 1.12 * (L.h || 1);
  c.save(); c.beginPath(); c.rect(px - 40, py - 90, 80, 90 - (gr ? 5 : 9)); c.clip();
  drawPerson(c, px, py + (gr ? 4 : 0), n.col, n.hat, { look: L, face, noShadow: true, gest }, T); c.restore();
  const long = L.of === "robe" || L.of === "dress" || L.of === "cloak", pants = shade(n.col, -.38), k = L.w || 1; c.save(); c.lineCap = "round"; c.lineJoin = "round";
  if (long) { c.fillStyle = n.col; c.strokeStyle = INK; c.lineWidth = 1.9; c.beginPath(); c.ellipse(px, py - (gr ? 4 : 8), 9.4 * k, 3.2, 0, 0, Math.PI); c.fill(); c.stroke(); }
  for (const s of [-1, 1]) { const y0 = py - (gr ? 6 : 9), y1 = py - (gr ? 1.5 : 3);
    if (!long) { c.beginPath(); c.moveTo(px + s * 3, y0); c.lineTo(px + s * 3.6, y1); c.lineWidth = 5.8; c.strokeStyle = INK; c.stroke(); c.lineWidth = 3.4; c.strokeStyle = pants; c.stroke(); }
    c.beginPath(); c.ellipse(px + s * 3.8, py - (gr ? .6 : 1.2), 3.5, 2.2, 0, 0, 7); c.fillStyle = "#4a3524"; c.fill(); c.lineWidth = 1.6; c.strokeStyle = INK; c.stroke(); }
  c.restore();
}
function noteDraw(c, x, y, T, n, col) { // schwebende Noten
  c.save(); c.font = "bold 17px 'Caveat Brush',cursive"; c.textAlign = "center"; c.lineWidth = 3; c.strokeStyle = INK;
  for (let i = 0; i < n; i++) { const u = ((T * .45 + i / n) % 1), a = Math.sin(u * Math.PI); c.globalAlpha = a; c.fillStyle = col || "#ffd45a"; const nx = x + Math.sin(u * 6 + i * 2) * 10 + (i - 1) * 9, ny = y - u * 30; c.strokeText(i % 2 ? "♪" : "♫", nx, ny); c.fillText(i % 2 ? "♪" : "♫", nx, ny); }
  c.restore();
}
function dotsDraw(c, x, y, T) { // Sprechblase mit drei Punkten
  c.save(); c.lineWidth = 1.8; c.strokeStyle = INK; c.fillStyle = "#fffdf2"; c.beginPath(); c.roundRect(x - 11, y - 8, 22, 14, 6); c.fill(); c.stroke(); c.beginPath(); c.moveTo(x - 3, y + 6); c.lineTo(x - 5, y + 10); c.lineTo(x + 1, y + 6); c.fill(); c.fillStyle = INK;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(x - 5 + i * 5, y - 1 - Math.max(0, Math.sin(T * 8 - i * .9)) * 2, 1.5, 0, 7); c.fill(); }
  c.restore();
}
function drawNpcPose(c, id, n, px, py, g, T0) {
  const P = poseOf(id), L = NPC_LOOK[id], ph = hs(n.x, n.y, 5) * 40, T = T0 + ph, dp = Math.hypot(g.px - px, g.py - py), near = dp < 120, toP = g.px > px ? 1 : -1;
  const idleFace = Math.floor(T / 4.3) % 2 ? 1 : -1, face = near ? toP : idleFace;
  switch (P.p) {
    case "sit": case "read": {
      sitDraw(c, px, py, n, L, face, T, P.seat); if (P.p === "read") { const f = face, pg = Math.sin(T * .5) > .9; c.save(); c.lineWidth = 1.7; c.strokeStyle = INK; c.fillStyle = "#fffaf0"; c.beginPath(); c.moveTo(px + f * 1, py - 16); c.lineTo(px + f * 1 - 6.5, py - 15); c.lineTo(px + f * 1 - 6.5, py - 7); c.lineTo(px + f * 1, py - 8.5); c.lineTo(px + f * 1 + 6.5, py - 7); c.lineTo(px + f * 1 + 6.5, py - 15); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(px + f * 1, py - 16); c.lineTo(px + f * 1, py - 8.5); c.stroke(); c.lineWidth = 1; c.strokeStyle = "rgba(29,39,66,.4)"; for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(px + f * 1 - 5, py - 13 + i * 2.6); c.lineTo(px + f * 1 - 1.6, py - 12.4 + i * 2.6); c.moveTo(px + f * 1 + 1.6, py - 12.4 + i * 2.6); c.lineTo(px + f * 1 + 5, py - 13 + i * 2.6); c.stroke(); } if (pg) { c.fillStyle = "#fffaf0"; c.lineWidth = 1.4; c.strokeStyle = INK; c.beginPath(); c.moveTo(px + f * 1, py - 16); c.lineTo(px + f * 1 + 5, py - 20); c.lineTo(px + f * 1 + 6.5, py - 14); c.closePath(); c.fill(); c.stroke(); } c.restore(); }
      return; }
    case "lie": {
      const d = P.dir, cx = px - d * 22, cy = py - 9 + Math.sin(T * 1.5) * .5;
      c.save(); c.lineJoin = "round"; c.strokeStyle = INK; c.lineWidth = 1.9; c.fillStyle = "rgba(20,30,40,.2)"; c.beginPath(); c.ellipse(px, py - 1, 31, 6.5, 0, 0, 7); c.fill();
      c.fillStyle = P.sky ? "#7f9fd0" : "#c9a070"; c.beginPath(); c.roundRect(px - 28, py - 12, 56, 12, 4); c.fill(); c.stroke(); c.restore();
      c.save(); c.translate(cx, cy); c.rotate(d * Math.PI / 2); drawPerson(c, 0, 0, n.col, n.hat, { look: L, face: -d, noShadow: true }, T); c.restore();
      if (P.sky) { c.save(); c.globalCompositeOperation = "lighter"; c.fillStyle = "#fff2b0"; for (let i = 0; i < 3; i++) { const u = (T * .3 + i / 3) % 1; c.globalAlpha = Math.sin(u * Math.PI); sparkle(c, px + d * 26 + (i - 1) * 9, py - 26 - u * 26, 2.6); } c.restore(); }
      else { c.save(); c.font = "bold 15px 'Caveat Brush',cursive"; c.textAlign = "center"; c.lineWidth = 3; c.strokeStyle = INK; c.fillStyle = "#e8f0ff"; for (let i = 0; i < 3; i++) { const u = (T * .3 + i / 3) % 1; c.globalAlpha = Math.sin(u * Math.PI); const zx = px + d * 28 + u * 12 * d, zy = py - 20 - u * 28; c.font = "bold " + (11 + i * 3 + u * 4) + "px 'Caveat Brush',cursive"; c.strokeText("z", zx, zy); c.fillText("z", zx, zy); } c.restore(); }
      return; }
    case "fish": {
      const bx = P.wx * TS + TS / 2, by = P.wy * TS + TS / 2, f = bx > px ? 1 : -1, q = T % 11, bite = q > 9.3, bend = bite ? Math.sin((q - 9.3) * 18) * 3 + 5 : Math.sin(T * 1.3) * 1;
      sitDraw(c, px, py, n, L, f, T, "stump", 0);
      const hx = px + f * 8, hy = py - 14, tx = px + f * 30, ty = py - 46 + bend;
      c.save(); c.lineCap = "round"; c.beginPath(); c.moveTo(hx - f * 4, hy + 4); c.quadraticCurveTo(hx + f * 14, hy - 12, tx, ty); c.lineWidth = 3.6; c.strokeStyle = INK; c.stroke(); c.lineWidth = 1.8; c.strokeStyle = "#a07a48"; c.stroke();
      const bob = bite ? 3 + Math.sin((q - 9.3) * 24) * 1.5 : Math.sin(T * 2) * 1; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo((tx + bx) / 2, Math.max(ty, by) + 10, bx, by - 3 + bob); c.lineWidth = 1; c.strokeStyle = "rgba(255,255,255,.85)"; c.stroke();
      c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = 1.2; for (let i = 0; i < 2; i++) { const u = ((T * .5 + i * .5) % 1); c.globalAlpha = 1 - u; c.beginPath(); c.ellipse(bx, by, 4 + u * 9, 1.6 + u * 3.6, 0, 0, 7); c.stroke(); } c.globalAlpha = 1;
      c.beginPath(); c.arc(bx, by - 2 + bob, 3.2, Math.PI, 0); c.fillStyle = "#e84a3c"; c.fill(); c.lineWidth = 1.4; c.strokeStyle = INK; c.stroke(); c.beginPath(); c.arc(bx, by - 2 + bob, 3.2, 0, Math.PI); c.fillStyle = "#fff"; c.fill(); c.stroke();
      if (bite) { c.fillStyle = "rgba(255,255,255,.8)"; for (let i = 0; i < 4; i++) { const a = i * 1.6 + q * 5; c.beginPath(); c.arc(bx + Math.cos(a) * 6, by - 4 - Math.abs(Math.sin(a)) * 8, 1.4, 0, 7); c.fill(); } }
      c.restore(); return; }
    case "talk": {
      const s = P.side, ax = px + s * 30, A = ambLook(id), who = Math.floor(T / 2.7) % 2, sp = Math.sin(T * 7) * .5 + .5;
      const fN = near && dp < 70 ? toP : s, fA = -s;
      const drawA = () => drawPerson(c, ax, py, A.col, A.hat, { look: A.look, face: fA, gest: who === 1 ? sp : 0 }, T + 3);
      const drawN = () => drawPerson(c, px, py, n.col, n.hat, { look: L, face: fN, gest: who === 0 ? sp : 0 }, T);
      drawN(); drawA(); dotsDraw(c, who === 0 ? px : ax, py - 62, T); return; }
    case "hum": case "dance": {
      const dn = P.p === "dance", hop = dn ? Math.abs(Math.sin(T * 5)) * 4 : 0, f = dn ? (Math.floor(T / .55) % 2 ? 1 : -1) : face;
      c.save(); c.translate(px, py); c.rotate(Math.sin(T * (dn ? 5 : 1.6)) * (dn ? .06 : .035)); c.translate(-px, -py - -hop * 0); 
      drawPerson(c, px, py - hop, n.col, n.hat, { look: L, face: f, gest: dn ? Math.max(0, Math.sin(T * 5)) : 0 }, T); c.restore();
      noteDraw(c, px, py - 50 - hop, T, 3, dn ? "#ff9ad0" : "#ffd45a"); return; }
    case "wave": {
      const q = T % 8, w = q < 2.2; drawPerson(c, px, py, n.col, n.hat, { look: L, face: w || near ? toP : idleFace, gest: w || (near && Math.sin(T * 3) > .55) ? 1 : 0, wag: 1 }, T);
      if (w) { c.save(); c.font = "bold 18px 'Caveat Brush',cursive"; c.textAlign = "center"; c.lineWidth = 3; c.strokeStyle = INK; c.fillStyle = "#fff"; c.strokeText("Hey!", px, py - 66); c.fillText("Hey!", px, py - 66); c.restore(); } return; }
    case "work": {
      const f = P.dir, sw = .5 - .5 * Math.cos(T * 4.6), hit = sw < .06 && Math.sin(T * 4.6 - 1) > .9;
      drawPerson(c, px, py, n.col, n.hat, { look: L, face: f, gest: sw }, T);
      const u = (T * 4.6 / (Math.PI * 2)) % 1; if (u > .93 || u < .12) { c.save(); c.globalCompositeOperation = "lighter"; c.fillStyle = "#ffe9a0"; const k = u > .5 ? u - 1 : u; sparkle(c, px + f * 16, py - 4, 3 + (1 - Math.abs(k) * 8) * 2); sparkle(c, px + f * 12, py - 7, 2); c.restore(); } return; }
    case "scope": {
      drawPerson(c, px, py, n.col, n.hat, { look: L, face: Math.floor(T / 6) % 2 ? 1 : -1, gest: .85 + Math.sin(T * .8) * .12 }, T); return; }
    default: // look: schaut sich um, nickt manchmal
      drawPerson(c, px, py, n.col, n.hat, { look: L, face: face, gest: 0 }, T);
  }
}
/* ----- Gedanken der eigenen Figur über dem Kopf ----- */
function drawThought(c, x, y, txt, a) {
  c.save(); c.globalAlpha = a; c.font = "17px 'Patrick Hand',cursive"; c.textAlign = "center"; c.lineJoin = "round";
  const words = txt.split(" "), lines = []; let cur = ""; for (const w of words) { if (c.measureText(cur + " " + w).width > 190 && cur) { lines.push(cur); cur = w; } else cur = cur ? cur + " " + w : w; } lines.push(cur);
  const w = Math.max(...lines.map(l => c.measureText(l).width)) + 22, h = lines.length * 20 + 14, bx = x - w / 2, by = y - h - 16 - Math.min(0, (a - 1) * 8);
  c.fillStyle = "#fffdf2"; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.roundRect(bx, by, w, h, 14); c.fill(); c.stroke();
  c.beginPath(); c.arc(x - 6, by + h + 5, 4.2, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.arc(x - 2, by + h + 12, 2.6, 0, 7); c.fill(); c.stroke();
  c.fillStyle = INK; lines.forEach((l, i) => c.fillText(l, x, by + 20 + i * 20)); c.restore();
}
