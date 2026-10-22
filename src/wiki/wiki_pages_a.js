
/* ===== Seiten Teil A: Start, Tonlinge, Instrumente, Mutationen, Verzauberungen ===== */
const Q1 = (sel, root) => (root || document).querySelector(sel);
const TIMES = { b: "Tag und Nacht", d: "nur tagsüber", n: "nur nachts" };
const tbl = (heads, rows, cls = "") => `<div class="tw"><table class="wt ${cls}"><thead><tr>${heads.map(h => typeof h === "string" ? `<th>${h}</th>` : `<th class="${h.s ? "s " : ""}${h.n ? "n" : ""}">${h.t}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
const stars = n => "★".repeat(n) + `<span class="muted">${"★".repeat(10 - n)}</span>`;

/* ----- Rechen-Einstellungen: Instrument, Meisterschaft, Verzauberung, Anteil perfekter Würfe ----- */
function cxDefault() { if (meOn() && S.eq && INSTR[S.eq]) return { instr: S.eq, mast: typeof mastLvl === "function" ? mastLvl(S.eq) : 0, ench: (S.ench || {})[S.eq] || "", pp: PREF.pp }; return { instr: "holz", mast: 0, ench: "", pp: PREF.pp }; }
function cxGet() { const c = PREF.cx || cxDefault(); if (!INSTR[c.instr]) c.instr = "holz"; const o = { instr: c.instr, mast: c.mast | 0, ench: c.ench || "", pp: c.pp == null ? .5 : c.pp }; o.stats = W.stats(o.instr, o); o.luck = o.stats.luck / 100; return o; }
function cxBar(id = "cx") {
  const c = cxGet();
  return `<div class="filters" id="${id}"><label>Rechnen mit <select data-cx="instr">${Object.keys(INSTR).map(i => `<option value="${i}" ${i === c.instr ? "selected" : ""}>${esc(INSTR[i].name)}</option>`).join("")}</select></label>
    <label>Meisterschaft <select data-cx="mast">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(m => `<option value="${m}" ${m === c.mast ? "selected" : ""}>${m}</option>`).join("")}</select></label>
    <label>Verzauberung <select data-cx="ench"><option value="">keine</option>${Object.keys(ENCH).map(e => `<option value="${e}" ${e === c.ench ? "selected" : ""}>${esc(ENCH[e].n)}</option>`).join("")}</select></label>
    <label>Perfekte Würfe <input type="range" min="0" max="100" step="5" value="${Math.round(c.pp * 100)}" data-cx="pp" style="width:110px"> <b data-ppv>${Math.round(c.pp * 100)} %</b></label>
    <span class="cnt">Glück <b>${fmtD(c.stats.luck, c.stats.luck % 1 ? 1 : 0)}</b>${meOn() ? ` · <a class="wl" href="#" data-cxme>mein Instrument</a>` : ""}</span></div>`;
}
function cxBind(root, fn) {
  $$("[data-cx]", root).forEach(i => i.addEventListener(i.type === "range" ? "input" : "change", () => { const c = Object.assign({}, cxGet()); delete c.stats; delete c.luck; c[i.dataset.cx] = i.dataset.cx === "pp" ? (+i.value) / 100 : (i.dataset.cx === "mast" ? +i.value : i.value); PREF.cx = c; if (i.dataset.cx === "pp") PREF.pp = c.pp; savePref();
    if (i.dataset.cx === "pp") { const v = Q1("[data-ppv]", root); if (v) v.textContent = Math.round(c.pp * 100) + " %"; fn(); } else fn(true); }));
  const me = Q1("[data-cxme]", root); if (me) me.onclick = e => { e.preventDefault(); PREF.cx = cxDefault(); delete PREF.cx.stats; savePref(); fn(true); };
}

/* =====================  START  ===================== */
WP.start = () => {
  const day = Math.floor(W.worldT() / DAY_LEN), tod = SPECIES[(day * 7 + 3) % SPECIES.length], cl = W.clock();
  const per = SPECIES.length, got = meOn() ? SPECIES.filter(s => dexC(s.id) > 0).length : 0;
  const cats = [["tonlinge", "Tonlinge", `<canvas data-sp="goldkrone" data-px="120"></canvas>`, SPECIES.length + " Arten"], ["instrumente", "Instrumente", `<canvas data-in="geige" data-px="120"></canvas>`, Object.keys(INSTR).length + " Stück"], ["mutationen", "Mutationen", `<canvas data-sp="mondling" data-mut="funkel" data-px="120"></canvas>`, MUTS.length + " Arten"], ["ort", "Orte & Karte", `<canvas data-sp="schnuppi" data-px="120"></canvas>`, "5 Bereiche"], ["npcs", "NPCs", `<canvas data-np="tilda" data-px="120"></canvas>`, Object.keys(NPCS).length + " Gestalten"], ["quests", "Quests", `<canvas data-np="nox" data-px="120"></canvas>`, Object.keys(QUESTS).length + " Aufgaben"], ["titel", "Titel", `<canvas data-sp="karminstern" data-px="120"></canvas>`, TITLES.length + " Titel"], ["rechner/chance", "Rechner", `<canvas data-in="kalimba" data-px="120"></canvas>`, "Chance, Wert, Level"]];
  const news = WIKI_LOG.slice(0, 6).map(l => `<li><span class="muted">${esc(l[0])}</span> ${esc(l[1])}</li>`).join("");
  return { t: "Hauptseite", title: `Willkommen im Tonlinge-Wiki`, h: `
  <p class="lead">Hier findest du alles zu <b>Tonlinge</b>: jede Art mit Fundorten und echten Chancen, jedes Instrument, jede Mutation, alle Orte, NPCs, Quests und Titel. Alle Grafiken und Zahlen kommen direkt aus dem Spiel.</p>
  <div class="cols" style="margin:10px 0">
    <div class="box info"><b>Jetzt in der Spielwelt</b><div style="display:flex;gap:12px;align-items:center"><div class="big">${cl.text}</div><div>${cl.night ? "Es ist <b>Nacht</b>." : "Es ist <b>Tag</b>."}<br><span class="muted">${cl.night ? "Tag" : "Nacht"} beginnt in ${W.mmss(cl.toChange)}</span></div></div>
      <p class="muted" style="font-size:16px;margin-bottom:0">Die Zeit ist für alle Spieler gleich. Ein ganzer Tag dauert 10 Minuten, die Nacht 4 Minuten 10 Sekunden.</p></div>
    <div class="box"><b>Tonling des Tages</b><a class="wc l" href="#/tonling/${tod.id}" style="box-shadow:none"><canvas data-sp="${tod.id}" data-px="140"></canvas><span><b>${esc(tod.n)}</b><small>${rarPill(tod.r)}<br>${esc(areaName(tod.a))}</small></span></a></div>
    ${PME.has ? `<div class="box tip"><b>Dein Spielstand</b><p style="margin:0">Level <b>${S.lvl}</b> · ${nfmt(S.gold)} <i class="nt"></i> · Index ${got} von ${per}</p><div style="margin:4px 0"><span class="pbar" style="width:100%"><i style="width:${Math.round(100 * got / per)}%"></i></span></div><a class="wl" href="#/stand">Mein Stand öffnen</a> · <a class="wl" href="#/planer">Was jetzt?</a></div>` : `<div class="box"><b>Dein Spielstand</b><p style="margin:0">Verbinde deinen Spielstand, dann zeigt das Wiki, was du schon gefangen hast, und rechnet mit deinem Instrument.</p><p style="margin:4px 0 0"><a class="btn" href="#/stand" style="display:inline-flex;align-items:center;text-decoration:none">Spielstand verbinden</a></p></div>`}
  </div>
  <h2 class="st">Entdecken</h2>
  <div class="wgrid" style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr))">${cats.map(c => `<a class="wc" href="#/${c[0]}">${c[2]}<b>${c[1]}</b><small>${c[3]}</small></a>`).join("")}</div>
  <h2 class="st">Seltenheiten</h2>
  <p>Je höher die Seltenheit, desto seltener taucht ein Tonling auf, desto mehr ist er wert und desto schwerer ist er zu fangen.</p>
  <div class="tw"><table class="wt"><thead><tr><th>Seltenheit</th><th class="n">Tonlinge</th><th class="n">Gewicht</th><th class="n">Grundwert</th><th class="n">Erfahrung</th><th>Beispiele</th></tr></thead><tbody>${RAR.map((r, i) => { const l = SPECIES.filter(s => s.r === i); return `<tr><td>${rarPill(i)}</td><td class="n">${l.length}</td><td class="n">${r.w}</td><td class="n">${nfmt(r.val)} <i class="nt"></i></td><td class="n">${nfmt(r.xp)}</td><td>${l.slice(0, 4).map(s => spLink(s.id)).join(" ")}</td></tr>`; }).join("")}</tbody></table></div>
  <div class="cols"><div><h2 class="st">Die fünf Bereiche</h2>${[1, 2, 3, 4, 5].map(a => { const ex = SPECIES.filter(s => s.a === a && s.r === 3)[0] || SPECIES.find(s => s.a === a); return `<a class="wc l" href="#/ort/bereich${a}" style="margin:6px 0;box-shadow:none"><canvas data-sp="${ex.id}" data-px="90"></canvas><span><b>${esc(areaName(a))}</b><small>${SPECIES.filter(s => s.a === a).length} Tonlinge · Wertfaktor ×${(AREAS[a] || { valMul: 1 }).valMul}</small></span></a>`; }).join("")}</div>
  <div><h2 class="st">Neuigkeiten</h2><ul style="padding-left:18px;margin:4px 0">${news}</ul><p><a class="wl" href="#/neu">Alle Neuigkeiten</a></p>
  <h2 class="st">Beliebte Werkzeuge</h2><ul style="padding-left:18px;margin:4px 0"><li><a class="wl" href="#/rechner/chance">Chancen-Rechner</a>: wo und womit fange ich was?</li><li><a class="wl" href="#/planer">Quest-Planer</a>: der beste Plan für deine aktiven Quests</li><li><a class="wl" href="#/vergleich">Instrument-Vergleich</a></li><li><a class="wl" href="#/rechner/wert">Wert-Rechner</a> für Verkäufe</li></ul></div></div>` };
};

