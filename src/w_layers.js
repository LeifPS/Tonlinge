/* ===== Etagen: jede Etage ist eine eigene Karte (gleich groß wie die Welt); man sieht immer nur die aktuelle ===== */
let LAYER = "main";
const LAYERS = { main: { id: "main", name: "Welt", area: 1, T: null, ZN: null, AM: null, links: {} } };
LAYERS.main.T = T; LAYERS.main.ZN = ZN; LAYERS.main.AM = window.AM;
function newLayer(id, name, area, bounds) {
  const L = { id, name, area, bounds, T: Array.from({ length: WH }, () => Array(WW).fill(0)), ZN: Array.from({ length: WH }, () => Array(WW).fill(null)), AM: new Uint8Array(WW * WH).fill(area), links: {} };
  LAYERS[id] = L; return L;
}
/* Verbindung (Treppe oder Spiegeltor) zwischen zwei Etagen. a und b: [Etage, Kachel-x, Kachel-y, Ankunft-x, Ankunft-y] */
function linkLayers(a, b, kind, opt) {
  opt = opt || {};
  const mk = (p, q, dir) => { LAYERS[p[0]].links[p[1] + "," + p[2]] = { to: q[0], x: q[3], y: q[4], kind, dir, flag: opt.flag, txt: opt.txt }; };
  mk(a, b, opt.dirA || "up"); mk(b, a, opt.dirB || "down");
}
function setLayer(id) {
  if (id === LAYER || !LAYERS[id]) return;
  const cur = LAYERS[LAYER]; cur.T = T; cur.ZN = ZN; cur.AM = window.AM;
  if (typeof syncSeen === "function" && typeof SEEN !== "undefined" && SEEN) { try { syncSeen(); } catch (e) {} }
  LAYER = id; const L = LAYERS[id]; T = L.T; ZN = L.ZN; window.AM = L.AM;
  if (typeof SEEN !== "undefined") SEEN = null; // Nebel der neuen Etage laden
  render.ra = null; try { curZone = null; } catch (e) {}
  S.layer = id;
}
const LT = { on: false, t: 0, lk: null, swapped: false, cool: 0 };
let lfadeEl = null;
function layerFade(a) { if (!lfadeEl) { lfadeEl = document.createElement("div"); lfadeEl.style.cssText = "position:fixed;inset:0;background:#05060f;opacity:0;pointer-events:none;z-index:40"; document.body.appendChild(lfadeEl); } lfadeEl.style.opacity = a; }
function layerTick(dt) {
  if (LT.cool > 0) LT.cool -= dt;
  if (!LT.on) {
    if (C.ph || uiOpen() || G.free || LT.cool > 0) return;
    const lk = LAYERS[LAYER].links[Math.floor(G.px / TS) + "," + Math.floor(G.py / TS)]; if (!lk) return;
    if (lk.flag && !S.flags[lk.flag]) { if (!lk.said) { lk.said = 1; toast(lk.txt || "Der Weg ist versperrt.", false, 4200); setTimeout(() => { lk.said = 0; }, 6000); } return; }
    if (LAYERS[lk.to].area > RELEASE.areas) { toast("Dahinter liegt noch Nebel.", false, 3000); LT.cool = 2; return; }
    LT.on = true; LT.t = 0; LT.lk = lk; LT.swapped = false; G.moving = false; Snd.play("quest", lk.kind === "portal" ? .6 : 1.4, .5); return;
  }
  LT.t += dt; const lk = LT.lk;
  layerFade(Math.min(1, LT.t / .35));
  if (!LT.swapped && LT.t >= .4) { LT.swapped = true; setLayer(lk.to); G.px = lk.x * TS + TS / 2; G.py = lk.y * TS + TS / 2; G.moving = false; try { CAM && (CAM.ox = 0); } catch (e) {} checkZone(); try { save(); } catch (e) {} }
  if (LT.swapped) layerFade(Math.max(0, 1 - (LT.t - .4) / .4));
  if (LT.t >= .8) { LT.on = false; LT.cool = .6; layerFade(0); }
}
