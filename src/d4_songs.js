/* ===== Lieder: Notenschrift wie bei Virtual Piano (Roblox) =====
   Buchstaben/Ziffern = Tasten (1 = tiefes C ... m = hohes C), [se] = Akkord, - = Pause/Halten.
   Jede Note und jede Pause ist genau einen Schritt lang (fast = 1; kleiner macht Läufe schneller). step = Sekunden pro Schritt. */
const SONGS = {
  harfe: { name: "Moosharfe", voice: "pluck", step: 0.4, fast: 1, text: `
s-
h-wgfd
f-e-d-
s-epas
f-0--
s-tpas
f-e-d-
s-u-u-
u--s-
prtasd
oqwpas
iwg-g-
fqw-f-
d-esas
f-s-p-
o-t-p-
o-t-f-
G-rhj-
G-f-d-
s-0-g-
bwe--
hed-f
g-q-h-
f-d-0f
l---
tuoas-
h-wgfd
f-e-d-
s-epas
f-0--
s-tpas
f-e-d-
s-u-u-
u` },
  laute: { name: "Kiefernlaute", voice: "pluck", dec: 1.5, step: 0.22, fast: 1, text: `
sdD
fDfD
fDd5O
psds
4-1D
ffff
fDd5P
adfd
5d6D
fDfD
fDd5O
psds
4sdD
ff5f
dd2d
s-5-
lzZ
xZxZ
xZz5H
jlzl
4-1Z
xxxx
xZz5J
kzxz
5z6Z
xZxZ
xZz5H
jlzl
4lzZ
xxxx
zzzz
l-h-
lll-
ououo
8ouou
YO@Y
%-@-
iyiyi
^iyiy
iI-o---

ououo
8ouou
YO@Y
%-@-
iyiyi
^iyiy
iI-o
555-
lhlhl
8lhlh
lHlHl
%Hll-
^JJgJ
^JgJg
JJ2k
5kk7
lhlhl
8lhlh
lHlHl
%Hll-
^JJgJ
^JgJg
JJ2k
5kk7
fDfD
fDd5O
psds
4-1D
ffff
fDd5P
adfd
5d6D
fDfD
fDd5O
psds
4sdD
ff5f
dd2d
s-5-
8lhlhl
8lhlh
4jgjgj
4gjgj
8lhlhl
8lhlh
5khkhk
5khkh
8lhlhl
8lhlh
4jgjgj
4gjgj
8lhlhl
8lhlh
8ll-
l--
ououo
8ouou
YO@Y
%-@-
iyiyi
^iyiy
iI-o---

ououo
8ouou
YO@Y
%-@-
iyiyi
^iyiy
iI-o
555-
lhlhl
8lhlh
lHlHl
%Hll-
^JJgJ
^JgJg
JJ2k
5kk7
lhlhl
8lhlh
lHlHl
%Hll-
^JJgJ
^JgJg
JJ2k
5kk-
oo-o-
Oo-
oo-o-
Oo-
o-Oo-
Oo-
Oo-O
o--
l` },
  geige: { name: "Glimmergeige", voice: "bow", step: 0.36, fast: 1, text: `
680e08
680e08
u80e0i
u80e0i
o79w97
579iuy
i68q86
468tre
r%707%
3%707%
f80fdfg
f80e0fg
h79w97
57hgfd
g68q86
46gsap
a%707%
a%s9d%
s80esapa
s68q8s
a79wapop
a%707%
s80esapo
i68qerty
u%707u
y%797y
s80esapa
s68q8s
a79wapop
a%707%
s80esapo
i68qerty
u%707u
y%797i
u80eyt
u80tyu
i79wuy
t68qt6
r79-w-
e` }
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
