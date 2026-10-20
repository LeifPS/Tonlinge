/* ===== Sanktum-Tonlinge (Bereich 5): eigene Körperformen. Gewöhnlich bis Prächtig ===== */
const lg5 = (c, y0, y1, st) => { const g = c.createLinearGradient(0, y0, 0, y1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
const rg5 = (c, x, y, r0, r1, st) => { const g = c.createRadialGradient(x, y, r0, x, y, r1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
const face5 = (c, s, x, y, bl, o) => { o = o || {}; const d = (o.d || .13) * s, r = (o.r || .085) * s; cEye(c, x - d, y, r, bl, s); cEye(c, x + d, y, r, bl, s); if (o.m !== false) mouth4(c, x, y + (o.my || .13) * s, s, !!o.open); if (o.bl !== false) { cBlush(c, x - d * 1.75, y + .07 * s, s, .5); cBlush(c, x + d * 1.75, y + .07 * s, s, .5); } };
const tw5 = (c, x, y, r, a, col) => { c.save(); c.globalAlpha = a; c.fillStyle = col || "#fff6c0"; sparkle(c, x, y, r); c.restore(); };
const orbit5 = (c, s, t, n, rx, ry, cy, r, col, sp0) => { for (let i = 0; i < n; i++) { const a = t * (sp0 || .9) + i * Math.PI * 2 / n; tw5(c, Math.cos(a) * rx * s, cy * s + Math.sin(a) * ry * s, r * s * (.7 + .3 * Math.sin(t * 3 + i)), .85, col); } };
const flame5 = (c, x, y, w, h, t, ph, col1, col2) => { // wehende Flamme, Spitze oben
  const fl = Math.sin(t * 7 + ph) * w * .18, fl2 = Math.sin(t * 5.3 + ph * 2) * w * .1, lw0 = c.lineWidth; c.lineWidth = Math.min(lw0, Math.max(1.4, w * .16));
  c.beginPath(); c.moveTo(x - w * .5, y); c.bezierCurveTo(x - w * .62, y - h * .38, x - w * .1 + fl2, y - h * .62, x + fl, y - h); c.bezierCurveTo(x + w * .16 + fl2, y - h * .6, x + w * .66, y - h * .36, x + w * .5, y); c.quadraticCurveTo(x, y + h * .22, x - w * .5, y); c.closePath();
  c.fillStyle = col1; c.fill(); c.stroke();
  c.beginPath(); c.moveTo(x - w * .24, y - h * .02); c.bezierCurveTo(x - w * .3, y - h * .3, x, y - h * .38 + fl * .3, x + fl * .4, y - h * .62); c.bezierCurveTo(x + w * .1, y - h * .36, x + w * .32, y - h * .26, x + w * .24, y - h * .02); c.quadraticCurveTo(x, y + h * .1, x - w * .24, y - h * .02); c.closePath(); c.fillStyle = col2; c.fill(); c.lineWidth = lw0;
};
const rune5 = (c, x, y, r, k, col, w) => { // eine kleine leuchtende Rune (k wählt das Zeichen)
  c.save(); c.strokeStyle = col; c.lineWidth = w || Math.max(1.4, r * .2); c.lineCap = "round"; c.beginPath();
  const m = k % 6;
  if (m === 0) { c.moveTo(x - r * .4, y - r); c.lineTo(x - r * .4, y + r); c.moveTo(x - r * .4, y - r * .6); c.lineTo(x + r * .6, y - r * .1); c.lineTo(x - r * .4, y + r * .2); }
  else if (m === 1) { c.moveTo(x, y - r); c.lineTo(x, y + r); c.moveTo(x - r * .6, y - r * .2); c.lineTo(x, y - r * .8); c.lineTo(x + r * .6, y - r * .2); }
  else if (m === 2) { c.moveTo(x - r * .6, y - r); c.lineTo(x + r * .6, y + r); c.moveTo(x + r * .6, y - r); c.lineTo(x - r * .6, y + r); }
  else if (m === 3) { c.moveTo(x - r * .5, y - r); c.lineTo(x + r * .5, y); c.lineTo(x - r * .5, y + r); c.moveTo(x + r * .5, y - r); c.lineTo(x + r * .5, y + r); }
  else if (m === 4) { c.arc(x, y, r * .7, 0, 7); c.moveTo(x, y - r); c.lineTo(x, y + r); }
  else { c.moveTo(x - r * .6, y + r); c.lineTo(x, y - r); c.lineTo(x + r * .6, y + r); c.moveTo(x - r * .4, y + r * .2); c.lineTo(x + r * .4, y + r * .2); }
  c.stroke(); c.restore();
};
const shadow5 = (c, s, w) => { c.save(); c.fillStyle = "rgba(20,24,50,.22)"; c.beginPath(); c.ellipse(0, .66 * s, (w || .4) * s, .07 * s, 0, 0, 7); c.fill(); c.restore(); };
const feet5 = (c, s, col, y, d) => { c.fillStyle = col; [-1, 1].forEach(k => { c.beginPath(); c.ellipse(k * (d || .17) * s, (y || .6) * s, s * .09, s * .05, 0, 0, 7); c.fill(); c.stroke(); }); };

Object.assign(FORMS, {
  tintling(c, s, sp, t, bc, bl) { // Tintling: ein Tintentropfen mit Federkiel, tropft auf Runenschrift
    const wob = Math.sin(t * 3) * .025, drip = (t * .7) % 1;
    c.beginPath(); c.ellipse(0, .64 * s, .5 * s, .1 * s, 0, 0, 7); FS(c, "#232b58");
    for (let i = 0; i < 4; i++) rune5(c, (-.3 + i * .2) * s, .64 * s, s * .04, i + 2, "rgba(255,230,150,.75)");
    c.beginPath(); c.moveTo(0, -.52 * s); c.bezierCurveTo(.14 * s, -.32 * s, .5 * s, .02 * s, .46 * s, .4 * s); c.bezierCurveTo(.44 * s, .66 * s, -.44 * s, .66 * s, -.46 * s, .4 * s); c.bezierCurveTo(-.5 * s, .02 * s, -.14 * s, -.32 * s, 0, -.52 * s); c.closePath();
    c.save(); c.translate(0, .6 * s); c.scale(1 + wob, 1 - wob); c.translate(0, -.6 * s); c.fillStyle = lg5(c, -.5 * s, .65 * s, [[0, mx4(bc, "#8a9ae0", .35)], [.5, bc], [1, mx4(bc, "#0a0f30", .5)]]); c.fill(); c.stroke(); c.restore();
    c.strokeStyle = "rgba(255,255,255,.6)"; c.lineWidth = s * .035; c.beginPath(); c.moveTo(-.22 * s, .0); c.quadraticCurveTo(-.3 * s, .2 * s, -.26 * s, .36 * s); c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    // Federkiel
    c.beginPath(); c.moveTo(.02 * s, -.5 * s); c.quadraticCurveTo(.3 * s, -.7 * s, .62 * s, -1.02 * s); c.quadraticCurveTo(.66 * s, -.76 * s, .5 * s, -.58 * s); c.quadraticCurveTo(.3 * s, -.42 * s, .02 * s, -.5 * s); c.closePath(); FS(c, "#f6efd8");
    c.strokeStyle = "rgba(120,90,40,.7)"; c.lineWidth = s * .03; c.beginPath(); c.moveTo(.02 * s, -.5 * s); c.lineTo(.6 * s, -.98 * s); for (let i = 1; i < 5; i++) { const u = i / 5; c.moveTo((.02 + .58 * u) * s, (-.5 - .48 * u) * s); c.lineTo((.02 + .58 * u + .08) * s, (-.5 - .48 * u + .12) * s); } c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    c.save(); c.globalAlpha = 1 - drip; c.beginPath(); c.ellipse(-.02 * s, (-.46 + drip * 1.0) * s, s * .035, s * .055, 0, 0, 7); c.fillStyle = "#2a3a7c"; c.fill(); c.restore();
    face5(c, s, 0, .16 * s, bl, { d: .13, r: .09 }); tw5(c, -.34 * s, -.12 * s, s * .06, .8, "#ffe08a"); tw5(c, .38 * s, .22 * s, s * .05, .7, "#ffe08a");
  },
  kerzel(c, s, sp, t, bc, bl) { // Kerzel: eine Wachskerze mit tanzender Flamme, Wachs tropft in Wulsten
    shadow5(c, s, .36); const my = -.12 * s;
    c.beginPath(); c.moveTo(-.3 * s, .6 * s); c.lineTo(-.32 * s, -.1 * s); c.quadraticCurveTo(-.3 * s, -.2 * s, -.2 * s, -.18 * s); c.quadraticCurveTo(-.1 * s, -.1 * s, 0, -.2 * s); c.quadraticCurveTo(.1 * s, -.1 * s, .2 * s, -.18 * s); c.quadraticCurveTo(.3 * s, -.2 * s, .32 * s, -.1 * s); c.lineTo(.3 * s, .6 * s); c.quadraticCurveTo(0, .72 * s, -.3 * s, .6 * s); c.closePath();
    c.fillStyle = lg5(c, -.2 * s, .6 * s, [[0, "#fffaf0"], [1, mx4(bc, "#d8b87a", .4)]]); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-.22 * s, -.14 * s); c.quadraticCurveTo(-.2 * s, .08 * s, -.14 * s, .16 * s); c.quadraticCurveTo(-.08 * s, .08 * s, -.08 * s, -.12 * s); c.closePath(); FS(c, "#fff4d0");
    c.beginPath(); c.moveTo(.16 * s, -.16 * s); c.quadraticCurveTo(.2 * s, .22 * s, .26 * s, .3 * s); c.quadraticCurveTo(.3 * s, .1 * s, .28 * s, -.14 * s); c.closePath(); FS(c, "#fff4d0");
    c.beginPath(); c.moveTo(0, -.2 * s); c.lineTo(0, -.34 * s); c.lineWidth = s * .035; c.stroke(); c.lineWidth = Math.max(2, s * .06);
    glow4(c, 0, -.6 * s, s * .7, "#ffb347", .45 + .1 * Math.sin(t * 6));
    flame5(c, 0, -.33 * s, s * .3, s * .56, t, 0, "#ffb02a", "#fff2a0");
    face5(c, s, 0, .26 * s, bl, { d: .12 }); feet5(c, s, "#f4e6c0", .62);
    for (let i = 0; i < 3; i++) { const ph = (t * .5 + i / 3) % 1; c.save(); c.globalAlpha = 1 - ph; c.fillStyle = "#ffd070"; c.beginPath(); c.arc((Math.sin(i * 2.3 + t) * .12) * s, (-.7 - ph * .5) * s, s * .02, 0, 7); c.fill(); c.restore(); }
  },
  staubi(c, s, sp, t, bc, bl) { // Staubi: ein Wollmaus-Fussel, niest funkelnden Staub
    const ph = (t * .45) % 1, bu = Math.sin(t * 3) * .02;
    shadow5(c, s, .4);
    c.beginPath(); for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, r = s * (.46 + .07 * Math.sin(i * 2.7 + 1) + (i % 2 ? .045 : 0) + bu), x = Math.cos(a) * r, y = .18 * s + Math.sin(a) * r * .88; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath();
    c.fillStyle = rg5(c, -.1 * s, 0, .05 * s, .6 * s, [[0, "#f6efe4"], [1, bc]]); c.fill(); c.stroke();
    c.strokeStyle = "rgba(120,100,80,.45)"; c.lineWidth = s * .025; for (let i = 0; i < 7; i++) { const a = i * .9 + .3; c.beginPath(); c.moveTo(Math.cos(a) * s * .3, .18 * s + Math.sin(a) * s * .26); c.quadraticCurveTo(Math.cos(a + .5) * s * .4, .18 * s + Math.sin(a + .5) * s * .35, Math.cos(a + .2) * s * .47, .18 * s + Math.sin(a + .2) * s * .4); c.stroke(); } c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    face5(c, s, 0, .18 * s, bl, { d: .14, r: .09, open: ph > .8 });
    for (let i = 0; i < 7; i++) { const u = ((ph + i * .09) % 1), x = (.5 + u * .55) * s, y = (.1 - u * .35 + Math.sin(i * 2) * .08 + u * u * .4) * s; if (ph < .6 && i > 1) continue; c.save(); c.globalAlpha = (1 - u) * .85; c.fillStyle = i % 2 ? "#ffe9a0" : "#ffffff"; sparkle(c, x, y, s * (.05 - u * .02)); c.restore(); }
    feet5(c, s, "#cfc4b2", .62);
  },
  blaettli(c, s, sp, t, bc, bl) { // Blättli: eine lebende Buchseite, flattert mit Eselsohr und krakeliger Schrift
    const fl = Math.sin(t * 4) * .05; shadow5(c, s, .32);
    c.save(); c.translate(0, .16 * s); c.rotate(fl);
    c.beginPath(); c.moveTo(-.4 * s, -.5 * s); c.quadraticCurveTo(0, -.58 * s + fl * s, .4 * s, -.5 * s); c.lineTo(.42 * s, .3 * s); c.quadraticCurveTo(.44 * s, .5 * s, .3 * s, .56 * s); c.quadraticCurveTo(0, .62 * s, -.3 * s, .54 * s); c.quadraticCurveTo(-.46 * s, .5 * s, -.42 * s, .3 * s); c.closePath();
    c.fillStyle = lg5(c, -.5 * s, .6 * s, [[0, "#fffbe8"], [1, bc]]); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(.18 * s, -.52 * s); c.lineTo(.4 * s, -.5 * s); c.lineTo(.4 * s, -.28 * s); c.closePath(); FS(c, mx4(bc, "#b8864a", .35));
    c.strokeStyle = "rgba(90,60,30,.55)"; c.lineWidth = s * .03; for (let i = 0; i < 4; i++) { c.beginPath(); for (let k = 0; k <= 8; k++) { const x = (-.3 + k * .075) * s, y = (.28 + i * .07) * s + Math.sin(k * 2 + i) * s * .012; k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
    c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    face5(c, s, 0, -.12 * s, bl, { d: .15, r: .1, my: .14 }); c.restore();
    for (let i = 0; i < 2; i++) { const ph = (t * .4 + i * .5) % 1, x = (i ? .45 : -.5) * s, y = (.3 - ph * .6) * s; c.save(); c.globalAlpha = Math.sin(ph * Math.PI); c.strokeStyle = "rgba(90,60,30,.7)"; c.lineWidth = s * .03; c.beginPath(); c.moveTo(x - s * .06, y); c.lineTo(x + s * .06, y); c.moveTo(x - s * .05, y + s * .05); c.lineTo(x + s * .04, y + s * .05); c.stroke(); c.restore(); }
  },
  koechel(c, s, sp, t, bc, bl) { // Köchel: ein Zauberkesselchen, brodelt grün und spuckt Blasen
    shadow5(c, s, .46);
    [-1, 1].forEach(k => { c.beginPath(); c.moveTo(k * .3 * s, .56 * s); c.lineTo(k * .38 * s, .7 * s); c.lineWidth = s * .07; c.stroke(); c.lineWidth = Math.max(2, s * .06); });
    c.beginPath(); c.moveTo(-.36 * s, -.06 * s); c.bezierCurveTo(-.58 * s, .3 * s, -.4 * s, .62 * s, 0, .62 * s); c.bezierCurveTo(.4 * s, .62 * s, .58 * s, .3 * s, .36 * s, -.06 * s); c.closePath();
    c.fillStyle = lg5(c, -.1 * s, .62 * s, [[0, mx4(bc, "#9aa0c0", .3)], [1, mx4(bc, "#14182c", .35)]]); c.fill(); c.stroke();
    c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = s * .035; c.beginPath(); c.arc(0, .2 * s, .36 * s, Math.PI * .78, Math.PI * 1.0); c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    c.beginPath(); c.ellipse(0, -.06 * s, .38 * s, .1 * s, 0, 0, 7); FS(c, "#3a3f58");
    c.beginPath(); c.ellipse(0, -.06 * s, .31 * s, .07 * s + Math.sin(t * 5) * s * .008, 0, 0, 7); c.fillStyle = "#7fe0a0"; c.fill(); c.lineWidth = s * .03; c.stroke(); c.lineWidth = Math.max(2, s * .06);
    glow4(c, 0, -.12 * s, s * .5, "#7fe0a0", .45);
    for (let i = 0; i < 6; i++) { const ph = (t * .55 + i / 6) % 1, x = Math.sin(i * 2.1) * .22 * s, y = (-.1 - ph * .75) * s, r = s * (.035 + .03 * ph); c.save(); c.globalAlpha = Math.sin(ph * Math.PI) * .9; c.beginPath(); c.arc(x + Math.sin(t * 2 + i) * s * .03, y, r, 0, 7); c.fillStyle = "rgba(190,255,215,.75)"; c.fill(); c.lineWidth = s * .02; c.stroke(); c.restore(); }
    face5(c, s, 0, .26 * s, bl, { d: .13, r: .09, open: Math.sin(t * 2) > .5 });
  },
  siegelchen(c, s, sp, t, bc, bl) { // Siegelchen: ein Wachssiegel mit Prägung und flatterndem Band
    shadow5(c, s, .42); const sw = Math.sin(t * 2.5) * .06;
    c.beginPath(); c.moveTo(-.12 * s, .4 * s); c.quadraticCurveTo(-.3 * s, .7 * s + sw * s, -.22 * s, .9 * s); c.lineTo(-.06 * s, .78 * s); c.lineTo(0, .92 * s); c.lineTo(.06 * s, .4 * s); c.closePath(); FS(c, "#2f5fc8");
    c.beginPath(); c.moveTo(.1 * s, .4 * s); c.quadraticCurveTo(.3 * s, .66 * s - sw * s, .26 * s, .88 * s); c.lineTo(.1 * s, .76 * s); c.lineTo(.02 * s, .9 * s); c.lineTo(-.04 * s, .4 * s); c.closePath(); FS(c, "#3f78e0");
    c.beginPath(); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = s * (.5 + (i % 2 ? -.04 : .04) + .02 * Math.sin(i * 3)); const x = Math.cos(a) * r, y = .1 * s + Math.sin(a) * r * .94; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath();
    c.fillStyle = rg5(c, -.12 * s, -.1 * s, .05 * s, .6 * s, [[0, mx4(bc, "#ff9a86", .45)], [1, mx4(bc, "#5a0f18", .35)]]); c.fill(); c.stroke();
    c.beginPath(); c.arc(0, .1 * s, .36 * s, 0, 7); c.strokeStyle = "rgba(60,10,16,.5)"; c.lineWidth = s * .035; c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    c.strokeStyle = "rgba(255,230,160,.8)"; c.lineWidth = s * .03; star4(c, 0, -.02 * s, s * .17, 5, .45); c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    face5(c, s, 0, .2 * s, bl, { d: .13, r: .08, my: .1 }); tw5(c, .42 * s, -.2 * s, s * .06, .6 + .3 * Math.sin(t * 3), "#fff0a0");
  },
  federling(c, s, sp, t, bc, bl) { // Federling: ein kugeliges Federwesen, Schwingen als Federkiele, Tintenspitze am Schwanz
    const fl = Math.sin(t * 5) * .12; shadow5(c, s, .36);
    [-1, 1].forEach(k => { c.save(); c.translate(k * .36 * s, .12 * s); c.rotate(k * (-.5 - fl)); for (let i = 0; i < 4; i++) { c.save(); c.rotate(k * (-.28 + i * .2)); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(k * .18 * s, -.16 * s, k * .08 * s, -(.52 - i * .03) * s); c.quadraticCurveTo(-k * .1 * s, -.28 * s, 0, 0); c.closePath(); FS(c, i % 2 ? sp.capc : mx4(sp.capc, "#ffffff", .35)); c.restore(); } c.restore(); });
    c.beginPath(); c.ellipse(0, .2 * s, .38 * s, .42 * s, 0, 0, 7); c.fillStyle = rg5(c, -.1 * s, .0, .05 * s, .55 * s, [[0, "#ffffff"], [1, bc]]); c.fill(); c.stroke();
    c.strokeStyle = "rgba(120,140,190,.5)"; c.lineWidth = s * .025; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(((i % 3) - 1) * .18 * s, (.4 + Math.floor(i / 3) * .1) * s, s * .07, .2, 2.9); c.stroke(); } c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    c.beginPath(); c.moveTo(-.1 * s, -.2 * s); c.quadraticCurveTo(-.12 * s, -.5 * s, -.02 * s, -.62 * s); c.quadraticCurveTo(.04 * s, -.4 * s, .1 * s, -.2 * s); c.closePath(); FS(c, sp.capc);
    c.beginPath(); c.moveTo(.0 * s, .12 * s); c.lineTo(.07 * s, .17 * s); c.lineTo(0, .24 * s); c.lineTo(-.07 * s, .17 * s); c.closePath(); FS(c, "#ffb94a");
    cEye(c, -.16 * s, .04 * s, s * .085, bl, s); cEye(c, .16 * s, .04 * s, s * .085, bl, s); cBlush(c, -.28 * s, .14 * s, s, .5); cBlush(c, .28 * s, .14 * s, s, .5); feet5(c, s, "#ffb94a", .62, .12);
  },
  spiegelchen(c, s, sp, t, bc, bl) { // Spiegelchen: ein Handspiegel, in dem ein Gesicht sich selbst anlächelt
    shadow5(c, s, .34); const sw = Math.sin(t * 2.2) * .05;
    c.save(); c.translate(0, .12 * s); c.rotate(sw);
    c.beginPath(); c.moveTo(-.07 * s, .4 * s); c.lineTo(-.06 * s, .72 * s); c.quadraticCurveTo(0, .78 * s, .06 * s, .72 * s); c.lineTo(.07 * s, .4 * s); c.closePath(); FS(c, "#c9a24a");
    c.beginPath(); c.ellipse(0, -.06 * s, .42 * s, .48 * s, 0, 0, 7); FS(c, "#e0b84a"); c.beginPath(); c.ellipse(0, -.06 * s, .35 * s, .41 * s, 0, 0, 7); c.fillStyle = lg5(c, -.45 * s, .4 * s, [[0, "#f4fbff"], [.5, bc], [1, "#9ad0f0"]]); c.fill(); c.lineWidth = s * .035; c.stroke(); c.lineWidth = Math.max(2, s * .06);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + .4; c.beginPath(); c.arc(Math.cos(a) * .42 * s, -.06 * s + Math.sin(a) * .48 * s, s * .035, 0, 7); FS(c, "#ff7a9a"); }
    c.save(); c.beginPath(); c.ellipse(0, -.06 * s, .35 * s, .41 * s, 0, 0, 7); c.clip(); const sh = ((t * .5) % 1.6 - .3) * s; c.fillStyle = "rgba(255,255,255,.6)"; c.beginPath(); c.moveTo(-.5 * s + sh, -.5 * s); c.lineTo(-.34 * s + sh, -.5 * s); c.lineTo(-.04 * s + sh, .5 * s); c.lineTo(-.2 * s + sh, .5 * s); c.closePath(); c.fill(); c.restore();
    face5(c, s, 0, -.08 * s, bl, { d: .13, r: .085, my: .13 }); c.restore();
    tw5(c, .5 * s, -.4 * s, s * .07, .6 + .3 * Math.sin(t * 3), "#ffffff"); tw5(c, -.5 * s, .1 * s, s * .05, .6 + .3 * Math.sin(t * 3 + 2), "#ffffff");
  },
  mooswispel(c, s, sp, t, bc, bl) { // Mooswispel: ein Moospolster mit Pilzhut und Glühwürmchen
    shadow5(c, s, .48);
    c.beginPath(); c.moveTo(-.5 * s, .56 * s); c.bezierCurveTo(-.62 * s, .1 * s, -.4 * s, -.18 * s, 0, -.2 * s); c.bezierCurveTo(.4 * s, -.18 * s, .62 * s, .1 * s, .5 * s, .56 * s); c.quadraticCurveTo(0, .72 * s, -.5 * s, .56 * s); c.closePath();
    c.fillStyle = rg5(c, -.1 * s, 0, .05 * s, .7 * s, [[0, mx4(bc, "#e8ffd0", .4)], [1, mx4(bc, "#2a5a24", .35)]]); c.fill(); c.stroke();
    c.strokeStyle = "rgba(40,90,40,.5)"; c.lineWidth = s * .025; for (let i = 0; i < 12; i++) { const x = (-.4 + (i % 6) * .16) * s, y = (-.1 + Math.floor(i / 6) * .22 + (i % 2) * .05) * s; c.beginPath(); c.moveTo(x, y + s * .06); c.lineTo(x + (i % 3 - 1) * s * .03, y - s * .03); c.stroke(); } c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    c.beginPath(); c.moveTo(-.3 * s, -.2 * s); c.bezierCurveTo(-.34 * s, -.62 * s, .34 * s, -.62 * s, .3 * s, -.2 * s); c.quadraticCurveTo(0, -.12 * s, -.3 * s, -.2 * s); c.closePath(); FS(c, "#e8f8c0");
    c.fillStyle = "#fff"; [[-.12, -.38, .05], [.1, -.44, .06], [.17, -.3, .04]].forEach(p => { c.beginPath(); c.arc(p[0] * s, p[1] * s, p[2] * s, 0, 7); c.fill(); });
    face5(c, s, 0, .16 * s, bl, { d: .15, r: .09, my: .12 });
    for (let i = 0; i < 4; i++) { const a = t * .8 + i * 1.6, x = Math.cos(a) * .62 * s, y = (.05 + Math.sin(a * 1.3 + i) * .3) * s; glow4(c, x, y, s * .2, "#e8ff90", .75); c.beginPath(); c.arc(x, y, s * .03, 0, 7); c.fillStyle = "#fffbd0"; c.fill(); }
  },
  runling(c, s, sp, t, bc, bl) { // Runling: eine Steintafel mit leuchtender Rune, Gesicht im Stein, Moos an den Füßen
    shadow5(c, s, .42); const pu = .55 + .45 * Math.sin(t * 2.4);
    c.beginPath(); c.moveTo(-.38 * s, .6 * s); c.lineTo(-.42 * s, -.2 * s); c.lineTo(-.3 * s, -.5 * s); c.lineTo(.3 * s, -.54 * s); c.lineTo(.44 * s, -.18 * s); c.lineTo(.4 * s, .6 * s); c.closePath();
    c.fillStyle = lg5(c, -.5 * s, .6 * s, [[0, mx4(bc, "#d0d8f0", .35)], [1, mx4(bc, "#242a44", .3)]]); c.fill(); c.stroke();
    c.strokeStyle = "rgba(20,26,50,.5)"; c.lineWidth = s * .025; c.beginPath(); c.moveTo(-.3 * s, -.5 * s); c.lineTo(-.18 * s, -.22 * s); c.lineTo(-.26 * s, -.04 * s); c.moveTo(.44 * s, -.18 * s); c.lineTo(.26 * s, -.12 * s); c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    glow4(c, 0, -.2 * s, s * .5, sp.capc, .5 * pu); rune5(c, 0, -.22 * s, s * .2, Math.floor(t * .35) % 6, "#c8f4ff", s * .06); rune5(c, 0, -.22 * s, s * .2, Math.floor(t * .35) % 6, sp.capc, s * .035);
    face5(c, s, 0, .22 * s, bl, { d: .14, r: .085, my: .12 });
    c.fillStyle = "#6faa5a"; [[-.32, .58], [.3, .6], [.0, .64]].forEach(p => { c.beginPath(); c.ellipse(p[0] * s, p[1] * s, s * .13, s * .06, 0, 0, 7); c.fill(); c.stroke(); });
    for (let i = 0; i < 3; i++) { const ph = (t * .4 + i / 3) % 1; tw5(c, Math.sin(i * 2) * .4 * s, (-.3 - ph * .5) * s, s * .05, Math.sin(ph * Math.PI), "#c8f4ff"); }
  },
  phiolix(c, s, sp, t, bc, bl) { // Phiolix: ein Zauberfläschchen mit zwei Farbschichten, Kork mit Gesicht, Blasen
    shadow5(c, s, .38); const lv = .08 + Math.sin(t * 2) * .02;
    c.beginPath(); c.moveTo(-.12 * s, -.5 * s); c.lineTo(-.12 * s, -.2 * s); c.bezierCurveTo(-.54 * s, -.1 * s, -.5 * s, .64 * s, 0, .64 * s); c.bezierCurveTo(.5 * s, .64 * s, .54 * s, -.1 * s, .12 * s, -.2 * s); c.lineTo(.12 * s, -.5 * s); c.closePath();
    c.fillStyle = "rgba(222,245,242,.85)"; c.fill(); c.stroke();
    c.save(); c.clip(); c.fillStyle = lg5(c, 0, .64 * s, [[0, "#b36af0"], [1, "#5a2ab8"]]); c.fillRect(-s, (.25 + lv) * s, 2 * s, s); c.fillStyle = lg5(c, 0, .3 * s, [[0, "#6af0d0"], [1, "#2ab8a0"]]); c.beginPath(); c.moveTo(-s, .0); for (let x = -1; x <= 1.01; x += .1) c.lineTo(x * s, (.0 + lv + Math.sin(x * 8 + t * 3) * .015) * s); c.lineTo(s, .3 * s + lv * s); c.lineTo(-s, .3 * s + lv * s); c.closePath(); c.fill(); c.restore();
    c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = s * .04; c.beginPath(); c.moveTo(-.36 * s, .1 * s); c.quadraticCurveTo(-.4 * s, .4 * s, -.24 * s, .55 * s); c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    c.beginPath(); c.moveTo(-.12 * s, -.5 * s); c.lineTo(-.12 * s, -.2 * s); c.bezierCurveTo(-.54 * s, -.1 * s, -.5 * s, .64 * s, 0, .64 * s); c.bezierCurveTo(.5 * s, .64 * s, .54 * s, -.1 * s, .12 * s, -.2 * s); c.lineTo(.12 * s, -.5 * s); c.stroke();
    c.beginPath(); c.moveTo(-.16 * s, -.5 * s); c.lineTo(-.12 * s, -.66 * s); c.lineTo(.12 * s, -.66 * s); c.lineTo(.16 * s, -.5 * s); c.closePath(); FS(c, "#c9915a");
    for (let i = 0; i < 5; i++) { const ph = (t * .6 + i / 5) % 1, x = Math.sin(i * 2.4) * .24 * s, y = (.45 - ph * .8) * s; c.save(); c.globalAlpha = Math.sin(ph * Math.PI) * .9; c.beginPath(); c.arc(x, y, s * (.03 + .015 * (i % 3)), 0, 7); c.fillStyle = "rgba(255,255,255,.7)"; c.fill(); c.lineWidth = s * .02; c.stroke(); c.restore(); }
    face5(c, s, 0, .3 * s, bl, { d: .15, r: .09, open: true });
    for (let i = 0; i < 3; i++) { const ph = (t * .35 + i / 3) % 1; c.save(); c.globalAlpha = Math.sin(ph * Math.PI) * .8; c.fillStyle = i % 2 ? "#b36af0" : "#6af0d0"; c.beginPath(); c.arc((-.1 + i * .1) * s, (-.7 - ph * .4) * s, s * (.05 + ph * .05), 0, 7); c.fill(); c.restore(); }
  },
  uhrling(c, s, sp, t, bc, bl) { // Uhrling: ein Taschenuhr-Wesen aus Messing, Zahnräder drehen sich auf dem Rücken
    shadow5(c, s, .42);
    const gear = (x, y, r, n, a0, col) => { c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = a0 + i * Math.PI / n, q = i % 2 ? r * .8 : r; i ? c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : c.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); FS(c, col); c.beginPath(); c.arc(x, y, r * .26, 0, 7); FS(c, "#6a4a2a"); };
    gear(-.34 * s, -.3 * s, s * .2, 8, t * 1.2, "#d9b25a"); gear(.34 * s, -.34 * s, s * .16, 7, -t * 1.5 + .3, "#c9a15a");
    c.beginPath(); c.arc(0, -.5 * s, s * .08, 0, 7); FS(c, "#d9b25a");
    c.beginPath(); c.ellipse(0, .18 * s, .44 * s, .46 * s, 0, 0, 7); c.fillStyle = lg5(c, -.3 * s, .64 * s, [[0, "#f2d88a"], [1, bc]]); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(0, .18 * s, .36 * s, .38 * s, 0, 0, 7); FS(c, "#fff6dc");
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.beginPath(); c.moveTo(Math.cos(a) * .3 * s, .18 * s + Math.sin(a) * .32 * s); c.lineTo(Math.cos(a) * .35 * s, .18 * s + Math.sin(a) * .37 * s); c.lineWidth = s * (i % 3 ? .02 : .04); c.stroke(); } c.lineWidth = Math.max(2, s * .06);
    const ma = t * .6 - Math.PI / 2, ha = t * .05 - Math.PI / 2, hy = .4 * s; c.lineWidth = s * .04; c.beginPath(); c.moveTo(0, hy); c.lineTo(Math.cos(ma) * .17 * s, hy + Math.sin(ma) * .15 * s); c.moveTo(0, hy); c.lineTo(Math.cos(ha) * .11 * s, hy + Math.sin(ha) * .1 * s); c.stroke(); c.beginPath(); c.arc(0, hy, s * .03, 0, 7); c.fillStyle = INK; c.fill(); c.lineWidth = Math.max(2, s * .06);
    face5(c, s, 0, .1 * s, bl, { d: .12, r: .08, my: .12, bl: false }); feet5(c, s, "#6a4a2a", .64);
  },
  schattenmotte(c, s, sp, t, bc, bl) { // Schattenmotte: Nachtfalter mit Sternenflügeln und Federfühlern
    const fl = Math.sin(t * 5), hov = Math.sin(t * 2) * .04 * s; c.save(); c.translate(0, hov);
    [-1, 1].forEach(k => { [[1, .5, -.2, .64, 0], [.8, .5, .34, .46, .3]].forEach(([sc, , , , ]) => {}); c.save(); c.translate(k * .1 * s, 0); c.rotate(k * (.15 + fl * .16)); c.beginPath(); c.moveTo(0, -.1 * s); c.bezierCurveTo(k * .5 * s, -.7 * s, k * 1.04 * s, -.3 * s, k * .84 * s, .16 * s); c.bezierCurveTo(k * .7 * s, .34 * s, k * .3 * s, .22 * s, 0, .1 * s); c.closePath(); c.fillStyle = lg5(c, -.5 * s, .3 * s, [[0, mx4(bc, "#8a6ad8", .4)], [1, mx4(bc, "#0e0a28", .4)]]); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(0, .1 * s); c.bezierCurveTo(k * .3 * s, .3 * s, k * .6 * s, .58 * s, k * .4 * s, .66 * s); c.bezierCurveTo(k * .25 * s, .6 * s, k * .1 * s, .36 * s, 0, .1 * s); c.closePath(); c.fillStyle = mx4(bc, "#5a3aa8", .35); c.fill(); c.stroke();
      c.fillStyle = "#e6dcff"; [[.5, -.2, .09], [.7, .0, .06], [.3, .3, .05], [.62, -.38, .04]].forEach((p, i) => { tw5(c, k * p[0] * s, p[1] * s, p[2] * s * 1.3, .9 - (i % 2) * .2, "#e6dcff"); }); c.beginPath(); c.arc(k * .55 * s, -.05 * s, s * .1, 0, 7); c.fillStyle = "rgba(230,220,255,.5)"; c.fill(); c.stroke(); c.restore(); });
    c.beginPath(); c.ellipse(0, .1 * s, .13 * s, .36 * s, 0, 0, 7); c.fillStyle = lg5(c, -.3 * s, .5 * s, [[0, "#f0e8ff"], [1, "#7a64c0"]]); c.fill(); c.stroke();
    [-1, 1].forEach(k => { c.beginPath(); c.moveTo(k * .05 * s, -.18 * s); c.quadraticCurveTo(k * .22 * s, -.56 * s, k * .3 * s, -.62 * s + Math.sin(t * 3) * s * .03); c.stroke(); for (let i = 1; i < 4; i++) { const u = i / 4; c.beginPath(); c.moveTo(k * (.05 + .2 * u) * s, (-.18 - .36 * u) * s); c.lineTo(k * (.05 + .2 * u + .06) * s, (-.18 - .36 * u + .02) * s); c.stroke(); } });
    face5(c, s, 0, -.04 * s, bl, { d: .07, r: .06, m: false, bl: false }); c.restore();
    for (let i = 0; i < 5; i++) { const ph = (t * .4 + i / 5) % 1; tw5(c, Math.sin(i * 3.1) * .7 * s, (.3 + ph * .4) * s, s * .035, Math.sin(ph * Math.PI) * .8, "#c9b8ff"); }
  },
  astrolix(c, s, sp, t, bc, bl) { // Astrolix: ein Astrolabium-Wesen: Messingringe mit Gradskala, Zeigernadel dahinter, kreisende Sterne
    const a1 = t * .45, a2 = -t * .3; glow4(c, 0, .12 * s, s * .9, "#8fa8ff", .4);
    c.save(); c.translate(0, .14 * s); c.rotate(a2 + .4); c.beginPath(); c.moveTo(0, -.72 * s); c.lineTo(.05 * s, 0); c.lineTo(0, .72 * s); c.lineTo(-.05 * s, 0); c.closePath(); FS(c, "#7d9cf0"); c.beginPath(); c.arc(0, -.72 * s, s * .06, 0, 7); FS(c, "#fff2b0"); c.restore();
    [[.66, a1, "#e8c060", 1], [.54, a2, "#c9a15a", .42]].forEach(([r, a, col, sq]) => { c.save(); c.translate(0, .14 * s); c.scale(1, sq === 1 ? .94 : .94); c.rotate(a); c.beginPath(); c.arc(0, 0, r * s, 0, 7); c.lineWidth = s * .1; c.strokeStyle = INK; c.stroke(); c.lineWidth = s * .06; c.strokeStyle = col; c.stroke(); for (let i = 0; i < 24; i++) { const an = i * Math.PI / 12, l = i % 2 ? .035 : .07; c.beginPath(); c.moveTo(Math.cos(an) * (r + .03) * s, Math.sin(an) * (r + .03) * s); c.lineTo(Math.cos(an) * (r - l + .03) * s, Math.sin(an) * (r - l + .03) * s); c.lineWidth = s * .02; c.strokeStyle = INK; c.stroke(); } c.restore(); });
    c.lineWidth = Math.max(2, s * .06); c.strokeStyle = INK;
    c.beginPath(); c.ellipse(0, .14 * s, .4 * s, .42 * s, 0, 0, 7); c.fillStyle = rg5(c, -.1 * s, 0, .05 * s, .5 * s, [[0, "#fff6d0"], [1, bc]]); c.fill(); c.stroke();
    for (let i = 0; i < 5; i++) { const a = i * 1.26 + .3; tw5(c, Math.cos(a) * .3 * s, .14 * s + Math.sin(a) * .31 * s, s * .035, .45, "#8f9ad8"); }
    face5(c, s, 0, .16 * s, bl, { d: .13, r: .09, my: .12 }); feet5(c, s, "#c9a15a", .62, .14);
    orbit5(c, s, t, 3, .78, .6, .1, .08, "#cfe0ff", .7);
  },
  folianto(c, s, sp, t, bc, bl) { // Folianto: ein lebendes Buch, Einband als Gesicht, Seiten als Flügel, Lesebändchen als Zunge
    const fl = Math.sin(t * 4), fl2 = Math.sin(t * 4 + .6); shadow5(c, s, .38);
    [-1, 1].forEach(k => { c.save(); c.translate(k * .38 * s, .08 * s); c.rotate(k * (.2 + (k < 0 ? fl : fl2) * .22)); for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(k * .3 * s, (-.3 - i * .07) * s, k * (.6 + i * .06) * s, (-.34 - i * .05) * s, k * (.66 + i * .04) * s, (-.1 + i * .07) * s); c.quadraticCurveTo(k * .3 * s, (.1 + i * .03) * s, 0, .06 * s); c.closePath(); c.fillStyle = i % 2 ? "#fff2d0" : "#f6e6bc"; c.fill(); c.lineWidth = s * .03; c.stroke(); } c.restore(); });
    c.lineWidth = Math.max(2, s * .06); c.beginPath(); c.moveTo(-.4 * s, -.38 * s); c.lineTo(.4 * s, -.38 * s); c.lineTo(.44 * s, .5 * s); c.quadraticCurveTo(0, .6 * s, -.44 * s, .5 * s); c.closePath(); c.fillStyle = lg5(c, -.4 * s, .55 * s, [[0, mx4(bc, "#d88a9a", .3)], [1, mx4(bc, "#3a0f1c", .3)]]); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-.34 * s, -.3 * s); c.lineTo(.34 * s, -.3 * s); c.lineTo(.36 * s, .42 * s); c.lineTo(-.36 * s, .42 * s); c.closePath(); c.strokeStyle = "rgba(255,226,130,.85)"; c.lineWidth = s * .03; c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    [[-.3, -.26], [.3, -.26], [-.32, .38], [.32, .38]].forEach(p => { c.beginPath(); c.arc(p[0] * s, p[1] * s, s * .04, 0, 7); FS(c, "#f2d878"); });
    c.beginPath(); c.ellipse(0, -.06 * s, .17 * s, .17 * s, 0, 0, 7); c.fillStyle = "#fff6dc"; c.fill(); c.stroke(); cEye(c, 0, -.06 * s, s * .13, bl, s); c.strokeStyle = "rgba(200,140,40,.9)"; c.lineWidth = s * .02; c.beginPath(); c.arc(0, -.06 * s, s * .1, -1, 1); c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    c.beginPath(); c.moveTo(-.1 * s, .24 * s); c.quadraticCurveTo(0, .32 * s, .1 * s, .24 * s); c.stroke(); c.beginPath(); c.moveTo(0, .28 * s); c.quadraticCurveTo(.02 * s, .5 * s + Math.sin(t * 3) * s * .03, .08 * s, .66 * s); c.lineTo(.02 * s, .62 * s); c.lineTo(-.04 * s, .66 * s); c.quadraticCurveTo(-.04 * s, .5 * s, -.02 * s, .28 * s); c.closePath(); FS(c, "#d8484c");
    cBlush(c, -.26 * s, .14 * s, s, .45); cBlush(c, .26 * s, .14 * s, s, .45);
    for (let i = 0; i < 3; i++) { const ph = (t * .35 + i / 3) % 1; rune5(c, (-.5 + i * .5) * s, (-.5 - ph * .35) * s, s * .06, i + 1, "rgba(255,226,130," + Math.sin(ph * Math.PI) + ")", s * .02); }
  },
  irrwisper(c, s, sp, t, bc, bl) { // Irrwisper: drei Irrlichter, die einander umtanzen: große Mitte, zwei kleine Begleiter, Funkenschweife
    const col = [["#9cf4de", "#effff8"], ["#5fe0bc", "#d0fff0"], ["#3fd0b0", "#b8f8e6"]];
    glow4(c, 0, .1 * s, s * 1.05, "#3fd0b0", .42);
    const W = [[-.46, .3, .74, 0], [.46, .26, .7, 2.1], [0, .06, 1.1, 4.2]];
    for (let q = 0; q < 3; q++) { const i = [0, 1, 2][q], [bx, by, k, ph] = W[i], x = (bx + Math.sin(t * .9 + ph) * .06) * s, y = (by + Math.sin(t * 1.6 + ph) * .06) * s;
      c.save(); c.translate(x, y); c.scale(k, k);
      for (let j = 1; j <= 4; j++) { c.save(); c.globalAlpha = .26 - j * .05; c.fillStyle = col[i][0]; c.beginPath(); c.ellipse(Math.sin(t * 3 + j + ph) * .05 * s, (.34 + j * .14) * s, s * (.16 - j * .03), s * .08, 0, 0, 7); c.fill(); c.restore(); }
      c.lineWidth = s * .05 / k;
      c.beginPath(); c.moveTo(-.24 * s, .26 * s); c.bezierCurveTo(-.4 * s, -.12 * s, -.1 * s, -.3 * s, Math.sin(t * 6 + ph) * .05 * s, -.66 * s); c.bezierCurveTo(.12 * s, -.3 * s, .4 * s, -.12 * s, .24 * s, .26 * s); c.quadraticCurveTo(0, .4 * s, -.24 * s, .26 * s); c.closePath(); c.fillStyle = rg5(c, 0, .05 * s, .02 * s, .5 * s, [[0, col[i][1]], [1, col[i][0]]]); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-.1 * s, .2 * s); c.bezierCurveTo(-.16 * s, -.02 * s, 0, -.12 * s, 0, -.32 * s); c.bezierCurveTo(.04 * s, -.1 * s, .16 * s, 0, .1 * s, .2 * s); c.closePath(); c.fillStyle = "rgba(255,255,255,.7)"; c.fill();
      c.lineWidth = s * .035 / k; cEye(c, -.1 * s, .0, s * .08, bl, s); cEye(c, .1 * s, .0, s * .08, bl, s); c.restore(); }
    for (let i = 0; i < 7; i++) { const ph = (t * .3 + i / 7) % 1; tw5(c, Math.sin(i * 2.4 + t) * .75 * s, (.6 - ph * 1.1) * s, s * .04, Math.sin(ph * Math.PI), "#e8fff6"); }
  }
});

