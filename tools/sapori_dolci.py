#!/usr/bin/env python3
"""Aggiunge a www/data/sapori.json i dolci dell'elenco di Oscar (LISTA_COMPLETA_DOLCI_SICILIANI), con paese e famiglia provvisoria.
Uso: python3 tools/sapori_dolci.py lista.txt comuni_geo.json   (lista = docx convertito in testo con pandoc)"""
import json, re, sys, unicodedata
def norm(s): return re.sub(r"[^a-z0-9 ]", " ", unicodedata.normalize('NFD', s.replace('’', ' ').replace("'", ' ').replace('‘', '')).encode('ascii', 'ignore').decode().lower()).strip()
def slug(s): return re.sub(r' +', '-', norm(s))[:40]
lista, geof = sys.argv[1], sys.argv[2]
geo = [x for x in json.load(open(geof)) if len(x['istat']) == 5 and x['istat'][:2].isdigit() and 81 <= int(x['istat'][:2]) <= 89]
com = {norm(x['comune']): (x['comune'], [round(float(x['lng']), 4), round(float(x['lat']), 4)]) for x in geo}
alias = {'gagliano castel ferrato': 'gagliano castelferrato', 'montalbano': 'montalbano elicona', 'calatafimi': 'calatafimi segesta', 'santo stefano di camastra': 'santo stefano di camastra'}
for a, b in alias.items():
    if b in com: com[a] = com[b]
nomi = sorted(com, key=len, reverse=True)
FAM = [(r'biscott|viscott', 'Biscotti'), (r'cassatell|cassateddi', 'Cassatelle'), (r'cassat', 'Cassate e cassatine'), (r'buccellat|cucciddat|vucciddat', 'Buccellati'),
       (r'cuddur|cuddrir', 'Cuddure e pani dolci'), (r'sfinc|sfing', 'Sfinci'), (r'crispell|crespell|crispedd', 'Crespelle'), (r'mpanatigg|manatigg', "'Mpanatigghi"),
       (r'raviol', 'Ravioli dolci'), (r'pasticciott', 'Pasticciotti'), (r'mostard', 'Mostarda'), (r'ciambell', 'Ciambelle'), (r'riso|arancin', 'Dolci di riso'),
       (r'pignol|pignocc|pagnucc', 'Pignolata'), (r'amarett|mandorl|minnul|nucatul|nacatul', 'Dolci di mandorla'), (r'torron|cubbait|giuggiulen', 'Torroni e croccanti')]
CONV = ['sfoglio', 'cucchitelle', 'pantofole', 'ericini', 'pasta vergine', 'testa di turco', 'pasta reale', 'facciuna', 'scorze d arancia', 'impanatigghi', 'napoli', 'nucatili', 'trionfo di gola', 'cuscus dolce', 'conchiglia', 'amaretti di pistacchio', 'biscotti ricci', 'frutta martorana', 'minne di vergine']
D = json.load(open('www/data/sapori.json'))
perNome = {norm(p['n']): k for k, p in D['paesi'].items()}
esist = {(norm(v['n']), (v.get('paesi') or [''])[0]) for v in D['voci'].values()}
voci, visti = {}, set()
testo = open(lista).read().split('\n\n')
for blocco in testo:
    t = ' '.join(blocco.split()); m = re.match(r'^\d+\.\s+(.*)', t)
    if not m: continue
    t = m.group(1).strip(); n = ' ' + norm(t) + ' '
    pk = next((c for c in nomi if ' ' + c + ' ' in n), None)
    nome = t
    if pk:
        cn = com[pk][0]
        for pat in [r'\s+di\s+' + re.escape(cn), r'\.\s*' + re.escape(cn), r'\s+' + re.escape(cn)]:
            p2 = re.split(pat + r'\b', nome, maxsplit=1, flags=re.I)
            if len(p2) > 1: nome = p2[0]; break
        nome = re.split(r'\s+di\s+' + r'gagliano', nome, flags=re.I)[0]
    nome = re.split(r'\.\s', nome)[0].strip(' .?')
    nome = re.sub(r'^[‘\'’]', "'", nome); i = next((j for j, ch in enumerate(nome) if ch.isalpha()), 0); nome = nome[:i] + nome[i:i + 1].upper() + nome[i + 1:]
    nota = t[len(nome):].strip(' .') if t.lower().startswith(nome.lower()) else ''
    pid = (perNome.get(norm(com[pk][0])) or slug(com[pk][0])) if pk else None
    key = (norm(nome), pid or '')
    if key in visti or key in esist: continue
    visti.add(key)
    nn = norm(nome)
    fam = 'Conventuali' if any(nn.startswith(c) for c in CONV) else next((f for r, f in FAM if re.search(r, nn)), 'Altri dolci')
    k = 'd-' + slug(nome) + ('-' + pid if pid else '')
    v = {'t': 'dolce', 'n': nome, 'fam': fam, 'breve': '', 'storia': '', 'elenco': True}
    if pid:
        v['paesi'] = [pid]
        if pid not in D['paesi']: D['paesi'][pid] = {'n': com[pk][0], 'c': com[pk][1]}
    if nota and len(nota) > 2: v['nota'] = nota
    voci[k] = v
D['voci'].update(voci)
json.dump(D, open('www/data/sapori.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(voci), 'dolci aggiunti;', sum(1 for v in voci.values() if 'paesi' in v), 'con paese;', len(D['paesi']), 'paesi')
