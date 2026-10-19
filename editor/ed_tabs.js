/* ===== WELTBAUER: Daten-Reiter (Bereiche, Zonen, Tonlinge, Spawns, Mutationen, Läden, Fundstücke, Instrumente, Einstellungen) ===== */
const del = async (what, name) => ask(what + " löschen", "„" + name + "“ wirklich löschen? Das lässt sich über den Rückgängig-Knopf nicht zurückholen.", "Löschen");
function head(title, sub) { return h("div", null, h("h2", null, title), sub ? h("p", { class: "muted" }, sub) : null); }
function card(...k) { return h("div", { class: "card" }, ...k); }
const CAPS = ["dome", "flat", "bell", "leafs", "umbrella", "spiral", "drop", "lantern", "crown", "cone", "helm", "crystal"], CAPN = { dome: "Kuppel", flat: "Flachhut", bell: "Glocke", leafs: "Blätter", umbrella: "Schirm", spiral: "Spirale", drop: "Tropfen", lantern: "Laterne", crown: "Krone", cone: "Kegel", helm: "Helm", crystal: "Kristall" };
const MARKN = { "": "keine", spots: "Punkte", stripes: "Streifen", fringe: "Fransen" };

/* ----- Bereiche ----- */
tab("bereiche", "Bereiche", "Spielwelt", root => {
  root.append(head("Bereiche", "Ein Bereich ist ein großer Teil der Welt mit eigenem Aussehen. Der Bereich bestimmt Erfahrungs-Faktor, Preise und Tempo der Tonlinge."));
  listDetail(root, { key: "area", title: "Bereiche", items: () => Object.keys(AREAS).map(k => ({ id: k, label: k + " · " + AREAS[k].name, color: AREA_COL[k] })),
    detail: (k, el, redraw) => { const a = AREAS[k]; el.append(h("h2", null, "Bereich " + k), h("div", { class: "grid" }, fld("Name", tIn(a, "name", { after: redraw })), fld("Erfahrung ×", nIn(a, "xpMul", { step: .1, opt: true }), "Faktor auf Fang-Erfahrung"), fld("Wert ×", nIn(a, "valMul", { step: .1, opt: true }), "Faktor auf den Verkaufswert"), fld("Tempo der Tonlinge ×", nIn(a, "wild", { step: .01, opt: true }), "1 = normal, höher = schwerer")),
      h("div", { class: "ph" }, "Seltenheit-Faktor auf die Spawn-Chance"), h("p", { class: "muted" }, "Leer lassen = 1. Kleiner als 1 macht diese Seltenheit hier seltener."), (() => { a.rm = a.rm || {}; return h("div", { class: "grid" }, RAR.map((r, i) => { const w = { rm: a.rm }; return fld(r.name, (() => { const e = h("input", { type: "number", step: .05, min: 0, value: a.rm[i] == null ? "" : a.rm[i] }); e.oninput = () => { if (e.value === "") delete a.rm[i]; else a.rm[i] = parseFloat(e.value); if (!Object.keys(a.rm).length) delete a.rm; else a.rm = a.rm; touch(); }; return e; })()); })); })(),
      h("p", { class: "muted" }, "Bereich 1 bis 4 haben feste Hintergrund-Motive, Musik und Bildstil. Weitere Bereiche kannst du auf der Karte mit der Ebene „Bereich“ benutzen."));
    } });
});

/* ----- Zonen ----- */
tab("zonen", "Zonen", "Spielwelt", root => {
  root.append(head("Zonen", "Eine Zone ist ein Gebiet mit eigener Bodenfarbe und eigenen Tonlingen. Die Zone malst du auf der Karte (Ebene „Zone“)."));
  listDetail(root, { key: "zone", title: "Zonen", onNew: async () => { const n = await askText("Neue Zone", "Name", "Neue Zone"); if (!n) return null; const id = uid(slug(n), i => ZINFO[i]); ZINFO[id] = { n, a: 1, dark: 0, col: "#9fd480", col2: "#8cc675" }; touch(); return id; },
    items: () => Object.keys(ZINFO).map(k => ({ id: k, label: ZINFO[k].n, group: "Bereich " + ZINFO[k].a + " · " + ((AREAS[ZINFO[k].a] || {}).name || ""), color: ZINFO[k].col })).sort((a, b) => a.group < b.group ? -1 : a.group > b.group ? 1 : 0),
    detail: (k, el, redraw) => { const z = ZINFO[k], cells = (() => { let n = 0; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (ZN[y][x] === k) n++; return n; })();
      const pv = preview(220, 60, (c) => { for (let i = 0; i < 7; i++) { c.fillStyle = mixHex(z.col || "#888888", z.col2 || z.col || "#888888", i / 6); c.fillRect(i * 31.4, 0, 32, 60); } c.fillStyle = "rgba(0,0,0," + (z.dark || 0) + ")"; c.fillRect(0, 0, 220, 60); });
      el.append(h("h2", null, z.n), h("p", { class: "muted" }, "Kennung: " + k + " · " + cells + " Kacheln auf der Karte"), pv, h("div", { class: "grid" }, fld("Name", tIn(z, "n", { after: redraw })), fld("Bereich", sIn(z, "a", areaOptions(), { num: true, after: redraw })), fld("Farbe 1", cIn(z, "col", { after: () => { invalidateAll(); redraw(); } })), fld("Farbe 2", cIn(z, "col2", { after: invalidateAll })), fld("Dunkelheit", rIn(z, "dark", 0, .7, .02, { def: 0, after: invalidateAll }), "0 = hell, 0,5 = Höhle")),
        h("div", { class: "ph" }, "Tonlinge dieser Zone"), zoneTable(k), h("div", { class: "row", style: { marginTop: "8px" } }, h("button", { class: "btn", onclick: () => { gotoTab("spawns"); ED.sel.spzone = k; renderTab(); } }, "Spawns bearbeiten"), h("button", { class: "btn warn", onclick: async () => { if (await del("Zone", z.n)) { delete ZINFO[k]; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (ZN[y][x] === k) ZN[y][x] = null; SPECIES.forEach(s => { s.z = s.z.filter(q => q !== k); }); touch(); invalidateAll(); renderTab(); } } }, "Zone löschen")));
    } });
});
function zoneTable(zone) {
  const day = speciesWeights(zone, false, 0, false), night = speciesWeights(zone, true, 0, false); const ids = [...new Set([...day, ...night].map(e => e.s.id))];
  if (!ids.length) return h("p", { class: "muted" }, "Hier wohnt noch kein Tonling. Trage die Zone bei einer Art ein.");
  const t = h("table", { class: "tbl" }, h("tr", null, h("th", null, ""), h("th", null, "Name"), h("th", null, "Seltenheit"), h("th", null, "Tag"), h("th", null, "Nacht")));
  ids.forEach(id => { const s = SP[id], d = day.find(e => e.s.id === id), n = night.find(e => e.s.id === id); t.append(h("tr", null, h("td", null, preview(40, 40, (c, tm) => drawTonling(c, s, 20, 24, 30, tm, null))), h("td", null, s.n), h("td", null, h("span", { style: { color: RAR[s.r].col, fontWeight: "bold" } }, RAR[s.r].name)), h("td", null, d ? (d.p * 100).toFixed(d.p < .01 ? 2 : 1) + " %" : "–"), h("td", null, n ? (n.p * 100).toFixed(n.p < .01 ? 2 : 1) + " %" : "–"))); });
  return h("div", { class: "scr" }, t);
}

