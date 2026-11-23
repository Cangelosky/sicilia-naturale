/* Sicilia Naturale - anteprima mappa e schede zona.
   Mappa di base impacchettata in tiles/*.txt (OpenFreeMap + rilievo Terrarium), servita con il protocollo loc://.
   Dati zone: data/*.json preparati da tools/costruisci_dati.py (fonti EEA). */
{
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const T = (it, en) => LANG === 'it' ? it : en;
// nota di proprietà, in fondo alle pagine e ai Livelli
let UPD = '';  // stato degli aggiornamenti automatici, mostrato nel piè di pagina
const COPY = () => `<p class="copy">© ${new Date().getFullYear()} Oscar Cangelosi · Sicilia Naturale · ${T('versione', 'version')} ${(window.SN_VER || {}).v || ''}${UPD ? ' (' + esc(UPD) + ')' : ''}. ${T('Tutti i diritti riservati su app, testi, grafica e progetto. Dati e immagini di terzi appartengono ai rispettivi titolari e sono usati secondo le loro licenze.', 'All rights reserved on app, texts, design and project. Third-party data and images belong to their owners and are used under their licences.')}</p>`;
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
    dAree: 'Parchi e riserve naturali: luoghi protetti, con regole da rispettare.',
    dN2k: 'Luoghi protetti dall’Europa per piante e animali rari (linea piena) e per gli uccelli (linea tratteggiata).',
    dBv: 'Boschi antichi, quasi mai tagliati: i più selvaggi della Sicilia.',
    dAm: 'Alberi speciali per età o grandezza, protetti dalla Regione.',
    dBs: 'Boschi dove si raccolgono i semi per piantare nuovi alberi.',
    dCf: 'Che bosco c’è in ogni punto: faggi, querce, pini… Scegli quelli che ti interessano.',
    tuttiTipi: 'Tutti', nessunTipo: 'Nessuno',
    quiN: n => `Qui si sovrappongono ${n} zone`, quiNota: 'Lo stesso luogo può avere più tutele: tocca una zona per aprirne la scheda.',
    vb: n => n === 1 ? '1 bosco vetusto' : n + ' boschi vetusti', va: n => n === 1 ? '1 albero monumentale' : n + ' alberi monumentali',
    wiki: 'Da Wikipedia', wleggi: 'Leggi su Wikipedia', foto: 'Foto nei dintorni', fotoN: 'Foto da Wikimedia Commons: restano dei loro autori, con la licenza indicata.',
    vMappa: 'Esplora', vFunghi: 'Micologia', vPiante: 'Botanica', vEsc: 'Percorsi', vMeteo: 'Meteo', vReg: 'Registra', vSpecie: 'Specie',
    tMeteo: 'Meteo per le escursioni', lMeteo: 'I giorni migliori per uscire nei prossimi 14 giorni, calcolati con le previsioni e con la pioggia caduta nei 60 giorni precedenti (dati Open-Meteo).',
    luogo: 'Luogo', posiz: 'La mia posizione', carico: 'Carico i dati meteo…', errMeteo: 'Dati meteo non disponibili in questo momento. Riprova tra poco.',
    escTit: 'Escursione', escNota: 'Punteggio da 1 a 10: pioggia prevista, probabilità di pioggia, vento, temperatura e fango dei giorni precedenti.',
    funTit: 'Funghi', funNota: 'Modello T1 di Sottobosco, nella versione che stima dal meteo e dalla stagione (senza misure sul campo in questa zona): pioggia utile degli ultimi 60 giorni con il giusto ritardo, giorni di secco, notti troppo calde o fredde. Non è ancora validato: è un’indicazione, non una certezza.',
    migliori: 'Giorni migliori', pioggiaTit: 'Pioggia: 60 giorni passati e previsione', oggi: 'oggi', mm: 'mm',
    tEsc: 'Escursioni', lEsc: 'Scegli cosa vuoi cercare: ti proponiamo dove andare, con il meteo dei prossimi giorni. Puoi registrare il percorso mentre cammini.',
    iFunghi: 'Funghi', iAlberi: 'Alberi monumentali e boschi vetusti', iBoschi: 'Boschi', iFlora: 'Piante e fiori', iAlim: 'Piante alimurgiche',
    alimNota: 'Piante usate per tradizione nella cucina siciliana, secondo uno studio dell’Università di Palermo (Licata e altri, 2016). Qui non diamo indicazioni per mangiarle: molte somigliano a piante tossiche. Non raccoglierle senza un esperto.',
    doveAndare: 'Dove andare', apriMappa: 'Mappa', vediMeteo: 'Meteo', reg: 'Registra il percorso', regInizia: 'Inizia a registrare', wpAgg: 'Punto', wpFoto: 'Foto', wpNome: 'Nome (facoltativo)', wpSalva: 'Salva punto', wpAnnulla: 'Annulla', wpNoFix: 'Aspetta il segnale GPS: nessuna posizione ancora.', wpOk: 'Punto salvato', wpPunti: 'punti', wpPunto: 'punto', wpFotoAgg: 'Aggiungi foto', wpTipi: { fungo: 'Fungo', albero: 'Albero', pianta: 'Pianta', panorama: 'Panorama', acqua: 'Acqua', rifugio: 'Rifugio', animale: 'Animale', foto: 'Foto', altro: 'Altro' }, regFine: 'Termina la registrazione',
    regConfIn: 'Iniziare la registrazione del percorso? Il GPS resta attivo anche a schermo spento finché non la termini.', regConfFine: 'Terminare e salvare la registrazione?',
    regNota: 'La registrazione usa il GPS del telefono e continua anche a schermo spento. Percorsi, punti e foto restano salvati solo su questo telefono.',
    noGps: 'Il GPS non è disponibile su questo dispositivo o il permesso è stato negato.',
    dist: 'Distanza', durata: 'Durata', disl: 'Dislivello +', miei: 'I miei percorsi', nessunTrk: 'Nessun percorso registrato.', gpx: 'GPX', elimina: 'Elimina', eliminaConf: 'Eliminare questo percorso? Non si potrà recuperare.',
    obiettivo: 'Obiettivo', sent: 'Sentieri e rifugi', dSent: 'Sentieri, percorsi segnati, rifugi, sorgenti e panorami. Si vedono avvicinandosi.',
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
    tPiante: 'Botanica siciliana', lPiante: n => `${fmt(n)} piante vascolari della Sicilia: quelle dei siti Natura 2000, degli alberi monumentali e dei boschi da seme, più tutte le altre segnalate in Sicilia su GBIF. Tocca una specie per la scheda e i luoghi dove cresce.`, famiglia: 'Famiglia', tutteFam: 'Tutte le famiglie', inN2k: 'Nei siti Natura 2000', torna: 'Torna a',
    cercaSp: 'Cerca per nome comune o scientifico, genere, famiglia…', tutte: 'Tutte', conFoto: 'Con foto', alberi: 'Alberi e arbusti', nSp: n => `${fmt(n)} specie`, altri: 'Mostra altre',
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
    dAree: 'Parks and nature reserves: protected places with rules to follow.',
    dN2k: 'Places protected by Europe for rare plants and animals (solid line) and for birds (dashed line).',
    dBv: 'Ancient forests, hardly ever cut: the wildest in Sicily.',
    dAm: 'Special trees for age or size, protected by the Region.',
    dBs: 'Forests where seeds are collected to plant new trees.',
    dCf: 'Which forest grows at each spot: beech, oak, pine… Pick the ones you like.',
    tuttiTipi: 'All', nessunTipo: 'None',
    quiN: n => `${n} areas overlap here`, quiNota: 'The same place can have several kinds of protection: tap one to open it.',
    vb: n => n === 1 ? '1 old-growth forest' : n + ' old-growth forests', va: n => n === 1 ? '1 monumental tree' : n + ' monumental trees',
    wiki: 'From Wikipedia', wleggi: 'Read on Wikipedia', foto: 'Photos nearby', fotoN: 'Photos from Wikimedia Commons: they belong to their authors, under the licence shown.',
    vMappa: 'Explore', vFunghi: 'Mycology', vPiante: 'Botany', vEsc: 'Trails', vMeteo: 'Weather', vReg: 'Record', vSpecie: 'Species',
    tMeteo: 'Weather for hikes', lMeteo: 'The best days to go out in the next 14 days, from the forecast and the rain of the previous 60 days (Open-Meteo data).',
    luogo: 'Place', posiz: 'My location', carico: 'Loading weather data…', errMeteo: 'Weather data not available right now. Please try again shortly.',
    escTit: 'Hike', escNota: 'Score from 1 to 10: forecast rain, chance of rain, wind, temperature and mud from previous days.',
    funTit: 'Fungi', funNota: 'Sottobosco’s T1 model, in the version that estimates from weather and season (no field measurements in this area): useful rain of the last 60 days with the right delay, dry spells, nights too warm or too cold. Not yet validated: a hint, not a certainty.',
    migliori: 'Best days', pioggiaTit: 'Rain: past 60 days and forecast', oggi: 'today', mm: 'mm',
    tEsc: 'Hikes', lEsc: 'Choose what you want to look for: we suggest where to go, with the weather for the coming days. You can record your route as you walk.',
    iFunghi: 'Fungi', iAlberi: 'Monumental trees and old-growth forests', iBoschi: 'Forests', iFlora: 'Plants and flowers', iAlim: 'Wild edible plants',
    alimNota: 'Plants traditionally used in Sicilian cooking, according to a University of Palermo study (Licata et al., 2016). We give no advice on eating them: many look like toxic plants. Do not pick them without an expert.',
    doveAndare: 'Where to go', apriMappa: 'Map', vediMeteo: 'Weather', reg: 'Record your route', regInizia: 'Start recording', wpAgg: 'Waypoint', wpFoto: 'Photo', wpNome: 'Name (optional)', wpSalva: 'Save waypoint', wpAnnulla: 'Cancel', wpNoFix: 'Wait for GPS: no position yet.', wpOk: 'Waypoint saved', wpPunti: 'waypoints', wpPunto: 'waypoint', wpFotoAgg: 'Add photo', wpTipi: { fungo: 'Mushroom', albero: 'Tree', pianta: 'Plant', panorama: 'View', acqua: 'Water', rifugio: 'Shelter', animale: 'Animal', foto: 'Photo', altro: 'Other' }, regFine: 'Stop recording',
    regConfIn: 'Start recording the route? GPS stays on, even with the screen off, until you stop.', regConfFine: 'Stop and save the recording?',
    regNota: 'Recording uses the phone’s GPS and keeps going with the screen off. Routes, waypoints and photos stay on this phone only.',
    noGps: 'GPS is not available on this device or permission was denied.',
    dist: 'Distance', durata: 'Duration', disl: 'Ascent', miei: 'My routes', nessunTrk: 'No recorded routes.', gpx: 'GPX', elimina: 'Delete', eliminaConf: 'Delete this route? It cannot be recovered.',
    obiettivo: 'Goal', sent: 'Trails and huts', dSent: 'Trails, marked routes, huts, springs and viewpoints. Visible as you zoom in.',
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
    tPiante: 'Sicilian botany', lPiante: n => `${fmt(n)} vascular plants of Sicily: those of the Natura 2000 sites, monumental trees and seed stands, plus all others recorded in Sicily on GBIF. Tap a species for its page and the places where it grows.`, famiglia: 'Family', tutteFam: 'All families', inN2k: 'In Natura 2000 sites', torna: 'Back to',
    cercaSp: 'Search by common or scientific name, genus, family…', tutte: 'All', conFoto: 'With photos', alberi: 'Trees and shrubs', nSp: n => `${fmt(n)} species`, altri: 'Show more',
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
  else if (p[0] === 's') { const s = +p[1] - 9; name = 'st_' + (p[2] >> s) + '_' + (p[3] >> s); }
  else if (p[0] !== 'g') { const z = +p[1]; if (z > 7) { const s = z - 7; name = 'c_' + (p[2] >> s) + '_' + (p[3] >> s); } }
  let P; try { P = await pack(name); } catch (e) { if (p[0] !== 'd') return { data: new ArrayBuffer(0) }; throw e; }
  const e = P.idx[k];
  if (!e) { if (p[0] === 'd') throw new Error('no tile'); return { data: new ArrayBuffer(0) }; }
  return { data: P.b.slice(P.o + e[0], P.o + e[0] + e[1]) };
});
/* ---------- mappe offline: dettaglio (OpenFreeMap, zoom 12-14) e satellite passano da qui; prima la cache delle zone scaricate */
const CACHE_OFF = 'sn-mappe';
let OFM = null; try { OFM = localStorage.getItem('sn_ofm'); } catch (e) {}
async function urlDettaglio() {
  if (OFM) return OFM;
  const j = await fetch('https://tiles.openfreemap.org/planet').then(r => r.json());
  OFM = j.tiles[0]; try { localStorage.setItem('sn_ofm', OFM); } catch (e) {} return OFM;
}
const urlSat = (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
async function urlTile(tipo, z, x, y) { return tipo === 'sat' ? urlSat(z, x, y) : (await urlDettaglio()).replace('{z}', z).replace('{x}', x).replace('{y}', y); }
maplibregl.addProtocol('off', async params => {
  const [tipo, z, x, y] = params.url.slice(6).split('/'), chiave = `https://sn.offline/${tipo}/${z}/${x}/${y}`;
  try { const c = await caches.open(CACHE_OFF), m = await c.match(chiave); if (m) return { data: await m.arrayBuffer() }; } catch (e) {}
  try { const r = await fetch(await urlTile(tipo, z, x, y)); if (r.ok) return { data: await r.arrayBuffer() }; } catch (e) {}
  return { data: new ArrayBuffer(0) };
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

// vista satellitare (Esri World Imagery), sotto strade, nomi e livelli dell'app
style.sources.sat = { type: 'raster', tiles: ['off://sat/{z}/{x}/{y}'], tileSize: 256, maxzoom: 19, attribution: 'Satellite: Esri, Maxar, Earthstar Geographics' };
style.layers.splice(style.layers.findIndex(l => l.id === 'wway'), 0, { id: 'sat', type: 'raster', source: 'sat', layout: { visibility: 'none' }, paint: { 'raster-opacity': 1 } });
// dettaglio da zoom 12: strade minori, carrarecce, sentieri, edifici, nomi delle località
style.sources.omd = { type: 'vector', tiles: ['off://ofm/{z}/{x}/{y}'], minzoom: 12, maxzoom: 14, bounds: B, attribution: '© OpenStreetMap · OpenFreeMap' };
style.layers.splice(style.layers.findIndex(l => l.id === 'place'), 0,
  { id: 'd-bld', type: 'fill', source: 'omd', 'source-layer': 'building', minzoom: 14, paint: { 'fill-color': '#d8cfbf', 'fill-opacity': 0.7 } },
  { id: 'd-road', type: 'line', source: 'omd', 'source-layer': 'transportation', minzoom: 12, filter: ['in', ['get', 'class'], ['literal', ['minor', 'service', 'tertiary', 'secondary', 'primary', 'trunk', 'motorway']]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#fffdf7', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 16, 5] } },
  { id: 'd-track', type: 'line', source: 'omd', 'source-layer': 'transportation', minzoom: 12, filter: ['==', ['get', 'class'], 'track'], paint: { 'line-color': '#8d6e46', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.8, 16, 2], 'line-dasharray': [3, 1.5] } },
  { id: 'd-path', type: 'line', source: 'omd', 'source-layer': 'transportation', minzoom: 13, filter: ['==', ['get', 'class'], 'path'], paint: { 'line-color': '#7a5a3a', 'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.7, 16, 1.6], 'line-dasharray': [1, 1.4] } },
  { id: 'd-name', type: 'symbol', source: 'omd', 'source-layer': 'place', minzoom: 12, filter: ['in', ['get', 'class'], ['literal', ['hamlet', 'isolated_dwelling', 'locality', 'neighbourhood', 'suburb']]], layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Regular'], 'text-size': 11 }, paint: { 'text-color': '#4a4236', 'text-halo-color': '#fff', 'text-halo-width': 1.3 } }
);
style.sources.dem3d = { type: 'raster-dem', tiles: ['loc://d/{z}/{x}/{y}'], encoding: 'terrarium', tileSize: 256, minzoom: 5, maxzoom: 8, bounds: B };
const map = new maplibregl.Map({ container: 'map', style, bounds: [[12.3, 36.55], [15.7, 38.35]], fitBoundsOptions: { padding: 20 }, minZoom: 6, maxZoom: 17, maxPitch: 70, maxBounds: [[8, 31], [19.5, 42.5]], attributionControl: false });
/* mappa 3D: rilievo vero (DEM Terrarium) con esagerazione verticale, inclinazione e rotazione */
let tre = false;
const b3 = document.createElement('button'); b3.className = 'btn3d'; b3.textContent = '3D'; b3.setAttribute('aria-pressed', 'false'); document.getElementById('wrap').appendChild(b3);
b3.onclick = () => {
  tre = !tre; b3.classList.toggle('on', tre); b3.setAttribute('aria-pressed', tre);
  if (tre) { map.setTerrain({ source: 'dem3d', exaggeration: 1.8 }); map.easeTo({ pitch: 62, bearing: map.getBearing() || -15, duration: 900 }); }
  else { map.easeTo({ pitch: 0, bearing: 0, duration: 700 }); setTimeout(() => { if (!tre) map.setTerrain(null); }, 720); }
};
let satOn = false; try { satOn = localStorage.getItem('sn_sat') === '1'; } catch (e) {}
const bs = document.createElement('button'); bs.className = 'btn3d btnsat'; bs.textContent = 'SAT'; document.getElementById('wrap').appendChild(bs);
function satellite(on) {
  satOn = on; bs.classList.toggle('on', on); bs.setAttribute('aria-pressed', on);
  try { localStorage.setItem('sn_sat', on ? '1' : '0'); } catch (e) {}
  if (!map.getLayer('sat')) return;
  map.setLayoutProperty('sat', 'visibility', on ? 'visible' : 'none');
  for (const l of ['d-bld', 'd-road']) if (map.getLayer(l)) map.setPaintProperty(l, l === 'd-bld' ? 'fill-opacity' : 'line-opacity', on ? 0.35 : (l === 'd-bld' ? 0.7 : 1));
  for (const [l, k, v] of [['road', 'line-color', on ? '#f3e6c4' : C.road], ['place', 'text-color', on ? '#ffffff' : C.tx], ['place', 'text-halo-color', on ? 'rgba(0,0,0,.75)' : C.halo], ['wway', 'line-opacity', on ? 0.5 : 1]]) map.setPaintProperty(l, k, v);
}
bs.onclick = () => satellite(!satOn);
map.on('load', () => satellite(satOn));
map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
/* crediti della mappa: un solo tasto "i" che apre l'elenco delle fonti visibili */
const crediti = { onAdd() { const d = document.createElement('div'); d.className = 'maplibregl-ctrl crediti';
  d.innerHTML = '<button type="button" aria-label="Crediti della mappa">i</button><div class="cr-box"></div>';
  d.firstChild.onclick = () => { const box = d.lastChild, on = !d.classList.contains('on');
    if (on) { const st = map.getStyle(), set = new Set(); for (const [id, src] of Object.entries(st.sources)) if (src.attribution && st.layers.some(l => l.source === id && (l.layout || {}).visibility !== 'none')) set.add(src.attribution);
      box.innerHTML = [...set, 'Dati zone: EEA Natura 2000, EEA NatDA · Regione Siciliana, SIF', '© ' + new Date().getFullYear() + ' Oscar Cangelosi · Sicilia Naturale'].map(x => '<div>' + x + '</div>').join(''); }
    d.classList.toggle('on', on); };
  return d; }, onRemove() {} };
map.addControl(crediti, 'bottom-left');

/* ---------- dati */
let prcSel = { area: 'tutte', diff: '', int: '', len: '', n: 8, uff: false, zona: '' };
let PIAN = null;  // itinerario in disegno (vedi "itinerari")
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
let NOMI = {};
const CAT = Promise.all(['funghi', 'piante', 'nomi'].map(n => fetch('data/' + n + '.json').then(r => r.json()).catch(() => ({})))).then(([f, p, nm]) => { FUN = f; PIA = p; NOMI = nm || {}; });
// nome comune (italiano; in siciliano se c'è) di una specie del catalogo
const nomeC = (tipo, i) => { const r = (tipo === 'funghi' ? FUN : PIA).s[i], k = tipo === 'funghi' ? r[7] : r[4], n = k && NOMI[k]; return n ? (LANG === 'it' ? n[0] : n[0]) : ''; };
const nomeScn = (tipo, i) => { const r = (tipo === 'funghi' ? FUN : PIA).s[i], k = tipo === 'funghi' ? r[7] : r[4], n = k && NOMI[k]; return n ? n[1] : ''; };

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
  // sentieri, percorsi segnati e punti di interesse (OpenStreetMap) impacchettati nell'app: niente attese dai server
  map.addSource('st', { type: 'vector', tiles: ['loc://s/{z}/{x}/{y}'], minzoom: 9, maxzoom: 14, bounds: B, attribution: '© OpenStreetMap (ODbL)' });
  const DIFF = ['match', ['get', 'c'], 'T', '#2f9e44', 'E', '#d9480f', 'EE', '#c92a2a', 'EEA', '#5f3dc4', '#d9480f'];
  map.addLayer({ id: 'osm-s', type: 'line', source: 'st', 'source-layer': 'sent', minzoom: 11, layout: { visibility: 'none', 'line-cap': 'round' }, paint: { 'line-color': ['match', ['get', 'd'], 3, '#7b2d26', 2, '#b3261e', '#9c5a2a'], 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 1, 15, 2.4], 'line-dasharray': [2, 1.4], 'line-opacity': 0.9 } });
  map.addLayer({ id: 'osm-rc', type: 'line', source: 'st', 'source-layer': 'perc', layout: { visibility: 'none', 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#fff', 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 2.6, 14, 6], 'line-opacity': 0.85 } });
  map.addLayer({ id: 'osm-r', type: 'line', source: 'st', 'source-layer': 'perc', layout: { visibility: 'none', 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': DIFF, 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 1.4, 14, 3.4] } });
  map.addLayer({ id: 'osm-rt', type: 'symbol', source: 'st', 'source-layer': 'perc', minzoom: 12, layout: { visibility: 'none', 'symbol-placement': 'line', 'text-field': ['coalesce', ['get', 'r'], ''], 'text-font': ['Noto Sans Regular'], 'text-size': 11, 'symbol-spacing': 260 }, paint: { 'text-color': '#7a1f12', 'text-halo-color': '#fff', 'text-halo-width': 2 } });
  map.addLayer({ id: 'osm-p', type: 'symbol', source: 'st', 'source-layer': 'poi', minzoom: 11, layout: { visibility: 'none', 'icon-image': ['concat', 'poi-', ['get', 't']], 'icon-size': ['interpolate', ['linear'], ['zoom'], 11, 0.75, 14, 1, 16, 1.15], 'icon-allow-overlap': false, 'icon-padding': 1 } });
  map.addLayer({ id: 'osm-t', type: 'symbol', source: 'st', 'source-layer': 'poi', minzoom: 13, layout: { visibility: 'none', 'text-field': ['get', 'n'], 'text-font': ['Noto Sans Regular'], 'text-size': 11, 'text-offset': [0, 1.3], 'text-anchor': 'top', 'text-optional': true }, paint: { 'text-color': '#3b2a14', 'text-halo-color': '#fff', 'text-halo-width': 1.4 } });
  map.addSource('guida', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({ id: 'guida-c', type: 'line', source: 'guida', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#fff', 'line-width': 10, 'line-opacity': 0.85 } });
  map.addLayer({ id: 'guida-l', type: 'line', source: 'guida', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#1d4ed8', 'line-width': 6, 'line-opacity': 0.75 } });
  map.addSource('prc', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({ id: 'prc-c', type: 'line', source: 'prc', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#fff', 'line-width': 9, 'line-opacity': 0.9 } });
  map.addLayer({ id: 'prc-l', type: 'line', source: 'prc', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#1d4ed8', 'line-width': 5 } });
  iconePoi();
  map.addSource('hl', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addSource('hlp', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  const scala = ['interpolate', ['linear'], ['get', 'v'], 1, '#d1495b', 4, '#edae49', 6.5, '#8fc93a', 9, '#1f9e6e'];
  map.addLayer({ id: 'hl-f', type: 'fill', source: 'hl', paint: { 'fill-color': scala, 'fill-opacity': 0.42 } });
  map.addLayer({ id: 'hl-g', type: 'line', source: 'hl', paint: { 'line-color': scala, 'line-width': 9, 'line-opacity': 0.22, 'line-blur': 4 } });
  map.addLayer({ id: 'hl-l', type: 'line', source: 'hl', paint: { 'line-color': scala, 'line-width': 2.2 } });
  map.addLayer({ id: 'hl-t', type: 'symbol', source: 'hlp', layout: { 'text-field': ['format', ['get', 'vs'], { 'font-scale': 1.25 }, '\n', {}, ['get', 'lab'], { 'font-scale': 0.85 }, ['case', ['has', 'wx'], ['concat', '\n', ['get', 'wx']], ''], { 'font-scale': 0.78, 'text-color': '#1d4e89' }], 'text-font': ['Noto Sans Regular'], 'text-size': 13, 'text-max-width': 9, 'text-padding': 4 }, paint: { 'text-color': '#10261c', 'text-halo-color': 'rgba(255,255,255,.92)', 'text-halo-width': 1.6 } });
  map.addSource('trk', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({ id: 'trk-l', type: 'line', source: 'trk', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#1b4332', 'line-width': 4, 'line-opacity': 0.9 } });
  
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
const ON = { aree: true, n2k: true, bv: false, am: false, bs: false, cf: false, osm: false };
let cfSel = null;   // macrocategorie scelte; null = tutte
const LIV = { osm: ['osm-s', 'osm-rc', 'osm-r', 'osm-rt', 'osm-p', 'osm-t'], cf: ['cf-f', 'cf-l', 'cf-p'], bv: ['bv-f', 'bv-l', 'bv-p', 'sel-bv'], am: ['am-c', 'sel-am'], bs: ['bs-f', 'bs-l', 'sel-bs'] };
// in Escursioni i sentieri restano visibili anche quando le zone sono evidenziate
const sentInEsc = l => vista === 'escursioni' && ON.osm && LIV.osm.includes(l);
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
  if (document.body.classList.contains('mm')) for (const l of [...Object.keys(base), ...Object.values(LIV).flat()]) if (map.getLayer(l) && !sentInEsc(l)) map.setLayoutProperty(l, 'visibility', 'none');
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
  $('liv').innerHTML = `<button class="grip" aria-label="Abbassa"><span></span></button><div class="lvh"><h3>${t('livelli')}</h3><button class="espandi" aria-label="${T('Tutto schermo', 'Full screen')}">${ico($('liv').classList.contains('big') ? 'arrows-minimize' : 'arrows-maximize')}</button><button class="close" aria-label="${t('chiudi')}">×</button></div><h4>${T('Sentieri', 'Trails')}</h4>` + riga_lv('osm', t('sent'), t('dSent')) + `<h4>${t('gTut')}</h4>`
    + riga_lv('aree', t('aree'), t('dAree')) + riga_lv('n2k', t('n2k') + ' · ZSC / ZPS', t('dN2k'))
    + `<h4>${t('gHab')}</h4><select id="bosco"><option value="">${t('tutti')}</option><option value="*">${t('solo')}</option>${opts.map(c => `<option value="${c}">${esc(nb(c))}</option>`).join('')}</select>`
    + `<h4>${t('gBos')}</h4>` + riga_lv('bv', t('bvs'), t('dBv')) + riga_lv('am', t('ams'), t('dAm')) + riga_lv('cf', t('cf'), t('dCf'))
    + `<div class="cft">${mac.map(m => `<button data-m="${m}" class="${ON.cf && (!cfSel || cfSel.has(m)) ? 'on' : ''}"><i style="background:${CFC[m]}"></i>${esc(CFN.macro[m])}</button>`).join('')}<button class="tutti" data-m="*">${t('tuttiTipi')}</button><button class="tutti" data-m="-">${t('nessunTipo')}</button></div>`
    + riga_lv('bs', t('bss'), t('dBs')) + COPY();
  $('bosco').value = bosco;
  $('bosco').onchange = e => { bosco = e.target.value; applica(); };
}
const altLiv = altezze($('liv'), '.grip, .lvh h3', () => chiudiLiv());
$('liv').addEventListener('click', e => { if (e.target.closest('.lvh .close')) return chiudiLiv(); if (e.target.closest('.lvh .espandi')) return altLiv($('liv').classList.contains('big') ? 1 : 2); });
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
$('btn-liv').onclick = () => { const o = !$('liv').classList.contains('open'); $('liv').classList.toggle('open', o); document.body.classList.toggle('livon', o); if (!o) $('liv').classList.remove('big', 'mini'); $('btn-liv').setAttribute('aria-expanded', o); if (o) { $('res').style.display = 'none'; pannello(); } };
const chiudiLiv = () => { document.body.classList.remove('livon'); $('liv').classList.remove('open', 'big', 'mini'); $('btn-liv').setAttribute('aria-expanded', false); };

/* ---------- testi */
const nb = c => LANG === 'it' ? (H.boschi[c] || [c])[0] : (BOSCO_EN[c] || c);
function testi() {
  document.documentElement.lang = LANG;
  $('l-it').classList.toggle('on', LANG === 'it'); $('l-en').classList.toggle('on', LANG === 'en');
  $('q').placeholder = t('cerca');
  $('liv-t').textContent = t('livelli');
  if ($('oggi')) $('oggi').innerHTML = ico('sparkles') + T('Cosa vedere oggi qui', 'What to see here today');
  for (const b of document.querySelectorAll('#sez button')) { b.querySelector('span').textContent = t({ mappa: 'vMappa', specie: 'vSpecie', escursioni: 'vEsc', meteo: 'vMeteo', registra: 'vReg' }[b.dataset.v]); if (!b.querySelector('svg')) b.insertAdjacentHTML('afterbegin', ico(b.dataset.ic)); }
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
  if (PIAN) return pianClick(e);
  if (ON.osm && map.getLayer('osm-r')) {
    const pad = 7, bx = [[e.point.x - pad, e.point.y - pad], [e.point.x + pad, e.point.y + pad]];
    const po = map.queryRenderedFeatures(bx, { layers: ['osm-p'] });
    if (po.length) { const q = po[0].properties; new maplibregl.Popup({ offset: 12 }).setLngLat(po[0].geometry.coordinates).setHTML(`<div class="wpp"><b>${esc(q.n || T(...POIN[q.t]))}</b><small>${esc(T(...POIN[q.t]))}${q.e ? ' · ' + fmt(q.e) + ' m' : ''}</small>${gmapsLink(po[0].geometry.coordinates)}</div>`).addTo(map); return; }
    const pr = map.queryRenderedFeatures(bx, { layers: ['osm-r', ...(map.getLayer('prv') && vista === 'escursioni' ? ['prv'] : [])] });
    if (pr.length) { apriPercorso(pr[0].properties.id); return; }
  }
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
function chiudiPercorso() { evidenziaPercorso(null); }
function mostra() { $('sheet').classList.remove('mini'); $('sheet').classList.add('open'); document.body.classList.add('side'); $('sb').scrollTop = 0; tastoEspandi(); }
function tastoEspandi() {
  const c = $('sh').querySelector('.close'); if (!c || $('sh').querySelector('.espandi')) return;
  const big = $('sheet').classList.contains('big');
  c.insertAdjacentHTML('beforebegin', `<button class="espandi" aria-label="${big ? T('Riduci', 'Reduce') : T('Tutto schermo', 'Full screen')}">${ico(big ? 'arrows-minimize' : 'arrows-maximize')}</button>`);
}
$('sh').addEventListener('click', e => { if (!e.target.closest('.espandi')) return; altSheet($('sheet').classList.contains('big') ? 1 : 2); });
function chiudi() { evidenziaPercorso(null); if (!PIAN && map.getSource('pian')) disegnaIt([], []); $('sheet').classList.remove('open', 'big', 'mini'); document.body.classList.remove('side'); cur = null; selez(''); try { history.replaceState(null, '', location.pathname); } catch (e) {} }
// schede e pannelli sul telefono: si trascinano dalla maniglia (o dal titolo) per abbassarli, nasconderli o allargarli
function altezze(el, maniglia, chiudiDelTutto) {
  const stato = () => el.classList.contains('big') ? 2 : el.classList.contains('mini') ? 0 : 1;
  const metti = n => {
    if (n < 0) { el.classList.remove('mini', 'big'); if (chiudiDelTutto) return chiudiDelTutto(); n = 0; }
    el.classList.toggle('mini', n === 0); el.classList.toggle('big', n === 2);
    const b = el.querySelector('.espandi'); if (b) b.innerHTML = ico(n === 2 ? 'arrows-minimize' : 'arrows-maximize');
  };
  let y0 = null, dy = 0;
  el.addEventListener('touchstart', e => { if (innerWidth >= 900 || !e.target.closest(maniglia)) return; y0 = e.touches[0].clientY; dy = 0; el.style.transition = 'none'; }, { passive: true });
  el.addEventListener('touchmove', e => { if (y0 == null) return; dy = e.touches[0].clientY - y0; el.style.transform = `translateY(${Math.max(-40, dy)}px)`; }, { passive: true });
  el.addEventListener('touchend', () => { if (y0 == null) return; y0 = null; el.style.transform = ''; el.style.transition = '';
    if (dy > 60) metti(stato() - 1); else if (dy < -60) metti(Math.min(2, stato() + 1)); });
  el.addEventListener('click', e => { if (e.target.closest('.grip')) metti(stato() === 1 ? 0 : 1); });
  return metti;
}
const altSheet = altezze($('sheet'), '.grip, #sh', () => chiudi());
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
// porta un riquadro nello spazio di mappa libero tra la testata e la scheda (o accanto, su PC)
function inquadra(bb, maxZoom) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const m = map.getContainer().getBoundingClientRect(), sh = $('sheet').classList.contains('open') ? $('sheet').getBoundingClientRect() : null, big = innerWidth >= 900;
    const top = vista === 'mappa' && !big ? 76 : 24;
    const pad = big ? { top: 40, bottom: 40, left: sh ? Math.round(sh.right - m.left) + 30 : 40, right: vista === 'mappa' ? 60 : 430 }
                    : { top, bottom: sh ? Math.max(40, Math.round(m.bottom - sh.top) + 16) : 40, left: 24, right: 64 };
    map.fitBounds([[bb[0], bb[1]], [bb[2], bb[3]]], { padding: pad, maxZoom, duration: 750 });
  }));
}
function apri(k, vola) {
  if (k.startsWith('CF:')) return apriCF(k.slice(3));
  const s = S[k]; if (!s) return; cur = k;
  selez(k);
  try { history.replaceState(null, '', '#' + k); } catch (e) {}
  const lato = innerWidth >= 900;
  if (vola) inquadra(s.bb, s.t === 'am' ? 12 : 13);
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
  let h = `<div class="cta trovaprc"><button data-trovaprc="${k}">${ico('route')}${T('Trova un percorso qui', 'Find a trail here')}</button></div>` + racconto(k) + regole(s) + `<div class="stats"><div><b>${fmt(s.ha)} ha</b><span>${t('sup')}</span></div><div><b>${s.bha ? fmt(s.bha) + ' ha' : '–'}</b><span>${t('boschi')}</span></div><div><b>${s.anno || sp.length || '–'}</b><span>${s.anno ? t('istit') : t('specie')}</span></div></div>`;
  h += `<h3>${t('boschi')}</h3>`;
  if (s.b.length) {
    h += `<p class="note">${area ? t('nba') : t('nb')}</p>` + s.b.map(([c, ha]) => `<div class="bar"><span class="t">${esc(nb(c))}<small>${c} · ${esc(LANG === 'it' ? H.boschi[c][1] : H.hab[c])}</small></span><span class="v">${ha ? fmt(ha) + ' ha' : '< 1 ha'}</span><span class="tr"><i style="width:${Math.max(2, ha / max * 100)}%"></i></span></div>`).join('');
  } else h += `<p class="note">${area && !(s.n2k || []).length ? t('nodati') : t('nobosco')}</p>`;
  if (hab.length) h += `<details><summary>${t('hab')}<em>${hab.length}</em></summary><div class="hab">${hab.map(x => `<div><code>${x.c}${x.p ? '*' : ''}</code><span>${esc(H.boschi[x.c] && LANG === 'it' ? H.boschi[x.c][1] : H.hab[x.c] || x.c)}</span><span>${x.ha ? fmt(x.ha) + ' ha' : ''}</span></div>`).join('')}</div></details>`;
  if (sp.length) {
    h += `<div class="wpr"><h3>${t('specie')} · ${fmt(sp.length)}</h3><button class="lnk" data-elsp="${k}">${ico('download', 'sm')} CSV</button></div><p class="note">${area ? t('nspa') : t('nsp')}</p>`;
    h += Object.keys(TX.it.G).filter(g => byG[g]).map(g => `<details><summary>${t('G')[g]}<em>${byG[g].length}</em></summary><div class="list">${byG[g].sort().map(n => g === 'P' ? `<button class="spn" data-spn="${esc(n)}"><i>${esc(n)}</i><span>›</span></button>` : `<div><i>${esc(n)}</i></div>`).join('')}</div></details>`).join('');
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
const cs = { funghi: { q: '', g: '', n: 60 }, piante: { q: '', g: '', n: 60, fam: '' } };
const BASEF = 'https://cangelosky.github.io/Inzenga/impara/libri/foto/';
const ICOC = { funghi: '<svg viewBox="0 0 24 24"><path d="M12 3C6.5 3 2.5 6.6 2.5 10.5c0 .8.6 1.3 1.4 1.3h16.2c.8 0 1.4-.5 1.4-1.3C21.5 6.6 17.5 3 12 3Zm-2.3 10.3-.6 5.9A1.7 1.7 0 0 0 10.8 21h2.4a1.7 1.7 0 0 0 1.7-1.8l-.6-5.9h-4.6Z"/></svg>',
  piante: '<svg viewBox="0 0 24 24"><path d="M20 3.5C11.5 3.5 6 7.6 6 14c0 1.4.3 2.7.8 3.8L4.3 20.3l1.4 1.4 2.4-2.4c1.2.7 2.6 1.2 4.1 1.2 6.2 0 8.3-6.9 7.8-17Z"/></svg>' };
const isApp = !!(window.Capacitor && (!window.Capacitor.isNativePlatform || window.Capacitor.isNativePlatform()));
// plugin del telefono: da Capacitor 3 non sempre compaiono in Capacitor.Plugins, vanno registrati per nome
const plug = n => { if (!isApp) return null; const C = window.Capacitor; try { return (C.Plugins && C.Plugins[n]) || (C.registerPlugin ? (C.Plugins[n] = C.registerPlugin(n)) : null); } catch (e) { return null; } };
const modo = { escursioni: 'mappa', meteo: 'mappa', registra: 'mappa' };
const mappaVista = v => (v === 'escursioni' || v === 'meteo' || v === 'registra') && modo[v] === 'mappa';
let ultimaSpecie = 'funghi';
if (isApp) document.body.classList.add('app');
function vai(v) {
  vista = v; document.body.classList.remove('escreg'); document.body.classList.remove('vm-esc', 'vm-met'); document.body.classList.add(v === 'escursioni' ? 'vm-esc' : v === 'meteo' ? 'vm-met' : 'vm-x');
  if (v === 'specie') return vai(ultimaSpecie);
  if (v !== 'escursioni') prcSel.zona = '';
  if (v === 'funghi' || v === 'piante') ultimaSpecie = v;
  for (const b of document.querySelectorAll('#sez button')) b.classList.toggle('on', b.dataset.v === v || (b.dataset.v === 'specie' && (v === 'funghi' || v === 'piante')));
  const mm = mappaVista(v), lista = v !== 'mappa' && !mm;
  $('cat').classList.toggle('on', lista); document.body.classList.toggle('cat-on', lista); document.body.classList.toggle('mm', mm);
  $('pan').classList.toggle('on', mm); if (!mm) $('pan').innerHTML = '';
  chiudiLiv(); $('res').style.display = 'none'; chiudi(); vediPanoramica();
  evidenzia(null);
  $('cat').dataset.v = ''; $('cat').innerHTML = '';
  if (v === 'mappa' || mm) { map.resize(); if (!REG) map.fitBounds([[12.3, 36.55], [15.7, 38.35]], { padding: innerWidth >= 900 ? { top: 30, bottom: 30, left: 30, right: mm ? 430 : 30 } : { top: 20, bottom: mm ? Math.round(innerHeight * 0.42) : 20, left: 10, right: 10 }, duration: 600 }); }
  if (v === 'meteo') meteo(); else if (v === 'escursioni') escursioni(); else if (v === 'registra') registra(); else if (v !== 'mappa') catalogo();
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
  for (const l of [...Object.keys(base), ...Object.values(LIV).flat()]) if (map.getLayer(l) && !(on && sentInEsc(l))) map.setLayoutProperty(l, 'visibility', on ? 'none' : (l in base ? ((l.startsWith('aree') ? ON.aree : ON.n2k) ? 'visible' : 'none') : 'visible'));
  if (!on) { map.getSource('hl').setData({ type: 'FeatureCollection', features: [] }); map.getSource('hlp').setData({ type: 'FeatureCollection', features: [] }); applica(); return; }
  const byId = {}; for (const f of GJ.features) byId[f.properties.id] = f;
  map.getSource('hl').setData({ type: 'FeatureCollection', features: items.filter(x => byId[x.k]).map(x => ({ type: 'Feature', properties: { id: x.k, v: x.v }, geometry: byId[x.k].geometry })) });
  map.getSource('hlp').setData({ type: 'FeatureCollection', features: items.map(x => ({ type: 'Feature', properties: Object.assign({ id: x.k, v: x.v, lab: x.lab, vs: x.vs || '' }, x.wx ? { wx: x.wx } : {}), geometry: { type: 'Point', coordinates: centro(S[x.k]) } })) });
}
$('sez').onclick = e => { const b = e.target.closest('button'); if (b) vai(b.dataset.v); };
$('cat').addEventListener('click', e => { const b = e.target.closest('[data-specie]'); if (!b) return; if (b.dataset.specie === 'cal') return calendario(); if (b.dataset.specie !== vista || $('cat').dataset.v === 'cal') { $('cat').dataset.v = ''; vai(b.dataset.specie); } });
// tipi di pianta per i filtri di Botanica
const FELCI = new Set(['Aspleniaceae','Polypodiaceae','Pteridaceae','Dryopteridaceae','Athyriaceae','Dennstaedtiaceae','Ophioglossaceae','Osmundaceae','Woodsiaceae','Cystopteridaceae','Blechnaceae','Thelypteridaceae','Equisetaceae','Selaginellaceae','Isoetaceae','Marsileaceae','Salviniaceae','Lycopodiaceae','Hymenophyllaceae','Sinopteridaceae','Aspidiaceae']);
const TIPI_P = [['alb', 'Alberi e arbusti', 'Trees and shrubs'], ['ali', 'Alimurgiche', 'Wild food plants'], ['orc', 'Orchidee', 'Orchids'], ['fel', 'Felci', 'Ferns'], ['gra', 'Graminacee', 'Grasses'], ['erb', 'Altre erbacee', 'Other herbs']];
const tipoP = r => r[1] ? 'alb' : r[7] ? 'ali' : r[5] === 'Orchidaceae' ? 'orc' : FELCI.has(r[5]) ? 'fel' : r[5] === 'Poaceae' ? 'gra' : 'erb';
/* simbolo e colore per tipo: funghi e tipi di piante */
const TIPO_IC = { fun: ['mushroom', '#8a5a2b'], alb: ['tree', '#2b8a3e'], ali: ['plant-2', '#5c940d'], orc: ['flower', '#c2255c'], fel: ['feather', '#0b7285'], gra: ['grain', '#c77700'], erb: ['leaf', '#6741d9'] };
const tipoSp = (tp, i) => tp === 'funghi' ? 'fun' : (PIA.s[i] ? tipoP(PIA.s[i]) : 'erb');
const icoT = (k, cl) => { const [n, c] = TIPO_IC[k] || TIPO_IC.erb; return `<span class="tpi ${cl || ''}" style="color:${c}">${ico(n, 'xs')}</span>`; };
const icoSp = (tp, i) => icoT(tipoSp(tp, i));
function elencoCat() {
  const st = cs[vista], w = norm(st.q.trim()).split(/\s+/).filter(Boolean);
  if (vista === 'funghi') return FUN.s.map((r, i) => i).filter(i => { const r = FUN.s[i];
    if (st.g === '*f' && !r[8].length) return false; if (st.g && st.g !== '*f' && r[4] !== st.g) return false;
    const n = norm(r[0] + ' ' + r[2] + ' ' + r[3] + ' ' + (NOMI[r[7]] || []).join(' ')); return w.every(x => n.includes(x)); });
  return PIA.s.map((r, i) => i).filter(i => { const r = PIA.s[i];
    if (st.g === 'alb' && !r[1]) return false; if (st.g === 'ali' && !r[7]) return false; if (['orc', 'fel', 'gra', 'erb'].includes(st.g) && tipoP(r) !== st.g) return false; if (st.g === 'n2k' && !r[2].length) return false;
    if (st.fam && r[5] !== st.fam) return false;
    const n = norm(r[0] + ' ' + (r[5] || '') + ' ' + (NOMI[r[4]] || []).join(' ')); return w.every(x => n.includes(x)); });
}
function catalogo(soloTesti) {
  Promise.all([CAT, caricaStag()]).then(([, S2]) => {
    if (vista !== 'funghi' && vista !== 'piante') return;
    const f = vista === 'funghi', st = cs[vista], mo = new Date().getMonth();
    const stg = i => stagione(vista, i, mo, S2), ord = i => { const o = stg(i).on; return o === true ? 0 : o === null ? 1 : 2; };
    const ids = elencoCat().map((i, n) => [i, n]).sort((a, b) => ord(a[0]) - ord(b[0]) || a[1] - b[1]).map(x => x[0]);
    const gruppi = f ? [['', t('tutte'), FUN.s.length], ['*f', t('conFoto'), FUN.s.filter(r => r[8].length).length], ...FUN.g.map(g => [g, t('GF')[g], FUN.s.filter(r => r[4] === g).length])]
                     : [['', t('tutte'), PIA.s.length], ...TIPI_P.map(([k, it, en]) => [k, T(it, en), PIA.s.filter(r => tipoP(r) === k || (k === 'alb' && r[1]) || (k === 'ali' && r[7])).length]), ['n2k', t('inN2k'), PIA.s.filter(r => r[2].length).length]];
    const card = i => { const r = (f ? FUN : PIA).s[i];
      const sub = f ? `${esc(r[2])} · ${t('segn')(r[5])}` : [r[5] ? esc(r[5]) : '', r[2].length ? t('nsiti')(r[2].length) : '', r[3].filter(k => S[k] && S[k].t === 'am').length ? t('va')(r[3].filter(k => S[k] && S[k].t === 'am').length) : '', !r[2].length && r[6] ? t('segn')(r[6]) : ''].filter(Boolean).join(' · ');
      const ph = f && r[8].length ? ` style="background-image:url('${BASEF + r[8][0]}')"` : '';
      return `<button class="card" data-sp="${i}"><span class="ph" data-n="${esc(r[0])}"${ph}${ph ? '' : ` style="color:${TIPO_IC[f ? 'fun' : tipoP(r)][1]}"`}>${ph ? '' : ico(TIPO_IC[f ? 'fun' : tipoP(r)][0], 'phi')}</span><span class="tx">${(c => c ? `<b class="nc">${esc(c)}</b>` : '')(nomeC(vista, i))}<i>${esc(r[0])}</i><small>${sub}</small>${(z => z.on === true ? `<span class="tag st">${esc(z.lab)}</span>` : '')(stg(i))}${f ? `<span class="tag">${esc(t('GF')[r[4]])}</span>` : r[1] ? `<span class="tag">${t('alberi')}</span>` : ''}</span></button>`; };
    const griglia = ids.slice(0, st.n).map(card).join('') + '';
    if (soloTesti || !$('cat').querySelector('.in') || $('cat').dataset.v !== vista) {
      $('cat').dataset.v = vista; $('cat').scrollTop = 0;
      $('cat').innerHTML = `<div class="in"><div class="switch spsw" role="tablist">${['funghi', 'piante', 'cal'].map(x => `<button role="tab" data-specie="${x}" class="${vista === x ? 'on' : ''}" aria-selected="${vista === x}">${x === 'funghi' ? T('Funghi', 'Fungi') : x === 'piante' ? T('Piante', 'Plants') : T('Calendario', 'Calendar')}</button>`).join('')}</div><h2>${f ? t('tFunghi') : t('tPiante')}</h2><p class="lead">${f ? t('lFunghi')(FUN.s.length) : t('lPiante')(PIA.s.length)}</p>${f ? REGOLE_FUNGHI() : ''}
        <div class="cerca"><input id="cq" type="search" placeholder="${t('cercaSp')}" value="${esc(st.q)}" autocomplete="off"></div>
        <div class="grp" id="cg"></div>${f ? '' : `<select class="tendina" id="cf"><option value="">${t('tutteFam')}</option>${[...new Set(PIA.s.map(r => r[5]).filter(Boolean))].sort().map(x => `<option${st.fam === x ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select>`}<p class="cnt" id="cn"></p><div class="griglia" id="gr"></div><button class="altri" id="ca"></button>${COPY()}</div>`;
      $('cq').oninput = e => { cs[vista].q = e.target.value; cs[vista].n = 60; catalogo(); };
      if ($('cf')) $('cf').onchange = e => { cs.piante.fam = e.target.value; cs.piante.n = 60; catalogo(); };
    }
    $('cg').innerHTML = gruppi.map(([k, n, c]) => `<button data-g="${k}" class="${st.g === k ? 'on' : ''}">${!f && TIPO_IC[k] ? icoT(k) : ''}${esc(n)}<em>${fmt(c)}</em></button>`).join('');
    const nOn = ids.filter(i => stg(i).on === true).length;
    if ($('alimav')) $('alimav').remove();
    if (!f && st.g === 'ali') $('cn').insertAdjacentHTML('beforebegin', `<p class="avviso" id="alimav">${t('alimNota')}</p>`);
    $('cn').textContent = t('nSp')(ids.length) + (nOn ? ' · ' + T(`${fmt(nOn)} in stagione a ${nomeMese(mo)}, mostrate per prime`, `${fmt(nOn)} in season in ${nomeMese(mo)}, shown first`) : '');
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

let daZona = null;
// nome di una pianta (anche dei formulari, con sottospecie scritta senza "subsp.") -> indice nel catalogo
function trovaPianta(n) {
  const b = x => norm(x).replace(/ (subsp|var|ssp)\.? /g, ' ').split(/\s+/).slice(0, 2).join(' ');
  let i = PIA.s.findIndex(r => r[0] === n); if (i >= 0) return i;
  const k = b(n); return PIA.s.findIndex(r => b(r[0]) === k);
}
function apriSpecie(tipo, i) {
  const f = tipo === 'funghi', r = (f ? FUN : PIA).s[i], it = LANG === 'it';
  cur = 'SP:' + tipo + ':' + i; selez('');
  const badge = f ? `<span class="badge">${esc(t('GF')[r[4]])}</span><span class="badge n2k">${esc(r[2])}</span>` : (r[1] ? `<span class="badge">${t('alberi')}</span>` : '');
  const da = daZona && S[daZona] ? `<button class="indietro" data-id="${daZona}">‹ ${t('torna')} ${esc(S[daZona].n)}</button>` : ''; daZona = null;
  const nc = nomeC(tipo, i), ns = nomeScn(tipo, i);
  $('sh').innerHTML = `<div>${da}${nc ? `<h2>${esc(nc)}</h2><p class="sci"><i>${esc(r[0])}</i>${ns ? ` · ${T('in siciliano', 'in Sicilian')} <b>${esc(ns)}</b>` : ''}</p>` : ''}<h2${nc ? ' hidden' : ''}><i>${esc(r[0])}</i>${f ? ` <small style="font-weight:400;color:var(--mute);font-size:14px">${esc(r[1])}</small>` : ''}</h2>${badge}</div><button class="close" aria-label="Chiudi">×</button>`;
  let h = '<div class="racconto">';
  if (f) {
    h += it ? `<p><i>${esc(r[0])}</i> è un fungo della famiglia ${esc(r[2])} (ordine ${esc(r[3])}), nel gruppo «${esc(t('GF')[r[4]].toLowerCase())}».</p><p>Nel database mondiale della biodiversità GBIF ha ${fmt(r[5])} segnalazioni in Sicilia${r[6] > r[5] ? `, su ${fmt(r[6])} nell’Italia meridionale considerata da Micelio` : ''}.</p>`
            : `<p><i>${esc(r[0])}</i> is a fungus of the family ${esc(r[2])} (order ${esc(r[3])}), in the group “${esc(t('GF')[r[4]].toLowerCase())}”.</p><p>The GBIF global biodiversity database holds ${fmt(r[5])} records of it in Sicily${r[6] > r[5] ? `, out of ${fmt(r[6])} in the southern Italy covered by Micelio` : ''}.</p>`;
  } else {
    const am = r[3].filter(k => S[k] && S[k].t === 'am'), bs = r[3].filter(k => S[k] && S[k].t === 'bs');
    if (r[5]) h += it ? `<p><i>${esc(r[0])}</i> è una pianta della famiglia ${esc(r[5])}${r[6] ? `, con ${fmt(r[6])} segnalazioni in Sicilia nel database mondiale della biodiversità GBIF` : ''}.</p>`
                      : `<p><i>${esc(r[0])}</i> is a plant of the family ${esc(r[5])}${r[6] ? `, with ${fmt(r[6])} records in Sicily in the GBIF global biodiversity database` : ''}.</p>`;
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
  if (f) h += REGOLE_FUNGHI();
  if (!f && (r[2].length || r[3].length)) h += `<h3>${t('dove')}</h3><div class="links">${r[3].concat(r[2]).filter(k => S[k]).slice(0, 40).map(k => `<button data-id="${k}">${esc(S[k].n)}<br><small>${t(S[k].t)}${S[k].ha ? ' · ' + fmt(S[k].ha) + ' ha' : S[k].com ? ' · ' + esc(S[k].com) : ''}</small></button>`).join('')}</div>`;
  h += `<p class="src">${t('fonte')}: ${f ? `<a href="https://cangelosky.github.io/Inzenga/" target="_blank" rel="noopener">Micelio · Inzenga</a> · <a href="https://www.gbif.org/species/${r[7]}" target="_blank" rel="noopener">${t('gbif')}</a>` : `${t('sdf')} · ${t('elenco')}${r[4] ? ` · <a href="https://www.gbif.org/species/${r[4]}" target="_blank" rel="noopener">${t('gbif')}</a>` : ''}`}</p>`;
  $('sb').innerHTML = h; mostra(); stripStagione(tipo, i);
  verificata(tipo, r[0], cur);
  $('btnmap').onclick = () => mostraGbif(r[0], f ? r[7] : (r[4] || null), !f && sensibile('piante', i));
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
/* ---------- punti di interesse: icone (stesse della registrazione) */
const POI = { rifugio: 'home', riparo: 'tent', picnic: 'tools-kitchen-2', panorama: 'binoculars', campeggio: 'tent', fontana: 'fountain', sorgente: 'droplet', vetta: 'mountain', grotta: 'building-arch', cascata: 'stairs-down', castello: 'building-castle', chiesa: 'building-church', torre: 'tower', rovine: 'columns', segnaletica: 'direction-sign', pannello: 'direction-sign' };
const POIC = { rifugio: '#c2570c', riparo: '#c2570c', picnic: '#2b8a3e', campeggio: '#2b8a3e', segnaletica: '#8d7a3a', pannello: '#8d7a3a', panorama: '#e8590c', fontana: '#1c7ed6', sorgente: '#1c7ed6', cascata: '#0b7285', vetta: '#495057', grotta: '#6b4226', castello: '#7048e8', chiesa: '#7048e8', torre: '#7048e8', rovine: '#7048e8' };
const POIN = { rifugio: ['Rifugio', 'Hut'], riparo: ['Riparo', 'Shelter'], picnic: ['Area picnic', 'Picnic area'], panorama: ['Panorama', 'Viewpoint'], campeggio: ['Campeggio', 'Campsite'], fontana: ['Fontana', 'Fountain'], sorgente: ['Sorgente', 'Spring'], vetta: ['Vetta', 'Summit'], grotta: ['Grotta', 'Cave'], cascata: ['Cascata', 'Waterfall'], castello: ['Castello', 'Castle'], chiesa: ['Chiesa, monastero', 'Church, monastery'], torre: ['Torre', 'Tower'], rovine: ['Rovine, sito archeologico', 'Ruins, archaeological site'], segnaletica: ['Segnaletica', 'Signpost'], pannello: ['Pannello informativo', 'Information board'] };
// foto e recensioni dei punti di interesse: si aprono in Google Maps (nessun dato di Google dentro l'app)
const gmapsLink = (c, cl) => `<a class="gml ${cl || ''}" href="https://www.google.com/maps/search/?api=1&query=${(+c[1]).toFixed(5)},${(+c[0]).toFixed(5)}" target="_blank" rel="noopener">${ico('map-pin', 'xs')} ${T('Apri in Google Maps', 'Open in Google Maps')}</a>`;
function iconePoi() {
  for (const [k, i] of Object.entries(POI)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="${POIC[k]}" stroke="#fff" stroke-width="5"/><g transform="translate(17 17) scale(1.25)" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ICO[i]}</g></svg>`;
    const im = new Image(64, 64); im.onload = () => { if (!map.hasImage('poi-' + k)) map.addImage('poi-' + k, im, { pixelRatio: 2 }); }; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
}
/* ---------- percorsi segnati (OpenStreetMap): elenco per area e scheda */
let PRC = null;
const caricaPercorsi = () => PRC || (PRC = fetch('data/percorsi.json').then(r => r.json()));
const areaPt = (lon, lat) => ((lat > 38.33 && lon > 14.2) || lon < 12.2 || lat < 36.2 || lat > 38.6 || (lon < 12.45 && lat < 38.1 && lat > 37.85)) ? 'iso' : Object.keys(AC).reduce((a, b) => ((AC[a][0] - lon) ** 2 * 0.62 + (AC[a][1] - lat) ** 2) <= ((AC[b][0] - lon) ** 2 * 0.62 + (AC[b][1] - lat) ** 2) ? a : b);
const CAI = { T: ['Turistico', 'Easy'], E: ['Escursionistico', 'Hiking'], EE: ['Per escursionisti esperti', 'Expert hikers'], EEA: ['Esperti con attrezzatura', 'Experts with gear'] };
const durata = d => { const m = /^(\d+):(\d+)/.exec(d || ''); return m ? `${+m[1]} h ${m[2] !== '00' ? m[2] : ''}`.trim() : (d || ''); };
/* sentieri ufficiali: Sentiero Italia CAI, sezioni CAI, parchi ed enti pubblici (dai dati OpenStreetMap: sigla e gestore) */
const uff = p => /^SI\b/i.test(p.r || '') || /^sentiero italia\b/i.test(p.n || '') ? 'si' : /\bc\.?a\.?i\.?\b|club alpino/i.test(p.op || '') ? 'cai' : /parco|riserva|foreste|dipartimento|demanio|comune|regione|ente /i.test(p.op || '') ? 'ente' : '';
const UFF = { si: ['Sentiero Italia CAI', 'Sentiero Italia CAI'], cai: ['Sentiero CAI', 'CAI trail'], ente: ['Ente gestore', 'Official body'] };
const uffTag = p => { const u = uff(p); return u ? `<span class="uff">${ico('shield-check', 'xs')}${T(...UFF[u])}</span>` : ''; };
const pctTag = p => [uffTag(p), `${num1(p.km)} km`, p.up ? `+${fmt(p.up)} m` : '', p.dur ? durata(p.dur) : '', p.c ? `<span class="cai c-${p.c}">${p.c}</span>` : ''].filter(Boolean).join(' · ');
function evidenziaPercorso(p) {
  if (!map.getSource('prc')) return;
  map.getSource('prc').setData({ type: 'FeatureCollection', features: p ? [{ type: 'Feature', properties: {}, geometry: { type: 'MultiLineString', coordinates: p.g } }] : [] });
}
async function apriPercorso(id) {
  const A = await caricaPercorsi(), p = A.find(x => x.id === +id); if (!p) return;
  if (vista !== 'mappa' && vista !== 'escursioni') vai('escursioni');
  if (modo.escursioni !== 'mappa' && vista === 'escursioni') { modo.escursioni = 'mappa'; vai('escursioni'); }
  evidenziaPercorso(p); cur = null;
  map.fitBounds([[p.bb[0], p.bb[1]], [p.bb[2], p.bb[3]]], { padding: padMappa(), duration: 800, maxZoom: 15 });
  const it = LANG === 'it', c = CAI[p.c];
  $('sh').innerHTML = `<div><h2>${esc(p.n)}</h2><div class="badges"><span class="badge" style="background:#e7edf9;color:#1d4ed8">${T('Percorso segnato', 'Marked trail')}${p.r ? ' ' + esc(p.r) : ''}</span>${c ? `<span class="badge cai c-${p.c}">${p.c} · ${T(...c)}</span>` : ''}${uff(p) ? `<span class="badge uffb">${ico('shield-check', 'xs')} ${T(...UFF[uff(p)])}</span>` : ''}</div><div class="avv" id="pc-avv"></div></div><button class="close" aria-label="${t('chiudi')}">×</button>`;
  $('sb').innerHTML = `<div class="kpi"><div><b>${num1(p.km)}</b><span>km</span></div><div><b id="pc-up">${p.up ? '+' + fmt(p.up) : '…'}</b><span>m D+</span></div><div><b id="pc-dn">${p.dn ? '−' + fmt(p.dn) : '…'}</b><span>m D−</span></div><div><b>${p.dur ? durata(p.dur) : '–'}</b><span>${T('tempo', 'time')}</span></div></div>
    <div class="profilo" id="pc-prof"><small>${T('Profilo altimetrico…', 'Elevation profile…')}</small></div>
    ${p.da || p.a ? `<p>${it ? 'Da' : 'From'} <b>${esc(p.da || '–')}</b> ${it ? 'a' : 'to'} <b>${esc(p.a || '–')}</b>${p.giro ? (it ? ' (ad anello)' : ' (loop)') : ''}.</p>` : ''}
    ${p.desc ? `<p>${esc(p.desc)}</p>` : ''}
    <h3>${T('Meteo alla partenza', 'Weather at the start')}</h3><div class="pcmeteo" id="pc-met"><small class="note">${t('carico')}</small></div>
    <div id="pc-zona"></div>
    <h3>${T('Cosa puoi trovare', 'What you may find')}</h3><div id="pc-trova"><small class="note">${t('carico')}</small></div>
    <div id="pc-poi"></div>
    ${p.op ? `<p class="note">${T('Gestione', 'Managed by')}: ${esc(p.op)}</p>` : ''}
    <div class="az"><a class="btnl" href="https://www.google.com/maps/dir/?api=1&destination=${p.s[1]},${p.s[0]}" target="_blank" rel="noopener">${T('Portami alla partenza', 'Directions to start')}</a><button class="btnl" id="pc-gpx">GPX</button>${isApp ? `<button class="btnl" data-offprc="${p.id}">${ico('download')} ${T('Offline', 'Offline')}</button>` : ''}</div>
    <p class="note">${T('Tracciato e dati: OpenStreetMap (ODbL), volontari e sezioni CAI. Controlla sempre segnaletica, meteo e condizioni del sentiero.', 'Track and data: OpenStreetMap (ODbL), volunteers and CAI sections. Always check signs, weather and trail conditions.')} <a href="https://www.openstreetmap.org/relation/${p.id}" target="_blank" rel="noopener">OSM</a></p>
    ${isApp ? `<div class="cta"><button id="pc-segui">${ico('navigation')}${T('Segui il percorso', 'Follow this trail')}</button></div>` : ''}`;
  mostra();
  $('pc-gpx').onclick = () => { const g = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Sicilia Naturale" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>${esc(p.n)}</name>${p.g.map(l => `<trkseg>${l.map(q => `<trkpt lat="${q[1]}" lon="${q[0]}"/>`).join('')}</trkseg>`).join('')}</trk></gpx>`; const u = URL.createObjectURL(new Blob([g], { type: 'application/gpx+xml' })), l = document.createElement('a'); l.href = u; l.download = (p.r || 'percorso') + '.gpx'; document.body.appendChild(l); l.click(); l.remove(); };
  profilo(p); vicini(p); meteoPercorso(p); zonaPercorso(p); trovaPercorso(p);
  caricaAllerte().then(A => { if (!A) return; const z = allertaIn(p.s, A.oggi), y = allertaIn(p.s, A.domani); const x = z ? { n: z.n, quando: T('oggi', 'today') } : y ? { n: y.n, quando: T('domani', 'tomorrow') } : null; if (x) { PRCQ[p.id] = Object.assign(PRCQ[p.id] || {}, { allerta: x }); avvisiPercorso(p); } });
  if ($('pc-segui')) $('pc-segui').onclick = () => avviaReg({ id: p.id, n: p.n, g: p.g, prof: (PRCQ[p.id] || {}).prof || null });
  // il percorso intero in primo piano, sopra la scheda
  inquadra(p.bb, 15.5);
}
async function meteoPercorso(p) {
  const m = meseQ(), vicino = quando === 'oggi' || quando === 'we' || m === new Date().getMonth();
  if (!vicino) return climaPercorso(p, m);
  const j = await getJ(URLM(p.s[1].toFixed(3), p.s[0].toFixed(3))), el = $('pc-met'); if (!el) return;
  if (!j || !j.daily) { el.innerHTML = `<small class="note">${T('Meteo non disponibile ora.', 'Weather not available now.')}</small>`; return; }
  const { M, oggi, G } = serieMeteo(j.daily);
  PRCM[p.id] = { M, G };
  const fine = g => { const d = new Date(g.d + 'T12:00').getDay(); return d === 0 || d === 6; };
  const gg = quando === 'we' ? G.filter(fine).slice(0, 2) : G.slice(0, 7);
  avvisiPercorso(p);
  el.innerHTML = gg.map(g => `<div class="r"><b>${g.d === oggi ? t('oggi') : giorno(g.d)}</b><span class="v" style="background:${colore10(g.e.v)}">${num1(g.e.v)}</span>${cella(M, g.i)}</div>`).join('') + `<small class="note">${T('Punteggio escursione da 1 a 10 (pioggia, vento, caldo, freddo).', 'Hiking score 1 to 10 (rain, wind, heat, cold).')}</small>`;
}
function zonaPercorso(p) {
  D.then(() => {
    const ks = zoneDi(p), el = $('pc-zona'); if (!el || !ks.length) return;
    const sug = {}; for (const x of suggerimenti(true)) sug[x.k] = x.why;
    const visti = new Set(), uniche = ks.filter(k => !visti.has(S[k].n) && visti.add(S[k].n));
    el.innerHTML = `<h3>${T('La zona', 'The area')}</h3>` + uniche.slice(0, 2).map(k => `<div class="pczona"><button class="nz" data-id="${k}">${esc(S[k].n)} ›</button><p>${esc(sug[k] && sug[k].length ? sug[k].join(' · ') : sintesi(k))}</p></div>`).join('');
  });
}
// piante e funghi segnalati intorno al percorso (GBIF), collegati alle schede di Micologia e Botanica
async function trovaPercorso(p) {
  const m = 0.01, q = (tk, n) => getJ(`https://api.gbif.org/v1/occurrence/search?decimalLatitude=${(p.bb[1] - m).toFixed(3)},${(p.bb[3] + m).toFixed(3)}&decimalLongitude=${(p.bb[0] - m).toFixed(3)},${(p.bb[2] + m).toFixed(3)}&taxonKey=${tk}&limit=0&facet=speciesKey&facetLimit=${n}`);
  const [jf, jp] = await Promise.all([q(5, 40), q(7707728, 60)]); await CAT;
  const el = $('pc-trova'); if (!el) return;
  const kf = {}; FUN.s.forEach((r, i) => kf[r[7]] = i); const kp = {}; PIA.s.forEach((r, i) => { if (r[4]) kp[r[4]] = i; });
  const pick = (j, idx, max) => ((j && j.facets && j.facets[0] && j.facets[0].counts) || []).map(c => [idx[+c.name], c.count]).filter(x => x[0] != null).slice(0, max);
  const S2 = await caricaStag(), mq = meseQ();
  const lista = (tipo, arr) => arr.map(([i, n]) => ({ tipo, i, n, st: stagione(tipo, i, mq, S2), nome: nomeC(tipo, i) || (tipo === 'funghi' ? FUN.s : PIA.s)[i][0] }));
  const tutte = [...lista('piante', pick(jp, kp, 60)), ...lista('funghi', pick(jf, kf, 40))];
  const grp = v => tutte.filter(x => x.st.on === v);
  const bt = x => `<button data-sp="${x.tipo}:${x.i}" class="${x.st.on === false ? 'fuori' : ''}" title="${fmt(x.n)} ${T('segnalazioni', 'records')}">${icoSp(x.tipo, x.i)}${esc(x.nome)}${x.st.lab ? `<small>${esc(x.st.lab)}</small>` : ''}</button>`;
  const on = grp(true), mai = grp(null), off = grp(false);
  PRCQ[p.id] = Object.assign(PRCQ[p.id] || {}, { funghi: on.filter(x => x.tipo === 'funghi').length, fiori: on.filter(x => x.tipo === 'piante' && !DECID.test(x.nome)).length }); avvisiPercorso(p);
  el.innerHTML = tutte.length ? (on.length ? `<p class="note gr">${T('In stagione', 'In season')} · ${quando === 'oggi' ? T('oggi', 'today') : quando === 'we' ? T('questo fine settimana', 'this weekend') : nomeMese(mq)}</p><div class="trova">${on.slice(0, 18).map(bt).join('')}</div>` : '')
    + (mai.length ? `<p class="note gr">${T('Tutto l’anno o stagione non nota', 'All year or season unknown')}</p><div class="trova">${mai.slice(0, 12).map(bt).join('')}</div>` : '')
    + (off.length ? `<details class="fuoris"><summary>${T('Fuori stagione', 'Out of season')} (${off.length})</summary><div class="trova">${off.map(bt).join('')}</div></details>` : '')
    + `<small class="note">${T('Specie più segnalate intorno al percorso (GBIF). La stagione è stimata dai mesi delle osservazioni in Sicilia.', 'Species most recorded around the trail (GBIF). Season estimated from the months of records in Sicily.')}</small>`
    : `<small class="note">${T('Nessuna segnalazione intorno al percorso.', 'No records around the trail.')}</small>`;
  el.onclick = e => { const b = e.target.closest('[data-sp]'); if (!b) return; const [tp, i] = b.dataset.sp.split(':'); prcTorna = p.id; apriSpecie(tp, +i); };
}
let prcTorna = null;
/* ---------- stagioni: "Quando vai?" cambia meteo, specie in evidenza e avvisi del percorso */
let quando = 'oggi', STG = null;
const PRCM = {}, PRCQ = {};
const nomeMese = m => new Date(2026, m, 1).toLocaleDateString(LANG === 'it' ? 'it-IT' : 'en-GB', { month: 'long' });
const meseQ = () => { const d = new Date(); if (quando === 'oggi') return d.getMonth(); if (quando === 'we') { d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7); return d.getMonth(); } return +quando; };
const caricaStag = () => STG || (STG = fetch('data/stagioni.json').then(r => r.json()).catch(() => ({})));
const DECID = /^(Fagus|Castanea|Acer|Populus|Salix|Alnus|Fraxinus|Ulmus|Betula|Sorbus|Carpinus|Ostrya|Celtis|Corylus|Platanus|Juglans|Tilia|Zelkova|Cotinus|Rhus|Vitis|Crataegus|Prunus|Pyrus|Malus|Cercis|Pistacia terebinthus|Quercus (pubescens|cerris|petraea|robur|virgiliana|frainetto|dalechampii|congesta|amplifolia|gussonei|leptobalanos|trojana|ithaburensis))/;
// { on: true in stagione | false fuori | null sempre o non nota, lab }
function stagione(tipo, i, m, S2) {
  const f = tipo === 'funghi', r = f ? FUN.s[i] : PIA.s[i], k = f ? r[7] : r[4], mk = k && S2[k];
  if (!f && DECID.test(r[0])) return m === 9 || m === 10 ? { on: true, lab: T('foliage autunnale', 'autumn foliage') } : m === 11 || m <= 1 ? { on: false, lab: T('senza foglie', 'leafless') } : { on: null, lab: T('in foglia', 'in leaf') };
  if (!f && r[1]) return { on: null, lab: T('tutto l’anno', 'all year') };
  if (!mk) return { on: null, lab: T('stagione non nota', 'season unknown') };
  if (mk.split('1').length - 1 >= 10) return { on: null, lab: T('tutto l’anno', 'all year') };
  return mk[m] === '1' ? { on: true, lab: f ? T('in fruttificazione', 'fruiting') : T('in fioritura', 'in flower') } : { on: false, lab: T('fuori stagione', 'out of season') };
}
async function stripStagione(tipo, i) {
  const S2 = await caricaStag(), f = tipo === 'funghi', r = f ? FUN.s[i] : PIA.s[i], k = f ? r[7] : r[4], mk = k && S2[k];
  if (!$('sb') || (!mk && !(!f && DECID.test(r[0])))) return;
  const m = meseQ(), st = stagione(tipo, i, m, S2), mesi = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const on = j => !f && DECID.test(r[0]) ? (j === 9 || j === 10) : mk[j] === '1';
  $('sb').insertAdjacentHTML('afterbegin', `<div class="mesi"><div class="mb">${mesi.map(j => `<span class="${on(j) ? 'on' : ''}${j === m ? ' qui' : ''}">${nomeMese(j).slice(0, 1).toUpperCase()}</span>`).join('')}</div><small>${!f && DECID.test(r[0]) ? `<b>${T('Foliage d’autunno', 'Autumn foliage')}</b>` : `${st.on === true ? `<b>${esc(st.lab)}</b> · ` : st.on === false ? esc(st.lab) + ' · ' : ''}${f ? T('mesi in cui si trova in Sicilia', 'months when it is found in Sicily') : T('fioritura stimata dalle osservazioni in Sicilia', 'flowering estimated from records in Sicily')} (GBIF)`}</small></div>`);
}
// clima tipico del mese scelto (2019-2024, ERA5 via Open-Meteo)
async function climaPercorso(p, m) {
  const el = $('pc-met'); if (!el) return;
  const j = await getJ(`https://archive-api.open-meteo.com/v1/archive?latitude=${p.s[1].toFixed(3)}&longitude=${p.s[0].toFixed(3)}&start_date=2019-01-01&end_date=2024-12-31&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,snowfall_sum&timezone=Europe%2FRome`);
  if (!$('pc-met')) return;
  if (!j || !j.daily) { el.innerHTML = `<small class="note">${T('Clima non disponibile ora.', 'Climate not available now.')}</small>`; return; }
  const d = j.daily, ix = d.time.map((x, i) => +x.slice(5, 7) - 1 === m ? i : -1).filter(i => i >= 0), n = ix.length || 1, anni = 6;
  const media = a => ix.reduce((s, i) => s + (a[i] || 0), 0) / n;
  const C = { tx: media(d.temperature_2m_max), tn: media(d.temperature_2m_min), mm: ix.reduce((s, i) => s + (d.precipitation_sum[i] || 0), 0) / anni, gp: ix.filter(i => d.precipitation_sum[i] >= 1).length / anni, neve: ix.filter(i => d.snowfall_sum[i] > 0.5).length / anni };
  PRCM[p.id] = { C };
  el.innerHTML = `<div class="clima"><b>${T('Di solito a', 'Usually in')} ${nomeMese(m)}</b><span>${ico('temperature', 'xs')}${Math.round(C.tn)}–${Math.round(C.tx)}°</span><span>${ico('umbrella', 'xs')}${Math.round(C.gp)} ${T('giorni di pioggia', 'rainy days')} · ${fmt(Math.round(C.mm))} mm</span>${C.neve >= 1 ? `<span>❄ ${Math.round(C.neve)} ${T('giorni di neve', 'snow days')}</span>` : ''}</div><small class="note">${T('Medie 2019-2024 alla partenza (ERA5, Open-Meteo). Le previsioni vere arrivano 14 giorni prima.', '2019-2024 averages at the start (ERA5, Open-Meteo). Real forecasts are available 14 days ahead.')}</small>`;
  avvisiPercorso(p);
}
// avvisi di stagione ricavati dai dati: neve, pioggia, caldo, foliage, funghi, fioriture
function avvisiPercorso(p) {
  const el = $('pc-avv'); if (!el) return;
  const m = meseQ(), a = [], met = PRCM[p.id] || {}, q = PRCQ[p.id] || {}, zone = (typeof GJ !== 'undefined' && GJ) ? zoneDi(p) : [];
  const bosco = c => zone.some(k => (S[k].b || []).some(b => c.includes(b[0])));
  if ((m === 9 || m === 10) && bosco(['9210', '9260', '91AA', '91M0', '9220', '91E0', '92A0'])) a.push(['g', T('Foliage d’autunno', 'Autumn foliage')]);
  if (q.mx >= 1300 && (m === 11 || m <= 2)) a.push(['b', T('Possibile neve sopra i 1.300 m', 'Snow likely above 1,300 m')]);
  if (q.mx && q.mx < 700 && m >= 5 && m <= 7) a.push(['o', T('Caldo: evita le ore centrali', 'Hot: avoid midday')]);
  let pioggia = false;
  if (met.G) { const gg = quando === 'we' ? met.G.filter(g => [0, 6].includes(new Date(g.d + 'T12:00').getDay())).slice(0, 2) : met.G.slice(0, 2); pioggia = gg.some(g => (met.M.precipitation_sum[g.i] || 0) >= 5); }
  if (met.C) pioggia = met.C.gp >= 9;
  if (pioggia && (p.c === 'EE' || p.c === 'EEA' || q.acqua)) a.push(['r', T('Sconsigliato con la pioggia', 'Not advised in rain')]);
  if (q.allerta) a.unshift(['r', T(`Allerta ${LIVN[q.allerta.n][0]} ${q.allerta.quando}`, `${LIVN[q.allerta.n][1]} alert ${q.allerta.quando}`)]);
  if (q.funghi >= 3) a.push(['f', T('Stagione dei funghi', 'Mushroom season')]);
  if (q.fiori >= 5) a.push(['v', T('Fioriture', 'Flowers in bloom')]);
  el.innerHTML = a.map(([c, l]) => `<span class="av av-${c}">${esc(l)}</span>`).join('');
}
// punti di interesse lungo il percorso (entro 250 m dal tracciato)
let PTI = null;
async function vicini(p) {
  PTI = PTI || fetch('data/punti.json').then(r => r.json());
  const P = await PTI, pts = p.g.flat(), m = 0.003, out = [];
  for (const q of P) {
    if (q[0] < p.bb[0] - m || q[0] > p.bb[2] + m || q[1] < p.bb[1] - m || q[1] > p.bb[3] + m) continue;
    let d = 1e9; for (const r of pts) { const x = hav(r, q); if (x < d) d = x; if (d < 60) break; }
    if (d < 250) out.push(q);
  }
  PRCQ[p.id] = Object.assign(PRCQ[p.id] || {}, { acqua: out.some(q => q[2] === 'cascata') }); avvisiPercorso(p);
  const el = $('pc-poi'); if (!el || !out.length) return;
  const ord = Object.keys(POI); out.sort((a, b) => ord.indexOf(a[2]) - ord.indexOf(b[2]));
  el.innerHTML = `<h3>${T('Lungo il percorso', 'Along the trail')}</h3><div class="poil">${out.slice(0, 30).map(q => `<button data-ptll="${q[0]},${q[1]}"><i style="background:${POIC[q[2]]}">${ico(POI[q[2]])}</i><span><b>${esc(q[3] || T(...POIN[q[2]]))}</b><small>${esc(T(...POIN[q[2]]))}${q[4] ? ' · ' + fmt(q[4]) + ' m' : ''}</small></span></button>`).join('')}</div>`;
  el.onclick = e => { const b = e.target.closest('[data-ptll]'); if (!b) return; const ll = b.dataset.ptll.split(',').map(Number); map.easeTo({ center: ll, zoom: 15, duration: 700 }); $('sheet').classList.add('mini'); $('sheet').classList.remove('big'); $('pan').classList.add('mini'); $('pan').classList.remove('big'); };
}
// profilo altimetrico: quote Copernicus 90 m da Open-Meteo su 100 punti del tracciato
async function profilo(p) {
  const pts = p.g.flat(), tot = []; let d = 0;
  for (let i = 0; i < pts.length; i++) { if (i) d += hav(pts[i - 1], pts[i]); tot.push(d); }
  const n = Math.min(100, pts.length), sel = Array.from({ length: n }, (_, i) => { const tgt = d * i / Math.max(1, n - 1); let j = tot.findIndex(x => x >= tgt); return j < 0 ? pts.length - 1 : j; });
  const j = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${sel.map(i => pts[i][1]).join(',')}&longitude=${sel.map(i => pts[i][0]).join(',')}`).then(r => r.json()).catch(() => null);
  const el = $('pc-prof'); if (!el) return;
  if (!j || !j.elevation) { el.innerHTML = ''; if (!p.up && $('pc-up')) $('pc-up').textContent = '–'; if (!p.dn && $('pc-dn')) $('pc-dn').textContent = '–'; return; }
  const z = j.elevation, xs = sel.map(i => tot[i] / 1000), mn = Math.min(...z), mx = Math.max(...z);
  let up = 0, dn = 0; for (let i = 1; i < z.length; i++) { const dz = z[i] - z[i - 1]; if (dz > 0) up += dz; else dn -= dz; }
  PRCQ[p.id] = Object.assign(PRCQ[p.id] || {}, { mx, prof: { d: xs, z } }); avvisiPercorso(p);
  if (!p.up && $('pc-up')) $('pc-up').textContent = '+' + fmt(Math.round(up)); if (!p.dn && $('pc-dn')) $('pc-dn').textContent = '−' + fmt(Math.round(dn));
  const W = 320, H = 90, X = x => 4 + (W - 8) * x / (xs[xs.length - 1] || 1), Y = v => H - 14 - (H - 26) * (v - mn) / Math.max(1, mx - mn);
  const lin = xs.map((x, i) => `${X(x).toFixed(1)},${Y(z[i]).toFixed(1)}`).join(' ');
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d4ed8" stop-opacity=".35"/><stop offset="1" stop-color="#1d4ed8" stop-opacity="0"/></linearGradient></defs><polygon points="${X(0)},${H - 14} ${lin} ${X(xs[xs.length - 1])},${H - 14}" fill="url(#pg)"/><polyline points="${lin}" fill="none" stroke="#1d4ed8" stroke-width="2"/><text x="4" y="10">${fmt(Math.round(mx))} m</text><text x="4" y="${H - 2}">${fmt(Math.round(mn))} m</text><text x="${W - 4}" y="${H - 2}" text-anchor="end">${num1(xs[xs.length - 1])} km</text></svg>`;
}

/* ---------- Escursioni: obiettivo, dove andare, registrazione del percorso */
const INT = { funghi: '#a0702a', alberi: '#5b3a1a', boschi: '#2d6a4f', flora: '#7a5ea8', alim: '#8fae3c' };
let intSel = new Set(['funghi', 'alberi']);
function suggerimenti(tutti) {  // le 12 zone più adatte agli interessi scelti
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
  out.sort((a, b) => b.sc - a.sc);
  return tutti ? out : out.slice(0, 12);
}
function escursioni() {
  if (vista !== 'escursioni') return;
  if (!ON.osm) { ON.osm = true; applica(); }
  const opt = (id, val, lista) => `<select class="tendina" id="${id}">${lista.map(([v, l]) => `<option value="${v}"${val === v ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
  const miei = leggiIt();
  $('pan').innerHTML = `<div class="ph-top"><h2>${T('Percorsi', 'Trails')}</h2><button class="lnk" id="it-nuovo">${ico('pencil', 'sm')} ${T('Crea itinerario', 'Plan a route')}</button></div>
    ${prcSel.zona && S[prcSel.zona] ? `<div class="zchip">${T('Nella zona', 'In')}: <b>${esc(S[prcSel.zona].n)}</b><button id="prc-z" aria-label="${t('chiudi')}">×</button></div>` : ''}
    ${miei.length ? `<details class="miei"><summary>${ico('route-2', 'sm')} ${T('I miei itinerari', 'My itineraries')}<em>${miei.length}</em></summary><div class="prc">${miei.map(x => `<button class="pc it" data-iti="${x.id}"><b>${esc(x.n)}</b><small>${num1(x.km)} km · +${fmt(x.up)} m · ${oreS(x.km / 4 + x.up / 400)}</small></button>`).join('')}</div></details>` : ''}
    <div class="prc-f quando">${ico('calendar')}${opt('prc-q', quando, [['oggi', T('Quando vai? Oggi', 'When? Today')], ['we', T('Questo fine settimana', 'This weekend')], ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(m => [String(m), T('A ', 'In ') + nomeMese(m)])])}</div>
    <div class="prc-f">${opt('prc-a', prcSel.area, ORD_AREE.map(a => [a, t('AR')[a]]))}${opt('prc-d', prcSel.diff, [['', T('Ogni difficoltà', 'Any difficulty')], ...Object.keys(CAI).map(k => [k, k + ' · ' + T(...CAI[k])])])}</div>
    <div class="prc-f">${opt('prc-i', prcSel.int, [['', T('Ogni interesse', 'Any interest')], ['funghi', t('iFunghi')], ['alberi', t('iAlberi')], ['boschi', t('iBoschi')], ['flora', t('iFlora')]])}${opt('prc-l', prcSel.len, [['', T('Ogni lunghezza', 'Any length')], ['c', T('Fino a 5 km', 'Up to 5 km')], ['m', T('5–12 km', '5–12 km')], ['l', T('Oltre 12 km', 'Over 12 km')]])}</div>
    <label class="chk"><input type="checkbox" id="prc-u"${prcSel.uff ? ' checked' : ''}> ${T('Solo sentieri ufficiali (CAI, Sentiero Italia, parchi)', 'Official trails only (CAI, Sentiero Italia, parks)')}</label>
    <div class="prc" id="prc"><p class="note">…</p></div>`;
  elencoPercorsi(); panoramica();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-trovaprc]');
  if (b) { prcSel = { area: 'tutte', diff: '', int: '', len: '', n: 8, uff: false, zona: b.dataset.trovaprc }; vai('escursioni'); const z = S[prcSel.zona]; if (z && z.bb) setTimeout(() => inquadra(z.bb, 12), 400); return; }
  if (e.target.closest('#prc-z')) { prcSel.zona = ''; prcSel.n = 8; escursioni(); }
});
/* panoramica dei percorsi segnati sulla mappa intera (sotto lo zoom 9, poi subentrano i sentieri dettagliati) */
async function panoramica() {
  if (!map.getSource('prv')) {
    const A = await caricaPercorsi(), sem = l => { const k = Math.max(1, Math.ceil(l.length / 25)); return l.filter((_, i) => i % k === 0 || i === l.length - 1); };
    if (map.getSource('prv')) return;
    map.addSource('prv', { type: 'geojson', data: { type: 'FeatureCollection', features: A.map(p => ({ type: 'Feature', properties: { id: p.id, c: p.c || '' }, geometry: { type: 'MultiLineString', coordinates: p.g.map(sem) } })) } });
    map.addLayer({ id: 'prv', type: 'line', source: 'prv', maxzoom: 9, layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['match', ['get', 'c'], 'T', '#2f9e44', 'E', '#d9480f', 'EE', '#c92a2a', 'EEA', '#5f3dc4', '#d9480f'], 'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1.2, 9, 2.2], 'line-opacity': 0.8 } }, map.getLayer('prc-c') ? 'prc-c' : undefined);
  }
  vediPanoramica();
}
function vediPanoramica() { if (map.getLayer('prv')) map.setLayoutProperty('prv', 'visibility', vista === 'escursioni' && !PIAN ? 'visible' : 'none'); }
/* zone (parchi, riserve, Natura 2000) attraversate da un percorso */
function dentroPoligono(pt, g) {
  const ring = (r, x, y) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const P = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  return P.some(pl => ring(pl[0], pt[0], pt[1]) && !pl.slice(1).some(h => ring(h, pt[0], pt[1])));
}
const ZPRC = {};
function zoneDi(p) {
  if (ZPRC[p.id]) return ZPRC[p.id];
  const pts = p.g.flat(), cand = pts.filter((_, i) => i % Math.max(1, Math.floor(pts.length / 12)) === 0), out = [];
  for (const f of GJ.features) {
    const k = f.properties.id, z = S[k]; if (!z || !z.bb) continue;
    if (z.bb[2] < p.bb[0] || z.bb[0] > p.bb[2] || z.bb[3] < p.bb[1] || z.bb[1] > p.bb[3]) continue;
    if (cand.some(q => dentroPoligono(q, f.geometry))) out.push(k);
  }
  const ord = { pn: 0, pr: 1, rn: 2, ap: 3 };
  return ZPRC[p.id] = out.sort((a, b) => (ord[S[a].t] ?? 9) - (ord[S[b].t] ?? 9) || S[a].ha - S[b].ha);
}
// percorsi consigliati: prima quelli con più informazioni (nome, difficoltà, dislivello, descrizione, gestore)
async function elencoPercorsi() {
  const A = await caricaPercorsi(); if (!$('prc')) return;
  const punti = p => (p.n && p.n !== p.r ? 2 : 0) + (p.c ? 2 : 0) + (p.up ? 1 : 0) + (p.desc ? 2 : 0) + (p.op ? 1 : 0) + (p.net === 'rwn' || p.net === 'nwn' ? 1 : 0) + Math.min(2, p.km / 6);
  await D;
  let zsc = null;
  if (prcSel.int) { const salva = intSel; intSel = new Set([prcSel.int]); zsc = {}; for (const x of suggerimenti(true)) zsc[x.k] = x.sc; intSel = salva; }
  const lenOk = p => !prcSel.len || (prcSel.len === 'c' ? p.km <= 5 : prcSel.len === 'm' ? p.km > 5 && p.km <= 12 : p.km > 12);
  const interesse = p => zsc ? Math.max(0, ...zoneDi(p).map(k => zsc[k] || 0)) : 0;
  const zz = prcSel.zona && S[prcSel.zona], nellaZona = p => !zz || (zz.bb && !(zz.bb[2] < p.bb[0] || zz.bb[0] > p.bb[2] || zz.bb[3] < p.bb[1] || zz.bb[1] > p.bb[3]) && zoneDi(p).includes(prcSel.zona));
  const L = A.filter(p => nellaZona(p) && (prcSel.area === 'tutte' || areaPt(p.s[0], p.s[1]) === prcSel.area) && (!prcSel.diff || p.c === prcSel.diff) && (!prcSel.uff || uff(p)) && lenOk(p) && (!zsc || interesse(p) > 0))
    .sort((a, b) => (zsc ? interesse(b) - interesse(a) : 0) || punti(b) - punti(a));
  $('prc').innerHTML = L.length ? L.slice(0, prcSel.n).map(p => `<button class="pc" data-prc="${p.id}"><b>${esc(p.n)}</b><small>${p.r ? `<span class="ref">${esc(p.r)}</span> ` : ''}${pctTag(p)}</small></button>`).join('') + (L.length > prcSel.n ? `<button class="piu" id="prc-piu">${T('Mostra altri', 'Show more')} (${L.length - prcSel.n})</button>` : '') : `<p class="note">${T('Nessun percorso segnato qui con questi filtri.', 'No marked trails here with these filters.')}</p>`;
}
const filtroPrc = e => { if (vista !== 'escursioni') return; if (e.target.id === 'prc-q') { quando = e.target.value; return; } if (e.target.id === 'prc-u') { prcSel.uff = e.target.checked; prcSel.n = 8; return elencoPercorsi(); } const k = { 'prc-a': 'area', 'prc-d': 'diff', 'prc-i': 'int', 'prc-l': 'len' }[e.target.id]; if (!k) return; prcSel[k] = e.target.value; prcSel.n = 8; elencoPercorsi(); if (k === 'area') map.fitBounds(limitiArea(prcSel.area), { padding: padMappa(), duration: 700 }); };
$('pan').addEventListener('change', filtroPrc); $('cat').addEventListener('change', filtroPrc);
window.escursioni = escursioni;
const clickEsc = e => {
  if (vista !== 'escursioni' && vista !== 'registra') return;
  if (e.target.closest('[data-regtab]')) { regTab = e.target.closest('[data-regtab]').dataset.regtab; return registra(); }
  const z = e.target.closest('[data-zona]'); if (z) { apri(z.dataset.zona, true); return; }
  const i = e.target.closest('.int button'), m = e.target.closest('[data-map]'), mt = e.target.closest('[data-mt]'), rb = e.target.closest('#regbtn'), tb = e.target.closest('[data-trk]');
  if (i) { intSel.has(i.dataset.i) ? intSel.delete(i.dataset.i) : intSel.add(i.dataset.i); escursioni(); }
  else if (m) { vai('mappa'); apri(m.dataset.map, true); }
  else if (mt) { const k = mt.dataset.mt; modo.meteo = 'mappa'; mt0.area = areaDi(k); vai('meteo'); METP.then(() => apriMeteoZona(k)); }
  else if (e.target.closest('[data-prc]')) apriPercorso(e.target.closest('[data-prc]').dataset.prc);
  else if (e.target.closest('#prc-piu')) { prcSel.n += 12; elencoPercorsi(); }
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
  <div class="rec-top"><button class="rb" id="rec-min" aria-label="Riduci">${ico('chevron-down')}</button><button class="rb sosb" data-sos="1" aria-label="SOS">SOS</button>
    <div class="rec-st"><div><b id="rec-km">0,0</b><span>km</span></div><div class="rec-t"><small id="rec-lab"></small><b id="rec-tm">00:00:00</b></div><div><b id="rec-up">0</b><span>m D+</span></div></div></div>
  <div class="rec-gps" id="rec-gps"></div><div class="rec-guida" id="rec-guida" style="display:none"></div><div class="rec-zona" id="rec-zona" style="display:none"></div>
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
function disegnaGuida(g) {
  if (map.getSource('guida')) map.getSource('guida').setData({ type: 'FeatureCollection', features: g ? [{ type: 'Feature', properties: {}, geometry: { type: 'MultiLineString', coordinates: g.g } }] : [] });
  const el = $('rec-guida'); if (el) el.style.display = g ? '' : 'none';
}
function distGuida(q) { let d = 1e9; for (const l of REG.guida.g) for (const r of l) { const x = hav(r, q); if (x < d) d = x; } return d; }
// avanzamento sul percorso da seguire: km e dislivello che mancano, arrivo stimato (4 km/h in piano + 1 h ogni 400 m di salita)
function avanzamento(q) {
  const G = REG.guida; if (!G._pt) { G._pt = G.g.flat(); G._cum = []; let d = 0; G._pt.forEach((r, i) => { if (i) d += hav(G._pt[i - 1], r); G._cum.push(d); }); }
  let bi = 0, bd = 1e9; G._pt.forEach((r, i) => { const x = hav(r, q); if (x < bd) { bd = x; bi = i; } });
  const tot = G._cum[G._cum.length - 1], fatto = G._cum[bi], km = Math.max(0, (tot - fatto) / 1000);
  let up = 0; if (G.prof) { const z = G.prof.z, dk = G.prof.d, k0 = fatto / 1000; for (let i = 1; i < z.length; i++) if (dk[i] > k0 && z[i] > z[i - 1]) up += z[i] - z[i - 1]; }
  const ore = km / 4 + up / 400, arr = new Date(Date.now() + ore * 3600e3);
  return { km, up: Math.round(up), arr: arr.toLocaleTimeString(LANG === 'it' ? 'it-IT' : 'en-GB', { hour: '2-digit', minute: '2-digit' }), fine: km < 0.05 };
}
// gli errori del GPS si mostrano solo se dopo 25 secondi non è arrivata nessuna posizione (all'avvio il telefono chiede i permessi)
let errGps = null;
function erroreGps(e) {
  if (!REG || REG.p.length || errGps) return;
  const permessi = e && /NOT_AUTHORIZED|denied|permission/i.test((e.code || '') + ' ' + (e.message || ''));
  errGps = setTimeout(() => { errGps = null; if (REG && !REG.p.length) toast(permessi ? T('Consenti la posizione all’app (Impostazioni › App › Sicilia Naturale › Posizione: Consenti sempre)', 'Allow location for the app (Settings › Apps › Sicilia Naturale › Location: Allow all the time)') : t('noGps')); }, 25000);
}
function aggRec() {
  if (!REG) return;
  if (REG.guida && $('rec-guida')) { const q = REG.p[REG.p.length - 1], d = q ? distGuida(q) : 0, fuori = d > 80; $('rec-guida').classList.toggle('fuori', fuori); const av = q && !fuori ? avanzamento(q) : null; $('rec-guida').textContent = fuori ? T(`Fuori percorso: ${fmt(Math.round(d))} m`, `Off trail: ${fmt(Math.round(d))} m`) : av ? (av.fine ? T('Arrivato!', 'Arrived!') : T(`Mancano ${num1(av.km)} km${av.up ? ' · +' + fmt(av.up) + ' m' : ''} · arrivo ${av.arr}`, `${num1(av.km)} km left${av.up ? ' · +' + fmt(av.up) + ' m' : ''} · arrive ${av.arr}`)) : REG.guida.n; }
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
function avviaReg(guida) {
  if (!navigator.geolocation && !isApp) return alertNota(t('noGps'));
  if (REG) return mostraRec(true);
  ZREC = { q: null, k: [] };
  if (!confirm(guida ? T(`Seguire "${guida.n}" e registrare l'uscita? Il GPS resta attivo anche a schermo spento finché non la termini.`, `Follow "${guida.n}" and record the outing? GPS stays on, even with the screen off, until you stop.`) : t('regConfIn'))) return;
  chiudi();
  REG = { t0: Date.now(), p: [], ob: [...intSel], w: [], guida: guida || null };
  segui = true; salvaCorrente(); avviaVista();
}
// schermata e GPS: prima la schermata, poi il GPS (la richiesta dei permessi può mandare l'app in secondo piano)
function avviaVista() {
  clearInterval(tick); tick = setInterval(aggRec, 1000);
  disegnaTrk(REG.p, REG.w); disegnaGuida(REG.guida); mostraRec(true); regUI();
  try { navigator.wakeLock && navigator.wakeLock.request('screen').then(w => wake = w).catch(() => {}); } catch (e) {}
  try { ascolta(); } catch (e) { erroreGps(e); }
}
/* durante la registrazione: in quale parco o riserva sei, con avviso quando entri o esci */
let ZREC = { q: null, k: [] };
function zoneQui(q) {
  if (typeof GJ === 'undefined' || !GJ) return [];
  return GJ.features.filter(f => { const z = S[f.properties.id]; return z && AREE.includes(z.t) && z.bb && q[0] >= z.bb[0] && q[0] <= z.bb[2] && q[1] >= z.bb[1] && q[1] <= z.bb[3] && dentroPoligono(q, f.geometry); })
    .map(f => f.properties.id).sort((a, b) => S[a].ha - S[b].ha);
}
function zonaRec(q) {
  if (ZREC.q && hav(ZREC.q, q) < 25) return; ZREC.q = q;
  const ora = zoneQui(q), prima = ZREC.k, entra = ora.filter(k => !prima.includes(k)), esce = prima.filter(k => !ora.includes(k));
  if (prima.length || ora.length) { const msg = [...entra.map(k => T('Entri in: ', 'Entering: ') + S[k].n), ...esce.map(k => T('Esci da: ', 'Leaving: ') + S[k].n)]; if (msg.length && ZREC.init) { toast(msg.join(' · ')); try { navigator.vibrate && navigator.vibrate([120, 80, 120]); } catch (e) {} } }
  ZREC.k = ora; ZREC.init = true;
  const el = $('rec-zona'); if (!el) return;
  el.style.display = ora.length ? '' : 'none'; el.textContent = ora.length ? ora.map(k => S[k].n).join(' · ') : '';
}
function ascolta() {
  const punto = (lon, lat, alt, acc) => {
    if (!REG || acc > 40) return;
    const q = [+lon.toFixed(6), +lat.toFixed(6), alt != null ? Math.round(alt) : null, Date.now()];
    posizione(q);
    const last = REG.p[REG.p.length - 1]; if (last && hav(last, q) < 4) return;
    REG.p.push(q); disegnaTrk(REG.p, REG.w); salvaCorrente(); aggRec(); zonaRec(q);
  };
  const BG = plug('BackgroundGeolocation');
  if (BG) {
    BG.addWatcher({ backgroundTitle: 'Sicilia Naturale', backgroundMessage: T('Registrazione percorso in corso', 'Recording route'), requestPermissions: true, stale: false, distanceFilter: 4 },
      (loc, err) => { if (err) { erroreGps(err); return; } if (loc) punto(loc.longitude, loc.latitude, loc.altitude, loc.accuracy); })
      .then(id => { bgId = id; }).catch(e => erroreGps(e));
  } else {
    wid = navigator.geolocation.watchPosition(pos => { const c = pos.coords; punto(c.longitude, c.latitude, c.altitude, c.accuracy); },
      e => erroreGps(e), { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
  }
}
function fermaReg() {
  if (!REG || !confirm(t('regConfFine'))) return;
  if (bgId != null) { try { plug('BackgroundGeolocation').removeWatcher({ id: bgId }); } catch (e) {} bgId = null; }
  if (wid != null) navigator.geolocation.clearWatch(wid); wid = null; try { wake && wake.release(); } catch (e) {}
  clearInterval(tick);
  const fatto = REG.p.length > 1 || REG.w.length;
  if (fatto) { const a = leggiTrk(); a.unshift({ id: 'T' + REG.t0, t0: REG.t0, ob: REG.ob, p: REG.p, w: REG.w }); scriviTrk(a); }
  REG = null; salvaCorrente(); if (dot) { dot.remove(); dot = null; } disegnaGuida(null);
  mostraRec(false); toast(fatto ? T('Percorso salvato in Escursioni', 'Route saved in Hikes') : T('Nessun dato da salvare', 'Nothing to save'));
  regUI(); trkUI();
}
// se l'app è stata chiusa durante una registrazione, il percorso non va perso
// se l'app si è riavviata durante la registrazione (permessi, memoria), la registrazione riprende da dove era
(function recupera() {
  let r = null; try { r = JSON.parse(localStorage.getItem(TKC)); } catch (e) {}
  if (!r) return;
  if (isApp && Date.now() - r.t0 < 24 * 3600e3) { REG = { t0: r.t0, p: r.p || [], ob: r.ob || [], w: r.w || [], guida: r.guida || null }; segui = true; setTimeout(() => { avviaVista(); toast(T('Registrazione ripresa', 'Recording resumed')); }, 800); return; }
  try { if (r.p.length > 1 || (r.w && r.w.length)) { const a = leggiTrk(); if (!a.some(x => x.id === 'T' + r.t0)) { a.unshift({ id: 'T' + r.t0, t0: r.t0, ob: r.ob, p: r.p, w: r.w || [] }); scriviTrk(a); } } localStorage.removeItem(TKC); } catch (e) {}
})();
$('rec-min').onclick = () => mostraRec(false);
$('recpill').onclick = () => mostraRec(true);
$('rec-stop').onclick = fermaReg;
$('rec-ctr').onclick = () => { segui = true; const q = REG && REG.p[REG.p.length - 1]; if (q) map.easeTo({ center: [q[0], q[1]], zoom: Math.max(map.getZoom(), 15), duration: 600 }); };
$('rec-pt').onclick = () => nuovoWpt(null);
$('rec-cam').onclick = () => scegliFoto(true, id => nuovoWpt(id));

/* nel pannello Escursioni */
document.getElementById('wrap').insertAdjacentHTML('beforeend', `<div id="regbar" class="regbar"><div class="reg" id="reg"></div></div><button id="miapos" class="miapos" aria-label="${T('La mia posizione', 'My location')}">${ico('current-location')}</button>`);
$('regbar').addEventListener('click', clickEsc);
let mio = null;
$('miapos').onclick = () => {
  if (!navigator.geolocation) return toast(t('noGps'));
  $('miapos').classList.add('cerca');
  navigator.geolocation.getCurrentPosition(p => {
    $('miapos').classList.remove('cerca');
    const ll = [p.coords.longitude, p.coords.latitude];
    if (!mio) { const el = document.createElement('div'); el.className = 'gpsdot'; mio = new maplibregl.Marker({ element: el }).setLngLat(ll).addTo(map); } else mio.setLngLat(ll);
    map.easeTo({ center: ll, zoom: Math.max(map.getZoom(), 14), duration: 800 });
  }, () => { $('miapos').classList.remove('cerca'); toast(t('noGps')); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
};
let regTab = 'reg';
function registra() {
  if (vista !== 'registra') return;
  $('pan').innerHTML = `<div class="ph-top"><h2>${T('Registra', 'Record')}</h2><div class="switch" role="tablist">${[['reg', T('Registra', 'Record')], ['uscite', T('Uscite', 'Outings')], ['off', T('Offline', 'Offline')]].map(([k, l]) => `<button role="tab" data-regtab="${k}" class="${regTab === k ? 'on' : ''}" aria-selected="${regTab === k}">${l}</button>`).join('')}</div></div>`
    + (regTab === 'reg' ? `<div class="gpsst" id="gpsst">${ico('gps')}<span>${T('Cerco il segnale GPS…', 'Looking for GPS…')}</span></div><p class="note">${T('Registra un percorso libero: traccia, punti e foto restano sul telefono. Per seguire un percorso segnato, aprilo in Percorsi e tocca "Segui il percorso".', 'Record a free route: track, waypoints and photos stay on your phone. To follow a marked trail, open it in Trails and tap "Follow this trail".')}</p>`
      + `<div class="sos-card"><b>${ico('sos')} ${T('Sicurezza', 'Safety')}</b><p class="note">${T('In caso di emergenza chiama il 112 e invia la tua posizione.', 'In an emergency call 112 and send your position.')}</p><button class="btnl rosso" data-sos="1">${T('Emergenza e posizione', 'Emergency and position')}</button></div>`
      : regTab === 'off' ? `<div id="offz"></div>` : `<div class="trk" id="trk"></div>`);
  regUI(); if (regTab === 'uscite') trkUI(); if (regTab === 'off') offUI();
  if (regTab === 'reg' && navigator.geolocation) navigator.geolocation.getCurrentPosition(q => {
    const el = $('gpsst'); if (!el) return; const a = Math.round(q.coords.accuracy);
    el.innerHTML = `${ico('gps')}<span>${a <= 25 ? T('Segnale GPS buono', 'Good GPS signal') : T('Segnale GPS debole', 'Weak GPS signal')} (± ${a} m)</span>`; el.style.color = a <= 25 ? '#2f9e44' : '#d9480f';
    const ll = [q.coords.longitude, q.coords.latitude];
    if (!mio) { const d = document.createElement('div'); d.className = 'gpsdot'; mio = new maplibregl.Marker({ element: d }).setLngLat(ll).addTo(map); } else mio.setLngLat(ll);
    map.easeTo({ center: ll, zoom: Math.max(map.getZoom(), 14), duration: 800 });
  }, () => { const el = $('gpsst'); if (el) el.innerHTML = `${ico('gps')}<span>${t('noGps')}</span>`; }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
}
function regUI() {
  document.body.classList.toggle('escreg', isApp && vista === 'registra' && !REG);
  if (!$('reg')) return;
  const m = REG ? misure(REG.p) : null;
  $('reg').innerHTML = REG
    ? `<div class="live"><div><b>${num1(m.km)} km</b><span>${t('dist')}</span></div><div><b>${durS((Date.now() - REG.t0) / 60000)}</b><span>${t('durata')}</span></div><div><b>${REG.w.length}</b><span>${T('punti', 'waypoints')}</span></div></div><button class="big" id="regapri">${T('Apri la registrazione', 'Open recording')}</button>`
    : `<button class="big" id="regbtn">${ico('player-record')}${t('regInizia')}</button>`;
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
      <h3>${T('Specie', 'Species')} <small class="note">${T('facoltativa, per le osservazioni', 'optional, for observations')}</small></h3><input id="wpf-s" list="wpf-sl" autocomplete="off" placeholder="${T('Nome comune o scientifico', 'Common or scientific name')}" value="${esc(w.sp ? etichettaSp(w.spt, w.spi) : '')}"><datalist id="wpf-sl"></datalist>
      <h3>${T('Nome', 'Name')}</h3><input id="wpf-n" maxlength="80" placeholder="${T('Dai un nome al punto', 'Name this waypoint')}" value="${esc(w.nome || '')}">
      <h3>${T('Descrizione', 'Description')}</h3><textarea id="wpf-d" rows="4" maxlength="1000" placeholder="${T('Che cosa vedi, come lo riconosci…', 'What you see, how to recognise it…')}">${esc(w.desc || '')}</textarea>
      <p class="note">${new Date(w.t).toLocaleString(LANG === 'it' ? 'it-IT' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })}${w.ele != null ? ' · ' + fmt(w.ele) + ' m' : ''} · ${w.lat.toFixed(5)}, ${w.lon.toFixed(5)}</p>
    </div>
    <div class="wpfoot"><button class="cest" id="wpf-del" aria-label="${T('Elimina', 'Delete')}">${ico('trash')}</button><button class="fatto" id="wpf-ok">${T('Fatto', 'Done')}</button></div>`;
  $('wpf').classList.add('on');
  CAT.then(() => { const dl = $('wpf-sl'); if (dl && !dl.childElementCount) dl.innerHTML = elencoSp().map(x => `<option value="${esc(x.l)}"></option>`).join(''); });
}
/* specie sensibili: orchidee e piante rare (meno di 5 segnalazioni GBIF in Sicilia) elencate nei formulari Natura 2000.
   Le loro posizioni si mostrano e si esportano sfumate (circa 10 km). */
const sensibile = (tp, i) => tp === 'piante' && !!PIA.s[i] && (PIA.s[i][5] === 'Orchidaceae' || (PIA.s[i][2].length > 0 && (PIA.s[i][6] || 0) < 5));
const csv = righe => '\ufeff' + righe.map(r => r.map(v => { v = v == null ? '' : String(v); return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(',')).join('\r\n');
function scarica(testo, nome, tipo) { const u = URL.createObjectURL(new Blob([testo], { type: tipo })), l = document.createElement('a'); l.href = u; l.download = nome; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 5000); }
/* osservazioni in formato Darwin Core (GBIF); il file si carica anche su iNaturalist e nei portali regionali */
function scaricaOss(x) {
  const ri = [['occurrenceID', 'basisOfRecord', 'scientificName', 'vernacularName', 'kingdom', 'eventDate', 'decimalLatitude', 'decimalLongitude', 'geodeticDatum', 'coordinateUncertaintyInMeters', 'minimumElevationInMeters', 'country', 'countryCode', 'stateProvince', 'locality', 'occurrenceRemarks', 'informationWithheld', 'associatedMedia']];
  (x.w || []).filter(w => w.sp).forEach((w, j) => {
    const sens = w.spt && sensibile(w.spt, w.spi), r0 = v => sens ? Math.round(v * 10) / 10 : +v.toFixed(5);
    ri.push([`SN-${x.id}-${j + 1}`, 'HumanObservation', w.sp, w.spt ? nomeC(w.spt, w.spi) : '', w.spt === 'funghi' ? 'Fungi' : w.spt === 'piante' ? 'Plantae' : '', new Date(w.t).toISOString(), r0(w.lat), r0(w.lon), 'WGS84', sens ? 10000 : 10, w.ele != null && !sens ? Math.round(w.ele) : '', 'Italy', 'IT', 'Sicilia', w.nome || '', w.desc || '', sens ? 'Coordinate generalizzate a 0,1° (specie protetta)' : '', (w.foto || []).length ? (w.foto.length + ' foto sul telefono') : '']);
  });
  scarica(csv(ri), `osservazioni-${new Date(x.t0).toISOString().slice(0, 10)}.csv`, 'text/csv');
}
/* specie per le osservazioni: elenco funghi e piante con nome comune */
let ELSP = null;
const etichettaSp = (tp, i) => { const r = (tp === 'funghi' ? FUN : PIA).s[i]; if (!r) return ''; const n = nomeC(tp, i); return n ? `${n} — ${r[0]}` : r[0]; };
const elencoSp = () => ELSP || (ELSP = [...FUN.s.map((r, i) => ({ tp: 'funghi', i })), ...PIA.s.map((r, i) => ({ tp: 'piante', i }))].map(x => ({ ...x, l: etichettaSp(x.tp, x.i) })));
const leggiForm = () => {
  if (!WPF || !$('wpf-n')) return; WPF.nome = $('wpf-n').value.trim(); WPF.desc = $('wpf-d').value.trim();
  const v = $('wpf-s').value.trim(), x = v && elencoSp().find(y => y.l === v || (y.tp === 'funghi' ? FUN : PIA).s[y.i][0].toLowerCase() === v.toLowerCase());
  if (x) { WPF.sp = (x.tp === 'funghi' ? FUN : PIA).s[x.i][0]; WPF.spt = x.tp; WPF.spi = x.i; } else if (v) { WPF.sp = v; WPF.spt = null; WPF.spi = null; } else { delete WPF.sp; delete WPF.spt; delete WPF.spi; }
};
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
  const h = `<div class="wpp"><b>${esc(x.nome || wpNome(x.tipo))}</b>${x.sp ? `<i>${esc(x.sp)}</i>` : ''}<small>${esc(wpNome(x.tipo))} · ${new Date(x.t).toLocaleString(LANG === 'it' ? 'it-IT' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' })}${x.ele != null ? ' · ' + fmt(x.ele) + ' m' : ''}</small>${x.desc ? `<p>${esc(x.desc)}</p>` : ''}${urls.map(u => `<img src="${u}" alt="">`).join('')}</div>`;
  if (popW) popW.remove();
  popW = new maplibregl.Popup({ maxWidth: '280px', offset: 30 }).setLngLat([x.lon, x.lat]).setHTML(h).addTo(map);
}
function trkUI() {
  if (!$('trk')) return;
  const a = leggiTrk();
  $('trk').innerHTML = a.length ? a.map(x => { const m = misure(x.p), n = (x.w || []).length; return `<div class="t"><b>${new Date(x.t0).toLocaleString(LANG === 'it' ? 'it-IT' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</b><small>${num1(m.km)} km · ${durS(m.min)} · +${fmt(m.up)} m${n ? ' · ' + n + ' ' + T(n === 1 ? 'punto' : 'punti', n === 1 ? 'waypoint' : 'waypoints') : ''}${x.ob && x.ob.length ? ' · ' + x.ob.map(o => t({ funghi: 'iFunghi', alberi: 'iAlberi', boschi: 'iBoschi', flora: 'iFlora', alim: 'iAlim' }[o])).join(', ') : ''}</small><div class="az"><button data-trk="${x.id}" data-az="map">${t('apriMappa')}</button><button data-trk="${x.id}" data-az="gpx">${t('gpx')}</button>${(x.w || []).some(w => w.sp) ? `<button data-trk="${x.id}" data-az="dwc">${T('Osservazioni CSV', 'Observations CSV')}</button>` : ''}<button data-trk="${x.id}" data-az="del">${t('elimina')}</button></div></div>`; }).join('') : `<p class="note">${t('nessunTrk')}</p>`;
}
function azioneTrk(id, az) {
  const a = leggiTrk(), x = a.find(y => y.id === id); if (!x) return;
  if (az === 'del') { if (confirm(t('eliminaConf'))) { (x.w || []).forEach(w => (w.foto || []).forEach(fotoDel)); scriviTrk(a.filter(y => y.id !== id)); trkUI(); disegnaTrk([], []); } return; }
  if (az === 'dwc') return scaricaOss(x);
  if (az === 'map') { vai('mappa'); disegnaTrk(x.p, x.w); const pts = [...x.p, ...(x.w || []).map(w => [w.lon, w.lat])], lo = pts.map(q => q[0]), la = pts.map(q => q[1]); if (pts.length) map.fitBounds([[Math.min(...lo), Math.min(...la)], [Math.max(...lo), Math.max(...la)]], { padding: 60, maxZoom: 16, duration: 600 }); return; }
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Sicilia Naturale" xmlns="http://www.topografix.com/GPX/1/1">${(x.w || []).map(w => `<wpt lat="${w.lat}" lon="${w.lon}">${w.ele != null ? `<ele>${w.ele}</ele>` : ''}<time>${new Date(w.t).toISOString()}</time><name>${esc(w.nome || wpNome(w.tipo))}</name>${w.desc ? `<desc>${esc(w.desc)}</desc>` : ''}<type>${esc(wpNome(w.tipo))}</type></wpt>`).join('')}<trk><name>Sicilia Naturale ${new Date(x.t0).toISOString().slice(0, 10)}</name><trkseg>${x.p.map(q => `<trkpt lat="${q[1]}" lon="${q[0]}">${q[2] != null ? `<ele>${q[2]}</ele>` : ''}<time>${new Date(q[3]).toISOString()}</time></trkpt>`).join('')}</trkseg></trk></gpx>`;
  const u = URL.createObjectURL(new Blob([gpx], { type: 'application/gpx+xml' })), l = document.createElement('a'); l.href = u; l.download = `sicilia-naturale-${new Date(x.t0).toISOString().slice(0, 10)}.gpx`; document.body.appendChild(l); l.click(); l.remove();
}
setInterval(() => { if (REG && vista === 'escursioni') regUI(); }, 30000);
// tasto Indietro di Android: chiude le schede aperte; durante la registrazione manda l'app in secondo piano invece di chiuderla
(function indietro() {
  const A = plug('App'); if (!A) return;
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
  setTimeout(() => { const d = modo.meteo === 'mappa' ? $('pan') : $('cat'); if (d && !d.querySelector('#allerte')) { const h = d.querySelector('.ph-top'); if (h) { h.insertAdjacentHTML('afterend', '<div id="allerte"></div>'); bannerAllerte($('allerte')); } } }, 400);
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
      <select class="tendina aree-sel" id="mt-area">${ORD_AREE.map(a => `<option value="${a}"${mt0.area === a ? ' selected' : ''}>${t('AR')[a]}</option>`).join('')}</select>
      <div class="scala"><span>1</span><i></i><span>10</span></div>`;
    const riga = k => { const v = valDi(k, mt0.day); return `<button data-mz="${k}"><span class="ring" style="--v:${v * 10};--c:${colore10(v)}">${num1(v)}</span><span class="mzt"><b>${esc(S[k].n)}</b><small>${esc(t('AR')[areaDi(k)])} · ${mt0.k === 'e' ? (MET[k].G[mt0.day].e.perche.join(', ') || t('ok')) : MET[k].G[mt0.day].f.parola}</small></span>${cella(MET[k].M, MET[k].G[mt0.day].i)}</button>`; };
    if (modo.meteo === 'mappa') {
      $('pan').innerHTML = `<div class="ph-top"><h2>${t('tMeteo')}</h2>${sw()}</div>${ctrl}<p class="pl">${t('toccaZona')}</p><h3>${t('miglioriQui')}</h3><div class="mz">${top.slice(0, 5).map(riga).join('')}</div><p class="src">${t('fonte')}: Open-Meteo (CC BY 4.0) · ${LANG === 'it' ? 'modello T1 di Sottobosco' : 'Sottobosco T1 model'}</p>`;
      const wxT = k => { const M = MET[k].M, i = MET[k].G[mt0.day].i; return `${num1(M.precipitation_sum[i] || 0)} mm · ${Math.round(M.temperature_2m_min[i])}–${Math.round(M.temperature_2m_max[i])}° · ${Math.round(M.wind_speed_10m_max[i] || 0)} km/h`; };
      evidenzia(ks.map(k => ({ k, v: valDi(k, mt0.day), vs: num1(valDi(k, mt0.day)), wx: wxT(k), lab: S[k].n.replace(/^Riserva naturale (orientata |integrale |speciale |regionale )?/i, 'R.N. ') })));
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
const cambiaArea = e => { if (e.target.id !== 'mt-area' || vista !== 'meteo') return; mt0.area = e.target.value; meteo(); if (modo.meteo === 'mappa') map.fitBounds(limitiArea(mt0.area), { padding: padMappa(), duration: 700 }); };
$('pan').addEventListener('change', cambiaArea); $('cat').addEventListener('change', cambiaArea);
// pannello (Escursioni, Meteo): tasto per aprirlo a tutto schermo
new MutationObserver(() => { const h = $('pan').querySelector('.ph-top'); if (h && !h.querySelector('.espandi')) { h.insertAdjacentHTML('beforeend', `<button class="espandi" aria-label="${T('Tutto schermo', 'Full screen')}">${ico($('pan').classList.contains('big') ? 'arrows-minimize' : 'arrows-maximize')}</button>`); $('pan').insertAdjacentHTML('afterbegin', '<button class="grip" aria-label="Abbassa"><span></span></button>'); } }).observe($('pan'), { childList: true });
const altPan = altezze($('pan'), '.grip, .ph-top h2');
$('pan').addEventListener('click', e => { if (e.target.closest('.espandi')) altPan($('pan').classList.contains('big') ? 1 : 2); });
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

document.addEventListener('click', async e => { const b = e.target.closest('[data-elsp]'); if (!b) return; await CAT; const k = b.dataset.elsp, z = S[k];
  const ri = [[T('gruppo', 'group'), 'scientificName', T('nome comune', 'vernacularName'), T('sito', 'site'), T('codice', 'code')]];
  specieDi(k).map(i => [t('G')[SP.gr[i]] || SP.gr[i], SP.nomi[i]]).sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1])).forEach(([g, n]) => { const j = trovaPianta(n); ri.push([g, n, j >= 0 ? nomeC('piante', j) : '', z.n, k]); });
  scarica(csv(ri), `specie-${k}.csv`, 'text/csv');
});
/* schede verificate da esperti (data/verificate.json): firma, testo e foto proprie in cima alla scheda */
let VER = null;
async function verificata(tipo, nome, k) {
  VER = VER || fetch('data/verificate.json').then(r => r.ok ? r.json() : {}).catch(() => ({}));
  const e = ((await VER)[tipo] || {})[nome]; if (!e || cur !== k) return;
  const d = e.data ? new Date(e.data).toLocaleDateString(LANG === 'it' ? 'it-IT' : 'en-GB', { month: 'long', year: 'numeric' }) : '';
  $('sb').insertAdjacentHTML('afterbegin', `<div class="verif">${ico('user-check', 'sm')}<span>${T('Scheda verificata da', 'Sheet checked by')} <b>${esc(e.da)}</b>${e.ruolo ? ', ' + esc(e.ruolo) : ''}${d ? ' · ' + esc(d) : ''}</span></div>${e.testo ? `<p>${esc(senzaComm(e.testo))}</p>` : ''}${(e.foto || []).length ? `<div class="ownph">${e.foto.map(f => `<img src="data/foto/${encodeURIComponent(f.f)}" alt="${esc(nome)}" loading="lazy">`).join('')}</div><p class="note">${e.foto.map(f => `© ${esc(f.autore || '')}${f.lic ? ' · ' + esc(f.lic) : ''}`).filter((v, i, a) => a.indexOf(v) === i).join(' · ')}</p>` : ''}`);
}
/* segnalazioni GBIF della specie sulla mappa (esagoni, dal sito GBIF) */
async function mostraGbif(nome, key, sens) {
  if (!key) { const m = await getJ('https://api.gbif.org/v1/species/match?name=' + encodeURIComponent(nome)); key = m && m.usageKey; }
  vai('mappa');
  if (!key) return;
  if (map.getLayer('gbif')) map.removeLayer('gbif'); if (map.getSource('gbif')) map.removeSource('gbif');
  map.addSource('gbif', { type: 'raster', tileSize: 512, attribution: 'GBIF.org', maxzoom: sens ? 7 : 22,
    tiles: [`https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?srs=EPSG:3857&taxonKey=${key}&bin=hex&hexPerTile=40&style=classic.poly`] });
  map.addLayer({ id: 'gbif', type: 'raster', source: 'gbif', paint: { 'raster-opacity': 0.85 } }, 'sel');
  $('gbifchip').innerHTML = `<span>${t('gbifChip')} <i>${esc(nome)}</i>${sens ? `<small> · ${T('specie protetta: posizioni sfumate', 'protected species: blurred locations')}</small>` : ''}</span><button aria-label="Chiudi">×</button>`; $('gbifchip').classList.add('on');
  map.fitBounds([[12.3, 36.55], [15.7, 38.35]], { padding: 30, duration: 600 });
}
$('gbifchip').onclick = e => { if (!e.target.closest('button')) return; if (map.getLayer('gbif')) map.removeLayer('gbif'); if (map.getSource('gbif')) map.removeSource('gbif'); $('gbifchip').classList.remove('on'); };
// aprire una zona da una scheda specie riporta alla mappa
$('sheet').addEventListener('click', e => { if (vista !== 'mappa' && e.target.closest('button[data-id]')) { vai('mappa'); } }, true);
$('sheet').addEventListener('click', e => { const b = e.target.closest('[data-spn]'); if (!b) return; const z = cur; CAT.then(() => { const i = trovaPianta(b.dataset.spn); if (i >= 0) { daZona = z; apriSpecie('piante', i); } }); });
testi();
// aggiornamenti automatici dell'app (Capgo updater, modalità manuale): all'avvio controlla version.json sul ramo "ota" del repository,
// scarica il nuovo codice in sottofondo e lo applica alla prossima apertura. Serve un APK nuovo solo se cambia la parte nativa (apkMin).
(async function aggiornamenti() {
  if (!isApp) return; const U = plug('CapacitorUpdater'); if (!U) { UPD = 'plugin assente'; return; }
  try { await U.notifyAppReady(); } catch (e) {}
  try {
    const r = await fetch('https://raw.githubusercontent.com/Cangelosky/sicilia-naturale/ota/version.json?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) { UPD = 'rete ' + r.status; return; }
    const m = await r.json(), io = (window.SN_VER || {}).v;
    if (!m.v || m.v === io) { UPD = 'aggiornata'; return; }
    const num = v => String(v || '0').split(/[.+-]/).slice(0, 3).map(Number);
    const meno = (a, b) => { a = num(a); b = num(b); for (let i = 0; i < 3; i++) { if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) < (b[i] || 0); } return false; };
    const A = plug('App'), apk = A && A.getInfo ? (await A.getInfo()).version : '0';
    if (m.apkMin && meno(apk, m.apkMin)) { toast(T('C’è una versione nuova che richiede di installare l’APK aggiornato.', 'A new version needs the updated APK.')); return; }
    const gia = ((await U.list()).bundles || []).find(b => b.version === m.v && b.status !== 'error');
    UPD = 'scarico ' + m.v; if (!gia) toast(T('Scarico l’aggiornamento…', 'Downloading the update…'));
    const b = gia || await U.download({ url: m.url, version: m.v, checksum: m.checksum || '' });
    await U.next({ id: b.id });
    UPD = 'pronta ' + m.v; toast(T('Aggiornamento pronto: chiudi l’app e riaprila.', 'Update ready: close and reopen the app.'));
  } catch (e) { UPD = 'errore: ' + String(e && e.message || e).slice(0, 120); toast(T('Aggiornamento non riuscito: ', 'Update failed: ') + String(e && e.message || e).slice(0, 80)); }
})();
/* ---------- mappe offline: scaricare una zona (dettaglio ed eventualmente satellite) */
const ZK = 'sn_zone_off';
const zoneOff = () => { try { return JSON.parse(localStorage.getItem(ZK)) || []; } catch (e) { return []; } };
const tileXY = (lon, lat, z) => { const n = 2 ** z, r = lat * Math.PI / 180; return [Math.floor((lon + 180) / 360 * n), Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n)]; };
function tileZona(bb, sat) {
  const L = [];
  const giro = (tipo, z0, z1) => { for (let z = z0; z <= z1; z++) { const [x0, y0] = tileXY(bb[0], bb[3], z), [x1, y1] = tileXY(bb[2], bb[1], z); for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) L.push([tipo, z, x, y]); } };
  giro('ofm', 12, 14); if (sat) giro('sat', 12, 16);
  return L;
}
let scaricando = false;
async function scaricaZona(bb, nome, sat) {
  if (scaricando) return;
  const L = tileZona(bb, sat);
  if (L.length > 6000) return toast(T('Zona troppo grande: avvicinati un po’ e riprova.', 'Area too large: zoom in and try again.'));
  scaricando = true; const c = await caches.open(CACHE_OFF); let ok = 0, byte = 0, fatti = 0;
  const pr = $('off-pr'); const agg = () => { if (pr) pr.textContent = T(`Scarico… ${Math.round(fatti / L.length * 100)}%`, `Downloading… ${Math.round(fatti / L.length * 100)}%`); };
  const coda = [...L];
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (coda.length) {
      const [tipo, z, x, y] = coda.shift(), k = `https://sn.offline/${tipo}/${z}/${x}/${y}`;
      try { if (!(await c.match(k))) { const r = await fetch(await urlTile(tipo, z, x, y)); if (r.ok) { const b = await r.arrayBuffer(); byte += b.byteLength; await c.put(k, new Response(b)); } } ok++; } catch (e) {}
      fatti++; if (fatti % 20 === 0) agg();
    }
  }));
  const a = zoneOff().filter(z => z.nome !== nome); a.unshift({ id: 'Z' + Date.now(), nome, bb, sat, n: ok, mb: Math.round(byte / 1e5) / 10, d: Date.now() });
  try { localStorage.setItem(ZK, JSON.stringify(a)); } catch (e) {}
  scaricando = false; toast(T(`Zona scaricata: ${nome}`, `Area downloaded: ${nome}`)); offUI();
}
async function eliminaZona(id) {
  const a = zoneOff(), z = a.find(x => x.id === id); if (!z) return;
  const resto = a.filter(x => x.id !== id), tieni = new Set(resto.flatMap(x => tileZona(x.bb, x.sat).map(t => t.join('/'))));
  const c = await caches.open(CACHE_OFF);
  for (const t of tileZona(z.bb, z.sat)) if (!tieni.has(t.join('/'))) await c.delete(`https://sn.offline/${t.join('/')}`);
  try { localStorage.setItem(ZK, JSON.stringify(resto)); } catch (e) {} offUI();
}
// sezione "Mappe offline" (in Registra)
function offUI() {
  const el = $('offz'); if (!el) return;
  const a = zoneOff();
  el.innerHTML = `<p class="note">${T('La mappa di base, il rilievo e i sentieri funzionano già senza rete. Qui scarichi il dettaglio (stradine, carrarecce, edifici) e, se vuoi, il satellite della zona.', 'The base map, terrain and trails already work offline. Here you download detail (small roads, tracks, buildings) and, if you want, satellite imagery.')}</p>
    <label class="chk"><input type="checkbox" id="off-sat"> ${T('Anche il satellite (molto più pesante)', 'Satellite too (much heavier)')}</label>
    <button class="btnl" id="off-dl">${ico('download')} ${T('Scarica la zona che vedi', 'Download the visible area')}</button> <small class="note" id="off-pr"></small>
    ${a.length ? `<div class="offl">${a.map(z => `<div><span><b>${esc(z.nome)}</b><small>${z.mb} MB${z.sat ? ' · ' + T('con satellite', 'with satellite') : ''} · ${new Date(z.d).toLocaleDateString(LANG === 'it' ? 'it-IT' : 'en-GB')}</small></span><button data-offvai="${z.id}">${T('Vedi', 'View')}</button><button data-offdel="${z.id}" aria-label="${T('Elimina', 'Delete')}">${ico('trash')}</button></div>`).join('')}</div>` : ''}`;
}
document.addEventListener('click', e => {
  if (e.target.closest('#off-dl')) {
    const b = map.getBounds(), bb = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
    if (map.getZoom() < 10.5) return toast(T('Avvicinati alla zona che vuoi scaricare (almeno una valle o un monte).', 'Zoom in to the area you want (a valley or a mountain).'));
    const c = map.getCenter(), nome = prompt(T('Nome della zona', 'Area name'), T('Zona ', 'Area ') + c.lat.toFixed(2) + ', ' + c.lng.toFixed(2)); if (nome === null) return;
    return scaricaZona(bb, nome || 'Zona', $('off-sat') && $('off-sat').checked);
  }
  const v = e.target.closest('[data-offvai]'), d = e.target.closest('[data-offdel]');
  if (v) { const z = zoneOff().find(x => x.id === v.dataset.offvai); if (z) map.fitBounds([[z.bb[0], z.bb[1]], [z.bb[2], z.bb[3]]], { padding: 40, duration: 700 }); }
  if (d && confirm(T('Eliminare questa zona dal telefono?', 'Delete this area from the phone?'))) eliminaZona(d.dataset.offdel);
});
/* ---------- sicurezza: 112 e invio della posizione (SMS, WhatsApp, copia) */
function sos() {
  const mostraSos = (q, acc) => {
    const ll = q ? `${q[1].toFixed(5)}, ${q[0].toFixed(5)}` : '', link = q ? `https://maps.google.com/?q=${q[1].toFixed(5)},${q[0].toFixed(5)}` : '';
    const msg = T(`Ho bisogno di aiuto. La mia posizione: ${ll} ${link}`, `I need help. My position: ${ll} ${link}`);
    $('sh').innerHTML = `<div><h2>${T('Emergenza', 'Emergency')}</h2></div><button class="close" aria-label="${t('chiudi')}">×</button>`;
    $('sb').innerHTML = `<a class="sos112" href="tel:112">${ico('phone')} ${T('Chiama il 112', 'Call 112')}</a>
      <div class="coord">${q ? `<b>${ll}</b><small>${T('Precisione', 'Accuracy')} ± ${Math.round(acc || 0)} m · ${T('Latitudine, longitudine', 'Latitude, longitude')}</small>` : `<small>${T('Posizione non disponibile: esci all’aperto e riprova.', 'Position not available: go outside and try again.')}</small>`}</div>
      ${q ? `<div class="az"><a class="btnl" href="sms:?body=${encodeURIComponent(msg)}">SMS</a><a class="btnl" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">WhatsApp</a><button class="btnl" id="sos-cp">${T('Copia', 'Copy')}</button></div>` : ''}
      <p class="note">${T('Al 112 di’ chi sei, cosa è successo, quante persone sono coinvolte e leggi le coordinate. In montagna risponde anche il Soccorso Alpino (CNSAS) tramite il 112.', 'Tell 112 who you are, what happened, how many people are involved and read the coordinates. In the mountains the Alpine Rescue (CNSAS) is reached through 112.')}</p>`;
    mostra(); $('sheet').classList.add('big');
    if ($('sos-cp')) $('sos-cp').onclick = () => { try { navigator.clipboard.writeText(msg); toast(T('Copiato', 'Copied')); } catch (e) {} };
  };
  const ult = REG && REG.p.length ? REG.p[REG.p.length - 1] : null;
  if (ult) return mostraSos(ult, 10);
  mostraSos(null);
  if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => mostraSos([p.coords.longitude, p.coords.latitude], p.coords.accuracy), () => {}, { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 });
}
document.addEventListener('click', e => { if (e.target.closest('[data-sos]')) { mostraRec(false); sos(); } });
/* ---------- allerte meteo della Protezione Civile (bollettino nazionale di criticità, copiato ogni giorno sul ramo "dati") */
let ALL = null;
const caricaAllerte = () => ALL || (ALL = fetch('https://raw.githubusercontent.com/Cangelosky/sicilia-naturale/dati/allerte.json?t=' + new Date().toISOString().slice(0, 13), { cache: 'no-store' }).then(r => r.json()).catch(() => null));
const LIVN = { 1: ['gialla', 'yellow'], 2: ['arancione', 'orange'], 3: ['rossa', 'red'] };
function allertaIn(pt, lista) { return (lista || []).filter(z => z.n > 0 && dentroPoligono(pt, z.g)).sort((a, b) => b.n - a.n)[0] || null; }
async function bannerAllerte(el) {
  const A = await caricaAllerte(); if (!A || !el) return;
  const riga = (giorno, l) => { const z = (l || []).filter(x => x.n > 0); if (!z.length) return ''; const mx = Math.max(...z.map(x => x.n)); return `<div class="allerta" style="--c:${z.find(x => x.n === mx).c}"><b>${giorno}: ${T('allerta', 'alert')} ${T(...LIVN[mx])}</b><small>${esc(z.map(x => x.zona + (x.rischi.length ? ' (' + x.rischi.join(', ') + ')' : '')).join(' · '))}</small></div>`; };
  const h = riga(T('Oggi', 'Today'), A.oggi) + riga(T('Domani', 'Tomorrow'), A.domani);
  el.innerHTML = h ? h + `<small class="note">${T('Protezione Civile, bollettino di criticità idrogeologica e idraulica.', 'Civil Protection, hydro-geological bulletin.')} <a href="https://www.protezionecivilesicilia.it" target="_blank" rel="noopener">protezionecivilesicilia.it</a></small>`
    : `<small class="note ok">${T('Nessuna allerta meteo in Sicilia oggi e domani (Protezione Civile).', 'No weather alerts in Sicily today and tomorrow (Civil Protection).')}</small>`;
}
/* ---------- percorso: scaricare la zona per l'uso offline */
document.addEventListener('click', e => { const b = e.target.closest('[data-offprc]'); if (!b) return; caricaPercorsi().then(A => { const p = A.find(x => x.id === +b.dataset.offprc); if (p) { const m = 0.01; scaricaZona([p.bb[0] - m, p.bb[1] - m, p.bb[2] + m, p.bb[3] + m], p.n, false); b.textContent = T('Scarico la zona…', 'Downloading area…'); } }); });
/* ---------- regole: aree protette e raccolta dei funghi in Sicilia */
function regole(z) {
  const prot = ['pn', 'pr', 'rn', 'amp', 'ap'].includes(z.t), n2k = !prot && ['zsc', 'zsczps', 'zps'].includes(z.t);
  if (!prot && !n2k) return '';
  const it = LANG === 'it';
  const voci = prot ? (it ? ['Resta sui sentieri segnati, soprattutto nelle zone di riserva integrale (zona A).', 'Non raccogliere né danneggiare piante, fiori, funghi, rocce e fossili, se il regolamento non lo permette.', 'Niente fuochi, campeggio libero e rifiuti; i cani al guinzaglio.', 'Niente mezzi a motore fuori dalle strade aperte al traffico.', 'Non disturbare gli animali, soprattutto nel periodo dei nidi.']
    : ['Stay on marked trails, especially in strict reserve zones (zone A).', 'Do not pick or damage plants, flowers, fungi, rocks and fossils unless the rules allow it.', 'No fires, wild camping or litter; dogs on a lead.', 'No motor vehicles off roads open to traffic.', 'Do not disturb animals, especially during nesting.'])
    : (it ? ['È un sito protetto dall’Unione europea: vale il buon senso del visitatore rispettoso.', 'Non raccogliere specie rare e non uscire dai sentieri negli habitat delicati (dune, zone umide, rupi).'] : ['It is a site protected by the European Union: behave as a respectful visitor.', 'Do not pick rare species or leave trails in delicate habitats (dunes, wetlands, cliffs).']);
  return `<details class="regole"><summary>${ico('shield-check', 'sm')} ${T('Regole per chi visita', 'Rules for visitors')}</summary><ul>${voci.map(v => `<li>${esc(v)}</li>`).join('')}</ul><p class="note">${prot ? T('Sono le regole più comuni nei parchi e nelle riserve siciliane. Ogni ente gestore ha il suo regolamento e le sue zone: controlla i cartelli all’ingresso e il sito dell’ente.', 'These are the most common rules in Sicilian parks and reserves. Each managing body has its own rules and zones: check the signs at the entrance and the body’s website.') : T('Se il sito è anche dentro un parco o una riserva valgono le regole di quell’area.', 'If the site is also inside a park or reserve, that area’s rules apply.')}</p></details>`;
}
const REGOLE_FUNGHI = () => `<details class="regole"><summary>${ico('scale', 'sm')} ${T('Raccolta dei funghi in Sicilia: le regole', 'Mushroom picking in Sicily: the rules')}</summary><ul>${(LANG === 'it' ? [
  'Serve il tesserino regionale, rilasciato dal Comune di residenza dopo un corso di almeno 15 ore con un micologo; si rinnova ogni 5 anni. I non residenti chiedono l’autorizzazione al Comune dove raccolgono (annuale, 30 €).',
  'Limiti al giorno: 4 kg con il tesserino amatoriale (30 € l’anno), 12 kg con quello professionale.',
  'Vietato raccogliere di notte, usare rastrelli o uncini e danneggiare i funghi di qualsiasi specie.',
  'Usa contenitori aerati, meglio cesti in fibre naturali: la plastica è vietata.',
  'I funghi vanno raccolti interi (riconoscibili) e puliti sommariamente sul posto.',
  'L’ovolo buono (Amanita caesarea) non si raccoglie chiuso.',
  'Vietato nelle riserve integrali e nelle zone dei parchi indicate dagli enti; nelle aziende faunistico-venatorie solo nei giorni di silenzio venatorio.',
  'Sotto i 14 anni si raccoglie solo con un adulto munito di tesserino.'] : [
  'You need the regional permit, issued by your town after a course of at least 15 hours with a mycologist; renewed every 5 years. Non-residents ask the town where they pick (yearly, €30).',
  'Daily limits: 4 kg with the amateur permit (€30 a year), 12 kg with the professional one.',
  'No picking at night, no rakes or hooks, no damaging fungi of any species.',
  'Use ventilated containers, ideally natural-fibre baskets: plastic is forbidden.',
  'Pick fungi whole (identifiable) and roughly clean them on the spot.',
  'Caesar’s mushroom (Amanita caesarea) must not be picked closed.',
  'Forbidden in strict reserves and in park zones set by the managing bodies; in hunting estates only on non-hunting days.',
  'Under 14s may pick only with an adult holding a permit.']).map(v => `<li>${esc(v)}</li>`).join('')}</ul><p class="note">${T('Fonte: legge regionale 1 febbraio 2006, n. 3 (sintesi ISPRA). Qui non diamo indicazioni sulla commestibilità: fai controllare sempre i funghi da un micologo (ispettorati micologici delle ASP).', 'Source: Sicilian regional law no. 3 of 1 February 2006 (ISPRA summary). We give no edibility advice: always have fungi checked by a mycologist (local health authority).')} <a href="https://development.isprambiente.gov.it/files/biodiversita/raccolta-dei-funghi-epigei-regione-sicilia.pdf" target="_blank" rel="noopener">ISPRA</a></p></details>`;
const uniciNome = l => { const v = new Set(); return l.filter(x => { const n = nomeC(x.tp, x.i) || (x.tp === 'funghi' ? FUN.s : PIA.s)[x.i][0]; if (v.has(n)) return false; v.add(n); return true; }); };
/* ---------- calendario naturalistico: cosa si vede in Sicilia mese per mese */
let calMese = new Date().getMonth();
async function calendario() {
  const [, S2] = await Promise.all([CAT, caricaStag()]); if (vista !== 'funghi' && vista !== 'piante') return;
  const m = calMese, prima = (m + 11) % 12;
  const tutte = [...FUN.s.map((r, i) => ['funghi', i, r[5] || 0]), ...PIA.s.map((r, i) => ['piante', i, r[6] || 0])].map(([tp, i, n]) => ({ tp, i, n, st: stagione(tp, i, m, S2) }));
  const on = tutte.filter(x => x.st.on === true).sort((a, b) => b.n - a.n);
  const k = x => x.tp === 'funghi' ? FUN.s[x.i][7] : PIA.s[x.i][4], nuove = on.filter(x => { const mk = S2[k(x)]; return mk && mk[prima] === '0'; });
  const sez = (tit, ic, l, max) => l.length ? `<h3>${ico(ic, 'sm')} ${tit} <em>${fmt(l.length)}</em></h3><div class="trova">${uniciNome(l).slice(0, max).map(x => `<button data-sp="${x.tp}:${x.i}">${icoSp(x.tp, x.i)}${esc(nomeC(x.tp, x.i) || (x.tp === 'funghi' ? FUN.s : PIA.s)[x.i][0])}</button>`).join('')}</div>` : '';
  $('cat').dataset.v = 'cal'; $('cat').scrollTop = 0;
  $('cat').innerHTML = `<div class="in cal"><div class="switch spsw" role="tablist">${['funghi', 'piante', 'cal'].map(x => `<button role="tab" data-specie="${x}" class="${x === 'cal' ? 'on' : ''}">${x === 'funghi' ? T('Funghi', 'Fungi') : x === 'piante' ? T('Piante', 'Plants') : T('Calendario', 'Calendar')}</button>`).join('')}</div>
    <h2>${T('Calendario della natura', 'Nature calendar')}</h2><p class="lead">${T('Cosa si vede in Sicilia mese per mese, secondo i mesi delle osservazioni su GBIF. Prima le specie più osservate.', 'What can be seen in Sicily month by month, from the months of GBIF records. Most recorded species first.')}</p>
    <select class="tendina mesesel" id="cal-m">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(j => `<option value="${j}"${j === m ? ' selected' : ''}>${nomeMese(j)[0].toUpperCase() + nomeMese(j).slice(1)}${j === new Date().getMonth() ? T(' (ora)', ' (now)') : ''}</option>`).join('')}</select>
    ${sez(T('Iniziano questo mese', 'Starting this month'), 'sparkles', nuove, 16)}
    ${sez(T('Fioriture', 'In flower'), 'flower', on.filter(x => x.tp === 'piante' && x.st.lab === T('in fioritura', 'in flower')), 30)}
    ${sez(T('Funghi in fruttificazione', 'Fungi fruiting'), 'mushroom', on.filter(x => x.tp === 'funghi'), 24)}
    ${sez(T('Foliage d’autunno', 'Autumn foliage'), 'leaf', on.filter(x => x.st.lab === T('foliage autunnale', 'autumn foliage')), 20)}
    <p class="note">${T('La stagione è stimata dalle osservazioni: il clima dell’anno e la quota possono anticiparla o ritardarla.', 'The season is estimated from records: the year’s weather and altitude can make it earlier or later.')}</p>${COPY()}</div>`;
  $('cal-m').onchange = e => { calMese = +e.target.value; calendario(); };
}
$('cat').addEventListener('click', e => { if ($('cat').dataset.v !== 'cal') return; const b = e.target.closest('[data-sp]'); if (!b) return; e.stopPropagation(); const [tp, i] = b.dataset.sp.split(':'); apriSpecie(tp, +i); }, true);
/* ---------- cosa vedere oggi qui (posizione del telefono o centro della mappa) */
async function oggiQui() {
  $('sh').innerHTML = `<div><h2>${T('Oggi qui intorno', 'Around here today')}</h2></div><button class="close" aria-label="${t('chiudi')}">×</button>`; $('sb').innerHTML = `<p class="note">${t('carico')}</p>`; mostra();
  const usa = async ll => {
    await Promise.all([D, CAT]); const S2 = await caricaStag(), A = await caricaPercorsi(), m = new Date().getMonth();
    const dist = (a, b) => hav(a, b) / 1000, R = 15;
    const vic = Object.entries(S).map(([k, z]) => ({ k, z, d: dist(ll, centro(z)) })).filter(x => x.d < R);
    const alberi = vic.filter(x => x.z.t === 'am' || x.z.t === 'bv').sort((a, b) => a.d - b.d).slice(0, 6);
    const aree = vic.filter(x => ['pn', 'pr', 'rn', 'ap'].includes(x.z.t)).sort((a, b) => a.d - b.d).slice(0, 4);
    const prc = A.map(p => ({ p, d: dist(ll, p.s) })).filter(x => x.d < R).sort((a, b) => a.d - b.d).slice(0, 5);
    const g = 0.09, q = tk => getJ(`https://api.gbif.org/v1/occurrence/search?decimalLatitude=${(ll[1] - g).toFixed(3)},${(ll[1] + g).toFixed(3)}&decimalLongitude=${(ll[0] - g * 1.3).toFixed(3)},${(ll[0] + g * 1.3).toFixed(3)}&taxonKey=${tk}&limit=0&facet=speciesKey&facetLimit=80`);
    const [jf, jp] = await Promise.all([q(5), q(7707728)]);
    const kf = {}; FUN.s.forEach((r, i) => kf[r[7]] = i); const kp = {}; PIA.s.forEach((r, i) => { if (r[4]) kp[r[4]] = i; });
    const sp = (j, idx, tp) => ((j && j.facets && j.facets[0] && j.facets[0].counts) || []).map(c => idx[+c.name]).filter(i => i != null).map(i => ({ tp, i, st: stagione(tp, i, m, S2) })).filter(x => x.st.on === true);
    const specie = [...sp(jp, kp, 'piante'), ...sp(jf, kf, 'funghi')];
    const bt = x => `<button data-sp="${x.tp}:${x.i}">${icoSp(x.tp, x.i)}${esc(nomeC(x.tp, x.i) || (x.tp === 'funghi' ? FUN.s : PIA.s)[x.i][0])}<small>${esc(x.st.lab)}</small></button>`;
    const riga = (attr, tit, sub, d) => `<button ${attr}><span><b>${esc(tit)}</b><small>${esc(sub)}</small></span><em>${num1(d)} km</em></button>`;
    $('sh').innerHTML = `<div><h2>${T('Oggi qui intorno', 'Around here today')}</h2><div class="badges"><span class="badge">${T('entro', 'within')} ${R} km · ${nomeMese(m)}</span></div></div><button class="close" aria-label="${t('chiudi')}">×</button>`;
    $('sb').innerHTML = `<div class="vic">
      ${specie.length ? `<h3>${ico('flower')} ${T('In stagione, segnalate qui', 'In season, recorded here')}</h3><div class="trova">${uniciNome(specie).slice(0, 20).map(bt).join('')}</div>` : ''}
      ${alberi.length ? `<h3>${ico('award')} ${T('Alberi monumentali e boschi antichi', 'Monumental trees and old forests')}</h3><div class="vlist">${alberi.map(x => riga(`data-id="${x.k}"`, x.z.n, t(x.z.t), x.d)).join('')}</div>` : ''}
      ${prc.length ? `<h3>${ico('route')} ${T('Percorsi che partono vicino', 'Trails starting nearby')}</h3><div class="vlist">${prc.map(x => riga(`data-prcv="${x.p.id}"`, x.p.n, `${num1(x.p.km)} km${x.p.c ? ' · ' + x.p.c : ''}`, x.d)).join('')}</div>` : ''}
      ${aree.length ? `<h3>${ico('trees')} ${T('Parchi e riserve', 'Parks and reserves')}</h3><div class="vlist">${aree.map(x => riga(`data-id="${x.k}"`, x.z.n, t(x.z.t), x.d)).join('')}</div>` : ''}
      ${!specie.length && !alberi.length && !prc.length && !aree.length ? `<p class="note">${T('Qui intorno non abbiamo trovato nulla: sposta la mappa su un’altra zona e riprova.', 'Nothing found around here: move the map to another area and try again.')}</p>` : ''}
      <p class="note">${T('Specie: segnalazioni GBIF entro circa 10 km, in stagione questo mese.', 'Species: GBIF records within about 10 km, in season this month.')}</p></div>`;
    mostra();
    $('sb').querySelector('.vic').onclick = e => { const b = e.target.closest('[data-sp]'), r = e.target.closest('[data-prcv]'); if (b) { const [tp, i] = b.dataset.sp.split(':'); apriSpecie(tp, +i); } else if (r) { modo.escursioni = 'mappa'; vai('escursioni'); setTimeout(() => apriPercorso(r.dataset.prcv), 300); } };
  };
  const c = map.getCenter(), ll0 = [c.lng, c.lat];
  if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => { const ll = [p.coords.longitude, p.coords.latitude]; usa(ll[0] > 11.9 && ll[0] < 15.7 && ll[1] > 35.4 && ll[1] < 38.9 ? ll : ll0); }, () => usa(ll0), { timeout: 8000, maximumAge: 60000 });
  else usa(ll0);
}
$('oggi').onclick = oggiQui;
/* ---------- itinerari per guide ed escursionisti: si disegnano toccando la mappa, il percorso segue sentieri e strade (BRouter, dati OpenStreetMap) */
const ITK = 'sn_itinerari', SITO = 'https://sicilia-naturale.netlify.app/';
const leggiIt = () => { try { return JSON.parse(localStorage.getItem(ITK)) || []; } catch (e) { return []; } };
const scriviIt = a => { try { localStorage.setItem(ITK, JSON.stringify(a)); return true; } catch (e) { toast(T('Memoria del telefono piena', 'Phone storage full')); return false; } };
const misIt = segs => { let km = 0, up = 0, dn = 0; for (const s of segs) { for (let i = 1; i < s.c.length; i++) km += hav(s.c[i - 1], s.c[i]) / 1000; up += s.up; dn += s.dn; } return { km, up: Math.round(up), dn: Math.round(dn), ore: km / 4 + up / 400 }; };
const oreS = h => { const m = Math.round(h * 60); return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0'); };
async function tratto(a, b) {
  const j = await fetch(`https://brouter.de/brouter?lonlats=${a[0].toFixed(5)},${a[1].toFixed(5)}|${b[0].toFixed(5)},${b[1].toFixed(5)}&profile=hiking-mountain&alternativeidx=0&format=geojson`).then(r => r.ok ? r.json() : null).catch(() => null);
  const f = j && j.features && j.features[0];
  if (!f) return { c: [[a[0], a[1], null], [b[0], b[1], null]], up: 0, dn: 0, dritto: true };
  const up = +f.properties['filtered ascend'] || 0, net = +f.properties['plain-ascend'] || 0;
  return { c: f.geometry.coordinates.map(q => [+q[0].toFixed(5), +q[1].toFixed(5), q[2] != null ? Math.round(q[2]) : null]), up, dn: Math.max(0, up - net) };
}
function pianSorg() {
  if (map.getSource('pian')) return;
  map.addSource('pian', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({ id: 'pian-c', type: 'line', source: 'pian', filter: ['==', '$type', 'LineString'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#fff', 'line-width': 9, 'line-opacity': 0.9 } });
  map.addLayer({ id: 'pian-l', type: 'line', source: 'pian', filter: ['all', ['==', '$type', 'LineString'], ['!=', 'dritto', true]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#be185d', 'line-width': 5 } });
  map.addLayer({ id: 'pian-d', type: 'line', source: 'pian', filter: ['all', ['==', '$type', 'LineString'], ['==', 'dritto', true]], layout: { 'line-join': 'round' }, paint: { 'line-color': '#be185d', 'line-width': 4, 'line-dasharray': [1.5, 1.5] } });
  map.addLayer({ id: 'pian-p', type: 'circle', source: 'pian', filter: ['==', '$type', 'Point'], paint: { 'circle-radius': 8, 'circle-color': ['case', ['==', ['get', 'i'], 0], '#15803d', '#be185d'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 2.5 } });
  map.addLayer({ id: 'pian-n', type: 'symbol', source: 'pian', filter: ['==', '$type', 'Point'], layout: { 'text-field': ['to-string', ['+', ['get', 'i'], 1]], 'text-size': 10, 'text-font': ['Noto Sans Regular'], 'text-allow-overlap': true }, paint: { 'text-color': '#fff' } });
}
function disegnaIt(tappe, segs) {
  pianSorg();
  map.getSource('pian').setData({ type: 'FeatureCollection', features: [...segs.map(s => ({ type: 'Feature', properties: { dritto: !!s.dritto }, geometry: { type: 'LineString', coordinates: s.c.map(q => [q[0], q[1]]) } })),
    ...tappe.map((q, i) => ({ type: 'Feature', properties: { i }, geometry: { type: 'Point', coordinates: q } }))] });
}
function pianUI() {
  const m = misIt(PIAN.segs), n = PIAN.tappe.length;
  $('pian').innerHTML = `<div class="pi-h"><b>${PIAN.id ? T('Modifica itinerario', 'Edit itinerary') : T('Nuovo itinerario', 'New itinerary')}</b><button class="close" id="pi-x" aria-label="${t('chiudi')}">×</button></div>
    <p class="note">${PIAN.calc ? T('Calcolo il percorso…', 'Working out the route…') : n ? T('Tocca la mappa per la tappa successiva. Il percorso segue sentieri e strade.', 'Tap the map for the next stop. The route follows trails and roads.') : T('Tocca la mappa nel punto di partenza.', 'Tap the map at the starting point.')}</p>
    ${n > 1 ? `<div class="kpi"><div><b>${num1(m.km)}</b><span>km</span></div><div><b>+${fmt(m.up)}</b><span>m D+</span></div><div><b>−${fmt(m.dn)}</b><span>m D−</span></div><div><b>${oreS(m.ore)}</b><span>${T('tempo', 'time')}</span></div></div>` : ''}
    ${PIAN.segs.some(s => s.dritto) ? `<p class="note">${T('Tratteggio: senza rete o sentiero non trovato, linea dritta.', 'Dashed: no network or no trail found, straight line.')}</p>` : ''}
    ${n > 1 ? `<input id="pi-n" maxlength="80" placeholder="${T('Nome dell’itinerario', 'Itinerary name')}" value="${esc(PIAN.n || '')}">` : ''}
    <div class="pi-b"><button id="pi-u"${n ? '' : ' disabled'}>${ico('arrow-back-up', 'sm')} ${T('Togli tappa', 'Undo stop')}</button><button class="fatto" id="pi-ok"${n > 1 && !PIAN.calc ? '' : ' disabled'}>${T('Salva', 'Save')}</button></div>`;
}
function nuovoIt(dati) {
  chiudi(); PIAN = Object.assign({ tappe: [], segs: [], n: '', id: null, calc: false }, dati || {});
  document.body.classList.add('pianon'); vediPanoramica(); pianUI(); disegnaIt(PIAN.tappe, PIAN.segs);
  if (PIAN.tappe.length) { const lo = PIAN.tappe.map(q => q[0]), la = PIAN.tappe.map(q => q[1]); map.fitBounds([[Math.min(...lo), Math.min(...la)], [Math.max(...lo), Math.max(...la)]], { padding: { top: 60, bottom: 260, left: 40, right: 40 }, maxZoom: 15, duration: 600 }); }
  else if (map.getZoom() < 12) toast(T('Avvicinati alla zona e tocca il punto di partenza', 'Zoom in and tap the starting point'));
}
function esciIt() { PIAN = null; document.body.classList.remove('pianon'); vediPanoramica(); if (map.getSource('pian')) disegnaIt([], []); if (vista === 'escursioni') escursioni(); }
async function pianClick(e) {
  if (PIAN.calc) return;
  const q = [+e.lngLat.lng.toFixed(5), +e.lngLat.lat.toFixed(5)], prev = PIAN.tappe[PIAN.tappe.length - 1];
  PIAN.tappe.push(q); disegnaIt(PIAN.tappe, PIAN.segs);
  if (prev) { PIAN.calc = true; pianUI(); const s = await tratto(prev, q); if (!PIAN) return; PIAN.segs.push(s); PIAN.calc = false; disegnaIt(PIAN.tappe, PIAN.segs); }
  pianUI();
}
async function ricalcolaIt(tappe) { const segs = []; for (let i = 1; i < tappe.length; i++) segs.push(await tratto(tappe[i - 1], tappe[i])); return segs; }
$('pian').addEventListener('input', e => { if (e.target.id === 'pi-n' && PIAN) PIAN.n = e.target.value; });
$('pian').addEventListener('click', e => {
  if (!PIAN) return;
  if (e.target.closest('#pi-x')) { if (PIAN.tappe.length > 1 && !confirm(T('Uscire senza salvare?', 'Leave without saving?'))) return; return esciIt(); }
  if (e.target.closest('#pi-u')) { PIAN.tappe.pop(); if (PIAN.segs.length >= PIAN.tappe.length && PIAN.segs.length) PIAN.segs.pop(); disegnaIt(PIAN.tappe, PIAN.segs); return pianUI(); }
  if (e.target.closest('#pi-ok')) {
    const a = leggiIt(), m = misIt(PIAN.segs), x = { id: PIAN.id || 'I' + Date.now(), n: (PIAN.n || '').trim() || T('Itinerario del ', 'Itinerary of ') + new Date().toLocaleDateString(LANG === 'it' ? 'it-IT' : 'en-GB'), t: Date.now(), tappe: PIAN.tappe, segs: PIAN.segs, km: m.km, up: m.up, dn: m.dn };
    const i = a.findIndex(y => y.id === x.id); if (i >= 0) a[i] = x; else a.unshift(x);
    if (!scriviIt(a)) return;
    esciIt(); toast(T('Itinerario salvato', 'Itinerary saved')); apriIt(x.id);
  }
});
// l'itinerario come "percorso" per riusare meteo, zona e "Cosa puoi trovare" della scheda percorso
function comePercorso(x) {
  const g = x.segs.flatMap(s => s.c), lo = g.map(q => q[0]), la = g.map(q => q[1]);
  return { id: x.id + '-' + x.t, n: x.n, g: [g.map(q => [q[0], q[1]])], s: x.tappe[0], bb: [Math.min(...lo), Math.min(...la), Math.max(...lo), Math.max(...la)], km: x.km, up: x.up, dn: x.dn };
}
function profiloIt(x) {
  const g = x.segs.flatMap(s => s.c); let d = 0; const xs = [], z = [];
  g.forEach((q, i) => { if (i) d += hav(g[i - 1], q) / 1000; if (q[2] != null) { xs.push(d); z.push(q[2]); } });
  return { d: xs, z };
}
function svgProfilo(pr) {
  if (pr.z.length < 2) return '';
  const W = 320, H = 90, mn = Math.min(...pr.z), mx = Math.max(...pr.z), L = pr.d[pr.d.length - 1] || 1, X = v => 4 + (W - 8) * v / L, Y = v => H - 14 - (H - 26) * (v - mn) / Math.max(1, mx - mn);
  const step = Math.max(1, Math.floor(pr.z.length / 160)), lin = pr.z.map((v, i) => i % step ? null : `${X(pr.d[i]).toFixed(1)},${Y(v).toFixed(1)}`).filter(Boolean).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><polygon points="${X(0)},${H - 14} ${lin} ${X(L)},${H - 14}" fill="rgba(190,24,93,.15)"/><polyline points="${lin}" fill="none" stroke="#be185d" stroke-width="2"/><text x="4" y="10" font-size="9" fill="#667">${fmt(Math.round(mx))} m</text><text x="4" y="${H - 2}" font-size="9" fill="#667">${fmt(Math.round(mn))} m</text><text x="${W - 4}" y="${H - 2}" font-size="9" fill="#667" text-anchor="end">${num1(L)} km</text></svg>`;
}
function apriIt(id) {
  const x = leggiIt().find(y => y.id === id); if (!x) return;
  const p = comePercorso(x), ore = x.km / 4 + x.up / 400;
  cur = null; disegnaIt(x.tappe, x.segs);
  $('sh').innerHTML = `<div><h2>${esc(x.n)}</h2><div class="badges"><span class="badge it">${T('Il mio itinerario', 'My itinerary')}</span></div></div><button class="close" aria-label="${t('chiudi')}">×</button>`;
  $('sb').innerHTML = `<div class="kpi"><div><b>${num1(x.km)}</b><span>km</span></div><div><b>+${fmt(x.up)}</b><span>m D+</span></div><div><b>−${fmt(x.dn)}</b><span>m D−</span></div><div><b>${oreS(ore)}</b><span>${T('tempo', 'time')}</span></div></div>
    <div class="profilo">${svgProfilo(profiloIt(x))}</div>
    <p class="note">${T(`${x.tappe.length} tappe. Tempo stimato per un escursionista medio: 4 km/h in piano più 1 ora ogni 400 m di salita, soste escluse.`, `${x.tappe.length} stops. Estimated time for an average hiker: 4 km/h on the flat plus 1 hour every 400 m of ascent, breaks excluded.`)}</p>
    <div class="az"><a class="btnl" href="https://www.google.com/maps/dir/?api=1&destination=${x.tappe[0][1]},${x.tappe[0][0]}" target="_blank" rel="noopener">${T('Portami alla partenza', 'Directions to start')}</a><button class="btnl" data-itaz="pdf">${ico('printer')} ${T('Scheda PDF', 'PDF sheet')}</button></div>
    <div class="az2"><button data-itaz="link">${ico('link', 'sm')} ${T('Copia link', 'Copy link')}</button><button data-itaz="wa">WhatsApp</button><button data-itaz="gpx">GPX</button><button data-itaz="mod">${ico('pencil', 'sm')} ${T('Modifica', 'Edit')}</button><button data-itaz="del">${t('elimina')}</button></div>
    <h3>${T('Meteo alla partenza', 'Weather at the start')}</h3><div class="pcmeteo" id="pc-met"><small class="note">${t('carico')}</small></div>
    <div id="pc-zona"></div>
    <h3>${T('Cosa puoi trovare', 'What you may find')}</h3><div id="pc-trova"><small class="note">${t('carico')}</small></div>
    <p class="note">${T('Percorso calcolato su sentieri e strade di OpenStreetMap (ODbL) con BRouter. Verifica sempre sul posto segnaletica, meteo e condizioni del sentiero.', 'Route calculated on OpenStreetMap trails and roads (ODbL) with BRouter. Always check signs, weather and trail conditions on site.')}</p>
    ${isApp ? `<div class="cta"><button id="it-segui">${ico('navigation')}${T('Segui l’itinerario', 'Follow this itinerary')}</button></div>` : ''}`;
  $('sb').dataset.it = id; mostra();
  meteoPercorso(p); zonaPercorso(p); trovaPercorso(p);
  if ($('it-segui')) $('it-segui').onclick = () => avviaReg({ id: p.id, n: x.n, g: p.g, prof: profiloIt(x) });
  inquadra(p.bb, 15.5);
}
const linkIt = x => (isApp || !/^https?:/.test(location.protocol) ? SITO : location.origin + location.pathname) + '#it=' + encodeURIComponent(x.n) + '@' + x.tappe.map(q => q[0].toFixed(5) + ',' + q[1].toFixed(5)).join(';');
function gpxIt(x) {
  const g = x.segs.flatMap(s => s.c);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Sicilia Naturale" xmlns="http://www.topografix.com/GPX/1/1"><metadata><name>${esc(x.n)}</name></metadata>${x.tappe.map((q, i) => `<wpt lat="${q[1]}" lon="${q[0]}"><name>${i + 1}</name></wpt>`).join('')}<trk><name>${esc(x.n)}</name><trkseg>${g.map(q => `<trkpt lat="${q[1]}" lon="${q[0]}">${q[2] != null ? `<ele>${q[2]}</ele>` : ''}</trkpt>`).join('')}</trkseg></trk></gpx>`;
}
document.addEventListener('click', async e => {
  const nb = e.target.closest('#it-nuovo'); if (nb) return nuovoIt();
  const ob = e.target.closest('[data-iti]'); if (ob) return apriIt(ob.dataset.iti);
  const b = e.target.closest('[data-itaz]'); if (!b) return;
  const id = $('sb').dataset.it, x = leggiIt().find(y => y.id === id); if (!x) return;
  const az = b.dataset.itaz, file = x.n.replace(/[^\w\-àèéìòù ]+/gi, '').trim().replace(/\s+/g, '-').toLowerCase() || 'itinerario';
  if (az === 'gpx') return scarica(gpxIt(x), file + '.gpx', 'application/gpx+xml');
  if (az === 'link') { const u = linkIt(x); try { await navigator.clipboard.writeText(u); toast(T('Link copiato', 'Link copied')); } catch (er) { prompt(T('Copia il link', 'Copy the link'), u); } return; }
  if (az === 'wa') { const a = document.createElement('a'); a.href = 'https://wa.me/?text=' + encodeURIComponent(x.n + ' · ' + num1(x.km) + ' km, +' + fmt(x.up) + ' m\n' + linkIt(x)); a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); return; }
  if (az === 'mod') return nuovoIt({ id: x.id, n: x.n, tappe: x.tappe.map(q => [...q]), segs: x.segs });
  if (az === 'del') { if (!confirm(T('Eliminare questo itinerario?', 'Delete this itinerary?'))) return; scriviIt(leggiIt().filter(y => y.id !== id)); chiudi(); disegnaIt([], []); if (vista === 'escursioni') escursioni(); return; }
  if (az === 'pdf') { b.disabled = true; try { await pdfIt(x); } catch (er) { toast(T('PDF non riuscito', 'PDF failed')); } b.disabled = false; }
});
// link condiviso: #it=Nome@lon,lat;lon,lat… → si ricalcola il percorso e si può salvare
async function apriLinkIt(s) {
  const at = s.lastIndexOf('@'); if (at < 0) return;
  const n = decodeURIComponent(s.slice(0, at)), tappe = s.slice(at + 1).split(';').map(c => c.split(',').map(Number)).filter(q => q.length === 2 && q.every(isFinite)).slice(0, 60);
  if (tappe.length < 2) return;
  try { history.replaceState(null, '', location.pathname); } catch (e) {}
  if (vista !== 'escursioni') vai('escursioni');
  nuovoIt({ n, tappe, segs: [], calc: true }); pianUI();
  const segs = await ricalcolaIt(tappe); if (!PIAN) return; PIAN.segs = segs; PIAN.calc = false; disegnaIt(PIAN.tappe, segs); pianUI();
  toast(T('Itinerario condiviso: salvalo per ritrovarlo', 'Shared itinerary: save it to keep it'));
}
// scheda PDF stampabile: mappa, numeri, profilo, tappe, avvertenze
const libPdf = () => window.jspdf ? Promise.resolve(window.jspdf) : new Promise((ok, ko) => { const s = document.createElement('script'); s.src = 'lib/jspdf.umd.min.js'; s.onload = () => ok(window.jspdf); s.onerror = ko; document.head.appendChild(s); });
function fotoMappa(x) {
  return new Promise(ok => {
    const p = comePercorso(x), r = map.getContainer().getBoundingClientRect(), R = 1.5, banda = Math.min(r.height, r.width / R), pv = Math.max(20, (r.height - banda) / 2 + 20);
    disegnaIt(x.tappe, x.segs);
    map.fitBounds([[p.bb[0], p.bb[1]], [p.bb[2], p.bb[3]]], { padding: { top: pv, bottom: pv, left: 24, right: 24 }, maxZoom: 15, duration: 0 });
    const fine = setTimeout(() => ok(null), 12000);
    map.once('idle', () => { map.once('render', () => { clearTimeout(fine); try {
      const c = map.getCanvas(), k = c.width / r.width, ch = Math.round(banda * k), o = document.createElement('canvas'); o.width = c.width; o.height = ch;
      o.getContext('2d').drawImage(c, 0, Math.round((c.height - ch) / 2), c.width, ch, 0, 0, c.width, ch);
      ok({ u: o.toDataURL('image/jpeg', 0.85), w: o.width, h: o.height });
    } catch (e) { ok(null); } }); map.triggerRepaint(); });
  });
}
async function pdfIt(x) {
  toast(T('Preparo la scheda…', 'Preparing the sheet…'));
  const [{ jsPDF }, img] = await Promise.all([libPdf(), fotoMappa(x)]);
  const d = new jsPDF({ unit: 'mm', format: 'a4' }), W = 210, M = 14, it = LANG === 'it', ore = x.km / 4 + x.up / 400, pr = profiloIt(x);
  const txt = s => String(s).replace(/−/g, '-');
  d.setFillColor(20, 61, 43); d.rect(0, 0, W, 24, 'F'); d.setTextColor(255); d.setFont('helvetica', 'bold'); d.setFontSize(9); d.text('SICILIA NATURALE', M, 9);
  d.setFontSize(16); d.text(txt(d.splitTextToSize(x.n, W - 2 * M)[0]), M, 18);
  d.setTextColor(30); d.setFontSize(10); d.setFont('helvetica', 'normal');
  const k = [[num1(x.km) + ' km', it ? 'lunghezza' : 'length'], ['+' + fmt(x.up) + ' m', it ? 'salita' : 'ascent'], ['-' + fmt(x.dn) + ' m', it ? 'discesa' : 'descent'], [oreS(ore), it ? 'tempo stimato' : 'est. time']];
  k.forEach(([v, l], i) => { const xx = M + i * (W - 2 * M) / 4; d.setFont('helvetica', 'bold'); d.setFontSize(14); d.text(v, xx, 34); d.setFont('helvetica', 'normal'); d.setFontSize(8); d.setTextColor(110); d.text(l, xx, 39); d.setTextColor(30); });
  let y = 44;
  if (img) { const w = W - 2 * M, h = w * img.h / img.w; d.addImage(img.u, 'JPEG', M, y, w, h); d.setDrawColor(200); d.rect(M, y, w, h); y += h + 3; d.setFontSize(7); d.setTextColor(120); d.text('Mappa: OpenStreetMap, OpenFreeMap, Mapzen Terrarium · Sicilia Naturale', M, y + 2); d.setTextColor(30); y += 7; }
  if (pr.z.length > 1) {
    const h = 30, w = W - 2 * M, mn = Math.min(...pr.z), mx = Math.max(...pr.z), L = pr.d[pr.d.length - 1] || 1, step = Math.max(1, Math.floor(pr.z.length / 300));
    d.setFont('helvetica', 'bold'); d.setFontSize(10); d.text(it ? 'Profilo altimetrico' : 'Elevation profile', M, y); y += 3;
    d.setDrawColor(220); d.rect(M, y, w, h); d.setDrawColor(190, 24, 93); d.setLineWidth(0.5);
    let pv = null; pr.z.forEach((v, i) => { if (i % step) return; const px = M + w * pr.d[i] / L, py = y + h - 2 - (h - 4) * (v - mn) / Math.max(1, mx - mn); if (pv) d.line(pv[0], pv[1], px, py); pv = [px, py]; });
    d.setLineWidth(0.2); d.setFont('helvetica', 'normal'); d.setFontSize(7); d.setTextColor(110); d.text(fmt(Math.round(mx)) + ' m', M + 1, y + 3.5); d.text(fmt(Math.round(mn)) + ' m', M + 1, y + h - 1); d.text(num1(L) + ' km', M + w - 1, y + h - 1, { align: 'right' }); d.setTextColor(30); y += h + 8;
  }
  const riga = (s, sz, bold) => { d.setFont('helvetica', bold ? 'bold' : 'normal'); d.setFontSize(sz); for (const l of d.splitTextToSize(txt(s), W - 2 * M)) { if (y > 282) { d.addPage(); y = 18; } d.text(l, M, y); y += sz * 0.45; } };
  riga(it ? 'Tappe' : 'Stops', 10, true); y += 1;
  let km = 0; x.tappe.forEach((q, i) => { if (i) km += x.segs[i - 1] ? x.segs[i - 1].c.reduce((s, c, j, a) => j ? s + hav(a[j - 1], c) / 1000 : 0, 0) : 0; const z = i ? (x.segs[i - 1].c[x.segs[i - 1].c.length - 1] || [])[2] : (x.segs[0].c[0] || [])[2]; riga(`${i + 1}.  ${q[1].toFixed(5)}, ${q[0].toFixed(5)}   ·   km ${num1(km)}${z != null ? '   ·   ' + fmt(z) + ' m' : ''}`, 9); });
  y += 2; d.setTextColor(29, 78, 216); d.setFontSize(9); d.textWithLink(it ? 'Indicazioni per la partenza (Google Maps)' : 'Directions to the start (Google Maps)', M, y, { url: `https://www.google.com/maps/dir/?api=1&destination=${x.tappe[0][1]},${x.tappe[0][0]}` }); y += 5;
  d.textWithLink(it ? 'Apri l’itinerario in Sicilia Naturale' : 'Open the itinerary in Sicilia Naturale', M, y, { url: linkIt(x) }); d.setTextColor(30); y += 7;
  riga(it ? 'Tempo stimato per un escursionista medio: 4 km/h in piano più 1 ora ogni 400 m di salita, soste escluse. Percorso calcolato su sentieri e strade di OpenStreetMap (ODbL) con BRouter: verifica sempre segnaletica, meteo e condizioni del sentiero. In emergenza chiama il 112 e comunica la tua posizione.' : 'Estimated time for an average hiker: 4 km/h on the flat plus 1 hour every 400 m of ascent, breaks excluded. Route calculated on OpenStreetMap trails and roads (ODbL) with BRouter: always check signs, weather and trail conditions. In an emergency call 112 and give your position.', 8);
  const pg = d.getNumberOfPages(); for (let i = 1; i <= pg; i++) { d.setPage(i); d.setFontSize(7); d.setTextColor(130); d.text(`© ${new Date().getFullYear()} Oscar Cangelosi · Sicilia Naturale · ${new Date().toLocaleDateString(it ? 'it-IT' : 'en-GB')}`, M, 291); d.text(`${i}/${pg}`, W - M, 291, { align: 'right' }); }
  const blob = d.output('blob'), u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = (x.n.replace(/[^\w\-àèéìòù ]+/gi, '').trim().replace(/\s+/g, '-').toLowerCase() || 'itinerario') + '.pdf'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 10000);
  inquadra(comePercorso(x).bb, 15.5);
}
{ const h = location.hash.slice(1); if (h.startsWith('it=')) D.then(() => setTimeout(() => apriLinkIt(h.slice(3)), 600)); }
}
