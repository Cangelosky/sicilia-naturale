"""Sezioni approfondite di Sapori: vino, olio, grano, formaggio, pane.

Testi scritti con parole nostre a partire dalle fonti elencate (28/11/2026).
Le varietà di vino, olio e grano sono voci nuove; formaggi e pani usano le voci
già presenti in sapori.json (DOP, PAT, presìdi), raggruppate e spiegate.
Scrive www/data/filiere.json.
"""
import json
from pathlib import Path

R = Path(__file__).resolve().parent.parent
SAP = json.loads((R / 'www/data/sapori.json').read_text())
P, V = SAP['paesi'], SAP['voci']

F = {
    'decanter': ['Decanter, guida ai vitigni autoctoni siciliani', 'https://www.decanter.com/premium/a-guide-to-sicilys-native-grape-varieties-517942/'],
    'docsicilia': ['Disciplinare della DOC Sicilia', 'https://aisitalia.it/Disciplinari/Sicilia/DOC/Sicilia.pdf'],
    'vitigni': ['Elenco dei vitigni della Sicilia (Italy\'s Finest Wines)', 'https://www.italysfinestwines.it/vitigni-sicilia-2/'],
    'itinerari': ['Itinerari nel gusto, vini di Sicilia', 'https://itinerarinelgusto.it/vini-italiani/vini-siciliani'],
    'oliodop': ['Città Metropolitana di Messina, scheda sull\'olio DOP siciliano', 'https://www.cittametropolitana.me.it/la-provincia/news2020/i-direzione/allegati/2021/oliodop.pdf'],
    'coi': ['Catalogo mondiale delle varietà di olivo (Consiglio oleicolo internazionale)', 'https://worldolivecatalogue.internationaloliveoil.org/en/variety/italy/nocellara-del-belice'],
    'sfpresidi': ['Fondazione Slow Food, presìdi della Sicilia', 'https://www.fondazioneslowfood.com/it/regioni-presidi/sicilia-it/'],
    'crea': ['CREA, i grani antichi siciliani (agi.it)', 'https://www.agi.it/blog-italia/crea/post/2019-08-09/grani_antichi_siciliani_storia-5997523/'],
    'regvar': ['Regione Siciliana, varietà da conservazione iscritte', 'https://regione.sicilia.it/istituzioni/regione/strutture-regionali/assessorato-agricoltura-sviluppo-rurale-pesca-mediterranea/dipartimento-agricoltura/altri-contenuti/commissione-variet%C3%A0/variet%C3%A0'],
    'emporio': ['Emporio Sicilia, i grani antichi siciliani', 'https://emporiosicilia.it/en/blogs/storie-e-tradizioni/grani-antichi-siciliani-quali-sono-come-si-usano'],
    'mdpi': ['Studio sulle paste di Russello, Perciasacchi e Margherito (Foods, 2025)', 'https://www.mdpi.com/2304-8158/14/12/2050'],
    'gambero': ['Gambero Rosso, Tiraditto e Pilusedda', 'https://www.gamberorosso.it/attualita/tiraditto-e-pilusedda-in-sicilia-la-riscoperta-di-due-grani-antichi-gentili/'],
    'custodi': ['La Sicilia, rete d\'impresa dei grani antichi', 'https://www.lasicilia.it/news/attualita/3075165/dal-seme-al-mercato-la-rete-d-impresa-punta-all-igp-per-i-grani-antichi-siciliani.html'],
    'pat': ['Elenco regionale dei prodotti agroalimentari tradizionali (2024)', 'https://www.regione.sicilia.it/sites/default/files/2024-04/ELENCO~1.pdf'],
    'ragusano': ['Disciplinare del Ragusano DOP', 'https://www.quattrocalici.it/wp-content/uploads/2021/05/ragusano_dop.pdf'],
    'pecorino': ['Gambero Rosso, il pecorino siciliano', 'https://www.gamberorosso.it/notizie/formaggio-di-pecora-in-sicilia-guida-ai-migliori/'],
}


def vv(k, n, sin, paesi, testo, dop=(), fonti=(), extra=None):
    for p in paesi:
        assert p in P, p
    for d in dop:
        assert d in V, d
    x = {'k': k, 'n': n, 'sin': sin, 'paesi': list(paesi), 't': testo, 'dop': list(dop), 'f': list(fonti)}
    if extra:
        x.update(extra)
    return x


