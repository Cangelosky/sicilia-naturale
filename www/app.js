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
    sif: 'Sistema Informativo Forestale (Regione Siciliana)', elenco: 'Elenco degli Alberi Monumentali di Sicilia (17/07/2026)', lsif: 'Corpo Forestale, Regione Siciliana',
    livelli: 'Livelli', gTut: 'Aree tutelate', gBos: 'Boschi e alberi', gHab: 'Zone con un tipo di bosco',
    perche: 'Un parco o una riserva è un’area con un ente che la gestisce e regole proprie. Natura 2000 è la rete europea che indica cosa va conservato: le ZSC tutelano habitat e specie, le ZPS gli uccelli. Lo stesso luogo può essere parco, ZSC e ZPS insieme.',
    dAree: 'Parchi regionali e nazionali, riserve naturali e aree marine protette, con un ente gestore e un regolamento.',
    dN2k: 'Rete europea Natura 2000. ZSC: habitat e specie rari (linea continua). ZPS: uccelli selvatici (tratteggio).',
    dBv: 'Boschi rimasti a lungo senza tagli, con alberi vecchi e legno morto: i più vicini alla foresta naturale (censimento 2026).',
    dAm: 'Alberi tutelati per età, dimensioni, rarità o valore storico, iscritti nell’elenco ufficiale della Regione.',
    dBs: 'Boschi scelti dal Corpo Forestale per raccogliere semi di qualità per vivai e rimboschimenti.',
    dCf: 'Il tipo di bosco di ogni particella forestale. Scegli i tipi che cerchi: da lontano sono punti, da vicino le particelle.',
    tuttiTipi: 'Tutti', nessunTipo: 'Nessuno',
    quiN: n => `Qui si sovrappongono ${n} zone`, quiNota: 'Lo stesso luogo può avere più tutele: tocca una zona per aprirne la scheda.',
    vb: n => n === 1 ? '1 bosco vetusto' : n + ' boschi vetusti', va: n => n === 1 ? '1 albero monumentale' : n + ' alberi monumentali',
    wiki: 'Da Wikipedia', wleggi: 'Leggi su Wikipedia', foto: 'Foto nei dintorni', fotoN: 'Foto da Wikimedia Commons: restano dei loro autori, con la licenza indicata.',
    vMappa: 'Esplora', vFunghi: 'Micologia', vPiante: 'Botanica', vEsc: 'Escursioni', vMeteo: 'Meteo',
    tMeteo: 'Meteo per le escursioni', lMeteo: 'I giorni migliori per uscire nei prossimi 14 giorni, calcolati con le previsioni e con la pioggia caduta nei 60 giorni precedenti (dati Open-Meteo).',
    luogo: 'Luogo', posiz: 'La mia posizione', carico: 'Carico i dati meteo…', errMeteo: 'Dati meteo non disponibili in questo momento. Riprova tra poco.',
    escTit: 'Escursione', escNota: 'Punteggio da 1 a 10: pioggia prevista, probabilità di pioggia, vento, temperatura e fango dei giorni precedenti.',
    funTit: 'Funghi', funNota: 'Modello T1 di Sottobosco, nella versione che stima dal meteo e dalla stagione (senza misure sul campo in questa zona): pioggia utile degli ultimi 60 giorni con il giusto ritardo, giorni di secco, notti troppo calde o fredde. Non è ancora validato: è un’indicazione, non una certezza.',
    migliori: 'Giorni migliori', pioggiaTit: 'Pioggia: 60 giorni passati e previsione', oggi: 'oggi', mm: 'mm',
    tEsc: 'Escursioni', lEsc: 'Scegli cosa vuoi cercare: ti proponiamo dove andare, con il meteo dei prossimi giorni. Puoi registrare il percorso mentre cammini.',
    iFunghi: 'Funghi', iAlberi: 'Alberi monumentali e boschi vetusti', iBoschi: 'Boschi', iFlora: 'Piante e fiori', iAlim: 'Piante alimurgiche',
    alimNota: 'Per le piante alimurgiche non abbiamo ancora l’elenco delle specie: per ora non entrano nei suggerimenti.',
    doveAndare: 'Dove andare', apriMappa: 'Mappa', vediMeteo: 'Meteo', reg: 'Registra il percorso', regInizia: 'Inizia a registrare', wpAgg: 'Punto', wpFoto: 'Foto', wpNome: 'Nome (facoltativo)', wpSalva: 'Salva punto', wpAnnulla: 'Annulla', wpNoFix: 'Aspetta il segnale GPS: nessuna posizione ancora.', wpOk: 'Punto salvato', wpPunti: 'punti', wpPunto: 'punto', wpFotoAgg: 'Aggiungi foto', wpTipi: { fungo: 'Fungo', albero: 'Albero', pianta: 'Pianta', panorama: 'Panorama', acqua: 'Acqua', rifugio: 'Rifugio', animale: 'Animale', foto: 'Foto', altro: 'Altro' }, regFine: 'Termina la registrazione',
    regConfIn: 'Iniziare la registrazione del percorso? Il GPS resta attivo anche a schermo spento finché non la termini.', regConfFine: 'Terminare e salvare la registrazione?',
    regNota: 'La registrazione usa il GPS del telefono e continua anche a schermo spento. Percorsi, punti e foto restano salvati solo su questo telefono.',
    noGps: 'Il GPS non è disponibile su questo dispositivo o il permesso è stato negato.',
    dist: 'Distanza', durata: 'Durata', disl: 'Dislivello +', miei: 'I miei percorsi', nessunTrk: 'Nessun percorso registrato.', gpx: 'GPX', elimina: 'Elimina', eliminaConf: 'Eliminare questo percorso? Non si potrà recuperare.',
    obiettivo: 'Obiettivo', sent: 'Sentieri e rifugi', dSent: 'Sentieri escursionistici, rifugi, bivacchi, aree attrezzate e sorgenti da OpenStreetMap. Visibili da vicino (zoom 11).',
    zoomSent: 'Avvicinati per vedere sentieri e rifugi', osmCar: 'Carico sentieri e rifugi da OpenStreetMap…', osmErr: 'I server di OpenStreetMap sono occupati: sentieri e rifugi non caricati. Riprova spostando la mappa tra poco.',
    vMap: 'Mappa', vList: 'Elenco', AR: { tutte: 'Tutta la Sicilia', pa: 'Palermitano', tp: 'Trapanese', sic: 'Sicani e Agrigentino', mad: 'Madonie', neb: 'Nebrodi', pel: 'Peloritani', etn: 'Etna e Alcantara', cen: 'Sicilia centrale', ibl: 'Iblei e Sud-Est', iso: 'Isole minori' },
    perEsc: 'Escursione', perFun: 'Funghi', miglioriQui: 'I migliori', schedaZona: 'Scheda della zona', soloApp: 'La registrazione del percorso è disponibile nell’app per telefono.', regApp: 'Registra percorso',
    toccaZona: 'Tocca una zona sulla mappa per i 14 giorni di previsione.', toccaEsc: 'Tocca una zona per la scheda. I colori indicano quanto è adatta a ciò che cerchi.',
    terTit: 'Il terreno in questo punto', questo: 'Questo punto', quotaT: 'Quota', pend: 'Pendenza', espo: 'Esposizione', geol: 'Geologia', subs: 'Substrato', eta: 'Età',
    terCar: 'Leggo quota, esposizione e geologia…', terNo: 'Dati del terreno non disponibili per questo punto.', pianeggiante: 'pianeggiante',
    SUB: { carb: 'carbonatico (calcari, dolomie)', sil: 'silicatico (arenarie, quarziti, rocce cristalline)', arg: 'argilloso e marnoso', vulc: 'vulcanico', all: 'sabbie, ghiaie e depositi sciolti', ges: 'gessoso ed evaporitico' },
    DIR: ['nord', 'nord-est', 'est', 'sud-est', 'sud', 'sud-ovest', 'ovest', 'nord-ovest'],
    terFonte: 'Quota: modello del terreno Copernicus 90 m (Open-Meteo). Geologia: Carta Litologica d’Italia 1:100.000 (ISPRA, CC BY 4.0).',
    piovoso: 'pioggia', ventoso: 'vento forte', caldo: 'caldo', freddo: 'freddo', fango: 'terreno bagnato', temporale: 'temporali', ok: 'buono',
    tFunghi: 'Micologia siciliana', lFunghi: n => `${fmt(n)} specie di funghi segnalate in Sicilia, dal database Micelio dell’Associazione Micologica G. Inzenga (segnalazioni GBIF). Tocca una specie per la scheda, le foto e dove è stata trovata.`,
    tPiante: 'Botanica siciliana', lPiante: n => `${fmt(n)} piante dei siti Natura 2000 siciliani, degli alberi monumentali e dei boschi da seme. Tocca una specie per la scheda e i luoghi dove cresce.`,
    cercaSp: 'Cerca una specie, un genere, una famiglia…', tutte: 'Tutte', conFoto: 'Con foto', alberi: 'Alberi e arbusti', nSp: n => `${fmt(n)} specie`, altri: 'Mostra altre',
    GF: { aga: 'A lamelle', bol: 'Boleti', rus: 'Russule e lattari', pol: 'Polipori e funghi del legno', can: 'Cantarelli, idni e clavarie', pez: 'Spugnole, pezize e tartufi', pal: 'Vesce, geastri e falli', gel: 'Gelatinosi', alt: 'Altri' },
    segn: n => `${fmt(n)} segnalazioni in Sicilia`, nsiti: n => n === 1 ? '1 sito Natura 2000' : `${fmt(n)} siti Natura 2000`,
    dove: 'Dove si trova', vediMappa: 'Vedi sulla mappa dove è stata segnalata', gbifChip: 'Segnalazioni GBIF:',
    nocomm: 'Sicilia Naturale non dà indicazioni sulla commestibilità. Per il consumo rivolgiti sempre a un ispettorato micologico.',
    fotoMic: 'Foto: Micelio, Associazione Micologica G. Inzenga', gbif: 'Scheda su GBIF',
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
    sif: 'Forest Information System (Sicilian Region)', elenco: 'List of Monumental Trees of Sicily (17/07/2026)', lsif: 'Forestry Corps, Sicilian Region',
    livelli: 'Layers', gTut: 'Protected areas', gBos: 'Forests and trees', gHab: 'Areas with a forest type',
    perche: 'A park or reserve is an area with a managing body and its own rules. Natura 2000 is the European network that says what must be conserved: SACs protect habitats and species, SPAs protect birds. The same place can be a park, an SAC and an SPA at once.',
    dAree: 'Regional and national parks, nature reserves and marine protected areas, each with a managing body and rules.',
    dN2k: 'European Natura 2000 network. SAC: rare habitats and species (solid line). SPA: wild birds (dashed).',
    dBv: 'Forests left uncut for a long time, with old trees and deadwood: the closest to natural forest (2026 survey).',
    dAm: 'Trees protected for age, size, rarity or historical value, on the Region’s official list.',
    dBs: 'Forests chosen by the Forestry Corps to collect quality seed for nurseries and reforestation.',
    dCf: 'The forest type of every forest stand. Pick the types you are looking for: points from afar, stands up close.',
    tuttiTipi: 'All', nessunTipo: 'None',
    quiN: n => `${n} areas overlap here`, quiNota: 'The same place can have several kinds of protection: tap one to open it.',
    vb: n => n === 1 ? '1 old-growth forest' : n + ' old-growth forests', va: n => n === 1 ? '1 monumental tree' : n + ' monumental trees',
    wiki: 'From Wikipedia', wleggi: 'Read on Wikipedia', foto: 'Photos nearby', fotoN: 'Photos from Wikimedia Commons: they belong to their authors, under the licence shown.',
    vMappa: 'Explore', vFunghi: 'Mycology', vPiante: 'Botany', vEsc: 'Hikes', vMeteo: 'Weather',
    tMeteo: 'Weather for hikes', lMeteo: 'The best days to go out in the next 14 days, from the forecast and the rain of the previous 60 days (Open-Meteo data).',
    luogo: 'Place', posiz: 'My location', carico: 'Loading weather data…', errMeteo: 'Weather data not available right now. Please try again shortly.',
    escTit: 'Hike', escNota: 'Score from 1 to 10: forecast rain, chance of rain, wind, temperature and mud from previous days.',
    funTit: 'Fungi', funNota: 'Sottobosco’s T1 model, in the version that estimates from weather and season (no field measurements in this area): useful rain of the last 60 days with the right delay, dry spells, nights too warm or too cold. Not yet validated: a hint, not a certainty.',
    migliori: 'Best days', pioggiaTit: 'Rain: past 60 days and forecast', oggi: 'today', mm: 'mm',
    tEsc: 'Hikes', lEsc: 'Choose what you want to look for: we suggest where to go, with the weather for the coming days. You can record your route as you walk.',
    iFunghi: 'Fungi', iAlberi: 'Monumental trees and old-growth forests', iBoschi: 'Forests', iFlora: 'Plants and flowers', iAlim: 'Wild edible plants',
    alimNota: 'We do not yet have the species list for wild edible plants: for now they are not part of the suggestions.',
    doveAndare: 'Where to go', apriMappa: 'Map', vediMeteo: 'Weather', reg: 'Record your route', regInizia: 'Start recording', wpAgg: 'Waypoint', wpFoto: 'Photo', wpNome: 'Name (optional)', wpSalva: 'Save waypoint', wpAnnulla: 'Cancel', wpNoFix: 'Wait for GPS: no position yet.', wpOk: 'Waypoint saved', wpPunti: 'waypoints', wpPunto: 'waypoint', wpFotoAgg: 'Add photo', wpTipi: { fungo: 'Mushroom', albero: 'Tree', pianta: 'Plant', panorama: 'View', acqua: 'Water', rifugio: 'Shelter', animale: 'Animal', foto: 'Photo', altro: 'Other' }, regFine: 'Stop recording',
    regConfIn: 'Start recording the route? GPS stays on, even with the screen off, until you stop.', regConfFine: 'Stop and save the recording?',
    regNota: 'Recording uses the phone’s GPS and keeps going with the screen off. Routes, waypoints and photos stay on this phone only.',
    noGps: 'GPS is not available on this device or permission was denied.',
    dist: 'Distance', durata: 'Duration', disl: 'Ascent', miei: 'My routes', nessunTrk: 'No recorded routes.', gpx: 'GPX', elimina: 'Delete', eliminaConf: 'Delete this route? It cannot be recovered.',
    obiettivo: 'Goal', sent: 'Trails and huts', dSent: 'Hiking routes, huts, shelters, picnic areas and springs from OpenStreetMap. Visible up close (zoom 11).',
    zoomSent: 'Zoom in to see trails and huts', osmCar: 'Loading trails and huts from OpenStreetMap…', osmErr: 'OpenStreetMap servers are busy: trails and huts not loaded. Move the map to try again shortly.',
    vMap: 'Map', vList: 'List', AR: { tutte: 'All of Sicily', pa: 'Palermo area', tp: 'Trapani area', sic: 'Sicani and Agrigento', mad: 'Madonie', neb: 'Nebrodi', pel: 'Peloritani', etn: 'Etna and Alcantara', cen: 'Central Sicily', ibl: 'Iblei and South-East', iso: 'Minor islands' },
    perEsc: 'Hike', perFun: 'Fungi', miglioriQui: 'The best', schedaZona: 'Area page', soloApp: 'Route recording is available in the phone app.', regApp: 'Record route',
    toccaZona: 'Tap an area on the map for its 14-day forecast.', toccaEsc: 'Tap an area for its page. Colours show how well it suits what you are looking for.',
    terTit: 'The ground at this point', questo: 'This point', quotaT: 'Elevation', pend: 'Slope', espo: 'Aspect', geol: 'Geology', subs: 'Substrate', eta: 'Age',
    terCar: 'Reading elevation, aspect and geology…', terNo: 'Ground data not available for this point.', pianeggiante: 'flat',
    SUB: { carb: 'carbonate (limestone, dolomite)', sil: 'siliceous (sandstone, quartzite, crystalline rock)', arg: 'clay and marl', vulc: 'volcanic', all: 'sand, gravel and loose deposits', ges: 'gypsum and evaporites' },
    DIR: ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'],
    terFonte: 'Elevation: Copernicus 90 m terrain model (Open-Meteo). Geology: Lithological Map of Italy 1:100,000 (ISPRA, CC BY 4.0).',
    piovoso: 'rain', ventoso: 'strong wind', caldo: 'heat', freddo: 'cold', fango: 'wet ground', temporale: 'thunderstorms', ok: 'good',
    tFunghi: 'Sicilian mycology', lFunghi: n => `${fmt(n)} fungus species recorded in Sicily, from the Micelio database of the G. Inzenga Mycological Association (GBIF records). Tap a species for its page, photos and where it was found.`,
    tPiante: 'Sicilian botany', lPiante: n => `${fmt(n)} plants of Sicily’s Natura 2000 sites, monumental trees and seed stands. Tap a species for its page and the places where it grows.`,
    cercaSp: 'Search a species, genus or family…', tutte: 'All', conFoto: 'With photos', alberi: 'Trees and shrubs', nSp: n => `${fmt(n)} species`, altri: 'Show more',
    GF: { aga: 'Gilled', bol: 'Boletes', rus: 'Russulas and milkcaps', pol: 'Polypores and wood fungi', can: 'Chanterelles, hedgehogs and corals', pez: 'Morels, cups and truffles', pal: 'Puffballs, earthstars and stinkhorns', gel: 'Jelly fungi', alt: 'Others' },
    segn: n => `${fmt(n)} records in Sicily`, nsiti: n => n === 1 ? '1 Natura 2000 site' : `${fmt(n)} Natura 2000 sites`,
    dove: 'Where it grows', vediMappa: 'Show on the map where it was recorded', gbifChip: 'GBIF records:',
    nocomm: 'Sicilia Naturale gives no information on edibility. Always ask a mycological inspectorate before eating any fungus.',
    fotoMic: 'Photo: Micelio, G. Inzenga Mycological Association', gbif: 'Page on GBIF',
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