/* ----- Tonlinge ----- */
const TYPN = { b: "Tag und Nacht", d: "nur am Tag", n: "nur nachts" };
tab("tonlinge", "Tonlinge", "Spielwelt", root => {
  root.append(head("Tonlinge", "Die Arten, die man fangen kann. Form, Farbe, Seltenheit, Frequenz und Lebensraum."));
  listDetail(root, { key: "sp", title: "Arten", onNew: async () => { const n = await askText("Neue Art", "Name", "Neuer Tonling"); if (!n) return null; const id = uid(slug(n), i => SP[i]); const z0 = Object.keys(ZINFO).find(k => ZINFO[k].a === 1); SPECIES.push({ id, n, r: 0, a: 1, z: [z0], t: "b", hz: [20, 34], spd: 1, body: "#e5e0f0", cap: "dome", capc: "#d98b5f" }); SP_REBUILD(); touch(); return id; },
    items: () => SPECIES.slice().sort((a, b) => a.a - b.a || a.r - b.r).map(s => ({ id: s.id, label: s.n, sub: RAR[s.r] ? RAR[s.r].name : "", group: "Bereich " + s.a, color: RAR[s.r] && RAR[s.r].col })),
    detail: (id, el, redraw) => {
      const s = SP[id]; let mutSel = ""; const mutBox = h("select", { onchange: e => { mutSel = e.target.value; } }, h("option", { value: "" }, "ohne Mutation"), MUTS.map(m => h("option", { value: m.id }, m.name)));
      const pv = preview(180, 170, (c, t) => { c.fillStyle = "#a9dc86"; c.fillRect(0, 0, 180, 170); try { drawTonling(c, s, 90, 100, 90, t, mutSel || null); } catch (e) { c.fillStyle = "#900"; c.fillText(String(e), 4, 14); } }, { light: false });
      const look = h("div");
      const fields = h("div", { class: "grid" }, fld("Name", tIn(s, "n", { after: redraw })), fld("Seltenheit", sIn(s, "r", rarOptions(), { num: true, after: redraw })), fld("Bereich", sIn(s, "a", areaOptions(), { num: true, after: () => { redraw(); renderTab(); } })), fld("Aktiv", sIn(s, "t", Object.entries(TYPN))),
        fld("Frequenz von", (() => { const e = nIn(s.hz, 0, { step: 1 }); return e; })(), "Hz-Bereich, in dem er einrastet"), fld("Frequenz bis", nIn(s.hz, 1, { step: 1 })), fld("Tempo ×", nIn(s, "spd", { step: .05, int: false, opt: true }), "größer = flinker"), fld("Häufigkeit ×", nIn(s, "w", { step: .1, int: false, opt: true }), "leer = 1, 0 = gar nicht"),
        fld("Körper", cIn(s, "body")), fld("Kopfform", sIn(s, "cap", CAPS.map(c => [c, CAPN[c]]), { opt: true, none: 1 })), fld("Kopffarbe", cIn(s, "capc")), fld("Muster", sIn(s, "mark", Object.entries(MARKN), { opt: true, none: 1 })), fld("Besonderheit", sIn(s, "x", [["", "keine"], ["glow", "leuchtet"], ["chimes", "klingelt"]], { opt: true, none: 1 })));
      const zbox = h("div", { class: "grid" }); const area = s.a;
      Object.keys(ZINFO).filter(k => ZINFO[k].a === area).forEach(k => { const on = s.z.includes(k), cb = h("input", { type: "checkbox", checked: on }); cb.onchange = () => { if (cb.checked) { if (!s.z.includes(k)) s.z.push(k); } else s.z = s.z.filter(q => q !== k); touch(); renderTab(); }; zbox.append(h("div", null, h("label", { class: "row", style: { gap: "5px" } }, cb, ZINFO[k].n), on ? fld("Faktor in dieser Zone", (() => { s.zw = s.zw || {}; const e = h("input", { type: "number", step: .1, min: 0, value: s.zw[k] == null ? "" : s.zw[k], placeholder: "1" }); e.oninput = () => { if (e.value === "") delete s.zw[k]; else s.zw[k] = parseFloat(e.value); if (!Object.keys(s.zw).length) delete s.zw; touch(); }; return e; })()) : null)); });
      const wrongArea = s.z.filter(k => ZINFO[k] && ZINFO[k].a !== s.a);
      const custom = h("div"); const drawCustom = () => { custom.innerHTML = ""; custom.append(h("p", { class: "muted" }, "Eine eigene Zeichnung ersetzt die Standardform. Entweder ein Code-Schnipsel (den baue ich dir im Chat) oder ein PNG-Bild."), fld("Zeichen-Code", aIn(s, "code", { code: true, rows: 6, opt: true, after: () => { pv.__r = 1; } }), "Parameter: c (Zeichenfläche), s (Größe), t (Zeit), sp, INK, hs, TH, mixHex. Mitte = (0,0)."), FORMS[s.id] && !s.code && !s.img ? h("button", { class: "btn sm", onclick: () => { s.code = "/* Die eingebaute Form. Ändere sie oder zeichne darüber. */\n" + fnSrc(FORMS[s.id]) + "(c, s, sp, t, sp.body, 1);\n"; touch(); drawCustom(); pv.__r = 1; } }, "Standardform als Code übernehmen und bearbeiten") : null, h("div", { class: "row" }, h("label", { class: "btn" }, "PNG wählen", h("input", { type: "file", accept: "image/png,image/webp", hidden: true, onchange: e => readImg(e.target.files[0], 256, d => { s.img = d; delete s.code; touch(); drawCustom(); }) })), s.img || s.code ? h("button", { class: "btn warn", onclick: () => { delete s.img; delete s.code; touch(); drawCustom(); } }, "Eigene Zeichnung entfernen") : null, s.img ? fld("Größe ×", nIn(s, "sc", { step: .1, int: false, opt: true })) : null)); }; drawCustom();
      el.append(h("div", { class: "row", style: { alignItems: "flex-start" } }, h("div", null, pv, mutBox), h("div", { style: { flex: 1, minWidth: "260px" } }, h("h2", null, s.n), h("p", { class: "muted" }, "Kennung: " + id + (SPECIES.length ? "" : "")), fields)), h("div", { class: "ph" }, "Lebensraum (Zonen im Bereich " + s.a + ")"), zbox,
        wrongArea.length ? h("p", { style: { color: "var(--danger)" } }, "Achtung: " + wrongArea.map(k => ZINFO[k].n).join(", ") + " liegt in einem anderen Bereich. Dort erscheint der Tonling nicht.") : null, h("div", { class: "ph" }, "Eigene Zeichnung"), custom,
        h("div", { class: "row", style: { marginTop: "10px" } }, h("button", { class: "btn", onclick: async () => { const n = await askText("Kopie", "Name der Kopie", s.n + " 2"); if (!n) return; const nid = uid(slug(n), i => SP[i]); const c = _clone(s); c.id = nid; c.n = n; SPECIES.push(c); SP_REBUILD(); touch(); ED.sel.sp = nid; renderTab(); } }, "Duplizieren"), h("button", { class: "btn warn", onclick: async () => { if (await del("Tonling", s.n)) { SPECIES.splice(SPECIES.indexOf(s), 1); SP_REBUILD(); touch(); renderTab(); } } }, "Löschen")));
    } });
});
function readImg(file, max, cb) { if (!file) return; const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)); if (k >= 1 && r.result.length < 250000) { cb(r.result, im.width, im.height); return; } const c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL("image/png"), c.width, c.height); }; im.onerror = () => toast("Das Bild konnte nicht gelesen werden.", true); im.src = r.result; }; r.readAsDataURL(file); }

