// Muslimbek · SMM — Telegram Mini App (no build step, plain ES modules).
import { API } from "./config.js?v=1794593846";
import { UI } from "./i18n.js?v=1794593846";
import * as C from "./content.js?v=1794593846";

const tg = window.Telegram?.WebApp;
const initData = tg?.initData || "";
const qs = new URLSearchParams(location.search);
const $ = (s, r = document) => r.querySelector(s);

const S = {
  lang: C.pickLang(tg?.initDataUnsafe?.user?.language_code || navigator.language),
  user: null, projects: [], ai: false,
  screen: "home", filter: "all",
  draft: null, lead: null, result: null,
  brief: { step: 0, data: {}, rev: false, sending: false },
  faq: -1,
};

const t = (k) => UI[S.lang]?.[k] ?? UI.ru[k] ?? k;
const L = (o) => (o && (o[S.lang] || o.ru)) || "";
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const hap = (kind = "light") => { try { kind === "ok" ? tg?.HapticFeedback?.notificationOccurred("success") : tg?.HapticFeedback?.impactOccurred(kind); } catch { /* old client */ } };

const I = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5Z"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="M19 16v4M17 18h4"/></svg>',
  window: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18"/></svg>',
  chev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
  check: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  tg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 4.3 18.4 19c-.2 1-.9 1.3-1.7.8l-4.700-3.500-2.300 2.200c-.3.3-.5.5-1 .5l.3-4.800 8.700-7.900c.4-.3-.1-.5-.6-.2L6.400 12.900l-4.600-1.400c-1-.3-1-1 .2-1.500l18-6.900c.8-.3 1.600.2 1.500 1.200Z"/></svg>',
  ig: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor"/></svg>',
  mega: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1Z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
  gift: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 13h18M12 9v12M12 9c-1.500-3.500-6-3.500-5-1 .6 1.400 3 1 5 1Zm0 0c1.500-3.500 6-3.500 5-1-.6 1.400-3 1-5 1Z"/></svg>',
};

// ---------- Server ----------
export async function call(path, body) {
  try {
    const res = await fetch(API + path, {
      method: body ? "POST" : "GET",
      headers: { "content-type": "application/json", "x-init-data": initData },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({ ok: false, error: "bad_response" }));
    if (!res.ok && data.ok !== false) data.ok = false;
    return data;
  } catch {
    return { ok: false, error: "network" };
  }
}

// ---------- Small UI helpers ----------
let toastTimer;
export function toast(text) {
  const el = $("#toast");
  el.textContent = text;
  el.classList.add("in");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("in"), 2600);
}

