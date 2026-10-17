/* ===== WELT: Kacheln, Zonen, Dekoration, Häuser ===== */
function hs(x, y, k) { let h = (x * 374761393 + y * 668265263 + (k || 0) * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; h ^= h >>> 16; return (h >>> 0) / 4294967296; }

const ZINFO = {
  dorf:    { n: "Notendorf",      a: 1, dark: 0,    col: "#dccf9c", col2: "#cfc08a" },
  wiese:   { n: "Singwiese",      a: 1, dark: 0,    col: "#9fd480", col2: "#8cc675" },
  wald:    { n: "Flüsterwald",    a: 1, dark: 0.12, col: "#82ba72", col2: "#72ab66" },
  teich:   { n: "Schilfteich",    a: 1, dark: 0,    col: "#a4d3b0", col2: "#92c5a0" },
  wind:    { n: "Windhügel",      a: 1, dark: 0,    col: "#bcdf8e", col2: "#abd27d" },
  eingang: { n: "Höhleneingang",  a: 2, dark: 0.50, col: "#b6aed2", col2: "#a69ec6" },
  saal:    { n: "Kristallsaal",   a: 2, dark: 0.46, col: "#aaa6d2", col2: "#9a96c6" },
  tropf:   { n: "Tropfsteingang", a: 2, dark: 0.56, col: "#a4b3cf", col2: "#94a4c4" },
  becken:  { n: "Klangbecken",    a: 2, dark: 0.52, col: "#a0b6c6", col2: "#90a8bc" },
  pilz:    { n: "Pilzgrotte",     a: 2, dark: 0.54, col: "#b4a2ca", col2: "#a592be" }
};
const ZC = { // Mittelpunkt und Radius zur Zuordnung
  dorf: [19, 38, 11], wiese: [46, 40, 14], wald: [17, 15, 13], teich: [44, 15, 12], wind: [67, 17, 10],
  eingang: [40, 62, 9], saal: [40, 76, 14], tropf: [17, 76, 10], becken: [52, 98, 15], pilz: [15, 98, 11]
};
// Kachel-Arten: 0 Fels/dichter Wald, 1 Boden, 2 Weg, 3 Wasser, 4 Deko (blockiert), 5 falsche Wand, 6 Haus
const T = Array.from({ length: WH }, () => Array(WW).fill(0));
const ZN = Array.from({ length: WH }, () => Array(WW).fill(null));
function setT(x, y, v) { if (y >= 0 && y < WH && x >= 0 && x < WW) T[y][x] = v; }
function ell(cx, cy, rx, ry, v) { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) setT(x, y, v); }
function rct(x, y, w, h, v) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) setT(i, j, v); }
function cor(x1, y1, x2, y2, t, v) {
  const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 2 || 1, o = Math.floor((t - 1) / 2);
  for (let i = 0; i <= n; i++) { const x = Math.round(x1 + (x2 - x1) * i / n), y = Math.round(y1 + (y2 - y1) * i / n); for (let a = -o; a < t - o; a++) for (let b = -o; b < t - o; b++) if (T[y + b] && T[y + b][x + a] === 0) setT(x + a, y + b, v); }
}
// Bereich 1
ell(19, 38, 11, 7, 1); ell(46, 40, 14, 9, 1); ell(17, 15, 13, 9, 1); ell(44, 15, 12, 8, 1); ell(67, 17, 10, 10, 1);
[[18, 31, 17, 23], [29, 15, 34, 15], [55, 15, 60, 16], [30, 38, 34, 40], [58, 37, 64, 26], [43, 48, 40, 54]].forEach(c => cor(c[0], c[1], c[2], c[3], 3, 2));
ell(46, 15, 6, 3.5, 3);
// Bereich 2
ell(40, 62, 9, 4, 1); ell(40, 76, 14, 7, 1); ell(17, 76, 10, 8, 1); ell(52, 98, 15, 9, 1); ell(15, 98, 11, 8, 1);
[[40, 55, 40, 59, 3], [40, 65, 40, 70, 3], [28, 76, 27, 76, 3], [44, 82, 48, 90, 3], [17, 84, 15, 90, 3], [26, 98, 37, 98, 3]].forEach(c => cor(c[0], c[1], c[2], c[3], c[4], 2));
ell(54, 98, 5, 3, 3);
// Geheimräume
rct(2, 19, 4, 3, 1); setT(6, 20, 5);
rct(69, 97, 8, 3, 1); setT(68, 98, 5);
// Zonen
for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) {
  if (T[y][x] === 0) continue;
  const ar = y < AREA_SPLIT ? 1 : 2; let best = null, bd = 1e9;
  for (const id in ZC) { if (ZINFO[id].a !== ar) continue; const c = ZC[id], d = Math.hypot(x - c[0], y - c[1]) / c[2]; if (d < bd) { bd = d; best = id; } }
  ZN[y][x] = best;
}
// Geheimräume gehören zur Nachbarzone
for (let y = 19; y <= 21; y++) for (let x = 2; x <= 6; x++) ZN[y][x] = "wald";
for (let y = 97; y <= 99; y++) for (let x = 68; x <= 76; x++) ZN[y][x] = "becken";
const zoneAt = (tx, ty) => (ZN[ty] && ZN[ty][tx]) || "wiese";

