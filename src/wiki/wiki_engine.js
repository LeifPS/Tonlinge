
/* ===== Wiki-Engine: rechnet mit denselben Regeln wie das Spiel (Spawn, Mutation, Wert, Erfahrung, Quests) ===== */
const W = {};
const KEYW = "tonlinge-v1";

/* ----- Zeit: die Weltzeit ist für alle Spieler gleich (Tag = DAY_LEN Sekunden) ----- */
W.worldT = () => Date.now() / 1000 - 1792281600;
W.hour = (t) => (((t == null ? W.worldT() : t) % DAY_LEN) / DAY_LEN) * 24;
W.isNightH = h => h >= 20 || h < 6;
W.clock = () => { const h = W.hour(), hh = Math.floor(h), mm = Math.floor((h - hh) * 60 / 10) * 10, night = W.isNightH(h);
  const secInDay = (W.worldT() % DAY_LEN + DAY_LEN) % DAY_LEN, hs = h => h / 24 * DAY_LEN;
  let toChange; if (night) toChange = h >= 20 ? hs(24 - h + 6) : hs(6 - h); else toChange = hs(20 - h);
  return { h, text: String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0"), night, toChange, day: Math.floor(W.worldT() / DAY_LEN) + 1 }; };
W.mmss = s => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");

/* ----- Instrument-Werte mit Meisterschaft (je Stufe +1 auf alle Werte) und Verzauberung ----- */
W.stats = (id, o = {}) => { const i = INSTR[id], e = o.ench ? ENCH[o.ench] : null, ml = o.mast || 0, out = {};
  for (const k of ["ear", "prec", "harm", "luck", "beat"]) { let v = (i[k] || 0) + ml + ((e && e.add && e.add[k]) || 0); if (e && e.mul) v *= e.mul; out[k] = Math.round(v * 10) / 10; } return out; };
W.luckOf = (id, o) => (W.stats(id, o).luck || 0) / 100;
W.instrIds = () => Object.keys(INSTR);

/* ----- Spawn: wer taucht in einer Zone auf? (wie pickSpecies im Spiel) ----- */
W.zoneArea = z => ZINFO[z].a;
W.speciesIn = (zone, night) => SPECIES.filter(s => s.a === ZINFO[zone].a && s.z.includes(zone) && (night == null || s.t === "b" || (s.t === "n") === night));
W.allZones = () => Object.keys(ZINFO);
W.zonesOf = sp => [...new Set(sp.z)];
W.dist = (zone, night, L) => {
  const area = ZINFO[zone].a, list = W.speciesIn(zone, night), rmA = AREAS[area].rm || {};
  const w = list.map(s => { const base = RAR[s.r].w * (rmA[s.r] || 1); return base * (s.r >= 2 ? 1 + L * s.r * 0.9 : 1 - L * 0.3); });
  const cnt = {}; list.forEach(s => cnt[s.r] = (cnt[s.r] || 0) + 1);
  const ww = w.map((x, i) => x / cnt[list[i].r]), tot = ww.reduce((a, b) => a + b, 0) || 1;
  return list.map((s, i) => ({ s, p: ww[i] / tot }));
};
/* Ergebnis eines ganzen Wurfs: normal oder perfekt (zweiter Wurf mit +15 % Glück, die seltenere Art gewinnt) */
W.final = (zone, night, L, perfect) => {
  const A = W.dist(zone, night, L), out = {};
  if (!perfect) { A.forEach(a => out[a.s.id] = a.p); return out; }
  const B = W.dist(zone, night, L + 0.15);
  A.forEach(a => B.forEach(b => { const f = b.s.r >= a.s.r ? b.s : a.s; out[f.id] = (out[f.id] || 0) + a.p * b.p; })); return out;
};
/* Mischung: Anteil perfekter Würfe pp (0 bis 1) */
W.mix = (zone, night, L, pp) => { const n = W.final(zone, night, L, false), p = W.final(zone, night, L, true), out = {}; for (const id in n) out[id] = (1 - pp) * n[id]; for (const id in p) out[id] = (out[id] || 0) + pp * p[id]; return out; };

/* ----- Mutationen: dieselbe Reihenfolge wie rollMut: eigene, Runisch, Bemoost, dann von hinten nach vorn ----- */
W.mutDist = (instrId, o = {}) => {
  const i = INSTR[instrId], p = i.pas, night = !!o.night, ench = o.ench, px = PASX[p] || null, out = {}; let rem = 1;
  const own = MUTS.find(m => m.ins === instrId); if (own) { out[own.id] = own.ip; rem *= 1 - own.ip; }
  if (ench === "runenklang") { out.runen = (out.runen || 0) + rem * .10; rem *= .90; }
  if (p === "moos") { out.moos = (out.moos || 0) + rem * .10; rem *= .90; }
  const f = (px ? px.mut * (p === "wort" && night ? 1.5 : 1) : 1) * (p === "fanfare" ? (night ? 3 : 2) : 1) * (p === "mut" || p === "moos" || p === "chor" ? 1.5 : 1) * (p === "nacht" && night ? 2 : 1) * (ench === "mutiert" ? 2 : 1);
  for (let k = MUTS.length - 1; k >= 0; k--) { const m = MUTS[k];
    let pr = m.p * f * (m.id === "stern" && p === "stern" ? 4 : 1) * (p === "himmel" && (m.id === "stern" || m.id === "funkel") ? 2 : 1) * (m.id === "funkel" && p === "funkel" ? 3 : 1) * (m.id === "glas" && p === "glas" ? 3 : 1) * (p === "glimmer" && (m.id === "glas" || m.id === "funkel") ? 2 : 1);
    if (pr <= 0) continue; pr = Math.min(1, pr); out[m.id] = (out[m.id] || 0) + rem * pr; rem *= 1 - pr; }
  out.none = rem; return out;
};
W.mutAny = d => 1 - (d.none || 0) - (d.moos || 0);          // "irgendeine Mutation" im Sinne der Quests (Bemoost zählt dort nicht)
W.mutP = (spec, d) => spec === "any" ? W.mutAny(d) : Array.isArray(spec) ? spec.reduce((a, m) => a + (d[m] || 0), 0) : (d[spec] || 0);

/* ----- Wert und Erfahrung ----- */
W.base = (sp, mutId) => sp.val * (mutId ? mutOf(mutId).mul : 1);
W.valueRange = (sp, mutId) => { const b = W.base(sp, mutId); return [Math.max(1, Math.round(b * .6)), Math.max(1, Math.round(b * 1.4)), Math.max(1, Math.round(b))]; };
W.xp = (sp, mutId) => Math.round(sp.xp * Math.sqrt(mutId ? mutOf(mutId).mul : 1));
W.hzMul = (sp, hz) => { const span = Math.max(1, sp.hz[1] - sp.hz[0]); return .6 + .8 * Math.min(1, Math.max(0, (hz - sp.hz[0]) / span)); };

/* ----- Fangschwierigkeit ----- */
W.diff = sp => {
  const wild = Math.max(1, Math.min(1.5, sp.spd / 1.2)), rm = [1.45, 1.2, 1, .8, .5, .25, .2][sp.r] || .2, easy = [1, .5][sp.r] || 0;
  const gain = .16 * rm, loss = .10 * wild * (1 - .5 * easy), tempo = sp.spd, tFill = (1 - .2) / gain;
  const score = ((tempo / 3.4) * .5 + (1 / rm / 5) * .5), stars = Math.max(1, Math.min(10, Math.round(1 + 9 * score)));
  return { stars, tempo, gain, loss, tFill, rm, wild, easy };
};

/* ----- Quests ----- */
W.parts = q => q.parts || [{ n: q.n, f: q.f || {}, txt: q.desc }];
W.quest = id => QUESTS[id];
W.questsAfter = id => Object.keys(QUESTS).filter(k => QUESTS[k].after === id);
W.chain = id => { const out = []; let q = QUESTS[id], guard = 0; while (q && q.after && guard++ < 40) { out.unshift(q.after); q = QUESTS[q.after]; } return out; };
W.specMatch = (f, sp) => { f = f || {}; if (f.sp && sp.id !== f.sp) return false; if (f.r !== undefined && sp.r < f.r) return false; if (f.a && sp.a !== f.a) return false; return true; };
W.partKind = p => p.k || "catch";
/* Quests, die diesen Tonling brauchen: direkt (Art genannt) oder allgemein (Filter passt) */
W.questsFor = sp => { const out = []; for (const id in QUESTS) { const q = QUESTS[id]; if (q.rel && q.rel > RELEASE.areas) continue; let direct = false, general = false;
  W.parts(q).forEach(p => { const k = W.partKind(p); if (k !== "catch" && k !== "give") return; const f = p.f || {}; if (f.sp === sp.id) direct = true; else if (!f.sp && W.specMatch(f, sp) && (f.a || f.r !== undefined || f.mut)) general = true; });
  if (direct || general) out.push({ id, direct }); } return out; };

/* Wo und womit klappt eine Fang-Aufgabe am besten? Gibt Zeilen nach perfekter Chance sortiert zurück. */
W.solve = (f, o = {}) => {
  f = f || {}; const L0 = o.instr ? W.luckOf(o.instr, o) : (o.luck != null ? o.luck : .3), md = f.mut && o.instr ? W.mutDist(o.instr, { ench: o.ench, night: false }) : null;
  const rows = [];
  for (const zone of W.allZones()) { const area = ZINFO[zone].a; if (area > RELEASE.areas) continue; if (f.a && f.a !== area) continue;
    for (const night of [false, true]) { if (f.night && !night) continue; if (f.day && night) continue;
      const mdN = f.mut && o.instr ? W.mutDist(o.instr, { ench: o.ench, night }) : null, mp = f.mut ? (mdN ? W.mutP(f.mut, mdN) : 1) : 1;
      const fn = W.final(zone, night, L0, false), fp = W.final(zone, night, L0, true); let pn = 0, pp = 0; const via = [];
      for (const id in fn) { const sp = SP[id]; if (!W.specMatch(f, sp)) continue; pn += fn[id]; pp += fp[id] || 0; via.push(id); }
      if (pn <= 0) continue; rows.push({ zone, night, pn: pn * mp, pp: pp * mp, via, mut: mp });
    } }
  rows.sort((a, b) => b.pp - a.pp); return rows;
};
/* Tag und Nacht derselben Zone zusammenfassen: beste Zeile pro Zone */
W.solveZones = (f, o) => { const rows = W.solve(f, o), seen = {}, out = []; rows.forEach(r => { const k = r.zone; if (seen[k]) { if (!f.night && !f.day && r.night !== seen[k].night && Math.abs(r.pp - seen[k].pp) > 1e-4) seen[k].alt = r; return; } seen[k] = r; out.push(r); }); return out; };

/* ----- Instrument-Herkunft ----- */
W.instrSource = id => {
  const src = { shops: [], quests: [], start: id === "holz" };
  for (const sid in SHOPS) SHOPS[sid].items.forEach(it => { if (it.id === id) { const npc = Object.keys(NPCS).find(n => NPCS[n].shop === sid); src.shops.push({ shop: sid, name: SHOPS[sid].name, price: it.price, lvl: it.lvl, npc }); } });
  for (const qid in QUESTS) { const q = QUESTS[qid]; if (q.rew && q.rew.instr === id) src.quests.push(qid); }
  return src;
};
W.instrBy = id => { const i = INSTR[id]; return i.pas ? (PAS_TXT[i.pas] || "") : ""; };

/* ----- Orte ----- */
W.zoneNpcs = zone => Object.keys(NPCS).filter(id => { const n = NPCS[id]; if ((n.l || "main") !== "main") return false; return ZN[n.y] && ZN[n.y][n.x] === zone; });
W.zoneCentroid = zone => { let sx = 0, sy = 0, n = 0; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (ZN[y][x] === zone && (T[y][x] === 1 || T[y][x] === 2)) { sx += x; sy += y; n++; } return n ? [sx / n, sy / n, n] : null; };
W.zoneTiles = zone => { let n = 0; for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (ZN[y][x] === zone && (T[y][x] === 1 || T[y][x] === 2)) n++; return n; };

/* ----- Zahlenformate ----- */
const nfmt = n => Math.round(n).toLocaleString("de-DE");
const fmtD = (n, d = 1) => n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtP = p => { const v = p * 100; if (v >= 10) return fmtD(v, 1) + " %"; if (v >= 1) return fmtD(v, 2) + " %"; if (v > 0) return fmtD(v, v >= .1 ? 2 : 3) + " %"; return "0 %"; };
const fmtC = p => p > 0 ? (p >= .5 ? "~" + fmtD(1 / p, 1) : "~" + nfmt(1 / p)) : "–";   // erwartete Würfe
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ADJ = id => (typeof mutOf === "function" && mutOf(id)) ? mutOf(id).adj : id;
