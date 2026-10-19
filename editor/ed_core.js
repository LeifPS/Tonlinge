/* ===== WELTBAUER: Kern (Hilfen, Zustand, Speichern, Rückgängig) ===== */
const ED = {
  tab: "welt", name: "Meine Welt", dirty: false, undo: [], redo: [], sel: {}, assets: { tiles: {}, stamps: [], icons: {} }, settings: { release: 4 },
  anim: new Set(), draftOk: true, baseWorldKey: ""
};
/* append ignoriert null/false und flacht Listen ab */
{ const ap = Element.prototype.append; Element.prototype.append = function (...k) { return ap.apply(this, k.flat(9).filter(x => x != null && x !== false)); }; }
const DRAFT_KEY = "tonlinge-weltbauer-entwurf";
/* ----- DOM ----- */
function add(e, kids) { for (const k of kids.flat(9)) { if (k == null || k === false) continue; e.append(k.nodeType ? k : document.createTextNode(String(k))); } return e; }
function h(tag, a, ...kids) {
  const e = document.createElement(tag);
  if (a) for (const k in a) { const v = a[k]; if (v == null || v === false) continue;
    if (k === "class") e.className = v; else if (k === "style" && typeof v === "object") Object.assign(e.style, v); else if (k === "html") e.innerHTML = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else if (k === "value" || k === "checked" || k === "disabled" || k === "hidden") e[k] = v; else e.setAttribute(k, v === true ? "" : v); }
  return add(e, kids);
}
const $q = (s, r) => (r || document).querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const slug = s => String(s).toLowerCase().replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe").replace(/[üÜ]/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
function toast(msg, bad) { const t = h("div", { class: bad ? "bad" : "" }, msg); $q("#toast").append(t); setTimeout(() => t.remove(), bad ? 6000 : 3200); }
function modal(title, body, buttons) {
  const m = $q("#modal"), close = () => { m.hidden = true; m.innerHTML = ""; };
  m.innerHTML = ""; const box = h("div", { class: "box", role: "dialog", "aria-label": title }, h("h2", null, title), body, h("div", { class: "row", style: { marginTop: "12px", justifyContent: "flex-end" } }, (buttons || [{ label: "Schließen" }]).map(b => h("button", { class: "btn " + (b.kind || ""), onclick: () => { if (!b.fn || b.fn() !== false) close(); } }, b.label))));
  m.append(box); m.hidden = false; m.onclick = e => { if (e.target === m) close(); }; return close;
}
const ask = (title, text, ok) => new Promise(res => { let done = false; const fin = v => { if (!done) { done = true; res(v); } }; modal(title, h("p", null, text), [{ label: "Abbrechen", fn: () => fin(false) }, { label: ok || "OK", kind: "pri", fn: () => fin(true) }]); });
const askText = (title, label, def) => new Promise(res => { const i = h("input", { type: "text", value: def || "", style: { width: "100%" } }); let done = false; modal(title, h("label", { class: "fld" }, h("span", null, label), i), [{ label: "Abbrechen", fn: () => { done = true; res(null); } }, { label: "OK", kind: "pri", fn: () => { done = true; res(i.value.trim()); } }]); setTimeout(() => i.focus(), 30); });
/* ----- Formularfelder, direkt an Objekte gebunden ----- */
function touch(kind) { ED.dirty = true; scheduleDraft(); if (kind !== "quiet") setStat(); }
function fld(label, el, hint) { return h("label", { class: "fld" }, h("span", null, label), el, hint ? h("em", null, hint) : null); }
function tIn(o, k, opt) { opt = opt || {}; const e = h("input", { type: "text", value: o[k] == null ? "" : o[k], placeholder: opt.ph || "", style: opt.w ? { width: opt.w } : null }); e.oninput = () => { if (e.value === "" && opt.opt) delete o[k]; else o[k] = e.value; touch(); opt.after && opt.after(e.value); }; return e; }
function nIn(o, k, opt) { opt = opt || {}; const e = h("input", { type: "number", value: o[k] == null ? "" : o[k], step: opt.step || 1, min: opt.min, max: opt.max, placeholder: opt.ph || "" }); e.oninput = () => { if (e.value === "") { if (opt.opt) delete o[k]; else o[k] = opt.def || 0; } else o[k] = opt.int === false ? parseFloat(e.value) : (opt.step && opt.step < 1 ? parseFloat(e.value) : parseInt(e.value, 10)); touch(); opt.after && opt.after(o[k]); }; return e; }
function aIn(o, k, opt) { opt = opt || {}; const e = h("textarea", { class: opt.code ? "code" : "", rows: opt.rows || 3, spellcheck: opt.code ? "false" : "true" }); e.value = o[k] == null ? "" : o[k]; e.oninput = () => { if (e.value === "" && opt.opt) delete o[k]; else o[k] = e.value; touch(); opt.after && opt.after(e.value); }; return e; }
function cIn(o, k, opt) { opt = opt || {}; const e = h("input", { type: "color", value: /^#[0-9a-f]{6}$/i.test(o[k]) ? o[k] : "#888888" }); e.oninput = () => { o[k] = e.value; touch(); opt.after && opt.after(e.value); }; if (opt.opt && o[k] != null) { const x = h("button", { class: "btn sm", title: "Entfernen", onclick: () => { delete o[k]; touch(); opt.after && opt.after(); e.value = "#888888"; } }, "×"); return h("span", { class: "row" }, e, x); } return e; }
function chk(o, k, label, opt) { opt = opt || {}; const e = h("input", { type: "checkbox", checked: !!o[k] }); e.onchange = () => { if (e.checked) o[k] = true; else delete o[k]; touch(); opt.after && opt.after(e.checked); }; return h("label", { class: "row", style: { gap: "5px" } }, e, label); }
function sIn(o, k, options, opt) { opt = opt || {}; const e = h("select", null, options.map(x => { const v = Array.isArray(x) ? x[0] : x, l = Array.isArray(x) ? x[1] : x; return h("option", { value: v }, l); })); e.value = o[k] == null ? (opt.none != null ? "" : options[0] && (Array.isArray(options[0]) ? options[0][0] : options[0])) : o[k]; e.onchange = () => { const v = opt.num ? +e.value : e.value; if ((e.value === "" || e.value == null) && opt.opt) delete o[k]; else o[k] = v; touch(); opt.after && opt.after(v); }; return e; }
function rIn(o, k, min, max, step, opt) { opt = opt || {}; const lab = h("span", { class: "muted" }, o[k] == null ? "" : o[k]); const e = h("input", { type: "range", min, max, step: step || 1, value: o[k] == null ? (opt.def != null ? opt.def : min) : o[k] }); e.oninput = () => { o[k] = parseFloat(e.value); lab.textContent = o[k]; touch(); opt.after && opt.after(o[k]); }; return h("span", { class: "row" }, e, lab); }
/* Liste von Texten */
function strList(arr, opt) { opt = opt || {}; const box = h("div"); const draw = () => { box.innerHTML = ""; arr.forEach((s, i) => { const t = h("textarea", { rows: opt.rows || 2, placeholder: opt.ph || "" }); t.value = s; t.oninput = () => { arr[i] = t.value; touch(); }; box.append(h("div", { class: "row", style: { alignItems: "flex-start", margin: "3px 0" } }, h("div", { style: { flex: 1, minWidth: "180px" } }, t), h("button", { class: "btn sm", title: "Nach oben", onclick: () => { if (i) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; touch(); draw(); } } }, "↑"), h("button", { class: "btn sm warn", title: "Löschen", onclick: () => { arr.splice(i, 1); touch(); draw(); } }, "×"))); }); box.append(h("button", { class: "btn sm", onclick: () => { arr.push(""); touch(); draw(); } }, "+ " + (opt.add || "Zeile"))); }; draw(); return box;
}
function uid(prefix, taken) { let i = 1, id; do { id = prefix + (i === 1 ? "" : "_" + i); i++; } while (taken(id)); return id; }
const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
const rgbOf = c => /^#[0-9a-f]{6}$/i.test(c) ? c : "#888888";

/* ----- Animierte Vorschauen ----- */
function preview(w, hgt, draw, opt) {
  opt = opt || {}; const cv = h("canvas", { class: "pv" + (opt.light ? " pvl" : ""), width: w * 2, height: hgt * 2, style: { width: w + "px", height: hgt + "px" } }), c = cv.getContext("2d");
  const job = { cv, draw: t => { c.setTransform(2, 0, 0, 2, 0, 0); c.clearRect(0, 0, w, hgt); draw(c, t, w, hgt); } }; job.draw(0); ED.anim.add(job); return cv;
}
(function loop() { const t = performance.now() / 1000; for (const j of ED.anim) { if (!j.cv.isConnected) { ED.anim.delete(j); continue; } try { j.draw(t); } catch (e) {} } requestAnimationFrame(loop); })();

/* ----- Zustand: Standardwelt merken, speichern, laden ----- */
const BUILTIN_TILES = new Set(Object.keys(TILE_REG));
function tilesReset() { for (const id of Object.keys(TILE_REG)) if (!BUILTIN_TILES.has(id)) delete TILE_REG[id]; Object.assign(TILE_REG, TILE_BASE); }
let BASE = null;
function captureBase() { BASE = { tables: projTables(), world: worldGet() }; }
function tablesRestore(base) {
  for (const k in PROJ_TABLES) { const tgt = PROJ_TABLES[k][1](), b = _clone(base[k]); if (Array.isArray(tgt)) { tgt.length = 0; b.forEach(e => tgt.push(e)); } else { for (const key in tgt) delete tgt[key]; Object.assign(tgt, b); } }
  SP_REBUILD(); Object.keys(ITEMS).forEach(k => ITEMS[k].id = k);
}
function resetToBase() { tilesReset(); tablesRestore(BASE.tables); worldSet(BASE.world); ED.assets = { tiles: {}, stamps: [], icons: {} }; projRegisterIcons(null); ED.settings = { release: 4 }; ED.name = "Meine Welt"; }
const sameArr = (a, b) => { if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; };
function worldChanged() { const w = worldGet(), b = BASE.world; return !(sameArr(w.t, b.t) && sameArr(w.a, b.a) && sameArr(w.z, b.z) && sameArr(w.g, b.g) && sameArr(w.o, b.o)); }
function buildProject() {
  const P = { format: PROJ_FORMAT, v: 1, name: ED.name, saved: new Date().toISOString(), settings: Object.assign({}, ED.settings), data: projDiff(BASE.tables, projTables()), assets: { tiles: ED.assets.tiles, stamps: ED.assets.stamps, icons: ED.assets.icons } };
  if (worldChanged()) P.world = worldPack(worldGet());
  return P;
}
function loadProject(P) {
  resetToBase(); ED.undo = []; ED.redo = [];
  projApply(P); ED.assets = { tiles: _clone((P.assets && P.assets.tiles) || {}), stamps: _clone((P.assets && P.assets.stamps) || []), icons: _clone((P.assets && P.assets.icons) || {}) }; ED.settings = Object.assign({ release: 4 }, P.settings || {}); ED.name = P.name || "Meine Welt";
  ED.dirty = false; $q("#pname").value = ED.name; if (window.invalidateAll) invalidateAll(); renderTab(); setStat();
}
function registerAssets() { if (typeof syncAreaCols === "function") syncAreaCols(); projRegisterIcons(ED.assets); tilesReset(); projRegisterAssets(ED.assets); if (window.invalidateAll) invalidateAll(); }
let draftTimer = 0;
function scheduleDraft() { clearTimeout(draftTimer); draftTimer = setTimeout(saveDraft, 1500); }
function saveDraft() { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(buildProject())); ED.draftOk = true; ED.draftAt = Date.now(); } catch (e) { ED.draftOk = false; } setStat(); }
function setStat() { const s = $q("#stat"); if (!s) return; s.textContent = (ED.dirty ? "Ungespeichert" : "Gespeichert") + (ED.draftOk ? (ED.draftAt ? " · Entwurf im Browser" : "") : " · Entwurf zu groß für den Browser"); }
function fileName() { return (slug(ED.name) || "welt") + ".tonlinge.json"; }
async function saveFile() {
  (ED.did = ED.did || {}).save = 1;
  const P = buildProject(), txt = JSON.stringify(P); let dl = null; try { dl = window.claude && await claude.use("downloads"); } catch (e) {}
  if (dl) { try { await dl.save({ filename: fileName(), data: new Blob([txt], { type: "application/json" }) }); ED.dirty = false; setStat(); toast("Gespeichert: " + fileName()); return; } catch (e) { if (e && e.code === "declined") return; toast("Speichern nicht möglich. Unter „Mehr“ kannst du den Text kopieren.", true); return; } }
  showText(txt);
}
function showText(txt) { const ta = h("textarea", { class: "code", rows: 10, readonly: true }); ta.value = txt; modal("Projekt als Text", h("div", null, h("p", { class: "muted" }, "Kopiere den Text und speichere ihn als Datei mit der Endung .json."), ta, h("button", { class: "btn", onclick: () => { ta.select(); try { navigator.clipboard.writeText(txt).then(() => toast("Kopiert")).catch(() => document.execCommand("copy")); } catch (e) { document.execCommand("copy"); } } }, "Kopieren"))); }
function openFile(file) { const r = new FileReader(); r.onload = () => { try { const P = JSON.parse(r.result); if (P.format !== PROJ_FORMAT) throw new Error("Das ist keine Tonlinge-Projektdatei."); loadProject(P); toast("Geladen: " + (P.name || file.name)); } catch (e) { toast("Konnte die Datei nicht laden: " + e.message, true); } }; r.readAsText(file); }