/* =====================  TONLINGE: Liste  ===================== */
function tlFilter(q) {
  const f = { q: fold(q.get("q") || ""), a: +q.get("a") || 0, r: q.get("r") === null || q.get("r") === "" ? -1 : +q.get("r"), z: q.get("z") || "", t: q.get("t") || "", have: q.get("h") || "", sort: q.get("s") || "idx", view: q.get("v") || "grid" };
  let l = SPECIES.map((s, i) => ({ s, i }));
  if (f.q) l = l.filter(x => fold(x.s.n + " " + x.s.z.map(z => ZINFO[z].n).join(" ") + " " + rarName(x.s.r)).includes(f.q));
  if (f.a) l = l.filter(x => x.s.a === f.a); if (f.r >= 0) l = l.filter(x => x.s.r === f.r); if (f.z) l = l.filter(x => x.s.z.includes(f.z)); if (f.t) l = l.filter(x => x.s.t === f.t);
  if (f.have === "y") l = l.filter(x => dexC(x.s.id) > 0); else if (f.have === "n") l = l.filter(x => !(dexC(x.s.id) > 0));
  const srt = { idx: (a, b) => a.i - b.i, name: (a, b) => a.s.n.localeCompare(b.s.n, "de"), rar: (a, b) => b.s.r - a.s.r || a.i - b.i, val: (a, b) => W.base(b.s) - W.base(a.s), hz: (a, b) => a.s.hz[0] - b.s.hz[0], spd: (a, b) => b.s.spd - a.s.spd, diff: (a, b) => W.diff(b.s).stars - W.diff(a.s).stars || a.i - b.i, xp: (a, b) => W.xp(b.s) - W.xp(a.s) };
  l.sort(srt[f.sort] || srt.idx); return { f, l };
}
function tlCard(x) { const s = x.s, c = PME.has && PREF.me ? (dexC(s.id) > 0 ? "have" : "miss") : "";
  return `<a class="wc ${c}" href="#/tonling/${s.id}"><canvas data-sp="${s.id}" data-px="156"></canvas><b>${esc(s.n)}</b><small><span class="rar" style="background:${RAR[s.r].col}"></span>${rarName(s.r)}</small><small>${esc(areaName(s.a))}</small></a>`; }