/* ----- Spawns ----- */
tab("spawns", "Spawns", "Spielwelt", root => {
  root.append(head("Spawns und Chancen", "Pro Zone siehst du, wie wahrscheinlich welcher Tonling erscheint, und stellst es ein. Die Prozente sind die echten Werte im Spiel (für Glück 0)."));
  const zs = Object.keys(ZINFO); if (!ED.sel.spzone || !ZINFO[ED.sel.spzone]) ED.sel.spzone = zs[0];
  const sel = h("select", { onchange: e => { ED.sel.spzone = e.target.value; renderTab(); } }, zs.map(k => h("option", { value: k, selected: k === ED.sel.spzone }, "Bereich " + ZINFO[k].a + " · " + ZINFO[k].n))); root.append(h("div", { class: "row" }, h("label", null, "Zone: ", sel)));
  const zone = ED.sel.spzone, z = ZINFO[zone], c = card(); root.append(c);
  const area = z.a, all = SPECIES.filter(s => s.a === area);
  c.append(h("h2", null, z.n), h("p", { class: "muted" }, "Der Bereich dieser Zone ist " + area + ". Es gelten nur Arten aus Bereich " + area + "."));
  const draw = () => { tb.innerHTML = ""; const day = speciesWeights(zone, false, 0, false), night = speciesWeights(zone, true, 0, false);
    all.sort((a, b) => a.r - b.r).forEach(s => { const on = s.z.includes(zone), d = day.find(e => e.s === s), n = night.find(e => e.s === s); s.zw = s.zw || {};
      const cb = h("input", { type: "checkbox", checked: on }); cb.onchange = () => { if (cb.checked) s.z.push(zone); else s.z = s.z.filter(q => q !== zone); touch(); draw(); };
      const wz = h("input", { type: "number", step: .1, min: 0, value: s.zw[zone] == null ? "" : s.zw[zone], placeholder: "1", disabled: !on, style: { width: "70px" } }); wz.oninput = () => { if (wz.value === "") delete s.zw[zone]; else s.zw[zone] = parseFloat(wz.value); if (!Object.keys(s.zw).length) delete s.zw; touch(); drawPct(); };
      const bar = (e) => h("div", { class: "bar", style: { width: "110px" } }, h("i", { style: { display: "block", height: "100%", width: Math.min(100, e ? e.p * 100 : 0) + "%", background: RAR[s.r].col } }));
      const pct = (e) => e ? (e.p * 100).toFixed(e.p < .01 ? 2 : 1) + " %" : "–";
      tb.append(h("tr", { "data-id": s.id }, h("td", null, cb), h("td", null, preview(40, 40, (cc, tm) => drawTonling(cc, s, 20, 24, 30, tm, null))), h("td", null, s.n), h("td", null, h("span", { style: { color: RAR[s.r].col, fontWeight: "bold" } }, RAR[s.r].name)), h("td", null, sIn(s, "t", Object.entries(TYPN), { after: draw })), h("td", null, wz), h("td", { class: "d" }, bar(d), pct(d)), h("td", { class: "n" }, bar(n), pct(n)))); }); };
  const drawPct = () => draw();
  const tb = h("tbody"); c.append(h("div", { class: "scr" }, h("table", { class: "tbl" }, h("thead", null, h("tr", null, ["da", "", "Tonling", "Seltenheit", "Aktiv", "Faktor", "Tag", "Nacht"].map(x => h("th", null, x)))), tb))); draw();
  c.append(h("p", { class: "muted" }, "Die Chance ergibt sich aus der Seltenheit (siehe unten), dem Faktor des Bereichs, der Häufigkeit der Art und dem Faktor hier. Jede Seltenheit teilt ihr Gewicht unter ihren Arten auf."));
  const rc = card(h("h2", null, "Seltenheiten")); root.append(rc);
  rc.append(h("div", { class: "scr" }, h("table", { class: "tbl" }, h("tr", null, ["Name", "Farbe", "Gewicht", "Erfahrung", "Wert"].map(x => h("th", null, x))), ...RAR.map(r => h("tr", null, h("td", null, tIn(r, "name")), h("td", null, cIn(r, "col")), h("td", null, nIn(r, "w", { step: .01, int: false, after: draw })), h("td", null, nIn(r, "xp")), h("td", null, nIn(r, "val")))))), h("p", { class: "muted" }, "Das Gewicht ist die Grundchance der Stufe. Höhere Stufen werden vom Glück des Instruments begünstigt. Neue Stufen lassen sich nicht anlegen, aber alle Werte und Namen ändern."));
});

