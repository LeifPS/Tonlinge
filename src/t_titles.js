/* ===== Titel und Namensschild: Titel (mit Farbverlauf) und Level über dem Kopf =====
   Titel gibt es für viele Erfolge (Fänge, Level, Seltenheit, Mutationen, perfekte Würfe, Quests, Instrumente, Index, Reichtum, Entdeckungen).
   Die Zähler stehen teils im Spielstand (S.stats), teils werden sie aus Index, Quests und Inventar berechnet. ===== */
const maxAreaNow = () => Math.max(S.maxArea || 1, S.flags.gate3Done ? 3 : 1, S.flags.gate4Done ? 4 : 1, S.flags.sanktumSeen ? 5 : 1, curArea || 1);
const idxDone = a => { const l = SPECIES.filter(s => s.a === a); return l.length > 0 && l.every(s => S.dex[s.id] && S.dex[s.id].c > 0); };
const idxProg = a => { const l = SPECIES.filter(s => s.a === a); return [l.filter(s => S.dex[s.id] && S.dex[s.id].c > 0).length, l.length]; };

/* ----- Zähler ----- */
const stN = k => (S.stats && S.stats[k]) || 0;
const dexC = id => (S.dex[id] && S.dex[id].c) || 0;
const caughtR = r => SPECIES.reduce((a, s) => a + (s.r === r ? dexC(s.id) : 0), 0);     // Fänge mit genau dieser Seltenheit (aus dem Index)
const caughtGE = r => SPECIES.reduce((a, s) => a + (s.r >= r ? dexC(s.id) : 0), 0);
const speciesR = r => { const l = SPECIES.filter(s => s.r === r); return [l.filter(s => dexC(s.id) > 0).length, l.length]; };
const dexN = () => SPECIES.filter(s => dexC(s.id) > 0).length;
const mutHas = id => ((S.stats.mutBy || {})[id] || 0) > 0 || S.inv.some(t => t.mut === id);
const mutTotal = () => Math.max(stN("muts"), S.inv.filter(t => t.mut).length);
const qDoneN = () => Object.keys(S.q).filter(id => QUESTS[id] && S.q[id].st === "done").length;
const mastN = () => S.instr.filter(id => mastLvl(id) >= MAST_MAX).length;
const mastTop = () => S.instr.reduce((a, id) => Math.max(a, mastLvl(id)), 0);
const secretN = () => Object.keys(FWALLS).filter(id => S.flags["open_" + id]).length;
const favN = () => S.inv.filter(t => t.fav).length;
const enchN = () => Object.keys(S.ench || {}).filter(k => S.ench[k]).length;

/* Zähler, die beim Spielen mitlaufen (werden aus endCatch, onPerfect, streakUpd und dem Laden aufgerufen) */
function titleCatch(tl, perfectCatch) {
  const st = S.stats; st.muts = st.muts || 0; st.mutBy = st.mutBy || {};
  if (tl.mut) { st.muts++; st.mutBy[tl.mut] = (st.mutBy[tl.mut] || 0) + 1; }
  if (isNight()) st.night = (st.night || 0) + 1;
}
function titleStreak(good) { const st = S.stats; st.streak = good ? (st.streak || 0) + 1 : 0; if (st.streak > (st.bestStreak || 0)) st.bestStreak = st.streak; }
function titlePerfect(ev) { const st = S.stats, k = ev === "cast" ? "pCast" : "pCatch"; st[k] = (st[k] || 0) + 1; }

