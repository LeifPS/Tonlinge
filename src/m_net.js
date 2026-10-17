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
function mpAdd(p) { if (!p || !p.id || p.id === MP.id) return; const o = MP.others.get(p.id); if (o) { o.tx = p.x; o.ty = p.y; o.f = p.f || 1; o.m = !!p.m; o.h = p.h || ""; o.n = p.n || o.n; o.seen = performance.now(); } else { MP.others.set(p.id, Object.assign({ id: p.id, x: p.x, y: p.y, tx: p.x, ty: p.y, f: p.f || 1, m: !!p.m, h: p.h || "", n: p.n || "Wanderer", seen: performance.now() }, mpLook(p.id))); if (MP.on) toast((p.n || "Jemand") + " ist jetzt hier."); } mpCount(); }
function mpConnect() {
  const url = mpUrl(); if (!url || MP.ws) return; let ws;
  try { ws = new WebSocket(url); } catch (e) { return; }
  MP.ws = ws; let opened = false;
  ws.onopen = () => { opened = true; MP.tries = 0; MP.lastSent = ""; };
  ws.onmessage = ev => { let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
    if (m.t === "hi") { MP.id = m.id; MP.on = true; MP.others.clear(); (m.players || []).forEach(p => { const o = { id: p.id, x: p.x, y: p.y, tx: p.x, ty: p.y, f: p.f || 1, m: !!p.m, h: p.h || "", n: p.n || "Wanderer", seen: performance.now() }; MP.others.set(p.id, Object.assign(o, mpLook(p.id))); }); mpCount(); toast(MP.others.size ? "Online: " + (MP.others.size + 1) + " Spieler im Klanghain." : "Online. Gerade bist du allein hier."); }
    else if (m.t === "p") mpAdd(m); else if (m.t === "l") { MP.others.delete(m.id); mpCount(); }
    else if (m.t === "full") { toast("Der Server ist voll. Du spielst allein weiter.", true); MP.tries = 99; } };
  ws.onclose = () => { MP.ws = null; MP.on = false; MP.others.clear(); mpCount(); if (MP.tries >= 99) return; if (opened) setTimeout(mpConnect, 2000); else { MP.tries++; if (MP.tries < 3) setTimeout(mpConnect, 2500 * MP.tries); } };
  ws.onerror = () => {};
}
function mpTick(dt) {
  for (const [id, o] of MP.others) { const k = 1 - Math.exp(-dt * 10); o.x += (o.tx - o.x) * k; o.y += (o.ty - o.y) * k; o.m = Math.hypot(o.tx - o.x, o.ty - o.y) > 2; if (o.tx > o.x + 1) o.f = 1; else if (o.tx < o.x - 1) o.f = -1; if (performance.now() - o.seen > 15000) { MP.others.delete(id); mpCount(); } }
  if (!MP.on || !MP.ws || MP.ws.readyState !== 1) return; MP.sendT += dt; MP.beat += dt;
  if (MP.sendT < 0.1) return; MP.sendT = 0;
  const msg = JSON.stringify({ t: "p", x: Math.round(G.px), y: Math.round(G.py), f: G.face, m: G.moving ? 1 : 0, h: G.hd || "", n: mpName() });
  if (msg !== MP.lastSent || MP.beat > 2) { MP.lastSent = msg; MP.beat = 0; try { MP.ws.send(msg); } catch (e) {} }
}
function drawOthers(c, items, t, ox, oy, vw, vh) {
  MP.others.forEach(o => { if (o.x < ox - 60 || o.x > ox + vw + 60 || o.y < oy - 80 || o.y > oy + vh + 80) return;
    items.push({ y: o.y + 6, f: () => { drawPerson(c, o.x, o.y + 6, o.col, o.hat, { moving: o.m, face: o.f }, t); drawHeld(c, o.x, o.y + 6, o.f, o.h, t, o.m);
      c.save(); c.font = "16px 'Patrick Hand',cursive"; c.textAlign = "center"; c.lineJoin = "round"; c.lineWidth = 4; c.strokeStyle = "rgba(250,244,226,.95)"; c.strokeText(o.n, o.x, o.y - 38); c.fillStyle = INK; c.fillText(o.n, o.x, o.y - 38); c.restore(); } });
  });
}
mpConnect();
