/* ===== Editor: Modell, Geometrie, Code-Erzeugung, SVG-Export und -Import ===== */
"use strict";
const INK = "#1d2742", TAU = Math.PI * 2;
const r2 = v => Math.round(v * 100) / 100;
const clone = o => JSON.parse(JSON.stringify(o));
const newDoc = () => ({ name: "mein_bild", seed: 3.7, wobble: 1, bounce: 0, squash: 0, shapes: [] });
let SID = 1;
function newShape(type, p) {
  return Object.assign({ id: SID++, name: ({ ellipse: "Ellipse", rect: "Rechteck", path: "Kurve", svg: "Import" })[type], type, vis: true, fill: "#efe3c8", fill2: "#ffffff", fmode: "solid", stroke: INK, sw: 2.4, op: 1, add: false, mirror: false, anim: { t: "", amp: 2, sp: 2, ph: 0 } }, p);
}
/* Pfad-Befehle einer Form (m = an der Mittelachse gespiegelt) */
function pathOps(s, m) {
  const X = x => m ? 40 - x : x, R = a => m ? -a : a;
  if (s.type === "ellipse") return [["ellipse", X(s.cx), s.cy, s.rx, s.ry, R(s.rot || 0) * Math.PI / 180, 0, TAU]];
  if (s.type === "rect") {
    const a = R(s.rot || 0) * Math.PI / 180, co = Math.cos(a), si = Math.sin(a), cx = X(s.cx), w = s.rx, h = s.ry, r = Math.max(0, Math.min(s.r || 0, w, h));
    const T = (x, y) => [cx + x * co - y * si, s.cy + x * si + y * co], q = (a1, b1, x, y) => ["quadraticCurveTo", ...T(a1, b1), ...T(x, y)];
    return [["moveTo", ...T(-w + r, -h)], ["lineTo", ...T(w - r, -h)], q(w, -h, w, -h + r), ["lineTo", ...T(w, h - r)], q(w, h, w - r, h), ["lineTo", ...T(-w + r, h)], q(-w, h, -w, h - r), ["lineTo", ...T(-w, -h + r)], q(-w, -h, -w + r, -h), ["closePath"]];
  }
  if (s.type === "svg") return s.ops;
  const p = s.pts.map(q => [X(q.x), q.y]), n = p.length; if (!n) return []; if (n < 2) return [["moveTo", ...p[0]]];
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], o = [];
  if (!s.smooth || n < 3) { o.push(["moveTo", ...p[0]]); for (let i = 1; i < n; i++) o.push(["lineTo", ...p[i]]); if (s.closed) o.push(["closePath"]); }
  else if (s.closed) { o.push(["moveTo", ...mid(p[n - 1], p[0])]); for (let i = 0; i < n; i++) o.push(["quadraticCurveTo", ...p[i], ...mid(p[i], p[(i + 1) % n])]); o.push(["closePath"]); }
  else { o.push(["moveTo", ...p[0]], ["lineTo", ...mid(p[0], p[1])]); for (let i = 1; i < n - 1; i++) o.push(["quadraticCurveTo", ...p[i], ...mid(p[i], p[i + 1])]); o.push(["lineTo", ...p[n - 1]]); }
  return o;
}
const opsApply = (t, ops) => { ops.forEach(o => t[o[0]](...o.slice(1))); return t; };
const opsBBox = ops => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; const add = (x, y) => { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); };
  ops.forEach(o => { if (o[0] === "ellipse") { const r = Math.max(o[3], o[4]); add(o[1] - r, o[2] - r); add(o[1] + r, o[2] + r); } else for (let i = 1; i + 1 < o.length; i += 2) add(o[i], o[i + 1]); });
  return a > 1e8 ? [0, 0, 0, 0] : [a, b, c, d]; };
const opsMap = (ops, f) => ops.map(o => o[0] === "closePath" ? o : [o[0], ...o.slice(1).flatMap((_, i, r) => i % 2 ? [] : f(r[i], r[i + 1]))]);
const opsStr = ops => ops.map(o => o[0] === "closePath" ? "c.closePath();" : `c.${o[0]}(${o.slice(1).map(r2).join(", ")});`).join(" ");
const nameId = n => "draw" + (n || "bild").replace(/[^A-Za-z0-9]+/g, " ").trim().split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join("");

