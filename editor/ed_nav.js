/* ===== WELTBAUER: Navigation (Hauptbereiche, Unterleiste, Startseite, Suche, Expertenmodus) ===== */
const SECTIONS = [
  { id: "welt", label: "Welt", tabs: ["welt", "bereiche", "zonen"] },
  { id: "tonlinge", label: "Tonlinge", tabs: ["tonlinge", "spawns", "mutationen"] },
  { id: "figuren", label: "Figuren", tabs: ["npcs", "quests", "figur"] },
  { id: "dinge", label: "Gegenstände", tabs: ["instr", "faehig", "items", "laeden"] },
  { id: "grafiken", label: "Grafiken", tabs: ["grafiken"] },
  { id: "regeln", label: "Spiel & Regeln", tabs: ["einst", "regeln", "fang", "skript", "roh"] }
];
const SUBNAME = { welt: "Weltkarte", tonlinge: "Arten", spawns: "Spawns & Seltenheiten", quests: "Aufgaben", figur: "Spielfigur & Start", instr: "Instrumente", faehig: "Fähigkeiten", items: "Fundstücke", laeden: "Läden", grafiken: "Bibliothek & Grafiken", einst: "Einstellungen", regeln: "Regeln & Farben", fang: "Fang-Zahlen", skript: "Texte & Skript", roh: "Alle Daten", pruefen: "Prüfen", hilfe: "Anleitung" };
const EXPERT_TABS = new Set(["fang", "skript", "roh"]);
try { ED.expert = localStorage.getItem("tonlinge-ed-expert") === "1"; } catch (e) { ED.expert = false; }
const sectionOf = id => SECTIONS.find(s => s.tabs.includes(id));
const tabLabel = id => SUBNAME[id] || (TABS.find(t => t.id === id) || {}).label || id;
function openAt(tabId, key, id) { ED.tab = tabId; if (key) ED.sel[key] = id; try { history.replaceState(null, "", "#" + tabId); } catch (e) { } renderTab(); }
const SEARCH_SRC = [
  ["tonlinge", "sp", () => SPECIES.map(s => [s.id, s.n]), "Tonling"], ["npcs", "npcs", () => Object.keys(NPCS).map(k => [k, NPCS[k].n]), "Figur"], ["quests", "quests", () => Object.keys(QUESTS).map(k => [k, QUESTS[k].title]), "Aufgabe"],
  ["instr", "instr", () => Object.keys(INSTR).map(k => [k, INSTR[k].name]), "Instrument"], ["items", "items", () => Object.keys(ITEMS).map(k => [k, ITEMS[k].n]), "Fundstück"], ["laeden", "shop", () => Object.keys(SHOPS).map(k => [k, SHOPS[k].name]), "Laden"],
  ["zonen", "zone", () => Object.keys(ZINFO).map(k => [k, ZINFO[k].n]), "Zone"], ["bereiche", "area", () => Object.keys(AREAS).map(k => [k, AREAS[k].name]), "Bereich"], ["mutationen", "mut", () => MUTS.map(m => [m.id, m.name]), "Mutation"], ["faehig", "faehig", () => Object.keys(PAS_TXT).map(k => [k, (ABIL[k] && ABIL[k].name) || k]), "Fähigkeit"]
];
function searchAll(q) { q = q.trim().toLowerCase(); if (!q) return []; const out = [];
  TABS.forEach(t => { const l = tabLabel(t.id); if (l.toLowerCase().includes(q) && (ED.expert || !EXPERT_TABS.has(t.id))) out.push({ label: l, sub: "Bereich", go: () => openAt(t.id) }); });
  SEARCH_SRC.forEach(([tb, key, src, kind]) => { try { src().forEach(([id, name]) => { if (String(name || "").toLowerCase().includes(q) || String(id).toLowerCase().includes(q)) out.push({ label: name || id, sub: kind, go: () => openAt(tb, key, String(id)) }); }); } catch (e) { } });
  return out.slice(0, 40); }
