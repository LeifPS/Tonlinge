/* ===== ZUSTAND, SPEICHERN, ZEIT, ZUFALL ===== */
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fresh = () => ({
  v: 1, lvl: 1, xp: 0, gold: 0, t: 8 * 60 / 1440 * DAY_LEN, // Spielzeit in Sekunden des Tages; Start 8 Uhr
  px: START.tx * TS + TS / 2, py: START.ty * TS + TS / 2,
  instr: ["holz"], eq: "holz",
  bar: ["eq", "bag", "idx", "inv", "qst", null, null, null, null],
  inv: [], dex: {}, q: {}, flags: {}, stats: { catches: 0, tries: 0 }, mute: false
});
let S = fresh();
function load() { try { const r = JSON.parse(localStorage.getItem(KEY)); if (r && r.v === 1) S = Object.assign(fresh(), r); } catch (e) {} }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
function resetAll() { try { localStorage.removeItem(KEY); } catch (e) {} S = fresh(); }

const dayFrac = () => (S.t % DAY_LEN) / DAY_LEN;
const hourNow = () => dayFrac() * 24;
const isNight = () => { const h = hourNow(); return h >= 20 || h < 6; };
function clockStr() { const h = Math.floor(hourNow()), m = Math.floor((hourNow() - h) * 60 / 10) * 10; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function nightAmt() { const h = hourNow(); // 0 hell, 1 dunkel, weiche Übergänge
  if (h >= 21 || h < 5) return 1; if (h >= 19) return (h - 19) / 2; if (h < 7) return 1 - (h - 5) / 2; return 0; }

/* ----- Tonling-Wahl ----- */
function luckNow() { const i = INSTR[S.eq]; return i.luck / 100; }
function pickSpecies(zone, perfect) {
  const area = ZINFO[zone].a, night = isNight(), res = INSTR[S.eq].res, L = luckNow() + (perfect ? 0.15 : 0);
  const list = SPECIES.filter(s => s.a === area && s.z.includes(zone) && s.hz[0] <= res && (s.t === "b" || (s.t === "n") === night));
  if (!list.length) return null;
  const w = list.map(s => { const base = RAR[s.r].w; return base * (s.r >= 2 ? 1 + L * (s.r) * 0.9 : 1 - L * 0.3); });
  // pro Seltenheit gleiche Gesamtchance, verteilt auf die Arten dieser Stufe
  const cnt = {}; list.forEach(s => cnt[s.r] = (cnt[s.r] || 0) + 1);
  const ww = list.map((s, i) => w[i] / cnt[s.r]);
  let t = Math.random() * ww.reduce((a, b) => a + b, 0);
  for (let i = 0; i < list.length; i++) { t -= ww[i]; if (t <= 0) return list[i]; }
  return list[list.length - 1];
}
function rollMut() { const f = INSTR[S.eq].pas === "mut" ? 1.5 : 1; for (let i = MUTS.length - 1; i >= 0; i--) if (Math.random() < MUTS[i].p * f) return MUTS[i].id; return null; }
const mutOf = id => MUTS.find(m => m.id === id);
function hzMul(t) { if (t.hz == null) return 1; const sp = SP[t.sp], span = Math.max(1, sp.hz[1] - sp.hz[0]); return 0.6 + 0.8 * Math.min(1, Math.max(0, (t.hz - sp.hz[0]) / span)); }
function tlValue(t) { const sp = SP[t.sp], m = t.mut ? mutOf(t.mut).mul : 1; return Math.max(1, Math.round(RAR[sp.r].val * AREAS[sp.a].valMul * m * hzMul(t))); }
function tlXp(t) { const sp = SP[t.sp], m = t.mut ? mutOf(t.mut).mul : 1; return Math.round(RAR[sp.r].xp * AREAS[sp.a].xpMul * Math.sqrt(m)); }

/* ----- Erfahrung ----- */
let onLevelUp = () => {};
function addXp(n) { S.xp += n; let up = false; while (S.xp >= xpNeed(S.lvl)) { S.xp -= xpNeed(S.lvl); S.lvl++; up = true; } if (up) onLevelUp(); }

/* ----- Ton ----- */
let Snd_err = [];
const Snd = (() => {
  let ac = null, bufs = {}, master = null, tone = null, loading = false;
  function b64ToBuf(b) { const s = atob(b), a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a.buffer; }
  function init() {
    if (ac) { if (ac.state === "suspended") ac.resume(); return; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ac.createGain(); master.gain.value = S.mute ? 0 : 1; ac.onstatechange = () => {}; master.connect(ac.destination);
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
  function tick(vol = 0.3, f = 1800, d = 0.05) { if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(); o.type = "triangle"; o.frequency.value = f; g.gain.setValueAtTime(vol, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + d); o.connect(g); g.connect(master); o.start(); o.stop(ac.currentTime + d + 0.02); }
  const hzToF = hz => 130.8 * Math.pow(2, hz / 40);
  function toneStart() { if (!ac || tone) return; const o1 = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), trem = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
    o1.type = "sine"; o2.type = "triangle"; lfo.type = "sine"; lg.gain.value = 0.5; trem.gain.value = 0.5; lfo.connect(lg); lg.connect(trem.gain);
    o1.connect(trem); o2.connect(trem); trem.connect(g); g.gain.value = 0; g.connect(master); o1.start(); o2.start(); lfo.start(); g.gain.linearRampToValueAtTime(0.3, ac.currentTime + 0.1);
    tone = { o1, o2, g, lfo, trem, lg }; }
  function toneSet(hz, off) { if (!tone) return; const f = hzToF(hz); tone.o1.frequency.setTargetAtTime(f, ac.currentTime, 0.03); tone.o2.frequency.setTargetAtTime(f * 2.0, ac.currentTime, 0.03);
    const near = clamp(1 - off / 25, 0, 1); tone.lfo.frequency.setTargetAtTime(0.5 + off * 0.5, ac.currentTime, 0.05); tone.lg.gain.setTargetAtTime(0.5 * (1 - near), ac.currentTime, 0.05); tone.trem.gain.setTargetAtTime(0.5 + 0.5 * near, ac.currentTime, 0.05); tone.o2.detune.setTargetAtTime(off < 2 ? 0 : 20, ac.currentTime, 0.1); }
  function toneStop() { if (!tone) return; const t = tone; tone = null; try { t.g.gain.cancelScheduledValues(ac.currentTime); t.g.gain.setTargetAtTime(0, ac.currentTime, 0.05); setTimeout(() => { try { t.o1.stop(); t.o2.stop(); t.lfo.stop(); } catch (e) {} }, 300); } catch (e) {} }
    let pad = null, padKey = "";
  function setPad(key) {
    if (!ac || key === padKey) return; padKey = key; const ch = { day: [130.8, 196, 329.6], night: [110, 164.8, 261.6], cave: [146.8, 220, 349.2], caveN: [98, 147, 233] }[key] || [130.8, 196, 329.6];
    if (!pad) { pad = { g: ac.createGain(), o: [] }; pad.g.gain.value = 0; pad.g.connect(master); const lf = ac.createOscillator(), lg = ac.createGain(); lf.frequency.value = 0.12; lg.gain.value = 0.02; lf.connect(lg); lg.connect(pad.g.gain); lf.start(); for (let i = 0; i < 3; i++) { const o = ac.createOscillator(); o.type = i === 1 ? "triangle" : "sine"; o.detune.value = (i - 1) * 7; o.connect(pad.g); o.start(); pad.o.push(o); } pad.g.gain.setTargetAtTime(0.05, ac.currentTime, 1.5); }
    pad.o.forEach((o, i) => o.frequency.setTargetAtTime(ch[i], ac.currentTime, 1.2));
  }
  return { setPad, dbg: () => ({ state: ac && ac.state, bufs: Object.keys(bufs), err: Snd_err }), init, play, melody, tick, toneStart, toneSet, toneStop, setMute, hzToF, get ready() { return !!ac; } };
})();
