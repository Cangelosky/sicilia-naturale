"""Prepara i livelli forestali della Regione Siciliana (SIF, Corpo Forestale) -> www/data.
Fonte: sifweb.regione.sicilia.it, ArcGIS REST, servizio SIF_CART_TEMATICA (livelli 8 Boschi Vetusti 2026,
10 Alberi monumentali, 15 Aree di raccolta - boschi da seme, 38 Carta forestale: categorie forestali)
e servizio Parchi_Riserve (livello 2 Parco Sicani). Scaricati da Chrome in data/raw/sif_dati_sicilia_naturale.json.
Uso: python3 tools/costruisci_sif.py  (dopo tools/costruisci_dati.py, perché collega le zone già pronte)."""
import json, collections, re
from shapely.geometry import shape, mapping, Point
from shapely.ops import unary_union
from shapely import set_precision

R, OUT = 'data/raw/', 'www/data/'
d = json.load(open(R + 'sif_dati_sicilia_naturale.json'))
schede = json.load(open(OUT + 'schede.json'))
zone = json.load(open(OUT + 'zone.json'))

def geo(g):
    s = shape(g)
    return s if s.is_valid else s.buffer(0)

def r5(c):
    if isinstance(c, (list, tuple)) and c and isinstance(c[0], (int, float)): return [round(c[0], 5), round(c[1], 5)]
    return [r5(x) for x in c]

def pulisci(s):
    s = (s or '').replace('\xa0', ' ').replace('•', 'ò').strip()
    return re.sub(r'\s+', ' ', s)

geom_z = {f['properties']['id']: geo(f['geometry']) for f in zone['features']}

def dentro(g):
    """Zone (parchi, riserve, Natura 2000) che contengono o toccano in modo significativo la geometria."""
    out = []
    for k, gz in geom_z.items():
        if gz.intersects(g) and gz.intersection(g).area >= 0.3 * g.area: out.append(k)
    return out

# ---- Parco dei Monti Sicani (assente in EEA): aggiunto come parco regionale
sic = unary_union([geo(f['geometry']) for f in d['parco_sicani']['features']])
sic = sic.simplify(0.0002, preserve_topology=True)
ha_sic = round(sum(f['properties']['Ha'] for f in d['parco_sicani']['features']))
k = 'SIF_SICANI'
schede[k] = {'n': 'Parco dei Monti Sicani', 't': 'pr', 'ha': ha_sic, 'cod': k, 'anno': None, 'iucn': None, 'mare': 0, 'fonte': 'sif'}
geom_z[k] = sic
links = [c for c, g in geom_z.items() if c.startswith('ITA') and g.intersects(sic) and g.intersection(sic).area >= 0.3 * min(g.area, sic.area)]
schede[k]['n2k'] = links
for b in links: schede[b].setdefault('aree', []).append(k)
bb = collections.Counter()
for b in links:
    if schede[b]['t'] == 'zps': continue
    for x in schede[b]['h']:
        if x['c'] in json.load(open(OUT + 'habitat.json'))['boschi']: bb[x['c']] += x['ha']
schede[k]['b'] = [[c, round(v)] for c, v in bb.most_common()]
schede[k]['bha'] = round(sum(bb.values()))
schede[k]['bb'] = [round(v, 4) for v in sic.bounds]
zone['features'].append({'type': 'Feature', 'id': len(zone['features']), 'properties': {'id': k, 't': 'pr', 'bha': schede[k]['bha']},
                         'geometry': {'type': mapping(sic)['type'], 'coordinates': r5(mapping(sic)['coordinates'])}})

# ---- Boschi vetusti 2026
vet = []
for i, f in enumerate(d['vetusti']['features']):
    p = f['properties']; g = geo(f['geometry'])
    c = g.representative_point()
    vet.append({'type': 'Feature', 'id': i, 'properties': {'id': 'BV%02d' % i}, 'geometry': {'type': mapping(g)['type'], 'coordinates': r5(mapping(g)['coordinates'])}})
    schede['BV%02d' % i] = {'n': pulisci(p['DENOM_NEW']), 't': 'bv', 'ha': round(p['ha_1'], 1), 'cod': 'BV%02d' % i,
                           'tf': pulisci(p['Tip_For']), 'bio': pulisci(p['Bioclima']), 'area': pulisci(p['Sist_area']), 'topo': pulisci(p['Topon_IGM']),
                           'in': dentro(g), 'bb': [round(v, 4) for v in g.bounds], 'b': [], 'bha': 0, 'fonte': 'sif'}

