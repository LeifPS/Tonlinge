
/* ===== Klänge: Musik der Instrumente und alle Soundeffekte des Spiels anhören ===== */
const WAU = { cur: null, q: [], ld: 0, vol: 1 };
function waLoad(cb) {
  if (typeof TRACKS !== "undefined") { cb(); return; }
  WAU.q.push(cb); if (WAU.ld) return; WAU.ld = 1; toast("Lade die Klänge des Spiels …");
  const s = document.createElement("script"); s.src = "audio.js";
  s.onload = () => { const l = WAU.q.splice(0); l.forEach(f => f()); }; s.onerror = () => { WAU.ld = 0; WAU.q = []; toast("Die Klänge konnten nicht geladen werden."); };
  document.head.appendChild(s);
}
/* Muss direkt im Klick passieren (iPhone und Safari erlauben Ton nur nach einer Berührung) */
function waGo(fn) {
  S.mute = false; Snd.init(); const c = Snd.ctx; if (c && c.ac.state === "suspended") c.ac.resume(); waVol(WAU.vol);
  waLoad(() => { Snd.bank(); fn(); });
}
function waVol(v) { WAU.vol = v; const c = Snd.ctx; if (c) c.master.gain.value = v; }
function waWhen(name, fn, n = 0) { if (Snd.dbg().bufs.includes(name)) { fn(); return; } if (n < 50) setTimeout(() => waWhen(name, fn, n + 1), 80); }
function waStop() { try { Snd.loopStop(); Snd.music(null, 0); Snd.wxAmbient(null, 0); if (typeof ECSnd !== "undefined") ECSnd.end(); } catch (e) {} WAU.cur = null; $$("[data-wa].on").forEach(b => { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); const t = b.querySelector(".pl"); if (t) t.innerHTML = gi("play"); }); }
function waMark(btn, on) { $$("[data-wa].on").forEach(b => { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); const t = b.querySelector(".pl"); if (t) t.innerHTML = gi("play"); });
  if (on && btn) { btn.classList.add("on"); btn.setAttribute("aria-pressed", "true"); const t = btn.querySelector(".pl"); if (t) t.innerHTML = gi("stop"); } }
const WAU_SMP = new Set(["perfect", "fang", "miss", "klick", "coins", "levelup", "quest", "ping", "rast", "tor", "flucht", "step_gras", "step_stein", "rev3", "rev4", "rev5", "rev6"]);
const WAU_ACT = {
  instr: id => Snd.loopStart(id, 1, .55, true),
  note: (id, r) => waWhen("harfe", () => Snd.instr(id, r, .9)),
  sfx: n => { const rv = { rev3: .55, rev4: .65, rev5: .75, rev6: .8 }[n]; const f = () => Snd.play(n, 1, rv || 1); if (WAU_SMP.has(n)) waWhen(n, f); else f(); },
  cast: () => Snd.cast(),
  tick: () => Snd.tick(.3, 1800, .05),
  sample: n => waWhen(n, () => Snd.play(n, 1, 1)),
  amb: id => Snd.music(id, .55),
  wxa: id => Snd.wxAmbient(id, 1),
  ec: k => { const E = ECSnd; if (k === "start") E.start(); else if (k === "end") E.end(); else if (k.startsWith("rv:")) { E.start(); E.reveal(k.slice(3)); } else E[k](); }
};
/* Knopf: Einzelklang oder umschaltbar (Musik, Dauerklang) */
function waBtn(label, kind, arg, o = {}) { return `<button class="btn wa" data-wa="${kind}" data-a="${esc(arg || "")}" data-loop="${o.loop ? 1 : ""}" aria-pressed="false"><span class="pl">${gi("play")}</span> ${label}${o.sub ? `<small>${o.sub}</small>` : ""}</button>`; }
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-wa]"); if (!b) return; e.preventDefault();
  const k = b.dataset.wa, a = b.dataset.a, loop = !!b.dataset.loop;
  if (loop && b.classList.contains("on")) { waStop(); return; }
  waGo(() => { if (loop) { waStop(); waMark(b, true); WAU.cur = k + a; }
    try { if (k === "instr") WAU_ACT.instr(a); else if (k === "note") { const [id, r] = a.split("|"); WAU_ACT.note(id, +r); } else WAU_ACT[k](a); } catch (er) { toast("Dieser Klang lässt sich hier nicht abspielen."); } }); });
document.addEventListener("click", e => { if (e.target.closest && e.target.closest("[data-wastop]")) waStop(); });
window.addEventListener("hashchange", () => { if (WAU.cur) waStop(); });

/* Mini-Tastatur für die Töne eines Instruments (Pentatonik wie im Spiel) */
const waKeys = id => `<div class="wakeys">${[0, 2, 4, 7, 9, 12, 14, 16].map(s => `<button class="btn wa" data-wa="note" data-a="${id}|${Math.pow(2, s / 12).toFixed(4)}" style="min-height:40px;padding:2px 12px">${gi("note")}</button>`).join("")}</div>`;
const waMusic = id => `<div class="box"><b>Musik anhören</b><p style="margin:4px 0 8px">So klingt ${esc(INSTR[id].name)}, wenn du damit stimmst.</p><p>${waBtn("Musik abspielen", "instr", id, { loop: 1 })} <button class="btn" data-wastop>Stopp</button></p><p style="margin:4px 0">Einzelne Töne:</p>${waKeys(id)}</div>`;

