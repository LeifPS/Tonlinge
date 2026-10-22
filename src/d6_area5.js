/* ===== DATEN 6: Bereich 5, Sanktum Magus ===== Seltenheit Erhaben, 25 Tonlinge, fünf neue Spitzeninstrumente, eigene Mutationen.
   Alles hier hängt sich an die Tabellen aus d1 an. Freigabe: RELEASE.areas = 5 (aus), bis Leif zustimmt. */

RAR.push({ id: "e", name: "Erhaben", col: "#2fe0d0", col2: "#ff6ec7", w: 0.03, xp: 8000, val: 30000 });

/* Zonen im Sanktum: halle, archiv, orrerium, zellen, hof, gang, galerie, thron, spiegel, lese, labor, gewaechs, turm1 (Astralturm), turm2 (Uhrwerkturm), turm3 (Schattenturm) */
SPECIES.push(
  // Gewöhnlich
  { id: "tintling",   n: "Tintling",     r: 0, a: 5, z: ["archiv", "lese", "galerie", "turm1", "orrerium"],       t: "b", hz: [372, 392], spd: 2.25, xp: 160, val: 110, fill: 1.1, body: "#3b4a8c", capc: "#e8c35a", x: "glow" },
  { id: "kerzel",     n: "Kerzel",       r: 0, a: 5, z: ["halle", "gang", "zellen", "thron", "turm2", "turm3"],   t: "b", hz: [374, 394], spd: 2.28, xp: 190, val: 135, fill: 1.05, body: "#f7ecd0", capc: "#ffb347", x: "glow" },
  { id: "staubi",     n: "Staubi",       r: 0, a: 5, z: ["archiv", "gang", "lese", "zellen", "turm1", "turm3", "galerie"], t: "b", hz: [376, 396], spd: 2.33, xp: 185, val: 135, fill: 1.05, body: "#d9cfc0", capc: "#b8a890" },
  { id: "blaettli",   n: "Blättli",      r: 0, a: 5, z: ["lese", "archiv", "spiegel", "turm1", "orrerium"],       t: "b", hz: [378, 398], spd: 2.37, xp: 175, val: 125, fill: 1.05, body: "#f4e6c0", capc: "#c98a4a" },
  { id: "koechel",    n: "Köchel",       r: 0, a: 5, z: ["hof", "labor", "gewaechs", "halle", "gang"],            t: "b", hz: [380, 400], spd: 2.40, xp: 200, val: 145, fill: 1.0, body: "#5a5f78", capc: "#7fe0a0", x: "glow" },
  // Ungewöhnlich
  { id: "siegelchen", n: "Siegelchen",   r: 1, a: 5, z: ["halle", "thron", "zellen", "gang", "turm2"],           t: "b", hz: [404, 428], spd: 2.52, xp: 360, val: 435, fill: 0.9, body: "#c8403c", capc: "#f2d878" },
  { id: "federling",  n: "Federling",    r: 1, a: 5, z: ["lese", "archiv", "turm1", "orrerium", "galerie"],       t: "d", hz: [406, 430], spd: 2.58, xp: 415, val: 500, fill: 0.85, body: "#f4f0e0", capc: "#5a8fe0" },
  { id: "spiegelchen",n: "Spiegelchen",  r: 1, a: 5, z: ["spiegel", "galerie", "halle", "labor"],                 t: "b", hz: [408, 432], spd: 2.64, xp: 410, val: 490, fill: 0.85, body: "#dff0ff", capc: "#9ad0f0", x: "glow" },
  { id: "mooswispel", n: "Mooswispel",   r: 1, a: 5, z: ["gewaechs", "hof", "zellen", "turm3"],                   t: "b", hz: [410, 434], spd: 2.70, xp: 375, val: 445, fill: 0.85, body: "#9fd68a", capc: "#e8f8c0", x: "glow" },
  // Selten
  { id: "runling",    n: "Runling",      r: 2, a: 5, z: ["halle", "thron", "turm1", "turm3", "archiv", "gang"],   t: "b", hz: [440, 476], spd: 2.92, xp: 1000, val: 1600, fill: 0.75, body: "#7d86a8", capc: "#6ad8ff", x: "glow" },
  { id: "phiolix",    n: "Phiolix",      r: 2, a: 5, z: ["labor", "hof", "gewaechs", "zellen"],                   t: "b", hz: [442, 478], spd: 3.00, xp: 910, val: 1500, fill: 0.75, body: "#d8f2ee", capc: "#b36af0", x: "glow" },
  { id: "uhrling",    n: "Uhrling",      r: 2, a: 5, z: ["orrerium", "turm2", "galerie", "gang"],                 t: "b", hz: [444, 480], spd: 3.07, xp: 940, val: 1500, fill: 0.7, body: "#c9a15a", capc: "#6a4a2a" },
  { id: "schattenmotte", n: "Schattenmotte", r: 2, a: 5, z: ["archiv", "zellen", "turm3", "lese", "gang"],       t: "n", hz: [446, 482], spd: 3.15, xp: 1000, val: 1700, fill: 0.65, body: "#4a3f70", capc: "#c9b8ff", x: "glow" },
  // Prächtig
  { id: "astrolix",   n: "Astrolix",     r: 3, a: 5, z: ["orrerium", "turm1", "galerie"],                         t: "b", hz: [492, 530], spd: 3.38, xp: 2500, val: 6300, fill: 0.6, body: "#e0b85a", capc: "#6a8fe0", x: "glow" },
  { id: "folianto",   n: "Folianto",     r: 3, a: 5, z: ["lese", "archiv", "turm2"],                              t: "b", hz: [494, 532], spd: 3.48, xp: 2400, val: 6200, fill: 0.6, body: "#8a3a4a", capc: "#f2d878", x: "glow" },
  { id: "irrwisper",  n: "Irrwisper",    r: 3, a: 5, z: ["gewaechs", "hof", "zellen", "turm3"],                   t: "n", hz: [496, 534], spd: 3.60, xp: 2500, val: 6200, fill: 0.55, body: "#bff4e6", capc: "#3fd0b0", x: "glow" },
  // Fabelhaft
  { id: "chronikon",  n: "Chronikon",    r: 4, a: 5, z: ["orrerium", "turm2"],                                    t: "b", hz: [546, 590], spd: 3.82, xp: 6500, val: 22000, fill: 0.4, body: "#f2dca0", capc: "#c98a2a", x: "glow" },
  { id: "trugbild",   n: "Trugbild",     r: 4, a: 5, z: ["spiegel", "galerie"],                                   t: "b", hz: [548, 592], spd: 3.93, xp: 6600, val: 23000, fill: 0.35, body: "#e6f0ff", capc: "#7a8ad8", x: "glow" },
  { id: "luesterfee", n: "Lüsterfee",    r: 4, a: 5, z: ["thron", "halle"],                                       t: "b", hz: [550, 594], spd: 4.05, xp: 7200, val: 25000, fill: 0.3, body: "#fff2c0", capc: "#e8a82a", x: "glow" },
  // Glorreich
  { id: "purpurmagus",n: "Purpurmagus",  r: 5, a: 5, z: ["thron"],                                                t: "n", hz: [606, 650], spd: 4.28, xp: 19000, val: 100000, fill: 0.25, body: "#d8b8ff", cap: "cone", capc: "#7a2ab8", x: "glow" },
  { id: "aschephoenix",n:"Aschephönix",  r: 5, a: 5, z: ["labor", "hof"],                                         t: "b", hz: [608, 652], spd: 4.35, xp: 22000, val: 110000, fill: 0.15, body: "#ffd6b0", capc: "#e0501c", x: "glow" },
  { id: "leerenwal",  n: "Leerenwal",    r: 5, a: 5, z: ["turm3", "galerie"],                                     t: "n", hz: [610, 654], spd: 4.43, xp: 22000, val: 110000, fill: 0.15, body: "#1c2250", capc: "#9ab8ff", x: "glow" },
  // Erhaben: Turkis bis Rosa, ungefähr 1:3000
  { id: "prismara",   n: "Prismara",     r: 6, a: 5, z: ["spiegel"],                                              t: "d", hz: [700, 760], spd: 4.95, xp: 97000, val: 720000, fill: 0.2, body: "#d8fff6", capc: "#ff6ec7", x: "glow" },
  { id: "chronael",   n: "Chronael",     r: 6, a: 5, z: ["orrerium"],                                             t: "n", hz: [704, 764], spd: 5.03, xp: 110000, val: 810000, fill: 0.15, body: "#c8f4ff", capc: "#ff7ad0", x: "glow" },
  { id: "urvox",      n: "Urvox",        r: 6, a: 5, z: ["thron"],                                                t: "n", hz: [708, 768], spd: 5.10, xp: 110000, val: 800000, fill: 0.1, body: "#e0fff4", capc: "#ff5fb8", x: "glow" }
);
SPECIES.forEach(s => { SP[s.id] = s; });

