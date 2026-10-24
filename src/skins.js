/* ===== SKINS: rein kosmetisch. Prächtig = andere Textur und Farben, Fabelhaft = zusätzlich anderes Modell und Partikel,
   Glorreich = zusätzlich viele Partikel, eigene Stimm- und Fang-Oberfläche und eigene Effekte bei Wurf, Fang und Fehlschlag.
   Freigeschaltet durch die Meisterschaft des Instruments, ausgerüstet wird im Instrumentbeutel. Andere Spieler sehen den Skin immer. ===== */
const SKINS = {
  egitarre: [
    { id: "neon",     t: 3, n: "Neonlack",        need: 4, d: "Violetter Neonlack mit pinken Streifen und leuchtenden Tonabnehmern." },
    { id: "flammen",  t: 4, n: "Flammenaxt",      need: 6, d: "Spitzer Korpus mit Flammen, glühenden Funken und Rauch." },
    { id: "gewitter", t: 5, n: "Gewitterkönigin", need: 8, d: "Kristallgitarre aus Gewitterlicht. Mit eigener Stimm- und Fang-Anzeige und eigenen Blitzen bei Wurf, Fang und Fehlschlag." }
  ]
};
const SKIN_TIER = { 3: "Prächtig", 4: "Fabelhaft", 5: "Glorreich" };
const skinOpen = (id, s) => !!(typeof S !== "undefined" && ((S.flags && S.flags.allSkins) || (typeof mastLvl === "function" && mastLvl(id) >= s.need)));
const skinsFor = id => (SKINS[id] || []).filter(s => skinOpen(id, s));
function skinOf(id) { const l = SKINS[id]; if (!l || typeof S === "undefined" || !S.skin) return null; const s = l.find(x => x.id === S.skin[id]); return s && skinOpen(id, s) ? s : null; }
/* Symbolart für Instrument id: mit Skin "skin:instrument:skin", sonst die normale Art */
const ikind = id => { const s = skinOf(id); return s ? "skin:" + id + ":" + s.id : kindIcon(INSTR[id].kind); };

