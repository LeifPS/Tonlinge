# Tonlinge-Wiki

Das Wiki liegt als statische Seite unter `public/wiki/`. Der vorhandene Worker liefert `public/` bereits als Static Assets aus; deshalb bleibt die Spielroute `/` und der Mehrspieler-Endpunkt `/ws` unverändert. Cloudflare Workers leitet `/wiki` gemäß der bestehenden automatischen HTML-Pfadbehandlung auf `/wiki/` um.

## Spieldaten aktualisieren

`node wiki/build-data.js` liest die Daten- und Weltmodule aus `src/` aus und schreibt `public/wiki/data.json`. Dabei werden keine Spielmodule verändert. Die beiden WOFF2-Dateien werden aus den im Spiel eingebetteten Schriftdefinitionen aus `src/h_head.html` extrahiert.

## Deployment

Wenn das Wiki veröffentlicht werden soll, enthält der bestehende Befehl `npm run deploy` den Ordner `public/wiki/` bereits in den Static Assets. Dieses Projekt wurde mit der Wiki-Erstellung nicht auf Cloudflare deployt.
