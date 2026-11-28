/* Sicilia Naturale - anteprima mappa e schede zona.
   Mappa di base impacchettata in tiles/*.txt (OpenFreeMap + rilievo Terrarium), servita con il protocollo loc://.
   Dati zone: data/*.json preparati da tools/costruisci_dati.py (fonti EEA). */
{
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const T = (it, en) => LANG === 'it' ? it : en;
// nota di proprietà, in fondo alle pagine e ai Livelli
let UPD = '';  // stato degli aggiornamenti automatici, mostrato nel piè di pagina
const COPY = () => (() => { try { return altreSez(); } catch (e) { return ''; } })() + (isApp ? '' : '<p class="serv5"><button data-pag="glossario">Glossario</button><button data-pag="metodo">Metodo e fonti</button></p>') + `<p class="copy">© ${new Date().getFullYear()} Oscar Cangelosi · Sicilia Naturale · ${T('versione', 'version')} ${(window.SN_VER || {}).v || ''}${UPD ? ' (' + esc(UPD) + ')' : ''}. ${T('Tutti i diritti riservati su app, testi, grafica e progetto. Dati e immagini di terzi appartengono ai rispettivi titolari e sono usati secondo le loro licenze.', 'All rights reserved on app, texts, design and project. Third-party data and images belong to their owners and are used under their licences.')}</p>`;
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
    tFunghi: 'Micologia siciliana', lFunghi: n => `${fmt(n)} specie di funghi segnalate in Sicilia (segnalazioni GBIF). Tocca una specie per la scheda, le foto e dove è stata trovata.`,
    tPiante: 'Botanica siciliana', lPiante: n => `${fmt(n)} piante vascolari della Sicilia: quelle dei siti Natura 2000, degli alberi monumentali e dei boschi da seme, più tutte le altre segnalate in Sicilia su GBIF. Tocca una specie per la scheda e i luoghi dove cresce.`, famiglia: 'Famiglia', tutteFam: 'Tutte le famiglie', inN2k: 'Nei siti Natura 2000', torna: 'Torna a',
    cercaSp: 'Cerca per nome comune o scientifico, genere, famiglia…', tutte: 'Tutte', conFoto: 'Con foto', alberi: 'Alberi e arbusti', nSp: n => `${fmt(n)} specie`, altri: 'Mostra altre',
    GF: { aga: 'A lamelle', bol: 'Boleti', rus: 'Russule e lattari', pol: 'Polipori e funghi del legno', can: 'Cantarelli, idni e clavarie', pez: 'Spugnole, pezize e tartufi', pal: 'Vesce, geastri e falli', gel: 'Gelatinosi', alt: 'Altri' },
    segn: n => `${fmt(n)} segnalazioni in Sicilia`, nsiti: n => n === 1 ? '1 sito Natura 2000' : `${fmt(n)} siti Natura 2000`,
    dove: 'Dove si trova', vediMappa: 'Vedi sulla mappa dove è stata segnalata', gbifChip: 'Segnalazioni GBIF:',
    nocomm: 'Sicilia Naturale non dà indicazioni sulla commestibilità. Per il consumo rivolgiti sempre a un ispettorato micologico.',
    fotoMic: '', gbif: 'Scheda su GBIF',
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
    tFunghi: 'Sicilian mycology', lFunghi: n => `${fmt(n)} fungus species recorded in Sicily (GBIF records). Tap a species for its page, photos and where it was found.`,
    tPiante: 'Sicilian botany', lPiante: n => `${fmt(n)} vascular plants of Sicily: those of the Natura 2000 sites, monumental trees and seed stands, plus all others recorded in Sicily on GBIF. Tap a species for its page and the places where it grows.`, famiglia: 'Family', tutteFam: 'All families', inN2k: 'In Natura 2000 sites', torna: 'Back to',
    cercaSp: 'Search by common or scientific name, genus, family…', tutte: 'All', conFoto: 'With photos', alberi: 'Trees and shrubs', nSp: n => `${fmt(n)} species`, altri: 'Show more',
    GF: { aga: 'Gilled', bol: 'Boletes', rus: 'Russulas and milkcaps', pol: 'Polypores and wood fungi', can: 'Chanterelles, hedgehogs and corals', pez: 'Morels, cups and truffles', pal: 'Puffballs, earthstars and stinkhorns', gel: 'Jelly fungi', alt: 'Others' },
    segn: n => `${fmt(n)} records in Sicily`, nsiti: n => n === 1 ? '1 Natura 2000 site' : `${fmt(n)} Natura 2000 sites`,
    dove: 'Where it grows', vediMappa: 'Show on the map where it was recorded', gbifChip: 'GBIF records:',
    nocomm: 'Sicilia Naturale gives no information on edibility. Always ask a mycological inspectorate before eating any fungus.',
    fotoMic: '', gbif: 'Page on GBIF',
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
/* sul sito, finché una pagina copre la mappa (inizio, schede, catalogo) i pezzi di mappa non si scaricano:
   si aspetta che la mappa diventi visibile. Così la prima pagina pesa circa 2 MB invece di 13. */
// all'avvio la mappa resta ferma finché non si sa quale pagina si apre (1,5 s al massimo)
let mappaAvvio = !window.Capacitor; setTimeout(() => { mappaAvvio = false; liberaMappa(); }, 1500);
const mappaCoperta = () => !window.Capacitor && (mappaAvvio || (document.body.classList.contains('cat-on') && !document.body.classList.contains('mm')));
let attesaMappa = [];
const liberaMappa = () => { if (attesaMappa.length && !mappaCoperta()) attesaMappa.splice(0).forEach(f => f()); };
new MutationObserver(liberaMappa).observe(document.body, { attributes: true, attributeFilter: ['class'] });
const mappaVisibile = () => mappaCoperta() ? new Promise(r => attesaMappa.push(r)) : null;
maplibregl.addProtocol('loc', async params => {
  const k = decodeURIComponent(params.url.slice(6)); // v/z/x/y, d/z/x/y, g/font/range
  const p = k.split('/');
  { const w = mappaVisibile(); if (w) await w; }
  let name = 'base';
  if (p[0] === 'f') { const s = +p[1] - 9; name = 'cf_' + (p[2] >> s) + '_' + (p[3] >> s); }
  else if (p[0] === 's') { const s = +p[1] - 9; name = 'st_' + (p[2] >> s) + '_' + (p[3] >> s); }
  else if (p[0] !== 'g') { const z = +p[1]; if (z === 8) name = 'm_' + (p[2] >> 1) + '_' + (p[3] >> 1); else if (z === 9) name = 'c8_' + (p[2] >> 1) + '_' + (p[3] >> 1); else if (z > 9) { const s = z - 9; name = 'c9_' + (p[2] >> s) + '_' + (p[3] >> s); } } // pacchetti piccoli per zoom: tools/ridividi_tiles.py
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
/* Bollino di pericolo (deciso da Oscar il 28/11/2026): si segnalano SOLO le specie velenose o mortali, mai quelle commestibili.
   Elenco prudente, dalla letteratura micologica italiana; l'assenza del bollino non vuol dire che una specie sia commestibile. */
const PERICOLO = {
  mortale: ['Amanita phalloides', 'Amanita verna', 'Lepiota subincarnata', 'Lepiota castanea', 'Galerina marginata'],
  velenoso: ['Amanita pantherina', 'Amanita muscaria', 'Amanita gemmata', 'Amanita proxima', 'Rubroboletus satanas', 'Rubroboletus legaliae', 'Rubroboletus rhodoxanthus',
    'Entoloma sinuatum', 'Omphalotus olearius', 'Agaricus xanthodermus', 'Clitocybe rivulosa', 'Clitocybe phyllophila', 'Tricholoma equestre', 'Hypholoma fasciculare',
    'Chlorophyllum molybdites', 'Scleroderma verrucosum', 'Mycena pura'],
  generi: { Inocybe: 'velenoso' }
};
const pericolo = (tipo, i) => { if (tipo !== 'funghi' || !FUN) return ''; const n = FUN.s[i][0];
  return PERICOLO.mortale.includes(n) ? 'mortale' : PERICOLO.velenoso.includes(n) ? 'velenoso' : PERICOLO.generi[n.split(' ')[0]] || ''; };
const PERN = { mortale: ['Mortale', 'Deadly'], velenoso: ['Velenoso', 'Poisonous'] };
const bollino = p => p ? `<span class="tag peric ${p}">${ico('alert-triangle', 'xs')}${T(...PERN[p])}</span>` : '';

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
  if (sapOn()) { sapNav(); $('q').placeholder = 'Cerca un dolce, un prodotto, un paese'; }
  if (cur && !String(cur).startsWith('SAP:')) apri(cur, false);
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
// confronto tollerante: "porcino" trova anche "porcini", "arancina" anche "arancine"
const contiene = (n, x) => n.includes(x.length > 4 ? x.slice(0, -1) : x);
$('q').oninput = () => {
  const v = norm($('q').value.trim()); $('qx').style.display = v ? 'block' : 'none';
  if (v.length < 2) { $('res').style.display = 'none'; return; }
  chiudiLiv();
  if (sapOn()) return sapCerca(v);
  const w = v.split(/\s+/);
  const r = Object.entries(S).filter(([k, s]) => { const n = norm(s.n + ' ' + k + ' ' + (s.sp || '') + ' ' + (s.vg || '') + ' ' + (s.com || '')); return w.every(x => contiene(n, x)); })
    .sort((a, b) => (AREE.includes(b[1].t) - AREE.includes(a[1].t)) || b[1].ha - a[1].ha).slice(0, 30);
  // anche le specie (nome comune, siciliano o scientifico): la casella promette "un parco, un sentiero, una specie"
  const sp = [];
  if (FUN && PIA && v.length > 2) for (const [tp, D] of [['funghi', FUN], ['piante', PIA]]) D.s.forEach((x, i) => { const k = tp === 'funghi' ? x[7] : x[4]; const n = norm(x[0] + ' ' + (NOMI[k] || []).join(' ')); if (w.every(y => contiene(n, y))) sp.push([tp, i, nomeC(tp, i), x[0], tp === 'funghi' ? x[6] : 0]); });
  sp.sort((a, b) => (!!b[2] - !!a[2]) || b[4] - a[4]);
  const rs = r.map(([k, s]) => `<button data-id="${k}">${esc(s.n)}<small>${t(s.t)}${s.vg ? ' · ' + esc(s.vg) : ''}${s.ha ? ' · ' + fmt(s.ha) + ' ha' : s.com ? ' · ' + esc(s.com) : ''}</small></button>`).join('')
    + sp.slice(0, 8).map(([tp, i, c, sc]) => `<button data-spr="${tp}:${i}">${esc(c || sc)}<small>${tp === 'funghi' ? T('Fungo', 'Fungus') : T('Pianta', 'Plant')}${c ? ' · <i>' + esc(sc) + '</i>' : ''}${(p => p ? ' · <b class="peric-t">' + T(...PERN[p]).toLowerCase() + '</b>' : '')(pericolo(tp, i))}</small></button>`).join('');
  $('res').innerHTML = rs || `<button disabled>${t('nessuno')}</button>`;
  $('res').style.display = 'block';
};
$('res').onclick = e => { const s = e.target.closest('button[data-spr]'); if (s) { $('res').style.display = 'none'; $('q').blur(); const [tp, i] = s.dataset.spr.split(':'); return apriSpecie(tp, +i); }
  const b = e.target.closest('button[data-id]'); if (!b) return; $('res').style.display = 'none'; $('q').blur(); apri(b.dataset.id, true); };
$('qx').onclick = () => { $('q').value = ''; $('q').oninput(); $('q').focus(); };

/* ---------- click sulla mappa */
map.on('click', e => {
  chiudiLiv();
  if (document.body.classList.contains('recon')) return;
  if (sapOn()) return sapClick(e);
  if (misto() && TEMI.has('sapori') && map.getLayer('sap-p') && map.queryRenderedFeatures([[e.point.x - 8, e.point.y - 8], [e.point.x + 8, e.point.y + 8]], { layers: ['sap-c', 'sap-p'] }).length) return sapClick(e);
  if (PIAN) return pianClick(e);
  if (ON.osm && map.getLayer('osm-r')) {
    const pad = 7, bx = [[e.point.x - pad, e.point.y - pad], [e.point.x + pad, e.point.y + pad]];
    const po = map.queryRenderedFeatures(bx, { layers: ['osm-p'] });
    if (po.length && !isApp) { SAP.ancora = [e.originalEvent.clientX, e.originalEvent.clientY]; return cartaPunto(po[0].properties, po[0].geometry.coordinates); }
    if (po.length) { const q = po[0].properties; new maplibregl.Popup({ offset: 12 }).setLngLat(po[0].geometry.coordinates).setHTML(`<div class="wpp"><b>${esc(q.n || T(...POIN[q.t]))}</b><small>${esc(T(...POIN[q.t]))}${q.e ? ' · ' + fmt(q.e) + ' m' : ''}</small>${gmapsLink(po[0].geometry.coordinates)}<div class="poiph"></div></div>`).addTo(map); fotoPunto(po[0].geometry.coordinates); return; }
    const pr = map.queryRenderedFeatures(bx, { layers: ['osm-r', ...(map.getLayer('prv') && vista === 'escursioni' ? ['prv'] : [])] });
    if (pr.length) { if (!isApp) { SAP.ancora = [e.originalEvent.clientX, e.originalEvent.clientY]; return cartaPercorso(pr[0].properties.id); } apriPercorso(pr[0].properties.id); return; }
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
  $('res').style.display = 'none'; if (!isApp && typeof sapCarta === 'function') sapCarta();
  punto = e.lngLat;
  if (!ids.length) { cur = null; selez(''); $('sh').innerHTML = `<div><h2>${t('questo')}</h2><small class="note">${e.lngLat.lat.toFixed(5)}, ${e.lngLat.lng.toFixed(5)}</small></div><button class="close" aria-label="Chiudi">×</button>`; $('sb').innerHTML = '<div id="ter"></div>'; mostra(); return terreno(e.lngLat); }
  if (ids.length === 1 && ids[0].startsWith('CF:') && !isApp) { if (e.originalEvent) SAP.ancora = [e.originalEvent.clientX, e.originalEvent.clientY]; return cartaBosco(ids[0].slice(3)); }
  if (ids.length === 1) { if (!ids[0].startsWith('CF:') && !isApp) { if (e.originalEvent) SAP.ancora = [e.originalEvent.clientX, e.originalEvent.clientY]; return natCarta(ids[0]); } apri(ids[0], false); $('sb').insertAdjacentHTML('beforeend', '<div id="ter"></div>'); return terreno(e.lngLat); }
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
let cur = null, PERC_SEL = null;
const cls = tp => tp === 'amp' ? 'mare' : tp === 'zps' ? 'zps' : N2K.includes(tp) ? 'n2k' : AMB.includes(tp) ? tp : '';
const tipoCF = c => (CFN.tipi[c] || [c])[0];
function selez(k) {
  $('sheet').classList.remove('narr');
  if (!map.getLayer('sel')) return;
  const tp = S[k] ? S[k].t : '';
  map.setFilter('sel', ['==', ['get', 'id'], AMB.includes(tp) ? '' : k]);
  for (const x of AMB) map.setFilter('sel-' + x, ['==', ['get', 'id'], tp === x ? k : '']);
}
function chiudiPercorso() { evidenziaPercorso(null); }
function mostra() { if (typeof dopoScheda === 'function') setTimeout(dopoScheda, 0); $('sheet').classList.remove('mini'); $('sheet').classList.add('open'); document.body.classList.add('side'); $('sb').scrollTop = 0; tastoEspandi(); }
function tastoEspandi() {
  const c = $('sh').querySelector('.close'); if (!c || $('sh').querySelector('.espandi')) return;
  const big = $('sheet').classList.contains('big');
  c.insertAdjacentHTML('beforebegin', `<button class="espandi" aria-label="${big ? T('Riduci', 'Reduce') : T('Tutto schermo', 'Full screen')}">${ico(big ? 'arrows-minimize' : 'arrows-maximize')}</button>`);
}
$('sh').addEventListener('click', e => { if (!e.target.closest('.espandi')) return; altSheet($('sheet').classList.contains('big') ? 1 : 2); });
function chiudi() { evidenziaPercorso(null); vediZint(null); if (!PIAN && map.getSource('pian')) disegnaIt([], []); $('sheet').classList.remove('open', 'big', 'mini'); document.body.classList.remove('side'); cur = null; selez(''); if (isApp) try { history.replaceState(null, '', location.pathname); } catch (e) {} }
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
const elencoE = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + (LANG === 'it' ? ' e ' : ' and ') + a[a.length - 1];
function sintesi(k) {
  if (k.startsWith('CF:')) { const c = k.slice(3); return esc(CFN.macro[c.slice(0, 2)] || '') + ' · ' + (LANG === 'it' ? 'tipo di bosco della particella' : 'forest type of the stand'); }
  const s = S[k], p = [];
  if (s.t === 'am') return esc([s.vg, s.circ ? fmt(s.circ) + ' cm' : '', s.alt ? fmt(s.alt) + ' m' : ''].filter(Boolean).join(' · '));
  if (s.ha) p.push(fmt(s.ha) + ' ha');
  if (s.t === 'bv' || s.t === 'bs') { p.push(esc(s.tf || s.sp || '')); return p.filter(Boolean).join(' · '); }
  if (s.b && s.b.length) p.push(esc(elencoE(nomiBoschi(s.b, 2))));
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
    if (s.b && s.b.length) P.push(it ? `I boschi coprono circa ${fmt(s.bha)} ettari${area ? ' nei siti Natura 2000 collegati' : ''}: i più estesi sono ${esc(elencoE(s.b.slice(0, 3).map(x => nb(x[0]).toLowerCase() + (x[1] ? ` (${fmt(x[1])} ha)` : ''))))}.`
                                     : `Forests cover about ${fmt(s.bha)} ha${area ? ' in the linked Natura 2000 sites' : ''}; the largest are ${esc(elencoE(s.b.slice(0, 3).map(x => nb(x[0]).toLowerCase() + (x[1] ? ` (${fmt(x[1])} ha)` : ''))))}.`);
    const sp = specieDi(k), pi = sp.filter(i => SP.gr[i] === 'P');
    if (pi.length) P.push(it ? `Tra le specie segnalate ci sono ${fmt(pi.length)} piante, come ${elencoE(pi.slice(0, 3).map(i => '<i>' + esc(SP.nomi[i]) + '</i>'))}.` : `Recorded species include ${fmt(pi.length)} plants, such as ${elencoE(pi.slice(0, 3).map(i => '<i>' + esc(SP.nomi[i]) + '</i>'))}.`);
    const d = DENTRO[k] || [], v = d.filter(x => S[x].t === 'bv'), a = d.filter(x => S[x].t === 'am').sort((x, y) => (S[y].circ || 0) - (S[x].circ || 0));
    if (v.length || a.length) {
      const pz = [];
      if (v.length) pz.push(t('vb')(v.length) + (v.length <= 3 ? ` (${esc(elencoE(v.map(x => S[x].n)))})` : ''));
      if (a.length) pz.push(t('va')(a.length));
      let f = (it ? 'Al suo interno ci sono ' : 'Inside there are ') + elencoE(pz) + '.';
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
// le frasi si dividono sul punto, ma non dopo le abbreviazioni degli autori ("L.", "Fr.", "Bull.") né dopo "ca.", "es.", "sec."
const frasi = tx => String(tx || '').split(/(?<=[.!?])\s+/).reduce((a, x) => { const u = a[a.length - 1]; if (u && (/(^|[\s(])([A-Z][a-z]{0,2}|Bull|Schaeff|Pers|Quél|Sacc|Kumm|Gillet|ca|es|sec|var|subsp|ssp|cfr|sp)\.$/.test(u) || /^[a-z(]/.test(x))) a[a.length - 1] = u + ' ' + x; else a.push(x); return a; }, []);
const senzaComm = tx => { const f = frasi(tx).filter(x => x && !NOCOMM.test(x)); return f.join(' '); };
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
    if (parole.length && ok / parole.length >= 0.75) { const w = await wikiVoce(r.title); if (w && /sicil|sicily|palerm|catan|messin|siracus|syracus|trapan|agrigent|ragus|caltaniss|enna|etna|egad|eolie|aeolian|pantelleria|lampedusa|ustica|madonie|nebrodi|iblei|peloritani|sicani/i.test(w.extract || '')) return w; }
  }
  return null;
}
const NOFOTO = /satellit|sentinel|landsat|copernicus|nasa|\besa\b|\biss\d|\biss\b|view of earth|earth observation|astronaut|from space|dallo spazio|aerial|aerea|ortofoto|orthophoto|\bmaps?\b|mappa|cartina|carta |locator|topograph|\bplan\b|planimetr|diagram|schema|\bsvg\b|terra ?aqua|modis|worldview|google earth|openstreetmap|\bosm\b|stemma|coat of arms|flag|bandiera|logo|museo|musée|museum|targa|busto/i;
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
  const g = await getJ(`https://commons.wikimedia.org/w/api.php?action=query&generator=geosearch&ggscoord=${lat.toFixed(5)}|${lon.toFixed(5)}&ggsradius=${rag}&ggsnamespace=6&ggslimit=40&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=320&format=json&origin=*`);
  if (cur !== k || !$('gal')) return;
  // via immagini da satellite, mappe, carte e foto dallo spazio: non mostrano il luogo come lo vede chi ci va
  const ph = Object.values((g && g.query && g.query.pages) || {}).filter(p => { if (!p.imageinfo || !/\.(jpe?g|webp)$/i.test(p.title)) return false; const m = p.imageinfo[0].extmetadata || {};
    return !NOFOTO.test([p.title, pulito((m.ImageDescription || {}).value), pulito((m.Categories || {}).value), pulito((m.Artist || {}).value)].join(' ')); }).sort((a, b) => (a.index || 0) - (b.index || 0)).slice(0, 10);
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
  if (isApp) try { history.replaceState(null, '', '#' + k); } catch (e) {} // sul sito l'indirizzo lo scrive il navigatore (#/zona/...)
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
  let h = `<div class="cta trovaprc"><button data-trovaprc="${k}">${ico('route')}${T('Trova un percorso qui', 'Find a trail here')}</button></div>` + racconto(k) + regole(s) + `<div id="zint"></div>` + `<div class="stats"><div><b>${fmt(s.ha)} ha</b><span>${t('sup')}</span></div><div><b>${s.bha ? fmt(s.bha) + ' ha' : '–'}</b><span>${t('boschi')}</span></div><div><b>${s.anno || sp.length || '–'}</b><span>${s.anno ? t('istit') : t('specie')}</span></div></div>`;
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
  mostra(); arricchisci(k); zoneInterne(k);
}
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h && S[h] && h !== cur) apri(h, true); });

/* ---------- sezioni: Esplora, Micologia, Botanica */
let vista = 'mappa';
const cs = { funghi: { q: '', g: '', n: 60 }, piante: { q: '', g: '', n: 60, fam: '' } };
const BASEF = 'foto/funghi/'; // foto di Oscar Cangelosi, nel sito
const ICOC = { funghi: '<svg viewBox="0 0 24 24"><path d="M12 3C6.5 3 2.5 6.6 2.5 10.5c0 .8.6 1.3 1.4 1.3h16.2c.8 0 1.4-.5 1.4-1.3C21.5 6.6 17.5 3 12 3Zm-2.3 10.3-.6 5.9A1.7 1.7 0 0 0 10.8 21h2.4a1.7 1.7 0 0 0 1.7-1.8l-.6-5.9h-4.6Z"/></svg>',
  piante: '<svg viewBox="0 0 24 24"><path d="M20 3.5C11.5 3.5 6 7.6 6 14c0 1.4.3 2.7.8 3.8L4.3 20.3l1.4 1.4 2.4-2.4c1.2.7 2.6 1.2 4.1 1.2 6.2 0 8.3-6.9 7.8-17Z"/></svg>' };
const isApp = !!(window.Capacitor && (!window.Capacitor.isNativePlatform || window.Capacitor.isNativePlatform()));
// plugin del telefono: da Capacitor 3 non sempre compaiono in Capacitor.Plugins, vanno registrati per nome
const plug = n => { if (!isApp) return null; const C = window.Capacitor; try { return (C.Plugins && C.Plugins[n]) || (C.registerPlugin ? (C.Plugins[n] = C.registerPlugin(n)) : null); } catch (e) { return null; } };
const modo = { escursioni: 'mappa', meteo: 'mappa', registra: 'mappa' };
const sapOn = () => !!(SAP && SAP.on);
const mappaVista = v => !sapOn() && (v === 'escursioni' || v === 'meteo' || v === 'registra') && modo[v] === 'mappa';
let ultimaSpecie = 'funghi';
if (isApp) document.body.classList.add('app');
function vai(v) {
  vista = v; document.body.classList.remove('escreg'); document.body.classList.remove('vm-esc', 'vm-met'); document.body.classList.add(v === 'escursioni' ? 'vm-esc' : v === 'meteo' ? 'vm-met' : 'vm-x');
  if (v === 'specie' && !sapOn()) return vai(ultimaSpecie);
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
  if (sapOn() && v !== 'registra') return sapVai(v);
  if (!sapOn()) { mixLivelli(v); if (v !== 'mappa' && SEZ === 'home') SEZ = 'natura'; }
  if (typeof aggSez === 'function') aggSez();
  if (v === 'mappa' && NAT.home) return natHome();
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
    const n = norm(r[0] + ' ' + r[2] + ' ' + r[3] + ' ' + (NOMI[r[7]] || []).join(' ')); return w.every(x => contiene(n, x)); });
  return PIA.s.map((r, i) => i).filter(i => { const r = PIA.s[i];
    if (st.g === 'alb' && !r[1]) return false; if (st.g === 'ali' && !r[7]) return false; if (['orc', 'fel', 'gra', 'erb'].includes(st.g) && tipoP(r) !== st.g) return false; if (st.g === 'n2k' && !r[2].length) return false;
    if (st.fam && r[5] !== st.fam) return false;
    const n = norm(r[0] + ' ' + (r[5] || '') + ' ' + (NOMI[r[4]] || []).join(' ')); return w.every(x => contiene(n, x)); });
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
      return `<button class="card" data-sp="${i}"><span class="ph" data-n="${esc(r[0])}"${ph}${ph ? '' : ` style="color:${TIPO_IC[f ? 'fun' : tipoP(r)][1]}"`}>${ph ? '' : ico(TIPO_IC[f ? 'fun' : tipoP(r)][0], 'phi')}</span><span class="tx">${(c => c ? `<b class="nc">${esc(c)}</b>` : '')(nomeC(vista, i))}<i>${esc(r[0])}</i><small>${sub}</small>${bollino(pericolo(vista, i))}${(z => z.on === true ? `<span class="tag st">${esc(z.lab)}</span>` : '')(stg(i))}${f ? `<span class="tag">${esc(t('GF')[r[4]])}</span>` : r[1] ? `<span class="tag">${t('alberi')}</span>` : ''}</span></button>`; };
    const griglia = ids.slice(0, st.n).map(card).join('') + '';
    if (soloTesti || !$('cat').querySelector('.in') || $('cat').dataset.v !== vista) {
      $('cat').dataset.v = vista; $('cat').scrollTop = 0;
      $('cat').innerHTML = `<div class="in"><h2>${f ? t('tFunghi') : t('tPiante')}</h2><p class="lead">${f ? t('lFunghi')(FUN.s.length) : t('lPiante')(PIA.s.length)}</p><div class="switch spsw" role="tablist">${['funghi', 'piante', 'cal'].map(x => `<button role="tab" data-specie="${x}" class="${vista === x ? 'on' : ''}" aria-selected="${vista === x}">${x === 'funghi' ? T('Funghi', 'Fungi') : x === 'piante' ? T('Piante', 'Plants') : T('Calendario', 'Calendar')}</button>`).join('')}</div>${f ? REGOLE_FUNGHI() : ''}
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
  const pz = pericolo(tipo, i);
  if (pz) h += `<div class="avv-per ${pz}">${ico('alert-triangle')}<div><b>${pz === 'mortale' ? T('Fungo mortale', 'Deadly mushroom') : T('Fungo velenoso', 'Poisonous mushroom')}</b><p>${pz === 'mortale' ? T('Può uccidere anche in piccole quantità. Non raccoglierlo e non toccarlo insieme ad altri funghi.', 'It can kill even in small amounts. Do not pick it or mix it with other mushrooms.') : T('Può causare intossicazioni anche gravi.', 'It can cause poisoning, even severe.')} ${T('In caso di dubbio chiama il 118 o un centro antiveleni.', 'If in doubt call 118 or a poison control centre.')}</p><small>${T('Segnaliamo solo le specie pericolose: l’assenza di questo avviso non vuol dire che un fungo sia commestibile.', 'We only flag dangerous species: the absence of this warning does not mean a mushroom is edible.')}</small></div></div>`;
  if (f) {
    h += it ? `<p><i>${esc(r[0])}</i> è un fungo della famiglia ${esc(r[2])} (ordine ${esc(r[3])}), nel gruppo «${esc(t('GF')[r[4]].toLowerCase())}».</p><p>Nel database mondiale della biodiversità GBIF ha ${fmt(r[5])} segnalazioni in Sicilia${r[6] > r[5] ? `, su ${fmt(r[6])} nell’Italia meridionale` : ''}.</p>`
            : `<p><i>${esc(r[0])}</i> is a fungus of the family ${esc(r[2])} (order ${esc(r[3])}), in the group “${esc(t('GF')[r[4]].toLowerCase())}”.</p><p>The GBIF global biodiversity database holds ${fmt(r[5])} records of it in Sicily${r[6] > r[5] ? `, out of ${fmt(r[6])} in southern Italy` : ''}.</p>`;
  } else {
    const am = r[3].filter(k => S[k] && S[k].t === 'am'), bs = r[3].filter(k => S[k] && S[k].t === 'bs');
    if (r[5]) h += it ? `<p><i>${esc(r[0])}</i> è una pianta della famiglia ${esc(r[5])}${r[6] ? `, con ${fmt(r[6])} segnalazioni in Sicilia nel database mondiale della biodiversità GBIF` : ''}.</p>`
                      : `<p><i>${esc(r[0])}</i> is a plant of the family ${esc(r[5])}${r[6] ? `, with ${fmt(r[6])} records in Sicily in the GBIF global biodiversity database` : ''}.</p>`;
    if (r[2].length) h += it ? `<p><i>${esc(r[0])}</i> è elencata nei formulari di ${t('nsiti')(r[2].length)} in Sicilia${r[2].length > 1 ? `, tra cui ${esc(elencoE(r[2].slice(0, 2).map(k => S[k].n)))}` : ` (${esc(S[r[2][0]].n)})`}.</p>`
                             : `<p><i>${esc(r[0])}</i> is listed in the forms of ${t('nsiti')(r[2].length)} in Sicily${r[2].length > 1 ? `, including ${esc(elencoE(r[2].slice(0, 2).map(k => S[k].n)))}` : ` (${esc(S[r[2][0]].n)})`}.</p>`;
    if (am.length || bs.length) h += it ? `<p>In Sicilia è la specie di ${elencoE([am.length ? t('va')(am.length) : '', bs.length ? (bs.length === 1 ? '1 bosco da seme' : bs.length + ' boschi da seme') : ''].filter(Boolean))}.</p>`
                                        : `<p>In Sicily it is the species of ${elencoE([am.length ? t('va')(am.length) : '', bs.length ? (bs.length === 1 ? '1 seed stand' : bs.length + ' seed stands') : ''].filter(Boolean))}.</p>`;
  }
  h += '</div>';
  if (f && r[8].length) h += `<div class="ownph">${r[8].map(x => `<img src="${BASEF + x}" alt="${esc(r[0])}" loading="lazy">`).join('')}</div><p class="note">© Oscar Cangelosi · CC BY 4.0</p>`;
  h += `<button class="btnmap" id="btnmap"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>${t('vediMappa')}</button>`;
  h += '<div id="wk"></div>';
  if (f) h += `<div class="avviso">${t('nocomm')}</div>`;
  if (f) h += REGOLE_FUNGHI();
  if (!f && (r[2].length || r[3].length)) h += `<h3>${t('dove')}</h3><div class="links">${r[3].concat(r[2]).filter(k => S[k]).slice(0, 40).map(k => `<button data-id="${k}">${esc(S[k].n)}<br><small>${t(S[k].t)}${S[k].ha ? ' · ' + fmt(S[k].ha) + ' ha' : S[k].com ? ' · ' + esc(S[k].com) : ''}</small></button>`).join('')}</div>`;
  h += `<p class="src">${t('fonte')}: ${f ? `<a href="https://www.gbif.org/species/${r[7]}" target="_blank" rel="noopener">${t('gbif')}</a>` : `${t('sdf')} · ${t('elenco')}${r[4] ? ` · <a href="https://www.gbif.org/species/${r[4]}" target="_blank" rel="noopener">${t('gbif')}</a>` : ''}`}</p>`;
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
// foto del punto di interesse da Wikimedia Commons (entro 150 m), senza immagini da satellite o mappe
async function fotoPunto(c) {
  const g = await getJ(`https://commons.wikimedia.org/w/api.php?action=query&generator=geosearch&ggscoord=${(+c[1]).toFixed(5)}|${(+c[0]).toFixed(5)}&ggsradius=150&ggsnamespace=6&ggslimit=15&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=240&format=json&origin=*`);
  const el = document.querySelector('.maplibregl-popup .poiph'); if (!el) return;
  const ph = Object.values((g && g.query && g.query.pages) || {}).filter(p => { if (!p.imageinfo || !/\.(jpe?g|webp)$/i.test(p.title)) return false; const m = p.imageinfo[0].extmetadata || {};
    return !NOFOTO.test([p.title, pulito((m.ImageDescription || {}).value), pulito((m.Categories || {}).value)].join(' ')); }).sort((a, b) => (a.index || 0) - (b.index || 0)).slice(0, 3);
  if (!ph.length) return;
  el.innerHTML = ph.map(p => { const i = p.imageinfo[0], m = i.extmetadata || {}; return `<a href="${esc(i.descriptionurl)}" target="_blank" rel="noopener" title="${esc(pulito((m.Artist || {}).value).slice(0, 40))} · Wikimedia Commons"><img src="${esc(i.thumburl)}" alt="" loading="lazy"></a>`; }).join('') + `<small>Foto: Wikimedia Commons</small>`;
}
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
  PERC_SEL = p ? p.id : null;
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
    if (intSel.has('funghi') && fungB) { sc += Math.log10(1 + fungB) * 2; why.push((LANG === 'it' ? 'boschi adatti ai funghi: ' : 'forests good for fungi: ') + elencoE(z.b.filter(b => ['9260', '9340', '91AA', '9210', '91M0', '9330', '9540', '9530'].includes(b[0])).slice(0, 2).map(b => nb(b[0]).toLowerCase()))); }
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
  ZREC = { q: null, k: [] }; caricaZI().then(z => ZI_ok = z); const zp = $('zprompt'); if (zp) zp.remove();
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
/* zone interne di parchi e riserve (SIF Regione Siciliana): A, B, C, D dei parchi; riserva (A) e preriserva (B) delle riserve */
let ZI = null;
const caricaZI = () => ZI || (ZI = fetch('data/zone_int.json').then(r => r.json()).catch(() => ({ features: [] })));
const ZCOL = { A: '#b91c1c', B: '#ea580c', B1: '#ea580c', B2: '#f59e0b', B3: '#f59e0b', C: '#ca8a04', D: '#16a34a' };
const parcoZ = k => S[k] && ['pr', 'pn'].includes(S[k].t);
function zNome(k, z) {
  if (parcoZ(k)) return T({ A: 'Zona A · riserva integrale', B: 'Zona B · riserva generale', C: 'Zona C · protezione', D: 'Zona D · controllo' }[z] || 'Zona ' + z,
    { A: 'Zone A · strict reserve', B: 'Zone B · general reserve', C: 'Zone C · protection', D: 'Zone D · buffer' }[z] || 'Zone ' + z);
  return z.startsWith('B') ? T('Zona ' + z + ' · preriserva', 'Zone ' + z + ' · buffer') : T('Zona ' + z + ' · riserva', 'Zone ' + z + ' · reserve');
}
const ZDESC = { A: ['La parte più protetta: la natura è lasciata a sé stessa. Si visita solo a piedi sui sentieri segnati.', 'The most protected part: nature is left alone. Visit only on foot along marked trails.'],
  B: ['Natura protetta dove continuano pascolo, bosco e attività tradizionali, con regole precise.', 'Protected nature where grazing, forestry and traditional activities continue under precise rules.'],
  C: ['Campagna e attività tradizionali; qui possono esserci strutture per i visitatori.', 'Countryside and traditional activities; visitor facilities may be here.'],
  D: ['Fascia di confine con paesi e campagne: le regole sono più leggere.', 'Border belt with villages and farmland: rules are lighter.'],
  RA: ['La riserva vera e propria, la parte più protetta.', 'The reserve itself, the most protected part.'], RB: ['Preriserva: fascia di protezione attorno alla riserva, con regole più leggere.', 'Pre-reserve: a protective belt around the reserve, with lighter rules.'] };
function vediZint(k) {
  if (!map.getSource('zint')) { if (!k) return;
    map.addSource('zint', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    const col = ['match', ['get', 'z'], 'A', ZCOL.A, 'B', ZCOL.B, 'B1', ZCOL.B1, 'B2', ZCOL.B2, 'B3', ZCOL.B3, 'C', ZCOL.C, 'D', ZCOL.D, '#888'];
    map.addLayer({ id: 'zint-f', type: 'fill', source: 'zint', paint: { 'fill-color': col, 'fill-opacity': 0.22 } }, map.getLayer('prc-c') ? 'prc-c' : undefined);
    map.addLayer({ id: 'zint-l', type: 'line', source: 'zint', paint: { 'line-color': col, 'line-width': 1.6, 'line-opacity': 0.9 } }, map.getLayer('prc-c') ? 'prc-c' : undefined);
  }
  if (!k) return map.getSource('zint').setData({ type: 'FeatureCollection', features: [] });
  caricaZI().then(z => { if (cur === k) map.getSource('zint').setData({ type: 'FeatureCollection', features: z.features.filter(f => f.properties.k === k) }); });
}
async function zoneInterne(k) {
  const z = await caricaZI(); if (cur !== k || !$('zint')) return;
  const L = z.features.filter(f => f.properties.k === k).map(f => f.properties).sort((a, b) => a.z.localeCompare(b.z)); if (!L.length) return;
  const tot = L.reduce((a, x) => a + x.ha, 0), pz = parcoZ(k);
  $('zint').innerHTML = `<h3>${pz ? T('Zone del parco', 'Park zones') : T('Zone della riserva', 'Reserve zones')}</h3>
    <div class="lv zsw" id="zsw" role="switch" aria-checked="false" tabindex="0"><span><b>${T('Visualizza zone', 'Show zones')}</b><small>${T('Colora le zone sulla mappa', 'Colour the zones on the map')}</small></span><span class="sw-t"></span></div><div class="zint">${L.map(x => { const d = pz ? ZDESC[x.z[0]] : ZDESC[x.z.startsWith('B') ? 'RB' : 'RA'];
    return `<div class="zi"><i style="background:${ZCOL[x.z] || '#888'}"></i><div><b>${esc(zNome(k, x.z))}</b><span>${fmt(x.ha)} ha · ${Math.round(x.ha / tot * 100)}%</span>${d ? `<small>${T(...d)}</small>` : ''}</div></div>`; }).join('')}</div>
    ${(RP[k] || {}).nonvig ? `<p class="avvz">${T('Attenzione: il parco è stato annullato nel 2019 e queste zone oggi non sono in vigore. È in corso una nuova istituzione.', 'Note: the park was annulled in 2019 and these zones are not in force today. A new designation is under way.')}</p>` : ''}
    <p class="note">${T('Fonte: Regione Siciliana, SIF (servizio Parchi e Riserve). Superfici calcolate dai confini.', 'Source: Regione Siciliana, SIF (Parks and Reserves service). Areas computed from the boundaries.')}</p>`;
  $('zsw').onclick = () => { const on = !$('zsw').classList.contains('on'); $('zsw').classList.toggle('on', on); $('zsw').setAttribute('aria-checked', on); vediZint(on ? k : null); };
}
/* durante la registrazione: in quale parco o riserva sei, con avviso quando entri o esci */
let ZREC = { q: null, k: [] }, ZI_ok = null;
function zoneQui(q) {
  if (typeof GJ === 'undefined' || !GJ) return [];
  return GJ.features.filter(f => { const z = S[f.properties.id]; return z && AREE.includes(z.t) && z.bb && q[0] >= z.bb[0] && q[0] <= z.bb[2] && q[1] >= z.bb[1] && q[1] <= z.bb[3] && dentroPoligono(q, f.geometry); })
    .map(f => f.properties.id).sort((a, b) => S[a].ha - S[b].ha);
}
function chiediZone(k) {
  const d = document.createElement('div'); d.id = 'zprompt'; d.className = 'zprompt';
  d.innerHTML = `<div class="zpc"><b>${esc(S[k].n)}</b><p>${T('Il parco è diviso in zone con regole diverse. Nella zona A, riserva integrale, la natura va lasciata intatta: resta sui sentieri segnati e non portare via nulla. Rispetta le regole di ogni zona: le trovi nella scheda del parco, alla voce Regole del parco.', 'The park is divided into zones with different rules. In zone A, the strict reserve, nature must be left untouched: stay on marked trails and take nothing away. Respect the rules of each zone: see Park rules in the park sheet.')}</p>
    <p><b>${T('Vuoi un avviso (suono e vibrazione) quando entri in una zona diversa?', 'Do you want an alert (sound and vibration) when you enter a different zone?')}</b></p>
    <div class="pi-b"><button data-zp="0">${T('No', 'No')}</button><button class="fatto" data-zp="1">${T('Sì, avvisami', 'Yes, alert me')}</button></div></div>`;
  d.onclick = e => { const b = e.target.closest('[data-zp]'); if (!b) return; if (REG) { REG.avvZ = b.dataset.zp === '1'; salvaCorrente(); } d.remove(); };
  document.body.appendChild(d);
}
function zonaRec(q) {
  if (ZREC.q && hav(ZREC.q, q) < 25) return; ZREC.q = q;
  const ora = zoneQui(q), prima = ZREC.k, entra = ora.filter(k => !prima.includes(k));
  if (prima.length || ora.length) { const msg = entra.map(k => T('Entri in: ', 'Entering: ') + S[k].n + ((RP[k] || {}).nonvig ? T(' (parco non in vigore)', ' (park not in force)') : '')); /* avviso solo all'ingresso (scelta di Oscar) */ if (msg.length && ZREC.init) { const zz = ZI_ok ? ZI_ok.features.filter(f => entra.includes(f.properties.k) && !(RP[f.properties.k] || {}).nonvig && dentroPoligono(q, f.geometry)) : []; if (zz.length && REG && REG.avvZ) msg[0] += ' · ' + zNome(zz[0].properties.k, zz[0].properties.z); toast(msg.join(' · ')); try { navigator.vibrate && navigator.vibrate([120, 80, 120]); } catch (e) {} } }
  ZREC.k = ora;
  // nei parchi divisi in zone: avviso di rispetto e scelta dell'avviso di ingresso in zona (una volta per registrazione)
  const pz = ora.find(k => parcoZ(k) && !(RP[k] || {}).nonvig && ZI_ok && ZI_ok.features.some(f => f.properties.k === k));
  if (pz && REG && REG.avvZ === undefined && !$('zprompt')) chiediZone(pz);
  // zona interna (A, B, C, D) del parco o della riserva in cui sei
  const zf = ZI_ok ? ZI_ok.features.filter(f => ora.includes(f.properties.k) && !(RP[f.properties.k] || {}).nonvig && dentroPoligono(q, f.geometry)) : [];
  const zk = zf.map(f => f.properties.k + ':' + f.properties.z), nuovo = zk.filter(x => !(ZREC.z || []).includes(x));
  if (nuovo.length && ZREC.init && !entra.length && REG && REG.avvZ) { toast(T('Entri in: ', 'Entering: ') + nuovo.map(x => { const [k, z] = x.split(':'); return zNome(k, z) + ' (' + S[k].n + ')'; }).join(' · ')); try { navigator.vibrate && navigator.vibrate([120, 80, 120]); } catch (e) {} }
  ZREC.z = zk; ZREC.init = true;
  const el = $('rec-zona'); if (!el) return;
  el.style.display = ora.length ? '' : 'none'; el.textContent = ora.length ? ora.map(k => { const f = zf.find(x => x.properties.k === k); return S[k].n + (f ? ' · ' + T('zona ', 'zone ') + f.properties.z : ''); }).join(' · ') : '';
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
  const box = (tit, nota, key, top) => `<div class="mt-box"><h3>${tit}</h3><p class="mt-best">${t('migliori')}: <b>${elencoE([...top].sort().map(d => giorno(d, { weekday: 'long', day: 'numeric', month: 'long' })))}</b></p>
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
/* regole dei parchi, dai documenti ufficiali (sintesi in parole semplici; nessuna indicazione su cosa si mangia) */
const RP = {
  EUAP0227: { f: [['Regolamento per le attività di fruizione del Parco dell’Etna', 'https://www.etnalife.it/regolamento-per-attivita-fruizione-parco-delletna/'], ['Protezione Civile: escursioni alle quote sommitali', 'https://www.etnatracking.com/images/attachments/etna-fruizione-quote-sommitali.pdf']],
    g: ['Cammina solo sui sentieri e sui percorsi segnalati.', 'Fuochi solo negli spazi attrezzati, mai altrove.', 'Campeggio solo nelle aree attrezzate; la tenda per bivacco è ammessa solo di notte dove non ci sono rifugi.', 'Cani e gatti mai liberi.', 'Vietato portare via o danneggiare piante, rocce e minerali.', 'Bici solo sulle piste ciclabili; fuori strada niente auto o moto.', 'Droni e altri velivoli solo con autorizzazione.', 'Rispetta la quiete: niente rumori inutili.', 'Vietato restare o bivaccare di notte sui crateri sommitali; l’escursione in vetta finisce al tramonto. Oltre i limiti indicati dalla Protezione Civile si sale solo con guide abilitate.'],
    z: { A: ['Vietato portare cani e gatti.', 'Vietato ogni mezzo a motore.', 'Niente radio o musica ad alto volume.'], B: ['Vietato ogni mezzo a motore.'] } },
  EUAP0228: { f: [['Decalogo del Parco delle Madonie (regole della fruizione)', 'https://parcodellemadonie.it/wp-content/uploads/2023/11/Decalogo-parco-Madonie.pdf']],
    g: ['Non toccare, raccogliere né danneggiare piante o parti di esse.', 'Vietati campeggio, bivacco e fuochi.', 'Non disturbare né catturare animali, selvatici o al pascolo; osservali da lontano.', 'Segui i sentieri e i cartelli; non scavalcare staccionate.', 'Nelle grotte entra solo se sono segnalate come visitabili, sul percorso indicato.', 'Non attraversare boschi bruciati da un incendio.', 'Niente escursioni con rischio incendi o con temporali, vento forte o temperature estreme.', 'Non stare sotto le pareti di roccia.', 'Scarpe da escursione chiuse: vietati tacchi, infradito e ciabatte.', 'Non entrare nei terreni privati, anche se non recintati.', 'Riporta a casa i rifiuti.', 'Nel parco non ci sono acqua, ristoro, bagni né soccorso, tranne nei paesi e lungo le strade principali.'],
    z: { A: ['Vietato fotografare o filmare vicino a nidi e luoghi dove gli animali si riproducono.'] } },
  EUAP0226: { f: [['Disciplina delle attività esercitabili e dei divieti in ciascuna zona del Parco dei Nebrodi, D.A. 560/11 del 4 agosto 1993', 'http://win.lasiciliainrete.it/natura/normativa/decreto_nebrodi.htm']],
    g: ['Ogni zona ha regole diverse; nella zona A, riserva integrale, sono le più severe.', 'Rifiuti solo negli appositi contenitori, o riportali a casa.', 'Droni e altri velivoli solo con autorizzazione dell’Ente Parco.', 'La raccolta dei funghi segue i regolamenti dei Comuni e le regole regionali (vedi la scheda dei funghi).'],
    z: { A: ['Vietato il campeggio.', 'Vietati i mezzi a motore (salvo servizio o autorizzazione del Parco).', 'Vietato raccogliere o portare via rocce, fossili e minerali.', 'Vietati sport che disturbano: moto, motocross, trial, deltaplano.'],
      B: ['Stessi divieti della zona A.', 'Auto e moto solo sulle strade esistenti: mai su piste forestali, mulattiere e sentieri.'],
      C: ['Bivacco e campeggio solo nelle aree attrezzate.'], D: ['Bivacco e campeggio solo nelle aree attrezzate.'] } },
  EUAP0859: { f: [['Misure di conservazione e Regolamento di fruizione del Parco fluviale dell’Alcantara (delibera n. 4 del 27 aprile 2012)', 'https://orbs.regione.sicilia.it/files/Misure%20di%20conservazione%20in%20fase%20di%20approvazione/ITA030036%20-%20Riserva%20naturale%20del%20Fiume%20Alcantara/MdC%20ITA030036%20Riserva%20naturale%20del%20Fiume%20Alcantara.pdf']],
    g: ['Vietato camminare fuori dai sentieri e dai percorsi segnalati.', 'Canoa, kayak, rafting, hydrospeed, trekking fluviale e torrentismo solo come previsto dal regolamento del parco.', 'Campeggio e bivacco solo nelle aree attrezzate.', 'Animali domestici sempre al guinzaglio.', 'Vietato danneggiare o portare via rocce e minerali; vietato disturbare o catturare animali.', 'Veicoli solo sulle strade carrabili.', 'Vietati caccia, sport equestri e voli non autorizzati (anche droni).', 'Riporta a casa i rifiuti.'] },
  SIF_SICANI: { f: [['Regione Siciliana: verso una nuova istituzione del Parco dei Monti Sicani (18 febbraio 2025)', 'https://www.regione.sicilia.it/la-regione-informa/monti-sicani-savarino-incontra-sindaci-verso-una-nuova-istituzione-parco']],
    g: ['Il Parco dei Monti Sicani è stato annullato nel 2019 ed è in corso una nuova istituzione: oggi le sue zone non sono in vigore.', 'Valgono le regole delle riserve che si trovano dentro l’area (per esempio Monte Cammarata, Monti di Palazzo Adriano e Valle del Sosio, Monte Carcaci, Monte Genuardo) e dei siti Natura 2000.'], nonvig: true },
  EUAP1300: { f: [['Istituzione del Parco nazionale Isola di Pantelleria, D.P.R. 28 luglio 2016', 'https://www.isprambiente.gov.it/it/banche-dati/repertorio-dello-stato-di-attuazione-dei-piani-per-il-parco-nei-parchi-nazionali/parco-nazionale-isola-di-pantelleria'], ['Lago di Venere: regole (ordinanza 95/2023)', 'https://www.balarm.it/news/da-sapere-prima-di-andare-a-pantelleria-cosa-puoi-fare-e-cosa-no-al-lago-di-venere-137973']],
    g: ['Il parco non ha ancora un suo regolamento: valgono le misure di salvaguardia del decreto istitutivo e la legge nazionale sulle aree protette.', 'Al Lago di Venere (Specchio di Venere) c’è un’ordinanza con regole precise: leggila prima di andare.'] }
};
function regole(z) {
  const k = Object.keys(S).find(c => S[c] === z), rp = k && RP[k];
  if (rp && LANG === 'it') return `<details class="regole"><summary>${ico('shield-check', 'sm')} ${T('Regole del parco', 'Park rules')}</summary><ul>${rp.g.map(v => `<li>${esc(v)}</li>`).join('')}</ul>${rp.z ? Object.entries(rp.z).map(([zz, l]) => `<p class="zr"><b>${esc(zNome(k, zz))}</b></p><ul>${l.map(v => `<li>${esc(v)}</li>`).join('')}</ul>`).join('') : ''}${rp.nota ? `<p class="note">${esc(rp.nota)}</p>` : ''}<p class="note">Fonti: ${rp.f.map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a>`).join(' · ')}. In caso di dubbio vale il testo ufficiale.</p></details>`;
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
  $('cat').innerHTML = `<div class="in cal">
    <h2>${T('Calendario della natura', 'Nature calendar')}</h2><p class="lead">${T('Cosa si vede in Sicilia mese per mese, secondo i mesi delle osservazioni su GBIF. Prima le specie più osservate.', 'What can be seen in Sicily month by month, from the months of GBIF records. Most recorded species first.')}</p><div class="switch spsw" role="tablist">${['funghi', 'piante', 'cal'].map(x => `<button role="tab" data-specie="${x}" class="${x === 'cal' ? 'on' : ''}">${x === 'funghi' ? T('Funghi', 'Fungi') : x === 'piante' ? T('Piante', 'Plants') : T('Calendario', 'Calendar')}</button>`).join('')}</div>
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

/* ---------- Sapori: atlante agroalimentare ed enogastronomico (per ora solo sul sito, dati di prova) */
var SAP = { home: true, on: false, d: null, fil: { k: 'tutto', q: '', paese: '', festa: '', lr: '', fam: '', ric: '', n: 60 }, mese: new Date().getMonth() + 1, liv: { paesi: true, prod: true } };
const SAPD = () => SAP.d || (SAP.d = Promise.all([fetch('data/sapori.json').then(r => r.json()), fetch('foto/foto.json').then(r => r.json()).catch(() => []), fetch('data/sicilia.json').then(r => r.json()).catch(() => null)]).then(([d, fo, si]) => {
  d.foto = fo; d.sic = si; for (const x of fo) if (x.v && d.voci[x.v] && !d.voci[x.v].fo) d.voci[x.v].fo = x;
  // dove si usa: legame inverso della distinta
  for (const [k, v] of Object.entries(d.voci)) { v.k = k; v.usi = v.usi || []; }
  for (const [k, v] of Object.entries(d.voci)) for (const [c] of (v.dist || [])) if (d.voci[c]) d.voci[c].usi.push(k);
  for (const [k, p] of Object.entries(d.produttori)) p.k = k;
  return (SAP.D = d);
}));
const SAPT = {
  materia: ['Materia prima', 'Materie prime', 'wheat', '#5c940d'], semi: ['Semilavorato', 'Semilavorati', 'stack-2', '#c77700'],
  prodotto: ['Prodotto', 'Prodotti', 'basket', '#1d6fa5'], dolce: ['Dolce', 'Dolci', 'cake', '#b85e3d'], piatto: ['Piatto', 'Piatti', 'bowl', '#7a5ea8']
};
const RUOLO = { coltiva: ['Coltiva, alleva o pesca', 'tractor', '#2b8a3e'], trasforma: ['Trasforma', 'building-factory-2', '#c77700'], vende: ['Vende o cucina', 'building-store', '#b85e3d'] };
const LRC = { vivo: '#2b8a3e', raro: '#c77700', 'a rischio': '#c2185b', perduto: '#495057', 'da valutare': '#868e96' };
const SAPL = ['sap-c', 'sap-cl', 'sap-p', 'sap-pl', 'sap-pr', 'sap-v'];
const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const MESIL = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const icoV = v => { const x = SAPT[v.t] || SAPT.dolce; return `<span class="tpi" style="color:${x[3]}">${ico(x[2], 'xs')}</span>`; };
const nomiPaesi = v => (v.paesi || []).map(p => SAP.D.paesi[p] ? SAP.D.paesi[p].n : p).join(', ');
const PROVA = '<span class="badge prova">Dati di prova</span>';

/* ---- interruttore Natura | Sapori (solo sito) */
function sapModo(on) {
  if (!on && $('sapcard')) sapCarta();
  SAP.on = on; SAP.home = true; if (on) SEZ = 'sapori'; else if (SEZ === 'sapori') SEZ = 'natura'; aggSez(); document.body.classList.toggle('sap', on); if (!on) document.body.classList.remove('sapmap');
  for (const b of document.querySelectorAll('#modo button')) b.classList.toggle('on', (b.dataset.m === 'sapori') === on);
  sapNav(); chiudi(); $('q').value = ''; $('res').style.display = 'none'; $('q').placeholder = on ? 'Cerca un dolce, un prodotto, un paese' : t('cerca');
  if (map.getLayer('sap-p')) for (const l of SAPL) map.setLayoutProperty(l, 'visibility', 'none');
  if (on) SAPD().then(() => vai(vista === 'funghi' || vista === 'piante' ? 'specie' : vista)); else vai(vista === 'specie' ? 'specie' : vista);
}
function sapNav() {
  const L = SAP.on ? { mappa: ['Esplora', 'map'], escursioni: ['Itinerari', 'route-2'], registra: [T('Registra', 'Record'), 'player-record'], meteo: ['Calendario', 'calendar'], specie: ['Catalogo', 'tools-kitchen-2'] } : null;
  for (const b of document.querySelectorAll('#sez button')) {
    const v = b.dataset.v, [n, ic] = L ? L[v] : [t({ mappa: 'vMappa', specie: 'vSpecie', escursioni: 'vEsc', meteo: 'vMeteo', registra: 'vReg' }[v]), b.dataset.ic];
    b.querySelector('span').textContent = n; const s = b.querySelector('svg'); if (s) s.remove(); b.insertAdjacentHTML('afterbegin', ico(ic));
  }
}
if (!isApp) {
  // il cambio di tema ora è nel filtro dentro la foto d'apertura (temi)
  $('wrap').querySelector('.top').insertAdjacentHTML('beforeend', '<div class="sapf" id="sapf"></div>');
}

/* ---- chiamata da vai(): mostra la vista Sapori */
function sapVai(v) {
  if (v === 'mappa' && SAP.home && misto()) { NAT.home = true; return sapModo(false); }
  if (v !== 'mappa' || SAP.home) sapCarta();
  SAPD().then(() => {
    if (!SAP.on) return;
    evidenzia([]); document.body.classList.toggle('sapmap', v === 'mappa'); // nasconde i livelli di Natura
    if (v === 'mappa') { if (SAP.home) sapHome(); else sapMappa(); }
    else if (v === 'specie') sapCatalogo();
    else if (v === 'meteo') sapCalendario();
    else if (v === 'escursioni') sapItinerari();
  });
}

/* ---- mappa */
function sapGeo(cosa) {
  const D = SAP.D, f = [];
  const nPaese = {}; for (const v of Object.values(D.voci)) if (perGusto(v)) for (const p of (v.paesi || [])) nPaese[p] = (nPaese[p] || 0) + 1;
  if (cosa === 'paese' && SAP.liv.paesi) for (const [k, p] of Object.entries(D.paesi)) if (nPaese[k]) f.push({ type: 'Feature', properties: { k, tipo: 'paese', n: p.n, c: nPaese[k] }, geometry: { type: 'Point', coordinates: p.c } });
  if (cosa === 'prod' && SAP.liv.prod) for (const p of Object.values(D.produttori)) { const c = D.paesi[p.paese].c, o = (p.k.charCodeAt(1) % 5 - 2) * 0.012; f.push({ type: 'Feature', properties: { k: p.k, tipo: 'prod', n: p.n, r: p.r }, geometry: { type: 'Point', coordinates: [c[0] + o, c[1] - 0.012] } }); }
  return { type: 'FeatureCollection', features: f };
}
function sapLayers() {
  if (map.getSource('sap')) return;
  map.addSource('sap', { type: 'geojson', data: sapGeo('prod') });
  map.addSource('sapp', { type: 'geojson', data: sapGeo('paese'), cluster: true, clusterMaxZoom: 9, clusterRadius: 48, clusterProperties: { tot: ['+', ['get', 'c']] } });
  map.addSource('sapv', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({ id: 'sap-v', type: 'line', source: 'sapv', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#C2185B', 'line-width': 4, 'line-dasharray': [1.5, 1.2], 'line-opacity': .9 } });
  map.addLayer({ id: 'sap-c', type: 'circle', source: 'sapp', filter: ['has', 'point_count'], paint: { 'circle-color': '#E8761A', 'circle-opacity': .92, 'circle-stroke-color': '#fff', 'circle-stroke-width': 3, 'circle-radius': ['interpolate', ['linear'], ['get', 'tot'], 2, 16, 40, 26, 200, 38] } });
  map.addLayer({ id: 'sap-cl', type: 'symbol', source: 'sapp', filter: ['has', 'point_count'], layout: { 'text-field': ['to-string', ['get', 'tot']], 'text-font': ['Noto Sans Bold'], 'text-size': 14, 'text-allow-overlap': true }, paint: { 'text-color': '#fff' } });
  map.addLayer({ id: 'sap-p', type: 'circle', source: 'sapp', filter: ['!', ['has', 'point_count']], paint: { 'circle-color': '#E8761A', 'circle-opacity': .9, 'circle-stroke-color': '#fff', 'circle-stroke-width': 2.5, 'circle-radius': ['interpolate', ['linear'], ['get', 'c'], 1, 8, 10, 15] } });
  map.addLayer({ id: 'sap-pl', type: 'symbol', source: 'sapp', filter: ['!', ['has', 'point_count']], layout: { 'text-field': ['concat', ['get', 'n'], ' · ', ['to-string', ['get', 'c']]], 'text-font': ['Noto Sans Regular'], 'text-size': 12.5, 'text-offset': [0, 1.4], 'text-anchor': 'top', 'text-optional': true }, paint: { 'text-color': '#8A3B00', 'text-halo-color': '#fff', 'text-halo-width': 1.6 } });
  map.addLayer({ id: 'sap-pr', type: 'circle', source: 'sap', minzoom: 8, paint: { 'circle-color': ['match', ['get', 'r'], 'coltiva', RUOLO.coltiva[2], 'trasforma', RUOLO.trasforma[2], RUOLO.vende[2]], 'circle-radius': 7, 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } });
}
function sapMappa() {
  sapLayers(); map.getSource('sap').setData(sapGeo('prod')); map.getSource('sapp').setData(sapGeo('paese'));
  for (const l of SAPL) map.setLayoutProperty(l, 'visibility', 'visible');
  $('sapf').innerHTML = `<button class="on" data-home="1">${ico('sparkles', 'xs')}Scopri</button><button data-l="paesi" class="${SAP.liv.paesi ? 'on' : ''}"><i style="background:#E8761A"></i>Comuni e loro sapori</button><button data-l="prod" class="${SAP.liv.prod ? 'on' : ''}"><i style="background:${RUOLO.coltiva[2]}"></i>Produttori</button>`;
}
document.addEventListener('click', e => { if (e.target.closest('#sapf [data-home]')) { SAP.home = true; chiudi(); return vai('mappa'); } const b = e.target.closest('#sapf [data-l]'); if (!b) return; SAP.liv[b.dataset.l] = !SAP.liv[b.dataset.l]; sapMappa(); });
function sapClick(e) {
  if (e.originalEvent) SAP.ancora = [e.originalEvent.clientX, e.originalEvent.clientY];
  const box = [[e.point.x - 8, e.point.y - 8], [e.point.x + 8, e.point.y + 8]];
  const cl = map.getLayer('sap-c') ? map.queryRenderedFeatures(box, { layers: ['sap-c'] }) : [];
  if (cl.length) return sapGruppo(cl[0]);
  const f = map.queryRenderedFeatures(box, { layers: ['sap-pr', 'sap-p'].filter(l => map.getLayer(l)) });
  if (!f.length) { sapCarta(); return chiudi(); }
  const p = f[0].properties; if (p.tipo === 'prod') return sapCartaProd(p.k);
  sapCartaPaese(p.k);
}
// la carta che racconta, in basso sulla mappa
function sapCarta(html) {
  let c = $('sapcard'); if (!c) { c = document.createElement('div'); c.id = 'sapcard'; c.className = 'sapcard'; $('wrap').appendChild(c);
    c.addEventListener('click', e => { const b = e.target.closest('[data-cp],[data-cv],[data-cz],[data-cx],[data-cpr],[data-cn],[data-cperc],[data-ccf],[data-cevc],[data-cfv]'); if (!b) return;
      if (b.dataset.cfv) { sapCarta(); const [fk, vk] = b.dataset.cfv.split(':'); return sapVarieta(fk, vk); }
      if (b.dataset.cpr) { sapCarta(); return sapProduttore(b.dataset.cpr); }
      if (b.dataset.cperc) { sapCarta(); return apriPercorso(b.dataset.cperc); }
      if (b.dataset.ccf) { sapCarta(); return apriCF(b.dataset.ccf); }
      if (b.dataset.cevc) { const ev = SAP.sagre.eventi.find(x => x.id === b.dataset.cevc); sapCarta(); if (ev) { SAP.cal = { y: +ev.d[0].slice(0, 4), m: +ev.d[0].slice(5, 7), sel: ev.d.find(x => x >= iso(new Date())) || ev.d[0], tipo: '', pv: '' }; versoSapori(() => vai('meteo')); } return; }
      if (b.dataset.cn && $('cat').classList.contains('on')) { const k = b.dataset.cn; sapCarta(); if (sapOn()) sapModo(false); natMappa(); return setTimeout(() => apri(k, true), 650); }
      if (b.dataset.cn) { sapCarta(); apri(b.dataset.cn, false); if (punto) { $('sb').insertAdjacentHTML('beforeend', '<div id="ter"></div>'); terreno(punto); } return; }
      if (b.dataset.cx != null) return sapCarta();
      if (b.dataset.cp) { sapCarta(); return sapPaese(b.dataset.cp); }
      if (b.dataset.cv) { sapCarta(); return sapVoce(b.dataset.cv); }
      if (b.dataset.cz) { const p = SAP.D.paesi[b.dataset.cz]; sapVola(p.c, 11.5); return sapCartaPaese(b.dataset.cz, true); } }); }
  c.innerHTML = html || ''; c.classList.toggle('on', !!html); tipNascondi();
  // sul computer la carta si apre accanto al punto toccato
  const a = SAP.ancora; SAP.ancora = null; c.classList.toggle('anc', !!(html && a && innerWidth >= 900));
  if (html && a && innerWidth >= 900) { const w = c.offsetWidth, h = c.offsetHeight; let l = a[0] + 16, t = a[1] - h / 2; if (l + w > innerWidth - 12) l = a[0] - w - 16; t = Math.max(70, Math.min(t, innerHeight - h - 12)); c.style.left = l + 'px'; c.style.top = t + 'px'; c.style.bottom = 'auto'; }
  else { c.style.left = ''; c.style.top = ''; c.style.bottom = ''; }
}
function sapCartaPaese(k, vicino) {
  const D = SAP.D, p = D.paesi[k], voci = Object.values(D.voci).filter(v => (v.paesi || []).includes(k) && perGusto(v));
  const pref = voci.slice().sort((a, b) => (!!b.fo - !!a.fo) || ((b.ric || []).length - (a.ric || []).length) || (!!b.wk - !!a.wk));
  const top = pref.slice(0, 3), fo = pref.find(v => v.fo), dol = voci.filter(v => v.t === 'dolce').length;
  const frase = voci.length === 1 ? `A ${p.n} è documentato un sapore: ${top[0].n}.`
    : `A ${p.n} sono documentati ${voci.length} sapori${dol ? `, di cui ${dol} dolci` : ''}. Tra questi ${top.map(v => v.n).join(', ')}.`;
  sapCarta(`<button class="cx" data-cx aria-label="Chiudi">×</button>
    <div class="cc">${fo ? `<span class="cf" style="background-image:url('foto/${fo.fo.f}.webp')"></span>` : top[0] && top[0].wk ? `<span class="cf" data-wk="${esc(top[0].wk)}"></span>` : ''}
    <div><small>Provincia di ${esc(PROVN[p.pv] || '')}</small><h3>${esc(p.n)}</h3><p>${esc(frase)}</p>
    ${(() => { const pr = Object.values(D.produttori).filter(x => x.paese === k); return pr.length ? `<p class="cmeta"><b>${pr.length} ${pr.length === 1 ? 'produttore o locale segnalato' : 'produttori e locali segnalati'}</b></p><div class="cchip">${pr.slice(0, 4).map(x => `<button data-cpr="${x.k}">${esc(x.n)}<small>${esc(x.tipo || RUOLO[x.r][0])}</small></button>`).join('')}</div>` : ''; })()}
    ${(() => { const fe = Object.values(D.feste).filter(f => f.paesi.includes(k)); return fe.length ? `<p class="cmeta">Feste: ${fe.slice(0, 3).map(f => esc(f.n)).join(', ')}</p>` : ''; })()}
    <div class="ca"><button class="pri" data-cp="${k}">Apri la scheda completa</button>${vicino ? '' : `<button data-cz="${k}">Avvicinati</button>`}${top[0] ? `<button data-cv="${top[0].k}">${esc(top[0].n)}</button>` : ''}</div></div></div>`);
  sapFoto($('sapcard'));
}
function sapCartaProd(k) {
  const D = SAP.D, p = D.produttori[k]; if (!p) return; const pa = D.paesi[p.paese];
  const tipo = p.tipo ? p.tipo[0].toUpperCase() + p.tipo.slice(1) : RUOLO[p.r][0];
  const v0 = (p.fa || []).map(x => D.voci[x]).find(v => v && (v.fo || v.wk));
  const vic = Object.values(D.produttori).filter(x => x.k !== k && x.paese === p.paese).length;
  sapCarta(`<button class="cx" data-cx aria-label="Chiudi">×</button>
    <div class="cc">${v0 ? (v0.fo ? `<span class="cf" style="background-image:url('foto/${v0.fo.f}.webp')"></span>` : `<span class="cf" data-wk="${esc(v0.wk)}"></span>`) : ''}
    <div><small>${esc(tipo)} · ${esc(pa.n)} (${esc(pa.pv)})</small><h3>${esc(p.n)}</h3>
    <span class="badge liv">${p.liv === 'Segnalato' ? 'Segnalato · da visitare' : esc(p.liv)}</span>
    ${(p.fa || []).length ? `<p class="cmeta">Custodisce: ${p.fa.map(x => D.voci[x] ? `<button class="cl5" data-cv="${x}">${esc(D.voci[x].n)}</button>` : '').join(', ')}</p>` : ''}
    ${(p.seg || []).length ? `<p class="cmeta">Lo segnalano: ${p.seg.map(([a]) => esc(a)).join('; ')}.</p>` : ''}
    ${vic ? `<p class="cmeta">A ${esc(pa.n)} ne segnaliamo altri ${vic}.</p>` : ''}
    <div class="ca"><button class="pri" data-cpr="${k}">Apri la scheda completa</button><button data-cz="${p.paese}">Cosa si mangia a ${esc(pa.n)}</button>${p.sito ? `<a class="cab" href="${esc(p.sito)}" target="_blank" rel="noopener">Sito</a>` : ''}</div></div></div>`);
  sapFoto($('sapcard'));
}
var TIPZ = { pn: 'Parco nazionale', pr: 'Parco regionale', rn: 'Riserva naturale', amp: 'Area marina protetta', ap: 'Area protetta', am: 'Albero monumentale', bv: 'Bosco vetusto', bs: 'Bosco da seme', zsc: 'Zona speciale di conservazione', zps: 'Zona di protezione speciale', zsczps: 'Zona speciale di conservazione e di protezione', sic: 'Sito di importanza comunitaria' };
const testoBreve = html => { const d = document.createElement('div'); d.innerHTML = html; const p = d.querySelector('p'); return (p ? p.textContent : d.textContent).trim(); };
function natCarta(k) {
  const z = S[k]; if (!z) return apri(k, false); let sp = []; try { sp = specieDi(k); } catch (e) {}
  const dati = [z.ha ? `<b>${fmt(z.ha)} ha</b><span>superficie</span>` : '', z.bha ? `<b>${fmt(z.bha)} ha</b><span>di bosco</span>` : '', sp.length ? `<b>${fmt(sp.length)}</b><span>specie</span>` : z.anno ? `<b>${z.anno}</b><span>istituita</span>` : '', z.alt ? `<b>${fmt(z.alt)} m</b><span>quota</span>` : '', z.circ ? `<b>${fmt(z.circ)} cm</b><span>tronco</span>` : ''].filter(Boolean).slice(0, 3);
  let frase = ''; try { frase = testoBreve(racconto(k)); } catch (e) {} if (frase.length > 260) frase = frase.slice(0, 250).replace(/\s\S*$/, '') + '…';
  const bosco = (z.b || [])[0] ? nb(z.b[0][0]) : '';
  sapCarta(`<button class="cx" data-cx aria-label="Chiudi">×</button>
    <div class="cc nat"><span class="cf" id="ncf"></span>
    <div><small>${esc(TIPZ[z.t] || t(z.t) || '')}${z.com ? ' · ' + esc(z.com) : ''}</small><h3>${esc(z.n)}</h3>
    ${dati.length ? `<div class="cstat">${dati.map(x => `<div>${x}</div>`).join('')}</div>` : ''}
    ${frase ? `<p>${esc(frase)}</p>` : ''}${bosco ? `<p class="cmeta">Bosco più esteso: ${esc(bosco)}</p>` : ''}
    <div class="ca"><button class="pri" data-cn="${k}">Apri la scheda completa</button></div></div></div>`);
  if (typeof wikiVoce === 'function') wikiVoce(z.n).then(w => { const el = $('ncf'); if (!el) return; if (w && w.thumbnail && !(typeof NOFOTO !== 'undefined' && NOFOTO.test(w.thumbnail.source))) el.style.backgroundImage = `url('${w.thumbnail.source.replace(/\/\d+px-/, '/600px-')}')`; else el.remove(); }).catch(() => { const el = $('ncf'); if (el) el.remove(); });
  else $('ncf').remove();
}
var PRCA = null; // elenco dei percorsi, per i suggerimenti
function cartaEvento(id) {
  const ev = ((SAP.sagre || {}).eventi || []).find(x => x.id === id); if (!ev) return;
  const oggi = iso(new Date()), pr = ev.d.find(x => x >= oggi) || ev.d[0], dd = pr.split('-');
  sapCarta(`<button class="cx" data-cx aria-label="Chiudi">×</button><div class="cc"><div><small>${esc(ev.t === 'sagra' ? 'Sagra' : ev.t === 'festa' ? 'Festa' : 'Appuntamento')} · ${esc(ev.c)} (${esc(ev.pv)})</small><h3>${esc(ev.n)}</h3>
    <div class="cstat"><div><b>${+dd[2]} ${MESIL[+dd[1] - 1]}</b><span>${ev.d.length > 1 ? `per ${ev.d.length} giorni` : 'un giorno'}</span></div></div>
    ${ev.desc ? `<p>${esc(ev.desc)}</p>` : ''}
    <div class="ca"><button class="pri" data-cevc="${esc(id)}">Vedi nel calendario</button>${ev.p && SAP.D && SAP.D.paesi[ev.p] ? `<button data-cp="${ev.p}">Cosa si mangia a ${esc(SAP.D.paesi[ev.p].n)}</button>` : ''}${ev.f ? `<a class="cab" href="${esc(ev.f)}" target="_blank" rel="noopener">Fonte</a>` : ''}</div></div></div>`);
}
function cartaPercorso(id) {
  if (!PRCA) return caricaPercorsi().then(a => { PRCA = a; cartaPercorso(id); });
  const p = PRCA.find(x => x.id === +id); if (!p) return;
  const c = CAI[p.c];
  sapCarta(`<button class="cx" data-cx aria-label="Chiudi">×</button><div class="cc nat"><div><small>${T('Percorso segnato', 'Marked trail')}${p.r ? ' ' + esc(p.r) : ''}${c ? ' · ' + esc(T(...c)) : ''}</small><h3>${esc(p.n || p.r || 'Percorso')}</h3>
    <div class="cstat"><div><b>${num1(p.km)} km</b><span>lunghezza</span></div>${p.up ? `<div><b>+${fmt(p.up)} m</b><span>salita</span></div>` : ''}${p.dur ? `<div><b>${esc(durata(p.dur))}</b><span>tempo</span></div>` : ''}</div>
    ${p.da || p.a ? `<p>Da <b>${esc(p.da || '–')}</b> a <b>${esc(p.a || '–')}</b>${p.giro ? ', ad anello' : ''}.</p>` : ''}${p.desc ? `<p>${esc(p.desc.length > 220 ? p.desc.slice(0, 210).replace(/\s\S*$/, '') + '…' : p.desc)}</p>` : ''}
    <div class="ca"><button class="pri" data-cperc="${p.id}">Apri la scheda completa</button></div></div></div>`);
}
function cartaPunto(q, c) {
  sapCarta(`<button class="cx" data-cx aria-label="Chiudi">×</button><div class="cc nat"><div><small>${esc(T(...(POIN[q.t] || ['Punto', 'Point'])))}${q.e ? ' · ' + fmt(q.e) + ' m' : ''}</small><h3>${esc(q.n || T(...(POIN[q.t] || ['Punto', 'Point'])))}</h3>
    <p>Un punto utile lungo i sentieri, dai dati di OpenStreetMap.</p><div class="ca">${gmapsLink(c, 'cab')}</div></div></div>`);
}
function cartaBosco(cf) {
  const [n, v] = (CFN.tipi[cf] || [cf, []]);
  sapCarta(`<button class="cx" data-cx aria-label="Chiudi">×</button><div class="cc nat"><div><small>Carta forestale della Regione</small><h3>${esc(n)}</h3>
    <p>${esc(CFN.macro[cf.slice(0, 2)] || '')}</p><div class="ca"><button class="pri" data-ccf="${esc(cf)}">Apri la scheda completa</button></div></div></div>`);
}
/* ---- le filiere: vino, olio, grano, formaggio, pane */
var FIL = null; const FILD = () => FIL || (FIL = fetch('data/filiere.json').then(r => r.json()));
const FILK = ['vino', 'olio', 'grano', 'formaggio', 'pane'];
const FILFO = { vino: ['vigna-con-uva-1', 'Una vigna con l’uva matura'], olio: ['olive-nel-palmo-passulunara', 'Olive nel palmo della mano'], grano: ['pane-di-grano-duro', 'Pane di grano duro'], formaggio: ['tuma-nel-suo-siero', 'Tuma nel suo siero'], pane: ['pane-a-pasta-dura', 'Pane a pasta dura'] };
const filVar = (F, fk, vk) => { for (const g of F.filiere[fk].gruppi) for (const v of (g.v || [])) if (v.k === vk) return [v, g]; return [null, null]; };
function sapFiliera(fk) {
  Promise.all([FILD(), SAPD()]).then(([F]) => {
    const D = SAP.D, f = F.filiere[fk]; if (!f) return; SAP.fk = fk; SAP.filC = F;
    $('cat').dataset.v = 'sap-fil'; $('cat').scrollTop = 0; SAP.home = false; if (String(cur).startsWith('SAP:fv:')) chiudi();
    const punti = []; for (const g of f.gruppi) for (const v of (g.v || [])) for (const p of v.paesi.slice(0, 2)) if (D.paesi[p]) punti.push({ a: 'fv', id: fk + ':' + v.k, xy: D.paesi[p].c, t: v.lr ? 'riserva' : 'sagra', on: !v.lr, tit: v.n });
    const vociF = new Set(); for (const g of f.gruppi) { for (const v of (g.v || [])) v.dop.forEach(x => vociF.add(x)); (g.voci || []).forEach(x => vociF.add(x)); }
    const chi = Object.values(D.produttori).filter(p => (p.fa || []).some(x => vociF.has(x))).slice(0, 16);
    const fonti = [...new Set([...(f.fonti || []), ...f.gruppi.flatMap(g => (g.v || []).flatMap(v => v.f))])].map(x => F.fonti[x]).filter(Boolean);
    const fo = FILFO[fk];
    const carta = v => `<button class="var5${v.lr ? ' lr' : ''}" data-fv="${fk}:${v.k}"><b>${esc(v.n)}</b>${v.sin ? `<small>${esc(v.sin)}</small>` : ''}<span>${esc(v.t.split('. ')[0].replace(/\.$/, ''))}.</span>${v.paesi.length ? `<em>${v.paesi.slice(0, 3).map(p => esc(D.paesi[p].n)).join(' · ')}</em>` : ''}${v.lr ? '<i>Da salvare</i>' : ''}</button>`;
    const voce = k => { const v = D.voci[k]; if (!v) return ''; return `<button class="vo5" data-fs="${k}">${icoV(v)} <b>${esc(v.n)}</b>${(v.ric || []).length ? `<small>${esc(v.ric.join(' · '))}</small>` : ''}</button>`; };
    $('cat').innerHTML = `<div class="in fil5">
      <nav class="filtab" aria-label="Le filiere">${FILK.map(k => `<button data-fil="${k}" class="${k === fk ? 'on' : ''}" aria-current="${k === fk}">${esc(F.filiere[k].n)}</button>`).join('')}</nav>
      <div class="filh"><div><p class="sub">${esc(f.sub)}</p><h2>${esc(f.n)}</h2>${f.intro.map(p => `<p>${esc(p)}</p>`).join('')}</div>${fo ? `<figure><span style="background-image:url('foto/${fo[0]}.webp')"></span><figcaption>${esc(fo[1])}, foto di Oscar Cangelosi</figcaption></figure>` : ''}</div>
      ${punti.length ? `<section class="filmap"><h3>Dove crescono</h3><p class="note">Passa sui punti per vedere la varietà, toccali per saperne di più. I punti chiari sono le varietà da salvare.</p><div class="cmap">${mappaSicilia({ w: 840, nomi: true, punti })}</div></section>` : ''}
      ${f.gruppi.map(g => `<section class="filg"><h3>${esc(g.n)}</h3>${g.testo ? `<p class="gt">${esc(g.testo)}</p>` : ''}<div class="${g.v ? 'vargrid' : 'vogrid'}">${g.v ? g.v.map(carta).join('') : g.voci.map(voce).join('')}</div></section>`).join('')}
      ${chi.length ? `<section class="filg"><h3>Chi li custodisce</h3><p class="gt">Produttori e laboratori segnalati che lavorano questi prodotti. Non li abbiamo ancora visitati.</p><div class="vogrid">${chi.map(p => `<button class="vo5" data-fpr="${p.k}"><b>${esc(p.n)}</b><small>${esc(p.tipo || RUOLO[p.r][0])} · ${esc(D.paesi[p.paese].n)}</small></button>`).join('')}</div></section>` : ''}
      <p class="src">Testi scritti da noi a partire da queste fonti, da verificare sui libri: ${fonti.map(x => `<a href="${esc(x[1])}" target="_blank" rel="noopener">${esc(x[0])}</a>`).join(' · ')}.</p>
      ${COPY()}</div>`;
    sapFoto($('cat'));
  });
}
function sapVarieta(fk, vk) {
  FILD().then(F => {
    const D = SAP.D, [v, g] = filVar(F, fk, vk); if (!v) return; cur = 'SAP:fv:' + fk + ':' + vk; selez('');
    testata(v.n, `${esc(F.filiere[fk].sub)} · ${esc(g.n)}`, v.lr ? '<span class="badge prova">Da salvare</span>' : '');
    const chi = Object.values(D.produttori).filter(p => (p.fa || []).some(x => v.dop.includes(x))).slice(0, 8);
    let h = `<div class="racconto"><p>${esc(v.t)}</p>${v.sin ? `<p>Altri nomi: <b>${esc(v.sin)}</b>.</p>` : ''}</div>`;
    if (v.paesi.length) h += `<section class="ns5"><h3>Dove cresce</h3><div class="mm5">${mappaSicilia({ w: 400, nomi: true, evid: v.paesi })}</div><div class="chips5">${v.paesi.map(p => `<button data-s="${p}">${esc(D.paesi[p].n)}</button>`).join('')}</div></section>`;
    if (v.dop.length) h += `<section class="ns5"><h3>${fk === 'vino' ? 'Nei vini' : fk === 'olio' ? 'Negli oli e nelle olive' : 'Nei prodotti'}</h3><div class="links">${v.dop.filter(x => D.voci[x]).map(x => lnk(x)).join('')}</div></section>`;
    if (chi.length) h += `<section class="ns5"><h3>Chi la lavora</h3><div class="links">${chi.map(p => lnk(p.k)).join('')}</div></section>`;
    h += `<section class="ns5"><h3>Le altre varietà</h3><div class="chips5">${g.v.filter(x => x.k !== vk).map(x => `<button data-fv="${fk}:${x.k}">${esc(x.n)}</button>`).join('')}</div><p><button class="lk" data-fil="${fk}">Tutta la sezione «${esc(F.filiere[fk].n)}»</button></p></section>`;
    h += `<p class="src">Fonti: ${v.f.map(x => F.fonti[x]).filter(Boolean).map(x => `<a href="${esc(x[1])}" target="_blank" rel="noopener">${esc(x[0])}</a>`).join(' · ')}. Testo scritto da noi, da verificare sui libri.</p>`;
    $('sb').innerHTML = h; mostra();
  });
}
function tipVarieta(id) {
  if (!SAP.filC) { FILD().then(F => { SAP.filC = F; TIP.dataset.k = ''; }); return ''; }
  const [fk, vk] = id.split(':'), [v, g] = filVar(SAP.filC, fk, vk); if (!v) return '';
  return `<span class="tt">${esc(g.n)}</span><b>${esc(v.n)}</b><small>${esc(v.paesi.slice(0, 3).map(p => SAP.D.paesi[p].n).join(' · '))}</small><span class="tl">${esc(v.t.split('. ')[0])}.</span>${tipHint('Clic per saperne di più')}`;
}
function cartaVarieta(id) {
  FILD().then(F => {
    SAP.filC = F; const [fk, vk] = id.split(':'), [v, g] = filVar(F, fk, vk); if (!v) return;
    const frase = v.t.length > 260 ? v.t.slice(0, 250).replace(/\s\S*$/, '') + '…' : v.t;
    sapCarta(`<button class="cx" data-cx aria-label="Chiudi">×</button><div class="cc"><div><small>${esc(F.filiere[fk].sub)} · ${esc(g.n)}</small><h3>${esc(v.n)}</h3>${v.sin ? `<p class="cmeta">Detto anche ${esc(v.sin)}</p>` : ''}<p>${esc(frase)}</p>
      ${v.dop.length ? `<p class="cmeta">${v.dop.filter(x => SAP.D.voci[x]).slice(0, 4).map(x => `<button class="cl5" data-cv="${x}">${esc(SAP.D.voci[x].n)}</button>`).join(', ')}</p>` : ''}
      <div class="ca"><button class="pri" data-cfv="${esc(id)}">Apri la scheda completa</button></div></div></div>`);
  });
}
function sapGruppo(g) {
  const src = map.getSource('sapp'), id = g.properties.cluster_id;
  Promise.resolve(src.getClusterLeaves(id, 200, 0)).then(fs => {
    fs = (fs || []).map(f => f.properties).sort((a, b) => b.c - a.c);
    const tot = fs.reduce((s, x) => s + x.c, 0), pv = [...new Set(fs.map(f => PROVN[SAP.D.paesi[f.k].pv]))];
    sapCarta(`<button class="cx" data-cx aria-label="Chiudi">×</button><div class="cl"><small>${pv.length === 1 ? 'Provincia di ' + esc(pv[0]) : esc(pv.slice(0, 3).join(', '))}</small>
      <h3>${fs.length} comuni, ${tot} sapori</h3><p>Ecco i comuni di questa zona, dal più ricco. Toccane uno per sapere cosa si mangia lì.</p>
      <ol class="gl">${fs.slice(0, 40).map(f => `<li><button data-cz="${f.k}"><b>${esc(f.n)}</b><em>${f.c}</em></button></li>`).join('')}</ol></div>`);
    const b = fs.reduce((b, f) => { const c = SAP.D.paesi[f.k].c; return [Math.min(b[0], c[0]), Math.min(b[1], c[1]), Math.max(b[2], c[0]), Math.max(b[3], c[1])]; }, [180, 90, -180, -90]);
    map.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: Object.assign({}, padMappa(), { bottom: Math.min(innerHeight * .45, 360) }), maxZoom: 11, duration: 700 });
  });
}
function sapVola(c, z) { map.flyTo({ center: c, zoom: z || 10, padding: padMappa(), duration: 700 }); }

/* ---- schede */
function sapApri(k) { const v = SAP.D.voci[k]; if (v) sapVoce(k); else if (SAP.D.produttori[k]) sapProduttore(k); else if (SAP.D.paesi[k]) sapPaese(k); }
const lnk = (k, sub) => { const D = SAP.D, v = D.voci[k], p = D.produttori[k], pa = D.paesi[k];
  const n = v ? v.n : p ? p.n : pa ? pa.n : k, s = sub != null ? sub : v ? SAPT[v.t][0] + (v.paesi ? ' · ' + nomiPaesi(v) : '') : p ? (p.tipo ? p.tipo[0].toUpperCase() + p.tipo.slice(1) : RUOLO[p.r][0]) + ' · ' + D.paesi[p.paese].n : 'Paese';
  return `<button data-s="${k}">${v ? icoV(v) + ' ' : ''}${esc(n)}<br><small>${esc(s)}</small></button>`; };
function testata(tit, sub, badge) { $('sh').innerHTML = `<div><h2>${esc(tit)}</h2>${sub ? `<p class="sci">${sub}</p>` : ''}${badge || ''}</div><button class="close" aria-label="Chiudi">×</button>`; }
function natVicina(c) {
  if (typeof S === 'undefined') return [];
  return Object.entries(S).filter(([, x]) => ['pn', 'pr', 'rn'].includes(x.t) && x.bb).map(([k, x]) => [k, hav(c, centro(x))]).filter(x => x[1] < 25000).sort((a, b) => a[1] - b[1]).slice(0, 3);
}
function distinta(k, liv) {
  const v = SAP.D.voci[k]; if (!v || !v.dist || liv > 4) return '';
  return `<ul class="dist">${v.dist.map(([c, nota]) => { const x = SAP.D.voci[c]; if (!x) return '';
    return `<li><button data-s="${c}">${icoV(x)} ${esc(x.n)}${nota ? ` <small>(${esc(nota)})</small>` : ''}</button>${distinta(c, liv + 1)}</li>`; }).join('')}</ul>`;
}
// ---- schede narrative: un racconto costruito dai dati, senza inventare
const ARTICOLO = { dolci: 'Un dolce', formaggi: 'Un formaggio', 'frutta e ortaggi': 'Un frutto della terra', 'pane e pasta': 'Un pane', gastronomia: 'Un piatto', vini: 'Un vino', salumi: 'Un salume', pesce: 'Un sapore di mare', miele: 'Un miele', 'conserve e condimenti': 'Un condimento', bevande: 'Un liquore' };
function racconto5(v) {
  const D = SAP.D, out = [], cat = catDi(v), P = (v.paesi || []).map(p => D.paesi[p].n);
  const dove = P.length ? (P.length > 4 ? `${elencoE(P.slice(0, 3))} e in altri ${P.length - 3} comuni` : elencoE(P)) : v.prov ? (v.prov.length === 9 ? 'tutta la Sicilia' : 'provincia di ' + elencoE(v.prov.map(x => PROVN[x]))) : '';
  if (v.t === 'materia') out.push(`${v.n} è una materia prima: da qui partono ricette, dolci e prodotti di tutta l'isola.`);
  else if (dove) out.push(`${ARTICOLO[cat] || 'Un sapore'} ${P.length ? 'di ' : 'diffuso in '}${dove}${v.nd && norm(v.nd) !== norm(v.n) ? `, che in siciliano si chiama «${v.nd}»` : ''}.`);
  const ric = v.ric || [];
  if (ric.includes('DOP')) out.push('È una DOP: il nome, la zona e il modo di produrlo sono protetti da un disciplinare europeo.');
  else if (ric.includes('IGP')) out.push('È una IGP: l\'Europa riconosce il suo legame con il territorio da cui viene.');
  else if (ric.some(r => /DOC|IGT/.test(r))) out.push(`È un vino a denominazione (${ric.filter(r => /DOC|IGT/.test(r)).join(', ')}): uve, zona e metodo seguono un disciplinare.`);
  if (v.pat) out.push('È nell\'elenco nazionale dei prodotti tradizionali: si prepara allo stesso modo da almeno venticinque anni.');
  if (ric.some(r => /Slow/i.test(r))) out.push('È un presidio Slow Food, custodito da chi lo produce ancora.');
  if (v.fam && v.fam !== 'Altri dolci') out.push(`Appartiene alla famiglia dei ${v.fam.toLowerCase()}.`);
  if (v.lr) out.push(v.lr === 'vivo' ? 'Si prepara ancora con continuità.' : v.lr === 'perduto' ? 'Oggi è considerato perduto: resta nei libri e nella memoria.' : `Oggi è ${v.lr}: pochi lo preparano ancora, ed è il motivo per cui lo raccontiamo.`);
  if (v.dist && v.dist.length) out.push(`È fatto di ${elencoE(v.dist.map(([c]) => (D.voci[c] || {}).n).filter(Boolean).map(x => x.toLowerCase()))}.`);
  if (v.feste && v.feste.length) out.push(`Si prepara per ${elencoE(v.feste.map(f => D.feste[f].n))}.`);
  else if (v.m && v.m.length && v.m.length < 12) { const M = new Set(v.m), ini = [...M].find(m => !M.has(m === 1 ? 12 : m - 1)), fin = [...M].find(m => !M.has(m === 12 ? 1 : m + 1)); if (ini && fin && [...M].length === ((fin - ini + 12) % 12) + 1) out.push(ini === fin ? `Il suo mese è ${MESIL[ini - 1]}.` : `Il suo tempo va da ${MESIL[ini - 1]} a ${MESIL[fin - 1]}.`); }
  if (v.usi.length) out.push(`Lo ritrovi dentro ${elencoE(v.usi.slice(0, 3).map(u => D.voci[u].n))}${v.usi.length > 3 ? ' e altro ancora' : ''}.`);
  if (v.web) out.push(`${!P.length && v.zona ? `Lo segnalano per ${v.zona}. ` : ''}Lo abbiamo trovato in ${v.fw.length > 1 ? v.fw.length + ' fonti del web' : 'una fonte del web'}: nome e luogo sono un primo indizio, ricetta e storia vanno ancora verificate sui libri.`);
  if (v.elenco && !out.length) out.push(`Uno dei dolci dell'elenco di Oscar Cangelosi${v.nota ? `: ${v.nota}` : ''}.`);
  return out;
}
const SAGRE = () => SAP.sagre && SAP.sagre.eventi ? Promise.resolve(SAP.sagre) : (SAP.sagre = fetch('data/sagre.json').then(r => r.json()).catch(() => ({ eventi: [] })));
function sagreDi(paesi, nome) { const oi = new Date().toISOString().slice(0, 10), w = norm(nome || '').split(/\s+/).filter(x => x.length > 4);
  return Promise.resolve(SAGRE()).then(sg => { SAP.sagre = sg; return (sg.eventi || []).filter(e => e.d[e.d.length - 1] >= oi && e.t !== 'presepe' && ((e.p && paesi.includes(e.p)) || (w.length && w.some(x => norm(e.n).includes(x))))); }); }
function eroe5(id, img, cap) { return `<div class="eroe5" id="${id}"${img ? ` style="background-image:url('${img}')"` : ''}></div>${cap ? `<p class="cap5" id="${id}c">${cap}</p>` : `<p class="cap5" id="${id}c"></p>`}`; }
function sapVoce(k) {
  const D = SAP.D, v = D.voci[k]; cur = 'SAP:' + k; selez(''); $('sheet').classList.add('narr');
  const g = GUSTO[catDi(v)], cat = g ? g[1] : SAPT[v.t][0];
  testata(v.n, '', '');
  const fr = racconto5(v), kick = [cat, ...(v.ric || []).filter(r => r !== 'PAT'), v.pat ? 'Prodotto tradizionale' : '', v.lr ? 'Lista rossa: ' + v.lr : ''].filter(Boolean);
  let h = `<article class="nar5">${eroe5('sve', v.fo ? `foto/${v.fo.f}.webp` : '', v.fo ? `${esc(v.fo.t)}. Foto di Oscar Cangelosi` : '')}
    <div class="nh5"><p class="kick">${kick.map(esc).join(' · ')}</p><h2>${esc(v.n)}</h2>${v.nd && norm(v.nd) !== norm(v.n) ? `<p class="dial">in siciliano <i>${esc(v.nd)}</i></p>` : ''}</div>
    ${fr.length ? `<p class="lede">${esc(fr[0])}</p>${fr.length > 1 ? `<p class="corpo">${esc(fr.slice(1).join(' '))}</p>` : ''}` : ''}
    <div class="cta5">${v.paesi ? `<button data-vmap="${k}">${ico('map-pin', 'xs')} Vedi sulla mappa</button>` : ''}${v.paesi && v.paesi.length === 1 ? `<button data-s="${v.paesi[0]}">${ico('basket', 'xs')} Cosa si mangia a ${esc(D.paesi[v.paesi[0]].n)}</button>` : ''}</div>
    <div id="swk"></div><div id="ssag"></div>`;
  if (v.paesi || v.prov) h += `<section class="ns5"><h3>Dove nasce</h3><div class="mm5">${mappaSicilia({ w: 400, nomi: true, evid: v.paesi || [] })}</div>${v.paesi ? `<div class="chips5">${v.paesi.map(p => `<button data-s="${p}">${esc(D.paesi[p].n)}</button>`).join('')}</div>` : `<p class="note">${v.prov.length === 9 ? 'In tutta la Sicilia' : 'Provincia di ' + v.prov.map(x => PROVN[x]).join(', ')}.</p>`}${v.zind ? '<p class="note">Zona indicativa: i comuni esatti sono nel disciplinare di produzione.</p>' : ''}</section>`;
  if (v.sp) h += `<section class="ns5"><h3>Nella natura</h3><div class="links"><button data-spn="${esc(v.sp)}">${ico('leaf', 'xs')} <i>${esc(v.sp)}</i><br><small>La pianta, dove cresce e quando fiorisce</small></button></div></section>`;
  if (v.dist) h += `<section class="ns5"><h3>Di cosa è fatto</h3>${distinta(k, 0)}</section>`;
  if (v.usi.length) h += `<section class="ns5"><h3>Dove si usa</h3><div class="links">${v.usi.map(u => lnk(u)).join('')}</div></section>`;
  if (v.ver) h += `<section class="ns5"><h3>Versioni documentate</h3>${v.ver.map(x => { const f = D.fonti[x.f] || {}, tit = { rif: 'Versione di riferimento', var: 'Variante lecita', dev: 'Non tradizionale' }[x.tipo];
    return `<div class="ver ${x.tipo}"><b>${tit}</b>${x.cert ? ` <span class="cert">${esc(x.cert)}</span>` : ''}<small>${esc(f.a || '')}${f.t ? ', <i>' + esc(f.t) + '</i>' : ''}</small>${x.ingr ? `<p>${esc(x.ingr.join(' · '))}</p>` : ''}${x.nota ? `<p class="note">${esc(x.nota)}</p>` : ''}</div>`; }).join('')}</section>`;
  if (v.m || v.feste) h += `<section class="ns5"><h3>Quando</h3>${v.m ? `<div class="mesi">${MESI.map((m, i) => `<span class="${v.m.includes(i + 1) ? 'on' : ''}">${m}</span>`).join('')}</div>` : ''}${v.feste ? `<div class="links">${v.feste.map(f => `<button data-festa="${f}">${ico('calendar-event', 'xs')} ${esc(D.feste[f].n)}<br><small>${D.feste[f].d === 'mobile' ? 'data mobile' : +D.feste[f].d.slice(3) + ' ' + MESIL[+D.feste[f].d.slice(0, 2) - 1]}</small></button>`).join('')}</div>` : ''}</section>`;
  const chi = Object.values(D.produttori).filter(p => p.fa.includes(k));
  if (chi.length) h += `<section class="ns5"><h3>Chi lo fa oggi</h3><div class="links">${chi.map(p => lnk(p.k, RUOLO[p.r][0] + ' · ' + D.paesi[p.paese].n + ' · ' + p.liv)).join('')}</div></section>`;
  const vg = Object.entries(D.viaggi).filter(([, x]) => x.voce === k || x.tappe.some(t => t[1] === k));
  if (vg.length) h += `<section class="ns5"><h3>Segui il viaggio</h3><div class="links">${vg.map(([i, x]) => `<button data-viaggio="${i}">${ico('route-2', 'xs')} ${esc(x.n)}<br><small>${x.tappe.length} tappe, dal campo alla tavola</small></button>`).join('')}</div></section>`;
  const stesso = Object.values(D.voci).filter(x => x.k !== k && x.paesi && v.paesi && x.paesi.some(p => v.paesi.includes(p))).sort((a, b) => (!!b.fo - !!a.fo) || (!!b.wk - !!a.wk)).slice(0, 6);
  const nat = v.paesi ? natVicina(D.paesi[v.paesi[0]].c) : [];
  if (stesso.length) h += `<section class="ns5"><h3>Nello stesso posto</h3><div class="mini5">${stesso.map(x => `<button data-s="${x.k}"><span${imgAttr(x)}></span><b>${esc(x.n)}</b></button>`).join('')}</div></section>`;
  if (nat.length) h += `<section class="ns5"><h3>La natura intorno</h3><div class="links">${nat.map(([z, d]) => `<button data-nat="${z}">${ico('leaf', 'xs')} ${esc(S[z].n)}<br><small>a ${Math.round(d / 1000)} km</small></button>`).join('')}</div></section>`;
  const fonti = [...new Set((v.ver || []).map(x => x.f).concat(v.pat ? ['pat'] : [], v.zind ? ['dopigp'] : [], v.elenco ? ['listaoscar'] : [], v.fw || []))].map(f => D.fonti[f]).filter(Boolean);
  if (v.sfu && !fonti.some(f => f.u && f.u[0] === v.sfu)) fonti.push({ a: 'scheda del presidio Slow Food', web: true, u: [v.sfu] });
  h += `<p class="src">Il racconto è costruito dai dati delle fonti: ${fonti.length ? fonti.map(f => f.web ? `<a href="${esc(f.u[0])}" target="_blank" rel="noopener">${esc(f.a)}</a>` : esc(f.a) + ', <i>' + esc(f.t) + '</i>').join(' · ') : 'da inserire'}. ${esc(D.nota)}</p></article>`;
  $('sb').innerHTML = h; mostra(); sapWiki(v, cur); sapFoto($('sb'));
  if (!v.fo) { const metti = (u, c) => { if (cur !== 'SAP:' + k || !$('sve')) return; $('sve').style.backgroundImage = `url('${u}')`; $('svec').innerHTML = c; };
    if (v.wk) sapImg(v.wk).then(w => { if (w) metti(w.thumbnail.source.replace(/\/\d+px-/, '/800px-'), `Foto da Wikipedia: <a href="${esc(w.content_urls.desktop.page)}" target="_blank" rel="noopener">${esc(w.title)}</a>, CC BY-SA`); });
    else sapImgV(k).then(r => { if (r) metti(r.u, `${esc(r.a ? r.a + ', ' : '')}${esc(r.l || 'CC BY-SA')}, da <a href="${esc(r.p)}" target="_blank" rel="noopener">${esc(r.src)}</a>`); }); }
  sagreDi(v.paesi || [], v.n).then(l => { if (!l.length || cur !== 'SAP:' + k || !$('ssag')) return; $('ssag').innerHTML = `<section class="ns5 sag5"><h3>Da segnare in calendario</h3>${l.slice(0, 3).map(e => `<button data-scal="${e.id}"><b>${+e.d[0].slice(8)} ${MESIL[+e.d[0].slice(5, 7) - 1]}</b><span>${esc(e.n)}<small>${esc(e.c)}</small></span></button>`).join('')}</section>`; });
  if (v.paesi && vista === 'mappa' && !SAP.home) sapVola(D.paesi[v.paesi[0]].c, 9);
}
function sapProduttore(k) {
  const D = SAP.D, p = D.produttori[k], r = RUOLO[p.r], seg = p.liv === 'Segnalato'; cur = 'SAP:' + k; selez('');
  testata(p.n, `${p.tipo ? esc(p.tipo[0].toUpperCase() + p.tipo.slice(1)) : r[0]} · ${esc(D.paesi[p.paese].n)}`, seg ? `<span class="badge liv">Segnalato · da visitare</span>` : `<span class="badge liv ${p.liv === 'Verificato' ? 'ok' : ''}">${esc(p.liv)}${p.data ? ' il ' + p.data.split('-').reverse().join('/') : ''}</span><span class="badge prova">Esempio inventato</span>`);
  let h = seg ? `<div class="racconto"><p>Lo segnalano: ${(p.seg || []).map(([a, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(a)}</a>`).join('; ')}.</p><p>Non lo abbiamo ancora visitato. Dopo la visita qui troverai la sua storia, le persone, le foto e la filiera.</p></div>`
    : `<div class="racconto"><p>Scheda di prova: qui andranno la storia dell'azienda, le persone, le foto e la filiera dichiarata o verificata.</p></div>`;
  if (p.fa.length) h += `<h3>Cosa fa</h3><div class="links">${p.fa.map(x => lnk(x)).join('')}</div>`;
  if (p.da) h += `<h3>Da chi compra</h3><div class="links">${p.da.map(x => lnk(x)).join('')}</div>`;
  if (p.a) h += `<h3>A chi vende</h3><div class="links">${p.a.map(x => lnk(x)).join('')}</div>`;
  if (p.esp) h += `<h3>Esperienze</h3><p class="racconto">${esc(p.esp)}</p>`;
  if (p.sito) h += `<h3>Contatti</h3><div class="links"><a class="btnl" href="${esc(p.sito)}" target="_blank" rel="noopener">${ico('link', 'sm')} Sito dell'azienda</a></div>`;
  const vic = Object.values(D.produttori).filter(x => x.k !== k && x.paese === p.paese).slice(0, 6);
  if (vic.length) h += `<h3>Nello stesso paese</h3><div class="links">${vic.map(x => lnk(x.k)).join('')}</div>`;
  h += `<h3>Livelli di verifica</h3><p class="note"><b>Segnalato</b>: lo indica una fonte pubblica affidabile, ma non lo abbiamo ancora visitato. <b>Dichiarato</b>: informazioni date dall'azienda. <b>Verificato</b>: visita fatta e filiera controllata, con la data. <b>Certificato</b>: marchi ufficiali. Nessuno entra pagando.</p><p class="src">${seg ? 'Fonti consultate il 28/11/2026. Se trovi un errore, scrivici.' : esc(D.nota)}</p>`;
  $('sb').innerHTML = h; mostra(); if (vista === 'mappa') sapVola(D.paesi[p.paese].c, 10);
}
function sapPaese(k) {
  const D = SAP.D, p = D.paesi[k]; if (!p) return; cur = 'SAP:' + k; selez(''); $('sheet').classList.add('narr');
  SAP.visti = (SAP.visti || []).filter(x => x !== k).concat(k).slice(-12);
  const voci = Object.values(D.voci).filter(v => (v.paesi || []).includes(k)), prov = Object.values(D.voci).filter(v => !(v.paesi || []).includes(k) && (v.prov || []).includes(p.pv) && (v.prov || []).length < 9);
  const prod = Object.values(D.produttori).filter(x => x.paese === k), fe = Object.entries(D.feste).filter(([, f]) => f.paesi.includes(k)), nat = natVicina(p.c);
  const dol = voci.filter(v => v.t === 'dolce').length, dop = voci.filter(v => (v.ric || []).some(r => r === 'DOP' || r === 'IGP')), pat = voci.filter(v => v.pat).length;
  const nC = {}; for (const v of Object.values(D.voci)) for (const q of (v.paesi || [])) nC[q] = (nC[q] || 0) + 1;
  const inProv = Object.entries(D.paesi).filter(([q, x]) => x.pv === p.pv && nC[q]).map(([q]) => q);
  const rk = Object.keys(D.paesi).filter(q => D.paesi[q].pv === p.pv).sort((a, b) => (nC[b] || 0) - (nC[a] || 0)).indexOf(k) + 1;
  const vicini = Object.entries(D.paesi).filter(([q]) => q !== k && nC[q]).map(([q, x]) => [q, hav(p.c, x.c)]).sort((a, b) => a[1] - b[1]).slice(0, 5);
  const top = voci.slice().sort((a, b) => ((b.ric || []).length + !!b.fo * 2 + !!b.wk) - ((a.ric || []).length + !!a.fo * 2 + !!a.wk));
  testata(p.n, '', '');
  const fr = [];
  if (voci.length) fr.push(`A ${p.n} sono documentati ${voci.length} ${voci.length === 1 ? 'sapore' : 'sapori'}${dol ? `, ${dol === voci.length ? 'tutti dolci' : `di cui ${dol} ${dol === 1 ? 'dolce' : 'dolci'}`}` : ''}.`);
  if (dop.length) fr.push(`Qui nasce ${elencoE(dop.map(v => v.n))}, con denominazione riconosciuta in Europa.`);
  else if (top[0]) fr.push(`Il più conosciuto è ${top[0].n}.`);
  if (rk && rk <= 3 && voci.length > 3) fr.push(`È tra i tre comuni più ricchi di sapori della provincia di ${PROVN[p.pv]}.`);
  if (fe.length) fr.push(`Le feste da segnare: ${elencoE(fe.map(([, f]) => f.n))}.`);
  if (nat[0]) fr.push(`A ${Math.round(nat[0][1] / 1000)} km c'è ${S[nat[0][0]].n}.`);
  let h = `<article class="nar5">${eroe5('spe', '', '')}
    <div class="nh5"><p class="kick">Comune · Provincia di ${esc(PROVN[p.pv] || '')}</p><h2>${esc(p.n)}</h2></div>
    ${fr.length ? `<p class="lede">${esc(fr[0])}</p>${fr.length > 1 ? `<p class="corpo">${esc(fr.slice(1).join(' '))}</p>` : ''}` : '<p class="lede">Qui non abbiamo ancora documentato sapori. Se ne conosci uno, raccontacelo.</p>'}
    <div class="cta5"><button data-pmap="${k}">${ico('map-pin', 'xs')} Vedi sulla mappa</button></div>
    <div id="ssag"></div>
    ${voci.length ? `<section class="ns5"><h3>Cosa assaggiare</h3><div class="mini5 big">${top.slice(0, 6).map(x => `<button data-s="${x.k}"><span${imgAttr(x)}></span><b>${esc(x.n)}</b><small>${esc([(x.ric || []).join(', '), x.fam && x.fam !== 'Altri dolci' ? x.fam : ''].filter(Boolean).join(', ') || SAPT[x.t][0])}</small></button>`).join('')}</div>
      ${top.length > 6 ? `<details class="prov"><summary>E altri ${top.length - 6}</summary><div class="chips5">${top.slice(6).map(x => `<button data-s="${x.k}">${esc(x.n)}</button>`).join('')}</div></details>` : ''}</section>` : ''}
    <section class="ns5"><h3>Dove si trova</h3><div class="mm5">${mappaSicilia({ w: 400, nomi: true, sel: k })}</div><p class="note">${inProv.length} comuni della provincia di ${esc(PROVN[p.pv])} hanno sapori documentati.</p></section>
    ${fe.length ? `<section class="ns5"><h3>Feste</h3><div class="links">${fe.map(([i, f]) => `<button data-festa="${i}">${ico('calendar-event', 'xs')} ${esc(f.n)}</button>`).join('')}</div></section>` : ''}
    ${nat.length ? `<section class="ns5"><h3>La natura intorno</h3><div class="links">${nat.map(([z, d]) => `<button data-nat="${z}">${ico('leaf', 'xs')} ${esc(S[z].n)}<br><small>a ${Math.round(d / 1000)} km</small></button>`).join('')}</div></section>` : ''}
    ${vicini.length ? `<section class="ns5"><h3>Qui vicino</h3><div class="chips5">${vicini.map(([q, d]) => `<button data-s="${q}">${esc(D.paesi[q].n)}<em>${Math.round(d / 1000)} km</em></button>`).join('')}</div></section>` : ''}
    ${prov.length ? `<details class="prov"><summary>In provincia di ${esc(PROVN[p.pv])}: altri ${prov.length} prodotti tradizionali</summary><div class="links">${prov.map(v => lnk(v.k)).join('')}</div></details>` : ''}
    ${prod.length ? `<section class="ns5"><h3>Chi lo fa qui</h3><div class="links">${prod.map(x => lnk(x.k)).join('')}</div></section>` : ''}
    <p class="src">Il racconto è costruito dai dati: elenchi PAT, DOP e IGP, elenco dei dolci di Oscar Cangelosi. ${esc(D.nota)}</p></article>`;
  $('sb').innerHTML = h; mostra(); sapFoto($('sb'));
  wikiVoce(p.n + (['Licata', 'Ribera'].includes(p.n) ? '' : '')).then(w => { if (!w || cur !== 'SAP:' + k || !$('spe') || !w.thumbnail || NOFOTO.test(w.thumbnail.source)) return;
    $('spe').style.backgroundImage = `url('${w.thumbnail.source.replace(/\/\d+px-/, '/800px-')}')`; $('spec').innerHTML = `Foto da Wikipedia: <a href="${esc(w.content_urls.desktop.page)}" target="_blank" rel="noopener">${esc(w.title)}</a>, CC BY-SA`; });
  sagreDi([k], '').then(l => { if (!l.length || cur !== 'SAP:' + k || !$('ssag')) return; $('ssag').innerHTML = `<section class="ns5 sag5"><h3>Prossimamente a ${esc(p.n)}</h3>${l.slice(0, 3).map(e => `<button data-scal="${e.id}"><b>${+e.d[0].slice(8)} ${MESIL[+e.d[0].slice(5, 7) - 1]}</b><span>${esc(e.n)}<small>${esc(e.desc)}</small></span></button>`).join('')}</section>`; });
  if (vista === 'mappa' && !SAP.home) sapVola(p.c, 10);
}
function sapViaggio(i) {
  const D = SAP.D, x = D.viaggi[i];
  const go = () => {
    const pts = x.tappe.map(([p]) => { const c = D.paesi[D.produttori[p].paese].c; return c; });
    map.getSource('sapv').setData({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: pts } }] });
    const bb = pts.reduce((b, c) => [Math.min(b[0], c[0]), Math.min(b[1], c[1]), Math.max(b[2], c[0]), Math.max(b[3], c[1])], [180, 90, -180, -90]);
    map.fitBounds([[bb[0], bb[1]], [bb[2], bb[3]]], { padding: padMappa(), maxZoom: 10, duration: 700 });
    cur = 'SAP:v:' + i; selez('');
    testata(x.n, 'Il viaggio della materia prima', PROVA);
    $('sb').innerHTML = `<ol class="tappe">${x.tappe.map(([p, v], n) => { const P = D.produttori[p], V = D.voci[v]; return `<li><span class="nt">${n + 1}</span><div><button data-s="${p}"><b>${esc(P.n)}</b><small>${esc(RUOLO[P.r][0])} · ${esc(D.paesi[P.paese].n)}</small></button><button data-s="${v}" class="vv">${icoV(V)} ${esc(V.n)}</button></div></li>`; }).join('')}</ol><p class="note">Sulla mappa la linea collega le tappe in ordine. In futuro: itinerario da fare davvero, con PDF e link come per i percorsi.</p><p class="src">${esc(D.nota)}</p>`;
    mostra();
  };
  if (vista !== 'mappa' || SAP.home) { SAP.home = false; vai('mappa'); setTimeout(go, 400); } else go();
}
function sapFesta(i) { SAP.mese = (SAP.D.feste[i].m || [SAP.mese])[0]; vai('meteo'); }
$('sheet').addEventListener('click', e => {
  const vm = e.target.closest('[data-vmap],[data-pmap],[data-scal],.mm5 circle[data-sc]');
  if (vm) { e.stopPropagation(); const D = SAP.D;
    if (vm.dataset.scal) { const ev = (SAP.sagre.eventi || []).find(x => x.id === vm.dataset.scal); if (ev) { SAP.cal = { y: +ev.d[0].slice(0, 4), m: +ev.d[0].slice(5, 7), sel: ev.d[0], tipo: '', pv: '' }; versoSapori(() => vai('meteo')); } return; }
    if (vm.dataset.sc) return sapPaese(vm.dataset.sc);
    const c = vm.dataset.vmap ? D.paesi[D.voci[vm.dataset.vmap].paesi[0]].c : D.paesi[vm.dataset.pmap].c, keep = cur;
    const vola = () => { sapVola(c, 10); };
    if (vista !== 'mappa' || SAP.home || NAT.home) { SAP.home = false; NAT.home = false; vai('mappa'); setTimeout(() => { vola(); const kk = keep.slice(4); D.voci[kk] ? sapVoce(kk) : sapPaese(kk); }, 450); } else vola();
    return; }
  const b = e.target.closest('[data-s],[data-viaggio],[data-festa],[data-spn],[data-nat]'); if (!b || (!SAP.on && !String(cur).startsWith('SAP:'))) return;
  if (b.dataset.s) sapApri(b.dataset.s); else if (b.dataset.viaggio) sapViaggio(b.dataset.viaggio); else if (b.dataset.festa) sapFesta(b.dataset.festa);
  else if (b.dataset.spn) CAT.then(() => { const i = trovaPianta(b.dataset.spn); if (i >= 0) apriSpecie('piante', i); });
  else if (b.dataset.nat) { sapModo(false); setTimeout(() => apri(b.dataset.nat, true), 300); }
});

