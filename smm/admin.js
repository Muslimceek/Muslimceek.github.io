// Admin panel (loaded only for the admin). Interface language: Russian.
let X;
const A = {
  tab: "leads",
  leads: [], filter: "new", loaded: false,
  projects: [], edit: null, editLang: "ru",
  bc: { texts: { ru: "", uz: "", tr: "" }, lang: "ru", segment: { lang: "", service: "", status: "" }, with_button: true, count: null, history: [], prompt: "", busy: false },
  stats: null, ai: false,
};

const STATUS = { new: "Новая", in_progress: "В работе", agreed: "Договорились", declined: "Отказ" };
const KIND = { brief: "Бриф", audit: "Разбор", handoff: "Просит связаться" };
const TEMP = { hot: "🔥 Горячий", warm: "🌤 Тёплый", cold: "❄️ Холодный" };
const LANGS = ["ru", "uz", "tr"];

export function init(ctx) { X = ctx; }

const esc = (s) => X.esc(s);
const ago = (iso) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  if (m < 1440) return `${Math.round(m / 60)} ч назад`;
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
};
const setPath = (obj, path, value) => {
  const keys = path.split(".");
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]] ??= {};
  o[keys[keys.length - 1]] = value;
};
const leadName = (l) => l.data?.name || [l.first_name, l.last_name].filter(Boolean).join(" ") || (l.username ? "@" + l.username : "Без имени");

export async function open(target = "") {
  await loadLeads();
  const m = target.match(/^lead_(\d+)$/);
  if (m) {
    const lead = A.leads.find((l) => l.id === Number(m[1]));
    if (lead) { A.filter = "all"; X.render(); leadSheet(lead); }
  }
}

export function back() {
  if (A.edit) { A.edit = null; X.render(); return true; }
  return false;
}

async function loadLeads() {
  const r = await X.call("/api/admin/leads");
  if (r.ok) { A.leads = r.leads; A.loaded = true; }
  X.render();
}
async function loadProjects() {
  const r = await X.call("/api/admin/projects");
  if (r.ok) A.projects = r.projects;
  X.render();
}
async function loadStats() {
  const r = await X.call("/api/admin/stats");
  if (r.ok) { A.stats = r.stats; A.ai = r.ai; }
  X.render();
}
async function loadBroadcasts() {
  const [h, c] = await Promise.all([X.call("/api/admin/broadcasts"), X.call("/api/admin/broadcast/count", { segment: A.bc.segment })]);
  if (h.ok) A.bc.history = h.broadcasts;
  if (c.ok) A.bc.count = c.count;
  X.render();
}
async function refreshCount() {
  const c = await X.call("/api/admin/broadcast/count", { segment: A.bc.segment });
  if (c.ok) { A.bc.count = c.count; const el = document.querySelector("#bc-count"); if (el) el.textContent = c.count; const b = document.querySelector("#bc-send"); if (b) b.textContent = `Отправить (${c.count})`; }
}

// ---------- Views ----------
export function view() {
  const tab = (k, label) => `<button class="${A.tab === k ? "on" : ""}" data-act="a-tab" data-k="${k}">${label}</button>`;
  let body = "";
  if (A.tab === "leads") body = leadsView();
  else if (A.tab === "projects") body = A.edit ? editorView() : projectsView();
  else if (A.tab === "broadcast") body = broadcastView();
  else body = statsView();
  return `<div class="page" style="padding-bottom:calc(var(--safe-b) + 30px)">
    <h1 class="page-title">Админка</h1>
    <div class="tabs">${tab("leads", "Заявки")}${tab("projects", "Портфолио")}${tab("broadcast", "Рассылка")}${tab("stats", "Цифры")}</div>
    ${body}</div>`;
}

