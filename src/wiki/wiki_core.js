
/* ===== Wiki-Kern: Einstellungen, Spielstand, Router, Animation der Spiel-Grafiken, Suche ===== */
const $$ = (sel, root) => [...(root || document).querySelectorAll(sel)];
const el = id => document.getElementById(id);

/* ----- Einstellungen (nur in diesem Browser) ----- */
const PREF = (() => { let p = {}; try { p = JSON.parse(localStorage.getItem("tonlinge-wiki") || "{}"); } catch (e) {}
  p.favs = p.favs || []; p.recent = p.recent || []; if (p.hideSpoil == null) p.hideSpoil = false; if (p.me == null) p.me = true; if (p.pp == null) p.pp = .5;
  return p; })();
const savePref = () => { try { localStorage.setItem("tonlinge-wiki", JSON.stringify(PREF)); } catch (e) {} };

/* ----- Spielstand: aus dem Browser (gleiche Adresse wie das Spiel) oder per Speichercode ----- */
const PME = { has: false, name: "", src: "" };
function meApply(o, src) { S = Object.assign(fresh(), o); S.flags = S.flags || {}; S.stats = Object.assign({ catches: 0, tries: 0 }, S.stats || {}); PME.has = true; PME.src = src; PME.name = S.name || ""; }
function meLoad() { try { const r = JSON.parse(localStorage.getItem(KEYW)); if (r && r.v === 1 && Array.isArray(r.inv)) { meApply(r, "Browser"); return true; } } catch (e) {} return false; }
function meClear() { S = fresh(); PME.has = false; PME.src = ""; }
async function meUnpack(str) {
  str = (str || "").replace(/\s+/g, ""); const m = /^(TL1z?):(.+)$/.exec(str); if (!m) throw 0;
  let b = m[2].replace(/-/g, "+").replace(/_/g, "/"); while (b.length % 4) b += "="; const bin = atob(b), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  let out = u; if (m[1] === "TL1z") out = new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("deflate"))).arrayBuffer());
  const o = JSON.parse(new TextDecoder().decode(out)); if (!o || o.v !== 1 || !Array.isArray(o.inv) || typeof o.lvl !== "number") throw 0; return o;
}
const qDone = id => !!(S.q && S.q[id] && S.q[id].st === "done");
const meOn = () => PME.has && PREF.me;
const caught = id => meOn() && dexC(id) > 0;

/* ----- Kleine Helfer für HTML ----- */
const rarName = r => RAR[r].name;
const rarPill = r => `<span class="pill r${r}"><i style="background:${RAR[r].col}"></i>${RAR[r].name}</span>`;
const areaName = a => (AREAS[a] && AREAS[a].name) || ("Bereich " + a);
const areaLink = a => `<a class="wl" href="#/ort/bereich${a}">${esc(areaName(a))}</a>`;
const zoneLink = z => `<a class="wl" href="#/ort/${z}">${esc(ZINFO[z].n)}</a>`;
const mini = (kind, id, extra = "") => `<canvas class="mini" data-${kind}="${id}" data-px="56" data-still="1" ${extra}></canvas>`;
const spLink = (id, label) => SP[id] ? `<a class="wl sp" href="#/tonling/${id}">${mini("sp", id)}${esc(label || SP[id].n)}</a>` : esc(id);
const inLink = (id, label) => INSTR[id] ? `<a class="wl ic" href="#/instrument/${id}">${mini("in", id)}${esc(label || INSTR[id].name)}</a>` : esc(id);
const npLink = (id, label) => NPCS[id] ? `<a class="wl np" href="#/npc/${id}">${mini("np", id)}${esc(label || NPCS[id].n)}</a>` : esc(id);
const qLink = (id, label) => QUESTS[id] ? `<a class="wl" href="#/quest/${id}">${esc(label || QUESTS[id].title)}</a>` : esc(id);
const mutLink = (id, label) => mutOf(id) ? `<a class="wl" href="#/mutation/${id}" style="color:${mutOf(id).dk || "var(--accent)"}">${esc(label || mutOf(id).name)}</a>` : esc(id);
const spoil = h => `<span class="spoil${PREF.hideSpoil ? "" : " open"}" onclick="this.classList.add('open')" title="Spoiler: zum Aufdecken klicken">${h}</span>`;
const box = (kind, title, h) => `<div class="box ${kind}"><b>${title}</b>${h}</div>`;
const sbar = (label, v, max, bonus) => `<div class="sbar"><span>${label}</span><u><b style="width:${Math.min(100, Math.round(Math.sqrt(v / max) * 100))}%"></b></u><em>${fmtD(v, v % 1 ? 1 : 0)}${bonus ? ` <span class="bonus">(+${fmtD(bonus, bonus % 1 ? 1 : 0)})</span>` : ""}</em></div>`;