/* ----- Farben: je Kategorie eine Palette, je besser der Titel (tier 1 bis 7), desto mehr Farben; ab 4 glitzert der Verlauf, ab 3 leuchtet er ----- */
const TCATS = [["all", "Alle"], ["fang", "Fänge"], ["lvl", "Level"], ["sel", "Seltenheit"], ["mut", "Mutationen"], ["perf", "Perfekt"], ["quest", "Quests"], ["instr", "Instrumente"], ["index", "Gebiete & Index"], ["gold", "Reichtum"], ["ent", "Entdecker"], ["bes", "Besonderes"]];
const TPAL = {
  fang: ["#7fd048", "#2f9a3a", "#d6b81e", "#1fae7c", "#a4d630"], lvl: ["#5fb0f0", "#3a76e0", "#9278f0", "#22b4de", "#6a96f4"],
  sel: ["#b57cf0", "#8a50d8", "#e8a812", "#e868b0", "#c9a0ff"], mut: ["#4ab4e8", "#e0508e", "#e8b020", "#8a58d0", "#20c8a8"],
  perf: ["#f0a020", "#f06a20", "#e84a4a", "#d6c81e", "#ff8a3a"], quest: ["#30b890", "#2a8f8a", "#d6a620", "#5a90e8", "#48c8a0"],
  instr: ["#e0a050", "#b87428", "#f07a50", "#c8b030", "#e89860"], index: ["#e0b81e", "#5a94e8", "#8a5fe0", "#e868b0", "#4ac0a8"],
  gold: ["#e8c020", "#d8960a", "#f07a1a", "#d6b81e", "#f0a830"], ent: ["#20c8a8", "#2a8cb8", "#8a5fe0", "#5a4ce0", "#40a8d8"],
  bes: ["#7088f0", "#5a4ce0", "#e868c0", "#20c8b8", "#9a78f0"]
};
const tgrad = (cat, tier) => { const p = TPAL[cat], n = [2, 2, 3, 3, 4, 4, 5, 5][tier] || 3, o = tier % 3; return Array.from({ length: n }, (_, i) => p[(i + o) % p.length]); };

const TITLES = [];
const addT = (cat, id, name, tier, d, ok, p, g) => TITLES.push({ id, name, cat, tier, d, ok, p: p || null, g: g || tgrad(cat, tier) });
const cntT = (cat, id, name, tier, goal, get, d) => addT(cat, id, name, tier, d, () => get() >= goal, () => [Math.min(get(), goal), goal]);

/* Die ersten Titel (bleiben unverändert, damit gewählte Titel erhalten bleiben) */
const OLDT = [
  { id: "i1", cat: "index", p: () => idxProg(1), name: "Hainkenner",        tier: 1, g: ["#9be07a", "#4a9a4a"],                                        d: "Index der Klanghain komplett", ok: () => idxDone(1) },
  { id: "a2", cat: "index", name: "Höhlengänger",      tier: 1, g: ["#c6b0f0", "#7a5fc0"],                                        d: "Die Glimmerhöhlen erreicht", ok: () => maxAreaNow() >= 2 },
  { id: "i2", cat: "index", p: () => idxProg(2), name: "Höhlenkundiger",    tier: 2, g: ["#d9b8ff", "#9a62e0", "#5a3aa8"],                             d: "Index der Glimmerhöhlen komplett", ok: () => idxDone(2) },
  { id: "a3", cat: "index", name: "Sternensteiger",    tier: 2, g: ["#7fb4ff", "#a47bff", "#e6a8ff"],                             d: "Die Sternenhöhe erreicht", ok: () => maxAreaNow() >= 3 },
  { id: "a4", cat: "index", name: "Meerfahrer",        tier: 3, g: ["#46e0d0", "#3a9bf0", "#6a5cff"],                             d: "Das Rauschmeer erreicht", ok: () => maxAreaNow() >= 4 },
  { id: "i3", cat: "index", p: () => idxProg(3), name: "Sternenkenner",     tier: 3, g: ["#ffe27a", "#ff9ad0", "#7fb4ff", "#a47bff"],                  d: "Index der Sternenhöhe komplett, mit Glorreichem", ok: () => idxDone(3) },
  { id: "a5", cat: "index", name: "Magierschüler",  tier: 4, g: ["#9fb6ff", "#c79bff", "#ff9ee0", "#7dffd8"],                  d: "Das Sanktum Magus betreten", ok: () => maxAreaNow() >= 5 && RELEASE.areas >= 5 },
  { id: "i5", cat: "index", p: () => idxProg(5), name: "Erzmagus",          tier: 6, g: ["#2fe0d0", "#9fb6ff", "#c79bff", "#ff6ec7", "#2fe0d0"],      d: "Index des Sanktums komplett, mit allen Erhabenen", ok: () => RELEASE.areas >= 5 && idxDone(5) },
  { id: "ger", cat: "sel", name: "Urhörer",           tier: 7, g: ["#2fe0d0", "#ffffff", "#ff6ec7", "#ffe27a", "#2fe0d0"],      d: "Einen Erhabenen gefangen", ok: () => RELEASE.areas >= 5 && SPECIES.some(s => s.r === 6 && S.dex[s.id] && S.dex[s.id].c > 0) },
  { id: "egit", cat: "instr", name: "Rockstar",        tier: 4, g: ["#fff25a", "#ff9a2a", "#ff3a6a", "#c43aff"],                  d: "Idas E-Gitarre bekommen", ok: () => S.instr.includes("egitarre") },
  { id: "i4", cat: "index", p: () => idxProg(4), name: "Herr der Gezeiten", tier: 5, g: ["#ff6b8a", "#ffd35a", "#5affb0", "#4ab8ff", "#b07aff"],       d: "Index des Rauschmeers komplett, mit Glorreichem", ok: () => idxDone(4) },
  { id: "gk", cat: "sel", name: "Sturmkönig",        tier: 6, g: ["#fff6a0", "#ff5a5a", "#e0103c", "#ffb04a", "#fff6a0"],       d: "Den Karminstern gefangen", ok: () => !!(S.dex.karminstern && S.dex.karminstern.c > 0) },
  { id: "gs", cat: "sel", name: "Seelenhirte",       tier: 6, g: ["#ffe0ea", "#ff7aa0", "#b06aff", "#6ad4ff", "#ffe0ea"],       d: "Das Seelenmeer gefangen", ok: () => !!(S.dex.seelenmeer && S.dex.seelenmeer.c > 0) },
  { id: "gg", cat: "sel", name: "Glorreiche Legende", tier: 7, g: ["#ff3a4a", "#ffd84a", "#fffbe0", "#ff7ad0", "#6ad4ff", "#ffd84a", "#ff3a4a"], d: "Beide Glorreiche gefangen: Karminstern und Seelenmeer", ok: () => !!(S.dex.karminstern && S.dex.karminstern.c > 0 && S.dex.seelenmeer && S.dex.seelenmeer.c > 0) },
];
OLDT.forEach(t => TITLES.push(t));

