"""Cataloghi delle sezioni Micologia e Botanica -> www/data/funghi.json, www/data/piante.json.
Micologia: specie di Micelio (sito Inzenga, data/raw/micelio/specie.json) segnalate in Sicilia su GBIF; foto di Micelio
(data/raw/micelio/foto.json), mostrate dal sito Inzenga senza copiarle.
Botanica: piante dei formulari Natura 2000 dei siti siciliani (www/data/specie.json + schede.json), più le specie
degli alberi monumentali e dei boschi da seme (schede.json). Uso: dopo costruisci_dati.py e costruisci_sif.py."""
import json, re, collections

OUT = 'www/data/'
mic = json.load(open('data/raw/micelio/specie.json'))
foto = json.load(open('data/raw/micelio/foto.json'))

# ---- funghi: { g: gruppi, s: [[nome, autore, famiglia, ordine, gruppo, segnalazioni Sicilia, totale Sud, chiave GBIF, [foto]]] }
GR = ['aga', 'bol', 'rus', 'pol', 'can', 'pez', 'pal', 'gel', 'alt']
fun = []
for x in mic:
    si = x['r'].get('SI', 0)
    if not si: continue
    fun.append([x['n'], x['a'], x['f'], x['o'], x['g'], si, x['t'], x['k'], [p.split('/')[-1] for p in foto.get(x['n'], [])]])
fun.sort(key=lambda r: (-len(r[8]), -r[5], r[0]))
json.dump({'g': GR, 's': fun}, open(OUT + 'funghi.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('funghi', len(fun), 'con foto', sum(1 for r in fun if r[8]))

# ---- piante
SP = json.load(open(OUT + 'specie.json'))
S = json.load(open(OUT + 'schede.json'))
siti = collections.defaultdict(list)
for k, s in S.items():
    if not k.startswith('ITA'): continue
    for i in s.get('s', []):
        if SP['gr'][i] == 'P': siti[SP['nomi'][i]].append(k)

def binomio(sp):
    w = re.sub(r'\(.*?\)', ' ', sp or '').replace(',', ' ').split()
    if len(w) < 2: return ''
    return ' '.join(w[:3]) if w[1] in ('x', '×') and len(w) > 2 else ' '.join(w[:2])

amb = collections.defaultdict(list)
for k, s in S.items():
    if s['t'] in ('am', 'bs') and s.get('sp'):
        for parte in re.split(r'[,;/]| e ', s['sp']):
            b = binomio(parte.strip())
            b = {'Olea europea': 'Olea europaea'}.get(b, b)   # refusi del PDF
            if b and b[0].isupper() and not b.endswith((' spp', ' sp', ' sp.', ' spp.')): amb[b].append(k)

# generi di alberi e arbusti forestali (per il filtro "Alberi")
ALBERI = {'Abies', 'Acer', 'Alnus', 'Arbutus', 'Betula', 'Carpinus', 'Castanea', 'Celtis', 'Ceratonia', 'Cupressus', 'Fagus', 'Fraxinus', 'Ilex',
          'Juglans', 'Juniperus', 'Laurus', 'Olea', 'Ostrya', 'Phillyrea', 'Pinus', 'Pistacia', 'Platanus', 'Populus', 'Prunus', 'Pyrus', 'Quercus',
          'Salix', 'Sorbus', 'Tamarix', 'Taxus', 'Tilia', 'Ulmus', 'Zelkova', 'Malus', 'Crataegus', 'Ficus', 'Morus', 'Cercis', 'Chamaerops'}
nomi = sorted(set(siti) | set(amb))
pia = []
for n in nomi:
    gen = n.split()[0]
    pia.append([n, 1 if gen in ALBERI else 0, sorted(siti.get(n, []), key=lambda c: -S[c]['ha']), amb.get(n, [])])
pia.sort(key=lambda r: (-r[1], -(len(r[2]) + 3 * len(r[3])), r[0]))
json.dump({'s': pia}, open(OUT + 'piante.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('piante', len(pia), 'alberi', sum(r[1] for r in pia), 'con alberi monumentali o boschi da seme', sum(1 for r in pia if r[3]))
import os
for f in ('funghi.json', 'piante.json'): print(f, round(os.path.getsize(OUT + f) / 1e3), 'KB')