/* ----- Zeichnen: dieselben Funktionen wie im Spiel, hier animiert ----- */
const ANI = { vis: new Set(), io: null, last: 0, on: true };
const aSeed = s => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) % 997; return h / 997 * 6; };
const DRAW = {
  sp(c, w, h, t, d) { const sp = SP[d.sp]; if (!sp) return; drawTonling(c, sp, w / 2, h * .53, w * .64 * (d.k || 1), t, d.mut || null); },
  in(c, w, h, t, d) { const i = INSTR[d.in], kind = i ? i.kind : d.in; c.save(); c.translate(w / 2, h / 2 + Math.sin(t * 2) * h * .012); c.rotate(Math.sin(t * 1.3) * .05); c.translate(-w / 2, -h / 2); drawIcon(c, kind, w * .07, h * .07, w * .86); c.restore(); },
  nt(c, w, h, t, d) { c.save(); const k = w / 240; c.scale(k, k); drawNameTag(c, 120, h / k * .62, d.nm || "Wanderer", +d.lv || 42, d.nt, t); c.restore(); },
  np(c, w, h, t, d) { const n = NPCS[d.np]; if (!n) return; const L = (typeof NPC_LOOK !== "undefined" && NPC_LOOK[d.np]) || ambLook(d.np).look; c.save(); const k = w / 62; c.translate(w / 2, h * .9); c.scale(k, k); drawPerson(c, 0, 0, n.col, n.hat, { look: L, face: Math.floor(t / 4) % 2 ? 1 : -1, gest: 0 }, t); c.restore(); }
};
function sizeCanvas(cv) { const px = +cv.dataset.px || 156; if (cv.dataset.w) { cv.width = +cv.dataset.w; cv.height = +cv.dataset.h || +cv.dataset.w; } else { cv.width = cv.height = px; } }
function paint(cv, t) { const kind = cv.dataset.sp != null ? "sp" : cv.dataset.in != null ? "in" : cv.dataset.np != null ? "np" : cv.dataset.nt != null ? "nt" : null; if (!kind) return;
  const c = cv.getContext("2d"), w = cv.width, h = cv.height; c.clearRect(0, 0, w, h);
  try { DRAW[kind](c, w, h, t + (cv._ph || 0), { sp: cv.dataset.sp, in: cv.dataset.in, np: cv.dataset.np, nt: cv.dataset.nt, nm: cv.dataset.nm, lv: cv.dataset.lv, mut: cv.dataset.mut, k: +cv.dataset.k || 1 }); } catch (e) { /* einzelne Grafik darf nie die Seite stoppen */ } }
function hydrate(root) {
  $$("canvas[data-sp],canvas[data-in],canvas[data-np],canvas[data-nt]", root).forEach(cv => {
    if (cv._h) return; cv._h = 1; sizeCanvas(cv); cv._ph = aSeed(cv.dataset.sp || cv.dataset.in || cv.dataset.np || cv.dataset.nt); cv._fps = +cv.dataset.fps || 14;
    paint(cv, .6); if (cv.dataset.still) return; ANI.io.observe(cv); });
}
function aniLoop(now) { requestAnimationFrame(aniLoop); if (!ANI.on || document.hidden) return;
  let n = 0; ANI.vis.forEach(cv => { if (!cv.isConnected) { ANI.vis.delete(cv); return; } if (++n > 70 && !cv.dataset.big) return; if (now - (cv._l || 0) < 1000 / cv._fps) return; cv._l = now; paint(cv, now / 1000); });
  if (aniLoop.extra) aniLoop.extra.forEach(f => f(now / 1000)); }
