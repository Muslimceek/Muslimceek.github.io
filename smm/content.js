// Shared content for the bot (Deno) and the Mini App (browser). Pure data and pure functions only.
// The Mini App gets a copy of this file at deploy time (tools/deploy.sh).

export const LANGS = ["uz", "ru", "tr"];
export const LANG_NAMES = { uz: "O'zbekcha", ru: "Русский", tr: "Türkçe" };

export const CONTACTS = {
  telegram: "https://t.me/Muslim_Ostanov",
  telegramHandle: "@Muslim_Ostanov",
  channel: "https://t.me/SMM_TARGET_trk",
  channelHandle: "@SMM_TARGET_trk",
  instagram: "https://instagram.com/muslim_ameen",
  instagramHandle: "@muslim_ameen",
};

export function pickLang(code) {
  const c = String(code || "").toLowerCase().slice(0, 2);
  if (c === "uz") return "uz";
  if (c === "tr") return "tr";
  return "ru";
}

// ---------- Option lists (key + label in three languages) ----------
const o = (key, ru, uz, tr) => ({ key, ru, uz, tr });

export const OPTIONS = {
  contact_type: [
    o("telegram", "Telegram", "Telegram", "Telegram"),
    o("whatsapp", "WhatsApp", "WhatsApp", "WhatsApp"),
    o("phone", "Звонок", "Qo'ng'iroq", "Telefon"),
  ],
  niche: [
    o("clothing_retail", "Магазин одежды", "Kiyim do'koni", "Giyim mağazası"),
    o("clothing_wholesale", "Опт одежды", "Ulgurji kiyim", "Toptan giyim"),
    o("education", "Учёба в Турции", "Turkiyada o'qish", "Türkiye'de eğitim"),
    o("ikamet", "Икамет и документы", "Ikamet va hujjatlar", "İkamet ve evrak"),
    o("marketplace", "Маркетплейс, онлайн-магазин", "Marketpleys, onlayn do'kon", "Pazaryeri, online mağaza"),
    o("realty", "Недвижимость", "Ko'chmas mulk", "Gayrimenkul"),
    o("other", "Другое", "Boshqa", "Diğer"),
  ],
  services: [
    o("instagram", "Ведение Instagram", "Instagram yuritish", "Instagram yönetimi"),
    o("reels", "Reels под ключ", "Reels: g'oyadan montajgacha", "Reels: fikirden kurguya"),
    o("target", "Таргет в Instagram и Facebook", "Target reklama (Meta)", "Meta reklamları"),
    o("ai_video", "AI-видео", "AI-video", "AI video"),
    o("website", "Сайт или лендинг", "Sayt yoki lending", "Web sitesi, landing"),
    o("identity", "Айдентика", "Brend uslubi", "Kurumsal kimlik"),
    o("unsure", "Не знаю, посоветуйте", "Bilmayman, maslahat bering", "Emin değilim, siz önerin"),
  ],
  goal: [
    o("leads", "Заявки", "Murojaatlar", "Talep ve mesaj"),
    o("sales", "Продажи", "Sotuv", "Satış"),
    o("launch", "Запуск с нуля", "Noldan boshlash", "Sıfırdan başlangıç"),
    o("awareness", "Узнаваемость", "Taniqlilik", "Bilinirlik"),
  ],
  sources: [
    o("instagram", "Instagram без рекламы", "Instagram (reklamasiz)", "Instagram (reklamsız)"),
    o("ads", "Реклама", "Reklama", "Reklam"),
    o("referrals", "Сарафан, знакомые", "Tanish-bilishlar", "Tavsiye, çevre"),
    o("offline", "Проходят мимо магазина", "Do'kon oldidan o'tganlar", "Mağaza önünden geçenler"),
    o("telegram", "Telegram", "Telegram", "Telegram"),
    o("marketplace", "Маркетплейсы", "Marketpleyslar", "Pazaryerleri"),
    o("none", "Пока клиентов нет", "Hozircha mijoz yo'q", "Henüz müşteri yok"),
  ],
  leads_pm: [
    o("lt10", "до 10", "10 tagacha", "10'a kadar"),
    o("10_30", "10–30", "10–30", "10–30"),
    o("30_100", "30–100", "30–100", "30–100"),
    o("100p", "больше 100", "100 dan ko'p", "100'den fazla"),
    o("unknown", "Не считаю", "Hisoblamayman", "Saymıyorum"),
  ],
  budget: [
    o("none", "Пока без бюджета", "Hozircha byudjet yo'q", "Şimdilik bütçe yok"),
    o("lt300", "до $300", "$300 gacha", "$300'a kadar"),
    o("300_1000", "$300–1000", "$300–1000", "$300–1000"),
    o("1000_3000", "$1000–3000", "$1000–3000", "$1000–3000"),
    o("3000p", "от $3000", "$3000 dan yuqori", "$3000 ve üzeri"),
    o("unknown", "Не знаю, подскажите", "Bilmayman, maslahat bering", "Bilmiyorum, siz önerin"),
  ],
  start: [
    o("now", "Сразу", "Hoziroq", "Hemen"),
    o("2w", "В течение 2 недель", "2 hafta ichida", "2 hafta içinde"),
    o("month", "В течение месяца", "Bir oy ichida", "Bir ay içinde"),
    o("later", "Пока присматриваюсь", "Hozircha o'rganyapman", "Şimdilik araştırıyorum"),
  ],
  status: [
    o("new", "Новая", "Yangi", "Yeni"),
    o("in_progress", "В работе", "Ishda", "İşlemde"),
    o("agreed", "Договорились", "Kelishildi", "Anlaşıldı"),
    o("declined", "Отказ", "Rad etildi", "Olmadı"),
  ],
};

