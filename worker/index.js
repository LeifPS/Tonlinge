// Mehrspieler für Tonlinge: ein Worker, der die Seite ausliefert (public/) und
// unter /ws WebSockets an ein Durable Object ("Klanghain") weiterreicht.
import { DurableObject } from "cloudflare:workers";

const MAX_PLAYERS = 40;
const MAX_MSG = 400;      // Bytes pro Nachricht
const MIN_GAP_MS = 45;    // höchstens ~20 Positionen pro Sekunde je Spieler
const WORLD_W = 160 * 32, WORLD_H = 116 * 32;

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
    const players = sockets.map(w => w.deserializeAttachment()).filter(a => a && a.joined).map(({ id, x, y, f, m, h, c, l, n }) => ({ id, x, y, f, m, h, c, l, n }));
    server.send(JSON.stringify({ t: "hi", id, players }));
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(ws, message) {
    if (typeof message !== "string" || message.length > MAX_MSG) return;
    let m; try { m = JSON.parse(message); } catch { return; }
    if (!m || m.t !== "p") return;
    const a = ws.deserializeAttachment(); if (!a) return;
    const now = Date.now(); if (now - a.last < MIN_GAP_MS) return;
    const first = !a.joined;
    Object.assign(a, { joined: true, last: now, x: num(m.x, 0, WORLD_W), y: num(m.y, 0, WORLD_H), f: m.f < 0 ? -1 : 1, m: m.m ? 1 : 0, h: clean(m.h, 40), c: clean(m.c, 40), l: clean(m.l, 16), n: clean(m.n, 14) || "Wanderer" });
    ws.serializeAttachment(a);
    const out = JSON.stringify({ t: "p", id: a.id, x: a.x, y: a.y, f: a.f, m: a.m, h: a.h, c: a.c, l: a.l, n: a.n });
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
    return env.ASSETS.fetch(request);
  },
};
