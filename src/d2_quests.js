/* ===== DATEN 2: NPCs, Quests, Läden ===== */
const NPCS = {
  tilda:  { n: "Tilda",  area: 1, x: 12, y: 38, col: "#e39a3b", hat: "#9a3f2c", hi: "Die Dorfmusikerin. Sie führt dich ins Fangen ein." },
  marlo:  { n: "Marlo",  area: 1, x: 23, y: 39, col: "#8f86b3", hat: "#4a4170", beard: true, shop: "marlo", buy: true },
  ysa:    { n: "Ysa",    area: 1, x: 55, y: 45, col: "#d8697a", hat: "#6b2a3a" },
  okko:   { n: "Okko",   area: 1, x: 49, y: 21, col: "#6fa88a", hat: "#2f5e4a", beard: true },
  bora:   { n: "Bora",   area: 1, x: 8, y: 11, col: "#7c8fd0", hat: "#2e3b7a" },
  fenn:   { n: "Fenn",   area: 1, x: 73, y: 11, col: "#c9a14a", hat: "#6b5320" },
  mooma:  { n: "Mooma",  area: 1, x: 3,  y: 20, col: "#9fb28a", hat: "#4d6a3a", secret: true },
  kerrin: { n: "Kerrin", area: 2, x: 33, y: 64, col: "#8f9bd8", hat: "#38407a", beard: true, shop: "kerrin", buy: true },
  dunn:   { n: "Dunn",   area: 2, x: 51, y: 79, col: "#d09a6a", hat: "#5e3b1c" },
  lioba:  { n: "Lioba",  area: 2, x: 10, y: 80, col: "#7ec6c0", hat: "#2f6e69" },
  echo:   { n: "Der Lauscher", area: 2, x: 74, y: 98, col: "#b9a6e0", hat: "#5a4a8a", secret: true }
};

const SHOPS = {
  marlo:  { name: "Marlos Laden", items: [ { id: "laute", price: 120, lvl: 4 } ] },
  kerrin: { name: "Kerrins Werkstatt", items: [ { id: "geige", price: 2600, lvl: 12 } ] }
};

