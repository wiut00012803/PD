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
const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
page.name = "02 · Брендбук и UI Kit";
const p1 = await figma.getNodeByIdAsync("0:1"); await p1.loadAsync();
const kit = await figma.getNodeByIdAsync("35:1557"), bb = await figma.getNodeByIdAsync("31:71");
// pull frames out of earlier sections (idempotent re-runs)
for (const s of page.children.filter(n => n.type === "SECTION")) { for (const k of [...s.children]) page.appendChild(k); s.remove(); }
log("start");
// ---------- 1) logo masters → UI Kit
const LOGO = await Promise.all(["20:47", "20:104", "20:157", "21:177"].map(id => figma.getNodeByIdAsync(id)));
let logoSec = kit.children.find(n => n.name === "Section / Логотип");
if (!logoSec) {
  logoSec = DFr("VERTICAL", { name: "Section / Логотип", itemSpacing: 20 }); kit.insertChild(1, logoSec);
  logoSec.appendChild(await DT("Логотип · мастер-компоненты", "Heading/H3"));
  logoSec.appendChild(await DT("Единственный источник логотипа: брендбук, шапка, подвал и меню сайта используют экземпляры этих компонентов, а для сайта логотип выгружается отсюда в SVG. Надпись переведена в кривые — логотип не зависит от шрифтов. Primary и Mono Dark — для светлого фона, Inverse и Mono Light — для тёмного; Favicon — для 16 и 32 px.", "Body/M", "color/text/secondary", 980));
  const holder = DFr("VERTICAL", { name: "Logo sets", itemSpacing: 24 }); logoSec.appendChild(holder);
}
const holder = logoSec.findOne(n => n.name === "Logo sets");
for (const s of LOGO) holder.appendChild(s);
log("moved logo sets");
const LIGHT = hexRGB("#EFF1F5"), NAVY = hexRGB("#0E1A2B");
for (const s of LOGO.slice(0, 3)) {
  s.layoutMode = "NONE";
  const light = s.children.filter(v => /Primary|Mono Dark/.test(v.name)), dark = s.children.filter(v => /Inverse|Mono Light/.test(v.name));
  const cw = Math.max(...s.children.map(v => v.width)), P = 48, G = 32;
  const colH = arr => arr.reduce((a, v) => a + v.height, 0) + G * (arr.length - 1);
  light.forEach((v, i) => { v.x = P; v.y = P + light.slice(0, i).reduce((a, k) => a + k.height + G, 0); });
  dark.forEach((v, i) => { v.x = cw + P * 3; v.y = P + dark.slice(0, i).reduce((a, k) => a + k.height + G, 0); });
  const W = cw * 2 + P * 4, H = Math.max(colH(light), colH(dark)) + P * 2;
  s.resizeWithoutConstraints(W, H);
  s.fills = [{ type: "GRADIENT_LINEAR", gradientTransform: [[1, 0, 0], [0, 1, 0]], gradientStops: [{ position: 0, color: { ...LIGHT, a: 1 } }, { position: 0.5, color: { ...LIGHT, a: 1 } }, { position: 0.5, color: { ...NAVY, a: 1 } }, { position: 1, color: { ...NAVY, a: 1 } }] }];
  s.cornerRadius = 20;
}
{ const f = LOGO[3]; f.layoutMode = "HORIZONTAL"; f.primaryAxisSizingMode = "AUTO"; f.counterAxisSizingMode = "AUTO"; f.itemSpacing = 32; f.paddingTop = f.paddingBottom = f.paddingLeft = f.paddingRight = 48; f.counterAxisAlignItems = "CENTER"; f.fills = [{ type: "SOLID", color: LIGHT }]; f.cornerRadius = 20; }
for (const s of kit.findAllWithCriteria({ types: ["COMPONENT_SET"] })) { s.strokes = [paint("color/border/default", "Light")]; s.strokeWeight = 1; s.strokeAlign = "INSIDE"; }
log("logo layout");
// ---------- 2) UI Kit: doc look, names, headings
kit.name = "UI Kit"; docLook(kit);
const load = async t => { for (const s of t.getStyledTextSegments(["fontName"])) await figma.loadFontAsync(s.fontName); };
const H = { "Button": "Кнопки · Button", "Messenger Button": "Мессенджеры · Messenger Button", "Lang Switcher": "Языки · Lang Switcher", "Theme Toggle": "Тема · Theme Toggle", "Chip": "Бейдж · Chip", "Icon Box": "Плашка иконки · Icon Box", "Header": "Шапка · Header", "Cards": "Карточки · Service, Stat, Case, Review, Lawyer Card", "FAQ Item": "FAQ · FAQ Item", "Иконки": "Иконки · icon/ui, icon/social" };
for (const s of kit.children.filter(n => n.name.startsWith("Section / "))) {
  const t = s.children.find(n => n.type === "TEXT"); const key = s.name.replace("Section / ", "");
  if (t && H[key] && t.characters !== H[key]) { await load(t); t.characters = H[key]; }
}
for (const t of kit.children.find(n => n.name === "Header").findAll(n => n.type === "TEXT")) {
  await load(t);
  if (t.characters.startsWith("Pravoe Delo · UI Kit")) t.characters = "UI Kit · компоненты";
  if (t.characters.startsWith("Каждый компонент имеет свойство Theme")) t.characters = "Мастер-компоненты логотипа и интерфейса. Компоненты интерфейса имеют свойство Theme = Light / Dark и привязаны к коллекциям «Color · Light» и «Color · Dark» (одинаковые имена токенов — одни и те же CSS-переменные). Слева на каждой витрине — светлая тема, справа — тёмная. Фиолетовым Figma подсвечивает мастер-компоненты: их правят здесь, изменения расходятся по всем экземплярам.";
}
log("kit");
// ---------- 3) Brandbook: names, restore the misuse recolor example
bb.name = "Брендбук";
const cover = bb.children.find(n => n.name.startsWith("00 ·")); if (cover) cover.name = "00 · Обложка";
const tileText = bb.findOne(n => n.type === "TEXT" && n.characters === "Не меняйте цвета");
if (tileText) { const tile = tileText.parent.children.find(n => n.type === "FRAME"); const inst = tile && tile.findOne(n => n.type === "INSTANCE"); if (inst) for (const v of inst.findAll(() => true)) { if (["FRAME", "INSTANCE", "GROUP"].includes(v.type)) continue; if (v.fills && Array.isArray(v.fills) && v.fills.length) v.fills = solid("#2F6FD6"); if (v.strokes && v.strokes.length) v.strokes = solid("#2F6FD6"); } }
log("brandbook");
const restyled = await restyleLegacyTexts(page);
const fixed = await normalizeLogos(page, i => { let a = i.parent; while (a && a.type !== "PAGE") { if (a.name && a.name.startsWith("03 · Недопустимое")) return true; a = a.parent; } return false; });
log("restyle/normalize");
// ---------- 4) cover + sections layout
const header = await pageHeader(page, "02", "Брендбук и UI Kit", "Правила фирменного стиля и библиотека компонентов. Брендбук — документ для заказчика и подрядчиков: логотип, цвета светлой и тёмной темы, типографика, фото, интерфейс, тон. UI Kit — мастер-компоненты, из которых собраны макеты сайта.", [
  ["Брендбук", "9 листов: обложка, логотип, охранное поле, недопустимое использование, цвета, типографика, фото и иконки, UI, тон общения", "Утверждено", "ok"],
  ["UI Kit · компоненты", "Логотип, иконки, кнопки, мессенджеры, языки, тема, шапка, карточки, FAQ — в светлой и тёмной теме", "Компоненты", "lib"],
]);
const Y0 = header.height + 240, PAD = 120;
let x = 0;
for (const [f, name] of [[bb, "Брендбук"], [kit, "UI Kit · компоненты"]]) {
  const sec = figma.createSection(); page.appendChild(sec); sectionLook(sec, name); sec.x = x; sec.y = Y0;
  sec.resizeWithoutConstraints(f.width + PAD * 2, f.height + PAD * 2); sec.appendChild(f); f.x = PAD; f.y = PAD; x += sec.width + 240;
}
log("layout");
return { restyled, fixed, top: page.children.map(n => `${n.type}:${n.name} @${Math.round(n.x)},${Math.round(n.y)}`), logoShot: await screenshot(logoSec, { maxDimension: 1600 }), kitHead: await screenshot(kit.children.find(n => n.name === "Header"), { maxDimension: 1000 }) };