/* ===== Fabelhaft, Glorreich, Erhaben ===== */
const tp5 = u => mixHex("#2fe0d0", "#ff6ec7", Math.max(0, Math.min(1, u)));
const tpg5 = (c, x0, y0, x1, y1, a) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, hexA("#2fe0d0", a == null ? 1 : a)); g.addColorStop(1, hexA("#ff6ec7", a == null ? 1 : a)); return g; };
const ray5 = (c, n, r0, r1, w, rot, cols) => { c.save(); c.rotate(rot); for (let i = 0; i < n; i++) { c.rotate(Math.PI * 2 / n); c.beginPath(); c.moveTo(-w * .5, -r0); c.lineTo(0, -r1); c.lineTo(w * .5, -r0); c.closePath(); c.fillStyle = cols(i); c.fill(); } c.restore(); };
const facet5 = (c, pts, col, lw) => { const lw0 = c.lineWidth; c.lineWidth = Math.max(1.4, lw0 * .5); c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fillStyle = col; c.fill(); if (lw !== 0) c.stroke(); c.lineWidth = lw0; };
const ribbon5 = (c, s, t, x0, y0, len, dir, amp, ph, w, u0) => { // wehendes Band, Turkis nach Rosa
  const n = 14; for (let pass = 0; pass < 2; pass++) { c.beginPath(); for (let i = 0; i <= n; i++) { const u = i / n, x = x0 + dir * len * u * s * .8 + Math.sin(t * 2.2 + ph + u * 4) * amp * s * u * .3, y = y0 * s + u * len * s * .55 + Math.sin(t * 2.6 + ph + u * 3.2) * amp * s * u * .4; i ? c.lineTo(x, y) : c.moveTo(x, y); }
    if (pass === 0) { c.strokeStyle = INK; c.lineWidth = w * s + s * .05; c.stroke(); } else { c.strokeStyle = tpg5(c, x0, y0 * s, x0 + dir * len * s * .8, (y0 + len * .55) * s); c.lineWidth = w * s; c.stroke(); } } c.strokeStyle = INK; };
