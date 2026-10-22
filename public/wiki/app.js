(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = n => Number(n || 0).toLocaleString("de-DE");
  const rarity = r => DATA.rarities[r] || { name: "Unbekannt", col: "#748096" };
  const area = a => DATA.areas[a]?.name || `Bereich ${a}`;
  const zone = id => DATA.zones[id]?.n || id || "–";
  const rarityPill = r => `<span class="mini-tag rarity-tag" style="--rarity:${esc(rarity(r).col)}"><i class="rarity-dot" style="--rarity:${esc(rarity(r).col)}"></i>${esc(rarity(r).name)}</span>`;
  const pill = (label, color) => `<span class="mini-tag"${color ? ` style="color:${esc(color)}"` : ""}>${esc(label)}</span>`;
  const href = (kind, id) => `#${encodeURIComponent(kind)}/${encodeURIComponent(id)}`;
  const navLabels = { home: "Übersicht", map: "Weltkarte", areas: "Bereiche", tonlinge: "Tonlinge", instruments: "Instrumente", quests: "Quests", npcs: "Figuren", items: "Gegenstände", rarities: "Seltenheiten", mutations: "Mutationen", enchantments: "Verzauberungen", titles: "Titel", mechanics: "Spielmechaniken", updates: "Updates & Datenstand" };
  let DATA = null;
  let listFilter = "";
  let listScope = "all";
  let pendingMapFocus = null;

  // Die Vorschauen verwenden live die unveränderten Canvas-Renderer aus dem Spiel.
  function renderTonling(sp, cls = "") {
    return `<canvas class="game-tonling-render ${esc(cls)}" data-art-kind="species" data-art-id="${esc(sp.id)}" aria-label="${esc(sp.n)}"></canvas>`;
  }

  let gameRendererFrame = null;
  let gameRendererPromise = null;
  let gameRendererApi = null;
  let gameAnimationFrame = 0;
  function getGameRenderer() {
    if (gameRendererPromise) return gameRendererPromise;
    gameRendererPromise = (async () => {
      const response = await fetch("/");
      if (!response.ok) throw new Error("Spielseite für den Originalrenderer konnte nicht geladen werden");
      let html = await response.text();
      const multiplayerStartup = /\bmpConnect\(\);\s*(?=<\/script>)/;
      if (!multiplayerStartup.test(html)) throw new Error("Mehrspielerstart im Spielskript wurde nicht gefunden");
      html = html.replace(multiplayerStartup, "");
      html = html.replace(/<head(\s[^>]*)?>/i, match => match + "<base href=\"/\">");
      return await new Promise((resolve, reject) => {
        const frame = document.createElement("iframe");
        frame.title = "Original-Renderer des Spiels";
        frame.tabIndex = -1;
        frame.setAttribute("aria-hidden", "true");
        frame.style.cssText = "position:fixed;width:1px;height:1px;left:-10px;top:-10px;border:0;opacity:0;pointer-events:none";
        const timer = setTimeout(() => reject(new Error("Spielrenderer nicht rechtzeitig geladen")), 20000);
        frame.onload = () => { clearTimeout(timer); gameRendererFrame = frame; resolve(frame); };
        frame.onerror = () => { clearTimeout(timer); reject(new Error("Spielrenderer konnte nicht geladen werden")); };
        frame.srcdoc = html;
        document.body.appendChild(frame);
      });
    })();
    return gameRendererPromise;
  }

  async function ensureGameRendererApi() {
      const frame = await getGameRenderer();
      if (!gameRendererApi) gameRendererApi = frame.contentWindow.eval(`(()=>({
        draw(c,kind,id,t,mut){
          const dpr=Math.min(2,window.devicePixelRatio||1),w=kind==='title'?320:kind==='icon'?112:kind==='npc'?144:220,h=kind==='title'?86:kind==='npc'?144:220;
          if(c.width!==w*dpr||c.height!==h*dpr){c.width=w*dpr;c.height=h*dpr}
          const x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);
          if(kind==='species'){const sp=SP[id];if(sp)drawTonling(x,sp,w/2,h/2+5,Math.min(w,h)*.37,t,mut||null)}
          else if(kind==='npc'){const n=NPCS[id];if(n){x.save();x.translate(w/2,h*.76);x.scale(1.65,1.65);drawPerson(x,0,0,n.col,n.hat,{look:NPC_LOOK[id],face:1},t);x.restore()}}
          else if(kind==='icon'){const i=INSTR[id],it=(typeof ITEMS!=='undefined'&&ITEMS[id])||null,k=i?kindIcon(i.kind):id==='boots'||id==='shard'?id:it?it.kind:id;drawIcon(x,k,w/2,h/2,54)}
          else if(kind==='title'){const ti=TITLE[id];if(ti)drawNameTag(x,w/2,58,'Klanghüter',12,id,t)}
        },
        map(c,id){
          const old={seen:S.seen,seenL:S.seenL,q:S.q,pins:S.pins,px:G.px,py:G.py,layer:LAYER,seenCache:SEEN};
          S.seen='1'.repeat(MW*MH);S.seenL={};for(const key of Object.keys(LAYERS))S.seenL[key]='1'.repeat(MW*MH);S.q={};S.pins=[];G.px=-10000;G.py=-10000;LAYER=id;SEEN=null;
          try{drawMap(c,id)}finally{S.seen=old.seen;S.seenL=old.seenL;S.q=old.q;S.pins=old.pins;G.px=old.px;G.py=old.py;LAYER=old.layer;SEEN=old.seenCache}
        }
      }))()`);
      return gameRendererApi;
  }
  async function hydrateGameArt() {
    if (!document.querySelector("canvas[data-art-kind][data-art-id]")) return;
    try {
      await ensureGameRendererApi();
      const tick = now => {
        const t = now / 1000;
        for (const canvas of document.querySelectorAll("canvas[data-art-kind][data-art-id]")) {
          const rect=canvas.getBoundingClientRect(); if(!rect.width||!rect.height)continue;
          gameRendererApi.draw(canvas,canvas.dataset.artKind,canvas.dataset.artId,t,canvas.dataset.artMut||null);
        }
        if(document.querySelector("canvas[data-art-kind][data-art-id]"))gameAnimationFrame=requestAnimationFrame(tick);
      };
      cancelAnimationFrame(gameAnimationFrame); gameAnimationFrame=requestAnimationFrame(tick);
    } catch (error) { console.error("Originaler Spielrenderer konnte nicht geladen werden.", error); }
  }

  const gameIcon = (kind,id,cls="") => `<canvas class="game-icon-render ${esc(cls)}" data-art-kind="${esc(kind)}" data-art-id="${esc(id)}" aria-label="${esc(id)}"></canvas>`;
  const rarityNameClass = r => `rarity-name rarity-${Number(r)}`;

  const speciesById = id => DATA.species.find(s => s.id === id);
  const allItems = () => [...Object.entries(DATA.items), ...(DATA.specialItems || []).map(x => [x.id, x])];
  const instrById = id => DATA.instruments[id];
  const npcById = id => DATA.npcs[id];
  const questPairs = () => (DATA.questOrder || Object.keys(DATA.quests)).filter(id=>DATA.quests[id]).map(id=>[id,DATA.quests[id]]);
  const questCountForNpc = id => questPairs().filter(([, q]) => q.npc === id).length;
  const symbolFor = kind => ({ home: "⌂", map: "⌖", areas: "◈", tonlinge: "◉", instruments: "♫", quests: "✦", npcs: "♙", items: "◇", rarities: "✧", mutations: "✳", enchantments: "⌘", titles: "♛", mechanics: "⚙", updates: "◷" })[kind] || "♪";

  function pageHead(kind, title, subtitle, count) {
    return `<div class="intro-row"><div><div class="eyebrow">${esc(kind)}</div><h1 class="page-title">${esc(title)}</h1>${subtitle ? `<p class="lead">${esc(subtitle)}</p>` : ""}</div>${count !== undefined ? `<span class="stamp">${fmt(count)} Einträge</span>` : ""}</div>`;
  }
  function cardLink(kind, id, title, description, tags = [], icon = null) {
    return `<a class="data-card" href="${href(kind, id)}"><div class="home-card-top"><span>${icon || symbolFor(kind)}</span></div><h3>${esc(title)}</h3>${description ? `<p>${esc(description)}</p>` : ""}${tags.length ? `<div class="article-pill-row">${tags.join("")}</div>` : ""}</a>`;
  }
  function renderHome() {
    const hero = DATA.species.find(s => s.id === "weltenstern") || DATA.species[0];
    const side = DATA.species.find(s => s.id === "moospel") || DATA.species[1];
    return `<section class="hero"><span class="hero-stamp">Feldbuch · Ausgabe I</span><div class="hero-copy"><div class="eyebrow">Willkommen im Klanghain</div><h1 class="display-title">Lausche zwischen<br>den Zeilen.</h1><p class="lead">Ein Wegweiser durch die Welt der Tonlinge: ihre Klänge, Instrumente, Begegnungen und die Orte, an denen sie warten.</p><div class="hero-actions"><a class="button primary" href="#tonlinge">Tonlinge entdecken <span>→</span></a><a class="button" href="#map">Karte öffnen <span>⌖</span></a></div></div><div class="hero-art" aria-hidden="true"><span class="hero-spark one">✦</span><span class="hero-spark two">✧</span><span class="hero-spark three">✧</span><span class="hero-note">♪</span><div class="hero-creature large">${renderTonling(hero)}</div><div class="hero-creature small">${renderTonling(side)}</div></div></section>
      <div class="stats-row"><div class="stat-tile"><span class="stat-icon">◉</span><div><div class="stat-value">${DATA.species.length}</div><div class="stat-label">Tonlinge im Index</div></div></div><div class="stat-tile"><span class="stat-icon">♫</span><div><div class="stat-value">${Object.keys(DATA.instruments).length}</div><div class="stat-label">Instrumente</div></div></div><div class="stat-tile"><span class="stat-icon">✦</span><div><div class="stat-value">${Object.keys(DATA.quests).length}</div><div class="stat-label">Quests und Aufträge</div></div></div><div class="stat-tile"><span class="stat-icon">⌖</span><div><div class="stat-value">${Object.keys(DATA.zones).length}</div><div class="stat-label">verzeichnete Teilgebiete</div></div></div></div>
      <div class="section-heading"><div><h2>Wähle deinen Pfad</h2><p>Jeder Eintrag führt dich zu den passenden Daten und Verknüpfungen.</p></div></div>
      <div class="home-grid">${[
        ["tonlinge", "Tonlinge", "Finde Arten nach Gebiet, Seltenheit, Tageszeit und Frequenzbereich.", DATA.species.length],
        ["instruments", "Instrumente", "Vergleiche die fünf Klangwerte und besonderen Fähigkeiten.", Object.keys(DATA.instruments).length],
        ["quests", "Quests", "Schrittfolgen, Voraussetzungen und Belohnungen aus dem Questbuch.", Object.keys(DATA.quests).length],
        ["npcs", "Figuren", "Lerne die Bewohner kennen und finde ihre Aufgaben und Läden.", Object.keys(DATA.npcs).length],
        ["areas", "Bereiche & Unterbereiche", "Von der Singwiese bis zu den Hallen des Sanktum Magus.", Object.keys(DATA.zones).length],
        ["map", "Karte & Kacheln", "Erkunde jede verzeichnete Ebene und suche nach Orten oder Figuren.", Object.keys(DATA.layers).length]
      ].map(([k, t, d, n]) => `<a class="home-card" href="#${k}"><div class="home-card-top"><span>${symbolFor(k)}</span><span class="home-card-count">${fmt(n)} Einträge</span></div><h3>${t}</h3><p>${d}</p><span class="home-card-arrow">Im Feldbuch nachsehen →</span></a>`).join("")}</div>
      <div class="section-heading"><div><h2>Gut zu wissen</h2><p>Wie dieses Feldbuch entstanden ist.</p></div><a class="text-link" href="#updates">Datenstand ansehen →</a></div>
      <div class="notice"><span class="notice-icon">✧</span><div><strong>Ein Kompendium aus den Spieldaten</strong><p>Namen, Fundorte, Werte, Quests, Figuren und Kartenebenen werden direkt aus den lokalen Spieldateien ausgelesen. Was dort nicht festgehalten ist, wird hier nicht als gesicherte Spielinformation ausgegeben.</p></div></div>`;
  }

  function listToolbar({ filters = [], search = true, extra = "" } = {}) {
    return `<div class="toolbar">${search ? `<label for="listSearch">Filtern</label><input id="listSearch" type="search" placeholder="Einträge filtern …" value="${esc(listFilter)}">` : ""}${filters.map(f => `<label for="${esc(f.id)}">${esc(f.label)}</label><select id="${esc(f.id)}">${f.options.map(o => `<option value="${esc(o.value)}"${String(o.value) === String(f.value) ? " selected" : ""}>${esc(o.label)}</option>`).join("")}</select>`).join("")}${extra}<span class="filter-count" id="filterCount"></span></div>`;
  }
  function bindFilter(render) {
    const search = $("#listSearch");
    if (search) search.addEventListener("input", () => { listFilter = search.value; render(); const next = $("#listSearch"); if (next) { next.focus(); next.setSelectionRange(next.value.length, next.value.length); } });
    $$(`.list-filter`).forEach(el => el.addEventListener("change", () => { listScope = el.value; listFilter = $("#listSearch")?.value || ""; render(); }));
  }
  function setFilteredCount(total, shown) { const el = $("#filterCount"); if (el) el.textContent = shown === total ? `${fmt(total)} Einträge` : `${fmt(shown)} von ${fmt(total)} angezeigt`; }
  function filterCards(items, getText) {
    const q = listFilter.trim().toLocaleLowerCase("de-DE");
    return items.filter(item => !q || getText(item).toLocaleLowerCase("de-DE").includes(q));
  }
  function renderSpeciesList() {
    const areas = [{ value: "all", label: "Alle Bereiche" }, ...Object.entries(DATA.areas).map(([id, a]) => ({ value: id, label: a.name }))];
    const rars = [{ value: "all", label: "Alle Seltenheiten" }, ...DATA.rarities.map((r, i) => ({ value: i, label: r.name }))];
    const time = [{ value: "all", label: "Jede Tageszeit" }, { value: "b", label: "Tag und Nacht" }, { value: "d", label: "Nur tagsüber" }, { value: "n", label: "Nur nachts" }];
    const html = `${pageHead("Index", "Tonlinge", "Jede Art mit Fundorten, Frequenzbereich, Tageszeit und Seltenheit.", DATA.species.length)}${listToolbar({ filters: [{ id: "speciesArea", label: "Bereich", value: listScope, options: areas }, { id: "speciesRarity", label: "Seltenheit", value: $("#speciesRarity")?.value || "all", options: rars }, { id: "speciesTime", label: "Zeit", value: $("#speciesTime")?.value || "all", options: time }] })}<div class="card-grid" id="speciesGrid"></div>`;
    $("#content").innerHTML = html;
    const ra = $("#speciesRarity"), ti = $("#speciesTime"), ar = $("#speciesArea");
    const rarityValue = ra?.value || "all", timeValue = ti?.value || "all";
    const items = filterCards(DATA.species.filter(s => (listScope === "all" || String(s.a) === listScope) && (rarityValue === "all" || String(s.r) === rarityValue) && (timeValue === "all" || s.t === timeValue)), s => [s.n, area(s.a), ...(s.z || []).map(zone), rarity(s.r).name, s.id].join(" "));
    $("#speciesGrid").innerHTML = items.length ? items.map(s => `<a class="species-card" href="${href("species", s.id)}"><div class="species-card-art">${renderTonling(s)}</div><div class="species-card-body"><h3 class="rarity-name" style="--rarity:${esc(rarity(s.r).col)}">${esc(s.n)}</h3><div class="species-card-meta">${rarityPill(s.r)}${pill(area(s.a))}</div></div></a>`).join("") : `<div class="no-results">Kein Tonling passt zu diesen Filtern.</div>`;
    setFilteredCount(DATA.species.length, items.length); hydrateGameArt($("#speciesGrid"));
    $("#listSearch")?.addEventListener("input", e => { listFilter = e.target.value; renderSpeciesList(); const f = $("#listSearch"); f.focus(); f.setSelectionRange(f.value.length, f.value.length); });
    ar?.addEventListener("change", () => { listScope = ar.value; listFilter = $("#listSearch")?.value || ""; renderSpeciesList(); });
    ra?.addEventListener("change", () => { const v = ra.value; renderSpeciesList(); $("#speciesRarity").value = v; renderSpeciesList(); });
    ti?.addEventListener("change", () => { const v = ti.value; renderSpeciesList(); $("#speciesTime").value = v; renderSpeciesList(); });
  }

  function renderInstrumentList() {
    const items = filterCards(Object.entries(DATA.instruments), ([id, i]) => [id, i.name, i.info, i.tag, i.pas && DATA.instrumentPassives[i.pas], i.pas && DATA.instrumentPassivesSanktum[i.pas]?.d].join(" "));
    const html = `${pageHead("Ausrüstung", "Instrumente", "Ein Instrument begleitet jeden Fang. Vergleiche seine Klangwerte und besondere Fähigkeit.", Object.keys(DATA.instruments).length)}${listToolbar()}<div class="card-grid">${items.map(([id, i]) => `<a class="data-card instrument-card" href="${href("instrument",id)}"><div class="instrument-art">${gameIcon("icon",id)}</div><h3>${esc(i.name)}</h3><p>${esc(i.info||"")}</p><div class="article-pill-row">${pill(`${i.ear??0} Just.`,"#3e7887")}${pill(`${i.prec??0} Präz.`,"#3e7887")}${pill(`${i.luck??0} Glück`,"#a77b1c")}</div></a>`).join("") || `<div class="no-results">Keine passenden Instrumente gefunden.</div>`}</div>`;
    $("#content").innerHTML = html;
    setFilteredCount(Object.keys(DATA.instruments).length, items.length);
    $("#listSearch")?.addEventListener("input", e => { listFilter = e.target.value; renderInstrumentList(); $("#listSearch").focus(); });
  }

  function renderQuestList() {
    const ordered = questPairs().filter(([id,q]) => listScope === "all" || (listScope === "main" ? !!q.main : listScope === "sanktum" ? Number(q.rel || q.npc && DATA.npcs[q.npc]?.area) === 5 : !q.main && Number(q.rel || q.npc && DATA.npcs[q.npc]?.area) !== 5));
    const items = filterCards(ordered, ([id,q]) => [id,q.title,q.desc,q.offer,q.done,q.npc&&DATA.npcs[q.npc]?.n,q.parts?.map(p=>p.txt).join(" ")].join(" "));
    const selected = items[0]?.[0];
    const group = (label, main) => { const rows=items.filter(([,q])=>!!q.main===main);return `<section class="quest-log-group"><h2>${main?"✦":"▷"} ${label}<small>${rows.length}</small></h2>${rows.map(([id,q])=>`<div class="quest-log-row ${id===selected?"selected":""}"><button class="quest-log-select" data-quest-select="${esc(id)}"><span class="quest-log-mark">${main?"✦":"▷"}</span><span class="quest-log-name">${esc(q.title||id)}</span><span class="quest-log-level">${q.lvl?`Lv. ${q.lvl}`:""}</span></button><a class="quest-log-open" href="${href("quest",id)}" aria-label="${esc(q.title||id)} im Wiki öffnen">↗</a></div>`).join("")||`<p class="small-muted quest-empty">Keine Einträge</p>`}</section>`;};
    const questDetail = ([id,q]) => {const npc=npcById(q.npc),parts=q.parts?.length?q.parts:[{txt:q.desc||"Auftrag"}];return `<article class="quest-log-detail"><div class="quest-detail-kicker">${q.main?"Hauptquest":"Nebenquest"} · ${npc?`<a href="${href("npc",q.npc)}">${esc(npc.n)}</a>`:"Auftrag"}</div><h2>${esc(q.title||id)}</h2>${q.desc?`<p class="quest-detail-desc">${esc(q.desc)}</p>`:""}<h3>Ziele</h3><div class="quest-game-steps">${parts.map((p,i)=>`<div class="quest-game-step"><span class="step-number">${i+1}</span><span>${esc(p.txt||"Auftrag")}</span></div>`).join("")}</div><h3>Belohnungen</h3><div class="reward-line">${rewardChips(q).map((r,index)=>`<span class="reward">${esc(r)}</span>`).join("")||"<span class=\"small-muted\">Keine Belohnung</span>"}</div><a class="text-link" href="${href("quest",id)}">Quest im Wiki öffnen →</a></article>`;};
    const html = `${pageHead("Auftragsbuch", "Quests", "Das Questbuch: Hauptquests und Nebenquests in ihrer Reihenfolge, mit Zielen und Belohnungen.", Object.keys(DATA.quests).length)}${listToolbar({ filters: [{ id: "questScope", label: "Auftragstyp", value: listScope, options: [{ value: "all", label: "Alle Quests" }, { value: "main", label: "Hauptgeschichte" }, { value: "side", label: "Nebenquests" }, { value: "sanktum", label: "Sanktum Magus" }] }] })}<div class="quest-log-layout"><div class="quest-log-list">${group("Hauptquests",true)}${group("Nebenquests",false)}</div><div id="questLogDetail">${selected?questDetail(items.find(([id])=>id===selected)):"<p class=\"small-muted\">Keine passende Quest gefunden.</p>"}</div></div>`;
    $("#content").innerHTML = html;
    setFilteredCount(Object.keys(DATA.quests).length, items.length);
    $$("[data-quest-select]").forEach(button=>button.addEventListener("click",()=>{$$(".quest-log-row").forEach(x=>x.classList.toggle("selected",x===button.parentElement));const found=items.find(([id])=>id===button.dataset.questSelect);$("#questLogDetail").innerHTML=questDetail(found);linkifyContent($("#questLogDetail"));}));
    $("#listSearch")?.addEventListener("input", e => { listFilter = e.target.value; renderQuestList(); $("#listSearch").focus(); });
    $("#questScope")?.addEventListener("change", e => { listScope = e.target.value; listFilter = $("#listSearch")?.value || ""; renderQuestList(); });
  }

  function renderNpcPortrait(n) {
    const id = Object.keys(DATA.npcs).find(key => DATA.npcs[key] === n) || "";
    return `<canvas class="game-npc-render" data-art-kind="npc" data-art-id="${esc(id)}" aria-label="${esc(n.n)}"></canvas>`;
  }

  function renderNpcList() {
    const items = filterCards(Object.entries(DATA.npcs), ([id, n]) => [id, n.n, n.hi, area(n.area), n.l && DATA.layers[n.l]?.name, Object.entries(DATA.shops).find(([, s]) => s.items.some(i => i.id === id))?.[0]].join(" "));
    const html = `${pageHead("Begegnungen", "Figuren", "Bewohner, Händlerinnen und Händler sowie geheime Begegnungen aus den Figurendaten des Spiels.", Object.keys(DATA.npcs).length)}${listToolbar()}<div class="card-grid">${items.map(([id, n]) => `<a class="data-card npc-card" href="${href("npc",id)}"><div class="npc-portrait">${renderNpcPortrait(n)}</div><h3>${esc(n.n)}</h3><div class="article-pill-row">${pill(area(n.area))}${n.secret?pill("Geheim","#875aa5"):""}${n.shop?pill("Laden"):""}</div><p>${esc(n.hi||(n.secret?"Geheime Begegnung.":"Figur im Verzeichnis der Spielwelt."))}</p></a>`).join("") || `<div class="no-results">Keine passende Figur gefunden.</div>`}</div>`;
    $("#content").innerHTML = html;
    setFilteredCount(Object.keys(DATA.npcs).length, items.length); hydrateGameArt($("#content"));
    $("#listSearch")?.addEventListener("input", e => { listFilter = e.target.value; renderNpcList(); $("#listSearch").focus(); });
  }

  function renderItems() {
    const entries = allItems();
    const items = filterCards(entries, ([id, it]) => [id, it.n, it.kind, it.room, it.l && DATA.layers[it.l]?.name, it.effect].join(" "));
    const html = `${pageHead("Fundstücke", "Gegenstände", "Fundstücke, Questbelohnungen und Relikte. Öffne einen Eintrag für Fundort, Wirkung und verbundene Aufträge.", entries.length)}${listToolbar()}<div class="card-grid">${items.map(([id, it]) => `<a class="data-card item-card" href="${href("item",id)}"><div class="item-art">${gameIcon("icon",id)}</div><h3>${esc(it.n)}</h3><p>${esc(it.effect||(it.room?`Fundstück · ${DATA.layers[it.l]?.name||it.l}, Raum ${it.room}.`:it.l?`Fundstück · ${DATA.layers[it.l]?.name||it.l}.`:"Questfundstück"))}</p><div class="article-pill-row">${it.kind?pill(it.kind):""}</div></a>`).join("") || `<div class="no-results">Kein passender Gegenstand gefunden.</div>`}</div>`;
    $("#content").innerHTML = html;
    setFilteredCount(entries.length, items.length);
    $("#listSearch")?.addEventListener("input", e => { listFilter = e.target.value; renderItems(); $("#listSearch").focus(); });
  }

  function renderAreas() {
    const areaCards = Object.entries(DATA.areas).map(([id, a]) => {
      const species = DATA.species.filter(s => String(s.a) === String(id)).length;
      const subs = Object.entries(DATA.zones).filter(([, z]) => String(z.a) === String(id));
      const layers = Object.values(DATA.layers).filter(l => String(l.area) === String(id));
      return `<section class="detail-box anchor-target" id="area-${id}"><strong>${esc(a.name)}</strong><span>Bereich ${id} · ${species} verzeichnete Tonlinge · ${subs.length} Unterbereiche · ${layers.length} Kartenebenen</span><div class="article-pill-row" style="margin-top:9px">${subs.map(([key, z]) => `<a class="chip" href="${href("zone", key)}">${esc(z.n)}</a>`).join("")}</div><p><a class="text-link" href="${href("area", id)}">Bereichsartikel öffnen →</a> · <a class="text-link" href="#map">Karte ansehen →</a></p></section>`;
    }).join("");
    $("#content").innerHTML = `${pageHead("Weltführer", "Bereiche & Unterbereiche", "Die fünf Bereiche und alle im Weltcode verzeichneten Zonen. Namen und Zugehörigkeit werden direkt aus den Gebietstabellen gelesen.", Object.keys(DATA.zones).length)}<div class="callout"><h3>Die Welt auf einen Blick</h3><p>Vier Außenbereiche liegen auf der gefalteten Hauptkarte. Das Sanktum Magus nutzt zehn eigene Kartenebenen mit weiteren Hallen und Türmen. Wähle eine Ebene auf der <a class="link-card" href="#map">interaktiven Karte</a>.</p></div><div style="display:grid;gap:11px">${areaCards}</div>`;
  }

  function renderRarities() {
    const rows = DATA.rarities.map((r, i) => `<tr><td><span class="rarity-dot" style="--rarity:${esc(r.col)}"></span>${esc(r.name)}</td><td>${esc(r.id)}</td><td>${r.w === undefined ? "–" : fmt(r.w)}</td><td>${fmt(r.xp)}</td><td>${fmt(r.val)} Noten</td><td>${DATA.species.filter(s => s.r === i).length}</td></tr>`).join("");
    $("#content").innerHTML = `${pageHead("Indexwissen", "Seltenheiten", "Die Seltenheitsstufen legen Farbe, Basiswerte für Erfahrung und Verkaufswert sowie den Fangpool fest.", DATA.rarities.length)}<div class="notice"><span class="notice-icon">✧</span><div><strong>Spawn-Gewichte sind keine Fanggarantie</strong><p>Die Zahl aus der Datentabelle ist ein relatives Gewicht. Gebiet, Glückswert, Tonling-Pool und Spielmechaniken verändern die Auswahl. Sie lässt sich daher nicht als feste Einzelchance lesen.</p></div></div><div class="table-wrap"><table><thead><tr><th>Stufe</th><th>Kürzel</th><th>Relatives Gewicht</th><th>Basis-EP</th><th>Basiswert</th><th>Arten</th></tr></thead><tbody>${rows}</tbody></table></div><h2>Einträge nach Seltenheit</h2><div class="chip-row">${DATA.rarities.map((r,i)=>`<a class="chip" href="${href("rarity",i)}"><span class="chip-dot" style="background:${esc(r.col)}"></span>${esc(r.name)} <small>${DATA.species.filter(s=>s.r===i).length}</small></a>`).join("")}</div>`;
  }

  function renderMutations() {
    const rows = DATA.mutations.map(m => {
      const species = DATA.species.filter(s => (DATA.quests && s.mut === m.id));
      const inst = m.ins && DATA.instruments[m.ins];
      const base = m.p ? `${fmt(m.p * 100)} % Grundchance` : m.ip ? `${fmt(m.ip * 100)} % mit ${inst?.name || m.ins}` : "Keine allgemeine Zufallschance eingetragen";
      const effect = m.ins ? `An das Instrument ${inst?.name || m.ins} gebunden.` : "Allgemeiner Mutationspool.";
      return `<a class="data-card" href="${href("mutation",m.id)}"><div class="home-card-top"><span style="color:${esc(m.col)}">✳</span>${m.mul ? `<span class="home-card-count">×${fmt(m.mul)} Wert</span>` : ""}</div><h3>${esc(m.name)}</h3><p>${esc(base)} · ${esc(effect)}</p></a>`;
    }).join("");
    $("#content").innerHTML = `${pageHead("Besondere Fänge", "Mutationen", "Veränderte Tonlinge tragen einen eigenen Namen, Farbton und Wertmultiplikator. Manche werden nur von bestimmten Instrumenten ausgelöst.", DATA.mutations.length)}<div class="notice"><span class="notice-icon">✳</span><div><strong>Chance und Instrumenteffekt auseinanderhalten</strong><p>Nur Mutationen mit einem allgemeinen p-Wert haben eine allgemeine Grundchance. Für instrumentgebundene Einträge nennt der Code stattdessen ip. Verzauberungen und Instrumentpassive können weitere Modifikatoren anwenden.</p></div></div><div class="card-grid">${rows}</div>`;
  }

  function renderEnchantmentList() {
    const entries = Object.entries(DATA.enchantments);
    const html = `${pageHead("Echoaltar", "Verzauberungen", "Jede Verzauberung verändert ein Instrument. Eine neue Verzauberung ersetzt die bisherige auf diesem Instrument.", entries.length)}<div class="card-grid">${entries.map(([id,e]) => cardLink("enchantment",id,e.n,e.d,[e.add ? Object.entries(e.add).map(([k,v])=>pill(`${({ear:"Justierung",prec:"Präzision",harm:"Harmonie",luck:"Glück",beat:"Takt"})[k]||k} ${v>0?"+":""}${v}`)).join("") : e.mul ? pill(`×${e.mul} Werte`) : pill("Spezialeffekt")],e.col)).join("")}</div>`;
    $("#content").innerHTML = html;
  }

  function renderTitles() {
    const cats = [...new Set(DATA.titles.map(t => t.cat))];
    const names = { fang:"Fänge",lvl:"Level",sel:"Seltenheit",mut:"Mutationen",perf:"Perfekte Würfe & Fänge",quest:"Quests",instr:"Instrumente",index:"Gebiete & Index",gold:"Noten & Handel",ent:"Entdeckungen",bes:"Besonderes" };
    const html = DATA.titles.filter(t => !listFilter || `${t.name} ${t.description} ${names[t.cat]||t.cat}`.toLocaleLowerCase("de-DE").includes(listFilter.toLocaleLowerCase("de-DE"))).map(t=>`<a class="data-card title-card" href="${href("title",t.id)}"><div class="home-card-top"><span>♛</span><span class="home-card-count">${esc(names[t.cat]||t.cat)}</span></div><div class="title-card-preview">${gameIcon("title",t.id)}</div><h3 class="title-gradient" style="--title-gradient:${(t.gradient||["#a77b1c"]).map(esc).join(",")};--title-tier:${t.tier}">${esc(t.name)}</h3><p>${esc(t.description)}</p><span class="mini-tag" style="margin-top:8px">Stufe ${t.tier}</span></a>`).join("");
    $("#content").innerHTML = `${pageHead("Namensschilder", "Titel", "Titel werden durch Fortschritt freigeschaltet und zeigen über dem Spielfigurennamen eine farbige Auszeichnung.", DATA.titles.length)}${listToolbar()}<div class="card-grid">${html || `<div class="no-results">Kein passender Titel gefunden.</div>`}</div>`;
    setFilteredCount(DATA.titles.length, DATA.titles.filter(t => !listFilter || `${t.name} ${t.description}`.toLocaleLowerCase("de-DE").includes(listFilter.toLocaleLowerCase("de-DE"))).length);
    $("#listSearch")?.addEventListener("input", e=>{listFilter=e.target.value;renderTitles();$("#listSearch").focus()});
  }

  function renderMechanics() {
    const cards = [
      ["Ein Fang hat drei Abschnitte", "Ring · Frequenz · Zone", "Zuerst wird der Ring am Taktpunkt getroffen. Danach wird die Frequenz des gehörten Tonlings abgestimmt. Im letzten Abschnitt hältst du ihn mit der Eingabe in der beweglichen Fangzone. Das Instrument beeinflusst die Fenster und den Schwierigkeitsgrad."],
      ["Der Ring", "Takt", "Ein Treffer am markierten Punkt zählt als perfekt. Die Takt-Eigenschaft vergrößert das Zeitfenster. Ein Fehlschlag beendet diesen Versuch; du kannst erneut spielen."],
      ["Frequenz finden", "Justierung", "Die Justierung des Instruments erleichtert das Einrasten der Ziel-Frequenz. Der Fangcode nutzt eine einheitliche Skala und berücksichtigt die Seltenheitsstufe des Tonlings."],
      ["Den Ton halten", "Präzision · Harmonie", "Präzision verbreitert die Fangzone. Harmonie beruhigt den Tonling: Er entkommt langsamer und Fortschritt geht außerhalb der Zone langsamer verloren. Bereich und Tonlingstempo wirken ebenfalls mit."],
      ["Erfahrung und Stufen", "Fortschritt", "Fänge und Quests geben Erfahrung. Die benötigte Erfahrung pro Level folgt der Funktion im Spielcode. Quest-EP können im Sanktum-Code angepasst worden sein; die Questseiten zeigen den resultierenden Wert."],
      ["Instrument-Meisterschaft", "Bis Stufe 8", "Fänge mit dem ausgerüsteten Instrument sammeln Meisterschaftserfahrung. Jede Meisterschaftsstufe erhöht alle fünf Instrumentwerte um 1. Der Bedarf wächst mit jeder Stufe."],
      ["Seltenheit und Glück", "Fundchance", "Das Glück des Instruments beeinflusst, wie seltene Arten erscheinen. Gebiete können Gewichte zusätzlich ändern; der Fangcode zieht Arten aus dem Pool, der für Ort und Tageszeit passt."],
      ["Mutationen und Verkauf", "Besondere Varianten", "Mutationen verändern den Verkaufswert mit ihrem jeweiligen Multiplikator. Der Mutationswurf berücksichtigt die eingesetzte Ausrüstung, Passivfähigkeiten und Verzauberungen."],
      ["Tag und Nacht", "Spieluhr", "Ein vollständiger Spieltag dauert 600 Sekunden. Die Nacht reicht von 20 bis 6 Uhr und dauert 250 Sekunden. Arten können beide Tageszeiten, nur Tag oder nur Nacht in ihren Daten haben."],
      ["Noten und Handel", "Währung", "Noten sind die Spielwährung. Basiswerte hängen von der Seltenheit ab; Gebiete und Instrumentfähigkeiten können den Verkaufserlös verändern. Händler zeigen ihre Anforderungen und Preise in der Instrumentübersicht."],
      ["Geheime Räume", "Verborgene Wände", "Der Weltcode markiert sechs geheime Zugänge. Mehrere Aufgaben verweisen auf nächtliche oder versteckte Wege. Die Positionen und Bedingungen sind im Welt- und Questcode dokumentiert."],
      ["Verzauberungen", "Echoaltar", "Am Altar in Bereich 3 lassen sich Instrumente verzaubern; ein Echosplitter dient als Relikt. Der Verzauberungskatalog erklärt die zehn Effekte. Eine neue Verzauberung ersetzt die bisherige auf dem Instrument."]
    ];
    $("#content").innerHTML = `${pageHead("Spielhandbuch", "Spielmechaniken", "Die Abläufe und Regeln lassen sich aus dem Fangcode, den Datentabellen und den Hinweisen im Spiel ablesen.", cards.length)}<div class="notice"><span class="notice-icon">⚙</span><div><strong>Instrumentwerte in Kürze</strong><p>Justierung hilft beim Frequenzteil. Präzision macht die Fangzone größer. Harmonie bremst den Tonling. Glück beeinflusst die Seltenheitsauswahl. Takt erweitert das Ringfenster.</p></div></div><div class="detail-grid">${cards.map(([title,tag,text])=>`<section class="detail-box"><strong>${esc(title)}</strong><span class="mini-tag">${esc(tag)}</span><p>${esc(text)}</p></section>`).join("")}</div><h2>Fundorte durch die Karte finden</h2><p>Die Karte verwendet die Kachel- und Zonenmatrizen aus dem Weltcode. Wähle eine Ebene, bewege den Mauszeiger über ein Feld und klicke auf eine Zone, um ihren Artikel zu öffnen. Mit dem Mausrad zoomst du, mit Ziehen verschiebst du die Ansicht.</p><p>Weiterlesen: <a class="link-card" href="#map">Karte & Kacheln</a> · <a class="link-card" href="#enchantments">Verzauberungen</a> · <a class="link-card" href="#rarities">Seltenheiten</a> · <a class="link-card" href="#updates">Datenstand</a>.</p>`;
  }

  function renderUpdates() {
    $("#content").innerHTML = `${pageHead("Chronik", "Updates & Datenstand", "Ein verlässliches Änderungsprotokoll kann nur aus versionierten Einträgen erstellt werden.")}<div class="notice"><span class="notice-icon">◷</span><div><strong>Im lokalen Projekt ist keine Update-Chronik hinterlegt</strong><p>Die vorhandenen Dateien enthalten den aktuellen Spielzustand, aber keine datierte Liste früherer Versionen oder Patchnotes. Deshalb nennt das Wiki keine Update-Daten und erfindet keine Versionsgeschichte.</p></div></div><h2>Was diese Ausgabe ausliest</h2><div class="table-wrap"><table><tbody><tr><th>Spieldateien</th><td>Tonling-, Seltenheits-, Mutations- und Instrumentdaten, Quest- und NPC-Tabellen, Storytexte sowie Welt- und Sanktumkarten.</td></tr><tr><th>Abgeleitete Einträge</th><td>${DATA.species.length} Tonlinge · ${Object.keys(DATA.instruments).length} Instrumente · ${Object.keys(DATA.quests).length} Quests · ${Object.keys(DATA.npcs).length} Figuren · ${Object.keys(DATA.zones).length} Unterbereiche · ${DATA.titles.length} Titel</td></tr><tr><th>Kartenebenen</th><td>${Object.values(DATA.layers).map(l=>l.name).join(", ")}</td></tr><tr><th>Schriftarten</th><td>Caveat Brush und Patrick Hand aus der im Spiel eingebetteten Schriftdefinition.</td></tr><tr><th>Quellhinweis</th><td>Das Wiki verwendet lokale Projektdaten aus <span class="mono">src/</span>. Wo die Quelle keine Zahl oder Beschreibung enthält, zeigt es das als unbekannt oder weglässt es.</td></tr></tbody></table></div><div class="callout"><h3>Für spätere Pflege</h3><p>Wenn das Spiel künftig eine datierte Update-Liste bekommt, lässt sie sich hier chronologisch mit Änderungen an Gebieten, Arten, Instrumenten und Quests ergänzen. Die aktuelle Ausgabe ist für ein Cloudflare-Workers-Deployment als statischer Unterordner vorbereitet.</p></div>`;
  }

  function relatedSpeciesForZone(id) { return DATA.species.filter(s => (s.z || []).includes(id)); }
  function spawnOdds(id,instrument,ench,time){
    const z=DATA.zones[id],pool=relatedSpeciesForZone(id).filter(s=>s.a===z.a&&(s.t==="b"||(s.t==="n")===(time==="n")));
    if(!pool.length)return [];
    const i=DATA.instruments[instrument]||{},e=DATA.enchantments[ench],base=Number(i.luck||0)+Number(e?.add?.luck||0),luck=Math.round((e?.mul?base*e.mul:base)*10)/10/100;
    const counts={};pool.forEach(s=>counts[s.r]=(counts[s.r]||0)+1);
    const weights=pool.map(s=>{const rarityData=DATA.rarities[s.r],areaData=DATA.areas[z.a],relative=Number(rarityData.w||0)*Number(areaData.rm?.[s.r]||1)*(s.r>=2?1+luck*s.r*.9:1-luck*.3);return relative/Math.max(1,counts[s.r]);});
    const total=weights.reduce((a,b)=>a+b,0);
    return pool.map((s,index)=>({species:s,chance:total>0?weights[index]/total:0})).sort((a,b)=>b.chance-a.chance);
  }
  function renderSpawnOdds(id){
    const instrs=Object.entries(DATA.instruments),enchs=Object.entries(DATA.enchantments);
    return `<section class="spawn-odds" id="spawnOdds"><div class="section-heading"><div><h2>Fundchancen in ${esc(DATA.zones[id]?.n||id)}</h2><p>Wähle Ausrüstung und Tageszeit, um die Fangchance jeder Art pro Auswahl zu berechnen.</p></div></div><div class="spawn-odds-controls"><label>Instrument<select id="oddsInstrument">${instrs.map(([key,x])=>`<option value="${esc(key)}">${esc(x.name)}</option>`).join("")}</select></label><label>Verzauberung<select id="oddsEnchantment"><option value="">Keine</option>${enchs.map(([key,x])=>`<option value="${esc(key)}">${esc(x.n)}</option>`).join("")}</select></label><label>Tageszeit<select id="oddsTime"><option value="d">Tag</option><option value="n">Nacht</option></select></label></div><p class="small-muted">Pro Auswahl nach den ersten drei Fängen. Die Tabelle zeigt den ersten Wurf; ein perfekter Ring kann im Spiel einen zweiten Wurf auslösen.</p><div class="table-wrap"><table><thead><tr><th>Tonling</th><th>Seltenheit</th><th>Chance pro Wurf</th><th>Instrument</th><th>Verzauberung</th><th>Zeit</th></tr></thead><tbody id="spawnOddsRows"></tbody></table></div></section>`;
  }
  function bindSpawnOdds(id){
    const rows=$("#spawnOddsRows");if(!rows)return;
    const update=()=>{const instrument=$("#oddsInstrument").value,ench=$("#oddsEnchantment").value,time=$("#oddsTime").value;const odds=spawnOdds(id,instrument,ench,time);rows.innerHTML=odds.length?odds.map(({species,chance})=>`<tr><td><a class="rarity-name" style="--rarity:${esc(rarity(species.r).col)}" href="${href("species",species.id)}">${esc(species.n)}</a></td><td>${rarityPill(species.r)}</td><td>${(chance*100).toLocaleString("de-DE",{maximumFractionDigits:4})} %</td><td>${esc(instrById(instrument)?.name||instrument)}</td><td>${ench?esc(DATA.enchantments[ench]?.n||ench):"Keine"}</td><td>${time==="n"?"Nacht":"Tag"}</td></tr>`).join(""):`<tr><td colspan="6">Zu dieser Tageszeit erscheinen hier keine Tonlinge.</td></tr>`;};
    ["oddsInstrument","oddsEnchantment","oddsTime"].forEach(id=>$("#"+id).addEventListener("change",update));update();
  }
  function renderAreaArticle(id) {
    const a = DATA.areas[id]; if (!a) return missingArticle();
    const subs = Object.entries(DATA.zones).filter(([, z]) => String(z.a) === String(id));
    const species = DATA.species.filter(s => String(s.a) === String(id));
    const layers = Object.values(DATA.layers).filter(l => String(l.area) === String(id));
    const factors = [a.xpMul !== undefined ? `EP-Multiplikator ×${a.xpMul}` : "", a.valMul !== undefined ? `Noten-Multiplikator ×${a.valMul}` : "", a.wild ? `Wildheit ${a.wild}` : ""].filter(Boolean);
    return articleFrame("Bereich", a.name, `${species.length} Tonlinge und ${subs.length} verzeichnete Unterbereiche`, `<p>Der Spielcode führt <b>${esc(a.name)}</b> als Bereich ${esc(id)}. Die folgenden Namen und Verknüpfungen stammen aus den Bereichs-, Zonen- und Artentabellen.</p><h2>Unterbereiche</h2><div class="chip-row">${subs.map(([key,z])=>`<a class="chip" href="${href("zone",key)}">${esc(z.n)}</a>`).join("")}</div><h2>Bereichswerte aus dem Spielcode</h2><div class="detail-grid">${factors.map(f=>`<div class="detail-box"><strong>${esc(f)}</strong><span>Wert in der Bereichstabelle</span></div>`).join("")||`<p>Für diesen Bereich ist kein Multiplikator in der allgemeinen Bereichstabelle eingetragen.</p>`}</div><h2>Kartenebenen</h2><p>${layers.map(l=>`<a class="chip" href="#map" data-map-layer="${esc(l.id)}">${esc(l.name)}</a>`).join(" ")||"Keine eigene Kartenebene in der Ebene-Tabelle."}</p><h2>Tonlinge dieses Bereichs</h2><div class="chip-row">${species.slice(0,28).map(s=>`<a class="chip" href="${href("species",s.id)}">${esc(s.n)}</a>`).join("")}${species.length>28?`<a class="chip" href="#tonlinge">Alle ${species.length} im Index →</a>`:""}</div><p><a class="text-link" href="#map">Bereich in der Weltkarte ansehen →</a></p>`, [["Gebiet",a.name],["Tonlinge",species.length],["Unterbereiche",subs.length],["Kartenebenen",layers.length]]);
  }
  function renderZoneArticle(id) {
    const z = DATA.zones[id]; if (!z) return missingArticle();
    const species = relatedSpeciesForZone(id);
    const npcs = Object.entries(DATA.npcs).filter(([,n]) => n.area === z.a);
    return articleFrame("Unterbereich", z.n, `Teil von ${area(z.a)}`, `<p><b>${esc(z.n)}</b> liegt im Bereich <a class="link-card" href="${href("area",z.a)}">${esc(area(z.a))}</a>.</p><div class="article-pill-row"><span class="mini-tag" style="--rarity:${esc(z.col)}">${esc(z.col)}</span><span class="mini-tag" style="--rarity:${esc(z.col2)}">${esc(z.col2)}</span></div><h2>Tonlinge hier</h2><div class="chip-row">${species.map(s=>`<a class="chip" href="${href("species",s.id)}"><span class="chip-dot" style="background:${esc(rarity(s.r).col)}"></span>${esc(s.n)}</a>`).join("")||"<p>Keine Tonlinge in diesem Unterbereich.</p>"}</div>${renderSpawnOdds(id)}<h2>Karte</h2><p><a class="button" href="#map" data-map-zone="${esc(id)}">Auf der Weltkarte ansehen ↗</a></p>`, [["Bereich",area(z.a)],["Arten",species.length],["Zonenschlüssel",id]]);
  }

  function articleFrame(type, title, subtitle, body, facts = [], art = "") {
    const side = `<aside class="article-side">${art ? `<div class="article-art">${art}</div>` : ""}<h3>Feldnotizen</h3><dl>${facts.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl></aside>`;
    return `<a class="crumb-back" href="#${type === "Tonling" ? "tonlinge" : type === "Instrument" ? "instruments" : type === "Quest" ? "quests" : type === "Figur" ? "npcs" : type === "Gegenstand" ? "items" : type === "Mutation" ? "mutations" : type === "Verzauberung" ? "enchantments" : type === "Titel" ? "titles" : type === "Seltenheit" ? "rarities" : type === "Unterbereich" || type === "Bereich" ? "areas" : "home"}">← Zur Übersicht</a><div class="article-layout"><article class="article-main"><div class="eyebrow">${esc(type)}</div><h1 class="page-title">${esc(title)}</h1><div class="article-kicker">${esc(subtitle)}</div>${body}</article>${side}</div>`;
  }
  function missingArticle() { return `<div class="notice"><span class="notice-icon">?</span><div><strong>Dieser Eintrag ist im aktuellen Datenstand nicht vorhanden</strong><p>Wähle eine Kategorie aus dem Feldbuch.</p></div></div><a class="button" href="#home">Zur Übersicht</a>`; }

  function renderSpeciesArticle(id) {
    const s = speciesById(id); if (!s) return missingArticle();
    const zones = (s.z || []).map(zone);
    const when = ({ b:"Tag und Nacht", d:"Tag", n:"Nacht" })[s.t] || "Keine Tageszeit verzeichnet";
    const mlist = DATA.mutations.filter(m => m.ins && m.ins === s.id);
    const art = `<div class="article-hero-art">${renderTonling(s)}</div>`;
    const body = `<div class="article-hero"><div class="article-hero-art">${renderTonling(s)}</div><div><div class="article-pill-row">${rarityPill(s.r)}${pill(area(s.a))}</div><p>${s.x === "glow" ? "Die Art ist in ihren Erscheinungsdaten als leuchtend markiert." : ""}${s.mark ? ` Das Aussehen führt außerdem das Muster „${esc(s.mark)}“.` : ""}</p></div></div><p><b>${esc(s.n)}</b> lebt im Bereich <a class="link-card" href="${href("area",s.a)}">${esc(area(s.a))}</a> verzeichnet. Hier findest du Fundorte, Fangprofil und Erscheinung.</p><h2>Fundorte</h2><div class="chip-row">${(s.z||[]).map(zid=>`<a class="chip" href="${href("zone",zid)}">⌖ ${esc(zone(zid))}</a>`).join("")||'<span class="small-muted">Kein Fundort hinterlegt.</span>'}</div><h2>Fangprofil</h2><div class="detail-grid"><div class="detail-box"><strong>${esc(when)}</strong><span>Verfügbarkeit nach Tageszeit</span></div><div class="detail-box"><strong>${s.hz ? `${s.hz[0]}–${s.hz[1]}` : "–"}</strong><span>Frequenzbereich</span></div><div class="detail-box"><strong>${s.spd ?? "–"}</strong><span>Fanggeschwindigkeit</span></div><div class="detail-box"><strong>${esc(rarity(s.r).name)}</strong><span>Seltenheitsstufe und Fangwert siehe Seltenheiten</span></div></div><h2>Erscheinung</h2><p>Die Spieldaten enthalten für diese Art die Körperfarbe <span class="mono">${esc(s.body || "nicht separat eingetragen")}</span>, die Kappenfarbe <span class="mono">${esc(s.capc || "nicht separat eingetragen")}</span>${s.cap ? ` und die Kappenform „${esc(s.cap)}“` : ""}. Diese Abbildung wird vom originalen Spielrenderer mit denselben Formen, Farben und Seltenheitseffekten wie im Spiel gezeichnet.</p>${s.r >= 5 ? `<div class="callout"><h3>Besondere Seltenheit</h3><p>Diese Art gehört zur Seltenheitsstufe ${esc(rarity(s.r).name)}. Die <a class="link-card" href="#rarities">Seltenheiten-Seite</a> erklärt die Basiswerte und die Grenzen von Spawn-Gewichten.</p></div>` : ""}${mlist.length?`<h2>Mit bestimmten Instrumenten verbundene Mutationen</h2><div class="chip-row">${mlist.map(m=>`<a class="chip" href="${href("mutation",m.id)}">${esc(m.name)}</a>`).join("")}</div>`:""}`;
    return articleFrame("Tonling", s.n, `${area(s.a)} · ${rarity(s.r).name}`, body, [["Bereich",area(s.a)],["Seltenheit",rarity(s.r).name],["Tageszeit",when],["Fundorte",zones.join(", ")||"–"],["Frequenz",s.hz ? `${s.hz[0]}–${s.hz[1]}` : "–"]], art);
  }

  function getInstrumentUnlocks(id) {
    const unlocks = [];
    for (const [shopId, shop] of Object.entries(DATA.shops)) {
      const item = shop.items.find(x => x.id === id);
      if (item) unlocks.push(`${shop.name}: ${fmt(item.price)} Noten, Stufe ${item.lvl}`);
    }
    for (const [qid, q] of questPairs()) if (q.rew?.instr === id) unlocks.push(`Belohnung der Quest „${q.title || qid}“`);
    return unlocks;
  }
  function renderInstrumentArticle(id) {
    const i = instrById(id); if (!i) return missingArticle();
    const stats = i;
    const labels = { ear:"Justierung",prec:"Präzision",harm:"Harmonie",luck:"Glück",beat:"Takt" };
    const descriptions = { ear:"Erleichtert das Einrasten der Zielfrequenz.",prec:"Vergrößert die bewegliche Fangzone.",harm:"Verlangsamt Flucht und Fortschrittsverlust.",luck:"Begünstigt seltenere Arten.",beat:"Vergrößert das Zeitfenster am Ring." };
    const max = 74;
    const bars = Object.entries(labels).map(([k,n])=>`<div class="stat-bar"><span>${n}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100,(stats[k]||0)/max*100)}%"></div></div><b>${stats[k]??0}</b></div>`).join("");
    const pass = i.pas && (DATA.instrumentPassives[i.pas] || DATA.instrumentPassivesSanktum[i.pas]?.d);
    const unlocks = getInstrumentUnlocks(id);
    const own = DATA.mutations.filter(m=>m.ins===id);
    const body = `<p>${esc(i.info || "Für dieses Instrument ist kein Begleittext im Datensatz hinterlegt.")}</p><h2>Klangwerte</h2><div class="stat-bars">${bars}</div><div class="small-muted">Die Werte zeigen das Instrument auf Meisterschaftsstufe 0 ohne Verzauberung. ${Object.values(descriptions).join(" ")}</div><h2>Besondere Fähigkeit</h2><div class="detail-box"><strong>${pass ? esc(i.pas || "Passiv") : "Keine zusätzliche Fähigkeit verzeichnet"}</strong><span>${esc(pass || "In der Instrumenttabelle ist keine Passivfähigkeit eingetragen.")}</span></div><h2>So erhältst du es</h2><div class="chip-row">${unlocks.map(x=>`<span class="chip">${esc(x)}</span>`).join("")||`<span class="small-muted">Im Quellcode ist kein Shop- oder Questbelohnungs-Eintrag für dieses Instrument angegeben.</span>`}</div>${own.length?`<h2>Instrumentgebundene Mutation</h2><div class="chip-row">${own.map(m=>`<a class="chip" href="${href("mutation",m.id)}">${esc(m.name)} · ${fmt(m.ip*100)} %</a>`).join("")}</div>`:""}<h2>Meisterschaft</h2><p>Instrumente sammeln beim Fangen Erfahrung und steigen bis Stufe 8 auf. Jede Stufe gibt +1 auf alle fünf Werte. Siehe auch <a class="link-card" href="#mechanics">Spielmechaniken</a>.</p><h2>Passende Quests</h2><div class="chip-row">${questPairs().filter(([,q])=>q.rew?.instr===id).map(([qid,q])=>`<a class="chip" href="${href("quest",qid)}">${esc(q.title)}</a>`).join("")||"<span class=\"small-muted\">Keine Questbelohnung verzeichnet.</span>"}</div>`;
    return articleFrame("Instrument",i.name,`Instrument · ${i.kind||"Klangwerkzeug"}`,body,[["Justierung",stats.ear??0],["Präzision",stats.prec??0],["Harmonie",stats.harm??0],["Glück",stats.luck??0],["Takt",stats.beat??0],["Meisterschaft","bis Stufe 8"]],`<div class="article-icon-preview">${gameIcon("icon",id)}</div>`);
  }

  function rewardChips(q) {
    const r=q.rew||{}, out=[];
    if(r.xp)out.push(`+${fmt(r.xp)} EP`);if(r.gold)out.push(`+${fmt(r.gold)} Noten`);
    if(r.instr)out.push(`Instrument: ${instrById(r.instr)?.name||r.instr}`);if(r.item)out.push(`Gegenstand: ${DATA.items[r.item]?.n||r.item}`);
    if(r.title)out.push(`Titel: ${r.title}`);
    return out;
  }
  function questFilterText(f) {
    if(!f||!Object.keys(f).length)return "";
    const parts=[];
    if(f.r!==undefined)parts.push(`Seltenheit mindestens ${rarity(f.r).name}`);
    if(f.a!==undefined)parts.push(area(f.a));
    if(f.sp)parts.push(`Art: ${speciesById(f.sp)?.n||f.sp}`);
    if(f.mut){const m=DATA.mutations.find(x=>x.id===f.mut);parts.push(`Mutation: ${m?.name||f.mut}`);}
    if(f.night)parts.push("nachts");
    if(f.day)parts.push("tagsüber");
    if(f.pc)parts.push("perfekter Fang");
    if(f.perf)parts.push("perfekter Fang");
    if(f.idx)parts.push("Index-Fortschritt");
    const known=["r","a","sp","mut","night","day","pc","perf","idx"];
    const other=Object.fromEntries(Object.entries(f).filter(([k])=>!known.includes(k)));
    if(Object.keys(other).length)parts.push(`Zusatzfilter ${JSON.stringify(other)}`);
    return parts.length?`Filter: ${parts.join(" · ")}`:"";
  }
  function renderQuestArticle(id) {
    const q=DATA.quests[id];if(!q)return missingArticle();
    const npc=npcById(q.npc), follow=questPairs().filter(([,x])=>x.after===id), prev=q.after&&DATA.quests[q.after];
    const steps=q.parts?.length?q.parts:[{txt:q.desc||"Für diesen Auftrag ist keine ausführliche Beschreibung gespeichert."}];
    const dialogue=DATA.questDialogues?.[id]||{};
    const dialogueLabels={locked:"Gesperrt",offer:"Annahme",remind:"Erinnerung",done:"Abschluss"};
    const dialogueHtml=Object.entries(dialogue).map(([key,value])=>`<div class="detail-box"><strong>${esc(dialogueLabels[key]||key)}</strong>${dialogueLines(value)}</div>`).join("");
    const body=`<p>${esc(q.desc||"Für diese Aufgabe ist kein Beschreibungstext im Datensatz hinterlegt.")}</p><h2>Auftrag</h2><div class="detail-grid"><div class="detail-box"><strong>Auftraggeber</strong><span>${npc?`<a class="link-card" href="${href("npc",q.npc)}">${esc(npc.n)}</a>`:esc(q.npc||"Nicht angegeben")}</span></div><div class="detail-box"><strong>Empfohlene Stufe ${q.lvl||"–"}</strong><span>Die Spieltabellen führen diesen Levelwert bei der Aufgabe.</span></div>${q.main?`<div class="detail-box"><strong>Hauptgeschichte</strong><span>Diese Aufgabe ist als Hauptquest markiert.</span></div>`:""}${q.after?`<div class="detail-box"><strong>Voraussetzung</strong><span><a class="link-card" href="${href("quest",q.after)}">${esc(prev?.title||q.after)}</a></span></div>`:""}</div><h2>Ziele</h2>${steps.map((p,i)=>`<div class="quest-step"><span class="step-number">${i+1}</span><div class="step-copy"><p>${esc(p.txt||"Ziel im Questcode ohne Beschreibung")}</p>${p.f?`<small>${esc(questFilterText(p.f))}</small>`:""}</div></div>`).join("")}<h2>Belohnung</h2><div class="reward-line">${rewardChips(q).map(x=>`<span class="reward">${esc(x)}</span>`).join("")||"<span class=\"small-muted\">Keine Belohnung im Datensatz hinterlegt.</span>"}</div>${dialogueHtml?`<h2>Dialog im Spiel</h2><div class="detail-grid">${dialogueHtml}</div>`:`${q.offer?`<h2>Einleitung</h2><div class="callout"><p>„${esc(q.offer)}“</p></div>`:""}${q.done?`<h2>Abschluss</h2><p>„${esc(q.done)}“</p>`:""}`}${prev||follow.length?`<h2>Questfolge</h2><div class="chip-row">${prev?`<a class="chip" href="${href("quest",q.after)}">← ${esc(prev.title||q.after)}</a>`:""}${follow.map(([next,x])=>`<a class="chip" href="${href("quest",next)}">Weiter: ${esc(x.title||next)} →</a>`).join("")}</div>`:""}`;
    return articleFrame("Quest",q.title||id,`${q.main?"Hauptgeschichte · ":""}Stufe ${q.lvl||"–"}`,body,[["Quest-ID",id],["Auftraggeber",npc?.n||q.npc||"–"],["Stufe",q.lvl||"–"],["Ziele",steps.length],["Belohnung",rewardChips(q).join(", ")||"–"]]);
  }

  function npcCoordinates(n) {
    if(!n)return null;
    const layer=n.l||"main";
    let x=n.x??0,y=n.y??0;
    if(layer==="main" && y>=112){x=159-x;y=223-y;}
    return {layer,x,y};
  }
  function dialogueLines(value) {
    const lines=Array.isArray(value)?value:[value];
    return lines.filter(x=>typeof x==="string").map(x=>`<p>„${esc(x)}“</p>`).join("");
  }
  function renderNpcArticle(id) {
    const n=npcById(id);if(!n)return missingArticle();
    const qs=questPairs().filter(([,q])=>q.npc===id);
    const shop=n.shop&&DATA.shops[n.shop];const pos=npcCoordinates(n);
    const greetings=DATA.greetings?.[id],story=DATA.stories?.[id]||[];
    const greetingHtml=greetings?`<h2>Begrüßungen</h2><div class="detail-grid">${greetings.d?.length?`<div class="detail-box"><strong>Tag</strong>${dialogueLines(greetings.d)}</div>`:""}${greetings.n?.length?`<div class="detail-box"><strong>Nacht</strong>${dialogueLines(greetings.n)}</div>`:""}</div>`:"";
    const storyHtml=story.length?`<h2>Geschichte</h2><p>Die Einträge unten stammen aus der Story-Tabelle. Das jeweilige Kürzel ist der im Spielcode gespeicherte Abschnittsschlüssel.</p>${story.map(row=>`<details class="story-entry"><summary>Abschnitt <span class="mono">${esc(row.w||"–")}</span></summary>${dialogueLines(row.p||[])}</details>`).join("")}`:"";
    const body=`${n.hi?`<p>${esc(n.hi)}</p>`:""}<h2>Begegnung</h2><div class="detail-grid"><div class="detail-box"><strong>${esc(area(n.area))}</strong><span>Im Figurenverzeichnis zugeordneter Bereich</span></div><div class="detail-box"><strong>${n.secret?"Geheime Figur":"Figur"}</strong><span>${n.secret?"Der Spielcode kennzeichnet diese Begegnung als geheim.":"Keine Geheim-Markierung im Figurenverzeichnis."}</span></div></div>${shop?`<h2>${esc(shop.name)}</h2><div class="table-wrap"><table><thead><tr><th>Instrument</th><th>Preis</th><th>Stufe</th></tr></thead><tbody>${shop.items.map(item=>`<tr><td><a class="link-card" href="${href("instrument",item.id)}">${esc(instrById(item.id)?.name||item.id)}</a></td><td>${fmt(item.price)} Noten</td><td>${item.lvl}</td></tr>`).join("")}</tbody></table></div>`:""}<h2>Quests</h2><div class="chip-row">${qs.map(([qid,q])=>`<a class="chip" href="${href("quest",qid)}">${esc(q.title||qid)}</a>`).join("")||"<span class=\"small-muted\">Im Questdatensatz ist kein Auftrag mit dieser Figur als Auftraggeber verknüpft.</span>"}</div>${greetingHtml}${storyHtml}${n.l?`<p>Kartenebene: <a class="link-card" href="#map" data-map-layer="${esc(n.l)}">${esc(DATA.layers[n.l]?.name||n.l)}</a>.</p>`:""}<p><a class="button" href="#map" ${pos?`data-map-layer="${esc(pos.layer)}" data-map-x="${pos.x}" data-map-y="${pos.y}"`:""}>Figur auf der Karte suchen ↗</a></p>`;
    return articleFrame("Figur",n.n,`${area(n.area)}${n.secret?" · geheime Begegnung":""}`,body,[["Bereich",area(n.area)],["Bekannte Quests",qs.length],["Laden",shop?.name||"Kein Laden verknüpft"],["Kartenebene",pos?DATA.layers[pos.layer]?.name||pos.layer:"–"]],renderNpcPortrait(n));
  }

  function renderItemArticle(id) {
    const it=DATA.items[id] || (DATA.specialItems || []).find(x=>x.id===id);if(!it)return missingArticle();
    const qrefs=questPairs().filter(([,q])=>q.rew?.item===id || q.parts?.some(p=>p.id===id) || (id==="shard"&&q.parts?.some(p=>p.k==="relic")));
    const loc=it.l?DATA.layers[it.l]?.name||it.l:"Hauptkarte";
    const body=`<p><b>${esc(it.n)}</b> ist ein Fundstück oder Questgegenstand aus der Spielwelt.</p>${it.effect?`<div class="callout"><h3>Wirkung</h3><p>${esc(it.effect)}</p></div>`:""}<h2>Fundortdaten</h2><div class="detail-grid"><div class="detail-box"><strong>${esc(loc)}</strong><span>Kartenebene</span></div>${it.room?`<div class="detail-box"><strong>Raum ${esc(it.room)}</strong><span>Interne Raumbezeichnung im Questcode</span></div>`:""}${it.tx!==undefined?`<div class="detail-box"><strong>${it.tx}, ${it.ty}</strong><span>Kachelkoordinaten auf dieser Ebene</span></div>`:it.x!==undefined?`<div class="detail-box"><strong>${it.x}, ${it.y}</strong><span>Koordinaten im Fundstück-Datensatz</span></div>`:""}<div class="detail-box"><strong>${esc(it.kind||"Fundstück")}</strong><span>Typkennung des Spielcodes</span></div></div><h2>Verknüpfte Quests</h2><div class="chip-row">${qrefs.map(([qid,q])=>`<a class="chip" href="${href("quest",qid)}">${esc(q.title||qid)}</a>`).join("")||"<span class=\"small-muted\">Kein Questtext referenziert diese Kennung direkt.</span>"}</div>`;
    return articleFrame("Gegenstand",it.n,"Fundstück oder Questgegenstand",body,[["ID",id],["Typ",it.kind||"–"],["Ebene",loc],["Raum",it.room||"–"],["Questverweise",qrefs.length]],`<div class="article-icon-preview">${gameIcon("icon",id)}</div>`);
  }

  function renderMutationArticle(id) {
    const m=DATA.mutations.find(x=>x.id===id);if(!m)return missingArticle();
    const ins=m.ins&&instrById(m.ins);const affected=ins?`Die Chance ist an ${ins.name} gebunden.`:m.p?`Die Datentabelle führt eine Grundchance von ${fmt(m.p*100)} % auf.`:"Keine allgemeine Zufallschance ist angegeben.";
    const sample=DATA.species.find(s=>s.id==="moospel")||DATA.species[0];
    const body=`<p>Die Mutation <b>${esc(m.name)}</b> verändert das Aussehen eines Tonlings. ${esc(affected)}</p><h2>Vorschau</h2><div class="mutation-preview"><div class="mutation-preview-stage">${sample?`<canvas class="game-tonling-render mutation-preview-canvas" data-art-kind="species" data-art-id="${esc(sample.id)}" data-art-mut="${esc(m.id)}" aria-label="${esc(m.name)} Vorschau"></canvas>`:""}</div><div class="mutation-preview-controls"><label for="mutationSpecies">Tonling wählen</label><select id="mutationSpecies">${DATA.species.map(s=>`<option value="${esc(s.id)}"${s.id===sample?.id?" selected":""}>${esc(s.n)}</option>`).join("")}</select><p>Die Vorschau zeichnet den Tonling live mit dem Mutationsrenderer des Spiels.</p></div></div><h2>Wert</h2><div class="detail-box"><strong>×${fmt(m.mul)}</strong><span>Wertmultiplikator des mutierten Tonlings.</span></div><h2>Erwerb</h2>${ins?`<p>Diese Mutation ist an das Instrument <a class="link-card" href="${href("instrument",m.ins)}">${esc(ins.name)}</a> gebunden. Die Chance pro Fang beträgt ${fmt(m.ip*100)} %.</p>`:m.p?`<p>Grundchance: <b>${fmt(m.p*100)} %</b>. Instrumentpassive und Verzauberungen modifizieren diesen Wert.</p>`:`<p>Diese Mutation wird über besondere Spielregeln ausgelöst.</p>`}<h2>Verbundenes Instrument</h2><p>${ins?`<a class="button" href="${href("instrument",m.ins)}">${esc(ins.name)} ansehen →</a>`:"Kein einzelnes Instrument ist für diese Mutation hinterlegt."}</p><div class="callout"><h3>Mutationssystem</h3><p><a class="link-card" href="#mechanics">Spielmechaniken ansehen →</a></p></div>`;
    return articleFrame("Mutation",m.name,"Besondere Tonling-Variante",body,[["ID",m.id],["Wertmultiplikator",`×${m.mul}`],["Grundchance",m.p?`${fmt(m.p*100)} %`:"–"],["Instrument",ins?.name||"–"]],`<span style="font:48px var(--display);color:${esc(m.col)}">✳</span>`);
  }

  function renderEnchantmentArticle(id) {
    const e=DATA.enchantments[id];if(!e)return missingArticle();
    const stat=e.add&&Object.entries(e.add).map(([k,v])=>`${({ear:"Justierung",prec:"Präzision",harm:"Harmonie",luck:"Glück",beat:"Takt"})[k]||k} ${v>0?"+":""}${v}`).join(", ");
    const body=`<p><b>${esc(e.n)}</b> ist eine der Verzauberungen in der Tabelle des Echoaltars.</p><h2>Effekt</h2><div class="detail-box"><strong>${esc(e.n)}</strong><span>${esc(e.d)}</span></div>${stat?`<p>Direkte Werte: ${esc(stat)}.</p>`:""}${e.mul?`<p>Wertmultiplikator: ×${e.mul}.</p>`:""}<h2>Regeln</h2><p>Eine Verzauberung liegt pro Instrument vor. Wird es neu verzaubert, ersetzt der neue Effekt die bisherige Verzauberung. Der Spielcode verzeichnet den Echoaltar in Bereich 3 und den Echosplitter als Relikt.</p><p><a class="link-card" href="#mechanics">Spielmechaniken ansehen →</a></p>`;
    return articleFrame("Verzauberung",e.n,"Echoaltar · Instrumenteffekt",body,[["Kennung",id],["Direkter Wert",stat||"Spezialeffekt"],["Multiplikator",e.mul?`×${e.mul}`:"–"],["Farbe",e.col]],`<span style="font:48px var(--display);color:${esc(e.col)}">⌘</span>`);
  }

  function renderTitleArticle(id) {
    const t=DATA.titles.find(x=>x.id===id);if(!t)return missingArticle();
    const category={fang:"Fänge",lvl:"Level",sel:"Seltenheit",mut:"Mutationen",perf:"Perfekte Würfe & Fänge",quest:"Quests",instr:"Instrumente",index:"Gebiete & Index",gold:"Noten & Handel",ent:"Entdeckungen",bes:"Besonderes"}[t.cat]||t.cat;
    const body=`<div class="article-hero title-article-hero"><div class="article-hero-art title-preview">${gameIcon("title",id)}</div><div><div class="stamp">Titelstufe ${t.tier}</div><p>So erscheint „${esc(t.name)}“ als animiertes Namensschild im Spiel.</p></div></div><h2>Freischaltbedingung</h2><p>${esc(t.description||"")}</p><div class="detail-grid"><div class="detail-box"><strong>${esc(category)}</strong><span>Titelkategorie</span></div><div class="detail-box"><strong>Stufe ${t.tier}</strong><span>Farb- und Effekttier</span></div></div><h2>Weitere Titel dieser Kategorie</h2><div class="chip-row">${DATA.titles.filter(x=>x.cat===t.cat&&x.id!==id).slice(0,24).map(x=>`<a class="chip title-chip" href="${href("title",x.id)}">${esc(x.name)}</a>`).join("")}</div>`;
    return articleFrame("Titel",t.name,`${category} · Titelstufe ${t.tier}`,body,[["Titel-ID",id],["Kategorie",category],["Stufe",t.tier],["Freischaltung",t.description]]);
  }

  function renderRarityArticle(id) {
    const r=DATA.rarities[Number(id)];if(!r)return missingArticle();
    const entries=DATA.species.filter(s=>s.r===Number(id));
    const body=`<p><b>${esc(r.name)}</b> ist Seltenheitsstufe ${Number(id)+1} in der im Spielcode verwendeten Reihenfolge. Die Stufe kennzeichnet Tonlinge und beeinflusst Basis-EP, Notenwert sowie die Fangphase.</p><div class="detail-grid"><div class="detail-box"><strong>${fmt(r.xp)} EP</strong><span>Grund-EP vor Bereichs- und Instrumentboni</span></div><div class="detail-box"><strong>${fmt(r.val)} Noten</strong><span>Basisverkaufswert vor Multiplikatoren</span></div><div class="detail-box"><strong>${r.w===undefined?"–":fmt(r.w)}</strong><span>Relatives Gewicht in der Seltenheitstabelle, keine Fanggarantie</span></div></div><h2>Tonlinge dieser Stufe</h2><div class="chip-row">${entries.map(s=>`<a class="chip" href="${href("species",s.id)}">${esc(s.n)}</a>`).join("")||"<span class=\"small-muted\">Keine Art in diesem Datenstand eingetragen.</span>"}</div><p>Die Seltenheitsauswahl kann pro Gebiet angepasst werden. Instrumentglück und Mutationsregeln wirken zusätzlich. Die <a class="link-card" href="#mechanics">Mechanikseite</a> fasst diese Wechselwirkungen zusammen.</p>`;
    return articleFrame("Seltenheit",r.name,`Stufe ${Number(id)+1} · ${entries.length} Arten`,body,[["Stufe",Number(id)+1],["Farbe",r.col],["Basis-EP",r.xp],["Basiswert",`${fmt(r.val)} Noten`],["Arten",entries.length]],`<span style="font:45px var(--display);color:${esc(r.col)}">✧</span>`);
  }

  function searchData(q) {
    const out=[];const needle=q.toLocaleLowerCase("de-DE");
    const add=(kind,id,title,detail,text)=>{if(out.length>=12)return;if(`${title} ${detail} ${text||""} ${id}`.toLocaleLowerCase("de-DE").includes(needle))out.push({kind,id,title,detail});};
    DATA.species.forEach(s=>add("species",s.id,s.n,`${area(s.a)} · ${rarity(s.r).name}`,(s.z||[]).map(zone).join(" ")));
    Object.entries(DATA.instruments).forEach(([id,i])=>add("instrument",id,i.name,"Instrument",i.info));
    questPairs().forEach(([id,q])=>add("quest",id,q.title||id,`Quest · ${npcById(q.npc)?.n||""}`,`${q.desc||""} ${q.parts?.map(x=>x.txt).join(" ")||""}`));
    Object.entries(DATA.npcs).forEach(([id,n])=>add("npc",id,n.n,`${area(n.area)} · Figur`,n.hi));
    allItems().forEach(([id,it])=>add("item",id,it.n,"Gegenstand",`${it.kind||""} ${it.effect||""}`));
    Object.entries(DATA.zones).forEach(([id,z])=>add("zone",id,z.n,area(z.a),"Unterbereich"));
    DATA.mutations.forEach(m=>add("mutation",m.id,m.name,"Mutation",m.ins&&instrById(m.ins)?.name));
    Object.entries(DATA.enchantments).forEach(([id,e])=>add("enchantment",id,e.n,"Verzauberung",e.d));
    DATA.titles.forEach(t=>add("title",t.id,t.name,"Titel",t.description));
    Object.entries(DATA.areas).forEach(([id,a])=>add("area",id,a.name,"Bereich",""));
    return out;
  }

  function renderMap() {
    const layerOptions=Object.values(DATA.layers).map(l=>`<option value="${esc(l.id)}"${l.id==="main"?" selected":""}>${esc(l.name)}${l.area===5?" · Sanktum":""}</option>`).join("");
    $("#content").innerHTML=`${pageHead("Erkundung", "Karte & Kacheln", "Die Kachelkarte wird aus den Weltarrays des Spiels gezeichnet. Wechsle Ebene, zoome hinein und untersuche Zonen.", Object.keys(DATA.layers).length)}<div class="map-wrap"><div class="map-toolbar"><label for="mapLayer">Kartenebene</label><select id="mapLayer">${layerOptions}</select><span class="map-toggle">Originale Spielkarte · alle Bereiche aufgedeckt</span><span class="map-status" id="mapStatus">Mausrad zum Zoomen · Ziehen zum Verschieben</span></div><div class="map-viewport" id="mapViewport"><canvas class="map-canvas" id="mapCanvas" aria-label="Interaktive Karte"></canvas><div class="map-tooltip" id="mapTooltip">Wähle eine Ebene und bewege den Zeiger über die Karte.</div></div><div class="map-legend"><span class="legend-item">Kachel anklicken: Unterbereich öffnen</span><span class="legend-item">Ziehen: verschieben</span><span class="legend-item">Mausrad: zoomen</span></div></div><p class="map-hint">Auf der Hauptkarte sind die spiegelbildlich gefalteten Außenbereiche bereits in die Spielansicht überführt. Das Sanktum besteht aus eigenen Ebenen. Die Punktmarken der Figuren folgen den im Weltcode gespeicherten Koordinaten.</p><div class="section-heading"><div><h2>Unterbereiche</h2><p>Klicke einen Eintrag, um seine Fundorte und zugeordneten Arten nachzusehen.</p></div></div><div class="chip-row">${Object.entries(DATA.zones).map(([id,z])=>`<a class="chip" href="${href("zone",id)}"><span class="chip-dot" style="background:${esc(z.col)}"></span>${esc(z.n)}</a>`).join("")}</div>`;
    initMap();
  }

  function initMap() {
    const canvas=$("#mapCanvas"), viewport=$("#mapViewport"), ctx=canvas.getContext("2d");
    const select=$("#mapLayer"), tip=$("#mapTooltip");
    let current="main", zoom=1, offsetX=0, offsetY=0, tile=6, dragging=false, startX=0,startY=0,baseX=0,baseY=0,hover=null,originalMap=null;
    const tileColors=(t,z)=>{const zoneData=DATA.zones[z]||{};if(t===0)return zoneData.col2||"#57607a";if(t===1)return zoneData.col||"#9dbf88";if(t===2)return"#d8c99e";if(t===3)return"#83b9c2";if(t===4)return"#56866e";if(t===5)return"#bd74b4";if(t===6)return"#a98155";return"#29334b";};
    function sizeCanvas(){const rect=viewport.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);canvas.style.width=rect.width+"px";canvas.style.height=rect.height+"px";ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
    function coords(n){let x=n.x??0,y=n.y??0;if((n.l||"main")==="main"&&y>=112){x=159-x;y=223-y;}return{x,y,layer:n.l||"main"};}
    function draw(){const l=DATA.layers[current];if(!l)return;const w=viewport.clientWidth,h=viewport.clientHeight,dpr=Math.min(2,window.devicePixelRatio||1);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.fillStyle="#283349";ctx.fillRect(0,0,w,h);const worldW=160*tile,worldH=116*tile;if(!offsetX&&!offsetY){offsetX=(w-worldW)/2;offsetY=(h-worldH)/2;}if(!originalMap){ctx.fillStyle="#f6efd9";ctx.font="18px Patrick Hand";ctx.textAlign="center";ctx.fillText("Weltkarte wird geladen …",w/2,h/2);return;}ctx.save();ctx.translate(offsetX,offsetY);ctx.scale(zoom,zoom);ctx.imageSmoothingEnabled=false;ctx.drawImage(originalMap,0,0,worldW,worldH);if(hover){ctx.strokeStyle="#f2c230";ctx.lineWidth=1.4;ctx.strokeRect(hover.x*tile,hover.y*tile,tile,tile);}ctx.restore();}
    async function loadOriginalMap(){try{await ensureGameRendererApi();originalMap=document.createElement("canvas");gameRendererApi.map(originalMap,current);draw();}catch(error){console.error("Originale Spielkarte konnte nicht geladen werden.",error);tip.textContent="Die Originalkarte konnte nicht geladen werden.";}}
    function pointerTile(e){const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left-offsetX)/(tile*zoom),y=(e.clientY-rect.top-offsetY)/(tile*zoom);return{x:Math.floor(x),y:Math.floor(y)};}
    function updateTooltip(p){if(p.x<0||p.y<0||p.x>=160||p.y>=116){tip.textContent="Außerhalb der Kartenkacheln.";hover=null;draw();return;}const l=DATA.layers[current],typ=l.tiles[p.y][p.x],zoneId=l.zones[p.y][p.x],z=DATA.zones[zoneId];hover=p;tip.innerHTML=`<b>${esc(z?.n||"Unbenannter Ort")}</b> · ${["Fels / dichter Wald","Boden","Weg","Wasser","Deko","falsche Wand","Haus"][typ]||`Kachel ${typ}`}<br><a class="link-card" href="${href("zone",zoneId||"")}">Gebietsartikel öffnen →</a>`;draw();}
    select.addEventListener("change",()=>{current=select.value;zoom=1;offsetX=0;offsetY=0;hover=null;tip.textContent="Bewege den Zeiger über die Karte.";originalMap=null;loadOriginalMap();draw();});
    canvas.addEventListener("pointerdown",e=>{dragging=true;viewport.classList.add("dragging");startX=e.clientX;startY=e.clientY;baseX=offsetX;baseY=offsetY;canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener("pointermove",e=>{if(dragging){offsetX=baseX+e.clientX-startX;offsetY=baseY+e.clientY-startY;draw();return;}updateTooltip(pointerTile(e));});
    canvas.addEventListener("pointerup",e=>{dragging=false;viewport.classList.remove("dragging");const p=pointerTile(e);if(Math.abs(e.clientX-startX)+Math.abs(e.clientY-startY)<5){const zoneId=DATA.layers[current]?.zones[p.y]?.[p.x];if(zoneId&&DATA.zones[zoneId])location.hash=href("zone",zoneId);}});
    canvas.addEventListener("pointerleave",()=>{if(!dragging){hover=null;tip.textContent="Mausrad zum Zoomen · Ziehen zum Verschieben";draw();}});
    canvas.addEventListener("wheel",e=>{e.preventDefault();const before=pointerTile(e),old=zoom;zoom=Math.max(.75,Math.min(8,zoom*(e.deltaY<0?1.14:.88)));const after=pointerTile(e);offsetX+=(after.x-before.x)*tile*zoom;offsetY+=(after.y-before.y)*tile*zoom;draw();},{passive:false});
    window.addEventListener("resize",sizeCanvas);sizeCanvas();loadOriginalMap();
    if(pendingMapFocus){const focus=pendingMapFocus;pendingMapFocus=null;if(DATA.layers[focus.layer]){current=focus.layer;select.value=current;if(Number.isFinite(focus.x)&&Number.isFinite(focus.y)){zoom=Math.max(2.5,zoom);offsetX=viewport.clientWidth/2-(focus.x+.5)*tile*zoom;offsetY=viewport.clientHeight/2-(focus.y+.5)*tile*zoom;}draw();}}
  }

  function renderSearchResults(q) {
    const box=$("#searchResults");if(!q.trim()){box.hidden=true;box.innerHTML="";return;}
    const results=searchData(q);
    box.innerHTML=results.length?results.slice(0,9).map(x=>`<a href="${href(x.kind,x.id)}">${esc(x.title)}<small>${esc(x.detail)}</small></a>`).join(""):`<div class="search-empty">Kein Eintrag gefunden.</div>`;
    box.hidden=false;
  }

  function linkifyContent(root) {
    if (!root || !DATA) return;
    const refs = [];
    const add = (name,kind,id) => { if(name&&String(name).length>2)refs.push({name:String(name),href:href(kind,id)}); };
    DATA.species.forEach(s=>add(s.n,"species",s.id));
    Object.entries(DATA.instruments).forEach(([id,x])=>add(x.name,"instrument",id));
    questPairs().forEach(([id,x])=>add(x.title,"quest",id));
    Object.entries(DATA.npcs).forEach(([id,x])=>add(x.n,"npc",id));
    allItems().forEach(([id,x])=>add(x.n,"item",id));
    Object.entries(DATA.zones).forEach(([id,x])=>add(x.n,"zone",id));
    Object.entries(DATA.areas).forEach(([id,x])=>add(x.name,"area",id));
    DATA.mutations.forEach(x=>add(x.name,"mutation",x.id));
    Object.entries(DATA.enchantments).forEach(([id,x])=>add(x.n,"enchantment",id));
    DATA.titles.forEach(x=>add(x.name,"title",x.id));
    DATA.rarities.forEach((x,i)=>add(x.name,"rarity",i));
    refs.sort((a,b)=>b.name.length-a.name.length);
    const unique=new Map();for(const ref of refs){const key=ref.name.toLocaleLowerCase("de-DE");if(!unique.has(key))unique.set(key,ref);}
    const escaped=[...unique.values()].map(x=>x.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));if(!escaped.length)return;
    const re=new RegExp(`(?<![\\p{L}\\p{N}])(${escaped.join("|")})(?![\\p{L}\\p{N}])`,"giu");
    const byName=new Map([...unique.values()].map(x=>[x.name.toLocaleLowerCase("de-DE"),x]));
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){const p=node.parentElement;if(!p||p.closest("a,button,script,style,textarea,canvas,select,option,.mono"))return NodeFilter.FILTER_REJECT;re.lastIndex=0;return re.test(node.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){re.lastIndex=0;const value=node.nodeValue,frag=document.createDocumentFragment();let last=0,m;while((m=re.exec(value))){frag.append(document.createTextNode(value.slice(last,m.index)));const ref=byName.get(m[0].toLocaleLowerCase("de-DE"));if(ref){const a=document.createElement("a");a.href=ref.href;a.className="wiki-reference";a.textContent=m[0];frag.append(a);}else frag.append(document.createTextNode(m[0]));last=m.index+m[0].length;}frag.append(document.createTextNode(value.slice(last)));node.replaceWith(frag);}
  }

  function renderRoute() {
    if(!DATA)return;
    listFilter="";listScope="all";
    const raw=decodeURIComponent(location.hash.slice(1)||"home").split("/");
    const page=raw[0]||"home",id=raw[1];
    $$("[data-nav]").forEach(a=>a.classList.toggle("active",a.dataset.nav===page));
    const crumbNames={species:speciesById(id)?.n,instrument:instrById(id)?.name,quest:DATA.quests[id]?.title,npc:npcById(id)?.n,item:DATA.items[id]?.n,zone:DATA.zones[id]?.n,area:DATA.areas[id]?.name,mutation:DATA.mutations.find(m=>m.id===id)?.name,enchantment:DATA.enchantments[id]?.n,title:DATA.titles.find(t=>t.id===id)?.name,rarity:DATA.rarities[Number(id)]?.name};
    const crumb=$("#crumbCurrent");crumb.textContent=id?(crumbNames[page]||navLabels[page]||"Eintrag"):(navLabels[page]||"Übersicht");
    const c=$("#content");
    if(!id){switch(page){case"home":c.innerHTML=renderHome();break;case"tonlinge":renderSpeciesList();break;case"instruments":renderInstrumentList();break;case"quests":renderQuestList();break;case"npcs":renderNpcList();break;case"items":renderItems();break;case"areas":renderAreas();break;case"rarities":renderRarities();break;case"mutations":renderMutations();break;case"enchantments":renderEnchantmentList();break;case"titles":renderTitles();break;case"mechanics":renderMechanics();break;case"updates":renderUpdates();break;case"map":renderMap();break;default:c.innerHTML=missingArticle();}}else{switch(page){case"species":c.innerHTML=renderSpeciesArticle(id);break;case"instrument":c.innerHTML=renderInstrumentArticle(id);break;case"quest":c.innerHTML=renderQuestArticle(id);break;case"npc":c.innerHTML=renderNpcArticle(id);break;case"item":c.innerHTML=renderItemArticle(id);break;case"zone":c.innerHTML=renderZoneArticle(id);break;case"area":c.innerHTML=renderAreaArticle(id);break;case"mutation":c.innerHTML=renderMutationArticle(id);break;case"enchantment":c.innerHTML=renderEnchantmentArticle(id);break;case"title":c.innerHTML=renderTitleArticle(id);break;case"rarity":c.innerHTML=renderRarityArticle(id);break;default:c.innerHTML=missingArticle();}}
    $("#sidebar").classList.remove("open");c.focus({preventScroll:true});window.scrollTo(0,0);
    const species=page==="species"&&id?speciesById(id):null;const pageTitle=$(".article-main .page-title",c);if(species&&pageTitle){pageTitle.classList.add("rarity-name");pageTitle.style.setProperty("--rarity",rarity(species.r).col);}
    const mutationSelect=$("#mutationSpecies",c);if(mutationSelect)mutationSelect.addEventListener("change",()=>{const preview=$(".mutation-preview-canvas",c);if(preview)preview.dataset.artId=mutationSelect.value;});
    if(page==="zone"&&id)bindSpawnOdds(id);
    linkifyContent(c);hydrateGameArt();
  }

  async function start() {
    try {
      const response=await fetch("/wiki/data.json");if(!response.ok)throw new Error(`Datenbank konnte nicht geladen werden (${response.status}).`);
      DATA=await response.json();
      $("#speciesCount").textContent=DATA.species.length;$("#questCount").textContent=Object.keys(DATA.quests).length;
      window.addEventListener("hashchange",renderRoute);renderRoute();
      const search=$("#search"),results=$("#searchResults");search.addEventListener("input",()=>renderSearchResults(search.value));search.addEventListener("keydown",e=>{if(e.key==="Escape"){search.value="";results.hidden=true;search.blur();}if(e.key==="Enter"){const first=$("a",results);if(first)location.hash=first.hash;results.hidden=true;}});document.addEventListener("click",e=>{if(!e.target.closest(".search-wrap"))results.hidden=true;});
      document.addEventListener("keydown",e=>{if(e.key==="/"&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();search.focus();}if(e.key==="Escape")$("#sidebar").classList.remove("open");});
      $("#menuToggle").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
      document.addEventListener("click",e=>{const l=e.target.closest("[data-map-layer]");if(!l)return;e.preventDefault();const layer=l.dataset.mapLayer||"main";pendingMapFocus={layer,x:l.dataset.mapX===undefined?NaN:Number(l.dataset.mapX),y:l.dataset.mapY===undefined?NaN:Number(l.dataset.mapY)};location.hash="#map";});
    } catch(error) {
      $("#content").innerHTML=`<div class="notice"><span class="notice-icon">!</span><div><strong>Das Feldbuch konnte nicht geladen werden</strong><p>${esc(error.message)}</p></div></div>`;
    }
  }
  start();
})();
