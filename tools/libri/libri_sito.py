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
# allineamenti fatti a mano (28/11/2026)
for l in open('alias_voci.tsv'):
    if not l.strip(): continue
    vk,tg=l.rstrip('\n').split('\t')
    if vk not in S['voci']: print('VOCE?',vk); continue
    gs=[]
    for nm in tg.split(';'):
        ii=nomi.get(low(nm))
        if not ii: print('NOME?',nm); continue
        rr=grp[f(('r',ii[0]))]
        gs.append({l2:', '.join(str(x['pag']) for x in rr if x['libro']==l2) for l2 in ('GBM','DMF','GOS')})
    prev=dict(out.get(vk,[]))
    for g in gs:
        for l2,pp in g.items():
            if pp: prev[l2]=', '.join(sorted(set((prev.get(l2,'')+', '+pp).strip(', ').split(', ')),key=int))
    out[vk]=[[l2,prev[l2]] for l2 in ('GBM','DMF','GOS') if prev.get(l2)]
res={'libri':{'GBM':['Il grande libro della cucina siciliana',''],'DMF':['La cucina siciliana','Di Marco e Ferré'],'GOS':['Le ricette regionali italiane','Gosetti']},'v':out}
json.dump(res,open('/home/claude/sicilia-naturale/www/data/libri.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(out)); import itertools
for k,x in itertools.islice(out.items(),40): print(k,S['voci'][k]['n'],x)
