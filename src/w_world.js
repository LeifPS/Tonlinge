/* ===== WELT: Kacheln, Zonen, Dekoration, Häuser ===== */
function hs(x, y, k) { let h = (x * 374761393 + y * 668265263 + (k || 0) * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; h ^= h >>> 16; return (h >>> 0) / 4294967296; }

const ZINFO = {
  dorf:    { n: "Notendorf",      a: 1, dark: 0,    col: "#dccf9c", col2: "#cfc08a" },
  wiese:   { n: "Singwiese",      a: 1, dark: 0,    col: "#9fd480", col2: "#8cc675" },
  wald:    { n: "Flüsterwald",    a: 1, dark: 0.12, col: "#82ba72", col2: "#72ab66" },
  teich:   { n: "Schilfteich",    a: 1, dark: 0,    col: "#a4d3b0", col2: "#92c5a0" },
  wind:    { n: "Windhügel",      a: 1, dark: 0,    col: "#bcdf8e", col2: "#abd27d" },
  eingang: { n: "Höhleneingang",  a: 2, dark: 0.64, col: "#b6aed2", col2: "#a69ec6" },
  saal:    { n: "Kristallsaal",   a: 2, dark: 0.60, col: "#aaa6d2", col2: "#9a96c6" },
  tropf:   { n: "Tropfsteingang", a: 2, dark: 0.68, col: "#a4b3cf", col2: "#94a4c4" },
  becken:  { n: "Klangbecken",    a: 2, dark: 0.64, col: "#a0b6c6", col2: "#90a8bc" },
  pilz:    { n: "Pilzgrotte",     a: 2, dark: 0.66, col: "#b4a2ca", col2: "#a592be" },
  wolke:      { n: "Wolkenpfad",     a: 3, dark: 0.22, col: "#cfd8f0", col2: "#bfcaea" },
  sternwarte: { n: "Sternwarte",     a: 3, dark: 0.30, col: "#c2c0e6", col2: "#b2b0dc" },
  mondsee:    { n: "Mondsee",        a: 3, dark: 0.34, col: "#b8c8e4", col2: "#a8bad8" },
  gewitter:   { n: "Gewitterkamm",   a: 3, dark: 0.40, col: "#a9a7c4", col2: "#9a98b8" },
  nordlicht:  { n: "Nordlichtgrat",  a: 3, dark: 0.36, col: "#b4d0d8", col2: "#a2c2cc" },
  strand:  { n: "Muschelstrand",     a: 4, dark: 0.10, col: "#f1e2bc", col2: "#e6d3a4" },
  koralle: { n: "Korallenwald",      a: 4, dark: 0.22, col: "#f0c9c4", col2: "#e4b4b4" },
  gezeit:  { n: "Gezeitenbecken",    a: 4, dark: 0.18, col: "#b9e0e0", col2: "#a4d2d6" },
  wrack:   { n: "Wrackfriedhof",     a: 4, dark: 0.42, col: "#a9b4b4", col2: "#98a6a8" },
  tiefe:   { n: "Tiefenschlund",     a: 4, dark: 0.56, col: "#8aa4cc", col2: "#7a96c0" }
};
const ZC = { // Mittelpunkt und Radius zur Zuordnung
  dorf: [19, 38, 11], wiese: [46, 40, 14], wald: [17, 15, 13], teich: [44, 15, 12], wind: [67, 17, 10],
  eingang: [40, 62, 9], saal: [40, 76, 14], tropf: [17, 76, 10], becken: [52, 98, 15], pilz: [15, 98, 11],
  wolke: [52, 122, 13], sternwarte: [24, 131, 13], mondsee: [62, 138, 13], gewitter: [18, 152, 13], nordlicht: [50, 157, 18],
  strand: [50, 177, 13], koralle: [20, 188, 13], gezeit: [62, 192, 13], wrack: [24, 208, 13], tiefe: [56, 213, 15]
};
// Kachel-Arten: 0 Fels/dichter Wald, 1 Boden, 2 Weg, 3 Wasser, 4 Deko (blockiert), 5 falsche Wand, 6 Haus
let T = Array.from({ length: SH }, () => Array(SW).fill(0));
let ZN = Array.from({ length: SH }, () => Array(SW).fill(null));
function setT(x, y, v) { if (T[y] && x >= 0 && x < T[y].length) T[y][x] = v; }
function ell(cx, cy, rx, ry, v) { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) setT(x, y, v); }
function rct(x, y, w, h, v) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) setT(i, j, v); }
function cor(x1, y1, x2, y2, t, v) {
  const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 2 || 1, o = Math.floor((t - 1) / 2);
  for (let i = 0; i <= n; i++) { const x = Math.round(x1 + (x2 - x1) * i / n), y = Math.round(y1 + (y2 - y1) * i / n); for (let a = -o; a < t - o; a++) for (let b = -o; b < t - o; b++) if (T[y + b] && T[y + b][x + a] === 0) setT(x + a, y + b, v); }
}

