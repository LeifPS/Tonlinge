/* ===== DATEN 3: Geschichte, Begrüßungen, Gespräche, Quest-Dialoge =====
   Ein Gespräch ist eine Liste von Seiten. Der Text erscheint Buchstabe für Buchstabe. */
const TYPE = { letter: 22, comma: 220, period: 320 };    // Pausen in Millisekunden

const NPC_VOICE = { tilda: 3, marlo: 0, ysa: 5, okko: 1, bora: 4, fenn: 2, mooma: -2, kerrin: 0, dunn: -1, lioba: 6, echo: 2, stimmer: -3, astra: 4, pim: 2, selene: 5, nox: -2, gero: -4, wenzel: 1, hueterin: -1, rufus: 2, brum: -3, gilda: 6, orla: 3, zeno: -2, mira: 4, tarn: 0, korin: 5, ebbe: 1, hake: -4, tiefa: 3, saenger: -1 };

/* Begrüßung: Tag und Nacht getrennt, es wird zufällig gewählt */
const GREET = {
  tilda:  { d: ["Da bist du ja. Der Hain hat schon nach dir geklungen.", "Guten Morgen! Hörst du das? Heute singt er etwas höher."], n: ["So spät noch unterwegs? Pass auf, nachts hört man andere Töne."] },
  marlo:  { d: ["Willkommen, willkommen! Schau dich um, aber fass nichts an, was du nicht kaufst.", "Ah, Kundschaft! Oder Verkäufer? Beides ist mir recht."], n: ["Ich habe eigentlich schon zu. Aber für dich mache ich eine Ausnahme."] },
  ysa:    { d: ["Du läufst im falschen Takt. Hör mal: eins, zwei, eins, zwei.", "Na? Schon wieder daneben getroffen?"], n: ["Nachts ist der Takt langsamer. Merkst du das?"] },
  okko:   { d: ["Psst. Du verscheuchst die Frösche.", "Der Teich ist heute still. Das gefällt mir."], n: ["Nachts hört man den Teich atmen. Setz dich ruhig dazu."] },
  bora:   { d: ["Tagsüber? Wie langweilig. Aber gut, ich bin ja gerade wach.", "Die Sonne ist mir zu laut."], n: ["Endlich, jemand, der die Nacht versteht!", "Siehst du die Lichter zwischen den Bäumen? Nicht erschrecken."] },
  fenn:   { d: ["Wind aus Westen, das bringt Neuigkeiten.", "Hallo, Fremde. Der Hügel gehört allen, nur der Wind gehört sich selbst."], n: ["Nachts pfeift der Hügel anders. Ein bisschen wie ein Schlaflied."] },
  mooma:  { d: ["Setz dich, Kind. Die Moosharfe wartet nicht, aber sie hört gut.", "Du hast lange gelauscht. Das gefällt mir."], n: ["Nachts ist es hier am schönsten. Still genug zum Zuhören."] },
  kerrin: { d: ["Pass auf den Staub auf. Hier unten hat jeder Krümel seine eigene Tonlage.", "Ah, jemand, der von oben kommt. Wie ist das Wetter?"], n: ["Hier unten ist immer Nacht. Man gewöhnt sich daran."] },
  dunn:   { d: ["Hm. Du bist also die Neue. Gut, dass du hier bist.", "Pass auf die Tropfen auf. Die zählen mit."], n: ["Oben ist jetzt Nacht? Hier unten merkt man das nicht."] },
  lioba:  { d: ["Hör doch, wie es tropft. Tropf, tropf, tropf. Ein Lied ohne Ende.", "Oh, du bist es. Ich dachte, es wäre schon wieder der Wind."], n: ["Nachts tropft es lauter. Oder ich höre besser."] },
  stimmer: { d: ["Still. Ich stimme gerade.", "Du hast die Wand überhört. Aber nicht ganz."], n: ["Nachts sind die Saiten straffer. Gut zum Stimmen."] },
  astra:  { d: ["Willkommen auf der Sternwarte. Tagsüber sieht man hier nur Wolken, aber die Sterne sind trotzdem da.", "Ah, jemand von unten! Du riechst nach Höhle."], n: ["Perfekt, du kommst zur richtigen Zeit. Sieh nach oben!", "Nachts singen die Sterne lauter. Hörst du sie?"] },
  pim:    { d: ["Frische Wolkenware, direkt vom Pfad! Na gut, Instrumente. Aber sie sind sehr frisch.", "Kundschaft! Setz dich, die Wolke trägt dich."], n: ["Nachts verkaufe ich nur an Leute mit guten Ohren. Du hast gute Ohren."] },
  selene: { d: ["Der Mond schläft jetzt. Ich passe auf, dass ihn niemand weckt.", "Tagsüber ist der See still. Er sammelt Licht."], n: ["Hörst du, wie der See atmet? Er wartet auf den Mond.", "Endlich Nacht. Jetzt wird es schön."] },
  nox:    { d: ["Pst. Ich schlafe… also eigentlich nicht. Aber fast.", "Tagsüber bin ich nicht da. Du träumst."], n: ["Endlich Nacht. Alles andere ist nur Vorbereitung.", "Die Käuze sind heute unruhig. Gut, so mag ich sie."] },
  gero:   { d: ["Hm. Gewitter in drei Minuten. Oder vor zwei. Ich lerne noch.", "Bleib weg vom höchsten Stein. Der hat etwas gegen mich."], n: ["Nachts blitzt es schöner. Aber auch gefährlicher. Ich liebe es."] },
  wenzel: { d: ["Wenn du Kometen fangen willst, brauchst du Geduld und gute Schuhe.", "Der Grat ist schmal, die Aussicht breit. Genieß sie."], n: ["Die Lichter heute! Schau, wie sie tanzen."] },
  hueterin: { d: ["Du hast die Wand gehört. Dann hörst du vielleicht auch den Rest.", "Setz dich. Das Lied hat Zeit."], n: ["Nachts hört man es am besten. Das Ende des Urlieds."] },
  rufus:  { d: ["Hallo! Ich forme gerade Ton. Oder er formt mich.", "Schön, dass du da bist. Die Wiese klingt heute weich."], n: ["Nachts trocknet der Ton langsamer. Ich warte einfach."] },
  brum:   { d: ["Hm. Holz hat Charakter. Dieses hier ist ein Angeber.", "Vorsicht, frisch geschlagen. Es klingt noch beleidigt."], n: ["Nachts knacken die Bäume. Das ist Gesang, kein Alarm."] },
  gilda:  { d: ["Zupf, zupf. Hörst du das? Nein? Dann komm näher.", "Willkommen im Pilzgarten. Nicht anfassen, die Pilze sind eitel."], n: ["Hier ist es immer gleich dunkel. Ich liebe das."] },
  orla:   { d: ["Sieben Röhren, sieben Stimmen. Und alle reden durcheinander.", "Oh, Besuch. Warte, ich muss kurz einen Ton zu Ende hören."], n: ["Der Saal funkelt nachts genauso wie tags. Praktisch."] },
  zeno:   { d: ["Wasser, Glas und Geduld. Mehr braucht man nicht.", "Psst. Gleich singt der Rand."], n: ["Nachts klingt Glas klarer. Oder die Welt wird stiller."] },
  mira:   { d: ["Salzig, was? Du hast es bis zum Meer geschafft. Willkommen am Rauschmeer.", "Hör mal: Das Meer atmet. Ein, aus, ein, aus."], n: ["Nachts leuchtet der Strand ein bisschen. Als würde der Sand träumen."] },
  tarn:   { d: ["Frische Muscheln, fangfrisch! Na ja, strandfrisch.", "Einmal reinhören ist kostenlos. Mitnehmen kostet."], n: ["Nachts rauscht die Muschel lauter. Ich schwöre."] },
  korin:  { d: ["Vorsicht mit den Zweigen, die sind lebendig. Und beleidigt, wenn man sie anrempelt.", "Die Korallen blühen heute rosa. Schön, nicht?"], n: ["Nachts leuchten die Riffe von innen. Mein Lieblingsmoment."] },
  ebbe:   { d: ["Das Wasser kommt, das Wasser geht. Ich schaue nur zu und schnitze.", "Treibholz hat die besten Töne. Es hat alles schon erlebt."], n: ["Nachts zieht die Flut stärker. Man spürt es im Holz."] },
  hake:   { d: ["Arr. Das hier war mal ein Schiff. Jetzt ist es ein Wohnzimmer.", "Pass auf die Planken auf. Die tragen Groll."], n: ["Nachts flüstert das Wrack. Ich flüstere zurück."] },
  tiefa:  { d: ["Unten ist es dunkel, aber nie still. Das lernt man als Taucherin.", "Mit Luft im Herzen geht alles. Mit Luft im Kopf eher nicht."], n: ["Nachts leuchten die Tiefen. Dann ist es fast gemütlich."] },
  saenger:{ d: ["Du hast die Wand gehört. Das Meer hat dich also schon verraten.", "Ich singe seit Jahren an einer Strophe, die nie fertig wird."], n: ["Nachts ist die Strophe am lautesten. Und am unvollständigsten."] },
  echo:   { d: ["Hallo… hallo… hallo…", "Du bist gekommen… gekommen…"], n: ["Es ist still… still… still…"] }
};

/* Gespräche: der Reihe nach, was noch nicht gehört wurde und freigeschaltet ist; danach Wiederholungen.
   w = Bedingung (Name aus COND) */