const fmtPc = f => { const p = Math.round((f - 1) * 100); return (p > 0 ? "+" : p < 0 ? "−" : "±") + Math.abs(p) + " %"; };
function tlTable(l) {
  return tbl([{ t: "" }, { t: "Name", s: 1 }, { t: "Seltenheit", s: 1 }, { t: "Bereich", s: 1 }, "Orte", { t: "Zeit", s: 1 }, { t: "Frequenz", s: 1, n: 1 }, { t: "Tempo", s: 1, n: 1 }, { t: "Fortschritt", s: 1, n: 1 }, { t: "Wert", s: 1, n: 1 }, { t: "EP", s: 1, n: 1 }, { t: "Fangen", s: 1, n: 1 }],
    l.map(x => { const s = x.s, d = W.diff(s), vr = W.valueRange(s); return `<tr class="${PME.has && PREF.me && !(dexC(s.id) > 0) ? "dim" : ""}"><td><canvas data-sp="${s.id}" data-px="88"></canvas></td><td class="nm" data-v="${esc(s.n)}"><a class="wl" href="#/tonling/${s.id}">${esc(s.n)}</a></td><td data-v="${s.r}">${rarPill(s.r)}</td><td data-v="${s.a}">${esc(areaName(s.a))}</td><td>${W.zonesOf(s).map(zoneLink).join(", ")}</td><td data-v="${s.t}">${TIMES[s.t]}</td><td class="n" data-v="${s.hz[0]}">${s.hz[0]}–${s.hz[1]} Hz</td><td class="n" data-v="${s.spd}">${fmtD(s.spd, 2)}</td><td class="n" data-v="${s.fill}">${fmtPc(s.fill)}</td><td class="n" data-v="${vr[2]}">${nfmt(vr[0])}–${nfmt(vr[1])}</td><td class="n" data-v="${W.xp(s)}">${nfmt(W.xp(s))}</td><td class="n" data-v="${d.stars}" title="Schwierigkeit">${d.stars}/10</td></tr>`; }));
}
WP.tonlinge = (args, q) => {
  const f0 = tlFilter(q).f, zones = [...new Set(SPECIES.flatMap(s => s.z))].filter(z => !f0.a || ZINFO[z].a === f0.a);
  const chips = (key, cur, items) => `<div class="fch">${items.map(([v, l]) => `<button class="btn" data-fk="${key}" data-fv="${v}" aria-pressed="${String(cur) === String(v)}">${l}</button>`).join("")}</div>`;
  const h = `<p class="lead">Alle <b>${SPECIES.length}</b> Tonling-Arten. Filtere nach Bereich, Seltenheit, Ort und Tageszeit, sortiere die Tabelle oder öffne eine Art für Fundorte, Chancen und Wert.</p>
  <div class="filters" id="tlf"><input type="text" id="tlq" placeholder="Name oder Ort …" value="${esc(q.get("q") || "")}" style="min-width:180px">
    <label>Bereich ${chips("a", f0.a || "", [["", "Alle"]].concat([1, 2, 3, 4, 5].map(a => [a, a])))}</label>
    <label>Seltenheit ${chips("r", f0.r < 0 ? "" : f0.r, [["", "Alle"]].concat(RAR.map((r, i) => [i, `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;border:1.5px solid var(--ink);background:${r.col}"></span> ${r.name}`])))}</label>
    <label>Zeit ${chips("t", f0.t, [["", "Alle"], ["b", "Immer"], ["d", "Tags"], ["n", "Nachts"]])}</label>
    <label>Ort <select id="tlz"><option value="">alle</option>${zones.map(z => `<option value="${z}" ${f0.z === z ? "selected" : ""}>${esc(ZINFO[z].n)}</option>`).join("")}</select></label>
    ${PME.has && PREF.me ? `<label>Index ${chips("h", f0.have, [["", "Alle"], ["y", "Gefangen"], ["n", "Fehlen"]])}</label>` : ""}
    <label>Sortieren <select id="tls">${[["idx", "Reihenfolge"], ["name", "Name"], ["rar", "Seltenheit"], ["val", "Wert"], ["xp", "Erfahrung"], ["hz", "Frequenz"], ["spd", "Tempo"], ["diff", "Schwierigkeit"]].map(([v, l]) => `<option value="${v}" ${f0.sort === v ? "selected" : ""}>${l}</option>`).join("")}</select></label>
    <div class="fch"><button class="btn" data-fk="v" data-fv="grid" aria-pressed="${f0.view !== "table"}">Kacheln</button><button class="btn" data-fk="v" data-fv="table" aria-pressed="${f0.view === "table"}">Tabelle</button></div><span class="cnt" id="tlc"></span></div>
  <div id="tlr"></div>`;
  return { t: "Tonlinge", c: [], h, after(root) {
    const draw = () => { const qq = CUR.q, { f, l } = tlFilter(qq); Q1("#tlc", root).textContent = l.length + " von " + SPECIES.length; const out = Q1("#tlr", root);
      out.innerHTML = !l.length ? box("info", "Nichts gefunden", "<p>Dazu passt kein Tonling. Lockere die Filter.</p>") : f.view === "table" ? tlTable(l) : `<div class="wgrid">${l.map(tlCard).join("")}</div>`; hydrate(out); tableSort(out);
      $$("[data-fk]", root).forEach(b => b.setAttribute("aria-pressed", String((qq.get(b.dataset.fk) || (b.dataset.fk === "v" ? "grid" : "")) === b.dataset.fv))); };
    $$("[data-fk]", root).forEach(b => b.onclick = () => { setQ({ [b.dataset.fk]: b.dataset.fv }); draw(); });
    Q1("#tlq", root).oninput = e => { setQ({ q: e.target.value }); draw(); }; Q1("#tlz", root).onchange = e => { setQ({ z: e.target.value }); draw(); }; Q1("#tls", root).onchange = e => { setQ({ s: e.target.value === "idx" ? "" : e.target.value }); draw(); };
    draw(); } };
};

/* =====================  TONLING: Detailseite  ===================== */
const TIME_ICON = { b: "☀ ☾", d: "☀", n: "☾" };
function tlLead(s) {
  if (s.tot) return s.tot === "sun" ? `<p class="lead">Das <b>${esc(s.n)}</b> ist ein Totem-Tonling. Wer es benutzt, lässt die Sonne weiterziehen: aus Tag wird Nacht, aus Nacht wird Tag, für <b>alle Spieler</b>. Ein neuer Abschnitt beginnt, und neues Wetter kann würfeln. Es kann nicht benutzt werden, solange ein <a class="wl" href="#/wetter">seltenes Wetter</a> herrscht.</p>` : `<p class="lead">Das <b>${esc(s.n)}</b> ist ein Totem-Tonling. Es lässt sich überall fangen, ist aber <b>extrem selten</b>. Wer es danach in die Hand nimmt und benutzt, setzt das Wetter <a class="wl" href="#/wetter/${s.tot}">${esc(WX[s.tot].name)}</a> für <b>alle Spieler</b>, bis der Abschnitt (Tag oder Nacht) vorbei ist. ${wxRare(s.tot) ? "Seltene Wetter wie dieses sind besonders schwer zu bekommen. " : ""}Gegen ein bereits herrschendes seltenes Wetter wirkt kein Totem.</p>`;
  const zs = W.zonesOf(s).map(zoneLink).join(", ");
  const intro = { 0: "ein häufiger Tonling", 1: "ein recht verbreiteter Tonling", 2: "ein seltener Tonling", 3: "ein prächtiger Tonling", 4: "ein fabelhafter Tonling, den nur wenige je gehört haben", 5: "ein glorreicher Tonling, ein Wesen aus Legenden", 6: "ein erhabener Tonling, älter als das Urlied selbst" }[s.r];
  const t = { b: "Er ist zu jeder Tageszeit zu hören.", d: "Er singt nur tagsüber.", n: "Er zeigt sich nur nachts." }[s.t];
  const special = s.x === "glow" ? " Sein Körper leuchtet sanft." : s.x === "chimes" ? " Er trägt kleine Klangröhrchen, die im Wind spielen." : "";
  return `<p class="lead">Der <b>${esc(s.n)}</b> ist ${intro} aus ${areaLink(s.a)}. Man findet ihn ${W.zonesOf(s).length > 1 ? "in den Zonen" : "in der Zone"} ${zs}. ${t}${special}</p>`;
}
function tlZoneTable(s, cx) {
  const L = cx.luck, pp = cx.pp, rows = [], times = s.t === "b" ? [false, true] : s.t === "d" ? [false] : [true];
  W.zonesOf(s).forEach(z => times.forEach(night => { const n = W.final(z, night, L, false)[s.id] || 0, p = W.final(z, night, L, true)[s.id] || 0, m = (1 - pp) * n + pp * p; rows.push({ z, night, n, p, m }); }));
  const best = rows.slice().sort((a, b) => b.m - a.m)[0];
  return { rows, best, html: tbl([{ t: "Ort", s: 1 }, { t: "Zeit", s: 1 }, { t: "Normaler Wurf", s: 1, n: 1 }, { t: "Perfekter Wurf", s: 1, n: 1 }, { t: "Dein Mix", s: 1, n: 1 }, { t: "Würfe pro Fang", s: 1, n: 1 }],
    rows.map(r => `<tr class="${best && r.z === best.z && r.night === best.night ? "me" : ""}"><td>${zoneLink(r.z)}</td><td>${r.night ? "☾ Nacht" : "☀ Tag"}</td><td class="n" data-v="${r.n}">${fmtP(r.n)}</td><td class="n" data-v="${r.p}">${fmtP(r.p)}</td><td class="n" data-v="${r.m}"><b>${fmtP(r.m)}</b></td><td class="n" data-v="${r.m > 0 ? 1 / r.m : 1e9}">${fmtC(r.m)}</td></tr>`)) };
}
WP.tonling = (args) => {
  const s = SP[args[0]]; if (!s) return WP.notfound();
  const idx = SPECIES.indexOf(s), prev = SPECIES[(idx + SPECIES.length - 1) % SPECIES.length], next = SPECIES[(idx + 1) % SPECIES.length], r = RAR[s.r], d = W.diff(s);
  const vr = W.valueRange(s), qs = W.questsFor(s), same = SPECIES.filter(o => o !== s && (o.z.some(z => s.z.includes(z)) || (o.r === s.r && o.a === s.a))).slice(0, 12);
  const mine = meOn() ? S.inv.filter(t => t.sp === s.id) : [], cnt = meOn() ? dexC(s.id) : 0;
  const muts = MUTS.filter(m => m.p > 0 || m.ins || m.id === "moos" || m.id === "runen");
  const hdrBg = s.r === 6 ? "linear-gradient(90deg,#2fe0d0,#ff6ec7)" : r.col;
  const ib = `<div class="infobox ib"><h3 style="background:${hdrBg}">${esc(s.n)}</h3>
    <div class="ib-art"><canvas id="tlArt" data-sp="${s.id}" data-w="360" data-h="330" data-big="1" data-fps="30"></canvas><span class="cap" id="tlCap">Normal</span></div>
    <div class="ib-tabs" id="tlMt"><button class="btn" data-m="" aria-pressed="true">Normal</button>${muts.map(m => `<button class="btn" data-m="${m.id}" aria-pressed="false" style="color:${m.dk || "var(--ink)"}">${m.name}</button>`).join("")}</div>
    <dl>
      <div class="ib-r"><dt>Seltenheit</dt><dd>${rarPill(s.r)}</dd></div>
      <div class="ib-r"><dt>Bereich</dt><dd>${areaLink(s.a)}</dd></div>
      <div class="ib-r"><dt>Orte</dt><dd>${W.zonesOf(s).map(zoneLink).join(", ")}</dd></div>
      <div class="ib-r"><dt>Tageszeit</dt><dd>${TIME_ICON[s.t]} ${TIMES[s.t]}</dd></div>
      ${wxLikes(s)}
      <div class="ib-r"><dt>Frequenz</dt><dd>${s.hz[0]} bis ${s.hz[1]} Hz</dd></div>
      <div class="ib-r"><dt>Tempo</dt><dd>${fmtD(s.spd, 2)}</dd></div>
      <div class="ib-r"><dt>Fortschritt</dt><dd><b class="${s.fill >= 1 ? "good" : "bad"}">${fmtPc(s.fill)}</b><br><small class="muted">wie im Spiel beim Stimmen · füllt ${fmtD(d.gain * 100, 1)} % pro Sekunde</small></dd></div>
      <div class="ib-r"><dt>Fangen</dt><dd><span data-tip="Schwierigkeit von 1 (leicht) bis 10 (sehr schwer), aus Tempo und Fortschrittsrate berechnet">${stars(d.stars)}</span></dd></div>
      <div class="ib-r"><dt>Wert</dt><dd>${nfmt(vr[0])} bis ${nfmt(vr[1])} <i class="nt"></i><br><small class="muted">im Mittel ${nfmt(vr[2])}</small></dd></div>
      <div class="ib-r"><dt>Erfahrung</dt><dd>${nfmt(W.xp(s))} EP pro Fang</dd></div>
      <div class="ib-r"><dt>Index-Nr.</dt><dd>${SPECIES.filter(o => o.a === s.a).indexOf(s) + 1} von ${SPECIES.filter(o => o.a === s.a).length} (${esc(areaName(s.a))})</dd></div>
      ${PME.has && PREF.me ? `<div class="ib-r"><dt>Dein Fang</dt><dd>${cnt > 0 ? `<span class="good">✓ ${cnt}× gefangen</span>${mine.length ? `<br><small class="muted">${mine.length} im Inventar</small>` : ""}` : `<span class="bad">noch nicht gefangen</span>`}</dd></div>` : ""}
    </dl></div>`;
  const toc = `<div class="toc"><b>Inhalt</b><a href="#" data-sc="sec-fund">Fundorte und Chancen</a><a href="#" data-sc="sec-wert">Wert und Erfahrung</a><a href="#" data-sc="sec-fang">Fangen</a>${qs.length ? `<a href="#" data-sc="sec-quests">Quests</a>` : ""}<a href="#" data-sc="sec-aehnlich">Ähnliche Tonlinge</a></div>`;
  const diffRows = `<div class="cols"><div>${[["Tempo (Bewegung)", d.tempo, 3.5], ["Fortschritt in der Zone", d.gain * 100, 24], ["Verlust außerhalb", d.loss * 100, 15]].map(x => sbar(x[0], x[1], x[2])).join("")}</div>
    <div><p style="margin:2px 0">Ohne Instrument-Bonus füllt sich der Balken in der Zone um <b>${fmtD(d.gain * 100, 1)} %</b> pro Sekunde und fällt außerhalb um <b>${fmtD(d.loss * 100, 1)} %</b> pro Sekunde. Von 20 % bis voll brauchst du etwa <b>${fmtD(d.tFill, 1)} Sekunden</b> in der Zone.</p></div></div>`;
  const specialNote = s.r === 6 ? box("warn", "Erhabener Tonling", "<p>Alle 7 bis 9 Sekunden legt sich ein <b>Bannkreis</b> über den Bildschirm. Dann musst du die Zone sofort dorthin ziehen, wohin der Kreis zeigt, sonst bricht dein Fortschritt ein. Die Instrumente des Sanktums helfen dabei (Schutz).</p>") : s.r === 5 ? box("warn", "Glorreicher Tonling", "<p>Glorreiche <b>bäumen sich auf</b>: Das Ziel springt, die Zone wird für einen Moment schmal und der Bildschirm warnt dich rot. Bleib ruhig, folge dem Ziel und ziehe die Zone erst nach der Warnung nach.</p>") : "";
  const h = `${ib}${tlLead(s)}${toc}
  <div class="clear"></div>
  <h2 class="st" id="sec-fund">Fundorte und Chancen</h2>
  <p>So wahrscheinlich ist es, dass der ${esc(s.n)} bei einem Wurf <i>erscheint</i>. Danach musst du ihn noch stimmen und fangen. Ein perfekter Wurf würfelt ein zweites Mal mit +15 % Glück und nimmt die seltenere Art.</p>
  ${s.tot ? totemChance(s) : cxBar() + '<div id="tlZ"></div>'}
  <h2 class="st" id="sec-wert">Wert und Erfahrung</h2>
  <p>Der Verkaufswert hängt von der Frequenz ab, die du beim Stimmen triffst: im unteren Bereich der Frequenz etwa 60 % des Mittelwerts, im oberen etwa 140 %. Mutationen vervielfachen den Wert.</p>
  ${tbl([{ t: "Mutation", s: 1 }, { t: "Faktor", s: 1, n: 1 }, { t: "Wert (Spanne)", s: 1, n: 1 }, { t: "Mittelwert", s: 1, n: 1 }, { t: "Erfahrung", s: 1, n: 1 }],
    [`<tr><td>Normal</td><td class="n" data-v="1">×1</td><td class="n" data-v="${vr[0]}">${nfmt(vr[0])} – ${nfmt(vr[1])}</td><td class="n" data-v="${vr[2]}">${nfmt(vr[2])}</td><td class="n" data-v="${W.xp(s)}">${nfmt(W.xp(s))}</td></tr>`].concat(muts.map(m => { const v = W.valueRange(s, m.id); return `<tr><td>${mutLink(m.id)}</td><td class="n" data-v="${m.mul}">×${m.mul}</td><td class="n" data-v="${v[0]}">${nfmt(v[0])} – ${nfmt(v[1])}</td><td class="n" data-v="${v[2]}">${nfmt(v[2])}</td><td class="n" data-v="${W.xp(s, m.id)}">${nfmt(W.xp(s, m.id))}</td></tr>`; })))}
  <h2 class="st" id="sec-fang">Fangen</h2>
  ${diffRows}${specialNote}
  <p><b>Stimmen:</b> Die Frequenz liegt bei ${s.hz[0]} bis ${s.hz[1]} Hz. Beim Stimmen ziehst du den Regler dreimal auf eine Zielmarke, jeweils für 0,7 Sekunden (mit der Panflöte oder der Weltenorgel nur 0,35 Sekunden).</p>
  ${qs.length ? `<h2 class="st" id="sec-quests">Quests</h2><p>Diese Aufgaben brauchen den ${esc(s.n)} (oder jeden Tonling mit passenden Eigenschaften):</p>${tbl([{ t: "Quest", s: 1 }, { t: "NPC", s: 1 }, { t: "Level", s: 1, n: 1 }, "Aufgabe"], qs.map(x => { const q = QUESTS[x.id], p = W.parts(q).filter(p => { const k = W.partKind(p); return (k === "catch" || k === "give") && ((p.f && p.f.sp === s.id) || (!(p.f && p.f.sp) && W.specMatch(p.f, s))); })[0]; return `<tr><td>${qLink(x.id)}</td><td>${npLink(q.npc)}</td><td class="n" data-v="${q.lvl}">${q.lvl}</td><td>${x.direct ? '<span class="pill">direkt</span> ' : ""}${esc(p ? p.txt : "")}</td></tr>`; }))}` : ""}
  <h2 class="st" id="sec-aehnlich">Ähnliche Tonlinge</h2>
  <div class="wgrid">${same.map(o => tlCard({ s: o })).join("")}</div>
  <p style="display:flex;justify-content:space-between;margin-top:14px"><a class="wl sp" href="#/tonling/${prev.id}">‹ ${esc(prev.n)}</a><a class="wl sp" href="#/tonling/${next.id}">${esc(next.n)} ›</a></p>`;
  return { t: s.n, title: `${esc(s.n)} ${favBtn("tonling/" + s.id, s.n, "tonling", s.id)}`, c: [["tonlinge", "Tonlinge"]], h, recent: { u: "tonling/" + s.id, t: s.n, kind: "tonling", id: s.id }, after(root) {
    if (s.tot) return; const draw = () => { const cx = cxGet(), z = tlZoneTable(s, cx); Q1("#tlZ", root).innerHTML = z.html + (z.best ? `<p class="muted">Beste Stelle: ${zoneLink(z.best.z)} ${z.best.night ? "nachts" : "tagsüber"} mit ${INSTR[cx.instr].name} (Glück ${fmtD(cx.stats.luck, cx.stats.luck % 1 ? 1 : 0)}).</p>` : ""); tableSort(root); hydrate(root); };
    cxBind(root, draw); draw();
    $$("#tlMt .btn", root).forEach(b => b.onclick = () => { $$("#tlMt .btn", root).forEach(x => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); const cv = Q1("#tlArt", root), m = b.dataset.m; if (m) cv.dataset.mut = m; else delete cv.dataset.mut; Q1("#tlCap", root).textContent = m ? mutOf(m).name + " (×" + mutOf(m).mul + " Wert)" : "Normal"; });
    $$("[data-sc]", root).forEach(a => a.onclick = e => { e.preventDefault(); const t = document.getElementById(a.dataset.sc); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); }); } };
};

/* =====================  INSTRUMENTE  ===================== */
const STATL = [["ear", "Justierung"], ["prec", "Präzision"], ["harm", "Harmonie"], ["luck", "Glück"], ["beat", "Takt"]];
const instrOrigin = id => { const s = W.instrSource(id); if (s.start) return "Startinstrument"; if (s.shops.length) return "Laden"; if (s.quests.length) return "Quest-Belohnung"; return "Besonderes"; };
const instrArea = id => { const s = W.instrSource(id); const a = s.shops.length ? NPCS[s.shops[0].npc] && NPCS[s.shops[0].npc].area : (s.quests.length && QUESTS[s.quests[0]] && NPCS[QUESTS[s.quests[0]].npc] ? NPCS[QUESTS[s.quests[0]].npc].area : 1); return a || 1; };
function instrCard(id) { const i = INSTR[id], own = meOn() && S.instr.includes(id);
  return `<a class="wc ${own ? "have" : ""}" href="#/instrument/${id}"><canvas data-in="${id}" data-px="140"></canvas><b>${esc(i.name)}</b><small>Glück ${i.luck} · Zone ${i.prec}</small><small>${instrOrigin(id)}</small></a>`; }
WP.instrumente = (args, q) => {
  const ids = Object.keys(INSTR), sort = q.get("s") || "idx", ori = q.get("o") || "", view = q.get("v") || "grid", ar = +q.get("a") || 0, qq = fold(q.get("q") || "");
  const chips = (key, cur, items) => `<div class="fch">${items.map(([v, l]) => `<button class="btn" data-fk="${key}" data-fv="${v}" aria-pressed="${String(cur) === String(v)}">${l}</button>`).join("")}</div>`;
  const h = `<p class="lead">Alle <b>${ids.length}</b> Instrumente mit ihren fünf Werten, Fähigkeiten und woher du sie bekommst. Jedes Instrument hat Stärken und Schwächen, ein billiges kann in einem Wert ein teures schlagen.</p>
  <div class="filters"><input type="text" id="inq" placeholder="Name oder Fähigkeit …" value="${esc(q.get("q") || "")}" style="min-width:180px">
   <label>Herkunft ${chips("o", ori, [["", "Alle"], ["Laden", "Laden"], ["Quest-Belohnung", "Quest"], ["Besonderes", "Besonderes"]])}</label>
   <label>Bereich ${chips("a", ar || "", [["", "Alle"]].concat([1, 2, 3, 4, 5].map(a => [a, a])))}</label>
   <label>Sortieren <select id="ins">${[["idx", "Reihenfolge"], ["name", "Name"], ["luck", "Glück"], ["prec", "Präzision"], ["ear", "Justierung"], ["harm", "Harmonie"], ["beat", "Takt"], ["sum", "Summe der Werte"]].map(([v, l]) => `<option value="${v}" ${sort === v ? "selected" : ""}>${l}</option>`).join("")}</select></label>
   <div class="fch"><button class="btn" data-fk="v" data-fv="grid" aria-pressed="${view !== "table"}">Kacheln</button><button class="btn" data-fk="v" data-fv="table" aria-pressed="${view === "table"}">Tabelle</button></div><span class="cnt" id="inc"></span></div><div id="inr"></div>`;
  return { t: "Instrumente", h, after(root) {
    const draw = () => { const Q = CUR.q, so = Q.get("s") || "idx", vw = Q.get("v") || "grid"; let l = ids.slice();
      const t = fold(Q.get("q") || ""); if (t) l = l.filter(id => fold(INSTR[id].name + " " + (INSTR[id].info || "") + " " + W.instrBy(id)).includes(t));
      if (Q.get("o")) l = l.filter(id => instrOrigin(id) === Q.get("o")); if (+Q.get("a")) l = l.filter(id => instrArea(id) === +Q.get("a"));
      const val = (id, k) => k === "sum" ? STATL.reduce((a, s) => a + (INSTR[id][s[0]] || 0), 0) : INSTR[id][k];
      if (so === "name") l.sort((a, b) => INSTR[a].name.localeCompare(INSTR[b].name, "de")); else if (so !== "idx") l.sort((a, b) => val(b, so) - val(a, so));
      Q1("#inc", root).textContent = l.length + " von " + ids.length; const out = Q1("#inr", root);
      out.innerHTML = vw === "table" ? tbl([{ t: "" }, { t: "Instrument", s: 1 }, { t: "Herkunft", s: 1 }].concat(STATL.map(s => ({ t: s[1], s: 1, n: 1 }))).concat([{ t: "Summe", s: 1, n: 1 }, "Fähigkeit"]), l.map(id => { const i = INSTR[id], sum = val(id, "sum"); return `<tr><td><canvas data-in="${id}" data-px="88"></canvas></td><td class="nm" data-v="${esc(i.name)}"><a class="wl" href="#/instrument/${id}">${esc(i.name)}</a></td><td>${instrOrigin(id)}</td>${STATL.map(s => `<td class="n" data-v="${i[s[0]]}">${i[s[0]]}</td>`).join("")}<td class="n" data-v="${sum}"><b>${sum}</b></td><td><small>${esc(i.pas ? (PAS_TXT[i.pas] || "").slice(0, 90) : "–")}</small></td></tr>`; }))
        : `<div class="wgrid">${l.map(instrCard).join("")}</div>`;
      hydrate(out); tableSort(out); $$("[data-fk]", root).forEach(b => b.setAttribute("aria-pressed", String((Q.get(b.dataset.fk) || (b.dataset.fk === "v" ? "grid" : "")) === b.dataset.fv))); };
    $$("[data-fk]", root).forEach(b => b.onclick = () => { setQ({ [b.dataset.fk]: b.dataset.fv }); draw(); });
    Q1("#inq", root).oninput = e => { setQ({ q: e.target.value }); draw(); }; Q1("#ins", root).onchange = e => { setQ({ s: e.target.value === "idx" ? "" : e.target.value }); draw(); }; draw(); } };
};
const MAST_TABLE = () => { const out = []; for (let l = 1; l <= MAST_MAX; l++) out.push({ l, need: MAST_NEED[l], step: MAST_NEED[l] - MAST_NEED[l - 1] }); return out; };
WP.instrument = (args) => {
  const id = args[0], i = INSTR[id]; if (!i) return WP.notfound();
  const src = W.instrSource(id), own = meOn() && S.instr.includes(id), ml = own && typeof mastLvl === "function" ? mastLvl(id) : 0, en = own ? (S.ench || {})[id] : "";
  const allIds = Object.keys(INSTR), rank = k => 1 + allIds.filter(o => (INSTR[o][k] || 0) > (i[k] || 0)).length;
  const ownM = MUTS.find(m => m.ins === id), sum = STATL.reduce((a, s) => a + (i[s[0]] || 0), 0);
  const origin = [].concat(src.start ? ["<p>Du startest mit diesem Instrument.</p>"] : [], src.shops.map(s => `<p>${npLink(s.npc)} verkauft es für <b>${nfmt(s.price)}</b> <i class="nt"></i> ab Level ${s.lvl}.</p>`), src.quests.map(q => `<p>Belohnung der Quest ${qLink(q)} von ${npLink(QUESTS[q].npc)}.</p>`)).join("") || "<p class='muted'>Dieses Instrument bekommst du an einem besonderen Ort oder durch ein Ereignis.</p>";
  const ib = `<div class="infobox ib"><h3 style="background:var(--accent)">${esc(i.name)}</h3>
    <div class="ib-art"><canvas data-in="${id}" data-w="360" data-h="300" data-big="1" data-fps="30"></canvas></div>
    <dl>${STATL.map(s => `<div class="ib-r" style="display:block"><div class="sbar"><span>${s[1]}</span><u><b style="width:${Math.min(100, Math.round(Math.sqrt((i[s[0]] || 0) / 150) * 100))}%"></b></u><em>${i[s[0]]}</em></div></div>`).join("")}
      <div class="ib-r"><dt>Summe</dt><dd>${sum} <small class="muted">(Rang ${1 + allIds.filter(o => STATL.reduce((a, s) => a + (INSTR[o][s[0]] || 0), 0) > sum).length} von ${allIds.length})</small></dd></div>
      <div class="ib-r"><dt>Herkunft</dt><dd>${instrOrigin(id)}</dd></div>
      ${ownM ? `<div class="ib-r"><dt>Eigene Mutation</dt><dd>${mutLink(ownM.id)} ${Math.round(ownM.ip * 100)} %</dd></div>` : ""}
      ${i.pas ? `<div class="ib-r"><dt>Fähigkeit</dt><dd><small>${esc(PAS_TXT[i.pas] || "")}</small></dd></div>` : ""}
      ${PME.has && PREF.me ? `<div class="ib-r"><dt>Dein Instrument</dt><dd>${own ? `<span class="good">✓ im Besitz</span> · Meisterschaft ${ml}${en ? ` · ${esc(ENCH[en].n)}` : ""}` : `<span class="bad">noch nicht</span>`}</dd></div>` : ""}
    </dl></div>`;
  const h = `${ib}<p class="lead">${esc(i.info || "")}</p><p><em>${esc(i.tag || "")}</em></p>
  <h2 class="st">Herkunft</h2>${origin}${waMusic(id)}
  <h2 class="st">Werte und Rang</h2>
  <p>Unter allen ${allIds.length} Instrumenten steht dieses bei Glück auf Rang <b>${rank("luck")}</b>, bei Präzision auf <b>${rank("prec")}</b>, bei Justierung auf <b>${rank("ear")}</b>, bei Harmonie auf <b>${rank("harm")}</b> und beim Takt auf <b>${rank("beat")}</b>.</p>
  <div class="tw" style="padding:8px 14px"><table class="wt"><thead><tr><th>Wert</th><th>Was er bewirkt</th><th class="n">Wert</th><th class="n">Rang</th></tr></thead><tbody>${STATL.map(s => `<tr><td><b>${s[1]}</b></td><td>${esc(STAT_TIP[s[0]])}</td><td class="n">${i[s[0]]}</td><td class="n">${rank(s[0])}</td></tr>`).join("")}</tbody></table></div>
  <h2 class="st">Rechner: Meisterschaft und Verzauberung</h2>
  <p>Mit Meisterschaft (+1 auf alle Werte je Stufe) und Verzauberung ändern sich die Werte. Probiere es aus:</p>
  <div class="filters" id="inCx"><label>Meisterschaft <select id="inM">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(m => `<option value="${m}" ${m === ml ? "selected" : ""}>${m}</option>`).join("")}</select></label><label>Verzauberung <select id="inE"><option value="">keine</option>${Object.keys(ENCH).map(e => `<option value="${e}" ${e === en ? "selected" : ""}>${esc(ENCH[e].n)}</option>`).join("")}</select></label></div><div id="inSt"></div>
  ${ownM ? `<h2 class="st">Eigene Mutation: ${mutLink(ownM.id)}</h2><p>Mit diesem Instrument ist jeder Fang mit <b>${Math.round(ownM.ip * 100)} %</b> Chance ${esc(ownM.adj)}. Solche Tonlinge sind ×${ownM.mul} so viel wert.</p>` : ""}
  <h2 class="st">Mutationschancen pro Fang</h2><div id="inMu"></div>
  <h2 class="st">Beste Orte mit diesem Instrument</h2><p>Chancen auf Prächtige und bessere Tonlinge pro Wurf (Mischung aus normalen und perfekten Würfen laut Einstellung):</p>${cxBarFixed()}<div id="inBest"></div>
  <h2 class="st">Meisterschaft</h2>
  <p>Jedes Instrument sammelt Erfahrung, wenn du Tonlinge fängst. Pro Fang: ${RAR.slice(0, 6).map((r, k) => `${r.name} ${MAST_XP[k]}`).join(", ")}; ein entwischter Tonling gibt 1.</p>
  ${tbl([{ t: "Stufe", n: 1 }, { t: "Erfahrung gesamt", n: 1 }, { t: "Für diese Stufe", n: 1 }, "Bonus"], MAST_TABLE().map(m => `<tr><td class="n">${m.l}</td><td class="n">${nfmt(m.need)}</td><td class="n">${nfmt(m.step)}</td><td>+${m.l} auf alle Werte</td></tr>`))}
  <h2 class="st">Ähnliche Instrumente</h2><div class="wgrid">${allIds.filter(o => o !== id).sort((a, b) => Math.abs(STATL.reduce((x, s) => x + (INSTR[a][s[0]] || 0), 0) - sum) - Math.abs(STATL.reduce((x, s) => x + (INSTR[b][s[0]] || 0), 0) - sum)).slice(0, 6).map(instrCard).join("")}</div>`;
  function cxBarFixed() { return `<div class="filters"><label>Perfekte Würfe <input type="range" min="0" max="100" step="5" value="${Math.round(PREF.pp * 100)}" id="inPP" style="width:110px"> <b id="inPPv">${Math.round(PREF.pp * 100)} %</b></label></div>`; }
  return { t: i.name, title: `${esc(i.name)} ${favBtn("instrument/" + id, i.name, "instrument", id)}`, c: [["instrumente", "Instrumente"]], h, recent: { u: "instrument/" + id, t: i.name, kind: "instrument", id }, after(root) {
    const upd = () => { const m = +Q1("#inM", root).value, e = Q1("#inE", root).value, st = W.stats(id, { mast: m, ench: e }), base = W.stats(id, {});
      Q1("#inSt", root).innerHTML = `<div class="cols"><div>${STATL.map(s => sbar(s[1], st[s[0]], 150, st[s[0]] - base[s[0]])).join("")}</div><div>${e ? `<p><b style="color:${ENCH[e].col}">${esc(ENCH[e].n)}:</b> ${esc(ENCH[e].d)}</p>` : "<p class='muted'>Ohne Verzauberung.</p>"}<p class="muted">Blau steht für den Bonus aus Meisterschaft und Verzauberung.</p></div></div>`;
      const md = W.mutDist(id, { ench: e, night: false }), mn = W.mutDist(id, { ench: e, night: true });
      const rows = MUTS.filter(m => (md[m.id] || 0) > 0 || (mn[m.id] || 0) > 0).sort((a, b) => (md[b.id] || 0) - (md[a.id] || 0));
      Q1("#inMu", root).innerHTML = tbl([{ t: "Mutation", s: 1 }, { t: "Tags", s: 1, n: 1 }, { t: "Nachts", s: 1, n: 1 }, { t: "Fänge bis eine", s: 1, n: 1 }, { t: "Faktor", s: 1, n: 1 }], [`<tr><td><b>Irgendeine</b></td><td class="n">${fmtP(1 - md.none)}</td><td class="n">${fmtP(1 - mn.none)}</td><td class="n">${fmtC(1 - md.none)}</td><td class="n">–</td></tr>`].concat(rows.map(m => `<tr><td>${mutLink(m.id)}</td><td class="n" data-v="${md[m.id] || 0}">${fmtP(md[m.id] || 0)}</td><td class="n" data-v="${mn[m.id] || 0}">${fmtP(mn[m.id] || 0)}</td><td class="n" data-v="${md[m.id] ? 1 / md[m.id] : 1e9}">${fmtC(md[m.id] || 0)}</td><td class="n" data-v="${m.mul}">×${m.mul}</td></tr>`)));
      const L = W.luckOf(id, { mast: m, ench: e }), pp = PREF.pp, zs = W.allZones().filter(z => ZINFO[z].a <= RELEASE.areas).map(z => { let best = null; [false, true].forEach(n => { const mx = W.mix(z, n, L, pp); let p3 = 0, p4 = 0, p5 = 0; W.speciesIn(z, n).forEach(s => { const v = mx[s.id] || 0; if (s.r >= 3) p3 += v; if (s.r >= 4) p4 += v; if (s.r >= 5) p5 += v; }); if (!best || p3 > best.p3) best = { n, p3, p4, p5 }; }); return { z, best }; }).filter(x => x.best.p3 > 0).sort((a, b) => b.best.p3 - a.best.p3).slice(0, 8);
      Q1("#inBest", root).innerHTML = tbl([{ t: "Ort", s: 1 }, { t: "Zeit", s: 1 }, { t: "Prächtig+", s: 1, n: 1 }, { t: "Fabelhaft+", s: 1, n: 1 }, { t: "Glorreich+", s: 1, n: 1 }], zs.map(x => `<tr><td>${zoneLink(x.z)}</td><td>${x.best.n ? "☾ Nacht" : "☀ Tag"}</td><td class="n" data-v="${x.best.p3}">${fmtP(x.best.p3)}</td><td class="n" data-v="${x.best.p4}">${fmtP(x.best.p4)}</td><td class="n" data-v="${x.best.p5}">${fmtP(x.best.p5)}</td></tr>`));
      tableSort(root); };
    Q1("#inM", root).onchange = upd; Q1("#inE", root).onchange = upd; Q1("#inPP", root).oninput = e => { PREF.pp = e.target.value / 100; Q1("#inPPv", root).textContent = e.target.value + " %"; savePref(); upd(); }; upd(); } };
};

/* =====================  MUTATIONEN  ===================== */
const mutSource = m => m.ins ? `Nur mit ${INSTR[m.ins] ? INSTR[m.ins].name : m.ins}: ${Math.round(m.ip * 100)} % pro Fang` : m.id === "moos" ? "Moosharfe: 10 % pro Fang" : m.id === "runen" ? "Verzauberung Runenklang: 10 % pro Fang" : `Jeder Fang: ${fmtP(m.p)} Grundchance`;
WP.mutationen = () => ({ t: "Mutationen", h: `<p class="lead">Manche Tonlinge kommen <b>mutiert</b> zur Welt: Sie sehen anders aus und sind ein Vielfaches wert. Es gibt <b>${MUTS.length}</b> Mutationen. Eigene Mutationen kommen nur mit einem bestimmten Instrument.</p>
  <div class="wgrid">${MUTS.map(m => `<a class="wc" href="#/mutation/${m.id}"><canvas data-sp="${["wippa", "tupfel", "mondling", "kometarius"][MUTS.indexOf(m) % 4]}" data-mut="${m.id}" data-px="140"></canvas><b style="color:${m.dk || "var(--ink)"}">${esc(m.name)}</b><small>×${m.mul} Wert</small><small>${esc(mutSource(m))}</small></a>`).join("")}</div>
  <h2 class="st">Übersicht</h2>${tbl([{ t: "Mutation", s: 1 }, { t: "Faktor", s: 1, n: 1 }, { t: "Grundchance", s: 1, n: 1 }, "Quelle"], MUTS.map(m => `<tr><td>${mutLink(m.id)}</td><td class="n" data-v="${m.mul}">×${m.mul}</td><td class="n" data-v="${m.p || m.ip || 0}">${m.p ? fmtP(m.p) : m.ip ? fmtP(m.ip) : "–"}</td><td>${esc(mutSource(m))}</td></tr>`))}
  ${box("info", "So funktioniert die Mutation", "<p>Nach dem Wurf wird für jeden Fang gewürfelt: Zuerst die <b>eigene Mutation</b> des Instruments, dann Runisch (mit der Verzauberung) und Bemoost (Moosharfe), dann Sternklar, Funkelnd und Gläsern in dieser Reihenfolge. Ein Tonling hat immer höchstens eine Mutation. Sie gilt für Quests als „mutiert“ (außer Bemoost).</p>")}`, after(root) { tableSort(root); } });
WP.mutation = (args) => {
  const m = mutOf(args[0]); if (!m) return WP.notfound();
  const dists = Object.keys(INSTR).map(id => ({ id, p: (W.mutDist(id, {})[m.id] || 0), pn: (W.mutDist(id, { night: true })[m.id] || 0), pe: (W.mutDist(id, { ench: "mutiert" })[m.id] || 0) })).filter(x => x.p > 0 || x.pn > 0).sort((a, b) => b.p - a.p);
  const qs = Object.keys(QUESTS).filter(id => !QUESTS[id].rel || QUESTS[id].rel <= RELEASE.areas).filter(id => W.parts(QUESTS[id]).some(p => p.f && (p.f.mut === m.id || (Array.isArray(p.f.mut) && p.f.mut.includes(m.id)))));
  const samples = ["tupfel", "brummel", "hallsaenger", "sonnenkern", "weltenstern", "perlchen", "urperle"].filter(id => SP[id]);
  const ib = `<div class="infobox ib"><h3 style="background:${m.dk || m.col}">${esc(m.name)}</h3><div class="ib-art"><canvas id="mtArt" data-sp="${samples[0]}" data-mut="${m.id}" data-w="360" data-h="330" data-big="1" data-fps="30"></canvas><span class="cap" id="mtCap">${esc(SP[samples[0]].n)}</span></div>
    <div class="ib-tabs" id="mtTb">${samples.map((s, i) => `<button class="btn" data-s="${s}" aria-pressed="${i === 0}">${esc(SP[s].n)}</button>`).join("")}</div>
    <dl><div class="ib-r"><dt>Wert-Faktor</dt><dd><b>×${m.mul}</b></dd></div><div class="ib-r"><dt>Erfahrung</dt><dd>×${fmtD(Math.sqrt(m.mul), 2)}</dd></div><div class="ib-r"><dt>Quelle</dt><dd>${esc(mutSource(m))}</dd></div>${m.ins ? `<div class="ib-r"><dt>Instrument</dt><dd>${inLink(m.ins)}</dd></div>` : ""}</dl></div>`;
  const h = `${ib}<p class="lead">${esc(m.adj)} Tonlinge sind <b>×${m.mul}</b> so viel wert wie ihre normale Form. ${m.ins ? `Diese Mutation gibt es <b>nur mit ${esc(INSTR[m.ins] ? INSTR[m.ins].name : m.ins)}</b>.` : m.id === "moos" ? "Du bekommst sie nur mit der Moosharfe." : m.id === "runen" ? "Du bekommst sie nur mit der Verzauberung Runenklang." : `Jeder Fang hat dafür eine Grundchance von <b>${fmtP(m.p)}</b>.`}</p>
  <h2 class="st">Chance pro Fang mit jedem Instrument</h2><p>Rechenbasis: ohne Verzauberung. Die Spalte „Mutiert“ zeigt die Chance mit der Verzauberung Mutiert (doppelte Mutationschance).</p>
  ${tbl([{ t: "Instrument", s: 1 }, { t: "Tags", s: 1, n: 1 }, { t: "Nachts", s: 1, n: 1 }, { t: "Mutiert", s: 1, n: 1 }, { t: "Fänge bis eine", s: 1, n: 1 }], dists.map(x => `<tr><td>${inLink(x.id)}</td><td class="n" data-v="${x.p}"><b>${fmtP(x.p)}</b></td><td class="n" data-v="${x.pn}">${fmtP(x.pn)}</td><td class="n" data-v="${x.pe}">${fmtP(x.pe)}</td><td class="n" data-v="${x.p ? 1 / x.p : 1e9}">${fmtC(x.p)}</td></tr>`))}
  <h2 class="st">Wert-Beispiele</h2>${tbl(["Tonling", { t: "Normal", n: 1 }, { t: m.name, n: 1 }], samples.map(s => `<tr><td>${spLink(s)}</td><td class="n">${nfmt(W.valueRange(SP[s])[2])}</td><td class="n"><b>${nfmt(W.valueRange(SP[s], m.id)[2])}</b></td></tr>`))}
  ${qs.length ? `<h2 class="st">Quests</h2><p>Diese Quests verlangen ${esc(m.adj)} Tonlinge:</p>${tbl([{ t: "Quest", s: 1 }, "NPC", { t: "Level", s: 1, n: 1 }], qs.map(id => `<tr><td>${qLink(id)}</td><td>${npLink(QUESTS[id].npc)}</td><td class="n">${QUESTS[id].lvl}</td></tr>`))}` : ""}`;
  return { t: m.name, title: esc(m.name), c: [["mutationen", "Mutationen"]], h, after(root) { tableSort(root); $$("#mtTb .btn", root).forEach(b => b.onclick = () => { $$("#mtTb .btn", root).forEach(x => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); Q1("#mtArt", root).dataset.sp = b.dataset.s; Q1("#mtCap", root).textContent = SP[b.dataset.s].n; }); } };
};

/* =====================  VERZAUBERUNGEN  ===================== */
WP.verzauberungen = () => ({ t: "Verzauberungen", h: `<p class="lead">Am <b>Echoaltar</b> kannst du einem Instrument mit einem <b>Echosplitter</b> eine Verzauberung geben. Welche, entscheidet das Echo, alle ${Object.keys(ENCH).length} sind gleich wahrscheinlich. Ein Instrument trägt eine Verzauberung, eine neue ersetzt die alte (nie durch dieselbe).</p>
  <div class="wgrid l">${Object.keys(ENCH).map(id => { const e = ENCH[id]; return `<a class="wc l" href="#/verzauberung/${id}"><canvas data-in="${["geige", "harfe", "laute", "schelle", "glocken", "kalimba", "zither", "urgabel", "weltenorgel", "sternenharfe"][Object.keys(ENCH).indexOf(id) % 10]}" data-px="90"></canvas><span><b style="color:${e.col}">${esc(e.n)}</b><small>${esc(e.d)}</small></span></a>`; }).join("")}</div>
  <h2 class="st">Echosplitter bekommen</h2>
  <div class="step"><i>1</i><div><b>Beim Fangen:</b> Jeder Fang hat eine Chance von etwa <b>1 zu 200</b> (mit Glück etwas mehr: +0,08 % je 100 Glück). Spätestens nach <b>400 Fängen</b> bekommst du garantiert einen.</div></div>
  <div class="step"><i>2</i><div><b>Kaufen:</b> Runa verkauft Echosplitter für <b>21 000</b> <i class="nt"></i>, sobald du ihre Quest erledigt hast.</div></div>
  <h2 class="st">Der Echoaltar</h2>
  <p>Der Altar liegt in einer versteckten Kammer am Wolkenpfad (Sternenhöhe) hinter einer Wand, die nur <b>nachts</b> offen ist. Sprich mit ${npLink("runa")} und erledige ${qLink("q_echoaltar")}. Bei Tagesanbruch schließt sich die Kammer wieder.</p>
  ${tbl([{ t: "Verzauberung", s: 1 }, "Wirkung"], Object.keys(ENCH).map(id => `<tr><td><b style="color:${ENCH[id].col}">${esc(ENCH[id].n)}</b></td><td>${esc(ENCH[id].d)}</td></tr>`))}` });
WP.verzauberung = (args) => { const e = ENCH[args[0]]; if (!e) return WP.notfound(); const ids = Object.keys(INSTR);
  const bonus = e.add ? Object.keys(e.add).map(k => `+${e.add[k]} ${STATL.find(s => s[0] === k)[1]}`).join(", ") : e.mul ? `+${Math.round((e.mul - 1) * 100)} % auf alle Werte` : "Spezialeffekt";
  const best = e.add ? ids.map(id => ({ id, v: INSTR[id][Object.keys(e.add)[0]] })).sort((a, b) => b.v - a.v).slice(0, 6) : [];
  return { t: e.n, title: `<span style="color:${e.col}">${esc(e.n)}</span>`, c: [["verzauberungen", "Verzauberungen"]], h: `<p class="lead">${esc(e.d)}</p><div class="kv"><div><b>${esc(bonus)}</b><small>Bonus</small></div><div><b>${fmtP(1 / Object.keys(ENCH).length)}</b><small>Chance am Altar</small></div></div>
  ${e.add ? `<h2 class="st">Passt gut zu</h2><p>Instrumente mit hohem ${STATL.find(s => s[0] === Object.keys(e.add)[0])[1]}-Wert nutzen die Verzauberung gut:</p><div class="wgrid">${best.map(b => instrCard(b.id)).join("")}</div>` : ""}
  <p><a class="wl" href="#/verzauberungen">‹ Alle Verzauberungen</a></p>` }; };

/* ===== Wetter ===== */
const wxLikes = s => { const lk = WX_IDS.filter(i => WX[i].like.includes(s.id)), ht = WX_IDS.filter(i => WX[i].hate.includes(s.id)); if (!lk.length && !ht.length) return ""; const l = i => `<a class="wl" href="#/wetter/${i}">${esc(WX[i].name)}</a>`; return `<div class="ib-r"><dt>Wetter</dt><dd>${lk.length ? `<span class="good">mag:</span> ${lk.map(l).join(", ")}` : ""}${lk.length && ht.length ? "<br>" : ""}${ht.length ? `<span class="bad">meidet:</span> ${ht.map(l).join(", ")}` : ""}</dd></div>`; };
const wxP = (id, night) => { const pool = wxPool(night), tot = pool.reduce((a, p) => a + p[1], 0), e = pool.find(p => p[0] === id); return e ? e[1] / tot : 0; };
const wxPill = id => `<a class="pill" href="#/wetter/${id}" style="color:${WX[id].col === "#ffd45a" || WX[id].col === "#e8f2ff" ? "var(--ink)" : "var(--ink)"}"><canvas data-ic="wx:${id}" data-px="48" data-still="1" style="width:22px;height:22px;vertical-align:middle"></canvas> ${esc(WX[id].name)}</a>`;
WP.wetter = (args) => {
  const id = args[0];
  if (!id) { const now = wxAt();
    return { t: "Wetter", h: `<p class="lead">Das Wetter ist für <b>alle Spieler gleich</b>: Es hängt nur von der Weltzeit ab. Jede Nacht und jeder Tag hat genau ein Wetter. Es verändert die Optik draußen, gibt Boni, verschiebt die Spawn-Chancen und kann Mutationen auslösen.</p>
    <div class="box"><div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><canvas data-ic="wx:${now.id}" data-px="110" id="wxNow"></canvas><div><b style="font-size:26px">${esc(now.def.name)}</b> <span class="pill">${esc(now.def.tag)}</span><br>${esc(now.def.d)}<br><small class="muted">${now.night ? "Diese Nacht" : "Dieser Tag"}</small></div></div></div>
    <h2 class="st">Alle Wetter</h2>${tbl([{ t: "" }, { t: "Wetter", s: 1 }, { t: "Häufigkeit", s: 1 }, { t: "Tags", s: 1, n: 1 }, { t: "Nachts", s: 1, n: 1 }, "Effekte"], WX_IDS.map(i => `<tr><td><canvas data-ic="wx:${i}" data-px="64" data-still="1"></canvas></td><td class="nm" data-v="${esc(WX[i].name)}"><a class="wl" href="#/wetter/${i}">${esc(WX[i].name)}</a></td><td data-v="${Math.max(wxP(i, false), wxP(i, true))}">${esc(WX[i].tag)}${wxRare(i) ? ' <span class="pill" data-tip="Seltene Wetter können nicht von Totems überschrieben werden">gesichert</span>' : ""}</td><td class="n" data-v="${wxP(i, false)}">${wxP(i, false) ? fmtP(wxP(i, false)) : "–"}</td><td class="n" data-v="${wxP(i, true)}">${wxP(i, true) ? fmtP(wxP(i, true)) : "–"}</td><td><small>${esc(WX[i].d)}</small></td></tr>`))}
    ${box("info", "Gut zu wissen", `<p>Draußen (Klanghain, Sternenhöhe, Rauschmeer) siehst du das Wetter. In den Höhlen und im Sanktum gibt es keine Wetter-Optik, <b>Boni, Tempo und Mutationen gelten aber überall</b>. Wetter mit höchstens ${WX_RARE_MAX} % Chance pro Abschnitt sind <b>selten</b> und können nicht durch Totems überschrieben werden.</p>`)}`,
      after(root) { hydrate(root); tableSort(root); } }; }
  const w = WX[id]; if (!w) return WP.notfound();
  const likes = SPECIES.filter(s => w.like.includes(s.id)), hates = SPECIES.filter(s => w.hate.includes(s.id)), cur = wxNowId() === id;
  const mut = Object.keys(w.mut || {}), addTxt = Object.keys(w.add || {}).map(k => `${w.add[k] > 0 ? "+" : "−"}${Math.abs(w.add[k])} ${STATL.find(s => s[0] === k)[1]}`);
  return { t: w.name, title: `${esc(w.name)}`, c: [["wetter", "Wetter"]], h: `<div class="infobox ib"><h3 style="background:${w.col};color:var(--ink)">${esc(w.name)}</h3><div class="ib-art"><canvas data-ic="wx:${id}" data-w="360" data-h="260" data-big="1" data-fps="30" style="height:200px"></canvas></div><dl>
    <div class="ib-r"><dt>Häufigkeit</dt><dd>${esc(w.tag)}</dd></div><div class="ib-r"><dt>Tags</dt><dd>${wxP(id, false) ? fmtP(wxP(id, false)) + " pro Tag" : "kommt nur nachts vor"}</dd></div><div class="ib-r"><dt>Nachts</dt><dd>${wxP(id, true) ? fmtP(wxP(id, true)) + " pro Nacht" : "kommt nur tagsüber vor"}</dd></div>
    ${addTxt.length ? `<div class="ib-r"><dt>Werte</dt><dd>${addTxt.join("<br>")}</dd></div>` : ""}${w.spd ? `<div class="ib-r"><dt>Tempo</dt><dd>${w.spd > 0 ? "+" : "−"}${fmtD(Math.abs(w.spd), 1)} für alle Tonlinge</dd></div>` : ""}
    ${mut.length ? `<div class="ib-r"><dt>Mutationen</dt><dd>${mut.map(m => `${mutLink(m)} ${fmtP(w.mut[m])}`).join("<br>")}</dd></div>` : ""}
    <div class="ib-r"><dt>Totem-Schutz</dt><dd>${wxRare(id) ? '<span class="good">gesichert</span> (kann nicht überschrieben werden)' : "kann per Totem gesetzt werden"}</dd></div>${cur ? `<div class="ib-r"><dt>Jetzt</dt><dd><span class="good">Gerade aktiv</span></dd></div>` : ""}</dl></div>
    <p class="lead">${esc(w.d)}</p>
    <h2 class="st">Totem</h2>${totemBox(id)}
    ${wxQuestsBox(id)}
    <h2 class="st">Tonlinge, die es mögen</h2>${likes.length ? `<p>Spawn-Chance ×1,7 bei diesem Wetter.</p><div class="wgrid">${likes.map(s => tlCard({ s })).join("")}</div>` : "<p class='muted'>Keine.</p>"}
    <h2 class="st">Tonlinge, die es meiden</h2>${hates.length ? `<p>Spawn-Chance ×0,45 bei diesem Wetter.</p><div class="wgrid">${hates.map(s => tlCard({ s })).join("")}</div>` : "<p class='muted'>Keine.</p>"}`,
    after(root) { hydrate(root); } };
};

