"""Elenco delle piante vascolari segnalate in Sicilia su GBIF (Tracheophyta, regione GADM ITA.15_1),
con nome scientifico, famiglia e numero di segnalazioni -> data/raw/gbif_piante_sicilia.json.
Si tengono le specie con almeno 2 segnalazioni. Uso: python3 tools/gbif_piante.py"""
import json, urllib.request, concurrent.futures as cf
API = 'https://api.gbif.org/v1/'
get = lambda u: json.load(urllib.request.urlopen(API + u, timeout=60))
conti, off = {}, 0
while True:
    j = get(f'occurrence/search?gadm_gid=ITA.15_1&taxon_key=7707728&limit=0&facet=speciesKey&facetLimit=1000&facetOffset={off}')
    c = j['facets'][0]['counts'] if j['facets'] else []
    for x in c: conti[int(x['name'])] = x['count']
    if len(c) < 1000: break
    off += 1000
print('specie con segnalazioni', len(conti))
keys = [k for k, n in conti.items() if n >= 2]
def info(k):
    for _ in range(3):
        try:
            s = get(f'species/{k}')
            return [s.get('canonicalName') or s.get('species'), s.get('family', ''), k, conti[k], s.get('vernacularName', '')]
        except Exception: pass
with cf.ThreadPoolExecutor(16) as ex: out = [r for r in ex.map(info, keys) if r and r[0]]
out.sort(key=lambda r: -r[3])
json.dump(out, open('data/raw/gbif_piante_sicilia.json', 'w'), ensure_ascii=False)
print('salvate', len(out))
