/* ===== SKINS: rein kosmetisch. Prächtig = andere Textur und Farben, Fabelhaft = zusätzlich anderes Modell und Partikel,
   Glorreich = zusätzlich viele Partikel, eigene Stimm- und Fang-Oberfläche und eigene Effekte bei Wurf, Fang und Fehlschlag.
   Freigeschaltet durch die Meisterschaft des Instruments, ausgerüstet wird im Instrumentbeutel. Andere Spieler sehen den Skin immer. ===== */
const SKINS = {
  egitarre: [
    { id: "neon",     t: 3, n: "Neonlack",        need: 4, d: "Violetter Neonlack mit pinken Streifen und leuchtenden Tonabnehmern." },
    { id: "flammen",  t: 4, n: "Flammenaxt",      need: 6, d: "Spitzer Korpus mit Flammen, glühenden Funken und Rauch." },
    { id: "gewitter", t: 5, n: "Gewitterkönigin", need: 8, d: "Kristallgitarre aus Gewitterlicht. Eigenes Modell: die ganze Gitarre ist ein Kristall-Blitz mit Saiten aus Licht und schwebender Blitzkrone, dazu viele Funken, Blitze und kreisende Kristalle, eigene Stimm- und Fang-Anzeige und eigene Effekte bei Wurf, Fang und Fehlschlag." }
  ]
};
SKINS.himmelscello = [
  { id: "abendrot",  t: 3, n: "Abendrot",      need: 4, d: "Korpus im Abendhimmel: Rosa, Gold und Violett in weichen Wolkenbändern." },
  { id: "sternenbogen", t: 4, n: "Sternenbogen", need: 6, d: "Der Korpus ist ein silberner Halbmond, die Schnecke ein Stern. Sternenstaub steigt auf, Wolken ziehen vorbei." },
  { id: "sphaeren",  t: 5, n: "Sphärenklang", need: 8, d: "Ein Cello aus Sternbildern: Linien aus Licht, ein Nebel im Korpus, ein kreisender Ring und ein Komet als Bogen. Eigene Stimm- und Fang-Anzeige als Nachthimmel, Sternenregen bei Wurf, Fang und Fehlschlag." }
];
const SKIN_STYLE = { gewitter: "bolt", sphaeren: "star" };
const skStyle = sid => SKIN_STYLE[sid] || "bolt";
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
    // eigenes Modell: die ganze Gitarre ist ein Kristall-Blitz (Zickzack-Korpus ohne Hals), darüber schwebt eine Blitzkrone, Saiten aus Licht
    const bolt = () => { c.beginPath(); c.moveTo(3, 37); c.lineTo(7, 21); c.lineTo(14, 25); c.lineTo(19, 11); c.lineTo(26, 17); c.lineTo(31, 8); c.lineTo(30, 20); c.lineTo(24, 14); c.lineTo(21, 29); c.lineTo(14, 23); c.lineTo(10, 38); c.closePath(); };
    c0.save(); c0.globalCompositeOperation = "lighter"; const g = c0.createRadialGradient(18, 24, 2, 18, 24, 28); g.addColorStop(0, "rgba(150,220,255," + (.6 + .2 * Math.sin(t * 6)) + ")"); g.addColorStop(1, "rgba(80,140,255,0)"); c0.fillStyle = g; c0.beginPath(); c0.arc(18, 24, 28, 0, 7); c0.fill(); c0.restore();
    bolt(); F("#7fd6ff");
    c.save(); bolt(); c.clip(); c.lineWidth = 1.4; c.strokeStyle = "rgba(255,255,255,.95)"; [[3, 37, 19, 11], [7, 21, 21, 29], [14, 25, 31, 8], [10, 38, 26, 17], [19, 11, 24, 14], [14, 23, 30, 20]].forEach(l => { c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.stroke(); }); c.fillStyle = "rgba(255,246,160,.55)"; c.beginPath(); c.moveTo(7, 21); c.lineTo(14, 25); c.lineTo(10, 38); c.closePath(); c.fill(); c.restore();
    c.lineWidth = 2.4; c.strokeStyle = INK; bolt(); c.stroke();
    // Saiten aus Licht über dem Blitz
    c0.save(); c0.globalCompositeOperation = "lighter"; c0.lineWidth = .8; for (let k = 0; k < 4; k++) { c0.strokeStyle = "rgba(255,255,255," + (.55 + .35 * Math.sin(t * 11 + k)) + ")"; c0.beginPath(); c0.moveTo(8 + k * 1.2, 35 - k * 2); c0.quadraticCurveTo(16, 24 + Math.sin(t * 14 + k) * .8, 29 - k * .6, 10 + k * 2); c0.stroke(); } c0.restore();
    // schwebende Blitzkrone
    const cy = -2 + Math.sin(t * 2.4) * 1.2; c.lineWidth = 2; c.beginPath(); c.moveTo(25, 6 + cy + 4); c.lineTo(25.5, 1 + cy); c.lineTo(28.5, 4 + cy); c.lineTo(31.5, -1 + cy); c.lineTo(34.5, 4 + cy); c.lineTo(37.5, 1 + cy); c.lineTo(38, 6 + cy + 4); c.closePath(); F("#ffe94a");
    [[28, 6 + cy, "#e0453a"], [31.8, 5.5 + cy, "#4da6ff"], [35, 6 + cy, "#5fe85f"]].forEach(p2 => { c.beginPath(); c.arc(p2[0], p2[1] + 1, 1.2, 0, 7); F(p2[2]); });
    // Tonabnehmer als schwebende Kristalle
    c.lineWidth = 2; [[19, 27, 0], [22, 22, 1]].forEach(p2 => { c.save(); c.translate(p2[0] + 4, p2[1] + 3 + Math.sin(t * 3 + p2[2]) * .8); c.rotate(-.7); c.beginPath(); c.moveTo(0, -2.4); c.lineTo(3, 0); c.lineTo(0, 2.4); c.lineTo(-3, 0); c.closePath(); F("#bff4ff"); c.restore(); });
    // Funken, Blitze, kreisende Kristalle
    for (let i = 0; i < 12; i++) { const u = ((t * .9 + i / 12) % 1), a2 = hs2(i, 1, 4) * 6.283, r = 6 + u * 16; c.globalAlpha = Math.sin(u * Math.PI); c.fillStyle = i % 2 ? "#fff6a0" : "#9fe6ff"; c.beginPath(); c.arc(18 + Math.cos(a2) * r, 24 + Math.sin(a2) * r * .8 - u * 4, 1 + hs2(i, 2, 4) * 1, 0, 7); c.fill(); }
    c.globalAlpha = 1;
    c0.save(); c0.globalCompositeOperation = "lighter"; c0.strokeStyle = "rgba(210,240,255,.95)"; c0.lineWidth = 1.5; for (let i = 0; i < 4; i++) { const k = Math.floor(t * 8 + i * 3.7), a = i * 1.6 + hs2(k, i, 3) * 1.4; if (hs2(k, i, 5) < .25) continue; let px = 18 + Math.cos(a) * 12, py = 24 + Math.sin(a) * 12; c0.beginPath(); c0.moveTo(px, py); for (let j = 1; j <= 4; j++) { px += Math.cos(a) * 3.4 + (hs2(k, i + j, 7) - .5) * 5; py += Math.sin(a) * 3.4 + (hs2(k, i * 3 + j, 9) - .5) * 5; c0.lineTo(px, py); } c0.stroke(); } c0.restore();
    c.strokeStyle = INK; c.lineWidth = 2; for (let i = 0; i < 4; i++) { const a = t * 1.3 + i * 1.57, px = 18 + Math.cos(a) * 20, py = 24 + Math.sin(a) * 14; c.save(); c.translate(px, py); c.rotate(a); c.beginPath(); c.moveTo(0, -3.2); c.lineTo(2.2, 0); c.lineTo(0, 3.2); c.lineTo(-2.2, 0); c.closePath(); F(i % 2 ? "#b8e8ff" : "#fff6a0"); c.restore(); }
  } else if (sid === "abendrot") {
    // Prächtig: gleiche Cello-Form, Abendhimmel als Textur
    const body = () => { c.beginPath(); c.moveTo(16, 14); c.quadraticCurveTo(7, 15, 8, 23); c.quadraticCurveTo(10, 27, 8, 31); c.quadraticCurveTo(9, 38, 17, 38); c.quadraticCurveTo(26, 38, 26, 31); c.quadraticCurveTo(24, 27, 26, 23); c.quadraticCurveTo(26, 15, 16, 14); c.closePath(); };
    c0.save(); c0.shadowColor = "#ffb06a"; c0.shadowBlur = 4 + Math.sin(t * 3); body(); F("#d9648a"); c0.restore();
    c.save(); body(); c.clip(); [["#ffc25a", 21], ["#8a54d0", 27], ["#ff8a6a", 33]].forEach(([col, y], k) => { c.fillStyle = col; c.beginPath(); c.moveTo(4, y); for (let x = 4; x <= 30; x += 2) c.lineTo(x, y + Math.sin(x * .45 + k) * 1.8); c.lineTo(30, y + 5); c.lineTo(4, y + 5); c.closePath(); c.fill(); });
    c.fillStyle = "rgba(255,255,255,.85)"; [[12, 19, 3], [20, 25, 2.4], [14, 32, 2.8]].forEach(p2 => { c.beginPath(); c.arc(p2[0], p2[1], p2[2], 0, 7); c.arc(p2[0] + p2[2], p2[1] + 1, p2[2] * .8, 0, 7); c.fill(); }); c.restore();
    c.lineWidth = 2.4; c.strokeStyle = INK; body(); c.stroke();
    c.beginPath(); c.moveTo(17, 14); c.lineTo(17, 4); c.lineWidth = 3.4; c.stroke(); c.lineWidth = 1.8; c.strokeStyle = "#ffc25a"; c.beginPath(); c.moveTo(17, 14); c.lineTo(17, 4); c.stroke(); c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.arc(17, 3.5, 2.6, 0, 7); F("#ffd98a");
    c.lineWidth = 1.5; c.strokeStyle = "#fff0d8"; c.beginPath(); c.moveTo(14, 22); c.lineTo(14, 33); c.moveTo(17, 22); c.lineTo(17, 33); c.moveTo(20, 22); c.lineTo(20, 33); c.stroke();
    c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.moveTo(32, 8); c.lineTo(34, 36); c.stroke(); c.strokeStyle = "#ffe0c0"; c.lineWidth = 1; c.beginPath(); c.moveTo(32, 8); c.lineTo(34, 36); c.stroke();
    c.lineWidth = 1.2; c.strokeStyle = INK; c.fillStyle = "#ff9ac0"; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 1.6 : 3.8; i ? c.lineTo(31 + Math.cos(a) * q, 29 + Math.sin(a) * q) : c.moveTo(31 + Math.cos(a) * q, 29 + Math.sin(a) * q); } c.closePath(); c.fill(); c.stroke();
  } else if (sid === "sternenbogen") {
    // Fabelhaft: anderes Modell, Halbmond-Korpus, Stern als Schnecke, Sternenstaub und Wolken
    const moon = () => { c.beginPath(); c.moveTo(14, 15); c.quadraticCurveTo(1, 18, 2.5, 27); c.quadraticCurveTo(1, 36, 14, 39); c.quadraticCurveTo(7, 33, 8, 27); c.quadraticCurveTo(7, 21, 14, 15); c.closePath(); };
    c0.save(); c0.globalCompositeOperation = "lighter"; const g = c0.createRadialGradient(8, 27, 2, 8, 27, 18); g.addColorStop(0, "rgba(170,200,255,.5)"); g.addColorStop(1, "rgba(170,200,255,0)"); c0.fillStyle = g; c0.beginPath(); c0.arc(8, 27, 18, 0, 7); c0.fill(); c0.restore();
    moon(); F("#cfdcff"); c.save(); moon(); c.clip(); c.strokeStyle = "rgba(120,140,220,.6)"; c.lineWidth = 1.4; [[4, 22, 8, 25], [5, 30, 9, 28], [6, 34, 10, 31]].forEach(l => { c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.stroke(); }); c.restore(); c.lineWidth = 2.4; c.strokeStyle = INK; moon(); c.stroke();
    c.beginPath(); c.moveTo(14, 16); c.lineTo(14, 6); c.lineWidth = 3.2; c.stroke(); c.lineWidth = 1.6; c.strokeStyle = "#8aa4ff"; c.beginPath(); c.moveTo(14, 16); c.lineTo(14, 6); c.stroke(); c.strokeStyle = INK; c.lineWidth = 2.2;
    c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 2.2 : 5; i ? c.lineTo(14 + Math.cos(a) * q, 4 + Math.sin(a) * q) : c.moveTo(14 + Math.cos(a) * q, 4 + Math.sin(a) * q); } c.closePath(); F("#ffe27a");
    c.lineWidth = 1.4; c.strokeStyle = "#e8ecff"; [17, 20, 23].forEach(x => { c.beginPath(); c.moveTo(x, 18 + (x - 17)); c.lineTo(x, 36 - (x - 17)); c.stroke(); });
    c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.moveTo(31, 9); c.quadraticCurveTo(36, 22, 32, 36); c.stroke(); c.strokeStyle = "#cfdcff"; c.lineWidth = 1; c.beginPath(); c.moveTo(31, 9); c.quadraticCurveTo(36, 22, 32, 36); c.stroke();
    for (let i = 0; i < 9; i++) { const u = ((t * .6 + i / 9) % 1), px = 4 + hs2(i, 1, 4) * 30, py = 38 - u * 36; c.globalAlpha = Math.sin(u * Math.PI); c.fillStyle = i % 2 ? "#ffe27a" : "#c8b8ff"; c.beginPath(); c.moveTo(px, py - 1.8); c.lineTo(px + .7, py - .7); c.lineTo(px + 1.8, py); c.lineTo(px + .7, py + .7); c.lineTo(px, py + 1.8); c.lineTo(px - .7, py + .7); c.lineTo(px - 1.8, py); c.lineTo(px - .7, py - .7); c.closePath(); c.fill(); }
    c.globalAlpha = 1; c.fillStyle = "rgba(255,255,255,.55)"; for (let i = 0; i < 3; i++) { const x = ((t * 3 + i * 14) % 44) - 4, y = 33 + i * 2; c.beginPath(); c.arc(x, y, 3, 0, 7); c.arc(x + 3, y + .6, 2.4, 0, 7); c.fill(); }
  } else if (sid === "sphaeren") {
    // Glorreich: eigenes Modell, das Cello als Sternbild aus Licht, mit Nebel, Ring, Komet und vielen Sternen
    const P = [[16, 14], [10, 17], [8, 23], [10, 28], [8, 32], [10, 37], [17, 38.5], [24, 37], [26, 32], [24, 28], [26, 23], [24, 17]];
    c0.save(); c0.globalCompositeOperation = "lighter"; const g = c0.createRadialGradient(17, 26, 2, 17, 26, 24); g.addColorStop(0, "rgba(150,120,255," + (.55 + .15 * Math.sin(t * 3)) + ")"); g.addColorStop(.6, "rgba(90,130,255,.28)"); g.addColorStop(1, "rgba(60,90,255,0)"); c0.fillStyle = g; c0.beginPath(); c0.arc(17, 26, 24, 0, 7); c0.fill(); c0.restore();
    c.save(); c.beginPath(); P.forEach((p2, i) => i ? c.lineTo(p2[0], p2[1]) : c.moveTo(p2[0], p2[1])); c.closePath(); c.fillStyle = "rgba(40,36,120,.55)"; c.fill(); c.restore();
    c0.save(); c0.globalCompositeOperation = "lighter"; c0.strokeStyle = "rgba(220,230,255,.9)"; c0.lineWidth = 1.2; c0.beginPath(); P.forEach((p2, i) => i ? c0.lineTo(p2[0], p2[1]) : c0.moveTo(p2[0], p2[1])); c0.closePath(); c0.stroke(); c0.lineWidth = .7; [[16, 14, 16, 38.5], [8, 23, 26, 23], [10, 28, 24, 28]].forEach(l => { c0.beginPath(); c0.moveTo(l[0], l[1]); c0.lineTo(l[2], l[3]); c0.stroke(); }); c0.restore();
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); P.forEach((p2, i) => i ? c.lineTo(p2[0], p2[1]) : c.moveTo(p2[0], p2[1])); c.closePath(); c.stroke();
    const star4 = (x, y, r, col) => { c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r * .3, y - r * .3); c.lineTo(x + r, y); c.lineTo(x + r * .3, y + r * .3); c.lineTo(x, y + r); c.lineTo(x - r * .3, y + r * .3); c.lineTo(x - r, y); c.lineTo(x - r * .3, y - r * .3); c.closePath(); c.lineWidth = 1.2; F(col); };
    c.strokeStyle = INK; P.forEach((p2, i) => star4(p2[0], p2[1], 1.7 + .5 * Math.sin(t * 4 + i), i % 2 ? "#ffe27a" : "#fff"));
    c0.save(); c0.globalCompositeOperation = "lighter"; c0.strokeStyle = "rgba(255,226,122,.9)"; c0.lineWidth = 1.4; c0.beginPath(); c0.moveTo(16, 14); c0.lineTo(16, 6); c0.stroke(); c0.restore(); c.strokeStyle = INK; c.lineWidth = 1.8; c.beginPath(); c.moveTo(16.8, 13); c.lineTo(16.8, 7); c.stroke();
    c.strokeStyle = INK; star4(16, 4, 4.4 + Math.sin(t * 5) * .5, "#ffe27a");
    // Ring kreist um den Korpus
    c0.save(); c0.globalCompositeOperation = "lighter"; c0.strokeStyle = "rgba(255,226,122,.85)"; c0.lineWidth = 1.2; c0.beginPath(); c0.ellipse(17, 27, 15, 4.5, -.5 + Math.sin(t * .9) * .15, 0, 7); c0.stroke(); c0.restore();
    // Komet als Bogen
    c0.save(); c0.globalCompositeOperation = "lighter"; const cg = c0.createLinearGradient(33, 9, 31, 36); cg.addColorStop(0, "rgba(255,255,255,.95)"); cg.addColorStop(1, "rgba(160,190,255,0)"); c0.strokeStyle = cg; c0.lineWidth = 2; c0.beginPath(); c0.moveTo(33, 9); c0.lineTo(31, 36); c0.stroke(); c0.restore(); c.strokeStyle = INK; star4(33, 8, 3.2, "#fff");
    // Funkelnde Sterne, Sternschnuppe, kreisende Planeten
    for (let i = 0; i < 12; i++) { const u = (t * .5 + hs2(i, 3, 5)) % 1, px = 2 + hs2(i, 1, 4) * 36, py = 3 + hs2(i, 2, 4) * 34, tw = .5 + .5 * Math.sin(t * 5 + i * 2); c.globalAlpha = tw; c.fillStyle = i % 3 === 0 ? "#ffe27a" : "#cfe0ff"; c.beginPath(); c.arc(px, py, .8 + tw * .9, 0, 7); c.fill(); }
    c.globalAlpha = 1; const ph = (t * .5) % 1; if (ph < .4) { const u = ph / .4; c0.save(); c0.globalCompositeOperation = "lighter"; c0.strokeStyle = "rgba(255,255,255," + (1 - u) + ")"; c0.lineWidth = 1.4; c0.beginPath(); c0.moveTo(4 + u * 24, 2 + u * 14); c0.lineTo(-4 + u * 24, -4 + u * 14); c0.stroke(); c0.restore(); }
    c.strokeStyle = INK; c.lineWidth = 1.6; [[0, "#ffb86a"], [3.14, "#8ad0ff"]].forEach(([ph2, col]) => { const a = t * 1.1 + ph2; c.beginPath(); c.arc(17 + Math.cos(a) * 17, 27 + Math.sin(a) * 7 - 2, 2.2, 0, 7); F(col); });
  } else { c0.restore(); drawIcon(c0, kindIcon(INSTR[iid].kind), x, y, s); return; }
  c0.restore();
}

