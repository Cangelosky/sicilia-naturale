"""Nomi comuni italiani (e siciliani) da GBIF (vernacularNames: Catalogue of Life, Info Flora, liste rosse...) uniti a quelli
di Wikidata (tools/nomi_comuni.py). Sceglie il nome italiano più citato dalle fonti. Uscita: www/data/nomi.json {chiave GBIF: [italiano, siciliano]}."""
import json, collections, urllib.request, concurrent.futures as cf
F, P = json.load(open('www/data/funghi.json')), json.load(open('www/data/piante.json'))
sci = {str(r[7]): r[0] for r in F['s'] if r[7]}; sci.update({str(r[4]): r[0] for r in P['s'] if r[4]})
generi = {n.split()[0].lower() for n in sci.values()}
def latino(x): w = x.split(); return len(w) >= 2 and w[0].lower() in generi
WD = json.load(open('www/data/nomi.json'))   # Wikidata (tools/nomi_comuni.py)
def nomi(k):
    for _ in range(3):
        try:
            d = json.load(urllib.request.urlopen(f'https://api.gbif.org/v1/species/{k}/vernacularNames?limit=300', timeout=60))
            c = {'ita': collections.Counter(), 'scn': collections.Counter()}
            for r in d['results']:
                l = r.get('language'); v = (r.get('vernacularName') or '').strip()
                if l in c and v and not latino(v): c[l][v[0].upper() + v[1:]] += 1
            sn = sci[k].lower().split(); W0 = (WD.get(k) or ['', ''])[0].lower()
            def scegli(cnt):
                if not cnt: return ''
                mx = max(cnt.values()); top = [v for v, n in cnt.items() if n == mx]
                # a parità di fonti: il nome che somiglia al nome scientifico, poi quello di Wikidata, poi il più corto
                return sorted(top, key=lambda v: (-(any(v.lower()[:4] == w[:4] for w in sn) * 2 + (v.lower() == W0)), len(v)))[0]
            return k, [scegli(c['ita']), scegli(c['scn'])]
        except Exception: pass
    return k, ['', '']
with cf.ThreadPoolExecutor(16) as ex: G = dict(ex.map(nomi, sorted(sci)))
W = json.load(open('www/data/nomi.json'))   # Wikidata
out = {}
for k in sci:
    g, w = G.get(k, ['', '']), W.get(k, ['', ''])
    it = g[0] or (w[0] if w[0] and not latino(w[0]) else '')
    sc = g[1] or w[1]
    if it or sc: out[k] = [it, sc]
json.dump(out, open('www/data/nomi.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(sci), 'specie;', sum(1 for v in out.values() if v[0]), 'con nome italiano;', sum(1 for v in out.values() if v[1]), 'con nome siciliano')
