//@prelude2
const page = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(page);
for (const n of [...page.children]) if (n.name === "Структура сайта · вайрфреймы") n.remove();
const explo = page.children.find(n => n.name === "Поиск стиля");
const TH = "Light";
function F(dir, o = {}) { const f = figma.createFrame(); f.layoutMode = dir; f.primaryAxisSizingMode = "AUTO"; f.counterAxisSizingMode = "AUTO"; f.fills = []; for (const k in o) f[k] = o[k]; return f; }
async function T(s, style, color = "color/text/primary", w) { const t = await txt(s, style, color, TH); if (w) { t.resize(w, t.height); t.textAutoResize = "HEIGHT"; } return t; }
function bar(w, h = 6, tok = "color/border/default") { const r = figma.createRectangle(); r.resize(w, h); r.cornerRadius = 3; r.fills = [paint(tok, TH)]; return r; }
async function ctaPill(label = "Консультация") { const p = F("HORIZONTAL", { paddingTop: 4, paddingBottom: 4, paddingLeft: 10, paddingRight: 10, name: "CTA" }); rad(p, "radius/full"); p.fills = [paint("color/bg/accent", TH)]; const t = await txt(label, "Label", "color/text/on-accent", TH); t.fontSize = 11; p.appendChild(t); return p; }
async function linkPill(label) { const p = F("HORIZONTAL", { paddingTop: 4, paddingBottom: 4, paddingLeft: 10, paddingRight: 10, name: "Link" }); rad(p, "radius/full"); p.fills = [paint("color/bg/accent-subtle", TH)]; p.strokes = [paint("color/border/accent-subtle", TH)]; p.strokeWeight = 1; const t = await txt(label, "Label", "color/text/accent", TH); t.fontSize = 11; p.appendChild(t); return p; }
// One section block of a page schematic
async function block(W, [name, h, desc, cta, link, dark]) {
  const b = F("VERTICAL", { name: `Block · ${name}`, itemSpacing: 8, paddingTop: 14, paddingBottom: 14, paddingLeft: 16, paddingRight: 16 });
  b.resize(W, h); b.primaryAxisSizingMode = "FIXED"; b.counterAxisSizingMode = "FIXED"; rad(b, "radius/md"); glass(b, dark ? "Dark" : TH);
  if (dark) b.fills = [paint("color/bg/inverse", TH)];
  const nm = await txt(name, "Label", dark ? "color/text/on-inverse" : "color/text/primary", TH); nm.fontName = { family: "Inter", style: "Semi Bold" }; b.appendChild(nm);
  if (desc) { const d = await txt(desc, "Body/S", dark ? "color/text/on-inverse-muted" : "color/text/secondary", TH); d.fontSize = 12; b.appendChild(d); d.resize(W - 32, d.height); d.textAutoResize = "HEIGHT"; }
  const restH = h - 60 - (desc ? 34 : 0);
  if (restH > 14) { const ph = F("VERTICAL", { itemSpacing: 6 }); for (let i = 0; i < Math.min(3, Math.floor(restH / 14)); i++) ph.appendChild(bar((W - 32) * [0.9, 0.7, 0.5][i], 6, dark ? "color/border/inverse" : "color/border/default")); b.appendChild(ph); }
  if (cta || link) { const r = F("HORIZONTAL", { itemSpacing: 6 }); if (cta) r.appendChild(await ctaPill(cta === true ? "Консультация" : cta)); if (link) r.appendChild(await linkPill(link)); b.appendChild(r); }
  return b;
}
async function pageCol(title, file, W, blocks) {
  const col = F("VERTICAL", { name: `Page · ${title}`, itemSpacing: 8 });
  const hd = F("VERTICAL", { itemSpacing: 2, paddingBottom: 6 }); hd.appendChild(await T(title, "Heading/H4")); hd.appendChild(await T(file, "Body/S", "color/text/tertiary")); col.appendChild(hd);
  const frame = F("VERTICAL", { name: "Screen", itemSpacing: 8, paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10 }); rad(frame, "radius/lg");
  frame.fills = [paint("color/bg/page", TH)]; frame.strokes = [paint("color/border/glass-strong", TH)]; frame.strokeWeight = 1;
  for (const bl of blocks) frame.appendChild(await block(W, bl));
  col.appendChild(frame); return col;
}
async function prosCons(pros, cons, w) {
  const c = F("HORIZONTAL", { itemSpacing: 20, name: "Pros / Cons" });
  for (const [ok, items, title] of [[true, pros, "Плюсы"], [false, cons, "Минусы"]]) {
    const card = F("VERTICAL", { itemSpacing: 10, paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 }); card.resize(w, 10); card.counterAxisSizingMode = "FIXED"; card.primaryAxisSizingMode = "AUTO"; rad(card, "radius/xl"); glass(card, TH);
    card.appendChild(await T(title, "Heading/H4"));
    for (const it of items) { const r = F("HORIZONTAL", { itemSpacing: 10 }); card.appendChild(r); r.layoutSizingHorizontal = "FILL"; const t0 = await T(ok ? "+" : "−", "Label", ok ? "color/text/accent" : "color/text/error"); r.appendChild(t0); const t = await T(it, "Body/S", "color/text/secondary"); r.appendChild(t); t.layoutGrow = 1; t.textAutoResize = "HEIGHT"; }
    c.appendChild(card);
  }
  return c;
}
const HDR = ["Шапка (sticky)", 64, "Логотип · меню · RU/UZ/EN · тема", true];
const FTR = ["Подвал", 92, "Соцсети · меню · адрес · реквизиты", false, null, true];