ANI.io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? ANI.vis.add(e.target) : ANI.vis.delete(e.target)), { rootMargin: "80px" });
aniLoop.extra = [];
requestAnimationFrame(aniLoop);

/* ----- Router: #/seite/parameter?abfrage ----- */
const WP = {}, NAV = [];
let CUR = { name: "", args: [], q: new URLSearchParams() };
function parseHash() { const h = location.hash.replace(/^#\/?/, ""), [p, qs] = h.split("?"); const parts = p.split("/").filter(Boolean).map(decodeURIComponent); return { name: parts[0] || "start", args: parts.slice(1), q: new URLSearchParams(qs || "") }; }
const go = (path) => { location.hash = "#/" + path; };
const qs = (o) => { const u = new URLSearchParams(); for (const k in o) if (o[k] != null && o[k] !== "") u.set(k, o[k]); const s = u.toString(); return s ? "?" + s : ""; };
function setQ(patch) { const q = new URLSearchParams(CUR.q); for (const k in patch) { if (patch[k] == null || patch[k] === "") q.delete(k); else q.set(k, patch[k]); } const s = q.toString(); history.replaceState(null, "", "#/" + [CUR.name, ...CUR.args.map(encodeURIComponent)].join("/") + (s ? "?" + s : "")); CUR.q = q; }
function wkRender() {
  const r = parseHash(); CUR = r; const pg = WP[r.name] || WP.notfound, root = el("wkPage");
  let res; try { res = pg(r.args, r.q); } catch (e) { console.error(e); res = { t: "Fehler", h: box("warn", "Da ist etwas schiefgegangen", `<p>${esc(e && e.message)}</p>`) }; }
  const crumbs = ['<a href="#/">Wiki</a>'].concat((res.c || []).map(c => c[0] ? `<a href="#/${c[0]}">${esc(c[1])}</a>` : esc(c[1]))).join(" › ");
  root.innerHTML = `<div class="crumbs">${crumbs}</div><h1 class="pt">${res.title || esc(res.t || "")}</h1>${res.h || ""}<div class="clear"></div>`;
  document.title = (res.t || "Wiki") + " – Tonlinge-Wiki"; hydrate(root); if (res.after) { try { res.after(root); } catch (e) { console.error(e); } }
  bindSpoil(root); navMark(); if (!res.keep) window.scrollTo(0, 0); document.body.classList.remove("menu");
  if (res.recent) { PREF.recent = [res.recent, ...PREF.recent.filter(x => x.u !== res.recent.u)].slice(0, 12); savePref(); }
}
function rerender(keepScroll) { const y = window.scrollY; wkRender(); if (keepScroll) window.scrollTo(0, y); }
function bindSpoil() {}

/* ----- Sortierbare Tabellen ----- */
function tableSort(root) { $$("table.wt", root).forEach(tb => { if (tb._s) return; tb._s = 1; const ths = $$("th.s", tb);
  ths.forEach((th, ci) => th.addEventListener("click", () => { const idx = [...th.parentNode.children].indexOf(th), dir = th.classList.contains("asc") ? -1 : 1;
    ths.forEach(x => x.classList.remove("asc", "desc")); th.classList.add(dir === 1 ? "asc" : "desc");
    const body = tb.tBodies[0], rows = [...body.rows]; const val = r => { const c = r.cells[idx]; const v = c.dataset.v != null ? c.dataset.v : c.textContent; const n = parseFloat(String(v).replace(/\./g, "").replace(",", ".")); return c.dataset.v != null || /^[\d.,%\s~–-]+$/.test(String(v).trim()) && !isNaN(n) ? (isNaN(n) ? -1e18 : n) : String(v).trim().toLowerCase(); };
    rows.sort((a, b) => { const x = val(a), y = val(b); return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "de")) * dir; }); rows.forEach(r => body.appendChild(r)); })); }); }

