# Sicilia Naturale

Atlante della natura siciliana: mappa delle aree protette, dei siti Natura 2000 e dei boschi della Sicilia, con una scheda per ogni zona.

- `www/`: l'app (MapLibre, mappa di base impacchettata in `www/tiles/`).
- `tools/costruisci_dati.py`: zone, habitat e specie da EEA (Natura 2000, NatDA v24).
- `tools/costruisci_sif.py`: livelli della Regione Siciliana (SIF, Corpo Forestale): Parco dei Monti Sicani, boschi vetusti, alberi monumentali, boschi da seme, nomi della carta forestale.
- `tools/tiles_carta_forestale.py`: tile vettoriali della carta forestale.
- `data/raw/`: dati grezzi EEA. Il file grezzo SIF (`sif_dati_sicilia_naturale.json`, 84 MB) non è nel repo: sta nella cartella "Sicilia Naturale" del Mac.

Ordine per rifare i dati: `costruisci_dati.py`, `costruisci_sif.py`, `tiles_carta_forestale.py` (dalla cartella principale).