/* Aufgabenarten: catch = fange n Tonlinge, die zum Filter passen: r = mindestens Seltenheit, sp = Art, a = Bereich, night = nur nachts */
const QUESTS = {
  m1: { npc: "tilda", main: 1, lvl: 1, title: "Der erste Ton", n: 3, f: {},
        desc: "Fange 3 Tonlinge. Spiele dein Instrument, such die Frequenz und halte den Tonling in der Zone.",
        offer: "Willkommen im Klanghain! Hier lebt alles von Tönen. Nimm die Holzflöte und fang mir drei Tonlinge, dann weiß ich, dass du es kannst.",
        done: "Das klang schon richtig gut! Hier, für den Anfang.", rew: { xp: 70, gold: 30 } },
  m2: { npc: "tilda", main: 1, lvl: 2, after: "m1", title: "Etwas Besonderes", n: 2, f: { r: 1 },
        desc: "Fange 2 ungewöhnliche (grüne) oder bessere Tonlinge.",
        offer: "Nicht jeder Tonling ist gleich. Manche leuchten kräftiger. Bring mir zwei, die mindestens ungewöhnlich sind.",
        done: "Du hast ein Ohr dafür. Bald brauchst du aber ein besseres Instrument.", rew: { xp: 140, gold: 60 } },
  m3: { npc: "tilda", main: 1, lvl: 5, after: "m2", title: "Seltene Klänge", n: 2, f: { r: 2 },
        desc: "Fange 2 seltene (blaue) oder bessere Tonlinge.",
        offer: "Die ganz leisen Töne liegen höher. Dafür brauchst du mehr Resonanz. Bring mir zwei seltene Tonlinge.",
        done: "Zwei Seltene! Der Hain kennt dich jetzt.", rew: { xp: 420, gold: 160 } },
  m4: { npc: "tilda", main: 1, lvl: 9, after: "m3", title: "Das Tor der Höhlen", n: 1, f: { r: 3, a: 1 },
        desc: "Fange einen prächtigen (lila) Tonling im Klanghain. Danach öffnet sich das Tor zu den Glimmerhöhlen.",
        offer: "Unter dem Hain liegen die Glimmerhöhlen. Das Tor öffnet nur, wer einen prächtigen Tonling gefangen hat. Du findest ihn eher an windigen Orten oder nachts am Teich.",
        done: "Prächtig! Ich öffne das Tor für dich. Am Südrand des Hains, hinter der Wiese.", rew: { xp: 1400, gold: 500 }, flag: "gate" },
  m5: { npc: "dunn", main: 1, lvl: 10, after: "m4", title: "Dunkle Töne", n: 6, f: { a: 2 },
        desc: "Fange 6 Tonlinge in den Glimmerhöhlen.",
        offer: "Hier unten hallt alles. Ich bin Dunn, ich kenne jeden Stein. Fang sechs Tonlinge, damit du dich an die Tiefe gewöhnst.",
        done: "Sechs. Die Höhle hat dich akzeptiert.", rew: { xp: 900, gold: 350 } },
  m6: { npc: "dunn", main: 1, lvl: 12, after: "m5", title: "Kristallklang", n: 3, f: { r: 2, a: 2 },
        desc: "Fange 3 seltene oder bessere Tonlinge in den Glimmerhöhlen.",
        offer: "Im großen Saal und im Becken leben die seltenen. Bring mir drei.",
        done: "Drei! Jetzt fehlt nur noch das Größte.", rew: { xp: 2200, gold: 700 } },
  m7: { npc: "dunn", main: 1, lvl: 16, after: "m6", title: "Der goldene Ton", n: 1, f: { r: 4, a: 2 },
        desc: "Fange einen fabelhaften (gelben) Tonling in den Glimmerhöhlen.",
        offer: "Es heißt, im Becken singt ein Sonnenkern. Ein fabelhafter Tonling. Wenn du ihn fängst, hast du alles gesehen, was es bisher gibt.",
        done: "Ein Sonnenkern! Das ist das Ende dieser Vorschau, aber der Hain und die Höhlen laden dich weiter zum Sammeln ein.", rew: { xp: 6000, gold: 3000 } },

  q_okko: { npc: "okko", lvl: 2, title: "Okkos Schilf", n: 2, f: { sp: "nebeline" },
        desc: "Fange 2 Nebeline. Du findest sie im Wald und am Teich.",
        offer: "Ich schnitze Pfeifen aus Teichschilf, aber mir fehlen Nebeline zum Einstimmen. Bring zwei, dann bekommst du eine Schilfpfeife.",
        done: "Hör dir das an! Eine gute Pfeife für dich.", rew: { xp: 90, gold: 20, instr: "schilf" } },
  q_bora: { npc: "bora", lvl: 6, title: "Licht im Wald", n: 1, f: { sp: "laternli" },
        desc: "Fange nachts im Wald oder auf dem Hügel ein Laternli.",
        offer: "Nachts leuchtet im Wald eine kleine Laterne, die keine ist. Ein Laternli. Fang eins für mich.",
        done: "So hell! Danke. Das hier ist für dich.", rew: { xp: 300, gold: 140 } },
  q_ysa: { npc: "ysa", lvl: 6, title: "Ysas Takt", n: 3, f: { r: 2 },
        desc: "Fange 3 seltene (blaue) Tonlinge.",
        offer: "Mein Takt ist besser als dein Gehör. Bring mir drei seltene Tonlinge, dann baue ich dir eine Schellentrommel.",
        done: "Gutes Händchen. Hier ist deine Trommel.", rew: { xp: 350, gold: 100, instr: "schelle" } },
  q_mooma: { npc: "mooma", lvl: 7, title: "Moos und Tau", n: 2, f: { sp: "tautropf" },
        desc: "Fange 2 Tautropfen am Teich.",
        offer: "Du hast die Wand gehört, mein Kind. Das schaffen wenige. Bring mir zwei Tautropfen vom Teich und die Moosharfe gehört dir.",
        done: "Sie hört nur auf besondere Lieder. Spiel sie mit Bedacht.", rew: { xp: 420, gold: 0, instr: "harfe" } },
  q_fenn: { npc: "fenn", lvl: 8, title: "Wind im Rücken", n: 1, f: { sp: "windspiel" },
        desc: "Fange ein Windspiel auf dem Windhügel.",
        offer: "Auf dem Hügel singt der Wind, aber manchmal singt etwas mit. Fang ein Windspiel.",
        done: "Es klingt noch nach! Hier, für deine Mühe.", rew: { xp: 800, gold: 400 } },
  q_lioba: { npc: "lioba", lvl: 13, title: "Hallende Tropfen", n: 1, f: { sp: "hallsaenger" },
        desc: "Fange einen Hallsänger im Becken oder im Saal.",
        offer: "Mein Glockenspiel ist fertig, aber es braucht den Ton eines Hallsängers. Fang mir einen.",
        done: "Jeder Ton fällt wie ein Tropfen. Es gehört dir.", rew: { xp: 1600, gold: 300, instr: "glocken" } },
  q_echo: { npc: "echo", lvl: 12, title: "Stille hören", n: 1, f: { sp: "dunkelwisp" },
        desc: "Fange einen Dunkelwisp im Becken oder im Pilzgarten.",
        offer: "Ich höre nur noch das Echo. Aber der Dunkelwisp, der singt in meinen Träumen. Fang mir einen.",
        done: "Endlich Stille. Hier, nimm.", rew: { xp: 1200, gold: 900 } }
};

/* Welche Tonling-Art passt zum Filter */
function matchFilter(f, sp, area) {
  if (f.sp && sp.id !== f.sp) return false;
  if (f.r !== undefined && sp.r < f.r) return false;
  if (f.a && sp.a !== f.a) return false;
  return true;
}
