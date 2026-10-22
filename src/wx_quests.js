/* ===== Wetter-Quests und Wetter-Geheimnisse =====
   Filter: f.wx = Wetter (oder Liste), bei dem der Tonling gefangen wurde; f.mut = "wx" = irgendeine Wettermutation.
   Fundstücke mit wx erscheinen nur bei diesem Wetter. */
ITEMS.nebellaterne = { n: "Nebellaterne", x: 13, y: 19, kind: "chimes", wx: "nebel" };
ITEMS.regenscherbe = { n: "Regenbogenscherbe", x: 59, y: 5, kind: "shard", wx: "regenbogen" };
Object.keys(ITEMS).forEach(k => ITEMS[k].id = k);
const WXRARE = ["aurora", "frostmond", "sternschnuppen", "blutmond", "regenbogen"];
QUESTS.wx1 = { npc: "fenn", lvl: 10, after: "q_fenn", title: "Wetterleuchten", n: 1, f: {}, desc: "", rew: { xp: 1500, gold: 700 } };
setParts("wx1", [C_(3, { wx: "regen" }, "Fange 3 Tonlinge, während es regnet."), C_(2, { wx: "wind" }, "Fange 2 Tonlinge, während der Wind weht.")]);
QUESTS.wx2 = { npc: "bora", lvl: 14, after: "q_bora", title: "Laterne im Nebel", n: 1, f: {}, desc: "", rew: { xp: 3200, gold: 1500 } };
setParts("wx2", [ITEM("nebellaterne", "Finde die Nebellaterne im Flüsterwald. Sie zeigt sich nur bei Nebel."), C_(2, { wx: "nebel", a: 1 }, "Fange 2 Tonlinge im Klanghain, während Nebel liegt.")]);
QUESTS.wx3 = { npc: "nox", lvl: 36, after: "q_echoaltar", title: "Sturmfänger", n: 1, f: {}, desc: "", rew: { xp: 75000, gold: 20000 } };
setParts("wx3", [C_(3, { wx: "sturm", a: 3 }, "Fange 3 Tonlinge in der Sternenhöhe, während ein Sturm tobt."), GIVE(1, { mut: "elec" }, "Bringe Nox einen Elektrischen Tonling.")]);
QUESTS.wx4 = { npc: "nox", lvl: 42, after: "wx3", title: "Nordlicht-Nacht", n: 1, f: {}, desc: "", rew: { xp: 170000, gold: 55000 } };
setParts("wx4", [C_(1, { mut: "aurora" }, "Fange einen Tonling mit der Aurora-Mutation. Sie entsteht nur bei Aurora."), C_(2, { wx: "frostmond" }, "Fange 2 Tonlinge bei Frostmond.")]);
QUESTS.wx5 = { npc: "mira", lvl: 50, after: "m19", title: "Himmel und Meer", n: 1, f: {}, desc: "", rew: { xp: 450000, gold: 160000 } };
setParts("wx5", [C_(3, { wx: WXRARE }, "Fange 3 Tonlinge bei seltenem Wetter (Aurora, Frostmond, Sternschnuppen, Blutmond oder Regenbogen)."), GIVE(2, { mut: "wx" }, "Bringe Mira 2 Tonlinge mit einer Wettermutation.")]);
QUESTS.wx6 = { npc: "astra", lvl: 40, after: "m13", title: "Der Regenbogenfänger", n: 1, f: {}, desc: "", rew: { xp: 500000, gold: 250000 } };
setParts("wx6", [ITEM("regenscherbe", "Finde die Regenbogenscherbe auf dem Windhügel. Sie zeigt sich nur bei Regenbogen."), C_(1, { mut: "regenb" }, "Fange einen Regenbogen-Tonling. Die Mutation gibt es nur bei Regenbogen.")]);
Object.assign(QX, {
  wx1: { locked: "Der Wind hört dir noch nicht zu. Komm später wieder.", offer: ["Mein Wind hat Geschwister: Regen, Nebel, Sturm. Jedes Wetter singt anders.", "Fang drei Tonlinge, während es regnet, und zwei, während der Wind weht. Dann hörst du den Unterschied."], remind: "Drei bei Regen, zwei bei Wind. Das Wetter siehst du oben neben der Uhr.", done: ["Hörst du es? Bei Regen klingt alles weicher.", "Behalte das Wetter im Blick. Manche Tonlinge mögen es, andere verstecken sich."] },
  wx2: { locked: "Es ist zu klar. Komm wieder, wenn Nebel im Wald liegt.", offer: ["Im Nebel sehe ich nichts, aber ich höre mehr. Meine alte Laterne ist irgendwo im Flüsterwald liegen geblieben.", "Sie zeigt sich nur, wenn Nebel liegt. Finde sie und fang zwei Tonlinge im Nebel."], remind: "Die Laterne zeigt sich nur im Nebel. Und zwei Tonlinge, während er liegt.", done: ["Meine Laterne! Sie leuchtet im Nebel noch genauso.", "Danke. Nimm das hier."] },
  wx3: { locked: "Warte auf ein Gewitter. Dann reden wir.", offer: ["Wenn der Sturm über die Sternenhöhe zieht, werden die Tonlinge schneller und manche laden sich auf.", "Fang drei Tonlinge im Sturm. Und bring mir einen, den der Sturm elektrisch gemacht hat."], remind: "Drei Tonlinge im Sturm, dazu ein Elektrischer.", done: ["Es kribbelt noch auf der Haut. Gut gemacht.", "Der Himmel hat noch mehr zu bieten."] },
  wx4: { locked: "Der Himmel muss erst wieder leuchten. Komm später.", offer: ["Das Nordlicht ist selten. Es malt einen Tonling in seinen Farben, wenn man Glück hat.", "Fang einen mit Aurora. Und dazu zwei Tonlinge im Frostmond, wenn er scheint. Das Warten gehört dazu."], remind: "Ein Aurora-Tonling und zwei im Frostmond.", done: ["Seine Farben wandern noch. Ich werde ihn nie vergessen.", "Hier, deine Belohnung."] },
  wx5: { locked: "Noch nicht. Das Wetter ist zu zahm für dich.", offer: ["Wenn der Himmel etwas Besonderes tut, hört das Meer zu.", "Fang drei Tonlinge bei seltenem Wetter und bring mir zwei mit Wettermutation. Das braucht Geduld und Glück."], remind: "Drei bei seltenem Wetter, zwei mit Wettermutation.", done: ["Beides! Das Meer ist beeindruckt.", "Nimm das, du hast es verdient."] },
  wx6: { locked: "Dafür brauchst du viel Geduld. Komm später.", offer: ["Nach dem Regen bricht manchmal das Licht. Dann liegt eine Scherbe des Regenbogens auf dem Windhügel.", "Finde sie, sie zeigt sich nur dann. Und fang einen Tonling, den der Regenbogen berührt hat."], remind: "Die Scherbe zeigt sich nur bei Regenbogen. Und ein Regenbogen-Tonling.", done: ["Der Regenbogen selbst hat sich vor dir verneigt.", "Das ist die größte Belohnung, die ich habe."] }
});