const COND = {
  a: () => true,
  m1: () => qDone("m1"), m2: () => qDone("m2"), m3: () => qDone("m3"), m4: () => qDone("m4"), m5: () => qDone("m5"), m6: () => qDone("m6"), m7: () => qDone("m7"), m8: () => qDone("m8"), m9: () => qDone("m9"), m10: () => qDone("m10"), m11: () => qDone("m11"), m12: () => qDone("m12"), m13: () => qDone("m13"), gate3: () => !!S.flags.gate3Open,
  gate: () => !!S.flags.gateOpen, gate4: () => !!S.flags.gate4Open, night: () => isNight(), rich: () => S.stats.catches >= 10, many: () => S.stats.catches >= 30
};
["m14", "m15", "m16", "m17", "m18", "m19", "l1", "l2", "l3", "l4", "l5", "l6", "l7"].forEach(k => { COND[k] = () => qDone(k); });
const STORY = {
  tilda: [
    { w: "a", p: ["Früher hat der Hain ein ganzes Lied gesungen. Das Urlied, sagt man. Jeder Baum, jeder Stein, jede Pfütze hatte darin ihren Ton.", "Dann ist das Lied zerbrochen. Übrig blieben die Töne, und aus denen sind die Tonlinge geworden."] },
    { w: "a", p: ["Ich bin im Dorf aufgewachsen und habe nie ein ganzes Lied gehört. Nur Teile davon. Deshalb fange ich Tonlinge: Ich will wissen, wie es klingt, wenn alles zusammenpasst."] },
    { w: "m1", p: ["Du hast es beim ersten Mal geschafft, ohne zu schimpfen. Weißt du, wie selten das ist?", "Die meisten drehen am Regler, bis ihnen schwindlig wird. Dabei muss man nur zuhören."] },
    { w: "m2", p: ["Manche Tonlinge leuchten kräftiger, weil sie einen Teil des Urlieds besser behalten haben. Seltene Töne sind wie Erinnerungen."] },
    { w: "m3", p: ["Der Hain wird leiser. Das merke nicht nur ich. Okko sagt, der Teich schweigt öfter, und Fenn behauptet, der Wind habe seine Melodie verloren.", "Ich glaube, die fehlenden Töne sammeln sich irgendwo. Vielleicht unter uns, in den Höhlen."] },
    { w: "gate", p: ["Das Tor ist offen. Zum ersten Mal seit meiner Kindheit. Es heißt, ganz unten singt der Sonnenkern, der erste Ton des Urlieds.", "Ich war nie dort. Ich bin Musikerin, keine Entdeckerin. Aber du, du gehst hin, nicht wahr?"] },
    { w: "m5", p: ["Dunn aus den Höhlen schickt manchmal Boten herauf. Er sagt, die Höhlen hallen wieder. Seit du da bist, hört man unten Töne, die lange weg waren."] }
  ],
  tildaLoop: [["Ich übe gerade eine Melodie. Sie klingt schief, aber ehrlich."], ["Ein guter Zuhörer hört auch das, was nicht gespielt wird."], ["Die Holzflöte war übrigens mein erstes Instrument. Sie ist verziehen, wenn sie quietscht."]],

  marlo: [
    { w: "a", p: ["Ich war früher Seemann. Erzähl das ruhig niemandem, hier gibt es ja keine See. Ich habe nur gelernt, dass man gute Ware nie unter Wert verkauft."] },
    { w: "a", p: ["Mein Laden lebt von zwei Dingen: Instrumenten und Tonlingen. Ich kaufe deine Fänge, du kaufst meine Ware, und am Ende gehört dem Hain ein bisschen mehr Musik."] },
    { w: "m1", p: ["Ein gewöhnlicher Tupfel ist fünf Noten wert, ein Fabelhafter neunhundert. Dazwischen wird der Preis schnell absurd. Ich handle nicht, ich rechne nur."] },
    { w: "m3", p: ["Einmal hat mir jemand einen sternklaren Tonling gebracht. Ich habe ihn nicht verkauft, ich habe ihn angeschaut. Drei Stunden lang. Meine Frau war sauer."] },
    { w: "gate", p: ["Die Höhlen, ja? Kerrin dort unten ist ein alter Freund. Er baut Geigen aus Holz, das nie Licht gesehen hat. Sag ihm, Marlo lässt ihn grüßen, und dass er mir noch Geld schuldet."] }
  ],
  marloLoop: [["Brauchst du Nachschub? Ich nehme alles, was fiept."], ["Mein Tipp: Verkauf die Gewöhnlichen sofort, die Seltenen lieber später."], ["Ich wollte immer Instrumente spielen. Ich kann nur verkaufen. Das ist auch eine Kunst."]],

  ysa: [
    { w: "a", p: ["Ich bin Ysa, die beste Trommlerin östlich vom Dorf. Gut, die einzige, aber das ändert nichts.", "Jeder Tonling hat einen Takt. Wenn du den hörst, wird alles leicht."] },
    { w: "a", p: ["Meine Mutter hat gesagt, man kann Takt nicht lernen. Ich habe ihr bewiesen, dass man Takt erarbeiten kann. Sie hat trotzdem recht behalten."] },
    { w: "m2", p: ["Nicht schlecht. Beim Rhythmus-Check hast du nicht gezuckt. Das war mein erster Test, und du hast ihn bestanden."] },
    { w: "m3", p: ["Ich habe mal einen Wettstreit gegen Fenn verloren. Er spielt keinen Takt, er spielt Wind. Das ist unfair. Wind hat keinen Takt und gewinnt trotzdem."] },
    { w: "gate", p: ["Die Höhlen? Da unten ist alles langsamer. Die Tropfen halten ihren Takt besser als ich. Ich fürchte, ich bin dort nur Zuschauerin."] }
  ],
  ysaLoop: [["Eins, zwei, eins, zwei. Nicht die Hände vergessen!"], ["Wenn dein Herz schneller schlägt als der Ring, wartest du zu früh."], ["Perfekte Treffer sind eine Frage von Geduld. Und ein bisschen Glück."]],

  okko: [
    { w: "a", p: ["Ich sitze seit dreißig Jahren am Teich. Am Anfang dachte ich, er sei still. Dann habe ich zugehört."] },
    { w: "a", p: ["Wasser kennt jeden Ton, den es je gehört hat. Deshalb ist der Teich so voll. Es klingt nach allem gleichzeitig, wenn man genau hinhört."] },
    { w: "m1", p: ["Du fängst Tonlinge am Wasser? Pass auf die Tautropfen auf. Sie sind schüchtern. Wenn du zu laut bist, fallen sie einfach in den Teich."] },
    { w: "m2", p: ["Schilfpfeifen schnitze ich nur im Herbst. Dann hat das Schilf den Sommer gehört und ist ein bisschen weiser."] },
    { w: "night", p: ["Nachts steigt aus dem Teich ein Licht. Der Mondschirm, sagt man. Ich habe ihn noch nie gesehen. Vielleicht muss man gar nicht hinschauen."] }
  ],
  okkoLoop: [["Hm."], ["Der Teich hat heute einen Ton, den ich noch nicht kenne."], ["Sprich leise. Er hört alles."]],

  bora: [
    { w: "a", p: ["Ich schlafe tagsüber und sammle nachts. Die Tonlinge der Nacht sind scheuer, aber auch viel hübscher."] },
    { w: "a", p: ["Man sagt, ich sei unheimlich. Dabei habe ich nur Angst vor Hähnen. Die schreien so unmusikalisch."] },
    { w: "night", p: ["Siehst du die Laternli? Die Kleinen mit dem Licht. Sie halten die Tonlinge der Nacht davon ab, sich zu verlaufen. Ich glaube, sie sind Wegweiser."] },
    { w: "m3", p: ["Der Mondschirm taucht nur auf, wenn kein Wind geht. Ich habe ihn einmal gesehen, einen Wimpernschlag lang. Er war lila wie ein Traum."] },
    { w: "gate", p: ["Sie haben das Tor geöffnet? Dann stimmt, was meine Großmutter erzählt hat: Das Urlied beginnt unten, und der Hain ist nur sein Echo."] }
  ],
  boraLoop: [["Leise. Die Nacht ist am schönsten, wenn niemand redet."], ["Tagsüber Tonlinge fangen ist wie Pilze im Hellen suchen: geht auch, macht aber weniger Spaß."], ["Ich habe nachts nie Angst. Nur, wenn es plötzlich still wird."]],

  fenn: [
    { w: "a", p: ["Ich bin viel herumgekommen. Zu den Bergen, ans Meer, sogar auf eine Insel, die so klein war, dass der Wind sie umgerannt hat."] },
    { w: "a", p: ["Überall habe ich dasselbe gehört: Der Wind hat eine Melodie, aber er behält sie nicht. Nur hier oben auf dem Hügel bleibt manchmal etwas von ihr hängen."] },
    { w: "m2", p: ["Windspiele sind die schönsten Tonlinge. Sie sehen aus wie kleine Glocken und klingen wie eine Erinnerung, die man noch nicht hatte."] },
    { w: "m3", p: ["In einer Stadt im Süden habe ich eine Frau getroffen, die das Urlied angeblich vollständig kannte. Sie hat es mir vorgesummt. Ich habe nur die letzte Zeile behalten: Der erste Ton ist der leiseste."] },
    { w: "gate", p: ["Die Höhlen. Dort bin ich nie hingegangen. Der Wind kommt nicht hinein. Ich glaube, ich hatte immer Angst, ohne ihn nur noch ich zu sein."] },
    { w: "m5", p: ["Der Sonnenkern, ja. Die Frau aus dem Süden meinte, er sei kein Tonling. Er sei der Ton, aus dem alle anderen entstanden sind. Wer ihn fängt, hört das ganze Lied auf einmal."] }
  ],
  fennLoop: [["Der Wind dreht. Kommt bestimmt Regen. Oder Besuch."], ["Wenn du dich verläufst, folge dem Wind. Er läuft sich nie fest."], ["Ich erzähle gern. Nur nicht gern dasselbe."]],

  mooma: [
    { w: "a", p: ["Du bist durch die Wand gekommen. Ich habe seit vierzig Jahren niemanden mehr gehört, der so lange gelauscht hat. Das ist selten geworden."] },
    { w: "a", p: ["Das Urlied hatte vier Strophen: Hain, Wind, Wasser und Tiefe. Jede Strophe hat einen Tonling behalten, der alles weiß. Den nennt man den Fabelhaften."] },
    { w: "m1", p: ["Die Moosharfe hat mein Großvater gebaut. Sie hört nicht auf laute Töne. Sie hört auf besondere, auf solche, die man nicht spielen kann, sondern nur treffen."] },
    { w: "m3", p: ["Die Tonlinge sind keine Tiere, mein Kind. Sie sind Wünsche, die ein Ton hatte. Deshalb fangen wir sie nicht, wir hören sie nur lange genug an."] },
    { w: "gate", p: ["Das Tor ist offen? Dann ist es bald so weit. Wer den Sonnenkern fängt, muss ihn nicht behalten. Er will nur gehört werden. Merk dir das."] }
  ],
  moomaLoop: [["Setz dich. Hier hört dich keiner, und das ist gut so."], ["Der Hain wird wieder lauter. Ich spüre es in den Knien."], ["Alte Leute reden langsam, weil sie wissen, dass der Ton noch nachklingt."]],

  kerrin: [
    { w: "a", p: ["Ich baue Instrumente aus Holz, das nie Licht gesehen hat. Höhlenholz wächst langsam, aber es speichert jeden Ton, den es hört."] },
    { w: "a", p: ["Früher habe ich oben im Dorf gearbeitet. Dann habe ich zum ersten Mal die Höhle gehört. Seitdem kann ich nicht mehr zurück. Die Oberwelt ist mir zu laut."] },
    { w: "m5", p: ["Meine Geigen haben keinen guten Ruf. Zu stark, zu sehr. Wer sie spielt, hört Töne, die er nicht hören sollte. Das ist wohl der Preis."] },
    { w: "m6", p: ["Es gibt eine Geige, die ich nie verkauft habe. Sie liegt unter dem Tisch. Ich baue sie seit zwanzig Jahren, und sie wird nicht fertig, weil sie noch nicht weiß, wem sie gehört."] },
    { w: "many", p: ["Du hast schon mehr gefangen als die meisten, die hier waren. Aber nicht aus Gier, das hört man. Das ist die beste Voraussetzung für eine Geige."] }
  ],
  kerrinLoop: [["Hör mal, wie das Holz knackt. Es freut sich über Besuch."], ["Ich stimme gerade um. Das dauert, aber die Höhle wartet."], ["Wer hier unten spielt, spielt nie allein. Die Wände spielen mit."]],

  dunn: [
    { w: "a", p: ["Ich führe Leute durch die Höhlen, seit ich laufen kann. Und seit ich laufen kann, habe ich nie jemanden verloren. Das sind genau null Leute. Drück uns die Daumen."] },
    { w: "m4", p: ["Die Höhlen sind älter als der Hain. Als das Urlied zerbrach, ist der größte Teil hier hinuntergefallen. Deshalb hallt es so."] },
    { w: "m5", p: ["Kristalle sind eingesperrte Töne. Der Saal ist ein Konzert, das nie aufgehört hat. Man muss nur wissen, wann man leise sein muss."] },
    { w: "m6", p: ["Es heißt, ganz unten im Becken wohnt der Sonnenkern. Ich war einmal dort. Es war warm, und ich habe geweint. Frag mich nicht, warum."] },
    { w: "many", p: ["Du bist hartnäckig. Das mag ich. Die meisten gehen nach einem Tag wieder hoch. Du siehst aus, als würdest du hier einziehen."] }
  ],
  dunnLoop: [["Bleib auf den Wegen. Der Rest gehört den Tropfsteinen."], ["Echos lügen nicht, sie wiederholen nur."], ["Wenn es dunkel wird, folge dem Licht. Nicht dem Schatten."]],

  lioba: [
    { w: "a", p: ["Ich sammle Tropfen. Jeder klingt anders, wenn er fällt. Ich habe schon dreihundert. Ich schreibe sie auf, aber niemand liest die Liste."] },
    { w: "a", p: ["Mein Glockenspiel ist aus Tropfstein. Es fehlt nur ein Ton. Einer, den man nicht kaufen kann. Ein singender Hall."] },
    { w: "m5", p: ["Die Höhle erzählt, wenn man still ist. Gestern hat sie gesagt: Bald kommt jemand, der hören kann. Ich habe gelacht. Und dann bist du gekommen."] },
    { w: "m6", p: ["Das Becken singt nachts am schönsten. Man sitzt am Rand und hört, wie sich ein ganzes Lied selbst erinnert."] }
  ],
  liobaLoop: [["Tropf. Tropf. Tropf. Ich liebe diese Stelle."], ["Wenn du still bist, hörst du die Höhle atmen."], ["Hast du schon mal einem Tropfen zugesehen? Er fällt langsamer, als er aussieht."]],

  stimmer: [
    { w: "a", p: ["Ich war der Stimmer des Urlieds, bevor es zerbrach. Meine Aufgabe war, dass alles zusammenpasst.", "Als es zerbrach, habe ich mich hierher zurückgezogen. Und die Gabel behalten."] },
    { w: "m7", p: ["Du hast den Sonnenkern gehört. Dann weißt du, wie der Anfang klingt. Die Urgabel schlägt genau diesen Ton an, nur dass sie ihn halten kann."] },
    { w: "many", p: ["Viele fangen Tonlinge. Wenige hören ihnen zu. Die Gabel gehört dem, der zuhört, auch wenn es hundert Mal nichts zu hören gibt."] }
  ],
  astra: [
    { w: "a", p: ["Ich bin Astra, die Hüterin der Sternwarte. Seit Generationen hören wir hier dem Himmel zu.", "Das Urlied hatte nicht nur vier Strophen. Die fünfte ist nach oben gestiegen, als es zerbrach. Hier singt sie noch."] },
    { w: "a", p: ["Unter uns klingt alles tief und rund. Hier oben klingt es hoch und weit. Deshalb brauchst du ein gutes Instrument und flinke Hände. Die Tonlinge hier sind schneller als alles, was du kennst."] },
    { w: "m9", p: ["Man erkennt Sternenhöhe-Tonlinge am Glitzern. Sie sind weniger scheu, aber unglaublich flink. Mit einem guten Instrument werden sie leichter zu halten."] },
    { w: "m10", p: ["Mein Teleskop zeigt mir manchmal etwas, das ich nicht erklären kann: einen Stern, der zurückschaut. Ich glaube, es ist der letzte Ton des Urlieds."] },
    { w: "m12", p: ["Im Osten, hinter dem Nordlichtgrat, gibt es eine Wand, die nicht ganz wie Stein klingt. Die Hüterin wohnt dort. Aber sie lässt nur jemanden herein, der wirklich lauscht."] },
    { w: "m13", p: ["Der Weltenstern. Ich habe ihn nur einmal gesehen, in einer klaren Nacht. Er sah aus wie ein Kompass, der in jede Richtung gleichzeitig zeigt."] }
  ],
  astraLoop: [["Der Himmel ist heute klar. Das ist immer ein gutes Zeichen."], ["Sterne sind Töne, die zu weit weg sind, um sie zu verstehen."], ["Wenn du nach oben schaust, schaut ein bisschen was zurück."]],
  pim: [
    { w: "a", p: ["Pim, Händler auf Wolken. Ich verkaufe, was ich unterwegs finde. Und manchmal, was ich selbst baue.", "Das Wolkenhorn zum Beispiel. Ein Wind-Instrument, aber eines, das den Wind nicht ärgert."] },
    { w: "a", p: ["Mein Stand schwebt nicht, auch wenn er so aussieht. Der Boden hier ist nur sehr weich. Zumindest sage ich das den Kunden."] },
    { w: "m10", p: ["Das Horn ist teuer, ich weiß. Aber es klingt, als würde ein ganzer Berg Hallo sagen. Das ist doch etwas wert."] }
  ],
  pimLoop: [["Brauchst du etwas? Ich habe ein Horn. Ein einziges. Das ist Exklusivität."], ["Preise sind wie Wolken: Sie ändern sich, wenn man nicht hinschaut. Meine nicht."], ["Wer hoch hinaus will, braucht gute Ausrüstung. Oder gute Ausreden."]],
  selene: [
    { w: "a", p: ["Ich lebe am Mondsee, seit der Mond zum ersten Mal in ihm gebadet hat. Er hat sich nie beschwert."] },
    { w: "a", p: ["Mondlinge sind das, was übrig bleibt, wenn der Mond beim Baden einschläft. Ein bisschen Licht, ein bisschen Traum. Sie lassen sich nur nachts blicken."] },
    { w: "m11", p: ["Die Sternenharfe spanne ich mit Saiten aus Mondlicht. Dafür braucht es die Aurorella. Sie ist das Licht, das das Nordlicht vergessen hat, mitzunehmen."] },
    { w: "m12", p: ["Wenn du den Weltenstern jagst, denk dran: Er ist kein Gegner. Er ist ein Gast, der wartet, bis jemand die Tür aufmacht."] }
  ],
  seleneLoop: [["Psst. Der See hört zu."], ["Mondlicht ist das leiseste Instrument. Und das ehrlichste."], ["Ich zähle nicht die Nächte. Ich höre sie."]],
  nox: [
    { w: "a", p: ["Ich bin Nox. Ich bin hier, weil es nachts ruhig ist. Die Käuze und ich verstehen uns."] },
    { w: "a", p: ["Nachtkäuze sind schlau. Sie wissen, wo du bist, bevor du es weißt. Wenn du einen fängst, hat er das erlaubt."] },
    { w: "m10", p: ["Tagsüber schlafe ich hinter dem Mondsee. Wenn du mich suchst, such nachts."] }
  ],
  noxLoop: [["Hm."], ["Wer lange wach bleibt, hört mehr. Und versteht weniger."], ["Eulen sind keine Tiere. Sie sind aufmerksame Gedanken."]],
  gero: [
    { w: "a", p: ["Ich lebe auf dem Gewitterkamm, weil mir Ruhe zu laut ist. Hier knallt wenigstens etwas ehrlich."] },
    { w: "a", p: ["Blitzlinge sind schnell wie ein Wimpernschlag. Wenn du einen fängst, hat er kurz überlegt, ob er bleibt."] },
    { w: "m11", p: ["Meine Klangschale habe ich im Gewitter gestimmt. Seitdem hört sie jeden Ton genauer, aber ruhiger. Eine gute Kombination, finde ich."] }
  ],
  geroLoop: [["Hörst du das Grollen? Das ist mein Lieblingslied."], ["Wer zu viel redet, übertönt den Donner."], ["Ich rede nicht viel. Aber ich höre viel. Das reicht."]],
  wenzel: [
    { w: "a", p: ["Ich bin Wenzel, Kometenjäger. Gut, ich habe noch nie einen gefangen, aber ich bin sehr beschäftigt."] },
    { w: "a", p: ["Kometarien sind die schnellsten Tonlinge auf dem Grat. Sie ziehen einen Schweif hinter sich her, der nach Sternenstaub riecht."] },
    { w: "m12", p: ["Man sagt, der Weltenstern sei der Ursprung aller Kometen. Wenn du ihn siehst, sag ihm, dass ich geschrieben habe."] }
  ],
  wenzelLoop: [["Der Grat ist schmal. Aber das macht ihn nicht weniger sicher."], ["Kometen sind Fremde, die nie bleiben. Das mag ich an ihnen."], ["Ich warte noch auf ein Zeichen. Seit zwölf Jahren."]],
  hueterin: [
    { w: "a", p: ["Du bist durch die Wand gekommen. Die meisten gehen daran vorbei, weil sie zu laut denken.", "Ich bin die Hüterin des Weltenlieds. Das Ende des Urlieds. Nicht die Töne, aus denen es bestand, sondern die Stille zwischen ihnen."] },
    { w: "m12", p: ["Der Weltenstern ist der Schlusston. Wer ihn fünfmal fängt, hat das Lied nicht nur gehört, sondern ein Stück davon in sich aufgenommen. Das ist nicht leicht, und es soll nicht leicht sein."] },
    { w: "m13", p: ["Die Weltenorgel kann alles spielen, was je gespielt wurde. Das ist Segen und Last. Denk daran, wenn du sie hältst."] }
  ],
  hueterinLoop: [["Das Lied hört dich schon."], ["Stille ist auch ein Ton. Der längste."], ["Fünf Mal. Nicht, weil es nötig ist. Weil es richtig ist."]],
  rufus: [
    { w: "a", p: ["Ich habe als Kind einen Klumpen Ton am Teich gefunden und geglaubt, er singt. Er hat tatsächlich gesungen, aber nur, weil ein Frosch drin saß.", "Seitdem forme ich Töne, die man in der Hand halten kann."] },
    { w: "m2", p: ["Man muss Ton mit Gefühl kneten. Zu fest und er wird stumm, zu locker und er zerfällt in Quietscher."] }
  ],
  rufusLoop: [["Eine Ocarina ist wie ein Tonling: klein, rund und überraschend laut."], ["Wenn der Ton klemmt, hilft Wasser. Und Geduld."]],
  brum: [
    { w: "a", p: ["Ich fälle keine Bäume. Ich frage sie. Manche sagen ja, manche nicht. Die, die ja sagen, werden Trommeln."] },
    { w: "m3", p: ["Im Wald trommelt es nachts manchmal von allein. Ich glaube, die Bäume üben."] }
  ],
  brumLoop: [["Ein Fell, ein Stamm, ein Herz. Mehr braucht ein Takt nicht."], ["Wenn du im Wald ein Pochen hörst, bleib stehen. Es kommt gleich der Nächste."]],
  gilda: [
    { w: "a", p: ["Die Kalimba habe ich im Pilzgarten erfunden. Die Pilze sind begeisterte Zuhörer, aber schlechte Kritiker."] },
    { w: "m5", p: ["Hier unten tropft alles im Dreiertakt. Ich glaube, die Höhle will tanzen und weiß nicht, wie."] }
  ],
  gildaLoop: [["Zupf links, zupf rechts. Das Glück sitzt in der Mitte."], ["Manchmal klingt eine Zinke zweimal. Dann hat man doppelt Glück gehabt."]],
  orla: [
    { w: "a", p: ["Kristalle sind Töne, die vergessen haben, wie man vergeht. Ich schneide sie zu Röhren und bringe sie zum Reden."] },
    { w: "m6", p: ["Im Saal klingt jeder Kristall anders. Wenn du einen findest, der in Moll singt, sag mir Bescheid."] }
  ],
  orlaLoop: [["Eine Panflöte hört auf jede Frequenz. Man muss nur wissen, welche Röhre man anpustet."], ["Kristallo hat eine ganz klare Stimme. Fast wie ein Glöckchen aus Eis."]],
  zeno: [
    { w: "a", p: ["Glas singt, wenn man es reibt. Wasser macht den Ton weicher. Beides zusammen macht die Welt ruhig."] },
    { w: "m10", p: ["In der Sternenhöhe ist die Luft dünn, aber die Stille ist dick. Ideal für eine Harmonika."] }
  ],
  zenoLoop: [["Nicht husten. Das Glas hört alles."], ["Wolkenwale singen tief. Sie wissen, dass man tiefer geht, wenn man sich Zeit lässt."]],
  mira: [
    { w: "a", p: ["Ich sammle Muscheln, seit ich laufen kann. Jede trägt ein Echo des Meeres in sich. Und jedes Echo ist ein bisschen anders.", "Wenn du hier bleibst, hörst du bald, dass das Meer ein Chor ist."] },
    { w: "m14", p: ["Das Rauschmeer ist größer, als es aussieht. Strand, Riff, Becken, Wrack und ganz unten der Tiefenschlund. Fünf Orte, fünf Stimmen."] },
    { w: "m16", p: ["Die Gezeiten sind kein Zufall. Sie sind der Takt des Meeres. Wer ihn trifft, fängt auch seine Tonlinge."] },
    { w: "m18", p: ["Es gibt hier Tonlinge, die schimmern anders als andere. Gläsern, funkelnd, sternklar. Mutationen. Der Weg zur Letzten Strophe führt über sie."] },
    { w: "m19", p: ["Du hast den Abgrundton gehört. Aber das Meer singt noch weiter. Es gibt jemanden hinter einer Wand im Korallenwald, der an einer Strophe schreibt, die niemand zu Ende gebracht hat."] }
  ],
  miraLoop: [["Das Meer ist nie still. Es übt nur leiser."], ["Wenn du eine Muschel ans Ohr hältst, hörst du nicht das Meer. Du hörst deinen eigenen Takt."], ["Pass auf die Flut auf. Sie nimmt gern Schuhe mit."]],
  tarn: [
    { w: "a", p: ["Ich verkaufe Muscheln, aber eigentlich verkaufe ich Zuhören. Das merkt nur keiner."] },
    { w: "m15", p: ["Die Rauschmuschel ist mein bestes Stück. Wer lange genug hineinhört, sieht Funken. Das ist keine Lüge, das ist Physik."] }
  ],
  tarnLoop: [["Preise sind wie Ebbe: Sie gehen runter, aber nie weit genug."], ["Eine schöne Muschel verkauft sich selbst. Eine schiefe auch, wenn man sie lange genug lobt."]],
  korin: [
    { w: "a", p: ["Korallen wachsen so langsam, dass man ihnen beim Singen zuhören kann. Man muss nur ein paar Jahre warten."] },
    { w: "m16", p: ["Im Riff gibt es Quallos, die schimmern wie Seifenblasen. Manche schimmern anders. Die sind etwas Besonderes."] }
  ],
  korinLoop: [["Das Riff ist wie ein Orchester, das nie aufhört zu stimmen."], ["Wenn du dich verläufst, folge dem Rosa. Es führt immer zum Rand."]],
  ebbe: [
    { w: "a", p: ["Ich bin die Gezeitenhüterin. Das heißt, ich passe auf, dass das Wasser immer zurückkommt. Meistens klappt das."] },
    { w: "m16", p: ["Mein Gezeitenrohr atmet im Takt des Meeres. Wenn du es spielst, hörst du die Welle, bevor sie kommt."] }
  ],
  ebbeLoop: [["Ebbe und Flut. Mehr Philosophie braucht man nicht."], ["Das Wasser ist geduldig. Du solltest es auch sein."]],
  hake: [
    { w: "a", p: ["Ich war mal Kapitän. Dann kam ein Sturm und nahm mir das Schiff. Der Sturm hat es hier abgestellt, damit ich was zum Wohnen habe. Höflich, eigentlich."] },
    { w: "m17", p: ["Nachts hört man im Wrack Stimmen. Die Mannschaft singt, und der Krake singt mit. Er ist der Einzige, der den Ton trifft."] }
  ],
  hakeLoop: [["Arr. Ein Schiff geht unter, aber ein Lied nie."], ["Mein Kompass zeigt nicht Norden. Er zeigt Heimweh."]],
  tiefa: [
    { w: "a", p: ["Ich tauche, seit ich denken kann. Unten gibt es Lichter, die keinen Namen haben. Ich nenne sie Tiefenlichter, weil sie so aussehen."] },
    { w: "m17", p: ["Im Tiefenschlund wohnt ein König. Er sitzt auf einem Thron aus Muscheln und hat genug Zeit, uns alle zu überdauern."] }
  ],
  tiefaLoop: [["Atmen ist überbewertet. Zuhören nicht."], ["Wenn du nach unten schaust und es blau leuchtet, bist du richtig."]],
  saenger: [
    { w: "a", p: ["Das Urlied hatte eine letzte Strophe. Sie wurde nie gesungen, weil niemand mehr da war, der sie kannte.", "Ich sammle sie. Zeile für Zeile. Jede steckt in einem Tonling, der anders ist als die anderen: gläsern, funkelnd, sternklar."] },
    { w: "l3", p: ["Funkelnde Töne sind die Sprünge im Takt. Sie klingen, als würde das Lied kurz stolpern und sich dann besonders freuen."] },
    { w: "l5", p: ["Es gibt Töne, die in dir etwas wecken. Sie sind golden, und sie haben ein Funkeln, das nicht von dieser Welt ist."] },
    { w: "l6", p: ["Eine Zeile noch. Die Rote. Man sagt, sie lebt tief versteckt in den Höhlen, in der Sternenhöhe und im Meer, und sie trägt manchmal ein Gewand aus Glas oder Funken. Wenn du sie fängst, ist die Strophe fertig."] }
  ],
  saengerLoop: [["Eine Zeile, noch eine Zeile. Das Lied ist größer, als ich dachte."], ["Ich bin nicht traurig. Ich bin nur noch nicht fertig."], ["Wenn du fertig bist, singen wir die Strophe gemeinsam."]],
  stimmerLoop: [["Ein Ton, der zu laut ist, hört sich nicht mehr selbst."], ["Geduld ist auch ein Instrument."], ["Hundert Versuche sind kein Umweg. Sie sind der Weg."]],
  echo: [
    { w: "a", p: ["Ich bin lange hier… lange hier… Die Wand hat dich gehört… gehört…"] },
    { w: "a", p: ["Vor langer Zeit war ich ein Sänger… Sänger… Dann habe ich einen Ton gehört, der zu schön war… zu schön… Seitdem höre ich nur noch ihn… ihn…"] },
    { w: "m5", p: ["Die Höhle erinnert sich… erinnert sich… an jeden, der hier war… hier war… Auch an dich… dich…"] },
    { w: "m6", p: ["Der Sonnenkern singt nicht für dich… für dich… Er singt für den, der zuhört… zuhört… Das ist ein Unterschied… Unterschied…"] }
  ],
  echoLoop: [["Still… still… still…"], ["Hörst du es… es… es…"], ["Ich bleibe… bleibe… bleibe…"]]
};

