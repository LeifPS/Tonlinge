
/* ===== Seiten Teil B: Orte und Karte, NPCs, Quests, Titel, Fundstücke ===== */
WP.notfound = () => ({ t: "Nicht gefunden", h: box("warn", "Diese Seite gibt es nicht", `<p>Versuche die Suche oben oder gehe zur <a class="wl" href="#/">Hauptseite</a>.</p>`) });

/* ----- Weltkarte aus den echten Kacheln des Spiels ----- */
W._mc = {};
W.layerIds = () => Object.keys(LAYERS).filter(id => LAYERS[id].area <= RELEASE.areas);
W.mapBase = (lid, K) => {
  const key = lid + ":" + K; if (W._mc[key]) return W._mc[key];
  const LY = LAYERS[lid], sT = T, sZ = ZN, sA = window.AM; if (lid !== "main") { T = LY.T; ZN = LY.ZN; window.AM = LY.AM; }
  const cv = document.createElement("canvas"); cv.width = WW * K; cv.height = WH * K; const c = cv.getContext("2d");
  try {
    c.fillStyle = "#1c2442"; c.fillRect(0, 0, cv.width, cv.height);
    for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) {
      const t = T[y][x]; if (lid !== "main" && t === 0 && !ZN[y][x]) continue;
      c.fillStyle = t === 6 ? "#a8563f" : tcol(x, y); c.fillRect(x * K, y * K, K, K);
      if (t === 4) { c.fillStyle = "rgba(20,30,40,.35)"; c.beginPath(); c.arc(x * K + K / 2, y * K + K / 2, K * .32, 0, 7); c.fill(); }
      else if (t === 5) { c.fillStyle = "rgba(255,255,255,.14)"; c.fillRect(x * K, y * K, K, K); }
    }
  } finally { T = sT; ZN = sZ; window.AM = sA; }
  return W._mc[key] = cv;
};
W.mapMarks = (lid) => { const out = []; for (const id in NPCS) { const n = NPCS[id]; if ((n.l || "main") === lid) out.push({ k: "npc", id, x: n.x + .5, y: n.y + .5, n }); }
  if (lid === "main") { [[GATE, "Tor der Höhlen", 2], [GATE3, "Sterntor", 3], [GATE4, "Muscheltor", 4]].forEach(g => out.push({ k: "gate", id: g[1], x: g[0].x + g[0].w / 2, y: g[0].y + .5, w: g[0].w, name: g[1], a: g[2] })); out.push({ k: "gate", id: "Spiegeltor", x: 99.5, y: 107.5, w: 1, name: "Spiegeltor (Eingang zum Sanktum)", a: 5 });
    for (const id in ITEMS) out.push({ k: "item", id, x: ITEMS[id].x + .5, y: ITEMS[id].y + .5, n: ITEMS[id] }); } return out; };
W.zoneLabels = (lid) => { const L = LAYERS[lid], seen = {}, cnt = {}; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) { const z = L.ZN[y][x], t = L.T[y][x]; if (!z || !(t === 1 || t === 2)) continue; const s = seen[z] || (seen[z] = [0, 0]); s[0] += x; s[1] += y; cnt[z] = (cnt[z] || 0) + 1; }
  return Object.keys(seen).map(z => ({ z, x: seen[z][0] / cnt[z] + .5, y: seen[z][1] / cnt[z] + .5, n: cnt[z] })); };
W.mapDraw = (cv, lid, K, o = {}) => {
  const base = W.mapBase(lid, K); cv.width = base.width; cv.height = base.height; const c = cv.getContext("2d"); c.drawImage(base, 0, 0);
  const marks = W.mapMarks(lid);
  if (o.labels !== false) { c.textAlign = "center"; c.textBaseline = "middle"; c.lineJoin = "round"; const fs = Math.max(11, K * 2.5); c.font = fs + "px 'Caveat Brush',cursive";
    W.zoneLabels(lid).forEach(l => { if (l.n < 40) return; const nm = ZINFO[l.z].n; c.lineWidth = 4; c.strokeStyle = "rgba(20,26,50,.85)"; c.strokeText(nm, l.x * K, l.y * K); c.fillStyle = (o.hl && o.hl !== l.z) ? "rgba(255,247,222,.55)" : "#fff7de"; c.fillText(nm, l.x * K, l.y * K); }); }
  marks.forEach(m => { const x = m.x * K, y = m.y * K;
    if (m.k === "npc" && o.npcs !== false) { c.beginPath(); c.arc(x, y, Math.max(3.2, K * .62), 0, 7); c.fillStyle = m.n.col; c.fill(); c.lineWidth = 2; c.strokeStyle = m.n.secret ? "#fff" : INK; if (m.n.secret) c.setLineDash([3, 2]); c.stroke(); c.setLineDash([]); }
    else if (m.k === "gate" && o.gates !== false) { c.fillStyle = "#ffd45a"; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.roundRect(x - m.w * K / 2 - 1, y - K * .5, m.w * K + 2, K + 2, 3); c.fill(); c.stroke(); }
    else if (m.k === "item" && o.items !== false) { c.save(); c.translate(x, y); c.rotate(Math.PI / 4); c.fillStyle = "#fff"; c.strokeStyle = INK; c.lineWidth = 1.6; const r = Math.max(2.6, K * .5); c.fillRect(-r, -r, 2 * r, 2 * r); c.strokeRect(-r, -r, 2 * r, 2 * r); c.restore(); } });
  return marks;
};
/* Ausschnitt um ein Gebiet: Rest abgedunkelt */
W.mapCrop = (cv, lid, zone, K, width) => {
  const L = LAYERS[lid]; let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (L.ZN[y][x] === zone) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  if (x1 < 0) return null; const pad = 6; x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(WW - 1, x1 + pad); y1 = Math.min(WH - 1, y1 + pad);
  const base = W.mapBase(lid, K), sw = (x1 - x0 + 1) * K, sh = (y1 - y0 + 1) * K, sc = width / sw; cv.width = width; cv.height = Math.round(sh * sc); const c = cv.getContext("2d");
  c.drawImage(base, x0 * K, y0 * K, sw, sh, 0, 0, cv.width, cv.height);
  c.fillStyle = "rgba(15,20,44,.55)"; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (L.ZN[y][x] !== zone) c.fillRect((x - x0) * K * sc, (y - y0) * K * sc, K * sc + .6, K * sc + .6);
  W.mapMarks(lid).forEach(m => { if (m.x < x0 || m.x > x1 + 1 || m.y < y0 || m.y > y1 + 1) return; const x = (m.x - x0) * K * sc, y = (m.y - y0) * K * sc;
    if (m.k === "npc") { c.beginPath(); c.arc(x, y, 6, 0, 7); c.fillStyle = m.n.col; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke(); c.font = "16px 'Patrick Hand'"; c.textAlign = "center"; c.lineWidth = 3; c.strokeStyle = "rgba(20,26,50,.9)"; c.strokeText(m.n.n, x, y - 10); c.fillStyle = "#fff7de"; c.fillText(m.n.n, x, y - 10); }
    else if (m.k === "item") { c.save(); c.translate(x, y); c.rotate(Math.PI / 4); c.fillStyle = "#fff"; c.strokeStyle = INK; c.lineWidth = 2; c.fillRect(-5, -5, 10, 10); c.strokeRect(-5, -5, 10, 10); c.restore(); } });
  return { x0, y0, x1, y1 };
};
function bgBuild() { const cv = document.createElement("canvas"), K = 4; const base = W.mapBase("main", K); cv.width = base.width; cv.height = base.height; cv.getContext("2d").drawImage(base, 0, 0); el("wkbg").appendChild(cv); }