function leadsView() {
  if (!A.loaded) return `<div class="empty">Загружаю…</div>`;
  const count = (s) => A.leads.filter((l) => s === "all" || l.status === s).length;
  const chip = (k, label) => `<button class="chip ${A.filter === k ? "on" : ""}" data-act="a-filter" data-k="${k}">${label}<em>${count(k)}</em></button>`;
  const list = A.leads.filter((l) => A.filter === "all" || l.status === A.filter);
  return `<div class="chips">${chip("new", "Новые")}${chip("in_progress", "В работе")}${chip("agreed", "Договорились")}${chip("declined", "Отказ")}${chip("all", "Все")}</div>
    ${list.map((l) => {
      const icon = l.ai?.temperature === "hot" ? "🔥" : l.ai?.temperature === "cold" ? "❄️" : "🌤";
      return `<button class="lead-card" data-act="a-lead" data-id="${l.id}">
        <div class="lead-top"><span>${icon} #${l.id} · ${KIND[l.kind] || l.kind}</span><span>· ${ago(l.created_at)}</span><span class="st st-${l.status}">${STATUS[l.status]}</span></div>
        <b>${esc(leadName(l))}</b><p>${esc(l.data?.business || l.data?.instagram || l.data?.comment || l.ai?.summary || "")}</p></button>`;
    }).join("") || `<div class="empty">Здесь пока пусто</div>`}
    <div class="stack"><button class="btn ghost slim" data-act="a-export">Выгрузить заявки в таблицу</button></div>`;
}