/* ---- catalogo */
function sapCatalogo() {
  if (typeof segnaRotta === 'function') setTimeout(segnaRotta, 0);
  const D = SAP.D, F = SAP.fil, w = norm(F.q.trim()).split(/\s+/).filter(Boolean);
  const tutti = Object.values(D.voci);
  const okK = v => F.k === 'tutto' || (F.k === 'ingr' ? (v.t === 'materia' || v.t === 'semi') : (catDi(v) === F.k && v.t !== 'materia' && v.t !== 'semi'));
  const okR = v => !F.ric || (F.ric === 'tut' ? (v.ric || []).some(r => r === 'DOP' || r === 'IGP') : (v.ric || []).includes('PAT'));
  const lista = F.k === 'prod' ? [] : tutti.filter(v => okK(v) && okR(v) && (!F.paese || (v.paesi || []).includes(F.paese) || (v.prov || []).includes((D.paesi[F.paese] || {}).pv)) && (!F.festa || (v.feste || []).includes(F.festa)) && (!F.lr || v.lr === F.lr) && (!F.fam || v.fam === F.fam) && w.every(x => contiene(norm(v.n + ' ' + (v.nd || '') + ' ' + (v.fam || '') + ' ' + nomiPaesi(v)), x)));
  const prod = (F.k === 'prod' || F.k === 'tutto') ? Object.values(D.produttori).filter(p => (!F.paese || p.paese === F.paese) && w.every(x => norm(p.n + ' ' + D.paesi[p.paese].n).includes(x))) : [];
  const conta = k => k === 'tutto' ? tutti.length : k === 'prod' ? Object.keys(D.produttori).length : tutti.filter(v => (F.k = k, okK(v))).length;
  const kk = F.k, cat = [['tutto', 'Tutto'], ...GUSTI.map(g => [g[0], g[1]]), ['ingr', 'Ingredienti'], ['prod', 'Produttori']];
  const sel = (id, val, opts, vuoto) => `<select class="tendina" id="${id}"><option value="">${vuoto}</option>${opts.map(([k, n]) => `<option value="${k}"${val === k ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
  const card = v => tessera(v, [(v.ric || []).join(', '), v.paesi ? nomiPaesi(v) : v.prov ? (v.prov.length === 9 ? 'tutta la Sicilia' : 'provincia di ' + v.prov.map(x => PROVN[x]).join(', ')) : v.zona || '', v.fam && v.fam !== 'Altri dolci' ? v.fam : '', v.web ? 'da verificare' : ''].filter(Boolean).join(', ').slice(0, 110));
  const cardP = p => `<button class="card prodc" data-sc="${p.k}"><span class="ph" style="color:${RUOLO[p.r][2]}">${ico(RUOLO[p.r][1], 'phi')}</span><span class="tx"><b class="nc">${esc(p.n)}</b><small>${esc(RUOLO[p.r][0] + ' · ' + D.paesi[p.paese].n)}</small><span class="tag">${esc(p.liv)}</span></span></button>`;
  const fresh = $('cat').dataset.v !== 'sap-cat';
  if (fresh) {
    $('cat').dataset.v = 'sap-cat'; $('cat').scrollTop = 0;
    $('cat').innerHTML = `<div class="in"><h2 id="sgt">${GUSTO[F.k] ? esc(GUSTO[F.k][1]) : 'Catalogo dei sapori'}</h2><p class="lead" id="sgl">${GUSTO[F.k] && DESCG[F.k] ? DESCG[F.k] + '. Filtra per paese, festa o riconoscimento, oppure cambia famiglia qui sotto.' : 'Dolci, prodotti tradizionali, DOP e IGP, piatti, ingredienti e chi li fa.'}</p>
      <div class="cerca"><input id="sq" type="search" placeholder="Cerca un dolce, un ingrediente, un paese" value="${esc(F.q)}" autocomplete="off"></div>
      <div class="grp" id="sg"></div>
      <div class="sfil">${sel('sfp', F.paese, Object.entries(D.paesi).sort((a, b) => a[1].n.localeCompare(b[1].n)).map(([k, p]) => [k, p.n]), 'Tutti i paesi')}${sel('sff', F.festa, Object.entries(D.feste).map(([k, f]) => [k, f.n]), 'Tutte le feste')}${sel('sfa', F.fam, [...new Set(tutti.map(v => v.fam).filter(Boolean))].sort().map(x => [x, x]), 'Tutte le famiglie')}${sel('sfr', F.ric || '', [['tut', 'DOP e IGP'], ['pat', 'Prodotti tradizionali (PAT)']], 'Tutti i riconoscimenti')}${sel('sfl', F.lr, Object.keys(LRC).map(k => [k, k]), 'Lista rossa: tutti')}</div>
      <p class="cnt" id="sn"></p><div class="griglia" id="sgr"></div><button class="altri" id="sz" style="display:none"></button>${COPY()}</div>`;
    $('sq').oninput = e => { SAP.fil.q = e.target.value; sapCatalogo(); };
    $('sfp').onchange = e => { SAP.fil.paese = e.target.value; sapCatalogo(); };
    $('sff').onchange = e => { SAP.fil.festa = e.target.value; sapCatalogo(); };
    $('sfl').onchange = e => { SAP.fil.lr = e.target.value; sapCatalogo(); };
    $('sfr').onchange = e => { SAP.fil.ric = e.target.value; SAP.fil.n = 60; sapCatalogo(); };
    $('sfa').onchange = e => { SAP.fil.fam = e.target.value; SAP.fil.n = 60; sapCatalogo(); };
    $('sz').onclick = () => { SAP.fil.n += 60; sapCatalogo(); };
  }
  const cnt = Object.fromEntries(cat.map(([k]) => [k, conta(k)])); F.k = kk;
  $('sg').innerHTML = cat.map(([k, n]) => `<button data-sk="${k}" class="${F.k === k ? 'on' : ''}">${GUSTO[k] ? `<span class="tpi" style="color:${GUSTO[k][3]}">${ico(GUSTO[k][2], 'xs')}</span>` : ''}${n}<em>${cnt[k]}</em></button>`).join('');
  const nf = (F.paese ? 1 : 0) + (F.festa ? 1 : 0) + (F.lr ? 1 : 0) + (F.fam ? 1 : 0) + (F.ric ? 1 : 0);
  $('sn').innerHTML = `${lista.length + prod.length} risultati${nf ? ` · <button class="azzera" id="saz">Azzera filtri</button>` : ''}`;
  const tot = lista.map(card).concat(prod.map(cardP)); $('sgr').innerHTML = tot.slice(0, F.n).join(''); $('sz').textContent = 'Mostra altri'; $('sz').style.display = tot.length > F.n ? 'block' : 'none'; sapFoto($('sgr'));
  if ($('saz')) $('saz').onclick = () => { Object.assign(SAP.fil, { paese: '', festa: '', lr: '', fam: '', ric: '' }); $('cat').dataset.v = ''; sapCatalogo(); };
}

/* ---- calendario */
function sapCalendario() {
  if (!SAP.sagre) { SAP.sagre = fetch('data/sagre.json').then(r => r.json()).catch(() => ({ eventi: [] })); }
  Promise.resolve(SAP.sagre).then(sg => { SAP.sagre = sg; calDisegna(); });
}
const TIPI = { sagra: ['Sagre e feste del gusto', 'Sagra', '#E8761A'], mercatino: ['Mercatini', 'Mercatino', '#B85300'], presepe: ['Presepi viventi', 'Presepe vivente', '#7A5C3E'] };
const GIORNI = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function calDisegna() {
  const D = SAP.D, E = SAP.sagre.eventi || [], oggi = new Date(), oi = iso(oggi);
  const C = SAP.cal = SAP.cal || { y: oggi.getFullYear(), m: oggi.getMonth() + 1, sel: '', tipo: '', pv: '' };
  if (!C.sel) { const pr = E.flatMap(e => e.d).filter(d => d >= oi).sort()[0]; C.sel = pr || oi; const [y, m] = C.sel.split('-'); C.y = +y; C.m = +m; }
  const ok = e => (!C.tipo || e.t === C.tipo) && (!C.pv || e.pv === C.pv);
  const vis = E.filter(ok), perG = {}; for (const e of vis) for (const d of e.d) (perG[d] = perG[d] || []).push(e);
  const futuri = E.filter(e => e.d[e.d.length - 1] >= oi), nS = futuri.filter(e => e.t === 'sagra').length, nP = futuri.filter(e => e.t === 'presepe').length, nM = futuri.filter(e => e.t === 'mercatino').length;
  // griglia del mese, da lunedì
  const p1 = new Date(C.y, C.m - 1, 1), off = (p1.getDay() + 6) % 7, gg = new Date(C.y, C.m, 0).getDate(), celle = [];
  for (let i = 0; i < off; i++) celle.push('<span class="vuoto"></span>');
  for (let d = 1; d <= gg; d++) { const k = `${C.y}-${String(C.m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, ev = perG[k] || [];
    celle.push(`<button class="gio${k === C.sel ? ' sel' : ''}${k === oi ? ' oggi' : ''}${k < oi ? ' pass' : ''}${ev.length ? ' pieno' : ''}" data-cday="${k}" aria-label="${d} ${MESIL[C.m - 1]}, ${ev.length} appuntamenti"><b>${d}</b>${ev.slice(0, 3).map(e => `<i class="t-${e.t}">${esc(e.c)}</i>`).join('')}${ev.length > 3 ? `<em>+${ev.length - 3}</em>` : ''}</button>`); }
  const delG = (perG[C.sel] || []).slice().sort((a, b) => (a.t > b.t) - (a.t < b.t));
  const [sy, sm, sd] = C.sel.split('-').map(Number), selD = new Date(sy, sm - 1, sd);
  const nomeG = `${['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'][selD.getDay()]} ${sd} ${MESIL[sm - 1]}`;
  const delMese = vis.filter(e => e.d.some(d => d.startsWith(`${C.y}-${String(C.m).padStart(2, '0')}`)));
  const quando = e => { const d = e.d.map(x => +x.slice(8)), m = MESIL[+e.d[0].slice(5, 7) - 1]; if (d.length === 1) return `${d[0]} ${m}`; const cons = d.every((x, i) => !i || x === d[i - 1] + 1); return cons ? `dal ${d[0]} al ${d[d.length - 1]} ${m}` : `${d.join(', ')} ${m}`; };
  const ics = e => { const a = e.d[0].replace(/-/g, ''), z = new Date(+e.d[e.d.length - 1].slice(0, 4), +e.d[e.d.length - 1].slice(5, 7) - 1, +e.d[e.d.length - 1].slice(8) + 1), b = iso(z).replace(/-/g, '');
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Sicilia Naturale//IT\r\nBEGIN:VEVENT\r\nUID:${e.id}@sicilianaturale\r\nDTSTAMP:20261127T000000Z\r\nDTSTART;VALUE=DATE:${a}\r\nDTEND;VALUE=DATE:${b}\r\nSUMMARY:${e.n} a ${e.c}\r\nLOCATION:${e.c} (${e.pv})\r\nDESCRIPTION:${e.desc} Verifica date e orari con gli organizzatori. Fonte: ${e.f}\r\nEND:VEVENT\r\nEND:VCALENDAR`); };
  const scheda = e => `<article class="ev5 t-${e.t}"><div class="et"><span class="tag">${TIPI[e.t][1]}</span><small>${quando(e)}</small></div><h3>${esc(e.n)}</h3><p class="dove">${esc(e.c)}, provincia di ${esc(PROVN[e.pv] || e.pv)}</p><p>${esc(e.desc)}</p>
    <div class="ea">${e.p ? `<button data-sc="${e.p}">Cosa si mangia a ${esc(e.c)}</button>` : ''}<a href="${ics(e)}" download="${esc(e.n.replace(/[^\w]+/g, '-'))}.ics">Aggiungi al tuo calendario</a><a href="${esc(e.f)}" target="_blank" rel="noopener">Fonte</a></div></article>`;
  const punti = delMese.map(e => ({ xy: e.xy, id: e.id, t: e.t, on: e.d.includes(C.sel), tit: `${e.n}, ${e.c}: ${quando(e)}` }));
  const mesiCon = [...new Set(E.flatMap(e => e.d.map(d => d.slice(0, 7))))].sort();
  const D2 = SAP.D, fe = Object.entries(D2.feste).filter(([, f]) => f.m.includes(C.m)), st = Object.values(D2.voci).filter(v => (v.m || []).includes(C.m) && v.t !== 'materia');
  $('cat').dataset.v = 'sap-cal';
  $('cat').innerHTML = `<div class="sh5 cal5">
    <section class="s5 tc"><h1>Calendario dei sapori</h1>
      <p class="lead">Da oggi a fine dicembre in Sicilia ci sono ${nS} sagre e feste del gusto, ${nM} mercatini e ${nP} presepi viventi. Scegli un giorno: vedi dove andare e cosa si mangia.</p>
      <div class="fil5">${[['', 'Tutto'], ...Object.entries(TIPI).map(([k, v]) => [k, v[0]])].map(([k, n]) => `<button data-ctipo="${k}" class="${C.tipo === k ? 'on' : ''}">${k ? `<i class="t-${k}"></i>` : ''}${n}</button>`).join('')}
        <label class="pv5"><span class="sr">Provincia</span><select id="cpv"><option value="">Tutta la Sicilia</option>${Object.entries(PROVN).map(([k, n]) => `<option value="${k}"${C.pv === k ? ' selected' : ''}>${n}</option>`).join('')}</select></label></div>
    </section>
    <section class="s5 cg5">
      <div class="mese5"><div class="mh"><button data-cmese="-1" aria-label="Mese prima">‹</button><h2>${MESIL[C.m - 1][0].toUpperCase() + MESIL[C.m - 1].slice(1)} ${C.y}</h2><button data-cmese="1" aria-label="Mese dopo">›</button></div>
        <div class="gr5">${GIORNI.map(g => `<span class="gn">${g}</span>`).join('')}${celle.join('')}</div>
        <p class="leg">${Object.entries(TIPI).map(([k, v]) => `<span><i class="t-${k}"></i>${v[1]}</span>`).join('')}</p></div>
      <div class="gio5"><h2>${nomeG[0].toUpperCase() + nomeG.slice(1)}</h2>${delG.length ? delG.map(scheda).join('') : `<p class="vuoto5">Nessun appuntamento in questo giorno${C.tipo || C.pv ? ' con i filtri scelti' : ''}. ${mesiCon.length ? 'Scegli un giorno con un punto colorato.' : ''}</p>`}</div>
    </section>
    <section class="s5 cm5"><div class="t5"><h2>Dove, in ${MESIL[C.m - 1]}</h2><p>${delMese.length} appuntamenti nel mese. I punti pieni sono quelli del giorno scelto.</p></div>
      <div class="cmap">${mappaSicilia({ w: 840, nomi: true, punti })}</div></section>
    ${delMese.length ? `<section class="s5"><div class="t5"><h2>Tutti gli appuntamenti di ${MESIL[C.m - 1]}</h2></div><div class="lista5">${delMese.slice().sort((a, b) => a.d[0] < b.d[0] ? -1 : 1).map(scheda).join('')}</div></section>` : ''}
    ${fe.length ? `<section class="s5"><div class="t5"><h2>Feste e dolci della tradizione</h2></div><div class="rail5">${fe.map(([i, f]) => `<button class="pz5" data-hfesta="${i}"><span class="img">${ico('calendar')}</span><b>${esc(f.n)}</b><small>${f.d === 'mobile' ? 'Data mobile' : +f.d.slice(3) + ' ' + MESIL[+f.d.slice(0, 2) - 1]}${f.paesi.length ? ', ' + esc(f.paesi.map(p => D2.paesi[p].n).join(', ')) : ''}</small></button>`).join('')}</div></section>` : ''}
    ${st.length ? `<section class="s5"><div class="t5"><h2>Di stagione in ${MESIL[C.m - 1]}</h2></div><div class="rail5">${st.slice(0, 20).map(v => `<button class="pz5" data-sc="${v.k}"><span${imgAttr(v)}>${ico((GUSTO[catDi(v)] || ['', '', 'plant'])[2])}</span><b>${esc(v.n)}</b><small>${esc(nomiPaesi(v) || '')}</small></button>`).join('')}</div></section>` : ''}
    <p class="note n5">Date raccolte il 27 novembre 2026 da siti di eventi e giornali locali (fonte indicata in ogni scheda). Date e orari possono cambiare: verifica con gli organizzatori prima di partire.</p>${COPY()}</div>`;
  sapFoto($('cat'));
  $('cpv').onchange = e => { C.pv = e.target.value; calDisegna(); };
}
$('cat').addEventListener('click', e => {
  if (!SAP.on || $('cat').dataset.v !== 'sap-cal') return;
  const C = SAP.cal, d = e.target.closest('[data-cday]'), t = e.target.closest('[data-ctipo]'), m = e.target.closest('[data-cmese]'), pt = e.target.closest('[data-cev]'), hf = e.target.closest('[data-hfesta]');
  if (d) { e.stopPropagation(); C.sel = d.dataset.cday; const y = $('cat').scrollTop; calDisegna(); $('cat').scrollTop = y; return; }
  if (t) { e.stopPropagation(); C.tipo = t.dataset.ctipo; return calDisegna(); }
  if (m) { e.stopPropagation(); C.m += +m.dataset.cmese; if (C.m < 1) { C.m = 12; C.y--; } if (C.m > 12) { C.m = 1; C.y++; } C.sel = `${C.y}-${String(C.m).padStart(2, '0')}-01`; return calDisegna(); }
  if (pt) { e.stopPropagation(); const ev = SAP.sagre.eventi.find(x => x.id === pt.dataset.cev); if (ev) { C.sel = ev.d.find(x => x >= iso(new Date())) || ev.d[0]; calDisegna(); $('cat').querySelector('.gio5').scrollIntoView({ behavior: 'smooth', block: 'start' }); } return; }
  if (hf) { e.stopPropagation(); Object.assign(SAP.fil, { k: 'tutto', festa: hf.dataset.hfesta, q: '', paese: '', lr: '', fam: '', ric: '', n: 60 }); $('cat').dataset.v = ''; vai('specie'); }
}, true);

