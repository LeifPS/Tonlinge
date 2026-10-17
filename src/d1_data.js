/* ===== DATEN 1: Konstanten, Seltenheiten, Mutationen, Tonlinge, Instrumente =====
   Alle Zahlen zum Balancing stehen hier oben, nicht im Spielcode. */
const TS = 32;
const WW = 80, WH = 112;                 // Welt in Kacheln: Bereich 1 oben, Bereich 2 unten
const KEY = "tonlinge-v1";
const DAY_LEN = 300;                     // Sekunden pro Spieltag
const AREA_SPLIT = 56;                   // ab dieser Zeile beginnt Bereich 2

const RAR = [
  { id: "c", name: "Gewöhnlich",   col: "#9aa3b2", w: 60,  xp: 14,  val: 5 },
  { id: "u", name: "Ungewöhnlich", col: "#5fc06b", w: 25,  xp: 30,  val: 18 },
  { id: "r", name: "Selten",       col: "#4a8fe8", w: 11,  xp: 75,  val: 60 },
  { id: "p", name: "Prächtig",     col: "#a066e0", w: 3.2, xp: 190, val: 240 },
  { id: "f", name: "Fabelhaft",    col: "#f2c230", w: 0.8, xp: 520, val: 900 }
];
const MUTS = [
  { id: "glas",   name: "Gläsern",   mul: 1.6, p: 0.040, col: "#bfe8ff" },
  { id: "funkel", name: "Funkelnd",  mul: 2.6, p: 0.012, col: "#ffe08a" },
  { id: "stern",  name: "Sternklar", mul: 5.0, p: 0.003, col: "#d9b8ff" }
];
const AREAS = {
  1: { name: "Klanghain",      xpMul: 1,   valMul: 1 },
  2: { name: "Glimmerhöhlen",  xpMul: 2.6, valMul: 3.2 }
};

/* ----- Level und Erfahrung ----- */
const xpNeed = L => Math.round(80 + 40 * Math.pow(L, 1.6));

/* ----- Tonlinge: Seltenheit, Bereich, Orte, Tageszeit (d/n/b), Hz-Bereich, Tempo, Aussehen -----
   Aussehen: body = Körperfarbe, cap = Kappenform, capc = Kappenfarbe, mark = Muster, x = Extra */
const SPECIES = [
  // Bereich 1: Klanghain
  { id: "tupfel",   n: "Tupfel",     r: 0, a: 1, z: ["wiese", "dorf"],            t: "b", hz: [18, 32],  spd: 0.80, body: "#efe3c8", cap: "dome",     capc: "#d98b5f", mark: "spots" },
  { id: "moospel",  n: "Moospel",    r: 0, a: 1, z: ["wald", "teich"],            t: "b", hz: [20, 34],  spd: 0.85, body: "#dfe8c9", cap: "flat",     capc: "#6fae5c", mark: "fringe" },
  { id: "gloeckli", n: "Glöckli",    r: 0, a: 1, z: ["wiese", "wind"],            t: "b", hz: [24, 40],  spd: 0.90, body: "#f2e9d8", cap: "bell",     capc: "#e8c35a" },
  { id: "wippa",    n: "Wippa",      r: 0, a: 1, z: ["dorf", "wiese"],            t: "b", hz: [22, 36],  spd: 1.00, body: "#e5e0f0", cap: "leafs",    capc: "#8cc86b" },
  { id: "brummel",  n: "Brummel",    r: 1, a: 1, z: ["wiese", "wind", "dorf"],    t: "d", hz: [30, 48],  spd: 1.05, body: "#f5e6a0", cap: "dome",     capc: "#e0a52a", mark: "stripes" },
  { id: "nebeline", n: "Nebeline",   r: 1, a: 1, z: ["teich", "wald"],            t: "b", hz: [28, 46],  spd: 1.00, body: "#dde3ea", cap: "umbrella", capc: "#aab5c4" },
  { id: "kraeusel", n: "Kräuselin",  r: 1, a: 1, z: ["wald", "wiese"],            t: "b", hz: [34, 52],  spd: 1.10, body: "#eadff5", cap: "spiral",   capc: "#c79adf" },
  { id: "tautropf", n: "Tautropf",   r: 2, a: 1, z: ["teich"],                    t: "b", hz: [45, 65],  spd: 1.20, body: "#d4ecf7", cap: "drop",     capc: "#4a9fe0" },
  { id: "laternli", n: "Laternli",   r: 2, a: 1, z: ["wald", "wind"],             t: "n", hz: [50, 70],  spd: 1.25, body: "#f6e8c0", cap: "lantern",  capc: "#ffb84a", x: "glow" },
  { id: "windspiel",n: "Windspiel",  r: 3, a: 1, z: ["wind"],                     t: "b", hz: [58, 78],  spd: 1.35, body: "#efe6ff", cap: "bell",     capc: "#b57cf0", x: "chimes" },
  { id: "mondschirm",n:"Mondschirm", r: 3, a: 1, z: ["teich", "wald"],            t: "n", hz: [62, 82],  spd: 1.40, body: "#e6e2ff", cap: "umbrella", capc: "#8a63d9", x: "glow" },
  { id: "goldkrone",n: "Goldkrone",  r: 4, a: 1, z: ["dorf", "wind", "teich", "wald", "wiese"], t: "b", hz: [72, 92], spd: 1.55, body: "#fff3c4", cap: "crown", capc: "#f2c230", x: "glow" },
  // Bereich 2: Glimmerhöhlen
  { id: "kiesel",   n: "Kiesel",     r: 0, a: 2, z: ["saal", "tropf", "eingang"], t: "b", hz: [92, 103],  spd: 0.95, body: "#cfd3dc", capc: "#7fb36a" },
  { id: "tropfi",   n: "Tropfwurm",     r: 0, a: 2, z: ["tropf", "becken"],          t: "b", hz: [94, 106], spd: 1.00, body: "#cfeadf", capc: "#4fa3a8" },
  { id: "funzel",   n: "Funzel",     r: 0, a: 2, z: ["eingang", "saal"],          t: "b", hz: [96, 108], spd: 1.05, body: "#d9d3e2", capc: "#7c6aa8" },
  { id: "schlurf",  n: "Schlurf",    r: 0, a: 2, z: ["pilz", "becken"],           t: "b", hz: [99, 110], spd: 1.10, body: "#e9dcc4", capc: "#7a4a8a" },
  { id: "glimmling",n: "Glimmling",  r: 1, a: 2, z: ["saal"],                     t: "b", hz: [106, 117],spd: 1.20, body: "#e2d8cc", capc: "#78b4ee" },
  { id: "echolot",  n: "Echolot",    r: 1, a: 2, z: ["tropf", "eingang"],         t: "b", hz: [108, 119],spd: 1.25, body: "#ece6ff", capc: "#8f86d0" },
  { id: "stalagnuss",n:"Stalagnuss", r: 1, a: 2, z: ["pilz", "tropf"],            t: "b", hz: [110, 121],spd: 1.30, body: "#efe1c8", capc: "#9a7a56" },
  { id: "kristallo",n: "Kristallo",  r: 2, a: 2, z: ["saal"],                     t: "b", hz: [117, 128],spd: 1.40, body: "#cfe9ff", capc: "#2f8fe8" },
  { id: "dunkelwisp",n:"Dunkelwisp", r: 2, a: 2, z: ["becken", "pilz"],           t: "n", hz: [119, 130],spd: 1.45, body: "#aab4e0", capc: "#4a56c8", x: "glow" },
  { id: "hallsaenger",n:"Hallsänger",r: 3, a: 2, z: ["becken", "saal"],           t: "b", hz: [126, 139],spd: 1.55, body: "#ffd9e6", capc: "#a066e0" },
  { id: "amethyst", n: "Amethystling",r:3, a: 2, z: ["pilz", "saal"],             t: "b", hz: [128, 142],spd: 1.60, body: "#d8d0c0", capc: "#a066e0", x: "glow" },
  { id: "sonnenkern",n:"Sonnenkern", r: 4, a: 2, z: ["becken"],                   t: "b", hz: [139, 150],spd: 1.75, body: "#fff3c4", capc: "#ff9a2a", x: "glow" }
];
const SP = Object.fromEntries(SPECIES.map(s => [s.id, s]));

