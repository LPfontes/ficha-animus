import json

with open('src/dados.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

# Hardcoded fixes for remaining tricky splits
fixes = {
    'Dança de Lâminas': {
        'req_append': ' Duas Armas; nível 4+.',
        'ef_remove_prefix': 'Duas Armas; nível 4+. '
    },
    'Combater com Duas Armas Maior': {
        'req_append': ' nível 8+.',
        'ef_remove_prefix': 'nível 8+. '
    },
    'Esquiva Elemental': {
        'req_append': ' nível 4+.',
        'ef_remove_prefix': '4+. '
    },
    'Armadura de Anima': {
        'req_append': ' nível 4+.',
        'ef_remove_prefix': '4+. '
    },
    'Veneno Alquímico': {
        'req_append': ' Luta; nível 4+.',
        'ef_remove_prefix': 'Luta; nível 4+. '
    },
    'Provocação Letal': {
        'req_append': ' nível 4+.',
        'ef_remove_prefix': 'nível 4+. '
    },
    'Anatomia do Caos': {
        'req_append': ' Elemento; nível 8+.',
        'ef_remove_prefix': 'Elemento; nível 8+. '
    },
    'Armadilheiro Profissional': {
        'req_append': ' Prestidigitação \'Armadilheiro\'.',
        'ef_remove_prefix': 'Prestidigitação \'Armadilheiro\'. '
    },
    'Alquimista': {
        'req_append': ' Apotecário.',
        'ef_remove_prefix': 'Apotecário. '
    },
    'Análise Marcial': {
        'req_append': ' nível 4+.',
        'ef_remove_prefix': 'nível 4+. '
    },
    'Golpe Carregado': {
        'req_append': ' de Luta)',
        'ef_remove_prefix': 'de Luta) '
    },
    'Condutor Elétrico': {
        'req_append': ' runa, aliado ou Mestiço).',
        'ef_remove_prefix': 'runa, aliado ou Mestiço). '
    },
    'Carga Elemental': {
        'req_append': ' nível 4+.',
        'ef_remove_prefix': '4+. '
    },
    'Veneno de Lâmina': {
        'req_append': ' Elemento (Madeira ou Metal); nível 4+.',
        'ef_remove_prefix': 'Elemento (Madeira ou Metal); nível 4+. '
    },
    'Abertura + Elemento': {
        'req_append': ' nível 4+.',
        'ef_remove_prefix': 'nível 4+. '
    },
    'Golpe Saturante': {
        'req_append': ' nível 4+.',
        'ef_remove_prefix': 'nível 4+. '
    },
    'Forma Elemental Marcial': {
        'req_append': ' nível 8+.',
        'ef_remove_prefix': 'nível 8+. '
    },
    'Arqueiro Elemental Supremo': {
        'req_append': ' nível 8+.',
        'ef_remove_prefix': 'nível 8+. '
    },
    'Sobrecarga Saturada': {
        'req_append': ' nível 4+.',
        'ef_remove_prefix': 'nível 4+. '
    }
}

for cat, niveis in d['talentos'].items():
    if isinstance(niveis, dict):
        for niv, lista in niveis.items():
            if isinstance(lista, list):
                for item in lista:
                    # Fix empty req dashes
                    if item['requisito'] == '' or item['requisito'] == '-' or item['requisito'] == '':
                        item['requisito'] = '—'
                        
                    nome = item['nome']
                    if nome in fixes:
                        fix = fixes[nome]
                        if not item['requisito'].endswith(fix['req_append'].strip()):
                            item['requisito'] += fix['req_append']
                            if item['efeito'].startswith(fix['ef_remove_prefix']):
                                item['efeito'] = item['efeito'][len(fix['ef_remove_prefix']):]
                            elif item['efeito'].startswith(fix['req_append'].strip()):
                                item['efeito'] = item['efeito'][len(fix['req_append'].strip()):].strip()
                                
                    # specific manual fix for Anatomia do Caos OCR garbage
                    if nome == 'Anatomia do Caos' and '(A cso eenta N3 P Vêaim' in item['efeito']:
                        item['efeito'] = item['efeito'].replace('(A cso eenta N3 P Vêaim', 'Ação (3 PE): Faça um')

with open('src/dados.json', 'w', encoding='utf-8') as f:
    json.dump(d, f, indent=4, ensure_ascii=False)

print("Applied final hardcoded fixes.")
