#!/usr/bin/env python3
"""Static site generator: data/posts.json -> HTML (Cyrillic at /, Latin at /lotin/), sitemap.xml, feed.xml."""
import hashlib, html, json, os, re, shutil, sys, urllib.request
from datetime import datetime, timezone, timedelta
from email.utils import format_datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from translit import to_latin, slugify

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://muslimceek.github.io"
TG = "https://t.me/turkiyada_uzbekla"
BOT = "https://t.me/istanbulda_ish_bot"
HANDLE, BRAND = "@turkiyada_uzbekla", "Туркияда ишлар"
IST = timezone(timedelta(hours=3))
PER_PAGE = 24
LP = "@@L@@"          # language path prefix, filled in per script version
MONTHS = "январь февраль март апрель май июнь июль август сентябрь октябрь ноябрь декабрь".split()
WARN = "Ишга жойлашиш учун ҳеч кимга пул тўламанг. Расмий ишлаш учун çalışma izni (иш рухсатномаси) керак."

CATS = {  # key: (name, slug, icon, description)
    "transport": ("Транспорт", "transport", "metro", "Истанбул метроси, Marmaray, автобуслар, йўл ёпилиши ва транспорт нархлари бўйича янгиликлар."),
    "obhavo": ("Об-ҳаво", "ob-havo", "sunrise", "Истанбул ва Туркия бўйича об-ҳаво маълумоти ва огоҳлантиришлар."),
    "narx": ("Нарх ва пул", "narxlar", "money-wings", "Туркияда нархлар, маошлар, инфляция, валюта курси ва ижара ҳақидаги янгиликлар."),
    "tadbir": ("Тадбирлар", "tadbirlar", "calendar", "Истанбулдаги концертлар, фестиваллар, кўргазмалар ва бепул тадбирлар."),
    "favqulodda": ("Огоҳлантириш", "ogohlantirish", "warning", "Зилзила, бўрон, кучли ёмғир ва бошқа фавқулодда ҳолатлар бўйича огоҳлантиришлар."),
    "turkiya": ("Туркия", "turkiya", "cityscape", "Бутун Туркия бўйича ҳаммага таъсир қиладиган янги қоидалар ва ўзгаришлар."),
    "hujjat": ("Ҳужжатлар", "hujjatlar", "passport-control", "Икамет, иш рухсатномаси (çalışma izni) ва чет элликлар учун қоидалар бўйича янгиликлар."),
    "sayohat": ("Саёҳат", "sayohat", "airplane", "Рейслар, авиачипталар ва Ўзбекистон–Туркия қатновлари ҳақидаги янгиликлар."),
}
LINKS = [
    ("e-İkamet", "Икамет (яшаш рухсатномаси) учун онлайн ариза ва узайтириш — Göç İdaresi тизими.", "https://e-ikamet.goc.gov.tr"),
    ("YİMER 157", "Чет элликлар учун алоқа маркази: икамет, виза ва ҳимоя масалалари бўйича маълумот.", "https://yimer.gov.tr"),
    ("e-İzin · çalışma izni", "Иш рухсатномаси аризалари тизими. Аризани одатда иш берувчи топширади.", "https://ecalismaizni.csgb.gov.tr"),
    ("e-Devlet", "Туркия давлат хизматларининг ягона онлайн портали.", "https://www.turkiye.gov.tr"),
    ("Metro İstanbul", "Метро, трамвай ва фуникулёр линиялари харитаси ҳамда иш вақти.", "https://www.metro.istanbul"),
    ("İBB", "Истанбул шаҳар ҳокимлиги: транспорт, тадбирлар ва шаҳар эълонлари.", "https://www.ibb.istanbul"),
]
FAQ = [
    ("«Туркияда ишлар» канали нима?",
     "Туркияда, асосан Истанбулда яшаётган ва ишлаётган ўзбеклар учун бепул Telegram канал. Ҳар куни шаҳар янгиликлари, нархлар, ҳужжатлар бўйича ўзгаришлар ва иш эълонлари ўзбек тилида чиқади."),
    ("Иш эълонлари қаердан олинади?",
     "Эълонлар Туркиядаги очиқ иш сайтларидан танлаб олинади ва ўзбек тилига қисқача таржима қилинади. Ҳар бир эълонда асл манбага ҳавола бор — ариза ўша ерда топширилади."),
    ("Ишга жойлашиш учун пул тўлаш керакми?",
     "Йўқ. Канал ҳам, сайт ҳам бепул. Ишга жойлаштириш учун олдиндан пул сўраганларга ишонманг. Расмий ишлаш учун çalışma izni (иш рухсатномаси) керак бўлади."),
    ("Янгиликлар қанчалик тез-тез чиқади?",
     "Ҳар куни соат 08:00 дан 22:00 гача (Истанбул вақти билан) 18 тагача пост чиқади: тахминан 12 та янгилик ва 6 та иш эълони."),
    ("Икамет ва иш рухсатномаси бўйича расмий маълумотни қаердан олиш мумкин?",
     "Икамет бўйича — Göç İdaresi'нинг e-İkamet тизими ва YİMER 157 алоқа маркази, иш рухсатномаси бўйича — e-İzin тизими. Ҳаволалар «Расмий хизматлар» бўлимида берилган."),
    ("Каналда реклама бериш мумкинми?",
     'Ҳа. Реклама бўйича админга ёзинг: <a href="https://t.me/Muslim_Ostanov" rel="noopener">@Muslim_Ostanov</a>.'),
]
TG_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" aria-hidden="true"><path d="M21.6 3.2 2.4 10.7c-.7.3-.7 1.2 0 1.4l4.9 1.6 1.9 6c.2.6.9.8 1.4.4l2.8-2.5 4.9 3.6c.6.4 1.4.1 1.5-.6l3-16.3c.1-.8-.6-1.4-1.2-1.1zM9.9 14.6l8-6.4-6.2 7.4-.3 3z"/></svg>'
CUR = ' aria-current="page"'