# ---- Boschi da seme (aree di raccolta)
sem = []
for i, f in enumerate(d['boschi_da_seme']['features']):
    p = f['properties']; g = geo(f['geometry']).simplify(0.00005, preserve_topology=True)
    k = 'BS%03d' % i
    ha = p['SUPERF_HA'].strip() if isinstance(p['SUPERF_HA'], str) else p['SUPERF_HA']
    try: ha = float(str(ha).replace(',', '.'))
    except ValueError: ha = round(p['Shape.STArea()'] / 10000, 1)
    sem.append({'type': 'Feature', 'id': i, 'properties': {'id': k}, 'geometry': {'type': mapping(g)['type'], 'coordinates': r5(mapping(g)['coordinates'])}})
    schede[k] = {'n': pulisci(p['BOSCO']), 't': 'bs', 'ha': round(ha, 1), 'cod': k, 'sp': pulisci(p['SPEC_PREL']), 'sub': pulisci(p['SUBSTR_GEO']),
                 'veg': pulisci(p['TIPOL_VEG']), 'com': pulisci(p['COM_PROV']), 'dec': pulisci(p['DECRETO']),
                 'in': dentro(g), 'bb': [round(v, 4) for v in g.bounds], 'b': [], 'bha': 0, 'fonte': 'sif'}

# ---- Alberi monumentali (punti): Elenco degli Alberi Monumentali di Sicilia, aggiornato al 17/07/2026
# (estratto dal PDF ufficiale con tools/estrai_alberi_elenco.py). Ha la specie, che il livello SIF non riporta.
alb = []
for i, a in enumerate(json.load(open(R + 'alberi_elenco.json'))):
    if a['urbano']: continue   # contesto urbano: escluso dal progetto (come i parchi urbani)
    x, y = a['lon'], a['lat']
    k = 'AM%03d' % a['n']
    alb.append({'type': 'Feature', 'id': i, 'properties': {'id': k}, 'geometry': {'type': 'Point', 'coordinates': [round(x, 5), round(y, 5)]}})
    schede[k] = {'n': pulisci(a['localita']) or pulisci(a['comune']), 't': 'am', 'ha': 0, 'cod': k, 'com': pulisci(a['comune']), 'prov': pulisci(a['prov']),
                 'sp': pulisci(a['specie']), 'vg': pulisci(a['volgare']), 'alt': a['alt'], 'circ': a['circ'], 'h': a['h'],
                 'crit': [pulisci(c) for c in a['criteri']], 'prov_dm': pulisci(a['provv']), 'scheda': a['scheda'],
                 'in': dentro(Point(x, y)), 'bb': [round(x, 4), round(y, 4), round(x, 4), round(y, 4)], 'b': [], 'bha': 0, 'fonte': 'elenco'}

# ---- Carta forestale: nomi delle categorie (le geometrie vanno in tile, vedi tools/tiles_carta_forestale.py)
# Descrizione SIF: "FA - Faggete- Faggeta mesofila...- st. ...- var. ...". Un codice può avere più varianti:
# per il codice si tiene il tipo (seconda parte) e si elencano le varianti.
macro, tipi = {}, collections.defaultdict(collections.Counter)
for x in d['categorie_lookup']:
    c, D = x['CODCAMPO'], x['DESCRIPTION']
    if not c or not D or ' - ' not in D: continue
    resto = D.split(' - ', 1)[1]
    grezze, parti = [pulisci(s) for s in resto.split('- ') if pulisci(s)], []
    for s in grezze:  # ricuce le parentesi spezzate, es. "(in particolare E. globulus- E. camaldulensis)"
        if parti and parti[-1].count('(') > parti[-1].count(')'): parti[-1] += ', ' + s
        else: parti.append(s)
    macro[c[:2]] = parti[0]
    tipo = parti[1] if len(parti) > 1 else parti[0]
    resto = [q for q in parti[2:] if q != 'st. ' + tipo]   # il sottotipo uguale al tipo non aggiunge nulla
    tipi[c][(tipo, ' – '.join(resto))] += x['n']
# per ogni codice: [nome del tipo (il più frequente), sottotipi/varianti presenti]
nomi_cf = {}
for c, v in tipi.items():
    tipo = v.most_common(1)[0][0][0]
    nomi_cf[c] = [tipo, [r for (tp, r), _ in v.most_common() if r and tp == tipo]]
cf = []

json.dump(zone, open(OUT + 'zone.json', 'w'), separators=(',', ':'))
json.dump(schede, open(OUT + 'schede.json', 'w'), ensure_ascii=False, separators=(',', ':'))
for n, fs in [('vetusti', vet), ('seme', sem), ('alberi', alb)]:
    json.dump({'type': 'FeatureCollection', 'features': fs}, open(OUT + n + '.json', 'w'), separators=(',', ':'))
json.dump({'tipi': nomi_cf, 'macro': macro}, open(OUT + 'carta_forestale_nomi.json', 'w'), ensure_ascii=False, separators=(',', ':'))
import os
for f in sorted(os.listdir(OUT)): print(f, round(os.path.getsize(OUT + f) / 1e6, 2), 'MB')
