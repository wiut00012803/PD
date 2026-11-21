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
