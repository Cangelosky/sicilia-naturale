"""Nomi comuni in italiano e in siciliano per piante e funghi del catalogo, da Wikidata (CC0),
cercando le voci con l'identificativo GBIF (P846). Prende: nomi comuni (P1843) in it e scn,
altrimenti l'etichetta italiana se diversa dal nome scientifico. Uscita: www/data/nomi.json {chiave GBIF: [italiano, siciliano]}."""
import json, time, urllib.request, urllib.parse
F, P = json.load(open('www/data/funghi.json')), json.load(open('www/data/piante.json'))
sci = {}
for r in F['s']:
    if r[7]: sci[str(r[7])] = r[0]
for r in P['s']:
    if r[4]: sci[str(r[4])] = r[0]
keys = sorted(sci)
out = {}
Q = '''SELECT ?g ?nit ?nscn ?lit ?lscn WHERE {{ VALUES ?g {{ {v} }} ?x wdt:P846 ?g .
 OPTIONAL {{ ?x wdt:P1843 ?nit FILTER(lang(?nit)="it") }} OPTIONAL {{ ?x wdt:P1843 ?nscn FILTER(lang(?nscn)="scn") }}
 OPTIONAL {{ ?x rdfs:label ?lit FILTER(lang(?lit)="it") }} OPTIONAL {{ ?x rdfs:label ?lscn FILTER(lang(?lscn)="scn") }} }}'''
for i in range(0, len(keys), 250):
    part = keys[i:i + 250]
    q = Q.format(v=' '.join(f'"{k}"' for k in part))
    for prova in range(4):
        try:
            req = urllib.request.Request('https://query.wikidata.org/sparql?' + urllib.parse.urlencode({'query': q}), headers={'Accept': 'application/sparql-results+json', 'User-Agent': 'SiciliaNaturale/0.1 (progetto Sicilia Naturale)'})
            res = json.load(urllib.request.urlopen(req, timeout=120))['results']['bindings']; break
        except Exception as e:
            print('riprovo', e); time.sleep(10)
    else: continue
    for b in res:
        g = b['g']['value']; s = sci[g].lower(); o = out.setdefault(g, [set(), set()])
        for k, j in (('nit', 0), ('nscn', 1)):
            if k in b: o[j].add(b[k]['value'].strip())
        for k, j in (('lit', 0), ('lscn', 1)):
            if k in b and b[k]['value'].strip().lower() != s and not b[k]['value'][:1].isupper() is False: o[j].add(b[k]['value'].strip())
    time.sleep(1)
def pulisci(v, sci_n):
    v = [x for x in v if x and x.lower() != sci_n.lower() and not x.lower().startswith(sci_n.split()[0].lower() + ' ')]
    v.sort(key=lambda x: (len(x.split()) > 4, len(x)))
    return v[0][0].upper() + v[0][1:] if v else ''
fin = {}
for g, (it, sc) in out.items():
    a, b = pulisci(it, sci[g]), pulisci(sc, sci[g])
    if a or b: fin[g] = [a, b]
json.dump(fin, open('www/data/nomi.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(keys), 'specie;', sum(1 for v in fin.values() if v[0]), 'con nome italiano;', sum(1 for v in fin.values() if v[1]), 'con nome siciliano')