/* ----- Fänge ----- */
[[10, "fa10", "Lauscher", 1], [50, "fa50", "Tonsammler", 1], [100, "fa100", "Klangjäger", 2], [250, "fa250", "Fangmeister", 2], [500, "fa500", "Hortmeister", 3], [1000, "fa1k", "Tausendstimmig", 4],
 [2500, "fa2k5", "Chorleiter der Wildnis", 5], [5000, "fa5k", "Der Unermüdliche", 6], [10000, "fa10k", "Legende des Fangs", 7]]
  .forEach(([n, id, nm, t]) => cntT("fang", id, nm, t, n, () => stN("catches"), n + " Tonlinge gefangen"));
[[500, "tr500", "Dauerspieler", 1], [3000, "tr3k", "Ausdauernd", 3], [10000, "tr10k", "Ohne Pause", 5]].forEach(([n, id, nm, t]) => cntT("fang", id, nm, t, n, () => stN("tries"), n + " Mal ein Instrument gespielt"));
[[50, "fl50", "Pechvogel", 1], [250, "fl250", "Zähes Gemüt", 2], [1000, "fl1k", "Ewiger Optimist", 3]].forEach(([n, id, nm, t]) => cntT("fang", id, nm, t, n, () => stN("fled"), n + " Tonlinge entwischt"));

/* ----- Level ----- */
[[5, "Lehrling", 1], [10, "Wanderer", 1], [20, "Musikant", 2], [30, "Virtuose", 2], [40, "Klangmeister", 3], [50, "Wegbereiter", 3], [60, "Abgeklärt", 4], [70, "Altmeister", 4], [80, "Maestro", 5], [90, "Urmeister", 6], [100, "Ewiges Echo", 7]]
  .forEach(([n, nm, t]) => cntT("lvl", "lv" + n, nm, t, n, () => S.lvl, "Level " + n + " erreicht"));

