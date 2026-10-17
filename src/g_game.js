/* ===== SPIEL: Eingabe, Bewegung, Quests, Fangen, Oberfläche ===== */
load();
for (const id in FWALLS) if (S.flags["open_" + id]) { const f = FWALLS[id]; T[f[1]][f[0]] = 1; }
const G = { px: S.px, py: S.py, moving: false, face: 1 };
const keys = {}; let holdWall = 0, holdKey = "", curZone = null, curArea = 0, lastSave = 0, ambT = 4, hintShown = false;
let CAM = { ox: 0, oy: 0 };
const C = { ph: null };            // Fang-Zustand
const stick = { x: 0, y: 0 };
const NPC_R = 15;

/* ----- Hilfen ----- */
function toast(txt, bad, ms, html) { const d = document.createElement("div"); d.className = "toast" + (bad ? " bad" : ""); if (html) d.innerHTML = txt; else d.textContent = txt; $("toasts").appendChild(d); setTimeout(() => d.remove(), ms || 3600); while ($("toasts").children.length > 4) $("toasts").firstChild.remove(); }
const uiOpen = () => !$("win").hidden || !$("dlg").hidden;
const paused = () => uiOpen() || C.ph;
const solidAt = (px, py) => { const tx = Math.floor(px / TS), ty = Math.floor(py / TS); if (tx < 0 || ty < 0 || tx >= WW || ty >= WH) return true; for (const [G0, fl] of GATES) if (!S.flags[fl] && ty === G0.y && tx >= G0.x && tx < G0.x + G0.w) return true; return solidT(T[ty][tx]); };
function hitsWorld(x, y) { const r = 8; return solidAt(x - r, y - 3) || solidAt(x + r, y - 3) || solidAt(x - r, y + 7) || solidAt(x + r, y + 7); }
function npcHit(x, y) { for (const id in NPCS) { const n = NPCS[id]; if (n.secret && !S.flags["open_" + id]) continue; if (Math.hypot(x - (n.x * TS + TS / 2), y - (n.y * TS + TS - 4)) < NPC_R) return true; } return false; }
function nearNpc() { let best = null, bd = 56; for (const id in NPCS) { const n = NPCS[id]; if (n.secret && !S.flags["open_" + id]) continue; const d = Math.hypot(G.px - (n.x * TS + TS / 2), G.py - (n.y * TS + TS - 4)); if (d < bd) { bd = d; best = id; } } return best; }

/* ----- Quests ----- */
const QORDER = Object.keys(QUESTS);
const qDone = id => S.q[id] && S.q[id].st === "done";
function qAvail(id) { const q = QUESTS[id]; return !S.q[id] && (!q.after || qDone(q.after)); }
function npcQuest(npcId) {
  const l = QORDER.filter(id => QUESTS[id].npc === npcId);
  for (const id of l) { const s = S.q[id]; if (s && s.st === "active") return { id, kind: s.n >= QUESTS[id].n ? "ready" : "active" }; }
  for (const id of l) if (qAvail(id)) return { id, kind: S.lvl >= QUESTS[id].lvl ? "offer" : "locked" };
  return null;
}
function npcMark(id) { const nq = npcQuest(id); if (nq) { if (nq.kind === "ready") return "?"; if (nq.kind === "offer") return "!"; } return NPCS[id].shop ? "$" : null; }
function onCatchQuests(tl) { const sp = SP[tl.sp]; let any = false; for (const id in S.q) { const s = S.q[id], q = QUESTS[id]; if (s.st === "active" && s.n < q.n && matchFilter(q.f, sp)) { s.n++; any = true; if (s.n >= q.n) toast("Quest bereit zur Abgabe: " + q.title); } } if (any) renderQuests(); }
function completeQuest(id) {
  const q = QUESTS[id], r = q.rew; S.q[id].st = "done"; if (r.gold) S.gold += r.gold; if (r.xp) addXp(r.xp);
  if (r.instr && !S.instr.includes(r.instr)) { S.instr.push(r.instr); renderBar(); toast("Neues Instrument: " + INSTR[r.instr].name); }
  if (q.flag === "gate") { S.flags.gateOpen = true; toast("Das Tor zu den Glimmerhöhlen ist offen!"); }
  if (q.flag === "gate3") { S.flags.gate3Open = true; toast("Das Sterntor ist offen!"); }
  Snd.play("coins", 1, 0.9); Snd.melody("harfe", [0, 2, 4, 5], 0.12, 0.6); renderQuests(); renderStats(); save(); setTimeout(checkOffers, 1500);
}
function renderQuests() {
  const el = $("qList"); let h = "";
  const act = QORDER.filter(id => S.q[id] && S.q[id].st === "active");
  act.sort((a, b) => (QUESTS[b].main ? 1 : 0) - (QUESTS[a].main ? 1 : 0));
  for (const id of act) { const q = QUESTS[id], s = S.q[id], rdy = s.n >= q.n; h += `<div class="q ${q.main ? "main" : ""} ${rdy ? "rdy" : ""}"><b>${q.main ? "★ " : ""}${q.title}</b>${rdy ? "Bereit: sprich mit " + NPCS[q.npc].n : q.desc}<div class="bar"><i style="width:${Math.min(100, s.n / q.n * 100)}%"></i></div><small>${Math.min(s.n, q.n)} / ${q.n}</small></div>`; }
  if (!act.length) h = `<div class="muted" style="font-size:16px">Keine aktive Quest. Sprich mit den Leuten, die ein <b style="color:#c97d12">!</b> tragen.</div>`;
  el.innerHTML = h;
}
function renderStats() { $("stLv").textContent = S.lvl; $("stGold").textContent = S.gold; $("xpFill").style.width = Math.round(S.xp / xpNeed(S.lvl) * 100) + "%"; $("xpbar").title = S.xp + " / " + xpNeed(S.lvl) + " EP"; }
function checkOffers() {
  S.flags.nt = S.flags.nt || {}; const names = [];
  for (const id of QORDER) { const q = QUESTS[id], n = NPCS[q.npc]; if (id === "m1") { S.flags.nt[id] = 1; continue; } if (S.flags.nt[id] || !qAvail(id) || S.lvl < q.lvl) continue; if (n.secret && !S.flags["open_" + q.npc]) continue; S.flags.nt[id] = 1; if (!names.includes(n.n)) names.push(n.n); }
  for (const sid in SHOPS) for (const it of SHOPS[sid].items) { const key = "shop_" + it.id; if (S.flags.nt[key] || S.lvl < it.lvl || S.instr.includes(it.id)) continue; S.flags.nt[key] = 1; const nn = NPCS[sid].n; if (!names.includes(nn)) names.push(nn); }
  if (names.length) { toast(names.length === 1 ? names[0] + " könnte jetzt etwas für dich haben." : names.slice(0, -1).join(", ") + " und " + names[names.length - 1] + " könnten jetzt etwas für dich haben.", false, 7000); Snd.play("perfect", 1.3, .5); save(); }
}
onLevelUp = () => { Snd.play("levelup", 1, 1); showBanner("Level " + S.lvl, "Aufgestiegen!"); toast("Level " + S.lvl + " erreicht"); setTimeout(checkOffers, 1200); };

