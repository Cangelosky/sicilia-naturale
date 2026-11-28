import csv, re, unicodedata, json
from collections import defaultdict
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
D='/home/claude/indici/'
LIB={'GBM':'Il grande libro della cucina siciliana','DMF':'Di Marco & Ferré, La cucina siciliana','GOS':'Gosetti, Le ricette regionali italiane'}
rows=[]
for r in csv.reader(open(D+'gbm.tsv'),delimiter='\t'):
    rows.append(dict(libro='GBM',sezione=r[0],sic=r[1],ita=r[2],n='',pag=int(r[3]),note=''))
for r in csv.reader(open(D+'dimarco.tsv'),delimiter='\t'):
    rows.append(dict(libro='DMF',sezione='',sic='',ita=r[0],n='',pag=int(r[1]),note=''))
for r in csv.reader(open(D+'gosetti.tsv'),delimiter='\t'):
    nome=r[1]; m=re.match(r'^(.*?)\s*\((.*)\)\s*$',nome)
    note=r[4] if len(r)>4 else ''
    if m and 'versione' in m.group(2): sic,ita,note=m.group(1),'',m.group(2)
    elif m and (len(m.group(2).split())<2 or re.match(r'^(o |alla |in |dolce |salsa |«gelo)',m.group(2))): sic,ita=nome,''
    elif m: sic,ita=m.group(1),m.group(2)
    else: sic,ita='',nome
    rows.append(dict(libro='GOS',sezione=r[0],sic=sic,ita=ita,n=r[2],pag=int(r[3]),note=note))
STOP=set('a al alla alle allo ai agli all con di del della delle dei degli dello e o in il la le lo i gli un una uno da du dâ ô â ê chî cû câ nta n d ccu cu sutta sotto per'.split())
def norm(s):
    s=unicodedata.normalize('NFD',s.lower()); s=''.join(c for c in s if unicodedata.category(c)!='Mn')
    s=re.sub(r"[^a-z]+",' ',s)
    t=[w for w in s.split() if w not in STOP and len(w)>1]
    t=[w[:-1] if len(w)>4 and w[-1] in 'aeiou' else w for w in t]
    return ' '.join(sorted(t))
# union-find on keys
par={}
def f(x):
    while par.setdefault(x,x)!=x: x=par[x]
    return x
def u(a,b): par[f(a)]=f(b)
for i,r in enumerate(rows):
    r['i']=i; f(('r',i))
    for k in (r['sic'],r['ita']):
        if k and norm(k): u(('r',i),('k',norm(k)))
import unicodedata as _u
def low(x): return _u.normalize('NFC',x).strip().lower()
nomi=defaultdict(list)
for r in rows:
    for x in (r['sic'],r['ita'],(r['sic']+' ('+r['ita']+')') if r['sic'] and r['ita'] else ''):
        if x: nomi[low(x)].append(r['i'])
    if r['note']: nomi[low(r['sic']+' ('+r['note']+')')].append(r['i'])
ALIAS=[l.rstrip('\n').split('\t') for l in open(D+'alias.tsv') if l.strip()]
miss=[]
for a,b in ALIAS:
    ia,ib=nomi.get(low(a)),nomi.get(low(b))
    if not ia or not ib: miss.append((a,b,bool(ia),bool(ib))); continue
    for i in ia+ib: u(('r',ia[0]),('r',i))
if miss: print('ALIAS NON TROVATI',miss)
grp=defaultdict(list)
for r in rows: grp[f(('r',r['i']))].append(r)
piatti=[]
for g in grp.values():
    libri={x['libro'] for x in g}
    ita=next((x['ita'] for x in g if x['libro']=='GBM'),next((x['ita'] for x in g if x['ita']),g[0]['sic']))
    sic=next((x['sic'] for x in g if x['sic']),'')
    pos={l:', '.join(str(x['pag']) for x in g if x['libro']==l) for l in LIB}
    piatti.append(dict(ita=ita,sic=sic,nlib=len(libri),**pos,keys=sorted({norm(x['ita']) for x in g}|{norm(x['sic']) for x in g if x['sic']})))
piatti.sort(key=lambda p:(-p['nlib'],p['ita'].lower()))
# CSV
with open(D+'out/indice_ricette_tre_libri.csv','w',newline='') as fh:
    w=csv.writer(fh); w.writerow(['libro','sezione','nome siciliano','nome italiano','n. ricetta','pagina','note'])
    for r in rows: w.writerow([LIB[r['libro']],r['sezione'],r['sic'],r['ita'],r['n'],r['pag'],r['note']])
with open(D+'out/piatti_libri_pagine.csv','w',newline='') as fh:
    w=csv.writer(fh); w.writerow(['piatto (italiano)','nome siciliano','quanti libri']+[LIB[l]+' (pagine)' for l in LIB])
    for p in piatti: w.writerow([p['ita'],p['sic'],p['nlib']]+[p[l] for l in LIB])
# XLSX
wb=Workbook(); F=Font(name='Arial',size=10); B=Font(name='Arial',size=10,bold=True,color='FFFFFF'); FILL=PatternFill('solid',fgColor='2F5D50')
def sheet(ws,head,data,widths):
    ws.append(head)
    for d in data: ws.append(d)
    for row in ws.iter_rows():
        for c in row: c.font=F
    for c in ws[1]: c.font=B; c.fill=FILL; c.alignment=Alignment(vertical='center')
    for i,wd in enumerate(widths): ws.column_dimensions[chr(65+i)].width=wd
    ws.freeze_panes='A2'; ws.auto_filter.ref=ws.dimensions
ws=wb.active; ws.title='Indice'
sheet(ws,['libro','sezione','nome siciliano','nome italiano','n. ricetta','pagina','note'],
 [[LIB[r['libro']],r['sezione'],r['sic'],r['ita'],int(r['n']) if r['n'] else None,r['pag'],r['note']] for r in rows],[38,26,36,40,11,9,30])
ws=wb.create_sheet('Piatti e libri')
sheet(ws,['piatto (italiano)','nome siciliano','quanti libri']+[LIB[l] for l in LIB],
 [[p['ita'],p['sic'],p['nlib']]+[p[l] for l in LIB] for p in piatti],[40,36,12,30,30,30])
ws=wb.create_sheet('Vini (Gosetti)')
sheet(ws,['categoria','vino','colore'],list(csv.reader(open(D+'gosetti_vini.tsv'),delimiter='\t')),[22,40,20])
ws=wb.create_sheet('Fonti')
sheet(ws,['sigla','libro','note'],[[k,v,'Solo titoli e pagine dagli indici; nessun testo di ricetta.'] for k,v in LIB.items()],[8,45,60])
wb.save(D+'out/Indice ricette - tre libri.xlsx')
json.dump(piatti,open(D+'out/piatti.json','w'),ensure_ascii=False)
from collections import Counter
print(len(rows),len(piatti),Counter(p['nlib'] for p in piatti))
for p in piatti[:60]: print(p['nlib'],p['ita'],'|',p['GBM'],'|',p['DMF'],'|',p['GOS'])