/* ----- Zeichnung ----- */
function drawSkinIcon(c, iid, sid, x, y, s, t) {
  if (!iid) iid = Object.keys(SKINS).find(i => SKINS[i].some(k => k.id === sid)) || "egitarre";
  t = t == null ? .3 : t; const hs2 = (a, b, k) => { const v = Math.sin(a * 127.1 + b * 311.7 + k * 74.7) * 43758.5453; return v - Math.floor(v); };
  c.save(); c.translate(x, y); c.scale(s / 40, s / 40); c.lineJoin = c.lineCap = "round"; c.lineWidth = 2.4; c.strokeStyle = INK;
  const c0 = c; c = sketchCtx(c0, strSeed(sid), 40); const F = col => { c.fillStyle = col; c.fill(); c.stroke(); };
  const neck = (col, col2) => { c.beginPath(); c.moveTo(18, 26); c.lineTo(31, 11); c.lineWidth = 4.6; c.stroke(); c.lineWidth = 2.2; c.strokeStyle = col; c.beginPath(); c.moveTo(18, 26); c.lineTo(31, 11); c.stroke(); c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.moveTo(30, 11); c.lineTo(35, 4); c.lineTo(38, 7); c.lineTo(33, 13); c.closePath(); F(col2); };
  if (sid === "neon") {
    c0.save(); c0.shadowColor = "#ff4fd8"; c0.shadowBlur = 5 + 2 * Math.sin(t * 4); c.beginPath(); c.moveTo(7, 30); c.quadraticCurveTo(5, 22, 13, 21); c.quadraticCurveTo(17, 20, 19, 23); c.quadraticCurveTo(24, 25, 23, 31); c.quadraticCurveTo(22, 37, 14, 36); c.quadraticCurveTo(8, 37, 7, 30); c.closePath(); F("#7a2fe0"); c0.restore();
    c.save(); c.beginPath(); c.moveTo(7, 30); c.quadraticCurveTo(5, 22, 13, 21); c.quadraticCurveTo(17, 20, 19, 23); c.quadraticCurveTo(24, 25, 23, 31); c.quadraticCurveTo(22, 37, 14, 36); c.quadraticCurveTo(8, 37, 7, 30); c.closePath(); c.clip(); c.strokeStyle = "#ff58c0"; c.lineWidth = 2.4; for (let i = -2; i < 6; i++) { c.beginPath(); c.moveTo(4 + i * 5, 38); c.lineTo(14 + i * 5, 18); c.stroke(); } c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = 1.6; c.beginPath(); c.moveTo(9, 27); c.quadraticCurveTo(10, 23, 14, 23); c.stroke(); c.restore();
    c.beginPath(); c.moveTo(7, 30); c.quadraticCurveTo(5, 22, 13, 21); c.quadraticCurveTo(17, 20, 19, 23); c.quadraticCurveTo(24, 25, 23, 31); c.quadraticCurveTo(22, 37, 14, 36); c.quadraticCurveTo(8, 37, 7, 30); c.closePath(); c.stroke();
    neck("#2a1a4a", "#1fd8e8"); c.strokeStyle = "#1fd8e8"; c.lineWidth = 1.4; [[20, 24, 21.5, 22.5], [23, 20.5, 24.5, 19], [26, 17, 27.5, 15.5]].forEach(l => { c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.stroke(); });
    c.beginPath(); c.ellipse(14, 29, 3.4, 1.9, -.6, 0, 7); F("#1fd8e8"); c.beginPath(); c.ellipse(17.5, 26, 2, 1.2, -.6, 0, 7); F("#1fd8e8");
  } else if (sid === "flammen") {
    // anderes Modell: spitzer Korpus
    c.beginPath(); c.moveTo(3, 37); c.lineTo(8, 22); c.lineTo(14, 19); c.lineTo(20, 22); c.lineTo(24, 27); c.lineTo(27, 35); c.lineTo(20, 32); c.lineTo(15, 38); c.lineTo(12, 31); c.closePath(); F("#5a2036");
    c.lineWidth = 1.5; const fl = (ox, oy, k, col) => { c.beginPath(); c.moveTo(ox, oy); c.quadraticCurveTo(ox - 2.6 * k, oy - 3.5 * k, ox + .4 * k, oy - 7.5 * k - Math.sin(t * 9 + ox) * .8 * k); c.quadraticCurveTo(ox + 1.2 * k, oy - 4 * k, ox + 3 * k, oy - 4.8 * k); c.quadraticCurveTo(ox + 3.4 * k, oy - 1.5 * k, ox + 3 * k, oy); c.closePath(); F(col); };
    fl(7, 35, 1.7, "#ff7a1a"); fl(13.5, 36.5, 1.9, "#ff7a1a"); fl(20.5, 33, 1.5, "#ff7a1a"); fl(8.2, 35, .95, "#ffe14d"); fl(14.8, 36.5, 1.05, "#ffe14d"); fl(21.4, 33, .85, "#ffe14d"); c.lineWidth = 2.4;
    neck("#6a3a1a", "#c0301a"); c.beginPath(); c.moveTo(33, 4); c.quadraticCurveTo(32, 0, 35, -1 - Math.sin(t * 9)); c.quadraticCurveTo(37, 1, 36, 5); c.closePath(); F("#ffb02e");
    c.beginPath(); c.ellipse(15, 27, 2.6, 1.6, -.6, 0, 7); F("#ffe14d");
    // Funken und Rauch
    for (let i = 0; i < 7; i++) { const u = ((t * .8 + i / 7) % 1), px = 6 + hs2(i, 1, 4) * 22 + Math.sin(u * 5 + i) * 2, py = 30 - u * 34; c.globalAlpha = Math.sin(u * Math.PI); c.fillStyle = i % 2 ? "#ffb02e" : "#ff5a1a"; c.beginPath(); c.arc(px, py, 1.1 + hs2(i, 2, 4) * .9, 0, 7); c.fill(); }
    c.globalAlpha = 1; c.fillStyle = "rgba(90,80,90,.32)"; for (let i = 0; i < 3; i++) { const u = ((t * .35 + i / 3) % 1); c.globalAlpha = (1 - u) * .45; c.beginPath(); c.arc(18 + Math.sin(u * 4 + i) * 4, 18 - u * 16, 3 + u * 4, 0, 7); c.fill(); } c.globalAlpha = 1;
  } else if (sid === "gewitter") {
    // Halo und Kristallkorpus
    c0.save(); c0.globalCompositeOperation = "lighter"; const g = c0.createRadialGradient(18, 24, 2, 18, 24, 26); g.addColorStop(0, "rgba(150,220,255," + (.55 + .2 * Math.sin(t * 6)) + ")"); g.addColorStop(1, "rgba(80,140,255,0)"); c0.fillStyle = g; c0.beginPath(); c0.arc(18, 24, 26, 0, 7); c0.fill(); c0.restore();
    c.beginPath(); c.moveTo(4, 33); c.lineTo(8, 22); c.lineTo(15, 18); c.lineTo(21, 22); c.lineTo(25, 30); c.lineTo(20, 37); c.lineTo(10, 37); c.closePath(); F("#7fd6ff");
    c.lineWidth = 1.5; c.strokeStyle = "rgba(255,255,255,.9)"; [[8, 22, 14, 30], [15, 18, 14, 30], [21, 22, 14, 30], [14, 30, 20, 37], [14, 30, 10, 37], [14, 30, 25, 30]].forEach(l => { c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.stroke(); });
    c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.moveTo(4, 33); c.lineTo(8, 22); c.lineTo(15, 18); c.lineTo(21, 22); c.lineTo(25, 30); c.lineTo(20, 37); c.lineTo(10, 37); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(15, 21); c.lineTo(11, 28); c.lineTo(15, 28); c.lineTo(12, 35); c.lineTo(19, 26); c.lineTo(15, 26); c.closePath(); F("#fff6a0");
    neck("#fff6c8", "#ffe94a"); c.beginPath(); c.moveTo(35, 4); c.lineTo(32, 9); c.lineTo(35, 9); c.lineTo(33, 13); c.lineWidth = 1.8; c.strokeStyle = "#fff"; c.stroke();
    // Blitze und kreisende Kristalle
    c0.save(); c0.globalCompositeOperation = "lighter"; c0.strokeStyle = "rgba(210,240,255,.95)"; c0.lineWidth = 1.6; for (let i = 0; i < 3; i++) { const k = Math.floor(t * 8 + i * 3.7), a = i * 2.1 + hs2(k, i, 3) * 1.4; if (hs2(k, i, 5) < .3) continue; let px = 18 + Math.cos(a) * 12, py = 24 + Math.sin(a) * 12; c0.beginPath(); c0.moveTo(px, py); for (let j = 1; j <= 3; j++) { px += Math.cos(a) * 3.2 + (hs2(k, i + j, 7) - .5) * 5; py += Math.sin(a) * 3.2 + (hs2(k, i * 3 + j, 9) - .5) * 5; c0.lineTo(px, py); } c0.stroke(); } c0.restore();
    for (let i = 0; i < 4; i++) { const a = t * 1.3 + i * 1.57, px = 18 + Math.cos(a) * 19, py = 22 + Math.sin(a) * 13; c.save(); c.translate(px, py); c.rotate(a); c.beginPath(); c.moveTo(0, -3.2); c.lineTo(2.2, 0); c.lineTo(0, 3.2); c.lineTo(-2.2, 0); c.closePath(); F(i % 2 ? "#b8e8ff" : "#fff6a0"); c.restore(); }
  } else { c0.restore(); drawIcon(c0, kindIcon(INSTR[iid].kind), x, y, s); return; }
  c0.restore();
}