/* ----- Dialog mit Schreibmaschine ----- */
const DL = { npc: null, pages: [], i: 0, pos: 0, tm: null, ch: [], voice: 0, typing: false };
const pick = a => a[Math.floor(Math.random() * a.length)];
function say(who, pages, choices, voice) {
  if (typeof pages === "string") pages = [pages]; clearTimeout(DL.tm);
  DL.pages = pages; DL.i = 0; DL.ch = choices || []; DL.voice = voice || 0; $("dlg").hidden = false; $("dlgWho").textContent = who; startPage();
}
function setTxt(n) { const t = DL.pages[DL.i] || "", el = $("dlgTxt"); el.textContent = ""; const a = document.createElement("span"), b = document.createElement("span"); a.textContent = t.slice(0, n); b.className = "hid"; b.textContent = t.slice(n); el.append(a, b); }
/* Sprechblase über dem NPC, Antworten neben dem Spieler */
function placeDlg() {
  if ($("dlg").hidden) return; const n = NPCS[DL.npc]; if (!n) return;
  const bub = $("dlgBubble"), ch = $("dlgCh"), bw2 = bub.offsetWidth, bh = bub.offsetHeight, cw = ch.offsetWidth, chh = ch.offsetHeight;
  const nx = (n.x * TS + TS / 2 - CAM.ox) * Z, ny = (n.y * TS + TS - 4 - 44 - CAM.oy) * Z, px = (G.px - CAM.ox) * Z, py = (G.py - CAM.oy) * Z;
  const bl = clamp(nx - bw2 / 2, 8, VW - bw2 - 8), bt = clamp(ny - bh - 14, 64, VH - bh - 90);
  bub.style.left = bl + "px"; bub.style.top = bt + "px"; 
  const right = nx < px ? true : false, gap = 34 * Z * 0.8 + 10;
  let cl = right ? px + gap : px - gap - cw; if (cl < 8 || cl + cw > VW - 8) cl = clamp(right ? px - gap - cw : px + gap, 8, VW - cw - 8);
  ch.style.left = cl + "px"; ch.style.top = clamp(py - chh / 2 - 10, 70, VH - chh - 90) + "px";
}
function startPage() { DL.pos = 0; DL.typing = true; setTxt(0); $("dlgCh").innerHTML = ""; $("dlgMore").hidden = true; typeStep(); }
function typeStep() {
  const t = DL.pages[DL.i]; if (DL.pos >= t.length) return finishPage();
  DL.pos++; const ch = t[DL.pos - 1]; setTxt(DL.pos);
  if (ch !== " " && DL.pos % 2 === 0) Snd.tick(.045, 330 + DL.voice * 38 + (DL.pos % 3) * 24, .03);
  let d = TYPE.letter; if (ch === "," || ch === ";" || ch === ":") d = TYPE.comma; else if (".!?…".includes(ch) && (DL.pos >= t.length || t[DL.pos] === " ")) d = TYPE.period;
  DL.tm = setTimeout(typeStep, d);
}
function finishPage() {
  clearTimeout(DL.tm); DL.typing = false; setTxt(DL.pages[DL.i].length);
  if (DL.i < DL.pages.length - 1) { $("dlgMore").hidden = false; return; }
  const ch = $("dlgCh"); ch.innerHTML = "";
  DL.ch.forEach(c => { const b = document.createElement("button"); b.className = "btn"; b.textContent = c.t; if (c.dis) b.disabled = true; b.onclick = () => { Snd.tick(.25, 1400); c.f(); }; ch.appendChild(b); });
  const f = ch.querySelector("button:not(:disabled)"); if (f && !Snd.touch) f.focus();
}
function dlgAdvance() { if ($("dlg").hidden) return; if (DL.typing) { finishPage(); return; } if (DL.i < DL.pages.length - 1) { DL.i++; startPage(); } }
$("dlg").addEventListener("pointerdown", e => { if (e.target.closest("button")) return; dlgAdvance(); });
function closeDlg() { clearTimeout(DL.tm); $("dlg").hidden = true; }
/* Gespräche */
const seenOf = id => (S.flags.ls = S.flags.ls || {}, S.flags.ls[id] = S.flags.ls[id] || []);
function chatPages(id) {
  const list = STORY[id] || [], seen = seenOf(id);
  for (let k = 0; k < list.length; k++) if (!seen.includes(k) && (COND[list[k].w] || (() => false))()) { seen.push(k); save(); return list[k].p; }
  return pick(STORY[id + "Loop"] || [["Hm."]]);
}
function greetPages(id) { const g = GREET[id]; return g ? [pick(isNight() ? g.n : g.d)] : [NPCS[id].hi || "Hallo."]; }
function talk(id) {
  DL.npc = id;
  const n = NPCS[id], nq = npcQuest(id), ch = [], v = NPC_VOICE[id] || 0; let pages;
  const root = () => talk(id);
  if (nq) {
    const x = QX[nq.id], q = QUESTS[nq.id];
    if (nq.kind === "offer") { pages = [...greetPages(id), ...x.offer]; ch.push({ t: "Annehmen", f: () => { S.q[nq.id] = { st: "active", n: 0 }; toast("Quest angenommen: " + q.title); renderQuests(); save(); say(n.n, "Gut. Ich verlasse mich auf dich.", [{ t: "Tschüss", f: closeDlg }], v); } }, { t: "Später", f: closeDlg }); }
    else if (nq.kind === "locked") pages = [...greetPages(id), x.locked || pick(LOCKED_GENERIC), ...chatPages(id)];
    else if (nq.kind === "active") pages = [x.remind, ...chatPages(id)];
    else { pages = x.done; ch.push({ t: "Belohnung nehmen", f: () => { completeQuest(nq.id); const r = q.rew, parts = []; if (r.xp) parts.push(r.xp + " EP"); if (r.gold) parts.push(r.gold + " ♪"); if (r.instr) parts.push(INSTR[r.instr].name); say(n.n, "Danke dir." + (parts.length ? "  (" + parts.join(", ") + ")" : ""), [{ t: "Tschüss", f: closeDlg }], v); } }); }
  } else pages = [...greetPages(id), ...chatPages(id)];
  if (n.shop) ch.push({ t: "Laden", f: () => { closeDlg(); openShop(n.shop, id); } });
  if (n.buy) ch.push({ t: "Tonlinge verkaufen", f: () => { closeDlg(); openShop(n.shop, id, "sell"); } });
  if (!(nq && (nq.kind === "offer"))) ch.push({ t: "Tschüss", f: closeDlg });
  say(n.n, pages, ch, v);
}

