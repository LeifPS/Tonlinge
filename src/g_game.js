/* ===== SPIEL: Eingabe, Bewegung, Quests, Fangen, Oberfläche ===== */
load();
function applyRelease() { const f = S.flags; if (f.gate3Open || f.gate3Done) { f.gate3Done = true; f.gate3Open = RELEASE.areas >= 3; } if (f.gate4Open || f.gate4Done) { f.gate4Done = true; f.gate4Open = RELEASE.areas >= 4; } }
applyRelease();
for (const id in FWALLS) if (S.flags["open_" + id]) { const f = FWALLS[id]; T[f[1]][f[0]] = 1; }
/* Versteckte Räume: bis die Wand nachgibt, sieht der Raum dahinter wie massive Wand aus */
const SECRET_CELLS = {};
for (const id in FWALLS) { const f = FWALLS[id], n = NPCS[id]; if (!n) continue; const seen = new Set([n.x + "," + n.y]), q = [[n.x, n.y]], cells = []; let ok = true;
  while (q.length) { const [x, y] = q.pop(); cells.push([x, y, T[y][x]]); if (cells.length > 400) { ok = false; break; } for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k) || (nx === f[0] && ny === f[1]) || !T[ny]) continue; const v = T[ny][nx]; if (v === 1 || v === 2) { seen.add(k); q.push([nx, ny]); } } }
  if (!ok) continue; SECRET_CELLS[id] = cells; if (!S.flags["open_" + id]) cells.forEach(c => T[c[1]][c[0]] = 0); }
function revealSecret(id) { (SECRET_CELLS[id] || []).forEach(c => T[c[1]][c[0]] = c[2]); chunks.clear(); }
const G = { px: S.px, py: S.py, moving: false, face: 1 };
const keys = {}; let holdWall = 0, holdKey = "", curZone = null, curArea = 0, lastSave = 0, ambT = 4, hintShown = false;
let CAM = { ox: 0, oy: 0 };
const C = { ph: null };            // Fang-Zustand
const stick = { x: 0, y: 0 };
const NPC_R = 15;

/* ----- Hilfen ----- */
function toast(txt, bad, ms, html) { const d = document.createElement("div"); d.className = "toast" + (bad ? " bad" : ""); if (html) d.innerHTML = txt; else d.textContent = txt; $("toasts").appendChild(d); const life = ms || 3600; setTimeout(() => { d.style.transition = "opacity .7s"; d.style.opacity = "0"; }, Math.max(0, life - 700)); setTimeout(() => d.remove(), life); while ($("toasts").children.length > 4) $("toasts").firstChild.remove(); }
const uiOpen = () => !$("win").hidden || !$("dlg").hidden || !$("cre").hidden;
const paused = () => uiOpen() || C.ph || (matchMedia("(pointer:coarse)").matches && matchMedia("(orientation:portrait)").matches);
try { window.addEventListener("pointerdown", () => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock("landscape").catch(() => {}); } catch (_) {} }, { once: true }); } catch (_) {}
const solidAt = (px, py) => { const tx = Math.floor(px / TS), ty = Math.floor(py / TS); if (tx < 0 || ty < 0 || tx >= WW || ty >= WH) return true; for (const [G0, fl] of GATES) if (!S.flags[fl] && ty === G0.y && tx >= G0.x && tx < G0.x + G0.w) return true; return solidT(T[ty][tx]); };
function hitsWorld(x, y) { const r = 8; return solidAt(x - r, y - 3) || solidAt(x + r, y - 3) || solidAt(x - r, y + 7) || solidAt(x + r, y + 7); }
function npcHit(x, y) { for (const id in NPCS) poseOf(id); for (const a of AMB_SOLID) if (Math.hypot(x - a[0], y - a[1]) < NPC_R) return true; for (const id in NPCS) { const n = NPCS[id]; if (n.secret && !S.flags["open_" + id]) continue; if (Math.hypot(x - (n.x * TS + TS / 2), y - (n.y * TS + TS - 4)) < NPC_R) return true; } return false; }
function nearNpc() { let best = null, bd = 56; for (const id in NPCS) { const n = NPCS[id]; if (n.secret && !S.flags["open_" + id]) continue; const d = Math.hypot(G.px - (n.x * TS + TS / 2), G.py - (n.y * TS + TS - 4)); if (d < bd) { bd = d; best = id; } } return best; }

/* ----- Quests ----- */
const QORDER = Object.keys(QUESTS);
const qDone = id => S.q[id] && S.q[id].st === "done";
function qAvail(id) { const q = QUESTS[id]; return !S.q[id] && (!q.after || qDone(q.after)); }
function npcQuest(npcId) {
  const l = QORDER.filter(id => QUESTS[id].npc === npcId);
  for (const id of l) { const s = S.q[id]; if (s && s.st === "active") return { id, kind: qReady(id) ? "ready" : "active" }; }
  for (const id of l) if (qAvail(id)) { const w = qWhy(QUESTS[id]); return { id, kind: w ? "locked" : "offer", why: w }; }
  return null;
}
/* Warum kann man (noch) nicht mit dem NPC reden? -> Kategorie oder null. Quests dürfen night/day/idx verlangen. */
function qWhy(q) {
  if (S.lvl < q.lvl) return "lvl";
  if (q.night && !isNight()) return "night";
  if (q.day && isNight()) return "day";
  if (q.idx && SPECIES.filter(s => S.dex[s.id] && S.dex[s.id].c > 0).length < q.idx) return "idx";
  return null;
}
const THINK = {
  lvl: ["Ich sollte erst mehr Erfahrung sammeln.", "Hm, dafür bin ich noch nicht stark genug.", "Ich glaube, ich muss noch ein bisschen üben.", "Vielleicht komme ich später wieder, wenn ich ein höheres Level habe.", "Noch zu früh. Ich sollte erst ein paar Tonlinge fangen."],
  night: ["Ich sollte in der Nacht wiederkommen.", "Hier passiert erst nach Sonnenuntergang etwas.", "Vielleicht ist es nachts interessanter."],
  day: ["Ich sollte tagsüber wiederkommen.", "Jetzt ist es zu dunkel, ich komme bei Tageslicht wieder."],
  flute: ["Ich habe noch gar kein Instrument. Vielleicht kann mir jemand im Dorf helfen.", "Ohne Instrument kann ich keinen Tonling anlocken."],
  soon: ["Hinter dem Tor flackert Sternenlicht. Aber der Weg ist noch nicht gestimmt.", "Das Tor leuchtet, doch dahinter liegt noch Nebel. Bald vielleicht.", "Noch nicht. Dieser Teil der Welt ist noch nicht bereit für Besucher."],
  idx: ["Ich sollte erst den vollen Index haben.", "Mir fehlen noch Tonlinge im Index.", "Ich sollte erst mehr Arten entdecken."]
};
/* Die Figur spricht zu sich selbst: gleiche Sprechblase und Schreibtempo wie bei NPCs, über dem eigenen Kopf */
const MSAY = { t: "", pos: 0, tm: null, tm2: null };
function sayMe(why) {
  const l = THINK[why] || THINK.lvl; clearTimeout(MSAY.tm); clearTimeout(MSAY.tm2); $("meSay").firstChild.textContent = S.name || "Ich"; MSAY.t = pick(l); MSAY.pos = 0; $("meSay").hidden = false;
  const step = () => { MSAY.pos++; const a = document.createElement("span"), b = document.createElement("span"), el = $("meTxt"); a.textContent = MSAY.t.slice(0, MSAY.pos); b.className = "hid"; b.textContent = MSAY.t.slice(MSAY.pos); el.textContent = ""; el.append(a, b);
    const ch = MSAY.t[MSAY.pos - 1]; if (ch !== " " && MSAY.pos % 2 === 0) Snd.tick(.045, 330 + 3 * 38 + (MSAY.pos % 3) * 24, .03);
    if (MSAY.pos >= MSAY.t.length) { MSAY.tm2 = setTimeout(() => { $("meSay").hidden = true; }, 2200); return; }
    let d = TYPE.letter; if (ch === "," || ch === ";" || ch === ":") d = TYPE.comma; else if (".!?…".includes(ch) && (MSAY.pos >= MSAY.t.length || MSAY.t[MSAY.pos] === " ")) d = TYPE.period; MSAY.tm = setTimeout(step, d); };
  step();
}
function placeMe() { const e = $("meSay"); if (e.hidden) return; const w = e.offsetWidth, h = e.offsetHeight, x = (G.px - CAM.ox) * Z, y = (G.py - 44 - CAM.oy) * Z; e.style.left = clamp(x - w / 2, 8, VW - w - 8) + "px"; e.style.top = clamp(y - h, 64, VH - h - 90) + "px"; }
const idxReady = () => !S.flags.hasIdx && qDone("m2");
function npcMark(id) { if (id === "marlo" && idxReady()) return "!"; const nq = npcQuest(id); if (nq) { if (nq.kind === "ready") return "?"; if (nq.kind === "offer") return "!"; } return NPCS[id].shop ? "$" : null; }
const IDXA = a => SPECIES.filter(s => s.a === a && s.r <= 4);
const idxHave = a => IDXA(a).filter(s => S.dex[s.id] && S.dex[s.id].c > 0).length;
const qParts = q => q.parts || [{ n: q.n, f: q.f, txt: q.desc }];
const invMatch = p => S.inv.filter(t => SP[t.sp] && matchFilter(p.f || {}, SP[t.sp], t));
/* Aufgabenarten (k): ohne k = Fangen; perf (ev cast|catch) = perfekte Würfe/Fänge; lvl = Level erreichen; idx (a) = Index eines Bereichs;
   pay = Noten bezahlen; give = Tonlinge abgeben (f); item (id) = Fundstück aufheben. to = bei diesem NPC abgeben statt beim Auftraggeber. */
function partCnt(s, p, i) {
  if (s.d && s.d[i]) return p.n;
  switch (p.k) { case "lvl": return S.lvl; case "idx": return idxHave(p.a); case "pay": return S.gold; case "give": return invMatch(p).length; }
  if (!s.p && i === 0 && !p.k) return s.n || 0;
  return (s.p && s.p[i]) || 0;
}
const qCntS = (q, s) => q.parts ? q.parts.map((p, i) => partCnt(s, p, i)) : [s.n || 0];
const qCnt = id => qCntS(QUESTS[id], S.q[id]);
const qReady = id => { const q = QUESTS[id], c = qCnt(id); return qParts(q).every((p, i) => c[i] >= p.n); };
function qBump(id, i) { const s = S.q[id]; if (!s.p) { s.p = []; if (s.n && i === 0) s.p[0] = s.n; } s.p[i] = (s.p[i] || 0) + 1; }
function qAfter(id, was) { if (!was && qReady(id)) toast("Quest bereit zur Abgabe: " + QUESTS[id].title); renderQuests(); }
function onCatchQuests(tl) { const sp = SP[tl.sp]; let any = false; for (const id in S.q) { const s = S.q[id], q = QUESTS[id]; if (!q || s.st !== "active") continue; const was = qReady(id); let hit = false;
    qParts(q).forEach((p, i) => { if (p.k) return; const cur = q.parts ? partCnt(s, p, i) : (s.n || 0); if (cur < p.n && matchFilter(p.f, sp, tl)) { if (q.parts) qBump(id, i); else s.n = cur + 1; hit = any = true; } });
    if (hit && !was && qReady(id)) toast("Quest bereit zur Abgabe: " + q.title); } if (any) renderQuests(); }
function onPerfect(ev) { let any = false; for (const id in S.q) { const s = S.q[id], q = QUESTS[id]; if (!q || s.st !== "active" || !q.parts) continue; const was = qReady(id); let hit = false;
    q.parts.forEach((p, i) => { if (p.k === "perf" && p.ev === ev && ((s.p && s.p[i]) || 0) < p.n) { qBump(id, i); hit = any = true; } }); if (hit && !was && qReady(id)) toast("Quest bereit zur Abgabe: " + q.title); } if (any) renderQuests(); }
