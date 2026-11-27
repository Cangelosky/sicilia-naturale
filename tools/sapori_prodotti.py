#!/usr/bin/env python3
"""Aggiunge a www/data/sapori.json i prodotti tradizionali (PAT) e i DOP/IGP della Sicilia, con comuni e province.
Uso: python3 tools/sapori_prodotti.py comuni_geo.json   (elenco dei comuni italiani con coordinate)"""
import json, re, sys, unicodedata, pathlib
def norm(s): return re.sub(r"[^a-z0-9 ]", " ", unicodedata.normalize('NFD', s.replace('’', ' ').replace("'", ' ')).encode('ascii', 'ignore').decode().lower()).strip()
def slug(s): return re.sub(r' +', '-', norm(s))[:46]
PROV = {'81': 'TP', '82': 'PA', '83': 'ME', '84': 'AG', '85': 'CL', '86': 'EN', '87': 'CT', '88': 'RG', '89': 'SR'}
TUTTE = list(PROV.values())
geo = [x for x in json.load(open(sys.argv[1])) if len(x['istat']) == 5 and x['istat'][:2] in PROV]
com = {norm(x['comune']): (x['comune'], [round(float(x['lng']), 4), round(float(x['lat']), 4)], PROV[x['istat'][:2]]) for x in geo}
com[norm('Calatafimi Segesta')] = com.get(norm('Calatafimi-Segesta'), com.get(norm('Calatafimi Segesta')))
D = json.load(open('www/data/sapori.json'))
perNome = {norm(p['n']): k for k, p in D['paesi'].items()}
for k, p in D['paesi'].items():
    c = com.get(norm(p['n']))
    if c: p['pv'] = c[2]
def paese(nome):
    c = com.get(norm(nome))
    if not c: return None
    k = perNome.get(norm(c[0])) or slug(c[0])
    if k not in D['paesi']: D['paesi'][k] = {'n': c[0], 'c': c[1], 'pv': c[2]}; perNome[norm(c[0])] = k
    return k
non_trovati = set()
def zona(z):
    paesi, prov = [], []
    for t in [x.strip() for x in z.split(',') if x.strip()]:
        if t == 'Tutte': prov = TUTTE[:]
        elif t in TUTTE: prov.append(t)
        else:
            k = paese(t)
            if k: paesi.append(k)
            else: non_trovati.add(t)
    return paesi, prov
CAT = [('gastronomia', r'arancin|parmigiana|caponata|crocch|maccu|panelle|beccaficu|cardi in pastella|padducculi|badduzzi|zuzzu|caciu all|pasta con le sarde|pasta che vruoccoli|pasta ca muddica|coddra chi sardi|mmugliulati|pani frittu|pani co pipi|vaccareddi|cuscus|busiati'),
       ('bevande', r'liquor|acquavite|vinu cotto|amarena'), ('miele', r'miele'), ('pesce', r'tonno|alice|sardin|gambero|menola|bottarga|lattime|pesce|sarde'),
       ('dolci', r'dolc|biscott|cassat|cannol|cucciddat|vucciddat|buccellat|torrone|turruni|giuggiolen|nfasciat|mostarda|cotognata|marmellata|pupo di zucchero|pignolat|pignoccat|piparell|amarett|mandorlato|nucatul|cuccia|biancomangiare|granita|gelo di|martorana|ossa di morto|minna|testa di turco|sfoglio|sfinci|cucuzzata|pasta reale|pasta di mandorle|pasta di nocciola|crispell|crespelle|fasciatell|cuffitell|cuddur|cuddrir|mastazzol|mustazzol|guammell|gadduzzi|braccialett|bocconett|frascatula|savoiard|duci|papared|colombe|ciascuna|facciuni|iris|scursunera|ciambella|pupi cull|cosi di ficu|cannillieri|petrafennula|salame turco'),
       ('formaggi', r'ricotta|formagg|caciocav|cosacavadd|provola|pecorino|picurinu|tumazzo|maiorchino|canestrato|caciotta|belicino|piddiato|vastedda palerm|ericino|ainuzzi|caci figurati|mozzarella|cofanetto|tuma'),
       ('salumi', r'salsicc|salame|carne|gelatina|stigghiola|sausizz'),
       ('pane e pasta', r'pane|pani |pagnotta|focaccia|vastedda|sfincione|scacciata|nfigghiulat|nfrigghiulat|pizzarruna|taralli|panzerott|pasta|maccaruna|cavate|malateddi|maccu di grano|funciddi'),
       ('conserve e condimenti', r'sale |astrattu|elioconcentrato|olio|capperi|pomodoro secco|rosmarino|origano|alloro'),
       ('frutta e ortaggi', r'')]
def categoria(n, gast):
    nn = norm(n)
    for c, r in CAT:
        if re.search(r, nn): return c
    return 'gastronomia' if gast else 'frutta e ortaggi'
esist = {norm(v['n']): k for k, v in D['voci'].items()}
f = pathlib.Path(__file__).parent / 'fonti'
n_pat = 0
for riga in (f / 'pat_sicilia.txt').read_text().splitlines():
    if not riga.strip() or riga.startswith('#'): continue
    nome, tipo, z = (riga.split('|') + ['', ''])[:3]
    c = categoria(nome, tipo == 'GAST'); paesi, prov = zona(z)
    t = 'dolce' if c == 'dolci' else 'piatto' if c == 'gastronomia' else 'prodotto'
    k = esist.get(norm(nome))
    if k:
        v = D['voci'][k]; v.setdefault('ric', []); 'PAT' in v['ric'] or v['ric'].append('PAT')
        v['paesi'] = sorted(set((v.get('paesi') or []) + paesi)) or v.get('paesi'); v['prov'] = prov or v.get('prov'); v['cat'] = v.get('cat') or c
        continue
    k = 'pat-' + slug(nome)
    D['voci'][k] = {'t': t, 'n': nome, 'cat': c, 'ric': ['PAT'], 'paesi': paesi or None, 'prov': prov or None, 'breve': '', 'storia': '', 'pat': True}
    n_pat += 1