/* ----- Tooltip und Hinweise ----- */
const tip = el("wkTip");
document.addEventListener("mouseover", e => { const t = e.target.closest && e.target.closest("[data-tip]"); if (!t) { tip.hidden = true; return; } tip.innerHTML = t.dataset.tip; tip.hidden = false; const r = t.getBoundingClientRect(); tip.style.left = Math.max(8, Math.min(innerWidth - 310, r.left)) + "px"; tip.style.top = (r.bottom + 6 > innerHeight - 80 ? r.top - tip.offsetHeight - 6 : r.bottom + 6) + "px"; });
function toast(t) { const d = document.createElement("div"); d.textContent = t; el("wkToast").appendChild(d); setTimeout(() => d.remove(), 2600); }

/* ----- Favoriten ----- */
const isFav = u => PREF.favs.some(f => f.u === u);
function toggleFav(u, t, kind, id) { const i = PREF.favs.findIndex(f => f.u === u); if (i >= 0) PREF.favs.splice(i, 1); else PREF.favs.push({ u, t, kind, id }); savePref(); }
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-fav]"); if (!b) return; e.preventDefault(); toggleFav(b.dataset.fav, b.dataset.t, b.dataset.kind, b.dataset.id); b.textContent = isFav(b.dataset.fav) ? "★" : "☆"; toast(isFav(b.dataset.fav) ? "Zu den Favoriten hinzugefügt" : "Aus den Favoriten entfernt"); navBuild(); });
const favBtn = (u, t, kind, id) => `<button class="btn" data-fav="${u}" data-t="${esc(t)}" data-kind="${kind}" data-id="${id}" style="min-height:34px;font-size:22px;padding:0 10px" title="Favorit">${isFav(u) ? "★" : "☆"}</button>`;

/* ----- Seitenleiste ----- */
function navBuild() {
  const sec = (t, items) => `<h4>${t}</h4>` + items.map(i => `<a href="#/${i[0]}" data-nav="${i[0].split("/")[0]}">${i[2] || ""}${i[1]}${i[3] ? `<small>${i[3]}</small>` : ""}</a>`).join("");
  const sp = id => `<canvas data-sp="${id}" data-px="44" data-still="1"></canvas>`, ic = id => `<canvas data-in="${id}" data-px="44" data-still="1"></canvas>`;
  const favs = PREF.favs.length ? `<h4>Favoriten</h4>` + PREF.favs.slice(0, 12).map(f => `<a href="#/${f.u}">${f.kind === "tonling" ? `<canvas data-sp="${f.id}" data-px="44" data-still="1"></canvas>` : f.kind === "instrument" ? `<canvas data-in="${f.id}" data-px="44" data-still="1"></canvas>` : "★ "}${esc(f.t)}</a>`).join("") : "";
  el("wkSide").innerHTML = `<div id="wkClock"><canvas id="wkClockC" width="84" height="84"></canvas><div><b id="wkClockT">--:--</b><small id="wkClockS"></small></div></div>`
    + sec("Lexikon", [["tonlinge", "Tonlinge", sp("tupfel"), SPECIES.length], ["instrumente", "Instrumente", ic("holz"), Object.keys(INSTR).length], ["mutationen", "Mutationen", sp("wippa").replace('data-sp', 'data-mut="funkel" data-sp'), MUTS.length], ["verzauberungen", "Verzauberungen", "✦ ", Object.keys(ENCH).length], ["titel", "Titel", "♛ ", TITLES.length]])
    + sec("Welt", [["ort", "Orte & Karte", "⌖ "], ["npcs", "NPCs", "☺ ", Object.keys(NPCS).length], ["quests", "Quests", "! ", Object.keys(QUESTS).length], ["items", "Fundstücke & Geheimnisse", "◈ "]])
    + sec("Werkzeuge", [["rechner/chance", "Chancen-Rechner", "% "], ["rechner/wert", "Wert-Rechner", "♪ "], ["rechner/xp", "Level-Rechner", "↑ "], ["rechner/mutation", "Mutations-Rechner", "✧ "], ["rechner/meister", "Meisterschaft", "★ "], ["vergleich", "Instrument-Vergleich", "⇄ "], ["rechner/sim", "Wurf-Simulator", "⚄ "], ["planer", "Quest-Planer", "✎ "]])
    + sec("Anleitung", [["guide", "Alle Anleitungen", "? "], ["guide/start", "Erste Schritte"], ["guide/fangen", "Tonlinge fangen"], ["guide/glueck", "Glück & Seltenheit"]])
    + favs + sec("Persönlich", [["stand", "Mein Stand", "☻ "], ["sammlung", "Meine Sammlung", "▦ "], ["favoriten", "Favoriten & Verlauf", "★ "]])
    + sec("Wiki", [["neu", "Neuigkeiten", "✦ "], ["info", "Über das Wiki", "i "]]);
  hydrate(el("wkSide")); navMark();
}
function navMark() { $$("#wkSide a").forEach(a => a.classList.toggle("on", (a.dataset.nav === CUR.name && CUR.name !== "rechner" && CUR.name !== "guide") || (CUR.name === "tonling" && a.dataset.nav === "tonlinge") || (CUR.name === "instrument" && a.dataset.nav === "instrumente") || (CUR.name === "mutation" && a.dataset.nav === "mutationen") || (CUR.name === "npc" && a.dataset.nav === "npcs") || (CUR.name === "quest" && a.dataset.nav === "quests") || (CUR.name === "verzauberung" && a.dataset.nav === "verzauberungen") || (CUR.name === "titel" && a.dataset.nav === "titel") || (CUR.name === "rechner" && a.getAttribute("href") === "#/rechner/" + CUR.args[0]) || (CUR.name === "guide" && a.getAttribute("href") === "#/guide" + (CUR.args[0] ? "/" + CUR.args[0] : "")))); }