/* Animation einer Form als Code */
const ANIMS = { "": "keine", wippen: "Wippen (auf/ab)", schwingen: "Schwingen (Winkel)", pulsieren: "Pulsieren (Größe)", blinzeln: "Blinzeln", drehen: "Drehen", leuchten: "Leuchten (Helligkeit)" };
const ANIM_DEF = { wippen: [2, 2], schwingen: [8, 2], pulsieren: [8, 2], blinzeln: [0, 2], drehen: [0, 1], leuchten: [0, 2] };
function animCode(a, sign, px, py) {
  if (!a || !a.t) return { pre: "", alpha: "" };
  const S = `Math.sin(t * ${r2(a.sp)} + ${r2(a.ph)})`, piv = (code) => `c.translate(${r2(px)}, ${r2(py)}); ${code} c.translate(${r2(-px)}, ${r2(-py)});`;
  if (a.t === "wippen") return { pre: `c.translate(0, ${S} * ${r2(a.amp)});`, alpha: "" };
  if (a.t === "schwingen") return { pre: piv(`c.rotate(${S} * ${r2(a.amp * .0175 * sign)});`), alpha: "" };
  if (a.t === "pulsieren") return { pre: `{ const k = 1 + ${S} * ${r2(a.amp * .01)}; ${piv("c.scale(k, k);")} }`, alpha: "" };
  if (a.t === "blinzeln") return { pre: `{ const u = t * ${r2(a.sp * .35)}, k = (Math.floor(u) % 5 === 4 && u % 1 > .86) ? .12 : 1; ${piv("c.scale(1, k);")} }`, alpha: "" };
  if (a.t === "drehen") return { pre: piv(`c.rotate(t * ${r2(a.sp * sign)});`), alpha: "" };
  if (a.t === "leuchten") return { pre: "", alpha: ` * (.55 + .45 * (.5 + .5 * ${S}))` };
  return { pre: "", alpha: "" };
}
function shapeCode(s) {
  const out = [];
  for (const m of (s.mirror && s.type !== "svg" ? [false, true] : [false])) {
    const ops = pathOps(s, m), bb = opsBBox(ops), px = (bb[0] + bb[2]) / 2, py = (bb[1] + bb[3]) / 2, an = animCode(s.anim, m ? -1 : 1, px, py), L = [];
    L.push("  c.save(); " + an.pre);
    if (s.op !== 1 || an.alpha) L.push(`  c.globalAlpha = ${r2(s.op)}${an.alpha};`);
    if (s.add) L.push('  c.globalCompositeOperation = "lighter";');
    L.push("  c.beginPath(); " + opsStr(ops));
    if (s.fmode !== "none" && s.fill) {
      if (s.fmode === "v") L.push(`  { const g = c.createLinearGradient(0, ${r2(bb[1])}, 0, ${r2(bb[3])}); g.addColorStop(0, "${s.fill}"); g.addColorStop(1, "${s.fill2}"); c.fillStyle = g; }`);
      else if (s.fmode === "r") L.push(`  { const g = c.createRadialGradient(${r2(px)}, ${r2(py)}, 0, ${r2(px)}, ${r2(py)}, ${r2(Math.max(bb[2] - bb[0], bb[3] - bb[1]) / 2 || 1)}); g.addColorStop(0, "${s.fill}"); g.addColorStop(1, "${s.fill2}"); c.fillStyle = g; }`);
      else L.push(`  c.fillStyle = "${s.fill}";`);
      L.push("  c.fill();");
    }
    if (s.stroke && s.sw > 0) L.push(`  c.lineWidth = ${r2(s.sw)}; c.strokeStyle = "${s.stroke}"; c.stroke();`);
    L.push("  c.restore();");
    out.push(`  /* ${s.name}${m ? " (gespiegelt)" : ""} */\n` + L.join("\n"));
  }
  return out.join("\n");
}
/* Rumpf der Zeichenfunktion: gleicher Text für Vorschau und Export, damit beides identisch aussieht */
function genBody(d) {
  const wob = d.wobble > 0;
  let o = `  t = t || 0;\n  const c = ${wob ? `sketchCtx(c0, ${r2(d.seed)}, ${r2(40 * d.wobble)})` : "c0"};\n  c0.save(); c0.translate(x, y); c0.scale(s / 40, s / 40); c0.lineJoin = c0.lineCap = "round";\n`;
  if (d.bounce > 0 || d.squash > 0) o += `  { const bo = Math.abs(Math.sin(t * 3)) * ${r2(d.bounce)}, sq = Math.sin(t * 5) * ${r2(d.squash)}; c0.translate(20, 40 - bo); c0.scale(1 + sq, 1 - sq); c0.translate(-20, -40); }\n`;
  o += d.shapes.filter(s => s.vis).map(shapeCode).join("\n") + "\n  c0.restore();\n";
  return o;
}
const genFunc = d => `/* ${d.name}: Export aus dem Tonlinge-Editor. Aufruf: ${nameId(d.name)}(ctx, x, y, groesse, t)  (x, y = linke obere Ecke, groesse = Pixel, t = Sekunden) */\nfunction ${nameId(d.name)}(c0, x, y, s, t) {\n${genBody(d)}}\n`;
let _fnCache = { src: "", fn: null };
function compile(d) {
  const src = genBody(d); if (_fnCache.src === src) return _fnCache.fn;
  try { _fnCache = { src, fn: new Function("c0", "x", "y", "s", "t", "sketchCtx", src) }; } catch (e) { console.error(e); _fnCache = { src, fn: () => { } }; }
  return _fnCache.fn;
}
const drawDoc = (ctx, d, x, y, s, t) => compile(d)(ctx, x, y, s, t, sketchCtx);

