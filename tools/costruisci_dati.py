"""Prepara i dati dell'atlante dai file scaricati da EEA (data/raw) -> www/data.
Fonti: EEA Natura 2000 (siti, habitat, specie) e EEA NatDA v24 (aree protette nazionali/regionali)."""
import json, collections, os
from ftfy import fix_text
from shapely.geometry import shape, mapping
from shapely.ops import unary_union

R = 'data/raw/'
OUT = 'www/data/'
os.makedirs(OUT, exist_ok=True)

# Habitat forestali: nome italiano (Manuale italiano di interpretazione degli habitat) e nome breve
BOSCHI = {
 '9180': ('Tiglio-acereti di forra', 'Foreste di versanti, ghiaioni e valloni del Tilio-Acerion'),
 '91AA': ('Querceti di roverella', 'Boschi orientali di quercia bianca'),
 '91B0': ('Frassineti', 'Frassineti termofili a Fraxinus angustifolia'),
 '91E0': ('Ontanete', 'Foreste alluvionali di Alnus glutinosa e Fraxinus excelsior'),
 '91M0': ('Cerrete', 'Foreste Pannonico-Balcaniche di cerro e rovere'),
 '9210': ('Faggete', 'Faggeti degli Appennini con Taxus e Ilex'),
 '9220': ('Faggete con abete', 'Faggeti degli Appennini con Abies alba e faggeti con Abies nebrodensis'),
 '9260': ('Castagneti', 'Boschi di Castanea sativa'),
 '92A0': ('Saliceti e pioppeti', 'Foreste a galleria di Salix alba e Populus alba'),
 '92C0': ('Platanete', 'Foreste di Platanus orientalis e Liquidambar orientalis'),
 '92D0': ('Boschi ripariali', 'Gallerie e forteti ripari meridionali (Nerio-Tamaricetea e Securinegion tinctoriae)'),
 '9320': ('Boschi di olivastro e carrubo', 'Foreste di Olea e Ceratonia'),
 '9330': ('Sugherete', 'Foreste di Quercus suber'),
 '9340': ('Leccete', 'Foreste di Quercus ilex e Quercus rotundifolia'),
 '9380': ('Agrifoglieti', 'Foreste di Ilex aquifolium'),
 '9530': ('Pinete di pino nero', 'Pinete (sub)mediterranee di pini neri endemici'),
 '9540': ('Pinete mediterranee', 'Pinete mediterranee di pini mesogeni endemici'),
 '9580': ('Tasseti', 'Foreste mediterranee di Taxus baccata'),
}
TIPO_NATDA = {'IT01': 'pn', 'IT04': 'pr', 'IT05': 'rn', 'IT90': 'amp', 'IT30': 'ap'}
TIPO_N2K = {'A': 'zps', 'B': 'zsc', 'C': 'zsczps'}
ESCLUSI = {'Parco Urbano di Cosentini'}  # contesto urbano: escluso dal progetto

def geo(g):
    s = shape(g)
    if not s.is_valid: s = s.buffer(0)
    return s

def r5(c):
    if isinstance(c, (list, tuple)) and c and isinstance(c[0], (int, float)): return [round(c[0], 5), round(c[1], 5)]
    return [r5(x) for x in c]

# ---- habitat e specie per sito Natura 2000
tipi = {x['HABITATCODE']: x for x in json.load(open(R + 'habitat_tipi.json'))}
hab = collections.defaultdict(list)
for x in json.load(open(R + 'habitat_siti.json')):
    if x['NON_PRESENCE_IN_SITE']: continue
    c = x['HABITATCODE']
    hab[x['SITECODE']].append({'c': c, 'ha': round(x['COVER_HA'] or 0, 1), 'p': 1 if tipi.get(c, {}).get('PRIORITY') == '*' else 0})
nomi_hab = {c: v['DESCRIPTIONEN'] for c, v in tipi.items()}

spnomi, spidx, spgr = [], {}, []
sp = collections.defaultdict(set)
for x in json.load(open(R + 'specie_siti.json')):
    if x['CONTAINSSPECIES_NONPRESENCEINSITE'] or x['CONTAINSSPECIES_SENSITIVE'] == 1: continue
    n = (x['SpeciesNameClean'] or '').strip(); g = x['CONTAINSSPECIES_SPTYPE'] or ''
    if not n or not g: continue
    if n not in spidx: spidx[n] = len(spnomi); spnomi.append(n); spgr.append(g)
    sp[x['SiteCode']].add(spidx[n])