/* ===== Gelände: jeder Bereich hat eine eigene Geografie ===== */
function vn(x, y, sc, k) { // weiches Wertrauschen 0..1
  const gx = x / sc, gy = y / sc, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hs(x0, y0, k), b = hs(x0 + 1, y0, k), c = hs(x0, y0 + 1, k), d = hs(x0 + 1, y0 + 1, k);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
// unregelmäßige Fläche; only = nur Kacheln dieser Arten überschreiben
function blob(cx, cy, rx, ry, v, amp, sc, k, only) {
  amp = amp == null ? .3 : amp; sc = sc || 4; k = k || 1; const R = 1 + amp;
  for (let y = Math.floor(cy - ry * R) - 1; y <= Math.ceil(cy + ry * R) + 1; y++) for (let x = Math.floor(cx - rx * R) - 1; x <= Math.ceil(cx + rx * R) + 1; x++) {
    const d = Math.hypot((x - cx) / rx, (y - cy) / ry), n = (vn(x, y, sc, k) - .5) * 2 * amp;
    if (d <= 1 + n && (!only || (T[y] && only.includes(T[y][x])))) setT(x, y, v);
  }
}
// gewundener Gang; schreibt nur auf Fels (0), sonst auf alles, wenn force
function wind(x1, y1, x2, y2, t, v, amp, k, force) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, n = Math.ceil(L * 2), o = Math.floor((t - 1) / 2), ph = hs(k || 1, 7, 3) * 6.28, fr = 1 + hs(k || 1, 8, 4) * 1.6;
  for (let i = 0; i <= n; i++) { const u = i / n, off = Math.sin(u * Math.PI * 2 * fr + ph) * amp * Math.sin(u * Math.PI), x = Math.round(x1 + dx * u + nx * off), y = Math.round(y1 + dy * u + ny * off);
    for (let a = -o; a < t - o; a++) for (let b = -o; b < t - o; b++) if (T[y + b] && (force || T[y + b][x + a] === 0)) setT(x + a, y + b, v); }
}
const pocket = (x, y, r, v) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) setT(x + i, y + j, v); };

/* --- Bereich 1: Klanghain, offene Wiesen, Wälder, ein Fluss mit Furten --- */
blob(19, 38, 11, 7, 1, .12, 5, 11); blob(46, 40, 14, 9, 1, .38, 6, 12); blob(17, 15, 13, 9, 1, .42, 5, 13); blob(44, 15, 12, 8, 1, .35, 5, 14); blob(67, 17, 10, 10, 1, .35, 5, 15);
// kleine Lichtungen im Dickicht
[[30, 24, 4, 3], [8, 28, 3, 3], [56, 29, 4, 3], [34, 7, 3, 2], [58, 6, 4, 2], [74, 33, 3, 3], [5, 44, 3, 3], [38, 51, 3, 2]].forEach((g, i) => blob(g[0], g[1], g[2], g[3], 1, .35, 3, 20 + i));
[[18, 31, 17, 23, 3], [29, 15, 34, 15, 3], [55, 15, 60, 16, 3], [30, 38, 34, 40, 3], [58, 37, 64, 26, 3], [43, 48, 40, 54, 3], [24, 18, 30, 24, 2], [30, 24, 56, 29, 2], [34, 7, 44, 10, 2]].forEach((c, i) => wind(c[0], c[1], c[2], c[3], c[4], 2, 3, 30 + i));
// Fluss: vom Teich nach Südosten, an Wegen bleibt eine Furt
blob(46, 15, 6, 3.5, 3, .3, 3, 40);
// Fluss: Tal mit Ufern, Wasser in der Mitte, Wege queren als Furt
{ const pts = [[50, 18], [55, 22], [58, 27], [61, 31], [62, 36], [66, 41], [70, 46], [72, 52]], smp = [];
  for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2); for (let k = 0; k <= n; k++) { const u = k / n; smp.push([Math.round(a[0] + (b[0] - a[0]) * u + Math.sin((i + u) * 2.2) * 1.4), Math.round(a[1] + (b[1] - a[1]) * u)]); } }
  smp.forEach(([x, y]) => { for (let j = -2; j <= 2; j++) for (let i = -3; i <= 4; i++) if (T[y + j] && T[y + j][x + i] === 0) T[y + j][x + i] = 1; });
  smp.forEach(([x, y]) => { for (let i = 0; i < 3; i++) if (T[y] && T[y][x + i] === 1) T[y][x + i] = 3; }); }

