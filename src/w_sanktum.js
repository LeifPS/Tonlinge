/* ===== Sanktum Magus (Bereich 5): zwei Etagen (je 160×56) und drei Türme mit je 2 bis 3 Etagen ===== */
Object.assign(ZINFO, {
  halle:    { n: "Halle der Folianten",      a: 5, dark: .26, col: "#6b7fc4", col2: "#5f73b8" },
  archiv:   { n: "Archiv der Verbotenen Bände", a: 5, dark: .46, col: "#5a5f9e", col2: "#4f5492" },
  orrerium: { n: "Orrerium",                 a: 5, dark: .34, col: "#5d7bc6", col2: "#516fba" },
  zellen:   { n: "Zellentrakt der Schweiger", a: 5, dark: .52, col: "#4d5788", col2: "#434d7c" },
  hof:      { n: "Alchemiehof",              a: 5, dark: .20, col: "#5e8fb0", col2: "#5384a6" },
  gang:     { n: "Wandelgänge",              a: 5, dark: .38, col: "#5a66aa", col2: "#505c9e" },
  galerie:  { n: "Galerie der Sterne",       a: 5, dark: .30, col: "#7080c8", col2: "#6574bc" },
  thron:    { n: "Thronsaal des Ersten Magus", a: 5, dark: .34, col: "#7a68c0", col2: "#6e5cb4" },
  spiegel:  { n: "Spiegelsaal",              a: 5, dark: .40, col: "#7c8cc8", col2: "#7080bc" },
  lese:     { n: "Lesesäle",                 a: 5, dark: .36, col: "#6a76b8", col2: "#5f6bac" },
  labor:    { n: "Alchemielabor",            a: 5, dark: .42, col: "#5f8aa0", col2: "#547f96" },
  gewaechs: { n: "Gewächshaus der Zauberkräuter", a: 5, dark: .18, col: "#5a9a92", col2: "#4f8e86" },
  turm1:    { n: "Astralturm",               a: 5, dark: .44, col: "#6e72c8", col2: "#6266bc" },
  turm2:    { n: "Uhrwerkturm",              a: 5, dark: .44, col: "#8a74a8", col2: "#7e689c" },
  turm3:    { n: "Schattenturm",             a: 5, dark: .56, col: "#52508a", col2: "#48467e" },
  leere:    { n: "Die Leere",                a: 5, dark: .5,  col: "#1a1f3c", col2: "#161a34" }
});
AREAS[5] = { name: "Sanktum Magus", rm: { 2: .7, 3: .5, 4: .45, 5: .5, 6: 1 } };
const SZONES5 = ["halle", "archiv", "orrerium", "zellen", "hof", "gang", "galerie", "thron", "spiegel", "lese", "labor", "gewaechs", "turm1", "turm2", "turm3"];