/* ----- Rückgängig ----- */
function pushUndo(cmd) { ED.undo.push(cmd); if (ED.undo.length > 150) ED.undo.shift(); ED.redo = []; touch(); }
function doUndo() { const c = ED.undo.pop(); if (!c) return; c.undo(); ED.redo.push(c); touch(); }
function doRedo() { const c = ED.redo.pop(); if (!c) return; c.redo(); ED.undo.push(c); touch(); }

/* ----- Reiter ----- */
const TABS = [];
function tab(id, label, group, render) { TABS.push({ id, label, group, render }); }
function renderRail() { const r = $q("#rail"); r.innerHTML = ""; let g = null; TABS.forEach(t => { if (t.group !== g) { g = t.group; r.append(h("div", { class: "grp" }, g)); } r.append(h("button", { "aria-current": ED.tab === t.id ? "true" : "false", onclick: () => { ED.tab = t.id; try { history.replaceState(null, "", "#" + t.id); } catch (e) {} renderTab(); } }, t.label)); }); }
function renderTab() { renderRail(); const v = $q("#view"); v.innerHTML = ""; const t = TABS.find(x => x.id === ED.tab) || TABS[0]; try { t.render(v); } catch (e) { v.append(h("div", { class: "card" }, h("h2", null, "Fehler"), h("pre", { class: "mono" }, String(e && e.stack || e)))); console.error(e); } }
function gotoTab(id) { ED.tab = id; renderTab(); }