/* ----- Fenster ----- */
function openWin(title, html, after) { $("winTitle").textContent = title; $("winBody").innerHTML = html; $("win").hidden = false; if (after) after(); Snd.tick(.2, 900); }
function closeWin() { $("win").hidden = true; $("winBody").innerHTML = ""; }
function thumb(sp, mut, size = 78, silhouette) { const c = document.createElement("canvas"); c.width = c.height = size * 2; const x = c.getContext("2d"); drawTonling(x, sp, size, size * 1.05, size * 1.25, 0.3, mut); return c; }
function fillThumbs() { $("winBody").querySelectorAll("canvas[data-sp]").forEach(cn => { const sp = SP[cn.dataset.sp], m = cn.dataset.mut || null; cn.width = cn.height = 156; drawTonling(cn.getContext("2d"), sp, 78, 82, 100, 0.3, m || null); }); $("winBody").querySelectorAll("canvas[data-ic]").forEach(cn => { cn.width = cn.height = 100; drawIcon(cn.getContext("2d"), cn.dataset.ic, 0, 0, 100); }); }
function invSorted() { return S.inv.map((t, i) => ({ t, i })).sort((a, b) => SP[b.t.sp].r - SP[a.t.sp].r || (b.t.mut ? 1 : 0) - (a.t.mut ? 1 : 0)); }
let invSel = -1;
function infoHtml(v) {
  const it = itemOf(v); if (!it) return `<p class="muted" style="margin:0">Leer. Zieh etwas hierher oder tausche Plätze.</p>`;
  if (it.k === "x") return it.id === "bag" ? `<b>Instrumentbeutel</b><small>Instrumente ansehen und wechseln (B)</small>` : `<b>Index</b><small>Alle Tonlinge, die du kennst (I)</small>`;
  if (it.k === "i") { const i = INSTR[it.id]; return `<b>${i.name}</b>${S.eq === it.id && !S.hold ? " (in der Hand)" : ""}<small>Präzision ${i.prec} · Harmonie ${i.harm} · Glück ${i.luck} · Resonanz ${i.res} Hz</small>${i.pas ? `<small style="color:#7a4fb0">${PAS_TXT[i.pas]}</small>` : ""}<small>${i.info}</small>`; }
  const t = it.t, sp = SP[t.sp], m = t.mut ? mutOf(t.mut) : null;
  return `<b>${m ? m.name + " " : ""}${sp.n}</b>${S.hold === t.uid ? " (in der Hand)" : ""}<small><span class="rar" style="background:${RAR[sp.r].col}"></span>${RAR[sp.r].name}${t.hz != null ? " · " + t.hz + " Hz" : ""} · Wert ${tlValue(t)} ${NT}</small>`;
}
function showInfo(i) {
  const el = $("invInfo"); if (!el) return; invSel = i; const v = S.bar[i];
  el.innerHTML = infoHtml(v) + (i >= 9 && v ? `<button class="btn" id="invToBar" style="min-height:30px;margin-top:6px">In die Leiste</button>` : "");
  document.querySelectorAll("#win .slot.sel").forEach(x => x.classList.remove("sel")); document.querySelectorAll("#win .slot[data-i='" + i + "']").forEach(x => x.classList.add("sel"));
  const b = $("invToBar"); if (b) b.onclick = () => { const j = S.bar.indexOf(null); const to = j >= 0 && j < 9 ? j : -1; if (to < 0) { toast("Die Leiste ist voll. Zieh es auf einen Platz."); return; } S.bar[to] = S.bar[i]; S.bar[i] = null; Snd.tick(.2, 1100); renderBar(); save(); showInfo(to); };
}
function sortInv() {
  const rest = S.bar.slice(9).filter(Boolean), k = v => v[0] === "x" ? 0 : v[0] === "i" ? 1 : 2, tl = v => { const t = itemOf(v); return t && t.t ? t.t : null; };
  rest.sort((a, b) => k(a) - k(b) || (k(a) === 2 ? (SP[tl(b).sp].r - SP[tl(a).sp].r || (tl(b).mut ? 1 : 0) - (tl(a).mut ? 1 : 0) || tl(a).sp.localeCompare(tl(b).sp) || (tl(b).hz || 0) - (tl(a).hz || 0)) : 0));
  for (let j = 9; j < S.bar.length; j++) S.bar[j] = rest[j - 9] || null; renderBar(); save(); invSel = -1; showInfo(0);
}
function openInv() {
  winKind = "inv";
  const h = `<div class="h3">Inventar <span class="muted" style="font-size:18px" id="invCnt"></span></div><div class="slotgrid" id="invGrid"></div><div class="h3">Leiste</div><div class="slotgrid" id="winBar"></div><div id="invInfo" class="invinfo"></div><p class="muted" style="margin:8px 0 6px">Zieh Dinge auf andere Plätze, um sie zu tauschen. Antippen nimmt etwas in die Hand. Was in der Leiste liegt, wählst du mit 1 bis 9.</p><button class="btn" id="invSort" style="min-height:34px">Aufräumen</button>`;
  openWin("Inventar", h, () => { renderBar(); $("invSort").onclick = sortInv; showInfo(S.hold ? S.bar.indexOf("t:" + S.hold) : Math.max(0, S.bar.indexOf("i:" + S.eq))); });
}
function openIndex() {
  let h = "";
  for (const a of [1, 2, 3]) {
    const l = SPECIES.filter(s => s.a === a); const got = l.filter(s => S.dex[s.id] && S.dex[s.id].c > 0).length;
    h += `<div class="h3">${AREAS[a].name} <span class="muted" style="font-size:18px">${got} / ${l.length}</span></div><div class="grid">`;
    l.forEach(s => { const d = S.dex[s.id], c = d && d.c > 0, seen = d && d.s; const zn = [...new Set(s.z)].map(z => ZINFO[z].n).join(", ");
      h += `<div class="card ${c ? "" : "dim"}" style="${seen ? "border-color:" + RAR[s.r].col : ""}"><canvas data-sp="${s.id}"></canvas>${c ? `<b>${s.n}</b><small><span class="rar" style="background:${RAR[s.r].col}"></span>${RAR[s.r].name}</small><small>${s.hz[0]}–${s.hz[1]} Hz · ${s.t === "n" ? "nachts" : s.t === "d" ? "tags" : "immer"}</small><small>${zn}</small><small>gefangen: ${d.c}</small>` : `<b>???</b><small>${seen ? "gesehen, nicht gefangen" : "unbekannt"}</small>`}</div>`; });
    h += "</div>";
  }
  openWin("Index", h, () => { fillThumbs(); $("winBody").querySelectorAll(".card.dim canvas").forEach(c => { c.style.filter = "brightness(0)"; c.style.opacity = ".3"; }); });
}
function openBag() {
  winKind = "bag";
  let h = `<p class="muted">Nimm ein Instrument in die Hand. Du kannst es auch in die Leiste unten ziehen. Je höher die Resonanz, desto besser hörst du hohe Tonlinge. Höhere kannst du auch fangen, sie sind dann aber schneller.</p>`;
  S.instr.forEach(id => { const i = INSTR[id], on = S.eq === id && !S.hold;
    h += `<div class="row" data-ins="${id}" style="touch-action:none"><canvas data-ic="${kindIcon(i.kind)}"></canvas><div class="grow"><b style="font-weight:400;font-size:21px">${i.name}</b>${on ? " (in der Hand)" : ""}<small>Präzision ${i.prec} · Harmonie ${i.harm} · Glück ${i.luck} · Resonanz ${i.res} Hz</small>${i.pas ? `<small style="color:#7a4fb0">${PAS_TXT[i.pas]}</small>` : ""}<small>${i.info}</small></div><button class="btn" data-eq="${id}" ${on ? "disabled" : ""}>In die Hand</button></div>`; });
  openWin("Instrumentbeutel", h, () => { fillThumbs(); $("winBody").querySelectorAll("[data-eq]").forEach(b => b.onclick = () => { const v = "i:" + b.dataset.eq; takeInHand(v, true); openBag(); }); $("winBody").querySelectorAll("[data-ins]").forEach(r => r.addEventListener("pointerdown", e => { if (e.target.closest("button")) return; startDrag({ v: "i:" + r.dataset.ins }, e, () => {}); })); });
}
function openHelp() {
  openWin("Hilfe", `<div class="h3">Steuerung</div><p><b>WASD / Pfeile</b>: laufen · <b>Leertaste / E</b>: sprechen oder Instrument spielen · <b>1–9</b>: Leiste (Instrument oder Tonling in die Hand nehmen) · <b>G</b> Inventar (alle deine Sachen) · <b>I</b> Index · <b>B</b> Instrumentbeutel · <b>Q</b> Quests · <b>M</b> Ton · <b>Esc</b> schließen. Am Handy: Stick und Knopf unten.</p>
  <div class="h3">So fängst du Tonlinge</div><p>1. Spiele dein Instrument: drücke, wenn der Ring die Marke trifft (Gut oder Perfekt). 2. Zieh den Regler auf die richtige Frequenz: der Ton wird ruhig und die Anzeige warm. 3. Zieh die Zone unter den Tonling und halte ihn drin, bis der Balken voll ist. Ein lila oder gelber Ton beim Ring kündigt einen Prächtigen oder Fabelhaften an.</p>
  <div class="h3">Tipps</div><p>Nachts erscheinen andere Tonlinge. Ein stärkeres Instrument hört höhere Frequenzen. Manche Wände geben nach, wenn du lange dagegen läufst.</p>
  <div class="h3">Mehrspieler</div><p class="muted">Andere Spieler siehst du, wenn das Spiel auf einem Server mit Mehrspieler läuft. Dein Name:</p><p><input id="inName" maxlength="14" value="${(typeof mpName === "function" ? mpName() : "").replace(/"/g, "")}" style="font:400 20px var(--f-body);padding:4px 10px;border:2px solid var(--ink);border-radius:10px;background:var(--paper2);width:200px"></p>
  <div class="h3">Spielstand</div><p class="muted">Wird automatisch in diesem Browser gespeichert.</p><button class="btn warn" id="btnReset">Spielstand löschen</button>`, () => { $("inName").onchange = e => { S.name = e.target.value.replace(/[<>&"]/g, "").trim().slice(0, 14) || mpName(); save(); }; $("btnReset").onclick = () => { if ($("btnReset").dataset.s) { resetAll(); location.reload(); } else { $("btnReset").dataset.s = 1; $("btnReset").textContent = "Wirklich löschen? Nochmal klicken"; } }; });
}
function openShop(shopId, npcId, tab) {
  tab = tab || "buy"; const sh = SHOPS[shopId];
  let h = `<div class="tabs"><button class="btn" data-t="buy" aria-pressed="${tab === "buy"}">Kaufen</button><button class="btn" data-t="sell" aria-pressed="${tab === "sell"}">Verkaufen</button><span class="grow" style="flex:1"></span><span><b>${S.gold}</b> ${NT}</span></div>`;
  if (tab === "buy") {
    sh.items.forEach(it => { const i = INSTR[it.id], own = S.instr.includes(it.id), lv = S.lvl < it.lvl, poor = S.gold < it.price;
      h += `<div class="row"><canvas data-ic="${kindIcon(i.kind)}"></canvas><div class="grow"><b style="font-weight:400;font-size:21px">${i.name}</b><small>Präzision ${i.prec} · Harmonie ${i.harm} · Glück ${i.luck} · Resonanz ${i.res} Hz</small><small>${i.info}</small><small>Preis: ${it.price} ${NT} · Benötigt Level ${it.lvl}</small></div><button class="btn" data-buy="${it.id}" ${own || lv || poor ? "disabled" : ""}>${own ? "Gekauft" : lv ? "Ab Level " + it.lvl : it.price + " " + NT}</button></div>`; });
    h += `<p class="muted">Weitere Instrumente bekommst du von Leuten für Quests, und manchmal an versteckten Orten.</p>`;
  } else {
    const l = invSorted(), tot = l.reduce((a, o) => a + tlValue(o.t), 0), cheap = l.filter(o => SP[o.t.sp].r <= 2 && !o.t.mut);
    h += `<div style="margin-bottom:8px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-sellcheap ${cheap.length ? "" : "disabled"}>Alle Gewöhnlichen bis Seltenen verkaufen (${cheap.reduce((a, o) => a + tlValue(o.t), 0)} ${NT})</button><button class="btn" data-sellall ${l.length ? "" : "disabled"}>Alles verkaufen (${tot} ${NT})</button></div><div class="grid">`;
    l.forEach(({ t, i }) => { const sp = SP[t.sp], m = t.mut ? mutOf(t.mut) : null; h += `<div class="card" style="border-color:${RAR[sp.r].col}"><canvas data-sp="${sp.id}" ${m ? `data-mut="${m.id}"` : ""}></canvas><b>${m ? m.name + " " : ""}${sp.n}</b><small>${RAR[sp.r].name}${t.hz != null ? " · " + t.hz + " Hz" : ""}</small><button class="btn" data-sell="${i}" style="min-height:32px;margin-top:4px">${tlValue(t)} ${NT}</button></div>`; });
    h += "</div>"; if (!l.length) h += `<p>Du hast nichts zu verkaufen.</p>`;
  }
  openWin(sh.name, h, () => {
    fillThumbs(); const B = $("winBody");
    B.querySelectorAll("[data-t]").forEach(b => b.onclick = () => openShop(shopId, npcId, b.dataset.t));
    B.querySelectorAll("[data-buy]").forEach(b => b.onclick = () => { const it = sh.items.find(x => x.id === b.dataset.buy); if (S.gold >= it.price && S.lvl >= it.lvl && !S.instr.includes(it.id)) { S.gold -= it.price; S.instr.push(it.id); renderBar(); Snd.play("coins"); toast("Gekauft: " + INSTR[it.id].name); renderStats(); save(); openShop(shopId, npcId, "buy"); } });
    const sell = idxs => { idxs = idxs.sort((a, b) => b - a); let sum = 0; idxs.forEach(i => { sum += tlValue(S.inv[i]); S.inv.splice(i, 1); }); S.gold += sum; renderBar(); Snd.play("coins", 1, 1); toast("+" + sum + " " + NT, false, 3600, true); renderStats(); save(); openShop(shopId, npcId, "sell"); };
    B.querySelectorAll("[data-sell]").forEach(b => b.onclick = () => sell([+b.dataset.sell]));
    const sc = B.querySelector("[data-sellcheap]"); if (sc) sc.onclick = () => sell(S.inv.map((t, i) => i).filter(i => SP[S.inv[i].sp].r <= 2 && !S.inv[i].mut));
    const sa = B.querySelector("[data-sellall]"); if (sa) sa.onclick = () => sell(S.inv.map((t, i) => i));
  });
}
$("winClose").onclick = closeWin;

/* ----- Leiste mit Ziehen und Ablegen ----- */
let drag = null;
const itemOf = v => { if (!v) return null; if (v[0] === "i") { const id = v.slice(2); return INSTR[id] && S.instr.includes(id) ? { k: "i", id } : null; } if (v[0] === "x") { const id = v.slice(2); return id === "bag" || id === "idx" ? { k: "x", id } : null; } if (v[0] === "t") { const t = S.inv.find(x => x.uid === v.slice(2)); return t ? { k: "t", t } : null; } return null; };
function cleanBar() { normalizeSlots(); }
function drawSlotItem(x, v, N) { const it = itemOf(v); x.clearRect(0, 0, N, N); if (!it) return; if (it.k === "x") drawIcon(x, it.id, N * .07, N * .07, N * .86); else if (it.k === "i") drawIcon(x, kindIcon(INSTR[it.id].kind), N * .07, N * .07, N * .86); else drawTonling(x, SP[it.t.sp], N / 2, N * .52, N * .64, 0.3, it.t.mut || null); }
const slotOn = v => { const it = itemOf(v); return !!it && it.k !== "x" && (it.k === "i" ? S.eq === it.id && !S.hold : S.hold === it.t.uid); };
function slotTitle(v) { const it = itemOf(v); if (!it) return "leer"; if (it.k === "x") return it.id === "bag" ? "Instrumentbeutel (B)" : "Index (I)"; if (it.k === "i") return INSTR[it.id].name; const sp = SP[it.t.sp]; return (it.t.mut ? mutOf(it.t.mut).name + " " : "") + sp.n + " (" + RAR[sp.r].name + ")"; }
function renderSlots(el, a, z) {
  if (!el) return; el.innerHTML = "";
  for (let i = a; i < z; i++) { const v = S.bar[i];
    const d = document.createElement("div"); d.className = "slot" + (slotOn(v) ? " on" : "") + (i === invSel && el.id !== "hotbar" ? " sel" : ""); d.dataset.i = i; d.title = slotTitle(v);
    const c = document.createElement("canvas"); c.width = c.height = 96; d.appendChild(c); drawSlotItem(c.getContext("2d"), v, 96);
    if (i < 9) { const k = document.createElement("kbd"); k.textContent = i + 1; d.appendChild(k); }
    d.addEventListener("pointerdown", e => { e.preventDefault(); startDrag({ from: i, v }, e, () => { if (el.id !== "hotbar") showInfo(i); activate(i); }); });
    d.addEventListener("pointerenter", () => { if (el.id !== "hotbar" && $("invInfo")) showInfo(i); });
    el.appendChild(d); }
}
function heldDesc() { const it = S.hold ? itemOf("t:" + S.hold) : null; return it ? "t:" + it.t.sp + ":" + (it.t.mut || "") : "i:" + INSTR[S.eq].kind; }
function renderBar() { cleanBar(); renderSlots($("hotbar"), 0, 9); renderSlots($("winBar"), 0, 9); const g = $("invGrid"); if (g) { renderSlots(g, 9, S.bar.length); const n = $("invCnt"); if (n) n.textContent = S.inv.length + " Tonlinge"; } if ($("invInfo") && invSel >= 0) showInfo(invSel); }
function takeInHand(v, quiet) {
  const it = itemOf(v); if (!it || it.k === "x") return;
  if (it.k === "i") { const was = S.eq !== it.id || S.hold; S.eq = it.id; S.hold = null; if (was && !quiet) toast(INSTR[it.id].name + " in der Hand"); }
  else { S.hold = S.hold === it.t.uid && !quiet ? null : it.t.uid; if (!quiet) toast(S.hold ? "Du hältst " + SP[it.t.sp].n : "Tonling losgelassen"); }
  renderBar(); save();
}
function startDrag(payload, e, click) { drag = { p: payload, click, sx: e.clientX, sy: e.clientY, on: false }; }
window.addEventListener("pointermove", e => {
  if (!drag) return; if (!drag.on && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 8 && drag.p.v) { drag.on = true; const g = $("ghost"); g.hidden = false; g.width = g.height = 96; const gx = g.getContext("2d"); gx.clearRect(0, 0, 96, 96); drawSlotItem(gx, drag.p.v, 96); }
  if (drag.on) { const g = $("ghost"); g.style.left = e.clientX + "px"; g.style.top = e.clientY + "px"; }
});
window.addEventListener("pointerup", e => {
  if (!drag) return; const d = drag; drag = null; $("ghost").hidden = true;
  if (d.on) { const t = document.elementFromPoint(e.clientX, e.clientY), slot = t && t.closest && t.closest(".slot");
    if (slot) { const j = +slot.dataset.i; let f = d.p.from; if (f === undefined) f = S.bar.indexOf(d.p.v);
      if (f >= 0 && f !== j) { const tmp = S.bar[j]; S.bar[j] = S.bar[f]; S.bar[f] = tmp; Snd.tick(.2, 1100); if (invSel === f) invSel = j; renderBar(); save(); } }
  } else if (d.click) d.click();
});
window.addEventListener("pointercancel", () => { drag = null; $("ghost").hidden = true; });
function activate(i) {
  Snd.init(); const v = S.bar[i], it = itemOf(v); if (!it) return;
  if (it.k === "x") { toggleWin(it.id === "bag" ? "bag" : "idx"); return; }
  if (C.ph && it.k !== "i") return;
  if (it.k === "t") { takeInHand(v); return; }
  const was = S.eq === it.id && !S.hold; takeInHand(v, true); if (!was) toast(INSTR[it.id].name + " in der Hand");
  if (!uiOpen()) actionPlay();
}
let winKind = "";
function toggleWin(k) { if (!$("win").hidden && winKind === k) { closeWin(); return; } if (C.ph) return; closeDlg(); winKind = k; ({ bag: openBag, idx: openIndex, inv: openInv, help: openHelp })[k](); }

/* ----- Orte ----- */
function showBanner(small, big) { $("bnSmall").textContent = small; $("bnBig").textContent = big; const b = $("banner"); b.classList.add("on"); clearTimeout(showBanner.t); showBanner.t = setTimeout(() => b.classList.remove("on"), 3200); }
function checkZone() {
  const z = zoneAt(G.px / TS | 0, G.py / TS | 0); if (z === curZone) return; const zi = ZINFO[z];
  const first = curZone === null; curZone = z; $("plName").textContent = zi.n; $("plArea").textContent = AREAS[zi.a].name;
  if (!first || true) { if (zi.a !== curArea) showBanner(first ? "Willkommen im" : "Neuer Bereich", AREAS[zi.a].name + " · " + zi.n); else showBanner("Du betrittst", zi.n); }
  curArea = zi.a;
}

/* ----- Fangen ----- */
function actionPlay() {
  if (C.ph === "ring") return pressRing(); if (C.ph || uiOpen()) return;
  if (S.hold) { toast("Du hältst einen Tonling. Nimm ein Instrument in die Hand (Leiste)."); return; }
  const z = zoneAt(G.px / TS | 0, G.py / TS | 0); const ins = INSTR[S.eq]; S.stats.tries++;
  playNote(ins, 1);
  C.zone = z; C.t = 0; C.ph = "ring"; C.sp = null; C.perfect = false; C.pre = pickSpecies(z, false); C.found = !!C.pre; C.res = null; C.ringHit = false;
  C.noteCol = "#fff";
  hintShown = true;
}
function playNote(ins, mult) {
  const k = ins.kind; const r = Math.pow(2, (oldHz(ins.res) - 60) / 160) * mult;
  if (k === "flute") Snd.play("floete", 0.9 + (oldHz(ins.res) / 400) * mult, 0.8); else if (k === "bells") Snd.play("perfect", 0.8 * mult, 0.8); else if (k === "tamb") { Snd.tick(.4, 900, .06); Snd.tick(.3, 1500, .05); } else Snd.play("harfe", (k === "violin" ? 0.8 : 1) * (0.9 + ins.res / 500) * mult, 0.8);
}
function pressRing() {
  if (C.ringHit) return; const r = ringR(), d = Math.abs(r - 46); C.ringHit = true;
  if (d <= 8) { C.perfect = true; C.res = "Perfekt!"; } else if (d <= 20) C.res = "Gut!"; else C.res = null;
  if (!C.res) { C.ph = "miss"; C.t = 0; toast("Daneben. Spiel nochmal, wenn der Ring die Marke trifft.", true); return; }
  Snd.play("perfect", C.perfect ? 1.2 : 1, 0.9);
  if (C.perfect) { const n = pickSpecies(C.zone, true); if (n && (!C.pre || n.r >= C.pre.r)) C.pre = n; }
  if (!C.pre) { C.ph = "none"; C.t = 0; toast("Hier ist nichts zu hören, das dein Instrument erreicht.", true); return; }
  C.ph = "ringres"; C.t = 0;
}
const ringR = () => Math.max(20, 150 - 104 * (C.t / 1.5));
function beginFreq() {
  const sp = C.pre, ins = INSTR[S.eq]; C.sp = sp; C.mut = rollMut();
  const hi = sp.hz[0] <= ins.res ? Math.min(sp.hz[1], ins.res) : sp.hz[1]; C.target = sp.hz[0] + Math.random() * (hi - sp.hz[0]);
  /* Liegt der Tonling über deiner Resonanz, wird die Skala größer und er flitzt schneller: je höher, desto flotter (bis x4) */
  C.max = Math.max(ins.res, Math.ceil(C.target * 1.12)); C.over = Math.max(0, (C.target - ins.res) / ins.res); C.fast = Math.min(4, 1 + C.over * 2.5 * (ins.pas === "wind" ? 0.5 : 1)); C.user = C.max * (0.2 + Math.random() * 0.2); C.vu = 0;
  C.ph = "freq"; C.t = 0; C.lock = 0; C.easy = [1, .5][sp.r] || 0; C.rm = [1.45, 1.2, 1, .85, .75][sp.r] || 1; C.tol = (2.2 + ins.prec * 0.1) * (1 + .7 * C.easy) * (ins.res / oldHz(ins.res)) * (C.max / ins.res); const d = S.dex[sp.id] = S.dex[sp.id] || { s: 0, c: 0 }; d.s = 1; save();
  Snd.toneStart();
}
function beginBal() {
  Snd.toneStop(); const ins = INSTR[S.eq], sp = C.sp; C.ph = "bal"; C.t = 0; C.prog = 0.2; C.pos = 0.5; C.tgt = 0.5; C.tt = 0; C.zc = 0.5; C.vz = 0; C.zw = (0.24 + ins.prec * 0.006) * (ins.pas === "ruhe" ? 1.15 : 1); C.inT = 0; C.note = null; C.noteT = 2.5; C.ptr = null; C.lives = 3; C.fl = 0; C.flash = 0; C.dir = 0; C.cdg = -1;
  C.v = 0.28 * sp.spd * C.fast * (1 - ins.harm * 0.012) * (1 - 0.3 * C.easy);
}
function cancelCatch() { Snd.toneStop(); C.ph = null; C.down = false; toast("Abgebrochen."); }
function endCatch(ok) {
  Snd.toneStop();
  if (ok) {
    const tl = { uid: newUid(), sp: C.sp.id, mut: C.mut, hz: Math.round(C.target * 10) / 10 }; C.result = tl; C.ph = "result"; C.t = 0; const xp = tlXp(tl); C.xp = xp;
    S.inv.push(tl); renderBar(); const d = S.dex[tl.sp] = S.dex[tl.sp] || { s: 1, c: 0 }; d.c++; d.s = 1; S.stats.catches++; addXp(xp); onCatchQuests(tl); renderStats();
    const r = C.sp.r; Snd.play("fang", 1, 1); Snd.melody("harfe", r >= 3 ? [0, 2, 4, 5, 7] : r >= 1 ? [0, 2, 4] : [0, 3], 0.13, 0.55, 1.2); save();
  } else { C.ph = "flee"; C.t = 0; Snd.play("flucht", 1, 0.9); }
}

/* ----- Eingabe ----- */
["pointerdown", "touchend", "click", "keydown"].forEach(ev => window.addEventListener(ev, () => Snd.init(), { capture: true }));
window.addEventListener("keydown", e => {
  if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; Snd.init();
  const k = e.key.toLowerCase(); keys[k] = true;
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
  if (e.repeat) return;
  if (k === "escape") { if (C.ph === "freq" || C.ph === "bal") return cancelCatch(); if (!$("win").hidden) closeWin(); else if (!$("dlg").hidden) closeDlg(); return; }
  if (k >= "1" && k <= "9") { activate(+k - 1); return; }
  if (k === "g") return toggleWin("inv"); if (k === "i") return toggleWin("idx"); if (k === "b") return toggleWin("bag"); if (k === "q") { const q = $("quests"); q.style.display = q.style.display === "none" ? "" : "none"; return; } if (k === "h") return toggleWin("help");
  if (k === "m") { Snd.setMute(!S.mute); $("btnMute").style.opacity = S.mute ? .45 : 1; return; }
  if (k === " " || k === "e" || k === "enter") {
    if (!$("dlg").hidden) { dlgAdvance(); return; }
    if (!$("win").hidden) return; if (C.ph) { catchAction(); return; }
    const n = nearNpc(); if (n) { talk(n); return; } actionPlay();
  }
});
window.addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
window.addEventListener("blur", () => { for (const k in keys) keys[k] = false; });
function catchAction() { if (C.ph === "ring") pressRing(); else if (C.ph === "result") { if (C.t > 0.4) C.ph = null; } else if ((C.ph === "flee" || C.ph === "miss" || C.ph === "none") && C.t > 0.3) C.ph = null; }
function bw() { return Math.min(VW - 40, 560); }
cv.addEventListener("pointerdown", e => {
  Snd.init(); if (!C.ph) return; const cb = C.cancel;
  if (cb && (C.ph === "freq" || C.ph === "bal") && e.clientX >= cb.x && e.clientX <= cb.x + cb.w && e.clientY >= cb.y && e.clientY <= cb.y + cb.h) { cancelCatch(); return; }
  C.down = true; try { cv.setPointerCapture(e.pointerId); } catch (_) {} ptr(e); catchAction();
});
cv.addEventListener("pointermove", e => { if (C.ph && C.down) ptr(e); });
cv.addEventListener("pointerup", () => { C.down = false; });
cv.addEventListener("pointercancel", () => { C.down = false; });
function ptr(e) { C.ptr = e.clientX; }
const thrust = () => !!(C.down || keys[" "] || keys.space || keys.arrowright || keys.arrowup || keys.d || keys.w);
$("btnInv").onclick = () => toggleWin("inv"); $("btnIdx").onclick = () => toggleWin("idx");
$("btnMute").onclick = () => { Snd.init(); Snd.setMute(!S.mute); $("btnMute").style.opacity = S.mute ? .45 : 1; };
$("btnHelp").onclick = () => toggleWin("help");
$("qHead").onclick = () => { const l = $("qList"), hide = l.style.display !== "none"; l.style.display = hide ? "none" : ""; $("qHead").textContent = hide ? "Quests ▸" : "Quests"; };
// Touch: schwebender Stick. Er erscheint dort, wo der Finger aufsetzt, und folgt dem Finger.
const IS_TOUCH = matchMedia("(pointer:coarse)").matches || "ontouchstart" in window;
(function () {
  const st = $("stick"), kn = st.firstElementChild; let id = null, bx = 0, by = 0; const R = 50;
  const show = (x, y) => { st.style.left = (x - 59) + "px"; st.style.top = (y - 59) + "px"; st.style.bottom = "auto"; };
  const reset = () => { id = null; kn.style.transform = ""; stick.x = stick.y = 0; st.classList.remove("on"); };
  window.addEventListener("pointerdown", e => {
    if (e.pointerType !== "touch" || id !== null || e.target !== cv || C.ph || uiOpen()) return;
    Snd.init(); id = e.pointerId; bx = e.clientX; by = e.clientY; show(bx, by); st.classList.add("on");
  });
  window.addEventListener("pointermove", e => {
    if (e.pointerId !== id) return; if (C.ph || uiOpen()) return reset();
    let dx = e.clientX - bx, dy = e.clientY - by; const m = Math.hypot(dx, dy);
    if (m > R) { const k = (m - R) / m; bx += dx * k; by += dy * k; show(bx, by); dx = e.clientX - bx; dy = e.clientY - by; }
    kn.style.transform = `translate(${dx}px,${dy}px)`; const mm = Math.hypot(dx, dy) / R; stick.x = dx / R; stick.y = dy / R;
    if (mm < 0.15) stick.x = stick.y = 0;
  });
  const up = e => { if (e.pointerId === id) reset(); };
  window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
  $("btnAct").addEventListener("pointerdown", e => { e.preventDefault(); e.stopPropagation(); Snd.init(); window.dispatchEvent(new KeyboardEvent("keydown", { key: "e" })); });
  if (IS_TOUCH) { document.body.classList.add("touch"); if (innerWidth < 700) { $("qList").style.display = "none"; $("qHead").textContent = "Quests ▸"; } setTimeout(() => toast("Tippe auf den Boden und zieh, um zu laufen."), 1500); }
})();

/* ----- Aktualisieren ----- */
function padKey() { return curArea === 2 ? "cave" : isNight() ? "night" : "day"; }
let stepT = 0;
function update(dt) {
  /* Hintergrund-Summen entfernt */
  if (G.moving && !paused()) { stepT -= dt; if (stepT <= 0) { stepT = 0.3; Snd.tick(.07, 120 + Math.random() * 60, .06); } }
  if (!paused()) S.t += dt;
  if (C.ph) updateCatch(dt);
  else if (!uiOpen()) move(dt);
  checkZone();
  // Anzeigen
  $("tmClock").textContent = clockStr(); $("tmDay").textContent = (isNight() ? "Nacht" : "Tag") + " " + (Math.floor(S.t / DAY_LEN) + 1);
  const n = (!paused()) ? nearNpc() : null, p = $("prompt");
  if (n) { p.hidden = false; p.textContent = "E: " + NPCS[n].n + " ansprechen"; } else if (!paused() && !hintShown && S.stats.tries === 0) { p.hidden = false; p.textContent = matchMedia("(pointer:coarse)").matches ? "Knopf rechts unten: Instrument spielen" : "Leertaste oder 1: Instrument spielen"; } else p.hidden = true;
  $("btnAct").textContent = n ? "Sprechen" : C.ph ? "Los" : "Spielen";
  lastSave += dt; if (lastSave > 5) { lastSave = 0; S.px = G.px; S.py = G.py; save(); }
  // Ambiente
  ambT -= dt; if (ambT < 0 && Snd.ready && !paused()) { ambT = 5 + Math.random() * 8; const a = curArea; if (a === 1 && !isNight()) Snd.melody("harfe", [Math.random() * 8 | 0, Math.random() * 8 | 0], 0.5, 0.12, 0.7); else if (a === 1) Snd.play("perfect", 0.5 + Math.random() * .2, 0.06); else Snd.play("perfect", 1.6 + Math.random() * .7, 0.07); }
}
function move(dt) {
  let dx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0), dy = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
  if (stick.x || stick.y) { dx = stick.x; dy = stick.y; }
  const m = Math.hypot(dx, dy); G.moving = m > 0.05; let blocked = null;
  if (G.moving) { if (m > 1) { dx /= m; dy /= m; } const sp = 150 * dt; if (dx) G.face = dx > 0 ? 1 : -1;
    let nx = G.px + dx * sp, ny = G.py + dy * sp;
    if (!hitsWorld(nx, G.py) && !npcHit(nx, G.py)) G.px = nx; else if (dx) blocked = [Math.floor((G.px + Math.sign(dx) * 12) / TS), Math.floor(G.py / TS)];
    if (!hitsWorld(G.px, ny) && !npcHit(G.px, ny)) G.py = ny; else if (dy) blocked = blocked || [Math.floor(G.px / TS), Math.floor((G.py + Math.sign(dy) * 12) / TS)];
  }
  // falsche Wände
  const FW = Object.keys(FWALLS).map(k => [FWALLS[k][0], FWALLS[k][1], k]); let hit = null; if (blocked) hit = FW.find(f => f[0] === blocked[0] && f[1] === blocked[1] && T[f[1]][f[0]] === 5);
  if (hit) { const key = hit[2]; if (holdKey !== key) { holdKey = key; holdWall = 0; } holdWall += dt; if (holdWall > 0.8) { T[hit[1]][hit[0]] = 1; S.flags["open_" + key] = true; holdKey = ""; holdWall = 0; chunks.clear(); Snd.melody("harfe", [4, 2, 0], 0.15, 0.7, 0.8); toast("Die Wand gibt nach. Dahinter ist jemand."); save(); setTimeout(checkOffers, 2500); } } else { holdKey = ""; holdWall = 0; }
  S.px = G.px; S.py = G.py;
}
function updateCatch(dt) {
  C.t += dt; const ins = INSTR[S.eq];
  if (C.ph === "ring") { if (ringR() <= 20 && !C.ringHit) { C.ph = "miss"; C.t = 0; toast("Zu spät. Der Ring war schon weg.", true); } }
  else if (C.ph === "ringres") { if (C.t > 0.85) beginFreq(); }
  else if (C.ph === "freq") {
    const res = C.max; C.vu = ((C.vu || 0) + (thrust() ? 1.7 : -1.1) * dt) * Math.exp(-2.1 * dt); C.user += C.vu * res * dt; if (C.user <= 0) { C.user = 0; C.vu = Math.max(0, C.vu); } if (C.user >= res) { C.user = res; C.vu = Math.min(0, C.vu); }
    const d = Math.abs(C.user - C.target); Snd.toneSet(C.user, d); C.noise = d <= C.tol ? 0 : clamp((d - C.tol) / (res * 0.22), 0.08, 1);
    if (d <= C.tol) C.lock += dt; else C.lock = Math.max(0, C.lock - dt * 2);
    if (C.lock >= (INSTR[S.eq].pas === "tief" ? 0.35 : 0.7)) { Snd.play("perfect", 1.5, .6); beginBal(); }
    else if (C.t > 40) { toast("Der Tonling hat das Interesse verloren.", true); endCatch(false); }
  } else if (C.ph === "bal") {
    C.flash = Math.max(0, (C.flash || 0) - dt);
    if (C.t < 2.4) { if (C.t > 1.8 && !C.fl) { C.fl = 1; C.flash = 0.7; Snd.play("fang", 1.7, .5); if (C.sp.r >= 3) { Snd.play("perfect", C.sp.r >= 4 ? 1.5 : 1.2, .8); Snd.melody("harfe", [0, 4, 7], 0.1, 0.5, 1.4); } } const dg = Math.floor(C.t / 0.6); if (dg !== C.cdg) { C.cdg = dg; if (dg < 3) Snd.tick(.25, 700, .08); } return; }
    const sp = C.sp;
    C.tt -= dt; if (C.tt <= 0) { C.tt = (0.5 + Math.random() * 0.8) / (sp.spd * C.fast); C.tgt = 0.08 + Math.random() * 0.84; }
    const v = C.v * 1.6; const dd = C.tgt - C.pos; C.dir = Math.abs(dd) < 0.02 ? 0 : Math.sign(dd); C.pos += clamp(dd, -v * dt, v * dt); C.pos = clamp(C.pos + Math.sin(C.t * 7) * 0.0012 * sp.spd, 0.03, 0.97);
    C.vz = ((C.vz || 0) + (thrust() ? 2.6 : -1.9) * dt) * Math.exp(-2.4 * dt); C.zc += C.vz * dt; if (C.zc <= C.zw / 2) { C.zc = C.zw / 2; C.vz = Math.max(0, C.vz); } if (C.zc >= 1 - C.zw / 2) { C.zc = 1 - C.zw / 2; C.vz = Math.min(0, C.vz); }
    
    const inZ = Math.abs(C.pos - C.zc) <= C.zw / 2;
    if (inZ) { C.inT += dt; let rate = 0.16 * C.rm; if (ins.pas === "moment") rate *= 1 + Math.min(0.10, C.inT * 0.02); C.prog += rate * dt; } else { C.inT = 0; C.prog -= 0.10 * (1 - 0.5 * C.easy) * (ins.pas === "ur" ? 0.5 : 1) * dt; }
    if (ins.pas === "note") { C.noteT -= dt; if (!C.note && C.noteT <= 0) { C.note = { x: 0.1 + Math.random() * 0.8, life: 2.8 }; } if (C.note) { C.note.life -= dt; if (Math.abs(C.note.x - C.zc) <= C.zw / 2 + 0.01) { C.prog += 0.05; Snd.play("perfect", 1.8, .5); C.note = null; C.noteT = 4; C.bonus = 0.6; } else if (C.note.life <= 0) { C.note = null; C.noteT = 4; } } }
    if (C.bonus) C.bonus -= dt; C.prog = Math.min(C.prog, 1);
    if (C.prog >= 1) endCatch(true);
    else if (C.prog <= 0) { toast("Der Tonling ist weggehüpft.", true); endCatch(false); }
  } else if (C.ph === "result") { if (C.t > 4) C.ph = null; }
  else if (C.ph === "miss" || C.ph === "none" || C.ph === "flee") { if (C.t > 1.6) C.ph = null; }
}

/* ----- Zeichnen der Fang-Oberfläche (nach dem Vorbild des Videos) ----- */
/* ----- Handgezeichnete Hilfen für die Fang-Oberfläche ----- */
const PAPER = "#f7efd6", WASH = "rgba(247,239,214,.88)";
let HB = 0;
const jt = (i, s) => hs(i, s + HB * 7, 41) - .5;
function hPts(c, pts, s, amp, close) {
  c.beginPath(); const n = pts.length, segs = close ? n : n - 1; let first = true;
  for (let k = 0; k < segs; k++) {
    const a = pts[k], b = pts[(k + 1) % n], len = Math.hypot(b[0] - a[0], b[1] - a[1]), m = Math.max(1, Math.round(len / 24));
    for (let i = (k ? 1 : 0); i <= m; i++) { const u = i / m, e = (i === 0 || i === m) ? .6 : 1; const x = a[0] + (b[0] - a[0]) * u + jt(k * 37 + i, s) * amp * 2 * e, y = a[1] + (b[1] - a[1]) * u + jt(k * 37 + i, s + 3) * amp * 2 * e; if (first) { c.moveTo(x, y); first = false; } else c.lineTo(x, y); }
  }
  if (close) c.closePath();
}
function hBox(c, x, y, w, h, o) {
  o = o || {}; const s = o.s || 1, pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  if (o.fill) { hPts(c, pts, s, 1.2, true); c.fillStyle = o.fill; c.fill(); }
  if (o.hatch) { c.save(); hPts(c, pts, s, 1.2, true); c.clip(); c.strokeStyle = "rgba(29,39,66,.10)"; c.lineWidth = 1.1; for (let k = -h; k < w; k += 8) { c.beginPath(); c.moveTo(x + k, y + h); c.lineTo(x + k + h, y); c.stroke(); } c.restore(); }
  c.strokeStyle = o.ink || INK; c.lineWidth = o.lw || 2.8; hPts(c, pts, s, 1.4, true); c.stroke();
  c.lineWidth = 1.1; c.globalAlpha = .5; hPts(c, pts, s + 5, 2.2, true); c.stroke(); c.globalAlpha = 1;
}
function hLine(c, x1, y1, x2, y2, s, lw, col) {
  c.strokeStyle = col || INK; c.lineWidth = lw || 2.4; hPts(c, [[x1, y1], [x2, y2]], s, 1.3, false); c.stroke();
  c.lineWidth = Math.max(1, (lw || 2.4) * .45); c.globalAlpha = .5; hPts(c, [[x1, y1], [x2, y2]], s + 5, 2, false); c.stroke(); c.globalAlpha = 1;
}
function hCircPath(c, x, y, r, s) {
  const n = 20, p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, rr = r * (1 + jt(i, s) * .09); p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  c.beginPath(); c.moveTo((p[n - 1][0] + p[0][0]) / 2, (p[n - 1][1] + p[0][1]) / 2);
  for (let i = 0; i < n; i++) { const a = p[i], b = p[(i + 1) % n]; c.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
  c.closePath();
}
function hCirc(c, x, y, r, s, o) {
  o = o || {}; if (o.fill) { hCircPath(c, x, y, r, s); c.fillStyle = o.fill; c.fill(); }
  c.strokeStyle = o.col || INK; c.lineWidth = o.lw || 2.6; hCircPath(c, x, y, r, s); c.stroke();
  if (!o.single) { c.lineWidth = 1.1; c.globalAlpha = .5; hCircPath(c, x, y, r * 1.02, s + 4); c.stroke(); c.globalAlpha = 1; }
}
function hBtn(c, x, y, w, h, label, font, col) {
  hBox(c, x, y, w, h, { fill: col || "#e7806b", s: 9, lw: 2.6, hatch: true }); outlineText(c, label, x + w / 2, y + h * 0.7, font, INK, 0);
}
/* Schrift wie mit Tinte gesetzt: dunkle Schrift mit hellem Papierrand, farbige Schrift mit Tintenrand */
function outlineText(c, s, x, y, font, fill, lw) {
  c.font = font; c.textAlign = "center"; c.lineJoin = "round";
  const plain = !fill || fill === "#fff" || fill === "#e8edf6" || fill === INK;
  if (plain) { if (lw !== 0) { c.lineWidth = (lw || 5) + 2; c.strokeStyle = "rgba(250,244,226,.95)"; c.strokeText(s, x, y); } c.fillStyle = INK; c.fillText(s, x, y); }
  else { c.lineWidth = lw || 5; c.strokeStyle = INK; c.strokeText(s, x, y); c.fillStyle = fill; c.fillText(s, x, y); }
}
function drawCatch(t) {
  const c = ctx, ins = INSTR[S.eq]; c.setTransform(DPR, 0, 0, DPR, 0, 0); c.lineJoin = c.lineCap = "round"; HB = Math.floor(t * 5) % 5;
  const sx = (G.px - CAM.ox) * Z, sy = (G.py - CAM.oy) * Z, W = bw(), x0 = (VW - W) / 2, cx = VW / 2;
  const F1 = "'Caveat Brush',cursive", F2 = "'Patrick Hand',cursive";
  C.cancel = null;
  const tx = sx + 56 * Z * 0.8 + (C.ph === "bal" ? (C.pos - 0.5) * 26 : 0), ty = sy - 10 * Z, tsz = 46 * Z;
  const showTl = C.sp && ((C.ph === "bal" && C.t >= 1.9) || C.ph === "result");
  if (showTl) {
    if (C.flash > 0) { const k = 1 - C.flash / 0.7, r = (60 + k * 140) * Z, g = c.createRadialGradient(tx, ty, 2, tx, ty, r); const rc0 = C.sp.r >= 1 ? RAR[C.sp.r].col : "#fffae1", rgb = [1, 3, 5].map(i => parseInt(rc0.slice(i, i + 2), 16)).join(","); g.addColorStop(0, "rgba(" + rgb + "," + (0.95 * (1 - k)) + ")"); g.addColorStop(1, "rgba(" + rgb + ",0)"); c.fillStyle = g; c.beginPath(); c.arc(tx, ty, r, 0, 7); c.fill(); }
    if (C.sp.r >= 3) { const rg = c.createRadialGradient(tx, ty, 4, tx, ty, tsz * .95), rc1 = RAR[C.sp.r].col, rgb1 = [1, 3, 5].map(i => parseInt(rc1.slice(i, i + 2), 16)).join(","); rg.addColorStop(0, "rgba(" + rgb1 + ",.55)"); rg.addColorStop(1, "rgba(" + rgb1 + ",0)"); c.fillStyle = rg; c.beginPath(); c.arc(tx, ty, tsz * .95, 0, 7); c.fill(); }
    drawTonling(c, C.sp, tx, ty, tsz, t, C.mut);
    if (C.ph === "bal" && C.t >= 1.9 && C.t < 4.2 && C.sp.r >= 2) { c.globalAlpha = clamp((4.2 - C.t) / 0.8, 0, 1); outlineText(c, RAR[C.sp.r].name + "!", tx, ty - tsz * .85 - (C.t - 1.9) * 6, "30px 'Caveat Brush',cursive", RAR[C.sp.r].col, 6); c.globalAlpha = 1; }
  }
  if (C.ph === "ring" || C.ph === "ringres") {
    const k = 0.62, rc = [sx + 46, sy - 74], mark = 46 * k, r = (C.ph === "ring" ? ringR() : 46) * k;
    hCirc(c, rc[0], rc[1], 96 * k, 11, { fill: WASH, lw: 2.6 });
    c.setLineDash([6, 5]); hCirc(c, rc[0], rc[1], mark, 21, { col: "#4a5b8c", lw: 2.4, single: true }); c.setLineDash([]);
    const d = Math.abs(r / k - 46), near = d <= 8 ? "#6cc04a" : d <= 20 ? "#f0b429" : "#6d86c8";
    const rcol = C.ph === "ringres" ? (C.perfect ? "#6cc04a" : "#f0b429") : near;
    c.globalAlpha = .45; hCirc(c, rc[0], rc[1], r, 31, { col: rcol, lw: 11, single: true }); c.globalAlpha = 1;
    hCirc(c, rc[0], rc[1], r, 33, { col: INK, lw: 2.2 });
    if (C.ph === "ring") { c.save(); c.shadowColor = C.noteCol; c.shadowBlur = C.noteCol === "#fff" ? 0 : 14; c.translate(rc[0] - 12, rc[1] - 16); c.scale(.85, .85); c.fillStyle = C.noteCol === "#fff" ? "#fbf3da" : C.noteCol; c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.ellipse(10, 24, 7, 5, -.4, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(16, 22); c.lineTo(16, 2); c.lineTo(27, 6); c.stroke(); c.restore();
      const msg = (IS_TOUCH ? "Tippe" : "Drücke") + ", wenn der Ring die Marke trifft"; c.font = "26px " + F1; const mw = c.measureText(msg).width + 36; hBox(c, cx - mw / 2, VH - 188, mw, 50, { fill: WASH, s: 14, lw: 2.4 }); outlineText(c, msg, cx, VH - 155, "26px " + F1, INK, 0); }
    else outlineText(c, C.res, rc[0], rc[1] + 7, "24px " + F1, C.perfect ? "#9be05a" : "#ffd45a", 5);
  } else if (C.ph === "freq") {
    const base = VH - 104, ytop = base - 238, ybot = base - 138, cy = (ytop + ybot) / 2, nz = C.noise || 0;
    // Wellenfeld auf Papier
    hBox(c, x0, ytop, W, ybot - ytop, { fill: WASH, s: 2, hatch: true });
    const col = `rgb(${Math.round(42 + nz * 175)},${Math.round(63 - nz * 10)},${Math.round(143 - nz * 100)})`, step = 3, fr = Math.floor(t * 12);
    const wave = () => { c.beginPath(); for (let i = 0; i <= W; i += step) { const ph = i / W * Math.PI * 2 * 3 + t * 2.4, rnd = (hs(i, fr, 3) - .5) * 2, y = cy - (Math.sin(ph) * 32 * (1 - nz * .35) + rnd * nz * 30 + Math.sin(i * .33 + t * 11) * nz * 9); i ? c.lineTo(x0 + i, y) : c.moveTo(x0 + i, y); } c.stroke(); };
    c.globalAlpha = .28; c.strokeStyle = col; c.lineWidth = 9; wave(); c.globalAlpha = 1; c.strokeStyle = INK; c.lineWidth = 1.6; wave();
    // Schieber
    const y1 = base - 86, y2 = base - 66, ym = (y1 + y2) / 2;
    hBox(c, x0, y1, W, y2 - y1, { fill: "rgba(247,239,214,.78)", s: 6, lw: 2.4 });
    for (let k = 1; k < 10; k++) hLine(c, x0 + W * k / 10, y1 + 4, x0 + W * k / 10, y2 - 4, 40 + k, 1.2, "rgba(29,39,66,.45)");
    if (C.lock > 0) { c.fillStyle = "rgba(108,192,74,.8)"; c.fillRect(x0 + 2, y2 + 4, (W - 4) * (C.lock / 0.7), 4); c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(x0 + 2, y2 + 4, (W - 4) * (C.lock / 0.7), 4); }
    const ux = x0 + C.user / C.max * W, hy = y1 - 14;
    hLine(c, ux, hy, ux, y2 + 3, 55, 2.4);
    hCirc(c, ux, hy, 11, 61, { fill: nz === 0 ? "#9fe070" : "#fbf3da", lw: 2.6 });
    outlineText(c, "‹", ux - 24, hy + 7, "26px " + F1, INK, 3); outlineText(c, "›", ux + 24, hy + 7, "26px " + F1, INK, 3);
    outlineText(c, C.user.toFixed(1) + " Hz", clamp(ux, x0 + 36, x0 + W - 36), hy - 20, "18px " + F2, INK, 4);
    const msg = IS_TOUCH ? "Halten = steigen, loslassen = sinken. Finde die Frequenz!" : "Leertaste halten = steigen, loslassen = sinken"; outlineText(c, msg, cx, base - 40, "19px " + F2, INK, 5);
    const bx = cx - 52, by = base - 30; C.cancel = { x: bx, y: by, w: 104, h: 30 }; hBtn(c, bx, by, 104, 30, "Abbrechen", "19px " + F2);
  } else if (C.ph === "bal") {
    const ty0 = VH - 252, bh = 58, ytr = ty0, zw = C.zw * W, zx = x0 + (C.zc - C.zw / 2) * W, zcx = zx + zw / 2, cd = C.t < 2.4;
    hBox(c, x0, ytr, W, bh, { fill: "rgba(247,239,214,.92)", s: 3, hatch: true });
    // Zone wie mit Aquarell getupft
    const inZ = !cd && Math.abs(C.pos - C.zc) <= C.zw / 2;
    c.save(); hPts(c, [[x0 + 2, ytr + 2], [x0 + W - 2, ytr + 2], [x0 + W - 2, ytr + bh - 2], [x0 + 2, ytr + bh - 2]], 3, 0, true); c.clip();
    const zp = [[zx, ytr + 4], [zx + zw, ytr + 4], [zx + zw, ytr + bh - 4], [zx, ytr + bh - 4]];
    hPts(c, zp, 17, 1.6, true); c.fillStyle = inZ ? "rgba(120,200,90,.62)" : "rgba(240,190,70,.5)"; c.fill();
    c.strokeStyle = inZ ? "#3f8a2e" : "#a8741a"; c.lineWidth = 2.6; hPts(c, zp, 19, 1.6, true); c.stroke();
    c.restore();
    if (C.note) { c.save(); c.globalAlpha = Math.min(1, C.note.life); c.translate(x0 + C.note.x * W - 9, ytr + 8); c.fillStyle = "#f3b92f"; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.ellipse(8, 28, 7, 5, -.4, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(14, 26); c.lineTo(14, 8); c.lineTo(23, 12); c.stroke(); c.restore(); }
    if (cd) { const n = Math.floor(C.t / 0.6), s = n < 3 ? String(3 - n) : "Los!"; outlineText(c, s, zcx, ytr + bh * 0.76, "50px " + F1, INK, 6); }
    else {
      const px = x0 + C.pos * W; drawTonling(c, C.sp, px, ytr + bh * 0.42, 40, t, C.mut);
      outlineText(c, "‹", px - 26, ytr + bh * 0.62, "28px " + F1, C.dir < 0 ? INK : "rgba(29,39,66,.28)", 0); outlineText(c, "›", px + 26, ytr + bh * 0.62, "28px " + F1, C.dir > 0 ? INK : "rgba(29,39,66,.28)", 0);
    }
    // Fortschritt als Tintenbalken
    const pw = W - 16, py2 = ytr + bh + 14, pf = Math.max(4, (pw - 4) * clamp(C.prog, 0, 1));
    hBox(c, x0 + 8, py2, pw, 14, { fill: "rgba(247,239,214,.9)", s: 23, lw: 2.4 });
    c.save(); hPts(c, [[x0 + 10, py2 + 2], [x0 + 10 + pf, py2 + 2], [x0 + 10 + pf, py2 + 12], [x0 + 10, py2 + 12]], 27, .8, true); c.fillStyle = C.bonus > 0 ? "#f3b92f" : "#7bbf5a"; c.fill(); c.clip(); c.strokeStyle = "rgba(29,39,66,.35)"; c.lineWidth = 1; for (let k = 0; k < pf + 12; k += 6) { c.beginPath(); c.moveTo(x0 + 10 + k, py2 + 12); c.lineTo(x0 + 16 + k, py2 + 2); c.stroke(); } c.restore();
    const pc = Math.round((C.rm - 1) * 100), ft = Math.round((C.fast - 1) * 100), lab = [pc ? (pc > 0 ? "+" : "") + pc + "% Fortschritt" : "", ft > 0 ? "+" + ft + "% Tempo (über deiner Resonanz)" : ""].filter(Boolean).join(" · "); if (lab) outlineText(c, lab, x0 + W / 2, py2 + 34, "16px " + F2, ft > 0 ? "#b03a2e" : INK, 5);
    if (!cd && C.t < 6) outlineText(c, (IS_TOUCH ? "Halten = Zone steigt, loslassen = sinkt" : "Leertaste halten = Zone steigt, loslassen = sinkt"), cx, ytr - 12, "22px " + F1, INK, 5);
    const bx = cx - 52, by = py2 + 44; C.cancel = { x: bx, y: by, w: 104, h: 28 }; hBtn(c, bx, by, 104, 28, "Abbrechen", "18px " + F2);
  } else if (C.ph === "result") {
    const sp = C.sp, tl = C.result, m = tl.mut ? mutOf(tl.mut) : null, rc = RAR[sp.r].col;
    hBox(c, cx - Math.min(W, 520) / 2, VH - 206, Math.min(W, 520), 112, { fill: WASH, s: 31, hatch: true });
    for (let i = 0; i < 6; i++) { const ph = ((t * 0.5 + i / 6) % 1), nx = tx + Math.sin(t * 2 + i * 1.7) * 38, ny = ty - 40 * Z * .8 - ph * 90; c.globalAlpha = Math.sin(ph * Math.PI) * .9; outlineText(c, i % 2 ? "♪" : "♫", nx, ny, "24px " + F1, INK, 3); } c.globalAlpha = 1;
    outlineText(c, "Du hast gefangen: " + (m ? m.name + " " : "") + sp.n + "!", cx, VH - 166, "32px " + F1, rc === "#9aa3b2" ? INK : rc, 6);
    outlineText(c, RAR[sp.r].name + " · Frequenz: " + C.target.toFixed(1) + " Hz", cx, VH - 138, "21px " + F2, INK, 4);
    const vt = "+" + C.xp + " EP · Wert " + tlValue(tl); c.font = "19px " + F2; const vw2 = c.measureText(vt).width; outlineText(c, vt, cx - 11, VH - 114, "19px " + F2, INK, 4);
    c.save(); c.translate(cx - 11 + vw2 / 2 + 15, VH - 120); c.lineJoin = c.lineCap = "round"; c.fillStyle = "#f3b92f"; c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.moveTo(3, 5); c.lineTo(3, -8); c.lineTo(9, -5); c.lineTo(9, -1); c.lineTo(3, -4); c.fill(); c.stroke(); c.beginPath(); c.ellipse(-1.5, 5, 5, 3.6, -.35, 0, 7); c.fill(); c.stroke(); c.restore();
  } else if (C.ph === "miss" || C.ph === "none" || C.ph === "flee") {
    const msg = C.ph === "flee" ? "Der Tonling flieht" : C.ph === "none" ? "Hier ist es still" : "Daneben"; c.font = "36px " + F1; const mw = c.measureText(msg).width + 56;
    hBox(c, cx - mw / 2, VH - 196, mw, 62, { fill: WASH, s: 41 }); outlineText(c, msg, cx, VH - 152, "36px " + F1, INK, 0);
  }
}

/* ----- Start ----- */
function frame(now) {
  const dt = Math.min(0.05, (now - frame.last) / 1000 || 0.016); frame.last = now; const t = now / 1000;
  update(dt); G.hd = heldDesc(); placeDlg(); if (typeof mpTick === "function") mpTick(dt); CAM = render(G, t); if (C.ph) drawCatch(t);
  requestAnimationFrame(frame);
}
/* Kein Hineinzoomen per Doppeltipp oder Spreizen (Handy) */
["gesturestart", "gesturechange", "gestureend", "dblclick"].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
let lastTap = 0; document.addEventListener("touchend", e => { const n = Date.now(); if (n - lastTap < 350) e.preventDefault(); lastTap = n; }, { passive: false });
document.addEventListener("touchmove", e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
window.addEventListener("resize", resize);
resize(); renderBar(); renderQuests(); renderStats(); checkZone(); $("btnMute").style.opacity = S.mute ? .45 : 1;
if (!S.stats.tries && !S.q.m1) toast("Sprich mit Tilda im Dorf. Sie hat eine Aufgabe für dich.");
window.__G = { Snd, S, G, C, T, NPCS, actionPlay, talk, completeQuest, QUESTS, hitsWorld, solidAt, zoneAt, ZN, pressRing, ringR, endCatch, beginFreq, beginBal, ZINFO, chunks, openInv, openIndex, openShop, openHelp, toast };
setTimeout(checkOffers, 2500);
requestAnimationFrame(frame);