/* ----- Eigene Mutationen der fünf neuen Instrumente (je höher das Instrument, desto mehr Wert) ----- */
MUTS.push(
  { id: "irr",    name: "Irrlichternd", adj: "Irrlichternder", mul: 20,  p: 0, ins: "irrlichtfloete", ip: 0.22, col: "#7dffd8", dk: "#17a58c" },
  { id: "arkan",  name: "Arkan",        adj: "Arkaner",        mul: 34,  p: 0, ins: "runenharfe",     ip: 0.22, col: "#c79bff", dk: "#6a2fd0" },
  { id: "folio",  name: "Beschrieben",  adj: "Beschriebener",  mul: 55,  p: 0, ins: "foliantenorgel", ip: 0.20, col: "#f6dfa6", dk: "#a8701a" },
  { id: "astral", name: "Astral",       adj: "Astraler",       mul: 90,  p: 0, ins: "astrolabium",    ip: 0.20, col: "#9fb6ff", dk: "#3342c8" },
  { id: "urwort", name: "Urwörtlich",   adj: "Urwörtlicher",   mul: 150, p: 0, ins: "erstewort",      ip: 0.18, col: "#ff9ee0", dk: "#c8329a" }
);

/* ----- Instrumente. Neue Fähigkeiten werden über PASX gesteuert (siehe g_game.js), Stärke wächst von Irrlichtflöte bis zum Ersten Wort ----- */
Object.assign(INSTR, {
  irrlichtfloete: { name: "Irrlichtflöte",   kind: "wisp",    info: "Wisperlie schnitzt sie aus Knochenholz. Wer hineinbläst, dem folgen kleine Lichter durch die Gänge.", pas: "irr" },
  runenharfe:     { name: "Runenharfe",      kind: "runeharp", info: "Kolbas Meisterwerk: Jede Saite trägt eine Rune, die erst im Spiel aufleuchtet.", pas: "rune" },
  foliantenorgel: { name: "Foliantenorgel",  kind: "tome",     info: "Merula bindet sie aus verbotenen Seiten. Sie spielt, was in den Büchern nur steht.", pas: "folio" },
  astrolabium:    { name: "Astrolabium",     kind: "astro",    info: "Orrerius' Lebenswerk. Es misst nicht Sterne, sondern Töne, und rechnet schneller, als der Tonling flüchten kann.", pas: "astral" },
  erstewort:      { name: "Das Erste Wort",  kind: "word",     info: "Der Schweigende Magus hat es nie ausgesprochen. Wer es spielt, singt das Urlied von vorn.", pas: "wort" }
});
Object.assign(INSTR_STATS, {
  //                Justierung Präzision Harmonie Glück Takt
  irrlichtfloete: [96  , 44  , 56  , 64  , 64  ,  "Leuchtende Noten fliegen durch den Fang, dazu doppelt so viele Mutationen. Der Einstieg ins Sanktum. Besonders feine Justierung."],
  runenharfe:     [66  , 104 , 90  , 72  , 28  ,  "Runen erscheinen im Fang und geben Fortschritt, dazu 2,5-fache Mutationen. Besonders präzise, dafür schwacher Takt."],
  foliantenorgel: [70  , 70  , 124 , 78  , 50  ,  "Hört jedes Wort der Tonlinge: kaum Fortschrittsverlust und viel Erfahrung. Besonders harmonisch."],
  astrolabium:    [90  , 130 , 66  , 86  , 58  ,  "Rechnet den Tonling aus: die Zone wächst im Fang, der Zauber der Erhabenen wird gedämpft. Besonders präzise."],
  erstewort:      [130 , 100 , 94  , 100 , 70  ,  "Das stärkste Instrument im Spiel. Der Zauber der Erhabenen trifft nur halb so hart."]
});
["irrlichtfloete", "runenharfe", "foliantenorgel", "astrolabium", "erstewort"].forEach(id => { const i = INSTR[id], v = INSTR_STATS[id]; [i.ear, i.prec, i.harm, i.luck, i.beat] = v; i.tag = v[5]; });