VINO = {
    'n': 'Vitigno', 'sub': 'I vitigni di Sicilia',
    'intro': [
        'La Sicilia è una delle regioni d’Italia con più vigne. Su un’isola così varia, tra mare, colline argillose, altopiani calcarei e il vulcano, ogni vitigno ha trovato il suo posto.',
        'Il consorzio della DOC Sicilia conta oltre settanta vitigni autoctoni, ma solo una piccola parte entra oggi nei vini a denominazione. Quattro varietà, Catarratto, Grillo, Nero d’Avola e Zibibbo, coprono da sole più della metà dei vigneti.',
        'Qui trovi i vitigni principali: da dove vengono, dove crescono meglio e in quali vini li ritrovi.',
    ],
    'gruppi': [
        {'n': 'Vitigni a bacca rossa', 'v': [
            vv('nero-davola', 'Nero d’Avola', 'Calabrese', ['avola', 'noto', 'pachino', 'vittoria'],
               'Prende il nome da Avola, nel Siracusano, ed è il rosso più coltivato dell’isola: circa un vigneto su sette. Dà il meglio sui suoli calcarei del sud-est, tra Noto, Pachino e Vittoria, ma anche nel Nisseno e intorno a Menfi. Un tempo dava vini scuri e pesanti; oggi si vendemmia prima e nascono rossi più freschi ed eleganti, accanto a versioni importanti affinate in legno.',
               ['vino-cerasuolo-di-vittoria', 'vino-eloro', 'vino-noto', 'vino-sicilia', 'vino-avola'], ['decanter', 'itinerari', 'docsicilia']),
            vv('frappato', 'Frappato', '', ['vittoria', 'comiso', 'chiaramonte-gulfi'],
               'Vitigno degli altopiani del sud-est, intorno a Vittoria. Dà vini di corpo medio, con pochi tannini, profumo di frutti rossi e gradazione moderata. Insieme al Nero d’Avola forma il Cerasuolo di Vittoria, l’unico vino DOCG della Sicilia: il Nero d’Avola porta la struttura, il Frappato il profumo.',
               ['vino-cerasuolo-di-vittoria', 'vino-vittoria', 'vino-sicilia'], ['decanter', 'itinerari']),
            vv('nerello-mascalese', 'Nerello Mascalese', '', ['castiglione-di-sicilia', 'randazzo', 'linguaglossa', 'milo'],
               'È il rosso dell’Etna. Cresce in alto sulle pendici del vulcano, spesso su vecchie viti ad alberello, anche centenarie. Dà vini di colore chiaro, profumati e minerali, sempre sostenuti da una bella acidità. È la base dell’Etna Rosso.',
               ['vino-etna', 'vino-faro', 'vino-sicilia'], ['decanter', 'itinerari']),
            vv('nerello-cappuccio', 'Nerello Cappuccio', '', ['castiglione-di-sicilia', 'randazzo'],
               'Compagno storico del Nerello Mascalese sull’Etna. Si aggiunge in piccola parte, di solito fino a un quinto, per dare più colore e più frutto al vino.',
               ['vino-etna', 'vino-faro', 'vino-sicilia'], ['decanter']),
            vv('perricone', 'Perricone', 'Pignatello', ['monreale', 'marsala', 'alcamo'],
               'Un tempo era il rosso più diffuso nella Sicilia occidentale ed entrava nel Marsala Rubino. Poi fu quasi dimenticato; oggi torna nei vigneti. Ha acidità alta e alcol moderato, con tannini decisi che i produttori stanno imparando a domare.',
               ['vino-marsala', 'vino-monreale', 'vino-contea-di-sclafani', 'vino-sicilia'], ['decanter', 'vitigni']),
            vv('nocera', 'Nocera', '', ['messina', 'milazzo'],
               'Antico vitigno del Messinese, oggi raro. Entra nei rossi della zona di Messina e di Milazzo insieme ai Nerelli, e la DOC Sicilia lo ammette anche da solo.',
               ['vino-faro', 'vino-mamertino-di-milazzo', 'vino-sicilia'], ['vitigni', 'docsicilia']),
        ]},
        {'n': 'Vitigni a bacca bianca', 'v': [
            vv('catarratto', 'Catarratto', 'Comune, Lucido, Extra lucido', ['alcamo', 'monreale', 'salemi'],
               'È il bianco più coltivato dell’isola: circa un terzo dei vigneti. Non è un solo vitigno ma una famiglia, con il Catarratto Comune e i più pregiati Lucido ed Extra lucido. Per decenni è finito nel vino sfuso; nelle vigne alte, come nella zona di Monreale, dà bianchi tesi e di carattere, che migliorano con il tempo.',
               ['vino-alcamo', 'vino-monreale', 'vino-sicilia'], ['decanter', 'vitigni']),
            vv('grillo', 'Grillo', '', ['marsala', 'trapani'],
               'Il bianco simbolo della zona di Marsala, nato da un incrocio tra Zibibbo e Catarratto. Per secoli ha fatto il Marsala; dagli anni Duemila le versioni secche lo hanno reso famoso, con profumi di erbe e fiori. Con il Nero d’Avola è il vitigno che più rappresenta la Sicilia del vino.',
               ['vino-marsala', 'vino-sicilia', 'vino-erice'], ['decanter', 'docsicilia']),
            vv('inzolia', 'Inzolia', 'Ansonica', ['marsala', 'menfi'],
               'Vitigno bianco antico, usato soprattutto nei tagli con Catarratto e Grillo, anche nel Marsala. Da solo dà bianchi morbidi e delicati.',
               ['vino-marsala', 'vino-menfi', 'vino-sicilia'], ['decanter', 'vitigni']),
            vv('carricante', 'Carricante', '', ['milo', 'castiglione-di-sicilia'],
               'Il bianco dell’Etna, coltivato soprattutto sul versante est, verso il mare. Dà vini tesi e sapidi; quelli delle singole contrade possono invecchiare a lungo. Forma almeno il 60% dell’Etna Bianco e l’80% dell’Etna Bianco Superiore, che si fa solo a Milo.',
               ['vino-etna', 'vino-sicilia'], ['decanter']),
            vv('zibibbo', 'Zibibbo', 'Moscato d’Alessandria', ['pantelleria'],
               'È il Moscato d’Alessandria, arrivato dal mare. A Pantelleria cresce ad alberello in conche scavate nella roccia vulcanica, per proteggerlo dal vento: questa pratica è patrimonio dell’umanità UNESCO. Le uve appassite al sole danno il Passito di Pantelleria; le versioni secche sono leggere e profumate di albicocca.',
               ['vino-pantelleria', 'vino-sicilia'], ['decanter']),
            vv('malvasia-di-lipari', 'Malvasia di Lipari', '', ['lipari', 'santa-marina-salina', 'malfa', 'leni'],
               'Cresce sui pendii vulcanici delle Eolie, soprattutto a Salina e Lipari. Pochi ettari ma grande fama: dà vini dolci più leggeri del passito di Pantelleria e, sempre più spesso, bianchi secchi sapidi e aromatici.',
               ['vino-malvasia-delle-lipari', 'vino-salina'], ['decanter']),
            vv('grecanico', 'Grecanico Dorato', '', ['menfi', 'sciacca'],
               'Bianco diffuso nella Sicilia occidentale, fresco e profumato. Gli studi sul DNA lo hanno avvicinato alla Garganega del Veneto.',
               ['vino-menfi', 'vino-sicilia'], ['vitigni', 'docsicilia']),
            vv('moscato-bianco', 'Moscato bianco', '', ['noto', 'siracusa'],
               'Il moscato della Sicilia orientale, da cui nascono i vini dolci di Noto e di Siracusa, tra i più antichi dell’isola.',
               ['vino-noto', 'vino-siracusa', 'vino-sicilia'], ['vitigni', 'docsicilia']),
            vv('albanello', 'Albanello', '', ['siracusa'],
               'Vitigno bianco raro del Siracusano, recuperato da pochi produttori. Una delle varietà da salvare.',
               [], ['vitigni'], {'lr': 'raro'}),
            vv('damaschino', 'Damaschino', '', ['trapani', 'marsala'],
               'Bianco della provincia di Trapani, oggi poco coltivato. La DOC Sicilia lo ammette anche in purezza.',
               ['vino-sicilia'], ['vitigni', 'docsicilia']),
        ]},
    ],
}

