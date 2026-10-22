/* ===== WETTER: Spielteil (Anzeige, Boni, Totem-Überschreibung). Die Berechnung selbst steht in wx_core.js (auch im Server genutzt). ===== */
/* Totem-Überschreibung (vom Server gesetzt): { k: Abschnitt, id: Wetter } */
let WXO = null;
const wxT = () => (typeof WIKI_LITE !== "undefined" && typeof W !== "undefined" && W.worldT) ? W.worldT() : (typeof S !== "undefined" ? S.t : 0);
function wxAt(t) { const s = wxSlot(t == null ? wxT() : t); let id = wxOf(s.k, s.night); if (WXO && WXO.k === s.k && WX[WXO.id] && !wxRare(id)) id = WXO.id; return Object.assign({ id, def: WX[id] }, s); }
const wxNow = () => wxAt().def;
const wxNowId = () => wxAt().id;
const wxSpd = () => wxNow().spd || 0;
const wxAdd = k => (wxNow().add || {})[k] || 0;
/* Vorliebe: Spawn-Gewicht der Art in diesem Wetter */
const wxPref = (sp, id) => { const d = WX[id || wxNowId()]; if (!d) return 1; return d.like.includes(sp.id) ? 1.7 : d.hate.includes(sp.id) ? 0.45 : 1; };
/* Wettermutation für diesen Fang (oder null) */
function wxMutRoll() { const m = wxNow().mut; if (!m) return null; for (const id in m) if (Math.random() < m[id]) return id; return null; }
const wxOutdoor = area => area === 1 || area === 3 || area === 4;