/* ----- Liste links, Bearbeitung rechts ----- */
function listDetail(root, cfg) {
  const key = cfg.key, left = h("div"), right = h("div", { class: "card" }); const wrap = h("div", { class: "two" }, left, right); root.append(wrap);
  let filter = ""; const q = h("input", { type: "text", placeholder: "Suchen …", "aria-label": "Suchen", style: { width: "100%", marginBottom: "6px" } });
  const list = h("div", { class: "list" });
  const drawList = () => { list.innerHTML = ""; let g = null; const items = cfg.items().filter(i => !filter || (i.label + " " + i.id).toLowerCase().includes(filter)); if (ED.sel[key] == null || !cfg.items().find(i => i.id === ED.sel[key])) ED.sel[key] = items[0] && items[0].id;
    items.forEach(i => { if (i.group !== g) { g = i.group; if (g) list.append(h("div", { class: "gh" }, g)); } list.append(h("button", { class: "it", "aria-current": String(ED.sel[key] === i.id), onclick: () => { ED.sel[key] = i.id; drawList(); drawRight(); } }, i.color ? h("i", { style: { background: i.color } }) : null, i.label, i.sub ? h("small", null, i.sub) : null)); }); };
  const drawRight = () => { right.innerHTML = ""; const id = ED.sel[key]; if (id == null) { right.append(h("p", { class: "muted" }, cfg.empty || "Noch nichts da. Lege oben einen neuen Eintrag an.")); return; } try { cfg.detail(id, right, () => { drawList(); }); } catch (e) { right.append(h("pre", { class: "mono" }, String(e && e.stack || e))); console.error(e); } };
  q.oninput = () => { filter = q.value.toLowerCase(); drawList(); };
  left.append(h("h2", null, cfg.title), h("div", { class: "row", style: { marginBottom: "6px" } }, cfg.onNew ? h("button", { class: "btn pri sm", onclick: async () => { const id = await cfg.onNew(); if (id) { ED.sel[key] = id; q.value = ""; filter = ""; drawList(); drawRight(); } } }, "+ Neu") : null, cfg.extra || null), q, list);
  drawList(); drawRight(); return { redraw: () => { drawList(); drawRight(); }, redrawList: drawList };
}
/* kleine Hilfen für Auswahllisten */
const npcOptions = (none) => [...(none ? [["", none]] : []), ...Object.keys(NPCS).map(id => [id, NPCS[id].n + " (" + id + ")"])];
const questOptions = (none) => [...(none ? [["", none]] : []), ...Object.keys(QUESTS).map(id => [id, QUESTS[id].title + " (" + id + ")"])];
const instrOptions = (none) => [...(none ? [["", none]] : []), ...Object.keys(INSTR).map(id => [id, INSTR[id].name + " (" + id + ")"])];
const speciesOptions = (none) => [...(none ? [["", none]] : []), ...SPECIES.map(s => [s.id, s.n + " (" + s.id + ")"])];
const zoneOptions = (none) => [...(none ? [["", none]] : []), ...Object.keys(ZINFO).map(id => [id, ZINFO[id].n + " (" + id + ")"])];
const rarOptions = () => RAR.map((r, i) => [i, i + " · " + r.name]);
const areaOptions = () => Object.keys(AREAS).map(k => [+k, k + " · " + AREAS[k].name]);

