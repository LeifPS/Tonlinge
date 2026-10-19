/* ===== WELTBAUER: Weltkarte, Werkzeuge, Paletten ===== */
const W = {
  tool: "brush", layer: "GR", terr: 1, area: 1, zone: "", g: "wiese", objs: ["baum_eiche"], size: 1, round: false, dens: 100,
  s: 16, ox: 0, oy: 0, ov: { zonen: false, bereiche: false, npc: true, items: true, raster: true, tore: true }, clip: null, selR: null,
  gate: "GATE", wallNpc: "", stale: new Set(), cache: new Map(), flat: null, drag: null, hover: null, need: true, pasteOpts: { a: false, z: false }, hid: { OB: false, GR: false }
};
const TERR = [[0, "Fels / dichter Wald"], [1, "Boden"], [2, "Weg"], [3, "Wasser"], [4, "Hindernis (unsichtbar)"], [5, "Falsche Wand"]];
const AREA_COL = { 1: "#5fbf5f", 2: "#8a6cd0", 3: "#6ab0f0", 4: "#3ac0c8" };
const zoneCol = id => { let s = 0; for (const c of id) s = (s * 31 + c.charCodeAt(0)) >>> 0; return "hsl(" + (s % 360) + ",70%,55%)"; };
const idx = (x, y) => y * WW + x, inW = (x, y) => x >= 0 && y >= 0 && x < WW && y < WH;
function getCell(x, y) { const i = idx(x, y); return { t: T[y][x], a: AM[i], z: ZN[y][x], g: GR[i], o: OB[i] }; }
function putCell(x, y, c) { const i = idx(x, y); T[y][x] = c.t; AM[i] = c.a; ZN[y][x] = c.z; GR[i] = c.g; OB[i] = c.o; touchCell(x, y); }
function touchCell(x, y) {
  for (let gy = Math.floor((y - 3) / CH); gy <= Math.floor((y + 3) / CH); gy++) for (let gx = Math.floor((x - 3) / CH); gx <= Math.floor((x + 3) / CH); gx++) W.stale.add(gx + "," + gy);
  if (W.flat) { const fc = W.flat.getContext("2d"); fc.fillStyle = flatCol(x, y); fc.fillRect(x, y, 1, 1); } W.need = true;
}
function invalidateAll() { W.cache.clear(); W.stale.clear(); buildFlat(); W.need = true; }
function flatCol(x, y) { const i = idx(x, y); const o = OB[i] && TILE_REG[OB[i]]; let c = tcol(x, y); if (o) c = mixHex(c.startsWith("#") ? c : rgbToHex(c), o.solid ? "#1d2a22" : "#ffffff", o.solid ? .45 : .2); if (T[y][x] === 6) c = "#b4533c"; return c; }
function rgbToHex(c) { const m = /(\d+),\s*(\d+),\s*(\d+)/.exec(c); return m ? "#" + [1, 2, 3].map(k => (+m[k]).toString(16).padStart(2, "0")).join("") : "#888888"; }
function buildFlat() { const cv = W.flat || (W.flat = document.createElement("canvas")); cv.width = WW; cv.height = WH; const c = cv.getContext("2d"); for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) { c.fillStyle = flatCol(x, y); c.fillRect(x, y, 1, 1); } }
/* Zelle normalisieren (wie beim Laden): Objekte/Böden bestimmen, ob man dort laufen kann */
function normCell(c, prev) {
  const g = c.g && TILE_REG[c.g], o = c.o && TILE_REG[c.o];
  if (c.t === 0 || c.t === 5) { c.g = null; c.o = null; return c; }
  if (c.g && !g) c.g = null; if (c.o && !o) c.o = null;
  if (g && g.t3) c.t = 3; else if (c.t === 3 && g && !g.solid) c.t = 1;
  if (o) { if (o.solid && c.t !== 3) c.t = 4; else if (!o.solid && c.t === 4) c.t = 1; }
  else if (prev && prev.o && c.t === 4) { const po = TILE_REG[prev.o]; if (po && po.solid) c.t = 1; }
  return c;
}
/* ----- Pinselstriche mit Rückgängig ----- */
let stroke = null;
function strokeBegin() { stroke = new Map(); }
function strokeSet(x, y, patch) {
  if (!inW(x, y)) return; const i = idx(x, y), before = stroke.has(i) ? stroke.get(i)[0] : getCell(x, y), cur = getCell(x, y), n = Object.assign({}, cur, patch);
  if (patch.t != null && patch.t !== cur.t && (patch.t === 1 || patch.t === 2) && cur.t !== 1 && cur.t !== 2 && cur.t !== 4 && cur.t !== 3 && patch.z === undefined && !cur.z) { const nz = nearZone(x, y); if (nz) n.z = nz; }
  normCell(n, cur); if (n.t === cur.t && n.a === cur.a && n.z === cur.z && n.g === cur.g && n.o === cur.o) return;
  putCell(x, y, n); stroke.set(i, [before, getCell(x, y)]);
}
function nearZone(x, y) { for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [2, 0], [-2, 0], [0, 2], [0, -2]]) { const xx = x + dx, yy = y + dy; if (inW(xx, yy) && ZN[yy][xx]) return ZN[yy][xx]; } return null; }
function strokeEnd() {
  if (!stroke || !stroke.size) { stroke = null; return; } const s = stroke; stroke = null;
  const apply = k => () => { for (const [i, v] of s) putCell(i % WW, (i / WW) | 0, v[k]); };
  pushUndo({ undo: apply(0), redo: apply(1) });
}
function brushCells(x, y) { const n = W.size, a = Math.floor((n - 1) / 2), out = []; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const dx = i - a, dy = j - a; if (W.round && n > 2 && dx * dx + dy * dy > (n / 2) * (n / 2) - .3) continue; out.push([x + dx, y + dy]); } return out; }
const rnd = (x, y, k) => hs(x, y, k + 900);
function patchFor(x, y, erase) {
  const L = W.layer;
  if (erase) return L === "T" ? { t: 0 } : L === "GR" ? { g: null } : L === "OB" ? { o: null } : L === "ZN" ? { z: null } : {};
  if (L === "T") return { t: W.terr };
  if (L === "GR") { const g = W.gs && W.gs.length > 1 ? W.gs[Math.floor(rnd(x, y, 1) * W.gs.length)] : W.g; return { g }; }
  if (L === "OB") { if (W.dens < 100 && rnd(x, y, 2) * 100 >= W.dens) return null; const l = W.objs; if (!l.length) return null; return { o: l[Math.floor(rnd(x, y, 3) * l.length)] }; }
  if (L === "AM") return { a: W.area };
  if (L === "ZN") return { z: W.zone || null };
  return null;
}
function applyCells(cells, erase) { for (const [x, y] of cells) { const p = patchFor(x, y, erase); if (p) strokeSet(x, y, p); } }
function shapeCells(tool, a, b) {
  const x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), y0 = Math.min(a[1], b[1]), y1 = Math.max(a[1], b[1]), out = [];
  if (tool === "rect") { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) out.push([x, y]); }
  else if (tool === "outline") { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (x === x0 || x === x1 || y === y0 || y === y1) out.push([x, y]); }
  else if (tool === "ellipse") { const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2 + .5, ry = (y1 - y0) / 2 + .5; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) out.push([x, y]); }
  else if (tool === "line") { const n = Math.max(x1 - x0, y1 - y0) || 1; const seen = new Set(); for (let i = 0; i <= n * 2; i++) { const t = i / (n * 2), x = Math.round(a[0] + (b[0] - a[0]) * t), y = Math.round(a[1] + (b[1] - a[1]) * t); for (const c of brushCells(x, y)) { const k = c[0] + "," + c[1]; if (!seen.has(k)) { seen.add(k); out.push(c); } } } }
  return out;
}
function floodCells(x, y) {
  if (!inW(x, y)) return []; const L = W.layer, key = (xx, yy) => { const i = idx(xx, yy); return L === "T" ? T[yy][xx] : L === "GR" ? GR[i] : L === "OB" ? OB[i] : L === "AM" ? AM[i] : ZN[yy][xx]; }, k0 = key(x, y), seen = new Set([idx(x, y)]), q = [[x, y]], out = [];
  while (q.length && out.length < 30000) { const [cx, cy] = q.pop(); out.push([cx, cy]); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = cx + dx, yy = cy + dy; if (!inW(xx, yy)) continue; const i = idx(xx, yy); if (seen.has(i)) continue; if (key(xx, yy) !== k0) continue; seen.add(i); q.push([xx, yy]); } }
  return out;
}
/* ----- Dinge auf der Karte ----- */
const npcAt = (x, y) => Object.keys(NPCS).find(id => NPCS[id].x === x && NPCS[id].y === y);
const itemAt = (x, y) => Object.keys(ITEMS).find(id => ITEMS[id].x === x && ITEMS[id].y === y);
const houseAt = (x, y) => HOUSES.findIndex(h => x >= h.x && x < h.x + h.w && y >= h.y && y < h.y + h.h);
function moveThing(obj, x, y, extra) { const b = { x: obj.x, y: obj.y, area: obj.area }; const a = { x, y, area: AM[idx(x, y)] }; const set = v => { obj.x = v.x; obj.y = v.y; if ("area" in obj || extra) obj.area = v.area; W.need = true; }; pushUndo({ undo: () => set(b), redo: () => set(a) }); set(a); }
function addHouse(x0, y0, x1, y1) {
  const h = { x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0) + 1, h: Math.abs(y1 - y0) + 1, roof: ["#b4533c", "#c9923a", "#6a5aa6", "#5b9a78", "#a5524a"][HOUSES.length % 5] };
  if (h.w < 2 || h.h < 2) { toast("Ein Haus braucht mindestens 2×2 Kacheln.", true); return; }
  strokeBegin(); for (let y = h.y; y < h.y + h.h; y++) for (let x = h.x; x < h.x + h.w; x++) if (inW(x, y)) { const i = idx(x, y), cur = getCell(x, y); stroke.set(i, [cur, Object.assign({}, cur, { t: 6, g: null, o: null })]); putCell(x, y, Object.assign({}, cur, { t: 6, g: null, o: null })); }
  const s = stroke; stroke = null; HOUSES.push(h); ED.sel.house = HOUSES.length - 1;
  pushUndo({ undo: () => { HOUSES.splice(HOUSES.indexOf(h), 1); for (const [i, v] of s) putCell(i % WW, (i / WW) | 0, v[0]); }, redo: () => { HOUSES.push(h); for (const [i, v] of s) putCell(i % WW, (i / WW) | 0, v[1]); } });
}
function removeHouse(k) { const h = HOUSES[k]; if (!h) return; const s = []; for (let y = h.y; y < h.y + h.h; y++) for (let x = h.x; x < h.x + h.w; x++) if (inW(x, y) && T[y][x] === 6) s.push([x, y, getCell(x, y)]); const doIt = () => { HOUSES.splice(HOUSES.indexOf(h), 1); s.forEach(([x, y, c]) => putCell(x, y, Object.assign({}, c, { t: 1 }))); }; const un = () => { HOUSES.push(h); s.forEach(([x, y, c]) => putCell(x, y, c)); }; doIt(); pushUndo({ undo: un, redo: doIt }); ED.sel.house = null; }