export const MULTI_FIELDS = ["services", "sources"];
export const CHOICE_FIELDS = ["contact_type", "niche", "goal", "leads_pm", "budget", "start"];
export const TEXT_FIELDS = { name: 80, contact: 80, business: 300, instagram: 120, audience: 400, geo: 120, comment: 500 };

export function optLabel(field, key, lang) {
  const opt = (OPTIONS[field] || []).find((x) => x.key === key);
  return opt ? opt[lang] || opt.ru : String(key ?? "");
}
export function optLabels(field, keys, lang) {
  return (Array.isArray(keys) ? keys : keys ? [keys] : []).map((k) => optLabel(field, k, lang)).join(", ");
}

// Keeps only known fields, trims text, drops unknown option keys. Never throws on odd input.
export function cleanBrief(raw) {
  const d = {};
  const src = raw && typeof raw === "object" ? raw : {};
  for (const [f, max] of Object.entries(TEXT_FIELDS)) {
    if (typeof src[f] === "string" || typeof src[f] === "number") {
      const v = String(src[f]).replace(/\s+/g, " ").trim().slice(0, max);
      if (v) d[f] = v;
    }
  }
  for (const f of CHOICE_FIELDS) {
    if (OPTIONS[f].some((x) => x.key === src[f])) d[f] = src[f];
  }
  for (const f of MULTI_FIELDS) {
    const arr = Array.isArray(src[f]) ? src[f] : typeof src[f] === "string" ? [src[f]] : [];
    const ok = [...new Set(arr.filter((k) => OPTIONS[f].some((x) => x.key === k)))];
    if (ok.length) d[f] = ok;
  }
  return d;
}

// ---------- Field labels (summary screens, admin card) ----------
export const FIELD_LABELS = {
  name: { ru: "Имя", uz: "Ism", tr: "İsim" },
  contact: { ru: "Контакт", uz: "Aloqa", tr: "İletişim" },
  business: { ru: "Бизнес", uz: "Biznes", tr: "İşletme" },
  niche: { ru: "Ниша", uz: "Soha", tr: "Sektör" },
  instagram: { ru: "Instagram", uz: "Instagram", tr: "Instagram" },
  services: { ru: "Услуга", uz: "Xizmat", tr: "Hizmet" },
  goal: { ru: "Цель", uz: "Maqsad", tr: "Hedef" },
  audience: { ru: "Клиенты", uz: "Mijozlar", tr: "Müşteriler" },
  geo: { ru: "Страна, город", uz: "Davlat, shahar", tr: "Ülke, şehir" },
  sources: { ru: "Откуда клиенты", uz: "Mijozlar qayerdan", tr: "Müşteri kaynağı" },
  leads_pm: { ru: "Заявок в месяц", uz: "Oyiga murojaat", tr: "Aylık talep" },
  budget: { ru: "Бюджет на рекламу", uz: "Reklama byudjeti", tr: "Reklam bütçesi" },
  start: { ru: "Старт", uz: "Boshlash", tr: "Başlangıç" },
  comment: { ru: "Комментарий", uz: "Izoh", tr: "Not" },
};