/* ----- Beschreibungen der Bereiche ----- */
const AREA_TXT = {
  1: "Das grüne Herz der Welt: Wiesen, Wald, Teich und das Notendorf. Hier lernst du das Fangen und bekommst deine ersten Instrumente. Die Tonlinge sind sanft und leicht zu stimmen.",
  2: "Ein Labyrinth aus Höhlen, Kristallsälen und stillen Becken. Es ist dunkel, die Töne hallen. Hier lebt zum ersten Mal ein Fabelhafter, der Sonnenkern.",
  3: "Schwebende Inseln hoch über den Wolken: Sternwarten, Seen aus Mondlicht und der Gewitterkamm. Die Tonlinge sind schneller und wilder, und hier wohnt der erste Glorreiche.",
  4: "Ein Archipel aus Strand, Riff, Wrack und Tiefsee. Die Tonlinge sind wertvoll und flink, und ganz unten singt das Seelenmeer.",
  5: "Das Sanktum Magus: eine verlassene Zauberakademie mit Hallen, Türmen, Archiv und Spiegeln. Seine Bewohner sind düster und rätselhaft, und tief im Inneren warten die Erhabenen."
};
const AREA_GATE = { 2: "Tor der Höhlen: öffnet sich, wenn du einen Prächtigen im Klanghain gefangen hast (Quest „Das Tor der Höhlen“).", 3: "Sterntor: öffnet sich nach „Der Sternenpfad“ (Dunn).", 4: "Muscheltor am Nordlichtgrat: öffnet sich nach „Der Schlusston“ (Astra).", 5: "Spiegeltor am Wolkenpfad: öffnet sich, sobald das Siegel der Tiefe (Tiefa) abgegeben ist." };
W.areaLevels = a => { const l = Object.values(QUESTS).filter(q => NPCS[q.npc] && NPCS[q.npc].area === a && (!q.rel || q.rel <= RELEASE.areas)).map(q => q.lvl); return l.length ? [Math.min(...l), Math.max(...l)] : null; };