/* Fundstücke in der Welt: nur sichtbar, solange eine aktive Quest sie braucht */
function itemWanted(it) { for (const id in S.q) { const s = S.q[id], q = QUESTS[id]; if (!q || s.st !== "active" || !q.parts) continue; const i = q.parts.findIndex(p => p.k === "item" && p.id === it.id); if (i >= 0 && !((s.p && s.p[i]) || 0) && !(s.d && s.d[i])) return [id, i]; } return null; }
function nearItem() { let best = null, bd = 44; for (const id in ITEMS) { const it = ITEMS[id]; if (!itemWanted(it)) continue; const d = Math.hypot(G.px - (it.x * TS + TS / 2), G.py - (it.y * TS + TS - 6)); if (d < bd) { bd = d; best = id; } } return best; }
function pickItem(id) { const it = ITEMS[id], w = itemWanted(it); if (!w) return; const was = qReady(w[0]); qBump(w[0], w[1]); Snd.play("quest", 1.3, .6); toast("Gefunden: " + it.n); qAfter(w[0], was); save(); }
function consumeParts(q, s, onlyTo) { qParts(q).forEach((p, i) => { if (s.d && s.d[i]) return; if ((onlyTo === undefined ? p.to : onlyTo !== p.to) ) return;
    if (p.k === "pay") S.gold -= p.n; else if (p.k === "give") { let k = p.n; for (const t of invMatch(p)) { if (!k) break; const ix = S.inv.indexOf(t); if (ix >= 0) { S.inv.splice(ix, 1); if (S.hold === t.uid) S.hold = null; k--; } } } }); }
function deliver(qid, i) { const q = QUESTS[qid], s = S.q[qid], p = q.parts[i]; if (partCnt(s, p, i) < p.n) return false; const was = qReady(qid);
  if (p.k === "pay") S.gold -= p.n; else if (p.k === "give") { let k = p.n; for (const t of invMatch(p)) { if (!k) break; const ix = S.inv.indexOf(t); if (ix >= 0) { S.inv.splice(ix, 1); if (S.hold === t.uid) S.hold = null; k--; } } }
  s.d = s.d || []; s.d[i] = 1; renderBar(); renderStats(); qAfter(qid, was); save(); Snd.play("quest", 1.1, .6); return true; }
function completeQuest(id) {
  const q = QUESTS[id], r = q.rew; if (q.parts) { consumeParts(q, S.q[id]); renderBar(); } S.q[id].st = "done"; if (S.flags.untr) delete S.flags.untr[id]; if (id === "m2" && !S.flags.hasIdx) setTimeout(() => toast("Marlo möchte dir etwas zeigen.", false, 5000), 1400); if (r.gold) S.gold += r.gold; if (r.xp) addXp(r.xp);
  if (r.instr && !S.instr.includes(r.instr)) { S.instr.push(r.instr); renderBar(); toast("Neues Instrument: " + INSTR[r.instr].name); }
  if (q.flag === "gate") { S.flags.gateOpen = true; toast("Das Tor zu den Glimmerhöhlen ist offen!"); }
  if (q.flag === "look") { S.flags.lookOpen = true; toast("Marlo ändert jetzt dein Aussehen."); }
  if (q.flag === "gate3") { S.flags.gate3Done = true; applyRelease(); if (S.flags.gate3Open) toast("Das Sterntor ist offen!"); else { toast("Das Sterntor leuchtet auf. Dahinter liegt noch Nebel.", false, 5000); showBanner("Fortsetzung folgt", "Das Sterntor leuchtet"); } }
  if (q.flag === "gate4") { S.flags.gate4Done = true; applyRelease(); if (S.flags.gate4Open) toast("Das Muscheltor am Nordlichtgrat ist offen!"); else { toast("Das Muscheltor leuchtet auf. Dahinter liegt noch Nebel.", false, 5000); showBanner("Fortsetzung folgt", "Das Muscheltor leuchtet"); } }
  Snd.play("quest", 1, 0.95); Snd.play("coins", 1, 0.55, 0.7); if (q.flag === "gate" || q.flag === "gate3" || q.flag === "gate4") Snd.play("tor", 1, 0.9, 1.2); renderQuests(); renderStats(); save(); setTimeout(checkOffers, 1500);
}
const QSTAR = '<svg class="qi" viewBox="0 0 24 24"><path d="M11.8 1.6 Q14.2 4.0 14.9 8.2 Q19.0 8.2 21.9 9.0 Q18.3 10.7 15.9 13.7 Q16.4 17.8 17.7 20.6 Q14.0 18.7 11.6 16.5 Q8.9 18.5 5.8 21.0 Q6.6 16.5 7.2 13.4 Q3.9 11.0 2.2 9.5 Q6.1 8.9 9.4 8.5 Q10.3 5.2 11.8 1.6z" fill="#ffd45a" stroke="#1d2742" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round"/><path d="M11.9 1.6 Q14.4 4.8 15.1 8.9 Q18.8 9.2 21.5 9.2 Q19.1 11.6 16.4 14.2 Q18.2 18.3 18.4 20.4 Q15.5 18.8 12.7 16.4 Q8.3 19.2 5.8 21.1 Q6.8 18.5 7.1 13.7 Q5.0 11.0 1.5 9.3 Q5.3 9.4 9.7 8.7 Q9.8 5.1 11.9 1.6z" fill="none" stroke="#1d2742" stroke-width="1" opacity=".45" stroke-linejoin="round"/></svg>', QTRI = '<svg class="qi" viewBox="0 0 24 24"><path d="M11.6 2.7 Q15.8 12.1 20.5 19.8 Q10.6 19.5 2.6 19.5 Q7.2 12.0 11.6 2.7z" fill="#9fd08a" stroke="#1d2742" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round"/><path d="M12.5 3.8 Q17.8 10.7 20.6 19.4 Q10.9 19.2 2.8 20.4 Q6.9 12.1 12.5 3.8z" fill="none" stroke="#1d2742" stroke-width="1" opacity=".45" stroke-linejoin="round"/></svg>';
const CHK = '<svg class="qc" viewBox="0 0 16 16"><path d="M2 8.5 6 13 15 2" fill="none" stroke="#3a8450" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const MUT_STEM = { "gläsern": "glas", "funkelnd": "funkel", "sternklar": "stern", "bemoost": "moos", "klirrend": "klirr", "betörend": "beto", "urtönend": "urton" };
const mutTxt = t => t.replace(/(gläsern|funkelnd|sternklar|bemoost)\w*/gi, w => { const m = mutOf(MUT_STEM[w.toLowerCase().replace(/(gläsern|funkelnd|sternklar|bemoost|klirrend|betörend|urtönend).*/, "$1")]); return m ? `<span class="mt" style="color:${m.dk || m.col}">${w}</span>` : w; });
function qRows(q, n, done, s) {
  const parts = qParts(q), cnt = s ? qCntS(q, s) : [n], rdy = done || parts.every((p, i) => (cnt[i] || 0) >= p.n);
  let h = parts.map((p, i) => { const ok = done || (cnt[i] || 0) >= p.n, hit = /^(Fange|Fang|Besiege|Sammle|Finde|Bringe|Zahle|Bezahle|Erreiche|Führe)\b/.exec(p.txt), body = hit ? p.txt.slice(hit[0].length) : p.txt;
    return `<div class="qr ${ok ? "ok" : ""}"><i class="box">${ok ? CHK : ""}</i><span>${hit ? `<em>${hit[0]}</em>` : ""}${mutTxt(body)} <span class="cnt">(${Math.min(cnt[i] || 0, p.n)}/${p.n})</span></span></div>`; }).join("");
  return h + `<div class="qr"><i class="box">${done ? CHK : ""}</i><span>${done ? "Bei <em>" + NPCS[q.npc].n + "</em> abgegeben." : rdy ? "<em>Sprich</em> mit " + NPCS[q.npc].n + "." : "Kehre zu <em>" + NPCS[q.npc].n + "</em> zurück."}</span></div>`;
}
/* ----- Questbuch ----- */
let logSel = null;
function openQuestLog() {
  winKind = "log"; const act = QORDER.filter(id => S.q[id] && S.q[id].st === "active"), done = QORDER.filter(id => S.q[id] && S.q[id].st === "done").reverse();
  const main = act.filter(id => QUESTS[id].main), side = act.filter(id => !QUESTS[id].main);
  if (!logSel || !S.q[logSel]) logSel = main[0] || side[0] || done[0] || null;
  const grp = (t, l, ic) => `<div class="h3 qlh">${ic}${t} <span class="muted" style="font-size:18px">(${l.length})</span></div>` + (l.length ? l.map(id => `<button class="qli ${id === logSel ? "on" : ""} ${S.flags.untr && S.flags.untr[id] && S.q[id].st !== "done" ? "off" : ""}" data-q="${id}">${QUESTS[id].title}</button>`).join("") : `<div class="muted" style="font-size:16px;padding-left:8px">Keine</div>`);
  const STARI = QSTAR, TRII = QTRI, CHI = '<svg class="qi" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#c9c3b0" stroke="#1d2742" stroke-width="2"/><path d="M7 12.5l3.4 3.4L17 8.5" fill="none" stroke="#1d2742" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  let right = `<div class="muted" style="padding:20px">Noch keine Aufträge. Sprich mit den Leuten im Dorf.</div>`;
  if (logSel) { const q = QUESTS[logSel], s = S.q[logSel], dn = s.st === "done", x = QX[logSel], off = x && x.offer ? (Array.isArray(x.offer) ? x.offer.join(" ") : x.offer) : "", r = q.rew, rw = [];
    if (r.xp) rw.push(r.xp.toLocaleString("de-DE") + " EP"); if (r.gold) rw.push(r.gold.toLocaleString("de-DE") + " ♪"); if (r.instr) rw.push("Instrument: <em>" + INSTR[r.instr].name + "</em>");
    const tr = !(S.flags.untr && S.flags.untr[logSel]);
    right = `<h2 class="qlt">${q.title}</h2><div class="qlk">${dn ? CHI + "Abgeschlossen" : q.main ? STARI + "Hauptquest" : TRII + "Nebenquest"} · von ${NPCS[q.npc].n}</div><div class="qld">${off || q.desc}</div><div class="h3">Ziele</div>${qRows(q, s.n || 0, dn, s)}<div class="h3">Belohnungen</div>${rw.length ? rw.map(t => `<div class="qr"><i class="box">${dn ? CHK : ""}</i><span>${t}</span></div>`).join("") : `<div class="muted">Keine</div>`}${dn ? "" : `<button class="btn qtr" id="qTrack">${tr ? "Nicht verfolgen" : "Verfolgen"}</button><div class="muted" style="font-size:15px;text-align:center">${tr ? "Wird links auf dem Bildschirm angezeigt." : "Wird links nicht angezeigt."}</div>`}`; }
  openWin("Questbuch", `<div class="ql"><div class="qll">${grp("Hauptquests", main, STARI)}${grp("Nebenquests", side, TRII)}${grp("Abgeschlossen", done, CHI)}</div><div class="qlr">${right}</div></div>`, () => {
    $("winBody").querySelectorAll("[data-q]").forEach(b => b.onclick = () => { logSel = b.dataset.q; openQuestLog(); });
    const t = $("qTrack"); if (t) t.onclick = () => { S.flags.untr = S.flags.untr || {}; if (S.flags.untr[logSel]) delete S.flags.untr[logSel]; else S.flags.untr[logSel] = 1; save(); renderQuests(); openQuestLog(); };
  });
}
function renderQuests() {
  const el = $("qList"); let h = "";
  const act = QORDER.filter(id => S.q[id] && S.q[id].st === "active" && !(S.flags.untr && S.flags.untr[id]));
  act.sort((a, b) => (QUESTS[b].main ? 1 : 0) - (QUESTS[a].main ? 1 : 0));
  const STAR = QSTAR, TRI = QTRI;
  for (const id of act) { const q = QUESTS[id], s = S.q[id], rdy = qReady(id);
    h += `<div class="q ${q.main ? "main" : ""} ${rdy ? "rdy" : ""}"><b>${q.main ? STAR : TRI}${q.title}</b>${qRows(q, s.n, false, s)}</div>`; }
  if (!act.length) h = `<div class="muted" style="font-size:15px">Kein Auftrag. Suche <b style="color:#c97d12">!</b> über den Köpfen.</div>`;
  $("quests").classList.toggle("empty", !act.length);
  el.innerHTML = h;
}
function renderStats() { $("stLv").textContent = S.lvl; $("stGold").textContent = S.gold; $("xpFill").style.width = Math.round(S.xp / xpNeed(S.lvl) * 100) + "%"; $("xpbar").title = S.xp + " / " + xpNeed(S.lvl) + " EP"; }
function checkOffers() {
  S.flags.nt = S.flags.nt || {}; let names = [];
  for (const id of QORDER) { const q = QUESTS[id], n = NPCS[q.npc]; if (id === "m1") { S.flags.nt[id] = 1; continue; } if (n.area > RELEASE.areas) continue; if (S.flags.nt[id] || !qAvail(id) || S.lvl < q.lvl) continue; if (n.secret && !S.flags["open_" + q.npc]) continue; S.flags.nt[id] = 1; if (!names.includes(n.n)) names.push(n.n); }
  for (const sid in SHOPS) for (const it of SHOPS[sid].items) { const key = "shop_" + it.id; if (NPCS[sid].area > RELEASE.areas || S.flags.nt[key] || S.lvl < it.lvl || S.instr.includes(it.id)) continue; S.flags.nt[key] = 1; const nn = NPCS[sid].n; if (!names.includes(nn)) names.push(nn); }
  if (names.length) { if (names.length > 4) names = [...names.slice(0, 3), (names.length - 3) + " weitere"]; toast(names.length === 1 ? names[0] + " könnte jetzt etwas für dich haben." : names.slice(0, -1).join(", ") + " und " + names[names.length - 1] + " könnten jetzt etwas für dich haben.", false, 7000); Snd.play("ping", 1, .7); save(); }
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
  DL.ch.forEach(c => { const b = document.createElement("button"); b.className = "btn"; b.textContent = c.t; if (c.dis) b.disabled = true; b.onclick = () => { Snd.play("klick", 1, .6); c.f(); }; ch.appendChild(b); });
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
  if (id === "marlo" && idxReady()) { const v0 = NPC_VOICE[id] || 0;
    say(NPCS[id].n, ["Na, Tilda hat dir erzählt, dass du schon ein paar besondere Klänge gefunden hast. Das habe ich gehört.", "Weißt du, ich führe seit Jahren ein Verzeichnis aller Tonlinge, die es hier gibt. Wo sie leben, wie sie klingen, welche Töne sie mögen.", "Meine Seiten sind fast voll. Du bist viel unterwegs, du brauchst es mehr als ich. Nimm es und trag ein, was du findest."],
      [{ t: "Verzeichnis annehmen", f: () => { S.flags.hasIdx = 1; save(); renderBar(); Snd.play("quest", 1, .8); toast("Du hast den Index bekommen! Öffne ihn mit I.", false, 5500); say(NPCS[id].n, "Jeder Tonling, den du hörst, taucht dort auf. Viel Erfolg beim Sammeln.", [{ t: "Danke", f: closeDlg }], v0); } }], v0); return; }
  const n = NPCS[id], nq = npcQuest(id), ch = [], v = NPC_VOICE[id] || 0; let pages;
  const root = () => talk(id);
  if (nq) {
    const x = QX[nq.id], q = QUESTS[nq.id];
    if (nq.kind === "offer") { pages = [...greetPages(id), ...x.offer, ...(q.parts && q.parts.length > 1 ? ["Das brauche ich von dir: " + q.parts.map(p => p.txt.replace(/\.$/, "")).join("; ") + "."] : [])]; ch.push({ t: "Annehmen", f: () => { S.q[nq.id] = { st: "active", n: 0 }; if (!S.flags.gotFlute) { S.flags.gotFlute = 1; S.eq = "holz"; S.hold = null; toast("Du hast die Holzflöte bekommen!"); Snd.play("quest", 1, .7); renderBar(); } toast("Quest angenommen: " + q.title); renderQuests(); save(); say(n.n, "Gut. Ich verlasse mich auf dich.", [{ t: "Tschüss", f: closeDlg }], v); } }, { t: "Später", f: closeDlg }); }
    else if (nq.kind === "locked") pages = [...greetPages(id), x.locked || pick(LOCKED_GENERIC), ...chatPages(id)];
    else if (nq.kind === "active") pages = [x.remind, ...chatPages(id)];
    else { pages = x.doneSoon && ((q.flag === "gate3" && RELEASE.areas < 3) || (q.flag === "gate4" && RELEASE.areas < 4)) ? x.doneSoon : x.done; ch.push({ t: "Belohnung nehmen", f: () => { completeQuest(nq.id); const r = q.rew, parts = []; if (r.xp) parts.push(r.xp + " EP"); if (r.gold) parts.push(r.gold + " ♪"); if (r.instr) parts.push(INSTR[r.instr].name); say(n.n, "Danke dir." + (parts.length ? "  (" + parts.join(", ") + ")" : ""), [{ t: "Tschüss", f: closeDlg }], v); } }); }
  } else pages = [...greetPages(id), ...chatPages(id)];
  for (const qid of QORDER) { const qs = S.q[qid], qq = QUESTS[qid]; if (!qs || qs.st !== "active" || !qq.parts) continue; qq.parts.forEach((p, i) => { if (p.to === id && !(qs.d && qs.d[i]) && partCnt(qs, p, i) >= p.n) ch.push({ t: p.lbl || "Übergeben", f: () => { if (deliver(qid, i)) say(n.n, p.thx || "Danke dir!", [{ t: "Tschüss", f: closeDlg }], v); } }); }); }
  if (id === "marlo" && S.flags.lookOpen) ch.push({ t: "Aussehen ändern", f: () => { closeDlg(); toggleWin("cus"); } });
  if (n.shop) ch.push({ t: "Laden", f: () => { closeDlg(); openShop(n.shop, id); } });
  if (n.buy) ch.push({ t: "Tonlinge verkaufen", f: () => { closeDlg(); openShop(n.shop, id, "sell"); } });
  if (!(nq && (nq.kind === "offer"))) ch.push({ t: "Tschüss", f: nq && nq.kind === "locked" ? () => { closeDlg(); setTimeout(() => sayMe(nq.why), 350); } : closeDlg });
  say(n.n, pages, ch, v);
}

