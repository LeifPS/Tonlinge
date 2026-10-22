/* ===== TOTEMS: seltene Totem-Tonlinge, die man fängt und später benutzt, um das Wetter (oder die Tageszeit) für ALLE Spieler zu setzen ===== */
RAR.push({ id: "t", name: "Totem", col: "#c8884a", col2: "#ffd45a", w: 0, xp: 0, val: 0 });
const TOTEM_R = 7, TOTEM_VIEW = {};
/* Für Vergleiche im Fangablauf verhält sich ein Totem wie Fabelhaft (keine Bannkreise, kein Aufbäumen) */
const rg = r => r === TOTEM_R ? 4 : r;
/* spd = Tempo (je seltener, desto schneller), w = Gewicht beim Auswürfeln, body/capc = Farben */
const TOTEM_DEF = {
  klar:      { n: "Klartotem",          spd: 2.3, w: 12, body: "#f3d878", capc: "#ffb02e" },
  bewoelkt:  { n: "Wolkentotem",        spd: 2.3, w: 12, body: "#cfd6e2", capc: "#8896ae" },
  wind:      { n: "Windtotem",          spd: 2.4, w: 12, body: "#bfe6ee", capc: "#5fb4cc" },
  regen:     { n: "Regentotem",         spd: 2.4, w: 12, body: "#a9c4ec", capc: "#3a78d0" },
  nebel:     { n: "Nebeltotem",         spd: 2.5, w: 10, body: "#d6dde4", capc: "#8a98a8" },
  sturm:     { n: "Sturmtotem",         spd: 2.7, w: 9,  body: "#8a98cc", capc: "#ffe94a" },
  schnee:    { n: "Schneetotem",        spd: 2.6, w: 9,  body: "#eef5ff", capc: "#7ab8f0" },
  hitze:     { n: "Sonnenglut-Totem",   spd: 3.1, w: 4,  body: "#ffb85a", capc: "#e0501a" },
  regenbogen:{ n: "Regenbogentotem",    spd: 4.4, w: 1,  body: "#ffd0ec", capc: "#c05cff" },
  aurora:    { n: "Aurora-Totem",       spd: 3.8, w: 1.6, body: "#9af0cc", capc: "#7a5cff" },
  frostmond: { n: "Frostmond-Totem",    spd: 3.5, w: 1.2, body: "#c4e6ff", capc: "#3a6fd0" },
  sternschnuppen: { n: "Sternschnuppen-Totem", spd: 3.7, w: 1, body: "#fff0a0", capc: "#e8a010" },
  blutmond:  { n: "Blutmond-Totem",     spd: 4.2, w: .5, body: "#e8606c", capc: "#7a0e1c" },
  sun:       { n: "Sonnentotem",        spd: 3.3, w: 5,  body: "#ffe27a", capc: "#ff8a2a" }
};
const TOTEM_IDS = Object.keys(TOTEM_DEF);
TOTEM_IDS.forEach((k, i) => { const d = TOTEM_DEF[k], rare = k === "sun" ? 3 : (typeof wxRare === "function" && wxRare(k) ? 3 : 1);
  const sp = { id: "tot_" + k, n: d.n, r: TOTEM_R, a: 0, z: [], t: "b", hz: [96 + i * 6, 114 + i * 6], spd: d.spd, xp: Math.round(900 * Math.pow(d.spd / 2.3, 2.2) / 10) * 10, val: Math.round(2500 * Math.pow(d.spd / 2.3, 2.8) / 100) * 100, fill: .5, body: d.body, capc: d.capc, x: "glow", tot: k, tw: d.w };
  SPECIES.push(sp); SP[sp.id] = sp; });
/* Gewicht eines Totems beim Auswürfeln, Chance pro Wurf insgesamt (mit Glück etwas besser, erst ab 10 Fängen) */
function totemRoll() {
  if (typeof S === "undefined" || S.stats.catches < 10) return null;
  const L = typeof luckNow === "function" ? luckNow() : 0; if (Math.random() >= (1 / 1600) * (1 + L * 1.2)) return null;
  const l = SPECIES.filter(s => s.tot), tot = l.reduce((a, s) => a + s.tw, 0); let r = Math.random() * tot; for (const s of l) { r -= s.tw; if (r <= 0) return s; } return l[0];
}