e = lambda s: html.escape(str(s), quote=True)

def load(name, default):
    try:
        return json.load(open(os.path.join(ROOT, "data", name), encoding="utf-8"))
    except (OSError, ValueError):
        return default

def when(p):
    return datetime.fromisoformat(p["date"]).astimezone(IST)

def day(d):
    return f"{d.day} {MONTHS[d.month - 1]} {d.year}"

def stamp(d):
    return f"{d.day} {MONTHS[d.month - 1]}, {d:%H:%M}"

def path_of(p):
    return f"/{'ish' if p['kind'] == 'job' else 'yangiliklar'}/{p['id']}-{slugify(p['title'])}/"

def cat_path(key):
    return f"/yangiliklar/{CATS[key][1]}/"

def summary(p):
    if p["kind"] == "news":
        return p["lead"]
    bits = [p["company"], p["place"], f"маош {p['salary']}" if p["salary"] else "", p["schedule"]]
    return "Иш эълони: " + ", ".join(b for b in bits if b) + "."

def img(p, eager=False):
    extra = 'fetchpriority="high"' if eager else 'loading="lazy" decoding="async"'
    return f'<img src="/img/p/{p["id"]}.jpg" alt="{e(p["title"])}" width="{p["w"]}" height="{p["h"]}" {extra}>'

# ---------- components ----------

def ncard(p, i=0):
    name = CATS[p["cat"]][0]
    return (f'<a class="ncard glass rv" style="--i:{i % 3}" href="{LP}{path_of(p)}"><div class="poster">{img(p)}</div>'
            f'<div><div class="meta"><span class="chip">{name}</span><time datetime="{p["date"]}">{stamp(when(p))}</time></div>'
            f'<h3>{e(p["title"])}</h3></div></a>')

def jcard(p, i=0):
    return (f'<a class="jcard glass rv" style="--i:{i % 3}" href="{LP}{path_of(p)}">'
            f'<div><div class="meta"><span class="chip red">Иш эълони</span><time datetime="{p["date"]}">{stamp(when(p))}</time></div>'
            f'<h3>{e(p["title"])}</h3><p class="co">{e(p["company"])}</p></div>'
            f'<div class="pay"><small>Маош</small><b>{e(p["salary"] or "Кўрсатилмаган")}</b></div>'
            f'<div class="kvs"><div class="kv"><small>Манзил</small>{e(p["place"] or "İstanbul")}</div>'
            f'<div class="kv"><small>Иш тартиби</small>{e(p["schedule"] or "—")}</div></div>'
            f'<span class="arrow">Батафсил</span></a>')

