/* ===== WELTBAUER: NPCs, Aufgaben, Grafiken, Prüfung, Start ===== */
const LK = {
  sk: ["a", "b", "c", "d", "e"], hs: ["short", "bun", "long", "curly", "pony", "twin", "braid", "wavy", "tuft", "bald", "afro", "spiky", "mohawk", "bob", "topknot", "messy", "sidepart"],
  ht: ["none", "floppy", "pointy", "cap", "beanie", "band", "hood", "goggles", "star", "crown", "top", "straw", "bandana", "headphones", "flower", "horns", "halo", "chef", "pirate", "catears", "laurel", "witch", "fez"],
  of: ["tunic", "vest", "dress", "robe", "apron", "cloak", "coat", "poncho", "kimono", "overalls", "armor", "suit"],
  it: ["none", "satchel", "pack", "scarf", "staff", "lantern", "feder", "fork", "orb", "ears", "pick", "scope", "guitar", "flute", "book", "broom", "umbrella", "bell", "torch", "fishing"],
  bd: ["none", "full", "mustache", "braid"], gl: ["none", "round"], eyes: ["dot", "big", "sleepy", "happy", "closed", "star", "wink", "wide"], mouth: ["smile", "grin", "flat", "o", "smirk", "fang"], nk: ["none", "bow"]
};
const LKN = {
  sk: "Hautton", hs: "Frisur", ht: "Kopfbedeckung", of: "Kleidung", it: "Gegenstand", bd: "Bart", gl: "Brille", eyes: "Augen", mouth: "Mund", nk: "Halsschmuck",
  "short": "kurz", bun: "Dutt", "long": "lang", curly: "lockig", pony: "Zopf", twin: "Zöpfe", braid: "Flechtzopf", wavy: "wellig", tuft: "Büschel", bald: "Glatze", afro: "Afro", spiky: "stachelig", mohawk: "Irokese", bob: "Bob", topknot: "Haarknoten", messy: "wuschelig", sidepart: "Seitenscheitel",
  none: "keine", floppy: "Schlapphut", pointy: "Spitzhut", cap: "Mütze", beanie: "Wollmütze", band: "Stirnband", hood: "Kapuze", goggles: "Schutzbrille", star: "Stern", crown: "Krone", top: "Zylinder", straw: "Strohhut", bandana: "Kopftuch", headphones: "Kopfhörer", flower: "Blume", horns: "Hörner", halo: "Heiligenschein", chef: "Kochmütze", pirate: "Piratenhut", catears: "Katzenohren", laurel: "Lorbeer", witch: "Hexenhut", fez: "Fes",
  tunic: "Kittel", vest: "Weste", dress: "Kleid", robe: "Robe", apron: "Schürze", cloak: "Umhang", coat: "Mantel", poncho: "Poncho", kimono: "Kimono", overalls: "Latzhose", armor: "Rüstung", suit: "Anzug",
  satchel: "Umhängetasche", pack: "Rucksack", scarf: "Schal", staff: "Stab", lantern: "Laterne", feder: "Feder", fork: "Stimmgabel", orb: "Kugel", ears: "Lauscher", pick: "Spitzhacke", scope: "Fernrohr", guitar: "Gitarre", flute: "Flöte", book: "Buch", broom: "Besen", umbrella: "Schirm", bell: "Glocke", torch: "Fackel", fishing: "Angel",
  full: "Vollbart", mustache: "Schnurrbart", round: "rund", dot: "Punkte", big: "groß", sleepy: "müde", happy: "froh", closed: "geschlossen", wink: "zwinkernd", wide: "weit", smile: "Lächeln", grin: "Grinsen", flat: "gerade", o: "überrascht", smirk: "schief", fang: "Zahn", bow: "Schleife"
};
const lkOpts = k => LK[k].map(v => [v, LKN[v] || v]);
function optColor(o, k, label, def, after) { const box = h("div", { class: "fld" }); const draw = () => { box.innerHTML = ""; box.append(h("span", null, label)); if (o[k] != null) box.append(cIn(o, k, { opt: true, after: v => { if (v == null) draw(); after && after(); } })); else box.append(h("button", { class: "btn sm", onclick: () => { o[k] = def; touch(); draw(); after && after(); } }, "+ hinzufügen")); }; draw(); return box; }
function optFlag(o, k, label, after) { return chk(o, k, label, { after }); }
const RNDHAIR = ["#3a2418", "#7a4a24", "#c98a2a", "#1e1a1a", "#c8c8c0", "#8a3a2a", "#2a8a70", "#6a8ae0", "#d86aa0"];
function randomLook() { const p = a => a[Math.floor(Math.random() * a.length)]; return { skin: p(LK.sk), hair: p(RNDHAIR), hs: p(LK.hs), ht: Math.random() < .5 ? "none" : p(LK.ht), ho: p(["#d24e4e", "#2e3b7a", "#2f5e4a", "#6a3a7a", "#c9a02a"]), of: p(LK.of), ac: p(["#f2c94c", "#f6c8d0", "#a8e4de", "#c8d0ff"]), it: Math.random() < .5 ? "none" : p(LK.it), bd: Math.random() < .3 ? p(LK.bd) : "none", eyes: p(LK.eyes), mouth: p(LK.mouth), w: +(.9 + Math.random() * .25).toFixed(2), h: +(.92 + Math.random() * .18).toFixed(2) }; }

