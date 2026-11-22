"""Tile vettoriali della carta forestale (categorie forestali SIF, livello 38) per l'anteprima.
Zoom 9-12 (oltre il 12 MapLibre ingrandisce le tile del 12). Le particelle senza categoria (NON DEFINITO) sono escluse.
Un pacchetto per ogni tile z9: www/tiles/cf_X_Y.txt, stesso formato della mappa di base (indice JSON + dati, in base64).
Chiavi: f/z/x/y. Strato 'cf' con proprietà c (codice categoria) e m (macrocategoria, prime 2 lettere)."""
import json, math, os, struct, base64, collections
from shapely.geometry import shape, box
from shapely.ops import transform
from shapely.strtree import STRtree
import mapbox_vector_tile as mvt

R, OUT = 'data/raw/', 'www/tiles/'
d = json.load(open(R + 'sif_dati_sicilia_naturale.json'))
validi = {x['CODCAMPO'] for x in d['categorie_lookup'] if x['CODCAMPO'] and x['DESCRIPTION'] and '-' in x['DESCRIPTION']}

def merc(x, y):
    return x * 20037508.342789244 / 180, math.log(math.tan((90 + y) * math.pi / 360)) * 6378137

geoms, props = [], []
for f in d['categorie_forestali']['features']:
    c = f['properties']['c']
    if c not in validi or not f['geometry']: continue
    g = shape(f['geometry'])
    if not g.is_valid: g = g.buffer(0)
    if g.is_empty: continue
    geoms.append(transform(merc, g)); props.append({'c': c, 'm': c[:2]})
print(len(geoms), 'particelle')
tree = STRtree(geoms)
W = 20037508.342789244

def tile_bounds(z, x, y):
    n = 2 ** z; s = 2 * W / n
    return -W + x * s, W - (y + 1) * s, -W + (x + 1) * s, W - y * s

def lon2x(lon, z): return int((lon + 180) / 360 * 2 ** z)
def lat2y(lat, z): r = math.radians(lat); return int((1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2 ** z)

minx, miny, maxx, maxy = 11.9, 35.4, 15.7, 38.9
pacchi = collections.defaultdict(list)
for z in range(9, 13):
    px = 2 * W / 2 ** z / 256           # metri per pixel
    tol, amin = px * 0.6, (px * 0.8) ** 2
    semp = {}
    n = 0
    for x in range(lon2x(minx, z), lon2x(maxx, z) + 1):
        for y in range(lat2y(maxy, z), lat2y(miny, z) + 1):
            b = tile_bounds(z, x, y); buf = px * 8
            clip = box(b[0] - buf, b[1] - buf, b[2] + buf, b[3] + buf)
            feats = []
            for i in tree.query(clip):
                g = semp.get(i)
                if g is None:
                    g = geoms[i].simplify(tol, preserve_topology=True); semp[i] = g
                if g.is_empty or g.area < amin: continue
                gc = g.intersection(clip)
                if gc.is_empty or gc.geom_type not in ('Polygon', 'MultiPolygon'):
                    if gc.geom_type == 'GeometryCollection':
                        gc = [p for p in gc.geoms if p.geom_type in ('Polygon', 'MultiPolygon')]
                        if not gc: continue
                        from shapely.ops import unary_union; gc = unary_union(gc)
                    else: continue
                feats.append({'geometry': gc, 'properties': props[i]})
            if not feats: continue
            data = mvt.encode([{'name': 'cf', 'features': feats}], default_options={'quantize_bounds': b, 'extents': 4096})
            s = z - 9
            pacchi[f'cf_{x >> s}_{y >> s}'].append((f'f/{z}/{x}/{y}', data)); n += 1
    print('zoom', z, n, 'tile')

for f in os.listdir(OUT):
    if f.startswith('cf_'): os.remove(OUT + f)
tot = 0
for nome, el in pacchi.items():
    idx, dati, pos = {}, [], 0
    for k, b in sorted(el):
        idx[k] = [pos, len(b)]; dati.append(b); pos += len(b)
    j = json.dumps(idx, separators=(',', ':')).encode()
    open(OUT + nome + '.txt', 'w').write(base64.b64encode(struct.pack('<I', len(j)) + j + b''.join(dati)).decode())
    tot += os.path.getsize(OUT + nome + '.txt')
print(len(pacchi), 'pacchetti,', round(tot / 1e6, 1), 'MB in tutto')
