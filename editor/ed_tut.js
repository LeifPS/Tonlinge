/* ===== Interaktives Tutorial: dein erstes Gebiet von Anfang bis Ende ===== */
const TUTKEY = "tonlinge-ed-tut";
const cntT = v => { let n = 0; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (T[y][x] === v) n++; return n; };
const cntOB = () => { let n = 0; for (let i = 0; i < WW * WH; i++) if (OB[i]) n++; return n; };
const grKinds = () => { const s = new Set(); for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (T[y][x] === 1 && GR[y * WW + x]) s.add(GR[y * WW + x]); return s.size; };
const cntZoneNew = () => { let n = 0; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) { const z = ZN[y][x]; if (z && z !== "wiese") n++; } return n; };
const did = k => !!(ED.did && ED.did[k]);
const custInstr = () => Object.keys(INSTR).filter(k => k !== "holz");
const TUT_STEPS = [
  { ch: "Willkommen", id: "name", t: "Gib deiner Welt einen Namen", go: null, x: "Oben links steht das Feld mit dem Namen deines Projekts. **Klicke hinein und schreibe einen eigenen Namen.** Dieser Name steckt später auch im Dateinamen beim Speichern.", ok: () => ED.name !== "Neues Spiel" && ED.name !== "Meine Welt" },
  { ch: "Willkommen", id: "title", t: "Gib dem Spiel einen Titel", go: "einst", x: "Unter **Spiel & Regeln › Einstellungen** gibt es das Feld „Titel des Spiels“. Er erscheint im Browser-Tab und auf dem Startbildschirm. **Ändere ihn.**", ok: () => GAME.title !== "Mein Spiel" },
  { ch: "Die Insel formen", id: "openmap", t: "Öffne die Weltkarte", go: "welt", x: "Das ist deine Bühne. Links wählst du Werkzeug und Ebene. **Leertaste halten oder rechte Maustaste** verschiebt die Karte, das **Mausrad** zoomt. Strg+Z macht alles rückgängig. **Öffne die Weltkarte.**", ok: () => did("tab_welt") },
  { ch: "Die Insel formen", id: "grow", t: "Vergrößere die Insel", go: "welt", x: "Wähle die Ebene **Gelände** (Taste 1), das Werkzeug **Pinsel** (B) und den Typ „Boden“. **Male rund um die Wiese mindestens 120 neue Felder.** Mit [ und ] änderst du die Pinselgröße. Die Fläche (R) und Ellipse (E) gehen schneller.", ok: () => cntT(1) >= (ED.tut.base.t1 || 0) + 120 },
  { ch: "Die Insel formen", id: "grounds", t: "Mische mehrere Böden", go: "welt", x: "Wechsle zur Ebene **Boden** (Taste 2). Hier bestimmst du, wie der Untergrund aussieht, nicht ob man ihn betreten kann. **Male mit zwei weiteren Böden** (zum Beispiel Sand und Erde oder eine Blumenwiese) auf die Insel. Alle Böden des großen Spiels sind in der Palette, die Bibliothek zeigt sie als Bilder.", ok: () => grKinds() >= 3 },
  { ch: "Die Insel formen", id: "water", t: "Lege einen Teich an", go: "welt", x: "Zurück zur Ebene **Gelände** (1). Wähle den Typ **Wasser** und male einen kleinen Teich (mindestens 15 Felder). Wasser kann man nicht betreten, so formst du Wege und Grenzen.", ok: () => cntT(3) >= 15 },
  { ch: "Die Insel formen", id: "deco", t: "Dekoriere mit Objekten", go: "welt", x: "Ebene **Objekte** (Taste 3): Bäume, Büsche, Steine, Blumen, Zäune. **Platziere mindestens 12 Objekte.** Tipp: Mit Alt malst du Objekte wieder weg. Mit „Auswahl“ (S) kopierst du schöne Ecken.", ok: () => cntOB() >= 12 },
  { ch: "Bereich und Zone", id: "area", t: "Benenne deinen Bereich", go: "bereiche", x: "Ein **Bereich** ist eine große Gegend. Du hast einen: Nummer 1. **Gib ihm einen neuen Namen** (er steht bei Bereich 1 im Feld „Name“). Außerdem kannst du Erfahrungsfaktor und Stimmung einstellen.", ok: () => AREAS[1].name !== "Mein Land" },
  { ch: "Bereich und Zone", id: "zone", t: "Lege eine neue Zone an", go: "zonen", x: "Eine **Zone** ist ein Lebensraum, in dem bestimmte Tonlinge vorkommen (Wiese, Wald, Höhle). **Klicke auf „+ Neu“** und lege zum Beispiel „Blumenwald“ an. Wähle den Bereich 1.", ok: () => Object.keys(ZINFO).length >= 2 },
  { ch: "Bereich und Zone", id: "zonepaint", t: "Male die Zone auf die Karte", go: "welt", x: "Auf der Karte, Ebene **Zone** (Taste 5): Wähle deine neue Zone und **male sie auf mindestens 25 Felder**. Nur dort erscheinen ihre Tonlinge. Die Wiese bleibt der Rest der Insel.", ok: () => cntZoneNew() >= 25 },
  { ch: "Tonlinge", id: "sp1", t: "Erfinde deinen ersten Tonling", go: "tonlinge", x: "**Klicke auf „+ Neu“**, gib einen Namen ein. Rechts stellst du Form, Farben, Frequenz (die Tonhöhe, mit der man ihn lockt), Wert und Schwierigkeit ein. Alternativ kopiert „+ Aus großem Spiel“ einen der 53 alten.", ok: () => SPECIES.length >= 1 },
  { ch: "Tonlinge", id: "habitat", t: "Gib ihm deine neue Zone als Lebensraum", go: "tonlinge", x: "Bei **Lebensraum** (Zonen) wählst du, wo er lebt. **Hake deine neue Zone an.** Ein Tonling kann in mehreren Zonen leben.", ok: () => SPECIES.some(s => (s.z || []).some(z => z !== "wiese" && ZINFO[z])) },
  { ch: "Tonlinge", id: "sp3", t: "Mache es drei Arten", go: "bibliothek", x: "Ein Gebiet braucht Vielfalt. **Lege bis zu drei Arten an.** Neu erfinden oder in der **Bibliothek** einen alten Tonling ansehen und kopieren. Vergiss nicht, jeweils den Lebensraum zu setzen (Wiese oder deine Zone).", ok: () => SPECIES.length >= 3 },
  { ch: "Tonlinge", id: "rare", t: "Mache eine Art selten", go: "tonlinge", x: "Bei **Seltenheit** wählst du eine höhere Stufe als „häufig“. Seltene Arten erscheinen seltener, geben aber mehr Wert und Erfahrung. Eigene Seltenheitsstufen baust du in „Spawns & Seltenheiten“.", ok: () => SPECIES.some(s => s.r >= 1) },
  { ch: "Tonlinge", id: "spawns", t: "Prüfe die Spawn-Chancen", go: "spawns", x: "Hier siehst du **in Prozent, wie oft** jeder Tonling in jeder Zone erscheint, getrennt nach Tag und Nacht. **Öffne die Seite** und achte darauf, dass jede Zone mindestens einen Tonling hat.", ok: () => did("tab_spawns") },
  { ch: "Instrumente", id: "instr", t: "Baue dein erstes Instrument", go: "instr", x: "Mit Instrumenten lockt man Tonlinge. **Klicke auf „+ Neu“.** Du stellst Werte ein (Gehör, Präzision, Harmonie, Glück, Takt), dazu Aussehen und Lied. „Symbol aus großem Spiel“ holt ein fertiges Bild.", ok: () => custInstr().length >= 1 },
  { ch: "Instrumente", id: "instrlook", t: "Gib ihm ein eigenes Gesicht", go: "instr", x: "**Wähle ein anderes Symbol als die Flöte** oder gib dem Instrument eine Fähigkeit (Passiv). Fähigkeiten kannst du unter „Fähigkeiten“ selbst bauen.", ok: () => custInstr().some(k => INSTR[k].pas || (INSTR[k].kind && INSTR[k].kind !== "flute")) },
  { ch: "Figuren und Aufgaben", id: "npc", t: "Stelle eine Figur in dein Gebiet", go: "npcs", x: "**Klicke auf „+ Neu“** und gib ihr einen Namen. Mit **„Auf der Karte zeigen“** findest du sie und setzt sie an den richtigen Ort (oder nimm das N-Werkzeug auf der Karte). Der NPC muss auf begehbarem Boden stehen, sonst warnt dich „Prüfen“.", ok: () => Object.keys(NPCS).length >= 1 },
  { ch: "Figuren und Aufgaben", id: "npclook", t: "Gib ihr ein Aussehen", go: "npcs", x: "Reiter „Aussehen“: Haare, Haut, Kleidung, Hut, Bart, Brille. **Würfle zufällig oder kopiere** das Aussehen einer Figur des großen Spiels und ändere etwas.", ok: () => Object.keys(NPCS).some(k => NPC_LOOK[k] && Object.keys(NPC_LOOK[k]).length) },
  { ch: "Figuren und Aufgaben", id: "quest", t: "Schreibe eine Aufgabe", go: "quests", x: "**Klicke auf „+ Neu“.** Wähle den NPC, der sie vergibt, das Mindestlevel und die Teile (zum Beispiel „Fange 3 Tonlinge deiner neuen Art“). Schreibe Angebots-, Erinnerungs- und Dank-Text selbst.", ok: () => Object.keys(QUESTS).some(k => NPCS[QUESTS[k].npc]) },
  { ch: "Figuren und Aufgaben", id: "reward", t: "Belohne mit deinem Instrument", go: "quests", x: "Bei **Belohnung** gibt es ein Feld „Instrument“. **Wähle dein eigenes Instrument.** So bekommt man es in deinem Gebiet. Dazu Erfahrung und Gold nach Geschmack.", ok: () => Object.keys(QUESTS).some(k => QUESTS[k].rew && QUESTS[k].rew.instr && QUESTS[k].rew.instr !== "holz" && INSTR[QUESTS[k].rew.instr]) },
  { ch: "Figuren und Aufgaben", id: "shop", t: "Eröffne einen Laden", go: "laeden", x: "**Lege unter „Läden“ einen Laden an**, füge dein Instrument mit einem Preis hinzu und **weise ihn dann in „NPCs“ einer Figur zu** (Feld „Laden“). So kann man es auch kaufen.", ok: () => Object.keys(NPCS).some(k => NPCS[k].shop && SHOPS[NPCS[k].shop] && (SHOPS[NPCS[k].shop].items || []).length) },
  { ch: "Figuren und Aufgaben", id: "item", t: "Verstecke ein Fundstück", go: "items", x: "Fundstücke liegen auf der Karte und können Aufgabenziele sein. **Lege eines mit „+ Neu“ an**, wähle ein Symbol und setze es auf begehbaren Boden.", ok: () => Object.keys(ITEMS).length >= 1 },
  { ch: "Start und Fertigstellen", id: "start", t: "Stelle den Spielstart ein", go: "figur", x: "In **Spielfigur & Start** legst du Aussehen der Spielerfigur, Start-Instrumente, Startgold und Startlevel fest. **Öffne die Seite** und sieh dir alles an. Der Startpunkt selbst ist der Marker auf der Karte.", ok: () => did("tab_figur") },
  { ch: "Start und Fertigstellen", id: "check", t: "Lass das Spiel prüfen", go: "pruefen", x: "„Prüfen“ findet unerreichbare Figuren, fehlende Verweise und Tonlinge ohne Lebensraum. **Öffne die Seite und beseitige alle roten Punkte.**", ok: () => did("tab_pruefen") && !validate().some(v => v.lv === "bad") },
  { ch: "Start und Fertigstellen", id: "play", t: "Spiele es", go: null, x: "Oben auf **„▶ Testspiel“** klicken. Laufe herum, fange einen Tonling, sprich mit deiner Figur, erledige die Aufgabe. Zurück zum Editor kommst du über das Schließen des Testspiels.", ok: () => did("play") },
  { ch: "Start und Fertigstellen", id: "save", t: "Speichere dein Projekt", go: null, x: "Oben auf **„Speichern“**. Du bekommst eine Datei .tonlinge.json. Sie lässt sich mit „Öffnen“ wieder laden und im Spiel über Hilfe › Projektdatei laden.", ok: () => did("save") }
];
ED.tut = { on: false, done: {}, skip: {}, base: {}, view: -1, min: false, list: false };
try { const s = JSON.parse(localStorage.getItem(TUTKEY) || "null"); if (s && s.on) Object.assign(ED.tut, s); } catch (e) { }
function tutSave() { try { localStorage.setItem(TUTKEY, JSON.stringify(ED.tut)); } catch (e) { } }
function tutCur() { const i = TUT_STEPS.findIndex(s => !ED.tut.done[s.id] && !ED.tut.skip[s.id]); return i; }
const tutFmt = t => String(t).split("**").map((p, i) => i % 2 ? h("b", null, p) : p);
let tutSig = "";
function tutPoll() {
  if (!ED.tut.on) return; ED.did = ED.did || {}; ED.did["tab_" + ED.tab] = 1;
  const before = tutCur(); let changed = false;
  TUT_STEPS.forEach(s => { if (ED.tut.done[s.id]) return; let v = false; try { v = !!s.ok(); } catch (e) { } if (v) { ED.tut.done[s.id] = 1; changed = true; if (TUT_STEPS.indexOf(s) === before) toast("✓ Geschafft: " + s.t); } });
  if (changed) { ED.tut.view = -1; tutSave(); }
  tutRender();
}
function tutRender() {
  let el = document.getElementById("tut"); if (!ED.tut.on) { if (el) el.remove(); return; }
  const cur = tutCur(), view = ED.tut.view >= 0 ? ED.tut.view : cur, nDone = TUT_STEPS.filter(s => ED.tut.done[s.id] || ED.tut.skip[s.id]).length;
  const sig = [cur, view, nDone, ED.tut.min, ED.tut.list, ED.tab].join("|"); if (el && sig === tutSig) return; tutSig = sig;
  if (!el) { el = h("div", { id: "tut", class: "card", style: { position: "fixed", right: "12px", bottom: "12px", width: "min(380px, calc(100vw - 24px))", maxHeight: "62vh", overflow: "auto", zIndex: "50", boxShadow: "0 6px 24px rgba(0,0,0,.35)" } }); document.body.append(el); }
  el.innerHTML = "";
  const pct = Math.round(nDone / TUT_STEPS.length * 100), s = TUT_STEPS[view >= 0 ? view : TUT_STEPS.length - 1];
  const bar = h("div", { style: { height: "8px", background: "var(--panel2)", borderRadius: "5px", overflow: "hidden", border: "1px solid var(--line)" } }, h("div", { style: { width: pct + "%", height: "100%", background: "var(--good)" } }));
  const head2 = h("div", { class: "row", style: { alignItems: "center" } }, h("b", { style: { flex: 1 } }, "Tutorial · " + (cur < 0 ? "Fertig!" : s.ch)), h("small", { class: "muted" }, nDone + " / " + TUT_STEPS.length), h("button", { class: "btn sm", title: ED.tut.min ? "Aufklappen" : "Einklappen", onclick: () => { ED.tut.min = !ED.tut.min; tutSave(); tutRender(); } }, ED.tut.min ? "▲" : "▼"), h("button", { class: "btn sm", title: "Tutorial pausieren (in der Anleitung fortsetzen)", onclick: () => { ED.tut.on = false; tutSave(); tutRender(); } }, "✕"));
  el.append(head2, bar); if (ED.tut.min) return;
  if (cur < 0 && view < 0) { el.append(h("h3", { style: { margin: "10px 0 4px" } }, "Dein Gebiet ist fertig!"), h("p", null, "Du hast Karte, Deko, Zonen, Tonlinge, Spawns, Instrument, Figuren, Aufgabe, Laden und Fundstück gebaut, geprüft und gespeichert. Jetzt kannst du weitere Bereiche mit Tor zum nächsten bauen, mehr Tonlinge erfinden oder eigene Grafiken zeichnen."), h("button", { class: "btn pri", onclick: () => { ED.tut.on = false; tutSave(); tutRender(); } }, "Tutorial schließen")); return; }
  const idx = TUT_STEPS.indexOf(s), isDone = ED.tut.done[s.id], isSkip = ED.tut.skip[s.id];
  el.append(h("h3", { style: { margin: "10px 0 4px" } }, (isDone ? "✓ " : "") + (idx + 1) + ". " + s.t), h("p", { style: { margin: "0 0 8px" } }, tutFmt(s.x)));
  const row = h("div", { class: "row", style: { flexWrap: "wrap", gap: "6px" } });
  if (s.go && ED.tab !== s.go) row.append(h("button", { class: "btn pri sm", onclick: () => openAt(s.go) }, "Dorthin"));
  if (idx > 0) row.append(h("button", { class: "btn sm", onclick: () => { ED.tut.view = idx - 1; tutSave(); tutRender(); } }, "← Zurück"));
  if (!isDone) row.append(h("button", { class: "btn sm", onclick: () => { ED.tut.skip[s.id] = 1; ED.tut.view = -1; tutSave(); tutRender(); } }, "Überspringen"));
  if (view !== cur) row.append(h("button", { class: "btn sm", onclick: () => { ED.tut.view = -1; tutSave(); tutRender(); } }, "Zum aktuellen Schritt"));
  row.append(h("button", { class: "btn sm", onclick: () => { ED.tut.list = !ED.tut.list; tutSave(); tutRender(); } }, ED.tut.list ? "Übersicht zu" : "Übersicht"));
  el.append(row);
  if (!isDone && !isSkip) el.append(h("p", { class: "muted", style: { margin: "8px 0 0", fontSize: "14px" } }, "Der Schritt springt von selbst weiter, sobald du es getan hast."));
  if (ED.tut.list) { const box = h("div", { style: { marginTop: "8px", borderTop: "1px solid var(--line)", paddingTop: "6px" } }); let last = ""; TUT_STEPS.forEach((st, i) => { if (st.ch !== last) { last = st.ch; box.append(h("div", { style: { fontWeight: "700", marginTop: "6px" } }, st.ch)); } const d = ED.tut.done[st.id], k = ED.tut.skip[st.id]; box.append(h("button", { class: "btn sm", style: { display: "block", width: "100%", textAlign: "left", margin: "2px 0", opacity: d || k ? .65 : 1 }, onclick: () => { ED.tut.view = i; tutSave(); tutRender(); } }, (d ? "✓ " : k ? "– " : i === cur ? "▶ " : "○ ") + st.t)); }); el.append(box); }
}
async function tutStart(fresh) {
  if (fresh) { const ok = await newBlank(); if (!ok) return; ED.tut = { on: true, done: {}, skip: {}, base: { t1: cntT(1) }, view: -1, min: false, list: false }; ED.did = {}; ED.tab = "welt"; renderTab(); toast("Tutorial gestartet. Folge dem Fenster unten rechts."); }
  else { ED.tut.on = true; ED.tut.view = -1; ED.tut.min = false; }
  tutSig = ""; tutSave(); tutPoll();
}
setInterval(tutPoll, 700);