tab("npcs", "NPCs", "Figuren", root => {
  root.append(head("NPCs", "Figuren der Welt: Aussehen, Platz, Begrüßung, Erzähltexte und Laden. Den Platz setzt du am besten auf der Karte."));
  const L = listDetail(root, { key: "npcs", title: "NPCs", onNew: async () => { const n = await askText("Neuer NPC", "Name", "Neue Figur"); if (!n) return null; const id = uid(slug(n), i => NPCS[i]); NPCS[id] = { n, area: 1, x: START.tx + 2, y: START.ty, col: "#e39a3b", hat: "#6b3a2c", hi: "Hallo!" }; touch(); return id; },
    items: () => Object.keys(NPCS).map(k => ({ id: k, label: NPCS[k].n, group: "Bereich " + NPCS[k].area, color: NPCS[k].col })).sort((a, b) => a.group < b.group ? -1 : a.group > b.group ? 1 : 0),
    detail: (id, el, redraw) => {
      const n = NPCS[id], look = NPC_LOOK[id] || (NPC_LOOK[id] = {}), sub = ED.sel.npcsub || "basis"; const rd = () => { redraw(); };
      const pv = preview(150, 190, (c, t) => { c.fillStyle = "#a9dc86"; c.fillRect(0, 0, 150, 190); try { c.save(); c.translate(75, 150); c.scale(2.6, 2.6); drawPerson(c, 0, 0, n.col, n.hat, { look: NPC_LOOK[id], face: ED.sel.npcFace || 1 }, t); c.restore(); } catch (e) { c.fillStyle = "#900"; c.fillText(String(e).slice(0, 30), 4, 14); } });
      const tabs = h("div", { class: "tabs" }, [["basis", "Grunddaten"], ["look", "Aussehen"], ["talk", "Begrüßung"], ["story", "Erzähltexte"]].map(([k, l]) => h("button", { class: "btn sm" + (sub === k ? " on" : ""), onclick: () => { ED.sel.npcsub = k; renderTab(); } }, l)));
      const body = h("div");
      if (sub === "basis") {
        body.append(h("div", { class: "grid" }, fld("Name", tIn(n, "n", { after: rd })), fld("x", nIn(n, "x", { after: () => { n.area = AM[idx(Math.max(0, Math.min(WW - 1, n.x)), Math.max(0, Math.min(WH - 1, n.y)))]; W.need = true; } })), fld("y", nIn(n, "y", { after: () => { n.area = AM[idx(Math.max(0, Math.min(WW - 1, n.x)), Math.max(0, Math.min(WH - 1, n.y)))]; W.need = true; } })), fld("Farbe (Körper)", cIn(n, "col")), fld("Farbe (Hut)", cIn(n, "hat")), fld("Laden", sIn(n, "shop", [["", "keiner"], ...Object.keys(SHOPS).map(k => [k, SHOPS[k].name])], { opt: true, none: 1 })), fld("Stimme (Tonhöhe)", rIn(NPC_VOICE, id, -6, 8, 1, { def: 0 }), "für das Gemurmel beim Sprechen")),
          fld("Kurzbeschreibung", aIn(n, "hi", { rows: 2, opt: true })), h("div", { class: "row" }, chk(n, "buy", "kauft Fänge an"), chk(n, "secret", "versteckt, bis eine Aufgabe ihn freischaltet", { after: renderTab })),
          n.secret ? h("p", { class: "muted" }, "Eine Aufgabe schaltet ihn mit „schaltet NPCs frei“ frei. Die Geheimwand setzt du mit dem Karten-Werkzeug „Geheimwand“." + (FWALLS[id] ? " Wand bei " + FWALLS[id][0] + ", " + FWALLS[id][1] + "." : " Noch keine Wand gesetzt.")) : null,
          h("div", { class: "row", style: { marginTop: "8px" } }, h("button", { class: "btn", onclick: () => { ED.tab = "welt"; W.tool = "npc"; ED.sel.npc = id; renderTab(); centerOn(n.x, n.y); W.s = Math.max(W.s, 24); } }, "Auf der Karte zeigen"), h("button", { class: "btn warn", onclick: async () => { if (await del("NPC", n.n)) { delete NPCS[id]; delete NPC_LOOK[id]; delete GREET[id]; delete STORY[id]; touch(); renderTab(); } } }, "Löschen")));
      } else if (sub === "look") {
        const pick = (k, label) => fld(label, (() => { const e = h("select", null, lkOpts(k).map(([v, l]) => h("option", { value: v }, l))); e.value = look[k] || lkOpts(k)[0][0]; e.onchange = () => { look[k] = e.value; touch(); }; return e; })());
        const skin = (() => { const e = h("select", null, LK.sk.map(v => h("option", { value: v }, "Ton " + v.toUpperCase())), h("option", { value: "#" }, "eigene Farbe")); e.value = /^#/.test(look.skin) ? "#" : look.skin || "a"; const col = cIn(look, "skin"); col.style.display = /^#/.test(look.skin) ? "" : "none"; e.onchange = () => { if (e.value === "#") { look.skin = "#e0b890"; col.value = "#e0b890"; col.style.display = ""; } else { look.skin = e.value; col.style.display = "none"; } touch(); }; return h("span", { class: "row" }, e, col); })();
        const sl = (k, l, a, b, st) => fld(l + " " + (look[k] || 1), rIn(look, k, a, b, st, { def: 1 }));
        body.append(h("div", { class: "row" }, h("button", { class: "btn sm", onclick: () => { Object.keys(look).forEach(k => delete look[k]); Object.assign(look, randomLook()); touch(); renderTab(); } }, "Zufällig würfeln"), h("button", { class: "btn sm", onclick: () => { ED.sel.npcFace = -(ED.sel.npcFace || 1); } }, "Blickrichtung"), fld("Aussehen kopieren von", (() => { const e = h("select", null, h("option", { value: "" }, "…"), Object.keys(NPC_LOOK).filter(k => k !== id).map(k => h("option", { value: k }, (NPCS[k] ? NPCS[k].n : k))), h("optgroup", { label: "Aus dem großen Spiel" }, Object.keys(BASE.tables.NPC_LOOK).map(k => h("option", { value: "big:" + k }, (BASE.tables.NPCS[k] ? BASE.tables.NPCS[k].n : k))))); e.onchange = () => { if (!e.value) return; const src = e.value.startsWith("big:") ? _clone(BASE.tables.NPC_LOOK[e.value.slice(4)]) : _clone(NPC_LOOK[e.value]); Object.keys(look).forEach(k => delete look[k]); Object.assign(look, src); touch(); renderTab(); }; return e; })())),
          h("div", { class: "ph" }, "Eigene Zeichnung (Code, ersetzt die ganze Figur)"), fld("Code", aIn(look, "code", { code: true, rows: 5, opt: true }), "Parameter: c, x, y (Füße), t, face, col, hat, L, INK, hs, TH, mixHex."), h("div", { class: "ph" }, "Kopf"), h("div", { class: "grid" }, fld("Hautton", skin), pick("hs", "Frisur"), fld("Haarfarbe", cIn(look, "hair")), pick("ht", "Kopfbedeckung"), fld("Farbe der Kopfbedeckung", cIn(look, "ho")), pick("eyes", "Augen"), pick("mouth", "Mund"), pick("bd", "Bart"), fld("Bartfarbe", cIn(look, "bc")), pick("gl", "Brille")),
          h("div", { class: "row" }, optFlag(look, "fr", "Sommersprossen"), optFlag(look, "sc", "Narbe"), optFlag(look, "pt", "Augenklappe")),
          h("div", { class: "ph" }, "Körper"), h("div", { class: "grid" }, pick("of", "Kleidung"), fld("Zierfarbe", cIn(look, "ac")), optColor(look, "lg", "Hosenfarbe", "#5a74b8"), optColor(look, "sh", "Schuhfarbe", "#4a3524"), pick("nk", "Halsschmuck"), optColor(look, "neck", "Halstuch", "#d24e4e"), optColor(look, "cape", "Umhang hinten", "#8a3a3a"), optColor(look, "wg", "Flügel", "#bfe8ff"), optColor(look, "tl", "Schwanz", "#c98a2a"), pick("it", "Gegenstand"), sl("w", "Breite", .7, 1.3, .02), sl("h", "Höhe", .8, 1.25, .02)));
      } else if (sub === "talk") {
        const g = GREET[id] || (GREET[id] = { d: [], n: [] });
        body.append(h("p", { class: "muted" }, "Beim Ansprechen wird zufällig eine Zeile gewählt. Leer lassen wählt einen Standardsatz."), h("div", { class: "ph" }, "Tagsüber"), strList(g.d || (g.d = []), { add: "Begrüßung" }), h("div", { class: "ph" }, "Nachts"), strList(g.n || (g.n = []), { add: "Begrüßung" }));
      } else {
        const st = STORY[id] || (STORY[id] = []); const dl = h("datalist", { id: "condlist" }, Object.keys(COND).map(k => h("option", { value: k })), Object.keys(QUESTS).map(k => h("option", { value: "q:" + k })), h("option", { value: "lvl:10" }), h("option", { value: "catches:20" }), h("option", { value: "flag:name" }), h("option", { value: "day" }));
        body.append(dl, h("p", { class: "muted" }, "Erzähltexte erscheinen im Gespräch der Reihe nach, wenn ihre Bedingung gilt. Bedingungen: a = immer, q:aufgabe = Aufgabe erledigt, lvl:12 = Stufe erreicht, catches:20 = Anzahl Fänge, flag:name = Merker, day = tagsüber, night = nachts."));
        const box = h("div"); const drawSt = () => { box.innerHTML = ""; st.forEach((e, i) => { box.append(h("div", { class: "item" }, h("div", { class: "row" }, fld("Bedingung", (() => { const t = h("input", { type: "text", value: e.w || "a", setAttribute: null }); t.setAttribute("list", "condlist"); t.oninput = () => { e.w = t.value; touch(); }; return t; })()), h("button", { class: "btn sm", onclick: () => { if (i) { [st[i - 1], st[i]] = [st[i], st[i - 1]]; touch(); drawSt(); } } }, "↑"), h("button", { class: "btn sm warn", onclick: () => { st.splice(i, 1); touch(); drawSt(); } }, "× Abschnitt")), strList(e.p || (e.p = []), { rows: 3, add: "Absatz" }))); }); box.append(h("button", { class: "btn sm", onclick: () => { st.push({ w: "a", p: [""] }); touch(); drawSt(); } }, "+ Abschnitt")); }; drawSt(); body.append(box);
      }
      el.append(h("div", { class: "row", style: { alignItems: "flex-start" } }, h("div", null, pv), h("div", { style: { flex: 1, minWidth: "280px" } }, h("h2", null, n.n), h("p", { class: "muted" }, "Kennung: " + id + " · Bereich " + n.area), tabs)), body);
    } });
});

/* ----- Aufgaben ----- */
function filtTxt(f) { f = f || {}; const o = []; if (f.sp && SP[f.sp]) o.push(SP[f.sp].n); if (f.mut) { const m = MUTS.find(q => q.id === f.mut); o.push(m ? m.name.toLowerCase() : "mutierte"); } if (f.r) o.push("mindestens " + (RAR[f.r] ? RAR[f.r].name.toLowerCase() : "selten")); if (f.a) o.push("aus " + ((AREAS[f.a] || {}).name || "Bereich " + f.a)); return o.join(", "); }
function autoTxt(p) {
  const ft = filtTxt(p.f), n = p.n;
  switch (p.k) { case "perf": return p.ev === "cast" ? "Führe " + n + " perfekte Würfe aus (Ring genau auf die Marke)." : "Führe " + n + " perfekte Fänge aus (Tonling nie aus der Zone lassen)."; case "lvl": return "Erreiche Level " + n + "."; case "idx": return "Entdecke " + n + " verschiedene Arten" + (p.a ? " in " + ((AREAS[p.a] || {}).name || "Bereich " + p.a) : "") + "."; case "pay": return "Bezahle " + n + " Noten."; case "give": return "Gib " + n + " Tonlinge ab" + (ft ? " (" + ft + ")" : "") + "."; case "item": return "Bringe: " + ((ITEMS[p.id] || {}).n || "ein Fundstück") + "."; case "streak": return "Fange " + n + " Tonlinge hintereinander mit perfektem Wurf und perfektem Fang. Jeder Fehler setzt die Serie zurück."; default: return "Fange " + n + " Tonlinge" + (ft ? " (" + ft + ")" : "") + "."; }
}
const PKIND = { catch: "Tonlinge fangen", perf: "Perfekte Würfe oder Fänge", lvl: "Level erreichen", idx: "Arten entdecken", pay: "Noten bezahlen", give: "Tonlinge abgeben", item: "Fundstück bringen", streak: "Serie perfekter Fänge" };
const pkind = p => p.k || "catch";
function syncQ(q) { if (!q.parts || !q.parts.length) { delete q.parts; return; } q.desc = q.parts.map(p => p.txt).join(" "); q.n = q.parts[0].n; q.f = q.parts[0].f || {}; }
function filterEd(f, after) {
  const box = h("div", { class: "grid" }); const g = (k, el) => fld(k, el);
  box.append(fld("Art", (() => { const e = h("select", null, h("option", { value: "" }, "jede"), speciesOptions().map(([v, l]) => h("option", { value: v, selected: f.sp === v }, l))); e.onchange = () => { if (e.value) f.sp = e.value; else delete f.sp; touch(); after(); }; return e; })()),
    fld("Mutation", (() => { const e = h("select", null, h("option", { value: "" }, "egal"), h("option", { value: "any", selected: f.mut === "any" }, "irgendeine"), MUTS.map(m => h("option", { value: m.id, selected: f.mut === m.id }, m.name))); e.onchange = () => { if (e.value) f.mut = e.value; else delete f.mut; touch(); after(); }; return e; })()),
    fld("Seltenheit mindestens", (() => { const e = h("select", null, h("option", { value: "" }, "egal"), RAR.map((r, i) => i ? h("option", { value: i, selected: f.r === i }, r.name) : null)); e.onchange = () => { if (e.value) f.r = +e.value; else delete f.r; touch(); after(); }; return e; })()),
    fld("Bereich", (() => { const e = h("select", null, h("option", { value: "" }, "egal"), areaOptions().map(([v, l]) => h("option", { value: v, selected: f.a === v }, l))); e.onchange = () => { if (e.value) f.a = +e.value; else delete f.a; touch(); after(); }; return e; })()));
  return box;
}
function partEd(q, p, i, redraw) {
  const k = pkind(p), box = h("div", { class: "item" }); const refresh = () => { syncQ(q); };
  const kindSel = h("select", { onchange: e => { const nk = e.target.value; const old = { n: p.n || 1, txt: p.txt }; Object.keys(p).forEach(x => delete p[x]); p.n = old.n; if (nk === "catch") p.f = {}; else { p.k = nk; if (nk === "perf") p.ev = "cast"; if (nk === "give") p.f = {}; if (nk === "item") p.id = Object.keys(ITEMS)[0]; if (nk === "idx") p.a = 1; } p.txt = autoTxt(p); refresh(); touch(); redraw(); } }, Object.entries(PKIND).map(([v, l]) => h("option", { value: v, selected: v === k }, l)));
  const txt = h("textarea", { rows: 2 }); txt.value = p.txt || ""; txt.oninput = () => { p.txt = txt.value; refresh(); touch(); };
  const auto = () => { p.txt = autoTxt(p); txt.value = p.txt; refresh(); touch(); };
  const row = h("div", { class: "row" }, fld("Teil", kindSel));
  if (k !== "item") row.append(fld(k === "pay" ? "Noten" : k === "lvl" ? "Level" : "Anzahl", nIn(p, "n", { min: 1, after: auto })));
  if (k === "perf") row.append(fld("Art", sIn(p, "ev", [["cast", "Würfe"], ["catch", "Fänge"]], { after: auto })));
  if (k === "idx") row.append(fld("Bereich", sIn(p, "a", areaOptions(), { num: true, after: auto })));
  if (k === "item") row.append(fld("Fundstück", sIn(p, "id", Object.keys(ITEMS).map(x => [x, ITEMS[x].n]), { after: auto })));
  row.append(h("button", { class: "btn sm", title: "Nach oben", onclick: () => { if (i) { [q.parts[i - 1], q.parts[i]] = [q.parts[i], q.parts[i - 1]]; refresh(); touch(); redraw(); } } }, "↑"), h("button", { class: "btn sm warn", onclick: () => { q.parts.splice(i, 1); refresh(); touch(); redraw(); } }, "×"));
  box.append(row); if (k === "catch" || k === "give") box.append(filterEd(p.f || (p.f = {}), auto)); box.append(fld("Text im Aufgabenbuch", txt), h("button", { class: "btn sm", onclick: auto }, "Text automatisch"));
  return box;
}
tab("quests", "Aufgaben", "Figuren", root => {
  root.append(head("Aufgaben", "Aufgaben bestehen aus Teilen. Alle Teile müssen erfüllt sein, dann gibt man sie beim NPC ab. Die Gesprächstexte schreibst du hier mit."));
  listDetail(root, { key: "quests", title: "Aufgaben", onNew: async () => { const t = await askText("Neue Aufgabe", "Titel", "Neue Aufgabe"); if (!t) return null; const id = uid(slug(t), i => QUESTS[i]); const nid = Object.keys(NPCS)[0]; QUESTS[id] = { npc: nid, lvl: 1, title: t, n: 1, f: {}, desc: "Fange 1 Tonling.", parts: [{ n: 1, f: {}, txt: "Fange 1 Tonling." }], rew: { xp: 50, gold: 20 } }; QX[id] = { offer: ["Kannst du mir helfen?"], remind: "Noch nicht fertig?", done: ["Danke dir!"] }; touch(); return id; },
    items: () => Object.keys(QUESTS).map(k => ({ id: k, label: QUESTS[k].title, group: (NPCS[QUESTS[k].npc] || { n: "?" }).n })).sort((a, b) => a.group < b.group ? -1 : a.group > b.group ? 1 : 0),
    detail: (id, el, redraw) => {
      const q = QUESTS[id], x = QX[id] || (QX[id] = {}); q.rew = q.rew || {}; if (!q.parts) q.parts = [{ n: q.n || 1, f: q.f || {}, txt: q.desc || "" }];
      const partsBox = h("div"); const drawParts = () => { partsBox.innerHTML = ""; q.parts.forEach((p, i) => partsBox.append(partEd(q, p, i, drawParts))); partsBox.append(h("button", { class: "btn sm", onclick: () => { const p = { n: 1, f: {} }; p.txt = autoTxt(p); q.parts.push(p); syncQ(q); touch(); drawParts(); } }, "+ Teil")); }; drawParts();
      const opens = h("div", { class: "chkbox", style: { maxHeight: "160px", overflow: "auto", border: "1px solid var(--line,#888)", borderRadius: "6px", padding: "4px 8px" } }, Object.keys(NPCS).filter(k => NPCS[k].secret).length ? Object.keys(NPCS).filter(k => NPCS[k].secret).map(k => h("label", { style: { display: "block" } }, h("input", { type: "checkbox", checked: (q.opens || []).includes(k), onchange: e => { const set = new Set(q.opens || []); if (e.target.checked) set.add(k); else set.delete(k); if (set.size) q.opens = [...set]; else delete q.opens; touch(); } }), " " + NPCS[k].n)) : h("span", { class: "muted" }, "Keine versteckten NPCs. Hake bei einem NPC „versteckt“ an, dann erscheint er hier."));
      const sets = h("input", { type: "text", value: (q.sets || []).join(", "), placeholder: "merker1, merker2", oninput: e => { const v = e.target.value.split(",").map(s => s.trim()).filter(Boolean); if (v.length) q.sets = v; else delete q.sets; touch(); } });
      const used = Object.keys(QUESTS).filter(k => QUESTS[k].after === id);
      el.append(h("h2", null, q.title), h("p", { class: "muted" }, "Kennung: " + id + (used.length ? " · danach: " + used.map(k => QUESTS[k].title).join(", ") : "")),
        h("div", { class: "grid" }, fld("Titel", tIn(q, "title", { after: redraw })), fld("Gibt", sIn(q, "npc", npcOptions(), { after: redraw })), fld("Ab Level", nIn(q, "lvl", { min: 1 })), fld("Setzt voraus", sIn(q, "after", questOptions("keine"), { opt: true, none: 1 })), fld("Hauptgeschichte (Nummer)", nIn(q, "main", { opt: true }), "leer = Nebenaufgabe")),
        h("div", { class: "ph" }, "Teile"), partsBox,
        h("div", { class: "ph" }, "Belohnung"), h("div", { class: "grid" }, fld("Erfahrung", nIn(q.rew, "xp", { opt: true })), fld("Noten", nIn(q.rew, "gold", { opt: true })), fld("Instrument", sIn(q.rew, "instr", instrOptions("keins"), { opt: true, none: 1 }))),
        h("div", { class: "ph" }, "Folgen"), h("div", { class: "grid" }, fld("Spezialwirkung", sIn(q, "flag", [["", "keine"], ["gate", "öffnet Tor 1→2"], ["gate3", "öffnet Tor 2→3"], ["gate4", "öffnet Tor 3→4"], ["look", "schaltet Aussehen-Änderung frei"], ["ida", "schaltet Ida frei"]], { opt: true, none: 1 })), fld("Schaltet versteckte NPCs frei (nichts angehakt = keinen)", opens), fld("Setzt Merker", sets, "für Bedingungen „flag:name“")),
        h("div", { class: "ph" }, "Gespräch"), fld("Wenn noch gesperrt", aIn(x, "locked", { rows: 2, opt: true })), h("label", { class: "fld" }, h("span", null, "Angebot (Absätze)"), strList(Array.isArray(x.offer) ? x.offer : (x.offer = x.offer ? [x.offer] : [""]), { rows: 3, add: "Absatz" })), fld("Erinnerung, solange es läuft", aIn(x, "remind", { rows: 2, opt: true })), h("label", { class: "fld" }, h("span", null, "Abgabe (Absätze)"), strList(Array.isArray(x.done) ? x.done : (x.done = x.done ? [x.done] : [""]), { rows: 3, add: "Absatz" })),
        h("button", { class: "btn warn", style: { marginTop: "10px" }, onclick: async () => { if (await del("Aufgabe", q.title)) { delete QUESTS[id]; delete QX[id]; Object.values(QUESTS).forEach(o => { if (o.after === id) delete o.after; }); touch(); renderTab(); } } }, "Aufgabe löschen"));
    } });
});

/* ----- Grafiken ----- */
const TEMPL_OBJ = "// Zeichnet in ein Feld von 32×32. px, py = obere linke Ecke. Mitte unten = px+16, py+28.\nTH.shadow(c, px, py, 10);\nTH.rect(c, px + 14, py + 14, 4, 12, '#f0e8d0');\nTH.blob(c, px + 16, py + 12, 9, '#d9534f');\nTH.hi(c, px + 13, py + 9, 3, 2);";
const TEMPL_ICON = "// Feld von 40×40. Mitte = (20, 20).\nTH.blob(c, 20, 22, 12, '#e6b84a');\nTH.rect(c, 17, 6, 6, 10, '#7a5228');\nTH.hi(c, 15, 17, 4, 3);";
tab("grafiken", "Grafiken", "Projekt", root => {
  root.append(head("Eigene Grafiken", "Neue Böden und Objekte. Sage mir im Chat, was du brauchst. Ich baue dir ein Code-Schnipsel, das du hier einfügst. Auch PNG-Bilder gehen."));
  const list = () => [...Object.keys(ED.assets.tiles).map(k => ({ id: k, label: ED.assets.tiles[k].n || k, group: ED.assets.tiles[k].kind === "ground" ? "Böden" : "Objekte" })), ...Object.keys(ED.assets.icons).map(k => ({ id: k, label: ED.assets.icons[k].n || k, group: "Symbole" }))];
  const apply = () => { registerAssets(); palCache.clear(); invalidateAll(); };
  root.append(h("div", { class: "row", style: { margin: "6px 0", flexWrap: "wrap" } },
    h("button", { class: "btn sm pri", onclick: () => libPick("icon", r => { const id = uid(slug(r.n), i => ED.assets.icons[i] || ICON_KINDS.includes(i)); ED.assets.icons[id] = { n: r.n, code: r.code }; apply(); touch(); ED.sel.gfx = id; renderTab(); }) }, "Symbol aus Bibliothek"),
    h("button", { class: "btn sm pri", onclick: () => libPick("obj", r => { const id = uid(r.id, i => ED.assets.tiles[i] || TILE_REG[i]); ED.assets.tiles[id] = { kind: "obj", n: r.n, cat: r.cat, solid: r.solid, code: r.code }; apply(); touch(); ED.sel.gfx = id; renderTab(); }) }, "Objekt aus Bibliothek"),
    h("button", { class: "btn sm pri", onclick: () => libPick("ground", r => { const id = uid(slug(r.n), i => ED.assets.tiles[i] || TILE_REG[i]); ED.assets.tiles[id] = Object.assign({ kind: "ground" }, r); apply(); touch(); ED.sel.gfx = id; renderTab(); }) }, "Boden aus Bibliothek"),
    h("button", { class: "btn sm", onclick: async () => { const sel = h("select", null, ICON_KINDS.map(k => h("option", { value: k }, k))); const id = await new Promise(r => modal("Eingebautes Symbol bearbeiten", h("div", null, h("p", null, "Das Symbol wird als Code-Kopie angelegt, mit derselben Kennung. Es ersetzt dann überall das Original (Instrumente, Fundstücke, Läden). Mit „Löschen“ gilt wieder das Original."), sel), [{ label: "Abbrechen", fn: () => r(null) }, { label: "Übernehmen", kind: "pri", fn: () => r(sel.value) }])); if (!id) return; ED.assets.icons[id] = { n: id + " (eigene Fassung)", code: "/* Das eingebaute Aussehen. Ändere es oder zeichne darüber. */\ndrawIcon(c, " + JSON.stringify(id) + ", 0, 0, 40, true);\n" }; apply(); touch(); ED.sel.gfx = id; renderTab(); } }, "Eingebautes Symbol bearbeiten"),
    h("button", { class: "btn sm", onclick: async () => {
    const cats = Object.keys(TILE_BASE).filter(k => !ED.assets.tiles[k]).sort(); const sel = h("select", null, cats.map(k => h("option", { value: k }, (TILE_BASE[k].kind === "ground" ? "Boden: " : "Objekt: ") + TILE_BASE[k].n + " (" + k + ")")));
    const id = await new Promise(r => modal("Eingebaute Kachel bearbeiten", h("div", null, h("p", null, "Die Kachel wird als eigene Kopie angelegt, mit demselben Namen. Alle Stellen auf der Karte nehmen die Änderung an. Du kannst sie jederzeit löschen, dann gilt wieder das Original."), sel), [{ label: "Abbrechen", fn: () => r(null) }, { label: "Übernehmen", kind: "pri", fn: () => r(sel.value) }]));
    if (!id) return; ED.assets.tiles[id] = tileTemplate(id); apply(); touch(); ED.sel.gfx = id; renderTab(); } }, "Eingebaute Kachel bearbeiten")));
  listDetail(root, { key: "gfx", title: "Eigene Kacheln", empty: "Noch keine eigene Grafik. Lege oben eine an.", items: list,
    extra: h("button", { class: "btn sm", onclick: async () => { const k = await new Promise(r => { modal("Neu", h("p", null, "Was soll es sein?"), [{ label: "Abbrechen", fn: () => r(null) }, { label: "Boden", kind: "pri", fn: () => r("ground") }, { label: "Objekt", kind: "pri", fn: () => r("obj") }, { label: "Symbol", kind: "pri", fn: () => r("icon") }]); }); if (!k) return; const n = await askText("Name", "Name", k === "obj" ? "Neues Objekt" : k === "icon" ? "Neues Symbol" : "Neuer Boden"); if (!n) return; if (k === "icon") { const iid = uid("i_" + slug(n), i => ED.assets.icons[i] || ICONS.includes(i)); ED.assets.icons[iid] = { n, code: TEMPL_ICON }; ED.sel.gfx = iid; touch(); apply(); renderTab(); return; } const id = uid("x_" + slug(n), i => TILE_REG[i] || ED.assets.tiles[i]); ED.assets.tiles[id] = k === "ground" ? { kind: "ground", n, cat: "Eigene", col: "#9fd480", col2: "#8cc675", tex: "tufts", tcol: "#6aa65a", dens: .6 } : { kind: "obj", n, cat: "Eigene", solid: true, code: TEMPL_OBJ }; ED.sel.gfx = id; touch(); apply(); renderTab(); } }, "+ Neu"),
    detail: (id, el, redraw) => {
      if (ED.assets.icons[id]) { const a = ED.assets.icons[id], err = h("p", { style: { color: "var(--danger)" } }); const upd = () => { apply(); err.textContent = (ICON_X[id] && ICON_X[id].err) || ""; };
        const pv = preview(160, 160, (c, t) => { c.fillStyle = "#e9dfc0"; c.fillRect(0, 0, 160, 160); drawIcon(c, id, 20, 20, 120 + Math.sin(t * 2) * 4); }); const sm = preview(40, 40, (c) => { c.fillStyle = "#e9dfc0"; c.fillRect(0, 0, 40, 40); drawIcon(c, id, 4, 4, 32); });
        el.append(h("div", { class: "row", style: { alignItems: "flex-start" } }, h("div", null, pv, sm), h("div", { style: { flex: 1, minWidth: "260px" } }, h("h2", null, a.n || id), fld("Name", tIn(a, "n", { after: () => { upd(); redraw(); } })), a.png ? h("p", { class: "muted" }, "PNG-Bild, wird auf 40×40 gestreckt.") : fld("Zeichen-Code", aIn(a, "code", { code: true, rows: 10, after: upd }), "Parameter: c, TH, INK, hs, mixHex. Gezeichnet wird in ein Feld von 40×40."), h("div", { class: "row" }, h("label", { class: "btn sm" }, "PNG wählen", h("input", { type: "file", accept: "image/png,image/webp", hidden: true, onchange: e => readImg(e.target.files[0], 96, d => { a.png = d; delete a.code; touch(); upd(); renderTab(); }) })), a.png ? h("button", { class: "btn sm", onclick: () => { delete a.png; a.code = TEMPL_ICON; touch(); upd(); renderTab(); } }, "Zurück zu Code") : null))), err,
          h("p", { class: "muted" }, "Dieses Symbol wählst du dann bei Instrumenten und Fundstücken unter „Symbol“ (mit ★ markiert)."), h("button", { class: "btn warn", onclick: async () => { if (await del("Symbol", a.n || id)) { delete ED.assets.icons[id]; Object.values(INSTR).forEach(q => { if (q.kind === id) q.kind = "flute"; }); Object.values(ITEMS).forEach(q => { if (q.kind === id) q.kind = "shard"; }); touch(); apply(); renderTab(); } } }, "Symbol löschen")); return; }
      const a = ED.assets.tiles[id], upd = () => { apply(); pv.__r = 1; }; const err = h("p", { style: { color: "var(--danger)" } });
      const pv = preview(160, 160, (c, t) => { c.fillStyle = "#a9dc86"; c.fillRect(0, 0, 160, 160); const def = TILE_REG[id]; if (!def) return; err.textContent = def.err || ""; c.save(); c.scale(3, 3); c.lineJoin = c.lineCap = "round"; try { if (a.kind === "ground") { for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) { c.fillStyle = groundColor(def, 30 + i, 30 + j); c.fillRect(i * 16, j * 16, 17, 17); } c.save(); c.scale(.5, .5); for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) groundTex(c, def, i * 32, j * 32, 30 + i, 30 + j); c.restore(); } else { c.translate(10, 4); c.scale(1, 1); drawObject(c, def, 0, 12, 40, 40); } } catch (e) { err.textContent = String(e); } c.restore(); });
      const f = [h("div", { class: "grid" }, fld("Name", tIn(a, "n", { after: () => { upd(); redraw(); } })), fld("Gruppe in der Palette", tIn(a, "cat", { after: upd })), a.kind === "obj" ? chk(a, "solid", "blockiert den Weg", { after: upd }) : null)];
      if (a.kind === "ground") {
        f.push(h("div", { class: "grid" }, fld("Farbe 1", cIn(a, "col", { after: upd })), fld("Farbe 2", cIn(a, "col2", { after: upd })), fld("Muster", sIn(a, "tex", Object.keys(GTEX), { after: upd })), fld("Musterfarbe", cIn(a, "tcol", { after: upd })), fld("Dichte", rIn(a, "dens", 0, 1, .05, { def: .6, after: upd })), optColor(a, "tcol2", "2. Musterfarbe", "#ffffff", upd)), h("div", { class: "row" }, chk(a, "t3", "ist Wasser (nicht begehbar)", { after: () => { a.solid = !!a.t3; upd(); } })));
      } else {
        f.push(a.png ? h("div", { class: "grid" }, fld("Breite", nIn(a, "iw", { after: upd })), fld("Höhe", nIn(a, "ih", { after: upd })), fld("Versatz x", nIn(a, "ox", { opt: true, after: upd })), fld("Versatz y", nIn(a, "oy", { opt: true, after: upd }))) : fld("Zeichen-Code", aIn(a, "code", { code: true, rows: 12, after: upd }), "Parameter: c, px, py, s, x, y, TH, INK, hs, mixHex. Ein Feld ist 32×32; Dinge dürfen nach oben herausragen."),
          h("div", { class: "row" }, h("label", { class: "btn sm" }, "PNG wählen", h("input", { type: "file", accept: "image/png,image/webp", hidden: true, onchange: e => readImg(e.target.files[0], 160, (d, w, hh) => { a.png = d; delete a.code; a.iw = Math.min(96, w); a.ih = Math.round(a.iw * hh / w); touch(); upd(); renderTab(); }) })), a.png ? h("button", { class: "btn sm", onclick: () => { delete a.png; delete a.iw; delete a.ih; a.code = TEMPL_OBJ; touch(); upd(); renderTab(); } }, "Zurück zu Code") : null));
      }
      el.append(h("div", { class: "row", style: { alignItems: "flex-start" } }, pv, h("div", { style: { flex: 1, minWidth: "260px" } }, h("h2", null, a.n || id), f)), err, h("button", { class: "btn warn", style: { marginTop: "10px" }, onclick: async () => { if (await del("Kachel", a.n || id)) { delete ED.assets.tiles[id]; if (!TILE_BASE[id]) for (let i = 0; i < WW * WH; i++) { if (GR[i] === id) GR[i] = null; if (OB[i] === id) OB[i] = null; } SPECIES.forEach(s => { }); touch(); apply(); renderTab(); } } }, "Kachel löschen"));
    } });
});

