"""Sentieri, percorsi e punti di interesse della Sicilia da OpenStreetMap (ODbL), impacchettati nell'app.
Dati grezzi: data/raw/osm/osm_{percorsi,sentieri,punti}.json.gz (workflow "Dati OSM", tools/scarica_osm.py).
Uscite:
- www/tiles/st_X_Y.txt: tile vettoriali z9-14, un pacchetto per tile z9 (stesso formato della carta forestale), chiavi s/z/x/y.
  Strati: 'perc' (percorsi segnati: id, r sigla, n nome, c difficoltà CAI), 'sent' (sentieri: d difficoltà 0-3, n nome),
  'poi' (punti: t tipo, n nome, e quota).
- www/data/percorsi.json: elenco dei percorsi con nome, sigla, difficoltà, lunghezza, dislivello, tempi, partenza e
  geometria semplificata (per evidenziarli sulla mappa).
- www/data/punti.json: punti di interesse [lon, lat, tipo, nome, quota]."""
import json, gzip, math, os, struct, base64, collections
from shapely.geometry import LineString, MultiLineString, Point, box
from shapely.ops import transform, linemerge
from shapely.strtree import STRtree
import mapbox_vector_tile as mvt

R, OUT = 'data/raw/osm/', 'www/tiles/'
W = 20037508.342789244
merc = lambda x, y: (x * W / 180, math.log(math.tan((90 + y) * math.pi / 360)) * 6378137)
carica = lambda n: json.load(gzip.open(R + f'osm_{n}.json.gz'))['elements'] if os.path.exists(R + f'osm_{n}.json.gz') else []

def lunghezza_km(g):
    tot = 0
    for l in (g.geoms if g.geom_type == 'MultiLineString' else [g]):
        c = list(l.coords)
        for (x1, y1), (x2, y2) in zip(c, c[1:]):
            dx = (x2 - x1) * math.cos(math.radians((y1 + y2) / 2)) * 111.32; dy = (y2 - y1) * 110.57
            tot += math.hypot(dx, dy)
    return tot

def num(v):
    try: return float(str(v).replace(',', '.').split()[0])
    except Exception: return None

# ---- percorsi (relazioni route=hiking/foot)
percorsi, geo_p, prop_p = [], [], []
for e in carica('percorsi'):
    t = e.get('tags', {})
    linee = [LineString([(p['lon'], p['lat']) for p in m['geometry']]) for m in e.get('members', []) if m['type'] == 'way' and m.get('geometry') and len(m['geometry']) > 1]
    if not linee: continue
    g = linemerge(MultiLineString(linee))
    km = num(t.get('distance')) or round(lunghezza_km(g), 1)
    nome = t.get('name') or (f"{t['from']} – {t['to']}" if t.get('from') and t.get('to') else '') or t.get('ref') or ''
    if not nome: continue
    parti = list(g.geoms) if g.geom_type == 'MultiLineString' else [g]
    start = parti[0].coords[0]
    gs = g.simplify(0.00025)
    coords = [[[round(x, 4), round(y, 4)] for x, y in l.coords] for l in (gs.geoms if gs.geom_type == 'MultiLineString' else [gs])]
    b = g.bounds
    percorsi.append({'id': e['id'], 'n': nome, 'r': t.get('ref', ''), 'net': t.get('network', ''), 'c': t.get('cai_scale', ''),
                     'km': round(km, 1), 'up': num(t.get('ascent')), 'dn': num(t.get('descent')),
                     'dur': t.get('duration:forward') or t.get('duration') or '', 'da': t.get('from', ''), 'a': t.get('to', ''),
                     'giro': t.get('roundtrip') == 'yes', 'op': t.get('operator', ''), 'desc': t.get('description:it') or t.get('description') or '',
                     's': [round(start[0], 5), round(start[1], 5)], 'bb': [round(b[0], 4), round(b[1], 4), round(b[2], 4), round(b[3], 4)], 'g': coords})
    geo_p.append(transform(merc, g)); prop_p.append({'id': e['id'], 'r': t.get('ref', ''), 'n': nome, 'c': t.get('cai_scale', '')})
print(len(percorsi), 'percorsi')

# ---- sentieri (path, bridleway, track/footway con difficoltà)
SAC = {'hiking': 1, 'mountain_hiking': 2, 'demanding_mountain_hiking': 3, 'alpine_hiking': 3, 'demanding_alpine_hiking': 3, 'difficult_alpine_hiking': 3}
geo_s, prop_s = [], []
for e in carica('sentieri'):
    if not e.get('geometry') or len(e['geometry']) < 2: continue
    t = e.get('tags', {})
    if t.get('access') in ('private', 'no'): continue
    geo_s.append(transform(merc, LineString([(p['lon'], p['lat']) for p in e['geometry']])))
    prop_s.append({'d': SAC.get(t.get('sac_scale'), 0), 'n': t.get('name', '')})
print(len(geo_s), 'sentieri')