// Returns [[label, value], ...] for a filled brief, in the given language.
export function briefRows(data, lang) {
  const d = data || {};
  const rows = [];
  const add = (f, v) => { if (v) rows.push([FIELD_LABELS[f][lang] || FIELD_LABELS[f].ru, v]); };
  add("name", d.name);
  add("contact", d.contact ? `${d.contact_type ? optLabel("contact_type", d.contact_type, lang) + ": " : ""}${d.contact}` : "");
  add("business", d.business);
  add("niche", d.niche && optLabel("niche", d.niche, lang));
  add("instagram", d.instagram);
  add("services", optLabels("services", d.services, lang));
  add("goal", d.goal && optLabel("goal", d.goal, lang));
  add("audience", d.audience);
  add("geo", d.geo);
  add("sources", optLabels("sources", d.sources, lang));
  add("leads_pm", d.leads_pm && optLabel("leads_pm", d.leads_pm, lang));
  add("budget", d.budget && optLabel("budget", d.budget, lang));
  add("start", d.start && optLabel("start", d.start, lang));
  add("comment", d.comment);
  return rows;
}

// ---------- Services (Mini App cards + AI knowledge) ----------
export const SERVICES = [
  {
    key: "instagram", icon: "grid",
    ru: { title: "Ведение Instagram", text: "Профиль, который объясняет, что вы продаёте, и подводит к сообщению.", points: ["Оффер и упаковка профиля", "Контент-план, посты и сторис", "Ответы и заявки под контролем", "Отчёт каждую неделю"] },
    uz: { title: "Instagram yuritish", text: "Profil nima sotayotganingizni tushuntiradi va mijozni yozishga olib keladi.", points: ["Taklif va profilni bezash", "Kontent-reja, postlar va storislar", "Murojaatlar nazoratda", "Har hafta hisobot"] },
    tr: { title: "Instagram yönetimi", text: "Ne sattığınızı net anlatan ve müşteriyi mesaja yönlendiren profil.", points: ["Teklif ve profil düzeni", "İçerik planı, gönderi ve hikâyeler", "Talepler kontrol altında", "Her hafta rapor"] },
  },
  {
    key: "reels", icon: "play",
    ru: { title: "Reels под ключ", text: "Сценарий, съёмка и монтаж. Ролики, которые досматривают и после которых пишут.", points: ["Идеи и сценарии под вашу нишу", "Съёмка в магазине или офисе", "Монтаж, звук, обложки", "Лучшие ролики идут в рекламу"] },
    uz: { title: "Reels: g'oyadan montajgacha", text: "Ssenariy, syomka va montaj. Oxirigacha ko'riladigan va yozishga undaydigan roliklar.", points: ["Sohangizga mos g'oya va ssenariylar", "Do'kon yoki ofisda syomka", "Montaj, ovoz, muqovalar", "Eng yaxshi roliklar reklamaga chiqadi"] },
    tr: { title: "Reels: fikirden kurguya", text: "Senaryo, çekim ve kurgu. Sonuna kadar izlenen ve mesaj getiren videolar.", points: ["Sektörünüze uygun fikir ve senaryolar", "Mağazada veya ofiste çekim", "Kurgu, ses, kapaklar", "En iyi videolar reklama çıkar"] },
  },
  {
    key: "target", icon: "target",
    ru: { title: "Таргет в Instagram и Facebook", text: "Реклама Meta на тех, кто готов купить: в сообщения, WhatsApp или на сайт.", points: ["Настройка кабинета и аудиторий", "Креативы и тесты", "Масштабируем то, что даёт заявки", "Понятный отчёт по расходам"] },
    uz: { title: "Target reklama (Meta)", text: "Instagram va Facebook'da sotib olishga tayyor odamlarga reklama: xabar, WhatsApp yoki saytga.", points: ["Kabinet va auditoriyalarni sozlash", "Kreativlar va testlar", "Murojaat berayotganini kuchaytiramiz", "Xarajatlar bo'yicha aniq hisobot"] },
    tr: { title: "Meta reklamları", text: "Instagram ve Facebook'ta satın almaya hazır kitleye reklam: mesaj, WhatsApp veya site.", points: ["Hesap ve hedef kitle kurulumu", "Kreatifler ve testler", "Talep getireni büyütürüz", "Harcamalar için net rapor"] },
  },
  {
    key: "ai_video", icon: "spark",
    ru: { title: "AI-видео", text: "Рекламные ролики с помощью нейросетей: когда нет времени на съёмку или нужен вау-эффект.", points: ["Ролики для товара и бренда", "Говорящие аватары", "Быстро и без съёмочной группы"] },
    uz: { title: "AI-video", text: "Neyrotarmoqlar yordamida reklama roliklari: syomkaga vaqt bo'lmasa yoki kuchli taassurot kerak bo'lsa.", points: ["Mahsulot va brend uchun roliklar", "Gapiruvchi avatarlar", "Tez va syomka guruhisiz"] },
    tr: { title: "AI video", text: "Yapay zekâ ile reklam videoları: çekime vakit yoksa ya da güçlü bir etki gerekiyorsa.", points: ["Ürün ve marka videoları", "Konuşan avatarlar", "Hızlı, çekim ekibi olmadan"] },
  },
  {
    key: "website", icon: "window",
    ru: { title: "Сайты и лендинги", text: "Быстрый сайт под телефон: товар, цены, кнопка WhatsApp. Удобно вести на него рекламу.", points: ["Структура и тексты", "Дизайн под ваш бренд", "Каталог, формы, WhatsApp", "Несколько языков"] },
    uz: { title: "Sayt va lendinglar", text: "Telefonga mos tez sayt: mahsulot, narxlar, WhatsApp tugmasi. Reklamani unga yo'naltirish qulay.", points: ["Tuzilma va matnlar", "Brendingizga mos dizayn", "Katalog, formalar, WhatsApp", "Bir nechta til"] },
    tr: { title: "Web sitesi ve landing", text: "Telefona uygun hızlı site: ürün, fiyat, WhatsApp butonu. Reklamı yönlendirmek kolay.", points: ["Yapı ve metinler", "Markanıza uygun tasarım", "Katalog, formlar, WhatsApp", "Birkaç dil"] },
  },
  {
    key: "identity", icon: "layers",
    ru: { title: "Айдентика", text: "Логотип, цвета и шаблоны, по которым вас узнают в ленте.", points: ["Логотип и фирменные цвета", "Шаблоны постов и сторис", "Оформление профиля"] },
    uz: { title: "Brend uslubi", text: "Logotip, ranglar va shablonlar: lentada sizni darrov taniydilar.", points: ["Logotip va firma ranglari", "Post va storis shablonlari", "Profilni bezash"] },
    tr: { title: "Kurumsal kimlik", text: "Logo, renkler ve şablonlar: akışta sizi hemen tanırlar.", points: ["Logo ve marka renkleri", "Gönderi ve hikâye şablonları", "Profil düzeni"] },
  },
];

