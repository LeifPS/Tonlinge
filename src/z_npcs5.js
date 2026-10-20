/* ===== Sanktum: Aussehen, Haltung und Platzierung der 16 Gestalten ===== */
/* Alle Gestalten: dunkle Kapuzen, Schleier und Masken, Augen glühen. Farbe der Augen = "mys" (r,g,b), Gesicht = "mk" (void, veil, mask) */
const MYS5 = {
  //          Kleid      Saum       Augen           Gesicht   Kleidung  Kopf       Gegenstand  Größe
  wisperlie: ["#1d3a3a", "#0e2222", "125,255,216", "void",   "cloak",  "hood",    "lantern",  [.9, .96]],
  kolba:     ["#2a2048", "#150f2a", "199,155,255", "veil",   "robe",   "hood",    "staff",    [1.04, 1]],
  merula:    ["#3a1424", "#1e0a12", "255,120,150", "mask",   "robe",   "hood",    "satchel",  [.94, 1]],
  orrerius:  ["#3a3018", "#1c180a", "255,208,100", "void",   "robe",   "hood",    "orb",      [1.1, 1.06]],
  schweiger: ["#cfd6ea", "#7a84a8", "190,210,255", "void",   "robe",   "hood",    "none",     [1.08, 1.1]],
  lampion:   ["#40281a", "#1e130c", "255,170,70",  "veil",   "cloak",  "hood",    "lantern",  [1, 1]],
  quill:     ["#3a3830", "#1c1b16", "200,210,190", "void",   "robe",   "hood",    "feder",    [.96, 1.04]],
  hortensia: ["#1e3a26", "#0d1c13", "140,255,150", "veil",   "cloak",  "hood",    "none",     [1.02, 1]],
  phiolus:   ["#1e3a40", "#0d1c20", "120,255,240", "mask",   "cloak",  "hood",    "none",     [1.06, .98]],
  nummer7:   ["#3a3c4a", "#1c1d26", "170,175,200", "void",   "cloak",  "hood",    "none",     [.92, 1]],
  spiegelich: ["#2a3050", "#12162a", "200,230,255", "mask",  "cloak",  "hood",    "none",     [1, 1]],
  sidera:    ["#1c2458", "#0c102c", "140,170",       "void",   "cloak",  "hood",    "scope",    [.94, 1.02]],
  tickel:    ["#3c2c14", "#1c150a", "230,180,80",  "veil",   "cloak",  "hood",    "none",     [1.08, .96]],
  umbra:     ["#161024", "#08050f", "170,130,255", "void",   "cloak",  "hood",    "none",     [.96, 1.08]],
  fiola:     ["#4a1a3a", "#240c1c", "255,110,199", "mask",   "dress",  "hood",    "none",     [.78, .8]],
  pergus:    ["#40341e", "#1e190e", "230,210,140", "void",   "robe",   "hood",    "satchel",  [1.12, .98]]
};
MYS5.sidera[2] = "140,170,255";
for (const id in MYS5) { const m = MYS5[id]; NPC_LOOK[id] = { skin: "e", hair: "#101018", hs: "bald", ht: m[5], ho: m[1], of: m[4], ac: m[1], it: m[6], w: m[7][0], h: m[7][1], mys: m[2], mk: m[3] }; NPCS[id].col = m[0]; NPCS[id].hat = m[1]; }
Object.assign(POSES, {
  wisperlie: { p: "look" }, kolba: { p: "read", seat: "crate" }, merula: { p: "read", seat: "ground" }, orrerius: { p: "scope" }, schweiger: { p: "sit", seat: "ground" },
  lampion: { p: "look" }, quill: { p: "read", seat: "stump" }, hortensia: { p: "work", dir: -1 }, phiolus: { p: "work", dir: 1 }, nummer7: { p: "sit", seat: "ground" },
  spiegelich: { p: "look" }, sidera: { p: "scope" }, tickel: { p: "work", dir: -1 }, umbra: { p: "look" }, fiola: { p: "sit", seat: "ground" }, pergus: { p: "read", seat: "crate" }
});
/* Platzierung: die gewünschte Kachel wird auf den nächsten freien, begehbaren Boden gelegt (Nachbarn müssen frei sein) */
(function placeNpcs5() {
  const free = (L, x, y) => { if (!L.T[y] || L.T[y][x] !== 1 || L.res.has(x + "," + y)) return false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const v = L.T[y + dy] && L.T[y + dy][x + dx]; if (v !== 1 && v !== 2) return false; } return true; };
  for (const id in NPCS) { const n = NPCS[id]; if (n.area !== 5 || !n.l || !LAYERS[n.l]) continue; const L = LAYERS[n.l]; let best = null, bd = 1e9;
    for (let r = 0; r <= 14 && !best; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = n.x + dx, y = n.y + dy; if (!free(L, x, y)) continue; const d = Math.hypot(dx, dy); if (d < bd) { bd = d; best = [x, y]; } }
    if (best) { n.x = best[0]; n.y = best[1]; } else console.warn("NPC ohne Platz:", id); }
})();