/* Quelltext einer eingebauten Zeichenfunktion als Ausdruck, den man aufrufen kann */
function fnSrc(f) { let src = String(f); try { new Function("return (" + src + ")"); } catch (e) { src = "function " + src; } return "(" + src + ")"; }
function tileTemplate(id) {
  const d = TILE_BASE[id]; if (!d) return null;
  if (d.kind === "ground") { const o = { kind: "ground", n: d.n, cat: d.cat, col: d.col || "#999999", col2: d.col2 || d.col || "#999999", tex: d.tex || "none" }; ["tcol", "dens", "tcol2"].forEach(k => { if (d[k] != null) o[k] = d[k]; }); if (d.t3) o.t3 = true; return o; }
  return { kind: "obj", n: d.n, cat: d.cat, solid: !!d.solid, code: fnSrc(d.draw) + "(c, px, py, s, x, y);" };
}
function editLook(o) { /* eigenes Symbol aus dem aktuellen Aussehen erzeugen und dem Eintrag zuweisen */
  if (ED.assets.icons[o.kind]) { ED.tab = "grafiken"; ED.sel.gfx = o.kind; renderTab(); return; }
  const nid = uid("look-" + (o.id || slug(o.name || o.n || "ding")), i => ED.assets.icons[i] || ICONS.includes(i));
  ED.assets.icons[nid] = { n: (o.name || o.n || nid) + " (Aussehen)", code: "/* Das eingebaute Aussehen. Darüber oder darunter kannst du zeichnen. */\ndrawIcon(c, " + JSON.stringify(o.kind) + ", 0, 0, 40, true);\n" };
  o.kind = nid; registerAssets(); touch(); ED.tab = "grafiken"; ED.sel.gfx = nid; renderTab();
}