// ---------- FAQ ----------
export const FAQ = [
  {
    ru: ["Сколько это стоит?", "Цена зависит от задачи. Сначала бесплатный разбор вашего аккаунта, после него вы получаете точное предложение с ценой. Без разбора назвать честную цифру нельзя."],
    uz: ["Narxi qancha?", "Narx vazifaga bog'liq. Avval akkauntingizni bepul tahlil qilaman, shundan keyin aniq taklif va narxni olasiz. Tahlilsiz to'g'ri narx aytib bo'lmaydi."],
    tr: ["Fiyat ne kadar?", "Fiyat işe göre değişir. Önce hesabınızı ücretsiz analiz ediyorum, ardından net teklif ve fiyatı alırsınız. Analiz olmadan doğru rakam vermek mümkün değil."],
  },
  {
    ru: ["Что такое бесплатный разбор?", "В течение часа вы получаете голосовое сообщение: 3 причины, почему аккаунт сейчас не приносит клиентов, и что с этим делать. Это ни к чему не обязывает."],
    uz: ["Bepul tahlil nima?", "Bir soat ichida ovozli xabar olasiz: akkauntingiz hozir nega mijoz olib kelmayotganining 3 ta sababi va nima qilish kerakligi. Bu sizni hech narsaga majburlamaydi."],
    tr: ["Ücretsiz analiz nedir?", "Bir saat içinde sesli mesaj alırsınız: hesabınızın şu an neden müşteri getirmediğinin 3 nedeni ve ne yapılması gerektiği. Hiçbir yükümlülüğü yoktur."],
  },
  {
    ru: ["Когда будут первые заявки?", "Первые ролики и реклама обычно выходят на второй неделе. Точных цифр заранее не обещаю: они зависят от ниши, оффера и бюджета. Каждую неделю вы видите отчёт и понимаете, что происходит."],
    uz: ["Birinchi murojaatlar qachon bo'ladi?", "Birinchi roliklar va reklama odatda ikkinchi haftada chiqadi. Aniq raqamlarni oldindan va'da qilmayman: ular soha, taklif va byudjetga bog'liq. Har hafta hisobot ko'rasiz va nima bo'layotganini bilasiz."],
    tr: ["İlk talepler ne zaman gelir?", "İlk videolar ve reklam genelde ikinci haftada yayına girer. Önceden net rakam vaat etmiyorum: sektöre, teklife ve bütçeye bağlı. Her hafta rapor görür, neler olduğunu bilirsiniz."],
  },
  {
    ru: ["Мне нужно сниматься самому?", "Не обязательно. Можно снимать товар, магазин, сотрудников или сделать AI-видео. Формат подбираем под вас."],
    uz: ["O'zim kadrga chiqishim shartmi?", "Shart emas. Mahsulot, do'kon, xodimlarni suratga olish yoki AI-video qilish mumkin. Formatni sizga moslab tanlaymiz."],
    tr: ["Kamera karşısına ben mi geçmeliyim?", "Şart değil. Ürün, mağaza, çalışanlar çekilebilir ya da AI video yapılabilir. Formatı size göre seçeriz."],
  },
  {
    ru: ["Вы работаете только в Стамбуле?", "Съёмка — в Стамбуле: Лалели, Мертер, Османбей и другие районы. Ведение, таргет, сайты и AI-видео делаю удалённо для любой страны."],
    uz: ["Faqat Istanbulda ishlaysizmi?", "Syomka Istanbulda: Laleli, Merter, Osmanbey va boshqa tumanlar. Instagram yuritish, target, sayt va AI-videoni istalgan davlat uchun masofadan qilaman."],
    tr: ["Sadece İstanbul'da mı çalışıyorsunuz?", "Çekimler İstanbul'da: Laleli, Merter, Osmanbey ve diğer bölgeler. Yönetim, reklam, site ve AI video işlerini her ülke için uzaktan yapıyorum."],
  },
  {
    ru: ["На каких языках контент?", "На узбекском, русском и турецком. Под вашу аудиторию: покупатели из Узбекистана, Казахстана, России, Турции."],
    uz: ["Kontent qaysi tillarda?", "O'zbek, rus va turk tillarida. Auditoriyangizga qarab: O'zbekiston, Qozog'iston, Rossiya, Turkiyadagi xaridorlar."],
    tr: ["İçerik hangi dillerde?", "Özbekçe, Rusça ve Türkçe. Kitlenize göre: Özbekistan, Kazakistan, Rusya ve Türkiye'deki alıcılar."],
  },
  {
    ru: ["Какой нужен бюджет на рекламу?", "Зависит от цели и ниши, подскажу после разбора. Рекламный бюджет идёт напрямую в Meta и не входит в оплату моей работы."],
    uz: ["Reklamaga qancha byudjet kerak?", "Maqsad va sohaga bog'liq, tahlildan keyin aytaman. Reklama byudjeti to'g'ridan-to'g'ri Meta'ga to'lanadi va mening ishim haqiga kirmaydi."],
    tr: ["Reklam bütçesi ne kadar olmalı?", "Hedefe ve sektöre göre değişir, analizden sonra söylerim. Reklam bütçesi doğrudan Meta'ya ödenir, benim ücretime dahil değildir."],
  },
];

