#!/usr/bin/env python3
"""Icona e schermata di avvio Android di Sicilia Naturale (provvisorie, disegnate qui: verde dell'app, monti e foglia bianchi)."""
import pathlib, sys
from PIL import Image, ImageDraw
RES = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'android') / 'app/src/main/res'
VERDE = (45, 106, 79)

def logo(n):
    im = Image.new('RGBA', (n, n), (0, 0, 0, 0)); d = ImageDraw.Draw(im); u = n / 100
    d.polygon([(10*u, 78*u), (38*u, 34*u), (52*u, 55*u), (64*u, 40*u), (90*u, 78*u)], fill='white')          # monti
    d.polygon([(30*u, 50*u), (38*u, 38*u), (45*u, 50*u)], fill=VERDE)                                          # neve
    d.ellipse((58*u, 12*u, 84*u, 38*u), fill='white')                                                           # sole
    return im

for dpi, k in {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}.items():
    out = RES / f'mipmap-{dpi}'
    n = int(108 * k); c = Image.new('RGBA', (n, n), VERDE + (255,)); a = int(n * 0.62); c.alpha_composite(logo(a), ((n - a) // 2, (n - a) // 2)); c.save(out / 'ic_launcher_foreground.png')
    m = int(48 * k); s = Image.new('RGBA', (m, m), VERDE + (255,)); s.alpha_composite(logo(int(m * .8)), (int(m * .1), int(m * .1))); s.save(out / 'ic_launcher.png')
    r = s.copy(); mask = Image.new('L', (m, m), 0); ImageDraw.Draw(mask).ellipse((0, 0, m - 1, m - 1), fill=255); r.putalpha(mask); r.save(out / 'ic_launcher_round.png')
(RES / 'values/ic_launcher_background.xml').write_text('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#2d6a4f</color>\n</resources>\n')
for f in RES.glob('drawable*/splash.png'):
    w, h = Image.open(f).size; im = Image.new('RGBA', (w, h), VERDE + (255,)); s = int(min(w, h) * 0.35); im.alpha_composite(logo(s), ((w - s) // 2, (h - s) // 2)); im.convert('RGB').save(f)
print('icone scritte')