style.sources.dem3d = { type: 'raster-dem', tiles: ['loc://d/{z}/{x}/{y}'], encoding: 'terrarium', tileSize: 256, minzoom: 5, maxzoom: 8, bounds: B };
const map = new maplibregl.Map({ container: 'map', style, bounds: [[12.3, 36.55], [15.7, 38.35]], fitBoundsOptions: { padding: 20 }, minZoom: 6, maxZoom: 15, maxPitch: 70, maxBounds: [[10.5, 34.6], [17, 39.6]], attributionControl: false });
/* mappa 3D: rilievo vero (DEM Terrarium) con esagerazione verticale, inclinazione e rotazione */
let tre = false;
const b3 = document.createElement('button'); b3.className = 'btn3d'; b3.textContent = '3D'; b3.setAttribute('aria-pressed', 'false'); document.getElementById('wrap').appendChild(b3);
b3.onclick = () => {
  tre = !tre; b3.classList.toggle('on', tre); b3.setAttribute('aria-pressed', tre);
  if (tre) { map.setTerrain({ source: 'dem3d', exaggeration: 1.8 }); map.easeTo({ pitch: 62, bearing: map.getBearing() || -15, duration: 900 }); }
  else { map.easeTo({ pitch: 0, bearing: 0, duration: 700 }); setTimeout(() => { if (!tre) map.setTerrain(null); }, 720); }
};
map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), 'bottom-right');
map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: 'Dati zone: EEA Natura 2000, EEA NatDA · Regione Siciliana, SIF' }), 'bottom-left');

/* ---------- dati */
let S = {}, SP = { nomi: [], gr: [] }, H = { boschi: {}, hab: {} }, GJ, CFN = { tipi: {}, macro: {} }, GV, GS, GA, CFP;
const DENTRO = {};   // zona -> boschi vetusti, boschi da seme e alberi che contiene
const D = Promise.all(['schede', 'specie', 'habitat', 'zone', 'carta_forestale_nomi', 'vetusti', 'seme', 'alberi', 'cf_punti'].map(n => fetch('data/' + n + '.json').then(r => r.json())))
  .then(([a, b, c, g, n, v, s, al, cp]) => {
    S = a; SP = b; H = c; GJ = g; CFN = n; GV = v; GS = s; GA = al;
    CFP = { type: 'FeatureCollection', features: cp.p.map(q => ({ type: 'Feature', properties: { m: cp.m[q[2]], h: q[3] }, geometry: { type: 'Point', coordinates: [q[0], q[1]] } })) };
    for (const [k, x] of Object.entries(S)) for (const z of x.in || []) (DENTRO[z] = DENTRO[z] || []).push(k);
  });
/* colori della carta forestale per macrocategoria (codici SIF) */
const CFC = { FA: '#1f6b3a', CE: '#5a8f29', QU: '#8fae3c', CA: '#a0702a', LE: '#2e5e4e', SU: '#b5893c', OS: '#6f9d6a', BA: '#4f9a73', FR: '#3d8fb0',
  PL: '#3f4f7a', PM: '#7a6fb0', RI: '#9b8ea6', AS: '#c3b26a', MM: '#d9a066', BS: '#c9c9a0' };