/* ----- Uhr der Spielwelt ----- */
function clockTick() {
  const c = W.clock(), t = el("wkClockT"), s = el("wkClockS"); if (!t) return; t.textContent = c.text;
  s.innerHTML = (c.night ? "Nacht" : "Tag") + " " + c.day + "<br>" + (c.night ? "Tag" : "Nacht") + " in " + W.mmss(c.toChange);
  const cv = el("wkClockC"), x = cv.getContext("2d"), w = cv.width, h = cv.height; x.clearRect(0, 0, w, h); x.save(); x.translate(w / 2, h / 2); x.lineJoin = x.lineCap = "round"; x.lineWidth = 4; x.strokeStyle = INK;
  const tt = performance.now() / 1000;
  if (!c.night) { x.rotate(tt * .3); for (let i = 0; i < 10; i++) { x.rotate(Math.PI / 5); x.beginPath(); x.moveTo(0, -28); x.lineTo(0, -36); x.stroke(); } x.beginPath(); x.arc(0, 0, 21, 0, 7); x.fillStyle = "#ffd45a"; x.fill(); x.stroke(); }
  else { x.rotate(-.3); x.beginPath(); x.arc(0, 0, 27, 0, 7); x.fillStyle = "#e9edff"; x.fill(); x.stroke(); x.beginPath(); x.arc(12, -6, 22, 0, 7); x.fillStyle = "#2a3350"; x.fill(); x.rotate(.3); x.fillStyle = "#fff0a0"; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(-30 + i * 6, 24 - i * 13 + Math.sin(tt * 2 + i) * 2, 2.4, 0, 7); x.fill(); } }
  x.restore();
}
aniLoop.extra.push((() => { let l = 0; return t => { if (t - l > .5) { l = t; clockTick(); } }; })());

/* ----- Logo: drei Tonlinge hüpfen im Kopf ----- */
aniLoop.extra.push(t => { const cv = el("wkLogo"); if (!cv) return; const c = cv.getContext("2d"); c.clearRect(0, 0, cv.width, cv.height);
  [["tupfel", 46, 0], ["goldkrone", 138, 1.1], ["karminstern", 230, 2.2]].forEach(([id, x, ph]) => drawTonling(c, SP[id], x, 78, 76, t + ph, null)); });