/* --- Bereich 2: Glimmerhöhlen, natürlich gewachsen: Kammern, Nebenhöhlen, Gänge von 1 bis 3 Kacheln Breite --- */
{
  const ns = Object.values(NPCS).filter(n => n.area === 2 && !n.secret);
  const rooms = [[40, 62, 5, 2.6], [40, 76, 9, 5], [17, 76, 6, 4.5], [52, 98, 9, 5.5], [15, 98, 6.5, 4.5]];
  const side = [[4, 69, 3, 2.4], [30, 66, 2.6, 2], [62, 70, 4, 3], [70, 84, 3.4, 3], [34, 90, 3, 2.4], [6, 88, 3, 3], [27, 106, 3, 2.4], [66, 108, 3.6, 2.4], [63, 80, 3, 2.4],
    [27, 60, 2.6, 2], [10, 62, 3, 2.2], [70, 62, 3.4, 2.4], [52, 86, 3, 2.2], [24, 92, 2.6, 2], [46, 107, 3, 2], [74, 74, 2.6, 3], [9, 106, 2.4, 2], [56, 66, 2.6, 2], [26, 82, 2.4, 2], [62, 91, 2.4, 2]];
  const nodes = [];
  rooms.forEach((r, i) => { blob(r[0], r[1], r[2], r[3], 1, .32, 3.5, 60 + i); nodes.push([r[0], r[1]]); });
  side.forEach((g, i) => { blob(g[0], g[1], g[2], g[3], 1, .35, 3, 70 + i); nodes.push([g[0], g[1]]); });
  ns.forEach((n, i) => { blob(n.x, n.y, 2.7, 2.3, 1, .25, 3, 95 + i); nodes.push([n.x, n.y]); });
  [[40, 58], [62, 101], [60, 102]].forEach(p => { blob(p[0], p[1], 2.2, 2, 1, .2, 3, 99); nodes.push(p); });
  // Gänge: kürzester Spannbaum (Verzweigungen, Sackgassen) plus einige Querverbindungen
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]), edges = new Set(), inT = [0], rest = nodes.map((_, i) => i).slice(1), list = [];
  while (rest.length) { let bd = 1e9, bi = 0, bj = 0; for (const i of inT) for (const j of rest) { const d = dist(nodes[i], nodes[j]); if (d < bd) { bd = d; bi = i; bj = j; } } list.push([bi, bj]); inT.push(bj); rest.splice(rest.indexOf(bj), 1); }
  nodes.forEach((n, i) => { const nb = nodes.map((m, j) => [dist(n, m), j]).filter(v => v[1] !== i).sort((p, q) => p[0] - q[0]); for (let k = 0; k < 2; k++) if (hs(i, k, 55) < (k ? .12 : .3) && nb[k][0] < 26) list.push([i, nb[k][1]]); });
  const carve = (a, b, t, amp, k) => { // Gang mit lückenloser (4er-)Verbindung
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, n = Math.ceil(L * 3), ph = hs(k, 7, 3) * 6.28, fr = 1 + hs(k, 8, 4) * 1.8;
    let px = null, py = null;
    for (let i = 0; i <= n; i++) { const u = i / n, off = Math.sin(u * Math.PI * 2 * fr + ph) * amp * Math.sin(u * Math.PI) + (vn(i, k, 3, 9) - .5) * 1.2, x = Math.round(a[0] + dx * u + nx * off), y = Math.round(a[1] + dy * u + ny * off);
      const put = (X, Y) => { for (let j = 0; j < t; j++) for (let l = 0; l < t; l++) if (T[Y + j] && T[Y + j][X + l] === 0) T[Y + j][X + l] = 1; };
      if (px !== null && px !== x && py !== y) put(x, py); put(x, y); px = x; py = y; } };
  list.forEach(([i, j], k) => { const r = hs(i, j, 57), t = r < .38 ? 1 : r < .72 ? 2 : 3; carve(nodes[i], nodes[j], t, 1.5 + hs(k, 2, 58) * 3, 80 + k); });
  rct(39, 56, 3, 3, 1); // Eingang vom Tor
  // Feinschliff: große freie Flächen bekommen Felsen und Pfeiler, große Felsmassive bekommen kleine Nebenhöhlen und Spalten
  const fl = (x, y) => T[y] && (T[y][x] === 1 || T[y][x] === 2), keep = [[40, 58, 4], [62, 101, 4], [74, 108, 5], [67, 98, 11], [15, 104, 8]].concat(ns.map(n => [n.x, n.y, 4]));
  const near = (x, y) => keep.some(k => Math.abs(x - k[0]) <= k[2] && Math.abs(y - k[1]) <= (k[2] > 8 ? 5 : k[2]));
  const rockDist = (x, y, r) => { for (let d = 1; d <= r; d++) for (let j = -d; j <= d; j++) for (let i = -d; i <= d; i++) if ((Math.abs(i) === d || Math.abs(j) === d) && fl(x + i, y + j)) return d; return r + 1; };
  for (let pass = 0; pass < 2; pass++) {
    for (let gy = 59; gy < 108; gy += 3) for (let gx = 4; gx < 76; gx += 3) {
      const x = gx + Math.floor(hs(gx, gy, 410 + pass) * 3), y = gy + Math.floor(hs(gx, gy, 420 + pass) * 3);
      if (near(x, y) || T[y][x] !== 0 || rockDist(x, y, 4) < 4 || hs(gx, gy, 430 + pass) > .75) continue;
      const rx = 1.2 + hs(x, y, 440) * 1.6, ry = 1 + hs(x, y, 441) * 1.5; blob(x, y, rx, ry, 1, .4, 2.5, 450 + x * 3 + y);
      let bd = 1e9, bx = x, by = y; for (let j = -8; j <= 8; j++) for (let i = -8; i <= 8; i++) if (fl(x + i, y + j)) { const d = Math.hypot(i, j); if (d > 3 && d < bd) { bd = d; bx = x + i; by = y + j; } }
      if (bd < 1e8) carve([x, y], [bx, by], hs(x, y, 460) < .6 ? 1 : 2, 1.2, 470 + x + y * 7);
    }
  }
  for (let y = 59; y < 108; y++) for (let x = 4; x < 76; x++) {
    if (!fl(x, y) || near(x, y)) continue;
    let all = true; for (let j = -2; j <= 2 && all; j++) for (let i = -2; i <= 2; i++) if (!fl(x + i, y + j)) { all = false; break; }
    if (all && vn(x, y, 3, 480) > .56) T[y][x] = 0;
  }
}
[[36, 74], [43, 74], [36, 78], [43, 78]].forEach(c => rct(c[0], c[1], 2, 2, 0));  // Säulen im Kristallsaal
blob(53, 98, 3.4, 1.8, 3, .2, 3, 90);                                              // kleiner Klangteich

