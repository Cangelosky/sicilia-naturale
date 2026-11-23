"""Zone interne di parchi e riserve (SIF Regione Siciliana, servizio Parchi_Riserve, scaricato da Chrome in
data/raw/sif_zone_parchi_riserve.json) -> www/data/zone_int.json, legate alle schede (chiave S) per nome.
Parchi: zone A riserva integrale, B riserva generale, C protezione, D controllo (L.R. 98/1981 art. 8).
Riserve: zona A riserva, zona B preriserva (anche B1, B2)."""
import json, re, unicodedata
from shapely.geometry import shape, mapping
from shapely.ops import unary_union, transform
import pyproj
d = json.load(open('data/raw/sif_zone_parchi_riserve.json'))
S = json.load(open('www/data/schede.json'))
to_m = pyproj.Transformer.from_crs(4326, 32633, always_xy=True).transform
norm = lambda x: re.sub(r'[^a-z0-9 ]', ' ', unicodedata.normalize('NFKD', x.lower()).encode('ascii', 'ignore').decode())
VUOTE = set('riserva naturale orientata integrale speciale regionale biologica geologica parco delle della dello degli dei del di e la il lo le i gli fiume foce isola isole grotta bosco monte'.split())
parole = lambda x: set(w for w in norm(x).split() if len(w) > 2 and w not in VUOTE)
cand = {k: v for k, v in S.items() if v['t'] in ('pr', 'pn', 'rn')}
def trova(nome, tipi):
    p = parole(nome); best, sc = None, 0
    for k, v in cand.items():
        if v['t'] not in tipi: continue
        q = parole(v['n']); 
        if not p or not q: continue
        s = len(p & q) / len(p)
        if s > sc: best, sc = k, s
    return best if sc >= 0.6 else None
gruppi = {}
def sicura(g):
    try:
        if not g: return None
        if g['type'] == 'Polygon': g = {'type': 'Polygon', 'coordinates': [[c[:2] for c in r if c and None not in c[:2]] for r in g['coordinates']]}
        elif g['type'] == 'MultiPolygon': g = {'type': 'MultiPolygon', 'coordinates': [[[c[:2] for c in r if c and None not in c[:2]] for r in p] for p in g['coordinates']]}
        return shape(g).buffer(0)
    except Exception as e: print('geometria scartata', e); return None
def add(k, z, geom):
    if geom is not None and not geom.is_empty: gruppi.setdefault((k, z), []).append(geom)
PARCHI = {"Parco dei Nebrodi": 'EUAP0226', "Parco dell'Etna": 'EUAP0227', "Parco delle Madonie": 'EUAP0228', "Valle dell'Alcantara": 'EUAP0859'}
for f in d['parchi']['features']:
    add(PARCHI[f['properties']['DENOM']], f['properties']['ZONA'], sicura(f['geometry']))
for f in d['sicani']['features']:
    add('SIF_SICANI', f['properties']['Zona'], sicura(f['geometry']))
mancano = set()
# abbinamenti a mano (nomi diversi tra SIF e schede EEA)
MANO = {'Maccalube di Aragona': 'EUAP1124', 'Timpa di Acireale': 'EUAP1111', 'Monte San Calogero': 'CALOGERO'}
for f in d['riserve']['features']:
    pr = f['properties']; z = (pr['ZONA'] or '').strip().upper()
    if z not in ('A', 'B', 'B1', 'B2', 'B3', 'C'): continue
    k = MANO.get(pr['NOME_AREA']) or trova(pr['NOME_AREA'], ('rn',))
    if k == 'CALOGERO': g0 = sicura(f['geometry']); k = 'EUAP1104' if g0 is not None and g0.centroid.x < 13.4 else 'EUAP1144'
    if not k: mancano.add(pr['NOME_AREA']); continue
    add(k, z, sicura(f['geometry']))
out = []
for (k, z), gg in sorted(gruppi.items()):
    g = unary_union([x.buffer(0) for x in gg]).simplify(0.00005, preserve_topology=True)
    ha = round(transform(to_m, g).area / 1e4)
    if ha < 1: continue
    gj = json.loads(json.dumps(mapping(g)), parse_float=lambda x: round(float(x), 5))
    out.append({'type': 'Feature', 'properties': {'k': k, 'z': z, 'ha': ha}, 'geometry': gj})
json.dump({'type': 'FeatureCollection', 'fonte': d['fonte'], 'features': out}, open('www/data/zone_int.json', 'w'), separators=(',', ':'))
print(len(out), 'zone;', len({f['properties']['k'] for f in out}), 'aree; riserve non abbinate:', sorted(mancano))
for f in out:
    if not f['properties']['k'].startswith('EUAP1') and f['properties']['k'][4:5] != '1': pass
tot = {}
for f in out: tot.setdefault(f['properties']['k'], []).append((f['properties']['z'], f['properties']['ha']))
for k in ['EUAP0227', 'EUAP0228', 'EUAP0226', 'EUAP0859', 'SIF_SICANI']: print(S[k]['n'], tot.get(k))
