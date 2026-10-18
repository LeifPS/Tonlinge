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
  stimmer: { n: "Der Stimmer", area: 2, x: 15, y: 109, col: "#e8d28a", hat: "#6a3a7a", secret: true, beard: true },
  astra:  { n: "Astra",  area: 3, x: 24, y: 131, col: "#7fa0e8", hat: "#2a3a80" },
  pim:    { n: "Pim",    area: 3, x: 48, y: 122, col: "#e8b46a", hat: "#7a4a2a", shop: "pim", buy: true },
  selene: { n: "Selene", area: 3, x: 54, y: 139, col: "#c9c2f0", hat: "#5a4a9a" },
  nox:    { n: "Nox",    area: 3, x: 64, y: 132, col: "#a08ac0", hat: "#3a2a5a" },
  gero:   { n: "Gero",   area: 3, x: 18, y: 152, col: "#9a9ac0", hat: "#3a3a5a", beard: true },
  wenzel: { n: "Wenzel", area: 3, x: 44, y: 158, col: "#6fcfb0", hat: "#2a6a5a" },
  hueterin: { n: "Die Hüterin", area: 3, x: 74, y: 157, col: "#f0e0b0", hat: "#7a5ab0", secret: true },
  ida:    { n: "Ida",    area: 2, x: 3,  y: 62 , col: "#7b78b8", hat: "#2b2a3e", secret: true },
  echo:   { n: "Der Lauscher", area: 2, x: 74, y: 98, col: "#b9a6e0", hat: "#5a4a8a", secret: true },
  rufus:  { n: "Rufus",  area: 1, x: 50, y: 36, col: "#d9a05a", hat: "#7a4a22" },
  brum:   { n: "Brum",   area: 1, x: 22, y: 12, col: "#8a9a6a", hat: "#4a5a30", beard: true },
  gilda:  { n: "Gilda",  area: 2, x: 14, y: 95, col: "#c28ad0", hat: "#6a3a7a" },
  orla:   { n: "Orla",   area: 2, x: 32, y: 74, col: "#8ac0e0", hat: "#2a5a80" },
  zeno:   { n: "Zeno",   area: 3, x: 24, y: 150, col: "#c0b0e8", hat: "#4a3a8a", beard: true },
  mira:   { n: "Mira",   area: 4, x: 46, y: 176, col: "#f0a08a", hat: "#a8503a" },
  tarn:   { n: "Tarn",   area: 4, x: 56, y: 178, col: "#7ab0c8", hat: "#2a5870", beard: true, shop: "tarn", buy: true },
  korin:  { n: "Korin",  area: 4, x: 16, y: 188, col: "#e68aa8", hat: "#8a2a4a" },
  ebbe:   { n: "Ebbe",   area: 4, x: 57, y: 188, col: "#8ad0c8", hat: "#2a6a68", shop: "ebbe", buy: true },
  hake:   { n: "Käpt'n Hake", area: 4, x: 22, y: 206, col: "#a08a6a", hat: "#3a2a1a", beard: true },
  tiefa:  { n: "Tiefa",  area: 4, x: 49, y: 212, col: "#5a8ad0", hat: "#1a2a60" },
  saenger:{ n: "Der Strophensänger", area: 4, x: 3, y: 191, col: "#f4eaff", hat: "#6a4aa0", secret: true }
};

const SHOPS = {
  marlo:  { name: "Marlos Laden", items: [ { id: "laute", price: 620, lvl: 4 }, { id: "rassel", price: 1500, lvl: 6 }, { id: "maultrommel", price: 2400, lvl: 8 } ] },
  kerrin: { name: "Kerrins Werkstatt", items: [ { id: "steinxylo", price: 5200, lvl: 12 }, { id: "geige", price: 8000, lvl: 14 }, { id: "zither", price: 11000, lvl: 16 } ] },
  pim:    { name: "Pims Wolkenstand", items: [ { id: "windspiel", price: 24000, lvl: 25 }, { id: "wolkenhorn", price: 38000, lvl: 28 }, { id: "dudelsack", price: 56000, lvl: 31 } ] },
  tarn:   { name: "Tarns Muschelstand", items: [ { id: "perlpfeife", price: 40000, lvl: 27 }, { id: "rauschmuschel", price: 60000, lvl: 29 } ] },
  ebbe:   { name: "Ebbes Treibholzwerkstatt", items: [ { id: "treibharfe", price: 90000, lvl: 32 }, { id: "gezeitenrohr", price: 150000, lvl: 34 }, { id: "korallenorgel", price: 260000, lvl: 38 } ] }
};

