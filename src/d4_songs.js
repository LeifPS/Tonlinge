/* ===== Lieder: Notenschrift wie bei Virtual Piano (Roblox) =====
   Buchstaben/Ziffern = Tasten (1 = tiefes C ... m = hohes C), [se] = Akkord, - = Pause/Halten.
   Mehrere Töne ohne "-" dazwischen laufen schneller (fast). step = Sekunden pro Schritt. */
const SONGS = {
  holz: { name: "Clair de Lune", step: 0.30, fast: 0.5, text: `
[se]-a-s-a-
[sq]-o-s-i---
tu[se]-a-s-a-
[sq]-o-s-i---
tu[se]-asutasqtosqtoi
[u8]-i-o-[u8]-[yw]--
tr[t6]-0-t-
ty[u4]-8-u-
ui[o8]-w-t-
iu[y5]-9-r-
tu[se]-asutasqtosqtoi
[ut]-i-o-f-
[wd]-ydf[rd]-
sa[se]-u-s-
sd[qf]-t-f-
fg[th]-o-s-
gf[wd]-y-
sdsa[se]tot
sdsa[sq]tot
sdsa[s8]dfg[h0]fds[wa]--
sdsa[se]tot
sdsa[sq]tot
sdsa[s8]dfg[h0]fds[wa]--
ssdsa[se]tot
ssdsa[sq]tot
ssdsa[s8]dfg[h0]fds[wa]--
ssdsa[se]tot
ssdsa[sq]tot
ssdsa[s8]dfg[h0]fds[wa]-9-w--
[se]-asutasqtosqtoi
[u8]-i-o-[u8]-[yw]--
tr[t6]-0-t-
ty[u4]-8-u-
ui[o8]-w-t-
iu[y5]-9-r-
tu[se]-asutasqtosqtoi
[ut]-i-o-f-
[wd]-ydf[rd]-
sa[se]-u-s-
sd[qf]-t-f-
fg[th]-o-s-
gf[wd]-y-
sdsa[se]tot
sdsa[sq]tot
sdsa[s8]dfg[h0]fds[wa]--
sdsa[se]tot
sdsa[sq]tot
sdsa[s8]dfg[h0]fds[wa]--
ssdsa[se]tot
ssdsa[sq]tot
ssdsa[s8]dfg[h0]fds[wa]--
ssdsa[se]tots
sdsa[sq]tots
sdsa[s8]dfg[h0]fds[wa]-9-w--
[se]-a-s-a-
[sq]-o-s-i-
[wu]-i-o-u-[yw]--
tr[t6]-0-t-
ty[u4]-8-u-
ui[o8]-w-t-
iu[y5]-9-r--[t6]-0-s` }
};
const SONG_WHITE = "1234567890qwertyuiopasdfghjklzxcvbnm", SONG_SHIFT = { "!": "1", "@": "2", "#": "3", "$": "4", "%": "5", "^": "6", "&": "7", "*": "8", "(": "9", ")": "0" };
function songKey(ch) { // Taste -> MIDI-Nummer (1 = C2 = 36)
  let sharp = 0, k = ch; if (SONG_SHIFT[ch]) { k = SONG_SHIFT[ch]; sharp = 1; } else if (ch !== ch.toLowerCase()) { k = ch.toLowerCase(); sharp = 1; }
  const i = SONG_WHITE.indexOf(k); if (i < 0) return null; return 36 + [0, 2, 4, 5, 7, 9, 11][i % 7] + 12 * Math.floor(i / 7) + sharp;
}
const _songCache = {};
function songEvents(id) { // -> { ev: [{ t, n: [midi], d }], len, mid }
  const S0 = SONGS[id]; if (!S0) return null; if (_songCache[id] && _songCache[id].k === S0.step + "|" + S0.fast) return _songCache[id].v;
  const toks = []; let i = 0, tx = S0.text.replace(/\|/g, " ");
  while (i < tx.length) { const ch = tx[i];
    if (ch === "[") { const j = tx.indexOf("]", i); const n = [...tx.slice(i + 1, j)].map(songKey).filter(v => v != null); toks.push({ n }); i = j + 1; }
    else if (ch === "-") { toks.push({ rest: 1 }); i++; }
    else if (/\s/.test(ch)) { toks.push({ gap: 1 }); i++; }
    else { const m = songKey(ch); if (m != null) toks.push({ n: [m] }); i++; } }
  // Läufe: Töne ohne "-" oder Leerzeichen dazwischen laufen schneller
  const out = []; let t = 0, a = 0;
  while (a < toks.length) { const k = toks[a];
    if (k.gap) { a++; continue; }
    if (k.rest) { if (out.length) out[out.length - 1].d += S0.step; t += S0.step; a++; continue; }
    let b = a; while (b < toks.length && toks[b].n) b++;
    const run = b - a, dur = (run > 1 ? S0.fast : 1) * S0.step;
    for (let q = a; q < b; q++) { out.push({ t, n: toks[q].n, d: dur }); t += dur; }
    a = b; }
  const all = out.flatMap(e => e.n).sort((x, y) => x - y), mid = all[all.length >> 1] || 60;
  const v = { ev: out, len: t, mid }; _songCache[id] = { k: S0.step + "|" + S0.fast, v }; return v;
}
