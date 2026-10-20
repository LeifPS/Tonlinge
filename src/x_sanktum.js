/* ===== Sanktum-Erkundung: Pulte lesen, Rätselpaneele, Verlorene Seiten, Truhen, Fundstücke in Kammern ===== */
const skF = k => S.flags["sk_" + k];
const skO = k => (S.flags[k] = S.flags[k] || {});
function skFree(l, x, y, used) { const L = LAYERS[l]; for (let r = 0; r < 9; r++) for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { if (Math.max(Math.abs(i), Math.abs(j)) !== r) continue; const px = x + i, py = y + j, k = px + "," + py; if (!L.T[py] || (L.T[py][px] !== 1 && L.T[py][px] !== 2) || L.dk[k] || L.links[k] || used.has(l + k)) continue; used.add(l + k); return [px, py]; } return [x, y]; }
const SK_USED = new Set();
/* ---- Rätsel ---- */
const SKPZ = {
  rune: { l: "s1", x: 11, y: 39, solid: 1, t: "Das Runenschloss", room: "k1", sym: ["Schatten", "Licht", "Wasser", "Luft", "Feuer", "Erde"], ans: [0, 1, 2, 3],
    intro: "Im Pult liegt ein aufgeschlagenes Buch, dessen Seiten leer sind. Sechs Runen glimmen im Kreis. Vier davon müssen in der richtigen Reihenfolge berührt werden.",
    clue: "Die Reihenfolge steht auf den beiden Pulten im Obergeschoss, genau über dem Archiv.", win: "Die Seiten füllen sich mit Schrift, dann schlagen sie zu. Im Boden öffnet sich eine Nische." },
  uhr: { l: "t2b", x: 22, y: 24, t: "Die Uhr ohne Gang", room: "k2", sym: ["III", "VII", "IX", "XII", "VI"], ans: [1, 0, 3],
    intro: "Ein Zifferblatt ohne Zeiger, nur fünf Marken, die sich eindrücken lassen. Es erwartet drei Stunden in genau der Folge, in der der Erste Magus fiel.",
    clue: "Hinweise stehen auf den Pulten im unteren Uhrwerkturm.", win: "Hinter dem Zifferblatt rastet etwas ein. Ein Fach springt auf." },
  stern: { l: "t1c", x: 22, y: 25, t: "Das Sternenschloss", room: "k3", sym: ["Sol", "Luna", "Vega", "Nox", "Ara", "Cor"], ans: [1, 4, 0, 5, 3],
    intro: "Sechs Sterne in einer Glasplatte, fünf davon müssen aufleuchten, in der richtigen Reihenfolge.",
    clue: "Die Reihenfolge ist verteilt auf die Pulte in den beiden Etagen darunter.", win: "Die Sterne tragen sich in die Platte ein. Darunter öffnet sich eine Lade." },
  spiegel: { l: "s2", x: 30, y: 9, solid: 1, t: "Die Spiegelfolge", room: "k4", sym: ["Gold", "Silber", "Glas", "Blei"], ans: [1, 2, 0, 3],
    intro: "Ein Spiegel ohne Rahmen, vier Metalle als Knöpfe darunter. Er will sie in der Folge, in der er einst gegossen wurde.",
    clue: "Die vier Lesesäle des Erdgeschosses haben je ein Pult mit einem Vers.", win: "Der Spiegel wird klar, dann zeigt er einen anderen Raum. Eine Scherbe liegt nun im Rahmen." },
  thron: { l: "s2", x: 80, y: 7, t: "Das Siegel des Ersten Magus", room: "k5", sym: ["Runenstein", "Zahnrad", "Sternkarte", "Scherbe"], ans: [0, 1, 2, 3],
    gate: () => ["ko4", "ti3", "si3", "sp3"].every(q => qDone(q)), gateTxt: "Das Siegel bleibt stumm. Vier Dinge fehlen: ein Runenstein, ein Zahnrad, eine Sternkarte, eine Scherbe, zurückgebracht zu ihren Hütern.",
    intro: "Vier Mulden im Boden vor dem Thron. Die Dinge, die du gefunden hast, wollen in der Reihenfolge ihrer Entstehung eingelegt werden.",
    clue: "Die vier Pulte im Thronsaal flüstern die Reihenfolge.", win: "Der Thron sinkt. Dahinter liegt eine Gruft, ein Wind kommt heraus, der nach Papier riecht." }
};
/* ---- Hinweis-Pulte ---- */
const SKCL = {
  "s2:13,33": ["Vers I", "Am Anfang war kein Licht, nur Schatten.<br>Dann kam der Schein und teilte ihn."],
  "s2:14,33": ["Vers II", "Aus dem Schein floss, was uns trägt, das Wasser.<br>Zuletzt kam das, was unsere Worte trägt: die Luft."],
  "t2a:16,27": ["Zettel im Pult", "Sieben schlug es, als er fiel. Nicht früher."],
  "t2a:28,27": ["Zettel im Pult", "Danach schlug die Drei. Zuletzt die Zwölf, nach der nichts mehr schlägt."],
  "t1a:15,22": ["Sternenverse (1)", "Der Mond kommt zuerst, so milde wie nie.<br>Der Altar steht an zweiter Stelle."],
  "t1a:29,22": ["Sternenverse (2)", "Die Sonne darf nicht fehlen, aber sie ist die dritte."],
  "t1b:14,22": ["Sternenverse (3)", "Das Herz bleibt vor der Nacht, und hinter der Sonne."],
  "t1b:30,22": ["Sternenverse (4)", "Die Nacht schließt immer. Sie ist die letzte."],
  "s1:66,35": ["Gussprotokoll (I)", "Das Silber wurde zuerst gegossen. Es hielt, was es spiegelte."],
  "s1:94,35": ["Gussprotokoll (II)", "Das Glas folgte. Es brach nicht, denn es war nie flüssig."],
  "s1:66,46": ["Gussprotokoll (III)", "Das Gold kam dritte. Es war ein Irrtum, aber ein schöner."],
  "s1:94,46": ["Gussprotokoll (IV)", "Zuletzt das Blei. Es erinnert alle anderen daran, was sie wiegen."],
  "s2:66,7": ["Thronsaal, Pult I", "Zuerst der Stein, der die Namen trug."],
  "s2:94,7": ["Thronsaal, Pult II", "Dann das Rad der Zeit. Es läuft nur einmal."],
  "s2:66,18": ["Thronsaal, Pult III", "Dann die Karte der Sterne, an der alle vorbeigehen."],
  "s2:94,18": ["Thronsaal, Pult IV", "Zuletzt die Scherbe, die uns zeigt, wer wir sind."]
};
const SKLORE = [
  ["Ein Brief", "Er schreibt, er könne den Raum nicht verlassen, solange jemand liest. Die letzte Zeile ist durchgestrichen."],
  ["Ordnung der Haushalte", "Die Etage der Lesesäle werde nachts verriegelt. Weshalb, stehe nicht dabei."],
  ["Ein Nachruf", "Er bat darum, nie vergessen zu werden. Das Haus hat ihn behalten. Das war nicht gemeint."],
  ["Notiz am Rand", "Wer fremde Pulte liest, wird selbst gelesen."],
  ["Bestandsliste", "Sieben Spiegel, vier Uhren, eine Treppe zu viel. Die Zählung bricht ab."],
  ["Warnung", "Das Haus zählt mit, wer hereinkommt. Nicht jeder, der hereinkommt, wird gezählt."],
  ["Gebet", "Es ist in einer Sprache geschrieben, die du lesen kannst, und hört trotzdem nicht auf."],
  ["Rezept", "Man nehme Nachtblumensamen, ein Flüstern, eine geborgte Stunde. Die Mengen fehlen."],
  ["Tagebuch", "Heute hat mir niemand geantwortet. Gestern auch nicht. Ich wiederhole das so lange, bis es stimmt."],
  ["Schulordnung", "Magierschüler tragen Grau. Wer Farbe trägt, wird nicht gesehen. Das ist keine Strafe."],
  ["Sternenbuch", "Die Karte endet, wo der Turm anfängt. Dahinter sei kein Himmel, sondern Spiegel."],
  ["Brief an einen Hüter", "Du darfst ihn niemals fragen, wie lange er schon wartet."]
];
const SKLEC = []; // alle Pulte
const SKCH = [], SKPG = [];
/* ---- Layout-Resolver (nach dem Aufbau der Ebenen) ---- */
(function () {
  for (const id in LAYERS) { const L = LAYERS[id]; for (const k in L.dk) { const [x, y] = k.split(",").map(Number); if (L.dk[k] === "lectern" && !(id === "s1" && x === 11 && y === 39)) SKLEC.push({ l: id, x, y, key: id + ":" + x + "," + y }); else if (L.dk[k] === "chest") SKCH.push({ l: id, x, y, key: id + ":" + x + "," + y }); } }
  for (const id in SKPZ) { const z = SKPZ[id]; if (!z.solid) { const p = skFree(z.l, z.x, z.y, SK_USED); z.x = p[0]; z.y = p[1]; } z.id = id; }
  for (const k in ITEMS) { const it = ITEMS[k]; if (it.tx == null) continue; const p = skFree(it.l, it.tx, it.ty, SK_USED); it.x = p[0]; it.y = p[1]; }
  const pg = [["s1", 24, 6], ["s1", 51, 6], ["s1", 8, 49], ["s1", 150, 12], ["s1", 128, 40], ["s2", 12, 36], ["s2", 26, 44], ["s2", 52, 5], ["s2", 44, 20], ["t1a", 20, 17], ["t2a", 22, 25], ["t3b", 22, 23]];
  pg.forEach((q, i) => { const p = skFree(q[0], q[1], q[2], SK_USED); SKPG.push({ l: q[0], x: p[0], y: p[1], i }); });
})();
const skPages = () => Object.keys(skO("skPg")).length;
const SK_PG_TXT = ["…der Erste Magus war nie ein Magus, sondern der Gast eines Magus…", "…sie bauten die Treppen, damit niemand merkt, wie hoch das Haus wirklich ist…", "…das Archiv wurde zugeschlossen, weil ein Buch darin zu lesen anfing…", "…die Uhr schlug sieben, und niemand ist je wieder aus dem Turm gekommen, der es hörte…", "…der Spiegelsaal zeigt nur, was wir getan haben, nie was wir tun werden…", "…die Gruft liegt hinter dem Thron, weil der Thron für den Letzten gebaut wurde…", "…vierzehn Hüter, zwei Türen, ein Name…", "…die Nachtblumen haben keine Wurzeln. Sie haben Erinnerungen…", "…Zelle acht ist leer. Sie war immer leer. Trotzdem wird sie bewacht…", "…die Sterne im Astralturm sind nicht Sterne, sondern Augen…", "…das Verbotene Buch ist nicht verboten, es ist nur zu ehrlich…", "…und am Ende bleibt, wer zuhört. Das bist du…"];
/* ---- Interaktion ---- */
function skDist(x, y, solid) { return Math.hypot(G.px - (x * TS + TS / 2), G.py - (y * TS + (solid ? TS / 2 : TS - 6))); }
function skNear() {
  if (typeof LAYER === "undefined" || LAYER === "main") return null; let best = null, bd = 9e9;
  const test = (o, r, solid, kind, ok) => { if (o.l !== LAYER || (ok && !ok())) return; const d = skDist(o.x, o.y, solid); if (d < r && d < bd) { bd = d; best = { k: kind, o }; } };
  for (const o of SKLEC) test(o, 52, 1, "lec");
  for (const id in SKPZ) { const z = SKPZ[id]; test(z, z.solid ? 56 : 46, z.solid, "puz", () => !skF(id) || true); }
  for (const o of SKPG) test(o, 40, 0, "pg", () => !skO("skPg")[o.i]);
  for (const o of SKCH) test(o, 52, 1, "ch", () => !skO("skCh")[o.key]);
  return best;
}
function skPrompt(s) { if (s.k === "lec") return "E: Pult lesen"; if (s.k === "puz") return skF(s.o.id) ? "E: " + s.o.t + " (gelöst)" : "E: " + s.o.t; if (s.k === "pg") return "E: Verlorene Seite aufheben"; return "E: Truhe öffnen"; }
function skUse(s) {
  if (s.k === "pg") { const m = skO("skPg"); m[s.o.i] = 1; Snd.play("sk_page", 1, .8); const n = skPages(); toast("Verlorene Seite " + n + "/12", false, 3200); openWin("Verlorene Seite " + n, "<p style='font-style:italic'>" + SK_PG_TXT[s.o.i] + "</p>"); skPgQuests(); save(); return; }
  if (s.k === "ch") { skO("skCh")[s.o.key] = 1; const g = 200000 + ((s.o.x * 7 + s.o.y * 13) % 5) * 150000; S.gold += g; Snd.play("sk_chest", 1, .8); toast("Truhe geöffnet: " + g.toLocaleString("de-DE") + " Noten", false, 4200); save(); return; }
  if (s.k === "lec") { const c = SKCL[s.o.key]; let t, tx; if (c) { t = c[0]; tx = c[1]; skO("skClue")[s.o.key] = 1; } else { const q = SKLORE[(s.o.x * 5 + s.o.y * 3 + s.o.l.length) % SKLORE.length]; t = q[0]; tx = q[1]; } const m = skO("skRead"); if (!m[s.o.key]) { m[s.o.key] = 1; const n = Object.keys(m).length; if (n % 10 === 0) { const g = 400000; S.gold += g; toast("Gelesen: " + n + " Pulte. Fund: " + g.toLocaleString("de-DE") + " Noten", false, 4200); } } Snd.play("sk_book", 1, .7); save(); openWin(t, "<p>" + tx + "</p>"); return; }
  if (s.k === "puz") skPanel(s.o);
}
function skPgQuests() { for (const id of ["qu3", "qu4"]) { const q = QUESTS[id], st = S.q[id]; if (!q || !st || st.st !== "active") continue; const i = q.parts.findIndex(p => p.k === "pages"); if (i < 0) continue; const was = qReady(id); st.p = st.p || []; st.p[i] = Math.min(q.parts[i].n, skPages()); qAfter(id, was); } }
let skSeq = [];
function skPanel(z) {
  skSeq = []; const done = skF(z.id), clues = Object.keys(skO("skClue")).filter(k => (z.id === "rune" && /^s2:1[34],33/.test(k)) || (z.id === "uhr" && /^t2a/.test(k)) || (z.id === "stern" && /^t1[ab]/.test(k)) || (z.id === "spiegel" && /^s1:(66|94),(35|46)/.test(k)) || (z.id === "thron" && /^s2:(66|94),(7|18)$/.test(k)));
  const draw = () => {
    const gate = z.gate && !z.gate();
    let h = "<p>" + z.intro + "</p>";
    if (done) h += "<p><b>Gelöst.</b> " + z.win + "</p>";
    else if (gate) h += "<p style='opacity:.8'>" + z.gateTxt + "</p>";
    else { h += "<p style='opacity:.75'>" + z.clue + "</p>";
      if (clues.length) h += "<div style='border:1px dashed #8878;padding:6px 10px;margin:6px 0;font-size:.9em'><b>Notizen</b><br>" + clues.map(k => SKCL[k][1]).join("<hr style='opacity:.2'>") + "</div>";
      h += "<div style='margin:8px 0;font-size:1.1em'>" + z.ans.map((_, i) => "[" + (skSeq[i] != null ? z.sym[skSeq[i]] : "&nbsp;&nbsp;&nbsp;&nbsp;") + "]").join(" ") + "</div><div style='display:flex;flex-wrap:wrap;gap:6px'>" + z.sym.map((s, i) => "<button class='btn' data-sy='" + i + "'>" + s + "</button>").join("") + "<button class='btn' data-sy='x'>Zurück</button></div><p id='skMsg' style='min-height:1.4em'></p>"; }
    openWin(z.t, h, () => $("winBody").querySelectorAll("[data-sy]").forEach(b => b.onclick = () => {
      if (b.dataset.sy === "x") { skSeq.pop(); draw(); return; } skSeq.push(+b.dataset.sy); Snd.play("sk_rune", Math.pow(2, [0, 2, 4, 7, 9, 12][(skSeq[skSeq.length - 1] || 0) % 6] / 12), .8);
      if (skSeq.length < z.ans.length) { draw(); return; }
      if (z.ans.every((a, i) => a === skSeq[i])) { S.flags["sk_" + z.id] = 1; S.flags["sk_" + z.room] = 1; Snd.play(z.id === "thron" ? "sk_seal" : "sk_solve", 1, .9); toast(z.win, false, 5200); save(); closeWin(); G.moving = false; }
      else { skSeq = []; draw(); const m = $("skMsg"); if (m) m.textContent = "Die Zeichen verlöschen. Falsche Folge."; Snd.play("sk_fail", 1, .8); } }));
  };
  draw();
}
/* ---- Zeichnen ---- */
function skDraw(items, c, t, ox, oy, vw, vh) {
  const vis = (x, y) => { const px = x * TS + TS / 2, py = y * TS + TS - 6; return px > ox - 40 && px < ox + vw + 40 && py > oy - 60 && py < oy + vh + 60 ? [px, py] : null; };
  const glow = (px, py, col, a) => { c.save(); c.globalCompositeOperation = "lighter"; const g = c.createRadialGradient(px, py - 14, 0, px, py - 14, 32); g.addColorStop(0, col.replace("A", a)); g.addColorStop(1, col.replace("A", 0)); c.fillStyle = g; c.fillRect(px - 34, py - 48, 68, 68); c.restore(); };
  for (const o of SKPG) { if (o.l !== LAYER || skO("skPg")[o.i]) continue; const p = vis(o.x, o.y); if (!p) continue; items.push({ y: p[1], f: () => { glow(p[0], p[1], "rgba(255,240,170,A)", .35 + .2 * Math.sin(t * 3 + o.i)); drawIcon(c, "page", p[0] - 12, p[1] - 28 + Math.sin(t * 2 + o.i) * 2, 24); } }); }
  for (const id in SKPZ) { const z = SKPZ[id]; if (z.l !== LAYER || z.solid || skF(id)) continue; const p = vis(z.x, z.y); if (!p) continue; items.push({ y: p[1] - 2, f: () => { glow(p[0], p[1], "rgba(150,120,255,A)", .45 + .25 * Math.sin(t * 2.2)); c.save(); c.strokeStyle = "rgba(190,170,255,.8)"; c.lineWidth = 2; c.beginPath(); c.ellipse(p[0], p[1] - 4, 18, 8, 0, 0, 7); c.stroke(); c.beginPath(); c.ellipse(p[0], p[1] - 4, 10 + 2 * Math.sin(t * 3), 4.5, 0, 0, 7); c.stroke(); c.restore(); } }); }
}
/* ---- Fundstück-Symbole ---- */
function iconSk(c, kind, F) {
  const L = (a, b, w) => { c.lineWidth = w || 2; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };
  if (kind === "rune") { c.beginPath(); c.moveTo(20, 4); c.lineTo(32, 14); c.lineTo(28, 34); c.lineTo(12, 34); c.lineTo(8, 14); c.closePath(); F("#7b6cc0"); c.strokeStyle = "#e8e0ff"; L([20, 11], [20, 28], 2.4); L([14, 17], [26, 22], 2); L([26, 17], [14, 22], 2); }
  else if (kind === "book") { c.beginPath(); c.rect(7, 6, 26, 30); F("#2c1d3a"); c.strokeStyle = "#c8a0ff"; c.lineWidth = 1.6; c.beginPath(); c.arc(20, 21, 7, 0, 7); c.stroke(); L([20, 12], [20, 30], 1.6); L([11, 21], [29, 21], 1.6); }
  else if (kind === "gear") { c.beginPath(); c.arc(20, 21, 11, 0, 7); F("#c4973a"); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.beginPath(); c.rect(20 + Math.cos(a) * 12 - 3, 21 + Math.sin(a) * 12 - 3, 6, 6); F("#c4973a"); } c.beginPath(); c.arc(20, 21, 4, 0, 7); F("#3a2a10"); }
  else if (kind === "map") { c.beginPath(); c.moveTo(6, 10); c.lineTo(34, 8); c.lineTo(34, 32); c.lineTo(6, 34); c.closePath(); F("#d7c6e8"); c.fillStyle = "#4a3a9a"; [[12, 16], [22, 14], [28, 24], [16, 27], [24, 28]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 1.8, 0, 7); c.fill(); }); }
  else if (kind === "glassshard") { c.beginPath(); c.moveTo(20, 3); c.lineTo(32, 20); c.lineTo(22, 37); c.lineTo(10, 24); c.closePath(); F("rgba(170,230,255,.85)"); c.strokeStyle = "#fff"; L([16, 14], [22, 28], 1.4); }
  else if (kind === "page") { c.beginPath(); c.moveTo(8, 6); c.lineTo(30, 4); c.lineTo(32, 34); c.lineTo(10, 36); c.closePath(); F("#f3e7c6"); c.strokeStyle = "#6a5a3a"; for (let i = 0; i < 4; i++) L([12, 12 + i * 6], [27 - (i % 2) * 4, 12 + i * 6], 1.3); }
  else if (kind === "key") { c.beginPath(); c.arc(12, 14, 7, 0, 7); F("#a8a8b8"); L([16, 19], [32, 35], 3.4); L([27, 30], [31, 26], 3); L([31, 34], [35, 30], 3); }
  else if (kind === "wick") { c.beginPath(); c.rect(18, 8, 4, 26); F("#3a3040"); c.beginPath(); c.moveTo(20, 2); c.quadraticCurveTo(25, 6, 20, 10); c.quadraticCurveTo(15, 6, 20, 2); F("#5a5a78"); }
  else if (kind === "seed") { c.beginPath(); c.ellipse(20, 22, 9, 12, 0, 0, 7); F("#2a2a58"); c.fillStyle = "#8affea"; [[17, 18], [23, 22], [18, 27]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 2, 0, 7); c.fill(); }); }
}
