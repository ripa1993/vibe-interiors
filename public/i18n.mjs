// UI strings in English and Italian, shared by the project list, the viewer and the Plan sheet (the projects' own data is not translated).
//   t('key', { n: 3 })   the string in the current language, {n} replaced; an unknown key returns the key itself
//   getLang() / setLang('it')   current language; setLang saves the choice and reloads the page (the view lives in the URL, so it survives)
//   applyI18n(root)   fills [data-i18n] (text), [data-i18n-title], [data-i18n-aria] (aria-label) and [data-i18n-html] from the dictionary
//   locale()   'en-GB' / 'it-IT' for numbers and dates
// Which language: ?lang=it|en in the URL, then the saved choice (localStorage "lang"), then the browser language (Italian if it starts with "it"), else English.
// Node (tests, scripts) has no window: it gets English. Add a language = one more dictionary below and one more entry in LANGS.
export const LANGS = ['en', 'it'];
const LOCALES = { en: 'en-GB', it: 'it-IT' };

const en = {
  // project list
  'list.title': 'Vibe Interiors · Projects',
  'list.h1': 'Projects',
  'list.sub': 'Pick a model to open. The address of each project can be bookmarked.',
  'list.loadError': 'Could not load the project list. Reload the page.',
  'list.empty': 'No project found: add <code>projects/&lt;name&gt;/scene.json</code>.',
  'list.noPreview': 'no preview',
  'list.preview': 'Preview of {title}',
  'list.objects': '{n} objects',
  'lang.label': 'Language',
  // viewer: toolbar
  'v.title': 'Vibe Interiors',
  'v.home': '← Projects',
  'v.home.title': 'Project list',
  'v.connecting': 'connecting…',
  'v.more': 'Views',
  'v.more.title': 'Views, dimensions',
  'v.cam.title': 'Camera views (1-9)',
  'v.cam.aria': 'Camera views',
  'v.set.title': 'Settings: dimensions, units, click to measure',
  'v.set.aria': 'Settings',
  'v.dims': 'Dims',
  'v.dims.title': 'Show overall dimensions (M)',
  'v.unit.title': 'Change units (U)',
  'v.measure': 'Click to measure',
  'v.measure.title': 'Show / hide the dimensions on click and the hover tooltip (K)',
  'v.ao.title': 'Ambient occlusion: contact shadows in the corners (O)',
  'v.render.title': 'Path-traced render: global illumination, soft shadows (T)',
  'v.denoise.title': 'Denoiser (a-trous filter guided by normals and depth) on the render',
  'v.png.title': 'Save the image on screen as a PNG, without buttons or labels (P)',
  'v.night': 'Night',
  'v.night.title': 'Night mode: turns the lights on (N)',
  'v.fp': 'First person',
  'v.fp.title': 'First person: walk through the model (F)',
  'v.plan': 'Plan',
  'v.plan.title': 'Plan: only the walls seen from above, with the interior measures of the rooms (print, SVG, PNG)',
  'v.groups': 'Groups',
  'v.groups.title': 'Show / hide groups of objects (G)',
  'v.groups.count': 'Groups ({n})',
  'v.fphint': 'WASD / arrows: move · Q / E: turn · click: mouse look (click again to stop) · Shift: run · F / Esc: exit',
  'v.status.objects': '{n} objects · {time}',
  'v.status.waiting': 'waiting for valid scene.json…',
  'v.view.title': '{name}  (key {n})',
  // camera views (the URL keeps the English names: ?view=Iso+2)
  'view.Saved': 'Saved', 'view.Iso': 'Iso', 'view.Iso 2': 'Iso 2', 'view.Front': 'Front', 'view.Back': 'Back',
  'view.Left': 'Left', 'view.Right': 'Right', 'view.Top': 'Top', 'view.Interior': 'Interior',
  // groups panel
  'g.allOn': 'All on',
  'g.allOff': 'All off',
  'g.variant': 'variant',
  'g.on': '{n} on',
  'g.other': 'Other',
  'g.removed': 'Removed elements',
  'g.removedCat': 'Demolition',
  // Plan sheet
  'p.title': 'Plan',
  'p.aria': 'Plan',
  'p.room': 'Room {n}',
  'p.bar.one': 'Plan · {n} room',
  'p.bar.many': 'Plan · {n} rooms',
  'p.paper': 'Paper',
  'p.print': 'Print',
  'p.print.title': 'Opens the browser print dialog (Save as PDF works from there)',
  'p.svg': 'Download SVG',
  'p.png': 'Download PNG',
  'p.close': 'Close',
  'p.close.title': 'Close (Esc)',
  'p.none': 'No walls found: it needs <code>box</code> or <code>slab</code> items with no group that cross the 100 cm height.',
  'p.scale': 'Scale 1:{n}',
  'p.sub': 'Plan, interior dimensions in cm, cut at {z} cm',
  'p.landscape': 'landscape',
  'p.portrait': 'portrait',
  'p.file': 'plan',
};

