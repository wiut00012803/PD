const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
const bb = await figma.getNodeByIdAsync("31:71");
const kit = await figma.getNodeByIdAsync("35:1557");
const at = bb.children.findIndex(c => c.name.startsWith("06 ·")); if (at >= 0) bb.children[at].remove();
const img = k => ({ type: "IMAGE", imageHash: figma.createImage(figma.base64Decode(PHOTOS[k])).hash, scaleMode: "FILL" });
const IC = Object.fromEntries(kit.findOne(n => n.name === "Icons").findAll(n => n.type === "COMPONENT").map(c => [c.name.replace("icon/", ""), c]));
const ibSet = await figma.getNodeByIdAsync("35:1843"), statSet = await figma.getNodeByIdAsync("35:1975"), chipSet = await figma.getNodeByIdAsync("35:1830");
const v = (set, name) => set.children.find(c => c.name === name);
function icon(k, size, colorName, th) { const i = IC[k].createInstance(); if (size !== 24) i.rescale(size / 24); recolor(i, colorName, th); return i; }
function F(dir, o = {}) { const f = figma.createFrame(); f.layoutMode = dir; f.primaryAxisSizingMode = "AUTO"; f.counterAxisSizingMode = "AUTO"; f.fills = []; for (const k in o) f[k] = o[k]; return f; }
function fixed(f, w, h) { f.resize(w, h); f.primaryAxisSizingMode = "FIXED"; f.counterAxisSizingMode = "FIXED"; return f; }
function glowE(parent, w, h, x, y, op, th) { const e = figma.createEllipse(); e.name = "Glow"; e.resize(w, h); e.fills = [{ ...paint("color/glow/primary", th), opacity: op }]; e.effects = [{ type: "LAYER_BLUR", radius: 200, visible: true }]; parent.appendChild(e); e.layoutPositioning = "ABSOLUTE"; e.x = x; e.y = y; }
const NAVY = hexRGB("#0E1A2B");
const fadeToBottom = (rgb, a) => ({ type: "GRADIENT_LINEAR", gradientTransform: [[0, 1, 0], [-1, 0, 1]], gradientStops: [{ position: 0.45, color: { ...rgb, a: 0 } }, { position: 1, color: { ...rgb, a } }] });
// glass plate/chip placed over a photo
async function plate(text, th, sub) {
  const p = F("VERTICAL", { name: "Glass plate", itemSpacing: 2, paddingTop: 10, paddingBottom: 10, paddingLeft: 16, paddingRight: 16 }); rad(p, "radius/lg");
  p.fills = [paint("color/surface/glass-strong", th)]; p.strokes = [paint("color/border/glass-strong", th)]; p.strokeWeight = 1; p.effects = [{ type: "BACKGROUND_BLUR", radius: 20, visible: true }];
  p.appendChild(await txt(text, "Label", "color/text/primary", th)); if (sub) p.appendChild(await txt(sub, "Body/S", "color/text/secondary", th)); return p;
}
async function photoCard(key, w, h, label, th = "Light") {
  const c = fixed(F("VERTICAL", { name: `Photo / ${key}`, paddingBottom: 16, paddingLeft: 16, primaryAxisAlignItems: "MAX" }), w, h); rad(c, "radius/xl"); c.clipsContent = true;
  c.fills = [img(key)]; c.strokes = [paint("color/border/glass", th)]; c.strokeWeight = 1; c.strokeAlign = "INSIDE";
  if (label) c.appendChild(await plate(label, th)); return c;
}

const s = figma.createFrame(); s.name = "06 · Фото и иконки"; s.layoutMode = "VERTICAL"; s.resize(1440, 100); s.primaryAxisSizingMode = "AUTO"; s.counterAxisSizingMode = "FIXED";
s.paddingTop = s.paddingBottom = 96; s.paddingLeft = s.paddingRight = 120; s.itemSpacing = 56; s.fills = [paint("color/bg/page", "Light")]; s.clipsContent = true; bb.insertChild(at, s);
const h = F("VERTICAL", { name: "Header", itemSpacing: 16 }); s.appendChild(h);
h.appendChild(await txt("06 — Фотографии и иконки", "Overline", "color/text/accent", "Light"));
h.appendChild(await txt("Фотографии и иконки", "Heading/H1", "color/text/primary", "Light"));
const lead = await txt("Фотографии документальные и спокойные: естественный свет, реальные люди и детали работы. На сайте фото всегда живут в скруглённых карточках со стеклянной рамкой — никаких затемнённых фонов на всю ширину. Ниже — референсы стиля (CC0); на сайте их заменят собственные фото команды и офиса.", "Body/L", "color/text/secondary", "Light"); h.appendChild(lead); lead.resize(840, lead.height); lead.textAutoResize = "HEIGHT";
// bento photo grid
const g1 = F("HORIZONTAL", { name: "Photos row 1", itemSpacing: 20 }); s.appendChild(g1);
g1.appendChild(await photoCard("library", 790, 440, "Интерьеры и архитектура"));
g1.appendChild(await photoCard("handshake", 390, 440, "Люди в работе"));
const g2 = F("HORIZONTAL", { name: "Photos row 2", itemSpacing: 20 }); s.appendChild(g2);
g2.appendChild(await photoCard("work", 590, 300, "Консультация"));
g2.appendChild(await photoCard("docs", 590, 300, "Документы и детали"));