n_dop = 0
SETT = {'olio': ('conserve e condimenti', "Olio extravergine d'oliva"), 'ortofrutta': ('frutta e ortaggi', ''), 'dolci': ('dolci', ''), 'altri': ('conserve e condimenti', ''), 'salumi': ('salumi', ''), 'pane': ('pane e pasta', ''), 'formaggi': ('formaggi', '')}
for riga in (f / 'dop_igp_sicilia.txt').read_text().splitlines():
    if not riga.strip() or riga.startswith('#'): continue
    nome, sig, sett, z = riga.split('|')
    c, pre = SETT[sett]; full = (pre + ' ' + nome + ' ' + sig) if pre else nome
    paesi, prov = zona(z)
    k = esist.get(norm(nome))
    if k:
        v = D['voci'][k]; v['ric'] = [sig] + [r for r in v.get('ric', []) if r not in ('DOP', 'IGP')]; v['paesi'] = sorted(set((v.get('paesi') or []) + paesi)); v['prov'] = prov or v.get('prov'); v['cat'] = c
        continue
    D['voci']['dop-' + slug(nome)] = {'t': 'prodotto', 'n': (pre + ' ' + nome) if pre else nome, 'cat': c, 'ric': [sig], 'paesi': paesi or None, 'prov': prov or None, 'breve': '', 'storia': '', 'zind': True}
    n_dop += 1
for v in D['voci'].values():
    for x in ('paesi', 'prov'):
        if x in v and not v[x]: del v[x]
    if v['t'] == 'dolce' and 'cat' not in v: v['cat'] = 'dolci'
# province ufficiali dei DOP/IGP (IRVO, giugno 2025)
PROVDOP = {'Arancia di Ribera': 'AG PA', "Cappero delle Isole Eolie": 'ME', "Ciliegia dell'Etna": 'CT', "Ficodindia dell'Etna": 'CT', 'Ficodindia di San Cono': 'CT EN CL', 'Nocellara del Belice': 'TP', 'Pistacchio di Raffadali': 'AG', 'Pistacchio Verde di Bronte': 'CT',
  'Arancia Rossa di Sicilia': 'CT SR EN', 'Cappero di Pantelleria': 'TP', 'Carota Novella di Ispica': 'RG SR CT CL', "Limone dell'Etna": 'CT', 'Limone di Siracusa': 'SR', 'Limone Interdonato Messina': 'ME', 'Pesca di Bivona': 'AG PA', 'Pesca di Leonforte': 'EN', 'Pesca di Delia': 'CL AG',
  'Pomodoro di Pachino': 'RG SR', 'Uva da tavola di Canicattì': 'AG CT', 'Uva da tavola di Mazzarrone': 'CT RG', 'Monte Etna': 'CT EN ME', 'Monti Iblei': 'SR RG CT', 'Val di Mazara': 'PA AG', 'Valdemone': 'ME', 'Valle del Belìce': 'TP', 'Valli Trapanesi': 'TP',
  'Piacentinu Ennese': 'EN', 'Provola dei Nebrodi': 'CT EN ME', 'Ragusano': 'RG SR', 'Vastedda della Valle del Belìce': 'AG TP PA', 'Pagnotta del Dittaino': 'EN CT', 'Cioccolato di Modica': 'RG', "Salame Sant'Angelo": 'ME', 'Sale Marino di Trapani': 'TP'}
for nome, pv in PROVDOP.items():
    for v in D['voci'].values():
        if v.get('ric') and any(r in ('DOP', 'IGP') for r in v['ric']) and norm(v['n']).endswith(norm(nome)): v['prov'] = pv.split()
n_vini = 0
for riga in (f / 'vini_sicilia.txt').read_text().splitlines():
    if not riga.strip() or riga.startswith('#'): continue
    nome, sig, pv = riga.split('|')
    D['voci']['vino-' + slug(nome)] = {'t': 'prodotto', 'n': nome + ' ' + sig, 'cat': 'vini', 'ric': [sig], 'prov': [x.strip() for x in pv.split(',')], 'breve': '', 'storia': '', 'vino': True}
    n_vini += 1
D['fonti']['vini'] = {'a': 'IRVO, Istituto Regionale del Vino e dell\'Olio', 't': 'Prodotti tipici siciliani (giugno 2025)'}
D['fonti']['pat'] = {'a': 'Ministero dell\'agricoltura, Regione Siciliana', 't': 'Elenco nazionale dei prodotti agroalimentari tradizionali (via lasiciliainrete.it)'}
D['fonti']['dopigp'] = {'a': 'Regione Siciliana', 't': 'Elenco dei prodotti agricoli e alimentari nei regimi di qualità (2026)'}
json.dump(D, open('www/data/sapori.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(n_vini, 'vini;', n_pat, 'PAT nuovi;', n_dop, 'DOP/IGP nuovi;', len(D['paesi']), 'paesi;', len(D['voci']), 'voci. Comuni non trovati:', sorted(non_trovati))