/* --- Bereich 3: Sternenhöhe, schwebende Inseln, nur durch Brücken verbunden --- */
cor(52, 105, 52, 118, 3, 2);
blob(52, 122, 12, 5, 1, .4, 3, 100); blob(24, 131, 9.5, 7, 1, .22, 4, 101); blob(62, 138, 11, 8, 1, .3, 4, 102); blob(18, 152, 12, 7, 1, .62, 2.5, 103); blob(46, 157, 22, 3.4, 1, .32, 3, 104);
blob(32, 159, 4, 3, 1, .3, 3, 105); blob(67, 155, 5, 3.4, 1, .3, 3, 106); blob(40, 140, 3.5, 3, 1, .3, 3, 107); blob(8, 142, 3, 3, 1, .3, 3, 108); blob(36, 118, 3.5, 2.6, 1, .3, 3, 109); blob(72, 124, 3, 3, 1, .3, 3, 110);
[[42, 124, 33, 129], [57, 127, 59, 131], [22, 138, 19, 145], [60, 146, 57, 153], [30, 154, 36, 156], [34, 134, 41, 139], [43, 141, 52, 142], [10, 143, 18, 146], [36, 120, 42, 123], [64, 128, 71, 124], [8, 145, 8, 144]].forEach((c, i) => wind(c[0], c[1], c[2], c[3], 2, 2, 2.6, 120 + i));
// Trittsteine
[[37, 126], [38, 131], [47, 141], [14, 146], [58, 129], [21, 141], [45, 123]].forEach(c => blob(c[0], c[1], 1.6, 1.4, 1, .1, 3, 130));
blob(63, 138, 4, 2.5, 3, .3, 3, 131);

