/* Sicilia Naturale - anteprima mappa e schede zona.
   Mappa di base impacchettata in tiles/*.txt (OpenFreeMap + rilievo Terrarium), servita con il protocollo loc://.
   Dati zone: data/*.json preparati da tools/costruisci_dati.py (fonti EEA). */
{
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = n => Math.round(n).toLocaleString(LANG === 'it' ? 'it-IT' : 'en-GB');
let LANG = 'it';
try { if (localStorage.getItem('sn_lang') === 'en') LANG = 'en'; } catch (e) {}

const TX = {
  it: { cerca: 'Cerca un bosco, un parco, una riserva…', aree: 'Parchi e riserve', n2k: 'Natura 2000', tutti: 'Tutti i boschi', solo: 'Solo zone con boschi',
    pn: 'Parco nazionale', pr: 'Parco regionale', rn: 'Riserva naturale', amp: 'Area marina protetta', ap: 'Area protetta', zsc: 'ZSC (Natura 2000)', zps: 'ZPS (Natura 2000)', zsczps: 'ZSC e ZPS (Natura 2000)',
    sup: 'Superficie', boschi: 'Boschi', istit: 'Istituita', hab: 'Habitat', specie: 'Specie segnalate', coll: 'Zone collegate',
    nb: 'Superfici dei tipi di bosco (habitat forestali) dichiarate nel formulario Natura 2000 del sito.',
    nba: 'Superfici dei tipi di bosco dichiarate nei formulari dei siti ZSC collegati a quest’area.',
    nsp: 'Specie elencate nel formulario Natura 2000 (presenza nel sito, senza posizione).',
    nspa: 'Specie elencate nei formulari dei siti Natura 2000 collegati a quest’area.',
    nobosco: 'Nessun habitat forestale dichiarato.', nodati: 'Per quest’area non ci sono siti Natura 2000 collegati: habitat e specie non disponibili.',
    fonte: 'Fonte', sdf: 'Formulario Natura 2000 (EEA)', reg: 'Aree naturali protette (Regione Siciliana)', qui: 'Zone in questo punto', nessuno: 'Nessun risultato',
    prio: 'prioritario', zone: 'zone', legA: 'Parco o riserva', legM: 'Area marina protetta', legZ: 'ZSC', legP: 'ZPS',
    cf: 'Carta forestale', bv: 'Bosco vetusto', bvs: 'Boschi vetusti', bs: 'Bosco da seme', bss: 'Boschi da seme', am: 'Albero monumentale', ams: 'Alberi monumentali',
    tf: 'Tipo forestale', bio: 'Bioclima', sist: 'Area', topo: 'Località (IGM)', spp: 'Specie', sub: 'Substrato', veg: 'Vegetazione', com: 'Comune', dec: 'Decreto',
    circ: 'Circonferenza', alt: 'Altezza', quota: 'Quota', crit: 'Criteri di monumentalità', dm: 'Provvedimento', urb: 'In contesto urbano', dentro: 'Si trova in',
    cat: 'Categoria forestale', varianti: 'Varianti nella categoria', cfnota: 'Tipo di bosco della particella secondo la Carta forestale regionale (Corpo Forestale). Visibile da vicino.',
    sif: 'Sistema Informativo Forestale (Regione Siciliana)', lsif: 'Corpo Forestale, Regione Siciliana',
    G: { P: 'Piante', B: 'Uccelli', I: 'Invertebrati', R: 'Rettili', M: 'Mammiferi', A: 'Anfibi', F: 'Pesci', L: 'Licheni' } },
  en: { cerca: 'Search a forest, park or reserve…', aree: 'Parks and reserves', n2k: 'Natura 2000', tutti: 'All forests', solo: 'Only areas with forests',
    pn: 'National park', pr: 'Regional park', rn: 'Nature reserve', amp: 'Marine protected area', ap: 'Protected area', zsc: 'SAC (Natura 2000)', zps: 'SPA (Natura 2000)', zsczps: 'SAC and SPA (Natura 2000)',
    sup: 'Area', boschi: 'Forests', istit: 'Established', hab: 'Habitats', specie: 'Recorded species', coll: 'Linked areas',
    nb: 'Areas of forest types (forest habitats) declared in the site’s Natura 2000 standard data form.',
    nba: 'Areas of forest types declared in the forms of the SAC sites linked to this area.',
    nsp: 'Species listed in the Natura 2000 data form (presence in the site, no locations).',
    nspa: 'Species listed in the forms of the Natura 2000 sites linked to this area.',
    nobosco: 'No forest habitat declared.', nodati: 'No Natura 2000 sites are linked to this area: habitats and species not available.',
    fonte: 'Source', sdf: 'Natura 2000 data form (EEA)', reg: 'Protected natural areas (Sicilian Region)', qui: 'Areas at this point', nessuno: 'No results',
    prio: 'priority', zone: 'areas', legA: 'Park or reserve', legM: 'Marine protected area', legZ: 'SAC', legP: 'SPA',
    cf: 'Forest map', bv: 'Old-growth forest', bvs: 'Old-growth forests', bs: 'Seed stand', bss: 'Seed stands', am: 'Monumental tree', ams: 'Monumental trees',
    tf: 'Forest type', bio: 'Bioclimate', sist: 'Area', topo: 'Place (IGM)', spp: 'Species', sub: 'Substrate', veg: 'Vegetation', com: 'Municipality', dec: 'Decree',
    circ: 'Girth', alt: 'Height', quota: 'Elevation', crit: 'Monumentality criteria', dm: 'Listing act', urb: 'In an urban setting', dentro: 'Located in',
    cat: 'Forest category', varianti: 'Variants in this category', cfnota: 'Forest type of the stand according to the regional Forest Map (Forestry Corps). Visible when zoomed in.',
    sif: 'Forest Information System (Sicilian Region)', lsif: 'Forestry Corps, Sicilian Region',
    G: { P: 'Plants', B: 'Birds', I: 'Invertebrates', R: 'Reptiles', M: 'Mammals', A: 'Amphibians', F: 'Fish', L: 'Lichens' } }
};
const BOSCO_EN = { '9180': 'Lime-maple ravine forests', '91AA': 'Downy oak woods', '91B0': 'Narrow-leaved ash woods', '91E0': 'Alder woods', '91M0': 'Turkey oak woods',
  '9210': 'Beech forests', '9220': 'Beech forests with fir', '9260': 'Chestnut woods', '92A0': 'Willow and poplar galleries', '92C0': 'Oriental plane woods',
  '92D0': 'Riparian thickets', '9320': 'Wild olive and carob woods', '9330': 'Cork oak forests', '9340': 'Holm oak forests', '9380': 'Holly woods',
  '9530': 'Black pine forests', '9540': 'Mediterranean pine forests', '9580': 'Yew woods' };
const t = k => TX[LANG][k];
const AREE = ['pn', 'pr', 'rn', 'amp', 'ap'], N2K = ['zsc', 'zsczps', 'zps'];

/* ---------- mappa di base impacchettata */
const packs = {};
function pack(name) {
  return packs[name] || (packs[name] = fetch('tiles/' + name + '.txt').then(r => { if (!r.ok) throw new Error(r.status); return r.text(); }).then(tx => {
    const bin = atob(tx), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); const b = u.buffer;
    const n = new DataView(b).getUint32(0, true);
    return { idx: JSON.parse(new TextDecoder().decode(new Uint8Array(b, 4, n))), b, o: 4 + n };
  }).catch(e => { delete packs[name]; throw e; }));
}
maplibregl.addProtocol('loc', async params => {
  const k = decodeURIComponent(params.url.slice(6)); // v/z/x/y, d/z/x/y, g/font/range
  const p = k.split('/');
  let name = 'base';
  if (p[0] === 'f') { const s = +p[1] - 9; name = 'cf_' + (p[2] >> s) + '_' + (p[3] >> s); }
  else if (p[0] !== 'g') { const z = +p[1]; if (z > 7) { const s = z - 7; name = 'c_' + (p[2] >> s) + '_' + (p[3] >> s); } }
  let P; try { P = await pack(name); } catch (e) { if (p[0] !== 'd') return { data: new ArrayBuffer(0) }; throw e; }
  const e = P.idx[k];
  if (!e) { if (p[0] === 'd') throw new Error('no tile'); return { data: new ArrayBuffer(0) }; }
  return { data: P.b.slice(P.o + e[0], P.o + e[0] + e[1]) };
});
const B = [11.9, 35.4, 15.7, 38.9];
const C = { bg: '#f6f3ec', wood: '#cfe0c0', grass: '#e4ead6', water: '#b4d3e6', ww: '#7fb0cf', road: '#c4b9a0', tx: '#2a2620', halo: '#f6f3ec' };
const style = {
  version: 8, glyphs: 'loc://g/{fontstack}/{range}',
  sources: {
    om: { type: 'vector', tiles: ['loc://v/{z}/{x}/{y}'], minzoom: 5, maxzoom: 11, bounds: B, attribution: '© OpenStreetMap · OpenFreeMap' },
    cf: { type: 'vector', tiles: ['loc://f/{z}/{x}/{y}'], minzoom: 9, maxzoom: 12, bounds: B, attribution: 'Carta forestale: Corpo Forestale, Regione Siciliana' },
    dem: { type: 'raster-dem', tiles: ['loc://d/{z}/{x}/{y}'], encoding: 'terrarium', tileSize: 256, minzoom: 5, maxzoom: 8, bounds: B, attribution: 'Terrarium (Mapzen)' }
  },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': C.bg } }, // terra; il mare arriva dal livello water
    { id: 'hill', type: 'hillshade', source: 'dem', paint: { 'hillshade-exaggeration': 0.45, 'hillshade-shadow-color': '#7d745f', 'hillshade-highlight-color': '#ffffff', 'hillshade-accent-color': '#b9b09c' } },
    { id: 'wood', type: 'fill', source: 'om', 'source-layer': 'landcover', filter: ['==', 'class', 'wood'], paint: { 'fill-color': C.wood, 'fill-opacity': 0.85 } },
    { id: 'grass', type: 'fill', source: 'om', 'source-layer': 'landcover', filter: ['==', 'class', 'grass'], paint: { 'fill-color': C.grass, 'fill-opacity': 0.7 } },
    { id: 'water', type: 'fill', source: 'om', 'source-layer': 'water', paint: { 'fill-color': C.water } },
    { id: 'wway', type: 'line', source: 'om', 'source-layer': 'waterway', paint: { 'line-color': C.ww, 'line-width': 1 } },
    { id: 'road', type: 'line', source: 'om', 'source-layer': 'transportation', filter: ['in', 'class', 'motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor'], paint: { 'line-color': C.road, 'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.3, 12, 1.6] } },
    { id: 'place', type: 'symbol', source: 'om', 'source-layer': 'place', filter: ['in', 'class', 'city', 'town', 'village'], layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Regular'], 'text-size': ['match', ['get', 'class'], 'city', 13, 'town', 12, 11] }, paint: { 'text-color': C.tx, 'text-halo-color': C.halo, 'text-halo-width': 1.4 } }
  ]
};

const map = new maplibregl.Map({ container: 'map', style, bounds: [[12.3, 36.55], [15.7, 38.35]], fitBoundsOptions: { padding: 20 }, minZoom: 6, maxZoom: 15, maxBounds: [[10.5, 34.6], [17, 39.6]], attributionControl: false, dragRotate: false, pitchWithRotate: false });
map.touchZoomRotate.disableRotation();
map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: 'Dati zone: EEA Natura 2000, EEA NatDA · Regione Siciliana, SIF' }), 'bottom-left');