Object.assign(FORMS, {
  chronikon(c, s, sp, t, bc, bl) { // Chronikon: eine Sanduhr, in der kleine Zeiten rieseln; Messingrahmen, kreisende Ziffernringe, Zeigerarme
    const fl = ((t * .5) % 1); glow4(c, 0, 0, s * 1.0, "#ffd070", .4);
    c.save(); c.translate(0, .04 * s); c.rotate(t * .3); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.save(); c.translate(Math.cos(a) * .86 * s, Math.sin(a) * .86 * s); c.rotate(a + Math.PI / 2); c.fillStyle = "#6a4a1a"; c.font = "bold " + Math.round(s * .17) + "px serif"; c.textAlign = "center"; c.fillText(["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"][i], 0, 0); c.restore(); } c.restore();
    const bulb = (y0, dir) => { c.beginPath(); c.moveTo(-.4 * s, y0 * s); c.bezierCurveTo(-.46 * s, (y0 + dir * .3) * s, -.12 * s, (y0 + dir * .34) * s, -.05 * s, (y0 + dir * .5) * s); c.lineTo(.05 * s, (y0 + dir * .5) * s); c.bezierCurveTo(.12 * s, (y0 + dir * .34) * s, .46 * s, (y0 + dir * .3) * s, .4 * s, y0 * s); c.closePath(); };
    bulb(-.58, 1); c.fillStyle = "rgba(255,246,214,.9)"; c.fill(); c.stroke(); bulb(.64, -1); c.fillStyle = "rgba(255,246,214,.9)"; c.fill(); c.stroke();
    c.save(); bulb(.64, -1); c.clip(); c.fillStyle = lg5(c, .2 * s, .66 * s, [[0, "#ffe27a"], [1, "#e0a22a"]]); c.beginPath(); c.moveTo(-.5 * s, .66 * s); c.lineTo(-.5 * s, .48 * s); c.quadraticCurveTo(0, (.2 - fl * .1) * s, .5 * s, .48 * s); c.lineTo(.5 * s, .66 * s); c.closePath(); c.fill(); c.restore();
    c.save(); bulb(-.58, 1); c.clip(); c.fillStyle = "#ffe27a"; c.beginPath(); c.moveTo(-.5 * s, -.58 * s); c.lineTo(.5 * s, -.58 * s); c.lineTo(.5 * s, (-.34 + fl * .16) * s); c.quadraticCurveTo(0, (-.18 + fl * .12) * s, -.5 * s, (-.34 + fl * .16) * s); c.closePath(); c.fill(); c.restore();
    c.strokeStyle = "#e0a22a"; c.lineWidth = s * .03; c.beginPath(); c.moveTo(0, .0); c.lineTo(0, .5 * s); c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    for (let i = 0; i < 6; i++) { const u = (fl + i / 6) % 1; c.fillStyle = "#ffe27a"; c.beginPath(); c.arc(Math.sin(i * 9) * s * .02, (.0 + u * .46) * s, s * .02, 0, 7); c.fill(); }
    c.beginPath(); c.moveTo(-.46 * s, -.64 * s); c.lineTo(.46 * s, -.64 * s); c.lineTo(.46 * s, -.56 * s); c.lineTo(-.46 * s, -.56 * s); c.closePath(); FS(c, "#c98a2a"); c.beginPath(); c.moveTo(-.46 * s, .7 * s); c.lineTo(.46 * s, .7 * s); c.lineTo(.46 * s, .62 * s); c.lineTo(-.46 * s, .62 * s); c.closePath(); FS(c, "#c98a2a");
    [-1, 1].forEach(k => { c.beginPath(); c.moveTo(k * .42 * s, -.58 * s); c.lineTo(k * .42 * s, .64 * s); c.lineWidth = s * .07; c.stroke(); c.strokeStyle = "#e0a22a"; c.lineWidth = s * .04; c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06); [-.3, .0, .3].forEach(y => { c.beginPath(); c.arc(k * .42 * s, y * s, s * .035, 0, 7); FS(c, "#fff2b0"); }); });
    c.beginPath(); c.ellipse(0, -.28 * s, .15 * s, .16 * s, 0, 0, 7); c.fillStyle = "#fffbea"; c.fill(); c.stroke(); cEye(c, -.06 * s, -.3 * s, s * .06, bl, s); cEye(c, .06 * s, -.3 * s, s * .06, bl, s); mouth4(c, 0, -.22 * s, s * .8, false);
    [-1, 1].forEach(k => { c.save(); c.translate(k * .64 * s, -.1 * s); c.rotate(k * (.4 + Math.sin(t * 2 + k) * .12)); c.beginPath(); c.moveTo(0, 0); c.lineTo(k * .2 * s, -.06 * s); c.lineTo(k * .34 * s, 0); c.lineTo(k * .2 * s, .06 * s); c.closePath(); FS(c, "#e0a22a"); c.beginPath(); c.arc(0, 0, s * .06, 0, 7); FS(c, "#fff2b0"); c.restore(); });
    orbit5(c, s, t, 5, .75, .35, .0, .07, "#fff2b0", -.8);
  },
  trugbild(c, s, sp, t, bc, bl) { // Trugbild: ein verzauberter Standspiegel, im Glas ein Wesen mit eigenem Willen (es zwinkert zuerst); gesprungene Ränder, Splitter schweben
    const wk = Math.sin(t * .9) > .86; glow4(c, 0, 0, s * 1.0, "#8aa0ff", .4);
    c.save(); c.globalAlpha = .45; c.translate(.2 * s, .06 * s); c.beginPath(); c.ellipse(0, 0, .44 * s, .6 * s, 0, 0, 7); c.fillStyle = "#b8c4ff"; c.fill(); c.stroke(); c.restore();
    const oval = (rx, ry, y0) => { c.beginPath(); c.moveTo(0, (y0 - ry) * s); c.bezierCurveTo(rx * 1.2 * s, (y0 - ry) * s, rx * 1.1 * s, (y0 + ry) * s, 0, (y0 + ry) * s); c.bezierCurveTo(-rx * 1.1 * s, (y0 + ry) * s, -rx * 1.2 * s, (y0 - ry) * s, 0, (y0 - ry) * s); c.closePath(); };
    oval(.42, .62, .02); c.fillStyle = lg5(c, -.6 * s, .6 * s, [[0, "#c8d4ff"], [.5, "#8a9ae8"], [1, "#4a56b8"]]); c.fill(); c.lineWidth = s * .09; c.stroke(); c.lineWidth = Math.max(2, s * .06);
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; tw5(c, Math.cos(a) * .44 * s, .02 * s + Math.sin(a) * .64 * s, s * .05, .9, "#fff2b0"); }
    oval(.34, .52, .02); c.fillStyle = rg5(c, 0, -.1 * s, .05 * s, .6 * s, [[0, "#f4fbff"], [.55, bc], [1, "#9ab4f0"]]); c.fill(); c.lineWidth = s * .03; c.stroke(); c.lineWidth = Math.max(2, s * .06);
    c.save(); oval(.34, .52, .02); c.clip(); const sh = ((t * .35) % 2.2 - .6) * s; c.fillStyle = "rgba(255,255,255,.5)"; c.beginPath(); c.moveTo(-.6 * s + sh, -.6 * s); c.lineTo(-.4 * s + sh, -.6 * s); c.lineTo(-.1 * s + sh, .6 * s); c.lineTo(-.3 * s + sh, .6 * s); c.closePath(); c.fill();
    c.strokeStyle = "rgba(60,70,150,.5)"; c.lineWidth = s * .02; c.beginPath(); c.moveTo(.2 * s, -.5 * s); c.lineTo(.08 * s, -.18 * s); c.lineTo(.22 * s, .05 * s); c.moveTo(.08 * s, -.18 * s); c.lineTo(-.04 * s, -.1 * s); c.stroke();
    // Spiegelwesen: kleiner Geist mit Kappe
    c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .055); c.beginPath(); c.moveTo(-.2 * s, .38 * s); c.bezierCurveTo(-.26 * s, -.02 * s, .26 * s, -.02 * s, .2 * s, .38 * s); for (let i = 3; i >= -3; i--) c.quadraticCurveTo((i * .066 + .033) * s, (.46 + Math.sin(t * 3 + i) * .03) * s, i * .066 * s, .38 * s); c.closePath(); c.fillStyle = "rgba(255,255,255,.95)"; c.fill(); c.stroke();
    cEye(c, -.08 * s, .14 * s, s * .065, bl, s); if (wk) { c.beginPath(); c.moveTo(.04 * s, .14 * s); c.lineTo(.14 * s, .14 * s); c.lineWidth = s * .035; c.stroke(); } else cEye(c, .08 * s, .14 * s, s * .065, bl, s); mouth4(c, 0, .26 * s, s * .9, wk); cBlush(c, -.16 * s, .22 * s, s, .5); cBlush(c, .16 * s, .22 * s, s, .5);
    c.restore();
    oval(.42, .62, .02); c.strokeStyle = "#b8c4ff"; c.lineWidth = s * .03; c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    c.beginPath(); c.moveTo(-.1 * s, .66 * s); c.lineTo(-.22 * s, .8 * s); c.moveTo(.1 * s, .66 * s); c.lineTo(.22 * s, .8 * s); c.lineWidth = s * .06; c.stroke(); c.lineWidth = Math.max(2, s * .06);
    for (let i = 0; i < 5; i++) { const a = t * .5 + i * 1.26, x = Math.cos(a) * .68 * s, y = (.0 + Math.sin(a * 1.4 + i) * .5) * s; c.save(); c.translate(x, y); c.rotate(a); facet5(c, [[0, -s * .08], [s * .05, 0], [0, s * .08], [-s * .04, 0]], "rgba(220,235,255,.9)"); c.restore(); }
  },
  luesterfee(c, s, sp, t, bc, bl) { // Lüsterfee: ein kristallener Kronleuchter mit Glasflügeln, fünf Kerzenflammen, klingenden Prismen; Kette zum Himmel
    glow4(c, 0, -.1 * s, s * 1.05, "#ffd070", .5);
    c.strokeStyle = INK; c.lineWidth = s * .05; c.beginPath(); c.moveTo(0, -1.2 * s); c.lineTo(0, -.62 * s); c.stroke(); c.setLineDash([s * .07, s * .04]); c.strokeStyle = "#e8b53a"; c.lineWidth = s * .03; c.stroke(); c.setLineDash([]); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    [-1, 1].forEach(k => { c.save(); c.translate(k * .22 * s, -.06 * s); c.rotate(k * (-.6 + Math.sin(t * 6) * .12)); c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(k * .5 * s, -.7 * s, k * .9 * s, -.3 * s, k * .66 * s, .1 * s); c.bezierCurveTo(k * .5 * s, .26 * s, k * .2 * s, .12 * s, 0, 0); c.closePath(); c.fillStyle = "rgba(235,248,255,.7)"; c.fill(); c.stroke(); c.strokeStyle = "rgba(150,190,230,.6)"; c.lineWidth = s * .02; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(k * .4 * s, -.3 * s, k * .64 * s, .06 * s); c.moveTo(0, 0); c.quadraticCurveTo(k * .4 * s, -.2 * s, k * .5 * s, .18 * s); c.stroke(); c.restore(); });
    c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    c.beginPath(); c.moveTo(-.5 * s, -.3 * s); c.quadraticCurveTo(-.54 * s, -.1 * s, -.3 * s, -.14 * s); c.lineTo(.3 * s, -.14 * s); c.quadraticCurveTo(.54 * s, -.1 * s, .5 * s, -.3 * s); c.stroke(); c.lineWidth = s * .06; c.stroke(); c.strokeStyle = "#e8b53a"; c.lineWidth = s * .035; c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    [-.5, -.25, 0, .25, .5].forEach((x, i) => { c.beginPath(); c.rect((x - .05) * s, -.4 * s, s * .1, s * .1); FS(c, "#fff6dc"); flame5(c, x * s, -.4 * s, s * .12, s * .26, t, i * 1.3, "#ffb02a", "#fff2a0"); });
    c.beginPath(); c.moveTo(0, -.64 * s); c.bezierCurveTo(.16 * s, -.5 * s, .34 * s, -.14 * s, .3 * s, .1 * s); c.bezierCurveTo(.26 * s, .34 * s, .1 * s, .44 * s, 0, .56 * s); c.bezierCurveTo(-.1 * s, .44 * s, -.26 * s, .34 * s, -.3 * s, .1 * s); c.bezierCurveTo(-.34 * s, -.14 * s, -.16 * s, -.5 * s, 0, -.64 * s); c.closePath();
    c.fillStyle = rg5(c, -.08 * s, -.04 * s, .03 * s, .5 * s, [[0, "#ffffff"], [.5, "#fff2c0"], [1, "#e8b53a"]]); c.fill(); c.stroke();
    c.strokeStyle = "rgba(190,150,60,.6)"; c.lineWidth = s * .02; c.beginPath(); c.moveTo(0, -.6 * s); c.lineTo(-.16 * s, .1 * s); c.lineTo(0, .5 * s); c.moveTo(0, -.6 * s); c.lineTo(.16 * s, .1 * s); c.lineTo(0, .5 * s); c.moveTo(-.28 * s, .1 * s); c.lineTo(.28 * s, .1 * s); c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    face5(c, s, 0, .0, bl, { d: .1, r: .075, my: .12 });
    [[-.42, .22], [-.22, .4], [.22, .4], [.42, .22], [0, .66]].forEach((p, i) => { const sw = Math.sin(t * 3 + i * 1.3) * s * .02; c.save(); c.translate(p[0] * s + sw, p[1] * s); facet5(c, [[0, -s * .12], [s * .07, 0], [0, s * .12], [-s * .07, 0]], i % 2 ? "rgba(200,230,255,.95)" : "rgba(255,210,240,.95)"); c.restore(); });
    for (let i = 0; i < 6; i++) tw5(c, Math.sin(i * 2.2 + t * .8) * .8 * s, (-.6 + ((t * .3 + i / 6) % 1) * 1.3) * s, s * .05, .8, "#fff6c0");
  },
  purpurmagus(c, s, sp, t, bc, bl) { // Purpurmagus: Zauberer in weitem Sternenmantel, schiefem Spitzhut, Nebelbart, Karminstab; ein Buch umkreist ihn
    glow4(c, 0, 0, s * 1.1, "#a050ff", .45); const sw = Math.sin(t * 1.4) * .03;
    c.beginPath(); c.moveTo(-.2 * s, -.2 * s); c.bezierCurveTo(-.6 * s, .1 * s, -.7 * s, .5 * s, -.64 * s, .68 * s); for (let i = 0; i < 7; i++) c.quadraticCurveTo((-.64 + i * .19 + .1) * s, (.78 + (i % 2 ? .0 : .06) + Math.sin(t * 3 + i) * .02) * s, (-.64 + (i + 1) * .19) * s, .68 * s); c.bezierCurveTo(.7 * s, .5 * s, .6 * s, .1 * s, .2 * s, -.2 * s); c.closePath();
    c.fillStyle = lg5(c, -.2 * s, .75 * s, [[0, "#9a4ae0"], [.6, "#5a1a98"], [1, "#2a0a5a"]]); c.fill(); c.stroke();
    for (let i = 0; i < 11; i++) { const x = Math.sin(i * 3.1) * .46 * s, y = (.05 + (i * .067)) * s; tw5(c, x, y, s * (.035 + (i % 3) * .015), .5 + .5 * Math.sin(t * 2 + i), "#ffe9a0"); }
    c.beginPath(); c.moveTo(-.26 * s, -.14 * s); c.quadraticCurveTo(0, -.02 * s, .26 * s, -.14 * s); c.lineTo(.3 * s, -.02 * s); c.quadraticCurveTo(0, .1 * s, -.3 * s, -.02 * s); c.closePath(); FS(c, "#e0303c");
    c.beginPath(); c.moveTo(-.07 * s, -.12 * s); c.lineTo(.07 * s, -.12 * s); c.lineTo(.0, .0); c.closePath(); FS(c, "#ffd84a");
    c.beginPath(); c.ellipse(0, -.3 * s, .22 * s, .22 * s, 0, 0, 7); c.fillStyle = "#f6dfc8"; c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-.2 * s, -.22 * s); c.bezierCurveTo(-.3 * s, .2 * s, -.06 * s, .34 * s, 0, .6 * s + Math.sin(t * 2) * s * .02); c.bezierCurveTo(.06 * s, .34 * s, .3 * s, .2 * s, .2 * s, -.22 * s); c.quadraticCurveTo(0, -.12 * s, -.2 * s, -.22 * s); c.closePath(); c.fillStyle = lg5(c, -.2 * s, .6 * s, [[0, "#ffffff"], [1, "#d8c8ff"]]); c.fill(); c.stroke();
    cEye(c, -.09 * s, -.3 * s, s * .065, bl, s); cEye(c, .09 * s, -.3 * s, s * .065, bl, s); cBlush(c, -.17 * s, -.2 * s, s, .45); cBlush(c, .17 * s, -.2 * s, s, .45); mouth4(c, 0, -.18 * s, s * .8, false);
    c.save(); c.translate(0, -.42 * s); c.rotate(.12 + sw); c.beginPath(); c.ellipse(0, .02 * s, .52 * s, .12 * s, 0, 0, 7); FS(c, "#6a22b0"); c.beginPath(); c.moveTo(-.3 * s, 0); c.bezierCurveTo(-.2 * s, -.4 * s, -.1 * s, -.7 * s, .2 * s, -1.0 * s + Math.sin(t * 2) * s * .02); c.bezierCurveTo(.2 * s, -.7 * s, .3 * s, -.3 * s, .3 * s, 0); c.quadraticCurveTo(0, .1 * s, -.3 * s, 0); c.closePath(); c.fillStyle = lg5(c, -1 * s, 0, [[0, "#9a4ae0"], [1, "#4a1488"]]); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(0, -.02 * s, .31 * s, .06 * s, 0, 0, 7); FS(c, "#e0303c"); tw5(c, -.04 * s, -.4 * s, s * .08, 1, "#ffe9a0"); tw5(c, .1 * s, -.68 * s, s * .06, .9, "#ffe9a0"); c.beginPath(); c.arc(.2 * s, -1.0 * s, s * .05, 0, 7); FS(c, "#ffe9a0"); c.restore();
    c.beginPath(); c.moveTo(.5 * s, .74 * s); c.lineTo(.5 * s, -.3 * s); c.lineWidth = s * .08; c.stroke(); c.strokeStyle = "#a8742a"; c.lineWidth = s * .045; c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    glow4(c, .5 * s, -.42 * s, s * .36, "#ff3050", .8); star4(c, .5 * s, -.42 * s, s * .16, 5, .5); FS(c, "#ff4060");
    const a = t * .8; c.save(); c.translate(Math.cos(a) * .62 * s, .1 * s + Math.sin(a) * .22 * s); c.rotate(Math.sin(a) * .3); c.beginPath(); c.rect(-s * .1, -s * .08, s * .2, s * .16); FS(c, "#e0303c"); c.beginPath(); c.moveTo(-s * .1, -s * .08); c.lineTo(s * .1, -s * .08); c.stroke(); c.strokeStyle = "#ffe9a0"; c.lineWidth = s * .02; c.strokeRect(-s * .07, -s * .05, s * .14, s * .1); c.restore();
    c.strokeStyle = INK; for (let i = 0; i < 4; i++) { const ph = (t * .3 + i / 4) % 1; tw5(c, Math.sin(i * 2.7) * .8 * s, (.5 - ph) * 1.2 * s, s * .04, Math.sin(ph * Math.PI), "#ff9ab0"); }
  },
  aschephoenix(c, s, sp, t, bc, bl) { // Aschephönix: Feuervogel, der aus der Asche aufsteigt; Flammenschwingen, Schweif aus Glut, Haube aus Flamme, ein Aschehaufen als Nest
    const fl = Math.sin(t * 4) * .1; glow4(c, 0, -.05 * s, s * 1.15, "#ff6a1c", .55);
    c.beginPath(); c.moveTo(-.55 * s, .7 * s); c.quadraticCurveTo(-.4 * s, .4 * s, 0, .46 * s); c.quadraticCurveTo(.4 * s, .4 * s, .55 * s, .7 * s); c.closePath(); FS(c, "#5a4a48"); c.fillStyle = "#8a7a76"; [[-.3, .58], [.1, .54], [.32, .62]].forEach(p => { c.beginPath(); c.ellipse(p[0] * s, p[1] * s, s * .09, s * .05, 0, 0, 7); c.fill(); c.stroke(); });
    for (let i = 0; i < 5; i++) { const w = (i - 2) * .16; c.save(); c.translate(w * s, .46 * s); c.rotate(w * .8); c.beginPath(); c.moveTo(-.06 * s, 0); c.bezierCurveTo(-.16 * s, .2 * s, -.05 * s, .4 * s + Math.sin(t * 5 + i) * s * .03, 0, .6 * s - Math.abs(i - 2) * .05 * s); c.bezierCurveTo(.05 * s, .4 * s, .16 * s, .2 * s, .06 * s, 0); c.closePath(); c.fillStyle = i % 2 ? "#ffb02a" : "#e0501c"; c.fill(); c.stroke(); c.restore(); }
    [-1, 1].forEach(k => { c.save(); c.translate(k * .24 * s, .12 * s); c.rotate(k * (.75 + fl)); for (let i = 0; i < 5; i++) { c.save(); c.rotate(k * (-.5 + i * .24)); c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(k * .24 * s, -.18 * s, k * .34 * s, -(.44 + i * .05) * s, k * .08 * s, -(.8 - i * .05) * s + Math.sin(t * 6 + i) * s * .03); c.bezierCurveTo(-k * .1 * s, -.4 * s, -k * .02 * s, -.2 * s, 0, 0); c.closePath(); c.fillStyle = ["#ff3a1c", "#ff6a1c", "#ff9a2a", "#ffc84a", "#fff0a0"][i]; c.fill(); c.stroke(); c.restore(); } c.restore(); });
    c.beginPath(); c.ellipse(0, .14 * s, .34 * s, .4 * s, 0, 0, 7); c.fillStyle = rg5(c, -.06 * s, .0, .04 * s, .5 * s, [[0, "#fff0a0"], [.5, "#ffb02a"], [1, "#e0501c"]]); c.fill(); c.stroke();
    c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = s * .03; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(0, .3 * s, s * (.16 + i * .06), Math.PI * 1.15, Math.PI * 1.85); c.stroke(); } c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    for (let i = 0; i < 3; i++) flame5(c, (-.1 + i * .1) * s, -.2 * s, s * .16, s * (.34 + (i === 1 ? .16 : 0)), t, i * 1.7, ["#ff6a1c", "#ff9a2a", "#ff6a1c"][i], "#fff0a0");
    c.beginPath(); c.moveTo(-.07 * s, .06 * s); c.lineTo(.07 * s, .06 * s); c.lineTo(0, .18 * s); c.closePath(); FS(c, "#ffe27a");
    cEye(c, -.15 * s, -.04 * s, s * .09, bl, s); cEye(c, .15 * s, -.04 * s, s * .09, bl, s); cBlush(c, -.26 * s, .08 * s, s, .55); cBlush(c, .26 * s, .08 * s, s, .55);
    for (let i = 0; i < 9; i++) { const ph = (t * .35 + i / 9) % 1, x = Math.sin(i * 2.2 + ph * 3) * .6 * s, y = (.4 - ph * 1.4) * s; c.save(); c.globalAlpha = Math.sin(ph * Math.PI); c.fillStyle = i % 3 ? "#ffb02a" : "#ff6a1c"; c.beginPath(); c.arc(x, y, s * (.025 + .015 * (i % 2)), 0, 7); c.fill(); c.restore(); }
  },
  leerenwal(c, s, sp, t, bc, bl) { // Leerenwal: ein Wal aus Nachthimmel, Sternbild-Bauch, Galaxienwirbel im Rücken; Sternenstaub steigt aus dem Blasloch
    glow4(c, 0, .05 * s, s * 1.2, "#6a7aff", .38); const sw = Math.sin(t * 1.6) * .05;
    c.save(); c.translate(0, .1 * s); c.rotate(sw);
    c.beginPath(); c.moveTo(-.74 * s, .06 * s); c.bezierCurveTo(-.74 * s, -.5 * s, .1 * s, -.6 * s, .5 * s, -.3 * s); c.bezierCurveTo(.7 * s, -.14 * s, .66 * s, .3 * s, .4 * s, .44 * s); c.bezierCurveTo(.1 * s, .6 * s, -.5 * s, .56 * s, -.74 * s, .06 * s); c.closePath();
    c.fillStyle = lg5(c, -.6 * s, .6 * s, [[0, "#2c3a8a"], [.6, "#161c50"], [1, "#0a0e30"]]); c.fill(); c.stroke();
    c.save(); c.clip(); c.fillStyle = rg5(c, .0, -.18 * s, .02 * s, .4 * s, [[0, "rgba(255,160,230,.85)"], [.4, "rgba(150,120,255,.5)"], [1, "rgba(60,80,200,0)"]]); c.beginPath(); c.arc(0, -.18 * s, s * .4, 0, 7); c.fill();
    c.strokeStyle = "rgba(255,230,255,.6)"; c.lineWidth = s * .02; for (let k = 0; k < 2; k++) { c.beginPath(); for (let u = 0; u < 4; u += .2) { const r = u * .09 * s, a = u * 1.6 + t * .3 + k * Math.PI; c.lineTo(Math.cos(a) * r, -.18 * s + Math.sin(a) * r * .8); } c.stroke(); }
    c.beginPath(); c.ellipse(.0, .38 * s, .6 * s, .26 * s, -.05, 0, 7); c.fillStyle = "rgba(190,205,255,.55)"; c.fill();
    for (let i = 0; i < 18; i++) tw5(c, Math.sin(i * 12.9) * .62 * s, (Math.cos(i * 7.7) * .42 - .05) * s, s * (.02 + (i % 4) * .01), .5 + .5 * Math.sin(t * 2 + i), "#ffffff");
    c.restore(); c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = s * .02; c.beginPath(); [[-.3, .36], [-.14, .3], [.05, .38], [.22, .32], [.36, .4]].forEach((p, i) => { i ? c.lineTo(p[0] * s, p[1] * s) : c.moveTo(p[0] * s, p[1] * s); }); c.stroke(); [[-.3, .36], [-.14, .3], [.05, .38], [.22, .32], [.36, .4]].forEach(p => tw5(c, p[0] * s, p[1] * s, s * .05, 1, "#fff6c0")); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    c.beginPath(); c.moveTo(-.7 * s, .06 * s); c.bezierCurveTo(-.9 * s, -.04 * s, -1.0 * s, -.3 * s, -.96 * s, -.5 * s + Math.sin(t * 3) * s * .05); c.bezierCurveTo(-.84 * s, -.36 * s, -.78 * s, -.34 * s, -.76 * s, -.28 * s); c.bezierCurveTo(-.7 * s, -.4 * s, -.6 * s, -.5 * s, -.5 * s, -.52 * s + Math.sin(t * 3) * s * .05); c.bezierCurveTo(-.56 * s, -.3 * s, -.6 * s, -.1 * s, -.6 * s, .02 * s); c.closePath(); c.fillStyle = "#2c3a8a"; c.fill(); c.stroke();
    c.beginPath(); c.moveTo(.1 * s, .42 * s); c.bezierCurveTo(.0, .62 * s, -.2 * s, .72 * s, -.3 * s, .66 * s); c.bezierCurveTo(-.2 * s, .54 * s, -.1 * s, .46 * s, -.1 * s, .4 * s); c.closePath(); c.fillStyle = "#3a4aa8"; c.fill(); c.stroke();
    cEye(c, .34 * s, -.04 * s, s * .11, bl, s); cBlush(c, .44 * s, .12 * s, s, .55); c.beginPath(); c.moveTo(.3 * s, .22 * s); c.quadraticCurveTo(.5 * s, .3 * s, .62 * s, .12 * s); c.stroke(); c.restore();
    for (let i = 0; i < 7; i++) { const ph = (t * .4 + i / 7) % 1, x = (.04 + Math.sin(i * 2.3) * .1 + ph * .06) * s, y = (-.52 - ph * .56) * s; c.save(); c.globalAlpha = Math.sin(ph * Math.PI); c.fillStyle = i % 2 ? "#cfe0ff" : "#ffd0f4"; sparkle(c, x, y, s * (.05 + .03 * ph)); c.restore(); }
  }
});