const AMB = ['bv', 'bs', 'am'];
let FUN = null, PIA = null;
const CAT = Promise.all(['funghi', 'piante'].map(n => fetch('data/' + n + '.json').then(r => r.json()))).then(([f, p]) => { FUN = f; PIA = p; });

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
  map.addSource('cfp', { type: 'geojson', data: CFP });
  map.addLayer({ id: 'cf-p', type: 'circle', source: 'cfp', maxzoom: 9, layout: { visibility: 'none' },
    paint: { 'circle-color': ['match', ['get', 'm'], ...Object.entries(CFC).flat(), '#999'], 'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, ['min', 3, ['max', 0.8, ['/', ['sqrt', ['get', 'h']], 4]]], 8.9, ['min', 6, ['max', 1.6, ['/', ['sqrt', ['get', 'h']], 2]]]], 'circle-opacity': 0.8 } }, 'n2k-f');
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
  map.addSource('osm', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, attribution: '© OpenStreetMap (ODbL)' });
  map.addLayer({ id: 'osm-l', type: 'line', source: 'osm', filter: ['==', ['geometry-type'], 'LineString'], layout: { visibility: 'none', 'line-cap': 'round' }, paint: { 'line-color': '#b3261e', 'line-width': 2, 'line-dasharray': [2, 1.6] } });
  map.addLayer({ id: 'osm-p', type: 'circle', source: 'osm', filter: ['==', ['geometry-type'], 'Point'], layout: { visibility: 'none' }, paint: { 'circle-radius': 6, 'circle-color': ['match', ['get', 'k'], 'r', '#7a3e00', 'w', '#1d6fa5', '#2d6a4f'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } });
  map.addLayer({ id: 'osm-t', type: 'symbol', source: 'osm', minzoom: 12.5, filter: ['==', ['geometry-type'], 'Point'], layout: { visibility: 'none', 'text-field': ['get', 'n'], 'text-font': ['Noto Sans Regular'], 'text-size': 11, 'text-offset': [0, 1.2], 'text-anchor': 'top', 'text-optional': true }, paint: { 'text-color': '#3b2a14', 'text-halo-color': '#fff', 'text-halo-width': 1.4 } });
  map.addSource('hl', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addSource('hlp', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  const scala = ['interpolate', ['linear'], ['get', 'v'], 1, '#d1495b', 4, '#edae49', 6.5, '#8fc93a', 9, '#1f9e6e'];
  map.addLayer({ id: 'hl-f', type: 'fill', source: 'hl', paint: { 'fill-color': scala, 'fill-opacity': 0.42 } });
  map.addLayer({ id: 'hl-g', type: 'line', source: 'hl', paint: { 'line-color': scala, 'line-width': 9, 'line-opacity': 0.22, 'line-blur': 4 } });
  map.addLayer({ id: 'hl-l', type: 'line', source: 'hl', paint: { 'line-color': scala, 'line-width': 2.2 } });
  map.addLayer({ id: 'hl-t', type: 'symbol', source: 'hlp', layout: { 'text-field': ['format', ['get', 'vs'], { 'font-scale': 1.25 }, '\n', {}, ['get', 'lab'], { 'font-scale': 0.85 }], 'text-font': ['Noto Sans Regular'], 'text-size': 13, 'text-max-width': 9, 'text-padding': 4 }, paint: { 'text-color': '#10261c', 'text-halo-color': 'rgba(255,255,255,.92)', 'text-halo-width': 1.6 } });
  map.addSource('trk', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({ id: 'trk-l', type: 'line', source: 'trk', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#1b4332', 'line-width': 4, 'line-opacity': 0.9 } });
  map.on('moveend', () => { if (ON.osm) caricaOSM(); });
  map.addLayer({ id: 'sel', type: 'line', source: 'z', filter: ['==', ['get', 'id'], ''], paint: { 'line-color': '#e76f51', 'line-width': 3 } });
  for (const s of ['bv', 'bs']) map.addLayer({ id: 'sel-' + s, type: 'line', source: s, filter: ['==', ['get', 'id'], ''], paint: { 'line-color': '#e76f51', 'line-width': 3 } });
  map.addLayer({ id: 'sel-am', type: 'circle', source: 'am', filter: ['==', ['get', 'id'], ''], paint: { 'circle-radius': 9, 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': '#e76f51', 'circle-stroke-width': 3 } });
  base = { 'n2k-f': isZ, 'n2k-l': isZ, 'zps-f': isP, 'zps-l': isP, 'aree-f': isA, 'aree-l': isA };
  applica();
  const h = location.hash.slice(1); if (h && S[h]) apri(h, true);
}));
let base = {};

/* ---------- livelli e filtri */
let bosco = '';
const ON = { aree: true, n2k: true, bv: true, am: true, bs: false, cf: false, osm: false };
let cfSel = null;   // macrocategorie scelte; null = tutte
const LIV = { osm: ['osm-l', 'osm-p', 'osm-t'], cf: ['cf-f', 'cf-l', 'cf-p'], bv: ['bv-f', 'bv-l', 'bv-p', 'sel-bv'], am: ['am-c', 'sel-am'], bs: ['bs-f', 'bs-l', 'sel-bs'] };
function applica() {
  if (!map.getLayer('aree-f')) return;
  let ids = null;
  if (bosco) ids = Object.keys(S).filter(k => bosco === '*' ? S[k].bha > 0 : S[k].b.some(b => b[0] === bosco));
  for (const [l, f] of Object.entries(base)) {
    const vis = l.startsWith('aree') ? ON.aree : ON.n2k;
    map.setLayoutProperty(l, 'visibility', vis ? 'visible' : 'none');
    map.setFilter(l, ids ? ['all', f, ['in', ['get', 'id'], ['literal', ids]]] : f);
  }
  for (const [k, ls] of Object.entries(LIV)) for (const l of ls) if (map.getLayer(l)) map.setLayoutProperty(l, 'visibility', ON[k] ? 'visible' : 'none');
  const fm = cfSel ? ['in', ['get', 'm'], ['literal', [...cfSel]]] : null;
  for (const l of ['cf-f', 'cf-l', 'cf-p']) if (map.getLayer(l)) map.setFilter(l, fm);
  // con la carta forestale accesa le campiture delle zone si attenuano, restano i contorni
  map.setPaintProperty('n2k-f', 'fill-opacity', ON.cf ? 0.03 : 0.12);
  map.setPaintProperty('aree-f', 'fill-opacity', ON.cf ? 0.04 : 0.2);
  $('liv-n').textContent = Object.values(ON).filter(Boolean).length;
  if (ON.osm) caricaOSM();
  if (document.body.classList.contains('mm')) for (const l of [...Object.keys(base), ...Object.values(LIV).flat()]) if (map.getLayer(l)) map.setLayoutProperty(l, 'visibility', 'none');
  legenda();
}
const SW = {
  aree: '<i style="width:18px;height:14px;border-radius:3px;background:#2d6a4f55;border:2px solid #1b4332"></i>',
  n2k: '<i style="width:18px;height:14px;border-radius:3px;background:#2f7ea822;border:2px solid #2f7ea8;box-shadow:3px 3px 0 -1px #fff,3px 3px 0 0 #7a5ea8"></i>',
  bv: '<i style="width:18px;height:14px;border-radius:3px;background:#c2571a99;border:2px solid #8a3a0e"></i>',
  am: '<i style="width:12px;height:12px;border-radius:50%;background:#5b3a1a;box-shadow:0 0 0 2px #fff,0 0 0 3px #5b3a1a"></i>',
  bs: '<i style="width:18px;height:14px;border-radius:3px;background:#9a7b2f44;border:2px dashed #7a5f1f"></i>',
  cf: '<i style="width:20px;height:16px;border-radius:4px;background:linear-gradient(135deg,#1f6b3a 0 33%,#8fae3c 33% 66%,#a0702a 66%)"></i>',
  osm: '<i style="width:20px;height:0;border-top:3px dashed #b3261e"></i>'
};
const riga_lv = (k, tit, d) => `<div class="lv${ON[k] ? ' on' : ''}" data-lv="${k}" role="switch" aria-checked="${ON[k]}" tabindex="0"><span class="sw" style="background:#f1f4f2">${SW[k]}</span><span><b>${tit}</b><small>${d}</small></span><span class="sw-t"></span></div>`;
function pannello() {
  const cnt = {}; for (const x of Object.values(S)) for (const b of x.b || []) cnt[b[0]] = (cnt[b[0]] || 0) + 1;
  const opts = Object.keys(H.boschi).filter(c => cnt[c]).sort((a, b) => nb(a).localeCompare(nb(b)));
  const mac = Object.keys(CFC).filter(m => CFN.macro[m]);
  $('liv').innerHTML = `<h4>${t('gTut')}</h4><div class="perche">${t('perche')}</div>`
    + riga_lv('aree', t('aree'), t('dAree')) + riga_lv('n2k', t('n2k') + ' · ZSC / ZPS', t('dN2k'))
    + `<h4>${t('gHab')}</h4><select id="bosco"><option value="">${t('tutti')}</option><option value="*">${t('solo')}</option>${opts.map(c => `<option value="${c}">${esc(nb(c))}</option>`).join('')}</select>`
    + `<h4>${t('gBos')}</h4>` + riga_lv('bv', t('bvs'), t('dBv')) + riga_lv('am', t('ams'), t('dAm')) + riga_lv('cf', t('cf'), t('dCf'))
    + `<div class="cft">${mac.map(m => `<button data-m="${m}" class="${ON.cf && (!cfSel || cfSel.has(m)) ? 'on' : ''}"><i style="background:${CFC[m]}"></i>${esc(CFN.macro[m])}</button>`).join('')}<button class="tutti" data-m="*">${t('tuttiTipi')}</button><button class="tutti" data-m="-">${t('nessunTipo')}</button></div>`
    + riga_lv('bs', t('bss'), t('dBs')) + `<h4>${t('vEsc')}</h4>` + riga_lv('osm', t('sent'), t('dSent'));
  $('bosco').value = bosco;
  $('bosco').onchange = e => { bosco = e.target.value; applica(); };
}
$('liv').addEventListener('click', e => {
  const r = e.target.closest('.lv'), m = e.target.closest('.cft button');
  if (r) { const k = r.dataset.lv; ON[k] = !ON[k]; if (k === 'cf' && ON.cf && map.getZoom() < 7.5) map.easeTo({ zoom: 7.5, duration: 500 }); }
  else if (m) {
    const all = Object.keys(CFC).filter(x => CFN.macro[x]);
    if (m.dataset.m === '*') cfSel = null;
    else if (m.dataset.m === '-') cfSel = new Set();
    else {
      // primo tocco su un tipo: si vede solo quello; poi si aggiungono o tolgono gli altri
      if (!ON.cf || !cfSel) cfSel = new Set();
      cfSel.has(m.dataset.m) ? cfSel.delete(m.dataset.m) : cfSel.add(m.dataset.m);
      if (cfSel.size === all.length) cfSel = null;
    }
    ON.cf = !cfSel || cfSel.size > 0;
  } else return;
  applica(); const st = $('liv').scrollTop; pannello(); $('liv').scrollTop = st;
});
$('liv').addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('lv')) { e.preventDefault(); e.target.click(); } });
$('btn-liv').onclick = () => { const o = !$('liv').classList.contains('open'); $('liv').classList.toggle('open', o); $('btn-liv').setAttribute('aria-expanded', o); if (o) { $('res').style.display = 'none'; pannello(); } };
const chiudiLiv = () => { $('liv').classList.remove('open'); $('btn-liv').setAttribute('aria-expanded', false); };

/* ---------- testi */
const nb = c => LANG === 'it' ? (H.boschi[c] || [c])[0] : (BOSCO_EN[c] || c);
function testi() {
  document.documentElement.lang = LANG;
  $('l-it').classList.toggle('on', LANG === 'it'); $('l-en').classList.toggle('on', LANG === 'en');
  $('q').placeholder = t('cerca');
  $('liv-t').textContent = t('livelli');
  for (const b of document.querySelectorAll('#sez button')) b.querySelector('span').textContent = t({ mappa: 'vMappa', funghi: 'vFunghi', piante: 'vPiante', escursioni: 'vEsc', meteo: 'vMeteo' }[b.dataset.v]);
  if (vista === 'funghi' || vista === 'piante') catalogo(true); else if (vista === 'meteo') meteo(); else if (vista === 'escursioni' && window.escursioni) escursioni();
  D.then(() => { if ($('liv').classList.contains('open')) pannello(); legenda(); });
  if (cur) apri(cur, false);
}
function legenda() {
  let h = [['#2d6a4f', 'legA', 1, ON.aree], ['#1d6fa5', 'legM', 1, ON.aree], ['#2f7ea8', 'legZ', 0, ON.n2k], ['#7a5ea8', 'legP', 0, ON.n2k]].filter(x => x[3]).map(([c, k, f]) => `<div><i style="background:${c}${f ? '55' : '22'};border:1.5px ${k === 'legP' ? 'dashed' : 'solid'} ${c}"></i>${t(k)}</div>`).join('');
  if (ON.bv) h += `<div><i style="background:#c2571a99;border:1.5px solid #8a3a0e"></i>${t('bvs')}</div>`;
  if (ON.am) h += `<div><i style="background:#5b3a1a;border-radius:50%;width:10px;margin:0 2px;border:1.5px solid #fff;box-shadow:0 0 0 1px #5b3a1a"></i>${t('ams')}</div>`;
  if (ON.bs) h += `<div><i style="background:#9a7b2f44;border:1.5px dashed #7a5f1f"></i>${t('bss')}</div>`;
  if (ON.cf) h += `<div class="lt">${t('cf')}</div>` + Object.entries(CFC).filter(([m]) => CFN.macro[m] && (!cfSel || cfSel.has(m))).map(([m, c]) => `<div><i style="background:${c}"></i>${esc(CFN.macro[m])}</div>`).join('');
  $('legend').innerHTML = h;
}
const setLang = l => { LANG = l; try { localStorage.setItem('sn_lang', l); } catch (e) {} testi(); };
$('l-it').onclick = () => setLang('it'); $('l-en').onclick = () => setLang('en');

/* ---------- ricerca */
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
$('q').oninput = () => {
  const v = norm($('q').value.trim()); $('qx').style.display = v ? 'block' : 'none';
  if (v.length < 2) { $('res').style.display = 'none'; return; }
  chiudiLiv();
  const w = v.split(/\s+/);
  const r = Object.entries(S).filter(([k, s]) => { const n = norm(s.n + ' ' + k + ' ' + (s.sp || '') + ' ' + (s.vg || '') + ' ' + (s.com || '')); return w.every(x => n.includes(x)); })
    .sort((a, b) => (AREE.includes(b[1].t) - AREE.includes(a[1].t)) || b[1].ha - a[1].ha).slice(0, 30);
  $('res').innerHTML = r.length ? r.map(([k, s]) => `<button data-id="${k}">${esc(s.n)}<small>${t(s.t)}${s.vg ? ' · ' + esc(s.vg) : ''}${s.ha ? ' · ' + fmt(s.ha) + ' ha' : s.com ? ' · ' + esc(s.com) : ''}</small></button>`).join('') : `<button disabled>${t('nessuno')}</button>`;
  $('res').style.display = 'block';
};
$('res').onclick = e => { const b = e.target.closest('button[data-id]'); if (!b) return; $('res').style.display = 'none'; $('q').blur(); apri(b.dataset.id, true); };
$('qx').onclick = () => { $('q').value = ''; $('q').oninput(); $('q').focus(); };

/* ---------- click sulla mappa */
map.on('click', e => {
  chiudiLiv();
  if (document.body.classList.contains('recon')) return;
  if (document.body.classList.contains('mm')) {
    const f = map.queryRenderedFeatures(e.point, { layers: ['hl-f'] });
    if (f.length) { const k = f[0].properties.id; vista === 'meteo' ? apriMeteoZona(k) : apri(k, false); } else chiudi();
    return;
  }
  const L = ['am-c', 'bv-p', 'bv-f', 'bs-f', 'aree-f', 'n2k-f', 'zps-f', 'cf-f'].filter(l => map.getLayer(l) && map.getLayoutProperty(l, 'visibility') !== 'none');
  const box = [[e.point.x - 6, e.point.y - 6], [e.point.x + 6, e.point.y + 6]];
  const fp = map.queryRenderedFeatures(box, { layers: L.filter(l => l === 'am-c' || l === 'bv-p') });
  const f = fp.length ? fp : map.queryRenderedFeatures(e.point, { layers: L });
  const ids = [...new Set(f.map(x => x.layer.id === 'cf-f' ? 'CF:' + x.properties.c : x.properties.id))].filter(k => S[k] || k.startsWith('CF:'));
  $('res').style.display = 'none';
  punto = e.lngLat;
  if (!ids.length) { cur = null; selez(''); $('sh').innerHTML = `<div><h2>${t('questo')}</h2><small class="note">${e.lngLat.lat.toFixed(5)}, ${e.lngLat.lng.toFixed(5)}</small></div><button class="close" aria-label="Chiudi">×</button>`; $('sb').innerHTML = '<div id="ter"></div>'; mostra(); return terreno(e.lngLat); }
  if (ids.length === 1) { apri(ids[0], false); $('sb').insertAdjacentHTML('beforeend', '<div id="ter"></div>'); return terreno(e.lngLat); }
  const rank = k => k.startsWith('CF:') ? 9 : AMB.includes(S[k].t) ? 0 : AREE.includes(S[k].t) ? 1 : 2;
  ids.sort((a, b) => rank(a) - rank(b) || (S[a] && S[b] ? S[a].ha - S[b].ha : 0));
  cur = null; selez('');
  $('sh').innerHTML = `<div><h2>${t('quiN')(ids.length)}</h2></div><button class="close" aria-label="Chiudi">×</button>`;
  $('sb').innerHTML = `<div class="pick"><p class="intro">${t('quiNota')}</p>` + ids.map(k => {
    const c = colore(k), ty = k.startsWith('CF:') ? t('cf') : t(S[k].t), nm = k.startsWith('CF:') ? tipoCF(k.slice(3)) : S[k].n;
    return `<button data-id="${k}"><span class="bar5" style="background:${c}"></span><span><span class="ty" style="color:${c}">${esc(ty)}</span><span class="nm">${esc(nm)}</span><span class="su">${sintesi(k)}</span></span><span class="go">›</span></button>`;
  }).join('') + '</div><div id="ter"></div>';
  mostra(); terreno(e.lngLat);
});
let punto = null;
/* lente del terreno: quota, pendenza ed esposizione (9 punti attorno), geologia e substrato (ISPRA) */
function substrato(tx) {
  tx = (tx || '').toLowerCase();
  if (/lav|basalt|tuf|vulcan|piroclast|ialoclast/.test(tx)) return 'vulc';
  if (/gess|evapor|salgem/.test(tx)) return 'ges';
  if (/calcar|dolom|calcaren|travertin/.test(tx)) return 'carb';
  if (/argill|marn|flysch|pelit/.test(tx)) return 'arg';
  if (/arenar|quarz|granit|gneiss|scist|filladi|metamorf|conglomer|siltit/.test(tx)) return 'sil';
  if (/sabbi|ghiai|alluvi|detrit|depositi|limi|ciottol/.test(tx)) return 'all';
  return '';
}
async function terreno(ll) {
  const box = $('ter'); if (!box) return;
  box.innerHTML = `<h3>${t('terTit')}</h3><p class="note">${t('terCar')}</p>`;
  const dy = 0.0009, dx = 0.00114, la = [], lo = [];
  for (const j of [1, 0, -1]) for (const i of [-1, 0, 1]) { la.push((ll.lat + j * dy).toFixed(5)); lo.push((ll.lng + i * dx).toFixed(5)); }
  const [el, ge] = await Promise.all([
    getJ(`https://api.open-meteo.com/v1/elevation?latitude=${la.join(',')}&longitude=${lo.join(',')}`),
    getJ(`https://sinacloud.isprambiente.it/arcgisgeo/rest/services/geo/SGI_ISPRA_Litologica100k/MapServer/identify?geometry=${ll.lng.toFixed(5)},${ll.lat.toFixed(5)}&geometryType=esriGeometryPoint&sr=4326&layers=all:1&tolerance=0&mapExtent=${(ll.lng - 0.05).toFixed(3)},${(ll.lat - 0.05).toFixed(3)},${(ll.lng + 0.05).toFixed(3)},${(ll.lat + 0.05).toFixed(3)}&imageDisplay=400,400,96&returnGeometry=false&f=json`)
  ]);
  if (punto !== ll || !$('ter')) return;
  const r = [];
  const z = el && el.elevation;
  if (z && z.length === 9 && z.every(v => v != null)) {
    const gx = ((z[2] + 2 * z[5] + z[8]) - (z[0] + 2 * z[3] + z[6])) / (8 * 100), gy = ((z[0] + 2 * z[1] + z[2]) - (z[6] + 2 * z[7] + z[8])) / (8 * 100);
    const pend = Math.atan(Math.hypot(gx, gy)) * 180 / Math.PI, az = (Math.atan2(-gx, -gy) * 180 / Math.PI + 360) % 360;
    r.push(['quotaT', fmt(z[4]) + ' m'], ['pend', Math.round(pend) + '°'], ['espo', pend < 3 ? t('pianeggiante') : t('DIR')[Math.round(az / 45) % 8]]);
  }
  const g = ge && (ge.results || []).find(x => x.layerId === 1);
  if (g) {
    const a = g.attributes, sb = substrato(a.LITOLOGIA + ' ' + a.CLASSI_LITOLOGICHE + ' ' + a.NOME_FORMAZIONE);
    r.push(['geol', esc(a.NOME_FORMAZIONE || a.LITOLOGIA)], ['eta', esc(a.ETA_GEOLOGICA || '')]);
    if (sb) r.push(['subs', t('SUB')[sb]]);
  }
  $('ter').innerHTML = `<h3>${t('terTit')}</h3>` + (r.length ? `<dl class="kv">${r.map(([k, v]) => riga(k, v)).join('')}</dl><p class="src">${t('terFonte')}</p>` : `<p class="note">${t('terNo')}</p>`);
}

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
function mostra() { $('sheet').classList.add('open'); document.body.classList.add('side'); $('sb').scrollTop = 0; }
function chiudi() { $('sheet').classList.remove('open', 'big'); document.body.classList.remove('side'); cur = null; selez(''); try { history.replaceState(null, '', location.pathname); } catch (e) {} }
$('grip').onclick = () => $('sheet').classList.toggle('big');
$('sheet').addEventListener('click', e => {
  if (e.target.closest('.close')) return chiudi();
  const b = e.target.closest('button[data-id]'); if (b) apri(b.dataset.id, true);
});
const COL = { pn: '#1b4332', pr: '#2d6a4f', rn: '#2d6a4f', ap: '#2d6a4f', amp: '#1d6fa5', zsc: '#2f7ea8', zsczps: '#2f7ea8', zps: '#7a5ea8', bv: '#c2571a', am: '#5b3a1a', bs: '#9a7b2f' };
const colore = k => k.startsWith('CF:') ? (CFC[k.slice(3, 5)] || '#5a8f29') : (COL[S[k].t] || '#2d6a4f');
const nomiBoschi = (b, n) => b.slice(0, n).map(x => nb(x[0]).toLowerCase());
const elenco = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + (LANG === 'it' ? ' e ' : ' and ') + a[a.length - 1];
function sintesi(k) {
  if (k.startsWith('CF:')) { const c = k.slice(3); return esc(CFN.macro[c.slice(0, 2)] || '') + ' · ' + (LANG === 'it' ? 'tipo di bosco della particella' : 'forest type of the stand'); }
  const s = S[k], p = [];
  if (s.t === 'am') return esc([s.vg, s.circ ? fmt(s.circ) + ' cm' : '', s.alt ? fmt(s.alt) + ' m' : ''].filter(Boolean).join(' · '));
  if (s.ha) p.push(fmt(s.ha) + ' ha');
  if (s.t === 'bv' || s.t === 'bs') { p.push(esc(s.tf || s.sp || '')); return p.filter(Boolean).join(' · '); }
  if (s.b && s.b.length) p.push(esc(elenco(nomiBoschi(s.b, 2))));
  const d = DENTRO[k] || [], nv = d.filter(x => S[x].t === 'bv').length, na = d.filter(x => S[x].t === 'am').length;
  if (nv) p.push(t('vb')(nv)); if (na) p.push(t('va')(na));
  p.push(N2K.includes(s.t) ? (s.t === 'zps' ? (LANG === 'it' ? 'tutela gli uccelli' : 'protects birds') : (LANG === 'it' ? 'tutela habitat e specie' : 'protects habitats and species')) : (LANG === 'it' ? 'ente e regolamento propri' : 'own managing body and rules'));
  return p.join(' · ');
}
const num1 = x => (Math.round(x * 10) / 10).toLocaleString(LANG === 'it' ? 'it-IT' : 'en-GB');
const DESC = {
  it: { pn: 'È un parco nazionale, l’area protetta di livello più alto, con un ente che ne cura la tutela.', pr: 'È un parco regionale: un’area protetta con un ente che la gestisce e regole su ciò che si può fare.', rn: 'È una riserva naturale, istituita dalla Regione per proteggere un ambiente particolare.', amp: 'È un’area marina protetta, che tutela fondali, coste e vita del mare.', ap: 'È un’area naturale protetta.',
    zsc: 'È una Zona Speciale di Conservazione della rete europea Natura 2000: un luogo scelto per proteggere habitat e specie rari in Europa.', zsczps: 'È insieme Zona Speciale di Conservazione e Zona di Protezione Speciale della rete Natura 2000: tutela habitat, specie rare e uccelli selvatici.', zps: 'È una Zona di Protezione Speciale della rete Natura 2000, dedicata agli uccelli selvatici e ai loro ambienti.' },
  en: { pn: 'It is a national park, the highest level of protected area, with its own managing body.', pr: 'It is a regional park: a protected area with a managing body and rules on what can be done.', rn: 'It is a nature reserve, set up by the Region to protect a special environment.', amp: 'It is a marine protected area, protecting seabeds, coasts and sea life.', ap: 'It is a protected natural area.',
    zsc: 'It is a Special Area of Conservation of the European Natura 2000 network: a place chosen to protect habitats and species that are rare in Europe.', zsczps: 'It is both a Special Area of Conservation and a Special Protection Area of Natura 2000: it protects habitats, rare species and wild birds.', zps: 'It is a Special Protection Area of the Natura 2000 network, for wild birds and their habitats.' }
};
function racconto(k) {
  const s = S[k], it = LANG === 'it', P = [];
  if (s.t === 'am') {
    const sp = s.sp ? ` (<i>${esc(s.sp)}</i>)` : '';
    P.push(it ? `Questo albero${s.vg ? `, <b>${esc(s.vg)}</b>` : ''}${sp}, si trova in località ${esc(s.n)}, nel comune di ${esc(s.com)}${s.alt ? `, a ${fmt(s.alt)} metri di quota` : ''}.`
              : `This tree${s.vg ? `, <b>${esc(s.vg)}</b>` : ''}${sp}, stands at ${esc(s.n)}, in the municipality of ${esc(s.com)}${s.alt ? `, at ${fmt(s.alt)} m above sea level` : ''}.`);
    if (s.circ) P.push(it ? `Il tronco misura ${fmt(s.circ)} cm di circonferenza, cioè circa ${num1(s.circ / Math.PI / 100)} metri di diametro${s.h ? `, e l’albero è alto ${fmt(s.h)} metri` : ''}.`
                          : `Its trunk is ${fmt(s.circ)} cm around, about ${num1(s.circ / Math.PI / 100)} m across${s.h ? `, and the tree is ${fmt(s.h)} m tall` : ''}.`);
    if ((s.crit || []).length) P.push(it ? `È iscritto tra gli alberi monumentali di Sicilia per: ${esc(s.crit.join(', ').toLowerCase())}.` : `It is listed among Sicily’s monumental trees for: ${esc(s.crit.join(', ').toLowerCase())}.`);
    const z = (s.in || []).filter(x => AREE.includes(S[x].t));
    if (z.length) P.push(it ? `Si trova dentro ${esc(S[z[0]].n)}.` : `It lies within ${esc(S[z[0]].n)}.`);
  } else if (s.t === 'bv') {
    P.push(it ? `${esc(s.n)} è uno dei boschi vetusti censiti in Sicilia nel 2026: un bosco rimasto a lungo senza tagli, dove crescono alberi molto vecchi e il legno morto resta a terra, come in una foresta naturale.`
              : `${esc(s.n)} is one of the old-growth forests surveyed in Sicily in 2026: a forest left uncut for a long time, with very old trees and deadwood left on the ground, as in a natural forest.`);
    P.push(it ? `Occupa ${num1(s.ha)} ettari${s.area ? ` nell’area ${esc(s.area)}` : ''}. Il tipo forestale è ${esc((s.tf || '').toLowerCase())}${s.bio ? `, in un clima ${esc(s.bio.toLowerCase())}` : ''}.`
              : `It covers ${num1(s.ha)} ha${s.area ? ` in the ${esc(s.area)} area` : ''}. Forest type: ${esc((s.tf || '').toLowerCase())}${s.bio ? `; bioclimate: ${esc(s.bio.toLowerCase())}` : ''}.`);
  } else if (s.t === 'bs') {
    P.push(it ? `${esc(s.n)} è un bosco da seme: qui il Corpo Forestale raccoglie i semi${s.sp ? ` di <i>${esc(s.sp)}</i>` : ''} per i vivai e i rimboschimenti, perché le piante sono sane e adatte al territorio.`
              : `${esc(s.n)} is a seed stand: the Forestry Corps collects seed here${s.sp ? ` of <i>${esc(s.sp)}</i>` : ''} for nurseries and reforestation, because its trees are healthy and suited to the area.`);
    P.push(it ? `Copre ${fmt(s.ha)} ettari${s.com ? ` nel territorio di ${esc(s.com.replace(/,?\s*\(.*?\)/g, ''))}` : ''}${s.veg ? `; la vegetazione è ${esc(s.veg.toLowerCase())}` : ''}${s.sub ? `, su substrato ${esc(s.sub.toLowerCase())}` : ''}.`
              : `It covers ${fmt(s.ha)} ha${s.com ? ` (${esc(s.com)})` : ''}${s.veg ? `; vegetation: ${esc(s.veg.toLowerCase())}` : ''}${s.sub ? `; substrate: ${esc(s.sub.toLowerCase())}` : ''}.`);
  } else {
    const area = !k.startsWith('ITA');
    P.push(DESC[LANG][s.t] || '');
    P.push(it ? `Si estende per ${fmt(s.ha)} ettari${s.anno && /^\d{4}/.test(String(s.anno)) ? ` ed è tutelato dal ${String(s.anno).slice(0, 4)}` : ''}.` : `It covers ${fmt(s.ha)} ha${s.anno && /^\d{4}/.test(String(s.anno)) ? ` and was established in ${String(s.anno).slice(0, 4)}` : ''}.`);
    if (s.b && s.b.length) P.push(it ? `I boschi coprono circa ${fmt(s.bha)} ettari${area ? ' nei siti Natura 2000 collegati' : ''}: i più estesi sono ${esc(elenco(s.b.slice(0, 3).map(x => nb(x[0]).toLowerCase() + (x[1] ? ` (${fmt(x[1])} ha)` : ''))))}.`
                                     : `Forests cover about ${fmt(s.bha)} ha${area ? ' in the linked Natura 2000 sites' : ''}; the largest are ${esc(elenco(s.b.slice(0, 3).map(x => nb(x[0]).toLowerCase() + (x[1] ? ` (${fmt(x[1])} ha)` : ''))))}.`);
    const sp = specieDi(k), pi = sp.filter(i => SP.gr[i] === 'P');
    if (pi.length) P.push(it ? `Tra le specie segnalate ci sono ${fmt(pi.length)} piante, come ${elenco(pi.slice(0, 3).map(i => '<i>' + esc(SP.nomi[i]) + '</i>'))}.` : `Recorded species include ${fmt(pi.length)} plants, such as ${elenco(pi.slice(0, 3).map(i => '<i>' + esc(SP.nomi[i]) + '</i>'))}.`);
    const d = DENTRO[k] || [], v = d.filter(x => S[x].t === 'bv'), a = d.filter(x => S[x].t === 'am').sort((x, y) => (S[y].circ || 0) - (S[x].circ || 0));
    if (v.length || a.length) {
      const pz = [];
      if (v.length) pz.push(t('vb')(v.length) + (v.length <= 3 ? ` (${esc(elenco(v.map(x => S[x].n)))})` : ''));
      if (a.length) pz.push(t('va')(a.length));
      let f = (it ? 'Al suo interno ci sono ' : 'Inside there are ') + elenco(pz) + '.';
      if (a.length) { const g = S[a[0]]; f += it ? ` Il più grande è ${g.vg ? `<b>${esc(g.vg)}</b> ` : ''}in località ${esc(g.n)}, con un tronco di ${fmt(g.circ)} cm di circonferenza.` : ` The largest is ${g.vg ? `<b>${esc(g.vg)}</b> ` : 'the tree '}at ${esc(g.n)}, with a trunk ${fmt(g.circ)} cm around.`; }
      P.push(f);
    }
  }
  return `<div class="racconto">${P.filter(Boolean).map(x => '<p>' + x + '</p>').join('')}</div><div id="wk"></div><div id="gal"></div>`;
}
/* testi e foto dalla fonte (Wikipedia, Wikimedia Commons), senza salvarli: si caricano quando si apre la scheda */
const WCACHE = {};
/* regola del progetto: nessuna informazione sulla commestibilità (né funghi né piante).
   Dai testi di Wikipedia si tolgono le frasi che parlano di commestibilità, tossicità, cucina o consumo. */
const NOCOMM = /commestib|non commest|edul|eduli|mangerecc|mangiar|mangia|cucin|culinar|gastronom|ricett|prelibat|apprezzat[oi] (in|per|come)|sapore|consum|velen|tossic|mortal|letal|avvelen|intossic|allucinog|psicoattiv|edible|inedible|eaten|eating|cook|culinary|recipe|taste|poison|toxic|deadly|lethal|hallucinog|psychoactive|consum/i;
const senzaComm = tx => { const f = String(tx || '').split(/(?<=[.!?])\s+/).filter(x => x && !NOCOMM.test(x)); return f.join(' '); };
const getJ = u => WCACHE[u] || (WCACHE[u] = fetch(u).then(r => r.ok ? r.json() : null).catch(() => null));
const pulito = h => String(h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const binomio = sp => { const w = (sp || '').replace(/\(.*?\)/g, ' ').split(/[\s,;]+/).filter(Boolean); if (w.length < 2) return ''; return w[1] === 'x' && w[2] ? w.slice(0, 3).join(' ') : w.slice(0, 2).join(' '); };
async function wikiVoce(titolo) {
  for (const L of LANG === 'it' ? ['it', 'en'] : ['en', 'it']) {
    const j = await getJ(`https://${L}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titolo.replace(/ /g, '_'))}`);
    if (j && j.type === 'standard' && j.extract) return j;
  }
  return null;
}
async function wikiCerca(nome) {
  const L = LANG === 'it' ? 'it' : 'en';
  const j = await getJ(`https://${L}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(nome)}&srlimit=3&format=json&origin=*`);
  const parole = norm(nome).split(/[^a-z0-9]+/).filter(w => w.length > 3);
  for (const r of (j && j.query && j.query.search) || []) {
    const tt = norm(r.title), ok = parole.filter(w => tt.includes(w)).length;
    if (parole.length && ok / parole.length >= 0.6) return wikiVoce(r.title);
  }
  return null;
}
async function arricchisci(k) {
  const s = S[k]; if (!s) return;
  let w = null;
  if (s.t === 'am' || s.t === 'bs') { const b = binomio(s.sp); if (b) w = await wikiVoce(b); }
  else if (AREE.includes(s.t) || s.t === 'bv') w = await wikiCerca(s.n);
  if (cur !== k) return;
  if (w && $('wk')) {
    const img = w.thumbnail ? `<img src="${esc(w.thumbnail.source)}" alt="${esc(w.title)}" loading="lazy">` : '';
    $('wk').innerHTML = `<div class="wiki">${img}<div class="wt"><b>${t('wiki')} · ${esc(w.title)}</b>${esc(senzaComm(w.extract))}<div class="cr"><a href="${esc(w.content_urls.desktop.page)}" target="_blank" rel="noopener">${t('wleggi')}</a> · CC BY-SA${w.thumbnail ? ' · ' + (LANG === 'it' ? 'foto: Wikimedia Commons' : 'photo: Wikimedia Commons') : ''}</div></div></div>`;
  }
  // foto dei luoghi: Wikimedia Commons attorno al punto
  const lon = (s.bb[0] + s.bb[2]) / 2, lat = (s.bb[1] + s.bb[3]) / 2;
  const diag = Math.hypot((s.bb[2] - s.bb[0]) * 88000, (s.bb[3] - s.bb[1]) * 111000);
  const rag = s.t === 'am' ? 600 : Math.round(Math.min(10000, Math.max(1500, diag / 2)));
  const g = await getJ(`https://commons.wikimedia.org/w/api.php?action=query&generator=geosearch&ggscoord=${lat.toFixed(5)}|${lon.toFixed(5)}&ggsradius=${rag}&ggsnamespace=6&ggslimit=12&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=320&format=json&origin=*`);
  if (cur !== k || !$('gal')) return;
  const ph = Object.values((g && g.query && g.query.pages) || {}).filter(p => p.imageinfo && /\.(jpe?g|png|webp)$/i.test(p.title)).slice(0, 10);
  if (!ph.length) return;
  $('gal').innerHTML = `<h3>${t('foto')}</h3><div class="gal">${ph.map(p => { const i = p.imageinfo[0], m = i.extmetadata || {};
    const aut = pulito((m.Artist || {}).value).slice(0, 40), lic = pulito((m.LicenseShortName || {}).value);
    return `<a href="${esc(i.descriptionurl)}" target="_blank" rel="noopener"><img src="${esc(i.thumburl)}" alt="${esc(p.title.replace(/^File:|\.\w+$/g, ''))}" loading="lazy">${esc(aut)}${lic ? ' · ' + esc(lic) : ''}</a>`; }).join('')}</div><p class="note">${t('fotoN')}</p>`;
}
function specieDi(k) {
  const s = S[k]; if (s.s) return s.s;
  const set = new Set(); for (const c of s.n2k || []) for (const i of S[c].s) set.add(i); return [...set];
}
const testa = (n, b) => `<div><h2>${esc(n)}</h2>${b}</div><button class="close" aria-label="Chiudi">×</button>`;
const riga = (k, v) => v || v === 0 ? `<dt>${t(k)}</dt><dd>${v}</dd>` : '';
const fonteSIF = () => `<p class="src">${t('fonte')}: <a href="https://sifweb.regione.sicilia.it/arcgis/rest/services/SIF_CART_TEMATICA/MapServer" target="_blank" rel="noopener">${t('sif')}</a> · ${t('lsif')}</p>`;
const fonteElenco = () => `<p class="src">${t('fonte')}: <a href="https://www.regione.sicilia.it/system/files/2026-07/elenco_degli_alberi_monumentali_di_sicilia_aggiornato_al_17.07.2026.pdf" target="_blank" rel="noopener">${t('elenco')}</a> · ${t('lsif')}</p>`;
const collegate = ids => ids.length ? `<h3>${t('dentro')}</h3><div class="links">${ids.map(c => `<button data-id="${c}">${esc(S[c].n)}<br><small>${t(S[c].t)} · ${fmt(S[c].ha)} ha</small></button>`).join('')}</div>` : '';
function apriCF(c) {
  cur = null; selez('');
  const [n, v] = CFN.tipi[c] || [c, []];
  $('sh').innerHTML = testa(n, `<span class="badge cf">${t('cf')}</span>`);
  let h = `<dl class="kv">${riga('cat', esc(CFN.macro[c.slice(0, 2)] || c.slice(0, 2)))}${riga('tf', esc(n))}<dt>Cod.</dt><dd>${esc(c)}</dd></dl><p class="note">${t('cfnota')}</p>`;
  if (v.length) h += `<details><summary>${t('varianti')}<em>${v.length}</em></summary><div class="hab">${v.map(x => `<div style="grid-template-columns:1fr"><span>${esc(x)}</span></div>`).join('')}</div></details>`;
  $('sb').innerHTML = h + fonteSIF(); mostra();
}
function apriAmb(k, s) {  // boschi vetusti, boschi da seme, alberi monumentali
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
    if (s.sp) $('sh').innerHTML = testa(s.n, b + `<p class="sp" style="margin:6px 0 0"><i>${esc(s.sp)}</i>${s.vg ? ' · ' + esc(s.vg) : ''}</p>`);
    h += `<div class="stats"><div><b>${s.circ ? fmt(s.circ) + ' cm' : '–'}</b><span>${t('circ')}</span></div><div><b>${s.h ? fmt(s.h) + ' m' : '–'}</b><span>${t('alt')}</span></div><div><b>${s.alt ? fmt(s.alt) + ' m' : '–'}</b><span>${t('quota')}</span></div></div>`;
    h += `<dl class="kv">${riga('com', esc(s.com + (s.prov ? ' (' + s.prov + ')' : '')))}${riga('crit', (s.crit || []).map(esc).join('<br>'))}${riga('dm', esc(s.prov_dm))}</dl>`;
  }
  $('sb').innerHTML = racconto(k) + h + collegate(s.in || []) + (s.fonte === 'elenco' ? fonteElenco() : fonteSIF()); mostra(); arricchisci(k);
}
function apri(k, vola) {
  if (k.startsWith('CF:')) return apriCF(k.slice(3));
  const s = S[k]; if (!s) return; cur = k;
  selez(k);
  try { history.replaceState(null, '', '#' + k); } catch (e) {}
  const lato = innerWidth >= 900;
  if (vola) map.fitBounds([[s.bb[0], s.bb[1]], [s.bb[2], s.bb[3]]], { padding: lato ? { top: 90, bottom: 40, left: 480, right: 60 } : { top: 120, bottom: Math.min(innerHeight * 0.45, 380), left: 30, right: 30 }, maxZoom: s.t === 'am' ? 12 : 13, duration: 700 });
  if (AMB.includes(s.t)) {
    if (!ON[s.t]) { ON[s.t] = true; applica(); }
    return apriAmb(k, s);
  }
  const area = !k.startsWith('ITA');
  $('sh').innerHTML = `<div><h2>${esc(s.n)}</h2><span class="badge ${cls(s.t)}">${t(s.t)}</span>${s.iucn ? `<span class="badge">IUCN ${esc(s.iucn)}</span>` : ''}</div><button class="close" aria-label="Chiudi">×</button>`;
  const sp = specieDi(k), byG = {};
  for (const i of sp) (byG[SP.gr[i]] = byG[SP.gr[i]] || []).push(SP.nomi[i]);
  const max = s.b.length ? s.b[0][1] || 1 : 1;
  const hab = s.h || [];
  let h = racconto(k) + `<div class="stats"><div><b>${fmt(s.ha)} ha</b><span>${t('sup')}</span></div><div><b>${s.bha ? fmt(s.bha) + ' ha' : '–'}</b><span>${t('boschi')}</span></div><div><b>${s.anno || sp.length || '–'}</b><span>${s.anno ? t('istit') : t('specie')}</span></div></div>`;
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
  mostra(); arricchisci(k);
}
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h && S[h] && h !== cur) apri(h, true); });

/* ---------- sezioni: Esplora, Micologia, Botanica */
let vista = 'mappa';
const cs = { funghi: { q: '', g: '', n: 60 }, piante: { q: '', g: '', n: 60 } };
const BASEF = 'https://cangelosky.github.io/Inzenga/impara/libri/foto/';
const ICO = { funghi: '<svg viewBox="0 0 24 24"><path d="M12 3C6.5 3 2.5 6.6 2.5 10.5c0 .8.6 1.3 1.4 1.3h16.2c.8 0 1.4-.5 1.4-1.3C21.5 6.6 17.5 3 12 3Zm-2.3 10.3-.6 5.9A1.7 1.7 0 0 0 10.8 21h2.4a1.7 1.7 0 0 0 1.7-1.8l-.6-5.9h-4.6Z"/></svg>',
  piante: '<svg viewBox="0 0 24 24"><path d="M20 3.5C11.5 3.5 6 7.6 6 14c0 1.4.3 2.7.8 3.8L4.3 20.3l1.4 1.4 2.4-2.4c1.2.7 2.6 1.2 4.1 1.2 6.2 0 8.3-6.9 7.8-17Z"/></svg>' };
const isApp = !!(window.Capacitor && (!window.Capacitor.isNativePlatform || window.Capacitor.isNativePlatform()));
const modo = { escursioni: 'mappa', meteo: 'mappa' };
const mappaVista = v => (v === 'escursioni' || v === 'meteo') && modo[v] === 'mappa';
function vai(v) {
  vista = v;
  for (const b of document.querySelectorAll('#sez button')) b.classList.toggle('on', b.dataset.v === v);
  const mm = mappaVista(v), lista = v !== 'mappa' && !mm;
  $('cat').classList.toggle('on', lista); document.body.classList.toggle('cat-on', lista); document.body.classList.toggle('mm', mm);
  $('pan').classList.toggle('on', mm); if (!mm) $('pan').innerHTML = '';
  chiudiLiv(); $('res').style.display = 'none'; chiudi();
  evidenzia(null);
  $('cat').dataset.v = ''; $('cat').innerHTML = '';
  if (v === 'mappa' || mm) map.resize();
  if (v === 'meteo') meteo(); else if (v === 'escursioni') escursioni(); else if (v !== 'mappa') catalogo();
}
const sw = () => `<div class="switch" role="tablist">${['mappa', 'elenco'].map(m => `<button role="tab" data-modo="${m}" class="${modo[vista] === m ? 'on' : ''}" aria-selected="${modo[vista] === m}">${m === 'mappa' ? t('vMap') : t('vList')}</button>`).join('')}</div>`;
document.addEventListener('click', e => { const b = e.target.closest('[data-modo]'); if (b && modo[vista] && modo[vista] !== b.dataset.modo) { modo[vista] = b.dataset.modo; vai(vista); } });
/* aree della Sicilia (per i menu di Meteo ed Escursioni): area più vicina al centro della zona */
const AC = { pa: [13.35, 38.03], tp: [12.65, 37.9], sic: [13.35, 37.55], mad: [14.05, 37.85], neb: [14.6, 37.95], pel: [15.35, 38.1], etn: [15.0, 37.72], cen: [14.25, 37.45], ibl: [14.85, 36.98] };
function areaDi(k) {
  const [lon, lat] = centro(S[k]);
  if ((lat > 38.33 && lon > 14.2) || lon < 12.2 || lat < 36.2 || lat > 38.6 || (lon < 12.45 && lat < 38.1 && lat > 37.85)) return 'iso';
  return Object.keys(AC).reduce((a, b) => ((AC[a][0] - lon) ** 2 * 0.62 + (AC[a][1] - lat) ** 2) <= ((AC[b][0] - lon) ** 2 * 0.62 + (AC[b][1] - lat) ** 2) ? a : b);
}
const ORD_AREE = ['tutte', 'pa', 'tp', 'mad', 'neb', 'pel', 'etn', 'sic', 'cen', 'ibl', 'iso'];
function limitiArea(a) {
  const ks = LUOGHI().map(x => x[0]).filter(k => a === 'tutte' || areaDi(k) === a), bb = [180, 90, -180, -90];
  for (const k of ks) { const b = S[k].bb; bb[0] = Math.min(bb[0], b[0]); bb[1] = Math.min(bb[1], b[1]); bb[2] = Math.max(bb[2], b[2]); bb[3] = Math.max(bb[3], b[3]); }
  return ks.length ? [[bb[0], bb[1]], [bb[2], bb[3]]] : [[12.3, 36.55], [15.7, 38.35]];
}
const padMappa = () => innerWidth >= 900 ? { top: 40, bottom: 40, left: 40, right: 430 } : { top: 20, bottom: Math.round(innerHeight * 0.44) + 10, left: 16, right: 16 };
/* zone evidenziate sulla mappa (Escursioni, Meteo): confini colorati per punteggio, nome e numero */
function evidenzia(items) {
  if (!map.getSource('hl')) return;
  const on = !!items;
  for (const l of [...Object.keys(base), ...Object.values(LIV).flat()]) if (map.getLayer(l)) map.setLayoutProperty(l, 'visibility', on ? 'none' : (l in base ? ((l.startsWith('aree') ? ON.aree : ON.n2k) ? 'visible' : 'none') : 'visible'));
  if (!on) { map.getSource('hl').setData({ type: 'FeatureCollection', features: [] }); map.getSource('hlp').setData({ type: 'FeatureCollection', features: [] }); applica(); return; }
  const byId = {}; for (const f of GJ.features) byId[f.properties.id] = f;
  map.getSource('hl').setData({ type: 'FeatureCollection', features: items.filter(x => byId[x.k]).map(x => ({ type: 'Feature', properties: { id: x.k, v: x.v }, geometry: byId[x.k].geometry })) });
  map.getSource('hlp').setData({ type: 'FeatureCollection', features: items.map(x => ({ type: 'Feature', properties: { id: x.k, v: x.v, lab: x.lab, vs: x.vs || '' }, geometry: { type: 'Point', coordinates: centro(S[x.k]) } })) });
}
$('sez').onclick = e => { const b = e.target.closest('button'); if (b) vai(b.dataset.v); };
function elencoCat() {
  const st = cs[vista], w = norm(st.q.trim()).split(/\s+/).filter(Boolean);
  if (vista === 'funghi') return FUN.s.map((r, i) => i).filter(i => { const r = FUN.s[i];
    if (st.g === '*f' && !r[8].length) return false; if (st.g && st.g !== '*f' && r[4] !== st.g) return false;
    const n = norm(r[0] + ' ' + r[2] + ' ' + r[3]); return w.every(x => n.includes(x)); });
  return PIA.s.map((r, i) => i).filter(i => { const r = PIA.s[i];
    if (st.g === 'alb' && !r[1]) return false;
    const n = norm(r[0]); return w.every(x => n.includes(x)); });
}
function catalogo(soloTesti) {
  CAT.then(() => {
    if (vista !== 'funghi' && vista !== 'piante') return;
    const f = vista === 'funghi', st = cs[vista], ids = elencoCat();
    const gruppi = f ? [['', t('tutte'), FUN.s.length], ['*f', t('conFoto'), FUN.s.filter(r => r[8].length).length], ...FUN.g.map(g => [g, t('GF')[g], FUN.s.filter(r => r[4] === g).length])]
                     : [['', t('tutte'), PIA.s.length], ['alb', t('alberi'), PIA.s.filter(r => r[1]).length]];
    const card = i => { const r = (f ? FUN : PIA).s[i];
      const sub = f ? `${esc(r[2])} · ${t('segn')(r[5])}` : [r[2].length ? t('nsiti')(r[2].length) : '', r[3].filter(k => S[k] && S[k].t === 'am').length ? t('va')(r[3].filter(k => S[k] && S[k].t === 'am').length) : ''].filter(Boolean).join(' · ');
      const ph = f && r[8].length ? ` style="background-image:url('${BASEF + r[8][0]}')"` : '';
      return `<button class="card" data-sp="${i}"><span class="ph" data-n="${esc(r[0])}"${ph}>${ph ? '' : ICO[vista]}</span><span class="tx"><i>${esc(r[0])}</i><small>${sub}</small>${f ? `<span class="tag">${esc(t('GF')[r[4]])}</span>` : r[1] ? `<span class="tag">${t('alberi')}</span>` : ''}</span></button>`; };
    const griglia = ids.slice(0, st.n).map(card).join('') + '';
    if (soloTesti || !$('cat').querySelector('.in') || $('cat').dataset.v !== vista) {
      $('cat').dataset.v = vista; $('cat').scrollTop = 0;
      $('cat').innerHTML = `<div class="in"><h2>${f ? t('tFunghi') : t('tPiante')}</h2><p class="lead">${f ? t('lFunghi')(FUN.s.length) : t('lPiante')(PIA.s.length)}</p>
        <div class="cerca"><input id="cq" type="search" placeholder="${t('cercaSp')}" value="${esc(st.q)}" autocomplete="off"></div>
        <div class="grp" id="cg"></div><p class="cnt" id="cn"></p><div class="griglia" id="gr"></div><button class="altri" id="ca"></button></div>`;
      $('cq').oninput = e => { cs[vista].q = e.target.value; cs[vista].n = 60; catalogo(); };
    }
    $('cg').innerHTML = gruppi.map(([k, n, c]) => `<button data-g="${k}" class="${st.g === k ? 'on' : ''}">${esc(n)}<em>${fmt(c)}</em></button>`).join('');
    $('cn').textContent = t('nSp')(ids.length);
    $('gr').innerHTML = griglia;
    $('ca').textContent = t('altri'); $('ca').style.display = ids.length > st.n ? 'block' : 'none';
    fotoLazy();
  });
}
$('cat').addEventListener('click', e => {
  const g = e.target.closest('#cg button'), c = e.target.closest('.card'), a = e.target.closest('#ca');
  const st = cs[vista];
  if (g) { st.g = g.dataset.g; st.n = 60; catalogo(); }
  else if (a) { st.n += 60; catalogo(); }
  else if (c) apriSpecie(vista, +c.dataset.sp);
});
// foto delle schede senza foto propria: da Wikipedia, solo quando la scheda è visibile
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => {
  if (!en.isIntersecting) return; io.unobserve(en.target);
  const el = en.target; wikiVoce(el.dataset.n).then(w => { if (w && w.thumbnail) { el.style.backgroundImage = `url('${w.thumbnail.source}')`; el.innerHTML = ''; } });
}), { root: $('cat'), rootMargin: '300px' }) : null;
function fotoLazy() { if (io) for (const el of $('cat').querySelectorAll('.ph:not([style])')) io.observe(el); }