def cta():
    return (f'<section><div class="wrap"><div class="cta glass rv"><span class="chip">{HANDLE}</span>'
            f'<h2 class="h2">Янгиликни биринчи бўлиб <em>Telegram</em>\'да ўқинг</h2>'
            f'<p>Ҳар куни 08:00 дан 22:00 гача — Истанбул ва Туркия янгиликлари ҳамда иш эълонлари. Обуна бепул.</p>'
            f'<div class="acts" style="justify-content:center;margin-top:0"><a class="btn red" href="{TG}" rel="noopener">{TG_ICON}Каналга қўшилиш</a>'
            f'<a class="btn" href="{BOT}" rel="noopener">Ботдан савол сўраш</a></div></div></div></section>')

def head_block(chip, title, link=None, label=""):
    more = f'<a class="arrow" href="{LP}{link}">{label}</a>' if link else ""
    return f'<div class="head rv"><div><span class="chip">{chip}</span><h2 class="h2">{title}</h2></div>{more}</div>'

def crumbs(*items):
    lis = "".join(f'<li><a href="{LP}{href}">{name}</a></li>' for name, href in items)
    return f'<ol class="crumbs">{lis}</ol>'

def crumbs_ld(*items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": n + 1, "name": name, "item": SITE + LP + href} for n, (name, href) in enumerate(items)]}

ORG = {"@type": "Organization", "name": BRAND, "url": SITE + "/", "sameAs": [TG],
       "logo": {"@type": "ImageObject", "url": SITE + "/assets/icon-512.png"}}

# ---------- page shell ----------

CSS_V = ""
SITEMAP = []

def latinize(doc):
    parts = re.split(r'(\b(?:href|src)="[^"]*")', doc)
    return "".join(part if n % 2 else to_latin(part) for n, part in enumerate(parts))

def shell(path, title, desc, body, *, image="/assets/og.jpg", og_type="website", ld=(), current="", lastmod=None, index=True):
    file_page = path.endswith(".html")
    nav = [("Бош саҳифа", "/", "home"), ("Янгиликлар", "/yangiliklar/", "news"), ("Иш эълонлари", "/ish/", "jobs"),
           ("Фойдали", "/#foydali", ""), ("Савол-жавоб", "/#savollar", "")]
    menu = "".join(f'<a href="{LP}{href}"{CUR if key and key == current else ""}>{name}</a>' for name, href, key in nav)
    scripts = "".join('<script type="application/ld+json">' + json.dumps(x, ensure_ascii=False).replace("</", "<\\/") + "</script>" for x in ld)
    alt = "" if file_page else (f'<link rel="canonical" href="{SITE}{LP}{path}">'
                                f'<link rel="alternate" hreflang="uz-Cyrl" href="{SITE}{path}">'
                                f'<link rel="alternate" hreflang="uz-Latn" href="{SITE}/lotin{path}">'
                                f'<link rel="alternate" hreflang="x-default" href="{SITE}{path}">')
    doc = f"""<!doctype html>
<html lang="@@HTMLLANG@@">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="robots" content="{'index,follow,max-image-preview:large' if index else 'noindex'}">
{alt}
<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="{BRAND}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{SITE}{LP}{path}">
<meta property="og:image" content="{SITE}{image}">
<meta property="og:locale" content="uz_UZ">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#07080b">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="alternate" type="application/rss+xml" title="{BRAND}" href="/feed.xml">
<link rel="preload" href="/assets/fonts/onest-@@FONT@@.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css?v={CSS_V}">
<script>document.documentElement.classList.add('js')</script>
{scripts}
</head>
<body>
<a class="skip" href="#main">Асосий қисмга ўтиш</a>
<header class="nav"><div class="wrap nav-in">
<a class="logo" href="{LP}/" aria-label="{BRAND}"><i></i>{BRAND}</a>
<nav class="menu" aria-label="Асосий меню">{menu}</nav>
<div class="nav-r"><div class="lang">@@LANG@@</div>
<a class="btn red sm" href="{TG}" rel="noopener">{TG_ICON}Telegram</a>
<button class="burger" type="button" aria-label="Меню" aria-expanded="false"></button></div>
</div></header>
{body}
<footer><div class="wrap foot">
<div><a class="logo" href="{LP}/"><i></i>{BRAND}</a>
<p>Туркиядаги ўзбеклар учун янгиликлар ва иш эълонлари. Хабарлар Telegram каналдан олинади, манба ҳар бир хабарда кўрсатилган.</p></div>
<nav aria-label="Қуйи меню"><a href="{LP}/yangiliklar/">Янгиликлар</a><a href="{LP}/ish/">Иш эълонлари</a><a href="{TG}" rel="noopener">Telegram</a><a href="{BOT}" rel="noopener">Бот</a>
<a href="/feed.xml">RSS</a><a href="https://t.me/Muslim_Ostanov" rel="noopener">Реклама</a></nav>
</div></footer>
<script src="/assets/site.js?v={CSS_V}" defer></script>
</body>
</html>
"""
    versions = [("", "uz-Cyrl", "cyrillic", f'<span>Кирилл</span><a href="/lotin{"/" if file_page else path}" lang="uz-Latn">Lotin</a>')]
    if not file_page:
        versions.append(("/lotin", "uz-Latn", "latin", f'<a href="{path}" lang="uz-Cyrl">Кирилл</a><span>Lotin</span>'))
        if index:
            SITEMAP.append((path, lastmod))
    for prefix, lang, font, switch in versions:
        out = latinize(doc) if prefix else doc
        out = out.replace(LP, prefix).replace("@@HTMLLANG@@", lang).replace("@@FONT@@", font).replace("@@LANG@@", switch)
        dest = os.path.join(ROOT, (prefix + path).lstrip("/"))
        if not file_page:
            dest = os.path.join(dest, "index.html")
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        open(dest, "w", encoding="utf-8").write(out)

# ---------- pages ----------

def home(posts, meta):
    news = [p for p in posts if p["kind"] == "news"]
    jobs = [p for p in posts if p["kind"] == "job"]
    newest = when(posts[0]).date().isoformat() if posts else None
    rates = meta.get("rates") or {}
    fmt = lambda v: str(v).replace(".", ",")

    front = [x for x in (jobs[:1] + news[1:2] + news[:1]) if x]
    stack = "".join(f'<a href="{LP}{path_of(p)}" aria-label="{e(p["title"])}">{img(p, eager=p is front[-1])}</a>' for p in front)
    pin = ""
    if jobs and jobs[0]["salary"]:
        j = jobs[0]
        pin = (f'<a class="pin glass" href="{LP}{path_of(j)}"><small>Сўнгги иш эълони</small><b>{e(j["salary"])}</b>'
               f'<span>{e(j["title"].split(" (")[0])} · {e(j["place"].split(", ")[-1])}</span></a>')
    stats = [("Обуначилар", e(meta.get("subscribers", "")), ""), ("Кунига пост", "18", ""),
             ("1 доллар", f'<span data-rate="USD">{fmt(rates.get("USD", "—"))}</span>', "<i>₺</i>")]
    stats_html = "".join(f'<div class="stat glass"><small>{k}</small><b>{v}{unit}</b></div>' for k, v, unit in stats if v)
    words = ["Транспорт", "Маошлар", "Икамет", "Иш эълонлари", "Об-ҳаво", "Нархлар", "Çalışma izni", "Тадбирлар", "Валюта курси", "Рейслар"]
    marq = "".join(f"<span>{w}</span>" for w in words)

    feature = ""
    if news:
        f = news[0]
        feature = (f'<a class="feature glass rv" href="{LP}{path_of(f)}"><div class="poster">{img(f)}</div><div class="feature-b">'
                   f'<div class="meta"><span class="chip">{CATS[f["cat"]][0]}</span><time datetime="{f["date"]}">{stamp(when(f))}</time></div>'
                   f'<h3>{e(f["title"])}</h3><p>{e(f["lead"])}</p><span class="arrow">Батафсил ўқиш</span></div></a>')
    rest = news[1:7]
    rest = rest[:len(rest) // 3 * 3] or rest
    job_tile = (f'<a class="jcard glass rv" style="--i:2" href="{TG}" rel="noopener"><div><span class="chip">Ҳар куни</span>'
                f'<h3>Янги эълонлар биринчи бўлиб каналда чиқади</h3>'
                f'<p class="co">Кунига 6 тагача иш эълони — маоши, манзили ва иш тартиби билан.</p></div>'
                f'<span class="btn red" style="margin-top:auto">{TG_ICON}Каналда кўриш</span></a>')
    counts = {k: sum(p["cat"] == k for p in news) for k in CATS}
    cats = (f'<a class="cat glass rv" href="{LP}/ish/"><img src="/assets/icons/handshake.webp" alt="" width="60" height="60" loading="lazy">'
            f'<div><b>Иш эълонлари</b><small>{len(jobs)} та эълон</small></div></a>')
    for n, k in enumerate(sorted((k for k in CATS if counts[k]), key=lambda k: -counts[k])):
        cats += (f'<a class="cat glass rv" style="--i:{(n + 1) % 4}" href="{LP}{cat_path(k)}"><img src="/assets/icons/{CATS[k][2]}.webp" alt="" width="60" height="60" loading="lazy">'
                 f'<div><b>{CATS[k][0]}</b><small>{counts[k]} та хабар</small></div></a>')
    links = "".join(f'<a class="lnk glass rv" style="--i:{n % 3}" href="{url}" rel="noopener" target="_blank"><b>{name}</b><p>{text}</p>'
                    f'<small>{url.split("//")[1].removeprefix("www.")}</small></a>' for n, (name, text, url) in enumerate(LINKS))
    faq = "".join(f"<details{' open' if n == 0 else ''}><summary>{q}</summary><p>{a}</p></details>" for n, (q, a) in enumerate(FAQ))

    body = f"""<main id="main">
<section class="hero"><div class="wrap hero-in">
<div>
<span class="chip">Истанбулдаги ўзбеклар учун</span>
<h1 class="display">Туркияда <em>иш</em> ва янгиликлар — ўзбек тилида</h1>
<p class="lede">Истанбулдаги иш эълонлари, транспорт, нархлар, икамет ва ҳужжатлар бўйича энг муҳим хабарлар. Ҳар куни, бепул.</p>
<div class="hero-cta"><a class="btn" href="{LP}/ish/">Иш эълонларини кўриш</a><a class="btn red" href="{TG}" rel="noopener">{TG_ICON}Каналга обуна бўлиш</a></div>
<div class="stats">{stats_html}</div>
</div>
<div class="stack"><div class="moon"></div>{stack}{pin}</div>
</div>
<div class="marq" aria-hidden="true"><div class="marq-t">{marq}{marq}</div></div>
</section>

<section><div class="wrap"><p class="say rv">Туркия матбуотидаги <em>энг муҳим янгиликлар</em> ва Истанбулдаги <em>иш эълонлари</em>ни ҳар куни ўзбек тилида жамлаймиз.</p></div></section>

<section id="yangiliklar"><div class="wrap">
{head_block("Янгиликлар", "Сўнгги янгиликлар", "/yangiliklar/", "Барча янгиликлар")}
{feature}
<div class="grid3">{"".join(ncard(p, i) for i, p in enumerate(rest))}</div>
</div></section>

<section id="ish"><div class="wrap">
{head_block("Иш", "Истанбулдаги иш эълонлари", "/ish/", "Барча эълонлар")}
<div class="grid3">{"".join(jcard(p, i) for i, p in enumerate(jobs[:5]))}{job_tile}</div>
</div></section>

<section><div class="wrap">
{head_block("Мавзулар", "Мавзу бўйича ўқинг")}
<div class="cats">{cats}</div>
</div></section>

<section id="foydali"><div class="wrap">
{head_block("Фойдали", "Расмий хизматлар ва ҳаволалар")}
<div class="links">{links}</div>
<p class="note rv">Фавқулодда ҳолатда 112 рақамига қўнғироқ қилинг. {WARN}</p>
</div></section>

<section id="savollar"><div class="wrap faq">
<div class="faq-l rv"><span class="chip">Савол-жавоб</span><h2 class="h2">Кўп сўраладиган саволлар</h2>
<p>Жавоб топилмадими? Ёрдамчи ботга ёзинг — у ўзбекча, русча ва туркча жавоб беради.</p>
<a class="btn" href="{BOT}" rel="noopener">Ботдан сўраш</a></div>
<div class="rv">{faq}</div>
</div></section>
{cta()}
</main>"""
    strip = lambda s: re.sub(r"<[^>]+>", "", s)
    ld = [{"@context": "https://schema.org", "@type": "WebSite", "name": BRAND, "url": SITE + LP + "/",
           "inLanguage": "uz", "publisher": ORG},
          {"@context": "https://schema.org", **ORG},
          {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
              {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": strip(a)}} for q, a in FAQ]}]
    shell("/", "Туркияда иш ва янгиликлар ўзбек тилида | Туркияда ишлар",
          "Истанбул ва Туркиядаги иш эълонлари, маошлар, транспорт, нархлар, икамет ва иш рухсатномаси бўйича кундалик янгиликлар — ўзбек тилида, бепул.",
          body, ld=ld, current="home", lastmod=newest)

def listing(base, items, card, *, title, h1, sub, current, crumb, chips="", note=""):
    pages = max(1, -(-len(items) // PER_PAGE))
    for n in range(1, pages + 1):
        path = base if n == 1 else f"{base}sahifa/{n}/"
        chunk = items[(n - 1) * PER_PAGE:n * PER_PAGE]
        grid = "".join(card(p, i) for i, p in enumerate(chunk)) or '<p class="empty">Ҳозирча хабар йўқ.</p>'
        pager = ""
        if pages > 1:
            pager = '<nav class="pager" aria-label="Саҳифалар">' + "".join(
                f'<a class="chip plain" href="{LP}{base if k == 1 else f"{base}sahifa/{k}/"}"{CUR if k == n else ""}>{k}</a>'
                for k in range(1, pages + 1)) + "</nav>"
        body = (f'<main id="main" class="page"><div class="wrap">{crumbs(*crumb)}<h1 class="title">{h1}</h1><p class="sub">{sub}</p>'
                f'{chips or "<div class=chips></div>"}{note}<div class="grid3">{grid}</div>{pager}</div>{cta()}</main>')
        suffix = f" — {n}-саҳифа" if n > 1 else ""
        shell(path, f"{title}{suffix} | {BRAND}", sub, body, current=current, ld=[crumbs_ld(*crumb)],
              lastmod=when(items[0]).date().isoformat() if items else None)

def news_pages(news):
    counts = {k: sum(p["cat"] == k for p in news) for k in CATS}
    def chips(active):
        out = f'<a class="chip plain" href="{LP}/yangiliklar/"{CUR if not active else ""}>Барчаси</a>'
        for k in CATS:
            if counts[k]:
                out += f'<a class="chip plain" href="{LP}{cat_path(k)}"{CUR if k == active else ""}>{CATS[k][0]} · {counts[k]}</a>'
        return f'<div class="chips">{out}</div>'
    home_c, news_c = ("Бош саҳифа", "/"), ("Янгиликлар", "/yangiliklar/")
    listing("/yangiliklar/", news, ncard, title="Истанбул ва Туркия янгиликлари ўзбек тилида", h1="Янгиликлар",
            sub="Истанбул ва Туркиядаги энг муҳим хабарлар: транспорт, нархлар, об-ҳаво, ҳужжатлар ва янги қоидалар — ўзбек тилида.",
            current="news", crumb=[home_c, news_c], chips=chips(None))
    for k, (name, slug, _, desc) in CATS.items():
        if counts[k]:
            listing(cat_path(k), [p for p in news if p["cat"] == k], ncard, title=f"{name} — Истанбул ва Туркия янгиликлари",
                    h1=name, sub=desc, current="news", crumb=[home_c, news_c, (name, cat_path(k))], chips=chips(k))

def job_pages(jobs):
    listing("/ish/", jobs, jcard, title="Истанбулда иш эълонлари — маоши кўрсатилган вакансиялар", h1="Истанбулда иш эълонлари",
            sub="Истанбулдаги янги вакансиялар ўзбек тилида: маош, манзил ва иш тартиби билан. Ариза асл манбада топширилади.",
            current="jobs", crumb=[("Бош саҳифа", "/"), ("Иш эълонлари", "/ish/")],
            note=f'<p class="note" style="margin:0 0 28px">{WARN}</p>')

def post_page(p, posts):
    d = when(p)
    path = path_of(p)
    tg_link = f"{TG}/{p['id']}"
    poster = f'<aside><a class="poster" href="/img/p/{p["id"]}.jpg" style="display:block">{img(p, eager=True)}</a></aside>'
    share = '<button class="btn" type="button" data-share data-done="Ҳавола нусхаланди">Улашиш</button>'
    same = [x for x in posts if x["kind"] == p["kind"] and x["id"] != p["id"]]
    if p["kind"] == "news":
        name = CATS[p["cat"]][0]
        trail = [("Бош саҳифа", "/"), ("Янгиликлар", "/yangiliklar/"), (name, cat_path(p["cat"]))]
        facts = "".join(f"<li>{e(x)}</li>" for x in p["facts"])
        main = (f'<div class="meta"><a class="chip" href="{LP}{cat_path(p["cat"])}">{name}</a><time datetime="{p["date"]}">{day(d)}, {d:%H:%M}</time></div>'
                f'<h1>{e(p["title"])}</h1><p class="lead">{e(p["lead"])}</p>'
                + (f'<ul class="facts">{facts}</ul>' if facts else "") +
                f'<div class="acts"><a class="btn red" href="{tg_link}" rel="noopener">{TG_ICON}Telegram\'да очиш</a>'
                + (f'<a class="btn" href="{e(p["link"])}" rel="noopener" target="_blank">Манбада тўлиқ ўқиш</a>' if p["link"] else "") + share + "</div>"
                + (f'<p class="src">Манба: {e(p["source"])}</p>' if p.get("source") else ""))
        related = sorted(same, key=lambda x: (x["cat"] != p["cat"], -x["id"]))[:3]
        more = head_block("Янгиликлар", "Яна ўқинг", "/yangiliklar/", "Барча янгиликлар") + f'<div class="grid3">{"".join(ncard(x, i) for i, x in enumerate(related))}</div>'
        title, og_type = f"{p['title']} | {BRAND}", "article"
        ld = [{"@context": "https://schema.org", "@type": "NewsArticle", "headline": p["title"][:110], "description": p["lead"],
               "image": [f"{SITE}/img/p/{p['id']}.jpg"], "datePublished": d.isoformat(), "dateModified": d.isoformat(),
               "inLanguage": "uz", "articleSection": name, "author": ORG, "publisher": ORG,
               "mainEntityOfPage": SITE + LP + path}, crumbs_ld(*trail)]
    else:
        trail = [("Бош саҳифа", "/"), ("Иш эълонлари", "/ish/")]
        points = "".join(f"<li>{e(x)}</li>" for x in p["points"])
        main = (f'<div class="meta"><span class="chip red">Иш эълони</span><time datetime="{p["date"]}">{day(d)}, {d:%H:%M}</time></div>'
                f'<h1>{e(p["title"])}</h1><div class="job-top"><div class="pay"><small>Маош</small><b>{e(p["salary"] or "Кўрсатилмаган")}</b></div>'
                f'<div class="kvs"><div class="kv"><small>Компания</small>{e(p["company"])}</div><div class="kv"><small>Манзил</small>{e(p["place"] or "İstanbul")}</div></div>'
                + (f'<div class="kv"><small>Иш тартиби</small>{e(p["schedule"])}</div>' if p["schedule"] else "") + "</div>"
                + (f'<ul class="facts">{points}</ul>' if points else "") + f'<p class="note">{WARN}</p>'
                f'<div class="acts">' + (f'<a class="btn red" href="{e(p["link"])}" rel="noopener nofollow" target="_blank">Эълонни очиш ва ариза топшириш</a>' if p["link"] else "")
                + f'<a class="btn" href="{tg_link}" rel="noopener">{TG_ICON}Telegram\'да очиш</a>{share}</div>'
                f'<p class="src">Эълон {day(d)} куни чиққан. Долзарблигини манбада текширинг.</p>')
        related = same[:3]
        more = head_block("Иш", "Бошқа иш эълонлари", "/ish/", "Барча эълонлар") + f'<div class="grid3">{"".join(jcard(x, i) for i, x in enumerate(related))}</div>'
        extra = ", ".join(x for x in (p["place"], p["salary"]) if x)
        title, og_type = f"{p['title']}{' — ' + extra if extra else ''} | {BRAND}", "article"
        ld = [crumbs_ld(*trail)]
    body = (f'<main id="main" class="page"><div class="wrap">{crumbs(*trail)}<article class="article"><div>{main}</div>{poster}</article>'
            + (f'<section class="more">{more}</section>' if related else "") + f"</div>{cta()}</main>")
    shell(path, title, summary(p)[:300], body, image=f"/img/p/{p['id']}.jpg", og_type=og_type, ld=ld,
          current="jobs" if p["kind"] == "job" else "news", lastmod=d.date().isoformat())

def not_found():
    body = ('<main id="main" class="page"><div class="wrap" style="text-align:center;padding-block:8vh"><span class="chip">404</span>'
            '<h1 class="title" style="margin-top:18px">Саҳифа топилмади</h1><p class="sub" style="margin-inline:auto">Ҳавола эскирган ёки нотўғри ёзилган бўлиши мумкин.</p>'
            '<div class="acts" style="justify-content:center"><a class="btn red" href="/">Бош саҳифа</a><a class="btn" href="/yangiliklar/">Янгиликлар</a><a class="btn" href="/ish/">Иш эълонлари</a></div></div></main>')
    shell("/404.html", f"Саҳифа топилмади | {BRAND}", "Саҳифа топилмади.", body, index=False)

# ---------- feeds and static files ----------

def write(name, text):
    open(os.path.join(ROOT, name), "w", encoding="utf-8").write(text)

def feeds(posts):
    today = datetime.now(IST).date().isoformat()
    urls = "".join(f"<url><loc>{SITE}{prefix}{path}</loc><lastmod>{lastmod or today}</lastmod></url>\n"
                   for path, lastmod in SITEMAP for prefix in ("", "/lotin"))
    write("sitemap.xml", f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')
    write("robots.txt", f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")
    items = "".join(
        f"<item><title>{e(p['title'])}</title><link>{SITE}{path_of(p)}</link><guid isPermaLink=\"true\">{SITE}{path_of(p)}</guid>"
        f"<pubDate>{format_datetime(when(p))}</pubDate><description>{e(summary(p))}</description>"
        f"<enclosure url=\"{SITE}/img/p/{p['id']}.jpg\" type=\"image/jpeg\" length=\"{os.path.getsize(os.path.join(ROOT, 'img', 'p', str(p['id']) + '.jpg'))}\"/></item>\n"
        for p in posts[:40])
    write("feed.xml", f'<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>'
          f"<title>{BRAND} — Туркияда иш ва янгиликлар</title><link>{SITE}/</link>"
          f'<atom:link href="{SITE}/feed.xml" rel="self" type="application/rss+xml"/>'
          f"<description>Истанбул ва Туркия янгиликлари ҳамда иш эълонлари ўзбек тилида.</description><language>uz</language>\n{items}</channel></rss>\n")
    write("site.webmanifest", json.dumps({"name": BRAND, "short_name": BRAND, "start_url": "/", "display": "standalone",
          "background_color": "#07080b", "theme_color": "#07080b",
          "icons": [{"src": "/assets/icon-512.png", "sizes": "512x512", "type": "image/png"}]}, ensure_ascii=False))
    write(".nojekyll", "")

def rates(meta):
    try:
        with urllib.request.urlopen("https://open.er-api.com/v6/latest/TRY", timeout=15) as r:
            x = json.loads(r.read())["rates"]
        meta["rates"] = {"USD": f"{1 / x['USD']:.2f}", "EUR": f"{1 / x['EUR']:.2f}", "UZS": f"{x['UZS']:.1f}"}
        json.dump(meta, open(os.path.join(ROOT, "data", "meta.json"), "w", encoding="utf-8"), ensure_ascii=False)
    except Exception as err:
        print("rates:", err, file=sys.stderr)

def main():
    global CSS_V
    posts = load("posts.json", [])
    meta = load("meta.json", {})
    rates(meta)
    blob = b"".join(open(os.path.join(ROOT, "assets", f), "rb").read() for f in ("site.css", "site.js"))
    CSS_V = hashlib.md5(blob).hexdigest()[:8]
    for d in ("yangiliklar", "ish", "lotin"):
        shutil.rmtree(os.path.join(ROOT, d), ignore_errors=True)
    home(posts, meta)
    news_pages([p for p in posts if p["kind"] == "news"])
    job_pages([p for p in posts if p["kind"] == "job"])
    for p in posts:
        post_page(p, posts)
    not_found()
    feeds(posts)
    print(f"built {len(SITEMAP) * 2} pages from {len(posts)} posts")

if __name__ == "__main__":
    main()