OLIO = {
    'n': 'Ulivo', 'sub': 'Le cultivar dell’olivo',
    'intro': [
        'In Sicilia l’olivo cresce dalla costa fino a circa mille metri e vive a lungo: nella Valle del Belice ci sono alberi di oltre cinquecento anni.',
        'Ogni zona ha le sue varietà, dette cultivar. Danno oli molto diversi tra loro: dolci e delicati, oppure amari e piccanti, con profumi di pomodoro, carciofo, mandorla o erba tagliata. Alcune danno anche olive da tavola.',
        'L’isola ha sei olii DOP e un’IGP Sicilia, che ammette solo cultivar autoctone.',
    ],
    'gruppi': [
        {'n': 'Sicilia occidentale', 'v': [
            vv('nocellara-del-belice', 'Nocellara del Belice', 'Nocellara di Castelvetrano, Aliva tunna', ['castelvetrano', 'partanna', 'campobello-di-mazara'],
               'La cultivar della Valle del Belice, coltivata qui da tempi lontani. Il frutto è grosso e tondo, con molta polpa: è sia oliva da tavola, l’unica DOP da mensa della Sicilia, sia oliva da olio. L’olio ha profumo intenso di erbe selvatiche e un amaro medio. Ha bisogno di altre varietà vicine per impollinarsi.',
               ['dop-valle-del-belice', 'dop-nocellara-del-belice', 'dop-valli-trapanesi'], ['oliodop', 'coi']),
            vv('biancolilla', 'Biancolilla', 'Bianculidda, Carbucia', ['caltabellotta', 'sciacca'],
               'Una delle cultivar più antiche e diffuse dell’isola, soprattutto a ovest. Il frutto cambia colore da verde intenso a verde chiaro e poi viola. Dà un olio dolce, dal fruttato leggero, con note di mandorla, carciofo e pomodoro. Si pianta spesso accanto alla Nocellara per impollinarla.',
               ['dop-val-di-mazara'], ['oliodop']),
            vv('cerasuola', 'Cerasuola', '', ['sciacca', 'partanna'],
               'Prende il nome dal frutto a forma di ciliegia. Albero molto vigoroso, diffuso tra le province di Palermo e Trapani e intorno a Sciacca. Ha rese alte e dà un olio intenso, amaro e piccante, che sa di erba tagliata e mandorla.',
               ['dop-valli-trapanesi', 'dop-val-di-mazara'], ['oliodop']),
        ]},
        {'n': 'Sicilia orientale e Iblei', 'v': [
            vv('tonda-iblea', 'Tonda Iblea', 'Nuciddara', ['chiaramonte-gulfi', 'ragusa', 'buccheri'],
               'La regina dei Monti Iblei. Nonostante il nome, il frutto è allungato. Dà uno degli oli monovarietali più pregiati d’Italia: armonico e intenso, con un profumo caratteristico di pomodoro verde. Si usa anche per le olive nere da tavola.',
               ['dop-monti-iblei'], ['oliodop']),
            vv('moresca', 'Moresca', '', ['ragusa', 'chiaramonte-gulfi'],
               'Cultivar delle province di Ragusa, Enna e Catania. Dà un olio leggero, poco amaro, con note di mandorla, e olive da tavola verdi e nere.',
               ['dop-monti-iblei'], ['oliodop']),
            vv('nocellara-etnea', 'Nocellara Etnea', '', ['paterno', 'adrano', 'biancavilla'],
               'La cultivar delle pendici dell’Etna. Il nocciolo si stacca facilmente, per questo è molto usata per le olive verdi da tavola. L’olio è fruttato, amaro e piccante, con note di cardo e carciofo.',
               ['dop-monte-etna'], ['oliodop']),
            vv('zaituna', 'Zaituna', 'Siracusana', ['solarino', 'canicattini-bagni', 'siracusa'],
               'Antica oliva del Golfo di Siracusa, oggi presidio Slow Food.',
               ['web-oliva-zaituna'], ['sfpresidi'], {'lr': 'raro'}),
        ]},
        {'n': 'Messinese, Nebrodi e Peloritani', 'v': [
            vv('ogliarola-messinese', 'Ogliarola messinese', 'Aliva d’ogghiu', ['messina', 'novara-di-sicilia'],
               'Cresce sulla costa messinese, sui Nebrodi e sui Peloritani, fino a circa 800 metri. Il nome dice tutto: è l’oliva da olio per eccellenza della zona. Dà un olio ricco di polifenoli, fruttato, con note di mandorla e carciofo. Le olive mature diventano anche "passuluni".',
               ['dop-valdemone'], ['oliodop']),
            vv('santagatese', 'Santagatese', '', ['sant-agata-di-militello'],
               'Cultivar della costa tirrenica nord-orientale, con il centro a Sant’Agata di Militello. Le foglie sono verdi sopra e grigie sotto; l’albero, alto e robusto, si usava anche come frangivento. L’olio sa di pomodoro e carciofo.',
               ['dop-valdemone'], ['oliodop']),
            vv('minuta', 'Minuta', '', ['ficarra'],
               'Piccola oliva dei Nebrodi, protetta da un presidio Slow Food a Ficarra.',
               ['web-oliva-minuta', 'dop-valdemone'], ['sfpresidi', 'oliodop'], {'lr': 'raro'}),
        ]},
    ],
}

