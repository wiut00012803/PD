//@prelude2
// Shared "documentation" helpers for page tidy-up (needs _prelude2).
const LOGO_SET_IDS = new Set(["20:47", "20:104", "20:157", "21:177"]);
function DFr(dir, o = {}) { const f = figma.createFrame(); f.layoutMode = dir; f.primaryAxisSizingMode = "AUTO"; f.counterAxisSizingMode = "AUTO"; f.fills = []; for (const k in o) f[k] = o[k]; return f; }
async function DT(s, style, tok = "color/text/primary", w) { const t = await txt(s, style, tok, "Light"); if (w) { t.resize(w, t.height); t.textAutoResize = "HEIGHT"; } return t; }
// Doc frame look: light page bg, radius 28
function docLook(f) { f.fills = [paint("color/bg/page", "Light")]; f.cornerRadius = 28; }
async function statusChip(label, kind) {
  const c = DFr("HORIZONTAL", { itemSpacing: 6, counterAxisAlignItems: "CENTER", paddingTop: 5, paddingBottom: 5, paddingLeft: 10, paddingRight: 12 }); c.cornerRadius = 999;
  const map = { ok: ["color/bg/accent-subtle", "color/text/accent"], archive: ["color/bg/muted", "color/text/secondary"], lib: ["color/bg/subtle", "color/text/primary"] };
  const [bg, fg] = map[kind] || map.lib; c.fills = [paint(bg, "Light")]; c.strokes = [paint("color/border/default", "Light")]; c.strokeWeight = 1;
  const t = await txt(label, "Label", fg, "Light"); t.fontSize = 12; c.appendChild(t); return c;
}
// Page cover: overline, title, description, contents list with statuses
async function pageHeader(page, num, title, desc, items) {
  for (const n of [...page.children]) if (n.name === "Обложка страницы") n.remove();
  const h = DFr("VERTICAL", { name: "Обложка страницы", itemSpacing: 20, paddingTop: 72, paddingBottom: 72, paddingLeft: 80, paddingRight: 80 }); docLook(h);
  page.appendChild(h); h.resize(1440, 100); h.counterAxisSizingMode = "FIXED"; h.primaryAxisSizingMode = "AUTO";
  h.appendChild(await DT(`Страница ${num}`, "Overline", "color/text/accent"));
  h.appendChild(await DT(title, "Display"));
  h.appendChild(await DT(desc, "Body/L", "color/text/secondary", 900));
  const list = DFr("VERTICAL", { name: "Содержание", itemSpacing: 0, paddingTop: 16 }); h.appendChild(list); list.layoutSizingHorizontal = "FILL";
  for (const [name, note, label, kind] of items) {
    const r = DFr("HORIZONTAL", { itemSpacing: 24, counterAxisAlignItems: "CENTER", paddingTop: 14, paddingBottom: 14 }); list.appendChild(r); r.layoutSizingHorizontal = "FILL";
    r.strokes = [paint("color/border/default", "Light")]; r.strokeTopWeight = 1; r.strokeBottomWeight = 0; r.strokeLeftWeight = 0; r.strokeRightWeight = 0;
    const n0 = await DT(name, "Heading/H4"); n0.resize(420, n0.height); n0.textAutoResize = "HEIGHT"; r.appendChild(n0);
    const d0 = await DT(note, "Body/M", "color/text/secondary"); r.appendChild(d0); d0.layoutGrow = 1; d0.textAutoResize = "HEIGHT";
    r.appendChild(await statusChip(label, kind));
  }
  h.x = 0; h.y = 0; return h;
}
function sectionLook(sec, name) { sec.name = name; sec.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }]; }
// Keep logo instances perfectly proportional (vector logo with SCALE constraints)
async function normalizeLogos(root, skip = () => false) {
  let fixed = 0;
  for (const i of root.findAllWithCriteria({ types: ["INSTANCE"] })) {
    if (skip(i)) continue;
    const mc = await i.getMainComponentAsync(); if (!mc || !mc.parent || !LOGO_SET_IDS.has(mc.parent.id)) continue;
    const r = mc.width / mc.height; if (Math.abs(i.width / i.height / r - 1) < 0.0005) continue;
    i.resize(Math.round(i.height * r * 100) / 100, i.height); fixed++;
  }
  return fixed;
}
// Restyle legacy texts (Cormorant/Manrope labels) to Inter text styles; never touch logo lettering
async function restyleLegacyTexts(root) {
  let n = 0;
  for (const t of root.findAllWithCriteria({ types: ["TEXT"] })) {
    if (t.fontName === figma.mixed) continue;
    const fam = t.fontName.family, size = t.fontSize, s = t.characters.trim();
    if (fam !== "Manrope" && fam !== "Cormorant Garamond") continue;
    if (/^(PRAVOE|PD$|LAW FIRM)/.test(s) || /^PRAVOE\s*\n?DELO$/.test(s)) continue; // logo lettering in archive tiles
    let a = t.parent, inInst = false; while (a && a.type !== "PAGE") { if (a.type === "INSTANCE") inInst = true; a = a.parent; } if (inInst) continue;
    let style, tok = "color/text/primary";
    if (fam === "Cormorant Garamond") style = size >= 50 ? "Heading/H1" : size >= 36 ? "Heading/H2" : size >= 22 ? "Heading/H3" : "Heading/H4";
    else if (t.fontName.style === "Bold" && size <= 13) { style = "Overline"; tok = "color/text/accent"; }
    else if (t.fontName.style === "SemiBold" && size <= 14) { style = "Label"; }
    else { style = size >= 15 ? "Body/M" : "Body/S"; tok = "color/text/secondary"; }
    await t.setTextStyleIdAsync(TS[style]); t.fills = [paint(tok, "Light")]; n++;
  }
  return n;
}
// English service names (pages, sections, frames, layers). Content texts stay Russian.
const NAME_MAP = {
  "01 · Логотип": "01 · Logo", "02 · Брендбук и UI Kit": "02 · Brandbook & UI Kit", "03 · Сайт": "03 · Website",
  "Утверждённый логотип · B1 «Портик»": "Logo · B1 Portico", "Архив · итерации A и B": "Logo · Iterations A & B", "Архив · концепции": "Logo · Concepts",
  "UI Kit · компоненты": "UI Kit", "Структура · вайрфрейм": "Structure · Wireframe",
  "Макеты · 1440 · ПК альбомный": "Mockups · 1440 · Desktop landscape", "Макеты · 960 · ПК портретный (пол-экрана)": "Mockups · 960 · Desktop portrait", "Макеты · 820 · планшет, раскладушка, телефон боком": "Mockups · 820 · Tablet & foldable", "Макеты · 390 · телефон": "Mockups · 390 · Mobile",
  "Обложка страницы": "Page cover", "Содержание": "Contents",
  "Концепции логотипа": "Logo concepts", "Итерации A и B": "Logo iterations", "Логотип B1 · витрина": "Logo B1 · Showcase",
  "Знак": "Mark", "Горизонтальный локап": "Horizontal lockup", "Вертикальный локап": "Vertical lockup", "Монохромные версии": "Monochrome", "Иконка приложения и фавикон": "App icon & favicon",
  "Брендбук": "Brandbook", "00 · Обложка": "00 · Cover", "01 · Логотип": "01 · Logo", "02 · Охранное поле": "02 · Clear space", "03 · Недопустимое использование": "03 · Misuse", "04 · Цвета": "04 · Colors", "05 · Типографика": "05 · Typography", "06 · Фото и иконки": "06 · Photo & icons", "07 · UI-элементы": "07 · UI elements", "08 · Тон общения": "08 · Tone of voice",
  "Так": "Do", "Не так": "Don't", "Профессионально, но понятно": "Principle · Professional", "Спокойно и уверенно": "Principle · Calm", "Конфиденциально": "Principle · Confidential",
  "Section / Логотип": "Section / Logo", "Section / Иконки": "Section / Icons",
  "Вайрфрейм · структура сайта": "Wireframe · Site structure", "Структура": "Structure", "Page · Главная (лендинг)": "Page · Home (landing)", "Page · Бесплатная консультация": "Page · Consultation",
  "Ситуация": "Situation", "Результат": "Result",
};
const PART_MAP = { "Шапка (sticky)": "Header (sticky)", "Подвал": "Footer", "Цифры доверия": "Trust stats", "О нас": "About", "Преимущества": "Advantages", "Услуги": "Services", "Практики": "Services", "Кейсы": "Cases", "Команда": "Team", "Отзывы и клиенты": "Reviews & clients", "Отзывы": "Reviews", "Бесплатная консультация": "Free consultation", "Консультация": "Consultation", "Контакты": "Contacts", "Hero консультации": "Consultation hero", "Как проходит": "How it works", "Сроки и конфиденциальность": "Terms & confidentiality", "Сроки": "Terms", "С какими вопросами": "Topics", "Вопросы": "Topics", "Финальный CTA": "Final CTA" };
const MOCK = { "ПК": "Desktop", "Планшет": "Tablet", "Телефон": "Mobile", "Тёмная": "Dark", "Светлая": "Light", "Главная": "Home", "Консультация": "Consultation", "Меню": "Menu" };
function englishName(name) {
  if (NAME_MAP[name]) return NAME_MAP[name];
  let m;
  if ((m = name.match(/^Концепция ([A-D])$/))) return `Concept ${m[1]}`;
  if ((m = name.match(/^Итерация ([AB]\d)$/))) return `Iteration ${m[1]}`;
  if ((m = name.match(/^(Section|Block) · (.+)$/)) && PART_MAP[m[2]]) return `${m[1]} · ${PART_MAP[m[2]]}`;
  if ((m = name.match(/^(Row|Stack|Group) · /)) && /[А-Яа-яЁё]/.test(name)) return m[1];
  if ((m = name.match(/^(ПК|Планшет|Телефон) (\d+) · (Тёмная|Светлая) · (Главная|Консультация|Меню)$/))) return `${MOCK[m[1]]} ${m[2]} · ${MOCK[m[3]]} · ${MOCK[m[4]]}`;
  return null;
}
async function renameAll(root) {
  let n = 0; const left = [];
  for (const node of [root, ...root.findAll(x => x.type !== "TEXT")]) {
    if (!/[А-Яа-яЁё]/.test(node.name)) continue;
    const e = englishName(node.name); if (e) { node.name = e; n++; } else left.push(`${node.type}: ${node.name}`);
  }
  return { n, left };
}
// Rebuild a page cover without any status labels
async function plainCover(page, num, title, desc, items) {
  for (const n of [...page.children]) if (n.name === "Обложка страницы" || n.name === "Page cover") n.remove();
  const h = DFr("VERTICAL", { name: "Page cover", itemSpacing: 20, paddingTop: 72, paddingBottom: 72, paddingLeft: 80, paddingRight: 80 }); docLook(h);
  page.appendChild(h); h.resize(1440, 100); h.counterAxisSizingMode = "FIXED"; h.primaryAxisSizingMode = "AUTO";
  h.appendChild(await DT(`Страница ${num}`, "Overline", "color/text/accent"));
  h.appendChild(await DT(title, "Display"));
  h.appendChild(await DT(desc, "Body/L", "color/text/secondary", 900));
  const list = DFr("VERTICAL", { name: "Contents", itemSpacing: 0, paddingTop: 16 }); h.appendChild(list); list.layoutSizingHorizontal = "FILL";
  for (const [name, note] of items) {
    const r = DFr("HORIZONTAL", { name: "Row", itemSpacing: 24, counterAxisAlignItems: "CENTER", paddingTop: 14, paddingBottom: 14 }); list.appendChild(r); r.layoutSizingHorizontal = "FILL";
    r.strokes = [paint("color/border/default", "Light")]; r.strokeTopWeight = 1; r.strokeBottomWeight = 0; r.strokeLeftWeight = 0; r.strokeRightWeight = 0;
    const n0 = await DT(name, "Heading/H4"); n0.resize(420, n0.height); n0.textAutoResize = "HEIGHT"; r.appendChild(n0);
    const d0 = await DT(note, "Body/M", "color/text/secondary"); r.appendChild(d0); d0.layoutGrow = 1; d0.textAutoResize = "HEIGHT";
  }
  h.x = 0; h.y = 0; return h;
}
async function setText(t, s) { for (const seg of t.getStyledTextSegments(["fontName"])) await figma.loadFontAsync(seg.fontName); t.characters = s; }
// report any remaining approval/status wording in content texts
function statusWords(root) { return root.findAllWithCriteria({ types: ["TEXT"] }).filter(t => /утвержд|архив|выбранн|готово/i.test(t.characters)).map(t => t.characters.slice(0, 90)); }
const page = await figma.getNodeByIdAsync("0:1"); await figma.setCurrentPageAsync(page);
const cover = await plainCover(page, "01", "Логотип", "Логотип B1 «Портик» в палитре белый / тёмно-синий / охра и история его разработки — концепции и итерации. Мастер-компоненты логотипа лежат на странице 02 в разделе UI Kit.", [
  ["Логотип B1 «Портик»", "Знак, горизонтальный и вертикальный локапы, монохром, иконка приложения и фавикон"],
  ["Итерации A и B", "8 итераций в двух палитрах"],
  ["Концепции", "4 первых направления логотипа"],
]);
for (const t of page.findAllWithCriteria({ types: ["TEXT"] })) {
  const s = t.characters;
  if (s === "Логотип · утверждён") await setText(t, "Логотип");
  else if (s === "Логотип · концепции (архив)") await setText(t, "Логотип · концепции");
  else if (s === "Логотип · итерации (архив)") await setText(t, "Логотип · итерации");
  else if (s.startsWith("Архив. Первые четыре направления")) await setText(t, "Первые четыре направления логотипа: A — лигатура, B — портик, C — вордмарк, D — печать.");
  else if (s.startsWith("Архив. По четыре итерации")) await setText(t, "По четыре итерации направлений A и B в двух палитрах: молочный / тёмно-коричневый / охра и белый / тёмно-синий / охра.");
  else if (s.startsWith("Портик: фронтон, антаблемент")) await setText(t, "Портик: фронтон, антаблемент и ступени, колонны образуют буквы P и D одной высоты. Палитра: белый #FFFFFF, тёмно-синий #0E1A2B, охра #C08A3E. Логотип хранится как вектор (надпись переведена в кривые). Мастер-компоненты Logo / Mark, Horizontal, Vertical, Favicon — на странице 02, раздел UI Kit. Здесь — витрина экземпляров.");
}
const r = await renameAll(page);
page.name = "01 · Logo";
const Y0 = cover.height + 240; let x = 0;
const order = ["Logo · B1 Portico", "Logo · Iterations A & B", "Logo · Concepts"];
for (const name of order) { const s = page.children.find(n => n.type === "SECTION" && n.name === name); if (s) { s.x = x; s.y = Y0; x += s.width + 240; } }
return { renamed: r.n, left: r.left, status: statusWords(page), top: page.children.map(n => n.name) };