/* ===== SVG-Export: ein Aufnahme-Kontext, der dieselben Befehle in SVG-Pfade umsetzt ===== */
function svgRecorder() {
  const out = [], defs = []; let m = [1, 0, 0, 1, 0, 0], stack = [], d = [], gid = 0;
  const mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
  const P = (x, y) => r2(m[0] * x + m[2] * y + m[4]) + " " + r2(m[1] * x + m[3] * y + m[5]);
  const sc = () => Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));
  const grad = g => { const id = "g" + (gid++), st = g.stops.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"/>`).join("");
    if (g.t === "l") defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${P(g.a[0], g.a[1]).split(" ")[0]}" y1="${P(g.a[0], g.a[1]).split(" ")[1]}" x2="${P(g.a[2], g.a[3]).split(" ")[0]}" y2="${P(g.a[2], g.a[3]).split(" ")[1]}">${st}</linearGradient>`);
    else { const c = P(g.a[0], g.a[1]).split(" "); defs.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${c[0]}" cy="${c[1]}" r="${r2(g.a[5] * sc())}">${st}</radialGradient>`); } return `url(#${id})`; };
  const paint = v => v && typeof v === "object" ? grad(v) : v;
  const blend = o => o === "lighter" ? ' style="mix-blend-mode:plus-lighter"' : "";
  const rec = { fillStyle: "#000", strokeStyle: "#000", lineWidth: 1, globalAlpha: 1, globalCompositeOperation: "source-over", lineJoin: "round", lineCap: "round",
    save() { stack.push([m.slice(), this.globalAlpha, this.globalCompositeOperation]); }, restore() { const s = stack.pop(); if (s) { m = s[0]; this.globalAlpha = s[1]; this.globalCompositeOperation = s[2]; } },
    translate(x, y) { m = mul(m, [1, 0, 0, 1, x, y]); }, scale(x, y) { m = mul(m, [x, 0, 0, y, 0, 0]); }, rotate(a) { const c = Math.cos(a), s = Math.sin(a); m = mul(m, [c, s, -s, c, 0, 0]); },
    beginPath() { d = []; }, moveTo(x, y) { d.push("M" + P(x, y)); }, lineTo(x, y) { d.push("L" + P(x, y)); }, closePath() { d.push("Z"); },
    quadraticCurveTo(a, b, x, y) { d.push("Q" + P(a, b) + " " + P(x, y)); }, bezierCurveTo(a, b, c, e, x, y) { d.push("C" + P(a, b) + " " + P(c, e) + " " + P(x, y)); },
    ellipse(x, y, rx, ry, rot, a0, a1) { const co = Math.cos(rot), si = Math.sin(rot); for (let i = 0; i <= 48; i++) { const a = a0 + (a1 - a0) * i / 48, px = Math.cos(a) * rx, py = Math.sin(a) * ry; d.push((i ? "L" : "M") + P(x + px * co - py * si, y + px * si + py * co)); } d.push("Z"); },
    clip() { }, createLinearGradient(...a) { return { t: "l", a, stops: [], addColorStop(o, c) { this.stops.push([o, c]); } }; }, createRadialGradient(...a) { return { t: "r", a, stops: [], addColorStop(o, c) { this.stops.push([o, c]); } }; },
    fill() { out.push(`<path d="${d.join("")}" fill="${paint(this.fillStyle)}" opacity="${r2(this.globalAlpha)}"${blend(this.globalCompositeOperation)}/>`); },
    stroke() { out.push(`<path d="${d.join("")}" fill="none" stroke="${paint(this.strokeStyle)}" stroke-width="${r2(this.lineWidth * sc())}" stroke-linecap="round" stroke-linejoin="round" opacity="${r2(this.globalAlpha)}"${blend(this.globalCompositeOperation)}/>`); },
    result(name) { return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="400" height="400"><title>${name}</title><defs>${defs.join("")}</defs>${out.join("")}</svg>`; } };
  return rec;
}
const exportSVG = d => { const r = svgRecorder(); drawDoc(r, d, 0, 0, 40, 0); return r.result(d.name); };

/* ===== SVG-Import ===== */
function parseTransform(str) {
  let m = [1, 0, 0, 1, 0, 0]; const mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
  (str || "").replace(/(\w+)\(([^)]*)\)/g, (_, k, v) => { const a = v.split(/[\s,]+/).filter(Boolean).map(Number); let t = null;
    if (k === "translate") t = [1, 0, 0, 1, a[0] || 0, a[1] || 0]; else if (k === "scale") t = [a[0], 0, 0, a[1] == null ? a[0] : a[1], 0, 0]; else if (k === "matrix") t = a;
    else if (k === "rotate") { const r = (a[0] || 0) * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); t = [c, s, -s, c, 0, 0]; if (a.length > 2) t = mul(mul([1, 0, 0, 1, a[1], a[2]], t), [1, 0, 0, 1, -a[1], -a[2]]); }
    else if (k === "skewX") t = [1, 0, Math.tan(a[0] * Math.PI / 180), 1, 0, 0]; else if (k === "skewY") t = [1, Math.tan(a[0] * Math.PI / 180), 0, 1, 0, 0];
    if (t) m = mul(m, t); return ""; });
  return m;
}
function arcToBez(x1, y1, rx, ry, phi, fa, fs, x2, y2) {
  if (!rx || !ry) return [["lineTo", x2, y2]]; rx = Math.abs(rx); ry = Math.abs(ry); phi = phi * Math.PI / 180; const c = Math.cos(phi), s = Math.sin(phi);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2, x1p = c * dx + s * dy, y1p = -s * dx + c * dy, lam = x1p * x1p / (rx * rx) + y1p * y1p / (ry * ry); if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam); }
  const sg = fa === fs ? -1 : 1, num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p, den = rx * rx * y1p * y1p + ry * ry * x1p * x1p, co = sg * Math.sqrt(Math.max(0, num / den)), cxp = co * rx * y1p / ry, cyp = -co * ry * x1p / rx;
  const cx = c * cxp - s * cyp + (x1 + x2) / 2, cy = s * cxp + c * cyp + (y1 + y2) / 2, ang = (ux, uy, vx, vy) => { const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy); return a; };
  const th1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry); let dth = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!fs && dth > 0) dth -= TAU; else if (fs && dth < 0) dth += TAU;
  const n = Math.ceil(Math.abs(dth) / (Math.PI / 2)), out = [], dd = dth / n, t = 4 / 3 * Math.tan(dd / 4);
  for (let i = 0; i < n; i++) { const a1 = th1 + i * dd, a2 = a1 + dd, ca = Math.cos(a1), sa = Math.sin(a1), cb = Math.cos(a2), sb = Math.sin(a2);
    const P = (px, py) => [c * rx * px - s * ry * py + cx, s * rx * px + c * ry * py + cy]; const p1 = P(ca - t * sa, sa + t * ca), p2 = P(cb + t * sb, sb - t * cb), p3 = P(cb, sb); out.push(["bezierCurveTo", ...p1, ...p2, ...p3]); }
  return out;
}
function parsePathData(dstr) {
  const tok = dstr.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || [], ops = []; let i = 0, cmd = "", x = 0, y = 0, sx = 0, sy = 0, lc = null, lq = null;
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/[a-zA-Z]/.test(tok[i])) cmd = tok[i++]; const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), ox = rel ? x : 0, oy = rel ? y : 0;
    if (C === "Z") { ops.push(["closePath"]); x = sx; y = sy; lc = lq = null; continue; }
    if (C === "M") { x = ox + num(); y = oy + num(); sx = x; sy = y; ops.push(["moveTo", x, y]); cmd = rel ? "l" : "L"; lc = lq = null; }
    else if (C === "L") { x = ox + num(); y = oy + num(); ops.push(["lineTo", x, y]); lc = lq = null; }
    else if (C === "H") { x = ox + num(); ops.push(["lineTo", x, y]); lc = lq = null; }
    else if (C === "V") { y = oy + num(); ops.push(["lineTo", x, y]); lc = lq = null; }
    else if (C === "C") { const a = ox + num(), b = oy + num(), c2 = ox + num(), d2 = oy + num(); x = ox + num(); y = oy + num(); ops.push(["bezierCurveTo", a, b, c2, d2, x, y]); lc = [c2, d2]; lq = null; }
    else if (C === "S") { const a = lc ? 2 * x - lc[0] : x, b = lc ? 2 * y - lc[1] : y, c2 = ox + num(), d2 = oy + num(); x = ox + num(); y = oy + num(); ops.push(["bezierCurveTo", a, b, c2, d2, x, y]); lc = [c2, d2]; lq = null; }
    else if (C === "Q") { const a = ox + num(), b = oy + num(); x = ox + num(); y = oy + num(); ops.push(["quadraticCurveTo", a, b, x, y]); lq = [a, b]; lc = null; }
    else if (C === "T") { const a = lq ? 2 * x - lq[0] : x, b = lq ? 2 * y - lq[1] : y; x = ox + num(); y = oy + num(); ops.push(["quadraticCurveTo", a, b, x, y]); lq = [a, b]; lc = null; }
    else if (C === "A") { const rx = num(), ry = num(), ph = num(), fa = num(), fs = num(), nx = ox + num(), ny = oy + num(); arcToBez(x, y, rx, ry, ph, fa, fs, nx, ny).forEach(o => ops.push(o)); x = nx; y = ny; lc = lq = null; }
    else i++;
  }
  return ops;
}
function importSVG(text, addInk) {
  const dom = new DOMParser().parseFromString(text, "image/svg+xml"), root = dom.documentElement; if (!root || root.nodeName.toLowerCase() !== "svg") throw new Error("Keine SVG-Datei");
  const gradCol = {}; dom.querySelectorAll("linearGradient,radialGradient").forEach(g => { const st = g.querySelector("stop"); if (st) gradCol["#" + g.getAttribute("id")] = st.getAttribute("stop-color") || (st.getAttribute("style") || "").replace(/.*stop-color:\s*([^;]+).*/, "$1"); });
  const cv = document.createElement("canvas").getContext("2d"), norm = v => { if (!v || v === "none") return ""; const u = v.match(/url\(\s*['"]?(#[^)'"]+)/); if (u) v = gradCol[u[1]] || "#888888"; if (v === "currentColor") v = "#000000"; cv.fillStyle = "#000"; cv.fillStyle = v; return cv.fillStyle; };
  const list = [], mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
  const st = (el, k) => { const sty = el.getAttribute("style"); if (sty) { const m = sty.match(new RegExp("(?:^|;)\\s*" + k + "\\s*:\\s*([^;]+)")); if (m) return m[1].trim(); } return el.getAttribute(k); };
  const walk = (el, M, inh) => {
    const tag = el.nodeName.toLowerCase(); if (["defs", "clippath", "mask", "symbol", "title", "desc", "style", "lineargradient", "radialgradient", "metadata"].includes(tag)) return;
    const m = mul(M, parseTransform(el.getAttribute("transform"))), I = Object.assign({}, inh); ["fill", "stroke", "stroke-width", "opacity", "fill-opacity"].forEach(k => { const v = st(el, k); if (v != null && v !== "") I[k] = v; });
    let ops = null;
    if (tag === "path") ops = parsePathData(el.getAttribute("d") || "");
    else if (tag === "rect") { const x = +el.getAttribute("x") || 0, y = +el.getAttribute("y") || 0, w = +el.getAttribute("width"), h = +el.getAttribute("height"), r = Math.min(+el.getAttribute("rx") || +el.getAttribute("ry") || 0, w / 2, h / 2);
      ops = r ? [["moveTo", x + r, y], ["lineTo", x + w - r, y], ["quadraticCurveTo", x + w, y, x + w, y + r], ["lineTo", x + w, y + h - r], ["quadraticCurveTo", x + w, y + h, x + w - r, y + h], ["lineTo", x + r, y + h], ["quadraticCurveTo", x, y + h, x, y + h - r], ["lineTo", x, y + r], ["quadraticCurveTo", x, y, x + r, y], ["closePath"]] : [["moveTo", x, y], ["lineTo", x + w, y], ["lineTo", x + w, y + h], ["lineTo", x, y + h], ["closePath"]]; }
    else if (tag === "circle" || tag === "ellipse") { const cx = +el.getAttribute("cx") || 0, cy = +el.getAttribute("cy") || 0, rx = tag === "circle" ? +el.getAttribute("r") : +el.getAttribute("rx"), ry = tag === "circle" ? rx : +el.getAttribute("ry"), k = .5523;
      ops = [["moveTo", cx + rx, cy], ["bezierCurveTo", cx + rx, cy + ry * k, cx + rx * k, cy + ry, cx, cy + ry], ["bezierCurveTo", cx - rx * k, cy + ry, cx - rx, cy + ry * k, cx - rx, cy], ["bezierCurveTo", cx - rx, cy - ry * k, cx - rx * k, cy - ry, cx, cy - ry], ["bezierCurveTo", cx + rx * k, cy - ry, cx + rx, cy - ry * k, cx + rx, cy], ["closePath"]]; }
    else if (tag === "polygon" || tag === "polyline") { const n = (el.getAttribute("points") || "").trim().split(/[\s,]+/).map(Number); ops = []; for (let i = 0; i + 1 < n.length; i += 2) ops.push([i ? "lineTo" : "moveTo", n[i], n[i + 1]]); if (tag === "polygon") ops.push(["closePath"]); }
    else if (tag === "line") ops = [["moveTo", +el.getAttribute("x1") || 0, +el.getAttribute("y1") || 0], ["lineTo", +el.getAttribute("x2") || 0, +el.getAttribute("y2") || 0]];
    if (ops && ops.length > 1) {
      const sc = Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])); ops = opsMap(ops, (px, py) => [m[0] * px + m[2] * py + m[4], m[1] * px + m[3] * py + m[5]]);
      const fillRaw = I.fill == null ? "#000000" : I.fill, op = (I.opacity == null ? 1 : +I.opacity) * (I["fill-opacity"] == null ? 1 : +I["fill-opacity"]);
      list.push({ ops, fill: norm(fillRaw), stroke: norm(I.stroke), sw: I.stroke ? (parseFloat(I["stroke-width"]) || 1) * sc : 0, op: isNaN(op) ? 1 : op, grad: /url\(/.test(fillRaw) });
    }
    [...el.children].forEach(ch => walk(ch, m, I));
  };
  walk(root, [1, 0, 0, 1, 0, 0], {});
  if (!list.length) throw new Error("Keine Formen gefunden");
  let a = 1e9, b = 1e9, c = -1e9, e = -1e9; list.forEach(s => { const bb = opsBBox(s.ops); a = Math.min(a, bb[0]); b = Math.min(b, bb[1]); c = Math.max(c, bb[2]); e = Math.max(e, bb[3]); });
  const k = 34 / Math.max(c - a, e - b, 1e-6), ox = 20 - (a + c) / 2 * k, oy = 20 - (b + e) / 2 * k;
  return list.slice(0, 600).map((s, i) => newShape("svg", { name: "Import " + (i + 1), ops: opsMap(s.ops, (px, py) => [r2(px * k + ox), r2(py * k + oy)]), fill: s.fill || "#ffffff", fmode: s.fill ? "solid" : "none", fill2: "#ffffff",
    stroke: s.stroke ? s.stroke : (addInk ? INK : ""), sw: s.stroke ? Math.max(.6, r2(s.sw * k)) : (addInk ? 1.6 : 0), op: s.op }));
}
