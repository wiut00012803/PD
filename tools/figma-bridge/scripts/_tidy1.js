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