// ---------- "What happens next" ----------
const STEP_AUDIT = {
  ru: { when: "В течение часа", title: "Бесплатный разбор аккаунта", text: "Голосовое сообщение: 3 причины, почему аккаунт сейчас не приносит клиентов." },
  uz: { when: "Bir soat ichida", title: "Akkauntning bepul tahlili", text: "Ovozli xabar: akkaunt hozir nega mijoz olib kelmayotganining 3 ta sababi." },
  tr: { when: "Bir saat içinde", title: "Ücretsiz hesap analizi", text: "Sesli mesaj: hesabınızın şu an neden müşteri getirmediğinin 3 nedeni." },
};
const STEP_CALL = {
  ru: { when: "1–2 дня", title: "Созвон или встреча", text: "Обсуждаем задачу, вы получаете предложение: что делаем, в какие сроки и сколько это стоит." },
  uz: { when: "1–2 kun", title: "Qo'ng'iroq yoki uchrashuv", text: "Vazifani muhokama qilamiz, taklif olasiz: nima qilamiz, qancha vaqtda va narxi qancha." },
  tr: { when: "1–2 gün", title: "Görüşme veya toplantı", text: "İşi konuşuruz, teklif alırsınız: ne yapacağız, ne kadar sürede ve fiyatı ne." },
};