document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-fil],[data-fv],[data-fs],[data-fpr]'); if (!t || t.closest('#sapcard')) return;
  if (t.dataset.fil) { e.stopPropagation(); if (!SAP.on) return versoSapori(() => sapFiliera(t.dataset.fil)); if ($('cat').classList.contains('on')) return sapFiliera(t.dataset.fil); vai('specie'); return setTimeout(() => sapFiliera(t.dataset.fil), 60); }
  if (t.dataset.fv) { e.stopPropagation(); const [fk, vk] = t.dataset.fv.split(':'); return sapVarieta(fk, vk); }
  if (t.dataset.fs) { e.stopPropagation(); return sapApri(t.dataset.fs); }
  if (t.dataset.fpr) { e.stopPropagation(); return sapProduttore(t.dataset.fpr); }
}, true);
/* ---- itinerari */
function sapItinerari() {
  const D = SAP.D;
  $('cat').dataset.v = 'sap-it'; $('cat').scrollTop = 0;
  $('cat').innerHTML = `<div class="in"><h2>Itinerari del gusto</h2><p class="lead">Il viaggio delle materie prime lungo la filiera: dal campo al laboratorio, fino alla bottega o alla tavola.</p>
    ${Object.keys(D.viaggi).length ? '' : `<div class="racconto"><p>I primi itinerari nasceranno dalle visite ai produttori: un viaggio si pubblica solo quando ogni tappa è stata vista di persona.</p><p>Intanto puoi scoprire i produttori, le osterie, le fattorie e i forni che ti segnaliamo, in attesa della visita.</p></div><div class="links"><button data-sk="prod">${ico('building-store', 'sm')} Vedi i produttori segnalati</button></div>`}
    ${Object.entries(D.viaggi).map(([i, x]) => `<button class="viaggio" data-vg="${i}"><b>${esc(x.n)}</b><span>${x.tappe.map(([p, v]) => `${esc(D.voci[v].n)} <small>${esc(D.paesi[D.produttori[p].paese].n)}</small>`).join(' <em>›</em> ')}</span></button>`).join('')}${COPY()}</div>`;
}
$('cat').addEventListener('click', e => {
  if (!SAP.on) return;
  const c = e.target.closest('[data-sc]'), g = e.target.closest('[data-sk]'), m = e.target.closest('[data-mese]'), vg = e.target.closest('[data-vg]');
  if (g) { SAP.fil.k = g.dataset.sk; $('cat').dataset.v = ''; sapCatalogo(); } else if (m) { SAP.mese = +m.dataset.mese; sapCalendario(); } else if (vg) sapViaggio(vg.dataset.vg); else if (c) { if (c.matches('svg.smap circle')) { SAP.ancora = [e.clientX, e.clientY]; return sapCartaPaese(c.dataset.sc, true); } sapApri(c.dataset.sc); }
}, true);

