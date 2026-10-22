/* ===== WETTER: für alle Spieler gleich (aus der Weltzeit und einem festen Seed), mit Optik, Boni, Vorlieben und Mutationen =====
   Jeder Tag und jede Nacht ist ein Abschnitt (Tag 6 bis 20 Uhr, Nacht 20 bis 6 Uhr). Pro Abschnitt gibt es genau ein Wetter.
   freq = Gewicht in Prozent. Wetter mit höchstens 5 % pro Abschnitt gelten als selten: Totems können sie nicht überspringen oder ändern. */
const WX_SEED = 7121;
const WX_RARE_MAX = 5;
/* part: d = nur Tag, n = nur Nacht, b = beide. fd / fn = Gewicht am Tag / in der Nacht.
   mut = { Mutation: Chance pro Fang }, add = Wert-Boni, spd = Tempo aller Tonlinge, like / hate = Tonlinge mit besserem / schlechterem Spawn */
const WX = {
  klar:      { name: "Klar",        fd: 31, fn: 28, tag: "Häufig",       col: "#ffd45a", d: "Kein besonderer Effekt." , like: [], hate: [] },
  bewoelkt:  { name: "Bewölkt",     fd: 16, fn: 14, tag: "Häufig",       col: "#b8c2d4", d: "Ruhige Tonlinge: +5 Harmonie.", add: { harm: 5 }, like: ["nebeline", "wolkli", "pustel", "wolkenwal"], hate: ["blitzling"] },
  wind:      { name: "Wind",        fd: 10, fn: 10, tag: "Mittel",       col: "#9fd6e8", d: "+6 Takt, Tonlinge sind etwas flinker (+0,1 Tempo).", add: { beat: 6 }, spd: .1, like: ["gloeckli", "windspiel", "zirpel", "wolkli", "schnuppi"], hate: ["tangel", "muschling"] },
  regen:     { name: "Regen",       fd: 16, fn: 14, tag: "Mittel",       col: "#5a9ae0", d: "+6 Harmonie. Wasserfreunde erscheinen öfter.", add: { harm: 6 }, like: ["tautropf", "moospel", "tangel", "blubbi", "quallo", "muschling"], hate: ["brummel", "sandling", "lichtfuchs"] },
  nebel:     { name: "Nebel",       fd: 9,  fn: 10, tag: "Mittelhäufig", col: "#c9d3dc", d: "Kurze Sicht. +10 Glück, −6 Justierung. Nebelhafte Mutation (3 %).", add: { luck: 10, ear: -6 }, mut: { nebel: .03 }, like: ["nebeline", "kraeusel", "geisterkrake", "wrackwurm", "tiefenlicht", "mondling"], hate: ["goldkrone", "blitzling"] },
  sturm:     { name: "Sturm",       fd: 7,  fn: 8,  tag: "Mittel",       col: "#6b7bb8", d: "Elektrisch (10 %), +0,5 Tempo für alle Tonlinge, +8 Takt.", add: { beat: 8 }, spd: .5, mut: { elec: .10 }, like: ["blitzling", "lichtfuchs", "karminstern", "wolkenwal", "zirpel"], hate: ["tupfel", "moospel", "tautropf"] },
  schnee:    { name: "Schneefall",  fd: 6,  fn: 6,  tag: "Mittel",       col: "#e8f2ff", d: "Gefroren (3 %). −8 Takt, ruhige Tonlinge (−0,1 Tempo).", add: { beat: -8 }, spd: -.1, mut: { gefror: .03 }, like: ["wippa", "kraeusel", "pustel", "seestern", "muschling"], hate: ["brummel", "sandling", "krabbel"] },
  hitze:     { name: "Sonnenglut",  fd: 4.5, fn: 0, tag: "Selten",       col: "#ff9a3c", d: "Sonnig (4 %). +15 Glück, +0,2 Tempo.", add: { luck: 15 }, spd: .2, mut: { sonnig: .04 }, like: ["brummel", "sandling", "krabbel", "goldkrone", "abgrundsonne"], hate: ["nebeline", "tautropf", "wolkenwal"] },
  regenbogen:{ name: "Regenbogen",  fd: 1.5, fn: 0, tag: "Sehr selten",  col: "#ff7ac8", d: "Regenbogen (10 %). +100 Glück.", add: { luck: 100 }, mut: { regenb: .10 }, like: ["goldkrone", "tautropf", "laternli", "perlchen", "weltenstern"], hate: [] },
  aurora:    { name: "Aurora",      fd: 0,  fn: 4,  tag: "Selten",       col: "#5fe8b0", d: "Aurora (5 %). +60 Glück.", add: { luck: 60 }, mut: { aurora: .05 }, like: ["aurorella", "kometarius", "weltenstern", "nachtkauz", "mondling"], hate: [] },
  frostmond: { name: "Frostmond",   fd: 0,  fn: 3,  tag: "Selten",       col: "#9fd8ff", d: "Gefroren (5 %), Frostnova (3 %). +20 Glück, −20 Harmonie.", add: { luck: 20, harm: -20 }, mut: { gefror: .05, frostnova: .03 }, like: ["seestern", "pustel", "mondling", "mondschirm", "urperle"], hate: ["brummel", "sandling"] },
  sternschnuppen:{ name: "Sternschnuppen", fd: 0, fn: 2, tag: "Selten",   col: "#fff0a0", d: "Sternklare Mutationen sind 4 % häufig. +30 Glück.", add: { luck: 30 }, mut: { stern: .04 }, like: ["kometarius", "schnuppi", "mondschirm", "aurorella", "weltenstern"], hate: [] },
  blutmond:  { name: "Blutmond",    fd: 0,  fn: 1,  tag: "Sehr selten",  col: "#d8283c", d: "Blutrot (6 %). +45 Glück, +0,4 Tempo, −25 Harmonie.", add: { luck: 45, harm: -25 }, spd: .4, mut: { blut: .06 }, like: ["geisterkrake", "abgrundsonne", "tiefsee", "karminstern", "wrackwurm"], hate: ["tupfel", "gloeckli"] }
};
const WX_IDS = Object.keys(WX);
const wxPool = night => { const k = night ? "fn" : "fd"; return WX_IDS.filter(i => WX[i][k] > 0).map(i => [i, WX[i][k]]); };
const wxRare = id => !!WX[id] && Math.min(WX[id].fd || 99, WX[id].fn || 99) <= WX_RARE_MAX;
const wxHash = n => { let h = (n * 2654435761 + WX_SEED * 40503) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13; h = Math.imul(h, 3266489917) >>> 0; h ^= h >>> 16; return (h >>> 0) / 4294967296; };
/* Abschnitt zu einer Weltzeit t (Sekunden): { k, night, start, end } */
function wxSlot(t) {
  const u = t - DAY_LEN * 6 / 24, di = Math.floor(u / DAY_LEN), r = u - di * DAY_LEN, dayLen = DAY_LEN * 14 / 24;
  const night = r >= dayLen, start = DAY_LEN * 6 / 24 + di * DAY_LEN + (night ? dayLen : 0);
  return { k: di * 2 + (night ? 1 : 0), night, start, end: start + (night ? DAY_LEN - dayLen : dayLen) };
}
function wxOf(k, night) { const pool = wxPool(night); const tot = pool.reduce((a, p) => a + p[1], 0); let r = wxHash(k + 1) * tot; for (const [id, w] of pool) { r -= w; if (r <= 0) return id; } return pool[0][0]; }