/* Quest-Dialoge: offer = Angebot, remind = Erinnerung, done = Abgabe, locked = noch nicht erfahren genug */
const QX = {
  m1: { offer: ["Ich bin Tilda, und du bist der Neuankömmling. Willkommen im Klanghain.", "Hier fängt man keine Tiere. Man hört Tönen zu, und manchmal hört einer zurück. Das sind die Tonlinge.", "Nimm die Holzflöte. Fang drei Stück. Spiel, wenn der Ring die Marke trifft, find die Frequenz und halte den Tonling in der Zone."],
        remind: "Na, noch nicht drei? Lass dir Zeit. Ein guter Fang ist wichtiger als ein schneller.", done: ["Drei! Und dabei hast du nicht ein einziges Mal geflucht.", "Hier, ein bisschen Startkapital. Wir sehen uns."] },
  m2: { locked: "Heute noch nicht. Hör dich erst ein bisschen um, der Hain erzählt dir mehr als ich.", offer: ["Nicht jeder Tonling ist gleich. Manche leuchten kräftiger, manche klingen voller.", "Bring mir drei, die mindestens ungewöhnlich sind. Das erkennst du an der grünen Farbe."],
        remind: "Drei Ungewöhnliche. Such nach grünen Sternen.", done: ["Du hast ein Ohr dafür. Ich sage das nicht oft.", "Bald brauchst du aber ein besseres Instrument, sonst hörst du nur das Gewöhnliche."] },
  m3: { locked: "Du hörst schon ganz gut, aber noch nicht gut genug für das, was ich vorhabe. Komm später wieder.", offer: ["Die leiseren Töne liegen höher. Dafür braucht dein Instrument mehr Feingefühl. Frag Marlo nach einer Laute, oder bau dir selbst etwas.", "Bring mir drei seltene Tonlinge. Blau sind sie, und sie flüchten schneller als die anderen. Und wenn dein Ring genau auf der Marke sitzt, glänzt es: das üben wir gleich mit."],
        remind: "Seltene sind rar, sonst hießen sie nicht so. Gib nicht auf.", done: ["Drei Blaue. Der Hain kennt dich jetzt.", "Ich glaube, du bist bereit für mehr als nur Fangen. Hör gut zu, wenn ich dir von den Höhlen erzähle."] },
  m4: { locked: "Es gibt etwas, das ich dir zeigen will. Aber du bist noch nicht so weit. Hab Geduld.", offer: ["Unter dem Hain liegen die Glimmerhöhlen. Das Tor ist seit Ewigkeiten zu. Es öffnet sich nur für den, der einen prächtigen Tonling fängt, einen lilafarbenen.", "Such ihn an windigen Orten, oder nachts am Teich. Und lass dir Zeit. So einer lässt sich nicht hetzen. Außerdem will das Tor ein Opfer: ein paar Noten, ein paar Tonlinge, und ein sauberer Fang."],
        remind: "Ein lilafarbener, mehr will das Tor nicht. Er singt irgendwo, nur nicht vor deiner Nase.", done: ["Prächtig! Ich habe zehn Jahre darauf gewartet, so etwas zu sehen.", "Ich öffne das Tor. Du findest es am Südrand der Wiese, hinter dem Weg. Geh vorsichtig, und nimm dir Zeit."] },
  m5: { locked: "Es ist noch zu früh für dich, hier unten wird es ernst. Üb noch ein bisschen.", offer: ["Ich bin Dunn. Ich kenne jeden Stein, jeden Tropfen. Und ich merke sofort, wer zum ersten Mal hier ist.", "Hier hallt alles. Töne sind lauter, Tonlinge scheuer. Fang zehn und lern die Arten kennen, damit du dich an die Tiefe gewöhnst."],
        remind: "Zehn Tonlinge, sechs Arten. Die Höhle zählt mit.", done: ["Zehn. Gut gemacht, die Höhle hat dich akzeptiert.", "Ab jetzt hörst du auch die leiseren Töne. Pass auf, dass du nicht süchtig wirst."] },
  m6: { locked: "Der Saal und das Becken sind noch nichts für dich. Wenn du so weit bist, merkst du es selbst.", offer: ["Im großen Saal und im Becken leben die seltenen Tonlinge. Der Kristallo, der Dunkelwisp, der Hallsänger, sie alle brauchen ein starkes Instrument.", "Bring mir fünf seltene. Dazu brauche ich vier gewöhnliche aus der Höhle, und Kerrin braucht Funzel zum Eichen. Dann reden wir über das Größte."],
        remind: "Fünf Seltene, mindestens. Such im Saal und im Becken.", done: ["Fünf! Kerrin hat mir erzählt, dass nur wenige das schaffen.", "Jetzt fehlt nur noch das Größte. Ich verrate dir, wo es ist: ganz unten im Becken."] },
  m7: { locked: "Der goldene Ton ist kein Spiel. Komm wieder, wenn die Höhle dich besser kennt.", offer: ["Es heißt, im Becken singt ein Sonnenkern. Ein fabelhafter Tonling, gelb wie ein erster Morgen.", "Wenn du ihn fängst, hast du alles gesehen, was es bisher gibt. Und ich glaube, er wartet schon. Im Osten liegt in einer Nebenhöhle ein Sonnensplitter. Den brauche ich auch."],
        remind: "Der Sonnenkern, nichts weniger. Er singt im Becken, wenn man still ist.", done: ["Du hast ihn. Ich hätte nie gedacht, dass ich das noch erlebe.", "Ich höre es schon: Der Hain singt wieder. Die Töne finden zueinander.", "Aber das ist noch nicht das Ende. Hinter dem Klangbecken wartet ein Tor, das noch nie jemand geöffnet hat. Frag mich nach dem Sternenpfad."] },

  m8: { locked: "Der Weg zum Sternentor ist weit und schwer. Komm wieder, wenn du dich in der Höhle wirklich auskennst und Level 22 erreicht hast.", offer: ["Hinter dem Klangbecken gibt es eine Wand mit einem Stern drauf. Das Sterntor. Es war immer verschlossen.", "Ich habe es oft versucht. Es öffnet nur für den, der die Höhle in allen Facetten kennt: sechs Seltene, drei bemooste Töne, Dunkelwisps in der Nacht und die Hallsänger.", "Für das Moos brauchst du die Moosharfe von Mooma. Sie lockt es an. Das wird kein Spaziergang, aber dann zeig ich dir, wie es weitergeht."], remind: "Sechs Seltene, drei Bemooste, drei Dunkelwisps und drei Hallsänger, dazu alles andere auf der Liste. Das Sterntor wartet.", done: ["Alles beisammen. Dann los, öffnen wir das Tor.", "Du findest es am Südende des Klangbeckens. Geh hinein. Dahinter beginnt die Sternenhöhe. Ich war noch nie dort, aber du gehst hin, nicht wahr?"] },
  m9: { locked: "Die Sternwarte braucht Leute, die schon etwas gehört haben. Komm später wieder.", offer: ["Du kommst von unten, das merke ich am Staub. Willkommen in der Sternenhöhe, ich bin Astra.", "Hier oben ist alles schneller. Die Tonlinge sind flink, und ihre Töne liegen hoch. Fang fünf, damit du dich daran gewöhnst."], remind: "Fünf Tonlinge, egal welche. Hier oben ist jeder ein Anfang.", done: ["Fünf! Du hast ein gutes Gespür. Hier, ein Anfang.", "Das war aber nur das Aufwärmen. Wenn du so weit bist, hole ich dir ein Fernglas und zeige dir, was wirklich hier oben wohnt."] },
  m10: { locked: "Noch nicht. Gewöhn dich erst an die Höhe.", offer: ["Nachts ist die Sternenhöhe ein Konzert. Nachtkäuze, Mondlinge, Wolkenwale. Sie sind besser als das, was du bisher gefangen hast.", "Fang vier ungewöhnliche. Es dürfen auch bessere sein."], remind: "Vier Ungewöhnliche. Such sie nachts, dann sind sie hellwach.", done: ["Vier! Und keiner hat sich beschwert.", "Du hast mir gezeigt, dass du Geduld hast. Das braucht man hier."] },
  m11: { locked: "Die seltenen Töne hier oben sind nichts für Anfänger.", offer: ["Auf dem Gewitterkamm blitzt es, auf dem Nordlichtgrat leuchtet es. Dort wohnen Blitzlinge und Lichtfüchse.", "Bring mir drei seltene. Nimm ein gutes Instrument mit, sie sind schnell."], remind: "Drei Seltene, blau. Gewitterkamm und Nordlichtgrat.", done: ["Drei Seltene! Der Hain hat dich zu Recht geschickt.", "Jetzt wird es ernst. Das Nächste ist prächtig."] },
  m12: { locked: "Dafür ist es noch zu früh. Die Prächtigen hier oben sind ein anderes Kaliber.", offer: ["Aurorella und Kometarius. Sie sind prächtig, aber auch flinker als alles, was du bisher gefangen hast.", "Fang zwei. Dann reden wir über das, was wirklich in der Sternenhöhe wohnt."], remind: "Zwei Prächtige, lila. Aurorella nachts, Kometarius immer.", done: ["Zwei Prächtige! Ich habe seit Jahren keine gesehen.", "Hör zu: Es gibt jemanden hinter dem Nordlichtgrat, im Osten. Eine Wand, die nicht wie Stein klingt. Sie wartet auf jemanden wie dich."] },
  m13: { locked: "Der Schlusston ist nichts für Ungeduldige. Gewöhn dich erst an die Höhe.", offer: ["Der Weltenstern. Ich habe ihn einmal gesehen, in einer klaren Nacht. Er stand direkt über dem Nordlichtgrat.", "Fang ihn. Wenn du das schaffst, hast du alle Strophen des Urlieds gehört. Ich glaube, er wartet auf dich."], remind: "Der Weltenstern. Nordlichtgrat. Gelb wie ein Kompass.", done: ["Du hast ihn. Ich hätte nie gedacht, dass ich das erlebe.", "Hörst du? Das ganze Lied. Hain, Wind, Wasser, Tiefe und Himmel. Alles passt zusammen.", "Danke. Für dich und für uns alle.", "Aber hörst du das Rauschen? Am Südende des Nordlichtgrats hat sich ein Tor aus Muscheln geöffnet. Dahinter liegt das Meer. Frag dort nach Mira."] },
  q_nox: { locked: "Komm, wenn du länger wach sein kannst.", offer: ["Nachtkäuze sind scheu. Aber sie mögen Leute, die leise sind. Fang zwei für mich.", "Nur nachts. Tagsüber sind sie nicht da. Oder sie tun nur so."], remind: "Zwei Nachtkäuze, nachts. Leise sein.", done: ["Zwei! Sie haben nicht geschimpft. Das ist ein Kompliment.", "Hier, für die Mühe."] },
  q_selene: { locked: "Der See ist heute noch zu still für dich.", offer: ["Mondlinge sind Licht, das nachts aus dem See steigt. Fang drei. Aber sanft, sonst gehen sie kaputt.", "Nur nachts, am Mondsee oder auf dem Nordlichtgrat."], remind: "Drei Mondlinge. Sie schimmern wie Milch.", done: ["Drei. Und sie sind alle noch heil. Ich bin beeindruckt.", "Wenn du Lust hast, habe ich noch eine Aufgabe für dich. Eine größere."] },
  q_selene2: { locked: "Dafür brauchst du mehr Erfahrung. Die Aurorella ist ein Schatten aus Licht.", offer: ["Ich spanne Saiten aus Mondlicht. Aber für die Sternenharfe brauche ich noch den Ton einer Aurorella.", "Sie lebt nachts auf dem Nordlichtgrat. Fang eine, und die Harfe gehört dir."], remind: "Eine Aurorella. Nachts, Nordlichtgrat.", done: ["Sie leuchtet ja noch. Wunderschön.", "Hier ist deine Sternenharfe. Sie hört auf Sterne, nicht auf Hände."] },
  q_gero: { locked: "Das Gewitter will gerade nicht. Später.", offer: ["Ich stimme eine Klangschale im Gewitter. Sie braucht den Ton von zwei Blitzlingen.", "Bring mir zwei. Sie sind flink wie ein Wimpernschlag. Pass auf, dass du nicht vom Donner erschreckt wirst."], remind: "Zwei Blitzlinge. Sie sind gelb wie Funken.", done: ["Zwei! Und du hast nicht einmal geschrien.", "Hier, die Klangschale. Sie macht jeden Ton ruhiger."] },
  q_wenzel: { locked: "Der Komet ist noch zu schnell für dich.", offer: ["Ich jage Kometen, aber nie hat einer gebremst. Du schaffst das vielleicht.", "Fang einen Kometarius. Dann glaube ich dir alles."], remind: "Ein Kometarius. Gewitterkamm oder Nordlichtgrat.", done: ["Du hast einen. Einen echten!", "Ich glaube, ich habe vor zwölf Jahren zu früh aufgegeben. Hier, Belohnung."] },
  q_hueterin: { locked: "Du hörst schon viel, aber noch nicht genug. Komm wieder, wenn du den Anfang des Weltenlieds gehört hast.", offer: ["Du hast die Wand überhört, aber nicht ganz. Das gefällt mir.", "Das Weltenlied endet mit dem Weltenstern. Fünf Mal. Nicht, weil es nötig ist. Weil es richtig ist.", "Die Weltenorgel gehört dem, der ihn fünf Mal gehört hat. Das wird dauern. Hunderte Versuche, vielleicht Tausende."], remind: "Fünf Weltensterne. Nordlichtgrat. Geduld ist auch ein Instrument.", done: ["Fünf Mal. Du bist wirklich gekommen.", "Die Weltenorgel hört alles auf einmal. Spiel sie mit Bedacht.", "Das Lied ist nicht zu Ende. Es hat nur einen neuen Anfang."] },
  q_okko: { locked: "Ich brauche Ruhe, nicht Gesellschaft. Komm später wieder.", offer: ["Ich schnitze Pfeifen aus Teichschilf. Aber ohne Nebeline zum Einstimmen klingen sie wie Gänse.", "Nebeline leben im Wald und am Teich. Bring drei, dann bekommst du eine Schilfpfeife. Und meine alte Pfeife habe ich auf einer Lichtung im Osten verloren. Such sie."], remind: "Nebeline. Drei Stück, und meine Pfeife. Sie sind grau wie Morgennebel.", done: ["Hör dir das an. Hm. Gut.", "Hier. Die Pfeife. Pass auf, dass sie nicht quietscht."] },
  q_bora: { locked: "Ich suche jemanden, der Nächte mag. Du bist noch nicht ganz so weit, glaub ich.", offer: ["Nachts leuchtet im Wald eine kleine Laterne, die keine ist. Ein Laternli. Sie führt Verirrte, aber nicht mich, ich bin nie verirrt.", "Fang zwei für mich. Ich will sehen, wie sie von nah aussehen."], remind: "Nachts, im Wald oder auf dem Hügel. Such das kleine Licht.", done: ["So hell! Und so klein.", "Ich lasse es nach der Nacht wieder frei. Nimm das hier, als Dank."] },
  q_marlo: { locked: "Ich nähe nebenbei. Aber erst mal solltest du dich im Hain umsehen. Komm später wieder.", offer: ["Ich nähe nebenbei, wenn gerade keiner etwas kauft. Für Stoffmuster brauche ich Farben, die man nicht im Laden findet.", "Fang mir vier ungewöhnliche Tonlinge, grün oder besser. Dann bekommst du von mir eine neue Garderobe, so viel du willst."], remind: "Vier Ungewöhnliche, mindestens grün. Ich messe so lange Maß an der Tür.", done: ["Die sind ja wunderbar. Schau dir die Farbe an.", "Ab jetzt kannst du jederzeit zu mir kommen. Haare, Hut, Kleidung, alles. Sag einfach Bescheid."] },
  q_ysa: { locked: "Mein Takt ist besser als dein Gehör, und das bleibt vorerst so. Komm später wieder.", offer: ["Mein Takt ist besser als dein Gehör. Beweis mir das Gegenteil.", "Bring mir vier seltene Tonlinge und triff dreimal den Ring perfekt, dann baue ich dir eine Schellentrommel, auf der du endlich im Takt triffst."], remind: "Vier Seltene. Blaue. Ich habe nicht ewig Zeit.", done: ["Gutes Händchen. Muss man dir lassen.", "Hier ist deine Trommel. Und jetzt trommel gefälligst ordentlich."] },
  q_mooma: { locked: "Dir fehlt noch etwas, mein Kind. Nicht Mut, sondern Gehör. Komm wieder, wenn du länger gelauscht hast.", offer: ["Du hast die Wand gehört, mein Kind. Das schaffen wenige.", "Bring mir drei Tautropfen vom Teich, und die Moosharfe gehört dir. Sie ist alt, aber sie hört gut."], remind: "Drei Tautropfen. Sie sind blau wie Morgentau.", done: ["Sie hört nur auf besondere Lieder. Spiel sie mit Bedacht.", "Und vergiss nie, wer sie dir gegeben hat. Das ist keine Bitte, das ist ein Rat."] },
  q_fenn: { locked: "Der Wind mag dich, aber noch nicht genug. Probier es später.", offer: ["Auf dem Hügel singt der Wind. Und manchmal singt etwas mit.", "Bring mir zwei Windspiele. Ich möchte hören, ob sie so klingen wie in meiner Erinnerung."], remind: "Zwei Windspiele. Sie klingen wie eine kleine Glocke, die der Wind hält.", done: ["Es klingt noch nach. Hörst du das?", "Hier, für deine Mühe. Und danke. Das war mehr, als du denkst."] },
  q_lioba: { locked: "Mein Glockenspiel braucht jemanden, der mehr gehört hat als du bisher. Aber bald.", offer: ["Mein Glockenspiel ist fertig, bis auf einen Ton. Den muss ein Hallsänger singen.", "Bring mir einen. Er lebt im Becken, im Saal, oder wo es gerade hallt. Und beweis mir, dass du sauber fängst."], remind: "Ein Hallsänger. Blau, mit kleinen Glocken. Du erkennst ihn am Klang.", done: ["Oh. Oh, wie schön. Hörst du das? Jeder Ton fällt wie ein Tropfen.", "Es gehört dir. Pass gut darauf auf."] },
  q_stimmer: { locked: "Du hast den Anfang noch nicht gehört. Komm wieder, wenn der Sonnenkern in deinem Gedächtnis klingt.", offer: ["Die Urgabel schlägt den ersten Ton des Urlieds an. Ich gebe sie nur dem, der viermal das Fabelhafte gehört hat.", "Vier fabelhafte Tonlinge. Goldkrone oder Sonnenkern, mir ist es gleich. Es werden Hunderte Versuche sein. Das ist kein Fehler im Plan, das ist der Plan."], remind: "Vier Fabelhafte. Gelb. Und Geduld, die ist wichtiger als das Instrument.", done: ["Vier. Viermal der erste Ton. Ich hätte es nicht für möglich gehalten.", "Nimm die Gabel. Schlag sie nicht leichtfertig an."] },
  q_tilda_glas: { locked: "Du hast noch nicht genug gehört. Komm später wieder, ich zeige dir dann etwas Besonderes.", offer: ["Manchmal, ganz selten, ist ein Tonling durchsichtig wie Glas. Gläsern nennt man das. Es ist keine Krankheit, es ist ein Geschenk.", "Fang einen für mich. Ich möchte wissen, wie sein Ton klingt."], remind: "Ein gläserner Tonling. Er schimmert fast unsichtbar.", done: ["Er ist so klar! Man kann durch ihn hindurchsehen.", "Mutationen sind selten und wertvoll. Wenn du mehr davon sammelst, wirst du bald Dinge hören, die sonst keiner hört."] },
  q_rufus: { locked: "Der Ton ist noch nicht trocken. Komm später wieder.", offer: ["Ich forme eine Ocarina, aber mir fehlt der Ton eines Glöcklis. Fang vier, dann gehört sie dir.", "Auf der Wiese und am Windhügel hört man sie läuten."], remind: "Vier Glöckli. Sie klingen wie kleine Glocken.", done: ["Genau der richtige Ton!", "Hier, die Tonocarina. Sie rastet jeden Ton ein, als wäre es ihr eigener."] },
  q_brum: { locked: "Das Holz ist noch nicht gelagert. Komm später wieder.", offer: ["Für eine Trommel brauche ich den Ton von Kräuselin, die tanzen, wenn sie zuhören. Bring mir drei.", "Sie leben im Wald und auf der Wiese."], remind: "Drei Kräuselin. Sie drehen sich beim Gehen.", done: ["Die Takte sitzen. Hör hin: Das ist Holz, das sich freut.", "Die Waldtrommel gehört dir. Schlag sie mit Gefühl."] },
  q_gilda: { locked: "Meine Finger sind heute schon müde. Komm später.", offer: ["Mein neues Instrument hat Zinken, aber keinen Ton. Der Ton von vier Stalagnüssen würde helfen. Und ein paar Noten für den Draht.", "Sie leben im Pilzgarten und im Tropfsteingang."], remind: "Vier Stalagnüsse. Sie rollen sich zusammen, wenn sie erschrecken.", done: ["Zupf! Hörst du das? Es singt!", "Die Glimmer-Kalimba. Manchmal klingt sie zweimal. Nimm sie, sie mag dich."] },
  q_orla: { locked: "Die Kristalle schlafen noch. Komm später.", offer: ["Ich habe sieben Kristallröhren, aber nur sechs Stimmen. Die siebte singt im Kristallo. Bring mir drei, sicherheitshalber. Und eine Röhre ist mir in eine Nebenhöhle im Westen gefallen.", "Du findest die Kristallos im Saal."], remind: "Drei Kristallos und meine Röhre. Sie schimmern blau im Kristallsaal.", done: ["Sieben Stimmen! Jetzt ist es vollständig.", "Die Kristallpanflöte hört jede Frequenz sofort. Gut gemacht."] },
  q_zeno: { locked: "Das Glas ist noch nicht gestimmt. Komm später wieder.", offer: ["Ich reibe Glasränder an, aber der Ton ist zu hart. Wolkenwale singen tiefer. Mit drei von ihnen im Ohr wird er weich.", "Du findest sie am Wolkenpfad und auf dem Gewitterkamm."], remind: "Drei Wolkenwale. Blau und gemütlich.", done: ["Hör nur. Sanft wie ein Atemzug.", "Die Glasharmonika gehört dir. Sie beruhigt jeden Tonling."] },
  q_astra_funkel: { locked: "Noch nicht. Ich möchte, dass du die Sternenhöhe erst richtig kennst.", offer: ["Ein Funkeln, das nicht vom Himmel kommt. Manche Tonlinge tragen es auf dem Körper. Funkelnd heißt das, und es ist ein Zufall von eins zu achtzig.", "Fang einen in der Sternenhöhe. Dann glaube ich, dass du für Größeres bereit bist."], remind: "Ein funkelnder Tonling. Egal welche Art, aber in der Sternenhöhe.", done: ["Er funkelt wirklich! Wie ein Stern, der sich ins Gras gelegt hat.", "Behalte ihn gut. So etwas kommt nicht oft vor."] },

  m14: { locked: "Du hast die Höhe geschafft, aber das Meer ist anders. Komm später wieder.", offer: ["Du bist also der Neue vom Gipfel, mit dem Wind in den Haaren. Ich bin Mira. Willkommen im Rauschmeer.", "Hier klingt alles nach Salz. Fang fünf Tonlinge, damit du dich an die Brandung gewöhnst."], remind: "Fünf Tonlinge, egal welche. Das Meer will dich kennenlernen.", done: ["Fünf! Und keiner hat dich nass gemacht.", "Das war nur der Anfang. Das Meer hat noch mehr Stimmen."] },
  m15: { locked: "Warte, bis du dich ans Salz gewöhnt hast.", offer: ["Am Strand liegt allerlei, auch Tonlinge, die glänzen. Bring mir vier ungewöhnliche, grün oder besser.", "Sie verstecken sich zwischen Muscheln und im Korallenwald."], remind: "Vier Ungewöhnliche, grün. Strand und Riff.", done: ["Vier! Das Meer mag dich.", "Weiter geht es mit Seltenen. Die sind schon schwieriger."] },
  m16: { locked: "Dafür brauchst du mehr Gehör. Die Seltenen hier sind schnell.", offer: ["Im Gezeitenbecken und im Riff leben seltene Töne, die mit der Flut kommen und gehen.", "Fang drei. Nimm ein gutes Instrument mit, Quallos sind zappelig."], remind: "Drei Seltene, blau. Gezeitenbecken, Riff und Tiefe.", done: ["Drei Seltene! Ebbe lächelt schon.", "Jetzt wird es prächtig."] },
  m17: { locked: "Die Prächtigen hier sind nichts für Anfänger.", offer: ["Perlchen, Geisterkraken und der Tiefseekönig. Sie alle sind prächtig und alle schwer zu erwischen.", "Bring mir zwei von ihnen, und ich glaube, du hast das Meer verstanden."], remind: "Zwei Prächtige, lila. Perlchen tagsüber, Geisterkraken nachts.", done: ["Zwei Prächtige! Ich habe hier seit Jahren keine gesehen.", "Aber es gibt etwas, das nur wenige schaffen: ein Prächtiger, der gleichzeitig mutiert ist."] },
  m18: { locked: "Die Mutationen sind zu launisch für dich. Üb noch ein bisschen.", offer: ["Manche Tonlinge sind gläsern, funkelnd oder sternklar. Mutationen. Sie sind selten, aber beim Fang gibt es immer eine kleine Chance.", "Bring mir einen Prächtigen mit Mutation. Das ist schwer. Aber du hast schon Schwereres geschafft."], remind: "Ein prächtiger Tonling, der gläsern, funkelnd oder sternklar ist. Im Rauschmeer.", done: ["Er schimmert so schön! Und er ist prächtig dazu.", "Der letzte Ton meiner Liste ist der schwerste: der Abgrundton."] },
  m19: { locked: "Der Abgrundton ist nichts für Ungeduldige.", offer: ["Die Urperle singt im Gezeitenbecken, die Abgrundsonne tief im Schlund. Beide sind fabelhaft, beide gelb wie ein erster Morgen.", "Fang eine von ihnen. Dann hast du das Meer gehört."], remind: "Die Urperle im Gezeitenbecken oder die Abgrundsonne im Tiefenschlund.", done: ["Du hast es geschafft. Das Meer verbeugt sich.", "Ich habe dir nichts mehr beizubringen. Aber hinter einer Wand im Korallenwald wartet jemand, der an der letzten Strophe arbeitet. Hör genau hin."] },
  q_tarn: { locked: "Der Strand ist noch nicht dein Revier. Komm später.", offer: ["Ich sammle Muschlinge, das sind kleine Muscheln mit Ohren. Bring mir sechs, ich brauche sie für meine Stände.", "Du findest sie am Strand und im Becken."], remind: "Sechs Muschlinge. Sie sehen aus wie rosa Hüte.", done: ["Sechs! Und alle noch heil.", "Danke dir. Das war ordentlich."] },
  q_korin: { locked: "Das Riff ist noch zu empfindlich für dich. Komm später.", offer: ["Das Riff gedeiht, wenn Korallos in der Nähe sind. Sie düngen es mit ihrem Ton. Aber sie sind weniger geworden.", "Fang drei, damit ich sie untersuchen kann. Dann lasse ich sie wieder frei."], remind: "Drei Korallos. Sie sind rosa und spitz wie Hirschgeweihe.", done: ["Drei! Und alle gesund.", "Ich lasse sie nachher frei. Danke, das war wichtig."] },
  q_korin2: { locked: "Ich habe eine Aufgabe, aber sie ist zu schwer für dich.", offer: ["Es gibt Quallos, die nachts leuchten, als hätten sie Sterne verschluckt. Mutierte Quallos. Gläsern, funkelnd, sternklar.", "Fang mir so einen. Aber sei geduldig, sie sind nicht oft zu sehen."], remind: "Ein mutierter Quallo. Im Korallenwald oder im Gezeitenbecken.", done: ["Wie schön! Er leuchtet von innen.", "Ich habe dem Riff so viel zu verdanken. Und dir."] },
  q_ebbe: { locked: "Die Flut ist noch zu stark. Komm später.", offer: ["Ich brauche vier Krabbel für mein Gezeitenmodell. Sie zeigen, wie hoch das Wasser steigt.", "Du findest sie am Strand und im Becken. Sie sind flink, aber freundlich."], remind: "Vier Krabbel. Sie laufen seitwärts.", done: ["Vier! Und alle in der richtigen Richtung.", "Das Wasser weiß jetzt, wann es zurückkommen muss."] },
  q_ebbe2: { locked: "Dafür musst du die Gezeiten besser kennen.", offer: ["Perlchen sind selten und flüchtig. Sie tauchen auf, wenn die Flut ihren höchsten Punkt erreicht.", "Fang zwei. Dann gebe ich dir etwas Gutes."], remind: "Zwei Perlchen. Gezeitenbecken und Strand.", done: ["Zwei Perlchen! Die Flut dankt dir.", "Hier, ein Dank aus tiefstem Herzen."] },
  q_hake: { locked: "Heute spukt es nicht. Komm später.", offer: ["Im Wrack spukt es, aber nur die Würmer. Sie fressen Planken und singen dabei. Ich ertrage das nicht mehr.", "Fang mir drei, nachts, wenn sie unterwegs sind."], remind: "Drei Wrackwürmer, nachts. Wrackfriedhof und Tiefenschlund.", done: ["Endlich Ruhe auf dem Achterdeck!", "Danke, Landratte. Das war Arbeit für zwei."] },
  q_hake2: { locked: "Dafür brauchst du mehr Erfahrung. Der Krake ist kein Anfänger.", offer: ["Der Geisterkrake wohnt im Wrack. Er klingt wie eine Mannschaft, die nie ankommt. Ich möchte ihn sehen, bevor ich gehe.", "Fang einen. Nachts, wenn er auftaucht."], remind: "Ein Geisterkrake, nachts. Wrackfriedhof, Tiefenschlund.", done: ["Da ist er. Mein alter Matrose.", "Ich lasse ihn wieder frei. Danke, das bedeutet mir mehr, als du denkst."] },
  q_tiefa: { locked: "Tauchen ist nichts für dich. Noch nicht.", offer: ["Im Wrack liegt ein Gong, der nachts singt. Aber ohne den Ton von zwei Tiefenlichtern kann ich ihn nicht stimmen.", "Fang zwei. Nur nachts, wenn sie hell leuchten."], remind: "Zwei Tiefenlichter, nachts. Tiefenschlund, Wrackfriedhof.", done: ["Ich höre ihn schon. Der Gong ist gestimmt.", "Er gehört dir. Nachts klingt er am schönsten."] },
  q_tiefa2: { locked: "Der König schläft. Weck ihn nicht zu früh.", offer: ["Der Tiefseekönig sitzt ganz unten, auf seinem Thron aus Muscheln. Er ist prächtig und er weiß es.", "Fang ihn. Aber sei höflich. Er merkt sich so etwas."], remind: "Der Tiefseekönig. Tiefenschlund.", done: ["Du hast ihn! Er sieht beleidigt aus.", "Gut so. Königen steht das."] },

  l1: { locked: "Du hast noch nicht genug gehört. Geh und hör weiter.", offer: ["Du hast die Wand überhört. Das tun nur wenige.", "Die Letzte Strophe besteht aus sieben Zeilen. Jede steckt in einem Tonling, der anders ist als die anderen: gläsern, funkelnd, sternklar.", "Zeile eins: vier mutierte Tonlinge. Egal welche, egal wo."], remind: "Vier mutierte Tonlinge. Gläsern, funkelnd oder sternklar, egal welche Art.", done: ["Vier. Ich höre schon den Anfang.", "Die Strophe beginnt leise, aber sie wächst."] },
  l2: { locked: "Ich brauche Zeit, die erste Zeile zu verstehen.", offer: ["Zeile zwei klingt wie Glas. Drei Gläserne, und sie müssen selten sein. Blau oder besser.", "Sie sind schwer zu finden. Gläsern ist eine Mutation von eins zu fünfundzwanzig, und selten ein Zufall von eins zu neun."], remind: "Drei Gläserne, selten (blau) oder besser.", done: ["Drei Gläserne. Ich sehe durch sie hindurch.", "Die Strophe klingt schon heller."] },
  l3: { locked: "Die zweite Zeile klingt noch nach.", offer: ["Zeile drei funkelt. Zwei Funkelnde, und sie müssen prächtig sein. Lila oder besser.", "Funkeln ist eine Mutation von eins zu achtzig. Prächtig ein Zufall von eins zu dreißig. Du wirst Geduld brauchen."], remind: "Zwei Funkelnde, prächtig (lila) oder besser.", done: ["Zwei Funkelnde. Jetzt tanzt die Strophe.", "Aber das war noch leicht. Die nächste Zeile ist sternenklar."] },
  l4: { locked: "Noch nicht. Die dritte Zeile hallt noch.", offer: ["Zeile vier ist sternklar. Ein Tonling, der aussieht wie ein Stück Nachthimmel. Er muss selten sein, blau oder besser.", "Sternklar ist eine Mutation von eins zu dreihundert. Es wird dauern."], remind: "Ein Sternklarer, selten (blau) oder besser.", done: ["Ein Sternklarer! Ich dachte, es gäbe sie nur in Legenden.", "Die vierte Zeile ist da. Nur noch drei."] },
  l5: { locked: "Ich brauche Stille, bevor ich die nächste Zeile nenne.", offer: ["Zeile fünf ist golden: ein funkelnder Fabelhafter. Ein Weltenstern, eine Urperle, eine Abgrundsonne, ein Sonnenkern oder eine Goldkrone, die nebenbei funkelt.", "Du brauchst Glück, Geduld und ein gutes Instrument. Und vielleicht ein Wunder."], remind: "Ein funkelnder Fabelhafter (gelb).", done: ["Gold und Funken! Ich habe Gänsehaut.", "Zwei Zeilen noch. Aber die sind die Schwersten."] },
  l6: { locked: "Das Meer muss dich noch einmal prüfen. Komm später.", offer: ["Zeile sechs ist sternklar und prächtig. Im Rauschmeer, wo das Lied am lautesten ist.", "Perlchen, Geisterkraken oder der Tiefseekönig. Einer von ihnen muss sternklar sein."], remind: "Ein sternklarer Prächtiger (lila) im Rauschmeer.", done: ["Er leuchtet wie ein Stück Nacht. Ich kann kaum hinsehen.", "Es fehlt nur noch eine Zeile. Die rote. Die Schwerste von allen."] },
  l7: { locked: "Die letzte Zeile ist zu schwer für heute.", offer: ["Die letzte Zeile ist rot. Ein Glorreicher. Rubinhall, Karminstern oder Seelenmeer.", "Und er muss mutiert sein. Gläsern, funkelnd oder sternklar. Das ist fast unmöglich.", "Wenn du das schaffst, ist die Strophe fertig. Und der Chor des Meeres gehört dir."], remind: "Ein mutierter Glorreicher (rot). Rubinhall, Karminstern oder Seelenmeer.", done: ["Rot und mutiert. Ich habe nie gedacht, dass jemand so weit kommt.", "Die Strophe ist fertig. Hör zu.", "Das Meer singt. Alle Töne passen zusammen. Das Urlied ist vollständig.", "Der Urmeerchor gehört dir. Du hast ihn mehr als verdient."] },
  q_echo: { locked: "Noch nicht… nicht… Ich brauche jemanden, der länger zuhört… zuhört…", offer: ["Ich höre nur noch das Echo… Echo… Aber der Dunkelwisp, der singt in meinen Träumen… Träumen…", "Bring mir zwei… zwei… Dann kann ich vielleicht wieder schlafen."], remind: "Zwei Dunkelwisps… wisps… Er lebt im Becken oder in der Pilzgrotte.", done: ["Endlich Stille… Stille…", "Hier, nimm… nimm… Ich brauche es nicht mehr."] }
};

/* Allgemeine Absagen, falls kein Text hinterlegt ist */
const LOCKED_GENERIC = ["Ich glaube, du bist noch nicht erfahren genug dafür. Komm später wieder.", "Dafür fehlt dir noch ein bisschen Gehör. Übe weiter."];