/* ---- ricerca nella barra in alto */
function sapCerca(v) {
  const D = SAP.D; if (!D) return;
  const w = v.split(/\s+/), r = [];
  for (const x of Object.values(D.voci)) if (w.every(y => norm(x.n + ' ' + (x.nd || '') + ' ' + nomiPaesi(x)).includes(y))) r.push([x.k, x.n, SAPT[x.t][0]]);
  for (const [k, p] of Object.entries(D.paesi)) if (w.every(y => norm(p.n).includes(y))) r.push([k, p.n, 'Paese']);
  for (const p of Object.values(D.produttori)) if (w.every(y => norm(p.n).includes(y))) r.push([p.k, p.n, 'Produttore']);
  $('res').innerHTML = r.length ? r.slice(0, 30).map(([k, n, s]) => `<button data-sres="${k}">${esc(n)}<small>${esc(s)}</small></button>`).join('') : `<button disabled>${t('nessuno')}</button>`;
  $('res').style.display = 'block';
}
$('res').addEventListener('click', e => { const b = e.target.closest('[data-sres]'); if (!b) return; e.stopPropagation(); $('res').style.display = 'none'; $('q').blur(); sapApri(b.dataset.sres); }, true);

/* ---- inizio di Sapori: una domanda, poi ciò che interessa */
const GUSTI = [['dolci', 'Dolci', 'cake'], ['formaggi', 'Formaggi', 'cheese'], ['frutta e ortaggi', 'Frutta e ortaggi', 'lemon-2'], ['pane e pasta', 'Pane e pasta', 'bread'],
  ['gastronomia', 'Piatti', 'bowl'], ['vini', 'Vini', 'glass-full'], ['salumi', 'Salumi e carni', 'meat'], ['pesce', 'Pesce e mare', 'fish'], ['miele', 'Miele', 'droplet'], ['conserve e condimenti', 'Olio, sale e conserve', 'bottle'], ['bevande', 'Liquori', 'bottle']].map(g => g.concat('#E8761A'));