/* --- Bereich 4: Rauschmeer, ein Archipel aus Sand, Riff, Wrack und Krater --- */
blob(50, 177, 12, 5, 1, .2, 4, 140); blob(20, 188, 11.5, 7.2, 1, .2, 4, 141); blob(62, 192, 11.5, 7, 1, .22, 4, 142); blob(24, 208, 13.5, 6.4, 1, .2, 4, 143); blob(56, 213, 13.5, 6.2, 1, .18, 4, 144);
cor(50, 159, 50, 172, 3, 2);
[[40, 180, 28, 185], [58, 181, 60, 185], [20, 196, 23, 201], [62, 199, 58, 206], [34, 208, 44, 211], [32, 188, 50, 186], [74, 196, 70, 206]].forEach((c, i) => wind(c[0], c[1], c[2], c[3], 2, 2, 2.4, 150 + i));
blob(52, 183, 6, 2.4, 3, .3, 3, 160);                 // Lagune der Strandsichel
blob(20, 188, 4.6, 3, 3, .3, 3, 161);                 // Atoll-Lagune
for (let i = 0; i < 10; i++) { const a = hs(i, 1, 170) * 6.28, r = Math.sqrt(hs(i, 2, 171)) * 10; blob(62 + Math.cos(a) * r, 192 + Math.sin(a) * r * .7, 1.4 + hs(i, 3, 172) * 1.2, 1 + hs(i, 4, 173) * .8, 3, .2, 3, 174 + i, [1]); } // Gezeitentümpel
blob(56, 214, 6, 3, 3, .3, 3, 190); blob(12, 208, 3, 2, 3, .2, 3, 191);
for (let x = 14; x <= 34; x += 4) { setT(x, 204, 4); setT(x, 205, 4); setT(x, 211, 4); setT(x, 212, 4); } // Spanten des Wracks
// Wasser rund um alle Inseln (Meer), weiter draußen Riff
for (let y = AREA_SPLIT4; y < SH; y++) for (let x = 0; x < SW; x++) { if (T[y][x] !== 0) continue; const r = 2 + Math.round(vn(x, y, 5, 195) * 3); let near = false; for (let j = -r; j <= r && !near; j++) for (let i = -r; i <= r; i++) { const v = T[y + j] && T[y + j][x + i]; if (v === 1 || v === 2) { near = true; break; } } if (near) T[y][x] = 3; }

// Geheimräume (mit Siegel ringsum und Eingangstasche außerhalb der falschen Wand)
const SECRET = [[2, 19, 4, 3, 6, 20, 1], [69, 97, 8, 3, 68, 98, -1], [12, 108, 7, 3, 15, 107, -2], [70, 156, 7, 3, 69, 157, -1], [2, 190, 5, 3, 7, 191, 1], [56, 114, 9, 3, 57, 117, 2]];
SECRET.forEach(([x, y, w, h, fx, fy, dir]) => {
  for (let j = y - 1; j <= y + h; j++) for (let i = x - 1; i <= x + w; i++) setT(i, j, 0);
  rct(x, y, w, h, 1); setT(fx, fy, 5);
  if (dir === 1) { pocket(fx + 2, fy, 1, 1); } else if (dir === -1) { pocket(fx - 2, fy, 1, 1); } else if (dir === 2) { pocket(fx, fy + 1, 0, 1); } else { pocket(fx, fy - 2, 1, 1); }
});
[[8, 20, 14, 17], [66, 98, 61, 99], [15, 105, 15, 100], [67, 157, 60, 157], [9, 191, 14, 190]].forEach((c, i) => wind(c[0], c[1], c[2], c[3], 2, 1, 1, 200 + i));
const FWALLS = { mooma: [6, 20], echo: [68, 98], stimmer: [15, 107], hueterin: [69, 157], saenger: [7, 191], runa: [57, 117] };

