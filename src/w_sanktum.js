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
AREAS[5] = { name: "Sanktum Magus", xpMul: 13, valMul: 26, rm: { 2: .7, 3: .5, 4: .45, 5: .5, 6: 1 }, wild: 1.5 };
const SZONES5 = ["halle", "archiv", "orrerium", "zellen", "hof", "gang", "galerie", "thron", "spiegel", "lese", "labor", "gewaechs", "turm1", "turm2", "turm3"];

(function buildSanktum() {
  const put = (L, x, y, v, z) => { if (x < 0 || y < 0 || x >= WW || y >= WH) return; L.T[y][x] = v; if (z !== undefined) L.ZN[y][x] = z; };
  const rect = (L, x, y, w, h, v, z) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) put(L, i, j, v, z); };
  const ellip = (L, cx, cy, rx, ry, v, z) => { for (let j = Math.floor(cy - ry); j <= Math.ceil(cy + ry); j++) for (let i = Math.floor(cx - rx); i <= Math.ceil(cx + rx); i++) if (((i - cx) / rx) ** 2 + ((j - cy) / ry) ** 2 <= 1) put(L, i, j, v, z); };
  const dk = (L, x, y, kind) => { put(L, x, y, 4); L.dk[x + "," + y] = kind; };
  /* Labyrinth aus Zellen (2×2 Boden, 1 Kachel Abstand), mit Schleifen */
  function maze(L, x0, y0, cw, ch, z, seed, loops) {
    const vis = new Uint8Array(cw * ch), st = [[0, 0]], links = []; vis[0] = 1; let n = 0;
    const cell = (i, j) => rect(L, x0 + 3 * i, y0 + 3 * j, 2, 2, 1, z);
    cell(0, 0);
    while (st.length) { const [i, j] = st[st.length - 1], opts = []; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a >= 0 && b >= 0 && a < cw && b < ch && !vis[b * cw + a]) opts.push([a, b, di, dj]); }
      if (!opts.length) { st.pop(); continue; } const [a, b, di, dj] = opts[Math.floor(hs(i * 7 + a2(n++), j, seed) * opts.length) % opts.length]; vis[b * cw + a] = 1; cell(a, b);
      if (di) rect(L, x0 + 3 * Math.min(i, a) + 2, y0 + 3 * j, 1, 2, 1, z); else rect(L, x0 + 3 * i, y0 + 3 * Math.min(j, b) + 2, 2, 1, 1, z); st.push([a, b]); }
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) { if (i + 1 < cw && hs(i, j, seed + 5) < loops) rect(L, x0 + 3 * i + 2, y0 + 3 * j, 1, 2, 1, z); if (j + 1 < ch && hs(i, j, seed + 6) < loops) rect(L, x0 + 3 * i, y0 + 3 * j + 2, 2, 1, 1, z); }
  }
  const a2 = n => n * 31 + 7;
  const corr = (L, x1, y1, x2, y2, w, z, v) => { v = v || 2; if (x1 === x2) rect(L, x1 - (w >> 1), Math.min(y1, y2), w, Math.abs(y2 - y1) + 1, v, z); else rect(L, Math.min(x1, x2), y1 - (w >> 1), Math.abs(x2 - x1) + 1, w, v, z); };
  const mk = (id, name) => { const L = newLayer(id, name, 5); L.dk = {}; L.npcSpots = {}; return L; };

  /* ===== Etage 1: Erdgeschoss ===== */
  const F1 = mk("s1", "Erdgeschoss");
  maze(F1, 3, 3, 17, 17, "archiv", 11, .1);
  rect(F1, 22, 24, 7, 7, 1, "gang");                  // Wendeltreppe West
  rect(F1, 8, 9, 6, 5, 1, "archiv"); rect(F1, 36, 38, 7, 5, 1, "archiv"); rect(F1, 30, 7, 11, 9, 1, "archiv"); // Nischen, Lesezimmer
  rect(F1, 3, 47, 7, 6, 1, "archiv");                 // Ecke Südwest (Schattenturm)
  // Halle der Folianten
  rect(F1, 58, 28, 45, 25, 1, "halle");
  corr(F1, 80, 29, 80, 52, 3, "halle"); corr(F1, 59, 40, 102, 40, 3, "halle");
  for (const [x, y] of [[62, 32], [68, 32], [74, 32], [86, 32], [92, 32], [98, 32], [62, 36], [98, 36], [62, 44], [98, 44], [62, 48], [68, 48], [74, 48], [86, 48], [92, 48], [98, 48], [68, 36], [92, 36], [68, 44], [92, 44]]) dk(F1, x, y, "pillar");
  dk(F1, 80, 40, "statue");
  // Verbindungen
  corr(F1, 52, 40, 58, 40, 3, "gang"); corr(F1, 102, 40, 108, 40, 3, "gang"); corr(F1, 80, 22, 80, 28, 3, "gang");
  // Orrerium
  ellip(F1, 80, 13, 21, 10, 1, "orrerium"); corr(F1, 52, 13, 62, 13, 3, "gang"); corr(F1, 98, 13, 108, 13, 3, "gang");
  rect(F1, 79, 12, 2, 2, 4); F1.dk["79,12"] = "orrery"; F1.dk["80,12"] = "orrery"; F1.dk["79,13"] = "orrery"; F1.dk["80,13"] = "orrery";
  corr(F1, 80, 23, 80, 28, 3, "gang");
  // Zellentrakt
  rect(F1, 108, 12, 49, 3, 2, "zellen");
  for (let i = 0; i < 8; i++) { const x = 110 + i * 6; rect(F1, x, 4, 5, 7, 1, "zellen"); rect(F1, x + 2, 11, 1, 1, 1, "zellen"); rect(F1, x, 16, 5, 7, 1, "zellen"); rect(F1, x + 2, 15, 1, 1, 1, "zellen"); if (i % 3 === 1) { dk(F1, x + 1, 5, "cage"); dk(F1, x + 3, 21, "chains"); } }
  // Alchemiehof
  rect(F1, 110, 29, 45, 23, 1, "hof"); corr(F1, 108, 40, 154, 40, 3, "hof"); corr(F1, 132, 23, 132, 30, 3, "gang");
  ellip(F1, 132, 40, 5, 4, 1, "hof"); ellip(F1, 120, 35, 3, 2, 3, "hof"); ellip(F1, 144, 46, 4, 2, 3, "hof"); ellip(F1, 118, 47, 3, 2, 3, "hof");
  for (let k = 0; k < 40; k++) { const x = 111 + Math.floor(hs(k, 1, 41) * 43), y = 30 + Math.floor(hs(k, 2, 41) * 21); if (F1.T[y][x] === 1 && Math.abs(y - 40) > 2 && Math.hypot(x - 132, y - 40) > 6 && !(x > 130 && x < 135 && y < 32)) dk(F1, x, y, hs(k, 3, 41) < .5 ? "plant" : "crystal"); }
  rect(F1, 150, 37, 6, 7, 1, "hof");                  // Wendeltreppe Ost
  // Türme: Eingänge
  rect(F1, 78, 3, 5, 3, 1, "orrerium"); rect(F1, 153, 11, 4, 5, 1, "zellen");
  // Spiegeltor (vom Altarraum)
  rect(F1, 78, 50, 5, 3, 1, "halle");

  /* ===== Etage 2: Obere Galerien ===== */
  const F2 = mk("s2", "Obere Galerien");
  rect(F2, 56, 27, 49, 27, 1, "galerie"); rect(F2, 61, 32, 39, 17, 0, "leere");
  for (let x = 60; x <= 100; x++) { dk(F2, x, 31, "rail"); dk(F2, x, 49, "rail"); } for (let y = 31; y <= 49; y++) { dk(F2, 60, y, "rail"); dk(F2, 100, y, "rail"); }
  for (let y = 32; y <= 48; y++) for (let x = 61; x <= 99; x++) F2.ZN[y][x] = "leere";
  corr(F2, 80, 24, 80, 30, 3, "gang");
  rect(F2, 62, 3, 37, 21, 1, "thron"); corr(F2, 80, 4, 80, 24, 3, "thron"); corr(F2, 63, 9, 98, 9, 3, "thron"); dk(F2, 80, 5, "throne");
  for (const x of [65, 69, 73, 87, 91, 95]) for (const y of [7, 12, 17, 21]) if (F2.T[y][x] === 1) dk(F2, x, y, (x + y) % 2 ? "pillar" : "banner");
  // Spiegelsaal
  maze(F2, 4, 4, 16, 7, "spiegel", 23, .12); corr(F2, 52, 14, 62, 14, 3, "gang"); corr(F2, 51, 14, 57, 14, 3, "gang");
  // Lesesäle
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { const x = 4 + c * 16, y = 31 + r * 12; rect(F2, x, y, 14, 9, 1, "lese"); rect(F2, x + 6, y - (r ? 2 : 0), 2, 2, 1, "lese"); rect(F2, x + 14, y + 4, 2, 2, 1, "lese"); for (const [tx, ty] of [[x + 2, y + 2], [x + 11, y + 2], [x + 2, y + 6], [x + 11, y + 6]]) dk(F2, tx, ty, "table"); }
  corr(F2, 5, 30, 50, 30, 2, "lese", 1); rect(F2, 4, 28, 48, 3, 1, "lese"); corr(F2, 49, 40, 56, 40, 3, "gang"); rect(F2, 22, 24, 7, 7, 1, "gang");
  rect(F2, 3, 45, 7, 6, 1, "lese"); rect(F2, 4, 41, 48, 2, 1, "lese");
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { const x = 4 + c * 16, y = 31 + r * 12; rect(F2, x + 6, y + (r ? -3 : 9), 2, 3, 1, "lese"); }
  // Gewächshaus
  rect(F2, 108, 3, 49, 23, 1, "gewaechs"); corr(F2, 98, 14, 108, 14, 3, "gang");
  ellip(F2, 120, 10, 6, 3, 3, "gewaechs"); ellip(F2, 146, 18, 6, 3, 3, "gewaechs"); ellip(F2, 133, 21, 4, 2, 3, "gewaechs");
  for (let k = 0; k < 110; k++) { const x = 109 + Math.floor(hs(k, 1, 51) * 47), y = 4 + Math.floor(hs(k, 2, 51) * 21); if (F2.T[y][x] === 1 && !(y >= 12 && y <= 16 && x < 112) && !(x >= 130 && x <= 134 && y >= 21)) dk(F2, x, y, "plant"); }
  corr(F2, 132, 24, 132, 31, 3, "gang");
  // Labor
  rect(F2, 108, 30, 49, 23, 0, null);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { const x = 110 + c * 24, y = 31 + r * 12; rect(F2, x, y, 21, 9, 1, "labor"); dk(F2, x + 3, y + 2, "cauldron"); dk(F2, x + 17, y + 2, "cauldron"); dk(F2, x + 10, y + 6, "table"); rect(F2, x + 9, y + (r ? -3 : 9), 3, 3, 1, "labor"); rect(F2, x + (c ? -3 : 21), y + 4, 3, 2, 1, "labor"); }
  corr(F2, 108, 40, 154, 40, 3, "labor", 1); corr(F2, 108, 40, 104, 40, 3, "gang"); corr(F2, 131, 30, 131, 52, 2, "labor", 1);
  rect(F2, 150, 37, 6, 7, 1, "labor"); rect(F2, 153, 11, 4, 5, 1, "gewaechs"); rect(F2, 78, 3, 5, 3, 1, "thron"); rect(F2, 3, 47, 7, 6, 1, "lese");
  // Schatten und Ränder
  for (const L of [F1, F2]) { for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (L.T[y][x] === 0 && !L.ZN[y][x]) for (let d = 1; d <= 2 && !L.ZN[y][x]; d++) for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d], [d, d], [-d, -d], [d, -d], [-d, d]]) { const z = L.ZN[y + dy] && L.ZN[y + dy][x + dx]; if (z && L.T[y + dy][x + dx] !== 0) { L.ZN[y][x] = z; break; } } }
  /* ===== Türme ===== */
  const tower = (id, nm, zone, rad) => { const L = mk(id, nm); ellip(L, 22, 22, rad + 2, rad, 1, zone); ellip(L, 22, 22, rad - 4, rad - 5, 2, zone); L.ZN.forEach(r => r.forEach((v, i, a) => { })); rect(L, 20, 22 + rad - 1, 5, 4, 1, zone); rect(L, 20, 22 - rad - 2, 5, 4, 1, zone); return L; };
  const T1a = tower("t1a", "Astralturm, unten", "turm1", 15), T1b = tower("t1b", "Astralturm, Mitte", "turm1", 13), T1c = tower("t1c", "Astralturm, Spitze", "turm1", 11);
  const T2a = tower("t2a", "Uhrwerkturm, unten", "turm2", 15), T2b = tower("t2b", "Uhrwerkturm, Spitze", "turm2", 12);
  const T3a = tower("t3a", "Schattenturm, unten", "turm3", 15), T3b = tower("t3b", "Schattenturm, Mitte", "turm3", 13), T3c = tower("t3c", "Schattenturm, Spitze", "turm3", 11);
  for (const L of [T1a, T1b, T1c, T2a, T2b, T3a, T3b, T3c]) { const z = L.ZN[22][22]; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (L.T[y][x] === 0 && ((x - 22) ** 2 / 1 + (y - 22) ** 2 / 1) < 26 * 26) L.ZN[y][x] = z; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (L.T[y][x] === 0) L.ZN[y][x] = z; }
  // Säulenring und Mittelstück
  for (const [L, r] of [[T1a, 15], [T1b, 13], [T1c, 11], [T2a, 15], [T2b, 12], [T3a, 15], [T3b, 13], [T3c, 11]]) for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + .39, x = Math.round(22 + Math.cos(a) * (r - 2)), y = Math.round(22 + Math.sin(a) * (r - 3)); if (L.T[y][x] === 1 || L.T[y][x] === 2) dk(L, x, y, "pillar"); }
  dk(T1c, 22, 22, "orrery"); dk(T2a, 22, 22, "clock"); dk(T2b, 22, 22, "clock"); dk(T3c, 22, 22, "crystal"); dk(T1b, 22, 22, "globe"); dk(T3b, 22, 22, "brazier");
  /* ===== Treppen und Tore ===== */
  const st = (a, b, kind, opt) => linkLayers(a, b, kind, opt);
  st(["s1", 25, 27, 25, 28], ["s2", 25, 27, 25, 28], "stair");           // West
  st(["s1", 152, 40, 152, 41], ["s2", 152, 40, 152, 41], "stair");       // Ost
  st(["s1", 61, 30, 62, 30], ["s2", 61, 28, 62, 28], "stair");           // Halle links
  st(["s1", 100, 30, 99, 30], ["s2", 100, 28, 99, 28], "stair");         // Halle rechts
  st(["s1", 80, 4, 80, 5], ["t1a", 22, 33, 22, 31], "stair");            // Astralturm
  st(["t1a", 22, 11, 22, 13], ["t1b", 22, 31, 22, 29], "stair");
  st(["t1b", 22, 13, 22, 15], ["t1c", 22, 29, 22, 27], "stair");
  st(["t1c", 22, 17, 22, 19], ["s2", 80, 4, 80, 6], "bridge");
  st(["s1", 155, 13, 154, 13], ["t2a", 22, 33, 22, 31], "stair");        // Uhrwerkturm
  st(["t2a", 22, 11, 22, 13], ["t2b", 22, 33, 22, 31], "stair");
  st(["t2b", 22, 12, 22, 14], ["s2", 155, 13, 154, 13], "bridge");
  st(["s1", 5, 50, 6, 50], ["t3a", 22, 33, 22, 31], "stair");            // Schattenturm
  st(["t3a", 22, 11, 22, 13], ["t3b", 22, 31, 22, 29], "stair");
  st(["t3b", 22, 13, 22, 15], ["t3c", 22, 29, 22, 27], "stair");
  st(["t3c", 22, 17, 22, 19], ["s2", 5, 50, 6, 50], "bridge");
  st(["main", 99, 107, 99, 108], ["s1", 80, 52, 80, 51], "portal", { flag: "sanktumOpen", txt: "Das Spiegeltor ist stumm. Es wartet auf sein Siegel.", dirA: "up", dirB: "down" }); // Spiegeltor
  // Erreichbarkeit: Boden, der von keiner Treppe/keinem Tor erreichbar ist, wird zu Wand
  for (const L of Object.values(LAYERS)) { if (L.id === "main") continue; const seen = new Set(), q = []; const ok = (x, y) => L.T[y] && (L.T[y][x] === 1 || L.T[y][x] === 2 || L.T[y][x] === 3);
    for (const k of Object.keys(L.links)) { const [x, y] = k.split(",").map(Number); if (ok(x, y)) { q.push([x, y]); seen.add(k); } }
    while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (!seen.has(k) && ok(nx, ny)) { seen.add(k); q.push([nx, ny]); } } }
    let cut = 0; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if ((L.T[y][x] === 1 || L.T[y][x] === 2) && !seen.has(x + "," + y)) { L.T[y][x] = 0; cut++; } L.cut = cut; }
  window.SANK = { F1, F2, towers: { T1a, T1b, T1c, T2a, T2b, T3a, T3b, T3c } };
})();
