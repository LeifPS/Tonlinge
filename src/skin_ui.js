/* ===== Eigene Stimm- und Fang-Oberflächen der glorreichen Skins (komplett anders gebaut, gleiche Maße und Regeln) ===== */
const skSid = () => { const s = skinOf(S.eq); return s ? s.id : ""; };
const skRR = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath(); };
const skMoon = (c, x, y, r, ph, col) => { c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip(); c.fillStyle = col; c.fillRect(x - r, y - r, 2 * r, 2 * r); if (ph < 1) { c.fillStyle = "rgba(18,22,66,.97)"; c.beginPath(); c.arc(x - 2 * r * Math.max(0, ph), y, r * 1.02, 0, 7); c.fill(); } c.restore(); c.beginPath(); c.arc(x, y, r, 0, 7); c.lineWidth = 1.8; c.strokeStyle = INK; c.stroke(); };

/* Stimmen: Wellenfeld, Töne, Schieber */
function skFreqUI(c, g) {
  const sid = skSid(), t = g.t, { x0, ytop, ybot, W, cy, nz, y1, y2, ux, hy, cx } = g, h = ybot - ytop, q = Math.floor(t * 12);
  c.save(); c.lineCap = c.lineJoin = "round";
  if (sid === "sphaeren") {
    // Fenster einer Sternwarte: gewölbter Rahmen in Gold, Sternenhimmel mit Parallaxe
    c.beginPath(); c.moveTo(x0, ybot); c.lineTo(x0, ytop + 22); c.quadraticCurveTo(x0, ytop - 6, x0 + 40, ytop); c.lineTo(x0 + W - 40, ytop); c.quadraticCurveTo(x0 + W, ytop - 6, x0 + W, ytop + 22); c.lineTo(x0 + W, ybot); c.closePath();
    const bg = c.createLinearGradient(0, ytop, 0, ybot); bg.addColorStop(0, "rgba(20,22,78,.97)"); bg.addColorStop(1, "rgba(52,30,110,.95)"); c.fillStyle = bg; c.fill(); c.save(); c.clip();
    for (let i = 0; i < 46; i++) { const sp = .6 + skHs(i, 3, 2) * 1.4, x = x0 + ((skHs(i, 1, 2) * W - t * 6 * sp) % W + W) % W, y = ytop + 4 + skHs(i, 2, 2) * (h - 8), tw = .5 + .5 * Math.sin(t * 3 + i); c.globalAlpha = .35 + tw * .65; c.fillStyle = i % 5 ? "#e8eeff" : "#ffe27a"; c.beginPath(); c.arc(x, y, .7 + skHs(i, 4, 2) * 1.1, 0, 7); c.fill(); }
    c.globalAlpha = 1; c.globalCompositeOperation = "lighter"; const ng = c.createRadialGradient(x0 + W * .72, cy, 4, x0 + W * .72, cy, 120); ng.addColorStop(0, "rgba(130,90,255,.25)"); ng.addColorStop(1, "rgba(130,90,255,0)"); c.fillStyle = ng; c.fillRect(x0, ytop, W, h);
    // Sternenfaden als Welle
    const col = nz > .3 ? "#ffb59a" : "#d8e4ff"; c.strokeStyle = col; c.shadowColor = col; c.shadowBlur = 10; c.lineWidth = 1.8; c.beginPath(); const pts = []; for (let i = 0; i <= W; i += 3) { const ph = i / W * Math.PI * 2 * 3 + t * 2.4, rnd = (skHs(i, q, 3) - .5) * 2, y = cy - (Math.sin(ph) * 32 * (1 - nz * .35) + rnd * nz * 30 + Math.sin(i * .33 + t * 11) * nz * 9); i ? c.lineTo(x0 + i, y) : c.moveTo(x0 + i, y); if (i % 36 === 0) pts.push([x0 + i, y]); } c.stroke(); c.shadowBlur = 0; pts.forEach((p, i) => skStar(c, p[0], p[1], 3 + (i % 3), i % 2 ? "#ffe27a" : "#fff")); c.restore();
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, ybot); c.lineTo(x0, ytop + 22); c.quadraticCurveTo(x0, ytop - 6, x0 + 40, ytop); c.lineTo(x0 + W - 40, ytop); c.quadraticCurveTo(x0 + W, ytop - 6, x0 + W, ytop + 22); c.lineTo(x0 + W, ybot); c.closePath(); c.stroke(); c.strokeStyle = "#ffe27a"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x0 + 5, ybot - 3); c.lineTo(x0 + 5, ytop + 24); c.quadraticCurveTo(x0 + 5, ytop + 3, x0 + 42, ytop + 5); c.lineTo(x0 + W - 42, ytop + 5); c.quadraticCurveTo(x0 + W - 5, ytop + 3, x0 + W - 5, ytop + 24); c.lineTo(x0 + W - 5, ybot - 3); c.stroke();
    // Mondphasen für die drei Töne
    for (let i = 0; i < 3; i++) { const mx = cx + (i - 1) * 34, my = ytop - 18, done = i < g.gi; skMoon(c, mx, my, 11, done ? 1 : i === g.gi ? .35 + .15 * Math.sin(t * 4) : 0, "#ffe27a"); if (done) { c.globalCompositeOperation = "lighter"; skStar(c, mx + 9, my - 9, 4, "#fff"); c.globalCompositeOperation = "source-over"; } }
    // Schieber als Umlaufbahn
    const oy = (y1 + y2) / 2, orx = W / 2, ory = (y2 - y1) / 2 + 4; c.strokeStyle = "rgba(30,30,100,.9)"; c.lineWidth = 7; c.beginPath(); c.ellipse(x0 + W / 2, oy, orx, ory, 0, 0, 7); c.stroke(); c.strokeStyle = "#9fb4ff"; c.lineWidth = 1.8; c.setLineDash([2, 6]); c.beginPath(); c.ellipse(x0 + W / 2, oy, orx, ory, 0, 0, 7); c.stroke(); c.setLineDash([]); c.strokeStyle = INK; c.lineWidth = 1.4; c.beginPath(); c.ellipse(x0 + W / 2, oy, orx + 4, ory + 4, 0, 0, 7); c.stroke();
    for (let k = 1; k < 10; k++) { c.fillStyle = "rgba(220,230,255,.8)"; c.beginPath(); c.arc(x0 + W * k / 10, oy, 1.6, 0, 7); c.fill(); }
    if (g.lock > 0) { const n = Math.floor(14 * g.lock / .7); for (let i = 0; i < n; i++) skStar(c, x0 + 12 + (W - 24) * i / 13, y2 + 8, 3, "#ffe27a"); }
    // Griff: Planet mit Ring
    c.globalCompositeOperation = "lighter"; const pg = c.createRadialGradient(ux, hy, 2, ux, hy, 32); pg.addColorStop(0, nz === 0 ? "rgba(255,226,122,.6)" : "rgba(180,200,255,.45)"); pg.addColorStop(1, "rgba(180,200,255,0)"); c.fillStyle = pg; c.beginPath(); c.arc(ux, hy, 32, 0, 7); c.fill(); c.globalCompositeOperation = "source-over";
    c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.arc(ux, hy, 9, 0, 7); c.fillStyle = nz === 0 ? "#ffe27a" : "#c8b8ff"; c.fill(); c.stroke(); c.beginPath(); c.ellipse(ux, hy, 17, 5, -.35, 0, 7); c.strokeStyle = INK; c.lineWidth = 4; c.stroke(); c.strokeStyle = "#fff6c0"; c.lineWidth = 2; c.stroke();
    c.strokeStyle = "rgba(220,230,255,.8)"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(ux, hy + 10); c.lineTo(ux, y2 + 3); c.stroke();
  } else if (sid === "gesprochen") {
    // Pergamentseite: Linien, Federstrich als Welle, Siegel für die Töne, Feder als Griff
    skRR(c, x0, ytop, W, h, 10); const bg = c.createLinearGradient(0, ytop, 0, ybot); bg.addColorStop(0, "rgba(252,244,222,.98)"); bg.addColorStop(1, "rgba(238,222,186,.98)"); c.fillStyle = bg; c.fill(); c.save(); c.clip();
    c.strokeStyle = "rgba(160,120,60,.28)"; c.lineWidth = 1; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(x0, ytop + h * i / 6); c.lineTo(x0 + W, ytop + h * i / 6); c.stroke(); }
    c.fillStyle = "rgba(160,120,60,.18)"; for (let i = 0; i < 30; i++) { c.beginPath(); c.arc(x0 + skHs(i, 1, 2) * W, ytop + skHs(i, 2, 2) * h, .8 + skHs(i, 3, 2) * 1.4, 0, 7); c.fill(); }
    const col = nz > .3 ? "#c8329a" : INK; c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); for (let i = 0; i <= W; i += 3) { const ph = i / W * Math.PI * 2 * 3 + t * 2.4, rnd = (skHs(i, q, 3) - .5) * 2, y = cy - (Math.sin(ph) * 32 * (1 - nz * .35) + rnd * nz * 30 + Math.sin(i * .33 + t * 11) * nz * 9); i ? c.lineTo(x0 + i, y) : c.moveTo(x0 + i, y); } c.stroke();
    c.save(); c.globalCompositeOperation = "multiply"; c.strokeStyle = nz > .3 ? "rgba(255,110,199,.5)" : "rgba(47,224,208,.45)"; c.lineWidth = 8; c.stroke(); c.restore();
    c.fillStyle = INK; for (let i = 0; i < 5; i++) { const dx = x0 + 20 + skHs(i, 1, 8) * (W - 40); c.globalAlpha = .6; c.beginPath(); c.arc(dx, ybot - 6 - skHs(i, 2, 8) * 8, 1.5 + skHs(i, 3, 8) * 1.5, 0, 7); c.fill(); } c.globalAlpha = 1; c.restore();
    c.strokeStyle = INK; c.lineWidth = 3; skRR(c, x0, ytop, W, h, 10); c.stroke(); c.strokeStyle = "#e0a930"; c.lineWidth = 1.2; skRR(c, x0 + 4, ytop + 4, W - 8, h - 8, 7); c.stroke();
    for (let i = 0; i < 3; i++) { const mx = cx + (i - 1) * 34, my = ytop - 17, done = i < g.gi, r = 11 + (i === g.gi ? Math.sin(t * 6) * 1.2 : 0); c.beginPath(); for (let j = 0; j < 14; j++) { const a = j / 14 * 6.283, rr = r * (j % 2 ? .86 : 1.02); j ? c.lineTo(mx + Math.cos(a) * rr, my + Math.sin(a) * rr) : c.moveTo(mx + Math.cos(a) * rr, my + Math.sin(a) * rr); } c.closePath(); c.fillStyle = done ? "#ff6ec7" : "rgba(238,222,186,.95)"; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.2; c.stroke(); skRune(c, mx, my, 5, i, done ? "#fff" : "rgba(29,39,66,.55)", 2);
      if (done) { c.save(); c.globalCompositeOperation = "lighter"; const gg = c.createRadialGradient(mx, my, 1, mx, my, 22); gg.addColorStop(0, "rgba(255,110,199,.55)"); gg.addColorStop(1, "rgba(255,110,199,0)"); c.fillStyle = gg; c.beginPath(); c.arc(mx, my, 22, 0, 7); c.fill(); c.restore(); } }
    // Schieber: Schreibleiste mit Tintenlinie und Runen-Ladestreifen
    skRR(c, x0, y1, W, y2 - y1, 8); c.fillStyle = "rgba(238,222,186,.97)"; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.4; c.stroke();
    c.strokeStyle = "rgba(29,39,66,.5)"; c.lineWidth = 1.4; c.setLineDash([6, 5]); c.beginPath(); c.moveTo(x0 + 8, (y1 + y2) / 2); c.lineTo(x0 + W - 8, (y1 + y2) / 2); c.stroke(); c.setLineDash([]);
    for (let k = 1; k < 10; k++) skRune(c, x0 + W * k / 10, (y1 + y2) / 2 - 7, 3, k, "rgba(29,39,66,.45)", 1.2);
    for (let i = 0; i < 14; i++) { const on = g.lock > 0 && i < Math.floor(14 * g.lock / .7); skRune(c, x0 + 10 + (W - 20) * i / 13, y2 + 9, 3.5, i, on ? "#ff6ec7" : "rgba(29,39,66,.3)", on ? 2.2 : 1.4); }
    // Griff: Feder, Spitze auf der Linie
    c.save(); c.translate(ux, hy); c.rotate(-.5); c.globalCompositeOperation = "lighter"; const fg = c.createRadialGradient(0, 0, 2, 0, 0, 34); fg.addColorStop(0, nz === 0 ? "rgba(255,110,199,.5)" : "rgba(47,224,208,.4)"); fg.addColorStop(1, "rgba(47,224,208,0)"); c.fillStyle = fg; c.beginPath(); c.arc(0, 0, 34, 0, 7); c.fill(); c.globalCompositeOperation = "source-over";
    c.beginPath(); c.moveTo(0, 14); c.quadraticCurveTo(-13, -4, -3, -26); c.quadraticCurveTo(10, -10, 0, 14); c.closePath(); c.fillStyle = nz === 0 ? "#ff6ec7" : "#fdf2fa"; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.4; c.stroke(); c.beginPath(); c.moveTo(0, 14); c.lineTo(0, -20); c.lineWidth = 1.4; c.stroke(); for (let j = 0; j < 3; j++) { c.beginPath(); c.moveTo(0, -4 - j * 6); c.lineTo(-6, -8 - j * 6); c.stroke(); } c.restore();
    c.fillStyle = INK; c.beginPath(); c.arc(ux - 5, hy + 12, 2.2, 0, 7); c.fill(); c.strokeStyle = "rgba(29,39,66,.55)"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(ux - 5, hy + 14); c.lineTo(ux - 5, y2 + 3); c.stroke();
  } else {
    // Gewitterkönigin: Sturmwolke mit gezackten Kanten, Elektro-Welle, Kristalle, Zündschnur
    c.beginPath(); c.moveTo(x0, ytop + 4); for (let i = 0; i <= 40; i++) c.lineTo(x0 + W * i / 40, ytop + (i % 2 ? -5 : 3) + (skHs(i, Math.floor(t * 6), 3) - .5) * 2); for (let i = 40; i >= 0; i--) c.lineTo(x0 + W * i / 40, ybot + (i % 2 ? 5 : -3) + (skHs(i + 50, Math.floor(t * 6), 3) - .5) * 2); c.closePath();
    const bg = c.createLinearGradient(0, ytop, 0, ybot); bg.addColorStop(0, "rgba(18,26,64,.97)"); bg.addColorStop(1, "rgba(36,46,104,.96)"); c.fillStyle = bg; c.fill(); c.save(); c.clip();
    c.strokeStyle = "rgba(140,190,255,.14)"; c.lineWidth = 1; for (let i = 1; i < 20; i++) { c.beginPath(); c.moveTo(x0 + W * i / 20, ytop); c.lineTo(x0 + W * i / 20, ybot); c.stroke(); } for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(x0, ytop + h * i / 4); c.lineTo(x0 + W, ytop + h * i / 4); c.stroke(); }
    c.globalCompositeOperation = "lighter"; const col = nz > .3 ? "#ff9a7a" : "#bfe8ff"; c.shadowColor = col; c.shadowBlur = 12; c.strokeStyle = col; c.lineWidth = 2.6; c.beginPath(); for (let i = 0; i <= W; i += 3) { const ph = i / W * Math.PI * 2 * 3 + t * 2.4, rnd = (skHs(i, q, 3) - .5) * 2, y = cy - (Math.sin(ph) * 32 * (1 - nz * .35) + rnd * nz * 30 + Math.sin(i * .33 + t * 11) * nz * 9) + (skHs(i, q + 9, 5) - .5) * 3; i ? c.lineTo(x0 + i, y) : c.moveTo(x0 + i, y); } c.stroke(); c.shadowBlur = 0; c.strokeStyle = "#fff"; c.lineWidth = 1; c.stroke(); c.restore();
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, ytop + 4); for (let i = 0; i <= 40; i++) c.lineTo(x0 + W * i / 40, ytop + (i % 2 ? -5 : 3)); c.lineTo(x0 + W, ybot); for (let i = 40; i >= 0; i--) c.lineTo(x0 + W * i / 40, ybot + (i % 2 ? 5 : -3)); c.closePath(); c.stroke();
    c.save(); c.globalCompositeOperation = "lighter"; c.globalAlpha = .8; skBolt(c, x0, ytop, x0 + W, ytop, q, 1.6, "#9fd6ff"); skBolt(c, x0, ybot, x0 + W, ybot, q + 5, 1.6, "#9fd6ff"); c.restore();
    // drei Kristalle für die Töne
    for (let i = 0; i < 3; i++) { const mx = cx + (i - 1) * 34, my = ytop - 17, done = i < g.gi, r = 11 + (i === g.gi ? Math.sin(t * 6) * 1.5 : 0); c.beginPath(); c.moveTo(mx, my - r); c.lineTo(mx + r * .7, my - r * .2); c.lineTo(mx + r * .45, my + r * .9); c.lineTo(mx - r * .45, my + r * .9); c.lineTo(mx - r * .7, my - r * .2); c.closePath(); c.fillStyle = done ? "#ffe94a" : "rgba(40,50,120,.85)"; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.2; c.stroke(); if (done) { c.save(); c.globalCompositeOperation = "lighter"; const gg = c.createRadialGradient(mx, my, 1, mx, my, 22); gg.addColorStop(0, "rgba(255,246,160,.6)"); gg.addColorStop(1, "rgba(255,246,160,0)"); c.fillStyle = gg; c.beginPath(); c.arc(mx, my, 22, 0, 7); c.fill(); c.restore(); } }
    // Schieber als Zündschnur mit Kerben, Ladeleiste aus Segmenten
    c.beginPath(); c.moveTo(x0 + 8, y1); c.lineTo(x0 + W - 8, y1); c.lineTo(x0 + W, (y1 + y2) / 2); c.lineTo(x0 + W - 8, y2); c.lineTo(x0 + 8, y2); c.lineTo(x0, (y1 + y2) / 2); c.closePath(); c.fillStyle = "rgba(24,32,80,.96)"; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.4; c.stroke();
    for (let k = 1; k < 20; k++) { c.strokeStyle = k % 2 ? "rgba(160,210,255,.55)" : "rgba(160,210,255,.25)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x0 + W * k / 20, y1 + (k % 2 ? 5 : 8)); c.lineTo(x0 + W * k / 20, y2 - (k % 2 ? 5 : 8)); c.stroke(); }
    const segs = 14; for (let i = 0; i < segs; i++) { const on = g.lock > 0 && i < Math.floor(segs * g.lock / .7); c.fillStyle = on ? "#ffe94a" : "rgba(60,80,160,.5)"; c.fillRect(x0 + 6 + (W - 12) * i / segs, y2 + 5, (W - 12) / segs - 2, 5); }
    // Griff: Blitzkristall mit Funken
    const hw = 12; c.save(); c.globalCompositeOperation = "lighter"; const hg = c.createRadialGradient(ux, hy, 2, ux, hy, 36); hg.addColorStop(0, nz === 0 ? "rgba(255,246,160,.65)" : "rgba(160,210,255,.5)"); hg.addColorStop(1, "rgba(160,210,255,0)"); c.fillStyle = hg; c.beginPath(); c.arc(ux, hy, 36, 0, 7); c.fill(); if (nz < .3) { c.globalAlpha = .8; for (let i = 0; i < 3; i++) skBolt(c, ux, hy - 10, ux + (skHs(i, q, 3) - .5) * 70, ytop + h * .5 + (skHs(i, q, 4) - .5) * 20, q + i, 1.6, "#fff6a0"); } c.restore();
    c.beginPath(); c.moveTo(ux + 3, hy - 18); c.lineTo(ux - hw * .75, hy + 1); c.lineTo(ux - 1, hy + 1); c.lineTo(ux - 4, hy + 17); c.lineTo(ux + hw * .8, hy - 4); c.lineTo(ux + 2, hy - 4); c.closePath(); c.fillStyle = nz === 0 ? "#ffe94a" : "#bfe8ff"; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.6; c.stroke();
    c.strokeStyle = "rgba(190,230,255,.7)"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(ux, hy + 17); c.lineTo(ux, y2 + 3); c.stroke();
  }
  c.restore();
}