/* ----- Prüfen ----- */
function validate() {
  const out = [], add = (lv, msg, where) => out.push({ lv, msg, where }); const walk = (x, y) => inW(x, y) && (T[y][x] === 1 || T[y][x] === 2 || T[y][x] === 5);
  if (!walk(START.tx, START.ty)) add("bad", "Der Start liegt nicht auf einer begehbaren Kachel.", [START.tx, START.ty]);
  const seen = new Uint8Array(WW * WH), q = [[START.tx, START.ty]]; if (walk(START.tx, START.ty)) seen[idx(START.tx, START.ty)] = 1;
  const gates = [GATE, GATE3, GATE4]; const gateRow = (x, y) => gates.some(g => y === g.y && x >= g.x && x < g.x + g.w);
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (!inW(xx, yy) || seen[idx(xx, yy)]) continue; if (!walk(xx, yy) && !gateRow(xx, yy)) continue; seen[idx(xx, yy)] = 1; q.push([xx, yy]); } }
  const reach = (x, y) => inW(x, y) && seen[idx(x, y)];
  Object.keys(NPCS).forEach(id => { const n = NPCS[id]; if (!inW(n.x, n.y) || !(T[n.y][n.x] === 1 || T[n.y][n.x] === 2 || T[n.y][n.x] === 5 || T[n.y][n.x] === 4)) add("bad", n.n + " steht nicht auf begehbarem Boden.", [n.x, n.y]); else if (!n.secret && !reach(n.x, n.y) && !([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => reach(n.x + dx, n.y + dy)))) add("bad", n.n + " ist vom Start aus nicht erreichbar.", [n.x, n.y]); if (inW(n.x, n.y) && AM[idx(n.x, n.y)] !== n.area) add("warn", n.n + ": Bereich " + n.area + " passt nicht zur Karte (" + AM[idx(n.x, n.y)] + ").", [n.x, n.y]); if (n.shop && !SHOPS[n.shop]) add("bad", n.n + " verweist auf den Laden „" + n.shop + "“, den es nicht gibt."); if (n.secret && !FWALLS[id] && id !== "ida" && !Object.values(QUESTS).some(qq => (qq.opens || []).includes(id))) add("warn", n.n + " ist versteckt, aber keine Aufgabe schaltet ihn frei."); });
  Object.keys(ITEMS).forEach(id => { const it = ITEMS[id]; if (!inW(it.x, it.y) || !reach(it.x, it.y) && ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => reach(it.x + dx, it.y + dy))) add("warn", "Fundstück „" + it.n + "“ ist vom Start aus nicht erreichbar.", [it.x, it.y]); });
  const usedZones = {}; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) { const z = ZN[y][x]; if (z && (T[y][x] === 1 || T[y][x] === 2)) { const o = usedZones[z] || (usedZones[z] = { n: 0, r: 0, p: [x, y] }); o.n++; if (reach(x, y)) o.r++; } }
  Object.keys(ZINFO).forEach(z => { const u = usedZones[z]; if (u) { if (!speciesWeights(z, false, 0, false).length) add("warn", "In der Zone „" + ZINFO[z].n + "“ lebt tagsüber kein Tonling, obwohl man dort fangen kann.", u.p); if (!u.r) add("warn", "Die Zone „" + ZINFO[z].n + "“ ist vom Start aus nicht erreichbar.", u.p); } });
  SPECIES.forEach(s => { s.z.forEach(k => { if (!ZINFO[k]) add("bad", s.n + " lebt in einer Zone, die es nicht gibt (" + k + ")."); else if (ZINFO[k].a !== s.a) add("warn", s.n + " gehört zu Bereich " + s.a + ", die Zone „" + ZINFO[k].n + "“ aber zu Bereich " + ZINFO[k].a + "."); }); if (!RAR[s.r]) add("bad", s.n + " hat eine unbekannte Seltenheit."); if (!s.z.length) add("info", s.n + " lebt in keiner Zone und ist nicht zu fangen."); });
  Object.keys(QUESTS).forEach(id => { const qq = QUESTS[id]; if (!NPCS[qq.npc]) add("bad", "Aufgabe „" + qq.title + "“: der NPC " + qq.npc + " fehlt."); if (qq.after && !QUESTS[qq.after]) add("bad", "Aufgabe „" + qq.title + "“ setzt eine Aufgabe voraus, die es nicht gibt (" + qq.after + ")."); (qq.parts || []).forEach((p, i) => { if (p.k === "item" && !ITEMS[p.id]) add("bad", "Aufgabe „" + qq.title + "“ Teil " + (i + 1) + ": Fundstück " + p.id + " fehlt."); const f = p.f || {}; if (f.sp && !SP[f.sp]) add("bad", "Aufgabe „" + qq.title + "“ Teil " + (i + 1) + ": die Art " + f.sp + " fehlt."); if (f.mut && f.mut !== "any" && !MUTS.find(m => m.id === f.mut)) add("bad", "Aufgabe „" + qq.title + "“ Teil " + (i + 1) + ": die Mutation " + f.mut + " fehlt."); if (!p.txt) add("warn", "Aufgabe „" + qq.title + "“ Teil " + (i + 1) + " hat keinen Text."); if (f.sp && SP[f.sp] && !SP[f.sp].z.length) add("warn", "Aufgabe „" + qq.title + "“: " + SP[f.sp].n + " ist nirgends zu fangen."); }); if (qq.rew && qq.rew.instr && !INSTR[qq.rew.instr]) add("bad", "Aufgabe „" + qq.title + "“ belohnt mit einem Instrument, das es nicht gibt."); (qq.opens || []).forEach(o => { if (!NPCS[o]) add("bad", "Aufgabe „" + qq.title + "“ schaltet " + o + " frei, den NPC gibt es nicht."); }); if (!QX[id] || !(QX[id].offer && QX[id].offer.length)) add("info", "Aufgabe „" + qq.title + "“ hat kein Angebotsgespräch."); });
  Object.keys(SHOPS).forEach(k => SHOPS[k].items.forEach(it => { if (!INSTR[it.id]) add("bad", "Laden „" + SHOPS[k].name + "“ verkauft ein Instrument, das es nicht gibt (" + it.id + ")."); }));
  Object.keys(STORY).forEach(k => { if (!NPCS[k] && !/Loop$/.test(k)) add("info", "Erzähltexte für " + k + ", den NPC gibt es nicht."); });
  const eq = Object.keys(INSTR)[0]; if (!INSTR.holz) add("warn", "Das Start-Instrument „holz“ fehlt. Das Spiel gibt es Neulingen zuerst.");
  if (!Object.values(QUESTS).some(qq => qq.flag === "gate") && RELEASE) add("info", "Keine Aufgabe öffnet Tor 1→2. Falls du es brauchst, setze bei einer Aufgabe „Spezialwirkung“.");
  const nCust = Object.keys(ED.assets.tiles).length; let blocked = 0; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (T[y][x] === 6 && houseAt(x, y) < 0) blocked++; if (blocked) add("info", blocked + " Hauskacheln gehören zu keinem Haus (sie bleiben grau).");
  return out;
}
tab("pruefen", "Prüfen", "Projekt", root => {
  root.append(head("Prüfen", "Sucht Fehler: unerreichbare Figuren, fehlende Verweise, Zonen ohne Tonlinge."));
  const box = card(); root.append(box);
  const run = () => { box.innerHTML = ""; const r = validate(); box.append(h("div", { class: "row" }, h("button", { class: "btn pri", onclick: run }, "Erneut prüfen"), h("span", { class: "tag " + (r.some(x => x.lv === "bad") ? "bad" : "good") }, r.filter(x => x.lv === "bad").length + " Fehler"), h("span", { class: "tag" }, r.filter(x => x.lv === "warn").length + " Hinweise"), h("span", { class: "tag" }, r.filter(x => x.lv === "info").length + " Anmerkungen")));
    if (!r.length) box.append(h("p", null, "Alles in Ordnung."));
    ["bad", "warn", "info"].forEach(lv => r.filter(x => x.lv === lv).forEach(x => box.append(h("div", { class: "issue" }, h("span", { class: "tag " + (lv === "bad" ? "bad" : "") }, lv === "bad" ? "Fehler" : lv === "warn" ? "Hinweis" : "Info"), h("span", { style: { flex: 1 } }, x.msg), x.where ? h("button", { class: "btn sm", onclick: () => { ED.tab = "welt"; renderTab(); requestAnimationFrame(() => { centerOn(x.where[0], x.where[1]); W.s = Math.max(W.s, 24); W.hover = x.where; W.need = true; }); } }, "Hinspringen") : null)))); };
  run();
});