/* ----- Zeichnen ----- */
function getChunkEd(gx, gy) {
  const k = gx + "," + gy; let c = W.cache.get(k); if (c && !W.stale.has(k)) return c; return c || null;
}
function paintBudget(ms, gxr, gyr) {
  const t0 = performance.now(), need = [];
  for (let gy = gyr[0]; gy <= gyr[1]; gy++) for (let gx = gxr[0]; gx <= gxr[1]; gx++) { const k = gx + "," + gy; if (!W.cache.has(k) || W.stale.has(k)) need.push([gx, gy, k, W.stale.has(k) ? 0 : 1]); }
  need.sort((a, b) => a[3] - b[3]);
  for (const [gx, gy, k] of need) { if (performance.now() - t0 > ms) { W.need = true; break; } try { W.cache.delete(k); W.cache.set(k, paintChunk(gx, gy)); } catch (e) { console.error(e); } W.stale.delete(k); }
  if (W.cache.size > 170) for (const k of W.cache.keys()) { if (W.cache.size <= 150) break; W.cache.delete(k); }
}
const stageEl = () => $q("#wcv");
function fit() { const cv = stageEl(); if (!cv) return; const r = cv.parentNode.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1); const w = Math.max(50, Math.round(r.width * d)), h = Math.max(50, Math.round(r.height * d)); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; W.need = true; } W.d = d; }
const toScreen = (x, y) => [(x - W.ox) * W.s, (y - W.oy) * W.s];
function toCell(px, py) { return [Math.floor(px / W.s + W.ox), Math.floor(py / W.s + W.oy)]; }
function drawStage() {
  const cv = stageEl(); if (!cv || !cv.isConnected) return; fit(); const c = cv.getContext("2d"), d = W.d || 1, vw = cv.width / d, vh = cv.height / d, s = W.s;
  c.setTransform(d, 0, 0, d, 0, 0); c.imageSmoothingEnabled = false; c.fillStyle = "#0e1220"; c.fillRect(0, 0, vw, vh);
  if (!W.flat) buildFlat();
  c.drawImage(W.flat, -W.ox * s, -W.oy * s, WW * s, WH * s);
  const detail = s >= 13;
  if (detail) {
    const gx0 = Math.max(0, Math.floor(W.ox / CH)), gx1 = Math.min(Math.ceil(WW / CH) - 1, Math.floor((W.ox + vw / s) / CH)), gy0 = Math.max(0, Math.floor(W.oy / CH)), gy1 = Math.min(Math.ceil(WH / CH) - 1, Math.floor((W.oy + vh / s) / CH));
    paintBudget(W.drag ? 6 : 14, [gx0, gx1], [gy0, gy1]); c.imageSmoothingEnabled = true;
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) { const ch = W.cache.get(gx + "," + gy); if (!ch) continue; c.drawImage(ch, (gx * CH - W.ox) * s, (gy * CH - W.oy) * s, CH * s, CH * s); }
  }
  if (detail) { c.save(); c.translate(-W.ox * s, -W.oy * s); c.scale(s / TS, s / TS); c.lineJoin = c.lineCap = "round"; HOUSES.forEach(hh => { try { drawHouse(c, hh, 0); } catch (e) {} }); c.restore(); }
  const cx0 = Math.max(0, Math.floor(W.ox)), cx1 = Math.min(WW - 1, Math.ceil(W.ox + vw / s)), cy0 = Math.max(0, Math.floor(W.oy)), cy1 = Math.min(WH - 1, Math.ceil(W.oy + vh / s));
  // Bereiche und Zonen
  if (W.ov.bereiche || W.ov.zonen) { for (let y = cy0; y <= cy1; y++) for (let x = cx0; x <= cx1; x++) { if (T[y][x] === 0 && !W.ovRock) continue; const i = idx(x, y); const [sx, sy] = toScreen(x, y);
    if (W.ov.bereiche) { c.globalAlpha = .28; c.fillStyle = AREA_COL[AM[i]] || "#fff"; c.fillRect(sx, sy, s, s); }
    if (W.ov.zonen && ZN[y][x]) { c.globalAlpha = W.layer === "ZN" ? .55 : .38; c.fillStyle = zoneCol(ZN[y][x]); c.fillRect(sx, sy, s, s); } } c.globalAlpha = 1;
    if (W.ov.zonen) { const cen = {}; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) { const z = ZN[y][x]; if (z && T[y][x] !== 0) { const o = cen[z] || (cen[z] = [0, 0, 0]); o[0] += x; o[1] += y; o[2]++; } } c.font = "bold 13px 'Patrick Hand',sans-serif"; c.textAlign = "center"; for (const z in cen) { const o = cen[z], [sx, sy] = toScreen(o[0] / o[2] + .5, o[1] / o[2] + .5); const nm = (ZINFO[z] && ZINFO[z].n) || z; c.lineWidth = 3; c.strokeStyle = "#000c"; c.strokeText(nm, sx, sy); c.fillStyle = "#fff"; c.fillText(nm, sx, sy); } }
  }
  // Raster
  if (W.ov.raster && s >= 22) { c.strokeStyle = "rgba(255,255,255,.14)"; c.lineWidth = 1; c.beginPath(); for (let x = cx0; x <= cx1 + 1; x++) { const sx = Math.round((x - W.ox) * s) + .5; c.moveTo(sx, 0); c.lineTo(sx, vh); } for (let y = cy0; y <= cy1 + 1; y++) { const sy = Math.round((y - W.oy) * s) + .5; c.moveTo(0, sy); c.lineTo(vw, sy); } c.stroke(); }
  // Weltgrenze
  c.strokeStyle = "#fff8"; c.lineWidth = 2; const [bx, by] = toScreen(0, 0); c.strokeRect(bx, by, WW * s, WH * s);
  // Häuser
  HOUSES.forEach((h, k) => { const [sx, sy] = toScreen(h.x, h.y); c.strokeStyle = ED.sel.house === k ? "#ffd23f" : (h.roof || "#b4533c"); c.lineWidth = ED.sel.house === k ? 3 : 2; c.strokeRect(sx + 1, sy + 1, h.w * s - 2, h.h * s - 2); });
  // Tore, Start, Geheimwände
  if (W.ov.tore) {
    for (const [nm, G0] of [["Tor 1→2", GATE], ["Tor 2→3", GATE3], ["Tor 3→4", GATE4]]) { const [sx, sy] = toScreen(G0.x, G0.y); c.fillStyle = "#ffd23f66"; c.fillRect(sx, sy, G0.w * s, s); c.strokeStyle = "#ffd23f"; c.lineWidth = 2; c.strokeRect(sx, sy, G0.w * s, s); if (s > 9) { c.fillStyle = "#fff"; c.font = "12px 'Patrick Hand',sans-serif"; c.textAlign = "left"; c.fillText(nm, sx + 3, sy - 3); } }
    { const [sx, sy] = toScreen(START.tx, START.ty); mark(c, sx + s / 2, sy + s / 2, s, "#5be08a", "▶"); }
    for (const id in FWALLS) { const p = FWALLS[id], [sx, sy] = toScreen(p[0], p[1]); c.strokeStyle = "#ff6fd8"; c.lineWidth = 2; c.setLineDash([4, 3]); c.strokeRect(sx + 2, sy + 2, s - 4, s - 4); c.setLineDash([]); }
  }
  if (W.ov.npc) for (const id in NPCS) { const n = NPCS[id]; if (n.x < cx0 - 2 || n.x > cx1 + 2 || n.y < cy0 - 2 || n.y > cy1 + 2) continue; const [sx, sy] = toScreen(n.x, n.y); if (s >= 22) { c.save(); c.translate(sx + s / 2, sy + s - 4 * s / TS); c.scale(s / TS, s / TS); try { drawPerson(c, 0, 0, n.col, n.hat, { look: NPC_LOOK[id] }, 0); } catch (e) {} c.restore(); if (ED.sel.npc === id) { c.strokeStyle = "#ffd23f"; c.lineWidth = 3; c.strokeRect(sx + 1, sy - s * .5, s - 2, s * 1.5 - 2); } c.font = "13px 'Patrick Hand',sans-serif"; c.textAlign = "center"; c.lineWidth = 3; c.strokeStyle = "#000c"; c.strokeText(n.n, sx + s / 2, sy - s * .6); c.fillStyle = "#fff"; c.fillText(n.n, sx + s / 2, sy - s * .6); continue; } mark(c, sx + s / 2, sy + s / 2, s, n.col || "#e39a3b", (n.n || id).charAt(0), ED.sel.npc === id, s > 18 ? n.n : ""); }
  if (W.ov.items) for (const id in ITEMS) { const n = ITEMS[id]; const [sx, sy] = toScreen(n.x, n.y); mark(c, sx + s / 2, sy + s / 2, s * .8, "#ffe27a", "★", ED.sel.item === id, s > 18 ? n.n : ""); }
  // Vorschau der Werkzeuge
  const dr = W.drag;
  if (dr && dr.kind === "shape") { const cells = dr.cells; c.fillStyle = "rgba(255,210,63,.35)"; c.strokeStyle = "#ffd23f"; c.lineWidth = 1; for (const [x, y] of cells) { const [sx, sy] = toScreen(x, y); c.fillRect(sx, sy, s, s); } }
  if (dr && dr.kind === "sel" || W.selR) { const r = dr && dr.kind === "sel" ? dr.r : W.selR; if (r) { const [sx, sy] = toScreen(r.x0, r.y0); c.strokeStyle = "#7fd0ff"; c.fillStyle = "rgba(127,208,255,.18)"; c.lineWidth = 2; c.setLineDash([6, 4]); c.fillRect(sx, sy, (r.x1 - r.x0 + 1) * s, (r.y1 - r.y0 + 1) * s); c.strokeRect(sx, sy, (r.x1 - r.x0 + 1) * s, (r.y1 - r.y0 + 1) * s); c.setLineDash([]); } }
  if (W.hover && !W.pan) {
    const [hx, hy] = W.hover; c.lineWidth = 2; c.strokeStyle = "#fff";
    if (W.tool === "paste" && W.clip) { for (let j = 0; j < W.clip.h; j++) for (let i = 0; i < W.clip.w; i++) { const cl = W.clip.cells[j * W.clip.w + i]; if (!cl) continue; const [sx, sy] = toScreen(hx + i, hy + j); c.fillStyle = "rgba(255,255,255,.28)"; c.fillRect(sx, sy, s, s); } }
    else if (["brush", "eraser", "line"].includes(W.tool) && W.layer !== "ent") { for (const [x, y] of brushCells(hx, hy)) { const [sx, sy] = toScreen(x, y); c.strokeRect(sx + 1, sy + 1, s - 2, s - 2); } }
    else { const [sx, sy] = toScreen(hx, hy); c.strokeRect(sx + 1, sy + 1, s - 2, s - 2); }
  }
  // Minikarte
  drawMini();
  const hud = $q("#hud"); if (hud) hud.textContent = W.hover ? "x " + W.hover[0] + ", y " + W.hover[1] + (inW(W.hover[0], W.hover[1]) ? " · Zone: " + (ZN[W.hover[1]][W.hover[0]] ? ((ZINFO[ZN[W.hover[1]][W.hover[0]]] || {}).n || ZN[W.hover[1]][W.hover[0]]) : "keine") + " · Bereich " + AM[idx(W.hover[0], W.hover[1])] : "") + " · " + Math.round(W.s / 32 * 100) + " %" : Math.round(W.s / 32 * 100) + " %";
}
function mark(c, x, y, s, col, ch, sel, label) {
  const r = Math.max(5, s * .38); c.fillStyle = col; c.strokeStyle = sel ? "#ffd23f" : "#1a1d2e"; c.lineWidth = sel ? 3 : 2; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke();
  if (r > 7) { c.fillStyle = "#111"; c.font = "bold " + Math.round(r * 1.1) + "px 'Patrick Hand',sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(ch, x, y + 1); c.textBaseline = "alphabetic"; }
  if (label) { c.font = "13px 'Patrick Hand',sans-serif"; c.textAlign = "center"; c.lineWidth = 3; c.strokeStyle = "#000c"; c.strokeText(label, x, y - r - 4); c.fillStyle = "#fff"; c.fillText(label, x, y - r - 4); }
}
function drawMini() {
  const m = $q("#mini"); if (!m) return; const c = m.getContext("2d"); c.imageSmoothingEnabled = false; c.clearRect(0, 0, m.width, m.height); c.drawImage(W.flat, 0, 0, m.width, m.height);
  const cv = stageEl(), d = W.d || 1, vw = cv.width / d, vh = cv.height / d, k = m.width / WW; c.strokeStyle = "#fff"; c.lineWidth = 1.5; c.strokeRect(W.ox * k, W.oy * k, vw / W.s * k, vh / W.s * k);
}
(function frame() { if (W.need && $q("#wcv")) { W.need = false; try { drawStage(); } catch (e) { console.error(e); } } requestAnimationFrame(frame); })();
function centerOn(x, y) { const cv = stageEl(), d = W.d || 1; W.ox = x + .5 - cv.width / d / W.s / 2; W.oy = y + .5 - cv.height / d / W.s / 2; W.need = true; }
function zoomAt(px, py, f) { const ns = Math.max(3, Math.min(64, W.s * f)); const wx = px / W.s + W.ox, wy = py / W.s + W.oy; W.s = ns; W.ox = wx - px / ns; W.oy = wy - py / ns; W.need = true; }
function fitAll() { const cv = stageEl(), d = W.d || 1; W.s = Math.min(cv.width / d / WW, cv.height / d / WH); W.ox = 0; W.oy = 0; W.need = true; }

/* ----- Eingaben ----- */
const TOOLS = [["brush", "Pinsel", "B"], ["rect", "Fläche", "R"], ["outline", "Rahmen", "O"], ["line", "Linie", "L"], ["ellipse", "Ellipse", "E"], ["fill", "Füllen", "F"], ["eraser", "Radierer", "X"], ["picker", "Pipette", "I"], ["select", "Auswahl", "S"], ["npc", "NPC", "N"], ["item", "Fundstück", "M"], ["house", "Haus", "H"], ["start", "Start", "T"], ["gate", "Tor", "G"], ["wall", "Geheimwand", "W"], ["pan", "Hand", "V"]];
const LAYERS = [["T", "Gelände"], ["GR", "Boden"], ["OB", "Objekte"], ["AM", "Bereich"], ["ZN", "Zone"]];
function setLayerAuto(l) { W.layer = l; if (l === "ZN") W.ov.zonen = true; if (l === "AM") W.ov.bereiche = true; W.need = true; renderSide(); }
function setTool(t) { W.tool = t; W.drag = null; if (t !== "select" && t !== "paste") { } renderSide(); W.need = true; }
function evCell(e) { const r = stageEl().getBoundingClientRect(); const px = e.clientX - r.left, py = e.clientY - r.top; return { px, py, cell: toCell(px, py) }; }
const pointers = new Map(); let pinch = null, spaceDown = false;
function wInit() {
  const cv = stageEl(); if (!cv || cv.__init) return; cv.__init = true;
  cv.addEventListener("pointerdown", e => {
    try { cv.setPointerCapture(e.pointerId); } catch (x) { } pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) { W.drag = null; if (stroke) strokeEnd(); const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }; return; }
    const { px, py, cell } = evCell(e), [x, y] = cell;
    if (e.button === 1 || e.button === 2 || spaceDown || W.tool === "pan") { W.pan = { px, py, ox: W.ox, oy: W.oy }; cv.style.cursor = "grabbing"; return; }
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const T0 = W.tool, erase = T0 === "eraser" || (e.altKey && ["brush", "rect", "outline", "line", "ellipse"].includes(T0));
    if (T0 === "brush" || T0 === "eraser") { strokeBegin(); applyCells(brushCells(x, y), erase); W.drag = { kind: "brush", last: [x, y], erase }; }
    else if (["rect", "outline", "line", "ellipse"].includes(T0)) W.drag = { kind: "shape", a: [x, y], cells: shapeCells(T0, [x, y], [x, y]), erase };
    else if (T0 === "fill") { strokeBegin(); const erase2 = e.altKey; applyCells(floodCells(x, y), erase2); strokeEnd(); }
    else if (T0 === "picker") pick(x, y);
    else if (T0 === "select") W.drag = { kind: "sel", a: [x, y], r: { x0: x, y0: y, x1: x, y1: y } };
    else if (T0 === "paste") { if (W.clip) doPaste(x, y); }
    else if (T0 === "npc") { const id = npcAt(x, y); if (id) { ED.sel.npc = id; W.drag = { kind: "mvnpc", id, from: [NPCS[id].x, NPCS[id].y] }; renderSide(); } else if (ED.sel.npc && NPCS[ED.sel.npc] && inW(x, y) && T[y][x] !== 0) { moveThing(NPCS[ED.sel.npc], x, y, 1); renderSide(); } }
    else if (T0 === "item") { const id = itemAt(x, y); if (id) { ED.sel.item = id; W.drag = { kind: "mvitem", id }; renderSide(); } else if (ED.sel.item && ITEMS[ED.sel.item] && inW(x, y)) { moveThing(ITEMS[ED.sel.item], x, y, 0); renderSide(); } }
    else if (T0 === "house") { const k = houseAt(x, y); if (k >= 0) { ED.sel.house = k; renderSide(); W.need = true; } else W.drag = { kind: "shape", a: [x, y], cells: [[x, y]], house: true }; }
    else if (T0 === "start") { const b = { tx: START.tx, ty: START.ty }; const a = { tx: x, ty: y }; const set = v => { START.tx = v.tx; START.ty = v.ty; W.need = true; }; pushUndo({ undo: () => set(b), redo: () => set(a) }); set(a); renderSide(); }
    else if (T0 === "gate") { const g0 = { GATE, GATE3, GATE4 }[W.gate], b = { x: g0.x, y: g0.y }, a = { x, y }; const set = v => { g0.x = v.x; g0.y = v.y; W.need = true; }; pushUndo({ undo: () => set(b), redo: () => set(a) }); set(a); renderSide(); }
    else if (T0 === "wall") { if (!W.wallNpc) { toast("Wähle rechts zuerst, zu welchem NPC die Geheimwand gehört.", true); return; } const had = FWALLS[W.wallNpc] && FWALLS[W.wallNpc].slice(), a = [x, y]; const set = v => { if (v) FWALLS[W.wallNpc] = v.slice(); else delete FWALLS[W.wallNpc]; W.need = true; }; pushUndo({ undo: () => set(had), redo: () => set(a) }); set(a); }
    W.need = true;
  });
  cv.addEventListener("pointermove", e => {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinch) { const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y), r = cv.getBoundingClientRect(); const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2; W.ox -= (cx - pinch.cx) / W.s; W.oy -= (cy - pinch.cy) / W.s; zoomAt(cx - r.left, cy - r.top, d / pinch.d); pinch.d = d; pinch.cx = cx; pinch.cy = cy; return; }
    const { px, py, cell } = evCell(e), [x, y] = cell; W.hover = inW(x, y) ? cell : null; W.need = true; updateInspect();
    if (W.pan) { W.ox = W.pan.ox - (px - W.pan.px) / W.s; W.oy = W.pan.oy - (py - W.pan.py) / W.s; return; }
    const dr = W.drag; if (!dr) return;
    if (dr.kind === "brush") { const [lx, ly] = dr.last; if (lx !== x || ly !== y) { const n = Math.max(Math.abs(x - lx), Math.abs(y - ly)); for (let i = 1; i <= n; i++) applyCells(brushCells(Math.round(lx + (x - lx) * i / n), Math.round(ly + (y - ly) * i / n)), dr.erase); dr.last = [x, y]; } }
    else if (dr.kind === "shape") { dr.cells = dr.house ? shapeCells("rect", dr.a, [x, y]) : shapeCells(W.tool, dr.a, [x, y]); }
    else if (dr.kind === "sel") { dr.r = { x0: Math.min(dr.a[0], x), y0: Math.min(dr.a[1], y), x1: Math.max(dr.a[0], x), y1: Math.max(dr.a[1], y) }; }
    else if (dr.kind === "mvnpc") { const n = NPCS[dr.id]; if (inW(x, y) && T[y][x] !== 0) { n.x = x; n.y = y; n.area = AM[idx(x, y)]; } }
    else if (dr.kind === "mvitem") { const n = ITEMS[dr.id]; if (inW(x, y)) { n.x = x; n.y = y; } }
  });
  const up = e => {
    pointers.delete(e.pointerId); if (pointers.size < 2) pinch = null;
    if (W.pan) { W.pan = null; cv.style.cursor = ""; return; }
    const dr = W.drag; W.drag = null; if (!dr) return;
    if (dr.kind === "brush") strokeEnd();
    else if (dr.kind === "shape") {
      if (dr.house) { const c0 = dr.a, last = dr.cells; const xs = last.map(c => c[0]), ys = last.map(c => c[1]); addHouse(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)); renderSide(); }
      else { strokeBegin(); applyCells(dr.cells, dr.erase); strokeEnd(); }
    }
    else if (dr.kind === "sel") { W.selR = dr.r; renderSide(); }
    else if (dr.kind === "mvnpc") { const n = NPCS[dr.id], b = { x: dr.from[0], y: dr.from[1], area: n.area }, a = { x: n.x, y: n.y, area: n.area }; if (a.x !== b.x || a.y !== b.y) { const set = v => { n.x = v.x; n.y = v.y; n.area = AM[idx(v.x, v.y)]; W.need = true; }; pushUndo({ undo: () => set(b), redo: () => set(a) }); } renderSide(); }
    else if (dr.kind === "mvitem") { touch(); renderSide(); }
    W.need = true;
  };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  cv.addEventListener("pointerleave", () => { W.hover = null; W.need = true; });
  cv.addEventListener("contextmenu", e => e.preventDefault());
  cv.addEventListener("wheel", e => { e.preventDefault(); const r = cv.getBoundingClientRect(); if (e.ctrlKey || !e.shiftKey && Math.abs(e.deltaY) >= 1) zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.15 : 1 / 1.15); }, { passive: false });
  const m = $q("#mini"); const jump = e => { const r = m.getBoundingClientRect(); centerOn((e.clientX - r.left) / r.width * WW, (e.clientY - r.top) / r.height * WH); }; let md = false; m.onpointerdown = e => { md = true; m.setPointerCapture(e.pointerId); jump(e); }; m.onpointermove = e => { if (md) jump(e); }; m.onpointerup = () => { md = false; };
  new ResizeObserver(() => { W.need = true; }).observe(cv.parentNode);
}
window.addEventListener("keydown", e => {
  if (ED.tab !== "welt") return; const tg = e.target; if (tg && (tg.tagName === "INPUT" || tg.tagName === "TEXTAREA" || tg.tagName === "SELECT")) return; if (!$q("#modal").hidden) return;
  const k = e.key.toLowerCase();
  if (e.key === " ") { spaceDown = true; e.preventDefault(); return; }
  if ((e.ctrlKey || e.metaKey) && k === "z") { e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); return; }
  if ((e.ctrlKey || e.metaKey) && k === "y") { e.preventDefault(); doRedo(); return; }
  if ((e.ctrlKey || e.metaKey) && k === "c") { e.preventDefault(); doCopy(false); return; }
  if ((e.ctrlKey || e.metaKey) && k === "x") { e.preventDefault(); doCopy(true); return; }
  if ((e.ctrlKey || e.metaKey) && k === "v") { e.preventDefault(); if (W.clip) setTool("paste"); return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === "[") { W.size = Math.max(1, W.size - 1); renderSide(); return; } if (e.key === "]") { W.size = Math.min(15, W.size + 1); renderSide(); return; }
  if (e.key === "Escape") { W.selR = null; if (W.tool === "paste") setTool("select"); W.need = true; return; }
  if (e.key === "Delete" && W.selR) { doCopy(true); return; }
  const t = TOOLS.find(x => x[2].toLowerCase() === k); if (t) { setTool(t[0]); return; }
  const nl = { 1: "T", 2: "GR", 3: "OB", 4: "AM", 5: "ZN" }[k]; if (nl) { setLayerAuto(nl); }
  const mv = { arrowleft: [-4, 0], arrowright: [4, 0], arrowup: [0, -4], arrowdown: [0, 4] }[k]; if (mv) { W.ox += mv[0]; W.oy += mv[1]; W.need = true; e.preventDefault(); }
});
window.addEventListener("keyup", e => { if (e.key === " ") spaceDown = false; });
function pick(x, y) {
  if (!inW(x, y)) return; const c = getCell(x, y);
  if (W.layer === "T") W.terr = c.t; else if (W.layer === "GR") { if (c.g) W.g = c.g, W.gs = null; else toast("Hier ist kein besonderer Boden."); } else if (W.layer === "OB") { if (c.o) W.objs = [c.o]; else toast("Hier steht kein Objekt."); } else if (W.layer === "AM") W.area = c.a; else W.zone = c.z || "";
  setTool("brush");
}
/* Auswahl: Kopieren, Einfügen, Spiegeln */
function doCopy(cut) {
  const r = W.selR; if (!r) { toast("Ziehe zuerst mit dem Auswahl-Werkzeug einen Rahmen."); return; }
  const w = r.x1 - r.x0 + 1, h = r.y1 - r.y0 + 1, cells = []; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) cells.push(getCell(r.x0 + i, r.y0 + j));
  W.clip = { w, h, cells }; if (cut) { strokeBegin(); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) strokeSet(r.x0 + i, r.y0 + j, { t: 0, g: null, o: null }); strokeEnd(); } toast((cut ? "Ausgeschnitten: " : "Kopiert: ") + w + "×" + h); renderSide();
}
function doPaste(x, y) {
  const cl = W.clip; strokeBegin(); for (let j = 0; j < cl.h; j++) for (let i = 0; i < cl.w; i++) { const c = cl.cells[j * cl.w + i], xx = x + i, yy = y + j; if (!c || !inW(xx, yy)) continue; const p = { t: c.t, g: c.g, o: c.o }; if (W.pasteOpts.a) p.a = c.a; if (W.pasteOpts.z) p.z = c.z; strokeSet(xx, yy, p); } strokeEnd();
}
function flipClip(dir) { const cl = W.clip; if (!cl) return; const o = new Array(cl.cells.length); for (let j = 0; j < cl.h; j++) for (let i = 0; i < cl.w; i++) o[(dir === "h" ? j * cl.w + (cl.w - 1 - i) : (cl.h - 1 - j) * cl.w + i)] = cl.cells[j * cl.w + i]; cl.cells = o; W.need = true; }
function rotClip() { const cl = W.clip; if (!cl) return; const o = new Array(cl.cells.length); for (let j = 0; j < cl.h; j++) for (let i = 0; i < cl.w; i++) o[i * cl.h + (cl.h - 1 - j)] = cl.cells[j * cl.w + i]; W.clip = { w: cl.h, h: cl.w, cells: o }; W.need = true; }