/* Erhabene: Turkis bis Rosa. Gemeinsamer Hintergrund (Aura) wird vor der Form gezeichnet */
function erhabenAura(c, s, t) {
  c.save(); const pu = .85 + .15 * Math.sin(t * 2);
  c.fillStyle = rg5(c, 0, .05 * s, s * .1, s * 1.6 * pu, [[0, "rgba(47,224,208,.55)"], [.45, "rgba(255,110,199,.28)"], [1, "rgba(255,110,199,0)"]]); c.beginPath(); c.arc(0, 0, s * 1.7, 0, 7); c.fill();
  c.save(); c.translate(0, .05 * s); ray5(c, 16, s * .5, s * 1.55 * pu, s * .22, t * .18, i => i % 2 ? "rgba(255,110,199,.2)" : "rgba(47,224,208,.24)"); ray5(c, 8, s * .5, s * 1.05, s * .12, -t * .3, i => "rgba(255,255,255,.22)"); c.restore();
  [[1.18, 1, .5], [1.34, -1, .35]].forEach(([r, d, a], k) => { c.save(); c.translate(0, .05 * s); c.rotate(t * .22 * d); c.setLineDash([s * .1, s * .08]); c.lineWidth = s * .03; c.strokeStyle = tpg5(c, -r * s, 0, r * s, 0, a); c.beginPath(); c.arc(0, 0, r * s, 0, 7); c.stroke(); c.setLineDash([]); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 + k * .4; rune5(c, Math.cos(an) * r * s, Math.sin(an) * r * s, s * .07, i + k * 3, tp5(i / 8), s * .022); } c.restore(); });
  const pr = (t * .6) % 1; c.strokeStyle = tpg5(c, -s, 0, s, 0, .6 * (1 - pr)); c.lineWidth = s * .035; c.beginPath(); c.arc(0, .05 * s, s * (.5 + pr * 1.0), 0, 7); c.stroke();
  for (let i = 0; i < 14; i++) { const ph = (t * .22 + i / 14) % 1, x = Math.sin(i * 2.7 + t * .5) * 1.0 * s, y = (.9 - ph * 2.0) * s; c.globalAlpha = Math.sin(ph * Math.PI) * .95; c.fillStyle = tp5(i / 14); sparkle(c, x, y, s * (.05 + .05 * ((i * 5) % 3) / 2)); }
  c.restore();
}
Object.assign(FORMS, {
  prismara(c, s, sp, t, bc, bl) { // Prismara: Kristallfalter aus Licht, vier Prismenflügel, Edelsteinleib mit Gesicht, Kristallkrone, ein Lichtstrahl teilt sich in Turkis und Rosa
    const fl = Math.sin(t * 2.6) * .08, sh = ((t * .5) % 1.6) - .3;
    [[1, .56, 1.0], [.62, .74, .7]].forEach(([sc, ang, ln], row) => [-1, 1].forEach(k => { c.save(); c.translate(k * .16 * s, (row ? .08 : -.12) * s); c.rotate(k * (row ? .5 + fl : -.38 - fl)); c.scale(k, 1);
      const P = row ? [[0, 0], [.62, .06], [.86, .52], [.42, .66], [.16, .34]] : [[0, 0], [.5, -.66], [.96, -.5], [1.08, -.06], [.62, .26], [.2, .14]];
      c.beginPath(); P.forEach((p, i) => i ? c.lineTo(p[0] * s, p[1] * s) : c.moveTo(p[0] * s, p[1] * s)); c.closePath(); c.fillStyle = tpg5(c, 0, -.6 * s, 1.0 * s, .5 * s, .66); c.fill(); c.stroke();
      c.save(); c.clip(); c.lineWidth = s * .02; c.strokeStyle = "rgba(255,255,255,.75)"; P.forEach((p, i) => { c.beginPath(); c.moveTo(0, 0); c.lineTo(p[0] * s, p[1] * s); c.stroke(); }); c.beginPath(); c.moveTo(P[1][0] * s, P[1][1] * s); P.slice(2).forEach(p => c.lineTo(p[0] * s, p[1] * s)); c.stroke();
      c.fillStyle = "rgba(255,255,255,.5)"; c.beginPath(); c.moveTo((sh - .5) * s, -s); c.lineTo((sh - .36) * s, -s); c.lineTo((sh + .1) * s, s); c.lineTo((sh - .04) * s, s); c.closePath(); c.fill(); c.restore(); c.restore(); }));
    c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    ribbon5(c, s, t, 0, .46, 1.0, 0, .5, 0, .07); ribbon5(c, s, t, -.06 * s, .46, .8, -1, .5, 2, .05); ribbon5(c, s, t, .06 * s, .46, .8, 1, .5, 4, .05);
    const B = [[0, -.58], [.3, -.22], [.34, .22], [0, .66], [-.34, .22], [-.3, -.22]];
    c.beginPath(); B.forEach((p, i) => i ? c.lineTo(p[0] * s, p[1] * s) : c.moveTo(p[0] * s, p[1] * s)); c.closePath(); c.fillStyle = tpg5(c, -.3 * s, -.6 * s, .3 * s, .7 * s); c.fill(); c.stroke();
    c.lineWidth = s * .025; c.strokeStyle = "rgba(255,255,255,.7)"; [[[0, -.58], [.0, -.22], [.3, -.22]], [[0, -.22], [-.3, -.22]], [[0, -.22], [.0, .66]], [[-.34, .22], [0, .22], [.34, .22]]].forEach(l => { c.beginPath(); l.forEach((p, i) => i ? c.lineTo(p[0] * s, p[1] * s) : c.moveTo(p[0] * s, p[1] * s)); c.stroke(); });
    c.fillStyle = "rgba(255,255,255,.4)"; facet5(c, [[0, -.58 * s], [.3 * s, -.22 * s], [0, -.22 * s]], "rgba(255,255,255,.4)", 0); facet5(c, [[-.34 * s, .22 * s], [0, .66 * s], [0, .22 * s]], "rgba(20,30,90,.25)", 0); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    c.beginPath(); c.ellipse(0, -.06 * s, .24 * s, .26 * s, 0, 0, 7); c.fillStyle = "rgba(255,255,255,.9)"; c.fill(); c.lineWidth = s * .035; c.stroke(); c.lineWidth = Math.max(2, s * .06);
    cEye(c, -.09 * s, -.08 * s, s * .085, bl, s); cEye(c, .09 * s, -.08 * s, s * .085, bl, s); mouth4(c, 0, .04 * s, s * 1.1, Math.sin(t * 1.5) > .4); cBlush(c, -.17 * s, .0, s, .55); cBlush(c, .17 * s, .0, s, .55);
    [[-.34, -.12, -.3], [-.17, -.36, -.12], [0, -.56, 0], [.17, -.36, .12], [.34, -.12, .3]].forEach((p, i) => { const h = [.26, .34, .46, .34, .26][i]; c.save(); c.translate(p[0] * s * .8, (-.56 + Math.abs(p[0]) * .6) * s); c.rotate(p[2]); facet5(c, [[-s * .06, 0], [0, -h * s], [s * .06, 0]], tp5(i / 4)); c.restore(); });
    glow4(c, 0, -.9 * s, s * .2, "#ffffff", .9); tw5(c, 0, -.92 * s, s * .12, 1, "#ffffff");
    for (let i = 0; i < 5; i++) { const a = t * .7 + i * 1.256; c.save(); c.translate(Math.cos(a) * .88 * s, .06 * s + Math.sin(a) * .36 * s); c.rotate(a * 2); facet5(c, [[0, -s * .1], [s * .08, s * .06], [-s * .08, s * .06]], tp5(i / 5)); c.restore(); }
  },
  chronael(c, s, sp, t, bc, bl) { // Chronael: Engel der Zeit: Zifferblatt-Heiligenschein, Flügel aus Uhrzeigern, Perlenleib mit Mondgesicht, Zahnradkrone, Sandbänder
    c.save(); c.translate(0, -.08 * s); c.rotate(-t * .12); c.beginPath(); c.arc(0, 0, s * .98, 0, 7); c.lineWidth = s * .08; c.stroke(); c.strokeStyle = tpg5(c, -s, 0, s, 0); c.lineWidth = s * .045; c.stroke(); c.strokeStyle = INK;
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.beginPath(); c.moveTo(Math.cos(a) * s * .98, Math.sin(a) * s * .98); c.lineTo(Math.cos(a) * s * (i % 3 ? .86 : .8), Math.sin(a) * s * (i % 3 ? .86 : .8)); c.lineWidth = s * (i % 3 ? .03 : .055); c.stroke(); } c.restore(); c.lineWidth = Math.max(2, s * .06);
    const sw = Math.sin(t * 1.8) * .06;
    [-1, 1].forEach(k => { for (let i = 0; i < 6; i++) { const a = k * (.62 + i * .31 + sw * (i % 2 ? 1 : -1)), L = (1.12 - i * .1) * s; c.save(); c.translate(k * .2 * s, .0); c.rotate(a); c.lineWidth = s * .035; c.beginPath(); c.moveTo(0, 0); c.lineTo(-.09 * s, -.22 * s); c.lineTo(0, -L); c.lineTo(.09 * s, -.22 * s); c.closePath(); c.fillStyle = tpg5(c, 0, 0, 0, -L); c.fill(); c.stroke(); c.lineWidth = s * .02; c.strokeStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.moveTo(0, -.1 * s); c.lineTo(0, -L * .85); c.stroke(); c.strokeStyle = INK; c.beginPath(); c.arc(0, -.2 * s, s * .035, 0, 7); c.fillStyle = "#ffffff"; c.fill(); c.stroke(); c.restore(); } });
    c.lineWidth = Math.max(2, s * .06);
    ribbon5(c, s, t, -.1 * s, .5, 1.0, -1, .5, 0, .06); ribbon5(c, s, t, .1 * s, .5, 1.0, 1, .5, 2.5, .06); ribbon5(c, s, t, 0, .56, .9, 0, .4, 5, .05);
    c.beginPath(); c.ellipse(0, .08 * s, .38 * s, .44 * s, 0, 0, 7); c.fillStyle = rg5(c, -.12 * s, -.12 * s, .04 * s, .6 * s, [[0, "#ffffff"], [.5, bc], [1, "#9ae0ee"]]); c.fill(); c.stroke();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.beginPath(); c.moveTo(Math.cos(a) * .3 * s, .08 * s + Math.sin(a) * .35 * s); c.lineTo(Math.cos(a) * .35 * s, .08 * s + Math.sin(a) * .4 * s); c.lineWidth = s * .02; c.stroke(); } c.lineWidth = Math.max(2, s * .06);
    c.beginPath(); c.arc(.26 * s, -.1 * s, s * .09, Math.PI * .5, Math.PI * 1.5); c.fillStyle = "#fff2b0"; c.fill(); c.lineWidth = s * .03; c.stroke(); c.lineWidth = Math.max(2, s * .06);
    face5(c, s, -.02 * s, .1 * s, bl, { d: .12, r: .085, my: .11 });
    const ma = t * .8 - Math.PI / 2; c.lineWidth = s * .03; c.beginPath(); c.moveTo(0, .08 * s); c.lineTo(Math.cos(ma) * .19 * s, .08 * s + Math.sin(ma) * .23 * s); c.stroke(); c.lineWidth = Math.max(2, s * .06);
    const gear = (x, y, r, n, a0, col) => { const lw0 = c.lineWidth; c.lineWidth = s * .03; c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = a0 + i * Math.PI / n, q = i % 2 ? r * .78 : r; i ? c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : c.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); FS(c, col); c.beginPath(); c.arc(x, y, r * .3, 0, 7); FS(c, "#ffffff"); c.lineWidth = lw0; };
    gear(-.16 * s, -.46 * s, s * .15, 8, t * 1.4, tp5(.2)); gear(.16 * s, -.48 * s, s * .13, 7, -t * 1.7, tp5(.8)); gear(0, -.58 * s, s * .1, 6, t * 2, tp5(.5));
    for (let i = 0; i < 6; i++) { const u = (t * .3 + i / 6) % 1; c.save(); c.globalAlpha = Math.sin(u * Math.PI); c.fillStyle = tp5(i / 6); c.beginPath(); c.arc(Math.sin(i * 2.4) * .5 * s, (-.5 + u * 1.2) * s, s * .025, 0, 7); c.fill(); c.restore(); }
  },
  urvox(c, s, sp, t, bc, bl) { // Urvox: das Erste Wort: ein singender Perlenleib im Schall-Lotos; Schallringe, Runenbuchstaben, Flammenkrone, Bänder
    const sing = Math.sin(t * 2.4) * .5 + .5;
    c.save(); c.translate(0, .06 * s); c.rotate(t * .1); for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); c.beginPath(); c.moveTo(0, -.3 * s); c.bezierCurveTo(-.3 * s, -.5 * s, -.26 * s, -.9 * s, 0, -1.0 * s); c.bezierCurveTo(.26 * s, -.9 * s, .3 * s, -.5 * s, 0, -.3 * s); c.closePath(); c.fillStyle = tpg5(c, -.3 * s, -s, .3 * s, -.3 * s, .75); c.fill(); c.stroke(); c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = s * .02; c.beginPath(); c.moveTo(0, -.34 * s); c.lineTo(0, -.9 * s); c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06); } c.restore();
    for (let i = 0; i < 3; i++) { const ph = (t * .5 + i / 3) % 1; c.save(); c.globalAlpha = (1 - ph) * .9; c.strokeStyle = tpg5(c, -s, 0, s, 0); c.lineWidth = s * .04; c.beginPath(); c.arc(0, .06 * s, s * (.45 + ph * .55), -.9, .9); c.stroke(); c.beginPath(); c.arc(0, .06 * s, s * (.45 + ph * .55), Math.PI - .9, Math.PI + .9); c.stroke(); c.restore(); }
    c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    ribbon5(c, s, t, -.12 * s, .46, 1.0, -1, .6, 0, .06); ribbon5(c, s, t, .12 * s, .46, 1.0, 1, .6, 3, .06);
    c.beginPath(); c.ellipse(0, .06 * s, .4 * s, .46 * s, 0, 0, 7); c.fillStyle = rg5(c, -.12 * s, -.14 * s, .04 * s, .66 * s, [[0, "#ffffff"], [.45, bc], [1, tp5(.55)]]); c.fill(); c.stroke();
    c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = s * .035; c.beginPath(); c.arc(0, .06 * s, s * .32, Math.PI * 1.1, Math.PI * 1.4); c.stroke(); c.strokeStyle = INK; c.lineWidth = Math.max(2, s * .06);
    cEye(c, -.13 * s, -.04 * s, s * .095, bl, s); cEye(c, .13 * s, -.04 * s, s * .095, bl, s); cBlush(c, -.25 * s, .1 * s, s, .55); cBlush(c, .25 * s, .1 * s, s, .55);
    c.beginPath(); c.ellipse(0, .2 * s, s * (.06 + .05 * sing), s * (.05 + .08 * sing), 0, 0, 7); c.fillStyle = "#c03070"; c.fill(); c.lineWidth = s * .035; c.stroke(); c.lineWidth = Math.max(2, s * .06);
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .36, base = [-.2 + i * .1, -.4 + Math.abs(i - 2) * .03]; flame5(c, base[0] * s, base[1] * s, s * (.14 - Math.abs(i - 2) * .015), s * (.4 - Math.abs(i - 2) * .06), t, i * 1.1, tp5(i / 4), "#ffffff"); }
    for (let i = 0; i < 8; i++) { const a = -t * .5 + i * Math.PI / 4, x = Math.cos(a) * .96 * s, y = .06 * s + Math.sin(a) * .5 * s; c.beginPath(); c.roundRect ? c.roundRect(x - s * .1, y - s * .1, s * .2, s * .2, s * .04) : c.rect(x - s * .1, y - s * .1, s * .2, s * .2); c.fillStyle = "rgba(255,255,255,.9)"; c.fill(); c.lineWidth = s * .03; c.stroke(); rune5(c, x, y, s * .055, i, tp5(i / 8), s * .02); }
  }
});

