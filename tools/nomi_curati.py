"""Nomi comuni curati a mano per i funghi più cercati, da applicare DOPO nomi_comuni.py e nomi_gbif.py.
GBIF/Wikidata danno nomi mancanti o al plurale ("Porcini") e la ricerca non trovava le specie più note.
Formato in www/data/nomi.json: {chiave GBIF: [italiano, siciliano, altri nomi per la ricerca]}.
Il terzo elemento serve solo alla ricerca. Nessuna indicazione sulla commestibilità."""
import json
CUR = {  # nome scientifico: (nome italiano, nome siciliano, altri nomi cercabili)
    'Boletus edulis': ('Porcino', '', 'porcini porcino comune'),
    'Boletus aereus': ('Porcino nero', '', 'porcini porcino bronzino'),
    'Boletus reticulatus': ('Porcino estivo', '', 'porcini'),
    'Rubroboletus satanas': ('Porcino malefico', '', 'boleto satana'),
    'Amanita phalloides': ('Tignosa verdognola', '', 'tignosa'),
    'Amanita verna': ('Tignosa primaverile', '', 'tignosa'),
    'Amanita pantherina': ('Tignosa bruna', '', 'tignosa panterina'),
    'Amanita muscaria': ('Ovolaccio', '', 'ovolo malefico'),
    'Amanita caesarea': ('Ovolo buono', '', 'ovolo reale'),
    'Pleurotus ostreatus': ('Orecchione', '', 'gelone'),
    'Pleurotus eryngii': ('Cardoncello', '', 'fungo di ferla'),
    'Pleurotus nebrodensis': ('Fungo di basilisco', 'Funciu di basiliscu', 'basilisco'),
    'Lactarius deliciosus': ('Sanguinello', '', ''),
    'Suillus luteus': ('Pinarolo', '', ''),
    'Clitocybe nebularis': ('Ordinario', '', 'nebbiolo'),
    'Infundibulicybe geotropa': ('Sementino', '', 'cimballo'),
    'Armillaria mellea': ('Chiodino', '', 'famigliola'),
    'Coprinus comatus': ('Coprino chiomato', '', ''),
    'Craterellus cornucopioides': ('Trombetta dei morti', '', ''),
    'Morchella esculenta': ('Spugnola gialla', '', 'spugnola'),
    'Morchella elata': ('Spugnola conica', '', 'spugnola'),
    'Tuber aestivum': ('Tartufo estivo', '', 'scorzone tartufo'),
    'Tuber borchii': ('Bianchetto', '', 'tartufo'),
    'Tuber brumale': ('Tartufo nero invernale', '', 'tartufo'),
    'Russula cyanoxantha': ('Colombina maggiore', '', 'colombina'),
    'Russula virescens': ('Colombina verde', '', 'colombina'),
    'Entoloma sinuatum': ('Entoloma livido', '', ''),
    'Hygrophorus marzuolus': ('Marzuolo', '', 'dormiente'),
    'Macrolepiota procera': ('Mazza di tamburo', '', 'bubbola'),
    'Cantharellus cibarius': ('Finferlo', '', 'gallinaccio galletto'),
}
F = json.load(open('www/data/funghi.json'))
N = json.load(open('www/data/nomi.json'))
k_di = {r[0]: str(r[7]) for r in F['s'] if r[7]}
fatti = 0
for sc, (it, scn, alt) in CUR.items():
    k = k_di.get(sc)
    if not k: print('manca nel catalogo:', sc); continue
    v = N.get(k, ['', ''])
    N[k] = [it, scn or v[1]] + ([alt] if alt else [])
    fatti += 1
json.dump(N, open('www/data/nomi.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(fatti, 'nomi curati applicati')
