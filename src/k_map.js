/* ===== Weltkarte: zeigt nur, was der Spieler schon gesehen hat ===== */
const MB = 2, MW = WW / MB, MH = WH / MB, MR = 7; // Nebel-Blöcke (2×2 Felder), Sichtradius in Feldern
let SEEN = null, seenDirty = false, seenT = 0, seenSave = 0;
function seenInit() { if (SEEN) return; SEEN = new Uint8Array(MW * MH); const s = S.seen || ""; for (let i = 0; i < SEEN.length && i < s.length; i++) SEEN[i] = s.charCodeAt(i) === 49 ? 1 : 0; }
function markSeen(dt) {
  if (!S.flags.gotFlute) return; seenInit(); seenT -= dt; if (seenT > 0) return; seenT = 0.3;
  const tx = G.px / TS, ty = G.py / TS;
  for (let y = Math.max(0, Math.floor((ty - MR) / MB)); y <= Math.min(MH - 1, Math.floor((ty + MR) / MB)); y++) for (let x = Math.max(0, Math.floor((tx - MR) / MB)); x <= Math.min(MW - 1, Math.floor((tx + MR) / MB)); x++) {
    if (Math.hypot(x * MB + 1 - tx, y * MB + 1 - ty) > MR) continue; if (!SEEN[y * MW + x]) { SEEN[y * MW + x] = 1; seenDirty = true; } }
  const zn = ZN[Math.floor(ty)] && ZN[Math.floor(ty)][Math.floor(tx)]; S.zs = S.zs || {};
  if (zn && !S.zs[zn] && T[Math.floor(ty)][Math.floor(tx)] !== 0) { S.zs[zn] = 1; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (ZN[y][x] === zn) { const i = (y / MB | 0) * MW + (x / MB | 0); if (!SEEN[i]) { SEEN[i] = 1; seenDirty = true; } } seenSave = 0; }
  seenSave -= 0.3; if (seenDirty && seenSave <= 0) { seenSave = 6; seenDirty = false; syncSeen(); save(); }
}
function syncSeen() { let s = ""; for (let i = 0; i < SEEN.length; i++) s += SEEN[i] ? "1" : "0"; S.seen = s; }
const isSeen = (tx, ty) => { seenInit(); return tx >= 0 && ty >= 0 && tx < WW && ty < WH && !!SEEN[(ty / MB | 0) * MW + (tx / MB | 0)]; };
const MAPK = 6; // Pixel pro Feld
const mapNpcKnown = id => { const n = NPCS[id]; if (!n || !isSeen(n.x, n.y)) return false; return !n.secret || !!S.flags["open_" + id]; };
function drawMap(cv) {
  seenInit(); const K = MAPK, W = WW * K, H = WH * K; cv.width = W; cv.height = H; const c = cv.getContext("2d");
  c.fillStyle = "#d9c796"; c.fillRect(0, 0, W, H);
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) {
    if (!isSeen(x, y)) { if (hs(x, y, 5) < .18) { c.fillStyle = "#d1bf8c"; c.fillRect(x * K, y * K, K, K); } continue; }
    const t = T[y][x], z = ZINFO[ZN[y][x] || "wiese"] || ZINFO.wiese; let col;
    if (t === 0 || t === 5) col = mixHex(z.col2, "#555e70", .6); else if (t === 3) col = "#6fb4dc"; else if (t === 4) col = mixHex(z.col, "#3f6f4a", .45); else if (t === 6) col = "#a8563f"; else if (t === 2) col = mixHex(z.col, "#e9dcae", .55); else col = z.col;
    c.fillStyle = col; c.fillRect(x * K, y * K, K, K);
  }
  // Bereichsgrenzen
  c.strokeStyle = "rgba(60,30,20,.75)"; c.lineWidth = 2; c.setLineDash([6, 4]); c.beginPath();
  for (let y = 0; y < WH - 1; y++) for (let x = 0; x < WW - 1; x++) { if (!isSeen(x, y)) continue; const a = areaAt(x, y);
    if (isSeen(x + 1, y) && areaAt(x + 1, y) !== a) { c.moveTo((x + 1) * K, y * K); c.lineTo((x + 1) * K, (y + 1) * K); }
    if (isSeen(x, y + 1) && areaAt(x, y + 1) !== a) { c.moveTo(x * K, (y + 1) * K); c.lineTo((x + 1) * K, (y + 1) * K); } }
  c.stroke(); c.setLineDash([]);
  // Zonennamen
  const acc = {}; for (let y = 0; y < WH; y += 2) for (let x = 0; x < WW; x += 2) { const z = ZN[y][x]; if (!z || !isSeen(x, y) || T[y][x] === 0) continue; const a = acc[z] || (acc[z] = { x: 0, y: 0, n: 0 }); a.x += x; a.y += y; a.n++; }
  c.textAlign = "center"; c.font = "bold 15px 'Patrick Hand',cursive"; c.lineJoin = "round"; c.lineWidth = 4;
  for (const z in acc) { const a = acc[z]; if (a.n < 6 || !ZINFO[z]) continue; c.strokeStyle = "rgba(250,244,226,.9)"; c.strokeText(ZINFO[z].n, a.x / a.n * K, a.y / a.n * K); c.fillStyle = INK; c.fillText(ZINFO[z].n, a.x / a.n * K, a.y / a.n * K); }
  // Questziele
  const act = (typeof QORDER !== "undefined" ? QORDER : []).filter(id => S.q[id] && S.q[id].st === "active" && !(S.flags.untr && S.flags.untr[id]));
  const goals = new Set(); act.forEach(id => { const q = QUESTS[id], nq = q && q.npc; if (nq && mapNpcKnown(nq)) goals.add(nq); });
  goals.forEach(id => { const n = NPCS[id], px = (n.x + .5) * K, py = (n.y + .5) * K; c.strokeStyle = "#e0a020"; c.lineWidth = 3; c.beginPath(); c.arc(px, py, 11, 0, 7); c.stroke(); c.strokeStyle = "rgba(255,240,170,.7)"; c.lineWidth = 1.5; c.beginPath(); c.arc(px, py, 15, 0, 7); c.stroke(); });
  // NPCs
  c.font = "bold 14px 'Patrick Hand',cursive";
  for (const id in NPCS) { if (!mapNpcKnown(id)) continue; const n = NPCS[id], px = (n.x + .5) * K, py = (n.y + .5) * K, mk = npcMark(id);
    c.fillStyle = n.col || "#888"; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(px, py, 4.5, 0, 7); c.fill(); c.stroke();
    if (mk) { c.lineWidth = 3.5; c.strokeStyle = "#fffbe8"; c.strokeText(mk, px, py - 8); c.fillStyle = mk === "?" ? "#2a8a4a" : "#d08a10"; c.fillText(mk, px, py - 8); } }
  // Notizmarker
  (S.pins || []).forEach(p => { const px = (p.x + .5) * K, py = (p.y + .5) * K; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(px, py); c.lineTo(px, py - 15); c.stroke(); c.fillStyle = "#d8453a"; c.beginPath(); c.moveTo(px, py - 15); c.lineTo(px + 11, py - 11); c.lineTo(px, py - 7); c.closePath(); c.fill(); c.stroke(); });
  // Mitspieler
  if (typeof MP !== "undefined") MP.others.forEach(o => { const px = o.x / TS * K, py = o.y / TS * K; c.fillStyle = "#4a9ad8"; c.strokeStyle = "#fff"; c.lineWidth = 2; c.beginPath(); c.arc(px, py, 5.5, 0, 7); c.fill(); c.stroke();
    c.font = "13px 'Patrick Hand',cursive"; c.lineWidth = 3.5; c.strokeStyle = "rgba(250,244,226,.95)"; c.strokeText(o.n || "", px, py - 9); c.fillStyle = INK; c.fillText(o.n || "", px, py - 9); });
  // Spieler
  { const px = G.px / TS * K, py = G.py / TS * K; c.fillStyle = "#e0453a"; c.strokeStyle = "#fff"; c.lineWidth = 2.5; c.beginPath(); c.arc(px, py, 7, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#fff"; c.beginPath(); c.arc(px, py, 2.2, 0, 7); c.fill(); }
  c.strokeStyle = INK; c.lineWidth = 4; c.strokeRect(2, 2, W - 4, H - 4);
}
function openMap() {
  winKind = "map"; markSeen(1);
  openWin("Karte", `<div style="text-align:center"><canvas id="mapCv" style="max-width:100%;max-height:calc(100vh - 250px);width:auto;height:auto;border-radius:10px;cursor:crosshair;touch-action:manipulation"></canvas></div>
  <p class="muted" style="margin:8px 0 0;font-size:17px;line-height:1.3"><b style="color:#e0453a">●</b> du &nbsp;<b style="color:#4a9ad8">●</b> Mitspieler &nbsp;<b style="color:#d08a10">!</b> Auftrag &nbsp;<b style="color:#2a8a4a">?</b> abgeben &nbsp;<b style="color:#e0a020">◯</b> Questziel &nbsp;<b style="color:#d8453a">⚑</b> Notiz: ins Bild klicken setzt oder entfernt eine Markierung. Ein Gebiet erscheint komplett, sobald du es betrittst.</p>`, () => {
    const cv = $("mapCv"); drawMap(cv);
    cv.onclick = e => { const r = cv.getBoundingClientRect(), tx = Math.floor((e.clientX - r.left) / r.width * WW), ty = Math.floor((e.clientY - r.top) / r.height * WH); S.pins = S.pins || [];
      const i = S.pins.findIndex(p => Math.abs(p.x - tx) <= 2 && Math.abs(p.y - ty) <= 3); if (i >= 0) S.pins.splice(i, 1); else { if (S.pins.length >= 12) S.pins.shift(); S.pins.push({ x: tx, y: ty }); } save(); drawMap(cv); Snd.play("klick", 1, .4); };
  });
}