# ---- punti di interesse
def tipo(t):
    to, am, na, hi = t.get('tourism'), t.get('amenity'), t.get('natural'), t.get('historic')
    if to in ('alpine_hut', 'wilderness_hut'): return 'rifugio'
    if am == 'shelter': return 'riparo'
    if to == 'picnic_site': return 'picnic'
    if to == 'viewpoint': return 'panorama'
    if to == 'camp_site': return 'campeggio'
    if am in ('drinking_water', 'water_point'): return 'fontana'
    if na == 'spring': return 'sorgente'
    if na in ('peak', 'volcano'): return 'vetta'
    if na == 'cave_entrance': return 'grotta'
    if t.get('waterway') == 'waterfall': return 'cascata'
    if hi == 'castle' or hi == 'fort': return 'castello'
    if hi == 'monastery': return 'chiesa'
    if hi == 'tower': return 'torre'
    if hi in ('ruins', 'archaeological_site'): return 'rovine'
    if to == 'information': return 'segnaletica' if t.get('information') == 'guidepost' else 'pannello'
    return None
punti, geo_q, prop_q = [], [], []
for e in carica('punti'):
    t = e.get('tags', {}); k = tipo(t)
    c = (e['lon'], e['lat']) if 'lon' in e else ((e['center']['lon'], e['center']['lat']) if 'center' in e else None)
    if not k or not c: continue
    if k == 'vetta' and not t.get('name'): continue
    ele = num(t.get('ele'))
    n = t.get('name', '')
    punti.append([round(c[0], 5), round(c[1], 5), k, n, round(ele) if ele else None])
    geo_q.append(Point(merc(*c))); prop_q.append({'t': k, 'n': n, 'e': round(ele) if ele else 0})
print(len(punti), 'punti di interesse')

json.dump(percorsi, open('www/data/percorsi.json', 'w'), ensure_ascii=False, separators=(',', ':'))
json.dump(punti, open('www/data/punti.json', 'w'), ensure_ascii=False, separators=(',', ':'))

# ---- tile
alberi = {'perc': (STRtree(geo_p), geo_p, prop_p, 9), 'sent': (STRtree(geo_s), geo_s, prop_s, 11), 'poi': (STRtree(geo_q) if geo_q else None, geo_q, prop_q, 11)}
def tile_bounds(z, x, y):
    s = 2 * W / 2 ** z
    return -W + x * s, W - (y + 1) * s, -W + (x + 1) * s, W - y * s
def lon2x(lon, z): return int((lon + 180) / 360 * 2 ** z)
def lat2y(lat, z): r = math.radians(lat); return int((1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2 ** z)
minx, miny, maxx, maxy = 11.9, 35.4, 15.7, 38.9
pacchi = collections.defaultdict(list)
for z in range(9, 15):
    px = 2 * W / 2 ** z / 256; n = 0
    semp = {k: {} for k in alberi}
    for x in range(lon2x(minx, z), lon2x(maxx, z) + 1):
        for y in range(lat2y(maxy, z), lat2y(miny, z) + 1):
            b = tile_bounds(z, x, y); buf = px * 6
            clip = box(b[0] - buf, b[1] - buf, b[2] + buf, b[3] + buf)
            strati = []
            for nome, (tr, gg, pp, zmin) in alberi.items():
                if z < zmin or tr is None: continue
                feats = []
                for i in tr.query(clip):
                    g = gg[i]
                    if nome != 'poi':
                        g = semp[nome].get(i) or semp[nome].setdefault(i, g.simplify(px * 0.7))
                        g = g.intersection(clip)
                        if g.is_empty or g.geom_type not in ('LineString', 'MultiLineString'):
                            if g.geom_type == 'GeometryCollection':
                                ll = [q for q in g.geoms if q.geom_type in ('LineString', 'MultiLineString')]
                                if not ll: continue
                                g = linemerge(ll) if len(ll) > 1 else ll[0]
                            else: continue
                    elif not clip.contains(g): continue
                    feats.append({'geometry': g, 'properties': pp[i]})
                if feats: strati.append({'name': nome, 'features': feats})
            if not strati: continue
            data = mvt.encode(strati, default_options={'quantize_bounds': b, 'extents': 4096})
            s = z - 9
            pacchi[f'st_{x >> s}_{y >> s}'].append((f's/{z}/{x}/{y}', data)); n += 1
    print('zoom', z, n, 'tile')
for f in os.listdir(OUT):
    if f.startswith('st_'): os.remove(OUT + f)
tot = 0
for nome, el in pacchi.items():
    idx, dati, pos = {}, [], 0
    for k, b in sorted(el):
        idx[k] = [pos, len(b)]; dati.append(b); pos += len(b)
    j = json.dumps(idx, separators=(',', ':')).encode()
    open(OUT + nome + '.txt', 'w').write(base64.b64encode(struct.pack('<I', len(j)) + j + b''.join(dati)).decode())
    tot += os.path.getsize(OUT + nome + '.txt')
print(len(pacchi), 'pacchetti,', round(tot / 1e6, 1), 'MB;', 'percorsi.json', round(os.path.getsize('www/data/percorsi.json') / 1e6, 2), 'MB')
