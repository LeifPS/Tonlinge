
/* ===== Handgezeichnete Symbole für das Wiki (gleicher Strich wie die Instrument-Icons des Spiels) ===== */
function drawWIcon(c, kind, x, y, s) {
  if (kind === "map") { drawIcon(c, "map", x, y, s); return; }
  c.save(); c.translate(x, y); c.scale(s / 40, s / 40); c.lineJoin = c.lineCap = "round"; c.lineWidth = 2.4; c.strokeStyle = INK;
  const c0 = c; c = sketchCtx(c0, strSeed("wi" + kind), 40);
  const F = col => { c.fillStyle = col; c.fill(); c.stroke(); };
  switch (kind) {
    case "quest": case "quest!": {  // Schriftrolle mit Fragezeichen (Haupt: Ausrufezeichen)
      c.beginPath(); c.moveTo(9, 6); c.lineTo(31, 6); c.quadraticCurveTo(34, 7, 33, 10); c.lineTo(33, 31); c.quadraticCurveTo(33, 35, 29, 34.5); c.lineTo(9, 34.5); c.quadraticCurveTo(6, 33, 7, 29); c.lineTo(7, 10); c.quadraticCurveTo(7, 6.5, 9, 6); c.closePath(); F("#f4e6b8");
      c.beginPath(); c.ellipse(20, 6, 14, 3, 0, 0, 7); F("#e8d49a"); c.beginPath(); c.ellipse(20, 34.5, 14, 3, 0, 0, 7); F("#e8d49a");
      c.strokeStyle = "#c0392b"; c.lineWidth = 3.4;
      if (kind === "quest") { c.beginPath(); c.moveTo(14.5, 16); c.quadraticCurveTo(14.5, 10.5, 20, 10.8); c.quadraticCurveTo(26, 11, 25.2, 16); c.quadraticCurveTo(24.5, 19.5, 20.5, 21.5); c.quadraticCurveTo(19.8, 23, 20, 24.2); c.stroke(); c.beginPath(); c.arc(20, 29, 1.2, 0, 7); c.fillStyle = "#c0392b"; c.fill(); c.stroke(); }
      else { c.beginPath(); c.moveTo(20, 11); c.quadraticCurveTo(21.5, 17, 20, 23.5); c.stroke(); c.beginPath(); c.arc(20, 29, 1.2, 0, 7); c.fillStyle = "#c0392b"; c.fill(); c.stroke(); }
      break; }
    case "title": {  // Krone
      c.beginPath(); c.moveTo(6, 30); c.lineTo(4, 12); c.lineTo(14, 20); c.lineTo(20, 8); c.lineTo(26, 20); c.lineTo(36, 12); c.lineTo(34, 30); c.closePath(); F("#ffd45a");
      c.beginPath(); c.moveTo(6, 30); c.lineTo(34, 30); c.lineTo(34, 34); c.lineTo(6, 34); c.closePath(); F("#f0b030");
      [[20, 24, "#e0303c"], [12, 26, "#4a8fe8"], [28, 26, "#5fc06b"]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 2, 0, 7); F(p[2]); }); break; }
    case "item": {  // Edelstein
      c.beginPath(); c.moveTo(11, 8); c.lineTo(29, 8); c.lineTo(36, 17); c.lineTo(20, 35); c.lineTo(4, 17); c.closePath(); F("#7fd6ee");
      c.lineWidth = 1.6; c.beginPath(); c.moveTo(4, 17); c.lineTo(36, 17); c.moveTo(11, 8); c.lineTo(15, 17); c.lineTo(20, 35); c.moveTo(29, 8); c.lineTo(25, 17); c.lineTo(20, 35); c.stroke();
      c.strokeStyle = "#fff"; c.lineWidth = 2; c.beginPath(); c.moveTo(9, 12); c.lineTo(12, 9.5); c.stroke(); break; }
    case "ench": {  // Funkelstern
      c.beginPath(); c.moveTo(20, 3); c.quadraticCurveTo(22, 18, 37, 20); c.quadraticCurveTo(22, 22, 20, 37); c.quadraticCurveTo(18, 22, 3, 20); c.quadraticCurveTo(18, 18, 20, 3); c.closePath(); F("#d9b6ff");
      [[32, 8, 4], [8, 31, 3.2]].forEach(p => { c.beginPath(); c.moveTo(p[0], p[1] - p[2]); c.lineTo(p[0] + p[2] * .3, p[1] - p[2] * .3); c.lineTo(p[0] + p[2], p[1]); c.lineTo(p[0] + p[2] * .3, p[1] + p[2] * .3); c.lineTo(p[0], p[1] + p[2]); c.lineTo(p[0] - p[2] * .3, p[1] + p[2] * .3); c.lineTo(p[0] - p[2], p[1]); c.lineTo(p[0] - p[2] * .3, p[1] - p[2] * .3); c.closePath(); F("#fff0a0"); }); break; }
    case "zone": {  // Kartennadel
      c.beginPath(); c.moveTo(20, 37); c.quadraticCurveTo(6, 22, 6, 14); c.quadraticCurveTo(7, 4, 20, 4); c.quadraticCurveTo(33, 4, 34, 14); c.quadraticCurveTo(34, 22, 20, 37); c.closePath(); F("#e8553e");
      c.beginPath(); c.arc(20, 15, 5.5, 0, 7); F("#fff6d8"); break; }
    case "guide": {  // Buch
      c.beginPath(); c.moveTo(6, 8); c.lineTo(19, 10); c.lineTo(19, 35); c.lineTo(6, 32); c.closePath(); F("#f4e6b8");
      c.beginPath(); c.moveTo(34, 8); c.lineTo(21, 10); c.lineTo(21, 35); c.lineTo(34, 32); c.closePath(); F("#f4e6b8");
      c.lineWidth = 1.5; [[9, 14, 16, 15.5], [9, 19, 16, 20.5], [9, 24, 16, 25.5], [24, 15.5, 31, 14], [24, 20.5, 31, 19], [24, 25.5, 31, 24]].forEach(l => { c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.stroke(); });
      c.lineWidth = 2.4; c.strokeStyle = INK; c.beginPath(); c.moveTo(20, 10); c.lineTo(20, 36); c.stroke(); break; }
    case "tool": {  // Rechner
      c.beginPath(); c.roundRect ? c.roundRect(8, 4, 24, 33, 3) : c.rect(8, 4, 24, 33); F("#cdd8e8");
      c.beginPath(); c.rect(11.5, 8, 17, 8); F("#b5e8c4");
      for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) { c.beginPath(); c.arc(14 + q * 6, 22 + r * 5.5, 1.8, 0, 7); F(r === 2 && q === 2 ? "#ffd45a" : "#fff6d8"); } break; }
    case "sound": {  // Noten
      c.beginPath(); c.moveTo(14, 30); c.lineTo(14, 9); c.lineTo(32, 6); c.lineTo(32, 27); c.lineWidth = 3; c.stroke(); c.lineWidth = 2.4;
      c.beginPath(); c.moveTo(14, 11.5); c.lineTo(32, 8.5); c.lineWidth = 4; c.stroke(); c.lineWidth = 2.4;
      c.beginPath(); c.ellipse(10.5, 30, 5.2, 4, -.3, 0, 7); F("#ffd45a"); c.beginPath(); c.ellipse(28.5, 27, 5.2, 4, -.3, 0, 7); F("#ffd45a"); break; }
    case "star": {
      c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 7.5 : 17; c[i ? "lineTo" : "moveTo"](20 + Math.cos(a) * r, 21 + Math.sin(a) * r); } c.closePath(); F("#ffd45a"); break; }
    case "me": {  // Figur
      c.beginPath(); c.arc(20, 13, 7.5, 0, 7); F("#f7d9b8"); c.beginPath(); c.moveTo(7, 36); c.quadraticCurveTo(7, 23, 20, 23); c.quadraticCurveTo(33, 23, 33, 36); c.closePath(); F("#5aa0e8"); break; }
    case "dex": {  // Sammelalbum
      c.beginPath(); c.rect(7, 5, 26, 31); F("#a8d0a0"); c.beginPath(); c.rect(11, 9, 18, 14); F("#fff6d8"); c.beginPath(); c.arc(20, 16, 4.5, 0, 7); F("#f0c8d8"); c.lineWidth = 1.6; c.beginPath(); c.moveTo(12, 28); c.lineTo(28, 28); c.moveTo(12, 32); c.lineTo(24, 32); c.stroke(); break; }
    case "news": {  // Funkenstern mit Ausrufezeichen-Blatt
      c.beginPath(); c.rect(6, 6, 28, 28); F("#f4e6b8"); c.lineWidth = 1.6; [[11, 13, 29, 13], [11, 19, 29, 19], [11, 25, 22, 25]].forEach(l => { c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.stroke(); }); break; }
    case "npc": {
      c.beginPath(); c.arc(20, 14, 8, 0, 7); F("#f7d9b8"); c.beginPath(); c.moveTo(8, 36); c.quadraticCurveTo(8, 24, 20, 24); c.quadraticCurveTo(32, 24, 32, 36); c.closePath(); F("#e8a05a"); break; }
    default: {  // Blatt
      c.beginPath(); c.moveTo(9, 5); c.lineTo(26, 5); c.lineTo(32, 11); c.lineTo(32, 35); c.lineTo(9, 35); c.closePath(); F("#f4e6b8"); c.lineWidth = 1.6; [[13, 17, 27, 17], [13, 23, 27, 23], [13, 29, 22, 29]].forEach(l => { c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.stroke(); }); }
  }
  c0.restore();
}