(function buildSanktum() {
  const inb = (x, y) => x >= 0 && y >= 0 && x < WW && y < WH;
  const put = (L, x, y, v, z) => { if (!inb(x, y)) return; L.T[y][x] = v; if (z !== undefined) L.ZN[y][x] = z; };
  const rect = (L, x, y, w, h, v, z) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) put(L, i, j, v, z); };
  const ellip = (L, cx, cy, rx, ry, v, z) => { for (let j = Math.floor(cy - ry); j <= Math.ceil(cy + ry); j++) for (let i = Math.floor(cx - rx); i <= Math.ceil(cx + rx); i++) if (((i - cx) / rx) ** 2 + ((j - cy) / ry) ** 2 <= 1) put(L, i, j, v, z); };
  const mk = (id, name) => { const L = newLayer(id, name, 5); L.dk = {}; L.big = []; L.motifs = []; L.fix = []; L.over = []; L.npcSpots = {}; L.res = new Set(); return L; };
  const res = (L, x, y, w, h) => { for (let j = y; j < y + (h || 1); j++) for (let i = x; i < x + (w || 1); i++) L.res.add(i + "," + j); };
  const prop = (L, x, y, kind) => { if (!inb(x, y)) return false; const k = x + "," + y; if (L.T[y][x] !== 1 || L.res.has(k) || L.dk[k]) return false; L.T[y][x] = 4; L.dk[k] = kind; return true; };
  const big = (L, x, y, w, h, kind) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { L.T[j][i] = 4; L.dk[i + "," + j] = "none"; L.res.add(i + "," + j); } L.big.push({ x, y, w, h, kind }); };
  const motif = (L, k, x, y, o) => L.motifs.push(Object.assign({ k, x, y, s: Math.floor(x * 7 + y * 13) }, o));
  const line = (L, x1, y1, x2, y2, kind, step, skip) => { const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)); for (let i = 0; i <= n; i += step || 1) { if (skip && skip(i)) continue; prop(L, Math.round(x1 + (x2 - x1) * i / (n || 1)), Math.round(y1 + (y2 - y1) * i / (n || 1)), kind); } };
  const corr = (L, x1, y1, x2, y2, w, z, v) => { v = v === undefined ? 2 : v; if (x1 === x2) rect(L, x1 - (w >> 1), Math.min(y1, y2), w, Math.abs(y2 - y1) + 1, v, z); else rect(L, Math.min(x1, x2), y1 - (w >> 1), Math.abs(x2 - x1) + 1, w, v, z); };
  const a2 = n => n * 31 + 7;
  function maze(L, x0, y0, cw, ch, z, seed, loops) {
    const vis = new Uint8Array(cw * ch), st = [[0, 0]]; vis[0] = 1; let n = 0; const cell = (i, j) => rect(L, x0 + 3 * i, y0 + 3 * j, 2, 2, 1, z); cell(0, 0);
    while (st.length) { const [i, j] = st[st.length - 1], opts = []; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a >= 0 && b >= 0 && a < cw && b < ch && !vis[b * cw + a]) opts.push([a, b, di, dj]); }
      if (!opts.length) { st.pop(); continue; } const [a, b, di, dj] = opts[Math.floor(hs(i * 7 + a2(n++), j, seed) * opts.length) % opts.length]; vis[b * cw + a] = 1; cell(a, b);
      if (di) rect(L, x0 + 3 * Math.min(i, a) + 2, y0 + 3 * j, 1, 2, 1, z); else rect(L, x0 + 3 * i, y0 + 3 * Math.min(j, b) + 2, 2, 1, 1, z); st.push([a, b]); }
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) { if (i + 1 < cw && hs(i, j, seed + 5) < loops) rect(L, x0 + 3 * i + 2, y0 + 3 * j, 1, 2, 1, z); if (j + 1 < ch && hs(i, j, seed + 6) < loops) rect(L, x0 + 3 * i, y0 + 3 * j + 2, 2, 1, 1, z); }
  }
  // Dekoration der Labyrinthzellen (nur Ränder; die Erreichbarkeitsprüfung räumt ab, was Wege versperrt)
  function mazeDress(L, x0, y0, cw, ch, seed, kinds) { for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) { const x = x0 + 3 * i, y = y0 + 3 * j, r = hs(i, j, seed); if (r < .22) prop(L, x + (hs(i, j, seed + 1) < .5 ? 0 : 1), y, kinds[0]); else if (r < .34) prop(L, x, y + 1, kinds[1]); else if (r < .40) prop(L, x + 1, y + 1, kinds[2]); } }
  const stairs = (L, x, y, w, d, dir) => { for (let j = y - 1; j <= y + d; j++) for (let i = x - 1; i <= x + w; i++) { const k = i + "," + j; if (L.dk[k]) { delete L.dk[k]; if (L.T[j][i] === 4) L.T[j][i] = 1; } } const zn = L.ZN[y - 1][x] || L.ZN[y + d][x]; rect(L, x, y, w, d, 2, zn); res(L, x - 1, y - 1, w + 2, d + 2); L.fix.push({ k: "stair", dir, x, y, w, d }); };
  const spiral = (L, x, y, dir) => { rect(L, x, y, 3, 3, 1); res(L, x - 1, y - 1, 5, 6); L.fix.push({ k: "spiral", dir, x, y }); };
  const door = (L, x, y) => { L.T[y][x] = 1; res(L, x - 1, y, 3, 3); L.fix.push({ k: "door", x, y }); };
  const lk = (A, ta, arrA, B, tb, arrB, kind, opt) => { opt = opt || {}; for (const t of ta) LAYERS[A].links[t[0] + "," + t[1]] = { to: B, x: arrB[0], y: arrB[1], kind, dir: "up", flag: opt.flag, txt: opt.txt }; for (const t of tb) LAYERS[B].links[t[0] + "," + t[1]] = { to: A, x: arrA[0], y: arrA[1], kind, dir: "down" }; };
  const row = (x, y, w) => Array.from({ length: w }, (_, i) => [x + i, y]);
  const stairPair = (A, B, x, y, w, d) => { stairs(LAYERS[A], x, y, w, d, "down"); stairs(LAYERS[B], x, y, w, d, "up"); for (const rx of [x - 1, x + w]) { LAYERS[B].T[y][rx] = 1; prop(LAYERS[B], rx, y, "rail"); } const cx = x + (w >> 1); lk(A, row(x, y, w), [cx, y + d], B, row(x, y + d - 1, w), [cx, y - 1], "stair"); };
  const spiralPair = (A, B, x, y) => { spiral(LAYERS[A], x, y, "up"); spiral(LAYERS[B], x, y, "down"); lk(A, [[x + 1, y + 1]], [x + 1, y + 3], B, [[x + 1, y + 1]], [x + 1, y + 3], "spiral"); };
  const doorPair = (A, ax, ay, B, bx, by) => { door(LAYERS[A], ax, ay); door(LAYERS[B], bx, by); lk(A, [[ax, ay]], [ax, ay + 1], B, [[bx, by]], [bx, by + 1], "door"); };

  /* ======================= ETAGE 1: Erdgeschoss ======================= */
  const F1 = mk("s1", "Erdgeschoss");
  maze(F1, 3, 3, 17, 17, "archiv", 11, .12);                                  // Archiv der Verbotenen Bände (West)
  rect(F1, 23, 23, 11, 11, 1, "archiv"); rect(F1, 7, 8, 7, 5, 1, "archiv"); rect(F1, 40, 8, 9, 6, 1, "archiv"); rect(F1, 36, 40, 9, 6, 1, "archiv"); rect(F1, 7, 36, 9, 8, 1, "archiv");
  rect(F1, 3, 47, 7, 1, 0); rect(F1, 3, 48, 7, 5, 1, "archiv");
  ellip(F1, 80, 13, 21, 10, 1, "orrerium"); rect(F1, 78, 1, 5, 3, 1, "orrerium");  // Orrerium
  corr(F1, 53, 13, 61, 13, 3, "gang"); corr(F1, 99, 13, 109, 13, 3, "gang"); corr(F1, 80, 14, 80, 29, 3, "gang");
  rect(F1, 56, 28, 49, 25, 1, "halle"); corr(F1, 53, 40, 56, 40, 3, "gang"); corr(F1, 104, 40, 109, 40, 3, "gang"); // Halle
  rect(F1, 108, 12, 50, 3, 2, "zellen");                                      // Zellentrakt
  for (let i = 0; i < 7; i++) { const x = 110 + i * 6; rect(F1, x, 4, 5, 7, 1, "zellen"); rect(F1, x + 2, 11, 1, 1, 1, "zellen"); if (i !== 3) { rect(F1, x, 16, 5, 7, 1, "zellen"); rect(F1, x + 2, 15, 1, 1, 1, "zellen"); } }
  rect(F1, 152, 4, 6, 7, 1, "zellen"); rect(F1, 154, 11, 1, 1, 1, "zellen"); corr(F1, 132, 15, 132, 29, 3, "gang");
  rect(F1, 109, 29, 48, 24, 1, "hof"); rect(F1, 109, 39, 44, 3, 2, "hof"); corr(F1, 132, 29, 132, 52, 3, "hof"); // Alchemiehof
  ellip(F1, 118, 34, 4, 2.4, 3, "hof"); ellip(F1, 147, 47, 4, 2.4, 3, "hof"); ellip(F1, 118, 47, 3.4, 2.2, 3, "hof"); ellip(F1, 146, 33, 3, 2, 3, "hof");

  /* ======================= ETAGE 2: Obere Galerien ======================= */
  const F2 = mk("s2", "Obere Galerien");
  rect(F2, 56, 28, 49, 25, 1, "galerie"); rect(F2, 61, 33, 39, 15, 0, "leere"); for (let y = 33; y <= 47; y++) for (let x = 61; x <= 99; x++) F2.ZN[y][x] = "leere";
  rect(F2, 60, 3, 41, 21, 1, "thron"); corr(F2, 80, 24, 80, 29, 3, "gang"); rect(F2, 64, 1, 5, 3, 1, "thron");       // Thronsaal
  maze(F2, 3, 3, 17, 7, "spiegel", 23, .14); rect(F2, 8, 8, 7, 5, 1, "spiegel"); rect(F2, 30, 12, 9, 6, 1, "spiegel"); rect(F2, 44, 5, 7, 5, 1, "spiegel"); corr(F2, 51, 13, 61, 13, 3, "gang"); corr(F2, 28, 22, 28, 29, 3, "gang"); // Spiegelsaal
  for (const rx of [8, 23, 38]) for (const ry of [30, 43]) { rect(F2, rx, ry, 12, 8, 1, "lese"); rect(F2, rx + 4, ry < 40 ? ry + 8 : ry - 1, 3, 1, 1, "lese"); }  // Lesesäle
  rect(F2, 2, 39, 52, 3, 2, "lese"); rect(F2, 2, 33, 5, 7, 1, "lese"); for (const gx of [20, 35]) for (const ry of [30, 43]) rect(F2, gx, ry + 3, 3, 2, 1, "lese"); corr(F2, 54, 40, 56, 40, 3, "gang");
  rect(F2, 108, 3, 50, 21, 1, "gewaechs"); corr(F2, 100, 14, 108, 14, 3, "gang"); rect(F2, 152, 4, 6, 7, 1, "gewaechs");  // Gewächshaus
  ellip(F2, 121, 9, 5, 2.6, 3, "gewaechs"); ellip(F2, 146, 19, 5, 2.6, 3, "gewaechs"); ellip(F2, 141, 7, 3, 2, 3, "gewaechs"); ellip(F2, 117, 20, 3, 2, 3, "gewaechs");
  for (const ry of [30, 43]) for (const rx of [111, 137]) { rect(F2, rx, ry, 18, 8, 1, "labor"); rect(F2, rx + 7, ry < 40 ? ry + 8 : ry - 1, 4, 1, 1, "labor"); }  // Alchemielabor
  rect(F2, 109, 39, 49, 3, 2, "labor"); rect(F2, 152, 42, 3, 1, 1, "labor"); corr(F2, 104, 40, 109, 40, 3, "gang");
  corr(F2, 132, 24, 132, 52, 3, "labor"); for (const ry of [30, 43]) { rect(F2, 129, ry + 3, 2, 2, 1, "labor"); rect(F2, 134, ry + 3, 3, 2, 1, "labor"); }

  /* ======================= TÜRME ======================= */
  const tower = (id, nm, zone, R) => { const L = mk(id, nm); ellip(L, 22, 22, R + 2, R, 1, zone); rect(L, 20, 22 - R - 3, 5, 4, 1, zone); return L; };
  const T1a = tower("t1a", "Astralturm, unten", "turm1", 15), T1b = tower("t1b", "Astralturm, Mitte", "turm1", 13), T1c = tower("t1c", "Astralturm, Spitze", "turm1", 11);
  const T2a = tower("t2a", "Uhrwerkturm, unten", "turm2", 15), T2b = tower("t2b", "Uhrwerkturm, Spitze", "turm2", 12);
  const T3a = tower("t3a", "Schattenturm, unten", "turm3", 15), T3b = tower("t3b", "Schattenturm, Mitte", "turm3", 13), T3c = tower("t3c", "Schattenturm, Spitze", "turm3", 11);

  /* ======================= VERBINDUNGEN ======================= */
  stairPair("s1", "s2", 62, 32, 3, 4); stairPair("s1", "s2", 97, 32, 3, 4);   // die zwei großen Hallentreppen
  spiralPair("s1", "s2", 27, 27); spiralPair("s1", "s2", 152, 39);              // Wendeltreppen: Archiv ↔ Lesesaal, Hof ↔ Labor
  doorPair("s1", 80, 1, "t1a", 22, 4); spiralPair("t1a", "t1b", 21, 29); spiralPair("t1b", "t1c", 21, 14); doorPair("t1c", 22, 8, "s2", 66, 1);
  doorPair("s1", 154, 4, "t2a", 22, 4); spiralPair("t2a", "t2b", 21, 29); doorPair("t2b", 22, 7, "s2", 154, 4);
  doorPair("s1", 6, 48, "t3a", 22, 4); spiralPair("t3a", "t3b", 21, 29); spiralPair("t3b", "t3c", 21, 14); doorPair("t3c", 22, 8, "s2", 4, 33);
  F1.fix.push({ k: "portal", x: 80, y: 50 }); for (const [x, y] of [[79, 50], [81, 50], [79, 49], [80, 49], [81, 49], [79, 48], [80, 48], [81, 48], [79, 47], [80, 47], [81, 47]]) { F1.T[y][x] = 4; F1.dk[x + "," + y] = "none"; } res(F1, 77, 50, 5, 3);
  lk("main", [[99, 107]], [99, 108], "s1", [[80, 50]], [80, 51], "portal", { flag: "sanktumOpen", txt: "Das Spiegeltor ist stumm. Es wartet auf sein Siegel." });

  /* ======================= EINRICHTUNG ======================= */
  const ring = (L, cx, cy, rx, ry, n, kind, rot) => { for (let i = 0; i < n; i++) { const a = (rot || 0) + i * 2 * Math.PI / n; prop(L, Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), kind); } };
  const over = (L, x, y, r) => L.over.push({ x, y, r: r || 24 });
  // ---- Erdgeschoss: Archiv
  mazeDress(F1, 3, 3, 17, 17, 5, ["lamp", "books", "candles"]);
  for (const [x, y] of [[24, 24], [32, 24], [24, 32], [32, 32]]) prop(F1, x, y, "lamp"); for (const [x, y] of [[25, 31], [31, 31], [25, 25], [31, 25]]) prop(F1, x, y, "bench"); prop(F1, 24, 28, "globe"); prop(F1, 32, 28, "obelisk"); motif(F1, "rune", 28.5, 28.5, { r: 4.6, n: 6 }); over(F1, 28, 25, 22);
  rect(F1, 7, 8, 7, 5, 1); prop(F1, 8, 9, "table"); prop(F1, 11, 9, "table"); prop(F1, 10, 11, "lectern"); prop(F1, 13, 9, "books"); prop(F1, 7, 8, "lamp"); prop(F1, 13, 12, "plant"); motif(F1, "rug", 10.5, 10.5, { w: 6, h: 3, col: "#4a3ad0" });
  prop(F1, 41, 9, "table"); prop(F1, 44, 9, "table"); prop(F1, 47, 9, "table"); prop(F1, 41, 12, "bench"); prop(F1, 44, 12, "lectern"); prop(F1, 47, 12, "bench"); prop(F1, 40, 8, "lamp"); prop(F1, 48, 8, "lamp"); motif(F1, "rug", 44.5, 11, { w: 8, h: 3, col: "#6a3ad0" }); over(F1, 44, 10, 20);
  prop(F1, 37, 41, "globe"); prop(F1, 43, 41, "statue"); prop(F1, 37, 44, "books"); prop(F1, 43, 44, "scrolls"); prop(F1, 40, 41, "lamp"); motif(F1, "rune", 40.5, 43.5, { r: 2.6, n: 5 });
  prop(F1, 11, 39, "lectern"); for (const [x, y] of [[10, 38], [12, 38], [10, 40], [12, 40]]) prop(F1, x, y, "chains"); for (const [x, y] of [[8, 37], [14, 37], [8, 42], [14, 42]]) prop(F1, x, y, "candles"); prop(F1, 11, 43, "obelisk"); prop(F1, 8, 40, "statue"); prop(F1, 14, 40, "statue"); motif(F1, "rune", 11.5, 39.5, { r: 4, n: 7, col: "#a384ff" }); over(F1, 11, 38, 18);
  prop(F1, 4, 49, "lamp"); prop(F1, 8, 49, "lamp"); prop(F1, 4, 51, "cage"); prop(F1, 8, 51, "chest"); prop(F1, 5, 52, "books"); motif(F1, "rug", 6.5, 50.5, { w: 3, h: 3, col: "#2a3ad0" });
  // ---- Orrerium
  big(F1, 79, 12, 3, 3, "orrery"); motif(F1, "star", 80.5, 13.5, { r: 13, n: 8 }); motif(F1, "rune", 80.5, 13.5, { r: 8.4, n: 8 }); motif(F1, "compass", 80.5, 13.5, { r: 5 });
  ring(F1, 80, 13, 16.5, 8, 12, "pillar", .3); for (const [x, y] of [[64, 8], [96, 8], [64, 18], [96, 18]]) prop(F1, x, y, "statue"); for (const [x, y] of [[71, 12], [71, 14], [89, 12], [89, 14]]) prop(F1, x, y, "bench"); for (const [x, y] of [[78, 2], [82, 2]]) prop(F1, x, y, "brazier"); for (const [x, y] of [[67, 13], [93, 13], [80, 6], [80, 20]]) prop(F1, x, y, "lamp"); over(F1, 69, 12, 22); over(F1, 91, 12, 22);
  // ---- Große Halle
  rect(F1, 78, 29, 5, 21, 2, "halle"); rect(F1, 79, 51, 3, 2, 2, "halle"); motif(F1, "star", 80.5, 40.5, { r: 9, n: 10 }); motif(F1, "compass", 80.5, 40.5, { r: 4.4 }); motif(F1, "rune", 80.5, 33.5, { r: 2.6, n: 5 });
  for (const x of [75, 85]) for (const y of [33, 37, 41, 45, 49]) prop(F1, x, y, "pillar"); for (const x of [77, 83]) for (const y of [35, 43, 48]) prop(F1, x, y, "brazier");
  for (const y of [32, 40, 47]) over(F1, 80, y, 26); over(F1, 66, 40, 22); over(F1, 94, 40, 22);
  for (const s of [-1, 1]) { const cx = 80 + s * 14; motif(F1, "rug", cx + .5, 36.5, { w: 10, h: 5, col: "#6a3ad0" }); motif(F1, "rug", cx + .5, 45.5, { w: 10, h: 5, col: "#3a4ad0" });
    for (const ty of [35, 46]) { prop(F1, cx - 3, ty, "table"); prop(F1, cx + 3, ty, "table"); prop(F1, cx, ty, "lectern"); prop(F1, cx - 5, ty + (ty < 40 ? 2 : -2), "lamp"); prop(F1, cx + 5, ty + (ty < 40 ? 2 : -2), "lamp"); }
    prop(F1, cx - 3, 38, "books"); prop(F1, cx + 3, 43, "scrolls"); }
  for (let x = 57; x <= 74; x++) prop(F1, x, 29, "shelf"); for (let x = 86; x <= 103; x++) prop(F1, x, 29, "shelf"); for (const y of [30, 31, 32, 33, 34, 35, 36, 44, 45, 46, 47, 48, 49, 50]) { prop(F1, 56, y, "shelf"); prop(F1, 104, y, "shelf"); }
  for (const [x, y] of [[62, 31], [70, 31], [90, 31], [98, 31], [62, 51], [98, 51]]) prop(F1, x, y, "statue"); for (const [x, y] of [[60, 51], [100, 51], [70, 51], [90, 51]]) prop(F1, x, y, "books");
  // ---- Zellentrakt
  for (let i = 0; i < 7; i++) { const x = 110 + i * 6; prop(F1, x, 5, "bed"); prop(F1, x + 3, 5, "chains"); prop(F1, x + 4, 9, i % 2 ? "barrel" : "cage"); prop(F1, x + 1, 9, "books"); if (i !== 3) { prop(F1, x, 21, "bed"); prop(F1, x + 3, 21, "chains"); prop(F1, x + 4, 17, i % 2 ? "cage" : "barrel"); prop(F1, x + 1, 17, "candles"); } }
  for (const x of [114, 123, 140, 149]) over(F1, x, 13, 20); prop(F1, 152, 5, "brazier"); prop(F1, 156, 5, "brazier"); prop(F1, 153, 9, "gear"); prop(F1, 156, 9, "clock"); prop(F1, 152, 9, "chest");
  // ---- Alchemiehof
  big(F1, 130, 38, 5, 5, "fountain"); motif(F1, "rune", 132.5, 40.5, { r: 6.2, n: 8 }); motif(F1, "star", 118.5, 40.5, { r: 2.6, n: 6 }); motif(F1, "star", 146.5, 40.5, { r: 2.6, n: 6 });
  for (let x = 112; x <= 154; x += 4) { prop(F1, x, 30, "pillar"); prop(F1, x, 51, "pillar"); if (x + 2 < 154) { prop(F1, x + 2, 30, "lamp"); prop(F1, x + 2, 51, "lamp"); } }
  for (const [x, y] of [[128, 36], [136, 36], [128, 44], [136, 44]]) prop(F1, x, y, "bench"); for (const [x, y] of [[111, 32], [154, 32], [111, 49], [154, 49]]) prop(F1, x, y, "tree");
  for (const [x, y] of [[124, 33], [126, 33], [138, 33], [140, 33]]) prop(F1, x, y, (x % 4) ? "alchemy" : "cauldron"); for (const [x, y] of [[113, 34], [123, 34], [151, 33], [143, 33], [114, 47], [122, 47], [143, 47], [151, 47], [120, 51], [146, 51]]) prop(F1, x, y, "crystal");
  for (let y = 44; y <= 50; y++) { prop(F1, 125, y, "plant"); prop(F1, 139, y, "plant"); } for (let x = 112; x <= 123; x++) prop(F1, x, 44, "plant"); for (let x = 141; x <= 152; x++) prop(F1, x, 44, "plant"); for (const [x, y] of [[121, 36], [114, 36], [149, 36], [143, 36], [117, 50], [149, 50]]) prop(F1, x, y, "mush");
  // ---- Galerien: Etage 2
  rect(F2, 57, 29, 47, 3, 2, "galerie"); rect(F2, 57, 49, 47, 3, 2, "galerie"); rect(F2, 57, 32, 3, 17, 2, "galerie"); rect(F2, 101, 32, 3, 17, 2, "galerie");
  for (let y = 32; y <= 48; y++) { prop(F2, 60, y, "rail"); prop(F2, 100, y, "rail"); } for (let x = 60; x <= 100; x++) { prop(F2, x, 32, "rail"); prop(F2, x, 48, "rail"); }
  motif(F2, "star", 80.5, 40.5, { r: 11, n: 12 }); for (const [x, y] of [[58.5, 30.5], [102.5, 30.5], [58.5, 50.5], [102.5, 50.5]]) motif(F2, "rune", x, y, { r: 2, n: 5 }); over(F2, 80, 38, 44); over(F2, 80, 30, 22); over(F2, 80, 50, 22); over(F2, 58, 44, 18); over(F2, 102, 44, 18);
  for (let x = 58; x <= 74; x++) prop(F2, x, 28, "shelf"); for (let x = 86; x <= 102; x++) prop(F2, x, 28, "shelf"); for (const y of [30, 31, 32, 34, 36, 37, 38, 44, 46, 47, 48, 50]) { prop(F2, 56, y, "shelf"); prop(F2, 104, y, "shelf"); }
  for (const [x, y] of [[56, 29], [104, 29], [56, 52], [104, 52], [80, 52], [70, 52], [90, 52], [64, 52], [96, 52]]) prop(F2, x, y, hs(x, y, 3) < .5 ? "statue" : "obelisk"); for (const [x, y] of [[62, 51], [98, 51]]) prop(F2, x, y, "lamp");
  // ---- Thronsaal
  rect(F2, 79, 6, 3, 18, 2, "thron"); big(F2, 79, 4, 3, 2, "throne"); motif(F2, "star", 80.5, 14.5, { r: 9, n: 10 }); motif(F2, "rune", 80.5, 14.5, { r: 6, n: 8, col: "#a384ff" });
  for (const x of [70, 90]) for (const y of [7, 11, 15, 19]) prop(F2, x, y, "pillar"); for (const x of [75, 85]) for (const y of [8, 14, 20]) prop(F2, x, y, "brazier"); for (const [x, y] of [[62, 5], [98, 5], [62, 21], [98, 21], [77, 5], [83, 5]]) prop(F2, x, y, "statue");
  for (const y of [7, 8, 9, 10, 17, 18, 19, 20]) { prop(F2, 61, y, "shelf"); prop(F2, 99, y, "shelf"); } for (const [x, y] of [[64, 2], [68, 2]]) prop(F2, x, y, "brazier"); for (const [x, y] of [[66, 7], [94, 7], [66, 18], [94, 18]]) prop(F2, x, y, "lectern");
  for (const [x, y] of [[80, 9], [80, 18], [70, 13], [90, 13]]) over(F2, x, y, 26);
  // ---- Spiegelsaal
  mazeDress(F2, 3, 3, 17, 7, 9, ["mirror", "candles", "lamp"]); motif(F2, "eye", 11.5, 10.5, { r: 2.4 }); ring(F2, 11, 10, 2.6, 1.6, 4, "mirror", .8); motif(F2, "eye", 34.5, 15, { r: 3.6 }); ring(F2, 34, 14.5, 3.6, 2.2, 6, "mirror", .2); prop(F2, 31, 13, "lamp"); prop(F2, 38, 16, "lamp"); motif(F2, "rune", 47.5, 7.5, { r: 2.2, n: 5, col: "#a384ff" }); prop(F2, 45, 6, "candles"); prop(F2, 49, 8, "candles"); prop(F2, 45, 8, "mirror"); prop(F2, 49, 6, "mirror"); over(F2, 34, 14, 20);
  // ---- Lesesäle
  for (const rx of [8, 23, 38]) for (const ry of [30, 43]) { const top = ry < 40, sy = top ? ry : ry + 7; for (let x = rx; x < rx + 12; x++) if (!(top ? false : (x >= rx + 4 && x <= rx + 6))) prop(F2, x, sy, "shelf"); const ty = top ? ry + 3 : ry + 4;
    prop(F2, rx + 2, ty, "table"); prop(F2, rx + 9, ty, "table"); prop(F2, rx + 5, ty, "lectern"); prop(F2, rx + 6, ty, "lectern"); prop(F2, rx + 1, ty + (top ? 2 : -2), "lamp"); prop(F2, rx + 10, ty + (top ? 2 : -2), "lamp"); prop(F2, rx + 3, ty + (top ? 2 : -2), "books"); prop(F2, rx + 8, ty + (top ? 2 : -2), "bench"); motif(F2, "rug", rx + 6.5, ty + .5, { w: 9, h: 3, col: hs(rx, ry, 2) < .5 ? "#4a3ad0" : "#7a3ab8" }); over(F2, rx + 5, ty, 18); }
  prop(F2, 2, 34, "brazier"); prop(F2, 6, 34, "brazier"); prop(F2, 2, 37, "chest"); prop(F2, 6, 37, "books"); for (const x of [14, 29, 44]) over(F2, x, 40, 20);
  // ---- Gewächshaus
  rect(F2, 108, 13, 50, 3, 2, "gewaechs"); rect(F2, 131, 4, 3, 20, 2, "gewaechs"); rect(F2, 116, 4, 2, 9, 2, "gewaechs"); rect(F2, 116, 16, 2, 8, 2, "gewaechs"); rect(F2, 147, 4, 2, 9, 2, "gewaechs"); rect(F2, 147, 16, 2, 8, 2, "gewaechs");
  for (let y = 4; y < 23; y++) for (let x = 109; x < 157; x++) { if (F2.T[y][x] !== 1 || x >= 152 && y <= 10) continue; const r = hs(x, y, 71); if (r < .06) prop(F2, x, y, "tree"); else if (r < .12) prop(F2, x, y, "mush"); else if (r < .15) prop(F2, x, y, "crystal"); else if (r < .62) prop(F2, x, y, "plant"); }
  for (const [x, y] of [[125, 12], [140, 12], [125, 16], [140, 16], [110, 12], [155, 12]]) { F2.T[y][x] === 1 || (F2.T[y][x] === 4 && (F2.T[y][x] = 1, delete F2.dk[x + "," + y])); prop(F2, x, y, "bench"); }
  prop(F2, 152, 5, "lamp"); prop(F2, 156, 5, "lamp"); prop(F2, 153, 9, "gear"); prop(F2, 156, 9, "clock");
  // ---- Alchemielabor
  for (const ry of [30, 43]) for (const rx of [111, 137]) { const top = ry < 40, y1 = top ? ry : ry + 7, y2 = top ? ry + 2 : ry + 5;
    prop(F2, rx + 2, y2, "cauldron"); prop(F2, rx + 15, y2, "cauldron"); prop(F2, rx + 6, y2, "alchemy"); prop(F2, rx + 11, y2, "alchemy"); prop(F2, rx + 1, y1, "crystal"); prop(F2, rx + 16, y1, "crystal"); prop(F2, rx + 4, y1, "books"); prop(F2, rx + 13, y1, "armor"); prop(F2, rx + 8, top ? ry + 5 : ry + 2, "lamp"); prop(F2, rx + 9, top ? ry + 5 : ry + 2, "lamp"); motif(F2, "rug", rx + 9, ry + 4, { w: 8, h: 3, col: hs(rx, ry, 4) < .5 ? "#2a7a6a" : "#5a3a9a" }); over(F2, rx + 8, ry + 3, 20); }
  for (const x of [114, 124, 144, 150]) over(F2, x, 40, 18); prop(F2, 108, 38, "lamp"); prop(F2, 108, 42, "lamp");
  // ---- Astralturm: Sternenhalle, Globen und Observatorium
  ring(T1a, 22, 22, 11, 11, 8, "pillar", .39); for (const [x, y] of [[15, 22], [29, 22]]) prop(T1a, x, y, "lectern"); for (const [x, y] of [[19, 16], [25, 16]]) prop(T1a, x, y, "globe"); for (const [x, y] of [[13, 18], [31, 18], [13, 26], [31, 26]]) prop(T1a, x, y, "shelf"); for (let y = 19; y <= 25; y++) { prop(T1a, 10, y, "shelf"); prop(T1a, 34, y, "shelf"); } motif(T1a, "rune", 22.5, 22.5, { r: 6.6, n: 7 }); motif(T1a, "star", 22.5, 22.5, { r: 10, n: 12 }); over(T1a, 22, 21, 26); rect(T1a, 21, 6, 3, 18, 2, "turm1");
  ring(T1b, 22, 22, 9, 9, 8, "pillar", .39); big(T1b, 21, 20, 3, 3, "armillary"); prop(T1b, 14, 22, "lectern"); prop(T1b, 30, 22, "lectern"); for (const [x, y] of [[17, 17], [27, 17], [17, 27], [27, 27]]) prop(T1b, x, y, "globe"); for (const [x, y] of [[22, 12], [22, 25]]) prop(T1b, x, y, "statue"); motif(T1b, "rune", 22.5, 22.5, { r: 7, n: 8 }); motif(T1b, "star", 22.5, 22.5, { r: 9.4, n: 8 }); for (const [x, y] of [[15, 15], [29, 15], [15, 29], [29, 29]]) prop(T1b, x, y, "lamp");
  big(T1c, 20, 20, 3, 3, "telescope"); for (const [x, y] of [[14, 22], [30, 22]]) big(T1c, x, y - 1, 2, 2, "armillary"); ring(T1c, 22, 22, 9, 8, 6, "pillar", .5); for (const [x, y] of [[22, 14], [22, 30]]) prop(T1c, x, y, "obelisk"); motif(T1c, "rune", 22.5, 22.5, { r: 8, n: 12 }); motif(T1c, "star", 22.5, 22.5, { r: 10.4, n: 12 }); for (const [x, y] of [[16, 28], [28, 28], [16, 16], [28, 16]]) prop(T1c, x, y, "bench");
  // ---- Uhrwerkturm: Zahnräder, Uhren, die Orgel
  motif(T2a, "cog", 22.5, 22.5, { r: 11, n: 18 }); motif(T2a, "cog", 12.5, 16.5, { r: 4, n: 10 }); motif(T2a, "cog", 32.5, 16.5, { r: 4.4, n: 10 }); ring(T2a, 22, 22, 11, 11, 8, "clock", .39); for (const [x, y] of [[17, 22], [27, 22], [22, 17]]) prop(T2a, x, y, "gear"); for (const [x, y] of [[12, 22], [32, 22]]) prop(T2a, x, y, "brazier"); for (const [x, y] of [[16, 27], [28, 27]]) prop(T2a, x, y, "lectern"); over(T2a, 22, 20, 26); rect(T2a, 21, 6, 3, 14, 2, "turm2");
  big(T2b, 17, 17, 5, 3, "organ"); motif(T2b, "cog", 22.5, 22.5, { r: 9, n: 16 }); ring(T2b, 22, 22, 10, 9.4, 8, "clock", .39); for (const [x, y] of [[20, 22], [24, 22]]) prop(T2b, x, y, "bench"); for (const [x, y] of [[13, 22], [31, 22]]) prop(T2b, x, y, "brazier"); for (const [x, y] of [[16, 27], [28, 27], [16, 14], [28, 14]]) prop(T2b, x, y, "gear"); over(T2b, 22, 20, 26);
  // ---- Schattenturm: Kerzen, Spiegel, Risse
  motif(T3a, "eye", 22.5, 22.5, { r: 6 }); ring(T3a, 22, 22, 11, 11, 10, "candles", .3); ring(T3a, 22, 22, 6.4, 6.4, 6, "obelisk", .1); for (const [x, y] of [[12, 22], [32, 22]]) prop(T3a, x, y, "mirror"); for (const [x, y] of [[15, 12], [29, 12]]) prop(T3a, x, y, "cage"); rect(T3a, 21, 6, 3, 18, 2, "turm3");
  motif(T3b, "rune", 22.5, 22.5, { r: 7.4, n: 9, col: "#a384ff" }); ring(T3b, 22, 22, 9.4, 9.4, 8, "mirror", .39); for (const [x, y] of [[22, 22]]) prop(T3b, x, y, "brazier"); ring(T3b, 22, 22, 5, 5, 4, "candles", .8); for (const [x, y] of [[14, 22], [30, 22]]) prop(T3b, x, y, "statue");
  motif(T3c, "eye", 22.5, 22.5, { r: 8 }); ring(T3c, 22, 22, 8.6, 7.6, 8, "obelisk", .39); big(T3c, 21, 21, 3, 3, "titan"); for (const [x, y] of [[14, 22], [30, 22]]) prop(T3c, x, y, "crystal"); for (const [x, y] of [[16, 28], [28, 28]]) prop(T3c, x, y, "candles");

  /* ======================= Feinschliff ======================= */
  const all = [F1, F2, T1a, T1b, T1c, T2a, T2b, T3a, T3b, T3c];
  for (const L of all) { for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (L.T[y][x] === 0 && !L.ZN[y][x]) for (let d = 1; d <= 2 && !L.ZN[y][x]; d++) for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d]]) { const z = L.ZN[y + dy] && L.ZN[y + dy][x + dx]; if (z && L.T[y + dy][x + dx] !== 0) { L.ZN[y][x] = z; break; } } }
  for (const L of all) { // Erreichbarkeit: Requisiten, die Wege versperren, fliegen raus; unerreichbarer Boden wird Wand
    const anchors = []; for (const id in LAYERS) { const M = LAYERS[id]; if (id === L.id) for (const k in M.links) anchors.push(k.split(",").map(Number)); for (const k in M.links) { const l = M.links[k]; if (l.to === L.id) anchors.push([l.x, l.y]); } }
    const walk = (x, y) => L.T[y] && (L.T[y][x] === 1 || L.T[y][x] === 2);
    for (let it = 0; it < 12; it++) { const seen = new Uint8Array(WW * WH), q = []; for (const [x, y] of anchors) if (walk(x, y) && !seen[y * WW + x]) { seen[y * WW + x] = 1; q.push([x, y]); } while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (walk(nx, ny) && !seen[ny * WW + nx]) { seen[ny * WW + nx] = 1; q.push([nx, ny]); } } }
      let un = 0, rm = 0; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (walk(x, y) && !seen[y * WW + x]) un++; if (!un) { L.cut = 0; break; }
      for (const k in L.dk) { const kind = L.dk[k]; if (kind === "none") continue; const [x, y] = k.split(",").map(Number); let a = false, b = false; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (walk(nx, ny)) { if (seen[ny * WW + nx]) a = true; else b = true; } } if (a && b) { L.T[y][x] = 1; delete L.dk[k]; rm++; } }
      if (!rm) { let cut = 0; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (walk(x, y) && !seen[y * WW + x]) { L.T[y][x] = 0; cut++; } L.cut = cut; break; } }
    L._lt = null; }
  window.SANK = { F1, F2, towers: { T1a, T1b, T1c, T2a, T2b, T3a, T3b, T3c } };
})();