export const PLANS = {
  smm: {
    ru: [STEP_AUDIT.ru, STEP_CALL.ru,
      { when: "Неделя 1", title: "Аудит, оффер, упаковка, съёмка", text: "Разбираем конкурентов, формулируем оффер, оформляем профиль и снимаем первые ролики." },
      { when: "Недели 2–4", title: "Reels, реклама, заявки", text: "Публикуем Reels, запускаем рекламу на лучшие ролики, собираем заявки. Каждую неделю — отчёт." }],
    uz: [STEP_AUDIT.uz, STEP_CALL.uz,
      { when: "1-hafta", title: "Audit, taklif, profil, syomka", text: "Raqobatchilarni o'rganamiz, taklifni shakllantiramiz, profilni bezaymiz va birinchi roliklarni suratga olamiz." },
      { when: "2–4-haftalar", title: "Reels, reklama, murojaatlar", text: "Reels chiqaramiz, eng yaxshi roliklarga reklama beramiz, murojaatlarni yig'amiz. Har hafta hisobot." }],
    tr: [STEP_AUDIT.tr, STEP_CALL.tr,
      { when: "1. hafta", title: "Analiz, teklif, profil, çekim", text: "Rakipleri inceleriz, teklifi netleştiririz, profili düzenleriz ve ilk videoları çekeriz." },
      { when: "2–4. haftalar", title: "Reels, reklam, talepler", text: "Reels yayınlarız, en iyi videolara reklam veririz, talepleri toplarız. Her hafta rapor." }],
  },
  target: {
    ru: [STEP_AUDIT.ru, STEP_CALL.ru,
      { when: "Неделя 1", title: "Кабинет, оффер, креативы", text: "Проверяем рекламный кабинет, формулируем оффер, готовим ролики и объявления." },
      { when: "Недели 2–4", title: "Запуск, тесты, заявки", text: "Запускаем рекламу, тестируем креативы, усиливаем то, что даёт заявки. Каждую неделю — отчёт по расходам." }],
    uz: [STEP_AUDIT.uz, STEP_CALL.uz,
      { when: "1-hafta", title: "Kabinet, taklif, kreativlar", text: "Reklama kabinetini tekshiramiz, taklifni shakllantiramiz, rolik va e'lonlarni tayyorlaymiz." },
      { when: "2–4-haftalar", title: "Ishga tushirish, testlar, murojaatlar", text: "Reklamani yoqamiz, kreativlarni sinaymiz, murojaat berayotganini kuchaytiramiz. Har hafta xarajatlar hisoboti." }],
    tr: [STEP_AUDIT.tr, STEP_CALL.tr,
      { when: "1. hafta", title: "Hesap, teklif, kreatifler", text: "Reklam hesabını kontrol ederiz, teklifi netleştiririz, video ve reklamları hazırlarız." },
      { when: "2–4. haftalar", title: "Yayın, testler, talepler", text: "Reklamı başlatırız, kreatifleri test ederiz, talep getireni büyütürüz. Her hafta harcama raporu." }],
  },
  ai: {
    ru: [STEP_AUDIT.ru, STEP_CALL.ru,
      { when: "Неделя 1", title: "Идея, сценарий, первый ролик", text: "Подбираем стиль под ваш товар, пишем сценарий и показываем первый AI-ролик." },
      { when: "Недели 2–4", title: "Серия роликов и реклама", text: "Делаем серию видео, лучшие запускаем в рекламу и смотрим, что даёт заявки." }],
    uz: [STEP_AUDIT.uz, STEP_CALL.uz,
      { when: "1-hafta", title: "G'oya, ssenariy, birinchi rolik", text: "Mahsulotingizga mos uslub tanlaymiz, ssenariy yozamiz va birinchi AI-rolikni ko'rsatamiz." },
      { when: "2–4-haftalar", title: "Roliklar seriyasi va reklama", text: "Video seriyasini tayyorlaymiz, eng yaxshilarini reklamaga chiqaramiz va qaysi biri murojaat berishini ko'ramiz." }],
    tr: [STEP_AUDIT.tr, STEP_CALL.tr,
      { when: "1. hafta", title: "Fikir, senaryo, ilk video", text: "Ürününüze uygun tarzı seçer, senaryoyu yazar ve ilk AI videoyu gösteririz." },
      { when: "2–4. haftalar", title: "Video serisi ve reklam", text: "Video serisini hazırlar, en iyilerini reklama çıkarır ve hangisinin talep getirdiğine bakarız." }],
  },
  web: {
    ru: [STEP_AUDIT.ru, STEP_CALL.ru,
      { when: "Неделя 1", title: "Структура, тексты, дизайн", text: "Собираем структуру, пишем тексты и показываем дизайн главного экрана." },
      { when: "Недели 2–3", title: "Сборка и запуск", text: "Собираем сайт под телефон, подключаем WhatsApp и формы, запускаем. Дальше можно вести на него рекламу." }],
    uz: [STEP_AUDIT.uz, STEP_CALL.uz,
      { when: "1-hafta", title: "Tuzilma, matnlar, dizayn", text: "Tuzilmani yig'amiz, matnlarni yozamiz va asosiy ekran dizaynini ko'rsatamiz." },
      { when: "2–3-haftalar", title: "Yig'ish va ishga tushirish", text: "Saytni telefonga moslab yig'amiz, WhatsApp va formalarni ulaymiz, ishga tushiramiz. Keyin unga reklama yo'naltirish mumkin." }],
    tr: [STEP_AUDIT.tr, STEP_CALL.tr,
      { when: "1. hafta", title: "Yapı, metinler, tasarım", text: "Yapıyı kurar, metinleri yazar ve ana ekran tasarımını gösteririz." },
      { when: "2–3. haftalar", title: "Kurulum ve yayın", text: "Siteyi telefona uygun kurar, WhatsApp ve formları bağlar, yayına alırız. Sonra reklam yönlendirilebilir." }],
  },
  brand: {
    ru: [STEP_AUDIT.ru, STEP_CALL.ru,
      { when: "Неделя 1", title: "Референсы и направления", text: "Смотрим конкурентов, собираем референсы и показываем 2–3 направления стиля." },
      { when: "Недели 2–3", title: "Логотип, цвета, шаблоны", text: "Дорабатываем выбранный вариант: логотип, цвета, шаблоны постов и сторис, оформление профиля." }],
    uz: [STEP_AUDIT.uz, STEP_CALL.uz,
      { when: "1-hafta", title: "Namunalar va yo'nalishlar", text: "Raqobatchilarni ko'ramiz, namunalar yig'amiz va uslubning 2–3 yo'nalishini ko'rsatamiz." },
      { when: "2–3-haftalar", title: "Logotip, ranglar, shablonlar", text: "Tanlangan variantni yakunlaymiz: logotip, ranglar, post va storis shablonlari, profil bezagi." }],
    tr: [STEP_AUDIT.tr, STEP_CALL.tr,
      { when: "1. hafta", title: "Referanslar ve yönler", text: "Rakiplere bakar, referans toplar ve 2–3 tarz yönü gösteririz." },
      { when: "2–3. haftalar", title: "Logo, renkler, şablonlar", text: "Seçilen yönü tamamlarız: logo, renkler, gönderi ve hikâye şablonları, profil düzeni." }],
  },
};

