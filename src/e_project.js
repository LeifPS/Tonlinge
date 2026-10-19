/* ===== PROJEKT: eigene Welten laden (Welt-Editor) =====
   Eine Projektdatei (JSON) enthält nur das, was von der Standardwelt abweicht:
   { format, v, name, world: {t,a,z,g,o}, data: { Tabelle: { id: Eintrag | null } }, assets: { tiles }, settings }
   Beim Start liest das Spiel sie aus dem Browser-Speicher (oder aus window.EMBEDDED_PROJECT) und legt sie über die Standardwelt. */
const PROJ_KEY = "tonlinge-projekt-v1";
const PROJ_FORMAT = "tonlinge-projekt";
/* Tabellen: map = Einträge nach Kennung, list = Liste mit id-Feld, replace = ganze Liste, obj = ein Objekt */
const PROJ_TABLES = {
  NPCS: ["map", () => NPCS], NPC_LOOK: ["map", () => NPC_LOOK], NPC_VOICE: ["map", () => NPC_VOICE],
  QUESTS: ["map", () => QUESTS], QX: ["map", () => QX], GREET: ["map", () => GREET], STORY: ["map", () => STORY],
  SHOPS: ["map", () => SHOPS], ITEMS: ["map", () => ITEMS], INSTR: ["map", () => INSTR], AREAS: ["map", () => AREAS], ZINFO: ["map", () => ZINFO],
  FWALLS: ["map", () => FWALLS], SONGS: ["map", () => SONGS], TRACKS: ["map", () => TRACKS], AL_X: ["map", () => window.AL_X || (window.AL_X = {})],
  SPECIES: ["list", () => SPECIES], MUTS: ["list", () => MUTS], RAR: ["list", () => RAR],
  HOUSES: ["replace", () => HOUSES],
  GATE: ["obj", () => GATE], GATE3: ["obj", () => GATE3], GATE4: ["obj", () => GATE4], START: ["obj", () => START], RELEASE: ["obj", () => RELEASE]
};
const _isObj = v => v && typeof v === "object" && !Array.isArray(v);
const _clone = v => v === undefined ? undefined : JSON.parse(JSON.stringify(v));
function _deepEq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function _merge(t, p) { for (const k in p) { const v = p[k]; if (v === null) delete t[k]; else if (_isObj(v) && _isObj(t[k])) _merge(t[k], v); else t[k] = _clone(v); } }

/* ----- Welt-Ebenen: Lauflängenkodierung ----- */
function rleEnc(a) { const o = []; let v = a[0], n = 0; for (let i = 0; i < a.length; i++) { if (a[i] === v) n++; else { o.push(v, n); v = a[i]; n = 1; } } o.push(v, n); return o; }
function rleDec(r, len) { const a = new Array(len); let i = 0; for (let k = 0; k < r.length; k += 2) for (let n = 0; n < r[k + 1] && i < len; n++) a[i++] = r[k]; return a; }
function listEnc(arr) { const list = [null]; const m = new Map([[null, 0]]); const d = arr.map(v => { v = v || null; if (!m.has(v)) { m.set(v, list.length); list.push(v); } return m.get(v); }); return { l: list, d: rleEnc(d) }; }
function listDec(o, len) { const d = rleDec(o.d, len); return d.map(i => o.l[i] || null); }
/* Welt als flache Arrays (Kachel, Bereich, Zone, Boden, Objekt) */
function worldGet() {
  const t = [], a = [], z = [];
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) { t.push(T[y][x]); a.push(AM[y * WW + x]); z.push(ZN[y][x]); }
  return { t, a, z, g: GR.slice(), o: OB.slice() };
}
function worldPack(w) { return { w: WW, h: WH, t: rleEnc(w.t), a: rleEnc(w.a), z: listEnc(w.z), g: listEnc(w.g), o: listEnc(w.o) }; }
function worldUnpack(p) { const n = WW * WH; return { t: rleDec(p.t, n), a: rleDec(p.a, n), z: listDec(p.z, n), g: listDec(p.g, n), o: listDec(p.o, n) }; }
function worldSet(w) {
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) {
    const i = y * WW + x; let t = w.t[i]; const g = w.g[i] && TILE_REG[w.g[i]], o = w.o[i] && TILE_REG[w.o[i]];
    GR[i] = g && t !== 0 && t !== 5 ? w.g[i] : null; OB[i] = o && t !== 0 && t !== 5 ? w.o[i] : null;
    if (t === 1 || t === 2 || t === 4 || t === 3) { if (g && g.t3) t = 3; else if (t === 3 && g && !g.solid) t = 1; if (o) { if (o.solid && t !== 3) t = 4; else if (!o.solid && t === 4) t = 1; } }
    T[y][x] = t; AM[i] = w.a[i]; ZN[y][x] = w.z[i];
  }
  if (typeof chunks !== "undefined") chunks.clear();
}