/* Testspiel: das Spiel (ohne Musikdateien) in einem Fenster mit der aktuellen Welt */
async function playtest() {
  (ED.did = ED.did || {}).play = 1;
  let cv = null; try { cv = stageEl(); } catch (e) {}
  const d = W.d || 1, cx = cv ? Math.round(W.ox + cv.width / d / W.s / 2 - .5) : -1, cy = cv ? Math.round(W.oy + cv.height / d / W.s / 2 - .5) : -1;
  const ok = !!cv && ED.tab === "welt" && inW(cx, cy) && (T[cy][cx] === 1 || T[cy][cx] === 2);
  const how = await new Promise(r => modal("Testspiel", h("div", null, h("p", null, "Das Spiel startet mit deiner Welt in einem eigenen Fenster. Dein Fortschritt dort wird nicht gespeichert und hat nichts mit deinem echten Spielstand zu tun."), h("p", { class: "muted" }, ok ? "Start an der Kartenmitte (" + cx + "/" + cy + ") ist möglich." : "Ohne Kartenansicht oder auf nicht begehbarem Boden startest du am Spawn.")),
    [{ label: "Abbrechen", fn: () => r(null) }, { label: "Am Spawn starten", kind: "pri", fn: () => r("spawn") }, ok ? { label: "An der Kartenmitte starten", kind: "pri", fn: () => r("mid") } : null].filter(Boolean)));
  if (!how) return;
  const P = buildProject(); P.data = P.data || {}; if (how === "mid") P.data.START = Object.assign({}, P.data.START || {}, { tx: cx, ty: cy });
  P.settings = Object.assign({}, P.settings, { release: ED.settings.release });
  try { localStorage.removeItem("tonlinge-v1"); localStorage.removeItem("tonlinge-projekt-v1"); } catch (e) {}
  const html = GAME_LITE.replace("/*@@PROJECT@@*/", "window.EMBEDDED_PROJECT=" + JSON.stringify(P).replace(/</g, "\\u003c") + ";");
  const fr = h("iframe", { style: { width: "100%", height: "100%", border: "0", background: "#000" }, title: "Testspiel" }); fr.srcdoc = html;
  const box = h("div", { style: { position: "fixed", inset: "0", zIndex: 9999, background: "#000", display: "flex", flexDirection: "column" } },
    h("div", { style: { padding: "6px 10px", background: "var(--panel, #222)", color: "var(--fg, #fff)", display: "flex", gap: "8px", alignItems: "center" } }, h("b", null, "Testspiel"), h("span", { class: "muted" }, "Klicke ins Spiel, damit die Tasten ankommen."), h("span", { style: { flex: 1 } }), h("button", { class: "btn", onclick: () => { box.remove(); try { localStorage.removeItem("tonlinge-v1"); } catch (e) {} } }, "Beenden")), fr);
  document.body.append(box);
  fr.addEventListener("load", () => { try { fr.contentWindow.focus(); } catch (e) {} });
}

