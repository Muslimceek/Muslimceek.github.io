#!/usr/bin/env python3
"""Pull posts from the public channel preview (t.me/s/...) into data/posts.json and img/p/.

  python3 tools/sync.py            # latest page only (new posts)
  python3 tools/sync.py --pages 8  # walk further back
"""
import html, io, json, os, re, sys, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHANNEL = "turkiyada_uzbekla"
POSTS = os.path.join(ROOT, "data", "posts.json")
META = os.path.join(ROOT, "data", "meta.json")
IMG = os.path.join(ROOT, "img", "p")
UA = {"User-Agent": "Mozilla/5.0"}
CATS = {"#транспорт": "transport", "#обҳаво": "obhavo", "#нархлар": "narx", "#тадбир": "tadbir",
        "#диққат": "favqulodda", "#Туркия": "turkiya", "#икамет": "hujjat", "#саёҳат": "sayohat"}

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return r.read()

def text_of(fragment):
    """Telegram message HTML -> plain text with newlines."""
    s = re.sub(r'<i class="emoji"[^>]*><b>(.*?)</b></i>', r"\1", fragment)
    s = re.sub(r"<tg-emoji[^>]*>(.*?)</tg-emoji>", r"\1", s, flags=re.S)
    s = re.sub(r"<br\s*/?>", "\n", s)
    s = re.sub(r"</?blockquote[^>]*>", "\n", s)
    return html.unescape(re.sub(r"<[^>]+>", "", s))

def field(lines, label):
    for line in lines:
        if label in line:
            return line.split(label, 1)[1].strip(" :")
    return ""

def parse(block):
    m = re.search(r'data-post="%s/(\d+)"' % CHANNEL, block)
    body = re.search(r'<div class="tgme_widget_message_text js-message_text"[^>]*>(.*?)</div>\s*<div class="tgme_widget_message_(?:footer|reactions)', block, re.S)
    when = re.search(r'<time datetime="([^"]+)"', block)
    photo = re.search(r"tgme_widget_message_photo_wrap[^>]*background-image:url\('([^']+)'\)", block)
    if not (m and body and when and photo):
        return None
    raw = body.group(1)
    quote = re.search(r"<blockquote[^>]*>(.*?)</blockquote>", raw, re.S)
    bolds = [text_of(b).strip() for b in re.findall(r"<b>(.*?)</b>", re.sub(r'<i class="emoji"[^>]*><b>.*?</b></i>', "", raw), re.S)]
    lines = [l.strip() for l in text_of(raw).split("\n") if l.strip()]
    button = re.search(r'tgme_widget_message_inline_button url_button" href="([^"]+)"', block)
    link = html.unescape(button.group(1)) if button else ""
    tags = re.findall(r"#[\wўқғҳЎҚҒҲ]+", lines[-1]) if lines else []
    post = {"id": int(m.group(1)), "date": when.group(1), "photo": html.unescape(photo.group(1)), "link": link}
    if "#иш" in tags and "ИШ ЭЪЛОНИ" in lines[0]:
        title = next((b for b in bolds if b != "ИШ ЭЪЛОНИ"), "")
        points = [l.lstrip("✅ ").strip() for l in text_of(quote.group(1)).split("\n") if l.strip()] if quote else []
        post.update(kind="job", title=title, company=field(lines, "Компания:"), place=field(lines, "Манзил:"),
                    salary=field(lines, "Маош:"), schedule=field(lines, "Иш тартиби:"), points=points)
    elif "#янгилик" in tags and quote and bolds:
        src = re.search(r'Манба:\s*<a href="([^"]+)"[^>]*>([^<]+)</a>', raw)
        post.update(kind="news", title=bolds[0], cat=next((CATS[t] for t in tags if t in CATS), "turkiya"),
                    lead=text_of(quote.group(1)).strip(),
                    facts=[l.lstrip("▫️ ").strip() for l in lines if l.startswith("▫")],
                    link=html.unescape(src.group(1)) if src else link, source=src.group(2).strip() if src else "")
    else:
        return None
    if not post["title"] or not re.search(r"[а-яўқғҳ]", post["title"].lower()):
        return None
    return post

def save_photo(post):
    path = os.path.join(IMG, f"{post['id']}.jpg")
    if not os.path.exists(path):
        img = Image.open(io.BytesIO(get(post["photo"]))).convert("RGB")
        img.thumbnail((880, 1100))
        img.save(path, "JPEG", quality=84, optimize=True, progressive=True)
    with Image.open(path) as img:
        post["w"], post["h"] = img.size
    del post["photo"]

def main():
    pages = int(sys.argv[sys.argv.index("--pages") + 1]) if "--pages" in sys.argv else 1
    os.makedirs(IMG, exist_ok=True)
    os.makedirs(os.path.dirname(POSTS), exist_ok=True)
    try:
        posts = {p["id"]: p for p in json.load(open(POSTS, encoding="utf-8"))}
    except (OSError, ValueError):
        posts = {}
    before, added, meta = None, 0, {}
    for _ in range(pages):
        page = get(f"https://t.me/s/{CHANNEL}" + (f"?before={before}" if before else "")).decode("utf-8")
        if not meta:
            subs = re.search(r'counter_value">([^<]+)</span>\s*<span class="counter_type">subscribers', page)
            if subs:
                meta = {"subscribers": subs.group(1).strip()}
        blocks = page.split('<div class="tgme_widget_message_wrap')[1:]
        ids = [int(i) for i in re.findall(r'data-post="%s/(\d+)"' % CHANNEL, page)]
        if not ids:
            break
        for block in blocks:
            post = parse(block)
            if post and post["id"] not in posts:
                try:
                    save_photo(post)
                except Exception as e:
                    print(f"photo {post['id']}: {e}", file=sys.stderr)
                    continue
                posts[post["id"]] = post
                added += 1
        before = min(ids)
    out = sorted(posts.values(), key=lambda p: p["id"], reverse=True)
    json.dump(out, open(POSTS, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    if meta:
        json.dump(meta, open(META, "w", encoding="utf-8"), ensure_ascii=False)
    print(f"{added} new, {len(out)} total ({sum(p['kind'] == 'job' for p in out)} jobs), subscribers: {meta.get('subscribers')}")

if __name__ == "__main__":
    main()