/* ----- Instrumente. prec/harm/luck in Prozent, res = höchste Frequenz in Hz.
   pas = besondere Fähigkeit: note (alle paar Sekunden eine Note, die +5 % Fortschritt gibt),
   moment (Fortschritt wird schneller, solange der Tonling in der Zone ist, bis +10 %), mut (mehr Mutationen) ----- */
const INSTR = {
  holz:    { name: "Holzflöte",           kind: "flute",  prec: 2,  harm: 0,  luck: 0,  res: 45,  info: "Ein einfaches Übungsstück von Tilda." },
  schilf:  { name: "Schilfpfeife",        kind: "flute",  prec: 4,  harm: 3,  luck: 3,  res: 52,  info: "Von Okko aus Teichschilf geschnitzt." },
  laute:   { name: "Kiefernlaute",        kind: "lute",   prec: 6,  harm: 5,  luck: 5,  res: 62,  info: "Gibt es bei Marlo. Klingt warm und weich." },
  schelle: { name: "Schellentrommel",     kind: "tamb",   prec: 10, harm: 8,  luck: 8,  res: 96,  info: "Ysas Meisterstück für Leute mit gutem Takt." },
  harfe:   { name: "Moosharfe",           kind: "harp",   prec: 14, harm: 16, luck: 14, res: 106, info: "Uralt und leise, hört auf besondere Lieder.", pas: "mut" },
  geige:   { name: "Glimmergeige",        kind: "violin", prec: 18, harm: 22, luck: 20, res: 126, info: "Kerrin baut sie aus Höhlenholz.", pas: "note" },
  urgabel: { name: "Urgabel",             kind: "fork",   prec: 30, harm: 40, luck: 40, res: 168, info: "Der erste Ton des Urlieds, in Metall gefasst.", pas: "ur" },
  glocken: { name: "Tropfenglockenspiel", kind: "bells",  prec: 22, harm: 28, luck: 28, res: 146, info: "Jeder Ton fällt wie ein Tropfen.", pas: "moment" }
};
const PAS_TXT = {
  note:   "Alle 4 Sekunden bildet sich eine Note. Wird sie in der Zone eingesammelt: +5 % Fortschritt.",
  moment: "Solange der Tonling in der Zone ist, wird der Fortschritt immer schneller, bis zu +10 %.",
  mut:    "Mehr Mutationen: Mutationschance ×1,5.",
  ur:     "Der Fortschritt sinkt nur halb so schnell, wenn der Tonling außerhalb der Zone ist."
};
