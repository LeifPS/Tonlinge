/* ===== Sanktum: Aussehen, Haltung und Platzierung der 16 Gestalten ===== */
Object.assign(NPC_LOOK, {
  wisperlie: { skin: "d", hair: "#d8f4e8", hs: "wavy", ht: "none", ho: "#17a58c", of: "cloak", ac: "#7dffd8", it: "lantern", w: .9, h: .96 },
  kolba:     { skin: "b", hair: "#3a2a5a", hs: "long", ht: "hood", ho: "#4a2a9a", of: "robe", ac: "#c79bff", bd: "full", bc: "#6a5a8a", gl: "round", it: "staff", w: 1.04 },
  merula:    { skin: "a", hair: "#5a1a2a", hs: "bun", ht: "none", ho: "#5a1a2a", of: "dress", ac: "#f0c880", gl: "round", it: "satchel", w: .94 },
  orrerius:  { skin: "b", hair: "#e8e0c8", hs: "long", ht: "pointy", ho: "#6a4a10", of: "robe", ac: "#e8c060", bd: "full", bc: "#e8e0c8", it: "orb", w: 1.1, h: 1.04 },
  schweiger: { skin: "e", hair: "#f2f6ff", hs: "long", ht: "hood", ho: "#3a4a80", of: "robe", ac: "#9fb6ff", bd: "full", bc: "#f2f6ff", it: "none", w: 1.08, h: 1.08 },
  lampion:   { skin: "c", hair: "#2a1a10", hs: "short", ht: "cap", ho: "#8a4a10", of: "vest", ac: "#ffb347", it: "lantern", w: 1, h: .98 },
  quill:     { skin: "e", hair: "#b8b0a0", hs: "bald", ht: "none", ho: "#4a443a", of: "robe", ac: "#d8d0c0", bd: "mustache", bc: "#c8c0b0", gl: "round", it: "feder", w: .96, h: 1.02 },
  hortensia: { skin: "d", hair: "#2a6a3a", hs: "twin", ht: "floppy", ho: "#2a6a3a", of: "apron", ac: "#7fd68a", it: "pack", w: 1.02 },
  phiolus:   { skin: "a", hair: "#e8f0f0", hs: "tuft", ht: "goggles", ho: "#2a6a78", of: "apron", ac: "#a0e0e8", bd: "full", bc: "#d0e0e0", w: 1.06, h: .96 },
  nummer7:   { skin: "e", hair: "#4a4a58", hs: "short", ht: "beanie", ho: "#3a3f58", of: "tunic", ac: "#9a9fb8", it: "none", w: .92, h: 1 },
  spiegelich: { skin: "a", hair: "#7a4a24", hs: "braid", ht: "band", ho: "#5a6a9a", of: "tunic", ac: "#dff0ff", it: "feder", w: 1 },
  sidera:    { skin: "c", hair: "#1e1a3a", hs: "pony", ht: "star", ho: "#2a3a9a", of: "cloak", ac: "#9fb6ff", it: "scope", w: .94, h: 1 },
  tickel:    { skin: "b", hair: "#6a4a2a", hs: "curly", ht: "goggles", ho: "#5a3a10", of: "vest", ac: "#d8a850", gl: "round", it: "pick", w: 1.08, h: .94 },
  umbra:     { skin: "e", hair: "#201838", hs: "long", ht: "hood", ho: "#201838", of: "cloak", ac: "#7a6aa8", it: "none", w: .96, h: 1.04 },
  fiola:     { skin: "a", hair: "#ff9ee0", hs: "twin", ht: "moon", ho: "#8a2a68", of: "dress", ac: "#ffe27a", it: "none", w: .78, h: .78 },
  pergus:    { skin: "b", hair: "#c8b890", hs: "wavy", ht: "none", ho: "#4a3018", of: "robe", ac: "#c9a070", bd: "full", bc: "#c8b890", gl: "round", it: "satchel", w: 1.12, h: .96 }
});
Object.assign(POSES, {
  wisperlie: { p: "hum" }, kolba: { p: "read", seat: "crate" }, merula: { p: "read", seat: "ground" }, orrerius: { p: "scope" }, schweiger: { p: "sit", seat: "ground" },
  lampion: { p: "work", dir: 1 }, quill: { p: "read", seat: "stump" }, hortensia: { p: "work", dir: -1 }, phiolus: { p: "work", dir: 1 }, nummer7: { p: "sit", seat: "ground" },
  spiegelich: { p: "wave" }, sidera: { p: "scope" }, tickel: { p: "work", dir: -1 }, umbra: { p: "look" }, fiola: { p: "dance" }, pergus: { p: "read", seat: "crate" }
});
/* Platzierung: die gewünschte Kachel wird auf den nächsten freien, begehbaren Boden gelegt (Nachbarn müssen frei sein) */
(function placeNpcs5() {
  const free = (L, x, y) => { if (!L.T[y] || L.T[y][x] !== 1 || L.res.has(x + "," + y)) return false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const v = L.T[y + dy] && L.T[y + dy][x + dx]; if (v !== 1 && v !== 2) return false; } return true; };
  for (const id in NPCS) { const n = NPCS[id]; if (n.area !== 5 || !n.l || !LAYERS[n.l]) continue; const L = LAYERS[n.l]; let best = null, bd = 1e9;
    for (let r = 0; r <= 14 && !best; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = n.x + dx, y = n.y + dy; if (!free(L, x, y)) continue; const d = Math.hypot(dx, dy); if (d < bd) { bd = d; best = [x, y]; } }
    if (best) { n.x = best[0]; n.y = best[1]; } else console.warn("NPC ohne Platz:", id); }
})();