/* ----- Mutationen ----- */
const FXN = { "": "keiner", glow: "Leuchten", pulse: "Pulsieren", aura: "Aura", sparks: "Funken", stars: "Sterne", rings: "Ringe", notes: "Noten", bolts: "Blitze", bubbles: "Blasen", fire: "Feuer", snow: "Schnee", hearts: "Herzen", leaves: "Blätter", drips: "Tropfen", smoke: "Rauch", shadow: "Schatten", rainbow: "Regenbogen", confetti: "Konfetti", orbit: "Kreisende Punkte" };
tab("mutationen", "Mutationen", "Spielwelt", root => {
  root.append(head("Mutationen", "Seltene Abwandlungen eines Tonlings. Sie machen ihn wertvoller und färben ihn. Du kannst sie an ein Instrument koppeln."));
  listDetail(root, { key: "mut", title: "Mutationen", onNew: async () => { const n = await askText("Neue Mutation", "Name (z. B. Feurig)", "Feurig"); if (!n) return null; const id = uid(slug(n), i => MUTS.find(m => m.id === i)); MUTS.push({ id, name: n, adj: n + "er", mul: 2, p: 0.01, col: "#ff9a4a", dk: "#b84a0a", fx: "sparks" }); touch(); return id; },
    items: () => MUTS.map(m => ({ id: m.id, label: m.name, sub: "×" + m.mul, color: m.col })),
    detail: (id, el, redraw) => { const m = MUTS.find(q => q.id === id); const sp0 = SPECIES[0]; const std = ["moos", "glas", "funkel", "stern", "klirr", "beto", "urton", "elec"].includes(id);
      const pv = preview(160, 140, (c, t) => { c.fillStyle = "#a9dc86"; c.fillRect(0, 0, 160, 140); drawTonling(c, SPECIES.find(s => s.id === (ED.sel.mutsp || "tupfel")) || sp0, 80, 85, 80, t, id); });
      el.append(h("div", { class: "row", style: { alignItems: "flex-start" } }, pv, h("div", { style: { flex: 1, minWidth: "240px" } }, h("h2", null, m.name), h("div", { class: "grid" }, fld("Name", tIn(m, "name", { after: redraw })), fld("Als Adjektiv", tIn(m, "adj")), fld("Wert ×", nIn(m, "mul", { step: .1, int: false })), fld("Chance pro Fang", nIn(m, "p", { step: .001, int: false }), "0,01 = 1 %"), fld("Farbe", cIn(m, "col", { after: redraw })), fld("Dunkle Farbe", cIn(m, "dk")), std ? fld("Effekt", h("span", { class: "muted" }, "feste Zeichnung")) : [fld("Effekt", sIn(m, "fx", Object.entries(FXN), { opt: true, none: 1 })), fld("Zweiter Effekt", sIn(m, "fx2", Object.entries(FXN), { opt: true, none: 1 })), optColor(m, "col2", "Farbe 2. Effekt", "#ffffff"), fld("Effekt-Größe " + (m.fxs || 1), rIn(m, "fxs", .6, 1.6, .05, { def: 1 })), fld("Färbung " + (m.tint || 0), rIn(m, "tint", 0, .6, .05, { def: 0 }), "färbt den Körper in der Farbe der Mutation")], fld("Nur mit Instrument", sIn(m, "ins", instrOptions("(jedes)"), { opt: true, none: 1 })), fld("Chance mit diesem Instrument", nIn(m, "ip", { step: .01, int: false, opt: true })))), h("div", null, fld("Vorschau mit", sIn(ED.sel, "mutsp", speciesOptions(), { after: redraw })))),
        h("div", { class: "row", style: { marginTop: "10px" } }, std ? h("span", { class: "muted" }, "Eine Standard-Mutation kannst du anpassen, aber nicht löschen.") : h("button", { class: "btn warn", onclick: async () => { if (await del("Mutation", m.name)) { MUTS.splice(MUTS.indexOf(m), 1); touch(); renderTab(); } } }, "Löschen")));
    } });
});

