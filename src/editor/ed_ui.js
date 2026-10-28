/* ===== Editor: Oberfläche ===== */
const $ = id => document.getElementById(id);
const PAL = ["#1d2742", "#ffffff", "#fdf2fa", "#f6e8c4", "#efe3c8", "#e0a930", "#ffe27a", "#fff6a0", "#ffb02e", "#ff5a1a", "#b8473a", "#ff6ec7", "#e0409a", "#c8b8ff", "#8e5bd6", "#6a5cff", "#2a4fc4", "#7fd6ff", "#bfe8ff", "#2fe0d0", "#4fa3a8", "#7fb36a", "#3a8450", "#dfe8c9", "#9a7a56", "#cfd3dc", "#8a93b4", "#5c6684"];
let doc = newDoc(), sel = null, selPt = -1, tool = "select", T = 0, playing = true, dirtyF = true, undo = [], redo = [], lastSnap = "", tab = "shape", pay = "fill", cursor = [0, 0], spaceDown = false;
let view = { z: 12, ox: 20, oy: 20 }, bgMode = "paper", showGrid = true, snapOn = true, ref = null, drag = null, lastStyle = { fill: "#efe3c8", stroke: INK };
const cv = $("cv"), ctx = cv.getContext("2d"), hit = document.createElement("canvas").getContext("2d");
const snap = v => snapOn ? Math.round(v * 2) / 2 : Math.round(v * 100) / 100;
const cur = () => doc.shapes.find(s => s.id === sel) || null;
const dirty = () => { dirtyF = true; exportDirty = true; };
let exportDirty = true;
function toast(t) { const e = $("toast"); e.textContent = t; e.classList.add("on"); clearTimeout(toast._t); toast._t = setTimeout(() => e.classList.remove("on"), 1800); }
function save() { try { localStorage.setItem("tonlinge_editor_doc", JSON.stringify(doc)); } catch (e) { } }
function snapshot() { lastSnap = JSON.stringify(doc); }
function commit() { const now = JSON.stringify(doc); if (now === lastSnap) return; undo.push(lastSnap); if (undo.length > 120) undo.shift(); redo = []; lastSnap = now; save(); dirty(); syncBtns(); }
function restore(js) { doc = JSON.parse(js); lastSnap = js; if (!cur()) { sel = null; selPt = -1; } save(); dirty(); renderPanel(); syncBtns(); }
const doUndo = () => { if (!undo.length) return; redo.push(JSON.stringify(doc)); restore(undo.pop()); };
const doRedo = () => { if (!redo.length) return; undo.push(JSON.stringify(doc)); restore(redo.pop()); };
function syncBtns() { $("bUndo").disabled = !undo.length; $("bRedo").disabled = !redo.length; }

/* ---------- Ansicht ---------- */
function resize() { const r = cv.getBoundingClientRect(), d = devicePixelRatio || 1; cv.width = Math.max(10, Math.round(r.width * d)); cv.height = Math.max(10, Math.round(r.height * d)); dirty(); }
function fitView() { const r = cv.getBoundingClientRect(), z = Math.max(4, Math.min(r.width, r.height) / 46); view = { z, ox: (r.width - 40 * z) / 2, oy: (r.height - 40 * z) / 2 }; dirty(); }
const toU = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left - view.ox) / view.z, (e.clientY - r.top - view.oy) / view.z]; };
const toS = (x, y) => [x * view.z + view.ox, y * view.z + view.oy];
function zoomAt(f, sx, sy) { const r = cv.getBoundingClientRect(); sx = sx == null ? r.width / 2 : sx; sy = sy == null ? r.height / 2 : sy; const ux = (sx - view.ox) / view.z, uy = (sy - view.oy) / view.z; view.z = Math.max(3, Math.min(80, view.z * f)); view.ox = sx - ux * view.z; view.oy = sy - uy * view.z; dirty(); }
const BG = { paper: "#f6efd9", dark: "#2a3350", green: "#9ab86a", white: "#ffffff" };

