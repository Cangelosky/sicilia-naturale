"""Ridivide i pacchetti c_X_Y (tutti gli zoom 8-11 di una tile z7, fino a 7 MB) in pacchetti più piccoli,
così la mappa scarica solo ciò che serve allo zoom in cui si guarda:
  m_X_Y   (X,Y = tile z7): vettoriali e rilievo dello zoom 8 (la vista di tutta la Sicilia)
  c8_X_Y  (X,Y = tile z8): vettoriali dello zoom 9
  c9_X_Y  (X,Y = tile z9): vettoriali degli zoom 10-11
Stesso formato di impacchetta_tiles.py (base64 in .txt). Si usa una volta sui pacchetti esistenti;
impacchetta_tiles.py produce già i pacchetti nuovi."""
import base64, glob, json, os, struct
D = 'www/tiles/'
def leggi(f):
    b = base64.b64decode(open(f).read()); n = struct.unpack('<I', b[:4])[0]
    return json.loads(b[4:4 + n]), b, 4 + n
def scrivi(nome, el):
    idx, dati, pos = {}, [], 0
    for k, b in sorted(el):
        idx[k] = [pos, len(b)]; dati.append(b); pos += len(b)
    j = json.dumps(idx, separators=(',', ':')).encode()
    open(D + nome + '.txt', 'w').write(base64.b64encode(struct.pack('<I', len(j)) + j + b''.join(dati)).decode())
nuovi = {}
for f in sorted(glob.glob(D + 'c_*.txt')):
    idx, b, o = leggi(f)
    for k, (s, l) in idx.items():
        t, z, x, y = k.split('/'); z, x, y = int(z), int(x), int(y)
        nome = f'm_{x >> 1}_{y >> 1}' if z == 8 else f'c8_{x >> 1}_{y >> 1}' if z == 9 else f'c9_{x >> (z - 9)}_{y >> (z - 9)}'
        nuovi.setdefault(nome, []).append((k, b[o + s:o + s + l]))
    os.remove(f)
for nome, el in nuovi.items():
    scrivi(nome, el); print(nome, len(el), round(os.path.getsize(D + nome + '.txt') / 1e6, 2), 'MB')
