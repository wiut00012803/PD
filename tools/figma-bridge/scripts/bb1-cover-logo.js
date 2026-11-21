//@prelude
const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);

// --- Fix Messenger Button labels: drop the shared TEXT property, give each platform its own label
const msg = await figma.getNodeByIdAsync("26:395");
const labelKey = Object.keys(msg.componentPropertyDefinitions).find(k => k.startsWith("Label"));
const labels = { Telegram: "Telegram", WhatsApp: "WhatsApp", Phone: "+998 00 000-00-00" };
for (const v of msg.children) { const t = v.findOne(n => n.type === "TEXT"); t.componentPropertyReferences = {}; }
if (labelKey) msg.deleteComponentProperty(labelKey);
for (const v of msg.children) { const p = v.name.match(/Platform=(\w+)/)[1]; v.findOne(n => n.type === "TEXT").characters = labels[p]; }

// --- Brandbook wrapper
const kit = await figma.getNodeByIdAsync("26:169");
let bb = page.findOne(n => n.name === "Brandbook — Pravoe Delo" && n.parent === page);
if (bb) bb.remove();
bb = al("VERTICAL", { name: "Brandbook — Pravoe Delo", itemSpacing: 80 });
bb.x = kit.x + kit.width + 200; bb.y = 0;

const [markSet, hSet, vSet, favSet, xIcon] = await Promise.all(["20:47","20:104","20:157","21:177","26:293"].map(id => figma.getNodeByIdAsync(id)));
const logo = (set, color) => variant(set, `Color=${color}`).createInstance();