/* ----- Optik ----- */
function wxDraw(c, VW, VH, t, area, nightA) {
  if (!wxOutdoor(area)) return;
  const id = wxNowId(), s = wxSlot(S.t), fadeIn = Math.min(1, (S.t - s.start) / 6, (s.end - S.t) / 6 + .0), f = Math.max(0, Math.min(1, fadeIn));
  const hs = (a, b, k) => { const v = Math.sin(a * 127.1 + b * 311.7 + k * 74.7) * 43758.5453; return v - Math.floor(v); };
  c.save(); c.globalAlpha = f; c.lineCap = "round"; c.globalCompositeOperation = "source-over";
  const tint = (col, a) => { c.fillStyle = col; c.globalAlpha = f * a; c.fillRect(0, 0, VW, VH); c.globalAlpha = f; };
  const rain = (n, slant, len, spd, col, w) => { c.strokeStyle = col; c.lineWidth = w;
    for (let i = 0; i < n; i++) { const per = 0.55 + hs(i, 1, 3) * .35, ph = ((t / per) + hs(i, 2, 3)) % 1, x0 = hs(i, 4, 3) * (VW + 120) - 60, ty = VH * (.12 + hs(i, 5, 3) * .86), y = ph * ty, x = x0 + slant * y;
      if (ph < .94) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + slant * len, y + len); c.stroke(); }
      else { const sp = (ph - .94) / .06, r = 3 + sp * 9; c.globalAlpha = f * (1 - sp) * .8; c.beginPath(); c.ellipse(x0 + slant * ty, ty, r, r * .4, 0, 0, 7); c.stroke(); c.beginPath(); c.moveTo(x0 + slant * ty - 3, ty); c.lineTo(x0 + slant * ty - 6 - sp * 4, ty - 6 - sp * 6); c.moveTo(x0 + slant * ty + 3, ty); c.lineTo(x0 + slant * ty + 6 + sp * 4, ty - 6 - sp * 6); c.stroke(); c.globalAlpha = f; } } };
  if (id === "bewoelkt") { tint("#2b3350", .16); for (let i = 0; i < 5; i++) { const x = ((t * (6 + i * 2) + i * 260) % (VW + 500)) - 250, y = 40 + i * 70; const g = c.createRadialGradient(x, y, 10, x, y, 190); g.addColorStop(0, "rgba(90,100,130,.26)"); g.addColorStop(1, "rgba(90,100,130,0)"); c.fillStyle = g; c.fillRect(x - 200, y - 200, 400, 400); } }
  else if (id === "regen") { tint("#1c2a55", .22); rain(Math.round(Math.min(150, VW / 8)), .18, 17, 1, "rgba(190,220,255,.7)", 1.4); }
  else if (id === "sturm") { tint("#141c40", .34); rain(Math.round(Math.min(200, VW / 6)), .5, 26, 1, "rgba(205,225,255,.75)", 1.7); const q = Math.floor(t * 1.6), fl = hs(q, 1, 9) > .82 ? Math.max(0, 1 - ((t * 1.6) % 1) * 3.2) : 0; if (fl > 0) { c.globalAlpha = f * fl * .5; c.fillStyle = "#fff"; c.fillRect(0, 0, VW, VH); c.globalAlpha = f; c.strokeStyle = "#fff6b0"; c.lineWidth = 3; c.beginPath(); let x = hs(q, 2, 9) * VW, y = 0; c.moveTo(x, y); while (y < VH * .55) { x += (hs(q, y | 0, 5) - .5) * 70; y += 40; c.lineTo(x, y); } c.stroke(); } }
  else if (id === "wind") { tint("#aab8c8", .05); c.strokeStyle = "rgba(235,245,255,.5)"; c.lineWidth = 1.5; for (let i = 0; i < 26; i++) { const sp = 380 + hs(i, 1, 4) * 300, x = ((hs(i, 2, 4) * (VW + 400) + t * sp) % (VW + 400)) - 200, y = hs(i, 3, 4) * VH + Math.sin(t * 2 + i) * 6, l = 50 + hs(i, 5, 4) * 90; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y - 8, x + l, y); c.stroke(); } c.fillStyle = "rgba(120,190,90,.8)"; for (let i = 0; i < 9; i++) { const sp = 300 + hs(i, 6, 4) * 200, x = ((hs(i, 7, 4) * (VW + 300) + t * sp) % (VW + 300)) - 150, y = hs(i, 8, 4) * VH + Math.sin(t * 5 + i * 2) * 14; c.save(); c.translate(x, y); c.rotate(t * 6 + i); c.beginPath(); c.ellipse(0, 0, 6, 3, 0, 0, 7); c.fill(); c.restore(); } }
  else if (id === "schnee") { tint("#dfeaff", .1); c.fillStyle = "rgba(255,255,255,.9)"; for (let i = 0; i < 110; i++) { const sz = 1.5 + hs(i, 1, 6) * 2.5, sp = 22 + sz * 14, x = (hs(i, 2, 6) * VW + Math.sin(t * .9 + i) * 24 + t * 8) % VW, y = ((hs(i, 3, 6) * VH + t * sp) % (VH + 20)) - 10; c.beginPath(); c.arc((x + VW) % VW, y, sz, 0, 7); c.fill(); } }
  else if (id === "nebel") { const g = c.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * .12, VW / 2, VH / 2, Math.max(VW, VH) * .62); g.addColorStop(0, "rgba(205,215,225,.18)"); g.addColorStop(.5, "rgba(205,215,225,.6)"); g.addColorStop(1, "rgba(205,215,225,.9)"); c.fillStyle = g; c.fillRect(0, 0, VW, VH);
    for (let i = 0; i < 7; i++) { const x = ((t * (8 + i * 3) + i * 330) % (VW + 600)) - 300, y = VH * (.1 + i * .13) + Math.sin(t * .4 + i) * 20; const q = c.createRadialGradient(x, y, 10, x, y, 220); q.addColorStop(0, "rgba(225,232,240,.3)"); q.addColorStop(1, "rgba(225,232,240,0)"); c.fillStyle = q; c.fillRect(x - 230, y - 230, 460, 460); } }
  else if (id === "hitze") { tint("#ff9a3c", .1); c.strokeStyle = "rgba(255,230,160,.22)"; c.lineWidth = 2; for (let i = 0; i < 9; i++) { const y = VH * (.35 + i * .07), o = Math.sin(t * 2 + i) * 6; c.beginPath(); for (let x = 0; x <= VW; x += 24) c.lineTo(x, y + Math.sin(x * .03 + t * 3 + i) * 5 + o); c.stroke(); } const g = c.createRadialGradient(VW * .85, 0, 10, VW * .85, 0, VW * .6); g.addColorStop(0, "rgba(255,230,140,.4)"); g.addColorStop(1, "rgba(255,200,90,0)"); c.fillStyle = g; c.fillRect(0, 0, VW, VH); }
  else if (id === "regenbogen") { c.globalCompositeOperation = "lighter"; const cx = VW * .5, cy = VH * 1.05, R = Math.min(VW * .62, VH * 1.0); ["#ff4d4d", "#ff9a3c", "#ffe14d", "#5fe85f", "#4da6ff", "#7a5cff", "#c05cff"].forEach((col, i) => { c.strokeStyle = col; c.globalAlpha = f * (.2 + .05 * Math.sin(t * 1.5 + i)); c.lineWidth = 14; c.beginPath(); c.arc(cx, cy, R - i * 13, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); }); c.globalAlpha = f; c.fillStyle = "rgba(255,255,255,.8)"; for (let i = 0; i < 22; i++) { const a = hs(i, 1, 2) * 6.28, r = hs(i, 2, 2) * 60 + 30; const pu = .5 + .5 * Math.sin(t * 2.2 + i * 1.7); c.globalAlpha = f * pu * .7; c.beginPath(); c.arc(VW * (.1 + hs(i, 3, 2) * .8), VH * (.05 + hs(i, 4, 2) * .8), 1 + pu * 2, 0, 7); c.fill(); } c.globalCompositeOperation = "source-over"; }
  else if (id === "aurora") { tint("#06143a", .2); c.globalCompositeOperation = "lighter"; for (let b = 0; b < 3; b++) { const col = ["95,232,176", "120,160,255", "200,120,255"][b]; for (let x = 0; x < VW; x += 8) { const y = VH * (.12 + b * .06) + Math.sin(x * .004 + t * .35 + b * 2) * 40 + Math.sin(x * .011 + t * .6) * 14, h = 90 + 50 * Math.sin(x * .006 + t * .5 + b); const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, "rgba(" + col + ",0)"); g.addColorStop(.25, "rgba(" + col + ",.2)"); g.addColorStop(1, "rgba(" + col + ",0)"); c.fillStyle = g; c.fillRect(x, y, 9, h); } } c.globalCompositeOperation = "source-over"; }
  else if (id === "frostmond") { tint("#16306a", .24); c.globalCompositeOperation = "lighter"; c.fillStyle = "rgba(190,230,255,.9)"; for (let i = 0; i < 70; i++) { const sz = 1 + hs(i, 1, 6) * 2, x = (hs(i, 2, 6) * VW + Math.sin(t * .7 + i) * 18) % VW, y = ((hs(i, 3, 6) * VH + t * (18 + sz * 10)) % (VH + 20)) - 10, pu = .5 + .5 * Math.sin(t * 3 + i * 2); c.globalAlpha = f * (.3 + pu * .6); c.beginPath(); c.arc(x, y, sz, 0, 7); c.fill(); } c.globalAlpha = f; const g = c.createRadialGradient(VW * .82, VH * .14, 6, VW * .82, VH * .14, 130); g.addColorStop(0, "rgba(230,245,255,.65)"); g.addColorStop(.3, "rgba(170,215,255,.25)"); g.addColorStop(1, "rgba(150,200,255,0)"); c.fillStyle = g; c.fillRect(0, 0, VW, VH); c.globalCompositeOperation = "source-over"; }
  else if (id === "sternschnuppen") { tint("#0a1238", .12); c.globalCompositeOperation = "lighter"; for (let i = 0; i < 4; i++) { const per = 3 + i * 1.7, ph = ((t + i * 1.3) % per) / per; if (ph > .22) continue; const q = ph / .22, x0 = hs(Math.floor((t + i * 1.3) / per), i, 8) * VW * .8 + 40, y0 = VH * .05 + hs(Math.floor((t + i * 1.3) / per), i, 9) * VH * .3, x = x0 + q * 260, y = y0 + q * 150; const g = c.createLinearGradient(x, y, x - 120, y - 70); g.addColorStop(0, "rgba(255,244,190," + (1 - q) + ")"); g.addColorStop(1, "rgba(255,244,190,0)"); c.strokeStyle = g; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 120, y - 70); c.stroke(); } c.globalCompositeOperation = "source-over"; }
  else if (id === "blutmond") { tint("#4a0a14", .3); c.globalCompositeOperation = "lighter"; const g = c.createRadialGradient(VW * .8, VH * .16, 8, VW * .8, VH * .16, 150); g.addColorStop(0, "rgba(255,70,70,.85)"); g.addColorStop(.35, "rgba(220,30,50,.35)"); g.addColorStop(1, "rgba(200,20,40,0)"); c.fillStyle = g; c.fillRect(0, 0, VW, VH); c.fillStyle = "rgba(255,90,70,.8)"; for (let i = 0; i < 40; i++) { const x = hs(i, 1, 5) * VW + Math.sin(t + i) * 10, y = ((hs(i, 2, 5) * VH - t * (12 + hs(i, 3, 5) * 18)) % VH + VH) % VH, pu = .5 + .5 * Math.sin(t * 2.5 + i); c.globalAlpha = f * pu * .6; c.beginPath(); c.arc(x, y, 1.5, 0, 7); c.fill(); } c.globalCompositeOperation = "source-over"; }
  c.restore();
}