const GUSTO = Object.fromEntries(GUSTI.map(g => [g[0], g]));
var DESCG = { dolci: 'Paste di mandorla, cassate, biscotti delle feste', formaggi: 'Pecorino, ricotta, tuma, provola', 'frutta e ortaggi': 'Agrumi, ficodindia, legumi e ortaggi antichi', 'pane e pasta': 'Pani rituali e grani antichi', gastronomia: 'Piatti di casa e di strada', vini: 'Denominazioni e vitigni dell\'isola', salumi: 'Carni e salumi delle razze locali', pesce: 'Pesce azzurro e conserve di mare', miele: 'Mieli di timo, agrumi, carrubo', 'conserve e condimenti': 'Olio, sale, capperi, conserve', bevande: 'Rosoli e liquori di casa' };
const PROVN = { AG: 'Agrigento', CL: 'Caltanissetta', CT: 'Catania', EN: 'Enna', ME: 'Messina', PA: 'Palermo', RG: 'Ragusa', SR: 'Siracusa', TP: 'Trapani' };
SAP.gusti = new Set((() => { try { return JSON.parse(localStorage.getItem('sn_gusti') || '[]'); } catch (e) { return []; } })());
const salvaGusti = () => { try { localStorage.setItem('sn_gusti', JSON.stringify([...SAP.gusti])); } catch (e) {} };
const catDi = v => v.cat || (v.t === 'dolce' ? 'dolci' : v.t === 'piatto' ? 'gastronomia' : '');
const perGusto = v => !SAP.gusti.size || SAP.gusti.has(catDi(v));
const SAPWK = {};
function sapImg(t) { const ok = w => w && w.thumbnail && !NOFOTO.test(w.thumbnail.source) ? w : null; return SAPWK[t] || (SAPWK[t] = wikiVoce(t).then(w => ok(w) || wikiCerca(t.replace(/\(.*?\)/g, '')).then(ok)).catch(() => null)); }
// foto per le voci senza foto propria: Wikipedia poi Wikimedia Commons, solo se il titolo contiene tutte le parole del nome
const STOPW = new Set('di del della dello dei degli delle da dal dalla e ed o od a al alla allo ai agli alle in con per tra fra il lo la i gli le un uno una sotto sott sicilia siciliano siciliana siciliani siciliane tipico tipica dop igp pat igt doc docg ct pa me ag tp sr rg cl en'.split(' '));
const paroleN = n => norm(n.split('/')[0].split(':')[0].replace(/\(.*?\)/g, ' ')).replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOPW.has(w));
const FUORI = /\b(cines|giappon|indian|american|frances|tedesc|spagnol|portoghes|grec[oaie]|turc[oaih]|arab[oaie]|marocchin|tunisin|ingles|pugli|salent|lecc[ei]|calabr|napol|campan|sard[oaie]|sardegna|tosc|roman[oaie]|lazial|emilia|piemont|lombard|venet|friul|ligur|abruzz|molis|lucan|basilicat|umbr|march[ei]giano|trentin|valdostan|maltes|chines|japan|china|indian)\w*/;
const titoloOk = (n, t, largo) => { const p = paroleN(n), tt = norm(t).replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  const simile = (w, x) => x === w || (w.length > 4 && x.startsWith(w.slice(0, -1)) && Math.abs(x.length - w.length) <= 2);
  if (!p.length || !p.every(w => tt.some(x => simile(w, x)))) return false;
  if (FUORI.test(norm(t))) return false;
  const paesi = SAP.D ? SAP.D._np || (SAP.D._np = new Set(Object.values(SAP.D.paesi).flatMap(q => norm(q.n).split(/[^a-z]+/)))) : new Set();
  const extra = tt.filter(x => x.length > 2 && !STOPW.has(x) && !/\d/.test(x) && !/^(jpg|jpeg|png|tif|tiff|webp|file|foto|img|dsc|photo)$/.test(x) && !/^(palermitan|catanes|messines|trapanes|siracusan|ragusan|nissen|ennes|agrigentin|eolian|pantesc|modican|mazares|marsales|netin|acesi|madonit|nebroide|iblei|etne)/.test(x) && !paesi.has(x) && !p.some(w => simile(w, x)));
  return extra.length <= (largo ? 2 : 0); };
const IMGC = (() => { try { return JSON.parse(localStorage.getItem('sn_img3') || '{}'); } catch (e) { return {}; } })();
const salvaImg = () => { try { localStorage.setItem('sn_img3', JSON.stringify(IMGC)); } catch (e) {} };
const IMGP = {};
const BRUTTE = /stemma|coat of arms|logo|\bmaps?\b|mappa|flag|bandiera|\.svg|\.pdf|\.tif/i;
function sapImgV(k) {
  const v = SAP.D.voci[k]; if (!v) return Promise.resolve(null);
  if (v.im) return Promise.resolve(v.im);
  if (k in IMGC) return Promise.resolve(IMGC[k]);
  return IMGP[k] || (IMGP[k] = (async () => {
    let r = null;
    const nomi = [...new Set([v.n, ...v.n.split('/').map(x => x.trim()), v.nd || ''].filter(x => x && paroleN(x).length))].slice(0, 3);
    for (const n of nomi) {
      const j = await getJ(`https://it.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(n)}&gsrlimit=5&prop=pageimages|extracts&exintro=1&explaintext=1&exchars=700&piprop=thumbnail&pithumbsize=640`);
      const pg = Object.values((j && j.query && j.query.pages) || {}).sort((a, b) => (a.index || 9) - (b.index || 9));
      for (const x of pg) if (x.thumbnail && titoloOk(n, x.title) && (v.t === 'materia' || /sicil|palerm|catan|messin|siracus|trapan|agrigent|ragus|nissen|enna|etna|egadi|eolie|pantelleria/.test(norm(x.extract || ''))) && !BRUTTE.test(x.thumbnail.source)) { r = { u: x.thumbnail.source, p: 'https://it.wikipedia.org/wiki/' + encodeURIComponent(x.title.replace(/ /g, '_')), t: x.title, src: 'Wikipedia' }; break; }
      if (r) break;
      const c = await getJ(`https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(n + ' filetype:bitmap')}&gsrlimit=8&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=640`);
      const cp = Object.values((c && c.query && c.query.pages) || {}).sort((a, b) => (a.index || 9) - (b.index || 9));
      for (const x of cp) { const t = x.title.slice(5), ii = (x.imageinfo || [])[0] || {}, m = ii.extmetadata || {}, lic = (m.LicenseShortName || {}).value || '';
        if (!titoloOk(n, t, true) || BRUTTE.test(t) || !/CC|public domain|PD/i.test(lic) || !ii.thumburl) continue;
        r = { u: ii.thumburl, p: ii.descriptionurl, t, a: pulito((m.Artist || {}).value || '').slice(0, 80), l: lic, src: 'Wikimedia Commons' }; break; }
      if (r) break;
    }
    IMGC[k] = r; salvaImg(); return r;
  })());
}
const VIS = 'IntersectionObserver' in window ? new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) { VIS.unobserve(e.target); caricaV(e.target); } }, { rootMargin: '300px' }) : null;
function caricaV(el) { sapImgV(el.dataset.vk).then(r => { if (r) { el.style.backgroundImage = `url('${r.u}')`; el.classList.add('conf'); } }); }
function sapFoto(root) { for (const el of root.querySelectorAll('[data-vk]:not(.fok)')) { el.classList.add('fok'); VIS ? VIS.observe(el) : caricaV(el); }
  for (const el of root.querySelectorAll('[data-wk]:not(.fok)')) { el.classList.add('fok'); sapImg(el.dataset.wk).then(w => { if (w) { el.style.backgroundImage = `url('${w.thumbnail.source.replace(/\/\d+px-/, '/480px-')}')`; el.classList.add('conf'); } }); } }
function sapWiki(v, k) {
  if (!v.wk) { if (!v.fo) sapImgV(v.k).then(r => { if (!r || cur !== k || !$('swk')) return;
    $('swk').innerHTML = `<figure class="fmia"><img src="${esc(r.u)}" alt="${esc(v.n)}" loading="lazy"><figcaption>${esc(r.t)}. ${r.a ? esc(r.a) + ', ' : ''}${esc(r.l || 'CC BY-SA')}, da <a href="${esc(r.p)}" target="_blank" rel="noopener">${esc(r.src)}</a></figcaption></figure>`; }); return; }
  sapImg(v.wk).then(w => { if (!w || cur !== k || !$('swk')) return;
    $('swk').innerHTML = `<div class="wiki${v.fo ? ' noimg' : ''}"><img src="${esc(w.thumbnail.source.replace(/\/\d+px-/, '/640px-'))}" alt="${esc(v.n)}" loading="lazy"><div class="wt"><b>Da Wikipedia: ${esc(w.title)}</b>${esc(w.extract)}<div class="cr"><a href="${esc(w.content_urls.desktop.page)}" target="_blank" rel="noopener">Leggi su Wikipedia</a>, CC BY-SA</div></div></div>`; });
}
function prossimaFesta() {
  const oggi = new Date(), y = oggi.getFullYear(), D = SAP.D, o = new Date(y, oggi.getMonth(), oggi.getDate());
  return Object.entries(D.feste).filter(([, f]) => f.d !== 'mobile').map(([k, f]) => { let d = new Date(y, +f.d.slice(0, 2) - 1, +f.d.slice(3)); if (d < o) d = new Date(y + 1, d.getMonth(), d.getDate()); return [k, f, Math.round((d - o) / 864e5)]; }).sort((a, b) => a[2] - b[2])[0];
}
// ciò che mettiamo in evidenza, con il perché
function inEvidenza() {
  const D = SAP.D, V = Object.values(D.voci).filter(v => ['dolce', 'prodotto', 'piatto'].includes(v.t) && perGusto(v)), m = new Date().getMonth() + 1, out = [], visti = new Set();
  const add = (v, perche) => { if (v && !visti.has(v.k)) { visti.add(v.k); out.push([v, perche]); } };
  const [fk, f, gg] = prossimaFesta();
  for (const v of V.filter(v => (v.feste || []).includes(fk))) add(v, `Per ${f.n}, fra ${gg} giorni`);
  for (const v of V.filter(v => (v.m || []).includes(m))) add(v, `Di stagione a ${MESIL[m - 1]}`);
  for (const v of V.filter(v => v.wk)) add(v, (v.ric || []).filter(r => r !== 'PAT')[0] || 'Un simbolo della Sicilia');
  for (const v of V.filter(v => (v.ric || []).some(r => r === 'DOP' || r === 'IGP'))) add(v, (v.ric || [])[0] + (v.prov ? (v.prov.length === 9 ? ', tutta la Sicilia' : ', provincia di ' + PROVN[v.prov[0]]) : v.paesi ? ', ' + D.paesi[v.paesi[0]].n : ''));
  for (const v of V.filter(v => v.pat && v.paesi)) add(v, 'Prodotto tradizionale di ' + D.paesi[v.paesi[0]].n);
  return out.slice(0, 8);
}
function comuniTop(n) {
  const D = SAP.D, c = {};
  for (const v of Object.values(D.voci)) if (perGusto(v)) for (const p of (v.paesi || [])) c[p] = (c[p] || 0) + 1;
  return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, n);
}
const tessera = (v, perche) => { const g = GUSTO[catDi(v)] || ['', '', SAPT[v.t] ? SAPT[v.t][2] : 'plant', '#E8761A'];
  return `<button class="tess" data-sc="${v.k}" style="--c:${g[3]}"><span${imgAttr(v)}>${ico(g[2])}</span><span class="tt"><b>${esc(v.n)}</b><small>${esc(perche)}</small></span></button>`; };