/* ---------- Griffe ---------- */
function handles(s) {
  if (!s) return [];
  if (s.type === "ellipse" || s.type === "rect") {
    const a = (s.rot || 0) * Math.PI / 180, ex = [Math.cos(a), Math.sin(a)], ey = [-Math.sin(a), Math.cos(a)], c = [s.cx, s.cy], f = 26 / view.z;
    return [{ id: "e", x: c[0] + ex[0] * s.rx, y: c[1] + ex[1] * s.rx }, { id: "w", x: c[0] - ex[0] * s.rx, y: c[1] - ex[1] * s.rx }, { id: "s", x: c[0] + ey[0] * s.ry, y: c[1] + ey[1] * s.ry }, { id: "n", x: c[0] - ey[0] * s.ry, y: c[1] - ey[1] * s.ry },
      { id: "rot", x: c[0] - ey[0] * (s.ry + f), y: c[1] - ey[1] * (s.ry + f), round: true }];
  }
  if (s.type === "path") {
    const h = s.pts.map((p, i) => ({ id: "p" + i, x: p.x, y: p.y, round: true, pt: i })), n = s.pts.length, m = [];
    for (let i = 0; i < (s.closed ? n : n - 1); i++) { const a = s.pts[i], b = s.pts[(i + 1) % n]; m.push({ id: "m" + i, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, add: i + 1 }); }
    return h.concat(m);
  }
  if (s.type === "svg") { const bb = opsBBox(s.ops); return [[0, 1], [2, 1], [2, 3], [0, 3]].map((q, i) => ({ id: "c" + i, x: bb[q[0]], y: bb[q[1]] })); }
  return [];
}
function pickHandle(p) { const s = cur(); if (!s || drag) return null; let best = null, bd = 1e9; for (const h of handles(s)) { const d = Math.hypot((h.x - p[0]) * view.z, (h.y - p[1]) * view.z); if (d < 12 && d < bd) { best = h; bd = d; } } return best; }
function pickShape(p) {
  for (let i = doc.shapes.length - 1; i >= 0; i--) {
    const s = doc.shapes[i]; if (!s.vis) continue;
    for (const m of (s.mirror && s.type !== "svg" ? [false, true] : [false])) {
      const path = opsApply(new Path2D(), pathOps(s, m)), hasFill = s.fmode !== "none" && s.fill;
      if (hasFill && s.type !== "svg" ? hit.isPointInPath(path, p[0], p[1]) : (hasFill && hit.isPointInPath(path, p[0], p[1]))) return s;
      hit.lineWidth = Math.max(s.sw || 0, 10 / view.z); if (hit.isPointInStroke(path, p[0], p[1])) return s;
    }
  }
  return null;
}