/* ----- Optik der Wettermutationen (wird in drawTonling aufgerufen) ----- */
function wxMutFx(c, mut, s, t) {
  if (mut === "aurora") { c.save(); c.globalCompositeOperation = "lighter"; for (let b = 0; b < 3; b++) { const col = ["95,232,176", "130,160,255", "210,130,255"][b]; c.strokeStyle = "rgba(" + col + ",.65)"; c.lineWidth = Math.max(2, s * .07); c.beginPath(); for (let i = 0; i <= 12; i++) { const x = (i / 12 - .5) * s * 1.1, y = -s * .1 - Math.abs(x) * .3 + Math.sin(t * 2 + i * .7 + b * 2) * s * .06 - b * s * .08; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } c.restore(); }
  if (mut === "regenb") { c.save(); c.globalAlpha = .75; ["#ff4d4d", "#ff9a3c", "#ffe14d", "#5fe85f", "#4da6ff", "#a05cff"].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = Math.max(1.5, s * .035); c.beginPath(); c.arc(0, s * .42, s * (.62 - i * .04), Math.PI * 1.05, Math.PI * 1.95); c.stroke(); }); c.restore(); }
  if (mut === "gefror" || mut === "frostnova") { c.save(); c.globalAlpha = .38; c.fillStyle = "#bfe8ff"; c.beginPath(); c.ellipse(0, s * .2, s * .38, s * .4, 0, 0, 7); c.fill(); c.globalAlpha = 1; c.strokeStyle = "#e9f8ff"; c.fillStyle = "#cfeeff"; c.lineWidth = Math.max(1, s * .02); [[-.33, .0, .1], [.3, .38, .12], [.12, -.18, .08], [-.18, .5, .09]].forEach(p => { c.beginPath(); c.moveTo(p[0] * s, (p[1] - p[2]) * s); c.lineTo((p[0] + p[2] * .5) * s, p[1] * s); c.lineTo(p[0] * s, (p[1] + p[2] * .9) * s); c.lineTo((p[0] - p[2] * .5) * s, p[1] * s); c.closePath(); c.fill(); c.stroke(); });
    if (mut === "frostnova") { c.strokeStyle = "rgba(200,240,255,.85)"; c.lineWidth = Math.max(1.4, s * .03); c.translate(0, s * .2); c.rotate(t * .8); for (let i = 0; i < 6; i++) { c.rotate(Math.PI / 3); c.beginPath(); c.moveTo(0, s * .46); c.lineTo(0, s * .7); c.moveTo(0, s * .58); c.lineTo(s * .07, s * .64); c.moveTo(0, s * .58); c.lineTo(-s * .07, s * .64); c.stroke(); } } c.restore(); }
  if (mut === "sonnig") { c.save(); c.translate(0, s * .2); c.rotate(t * .7); c.fillStyle = "rgba(255,200,60,.85)"; for (let i = 0; i < 10; i++) { c.rotate(Math.PI / 5); c.beginPath(); c.moveTo(-s * .035, -s * .5); c.lineTo(0, -s * .66 - Math.sin(t * 3 + i) * s * .02); c.lineTo(s * .035, -s * .5); c.closePath(); c.fill(); } c.restore(); }
  if (mut === "nebel") { c.save(); for (let i = 0; i < 4; i++) { const x = Math.sin(t * .8 + i * 1.7) * s * .45, y = s * (.05 + i * .16); const g = c.createRadialGradient(x, y, 1, x, y, s * .3); g.addColorStop(0, "rgba(225,232,240,.55)"); g.addColorStop(1, "rgba(225,232,240,0)"); c.fillStyle = g; c.beginPath(); c.arc(x, y, s * .3, 0, 7); c.fill(); } c.restore(); }
  if (mut === "blut") { c.save(); c.globalCompositeOperation = "lighter"; const g = c.createRadialGradient(0, s * .2, s * .1, 0, s * .2, s * .8); g.addColorStop(0, "rgba(255,40,60,0)"); g.addColorStop(.7, "rgba(230,30,50," + (.25 + .1 * Math.sin(t * 3)) + ")"); g.addColorStop(1, "rgba(200,10,30,0)"); c.fillStyle = g; c.beginPath(); c.arc(0, s * .2, s * .8, 0, 7); c.fill(); c.restore(); c.save(); c.fillStyle = "#c0182c"; c.strokeStyle = INK; c.lineWidth = Math.max(1, s * .02); c.beginPath(); c.arc(s * .36, -s * .2, s * .09, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#2a0a12"; c.beginPath(); c.arc(s * .39, -s * .22, s * .08, 0, 7); c.fill(); c.restore(); }
}

/* ----- Handgezeichnetes Wettersymbol (HUD, Wiki) ----- */
function wxIcon(c, id, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s / 40, s / 40); c.lineJoin = c.lineCap = "round"; c.lineWidth = 2.4; c.strokeStyle = INK;
  const c0 = c; c = sketchCtx(c0, strSeed("wx" + id), 40); const F = col => { c.fillStyle = col; c.fill(); c.stroke(); };
  const cloud = (col, ox, oy, k) => { c.beginPath(); c.moveTo(8 + ox, 27 + oy); c.quadraticCurveTo(2 + ox, 27 + oy, 4 + ox, 20 + oy); c.quadraticCurveTo(6 + ox, 14 + oy, 12 + ox, 16 + oy); c.quadraticCurveTo(14 + ox, 7 + oy, 22 + ox, 8 + oy); c.quadraticCurveTo(30 + ox, 8 + oy, 31 + ox, 17 + oy); c.quadraticCurveTo(38 + ox, 18 + oy, 36 + ox, 24 + oy); c.quadraticCurveTo(35 + ox, 27 + oy, 31 + ox, 27 + oy); c.closePath(); F(col); };
  const sun = (ox, oy, r, col) => { c.beginPath(); c.arc(ox, oy, r, 0, 7); F(col); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.beginPath(); c.moveTo(ox + Math.cos(a) * (r + 2), oy + Math.sin(a) * (r + 2)); c.lineTo(ox + Math.cos(a) * (r + 6), oy + Math.sin(a) * (r + 6)); c.stroke(); } };
  const moon = (ox, oy, r, col) => { c.beginPath(); c.arc(ox, oy, r, 0.5, 6.0); c.quadraticCurveTo(ox + r * .2, oy, ox + r * .85, oy + r * .55); c.closePath(); F(col); };
  switch (id) {
    case "klar": sun(20, 20, 9, "#ffd45a"); break;
    case "bewoelkt": cloud("#d4dae6", 0, 2); break;
    case "regen": cloud("#9fb4d8", 0, -4); c.strokeStyle = "#3a78d0"; c.lineWidth = 2.6; [[12, 26, 9, 35], [20, 27, 17, 36], [28, 26, 25, 35]].forEach(l => { c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.stroke(); }); break;
    case "sturm": cloud("#7c8ab8", 0, -5); c.beginPath(); c.moveTo(22, 20); c.lineTo(15, 30); c.lineTo(21, 30); c.lineTo(17, 39); c.lineTo(28, 26); c.lineTo(22, 26); c.closePath(); F("#ffe94a"); break;
    case "wind": c.strokeStyle = INK; c.lineWidth = 3; [[4, 14, 26, 14, 32, 10], [4, 22, 32, 22, 36, 26], [4, 30, 20, 30, 24, 34]].forEach(l => { c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.quadraticCurveTo(l[4], l[1] - 6, l[4] - 2, l[5]); c.stroke(); }); break;
    case "nebel": c.strokeStyle = "#8a98a8"; c.lineWidth = 4; [[6, 12, 34, 12], [3, 20, 30, 20], [8, 28, 36, 28]].forEach(l => { c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.stroke(); }); c.strokeStyle = INK; c.lineWidth = 1.4; [[6, 12, 34, 12], [3, 20, 30, 20], [8, 28, 36, 28]].forEach(l => { c.beginPath(); c.moveTo(l[0], l[1] + 3); c.lineTo(l[2], l[3] + 3); c.stroke(); }); break;
    case "schnee": cloud("#d4dae6", 0, -4); c.fillStyle = "#fff"; [[11, 30], [20, 34], [29, 30], [16, 38], [25, 38]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 2.2, 0, 7); F("#fff"); }); break;
    case "hitze": sun(20, 20, 8, "#ff9a3c"); c.strokeStyle = "#e0501a"; c.lineWidth = 2; c.beginPath(); c.moveTo(6, 36); c.quadraticCurveTo(12, 31, 18, 36); c.quadraticCurveTo(24, 41, 30, 36); c.stroke(); break;
    case "regenbogen": [["#ff4d4d", 17], ["#ffd45a", 13], ["#5fe85f", 9], ["#4da6ff", 5]].forEach(([col, r]) => { c.strokeStyle = col; c.lineWidth = 3.4; c.beginPath(); c.arc(20, 31, r, Math.PI, 0); c.stroke(); }); c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.arc(20, 31, 19, Math.PI, 0); c.stroke(); c.beginPath(); c.arc(20, 31, 3.4, Math.PI, 0); c.stroke(); break;
    case "aurora": c.strokeStyle = INK; c.lineWidth = 6; [["#5fe8b0", 12], ["#78a0ff", 20], ["#c878ff", 28]].forEach(([col, y]) => { c.strokeStyle = INK; c.lineWidth = 6.4; c.beginPath(); c.moveTo(4, y + 4); c.quadraticCurveTo(14, y - 8, 22, y + 2); c.quadraticCurveTo(30, y + 10, 36, y - 4); c.stroke(); c.strokeStyle = col; c.lineWidth = 3.6; c.beginPath(); c.moveTo(4, y + 4); c.quadraticCurveTo(14, y - 8, 22, y + 2); c.quadraticCurveTo(30, y + 10, 36, y - 4); c.stroke(); }); break;
    case "frostmond": moon(18, 18, 11, "#cfeeff"); c.strokeStyle = "#5aa8e8"; c.lineWidth = 2; c.beginPath(); c.moveTo(30, 26); c.lineTo(30, 38); c.moveTo(24, 32); c.lineTo(36, 32); c.moveTo(26, 28); c.lineTo(34, 36); c.moveTo(34, 28); c.lineTo(26, 36); c.stroke(); break;
    case "sternschnuppen": c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4.5 : 10; c[i ? "lineTo" : "moveTo"](27 + Math.cos(a) * r, 14 + Math.sin(a) * r); } c.closePath(); F("#fff0a0"); c.strokeStyle = "#ffd45a"; c.lineWidth = 2.4; [[4, 36, 18, 22], [8, 38, 16, 30], [2, 30, 12, 22]].forEach(l => { c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.stroke(); }); break;
    case "blutmond": c.beginPath(); c.arc(20, 20, 13, 0, 7); F("#d8283c"); c.fillStyle = "#8e1424"; [[14, 15, 3], [25, 22, 4], [16, 27, 2.6]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], p[2], 0, 7); c.fill(); }); break;
    case "sun": sun(14, 15, 7, "#ffd45a"); moon(27, 27, 9, "#cfe0ff"); break;
    default: cloud("#d4dae6", 0, 0);
  }
  c0.restore();
}