function apriSpecie(tipo, i) {
  const f = tipo === 'funghi', r = (f ? FUN : PIA).s[i], it = LANG === 'it';
  cur = 'SP:' + tipo + ':' + i; selez('');
  const badge = f ? `<span class="badge">${esc(t('GF')[r[4]])}</span><span class="badge n2k">${esc(r[2])}</span>` : (r[1] ? `<span class="badge">${t('alberi')}</span>` : '');
  $('sh').innerHTML = `<div><h2><i>${esc(r[0])}</i>${f ? ` <small style="font-weight:400;color:var(--mute);font-size:14px">${esc(r[1])}</small>` : ''}</h2>${badge}</div><button class="close" aria-label="Chiudi">×</button>`;
  let h = '<div class="racconto">';
  if (f) {
    h += it ? `<p><i>${esc(r[0])}</i> è un fungo della famiglia ${esc(r[2])} (ordine ${esc(r[3])}), nel gruppo «${esc(t('GF')[r[4]].toLowerCase())}».</p><p>Nel database mondiale della biodiversità GBIF ha ${fmt(r[5])} segnalazioni in Sicilia${r[6] > r[5] ? `, su ${fmt(r[6])} nell’Italia meridionale considerata da Micelio` : ''}.</p>`
            : `<p><i>${esc(r[0])}</i> is a fungus of the family ${esc(r[2])} (order ${esc(r[3])}), in the group “${esc(t('GF')[r[4]].toLowerCase())}”.</p><p>The GBIF global biodiversity database holds ${fmt(r[5])} records of it in Sicily${r[6] > r[5] ? `, out of ${fmt(r[6])} in the southern Italy covered by Micelio` : ''}.</p>`;
  } else {
    const am = r[3].filter(k => S[k] && S[k].t === 'am'), bs = r[3].filter(k => S[k] && S[k].t === 'bs');
    if (r[2].length) h += it ? `<p><i>${esc(r[0])}</i> è elencata nei formulari di ${t('nsiti')(r[2].length)} in Sicilia${r[2].length > 1 ? `, tra cui ${esc(elenco(r[2].slice(0, 2).map(k => S[k].n)))}` : ` (${esc(S[r[2][0]].n)})`}.</p>`
                             : `<p><i>${esc(r[0])}</i> is listed in the forms of ${t('nsiti')(r[2].length)} in Sicily${r[2].length > 1 ? `, including ${esc(elenco(r[2].slice(0, 2).map(k => S[k].n)))}` : ` (${esc(S[r[2][0]].n)})`}.</p>`;
    if (am.length || bs.length) h += it ? `<p>In Sicilia è la specie di ${elenco([am.length ? t('va')(am.length) : '', bs.length ? (bs.length === 1 ? '1 bosco da seme' : bs.length + ' boschi da seme') : ''].filter(Boolean))}.</p>`
                                        : `<p>In Sicily it is the species of ${elenco([am.length ? t('va')(am.length) : '', bs.length ? (bs.length === 1 ? '1 seed stand' : bs.length + ' seed stands') : ''].filter(Boolean))}.</p>`;
  }
  h += '</div>';
  if (f && r[8].length) h += `<div class="ownph">${r[8].map(x => `<img src="${BASEF + x}" alt="${esc(r[0])}" loading="lazy">`).join('')}</div><p class="note">© Oscar Cangelosi · CC BY 4.0 · ${t('fotoMic')}</p>`;
  h += `<button class="btnmap" id="btnmap"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>${t('vediMappa')}</button>`;
  h += '<div id="wk"></div>';
  if (f) h += `<div class="avviso">${t('nocomm')}</div>`;
  if (!f && (r[2].length || r[3].length)) h += `<h3>${t('dove')}</h3><div class="links">${r[3].concat(r[2]).filter(k => S[k]).slice(0, 40).map(k => `<button data-id="${k}">${esc(S[k].n)}<br><small>${t(S[k].t)}${S[k].ha ? ' · ' + fmt(S[k].ha) + ' ha' : S[k].com ? ' · ' + esc(S[k].com) : ''}</small></button>`).join('')}</div>`;
  h += `<p class="src">${t('fonte')}: ${f ? `<a href="https://cangelosky.github.io/Inzenga/" target="_blank" rel="noopener">Micelio · Inzenga</a> · <a href="https://www.gbif.org/species/${r[7]}" target="_blank" rel="noopener">${t('gbif')}</a>` : `${t('sdf')} · ${t('elenco')}`}</p>`;
  $('sb').innerHTML = h; mostra();
  $('btnmap').onclick = () => mostraGbif(r[0], f ? r[7] : null);
  wikiVoce(r[0]).then(w => {
    if (cur !== 'SP:' + tipo + ':' + i || !w || !$('wk')) return;
    $('wk').innerHTML = `<div class="wiki">${w.thumbnail && !(f && r[8].length) ? `<img src="${esc(w.thumbnail.source)}" alt="${esc(w.title)}" loading="lazy">` : ''}<div class="wt"><b>${t('wiki')} · ${esc(w.title)}</b>${esc(senzaComm(w.extract))}<div class="cr"><a href="${esc(w.content_urls.desktop.page)}" target="_blank" rel="noopener">${t('wleggi')}</a> · CC BY-SA</div></div></div>`;
  });
}
/* ---------- Sentieri e rifugi da OpenStreetMap (Overpass), caricati per la zona visibile */
let osmT = null, osmB = '';
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
let avT = null;
function avvisoMappa(m, ms) {
  let el = $('avmap'); if (!el) { el = document.createElement('div'); el.id = 'avmap'; el.className = 'avmap'; $('wrap').appendChild(el); }
  clearTimeout(avT); el.textContent = m; el.style.display = m ? 'block' : 'none'; if (m && ms) avT = setTimeout(() => el.style.display = 'none', ms);
}
function caricaOSM() {
  clearTimeout(osmT);
  osmT = setTimeout(async () => {
    if (!ON.osm) return;
    if (map.getZoom() < 11) { avvisoMappa(t('zoomSent'), 3500); return; }
    const b = map.getBounds(), bb = [b.getSouth(), b.getWest(), b.getNorth(), b.getEast()].map(x => x.toFixed(3)).join(',');
    if (bb === osmB) return; osmB = bb;
    const q = `[out:json][timeout:25];(relation["route"="hiking"](${bb});way["highway"="path"]["sac_scale"](${bb});node["tourism"~"alpine_hut|wilderness_hut|picnic_site"](${bb});node["amenity"="shelter"](${bb});node["natural"="spring"](${bb});node["amenity"="drinking_water"](${bb}););out geom 4000;`;
    avvisoMappa(t('osmCar'));
    let j = null;
    for (const srv of OVERPASS) {   // server pubblici di OpenStreetMap: se uno è occupato si prova il successivo
      const ac = new AbortController(), to = setTimeout(() => ac.abort(), 20000);
      j = await fetch(srv, { method: 'POST', body: 'data=' + encodeURIComponent(q), signal: ac.signal }).then(r => r.ok ? r.json() : null).catch(() => null);
      clearTimeout(to); if (j || bb !== osmB) break;
    }
    if (bb !== osmB) return;
    if (!j) { osmB = ''; avvisoMappa(t('osmErr'), 6000); return; }
    avvisoMappa('');
    const F = [];
    for (const e of j.elements) {
      const tg = e.tags || {};
      if (e.type === 'node') F.push({ type: 'Feature', properties: { k: tg.natural === 'spring' || tg.amenity === 'drinking_water' ? 'w' : /hut|shelter/.test(tg.tourism || tg.amenity || '') ? 'r' : 'p', n: tg.name || '' }, geometry: { type: 'Point', coordinates: [e.lon, e.lat] } });
      else if (e.type === 'way' && e.geometry) F.push({ type: 'Feature', properties: { n: tg.name || '' }, geometry: { type: 'LineString', coordinates: e.geometry.map(g => [g.lon, g.lat]) } });
      else if (e.type === 'relation') for (const m of e.members || []) if (m.type === 'way' && m.geometry) F.push({ type: 'Feature', properties: { n: tg.name || '' }, geometry: { type: 'LineString', coordinates: m.geometry.map(g => [g.lon, g.lat]) } });
    }
    if (map.getSource('osm')) map.getSource('osm').setData({ type: 'FeatureCollection', features: F });
  }, 500);
}

