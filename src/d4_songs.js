/* ===== Lieder: Notenschrift wie bei Virtual Piano (Roblox) =====
   Buchstaben/Ziffern = Tasten (1 = tiefes C ... m = hohes C), [se] = Akkord, - = Pause/Halten.
   Jede Note und jede Pause ist genau einen Schritt lang (fast = 1; kleiner macht Läufe schneller). step = Sekunden pro Schritt. */
const SONGS = {
  harfe: { name: "Moosharfe", voice: "harp", step: 0.4, fast: 1, text: `
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
  laute: { name: "Kiefernlaute", voice: "lute", step: 0.22, fast: 1, text: `
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
e` },
  holz: { name: "Holzflöte", voice: "flute", step: 0.32, fast: 1, text: `
o-u-y-
t-y-u-
o-u-y-
t-y-u-
o-u-o-
p-u-p-
o-u-y-
t---
o-u-y-
t-yuyu
o-u-y-
t-yuyu
o-u-o-
p-u-p-
o-u-y-
t---
w-0-9-
8---
u---
t` },
  schelle: { name: "Schellentrommel", voice: "mallet", step: 0.16, fast: 1, text: `
u-0-6-p-
s-0-6-p-
O-q-6-pa
p-0-6-0-
i-q-6-op
u-0-6-0-
yttrr-0u
e-0-6-0-
u-0-6-ps
f-0-6-s-
a-q-6-sd
s-0-6-0-
iopiuiou
yuiytyut
yttrr-u
e--p--
f-w-f-w-
g-w-*-f-
9-d-9-Sd
fdSfd-e-
d-q-d-q-
f-q-7-d-
8-s-8-as
dsads-w-
a-0-a-0-
d-s-%-a-
6-p-6-Op
apOap--
u----u
I--O--
p-p--Op
apOap----
p` },
  urgabel: { name: "Urgabel", voice: "fork", step: 0.3, fast: 1, text: `
4-e--
1-w--
4-e--
1-w--
4-f-h-
g-f-a-
p-a-s-
o-w--
u-e--
1-w--
4-e--
1-w--
4-f-h-
g-f-a-
p-a-s-
o-w--
a-w--
f-e--
y-q--
2-e--
1-(--
o-p-P-
d-s-p-
s-P-p-
s-1--
1-1-s-
d-D-g-
h-P-s-
d-s-p-
s-^--
1-^-s-
g-2--
f-w--
p-o-p-
a-s-d-
a-s-d-
u-6-2-
P--5-
s--1-
4-e--
1-w--
4-e--
1-w--
4-f-h-
g-f-a-
p-a-s-
o-w--
u-e--
1-w--
4-e--
1-w--
4-f-h-
g-f-a-
p-a-s-
o-w--
a-w--
f-e--
y-q--
2-e--
1-(--
o-p-P-
d-s-p-
s-P-p-
s-1--
1-1-s-
d-D-g-
h-P-s-
d-s-p-
s-^--
1-^-s-
g-e--
D-1--
p-P-D-
d-s-P-
d-s-P-
Y-6-2-
P---
s-1` },
  klangschale: { name: "Klangschale", voice: "bowl", step: 0.2, fast: 1, text: `
4u1u4u1u
4fhgfapasouuu1u4u1u
4fhgfapasou
aufuye2i1t
opPds
psPpsw
1wsdDghPs
dspsw
1wsgifupo
pasdasdutiP
s4u1u4u1u
4fhgfapasou
uu1u4u1u
4fhgfapasou
aufuye2i1t
opPdspsPpst
1tsdDghPsdspst
1tsgyDYpPDdsPdsP
YtiPs` },
  sternenharfe: { name: "Sternenharfe", voice: "starharp", step: 0.3, fast: 1, text: `
u-
h---
f---
a-d-f-
d---
o-s-d-
s-f-s-
a-a-s-
a---
p-p-a-
p-d-p-
a-p-o-
p-i-o-
i---
a---
p-u-i-
u-p-u-
p-u-y-
o-t-y-
t---
a---
o-0-o-
h---
f---
p-d-f-
d---
o-s-d-
h---
f---
p-d-f-
d---
s---
o-t-y-
p---
o---
p-i-o-
s---
p---
a-p-a-
h---
a---
o-w-u-
a-r-o-
P-E-Y-
s---
o-w-u-
a-r-o-
P-E-Y-
s---
P-E-Y-
s--D-
h-w-t-
u-o-s-
v` },
  weltenorgel: { name: "Weltenorgel", voice: "organ", step: 0.15, fast: 1, text: `
fdf---dsap
O-p---
uyu--rtW
e----
090---98te
w-e----
uyuturueuWueuru
tu0uQuWueuWueuru
tpopipupypTpypup
ipeprpTpypTpypup
iypyyypyPEyEPEyE
otutotutpetepete
iryriryrOWrWOWrW
ueteueteyqWqyqWq
t0e0t0e0r9q9r9q9
8fdfsfafpfOfpfaf
sfufIfOfpfOfpfaf
sfafpfofifofpdid
adpdodidudidosus
psosisusysusiaya
Oaiauayatayauptp
raratptpiOiOuptp
raratptprpOpIpOI
OuyurytrtpOpspOI
Ouyuaytrtpr0O0
oeueityeur0WuEew
re9QrewqTwu0TwP0
u-y-y-t-
r-r-e-q-
e` },
  kalimba: { name: "Glimmer-Kalimba", voice: "kalimba", step: 0.2, fast: 1, text: `
fD
fDfads
p-tup
a-upa
s--fD
fDfads
p-tup
a-usa
p-asd
f-ogf
d-ifd
s-uds
a-uffx---
fDfDfa
dsp-t
upa-u
pas--
fDfDfa
dsp-t
upa-u
sap-a
sdf-o
gfd-i
fds-u
dsa-uf
fx` },
  urmeerchor: { name: "Urmeerchor", voice: "choir", step: 0.3, fast: 1, text: `
u-u-i-o-
o-i-u-y-
t-t-y-u-
u-yy--
u-u-i-o-
o-i-u-y-
t-t-y-u-
y-tt--
y-y-u-t-
y-uiu-t-
y-uiu-y-
t-y-w--
u-u-i-o0
o-i-u-y-
t-t-y-u-
y-tt` }
};
/* Klangfarben für die Lieder. k "pl" = gezupft/geschlagen (klingt aus), "su" = gehalten (Streicher, Flöte, Orgel, Chor). h/parts = Obertöne. */
const VOICES = {
  harp:     { k: "pl", h: [[1, 1], [2, .38], [3, .14], [4, .06]], dec: 2.2, amp: .3 },
  lute:     { k: "pl", h: [[1, 1], [2, .38], [3, .14], [4, .06]], dec: 1.5, amp: .3 },
  starharp: { k: "pl", h: [[1, 1], [2, .5], [3, .25], [4, .12], [6, .05]], dec: 2.8, amp: .28 },
  kalimba:  { k: "pl", h: [[1, 1], [5.4, .22], [9.2, .06]], dec: 1.1, amp: .34, hold: .3 },
  fork:     { k: "pl", h: [[1, 1], [6.27, .1]], dec: 3.6, amp: .36, hold: .6 },
  bowl:     { k: "pl", h: [[1, 1], [2.71, .3], [5.43, .12], [8.9, .05]], dec: 4.6, amp: .3, hold: .6 },
  mallet:   { k: "pl", h: [[1, 1], [3.9, .35], [8.1, .1]], dec: .42, amp: .32, hold: .1, click: .12 },
  bow:      { k: "su", parts: [[1, 1, "sawtooth", 0], [1, 1, "sawtooth", 7]], lp: 5, att: .07, rel: .22, vib: [5.2, .0045], amp: .17 },
  flute:    { k: "su", parts: [[1, 1, "sine", 0], [2, .18, "sine", 0], [3, .05, "sine", 0]], lp: 0, att: .09, rel: .15, vib: [5, .004], amp: .27 },
  organ:    { k: "su", parts: [[.5, .45, "sine", 0], [1, 1, "sine", 0], [2, .7, "sine", 0], [3, .4, "sine", 0], [4, .25, "sine", 0], [6, .12, "sine", 0]], lp: 0, att: .02, rel: .12, vib: null, amp: .09 },
  choir:    { k: "su", parts: [[1, 1, "sawtooth", -9], [1, 1, "sawtooth", 0], [1, 1, "sawtooth", 9]], lpf: 1100, att: .18, rel: .3, vib: [4.6, .003], amp: .1 }
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