/* ----- Hilfe ----- */
const TUT = [
  ["Los geht's: der erste Rundgang (10 Minuten)", [
    "Oben siehst du die Hauptbereiche: Welt, Tonlinge, Figuren, Gegenstände, Grafiken, Spiel & Regeln. Darunter erscheinen die Unterseiten. Mit Strg+K suchst du alles (Tonling, Figur, Instrument, Aufgabe, Zone).",
    "Auf „⌂ Start“ gibt es zwei Wege: das große Spiel umbauen, oder „Ganz von vorn beginnen“ (leere Wiese, aber alle Grafiken des großen Spiels bleiben benutzbar).",
    "Empfohlene Reihenfolge für ein neues Spiel: 1. Welt malen, 2. Zonen anlegen, 3. Tonlinge erfinden, 4. Instrumente und Fundstücke, 5. Figuren und Aufgaben, 6. Spielfigur & Start, 7. Prüfen, 8. Testspiel, 9. Speichern.",
    "Oben „▶ Testspiel“ startet dein Spiel sofort im Editor, ohne zu speichern. Du kannst jederzeit hin- und herwechseln.",
    "Strg+Z macht rückgängig, Strg+Y wiederholt. Der Entwurf wird im Browser automatisch gemerkt, zusätzlich solltest du regelmäßig „Speichern“ drücken (Datei .tonlinge.json)."]],
  ["Welt › Weltkarte: die Karte malen", [
    "Links wählst du Werkzeug und Ebene, in der Mitte malst du. Leertaste halten oder rechte Maustaste verschiebt die Karte, Mausrad zoomt, [ und ] ändern die Pinselgröße, Alt beim Malen radiert.",
    "Werkzeuge: B Pinsel, R Fläche, O Rahmen, L Linie, E Ellipse, F Füllen, X Radierer, I Pipette, S Auswahl (kopieren, einfügen), N NPC setzen, H Haus setzen.",
    "Ebenen (Ziffern 1 bis 5): Gelände (begehbar oder Hindernis), Boden (Optik des Bodens), Objekte (Bäume, Steine, Deko), Bereich (zu welchem Bereich 1 bis 4 eine Kachel gehört) und Zone (der Lebensraum, in dem Tonlinge erscheinen).",
    "Zuerst das Gelände: Wiese begehbar machen, Wasser und Felsen als Hindernis. Danach Boden und Objekte für die Optik. Zuletzt Zonen darüber malen.",
    "Das Werkzeug „Geheimwand“ versteckt einen Durchgang, der sich öffnet, wenn eine Aufgabe einen versteckten NPC freischaltet.",
    "Start- und Torpunkte setzt du mit den Markern auf der Karte. Der Start ist der Ort, an dem neue Spieler und der „Festgesteckt?“-Knopf landen."]],
  ["Welt › Bereiche und Zonen", [
    "Ein Bereich ist eine große Gegend (bis zu vier). Er hat Namen, Erfahrungsfaktor, Aussehen (wie Bereich 1, 2, 3 oder 4), Stimmung/Tönung und ein Level, ab dem er offen ist. „+ Neu“ legt einen weiteren Bereich an.",
    "Eine Zone ist ein Lebensraum innerhalb eines Bereichs (zum Beispiel Wiese, Höhle). Zonen haben Name, Farbe, Musik und bestimmen, welche Tonlinge dort vorkommen. Zonen malst du auf der Weltkarte in der Ebene „Zone“.",
    "Wichtig: Eine Zone ohne Tonlinge bleibt leer. Verknüpfe sie im Tonling selbst („Lebensraum“) oder in „Spawns“."]],
  ["Tonlinge › Arten: einen Tonling erfinden", [
    "„+ Neu“ legt eine Art an. „+ Aus großem Spiel“ kopiert eine der 53 fertigen Arten samt Aussehen, die du dann frei änderst.",
    "Einstellbar: Name, Seltenheit, Bereich, Lebensräume (Zonen), Frequenz (Tonhöhe, mit der man ihn lockt), Form und Farben, Wert, Erfahrung, Schwierigkeit („Leichtigkeit“) und Rastzone (wo er schläft) pro Art.",
    "Aussehen: Wähle eine Standardform und Farben, eine Form aus der Grafik-Bibliothek oder eine eigene Zeichnung per Code (siehe Grafiken).",
    "Stat-Werte dürfen über 60 gehen. Die Tabelle unten in „Spiel & Regeln“ legt fest, wie Werte wirken.",
    "Mit „Spawns & Seltenheiten“ siehst du die Prozentchancen und erstellst eigene Seltenheiten (Name, Farbe, Gewicht, Erfahrung, Wert, Effekt, Fang-Text, Starthilfe)."]],
  ["Tonlinge › Mutationen", [
    "Mutationen sind seltene Varianten (zum Beispiel golden). Du änderst Name, Chance, Farbe, Wertfaktor und kannst den Look per Code verändern. Eigene Mutationen werden bei Fängen mit ausgewürfelt."]],
  ["Figuren › NPCs", [
    "„+ Neu“ legt eine Figur an. Name, Position (x, y) oder per N-Werkzeug auf der Karte, Kurzbeschreibung, „kauft Fänge an“ und „versteckt, bis eine Aufgabe sie freischaltet“.",
    "Aussehen: Haare, Haut, Kleidung, Hut, Bart, Brille, Halskette. „none“ schaltet ein Teil aus. „Aussehen kopieren von“ übernimmt die Optik einer Figur des großen Spiels, den Rest passt du an. Fortgeschritten: ein Code-Feld für völlig eigene Zeichnungen.",
    "Gespräche: Begrüßung, Stimme und Laden. Einem NPC weist du einen Laden zu (siehe Läden)."]],
  ["Figuren › Aufgaben", [
    "Jede Aufgabe gehört einem NPC, hat ein Mindestlevel, eine optionale Voraussetzung („danach“) und Teile: Fange n Tonlinge (mit Filter nach Art, Mutation, Seltenheit, Bereich), bringe Gegenstände, zahle Noten, spiele perfekt, erreiche Serien. Alle Teile müssen erfüllt sein, dann gibt man ab.",
    "Texte: Angebot, Erinnerung und Dank schreibst du selbst. Belohnungen: Erfahrung, Gold, Instrument, Fundstücke.",
    "Folgen: Spezialwirkungen (Tor öffnen, Aussehen-Änderung freischalten) und „Schaltet versteckte NPCs frei“. Dort siehst du nur NPCs, die als „versteckt“ markiert sind, und es wird nichts freigeschaltet, solange nichts angehakt ist. „Setzt Merker“ ist für eigene Bedingungen im Skript."]],
  ["Figuren › Spielfigur & Start", [
    "Aussehen der Spielfigur, Startposition-Hinweise, Start-Instrumente, Startgold, Startlevel und Startuhrzeit. Anfangs-Merker („gotFlute“, „hasIdx“) geben dir Flöte und Tonlingsbuch von Beginn an."]],
  ["Gegenstände: Instrumente, Fähigkeiten, Fundstücke, Läden", [
    "Instrumente: Werte, Fähigkeit, Symbol, Lied oder Musikstück. „Symbol aus großem Spiel“ holt eines von 38 fertigen Symbolen.",
    "Fähigkeiten: eigene Wirkungen (Stat-Boni, Fang-Hilfen). Ein Instrument verweist darauf.",
    "Fundstücke: Gegenstände, die man findet, sammelt, abgibt oder verkauft. Name, Symbol, Wert, Fundort.",
    "Läden: Warenliste mit Preisen. Ein Laden wird einem NPC zugewiesen (im NPC-Reiter)."]],
  ["Grafiken: Bibliothek und Code", [
    "Die Bibliothek enthält fertige Symbole, Tonling-Formen, Objekte und Böden. Mit „Aus Bibliothek“ übernimmst du sie in deine Gegenstände, Tonlinge oder Karte.",
    "Alles, was gezeichnet wird, kannst du per Zeichencode ändern: NPCs, Mutationen, Symbole, Kacheln und Formen. „Eingebautes Symbol bearbeiten“ und „Eingebaute Kachel bearbeiten“ geben dir eine fertige Vorlage, die du nur anpasst. Ein Live-Vorschau-Feld zeigt sofort das Ergebnis.",
    "Brauchst du etwas Neues, beschreibe es im Chat, ich liefere den Code, den du einfügst."]],
  ["Spiel & Regeln", [
    "Einstellungen: Titel, Name der Welt, Freigabe (wie viele Bereiche spielbar sind).",
    "Regeln & Farben: Erfahrungskurve, Tageslänge, Texte der Oberfläche, Farben der Menüs.",
    "Experte (Schalter oben rechts) zeigt zusätzlich: Fang-Minispiel (Zeiten, Treffer, Schwierigkeit), Texte & Skript (Wörter im ganzen Spiel umbenennen, eigenes Skript am Ende) und Alle Daten (jede Tabelle als Formular)."]],
  ["Prüfen, Testspiel, Speichern, Veröffentlichen", [
    "„Prüfen“ findet NPCs im Wald oder hinter Wänden, Aufgaben mit fehlenden NPCs, Tonlinge ohne Lebensraum und ähnliches. Behebe rote Punkte zuerst.",
    "„▶ Testspiel“ lädt dein Spiel eingebettet. Gehe die Aufgaben einmal selbst durch.",
    "„Speichern“ erzeugt eine Datei .tonlinge.json. „Öffnen“ lädt sie wieder. Im Spiel selbst ladest du sie über Hilfe › Projektdatei laden.",
    "Tipp: Speichere vor großen Umbauten unter einem neuen Namen, so hast du Sicherungen."]],
  ["Häufige Fragen", [
    "Meine Figur steckt fest: Im Spiel gibt es unten den Knopf „Festgesteckt? Zum Start“.",
    "Ein Bereich bleibt gesperrt: Prüfe Freigabe (Einstellungen) und das Tor auf der Karte.",
    "Ein Tonling erscheint nicht: Hat er eine Zone, ist die Zone auf der Karte gemalt, passt sein Bereich?",
    "Ein NPC erscheint nicht: Ist er „versteckt“? Dann muss eine Aufgabe ihn freischalten.",
    "Wo sind meine Änderungen? Alles ist im Projekt; nur „Speichern“ macht daraus eine Datei."]]
];
tab("hilfe", "Anleitung", "Projekt", root => {
  root.append(head("Anleitung", "Lerne den Editor beim Bauen oder lies die Abschnitte nach."), h("div", { class: "card", style: { marginBottom: "10px" } }, h("b", null, "Interaktives Tutorial: dein erstes Gebiet"), h("p", { class: "muted" }, "27 Schritte von der leeren Wiese bis zum spielbaren Gebiet. Das Tutorial erkennt selbst, was du geschafft hast."), h("div", { class: "row" }, h("button", { class: "btn pri", onclick: () => tutStart(true) }, "Neu starten (leeres Spiel)"), ED.tut && Object.keys(ED.tut.done).length ? h("button", { class: "btn", onclick: () => tutStart(false) }, "Fortsetzen") : null)));
  TUT.forEach(([t, items], i) => { const d = h("details", { class: "card", style: { marginBottom: "8px", padding: "8px 12px" } }, h("summary", { style: { cursor: "pointer", fontWeight: "700" } }, (i + 1) + ". " + t), h("ul", { style: { lineHeight: "1.55" } }, items.map(x => h("li", null, x)))); if (i === 0) d.open = true; root.append(d); });
  root.append(h("p", { class: "muted" }, "Kürzel: B Pinsel, R Fläche, O Rahmen, L Linie, E Ellipse, F Füllen, X Radierer, I Pipette, S Auswahl, N NPC, H Haus. Strg+K sucht."));
});

