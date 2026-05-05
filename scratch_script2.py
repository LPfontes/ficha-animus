import json

with open('src/dados.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

for cat, niveis in d['talentos'].items():
    if isinstance(niveis, dict):
        for niv, lista in niveis.items():
            if isinstance(lista, list):
                for i, item in enumerate(lista):
                    req = item['requisito']
                    if req and not req.endswith('.') and not req.endswith('+'):
                        print(cat + '-' + niv + ' ' + item['nome'] + ' || REQ: ' + req)