function leadSheet(l) {
  const ai = l.ai || {};
  const rows = X.C.briefRows(l.data || {}, "ru").map(([k, v]) => `<div class="row"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("");
  const d = l.data || {};
  const digits = String(d.contact || "").replace(/\D/g, "");
  const wa = (d.contact_type === "whatsapp" || d.contact_type === "phone") && digits.length >= 9 ? `https://wa.me/${digits}` : "";
  const tgUrl = l.username ? `https://t.me/${l.username}` : "";
  X.openSheet(`<button class="sheet-close" data-act="sheet-close">${X.I.x}</button>
    <div style="margin-top:-26px"><span class="badge">#${l.id} · ${KIND[l.kind] || l.kind} · ${l.channel === "app" ? "Mini App" : "чат"} · ${l.lang.toUpperCase()}${l.source ? " · " + esc(l.source) : ""}</span>
    <h2 style="margin-top:12px">${esc(leadName(l))}</h2><p class="lead">${ago(l.created_at)}${l.username ? " · @" + esc(l.username) : ""}</p></div>
    <div class="status-row">${Object.keys(STATUS).map((s) => `<button class="${l.status === s ? "on" : ""}" data-act="a-status" data-id="${l.id}" data-k="${s}">${STATUS[s]}</button>`).join("")}</div>
    <div class="stack">
      ${tgUrl ? `<button class="btn primary slim" data-act="open" data-url="${tgUrl}">${X.I.tg}Написать клиенту</button>` : ""}
      ${wa ? `<button class="btn ghost slim" data-act="open" data-url="${wa}">Написать в WhatsApp</button>` : ""}
      ${!tgUrl && !wa ? `<p class="muted">У клиента нет ника в Telegram. Откройте его профиль из карточки заявки в чате с ботом: имя там кликабельное.</p>` : ""}
    </div>
    ${ai.summary ? `<div class="ai-box">
      <h4>Резюме${ai.engine === "ai" ? " · ИИ" : " · без ИИ"}</h4><div>${esc(ai.summary)}</div>
      <h4>Оценка</h4><div>${TEMP[ai.temperature] || ""}${ai.reason ? " — " + esc(ai.reason) : ""}</div>
      ${ai.hypotheses?.length ? `<h4>Гипотезы, почему мало клиентов</h4><ol>${ai.hypotheses.map((h) => `<li>${esc(h)}</li>`).join("")}</ol>` : ""}
      ${ai.draft ? `<h4>Черновик первого ответа</h4><blockquote id="draft-text">${esc(ai.draft)}</blockquote>
        <div class="stack"><button class="btn soft slim" data-act="a-copy">Скопировать черновик</button></div>` : ""}
    </div>` : ""}
    ${X.S.ai ? `<div class="stack"><button class="btn ghost slim" data-act="a-reanalyze" data-id="${l.id}">Разобрать с ИИ заново</button></div>` : ""}
    ${rows ? `<div class="summary">${rows}</div>` : ""}`, true);
}

function thumb(p) {
  const m = (p.media || [])[0];
  if (m?.type === "image") return `<div class="thumb"><img src="${esc(m.url)}" alt=""></div>`;
  if (m?.type === "video") return `<div class="thumb"><video src="${esc(m.url)}#t=0.1" muted preload="metadata"></video></div>`;
  return `<div class="thumb tone-${esc(p.tone)}">${esc((p.title || "?")[0])}</div>`;
}

function projectsView() {
  return `<button class="btn primary slim" data-act="a-new">Добавить проект</button>
    <div style="margin-top:14px">${A.projects.map((p, i) => `<div class="prow">${thumb(p)}
      <div class="ptxt"><b>${esc(p.title)}</b><span>${esc(X.C.nicheLabel(p.niche, "ru"))}${p.published ? "" : " · скрыт"}</span></div>
      <button class="icon-btn" data-act="a-move" data-i="${i}" data-d="-1" ${i === 0 ? "disabled" : ""}>↑</button>
      <button class="icon-btn" data-act="a-move" data-i="${i}" data-d="1" ${i === A.projects.length - 1 ? "disabled" : ""}>↓</button>
      <button class="icon-btn" data-act="a-edit" data-id="${p.id}">✎</button></div>`).join("") || `<div class="empty">Проектов пока нет</div>`}</div>
    <p class="muted" style="margin-top:12px">Стрелки меняют порядок. В приложении проекты идут в этом же порядке.</p>`;
}

const blankProject = () => ({
  id: null, title: "", niche: "clothing_retail", link: "", instagram: "", tone: "a", published: true, media: [], metrics: [],
  body: { ru: { tagline: "", done: "" }, uz: { tagline: "", done: "" }, tr: { tagline: "", done: "" } },
});

function editorView() {
  const p = A.edit, l = A.editLang;
  const inp = (path, label, ph = "", extra = "") => `<div class="field"><label>${label}</label><input class="input" data-a="${path}" value="${esc(path.split(".").reduce((o, k) => o?.[k], A) ?? "")}" placeholder="${esc(ph)}" ${extra}></div>`;
  return `<div class="form">
    ${inp("edit.title", "Название проекта", "Например: Moda Ucuz AVM")}
    <div class="field"><label>Ниша</label><select class="select" data-a="edit.niche">${X.C.PROJECT_NICHES.map((n) => `<option value="${n.key}" ${p.niche === n.key ? "selected" : ""}>${esc(n.ru)}</option>`).join("")}</select></div>
    <div class="field"><label>Фото и видео</label><div class="media-list">
      ${p.media.map((m, i) => `<div class="media-item">${m.type === "video" ? `<video src="${esc(m.url)}#t=0.1" muted preload="metadata"></video>` : `<img src="${esc(m.url)}" alt="">`}<button data-act="a-media-del" data-i="${i}">×</button></div>`).join("")}
      <label class="media-add"><span id="upload-label">+ Добавить</span><input type="file" id="a-file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime" multiple></label>
    </div><p class="muted" style="margin-top:8px">Первый файл — обложка. Фото: JPG, PNG, WebP. Видео: MP4 или MOV до 50 МБ.</p></div>
    ${p.media.length ? "" : `<div class="field"><label>Цвет обложки, пока нет фото</label><div class="tones">${["a", "b", "c", "d", "e"].map((x) => `<button class="tone-${x} ${p.tone === x ? "on" : ""}" data-act="a-tone" data-k="${x}"></button>`).join("")}</div></div>`}
    ${inp("edit.instagram", "Ссылка на Instagram", "https://instagram.com/…", 'inputmode="url" autocapitalize="off"')}
    ${inp("edit.link", "Ссылка на сайт", "https://…", 'inputmode="url" autocapitalize="off"')}
    <h4>Тексты и цифры</h4>
    <div class="tabs" style="margin:0">${LANGS.map((x) => `<button class="${l === x ? "on" : ""}" data-act="a-elang" data-k="${x}">${x.toUpperCase()}</button>`).join("")}</div>
    ${inp(`edit.body.${l}.tagline`, "Короткая подпись", "Мужская одежда, Стамбул")}
    <div class="field"><label>Что сделано и результат</label><textarea class="textarea" data-a="edit.body.${l}.done" rows="4" placeholder="Reels для магазина: идеи, съёмка, монтаж…">${esc(p.body[l]?.done || "")}</textarea></div>
    <button class="btn soft slim" data-act="a-ai-project">✨ ИИ: улучшить и перевести на 3 языка</button>
    <div class="field"><label>Цифры результата (${l.toUpperCase()})</label>
      ${p.metrics.map((m, i) => `<div class="mrow" style="margin-bottom:6px"><input class="input" data-a="edit.metrics.${i}.value.${l}" value="${esc(m.value?.[l] || "")}" placeholder="3,8 млн">
        <input class="input" data-a="edit.metrics.${i}.label.${l}" value="${esc(m.label?.[l] || "")}" placeholder="просмотров Reels"><button class="icon-btn" data-act="a-metric-del" data-i="${i}">×</button></div>`).join("")}
      <button class="btn ghost slim" data-act="a-metric-add">+ Добавить цифру</button></div>
    <label class="chk"><input type="checkbox" data-a="edit.published" ${p.published ? "checked" : ""}> Показывать в портфолио</label>
    <button class="btn primary" data-act="a-save">Сохранить</button>
    ${p.id ? `<button class="btn ghost slim" data-act="a-delete" style="color:var(--bad)">Удалить проект</button>` : ""}
    <button class="btn ghost slim" data-act="a-cancel">Отмена</button>
  </div>`;
}

function broadcastView() {
  const b = A.bc;
  const sel = (path, options) => `<select class="select" data-a="${path}">${options.map(([v, label]) => `<option value="${v}" ${path.split(".").reduce((o, k) => o?.[k], A) === v ? "selected" : ""}>${esc(label)}</option>`).join("")}</select>`;
  return `<div class="form" style="margin-top:0">
    <div class="field"><label>О чём написать — ИИ составит текст на 3 языках</label>
      <div class="row2" style="grid-template-columns:1fr auto"><input class="input" data-a="bc.prompt" value="${esc(b.prompt)}" placeholder="Например: новый кейс, Reels на 3,8 млн">
      <button class="btn soft slim" data-act="a-ai-bc" style="width:auto;padding:0 16px">✨ ИИ</button></div></div>
    <div class="tabs" style="margin:0">${LANGS.map((x) => `<button class="${b.lang === x ? "on" : ""}" data-act="a-blang" data-k="${x}">${x.toUpperCase()}${b.texts[x] ? " ✓" : ""}</button>`).join("")}</div>
    <div class="field"><textarea class="textarea" data-a="bc.texts.${b.lang}" rows="6" placeholder="Текст рассылки (${b.lang.toUpperCase()})">${esc(b.texts[b.lang])}</textarea>
      <p class="muted" style="margin-top:6px">Каждый получит текст на своём языке. Если версии на его языке нет — получит русскую.</p></div>
    <h4>Кому</h4>
    <div class="row2">
      ${sel("bc.segment.lang", [["", "Все языки"], ["uz", "O'zbekcha"], ["ru", "Русский"], ["tr", "Türkçe"]])}
      ${sel("bc.segment.status", [["", "Все пользователи"], ["no_lead", "Без заявки"], ["any_lead", "Оставили заявку"], ["new", "Заявка: новая"], ["in_progress", "Заявка: в работе"], ["agreed", "Договорились"], ["declined", "Отказ"]])}
    </div>
    ${sel("bc.segment.service", [["", "Любая услуга"], ...X.C.OPTIONS.services.map((o) => [o.key, "Интересовались: " + o.ru])])}
    <label class="chk"><input type="checkbox" data-a="bc.with_button" ${b.with_button ? "checked" : ""}> Кнопка «Открыть приложение»</label>
    <p class="muted">Получателей: <b id="bc-count">${b.count ?? "…"}</b></p>
    <div class="row2"><button class="btn ghost slim" data-act="a-bc-preview">Предпросмотр себе</button>
    <button class="btn primary slim" id="bc-send" data-act="a-bc-send">Отправить (${b.count ?? "…"})</button></div>
    ${b.history.length ? `<h4>История</h4><div>${b.history.map((h) => `<div class="hist"><b>${esc(h.texts.ru || h.texts.uz || h.texts.tr)}</b>
      <span>${ago(h.created_at)} · ${h.status === "done" ? `доставлено ${h.sent} из ${h.total}` : `отправляется: ${h.sent} из ${h.total}`}</span></div>`).join("")}</div>` : ""}
  </div>`;
}

function statsView() {
  const s = A.stats;
  if (!s) return `<div class="empty">Загружаю…</div>`;
  const tile = (v, label, sub = "") => `<div class="tile"><b>${v}</b><span>${label}</span>${sub ? `<small>${sub}</small>` : ""}</div>`;
  const bars = (rows, labelFn) => {
    const max = Math.max(1, ...rows.map((r) => r.n ?? r.users));
    return `<div class="bars">${rows.map((r) => `<div class="bar"><span>${esc(labelFn(r))}</span><em>${r.n ?? r.users}</em><i><u style="width:${Math.round(((r.n ?? r.users) / max) * 100)}%"></u></i></div>`).join("") || `<p class="muted">Пока нет данных</p>`}</div>`;
  };
  const st = (k) => s.byStatus.find((x) => x.key === k)?.n || 0;
  return `<div class="tiles">
      ${tile(s.users.total, "пользователей", `+${s.users.d7} за неделю`)}
      ${tile(s.leads.total, "заявок всего", `${s.leads.d1} сегодня · ${s.leads.d7} за неделю`)}
      ${tile(s.leads.d30, "заявок за месяц")}
      ${tile(s.conversion + "%", "открыл → отправил бриф", `${s.leads.app_brief_users} из ${s.users.opened}`)}
      ${tile(s.users.started, "начали бриф")}
      ${tile(s.projects.published, "проектов в портфолио")}
    </div>
    <div class="form">
      <h4>Заявки по статусам</h4>${bars(Object.keys(STATUS).map((k) => ({ key: k, n: st(k) })), (r) => STATUS[r.key])}
      <h4>Услуги</h4>${bars(s.byService, (r) => X.C.optLabel("services", r.key, "ru"))}
      <h4>Языки</h4>${bars(s.byLang, (r) => ({ ru: "Русский", uz: "O'zbekcha", tr: "Türkçe" }[r.key] || r.key))}
      <h4>Источники</h4>${bars(s.bySource, (r) => `${r.key} · заявок: ${r.leads}`)}
      <p class="muted">ИИ: ${A.ai ? "подключён" : "не подключён — бот работает по сценариям"}. Метки источника — команда /links в чате с ботом.</p>
    </div>`;
}

// ---------- Actions ----------
const confirmBox = (text) => new Promise((res) => {
  if (X.tg?.showConfirm) { try { return X.tg.showConfirm(text, (ok) => res(!!ok)); } catch { /* fall through */ } }
  res(window.confirm(text));
});

async function upload(files) {
  const label = document.querySelector("#upload-label");
  for (const f of files) {
    if (label) label.textContent = "Загружаю…";
    const r = await X.call("/api/admin/upload-url", { type: f.type, size: f.size });
    if (!r.ok) { X.toast(r.error === "size" ? "Файл больше 50 МБ" : r.error === "type" ? "Подходят JPG, PNG, WebP, MP4, MOV" : "Не получилось загрузить"); continue; }
    try {
      const put = await fetch(r.upload_url, { method: "PUT", headers: { "content-type": f.type, "cache-control": "max-age=31536000" }, body: f });
      if (!put.ok) throw new Error(String(put.status));
      A.edit.media.push({ type: r.kind, url: r.public_url });
    } catch { X.toast("Не получилось загрузить файл"); }
  }
  X.render();
}

export function input(el) {
  const path = el.dataset?.a;
  if (!path) return;
  setPath(A, path, el.type === "checkbox" ? el.checked : el.value);
}

export function change(el) {
  if (el.id === "a-file" && el.files?.length) return upload([...el.files]);
  const path = el.dataset?.a;
  if (!path) return;
  setPath(A, path, el.type === "checkbox" ? el.checked : el.value);
  if (path.startsWith("bc.segment")) refreshCount();
}

export async function act(name, el) {
  if (name === "a-tab") {
    A.tab = el.dataset.k; A.edit = null; X.render();
    if (A.tab === "leads") loadLeads();
    if (A.tab === "projects") loadProjects();
    if (A.tab === "broadcast") loadBroadcasts();
    if (A.tab === "stats") loadStats();
  } else if (name === "a-filter") { A.filter = el.dataset.k; X.render(); }
  else if (name === "a-lead") { const l = A.leads.find((x) => String(x.id) === el.dataset.id); if (l) leadSheet(l); }
  else if (name === "a-status") {
    const id = Number(el.dataset.id), status = el.dataset.k;
    const r = await X.call("/api/admin/lead/status", { id, status });
    if (!r.ok) return X.toast("Не получилось сохранить");
    const l = A.leads.find((x) => x.id === id);
    if (l) l.status = status;
    X.hap("ok"); X.toast("Статус: " + STATUS[status]);
    el.parentElement.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b === el));
    X.render();
  } else if (name === "a-copy") {
    const text = document.querySelector("#draft-text")?.textContent || "";
    try { await navigator.clipboard.writeText(text); X.toast("Скопировано"); } catch { X.toast("Выделите текст и скопируйте вручную"); }
  } else if (name === "a-reanalyze") {
    el.disabled = true; el.textContent = "Разбираю…";
    const r = await X.call("/api/admin/lead/reanalyze", { id: Number(el.dataset.id) });
    if (!r.ok) { el.disabled = false; el.textContent = "Разобрать с ИИ заново"; return X.toast("ИИ не ответил"); }
    const l = A.leads.find((x) => x.id === Number(el.dataset.id));
    if (l && r.ai) { l.ai = r.ai; leadSheet(l); }
  } else if (name === "a-export") {
    el.disabled = true;
    const r = await X.call("/api/admin/export", {});
    el.disabled = false;
    X.toast(r.ok ? "Файл отправлен вам в чат с ботом" : "Не получилось, попробуйте ещё раз");
  } else if (name === "a-new") { A.edit = blankProject(); A.editLang = "ru"; X.render(); window.scrollTo(0, 0); }
  else if (name === "a-edit") {
    const p = A.projects.find((x) => String(x.id) === el.dataset.id);
    if (!p) return;
    const copy = JSON.parse(JSON.stringify(p));
    for (const l of LANGS) copy.body[l] ??= { tagline: "", done: "" };
    copy.media ??= []; copy.metrics ??= [];
    A.edit = copy; A.editLang = "ru"; X.render(); window.scrollTo(0, 0);
  } else if (name === "a-cancel") { A.edit = null; X.render(); }
  else if (name === "a-elang") { A.editLang = el.dataset.k; X.render(); }
  else if (name === "a-tone") { A.edit.tone = el.dataset.k; X.render(); }
  else if (name === "a-media-del") { A.edit.media.splice(Number(el.dataset.i), 1); X.render(); }
  else if (name === "a-metric-add") { A.edit.metrics.push({ value: { ru: "", uz: "", tr: "" }, label: { ru: "", uz: "", tr: "" } }); X.render(); }
  else if (name === "a-metric-del") { A.edit.metrics.splice(Number(el.dataset.i), 1); X.render(); }
  else if (name === "a-save") {
    if (!A.edit.title.trim()) return X.toast("Напишите название проекта");
    el.disabled = true;
    const r = await X.call("/api/admin/project/save", A.edit);
    if (!r.ok) { el.disabled = false; return X.toast("Не получилось сохранить"); }
    A.projects = r.projects; A.edit = null; X.hap("ok"); X.toast("Сохранено");
    X.S.projects = r.projects.filter((p) => p.published);
    X.render();
  } else if (name === "a-delete") {
    if (!(await confirmBox("Удалить проект? Его фото и видео тоже удалятся."))) return;
    const r = await X.call("/api/admin/project/delete", { id: A.edit.id });
    if (r.ok) { A.projects = r.projects; A.edit = null; X.S.projects = r.projects.filter((p) => p.published); X.toast("Удалено"); X.render(); }
  } else if (name === "a-move") {
    const i = Number(el.dataset.i), j = i + Number(el.dataset.d);
    if (j < 0 || j >= A.projects.length) return;
    [A.projects[i], A.projects[j]] = [A.projects[j], A.projects[i]];
    X.render();
    const r = await X.call("/api/admin/project/sort", { ids: A.projects.map((p) => p.id) });
    if (r.ok) { A.projects = r.projects; X.S.projects = r.projects.filter((p) => p.published); }
  } else if (name === "a-ai-project") {
    const base = A.edit.body.ru.done || A.edit.body[A.editLang].done;
    if (!base.trim()) return X.toast("Сначала напишите пару слов о проекте");
    el.disabled = true; el.textContent = "ИИ пишет…";
    const r = await X.call("/api/admin/ai/write", { kind: "project", prompt: `Проект: ${A.edit.title}. ${A.edit.body.ru.tagline}`, base });
    if (!r.ok) { el.disabled = false; el.textContent = "✨ ИИ: улучшить и перевести на 3 языка"; return X.toast(r.error === "no_ai" ? "ИИ не подключён. Как подключить — в README" : "ИИ не ответил, попробуйте ещё раз"); }
    for (const l of LANGS) A.edit.body[l].done = r.texts[l] || A.edit.body[l].done;
    X.toast("Готово, проверьте тексты на трёх языках"); X.render();
  } else if (name === "a-blang") { A.bc.lang = el.dataset.k; X.render(); }
  else if (name === "a-ai-bc") {
    const base = A.bc.texts[A.bc.lang];
    if (!A.bc.prompt.trim() && !base.trim()) return X.toast("Напишите, о чём рассылка");
    el.disabled = true; el.textContent = "…";
    const r = await X.call("/api/admin/ai/write", { kind: "broadcast", prompt: A.bc.prompt, base });
    if (!r.ok) { el.disabled = false; el.textContent = "✨ ИИ"; return X.toast(r.error === "no_ai" ? "ИИ не подключён. Как подключить — в README" : "ИИ не ответил, попробуйте ещё раз"); }
    A.bc.texts = { ...A.bc.texts, ...r.texts };
    X.toast("Тексты готовы на трёх языках"); X.render();
  } else if (name === "a-bc-preview" || name === "a-bc-send") {
    const b = A.bc;
    if (!b.texts.ru.trim() && !b.texts.uz.trim() && !b.texts.tr.trim()) return X.toast("Напишите текст рассылки");
    const payload = { texts: b.texts, segment: b.segment, with_button: b.with_button };
    if (name === "a-bc-preview") {
      el.disabled = true;
      const r = await X.call("/api/admin/broadcast/preview", payload);
      el.disabled = false;
      if (r.ok) { b.count = r.count; X.toast("Предпросмотр отправлен вам в чат с ботом"); }
      else X.toast("Не получилось отправить предпросмотр");
      return;
    }
    if (!(await confirmBox(`Отправить рассылку? Получателей: ${b.count ?? "?"}. Отменить после отправки нельзя.`))) return;
    el.disabled = true;
    const r = await X.call("/api/admin/broadcast/send", payload);
    el.disabled = false;
    if (!r.ok) return X.toast(r.error === "empty" ? "В этом сегменте нет получателей" : "Не получилось отправить");
    X.hap("ok"); X.toast(`Рассылка запущена: ${r.count} получателей`);
    b.texts = { ru: "", uz: "", tr: "" }; b.prompt = "";
    loadBroadcasts();
  }
}
