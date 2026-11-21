const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
pg.name = "03 · Сайт";
const MAP = { "Desktop 1440": "ПК 1440", "Desktop 960": "ПК 960", "Tablet 820": "Планшет 820", "Mobile 390": "Телефон 390" };
let renamed = 0;
for (const f of pg.findAll(n => n.type === "FRAME" && /^(Desktop 1440|Desktop 960|Tablet 820|Mobile 390) · /.test(n.name))) { const k = Object.keys(MAP).find(k => f.name.startsWith(k)); f.name = f.name.replace(k, MAP[k]); renamed++; }
const wf = pg.findOne(n => n.type === "FRAME" && (n.name.startsWith("Структура сайта") || n.name.startsWith("Вайрфрейм")));
wf.name = "Вайрфрейм · структура сайта";
const load = async t => { for (const s of t.getStyledTextSegments(["fontName"])) await figma.loadFontAsync(s.fontName); };
for (const t of wf.findAll(n => n.type === "TEXT" && n.characters === "Этап 3 · структура сайта")) { await load(t); t.characters = "Сайт · структура"; }
log("renamed " + renamed);
const fixed = await normalizeLogos(pg); log("normalized " + fixed);
const restyled = await restyleLegacyTexts(pg); log("restyled " + restyled);
await pageHeader(pg, "03", "Сайт", "Макеты сайта-SPA: лендинг и экран «Бесплатная консультация» (переход без перезагрузки). Четыре раскладки × светлая и тёмная тема, для сенсорных раскладок — экран меню. Логотип, цвета и компоненты — экземпляры из UI Kit на странице 02.", [
  ["Структура · вайрфрейм", "Порядок блоков, кнопки обратной связи, маршруты SPA", "Утверждено", "ok"],
  ["Макеты · 1440 · ПК альбомный", "Главная и консультация, тёмная и светлая тема", "Готово", "ok"],
  ["Макеты · 960 · ПК портретный", "Половина монитора, мышь", "Готово", "ok"],
  ["Макеты · 820 · планшет", "Планшет, раскладушка, телефон боком — касания, меню", "Готово", "ok"],
  ["Макеты · 390 · телефон", "Одна колонка, карусели, меню", "Готово", "ok"],
]);
log("cover");
