/* ===== Handgezeichnete Symbole statt Sonderzeichen und Emojis (Spiel und Wiki) =====
   drawGlyph zeichnet auf ein Canvas, gi() liefert ein kleines Bild für Text (HTML). */
function drawGlyph(c, kind, x, y, s, fill) {
  c.save(); c.translate(x - s / 2, y - s / 2); c.scale(s / 40, s / 40); c.lineJoin = c.lineCap = "round"; c.lineWidth = 3; c.strokeStyle = INK;
  const c0 = c; c = sketchCtx(c0, strSeed("g" + kind), 40); const F = col => { c.fillStyle = col; c.fill(); c.stroke(); };
  const col = fill || null;
  switch (kind) {
    case "note": c.beginPath(); c.ellipse(13, 30, 7, 5.2, -.35, 0, 7); F(col || "#ffd45a"); c.beginPath(); c.moveTo(19.5, 28.5); c.lineTo(19.5, 6); c.quadraticCurveTo(27, 10, 31, 20); c.lineWidth = 3.2; c.stroke(); break;
    case "note2": c.beginPath(); c.ellipse(9, 31, 6.4, 4.8, -.35, 0, 7); F(col || "#ffd45a"); c.beginPath(); c.ellipse(28, 27, 6.4, 4.8, -.35, 0, 7); F(col || "#ffd45a"); c.lineWidth = 3; c.beginPath(); c.moveTo(14.8, 29.5); c.lineTo(14.8, 9); c.lineTo(33.6, 5); c.lineTo(33.6, 25.5); c.stroke(); c.beginPath(); c.moveTo(14.8, 13); c.lineTo(33.6, 9); c.lineWidth = 4.4; c.stroke(); break;
    case "star": case "starO": c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 8 : 18; c[i ? "lineTo" : "moveTo"](20 + Math.cos(a) * r, 21.5 + Math.sin(a) * r); } c.closePath(); if (kind === "star") F(col || "#ffd45a"); else c.stroke(); break;
    case "check": c.lineWidth = 9; c.beginPath(); c.moveTo(7, 21); c.lineTo(16, 30); c.lineTo(34, 9); c.stroke(); c.strokeStyle = col || "#4fc06a"; c.lineWidth = 5; c.stroke(); break;
    case "cross": c.lineWidth = 9; c.beginPath(); c.moveTo(9, 9); c.lineTo(31, 31); c.moveTo(31, 9); c.lineTo(9, 31); c.stroke(); c.strokeStyle = col || "#e0533a"; c.lineWidth = 5; c.stroke(); break;
    case "dot": c.beginPath(); c.arc(20, 20, 11, 0, 7); F(col || "#e0453a"); break;
    case "ring": c.beginPath(); c.arc(20, 20, 11, 0, 7); c.strokeStyle = col || "#e0a020"; c.lineWidth = 6; c.stroke(); break;
    case "diamond": c.beginPath(); c.moveTo(20, 4); c.lineTo(35, 20); c.lineTo(20, 36); c.lineTo(5, 20); c.closePath(); F(col || "#fff"); break;
    case "gem": c.beginPath(); c.moveTo(11, 8); c.lineTo(29, 8); c.lineTo(36, 17); c.lineTo(20, 35); c.lineTo(4, 17); c.closePath(); F(col || "#7fd6ee"); c.lineWidth = 2; c.beginPath(); c.moveTo(4, 17); c.lineTo(36, 17); c.moveTo(15, 17); c.lineTo(20, 35); c.moveTo(25, 17); c.lineTo(20, 35); c.stroke(); break;
    case "triUp": c.beginPath(); c.moveTo(20, 5); c.lineTo(36, 33); c.lineTo(4, 33); c.closePath(); F(col || "#7a4fb0"); break;
    case "triDown": c.beginPath(); c.moveTo(4, 7); c.lineTo(36, 7); c.lineTo(20, 35); c.closePath(); F(col || "#7a4fb0"); break;
    case "play": c.beginPath(); c.moveTo(9, 5); c.lineTo(35, 20); c.lineTo(9, 35); c.closePath(); F(col || "#2a7a8a"); break;
    case "stop": c.beginPath(); c.rect(7, 7, 26, 26); F(col || "#2a7a8a"); break;
    case "chevR": c.lineWidth = 8; c.beginPath(); c.moveTo(13, 6); c.lineTo(28, 20); c.lineTo(13, 34); c.stroke(); c.strokeStyle = col || "#f4e6b8"; c.lineWidth = 4; c.stroke(); break;
    case "arrowR": c.lineWidth = 8; c.beginPath(); c.moveTo(5, 20); c.lineTo(33, 20); c.moveTo(22, 9); c.lineTo(34, 20); c.lineTo(22, 31); c.stroke(); c.strokeStyle = col || "#f4e6b8"; c.lineWidth = 4; c.stroke(); break;
    case "sort": c.beginPath(); c.moveTo(12, 5); c.lineTo(22, 17); c.lineTo(2, 17); c.closePath(); F(col || "#9aa3b2"); c.beginPath(); c.moveTo(28, 35); c.lineTo(38, 23); c.lineTo(18, 23); c.closePath(); F(col || "#9aa3b2"); break;
    case "flag": c.beginPath(); c.moveTo(11, 36); c.lineTo(11, 5); c.lineWidth = 3.4; c.stroke(); c.beginPath(); c.moveTo(11, 6); c.lineTo(34, 12); c.lineTo(11, 20); c.closePath(); F(col || "#e0453a"); break;
    case "menu": c.lineWidth = 8; [9, 20, 31].forEach(yy => { c.beginPath(); c.moveTo(6, yy); c.lineTo(34, yy); c.stroke(); }); c.lineWidth = 4; c.strokeStyle = col || "#fff7de"; [9, 20, 31].forEach(yy => { c.beginPath(); c.moveTo(6, yy); c.lineTo(34, yy); c.stroke(); }); break;
    case "dice": c.beginPath(); c.rect(5, 5, 30, 30); F(col || "#fff7de"); c.fillStyle = INK; [[13, 13], [27, 27], [20, 20], [27, 13], [13, 27]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 2.8, 0, 7); c.fill(); }); break;
    case "sun": c.beginPath(); c.arc(20, 20, 9, 0, 7); F(col || "#ffd45a"); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.beginPath(); c.moveTo(20 + Math.cos(a) * 12.5, 20 + Math.sin(a) * 12.5); c.lineTo(20 + Math.cos(a) * 17.5, 20 + Math.sin(a) * 17.5); c.stroke(); } break;
    case "moon": c.beginPath(); c.arc(20, 20, 14, .5, 6.0); c.quadraticCurveTo(22, 19, 31, 29); c.closePath(); F(col || "#e9edff"); break;
    default: c.beginPath(); c.arc(20, 20, 8, 0, 7); F(col || "#fff");
  }
  c0.restore();
}
const GI_CACHE = {};
/* Kleines Bild (HTML) für Text: Größe folgt der Schrift (1em) */
function gi(kind, col) {
  const key = kind + "|" + (col || "");
  if (!GI_CACHE[key]) { try { const cv = document.createElement("canvas"); cv.width = cv.height = 72; drawGlyph(cv.getContext("2d"), kind, 36, 36, 66, col); GI_CACHE[key] = cv.toDataURL("image/png"); } catch (e) { GI_CACHE[key] = ""; } }
  return `<img class="gi" alt="" src="${GI_CACHE[key]}">`;
}
/* Einmal beim Start: feste Stellen im HTML mit Symbolen füllen */
function glyphInit() {
  const set = (id, html) => { const e = document.getElementById(id); if (e) e.innerHTML = html; };
  set("btnMute", gi("note")); set("dlgMore", gi("triDown", "#7a4fb0") + " weiter"); set("wkMenu", gi("menu"));
  const r = document.documentElement.style; ["sort", "triUp", "triDown", "check"].forEach(k => { try { const cv = document.createElement("canvas"); cv.width = cv.height = 48; drawGlyph(cv.getContext("2d"), k, 24, 24, 44, k === "sort" || k === "triUp" || k === "triDown" ? "#5a6a8a" : null); r.setProperty("--g-" + k, "url(" + cv.toDataURL("image/png") + ")"); } catch (e) {} });
}
setTimeout(glyphInit, 0);
