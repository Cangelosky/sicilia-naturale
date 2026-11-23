"""Mesi in cui piante e funghi del catalogo sono stati osservati in Sicilia (GBIF, regione GADM ITA.15_1).
Per ogni specie: 12 conteggi (gennaio-dicembre) -> data/raw/gbif_mesi.json {chiave GBIF: [12 numeri]}.
Serve a capire la stagione (fioritura stimata, fruttificazione dei funghi). Uso: python3 tools/gbif_mesi.py"""
import json, urllib.request, concurrent.futures as cf, os
OUT = 'data/raw/gbif_mesi.json'
fatto = json.load(open(OUT)) if os.path.exists(OUT) else {}
F, P = json.load(open('www/data/funghi.json')), json.load(open('www/data/piante.json'))
chiavi = sorted({r[7] for r in F['s'] if r[7]} | {r[4] for r in P['s'] if r[4]})
def mesi(k):
    for _ in range(3):
        try:
            j = json.load(urllib.request.urlopen(f'https://api.gbif.org/v1/occurrence/search?gadm_gid=ITA.15_1&taxon_key={k}&limit=0&facet=month&facetLimit=12', timeout=60))
            m = [0] * 12
            for c in (j['facets'][0]['counts'] if j['facets'] else []): m[int(c['name']) - 1] = c['count']
            return k, m
        except Exception: pass
    return k, None
da = [k for k in chiavi if str(k) not in fatto]
with cf.ThreadPoolExecutor(16) as ex:
    for k, m in ex.map(mesi, da):
        if m is not None: fatto[str(k)] = m
json.dump(fatto, open(OUT, 'w'), separators=(',', ':'))
print(len(fatto), 'specie su', len(chiavi))