/* ----- Daten-Tabellen ----- */
function projTables() { const o = {}; for (const k in PROJ_TABLES) { const [m, g] = PROJ_TABLES[k]; o[k] = _clone(g()); } return o; }
function projApplyData(data) {
  for (const k in data) {
    const def = PROJ_TABLES[k]; if (!def) continue; const [mode, get] = def, tgt = get(), p = data[k];
    if (mode === "map") { for (const id in p) { if (p[id] === null) delete tgt[id]; else if (_isObj(p[id]) && _isObj(tgt[id])) _merge(tgt[id], p[id]); else tgt[id] = _clone(p[id]); } }
    else if (mode === "list") { for (const id in p) { const i = tgt.findIndex(e => e.id === id); if (p[id] === null) { if (i >= 0) tgt.splice(i, 1); } else if (i >= 0) _merge(tgt[i], p[id]); else tgt.push(Object.assign({ id }, _clone(p[id]))); } }
    else if (mode === "replace") { tgt.length = 0; _clone(p).forEach(e => tgt.push(e)); }
    else if (mode === "obj") _merge(tgt, p);
  }
}
/* Unterschiede zwischen zwei Tabellen-Ständen */
function projDiff(base, cur) {
  const out = {};
  for (const k in PROJ_TABLES) {
    const mode = PROJ_TABLES[k][0], b = base[k], c = cur[k]; if (_deepEq(b, c)) continue;
    if (mode === "map") { const d = {}; for (const id in c) if (!_deepEq(b[id], c[id])) d[id] = c[id]; for (const id in b) if (!(id in c)) d[id] = null; if (Object.keys(d).length) out[k] = d; }
    else if (mode === "list") { const d = {}; c.forEach(e => { const be = b.find(x => x.id === e.id); if (!be || !_deepEq(be, e)) d[e.id] = e; }); b.forEach(e => { if (!c.find(x => x.id === e.id)) d[e.id] = null; }); if (Object.keys(d).length) out[k] = d; }
    else if (mode === "replace") out[k] = c;
    else { const d = {}; for (const f in c) if (!_deepEq(b[f], c[f])) d[f] = c[f]; if (Object.keys(d).length) out[k] = d; }
  }
  return out;
}

/* ----- Eigene Kacheln ----- */
function projRegisterAssets(assets) {
  const tl = (assets && assets.tiles) || {};
  for (const id in tl) {
    const a = tl[id]; const def = { id, n: a.n || id, cat: a.cat || "Eigene", kind: a.kind === "ground" ? "ground" : "obj", solid: !!a.solid, t3: !!a.t3, custom: 1, src: a };
    if (def.kind === "ground") { def.col = a.col || "#999999"; def.col2 = a.col2 || def.col; def.tex = a.tex || "none"; def.tcol = a.tcol; def.dens = a.dens; def.tcol2 = a.tcol2; }
    if (a.png) { const im = new Image(); im.onload = () => { if (typeof chunks !== "undefined") chunks.clear(); }; im.src = a.png; def.img = im; def.iw = a.iw; def.ih = a.ih; def.ox = a.ox; def.oy = a.oy; }
    else if (a.code) { try { const f = new Function("c", "px", "py", "s", "x", "y", "TH", "INK", "hs", "mixHex", a.code); def.draw = (c, px, py, s, x, y) => f(c, px, py, s, x, y, TH, INK, hs, mixHex); def.code = a.code; } catch (e) { def.draw = () => {}; def.err = String(e); } }
    else if (def.kind === "obj") def.draw = () => {};
    regTile(def);
  }
}

