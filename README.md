# skp-watch

Anteprima 3D locale, con aggiornamento automatico, per modelli di edifici.

Un piccolo server Node osserva un file `scene.json`; una pagina three.js nel browser ridisegna la scena ogni volta che il file cambia, mantenendo l'inquadratura. Nasce per vedere in tempo reale i modelli costruiti in SketchUp tramite l'MCP di SketchUp, ma funziona con qualunque `scene.json` valido: i modelli possono anche essere generati da script, come quello in `projects/casa-costanza/`.

> Il viewer mostra la geometria esportata, non il file SketchUp. Un modello generato da script esiste solo qui, non in SketchUp.

## Avvio rapido

```bash
npm install
node server.js projects/casa-costanza/scene.json 4173
open http://localhost:4173
```

Il primo argomento è il file della scena, il secondo la porta (default 4173). Per fermare il server: `pkill -f "node server.js"`. Va riavviato solo se si modifica `server.js`; per `public/index.html` basta ricaricare la pagina.

## Il viewer

| Cosa | Come |
|---|---|
| Viste predefinite (Saved, Iso, Iso 2, Front, Back, Left, Right, Top, Interior) | pulsanti o tasti `1`–`9` |
| Zoom | `+` / `−` |
| Muoversi (camera e punto di rotazione insieme) | `W A S D` o frecce, `Q`/`E` giù/su, `Shift` = più veloce |
| Quote del modello, o dell'oggetto cliccato | `M` |
| Unità (cm / in / m) | `U` |
| Gruppi di oggetti attivabili (arredi, varianti, impianti), tutti spenti di default | `G` (pulsante **Gruppi**) |
| Mostra/nascondi gli elementi "da rimuovere" | `R` (pulsante **Rimossi**) |

- L'inquadratura sopravvive al ricaricamento tramite l'URL: `?view=Iso+2` oppure `?cam=ex,ey,ez,tx,ty,tz,fov` (valori in pollici).
- I **gruppi** si accendono dal pannello, per categoria (il titolo di ogni categoria si apre e si chiude con un clic: `›` chiuso, `v` aperto); lo stato è nell'URL (`?g=cucina-v1,bagno`). Due gruppi con la stessa `variant` si escludono a vicenda (ad esempio cucina v1 / v2), gli altri sono indipendenti.
- Gli oggetti il cui nome contiene `Rimosso` sono nascosti di default (stato "dopo i lavori"); il pulsante **Rimossi** li mostra, in arancio.
- Passando il mouse su un oggetto si vedono nome e dimensioni.

## Formato `scene.json`

```jsonc
{ "units": "inches",
  "camera": { "eye": [x, y, z], "target": [x, y, z], "up": [0, 0, 1], "fov": 35 },
  "groups": [ { "id": "cucina-v1", "label": "Cucina v1", "cat": "Cucina", "variant": "cucina" } ],
  "items": [ { "n": "/Gruppo/Sotto/Foglia", "c": [r, g, b, a], "g": "cucina-v1", "box": [x0, y0, z0, x1, y1, z1] } ] }
```

`groups` e `g` sono opzionali: un oggetto con `g` (un id o una lista) si vede solo se almeno uno dei suoi gruppi è acceso; gli oggetti senza `g` si vedono sempre.

Z è l'asse verticale, come in SketchUp. Ogni oggetto ha esattamente una chiave di geometria: `box`, `faces`, `tube`, `slab`, `tray`, `rbox`. La descrizione completa è in [`CLAUDE.md`](CLAUDE.md).

## Struttura del repo

```
server.js              server statico + eventi di ricaricamento (SSE)
public/index.html      il viewer (three.js)
projects/<nome>/       un modello per cartella: scene.json e, se c'è, il generatore
CLAUDE.md              note di progetto, trucchi dell'MCP di SketchUp, flusso di lavoro
```

## Il modello `casa-costanza`

`projects/casa-costanza/house.js` genera `scene.json` a partire da misure in centimetri: muri con aperture, nicchie, archi, finestre, impianti. Le quote misurate e quelle stimate sono separate: nel codice le stime sono marcate con "stima".

```bash
node projects/casa-costanza/house.js          # riscrive projects/casa-costanza/scene.json
```

I gruppi si definiscono in `house.js` con `defGroup(id, etichetta, categoria, [variante])` e si usano con `group(id, () => { ... })`: tutto quello che si disegna dentro prende il gruppo. Oggi ci sono i tre gruppi di attacchi (cucina, WC grande, WC piccolo).

Il server e la pagina si aggiornano da soli. Cambiando una costante nella tabella in cima al file (per esempio `SOGG_D`, la profondità del soggiorno, o gli spessori dei muri) e rigenerando, tutto si adatta.

Convenzioni nei colori del viewer:
- **bianco**: tutte le pareti (prima beige = misurate, azzurro = stimate; la distinzione resta nei commenti del codice);
- **pavimento**: parquet a listoni in rovere (texture `public/textures/parquet-rovere.png`);
- **arancio**: elementi da rimuovere nei lavori (nomi che terminano con `_Rimosso`, visibili con **Rimossi**).

## Pubblicazione statica (Cloudflare Pages)

`npm run build` crea `dist/` (ignorata da git): `index.html`, `scene.json`, le texture e i moduli di three.js, con percorsi relativi, `noindex`/`robots.txt` e nessun aggiornamento automatico (basta ricaricare la pagina). Non serve alcun server Node: funziona su qualunque hosting statico, anche in una sottocartella.

Su Cloudflare Pages, collegando questo repository GitHub (Workers & Pages → Create → Pages → Connect to Git): *Build command* `npm run build`, *Build output directory* `dist`. Ogni `git push` ripubblica con l'ultimo `scene.json` committato (rigenerato con `node projects/casa-costanza/house.js`). Per limitare l'accesso: Settings → General → Enable access policy (Cloudflare Access / Zero Trust).

## Aggiungere un altro modello

Crea `projects/<nome>/` con un `scene.json` (a mano, da uno script o dall'export dell'MCP di SketchUp) e avvia il server con quel percorso. Il formato e le regole di esportazione da SketchUp sono descritti in `CLAUDE.md`.

## Test del viewer da riga di comando

Gli screenshot automatici usano `playwright-core` con il Chrome installato, in modalità headless con GL software. Il metodo è descritto in `CLAUDE.md`, nella sezione "Testing the viewer headlessly". Gli script e le immagini temporanee non vanno nel repo.

## Requisiti

Node.js e un browser moderno. L'unica dipendenza è `three`.

## Licenza

- Codice (`server.js`, `public/index.html`, `scripts/`): [MIT](LICENSE).
- Contenuti (`projects/`, `public/textures/`): [CC BY 4.0](LICENSE-content). La texture del parquet è stata generata proceduralmente con Claude.
- Esperimento di interior design realizzato con Claude Code. Non affiliato né approvato da IKEA né da altri marchi citati nei commenti e nei nomi dei moduli.
