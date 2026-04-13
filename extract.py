import json

with open('mna_prediction_v2.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

cells = [c['source'] for c in nb['cells'] if c['cell_type'] == 'code']

with open('cells.txt', 'w', encoding='utf-8') as f:
    for i, c in enumerate(cells[-10:]):
        f.write(f"\n=== Cell -{10-i} ===\n")
        f.write("".join(c))
