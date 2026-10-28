// Mehrspieler für Tonlinge: ein Worker, der die Seite ausliefert (public/) und
// unter /ws WebSockets an ein Durable Object ("Klanghain") weiterreicht.
import { DurableObject } from "cloudflare:workers";
import { WX, wxSlot, wxOf, wxRare } from "./wx_core.mjs";

const MAX_PLAYERS = 40;
const MAX_MSG = 400;      // Bytes pro Nachricht
const MIN_GAP_MS = 45;    // höchstens ~20 Positionen pro Sekunde je Spieler
const WORLD_W = 160 * 32, WORLD_H = 116 * 32;
const WORLD_EPOCH = 1792281600;   // Weltzeit in Sekunden = Date.now()/1000 - EPOCH + tadj (wie im Spiel)
const TOTEM_COOLDOWN_MS = 45000;  // zwischen zwei Totems im ganzen Spiel mindestens so lange

const num = (v, lo, hi) => Math.min(hi, Math.max(lo, Number.isFinite(+v) ? Math.round(+v) : lo));
const clean = (s, n) => String(s ?? "").replace(/[<>&"\\]/g, "").trim().slice(0, n);

export class World extends DurableObject {
  async fetch(request) {
    const sockets = this.ctx.getWebSockets();
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    if (sockets.length >= MAX_PLAYERS) { server.send(JSON.stringify({ t: "full" })); server.close(1013, "voll"); return new Response(null, { status: 101, webSocket: client }); }
    const id = crypto.randomUUID().slice(0, 8);
    server.serializeAttachment({ id, joined: false, x: 0, y: 0, f: 1, m: 0, h: "", c: "", n: "", last: 0 });
    const st = await this.#state();
    const players = sockets.map(w => w.deserializeAttachment()).filter(a => a && a.joined).map(({ id, x, y, f, m, h, c, l, n, lv, ti, ly }) => ({ id, x, y, f, m, h, c, l, n, lv, ti, ly }));
    server.send(JSON.stringify({ t: "hi", id, players, wx: st.ovr, tadj: st.tadj }));
    return new Response(null, { status: 101, webSocket: client });
  }

  /* Gemeinsamer Zustand: Totem-Wetter und Zeitverschiebung durch Sonnentotems */
  async #state() {
    if (!this.st) { const v = await this.ctx.storage.get("st"); this.st = v && typeof v === "object" ? v : { ovr: null, tadj: 0, last: 0 }; }
    const now = Date.now() / 1000 - WORLD_EPOCH + this.st.tadj, k = wxSlot(now).k;
    if (this.st.ovr && this.st.ovr.k !== k) { this.st.ovr = null; }   // Überschreibung gilt nur für ihren Abschnitt
    return this.st;
  }

  /* Totem benutzen: gleiche Berechnung wie im Spiel. Der Server glaubt dem Spieler das Totem, begrenzt aber Häufigkeit und seltene Wetter. */
  async #totem(ws, m) {
    const a = ws.deserializeAttachment(); const st = await this.#state(); const id = String(m.id || "");
    const no = why => { try { ws.send(JSON.stringify({ t: "totno", why })); } catch {} };
    if (id !== "sun" && !WX[id]) return no("id");
    if (Date.now() - st.last < TOTEM_COOLDOWN_MS) return no("cool");
    const now = Date.now() / 1000 - WORLD_EPOCH + st.tadj, sl = wxSlot(now), nat = wxOf(sl.k, sl.night), cur = st.ovr ? st.ovr.id : nat;
    if (wxRare(nat) || wxRare(cur)) return no("rare");
    let out;
    if (id === "sun") { st.tadj += sl.end - now + 0.05; st.ovr = null; out = { kind: "sun", to: sl.night ? "day" : "night" }; }
    else { if (id === cur) return no("same"); st.ovr = { k: sl.k, id }; out = { kind: "weather" }; }
    st.last = Date.now(); await this.ctx.storage.put("st", st);
    const msg = JSON.stringify({ t: "wx", ovr: st.ovr, tadj: st.tadj, id, who: a ? a.n : "", by: a ? a.id : "", ...out });
    for (const other of this.ctx.getWebSockets()) { try { other.send(msg); } catch {} }
  }

  async webSocketMessage(ws, message) {
    if (typeof message !== "string" || message.length > MAX_MSG) return;
    let m; try { m = JSON.parse(message); } catch { return; }
    if (m && m.t === "tot") { await this.#totem(ws, m); return; }
    if (!m || m.t !== "p") return;
    const a = ws.deserializeAttachment(); if (!a) return;
    const now = Date.now(); if (now - a.last < MIN_GAP_MS) return;
    const first = !a.joined;
    Object.assign(a, { joined: true, last: now, x: num(m.x, 0, WORLD_W), y: num(m.y, 0, WORLD_H), f: m.f < 0 ? -1 : 1, m: m.m ? 1 : 0, h: clean(m.h, 40), c: clean(m.c, 40), l: clean(m.l, 16), n: clean(m.n, 14) || "Wanderer", lv: Math.round(num(m.lv, 1, 999)), ti: clean(m.ti, 16), ly: clean(m.ly, 10) });
    ws.serializeAttachment(a);
    const out = JSON.stringify({ t: "p", id: a.id, x: a.x, y: a.y, f: a.f, m: a.m, h: a.h, c: a.c, l: a.l, n: a.n, lv: a.lv, ti: a.ti, ly: a.ly });
    for (const other of this.ctx.getWebSockets()) if (other !== ws) { try { other.send(out); } catch {} }
  }

  webSocketClose(ws) { this.#leave(ws); }
  webSocketError(ws) { this.#leave(ws); }

  #leave(ws) {
    const a = ws.deserializeAttachment(); if (!a || !a.joined) return;
    const out = JSON.stringify({ t: "l", id: a.id });
    for (const other of this.ctx.getWebSockets()) if (other !== ws) { try { other.send(out); } catch {} }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") return new Response("WebSocket erwartet", { status: 426 });
      return env.WORLD.get(env.WORLD.idFromName("klanghain")).fetch(request);
    }
    if (url.pathname === "/wiki") { url.pathname = "/wiki/"; return env.ASSETS.fetch(new Request(url, request)); }   // das Wiki liegt unter /wiki
    if (url.pathname === "/editor") { url.pathname = "/editor/"; return env.ASSETS.fetch(new Request(url, request)); }   // der Zeichen-Editor liegt unter /editor
    return env.ASSETS.fetch(request);
  },
};