/* ----- Läden ----- */
tab("laeden", "Läden", "Inhalte", root => {
  root.append(head("Läden", "Ein Laden gehört zu einem NPC (Feld „Laden“ im NPC-Reiter). Hier legst du fest, was er verkauft."));
  listDetail(root, { key: "shop", title: "Läden", onNew: async () => { const n = await askText("Neuer Laden", "Name", "Neuer Laden"); if (!n) return null; const id = uid(slug(n), i => SHOPS[i]); SHOPS[id] = { name: n, items: [] }; touch(); return id; },
    items: () => Object.keys(SHOPS).map(k => ({ id: k, label: SHOPS[k].name })),
    detail: (id, el, redraw) => { const sh = SHOPS[id]; const users = Object.keys(NPCS).filter(k => NPCS[k].shop === id);
      el.append(h("h2", null, sh.name), h("p", { class: "muted" }, users.length ? "Gehört zu: " + users.map(k => NPCS[k].n).join(", ") : "Noch kein NPC hat diesen Laden. Trage ihn im NPC-Reiter ein."), fld("Name", tIn(sh, "name", { after: redraw })));
      const box = h("div"); const drawItems = () => { box.innerHTML = ""; sh.items.forEach((it, i) => { const ins = INSTR[it.id]; box.append(h("div", { class: "item row" }, ins ? preview(36, 36, (c) => { drawIcon(c, ins.kind, 3, 2, 30); }) : null, sIn(it, "id", instrOptions(), { after: drawItems }), fld("Preis", nIn(it, "price")), fld("ab Level", nIn(it, "lvl")), h("button", { class: "btn sm warn", onclick: () => { sh.items.splice(i, 1); touch(); drawItems(); } }, "×"))); }); box.append(h("button", { class: "btn sm", onclick: () => { sh.items.push({ id: Object.keys(INSTR)[0], price: 100, lvl: 1 }); touch(); drawItems(); } }, "+ Instrument")); }; drawItems();
      el.append(h("div", { class: "ph" }, "Angebot"), box, h("button", { class: "btn warn", style: { marginTop: "10px" }, onclick: async () => { if (await del("Laden", sh.name)) { delete SHOPS[id]; Object.values(NPCS).forEach(n => { if (n.shop === id) delete n.shop; }); touch(); renderTab(); } } }, "Laden löschen"));
    } });
});

/* ----- Fundstücke ----- */
const ICONS = ["reed", "shard", "pipes", "tube", "chimes", "bowl", "flute", "lute", "tamb", "harp", "violin", "fork", "horn", "sharp", "organ", "rattle", "jaw", "xylo", "zither", "whistle", "lyre", "coral", "bells", "guitar", "ocarina", "drum", "kalimba", "pan", "glass", "conch", "gong", "chorus"];
const iconOpts = () => [...ICONS.map(k => [k, k]), ...Object.keys(ED.assets.icons).map(k => [k, "★ " + (ED.assets.icons[k].n || k)])];
tab("items", "Fundstücke", "Inhalte", root => {
  root.append(head("Fundstücke", "Dinge, die in der Welt liegen und für Aufgaben eingesammelt werden. Setze sie mit dem Werkzeug „Fundstück“ auf die Karte."));
  listDetail(root, { key: "items", title: "Fundstücke", onNew: async () => { const n = await askText("Neues Fundstück", "Name", "Neues Fundstück"); if (!n) return null; const id = uid(slug(n), i => ITEMS[i]); ITEMS[id] = { id, n, x: START.tx + 1, y: START.ty, kind: "shard" }; touch(); return id; },
    items: () => Object.keys(ITEMS).map(k => ({ id: k, label: ITEMS[k].n })),
    detail: (id, el, redraw) => { const it = ITEMS[id]; const users = Object.keys(QUESTS).filter(k => (QUESTS[k].parts || []).some(p => p.k === "item" && p.id === id));
      el.append(h("h2", null, it.n), h("div", { class: "row" }, preview(60, 60, (c, t) => drawIcon(c, it.kind, 10, 12 + Math.sin(t * 3) * 3, 40))), h("div", { class: "grid" }, fld("Name", tIn(it, "n", { after: redraw })), fld("Symbol", sIn(it, "kind", iconOpts(), { after: redraw })), h("button", { class: "btn sm", style: { alignSelf: "end" }, onclick: () => editLook(it) }, "Aussehen bearbeiten"), fld("x", nIn(it, "x", { after: () => W.need = true })), fld("y", nIn(it, "y", { after: () => W.need = true }))),
        h("p", { class: "muted" }, users.length ? "Wird gebraucht in: " + users.map(k => QUESTS[k].title).join(", ") : "Keine Aufgabe verlangt es bisher. Lege eine Aufgabe mit dem Teil „Fundstück“ an."), h("div", { class: "row" }, h("button", { class: "btn", onclick: () => { ED.tab = "welt"; W.tool = "item"; ED.sel.item = id; renderTab(); centerOn(it.x, it.y); } }, "Auf der Karte zeigen"), h("button", { class: "btn warn", onclick: async () => { if (await del("Fundstück", it.n)) { delete ITEMS[id]; touch(); renderTab(); } } }, "Löschen")));
    } });
});