// Häuser im Dorf
const HOUSES = [
  { x: 10, y: 33, w: 4, h: 3, roof: "#b4533c" }, { x: 14, y: 40, w: 4, h: 3, roof: "#c9923a", door: 1 },
  { x: 21, y: 36, w: 4, h: 3, roof: "#6a5aa6", door: 1, sign: "Marlo" }, { x: 26, y: 42, w: 3, h: 3, roof: "#5b9a78" },
  { x: 11, y: 42, w: 3, h: 2, roof: "#a5524a" }
];
HOUSES.forEach(h => rct(h.x, h.y, h.w, h.h, 6));
rct(48, 33, 2, 1, 0 + 1);

// Deko-Hindernisse (Bäume, Kristalle, Stalagmiten), die Wege freilassen
const NPCPOS = Object.values(NPCS).map(n => [n.x, n.y]);
for (let y = 2; y < WH - 2; y++) for (let x = 2; x < WW - 2; x++) {
  if (T[y][x] !== 1) continue;
  const z = ZN[y][x]; if (z === "dorf" || z === "teich" && hs(x, y, 3) < 0.9) { if (z === "dorf") continue; }
  if (NPCPOS.some(p => Math.abs(p[0] - x) < 2 && Math.abs(p[1] - y) < 2)) continue;
  if (y > 52 && y < 60 && x > 37 && x < 43) continue;
  const dens = { wald: 0.09, wiese: 0.035, wind: 0.03, teich: 0.035, saal: 0.06, tropf: 0.07, becken: 0.045, pilz: 0.06, eingang: 0.04 }[z] || 0;
  if (hs(x, y, 9) < dens) T[y][x] = 4;
}
// Start und Tor
const START = { tx: 17, ty: 39 };
const GATE = { x: 39, y: 56, w: 3 };
const solidT = v => v === 0 || v === 3 || v === 4 || v === 5 || v === 6;

/* Erreichbarkeit prüfen (Tor offen, geheime Wände offen) und isolierte Deko ggf. entfernen */
function reach(openAll) {
  const seen = new Uint8Array(WW * WH), q = [[START.tx, START.ty]]; seen[START.ty * WW + START.tx] = 1;
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= WW || ny >= WH) continue; if (seen[ny * WW + nx]) continue; const v = T[ny][nx]; if (solidT(v) && !(openAll && v === 5)) continue; seen[ny * WW + nx] = 1; q.push([nx, ny]); } }
  return seen;
}
(function fixReach() {
  let seen = reach(true);
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if ((T[y][x] === 1 || T[y][x] === 2) && !seen[y * WW + x]) T[y][x] = 4; // unerreichbare Inseln füllen
  // Deko, die den einzigen Weg versperrt, lässt sich nicht automatisch erkennen; Test prüft NPCs und Tor
})();
