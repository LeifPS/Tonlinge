# Tonlinge

Ein handgezeichnetes 2D-Browserspiel: Finde Instrumente, fange Tonlinge mit Tönen und Frequenzen, erkunde Klanghain und Glimmerhöhlen. Mit Mehrspieler: Du siehst andere Spieler im Klanghain.

## Aufbau

- `src/`: Quellcode des Spiels (wird zu einer einzigen `public/index.html` zusammengebaut)
- `build.sh`: baut `public/index.html`
- `worker/index.js`: Cloudflare Worker mit Durable Object `World` (WebSocket unter `/ws`) und Auslieferung der Seite
- `wrangler.jsonc`: Konfiguration (Static Assets plus Durable Object)

## Lokal ausprobieren

```
npm install
npm run dev        # baut und startet http://localhost:8787
```

Mit zwei Browserfenstern siehst du dich selbst als zweiten Spieler.

## Auf Cloudflare veröffentlichen

```
npm install
npx wrangler login
npm run deploy
```

Das legt einen Worker mit Durable Object an und liefert die Seite aus. Pages allein reicht nicht: Durable Objects müssen in einem Worker liegen.

## Spiel von woanders mit dem Server verbinden

Hängt man `?server=wss://DEIN-WORKER.workers.dev/ws` an die Adresse, merkt sich das Spiel den Server. Mit `?server=off` schaltet man Mehrspieler aus.

## Spielstand

Wird im Browser (localStorage) gespeichert. Mehrspieler synchronisiert nur Position, Name und was man in der Hand hält, nicht den Spielstand.
