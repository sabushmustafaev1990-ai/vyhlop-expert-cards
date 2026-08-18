#!/usr/bin/env python3
# Копирует картинки из cards/ в отдельную папку с латинскими именами
# и пишет соответствие в data/картинки.json — оттуда build_price.py берёт ссылки.
# Латиница нужна, потому что кириллица в URL превращается в нечитаемые %D0%B2%D1%8B...

import json
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "cards")
DST = os.path.join(ROOT, "cards-public")

ТАБЛИЦА = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya',
}


def латиница(имя):
    return ''.join(ТАБЛИЦА.get(c, c) for c in имя.lower())


shutil.rmtree(DST, ignore_errors=True)
os.makedirs(DST)

карта = {}
for файл in sorted(os.listdir(SRC)):
    if not файл.endswith('.png'):
        continue
    ключ = файл[:-4]
    новое = латиница(ключ) + '.png'
    shutil.copy2(os.path.join(SRC, файл), os.path.join(DST, новое))
    карта[ключ] = новое

with open(os.path.join(ROOT, 'data', 'картинки.json'), 'w', encoding='utf-8') as f:
    json.dump(карта, f, ensure_ascii=False, indent=2)

print(f'Скопировано {len(карта)} картинок в cards-public/')
for k, v in карта.items():
    print(f'  {k} -> {v}')
