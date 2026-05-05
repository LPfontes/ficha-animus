import json
import re

with open('src/dados.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

# Fix specifically the known cases from the output
def fix_req_ef(item):
    req = item['requisito']
    ef = item['efeito']
    
    # "—" (long dash) is valid for "None".
    if req in ['—', '', '-']:
        item['requisito'] = '—'
        return
        
    # Split cases
    # Example: req: "Profissional em Acrobacia; Amador em Aura; nível", ef: "4+. Quando você é atacado..."
    match = re.match(r'^((?:\w+\+?\.\s*|[\w\s]+\.\s*|[\w\s]+;\s*))(.*)', ef)
    if match and req and not req.endswith('.') and not req.endswith('+'):
        prefix = match.group(1).strip()
        rest = match.group(2).strip()
        item['requisito'] = f"{req} {prefix}"
        item['efeito'] = rest

for cat, niveis in d['talentos'].items():
    if isinstance(niveis, dict):
        for niv, lista in niveis.items():
            if isinstance(lista, list):
                for item in lista:
                    fix_req_ef(item)
                    
                    # Fix "Combater com Duas Armas Maior"
                    if item['nome'] == 'Combater com Duas Armas' and 'Maior' in item['requisito']:
                        item['nome'] = 'Combater com Duas Armas Maior'
                        item['requisito'] = item['requisito'].replace('Maior ', '')

with open('src/dados.json', 'w', encoding='utf-8') as f:
    json.dump(d, f, indent=4, ensure_ascii=False)

print("Applied second pass of fixes.")
