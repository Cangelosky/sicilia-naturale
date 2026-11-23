"""Scarica da Overpass (OpenStreetMap, ODbL) i dati escursionistici della Sicilia: percorsi (relazioni route=hiking/foot),
sentieri e mulattiere (highway=path/bridleway, track con sac_scale) e punti di interesse.
Gira su GitHub Actions (la sessione di lavoro non raggiunge Overpass). Scrive osm_percorsi.json.gz, osm_sentieri.json.gz, osm_punti.json.gz."""
import json, gzip, time, os, urllib.request, urllib.parse
SERVER = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter']
AREA = 'area["ISO3166-2"="IT-82"]->.s;'
BB = '35.45,12.0,38.85,15.7'   # Sicilia e isole minori; Malta e Calabria si tolgono dopo
Q = {
  'percorsi': f'[out:json][timeout:600];{AREA}relation["route"~"^(hiking|foot)$"](area.s);out geom;',
  'sentieri': f'[out:json][timeout:600];{AREA}(way["highway"~"^(path|bridleway)$"](area.s);way["highway"="track"]["sac_scale"](area.s);way["highway"="footway"]["sac_scale"](area.s););out geom tags;',
  # punti di interesse: una richiesta per gruppo, poi uniti (una sola richiesta grande tornava vuota)
  'punti_tur': f'[out:json][timeout:300][bbox:{BB}];nwr["tourism"~"^(alpine_hut|wilderness_hut|picnic_site|viewpoint|camp_site)$"];out center;',
  'punti_ame': f'[out:json][timeout:300][bbox:{BB}];nwr["amenity"~"^(shelter|drinking_water|water_point)$"];out center;',
  'punti_nat': f'[out:json][timeout:300][bbox:{BB}];(nwr["natural"~"^(spring|peak|cave_entrance|volcano)$"];nwr["waterway"="waterfall"];);out center;',
  'punti_sto': f'[out:json][timeout:300][bbox:{BB}];nwr["historic"~"^(ruins|castle|archaeological_site|monastery|tower|fort)$"];out center;',
  'punti_inf': f'[out:json][timeout:300][bbox:{BB}];nwr["tourism"="information"]["information"~"^(board|guidepost)$"];out center;',
}
import sys
SOLO = sys.argv[1:]
for nome, q in Q.items():
    if SOLO and not any(nome.startswith(x) for x in SOLO): continue
    for prova in range(6):
        u = SERVER[prova % len(SERVER)]
        try:
            t = time.time()
            r = urllib.request.urlopen(urllib.request.Request(u, data=urllib.parse.urlencode({'data': q}).encode(), headers={'User-Agent': 'SiciliaNaturale/0.1'}), timeout=900).read()
            j = json.loads(r)
            if not j.get('elements'): raise RuntimeError(j.get('remark') or 'risposta vuota')
            gzip.open(f'osm_{nome}.json.gz', 'wb').write(r)
            print(nome, len(j['elements']), 'elementi', round(len(r) / 1e6, 1), 'MB', round(time.time() - t), 's', u); break
        except Exception as e:
            print(nome, 'errore', u, e); time.sleep(30)
    else: raise SystemExit('Overpass non risponde per ' + nome)
# unisce i punti in un solo file
import glob
pp = sorted(glob.glob('osm_punti_*.json.gz'))
if pp:
    el, visti = [], set()
    for f in pp:
        for e in json.load(gzip.open(f))['elements']:
            k = (e['type'], e['id'])
            c = (e.get('lat') or e.get('center', {}).get('lat'), e.get('lon') or e.get('center', {}).get('lon'))
            if c[0] is None: continue
            if (c[0] < 36.15 and 14.15 < c[1] < 14.65) or (c[1] > 15.63 and c[0] > 37.92): continue   # Malta, Calabria
            if k not in visti: visti.add(k); el.append(e)
    gzip.open('osm_punti.json.gz', 'wt').write(json.dumps({'elements': el}))
    for f in pp: os.remove(f)
    print('punti in tutto', len(el))