/* ----- Seltenheit ----- */
addT("sel", "se1", "Seltenfinder", 1, "Einen seltenen (blauen) Tonling gefangen", () => caughtGE(2) >= 1);
cntT("sel", "se25", "Blauauge", 2, 25, () => caughtR(2), "25 Seltene gefangen");
addT("sel", "sp1", "Prachtfund", 2, "Einen prächtigen (lila) Tonling gefangen", () => caughtGE(3) >= 1);
cntT("sel", "sp10", "Violettjäger", 3, 10, () => caughtR(3), "10 Prächtige gefangen");
cntT("sel", "sp50", "Lila Legende", 4, 50, () => caughtR(3), "50 Prächtige gefangen");
addT("sel", "sf1", "Goldohr", 3, "Einen fabelhaften (gelben) Tonling gefangen", () => caughtGE(4) >= 1);
cntT("sel", "sf5", "Goldgräber", 4, 5, () => caughtR(4), "5 Fabelhafte gefangen");
cntT("sel", "sf25", "Goldrausch", 5, 25, () => caughtR(4), "25 Fabelhafte gefangen");
addT("sel", "sg1", "Rotes Licht", 5, "Einen glorreichen (roten) Tonling gefangen", () => caughtGE(5) >= 1);
cntT("sel", "sg5", "Purpurfürst", 6, 5, () => caughtR(5), "5 Glorreiche gefangen");
cntT("sel", "sg10", "Herr des Glorreichen", 7, 10, () => caughtR(5), "10 Glorreiche gefangen");
cntT("sel", "se3", "Erhabener Zeuge", 7, 3, () => caughtR(6), "3 Erhabene gefangen");
addT("sel", "sbow", "Regenbogen", 4, "Jede Seltenheit von gewöhnlich bis glorreich mindestens einmal gefangen", () => [0, 1, 2, 3, 4, 5].every(r => caughtR(r) > 0), () => [[0, 1, 2, 3, 4, 5].filter(r => caughtR(r) > 0).length, 6]);
[[3, "sall3", "Prächtiger Kreis", 4, "Alle prächtigen Arten gefangen"], [4, "sall4", "Goldene Runde", 5, "Alle fabelhaften Arten gefangen"], [5, "sall5", "Rotes Quintett", 6, "Alle glorreichen Arten gefangen"], [6, "sall6", "Dreiklang der Erhabenen", 7, "Alle erhabenen Arten gefangen"]]
  .forEach(([r, id, nm, t, d]) => addT("sel", id, nm, t, d, () => { const q = speciesR(r); return q[1] > 0 && q[0] >= q[1]; }, () => speciesR(r)));

/* ----- Mutationen ----- */
cntT("mut", "mu1", "Zeichensucher", 1, 1, mutTotal, "Einen mutierten Tonling gefangen");
cntT("mut", "mu10", "Mutationsforscher", 2, 10, mutTotal, "10 mutierte Tonlinge gefangen");
cntT("mut", "mu50", "Wandlungskünstler", 3, 50, mutTotal, "50 mutierte Tonlinge gefangen");
cntT("mut", "mu150", "Meister der Wandlung", 5, 150, mutTotal, "150 mutierte Tonlinge gefangen");
[["glas", "Glasbläser", 1], ["funkel", "Funkenfänger", 2], ["moos", "Moosflüsterer", 2], ["runen", "Runenleser", 2], ["klirr", "Klirrmeister", 2], ["beto", "Betörer", 2], ["elec", "Starkstrom", 2],
 ["stern", "Sternenfischer", 3], ["urton", "Urtöner", 3], ["himmel", "Himmelsrufer", 4], ["leucht", "Lichtträger", 4], ["irr", "Irrlichtjäger", 4], ["arkan", "Arkanist", 5], ["folio", "Schriftgelehrter", 5],
 ["astral", "Astralwandler", 6], ["urwort", "Urwörtler", 6]].forEach(([id, nm, t]) => { const m = MUTS.find(x => x.id === id); if (m) addT("mut", "m_" + id, nm, t, "Die Mutation „" + m.name + "“ gefangen", () => mutHas(id)); });
addT("mut", "mall", "Sammler der Zeichen", 7, "Jede Mutation mindestens einmal gefangen", () => MUTS.every(m => mutHas(m.id)), () => [MUTS.filter(m => mutHas(m.id)).length, MUTS.length]);