/* Aufgabenarten: catch = fange n Tonlinge, die zum Filter passen: r = mindestens Seltenheit, sp = Art, a = Bereich, night = nur nachts */
const QUESTS = {
  m1: { npc: "tilda", main: 1, lvl: 1, title: "Der erste Ton", n: 3, f: {},
        desc: "Fange 3 Tonlinge. Spiele dein Instrument, such die Frequenz und halte den Tonling in der Zone.",
        offer: "Willkommen im Klanghain! Hier lebt alles von Tönen. Nimm die Holzflöte und fang mir drei Tonlinge, dann weiß ich, dass du es kannst.",
        done: "Das klang schon richtig gut! Hier, für den Anfang.", rew: { xp: 110, gold: 30 } },
  m2: { npc: "tilda", main: 1, lvl: 2, after: "m1", title: "Etwas Besonderes", n: 2, f: { r: 1 },
        desc: "Fange 2 ungewöhnliche (grüne) oder bessere Tonlinge.",
        offer: "Nicht jeder Tonling ist gleich. Manche leuchten kräftiger. Bring mir zwei, die mindestens ungewöhnlich sind.",
        done: "Du hast ein Ohr dafür. Bald brauchst du aber ein besseres Instrument.", rew: { xp: 140, gold: 60 } },
  m3: { npc: "tilda", main: 1, lvl: 5, after: "m2", title: "Seltene Klänge", n: 2, f: { r: 2 },
        desc: "Fange 2 seltene (blaue) oder bessere Tonlinge.",
        offer: "Die ganz leisen Töne liegen höher. Dafür brauchst du ein besseres Instrument. Bring mir zwei seltene Tonlinge.",
        done: "Zwei Seltene! Der Hain kennt dich jetzt.", rew: { xp: 420, gold: 160 } },
  m4: { npc: "tilda", main: 1, lvl: 9, after: "m3", title: "Das Tor der Höhlen", n: 1, f: { r: 3, a: 1 },
        desc: "Fange einen prächtigen (lila) Tonling im Klanghain. Danach öffnet sich das Tor zu den Glimmerhöhlen.",
        offer: "Unter dem Hain liegen die Glimmerhöhlen. Das Tor öffnet nur, wer einen prächtigen Tonling gefangen hat. Du findest ihn eher an windigen Orten oder nachts am Teich.",
        done: "Prächtig! Ich öffne das Tor für dich. Am Südrand des Hains, hinter der Wiese.", rew: { xp: 1400, gold: 500 }, flag: "gate" },
  m5: { npc: "dunn", main: 1, lvl: 12, after: "m4", title: "Dunkle Töne", n: 6, f: { a: 2 },
        desc: "Fange 6 Tonlinge in den Glimmerhöhlen.",
        offer: "Hier unten hallt alles. Ich bin Dunn, ich kenne jeden Stein. Fang sechs Tonlinge, damit du dich an die Tiefe gewöhnst.",
        done: "Sechs. Die Höhle hat dich akzeptiert.", rew: { xp: 900, gold: 350 } },
  m6: { npc: "dunn", main: 1, lvl: 14, after: "m5", title: "Kristallklang", n: 3, f: { r: 2, a: 2 },
        desc: "Fange 3 seltene oder bessere Tonlinge in den Glimmerhöhlen.",
        offer: "Im großen Saal und im Becken leben die seltenen. Bring mir drei.",
        done: "Drei! Jetzt fehlt nur noch das Größte.", rew: { xp: 2200, gold: 700 } },
  m7: { npc: "dunn", main: 1, lvl: 18, after: "m6", title: "Der goldene Ton", n: 1, f: { r: 4, a: 2 },
        desc: "Fange einen fabelhaften (gelben) Tonling in den Glimmerhöhlen.",
        offer: "Es heißt, im Becken singt ein Sonnenkern. Ein fabelhafter Tonling. Wenn du ihn fängst, hast du alles gesehen, was es bisher gibt.",
        done: "Ein Sonnenkern! Das war der erste Ton des Urlieds. Aber es gibt noch mehr davon.", rew: { xp: 6000, gold: 3000 } },
  m8: { npc: "dunn", main: 1, lvl: 22, after: "m7", title: "Der Sternenpfad", n: 9, f: { r: 3, a: 2 },
        parts: [ { n: 3, f: { r: 3, a: 2 }, txt: "Fange 3 prächtige (lila) Tonlinge in den Glimmerhöhlen." },
                 { n: 2, f: { mut: "moos", a: 2 }, txt: "Fange 2 bemooste Tonlinge in den Glimmerhöhlen. Die Moosharfe lockt das Moos an." },
                 { n: 2, f: { sp: "dunkelwisp" }, txt: "Fange 2 Dunkelwisps (nachts im Pilzgarten oder im Klangbecken)." },
                 { n: 2, f: { sp: "hallsaenger" }, txt: "Fange 2 Hallsänger im Klangbecken oder im Kristallsaal." } ],
        desc: "Das Sterntor am Ende des Klangbeckens öffnet nur, wer die Höhle wirklich kennt. Erfülle alle vier Aufgaben.",
        offer: "Hinter dem Klangbecken liegt ein Tor, das nie jemand aufbekommen hat. Das Sterntor.", done: "Das Tor ist offen.", rew: { xp: 9000, gold: 4000 }, flag: "gate3" },
  m9: { npc: "astra", main: 1, lvl: 24, after: "m8", title: "Erste Sterne", n: 5, f: { a: 3 },
        desc: "Fange 5 Tonlinge in der Sternenhöhe.", offer: "", done: "", rew: { xp: 4000, gold: 1600 } },
  m10: { npc: "astra", main: 1, lvl: 25, after: "m9", title: "Nachtkonzert", n: 4, f: { r: 1, a: 3 },
        desc: "Fange 4 ungewöhnliche (grüne) oder bessere Tonlinge in der Sternenhöhe.", offer: "", done: "", rew: { xp: 7500, gold: 3000 } },
  m11: { npc: "astra", main: 1, lvl: 26, after: "m10", title: "Gewitterklang", n: 3, f: { r: 2, a: 3 },
        desc: "Fange 3 seltene (blaue) oder bessere Tonlinge in der Sternenhöhe.", offer: "", done: "", rew: { xp: 14000, gold: 6000 } },
  m12: { npc: "astra", main: 1, lvl: 29, after: "m11", title: "Das Nordlicht", n: 2, f: { r: 3, a: 3 },
        desc: "Fange 2 prächtige (lila) Tonlinge in der Sternenhöhe.", offer: "", done: "", rew: { xp: 28000, gold: 10000 } },
  m13: { npc: "astra", main: 1, lvl: 33, after: "m12", title: "Der Schlusston", n: 1, f: { r: 4, a: 3 },
        desc: "Fange einen fabelhaften (gelben) Tonling in der Sternenhöhe: den Weltenstern.", offer: "", done: "", rew: { xp: 70000, gold: 30000 }, flag: "gate4" },
  q_nox: { npc: "nox", lvl: 22, title: "Nachtwache", n: 2, f: { sp: "nachtkauz" },
        desc: "Fange nachts 2 Nachtkäuze an der Sternwarte oder am Mondsee.", offer: "", done: "", rew: { xp: 5000, gold: 2400 } },
  q_selene: { npc: "selene", lvl: 24, title: "Mondlied", n: 3, f: { sp: "mondling" },
        desc: "Fange nachts 3 Mondlinge am Mondsee oder auf dem Nordlichtgrat.", offer: "", done: "", rew: { xp: 9000, gold: 4000 } },
  q_selene2: { npc: "selene", lvl: 28, after: "q_selene", title: "Saiten aus Licht", n: 1, f: { sp: "aurorella" },
        desc: "Fange eine Aurorella auf dem Nordlichtgrat (nur nachts).", offer: "", done: "", rew: { xp: 30000, gold: 0, instr: "sternenharfe" } },
  q_gero: { npc: "gero", lvl: 25, title: "Donnerklang", n: 2, f: { sp: "blitzling" },
        desc: "Fange 2 Blitzlinge auf dem Gewitterkamm.", offer: "", done: "", rew: { xp: 12000, gold: 0, instr: "klangschale" } },
  q_wenzel: { npc: "wenzel", lvl: 27, title: "Kometenschweif", n: 1, f: { sp: "kometarius" },
        desc: "Fange einen Kometarius auf dem Gewitterkamm oder dem Nordlichtgrat.", offer: "", done: "", rew: { xp: 22000, gold: 12000 } },
  q_hueterin: { npc: "hueterin", lvl: 33, after: "m12", title: "Das Weltenlied", n: 5, f: { sp: "weltenstern" },
        desc: "Fange 5 Weltensterne. Das ist die schwerste Aufgabe im ganzen Spiel und kann sehr, sehr lange dauern.", offer: "", done: "", rew: { xp: 250000, gold: 0, instr: "weltenorgel" } },

  q_okko: { npc: "okko", lvl: 2, title: "Okkos Schilf", n: 2, f: { sp: "nebeline" },
        desc: "Fange 2 Nebeline. Du findest sie im Wald und am Teich.",
        offer: "Ich schnitze Pfeifen aus Teichschilf, aber mir fehlen Nebeline zum Einstimmen. Bring zwei, dann bekommst du eine Schilfpfeife.",
        done: "Hör dir das an! Eine gute Pfeife für dich.", rew: { xp: 90, gold: 20, instr: "schilf" } },
  q_bora: { npc: "bora", lvl: 6, title: "Licht im Wald", n: 1, f: { sp: "laternli" },
        desc: "Fange nachts im Wald oder auf dem Hügel ein Laternli.",
        offer: "Nachts leuchtet im Wald eine kleine Laterne, die keine ist. Ein Laternli. Fang eins für mich.",
        done: "So hell! Danke. Das hier ist für dich.", rew: { xp: 300, gold: 140 } },
  q_marlo: { npc: "marlo", lvl: 3, title: "Marlos Schneiderei", n: 3, f: { r: 1 },
        desc: "Fange 3 ungewöhnliche (grüne) oder bessere Tonlinge für Marlos Stoffmuster. Danach ändert er dein Aussehen.",
        offer: "Ich nähe nebenbei. Für Stoffmuster brauche ich Tonlinge mit kräftiger Farbe. Bring mir drei ungewöhnliche, dann kann ich dich neu einkleiden.",
        done: "Perfekte Farben. Komm jederzeit wieder, dann ändere ich dein Aussehen.", rew: { xp: 160, gold: 70 }, flag: "look" },
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
  q_lioba: { npc: "lioba", lvl: 15, title: "Hallende Tropfen", n: 1, f: { sp: "hallsaenger" },
        desc: "Fange einen Hallsänger im Becken oder im Saal.",
        offer: "Mein Glockenspiel ist fertig, aber es braucht den Ton eines Hallsängers. Fang mir einen.",
        done: "Jeder Ton fällt wie ein Tropfen. Es gehört dir.", rew: { xp: 1600, gold: 300, instr: "glocken" } },
  q_stimmer: { npc: "stimmer", lvl: 22, after: "m7", title: "Die Urstimme", n: 3, f: { r: 4 },
        desc: "Fange 3 fabelhafte (gelbe) Tonlinge. Das kann sehr lange dauern.",
        offer: "Die Urgabel schlägt den ersten Ton des Urlieds an. Drei fabelhafte Tonlinge, dann gehört sie dir.",
        done: "Drei Mal der erste Ton. Nimm die Gabel.", rew: { xp: 20000, gold: 0, instr: "urgabel" } },
  q_echo: { npc: "echo", lvl: 14, title: "Stille hören", n: 1, f: { sp: "dunkelwisp" },
        desc: "Fange einen Dunkelwisp im Becken oder im Pilzgarten.",
        offer: "Ich höre nur noch das Echo. Aber der Dunkelwisp, der singt in meinen Träumen. Fang mir einen.",
        done: "Endlich Stille. Hier, nimm.", rew: { xp: 1200, gold: 900 } },
  /* ---- Weitere Aufgaben in den ersten drei Bereichen ---- */
  q_tilda_glas: { npc: "tilda", lvl: 8, after: "m3", title: "Glasklare Töne", n: 1, f: { mut: "glas" },
        desc: "Fange einen Gläsernen Tonling. Er ist durchsichtig und kommt bei jedem Fang mit 4 % Chance.", rew: { xp: 700, gold: 300 } },
  q_rufus: { npc: "rufus", lvl: 3, title: "Rufus' Wiesenton", n: 3, f: { sp: "gloeckli" },
        desc: "Fange 3 Glöckli auf der Wiese oder dem Windhügel.", rew: { xp: 140, gold: 40, instr: "tonocarina" } },
  q_brum: { npc: "brum", lvl: 7, title: "Holz zum Klingen", n: 2, f: { sp: "kraeusel" },
        desc: "Fange 2 Kräuselin im Wald oder auf der Wiese.", rew: { xp: 380, gold: 90, instr: "waldtrommel" } },
  q_gilda: { npc: "gilda", lvl: 13, title: "Zupfen im Pilzgarten", n: 3, f: { sp: "stalagnuss" },
        desc: "Fange 3 Stalagnüsse im Pilzgarten oder im Tropfsteingang.", rew: { xp: 1300, gold: 240, instr: "kalimba" } },
  q_orla: { npc: "orla", lvl: 15, title: "Sieben Röhren", n: 2, f: { sp: "kristallo" },
        desc: "Fange 2 Kristallos im Kristallsaal.", rew: { xp: 1800, gold: 300, instr: "panfloete" } },
  q_zeno: { npc: "zeno", lvl: 24, title: "Gläserne Stille", n: 3, f: { sp: "wolkenwal" },
        desc: "Fange 3 Wolkenwale auf dem Gewitterkamm oder am Wolkenpfad.", rew: { xp: 9000, gold: 2400, instr: "glasharmonika" } },
  q_astra_funkel: { npc: "astra", lvl: 30, after: "m12", title: "Funkelnde Nacht", n: 1, f: { mut: "funkel", a: 3 },
        desc: "Fange einen Funkelnden Tonling in der Sternenhöhe. Funkelnde kommen bei jedem Fang mit 1,2 % Chance.", rew: { xp: 36000, gold: 14000 } },

  /* ---- Bereich 4: Rauschmeer ---- */
  m14: { npc: "mira", main: 1, lvl: 35, after: "m13", title: "Salz in der Luft", n: 5, f: { a: 4 },
        desc: "Fange 5 Tonlinge im Rauschmeer.", rew: { xp: 22000, gold: 8000 } },
  m15: { npc: "mira", main: 1, lvl: 36, after: "m14", title: "Strandgut", n: 4, f: { r: 1, a: 4 },
        desc: "Fange 4 ungewöhnliche (grüne) oder bessere Tonlinge im Rauschmeer.", rew: { xp: 38000, gold: 14000 } },
  m16: { npc: "mira", main: 1, lvl: 38, after: "m15", title: "Gezeitenlieder", n: 3, f: { r: 2, a: 4 },
        desc: "Fange 3 seltene (blaue) oder bessere Tonlinge im Rauschmeer.", rew: { xp: 62000, gold: 25000 } },
  m17: { npc: "mira", main: 1, lvl: 40, after: "m16", title: "Perlenjagd", n: 2, f: { r: 3, a: 4 },
        desc: "Fange 2 prächtige (lila) Tonlinge im Rauschmeer.", rew: { xp: 110000, gold: 45000 } },
  m18: { npc: "mira", main: 1, lvl: 42, after: "m17", title: "Funkeln im Wasser", n: 1, f: { r: 3, a: 4, mut: "any" },
        desc: "Fange einen prächtigen (lila) Tonling im Rauschmeer, der mutiert ist: gläsern, funkelnd oder sternklar.", rew: { xp: 200000, gold: 70000 } },
  m19: { npc: "mira", main: 1, lvl: 44, after: "m18", title: "Der Abgrundton", n: 1, f: { r: 4, a: 4 },
        desc: "Fange einen fabelhaften (gelben) Tonling im Rauschmeer: die Urperle oder die Abgrundsonne.", rew: { xp: 400000, gold: 150000 } },
  q_tarn: { npc: "tarn", lvl: 34, title: "Muschelsammlung", n: 6, f: { sp: "muschling" },
        desc: "Fange 6 Muschlinge am Muschelstrand oder im Gezeitenbecken.", rew: { xp: 14000, gold: 6000 } },
  q_korin: { npc: "korin", lvl: 37, title: "Rosa Riffe", n: 3, f: { sp: "korallo" },
        desc: "Fange 3 Korallos im Korallenwald.", rew: { xp: 44000, gold: 20000 } },
  q_korin2: { npc: "korin", lvl: 39, after: "q_korin", title: "Leuchtende Riffe", n: 1, f: { sp: "quallo", mut: "any" },
        desc: "Fange einen mutierten Quallo (gläsern, funkelnd oder sternklar).", rew: { xp: 90000, gold: 36000 } },
  q_ebbe: { npc: "ebbe", lvl: 35, title: "Flutmarke", n: 4, f: { sp: "krabbel" },
        desc: "Fange 4 Krabbel am Muschelstrand oder im Gezeitenbecken.", rew: { xp: 20000, gold: 9000 } },
  q_ebbe2: { npc: "ebbe", lvl: 39, after: "q_ebbe", title: "Perlenfischerin", n: 2, f: { sp: "perlchen" },
        desc: "Fange 2 Perlchen im Gezeitenbecken oder am Strand.", rew: { xp: 95000, gold: 40000 } },
  q_hake: { npc: "hake", lvl: 36, title: "Planken und Geister", n: 3, f: { sp: "wrackwurm" },
        desc: "Fange nachts 3 Wrackwürmer im Wrackfriedhof oder im Tiefenschlund.", rew: { xp: 26000, gold: 12000 } },
  q_hake2: { npc: "hake", lvl: 40, after: "q_hake", title: "Der Geisterkrake", n: 1, f: { sp: "geisterkrake" },
        desc: "Fange nachts einen Geisterkraken im Wrackfriedhof oder im Tiefenschlund.", rew: { xp: 100000, gold: 38000 } },
  q_tiefa: { npc: "tiefa", lvl: 38, title: "Der Gong im Wrack", n: 2, f: { sp: "tiefenlicht" },
        desc: "Fange nachts 2 Tiefenlichter im Tiefenschlund oder im Wrackfriedhof.", rew: { xp: 80000, gold: 0, instr: "tiefengong" } },
  q_tiefa2: { npc: "tiefa", lvl: 42, after: "q_tiefa", title: "Der Tiefseekönig", n: 1, f: { sp: "tiefsee" },
        desc: "Fange den Tiefseekönig im Tiefenschlund.", rew: { xp: 160000, gold: 60000 } },

  /* ---- Die Letzte Strophe: die schwerste Aufgabe, sieben Stufen mit Mutationen ---- */
  l1: { npc: "saenger", lvl: 42, after: "m13", title: "Die Letzte Strophe I: Gezeichnete", n: 4, f: { mut: "any" }, chain: 1,
        desc: "Fange 4 mutierte Tonlinge (gläsern, funkelnd oder sternklar), egal welche Art und wo.", rew: { xp: 60000, gold: 20000 } },
  l2: { npc: "saenger", lvl: 42, after: "l1", title: "Die Letzte Strophe II: Glas", n: 3, f: { mut: "glas", r: 2 }, chain: 2,
        desc: "Fange 3 Gläserne Tonlinge, selten (blau) oder besser.", rew: { xp: 90000, gold: 30000 } },
  l3: { npc: "saenger", lvl: 43, after: "l2", title: "Die Letzte Strophe III: Funken", n: 2, f: { mut: "funkel", r: 3 }, chain: 3,
        desc: "Fange 2 Funkelnde Tonlinge, prächtig (lila) oder besser.", rew: { xp: 140000, gold: 45000 } },
  l4: { npc: "saenger", lvl: 44, after: "l3", title: "Die Letzte Strophe IV: Sterne", n: 1, f: { mut: "stern", r: 2 }, chain: 4,
        desc: "Fange einen Sternklaren Tonling, selten (blau) oder besser.", rew: { xp: 220000, gold: 70000 } },
  l5: { npc: "saenger", lvl: 44, after: "l4", title: "Die Letzte Strophe V: Gold", n: 1, f: { mut: "funkel", r: 4 }, chain: 5,
        desc: "Fange einen Funkelnden Fabelhaften (gelb): zum Beispiel einen funkelnden Weltenstern, eine Urperle oder eine Abgrundsonne.", rew: { xp: 380000, gold: 110000 } },
  l6: { npc: "saenger", lvl: 44, after: "l5", title: "Die Letzte Strophe VI: Pracht", n: 1, f: { mut: "stern", r: 3, a: 4 }, chain: 6,
        desc: "Fange einen Sternklaren Prächtigen (lila) im Rauschmeer.", rew: { xp: 650000, gold: 200000 } },
  l7: { npc: "saenger", lvl: 44, after: "l6", title: "Die Letzte Strophe VII: Rot", n: 1, f: { mut: "any", r: 5 }, chain: 7,
        desc: "Fange einen mutierten Glorreichen (rot). Das ist die schwerste Aufgabe im ganzen Spiel.", rew: { xp: 2000000, gold: 500000, instr: "urmeerchor" } }
};


