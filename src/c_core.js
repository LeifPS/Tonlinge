/* ===== ZUSTAND, SPEICHERN, ZEIT, ZUFALL ===== */
const $ = id => document.getElementById(id);
/* Noten-Symbol (Münze mit Note) */
const NT = '<i class="nt" title="Noten"></i>';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fresh = () => ({
  v: 1, lvl: 1, xp: 0, gold: 0, t: 8 * 60 / 1440 * GAME.dayLen, // Spielzeit in Sekunden des Tages; Start 8 Uhr
  px: START.tx * TS + TS / 2, py: START.ty * TS + TS / 2,
  instr: ["holz"], eq: "holz",
  bar: ["i:eq", "x:bag", "x:inv", "x:idx", "x:log", null, null, null, null, null], hold: null,
  inv: [], dex: {}, q: {}, flags: {}, stats: { catches: 0, tries: 0 }, mute: false
});
let S = fresh();
const newUid = () => Math.random().toString(36).slice(2, 9);
function load() {
  try { const r = JSON.parse(localStorage.getItem(KEY)); if (r && r.v === 1) { S = Object.assign(fresh(), r); S.flags = S.flags || {}; if (S.flags.gotFlute === undefined) S.flags.gotFlute = S.flags.hasIdx = 1; } } catch (e) {}
  // Ältere Spielstände: Leiste auf Gegenstände umstellen, Tonlinge bekommen eine Kennung
  if (S.flags && S.flags.untr && S.q) for (const id in S.flags.untr) if (S.q[id] && S.q[id].st === "done") delete S.flags.untr[id]; // abgeschlossene Quests sind nie "nicht verfolgt"
  S.inv = S.inv.filter(t => SP[t.sp]); // entfernte Arten (z. B. Glutherz) aus alten Spielständen
  S.inv.forEach(t => { if (!t.uid) t.uid = newUid(); });
  S.flags = S.flags || {}; if (S.q && S.q.m13 && S.q.m13.st === "done") S.flags.gate4Open = true;
  // Alte Spielstände: Leiste (9 Plätze) wird zum Anfang des großen Inventars; alles, was noch nirgends liegt, wandert in die Reihen darunter
  S.bar = (Array.isArray(S.bar) ? S.bar : []).map(v => v === "eq" ? "i:eq" : (typeof v === "string" && INSTR[v]) ? "i:eq" : (typeof v === "string" && /^i:/.test(v)) ? "i:eq" : (v === "bag" || v === "idx") ? "x:" + v : (typeof v === "string" && /^[itx]:/.test(v)) ? v : null);
  if (!S.flags.hz2) { S.flags.hz2 = 1; S.inv.forEach(t => { if (SP[t.sp] && SP[t.sp].a === 2 && t.hz != null) t.hz = Math.round(newHz(t.hz) * 10) / 10; }); }
  if (!S.flags.hz3) { S.flags.hz3 = 1; const PV = { kiesel: [92, 103], tropfi: [94, 106], funzel: [96, 108], schlurf: [99, 110], glimmling: [106, 117], echolot: [108, 119], stalagnuss: [110, 121], kristallo: [117, 128], dunkelwisp: [119, 130], hallsaenger: [126, 139], amethyst: [128, 142], sonnenkern: [139, 150] }; S.inv.forEach(t => { const pv = PV[t.sp], sp = SP[t.sp]; if (pv && t.hz != null) t.hz = Math.round((sp.hz[0] + clamp((t.hz - pv[0]) / (pv[1] - pv[0]), 0, 1) * (sp.hz[1] - sp.hz[0])) * 10) / 10; }); }
  if (!S.flags.fold) { S.flags.fold = 1; if (S.py >= 112 * TS) { S.px += 80 * TS; S.py = 224 * TS - S.py; } } // Welt wurde zur U-Form gefaltet
  if (!S.flags.fold2) { S.flags.fold2 = 1; if (S.px >= 80 * TS && S.py < 112 * TS) S.px = 240 * TS - S.px; else if (S.py >= 112 * TS) { S.px = 36 * TS; S.py = 100 * TS; } } // Spiegelung von Bereich 3+4 und neuer Ausgang
  normalizeSlots();
}
/* Inventar: S.bar ist die ganze Liste der Plätze (die ersten 9 sind die Leiste). Jeder Besitz liegt genau einmal in einem Platz. */
function normalizeSlots() {
  const inst = new Set(S.instr), uids = new Set(S.inv.map(t => t.uid)), seen = new Set();
  let b = (Array.isArray(S.bar) ? S.bar : []).map(v => {
    if (typeof v !== "string" || seen.has(v)) return null; const k = v[0], id = v.slice(2);
    const ok = k === "i" ? id === "eq" : k === "x" ? id === "bag" || id === "idx" || id === "log" || id === "inv" : k === "t" ? uids.has(id) : false;
    if (!ok) return null; seen.add(v); return v; });
  while (b.length < 36 || b.length % 9) b.push(null);
  const grow = () => { for (let k = 0; k < 9; k++) b.push(null); };
  const put = (v, from) => { if (seen.has(v)) return; let j = b.indexOf(null, from); if (j < 0) { j = b.length; grow(); } b[j] = v; seen.add(v); };
  ["x:bag", "x:inv", "x:idx", "x:log"].forEach(v => put(v, 0));
  if (!seen.has("i:eq")) { const j = b.indexOf(null); if (j >= 0 && j < 9) { b[j] = "i:eq"; seen.add("i:eq"); } else put("i:eq", 0); }
  S.inv.slice().sort((x, y) => SP[y.sp].r - SP[x.sp].r || (y.mut ? 1 : 0) - (x.mut ? 1 : 0)).forEach(t => put("t:" + t.uid, 9));
  let free = b.filter(v => !v).length; while (free < 9) { grow(); free += 9; }
  while (b.length > 36 && free >= 18 && b.slice(-9).every(v => !v)) { b.length -= 9; free -= 9; }
  S.bar = b; if (S.hold && !uids.has(S.hold)) S.hold = null;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
function resetAll() { try { localStorage.removeItem(KEY); } catch (e) {} S = fresh(); }

const dayFrac = () => (S.t % GAME.dayLen) / GAME.dayLen;
const hourNow = () => dayFrac() * 24;
const isNight = () => { const h = hourNow(); return h >= 20 || h < 6; };
function clockStr() { const h = Math.floor(hourNow()), m = Math.floor((hourNow() - h) * 60 / 10) * 10; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function nightAmt() { const h = hourNow(); // 0 hell, 1 dunkel, weiche Übergänge
  if (h >= 21 || h < 5) return 1; if (h >= 19) return (h - 19) / 2; if (h < 7) return 1 - (h - 5) / 2; return 0; }

/* ----- Tonling-Wahl ----- */
/* Eigene Fähigkeiten: ABIL[kennung] = { Wirkungen }; Standard-Fähigkeiten laufen weiter über ihre festen Kennungen */
const ABIL = {};
/* Seltenheit: Effektstufe (0 keiner, 1 Glanz, 2 Glanz + Leuchten), Zonen-Faktor und Starthilfe je Stufe */
function rarLv(i) { const r = RAR[i]; return r && r.fx != null ? r.fx : i >= 3 ? 2 : i >= 2 ? 1 : 0; }
function rarRm(i) { const r = RAR[i]; return r && r.rm != null ? r.rm : ([1.45, 1.2, 1, .8, .5, .25][i] || (i > 5 ? .25 : 1)); }
function rarEasy(i) { const r = RAR[i]; return r && r.easy != null ? r.easy : ([1, .5][i] || 0); }
function abil(ins, k, def) { const a = ins && ins.pas && ABIL[ins.pas]; return a && a[k] != null ? a[k] : def; }
function luckNow() { const i = INSTR[S.eq]; return i.luck / 100 + abil(i, "luckAdd", 0) / 100; }
/* Spawn-Chancen einer Zone: Liste { s: Art, p: Wahrscheinlichkeit }. Auch der Editor nutzt sie. */
function speciesWeights(zone, night, L, first) {
  const area = ZINFO[zone].a;
  const list = SPECIES.filter(s => s.a === area && s.z.includes(zone) && (s.t === "b" || (s.t === "n") === night));
  if (!list.length) return [];
  if (first) { const lo = Math.min(...list.map(s => s.r)); const l0 = list.filter(s => s.r === lo); return l0.map(s => ({ s, p: 1 / l0.length })); } // die ersten 3 Fänge: immer gewöhnlich
  const rmA = (AREAS[area] && AREAS[area].rm) || {}; const w = list.map(s => { const base = RAR[s.r].w * (rmA[s.r] || 1) * (s.w == null ? 1 : s.w) * (s.zw && s.zw[zone] != null ? s.zw[zone] : 1); return base * (s.r >= 2 ? 1 + L * (s.r) * 0.9 : 1 - L * 0.3); });
  // pro Seltenheit gleiche Gesamtchance, verteilt auf die Arten dieser Stufe
  const cnt = {}; list.forEach(s => cnt[s.r] = (cnt[s.r] || 0) + 1);
  const ww = list.map((s, i) => w[i] / cnt[s.r]), sum = ww.reduce((a, b) => a + b, 0) || 1;
  return list.map((s, i) => ({ s, p: ww[i] / sum }));
}
function pickSpecies(zone, perfect) {
  const wl = speciesWeights(zone, isNight(), luckNow() + (perfect ? 0.15 : 0), S.stats.catches < 3); if (!wl.length) return null;
  let t = Math.random(); for (const e of wl) { t -= e.p; if (t <= 0) return e.s; }
  return wl[wl.length - 1].s;
}
function rollMut() { if (S.stats.catches < 3) return null; const p = INSTR[S.eq].pas; const own = MUTS.find(m => m.ins === S.eq); if (own && Math.random() < own.ip) return own.id; const _i = INSTR[S.eq], _add = abil(_i, "mutAdd", null), _by = abil(_i, "mutBy", null); if (_add) for (const k in _add) if (MUTS.find(m => m.id === k) && Math.random() < _add[k]) return k; if (p === "moos" && Math.random() < 0.10) return "moos"; const f = (p === "mut" || p === "moos" || p === "chor" ? 1.5 : 1) * (p === "nacht" && isNight() ? 2 : 1) * abil(_i, "mutMul", 1) * (isNight() ? abil(_i, "mutNight", 1) : 1); for (let i = MUTS.length - 1; i >= 0; i--) if (Math.random() < MUTS[i].p * f * (MUTS[i].id === "stern" && p === "stern" ? 4 : 1) * (MUTS[i].id === "funkel" && p === "funkel" ? 3 : 1) * (MUTS[i].id === "glas" && p === "glas" ? 3 : 1) * (p === "glimmer" && (MUTS[i].id === "glas" || MUTS[i].id === "funkel") ? 2 : 1) * (_by && _by[MUTS[i].id] != null ? _by[MUTS[i].id] : 1)) return MUTS[i].id; return null; }
const mutOf = id => MUTS.find(m => m.id === id);
/* Frühere Hz-Skala (vor dem Zusammenrücken von Bereich 1 und 2) für Klang und Fang-Schwierigkeit */
const oldHz = x => x < 92 ? x : 70 + (x - 92) / 0.45, newHz = x => x < 70 ? x : Math.round(92 + (x - 70) * 0.45);
function hzMul(t) { if (t.hz == null) return 1; const sp = SP[t.sp], span = Math.max(1, sp.hz[1] - sp.hz[0]); return 0.6 + 0.8 * Math.min(1, Math.max(0, (t.hz - sp.hz[0]) / span)); }
function tlValue(t) { const sp = SP[t.sp], m = t.mut ? mutOf(t.mut).mul : 1; return Math.max(1, Math.round((sp.val != null ? sp.val : RAR[sp.r].val) * AREAS[sp.a].valMul * m * hzMul(t) * (t.b ? 1.2 : 1) * (t.vm || 1))); }
function tlXp(t) { const sp = SP[t.sp], m = t.mut ? mutOf(t.mut).mul : 1; return Math.round((sp.xp != null ? sp.xp : RAR[sp.r].xp) * AREAS[sp.a].xpMul * Math.sqrt(m)); }

/* ----- Erfahrung ----- */
let onLevelUp = () => {};
let XPB = null;
function addXp(n) { const f0 = S.xp / xpNeed(S.lvl), l0 = S.lvl; S.xp += n; let up = false; while (S.xp >= xpNeed(S.lvl)) { S.xp -= xpNeed(S.lvl); S.lvl++; up = true; } XPB = { t0: performance.now() / 1000, f0, l0, gain: n, up: S.lvl > l0 }; if (up) onLevelUp(); }

/* ----- Ton ----- */
let Snd_err = [];
const Snd = (() => {
  let ac = null, bufs = {}, master = null, tone = null, loading = false;
  function b64ToBuf(b) { const s = atob(b), a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a.buffer; }
  function init() {
    if (ac) { if (ac.state === "suspended") ac.resume(); return; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ac.createGain(); master.gain.value = S.mute ? 0 : 1; ac.onstatechange = () => {}; master.connect(ac.destination);
    if (typeof TRACKS !== "undefined") setTimeout(() => Object.keys(TRACKS).forEach(k => trackLoad(k)), 300);
    if (!loading && typeof SND_B64 !== "undefined") { loading = true; Object.keys(SND_B64).forEach(k => { try { ac.decodeAudioData(b64ToBuf(SND_B64[k]), b => { bufs[k] = b; }, e => { Snd_err.push(k + ' ' + e); }); } catch (e) {} }); }
  }
  function setMute(m) { S.mute = m; if (master) master.gain.value = m ? 0 : 1; }
  function synth(name, rate, vol, delay) {
    const f0 = { floete: 520, harfe: 392, perfect: 880, fang: 660, levelup: 520, coins: 1320, flucht: 900 }[name] || 600, t0 = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
    o.type = name === "flucht" ? "sawtooth" : "triangle"; o.frequency.setValueAtTime(f0 * rate, t0); if (name === "flucht") o.frequency.exponentialRampToValueAtTime(f0 * rate * 2, t0 + .25);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.35 * vol, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t0 + (name === "levelup" ? 0.9 : 0.5)); o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + 1);
  }
  function play(name, rate = 1, vol = 1, delay = 0) {
    if (!ac) return; if (!bufs[name]) { synth(name, rate, vol, delay); return; }
    const s = ac.createBufferSource(); s.buffer = bufs[name]; s.playbackRate.value = rate;
    const g = ac.createGain(); g.gain.value = Math.min(1.6, vol * 1.5); s.connect(g); g.connect(master); s.start(ac.currentTime + delay);
  }
  const SCALE = [0, 2, 4, 7, 9, 12, 14, 16]; // Pentatonik
  function melody(name, notes, step = 0.16, vol = 0.8, base = 1) { notes.forEach((n, i) => play(name, base * Math.pow(2, SCALE[n % SCALE.length] / 12), vol, i * step)); }
  let loop = null;
  const AL = window.AL_X = { egitarre: ["laute", 1.3], rassel: ["schelle", 1.35], maultrommel: ["holz", .75], steinxylo: ["schelle", 1.9], zither: ["harfe", 1.15], windspiel: ["glocken", 1.5], dudelsack: ["wolkenhorn", 1.25], perlpfeife: ["schilf", 2], treibharfe: ["harfe", .8], korallenorgel: ["weltenorgel", 1.5], tonocarina: ["holz", 1.5], waldtrommel: ["schelle", 0.6], kalimba: ["harfe", 1.35], panfloete: ["schilf", 1.6], glasharmonika: ["klangschale", 1.3], rauschmuschel: ["glocken", 0.8], gezeitenrohr: ["wolkenhorn", 0.7], tiefengong: ["klangschale", 0.55], urmeerchor: ["weltenorgel", 1.12] };
  const alias = id => AL[id] || [id, 1];
  function instr(id, rate = 1, vol = 1) { if (!ac) return; const [a, m] = alias(id); play(bufs["n_" + a] ? "n_" + a : "harfe", rate * m, vol); }
  let songMem = null;
  function playVoice(V, m, t1, d, multi, dest, det = 0) {
    const f = 440 * Math.pow(2, (m - 69) / 12), mf = multi ? 0.67 : 1;
    if (V.k === "pl") {
      const amp = V.amp * mf * Math.min(1, 1.6 - m / 90), dec = V.dec + Math.min(1.2, d) * (V.hold == null ? 1 : V.hold), ng = ac.createGain();
      ng.gain.setValueAtTime(0.0001, t1); ng.gain.linearRampToValueAtTime(amp, t1 + 0.006); ng.gain.exponentialRampToValueAtTime(0.0008, t1 + dec); ng.connect(dest);
      V.h.forEach(([h, a]) => { const o = ac.createOscillator(), hg = ac.createGain(); o.type = "sine"; o.frequency.value = f * h; o.detune.value = det; hg.gain.value = a; o.connect(hg); hg.connect(ng); o.start(t1); o.stop(t1 + dec + 0.05); });
      if (V.click) { const n = ac.createBufferSource(), len = Math.floor(ac.sampleRate * 0.03), nb = ac.createBuffer(1, len, ac.sampleRate), dd = nb.getChannelData(0); for (let i = 0; i < len; i++) dd[i] = (Math.random() * 2 - 1) * (1 - i / len); n.buffer = nb; const cg = ac.createGain(); cg.gain.value = V.click * mf; const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 3500; n.connect(hp); hp.connect(cg); cg.connect(dest); n.start(t1); }
      return; }
    const t2 = t1 + Math.max(0.25, d * 0.97), amp = V.amp * (multi ? 0.7 : 1), ng = ac.createGain(); let tail = ng;
    if (V.lp || V.lpf) { const lf = ac.createBiquadFilter(); lf.type = "lowpass"; lf.frequency.value = V.lpf || Math.min(5200, f * V.lp); lf.Q.value = V.lpf ? 1.2 : 0.7; lf.connect(ng); tail = lf; }
    ng.gain.setValueAtTime(0.0001, t1); ng.gain.linearRampToValueAtTime(amp, t1 + V.att); ng.gain.setValueAtTime(amp, Math.max(t1 + V.att + 0.01, t2 - 0.05)); ng.gain.exponentialRampToValueAtTime(0.0008, t2 + V.rel); ng.connect(dest);
    const oscs = [];
    let vb = null, vg = null; if (V.vib) { vb = ac.createOscillator(); vg = ac.createGain(); vb.frequency.value = V.vib[0]; vg.gain.value = f * V.vib[1]; vb.connect(vg); oscs.push(vb); }
    V.parts.forEach(([mu, gn, ty, dt]) => { const o = ac.createOscillator(), pg = ac.createGain(); o.type = ty; o.frequency.value = f * mu; o.detune.value = dt + det; pg.gain.value = gn; if (vg) vg.connect(o.frequency); o.connect(pg); pg.connect(tail); oscs.push(o); });
    oscs.forEach(o => { o.start(t1); o.stop(t2 + V.rel + 0.1); });
  }
  function songStart(id, vol) {
    const sd = songEvents(id), voice = SONGS[id].voice, buf = bufs["n_" + alias(id)[0]]; if (!sd || (!buf && !voice)) return false;
    const g = ac.createGain(); g.gain.value = 0; g.connect(master); g.gain.setTargetAtTime(Math.min(1.6, vol * 1.5), ac.currentTime, 0.12);
    const off = 0; songMem = null;
    const L = { song: true, id, g, t0: ac.currentTime - off, i: sd.ev.findIndex(e => e.t >= off), sd };
    if (L.i < 0) L.i = sd.ev.length;
    const pump = () => { const cur = ac.currentTime - L.t0;
      while (L.i < sd.ev.length && sd.ev[L.i].t < cur + 0.4) { const e = sd.ev[L.i++], when = ac.currentTime + Math.max(0, e.t - cur);
        if (voice) { e.n.forEach(m => playVoice(VOICES[voice], m, ac.currentTime + Math.max(0, e.t - cur), e.d, e.n.length > 1, g, L.det || 0)); continue; }
        e.n.forEach(m => { let x = m - sd.mid; while (x > 15) x -= 12; while (x < -15) x += 12; const s = ac.createBufferSource(); s.buffer = buf; s.playbackRate.value = Math.pow(2, x / 12) * alias(id)[1]; s.detune.value = L.det || 0;
          const ng = ac.createGain(); ng.gain.value = (e.n.length > 1 ? 0.62 : 0.85); s.connect(ng); ng.connect(g); s.start(when); }); }
      if (cur > sd.len + 3) { clearInterval(L.timer); L.done = true; } };
    L.timer = setInterval(pump, 90); pump(); loop = L; return true;
  }
  function loopStop(quick) { if (!loop) return; const l = loop; loop = null; if (l.track) { l.dead = true; try { l.g.gain.cancelScheduledValues(ac.currentTime); l.g.gain.setTargetAtTime(0, ac.currentTime, quick ? 0.03 : 0.15); setTimeout(() => { try { l.s && l.s.stop(); } catch (e) {} }, 700); } catch (e) {} return; } if (l.song) { clearInterval(l.timer); if (!l.done) songMem = { id: l.id, pos: ac.currentTime - l.t0, at: ac.currentTime }; try { l.g.gain.cancelScheduledValues(ac.currentTime); l.g.gain.setTargetAtTime(0, ac.currentTime, quick ? 0.02 : 0.08); } catch (e) {} return; } try { l.g.gain.cancelScheduledValues(ac.currentTime); l.g.gain.setTargetAtTime(0, ac.currentTime, quick ? 0.02 : 0.08); setTimeout(() => { try { l.s.stop(); } catch (e) {} }, 400); } catch (e) {} }
  const trackBufs = {}, trackWait = {};
  function trackLoad(id, cb) { if (trackBufs[id]) return cb && cb(trackBufs[id]); if (!TRACKS[id] || !ac) return; if (trackWait[id]) { trackWait[id].push(cb); return; } trackWait[id] = [cb];
    try { const bin = atob(TRACKS[id]), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); ac.decodeAudioData(u.buffer, b => { trackBufs[id] = b; (trackWait[id] || []).forEach(f => f && f(b)); trackWait[id] = null; }, () => { trackWait[id] = null; }); } catch (e) { trackWait[id] = null; } }
  /* Tonhöhe ändern ohne das Tempo zu ändern: zwei überblendete Verzögerungsleitungen (Granular-Pitchshift) */
  function makeShifter() {
    const P = 0.12, n = Math.floor(ac.sampleRate * P), inp = ac.createGain(), out = ac.createGain(), rb = ac.createBuffer(1, n, ac.sampleRate), wb = ac.createBuffer(1, n, ac.sampleRate), rd = rb.getChannelData(0), wd = wb.getChannelData(0);
    for (let i = 0; i < n; i++) { rd[i] = i / n; wd[i] = Math.pow(Math.sin(Math.PI * i / n), 2); }
    const taps = [0, 1].map(k => { const dl = ac.createDelay(0.5), amp = ac.createGain(), wg = ac.createGain(), rs = ac.createBufferSource(), ws = ac.createBufferSource(); dl.delayTime.value = 0; amp.gain.value = 0; wg.gain.value = 0;
      rs.buffer = rb; rs.loop = true; ws.buffer = wb; ws.loop = true; rs.connect(amp); amp.connect(dl.delayTime); ws.connect(wg.gain); inp.connect(dl); dl.connect(wg); wg.connect(out);
      const t = ac.currentTime + 0.01; rs.start(t, k * P / 2); ws.start(t, k * P / 2); return { dl, amp }; });
    return { inp, out, set(c) { const r = Math.pow(2, c / 1200), t = ac.currentTime; taps.forEach(x => { x.amp.gain.setTargetAtTime((1 - r) * P, t, 0.06); x.dl.delayTime.setTargetAtTime(Math.max(0, r - 1) * P, t, 0.06); }); } };
  }
  function trackStart(id, vol) {
    const L = { track: true, id, g: ac.createGain(), s: null, dead: false }; L.g.gain.value = 0; L.g.connect(master); loop = L;
    trackLoad(id, b => { if (L.dead || loop !== L) return; const s = ac.createBufferSource(); s.buffer = b; s.loop = true; const sh = makeShifter(); s.connect(sh.inp); sh.out.connect(L.g); sh.set(L.cents || 0); s.start(); L.s = s; L.sh = sh; L.g.gain.setTargetAtTime(Math.min(1.6, vol * 1.5), ac.currentTime, 0.2); L.vol = vol; }); return true;
  }
  function loopStart(id, rate = 1, vol = 0.4, song = false) { if (!ac) return; loopStop(true); if (song && TRACKS[id] && trackStart(id, vol)) return; if (song && SONGS[id] && songStart(id, vol)) return; const [a, m] = alias(id); rate *= m; const b = bufs["l_" + a]; if (!b) return; const s = ac.createBufferSource(); s.buffer = b; s.loop = true; s.playbackRate.value = rate; const g = ac.createGain(); g.gain.value = 0; s.connect(g); g.connect(master); s.start(); g.gain.setTargetAtTime(Math.min(1.6, vol * 1.5), ac.currentTime, 0.12); loop = { s, g }; }
  function loopSet(rate, vol) { if (!loop) return; if (loop.track) { if (vol != null) loop.g.gain.setTargetAtTime(Math.min(1.6, vol * 1.5), ac.currentTime, 0.12); return; } if (loop.song) { if (vol != null) loop.g.gain.setTargetAtTime(Math.min(1.6, vol * 1.5), ac.currentTime, 0.1); return; } if (rate != null) loop.s.playbackRate.setTargetAtTime(rate, ac.currentTime, 0.08); if (vol != null) loop.g.gain.setTargetAtTime(Math.min(1.6, vol * 1.5), ac.currentTime, 0.1); }
  function loopDetune(cents) { if (!loop) return; if (loop.track) { loop.cents = cents; if (loop.sh) loop.sh.set(cents); } else if (loop.song) loop.det = cents; else if (loop.s) loop.s.detune.setTargetAtTime(cents, ac.currentTime, 0.07); }
  function songKeep(id, vol) { if (loop && (loop.track || loop.song) && loop.id === id) { loop.g.gain.setTargetAtTime(Math.min(1.6, vol * 1.5), ac.currentTime, 0.2); loopDetune(0); return; } loopStart(id, 1, vol, true); }
  function cast() { if (!ac) return; const t0 = ac.currentTime; [[392, "sine", .26, .5], [784, "triangle", .1, .3], [1176, "sine", .05, .2]].forEach(([f, ty, a, d]) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = ty; o.frequency.setValueAtTime(f, t0); o.frequency.exponentialRampToValueAtTime(f * 1.02, t0 + d); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(a, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.001, t0 + d); o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + d + 0.05); }); }
  const hasLoop = id => !!bufs["l_" + alias(id)[0]];
  function tick(vol = 0.3, f = 1800, d = 0.05) { if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(); o.type = "triangle"; o.frequency.value = f; g.gain.setValueAtTime(vol, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + d); o.connect(g); g.connect(master); o.start(); o.stop(ac.currentTime + d + 0.02); }
  const hzToF = hz => 130.8 * Math.pow(2, hz / 40);
  function toneStart(id) { if (!ac || tone) return; if (id && ((typeof TRACKS !== "undefined" && TRACKS[id]) || (typeof SONGS !== "undefined" && SONGS[id]))) return; /* mit Lied: nur das Lied */ const tg = id && ((typeof TRACKS !== "undefined" && TRACKS[id]) || hasLoop(id)) ? 0.07 : 0.3; const o1 = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), trem = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
    o1.type = "sine"; o2.type = "triangle"; lfo.type = "sine"; lg.gain.value = 0.5; trem.gain.value = 0.5; lfo.connect(lg); lg.connect(trem.gain);
    o1.connect(trem); o2.connect(trem); trem.connect(g); g.gain.value = 0; g.connect(master); o1.start(); o2.start(); lfo.start(); g.gain.linearRampToValueAtTime(tg, ac.currentTime + 0.1);
    tone = { o1, o2, g, lfo, trem, lg }; }
  function toneSet(hz, off) { loopSet(0.8 + 0.5 * clamp(hz / 240, 0, 1), 0.2 + 0.4 * clamp(1 - off / 25, 0, 1)); if (!tone) return; const f = hzToF(hz); tone.o1.frequency.setTargetAtTime(f, ac.currentTime, 0.03); tone.o2.frequency.setTargetAtTime(f * 2.0, ac.currentTime, 0.03);
    const near = clamp(1 - off / 25, 0, 1); tone.lfo.frequency.setTargetAtTime(0.5 + off * 0.5, ac.currentTime, 0.05); tone.lg.gain.setTargetAtTime(0.5 * (1 - near), ac.currentTime, 0.05); tone.trem.gain.setTargetAtTime(0.5 + 0.5 * near, ac.currentTime, 0.05); tone.o2.detune.setTargetAtTime(off < 2 ? 0 : 20, ac.currentTime, 0.1); }
  function toneStop(keepLoop) { if (!keepLoop) loopStop(); if (!tone) return; const t = tone; tone = null; try { t.g.gain.cancelScheduledValues(ac.currentTime); t.g.gain.setTargetAtTime(0, ac.currentTime, 0.05); setTimeout(() => { try { t.o1.stop(); t.o2.stop(); t.lfo.stop(); } catch (e) {} }, 300); } catch (e) {} }
    let pad = null, padKey = "";
  function setPad(key) {
    if (!ac || key === padKey) return; padKey = key; const ch = { day: [130.8, 196, 329.6], night: [110, 164.8, 261.6], cave: [146.8, 220, 349.2], caveN: [98, 147, 233] }[key] || [130.8, 196, 329.6];
    if (!pad) { pad = { g: ac.createGain(), o: [] }; pad.g.gain.value = 0; pad.g.connect(master); const lf = ac.createOscillator(), lg = ac.createGain(); lf.frequency.value = 0.12; lg.gain.value = 0.02; lf.connect(lg); lg.connect(pad.g.gain); lf.start(); for (let i = 0; i < 3; i++) { const o = ac.createOscillator(); o.type = i === 1 ? "triangle" : "sine"; o.detune.value = (i - 1) * 7; o.connect(pad.g); o.start(); pad.o.push(o); } pad.g.gain.setTargetAtTime(0.05, ac.currentTime, 1.5); }
    pad.o.forEach((o, i) => o.frequency.setTargetAtTime(ch[i], ac.currentTime, 1.2));
  }
  return { setPad, dbg: () => ({ state: ac && ac.state, bufs: Object.keys(bufs), err: Snd_err, tracks: Object.keys(trackBufs) }), init, play, melody, tick, instr, cast, loopDetune, songKeep, loopStart, loopSet, loopStop, toneStart, toneSet, toneStop, setMute, hzToF, get ready() { return !!ac; } };
})();