/* =====================  ORTE  ===================== */
function zoneRows(zone, cx) {
  const night = [false, true], L = cx.luck, pp = cx.pp, spp = W.speciesIn(zone, null), out = [];
  spp.forEach(s => { const r = {}; night.forEach(n => { const inZ = s.t === "b" || (s.t === "n") === n; r[n ? "n" : "d"] = inZ ? (1 - pp) * (W.final(zone, n, L, false)[s.id] || 0) + pp * (W.final(zone, n, L, true)[s.id] || 0) : null; }); out.push({ s, d: r.d, n: r.n }); }); return out;
}
WP.ort = (args, q) => {
  const id = args[0];
  if (!id) return { t: "Orte und Karte", h: `<p class="lead">Die Welt der Tonlinge besteht aus <b>5 Bereichen</b> mit insgesamt ${Object.keys(ZINFO).length} Zonen. Klicke auf der Karte ein Gebiet an oder wähle unten einen Bereich.</p>
    <div class="filters"><label>Ebene <select id="mpL">${W.layerIds().map(l => `<option value="${l}">${esc(LAYERS[l].name)}</option>`).join("")}</select></label><label>Größe <select id="mpK">${[4, 6, 8, 10].map(k => `<option value="${k}" ${k === 6 ? "selected" : ""}>${k * 20} %</option>`).join("")}</select></label>
      <label class="ck"><input type="checkbox" id="mpN" checked> NPCs</label><label class="ck"><input type="checkbox" id="mpI" checked> Fundstücke</label><label class="ck"><input type="checkbox" id="mpG" checked> Tore</label><span class="cnt">Klick auf ein Gebiet oder einen NPC öffnet die Seite</span></div>
    <div class="mapwrap" id="mpW"><div class="mapinfo" id="mpInfo">Fahre über die Karte</div><canvas id="mpC"></canvas></div>
    <p class="muted" style="font-size:16px">● Punkt = NPC (gestrichelt = versteckt) · ◆ = Fundstück · gelber Balken = Tor</p>
    <h2 class="st">Bereiche</h2><div class="wgrid l">${[1, 2, 3, 4, 5].filter(a => a <= RELEASE.areas).map(a => { const lv = W.areaLevels(a), ex = SPECIES.filter(s => s.a === a && s.r === 3)[0] || SPECIES.find(s => s.a === a); return `<a class="wc l" href="#/ort/bereich${a}"><canvas data-sp="${ex.id}" data-px="90"></canvas><span><b>${esc(areaName(a))}</b><small>${SPECIES.filter(s => s.a === a).length} Tonlinge · ${Object.keys(ZINFO).filter(z => ZINFO[z].a === a).length} Zonen${lv ? " · Level " + lv[0] + "–" + lv[1] : ""}</small></span></a>`; }).join("")}</div>
    <h2 class="st">Alle Zonen</h2>${tbl([{ t: "Zone", s: 1 }, { t: "Bereich", s: 1 }, { t: "Tonlinge", s: 1, n: 1 }, { t: "Größe", s: 1, n: 1 }, { t: "Dunkelheit", s: 1, n: 1 }, "NPCs"], Object.keys(ZINFO).filter(z => ZINFO[z].a <= RELEASE.areas).map(z => `<tr><td>${zoneLink(z)}</td><td data-v="${ZINFO[z].a}">${esc(areaName(ZINFO[z].a))}</td><td class="n">${W.speciesIn(z, null).length}</td><td class="n" data-v="${W.zoneTiles(z)}">${nfmt(W.zoneTiles(z))}</td><td class="n" data-v="${ZINFO[z].dark}">${Math.round(ZINFO[z].dark * 100)} %</td><td>${W.zoneNpcs(z).map(n => npLink(n)).join(" ")}</td></tr>`))}`,
    after(root) { tableSort(root); const cv = Q1("#mpC", root), info = Q1("#mpInfo", root); let marks = [], K = 6, lid = "main";
      const draw = () => { K = +Q1("#mpK", root).value; lid = Q1("#mpL", root).value; marks = W.mapDraw(cv, lid, K, { npcs: Q1("#mpN", root).checked, items: Q1("#mpI", root).checked, gates: Q1("#mpG", root).checked }); };
      ["mpL", "mpK", "mpN", "mpI", "mpG"].forEach(i => Q1("#" + i, root).onchange = draw); draw();
      const hit = e => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * WW, y = (e.clientY - r.top) / r.height * WH; let best = null, bd = 1.6; marks.forEach(m => { const d = Math.hypot(m.x - x, m.y - y); if (d < bd) { bd = d; best = m; } }); const z = LAYERS[lid].ZN[Math.floor(y)] && LAYERS[lid].ZN[Math.floor(y)][Math.floor(x)]; return { x, y, m: best, z }; };
      cv.onmousemove = e => { const h = hit(e); info.textContent = h.m ? (h.m.k === "npc" ? h.m.n.n + (h.m.n.secret ? " (versteckt)" : "") : h.m.k === "item" ? "Fundstück: " + h.m.n.n : h.m.name) : h.z ? ZINFO[h.z].n + " · " + areaName(ZINFO[h.z].a) : "Fels"; cv.style.cursor = h.m || h.z ? "pointer" : "default"; };
      cv.onclick = e => { const h = hit(e); if (h.m && h.m.k === "npc") go("npc/" + h.m.id); else if (h.m && h.m.k === "item") go("items"); else if (h.z) go("ort/" + h.z); }; } };
  const am = /^bereich(\d)$/.exec(id);
  if (am) { const a = +am[1]; if (!AREAS[a] || a > RELEASE.areas) return WP.notfound();
    const zs = Object.keys(ZINFO).filter(z => ZINFO[z].a === a), sp = SPECIES.filter(s => s.a === a), lv = W.areaLevels(a), A = AREAS[a], npcs = Object.keys(NPCS).filter(n => NPCS[n].area === a);
    const rcnt = RAR.map((r, i) => sp.filter(s => s.r === i).length);
    return { t: areaName(a), title: `${esc(areaName(a))}`, c: [["ort", "Orte"]], h: `<div class="infobox ib"><h3 style="background:var(--accent)">${esc(areaName(a))}</h3><div class="ib-art"><canvas id="arMap" style="height:auto"></canvas></div><dl>
      <div class="ib-r"><dt>Bereich</dt><dd>${a} von 5</dd></div><div class="ib-r"><dt>Zonen</dt><dd>${zs.length}</dd></div><div class="ib-r"><dt>Tonlinge</dt><dd>${sp.length}</dd></div>${lv ? `<div class="ib-r"><dt>Level (Quests)</dt><dd>${lv[0]} bis ${lv[1]}</dd></div>` : ""}<div class="ib-r"><dt>Wert pro Tonling</dt><dd>${nfmt(Math.min(...sp.map(s => s.val)))} bis ${nfmt(Math.max(...sp.map(s => s.val)))}</dd></div><div class="ib-r"><dt>Erfahrung</dt><dd>${nfmt(Math.min(...sp.map(s => s.xp)))} bis ${nfmt(Math.max(...sp.map(s => s.xp)))}</dd></div><div class="ib-r"><dt>NPCs</dt><dd>${npcs.length}</dd></div></dl></div>
      <p class="lead">${esc(AREA_TXT[a] || "")}</p>${AREA_GATE[a] ? box("info", "Zugang", `<p>${esc(AREA_GATE[a])}</p>`) : ""}
      <h2 class="st">Zonen</h2><div class="wgrid l">${zs.map(z => { const l = W.speciesIn(z, null); const top = l.slice().sort((x, y) => y.r - x.r)[0]; return `<a class="wc l" href="#/ort/${z}"><canvas data-sp="${top ? top.id : "tupfel"}" data-px="90"></canvas><span><b>${esc(ZINFO[z].n)}</b><small>${l.length} Tonlinge${top ? " · bis " + rarName(top.r) : ""}</small></span></a>`; }).join("")}</div>
      <h2 class="st">Tonlinge dieses Bereichs</h2><p>${RAR.map((r, i) => rcnt[i] ? `${rarPill(i)} ${rcnt[i]}` : "").filter(Boolean).join(" &nbsp; ")}</p><div class="wgrid">${sp.map(s => tlCard({ s })).join("")}</div>
      <h2 class="st">NPCs</h2><div class="wgrid">${npcs.map(n => `<a class="wc" href="#/npc/${n}"><canvas data-np="${n}" data-px="120"></canvas><b>${esc(NPCS[n].n)}</b><small>${NPCS[n].shop ? "Laden · " : ""}${NPCS[n].secret ? "versteckt" : ""}</small></a>`).join("")}</div>`,
      after() { const cv = Q1("#arMap"); const base = W.mapBase("main", 6); const L = LAYERS.main; let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (areaAt(x, y) === a && L.T[y][x] !== 0) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
        if (x1 < 0) { cv.remove(); return; } const sw = (x1 - x0 + 1) * 6, sh = (y1 - y0 + 1) * 6; cv.width = 320; cv.height = Math.round(320 * sh / sw); cv.style.width = "100%"; cv.getContext("2d").drawImage(base, x0 * 6, y0 * 6, sw, sh, 0, 0, cv.width, cv.height); } }; }
  const z = ZINFO[id]; if (!z) return WP.notfound();
  const nps = W.zoneNpcs(id), items = Object.keys(ITEMS).filter(i => ZN[ITEMS[i].y] && ZN[ITEMS[i].y][ITEMS[i].x] === id), tiles = W.zoneTiles(id), sp = W.speciesIn(id, null);
  const neighbors = Object.keys(ZINFO).filter(o => o !== id && ZINFO[o].a === z.a);
  return { t: z.n, title: esc(z.n), c: [["ort", "Orte"], ["ort/bereich" + z.a, areaName(z.a)]], recent: { u: "ort/" + id, t: z.n, kind: "ort", id }, h: `<div class="infobox ib"><h3 style="background:var(--accent)">${esc(z.n)}</h3><div class="ib-art"><canvas id="znMap" style="height:auto"></canvas></div><dl>
    <div class="ib-r"><dt>Bereich</dt><dd>${areaLink(z.a)}</dd></div><div class="ib-r"><dt>Größe</dt><dd>${nfmt(tiles)} begehbare Felder</dd></div><div class="ib-r"><dt>Helligkeit</dt><dd>${Math.round((1 - z.dark) * 100)} % <small class="muted">(${z.dark > .55 ? "dunkel" : z.dark > .25 ? "gedämpft" : "hell"})</small></dd></div>
    <div class="ib-r"><dt>Tonlinge</dt><dd>${sp.length} Arten</dd></div>${sp.length ? `<div class="ib-r"><dt>Bis Seltenheit</dt><dd>${rarPill(Math.max(...sp.map(s => s.r)))}</dd></div>` : ""}${nps.length ? `<div class="ib-r"><dt>NPCs</dt><dd>${nps.map(n => npLink(n)).join(" ")}</dd></div>` : ""}${items.length ? `<div class="ib-r"><dt>Fundstücke</dt><dd>${items.map(i => esc(ITEMS[i].n)).join(", ")}</dd></div>` : ""}</dl></div>
    <p class="lead">Die Zone <b>${esc(z.n)}</b> gehört zu ${areaLink(z.a)}. ${sp.length ? `Hier leben ${sp.length} Tonling-Arten, darunter ${sp.slice().sort((a, b) => b.r - a.r).slice(0, 3).map(s => spLink(s.id)).join(", ")}.` : ""}</p>
    <h2 class="st">Tonlinge und Chancen</h2><p>Chance pro Wurf, dass die Art erscheint. Ein „–“ heißt: zu dieser Tageszeit nicht da.</p>${cxBar()}<div id="znT"></div>
    ${nps.length ? `<h2 class="st">NPCs hier</h2><div class="wgrid">${nps.map(n => `<a class="wc" href="#/npc/${n}"><canvas data-np="${n}" data-px="120"></canvas><b>${esc(NPCS[n].n)}</b><small>${esc(NPCS[n].hi || "")}</small></a>`).join("")}</div>` : ""}
    ${neighbors.length ? `<h2 class="st">Andere Zonen in ${esc(areaName(z.a))}</h2><p>${neighbors.map(zoneLink).join(" · ")}</p>` : ""}`,
    after(root) { const cv = Q1("#znMap", root); if (!W.mapCrop(cv, "main", id, 6, 320)) { if (!W.layerIds().some(l => l !== "main" && (() => { const L = LAYERS[l]; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (L.ZN[y][x] === id) { W.mapCrop(cv, l, id, 6, 320); return true; } return false; })())) cv.remove(); } if (cv && cv.style) cv.style.width = "100%";
      const draw = () => { const cx = cxGet(), rows = zoneRows(id, cx).sort((a, b) => ((b.d || 0) + (b.n || 0)) - ((a.d || 0) + (a.n || 0)));
        Q1("#znT", root).innerHTML = tbl([{ t: "" }, { t: "Tonling", s: 1 }, { t: "Seltenheit", s: 1 }, { t: "Tags", s: 1, n: 1 }, { t: "Nachts", s: 1, n: 1 }, { t: "Würfe pro Fang (Mix)", s: 1, n: 1 }], rows.map(r => { const m = Math.max(r.d || 0, r.n || 0); return `<tr class="${PME.has && PREF.me && !(dexC(r.s.id) > 0) ? "dim" : ""}"><td><canvas data-sp="${r.s.id}" data-px="88"></canvas></td><td class="nm" data-v="${esc(r.s.n)}"><a class="wl" href="#/tonling/${r.s.id}">${esc(r.s.n)}</a></td><td data-v="${r.s.r}">${rarPill(r.s.r)}</td><td class="n" data-v="${r.d == null ? -1 : r.d}">${r.d == null ? "–" : fmtP(r.d)}</td><td class="n" data-v="${r.n == null ? -1 : r.n}">${r.n == null ? "–" : fmtP(r.n)}</td><td class="n" data-v="${m ? 1 / m : 1e9}">${fmtC(m)}</td></tr>`; })); hydrate(root); tableSort(root); };
      cxBind(root, draw); draw(); } };
};

