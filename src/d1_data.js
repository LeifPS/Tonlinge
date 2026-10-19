/* ===== DATEN 1: Konstanten, Seltenheiten, Mutationen, Tonlinge, Instrumente =====
   Alle Zahlen zum Balancing stehen hier oben, nicht im Spielcode. */
const TS = 32;
const SW = 80, SH = 224;             // Rohform (Streifen), wird zur U-Form gefaltet
const WW = 160, WH = 116;                 // Welt in Kacheln: Bereich 1 oben, Bereich 2 Mitte, Bereich 3 unten
const KEY = "tonlinge-v1";
const DAY_LEN = 300;                     // Sekunden pro Spieltag
const AREA_SPLIT = 56;                   // ab dieser Zeile beginnt Bereich 2
const AREA_SPLIT3 = 112;                 // ab dieser Zeile beginnt Bereich 3
const AREA_SPLIT4 = 168;                 // ab dieser Zeile beginnt Bereich 4 (Rauschmeer)
const areaOfY = y => y < AREA_SPLIT ? 1 : y < AREA_SPLIT3 ? 2 : y < AREA_SPLIT4 ? 3 : 4;

const RAR = [
  { id: "c", name: "Gewöhnlich",   col: "#9aa3b2", w: 60,  xp: 14,  val: 5 },
  { id: "u", name: "Ungewöhnlich", col: "#5fc06b", w: 25,  xp: 30,  val: 18 },
  { id: "r", name: "Selten",       col: "#4a8fe8", w: 11,  xp: 75,  val: 60 },
  { id: "p", name: "Prächtig",     col: "#a066e0", w: 3.2, xp: 190, val: 240 },
  { id: "f", name: "Fabelhaft",    col: "#f2c230", w: 0.8, xp: 520, val: 900 },
  { id: "g", name: "Glorreich",    col: "#e0303c", w: 0.14, xp: 1600, val: 4200 }
];
const MUTS = [
  { id: "moos",   name: "Bemoost",   adj: "Bemooster", mul: 2.0, p: 0, col: "#8cc86b", dk: "#4f9a2a" }, // nur durch die Moosharfe
  { id: "glas",   name: "Gläsern", adj: "Gläserner",   mul: 1.6, p: 0.040, col: "#bfe8ff", dk: "#3a9fd0" },
  { id: "funkel", name: "Funkelnd", adj: "Funkelnder", mul: 2.6, p: 0.012, col: "#ffe08a", dk: "#d19a0a" },
  { id: "stern",  name: "Sternklar", adj: "Sternklarer", mul: 5.0, p: 0.003, col: "#d9b8ff", dk: "#8a4fd0" },
  // Eigene Mutationen einzelner Instrumente: ins = Instrument, ip = Chance pro Fang, nur mit diesem Instrument
  { id: "klirr",  name: "Klirrend",  adj: "Klirrender",  mul: 1.8, p: 0, ins: "schelle", ip: 0.33, col: "#f4c04a", dk: "#c47a14" },
  { id: "beto",   name: "Betörend",  adj: "Betörender",  mul: 2.4, p: 0, ins: "geige",   ip: 0.30, col: "#f0a0c8", dk: "#c0407f" },
  { id: "urton",  name: "Urtönend",  adj: "Urtönender",  mul: 4.5, p: 0, ins: "urgabel", ip: 0.20, col: "#9fd6f0", dk: "#2f7ea8" },
  { id: "elec",   name: "Elektrisch", adj: "Elektrischer", mul: 2.0, p: 0, ins: "egitarre", ip: 0.20, col: "#ffe94a", dk: "#b88c00" }
];
const AREAS = {
  1: { name: "Klanghain",      xpMul: 1,   valMul: 1 },
  2: { name: "Glimmerhöhlen",  xpMul: 2.6, valMul: 3.2 },
  3: { name: "Sternenhöhe",    xpMul: 3.2, valMul: 7, rm: { 2: 0.65, 3: 0.5, 4: 0.45 }, wild: 1.12 }, // rm: Seltenheit-Faktor für die Spawn-Chance, wild: Tempo/Härte der Tonlinge
  4: { name: "Rauschmeer",     xpMul: 18,  valMul: 28 }
};