/* Parameter der neuen Fähigkeiten: start = Fortschritt zu Beginn, note = [Sekunden, Bonus], loss = Faktor für Fortschrittsverlust außerhalb der Zone,
   xp = Erfahrung, mut = Mutationsfaktor (nachts ×1,5), zone = Breite der Zone, gk = Zone beim Aufbäumen, lock = Dauer des Einrastens, grow = Zonenwachstum bei perfektem Fang,
   rune = Runen im Fang (+x je Rune), ward = Anteil, der vom Zauber der Erhabenen durchkommt */
const PASX = {
  irr:    { start: .20, note: [2.2, .08], loss: 1,   xp: 1,   mut: 2.0, zone: 1,    gk: .5,  lock: .70, grow: 0,   ward: 1 },
  rune:   { start: .20, note: null,      loss: 1,   xp: 1,   mut: 2.5, zone: 1,    gk: .5,  lock: .70, grow: 0,   ward: 1, rune: .06 },
  folio:  { start: .20, note: null,      loss: .30, xp: 3.0, mut: 3.0, zone: 1,    gk: .5,  lock: .70, grow: 0,   ward: 1 },
  astral: { start: .20, note: null,      loss: 1,   xp: 1,   mut: 3.5, zone: 1.12, gk: .5,  lock: .30, grow: .35, ward: .75 },
  wort:   { start: .70, note: [1.8, .09], loss: .25, xp: 3.5, mut: 4.5, zone: 1.22, gk: .95, lock: .30, grow: .30, ward: .50 }
};
const pasx = id => (INSTR[id] && PASX[INSTR[id].pas]) || null;
Object.assign(PAS_TXT, {
  irr:  "Alle 2,2 Sekunden bildet sich eine Note (+8 % Fortschritt). Doppelt so viele Mutationen.",
  rune: "Im Fang erscheinen Runen: jede gibt +6 % Fortschritt (höchstens +20 % je Fang). 2,5-fache Mutationen.",
  folio:"Der Fortschritt sinkt außerhalb der Zone nur noch zu 30 %. +200 % Erfahrung. Dreifache Mutationen.",
  astral:"Bei perfektem Fang wächst die Zone um bis zu 35 %, sie ist grundsätzlich 12 % breiter und der Fang rastet schnell ein. Der Zauber der Erhabenen kommt nur zu drei Vierteln an. 3,5-fache Mutationen.",
  wort: "Fang startet bei 70 %. Verlust nur noch ein Viertel, Zone 22 % breiter und wächst um bis zu 30 %. Der Zauber der Erhabenen trifft nur halb so hart. +250 % Erfahrung, 4,5-fache Mutationen (nachts mehr)."
});