// ---------- root
const root = F("VERTICAL", { name: "Структура сайта · вайрфреймы", itemSpacing: 64, paddingTop: 96, paddingBottom: 96, paddingLeft: 96, paddingRight: 96 });
root.fills = [paint("color/bg/page", TH)]; root.clipsContent = true; rad(root, "radius/2xl");
page.appendChild(root); root.x = 0; root.y = explo ? explo.y + explo.height + 400 : 0;
const g = figma.createEllipse(); g.name = "Glow"; g.resize(1200, 500); g.fills = [{ ...paint("color/glow/primary", TH), opacity: 0.22 }]; g.effects = [{ type: "LAYER_BLUR", radius: 220, visible: true }]; root.appendChild(g); g.layoutPositioning = "ABSOLUTE"; g.x = 200; g.y = -260;
const head = F("VERTICAL", { itemSpacing: 14 }); root.appendChild(head);
head.appendChild(await T("Этап 3 · структура сайта", "Overline", "color/text/accent"));
head.appendChild(await T("Два варианта структуры", "Heading/H1"));
head.appendChild(await T("Вайрфреймы показывают порядок блоков и где стоят кнопки обратной связи. Все кнопки «Консультация» ведут на Google Form; плавающая кнопка Telegram/WhatsApp и шапка с CTA видны на любом экране. Сайт на трёх языках (RU / UZ / EN) и в двух темах.", "Body/L", "color/text/secondary", 980));
const legend = F("HORIZONTAL", { itemSpacing: 24, counterAxisAlignItems: "CENTER" }); head.appendChild(legend);
legend.appendChild(await ctaPill()); legend.appendChild(await T("кнопка «Получить консультацию» → Google Form", "Body/S", "color/text/secondary"));
legend.appendChild(await linkPill("→ страница")); legend.appendChild(await T("переход на другую страницу", "Body/S", "color/text/secondary"));
const dk = F("HORIZONTAL", { paddingTop: 4, paddingBottom: 4, paddingLeft: 10, paddingRight: 10 }); rad(dk, "radius/full"); dk.fills = [paint("color/bg/inverse", TH)]; const dkt = await txt("тёмный блок", "Label", "color/text/on-inverse", TH); dkt.fontSize = 11; dk.appendChild(dkt); legend.appendChild(dk); legend.appendChild(await T("акцентная тёмная секция", "Body/S", "color/text/secondary"));

