"""Esplora il servizio ArcGIS del SIF (Regione Siciliana) e scarica i livelli con la zonizzazione di parchi e riserve.
Gira su GitHub Actions. Scrive sif_servizi.json (elenco) e sif_<servizio>_<id>.geojson per i livelli trovati."""
import json, urllib.request, sys, re, time
BASE = 'https://sifweb.regione.sicilia.it/arcgis/rest/services'
def get(u):
    for i in range(3):
        try: return json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=120).read())
        except Exception as e: print('errore', u, e); time.sleep(5)
    return None
out = {}
root = get(BASE + '?f=json') or {}
servizi = [s['name'] for s in root.get('services', [])]
for c in root.get('folders', []):
    f = get(f'{BASE}/{c}?f=json') or {}
    servizi += [s['name'] for s in f.get('services', [])]
print('servizi', servizi)
for s in servizi:
    info = get(f'{BASE}/{s}/MapServer?f=json')
    if not info: continue
    out[s] = [(l['id'], l['name']) for l in info.get('layers', [])]
    print(s, out[s])
json.dump(out, open('sif_servizi.json', 'w'), ensure_ascii=False, indent=1)
# livelli che parlano di parchi, riserve, zone
for s, ls in out.items():
    for lid, nome in ls:
        if not re.search(r'parc|riserv|zon', nome, re.I): continue
        feats, off = [], 0
        while True:
            j = get(f'{BASE}/{s}/MapServer/{lid}/query?where=1%3D1&outFields=*&outSR=4326&f=geojson&resultOffset={off}&resultRecordCount=1000')
            if not j or not j.get('features'): break
            feats += j['features']; off += len(j['features'])
            if len(j['features']) < 1000: break
        if feats:
            fn = f"sif_{re.sub(r'[^A-Za-z0-9]+', '_', s)}_{lid}.geojson"
            json.dump({'type': 'FeatureCollection', 'nome': nome, 'features': feats}, open(fn, 'w'), ensure_ascii=False)
            print('scaricato', fn, nome, len(feats), list(feats[0]['properties'].keys())[:15])