function renderRail() {
  const r = $q("#rail"); r.innerHTML = ""; const cur = ED.tab, sec = sectionOf(cur);
  const nav1 = h("div", { class: "nav1" }, h("button", { "aria-current": String(cur === "start"), onclick: () => openAt("start") }, "⌂ Start"),
    SECTIONS.map(s => h("button", { "aria-current": String(!!sec && sec.id === s.id), onclick: () => openAt(sec && sec.id === s.id ? cur : (s.tabs.find(t => ED.sel["_last_" + s.id] === t) || s.tabs[0])) }, s.label)),
    h("span", { class: "sp" }),
    (() => { const inp = h("input", { type: "text", placeholder: "Suchen … (Strg+K)", "aria-label": "Alles durchsuchen" }), res = h("div", { id: "nres", hidden: true }); let hi = 0, list = [];
      const show = () => { list = searchAll(inp.value); res.innerHTML = ""; res.hidden = !list.length; list.forEach((x, i) => res.append(h("button", { class: i === hi ? "on" : "", onmousedown: e => { e.preventDefault(); res.hidden = true; inp.value = ""; x.go(); } }, x.label, h("small", null, x.sub)))); };
      inp.oninput = () => { hi = 0; show(); }; inp.onblur = () => { setTimeout(() => { res.hidden = true; }, 150); };
      inp.onkeydown = e => { if (e.key === "ArrowDown") { hi = Math.min(list.length - 1, hi + 1); show(); e.preventDefault(); } else if (e.key === "ArrowUp") { hi = Math.max(0, hi - 1); show(); e.preventDefault(); } else if (e.key === "Enter" && list[hi]) { res.hidden = true; const g = list[hi].go; inp.value = ""; g(); } else if (e.key === "Escape") { res.hidden = true; inp.blur(); } };
      window.__navSearch = inp; return h("div", { id: "nsearch" }, inp, res); })(),
    h("button", { "aria-current": String(cur === "pruefen"), onclick: () => openAt("pruefen") }, "Prüfen"), h("button", { "aria-current": String(cur === "hilfe"), onclick: () => openAt("hilfe") }, "Anleitung"),
    h("label", { class: "xsw", title: "Zeigt zusätzlich Fang-Zahlen, Skript und Alle Daten" }, (() => { const c = h("input", { type: "checkbox", checked: !!ED.expert }); c.onchange = () => { ED.expert = c.checked; try { localStorage.setItem("tonlinge-ed-expert", c.checked ? "1" : "0"); } catch (e) { } renderRail(); }; return c; })(), "Experte"));
  r.append(nav1);
  if (sec) { ED.sel["_last_" + sec.id] = cur; const tabs = sec.tabs.filter(t => ED.expert || !EXPERT_TABS.has(t) || t === cur); if (tabs.length > 1) r.append(h("div", { class: "nav2" }, tabs.map(t => h("button", { "aria-current": String(cur === t), onclick: () => openAt(t) }, tabLabel(t))))); }
}
window.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); window.__navSearch && window.__navSearch.focus(); } });
/* Startseite */
tab("start", "Start", "Start", root => {
  const cnt = [["Arten", SPECIES.length], ["Figuren", Object.keys(NPCS).length], ["Aufgaben", Object.keys(QUESTS).length], ["Instrumente", Object.keys(INSTR).length], ["Fundstücke", Object.keys(ITEMS).length], ["Eigene Grafiken", Object.keys(ED.assets.tiles).length + Object.keys(ED.assets.icons).length]];
  root.append(h("h1", { style: { font: "34px var(--f-display)", margin: "6px 0 0" } }, "Was willst du tun?"), h("p", { class: "muted" }, "Dein Projekt: " + cnt.map(([n, v]) => v + " " + n).join(" · ") + ". Alles lässt sich später in den Bereichen oben nachbearbeiten."));
  const card = (t, d, fn) => h("button", { onclick: fn }, h("b", null, t), h("span", null, d));
  root.append(h("div", { class: "home" },
    card("Die Welt malen", "Böden, Wasser, Häuser, Objekte auf der Karte setzen.", () => openAt("welt")),
    card("Einen Tonling erfinden", "Form, Farben, Frequenz, Lebensraum, Wert und Schwierigkeit.", () => openAt("tonlinge")),
    card("Ein Instrument bauen", "Werte, Fähigkeit, Aussehen, Lied oder Musikstück.", () => openAt("instr")),
    card("Eine Figur oder Aufgabe anlegen", "NPCs mit Aussehen, Gesprächen, Läden und Aufträgen.", () => openAt("npcs")),
    card("Fertige Grafiken holen", "Hunderte Symbole, Tonling-Formen, Objekte und Böden.", () => openAt("grafiken")),
    card("Neue Bereiche und Zonen", "Ganze Gegenden mit eigener Stimmung und eigenen Tonlingen.", () => openAt("bereiche")),
    card("Regeln und Start einstellen", "Erfahrung, Tageslänge, Start-Instrumente, Spielfigur, Farben.", () => openAt("regeln")),
    card("▶ Testspiel", "Dein Spiel sofort ausprobieren, ohne zu speichern.", () => playtest()),
    card("Prüfen", "Findet unerreichbare Orte und fehlende Verknüpfungen.", () => openAt("pruefen")),
    card("Speichern", "Dein Projekt als Datei sichern.", () => saveFile()),
    card("Ganz von vorn beginnen", "Leeres Spiel, aber alle Grafiken, Böden und Formen des großen Spiels zum Benutzen.", () => newBlank())));
  root.append(h("p", { class: "muted", style: { marginTop: "14px" } }, "Tipp: Mit Strg+K suchst du jeden Tonling, jede Figur und jedes Instrument. Oben rechts schaltet „Experte“ die Zahlen-, Skript- und Rohdaten-Werkzeuge dazu."));
});

TABS.unshift(TABS.pop());
edBoot();