/* ===== Mutationen der Sanktum-Instrumente: Zusatzzeichnung über dem Tonling ===== */
function mutFx5(c, s, t, mut) {
  if (mut === "irr") { c.save(); for (let i = 0; i < 3; i++) { const a = t * 1.1 + i * 2.094, x = Math.cos(a) * s * .62, y = s * .1 + Math.sin(a * 1.3) * s * .5, r = s * .09; glow4(c, x, y, r * 3, "#7dffd8", .7); c.fillStyle = "#e8fff6"; c.beginPath(); c.moveTo(x, y - r * 1.5); c.quadraticCurveTo(x + r, y, x, y + r * .8); c.quadraticCurveTo(x - r, y, x, y - r * 1.5); c.fill(); } c.restore(); }
  if (mut === "arkan") { c.save(); c.translate(0, s * .1); c.rotate(t * .5); c.strokeStyle = "rgba(199,155,255,.85)"; c.lineWidth = Math.max(1.2, s * .025); c.beginPath(); c.arc(0, 0, s * .74, 0, 7); c.stroke(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; rune5(c, Math.cos(a) * s * .74, Math.sin(a) * s * .74, s * .07, i, "#e4d0ff", s * .02); } c.restore(); }
  if (mut === "folio") { c.save(); for (let i = 0; i < 5; i++) { const ph = (t * .3 + i / 5) % 1, x = Math.sin(i * 2.7) * s * .6, y = s * .5 - ph * s * 1.2; c.globalAlpha = Math.sin(ph * Math.PI); c.save(); c.translate(x, y); c.rotate(Math.sin(ph * 6 + i) * .5); c.fillStyle = "#f6dfa6"; c.strokeStyle = "#a8701a"; c.lineWidth = Math.max(1, s * .02); c.beginPath(); c.rect(-s * .07, -s * .09, s * .14, s * .18); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-s * .04, -s * .04); c.lineTo(s * .04, -s * .04); c.moveTo(-s * .04, 0); c.lineTo(s * .04, 0); c.moveTo(-s * .04, s * .04); c.lineTo(s * .02, s * .04); c.stroke(); c.restore(); } c.restore(); }
  if (mut === "astral") { c.save(); const P = []; for (let i = 0; i < 6; i++) { const a = t * .25 + i * 1.047, r = s * (.66 + .12 * Math.sin(i * 2.3)); P.push([Math.cos(a) * r, s * .1 + Math.sin(a) * r * .8]); } c.strokeStyle = "rgba(159,182,255,.7)"; c.lineWidth = Math.max(1, s * .02); c.beginPath(); P.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); P.forEach((p, i) => { glow4(c, p[0], p[1], s * .12, "#9fb6ff", .8); c.fillStyle = "#ffffff"; sparkle(c, p[0], p[1], s * (.06 + .02 * Math.sin(t * 3 + i))); }); c.restore(); }
  if (mut === "urwort") { c.save(); for (let k = 0; k < 3; k++) { const ph = (t * .5 + k / 3) % 1; c.globalAlpha = (1 - ph) * .85; c.strokeStyle = tp5(k / 3); c.lineWidth = Math.max(1.3, s * .035); c.beginPath(); c.arc(0, s * .1, s * (.4 + ph * .7), -.8, .8); c.stroke(); c.beginPath(); c.arc(0, s * .1, s * (.4 + ph * .7), Math.PI - .8, Math.PI + .8); c.stroke(); } c.globalAlpha = 1; for (let i = 0; i < 4; i++) { const a = -t * .6 + i * 1.571; rune5(c, Math.cos(a) * s * .7, s * .1 + Math.sin(a) * s * .45, s * .07, i + 2, tp5(i / 4), s * .025); } c.restore(); }
}

