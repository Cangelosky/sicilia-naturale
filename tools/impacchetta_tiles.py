"""Impacchetta le tile scaricate (tiles/) in pochi file (binario in base64) per l'anteprima (www/tiles/).
base.bin: vettoriali z5-7, rilievo z5-7, font. c_X_Y.bin: per ogni tile z7 (X,Y), vettoriali z8-11 e rilievo z8.
Formato: 4 byte (lunghezza indice, little endian) + indice JSON {chiave: [inizio, lunghezza]} + dati."""
import os, json, struct, glob, base64

T = 'tiles/'; OUT = 'www/tiles/'
os.makedirs(OUT, exist_ok=True)
pacchi = {'base': []}
for f in glob.glob(T + '**/*.*', recursive=True):
    k = f[len(T):].rsplit('.', 1)[0]  # es. v/10/550/400, g/Noto Sans Regular/0-255
    tipo = k.split('/')[0]
    if tipo == 'g': pacchi['base'].append((k, f)); continue
    z, x, y = map(int, k.split('/')[1:])
    if tipo == 'd' and z > 8: continue
    if z <= 7: pacchi['base'].append((k, f)); continue
    s = z - 7
    pacchi.setdefault(f'c_{x >> s}_{y >> s}', []).append((k, f))
for nome, elementi in pacchi.items():
    idx, dati, pos = {}, [], 0
    for k, f in sorted(elementi):
        b = open(f, 'rb').read(); idx[k] = [pos, len(b)]; dati.append(b); pos += len(b)
    j = json.dumps(idx, separators=(',', ':')).encode()
    # il server delle anteprime non serve file binari: il pacchetto va in base64 dentro un .txt
    raw = struct.pack('<I', len(j)) + j + b''.join(dati)
    open(OUT + nome + '.txt', 'w').write(base64.b64encode(raw).decode())
    print(nome, len(elementi), round(os.path.getsize(OUT + nome + '.txt') / 1e6, 2), 'MB')
