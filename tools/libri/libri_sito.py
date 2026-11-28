import json,sys
sys.path.insert(0,'.')
exec(open('costruisci.py').read().split('# CSV')[0])
S=json.load(open('/home/claude/sicilia-naturale/www/data/sapori.json'))
idx={}
for p in piatti:
    for k in p['keys']: idx.setdefault(k,p)
out={}; GEN={'biscott','dolc','focacc','torta','pan','pasta','gelat','liquor','conserv','marmellat'}

for vk,v in S['voci'].items():
    if v['t'] in ('materia','semi'): continue
    gs=[]
    for nm in [v.get('n',''),v.get('nd','')]:
        k=norm(nm) if nm else ''
        if k and len(k.split())>=1 and k in idx and idx[k] not in gs and k not in GEN: gs.append(idx[k])
    if gs:
        out[vk]=[[l,', '.join(sorted({p for g in gs for p in g[l].split(', ') if p},key=int))] for l in ('GBM','DMF','GOS')]
        out[vk]=[x for x in out[vk] if x[1]]
res={'libri':{'GBM':['Il grande libro della cucina siciliana',''],'DMF':['La cucina siciliana','Di Marco e Ferré'],'GOS':['Le ricette regionali italiane','Gosetti']},'v':out}
json.dump(res,open('/home/claude/sicilia-naturale/www/data/libri.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(out)); import itertools
for k,x in itertools.islice(out.items(),40): print(k,S['voci'][k]['n'],x)