GRANO = {
    'n': 'Grano', 'sub': 'I grani antichi siciliani',
    'intro': [
        'Per secoli la Sicilia è stata il granaio del Mediterraneo. Fino alla metà del Novecento nei campi crescevano decine di varietà locali, scelte dai contadini anno dopo anno. Poi le varietà moderne, più produttive, le hanno quasi cancellate.',
        'Oggi una collezione regionale conserva circa cinquanta varietà storiche di frumento siciliano. Diverse sono iscritte al registro nazionale delle varietà da conservazione: quattordici popolazioni di grano duro, tre di grano tenero e due varietà storiche. In Sicilia ci sono una sessantina di "agricoltori custodi" che ne mantengono puro il seme.',
        'Si dividono in due famiglie. I grani duri danno la semola per il pane e la pasta. I grani teneri, che in Sicilia si chiamano tutti "Maiorca", danno farine bianche per i dolci.',
    ],
    'gruppi': [
        {'n': 'Grani duri', 'v': [
            vv('timilia', 'Timilia', 'Tumminia, reste bianche e reste nere', ['castelvetrano', 'licata'],
               'Grano duro a ciclo breve: si seminava in primavera, a marzo, da cui il nome. Era diffuso nell’entroterra, lungo il fiume Salso. Dà una semola scura e saporita: è il grano del pane nero di Castelvetrano, e oggi anche di pasta artigianale e perfino di birre. Iscritto al registro delle varietà da conservazione nel 2014.',
               ['web-pane-nero-di-castelvetrano'], ['crea', 'emporio', 'regvar']),
            vv('russello', 'Russello', 'Priziusa', ['ragusa', 'modica'],
               'Il grano dell’altopiano ibleo, nella provincia di Ragusa, dalle spighe rossicce. Ha molte proteine e una semola fine e profumata, ma un glutine debole: dà paste dal sapore intenso ma che non sopportano la cottura lunga. È il grano del pane di casa degli Iblei.',
               ['pat-pane-di-casa-u-pani-i-casa'], ['crea', 'mdpi', 'emporio']),
            vv('perciasacchi', 'Perciasacchi', 'Strazzavisazzi, Farro lungo', ['corleone'],
               'Il nome significa "buca i sacchi": le cariossidi sono lunghe e appuntite. È tra i grani duri più antichi dell’isola, coltivato soprattutto nel Palermitano. La sua semola ha il glutine più tenace tra i grani antichi e dà paste compatte e pane. Iscritto nel 2014.',
               [], ['crea', 'mdpi', 'regvar']),
            vv('biancuccia', 'Biancuccia', '', [],
               'Grano duro dalla spiga chiara, iscritto al registro delle varietà da conservazione nel 2018.',
               [], ['crea', 'regvar']),
            vv('castiglione-glabro', 'Castiglione glabro', 'Castigghiuni', [],
               'Antica popolazione di grano duro, iscritta al registro nel 2018 insieme alla Biancuccia e al Bidì.',
               [], ['crea', 'regvar']),
            vv('bidi', 'Bidì', 'Margherito', ['caltagirone'],
               'Varietà arrivata dalla Tunisia e diventata tipica della Sicilia. Dal punto di vista biologico è molto vicina al Senatore Cappelli. Iscritta nel 2018.',
               [], ['crea', 'emporio', 'regvar']),
            vv('altri-duri', 'Altre popolazioni di grano duro', 'Ciciredda, Faricello (Regina), Gioia, Martinella, Paola, Scorsonera, Tripolino, Urrìa', [],
               'Sono le altre varietà locali di grano duro iscritte al registro delle varietà da conservazione. Molte sopravvivono in pochi campi.',
               [], ['crea'], {'lr': 'raro'}),
        ]},
        {'n': 'Grani teneri (la famiglia dei Maiorca)', 'v': [
            vv('maiorca', 'Maiorca', '', ['pollina'],
               'Il grano tenero storico della Sicilia: spiga bianca, maturazione rapida, adatto ai terreni poveri. Dà una farina bianchissima e povera di glutine, perfetta per i dolci, le ostie e il pane bianco. Si racconta che le prime scorze dei cannoli si facessero con questa farina. Iscritto nel 2014.',
               ['cannolo'], ['emporio', 'gambero', 'regvar']),
            vv('teneri-antichi', 'Maiorcone, Romano, Cuccitta, Maiorca di Pollina', '', ['pollina'],
               'Sono i grani teneri conservati nella Stazione di granicoltura dopo che, dal Settecento, i teneri avevano perso spazio a favore dei duri. Il Maiorcone e il Romano sono iscritti al registro delle varietà da conservazione.',
               [], ['gambero', 'crea'], {'lr': 'raro'}),
            vv('tiraditto-pilusedda', 'Tiraditto e Pilusedda', '', [],
               'Due grani gentili della famiglia dei Maiorca, riscoperti da poco dopo anni di oblio.',
               [], ['gambero'], {'lr': 'raro'}),
        ]},
    ],
}