// ---------- Variant A
const A = F("VERTICAL", { name: "Вариант A", itemSpacing: 32, paddingTop: 48, paddingBottom: 48, paddingLeft: 48, paddingRight: 48 }); rad(A, "radius/2xl"); glass(A, TH); root.appendChild(A);
A.appendChild(await T("Вариант A", "Overline", "color/text/accent"));
A.appendChild(await T("Лендинг + страница консультации", "Heading/H2"));
A.appendChild(await T("Все разделы на одной длинной странице с якорной навигацией. «Бесплатная консультация» — отдельная страница с описанием процесса, сроками и FAQ. Итого 2 страницы × 3 языка = 6 HTML.", "Body/M", "color/text/secondary", 900));
const aRow = F("HORIZONTAL", { itemSpacing: 48 }); A.appendChild(aRow);
const W = 340;
aRow.appendChild(await pageCol("Главная (лендинг)", "index.html", W, [
  HDR,
  ["Hero", 200, "Заголовок, подзаголовок, CTA + Telegram, свечение за курсором", true],
  ["Цифры доверия", 80, "15+ лет · 1 200+ дел · 94% · ответ за 24 ч"],
  ["О нас", 130, "История, миссия, лицензии и членство в Палате адвокатов"],
  ["Преимущества", 100, "Профессионализм · конфиденциальность · результат"],
  ["Услуги", 170, "Бизнес-право, гражданские, уголовные, семейные, налоговые… карточками", true],
  ["Кейсы", 150, "3–4 истории «ситуация → результат» без имён"],
  ["Команда", 150, "Фото + короткая биография каждого адвоката"],
  ["Отзывы и клиенты", 130, "Отзывы с именами/компаниями + логотипы", true],
  ["Бесплатная консультация", 110, "Как проходит, сроки ответа", true, "→ подробнее", true],
  ["FAQ", 120, "5–6 частых вопросов: стоимость, процесс, гарантии"],
  ["Контакты", 150, "Адрес, карта, телефон, Telegram, WhatsApp", true],
  FTR,
]));
aRow.appendChild(await pageCol("Бесплатная консультация", "consultation.html", W, [
  HDR,
  ["Hero консультации", 180, "«Бесплатная онлайн-консультация», CTA на форму, Telegram и WhatsApp", true],
  ["Как проходит", 130, "4 шага: заявка → звонок юриста → разбор → план действий"],
  ["Сроки и конфиденциальность", 90, "Ответ в течение 24 ч, адвокатская тайна"],
  ["С какими вопросами", 110, "Категории вопросов + ссылки на услуги", false, "→ главная"],
  ["FAQ", 140, "Вопросы о консультации, стоимости, гарантиях"],
  ["Финальный CTA", 110, "Кнопка формы + мессенджеры + телефон", true, null, true],
  FTR,
]));
// notes column
const notesA = F("VERTICAL", { itemSpacing: 16 }); aRow.appendChild(notesA);
for (const [t, d] of [["Навигация", "Меню прокручивает к разделам (якоря). Пункт «Консультация» ведёт на отдельную страницу."], ["Обратная связь", "CTA в шапке, в hero, после услуг, отзывов, в блоке консультации и в контактах + плавающая кнопка Telegram/WhatsApp."], ["Мобильная версия", "Тот же порядок блоков, меню-бургер, плавающая кнопка мессенджера снизу."]]) {
  const c = F("VERTICAL", { itemSpacing: 6, paddingTop: 20, paddingBottom: 20, paddingLeft: 20, paddingRight: 20 }); c.resize(320, 10); c.counterAxisSizingMode = "FIXED"; c.primaryAxisSizingMode = "AUTO"; rad(c, "radius/lg"); glass(c, TH);
  c.appendChild(await T(t, "Label")); c.appendChild(await T(d, "Body/S", "color/text/secondary", 280)); notesA.appendChild(c);
}
const fab = F("HORIZONTAL", { itemSpacing: 8, counterAxisAlignItems: "CENTER", paddingTop: 10, paddingBottom: 10, paddingLeft: 14, paddingRight: 16, name: "Floating messenger" }); rad(fab, "radius/full"); glass(fab, TH, true);
fab.appendChild(await T("💬", "Label")); fab.appendChild(await T("Плавающая кнопка Telegram / WhatsApp", "Label")); notesA.appendChild(fab);
A.appendChild(await prosCons(["Быстрее сделать и проще поддерживать: 6 файлов вместо 27", "Посетитель видит всё за один скролл, CTA всегда рядом", "Идеально для рекламы и ссылок из соцсетей", "Соответствует ТЗ «максимально просто»"], ["Меньше страниц для поиска Google по отдельным услугам", "Длинная страница на телефоне (решается якорями и кнопкой «наверх»)"], 520));