/* ----- Perfekte Würfe, Fänge und Serien ----- */
[[25, "pw25", "Taktgefühl", 1], [100, "pw100", "Metronom", 2], [500, "pw500", "Präzisionsarbeiter", 3], [2000, "pw2k", "Uhrwerk", 5]].forEach(([n, id, nm, t]) => cntT("perf", id, nm, t, n, () => stN("pCast"), n + " perfekte Würfe"));
[[25, "pf25", "Ruhige Hand", 1], [100, "pf100", "Felsenfest", 2], [500, "pf500", "Unerschütterlich", 4], [2000, "pf2k", "Eisern", 5]].forEach(([n, id, nm, t]) => cntT("perf", id, nm, t, n, () => stN("pCatch"), n + " perfekte Fänge"));
[[5, "sr5", "Auf Kurs", 2], [10, "sr10", "Im Fluss", 3], [20, "sr20", "Im Rausch", 4], [30, "sr30", "Unaufhaltsam", 5], [50, "sr50", "Makellos", 6], [100, "sr100", "Perfektionist", 7]]
  .forEach(([n, id, nm, t]) => cntT("perf", id, nm, t, n, () => stN("bestStreak"), "Serie von " + n + " perfekten Würfen und Fängen in Folge"));

/* ----- Quests ----- */
[[10, "qn10", "Helfer", 1], [25, "qn25", "Dorfheld", 2], [50, "qn50", "Problemlöser", 3], [100, "qn100", "Allzeitbereit", 4]].forEach(([n, id, nm, t]) => cntT("quest", id, nm, t, n, qDoneN, n + " Quests abgeschlossen"));
addT("quest", "qmain", "Heldenlied", 5, "Alle Hauptquests abgeschlossen", () => Object.keys(QUESTS).filter(id => QUESTS[id].main && (!QUESTS[id].rel || QUESTS[id].rel <= RELEASE.areas)).every(qDone),
  () => { const l = Object.keys(QUESTS).filter(id => QUESTS[id].main && (!QUESTS[id].rel || QUESTS[id].rel <= RELEASE.areas)); return [l.filter(qDone).length, l.length]; });
addT("quest", "qall", "Chronist der Töne", 7, "Alle Quests abgeschlossen", () => Object.keys(QUESTS).filter(id => !QUESTS[id].rel || QUESTS[id].rel <= RELEASE.areas).every(qDone),
  () => { const l = Object.keys(QUESTS).filter(id => !QUESTS[id].rel || QUESTS[id].rel <= RELEASE.areas); return [l.filter(qDone).length, l.length]; });
[["m4", "Höhlenöffner", 1], ["m7", "Goldener Ton", 3], ["m8", "Sternenpfader", 3], ["m12", "Nordlichtjäger", 3], ["m13", "Schlusston", 4], ["m19", "Abgrundtöner", 5], ["q_echoaltar", "Echohörer", 3],
 ["q_hueterin", "Weltenlied", 5], ["q_tiefa2", "Königsfänger", 4], ["q_lenz20", "Lenz' Meisterstück", 3], ["kz1", "Konzertgänger", 3], ["kz3", "Himmelsmusiker", 5], ["ida1", "Idas Lehrling", 3],
 ["ida3", "Solist", 5], ["q_stimmer", "Urgabelträger", 4], ["l7", "Strophenhüter", 5], ["kt3", "Tiefenlied", 5], ["sg3", "Siegelbrecher", 5], ["wi3", "Irrlichtflöter", 4], ["ko3", "Runenharfner", 4],
 ["me3", "Foliantenorgler", 5], ["or3", "Sternkartograf", 6], ["fi2", "Sanktumkenner", 6], ["sc3", "Wortträger", 7]]
  .forEach(([id, nm, t]) => { if (QUESTS[id]) addT("quest", "q_" + id, nm, t, "Quest „" + QUESTS[id].title + "“ abgeschlossen", () => qDone(id)); });

/* ----- Instrumente, Meisterschaft, Verzauberung ----- */
[[3, "in3", "Musikant mit Gepäck", 1], [8, "in8", "Beutelträger", 2], [15, "in15", "Sammler der Klänge", 3], [25, "in25", "Instrumentenkammer", 4], [30, "in30", "Orchesterleiter", 5]]
  .forEach(([n, id, nm, t]) => cntT("instr", id, nm, t, n, () => S.instr.length, n + " Instrumente besitzen"));