/* ----- Instrumente ----- */
const STAT_KEYS = [["ear", "Justierung"], ["prec", "Präzision"], ["harm", "Harmonie"], ["luck", "Glück"], ["beat", "Takt"]];
tab("instr", "Instrumente", "Inhalte", root => {
  root.append(head("Instrumente", "Mit ihnen fängt man. Werte, Fähigkeit, Aussehen und Musik."));
  listDetail(root, { key: "instr", title: "Instrumente", onNew: async () => { const n = await askText("Neues Instrument", "Name", "Neues Instrument"); if (!n) return null; const id = uid(slug(n), i => INSTR[i]); INSTR[id] = { name: n, kind: "flute", ear: 4, prec: 4, harm: 4, luck: 4, beat: 4, info: "", tag: "" }; touch(); return id; },
    items: () => Object.keys(INSTR).map(k => ({ id: k, label: INSTR[k].name, sub: INSTR[k].pas || "" })),
    detail: (id, el, redraw) => { const i = INSTR[id];
      const stats = h("div", { class: "grid" }, STAT_KEYS.map(([k, n]) => fld(n, nIn(i, k, { min: 0, step: 1, def: 0, after: () => { sp(); } }))));
      const total = h("span", { class: "tag" }); const sp = () => { total.textContent = "Summe " + STAT_KEYS.reduce((a, [k]) => a + (i[k] || 0), 0); }; sp();
      const pas = sIn(i, "pas", [["", "keine"], ...pasOptions()], { opt: true, none: 1, after: () => { pt.textContent = i.pas ? PAS_TXT[i.pas] : ""; } }); const pt = h("p", { class: "muted" }, i.pas ? PAS_TXT[i.pas] : "");
      const song = SONGS[id]; const al = (window.AL_X || {})[id];
      el.append(h("div", { class: "row" }, preview(64, 64, (c, t) => drawIcon(c, i.kind, 8, 10, 48))), h("div", { class: "grid" }, fld("Name", tIn(i, "name", { after: redraw })), fld("Aussehen", sIn(i, "kind", iconOpts(), { after: redraw })), h("button", { class: "btn sm", style: { alignSelf: "end" }, onclick: () => editLook(i) }, "Aussehen bearbeiten")), fld("Beschreibung", aIn(i, "info", { rows: 2 })), fld("Kurzinfo (Stärken)", tIn(i, "tag", { opt: true })),
        h("div", { class: "ph" }, "Werte"), stats, h("p", { class: "muted" }, "Werte über 60 sind erlaubt. Die Balken im Spiel passen sich an."), total, h("div", { class: "ph" }, "Fähigkeit"), pas, pt,
        h("div", { class: "ph" }, "Klang"), al ? h("p", { class: "muted" }, "Klingt wie „" + (INSTR[al[0]] ? INSTR[al[0]].name : al[0]) + "“ (Tonhöhe ×" + al[1] + ")") : null,
        fld("Klingt wie (anderes Instrument)", (() => { const e = h("select", null, h("option", { value: "" }, "eigenes Lied"), instrOptions().map(([k, n]) => h("option", { value: k, selected: al && al[0] === k }, n))); e.onchange = () => { window.AL_X = window.AL_X || {}; if (!e.value) delete window.AL_X[id]; else window.AL_X[id] = [e.value, (al && al[1]) || 1]; touch(); redraw(); }; return e; })()),
        songBox(id), h("button", { class: "btn warn", style: { marginTop: "10px" }, onclick: async () => { if (await del("Instrument", i.name)) { delete INSTR[id]; for (const k in SHOPS) SHOPS[k].items = SHOPS[k].items.filter(x => x.id !== id); touch(); renderTab(); } } }, "Löschen"));
    } });
});

/* ----- Fähigkeiten ----- */
const BUILTIN_PAS = new Set(Object.keys(PAS_TXT));
const pasName = k => (ABIL[k] && ABIL[k].name) || k;
function pasOptions() { return [["", "keine"], ...Object.keys(PAS_TXT).map(k => [k, pasName(k) + (BUILTIN_PAS.has(k) ? "" : " (eigene)")])]; }
const ABIL_FIELDS = [
  ["fast", "Tonling-Tempo ×", 1, .05, "unter 1 = langsamer"], ["tol", "Rastzone beim Stimmen ×", 1, .05, "1,35 = 35 % größer"], ["lockT", "Zeit zum Einrasten ×", 1, .05, "0,5 = doppelt so schnell"],
  ["zoneW", "Zone beim Halten ×", 1, .05, "1,15 = 15 % breiter"], ["zoneWNight", "Zone nachts zusätzlich ×", 1, .05, ""], ["start", "Start-Fortschritt (0–1)", 0, .05, "0,35 = 35 %, normal 0,2"], ["startPerfect", "Start nach perfektem Wurf (0–1)", 0, .05, ""],
  ["momentum", "Schwung bis (0–1)", 0, .01, "0,1 = bis +10 %"], ["rate", "Fortschritt in der Zone ×", 1, .05, ""], ["decay", "Verlust außerhalb ×", 1, .05, "0,5 = halb so schnell"],
  ["noteBonus", "Note bringt (0–1)", 0, .01, "0,05 = +5 %"], ["noteEvery", "Note alle … Sekunden", 4, .5, ""],
  ["xpMul", "Erfahrung ×", 1, .05, "1,2 = +20 %"], ["xpTwin", "Chance auf doppelte Erfahrung (0–1)", 0, .01, ""], ["valMul", "Verkaufswert ×", 1, .05, "1,2 = +20 %"],
  ["mutMul", "Mutationschance ×", 1, .1, ""], ["mutNight", "Mutationschance nachts zusätzlich ×", 1, .1, ""], ["luckAdd", "Glück zusätzlich (Punkte)", 0, 1, ""]];
