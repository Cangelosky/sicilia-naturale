"""Estrae l'Elenco degli Alberi Monumentali di Sicilia (Regione Siciliana, Corpo Forestale, aggiornato al 17/07/2026)
dal PDF ufficiale in data/raw/alberi_elenco.json. Fonte:
https://www.regione.sicilia.it/system/files/2026-07/elenco_degli_alberi_monumentali_di_sicilia_aggiornato_al_17.07.2026.pdf"""
import json, re, pdfplumber

def dms(s):
    n = [float(x.replace(',', '.')) for x in re.findall(r'\d+(?:[.,]\d+)?', s or '')]
    return round(n[0] + (n[1] if len(n) > 1 else 0) / 60 + (n[2] if len(n) > 2 else 0) / 3600, 6) if n else None

def num(s):
    s = str(s).strip()
    if re.fullmatch(r'\d{1,3}(\.\d{3})+', s): s = s.replace('.', '')   # 1.564 = millecinquecentosessantaquattro
    try: return float(s.replace(',', '.'))
    except (ValueError, TypeError): return None

def dd(s):
    """Alcune pagine del PDF hanno ogni carattere ripetuto due volte (testo in grassetto simulato): 'CCaattaanniiaa' -> 'Catania'."""
    def w(x):
        return x[::2] if len(x) >= 2 and len(x) % 2 == 0 and all(x[i] == x[i + 1] for i in range(0, len(x), 2)) else x
    return '\n'.join(' '.join(w(x) for x in riga.split(' ')) for riga in (s or '').split('\n'))
uno = lambda s: re.sub(r'\s+', ' ', (s or '').replace('\n', ' ')).strip()
out = []
with pdfplumber.open('data/raw/elenco_alberi_monumentali_sicilia_2026-07-17.pdf') as pdf:
    for p in pdf.pages:
        for tab in p.find_tables():
            t = tab.extract()
            # colonne: limiti orizzontali dalla riga più completa della tabella
            ref = max(tab.rows, key=lambda row: sum(c is not None for c in row.cells))
            cols = [(c[0], c[2]) if c else None for c in ref.cells]
            for row, r in zip(tab.rows, t):
                # celle unite o disegnate in modo diverso: il testo si rilegge ritagliando la pagina sulla colonna
                if r and r[0] and r[0].strip().isdigit() and row.cells[0] and any(v is None for v in r[1:5] + r[9:13]):
                    y0, y1 = row.cells[0][1], row.cells[0][3]
                    r = [v if v is not None or not cols[i] else (p.crop((cols[i][0], y0, cols[i][1], y1)).extract_text() or '')
                         for i, v in enumerate(r)]
                # riga "doppia": si riconosce dal numero di scheda (es. 0055//MM113399//CCTT//1199)
                if r[1] and '//' in r[1]:
                    r = [None if c is None else dd(c) for c in r]
                if not r or not r[0] or not re.fullmatch(r'\d+', r[0].strip()) or len(r) < 16: continue
                out.append({'n': int(r[0]), 'scheda': uno(r[1]), 'prov': uno(r[2]), 'comune': re.sub(r'\s+\d+$', '', uno(r[3])), 'localita': uno(r[4]),
                            'lat': dms(r[5]), 'lon': dms(r[6]), 'alt': num(r[7]), 'urbano': uno(r[8]).lower() == 'si',
                            'specie': uno(r[9]), 'volgare': uno(r[10]), 'circ': num(r[11]), 'h': num(r[12]),
                            'criteri': [c.strip() for c in (r[13] or '').split('\n') if c.strip()], 'provv': uno(r[15])})
# una riga a cavallo di due pagine compare due volte con lo stesso numero: si uniscono i campi
uniti = {}
for a in out:
    u = uniti.setdefault(a['n'], {})
    for k, v in a.items():
        if k in ('localita', 'specie', 'volgare', 'provv') and u.get(k) and v and v != u[k]: u[k] = u[k] + ' ' + v
        elif k == 'criteri': u[k] = (u.get(k) or []) + v
        elif v not in (None, '', []) and not u.get(k): u[k] = v
        else: u.setdefault(k, v)
out = [uniti[k] for k in sorted(uniti)]
for a in out:   # quote impossibili per un albero in Sicilia (refusi nel PDF): si lasciano vuote
    if a['alt'] and a['alt'] > 2500: a['alt'] = None
json.dump(out, open('data/raw/alberi_elenco.json', 'w'), ensure_ascii=False, indent=0)
print(len(out), 'alberi;', sum(1 for a in out if a['urbano']), 'urbani;', sum(1 for a in out if not a['lat']), 'senza coordinate;',
      sum(1 for a in out if not a['specie']), 'senza specie')