/* =====================  NPCs  ===================== */
const npcRole = id => { const n = NPCS[id], r = []; if (n.shop) r.push("Laden"); if (n.buy) r.push("kauft Tonlinge"); if (Object.values(QUESTS).some(q => q.npc === id)) r.push("Quests"); if (n.secret) r.push("versteckt"); return r; };
WP.npcs = (args, q) => { const ar = +q.get("a") || 0, role = q.get("r") || "", t = fold(q.get("q") || "");
  const chips = (key, cur, items) => `<div class="fch">${items.map(([v, l]) => `<button class="btn" data-fk="${key}" data-fv="${v}" aria-pressed="${String(cur) === String(v)}">${l}</button>`).join("")}</div>`;
  return { t: "NPCs", h: `<p class="lead">Alle <b>${Object.keys(NPCS).length}</b> Gestalten der Welt: wer verkauft was, wer gibt welche Quests und wo findest du sie?</p><div class="filters"><input type="text" id="npq" placeholder="Name …" value="${esc(q.get("q") || "")}"><label>Bereich ${chips("a", ar || "", [["", "Alle"]].concat([1, 2, 3, 4, 5].filter(a => a <= RELEASE.areas).map(a => [a, a])))}</label><label>Art ${chips("r", role, [["", "Alle"], ["Laden", "Laden"], ["Quests", "Quests"], ["versteckt", "Versteckt"]])}</label><span class="cnt" id="npc"></span></div><div id="npr"></div>`,
    after(root) { const draw = () => { const Q = CUR.q; let l = Object.keys(NPCS).filter(id => NPCS[id].area <= RELEASE.areas); const tt = fold(Q.get("q") || ""); if (tt) l = l.filter(id => fold(NPCS[id].n + " " + (NPCS[id].hi || "")).includes(tt)); if (+Q.get("a")) l = l.filter(id => NPCS[id].area === +Q.get("a")); if (Q.get("r")) l = l.filter(id => npcRole(id).includes(Q.get("r")));
      Q1("#npc", root).textContent = l.length + " NPCs"; const out = Q1("#npr", root); out.innerHTML = `<div class="wgrid">${l.map(id => `<a class="wc" href="#/npc/${id}"><canvas data-np="${id}" data-px="140"></canvas><b>${esc(NPCS[id].n)}</b><small>${esc(areaName(NPCS[id].area))}</small><small>${npcRole(id).join(" · ")}</small></a>`).join("")}</div>`; hydrate(out);
      $$("[data-fk]", root).forEach(b => b.setAttribute("aria-pressed", String((Q.get(b.dataset.fk) || "") === b.dataset.fv))); };
      $$("[data-fk]", root).forEach(b => b.onclick = () => { setQ({ [b.dataset.fk]: b.dataset.fv }); draw(); }); Q1("#npq", root).oninput = e => { setQ({ q: e.target.value }); draw(); }; draw(); } }; };