/* ---------- Zeichnen ---------- */
function render() {
  const d = devicePixelRatio || 1, W = cv.width, H = cv.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  if (bgMode === "check") { const g = 16 * d; for (let y = 0; y < H; y += g) for (let x = 0; x < W; x += g) { ctx.fillStyle = ((x / g + y / g) & 1) ? "#d9d9d9" : "#f4f4f4"; ctx.fillRect(x, y, g, g); } } else { ctx.fillStyle = BG[bgMode]; ctx.fillRect(0, 0, W, H); }
  ctx.setTransform(d * view.z, 0, 0, d * view.z, d * view.ox, d * view.oy);
  const dark = bgMode === "dark";
  if (showGrid) { ctx.lineWidth = 1 / view.z; for (let i = -20; i <= 60; i++) { const strong = i % 5 === 0; if (!strong && view.z < 9) continue; ctx.strokeStyle = dark ? (strong ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.08)") : (strong ? "rgba(29,39,66,.2)" : "rgba(29,39,66,.08)"); ctx.beginPath(); ctx.moveTo(i, -20); ctx.lineTo(i, 60); ctx.moveTo(-20, i); ctx.lineTo(60, i); ctx.stroke(); } }
  ctx.strokeStyle = dark ? "rgba(255,255,255,.5)" : "rgba(29,39,66,.5)"; ctx.lineWidth = 1.5 / view.z; ctx.setLineDash([4 / view.z, 4 / view.z]); ctx.strokeRect(0, 0, 40, 40); ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(20, 40); ctx.moveTo(0, 20); ctx.lineTo(40, 20); ctx.stroke(); ctx.setLineDash([]);
  if (ref && ref.img) { const im = ref.img, k = 40 / Math.max(im.width, im.height) * ref.s; ctx.save(); ctx.globalAlpha = ref.op; ctx.drawImage(im, 20 + ref.x - im.width * k / 2, 20 + ref.y - im.height * k / 2, im.width * k, im.height * k); ctx.restore(); }
  drawDoc(ctx, doc, 0, 0, 40, T);
  ctx.setTransform(d, 0, 0, d, 0, 0);
  const s = cur(); if (s) {
    ctx.save(); ctx.translate(view.ox, view.oy); ctx.scale(view.z, view.z);
    for (const m of (s.mirror && s.type !== "svg" ? [false, true] : [false])) { ctx.lineWidth = 1.6 / view.z; ctx.strokeStyle = "#2b7a86"; ctx.setLineDash([5 / view.z, 3 / view.z]); ctx.stroke(opsApply(new Path2D(), pathOps(s, m))); }
    ctx.setLineDash([]); ctx.restore();
    if (s.type === "path") { ctx.strokeStyle = "rgba(43,122,134,.45)"; ctx.lineWidth = 1; ctx.beginPath(); s.pts.forEach((p, i) => { const q = toS(p.x, p.y); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); if (s.closed && s.pts.length > 2) ctx.closePath(); ctx.stroke(); }
    if (drag && drag.k === "create" && s.type === "path") { const l = s.pts[s.pts.length - 1], a = toS(l.x, l.y), b = toS(cursor[0], cursor[1]); ctx.strokeStyle = "#2b7a86"; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    for (const h of handles(s)) { const q = toS(h.x, h.y), on = h.pt === selPt && h.pt != null; ctx.fillStyle = h.add ? "rgba(255,255,255,.8)" : on ? "#ffb02e" : "#fff"; ctx.strokeStyle = "#1d2742"; ctx.lineWidth = 2; ctx.beginPath(); if (h.round || h.add) ctx.arc(q[0], q[1], h.add ? 4 : 6, 0, TAU); else ctx.rect(q[0] - 5, q[1] - 5, 10, 10); ctx.fill(); ctx.stroke(); if (h.add) { ctx.beginPath(); ctx.moveTo(q[0] - 2, q[1]); ctx.lineTo(q[0] + 2, q[1]); ctx.moveTo(q[0], q[1] - 2); ctx.lineTo(q[0], q[1] + 2); ctx.stroke(); } }
  }
}
function drawPrev() {
  [["pv1", 24, "#9ab86a"], ["pv2", 48, "#f6efd9"], ["pv3", 96, "#2a3350"]].forEach(([id, n, bg]) => { const c = $(id), d = devicePixelRatio || 1; if (c.width !== (n + 16) * d) { c.width = (n + 16) * d; c.height = (n + 16) * d; c.style.width = c.style.height = (n + 16) + "px"; }
    const x = c.getContext("2d"); x.setTransform(d, 0, 0, d, 0, 0); x.fillStyle = bg; x.fillRect(0, 0, n + 16, n + 16); drawDoc(x, doc, 8, 8, n, T); });
}
let last = 0, fr = 0;
function loop(ts) { const dt = Math.min(.1, (ts - last) / 1000 || 0); last = ts; if (playing) { T += dt; dirtyF = true; } if (dirtyF) { dirtyF = false; render(); if ((fr++ % 2 === 0) || !playing) drawPrev(); if (tab === "export" && exportDirty && !playing) fillExport(); } requestAnimationFrame(loop); }

/* ---------- Zeiger ---------- */
function addShape(s) { doc.shapes.push(s); sel = s.id; selPt = -1; if (tab === "doc") tab = "shape"; }
function finishPath() { const s = cur(); if (!s || s.type !== "path") return; const n = s.pts.length; if (n > 1) { const a = s.pts[n - 1], b = s.pts[n - 2]; if (Math.hypot(a.x - b.x, a.y - b.y) < .3) s.pts.pop(); }
  if (s.pts.length < 2) { doc.shapes = doc.shapes.filter(x => x !== s); sel = null; } drag = null; tool = "select"; syncTools(); commit(); renderPanel(); dirty(); }
cv.addEventListener("pointerdown", e => {
  cv.setPointerCapture(e.pointerId); const p = toU(e), r = cv.getBoundingClientRect(); cursor = p;
  if (e.button === 1 || spaceDown || tool === "pan") { drag = { k: "pan", sx: e.clientX, sy: e.clientY, ox: view.ox, oy: view.oy }; return; }
  if (e.button === 2) { const h = pickHandle(p); if (h && h.pt != null) delPoint(h.pt); return; }
  if (tool === "ellipse" || tool === "rect") { const q = [snap(p[0]), snap(p[1])], s = newShape(tool, Object.assign({ cx: q[0], cy: q[1], rx: .5, ry: .5, rot: 0, r: 0 }, lastStyle)); addShape(s); drag = { k: "create", t: tool, p0: q }; renderPanel(); return; }
  if (tool === "curve" || tool === "line") {
    const q = { x: snap(p[0]), y: snap(p[1]) }; let s = cur();
    if (drag && drag.k === "create" && s && s.type === "path") { if (tool === "curve" && s.pts.length >= 3 && Math.hypot((s.pts[0].x - q.x) * view.z, (s.pts[0].y - q.y) * view.z) < 12) return finishPath(); s.pts.push(q); dirty(); return; }
    s = newShape("path", Object.assign({ pts: [q], closed: tool === "curve", smooth: true }, lastStyle)); if (tool === "line") { s.fmode = "none"; s.name = "Linie"; s.fill = ""; } addShape(s); drag = { k: "create", t: tool }; renderPanel(); dirty(); return;
  }
  const h = pickHandle(p), s = cur();
  if (h && s) {
    if (h.add) { s.pts.splice(h.add, 0, { x: snap(h.x), y: snap(h.y) }); selPt = h.add; drag = { k: "h", id: "p" + h.add, orig: clone(s), moved: true }; dirty(); return; }
    if (h.pt != null) selPt = h.pt; drag = { k: "h", id: h.id, orig: clone(s), p0: p, moved: false }; dirty(); return;
  }
  const hs = pickShape(p);
  if (hs) { if (hs.id !== sel) { sel = hs.id; selPt = -1; if (tab === "doc") tab = "shape"; renderPanel(); } drag = { k: "move", orig: clone(hs), p0: p, moved: false }; }
  else { sel = null; selPt = -1; renderPanel(); }
  dirty();
});
cv.addEventListener("pointermove", e => {
  const p = toU(e); cursor = p; if (!drag) { if (tool === "curve" || tool === "line") dirty(); return; }
  if (drag.k === "pan") { view.ox = drag.ox + (e.clientX - drag.sx); view.oy = drag.oy + (e.clientY - drag.sy); dirty(); return; }
  const s = cur(); if (!s) return;
  if (drag.k === "create") { if (s.type === "path") { dirty(); return; } const x0 = drag.p0[0], y0 = drag.p0[1], x1 = snap(p[0]), y1 = snap(p[1]); s.cx = (x0 + x1) / 2; s.cy = (y0 + y1) / 2; s.rx = Math.max(.25, Math.abs(x1 - x0) / 2); s.ry = Math.max(.25, Math.abs(y1 - y0) / 2); dirty(); return; }
  if (drag.k === "move") { let dx = p[0] - drag.p0[0], dy = p[1] - drag.p0[1]; if (snapOn) { dx = Math.round(dx * 2) / 2; dy = Math.round(dy * 2) / 2; } if (dx || dy) drag.moved = true; const o = drag.orig;
    if (s.type === "path") s.pts = o.pts.map(q => ({ x: q.x + dx, y: q.y + dy })); else if (s.type === "svg") s.ops = opsMap(o.ops, (x, y) => [x + dx, y + dy]); else { s.cx = o.cx + dx; s.cy = o.cy + dy; } dirty(); return; }
  if (drag.k === "h") { drag.moved = true; const o = drag.orig, id = drag.id;
    if (s.type === "path") { const i = +id.slice(1); s.pts[i] = { x: snap(p[0]), y: snap(p[1]) }; }
    else if (s.type === "svg") { const bb = opsBBox(o.ops), c = [(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2], h0 = handles(o).find(h => h.id === id), k = Math.max(.05, Math.hypot(p[0] - c[0], p[1] - c[1]) / (Math.hypot(h0.x - c[0], h0.y - c[1]) || 1)); s.ops = opsMap(o.ops, (x, y) => [c[0] + (x - c[0]) * k, c[1] + (y - c[1]) * k]); s.sw = o.sw * k; }
    else { const a = (o.rot || 0) * Math.PI / 180, ex = [Math.cos(a), Math.sin(a)], ey = [-Math.sin(a), Math.cos(a)], v = [p[0] - o.cx, p[1] - o.cy];
      if (id === "e" || id === "w") s.rx = Math.max(.25, snap(Math.abs(v[0] * ex[0] + v[1] * ex[1]))); else if (id === "n" || id === "s") s.ry = Math.max(.25, snap(Math.abs(v[0] * ey[0] + v[1] * ey[1])));
      else if (id === "rot") { let g = Math.atan2(v[1], v[0]) * 180 / Math.PI + 90; if (e.shiftKey || snapOn) g = Math.round(g / 5) * 5; s.rot = ((g % 360) + 360) % 360; if (s.rot > 180) s.rot -= 360; } }
    dirty(); }
});
cv.addEventListener("pointerup", e => { if (!drag) return; const k = drag.k, mv = drag.moved;
  if (k === "create") { if (cur() && cur().type !== "path") { const s = cur(); if (s.rx <= .5 && s.ry <= .5) { s.rx = s.ry = 4; } drag = null; tool = "select"; syncTools(); commit(); renderPanel(); } else return; }
  else { drag = null; if (mv) { commit(); renderPanel(); } }
  dirty(); });
cv.addEventListener("dblclick", e => { if (drag && drag.k === "create") finishPath(); });
cv.addEventListener("contextmenu", e => e.preventDefault());
cv.addEventListener("wheel", e => { e.preventDefault(); const r = cv.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
function delPoint(i) { const s = cur(); if (!s || s.type !== "path" || s.pts.length <= 2) return; s.pts.splice(i, 1); selPt = -1; commit(); renderPanel(); dirty(); }
function delShape() { const s = cur(); if (!s) return; doc.shapes = doc.shapes.filter(x => x !== s); sel = null; selPt = -1; commit(); renderPanel(); dirty(); }
function dupShape() { const s = cur(); if (!s) return; const c = clone(s); c.id = SID++; c.name += " Kopie"; if (c.type === "path") c.pts.forEach(p => { p.x += 1; p.y += 1; }); else if (c.type === "svg") c.ops = opsMap(c.ops, (x, y) => [x + 1, y + 1]); else { c.cx += 1; c.cy += 1; } doc.shapes.push(c); sel = c.id; commit(); renderPanel(); dirty(); }
function order(d) { const s = cur(); if (!s) return; const i = doc.shapes.indexOf(s), j = i + d; if (j < 0 || j >= doc.shapes.length) return; doc.shapes.splice(i, 1); doc.shapes.splice(j, 0, s); commit(); renderPanel(); dirty(); }

/* ---------- Werkzeuge, Tasten ---------- */
const TOOLS = [["select", "Auswählen", "V"], ["ellipse", "Ellipse", "E"], ["rect", "Rechteck", "R"], ["curve", "Kurve (Form)", "K"], ["line", "Linie (Strich)", "L"], ["pan", "Ansicht schieben", "H"]];
const HINTS = { select: "Form anklicken und ziehen. Griffe ziehen ändert Größe und Winkel, bei Kurven die Punkte. Die kleinen Plus-Punkte fügen einen Punkt ein, Rechtsklick oder Entf löscht den gewählten Punkt.", ellipse: "Ziehen, um eine Ellipse aufzuspannen.", rect: "Ziehen, um ein Rechteck aufzuspannen. Die Rundung stellst du rechts ein.", curve: "Klicke Punkte, die Kurve rundet sie weich ab. Klicke den ersten Punkt, doppelklicke oder drücke Enter zum Abschließen.", line: "Klicke Punkte entlang des Strichs. Doppelklick oder Enter schließt ab.", pan: "Ziehen verschiebt die Ansicht. Mausrad zoomt. Auch Leertaste halten zum Schieben." };
function setTool(t) { if (drag && drag.k === "create") finishPath(); tool = t; syncTools(); cv.style.cursor = t === "select" ? "default" : t === "pan" ? "grab" : "crosshair"; dirty(); }
function syncTools() { document.querySelectorAll("#tools button[data-t]").forEach(b => b.setAttribute("aria-pressed", b.dataset.t === tool)); $("hint").textContent = HINTS[tool]; }
addEventListener("keydown", e => {
  const tg = e.target.tagName; if (tg === "INPUT" && e.target.type !== "range" && e.target.type !== "checkbox" || tg === "TEXTAREA" || tg === "SELECT") return;
  const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
  if (mod && k === "z") { e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); return; } if (mod && k === "y") { e.preventDefault(); doRedo(); return; } if (mod && k === "d") { e.preventDefault(); dupShape(); return; }
  if (k === " ") { spaceDown = true; e.preventDefault(); return; }
  if (k === "enter") { if (drag && drag.k === "create") finishPath(); return; }
  if (k === "escape") { if (drag && drag.k === "create") { const s = cur(); if (s && s.type === "path" && s.pts.length >= 2) finishPath(); else { delShape(); drag = null; setTool("select"); } } else { sel = null; renderPanel(); dirty(); } return; }
  if (k === "delete" || k === "backspace") { e.preventDefault(); const s = cur(); if (s && s.type === "path" && selPt >= 0 && s.pts.length > 2) delPoint(selPt); else delShape(); return; }
  if (k.startsWith("arrow")) { const s = cur(); if (!s) return; e.preventDefault(); const st = e.shiftKey ? 2 : .5, dx = k === "arrowleft" ? -st : k === "arrowright" ? st : 0, dy = k === "arrowup" ? -st : k === "arrowdown" ? st : 0;
    if (s.type === "path") s.pts.forEach(p => { p.x += dx; p.y += dy; }); else if (s.type === "svg") s.ops = opsMap(s.ops, (x, y) => [x + dx, y + dy]); else { s.cx += dx; s.cy += dy; } commit(); dirty(); return; }
  const tt = TOOLS.find(t => t[2].toLowerCase() === k); if (tt && !mod) setTool(tt[0]);
});
addEventListener("keyup", e => { if (e.key === " ") spaceDown = false; });

/* ---------- Seitenleiste ---------- */
function field(label, ...els) { const r = document.createElement("div"); r.className = "row"; const l = document.createElement("label"); l.textContent = label; const i = document.createElement("div"); i.className = "in"; i.append(...els); r.append(l, i); return r; }
function inp(type, obj, key, o = {}) {
  const e = document.createElement("input"); e.type = type; if (o.min != null) { e.min = o.min; e.max = o.max; e.step = o.step || 1; } if (type === "checkbox") e.checked = !!obj[key]; else e.value = obj[key] == null ? "" : obj[key];
  e.oninput = () => { obj[key] = type === "checkbox" ? e.checked : type === "range" || type === "number" ? +e.value : e.value; dirty(); if (o.live) o.live(); };
  e.onchange = () => { if (type === "color" || type === "range") { } commit(); if (o.rebuild) renderPanel(); }; return e;
}
function selEl(obj, key, opts, o = {}) { const e = document.createElement("select"); opts.forEach(([v, l]) => { const q = document.createElement("option"); q.value = v; q.textContent = l; e.append(q); }); e.value = obj[key]; e.onchange = () => { obj[key] = e.value; if (o.after) o.after(); dirty(); commit(); renderPanel(); }; return e; }
function btn(label, fn, cls) { const b = document.createElement("button"); b.textContent = label; b.onclick = fn; if (cls) b.className = cls; return b; }
function palette() {
  const w = document.createElement("div"); const tg = document.createElement("div"); tg.className = "tabs";
  [["fill", "Füllung"], ["fill2", "Füllung 2"], ["stroke", "Kontur"]].forEach(([k, l]) => { const b = btn(l, () => { pay = k; renderPanel(); }); b.setAttribute("aria-pressed", pay === k); tg.append(b); });
  const pl = document.createElement("div"); pl.className = "pal"; PAL.forEach(c => { const i = document.createElement("i"); i.style.background = c; i.title = c; i.onclick = () => applyColor(c); pl.append(i); });
  const co = document.createElement("input"); co.type = "color"; co.value = "#ff6ec7"; co.oninput = () => applyColor(co.value, true); co.onchange = () => commit(); tg.append(co);
  w.append(tg, pl); return w;
}
function applyColor(c, live) { const s = cur(); if (!s) { toast("Wähle zuerst eine Form"); return; } if (pay === "fill") { s.fill = c; if (s.fmode === "none") s.fmode = "solid"; lastStyle.fill = c; } else if (pay === "fill2") { s.fill2 = c; if (s.fmode === "solid" || s.fmode === "none") s.fmode = "v"; } else { s.stroke = c; if (!s.sw) s.sw = 2.4; lastStyle.stroke = c; } dirty(); if (!live) { commit(); renderPanel(); } }
function renderPanel() {
  const P = $("panel"); P.innerHTML = ""; const tb = document.createElement("div"); tb.className = "tabs";
  [["shape", "Form"], ["layers", "Ebenen"], ["doc", "Bild"], ["export", "Export"]].forEach(([k, l]) => { const b = btn(l, () => { tab = k; renderPanel(); if (k === "export") fillExport(); }); b.setAttribute("aria-pressed", tab === k); tb.append(b); }); P.append(tb);
  if (tab === "shape") panelShape(P); else if (tab === "layers") panelLayers(P); else if (tab === "doc") panelDoc(P); else panelExport(P);
}
function panelShape(P) {
  const s = cur(); if (!s) { const m = document.createElement("p"); m.className = "muted"; m.textContent = "Keine Form gewählt. Wähle ein Werkzeug links und zeichne, oder klicke eine Form an."; P.append(m); P.append(palette()); return; }
  P.append(field("Name", inp("text", s, "name", { live: () => { } })));
  P.append(field("Sichtbar", inp("checkbox", s, "vis")));
  if (s.type !== "svg") P.append(field("Spiegeln", inp("checkbox", s, "mirror"), Object.assign(document.createElement("span"), { className: "muted", textContent: "an der Mittellinie" })));
  P.append(field("Füllung", selEl(s, "fmode", [["none", "keine"], ["solid", "einfarbig"], ["v", "Verlauf senkrecht"], ["r", "Verlauf rund"]])));
  if (s.fmode !== "none") { P.append(field("Farbe", inp("color", s, "fill"), ...(s.fmode !== "solid" ? [inp("color", s, "fill2")] : []))); }
  const st = document.createElement("input"); st.type = "checkbox"; st.checked = !!(s.stroke && s.sw > 0); st.onchange = () => { if (st.checked) { s.stroke = s.stroke || INK; s.sw = s.sw || 2.4; } else s.sw = 0; dirty(); commit(); renderPanel(); };
  P.append(field("Kontur", st, ...(st.checked ? [inp("color", s, "stroke")] : []))); if (st.checked) P.append(field("Dicke", inp("range", s, "sw", { min: .4, max: 8, step: .2 })));
  P.append(field("Deckkraft", inp("range", s, "op", { min: .05, max: 1, step: .05 }))); P.append(field("Leuchtend", inp("checkbox", s, "add"), Object.assign(document.createElement("span"), { className: "muted", textContent: "heller Überblend" })));
  if (s.type === "ellipse" || s.type === "rect") P.append(field("Drehung", inp("range", s, "rot", { min: -180, max: 180, step: 1 })));
  if (s.type === "rect") P.append(field("Rundung", inp("range", s, "r", { min: 0, max: 20, step: .5 })));
  if (s.type === "path") { P.append(field("Geschlossen", inp("checkbox", s, "closed"))); P.append(field("Weich", inp("checkbox", s, "smooth"), Object.assign(document.createElement("span"), { className: "muted", textContent: "rundet die Ecken" }))); P.append(field("Punkt", btn("Gewählten löschen", () => selPt >= 0 ? delPoint(selPt) : toast("Wähle einen Punkt"), "danger"))); }
  P.append(field("Bewegung", selEl(s.anim, "t", Object.entries(ANIMS), { after: () => { const d = ANIM_DEF[s.anim.t]; if (d) { s.anim.amp = d[0]; s.anim.sp = d[1]; } } })));
  if (s.anim.t) { if (ANIM_DEF[s.anim.t][0]) P.append(field("Stärke", inp("range", s.anim, "amp", { min: 0, max: s.anim.t === "wippen" ? 8 : 40, step: .5 }))); P.append(field("Tempo", inp("range", s.anim, "sp", { min: .2, max: 8, step: .1 }))); P.append(field("Versatz", inp("range", s.anim, "ph", { min: 0, max: 6.3, step: .1 }))); }
  const b = document.createElement("div"); b.className = "tabs"; b.append(btn("Duplizieren", dupShape), btn("Nach vorn", () => order(1)), btn("Nach hinten", () => order(-1)), btn("Löschen", delShape, "danger")); P.append(b);
  P.append(palette());
}
function panelLayers(P) {
  const L = document.createElement("div"); L.className = "layers"; if (!doc.shapes.length) { const m = document.createElement("p"); m.className = "muted"; m.style.padding = "6px"; m.textContent = "Noch keine Formen."; L.append(m); }
  [...doc.shapes].reverse().forEach(s => { const d = document.createElement("div"); if (s.id === sel) d.className = "on"; const v = document.createElement("input"); v.type = "checkbox"; v.checked = s.vis; v.title = "sichtbar"; v.onclick = e => e.stopPropagation(); v.onchange = () => { s.vis = v.checked; commit(); dirty(); };
    const n = document.createElement("span"); n.textContent = s.name + (s.mirror ? " (gespiegelt)" : ""); d.append(v, n); d.onclick = () => { sel = s.id; selPt = -1; renderPanel(); dirty(); }; L.append(d); });
  P.append(L); const b = document.createElement("div"); b.className = "tabs"; b.style.marginTop = "8px"; b.append(btn("Nach vorn", () => order(1)), btn("Nach hinten", () => order(-1)), btn("Duplizieren", dupShape), btn("Löschen", delShape, "danger")); P.append(b);
}
function panelDoc(P) {
  P.append(field("Name", inp("text", doc, "name", { live: () => { } })));
  P.append(field("Wackeln", inp("range", doc, "wobble", { min: 0, max: 3, step: .1 }), Object.assign(document.createElement("span"), { className: "muted", textContent: "0 = glatt" })));
  const sd = inp("number", doc, "seed", { min: 0, max: 99, step: .1 }); P.append(field("Zufall", sd, btn("Würfeln", () => { doc.seed = r2(Math.random() * 90 + 1); commit(); renderPanel(); dirty(); })));
  P.append(field("Hüpfen", inp("range", doc, "bounce", { min: 0, max: 4, step: .1 }))); P.append(field("Dehnen", inp("range", doc, "squash", { min: 0, max: .12, step: .01 })));
  const bgs = selEl({ v: bgMode }, "v", [["paper", "Papier"], ["white", "Weiß"], ["dark", "Dunkel"], ["green", "Wiese"], ["check", "Schachbrett"]]); bgs.onchange = () => { bgMode = bgs.value; dirty(); }; P.append(field("Hintergrund", bgs));
  const g = document.createElement("input"); g.type = "checkbox"; g.checked = showGrid; g.onchange = () => { showGrid = g.checked; dirty(); }; P.append(field("Raster", g));
  const sn = document.createElement("input"); sn.type = "checkbox"; sn.checked = snapOn; sn.onchange = () => { snapOn = sn.checked; }; P.append(field("Einrasten", sn, Object.assign(document.createElement("span"), { className: "muted", textContent: "halbe Einheiten" })));
  const h2 = document.createElement("h2"); h2.textContent = "Vorlage zum Nachzeichnen"; P.append(h2);
  const fi = document.createElement("input"); fi.type = "file"; fi.accept = "image/*"; fi.onchange = () => { const f = fi.files[0]; if (!f) return; const im = new Image(); im.onload = () => { ref = { img: im, op: .5, s: 1, x: 0, y: 0 }; renderPanel(); dirty(); }; im.src = URL.createObjectURL(f); };
  P.append(field("Bild", fi)); if (ref) { P.append(field("Stärke", inp("range", ref, "op", { min: .05, max: 1, step: .05 }))); P.append(field("Größe", inp("range", ref, "s", { min: .2, max: 3, step: .05 }))); P.append(field("Links/Rechts", inp("range", ref, "x", { min: -40, max: 40, step: .5 }))); P.append(field("Oben/Unten", inp("range", ref, "y", { min: -40, max: 40, step: .5 }))); P.append(btn("Vorlage entfernen", () => { ref = null; renderPanel(); dirty(); })); }
  const m = document.createElement("p"); m.className = "muted"; m.textContent = "Lade ein Foto oder eine Skizze und fahre mit den Formen darüber. Die Vorlage wird nicht mit exportiert."; P.append(m);
  const b = document.createElement("div"); b.className = "tabs"; b.append(btn("Neues Bild", () => { if (doc.shapes.length && !confirm("Aktuelles Bild verwerfen?")) return; loadDoc(newDoc()); }), btn("Beispiel laden", () => loadDoc(sampleDoc()))); P.append(b);
}
function panelExport(P) {
  const ta = document.createElement("textarea"); ta.id = "code"; ta.readOnly = true; ta.spellcheck = false; P.append(ta); fillExport();
  const b1 = document.createElement("div"); b1.className = "tabs"; b1.style.marginTop = "6px"; b1.append(btn("Code kopieren", () => copy(ta.value)), btn("Code als .js", () => download(nameId(doc.name) + ".js", ta.value, "text/javascript"))); P.append(b1);
  const sz = selEl({ v: 512 }, "v", [[128, "128 px"], [256, "256 px"], [512, "512 px"], [1024, "1024 px"]]); sz.onchange = null; sz.value = 512;
  const b2 = document.createElement("div"); b2.className = "tabs"; b2.append(btn("PNG speichern", () => exportPNG(+sz.value)), sz, btn("SVG speichern", () => download(doc.name + ".svg", exportSVG(doc), "image/svg+xml")), btn("Projekt (JSON)", () => download(doc.name + ".json", JSON.stringify(doc), "application/json"))); P.append(b2);
  const h2 = document.createElement("h2"); h2.textContent = "Laden und Importieren"; P.append(h2);
  const fi = document.createElement("input"); fi.type = "file"; fi.accept = ".json,.svg,image/svg+xml,application/json"; fi.onchange = () => { const f = fi.files[0]; if (f) f.text().then(importText); };
  const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = true; cb.id = "inkImp";
  P.append(field("Datei", fi)); P.append(field("Kontur dazu", cb, Object.assign(document.createElement("span"), { className: "muted", textContent: "bei SVG ohne Kontur" })));
  const pa = document.createElement("textarea"); pa.id = "paste"; pa.style.minHeight = "70px"; pa.placeholder = "Hier JSON-Projekt oder SVG-Text einfügen"; P.append(pa); P.append(btn("Einfügen importieren", () => importText(pa.value)));
  const m = document.createElement("p"); m.className = "muted"; m.textContent = "SVG-Formen werden in den Wackel-Look verwandelt und kommen als einzelne Formen ins Bild. Die kannst du verschieben, skalieren, einfärben und animieren."; P.append(m);
}
function fillExport() { const ta = $("code"); if (ta) { ta.value = genFunc(doc); exportDirty = false; } }
function copy(t) { (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast("Kopiert"), () => { const ta = $("code"); if (ta) { ta.select(); document.execCommand("copy"); toast("Kopiert"); } }); }
function download(name, text, type) { const a = document.createElement("a"); a.href = URL.createObjectURL(text instanceof Blob ? text : new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000); }
function exportPNG(n) { const c = document.createElement("canvas"); c.width = c.height = n; const x = c.getContext("2d"); drawDoc(x, doc, 0, 0, n, T); c.toBlob(b => download(doc.name + ".png", b, "image/png")); }
function loadDoc(d) { doc = d; SID = Math.max(SID, ...d.shapes.map(s => s.id + 1), 1); sel = null; selPt = -1; undo = []; redo = []; snapshot(); save(); renderPanel(); dirty(); syncBtns(); }
function importText(t) {
  t = (t || "").trim(); try {
    if (t[0] === "{") { const d = JSON.parse(t); if (!Array.isArray(d.shapes)) throw new Error("Kein Projekt"); loadDoc(Object.assign(newDoc(), d)); toast("Projekt geladen"); }
    else if (t.includes("<svg")) { const ink = $("inkImp") ? $("inkImp").checked : true, sh = importSVG(t, ink); sh.forEach(s => doc.shapes.push(s)); sel = sh[0].id; if (doc.wobble > .35) doc.wobble = .35; tab = "layers"; commit(); renderPanel(); dirty(); toast(sh.length + " Formen importiert, Wackeln auf 0,35 gesenkt (Reiter Bild)"); }
    else throw new Error("Weder JSON noch SVG");
  } catch (e) { toast("Import fehlgeschlagen: " + e.message); }
}
function sampleDoc() {
  const d = newDoc(); d.name = "tupfel_beispiel"; d.bounce = 1.2; d.squash = .04; const A = (t, a, sp) => ({ t, amp: a, sp, ph: 0 });
  const body = newShape("ellipse", { name: "Körper", cx: 20, cy: 25, rx: 12, ry: 10, rot: 0, fill: "#efe3c8", anim: A("pulsieren", 2, 3) });
  const cap = newShape("path", { name: "Hut", pts: [{ x: 8, y: 21 }, { x: 11, y: 13 }, { x: 20, y: 9 }, { x: 29, y: 13 }, { x: 32, y: 21 }, { x: 20, y: 18 }], closed: true, smooth: true, fill: "#7fb36a", fill2: "#3a8450", fmode: "v" });
  const dot = newShape("ellipse", { name: "Hutpunkt", cx: 24, cy: 14, rx: 2, ry: 1.4, rot: -20, fill: "#dfe8c9", stroke: "", sw: 0 });
  const eye = newShape("ellipse", { name: "Auge", cx: 16, cy: 25, rx: 1.5, ry: 2, rot: 0, fill: INK, stroke: "", sw: 0, mirror: true, anim: A("blinzeln", 0, 2) });
  const bl = newShape("ellipse", { name: "Wange", cx: 12.5, cy: 28.5, rx: 2.4, ry: 1.4, rot: 0, fill: "#f5a8a8", stroke: "", sw: 0, mirror: true, op: .8 });
  const mo = newShape("path", { name: "Mund", pts: [{ x: 18, y: 29 }, { x: 20, y: 30.5 }, { x: 22, y: 29 }], closed: false, smooth: true, fmode: "none", fill: "", sw: 1.6 });
  d.shapes = [body, cap, dot, eye, bl, mo]; return d;
}

/* ---------- Start ---------- */
(function init() {
  $("tools").querySelectorAll("button[data-t]").forEach(b => b.onclick = () => setTool(b.dataset.t));
  TOOLS.forEach(t => { const b = $("tools").querySelector(`[data-t="${t[0]}"]`); if (b) b.title = "Taste " + t[2]; });
  $("bUndo").onclick = doUndo; $("bRedo").onclick = doRedo; $("bZin").onclick = () => zoomAt(1.25); $("bZout").onclick = () => zoomAt(1 / 1.25); $("bFit").onclick = fitView;
  $("bPlay").onclick = () => { playing = !playing; $("bPlay").textContent = playing ? "Pause" : "Abspielen"; $("bPlay").setAttribute("aria-pressed", !playing); dirty(); };
  try { const s = localStorage.getItem("tonlinge_editor_doc"); if (s) { const d = JSON.parse(s); if (Array.isArray(d.shapes) && d.shapes.length) doc = Object.assign(newDoc(), d); } } catch (e) { }
  if (!doc.shapes.length) doc = sampleDoc(); SID = Math.max(1, ...doc.shapes.map(s => s.id + 1)); snapshot();
  new ResizeObserver(() => { resize(); }).observe($("stage")); resize(); fitView(); syncTools(); syncBtns(); renderPanel(); requestAnimationFrame(loop);
  window.__ed = { get doc() { return doc; }, importText, setTool, genFunc, exportSVG };
})();
/* SVG-Code oder Projekt-JSON direkt mit Strg+V einfügen, auch ohne Eingabefeld */
addEventListener("paste", e => { const tg = e.target.tagName; if (tg === "INPUT" || tg === "TEXTAREA") return; const t = (e.clipboardData && e.clipboardData.getData("text")) || ""; if (t.includes("<svg") || t.trim()[0] === "{") { e.preventDefault(); importText(t); } });