// ---------- Variant B
const B = F("VERTICAL", { name: "Вариант B", itemSpacing: 32, paddingTop: 48, paddingBottom: 48, paddingLeft: 48, paddingRight: 48 }); rad(B, "radius/2xl"); glass(B, TH); root.appendChild(B);
B.appendChild(await T("Вариант B", "Overline", "color/text/accent"));
B.appendChild(await T("Многостраничный сайт", "Heading/H2"));
B.appendChild(await T("Каждый раздел ТЗ — отдельная страница. Главная показывает превью разделов со ссылками. Итого 9 страниц × 3 языка = 27 HTML.", "Body/M", "color/text/secondary", 900));
// sitemap
const sm = F("HORIZONTAL", { itemSpacing: 10, counterAxisAlignItems: "CENTER", name: "Sitemap" }); B.appendChild(sm);
const home = F("HORIZONTAL", { paddingTop: 8, paddingBottom: 8, paddingLeft: 14, paddingRight: 14 }); rad(home, "radius/full"); home.fills = [paint("color/bg/inverse", TH)]; home.appendChild(await txt("Главная", "Label", "color/text/on-inverse", TH)); sm.appendChild(home);
sm.appendChild(await T("→", "Label", "color/text/tertiary"));
for (const p of ["О нас", "Услуги", "Команда", "Кейсы", "Отзывы", "Консультация", "Контакты", "FAQ"]) { const c = F("HORIZONTAL", { paddingTop: 8, paddingBottom: 8, paddingLeft: 14, paddingRight: 14 }); rad(c, "radius/full"); glass(c, TH, true); c.appendChild(await T(p, "Label")); sm.appendChild(c); }
const bRow = F("HORIZONTAL", { itemSpacing: 28 }); B.appendChild(bRow);
const WB = 250;
const PAGES = [
  ["Главная", "index.html", [HDR, ["Hero", 180, "Заголовок + CTA + цифры", true], ["Услуги · превью", 120, "6 карточек", false, "→ Услуги"], ["Кейсы · превью", 110, "3 истории", false, "→ Кейсы"], ["Отзывы · превью", 100, null, false, "→ Отзывы"], ["CTA консультация", 90, null, true, null, true], FTR]],
  ["О нас", "about.html", [HDR, ["Hero страницы", 110], ["История и миссия", 130], ["Лицензии", 90], ["Преимущества", 100], ["CTA", 80, null, true, null, true], FTR]],
  ["Услуги", "services.html", [HDR, ["Hero страницы", 110], ["Категории услуг", 220, "Карточки с описанием", true], ["CTA", 80, null, true, null, true], FTR]],
  ["Команда", "team.html", [HDR, ["Hero страницы", 110], ["Партнёры", 150, "Фото + биография"], ["Юристы", 150], ["CTA", 80, null, true, null, true], FTR]],
  ["Кейсы", "cases.html", [HDR, ["Hero страницы", 110], ["Фильтр по категориям", 60], ["Кейсы списком", 220, "Ситуация → результат"], ["CTA", 80, null, true, null, true], FTR]],
  ["Отзывы", "reviews.html", [HDR, ["Hero страницы", 110], ["Отзывы", 200], ["Логотипы клиентов", 90], ["CTA", 80, null, true, null, true], FTR]],
  ["Консультация", "consultation.html", [HDR, ["Hero консультации", 160, null, true], ["Как проходит", 120], ["Сроки", 80], ["FAQ", 120], ["Финальный CTA", 90, null, true, null, true], FTR]],
  ["Контакты", "contacts.html", [HDR, ["Адрес и карта", 200], ["Телефон, мессенджеры", 100, null, true], FTR]],
  ["FAQ", "faq.html", [HDR, ["Вопросы по темам", 260], ["CTA", 80, null, true, null, true], FTR]],
];
for (const [t, f, bl] of PAGES) bRow.appendChild(await pageCol(t, f, WB, bl));
B.appendChild(await prosCons(["Отдельные страницы под услуги и кейсы — лучше для поиска Google", "Легче расширять: новая услуга = новая страница", "Привычная структура для юрфирм"], ["Дольше делать и переводить: 27 файлов вместо 6", "Больше кликов до нужной информации, CTA дальше", "Сложнее поддерживать единый контент на трёх языках"], 640));

const n = await applyGlassStyles(root);
const shots = [await screenshot(A, { maxDimension: 1800 }), await screenshot(B, { maxDimension: 2400 }), await screenshot(head, { maxDimension: 1200 })];
return { root: root.id, glass: n, shots };