/* ----- Fenster ----- */
function openWin(title, html, after) { $("winTitle").textContent = title; $("winBody").innerHTML = html; $("win").hidden = false; if (after) after(); Snd.play("klick", 1, .5); }
function closeWin() { $("win").hidden = true; $("winBody").innerHTML = ""; }
function thumb(sp, mut, size = 78, silhouette) { const c = document.createElement("canvas"); c.width = c.height = size * 2; const x = c.getContext("2d"); drawTonling(x, sp, size, size * 1.05, size * 1.25, 0.3, mut); return c; }
function fillThumbs() { $("winBody").querySelectorAll("canvas[data-sp]").forEach(cn => { const sp = SP[cn.dataset.sp], m = cn.dataset.mut || null; cn.width = cn.height = 156; drawTonling(cn.getContext("2d"), sp, 78, 82, 100, 0.3, m || null); }); $("winBody").querySelectorAll("canvas[data-ic]").forEach(cn => { cn.width = cn.height = 100; drawIcon(cn.getContext("2d"), cn.dataset.ic, 0, 0, 100); }); }
function invSorted() { return S.inv.map((t, i) => ({ t, i })).sort((a, b) => SP[b.t.sp].r - SP[a.t.sp].r || (b.t.mut ? 1 : 0) - (a.t.mut ? 1 : 0)); }
let invSel = -1;
function infoHtml(v) {
  const it = itemOf(v); if (!it) return `<p class="muted" style="margin:0">Leer. Zieh etwas hierher oder tausche Plätze.</p>`;
  if (it.k === "x") return it.id === "bag" ? `<b>Instrumentbeutel</b><small>Instrumente ansehen und wechseln (B)</small>` : it.id === "inv" ? `<b>Inventar</b><small>Alle Tonlinge und Gegenstände, sortieren (G)</small>` : it.id === "log" ? `<b>Questbuch</b><small>Alle Aufträge, Auswahl und Erledigtes (Q)</small>` : `<b>Index</b><small>Alle Tonlinge, die du kennst (I)</small>`;
  if (it.k === "i") { const i = INSTR[it.id]; return `<b>${i.name}</b>${S.eq === it.id && !S.hold ? " (in der Hand)" : ""}${statHtml(i)}${i.pas ? `<small style="color:#7a4fb0">${PAS_TXT[i.pas]}</small>` : ""}${(() => { const m = MUTS.find(x => x.ins === id); return m ? `<small style="color:${m.dk}">Eigene Mutation: ${m.name} (${Math.round(m.ip * 100)} % pro Fang, ×${m.mul} Wert)</small>` : ""; })()}<small>${i.info}</small>`; }
  const t = it.t, sp = SP[t.sp], m = t.mut ? mutOf(t.mut) : null;
  return `<b>${m ? m.adj + " " : ""}${sp.n}</b>${S.hold === t.uid ? " (in der Hand)" : ""}<small><span class="rar" style="background:${RAR[sp.r].col}"></span>${RAR[sp.r].name} · Wert ${tlValue(t)} ${NT}</small>`;
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
  const h = `<div class="h3">Inventar <span class="muted" style="font-size:18px" id="invCnt"></span></div><div class="slotgrid" id="invGrid"></div><div class="h3">Leiste</div><div class="slotgrid" id="winBar"></div><div id="invInfo" class="invinfo"></div><p class="muted" style="margin:8px 0 6px">Zieh Dinge auf andere Plätze, um sie zu tauschen. Antippen nimmt etwas in die Hand. Dein Instrument wechselst du im Instrumentbeutel (B). Was in der Leiste liegt, wählst du mit 1 bis 9.</p><button class="btn" id="invSort" style="min-height:34px">Aufräumen</button>`;
  openWin("Inventar", h, () => { renderBar(); $("invSort").onclick = sortInv; showInfo(S.hold ? S.bar.indexOf("t:" + S.hold) : Math.max(0, S.bar.indexOf("i:eq"))); });
}
function openIndex() {
  let h = "";
  for (const a of Object.keys(AREAS).map(Number)) {
    const l = SPECIES.filter(s => s.a === a); const got = l.filter(s => S.dex[s.id] && S.dex[s.id].c > 0).length;
    h += `<div class="h3">${AREAS[a].name} <span class="muted" style="font-size:18px">${got} / ${l.length}</span></div><div class="grid">`;
    l.forEach(s => { const d = S.dex[s.id], c = d && d.c > 0, seen = d && d.s; const zn = [...new Set(s.z)].map(z => ZINFO[z].n).join(", ");
      h += `<div class="card ${c ? "" : "dim"}" style="${seen ? "border-color:" + RAR[s.r].col : ""}"><canvas data-sp="${s.id}"></canvas>${c ? `<b>${s.n}</b><small><span class="rar" style="background:${RAR[s.r].col}"></span>${RAR[s.r].name}</small><small>${s.t === "n" ? "nachts" : s.t === "d" ? "tags" : "immer"}</small><small>${zn}</small><small>gefangen: ${d.c}</small>` : `<b>???</b><small>${seen ? "gesehen, nicht gefangen" : "unbekannt"}</small>`}</div>`; });
    h += "</div>";
  }
  openWin("Index", h, () => { fillThumbs(); $("winBody").querySelectorAll(".card.dim canvas").forEach(c => { c.style.filter = "brightness(0)"; c.style.opacity = ".3"; }); });
}
function openBag() {
  winKind = "bag";
  let h = `<p class="muted">Wähl hier das Instrument aus, das du dabeihast. Es liegt dann als „Instrument“ in deiner Leiste.</p>`;
  S.instr.forEach(id => { const i = INSTR[id], on = S.eq === id && !S.hold;
    h += `<div class="row" data-ins="${id}"><canvas data-ic="${kindIcon(i.kind)}"></canvas><div class="grow"><b style="font-weight:400;font-size:21px">${i.name}</b>${on ? " (in der Hand)" : ""}${statHtml(i)}${i.pas ? `<small style="color:#7a4fb0">${PAS_TXT[i.pas]}</small>` : ""}${(() => { const m = MUTS.find(x => x.ins === id); return m ? `<small style="color:${m.dk}">Eigene Mutation: ${m.name} (${Math.round(m.ip * 100)} % pro Fang, ×${m.mul} Wert)</small>` : ""; })()}<small>${i.info}</small></div><button class="btn" data-eq="${id}" ${on ? "disabled" : ""}>Ausrüsten</button></div>`; });
  openWin("Instrumentbeutel", h, () => { fillThumbs(); $("winBody").querySelectorAll("[data-eq]").forEach(b => b.onclick = () => { S.eq = b.dataset.eq; S.hold = null; Snd.tick(.2, 1100); renderBar(); save(); openBag(); }); });
}
const LEGAL = { name: "Leif Schmale", addr: "[ANSCHRIFT: Straße Hausnummer, PLZ Ort]", mail: "leifps@icloud.com", stand: "18.10.2026" };
function openLegal(k) {
  const L = LEGAL, P = t => `<p>${t}</p>`, H = t => `<div class="h3">${t}</div>`;
  const T = {
    imp: ["Impressum", H("Angaben gemäß § 5 DDG") + P(`${L.name}<br>${L.addr}<br>Deutschland`) + H("Kontakt") + P(`E-Mail: ${L.mail}`) + H("Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV") + P(`${L.name}, Anschrift wie oben`) + H("Haftung für Links") + `<p class="muted">Für Inhalte externer Seiten sind allein deren Betreiber verantwortlich.</p>`],
    ds: ["Datenschutz", H("Verantwortlicher") + P(`${L.name}, ${L.addr}, ${L.mail}`) + H("Überblick") + P("Tonlinge ist ein Browserspiel ohne Konto und ohne Anmeldung. Es gibt keine Cookies, keine Werbung und kein Tracking.") + H("Spielstand") + P("Dein Fortschritt wird nur auf deinem Gerät im lokalen Speicher deines Browsers abgelegt und nicht an uns übertragen. Er ist für das Spiel technisch notwendig. Du kannst ihn in der Hilfe oder in den Browser-Einstellungen löschen.") + H("Mehrspieler") + P("Damit du andere Spieler siehst, verbindet sich das Spiel mit unserem Server. Übertragen werden in Echtzeit dein Spielername, deine Position, Blickrichtung, dein Aussehen, das gehaltene Instrument und ob du gerade einen Tonling fängst. Diese Daten werden nur im Arbeitsspeicher des Servers gehalten, an die anderen Spieler weitergegeben und beim Trennen verworfen. Es gibt keine dauerhafte Speicherung und kein Protokoll der Bewegungen. Bitte verwende keinen echten Namen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b und f DSGVO.") + H("Hosting") + P("Das Spiel läuft bei Cloudflare, Inc. (USA). Dabei verarbeitet Cloudflare technisch notwendig deine IP-Adresse und Verbindungsdaten, um das Spiel auszuliefern und Missbrauch abzuwehren (Art. 6 Abs. 1 lit. f DSGVO). Die Übermittlung in die USA stützt sich auf das EU-US Data Privacy Framework bzw. Standardvertragsklauseln.") + H("Schriften") + P("Die Schriften sind direkt in das Spiel eingebettet. Es werden keine Daten an Google übertragen.") + H("Deine Rechte") + P(`Du hast Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch (Art. 15–21 DSGVO). Schreib dazu an ${L.mail}. Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren.`) + H("Kinder") + P("Wir fragen keine persönlichen Daten ab. Gib im Spiel bitte keine persönlichen Informationen preis.") + `<p class="muted">Stand: ${L.stand}</p>`],
    cr: ["Credits", P("Idee, Design und Spielwelt: " + L.name) + P("Musik: erstellt mit Suno.") + P("Instrumenten-Sounds: ElevenLabs.") + P("Schriften: Caveat Brush und Patrick Hand (SIL Open Font License).") + P("Entwickelt mit Unterstützung von Claude (Anthropic).")]
  }[k];
  openWin(T[0], T[1] + `<button class="btn" id="btnBackHelp">Zurück</button>`, () => { $("btnBackHelp").onclick = openHelp; });
}
function openHelp() {
  openWin("Hilfe", `<div class="h3">Steuerung</div><p><b>WASD / Pfeile</b>: laufen · <b>Leertaste / E</b>: sprechen oder Instrument spielen · <b>1–9</b>: Leiste (Instrument oder Tonling in die Hand nehmen) · <b>G</b> Inventar (alle deine Sachen) · <b>I</b> Index · <b>B</b> Instrumentbeutel · <b>Q</b> Quests · <b>M</b> Ton · <b>Esc</b> schließen. Am Handy: Stick und Knopf unten.</p>
  <div class="h3">So fängst du Tonlinge</div><p>1. Spiele dein Instrument: drücke, wenn der Ring die Marke trifft (Gut oder Perfekt). 2. Zieh den Regler auf die richtige Frequenz: der Ton wird ruhig und die Anzeige warm. 3. Zieh die Zone unter den Tonling und halte ihn drin, bis der Balken voll ist. Ein lila oder gelber Ton beim Ring kündigt einen Prächtigen oder Fabelhaften an.</p>
  <div class="h3">Tipps</div><p>Nachts erscheinen andere Tonlinge. Manche Wände geben nach, wenn du lange dagegen läufst.</p>
  <div class="h3">Mehrspieler</div><p class="muted">Andere Spieler siehst du, wenn das Spiel auf einem Server mit Mehrspieler läuft. Dein Name:</p><p><input id="inName" maxlength="14" value="${(typeof mpName === "function" ? mpName() : "").replace(/"/g, "")}" style="font:400 20px var(--f-body);padding:4px 10px;border:2px solid var(--ink);border-radius:10px;background:var(--paper2);width:200px"></p>
  <div class="h3">Spielstand</div><p class="muted">Wird automatisch in diesem Browser gespeichert.</p><div class="h3">Speichercode</div><p class="muted">Zum Übertragen auf ein anderes Gerät oder einen anderen Browser.</p><button class="btn" id="btnCode">Code erzeugen</button> <textarea id="codeBox" rows="3" style="width:100%;margin-top:6px;font:12px monospace;color:#1d2742;background:#fffdf2;border:2px solid #1d2742;border-radius:8px" placeholder="Code hier einfügen oder kopieren"></textarea><button class="btn" id="btnCopy">Kopieren</button> <button class="btn" id="btnLoad">Code laden</button> <span class="muted" id="codeMsg"></span>
  <button class="btn warn" id="btnReset">Spielstand löschen</button>
  <div class="h3">Rechtliches</div><p><button class="btn" data-lg="imp">Impressum</button> <button class="btn" data-lg="ds">Datenschutz</button> <button class="btn" data-lg="cr">Credits</button></p>`, () => { $("winBody").querySelectorAll("[data-lg]").forEach(b => b.onclick = () => openLegal(b.dataset.lg)); codeUi(); $("inName").onchange = e => { S.name = e.target.value.replace(/[<>&"]/g, "").trim().slice(0, 14) || mpName(); save(); }; $("btnReset").onclick = () => { if ($("btnReset").dataset.s) { resetAll(); location.reload(); } else { $("btnReset").dataset.s = 1; $("btnReset").textContent = "Wirklich löschen? Nochmal klicken"; } }; });
}
function openShop(shopId, npcId, tab) {
  tab = tab || "buy"; const sh = SHOPS[shopId];
  let h = `<div class="tabs"><button class="btn" data-t="buy" aria-pressed="${tab === "buy"}">Kaufen</button><button class="btn" data-t="sell" aria-pressed="${tab === "sell"}">Verkaufen</button><span class="grow" style="flex:1"></span><span><b>${S.gold}</b> ${NT}</span></div>`;
  if (tab === "buy") {
    sh.items.forEach(it => { const i = INSTR[it.id], own = S.instr.includes(it.id), lv = S.lvl < it.lvl, poor = S.gold < it.price;
      h += `<div class="row"><canvas data-ic="${kindIcon(i.kind)}"></canvas><div class="grow"><b style="font-weight:400;font-size:21px">${i.name}</b>${statHtml(i)}<small>${i.info}</small><small>Preis: ${it.price} ${NT} · Benötigt Level ${it.lvl}</small></div><button class="btn" data-buy="${it.id}" ${own || lv || poor ? "disabled" : ""}>${own ? "Gekauft" : lv ? "Ab Level " + it.lvl : it.price + " " + NT}</button></div>`; });
    h += `<p class="muted">Weitere Instrumente bekommst du von Leuten für Quests, und manchmal an versteckten Orten.</p>`;
  } else {
    const l = invSorted(), tot = l.reduce((a, o) => a + tlValue(o.t), 0), cheap = l.filter(o => SP[o.t.sp].r <= 2 && !o.t.mut);
    h += `<div style="margin-bottom:8px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-sellcheap ${cheap.length ? "" : "disabled"}>Alle Gewöhnlichen bis Seltenen verkaufen (${cheap.reduce((a, o) => a + tlValue(o.t), 0)} ${NT})</button><button class="btn" data-sellall ${l.length ? "" : "disabled"}>Alles verkaufen (${tot} ${NT})</button></div><div class="grid">`;
    l.forEach(({ t, i }) => { const sp = SP[t.sp], m = t.mut ? mutOf(t.mut) : null; h += `<div class="card" style="border-color:${RAR[sp.r].col}"><canvas data-sp="${sp.id}" ${m ? `data-mut="${m.id}"` : ""}></canvas><b>${m ? m.adj + " " : ""}${sp.n}</b><small>${RAR[sp.r].name}</small><button class="btn" data-sell="${i}" style="min-height:32px;margin-top:4px">${tlValue(t)} ${NT}</button></div>`; });
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
const itemOf = v => { if (!v) return null; if (v === "x:idx" && !S.flags.hasIdx) return null; if ((v === "x:bag" || v === "x:inv") && !S.flags.gotFlute) return null; if (v === "x:log" && !Object.keys(S.q).length) return null; if (v[0] === "i") { if (!S.flags.gotFlute) return null; const id = S.eq; return INSTR[id] ? { k: "i", id } : null; } if (v[0] === "x") { const id = v.slice(2); return id === "bag" || id === "idx" || id === "log" || id === "inv" ? { k: "x", id } : null; } if (v[0] === "t") { const t = S.inv.find(x => x.uid === v.slice(2)); return t ? { k: "t", t } : null; } return null; };
function cleanBar() { normalizeSlots(); }
function drawSlotItem(x, v, N) { const it = itemOf(v); x.clearRect(0, 0, N, N); if (!it) return; if (it.k === "x") drawIcon(x, it.id, N * .07, N * .07, N * .86); else if (it.k === "i") drawIcon(x, kindIcon(INSTR[it.id].kind), N * .07, N * .07, N * .86); else drawTonling(x, SP[it.t.sp], N / 2, N * .52, N * .64, 0.3, it.t.mut || null); }
const slotOn = v => { const it = itemOf(v); return !!it && it.k !== "x" && (it.k === "i" ? S.eq === it.id && !S.hold : S.hold === it.t.uid); };
function slotTitle(v) { const it = itemOf(v); if (!it) return "leer"; if (it.k === "x") return it.id === "bag" ? "Instrumentbeutel (B)" : it.id === "inv" ? "Inventar (G)" : it.id === "log" ? "Questbuch (Q)" : "Index (I)"; if (it.k === "i") return "Instrument: " + INSTR[it.id].name; const sp = SP[it.t.sp]; return (it.t.mut ? mutOf(it.t.mut).adj + " " : "") + sp.n + " (" + RAR[sp.r].name + ")"; }
function renderSlots(el, a, z) {
  if (!el) return; el.innerHTML = "";
  for (let i = a; i < z; i++) { const v = S.bar[i];
    const d = document.createElement("div"); d.className = "slot" + (slotOn(v) ? " on" : "") + (i === invSel && el.id !== "hotbar" ? " sel" : ""); d.dataset.i = i; d.title = slotTitle(v);
    const c = document.createElement("canvas"); c.width = c.height = 96; d.appendChild(c); drawSlotItem(c.getContext("2d"), v, 96);
    if (i < 9) { const k = document.createElement("kbd"); k.textContent = i + 1; d.appendChild(k); }
    d.addEventListener("pointerdown", e => { e.preventDefault(); if (el.id === "hotbar") { activate(i); return; } startDrag({ from: i, v }, e, () => { showInfo(i); activate(i); }); });
    d.addEventListener("pointerenter", () => { if (el.id !== "hotbar" && $("invInfo")) showInfo(i); });
    el.appendChild(d); }
}
function heldDesc() { const it = S.hold ? itemOf("t:" + S.hold) : null; return it ? "t:" + it.t.sp + ":" + (it.t.mut || "") : S.flags.gotFlute ? "i:" + INSTR[S.eq].kind : ""; }
function renderBar() { cleanBar(); renderSlots($("hotbar"), 0, matchMedia("(pointer:coarse)").matches ? 6 : 9); renderSlots($("winBar"), 0, 9); const g = $("invGrid"); if (g) { renderSlots(g, 9, S.bar.length); const n = $("invCnt"); if (n) n.textContent = S.inv.length + " Tonlinge"; } if ($("invInfo") && invSel >= 0) showInfo(invSel); }
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
      if (f >= 0 && f !== j) { const tmp = S.bar[j]; S.bar[j] = S.bar[f]; S.bar[f] = tmp; Snd.play("klick", 1.2, .5); if (invSel === f) invSel = j; renderBar(); save(); } }
  } else if (d.click) d.click();
});
window.addEventListener("pointercancel", () => { drag = null; $("ghost").hidden = true; });
function activate(i) {
  Snd.init(); const v = S.bar[i], it = itemOf(v); if (!it) return;
  if (it.k === "x") { toggleWin(it.id === "bag" ? "bag" : it.id === "log" ? "log" : it.id === "inv" ? "inv" : "idx"); return; }
  if (C.ph && it.k !== "i") return;
  if (it.k === "t") { takeInHand(v); return; }
  const was = S.eq === it.id && !S.hold; takeInHand(v, true); if (!was) toast(INSTR[it.id].name + " in der Hand");
  if (!uiOpen()) actionPlay();
}
let winKind = "";

/* ----- Figur anpassen ----- */
const CUS_ROWS = [
  ["sk", "Haut", "col", k => SK[CUS.sk[k]]], ["hs", "Frisur", "txt", ["Kurz", "Dutt", "Lang", "Locken", "Zopf hoch", "Zwei Dutts", "Geflochten", "Wellig", "Schopf", "Glatze"]], ["hc", "Haarfarbe", "col", k => CUS.hc[k]],
  ["ht", "Kopfschmuck", "txt", ["Keiner", "Schlapphut", "Spitzhut", "Kappe", "Mütze", "Stirnband", "Kapuze", "Fliegerbrille", "Sternhut", "Krone"]], ["hoc", "Farbe Kopfschmuck", "col", k => CUS.hoc[k]],
  ["of", "Kleidung", "txt", ["Kittel", "Weste", "Kleid", "Robe", "Schürze", "Umhang"]], ["oc", "Farbe Kleidung", "col", k => CUS.oc[k]], ["ac", "Zierde", "col", k => CUS.ac[k]],
  ["it", "Dabei", "txt", ["Beutel", "Nichts", "Rucksack", "Schal", "Stab", "Laterne", "Feder"]], ["gl", "Brille", "txt", ["Keine", "Rund"]], ["bd", "Bart", "txt", ["Keiner", "Voll", "Schnurrbart", "Zopf"]]
];
function openCustom() {
  const cur = cusNorm(S.look); let timer = 0;
  const html = () => `<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start"><div style="flex:none;text-align:center"><canvas id="cusPrev" width="240" height="300" style="width:160px;height:200px;border:2.5px solid var(--ink);border-radius:var(--wob);background:linear-gradient(#cfe6a8,#a9cf86)"></canvas><div style="margin-top:6px;display:flex;gap:6px;justify-content:center"><button class="btn" id="cusRnd">Zufall</button><button class="btn" id="cusRst">Zurück</button></div></div><div style="flex:1;min-width:220px">${CUS_ROWS.map(([k, lab, kind, opt]) => `<div style="margin:4px 0"><b style="font-weight:400;font-size:19px">${lab}</b>${kind === "txt" ? `<span class="muted" style="margin-left:8px">${opt[cur[k]]}</span>` : ""}<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:2px">${CUS[k].map((_, i) => kind === "col" ? `<button data-k="${k}" data-i="${i}" aria-label="${lab} ${i + 1}" style="width:28px;height:28px;border-radius:50%;border:${cur[k] === i ? "3.5px" : "2px"} solid var(--ink);background:${opt(i)};cursor:pointer;padding:0;${cur[k] === i ? "box-shadow:0 0 0 2px var(--warm)" : ""}"></button>` : `<button class="btn" data-k="${k}" data-i="${i}" aria-pressed="${cur[k] === i}" style="min-height:30px;padding:0 9px;font-size:16px;${cur[k] === i ? "background:var(--marker)" : ""}">${opt[i]}</button>`).join("")}</div></div>`).join("")}</div></div>`;
  const draw = () => { const cv = $("cusPrev"); if (!cv) return clearInterval(timer); const c = cv.getContext("2d"), t = performance.now() / 1000, L = cusLook(cur); c.clearRect(0, 0, 240, 300); c.save(); c.scale(5, 5); drawPerson(c, 24, 54, L.col, L.hat, { look: L.look, face: 1, moving: false }, t); c.restore(); };
  const render = () => { openWin("Figur anpassen", html(), () => { $("winBody").querySelectorAll("[data-k]").forEach(b => b.onclick = () => { cur[b.dataset.k] = +b.dataset.i; apply(); render(); }); $("cusRnd").onclick = () => { CUS_KEYS.forEach(k => cur[k] = Math.floor(Math.random() * CUS[k].length)); apply(); render(); }; $("cusRst").onclick = () => { CUS_KEYS.forEach(k => cur[k] = CUS_DEF[k]); apply(); render(); }; clearInterval(timer); timer = setInterval(draw, 60); draw(); }); };
  const apply = () => { S.look = Object.assign({}, cur); meReset(); save(); };
  render();
}
function toggleWin(k) { if (k === "idx" && !S.flags.hasIdx) return; if (k === "inv" && !S.flags.gotFlute) return; if (k === "bag" && !S.flags.gotFlute) return; if (k === "log" && !Object.keys(S.q).length) return; if (!$("win").hidden && winKind === k) { closeWin(); return; } if (C.ph) return; closeDlg(); winKind = k; ({ bag: openBag, idx: openIndex, inv: openInv, help: openHelp, cus: openCustom, log: openQuestLog })[k](); }

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
  if (!S.flags.gotFlute) { if ($("meSay").hidden) sayMe("flute"); return; }
  if (S.hold) { toast("Du hältst einen Tonling. Nimm ein Instrument in die Hand (Leiste)."); return; }
  const z = zoneAt(G.px / TS | 0, G.py / TS | 0); const ins = INSTR[S.eq]; S.stats.tries++;
  playNote(ins, 1);
  C.zone = z; C.t = 0; C.ph = "ring"; C.sp = null; C.perfect = false; C.pre = pickSpecies(z, false); C.found = !!C.pre; C.res = null; C.ringHit = false; C.prog = 0; C.boost = 0; C.bonus = 0; C.result = null; C.mut = null;
  C.noteCol = "#fff";
  hintShown = true;
}
function playNote(ins, mult) {
  const id = Object.keys(INSTR).find(k => INSTR[k] === ins) || S.eq; Snd.cast();
}
function pressRing() {
  if (C.ringHit) return; const r = ringR(), d = Math.abs(r - 46), bm = 0.7 + INSTR[S.eq].beat * 0.012; C.ringHit = true;
  if (d <= 8 * bm) { C.perfect = true; C.res = "Perfekt!"; onPerfect("cast"); } else if (d <= 20 * bm) C.res = "Gut!"; else C.res = null;
  if (!C.res) { C.ph = "miss"; C.t = 0; Snd.play("miss", 1, .8); toast("Daneben. Spiel nochmal, wenn der Ring die Marke trifft.", true); return; }
  Snd.play("perfect", C.perfect ? 1.2 : 1, 0.9);
  if (C.perfect) { const n = pickSpecies(C.zone, true); if (n && (!C.pre || n.r >= C.pre.r)) C.pre = n; }
  if (!C.pre) { C.ph = "none"; C.t = 0; toast("Hier ist nichts zu hören, das dein Instrument erreicht.", true); return; }
  C.ph = "ringres"; C.t = 0;
}
const ringR = () => Math.max(20, 150 - 104 * (C.t / 1.5));
function beginFreq() {
  const sp = C.pre, ins = INSTR[S.eq]; C.sp = sp; C.mut = rollMut();
  C.target = sp.hz[0] + Math.random() * (sp.hz[1] - sp.hz[0]);
  C.max = 100; /* gleiche Skala für alle Tonlinge, unabhängig von ihrer Frequenz */ C.over = 0; C.fast = ins.pas === "wind" ? 0.8 : 1; C.user = C.max * (0.2 + Math.random() * 0.2); C.vu = 0;
  { // drei zufällige Zielstellen, die weit auseinander liegen (nicht an die Frequenz der Art gebunden)
    let prev = C.user / C.max; C.goals = []; for (let i = 0; i < 3; i++) { let g = .5; for (let k = 0; k < 60; k++) { g = .1 + Math.random() * .8; if (Math.abs(g - prev) >= .26) break; } C.goals.push(g); prev = g; }
    C.gi = 0; C.goal = C.goals[0] * C.max; C.gflash = 0; }
  C.ph = "freq"; C.t = 0; C.lock = 0; C.easy = [1, .5][sp.r] || 0; C.rm = [1.45, 1.2, 1, .8, .5, .25][sp.r] || 1; C.tol = (2.2 + ins.ear * 0.1) * 1.3 * (ins.pas === "fein" ? 1.35 : 1); const d = S.dex[sp.id] = S.dex[sp.id] || { s: 0, c: 0 }; d.s = 1; save();
  Snd.toneStart(S.eq); Snd.loopStart(S.eq, 1, 0.3, true);
}
function beginBal() {
  Snd.toneStop(true); Snd.songKeep(S.eq, 0.12); const ins = INSTR[S.eq], sp = C.sp; C.ph = "bal"; C.t = 0; C.prog = ins.pas === "vorsprung" || (ins.pas === "takt" && C.perfect) ? 0.35 : 0.2; C.pos = 0.5; C.tgt = 0.5; C.tt = 0; C.zc = 0.5; C.vz = 0; C.zw = (0.24 + ins.prec * 0.006) * (ins.pas === "ruhe" ? 1.15 : 1) * (ins.pas === "nacht" && isNight() ? 1.2 : 1) / (1 + ((AREAS[sp.a].wild || 1) - 1) * 0.5); C.inT = 0; C.outT = 0; C.boost = 0; C.bonus = 0; C.dAmp = null; C.twin = false; C.note = null; C.noteT = 2.5; C.ptr = null; C.lives = 3; C.fl = 0; C.flash = 0; C.dir = 0; C.pv = 0; C.cdg = -1;
  C.wild = AREAS[sp.a].wild || 1; C.v = 0.28 * sp.spd * C.wild * C.fast * Math.max(0.3, 1 - ins.harm * 0.012) * (1 - 0.3 * C.easy);
}
function cancelCatch() { Snd.toneStop(); C.ph = null; C.down = false; toast("Abgebrochen."); }
function endCatch(ok) {
  Snd.toneStop();
  if (ok) {
    const tl = { uid: newUid(), sp: C.sp.id, mut: C.mut, hz: Math.round(C.target * 10) / 10 }; if (INSTR[S.eq].pas === "beute") tl.b = 1; C.result = tl; C.ph = "result"; C.t = 0; let xp = tlXp(tl); if (INSTR[S.eq].pas === "lehr") xp = Math.round(xp * 1.2); if (INSTR[S.eq].pas === "zwilling" && Math.random() < 0.15) { xp *= 2; C.twin = true; } else C.twin = false; C.xp = xp;
    S.inv.push(tl); renderBar(); const d = S.dex[tl.sp] = S.dex[tl.sp] || { s: 1, c: 0 }; d.c++; d.s = 1; S.stats.catches++; addXp(xp); onCatchQuests(tl); if (C.outT <= 0.1) { C.pfc = true; toast("Perfekter Fang!"); onPerfect("catch"); } else C.pfc = false; renderStats();
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
  if (k === "escape") { if (C.ph === "freq") return cancelCatch(); if (!$("win").hidden) closeWin(); else if (!$("dlg").hidden) closeDlg(); return; }
  if (k >= "1" && k <= "9") { activate(+k - 1); return; }
  if (k === "g") return toggleWin("inv"); if (k === "i") return toggleWin("idx"); if (k === "b") return toggleWin("bag"); if (k === "q") return toggleWin("log"); if (k === "h") return toggleWin("help");
  if (k === "m") { Snd.setMute(!S.mute); $("btnMute").style.opacity = S.mute ? .45 : 1; return; }
  if (k === " " || k === "e" || k === "enter") {
    if (!$("dlg").hidden) { dlgAdvance(); return; }
    if (!$("win").hidden) return; if (C.ph) { catchAction(); return; }
    const n = nearNpc(); if (n) { talk(n); return; } const it = nearItem(); if (it) { pickItem(it); return; } actionPlay();
  }
});
window.addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
window.addEventListener("blur", () => { for (const k in keys) keys[k] = false; });
function catchAction() { if (C.ph === "ring") pressRing(); else if (C.ph === "result") { if (C.t > 0.4) C.ph = null; } else if ((C.ph === "flee" || C.ph === "miss" || C.ph === "none") && C.t > 0.3) C.ph = null; }
function bw() { return Math.min(VW - 40, 560); }
cv.addEventListener("pointerdown", e => {
  Snd.init(); if (!C.ph) return; const cb = C.cancel;
  if (cb && C.ph === "freq" && e.clientX >= cb.x && e.clientX <= cb.x + cb.w && e.clientY >= cb.y && e.clientY <= cb.y + cb.h) { cancelCatch(); return; }
  C.down = true; try { cv.setPointerCapture(e.pointerId); } catch (_) {} ptr(e); catchAction();
});
cv.addEventListener("pointermove", e => { if (C.ph && C.down) ptr(e); });
cv.addEventListener("pointerup", () => { C.down = false; });
cv.addEventListener("pointercancel", () => { C.down = false; });
function ptr(e) { C.ptr = e.clientX; }
const thrust = () => !!(C.down || keys[" "] || keys.space || keys.arrowright || keys.arrowup || keys.d || keys.w);

$("btnMute").onclick = () => { Snd.init(); Snd.setMute(!S.mute); $("btnMute").style.opacity = S.mute ? .45 : 1; };
$("btnHelp").onclick = () => toggleWin("help");
$("qHead").onclick = () => { const l = $("qList"), hide = l.style.display !== "none"; l.style.display = hide ? "none" : ""; $("qHead").textContent = hide ? "Quests ▸" : "Quests"; };
// Touch: schwebender Stick. Er erscheint dort, wo der Finger aufsetzt, und bleibt dort stehen.
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
    if (m > R) { dx *= R / m; dy *= R / m; } // Stick bleibt an seinem Platz, nur der Knopf wird begrenzt
    kn.style.transform = `translate(${dx}px,${dy}px)`; const mm = Math.hypot(dx, dy) / R; stick.x = dx / R; stick.y = dy / R;
    if (mm < 0.15) stick.x = stick.y = 0;
  });
  const up = e => { if (e.pointerId === id) reset(); };
  window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
  $("btnAct").addEventListener("pointerdown", e => { e.preventDefault(); e.stopPropagation(); Snd.init(); window.dispatchEvent(new KeyboardEvent("keydown", { key: "e" })); });
  if (IS_TOUCH) { document.body.classList.add("touch"); setTimeout(() => toast("Tippe auf den Boden und zieh, um zu laufen."), 1500); }
})();

