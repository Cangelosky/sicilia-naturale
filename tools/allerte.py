"""Allerte meteo-idrogeologiche della Sicilia per oggi e domani, dal bollettino nazionale di criticità del
Dipartimento della Protezione Civile (repository pubblico pcm-dpc, licenza CC BY 4.0). Scrive allerte.json."""
import json, subprocess, re, os, sys
from shapely.geometry import shape, mapping, box
R = 'https://github.com/pcm-dpc/DPC-Bollettini-Criticita-Idrogeologica-Idraulica.git'
subprocess.run(['git', 'clone', '-q', '--depth', '1', '--filter=blob:none', '--sparse', R, 'dpc'], check=True)
subprocess.run(['git', '-C', 'dpc', 'sparse-checkout', 'set', '--no-cone', '/files/geojson/*_today.json', '/files/geojson/*_tomorrow.json'], check=True)
fs = sorted(f for f in os.listdir('dpc/files/geojson') if f.endswith('_today.json'))
ultimo = fs[-1][:13]
SIC = box(11.9, 35.4, 15.7, 38.9)
LIV = [('ROSSA', 3, '#d63031'), ('ARANCIONE', 2, '#f08c00'), ('GIALLA', 1, '#f5c400')]
def livello(t):
    for k, n, c in LIV:
        if k in (t or '').upper(): return n, c
    return 0, ''
out = {'emesso': ultimo, 'fonte': 'Dipartimento della Protezione Civile, bollettino di criticità (CC BY 4.0)'}
for g in ('today', 'tomorrow'):
    f = f'dpc/files/geojson/{ultimo}_{g}.json'
    if not os.path.exists(f): continue
    d = json.load(open(f)); z = []
    for x in d['features']:
        geo = shape(x['geometry'])
        if not geo.intersects(SIC) or geo.centroid.x > 15.75: continue
        p = x['properties']; n, c = livello(p.get('Rappresentata nella mappa'))
        rischi = [r.replace('Per rischio ', '') for r in ('Per rischio idrogeologico', 'Per rischio idraulico', 'Per rischio temporali') if livello(p.get(r))[0]]
        z.append({'zona': p.get('Nome zona'), 'n': n, 'c': c, 'rischi': rischi, 'g': mapping(geo.simplify(0.01))})
    out['oggi' if g == 'today' else 'domani'] = z
json.dump(out, open('allerte.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(ultimo, {k: [(a['zona'], a['n']) for a in v] for k, v in out.items() if isinstance(v, list)})