function libApplyIcon(o, r) { const id = uid(slug(r.n), i => ED.assets.icons[i] || (typeof ICON_KINDS !== "undefined" && ICON_KINDS.includes(i))); ED.assets.icons[id] = { n: r.n, code: r.code }; o.kind = id; registerAssets(); touch(); renderTab(); }

/* Ganz von vorn beginnen: leere Welt, nichts als ein Startplatz. Alle Grafiken des großen Spiels bleiben verfügbar. */
async function newBlank() {
  if (!(await ask("Ganz von vorn beginnen", "Das Projekt wird zu einem leeren Spiel: eine kleine Wiese, keine Tonlinge, Figuren, Aufgaben und Läden, nur das Start-Instrument. Alle Grafiken, Böden, Symbole und Formen des großen Spiels kannst du weiter benutzen und kopieren. Dein jetziges Projekt geht dabei verloren, wenn du es nicht gespeichert hast.", "Leer beginnen"))) return false;
  resetToBase(); ED.undo = []; ED.redo = [];
  ["NPCS", "NPC_LOOK", "NPC_VOICE", "QUESTS", "QX", "GREET", "STORY", "SHOPS", "ITEMS", "FWALLS"].forEach(k => { const t = PROJ_TABLES[k][1](); for (const x of Object.keys(t)) delete t[x]; });
  SPECIES.length = 0; HOUSES.length = 0; SP_REBUILD();
  for (const k of Object.keys(INSTR)) if (k !== "holz") delete INSTR[k];
  for (const k of Object.keys(SONGS)) if (k !== "holz") delete SONGS[k];
  if (window.AL_X) for (const k of Object.keys(window.AL_X)) if (k !== "holz") delete window.AL_X[k];
  for (const k of Object.keys(ZINFO)) if (k !== "wiese") delete ZINFO[k];
  ZINFO.wiese.n = "Startwiese";
  for (const k of Object.keys(AREAS)) if (+k > 1) delete AREAS[k];
  AREAS[1].name = "Mein Land";
  const grass = GROUND_DEFS[0][0];
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) { const i = y * WW + x; T[y][x] = 0; GR[i] = null; OB[i] = null; AM[i] = 1; ZN[y][x] = null; }
  const cx = 80, cy = 58;
  for (let y = cy - 8; y <= cy + 8; y++) for (let x = cx - 14; x <= cx + 14; x++) { if (((x - cx) / 14) ** 2 + ((y - cy) / 8) ** 2 <= 1) { const i = y * WW + x; T[y][x] = 1; GR[i] = grass; ZN[y][x] = "wiese"; } }
  START.tx = cx; START.ty = cy; GATE.x = 2; GATE.y = 2; GATE3.x = 6; GATE3.y = 2; GATE4.x = 10; GATE4.y = 2;
  RELEASE.areas = 4; GAME.startFlags = ["gotFlute", "hasIdx"]; GAME.title = "Mein Spiel";
  ED.assets = { tiles: {}, stamps: [], icons: {} }; ED.settings = Object.assign({}, ED.settings, { release: 4 }); ED.name = "Neues Spiel"; $q("#pname").value = ED.name;
  registerAssets(); if (window.invalidateAll) invalidateAll(); touch(); try { document.title = GAME.title; } catch (e) { } ED.tab = "start"; renderTab();
  toast("Leeres Spiel angelegt. Bau zuerst Tonlinge und Zonen, dann Figuren.");
  return true;
}