// foto: prima quelle di Oscar, poi Wikipedia
const fotoMie = g => (SAP.D.foto || []).filter(x => !g || x.g === g);
const fotoDi = v => v.fo ? `foto/${v.fo.f}.webp` : '';
const imgAttr = v => v.fo ? ` style="background-image:url('foto/${v.fo.f}.webp')" class="img conf"` : ` class="img"${v.wk ? ` data-wk="${esc(v.wk)}"` : ` data-vk="${v.k}"`}`;
// mappa disegnata della Sicilia: contorno, tutti i comuni, capoluoghi con il nome
const CAPO = { Palermo: 'PA', Catania: 'CT', Messina: 'ME', Siracusa: 'SR', Ragusa: 'RG', Trapani: 'TP', Agrigento: 'AG', Caltanissetta: 'CL', Enna: 'EN' };
function mappaSicilia(o) {
  const D = SAP.D, si = D.sic; if (!si) return '';
  const w = o.w, L0 = 11.85, L1 = 15.72, A0 = 36.58, A1 = 38.84, k = Math.cos(37.6 * Math.PI / 180), h = Math.round(w * (A1 - A0) / ((L1 - L0) * k));
  const X = x => ((x - L0) / (L1 - L0) * w).toFixed(1), Y = y => ((A1 - y) / (A1 - A0) * h).toFixed(1);
  const n = {}; if (!o.punti) for (const v of Object.values(D.voci)) for (const p of (v.paesi || [])) if (perGusto(v)) n[p] = (n[p] || 0) + 1;
  const mx = Math.max(1, ...Object.values(n)), s = w / 420;
  const tr = (SAP.visti || []).filter(q => D.paesi[q]).map(q => D.paesi[q].c);
  const com = si.comuni.filter(c => c[1] > L0 && c[1] < L1 && c[2] > A0 && c[2] < A1);
  const dot = c => { const q = c[3], m = q && n[q]; return m
    ? `<circle data-sc="${q}" cx="${X(c[1])}" cy="${Y(c[2])}" r="${((1.8 + 4.2 * Math.sqrt(m / mx)) * s).toFixed(1)}" class="on${o.sel === q || (o.evid && o.evid.includes(q)) ? ' sel' : ''}"><title>${esc(c[0])}: ${m} ${m === 1 ? 'sapore' : 'sapori'}</title></circle>`
    : `<circle cx="${X(c[1])}" cy="${Y(c[2])}" r="${(1.3 * s).toFixed(1)}" class="off"><title>${esc(c[0])}: ancora nessun sapore documentato</title></circle>`; };
  const cap = com.filter(c => CAPO[c[0]]);
  return `<svg class="smap" viewBox="0 0 ${w} ${h}" role="img" aria-label="Mappa della Sicilia con i comuni e i loro sapori">
    ${si.contorno.map(p => `<polygon class="terra" points="${p.filter(([x, y]) => x > L0 && x < L1 && y > A0 && y < A1).map(([x, y]) => X(x) + ',' + Y(y)).join(' ')}"/>`).join('')}
    ${tr.length > 1 ? `<polyline class="trac" points="${tr.map(c => X(c[0]) + ',' + Y(c[1])).join(' ')}"/>` : ''}
    ${com.filter(c => !(c[3] && n[c[3]])).map(dot).join('')}${com.filter(c => c[3] && n[c[3]]).sort((a, b) => n[b[3]] - n[a[3]]).map(dot).join('')}
    ${(o.punti || []).filter(p => p.xy[0] > L0 && p.xy[0] < L1 && p.xy[1] > A0 && p.xy[1] < A1).map(p => `<circle data-${p.a || 'cev'}="${p.id}" cx="${X(p.xy[0])}" cy="${Y(p.xy[1])}" r="${((p.on ? 6 : 4.2) * Math.min(s, 1.6)).toFixed(1)}" class="ev t-${p.t}${p.on ? ' on2' : ''}"><title>${esc(p.tit)}</title></circle>`).join('')}
    ${o.nomi ? cap.map(c => { const f = 11 * Math.min(s, 1.35), dx = ['Trapani', 'Agrigento', 'Ragusa', 'Caltanissetta', 'Messina'].includes(c[0]) ? -1 : 1, x = +X(c[1]) + dx * 7 * Math.min(s, 1.35), y = +Y(c[2]) + (c[0] === 'Messina' ? -7 * s : c[0] === 'Enna' ? -3 * s : 4 * s);
      return `<g class="cap"><circle cx="${X(c[1])}" cy="${Y(c[2])}" r="${(2.2 * s).toFixed(1)}"/><text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${dx < 0 ? 'end' : 'start'}" style="font-size:${f.toFixed(1)}px">${c[0]}</text></g>`; }).join('') : ''}
  </svg>`;
}
function sapHome() {
  const D = SAP.D;
  const conta = Object.fromEntries(GUSTI.map(g => [g[0], 0])), esempio = {};
  for (const v of Object.values(D.voci)) if (['dolce', 'prodotto', 'piatto'].includes(v.t) && conta[catDi(v)] != null) { conta[catDi(v)]++; if (v.wk && !esempio[catDi(v)]) esempio[catDi(v)] = v.wk; }
  const ev = inEvidenza(), [fk, f, gg] = prossimaFesta(), sel = SAP.gusti.size;
  const nomeSel = sel ? [...SAP.gusti].map(k => GUSTO[k][1].toLowerCase()).join(', ') : '';
  const cm = comuniTop(400).filter(([, n]) => n >= 2), mx = cm.length ? cm[0][1] : 1;
  const alfa = cm.slice().sort((a, b) => D.paesi[a[0]].n.localeCompare(D.paesi[b[0]].n, 'it'));
  const tutti = Object.values(D.voci).filter(v => v.t !== 'materia' && v.t !== 'semi');
  const nComuni = Object.keys(D.paesi).length, nDolci = conta.dolci, nPat = tutti.filter(v => v.pat).length, nDop = tutti.filter(v => (v.ric || []).some(r => r === 'DOP' || r === 'IGP')).length;
  // foto d'apertura: tra quelle di Oscar, del sapore scelto se c'è
  const pool = sel ? fotoMie().filter(x => SAP.gusti.has(x.g)) : fotoMie().filter(x => x.h);
  const fh = (pool.length ? pool : fotoMie());
  SAP.hi = (SAP.hi == null ? Math.floor(Math.random() * fh.length) : SAP.hi) % Math.max(fh.length, 1);
  const hf = fh[SAP.hi] || {};
  const fotoG = {}; for (const x of fotoMie()) if (!fotoG[x.g]) fotoG[x.g] = x.f;
  $('cat').classList.add('on'); document.body.classList.add('cat-on');
  const primo = $('cat').dataset.v !== 'sap-home';
  $('cat').dataset.v = 'sap-home'; if (primo) $('cat').scrollTop = 0;
  const storie = [
    ['ricotta-di-pecora-in-fascetta', 'Dalla fascella alla cassata', 'La ricotta di pecora regge cannoli, cassate e cassatelle. Seguila dal pascolo alla pasticceria.', 'ricotta'],
    ['backcassatelle', 'I dolci che rischiano di sparire', `${nDolci} dolci documentati in Sicilia. Molti vivono solo nella memoria di chi li prepara ancora: monasteri, famiglie, piccoli forni.`, 'fam:Conventuali'],
    ['fiore-di-cappero', 'Capperi, sale e vento', 'Il cappero cresce tra le pietre di Pantelleria e delle Eolie. Prima di diventare condimento è un fiore che dura un giorno.', 'dop-cappero-di-pantelleria']
  ].filter(x => fotoMie().some(f => f.f === x[0]));
  const DESC = { dolci: 'Paste di mandorla, cassate, biscotti delle feste', formaggi: 'Pecorino, ricotta, tuma, provola', 'frutta e ortaggi': 'Agrumi, ficodindia, legumi e ortaggi antichi', 'pane e pasta': 'Pani rituali e grani antichi', gastronomia: 'Piatti di casa e di strada', vini: 'Denominazioni e vitigni dell\'isola', salumi: 'Carni e salumi delle razze locali', pesce: 'Pesce azzurro e conserve di mare', miele: 'Mieli di timo, agrumi, carrubo', 'conserve e condimenti': 'Olio, sale, capperi, conserve', bevande: 'Rosoli e liquori di casa' };
  const freccia = '<span class="fr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';
  $('cat').innerHTML = `<div class="sh5">
    <section class="ap5">${filtroTemi()}
      <div class="apf" style="background-image:url('foto/${hf.f}.webp')" role="img" aria-label="${esc(hf.t || '')}"></div>
      <div class="apt">
        <h1>La Sicilia,<br>una tavola <i>da scoprire.</i></h1>
        <p class="lead">Ci sono isole che si visitano. E poi ci sono isole che si imparano a tavola: ${fmt(tutti.length)} sapori in ${nComuni} comuni, tra cui ${fmt(nDolci)} dolci, ${nPat} prodotti tradizionali e ${nDop} DOP e IGP.</p>
        <label class="cerca5">${ico('map-pin-search')}<input id="hq" type="search" placeholder="Cerca un paese, un dolce, un formaggio…" autocomplete="off" aria-label="Cerca"><button id="hgo" aria-label="Cerca">${freccia}</button></label>
        <button class="apc" data-sc="${hf.v || ''}" ${hf.v ? '' : 'disabled'}>${esc(hf.t || '')}, foto di Oscar Cangelosi</button>
      </div>
      <div class="apm">${mappaSicilia({ w: 420, nomi: true })}<button id="hmap">Esplora la mappa ${freccia}</button></div>
    </section>
    <section class="s5 fil5h">
      <div class="t5"><h2>Le cinque materie della tavola siciliana</h2><p>Vino, olio, grano, formaggio e pane: le varietà, i territori e chi le custodisce.</p></div>
      <div class="filcards">${FILK.map(k => `<button data-fil="${k}"><span class="img conf" style="background-image:url('foto/${FILFO[k][0]}.webp')"></span><b>${{ vino: 'Il vino', olio: "L'olio", grano: 'Il grano', formaggio: 'Il formaggio', pane: 'Il pane' }[k]}</b><small>${{ vino: 'I vitigni', olio: 'Le cultivar', grano: 'I grani antichi', formaggio: 'Latte, caci e ricotte', pane: 'Pani di semola e di festa' }[k]}</small></button>`).join('')}</div>
    </section>
    <section class="s5">
      <div class="t5"><h2>Cosa ti va di scoprire?</h2><p>${sel ? `Stai guardando ${esc(nomeSel)}. ` : ''}Tocca una famiglia di sapori per entrare ed esplorarla.${sel ? ' <button id="hreset" class="lk">Mostra tutto</button>' : ''}</p></div>
      <div class="gusti5">${GUSTI.map(([k, n, ic]) => `<button data-gusto="${k}"><span class="img${fotoG[k] ? ' conf' : ''}"${fotoG[k] ? ` style="background-image:url('foto/${fotoG[k]}.webp')"` : esempio[k] ? ` data-wk="${esc(esempio[k])}"` : ''}>${ico(ic)}</span><span class="tx"><b>${n}</b><small>${DESC[k] || ''}</small><em>${conta[k]} ${conta[k] === 1 ? 'voce' : 'voci'}</em></span>${freccia}</button>`).join('')}</div>
    </section>
    ${storie.length ? `<section class="s5"><div class="t5"><h2>Storie e scoperte</h2></div><div class="storie5">${storie.map(([fo, t, d, dove]) => `<button class="st5" ${dove.startsWith('fam:') ? `data-fam="${dove.slice(4)}"` : `data-sc="${dove}"`} style="background-image:url('foto/${fo}.webp')"><span class="tag">${dove.startsWith('fam:') ? 'Tradizioni' : 'Prodotti'}</span><span class="tt"><b>${t}</b><small>${d}</small></span>${freccia}</button>`).join('')}</div></section>` : ''}
    <section class="s5">
      <div class="t5"><h2>In evidenza${sel ? ` per chi cerca ${esc(nomeSel)}` : ''}</h2><button id="hsor" class="lk">Sorprendimi</button></div>
      <div class="rail5">${ev.map(([v, p]) => `<button class="pz5" data-sc="${v.k}"><span${imgAttr(v)}>${ico((GUSTO[catDi(v)] || GUSTI[0])[2])}</span><b>${esc(v.n)}</b><small>${esc(p)}</small></button>`).join('')}</div>
    </section>
    <section class="s5 due5">
      ${(!sel || SAP.gusti.has('dolci')) ? `<button class="festa5" data-hmese="${f.m[0]}"><small>${gg === 0 ? 'Oggi' : gg === 1 ? 'Domani' : `Fra ${gg} giorni`}, ${+f.d.slice(3)} ${MESIL[+f.d.slice(0, 2) - 1]}</small><b>${esc(f.n)}</b><span>${f.paesi.length ? esc(f.paesi.map(p => D.paesi[p].n).join(' e ')) + '. ' : ''}Cosa si prepara per la festa, paese per paese.</span><em>Apri il calendario ${freccia}</em></button>` : ''}
      <div class="porte5">
        <button data-porta="viaggio">${ico('route-2')}<b>Segui un viaggio</b><span>Dal campo alla tavola</span>${freccia}</button>
        <button data-porta="calendario">${ico('calendar')}<b>Mese per mese</b><span>Feste e stagioni</span>${freccia}</button>
        <button data-fam="Conventuali">${ico('building-church')}<b>Dolci dei monasteri</b><span>Ricette a rischio</span>${freccia}</button>
        <button data-porta="tutelati">${ico('shield-check')}<b>DOP e IGP</b><span>Le denominazioni</span>${freccia}</button>
      </div>
    </section>
    <section class="s5">
      <div class="t5"><h2>I comuni${sel ? ` con ${esc(nomeSel)}` : ' da assaggiare'}</h2><p>Tutti i comuni della Sicilia: in arancio quelli con sapori documentati, più grande il punto più sapori. Tocca un comune per aprirlo.</p></div>
      <div class="com5"><div class="cm">${mappaSicilia({ w: 840, nomi: true })}<p class="tip" id="ctip" aria-live="polite"></p></div>
        <div class="ric5"><p>I più ricchi</p>${cm.slice(0, 12).map(([p, n]) => `<button data-sc="${p}"><span><b>${esc(D.paesi[p].n)}</b><small>Provincia di ${esc(PROVN[D.paesi[p].pv] || '')}</small></span><em>${n}</em></button>`).join('')}</div></div>
      <button id="hmap2" class="tutti5">Apri la mappa grande ${freccia}</button>
    </section>
    <section class="s5"><button class="pross5" data-tema="natura" style="--tc:#2D6A4F"><span class="img" style="background-image:url('foto/natura/campagna.webp')"></span><span class="tx"><small>Prossima tappa</small><b>Da dove viene quello che mangi</b><span>Il pistacchio sull'Etna, la manna sulle Madonie, la provola sui Nebrodi. Cammina nei luoghi dove nascono i sapori.</span><em>Entra in Natura</em></span></button></section>
    <p class="firma5">Un solo patrimonio.<br><i>Infinite storie da scoprire.</i></p>
    <p class="note n5">Fonti: elenco nazionale dei prodotti tradizionali, elenco regionale DOP e IGP, elenco dei dolci di Oscar Cangelosi. Foto di Oscar Cangelosi e da Wikipedia. Produttori: segnalati da presìdi e Alleanza Slow Food, Chiocciole, fattorie didattiche della Regione e guide del Gambero Rosso; non ancora visitati da noi. ${fmt(tutti.filter(v => v.web).length)} piatti trovati sul web sono segnati «da verificare» finché non li confrontiamo con i libri.</p>${COPY()}<div class="flut" id="flut" aria-hidden="true"></div></div>`;
  sapFoto($('cat'));
  const tip = $('ctip'), cmap = $('cat').querySelector('.com5 svg');
  if (cmap) cmap.onmouseover = e => { const t = e.target.closest('circle'), ti = t && t.querySelector('title'); if (ti) tip.textContent = ti.textContent; };
  // la foto che segue il puntatore sull'indice dei sapori
  const fl = $('flut'), fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (fine) for (const b of $('cat').querySelectorAll('.indice button')) {
    b.onmouseenter = e => { fl.classList.remove('vis'); fl.style.transform = `translate(${e.clientX + 24}px,${e.clientY - 140}px) rotate(-3deg)`;
      if (b.dataset.fo) { fl.style.backgroundImage = `url('foto/${b.dataset.fo}.webp')`; fl.classList.add('vis'); return; }
      const wk = b.dataset.ex; if (!wk) return; sapImg(wk).then(w => { if (w && b.matches(':hover')) { fl.style.backgroundImage = `url('${w.thumbnail.source.replace(/\/\d+px-/, '/480px-')}')`; fl.classList.add('vis'); } }); };
    b.onmousemove = e => { fl.style.transform = `translate(${e.clientX + 24}px,${e.clientY - 140}px) rotate(-3deg)`; };
    b.onmouseleave = () => fl.classList.remove('vis');
  }
  const cerca = () => { const q = $('hq').value.trim(); if (!q) return; const n = norm(q), p = Object.entries(D.paesi).find(([, x]) => norm(x.n) === n); if (p) return sapPaese(p[0]); Object.assign(SAP.fil, { q, k: 'tutto', n: 60 }); $('cat').dataset.v = ''; vai('specie'); };
  $('hq').onkeydown = e => { if (e.key === 'Enter') cerca(); }; $('hgo').onclick = e => { e.preventDefault(); cerca(); };
  $('hmap').onclick = $('hmap2').onclick = () => { SAP.home = false; vai('mappa'); };
  if ($('hreset')) $('hreset').onclick = () => { SAP.gusti.clear(); salvaGusti(); SAP.hi = null; sapHome(); };
  $('hsor').onclick = () => { const c = Object.values(D.voci).filter(v => v.paesi && perGusto(v) && v.t !== 'materia' && v.t !== 'semi'); const v = c[Math.floor(Math.random() * c.length)]; SAP.home = false; vai('mappa'); setTimeout(() => sapVoce(v.k), 350); };
}
$('cat').addEventListener('click', e => {
  if (!SAP.on || $('cat').dataset.v !== 'sap-home') return;
  const gu = e.target.closest('[data-gusto]'), p = e.target.closest('[data-porta]'), fa = e.target.closest('[data-fam]'), fe = e.target.closest('.festa3,.festa5');
  if (gu) { e.stopPropagation(); const k = gu.dataset.gusto; Object.assign(SAP.fil, { k, q: '', paese: '', festa: '', lr: '', fam: '', ric: '', n: 60 }); SAP.home = false; $('cat').dataset.v = ''; $('cat').scrollTop = 0; return vai('specie'); }
  if (e.target.closest('[data-sc]')) return;
  if (fa) { e.stopPropagation(); Object.assign(SAP.fil, { k: 'dolci', fam: fa.dataset.fam, q: '', paese: '', festa: '', lr: '', n: 60 }); $('cat').dataset.v = ''; return vai('specie'); }
  if (fe) { e.stopPropagation(); SAP.mese = +fe.dataset.hmese; SAP.cal = null; return vai('meteo'); }
  if (p) { e.stopPropagation(); const w = p.dataset.porta;
    if (w === 'viaggio') vai('escursioni'); else if (w === 'calendario') vai('meteo');
    else if (w === 'tutelati') { Object.assign(SAP.fil, { k: 'tutto', fam: '', q: '', paese: '', festa: '', lr: '', ric: 'tut', n: 60 }); $('cat').dataset.v = ''; vai('specie'); } }
}, true);


/* ---- Natura: pagina d'inizio con foto, racconto e mappa disegnata */
const HASH_ROTTA = location.hash.startsWith('#/'); // link nuovi (#/natura/...): li applica il navigatore in fondo al file
var NAT = { home: !isApp && (!location.hash.slice(1) || HASH_ROTTA), foto: null, hi: null };
setTimeout(() => { if (NAT.home && !sapOn() && vista === 'mappa') natHome(); }, 0);
document.addEventListener('click', e => { const b = e.target.closest('#sez button[data-v="mappa"]'); if (b && !sapOn() && !isApp) NAT.home = true; }, true);
const NATF = () => NAT.foto || (NAT.foto = fetch('foto/natura.json').then(r => r.json()).catch(() => []));
const natMappa = () => { NAT.home = false; vai('mappa'); };
async function natHome() {
  const [fo] = await Promise.all([NATF(), D, CAT, SAPD().catch(() => null)]);
  if (sapOn() || vista !== 'mappa' || !NAT.home) return;
  NAT.foto = fo;
  if (SEZ !== 'natura') return SEZ === 'home' ? genHome(fo) : prestoHome(SEZ, fo);
  const conta = t => Object.values(S).filter(x => x.t === t).length;
  const nPar = conta('pn') + conta('pr'), nRis = conta('rn'), nAmp = conta('amp'), nN2k = conta('zsc') + conta('zsczps') + conta('zps'), nAm = (GA.features || []).length, nBv = (GV.features || []).length, nSp = FUN.s.length + PIA.s.length;
  const hero = fo.filter(x => x.h); NAT.hi = NAT.hi == null ? Math.floor(Math.random() * hero.length) : NAT.hi; const hf = hero[NAT.hi % hero.length] || {};
  const fG = g => (fo.find(x => x.g === g) || {}).f;
  const punti = Object.entries(S).filter(([, x]) => ['pn', 'pr', 'rn', 'amp'].includes(x.t) && x.bb).map(([k, x]) => ({ a: 'nk', id: k, xy: centro(x), t: x.t === 'rn' ? 'riserva' : x.t === 'amp' ? 'marina' : 'parco', on: x.t !== 'rn', tit: x.n }));
  const freccia = '<span class="fr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';
  const porte = [
    ['parchi', 'Parchi e riserve', `${nPar} parchi, ${nRis} riserve, ${nAmp} aree marine`, 'tree', fG('mare') ? 'natura/scogliere' : ''],
    ['sentieri', 'Sentieri e percorsi', 'Oltre 20.000 sentieri, con dislivello e tempi', 'route-2', 'natura/campagna'],
    ['vetusti', 'Boschi vetusti', `${nBv} boschi antichi, mai tagliati da secoli`, 'trees', ''],
    ['alberi', 'Alberi monumentali', `${nAm} alberi da andare a trovare`, 'tree', ''],
    ['funghi', 'Funghi', `${fmt(FUN.s.length)} specie, con le stagioni`, 'mushroom', 'natura/funghi-muschio'],
    ['piante', 'Piante e fiori', `${fmt(PIA.s.length)} specie della flora siciliana`, 'flower', 'natura/origano-fiore'],
    ['calendario', 'Cosa fiorisce ora', 'Il calendario della natura, mese per mese', 'calendar', 'natura/fiore-carciofo'],
    ['meteo', 'Meteo e allerte', 'Prima di partire: pioggia, vento, allerte', 'cloud', '']
  ];
  const WK = { vetusti: 'Faggeta', alberi: 'Castagno dei Cento Cavalli', meteo: 'Etna' };
  const storie = [['EUAP0227', 'Etna', "L'Etna, la montagna che respira", 'Il vulcano attivo più alto d\'Europa: boschi di betulle e faggi, colate, crateri e un parco che sale dal mare a oltre 3.300 metri.'],
    ['EUAP0228', 'Parco delle Madonie', 'Le Madonie, un\'isola nell\'isola', 'Faggete, agrifogli giganti e l\'abete dei Nebrodi, una specie che esiste solo qui e conta poche decine di alberi in natura.'],
    ['EUAP0382', 'Riserva naturale orientata dello Zingaro', 'Lo Zingaro, sette chilometri senza strade', 'La prima riserva naturale della Sicilia: calette, palme nane e un sentiero lungo la costa, solo a piedi.']];
  const parchi = Object.entries(S).filter(([, x]) => ['pn', 'pr'].includes(x.t));
  const mese = new Date().getMonth(), S2 = await caricaStag();
  const ora0 = [...FUN.s.map((r, i) => ['funghi', i, r[5] || 0]), ...PIA.s.map((r, i) => ['piante', i, r[6] || 0])].filter(([tp, i]) => stagione(tp, i, mese, S2).on === true).sort((a, b) => b[2] - a[2]); const oraF = ora0.filter(x => x[0] === 'funghi' && FUN.s[x[1]][8].length).slice(0, 7), oraP = ora0.filter(x => x[0] === 'piante').slice(0, 7), ora = oraP.flatMap((x, j) => oraF[j] ? [x, oraF[j]] : [x]);
  $('cat').classList.add('on'); document.body.classList.add('cat-on');
  const primo = $('cat').dataset.v !== 'nat-home'; $('cat').dataset.v = 'nat-home'; if (primo) $('cat').scrollTop = 0;
  $('cat').innerHTML = `<div class="sh5 nat5">
    <section class="ap5">${filtroTemi()}<div class="apf" style="background-image:url('foto/${hf.f}.webp')" role="img" aria-label="${esc(hf.t || '')}"></div>
      <div class="apt"><h1>La Sicilia,<br>una natura <i>da ascoltare.</i></h1>
        <p class="lead">Ci sono isole che si visitano. E poi ci sono isole che si imparano ad ascoltare: ${nPar} parchi, ${nRis} riserve naturali, ${nAmp} aree marine protette e più di ${fmt(Math.floor(nSp / 1000) * 1000)} specie di piante e funghi.</p>
        <label class="cerca5">${ico('map-pin-search')}<input id="nq" type="search" placeholder="Cerca un parco, un sentiero, una specie…" autocomplete="off" aria-label="Cerca"><button id="ngo" aria-label="Cerca">${freccia}</button></label>
        <p class="apc">${esc(hf.t || '')}, foto di Oscar Cangelosi</p></div>
      <div class="apm">${mappaSicilia({ w: 420, nomi: true, punti })}<button id="nmap">Esplora la mappa ${freccia}</button></div>
    </section>
    <section class="s5"><div class="t5"><h2>Cosa ti va di scoprire?</h2><p>Parti da quello che ti incuriosisce: la mappa e le schede ti portano il resto.</p></div>
      <div class="gusti5">${porte.map(([k, n, d, ic, f]) => `<button data-np="${k}"><span class="img${f ? ' conf' : ''}"${f ? ` style="background-image:url('foto/${f}.webp')"` : WK[k] ? ` data-nwk="${esc(WK[k])}"` : ''}>${ico(ic)}</span><span class="tx"><b>${n}</b><small>${d}</small></span>${freccia}</button>`).join('')}</div></section>
    <section class="s5"><div class="t5"><h2>Storie e scoperte</h2></div>
      <div class="storie5">${storie.map(([k, wk, t, d]) => `<button class="st5" data-nk="${k}" data-nwk="${esc(wk)}"><span class="tag">Parchi e riserve</span><span class="tt"><b>${t}</b><small>${d}</small></span>${freccia}</button>`).join('')}</div></section>
    ${ora.length ? `<section class="s5"><div class="t5"><h2>Di stagione in ${MESIL[mese]}</h2><button class="lk" data-np="calendario">Tutto il calendario</button><p>Le specie più osservate in questo mese, secondo i dati delle osservazioni.</p></div>
      <div class="rail5">${ora.map(([tp, i]) => { const r = (tp === 'funghi' ? FUN : PIA).s[i]; return `<button class="pz5" data-sp="${tp}:${i}">${tp === 'funghi' && r[8].length ? `<span class="img conf" style="background-image:url('${BASEF + r[8][0]}')">` : `<span class="img" data-nwk="${esc(binomio(r[0]) || r[0])}">`}${ico(tp === 'funghi' ? 'mushroom' : 'flower')}</span><b>${esc(nomeC(tp, i) || r[0])}</b><small><i>${esc(r[0])}</i>, ${stagione(tp, i, mese, S2).lab}</small></button>`; }).join('')}</div></section>` : ''}
    <section class="s5"><div class="t5"><h2>I parchi della Sicilia</h2><p>${parchi.length} parchi, dal mare alle montagne. Tocca per aprire la scheda con zone, regole e sentieri.</p></div>
      <div class="chips5">${parchi.map(([k, x]) => `<button data-nk="${k}">${esc(x.n)}</button>`).join('')}</div></section>
    <section class="s5"><button class="pross5" data-tema="sapori" style="--tc:#E8761A"><span class="img" style="background-image:url('foto/backcassatelle.webp')"></span><span class="tx"><small>Prossima tappa</small><b>Dopo il sentiero, la tavola</b><span>Ogni parco ha i suoi paesi e ogni paese i suoi sapori. Scopri cosa si mangia dove hai camminato.</span><em>Entra in Sapori</em></span></button></section>
    <p class="firma5">Un solo patrimonio.<br><i>Infinite storie da scoprire.</i></p>
    <p class="note n5">Dati: EEA Natura 2000, Regione Siciliana SIF, Elenco degli alberi monumentali, OpenStreetMap, GBIF. Foto di Oscar Cangelosi e da Wikipedia. Nessuna indicazione sulla commestibilità di funghi e piante.</p>${COPY()}</div>`;
  for (const el of $('cat').querySelectorAll('[data-nwk]')) wikiVoce(el.dataset.nwk).then(w => { if (w && w.thumbnail && !NOFOTO.test(w.thumbnail.source)) { el.style.backgroundImage = `url('${w.thumbnail.source.replace(/\/\d+px-/, '/640px-')}')`; el.classList.add('conf'); } });
  const cerca = () => { const q = $('nq').value.trim(); natMappa(); if (q) setTimeout(() => { $('q').value = q; $('q').dispatchEvent(new Event('input', { bubbles: true })); $('q').focus(); }, 300); };
  $('nq').onkeydown = e => { if (e.key === 'Enter') cerca(); }; $('ngo').onclick = e => { e.preventDefault(); cerca(); };
  $('nmap').onclick = natMappa;
}
$('cat').addEventListener('click', e => {
  if (sapOn() || $('cat').dataset.v !== 'nat-home') return;
  const k = e.target.closest('[data-nk]'), p = e.target.closest('[data-np]'), sp = e.target.closest('[data-sp]');
  if (k) { e.stopPropagation(); natMappa(); return setTimeout(() => apri(k.dataset.nk, true), 650); }
  if (sp) { e.stopPropagation(); const [tp, i] = sp.dataset.sp.split(':'); NAT.home = false; vai(tp); return setTimeout(() => apriSpecie(tp, +i), 300); }
  if (!p) return; e.stopPropagation(); const w = p.dataset.np;
  if (w === 'parchi') { ON.aree = true; applica(); return natMappa(); }
  if (w === 'vetusti' || w === 'alberi') { ON[w === 'vetusti' ? 'bv' : 'am'] = true; applica(); return natMappa(); }
  NAT.home = false;
  if (w === 'sentieri') return vai('escursioni');
  if (w === 'funghi' || w === 'piante') return vai(w);
  if (w === 'calendario') { vai('piante'); return setTimeout(calendario, 200); }
  if (w === 'meteo') return vai('meteo');
}, true);


/* ---- i temi: filtro in alto nella foto d'apertura, si possono unire */
const TEMA = { natura: ['Natura', '#2D6A4F'], sapori: ['Sapori', '#E8761A'], mare: ['Mare', '#2F7EA8'], arte: ['Arte', '#8A5A3C'], storia: ['Storia', '#7B3F61'] };
const PRONTI = ['natura', 'sapori'];
// le cinque sezioni: si entra dal menu nella foto d'apertura; la home le presenta tutte
var SEZ = isApp || (location.hash.slice(1) && !HASH_ROTTA) ? 'natura' : 'home';
var TEMI = new Set(['natura']);
const misto = () => false;
const SEZT = {
  natura: { t: 'Natura', s: 'Una natura da ascoltare', d: 'Boschi mai tagliati da secoli, un vulcano che respira, orchidee che fioriscono solo qui. Sei parchi, settantacinque riserve e oltre ventimila sentieri per camminare la Sicilia, con le regole per farlo bene.', cta: 'Entra in Natura', f: 'natura/campagna' },
  sapori: { t: 'Sapori', s: 'Una tavola da scoprire', d: 'Ogni paese ha il suo dolce, ogni festa il suo pane. Mille sapori documentati, dalla terra alla tavola: dove nascono, di cosa sono fatti, quando si preparano e le sagre dove assaggiarli.', cta: 'Entra in Sapori', f: 'backcassatelle' },
  mare: { t: 'Mare', s: 'Un mare che ha fatto la storia', d: 'Isole, fondali, saline e tonnare. Il mare che ha nutrito, difeso e collegato la Sicilia al mondo, con le aree marine protette e i suoi pesci.', cta: 'In preparazione', f: 'natura/scogliere', fut: ['Le sette aree marine protette e i loro fondali', 'Saline, tonnare e borghi di pescatori', 'I pesci del Mediterraneo e le stagioni della pesca'] },
  arte: { t: 'Arte', s: 'La bellezza costruita in tremila anni', d: 'Templi greci, mosaici arabo-normanni, chiese barocche e le maioliche dei paesi. Opere da vedere dal vivo, con chi le ha fatte e perché.', cta: 'In preparazione', wk: 'Duomo di Monreale', fut: ['Templi, teatri e mosaici da visitare', 'Il barocco del Val di Noto', 'Artigiani di oggi: ceramica, ferro, pietra'] },
  storia: { t: 'Storia', s: 'Ogni popolo ha lasciato una traccia', d: 'Sicani, Greci, Arabi, Normanni, Spagnoli: la storia dell\'isola letta sulle mappe antiche, nelle foto d\'archivio e nei racconti, con una linea del tempo da percorrere.', cta: 'In preparazione', wk: 'Valle dei Templi', fut: ['Mappe antiche sovrapposte alla Sicilia di oggi', 'Una linea del tempo dai Sicani all\'Unità', 'Foto d\'archivio e racconti di paese'] }
};
function filtroTemi() {
  if (isApp) return '';
  // nella home, sul telefono, le sezioni stanno in fondo alla foto con una frase che invita a scegliere
  return `<nav class="temi" aria-label="Sezioni del sito">${SEZ === 'home' ? '<p class="temil">Cinque sezioni, un solo patrimonio. Da dove vuoi partire?</p>' : ''}<div class="temib"><button data-tema="home" class="ini${SEZ === 'home' ? ' on' : ''}" aria-current="${SEZ === 'home'}">Inizio</button>${Object.entries(TEMA).map(([k, [n, c]]) => `<button data-tema="${k}" class="${SEZ === k ? 'on' : ''}${PRONTI.includes(k) ? '' : ' presto'}" style="--tc:${c}" aria-current="${SEZ === k}"><i></i>${n}</button>`).join('')}</div></nav>`;
}
// scheda della sezione, come sulla mappa: col mouse si apre passandoci sopra; sul telefono, nella home, il primo tocco la apre e il secondo entra
const tipSez = (b, x, y) => { const k = b.dataset.tema, z = SEZT[k]; if (!z) return false;
  const tocco = !fineP;
  tipMostra(`${z.f ? `<span class="ti" style="background-image:url('foto/${z.f}.webp')"></span>` : ''}<span class="tt">${PRONTI.includes(k) ? 'Sezione' : 'In preparazione'}</span><b>${z.t}</b><span class="tl">${esc(z.s)}. ${esc(z.d)}</span>${tipHint(PRONTI.includes(k) ? (tocco ? 'Tocca di nuovo per entrare' : 'Clicca per entrare') : (tocco ? 'Tocca di nuovo per vedere cosa arriverà' : 'Clicca per vedere cosa arriverà'))}`, x, y);
  if (tocco) { const r = b.getBoundingClientRect(), w = TIP.offsetWidth, h = TIP.offsetHeight; TIP.style.transform = `translate(${Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8)}px,${Math.max(8, r.top - h - 10)}px)`; }
  TIP.dataset.k = 'sez:' + k; return true; };
document.addEventListener('mouseover', e => { if (!fineP || isApp) return; const b = e.target.closest('.temi [data-tema]'); if (b && b.dataset.tema !== 'home') { const r = b.getBoundingClientRect(); tipSez(b, r.left, r.bottom); } else if (String(TIP.dataset.k).startsWith('sez:') && !e.target.closest('.temi')) tipNascondi(); });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-tema],header h1.marchio');
  if (!b) { if (String(TIP.dataset.k).startsWith('sez:')) tipNascondi(); return; }
  if (isApp) return; e.preventDefault(); e.stopPropagation();
  const k = b.dataset.tema || 'home';
  if (!fineP && k !== 'home' && b.closest('.sl5 .temi') && TIP.dataset.k !== 'sez:' + k) { tipSez(b, 0, 0); return; }
  tipNascondi(); entraSez(k);
}, true);
// testata coerente: colore, menu ed etichetta seguono la sezione in cui sei
const SEZI = { natura: 'tree', sapori: 'tools-kitchen-2', mare: 'ripple', arte: 'building-church', storia: 'book-2' };
if (!isApp) {
  $('sez').insertAdjacentHTML('afterend', `<nav class="sez sezh" id="sezh" aria-label="Sezioni del sito">${Object.entries(TEMA).map(([k, [n]]) => `<button data-tema="${k}" data-ic="${SEZI[k]}">${ico(SEZI[k])}<span>${n}</span></button>`).join('')}</nav>`);
  document.querySelector('header h1.marchio').insertAdjacentHTML('afterend', '<button class="sezl" id="sezl" aria-label="Torna all\'inizio della sezione"></button>');
  $('sezl').onclick = e => { e.stopPropagation(); entraSez(SEZ); };
  document.querySelector('.lang').style.display = 'none';
}
function aggSez() {
  if (isApp) return;
  const k = SEZ, b = document.body;
  for (const x of ['home', 'natura', 'sapori', 'mare', 'arte', 'storia']) b.classList.toggle('z-' + x, x === k);
  b.classList.toggle('z-hm', k === 'home' || !PRONTI.includes(k));
  $('sezl').textContent = k === 'home' ? '' : TEMA[k][0]; $('sezl').style.display = k === 'home' ? 'none' : '';
  for (const x of document.querySelectorAll('#sezh button')) x.classList.toggle('on', x.dataset.tema === k);
}
setTimeout(aggSez, 0);
function entraSez(k) {
  SEZ = k; aggSez(); TEMI = new Set([k]); chiudi(); $('cat').scrollTop = 0; $('cat').dataset.v = '';
  if (k === 'sapori') { if (!SAP.on) sapModo(true); else { SAP.home = true; vai('mappa'); } return; }
  NAT.home = true; NAT.hi = null;
  if (SAP.on) sapModo(false); else vai('mappa');
}
function applicaTemi() { entraSez([...TEMI][0]); }
// la home: le sezioni che scorrono e invitano a entrare
async function genHome(fo) {
  await SAPD(); await SAGRE();
  const D2 = SAP.D, conta = t => Object.values(S).filter(x => x.t === t).length;
  const freccia = '<span class="fr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';
  const oi = new Date().toISOString().slice(0, 10), mese = new Date().getMonth();
  const prossime = (SAP.sagre.eventi || []).filter(e => e.t === 'sagra' && e.d[e.d.length - 1] >= oi).sort((a, b) => (a.d.find(d => d >= oi) > b.d.find(d => d >= oi) ? 1 : -1)).slice(0, 3);
  const nh = fo.filter(x => x.h && x.g !== 'mare'), nat = nh[Math.floor(Math.random() * nh.length)] || {};
  SEZT.natura.f = nat.f || SEZT.natura.f;
  const sl = Object.entries(SEZT);
  $('cat').classList.add('on'); document.body.classList.add('cat-on');
  $('cat').dataset.v = 'gen-home';
  $('cat').innerHTML = `<div class="sh5 gen5">
    <section class="ap5 sl5" aria-roledescription="carosello" aria-label="Le sezioni di Sicilia Naturale">${filtroTemi()}
      ${sl.map(([k, x], i) => `<div class="sld${i === 0 ? ' on' : ''}" data-i="${i}" style="--tc:${TEMA[k][1]}" aria-hidden="${i !== 0}"><div class="apf" ${x.f ? `style="background-image:url('foto/${x.f}.webp')"` : `data-gwk="${esc(x.wk)}"`}></div>
        <div class="apt"><p class="kick5"><i></i>${x.t}${PRONTI.includes(k) ? '' : ' · in preparazione'}</p><h1>${x.s.replace(/ (\S+)$/, ' <i>$1.</i>')}</h1><p class="lead">${x.d}</p>
          ${PRONTI.includes(k) ? `<button class="entra" data-tema="${k}">${x.cta} ${freccia}</button>` : `<button class="entra ghost" data-tema="${k}">Scopri cosa arriverà ${freccia}</button>`}</div></div>`).join('')}
      <div class="sln"><button class="slp" aria-label="Sezione precedente">‹</button>${sl.map(([k, x], i) => `<button class="sdot${i === 0 ? ' on' : ''}" data-go="${i}" aria-label="${x.t}" style="--tc:${TEMA[k][1]}"></button>`).join('')}<button class="sls" aria-label="Sezione successiva">›</button></div>
      <div class="tes5"><p class="tes5t">Cinque sezioni, un solo patrimonio. <b>Tocca per scoprirle.</b></p>
        <div class="tes5g" role="tablist" aria-label="Le cinque sezioni">${sl.map(([k, x], i) => `<button class="sz${i === 0 ? ' on' : ''}${PRONTI.includes(k) ? '' : ' presto'}" data-go="${i}" data-k="${k}" role="tab" aria-selected="${i === 0}" style="--tc:${TEMA[k][1]}"><span class="szf" ${x.f ? `style="background-image:url('foto/${x.f}.webp')"` : `data-gwk="${esc(x.wk)}"`}></span>${ico(SEZI[k])}<span class="szn">${x.t}</span>${PRONTI.includes(k) ? '' : '<em>presto</em>'}<span class="szb"><i></i></span></button>`).join('')}</div></div>
    </section>
    <section class="s5"><div class="t5"><h2>Da dove cominciare</h2><p>Tre modi per entrare, a seconda di quanto tempo hai e di cosa ti incuriosisce.</p></div>
      <div class="vie5">
        <button data-via="sentiero"><span class="n">1</span><b>Ho mezza giornata</b><span>Un sentiero in un parco, e dopo cosa si mangia nei paesi vicini.</span><em>Natura, poi Sapori ${freccia}</em></button>
        <button data-via="dolce"><span class="n">2</span><b>Cerco un sapore della tradizione</b><span>Un dolce, un formaggio, un pane: dove nasce e quando si prepara.</span><em>Sapori ${freccia}</em></button>
        <button data-via="mese"><span class="n">3</span><b>Cosa succede questo mese</b><span>Sagre e feste in calendario, e quello che fiorisce in campagna.</span><em>Calendario ${freccia}</em></button>
      </div></section>
    <section class="s5"><div class="t5"><h2>Per chi è Sicilia Naturale</h2><p>Per chi viaggia, per chi studia, per chi insegna e per chi ricorda. Scegli da dove partire.</p></div>
      <div class="chi5">
        <button data-via="sentiero" style="--tc:#2D6A4F"><b>Chi viaggia</b><span>Cosa vedere oggi, un sentiero adatto, cosa si mangia nel paese vicino e la sagra del fine settimana.</span><em>Percorsi e sagre</em></button>
        <button data-via="scuola" style="--tc:#2F7EA8"><b>Scuole e ragazzi</b><span>Parchi, piante, funghi e prodotti spiegati con parole semplici, mappe e foto, utili per una ricerca o una gita.</span><em>Le specie e i parchi</em></button>
        <button data-via="bambini" style="--tc:#C8102E"><b>Bambini</b><span>Curiosità da scoprire con i grandi: l'albero più vecchio, il fiore che dura un giorno, il dolce di ogni festa.</span><em>Lo sapevi?</em></button>
        <button data-via="studiosi" style="--tc:#5B3A26"><b>Studiosi e guide</b><span>Elenchi di specie per zona, dati Natura 2000 e GBIF, fonti citate, itinerari in PDF e GPX, osservazioni in Darwin Core.</span><em>Dati e fonti</em></button>
        <button data-via="dolce" style="--tc:#E8761A"><b>Chi ama il cibo</b><span>Dolci, formaggi, pani e vini: dove nascono, di cosa sono fatti, le versioni documentate e chi li fa ancora.</span><em>Il catalogo dei sapori</em></button>
        <button data-via="lontano" style="--tc:#7B3F61"><b>Chi è lontano</b><span>Il tuo paese, i suoi dolci, le sue feste. Per ritrovare la Sicilia anche da lontano.</span><em>Cerca il tuo paese</em></button>
      </div></section>
    <section class="s5" id="sapevi"><div class="t5"><h2>Lo sapevi?</h2><p>Piccole scoperte da leggere insieme, grandi e piccoli.</p></div>
      <div class="sap5">${[
        ['Sull\'Etna vive il Castagno dei Cento Cavalli: è considerato uno degli alberi più vecchi d\'Europa, con migliaia di anni.', 'natura', 'Alberi monumentali'],
        ['L\'abete dei Nebrodi esiste solo sulle Madonie: in natura ne restano poche decine di alberi.', 'natura', 'Specie rare'],
        ['Il cappero che mangiamo è il bocciolo di un fiore: se non lo raccogli, si apre e fiorisce per un solo giorno.', 'sapori', 'Capperi'],
        ['La manna si raccoglie d\'estate incidendo la corteccia del frassino: la linfa esce e si indurisce al sole.', 'sapori', 'Manna delle Madonie'],
        ['Il pistacchio di Bronte cresce sulle colate di lava dell\'Etna, dove pochi altri alberi riescono a vivere.', 'sapori', 'Pistacchio'],
        ['In Sicilia sono state segnalate più di ' + fmt(Math.floor(FUN.s.length / 100) * 100) + ' specie di funghi. Molte si riconoscono solo al microscopio.', 'natura', 'Funghi']
      ].map(([t, k, x]) => `<div class="sp5" style="--tc:${TEMA[k][1]}"><small>${x}</small><p>${t}</p></div>`).join('')}</div></section>
    <section class="s5"><div class="t5"><h2>Le cinque sezioni</h2><p>Due sono già aperte, tre sono in preparazione.</p></div>
      <div class="sez5">${sl.map(([k, x]) => `<button data-tema="${k}" class="${PRONTI.includes(k) ? '' : 'presto'}" style="--tc:${TEMA[k][1]}"><span class="img" ${x.f ? `style="background-image:url('foto/${x.f}.webp')"` : `data-gwk="${esc(x.wk)}"`}></span><span class="tx"><b><i></i>${x.t}</b><small>${x.s}.</small>${PRONTI.includes(k) ? `<em>${k === 'natura' ? `${conta('pn') + conta('pr')} parchi, ${conta('rn')} riserve, ${fmt(FUN.s.length + PIA.s.length)} specie` : `${fmt(Object.values(D2.voci).filter(v => v.t !== 'materia' && v.t !== 'semi').length)} sapori in ${Object.keys(D2.paesi).length} comuni`}</em>` : '<em>In preparazione</em>'}</span>${freccia}</button>`).join('')}</div></section>
    ${prossime.length ? `<section class="s5"><div class="t5"><h2>Nei prossimi giorni</h2><button class="lk" data-via="mese">Tutto il calendario</button></div><div class="sag5 row">${prossime.map(e => `<button data-via="mese"><b>${+e.d.find(d => d >= oi).slice(8)} ${MESIL[+e.d.find(d => d >= oi).slice(5, 7) - 1]}</b><span>${esc(e.n)}<small>${esc(e.c)}. ${esc(e.desc)}</small></span></button>`).join('')}</div></section>` : ''}
    <p class="firma5">Un solo patrimonio.<br><i>Infinite storie da scoprire.</i></p>
    <p class="note n5">Foto di Oscar Cangelosi e da Wikipedia. Dati: EEA Natura 2000, Regione Siciliana, elenchi PAT, DOP e IGP, elenco dei dolci di Oscar Cangelosi.</p>${COPY()}</div>`;
  for (const el of $('cat').querySelectorAll('[data-gwk]')) wikiVoce(el.dataset.gwk).then(w => { if (w && w.thumbnail) el.style.backgroundImage = `url('${w.thumbnail.source.replace(/\/\d+px-/, '/1200px-')}')`; });
  scorri5();
}
let SLT = null;
function scorri5() {
  clearInterval(SLT); const box = $('cat').querySelector('.sl5'); if (!box) return;
  // sul telefono il riquadro è alto quanto la slide più lunga: niente fascia vuota sopra il titolo
  // sul telefono la scheda copre tutto lo schermo tra la testata e la barra in basso (mai meno del testo più lungo)
  const alto = () => { if (innerWidth > 860) { box.style.height = ''; return; }
    let h = 0; for (const t of box.querySelectorAll('.sld .apt')) h = Math.max(h, t.offsetHeight);
    const tm = box.querySelector('.tes5'), th = tm ? tm.offsetHeight : 0, gap = 18, nav = [...document.querySelectorAll('#sezh, #sez')].find(n => n.offsetHeight && getComputedStyle(n).position === 'fixed');
    const schermo = innerHeight - (box.getBoundingClientRect().top + scrollY) - (nav ? nav.offsetHeight : 0) - 10;
    const min = h + gap + th + 48, H = Math.round(min + Math.max(0, schermo - min) / 2), m = Math.round((H - h - gap - th) / 2);
    // testo e sezioni centrati nella scheda: stesso margine sopra e sotto
    box.style.setProperty('--m', m + 'px'); box.style.setProperty('--giu', (m + th + gap) + 'px'); box.style.height = H + 'px'; };
  alto(); setTimeout(alto, 400); if (!box.dataset.rs) { box.dataset.rs = 1; addEventListener('resize', () => box.isConnected && alto()); }
  const sl = [...box.querySelectorAll('.sld')], dots = [...box.querySelectorAll('.sdot')], tes = [...box.querySelectorAll('.sz')]; let i = 0, ferma = false;
  const va = j => { i = (j + sl.length) % sl.length; sl.forEach((x, n) => { x.classList.toggle('on', n === i); x.setAttribute('aria-hidden', n !== i); }); dots.forEach((x, n) => x.classList.toggle('on', n === i));
    tes.forEach((x, n) => { x.classList.remove('on'); x.setAttribute('aria-selected', n === i); }); if (tes[i]) { void tes[i].offsetWidth; tes[i].classList.add('on'); } };
  // le tessere delle sezioni: un tocco mostra la sezione nella foto, un secondo tocco sulla stessa entra
  tes.forEach(t => t.onclick = e => { e.stopPropagation(); const n = +t.dataset.go; if (n === i) return entraSez(t.dataset.k); va(n); });
  box.querySelector('.slp').onclick = () => va(i - 1); box.querySelector('.sls').onclick = () => va(i + 1);
  dots.forEach(d => d.onclick = () => va(+d.dataset.go));
  box.onmouseenter = box.onfocusin = () => { ferma = true; }; box.onmouseleave = () => { ferma = false; };
  let x0 = null; box.ontouchstart = e => { x0 = e.touches[0].clientX; }; box.ontouchend = e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) va(i + (dx < 0 ? 1 : -1)); x0 = null; };
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) SLT = setInterval(() => { if (!ferma && $('cat').dataset.v === 'gen-home' && document.visibilityState === 'visible') va(i + 1); else if ($('cat').dataset.v !== 'gen-home') clearInterval(SLT); }, 6500);
}
$('cat').addEventListener('click', e => {
  if ($('cat').dataset.v !== 'gen-home') return;
  const v = e.target.closest('[data-via]'); if (!v) return; e.stopPropagation(); const w = v.dataset.via;
  if (w === 'sentiero') { SEZ = 'natura'; NAT.home = false; return vai('escursioni'); }
  if (w === 'dolce') return entraSez('sapori');
  if (w === 'mese') { SEZ = 'sapori'; SAP.cal = null; return versoSapori(() => vai('meteo')); }
  if (w === 'scuola') { SEZ = 'natura'; NAT.home = false; return vai('piante'); }
  if (w === 'bambini') return $('sapevi').scrollIntoView({ behavior: 'smooth' });
  if (w === 'studiosi') return pagina('metodo');
  if (w === 'lontano') { entraSez('sapori'); return setTimeout(() => { const q = $('hq'); if (q) { q.focus(); q.scrollIntoView({ block: 'center' }); } }, 900); }
}, true);
// le sezioni in preparazione: cosa ci sarà
async function prestoHome(k, fo) {
  const x = SEZT[k], freccia = '<span class="fr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';
  $('cat').classList.add('on'); document.body.classList.add('cat-on'); $('cat').dataset.v = 'presto-home';
  $('cat').innerHTML = `<div class="sh5 gen5">
    <section class="ap5" style="--tc:${TEMA[k][1]}">${filtroTemi()}<div class="apf" ${x.f ? `style="background-image:url('foto/${x.f}.webp')"` : `data-gwk="${esc(x.wk)}"`}></div>
      <div class="apt"><p class="kick5"><i></i>${x.t} · in preparazione</p><h1>${x.s.replace(/ (\S+)$/, ' <i>$1.</i>')}</h1><p class="lead">${x.d}</p></div></section>
    <section class="s5"><div class="t5"><h2>Cosa troverai</h2><p>Stiamo raccogliendo luoghi, fonti e foto. Ecco cosa arriverà in questa sezione.</p></div>
      <ol class="fut5">${x.fut.map(f => `<li>${f}</li>`).join('')}</ol></section>
    <section class="s5"><div class="t5"><h2>Intanto puoi entrare qui</h2></div>
      <div class="sez5">${PRONTI.map(q => `<button data-tema="${q}" style="--tc:${TEMA[q][1]}"><span class="img" style="background-image:url('foto/${SEZT[q].f}.webp')"></span><span class="tx"><b><i></i>${SEZT[q].t}</b><small>${SEZT[q].s}.</small></span>${freccia}</button>`).join('')}</div></section>
    <p class="firma5">Un solo patrimonio.<br><i>Infinite storie da scoprire.</i></p>${COPY()}</div>`;
  for (const el of $('cat').querySelectorAll('[data-gwk]')) wikiVoce(el.dataset.gwk).then(w => { if (w && w.thumbnail) el.style.backgroundImage = `url('${w.thumbnail.source.replace(/\/\d+px-/, '/1200px-')}')`; });
}
// comuni dei sapori sulla mappa di Natura quando i temi sono uniti
function mixLivelli(v) {
  const on = v === 'mappa' && misto() && TEMI.has('sapori');
  if (!on) { if (map.getLayer('sap-p')) for (const l of SAPL) map.setLayoutProperty(l, 'visibility', 'none'); return; }
  SAPD().then(() => { if (sapOn() || vista !== 'mappa') return; sapLayers(); map.getSource('sapp').setData(sapGeo('paese'));
    for (const l of ['sap-c', 'sap-cl', 'sap-p', 'sap-pl']) map.setLayoutProperty(l, 'visibility', 'visible'); });
}
async function mixHome(fo) {
  await SAPD(); if (!SAP.sagre) SAP.sagre = await fetch('data/sagre.json').then(r => r.json()).catch(() => ({ eventi: [] }));
  const D2 = SAP.D, n = TEMI.has('natura'), s = TEMI.has('sapori'), altri = [...TEMI].filter(k => !PRONTI.includes(k));
  const conta = t => Object.values(S).filter(x => x.t === t).length;
  const nPar = conta('pn') + conta('pr'), nRis = conta('rn');
  const nSap = Object.values(D2.voci).filter(v => v.t !== 'materia' && v.t !== 'semi').length, nCom = Object.keys(D2.paesi).length;
  const pool = [...(n ? fo.filter(x => x.h) : []), ...(s ? (D2.foto || []).filter(x => x.h) : [])], pf = pool.length ? pool : fo.filter(x => x.h);
  NAT.hi = NAT.hi == null ? Math.floor(Math.random() * pf.length) : NAT.hi; const hf = pf[NAT.hi % pf.length] || {};
  const freccia = '<span class="fr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';
  const nC = {}; for (const v of Object.values(D2.voci)) for (const p of (v.paesi || [])) nC[p] = (nC[p] || 0) + 1;
  const punti = [...(n ? Object.entries(S).filter(([, x]) => ['pn', 'pr', 'rn', 'amp'].includes(x.t) && x.bb).map(([k, x]) => ({ a: 'nk', id: k, xy: centro(x), t: x.t === 'rn' ? 'riserva' : x.t === 'amp' ? 'marina' : 'parco', on: x.t !== 'rn', tit: x.n })) : []),
    ...(s ? Object.entries(D2.paesi).filter(([k]) => nC[k]).map(([k, p]) => ({ a: 'mp', id: k, xy: p.c, t: 'sagra', on: nC[k] >= 6, tit: `${p.n}: ${nC[k]} ${nC[k] === 1 ? 'sapore' : 'sapori'}` })) : [])];
  // dove natura e sapori si incontrano: i comuni dentro ogni parco
  const geo = {}; for (const f of (GJ.features || [])) geo[f.properties.id] = f.geometry;
  const ricco = v => ((v.ric || []).some(r => r === 'DOP' || r === 'IGP') ? 3 : 0) + (v.pat ? 1 : 0) + (v.fo ? 2 : 0);
  const incontri = (n && s) ? Object.entries(S).filter(([k, x]) => ['pn', 'pr'].includes(x.t) && geo[k]).map(([k, x]) => {
    const vtx = (geo[k].type === 'Polygon' ? [geo[k].coordinates] : geo[k].coordinates).flatMap(pl => pl[0]).filter((_, i) => i % 3 === 0);
    const com = Object.entries(D2.paesi).filter(([q, p]) => nC[q] && p.c[0] >= x.bb[0] - .05 && p.c[0] <= x.bb[2] + .05 && p.c[1] >= x.bb[1] - .05 && p.c[1] <= x.bb[3] + .05 && (dentroPoligono(p.c, geo[k]) || vtx.some(v => hav(v, p.c) < 3500))).map(([q]) => q);
    const voci = Object.values(D2.voci).filter(v => (v.paesi || []).some(q => com.includes(q)) && v.t !== 'materia').sort((a, b) => ricco(b) - ricco(a));
    return { k, x, com, voci };
  }).filter(o => o.com.length).sort((a, b) => b.voci.length - a.voci.length) : [];
  const mese = new Date().getMonth(), oi = new Date().toISOString().slice(0, 10);
  const prossime = (SAP.sagre.eventi || []).filter(e => e.t === 'sagra' && e.d[e.d.length - 1] >= oi).sort((a, b) => (a.d.find(d => d >= oi) > b.d.find(d => d >= oi) ? 1 : -1)).slice(0, 6);
  const stag = Object.values(D2.voci).filter(v => (v.m || []).includes(mese + 1) && v.t !== 'materia').slice(0, 6);
  const titolo = n && s ? 'La Sicilia,<br>natura <i>e sapori.</i>' : n ? 'La Sicilia,<br>una natura <i>da ascoltare.</i>' : s ? 'La Sicilia,<br>una tavola <i>da scoprire.</i>' : 'La Sicilia,<br><i>da scoprire.</i>';
  const lead = n && s ? `Dove cresce una specie spesso nasce un sapore. Sulla stessa mappa: ${nPar} parchi e ${nRis} riserve, ${nCom} comuni e ${fmt(nSap)} sapori documentati.` : 'Ci sono isole che si visitano. E poi ci sono isole che si imparano ad ascoltare.';
  $('cat').classList.add('on'); document.body.classList.add('cat-on');
  const primo = $('cat').dataset.v !== 'mix-home'; $('cat').dataset.v = 'mix-home'; if (primo) $('cat').scrollTop = 0;
  $('cat').innerHTML = `<div class="sh5 mix5">
    <section class="ap5">${filtroTemi()}<div class="apf" style="background-image:url('foto/${hf.f}.webp')" role="img" aria-label="${esc(hf.t || '')}"></div>
      <div class="apt"><h1>${titolo}</h1><p class="lead">${lead}</p>
        <label class="cerca5">${ico('map-pin-search')}<input id="mq" type="search" placeholder="Cerca un parco, un paese, un sapore…" autocomplete="off" aria-label="Cerca"><button id="mgo" aria-label="Cerca">${freccia}</button></label>
        <p class="apc">${esc(hf.t || '')}, foto di Oscar Cangelosi</p></div>
      ${n || s ? `<div class="apm">${mappaSicilia({ w: 420, nomi: true, punti })}<p class="leg">${n ? '<span><i class="t-parco"></i>Parchi</span><span><i class="t-riserva"></i>Riserve</span>' : ''}${s ? '<span><i class="t-sagra"></i>Comuni con sapori</span>' : ''}</p><button id="mmap">Esplora la mappa ${freccia}</button></div>` : ''}
    </section>
    ${altri.length ? `<section class="s5"><div class="presto5"><b>${altri.map(k => TEMA[k][0]).join(', ')}: in preparazione</b><p>Stiamo raccogliendo luoghi, storie e fonti. Intanto qui trovi ${n || s ? 'quello che è già pronto' : 'natura e sapori: aggiungili dal filtro in alto'}.</p></div></section>` : ''}
    ${incontri.length ? `<section class="s5"><div class="t5"><h2>Dove natura e sapori si incontrano</h2><p>I comuni dentro o ai margini di ogni parco, e quello che vi si produce. Il bosco, il pascolo e la tavola, nello stesso posto.</p></div>
      <div class="inc5">${incontri.map(o => `<article class="ic5"><button class="icf" data-nk="${o.k}" data-nwk="${esc(o.x.n)}"><span class="tag">Parco</span><b>${esc(o.x.n)}</b></button>
        <div class="ict"><p><b>${o.com.length} ${o.com.length === 1 ? 'comune' : 'comuni'}</b> con <b>${o.voci.length} sapori</b> documentati, tra cui ${o.voci.slice(0, 3).map(v => `<button class="lk" data-mv="${v.k}">${esc(v.n)}</button>`).join(', ')}.</p>
        <div class="chips5">${o.com.sort((a, b) => nC[b] - nC[a]).slice(0, 8).map(q => `<button data-mp="${q}">${esc(D2.paesi[q].n)}<em>${nC[q]}</em></button>`).join('')}</div></div></article>`).join('')}</div></section>` : ''}
    ${(n || s) ? `<section class="s5"><div class="t5"><h2>Questo mese in Sicilia</h2><p>${[n ? 'cosa fiorisce' : '', s ? 'i sapori di stagione e le prossime sagre' : ''].filter(Boolean).join(', ')}.</p></div>
      <div class="rail5">${s ? prossime.map(e => `<button class="pz5" data-mcal="1"><span class="img cal"><b>${+e.d.find(d => d >= oi).slice(8)}</b><small>${MESIL[+e.d.find(d => d >= oi).slice(5, 7) - 1]}</small></span><b>${esc(e.n)}</b><small>${esc(e.c)}, sagra</small></button>`).join('') : ''}${s ? stag.map(v => `<button class="pz5" data-mv="${v.k}"><span${imgAttr(v)}>${ico('basket')}</span><b>${esc(v.n)}</b><small>Di stagione</small></button>`).join('') : ''}</div></section>` : ''}
    <section class="s5"><div class="t5"><h2>Cosa ti va di scoprire?</h2></div>
      <div class="gusti5">${[...(n ? [['np:parchi', 'Parchi e riserve', `${nPar} parchi e ${nRis} riserve`, 'tree', 'natura/scogliere'], ['np:sentieri', 'Sentieri', 'Oltre 20.000 sentieri', 'route-2', 'natura/campagna'], ['np:funghi', 'Funghi', `${fmt(FUN.s.length)} specie`, 'mushroom', 'natura/funghi-muschio'], ['np:piante', 'Piante e fiori', `${fmt(PIA.s.length)} specie`, 'flower', 'natura/origano-fiore']] : []),
        ...(s ? [['ms:dolci', 'Dolci', `${Object.values(D2.voci).filter(v => v.t === 'dolce').length} dolci documentati`, 'cake', 'backcassatelle'], ['ms:formaggi', 'Formaggi', 'Pecorino, ricotta, tuma, provola', 'cheese', 'tuma-con-siero-nel-piatto'], ['ms:vini', 'Vini', 'Denominazioni e vitigni', 'glass-full', 'vigna-con-uva-1'], ['mcal', 'Calendario delle sagre', 'Sagre, mercatini e presepi', 'calendar', 'fichi-d-india']] : [])]
        .map(([k, t, d, ic, f]) => `<button data-mg="${k}"><span class="img conf" style="background-image:url('foto/${f}.webp')">${ico(ic)}</span><span class="tx"><b>${t}</b><small>${d}</small></span>${freccia}</button>`).join('')}</div></section>
    <p class="firma5">Un solo patrimonio.<br><i>Infinite storie da scoprire.</i></p>
    <p class="note n5">Natura: EEA Natura 2000, Regione Siciliana SIF, GBIF. Sapori: elenchi PAT, DOP e IGP, elenco dei dolci di Oscar Cangelosi. Foto di Oscar Cangelosi e da Wikipedia.</p>${COPY()}</div>`;
  sapFoto($('cat'));
  for (const el of $('cat').querySelectorAll('[data-nwk]')) wikiVoce(el.dataset.nwk).then(w => { if (w && w.thumbnail && !NOFOTO.test(w.thumbnail.source)) { el.style.backgroundImage = `url('${w.thumbnail.source.replace(/\/\d+px-/, '/640px-')}')`; el.classList.add('conf'); } });
  const cerca = () => { const q = $('mq').value.trim(); natMappa(); if (q) setTimeout(() => { $('q').value = q; $('q').dispatchEvent(new Event('input', { bubbles: true })); $('q').focus(); }, 300); };
  $('mq').onkeydown = e => { if (e.key === 'Enter') cerca(); }; $('mgo').onclick = e => { e.preventDefault(); cerca(); };
  if ($('mmap')) $('mmap').onclick = natMappa;
}
// porta in Sapori e poi esegue un'azione
function versoSapori(fn) { SAP.home = false; if (!SAP.on) { sapModo(true); setTimeout(() => SAPD().then(fn), 60); } else fn(); }
$('cat').addEventListener('click', e => {
  if ($('cat').dataset.v !== 'mix-home') return;
  const k = e.target.closest('[data-nk]'), mp = e.target.closest('[data-mp]'), mv = e.target.closest('[data-mv]'), mg = e.target.closest('[data-mg]'), mc = e.target.closest('[data-mcal]');
  if (k) { e.stopPropagation(); natMappa(); return setTimeout(() => apri(k.dataset.nk, true), 650); }
  if (mp) { e.stopPropagation(); return sapPaese(mp.dataset.mp); }
  if (mv) { e.stopPropagation(); return sapVoce(mv.dataset.mv); }
  if (mc) { e.stopPropagation(); return versoSapori(() => { SAP.cal = null; vai('meteo'); }); }
  if (!mg) return; e.stopPropagation(); const [a, b] = mg.dataset.mg.split(':');
  if (a === 'mcal') return versoSapori(() => { SAP.cal = null; vai('meteo'); });
  if (a === 'ms') return versoSapori(() => { Object.assign(SAP.fil, { k: b, q: '', paese: '', festa: '', lr: '', fam: '', ric: '', n: 60 }); $('cat').dataset.v = ''; vai('specie'); });
  if (b === 'parchi') { ON.aree = true; applica(); return natMappa(); }
  NAT.home = false; if (b === 'sentieri') return vai('escursioni'); vai(b);
}, true);

/* ---- riquadro accanto al puntatore sui punti delle mappe */
const TIP = (() => { const d = document.createElement('div'); d.className = 'tipm'; d.setAttribute('role', 'tooltip'); document.body.appendChild(d); return d; })();
const fineP = matchMedia('(hover:hover) and (pointer:fine)').matches;
function tipMostra(html, x, y) { TIP.innerHTML = html; TIP.classList.add('on'); const w = TIP.offsetWidth, h = TIP.offsetHeight; let l = x + 18, t = y + 14; if (l + w > innerWidth - 8) l = x - w - 14; if (t + h > innerHeight - 8) t = y - h - 10; TIP.style.transform = `translate(${l}px,${t}px)`; }
const tipNascondi = () => { TIP.classList.remove('on'); TIP.dataset.k = ''; };
const tipHint = t => `<em class="tk">${t}</em>`;
// un solo modo di leggere i punti di tutte le mappe disegnate
function tipSvg(c) {
  const d = c.dataset;
  if ((d.sc || d.mp) && SAP.D && SAP.D.paesi[d.sc || d.mp]) return tipPaese(d.sc || d.mp);
  if (d.nk) return tipZona(d.nk);
  if (d.cev) return tipEvento(d.cev);
  if (d.fv) return tipVarieta(d.fv);
  return '';
}
function tipEvento(id) {
  const ev = ((SAP.sagre || {}).eventi || []).find(x => x.id === id); if (!ev) return '';
  const oggi = iso(new Date()), pr = ev.d.find(x => x >= oggi) || ev.d[0], dd = pr.split('-');
  return `<span class="tt">${esc(ev.t === 'sagra' ? 'Sagra' : ev.t === 'festa' ? 'Festa' : 'Appuntamento')} · ${esc(ev.c)}</span><b>${esc(ev.n)}</b><small>${+dd[2]} ${MESIL[+dd[1] - 1]}${ev.d.length > 1 ? `, per ${ev.d.length} giorni` : ''}</small>${tipHint('Clic per saperne di più')}`;
}
function tipPercorso(id) {
  if (!PRCA) { caricaPercorsi().then(a => { PRCA = a; TIP.dataset.k = ''; }); return `<span class="tt">Percorso segnato</span><b>Sentiero</b>${tipHint('Clic per saperne di più')}`; }
  const p = PRCA.find(x => x.id === +id); if (!p) return '';
  const c = CAI[p.c];
  return `<span class="tt">Percorso segnato${c ? ' · ' + esc(T(...c)) : ''}</span><b>${esc(p.n || p.r || 'Sentiero')}</b><small>${num1(p.km)} km${p.up ? ` · +${fmt(p.up)} m` : ''}${p.dur ? ' · ' + esc(durata(p.dur)) : ''}</small>${tipHint('Clic per saperne di più')}`;
}
const tipPunto = q => `<span class="tt">${esc(T(...(POIN[q.t] || ['Punto', 'Point'])))}</span><b>${esc(q.n || T(...(POIN[q.t] || ['Punto', 'Point'])))}</b>${q.e ? `<small>${fmt(q.e)} m di quota</small>` : ''}${tipHint('Clic per saperne di più')}`;
const tipBosco = cf => `<span class="tt">Carta forestale</span><b>${esc(tipoCF(cf))}</b><small>${esc(CFN.macro[cf.slice(0, 2)] || '')}</small>${tipHint('Clic per saperne di più')}`;
// clic sui punti delle mappe disegnate: sempre la stessa scheda breve
document.addEventListener('click', e => {
  const c = e.target.closest && e.target.closest('svg.smap circle'); if (!c) return; const d = c.dataset;
  if (!(d.sc || d.mp || d.nk || d.cev || d.fv)) return;
  e.stopPropagation(); e.preventDefault(); SAP.ancora = [e.clientX, e.clientY];
  if (d.sc || d.mp) return sapCartaPaese(d.sc || d.mp, true);
  if (d.nk) return natCarta(d.nk);
  if (d.cev) return cartaEvento(d.cev);
  if (d.fv) return cartaVarieta(d.fv);
}, true);
function tipGruppo(p) { return `<span class="tt">Più comuni vicini</span><b>${p.point_count} comuni</b><small>${p.tot} sapori documentati</small>${tipHint('Clic per l’elenco, dal più ricco')}`; }
function tipPaese(k, p) {
  const D = SAP.D; if (!D || !D.paesi[k]) return ''; const pa = D.paesi[k];
  const voci = Object.values(D.voci).filter(v => (v.paesi || []).includes(k)), fo = voci.find(v => v.fo);
  const top = voci.slice().sort((a, b) => (!!b.fo - !!a.fo) || ((b.ric || []).length - (a.ric || []).length)).slice(0, 3).map(v => v.n);
  const pr = Object.values(D.produttori).filter(x => x.paese === k).length;
  return `${fo ? `<span class="ti" style="background-image:url('foto/${fo.fo.f}.webp')"></span>` : ''}<span class="tt">${esc(PROVN[pa.pv] || '')}</span><b>${esc(pa.n)}</b><small>${voci.length} ${voci.length === 1 ? 'sapore' : 'sapori'}${pr ? ` · ${pr} ${pr === 1 ? 'produttore' : 'produttori'}` : ''}</small>${top.length ? `<span class="tl">${top.map(esc).join(' · ')}</span>` : ''}${tipHint('Clic per saperne di più')}`;
}
function tipProd(k) {
  const D = SAP.D, p = D && D.produttori[k]; if (!p) return ''; const pa = D.paesi[p.paese];
  const tipo = p.tipo ? p.tipo[0].toUpperCase() + p.tipo.slice(1) : RUOLO[p.r][0];
  const fa = (p.fa || []).map(x => D.voci[x] && D.voci[x].n).filter(Boolean);
  return `<span class="tt">${esc(tipo)} · ${esc(pa.n)}</span><b>${esc(p.n)}</b>${fa.length ? `<span class="tl">${fa.slice(0, 2).map(esc).join(' · ')}</span>` : ''}<small>${p.liv === 'Segnalato' ? 'Segnalato, da visitare' : esc(p.liv)}</small>${tipHint('Clic per saperne di più')}`;
}
function tipZona(k) {
  const z = S[k]; if (!z) return ''; let n = 0; try { n = specieDi(k).length; } catch (e) {}
  const tipo = TIPZ[z.t] || '';
  const dati = z.t === 'am' ? [z.sp ? `<i>${esc(z.sp)}</i>` : '', z.com ? esc(z.com) : '', z.circ ? fmt(z.circ) + ' cm di tronco' : ''] : [z.ha ? fmt(z.ha) + ' ha' : '', z.bha ? fmt(z.bha) + ' ha di bosco' : '', n ? fmt(n) + ' specie' : ''];
  return `<span class="tt">${esc(tipo)}</span><b>${esc(z.n)}</b><small>${dati.filter(Boolean).join(' · ')}</small>${tipHint('Clic per saperne di più')}`;
}
if (fineP) {
  // mappe disegnate (SVG): il nome al posto del suggerimento del browser
  document.addEventListener('mouseover', e => { const c = e.target.closest && e.target.closest('svg.smap circle'); if (!c) return; const ti = c.querySelector('title'); if (ti) { c.dataset.tip = ti.textContent; ti.remove(); } { const h = tipSvg(c); if (h) return tipMostra(h, e.clientX, e.clientY); } if (c.dataset.tip) tipMostra(`<b>${esc(c.dataset.tip.split(':')[0])}</b>${c.dataset.tip.includes(':') ? `<small>${esc(c.dataset.tip.split(':').slice(1).join(':').trim())}</small>` : ''}`, e.clientX, e.clientY); });
  document.addEventListener('mousemove', e => { if (!TIP.classList.contains('on')) return; const c = e.target.closest && e.target.closest('svg.smap circle'); if (c) tipMostra(TIP.innerHTML, e.clientX, e.clientY); });
  document.addEventListener('mouseout', e => { if (e.target.closest && e.target.closest('svg.smap circle')) tipNascondi(); });
  // mappa vera (MapLibre): comuni dei sapori, aree protette, alberi, boschi
  map.on('mousemove', e => {
    const ORD = ['sap-c', 'sap-pr', 'sap-p', 'osm-p', 'am-c', 'bv-p', 'osm-r', 'prv', 'bv-f', 'bs-f', 'aree-f', 'n2k-f', 'zps-f', 'cf-f'];
    const L = ORD.filter(l => map.getLayer(l) && map.getLayoutProperty(l, 'visibility') !== 'none');
    const f = L.length ? map.queryRenderedFeatures([[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]], { layers: L }).sort((a, b) => ORD.indexOf(a.layer.id) - ORD.indexOf(b.layer.id)) : [];
    if (!f.length) { map.getCanvas().style.cursor = ''; return tipNascondi(); }
    const x = f[0], p = x.properties, id = x.layer.id, oe = e.originalEvent; map.getCanvas().style.cursor = 'pointer';
    let h = '';
    const chiave = id + ':' + (p.k || p.id || p.cluster_id || p.c || p.n); if (TIP.dataset.k === chiave && TIP.classList.contains('on')) return tipMostra(TIP.innerHTML, oe.clientX, oe.clientY);
    if (id === 'sap-c') h = tipGruppo(p);
    else if (id === 'sap-p') h = tipPaese(p.k, p);
    else if (id === 'sap-pr') h = tipProd(p.k);
    else if (id === 'osm-p') h = tipPunto(p);
    else if (id === 'osm-r' || id === 'prv') h = tipPercorso(p.id);
    else if (id === 'cf-f') h = tipBosco(p.c);
    else h = tipZona(p.id);
    if (!h) return tipNascondi();
    TIP.dataset.k = chiave; tipMostra(h, oe.clientX, oe.clientY);
  });
  map.on('mouseout', tipNascondi);
}


/* ---- ogni pagina racconta anche le altre sezioni */
function altreSez() {
  if (isApp || typeof SEZT === 'undefined' || ($('cat').dataset.v === 'gen-home')) return '';
  const qui = SEZ === 'home' ? '' : SEZ, freccia = '<span class="fr" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';
  return `<aside class="altre5" aria-label="Le altre sezioni"><p class="t">${qui ? 'Continua a scoprire la Sicilia' : 'Le sezioni di Sicilia Naturale'}</p><div>${Object.entries(SEZT).filter(([k]) => k !== qui).map(([k, x]) => `<button data-tema="${k}" style="--tc:${TEMA[k][1]}"><i></i><b>${x.t}</b><small>${PRONTI.includes(k) ? x.s : 'In preparazione'}</small>${freccia}</button>`).join('')}</div></aside>`;
}
function dopoScheda() {
  if (isApp) return; const sb = $('sb'); if (!sb || sb.querySelector('.altre5m')) return;
  // schede di Natura: una foto in apertura e il racconto più leggibile
  if (cur && S[cur] && !sb.querySelector('.eroeN')) { const k = cur; sb.insertAdjacentHTML('afterbegin', `<div class="eroe5 eroeN" id="nre"></div>`); $('sheet').classList.add('natn');
    wikiVoce(S[k].n.replace(/^(Riserva naturale (orientata|integrale|speciale)?|Parco (regionale|nazionale)?)\s*/i, m => m) ).then(w => { const el = $('nre'); if (!el || cur !== k) return; if (w && w.thumbnail && !NOFOTO.test(w.thumbnail.source)) el.style.backgroundImage = `url('${w.thumbnail.source.replace(/\/\d+px-/, '/800px-')}')`; else el.remove(); }); }
  sb.insertAdjacentHTML('beforeend', `<div class="altre5m">${altreSez()}</div>`);
}
// mappa di Natura: un tasto per tornare all'inizio della sezione
if (!isApp) { document.querySelector('#wrap .top').insertAdjacentHTML('beforeend', '<button class="natT" id="natT">‹ Inizio di Natura</button>'); $('natT').onclick = () => entraSez('natura'); }

/* ---- leggere bene: testo più grande e contrasto alto, per tutti (anziani, bambini, chi legge dal telefono al sole) */
const LET = (() => { try { return JSON.parse(localStorage.getItem('sn_let') || '{}'); } catch (e) { return {}; } })();
function applicaLet() { document.body.classList.toggle('tx-l', LET.t === 1); document.body.classList.toggle('tx-xl', LET.t === 2); document.body.classList.toggle('hc', !!LET.c); for (const x of document.querySelectorAll('.let5 [data-let]')) { const k = x.dataset.let; x.disabled = (k === 'm' && !LET.t) || (k === 'p' && LET.t === 2); if (k === 'c') x.setAttribute('aria-pressed', !!LET.c); } try { localStorage.setItem('sn_let', JSON.stringify(LET)); } catch (e) {} }
if (!isApp) {
  document.querySelector('header .lang').insertAdjacentHTML('beforebegin', `<div class="let5" role="group" aria-label="Leggi meglio"><button data-let="m" aria-label="Testo più piccolo" title="Testo più piccolo">A<sup>−</sup></button><button data-let="p" aria-label="Testo più grande" title="Testo più grande">A<sup>+</sup></button><button data-let="c" aria-label="Contrasto alto: testo più scuro e colori più netti, per leggere meglio" title="Contrasto alto: testo più scuro e colori più netti" aria-pressed="false">◐</button></div>`);
  document.querySelector('.let5').onclick = e => { const b = e.target.closest('[data-let]'); if (!b) return; const k = b.dataset.let;
    if (k === 'p') LET.t = Math.min(2, (LET.t || 0) + 1); else if (k === 'm') LET.t = Math.max(0, (LET.t || 0) - 1); else LET.c = !LET.c;
    applicaLet(); };
  applicaLet();
}


/* ---- per chi studia: glossario, metodo e fonti, schede da stampare e citare */
const GLOSS = {
  'Natura 2000': 'La rete europea di aree protette per conservare habitat e specie rari. In Sicilia comprende ZSC e ZPS.',
  'ZSC': 'Zona Speciale di Conservazione: un\'area della rete Natura 2000 che protegge habitat e specie elencati da una direttiva europea.',
  'ZPS': 'Zona di Protezione Speciale: un\'area della rete Natura 2000 dedicata alla tutela degli uccelli selvatici.',
  'endemica': 'Una specie endemica vive solo in un territorio preciso e in nessun altro posto al mondo.',
  'habitat': 'L\'ambiente in cui vive una specie: il suolo, il clima, le piante e gli animali che lo caratterizzano.',
  'riserva orientata': 'Una riserva dove sono ammesse alcune attività dell\'uomo, purché rispettino la natura del luogo.',
  'riserva integrale': 'Una riserva dove la natura è lasciata a sé stessa e l\'uomo può entrare solo con limiti molto stretti.',
  'IUCN': 'L\'Unione internazionale per la conservazione della natura: classifica le aree protette e il rischio di estinzione delle specie.',
  'DOP': 'Denominazione di Origine Protetta: un prodotto fatto interamente in una zona precisa, seguendo un disciplinare approvato in Europa.',
  'IGP': 'Indicazione Geografica Protetta: un prodotto legato a una zona, dove avviene almeno una fase della produzione.',
  'PAT': 'Prodotto Agroalimentare Tradizionale: preparato allo stesso modo da almeno venticinque anni, nell\'elenco del Ministero dell\'agricoltura.',
  'DOCG': 'Denominazione di Origine Controllata e Garantita: il livello più alto di tutela per i vini italiani.',
  'DOC': 'Denominazione di Origine Controllata: un vino prodotto in una zona precisa con regole su uve e metodo.',
  'IGT': 'Indicazione Geografica Tipica: un vino legato a un territorio, con regole meno strette di DOC e DOCG.',
  'Lista rossa': 'L\'elenco di dolci, piatti, varietà e razze che rischiano di sparire, con il loro stato: vivo, raro, a rischio, perduto.',
  'disciplinare': 'Il documento ufficiale che stabilisce zona, ingredienti e metodo di un prodotto a denominazione.',
  'GBIF': 'Una banca dati mondiale e libera delle osservazioni di piante, funghi e animali.',
  'Darwin Core': 'Un formato standard per scambiare dati sulla biodiversità tra musei, università e ricercatori.',
  'bosco vetusto': 'Un bosco antico, rimasto senza tagli per moltissimo tempo, con alberi vecchi e legno morto che ospitano molta vita.',
  'albero monumentale': 'Un albero tutelato per età, dimensioni, forma o valore storico, iscritto in un elenco nazionale.'
};
const GLRE = new RegExp('(^|[^\\p{L}])(' + Object.keys(GLOSS).sort((a, b) => b.length - a.length).map(k => k.replace(/ /g, '\\s')).join('|') + ')(?![\\p{L}])', 'u');
function glossa(root) {
  if (!root || isApp) return; const visti = new Set();
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest('button,a,h2,h3,abbr,.src,.cap5,.kick,script') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  const nodi = []; while (tw.nextNode()) nodi.push(tw.currentNode);
  for (const n of nodi) { const m = n.nodeValue.match(GLRE); if (!m) continue; const k = Object.keys(GLOSS).find(x => x.toLowerCase() === m[2].replace(/\s+/g, ' ').toLowerCase()); if (!k || visti.has(k)) continue; visti.add(k);
    const i = m.index + m[1].length, r = n.splitText(i); r.splitText(m[2].length); const ab = document.createElement('abbr'); ab.className = 'gl'; ab.dataset.gl = k; ab.tabIndex = 0; ab.textContent = r.nodeValue; r.replaceWith(ab); }
}
const glMostra = (el, x, y) => tipMostra(`<b>${esc(el.dataset.gl)}</b><small>${esc(GLOSS[el.dataset.gl])}</small>`, x, y);
document.addEventListener('mouseover', e => { const g = e.target.closest && e.target.closest('abbr.gl'); if (g) glMostra(g, e.clientX, e.clientY); });
document.addEventListener('mouseout', e => { if (e.target.closest && e.target.closest('abbr.gl')) tipNascondi(); });
document.addEventListener('click', e => { const g = e.target.closest && e.target.closest('abbr.gl'); if (!g) return; e.stopPropagation(); const r = g.getBoundingClientRect(); glMostra(g, r.left, r.bottom); setTimeout(tipNascondi, 5000); }, true);
// pagine di servizio: glossario e metodo
function pagina(k) {
  chiudi(); $('cat').classList.add('on'); document.body.classList.add('cat-on'); $('cat').dataset.v = 'pag-' + k; $('cat').scrollTop = 0;
  const testa = (t, d) => `<div class="sh5 pag5"><section class="s5"><h1>${t}</h1><p class="lead">${d}</p></section>`;
  if (k === 'glossario') $('cat').innerHTML = testa('Glossario', 'Le parole un po\' difficili che trovi nelle schede, spiegate in modo semplice. Nelle schede sono sottolineate: passaci sopra o toccale per leggere la spiegazione.') +
    `<section class="s5"><dl class="gl5">${Object.entries(GLOSS).sort((a, b) => a[0].localeCompare(b[0], 'it')).map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl></section>${COPY()}</div>`;
  else $('cat').innerHTML = testa('Metodo e fonti', 'Come sono raccolti e verificati i dati di Sicilia Naturale, e come citarli in una ricerca o in una tesi.') +
    `<section class="s5 txt5"><h2>Da dove vengono i dati</h2>
      <p><b>Natura</b>: aree protette e siti Natura 2000 dall'Agenzia europea dell'ambiente e dalla Regione Siciliana (Sistema informativo forestale); boschi vetusti, boschi da seme e alberi monumentali dagli elenchi ufficiali; specie da GBIF; sentieri e punti di interesse da OpenStreetMap; meteo da Open-Meteo e allerte dalla Protezione Civile.</p>
      <p><b>Sapori</b>: elenco nazionale dei prodotti agroalimentari tradizionali (PAT), elenco regionale dei prodotti DOP e IGP, vini a denominazione (IRVO), elenco dei dolci siciliani di Oscar Cangelosi. Le date delle sagre vengono da siti di eventi e giornali locali, indicati in ogni scheda.</p>
      <h2>Come li usiamo</h2>
      <p>I racconti delle schede sono costruiti solo dai dati delle fonti: niente viene inventato. Dove una zona è indicativa lo scriviamo. Le specie rare hanno la posizione sfumata di circa 10 km per proteggerle. Non diamo mai indicazioni sulla commestibilità di funghi e piante selvatiche.</p>
      <h2>Per chi studia e insegna</h2>
      <p>Ogni scheda ha il tasto <b>Stampa o salva per la ricerca</b>: produce una pagina pulita con le fonti. Dalle schede delle zone si scaricano l'elenco delle specie in CSV; dalle uscite registrate le osservazioni in Darwin Core; dagli itinerari il PDF e il GPX.</p>
      <h2>Come citare</h2><p class="cit5">Sicilia Naturale, atlante della natura e dei sapori di Sicilia, a cura di Oscar Cangelosi. ${esc(location.origin + location.pathname)}, consultato il ${new Date().toLocaleDateString('it-IT')}.</p>
      <p class="note">Il sito è un prototipo in costruzione: alcuni dati sono di prova e sono segnalati come tali.</p></section>${COPY()}</div>`;
}
document.addEventListener('click', e => { const b = e.target.closest('[data-pag]'); if (!b) return; e.preventDefault(); e.stopPropagation(); pagina(b.dataset.pag); }, true);
// schede: glossario, stampa e citazione
const _dopo = dopoScheda;
dopoScheda = function () {
  _dopo(); const sb = $('sb'); if (!sb || isApp) return; glossa(sb);
  if (!sb.querySelector('.ric5')) { const tit = ($('sh').querySelector('h2') || {}).textContent || document.querySelector('.nh5 h2')?.textContent || 'Scheda';
    const box = `<div class="ric5"><button class="stampa5">Stampa o salva per la ricerca</button><p><b>Come citare questa scheda</b><br>Sicilia Naturale, «${esc(tit)}», a cura di Oscar Cangelosi, consultato il ${new Date().toLocaleDateString('it-IT')}. <button class="lk" data-pag="metodo">Metodo e fonti</button></p></div>`;
    const a = sb.querySelector('.altre5m'); a ? a.insertAdjacentHTML('beforebegin', box) : sb.insertAdjacentHTML('beforeend', box); }
};
document.addEventListener('click', e => { if (!e.target.closest('.stampa5')) return; document.body.classList.add('stampa'); window.print(); setTimeout(() => document.body.classList.remove('stampa'), 500); });

/* ---------- navigatore: ogni pagina e ogni scheda ha il suo indirizzo (solo sito)
   #/                     inizio            #/natura, #/natura/mappa, /percorsi, /meteo, /funghi, /piante, /calendario
   #/sapori, #/sapori/mappa, /catalogo, /calendario, /itinerari, /vino (le cinque materie)
   #/zona/EUAP0228        scheda di un parco, riserva, sito, bosco o albero
   #/specie/funghi/Amanita_phalloides     #/sapori/scheda/<chiave>     #/percorso/<id>
   #/mare, #/arte, #/storia, #/glossario, #/metodo
   Gli indirizzi vecchi (#EUAP0228, #it=...) continuano a funzionare. */
const ROTTA = { pronta: false, applico: false, t: 0 };
const attesa = ms => new Promise(r => setTimeout(r, ms));
const aspetta = async (ok, max = 6000) => { for (let n = 0; n < max / 80; n++) { try { if (ok()) return true; } catch (e) {} await attesa(80); } return false; };
const nomeUrl = s => encodeURIComponent(String(s).replace(/ /g, '_')).replace(/%2F/g, '/');
function rottaAttuale() {
  const aperta = $('sheet').classList.contains('open'), c = String(cur || '');
  if (aperta && c.startsWith('SP:')) { const [, tp, i] = c.split(':'), r = (tp === 'funghi' ? FUN : PIA).s[+i]; if (r) return `#/specie/${tp}/${nomeUrl(r[0])}`; }
  if (aperta && c.startsWith('SAP:') && !/^SAP:(fv|v):/.test(c)) return '#/sapori/scheda/' + nomeUrl(c.slice(4));
  if (aperta && c && S[c]) return '#/zona/' + nomeUrl(c);
  if (PERC_SEL != null && (aperta || document.body.classList.contains('mm'))) return '#/percorso/' + PERC_SEL;
  const v = $('cat').dataset.v || '';
  if (v === 'pag-glossario') return '#/glossario';
  if (v.startsWith('pag-')) return '#/metodo';
  if (SEZ === 'home') return v === 'gen-home' ? '#/' : null;
  if (!PRONTI.includes(SEZ)) return '#/' + SEZ;
  if (sapOn()) return { 'sap-home': '#/sapori', 'sap-cat': '#/sapori/catalogo' + (SAP.fil && SAP.fil.k && SAP.fil.k !== 'tutto' ? '/' + nomeUrl(SAP.fil.k) : ''), 'sap-cal': '#/sapori/calendario', 'sap-it': '#/sapori/itinerari', 'sap-fil': '#/sapori/' + SAP.fk }[v]
    || (vista === 'mappa' && !SAP.home ? '#/sapori/mappa' : null);
  if (v === 'nat-home') return '#/natura';
  if (v === 'cal') return '#/natura/calendario';
  return { funghi: '#/natura/funghi', piante: '#/natura/piante', escursioni: '#/natura/percorsi', meteo: '#/natura/meteo', mappa: NAT.home ? null : '#/natura/mappa' }[vista] || null;
}
// titolo della scheda del browser: "Tignosa verdognola · Sicilia Naturale"
function titoloRotta(r) {
  const T0 = 'Sicilia Naturale', p = r.slice(2).split('/');
  const h2 = $('sheet').classList.contains('open') && $('sh').querySelector('h2:not([hidden])');
  if (['zona', 'specie', 'percorso'].includes(p[0]) || p[1] === 'scheda') return (h2 ? h2.textContent.trim() + ' · ' : '') + T0;
  const N = { natura: 'Natura', sapori: 'Sapori', mare: 'Mare', arte: 'Arte', storia: 'Storia', glossario: 'Glossario', metodo: 'Metodo e fonti' };
  const S2 = { mappa: 'Mappa', percorsi: 'Percorsi', meteo: 'Meteo', funghi: 'Funghi', piante: 'Piante', calendario: 'Calendario', catalogo: 'Catalogo', itinerari: 'Itinerari' };
  return p[0] ? [S2[p[1]] || (p[1] ? p[1][0].toUpperCase() + p[1].slice(1) : ''), N[p[0]], T0].filter(Boolean).join(' · ') : T0 + ' · La natura e i sapori della Sicilia';
}
function segnaRotta() {
  if (isApp || !ROTTA.pronta || ROTTA.applico) return;
  clearTimeout(ROTTA.t);
  ROTTA.t = setTimeout(() => {
    if (ROTTA.applico) return;
    const r = rottaAttuale(); if (!r) return;
    if (r !== (location.hash || '#/')) try { history.pushState(null, '', r === '#/' ? location.pathname : r); } catch (e) {}
    document.title = titoloRotta(r);
  }, 250);
}
async function applicaRotta(h) {
  if (isApp) return;
  ROTTA.applico = true; clearTimeout(ROTTA.t);
  try {
    const [a, b, c] = h.replace(/^#\/?/, '').split('/').map(x => decodeURIComponent(x || '').replace(/_/g, ' '));
    const natura = async () => { if (SEZ !== 'natura' || sapOn()) { entraSez('natura'); await aspetta(() => !sapOn()); } NAT.home = false; };
    if (!a) entraSez('home');
    else if (a === 'natura') {
      if (!b) entraSez('natura');
      else { await natura(); const v = { mappa: 'mappa', percorsi: 'escursioni', meteo: 'meteo', funghi: 'funghi', piante: 'piante', calendario: 'piante' }[b] || 'mappa'; vai(v);
        if (b === 'calendario') { await CAT; await attesa(200); calendario(); } }
    } else if (a === 'sapori') {
      if (!sapOn()) entraSez('sapori'); else if (!b) entraSez('sapori');
      await aspetta(() => sapOn() && SAP.D);
      if (b === 'catalogo') { if (SAP.fil) { SAP.fil.k = c && (GUSTO[c] || ['ingr', 'prod'].includes(c)) ? c : 'tutto'; } vai('specie'); } else if (b === 'calendario') vai('meteo'); else if (b === 'itinerari') vai('escursioni');
      else if (b === 'mappa') { SAP.home = false; vai('mappa'); }
      else if (b === 'scheda' && c) { const k = c.replace(/ /g, '_'), D2 = SAP.D; const kk = D2.voci[k] || D2.paesi[k] || D2.produttori[k] ? k : c; await attesa(300); sapApri(kk); }
      else if (b) sapFiliera(b);
    } else if (a === 'zona') {
      const k = b.replace(/ /g, '_'); const kk = S[k] ? k : b;
      if (S[kk]) { await natura(); vai('mappa'); await attesa(650); apri(kk, true); }
    } else if (a === 'specie') {
      await CAT; const tp = b === 'piante' ? 'piante' : 'funghi', i = (tp === 'funghi' ? FUN : PIA).s.findIndex(r => r[0] === c);
      await natura(); vai(tp); if (i >= 0) { await attesa(300); apriSpecie(tp, i); }
    } else if (a === 'percorso') { await natura(); vai('escursioni'); await attesa(300); await apriPercorso(b); }
    else if (a === 'glossario' || a === 'metodo') pagina(a);
    else if (TEMA[a]) entraSez(a);
    else entraSez('home');
  } catch (e) { console.warn('rotta', e); }
  await attesa(700);
  ROTTA.applico = false;
  // se il link non porta dove dice (scheda inesistente…), l'indirizzo si corregge su ciò che si vede
  const fine = () => { const r = rottaAttuale(); if (!r) return; if (r !== (location.hash || '#/')) try { history.replaceState(null, '', r === '#/' ? location.pathname : r); } catch (e) {} document.title = titoloRotta(r); };
  fine(); setTimeout(fine, 900);
}
if (!isApp) {
  const osserva = new MutationObserver(segnaRotta);
  osserva.observe($('cat'), { attributes: true, attributeFilter: ['data-v'] });
  osserva.observe($('sheet'), { attributes: true, attributeFilter: ['class'] });
  osserva.observe($('sh'), { childList: true });
  osserva.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('popstate', () => { if (!location.hash.startsWith('#it=')) applicaRotta(location.hash); });
  // tasto "Condividi" in ogni scheda: sul telefono apre la condivisione (WhatsApp…), sul computer copia il link
  new MutationObserver(() => { const h = $('sh'), x = h.querySelector('.close'); if (!x || h.querySelector('.condividi')) return;
    x.insertAdjacentHTML('beforebegin', `<button class="condividi" aria-label="Condividi questa scheda" title="Condividi">${ico('share')}</button>`); }).observe($('sh'), { childList: true });
  $('sh').addEventListener('click', async e => { if (!e.target.closest('.condividi')) return; e.stopPropagation();
    const r = rottaAttuale(); const url = location.origin + location.pathname + (r && r !== '#/' ? r : ''), tit = document.title;
    if (navigator.share && matchMedia('(pointer:coarse)').matches) { try { await navigator.share({ title: tit, url }); } catch (er) {} return; }
    try { await navigator.clipboard.writeText(url); toast('Link copiato: puoi incollarlo dove vuoi'); } catch (er) { prompt('Copia il link', url); } });
  // all'apertura: si aspetta che la prima pagina sia pronta, poi si applica il link (se c'è)
  aspetta(() => $('cat').dataset.v || document.body.classList.contains('mm') || $('sheet').classList.contains('open'), 10000).then(async () => {
    if (HASH_ROTTA) await applicaRotta(location.hash);
    ROTTA.pronta = true;
    const r = rottaAttuale(); if (r) { if (!HASH_ROTTA && !location.hash.startsWith('#it=')) try { history.replaceState(null, '', r === '#/' ? location.pathname : r); } catch (e) {} document.title = titoloRotta(r); }
  });
}
}