addT("instr", "ma1", "Übung macht", 1, "Ein Instrument auf Meisterschaft 1 gebracht", () => mastTop() >= 1);
cntT("instr", "ma4", "Hochbegabt", 2, 4, mastTop, "Ein Instrument auf Meisterschaft 4 gebracht");
cntT("instr", "ma8", "Meisterhand", 3, 1, mastN, "Ein Instrument auf Meisterschaft 8 gebracht");
cntT("instr", "ma8x3", "Vielseitig", 4, 3, mastN, "3 Instrumente auf Meisterschaft 8 gebracht");
cntT("instr", "ma8x8", "Orchestermeister", 6, 8, mastN, "8 Instrumente auf Meisterschaft 8 gebracht");
cntT("instr", "en1", "Verzauberer", 2, 1, enchN, "Ein Instrument verzaubert");
cntT("instr", "en5", "Runenmeister", 4, 5, enchN, "5 Instrumente verzaubert");
[["urgabel", "Gabelträger", 3], ["sternenharfe", "Sternenharfner", 4], ["himmelscello", "Himmelsstreicher", 4], ["leuchtfanfare", "Lichtbläser", 4], ["irrlichtfloete", "Irrlichtflötist", 4], ["runenharfe", "Runenspieler", 4],
 ["weltenorgel", "Orgelherr", 5], ["urmeerchor", "Chorführer", 5], ["foliantenorgel", "Folianten-Organist", 5], ["astrolabium", "Sterndeuter", 6], ["erstewort", "Urwort-Träger", 7]]
  .forEach(([id, nm, t]) => { if (INSTR[id]) addT("instr", "i_" + id, nm, t, INSTR[id].name + " bekommen", () => S.instr.includes(id)); });
const egT = TITLES.find(t => t.id === "egit"); if (egT) egT.d = "Idas E-Gitarre bekommen";

/* ----- Index ----- */
cntT("index", "dx25", "Neugieriger", 1, 25, dexN, "25 verschiedene Arten gefangen");
cntT("index", "dx50", "Beobachter", 2, 50, dexN, "50 verschiedene Arten gefangen");
cntT("index", "dx70", "Forscher", 4, 70, dexN, "70 verschiedene Arten gefangen");
addT("index", "dxall", "Allwissender Lauscher", 7, "Jede Art im ganzen Spiel gefangen", () => dexN() >= SPECIES.length, () => [dexN(), SPECIES.length]);

/* ----- Reichtum ----- */
[[1000, "g1k", "Sparschwein", 1], [10000, "g10k", "Notenbeutel", 1], [100000, "g100k", "Wohlhabend", 3], [1000000, "g1m", "Millionär", 4], [10000000, "g10m", "Multimillionär", 5], [50000000, "g50m", "Notenfürst", 6]]
  .forEach(([n, id, nm, t]) => cntT("gold", id, nm, t, n, () => stN("maxGold"), n.toLocaleString("de-DE") + " Noten auf einmal besessen"));
[[50, "so50", "Händler", 1], [250, "so250", "Marktschreier", 2], [1000, "so1k", "Handelsfürst", 4], [5000, "so5k", "Marktkönig", 5]].forEach(([n, id, nm, t]) => cntT("gold", id, nm, t, n, () => stN("sold"), n + " Tonlinge verkauft"));

/* ----- Entdecker ----- */
[[1, "se_1", "Wandklopfer", 2, "Einen geheimen Raum geöffnet"], [3, "se_3", "Geheimniskrämer", 3, "3 geheime Räume geöffnet"], [6, "se_6", "Hüter der Geheimnisse", 5, "Alle 6 geheimen Räume geöffnet"]]
  .forEach(([n, id, nm, t, d]) => cntT("ent", id, nm, t, n, secretN, d));

/* ----- Besonderes ----- */
[[50, "nb50", "Nachteule", 2], [250, "nb250", "Mondläufer", 3], [1000, "nb1k", "Kind der Nacht", 5]].forEach(([n, id, nm, t]) => cntT("bes", id, nm, t, n, () => stN("night"), n + " Tonlinge nachts gefangen"));
[[5, "fv5", "Herzensfänger", 2], [20, "fv20", "Sammlerherz", 3]].forEach(([n, id, nm, t]) => cntT("bes", id, nm, t, n, favN, n + " Tonlinge als Favorit markiert"));

