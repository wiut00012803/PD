const page = await figma.getNodeByIdAsync("0:1"); await figma.setCurrentPageAsync(page);
page.name = "01 · Логотип";
log("page");
const secs = page.children.filter(n => n.type === "SECTION");
const sConcept = secs.find(s => s.name.includes("Концепции")), sIter = secs.find(s => s.name.includes("Итерации")), sFinal = secs.find(s => s.name.includes("Финальн") || s.name.includes("Утверждённый"));
const wConcept = await figma.getNodeByIdAsync("3:2"), wIter = await figma.getNodeByIdAsync("5:3"), wFinal = await figma.getNodeByIdAsync("20:158");
// names
sectionLook(sFinal, "Утверждённый логотип · B1 «Портик»"); sectionLook(sIter, "Архив · итерации A и B"); sectionLook(sConcept, "Архив · концепции");
wConcept.name = "Концепции логотипа"; wIter.name = "Итерации A и B"; wFinal.name = "Логотип B1 · витрина";
// doc look for wrappers, rounded cards
for (const w of [wConcept, wIter, wFinal]) docLook(w);
for (const c of [...wConcept.children, ...wIter.children].filter(n => n.type === "FRAME" && /^(Concept|Iteration)/.test(n.name))) { c.cornerRadius = 20; c.name = c.name.replace("Concept ", "Концепция ").replace("Iteration ", "Итерация "); }
log("frames");
// header copy (no firm name)
const load = async t => { for (const s of t.getStyledTextSegments(["fontName"])) await figma.loadFontAsync(s.fontName); };
const REPL = [
  ["PRAVOE DELO · ЛОГОТИП · ИТЕРАЦИИ", "Логотип · итерации (архив)"],
  ["PRAVOE DELO · ЛОГОТИП · ФИНАЛ", "Логотип · утверждён"],
  ["PRAVOE DELO · ЛОГОТИП", "Логотип · концепции (архив)"],
  ["Финальный логотип — B1", "Логотип B1 «Портик»"],
];
for (const t of page.findAllWithCriteria({ types: ["TEXT"] })) {
  const s = t.characters; let ns = s;
  for (const [a, b] of REPL) if (ns === a) ns = b;
  if (s.startsWith("Четыре направления в строгом")) ns = "Архив. Первые четыре направления логотипа. Для дальнейшей работы выбраны A и B; утверждён вариант B1 — см. соседнюю секцию «Утверждённый логотип».";
  if (s.startsWith("По 4 итерации концепций")) ns = "Архив. По четыре итерации направлений A и B в двух палитрах. Утверждена итерация B1 в палитре 2 (белый / тёмно-синий / охра).";
  if (s.startsWith("Портик с буквами P и D одной высоты")) ns = "Портик: фронтон, антаблемент и ступени, колонны образуют буквы P и D одной высоты. Палитра: белый #FFFFFF, тёмно-синий #0E1A2B, охра #C08A3E. Логотип хранится как вектор (надпись переведена в кривые). Мастер-компоненты Logo / Mark, Horizontal, Vertical, Favicon — на странице 02, раздел «UI Kit · компоненты». Здесь — витрина экземпляров.";
  if (ns !== s) { await load(t); t.characters = ns; }
}
log("copy");
const restyled = await restyleLegacyTexts(page);
log("restyled " + restyled);
const fixed = await normalizeLogos(page);
log("normalized " + fixed);
// page cover + layout: cover on top-left, sections in a row below (approved first, archive after)
const header = await pageHeader(page, "01", "Логотип", "Утверждённый логотип и история его разработки. Утверждён вариант B1 «Портик» в палитре белый / тёмно-синий / охра. Мастер-компоненты логотипа (единственный источник для брендбука, UI Kit и сайта) лежат на странице 02 в разделе «UI Kit · компоненты».", [
  ["Утверждённый логотип · B1", "Знак, горизонтальный и вертикальный локапы, монохром, иконка и фавикон", "Утверждено", "ok"],
  ["Архив · итерации A и B", "8 итераций в двух палитрах — история выбора", "Архив", "archive"],
  ["Архив · концепции", "4 первых направления — история выбора", "Архив", "archive"],
]);
log("header");
const Y0 = header.height + 240;
let x = 0;
for (const s of [sFinal, sIter, sConcept]) { s.x = x; s.y = Y0; x += s.width + 240; }
return { restyled, fixed, sections: page.children.filter(n => n.type === "SECTION").map(s => `${s.name} @${Math.round(s.x)},${Math.round(s.y)}`), header: await screenshot(header, { maxDimension: 1200 }), fin: await screenshot(wFinal, { maxDimension: 900 }), it: await screenshot(wIter, { maxDimension: 1400 }) };