/* ----- Oberfläche des glorreichen Skins (Stimmen und Fangen): Farben und Dekor ----- */
const SKIN_UI = {
  sphaeren: { deco: "star", wash: "rgba(14,18,54,.94)", paper: "rgba(28,34,92,.92)", ink: "#f2f0ff", on: "#ffe27a", off: "#c8b8ff", zoneIn: "rgba(255,226,122,.75)", zoneOut: "rgba(120,150,255,.5)", zoneInS: "#ffe27a", zoneOutS: "#9fb4ff", progBg: "rgba(14,18,54,.92)", prog: "#9fb4ff", progBonus: "#ffe27a", wave: "#d8e4ff" },
  gewitter: { deco: "bolt", wash: "rgba(22,32,70,.93)", paper: "rgba(34,50,104,.92)", ink: "#e9f4ff", on: "#fff6a0", off: "#9fd6ff", zoneIn: "rgba(255,246,120,.78)", zoneOut: "rgba(90,170,255,.55)", zoneInS: "#ffe94a", zoneOutS: "#7fd6ff", progBg: "rgba(22,32,70,.92)", prog: "#7fd6ff", progBonus: "#ffe94a", wave: "#bfe8ff" }
};
function skUi() { const s = skinOf(S.eq); return s && s.t >= 5 ? SKIN_UI[s.id] : null; }
const skHs = (a, b, k) => { const v = Math.sin(a * 127.1 + b * 311.7 + k * 74.7) * 43758.5453; return v - Math.floor(v); };
function skBolt(c, x1, y1, x2, y2, seed, w, col) { const n = 7; c.beginPath(); c.moveTo(x1, y1); for (let i = 1; i < n; i++) { const u = i / n, nx = -(y2 - y1), ny = (x2 - x1), l = Math.hypot(nx, ny) || 1, o = (skHs(seed, i, 3) - .5) * 26; c.lineTo(x1 + (x2 - x1) * u + nx / l * o, y1 + (y2 - y1) * u + ny / l * o); } c.lineTo(x2, y2); c.strokeStyle = col || "#e9f6ff"; c.lineWidth = w || 2; c.stroke(); }
/* Vierzackiger Funkelstern */
function skStar(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r * .28, y - r * .28); c.lineTo(x + r, y); c.lineTo(x + r * .28, y + r * .28); c.lineTo(x, y + r); c.lineTo(x - r * .28, y + r * .28); c.lineTo(x - r, y); c.lineTo(x - r * .28, y - r * .28); c.closePath(); c.fill(); }
/* Dekor nach der normalen Zeichnung: Blitze (Gewitter) oder Sterne (Sphären) am Rand, leuchtender Griff */
function skDecor(c, kind, g, t) {
  const th = skUi(), star = th && th.deco === "star";
  c.save(); c.globalCompositeOperation = "lighter"; c.lineCap = c.lineJoin = "round";
  const q = Math.floor(t * 9);
  if (star) {
    if (kind === "freq") { for (let i = 0; i < 16; i++) { const x = g.x0 + skHs(i, 1, 3) * g.W, y = skHs(i, 2, 3) > .5 ? g.ytop : g.ybot, tw = .5 + .5 * Math.sin(t * 4 + i * 1.7); c.globalAlpha = tw * .9; skStar(c, x, y, 2 + tw * 3, i % 3 ? "#cfe0ff" : "#ffe27a"); }
      const gl = c.createLinearGradient(g.ux - 70, g.hy, g.ux, g.hy); gl.addColorStop(0, "rgba(255,226,122,0)"); gl.addColorStop(1, "rgba(255,226,122,.55)"); c.globalAlpha = 1; c.fillStyle = gl; c.beginPath(); c.moveTo(g.ux - 70, g.hy); c.lineTo(g.ux, g.hy - 5); c.lineTo(g.ux, g.hy + 5); c.closePath(); c.fill(); c.globalAlpha = 1; skStar(c, g.ux, g.hy, 15, "#fff6c0"); skStar(c, g.ux, g.hy, 9, "#ffe27a"); }
    else if (kind === "bal") { c.globalAlpha = .8; c.strokeStyle = "rgba(220,230,255,.7)"; c.lineWidth = 1; c.setLineDash([3, 4]); c.beginPath(); for (let i = 0; i < 5; i++) { const x = g.zx + g.zw * (i + .5) / 5, y = g.ytr + g.bh * (.3 + .4 * skHs(i, 4, 3)); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.setLineDash([]); for (let i = 0; i < 5; i++) { const x = g.zx + g.zw * (i + .5) / 5, y = g.ytr + g.bh * (.3 + .4 * skHs(i, 4, 3)); skStar(c, x, y, 4 + 2 * Math.sin(t * 5 + i), g.inZ ? "#fff6c0" : "#cfe0ff"); }
      for (let i = 0; i < 6; i++) { const u = (t * 1.4 + i / 6) % 1; c.globalAlpha = (1 - u) * .9; skStar(c, g.px2 + (skHs(i, q, 5) - .5) * 14, g.py2 + 7 - u * 12, 2 + skHs(i, 2, 3) * 2, "#ffe27a"); }
      if (g.inZ) { for (let i = 0; i < 5; i++) { const u = (t * 1.1 + i / 5) % 1; c.globalAlpha = (1 - u); skStar(c, g.zx + g.zw * skHs(i, 7, 3), g.ytr - 4 - u * 18, 3, "#fff6c0"); } } }
    c.restore(); return;
  }
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
/* Skin-Kennung aus der Handbeschreibung ("i:guitar:gewitter") und seine Stufe */
const skinSid = hd => { const p = (hd || "").split(":"); return p[0] === "i" && p[2] ? p[2] : ""; };
const skinTierOf = sid => { for (const i in SKINS) { const s = SKINS[i].find(x => x.id === sid); if (s) return s.t; } return 0; };
/* Effekte bei Wurf, Fang und Fehlschlag des glorreichen Skins. Zeichnet am Punkt (px,py) des Wurfs und (tx,ty) des Tonlings;
   kind: cast, win, lost; u = Sekunden seit Beginn; k = Größenfaktor (1 = Bildschirmpixel). Wird bei dir und bei anderen Spielern genutzt. */
const SKFX_LEN = { cast: .9, win: 1.8, lost: 1.4 };
function skFxGen(c, kind, u, px, py, tx, ty, t, k, style) {
  if (!(u >= 0 && u < SKFX_LEN[kind])) return; const q = Math.floor(t * 14), L = SKFX_LEN[kind], w = u / L;
  c.save(); c.globalCompositeOperation = "lighter"; c.lineCap = c.lineJoin = "round";
  if (style === "star") {
    if (kind === "cast") { c.lineWidth = 3 * k; for (let i = 0; i < 3; i++) { const r = Math.max(0, w - i * .12) * 140 * k; c.globalAlpha = Math.max(0, 1 - w - i * .1); c.strokeStyle = i % 2 ? "#ffe27a" : "#cfe0ff"; c.beginPath(); c.arc(px, py, r, 0, 7); c.stroke(); } for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283 + skHs(i, 1, 2), r = (20 + w * 120) * k; c.globalAlpha = 1 - w; skStar(c, px + Math.cos(a) * r, py + Math.sin(a) * r, (4 + skHs(i, 2, 2) * 4) * k, i % 2 ? "#fff6c0" : "#c8b8ff"); } }
    else if (kind === "win") { c.globalAlpha = 1 - w; for (let i = 0; i < 8; i++) { const dx = (i - 3.5) * 60 * k, d = (1 - ((w * 1.4 + i * .13) % 1)), x1 = tx + dx + 160 * k * d, y1 = ty - 360 * k * d, gr = c.createLinearGradient(x1, y1, x1 + 90 * k, y1 - 150 * k); gr.addColorStop(0, "rgba(255,246,190,.9)"); gr.addColorStop(1, "rgba(255,246,190,0)"); c.strokeStyle = gr; c.lineWidth = 3.5 * k; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 + 90 * k, y1 - 150 * k); c.stroke(); skStar(c, x1, y1, 5 * k, "#fff"); }
      const g = c.createRadialGradient(tx, ty, 4 * k, tx, ty, 170 * k); g.addColorStop(0, "rgba(255,226,122,.6)"); g.addColorStop(1, "rgba(255,226,122,0)"); c.fillStyle = g; c.fillRect(tx - 180 * k, ty - 180 * k, 360 * k, 360 * k); for (let i = 0; i < 24; i++) { const a = skHs(i, 1, 7) * 6.283, r = w * (50 + skHs(i, 2, 7) * 140) * k; c.globalAlpha = (1 - w) * .95; skStar(c, tx + Math.cos(a) * r, ty + Math.sin(a) * r - w * 20 * k, (3 + skHs(i, 3, 7) * 4) * k, i % 2 ? "#ffe27a" : "#c8b8ff"); } }
    else { c.globalAlpha = (1 - w) * .8; for (let i = 0; i < 9; i++) { const x = px + (i - 4) * 14 * k + Math.sin(i + w * 3) * 6 * k, y = py - 20 * k + w * (40 + skHs(i, 1, 9) * 50) * k; skStar(c, x, y, (3 + skHs(i, 2, 9) * 3) * k, "#8e9ac8"); } c.globalAlpha = (1 - w) * .35; const g2 = c.createRadialGradient(px, py, 4 * k, px, py, 80 * k); g2.addColorStop(0, "rgba(40,50,120,.7)"); g2.addColorStop(1, "rgba(40,50,120,0)"); c.fillStyle = g2; c.beginPath(); c.arc(px, py, 80 * k, 0, 7); c.fill(); }
    c.restore(); return;
  }
  if (kind === "cast") { const n = 9; c.globalAlpha = 1 - w; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + skHs(i, 1, 2); skBolt(c, px, py, px + Math.cos(a) * (60 + w * 90) * k, py + Math.sin(a) * (60 + w * 90) * k, q + i * 3, 2.4 * k, i % 2 ? "#bfe8ff" : "#fff6a0"); } const g = c.createRadialGradient(px, py, 4 * k, px, py, (80 + w * 80) * k); g.addColorStop(0, "rgba(190,230,255," + .5 * (1 - w) + ")"); g.addColorStop(1, "rgba(190,230,255,0)"); c.fillStyle = g; c.beginPath(); c.arc(px, py, 160 * k, 0, 7); c.fill(); }
  else if (kind === "win") { c.globalAlpha = 1 - w; for (let i = 0; i < 5; i++) skBolt(c, tx + (i - 2) * 46 * k, ty - 400 * k, tx + (i - 2) * 6 * k, ty, q + i * 4, 3 * k, "#fff6a0"); const g = c.createRadialGradient(tx, ty, 4 * k, tx, ty, 190 * k); g.addColorStop(0, "rgba(255,246,160,.6)"); g.addColorStop(1, "rgba(255,246,160,0)"); c.fillStyle = g; c.fillRect(tx - 200 * k, ty - 200 * k, 400 * k, 400 * k); for (let i = 0; i < 30; i++) { const a = skHs(i, 1, 7) * 6.283, r = w * (60 + skHs(i, 2, 7) * 150) * k; c.fillStyle = i % 2 ? "#fff6a0" : "#9fd6ff"; c.globalAlpha = (1 - w) * .9; c.beginPath(); c.arc(tx + Math.cos(a) * r, ty + Math.sin(a) * r - w * 30 * k, (2 + skHs(i, 3, 7) * 2) * k, 0, 7); c.fill(); } }
  else { c.globalAlpha = (1 - w) * .8; for (let i = 0; i < 4; i++) skBolt(c, px + (i - 1.5) * 18 * k, py - 10 * k + w * 10 * k, px + (i - 1.5) * 26 * k + (skHs(q, i, 3) - .5) * 30 * k, py + (50 + w * 40) * k, q + i, 1.6 * k, "#9aa8c4"); c.fillStyle = "#9aa8c4"; for (let i = 0; i < 14; i++) { const a = skHs(i, 1, 9) * 6.283, r = (10 + w * 70 * skHs(i, 2, 9)) * k; c.globalAlpha = (1 - w) * .7; c.beginPath(); c.arc(px + Math.cos(a) * r, py + Math.sin(a) * r + w * 30 * k, 1.6 * k, 0, 7); c.fill(); } }
  c.restore();
}
/* Eigener Bildschirm: Phase des Fangs bestimmt den Effekt */
function skFx(c, sx, sy, tx, ty, t) {
  const s = skinOf(S.eq); if (!s || s.t < 5) return; const u = C.t || 0;
  if (C.ph === "ringres" && C.perfect !== undefined) skFxGen(c, "cast", u, sx, sy - 20, tx, ty, t, 1, skStyle(s.id));
  else if (C.ph === "result") skFxGen(c, "win", u, sx, sy - 20, tx, ty, t, 1, skStyle(s.id));
  else if (C.ph === "flee" || C.ph === "miss") skFxGen(c, "lost", u, sx, sy - 20, tx, ty, t, 1, skStyle(s.id));
}
/* Andere Spieler: gleiche Effekte in der Welt, ausgelöst durch den Phasenwechsel ihres Fangs (o.c) */
function skOtherFx(c, o, t, items) {
  const sid = skinSid(o.h); if (skinTierOf(sid) < 5) { o._ph = undefined; return; }
  const ph = (o.c || "").split("|")[0], now = performance.now() / 1000;
  if (o._ph !== ph) { const prev = o._ph; o._ph = ph; if (prev === "ring" && ph !== "ring" && ph !== "") { o._fx = { kind: "cast", t0: now }; } else if (ph === "win") o._fx = { kind: "win", t0: now }; else if (ph === "lost") o._fx = { kind: "lost", t0: now }; }
  if (!o._fx) return; const u = now - o._fx.t0; if (u > SKFX_LEN[o._fx.kind]) { o._fx = null; return; }
  const k = 1 / (typeof Z === "number" && Z > 0 ? Z : 1), kind = o._fx.kind;
  items.push({ y: o.y + 40, f: () => skFxGen(c, kind, u, o.x, o.y - 20, o.x + (o.f || 1) * 38, o.y - 4, t, k, skStyle(sid)) });
}
/* Aufsteigende Noten beim Fangen: beim glorreichen Skin als Strom-Noten (Kristallfarben, Leuchten, kleine Blitze) */
const skNoteCols = () => { const s = skinOf(S.eq); return s && skStyle(s.id) === "star" ? ["#ffe27a", "#c8b8ff", "#9fd0ff"] : ["#bfe8ff", "#fff6a0", "#7fd6ff"]; };
function skNotes(c, px, py, f, t, layer, sid) {
  const star = skStyle(sid) === "star", n = 8, cols = star ? ["#ffe27a", "#c8b8ff", "#9fd0ff", "#ffffff"] : ["#bfe8ff", "#fff6a0", "#7fd6ff", "#ffffff"];
  c.save(); for (let i = 0; i < n; i++) { if (i % 2 !== layer) continue;
    const P = 1.5 + skHs(i, 3, 41) * 1.3, T0 = t / P + skHs(i, 5, 43) * 7, kk = Math.floor(T0), u = T0 - kk, R = j => skHs(i * 31 + kk, j, 47);
    const side = R(1) < .6 ? f : -f, ang = -Math.PI / 2 + (R(2) - .5) * .85 + side * .12, dist = 36 + R(3) * 34, e = 1 - Math.pow(1 - u, 2.2);
    const x = px + side * (3 + R(4) * 7) + Math.cos(ang) * dist * e + Math.sin(u * 5 + R(5) * 6) * 3 * u, y = py - 12 + Math.sin(ang) * dist * e, a = Math.min(1, u / .12) * Math.pow(1 - u, .8), sz = 15 + R(6) * 8 + (1 - u) * 3;
    c.globalAlpha = a; c.save(); c.globalCompositeOperation = "lighter"; const g = c.createRadialGradient(x, y, 1, x, y, sz * .9); g.addColorStop(0, star ? "rgba(255,226,122,.5)" : "rgba(190,230,255,.55)"); g.addColorStop(1, star ? "rgba(200,184,255,0)" : "rgba(190,230,255,0)"); c.fillStyle = g; c.beginPath(); c.arc(x, y, sz * .9, 0, 7); c.fill();
    c.strokeStyle = "rgba(255,246,160,.9)"; c.lineWidth = 1.4; const q = Math.floor(T0 * 10); if (star) { skStar(c, x + sz * .6, y - sz * .6, sz * (.25 + .15 * Math.sin(T0 * 30)), "#fff"); } else if (skHs(i, q, 5) > .45) skBolt(c, x - sz * .5, y + sz * .6, x + sz * .5, y - sz * .6, q + i, 1.4, "#fff6a0"); c.restore();
    drawGlyph(c, i % 3 ? "note" : "note2", x, y, sz, cols[Math.floor(R(7) * 4) % 4]); }
  c.restore();
}