/* Eigene Symbole für Instrumente und Fundstücke */
function projRegisterIcons(assets) {
  for (const k of Object.keys(ICON_X)) delete ICON_X[k];
  const ic = (assets && assets.icons) || {};
  for (const id in ic) {
    const a = ic[id];
    if (a.png) { const im = new Image(); im.src = a.png; ICON_X[id] = { n: a.n, draw: c => { if (im.complete && im.naturalWidth) c.drawImage(im, 0, 0, 40, 40); } }; }
    else if (a.code) { try { const f = new Function("c", "TH", "INK", "hs", "mixHex", a.code); ICON_X[id] = { n: a.n, draw: c => f(c, TH, INK, hs, mixHex) }; } catch (e) { ICON_X[id] = { n: a.n, draw: () => {}, err: String(e) }; } }
  }
}

/* ----- Bedingungen für Erzähltexte: eigene Kürzel ----- */
function condFn(w) {
  if (COND[w]) return COND[w]; if (typeof w !== "string") return () => false;
  let m;
  if ((m = /^q:(.+)$/.exec(w))) return () => qDone(m[1]);
  if ((m = /^lvl:(\d+)$/.exec(w))) return () => S.lvl >= +m[1];
  if ((m = /^catches:(\d+)$/.exec(w))) return () => S.stats.catches >= +m[1];
  if ((m = /^flag:(.+)$/.exec(w))) return () => !!S.flags[m[1]];
  if (w === "day") return () => !isNight();
  return () => false;
}

/* ----- Laden ----- */
let PROJECT = null;
function projApply(P) {
  if (!P || P.format !== PROJ_FORMAT) throw new Error("Das ist keine Tonlinge-Projektdatei.");
  projRegisterAssets(P.assets); projRegisterIcons(P.assets);
  if (P.data) projApplyData(P.data);
  SP_REBUILD();
  Object.keys(ITEMS).forEach(k => ITEMS[k].id = k);
  if (P.world) worldSet(worldUnpack(P.world));
  if (P.settings && P.settings.release) RELEASE.areas = +P.settings.release;
  PROJECT = P; window.PROJECT_NAME = P.name || "Eigene Welt";
}
function SP_REBUILD() { for (const k in SP) delete SP[k]; SPECIES.forEach(s => { SP[s.id] = s; }); }
function projRead() { try { const s = localStorage.getItem(PROJ_KEY); if (s) return JSON.parse(s); } catch (e) {} return window.EMBEDDED_PROJECT || null; }
function projBoot() { const P = projRead(); if (!P) return; try { projApply(P); } catch (e) { window.PROJECT_ERR = String(e.message || e); try { console.warn("Projekt nicht geladen:", e); } catch (_) {} } }
function projStore(json) { localStorage.setItem(PROJ_KEY, typeof json === "string" ? json : JSON.stringify(json)); }
function projClear() { try { localStorage.removeItem(PROJ_KEY); } catch (e) {} }
if (!window.__EDITOR) projBoot();

/* ----- Oberfläche im Spiel (Hilfe-Fenster) ----- */
function projUiHtml() {
  return `<div class="h3">Eigene Welt</div><p class="muted">${window.PROJECT_NAME ? "Geladen: <b>" + String(window.PROJECT_NAME).replace(/[<>&]/g, "") + "</b>" : "Zurzeit läuft die Standardwelt."}${window.PROJECT_ERR ? " <span style='color:#c04040'>Fehler: " + String(window.PROJECT_ERR).replace(/[<>&]/g, "") + "</span>" : ""}</p>
  <button class="btn" id="btnProj">Projektdatei laden</button> <button class="btn" id="btnProjOff">Standardwelt</button> <input type="file" id="fileProj" accept=".json,application/json" hidden> <span class="muted" id="projMsg"></span>`;
}
function projUiInit() {
  const f = $("fileProj"), msg = t => { $("projMsg").textContent = t; };
  $("btnProj").onclick = () => f.click();
  f.onchange = () => { const file = f.files[0]; if (!file) return; const r = new FileReader(); r.onload = () => { try { const P = JSON.parse(r.result); if (P.format !== PROJ_FORMAT) throw new Error("Keine Projektdatei"); projStore(r.result); msg("Geladen. Das Spiel startet neu …"); setTimeout(() => location.reload(), 600); } catch (e) { msg("Fehler: " + e.message); } }; r.readAsText(file); };
  $("btnProjOff").onclick = () => { projClear(); msg("Standardwelt. Das Spiel startet neu …"); setTimeout(() => location.reload(), 600); };
}