/* ===== Fundstücke (in der Welt, nur sichtbar solange eine Quest sie braucht) ===== */
const ITEMS = {
  okkopfeife:     { n: "Okkos Pfeife",   x: 76, y: 15, kind: "reed" },
  sonnensplitter: { n: "Sonnensplitter", x: 70, y: 84, kind: "shard" },
  kristallroehre: { n: "Kristallröhre",  x: 4,  y: 69, kind: "pipes" },
  astrafernglas:  { n: "Astras Fernglas", x: 95, y: 67, kind: "tube" },
  mondperle:      { n: "Selenes Mondperle", x: 91, y: 82, kind: "chimes" },
  gerosgabel:     { n: "Geros Stimmgabel", x: 141, y: 78, kind: "bowl" }
};
Object.keys(ITEMS).forEach(k => ITEMS[k].id = k);
/* ===== Aufgaben mit mehreren Teilen: je später, desto schwerer ===== */
const IDXN = a => SPECIES.filter(s => s.a === a && s.r <= 4).length;
const C_ = (n, f, txt) => ({ n, f, txt }), PERF = (n, ev) => ({ k: "perf", ev, n, txt: ev === "cast" ? "Führe " + n + " perfekte Würfe aus (Ring genau auf die Marke)." : "Führe " + n + " perfekte Fänge aus (Tonling nie aus der Zone lassen)." });
const PAY = (n, who) => ({ k: "pay", n, txt: "Bezahle " + n + " Noten" + (who ? " an " + who : "") + "." }), LVL = n => ({ k: "lvl", n, txt: "Erreiche Level " + n + "." }), IDX = (a, name) => ({ k: "idx", a, n: IDXN(a), txt: "Vervollständige den Index: entdecke alle " + IDXN(a) + " Arten (ohne Glorreiche) in " + name + "." });
const GIVE = (n, f, txt, o) => Object.assign({ k: "give", n, f, txt }, o || {}), ITEM = (id, txt, o) => Object.assign({ k: "item", id, n: 1, txt }, o || {});
const STREAK = n => ({ k: "streak", n, txt: "Fange " + n + " Tonlinge hintereinander mit perfektem Wurf und perfektem Fang. Jeder Fehler setzt die Serie zurück." });
function setParts(id, parts, extra) { const q = QUESTS[id]; Object.assign(q, extra || {}); q.parts = parts; q.desc = parts.map(p => p.txt).join(" "); }
setParts("m2", [C_(3, { r: 1 }, "Fange 3 ungewöhnliche (grüne) oder bessere Tonlinge.")]);
setParts("m3", [C_(3, { r: 2 }, "Fange 3 seltene (blaue) oder bessere Tonlinge."), PERF(3, "cast")], { rew: { xp: 520, gold: 200 } });
setParts("m4", [C_(1, { r: 3, a: 1 }, "Fange einen prächtigen (lila) Tonling im Klanghain."), C_(8, { a: 1 }, "Fange 8 Tonlinge im Klanghain."), PERF(2, "catch"), PAY(250, "Tilda")], { rew: { xp: 1700, gold: 300 } });
setParts("m5", [C_(10, { a: 2 }, "Fange 10 Tonlinge in den Glimmerhöhlen."), { k: "idx", a: 2, n: 6, txt: "Entdecke 6 verschiedene Arten in den Glimmerhöhlen." }, PERF(4, "cast")], { rew: { xp: 1100, gold: 450 } });
setParts("m6", [C_(5, { r: 2, a: 2 }, "Fange 5 seltene (blaue) oder bessere Tonlinge in den Glimmerhöhlen."), GIVE(4, { r: 1, a: 2 }, "Bringe Dunn 4 ungewöhnliche (grüne) Tonlinge aus den Höhlen."), GIVE(3, { sp: "funzel" }, "Bringe Kerrin 3 Funzel.", { to: "kerrin", lbl: "Funzel übergeben", thx: "Funzel! Die brauche ich zum Eichen. Sag Dunn, es ist angekommen." }), PERF(4, "catch")], { rew: { xp: 2600, gold: 900 } });
setParts("m7", [C_(1, { r: 4, a: 2 }, "Fange einen fabelhaften (gelben) Tonling in den Glimmerhöhlen."), ITEM("sonnensplitter", "Finde den Sonnensplitter in einer Nebenhöhle im Osten der Glimmerhöhlen und bringe ihn Dunn."), PERF(8, "cast"), PAY(1000, "Dunn"), LVL(20)], { rew: { xp: 7200, gold: 2500 } });
setParts("m8", [C_(4, { r: 3, a: 2 }, "Fange 4 prächtige (lila) Tonlinge in den Glimmerhöhlen."), C_(3, { mut: "moos", a: 2 }, "Fange 3 bemooste Tonlinge in den Glimmerhöhlen. Die Moosharfe lockt das Moos an."), C_(3, { sp: "dunkelwisp" }, "Fange 3 Dunkelwisps (nachts im Pilzgarten oder im Klangbecken)."), C_(3, { sp: "hallsaenger" }, "Fange 3 Hallsänger im Klangbecken oder im Kristallsaal."), PERF(8, "catch"), IDX(2, "den Glimmerhöhlen"), PAY(3000, "Dunn"), LVL(24)], { rew: { xp: 12000, gold: 5000 } });
setParts("q_okko", [C_(3, { sp: "nebeline" }, "Fange 3 Nebeline im Wald oder am Teich."), ITEM("okkopfeife", "Finde Okkos verlorene Pfeife auf einer Lichtung im Osten des Klanghains und bringe sie ihm.")]);
setParts("q_marlo", [C_(4, { r: 1 }, "Fange 4 ungewöhnliche (grüne) oder bessere Tonlinge für Marlos Stoffmuster. Danach ändert er dein Aussehen.")]);
setParts("q_ysa", [C_(4, { r: 2 }, "Fange 4 seltene (blaue) Tonlinge."), PERF(3, "cast")], { rew: { xp: 450, gold: 130, instr: "schelle" } });
setParts("q_bora", [C_(2, { sp: "laternli" }, "Fange 2 Laternli (nachts im Wald oder auf dem Hügel).")], { rew: { xp: 380, gold: 170 } });
setParts("q_mooma", [C_(3, { sp: "tautropf" }, "Fange 3 Tautropfen am Teich."), PERF(2, "catch")], { rew: { xp: 520, gold: 0, instr: "harfe" } });
setParts("q_fenn", [GIVE(2, { sp: "windspiel" }, "Bringe Fenn 2 Windspiele (vom Windhügel).")], { rew: { xp: 1000, gold: 500 } });
setParts("q_rufus", [C_(4, { sp: "gloeckli" }, "Fange 4 Glöckli auf der Wiese oder dem Windhügel.")]);
setParts("q_brum", [C_(3, { sp: "kraeusel" }, "Fange 3 Kräuselin im Wald oder auf der Wiese.")]);
setParts("q_lioba", [GIVE(1, { sp: "hallsaenger" }, "Bringe Lioba einen Hallsänger."), PERF(3, "catch")], { rew: { xp: 2000, gold: 400, instr: "glocken" } });
setParts("q_echo", [GIVE(2, { sp: "dunkelwisp" }, "Bringe Echo 2 Dunkelwisps (nachts im Pilzgarten oder im Klangbecken).")], { rew: { xp: 1500, gold: 1100 } });
setParts("q_gilda", [C_(4, { sp: "stalagnuss" }, "Fange 4 Stalagnüsse im Pilzgarten oder im Tropfsteingang."), PAY(400, "Gilda")], { rew: { xp: 1600, gold: 300, instr: "kalimba" } });
setParts("q_orla", [GIVE(3, { sp: "kristallo" }, "Bringe Orla 3 Kristallos aus dem Kristallsaal."), ITEM("kristallroehre", "Finde die verlorene Kristallröhre in einer Nebenhöhle im Westen der Glimmerhöhlen.")], { rew: { xp: 2300, gold: 400, instr: "panfloete" } });
setParts("q_stimmer", [C_(4, { r: 4 }, "Fange 4 fabelhafte (gelbe) Tonlinge. Das kann sehr lange dauern."), LVL(24)], { rew: { xp: 26000, gold: 0, instr: "urgabel" } });
/* ---- Idas E-Gitarre: Tilda bietet nach dem Sterntor eine Serien-Aufgabe an und erwähnt danach Ida (tief in der Höhle, erst dann ist sie da) ---- */
QUESTS.q_tilda_takt = { npc: "tilda", lvl: 24, after: "m8", title: "Im Takt bleiben", n: 5, f: {}, flag: "ida", desc: "", rew: { xp: 6000, gold: 2500 } };
setParts("q_tilda_takt", [STREAK(5)]);
QUESTS.ida1 = { npc: "ida", lvl: 27, after: "q_tilda_takt", title: "Erstes Riff", n: 1, f: {}, desc: "", rew: { xp: 9000, gold: 3000 } };
setParts("ida1", [PERF(20, "cast"), PERF(20, "catch"), C_(5, { mut: "urton" }, "Fange 5 Urtönende Tonlinge. Die Urgabel bringt sie hervor."), C_(10, { mut: "beto" }, "Fange 10 Betörende Tonlinge. Die Glimmergeige bringt sie hervor.")]);
QUESTS.ida2 = { npc: "ida", lvl: 27, after: "ida1", title: "Die Sonne im Verstärker", n: 1, f: {}, desc: "", rew: { xp: 16000, gold: 6000 } };
setParts("ida2", [GIVE(1, { sp: "sonnenkern", mut: "urton" }, "Bringe Ida einen Urtönenden Sonnenkern."), C_(2, { sp: "sonnenkern", mut: "klirr" }, "Fange 2 Klirrende Sonnenkerne. Die Schellentrommel bringt sie hervor.")]);
QUESTS.ida3 = { npc: "ida", lvl: 27, after: "ida2", title: "Das letzte Solo", n: 1, f: {}, desc: "", rew: { xp: 24000, gold: 0, instr: "egitarre" } };
setParts("ida3", [IDX(1, "dem Klanghain"), IDX(2, "den Glimmerhöhlen"), PAY(22222, "Ida")]);
QUESTS.q_kerrin = { npc: "kerrin", lvl: 17, title: "Glasklar gestimmt", n: 4, f: {}, rew: { xp: 4200, gold: 1500 } };
setParts("q_kerrin", [C_(3, { mut: "glas" }, "Fange 3 Gläserne Tonlinge. Die Glimmerzither lockt sie an, das Steinxylophon lockt alle Mutationen an."), C_(1, { mut: "funkel" }, "Fange einen Funkelnden Tonling. Auch hier hilft die Glimmerzither.")]);
// Bereich 3 (Sternenhöhe): je später, desto schwerer. Zahlen so gewählt, dass Bereich 3 etwa dreimal so lange dauert wie Bereich 2.
setParts("m9", [C_(14, { a: 3 }, "Fange 14 Tonlinge in der Sternenhöhe."), { k: "idx", a: 3, n: 7, txt: "Entdecke 7 verschiedene Arten in der Sternenhöhe." }, PERF(8, "cast"), PAY(1500, "Astra")], { lvl: 24, rew: { xp: 1600, gold: 1500 } });
setParts("m10", [C_(12, { r: 1, a: 3 }, "Fange 12 ungewöhnliche (grüne) oder bessere Tonlinge in der Sternenhöhe."), C_(6, { sp: "nachtkauz" }, "Fange nachts 6 Nachtkäuze an der Sternwarte oder am Mondsee."), ITEM("astrafernglas", "Finde Astras Fernglas am Nordlichtgrat und bringe es ihr."), PERF(8, "catch"), PAY(4000, "Astra")], { lvl: 26, rew: { xp: 3000, gold: 3000 } });
setParts("m11", [C_(8, { r: 2, a: 3 }, "Fange 8 seltene (blaue) oder bessere Tonlinge in der Sternenhöhe."), C_(5, { sp: "blitzling" }, "Fange 5 Blitzlinge auf dem Gewitterkamm."), GIVE(6, { r: 1, a: 3 }, "Bringe Astra 6 ungewöhnliche (grüne) Tonlinge aus der Sternenhöhe."), PERF(12, "catch"), PAY(8000, "Astra"), LVL(28)], { lvl: 28, rew: { xp: 5500, gold: 6000 } });
setParts("m12", [C_(5, { r: 3, a: 3 }, "Fange 5 prächtige (lila) Tonlinge in der Sternenhöhe."), C_(2, { mut: "glas", a: 3 }, "Fange 2 Gläserne Tonlinge in der Sternenhöhe."), C_(2, { sp: "aurorella" }, "Fange nachts 2 Aurorellas auf dem Nordlichtgrat."), { k: "idx", a: 3, n: IDXN(3) - 1, txt: "Entdecke alle Arten der Sternenhöhe bis auf die fabelhafte (" + (IDXN(3) - 1) + " von " + IDXN(3) + ")." }, PERF(14, "cast"), PAY(20000, "Astra"), LVL(32)], { lvl: 31, rew: { xp: 10000, gold: 12000 } });
setParts("m13", [C_(1, { r: 4, a: 3 }, "Fange einen fabelhaften (gelben) Tonling in der Sternenhöhe: den Weltenstern."), C_(3, { sp: "kometarius" }, "Fange 3 Kometarius auf dem Gewitterkamm oder dem Nordlichtgrat."), PERF(18, "catch"), PAY(50000, "Astra"), LVL(38)], { lvl: 34, rew: { xp: 22000, gold: 30000 } });
setParts("q_nox", [C_(5, { sp: "nachtkauz" }, "Fange nachts 5 Nachtkäuze an der Sternwarte oder am Mondsee."), PERF(6, "cast")], { lvl: 24, rew: { xp: 1500, gold: 1200 } });
setParts("q_selene", [C_(6, { sp: "mondling" }, "Fange nachts 6 Mondlinge am Mondsee oder auf dem Nordlichtgrat."), ITEM("mondperle", "Finde Selenes Mondperle am Mondsee und bringe sie ihr."), PAY(2500, "Selene")], { lvl: 26, rew: { xp: 2500, gold: 2000 } });
setParts("q_selene2", [C_(2, { sp: "aurorella" }, "Fange nachts 2 Aurorellas auf dem Nordlichtgrat."), PERF(10, "catch"), PAY(10000, "Selene"), LVL(32)], { lvl: 31, rew: { xp: 6000, gold: 0, instr: "sternenharfe" } });
setParts("q_gero", [C_(5, { sp: "blitzling" }, "Fange 5 Blitzlinge auf dem Gewitterkamm."), GIVE(4, { sp: "zirpel" }, "Bringe Gero 4 Zirpel."), ITEM("gerosgabel", "Finde Geros Stimmgabel auf dem Gewitterkamm und bringe sie ihm.")], { lvl: 27, rew: { xp: 3500, gold: 0, instr: "klangschale" } });
setParts("q_wenzel", [C_(2, { sp: "kometarius" }, "Fange 2 Kometarius auf dem Gewitterkamm oder dem Nordlichtgrat."), PERF(10, "cast"), PAY(6000, "Wenzel")], { lvl: 30, rew: { xp: 5000, gold: 4000 } });
setParts("q_zeno", [C_(6, { sp: "wolkenwal" }, "Fange 6 Wolkenwale auf dem Gewitterkamm oder am Wolkenpfad."), PERF(8, "catch")], { lvl: 28, rew: { xp: 3000, gold: 1800, instr: "glasharmonika" } });
setParts("q_astra_funkel", [C_(1, { mut: "funkel", a: 3 }, "Fange einen Funkelnden Tonling in der Sternenhöhe."), PERF(12, "cast")], { lvl: 33, rew: { xp: 8000, gold: 6000 } });
setParts("q_hueterin", [C_(5, { sp: "weltenstern" }, "Fange 5 Weltensterne. Das ist die schwerste Aufgabe in der Sternenhöhe und kann sehr, sehr lange dauern."), PERF(20, "catch"), LVL(38)], { lvl: 36, rew: { xp: 100000, gold: 0, instr: "weltenorgel" } });
// Bereiche 3 und 4: zusätzliche Aufgaben für die Hauptquests
[["m14", [PERF(6, "cast")], 0], ["m15", [PERF(6, "catch")], 0], ["m16", [PERF(10, "catch"), PAY(30000, "Mira")], 0], ["m17", [PERF(12, "catch"), PAY(60000, "Mira")], 0], ["m18", [IDX(4, "dem Rauschmeer"), PAY(100000, "Mira")], 0], ["m19", [PERF(16, "catch"), PAY(200000, "Mira"), LVL(46)], 0]
].forEach(([id, add]) => { const q = QUESTS[id]; if (!q.parts) q.parts = [{ n: q.n, f: q.f, txt: q.desc }]; q.parts = q.parts.concat(add); q.desc = q.parts.map(p => p.txt).join(" "); });

/* Welche Tonling-Art passt zum Filter */
function matchFilter(f, sp, tl) {
  if (f.sp && sp.id !== f.sp) return false;
  if (f.mut) { const m = tl && tl.mut; if (!m) return false; if (f.mut === "any" ? m === "moos" : (Array.isArray(f.mut) ? !f.mut.includes(m) : m !== f.mut)) return false; }
  if (f.r !== undefined && sp.r < f.r) return false;
  if (f.a && sp.a !== f.a) return false;
  return true;
}