const it = {
  'list.title': 'Vibe Interiors · Progetti',
  'list.h1': 'Progetti',
  'list.sub': "Scegli un modello da aprire. L'indirizzo di ogni progetto si può salvare nei preferiti.",
  'list.loadError': "Impossibile caricare l'elenco dei progetti. Ricarica la pagina.",
  'list.empty': 'Nessun progetto trovato: aggiungi <code>projects/&lt;nome&gt;/scene.json</code>.',
  'list.noPreview': 'nessuna anteprima',
  'list.preview': 'Anteprima di {title}',
  'list.objects': '{n} oggetti',
  'lang.label': 'Lingua',
  'v.title': 'Vibe Interiors',
  'v.home': '← Progetti',
  'v.home.title': 'Elenco dei progetti',
  'v.connecting': 'connessione…',
  'v.more': 'Viste',
  'v.more.title': 'Viste, quote',
  'v.cam.title': 'Viste della camera (1-9)',
  'v.cam.aria': 'Viste della camera',
  'v.set.title': 'Impostazioni: quote, unità, misura al clic',
  'v.set.aria': 'Impostazioni',
  'v.dims': 'Quote',
  'v.dims.title': 'Mostra le quote complessive (M)',
  'v.unit.title': 'Cambia unità (U)',
  'v.measure': 'Misura al clic',
  'v.measure.title': 'Mostra / nascondi le quote al clic e il suggerimento al passaggio del mouse (K)',
  'v.ao.title': 'Occlusione ambientale: ombre di contatto negli angoli (O)',
  'v.render.title': 'Render path tracing: luce globale, ombre morbide (T)',
  'v.denoise.title': 'Denoiser (filtro a-trous guidato da normali e profondità) sul render',
  'v.png.title': "Salva l'immagine a schermo come PNG, senza pulsanti ed etichette (P)",
  'v.night': 'Notte',
  'v.night.title': 'Modalità notte: accende le luci (N)',
  'v.fp': 'Prima persona',
  'v.fp.title': 'Prima persona: cammina nel modello (F)',
  'v.plan': 'Pianta',
  'v.plan.title': "Pianta: solo i muri visti dall'alto, con le misure interne delle stanze (stampa, SVG, PNG)",
  'v.groups': 'Gruppi',
  'v.groups.title': 'Mostra / nascondi i gruppi di oggetti (G)',
  'v.groups.count': 'Gruppi ({n})',
  'v.fphint': 'WASD / frecce: muovi · Q / E: ruota · clic: guarda col mouse (di nuovo clic per fermare) · Shift: corri · F / Esc: esci',
  'v.status.objects': '{n} oggetti · {time}',
  'v.status.waiting': 'in attesa di uno scene.json valido…',
  'v.view.title': '{name}  (tasto {n})',
  'view.Saved': 'Salvata', 'view.Iso': 'Iso', 'view.Iso 2': 'Iso 2', 'view.Front': 'Fronte', 'view.Back': 'Retro',
  'view.Left': 'Sinistra', 'view.Right': 'Destra', 'view.Top': 'Alto', 'view.Interior': 'Interno',
  'g.allOn': 'Tutto acceso',
  'g.allOff': 'Tutto spento',
  'g.variant': 'variante',
  'g.on': '{n} attivi',
  'g.other': 'Altro',
  'g.removed': 'Elementi rimossi',
  'g.removedCat': 'Demolizioni',
  'p.title': 'Pianta',
  'p.aria': 'Pianta',
  'p.room': 'Stanza {n}',
  'p.bar.one': 'Pianta · {n} stanza',
  'p.bar.many': 'Pianta · {n} stanze',
  'p.paper': 'Foglio',
  'p.print': 'Stampa',
  'p.print.title': 'Apre la stampa del browser (da lì si può anche salvare in PDF)',
  'p.svg': 'Scarica SVG',
  'p.png': 'Scarica PNG',
  'p.close': 'Chiudi',
  'p.close.title': 'Chiudi (Esc)',
  'p.none': 'Nessun muro trovato: servono oggetti <code>box</code> o <code>slab</code> senza gruppo che attraversino i 100 cm di altezza.',
  'p.scale': 'Scala 1:{n}',
  'p.sub': 'Pianta, quote interne in cm, taglio a {z} cm',
  'p.landscape': 'orizzontale',
  'p.portrait': 'verticale',
  'p.file': 'pianta',
};

export const DICTS = { en, it };

let lang = null;
export function getLang() {
  if (lang) return lang;
  if (typeof window === 'undefined') return (lang = 'en');          // Node (tests, scripts): English, and don't touch localStorage (Node 26 warns about it)
  let l = null;
  try { l = new URLSearchParams(location.search).get('lang'); } catch {}
  if (!LANGS.includes(l)) { l = null; try { l = localStorage.getItem('lang'); } catch {} }
  if (!LANGS.includes(l)) { try { l = (navigator.language || '').toLowerCase().startsWith('it') ? 'it' : 'en'; } catch { l = 'en'; } }
  return (lang = l);
}
export const locale = () => LOCALES[getLang()];
export function t(key, params = {}) {
  const s = DICTS[getLang()][key] ?? en[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in params ? params[k] : m));
}
export function setLang(l) {
  if (!LANGS.includes(l)) return;
  try { localStorage.setItem('lang', l); } catch {}
  const u = new URL(location.href); u.searchParams.delete('lang');     // an explicit ?lang= would win over the saved choice
  if (u.href === location.href) location.reload(); else location.replace(u);
}
export function applyI18n(root = document) {
  document.documentElement.lang = getLang();
  for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of root.querySelectorAll('[data-i18n-html]')) el.innerHTML = t(el.dataset.i18nHtml);
  for (const el of root.querySelectorAll('[data-i18n-title]')) el.title = t(el.dataset.i18nTitle);
  for (const el of root.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
  for (const b of root.querySelectorAll('[data-lang]')) { b.classList.toggle('on', b.dataset.lang === getLang()); b.onclick = () => setLang(b.dataset.lang); }
}