/* ----- Aktualisieren ----- */
function padKey() { return curArea === 2 ? "cave" : isNight() ? "night" : "day"; }
let stepT = 0;
function update(dt) {
  /* Hintergrund-Summen entfernt */
  if (G.moving && !paused()) { stepT -= dt; if (stepT <= 0) { stepT = 0.3; Snd.play(curArea >= 2 ? "step_stein" : "step_gras", 0.9 + Math.random() * 0.25, 0.11); } }
  S.t = (Date.now() / 1000 - 1792281600) + (window.TADJ || 0); // für alle Spieler dieselbe Uhrzeit (Weltzeit)
  if (C.ph) updateCatch(dt);
  else if (!uiOpen()) move(dt);
  if (paused()) G.moving = false;
  if (!G.free && !C.ph) { const ar = areaAt(Math.floor(G.px / TS), Math.floor(G.py / TS)); if (ar > RELEASE.areas) { G.px = 74 * TS + TS / 2; G.py = 108 * TS; } }
  for (const [G0, fl, dn, ar] of [[GATE3, "gate3Open", "gate3Done", 3], [GATE4, "gate4Open", "gate4Done", 4]]) if (RELEASE.areas < ar && S.flags[dn] && !S.flags[fl] && Math.hypot(G.px - (G0.x + G0.w / 2) * TS, G.py - G0.y * TS) < 70 && !uiOpen() && (!G.gsay || Date.now() - G.gsay > 9000)) { G.gsay = Date.now(); sayMe("soon"); }
  checkZone();
  // Anzeigen
  $("tmClock").textContent = clockStr(); $("tmDay").textContent = (isNight() ? "Nacht" : "Tag") + " " + (Math.floor(S.t / DAY_LEN) + 1);
  const n = (!paused()) ? nearNpc() : null, ni = (!paused() && !n) ? nearItem() : null, p = $("prompt");
  if (ni) { p.hidden = false; p.textContent = "E: " + ITEMS[ni].n + " aufheben"; } else if (n) { p.hidden = false; p.textContent = "E: " + NPCS[n].n + " ansprechen"; } else if (!paused() && S.flags.gotFlute && !hintShown && S.stats.tries === 0) { p.hidden = false; p.textContent = matchMedia("(pointer:coarse)").matches ? "Knopf rechts unten: Instrument spielen" : "Leertaste oder 1: Instrument spielen"; } else p.hidden = true;
  $("btnAct").textContent = ni ? "Aufheben" : n ? "Sprechen" : C.ph ? "Los" : "Spielen";
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
  if (hit) { const key = hit[2]; if (holdKey !== key) { holdKey = key; holdWall = 0; } holdWall += dt; if (holdWall > 0.8) { T[hit[1]][hit[0]] = 1; revealSecret(key); S.flags["open_" + key] = true; holdKey = ""; holdWall = 0; chunks.clear(); Snd.melody("harfe", [4, 2, 0], 0.15, 0.7, 0.8); toast("Die Wand gibt nach. Dahinter ist jemand."); save(); setTimeout(checkOffers, 2500); } } else { holdKey = ""; holdWall = 0; }
  S.px = G.px; S.py = G.py;
}
function updateCatch(dt) {
  C.t += dt; const ins = INSTR[S.eq];
  if (C.ph === "ring") { if (ringR() <= 20 && !C.ringHit) { C.ph = "miss"; C.t = 0; Snd.play("miss", 1, .8); toast("Zu spät. Der Ring war schon weg.", true); } }
  else if (C.ph === "ringres") { if (C.t > 0.85) beginFreq(); }
  else if (C.ph === "freq") {
    const res = C.max; C.vu = ((C.vu || 0) + (thrust() ? 1.7 : -1.1) * dt) * Math.exp(-2.1 * dt); C.user += C.vu * res * dt; if (C.user <= 0) { C.user = 0; C.vu = Math.max(0, C.vu); } if (C.user >= res) { C.user = res; C.vu = Math.min(0, C.vu); }
    const d = Math.abs(C.user - C.goal); Snd.toneSet(C.user, d); { const k = clamp((d - C.tol) / 26, 0, 1); Snd.loopDetune(d <= C.tol ? 0 : (C.user > C.goal ? 1 : -1) * k * 650 + Math.sin(C.t * 9) * k * 40); } C.noise = d <= C.tol ? 0 : clamp((d - C.tol) / (res * 0.22), 0.08, 1);
    if (d <= C.tol) C.lock += dt; else C.lock = Math.max(0, C.lock - dt * 2);
    C.gflash = Math.max(0, (C.gflash || 0) - dt);
    if (C.lock >= (INSTR[S.eq].pas === "tief" ? 0.35 : 0.7)) { Snd.play("rast", 1 + C.gi * .12, .8); if (C.gi < 2) { C.gi++; C.goal = C.goals[C.gi] * C.max; C.lock = 0; C.gflash = .8; } else beginBal(); }
    else if (C.t > 75) { toast("Der Tonling hat das Interesse verloren.", true); endCatch(false); }
  } else if (C.ph === "bal") {
    C.flash = Math.max(0, (C.flash || 0) - dt);
    if (C.t < 2.4) { if (C.t > 1.8 && !C.fl) { C.fl = 1; C.flash = 0.7; Snd.play("fang", 1.7, .5); if (C.sp.r >= 3) { Snd.play("perfect", C.sp.r >= 4 ? 1.5 : 1.2, .8); Snd.melody("harfe", [0, 4, 7], 0.1, 0.5, 1.4); } } const dg = Math.floor(C.t / 0.6); if (dg !== C.cdg) { C.cdg = dg; if (dg < 3) Snd.tick(.25, 700, .08); } return; }
    const sp = C.sp;
    C.tt -= dt; if (C.tt <= 0) { C.tt = (0.5 + Math.random() * 0.8) / (sp.spd * C.wild * C.fast); C.tgt = 0.08 + Math.random() * 0.84; }
    const v = C.v * 1.6; const dd = C.tgt - C.pos; C.dir = Math.abs(dd) < 0.02 ? 0 : Math.sign(dd); { const want = clamp(dd * 3.4, -v, v); C.pv = (C.pv || 0) + (want - (C.pv || 0)) * Math.min(1, dt * 7); C.pos += C.pv * dt; } C.pos = clamp(C.pos + Math.sin(C.t * 7) * 0.0012 * sp.spd, 0.03, 0.97);
    C.vz = ((C.vz || 0) + (thrust() ? 2.6 : -1.9) * dt) * Math.exp(-2.4 * dt); C.zc += C.vz * dt; if (C.zc <= C.zw / 2) { C.zc = C.zw / 2; C.vz = Math.max(0, C.vz); } if (C.zc >= 1 - C.zw / 2) { C.zc = 1 - C.zw / 2; C.vz = Math.min(0, C.vz); }
    
    const inZ = Math.abs(C.pos - C.zc) <= C.zw / 2; Snd.loopSet(0.9 + 0.2 * C.pos, inZ ? 0.5 : 0.1);
    if (inZ) { C.inT += dt; let rate = 0.16 * C.rm; C.boost = ins.pas === "moment" ? Math.min(0.10, C.inT * 0.02) : 0; rate *= 1 + C.boost; C.prog += rate * dt; } else { C.inT = 0; C.outT += dt; C.boost = 0; C.prog -= 0.10 * C.wild * (1 - 0.5 * C.easy) * (ins.pas === "ur" ? 0.5 : 1) * dt; }
    if (ins.pas === "note" || ins.pas === "chor") { C.noteT -= dt; if (!C.note && C.noteT <= 0) { C.note = { x: 0.1 + Math.random() * 0.8, life: 2.8 }; } if (C.note) { C.note.life -= dt; if (Math.abs(C.note.x - C.zc) <= C.zw / 2 + 0.01) { C.prog += 0.05; Snd.play("perfect", 1.8, .5); C.note = null; C.noteT = 4; C.bonus = 0.6; } else if (C.note.life <= 0) { C.note = null; C.noteT = 4; } } }
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
  const tx = sx + (G.face || 1) * (38 * Z + (C.ph === "bal" ? (C.pos - 0.5) * 8 : 0)), ty = sy - 4 * Z, tsz = 22 * Z;
  const showTl = C.sp && ((C.ph === "bal" && C.t >= 1.9) || C.ph === "result");
  if (showTl) {
    if (C.flash > 0) { const k = 1 - C.flash / 0.7, r = (60 + k * 140) * Z, g = c.createRadialGradient(tx, ty, 2, tx, ty, r); const rc0 = C.sp.r >= 1 ? RAR[C.sp.r].col : "#fffae1", rgb = [1, 3, 5].map(i => parseInt(rc0.slice(i, i + 2), 16)).join(","); g.addColorStop(0, "rgba(" + rgb + "," + (0.95 * (1 - k)) + ")"); g.addColorStop(1, "rgba(" + rgb + ",0)"); c.fillStyle = g; c.beginPath(); c.arc(tx, ty, r, 0, 7); c.fill(); }
    if (C.sp.r >= 3) { const rg = c.createRadialGradient(tx, ty, 4, tx, ty, tsz * .95), rc1 = RAR[C.sp.r].col, rgb1 = [1, 3, 5].map(i => parseInt(rc1.slice(i, i + 2), 16)).join(","); rg.addColorStop(0, "rgba(" + rgb1 + ",.55)"); rg.addColorStop(1, "rgba(" + rgb1 + ",0)"); c.fillStyle = rg; c.beginPath(); c.arc(tx, ty, tsz * .95, 0, 7); c.fill(); }
    { // tanzt mit: Squish im Takt, Hüpfer, Wiegen; in der Zone wilder
      const inZ = C.ph === "bal" && Math.abs(C.pos - C.zc) <= C.zw / 2; C.dAmp = (C.dAmp == null ? .6 : C.dAmp) + ((inZ || C.ph === "result" ? 1 : .6) - (C.dAmp == null ? .6 : C.dAmp)) * .08;
      const ph = t * 7.2, a = C.dAmp, sq = Math.cos(ph) * .13 * a, hop = Math.pow(Math.abs(Math.sin(ph / 2)), .8) * tsz * .22 * a, tilt = Math.sin(ph / 2) * .16 * a, py0 = ty + tsz * .48;
      c.save(); c.translate(tx, py0 - hop); c.rotate(tilt); c.scale(1 + sq * .9, 1 - sq * 1.1); c.translate(-tx, -py0);
      drawTonling(c, C.sp, tx, ty, tsz, t, C.mut); c.restore(); }
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
    for (let i = 0; i < 3; i++) { const dx = cx + (i - 1) * 26, dy = ytop - 15, done = i < C.gi; hCirc(c, dx, dy, 8.5, 70 + i, { fill: done ? "#9fe070" : i === C.gi ? "#fbf3da" : "rgba(247,239,214,.6)", lw: 2.2 }); if (done) outlineText(c, "✓", dx, dy + 5, "14px " + F2, INK, 0); }
    if (C.gflash > 0) outlineText(c, "Ton " + C.gi + " gefunden!", cx, ytop - 34 - (0.8 - C.gflash) * 12, "22px " + F2, "#9be05a", 4);
    if (C.lock > 0) { c.fillStyle = "rgba(108,192,74,.8)"; c.fillRect(x0 + 2, y2 + 4, (W - 4) * (C.lock / 0.7), 4); c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(x0 + 2, y2 + 4, (W - 4) * (C.lock / 0.7), 4); }
    const ux = x0 + C.user / C.max * W, hy = y1 - 14;
    hLine(c, ux, hy, ux, y2 + 3, 55, 2.4);
    hCirc(c, ux, hy, 11, 61, { fill: nz === 0 ? "#9fe070" : "#fbf3da", lw: 2.6 });
    outlineText(c, "‹", ux - 24, hy + 7, "26px " + F1, INK, 3); outlineText(c, "›", ux + 24, hy + 7, "26px " + F1, INK, 3);
    const msg = IS_TOUCH ? "Halten = steigen, loslassen = sinken. Finde 3 Töne!" : "Leertaste halten = steigen, loslassen = sinken. Finde 3 Töne!"; outlineText(c, msg, cx, base - 40, "19px " + F2, INK, 5);
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
      
    }
    // Fortschritt als Tintenbalken
    const pw = W - 16, py2 = ytr + bh + 14, pf = Math.max(4, (pw - 4) * clamp(C.prog, 0, 1));
    hBox(c, x0 + 8, py2, pw, 14, { fill: "rgba(247,239,214,.9)", s: 23, lw: 2.4 });
    c.save(); hPts(c, [[x0 + 10, py2 + 2], [x0 + 10 + pf, py2 + 2], [x0 + 10 + pf, py2 + 12], [x0 + 10, py2 + 12]], 27, .8, true); c.fillStyle = C.bonus > 0 ? "#f3b92f" : "#7bbf5a"; c.fill(); c.clip(); c.strokeStyle = "rgba(29,39,66,.35)"; c.lineWidth = 1; for (let k = 0; k < pf + 12; k += 6) { c.beginPath(); c.moveTo(x0 + 10 + k, py2 + 12); c.lineTo(x0 + 16 + k, py2 + 2); c.stroke(); } c.restore();
    const pc = Math.round((C.rm * (1 + (C.boost || 0)) - 1) * 100), lab = pc ? (pc > 0 ? "+" : "") + pc + "% Fortschritt" : ""; if (lab) outlineText(c, lab, x0 + W / 2, py2 + 34, "16px " + F2, INK, 5);
    if (!cd && C.t < 6) outlineText(c, (IS_TOUCH ? "Halten = Zone steigt, loslassen = sinkt" : "Leertaste halten = Zone steigt, loslassen = sinkt"), cx, ytr - 12, "22px " + F1, INK, 5);

  } else if (C.ph === "result") {
    const sp = C.sp, tl = C.result, m = tl.mut ? mutOf(tl.mut) : null, rc = RAR[sp.r].col;
    hBox(c, cx - Math.min(W, 520) / 2, VH - 206, Math.min(W, 520), 112, { fill: WASH, s: 31, hatch: true });
    for (let i = 0; i < 6; i++) { const ph = ((t * 0.5 + i / 6) % 1), nx = tx + Math.sin(t * 2 + i * 1.7) * 38, ny = ty - 40 * Z * .8 - ph * 90; c.globalAlpha = Math.sin(ph * Math.PI) * .9; outlineText(c, i % 2 ? "♪" : "♫", nx, ny, "24px " + F1, INK, 3); } c.globalAlpha = 1;
    outlineText(c, "Du hast gefangen: " + (m ? m.adj + " " : "") + sp.n + "!", cx, VH - 166, "32px " + F1, rc === "#9aa3b2" ? INK : rc, 6);
    outlineText(c, RAR[sp.r].name, cx, VH - 138, "21px " + F2, INK, 4);
    const vt = "+" + C.xp + " EP" + (C.twin ? " (doppelt!)" : "") + " · Wert " + tlValue(tl); c.font = "19px " + F2; const vw2 = c.measureText(vt).width; outlineText(c, vt, cx - 11, VH - 114, "19px " + F2, INK, 4);
    c.save(); c.translate(cx - 11 + vw2 / 2 + 15, VH - 120); c.lineJoin = c.lineCap = "round"; c.fillStyle = "#f3b92f"; c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.moveTo(3, 5); c.lineTo(3, -8); c.lineTo(9, -5); c.lineTo(9, -1); c.lineTo(3, -4); c.fill(); c.stroke(); c.beginPath(); c.ellipse(-1.5, 5, 5, 3.6, -.35, 0, 7); c.fill(); c.stroke(); c.restore();
  } else if (C.ph === "miss" || C.ph === "none" || C.ph === "flee") {
    const msg = C.ph === "flee" ? "Der Tonling flieht" : C.ph === "none" ? "Hier ist es still" : "Daneben"; c.font = "36px " + F1; const mw = c.measureText(msg).width + 56;
    hBox(c, cx - mw / 2, VH - 196, mw, 62, { fill: WASH, s: 41 }); outlineText(c, msg, cx, VH - 152, "36px " + F1, INK, 0);
  }
}