def gruppo(n, testo, chiavi):
    for k in chiavi:
        assert k in V, k
    return {'n': n, 'testo': testo, 'voci': chiavi}


FORMAGGIO = {
    'n': 'Latte', 'sub': 'Latte, caci e ricotte di Sicilia',
    'intro': [
        'Il formaggio siciliano nasce dai pascoli: pecore e capre nell’entroterra e sulle montagne, vacche sugli altopiani iblei e sui Nebrodi. Molti si fanno ancora con latte crudo e attrezzi di legno, nelle masserie.',
        'Cinque formaggi sono DOP, decine sono prodotti tradizionali riconosciuti e diversi sono presìdi Slow Food. Qui li trovi divisi per famiglia, con le parole per capirli.',
    ],
    'gruppi': [
        gruppo('I cinque formaggi DOP',
               'Sono protetti da un disciplinare che fissa zona, razze, latte e lavorazione. Il Pecorino siciliano è considerato il formaggio più antico d’Europa; il Ragusano, il Piacentinu, la Vastedda e la Provola sono legati a un territorio preciso.',
               ['pecorino', 'dop-ragusano', 'dop-piacentinu-ennese', 'dop-vastedda-della-valle-del-belice', 'dop-provola-dei-nebrodi']),
        gruppo('I caci di pecora',
               'Il pecorino cambia nome con l’età. "Tuma" è la cagliata fresca, non ancora salata. "Primosale" è il cacio dopo la prima salatura, morbido e dolce. Poi vengono il "secondo sale" e lo stagionato, duro e piccante. Alcuni si arricchiscono con pepe nero o zafferano.',
               ['pat-picurinu-tuma-primosale-secondo-sale-stagionat', 'pat-pecorino-rosso', 'web-pecorino-pepato', 'pat-maiorchino', 'pat-formaggio-di-santo-stefano-di-quisquina', 'pat-ericino', 'pat-belicino']),
        gruppo('Le paste filate di vacca',
               'La cagliata si fila nell’acqua bollente e si modella a mano: a parallelepipedo, a pera, a cofanetto. Il caciocavallo prende il nome dall’uso di appenderlo a coppie, "a cavallo" di una trave, per stagionare.',
               ['pat-caciocavallo-palermitano', 'pat-cosacavaddu-ibleo-caciocavallo-ragusano', 'pat-provola-delle-madonie', 'pat-provola-dei-monti-sicani-o-caciotta', 'pat-cofanetto-o-caciocavallo-cofanaro', 'pat-vastedda-palermitana', 'pat-tumazzo-di-vacca']),
        gruppo('Capra e razze antiche',
               'Le capre girgentane, con le corna a spirale, e le vacche modicane e cinisare sono razze siciliane salvate dai presìdi. Il loro latte dà formaggi piccoli e rari.',
               ['pat-formaggio-di-capra-siciliano', 'pat-formaggio-di-capra-padduni', 'sf-capra-girgentana', 'sf-razza-modicana', 'web-caciocavallo-di-vacca-cinisara']),
        gruppo('Le ricotte',
               'La ricotta nasce dal siero che resta dopo il formaggio, scaldato di nuovo: per questo si chiama "ri-cotta". Si mangia fresca o si sala, si affumica, si inforna. È l’anima dei cannoli e della cassata.',
               ['ricotta', 'pat-ricotta-iblea', 'pat-ricotta-mista', 'pat-ricotta-infornata', 'pat-ricotta-salata', 'pat-ricotta-di-vacca']),
    ],
    'fonti': ['pat', 'ragusano', 'pecorino', 'sfpresidi'],
}

