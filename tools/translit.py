"""Uzbek Cyrillic -> Latin (official 1995 alphabet) and ASCII slugs."""
import re

MAP = {"а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo", "ж": "j", "з": "z", "и": "i",
       "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t",
       "у": "u", "ф": "f", "х": "x", "ц": "s", "ч": "ch", "ш": "sh", "щ": "sh", "ъ": "ʼ", "ы": "i", "ь": "",
       "э": "e", "ю": "yu", "я": "ya", "ў": "oʻ", "қ": "q", "ғ": "gʻ", "ҳ": "h"}
VOWELS = set("аеёиоуэюяўыъь")
CYR = re.compile(r"[А-Яа-яЁёЎўҚқҒғҲҳ]+")

def _word(m):
    w = m.group(0)
    caps = len(w) > 1 and w.isupper()
    out = []
    for i, ch in enumerate(w):
        low = ch.lower()
        prev = w[i - 1].lower() if i else ""
        lat = MAP[low]
        if low == "е" and (not prev or prev in VOWELS):
            lat = "ye"
        elif low == "ц" and prev and prev in VOWELS:
            lat = "ts"
        if ch != low and lat:
            lat = lat.upper() if caps else lat[0].upper() + lat[1:]
        out.append(lat)
    return "".join(out)

def to_latin(text):
    return CYR.sub(_word, text)

ASCII = str.maketrans({"ı": "i", "İ": "i", "ş": "s", "Ş": "s", "ç": "c", "Ç": "c", "ğ": "g", "Ğ": "g",
                       "ö": "o", "Ö": "o", "ü": "u", "Ü": "u", "ʻ": "", "ʼ": "", "'": "", "’": ""})

def slugify(text, limit=60):
    s = to_latin(text).translate(ASCII).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:limit].rsplit("-", 1)[0] if len(s) > limit else s
