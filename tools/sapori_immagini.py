"""Cerca un'immagine per ogni voce di Sapori su Wikipedia e Wikimedia Commons.
Regola: si accetta un'immagine solo se tutte le parole significative del nome
compaiono nel titolo della pagina o del file. Risultati in tools/fonti/immagini.json."""
import json, re, sys, time, unicodedata, urllib.parse, urllib.request, os
UA = 'SiciliaNaturaleBot/0.1 (https://github.com/Cangelosky/sicilia-naturale; noreply@anthropic.com)'
BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, 'fonti', 'immagini.json')
D = json.load(open(os.path.join(BASE, '..', 'www', 'data', 'sapori.json')))
R = json.load(open(OUT)) if os.path.exists(OUT) else {}
STOP = set('di del della dello dei degli delle da dal dalla e ed o od a al alla allo ai agli alle in con per tra fra il lo la i gli le un uno una sotto sott sicilia siciliano siciliana siciliani siciliane tipico tipica dop igp pat igt doc docg ct pa me ag tp sr rg cl en'.split())
def norm(s): return re.sub(r'[^a-z0-9 ]', ' ', unicodedata.normalize('NFKD', s.lower()).encode('ascii', 'ignore').decode())
def parole(n):
    n = re.sub(r'\(.*?\)', ' ', n.split('/')[0].split(':')[0])
    return [w for w in norm(n).split() if len(w) > 2 and w not in STOP]
def ok(nome, titolo):
    p, t = parole(nome), set(norm(titolo).split())
    def has(w): return w in t or any(x.startswith(w[:-1]) and abs(len(x) - len(w)) <= 2 for x in t if len(w) > 4)
    return p and all(has(w) for w in p)
def get(url):
    for i in range(6):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            return json.load(urllib.request.urlopen(req, timeout=20))
        except Exception as e:
            if '429' in str(e) or 'timed out' in str(e): time.sleep(45 * (i + 1)); continue
            return {}
    return {}
def wiki(n):
    q = urllib.parse.urlencode({'action': 'query', 'format': 'json', 'generator': 'search', 'gsrsearch': n, 'gsrlimit': 5, 'prop': 'pageimages', 'piprop': 'thumbnail|name', 'pithumbsize': 640, 'redirects': 1})
    pg = (get('https://it.wikipedia.org/w/api.php?' + q).get('query') or {}).get('pages') or {}
    for x in sorted(pg.values(), key=lambda x: x.get('index', 9)):
        if x.get('thumbnail') and ok(n, x['title']) and not re.search(r'stemma|logo|mappa|map|flag|bandiera|\.svg', x['thumbnail']['source'], re.I):
            return {'u': x['thumbnail']['source'], 'p': 'https://it.wikipedia.org/wiki/' + urllib.parse.quote(x['title'].replace(' ', '_')), 'f': x.get('pageimage', ''), 'src': 'wikipedia', 'tit': x['title']}
def commons(n):
    q = urllib.parse.urlencode({'action': 'query', 'format': 'json', 'generator': 'search', 'gsrsearch': n + ' filetype:bitmap', 'gsrnamespace': 6, 'gsrlimit': 8, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': 640})
    pg = (get('https://commons.wikimedia.org/w/api.php?' + q).get('query') or {}).get('pages') or {}
    for x in sorted(pg.values(), key=lambda x: x.get('index', 9)):
        t = x['title'][5:]
        if not ok(n, t) or re.search(r'stemma|coat of arms|logo|map|mappa|flag|\.svg|\.pdf|\.tif', t, re.I): continue
        ii = (x.get('imageinfo') or [{}])[0]; m = ii.get('extmetadata') or {}
        lic = (m.get('LicenseShortName') or {}).get('value', '')
        if not re.search(r'CC|Public domain|PD', lic, re.I): continue
        art = re.sub('<[^>]+>', '', (m.get('Artist') or {}).get('value', '')).strip()[:80]
        return {'u': ii.get('thumburl'), 'p': ii.get('descriptionurl'), 'f': t, 'a': art, 'l': lic, 'src': 'commons', 'tit': t}
voci = [(k, v) for k, v in D['voci'].items() if not v.get('wk')]
print(len(voci), 'voci senza immagine', flush=True)
for i, (k, v) in enumerate(voci):
    if k in R: continue
    n = v['n']
    r = wiki(n) or commons(n)
    R[k] = r or None
    if i % 20 == 0:
        json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=0); print(i, sum(1 for x in R.values() if x), flush=True)
    time.sleep(3)
json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=0)
print('fine', len(R), sum(1 for x in R.values() if x))