function abilText(a) {
  const P = (x) => Math.round(Math.abs(x - 1) * 100) + " %", out = [], F = a;
  const mul = (k, txtUp, txtDn) => { if (F[k] != null && F[k] !== 1) out.push(F[k] > 1 ? txtUp(P(F[k])) : txtDn(P(F[k]))); };
  mul("fast", p => "Tonlinge flitzen " + p + " schneller.", p => "Tonlinge flitzen " + p + " langsamer.");
  mul("tol", p => "Die Rastzone beim Stimmen ist " + p + " größer.", p => "Die Rastzone beim Stimmen ist " + p + " kleiner.");
  mul("lockT", p => "Die Frequenz rastet " + p + " langsamer ein.", p => "Die Frequenz rastet " + p + " schneller ein.");
  mul("zoneW", p => "Die Zone beim Halten ist " + p + " breiter.", p => "Die Zone beim Halten ist " + p + " schmaler.");
  mul("zoneWNight", p => "Nachts: Zone zusätzlich " + p + " breiter.", p => "Nachts: Zone zusätzlich " + p + " schmaler.");
  if (F.start) out.push("Jeder Fang startet bei " + Math.round(F.start * 100) + " % Fortschritt.");
  if (F.startPerfect) out.push("Nach einem perfekten Wurf startet der Fang bei " + Math.round(F.startPerfect * 100) + " %.");
  if (F.momentum) out.push("In der Zone wird der Fortschritt immer schneller, bis zu +" + Math.round(F.momentum * 100) + " %.");
  mul("rate", p => "Der Fortschritt in der Zone wächst " + p + " schneller.", p => "Der Fortschritt in der Zone wächst " + p + " langsamer.");
  mul("decay", p => "Außerhalb der Zone sinkt der Fortschritt " + p + " schneller.", p => "Außerhalb der Zone sinkt der Fortschritt " + p + " langsamer.");
  if (F.noteBonus) out.push("Alle " + (F.noteEvery || 4) + " Sekunden bildet sich eine Note: +" + Math.round(F.noteBonus * 100) + " % Fortschritt.");
  mul("xpMul", p => "Jeder Fang gibt " + p + " mehr Erfahrung.", p => "Jeder Fang gibt " + p + " weniger Erfahrung.");
  if (F.xpTwin) out.push("Mit " + Math.round(F.xpTwin * 100) + " % Chance gibt ein Fang doppelte Erfahrung.");
  mul("valMul", p => "Mit ihr gefangene Tonlinge bringen " + p + " mehr Noten.", p => "Mit ihr gefangene Tonlinge bringen " + p + " weniger Noten.");
  mul("mutMul", p => "Mutationschance " + p + " höher.", p => "Mutationschance " + p + " niedriger.");
  mul("mutNight", p => "Nachts: Mutationen " + p + " häufiger.", p => "Nachts: Mutationen " + p + " seltener.");
  if (F.luckAdd) out.push((F.luckAdd > 0 ? "+" : "") + F.luckAdd + " Glück.");
  for (const m in (F.mutBy || {})) { const mm = MUTS.find(q => q.id === m); out.push("„" + (mm ? mm.name : m) + "“-Mutationen sind " + (F.mutBy[m]) + "-mal so häufig."); }
  for (const m in (F.mutAdd || {})) { const mm = MUTS.find(q => q.id === m); out.push("Mit " + Math.round(F.mutAdd[m] * 100) + " % Chance ist ein Fang " + (mm ? mm.name : m) + "."); }
  return out.join(" ") || "Keine Wirkung.";
}
const ABIL_PRESETS = { "Flinker Fang": { fast: .8 }, "Großzügige Zone": { zoneW: 1.15, tol: 1.35 }, "Vorsprung": { start: .35 }, "Lehrmeister": { xpMul: 1.2, xpTwin: .15 }, "Schatzjäger": { valMul: 1.3 }, "Mutationsfreund": { mutMul: 1.5 }, "Nachtschwärmer": { zoneWNight: 1.2, mutNight: 2 }, "Notenregen": { noteBonus: .05, noteEvery: 4 }, "Schwung": { momentum: .1 } };
tab("faehig", "Fähigkeiten", "Inhalte", root => {
  root.append(head("Fähigkeiten", "Eigene Fähigkeiten für Instrumente. Du stellst Wirkungen ein, der Beschreibungstext entsteht automatisch. Die eingebauten Fähigkeiten bleiben unverändert."));
  const upd = a => { PAS_TXT[a.id] = (a.txt && a.txt.trim()) ? a.txt : abilText(ABIL[a.id]); touch(); };
  listDetail(root, { key: "faehig", title: "Fähigkeiten", onNew: async () => { const n = await askText("Neue Fähigkeit", "Name", "Neue Fähigkeit"); if (!n) return null; const id = uid(slug(n), i => PAS_TXT[i]); ABIL[id] = { name: n }; PAS_TXT[id] = "Keine Wirkung."; touch(); return id; },
    items: () => Object.keys(PAS_TXT).map(k => ({ id: k, label: pasName(k), group: BUILTIN_PAS.has(k) ? "Eingebaut" : "Eigene", sub: BUILTIN_PAS.has(k) ? "" : "eigene" })).sort((a, b) => (a.group === b.group ? 0 : a.group === "Eigene" ? -1 : 1)),
    detail: (id, el, redraw) => {
      if (BUILTIN_PAS.has(id) && !(ABIL[id] && Object.keys(ABIL[id]).length)) { el.append(h("h2", null, id), h("p", null, PAS_TXT[id]), h("p", { class: "muted" }, "Eingebaute Fähigkeit: fest im Spiel. Du kannst sie als Vorlage für eine eigene nehmen."), h("button", { class: "btn pri", onclick: () => { const mods = { name: id + " (Kopie)" }; const n = uid(id + "-eigen", i => PAS_TXT[i]); ABIL[n] = mods; PAS_TXT[n] = PAS_TXT[id]; ED.sel.faehig = n; touch(); renderTab(); } }, "Als Vorlage kopieren (Text, Wirkung selbst einstellen)")); return; }
      const a = ABIL[id] || (ABIL[id] = {}); const o = { id, txt: "" };
      const txt = h("p", { class: "muted" }, PAS_TXT[id]); const re = () => { PAS_TXT[id] = abilText(a); txt.textContent = PAS_TXT[id]; touch(); };
      const grid = h("div", { class: "grid" }, ABIL_FIELDS.map(([k, n, d, st, hint]) => { const e = h("input", { type: "number", step: st, value: a[k] == null ? "" : a[k], placeholder: String(d) }); e.oninput = () => { if (e.value === "" || parseFloat(e.value) === d) delete a[k]; else a[k] = parseFloat(e.value); re(); }; return fld(n, e, hint); }));
      const pre = h("select", null, h("option", { value: "" }, "Vorlage einsetzen …"), Object.keys(ABIL_PRESETS).map(k => h("option", { value: k }, k))); pre.onchange = () => { if (!pre.value) return; Object.assign(a, ABIL_PRESETS[pre.value]); re(); renderTab(); };
      const mut = h("div"); const drawMut = () => { mut.innerHTML = ""; a.mutBy = a.mutBy || {}; for (const m of Object.keys(a.mutBy)) mut.append(h("div", { class: "row" }, h("span", null, (MUTS.find(q => q.id === m) || { name: m }).name + " ×" + a.mutBy[m]), h("button", { class: "btn sm", onclick: () => { delete a.mutBy[m]; re(); drawMut(); } }, "×")));
        const ms = h("select", null, MUTS.map(m => h("option", { value: m.id }, m.name))), mv = h("input", { type: "number", step: .5, value: 2, style: { width: "70px" } }); mut.append(h("div", { class: "row" }, ms, mv, h("button", { class: "btn sm", onclick: () => { a.mutBy[ms.value] = parseFloat(mv.value) || 2; re(); drawMut(); } }, "Mutation häufiger machen"))); }; drawMut();
      el.append(h("h2", null, pasName(id)), fld("Name", tIn(a, "name", { after: () => { touch(); redraw(); } })), pre, h("div", { class: "ph" }, "Wirkungen"), grid, h("div", { class: "ph" }, "Mutationen beeinflussen"), mut, h("div", { class: "ph" }, "Beschreibung (automatisch)"), txt,
        h("button", { class: "btn warn", style: { marginTop: "10px" }, onclick: async () => { if (await del("Fähigkeit", pasName(id))) { delete ABIL[id]; delete PAS_TXT[id]; for (const k in INSTR) if (INSTR[k].pas === id) delete INSTR[k].pas; touch(); renderTab(); } } }, "Löschen"));
    } });
});
function songBox(id) {
  const box = h("div"); const s = SONGS[id];
  if (!s) { box.append(h("button", { class: "btn sm", onclick: () => { SONGS[id] = { name: INSTR[id].name, voice: "harp", step: .3, fast: 1, text: "s-h-wgfd\nf-e-d-" }; touch(); renderTab(); } }, "Eigenes Lied schreiben")); }
  else { box.append(h("div", { class: "grid" }, fld("Klangfarbe", sIn(s, "voice", ["harp", "lute", "bell", "flute", "violin", "organ", "pad", "pluck"], {})), fld("Tempo (Sekunden pro Ton)", nIn(s, "step", { step: .02, int: false }))), fld("Noten", aIn(s, "text", { rows: 8, code: true }), "Tasten der Tastatur, eine Zeile je Takt. Ein Strich ist eine Pause."), h("button", { class: "btn sm warn", onclick: () => { delete SONGS[id]; touch(); renderTab(); } }, "Lied entfernen")); }
  box.append(h("div", { class: "ph" }, "Fertiges Musikstück (mp3)"), h("p", { class: "muted" }, TRACKS[id] ? "Eigenes Stück hinterlegt (" + Math.round(TRACKS[id].length * .75 / 1024) + " KB)." : "Ohne Stück spielt das notierte Lied."), h("div", { class: "row" }, h("label", { class: "btn sm" }, "mp3 laden", h("input", { type: "file", accept: "audio/mpeg,.mp3", hidden: true, onchange: e => { const f = e.target.files[0]; if (!f) return; if (f.size > 1.5e6) { toast("Die Datei ist größer als 1,5 MB. Kürze sie auf etwa 30 Sekunden.", true); return; } const r = new FileReader(); r.onload = () => { TRACKS[id] = String(r.result).split(",")[1]; touch(); renderTab(); }; r.readAsDataURL(f); } })), TRACKS[id] ? h("button", { class: "btn sm warn", onclick: () => { delete TRACKS[id]; touch(); renderTab(); } }, "Entfernen") : null));
  return box;
}