# ---- zone
feats, schede = [], {}
n2k = json.load(open(R + 'n2000.geojson'))['features']
geom = {}
for f in n2k:
    p = f['properties']; c = p['SITECODE']
    g = geo(f['geometry']); geom[c] = g
    h = sorted(hab.get(c, []), key=lambda a: -a['ha'])
    schede[c] = {'n': fix_text(p['SITENAME']), 't': TIPO_N2K[p['SITETYPE']], 'ha': round(p['Area_km2'] * 100), 'cod': c,
                 'h': h, 's': sorted(sp.get(c, []))}
nat = json.load(open(R + 'natda.geojson'))['features']
for f in nat:
    p = f['properties']; n = fix_text(fix_text(p['siteName'])).replace('  ', ' ').strip()
    if n in ESCLUSI: continue
    if n == 'P N ISOLA DI PANTELLERIA': n = "Parco nazionale Isola di Pantelleria"
    if n.endswith('Bosco del Cappelliere e G'): n += 'orgo del Drago'
    if n == "Parco dell' Etna": n = "Parco dell'Etna"
    c = p['nationalId'] or ('NATDA' + str(len(schede)))
    g = geo(f['geometry']); geom[c] = g
    schede[c] = {'n': n, 't': TIPO_NATDA.get(p['designationTypeCode'], 'ap'), 'ha': round(p['siteArea'] or g.area), 'cod': c,
                 'anno': p['legalFoundationDate'], 'iucn': p['iucnCategory'], 'mare': 1 if p['majorEcosystemType'] == 'marine' else 0}

# collegamenti aree protette <-> siti Natura 2000 (sovrapposizione >= 30% dell'area più piccola)
nat_ids = [c for c in schede if not c.startswith('ITA')]
for a in nat_ids:
    ga = geom[a]; links = []
    for b in [c for c in schede if c.startswith('ITA')]:
        gb = geom[b]
        if not ga.intersects(gb): continue
        i = ga.intersection(gb).area
        if i >= 0.3 * min(ga.area, gb.area): links.append(b)
    schede[a]['n2k'] = links
    for b in links: schede[b].setdefault('aree', []).append(a)

# boschi: per i siti Natura 2000 dai propri habitat; per le aree protette dai siti collegati
for c, s in schede.items():
    # per le aree protette solo i siti ZSC collegati (le ZPS si sovrappongono ai ZSC: eviterebbe doppi conteggi)
    hh = s['h'] if 'h' in s else [x for b in s.get('n2k', []) if schede[b]['t'] != 'zps' for x in schede[b]['h']]
    b = collections.Counter()
    for x in hh:
        if x['c'] in BOSCHI: b[x['c']] += x['ha']
    s['b'] = [[k, round(v)] for k, v in b.most_common()]
    s['bha'] = round(sum(b.values()))

for c, s in schede.items():
    g = geom[c]
    feats.append({'type': 'Feature', 'id': len(feats), 'properties': {'id': c, 't': s['t'], 'bha': s['bha']},
                  'geometry': {k: r5(v) if k == 'coordinates' else v for k, v in mapping(g).items()}})
    s['bb'] = [round(v, 4) for v in g.bounds]

json.dump({'type': 'FeatureCollection', 'features': feats}, open(OUT + 'zone.json', 'w'), separators=(',', ':'))
json.dump(schede, open(OUT + 'schede.json', 'w'), ensure_ascii=False, separators=(',', ':'))
json.dump({'nomi': spnomi, 'gr': spgr}, open(OUT + 'specie.json', 'w'), ensure_ascii=False, separators=(',', ':'))
json.dump({'boschi': BOSCHI, 'hab': nomi_hab}, open(OUT + 'habitat.json', 'w'), ensure_ascii=False, separators=(',', ':'))
cnt = collections.Counter(s['t'] for s in schede.values())
print(len(schede), 'zone', dict(cnt), len(spnomi), 'specie', sum(1 for s in schede.values() if s['bha']), 'zone con boschi')
for f in os.listdir(OUT): print(f, os.path.getsize(OUT + f))
