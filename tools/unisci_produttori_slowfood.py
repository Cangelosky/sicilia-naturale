"""Produttori dei presìdi Slow Food della Sicilia -> www/data/sapori.json.

Fonte: schede dei presìdi su fondazioneslowfood.com (sezione Produttori),
consultate il 28/11/2026. Elenco grezzo in tools/fonti/produttori/slowfood_raw.txt.

Livello di tutti: "Segnalato" (fonte pubblica, non ancora visitati da noi).
Toglie i produttori e i viaggi di prova (p1..p7, v1..v3).
Niente telefoni, email o nomi dei titolari nel sito.
"""
import json, re, unicodedata
from pathlib import Path

R = Path(__file__).resolve().parent.parent
SAP = R / 'www/data/sapori.json'
RAW = R / 'tools/fonti/produttori/slowfood_raw.txt'
MAP = R / 'tools/fonti/produttori/mappa_presidi.json'
URL = 'https://www.fondazioneslowfood.com/it/presidi-slow-food/'
CAT = {'frutta': 'frutta e ortaggi', 'ortaggi': 'frutta e ortaggi', 'legumi': 'frutta e ortaggi',
       'frutta secca': 'frutta e ortaggi', 'latte': 'gastronomia'}


def slug(s):
    s = unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


d = json.loads(SAP.read_text())
mp = json.loads(MAP.read_text())
P = d['paesi']
chiave = {slug(v['n']): k for k, v in P.items()}

# via i dati di prova
d['produttori'] = {k: v for k, v in d['produttori'].items() if not re.fullmatch(r'p\d+', k)}
d['viaggi'] = {}

# fonte Slow Food (una per presidio, dentro la voce)
d['fonti']['slowfood-presidi'] = {'a': 'Fondazione Slow Food, schede dei presìdi', 't': 'consultate il 28 novembre 2026',
                                  'web': True, 'u': ['https://www.fondazioneslowfood.com/it/regioni-presidi/sicilia-it/']}

nuove = 0
voce_di = {}
for ps, x in mp.items():
    nome, vk, ruolo = x[0], x[1], x[2]
    if not vk:
        vk = 'sf-' + ps
        if vk not in d['voci']:
            d['voci'][vk] = {'t': 'prodotto', 'n': nome, 'cat': CAT.get(x[3], x[3]), 'breve': '', 'storia': '',
                             'ric': ['Presidio Slow Food'], 'paesi': [], 'fw': ['slowfood-presidi'], 'sfu': URL + ps + '/'}
            nuove += 1
    v = d['voci'][vk]
    if 'Presidio Slow Food' not in (v.get('ric') or []):
        v['ric'] = (v.get('ric') or []) + ['Presidio Slow Food']
    v['sfu'] = URL + ps + '/'
    voce_di[ps] = (vk, ruolo, nome)

prod, manca = {}, set()
for riga in RAW.read_text().splitlines():
    if not riga.strip() or riga.startswith('#'):
        continue
    ps, n, _tit, luogo, sito = (riga.split('|') + [''] * 5)[:5]
    m = re.match(r'(.+?)\s*\((\w\w)\)', luogo)
    com = m.group(1).strip() if m else luogo.strip()
    pk = chiave.get(slug(com))
    if not pk:
        manca.add(com)
        continue
    vk, ruolo, pnome = voce_di[ps]
    if ps == 'scattata-di-alia' and n.startswith('Bar'):
        ruolo = 'vende'
    k = 'sf-' + slug(n) + '-' + pk
    p = prod.setdefault(k, {'n': n, 'r': ruolo, 'paese': pk, 'fa': [], 'liv': 'Segnalato', 'pres': [], 'fu': []})
    if vk not in p['fa']:
        p['fa'].append(vk)
    if pnome not in p['pres']:
        p['pres'].append(pnome)
        p['fu'].append(URL + ps + '/')
    if ruolo == 'trasforma':
        p['r'] = 'trasforma'
    if sito and not p.get('sito'):
        p['sito'] = 'https://' + sito.removeprefix('https://').removeprefix('http://')
    # la voce vale anche per il paese del produttore
    v = d['voci'][vk]
    if v.get('paesi') is not None and pk not in v['paesi'] and vk.startswith('sf-'):
        v['paesi'].append(pk)

d['produttori'].update(prod)
d['nota'] = ('Testi provvisori da verificare. Produttori: per ora quelli segnalati dalle schede dei presìdi Slow Food, '
             'non ancora visitati da noi.')
SAP.write_text(json.dumps(d, ensure_ascii=False, separators=(',', ':')))
print('produttori', len(prod), 'voci nuove', nuove, 'comuni non trovati', sorted(manca))
