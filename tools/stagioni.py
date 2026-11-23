"""Stagione di ogni specie dai mesi di osservazione in Sicilia (data/raw/gbif_mesi.json, tools/gbif_mesi.py).
Uscita www/data/stagioni.json: {chiave GBIF: maschera di 12 caratteri, '1' = mese di stagione}.
Regole: almeno 8 osservazioni; conteggi lisciati con i mesi vicini; in stagione i mesi con almeno il 35% del massimo."""
import json
M = json.load(open('data/raw/gbif_mesi.json'))
out = {}
for k, m in M.items():
    if sum(m) < 8: continue
    s = [m[i - 1] * 0.5 + m[i] + m[(i + 1) % 12] * 0.5 for i in range(12)]
    mx = max(s)
    out[k] = ''.join('1' if v >= 0.35 * mx else '0' for v in s)
json.dump(out, open('www/data/stagioni.json', 'w'), separators=(',', ':'))
print(len(out), 'specie con stagione;', sum(v.count('1') >= 10 for v in out.values()), 'tutto l’anno')