PANE = {
    'n': 'Il pane', 'sub': 'Pani di semola, di festa e di casa',
    'intro': [
        'Il pane siciliano è giallo, perché si fa con la semola di grano duro macinata due volte, la "semola rimacinata". Tradizionalmente lievita con il lievito madre, il "criscenti", e si cuoce nel forno a legna.',
        'Ogni paese ha le sue forme e le sue ricorrenze: il pane di ogni giorno, i pani votivi di San Giuseppe intrecciati come merletti, le focacce ripiene e i pani conditi.',
    ],
    'gruppi': [
        gruppo('I pani di semola',
               'Il pane quotidiano, fatto con semola di grano duro, lievito madre e lunga lievitazione. La Pagnotta del Dittaino è l’unico pane DOP della Sicilia.',
               ['dop-pagnotta-del-dittaino', 'pat-pane-di-casa-u-pani-i-casa', 'pat-pane-di-monreale-u-pani-ri-murriali', 'pat-pane-a-lievitazione-naturale-pani-cu-crescenti', 'web-pane-tradizionale-di-lentini', 'pat-pani-cuttu-o-pane-cotto']),
        gruppo('I pani dei grani antichi',
               'Con le farine di Timilia, Russello e degli altri grani antichi tornano pani scuri e profumati, come il pane nero di Castelvetrano.',
               ['web-pane-nero-di-castelvetrano', 'sf-grani-gentili-di-sicilia']),
        gruppo('Pani di festa e votivi',
               'Per San Giuseppe e per le feste dei santi si modellano pani decorati con forme di fiori, attrezzi e simboli religiosi. Si portano in processione, si offrono sugli altari e si regalano.',
               ['pat-pane-di-san-giuseppe', 'web-cuddiruna-salati', 'pat-taralli-di-racalmuto']),
        gruppo('Focacce, scacciate e pani conditi',
               'La pasta di pane si stende e si riempie di quello che c’è: formaggio, salsiccia, verdure, acciughe, cipolla. Ogni zona ha la sua versione.',
               ['pat-scacciata', 'pat-focaccia-messinese', 'pat-nfigghiulata', 'pat-vastedda-cu-sammucu-o-vastedda-nfigghiulata', 'pat-vastedda-fritta', 'web-pane-cunzatu', 'pat-funciddi-di-buccheri', 'pat-focaccia-al-sambuco']),
    ],
    'fonti': ['pat'],
}

OUT = {'agg': '2026-11-28', 'fonti': F, 'filiere': {'vino': VINO, 'olio': OLIO, 'grano': GRANO, 'formaggio': FORMAGGIO, 'pane': PANE}}
(R / 'www/data/filiere.json').write_text(json.dumps(OUT, ensure_ascii=False, separators=(',', ':')))
n = sum(len(g.get('v', g.get('voci', []))) for f in OUT['filiere'].values() for g in f['gruppi'])
print('filiere scritte, elementi:', n)