WP.npc = (args) => { const id = args[0], n = NPCS[id]; if (!n) return WP.notfound();
  const qs = Object.keys(QUESTS).filter(k => QUESTS[k].npc === id && (!QUESTS[k].rel || QUESTS[k].rel <= RELEASE.areas)).sort((a, b) => QUESTS[a].lvl - QUESTS[b].lvl), sh = n.shop && SHOPS[n.shop], zone = ZN[n.y] && ZN[n.y][n.x], st = STORY[id];
  const fwall = FWALLS[id];
  const h = `<div class="infobox ib"><h3 style="background:${n.col}">${esc(n.n)}</h3><div class="ib-art"><canvas data-np="${id}" data-w="360" data-h="330" data-big="1" data-fps="30"></canvas></div><dl>
    <div class="ib-r"><dt>Bereich</dt><dd>${areaLink(n.area)}</dd></div>${zone ? `<div class="ib-r"><dt>Ort</dt><dd>${zoneLink(zone)}</dd></div>` : ""}<div class="ib-r"><dt>Position</dt><dd>Feld ${n.x} | ${n.y}</dd></div>
    <div class="ib-r"><dt>Rolle</dt><dd>${npcRole(id).join(", ") || "Gesprächspartner"}</dd></div>${qs.length ? `<div class="ib-r"><dt>Quests</dt><dd>${qs.length}</dd></div>` : ""}</dl></div>
    <p class="lead">${esc(n.hi || "")}</p>
    ${n.secret ? box("warn", "Versteckt", `<p>${fwall ? "Diese Gestalt sitzt hinter einer <b>falschen Wand</b> bei Feld " + fwall[0] + " | " + fwall[1] + ". Lauf gegen die Wand und halte etwa eine Sekunde, dann gibt sie nach." : "Diese Gestalt ist nur über einen versteckten Weg zu erreichen."} ${id === "runa" ? "Die Kammer ist nur <b>nachts</b> offen." : ""}</p>`) : ""}
    ${sh ? `<h2 class="st">Laden: ${esc(sh.name)}</h2><div class="wgrid">${sh.items.map(it => `<a class="wc" href="#/instrument/${it.id}"><canvas data-in="${it.id}" data-px="120"></canvas><b>${esc(INSTR[it.id].name)}</b><small>${nfmt(it.price)} <i class="nt"></i></small><small>ab Level ${it.lvl}</small></a>`).join("")}</div>` : ""}
    ${n.buy ? `<p class="box tip">${esc(n.n)} <b>kauft deine Tonlinge</b> (Wert nach Seltenheit und Mutation).</p>` : ""}
    ${qs.length ? `<h2 class="st">Quests</h2>${tbl([{ t: "Quest", s: 1 }, { t: "Level", s: 1, n: 1 }, "Typ", "Aufgaben", "Belohnung"], qs.map(k => { const qq = QUESTS[k]; return `<tr><td>${qLink(k)}</td><td class="n" data-v="${qq.lvl}">${qq.lvl}</td><td>${qq.main ? '<span class="pill">Haupt</span>' : "Neben"}</td><td>${W.parts(qq).length}</td><td>${rewardHtml(qq)}</td></tr>`; }))}` : ""}
    ${st ? `<h2 class="st">Gespräche</h2><details class="fold"><summary>Was ${esc(n.n)} erzählt (Spoiler)</summary>${spoil(st.map(b => (b.p || []).map(l => `<p>${esc(l)}</p>`).join("")).join('<hr style="border:0;border-top:1.5px dashed rgba(29,39,66,.3)">'))}</details>` : ""}`;
  return { t: n.n, title: `${esc(n.n)} ${favBtn("npc/" + id, n.n, "npc", id)}`, c: [["npcs", "NPCs"]], h, recent: { u: "npc/" + id, t: n.n, kind: "npc", id }, after(root) { tableSort(root); } };
};