/* HUD: Symbol und Name des Wetters, Hinweis beim Wechsel */
let wxLast = null;
function wxHud() {
  const w = wxAt(); if (w.id === wxLast) return; const first = wxLast === null; wxLast = w.id;
  const cv = document.getElementById("tmWxI"), nm = document.getElementById("tmWx"); if (!cv || !nm) return;
  const c = cv.getContext("2d"); c.clearRect(0, 0, cv.width, cv.height); wxIcon(c, w.id, 2, 2, 48);
  nm.textContent = w.def.name; cv.title = nm.title = w.def.name + " · " + w.def.tag + ": " + w.def.d;
  if (!first && w.id !== "klar") { try { Snd.play(wxRare(w.id) ? "wx_rare" : "wx_new", 1, .7); } catch (e) {} }
  if (!first && typeof toast === "function" && w.id !== "klar") toast((wxRare(w.id) ? "Seltenes Wetter: " : "Wetter: ") + w.def.name + ". " + w.def.d, false, wxRare(w.id) ? 6000 : 3500);
}

/* ===== Totems benutzen ===== */
const WXFX = { on: false, t0: 0, id: "", who: "", kind: "weather", to: "" };
let wxPending = null, wxLastLocal = 0;
const TOT_MSG = { rare: "Das aktuelle Wetter ist zu mächtig, kein Totem kann es ändern.", cool: "Die Totems sind gerade erschöpft. Versuche es gleich noch einmal.", same: "Dieses Wetter ist schon aktiv.", id: "Dieses Totem funktioniert nicht." };
function heldTotem() { const t = S.hold ? S.inv.find(x => x.uid === S.hold) : null; return t && SP[t.sp] && SP[t.sp].tot ? t : null; }
function useTotem(t) {
  const sp = SP[t.sp], id = sp.tot;
  if (wxPending) return;
  if (typeof MP !== "undefined" && MP.on && MP.ws && MP.ws.readyState === 1) { wxPending = t.uid; MP.ws.send(JSON.stringify({ t: "tot", id })); setTimeout(() => { wxPending = null; }, 4000); return; }
  // allein spielen: dieselben Regeln lokal
  const now = S.t, sl = wxSlot(now), nat = wxOf(sl.k, sl.night), cur = WXO && WXO.k === sl.k ? WXO.id : nat;
  if (Date.now() - wxLastLocal < 45000) { toast(TOT_MSG.cool, true); return; }
  if (wxRare(nat) || wxRare(cur)) { toast(TOT_MSG.rare, true); return; }
  if (id !== "sun" && id === cur) { toast(TOT_MSG.same, true); return; }
  wxLastLocal = Date.now(); wxPending = t.uid;
  if (id === "sun") { window.TADJ = (window.TADJ || 0) + (sl.end - now + 0.05); WXO = null; wxNet({ t: "wx", id, kind: "sun", to: sl.night ? "day" : "night", ovr: null, tadj: window.TADJ, who: S.name || "Du", by: "local" }); }
  else { WXO = { k: sl.k, id }; wxNet({ t: "wx", id, kind: "weather", ovr: WXO, tadj: window.TADJ || 0, who: S.name || "Du", by: "local" }); }
}
/* Nachrichten vom Server: Zustand beim Beitritt ("hi"), Totem benutzt ("wx"), abgelehnt ("totno") */
function wxNet(m) {
  if (m.t === "hi") { window.TADJ = m.tadj || 0; WXO = m.wx || null; return; }
  if (m.t === "totno") { wxPending = null; try { Snd.play("totem_no", 1, .6); } catch (e) {} toast(TOT_MSG[m.why] || "Das Totem lässt sich gerade nicht benutzen.", true); return; }
  if (m.t !== "wx") return;
  window.TADJ = m.tadj || 0; WXO = m.ovr || null; wxLast = null;
  Object.assign(WXFX, { on: true, t0: performance.now() / 1000, id: m.id, who: m.who || "Jemand", kind: m.kind, to: m.to || "" });
  const mine = wxPending && (m.by === "local" || (typeof MP !== "undefined" && m.by === MP.id));
  if (mine) { const i = S.inv.findIndex(x => x.uid === wxPending); if (i >= 0) S.inv.splice(i, 1); S.stats.totems = (S.stats.totems || 0) + 1; if (S.hold === wxPending) S.hold = null; wxPending = null; if (typeof renderBar === "function") { renderBar(); } save(); }
  try { Snd.play(m.kind === "sun" ? "totem_sun" : "totem_use", 1, .9); } catch (e) {}
}
/* Animation: leuchtendes Totem steigt auf, Ringe und Funken in der Farbe des Wetters, Titelband. Jeder Spieler sieht sie. */
function wxFxDraw(c, VW, VH, t) {
  if (!WXFX.on) return; const e = t - WXFX.t0, D = 4.2; if (e > D || e < 0) { if (e > D) WXFX.on = false; return; }
  const sun = WXFX.kind === "sun", col = sun ? (WXFX.to === "night" ? "#9fb4ff" : "#ffd45a") : (WX[WXFX.id] ? WX[WXFX.id].col : "#fff"), k = Math.min(1, e / .5), out = Math.min(1, (D - e) / .8), a = Math.min(k, out);
  const hs = (x, y, z) => { const v = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return v - Math.floor(v); };
  c.save(); c.globalCompositeOperation = "source-over"; c.globalAlpha = a * .4; c.fillStyle = col; c.fillRect(0, 0, VW, VH);
  // Lichtstrahlen und Ringe
  const cx = VW / 2, cy = VH * .42; c.globalCompositeOperation = "lighter"; c.globalAlpha = a * .5; c.translate(cx, cy); c.rotate(e * .5); c.fillStyle = col;
  for (let i = 0; i < 14; i++) { c.rotate(Math.PI / 7); c.beginPath(); c.moveTo(0, 0); c.lineTo(-18, -Math.max(VW, VH)); c.lineTo(18, -Math.max(VW, VH)); c.closePath(); c.globalAlpha = a * .12; c.fill(); }
  c.restore(); c.save();
  c.translate(cx, cy); c.globalCompositeOperation = "lighter"; c.strokeStyle = col; c.lineWidth = 5;
  for (let i = 0; i < 4; i++) { const q = ((e * .55 + i * .25) % 1), r = q * Math.max(VW, VH) * .7; c.globalAlpha = a * (1 - q) * .7; c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke(); }
  c.globalCompositeOperation = "source-over"; c.globalAlpha = a;
  // Totem: steigt auf, pulsiert
  const rise = Math.min(1, e / 1.1), sz = Math.min(VW, VH) * .36 * (.7 + .3 * rise) * (1 + .03 * Math.sin(e * 8)), sp = SP["tot_" + (sun ? "sun" : WXFX.id)];
  const g = c.createRadialGradient(0, 0, 4, 0, 0, sz * 1.1); g.addColorStop(0, "rgba(255,255,255,.85)"); g.addColorStop(.4, col); g.addColorStop(1, "rgba(255,255,255,0)"); c.globalAlpha = a * .55; c.fillStyle = g; c.beginPath(); c.arc(0, 0, sz * 1.1, 0, 7); c.fill(); c.globalAlpha = a;
  if (sp) drawTonling(c, sp, 0, (1 - rise) * VH * .12, sz, e * 1.5, null);
  // Funken
  c.globalCompositeOperation = "lighter"; c.fillStyle = "#fff"; for (let i = 0; i < 40; i++) { const ang = hs(i, 1, 3) * 6.28, r = (hs(i, 2, 3) * .6 + e * .35) * Math.min(VW, VH) * .6, pu = .5 + .5 * Math.sin(e * 9 + i); c.globalAlpha = a * pu * .8; c.beginPath(); c.arc(Math.cos(ang) * r, Math.sin(ang) * r, 1.5 + pu * 2.5, 0, 7); c.fill(); }
  c.restore();
  // Titelband
  c.save(); const bt = Math.min(1, Math.max(0, (e - .5) / .5)) * out; c.globalAlpha = bt; c.textAlign = "center"; c.lineJoin = "round"; c.lineWidth = 7; c.strokeStyle = "rgba(20,26,50,.9)"; c.fillStyle = "#fff7de";
  const title = sun ? "Die Sonne zieht weiter" : (WX[WXFX.id] ? WX[WXFX.id].name : ""), sub = sun ? (WXFX.to === "night" ? "Es wird Nacht." : "Ein neuer Tag beginnt.") : "Neues Wetter für alle Spieler";
  c.font = "52px 'Caveat Brush',cursive"; c.strokeText(title, VW / 2, VH * .72); c.fillText(title, VW / 2, VH * .72);
  c.font = "22px 'Patrick Hand',cursive"; c.lineWidth = 5; c.strokeText(WXFX.who + " hat ein Totem benutzt. " + sub, VW / 2, VH * .72 + 34); c.fillText(WXFX.who + " hat ein Totem benutzt. " + sub, VW / 2, VH * .72 + 34); c.restore();
}

/* Klangteppich des Wetters: nur draußen (Bereich 1, 3, 4), leiser während eines Fangs */
let wxSndT = 0;
function wxSound(dt) {
  wxSndT -= dt; if (wxSndT > 0) return; wxSndT = .5; if (!Snd.ready) return;
  const ar = typeof areaAt === "function" ? areaAt(Math.floor(G.px / TS), Math.floor(G.py / TS)) : 1, out = wxOutdoor(ar) && (typeof LAYER === "undefined" || LAYER === "main");
  Snd.wxAmbient(out ? wxNowId() : null, out ? (C.ph ? .5 : 1) : 0);
}