/* Fangen: Schiene mit Zone */
function skBalTrack(c, g) {
  const sid = skSid(), t = g.t, { x0, ytr, W, bh, zx, zw, zcx, inZ } = g; c.save(); c.lineCap = c.lineJoin = "round";
  if (sid === "sphaeren") {
    // Himmelsband mit Sonne und Mond an den Enden, Finsternis-Zone mit Korona
    skRR(c, x0, ytr, W, bh, 18); const bg = c.createLinearGradient(0, ytr, 0, ytr + bh); bg.addColorStop(0, "rgba(18,20,70,.96)"); bg.addColorStop(1, "rgba(44,28,100,.96)"); c.fillStyle = bg; c.fill(); c.save(); c.clip();
    for (let i = 0; i < 40; i++) { const x = x0 + ((skHs(i, 1, 6) * W - t * 5 * (.5 + skHs(i, 3, 6))) % W + W) % W, y = ytr + 3 + skHs(i, 2, 6) * (bh - 6), tw = .5 + .5 * Math.sin(t * 3 + i); c.globalAlpha = .3 + tw * .7; c.fillStyle = "#e8eeff"; c.beginPath(); c.arc(x, y, .7 + skHs(i, 4, 6), 0, 7); c.fill(); }
    c.globalAlpha = 1; c.globalCompositeOperation = "lighter"; const rx = zw / 2 + 14, mid = ytr + bh / 2; const cg = c.createRadialGradient(zcx, mid, 4, zcx, mid, rx + 10); cg.addColorStop(0, inZ ? "rgba(255,240,170,.85)" : "rgba(170,160,255,.5)"); cg.addColorStop(.7, inZ ? "rgba(255,200,90,.4)" : "rgba(110,110,255,.28)"); cg.addColorStop(1, "rgba(255,200,90,0)"); c.fillStyle = cg; c.beginPath(); c.ellipse(zcx, mid, rx + 6, bh / 2 + 2, 0, 0, 7); c.fill();
    c.globalCompositeOperation = "source-over"; c.beginPath(); c.ellipse(zcx, mid, zw / 2, bh * .36, 0, 0, 7); c.fillStyle = inZ ? "rgba(255,238,160,.9)" : "rgba(150,150,255,.55)"; c.fill(); c.strokeStyle = inZ ? "#fff6c0" : "#b8b8ff"; c.lineWidth = 2; c.stroke();
    c.save(); c.globalCompositeOperation = "lighter"; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 + t * .4, r1 = zw / 2 + 4, x1 = zcx + Math.cos(a) * r1, y1 = mid + Math.sin(a) * bh * .4; c.globalAlpha = .55; c.strokeStyle = inZ ? "#fff6c0" : "#c8b8ff"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x1, y1); c.lineTo(zcx + Math.cos(a) * (r1 + 9 + 4 * Math.sin(t * 5 + i)), mid + Math.sin(a) * (bh * .4 + 5)); c.stroke(); } c.restore(); c.restore();
    c.strokeStyle = INK; c.lineWidth = 2.6; skRR(c, x0, ytr, W, bh, 18); c.stroke(); c.strokeStyle = "#ffe27a"; c.lineWidth = 1; skRR(c, x0 + 4, ytr + 4, W - 8, bh - 8, 14); c.stroke();
    c.fillStyle = "#ffe27a"; c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.arc(x0 + 12, ytr + bh / 2, 6, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#e8ecff"; c.beginPath(); c.arc(x0 + W - 12, ytr + bh / 2, 6, 0, 7); c.fill(); c.stroke();
  } else if (sid === "gesprochen") {
    // Schriftrolle mit aufgewickelten Enden, Zone als Textmarker-Band mit Runen
    const mid = ytr + bh / 2;
    skRR(c, x0, ytr, W, bh, 6); const bg = c.createLinearGradient(0, ytr, 0, ytr + bh); bg.addColorStop(0, "rgba(252,244,222,.98)"); bg.addColorStop(1, "rgba(236,218,178,.98)"); c.fillStyle = bg; c.fill(); c.save(); c.clip();
    c.strokeStyle = "rgba(160,120,60,.25)"; c.lineWidth = 1; for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(x0, ytr + bh * i / 3); c.lineTo(x0 + W, ytr + bh * i / 3); c.stroke(); }
    for (let i = 0; i < 18; i++) skRune(c, x0 + 14 + (W - 28) * i / 17, mid, bh * .22, i, "rgba(29,39,66,.22)", 1.4);
    c.fillStyle = inZ ? "rgba(255,110,199,.5)" : "rgba(47,224,208,.42)"; c.fillRect(zx, ytr + 3, zw, bh - 6); c.strokeStyle = inZ ? "#c8329a" : "#1aa89a"; c.lineWidth = 2.2; c.strokeRect(zx, ytr + 3, zw, bh - 6);
    const nr = Math.max(2, Math.round(zw / 22)); for (let i = 0; i < nr; i++) skRune(c, zx + zw * (i + .5) / nr, mid, bh * .26, i, INK, 2.2);
    if (inZ) { c.save(); c.globalCompositeOperation = "lighter"; for (let i = 0; i < 6; i++) { const u2 = (t * .8 + i / 6) % 1; c.globalAlpha = Math.sin(u2 * Math.PI) * .9; skStar(c, zx + skHs(i, 1, 5) * zw, ytr + bh - u2 * bh, 2.5, "#fff"); } c.restore(); }
    c.restore(); c.strokeStyle = INK; c.lineWidth = 2.6; skRR(c, x0, ytr, W, bh, 6); c.stroke();
    [[x0 - 1, -1], [x0 + W + 1, 1]].forEach(([px, d]) => { c.beginPath(); c.ellipse(px, mid, 8, bh / 2 + 5, 0, 0, 7); c.fillStyle = "#e8d4a0"; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.4; c.stroke(); c.beginPath(); c.ellipse(px, mid, 3, bh * .3, 0, 0, 7); c.stroke(); c.fillStyle = "#e0a930"; c.beginPath(); c.arc(px, ytr - 6, 3, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.arc(px, ytr + bh + 6, 3, 0, 7); c.fill(); c.stroke(); });
  } else {
    // Gewitterkönigin: Kristallschiene mit Pylonen, Kristall-Zone mit Zacken und Lichtbogen
    c.beginPath(); c.moveTo(x0 + 10, ytr); c.lineTo(x0 + W - 10, ytr); c.lineTo(x0 + W, ytr + bh * .5); c.lineTo(x0 + W - 10, ytr + bh); c.lineTo(x0 + 10, ytr + bh); c.lineTo(x0, ytr + bh * .5); c.closePath(); const bg = c.createLinearGradient(0, ytr, 0, ytr + bh); bg.addColorStop(0, "rgba(16,24,62,.97)"); bg.addColorStop(1, "rgba(34,46,104,.97)"); c.fillStyle = bg; c.fill(); c.save(); c.clip();
    c.strokeStyle = "rgba(140,190,255,.12)"; c.lineWidth = 1; for (let i = 1; i < 24; i++) { c.beginPath(); c.moveTo(x0 + W * i / 24, ytr); c.lineTo(x0 + W * i / 24 - 8, ytr + bh); c.stroke(); }
    c.globalCompositeOperation = "lighter"; const mid = ytr + bh / 2, tx0 = zx, tx1 = zx + zw, n = Math.max(3, Math.round(zw / 14));
    c.beginPath(); c.moveTo(tx0, mid); for (let i = 0; i < n; i++) { const x = tx0 + zw * (i + .5) / n; c.lineTo(tx0 + zw * i / n + zw / n * .25, ytr + 5); c.lineTo(x, ytr + 12 + (i % 2) * 5); c.lineTo(tx0 + zw * (i + 1) / n - zw / n * .25, ytr + 5); } c.lineTo(tx1, mid); for (let i = n - 1; i >= 0; i--) { const x = tx0 + zw * (i + .5) / n; c.lineTo(tx0 + zw * (i + 1) / n - zw / n * .25, ytr + bh - 5); c.lineTo(x, ytr + bh - 12 - (i % 2) * 5); c.lineTo(tx0 + zw * i / n + zw / n * .25, ytr + bh - 5); } c.closePath();
    c.fillStyle = inZ ? "rgba(255,240,130,.75)" : "rgba(110,190,255,.55)"; c.fill(); c.strokeStyle = inZ ? "#fff6a0" : "#bfe8ff"; c.lineWidth = 2.4; c.stroke();
    c.globalAlpha = inZ ? .9 : .5; skBolt(c, x0 + 6, mid, x0 + W - 6, mid, Math.floor(t * 12), 1.4, inZ ? "#fff6a0" : "#9fd6ff"); c.restore();
    c.strokeStyle = INK; c.lineWidth = 2.8; c.beginPath(); c.moveTo(x0 + 10, ytr); c.lineTo(x0 + W - 10, ytr); c.lineTo(x0 + W, ytr + bh * .5); c.lineTo(x0 + W - 10, ytr + bh); c.lineTo(x0 + 10, ytr + bh); c.lineTo(x0, ytr + bh * .5); c.closePath(); c.stroke();
    // Pylonen an den Enden
    [[x0 - 2, -1], [x0 + W + 2, 1]].forEach(([px, d]) => { c.beginPath(); c.moveTo(px, ytr - 10); c.lineTo(px + d * 9, ytr + bh * .5); c.lineTo(px, ytr + bh + 10); c.lineTo(px - d * 6, ytr + bh * .5); c.closePath(); c.fillStyle = "#7fd6ff"; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.2; c.stroke(); c.save(); c.globalCompositeOperation = "lighter"; const pg = c.createRadialGradient(px, ytr + bh / 2, 1, px, ytr + bh / 2, 22); pg.addColorStop(0, "rgba(190,230,255,.6)"); pg.addColorStop(1, "rgba(190,230,255,0)"); c.fillStyle = pg; c.beginPath(); c.arc(px, ytr + bh / 2, 22, 0, 7); c.fill(); c.restore(); });
  }
  c.restore();
}