/* =====================  QUESTS  ===================== */
const rewardHtml = q => { const r = q.rew || {}, o = []; if (r.xp) o.push(nfmt(r.xp) + " EP"); if (r.gold) o.push(nfmt(r.gold) + ' <i class="nt"></i>'); if (r.instr && INSTR[r.instr]) o.push(inLink(r.instr)); return o.join(" · ") || "–"; };
const PKIND = { catch: "Fangen", give: "Abgeben", perf: "Perfekt", lvl: "Level", idx: "Index", pay: "Bezahlen", item: "Fundstück", streak: "Serie", relic: "Echosplitter", wall: "Wand", pages: "Seiten" };
function partStatus(id, i, p) { if (!PME.has || !PREF.me) return ""; const s = S.q[id]; if (!s) return ""; if (s.st === "done") return ' <span class="good">✓</span>'; try { const c = qCntS(QUESTS[id], s)[i]; return ` <span class="muted">(${Math.min(c || 0, p.n)}/${p.n})</span>`; } catch (e) { return ""; } }
function partTip(p, cx, id) {
  const k = W.partKind(p), f = p.f || {};
  let wxNote = ""; const wxl = (k === "catch" || k === "give") ? W.fWx(f) : undefined;
  if (wxl) { const pr = [false, true].map(n => wxl.reduce((a, id) => a + wxP(id, n), 0)); wxNote = `<div style="font-size:16px">${f.wx ? "Nur" : "Mutation entsteht nur"} bei: ${wxl.map(i => wxPill(i)).join(" ")}${k === "give" && f.wx ? " <span class='muted'>(beim Fang muss dieses Wetter geherrscht haben)</span>" : ""}<br><span class="muted">Es herrscht an ${fmtP(pr[0])} der Tage und ${fmtP(pr[1])} der Nächte. Das Wetter ist für alle gleich, Totems können es ändern. Die Chancen unten gelten, solange das Wetter aktiv ist.</span></div>`; }
  if (k === "catch" || k === "give") { const o = { instr: cx.instr, mast: cx.mast, ench: cx.ench, luck: cx.luck }, rows = W.solveZones(f, o).slice(0, 3); if (!rows.length) return wxNote + `<span class="muted">Keine passende Stelle gefunden.</span>`;
    let bw = ""; if (!wxl && rows[0].pp < .999) { let bestV = 0, bestId = null, bestZ = null, bestN = false; WX_IDS.forEach(id => { const r = W.solveZones(f, Object.assign({ wxOnly: [id] }, o))[0]; if (r && r.pp > bestV) { bestV = r.pp; bestId = id; bestZ = r.zone; bestN = r.night; } }); const base = (1 - cx.pp) * rows[0].pn + cx.pp * rows[0].pp, bm = bestId ? (() => { const r = W.solveZones(f, Object.assign({ wxOnly: [bestId] }, o))[0]; return (1 - cx.pp) * r.pn + cx.pp * r.pp; })() : 0; if (bestId && bm > base * 1.15) bw = `<div>Mit Wetter: ${wxPill(bestId)} in ${zoneLink(bestZ)} ${bestN ? "nachts" : "tagsüber"} <b>${fmtP(bm)}</b> pro Wurf (im Schnitt ${fmtP(base)}). <span class="muted">Das Wetter ist nicht planbar, Totems können es setzen.</span></div>`; }
    const pp = cx.pp; const need = p.n || 1; if (rows[0].pn > .999 && rows[0].pp > .999) return wxNote + `<span class="muted" style="font-size:16px">Jeder Wurf zählt, an jedem passenden Ort.</span>`;
    return wxNote + `<div style="font-size:16px">${bw}${rows.map((r, i) => { const m = (1 - pp) * r.pn + pp * r.pp; return `<div>${i === 0 ? "<b>Beste Stelle:</b>" : "Alternative:"} ${zoneLink(r.zone)} ${r.night && !r.alt ? "nachts" : f.night ? "nachts" : f.day ? "tagsüber" : r.night ? "nachts" : "tagsüber"} · <b>${fmtP(m)}</b> pro Wurf (${fmtP(r.pn)} / ${fmtP(r.pp)} perfekt) · ${need > 1 ? "für " + need + ": " : ""}${fmtC(m / need)} Würfe</div>`; }).join("")}</div>`; }
  if (k === "perf") return `<span class="muted" style="font-size:16px">${p.ev === "cast" ? "Triff beim Wurf die Marke genau (Ring auf der Linie)." : "Lass den Tonling im Fang nie aus der Zone."} Perfekte Würfe zählen erst, wenn die Quest angenommen ist.</span>`;
  if (k === "idx") { const l = SPECIES.filter(s => s.a === p.a && s.r <= (p.rmax == null ? 4 : p.rmax)), miss = PME.has && PREF.me ? l.filter(s => !(dexC(s.id) > 0)) : l; return `<div style="font-size:16px">${PME.has && PREF.me ? "Es fehlen dir noch" : "Du brauchst alle"} ${miss.length}: ${miss.map(s => spLink(s.id)).join(" ")}</div>`; }
  if (k === "item") { const it = ITEMS[p.id]; if (!it) return ""; const z = ZN[it.y] && ZN[it.y][it.x]; return `<span style="font-size:16px">${esc(it.n)} liegt in ${z ? zoneLink(z) : "der Welt"} bei Feld ${it.x} | ${it.y}.</span>`; }
  if (k === "streak") return `<span class="muted" style="font-size:16px">Jeder Fehler (Wurf oder Fang nicht perfekt, Abbruch, Entkommen) setzt die Serie auf null.</span>`;
  if (k === "pay") return `<span class="muted" style="font-size:16px">Du zahlst beim Abgeben ${nfmt(p.n)} Noten.</span>`;
  return "";
}
WP.quests = (args, q) => { const chips = (key, cur, items) => `<div class="fch">${items.map(([v, l]) => `<button class="btn" data-fk="${key}" data-fv="${v}" aria-pressed="${String(cur) === String(v)}">${l}</button>`).join("")}</div>`;
  const npcs = [...new Set(Object.values(QUESTS).map(x => x.npc))].filter(n => NPCS[n]);
  return { t: "Quests", h: `<p class="lead">Alle <b>${Object.keys(QUESTS).filter(k => !QUESTS[k].rel || QUESTS[k].rel <= RELEASE.areas).length}</b> Aufgaben mit Voraussetzungen, Belohnungen und Tipps, wo und womit du sie am besten erledigst.</p>
  <div class="filters"><input type="text" id="qsq" placeholder="Titel oder NPC …" value="${esc(q.get("q") || "")}">
   <label>Bereich ${chips("a", q.get("a") || "", [["", "Alle"]].concat([1, 2, 3, 4, 5].filter(a => a <= RELEASE.areas).map(a => [a, a])))}</label>
   <label>Typ ${chips("t", q.get("t") || "", [["", "Alle"], ["main", "Haupt"], ["side", "Neben"], ["instr", "Instrument"]])}</label>
   ${PME.has && PREF.me ? `<label>Status ${chips("s", q.get("s") || "", [["", "Alle"], ["active", "Aktiv"], ["done", "Erledigt"], ["open", "Offen"]])}</label>` : ""}
   <label>NPC <select id="qsn"><option value="">alle</option>${npcs.map(n => `<option value="${n}" ${q.get("n") === n ? "selected" : ""}>${esc(NPCS[n].n)}</option>`).join("")}</select></label>
   <label>Sortieren <select id="qss">${[["lvl", "Level"], ["name", "Name"], ["xp", "Erfahrung"], ["gold", "Noten"]].map(([v, l]) => `<option value="${v}" ${(q.get("s2") || "lvl") === v ? "selected" : ""}>${l}</option>`).join("")}</select></label><span class="cnt" id="qsc"></span></div><div id="qsr"></div>`,
    after(root) { const draw = () => { const Q = CUR.q; let l = Object.keys(QUESTS).filter(k => !QUESTS[k].rel || QUESTS[k].rel <= RELEASE.areas); const t = fold(Q.get("q") || "");
      if (t) l = l.filter(k => fold(QUESTS[k].title + " " + NPCS[QUESTS[k].npc].n).includes(t)); if (+Q.get("a")) l = l.filter(k => NPCS[QUESTS[k].npc].area === +Q.get("a")); if (Q.get("n")) l = l.filter(k => QUESTS[k].npc === Q.get("n"));
      if (Q.get("t") === "main") l = l.filter(k => QUESTS[k].main); else if (Q.get("t") === "side") l = l.filter(k => !QUESTS[k].main); else if (Q.get("t") === "instr") l = l.filter(k => QUESTS[k].rew && QUESTS[k].rew.instr);
      if (PME.has && PREF.me && Q.get("s")) l = l.filter(k => { const s = S.q[k]; return Q.get("s") === "active" ? s && s.st === "active" : Q.get("s") === "done" ? s && s.st === "done" : !s; });
      const so = Q.get("s2") || "lvl"; l.sort((a, b) => so === "name" ? QUESTS[a].title.localeCompare(QUESTS[b].title, "de") : so === "xp" ? (QUESTS[b].rew.xp || 0) - (QUESTS[a].rew.xp || 0) : so === "gold" ? (QUESTS[b].rew.gold || 0) - (QUESTS[a].rew.gold || 0) : QUESTS[a].lvl - QUESTS[b].lvl || Object.keys(QUESTS).indexOf(a) - Object.keys(QUESTS).indexOf(b));
      Q1("#qsc", root).textContent = l.length + " Quests"; const out = Q1("#qsr", root);
      out.innerHTML = tbl([{ t: "Quest", s: 1 }, { t: "NPC", s: 1 }, { t: "Level", s: 1, n: 1 }, "Typ", "Aufgaben", "Belohnung", ...(PME.has && PREF.me ? ["Status"] : [])], l.map(k => { const qq = QUESTS[k], s = PME.has && PREF.me ? S.q[k] : null; return `<tr class="${s && s.st === "done" ? "dim" : ""}"><td data-v="${esc(qq.title)}">${qLink(k)}</td><td data-v="${esc(NPCS[qq.npc].n)}">${npLink(qq.npc)}</td><td class="n" data-v="${qq.lvl}">${qq.lvl}</td><td>${qq.main ? '<span class="pill">Haupt</span>' : "Neben"}</td><td><small>${W.parts(qq).map(p => esc(p.txt || "")).join("<br>")}</small></td><td>${rewardHtml(qq)}</td>${PME.has && PREF.me ? `<td>${s ? (s.st === "done" ? '<span class="good">✓ erledigt</span>' : "aktiv") : ""}</td>` : ""}</tr>`; }));
      hydrate(out); tableSort(out); $$("[data-fk]", root).forEach(b => b.setAttribute("aria-pressed", String((Q.get(b.dataset.fk) || "") === b.dataset.fv))); };
      $$("[data-fk]", root).forEach(b => b.onclick = () => { setQ({ [b.dataset.fk]: b.dataset.fv }); draw(); }); Q1("#qsq", root).oninput = e => { setQ({ q: e.target.value }); draw(); }; Q1("#qsn", root).onchange = e => { setQ({ n: e.target.value }); draw(); }; Q1("#qss", root).onchange = e => { setQ({ s2: e.target.value === "lvl" ? "" : e.target.value }); draw(); }; draw(); } }; };