/* ----- Oberfläche des glorreichen Skins (Stimmen und Fangen): Farben und Dekor ----- */
const SKIN_UI = {
  gewitter: { wash: "rgba(22,32,70,.93)", paper: "rgba(34,50,104,.92)", ink: "#e9f4ff", on: "#fff6a0", off: "#9fd6ff", zoneIn: "rgba(255,246,120,.78)", zoneOut: "rgba(90,170,255,.55)", zoneInS: "#ffe94a", zoneOutS: "#7fd6ff", progBg: "rgba(22,32,70,.92)", prog: "#7fd6ff", progBonus: "#ffe94a", wave: "#bfe8ff" }
};
function skUi() { const s = skinOf(S.eq); return s && s.t >= 5 ? SKIN_UI[s.id] : null; }
const skHs = (a, b, k) => { const v = Math.sin(a * 127.1 + b * 311.7 + k * 74.7) * 43758.5453; return v - Math.floor(v); };
function skBolt(c, x1, y1, x2, y2, seed, w, col) { const n = 7; c.beginPath(); c.moveTo(x1, y1); for (let i = 1; i < n; i++) { const u = i / n, nx = -(y2 - y1), ny = (x2 - x1), l = Math.hypot(nx, ny) || 1, o = (skHs(seed, i, 3) - .5) * 26; c.lineTo(x1 + (x2 - x1) * u + nx / l * o, y1 + (y2 - y1) * u + ny / l * o); } c.lineTo(x2, y2); c.strokeStyle = col || "#e9f6ff"; c.lineWidth = w || 2; c.stroke(); }
/* Dekor nach der normalen Zeichnung: Blitze am Rand, Funken, leuchtender Griff */
function skDecor(c, kind, g, t) {
  c.save(); c.globalCompositeOperation = "lighter"; c.lineCap = c.lineJoin = "round";
  const q = Math.floor(t * 9);
  if (kind === "freq") {
    [[g.x0, g.ytop, g.x0 + g.W, g.ytop], [g.x0, g.ybot, g.x0 + g.W, g.ybot]].forEach((l, i) => { c.globalAlpha = .75; skBolt(c, l[0], l[1], l[2], l[3], q + i * 5, 1.6, "#9fd6ff"); });
    c.globalAlpha = .9; c.fillStyle = "#fff6a0"; c.beginPath(); c.moveTo(g.ux, g.hy - 18); c.lineTo(g.ux - 8, g.hy + 2); c.lineTo(g.ux - 1, g.hy + 2); c.lineTo(g.ux - 5, g.hy + 16); c.lineTo(g.ux + 9, g.hy - 4); c.lineTo(g.ux + 2, g.hy - 4); c.closePath(); c.fill();
    const gl = c.createRadialGradient(g.ux, g.hy, 2, g.ux, g.hy, 34); gl.addColorStop(0, "rgba(255,246,160,.5)"); gl.addColorStop(1, "rgba(255,246,160,0)"); c.fillStyle = gl; c.beginPath(); c.arc(g.ux, g.hy, 34, 0, 7); c.fill();
  } else if (kind === "bal") {
    [[g.x0, g.ytr, g.x0 + g.W, g.ytr], [g.x0, g.ytr + g.bh, g.x0 + g.W, g.ytr + g.bh]].forEach((l, i) => { c.globalAlpha = .7; skBolt(c, l[0], l[1], l[2], l[3], q + i * 7, 1.6, "#9fd6ff"); });
    // Zone: Kristallkanten
    c.globalAlpha = .85; c.strokeStyle = g.inZ ? "#fff6a0" : "#bfe8ff"; c.lineWidth = 2; for (let i = 0; i < 4; i++) { const xx = g.zx + g.zw * (i + .5) / 4; c.beginPath(); c.moveTo(xx, g.ytr + 6); c.lineTo(xx + (i % 2 ? 6 : -6), g.ytr + g.bh / 2); c.lineTo(xx, g.ytr + g.bh - 6); c.stroke(); }
    // Fortschritt: Funken an der Spitze
    for (let i = 0; i < 6; i++) { const u = (t * 1.6 + i / 6) % 1; c.globalAlpha = (1 - u) * .9; c.fillStyle = "#fff6a0"; c.beginPath(); c.arc(g.px2 + (skHs(i, q, 5) - .5) * 14, g.py2 + 7 + (skHs(i, q, 6) - .5) * 14 - u * 10, 1.4 + skHs(i, 2, 3) * 1.6, 0, 7); c.fill(); }
    if (g.inZ) { c.globalAlpha = .55; c.strokeStyle = "#fff6a0"; c.lineWidth = 2.2; skBolt(c, g.zcx, g.ytr - 14, g.zcx, g.ytr + 6, q, 2.2, "#fff6a0"); }
  }
  c.restore();
}
/* Effekte bei Wurf, Fang und Fehlschlag (Bildschirm): glorreicher Skin */
function skFx(c, sx, sy, tx, ty, t) {
  const s = skinOf(S.eq); if (!s || s.t < 5) return; const u = C.t || 0, q = Math.floor(t * 14);
  c.save(); c.globalCompositeOperation = "lighter"; c.lineCap = c.lineJoin = "round";
  if (C.ph === "ringres" && u < .9 && C.perfect !== undefined) { const k = u / .9, n = C.perfect ? 9 : 4; c.globalAlpha = 1 - k; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + skHs(i, 1, 2); skBolt(c, sx, sy - 20, sx + Math.cos(a) * (60 + k * 90), sy - 20 + Math.sin(a) * (60 + k * 90), q + i * 3, 2.4, i % 2 ? "#bfe8ff" : "#fff6a0"); } const g = c.createRadialGradient(sx, sy - 20, 4, sx, sy - 20, 80 + k * 80); g.addColorStop(0, "rgba(190,230,255," + .5 * (1 - k) + ")"); g.addColorStop(1, "rgba(190,230,255,0)"); c.fillStyle = g; c.beginPath(); c.arc(sx, sy - 20, 160, 0, 7); c.fill(); }
  else if (C.ph === "result" && u < 1.8) { const k = u / 1.8; c.globalAlpha = 1 - k; for (let i = 0; i < 5; i++) skBolt(c, tx + (i - 2) * 46, ty - 400, tx + (i - 2) * 6, ty, q + i * 4, 3, "#fff6a0"); const g = c.createRadialGradient(tx, ty, 4, tx, ty, 190); g.addColorStop(0, "rgba(255,246,160,.6)"); g.addColorStop(1, "rgba(255,246,160,0)"); c.fillStyle = g; c.fillRect(tx - 200, ty - 200, 400, 400); for (let i = 0; i < 30; i++) { const a = skHs(i, 1, 7) * 6.283, r = k * (60 + skHs(i, 2, 7) * 150); c.fillStyle = i % 2 ? "#fff6a0" : "#9fd6ff"; c.globalAlpha = (1 - k) * .9; c.beginPath(); c.arc(tx + Math.cos(a) * r, ty + Math.sin(a) * r - k * 30, 2 + skHs(i, 3, 7) * 2, 0, 7); c.fill(); } }
  else if ((C.ph === "flee" || C.ph === "miss") && u < 1.4) { const k = u / 1.4; c.globalAlpha = (1 - k) * .8; c.strokeStyle = "#7a8aa8"; c.lineWidth = 2; for (let i = 0; i < 4; i++) skBolt(c, sx + (i - 1.5) * 18, sy - 30 + k * 10, sx + (i - 1.5) * 26 + (skHs(q, i, 3) - .5) * 30, sy + 30 + k * 40, q + i, 1.6, "#9aa8c4"); c.fillStyle = "#9aa8c4"; for (let i = 0; i < 14; i++) { const a = skHs(i, 1, 9) * 6.283, r = 10 + k * 70 * skHs(i, 2, 9); c.globalAlpha = (1 - k) * .7; c.beginPath(); c.arc(sx + Math.cos(a) * r, sy - 20 + Math.sin(a) * r + k * 30, 1.6, 0, 7); c.fill(); } }
  c.restore();
}
