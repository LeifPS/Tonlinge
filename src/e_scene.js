/* ===== Verzauberungs-Cutscene am Echoaltar =====
   Ablauf (Sekunden): 0 bis 0,8 Abdunkeln und Kinoleisten · 0,8 bis 2,0 der Echosplitter fliegt in den Altar · 1,4 bis 5,4 der Runenring dreht sich wie ein Rad und bremst genau auf der gewürfelten Verzauberung ·
   5,4 bis 5,9 Blitz und Schockwelle · danach Enthüllung mit Name, Wirkung und eigenen Partikeln. Klick oder Taste überspringt zur Enthüllung, ab 8 s schließt sie. */
const ECS = { on: false, t: 0, tick: null };
const ECS_RUNES = [
  [[-.3, -1, -.3, 1], [-.3, -.4, .5, -1], [-.3, .1, .5, -.5]], [[-.4, -1, -.4, 1], [-.4, -1, .4, -.2], [.4, -.2, .4, 1]], [[-.3, -1, -.3, 1], [-.3, -.5, .4, 0], [.4, 0, -.3, .5]],
  [[-.3, -1, -.3, 1], [-.3, -1, .4, -.4], [-.3, -.2, .4, .4]], [[-.3, -1, -.3, 1], [-.3, -1, .4, -.4], [.4, -.4, -.3, 0], [-.3, 0, .4, 1]], [[.4, -.8, -.3, 0], [-.3, 0, .4, .8]],
  [[-.4, -1, .4, 1], [.4, -1, -.4, 1]], [[-.3, -1, -.3, 1], [-.3, -1, .4, -.4], [.4, -.4, -.3, .1]], [[-.4, -1, -.4, 1], [.4, -1, .4, 1], [-.4, -.2, .4, .2]],
  [[0, -1, .5, -.3], [.5, -.3, -.1, .2], [-.1, .2, .5, 1], [0, -1, -.5, -.3], [-.5, -.3, .1, .2], [.1, .2, -.5, 1]]
];
function ecsGlyph(c, i, x, y, r, col, a, glow) {
  c.save(); c.translate(x, y); c.globalAlpha = a;
  if (glow) { const g = c.createRadialGradient(0, 0, r * .3, 0, 0, r * 2.4); g.addColorStop(0, col + "cc"); g.addColorStop(1, col + "00"); c.fillStyle = g; c.fillRect(-r * 2.4, -r * 2.4, r * 4.8, r * 4.8); }
  c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = Math.max(2, r * .16); c.lineJoin = "round"; c.beginPath(); c.moveTo(0, -r * 1.25); c.lineTo(r * .95, 0); c.lineTo(0, r * 1.25); c.lineTo(-r * .95, 0); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = "rgba(255,255,255,.92)"; c.lineWidth = Math.max(1.6, r * .13); c.lineCap = "round"; c.beginPath(); for (const l of ECS_RUNES[i % ECS_RUNES.length]) { c.moveTo(l[0] * r * .5, l[1] * r * .62); c.lineTo(l[2] * r * .5, l[3] * r * .62); } c.stroke();
  c.restore();
}
function enchantCutscene(id, key, done) {
  const e = ENCH[key], idx = ENCH_IDS.indexOf(key), N = ENCH_IDS.length, ins = INSTR[id], ic = kindIcon(ins.kind) || "flute";
  const cv = document.createElement("canvas"); cv.id = "ecs"; cv.style.cssText = "position:fixed;left:0;top:0;width:100%;height:100%;z-index:9500;cursor:pointer;touch-action:none;background:#04061a"; document.body.appendChild(cv);
  const c = cv.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1); let W = 0, H = 0;
  const fit = () => { if (W !== innerWidth || H !== innerHeight) { W = innerWidth; H = innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); } };
  const T_RELIC = 0.8, T_HIT = 2.0, T_SPIN0 = 1.4, T_LAND = 5.4, T_FLASH = 5.4, T_REV = 5.9, T_CLOSE = 8.2, TURNS = 5;
  const thEnd = Math.PI / 2 - 2 * Math.PI * idx / N; // Verzauberung landet vorn
  const stars = Array.from({ length: 110 }, () => ({ x: Math.random(), y: Math.random(), s: .4 + Math.random() * 1.6, p: Math.random() * 6.28 }));
  let P = [], t = 0, shake = 0, lastTick = -1, lastFront = -1, lastIdx = -1, hit = false, flashed = false, revealed = false, closing = 0, ended = false, ambAcc = 0, ctl = 0;
  const ease = u => u * u * (3 - 2 * u), cl = (u, a = 0, b = 1) => Math.max(a, Math.min(b, u));
  const add = (o) => P.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, life: 1, max: 1, size: 4, col: "#fff", g: 0, drag: 0, shape: "dot", rot: 0, vr: 0 }, o, { max: o.life || 1 }));
  const burst = (x, y, n, col, sp, life, size, shape) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = sp * (.3 + Math.random() * .9); add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: life * (.6 + Math.random() * .8), size: size * (.5 + Math.random()), col, drag: 1.1, shape: shape || "dot", rot: Math.random() * 6.28, vr: (Math.random() - .5) * 6 }); } };
  const snd = (f) => { try { f(); } catch (er) {} };
  const frontIdx = th => { let best = 0, bd = 9; for (let i = 0; i < N; i++) { let a = ((2 * Math.PI * i / N + th - Math.PI / 2) % 6.2832 + 6.2832) % 6.2832; if (a > 3.1416) a -= 6.2832; if (Math.abs(a) < bd) { bd = Math.abs(a); best = i; } } return best; };
  const theta = tt => { const u = cl((tt - T_SPIN0) / (T_LAND - T_SPIN0)); return thEnd - TURNS * 2 * Math.PI * Math.pow(1 - u, 3); };
  function skip() { if (t < T_FLASH) { t = T_FLASH - .02; } else if (t >= T_CLOSE && !closing) closing = .0001; }
  function finish() { if (ended) return; ended = true; ECS.on = false; ECS.tick = null; window.removeEventListener("keydown", onKey, true); cv.remove(); if (done) done(); }
  const onKey = ev => { const k = ev.key.toLowerCase(); if (["escape", "enter", " ", "e"].includes(k)) { ev.stopPropagation(); ev.preventDefault(); skip(); } else { ev.stopPropagation(); } };
  cv.addEventListener("pointerdown", ev => { ev.preventDefault(); skip(); }); window.addEventListener("keydown", onKey, true);
  ECS.on = true; ECS.t = 0; snd(() => Snd.init());
  const mixW = (h, k) => { const n = parseInt(h.slice(1), 16), f = v => Math.round(v + (255 - v) * k).toString(16).padStart(2, "0"); return "#" + f(n >> 16) + f((n >> 8) & 255) + f(n & 255); }, col = mixW(e.col, .38), K0 = () => Math.min(W, H) / 700, CY = () => H * .40;

  function ambient(dt, cx, cy, K) {
    ambAcc += dt; const r = () => Math.random();
    const every = (iv, fn) => { while (ambAcc >= iv) { ambAcc -= iv; fn(); } };
    switch (key) {
      case "stetig": every(.35, () => add({ x: cx, y: cy + 10 * K, life: 2.2, size: 20 * K, col, shape: "ring", vx: 0, vy: 0, vr: 0, g: 0, drag: 0, rot: 0 })); break;
      case "hellhoerig": every(.16, () => add({ x: cx, y: cy, life: 1.2, size: 10 * K, col, shape: "ring", g: 0 })); break;
      case "taktvoll": every(.5, () => { add({ x: cx, y: cy, life: .9, size: 24 * K, col, shape: "ring" }); burst(cx, cy, 10, col, 220 * K, .7, 4 * K); }); break;
      case "ruhig": every(.12, () => add({ x: cx + (r() - .5) * 420 * K, y: cy - 220 * K, vy: 40 * K + r() * 30 * K, vx: (r() - .5) * 10, life: 4, size: (6 + r() * 8) * K, col, shape: "orb" })); break;
      case "glueckhaft": every(.07, () => add({ x: cx + (r() - .5) * 520 * K, y: cy - 260 * K, vy: 120 * K + r() * 90 * K, vx: (r() - .5) * 30, life: 3.4, size: (6 + r() * 6) * K, col: r() < .5 ? "#f6c82a" : "#fff3a0", shape: r() < .35 ? "clover" : "coin", vr: (r() - .5) * 6 })); break;
      case "mutiert": every(.03, () => { const a = ctl * 3, rr = 40 * K + r() * 20 * K; add({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr * .8, vx: Math.cos(a + 1.5) * 150 * K, vy: Math.sin(a + 1.5) * 120 * K, life: 1.6, size: (5 + r() * 5) * K, col: r() < .5 ? col : "#b46aff", shape: "orb", drag: .4 }); }); break;
      case "einsicht": every(.1, () => add({ x: cx + (r() - .5) * 200 * K, y: cy + 120 * K, vy: -(90 + r() * 80) * K, life: 2.4, size: (4 + r() * 5) * K, col: r() < .5 ? col : "#e6ffd0", shape: "star", vr: 2 })); break;
      case "qualitaet": every(.05, () => add({ x: cx + (r() - .5) * 320 * K, y: cy + 140 * K, vy: -(80 + r() * 110) * K, vx: (r() - .5) * 20, life: 2.6, size: (5 + r() * 7) * K, col: r() < .6 ? col : "#d8ffd0", shape: "star", vr: 3 })); break;
      case "doppelklang": every(.16, () => add({ x: cx + (r() - .5) * 300 * K, y: cy + 100 * K, vy: -(60 + r() * 60) * K, vx: (r() - .5) * 20, life: 2.4, size: (7 + r() * 5) * K, col: r() < .5 ? "#e6edf8" : col, shape: "note" })); break;
      case "runenklang": every(.09, () => { const a = r() * 6.283, rr = (90 + r() * 120) * K; add({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr * .7, vy: -30 * K, life: 2.2, size: (7 + r() * 6) * K, col: r() < .5 ? col : "#7aa8ff", shape: "rune", rot: Math.floor(r() * 10) }); }); break;
    }
  }
  function drawParticle(p, a) {
    c.save(); c.translate(p.x, p.y); c.globalAlpha = Math.max(0, a); const s = p.size;
    switch (p.shape) {
      case "ring": { const u = 1 - p.life / p.max; c.strokeStyle = p.col; c.lineWidth = Math.max(1.5, s * .12 * (1 - u)); c.globalAlpha = (1 - u) * .8; c.beginPath(); c.ellipse(0, 0, s * (1 + u * 9), s * (1 + u * 9) * .38, 0, 0, 7); c.stroke(); break; }
      case "orb": { const g = c.createRadialGradient(0, 0, 0, 0, 0, s); g.addColorStop(0, p.col); g.addColorStop(1, p.col + "00"); c.fillStyle = g; c.beginPath(); c.arc(0, 0, s, 0, 7); c.fill(); break; }
      case "star": { c.rotate(p.rot); c.fillStyle = p.col; c.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? s * .35 : s; const aa = i * Math.PI / 4; c.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } c.closePath(); c.fill(); break; }
      case "coin": { c.rotate(p.rot * .3); c.scale(Math.abs(Math.cos(p.rot)), 1); c.fillStyle = p.col; c.strokeStyle = INK; c.lineWidth = Math.max(1, s * .2); c.beginPath(); c.arc(0, 0, s, 0, 7); c.fill(); c.stroke(); break; }
      case "clover": { c.rotate(p.rot * .4); c.fillStyle = "#58c85a"; c.strokeStyle = INK; c.lineWidth = Math.max(1, s * .15); for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(Math.cos(i * 1.571) * s * .55, Math.sin(i * 1.571) * s * .55, s * .55, 0, 7); c.fill(); c.stroke(); } break; }
      case "note": { c.fillStyle = p.col; c.strokeStyle = INK; c.lineWidth = Math.max(1, s * .18); c.beginPath(); c.ellipse(0, 0, s * .6, s * .45, -.4, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(s * .5, -s * .1); c.lineTo(s * .5, -s * 1.3); c.lineTo(s * 1.1, -s * 1.0); c.stroke(); break; }
      case "rune": { ecsGlyph(c, Math.floor(p.rot), 0, 0, s, p.col, a, false); break; }
      default: c.fillStyle = p.col; c.beginPath(); c.arc(0, 0, s, 0, 7); c.fill();
    }
    c.restore();
  }
  function draw(dt) {
    fit(); const K = K0(), cx = W / 2, cy = CY(), bars = ease(cl(t / .7)) * H * .1;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalAlpha = 1;
    // Abdunkeln der Welt
    c.fillStyle = "#04061a"; c.fillRect(0, 0, W, H);
    c.save(); if (shake > 0) c.translate((Math.random() - .5) * shake * 14, (Math.random() - .5) * shake * 14);
    const charge = cl((t - T_HIT) / (T_LAND - T_HIT)) * (t < T_FLASH ? 1 : 0), rv = t >= T_FLASH ? cl((t - T_FLASH) / .8) : 0;
    // Himmelsglühen
    const gc = t >= T_FLASH ? col : "#5a7aff", gI = t < T_HIT ? .1 : t < T_FLASH ? .14 + charge * .3 : .38 + .1 * Math.sin(t * 2);
    const bg = c.createRadialGradient(cx, cy + 20 * K, 10, cx, cy + 20 * K, Math.max(W, H) * .7); bg.addColorStop(0, gc + Math.round(gI * 255).toString(16).padStart(2, "0")); bg.addColorStop(1, "#04061a00"); c.fillStyle = bg; c.fillRect(0, 0, W, H);
    for (const s of stars) { const tw = .4 + .6 * Math.abs(Math.sin(t * 1.3 + s.p)); c.globalAlpha = tw * cl(t / 1.2) * .8; c.fillStyle = "#cfe0ff"; c.fillRect(s.x * W, ((s.y * H) + t * 5 * s.s) % H, s.s, s.s); } c.globalAlpha = 1;
    // Strahlen bei der Enthüllung (Einsicht: besonders)
    if (t >= T_FLASH && (key === "einsicht" || key === "qualitaet" || key === "glueckhaft")) { c.save(); c.translate(cx, cy - 10 * K); c.rotate(t * .25); c.globalAlpha = .22 * rv; c.fillStyle = col; for (let i = 0; i < 14; i++) { c.rotate(Math.PI / 7); c.beginPath(); c.moveTo(0, 0); c.lineTo(-24 * K, -520 * K); c.lineTo(24 * K, -520 * K); c.closePath(); c.fill(); } c.restore(); }
    // Altar
    c.save(); c.translate(cx, cy + 114 * K); c.scale(3.5 * K, 3.5 * K); drawAltar(c, 0, 0, t); c.restore();
    // Runenring (hintere Hälfte zuerst)
    const ringA = ease(cl((t - 1.0) / .8)) * (t < T_FLASH ? 1 : Math.max(0, 1 - (t - T_FLASH) / .6)), th = t < T_FLASH ? theta(t) : thEnd, rx = 250 * K, ry = 62 * K, rcy = cy + 30 * K;
    const pos = i => { const a = 2 * Math.PI * i / N + th; return { a, x: cx + Math.cos(a) * rx, y: rcy + Math.sin(a) * ry, z: Math.sin(a) }; };
    const fi = frontIdx(th);
    const glyphs = ECS_RUNES.map((_, i) => Object.assign(pos(i), { i })).sort((p, q) => p.z - q.z);
    const drawGl = g => { const near = g.i === fi && t >= T_SPIN0 + 1.2, sz = 18 * K * (1 + .32 * g.z) * (near ? 1.35 : 1); ecsGlyph(c, g.i, g.x, g.y, sz, mixW(ENCH[ENCH_IDS[g.i]].col, .3), ringA * (.45 + .55 * (g.z + 1) / 2), near || (t >= T_FLASH && g.i === idx)); };
    glyphs.filter(g => g.z < 0).forEach(drawGl);
    // Instrument
    const bob = Math.sin(t * 2) * 6 * K, ix = cx, iy = cy - 70 * K + bob, big = t >= T_FLASH ? 1 + .1 * Math.sin((t - T_FLASH) * 3) : 1 + charge * .12;
    const aura = c.createRadialGradient(ix, iy, 8 * K, ix, iy, 150 * K); const ac = t >= T_FLASH ? col : "#8fb0ff"; aura.addColorStop(0, ac + (t >= T_FLASH ? "aa" : Math.round((.2 + charge * .5) * 255).toString(16).padStart(2, "0"))); aura.addColorStop(1, ac + "00"); c.fillStyle = aura; c.fillRect(ix - 160 * K, iy - 160 * K, 320 * K, 320 * K);
    if (t >= T_FLASH && key === "doppelklang") { c.save(); c.globalAlpha = .35 + .2 * Math.sin(t * 4); c.translate(ix + Math.sin(t * 2) * 46 * K, iy + 6 * K); c.rotate(.12); drawIcon(c, ic, -64 * K * big, -64 * K * big, 128 * K * big); c.restore(); }
    c.save(); c.translate(ix, iy); c.rotate(Math.sin(t * 1.5) * .06); if (t < T_FLASH) c.globalAlpha = cl(t / .8); drawIcon(c, ic, -64 * K * big, -64 * K * big, 128 * K * big);
    if (t >= T_FLASH && key === "qualitaet") { const sw = ((t - T_FLASH) * .8) % 2 - .5; c.globalCompositeOperation = "lighter"; c.fillStyle = "rgba(210,255,200,.35)"; c.save(); c.rotate(.5); c.fillRect(sw * 200 * K - 20 * K, -100 * K, 26 * K, 200 * K); c.restore(); }
    c.restore();
    glyphs.filter(g => g.z >= 0).forEach(drawGl);
    // Echosplitter im Flug
    if (t >= T_RELIC && t < T_HIT + .15) { const u = cl((t - T_RELIC) / (T_HIT - T_RELIC)), e1 = ease(u), sx = cx - 300 * K, sy = H + 30 * K, ex = ix, ey = iy, qx = cx - 360 * K, qy = cy - 160 * K;
      const bx = (1 - e1) * (1 - e1) * sx + 2 * (1 - e1) * e1 * qx + e1 * e1 * ex, by = (1 - e1) * (1 - e1) * sy + 2 * (1 - e1) * e1 * qy + e1 * e1 * ey;
      if (u < 1) { add({ x: bx + (Math.random() - .5) * 12, y: by + (Math.random() - .5) * 12, vx: (Math.random() - .5) * 40, vy: 30 + Math.random() * 40, life: .7, size: (3 + Math.random() * 4) * K, col: "#8fb0ff", shape: "orb" }); const g = c.createRadialGradient(bx, by, 2, bx, by, 46 * K); g.addColorStop(0, "rgba(160,190,255,.9)"); g.addColorStop(1, "rgba(160,190,255,0)"); c.fillStyle = g; c.fillRect(bx - 50 * K, by - 50 * K, 100 * K, 100 * K); c.save(); c.translate(bx, by); c.rotate(t * 6); drawIcon(c, "shard", -22 * K, -22 * K, 44 * K); c.restore(); } }
    // Auftreffen
    if (!hit && t >= T_HIT) { hit = true; burst(ix, iy, 46, "#9ab8ff", 340 * K, 1.2, 5 * K, "star"); add({ x: ix, y: iy + 40 * K, life: 1, size: 20 * K, col: "#9ab8ff", shape: "ring" }); shake = .6; snd(() => { Snd.play("quest", 1.7, .5); Snd.melody("harfe", [7, 11, 14, 19], .09, .55, 1.4); }); }
    // Rad-Ticks
    if (t >= T_SPIN0 && t < T_LAND) { if (fi !== lastFront) { lastFront = fi; if (t - lastTick > .035) { lastTick = t; const u = cl((t - T_SPIN0) / (T_LAND - T_SPIN0)); snd(() => Snd.tick(.22 + .1 * u, 700 + 900 * (1 - u) + fi * 40, .04)); } } }
    // Auflösung des Wortes unter dem Ring
    if (t >= T_SPIN0 + .4 && t < T_FLASH) { const g = ENCH[ENCH_IDS[fi]], u = cl((t - T_SPIN0) / (T_LAND - T_SPIN0)); c.save(); c.textAlign = "center"; c.font = `900 ${Math.round((34 + 20 * u) * K)}px 'Caveat Brush',cursive`; c.lineWidth = 6 * K; c.strokeStyle = INK; c.fillStyle = mixW(g.col, .3); c.globalAlpha = .5 + .5 * u; c.lineJoin = "round"; c.strokeText(g.n, cx, cy + 178 * K); c.fillText(g.n, cx, cy + 178 * K); c.restore(); }
    // Partikel
    for (const p of P) drawParticle(p, p.shape === "ring" ? 1 : Math.min(1, p.life / p.max * 2.2));
    // Schockwelle und Blitz
    if (t >= T_FLASH && t < T_FLASH + .9) { const u = (t - T_FLASH) / .9; c.save(); c.strokeStyle = col; c.lineWidth = 16 * K * (1 - u); c.globalAlpha = 1 - u; c.beginPath(); c.ellipse(ix, rcy + 40 * K, 60 * K + u * 700 * K, (60 * K + u * 700 * K) * .3, 0, 0, 7); c.stroke(); c.strokeStyle = "#fff"; c.lineWidth = 6 * K * (1 - u); c.beginPath(); c.ellipse(ix, rcy + 40 * K, 40 * K + u * 560 * K, (40 * K + u * 560 * K) * .3, 0, 0, 7); c.stroke(); c.restore(); }
    c.restore();
    if (t >= T_FLASH && t < T_FLASH + .6) { const u = (t - T_FLASH) / .6; c.fillStyle = `rgba(255,255,255,${(1 - u) * (1 - u) * .95})`; c.fillRect(0, 0, W, H); }
    // Enthüllung: Text
    if (t >= T_FLASH + .25) {
      const u = cl((t - T_FLASH - .25) / 1.0), name = e.n + "!", letters = Math.floor(cl((t - T_FLASH - .35) / (.07 * name.length)) * name.length), fs = Math.round(Math.min(W / (name.length * .55), 100 * K));
      c.save(); c.textAlign = "center"; c.lineJoin = "round"; c.lineWidth = fs * .14; c.strokeStyle = INK; c.fillStyle = col;
      c.translate(cx, cy + 205 * K); const sc = 1 + (1 - ease(u)) * .5; c.scale(sc, sc); c.globalAlpha = ease(u); c.font = `900 ${fs}px 'Caveat Brush',cursive`; const shown = name.slice(0, letters);
      c.shadowColor = col; c.shadowBlur = 26 * K; c.strokeText(shown, 0, 0); c.fillText(shown, 0, 0); c.shadowBlur = 0; c.restore();
      const u2 = cl((t - T_FLASH - 1.1) / .8); if (u2 > 0) { c.save(); c.textAlign = "center"; c.globalAlpha = ease(u2); c.font = `${Math.round(30 * K)}px 'Caveat Brush',cursive`; c.fillStyle = "#e8eefc"; c.strokeStyle = INK; c.lineWidth = 5 * K; c.lineJoin = "round"; const lines = wrapTxt(e.d, W * .8, c); lines.forEach((l, k) => { c.strokeText(l, cx, cy + 250 * K + k * 34 * K); c.fillText(l, cx, cy + 250 * K + k * 34 * K); }); c.font = `${Math.round(26 * K)}px 'Caveat Brush',cursive`; c.fillStyle = col; c.strokeText(e.n + " " + ins.name, cx, cy - 172 * K); c.fillText(e.n + " " + ins.name, cx, cy - 172 * K); c.restore(); }
      if (t >= T_CLOSE) { c.save(); c.textAlign = "center"; c.globalAlpha = .5 + .5 * Math.sin(t * 4); c.font = `${Math.round(22 * K)}px 'Caveat Brush',cursive`; c.fillStyle = "#c8d4f0"; c.fillText("Klicken zum Schließen", cx, H - bars - 14 * K); c.restore(); }
    }
    // Kinoleisten
    c.fillStyle = "#000"; c.fillRect(0, 0, W, bars); c.fillRect(0, H - bars, W, bars);
    if (closing) { c.fillStyle = `rgba(0,0,0,${cl(closing / .5)})`; c.fillRect(0, 0, W, H); }
  }
  function wrapTxt(s, mw, ctx) { const w = s.split(" "), out = []; let l = ""; for (const x of w) { const tt = l ? l + " " + x : x; if (ctx.measureText(tt).width > mw && l) { out.push(l); l = x; } else l = tt; } if (l) out.push(l); return out; }
  ECS.tick = dt => {
    if (ended) return; dt = Math.min(dt, .05); const prev = t; t += dt; ECS.t = t; ctl += dt; shake = Math.max(0, shake - dt * 1.4);
    if (t < T_FLASH && t > T_SPIN0) shake = Math.max(shake, .06 + .35 * cl((t - T_SPIN0) / (T_LAND - T_SPIN0)) * .5);
    if (!flashed && t >= T_FLASH) { flashed = true; shake = 1.2; const K = K0(); burst(W / 2, CY() - 70 * K, 120, col, 560 * K, 1.8, 6 * K, "star"); burst(W / 2, CY() - 70 * K, 60, "#ffffff", 420 * K, 1.2, 4 * K); snd(() => { Snd.play("tor", 1.2, .9, 1.4); Snd.play("quest", 1.5, .7); }); }
    if (!revealed && t >= T_FLASH + .5) { revealed = true; snd(() => { Snd.melody("harfe", [0, 4, 7, 12, 16], .11, .7, 1.1); }); }
    if (t >= T_FLASH + .6) ambient(dt, W / 2, CY() - 70 * K0(), K0());
    if (closing) { closing += dt; if (closing > .5) { finish(); return; } }
    for (const p of P) { p.life -= dt; p.vy += p.g * dt; const dr = Math.exp(-p.drag * dt); p.vx *= dr; p.vy *= dr; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; } P = P.filter(p => p.life > 0);
    draw(dt);
  };
  const loop = (now) => { if (ended) return; if (!loop.l) loop.l = now; ECS.tick((now - loop.l) / 1000); loop.l = now; requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  ECS.tick(0);
}