WP.quest = (args) => { const id = args[0], q = QUESTS[id]; if (!q) return WP.notfound(); const n = NPCS[q.npc], x = QX[id], chain = W.chain(id), next = W.questsAfter(id), s = PME.has && PREF.me ? S.q[id] : null;
  const parts = W.parts(q), cx = cxGet();
  const h = `<div class="infobox ib"><h3 style="background:${q.main ? "var(--danger)" : "var(--accent)"}">${q.main ? "Hauptquest" : "Nebenquest"}</h3><div class="ib-art" style="padding:6px"><a href="#/npc/${q.npc}" style="text-decoration:none"><canvas data-np="${q.npc}" data-px="240" style="height:210px"></canvas></a></div><dl>
    <div class="ib-r"><dt>Auftraggeber</dt><dd>${npLink(q.npc)}</dd></div><div class="ib-r"><dt>Bereich</dt><dd>${areaLink(n.area)}</dd></div><div class="ib-r"><dt>Level</dt><dd>${q.lvl}</dd></div>
    ${q.after ? `<div class="ib-r"><dt>Vorher</dt><dd>${qLink(q.after)}</dd></div>` : ""}${next.length ? `<div class="ib-r"><dt>Danach</dt><dd>${next.map(k => qLink(k)).join("<br>")}</dd></div>` : ""}
    <div class="ib-r"><dt>Belohnung</dt><dd>${rewardHtml(q)}</dd></div>${s ? `<div class="ib-r"><dt>Dein Stand</dt><dd>${s.st === "done" ? '<span class="good">✓ erledigt</span>' : "aktiv"}</dd></div>` : ""}</dl></div>
    <p class="lead">${x && x.offer ? esc(Array.isArray(x.offer) ? x.offer[0] : x.offer) : esc(q.desc || "")}</p>
    <h2 class="st">Aufgaben</h2><p>Rechenbasis für die Tipps: ${esc(INSTR[cx.instr].name)} (Glück ${fmtD(cx.stats.luck, cx.stats.luck % 1 ? 1 : 0)}), ${Math.round(cx.pp * 100)} % perfekte Würfe. <a class="wl" href="#" id="qCx">Einstellungen ändern</a></p><div id="qCxB" hidden>${cxBar()}</div>
    <div id="qParts">${parts.map((p, i) => `<div class="box" style="margin:6px 0"><b style="font-size:20px">${i + 1}. <span class="pill">${PKIND[W.partKind(p)] || "Aufgabe"}</span> ${esc(p.txt || "")}${p.n > 1 && W.partKind(p) !== "pay" ? ` <span class="muted">(${p.n}×)</span>` : ""}${partStatus(id, i, p)}</b>${partTip(p, cx, id)}</div>`).join("")}</div>
    ${chain.length ? `<h2 class="st">Questkette</h2><p>${chain.map(k => qLink(k)).join(" › ")} › <b>${esc(q.title)}</b>${next.length ? " › " + next.map(k => qLink(k)).join(", ") : ""}</p>` : next.length ? `<h2 class="st">Danach</h2><p>${next.map(k => qLink(k)).join(", ")}</p>` : ""}
    ${x ? `<h2 class="st">Gespräche</h2><details class="fold"><summary>Was ${esc(n.n)} sagt (Spoiler)</summary>${spoil(["offer", "remind", "done"].map(k => x[k] ? `<p><b>${{ offer: "Angebot", remind: "Erinnerung", done: "Abgabe" }[k]}:</b> ${esc([].concat(x[k]).join(" "))}</p>` : "").join(""))}</details>` : ""}`;
  return { t: q.title, title: `${esc(q.title)} ${favBtn("quest/" + id, q.title, "quest", id)}`, c: [["quests", "Quests"]], h, recent: { u: "quest/" + id, t: q.title, kind: "quest", id }, after(root) {
    Q1("#qCx", root).onclick = e => { e.preventDefault(); Q1("#qCxB", root).hidden = !Q1("#qCxB", root).hidden; }; cxBind(root, () => rerender(true)); } };
};