/* ----- Einstellungen ----- */
tab("einst", "Einstellungen", "Projekt", root => {
  root.append(head("Einstellungen"));
  const c = card(); root.append(c);
  const cur = ED.settings;
  c.append(h("div", { class: "grid" }, fld("Name der Welt", (() => { const e = h("input", { type: "text", value: ED.name }); e.oninput = () => { ED.name = e.value; $q("#pname").value = e.value; touch(); }; return e; })()), fld("Offene Bereiche", sIn(cur, "release", [[1, "nur Bereich 1"], [2, "Bereiche 1–2"], [3, "Bereiche 1–3"], [4, "alle vier"]], { num: true, after: () => { touch(); } }), "Bereiche darüber bleiben als „Fortsetzung folgt“ verschlossen")),
    h("div", { class: "ph" }, "Start der Spielerin"), h("div", { class: "grid" }, fld("x", nIn(START, "tx")), fld("y", nIn(START, "ty"))),
    h("div", { class: "ph" }, "Tore"), h("div", { class: "grid" }, [["Tor 1→2", GATE], ["Tor 2→3", GATE3], ["Tor 3→4", GATE4]].map(([n, g]) => h("div", { class: "item" }, h("b", null, n), h("div", { class: "grid" }, fld("x", nIn(g, "x")), fld("y", nIn(g, "y")), fld("Breite", nIn(g, "w")))))),
    h("p", { class: "muted" }, "Hinweis: Mehrspieler-Server und Bestenliste kennen deine eigene Welt nicht. Ein Spiel mit eigener Welt läuft allein."));
});
