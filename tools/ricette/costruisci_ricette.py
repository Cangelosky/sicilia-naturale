import json, re, unicodedata, sys
sys.path.insert(0, 'tools/ricette'); from ricette_prova import R
S = json.load(open('www/data/sapori.json'))['voci']
def n(s): s=unicodedata.normalize('NFD',s.lower()); s=''.join(c for c in s if unicodedata.category(c)!='Mn'); return re.sub(r'[^a-z0-9]+',' ',s).strip()
out={'r':{}, 'v':{}}
for k,(nome,p,t,d,ing,passi,nota,alias) in R.items():
    out['r'][k]={'n':nome,'p':p,'t':t,'d':d,'i':[[q,u,x] for q,u,x in ing],'f':passi,'nota':nota}
    al={n(a) for a in alias}
    for vk,v in S.items():
        if v['t'] in ('piatto','dolce') and (n(v['n']) in al):
            out['v'].setdefault(vk,k)
json.dump(out,open('www/data/ricette.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(out['r']),'ricette', len(out['v']),'schede collegate')
senza=[k for k in out['r'] if k not in out['v'].values()]; print('senza scheda:',senza)