/* Fortschrittsanzeige */
function skBalProg(c, g) {
  const sid = skSid(), t = g.t, { x0, py2, pw, prog, bonus } = g; c.save(); c.lineCap = c.lineJoin = "round";
  if (sid === "sphaeren") {
    // acht Monde, die sich von Neumond zu Vollmond füllen
    const n = 8, r = 9, gap = (pw - n * 2 * r) / (n - 1), v = Math.max(0, Math.min(1, prog)) * n;
    skRR(c, x0 + 8 - 6, py2 - 8, pw + 12, 30, 15); c.fillStyle = "rgba(16,18,62,.92)"; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.2; c.stroke();
    for (let i = 0; i < n; i++) { const mx = x0 + 8 + r + i * (2 * r + gap), ph = Math.max(0, Math.min(1, v - i)); skMoon(c, mx, py2 + 7, r, ph, bonus ? "#fff0a0" : "#cfe0ff"); if (ph >= 1) { c.save(); c.globalCompositeOperation = "lighter"; const gg = c.createRadialGradient(mx, py2 + 7, 1, mx, py2 + 7, r * 2); gg.addColorStop(0, bonus ? "rgba(255,226,122,.55)" : "rgba(180,200,255,.45)"); gg.addColorStop(1, "rgba(180,200,255,0)"); c.fillStyle = gg; c.beginPath(); c.arc(mx, py2 + 7, r * 2, 0, 7); c.fill(); c.restore(); } }
  } else if (sid === "gesprochen") {
    // acht Runen, die sich nacheinander mit Tinte füllen
    const n = 8, v = Math.max(0, Math.min(1, prog)) * n, gap = (pw - 8) / (n - 1);
    skRR(c, x0 + 2, py2 - 8, pw + 12, 30, 8); c.fillStyle = "rgba(246,236,208,.96)"; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.2; c.stroke();
    for (let i = 0; i < n; i++) { const mx = x0 + 12 + i * gap, f = Math.max(0, Math.min(1, v - i)); skRune(c, mx, py2 + 7, 8, i, "rgba(29,39,66,.28)", 2.2); if (f > 0) { c.globalAlpha = .35 + .65 * f; skRune(c, mx, py2 + 7, 8, i, INK, 4); skRune(c, mx, py2 + 7, 8, i, bonus ? "#ff6ec7" : "#2fe0d0", 2.4); c.globalAlpha = 1; } if (f >= 1) { c.save(); c.globalCompositeOperation = "lighter"; const gg = c.createRadialGradient(mx, py2 + 7, 1, mx, py2 + 7, 15); gg.addColorStop(0, bonus ? "rgba(255,110,199,.5)" : "rgba(47,224,208,.45)"); gg.addColorStop(1, "rgba(47,224,208,0)"); c.fillStyle = gg; c.beginPath(); c.arc(mx, py2 + 7, 15, 0, 7); c.fill(); c.restore(); } }
  } else {
    // Batterie aus Segmenten mit Blitz-Symbol und Ladefunken
    const n = 16, sw = (pw - 36) / n, bx = x0 + 28, v = Math.max(0, Math.min(1, prog)) * n;
    c.beginPath(); c.moveTo(x0 + 8, py2 - 5); c.lineTo(x0 + 8 + pw, py2 - 5); c.lineTo(x0 + 8 + pw + 6, py2 + 7); c.lineTo(x0 + 8 + pw, py2 + 19); c.lineTo(x0 + 8, py2 + 19); c.lineTo(x0 + 2, py2 + 7); c.closePath(); c.fillStyle = "rgba(16,24,62,.96)"; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.4; c.stroke();
    c.beginPath(); c.moveTo(x0 + 17, py2 - 2); c.lineTo(x0 + 11, py2 + 8); c.lineTo(x0 + 16, py2 + 8); c.lineTo(x0 + 13, py2 + 16); c.lineTo(x0 + 22, py2 + 5); c.lineTo(x0 + 17, py2 + 5); c.closePath(); c.fillStyle = "#ffe94a"; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.4; c.stroke();
    for (let i = 0; i < n; i++) { const f = Math.max(0, Math.min(1, v - i)); c.beginPath(); c.moveTo(bx + i * sw + 3, py2); c.lineTo(bx + (i + 1) * sw, py2); c.lineTo(bx + (i + 1) * sw - 3, py2 + 14); c.lineTo(bx + i * sw, py2 + 14); c.closePath(); c.fillStyle = "rgba(60,80,160,.45)"; c.fill(); if (f > 0) { c.globalAlpha = .4 + .6 * f; c.fillStyle = bonus ? "#ffe94a" : "#7fd6ff"; c.fill(); c.globalAlpha = 1; } }
    c.save(); c.globalCompositeOperation = "lighter"; const tipX = bx + (pw - 36) * Math.max(.02, Math.min(1, prog)); for (let i = 0; i < 4; i++) { c.globalAlpha = .9; skBolt(c, tipX, py2 + 7, tipX + (skHs(i, Math.floor(t * 12), 3) - .5) * 26, py2 + 7 + (skHs(i, Math.floor(t * 12), 4) - .5) * 30, Math.floor(t * 12) + i, 1.4, "#fff6a0"); } c.restore();
  }
  c.restore();
}
