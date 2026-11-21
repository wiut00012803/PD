//@prelude2
const page = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(page);
const removed = [];
const explo = page.children.find(n => n.name === "Поиск стиля"); if (explo) { removed.push(explo.name); explo.remove(); }
const root = await figma.getNodeByIdAsync("39:3297");
const B = root.children.find(n => n.name === "Вариант B"); if (B) { removed.push(B.name); B.remove(); }
root.name = "Структура сайта · вайрфрейм"; root.x = 0; root.y = 0;
const load = async t => { for (const s of t.getStyledTextSegments(["fontName"])) await figma.loadFontAsync(s.fontName); };
const head = root.children.find(n => n.type === "FRAME" && n.findOne(t => t.type === "TEXT" && t.characters === "Два варианта структуры"));
for (const t of head.findAll(t => t.type === "TEXT")) {
  await load(t);
  if (t.characters === "Два варианта структуры") t.characters = "Структура сайта";
  if (t.characters.startsWith("Вайрфреймы показывают")) t.characters = "Лендинг и страница бесплатной консультации в одном SPA: переход между ними без перезагрузки. Вайрфрейм показывает порядок блоков и где стоят кнопки обратной связи. Все кнопки «Консультация» ведут на Google Form; плавающая кнопка Telegram/WhatsApp и шапка с CTA видны на любом экране. Три языка (RU / UZ / EN), светлая и тёмная тема.";
}
const A = root.children.find(n => n.name === "Вариант A"); A.name = "Структура";
for (const t of A.findAll(t => t.type === "TEXT")) {
  await load(t);
  if (t.characters === "Вариант A") t.characters = "Выбранная структура";
  if (t.characters === "Лендинг + страница консультации") t.characters = "Лендинг + страница консультации · SPA";
  if (t.characters.startsWith("Все разделы на одной длинной странице")) t.characters = "Одностраничное приложение (SPA): лендинг с якорной навигацией и экран «Бесплатная консультация». Переход между ними и смена языка — без перезагрузки страницы, с плавной анимацией; у каждого экрана свой адрес, работают кнопки «назад/вперёд» браузера.";
  if (t.characters.startsWith("Меню прокручивает к разделам")) t.characters = "Меню прокручивает к разделам (якоря). «Консультация» открывает второй экран SPA мгновенно, без перезагрузки; адрес меняется (#/consultation), кнопка «назад» возвращает на лендинг.";
  if (t.characters === "Быстрее сделать и проще поддерживать: 6 файлов вместо 27") t.characters = "Быстро и просто: одно приложение, тексты трёх языков в JSON";
}
// add SPA routing note card
const notes = A.findOne(n => n.type === "FRAME" && n.findOne(t => t.type === "TEXT" && t.characters === "Навигация") && n.layoutMode === "VERTICAL" && n.parent.name !== "Структура");
const col = notes.parent;
const card = notes.clone(); col.insertChild(col.children.indexOf(notes) + 1, card);
const [t1, t2] = card.findAll(t => t.type === "TEXT"); await load(t1); await load(t2);
t1.characters = "SPA и GitHub Pages"; t2.characters = "Маршруты: #/ — лендинг, #/consultation — консультация; язык: ?lang=ru|uz|en. Хеш-маршрутизация работает на GitHub Pages без серверных настроек.";
return { removed, top: page.children.map(n => n.name), shot: await screenshot(root, { maxDimension: 1400 }) };