/* ----- Suche ----- */
const SEARCH = [];
const fold = s => String(s).toLowerCase().replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
function searchBuild() {
  SPECIES.forEach(s => SEARCH.push({ ty: "Tonling", n: s.n, u: "tonling/" + s.id, sub: rarName(s.r) + " · " + areaName(s.a), th: ["sp", s.id], k: fold(s.n + " " + rarName(s.r) + " " + areaName(s.a) + " " + s.z.map(z => ZINFO[z].n).join(" ")) }));
  Object.keys(INSTR).forEach(id => SEARCH.push({ ty: "Instrument", n: INSTR[id].name, u: "instrument/" + id, sub: INSTR[id].tag || "", th: ["in", id], k: fold(INSTR[id].name + " " + (INSTR[id].info || "")) }));
  MUTS.forEach(m => SEARCH.push({ ty: "Mutation", n: m.name, u: "mutation/" + m.id, sub: "×" + m.mul + " Wert", th: ["sp", "wippa", m.id], k: fold(m.name + " " + m.adj) }));
  Object.keys(ENCH).forEach(id => SEARCH.push({ ty: "Verzauberung", n: ENCH[id].n, u: "verzauberung/" + id, sub: ENCH[id].d, k: fold(ENCH[id].n + " " + ENCH[id].d) }));
  Object.keys(ZINFO).forEach(z => SEARCH.push({ ty: "Ort", n: ZINFO[z].n, u: "ort/" + z, sub: areaName(ZINFO[z].a), k: fold(ZINFO[z].n + " " + areaName(ZINFO[z].a)) }));
  [1, 2, 3, 4, 5].forEach(a => SEARCH.push({ ty: "Bereich", n: areaName(a), u: "ort/bereich" + a, sub: "Bereich " + a, k: fold(areaName(a) + " bereich " + a) }));
  Object.keys(NPCS).forEach(id => SEARCH.push({ ty: "NPC", n: NPCS[id].n, u: "npc/" + id, sub: areaName(NPCS[id].area), th: ["np", id], k: fold(NPCS[id].n + " " + (NPCS[id].hi || "")) }));
  Object.keys(QUESTS).forEach(id => SEARCH.push({ ty: "Quest", n: QUESTS[id].title, u: "quest/" + id, sub: (NPCS[QUESTS[id].npc] ? NPCS[QUESTS[id].npc].n : "") + " · Level " + QUESTS[id].lvl, k: fold(QUESTS[id].title + " " + (NPCS[QUESTS[id].npc] ? NPCS[QUESTS[id].npc].n : "")) }));
  TITLES.forEach(t => SEARCH.push({ ty: "Titel", n: t.name, u: "titel/" + t.id, sub: t.d, k: fold(t.name + " " + t.d) }));
  Object.keys(ITEMS).forEach(id => SEARCH.push({ ty: "Fundstück", n: ITEMS[id].n, u: "items", sub: "Fundstück", k: fold(ITEMS[id].n) }));
  (window.GUIDES || []).forEach(g => SEARCH.push({ ty: "Anleitung", n: g.t, u: "guide/" + g.id, sub: g.sub || "", k: fold(g.t + " " + (g.kw || "")) }));
  [["rechner/chance", "Chancen-Rechner", "chance wahrscheinlichkeit spawn"], ["rechner/wert", "Wert-Rechner", "noten verkaufen preis"], ["rechner/xp", "Level-Rechner", "erfahrung level ep"], ["rechner/mutation", "Mutations-Rechner", "mutation"], ["rechner/meister", "Meisterschaft", "meisterschaft instrument stufe"], ["vergleich", "Instrument-Vergleich", "vergleich"], ["rechner/sim", "Wurf-Simulator", "simulation"], ["planer", "Quest-Planer", "planer was jetzt"], ["stand", "Mein Stand", "spielstand code fortschritt"], ["neu", "Neuigkeiten", "patch changelog"]].forEach(x => SEARCH.push({ ty: "Werkzeug", n: x[1], u: x[0], sub: "", k: fold(x[1] + " " + x[2]) }));
}
function searchRun(q) { q = fold(q); if (!q) return []; const ws = q.split(" "); const out = [];
  SEARCH.forEach(e => { const nn = fold(e.n); let sc = 0; if (nn === q) sc = 100; else if (nn.startsWith(q)) sc = 80; else if (nn.includes(q)) sc = 60; else if (ws.every(w => e.k.includes(w))) sc = 30; else return; if (e.ty === "Tonling" || e.ty === "Instrument") sc += 3; out.push([sc - nn.length * .01, e]); });
  out.sort((a, b) => b[0] - a[0]); return out.slice(0, 14).map(x => x[1]); }