/* ---------- Escursioni: obiettivo, dove andare, registrazione del percorso */
const INT = { funghi: '#a0702a', alberi: '#5b3a1a', boschi: '#2d6a4f', flora: '#7a5ea8', alim: '#8fae3c' };
let intSel = new Set(['funghi', 'alberi']);
function suggerimenti() {  // le 12 zone più adatte agli interessi scelti
  const out = [];
  for (const [k, z] of LUOGHI()) {
    const d = DENTRO[k] || [], na = d.filter(x => S[x].t === 'am').length, nv = d.filter(x => S[x].t === 'bv').length;
    const pi = specieDi(k).filter(i => SP.gr[i] === 'P').length;
    const fungB = z.b.filter(b => ['9260', '9340', '91AA', '9210', '91M0', '9330', '9540', '9530'].includes(b[0])).reduce((a, b) => a + b[1], 0);
    let sc = 0; const why = [];
    if (intSel.has('funghi') && fungB) { sc += Math.log10(1 + fungB) * 2; why.push((LANG === 'it' ? 'boschi adatti ai funghi: ' : 'forests good for fungi: ') + elenco(z.b.filter(b => ['9260', '9340', '91AA', '9210', '91M0', '9330', '9540', '9530'].includes(b[0])).slice(0, 2).map(b => nb(b[0]).toLowerCase()))); }
    if (intSel.has('alberi') && (na || nv)) { sc += Math.log10(1 + na + 3 * nv) * 3; why.push([na ? t('va')(na) : '', nv ? t('vb')(nv) : ''].filter(Boolean).join(', ')); }
    if (intSel.has('boschi') && z.bha) { sc += Math.log10(1 + z.bha) * 1.5; why.push(fmt(z.bha) + (LANG === 'it' ? ' ha di bosco' : ' ha of forest')); }
    if (intSel.has('flora') && pi) { sc += Math.log10(1 + pi) * 2; why.push(fmt(pi) + (LANG === 'it' ? ' specie di piante segnalate' : ' plant species recorded')); }
    if (sc > 0) out.push({ k, z, sc, why });
  }
  return out.sort((a, b) => b.sc - a.sc).slice(0, 12);
}
function escursioni() {
  if (vista !== 'escursioni') return;
  D.then(() => {
    const sug = suggerimenti(), mx = Math.max(1, ...sug.map(x => x.sc));
    const chips = `<div class="int">${Object.entries({ funghi: 'iFunghi', alberi: 'iAlberi', boschi: 'iBoschi', flora: 'iFlora', alim: 'iAlim' }).map(([k, l]) => `<button data-i="${k}" class="${intSel.has(k) ? 'on' : ''}" aria-pressed="${intSel.has(k)}"><i style="background:${INT[k]}"></i>${t(l)}</button>`).join('')}</div>${intSel.has('alim') ? `<p class="avviso">${t('alimNota')}</p>` : ''}`;
    const reg = isApp ? `<h3>${t('reg')}</h3><div class="reg" id="reg"></div><h3>${t('miei')}</h3><div class="trk" id="trk"></div>` : '';
    if (modo.escursioni === 'mappa') {
      $('pan').innerHTML = `<div class="ph-top"><h2>${t('tEsc')}</h2>${sw()}</div><p class="pl">${t('toccaEsc')}</p>${chips}
        <h3>${t('doveAndare')}</h3><ol class="top5">${sug.slice(0, 6).map(x => `<li><button data-zona="${x.k}"><b>${esc(x.z.n)}</b><small>${esc(x.why.join(' · '))}</small></button></li>`).join('')}</ol>${reg}`;
      evidenzia(sug.map(x => ({ k: x.k, v: 3 + 6.5 * x.sc / mx, lab: x.z.n })));
      if (sug.length) { const bb = [180, 90, -180, -90]; for (const x of sug) { const b = x.z.bb; bb[0] = Math.min(bb[0], b[0]); bb[1] = Math.min(bb[1], b[1]); bb[2] = Math.max(bb[2], b[2]); bb[3] = Math.max(bb[3], b[3]); } map.fitBounds([[bb[0], bb[1]], [bb[2], bb[3]]], { padding: padMappa(), duration: 700 }); }
    } else {
      const per = {}; for (const x of sug) (per[areaDi(x.k)] = per[areaDi(x.k)] || []).push(x);
      $('cat').innerHTML = `<div class="in"><div class="ph-top"><h2>${t('tEsc')}</h2>${sw()}</div><p class="lead">${isApp ? t('lEsc') : t('lEsc').replace(/ (Puoi registrare|You can record).*$/, '')}</p><h3>${t('obiettivo')}</h3>${chips}
        <h3>${t('doveAndare')}</h3>${ORD_AREE.filter(a => per[a]).map(a => `<h4 class="area-h">${t('AR')[a]}</h4><div class="sug">${per[a].map(x => `<div class="c"><b>${esc(x.z.n)}</b><small>${esc(t(x.z.t))} · ${fmt(x.z.ha)} ha</small><small>${esc(x.why.join(' · '))}</small><div class="az"><button data-map="${x.k}">${t('apriMappa')}</button><button data-mt="${x.k}">${t('vediMeteo')}</button></div></div>`).join('')}</div>`).join('')}
        ${isApp ? reg : `<p class="note" style="margin-top:20px">${t('soloApp')}</p>`}</div>`;
    }
    if (isApp) { regUI(); trkUI(); }
  });
}
window.escursioni = escursioni;
const clickEsc = e => {
  if (vista !== 'escursioni') return;
  const z = e.target.closest('[data-zona]'); if (z) { apri(z.dataset.zona, true); return; }
  const i = e.target.closest('.int button'), m = e.target.closest('[data-map]'), mt = e.target.closest('[data-mt]'), rb = e.target.closest('#regbtn'), tb = e.target.closest('[data-trk]');
  if (i) { intSel.has(i.dataset.i) ? intSel.delete(i.dataset.i) : intSel.add(i.dataset.i); escursioni(); }
  else if (m) { vai('mappa'); apri(m.dataset.map, true); }
  else if (mt) { const k = mt.dataset.mt; modo.meteo = 'mappa'; mt0.area = areaDi(k); vai('meteo'); METP.then(() => apriMeteoZona(k)); }
  else if (rb) avviaReg();
  else if (e.target.closest('#regapri')) mostraRec(true);
  else if (tb) azioneTrk(tb.dataset.trk, tb.dataset.az);
};
$('cat').addEventListener('click', clickEsc); $('pan').addEventListener('click', clickEsc);
// registrazione (solo nell'app): si avvia da Escursioni, poi schermata a tutta mappa con tempo, distanza, punti e foto (come Wikiloc)
let REG = null, wid = null, wake = null, bgId = null, segui = true, tick = null;
const TK = 'sn_percorsi', TKC = 'sn_reg_corrente', TKR = 'sn_wp_recenti';
const leggiTrk = () => { try { return JSON.parse(localStorage.getItem(TK)) || []; } catch (e) { return []; } };
const scriviTrk = a => { try { localStorage.setItem(TK, JSON.stringify(a)); } catch (e) {} };
const salvaCorrente = () => { try { REG ? localStorage.setItem(TKC, JSON.stringify(REG)) : localStorage.removeItem(TKC); } catch (e) {} };
const hav = (a, b) => { const R = 6371000, r = Math.PI / 180, dl = (b[1] - a[1]) * r, dn = (b[0] - a[0]) * r; const h = Math.sin(dl / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
function misure(p) { let d = 0, up = 0; for (let i = 1; i < p.length; i++) { d += hav(p[i - 1], p[i]); if (p[i][2] != null && p[i - 1][2] != null && p[i][2] > p[i - 1][2]) up += p[i][2] - p[i - 1][2]; } return { km: d / 1000, up, min: p.length > 1 ? (p[p.length - 1][3] - p[0][3]) / 60000 : 0 }; }
const durS = m => Math.floor(m / 60) + ' h ' + String(Math.round(m % 60)).padStart(2, '0');
const orologio = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(x => String(x).padStart(2, '0')).join(':'); };
const T = (it, en) => LANG === 'it' ? it : en;

/* tipi di punto: gruppi e icone (Tabler Icons, MIT) */
const WP = [
  ['natura', ['Natura', 'Nature'], [['fungo', 'mushroom', 'Fungo', 'Mushroom'], ['albero', 'tree', 'Albero', 'Tree'], ['monumentale', 'award', 'Albero monumentale', 'Monumental tree'], ['bosco', 'trees', 'Bosco', 'Woodland'], ['flora', 'flower', 'Fiore', 'Flower'], ['pianta', 'plant-2', 'Pianta', 'Plant'], ['erba', 'leaf', 'Erba, foglie', 'Herb, leaves'], ['animale', 'deer', 'Animale', 'Animal'], ['tracce', 'paw', 'Tracce', 'Tracks'], ['uccello', 'feather', 'Uccello', 'Bird'], ['insetto', 'butterfly', 'Insetto', 'Insect']]],
  ['geo', ['Geografia', 'Geography'], [['panorama', 'binoculars', 'Panorama', 'Viewpoint'], ['vetta', 'mountain', 'Vetta', 'Summit'], ['grotta', 'building-arch', 'Grotta', 'Cave'], ['sorgente', 'droplet', 'Sorgente', 'Spring'], ['fontana', 'fountain', 'Fontana', 'Fountain'], ['fiume', 'wave-sine', 'Fiume, torrente', 'River, stream'], ['lago', 'ripple', 'Lago', 'Lake'], ['cascata', 'stairs-down', 'Cascata', 'Waterfall']]],
  ['sent', ['Sentiero', 'Trail'], [['incrocio', 'arrows-split', 'Incrocio', 'Junction'], ['inizio', 'flag', 'Inizio sentiero', 'Trailhead'], ['parcheggio', 'parking', 'Parcheggio', 'Parking'], ['rifugio', 'home', 'Rifugio', 'Hut'], ['riparo', 'tent', 'Riparo, bivacco', 'Shelter'], ['picnic', 'tools-kitchen-2', 'Area picnic', 'Picnic area'], ['abbeveratoio', 'bucket-droplet', 'Abbeveratoio', 'Trough'], ['segnaletica', 'direction-sign', 'Segnaletica', 'Signpost'], ['cancello', 'barrier-block', 'Cancello, sbarra', 'Gate'], ['pericolo', 'alert-triangle', 'Pericolo', 'Danger']]],
  ['cult', ['Storia e cultura', 'History and culture'], [['rovine', 'columns', 'Rovine', 'Ruins'], ['chiesa', 'building-church', 'Chiesa, edicola', 'Church, shrine'], ['castello', 'building-castle', 'Castello', 'Castle'], ['masseria', 'building-cottage', 'Masseria', 'Farmhouse'], ['mulino', 'windmill', 'Mulino', 'Mill'], ['torre', 'tower', 'Torre', 'Tower']]],
  ['altro', ['Altro', 'Other'], [['foto', 'camera', 'Foto', 'Photo'], ['altro', 'map-pin', 'Altro', 'Other']]]
];
const WPT = {}; for (const g of WP) for (const [k, i, it, en] of g[2]) WPT[k] = { i, it, en, g: g[0] };
// tipi delle versioni precedenti
Object.assign(WPT, { acqua: WPT.sorgente });
const wpNome = k => (WPT[k] || WPT.altro)[LANG === 'it' ? 'it' : 'en'];
const wpIco = k => (WPT[k] || WPT.altro).i;
const COLG = { natura: '#3fae6a', geo: '#3a8fd5', sent: '#d08a2b', cult: '#a06bd0', altro: '#5d6b64' };
const wpCol = k => COLG[(WPT[k] || WPT.altro).g];

/* schermata di registrazione */
document.body.insertAdjacentHTML('beforeend', `
<div id="rec" class="rec" aria-live="polite">
  <div class="rec-top"><button class="rb" id="rec-min" aria-label="Riduci">${ico('chevron-down')}</button>
    <div class="rec-st"><div><b id="rec-km">0,0</b><span>km</span></div><div class="rec-t"><small id="rec-lab"></small><b id="rec-tm">00:00:00</b></div><div><b id="rec-up">0</b><span>m D+</span></div></div></div>
  <div class="rec-gps" id="rec-gps"></div>
  <button class="rb rec-ctr" id="rec-ctr" aria-label="Centra">${ico('current-location')}</button>
  <div class="rec-bot"><button class="rec-stop" id="rec-stop" aria-label="Termina"><span></span></button>
    <button class="rec-pt" id="rec-pt">${ico('map-pin-plus')}<span id="rec-pt-l"></span></button>
    <button class="rec-cam" id="rec-cam" aria-label="Foto">${ico('camera-plus')}</button></div>
</div>
<button id="recpill" class="recpill"><i></i><b id="recpill-t">00:00:00</b><span id="recpill-l"></span></button>
<div id="wps" class="wpfull"></div>
<div id="wpf" class="wpfull"></div>
<div id="toast" class="toast"></div>`);
const toast = m => { const e = $('toast'); e.textContent = m; e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(() => e.classList.remove('on'), 2600); };
let dot = null, wpMk = [];
function mostraRec(on) {
  document.body.classList.toggle('recon', !!(on && REG));
  $('recpill').classList.toggle('on', !!(REG && !on));
  if (on && REG) { if (vista !== 'mappa') vai('mappa'); map.resize(); aggRec(); }
}
function aggRec() {
  if (!REG) return;
  const m = misure(REG.p), tm = orologio(Date.now() - REG.t0);
  $('rec-km').textContent = num1(m.km); $('rec-up').textContent = fmt(m.up); $('rec-tm').textContent = tm; $('recpill-t').textContent = tm;
  $('rec-lab').textContent = T('REGISTRAZIONE IN CORSO', 'RECORDING');
  $('recpill-l').textContent = T('Registrazione', 'Recording');
  $('rec-pt-l').textContent = T('Punto', 'Waypoint') + (REG.w.length ? ' · ' + REG.w.length : '');
  $('rec-gps').textContent = REG.p.length ? '' : T('In attesa del segnale GPS…', 'Waiting for GPS signal…');
  $('rec-gps').style.display = REG.p.length ? 'none' : '';
}
function posizione(q) {
  if (!dot) { const el = document.createElement('div'); el.className = 'gpsdot'; dot = new maplibregl.Marker({ element: el }).setLngLat([q[0], q[1]]).addTo(map); }
  else dot.setLngLat([q[0], q[1]]);
  if (segui && document.body.classList.contains('recon')) map.easeTo({ center: [q[0], q[1]], zoom: Math.max(map.getZoom(), 15), duration: 600 });
}
map.on('dragstart', () => { if (REG) segui = false; });
function avviaReg() {
  if (!navigator.geolocation && !isApp) return alertNota(t('noGps'));
  if (!confirm(t('regConfIn'))) return;
  REG = { t0: Date.now(), p: [], ob: [...intSel], w: [] };
  ascolta(); segui = true; salvaCorrente();
  try { navigator.wakeLock && navigator.wakeLock.request('screen').then(w => wake = w).catch(() => {}); } catch (e) {}
  tick = setInterval(aggRec, 1000);
  disegnaTrk([], []); mostraRec(true); regUI();
}
function ascolta() {
  const punto = (lon, lat, alt, acc) => {
    if (!REG || acc > 40) return;
    const q = [+lon.toFixed(6), +lat.toFixed(6), alt != null ? Math.round(alt) : null, Date.now()];
    posizione(q);
    const last = REG.p[REG.p.length - 1]; if (last && hav(last, q) < 4) return;
    REG.p.push(q); disegnaTrk(REG.p, REG.w); salvaCorrente(); aggRec();
  };
  const BG = isApp && window.Capacitor.Plugins && window.Capacitor.Plugins.BackgroundGeolocation;
  if (BG) {
    BG.addWatcher({ backgroundTitle: 'Sicilia Naturale', backgroundMessage: T('Registrazione percorso in corso', 'Recording route'), requestPermissions: true, stale: false, distanceFilter: 4 },
      (loc, err) => { if (err) { toast(t('noGps')); return; } if (loc) punto(loc.longitude, loc.latitude, loc.altitude, loc.accuracy); })
      .then(id => { bgId = id; });
  } else {
    wid = navigator.geolocation.watchPosition(pos => { const c = pos.coords; punto(c.longitude, c.latitude, c.altitude, c.accuracy); },
      () => toast(t('noGps')), { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
  }
}
function fermaReg() {
  if (!REG || !confirm(t('regConfFine'))) return;
  if (bgId != null) { try { window.Capacitor.Plugins.BackgroundGeolocation.removeWatcher({ id: bgId }); } catch (e) {} bgId = null; }
  if (wid != null) navigator.geolocation.clearWatch(wid); wid = null; try { wake && wake.release(); } catch (e) {}
  clearInterval(tick);
  const fatto = REG.p.length > 1 || REG.w.length;
  if (fatto) { const a = leggiTrk(); a.unshift({ id: 'T' + REG.t0, t0: REG.t0, ob: REG.ob, p: REG.p, w: REG.w }); scriviTrk(a); }
  REG = null; salvaCorrente(); if (dot) { dot.remove(); dot = null; }
  mostraRec(false); toast(fatto ? T('Percorso salvato in Escursioni', 'Route saved in Hikes') : T('Nessun dato da salvare', 'Nothing to save'));
  regUI(); trkUI();
}
// se l'app è stata chiusa durante una registrazione, il percorso non va perso
(function recupera() {
  try { const r = JSON.parse(localStorage.getItem(TKC)); if (r && (r.p.length > 1 || (r.w && r.w.length))) { const a = leggiTrk(); if (!a.some(x => x.id === 'T' + r.t0)) { a.unshift({ id: 'T' + r.t0, t0: r.t0, ob: r.ob, p: r.p, w: r.w || [] }); scriviTrk(a); } } localStorage.removeItem(TKC); } catch (e) {}
})();
$('rec-min').onclick = () => mostraRec(false);
$('recpill').onclick = () => mostraRec(true);
$('rec-stop').onclick = fermaReg;
$('rec-ctr').onclick = () => { segui = true; const q = REG && REG.p[REG.p.length - 1]; if (q) map.easeTo({ center: [q[0], q[1]], zoom: Math.max(map.getZoom(), 15), duration: 600 }); };
$('rec-pt').onclick = () => nuovoWpt(null);
$('rec-cam').onclick = () => scegliFoto(true, id => nuovoWpt(id));

/* nel pannello Escursioni */
function regUI() {
  if (!$('reg')) return;
  const m = REG ? misure(REG.p) : null;
  $('reg').innerHTML = REG
    ? `<div class="live"><div><b>${num1(m.km)} km</b><span>${t('dist')}</span></div><div><b>${durS((Date.now() - REG.t0) / 60000)}</b><span>${t('durata')}</span></div><div><b>${REG.w.length}</b><span>${T('punti', 'waypoints')}</span></div></div><button class="big" id="regapri">${T('Apri la registrazione', 'Open recording')}</button>`
    : `<button class="big" id="regbtn">${t('regInizia')}</button><p class="note" style="margin-top:8px">${t('regNota')}</p>`;
}
const alertNota = m => toast(m);

/* punti: scelta del tipo, scheda, foto */
let WPF = null;
const dovesono = () => REG && REG.p.length ? REG.p[REG.p.length - 1] : null;
function nuovoWpt(foto) {
  const q = dovesono(); if (!q) return toast(t('wpNoFix'));
  WPF = { lon: q[0], lat: q[1], ele: q[2], t: Date.now(), foto: foto ? [foto] : [], tipo: null, nome: '', desc: '', idx: -1 };
  sceltaTipo(true);
}
const recenti = () => { try { return JSON.parse(localStorage.getItem(TKR)) || []; } catch (e) { return []; } };
function sceltaTipo(nuovo) {
  const tile = k => `<button class="wpk" data-tk="${k}" style="--c:${wpCol(k)}">${ico(wpIco(k))}<span>${esc(wpNome(k))}</span></button>`;
  const rc = recenti().filter(k => WPT[k]).slice(0, 6);
  $('wps').innerHTML = `<div class="wph"><button class="rb" id="wps-x" aria-label="Chiudi">${ico('x')}</button><h2>${T('Che cosa hai trovato?', 'What did you find?')}</h2></div>
    <div class="wpb">${rc.length ? `<h3>${ico('history', 'sm')} ${T('Recenti', 'Recent')}</h3><div class="wpg">${rc.map(tile).join('')}</div>` : ''}
    ${WP.map(g => `<h3 style="--c:${COLG[g[0]]}">${esc(T(...g[1]))}</h3><div class="wpg">${g[2].map(x => tile(x[0])).join('')}</div>`).join('')}</div>`;
  $('wps').classList.add('on'); $('wps').scrollTop = 0;
  $('wps').dataset.nuovo = nuovo ? '1' : '';
}
$('wps').addEventListener('click', e => {
  if (e.target.closest('#wps-x')) { $('wps').classList.remove('on'); if ($('wps').dataset.nuovo) { (WPF.foto || []).forEach(fotoDel); WPF = null; } return; }
  const b = e.target.closest('[data-tk]'); if (!b || !WPF) return;
  WPF.tipo = b.dataset.tk;
  try { localStorage.setItem(TKR, JSON.stringify([WPF.tipo, ...recenti().filter(k => k !== WPF.tipo)].slice(0, 6))); } catch (e) {}
  $('wps').classList.remove('on'); schedaWpt();
});
async function schedaWpt() {
  const w = WPF, urls = await Promise.all(w.foto.map(fotoURL));
  $('wpf').innerHTML = `<div class="wph"><button class="rb" id="wpf-x" aria-label="Indietro">${ico('arrow-left')}</button><h2>${w.idx < 0 ? T('Nuovo punto', 'New waypoint') : T('Modifica punto', 'Edit waypoint')}</h2></div>
    <div class="wpb">
      <div class="wpr"><h3>${T('Foto', 'Photos')}</h3><button class="lnk" id="wpf-add">${ico('photo', 'sm')} ${T('Aggiungi foto', 'Add photo')}</button></div>
      <div class="wpph">${w.foto.map((id, i) => urls[i] ? `<div class="th"><img src="${urls[i]}" alt=""><button data-del="${i}" aria-label="Togli">${ico('x')}</button></div>` : '').join('') || `<button class="th vuoto" id="wpf-cam">${ico('camera-plus')}</button>`}</div>
      <button class="wpr tipo" id="wpf-tipo" style="--c:${wpCol(w.tipo)}"><h3>${T('Tipo', 'Type')}</h3><span>${ico(wpIco(w.tipo))}${esc(wpNome(w.tipo))}</span></button>
      <h3>${T('Nome', 'Name')}</h3><input id="wpf-n" maxlength="80" placeholder="${T('Dai un nome al punto', 'Name this waypoint')}" value="${esc(w.nome || '')}">
      <h3>${T('Descrizione', 'Description')}</h3><textarea id="wpf-d" rows="4" maxlength="1000" placeholder="${T('Che cosa vedi, come lo riconosci…', 'What you see, how to recognise it…')}">${esc(w.desc || '')}</textarea>
      <p class="note">${new Date(w.t).toLocaleString(LANG === 'it' ? 'it-IT' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })}${w.ele != null ? ' · ' + fmt(w.ele) + ' m' : ''} · ${w.lat.toFixed(5)}, ${w.lon.toFixed(5)}</p>
    </div>
    <div class="wpfoot"><button class="cest" id="wpf-del" aria-label="${T('Elimina', 'Delete')}">${ico('trash')}</button><button class="fatto" id="wpf-ok">${T('Fatto', 'Done')}</button></div>`;
  $('wpf').classList.add('on');
}
const leggiForm = () => { if (WPF && $('wpf-n')) { WPF.nome = $('wpf-n').value.trim(); WPF.desc = $('wpf-d').value.trim(); } };
$('wpf').addEventListener('click', e => {
  if (!WPF) return;
  if (e.target.closest('#wpf-add')) { leggiForm(); return scegliFoto(false, id => { WPF.foto.push(id); schedaWpt(); }); }
  if (e.target.closest('#wpf-cam')) { leggiForm(); return scegliFoto(true, id => { WPF.foto.push(id); schedaWpt(); }); }
  const d = e.target.closest('[data-del]'); if (d) { leggiForm(); fotoDel(WPF.foto.splice(+d.dataset.del, 1)[0]); return schedaWpt(); }
  if (e.target.closest('#wpf-tipo')) { leggiForm(); return sceltaTipo(false); }
  if (e.target.closest('#wpf-x') || e.target.closest('#wpf-ok')) {
    leggiForm(); const { idx, ...w } = WPF;
    if (REG) { if (idx < 0) REG.w.push(w); else REG.w[idx] = w; salvaCorrente(); disegnaTrk(REG.p, REG.w); aggRec(); }
    WPF = null; $('wpf').classList.remove('on'); if (idx < 0) toast(t('wpOk')); return;
  }
  if (e.target.closest('#wpf-del')) {
    if (!confirm(T('Eliminare questo punto e le sue foto?', 'Delete this waypoint and its photos?'))) return;
    WPF.foto.forEach(fotoDel); if (REG && WPF.idx >= 0) { REG.w.splice(WPF.idx, 1); salvaCorrente(); disegnaTrk(REG.p, REG.w); aggRec(); }
    WPF = null; $('wpf').classList.remove('on');
  }
});
function scegliFoto(camera, fatto) {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  if (camera) inp.setAttribute('capture', 'environment'); else inp.multiple = true;
  inp.onchange = async () => { for (const f of [...(inp.files || [])].slice(0, 10)) { try { fatto(await fotoSalva(f)); } catch (e) { toast(T('Foto non salvata', 'Photo not saved')); } } };
  inp.click();
}
const fotoDB = () => new Promise((ok, ko) => { const r = indexedDB.open('sn_foto', 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
async function fotoSalva(file) {
  const img = await createImageBitmap(file), k = Math.min(1, 1600 / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.82)), id = 'F' + Date.now() + Math.random().toString(36).slice(2, 6);
  const db = await fotoDB(); await new Promise((ok, ko) => { const tx = db.transaction('f', 'readwrite'); tx.objectStore('f').put(blob, id); tx.oncomplete = ok; tx.onerror = ko; });
  return id;
}
const URLF = {};
async function fotoURL(id) { if (URLF[id]) return URLF[id]; try { const db = await fotoDB(); const b = await new Promise(ok => { const r = db.transaction('f').objectStore('f').get(id); r.onsuccess = () => ok(r.result); r.onerror = () => ok(null); }); return b ? (URLF[id] = URL.createObjectURL(b)) : null; } catch (e) { return null; } }
async function fotoDel(id) { if (!id) return; delete URLF[id]; try { const db = await fotoDB(); db.transaction('f', 'readwrite').objectStore('f').delete(id); } catch (e) {} }

/* percorso e punti sulla mappa */
function disegnaTrk(p, w) {
  if (map.getSource('trk')) map.getSource('trk').setData({ type: 'FeatureCollection', features: p.length > 1 ? [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: p.map(q => [q[0], q[1]]) } }] : [] });
  wpMk.forEach(m => m.remove()); wpMk = [];
  (w || []).forEach((x, i) => {
    const el = document.createElement('button'); el.className = 'wpin'; el.style.setProperty('--c', wpCol(x.tipo));
    el.innerHTML = ico(wpIco(x.tipo)) + (x.foto && x.foto.length ? '<i></i>' : ''); el.title = x.nome || wpNome(x.tipo);
    el.onclick = ev => { ev.stopPropagation(); if (REG && w === REG.w) { WPF = { ...x, foto: [...(x.foto || [])], idx: i }; schedaWpt(); } else vediWpt(x); };
    wpMk.push(new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([x.lon, x.lat]).addTo(map));
  });
}
let popW = null;
async function vediWpt(x) {
  const urls = (await Promise.all((x.foto || []).map(fotoURL))).filter(Boolean);
  const h = `<div class="wpp"><b>${esc(x.nome || wpNome(x.tipo))}</b><small>${esc(wpNome(x.tipo))} · ${new Date(x.t).toLocaleString(LANG === 'it' ? 'it-IT' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' })}${x.ele != null ? ' · ' + fmt(x.ele) + ' m' : ''}</small>${x.desc ? `<p>${esc(x.desc)}</p>` : ''}${urls.map(u => `<img src="${u}" alt="">`).join('')}</div>`;
  if (popW) popW.remove();
  popW = new maplibregl.Popup({ maxWidth: '280px', offset: 30 }).setLngLat([x.lon, x.lat]).setHTML(h).addTo(map);
}
function trkUI() {
  if (!$('trk')) return;
  const a = leggiTrk();
  $('trk').innerHTML = a.length ? a.map(x => { const m = misure(x.p), n = (x.w || []).length; return `<div class="t"><b>${new Date(x.t0).toLocaleString(LANG === 'it' ? 'it-IT' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</b><small>${num1(m.km)} km · ${durS(m.min)} · +${fmt(m.up)} m${n ? ' · ' + n + ' ' + T(n === 1 ? 'punto' : 'punti', n === 1 ? 'waypoint' : 'waypoints') : ''}${x.ob && x.ob.length ? ' · ' + x.ob.map(o => t({ funghi: 'iFunghi', alberi: 'iAlberi', boschi: 'iBoschi', flora: 'iFlora', alim: 'iAlim' }[o])).join(', ') : ''}</small><div class="az"><button data-trk="${x.id}" data-az="map">${t('apriMappa')}</button><button data-trk="${x.id}" data-az="gpx">${t('gpx')}</button><button data-trk="${x.id}" data-az="del">${t('elimina')}</button></div></div>`; }).join('') : `<p class="note">${t('nessunTrk')}</p>`;
}
function azioneTrk(id, az) {
  const a = leggiTrk(), x = a.find(y => y.id === id); if (!x) return;
  if (az === 'del') { if (confirm(t('eliminaConf'))) { (x.w || []).forEach(w => (w.foto || []).forEach(fotoDel)); scriviTrk(a.filter(y => y.id !== id)); trkUI(); disegnaTrk([], []); } return; }
  if (az === 'map') { vai('mappa'); disegnaTrk(x.p, x.w); const pts = [...x.p, ...(x.w || []).map(w => [w.lon, w.lat])], lo = pts.map(q => q[0]), la = pts.map(q => q[1]); if (pts.length) map.fitBounds([[Math.min(...lo), Math.min(...la)], [Math.max(...lo), Math.max(...la)]], { padding: 60, maxZoom: 16, duration: 600 }); return; }
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Sicilia Naturale" xmlns="http://www.topografix.com/GPX/1/1">${(x.w || []).map(w => `<wpt lat="${w.lat}" lon="${w.lon}">${w.ele != null ? `<ele>${w.ele}</ele>` : ''}<time>${new Date(w.t).toISOString()}</time><name>${esc(w.nome || wpNome(w.tipo))}</name>${w.desc ? `<desc>${esc(w.desc)}</desc>` : ''}<type>${esc(wpNome(w.tipo))}</type></wpt>`).join('')}<trk><name>Sicilia Naturale ${new Date(x.t0).toISOString().slice(0, 10)}</name><trkseg>${x.p.map(q => `<trkpt lat="${q[1]}" lon="${q[0]}">${q[2] != null ? `<ele>${q[2]}</ele>` : ''}<time>${new Date(q[3]).toISOString()}</time></trkpt>`).join('')}</trkseg></trk></gpx>`;
  const u = URL.createObjectURL(new Blob([gpx], { type: 'application/gpx+xml' })), l = document.createElement('a'); l.href = u; l.download = `sicilia-naturale-${new Date(x.t0).toISOString().slice(0, 10)}.gpx`; document.body.appendChild(l); l.click(); l.remove();
}
setInterval(() => { if (REG && vista === 'escursioni') regUI(); }, 30000);
// tasto Indietro di Android: chiude le schede aperte; durante la registrazione manda l'app in secondo piano invece di chiuderla
(function indietro() {
  const A = isApp && window.Capacitor.Plugins && window.Capacitor.Plugins.App; if (!A) return;
  A.addListener('backButton', () => {
    if ($('wps').classList.contains('on')) return $('wps-x').click();
    if ($('wpf').classList.contains('on')) return $('wpf-x').click();
    if (document.body.classList.contains('recon')) return mostraRec(false);
    if (vista !== 'mappa') return vai('mappa');
    if (REG) return A.minimizeApp();
    A.exitApp();
  });
})();

/* ---------- Meteo: giorni migliori per escursioni e funghi */
const LUOGHI = () => Object.entries(S).filter(([k, x]) => AREE.includes(x.t) && x.t !== 'amp').sort((a, b) => b[1].ha - a[1].ha);
const centro = x => [(x.bb[0] + x.bb[2]) / 2, (x.bb[1] + x.bb[3]) / 2];
const giorno = (d, o) => new Date(d + 'T12:00:00').toLocaleDateString(LANG === 'it' ? 'it-IT' : 'en-GB', o || { weekday: 'short', day: 'numeric' });
function punteggioEsc(i, M) {
  const r = M.precipitation_sum[i] || 0, p = M.precipitation_probability_max[i] ?? 0, w = M.wind_speed_10m_max[i] || 0, tx = M.temperature_2m_max[i], tn = M.temperature_2m_min[i], c = M.weather_code[i] || 0;
  const prima = (M.precipitation_sum[i - 1] || 0) + (M.precipitation_sum[i - 2] || 0) * 0.5;
  let v = 10; const perche = [];
  const pr = Math.min(5, r * 0.5 + p / 30); if (pr >= 1) perche.push(t('piovoso')); v -= pr;
  if (w > 30) { v -= Math.min(3, (w - 30) / 8); perche.push(t('ventoso')); }
  if (tx > 30) { v -= Math.min(3, (tx - 30) / 2); perche.push(t('caldo')); }
  if (tn != null && tn < 2) { v -= Math.min(2, (2 - tn) / 2); perche.push(t('freddo')); }
  if (prima > 10) { v -= Math.min(1.5, (prima - 10) / 15); perche.push(t('fango')); }
  if (c >= 95) { v -= 3; perche.push(t('temporale')); }
  return { v: Math.max(1, Math.min(10, Math.round(v * 10) / 10)), perche };
}
function colore10(v) { return v >= 7.5 ? '#2d6a4f' : v >= 5.5 ? '#8fae3c' : v >= 3.5 ? '#d9a066' : '#c2571a'; }
/* dati meteo di tutti i parchi e le riserve in una sola richiesta (Open-Meteo accetta più coordinate) */
const mt0 = { k: 'e', day: 0, area: 'tutte' };
let METP = null, MET = null;
// cella con pioggia, temperatura e vento del giorno
const cella = (M, i) => `<span class="wx"><span>${ico('umbrella', 'xs')}${num1(M.precipitation_sum[i] || 0)} mm</span><span>${ico('temperature', 'xs')}${Math.round(M.temperature_2m_min[i])}–${Math.round(M.temperature_2m_max[i])}°</span><span>${ico('wind', 'xs')}${Math.round(M.wind_speed_10m_max[i] || 0)} km/h</span></span>`;
function serieMeteo(M) {
  const oggi = new Date().toISOString().slice(0, 10), i0 = Math.max(0, M.time.indexOf(oggi));
  const TM = new TrailModel.Model({ start: M.time[0], cp: { q: 'p' }, pts: { p: { r: M.precipitation_sum.map(x => x || 0), tx: M.temperature_2m_max, tn: M.temperature_2m_min } }, forecast: {} }, [], []);
  return { M, i0, oggi, G: M.time.slice(i0).map((d, n) => { const i = i0 + n; return { d, i, e: punteggioEsc(i, M), f: TM.stima('q', d) }; }) };
}
const URLM = (la, lo) => `https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,weather_code,precipitation_probability_max&past_days=61&forecast_days=14&timezone=Europe%2FRome`;
function caricaMeteo() {
  if (METP) return METP;
  METP = D.then(async () => {
    const L = LUOGHI(), c = L.map(([k, x]) => centro(x));
    const j = await getJ(URLM(c.map(p => p[1].toFixed(3)).join(','), c.map(p => p[0].toFixed(3)).join(',')));
    const arr = Array.isArray(j) ? j : j ? [j] : [];
    if (arr.length !== L.length || !arr[0].daily) { METP = null; MET = null; return; }
    MET = {}; L.forEach(([k], i) => MET[k] = serieMeteo(arr[i].daily));
  });
  return METP;
}
const valDi = (k, d) => { const g = MET[k].G[d]; return mt0.k === 'e' ? g.e.v : g.f.est; };
function meteo() {
  if (vista !== 'meteo') return;
  const dove = modo.meteo === 'mappa' ? $('pan') : $('cat');
  if (!MET) dove.innerHTML = `${modo.meteo === 'mappa' ? '' : '<div class="in">'}<div class="ph-top"><h2>${t('tMeteo')}</h2>${sw()}</div><p class="note">${t('carico')}</p>${modo.meteo === 'mappa' ? '' : '</div>'}`;
  caricaMeteo().then(() => {
    if (vista !== 'meteo') return;
    if (!MET) { dove.innerHTML = `<div class="ph-top"><h2>${t('tMeteo')}</h2>${sw()}</div><p class="avviso">${t('errMeteo')}</p>`; return; }
    const ks = LUOGHI().map(x => x[0]).filter(k => mt0.area === 'tutte' || areaDi(k) === mt0.area);
    const giorni = MET[ks[0] || LUOGHI()[0][0]].G;
    const top = [...ks].sort((a, b) => valDi(b, mt0.day) - valDi(a, mt0.day));
    const ctrl = `<div class="switch sw2">${[['e', 'perEsc'], ['f', 'perFun']].map(([v, l]) => `<button data-mk="${v}" class="${mt0.k === v ? 'on' : ''}">${t(l)}</button>`).join('')}</div>
      <div class="days">${giorni.map((g, n) => `<button data-day="${n}" class="${mt0.day === n ? 'on' : ''}"><small>${n === 0 ? t('oggi') : giorno(g.d, { weekday: 'short' })}</small><b>${giorno(g.d, { day: 'numeric' })}</b></button>`).join('')}</div>
      <div class="aree">${ORD_AREE.map(a => `<button data-area="${a}" class="${mt0.area === a ? 'on' : ''}">${t('AR')[a]}</button>`).join('')}</div>
      <div class="scala"><span>1</span><i></i><span>10</span></div>`;
    const riga = k => { const v = valDi(k, mt0.day); return `<button data-mz="${k}"><span class="ring" style="--v:${v * 10};--c:${colore10(v)}">${num1(v)}</span><span class="mzt"><b>${esc(S[k].n)}</b><small>${esc(t('AR')[areaDi(k)])} · ${mt0.k === 'e' ? (MET[k].G[mt0.day].e.perche.join(', ') || t('ok')) : MET[k].G[mt0.day].f.parola}</small></span>${cella(MET[k].M, MET[k].G[mt0.day].i)}</button>`; };
    if (modo.meteo === 'mappa') {
      $('pan').innerHTML = `<div class="ph-top"><h2>${t('tMeteo')}</h2>${sw()}</div>${ctrl}<p class="pl">${t('toccaZona')}</p><h3>${t('miglioriQui')}</h3><div class="mz">${top.slice(0, 5).map(riga).join('')}</div><p class="src">${t('fonte')}: Open-Meteo (CC BY 4.0) · ${LANG === 'it' ? 'modello T1 di Sottobosco' : 'Sottobosco T1 model'}</p>`;
      evidenzia(ks.map(k => ({ k, v: valDi(k, mt0.day), vs: num1(valDi(k, mt0.day)), lab: S[k].n.replace(/^Riserva naturale (orientata |integrale |speciale |regionale )?/i, 'R.N. ') })));
    } else {
      $('cat').innerHTML = `<div class="in"><div class="ph-top"><h2>${t('tMeteo')}</h2>${sw()}</div><p class="lead">${t('lMeteo')}</p>${ctrl}<div class="mz grid">${top.map(riga).join('')}</div>
        <p class="src">${t('fonte')}: <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a> (CC BY 4.0) · ${LANG === 'it' ? 'modello T1 di Sottobosco' : 'Sottobosco T1 model'}</p></div>`;
    }
  });
}
const clickMt = e => {
  if (vista !== 'meteo') return;
  const a = e.target.closest('[data-area]'), d = e.target.closest('[data-day]'), m = e.target.closest('[data-mk]'), z = e.target.closest('[data-mz]');
  if (a) { mt0.area = a.dataset.area; meteo(); if (modo.meteo === 'mappa') map.fitBounds(limitiArea(mt0.area), { padding: padMappa(), duration: 700 }); }
  else if (d) { mt0.day = +d.dataset.day; meteo(); }
  else if (m) { mt0.k = m.dataset.mk; meteo(); }
  else if (z) apriMeteoZona(z.dataset.mz);
};
$('pan').addEventListener('click', clickMt); $('cat').addEventListener('click', clickMt);
/* scheda meteo di una zona: 14 giorni per escursione e funghi, pioggia passata */
function apriMeteoZona(k) {
  if (!MET || !MET[k]) return;
  const { M, i0, oggi, G } = MET[k];
  cur = null; selez('');
  const topE = [...G].sort((a, b) => b.e.v - a.e.v).slice(0, 3).map(x => x.d), topF = [...G].sort((a, b) => b.f.est - a.f.est).slice(0, 3).map(x => x.d);
  const box = (tit, nota, key, top) => `<div class="mt-box"><h3>${tit}</h3><p class="mt-best">${t('migliori')}: <b>${elenco([...top].sort().map(d => giorno(d, { weekday: 'long', day: 'numeric', month: 'long' })))}</b></p>
    <div class="giorni">${G.map(g => { const v = key === 'e' ? g.e.v : g.f.est, sub = key === 'e' ? (g.e.perche.length ? g.e.perche.join(', ') : t('ok')) : g.f.parola;
      return `<div class="gg${top.includes(g.d) ? ' best' : ''}"><b>${g.d === oggi ? t('oggi') : giorno(g.d)}</b><span class="sc">${num1(v)}<i><span style="width:${v * 10}%;background:${colore10(v)}"></span></i></span>${cella(M, g.i)}<small>${esc(sub)}</small></div>`; }).join('')}</div>
    <p class="note" style="margin-top:10px">${nota}</p></div>`;
  const mx = Math.max(5, ...M.precipitation_sum.map(x => x || 0));
  $('sh').innerHTML = testa(S[k].n, `<span class="badge">${esc(t('AR')[areaDi(k)])}</span>`);
  $('sb').innerHTML = `<div style="padding-top:10px"></div>` + box(t('escTit'), t('escNota'), 'e', topE) + box(t('funTit'), t('funNota'), 'f', topF)
    + `<div class="mt-box"><h3>${t('pioggiaTit')}</h3><div class="pioggia">${M.time.map((d, i) => `<div class="${i >= i0 ? 'f' : ''}" style="height:${(M.precipitation_sum[i] || 0) / mx * 100}%" title="${d}: ${(M.precipitation_sum[i] || 0).toFixed(1)} mm"></div>`).join('')}</div><div class="pioggia-l"><span>${giorno(M.time[0], { day: 'numeric', month: 'short' })}</span><span>${t('oggi')}</span><span>${giorno(M.time[M.time.length - 1], { day: 'numeric', month: 'short' })}</span></div></div>
    <div class="links"><button data-id="${k}">${t('schedaZona')}<br><small>${esc(t(S[k].t))} · ${fmt(S[k].ha)} ha</small></button></div>`;
  mostra();
}

/* segnalazioni GBIF della specie sulla mappa (esagoni, dal sito GBIF) */
async function mostraGbif(nome, key) {
  if (!key) { const m = await getJ('https://api.gbif.org/v1/species/match?name=' + encodeURIComponent(nome)); key = m && m.usageKey; }
  vai('mappa');
  if (!key) return;
  if (map.getLayer('gbif')) map.removeLayer('gbif'); if (map.getSource('gbif')) map.removeSource('gbif');
  map.addSource('gbif', { type: 'raster', tileSize: 512, attribution: 'GBIF.org',
    tiles: [`https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?srs=EPSG:3857&taxonKey=${key}&bin=hex&hexPerTile=40&style=classic.poly`] });
  map.addLayer({ id: 'gbif', type: 'raster', source: 'gbif', paint: { 'raster-opacity': 0.85 } }, 'sel');
  $('gbifchip').innerHTML = `<span>${t('gbifChip')} <i>${esc(nome)}</i></span><button aria-label="Chiudi">×</button>`; $('gbifchip').classList.add('on');
  map.fitBounds([[12.3, 36.55], [15.7, 38.35]], { padding: 30, duration: 600 });
}
$('gbifchip').onclick = e => { if (!e.target.closest('button')) return; if (map.getLayer('gbif')) map.removeLayer('gbif'); if (map.getSource('gbif')) map.removeSource('gbif'); $('gbifchip').classList.remove('on'); };
// aprire una zona da una scheda specie riporta alla mappa
$('sheet').addEventListener('click', e => { if (vista !== 'mappa' && e.target.closest('button[data-id]')) { vai('mappa'); } }, true);
testi();
}
