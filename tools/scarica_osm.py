"""Scarica da Overpass (OpenStreetMap, ODbL) i dati escursionistici della Sicilia: percorsi (relazioni route=hiking/foot),
sentieri e mulattiere (highway=path/bridleway, track con sac_scale) e punti di interesse.
Gira su GitHub Actions (la sessione di lavoro non raggiunge Overpass). Scrive osm_percorsi.json.gz, osm_sentieri.json.gz, osm_punti.json.gz."""
import json, gzip, time, urllib.request, urllib.parse
SERVER = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter']
AREA = 'area["ISO3166-2"="IT-82"]->.s;'
Q = {
  'percorsi': f'[out:json][timeout:600];{AREA}relation["route"~"^(hiking|foot)$"](area.s);out geom;',
  'sentieri': f'[out:json][timeout:600];{AREA}(way["highway"~"^(path|bridleway)$"](area.s);way["highway"="track"]["sac_scale"](area.s);way["highway"="footway"]["sac_scale"](area.s););out geom tags;',
  'punti': f'''[out:json][timeout:600];{AREA}(
    nwr["tourism"~"^(alpine_hut|wilderness_hut|picnic_site|viewpoint|camp_site)$"](area.s);
    nwr["amenity"~"^(shelter|drinking_water)$"](area.s);
    nwr["natural"~"^(spring|peak|cave_entrance|volcano)$"](area.s);
    nwr["waterway"="waterfall"](area.s);
    nwr["historic"~"^(ruins|castle|archaeological_site|monastery|tower|fort)$"](area.s);
    nwr["information"~"^(board|guidepost)$"]["tourism"="information"](area.s);
  );out center tags;'''
}
for nome, q in Q.items():
    for prova in range(6):
        u = SERVER[prova % len(SERVER)]
        try:
            t = time.time()
            r = urllib.request.urlopen(urllib.request.Request(u, data=urllib.parse.urlencode({'data': q}).encode(), headers={'User-Agent': 'SiciliaNaturale/0.1'}), timeout=900).read()
            j = json.loads(r)
            if 'remark' in j and not j.get('elements'): raise RuntimeError(j['remark'])
            gzip.open(f'osm_{nome}.json.gz', 'wb').write(r)
            print(nome, len(j['elements']), 'elementi', round(len(r) / 1e6, 1), 'MB', round(time.time() - t), 's', u); break
        except Exception as e:
            print(nome, 'errore', u, e); time.sleep(30)
    else: raise SystemExit('Overpass non risponde per ' + nome)