export function openLink(url) {
  if (!url) return;
  try {
    if (/^https:\/\/t\.me\//.test(url) && tg?.openTelegramLink) return tg.openTelegramLink(url);
    if (tg?.openLink) return tg.openLink(url);
  } catch { /* fall through */ }
  window.open(url, "_blank");
}

let sheetOpen = false;
export function openSheet(html, full = false) {
  const root = $("#sheet-root");
  root.innerHTML = `<div class="sheet-back" data-act="sheet-close"></div><div class="sheet ${full ? "full" : ""}">${full ? "" : '<div class="grab"></div>'}${html}</div>`;
  sheetOpen = true;
  requestAnimationFrame(() => root.querySelectorAll(".sheet-back, .sheet").forEach((e) => e.classList.add("in")));
  syncBack();
}
export function closeSheet() {
  const root = $("#sheet-root");
  root.querySelectorAll(".sheet-back, .sheet").forEach((e) => e.classList.remove("in"));
  sheetOpen = false;
  setTimeout(() => { if (!sheetOpen) root.innerHTML = ""; }, 380);
  syncBack();
}

function applyTheme() {
  const light = tg?.colorScheme === "light";
  document.documentElement.dataset.theme = light ? "light" : "dark";
  const bg = light ? "#f4f2ee" : "#0b0b0e";
  try { tg?.setHeaderColor?.(bg); tg?.setBackgroundColor?.(bg); tg?.setBottomBarColor?.(bg); } catch { /* old client */ }
}

function syncBack() {
  const need = sheetOpen || ["brief", "result", "admin"].includes(S.screen);
  try { need ? tg?.BackButton?.show() : tg?.BackButton?.hide(); } catch { /* old client */ }
}

function onBack() {
  if (sheetOpen) return closeSheet();
  if (S.screen === "brief") return S.brief.step > 0 ? briefGo(S.brief.step - 1) : go("home");
  if (S.screen === "admin" && Admin?.back?.()) return;
  go("home");
}

export function go(screen) {
  S.screen = screen;
  render();
  window.scrollTo(0, 0);
  syncBack();
  try { screen === "brief" ? tg?.disableVerticalSwipes?.() : tg?.enableVerticalSwipes?.(); } catch { /* old client */ }
  if (screen === "cases") call("/api/event", { type: "view_portfolio" });
  if (screen === "services") call("/api/event", { type: "view_services" });
}

// ---------- Pieces ----------
function nav() {
  const item = (key, icon, label, cls = "") =>
    `<button data-act="nav" data-to="${key}" class="${cls} ${S.screen === key ? "on" : ""}">${cls === "cta" ? `<i>${icon}</i>` : icon}<span>${label}</span></button>`;
  return `<nav class="nav"><div class="nav-in">
    ${item("home", I.home, t("nav_home"))}${item("cases", I.grid, t("nav_cases"))}${item("brief", I.pen, t("nav_brief"), "cta")}
    ${item("services", I.layers, t("nav_services"))}${item("contacts", I.user, t("nav_contacts"))}
  </div></nav>`;
}

function topBar() {
  return `<header class="top">
    <div class="brand"><i>M</i>Muslimbek <span>SMM</span></div>
    <div class="top-actions">
      ${S.user?.is_admin ? `<button class="pill accent" data-act="admin">${t("admin")}</button>` : ""}
      <button class="pill" data-act="lang">${S.lang.toUpperCase()}</button>
    </div>
  </header>`;
}

function cover(p) {
  const m = (p.media || [])[0];
  if (m?.type === "image") return `<div class="cover"><img src="${esc(m.url)}" loading="lazy" alt=""></div>`;
  if (m?.type === "video") return `<div class="cover"><video src="${esc(m.url)}#t=0.1" muted playsinline preload="metadata"></video><span class="play">${I.play}</span></div>`;
  return genCover(p);
}
function genCover(p) {
  const metric = (p.metrics || [])[0];
  const body = p.body?.[S.lang] || p.body?.ru || {};
  const big = metric
    ? `<div class="big">${esc(L(metric.value))}<small>${esc(L(metric.label))}</small></div>`
    : `<div class="big word">${esc(p.title)}<small>${esc(body.tagline || "")}</small></div>`;
  return `<div class="cover tone-${esc(p.tone || "a")}"><div class="gen"><span class="tag">${esc(C.nicheLabel(p.niche, S.lang))}</span>${big}</div></div>`;
}

function projectCard(p) {
  const body = p.body?.[S.lang] || p.body?.ru || {};
  return `<button class="card" data-act="project" data-id="${p.id}">${cover(p)}
    <div class="card-body"><div><b>${esc(p.title)}</b><span>${esc(body.tagline || C.nicheLabel(p.niche, S.lang))}</span></div><div class="go">${I.chev}</div></div>
  </button>`;
}

function timeline(plan) {
  return `<div class="timeline">${plan.steps.map((s) => `
    <div class="tl"><div class="when">${esc(s.when)}</div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>${s.note ? `<div class="note">${esc(s.note)}</div>` : ""}</div>`).join("")}</div>`;
}

function faq() {
  return `<div class="faq">${C.FAQ.map((f, i) => {
    const [q, a] = f[S.lang] || f.ru;
    return `<div class="faq-item ${S.faq === i ? "open" : ""}"><button class="faq-q" data-act="faq" data-i="${i}"><span>${esc(q)}</span><i></i></button><div class="faq-a"><div><p>${esc(a)}</p></div></div></div>`;
  }).join("")}</div>`;
}

// ---------- Screens ----------
function home() {
  const hasDraft = S.draft && Object.keys(S.draft.data || {}).length > 0;
  const notice = hasDraft
    ? `<button class="notice" data-act="nav" data-to="brief"><div class="dot">${I.pen.replace("<svg", '<svg width="20" height="20"')}</div><div><b>${t("continue_brief")}</b><span>${t("continue_hint")}</span></div><div class="chev">${I.chev}</div></button>`
    : S.lead
    ? `<button class="notice" data-act="show-plan"><div class="dot">${I.check.replace(/width="34" height="34"/, 'width="20" height="20"')}</div><div><b>${t("lead_ok")}</b><span>${t("lead_ok_hint")}</span></div><div class="chev">${I.chev}</div></button>`
    : "";
  const stat = (k) => `<div class="stat"><b>${esc(t(k)[0])}</b><span>${esc(t(k)[1])}</span></div>`;
  return `<div class="page">${topBar()}
    <section class="hero">
      <div class="eyebrow">${t("eyebrow")}</div>
      <h1>${t("hero_title")}</h1>
      <p>${t("hero_sub")}</p>
      <div class="hero-cta">
        <button class="btn primary" data-act="nav" data-to="brief">${t("cta_brief")}<small>${t("cta_brief_time")}</small></button>
        <button class="btn ghost" data-act="audit">${I.gift}${t("cta_audit")}</button>
      </div>
      ${notice}
      <div class="stats">${stat("stat1")}${stat("stat2")}${stat("stat3")}</div>
    </section>
    ${S.projects.length ? `<section class="sec"><div class="sec-head"><h2>${t("sec_cases")}</h2><button data-act="nav" data-to="cases">${t("all")}</button></div>
      <div class="rail">${S.projects.slice(0, 5).map(projectCard).join("")}</div></section>` : ""}
    <section class="sec"><div class="sec-head"><h2>${t("sec_how")}</h2></div>
      <div class="panel">${timeline(C.buildPlan({}, S.lang))}<div class="foot-note">${esc(C.PLAN_FOOT[S.lang])}</div></div></section>
    <section class="sec"><div class="sec-head"><h2>${t("sec_faq")}</h2></div>${faq()}</section>
    <section class="sec"><button class="btn primary" data-act="nav" data-to="brief">${t("cta_brief")}<small>${t("cta_brief_time")}</small></button></section>
  </div>${nav()}`;
}

function cases() {
  const niches = [...new Set(S.projects.map((p) => p.niche))];
  const list = S.filter === "all" ? S.projects : S.projects.filter((p) => p.niche === S.filter);
  const chip = (key, label, n) => `<button class="chip ${S.filter === key ? "on" : ""}" data-act="filter" data-key="${key}">${esc(label)}<em>${n}</em></button>`;
  return `<div class="page">${topBar()}<h1 class="page-title">${t("sec_cases")}</h1>
    ${niches.length > 1 ? `<div class="chips">${chip("all", t("all"), S.projects.length)}${niches.map((n) => chip(n, C.nicheLabel(n, S.lang), S.projects.filter((p) => p.niche === n).length)).join("")}</div>` : ""}
    <div class="grid">${list.map(projectCard).join("") || `<div class="empty">—</div>`}</div>
    <section class="sec"><button class="btn primary" data-act="nav" data-to="brief">${t("want_same")}</button></section>
  </div>${nav()}`;
}

function services() {
  return `<div class="page">${topBar()}<h1 class="page-title">${t("sec_services")}</h1>
    ${C.SERVICES.map((s) => {
      const x = s[S.lang] || s.ru;
      return `<div class="svc"><div class="svc-head"><div class="svc-ico">${I[s.icon] || I.spark}</div><h3>${esc(x.title)}</h3></div>
        <p>${esc(x.text)}</p><ul>${x.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
        <button class="btn soft slim" data-act="discuss" data-key="${s.key}">${t("discuss")}</button></div>`;
    }).join("")}
    <section class="sec"><div class="sec-head"><h2>${t("sec_faq")}</h2></div>${faq()}</section>
  </div>${nav()}`;
}

function contacts() {
  const link = (act, url, icon, title, sub) => `<button class="link" data-act="${act}" data-url="${url}"><div class="li">${icon}</div><div><b>${title}</b><span>${sub}</span></div><div class="chev">${I.chev}</div></button>`;
  return `<div class="page">${topBar()}<h1 class="page-title">${t("contacts")}</h1>
    <div class="me"><div class="ava">M</div><div><b>Muslimbek</b><span>${t("role")}</span></div></div>
    <div class="links">
      ${link("contact", C.CONTACTS.telegram, I.tg, t("c_tg"), C.CONTACTS.telegramHandle)}
      ${link("contact", C.CONTACTS.channel, I.mega, t("c_channel"), C.CONTACTS.channelHandle)}
      ${link("contact", C.CONTACTS.instagram, I.ig, t("c_ig"), C.CONTACTS.instagramHandle)}
    </div>
    <section class="sec"><div class="panel"><h2 style="font-size:20px;font-weight:800;letter-spacing:-.02em">${t("audit_title")}</h2><p class="lead" style="color:var(--muted);margin:8px 0 16px;font-size:15px">${t("audit_text")}</p>
      <button class="btn primary slim" data-act="audit">${t("audit_btn")}</button></div></section>
  </div>${nav()}`;
}

// ---------- Brief ----------
const STEPS = [
  { kind: "multi", key: "services", title: "s1", hint: "s1_hint", valid: (d) => d.services?.length > 0 },
  { kind: "single", key: "goal", title: "s2", valid: (d) => !!d.goal },
  { kind: "business", title: "s3", valid: (d) => (d.business || "").trim().length >= 2 },
  { kind: "audience", title: "s4", optional: true, valid: () => true },
  { kind: "sources", title: "s5", hint: "s5_hint", optional: true, valid: () => true },
  { kind: "single", key: "budget", title: "s6", hint: "s6_hint", valid: (d) => !!d.budget },
  { kind: "single", key: "start", title: "s7", valid: (d) => !!d.start },
  { kind: "contact", title: "s8", valid: (d) => (d.name || "").trim().length >= 2 && (d.contact || "").trim().length >= 3 },
  { kind: "summary", title: "s9", valid: (d) => (d.name || "").trim() && (d.contact || "").trim() && (d.business || "").trim() },
];

function briefInit() {
  const d = { ...(S.draft?.data || {}) };
  if (!d.name) d.name = S.user?.first_name || "";
  if (!d.contact_type) d.contact_type = "telegram";
  if (!d.contact && d.contact_type === "telegram" && S.user?.username) d.contact = "@" + S.user.username;
  S.brief = { step: Math.min(S.draft?.step || 0, STEPS.length - 1), data: d, rev: false, sending: false };
}

function opts(field, multi) {
  const d = S.brief.data;
  const isOn = (k) => (multi ? (d[field] || []).includes(k) : d[field] === k);
  return `<div class="opts">${C.OPTIONS[field].map((o) =>
    `<button class="opt ${multi ? "" : "radio"} ${isOn(o.key) ? "on" : ""}" data-act="${multi ? "opt-multi" : "opt-single"}" data-f="${field}" data-k="${o.key}"><span>${esc(o[S.lang] || o.ru)}</span><span class="box"></span></button>`).join("")}</div>`;
}
function chipsFor(field, multi) {
  const d = S.brief.data;
  const isOn = (k) => (multi ? (d[field] || []).includes(k) : d[field] === k);
  return `<div class="chips wrap">${C.OPTIONS[field].map((o) =>
    `<button class="chip ${isOn(o.key) ? "on" : ""}" data-act="${multi ? "opt-multi" : "chip-single"}" data-f="${field}" data-k="${o.key}">${esc(o[S.lang] || o.ru)}</button>`).join("")}</div>`;
}
const input = (f, label, ph, extra = "") => `<div class="field"><label>${label}</label><input class="input" data-f="${f}" value="${esc(S.brief.data[f] || "")}" placeholder="${esc(ph)}" autocomplete="off" ${extra}></div>`;
const area = (f, label, ph) => `<div class="field"><label>${label}</label><textarea class="textarea" data-f="${f}" placeholder="${esc(ph)}" rows="3">${esc(S.brief.data[f] || "")}</textarea></div>`;

function briefStep() {
  const st = STEPS[S.brief.step];
  const d = S.brief.data;
  let body = "";
  if (st.kind === "multi") body = opts(st.key, true);
  else if (st.kind === "single") body = opts(st.key, false);
  else if (st.kind === "business") {
    body = `<div class="fields">${area("business", t("f_business"), t("p_business"))}
      <div class="field"><label>${t("f_niche")}</label>${chipsFor("niche", false)}</div>
      ${input("instagram", t("f_instagram"), t("p_instagram"), 'autocapitalize="off" inputmode="url"')}</div>`;
  } else if (st.kind === "audience") {
    body = `<div class="fields">${area("audience", t("f_audience"), t("p_audience"))}${input("geo", t("f_geo"), t("p_geo"))}</div>`;
  } else if (st.kind === "sources") {
    body = `${opts("sources", true)}<div class="fields"><div class="field"><label>${t("f_leads")}</label>${chipsFor("leads_pm", false)}</div></div>`;
  } else if (st.kind === "contact") {
    const ct = d.contact_type || "telegram";
    body = `<div class="fields">${input("name", t("f_name"), "", 'autocomplete="given-name"')}
      <div class="field"><div class="seg">${C.OPTIONS.contact_type.map((o) => `<button class="${ct === o.key ? "on" : ""}" data-act="contact-type" data-k="${o.key}">${esc(o[S.lang] || o.ru)}</button>`).join("")}</div></div>
      ${input("contact", t("f_contact_" + ct), ct === "telegram" ? "@username" : t("p_phone"), ct === "telegram" ? 'autocapitalize="off"' : 'inputmode="tel"')}</div>`;
  } else if (st.kind === "summary") {
    body = `<div class="summary">${C.briefRows(d, S.lang).filter(([k]) => k !== C.FIELD_LABELS.comment[S.lang]).map(([k, v]) => `<div class="row"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div>
      <div class="fields">${area("comment", t("f_comment"), t("p_comment"))}</div>`;
  }
  const last = S.brief.step === STEPS.length - 1;
  const ok = !!st.valid(d);
  return `<div class="brief">
    <div class="brief-top"><button class="back" data-act="brief-back">${I.back}</button>
      <div class="progress"><i style="width:${Math.round(((S.brief.step + 1) / STEPS.length) * 100)}%"></i></div>
      <div class="count">${S.brief.step + 1}/${STEPS.length}</div></div>
    <div class="step ${S.brief.rev ? "rev" : ""}"><h1>${t(st.title)}</h1>${st.hint ? `<p class="hint">${t(st.hint)}</p>` : ""}${body}</div>
    <div class="brief-foot">
      <button class="btn primary" id="brief-next" data-act="${last ? "brief-send" : "brief-next"}" ${ok && !S.brief.sending ? "" : "disabled"}>${last ? (S.brief.sending ? t("sending") : t("send")) : t("next")}</button>
      ${st.optional ? `<button class="skip" data-act="brief-next">${t("skip")}</button>` : ""}
    </div></div>`;
}

function refreshNext() {
  const btn = $("#brief-next");
  if (btn) btn.disabled = !STEPS[S.brief.step].valid(S.brief.data) || S.brief.sending;
}

let draftTimer;
function saveDraft(now = false) {
  clearTimeout(draftTimer);
  const fire = () => { S.draft = { data: { ...S.brief.data }, step: S.brief.step }; call("/api/brief/draft", S.draft); };
  now ? fire() : (draftTimer = setTimeout(fire, 1200));
}

function briefGo(step) {
  S.brief.rev = step < S.brief.step;
  S.brief.step = Math.max(0, Math.min(STEPS.length - 1, step));
  render();
  window.scrollTo(0, 0);
  saveDraft(true);
}

async function briefSend() {
  if (S.brief.sending) return;
  S.brief.sending = true;
  clearTimeout(draftTimer);
  render();
  const r = await call("/api/brief/submit", { data: S.brief.data });
  S.brief.sending = false;
  if (!r.ok) {
    render();
    return toast(r.error === "fields" ? t("err_fields") : t("err_net"));
  }
  hap("ok");
  S.result = { lead_id: r.lead_id, plan: r.plan, waiting: !!r.ai };
  S.lead = { id: r.lead_id, plan: r.plan };
  S.draft = null;
  go("result");
  if (r.ai) pollPlan(r.lead_id);
}

async function pollPlan(id) {
  for (let i = 0; i < 10; i++) {
    await new Promise((res) => setTimeout(res, 2000));
    const r = await call(`/api/brief/plan?lead=${id}`);
    if (r.ok && r.ready) {
      if (S.result?.lead_id === id) { S.result.plan = r.plan; S.result.waiting = false; S.lead.plan = r.plan; if (S.screen === "result") render(); }
      return;
    }
  }
  if (S.result?.lead_id === id) { S.result.waiting = false; if (S.screen === "result") render(); }
}

function result() {
  const r = S.result || (S.lead && { plan: S.lead.plan, waiting: false });
  if (!r) return home();
  return `<div class="page" style="padding-bottom:calc(var(--safe-b) + 30px)">
    <div class="done"><div class="check">${I.check}</div><h1>${t("done_title")}</h1><p>${t("done_sub")}</p></div>
    <div class="panel">
      <div class="sec-head" style="margin-bottom:16px"><h2>${t("plan_title")}</h2></div>
      ${r.waiting ? `<div class="shimmer"><i></i>${t("personalizing")}</div>` : ""}
      ${r.plan.intro ? `<div class="intro-note">${esc(r.plan.intro)}</div>` : ""}
      ${timeline(r.plan)}
      <div class="foot-note">${esc(r.plan.foot)}</div>
    </div>
    <div class="stack">
      <button class="btn primary" data-act="contact" data-url="${C.CONTACTS.telegram}">${I.tg}${t("write_me")}</button>
      <button class="btn ghost" data-act="nav" data-to="cases">${t("see_cases")}</button>
    </div></div>`;
}

// ---------- Sheets ----------
function projectSheet(p) {
  const body = p.body?.[S.lang] || p.body?.ru || {};
  const media = (p.media || []).map((m) => m.type === "video"
    ? `<div><video src="${esc(m.url)}#t=0.1" controls playsinline preload="metadata"></video></div>`
    : `<div><img src="${esc(m.url)}" alt=""></div>`).join("");
  openSheet(`<button class="sheet-close" data-act="sheet-close">${I.x}</button>
    <div class="gallery">${media || `<div>${genCover(p).replace('class="cover', 'style="height:100%" class="cover')}</div>`}</div>
    <div class="proj-title"><h2>${esc(p.title)}</h2><span class="badge">${esc(C.nicheLabel(p.niche, S.lang))}</span></div>
    ${body.tagline ? `<p class="lead">${esc(body.tagline)}</p>` : ""}
    ${(p.metrics || []).length ? `<div class="metrics">${p.metrics.map((m) => `<div class="metric"><b>${esc(L(m.value))}</b><span>${esc(L(m.label))}</span></div>`).join("")}</div>` : ""}
    ${body.done ? `<div class="prose"><b>${t("what_done")}</b>${esc(body.done)}</div>` : ""}
    <div class="stack">
      ${p.instagram ? `<button class="btn ghost slim" data-act="open" data-url="${esc(p.instagram)}">${I.ig}${t("open_ig")}</button>` : ""}
      ${p.link ? `<button class="btn ghost slim" data-act="open" data-url="${esc(p.link)}">${I.window.replace("<svg", '<svg width="20" height="20"')}${t("open_site")}</button>` : ""}
      <button class="btn primary" data-act="nav" data-to="brief">${t("want_same")}</button>
    </div>`, true);
  call("/api/event", { type: "view_project", meta: { id: p.id } });
}

function auditSheet() {
  openSheet(`<h2>${t("audit_title")}</h2><p class="lead">${t("audit_text")}</p>
    <div class="form"><input class="input" id="audit-ig" placeholder="${esc(t("p_instagram"))}" autocapitalize="off" autocomplete="off">
    <button class="btn primary" data-act="audit-send">${t("audit_btn")}</button></div>`);
  setTimeout(() => $("#audit-ig")?.focus(), 400);
}

function langSheet() {
  openSheet(`<h2>${t("lang_title")}</h2><div class="langs">${C.LANGS.map((l) =>
    `<button class="opt radio ${S.lang === l ? "on" : ""}" data-act="set-lang" data-k="${l}"><span>${C.LANG_NAMES[l]}</span><span class="box"></span></button>`).join("")}</div>`);
}

// ---------- Render ----------
let Admin = null;
export function render() {
  const app = $("#app");
  if (S.screen === "home") app.innerHTML = home();
  else if (S.screen === "cases") app.innerHTML = cases();
  else if (S.screen === "services") app.innerHTML = services();
  else if (S.screen === "contacts") app.innerHTML = contacts();
  else if (S.screen === "brief") app.innerHTML = briefStep();
  else if (S.screen === "result") app.innerHTML = result();
  else if (S.screen === "admin" && Admin) app.innerHTML = Admin.view();
  else app.innerHTML = home();
  document.documentElement.lang = S.lang;
}

async function openAdmin(target = "") {
  if (!S.user?.is_admin) return;
  if (!Admin) {
    Admin = await import("./admin.js?v=1794593846");
    Admin.init({ S, C, I, call, render, toast, openSheet, closeSheet, openLink, esc, tg, hap, go });
  }
  S.screen = "admin";
  render();
  syncBack();
  await Admin.open(target);
}

// ---------- Actions ----------
const ACTS = {
  nav(el) {
    closeSheet();
    const to = el.dataset.to;
    if (to === "brief") { if (S.screen !== "brief") briefInit(); }
    hap();
    go(to);
  },
  admin() { openAdmin(); },
  lang() { langSheet(); },
  async "set-lang"(el) {
    S.lang = el.dataset.k;
    closeSheet();
    render();
    await call("/api/lang", { lang: S.lang });
    const r = await call("/api/init", {});
    if (r.ok) { S.projects = r.projects; S.lead = r.last_lead; if (S.result && r.last_lead) S.result.plan = r.last_lead.plan; render(); }
  },
  faq(el) { const i = Number(el.dataset.i); S.faq = S.faq === i ? -1 : i; hap(); document.querySelectorAll(".faq-item").forEach((e, n) => e.classList.toggle("open", n % C.FAQ.length === S.faq)); },
  filter(el) { S.filter = el.dataset.key; hap(); render(); },
  project(el) { const p = S.projects.find((x) => String(x.id) === el.dataset.id); if (p) { hap(); projectSheet(p); } },
  open(el) { openLink(el.dataset.url); },
  contact(el) { call("/api/event", { type: "contact_click" }); openLink(el.dataset.url); },
  "sheet-close"() { closeSheet(); },
  audit() { hap(); call("/api/event", { type: "audit_click" }); auditSheet(); },
  async "audit-send"(el) {
    const v = ($("#audit-ig")?.value || "").trim();
    if (v.length < 2) return $("#audit-ig")?.focus();
    el.disabled = true;
    const r = await call("/api/audit", { instagram: v });
    if (!r.ok) { el.disabled = false; return toast(t("err_net")); }
    hap("ok");
    openSheet(`<div class="done"><div class="check">${I.check}</div><h1>${t("done_title")}</h1><p>${t("audit_ok")}</p></div>
      <button class="btn primary" data-act="nav" data-to="brief">${t("cta_brief")}<small>${t("cta_brief_time")}</small></button>`);
  },
  discuss(el) { briefInit(); const k = el.dataset.key; const cur = S.brief.data.services || []; if (!cur.includes(k)) S.brief.data.services = [...cur, k]; S.brief.step = 0; hap(); go("brief"); },
  "show-plan"() { S.result = null; go("result"); },
  "opt-multi"(el) {
    const f = el.dataset.f, k = el.dataset.k, d = S.brief.data;
    const cur = new Set(d[f] || []);
    cur.has(k) ? cur.delete(k) : cur.add(k);
    d[f] = [...cur];
    el.classList.toggle("on");
    hap(); refreshNext(); saveDraft();
  },
  "opt-single"(el) {
    const f = el.dataset.f;
    S.brief.data[f] = el.dataset.k;
    el.parentElement.querySelectorAll(".opt").forEach((e) => e.classList.toggle("on", e === el));
    hap(); refreshNext();
    const step = S.brief.step;
    setTimeout(() => { if (S.screen === "brief" && S.brief.step === step) briefGo(step + 1); }, 260);
  },
  "chip-single"(el) {
    const f = el.dataset.f, k = el.dataset.k;
    S.brief.data[f] = S.brief.data[f] === k ? undefined : k;
    el.parentElement.querySelectorAll(".chip").forEach((e) => e.classList.toggle("on", e === el && S.brief.data[f] === k));
    hap(); saveDraft();
  },
  "contact-type"(el) {
    const d = S.brief.data, k = el.dataset.k;
    if (d.contact_type === k) return;
    d.contact_type = k;
    if (k === "telegram") d.contact = S.user?.username ? "@" + S.user.username : "";
    else if ((d.contact || "").startsWith("@")) d.contact = "";
    hap(); render();
  },
  "brief-next"() { if (S.brief.step < STEPS.length - 1) { hap(); briefGo(S.brief.step + 1); } },
  "brief-back"() { onBack(); },
  "brief-send"() { briefSend(); },
  retry() { location.reload(); },
};

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const act = el.dataset.act;
  if (ACTS[act]) return ACTS[act](el, e);
  if (Admin) Admin.act(act, el, e);
});

document.addEventListener("input", (e) => {
  const el = e.target;
  if (S.screen === "brief" && el.dataset?.f && !el.closest("#sheet-root")) {
    S.brief.data[el.dataset.f] = el.value;
    refreshNext();
    saveDraft();
    return;
  }
  if (Admin) Admin.input?.(el, e);
});
document.addEventListener("change", (e) => { if (Admin) Admin.change?.(e.target, e); });

// Keep the focused field visible above the keyboard.
document.addEventListener("focusin", (e) => {
  if (e.target.matches?.("input, textarea")) setTimeout(() => e.target.scrollIntoView({ block: "center", behavior: "smooth" }), 250);
});

// ---------- Boot ----------
async function boot() {
  applyTheme();
  try {
    tg?.ready(); tg?.expand();
    tg?.onEvent?.("themeChanged", applyTheme);
    tg?.BackButton?.onClick(onBack);
  } catch { /* outside Telegram */ }

  if (!initData) {
    $("#app").innerHTML = `<div class="err-screen"><div><h1>${t("err_tg")}</h1><p>${t("err_tg_text")}</p><a class="btn primary" href="https://t.me/Muslim_designer_bot">${t("open_bot")}</a></div></div>`;
    return;
  }
  const r = await call("/api/init", { start_param: tg?.initDataUnsafe?.start_param || "" });
  if (!r.ok) {
    $("#app").innerHTML = `<div class="err-screen"><div><h1>${t("err_net")}</h1><p></p><button class="btn primary" data-act="retry">${t("retry")}</button></div></div>`;
    return;
  }
  S.user = r.user; S.lang = r.user.lang || S.lang; S.projects = r.projects || []; S.draft = r.draft; S.lead = r.last_lead; S.ai = r.ai;

  const target = qs.get("go") || "";
  if (target === "brief") { briefInit(); go("brief"); }
  else if (target === "portfolio") go("cases");
  else if ((target === "admin" || target.startsWith("lead_")) && S.user.is_admin) { render(); await openAdmin(target); }
  else go("home");
}
boot();