/* ----- Level und Erfahrung ----- */
/* VERÖFFENTLICHUNG: wie viele Bereiche sind offen? 2 = nur Klanghain + Glimmerhöhlen. Auf 3 oder 4 setzen und neu bauen:
   die Tore (Sterntor, Muscheltor) öffnen sich dann von selbst für alle, die sie schon verdient haben. */
const RELEASE = { areas: 3 };
const xpNeed = L => Math.round((80 + 40 * Math.pow(L, 1.6)) * 1.2);

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
  { id: "kiesel",   n: "Kiesel",     r: 0, a: 2, z: ["saal", "tropf", "eingang"], t: "b", hz: [86, 97],  spd: 0.95, body: "#cfd3dc", capc: "#7fb36a" },
  { id: "tropfi",   n: "Tropfwurm",     r: 0, a: 2, z: ["tropf", "becken"],          t: "b", hz: [88, 99], spd: 1.00, body: "#cfeadf", capc: "#4fa3a8" },
  { id: "funzel",   n: "Funzel",     r: 0, a: 2, z: ["eingang", "saal"],          t: "b", hz: [90, 101], spd: 1.05, body: "#d9d3e2", capc: "#7c6aa8" },
  { id: "schlurf",  n: "Schlurf",    r: 0, a: 2, z: ["pilz", "becken"],           t: "b", hz: [92, 103], spd: 1.10, body: "#e9dcc4", capc: "#7a4a8a" },
  { id: "glimmling",n: "Glimmling",  r: 1, a: 2, z: ["saal"],                     t: "b", hz: [90, 102],spd: 1.20, body: "#e2d8cc", capc: "#78b4ee" },
  { id: "echolot",  n: "Echolot",    r: 1, a: 2, z: ["tropf", "eingang"],         t: "b", hz: [92, 104],spd: 1.25, body: "#ece6ff", capc: "#8f86d0" },
  { id: "stalagnuss",n:"Stalagnuss", r: 1, a: 2, z: ["pilz", "tropf"],            t: "b", hz: [95, 107],spd: 1.30, body: "#efe1c8", capc: "#9a7a56" },
  { id: "kristallo",n: "Kristallo",  r: 2, a: 2, z: ["saal"],                     t: "b", hz: [108, 119],spd: 1.40, body: "#cfe9ff", capc: "#2f8fe8" },
  { id: "dunkelwisp",n:"Dunkelwisp", r: 2, a: 2, z: ["becken", "pilz"],           t: "n", hz: [110, 121],spd: 1.45, body: "#aab4e0", capc: "#4a56c8", x: "glow" },
  { id: "hallsaenger",n:"Hallsänger",r: 3, a: 2, z: ["becken", "saal"],           t: "b", hz: [118, 130],spd: 1.55, body: "#ffd9e6", capc: "#a066e0" },
  { id: "amethyst", n: "Amethystling",r:3, a: 2, z: ["pilz", "saal"],             t: "b", hz: [120, 133],spd: 1.60, body: "#d8d0c0", capc: "#a066e0", x: "glow" },
  { id: "sonnenkern",n:"Sonnenkern", r: 4, a: 2, z: ["becken"],                   t: "b", hz: [136, 148],spd: 1.75, body: "#fff3c4", capc: "#ff9a2a", x: "glow" },
  // Bereich 3: Sternenhöhe
  { id: "wolkli",   n: "Wölkli",       r: 0, a: 3, z: ["wolke", "sternwarte"],              t: "b", hz: [118, 130], spd: 1.15, body: "#f4f7ff", capc: "#9fc4ee" },
  { id: "pustel",   n: "Pustel",       r: 0, a: 3, z: ["wolke", "mondsee"],                 t: "b", hz: [120, 132], spd: 1.20, body: "#fff6d8", capc: "#e8c46a" },
  { id: "zirpel",   n: "Zirpel",       r: 0, a: 3, z: ["sternwarte", "gewitter"],           t: "b", hz: [122, 134], spd: 1.25, body: "#f0d8b4", capc: "#c9763c" },
  { id: "schnuppi", n: "Schnuppi",     r: 0, a: 3, z: ["wolke", "sternwarte", "nordlicht"], t: "b", hz: [124, 136], spd: 1.30, body: "#ffe9a0", capc: "#f0a830" },
  { id: "nachtkauz",n: "Nachtkauz",    r: 1, a: 3, z: ["sternwarte", "mondsee"],            t: "n", hz: [132, 144], spd: 1.40, body: "#cdbfa8", capc: "#6a5a8a" },
  { id: "mondling", n: "Mondling",     r: 1, a: 3, z: ["mondsee", "nordlicht"],             t: "n", hz: [134, 146], spd: 1.45, body: "#f3efd2", capc: "#d9cf8a" },
  { id: "wolkenwal",n: "Wolkenwal",    r: 1, a: 3, z: ["wolke", "gewitter"],                t: "b", hz: [136, 148], spd: 1.50, body: "#bcd4f2", capc: "#6f94cf" },
  { id: "blitzling",n: "Blitzling",    r: 2, a: 3, z: ["gewitter"],                         t: "b", hz: [150, 162], spd: 1.65, body: "#fff2a0", capc: "#e8b820" },
  { id: "lichtfuchs",n:"Lichtfuchs",   r: 2, a: 3, z: ["nordlicht", "mondsee"],             t: "b", hz: [152, 165], spd: 1.70, body: "#f6dcc0", capc: "#4fd6a8" },
  { id: "aurorella",n: "Aurorella",    r: 3, a: 3, z: ["nordlicht"],                        t: "n", hz: [166, 180], spd: 1.85, body: "#d8f4ee", capc: "#a066e0", x: "glow" },
  { id: "kometarius",n:"Kometarius",   r: 3, a: 3, z: ["gewitter", "nordlicht"],            t: "b", hz: [168, 183], spd: 1.90, body: "#dfe8ff", capc: "#58b0f0", x: "glow" },
  { id: "weltenstern",n:"Weltenstern", r: 4, a: 3, z: ["nordlicht"],                        t: "b", hz: [195, 210], spd: 2.10, body: "#fff0c0", capc: "#b06af0", x: "glow" },
  // Bereich 4: Rauschmeer
  { id: "muschling",  n: "Muschling",   r: 0, a: 4, z: ["strand", "gezeit"],            t: "b", hz: [218, 232], spd: 1.30, body: "#fbeee0", cap: "flat",     capc: "#f0a8b8", mark: "spots" },
  { id: "sandling",   n: "Sandling",    r: 0, a: 4, z: ["strand", "koralle", "wrack"],            t: "b", hz: [220, 234], spd: 1.35, body: "#f2dfb4", cap: "dome",     capc: "#d9b070", mark: "stripes" },
  { id: "tangel",     n: "Tangel",      r: 0, a: 4, z: ["koralle", "wrack"],             t: "b", hz: [222, 236], spd: 1.40, body: "#cfe8c4", cap: "leafs",    capc: "#3f9a62", mark: "fringe" },
  { id: "blubbi",     n: "Blubbi",      r: 0, a: 4, z: ["gezeit", "tiefe", "strand"],    t: "b", hz: [224, 238], spd: 1.45, body: "#d4ecf7", cap: "drop",     capc: "#58b6e8" },
  { id: "krabbel",    n: "Krabbel",     r: 1, a: 4, z: ["strand", "gezeit", "wrack"],             t: "b", hz: [232, 248], spd: 1.55, body: "#f6c9b0", cap: "helm",     capc: "#e0674a" },
  { id: "seestern",   n: "Sternfüßler", r: 1, a: 4, z: ["koralle", "strand", "tiefe"],            t: "b", hz: [234, 250], spd: 1.60, body: "#ffd9c0", cap: "crown",    capc: "#f08a4a" },
  { id: "wrackwurm",  n: "Wrackwurm",   r: 1, a: 4, z: ["wrack", "tiefe"],               t: "n", hz: [236, 252], spd: 1.65, body: "#c9bfa4", cap: "bell",     capc: "#7a6a54" },
  { id: "quallo",     n: "Quallo",      r: 2, a: 4, z: ["gezeit", "koralle", "tiefe"],            t: "b", hz: [252, 270], spd: 1.80, body: "#e6dcff", cap: "umbrella", capc: "#b08ae8", x: "glow" },
  { id: "korallo",    n: "Korallo",     r: 2, a: 4, z: ["koralle"],                      t: "b", hz: [254, 272], spd: 1.85, body: "#ffe0d8", cap: "crystal",  capc: "#ee6a7a" },
  { id: "tiefenlicht",n: "Tiefenlicht", r: 2, a: 4, z: ["tiefe", "wrack"],               t: "n", hz: [256, 274], spd: 1.90, body: "#bfe0ff", cap: "lantern",  capc: "#38d0e0", x: "glow" },
  { id: "perlchen",   n: "Perlchen",    r: 3, a: 4, z: ["gezeit", "strand"],             t: "b", hz: [276, 292], spd: 2.05, body: "#fff4f8", cap: "dome",     capc: "#e8d8ff", x: "glow" },
  { id: "geisterkrake",n:"Geisterkrake",r: 3, a: 4, z: ["wrack", "tiefe"],               t: "n", hz: [278, 296], spd: 2.15, body: "#d8e6ee", cap: "umbrella", capc: "#6a86b0", x: "glow" },
  { id: "tiefsee",    n: "Tiefseekönig",r: 3, a: 4, z: ["tiefe"],                        t: "b", hz: [280, 298], spd: 2.20, body: "#a8c4e8", cap: "crown",    capc: "#3a56b8", x: "glow" },
  { id: "urperle",    n: "Urperle",     r: 4, a: 4, z: ["gezeit"],                       t: "b", hz: [305, 322], spd: 2.40, body: "#fffbea", cap: "bell",     capc: "#f6d870", x: "glow" },
  { id: "abgrundsonne",n:"Abgrundsonne",r: 4, a: 4, z: ["tiefe"],                        t: "n", hz: [310, 330], spd: 2.50, body: "#ffe4a8", cap: "crown",    capc: "#ff8a2a", x: "glow" },
  { id: "seelenmeer", n: "Seelenmeer",  r: 5, a: 4, z: ["tiefe"],                        t: "b", hz: [340, 358], spd: 2.70, body: "#ffd6da", cap: "umbrella", capc: "#e0303c", x: "glow" },
  // Glorreich (Rot): ab Bereich 3 je ein Tonling, sehr selten (keiner im Klanghain)
  { id: "karminstern",n: "Karminstern",r: 5, a: 3, z: ["gewitter"],  t: "b", hz: [212, 226], spd: 2.3, body: "#ffd6d6", cap: "cone", capc: "#e0303c", x: "glow" }
];
const SP = Object.fromEntries(SPECIES.map(s => [s.id, s]));