/* ===== Symbole der fünf neuen Instrumente (40×40, F füllt und umrandet) ===== */
function iconExtra(c, kind, F) {
  if (kind === "wisp") { c.beginPath(); c.moveTo(5, 35); c.lineTo(28, 14); c.lineTo(31, 18); c.lineTo(8, 38); c.closePath(); F("#efe6cf"); c.fillStyle = INK; [[13, 29], [17, 25], [21, 21]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 1.5, 0, 7); c.fill(); });
    c.beginPath(); c.moveTo(32, 14); c.bezierCurveTo(26, 8, 31, 4, 33, -1); c.bezierCurveTo(36, 4, 40, 9, 36, 14); c.quadraticCurveTo(34, 17, 32, 14); c.closePath(); F("#7dffd8"); c.globalAlpha = .6; c.fillStyle = "#e8fff6"; c.beginPath(); c.arc(34, 11, 2.6, 0, 7); c.fill(); c.globalAlpha = 1; c.fillStyle = "#7dffd8"; [[6, 10, 1.8], [12, 4, 1.4]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], p[2], 0, 7); c.fill(); }); }
  else if (kind === "runeharp") { c.beginPath(); c.moveTo(7, 35); c.quadraticCurveTo(2, 8, 22, 5); c.quadraticCurveTo(36, 6, 33, 35); c.closePath(); F("#b78cf0"); c.strokeStyle = "#f2e6ff"; c.lineWidth = 1.5; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(12 + i * 5, 11 + i * 1.5); c.lineTo(12 + i * 5, 34); c.stroke(); } c.fillStyle = "#6ad8ff"; [[12, 22], [17, 18], [22, 24], [27, 20]].forEach((p, i) => { c.beginPath(); c.arc(p[0], p[1], 2.2, 0, 7); c.fill(); }); c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.moveTo(5, 36); c.lineTo(35, 36); c.stroke(); }
  else if (kind === "tome") { c.beginPath(); c.moveTo(4, 24); c.lineTo(20, 28); c.lineTo(36, 24); c.lineTo(36, 36); c.lineTo(20, 39); c.lineTo(4, 36); c.closePath(); F("#8a3a4a"); c.beginPath(); c.moveTo(6, 22); c.lineTo(20, 26); c.lineTo(34, 22); c.lineTo(34, 33); c.lineTo(20, 36); c.lineTo(6, 33); c.closePath(); F("#f6e6bc"); c.beginPath(); c.moveTo(20, 26); c.lineTo(20, 36); c.stroke(); [[9, 8, 16], [14.5, 4, 20], [20, 2, 22], [25.5, 4, 20], [31, 8, 16]].forEach((p, i) => { c.beginPath(); c.rect(p[0] - 2.4, p[1], 4.8, p[2]); F(["#d8c0a0", "#e8d4b0", "#f2d878", "#e8d4b0", "#d8c0a0"][i]); }); }
  else if (kind === "astro") { c.beginPath(); c.arc(20, 21, 16, 0, 7); F("#e8c060"); c.beginPath(); c.arc(20, 21, 12, 0, 7); F("#fff6d0"); c.lineWidth = 1.4; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.beginPath(); c.moveTo(20 + Math.cos(a) * 12, 21 + Math.sin(a) * 12); c.lineTo(20 + Math.cos(a) * 15, 21 + Math.sin(a) * 15); c.stroke(); } c.lineWidth = 2.4; c.beginPath(); c.moveTo(8, 33); c.lineTo(32, 9); c.stroke(); c.beginPath(); c.moveTo(20, 21); c.lineTo(27, 24); c.lineTo(22, 14); c.closePath(); F("#6a8fe0"); c.beginPath(); c.arc(20, 21, 2.4, 0, 7); F("#fff2b0"); c.beginPath(); c.arc(20, 3, 3, 0, 7); F("#e8c060"); }
  else if (kind === "word") { c.beginPath(); c.arc(20, 21, 16, 0, 7); F("#fdf2fa"); const g = c.createLinearGradient(6, 6, 34, 36); g.addColorStop(0, "#2fe0d0"); g.addColorStop(1, "#ff6ec7"); c.beginPath(); c.arc(20, 21, 13, 0, 7); c.fillStyle = g; c.fill(); c.lineWidth = 1.4; c.stroke(); c.lineWidth = 3; c.strokeStyle = "#ffffff"; c.beginPath(); c.moveTo(14, 14); c.lineTo(14, 29); c.moveTo(14, 15); c.lineTo(26, 21); c.lineTo(14, 26); c.stroke(); c.strokeStyle = INK; c.lineWidth = 2.4; c.fillStyle = "#fff"; [[34, 6, 3], [5, 33, 2.4]].forEach(a => { c.beginPath(); for (let k = 0; k < 8; k++) { const an = -Math.PI / 2 + k * Math.PI / 4, q = k % 2 ? a[2] * .35 : a[2]; k ? c.lineTo(a[0] + Math.cos(an) * q, a[1] + Math.sin(an) * q) : c.moveTo(a[0] + Math.cos(an) * q, a[1] + Math.sin(an) * q); } c.closePath(); c.lineWidth = 1; c.fill(); c.stroke(); }); }
}

