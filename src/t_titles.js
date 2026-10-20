/* ===== Titel und Namensschild: Titel (mit Farbverlauf) und Level über dem Kopf ===== */
const maxAreaNow = () => Math.max(S.maxArea || 1, S.flags.gate3Done ? 3 : 1, S.flags.gate4Done ? 4 : 1, S.flags.sanktumSeen ? 5 : 1, curArea || 1);
const idxDone = a => { const l = SPECIES.filter(s => s.a === a); return l.length > 0 && l.every(s => S.dex[s.id] && S.dex[s.id].c > 0); };
/* tier 1–5: je besser, desto mehr Farben; ab 4 glitzert der Verlauf, ab 3 leuchtet er */
const TITLES = [
  { id: "i1", name: "Hainkenner",        tier: 1, g: ["#9be07a", "#4a9a4a"],                                        d: "Index der Klanghain komplett", ok: () => idxDone(1) },
  { id: "a2", name: "Höhlengänger",      tier: 1, g: ["#c6b0f0", "#7a5fc0"],                                        d: "Die Glimmerhöhlen erreicht", ok: () => maxAreaNow() >= 2 },
  { id: "i2", name: "Höhlenkundiger",    tier: 2, g: ["#d9b8ff", "#9a62e0", "#5a3aa8"],                             d: "Index der Glimmerhöhlen komplett", ok: () => idxDone(2) },
  { id: "a3", name: "Sternensteiger",    tier: 2, g: ["#7fb4ff", "#a47bff", "#e6a8ff"],                             d: "Die Sternenhöhe erreicht", ok: () => maxAreaNow() >= 3 },
  { id: "a4", name: "Meerfahrer",        tier: 3, g: ["#46e0d0", "#3a9bf0", "#6a5cff"],                             d: "Das Rauschmeer erreicht", ok: () => maxAreaNow() >= 4 },
  { id: "i3", name: "Sternenkenner",     tier: 3, g: ["#ffe27a", "#ff9ad0", "#7fb4ff", "#a47bff"],                  d: "Index der Sternenhöhe komplett, mit Glorreichem", ok: () => idxDone(3) },
  { id: "a5", name: "Magierschüler",  tier: 4, g: ["#9fb6ff", "#c79bff", "#ff9ee0", "#7dffd8"],                  d: "Das Sanktum Magus betreten", ok: () => maxAreaNow() >= 5 && RELEASE.areas >= 5 },
  { id: "i5", name: "Erzmagus",          tier: 6, g: ["#2fe0d0", "#9fb6ff", "#c79bff", "#ff6ec7", "#2fe0d0"],      d: "Index des Sanktums komplett, mit allen Erhabenen", ok: () => RELEASE.areas >= 5 && idxDone(5) },
  { id: "ger", name: "Urhörer",           tier: 7, g: ["#2fe0d0", "#ffffff", "#ff6ec7", "#ffe27a", "#2fe0d0"],      d: "Einen Erhabenen gefangen", ok: () => RELEASE.areas >= 5 && SPECIES.some(s => s.r === 6 && S.dex[s.id] && S.dex[s.id].c > 0) },
  { id: "egit", name: "Rockstar",        tier: 4, g: ["#fff25a", "#ff9a2a", "#ff3a6a", "#c43aff"],                  d: "Idas E-Gitarre bekommen", ok: () => S.instr.includes("egitarre") },
  { id: "i4", name: "Herr der Gezeiten", tier: 5, g: ["#ff6b8a", "#ffd35a", "#5affb0", "#4ab8ff", "#b07aff"],       d: "Index des Rauschmeers komplett, mit Glorreichem", ok: () => idxDone(4) },
  { id: "gk", name: "Sturmkönig",        tier: 6, g: ["#fff6a0", "#ff5a5a", "#e0103c", "#ffb04a", "#fff6a0"],       d: "Den Karminstern gefangen", ok: () => !!(S.dex.karminstern && S.dex.karminstern.c > 0) },
  { id: "gs", name: "Seelenhirte",       tier: 6, g: ["#ffe0ea", "#ff7aa0", "#b06aff", "#6ad4ff", "#ffe0ea"],       d: "Das Seelenmeer gefangen", ok: () => !!(S.dex.seelenmeer && S.dex.seelenmeer.c > 0) },
  { id: "gg", name: "Glorreiche Legende", tier: 7, g: ["#ff3a4a", "#ffd84a", "#fffbe0", "#ff7ad0", "#6ad4ff", "#ffd84a", "#ff3a4a"], d: "Beide Glorreiche gefangen: Karminstern und Seelenmeer", ok: () => !!(S.dex.karminstern && S.dex.karminstern.c > 0 && S.dex.seelenmeer && S.dex.seelenmeer.c > 0) }
];
const TITLE = Object.fromEntries(TITLES.map(t => [t.id, t]));
let titleT = 0;
function titleTick(dt) {
  if (!S.flags.created) return; titleT -= dt; if (titleT > 0) return; titleT = 2;
  const ma = maxAreaNow(); if (ma > (S.maxArea || 1)) { S.maxArea = ma; save(); }
  const have = TITLES.filter(t => t.ok()).map(t => t.id);
  if (!S.tseen) { S.tseen = have.slice(); save(); if (have.length) toast("Du hast " + have.length + " Titel. Rüste sie im Inventar aus.", false, 5500); return; }
  const nw = have.filter(id => !S.tseen.includes(id)); if (!nw.length) return;
  S.tseen = S.tseen.concat(nw); save(); nw.forEach(id => toast("Neuer Titel: " + TITLE[id].name + " (im Inventar ausrüsten)", false, 6000));
}
function titleFill(c, ti, x, y, w, t) {
  const n = ti.g.length; if (ti.tier >= 4) { const sh = (t * (ti.tier >= 6 ? 110 : ti.tier >= 5 ? 70 : 45)) % w, cols = ti.g.concat(ti.g[0]), gr = c.createLinearGradient(x - w / 2 - sh, 0, x - w / 2 - sh + 2 * w, 0); const m = cols.length - 1; for (let r = 0; r < 2; r++) cols.forEach((col, i) => gr.addColorStop(Math.min(1, (r * m + i) / (2 * m)), col)); return gr; }
  const gr = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); ti.g.forEach((col, i) => gr.addColorStop(n > 1 ? i / (n - 1) : 0, col)); return gr;
}
/* Namensschild: oben der Titel mit Verlauf, darunter "Name · Lv 12". y ist die Grundlinie der Namenszeile. */
function drawNameTag(c, x, y, name, lvl, titleId, t) {
  const ti = TITLE[titleId]; c.save(); c.textAlign = "center"; c.lineJoin = "round";
  const line = (name || "") + (lvl ? "  ·  Lv " + lvl : "");
  c.font = "17px 'Patrick Hand',cursive"; c.lineWidth = 5; c.strokeStyle = "rgba(250,244,226,.97)"; c.strokeText(line, x, y); c.fillStyle = INK; c.fillText(line, x, y);
  if (ti) { const fs = 10 + ti.tier * 1.1; c.font = fs + "px 'Caveat Brush',cursive"; const w = Math.max(40, c.measureText(ti.name).width), ty = y - 19;
    c.lineWidth = 4.5; c.strokeStyle = "rgba(29,39,66,.92)"; c.strokeText(ti.name, x, ty);
    if (ti.tier >= 3) { c.shadowColor = ti.g[Math.floor((t * 1.5) % ti.g.length)]; c.shadowBlur = ti.tier >= 6 ? 13 : ti.tier >= 5 ? 8 : 5; }
    c.fillStyle = titleFill(c, ti, x, ty, w, t || 0); c.fillText(ti.name, x, ty); }
  c.restore();
}
const titleCss = ti => "background:linear-gradient(90deg," + ti.g.join(",") + ");-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-stroke:.6px rgba(29,39,66,.55);font-family:'Caveat Brush',cursive;font-size:" + (19 + ti.tier) + "px";
function titleHtml() {
  const b = (id, label, on, off, ti, desc) => `<button class="btn" data-ti="${id}" ${off ? "disabled" : ""} aria-pressed="${on}" style="min-height:34px;padding:2px 12px;${on ? "background:var(--marker);" : ""}${off ? "opacity:.45;" : ""}" title="${desc}"><span style="${ti ? titleCss(ti) : ""}">${label}</span>${off ? `<small style="display:block;font-size:12px;color:var(--ink)">${desc}</small>` : ""}</button>`;
  return `<div style="margin-top:12px;border-top:2px dashed var(--ink);padding-top:8px"><b style="font-weight:400;font-size:21px">Titel</b> <span class="muted" style="font-size:16px">Andere sehen ihn über deinem Kopf.</span><div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:6px">${b("", "Kein Titel", !S.title, false, null, "Keinen Titel tragen")}${TITLES.filter(t => t.ok()).map(t => b(t.id, t.name, S.title === t.id, false, t, t.d)).join("")}</div></div>`;
}
function titleBind(render) { $("winBody").querySelectorAll("[data-ti]").forEach(b => b.onclick = () => { S.title = b.dataset.ti; save(); Snd.play("klick", 1, .4); render(); }); }