/* ----- Instrumente. prec/harm/luck in Prozent.
   pas = besondere Fähigkeit: note (alle paar Sekunden eine Note, die +5 % Fortschritt gibt),
   moment (Fortschritt wird schneller, solange der Tonling in der Zone ist, bis +10 %), mut (mehr Mutationen) ----- */
const INSTR = {
  holz:    { name: "Holzflöte",           kind: "flute",  prec: 2,  harm: 0,  luck: 0,   info: "Ein einfaches Übungsstück von Tilda." },
  schilf:  { name: "Schilfpfeife",        kind: "reed",  prec: 4,  harm: 3,  luck: 3,   info: "Von Okko aus Teichschilf geschnitzt." },
  laute:   { name: "Kiefernlaute",        kind: "lute",   prec: 6,  harm: 5,  luck: 5,   info: "Gibt es bei Marlo. Klingt warm und weich." },
  schelle: { name: "Schellentrommel",     kind: "tamb",   prec: 10, harm: 8,  luck: 8,   info: "Ysas Meisterstück für Leute mit gutem Takt." },
  harfe:   { name: "Moosharfe",           kind: "harp",   prec: 14, harm: 16, luck: 14, info: "Uralt und leise, hört auf besondere Lieder.", pas: "moos" },
  geige:   { name: "Glimmergeige",        kind: "violin", prec: 18, harm: 22, luck: 20, info: "Kerrin baut sie aus Höhlenholz.", pas: "note" },
  urgabel: { name: "Urgabel",             kind: "fork",   prec: 30, harm: 40, luck: 40, info: "Der erste Ton des Urlieds, in Metall gefasst.", pas: "ur" },
  wolkenhorn:   { name: "Wolkenhorn",       kind: "horn",  prec: 20, harm: 24, luck: 24, info: "Pim aus der Sternenhöhe verkauft es. Weit hörbar, aber windig.", pas: "wind" },
  klangschale:  { name: "Klangschale",       kind: "bowl",  prec: 26, harm: 32, luck: 30, info: "Gero hat sie im Gewitter gestimmt. Sie macht jeden Ton ruhiger.", pas: "ruhe" },
  sternenharfe: { name: "Sternenharfe",      kind: "sharp", prec: 34, harm: 44, luck: 44, info: "Selene spannt ihre Saiten aus Mondlicht.", pas: "stern" },
  weltenorgel:  { name: "Weltenorgel",       kind: "organ", prec: 42, harm: 54, luck: 52, info: "Die Hüterin hält sie seit dem Ende des Urlieds. Sie hört alles auf einmal.", pas: "tief" },
  rassel:       { name: "Kürbisrassel",     kind: "rattle",  info: "Marlo füllt getrocknete Kürbisse mit Kernen. Sie klappert im Takt." },
  maultrommel:  { name: "Maultrommel",      kind: "jaw",     info: "Ein kleines Eisenzünglein, das Marlo aus alten Hufeisen biegt. Es brummt freundlich." },
  steinxylo:    { name: "Steinxylophon",    kind: "xylo",    info: "Kerrin hat Klangsteine aus der Höhle auf Holz gelegt. Jeder Schlag klingt hell.", pas: "mut" },
  zither:       { name: "Glimmerzither",    kind: "zither",  info: "Kerrins feinstes Saitenspiel, mit Glimmerstaub poliert.", pas: "glimmer" },
  windspiel:    { name: "Windspiel",        kind: "chimes",  info: "Pim hängt Röhrchen an einen Ast. Der Wind spielt mit.", pas: "ruhe" },
  dudelsack:    { name: "Wolkendudelsack",  kind: "pipes",   info: "Pims Dudelsack ist mit Wolkenflaum gefüllt. Er brummt und quäkt zugleich.", pas: "ur" },
  perlpfeife:   { name: "Perlpfeife",       kind: "whistle", info: "Tarn schnitzt sie aus Perlmutt. Hell wie eine Möwe.", pas: "beute" },
  treibharfe:   { name: "Treibholzleier",   kind: "lyre",    info: "Ebbe spannt Saiten über zwei Treibholzbögen. Sie klingt nach Salz.", pas: "lehr" },
  korallenorgel:{ name: "Korallenorgel",    kind: "coral",   info: "Ebbes Meisterstück: Röhren aus lebender Koralle, die im Wind singen.", pas: "chor" },
  glocken: { name: "Tropfenglockenspiel", kind: "bells",  prec: 22, harm: 28, luck: 28, info: "Jeder Ton fällt wie ein Tropfen.", pas: "moment" },
  egitarre:     { name: "Idas E-Gitarre",   kind: "guitar",  info: "Ida hat vom Klavier zur E-Gitarre gewechselt. Sie spielt nur für sich allein, und trotzdem hört man sie bis in die letzte Kammer.", pas: "volt" },
  tonocarina:   { name: "Tonocarina",       kind: "ocarina",  info: "Rufus formt sie aus Wiesenton. Rastet Töne erstaunlich gut ein." },
  waldtrommel:  { name: "Waldtrommel",      kind: "drum",     info: "Ein Stück Hohlstamm mit Fell. Ihr Takt trägt weit." },
  kalimba:      { name: "Glimmer-Kalimba",  kind: "kalimba", info: "Gilda zupft sie am liebsten im Pilzgarten. Bringt Glück, und manchmal etwas mehr.", pas: "zwilling" },
  panfloete:    { name: "Kristallpanflöte", kind: "pan",     info: "Sieben Kristallröhren, die jede Frequenz sofort erkennen.", pas: "tief" },
  glasharmonika:{ name: "Glasharmonika",    kind: "glass",   info: "Zeno reibt Wasserränder an. Der Ton macht alles ruhig.", pas: "ruhe" },
  rauschmuschel:{ name: "Rauschmuschel",    kind: "conch",   info: "Tarn verkauft sie am Strand. Wer hineinhört, hört das Meer, und manchmal Funken.", pas: "funkel" },
  gezeitenrohr: { name: "Gezeitenrohr",     kind: "tube",    info: "Ebbe baut es aus Treibholz. Sein Takt folgt dem Atem des Meeres.", pas: "moment" },
  tiefengong:   { name: "Tiefengong",       kind: "gong",    info: "Tiefa hat ihn aus dem Wrack geborgen. Nachts singt er lauter.", pas: "nacht" },
  urmeerchor:   { name: "Urmeerchor",       kind: "chorus",  info: "Die letzte Strophe, in Perlmutt gefasst. Viele Stimmen auf einmal.", pas: "chor" }
};
/* Werte je Instrument: Justierung (Frequenz einrasten), Präzision (Breite der Fangzone), Harmonie (bremst den Tonling), Glück (Seltenheit), Takt (Ring-Fenster).
   Jedes Instrument hat Stärken und Schwächen; ein billiges kann in einem Wert ein teures schlagen. */