/* ----- Paletten ----- */
const palCache = new Map();
function palIcon(kind, id) {
  const key = kind + id + (TILE_REG[id] && TILE_REG[id].src ? JSON.stringify(TILE_REG[id].src).length : ""); if (palCache.has(key)) return palCache.get(key);
  const def = TILE_REG[id], cv = document.createElement("canvas"); cv.width = cv.height = 56; const c = cv.getContext("2d"); c.lineJoin = c.lineCap = "round";
  try { if (kind === "ground") { c.scale(56 / 64, 56 / 64); for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { c.fillStyle = groundColor(def, 40 + i, 40 + j); c.fillRect(i * 32, j * 32, 33, 33); groundTex(c, def, i * 32, j * 32, 40 + i, 40 + j); } } else { c.fillStyle = "#9fd480"; c.fillRect(0, 0, 56, 56); const k = 56 / 38; c.scale(k, k); c.translate(3, 9); drawObject(c, def, 0, 0, 40, 40); } } catch (e) { c.fillStyle = "#c00"; c.fillRect(0, 0, 56, 56); }
  palCache.set(key, cv); return cv;
}
function palBtn(kind, id, selected, onclick) { const def = TILE_REG[id]; const b = h("button", { title: def.n + (def.solid ? " (blockiert)" : ""), "aria-current": String(selected), onclick }, (() => { const cv = palIcon(kind, id); const c2 = document.createElement("canvas"); c2.width = c2.height = 56; c2.getContext("2d").drawImage(cv, 0, 0); return c2; })(), h("span", null, def.n)); return b; }
let palFilter = "";
function renderSide() {
  const L = $q("#wleft"); if (!L) return; L.innerHTML = "";
  L.append(h("div", { class: "tools" }, TOOLS.map(t => h("button", { class: "btn" + (W.tool === t[0] ? " on" : ""), title: t[1] + " (" + t[2] + ")", onclick: () => setTool(t[0]) }, t[1]))));
  const shapeTool = ["brush", "rect", "outline", "line", "ellipse", "fill", "eraser", "picker"].includes(W.tool);
  if (shapeTool) {
    L.append(h("div", { class: "ph" }, "Ebene"), h("div", { class: "tabs" }, LAYERS.map(l => h("button", { class: "btn sm" + (W.layer === l[0] ? " on" : ""), onclick: () => { setLayerAuto(l[0]); } }, l[1]))));
    if (W.layer === "T") L.append(h("div", { class: "col" }, TERR.map(t => h("button", { class: "btn" + (W.terr === t[0] ? " on" : ""), style: { width: "100%", margin: "2px 0", textAlign: "left" }, onclick: () => { W.terr = t[0]; renderSide(); } }, t[1]))), h("p", { class: "muted" }, "Fels macht die Wand zu. Boden und Weg sind begehbar. Wasser trägt nicht."));
    else if (W.layer === "GR" || W.layer === "OB") {
      const kind = W.layer === "GR" ? "ground" : "obj", sel = W.layer === "GR" ? (W.gs && W.gs.length ? W.gs : [W.g]) : W.objs;
      const q = h("input", { type: "text", placeholder: "Suchen …", value: palFilter, style: { width: "100%" }, oninput: () => { palFilter = q.value.toLowerCase(); fillPal(); } });
      const box = h("div"); L.append(q, h("label", { class: "row", style: { gap: "6px", margin: "2px 0" } }, h("input", { type: "checkbox", checked: !!W.multi, onchange: e => { W.multi = e.target.checked; } }), "Mehrfachauswahl (zum Mischen)"), h("p", { class: "muted", style: { margin: "2px 0" } }, "Mehrfachauswahl (Strg/Umschalt oder Schalter): mehrere Böden bzw. Objekte werden zufällig gemischt."), box);
      const fillPal = () => { box.innerHTML = ""; const all = Object.values(TILE_REG).filter(d => d.kind === kind && (!palFilter || (d.n + d.id + d.cat).toLowerCase().includes(palFilter))); const cats = [...new Set(all.map(d => d.cat))]; cats.forEach(cat => { box.append(h("div", { class: "ph" }, cat)); box.append(h("div", { class: "pal" }, all.filter(d => d.cat === cat).map(d => palBtn(kind, d.id, sel.includes(d.id), e => { const multi = e.ctrlKey || e.shiftKey || e.metaKey || W.multi; if (W.layer === "GR") { if (multi) { const l = W.gs && W.gs.length ? W.gs.slice() : [W.g]; const i = l.indexOf(d.id); if (i >= 0) l.splice(i, 1); else l.push(d.id); W.gs = l.length ? l : null; W.g = l[0] || d.id; } else { W.g = d.id; W.gs = null; } } else { if (multi) { const i = W.objs.indexOf(d.id); if (i >= 0 && W.objs.length > 1) W.objs.splice(i, 1); else if (i < 0) W.objs.push(d.id); } else W.objs = [d.id]; } renderSide(); })))); }); };
      fillPal();
    }
    else if (W.layer === "AM") L.append(h("div", null, areaOptions().map(([k, n]) => h("button", { class: "btn" + (W.area === k ? " on" : ""), style: { width: "100%", margin: "2px 0", textAlign: "left" }, onclick: () => { W.area = k; renderSide(); } }, h("span", { class: "sw", style: { background: AREA_COL[k] || "#999" } }), " " + n))), h("p", { class: "muted" }, "Der Bereich entscheidet über Hintergrund, Musik, Erfahrungs-Faktoren und welche Tonlinge dort leben."));
    else L.append(h("div", { class: "card", style: { padding: "6px 8px", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" } }, h("span", { class: "sw", style: { background: W.zone ? zoneCol(W.zone) : "transparent", width: "18px", height: "18px", border: "1px solid var(--ink)" } }), h("b", null, "Du malst: " + (W.zone ? ((ZINFO[W.zone] || {}).n || W.zone) : "keine Zone (löscht)"))), h("div", null, [["", "(keine Zone)"], ...zoneOptions().map(([k, n]) => [k, n])].map(([k, n]) => h("button", { class: "btn" + (W.zone === k ? " on" : ""), style: { width: "100%", margin: "2px 0", textAlign: "left" }, onclick: () => { W.zone = k; renderSide(); } }, h("span", { class: "sw", style: { background: k ? zoneCol(k) : "transparent" } }), " " + n))), h("p", { class: "muted" }, "Die Zone bestimmt, welche Tonlinge dort erscheinen. Zonen legst du unter „Bereiche & Zonen“ an."));
  }
  else if (W.tool === "npc") L.append(h("p", { class: "muted" }, "Klicke einen NPC an, dann klicke auf eine freie Kachel, um ihn dorthin zu stellen. Ziehen geht auch."), h("button", { class: "btn pri", onclick: newNpcHere }, "+ Neuer NPC in der Bildmitte"));
  else if (W.tool === "item") L.append(h("p", { class: "muted" }, "Klicke ein Fundstück an, dann auf eine Kachel."), h("button", { class: "btn pri", onclick: newItemHere }, "+ Neues Fundstück"));
  else if (W.tool === "house") L.append(h("p", { class: "muted" }, "Ziehe eine Fläche auf (mindestens 2×2). Ein Klick auf ein Haus wählt es aus."));
  else if (W.tool === "gate") L.append(h("p", { class: "muted" }, "Wähle das Tor, dann klicke auf die linke Kachel der Torzeile."), h("div", { class: "col" }, [["GATE", "Tor 1→2"], ["GATE3", "Tor 2→3"], ["GATE4", "Tor 3→4"]].map(([k, n]) => h("button", { class: "btn" + (W.gate === k ? " on" : ""), style: { width: "100%", margin: "2px 0" }, onclick: () => { W.gate = k; renderSide(); } }, n))));
  else if (W.tool === "wall") { L.append(h("p", { class: "muted" }, "Eine Geheimwand öffnet sich, wenn der NPC (Quest „opens“) freigeschaltet wird. Wähle den NPC, dann die Kachel."), h("select", { onchange: e => { W.wallNpc = e.target.value; } }, h("option", { value: "" }, "NPC wählen …"), Object.keys(NPCS).map(id => h("option", { value: id, selected: W.wallNpc === id }, NPCS[id].n + " (" + id + ")")))); }
  else if (W.tool === "start") L.append(h("p", { class: "muted" }, "Klicke dorthin, wo die Spielerin beginnt."));
  else if (W.tool === "select" || W.tool === "paste") selectPanel(L);
  else if (W.tool === "pan") L.append(h("p", { class: "muted" }, "Ziehen verschiebt die Karte. Mit dem Mausrad zoomst du. Leertaste halten geht immer."));
  renderRight();
}
function selectPanel(L) {
  L.append(h("p", { class: "muted" }, "Ziehe einen Rahmen. Dann kopieren, ausschneiden oder als Stempel merken."), h("div", { class: "row" },
    h("button", { class: "btn sm", onclick: () => doCopy(false) }, "Kopieren"), h("button", { class: "btn sm", onclick: () => doCopy(true) }, "Ausschneiden"), h("button", { class: "btn sm", disabled: !W.clip, onclick: () => setTool("paste") }, "Einfügen")),
    h("div", { class: "row", style: { marginTop: "4px" } }, h("button", { class: "btn sm", disabled: !W.clip, onclick: () => flipClip("h") }, "↔ Spiegeln"), h("button", { class: "btn sm", disabled: !W.clip, onclick: () => flipClip("v") }, "↕ Spiegeln"), h("button", { class: "btn sm", disabled: !W.clip, onclick: rotClip }, "⟳ Drehen")),
    chk(W.pasteOpts, "a", "Bereich mitkopieren"), chk(W.pasteOpts, "z", "Zone mitkopieren"),
    h("button", { class: "btn sm", style: { marginTop: "6px" }, disabled: !W.clip, onclick: async () => { const n = await askText("Stempel speichern", "Name des Stempels", "Stempel " + (ED.assets.stamps.length + 1)); if (!n) return; ED.assets.stamps.push({ name: n, w: W.clip.w, h: W.clip.h, cells: W.clip.cells.map(c => [c.t, c.g, c.o, c.z]) }); touch(); renderSide(); } }, "Als Stempel merken"));
  if (ED.assets.stamps.length) { L.append(h("div", { class: "ph" }, "Stempel")); ED.assets.stamps.forEach((s, i) => L.append(h("div", { class: "row" }, h("button", { class: "btn sm", onclick: () => { W.clip = { w: s.w, h: s.h, cells: s.cells.map(a => ({ t: a[0], g: a[1], o: a[2], z: a[3], a: 1 })) }; setTool("paste"); } }, s.name + " (" + s.w + "×" + s.h + ")"), h("button", { class: "btn sm warn", onclick: () => { ED.assets.stamps.splice(i, 1); touch(); renderSide(); } }, "×")))); }
}
async function newNpcHere() {
  const name = await askText("Neuer NPC", "Name", "Neuer NPC"); if (!name) return; const id = uid(slug(name) || "npc", i => NPCS[i]); const cv = stageEl(), d = W.d || 1, x = Math.round(W.ox + cv.width / d / W.s / 2), y = Math.round(W.oy + cv.height / d / W.s / 2);
  NPCS[id] = { n: name, area: AM[idx(x, y)], x, y, col: "#e39a3b", hat: "#6b3a2c", hi: "Hallo!" }; ED.sel.npc = id; ED.sel.npcs = id; touch(); W.need = true; renderSide();
}
async function newItemHere() {
  const name = await askText("Neues Fundstück", "Name", "Neues Fundstück"); if (!name) return; const id = uid(slug(name) || "fund", i => ITEMS[i]); const cv = stageEl(), d = W.d || 1;
  ITEMS[id] = { id, n: name, x: Math.round(W.ox + cv.width / d / W.s / 2), y: Math.round(W.oy + cv.height / d / W.s / 2), kind: "shard" }; ED.sel.item = id; touch(); W.need = true; renderSide();
}
/* ----- Rechte Leiste: Ansicht, Ebenen, Prüfung der Kachel, Auswahl ----- */
function renderRight() {
  const R = $q("#wright"); if (!R) return; R.innerHTML = "";
  R.append(h("div", { class: "ph" }, "Pinsel"), fld("Größe " + W.size, (() => { const e = h("input", { type: "range", min: 1, max: 15, value: W.size }); e.oninput = () => { W.size = +e.value; e.parentNode.firstChild.textContent = "Größe " + W.size; W.need = true; }; return e; })()), chk(W, "round", "rund"),
    W.layer === "OB" ? fld("Dichte " + W.dens + " %", (() => { const e = h("input", { type: "range", min: 5, max: 100, step: 5, value: W.dens }); e.oninput = () => { W.dens = +e.value; e.parentNode.firstChild.textContent = "Dichte " + W.dens + " %"; }; return e; })(), "unter 100 verstreut die Objekte") : h("span"));
  R.append(h("div", { class: "ph" }, "Sicht"));
  [["zonen", "Zonen zeigen"], ["bereiche", "Bereiche zeigen"], ["npc", "NPCs"], ["items", "Fundstücke"], ["tore", "Tore, Start, Geheimwände"], ["raster", "Raster"]].forEach(([k, n]) => R.append(h("label", { class: "row", style: { gap: "5px" } }, h("input", { type: "checkbox", checked: !!W.ov[k], onchange: e => { W.ov[k] = e.target.checked; W.need = true; } }), n)));
  R.append(h("div", { class: "row", style: { marginTop: "4px" } }, h("button", { class: "btn sm", onclick: fitAll }, "Alles zeigen"), h("button", { class: "btn sm", onclick: () => { centerOn(START.tx, START.ty); W.s = Math.max(W.s, 24); } }, "Zum Start")));
  R.append(h("div", { class: "ph" }, "Bereiche springen"), h("div", { class: "row" }, [[1, 20, 28], [2, 30, 84], [3, 60, 30], [4, 100, 80]].map(([a, x, y]) => h("button", { class: "btn sm", onclick: () => { const pts = []; for (let i = 0; i < AM.length; i++) if (AM[i] === a && T[(i / WW) | 0][i % WW] !== 0) pts.push(i); if (!pts.length) { toast("In Bereich " + a + " gibt es keine begehbare Kachel."); return; } const m = pts[(pts.length / 2) | 0]; centerOn(m % WW, (m / WW) | 0); W.s = Math.max(W.s, 16); } }, "B" + a))));
  R.append(h("div", { id: "winspect" }), h("div", { id: "went" }));
  updateInspect(); entityPanel(R.querySelector("#went"));
}
function updateInspect() {
  const el = $q("#winspect"); if (!el) return; el.innerHTML = ""; if (!W.hover) { el.append(h("p", { class: "muted" }, "Fahre über die Karte.")); return; }
  const [x, y] = W.hover, c = getCell(x, y), tn = (TERR.find(t => t[0] === c.t) || [0, c.t === 6 ? "Haus" : "?"])[1];
  el.append(h("div", { class: "ph" }, "Kachel " + x + ", " + y), h("div", { style: { fontSize: "14px", lineHeight: 1.4 } }, "Gelände: " + tn, h("br"), "Bereich: " + c.a + " · " + ((AREAS[c.a] && AREAS[c.a].name) || ""), h("br"), "Zone: " + (c.z ? ((ZINFO[c.z] && ZINFO[c.z].n) || c.z) : "–"), h("br"), "Boden: " + (c.g ? (TILE_REG[c.g] ? TILE_REG[c.g].n : c.g) : "Standard"), h("br"), "Objekt: " + (c.o ? (TILE_REG[c.o] ? TILE_REG[c.o].n : c.o) : "–")));
}
function entityPanel(R) {
  if (!R) return; R.innerHTML = "";
  if (W.tool === "npc" || ED.sel.npc && W.tool === "npc") { const id = ED.sel.npc, n = id && NPCS[id]; if (n) R.append(h("div", { class: "ph" }, "NPC: " + n.n), h("p", { class: "muted" }, "x " + n.x + ", y " + n.y + " · Bereich " + n.area), h("button", { class: "btn sm", onclick: () => { ED.sel.npcs = id; gotoTab("npcs"); } }, "Im NPC-Reiter bearbeiten"), h("button", { class: "btn sm warn", style: { marginLeft: "4px" }, onclick: async () => { if (await ask("NPC löschen", n.n + " wirklich löschen?", "Löschen")) { delete NPCS[id]; ED.sel.npc = null; touch(); W.need = true; renderSide(); } } }, "Löschen")); }
  if (W.tool === "item") { const id = ED.sel.item, n = id && ITEMS[id]; if (n) R.append(h("div", { class: "ph" }, "Fundstück: " + n.n), h("p", { class: "muted" }, "x " + n.x + ", y " + n.y), h("button", { class: "btn sm", onclick: () => { ED.sel.items = id; gotoTab("items"); } }, "Bearbeiten"), h("button", { class: "btn sm warn", style: { marginLeft: "4px" }, onclick: () => { delete ITEMS[id]; ED.sel.item = null; touch(); W.need = true; renderSide(); } }, "Löschen")); }
  if (W.tool === "house") { const k = ED.sel.house, hh = HOUSES[k]; if (hh) R.append(h("div", { class: "ph" }, "Haus"), fld("Dach", cIn(hh, "roof", { after: () => { W.need = true; touchCell(hh.x, hh.y); invalidateAll(); } })), fld("Schild", tIn(hh, "sign", { opt: true, ph: "z. B. Marlo" })), chk(hh, "door", "Tür"), h("button", { class: "btn sm warn", onclick: () => { removeHouse(k); renderSide(); } }, "Haus abreißen")); }
  if (W.tool === "gate") { const g0 = { GATE, GATE3, GATE4 }[W.gate]; R.append(h("div", { class: "ph" }, "Tor"), fld("Breite", nIn(g0, "w", { min: 1, max: 9, after: () => { W.need = true; } })), h("p", { class: "muted" }, "x " + g0.x + ", y " + g0.y)); }
  if (W.tool === "start") R.append(h("div", { class: "ph" }, "Start"), h("p", { class: "muted" }, "x " + START.tx + ", y " + START.ty));
  if (W.selR && (W.tool === "select" || W.tool === "paste")) R.append(h("div", { class: "ph" }, "Auswahl"), h("p", { class: "muted" }, (W.selR.x1 - W.selR.x0 + 1) + "×" + (W.selR.y1 - W.selR.y0 + 1) + " Kacheln"), h("div", { class: "row" }, [["T", "Gelände leeren"], ["GR", "Böden leeren"], ["OB", "Objekte leeren"]].map(([k, n]) => h("button", { class: "btn sm", onclick: () => { const r = W.selR; strokeBegin(); for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) strokeSet(x, y, k === "T" ? { t: 0 } : k === "GR" ? { g: null } : { o: null }); strokeEnd(); } }, n))));
}

/* ----- Der Reiter ----- */
tab("welt", "Weltkarte", "Bauen", root => {
  root.append(h("div", { id: "wrap" }, h("div", { class: "side card", id: "wleft", style: { padding: "8px" } }), h("div", { id: "stage" }, h("canvas", { id: "wcv" }), h("canvas", { id: "mini", width: 160, height: 116, style: { width: "160px", height: "116px" } }), h("div", { id: "hud" }, ""), h("div", { id: "zoomb" }, h("button", { title: "Hineinzoomen", "aria-label": "Hineinzoomen", onclick: () => { const c = stageEl(), r = c.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, 1.4); } }, "+"), h("button", { title: "Herauszoomen", "aria-label": "Herauszoomen", onclick: () => { const c = stageEl(), r = c.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, 1 / 1.4); } }, "−"), h("button", { title: "Karte verschieben (Hand)", "aria-label": "Hand", class: W.tool === "pan" ? "on" : "", onclick: e => { setTool(W.tool === "pan" ? "brush" : "pan"); e.currentTarget.classList.toggle("on", W.tool === "pan"); } }, "✋"))), h("div", { class: "side card", id: "wright", style: { padding: "8px" } })));
  if (!W.flat) buildFlat(); W.need = true; wInit(); renderSide();
  requestAnimationFrame(() => { fit(); if (!W.init) { W.init = true; centerOn(START.tx, START.ty); W.s = 20; } W.need = true; });
});