// NPC-Lichtungen: jeder Ansprechpartner steht auf Boden und ist mit seiner Zone verbunden
Object.keys(NPCS).forEach((id, i) => { const n = NPCS[id]; if (n.secret) return; for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) if (T[n.y + j] && (T[n.y + j][n.x + k] === 0 || T[n.y + j][n.x + k] === 3)) T[n.y + j][n.x + k] = 1; });

// Höhlenlabyrinth: Kammern um die Ansprechpartner und Verbindung zu allen wichtigen Stellen sicherstellen
(function caveLink() {
  const ns = Object.values(NPCS).filter(n => n.area === 2 && !n.secret);
  ns.forEach(n => { for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) if (T[n.y + j][n.x + i] === 0) T[n.y + j][n.x + i] = 1; });
  const spots = [[74, 109], [66, 98], [15, 105]].concat(ns.map(n => [n.x, n.y]));
  for (let pass = 0; pass < 16; pass++) {
    const seen = new Uint8Array(SW * SH), q = [[40, 58]]; seen[58 * SW + 40] = 1;
    while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (ny < 56 || ny > 111 || nx < 1 || nx > 78 || seen[ny * SW + nx]) continue; if (T[ny][nx] !== 1 && T[ny][nx] !== 2) continue; seen[ny * SW + nx] = 1; q.push([nx, ny]); } }
    let done = true;
    for (const [sx, sy] of spots) { if (seen[sy * SW + sx]) continue; done = false; let bd = 1e9, bx = 0, by = 0;
      for (let y = 57; y <= 110; y++) for (let x = 2; x <= 77; x++) if (seen[y * SW + x]) { const d = Math.hypot(x - sx, y - sy); if (d < bd) { bd = d; bx = x; by = y; } }
      cor(sx, sy, bx, sy, 3, 1); cor(bx, sy, bx, by, 3, 1); }
    if (done) break;
  }
})();

// Idas Gang: ein sehr langer, verzweigter Tunnel im Nordwesten; Einstieg nur über die kleine Nische bei (18,58)
rct(18, 56, 1, 2, 1);            // Einstieg nach Norden
rct(2, 56, 17, 1, 1);            // lange Querstrecke nach Westen
rct(19, 56, 16, 1, 1);           // Abzweig nach Osten (Sackgasse)
rct(3, 57, 1, 7, 1);             // Abstieg zu Ida
rct(10, 57, 1, 2, 1); rct(14, 57, 1, 2, 1);   // Seitenstummel
rct(4, 59, 2, 1, 1);             // Nische
rct(2, 61, 4, 3, 1);             // Idas Kammer

