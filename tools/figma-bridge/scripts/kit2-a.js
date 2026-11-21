//@prelude2
const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
log("page");
const oldKit = await figma.getNodeByIdAsync("26:169");
let kit = page.findOne(n => n.name === "UI Kit v2 — Style C" && n.parent === page);
if (kit) { const icons = kit.findOne(n => n.name === "Icons"); if (icons) oldKit.insertChild(1, icons); kit.remove(); }
kit = figma.createFrame(); kit.name = "UI Kit v2 — Style C"; kit.layoutMode = "VERTICAL"; kit.primaryAxisSizingMode = "AUTO"; kit.counterAxisSizingMode = "AUTO";
kit.itemSpacing = 72; kit.paddingTop = kit.paddingBottom = kit.paddingLeft = kit.paddingRight = 80; kit.fills = solid("#FFFFFF");
kit.x = 0; kit.y = -6000; page.appendChild(kit);
const head = figma.createFrame(); head.layoutMode = "VERTICAL"; head.primaryAxisSizingMode = "AUTO"; head.counterAxisSizingMode = "AUTO"; head.fills = []; head.itemSpacing = 12; head.name = "Header";
head.appendChild(await txt("Pravoe Delo · UI Kit v2", "Overline", "color/text/accent", "Light"));
head.appendChild(await txt("UI-компоненты · стиль C", "Heading/H1", "color/text/primary", "Light"));
const lead = await txt("Каждый компонент имеет свойство Theme = Light / Dark и привязан к коллекциям «Color · Light» и «Color · Dark» (одинаковые имена токенов → одни и те же CSS-переменные). Слева светлая тема на светлом фоне, справа тёмная на тёмно-синем.", "Body/M", "color/text/secondary", "Light");
head.appendChild(lead); lead.resize(900, lead.height); lead.textAutoResize = "HEIGHT";
kit.appendChild(head);
async function section(title) { const s = figma.createFrame(); s.name = `Section / ${title}`; s.layoutMode = "VERTICAL"; s.primaryAxisSizingMode = "AUTO"; s.counterAxisSizingMode = "AUTO"; s.fills = []; s.itemSpacing = 20; s.appendChild(await txt(title, "Heading/H3", "color/text/primary", "Light")); kit.appendChild(s); return s; }