/* Totem-Tonlinge: Chance pro Wurf und Verhalten */
function totemChance(s) {
  const tot = SPECIES.filter(x => x.tot), sum = tot.reduce((a, x) => a + x.tw, 0), share = s.tw / sum, base = 1 / 1600;
  const rows = [0, 20, 60, 100].map(l => { const p = base * (1 + l / 100 * 1.2) * share; return `<tr><td class="n">${l}</td><td class="n">${fmtP(p)}</td><td class="n">${fmtC(p)}</td></tr>`; }).join("");
  return `<p>Bei jedem Wurf gibt es (ab 10 Fängen) eine winzige Chance auf einen Totem-Tonling, in jeder Zone und zu jeder Zeit. Dieses Totem macht <b>${fmtP(share)}</b> aller Totems aus. Glück erhöht die Chance etwas.</p>
  <div class="tw"><table class="wt"><thead><tr><th class="n">Glück</th><th class="n">Chance pro Wurf</th><th class="n">Würfe im Schnitt</th></tr></thead><tbody>${rows}</tbody></table></div>
  ${box("tip", "So wird es benutzt", `<p>Gefangene Totems landen im Inventar (sie sind automatisch favorisiert und werden nicht verkauft). Nimm eines in die Hand und drücke die Aktionstaste, die dann „Benutzen“ heißt. Der Server prüft das: Zwischen zwei Totems vergehen mindestens 45 Sekunden, und gegen seltenes Wetter wirken sie nicht.</p>`)}`;
}

const totemBox = id => { const s = SP["tot_" + id]; return s ? `<div class="wgrid">${tlCard({ s })}</div><p class="muted">Setzt dieses Wetter für alle Spieler, solange kein seltenes Wetter herrscht.</p>` : "<p class='muted'>Kein Totem.</p>"; };

const wxQuestsBox = id => { const hit = Object.keys(QUESTS).filter(k => W.parts(QUESTS[k]).some(p => { const f = p.f || {}; return (f.wx && [].concat(f.wx).includes(id)) || (f.mut && WX[id].mut && WX[id].mut[f.mut]) || (p.k === "item" && ITEMS[p.id] && ITEMS[p.id].wx === id); })), its = Object.keys(ITEMS).filter(i => ITEMS[i].wx === id);
  if (!hit.length && !its.length) return ""; return `<h2 class="st">Quests und Geheimnisse</h2>${hit.length ? `<p>${hit.map(k => qLink(k)).join(" · ")}</p>` : ""}${its.length ? `<p>Nur bei diesem Wetter sichtbar: ${its.map(i => `<b>${esc(ITEMS[i].n)}</b>`).join(", ")} (siehe <a class="wl" href="#/items">Fundstücke</a>).</p>` : ""}`; };