// Zonen
for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) {
  if (T[y][x] === 0) continue;
  const ar = areaOfY(y); let best = null, bd = 1e9;
  for (const id in ZC) { if (ZINFO[id].a !== ar) continue; const c = ZC[id], d = Math.hypot(x - c[0], y - c[1]) / c[2]; if (d < bd) { bd = d; best = id; } }
  ZN[y][x] = best;
}
// Geheimräume gehören zur Nachbarzone
for (let y = 19; y <= 21; y++) for (let x = 2; x <= 6; x++) ZN[y][x] = "wald";
for (let y = 97; y <= 99; y++) for (let x = 68; x <= 76; x++) ZN[y][x] = "becken";
for (let y = 107; y <= 110; y++) for (let x = 12; x <= 18; x++) ZN[y][x] = "pilz";
for (let y = 156; y <= 158; y++) for (let x = 69; x <= 76; x++) ZN[y][x] = "nordlicht";
for (let y = 190; y <= 192; y++) for (let x = 2; x <= 7; x++) ZN[y][x] = "koralle";
for (let y = 114; y <= 116; y++) for (let x = 56; x <= 64; x++) ZN[y][x] = "wolke";
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
for (let y = 2; y < SH - 2; y++) for (let x = 2; x < SW - 2; x++) {
  if (T[y][x] !== 1) continue;
  const z = ZN[y][x]; if (z === "dorf" || z === "teich" && hs(x, y, 3) < 0.9) { if (z === "dorf") continue; }
  if (NPCPOS.some(p => Math.abs(p[0] - x) < 2 && Math.abs(p[1] - y) < 2)) continue;
  if (y > 52 && y < 60 && x > 37 && x < 43) continue;
  if (y >= 104 && y < 112 && x >= 13 && x <= 17) continue;
  if (y > 108 && y < 116 && x > 48 && x < 56) continue;
  if (y > 160 && y < 176 && x > 45 && x < 55) continue;
  const dens = { strand: 0.035, koralle: 0.09, gezeit: 0.04, wrack: 0.07, tiefe: 0.06, wolke: 0.04, sternwarte: 0.05, mondsee: 0.04, gewitter: 0.07, nordlicht: 0.05, wald: 0.09, wiese: 0.035, wind: 0.03, teich: 0.035, saal: 0.06, tropf: 0.07, becken: 0.045, pilz: 0.06, eingang: 0.04 }[z] || 0;
  if (areaOfY(y) === 2 && [-1, 0, 1].some(j => [-2, -1, 0, 1, 2].some(i => T[y + j][x + i] !== 1 && T[y + j][x + i] !== 2) || [-2, -1, 0, 1, 2].some(i => T[y + i] && T[y + i][x + j] !== 1 && T[y + i][x + j] !== 2))) continue; // Gänge und Engstellen bleiben frei
  if (hs(x, y, 9) < dens) T[y][x] = 4;
}
// ===== Falten: Bereich 1+2 links (nach unten), Brücke, Bereich 3+4 rechts (nach oben) =====
const FX = (x, y) => y >= 112 ? [159 - x, 223 - y] : [x, y];
{
  const T2 = Array.from({ length: WH }, () => Array(WW).fill(0)), Z2 = Array.from({ length: WH }, () => Array(WW).fill(null));
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) { const [nx, ny] = FX(x, y); T2[ny][nx] = T[y][x]; Z2[ny][nx] = ZN[y][x]; }
  T = T2; ZN = Z2;
  const AMx = new Uint8Array(WW * WH);
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) AMx[y * WW + x] = y >= 112 ? (x < 80 ? 2 : 3) : x < 80 ? (y < AREA_SPLIT ? 1 : 2) : (y < 56 ? 4 : 3);
  window.AM = AMx;
  for (const id in NPCS) { const n = NPCS[id], p = FX(n.x, n.y); n.x = p[0]; n.y = p[1]; }
  for (const id in FWALLS) { const p = FX(FWALLS[id][0], FWALLS[id][1]); FWALLS[id] = [p[0], p[1]]; }
  // Sternensteg: Brücke zwischen dem Ende von Bereich 2 und dem Anfang von Bereich 3
  const pv = (x1, y1, x2, y2) => { cor(x1, y1, x2, y2, 3, 2); };
  for (let y = 106; y <= 111; y++) for (let x = 48; x <= 56; x++) T[y][x] = 0;   // alter Ausgang zu
  pv(60, 102, 74, 106); pv(74, 106, 74, 111);                                      // neuer Ausgang nach Osten
  pv(74, 109, 74, 113); pv(74, 113, 107, 113); pv(107, 113, 107, 109);
  for (let y = 100; y < WH; y++) for (let x = 40; x < 146; x++) if (T[y][x] === 2 && !ZN[y][x]) ZN[y][x] = x < 80 ? "becken" : "wolke";
}
const areaAt = (x, y) => window.AM[y * WW + x] || 1;
// Start und Tor
const START = { tx: 17, ty: 39 };
const GATE = { x: 39, y: 56, w: 3 };
const GATE3 = { x: 73, y: 111, w: 3 };   // Sterntor am Ende des Klangbeckens
const GATE4 = { x: 108, y: 56, w: 3 };   // Muscheltor am Nordlichtgrat
const GATES = [[GATE, "gateOpen"], [GATE3, "gate3Open"], [GATE4, "gate4Open"]];
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