/* ----- Figur erstellen (vor dem ersten Spielstart) ----- */
function showCreator() {
  const cur = cusNorm(S.look), rows = ["sk", "hs", "hc", "bd", "gl"].map(k => CUS_ROWS.find(r => r[0] === k)); let timer = 0;
  const el = $("cre"); el.hidden = false;
  const html = () => `<h2>Wer bist du?</h2><div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start;justify-content:center"><div style="flex:none;text-align:center"><canvas id="crePrev" width="240" height="300" style="width:140px;height:175px;border:2.5px solid var(--ink);border-radius:var(--wob);background:linear-gradient(#cfe6a8,#a9cf86)"></canvas><div style="margin-top:6px"><button class="btn" id="creRnd">Zufall</button></div></div><div style="flex:1;min-width:230px"><div style="margin:4px 0"><b style="font-weight:400;font-size:19px">Name</b><br><input id="creName" maxlength="14" placeholder="Dein Name" value="${(S.name || "").replace(/[<>&"]/g, "")}" style="width:100%;font:inherit;font-size:20px;padding:4px 10px;border:2.5px solid var(--ink);border-radius:var(--wob);color:#1d2742;-webkit-text-fill-color:#1d2742;background:#fffdf2"></div>${rows.map(([k, lab, kind, opt]) => `<div style="margin:4px 0"><b style="font-weight:400;font-size:19px">${lab}</b>${kind === "txt" ? `<span class="muted" style="margin-left:8px">${opt[cur[k]]}</span>` : ""}<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:2px">${CUS[k].map((_, i) => kind === "col" ? `<button data-k="${k}" data-i="${i}" aria-label="${lab} ${i + 1}" style="width:28px;height:28px;border-radius:50%;border:${cur[k] === i ? "3.5px" : "2px"} solid var(--ink);background:${opt(i)};cursor:pointer;padding:0;${cur[k] === i ? "box-shadow:0 0 0 2px var(--warm)" : ""}"></button>` : `<button class="btn" data-k="${k}" data-i="${i}" style="min-height:30px;padding:0 9px;font-size:16px;${cur[k] === i ? "background:var(--marker)" : ""}">${opt[i]}</button>`).join("")}</div></div>`).join("")}</div></div><div style="text-align:center;margin-top:10px"><button class="btn" id="creGo" style="font-size:22px;padding:4px 22px">Los geht's</button><div class="muted" style="font-size:15px;margin-top:4px">Kleidung kannst du später bei Marlo ändern.</div></div>`;
  const draw = () => { const cv = $("crePrev"); if (!cv) return clearInterval(timer); const c = cv.getContext("2d"), L = cusLook(cur); c.clearRect(0, 0, 240, 300); c.save(); c.scale(5, 5); drawPerson(c, 24, 54, L.col, L.hat, { look: L.look, face: 1, moving: false }, performance.now() / 1000); c.restore(); };
  const apply = () => { S.look = Object.assign({}, cur, { of: S.look && Number.isInteger(S.look.of) ? S.look.of : CUS_DEF.of }); meReset(); };
  const render = () => { const nm = $("creName") ? $("creName").value : (S.name || ""); el.innerHTML = html(); $("creName").value = nm;
    el.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { cur[b.dataset.k] = +b.dataset.i; S.name = $("creName").value; apply(); render(); });
    $("creRnd").onclick = () => { ["sk", "hs", "hc", "bd", "gl"].forEach(k => cur[k] = Math.floor(Math.random() * CUS[k].length)); S.name = $("creName").value; apply(); render(); };
    $("creGo").onclick = () => { const n = $("creName").value.replace(/[<>&"]/g, "").trim().slice(0, 14); S.name = n || ("Wanderer " + (100 + Math.floor(Math.random() * 900))); apply(); S.flags.created = 1; save(); clearInterval(timer); el.hidden = true; el.innerHTML = ""; };
    clearInterval(timer); timer = setInterval(draw, 60); draw(); };
  apply(); render(); setTimeout(() => $("creName") && $("creName").focus(), 50);
}
if (!S.flags.created) { if (S.stats.tries > 0 || S.lvl > 1 || S.inv.length || Object.keys(S.q).length) { S.flags.created = 1; save(); } else showCreator(); }

/* ----- Start ----- */
function frame(now) {
  const dt = Math.min(0.05, (now - frame.last) / 1000 || 0.016); frame.last = now; const t = now / 1000;
  update(dt); G.hd = heldDesc(); placeDlg(); placeMe(); if (typeof mpTick === "function") mpTick(dt); CAM = render(G, t); if (C.ph) drawCatch(t);
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

// ---- Admin / Test-Befehle: F2 oder 5x auf die Uhr tippen oder Browser-Konsole: adm.help() ----
const adm = window.adm = (() => {
  const say = m => { toast(String(m)); console.log("[adm]", m); return m; };
  const num = (v, d) => { const n = Number(v); return isFinite(n) ? n : d; };
  const refresh = () => { renderBar(); renderStats(); save(); };
  const cmds = {
    help: () => say("lvl n | xp n | gold n | instr id|all | tl art [mut] [anzahl] | tp npc|x y|a1|a2|a3|a4 | gates | zeit h | quest id | quests | dex | alles | ids"),
    lvl: n => { S.lvl = Math.max(1, num(n, S.lvl)); S.xp = 0; refresh(); return say("Level " + S.lvl); },
    xp: n => { addXp(num(n, 0)); refresh(); return say("Level " + S.lvl); },
    gold: n => { S.gold += num(n, 0); refresh(); return say("Noten " + S.gold); },
    instr: id => { const l = id === "all" ? Object.keys(INSTR) : [id]; l.forEach(i => { if (INSTR[i] && !S.instr.includes(i)) S.instr.push(i); }); refresh(); return say("Instrumente: " + S.instr.length); },
    tl: (sp, mut, n) => { if (!SP[sp]) return say("Unbekannte Art. adm.ids()"); const m = mut && mut !== "-" && MUTS.some(x => x.id === mut) ? mut : null; const k = num(n, 1); for (let i = 0; i < k; i++) { const s = SP[sp]; S.inv.push({ uid: newUid(), sp, mut: m, hz: Math.round((s.hz[0] + Math.random() * (s.hz[1] - s.hz[0])) * 10) / 10 }); const d = S.dex[sp] = S.dex[sp] || { s: 1, c: 0 }; d.c++; d.s = 1; } refresh(); return say(k + "× " + sp); },
    tempo: (a, b) => { const id = SONGS[a] ? a : null, v = clamp(num(id ? b : a, 0.25), 0.05, 2); for (const k in SONGS) if (!id || k === id) SONGS[k].step = v; return say(Object.keys(SONGS).map(k => k + " " + SONGS[k].step + "s=" + Math.round(songEvents(k).len) + "s").join(", ")); },
    tp: (a, b) => { G.free = true; let x, y; if (NPCS[a]) { x = NPCS[a].x; y = NPCS[a].y + 1; } else if (/^a[1234]$/.test(a)) { [x, y] = { a1: [17, 39], a2: [52, 60], a3: [107, 106], a4: [109, 51] }[a]; } else { x = num(a, 0); y = num(b, 0); } G.px = x * 32 + 16; G.py = y * 32 + 16; return say("→ " + x + "," + y); },
    gates: () => { G.free = true; S.flags.gateOpen = S.flags.gate3Open = S.flags.gate4Open = S.flags.gate3Done = S.flags.gate4Done = S.flags.lookOpen = true; save(); return say("Tore offen"); },
    zeit: h => { const t = (num(h, 12) / 24) * DAY_LEN; window.TADJ = (window.TADJ || 0) + (Math.floor(S.t / DAY_LEN) * DAY_LEN + t - S.t); S.t += 0; return say("Uhrzeit " + clockStr()); },
    quest: id => { if (!QUESTS[id]) return say("Unbekannte Quest"); S.q[id] = { st: "active", n: QUESTS[id].n }; completeQuest(id); refresh(); return say("Erledigt: " + id); },
    quests: () => { Object.keys(QUESTS).forEach(id => { if (!qDone(id)) { S.q[id] = { st: "active", n: QUESTS[id].n }; completeQuest(id); } }); refresh(); return say("Alle Quests erledigt"); },
    dex: () => { SPECIES.forEach(s => { const d = S.dex[s.id] = S.dex[s.id] || { s: 1, c: 0 }; d.s = 1; }); save(); return say("Index: alle gesehen"); },
    alles: () => { cmds.lvl(45); cmds.gold(1000000); cmds.instr("all"); cmds.gates(); return say("Alles freigeschaltet"); },
    ids: () => say(console.log("Arten:", SPECIES.map(s => s.id).join(" "), "\nNPCs:", Object.keys(NPCS).join(" "), "\nQuests:", Object.keys(QUESTS).join(" "), "\nInstrumente:", Object.keys(INSTR).join(" "), "\nMutationen:", MUTS.map(m => m.id).join(" ")) || "IDs in der Konsole")
  };
  const run = line => { const [c, ...a] = String(line).trim().split(/\s+/); if (!cmds[c]) return say("Unbekannt: " + c + " (help)"); try { return cmds[c](...a); } catch (e) { return say("Fehler: " + e.message); } };
  let box = null;
  const panel = () => {
    if (box) { box.style.display = box.style.display === "none" ? "block" : "none"; return; }
    box = document.createElement("div"); box.style.cssText = "position:fixed;left:8px;right:8px;bottom:80px;z-index:99999;background:#fffbe8;border:3px solid #333;border-radius:10px;padding:8px;font:16px sans-serif;max-width:560px;margin:auto";
    box.innerHTML = '<div style="display:flex;gap:6px"><input id="admIn" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Befehl, z.B. alles" style="flex:1;font-size:18px;padding:8px"><button id="admGo" style="font-size:18px;padding:8px 14px">OK</button><button id="admX" style="font-size:18px;padding:8px 12px">✕</button></div><div id="admBt" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px"></div>';
    document.body.appendChild(box); const inp = box.querySelector("#admIn");
    const go = () => { if (inp.value.trim()) run(inp.value); inp.value = ""; };
    box.querySelector("#admGo").onclick = go; box.querySelector("#admX").onclick = () => box.style.display = "none";
    inp.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Enter") go(); }); inp.addEventListener("keyup", e => e.stopPropagation());
    [["alles", "alles"], ["Tore", "gates"], ["Level 30", "lvl 30"], ["+100k", "gold 100000"], ["Nacht", "zeit 23"], ["Tag", "zeit 12"], ["→ Bereich 3", "tp a3"], ["→ Bereich 4", "tp a4"], ["Quests", "quests"], ["Index", "dex"]].forEach(([t, c]) => { const bt = document.createElement("button"); bt.textContent = t; bt.style.cssText = "font-size:16px;padding:6px 10px"; bt.onclick = () => run(c); box.querySelector("#admBt").appendChild(bt); });
  };
  window.addEventListener("keydown", e => { if (e.key === "F2") { e.preventDefault(); panel(); } });
  let taps = [], clk = document.getElementById("tmClock");
  if (clk) clk.addEventListener("pointerdown", () => { const n = Date.now(); taps = taps.filter(t => n - t < 2500); taps.push(n); if (taps.length >= 5) { taps = []; panel(); } });
  return Object.assign(run, cmds);
})();

/* Tooltip für Werte (Justierung, Präzision ...): Maus-Hover und Antippen */
(() => { const tip = $("tip"); let cur = null;
  const show = (el, e) => { const k = el.dataset.tip, def = STAT_DEF.find(d => d[0] === k); if (!def) return; tip.innerHTML = `<b>${def[1]}</b>${STAT_TIP[k]}`; tip.hidden = false; const r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight; tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left)) + "px"; tip.style.top = (r.top - h - 8 > 8 ? r.top - h - 8 : r.bottom + 8) + "px"; cur = el; };
  const hide = () => { tip.hidden = true; cur = null; };
  document.addEventListener("pointerover", e => { const el = e.target.closest && e.target.closest(".st[data-tip]"); if (el && e.pointerType !== "touch") show(el, e); else if (!el && cur) hide(); });
  document.addEventListener("pointerdown", e => { const el = e.target.closest && e.target.closest(".st[data-tip]"); if (el && e.pointerType === "touch") { if (cur === el) hide(); else show(el, e); } else hide(); });
  document.addEventListener("scroll", hide, true);
})();

/* Speichercodes: Spielstand als Text (komprimiert, "TL1:..."), zum Übertragen */
async function codePack(obj) {
  const raw = new TextEncoder().encode(JSON.stringify(obj)); let bytes = raw, pre = "TL1:";
  try { if (typeof CompressionStream === "function") { const cs = new Blob([raw]).stream().pipeThrough(new CompressionStream("deflate")); bytes = new Uint8Array(await new Response(cs).arrayBuffer()); pre = "TL1z:"; } } catch (e) { bytes = raw; pre = "TL1:"; }
  let bin = ""; for (let i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
  return pre + btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function codeUnpack(str) {
  str = (str || "").replace(/\s+/g, ""); const m = /^(TL1z?):(.+)$/.exec(str); if (!m) throw 0;
  let b = m[2].replace(/-/g, "+").replace(/_/g, "/"); while (b.length % 4) b += "="; const bin = atob(b), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  let out = u; if (m[1] === "TL1z") out = new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("deflate"))).arrayBuffer());
  const o = JSON.parse(new TextDecoder().decode(out)); if (!o || o.v !== 1 || !Array.isArray(o.inv) || typeof o.lvl !== "number") throw 0; return o;
}
function codeUi() {
  const box = $("codeBox"), msg = $("codeMsg"); if (!box) return; const say = t => msg.textContent = t;
  $("btnCode").onclick = async () => { save(); box.value = await codePack(S); box.select(); say("Code erzeugt."); };
  $("btnCopy").onclick = async () => { if (!box.value) return say("Erst einen Code erzeugen."); box.select(); try { await navigator.clipboard.writeText(box.value); say("Kopiert."); } catch (e) { document.execCommand && document.execCommand("copy"); say("Kopiert."); } };
  $("btnLoad").onclick = async () => { let o; try { o = await codeUnpack(box.value); } catch (e) { return say("Dieser Code ist ungültig."); }
    if ($("btnLoad").dataset.s !== "1") { $("btnLoad").dataset.s = "1"; $("btnLoad").textContent = "Aktuellen Stand ersetzen? Nochmal klicken"; return; }
    try { localStorage.setItem(KEY, JSON.stringify(o)); location.reload(); } catch (e) { say("Konnte nicht gespeichert werden."); } };
}
