# Unisce l'elenco dei piatti raccolti dal web (tools/fonti/piatti_web.json) alle voci di Sapori.
# Le voci nuove sono segnate web=true: nomi e luoghi da siti, da verificare sui libri.
import json, re, unicodedata, math
from urllib.parse import urlparse
S = json.load(open('www/data/sapori.json')); W = json.load(open('tools/fonti/piatti_web.json'))
C = json.load(open('www/data/sicilia.json')); C = C.get('comuni') or C.get('c')
def nm(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn'); return re.sub(r'[^a-z]', '', s)
def slug(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn'); return re.sub(r'[^a-z0-9]+', '-', s).strip('-')
# comuni: nome normalizzato -> chiave paese (aggiunge i comuni che mancano, provincia dal vicino più prossimo)
P = S['paesi']; per_nome = {nm(v['n']): k for k, v in P.items()}
ALIAS = {'polizzigenerosa': 'polizzi', 'petraliasoprana': 'petralia'}
for n, lng, lat, key in C:
    if nm(n) in per_nome: continue
    k = key or slug(n)
    if k in P: per_nome[nm(n)] = k; continue
    vic = min((v for v in P.values() if v.get('pv')), key=lambda v: (v['c'][0] - lng) ** 2 + (v['c'][1] - lat) ** 2)
    P[k] = {'n': n, 'c': [lng, lat], 'pv': vic['pv'], 'pvstima': True}; per_nome[nm(n)] = k
for a, b in ALIAS.items(): per_nome.setdefault(a, b)
GENERICI = {nm(x) for x in 'pane,uva,olio,grano,pesce,ricotta,salsiccia,castagne,castagna,funghi,fungo porcino,porcini,porchetta,pesca,pesche,ficodindia,ciliegie,ciliegia,nocciola,nocciole,arancia,cipolla,carciofo,pomodoro,mandorla,miele,fragola,granita,arancino,arancina,cannolo,sfincia,cuccia,frittole,frittella,pane condito,pizza,focaccia,seppia,tonno,polpo,pesce spada,pesce azzurro,acciuga,anguilla,cozza,totano,rana,gallo,cinghiale,pecora,zucca,melanzana,fico,mango,kaki,ortica,granturco,lenticchie,fava,ceci,cicerchia,asparago,asparago selvatico,zafferano,mostarda,cassatella,buccellato,biscotto,pistacchio,olio e olive,uva italia,uva da tavola,melone giallo,noce,ricotta e formaggio,formaggio,caciocavallo,maccheroni,maccheroni al sugo,arancia rossa,agrumi,limone interdonato,fritto di paranza,paranza,frittura di paranza,pesce povero,pesce fresco,scacciata,scaccia,salsiccia e frittelle,porchetta e salsiccia,olio extravergine d oliva,grani antichi,pane e grani antichi,grano e pane,pane caldo,castagne'.split(',')}
CAT = {'dolce': ('dolce', 'dolci'), 'formaggio': ('prodotto', 'formaggi'), 'salume': ('prodotto', 'salumi'), 'conserva': ('prodotto', 'pesce'), 'pesce': ('prodotto', 'pesce'), 'pane': ('piatto', 'pane e pasta'), 'salsa': ('piatto', 'conserve e condimenti')}
def cat(p):
    c = p['cat']; n = p['n'].lower()
    if c in CAT: return CAT[c]
    if c == 'prodotto':
        if re.search(r'asino|capra|razza|pecora|suino|bovina|ape nera', n): return None
        if re.search(r'olio|oliv|sale|capper|cucunci', n): return ('prodotto', 'conserve e condimenti')
        if 'miele' in n: return ('prodotto', 'miele')
        if re.search(r'rum|liquor|spiritu|vino cotto', n): return ('prodotto', 'bevande')
        if re.search(r'grano|grani|timilia', n): return ('prodotto', 'pane e pasta')
        return ('prodotto', 'frutta e ortaggi')
    return ('piatto', 'gastronomia')
# fonti web: una per sito
F = S['fonti']; fk = {}
for u in set([p['fonte'] for p in W['piatti']] + [x for p in W['piatti'] for x in p.get('altre_fonti', [])]):
    h = urlparse(u).netloc.replace('www.', ''); k = 'web-' + slug(h)
    F.setdefault(k, {'a': h, 't': 'pagine consultate il 27 e 28 novembre 2026', 'web': True, 'u': []})
    if u not in F[k]['u']: F[k]['u'].append(u)
    fk[u] = k
def varianti(n):
    base = re.split(r'\s+(?:di|del|della|dei|delle|da|alla|alla?)\s+[A-Z]', n)[0]
    out = {nm(n), nm(base)}
    for x in list(out):
        if len(x) > 5: out.add(x[:-1])
    return out
esistenti = {}
for k, v in S['voci'].items():
    for x in varianti(v['n']): esistenti.setdefault(x, k)
def trova(n):
    for x in varianti(n):
        if x in esistenti: return esistenti[x]
nuove = agg = 0
for p in W['piatti']:
    n = nm(p['n']); paesi = []; gia = trova(p['n'])
    for l in p['luoghi']:
        k = per_nome.get(nm(l))
        if k and k not in paesi: paesi.append(k)
    fw = sorted({fk[u] for u in [p['fonte']] + p.get('altre_fonti', [])})
    if gia:
        v = S['voci'][gia]; ch = False
        for q in paesi:
            if q not in (v.get('paesi') or []): v.setdefault('paesi', []).append(q); ch = True
        for f in fw:
            if f not in v.get('fw', []): v.setdefault('fw', []).append(f); ch = True
        agg += ch; continue
    if n in GENERICI or not paesi and not p['luoghi'] and p['cat'] in ('prodotto',): continue
    tc = cat(p)
    if not tc: continue
    k = 'web-' + slug(p['n'])[:60]
    if k in S['voci']: continue
    v = {'t': tc[0], 'n': p['n'], 'cat': tc[1], 'breve': '', 'storia': '', 'web': True, 'fw': fw}
    if paesi: v['paesi'] = paesi
    elif p['luoghi']: v['zona'] = ', '.join(p['luoghi'])
    S['voci'][k] = v; nuove += 1
    for x in varianti(p['n']): esistenti.setdefault(x, k)
json.dump(S, open('www/data/sapori.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('voci nuove', nuove, 'voci arricchite', agg, 'totale voci', len(S['voci']), 'paesi', len(P))