const TITLE = Object.fromEntries(TITLES.map(t => [t.id, t]));
const tCatCnt = c => TITLES.filter(t => c === "all" || t.cat === c);
let titleT = 0;
function titleTick(dt) {
  if (!S.flags.created) return; titleT -= dt; if (titleT > 0) return; titleT = 2;
  const ma = maxAreaNow(); if (ma > (S.maxArea || 1)) { S.maxArea = ma; save(); }
  if (S.gold > stN("maxGold")) S.stats.maxGold = S.gold;
  const have = TITLES.filter(t => t.ok()).map(t => t.id);
  if (!S.tseen) { S.tseen = have.slice(); S.tview = have.slice(); save(); if (have.length) toast("Du hast " + have.length + " Titel. Wähle sie im Inventar unter „Titel wählen“.", false, 5500); return; }
  if (!S.tview) S.tview = S.tseen.slice();
  const nw = have.filter(id => !S.tseen.includes(id)); if (!nw.length) return;
  S.tseen = S.tseen.concat(nw); save();
  if (nw.length > 3) toast(nw.length + " neue Titel freigeschaltet (Inventar, Titel wählen)", false, 6500);
  else nw.forEach(id => toast("Neuer Titel: " + TITLE[id].name + " (im Inventar ausrüsten)", false, 6000));
}
function titleFill(c, ti, x, y, w, t) {
  const n = ti.g.length; if (ti.tier >= 4) { const sh = (t * (ti.tier >= 6 ? 110 : ti.tier >= 5 ? 70 : 45)) % w, cols = ti.g.concat(ti.g[0]), gr = c.createLinearGradient(x - w / 2 - sh, 0, x - w / 2 - sh + 2 * w, 0); const m = cols.length - 1; for (let r = 0; r < 2; r++) cols.forEach((col, i) => gr.addColorStop(Math.min(1, (r * m + i) / (2 * m)), col)); return gr; }
  const gr = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); ti.g.forEach((col, i) => gr.addColorStop(n > 1 ? i / (n - 1) : 0, col)); return gr;
}
/* Namensschild: oben der Titel mit Verlauf, darunter "Name · Lv 12". y ist die Grundlinie der Namenszeile. */
function drawNameTag(c, x, y, name, lvl, titleId, t) {
  const ti = TITLE[titleId]; c.save(); c.textAlign = "center"; c.lineJoin = "round";
  const line = (name || "") + (lvl ? "  ·  Lv " + lvl : "");
  c.font = "17px 'Patrick Hand',cursive"; c.lineWidth = 5; c.strokeStyle = "rgba(250,244,226,.97)"; c.strokeText(line, x, y); c.fillStyle = INK; c.fillText(line, x, y);
  if (ti) { const fs = 10 + ti.tier * 1.1; c.font = fs + "px 'Caveat Brush',cursive"; const w = Math.max(40, c.measureText(ti.name).width), ty = y - 19;
    c.lineWidth = 4.5; c.strokeStyle = "rgba(29,39,66,.92)"; c.strokeText(ti.name, x, ty);
    if (ti.tier >= 3) { c.shadowColor = ti.g[Math.floor((t * 1.5) % ti.g.length)]; c.shadowBlur = ti.tier >= 6 ? 13 : ti.tier >= 5 ? 8 : 5; }
    c.fillStyle = titleFill(c, ti, x, ty, w, t || 0); c.fillText(ti.name, x, ty); }
  c.restore();
}
const titleCss = ti => "background:linear-gradient(90deg," + ti.g.join(",") + ");-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-stroke:.6px rgba(29,39,66,.55);font-family:'Caveat Brush',cursive;font-size:" + (19 + ti.tier) + "px";