const STAT_DEF = [["ear", "Justierung"], ["prec", "Präzision"], ["harm", "Harmonie"], ["luck", "Glück"], ["beat", "Takt"]];
const STAT_TIP = { ear: "Hilft beim Frequenzteil: Je höher, desto leichter rastet die Frequenz des Tonlings ein.", prec: "Macht die Fangzone im Fangteil breiter, damit der Tonling leichter in der Zone bleibt.", harm: "Beruhigt den Tonling: Er entkommt langsamer und der Fortschritt sinkt weniger schnell.", luck: "Erhöht die Chance, dass seltenere Tonlinge auftauchen.", beat: "Macht das Zeitfenster beim Ring größer, in dem dein Ton als gut oder perfekt zählt." };
const INSTR_STATS = {
  //            Justierung Präzision Harmonie Glück Takt  Kurzbeschreibung
  holz:         [4,   2,   0,   0,   12,  "Am ehesten gut im Takt, sonst ohne Stärken."],
  schilf:       [3,   3,   9,   11,  4,   "Ein Glückspfeifchen: ruhige Töne, aber ungenau im Takt."],
  laute:        [5,   20,  6,   3,   2,   "Sehr breite Zone und warm. Dafür ohne Takt und Glück."],
  schelle:      [3,   5,   2,   4,   44,  "Meisterin im Takt, schlecht bei Justierung und Glück."],
  harfe:        [14,  5,   20,  24,  6,   "Viel Glück und sehr ruhig, aber schmale Zone und schwacher Takt."],
  geige:        [32,  12,  9,   7,   26,  "Feine Justierung und guter Takt, kaum Glück."],
  rassel:       [6,   10,  4,   8,   26,  "Klappert fein im Takt, sonst bescheiden."],
  maultrommel:  [16,  6,   10,  10,  18,  "Brummt sich gut ein, aber schmale Zone."],
  steinxylo:    [10,  22,  12,  6,   34,  "Gute Zone und ordentlicher Takt, kaum Justierung."],
  zither:       [30,  16,  16,  22,  14,  "Feine Justierung und etwas Glück."],
  windspiel:    [8,   14,  32,  22,  10,  "Beruhigend und glücklich, aber ungenau."],
  dudelsack:    [26,  18,  30,  18,  24,  "Solider Allrounder mit ruhiger Hand."],
  perlpfeife:   [38,  18,  22,  30,  14,  "Rastet gut ein und bringt Glück."],
  treibharfe:   [30,  36,  36,  32,  18,  "Breite Zone und gleichmäßig stark."],
  korallenorgel:[46,  42,  50,  38,  32,  "Stark in allem, nur das Glück bleibt mittel."],
  glocken:      [12,  30,  34,  14,  8,   "Breite Zone und beruhigend, aber taktlos."],
  wolkenhorn:   [10,  10,  36,  12,  30,  "Beruhigt stark und trifft den Takt, sonst schwach."],
  urgabel:      [50,  28,  38,  30,  36,  "Justierung und Takt vom Feinsten, rundum stark."],
  klangschale:  [24,  36,  46,  24,  8,   "Breite Zone und sehr beruhigend, aber taktlos."],
  sternenharfe: [34,  30,  38,  56,  24,  "Das größte Glück, ausgewogen im Rest."],
  weltenorgel:  [60,  42,  48,  38,  16,  "Hört alles und hat eine breite Zone, aber der Takt ist schwach."],
  tonocarina:   [38,  4,   8,   6,   20,  "Rastet Töne sehr gut ein, sonst schlicht."],
  waldtrommel:  [2,   26,  10,  2,   46,  "Breite Zone und starker Takt, aber fast keine Justierung."],
  kalimba:      [14,  8,   30,  40,  4,   "Sanft und glücksbringend, doch ohne Takt. Manchmal doppelte EP."],
  panfloete:    [58,  6,   14,  12,  24,  "Beste Justierung der Höhlen, aber eine schmale Zone."],
  glasharmonika:[26,  20,  58,  18,  6,   "Beruhigt fast jeden Tonling, aber taktlos."],
  rauschmuschel:[40,  24,  26,  54,  34,  "Viel Glück und guter Takt, Funkelnde sind dreimal so häufig."],
  gezeitenrohr: [24,  48,  40,  18,  62,  "Wellentakt vom Feinsten und breite Zone, wenig Glück."],
  tiefengong:   [32,  54,  60,  28,  20,  "Breit und ruhig, nachts besonders stark."],
  egitarre:     [56,  46,  46,  44,  46,  "Rundum stark: feine Justierung, breite Zone, viel Glück und guter Takt."],
  urmeerchor:   [74,  60,  64,  66,  50,  "Die Stimmen des ganzen Meeres: in allem stark."]
};
Object.entries(INSTR_STATS).forEach(([id, v]) => { const i = INSTR[id]; [i.ear, i.prec, i.harm, i.luck, i.beat] = v; i.tag = v[5]; });
function statHtml(i) { return `<span class="stats">${STAT_DEF.map(([k, n]) => `<span class="st" data-tip="${k}"><i>${n}</i><u><b style="width:${Math.round(Math.min(100, Math.sqrt(i[k] / 60) * 100))}%" title="${i[k]}"></b></u></span>`).join("")}</span><small><em>${i.tag}</em></small>`; }
const PAS_TXT = {
  note:   "Alle 4 Sekunden bildet sich eine Note. Wird sie in der Zone eingesammelt: +5 % Fortschritt.",
  moos:   "10 % Chance, dass ein Fang bemoost ist (doppelt so viel wert). Andere Mutationen sind 1,5-mal so häufig.",
  moment: "Solange der Tonling in der Zone ist, wird der Fortschritt immer schneller, bis zu +10 %.",
  mut:    "Mehr Mutationen: Mutationschance ×1,5.",
  ur:     "Der Fortschritt sinkt nur halb so schnell, wenn der Tonling außerhalb der Zone ist.",
  wind:   "Tonlinge flitzen etwas langsamer.",
  ruhe:   "Die Zone beim Halten ist 15 % breiter.",
  stern:  "Sternklare Mutationen sind viermal so häufig.",
  tief:   "Die Frequenz rastet doppelt so schnell ein.",
  zwilling: "Mit 15 % Chance gibt ein Fang doppelte Erfahrung.",
  funkel: "Funkelnde Mutationen sind dreimal so häufig.",
  nacht:  "Nachts: Zone 20 % breiter und Mutationen doppelt so häufig.",
  chor:   "Alle 4 Sekunden bildet sich eine Note (+5 %). Mutationschance ×1,5.",
  glas:   "Gläserne Mutationen sind dreimal so häufig.",
  takt:   "Nach einem perfekten Wurf startet der Fang bei 35 % Fortschritt statt bei 20 %.",
  fein:   "Beim Stimmen ist die Rastzone um 35 % größer.",
  vorsprung: "Jeder Fang startet bei 35 % statt bei 20 % Fortschritt.",
  lehr:   "Jeder Fang gibt 20 % mehr Erfahrung.",
  beute:  "Mit ihr gefangene Tonlinge bringen beim Verkaufen 20 % mehr Noten.",
  glimmer: "Funkelnde und Gläserne Mutationen sind doppelt so häufig.",
  volt:   "Bei einem perfekten Fang wächst die Zone immer weiter, bis zu +15 %. Verlässt der Tonling die Zone, ist der Bonus für diesen Fang weg. Jeder Fang gibt 20 % mehr Erfahrung."
};
