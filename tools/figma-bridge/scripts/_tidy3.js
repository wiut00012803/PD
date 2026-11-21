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
// Re-runnable layout for page 03 (needs _prelude2 + _doc-lib): cover on top, then wireframe section + one section per layout.
const PG3 = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(PG3);
const GROUPS = [["ПК 1440", "Макеты · 1440 · ПК альбомный"], ["ПК 960", "Макеты · 960 · ПК портретный (пол-экрана)"], ["Планшет 820", "Макеты · 820 · планшет, раскладушка, телефон боком"], ["Телефон 390", "Макеты · 390 · телефон"]];
const KINDS = ["Главная", "Консультация", "Меню"];
const RE = /^(ПК 1440|ПК 960|Планшет 820|Телефон 390) · (Тёмная|Светлая) · (Главная|Консультация|Меню)$/;
for (const n of [...PG3.children]) if (n.type === "SECTION") { for (const k of [...n.children]) { const ax = k.absoluteTransform[0][2], ay = k.absoluteTransform[1][2]; PG3.appendChild(k); k.x = ax; k.y = ay; } n.remove(); }
const frames = PG3.children.filter(n => RE.test(n.name));
const cover = PG3.children.find(n => n.name === "Обложка страницы");
const Y0 = cover ? cover.height + 240 : 0;
const GAP = 160, PAD = 120, ROWGAP = 400;
const darkMax = Math.max(...frames.filter(f => f.name.includes("Тёмная")).map(f => f.height));
const lightY = PAD + darkMax + ROWGAP;
let x = 0;
const WF3 = PG3.children.find(n => n.name.startsWith("Вайрфрейм") || n.name.startsWith("Структура сайта"));
if (WF3) { const s = figma.createSection(); PG3.appendChild(s); sectionLook(s, "Структура · вайрфрейм"); s.x = 0; s.y = Y0; s.resizeWithoutConstraints(WF3.width + PAD * 2, WF3.height + PAD * 2); s.appendChild(WF3); WF3.x = PAD; WF3.y = PAD; x = s.width + 400; }
for (const [key, title] of GROUPS) {
  const gf = frames.filter(f => f.name.startsWith(key + " ·")); if (!gf.length) continue;
  const W = gf[0].width; const kinds = KINDS.filter(k => gf.some(f => f.name.endsWith("· " + k)));
  const lightMax = Math.max(0, ...gf.filter(f => f.name.includes("Светлая")).map(f => f.height));
  const sec = figma.createSection(); PG3.appendChild(sec); sectionLook(sec, title); sec.x = x; sec.y = Y0;
  sec.resizeWithoutConstraints(PAD * 2 + kinds.length * W + (kinds.length - 1) * GAP, lightY + (lightMax || darkMax) + PAD);
  for (const f of gf) { const m = f.name.match(RE); sec.appendChild(f); f.x = PAD + kinds.indexOf(m[3]) * (W + GAP); f.y = m[2] === "Тёмная" ? PAD : lightY; }
  x += sec.width + 400;
}
const boxes = []; for (const s of PG3.children.filter(n => n.type === "SECTION")) for (const f of s.children) boxes.push({ n: f.name, x: s.x + f.x, y: s.y + f.y, w: f.width, h: f.height });
if (cover) boxes.push({ n: cover.name, x: cover.x, y: cover.y, w: cover.width, h: cover.height });
const overlaps = []; for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) { const a = boxes[i], b = boxes[j]; if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) overlaps.push(`${a.n} × ${b.n}`); }
const stray = PG3.children.filter(n => n.type !== "SECTION" && n !== cover).map(n => n.name);
const ARR = { overlaps, stray, sections: PG3.children.filter(n => n.type === "SECTION").map(s => `${s.name} (${s.children.length})`) };
return { ARR };