/* ----- Titel wählen (eigenes Fenster mit Kategorien) ----- */
const fmtT = n => Math.round(n).toLocaleString("de-DE");
let tCat = "all", tLocked = true;
function titleHtml() {
  const cur = TITLE[S.title], have = TITLES.filter(t => t.ok()), nw = have.filter(t => !(S.tview || []).includes(t.id)).length;
  return `<div style="margin-top:12px;border-top:2px dashed var(--ink);padding-top:8px;display:flex;align-items:center;gap:10px;flex-wrap:wrap"><b style="font-weight:400;font-size:21px">Titel</b><span style="${cur ? titleCss(cur) : ""}">${cur ? cur.name : "Kein Titel"}</span><button class="btn" data-tiopen style="min-height:34px;padding:2px 12px">Titel wählen (${have.length} von ${TITLES.length})${nw ? ` · ${nw} neu` : ""}</button><span class="muted" style="font-size:16px">Andere sehen ihn über deinem Kopf.</span></div>`;
}
function titleBind(render) { const wb = $("winBody"); wb.querySelectorAll("[data-tiopen]").forEach(b => b.onclick = () => openTitles(render)); }
function openTitles(back) {
  winKind = "titles";
  const have = TITLES.filter(t => t.ok()), haveSet = new Set(have.map(t => t.id)), viewed = S.tview || [], cur = TITLE[S.title];
  let list = TITLES.filter(t => (tCat === "all" || t.cat === tCat) && (tLocked || haveSet.has(t.id)));
  const frac = t => { const p = t.p && t.p(); return p ? p[0] / Math.max(1, p[1]) : 0; };
  list.sort((a, b) => { const x = haveSet.has(a.id), y = haveSet.has(b.id); if (x !== y) return x ? -1 : 1; return x ? (tCat === "all" ? b.tier - a.tier : a.tier - b.tier) || a.name.localeCompare(b.name) : frac(b) - frac(a) || a.tier - b.tier; });
  const chip = ([id, label]) => { const all = tCatCnt(id), got = all.filter(t => haveSet.has(t.id)).length; return `<button class="btn" data-tc="${id}" aria-pressed="${tCat === id}" style="min-height:30px;padding:1px 10px;font-size:16px;${tCat === id ? "background:var(--marker);" : ""}">${label} <small>${got}/${all.length}</small></button>`; };
  const card = t => { const on = haveSet.has(t.id), eq = S.title === t.id, p = on ? null : t.p && t.p(), isNew = on && !viewed.includes(t.id);
    return `<button class="btn tcard ${eq ? "eq" : ""} ${on ? "" : "lock"}" data-tpick="${t.id}" ${on ? "" : "disabled"}><span style="${titleCss(t)}">${t.name}</span>${isNew ? '<em class="tnew">neu</em>' : ""}<small>${t.d}</small>${p ? `<span class="tbar"><i style="width:${Math.round(100 * p[0] / Math.max(1, p[1]))}%"></i></span><small>${fmtT(p[0])} / ${fmtT(p[1])}</small>` : ""}${eq ? "<small>● getragen</small>" : ""}</button>`; };
  const h = `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">${back ? `<button class="btn" data-tback style="min-height:32px">‹ Zurück</button>` : ""}<span>Getragen: <span style="${cur ? titleCss(cur) : ""}">${cur ? cur.name : "Kein Titel"}</span></span><button class="btn" data-tpick="" style="min-height:32px;${S.title ? "" : "background:var(--marker)"}">Kein Titel</button><span class="muted" style="margin-left:auto">${have.length} von ${TITLES.length} freigeschaltet</span></div>
    <div class="tchips">${TCATS.map(chip).join("")}</div>
    <label style="font-size:16px;cursor:pointer"><input type="checkbox" data-tl ${tLocked ? "checked" : ""}> Gesperrte Titel zeigen</label>
    <div class="tgrid">${list.map(card).join("") || '<p class="muted">Hier gibt es noch nichts.</p>'}</div>`;
  const wb0 = $("winBody") && $("winBody").scrollTop;
  openWin("Titel", h, () => {
    const wb = $("winBody"); wb.scrollTop = wb0 || 0;
    wb.querySelectorAll("[data-tc]").forEach(b => b.onclick = () => { tCat = b.dataset.tc; Snd.play("klick", 1, .3); openTitles(back); });
    const tl = wb.querySelector("[data-tl]"); if (tl) tl.onchange = () => { tLocked = tl.checked; openTitles(back); };
    wb.querySelectorAll("[data-tpick]").forEach(b => b.onclick = () => { S.title = b.dataset.tpick; save(); Snd.play("klick", 1, .4); openTitles(back); });
    const bk = wb.querySelector("[data-tback]"); if (bk) bk.onclick = () => back();
    S.tview = have.map(t => t.id); save();
  });
}