/* ----- Start ----- */
function edBoot() {
  captureBase(); registerAssets(); if (W.flat === null) W.flat = null;
  // Standardreiter: Zeigt die Gruppen in der Reihenfolge der Registrierung
  const order = ["welt", "bereiche", "zonen", "tonlinge", "spawns", "mutationen", "npcs", "quests", "laeden", "items", "instr", "grafiken", "einst", "pruefen", "hilfe"];
  const hash = (location.hash || "").slice(1); ED.tab = TABS.find(t => t.id === hash) ? hash : "start";
  const pn = $q("#pname"); pn.value = ED.name; pn.oninput = () => { ED.name = pn.value; touch(); };
  $q("#bPlay").onclick = playtest; $q("#bUndo").onclick = doUndo; $q("#bRedo").onclick = doRedo; $q("#bSave").onclick = saveFile; $q("#bOpen").onclick = () => $q("#fOpen").click();
  $q("#fOpen").onchange = e => { const f = e.target.files[0]; if (f) openFile(f); e.target.value = ""; };
  $q("#bMore").onclick = () => {
    const body = h("div", { class: "col", style: { display: "flex", flexDirection: "column", gap: "6px" } },
      h("button", { class: "btn", onclick: () => { try { const d = localStorage.getItem("tonlinge-projekt-v1"); } catch (e) {} showText(JSON.stringify(buildProject())); } }, "Projekt als Text anzeigen"),
      h("button", { class: "btn", onclick: async () => { if (await ask("Neue Welt", "Alle Änderungen verwerfen und mit der Standardwelt neu beginnen?", "Neu beginnen")) { resetToBase(); registerAssets(); ED.undo = []; ED.redo = []; ED.dirty = false; $q("#pname").value = ED.name; invalidateAll(); renderTab(); try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} } } }, "Neu beginnen (Standardwelt)"));
    modal("Mehr", body);
  };
  const upd = () => { $q("#bUndo").disabled = !ED.undo.length; $q("#bRedo").disabled = !ED.redo.length; }; setInterval(upd, 400);
  window.addEventListener("beforeunload", e => { if (ED.dirty) { e.preventDefault(); e.returnValue = ""; } });
  let draft = null; try { draft = localStorage.getItem(DRAFT_KEY); } catch (e) {}
  renderTab(); setStat();
  if (draft) { try { const P = JSON.parse(draft); if (P && P.format === PROJ_FORMAT) { const when = P.saved ? new Date(P.saved).toLocaleString("de-DE") : ""; modal("Entwurf gefunden", h("p", null, "Im Browser liegt ein Entwurf" + (P.name ? " („" + P.name + "“)" : "") + (when ? " vom " + when : "") + ". Weiterarbeiten?"), [{ label: "Verwerfen", fn: () => { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} } }, { label: "Weiterarbeiten", kind: "pri", fn: () => { try { loadProject(P); } catch (e) { toast("Entwurf konnte nicht geladen werden: " + e.message, true); } } }]); } } catch (e) {} }
}