export const PLAN_FOOT = {
  ru: "Цену заранее не называю: она зависит от задачи. Точная цена — после разбора.",
  uz: "Narxni oldindan aytmayman: u vazifaga bog'liq. Aniq narx tahlildan keyin.",
  tr: "Fiyatı önceden söylemiyorum: işe göre değişir. Net fiyat analizden sonra.",
};

export function planGroup(services) {
  const s = Array.isArray(services) ? services : [];
  if (!s.length || s.includes("instagram") || s.includes("reels") || s.includes("unsure")) return "smm";
  if (s.includes("target")) return "target";
  if (s.includes("ai_video")) return "ai";
  if (s.includes("website")) return "web";
  if (s.includes("identity")) return "brand";
  return "smm";
}

// Template plan; `extra` may carry AI personalisation: {intro, notes: [..4]}.
export function buildPlan(data, lang, extra) {
  const group = planGroup(data && data.services);
  const steps = (PLANS[group][lang] || PLANS[group].ru).map((s, i) => ({
    ...s,
    note: extra && Array.isArray(extra.notes) && typeof extra.notes[i] === "string" ? extra.notes[i].slice(0, 300) : "",
  }));
  return {
    group,
    intro: extra && typeof extra.intro === "string" ? extra.intro.slice(0, 400) : "",
    steps,
    foot: PLAN_FOOT[lang] || PLAN_FOOT.ru,
    personal: !!(extra && (extra.intro || (extra.notes || []).length)),
  };
}

// ---------- Portfolio ----------
export const PROJECT_NICHES = [
  o("clothing_retail", "Одежда", "Kiyim", "Giyim"),
  o("clothing_wholesale", "Опт", "Ulgurji", "Toptan"),
  o("sites", "Сайты", "Saytlar", "Siteler"),
  o("education", "Учёба в Турции", "Turkiyada o'qish", "Eğitim"),
  o("ikamet", "Икамет", "Ikamet", "İkamet"),
  o("marketplace", "Маркетплейсы", "Marketpleyslar", "Pazaryeri"),
  o("realty", "Недвижимость", "Ko'chmas mulk", "Gayrimenkul"),
  o("other", "Другое", "Boshqa", "Diğer"),
];
export function nicheLabel(key, lang) {
  const n = PROJECT_NICHES.find((x) => x.key === key);
  return n ? n[lang] || n.ru : key;
}

