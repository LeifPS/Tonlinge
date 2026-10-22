// Erstellt die lesbare Wiki-Datenbank aus den Originaltabellen des Spiels.
// Aufruf: node wiki/build-data.js
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public", "wiki");
const context = {
  console,
  window: {},
  Math,
  Object,
  Array,
  Set,
  Map,
  Uint8Array,
  Float32Array,
  Number,
  String,
  Boolean,
  Date,
  JSON,
};
vm.createContext(context);

// Dieselben Daten- und Weltmodule wie das Spiel ausführen, aber keine UI oder
// Spielschleife starten. So stammen Karten, Inhalte und Werte aus dem Quelltext.
const sourceFiles = [
  "src/d1_data.js",
  "src/d2_quests.js",
  "src/d3_story.js",
  "src/d4_songs.js",
  "src/d6_area5.js",
  "src/d7_npcs5.js",
  "src/d8_sk_quests.js",
  "src/w_world.js",
  "src/w_layers.js",
  "src/w_sanktum.js",
  "src/t_titles.js",
];
for (const file of sourceFiles) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  vm.runInContext(source, context, { filename: file, timeout: 10000 });
}

const extract = `globalThis.__wikiData = {
  areas: AREAS,
  rarities: RAR,
  mutations: MUTS,
  species: SPECIES,
  instruments: INSTR,
  instrumentStats: INSTR_STATS,
  instrumentPassives: PAS_TXT,
  instrumentPassivesSanktum: PASX,
  enchantments: ENCH,
  quests: QUESTS,
  greetings: GREET,
  stories: STORY,
  questDialogues: QX,
  npcs: NPCS,
  shops: SHOPS,
  items: ITEMS,
  specialItems: [
    { id: "boots", n: "Thores Stiefel", kind: "Ausrüstung", sourceQuest: "q_thore", effect: "Solange die Stiefel getragen werden, ist die Laufgeschwindigkeit mit dem Faktor 1,4 multipliziert." },
    { id: "shard", n: "Echosplitter", kind: "Relikt", sourceQuest: "q_echoaltar", effect: "Relikt zum Verzaubern eines Instruments am Echoaltar. Die Fanglogik würfelt eine Grundchance von 1/200 zuzüglich 0,0008 je Glückspunkt; nach 400 Fängen ohne Fund wird ein Splitter garantiert." }
  ],
  titles: TITLES.map(({ id, name, cat, tier, d }) => ({ id, name, cat, tier, description: d })),
  zones: ZINFO,
  zoneCenters: ZC,
  layers: Object.fromEntries(Object.entries(LAYERS).map(([id, layer]) => [id, {
    id: layer.id, name: layer.name, area: layer.area, tiles: layer.T, zones: layer.ZN,
    links: layer.links, bounds: layer.bounds || null
  }]))
};`;
vm.runInContext(extract, context, { timeout: 10000 });

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "data.json"), JSON.stringify(context.__wikiData));

const head = fs.readFileSync(path.join(root, "src", "h_head.html"), "utf8");
for (const [font, file] of [["Caveat Brush", "caveat-brush.woff2"], ["Patrick Hand", "patrick-hand.woff2"]]) {
  const escaped = font.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = head.match(new RegExp(`@font-face\\{font-family:[\"']${escaped}[\"'][^}]*url\\(data:font/woff2;base64,([^)]*)\\)`));
  if (!match) throw new Error(`Spielschriftart nicht in src/h_head.html gefunden: ${font}`);
  fs.writeFileSync(path.join(outDir, file), Buffer.from(match[1], "base64"));
}

console.log(`Wiki-Daten geschrieben: ${context.__wikiData.species.length} Tonlinge, ${Object.keys(context.__wikiData.quests).length} Quests, ${Object.keys(context.__wikiData.layers).length} Kartenebenen.`);