// photo + text compositions
s.appendChild(await txt("Фото и текст", "Heading/H3", "color/text/primary", "Light"));
const ruleT = await txt("Текст стоит рядом с фото, а не на нём. Если подпись нужна поверх фото — только на стеклянной плашке, низ фото плавно уходит в цвет фона.", "Body/M", "color/text/secondary", "Light"); s.appendChild(ruleT); ruleT.resize(840, ruleT.height); ruleT.textAutoResize = "HEIGHT";
const kV = Object.keys(statSet.componentPropertyDefinitions).find(k => k.startsWith("Value")), kC = Object.keys(statSet.componentPropertyDefinitions).find(k => k.startsWith("Caption"));
for (const th of ["Light", "Dark"]) {
  const panel = fixed(F("HORIZONTAL", { name: `Composition ${th}`, itemSpacing: 56, paddingLeft: 56, paddingRight: 56, counterAxisAlignItems: "CENTER" }), 1200, 520); rad(panel, "radius/2xl"); panel.clipsContent = true;
  panel.fills = [paint("color/bg/page", th)]; panel.strokes = [paint("color/border/glass", th)]; panel.strokeWeight = 1;
  glowE(panel, 700, 420, th === "Light" ? -120 : 520, -200, th === "Light" ? 0.22 : 0.3, th);
  const col = F("VERTICAL", { itemSpacing: 20 }); panel.appendChild(col);
  col.appendChild(v(chipSet, `Theme=${th}`).createInstance());
  const tt = await txt(th === "Light" ? "Команда, которая\nведёт дело до конца" : "Каждое дело ведёт\nпартнёр фирмы", "Heading/H2", "color/text/primary", th); col.appendChild(tt);
  const bt = await txt("Фото — в карточке со скруглением 24 px и тонкой стеклянной рамкой. Цифры и подписи — на стеклянных плашках поверх нижнего края.", "Body/M", "color/text/secondary", th); col.appendChild(bt); bt.resize(420, bt.height); bt.textAutoResize = "HEIGHT";
  // photo card with fade + glass plate + overlapping stat
  const wrap = fixed(F("VERTICAL", { name: "Photo stack" }), 560, 420); wrap.layoutMode = "NONE"; panel.appendChild(wrap);
  const pc = figma.createFrame(); pc.name = "Photo card"; pc.resize(500, 400); rad(pc, "radius/xl"); pc.clipsContent = true; wrap.appendChild(pc); pc.x = 60; pc.y = 0;
  pc.fills = th === "Light" ? [img("handshake")] : [img("library"), fadeToBottom(NAVY, 0.85)]; pc.strokes = [paint("color/border/glass-strong", th)]; pc.strokeWeight = 1; pc.strokeAlign = "INSIDE";
  const pl = await plate(th === "Light" ? "Первая встреча — бесплатно" : "Офис в центре Ташкента", th, th === "Light" ? "онлайн или в офисе" : "приём по записи"); pc.appendChild(pl); pl.x = 20; pl.y = 400 - pl.height - 20;
  const st = v(statSet, `Theme=${th}`).createInstance(); st.setProperties({ [kV]: "1 200+", [kC]: "выигранных дел" }); st.resize(220, st.height); wrap.appendChild(st); st.x = 0; st.y = 40;
  s.appendChild(panel);
}
// do / don't
const dd = F("HORIZONTAL", { name: "Do / Don't", itemSpacing: 20 }); s.appendChild(dd);
for (const [ok, title, items] of [[true, "Так", ["Естественный свет, тёплые нейтральные тона", "Реальные люди и детали: руки, документы, переговоры", "Фото в скруглённой карточке со стеклянной рамкой", "Текст рядом с фото или на стеклянной плашке"]], [false, "Не так", ["Сплошное затемнение фото на всю ширину экрана", "Молоток судьи, весы Фемиды и другие клише", "Постановочные стоковые улыбки, сильные фильтры", "Фото с Pinterest без лицензии — нарушение авторских прав"]]]) {
  const c = F("VERTICAL", { name: title, itemSpacing: 14, paddingTop: 32, paddingBottom: 32, paddingLeft: 32, paddingRight: 32 }); c.resize(590, 10); c.counterAxisSizingMode = "FIXED"; c.primaryAxisSizingMode = "AUTO"; rad(c, "radius/xl"); glass(c, "Light");
  const hd = F("HORIZONTAL", { itemSpacing: 12, counterAxisAlignItems: "CENTER" }); c.appendChild(hd);
  const ib = fixed(F("HORIZONTAL", { primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" }), 36, 36); rad(ib, "radius/full"); ib.fills = ok ? [paint("color/bg/accent-subtle", "Light")] : [{ type: "SOLID", color: hexRGB("#B42318"), opacity: 0.1 }];
  ib.appendChild(icon(ok ? "ui/check" : "ui/x", 18, ok ? "color/icon/accent" : "color/text/error", "Light")); hd.appendChild(ib); hd.appendChild(await txt(title, "Heading/H4", "color/text/primary", "Light"));
  for (const it of items) { const r = F("HORIZONTAL", { itemSpacing: 10 }); c.appendChild(r); r.layoutSizingHorizontal = "FILL"; const d = figma.createEllipse(); d.resize(6, 6); d.fills = ok ? [paint("color/bg/accent", "Light")] : [{ type: "SOLID", color: hexRGB("#B42318") }]; const dw = fixed(F("HORIZONTAL", { counterAxisAlignItems: "CENTER" }), 6, 24); dw.appendChild(d); r.appendChild(dw); const t = await txt(it, "Body/M", "color/text/secondary", "Light"); r.appendChild(t); t.layoutGrow = 1; t.textAutoResize = "HEIGHT"; }
  dd.appendChild(c);
}
// icons
s.appendChild(await txt("Иконки", "Heading/H3", "color/text/primary", "Light"));
const it = await txt("Набор Lucide (ISC): линейные, обводка 1.5 px, сетка 24 px, скруглённые концы. В интерфейсе — в плашке Icon Box охрой; соцсети — Simple Icons (CC0), только в монохроме.", "Body/M", "color/text/secondary", "Light"); s.appendChild(it); it.resize(840, it.height); it.textAutoResize = "HEIGHT";
for (const th of ["Light", "Dark"]) {
  const grid = F("HORIZONTAL", { name: `Icon grid ${th}`, itemSpacing: 12, counterAxisSpacing: 12, paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 }); grid.layoutWrap = "WRAP"; grid.primaryAxisSizingMode = "FIXED"; grid.resize(1200, 10); grid.counterAxisSizingMode = "AUTO";
  grid.fills = [paint("color/bg/page", th)]; rad(grid, "radius/2xl"); grid.strokes = [paint("color/border/glass", th)]; grid.strokeWeight = 1; s.appendChild(grid);
  for (const k of ["ui/briefcase", "ui/users", "ui/house", "ui/shield-check", "ui/file-text", "ui/landmark", "ui/building-2", "ui/lock", "ui/award", "ui/clock", "ui/phone", "ui/mail", "ui/map-pin", "ui/message-circle", "social/telegram", "social/whatsapp", "social/instagram", "social/facebook", "social/youtube", "ui/arrow-right"]) {
    const cell = fixed(F("VERTICAL", { itemSpacing: 8, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" }), 104, 96); rad(cell, "radius/lg"); glass(cell, th);
    const ui = k.startsWith("ui/"); if (ui && ["ui/briefcase", "ui/users", "ui/house", "ui/shield-check", "ui/file-text"].includes(k)) { const b = v(ibSet, `Theme=${th}`).createInstance(); cell.appendChild(b); const inner = b.findOne(n => n.type === "INSTANCE"); if (inner) inner.swapComponent(IC[k]); recolor(b, "color/icon/accent", th); }
    else cell.appendChild(icon(k, 26, "color/icon/primary", th));
    cell.appendChild(await txt(k.split("/")[1], "Body/S", "color/text/tertiary", th)); grid.appendChild(cell);
  }
}
return { sheet: s.id, shot: await screenshot(s, { maxDimension: 1800 }) };
