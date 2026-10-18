/* ===== MEHRSPIELER: andere Spieler sehen (WebSocket zu einem Durable Object) ===== */
const MP = { ws: null, id: null, others: new Map(), tries: 0, on: false, sendT: 0, lastSent: "", beat: 0, timer: 0 };
function mpUrl() {
  try {
    const q = new URLSearchParams(location.search).get("server");
    if (q) localStorage.setItem("tonlinge-server", q === "off" ? "" : q);
    const s = localStorage.getItem("tonlinge-server"); if (s) return s;
    if (s === "") return null;
  } catch (e) {}
  if (window.TONLINGE_SERVER) return window.TONLINGE_SERVER;
  if (/^https?:$/.test(location.protocol)) return (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws";
  return null;
}
const mpName = () => { if (!S.name) { S.name = "Wanderer " + (100 + Math.floor(Math.random() * 900)); save(); } return S.name; };
const SHIRTS = ["#d8697a", "#6fa88a", "#7c8fd0", "#c9a14a", "#b9a6e0", "#e39a3b", "#7ec6c0", "#d09a6a"], HATS = ["#6b2a3a", "#2f5e4a", "#2e3b7a", "#6b5320", "#5a4a8a", "#9a3f2c", "#2f6e69", "#5e3b1c"];
function mpLook(id) { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0; h = Math.abs(h); return { col: SHIRTS[h % 8], hat: HATS[(h >> 3) % 8] }; }
function mpCount() { const el = $("mpCount"); if (!el) return; el.hidden = !MP.on; el.textContent = "● " + (MP.others.size + 1); el.title = MP.on ? (MP.others.size + 1) + " Spieler online" : ""; }
function mpAdd(p) { if (!p || !p.id || p.id === MP.id) return; const o = MP.others.get(p.id); if (o) { o.tx = p.x; o.ty = p.y; o.f = p.f || 1; o.m = !!p.m; o.h = p.h || ""; o.c = p.c || ""; o.n = p.n || o.n; if (p.l !== undefined) o.l = p.l; o.seen = performance.now(); } else { MP.others.set(p.id, Object.assign({ id: p.id, x: p.x, y: p.y, tx: p.x, ty: p.y, f: p.f || 1, m: !!p.m, h: p.h || "", c: p.c || "", l: p.l || "", n: p.n || "Wanderer", seen: performance.now() }, mpLook(p.id))); if (MP.on) toast((p.n || "Jemand") + " ist jetzt hier."); } mpCount(); }
function mpConnect() {
  const url = mpUrl(); if (!url || MP.ws) return; let ws;
  try { ws = new WebSocket(url); } catch (e) { return; }
  MP.ws = ws; let opened = false;
  ws.onopen = () => { opened = true; MP.tries = 0; MP.lastSent = ""; };
  ws.onmessage = ev => { let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
    if (m.t === "hi") { MP.id = m.id; MP.on = true; MP.others.clear(); (m.players || []).forEach(p => { const o = { id: p.id, x: p.x, y: p.y, tx: p.x, ty: p.y, f: p.f || 1, m: !!p.m, h: p.h || "", c: p.c || "", l: p.l || "", n: p.n || "Wanderer", seen: performance.now() }; MP.others.set(p.id, Object.assign(o, mpLook(p.id))); }); mpCount(); toast(MP.others.size ? "Online: " + (MP.others.size + 1) + " Spieler im Klanghain." : "Online. Gerade bist du allein hier."); }
    else if (m.t === "p") mpAdd(m); else if (m.t === "l") { MP.others.delete(m.id); mpCount(); }
    else if (m.t === "full") { toast("Der Server ist voll. Du spielst allein weiter.", true); MP.tries = 99; } };
  ws.onclose = () => { MP.ws = null; MP.on = false; MP.others.clear(); mpCount(); if (MP.tries >= 99) return; if (opened) setTimeout(mpConnect, 2000); else { MP.tries++; if (MP.tries < 3) setTimeout(mpConnect, 2500 * MP.tries); } };
  ws.onerror = () => {};
}
/* Was fange ich gerade? "Phase|Tonling|Mutation" für die anderen Spieler */
function mpCatchStr() {
  if (!C.ph) return ""; const sp = C.sp || null;
  if (C.ph === "ring" || C.ph === "ringres") return "ring";
  if (C.ph === "freq" && sp) return "freq|" + sp.id; if (C.ph === "bal" && sp) return "bal|" + sp.id + "|" + (C.mut || "");
  if (C.ph === "result" && C.result) return "win|" + C.result.sp + "|" + (C.result.mut || ""); if (C.ph === "flee" && sp) return "lost|" + sp.id;
  return "";
}
function mpTick(dt) {
  for (const [id, o] of MP.others) { const k = 1 - Math.exp(-dt * 10); o.x += (o.tx - o.x) * k; o.y += (o.ty - o.y) * k; o.m = Math.hypot(o.tx - o.x, o.ty - o.y) > 2; if (o.tx > o.x + 1) o.f = 1; else if (o.tx < o.x - 1) o.f = -1; if (performance.now() - o.seen > 15000) { MP.others.delete(id); mpCount(); } }
  if (!MP.on || !MP.ws || MP.ws.readyState !== 1) return; MP.sendT += dt; MP.beat += dt;
  if (MP.sendT < 0.1) return; MP.sendT = 0;
  const msg = JSON.stringify({ t: "p", x: Math.round(G.px), y: Math.round(G.py), f: G.face, m: G.moving ? 1 : 0, h: G.hd || "", c: mpCatchStr(), n: mpName(), l: cusCode(S.look) });
  if (msg !== MP.lastSent || MP.beat > 2) { MP.lastSent = msg; MP.beat = 0; try { MP.ws.send(msg); } catch (e) {} }
}
function mpBubble(c, o, t) {
  if (!o.c) return; const q = o.c.split("|"), sp = SP[q[1]], ph = q[0], mu = q[2] && typeof mutOf === "function" ? mutOf(q[2]) : null;
  let txt = ph === "ring" ? "spielt …" : !sp ? "" : ph === "win" ? "hat " + sp.n + " gefangen!" : ph === "lost" ? sp.n + " entwischt" : "fängt " + sp.n;
  if (!txt) return; c.save(); c.font = "15px 'Patrick Hand',cursive"; const tw = c.measureText(txt).width, ic = sp ? 30 : 0, w = tw + ic + 18, h = 30, x = o.x - w / 2, y = o.y - 90 - (ph === "win" ? Math.abs(Math.sin(t * 8)) * 3 : 0);
  c.lineJoin = "round"; c.lineWidth = 2.2; c.strokeStyle = sp && ph !== "ring" ? RAR[sp.r].col : INK; c.fillStyle = "rgba(250,244,226,.96)"; c.beginPath(); c.moveTo(x + 8, y); c.lineTo(x + w - 8, y); c.quadraticCurveTo(x + w, y, x + w, y + 8); c.lineTo(x + w, y + h - 8); c.quadraticCurveTo(x + w, y + h, x + w - 8, y + h); c.lineTo(o.x + 6, y + h); c.lineTo(o.x, y + h + 7); c.lineTo(o.x - 6, y + h); c.lineTo(x + 8, y + h); c.quadraticCurveTo(x, y + h, x, y + h - 8); c.lineTo(x, y + 8); c.quadraticCurveTo(x, y, x + 8, y); c.closePath(); c.fill(); c.stroke();
  if (sp) drawTonling(c, sp, x + 17, y + h / 2 + 3, 22, t, mu ? mu.id : null);
  c.fillStyle = INK; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText(txt, x + 9 + ic, y + h / 2 + 1); c.restore();
}
function drawOthers(c, items, t, ox, oy, vw, vh) {
  MP.others.forEach(o => { if (o.x < ox - 60 || o.x > ox + vw + 60 || o.y < oy - 80 || o.y > oy + vh + 80) return;
    items.push({ y: o.y + 6, f: () => { { const cl = cusDecode(o.l); const lk = cl ? cusLook(cl) : null; drawPerson(c, o.x, o.y + 6, lk ? lk.col : o.col, lk ? lk.hat : o.hat, { moving: o.m, face: o.f, look: lk ? lk.look : undefined }, t); }; drawHeld(c, o.x, o.y + 6, o.f, o.h, t, o.m);
      c.save(); c.font = "16px 'Patrick Hand',cursive"; c.textAlign = "center"; c.lineJoin = "round"; c.lineWidth = 4; c.strokeStyle = "rgba(250,244,226,.95)"; c.strokeText(o.n, o.x, o.y - 38); c.fillStyle = INK; c.fillText(o.n, o.x, o.y - 38); c.restore(); } });
    const q = o.c ? o.c.split("|") : [], ph = q[0];
    if (ph === "bal" || ph === "win") { for (const L of [0, 1]) items.push({ y: o.y + 5 + L * 2, f: () => playNotes(c, o.x, o.y, o.f, t, L) });
      const sp = SP[q[1]], mu = q[2] && typeof mutOf === "function" ? mutOf(q[2]) : null;
      if (sp) items.push({ y: o.y + 8, f: () => { const tsz = 22, tx = o.x + o.f * 38, ty = o.y - 4, a = ph === "win" ? 1 : .75, p = t * 7.2 + o.x * .01, sq = Math.cos(p) * .13 * a, hop = Math.pow(Math.abs(Math.sin(p / 2)), .8) * tsz * .22 * a, tilt = Math.sin(p / 2) * .16 * a, py0 = ty + tsz * .48;
        c.save(); c.translate(tx, py0 - hop); c.rotate(tilt); c.scale(1 + sq * .9, 1 - sq * 1.1); c.translate(-tx, -py0); drawTonling(c, sp, tx, ty, tsz, t, mu ? mu.id : null); c.restore(); } }); }
  });
}
mpConnect();