/* ----- Seite: alle Klänge ----- */
WP.sounds = () => {
  const ins = Object.keys(INSTR);
  const sfx = [["perfect", "Perfekter Wurf"], ["fang", "Fang"], ["miss", "Fehlwurf"], ["flucht", "Entkommen"], ["klick", "Klick"], ["coins", "Münzen / Verkauf"], ["levelup", "Level-Aufstieg"], ["quest", "Quest abgeschlossen"], ["ping", "Hinweis"], ["rast", "Rast"], ["tor", "Tor öffnet sich"], ["step_gras", "Schritt im Gras"], ["step_stein", "Schritt auf Stein"]];
  const rev = [["rev3", "Prächtig"], ["rev4", "Fabelhaft"], ["rev5", "Glorreich"], ["rev6", "Erhaben"]];
  const sk = [["sk_rune", "Rune berührt"], ["sk_solve", "Rätsel gelöst"], ["sk_fail", "Rätsel misslungen"], ["sk_page", "Seite umgeblättert"], ["sk_book", "Buch zugeklappt"], ["sk_chest", "Truhe öffnet sich"], ["sk_item", "Gegenstand gefunden"], ["sk_portal", "Portal"], ["sk_stairs", "Treppe"], ["sk_erhaben", "Erhabener erscheint"], ["sk_seal", "Siegel"]];
  const ec = [["rv:stetig", "Stetig"], ["rv:hellhoerig", "Hellhörig"], ["rv:taktvoll", "Taktvoll"], ["rv:ruhig", "Ruhig"], ["rv:glueckhaft", "Glückhaft"], ["rv:mutiert", "Mutiert"], ["rv:einsicht", "Einsicht"], ["rv:qualitaet", "Qualität"], ["rv:doppelklang", "Doppelklang"], ["rv:runenklang", "Runenklang"]];
  const grid = l => `<div class="wagrid">${l.join("")}</div>`;
  return { t: "Klänge", h: `<p class="lead">Alle Töne des Spiels an einem Ort: die Musik jedes Instruments, die Soundeffekte beim Fangen, die Töne der Seltenheiten, des Sanktums und der Echoszene.</p>
  <div class="filters"><label>Lautstärke <input type="range" min="0" max="100" value="${Math.round(WAU.vol * 100)}" id="waV" style="width:160px"></label><button class="btn" data-wastop>${gi("stop")} Alles stoppen</button><span class="cnt" id="waC"></span></div>
  <p class="muted" style="font-size:16px">Beim ersten Abspielen werden die Klänge nachgeladen (ca. 13 MB).</p>
  <h2 class="st">Musik der Instrumente</h2><p>Das Stück, das beim Stimmen mit dem Instrument spielt.</p>
  ${grid(ins.map(i => `<div class="wac"><canvas data-in="${i}" data-px="64" data-still="1"></canvas>${waBtn(esc(INSTR[i].name), "instr", i, { loop: 1 })}</div>`))}
  <h2 class="st">Fang und Spiel</h2>${grid(sfx.map(x => waBtn(x[1], "sfx", x[0])).concat([waBtn("Wurf", "cast", ""), waBtn("Tick (Stimmen)", "tick", "")]))}
  <h2 class="st">Seltenheits-Töne</h2><p>Spielen zu Beginn der 3-2-1-Phase eines seltenen Tonlings.</p>${grid(rev.map(x => `<div class="wac">${rarPill(+x[0].slice(3))}${waBtn(x[1], "sfx", x[0])}</div>`))}
  <h2 class="st">Sanktum</h2>${grid(sk.map(x => waBtn(x[1], "sfx", x[0])))}
  <h2 class="st">Dauermusik im Sanktum</h2>${grid([waBtn("Sanktum (Tag)", "amb", "sanctum", { loop: 1 }), waBtn("Sanktum (Nacht)", "amb", "sanctum_nacht", { loop: 1 })])}
  <h2 class="st">Wetter</h2><p>Klangteppiche, die draußen bei diesem Wetter laufen.</p>${grid(WX_IDS.filter(i => i !== "klar").map(i => `<div class="wac"><canvas data-ic="wx:${i}" data-px="64" data-still="1"></canvas>${waBtn(esc(WX[i].name), "wxa", i, { loop: 1 })}</div>`))}
  <h2 class="st">Wetter und Totems: Effekte</h2>${grid([["wx_new", "Neues Wetter"], ["wx_rare", "Seltenes Wetter"], ["wx_mut", "Wettermutation gefangen"], ["thunder", "Donner"], ["totem_get", "Totem gefangen"], ["totem_use", "Wettertotem benutzt"], ["totem_sun", "Sonnentotem benutzt"], ["totem_no", "Totem wirkt nicht"]].map(x => waBtn(x[1], "sfx", x[0])))}
  <h2 class="st">Echoszene</h2><p>Ton der Offenbarung, wenn du einen Echosplitter einsetzt.</p>${grid([waBtn("Aufladen", "ec", "start", { loop: 1 }), waBtn("Windstoß", "ec", "whoosh"), waBtn("Einschlag", "ec", "hit"), waBtn("Donner", "ec", "boom")].concat(ec.map(x => waBtn(x[1], "ec", x[0]))))}
  <h2 class="st">Rohklänge der Instrumente</h2><p>Die Samples, aus denen die Instrumente gebaut sind.</p>${grid(["geige", "glocken", "harfe", "holz", "klangschale", "laute", "schelle", "schilf", "sternenharfe", "urgabel", "weltenorgel", "wolkenhorn"].map(n => waBtn(n[0].toUpperCase() + n.slice(1), "sample", "n_" + n)))}`,
    after(root) { Q1("#waC", root).textContent = ins.length + " Instrumente · " + (sfx.length + rev.length + sk.length + ec.length + 14 + 8 + WX_IDS.length - 1) + " Effekte"; hydrate(root); Q1("#waV", root).oninput = e => waVol(+e.target.value / 100); } };
};
