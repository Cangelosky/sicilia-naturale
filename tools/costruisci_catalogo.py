"""Cataloghi delle sezioni Micologia e Botanica -> www/data/funghi.json, www/data/piante.json.
Micologia: specie di Micelio (sito Inzenga, data/raw/micelio/specie.json) segnalate in Sicilia su GBIF; foto di Micelio
(data/raw/micelio/foto.json); le foto sono copiate nel sito, in www/foto/funghi.
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
# tutte le altre piante vascolari segnalate in Sicilia su GBIF (tools/gbif_piante.py): [nome, famiglia, chiave, segnalazioni, nome comune]
gb = {r[0]: r for r in json.load(open('data/raw/gbif_piante_sicilia.json'))}
bin2 = lambda n: ' '.join(n.split()[:2])
gbb = {}
for n, r in gb.items(): gbb.setdefault(bin2(n), r)
nomi = sorted(set(siti) | set(amb) | set(gb))
# piante di uso alimentare tradizionale (Licata et al. 2016), senza le specie tossiche o pericolose
TOSSICHE = {'Ammi majus', 'Oenanthe pimpinelloides', 'Aristolochia sempervirens', 'Polygonatum multiflorum', 'Carlina gummifera', 'Echium vulgare', 'Heliotropium europaeum', 'Isatis tinctoria', 'Dioscorea communis', 'Equisetum arvense', 'Gladiolus italicus', 'Crocus biflorus', 'Anagyris foetida', 'Lathyrus sativus', 'Wisteria sinensis', 'Clematis cirrhosa', 'Clematis vitalba', 'Nepeta cataria', 'Teucrium fruticans', 'Globularia alypum', 'Calystegia sepium', 'Lathyrus clymenum', 'Orobanche crenata', 'Mentha pulegium'}
ALIM = {l.strip() for l in open('data/raw/alimurgiche_licata2016.txt') if l.strip() and not l.startswith('#')} - TOSSICHE
pia, visti = [], set()
for n in nomi:
    g = gb.get(n) or gbb.get(bin2(n))
    if n in gb and n not in siti and n not in amb and bin2(n) in visti: continue   # già presente con il nome dei formulari
    visti.add(bin2(n))
    gen = n.split()[0]
    # [nome, albero, siti Natura 2000, alberi monumentali/boschi da seme, chiave GBIF, famiglia, segnalazioni GBIF in Sicilia]
    # [..., 7: 1 se di uso alimentare tradizionale]
    pia.append([n, 1 if gen in ALBERI else 0, sorted(siti.get(n, []), key=lambda c: -S[c]['ha']), amb.get(n, []), g[2] if g else 0, g[1] if g else '', g[3] if g else 0, 1 if bin2(n.replace(' subsp.', '')) in ALIM else 0])
pia.sort(key=lambda r: (-r[1], -(len(r[2]) + 3 * len(r[3])), -r[6], r[0]))
json.dump({'s': pia}, open(OUT + 'piante.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('piante', len(pia), 'alberi', sum(r[1] for r in pia), 'con alberi monumentali o boschi da seme', sum(1 for r in pia if r[3]))
import os
for f in ('funghi.json', 'piante.json'): print(f, round(os.path.getsize(OUT + f) / 1e3), 'KB')