/* ===== Das Spiegeltor am Wolkenpfad (Hauptwelt, Tor zum Sanktum Magus) ===== */
function drawSpiegeltor(c, x, y, t, open) {
  const sg = [qDone("sg1"), qDone("sg2"), qDone("sg3")], n = sg.filter(Boolean).length, W = 74, H = 104, pulse = .6 + .4 * Math.sin(t * 2.2);
  c.save(); c.translate(x, y);
  c.fillStyle = "rgba(0,0,0,.25)"; c.beginPath(); c.ellipse(0, 3, 46, 9, 0, 0, 7); c.fill();
  if (open || n) { const g = c.createRadialGradient(0, -H * .55, 6, 0, -H * .55, 92); g.addColorStop(0, "rgba(" + (open ? "120,255,235" : "170,200,255") + "," + (.55 * pulse * (open ? 1 : .3 + n * .15)) + ")"); g.addColorStop(1, "rgba(255,110,199,0)"); c.fillStyle = g; c.fillRect(-100, -H - 60, 200, H + 90); }
  // Pfeiler und Bogen
  const arch = (r, lw, fill) => { c.beginPath(); c.moveTo(-W / 2, 0); c.lineTo(-W / 2, -H * .62); c.quadraticCurveTo(-W / 2, -H - r, 0, -H - r); c.quadraticCurveTo(W / 2, -H - r, W / 2, -H * .62); c.lineTo(W / 2, 0); c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.lineWidth = lw; c.stroke(); } };
  c.strokeStyle = INK; c.lineJoin = "round"; arch(6, 4, "#7d7aa4");
  c.save(); c.beginPath(); c.moveTo(-W / 2 + 9, 0); c.lineTo(-W / 2 + 9, -H * .62); c.quadraticCurveTo(-W / 2 + 9, -H - 2, 0, -H - 2); c.quadraticCurveTo(W / 2 - 9, -H - 2, W / 2 - 9, -H * .62); c.lineTo(W / 2 - 9, 0); c.closePath(); c.clip();
  const g2 = c.createLinearGradient(-W / 2, -H, W / 2, 0);
  if (open) { g2.addColorStop(0, "#2fe0d0"); g2.addColorStop(.55, "#b7a0ff"); g2.addColorStop(1, "#ff6ec7"); } else { g2.addColorStop(0, "#9fa8c8"); g2.addColorStop(1, "#6a7298"); }
  c.fillStyle = g2; c.fillRect(-W / 2, -H - 8, W, H + 10);
  if (open) { c.globalAlpha = .55; c.strokeStyle = "#ffffff"; c.lineWidth = 2.4; for (let i = 0; i < 5; i++) { c.beginPath(); for (let k = 0; k <= 16; k++) { const u = k / 16, yy = -H + 8 + u * (H - 8), xx = Math.sin(t * 1.6 + i * 1.3 + u * 5) * (6 + i * 2.5) + (i - 2) * 9; k ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); } c.globalAlpha = 1; for (let i = 0; i < 7; i++) { const ph = (t * .4 + i / 7) % 1; c.fillStyle = "rgba(255,255,255," + (1 - ph) + ")"; c.beginPath(); c.arc(Math.sin(i * 4.1) * 22, -ph * (H - 10) - 6, 1.8 + (i % 3), 0, 7); c.fill(); } }
  else { c.strokeStyle = "rgba(40,44,80,.55)"; c.lineWidth = 2; c.beginPath(); c.moveTo(-6, -H + 12); c.lineTo(2, -H * .6); c.lineTo(-9, -H * .35); c.moveTo(2, -H * .6); c.lineTo(14, -H * .45); c.moveTo(-9, -H * .35); c.lineTo(-4, -8); c.stroke(); c.fillStyle = "rgba(255,255,255,.18)"; c.beginPath(); c.moveTo(-W / 2 + 14, -H * .8); c.lineTo(-W / 2 + 26, -H * .8); c.lineTo(-W / 2 + 12, -H * .3); c.closePath(); c.fill(); }
  c.restore();
  // Schlussstein mit drei Siegelzeichen
  c.strokeStyle = INK; c.lineWidth = 3; c.fillStyle = "#9a96c0"; c.beginPath(); c.moveTo(-20, -H - 3); c.lineTo(20, -H - 3); c.lineTo(15, -H - 22); c.quadraticCurveTo(0, -H - 30, -15, -H - 22); c.closePath(); c.fill(); c.stroke();
  const cols = ["#9fb6ff", "#4ad0f0", "#2fe0d0"];
  for (let i = 0; i < 3; i++) { const sx = (i - 1) * 11, sy = -H - 14 + (i === 1 ? -3 : 0); c.fillStyle = sg[i] ? cols[i] : "#4a4870"; if (sg[i]) { const gg = c.createRadialGradient(sx, sy, 1, sx, sy, 12); gg.addColorStop(0, cols[i]); gg.addColorStop(1, "rgba(255,255,255,0)"); c.globalAlpha = .6 * pulse; c.fillStyle = gg; c.fillRect(sx - 12, sy - 12, 24, 24); c.globalAlpha = 1; c.fillStyle = cols[i]; } c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.moveTo(sx, sy - 6); c.lineTo(sx + 5, sy); c.lineTo(sx, sy + 6); c.lineTo(sx - 5, sy); c.closePath(); c.fill(); c.stroke(); }
  // Sockel
  c.fillStyle = "#6e6a94"; c.strokeStyle = INK; c.lineWidth = 3; for (const s of [-1, 1]) { c.beginPath(); c.rect(s * W / 2 - 9 + (s > 0 ? 0 : -3), -9, 12, 11); c.fill(); c.stroke(); }
  c.restore();
}