function sheet(name, bgVar = "color/bg/page") {
  const s = figma.createFrame(); s.name = name; s.layoutMode = "VERTICAL"; s.resize(1440, 100);
  s.primaryAxisSizingMode = "AUTO"; s.counterAxisSizingMode = "FIXED";
  s.paddingTop = s.paddingBottom = 96; s.paddingLeft = s.paddingRight = 120; s.itemSpacing = 56;
  s.fills = [paint(bgVar)]; bb.appendChild(s); return s;
}
async function header(s, num, title, lead) {
  const h = al("VERTICAL", { name: "Header", itemSpacing: 16 }); s.appendChild(h);
  h.appendChild(await txt(`${num} — ${title.toUpperCase()}`, "Overline", "color/text/accent"));
  h.appendChild(await txt(title, "Heading/H1", "color/text/primary"));
  if (lead) wrapW(h, await txt(lead, "Body/L", "color/text/secondary"), 820);
  return h;
}
function tile(w, h, bgVar = "color/bg/subtle", name = "Tile") {
  const t = al("VERTICAL", { name, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", itemSpacing: 16 });
  t.resize(w, h); t.primaryAxisSizingMode = "FIXED"; t.counterAxisSizingMode = "FIXED"; t.fills = [paint(bgVar)]; rad(t, "radius/sm"); return t;
}
async function captioned(t, title, body) {
  const c = al("VERTICAL", { name: "Item", itemSpacing: 12 }); c.appendChild(t);
  c.appendChild(await txt(title, "Label", "color/text/primary"));
  if (body) wrapW(c, await txt(body, "Body/S", "color/text/secondary"), t.width);
  return c;
}

// --- Cover
const cover = sheet("00 · Cover", "color/bg/inverse");
cover.primaryAxisSizingMode = "FIXED"; cover.resize(1440, 810); cover.primaryAxisAlignItems = "SPACE_BETWEEN"; cover.clipsContent = true;
cover.appendChild(logo(hSet, "Inverse"));
const coverMid = al("VERTICAL", { name: "Title", itemSpacing: 20 }); cover.appendChild(coverMid);
coverMid.appendChild(await txt("Брендбук · версия 1.0", "Overline", "color/bg/accent"));
coverMid.appendChild(await txt("Фирменный стиль", "Display", "color/text/on-inverse"));
wrapW(coverMid, await txt("Правила использования логотипа, цвета, типографики, фотографий и элементов интерфейса юридической фирмы Pravoe Delo.", "Body/L", "color/text/on-inverse-muted"), 620);
cover.appendChild(await txt("Pravoe Delo · Law Firm · 2026", "Body/S", "color/text/on-inverse-muted"));
const deco = logo(markSet, "Mono Light"); cover.appendChild(deco); deco.layoutPositioning = "ABSOLUTE"; deco.rescale(520 / deco.height); deco.opacity = 0.07; deco.x = 1440 - deco.width - 60; deco.y = 150;

// --- 01 Logo versions
const s1 = sheet("01 · Логотип");
await header(s1, "01", "Логотип", "Знак — портик: фронтон, антаблемент и ступени, а колонны образуют буквы P и D. Он соединяет идею закона и надёжной опоры с названием компании. Логотип существует в трёх версиях; все они — компоненты Logo / Mark, Logo / Horizontal и Logo / Vertical.");
const r1 = al("HORIZONTAL", { name: "Versions", itemSpacing: 24 }); s1.appendChild(r1);
{ const t = tile(576, 300); t.appendChild(logo(hSet, "Primary")); r1.appendChild(await captioned(t, "Горизонтальный — основной", "Шапка сайта, бланки, подписи в письмах, документы.")); }
{ const t = tile(288, 300); t.appendChild(logo(vSet, "Primary")); r1.appendChild(await captioned(t, "Вертикальный", "Визитки, обложки, презентации, соцсети.")); }
{ const t = tile(288, 300); const m = logo(markSet, "Primary"); m.rescale(1.6); t.appendChild(m); r1.appendChild(await captioned(t, "Знак", "Аватары, фавикон, печати, тиснение.")); }
const r1b = al("HORIZONTAL", { name: "Color versions", itemSpacing: 24 }); s1.appendChild(r1b);
for (const [bg, color, title, body] of [["color/bg/page","Primary","Основной","Тёмно-синий знак, охра — точка во фронтоне и подпись LAW FIRM."],["color/bg/inverse","Inverse","Инверсия","Белый знак на тёмно-синем фоне."],["color/bg/accent","Mono Light","Монохром на охре","Только белый, без акцентов."],["color/bg/muted","Mono Dark","Монохром","Печать в один цвет, факс, гравировка."]]) {
  const t = tile(282, 200, bg); if (bg === "color/bg/page") { t.strokes = [paint("color/border/default")]; t.strokeWeight = 1; }
  const l = logo(hSet, color); l.rescale(0.78); t.appendChild(l); r1b.appendChild(await captioned(t, title, body));
}

// --- 02 Clear space & min size
const s2 = sheet("02 · Охранное поле");
await header(s2, "02", "Охранное поле и размеры", "Вокруг логотипа всегда оставляйте свободное поле не меньше X — высоты фронтона знака. В него не должны попадать текст, края макета и другие графические элементы.");
const r2 = al("HORIZONTAL", { name: "Clearspace row", itemSpacing: 24 }); s2.appendChild(r2);
{
  const t = tile(588, 420);
  const h = logo(hSet, "Primary"); h.rescale(2);
  const markH = h.findOne(n => n.name === "Mark").height; const X = Math.round(markH * 26 / 124);
  const box = al("HORIZONTAL", { name: "Clear space", paddingTop: X, paddingBottom: X, paddingLeft: X, paddingRight: X });
  box.strokes = [paint("color/border/accent")]; box.strokeWeight = 1; box.dashPattern = [6, 4];
  box.appendChild(h); t.appendChild(box);
  t.appendChild(await txt(`X = высота фронтона (${X} px при этом размере)`, "Body/S", "color/text/accent"));
  r2.appendChild(await captioned(t, "Охранное поле", "Минимальный отступ X со всех сторон."));
}
{
  const t = tile(588, 420); t.itemSpacing = 40;
  const row = al("HORIZONTAL", { itemSpacing: 48, counterAxisAlignItems: "MAX" }); t.appendChild(row);
  const mk = async (node, label) => { const c = al("VERTICAL", { itemSpacing: 12, counterAxisAlignItems: "CENTER" }); c.appendChild(node); c.appendChild(await txt(label, "Body/S", "color/text/secondary")); row.appendChild(c); };
  const h = logo(hSet, "Primary"); h.rescale(140 / h.width); await mk(h, "Горизонтальный: от 140 px");
  const m = logo(markSet, "Primary"); m.rescale(40 / m.height); await mk(m, "Знак: от 40 px");
  await mk(variant(favSet, "Size=32").createInstance(), "32 px");
  await mk(variant(favSet, "Size=16").createInstance(), "16 px");
  wrapW(t, await txt("Меньше 40 px используйте упрощённый знак Logo / Favicon: залитый фронтон, жирные буквы, основание охрой.", "Body/S", "color/text/secondary"), 460);
  r2.appendChild(await captioned(t, "Минимальные размеры", "Для экрана. В печати горизонтальный логотип — от 30 мм."));
}

// --- 03 Misuse
const s3 = sheet("03 · Недопустимое использование");
await header(s3, "03", "Недопустимое использование", "Логотип нельзя изменять. Эти примеры показывают самые частые ошибки.");
const r3 = al("HORIZONTAL", { name: "Don'ts", itemSpacing: 24 }); s3.appendChild(r3);
async function dont(t, title) {
  const x = xIcon.createInstance(); recolor(x, "color/text/error"); t.appendChild(x); x.layoutPositioning = "ABSOLUTE"; x.x = t.width - 36; x.y = 12;
  r3.appendChild(await captioned(t, title));
}
{ const t = tile(282, 220); const l = logo(hSet, "Primary"); l.rescale(0.7); t.appendChild(l); const flat = figma.flatten([l.detachInstance()], t); flat.resize(flat.width * 1.15, flat.height * 0.6); await dont(t, "Не растягивайте и не сжимайте"); }
{ const t = tile(282, 220); const l = logo(hSet, "Mono Dark"); l.rescale(0.7); t.appendChild(l); for (const n of l.findAll(n => n.type !== "INSTANCE" && n.type !== "FRAME")) { if ("fills" in n && n.fills.length) n.fills = solid("#2F6FD6"); if ("strokes" in n && n.strokes.length) n.strokes = solid("#2F6FD6"); } await dont(t, "Не меняйте цвета"); }
{ const t = tile(282, 220); const l = logo(hSet, "Primary"); l.rescale(0.7); t.appendChild(l); l.rotation = 12; await dont(t, "Не поворачивайте"); }
{ const t = tile(282, 220, "color/bg/inverse"); const l = logo(hSet, "Primary"); l.rescale(0.7); t.appendChild(l); await dont(t, "Не ставьте на фон без контраста"); }

return { bb: bb.id, sheets: bb.children.map(c => ({ id: c.id, name: c.name, h: c.height })), msgVariants: msg.children.map(v => v.findOne(n => n.type === "TEXT").characters), shot: await screenshot(bb, { maxDimension: 2600 }) };