/* =====================  TITEL  ===================== */
WP.titel = (args, q) => { const sel = args[0];
  if (sel && TITLE[sel]) { const t = TITLE[sel], ok = PME.has && PREF.me ? t.ok() : null, pr = t.p && PME.has && PREF.me ? t.p() : null; const same = TITLES.filter(o => o.cat === t.cat && o !== t);
    return { t: t.name, title: `<span style="${titleCss(t)};font-size:60px">${esc(t.name)}</span>`, c: [["titel", "Titel"]], h: `<div class="box"><b>Vorschau über dem Kopf</b><canvas data-nt="${t.id}" data-nm="${esc(S.name || "Wanderer")}" data-lv="${PME.has ? S.lvl : 42}" data-w="480" data-h="120" data-fps="30" style="width:100%;max-width:480px;display:block;margin:auto"></canvas></div>
      <div class="kv"><div><b>${esc((TCATS.find(c => c[0] === t.cat) || [0, t.cat])[1])}</b><small>Kategorie</small></div><div><b>Stufe ${t.tier}</b><small>${t.tier >= 6 ? "leuchtet und glitzert stark" : t.tier >= 4 ? "glitzert" : t.tier >= 3 ? "leuchtet" : "schlicht"}</small></div>${ok != null ? `<div><b class="${ok ? "good" : "bad"}">${ok ? "✓ freigeschaltet" : "gesperrt"}</b><small>dein Stand</small></div>` : ""}</div>
      <h2 class="st">Bedingung</h2><p class="lead">${esc(t.d)}</p>${pr ? `<p>Fortschritt: <span class="pbar"><i style="width:${Math.round(100 * pr[0] / Math.max(1, pr[1]))}%"></i></span><b>${nfmt(pr[0])} von ${nfmt(pr[1])}</b></p>` : ""}
      <h2 class="st">Weitere Titel dieser Kategorie</h2><div class="wgrid l">${same.slice(0, 12).map(titleCard).join("")}</div>` }; }
  const cat = q.get("c") || "all", st = q.get("s") || "", t = fold(q.get("q") || "");
  return { t: "Titel", h: `<p class="lead">Es gibt <b>${TITLES.length}</b> Titel für Fänge, Level, Seltenheit, Mutationen, perfekte Würfe, Quests, Instrumente, Index und mehr. Den gewählten Titel sehen andere Spieler über deinem Kopf, ab Stufe 4 glitzert er.</p>
  <div class="filters"><input type="text" id="tiq" placeholder="Titel suchen …" value="${esc(q.get("q") || "")}"><div class="fch">${TCATS.map(c => `<button class="btn" data-fk="c" data-fv="${c[0] === "all" ? "" : c[0]}" aria-pressed="${(cat === "all" ? "" : cat) === (c[0] === "all" ? "" : c[0])}">${c[1]} <small>${TITLES.filter(x => c[0] === "all" || x.cat === c[0]).length}</small></button>`).join("")}</div>${PME.has && PREF.me ? `<div class="fch"><button class="btn" data-fk="s" data-fv="" aria-pressed="${!st}">Alle</button><button class="btn" data-fk="s" data-fv="y" aria-pressed="${st === "y"}">Freigeschaltet</button><button class="btn" data-fk="s" data-fv="n" aria-pressed="${st === "n"}">Gesperrt</button></div>` : ""}<span class="cnt" id="tic"></span></div><div id="tir"></div>`,
    after(root) { const draw = () => { const Q = CUR.q; let l = TITLES.slice(); const c = Q.get("c"); if (c) l = l.filter(x => x.cat === c); const tt = fold(Q.get("q") || ""); if (tt) l = l.filter(x => fold(x.name + " " + x.d).includes(tt)); if (PME.has && PREF.me && Q.get("s")) l = l.filter(x => (Q.get("s") === "y") === !!x.ok());
      Q1("#tic", root).textContent = l.length + " Titel"; const out = Q1("#tir", root); out.innerHTML = `<div class="wgrid l">${l.map(titleCard).join("")}</div>`; hydrate(out); $$("[data-fk]", root).forEach(b => b.setAttribute("aria-pressed", String((Q.get(b.dataset.fk) || "") === b.dataset.fv))); };
      $$("[data-fk]", root).forEach(b => b.onclick = () => { setQ({ [b.dataset.fk]: b.dataset.fv }); draw(); }); Q1("#tiq", root).oninput = e => { setQ({ q: e.target.value }); draw(); }; draw(); } };
};
function titleCard(t) { const ok = PME.has && PREF.me ? t.ok() : null, pr = t.p && ok === false ? t.p() : null;
  return `<a class="wc l ${ok ? "have" : ""}" href="#/titel/${t.id}" style="${ok === false ? "opacity:.75" : ""}"><span style="flex:1;min-width:0"><b style="${titleCss(t)}">${esc(t.name)}</b><small>${esc(t.d)}</small>${pr ? `<span class="pbar" style="width:100%;margin:3px 0 0"><i style="width:${Math.round(100 * pr[0] / Math.max(1, pr[1]))}%"></i></span><small>${nfmt(pr[0])} / ${nfmt(pr[1])}</small>` : ""}</span></a>`; }

/* =====================  FUNDSTÜCKE UND GEHEIMNISSE  ===================== */
WP.items = () => { const secrets = Object.keys(NPCS).filter(id => NPCS[id].secret);
  return { t: "Fundstücke und Geheimnisse", h: `<p class="lead">Manche Quests schicken dich auf die Suche nach Fundstücken, und in der Welt gibt es versteckte Räume mit eigenen NPCs.</p>
  <h2 class="st">Fundstücke</h2><p>Fundstücke sind nur sichtbar, solange eine aktive Quest sie braucht.</p>${tbl([{ t: "Fundstück", s: 1 }, { t: "Ort", s: 1 }, "Feld", "Quest"], Object.keys(ITEMS).map(id => { const it = ITEMS[id], z = ZN[it.y] && ZN[it.y][it.x], qs = Object.keys(QUESTS).filter(k => W.parts(QUESTS[k]).some(p => p.k === "item" && p.id === id)); return `<tr><td><b>${esc(it.n)}</b>${it.wx ? ` <span class="pill">nur bei ${esc(WX[it.wx].name)}</span>` : ""}</td><td>${z ? zoneLink(z) : "–"}</td><td>${it.x} | ${it.y}</td><td>${qs.map(k => qLink(k)).join(", ")}</td></tr>`; }))}
  <h2 class="st">Versteckte Gestalten</h2><p>Diese NPCs sitzen hinter <b>falschen Wänden</b>. Lauf gegen die auffällige Wand und halte etwa eine Sekunde, dann gibt sie nach.</p><div class="wgrid">${secrets.map(id => { const f = FWALLS[id]; return `<a class="wc" href="#/npc/${id}"><canvas data-np="${id}" data-px="120"></canvas><b>${esc(NPCS[id].n)}</b><small>${areaName(NPCS[id].area)}</small><small>${f ? "Wand bei " + f[0] + " | " + f[1] : "verborgener Weg"}</small></a>`; }).join("")}</div>
  <h2 class="st">Tore</h2>${tbl(["Tor", "Öffnet", "Bedingung"], [["Tor der Höhlen", "Glimmerhöhlen", AREA_GATE[2]], ["Sterntor", "Sternenhöhe", AREA_GATE[3]], ["Muscheltor", "Rauschmeer", AREA_GATE[4]], ["Spiegeltor", "Sanktum Magus", AREA_GATE[5]]].map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${esc(r[2])}</td></tr>`))}
  <h2 class="st">Besonderes</h2><ul><li><b>Thores Stiefel:</b> +40 % Lauftempo, sobald du in die Hand nimmst (Quest von ${npLink("thore")}).</li><li><b>Echoaltar:</b> versteckte Kammer, nur nachts offen (siehe <a class="wl" href="#/verzauberungen">Verzauberungen</a>).</li></ul>` }; };