// ---- Icons: move existing icon components (instances stay linked) + add sun / moon
const sIcons = await section("Иконки");
const iconsFrame = oldKit.findOne(n => n.name === "Icons"); sIcons.appendChild(iconsFrame);
const EXTRA = { "ui/sun": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#0E1A2B\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2\"/><path d=\"M12 20v2\"/><path d=\"m4.93 4.93 1.41 1.41\"/><path d=\"m17.66 17.66 1.41 1.41\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"m6.34 17.66-1.41 1.41\"/><path d=\"m19.07 4.93-1.41 1.41\"/></svg>", "ui/moon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#0E1A2B\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/></svg>" };
for (const [k, svg] of Object.entries(EXTRA)) {
  if (iconsFrame.findOne(n => n.name === `icon/${k}`)) continue;
  const c = figma.createComponent(); c.name = `icon/${k}`; c.resize(24, 24); c.fills = [];
  const n = figma.createNodeFromSvg(svg); n.fills = []; n.name = "vector"; c.appendChild(n); n.x = 0; n.y = 0; recolor(c, "color/icon/primary", "Light");
  c.description = "UI-иконка (Lucide, ISC), обводка 1.5"; iconsFrame.appendChild(c);
}
const IC = Object.fromEntries(iconsFrame.findAll(n => n.type === "COMPONENT").map(c => [c.name.replace("icon/", ""), c]));
const uiPreferred = Object.entries(IC).filter(([k]) => k.startsWith("ui/")).map(([, c]) => ({ type: "COMPONENT", key: c.key }));
const socialPreferred = Object.entries(IC).filter(([k]) => k.startsWith("social/")).map(([, c]) => ({ type: "COMPONENT", key: c.key }));
function icon(k, size, colorName, th) { const i = IC[k].createInstance(); if (size !== 24) i.rescale(size / 24); recolor(i, colorName, th); return i; }
log("icons");

// ---- Button: Style × Size × State × Theme
const btnComps = [], btnRefs = [];
for (const th of ["Light", "Dark"]) for (const style of ["Primary", "Secondary", "Ghost"]) for (const size of ["M", "S"]) for (const state of ["Default", "Hover"]) {
  const c = comp(`Style=${style}, Size=${size}, State=${state}, Theme=${th}`, "HORIZONTAL"); gap(c, "spacing/xs");
  let fg;
  if (style === "Primary") { c.fills = [paint(state === "Hover" ? "color/bg/accent-hover" : "color/bg/accent", th)]; fg = "color/text/on-accent"; }
  else if (style === "Secondary") { glass(c, th, true); if (state === "Hover") c.fills = [paint("color/surface/glass-active", th)]; fg = "color/text/primary"; }
  else { fg = "color/text/accent"; }
  if (style !== "Ghost") { size === "M" ? pad(c, "spacing/md", "spacing/xl") : pad(c, "spacing/xs", "spacing/md"); rad(c, "radius/full"); if (size === "M") { c.paddingTop = 15; c.paddingBottom = 15; c.paddingLeft = 28; c.paddingRight = 28; } else { c.paddingTop = 10; c.paddingBottom = 10; c.paddingLeft = 18; c.paddingRight = 18; } }
  const t = await txt("Получить консультацию", "Button", fg, th); if (size === "S") t.fontSize = 14; if (style === "Ghost" && state === "Hover") t.textDecoration = "UNDERLINE";
  c.appendChild(t);
  const i = icon("ui/arrow-right", size === "M" ? 18 : 16, style === "Primary" ? "color/text/on-accent" : style === "Ghost" ? "color/icon/accent" : "color/icon/primary", th); i.name = "Icon"; c.appendChild(i);
  btnComps.push(c); btnRefs.push({ t, i });
}
const sBtn = await section("Button");
const btnSet = figma.combineAsVariants(btnComps, sBtn); btnSet.name = "Button";
btnSet.description = "Кнопка-капсула. Primary — главный CTA (охра, тёмный текст). Secondary — матовое стекло. Ghost — текстовая ссылка охрой со стрелкой. Size M/S, Theme Light/Dark.";
const kLabel = btnSet.addComponentProperty("Label", "TEXT", "Получить консультацию");
const kShow = btnSet.addComponentProperty("Show icon", "BOOLEAN", false);
const kIcon = btnSet.addComponentProperty("Icon", "INSTANCE_SWAP", IC["ui/arrow-right"].id, { preferredValues: uiPreferred });
for (const { t, i } of btnRefs) { t.componentPropertyReferences = { characters: kLabel }; i.componentPropertyReferences = { visible: kShow, mainComponent: kIcon }; }
themeLayout(btnSet, 4);
log("button");

// ---- Messenger: Platform × Theme
const MSG = { Telegram: ["social/telegram", "Telegram"], WhatsApp: ["social/whatsapp", "WhatsApp"], Phone: ["ui/phone", "+998 00 000-00-00"] };
const msgComps = [];
for (const th of ["Light", "Dark"]) for (const [p, [ik, label]] of Object.entries(MSG)) {
  const c = comp(`Platform=${p}, Theme=${th}`, "HORIZONTAL"); gap(c, "spacing/xs"); glass(c, th, true); rad(c, "radius/full");
  c.paddingTop = c.paddingBottom = 14; c.paddingLeft = 22; c.paddingRight = 24;
  c.appendChild(icon(ik, 18, "color/icon/primary", th)); c.appendChild(await txt(label, "Button", "color/text/primary", th)); msgComps.push(c);
}
const sMsg = await section("Messenger Button");
const msgSet = figma.combineAsVariants(msgComps, sMsg); msgSet.name = "Messenger Button"; msgSet.description = "Быстрая связь: Telegram, WhatsApp, телефон. Стеклянная капсула.";
themeLayout(msgSet, 3);

// ---- Lang segmented: Active × Theme
const langComps = [];
for (const th of ["Light", "Dark"]) for (const active of ["RU", "UZ", "EN"]) {
  const c = comp(`Active=${active}, Theme=${th}`, "HORIZONTAL"); c.itemSpacing = 2; c.paddingTop = c.paddingBottom = c.paddingLeft = c.paddingRight = 3; rad(c, "radius/full");
  c.fills = [paint("color/surface/glass-strong", th)]; c.strokes = [paint("color/border/glass", th)]; c.strokeWeight = 1; c.strokeAlign = "INSIDE";
  for (const l of ["RU", "UZ", "EN"]) {
    const on = l === active; const it = figma.createFrame(); it.name = `Lang ${l}`; it.layoutMode = "HORIZONTAL"; it.primaryAxisSizingMode = "AUTO"; it.counterAxisSizingMode = "AUTO";
    it.paddingTop = it.paddingBottom = 5; it.paddingLeft = it.paddingRight = 12; rad(it, "radius/full"); it.fills = on ? [paint("color/surface/glass-active", th)] : [];
    if (on && th === "Light") it.effects = [shadowFx(0.12, 1, 3)];
    const t = await txt(l, "Label", on ? "color/text/primary" : "color/text/secondary", th); t.fontSize = 13; if (on) t.fontName = { family: "Inter", style: "Semi Bold" };
    it.appendChild(t); c.appendChild(it);
  }
  langComps.push(c);
}
const sLang = await section("Lang Switcher");
const langSet = figma.combineAsVariants(langComps, sLang); langSet.name = "Lang Switcher"; langSet.description = "Segmented control RU / UZ / EN. Активный язык — «таблетка» glass-active.";
themeLayout(langSet, 3);

// ---- Theme toggle
const tgComps = [];
for (const th of ["Light", "Dark"]) {
  const c = comp(`Theme=${th}`, "HORIZONTAL"); c.primaryAxisAlignItems = "CENTER"; c.resize(36, 36); c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "FIXED"; rad(c, "radius/full");
  c.fills = [paint("color/surface/glass-strong", th)]; c.strokes = [paint("color/border/glass", th)]; c.strokeWeight = 1; c.strokeAlign = "INSIDE";
  c.appendChild(icon(th === "Light" ? "ui/moon" : "ui/sun", 18, "color/icon/primary", th)); tgComps.push(c);
}
const sTg = await section("Theme Toggle");
const tgSet = figma.combineAsVariants(tgComps, sTg); tgSet.name = "Theme Toggle"; tgSet.description = "Переключатель темы. По умолчанию тема берётся из настроек браузера (prefers-color-scheme), выбор сохраняется. В светлой теме показывает луну, в тёмной — солнце.";
themeLayout(tgSet, 1);

// ---- Chip
const chipComps = [], chipTexts = [];
for (const th of ["Light", "Dark"]) {
  const c = comp(`Theme=${th}`, "HORIZONTAL"); gap(c, "spacing/xs"); rad(c, "radius/full"); glass(c, th); c.paddingTop = c.paddingBottom = 7; c.paddingLeft = c.paddingRight = 14;
  const d = figma.createEllipse(); d.name = "Dot"; d.resize(7, 7); d.fills = [paint("color/bg/accent", th)]; c.appendChild(d);
  const t = await txt("Бесплатная онлайн-консультация", "Label", "color/text/secondary", th); c.appendChild(t); chipTexts.push(t); chipComps.push(c);
}
const sChip = await section("Chip");
const chipSet = figma.combineAsVariants(chipComps, sChip); chipSet.name = "Chip"; chipSet.description = "Бейдж-подпись над заголовком.";
const kChip = chipSet.addComponentProperty("Label", "TEXT", "Бесплатная онлайн-консультация"); for (const t of chipTexts) t.componentPropertyReferences = { characters: kChip };
themeLayout(chipSet, 1);

// ---- Icon Box
const ibComps = [], ibIcons = [];
for (const th of ["Light", "Dark"]) {
  const c = comp(`Theme=${th}`, "HORIZONTAL"); c.primaryAxisAlignItems = "CENTER"; c.resize(52, 52); c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "FIXED"; rad(c, "radius/md");
  c.fills = [paint("color/bg/accent-subtle", th)]; c.strokes = [paint("color/border/accent-subtle", th)]; c.strokeWeight = 1; c.strokeAlign = "INSIDE";
  const i = icon("ui/briefcase", 26, "color/icon/accent", th); i.name = "Icon"; c.appendChild(i); ibIcons.push(i); ibComps.push(c);
}
const sIb = await section("Icon Box");
const ibSet = figma.combineAsVariants(ibComps, sIb); ibSet.name = "Icon Box";
const kIb = ibSet.addComponentProperty("Icon", "INSTANCE_SWAP", IC["ui/briefcase"].id, { preferredValues: uiPreferred }); for (const i of ibIcons) i.componentPropertyReferences = { mainComponent: kIb };
themeLayout(ibSet, 1);
log("all");
const shot = await screenshot(kit, { maxDimension: 1800 });
return { kit: kit.id, sets: { button: btnSet.id, messenger: msgSet.id, lang: langSet.id, toggle: tgSet.id, chip: chipSet.id, iconBox: ibSet.id }, buttonVariants: btnSet.children.length, shot };