const m = (vru, vuz, vtr, lru, luz, ltr) => ({ value: { ru: vru, uz: vuz, tr: vtr }, label: { ru: lru, uz: luz, tr: ltr } });

// Starter projects, inserted once when the portfolio table is empty.
export const SEED_PROJECTS = [
  {
    title: "Moda Ucuz AVM", niche: "clothing_retail", tone: "a",
    instagram: "https://instagram.com/modaucuzbagcilar", link: "",
    metrics: [
      m("3,8 млн", "3,8 mln", "3,8 Mn", "просмотров Reels", "Reels ko'rishlari", "Reels izlenme"),
      m("2 млн", "2 mln", "2 Mn", "просмотров Reels", "Reels ko'rishlari", "Reels izlenme"),
      m("352 тыс.", "352 ming", "352 B", "просмотров Reels", "Reels ko'rishlari", "Reels izlenme"),
      m("290 тыс.", "290 ming", "290 B", "просмотров Reels", "Reels ko'rishlari", "Reels izlenme"),
      m("45,8 тыс.", "45,8 ming", "45,8 B", "подписчиков", "obunachi", "takipçi"),
    ],
    body: {
      ru: { tagline: "Мужская одежда, Стамбул", done: "Reels для магазина: идеи, съёмка, монтаж. Четыре ролика набрали от 290 тысяч до 3,8 млн просмотров." },
      uz: { tagline: "Erkaklar kiyimi, Istanbul", done: "Do'kon uchun Reels: g'oya, syomka, montaj. To'rtta rolik 290 mingdan 3,8 mln gacha ko'rish yig'di." },
      tr: { tagline: "Erkek giyim, İstanbul", done: "Mağaza için Reels: fikir, çekim, kurgu. Dört video 290 bin ile 3,8 milyon arasında izlendi." },
    },
  },
  {
    title: "YSR AVM", niche: "clothing_retail", tone: "b",
    instagram: "https://instagram.com/ysravmistanbul", link: "",
    metrics: [m("99,9 тыс.", "99,9 ming", "99,9 B", "подписчиков", "obunachi", "takipçi")],
    body: {
      ru: { tagline: "Мужская одежда, Стамбул", done: "Reels и контент для магазина. В аккаунте 99,9 тысячи подписчиков." },
      uz: { tagline: "Erkaklar kiyimi, Istanbul", done: "Do'kon uchun Reels va kontent. Akkauntda 99,9 ming obunachi." },
      tr: { tagline: "Erkek giyim, İstanbul", done: "Mağaza için Reels ve içerik. Hesapta 99,9 bin takipçi." },
    },
  },
  {
    title: "Madalyon Shirt", niche: "clothing_wholesale", tone: "c",
    instagram: "", link: "https://madalyon-taplink.vercel.app",
    metrics: [m("16,7 тыс.", "16,7 ming", "16,7 B", "подписчиков", "obunachi", "takipçi")],
    body: {
      ru: { tagline: "Оптовые рубашки", done: "Контент для Instagram и сайт-визитка с каталогом и контактами для оптовых покупателей." },
      uz: { tagline: "Ulgurji ko'ylaklar", done: "Instagram uchun kontent hamda ulgurji xaridorlar uchun katalog va kontaktlar joylangan sayt." },
      tr: { tagline: "Toptan gömlek", done: "Instagram içerikleri ve toptan alıcılar için katalog ve iletişim bilgilerini içeren site." },
    },
  },
  {
    title: "Moventra Group", niche: "sites", tone: "d",
    instagram: "", link: "https://moventragroup.vercel.app",
    metrics: [],
    body: {
      ru: { tagline: "Сайт компании", done: "Сайт под ключ: структура, тексты, дизайн и сборка под телефон." },
      uz: { tagline: "Kompaniya sayti", done: "Sayt to'liq tayyorlandi: tuzilma, matnlar, dizayn va telefonga moslash." },
      tr: { tagline: "Şirket sitesi", done: "Anahtar teslim site: yapı, metinler, tasarım ve mobil uyum." },
    },
  },
  {
    title: "Crazy Queen", niche: "sites", tone: "e",
    instagram: "", link: "https://crazy-queen.vercel.app",
    metrics: [],
    body: {
      ru: { tagline: "Сайт бренда", done: "Сайт под ключ: структура, дизайн и сборка под телефон." },
      uz: { tagline: "Brend sayti", done: "Sayt to'liq tayyorlandi: tuzilma, dizayn va telefonga moslash." },
      tr: { tagline: "Marka sitesi", done: "Anahtar teslim site: yapı, tasarım ve mobil uyum." },
    },
  },
];