/* ---------- dati */
let S = {}, SP = { nomi: [], gr: [] }, H = { boschi: {}, hab: {} }, GJ, CFN = { tipi: {}, macro: {} }, GV, GS, GA;
const D = Promise.all(['schede', 'specie', 'habitat', 'zone', 'carta_forestale_nomi', 'vetusti', 'seme', 'alberi'].map(n => fetch('data/' + n + '.json').then(r => r.json())))
  .then(([a, b, c, g, n, v, s, al]) => { S = a; SP = b; H = c; GJ = g; CFN = n; GV = v; GS = s; GA = al; });
/* colori della carta forestale per macrocategoria (codici SIF) */
const CFC = { FA: '#1f6b3a', CE: '#5a8f29', QU: '#8fae3c', CA: '#a0702a', LE: '#2e5e4e', SU: '#b5893c', OS: '#6f9d6a', BA: '#4f9a73', FR: '#3d8fb0',
  PL: '#3f4f7a', PM: '#7a6fb0', RI: '#9b8ea6', AS: '#c3b26a', MM: '#d9a066', BS: '#c9c9a0' };
const AMB = ['bv', 'bs', 'am'];

map.on('load', () => D.then(() => {
  map.addSource('z', { type: 'geojson', data: GJ, promoteId: 'id' });
  const isA = ['in', ['get', 't'], ['literal', AREE]], isZ = ['in', ['get', 't'], ['literal', ['zsc', 'zsczps']]], isP = ['==', ['get', 't'], 'zps'];
  map.addLayer({ id: 'n2k-f', type: 'fill', source: 'z', filter: isZ, paint: { 'fill-color': '#2f7ea8', 'fill-opacity': 0.12 } });
  map.addLayer({ id: 'n2k-l', type: 'line', source: 'z', filter: isZ, paint: { 'line-color': '#2f7ea8', 'line-width': 1, 'line-opacity': 0.8 } });
  map.addLayer({ id: 'zps-f', type: 'fill', source: 'z', filter: isP, paint: { 'fill-color': '#7a5ea8', 'fill-opacity': 0.001 } });
  map.addLayer({ id: 'zps-l', type: 'line', source: 'z', filter: isP, paint: { 'line-color': '#7a5ea8', 'line-width': 1.2, 'line-dasharray': [3, 2] } });
  map.addLayer({ id: 'aree-f', type: 'fill', source: 'z', filter: isA, paint: { 'fill-color': ['match', ['get', 't'], 'amp', '#1d6fa5', '#2d6a4f'], 'fill-opacity': 0.2 } });
  map.addLayer({ id: 'aree-l', type: 'line', source: 'z', filter: isA, paint: { 'line-color': ['match', ['get', 't'], 'amp', '#1d6fa5', '#1b4332'], 'line-width': 1.6 } });
  // carta forestale (tile), sotto ai perimetri delle zone
  map.addLayer({ id: 'cf-f', type: 'fill', source: 'cf', 'source-layer': 'cf', layout: { visibility: 'none' },
    paint: { 'fill-color': ['match', ['get', 'm'], ...Object.entries(CFC).flat(), '#999'], 'fill-opacity': 0.6 } }, 'n2k-f');
  map.addLayer({ id: 'cf-l', type: 'line', source: 'cf', 'source-layer': 'cf', minzoom: 11, layout: { visibility: 'none' }, paint: { 'line-color': '#ffffff', 'line-width': 0.4, 'line-opacity': 0.7 } }, 'n2k-f');
  map.addSource('bs', { type: 'geojson', data: GS });
  map.addLayer({ id: 'bs-f', type: 'fill', source: 'bs', layout: { visibility: 'none' }, paint: { 'fill-color': '#9a7b2f', 'fill-opacity': 0.25 } });
  map.addLayer({ id: 'bs-l', type: 'line', source: 'bs', layout: { visibility: 'none' }, paint: { 'line-color': '#7a5f1f', 'line-width': 1.4, 'line-dasharray': [2, 1.5] } });
  map.addSource('bv', { type: 'geojson', data: GV });
  map.addLayer({ id: 'bv-f', type: 'fill', source: 'bv', paint: { 'fill-color': '#c2571a', 'fill-opacity': 0.45 } });
  map.addLayer({ id: 'bv-l', type: 'line', source: 'bv', paint: { 'line-color': '#8a3a0e', 'line-width': 1.6 } });
  // i boschi vetusti sono piccoli: da lontano un punto
  map.addLayer({ id: 'bv-p', type: 'circle', source: 'bv', maxzoom: 11, paint: { 'circle-radius': 5, 'circle-color': '#c2571a', 'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5 } });
  map.addSource('am', { type: 'geojson', data: GA });
  map.addLayer({ id: 'am-c', type: 'circle', source: 'am', paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 2.5, 11, 5.5], 'circle-color': '#5b3a1a', 'circle-stroke-color': '#fff', 'circle-stroke-width': 1.2 } });
  map.addLayer({ id: 'sel', type: 'line', source: 'z', filter: ['==', ['get', 'id'], ''], paint: { 'line-color': '#e76f51', 'line-width': 3 } });
  for (const s of ['bv', 'bs']) map.addLayer({ id: 'sel-' + s, type: 'line', source: s, filter: ['==', ['get', 'id'], ''], paint: { 'line-color': '#e76f51', 'line-width': 3 } });
  map.addLayer({ id: 'sel-am', type: 'circle', source: 'am', filter: ['==', ['get', 'id'], ''], paint: { 'circle-radius': 9, 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': '#e76f51', 'circle-stroke-width': 3 } });
  base = { 'n2k-f': isZ, 'n2k-l': isZ, 'zps-f': isP, 'zps-l': isP, 'aree-f': isA, 'aree-l': isA };
  applica();
  const h = location.hash.slice(1); if (h && S[h]) apri(h, true);
}));
let base = {};

/* ---------- filtri */
let showA = true, showN = true, bosco = '';
function applica() {
  if (!map.getLayer('aree-f')) return;
  let ids = null;
  if (bosco) ids = Object.keys(S).filter(k => bosco === '*' ? S[k].bha > 0 : S[k].b.some(b => b[0] === bosco));
  for (const [l, f] of Object.entries(base)) {
    const vis = l.startsWith('aree') ? showA : showN;
    map.setLayoutProperty(l, 'visibility', vis ? 'visible' : 'none');
    map.setFilter(l, ids ? ['all', f, ['in', ['get', 'id'], ['literal', ids]]] : f);
  }
}
$('c-aree').onclick = () => { showA = !showA; $('c-aree').classList.toggle('on', showA); applica(); };
$('c-n2k').onclick = () => { showN = !showN; $('c-n2k').classList.toggle('on', showN); applica(); };
$('bosco').onchange = e => { bosco = e.target.value; $('c-bosco').classList.toggle('on', !!bosco); applica(); };
/* livelli forestali della Regione: acceso/spento */
const LIV = { cf: ['cf-f', 'cf-l'], bv: ['bv-f', 'bv-l', 'bv-p', 'sel-bv'], am: ['am-c', 'sel-am'], bs: ['bs-f', 'bs-l', 'sel-bs'] };
const ON = { cf: false, bv: true, am: true, bs: false };
for (const k of Object.keys(LIV)) $('c-' + k).onclick = () => {
  ON[k] = !ON[k]; $('c-' + k).classList.toggle('on', ON[k]);
  for (const l of LIV[k]) if (map.getLayer(l)) map.setLayoutProperty(l, 'visibility', ON[k] ? 'visible' : 'none');
  if (k === 'cf') {  // con la carta forestale accesa le campiture delle zone si attenuano, restano i contorni
    map.setPaintProperty('n2k-f', 'fill-opacity', ON.cf ? 0.03 : 0.12);
    map.setPaintProperty('aree-f', 'fill-opacity', ON.cf ? 0.04 : 0.2);
    if (ON.cf && map.getZoom() < 9) map.easeTo({ zoom: 9.5, duration: 600 });
  }
  legenda();
};

/* ---------- testi */
const nb = c => LANG === 'it' ? (H.boschi[c] || [c])[0] : (BOSCO_EN[c] || c);
function testi() {
  document.documentElement.lang = LANG;
  $('l-it').classList.toggle('on', LANG === 'it'); $('l-en').classList.toggle('on', LANG === 'en');
  $('q').placeholder = t('cerca');
  $('c-aree').querySelector('span').textContent = t('aree');
  $('c-n2k').querySelector('span').textContent = t('n2k');
  for (const k of ['bv', 'am', 'bs']) $('c-' + k).querySelector('span').textContent = t(k + 's');
  $('c-cf').querySelector('span').textContent = t('cf');
  D.then(() => {
    const cnt = {}; for (const s of Object.values(S)) for (const b of s.b) cnt[b[0]] = (cnt[b[0]] || 0) + 1;
    const opts = Object.keys(H.boschi).filter(c => cnt[c]).sort((a, b) => nb(a).localeCompare(nb(b)));
    $('bosco').innerHTML = `<option value="">${t('tutti')}</option><option value="*">${t('solo')}</option>` + opts.map(c => `<option value="${c}">${esc(nb(c))}</option>`).join('');
    $('bosco').value = bosco;
  });
  legenda();
  if (cur) apri(cur, false);
}
function legenda() {
  let h = [['#2d6a4f', 'legA', 1], ['#1d6fa5', 'legM', 1], ['#2f7ea8', 'legZ', 0], ['#7a5ea8', 'legP', 0]].map(([c, k, f]) => `<div><i style="background:${c}${f ? '55' : '22'};border:1.5px ${k === 'legP' ? 'dashed' : 'solid'} ${c}"></i>${t(k)}</div>`).join('');
  if (ON.bv) h += `<div><i style="background:#c2571a99;border:1.5px solid #8a3a0e"></i>${t('bvs')}</div>`;
  if (ON.am) h += `<div><i style="background:#5b3a1a;border-radius:50%;width:10px;margin:0 2px;border:1.5px solid #fff;box-shadow:0 0 0 1px #5b3a1a"></i>${t('ams')}</div>`;
  if (ON.bs) h += `<div><i style="background:#9a7b2f44;border:1.5px dashed #7a5f1f"></i>${t('bss')}</div>`;
  if (ON.cf) h += `<div class="lt">${t('cf')}</div>` + Object.entries(CFC).filter(([m]) => CFN.macro[m]).map(([m, c]) => `<div><i style="background:${c}"></i>${esc(CFN.macro[m])}</div>`).join('');
  $('legend').innerHTML = h;
}
const setLang = l => { LANG = l; try { localStorage.setItem('sn_lang', l); } catch (e) {} testi(); };
$('l-it').onclick = () => setLang('it'); $('l-en').onclick = () => setLang('en');

/* ---------- ricerca */
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
$('q').oninput = () => {
  const v = norm($('q').value.trim()); $('qx').style.display = v ? 'block' : 'none';
  if (v.length < 2) { $('res').style.display = 'none'; return; }
  const w = v.split(/\s+/);
  const r = Object.entries(S).filter(([k, s]) => { const n = norm(s.n + ' ' + k); return w.every(x => n.includes(x)); })
    .sort((a, b) => (AREE.includes(b[1].t) - AREE.includes(a[1].t)) || b[1].ha - a[1].ha).slice(0, 30);
  $('res').innerHTML = r.length ? r.map(([k, s]) => `<button data-id="${k}">${esc(s.n)}<small>${t(s.t)}${s.ha ? ' · ' + fmt(s.ha) + ' ha' : s.com ? ' · ' + esc(s.com) : ''}</small></button>`).join('') : `<button disabled>${t('nessuno')}</button>`;
  $('res').style.display = 'block';
};
$('res').onclick = e => { const b = e.target.closest('button[data-id]'); if (!b) return; $('res').style.display = 'none'; $('q').blur(); apri(b.dataset.id, true); };
$('qx').onclick = () => { $('q').value = ''; $('q').oninput(); $('q').focus(); };

/* ---------- click sulla mappa */
map.on('click', e => {
  const L = ['am-c', 'bv-p', 'bv-f', 'bs-f', 'aree-f', 'n2k-f', 'zps-f', 'cf-f'].filter(l => map.getLayer(l) && map.getLayoutProperty(l, 'visibility') !== 'none');
  const box = [[e.point.x - 6, e.point.y - 6], [e.point.x + 6, e.point.y + 6]];
  const fp = map.queryRenderedFeatures(box, { layers: L.filter(l => l === 'am-c' || l === 'bv-p') });
  const f = fp.length ? fp : map.queryRenderedFeatures(e.point, { layers: L });
  const ids = [...new Set(f.map(x => x.layer.id === 'cf-f' ? 'CF:' + x.properties.c : x.properties.id))].filter(k => S[k] || k.startsWith('CF:'));
  $('res').style.display = 'none';
  if (!ids.length) return chiudi();
  if (ids.length === 1) return apri(ids[0], false);
  const rank = k => k.startsWith('CF:') ? 9 : AMB.includes(S[k].t) ? 0 : AREE.includes(S[k].t) ? 1 : 2;
  ids.sort((a, b) => rank(a) - rank(b) || (S[a] && S[b] ? S[a].ha - S[b].ha : 0));
  cur = null; selez('');
  $('sh').innerHTML = `<div><h2>${t('qui')}</h2></div><button class="close" aria-label="Chiudi">×</button>`;
  $('sb').innerHTML = '<div class="pick">' + ids.map(k => k.startsWith('CF:')
    ? `<button data-id="${k}">${esc(tipoCF(k.slice(3)))}<br><span class="badge cf">${t('cf')}</span></button>`
    : `<button data-id="${k}">${esc(S[k].n)}<br><span class="badge ${cls(S[k].t)}">${t(S[k].t)}</span></button>`).join('') + '</div>';
  mostra();
});

/* ---------- scheda zona */
let cur = null;
const cls = tp => tp === 'amp' ? 'mare' : tp === 'zps' ? 'zps' : N2K.includes(tp) ? 'n2k' : AMB.includes(tp) ? tp : '';
const tipoCF = c => (CFN.tipi[c] || [c])[0];
function selez(k) {
  if (!map.getLayer('sel')) return;
  const tp = S[k] ? S[k].t : '';
  map.setFilter('sel', ['==', ['get', 'id'], AMB.includes(tp) ? '' : k]);
  for (const x of AMB) map.setFilter('sel-' + x, ['==', ['get', 'id'], tp === x ? k : '']);
}
function mostra() { $('sheet').classList.add('open'); $('sb').scrollTop = 0; }
function chiudi() { $('sheet').classList.remove('open', 'big'); cur = null; selez(''); try { history.replaceState(null, '', location.pathname); } catch (e) {} }
$('grip').onclick = () => $('sheet').classList.toggle('big');
$('sheet').addEventListener('click', e => {
  if (e.target.closest('.close')) return chiudi();
  const b = e.target.closest('button[data-id]'); if (b) apri(b.dataset.id, true);
});
function specieDi(k) {
  const s = S[k]; if (s.s) return s.s;
  const set = new Set(); for (const c of s.n2k || []) for (const i of S[c].s) set.add(i); return [...set];
}
const testa = (n, b) => `<div><h2>${esc(n)}</h2>${b}</div><button class="close" aria-label="Chiudi">×</button>`;
const riga = (k, v) => v || v === 0 ? `<dt>${t(k)}</dt><dd>${v}</dd>` : '';
const fonteSIF = () => `<p class="src">${t('fonte')}: <a href="https://sifweb.regione.sicilia.it/arcgis/rest/services/SIF_CART_TEMATICA/MapServer" target="_blank" rel="noopener">${t('sif')}</a> · ${t('lsif')}</p>`;
const collegate = ids => ids.length ? `<h3>${t('dentro')}</h3><div class="links">${ids.map(c => `<button data-id="${c}">${esc(S[c].n)}<br><small>${t(S[c].t)} · ${fmt(S[c].ha)} ha</small></button>`).join('')}</div>` : '';
function apriCF(c) {
  cur = null; selez('');
  const [n, v] = CFN.tipi[c] || [c, []];
  $('sh').innerHTML = testa(n, `<span class="badge cf">${t('cf')}</span>`);
  let h = `<dl class="kv">${riga('cat', esc(CFN.macro[c.slice(0, 2)] || c.slice(0, 2)))}${riga('tf', esc(n))}<dt>Cod.</dt><dd>${esc(c)}</dd></dl><p class="note">${t('cfnota')}</p>`;
  if (v.length) h += `<details><summary>${t('varianti')}<em>${v.length}</em></summary><div class="hab">${v.map(x => `<div style="grid-template-columns:1fr"><span>${esc(x)}</span></div>`).join('')}</div></details>`;
  $('sb').innerHTML = h + fonteSIF(); mostra();
}
function apriAmb(k, s) {
  const b = `<span class="badge ${s.t}">${t(s.t)}</span>`;
  let h = '';
  if (s.t === 'bv') {
    $('sh').innerHTML = testa(s.n, b);
    h = `<div class="stats"><div><b>${String(s.ha).replace('.', LANG === 'it' ? ',' : '.')} ha</b><span>${t('sup')}</span></div><div><b>${esc(s.area || '–')}</b><span>${t('sist')}</span></div><div><b>${esc(s.topo || '–')}</b><span>${t('topo')}</span></div></div>`;
    h += `<dl class="kv">${riga('tf', esc(s.tf))}${riga('bio', esc(s.bio))}</dl>`;
  } else if (s.t === 'bs') {
    $('sh').innerHTML = testa(s.n, b);
    h = `<dl class="kv">${riga('sup', s.ha ? fmt(s.ha) + ' ha' : '')}${riga('spp', s.sp ? '<i>' + esc(s.sp) + '</i>' : '')}${riga('veg', esc(s.veg))}${riga('sub', esc(s.sub))}${riga('com', esc(s.com))}${riga('dec', esc(s.dec))}</dl>`;
  } else {
    $('sh').innerHTML = testa(s.n, b);
    h = `<div class="stats"><div><b>${s.circ ? fmt(s.circ) + ' cm' : '–'}</b><span>${t('circ')}</span></div><div><b>${s.h ? fmt(s.h) + ' m' : '–'}</b><span>${t('alt')}</span></div><div><b>${s.alt ? fmt(s.alt) + ' m' : '–'}</b><span>${t('quota')}</span></div></div>`;
    h += `<dl class="kv">${riga('com', esc(s.com + (s.prov ? ' (' + s.prov + ')' : '')))}${riga('crit', (s.crit || []).map(esc).join('<br>'))}${riga('dm', esc(s.prov_dm))}${s.urb ? riga('urb', '✓') : ''}</dl>`;
  }
  $('sb').innerHTML = h + collegate(s.in || []) + fonteSIF(); mostra();
}
function apri(k, vola) {
  if (k.startsWith('CF:')) return apriCF(k.slice(3));
  const s = S[k]; if (!s) return; cur = k;
  selez(k);
  try { history.replaceState(null, '', '#' + k); } catch (e) {}
  if (vola) map.fitBounds([[s.bb[0], s.bb[1]], [s.bb[2], s.bb[3]]], { padding: { top: 120, bottom: Math.min(innerHeight * 0.45, 380), left: 30, right: 30 }, maxZoom: s.t === 'am' ? 12 : 13, duration: 700 });
  if (AMB.includes(s.t)) {
    if (!ON[s.t]) $('c-' + s.t).click();
    return apriAmb(k, s);
  }
  const area = !k.startsWith('ITA');
  $('sh').innerHTML = `<div><h2>${esc(s.n)}</h2><span class="badge ${cls(s.t)}">${t(s.t)}</span>${s.iucn ? `<span class="badge">IUCN ${esc(s.iucn)}</span>` : ''}</div><button class="close" aria-label="Chiudi">×</button>`;
  const sp = specieDi(k), byG = {};
  for (const i of sp) (byG[SP.gr[i]] = byG[SP.gr[i]] || []).push(SP.nomi[i]);
  const max = s.b.length ? s.b[0][1] || 1 : 1;
  const hab = s.h || [];
  let h = `<div class="stats"><div><b>${fmt(s.ha)} ha</b><span>${t('sup')}</span></div><div><b>${s.bha ? fmt(s.bha) + ' ha' : '–'}</b><span>${t('boschi')}</span></div><div><b>${s.anno || sp.length || '–'}</b><span>${s.anno ? t('istit') : t('specie')}</span></div></div>`;
  h += `<h3>${t('boschi')}</h3>`;
  if (s.b.length) {
    h += `<p class="note">${area ? t('nba') : t('nb')}</p>` + s.b.map(([c, ha]) => `<div class="bar"><span class="t">${esc(nb(c))}<small>${c} · ${esc(LANG === 'it' ? H.boschi[c][1] : H.hab[c])}</small></span><span class="v">${ha ? fmt(ha) + ' ha' : '< 1 ha'}</span><span class="tr"><i style="width:${Math.max(2, ha / max * 100)}%"></i></span></div>`).join('');
  } else h += `<p class="note">${area && !(s.n2k || []).length ? t('nodati') : t('nobosco')}</p>`;
  if (hab.length) h += `<details><summary>${t('hab')}<em>${hab.length}</em></summary><div class="hab">${hab.map(x => `<div><code>${x.c}${x.p ? '*' : ''}</code><span>${esc(H.boschi[x.c] && LANG === 'it' ? H.boschi[x.c][1] : H.hab[x.c] || x.c)}</span><span>${x.ha ? fmt(x.ha) + ' ha' : ''}</span></div>`).join('')}</div></details>`;
  if (sp.length) {
    h += `<h3>${t('specie')} · ${fmt(sp.length)}</h3><p class="note">${area ? t('nspa') : t('nsp')}</p>`;
    h += Object.keys(TX.it.G).filter(g => byG[g]).map(g => `<details><summary>${t('G')[g]}<em>${byG[g].length}</em></summary><div class="list">${byG[g].sort().map(n => `<div><i>${esc(n)}</i></div>`).join('')}</div></details>`).join('');
  }
  const coll = (s.n2k || []).concat(s.aree || []).concat(Object.keys(S).filter(c => (S[c].in || []).includes(k)));
  if (coll.length) h += `<h3>${t('coll')}</h3><div class="links">${coll.map(c => `<button data-id="${c}">${esc(S[c].n)}<br><small>${t(S[c].t)}${S[c].ha ? ' · ' + fmt(S[c].ha) + ' ha' : ''}</small></button>`).join('')}</div>`;
  if (s.fonte === 'sif') h += `<p class="src">${t('fonte')}: <a href="https://sifweb.regione.sicilia.it/arcgis/rest/services/Parchi_Riserve/MapServer" target="_blank" rel="noopener">${t('sif')}</a> · ${t('lsif')}</p>`;
  else h += `<p class="src">${t('fonte')}: ${area ? `EEA NatDA v24 · <a href="https://regione.sicilia.it/istituzioni/regione/strutture-regionali/assessorato-territorio-ambiente/dipartimento-ambiente/aree-naturali-protette" target="_blank" rel="noopener">${t('reg')}</a>` : `<a href="https://natura2000.eea.europa.eu/Natura2000/SDF.aspx?site=${k}" target="_blank" rel="noopener">${t('sdf')} ${k}</a>`}</p>`;
  $('sb').innerHTML = h;
  mostra();
}
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h && S[h] && h !== cur) apri(h, true); });
testi();
}