let resSel = 0, resList = [];
function resShow() { const box = el("wkRes"); if (!resList.length) { box.hidden = true; return; } box.hidden = false;
  box.innerHTML = resList.map((e, i) => `<a class="rs${i === resSel ? " on" : ""}" href="#/${e.u}" data-i="${i}">${e.th ? `<canvas data-${e.th[0]}="${e.th[1]}" ${e.th[2] ? `data-mut="${e.th[2]}"` : ""} data-px="76" data-still="1"></canvas>` : `<canvas width="1" height="1"></canvas>`}<span><b>${esc(e.n)}</b><small>${esc(e.sub)}</small></span><span class="ty">${e.ty}</span></a>`).join(""); hydrate(box); }
function searchInit() {
  const inp = el("wkSearch"), box = el("wkRes");
  inp.addEventListener("input", () => { resList = searchRun(inp.value); resSel = 0; resShow(); });
  inp.addEventListener("keydown", e => { if (e.key === "ArrowDown") { resSel = Math.min(resList.length - 1, resSel + 1); resShow(); e.preventDefault(); } else if (e.key === "ArrowUp") { resSel = Math.max(0, resSel - 1); resShow(); e.preventDefault(); }
    else if (e.key === "Enter" && resList[resSel]) { go(resList[resSel].u); box.hidden = true; inp.blur(); } else if (e.key === "Escape") { box.hidden = true; inp.blur(); } });
  box.addEventListener("click", () => { box.hidden = true; inp.value = ""; });
  document.addEventListener("click", e => { if (!e.target.closest("#wkSearchBox")) box.hidden = true; });
  document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k" || (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test((e.target.tagName || "")))) { e.preventDefault(); inp.focus(); inp.select(); } });
}

/* ----- Kopfzeilen-Knöpfe ----- */
function toolsBuild() {
  el("wkTools").innerHTML = `<button class="btn" id="tbRand" title="Zufälliger Tonling">⚄ Zufall</button><button class="btn" id="tbSpoil" aria-pressed="${PREF.hideSpoil}" title="Story-Texte und Spoiler verbergen">Spoiler: ${PREF.hideSpoil ? "aus" : "an"}</button><a class="btn" id="tbGame" href="../" style="display:inline-flex;align-items:center;text-decoration:none" title="Zum Spiel">Zum Spiel ›</a>`;
  el("tbRand").onclick = () => go("tonling/" + SPECIES[Math.floor(Math.random() * SPECIES.length)].id);
  el("tbSpoil").onclick = () => { PREF.hideSpoil = !PREF.hideSpoil; savePref(); toolsBuild(); rerender(true); };
}

/* ----- Start ----- */
function wikiBoot() {
  meLoad(); try { if (typeof bgBuild === "function") bgBuild(); } catch (e) { console.error(e); } toolsBuild(); navBuild(); searchBuild(); searchInit();
  el("wkMenu").onclick = () => document.body.classList.toggle("menu");
  el("wkPage").addEventListener("click", e => { const t = e.target.closest("[data-go]"); if (t) go(t.dataset.go); });
  addEventListener("hashchange", wkRender); wkRender();
  el("wkFoot").innerHTML = `Tonlinge-Wiki · alle Zahlen kommen direkt aus den Spieldaten · <a href="../">Zum Spiel</a> · <a href="#/info">Über das Wiki</a>`;
  document.addEventListener("click", e => { if (document.body.classList.contains("menu") && !e.target.closest("#wkSide,#wkMenu")) document.body.classList.remove("menu"); });
}
