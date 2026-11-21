const page = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(page);
for (const n of [...page.children]) if (n.name === "Style exploration") n.remove();
const FONTS = [["Inter","Regular"],["Inter","Medium"],["Inter","Semi Bold"],["Inter","Bold"],["Manrope","Regular"],["Manrope","Medium"],["Manrope","SemiBold"],["Manrope","Light"],["Manrope","ExtraLight"],["Cormorant Garamond","Medium"],["Cormorant Garamond","SemiBold"]];
await Promise.all(FONTS.map(([family, style]) => figma.loadFontAsync({ family, style })));
const rgb = h => ({ r: parseInt(h.slice(1,3),16)/255, g: parseInt(h.slice(3,5),16)/255, b: parseInt(h.slice(5,7),16)/255 });
const fill = (h, op = 1) => [{ type: "SOLID", color: rgb(h), opacity: op }];
const NAVY = "#0E1A2B", NAVY8 = "#18273D", OCHRE = "#C08A3E", OCHRE7 = "#8A5F26", GRAY6 = "#5E6673", GRAY4 = "#9AA3AF", WHITE = "#FFFFFF", APPLEBG = "#F5F5F7";
const img = k => [{ type: "IMAGE", imageHash: figma.createImage(figma.base64Decode(PHOTOS[k])).hash, scaleMode: "FILL" }];
const shadow = (a = 0.12, y = 1, r = 3) => ({ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a }, offset: { x: 0, y }, radius: r, spread: 0, visible: true, blendMode: "NORMAL" });
function T(s, fam, style, size, hex, o = {}) {
  const t = figma.createText(); t.fontName = { family: fam, style }; t.characters = s; t.fontSize = size; t.fills = fill(hex, o.op ?? 1);
  if (o.ls != null) t.letterSpacing = { unit: "PERCENT", value: o.ls }; if (o.lh) t.lineHeight = { unit: "PERCENT", value: o.lh };
  if (o.align) t.textAlignHorizontal = o.align; if (o.deco) t.textDecoration = o.deco; if (o.name) t.name = o.name;
  if (o.w) { t.resize(o.w, t.height); t.textAutoResize = "HEIGHT"; } return t;
}
function F(dir, props = {}) { return al(dir, props); }
function box(dir, w, h, props = {}) { const f = al(dir, props); f.resize(w, h); f.primaryAxisSizingMode = "FIXED"; f.counterAxisSizingMode = "FIXED"; return f; }
function add(parent, ...kids) { for (const k of kids) parent.appendChild(k); return parent; }
function abs(parent, n, x, y) { parent.appendChild(n); n.layoutPositioning = "ABSOLUTE"; n.x = x; n.y = y; return n; }
function stroke(n, hex, op = 1, w = 1) { n.strokes = fill(hex, op); n.strokeWeight = w; n.strokeAlign = "INSIDE"; return n; }
const ICON_IDS = { briefcase: "26:188", users: "26:287", house: "26:225", gavel: "26:218", shield: "26:278", telegram: "26:303", scale: "26:271", file: "26:211", lock: "26:237", arrow: "26:180", whatsapp: "26:306" };
const ICONS = {}; for (const [k, id] of Object.entries(ICON_IDS)) ICONS[k] = await figma.getNodeByIdAsync(id);
function icon(k, size, hex) { const i = ICONS[k].createInstance(); i.rescale(size / 24); for (const n of i.findAll(() => true)) { if (["FRAME","INSTANCE","GROUP"].includes(n.type)) continue; if (n.strokes && n.strokes.length) n.strokes = fill(hex); if (Array.isArray(n.fills) && n.fills.length) n.fills = fill(hex); } return i; }
const markSet = await figma.getNodeByIdAsync("20:47"), hSet = await figma.getNodeByIdAsync("20:104");
const logo = (set, c, h) => { const i = set.children.find(v => v.name === `Color=${c}`).createInstance(); if (h) i.rescale(h / i.height); return i; };
function seg(theme, active = "RU") {
  const dark = theme === "dark";
  const s = F("HORIZONTAL", { name: "Lang segmented", paddingTop: 3, paddingBottom: 3, paddingLeft: 3, paddingRight: 3, itemSpacing: 2 });
  s.cornerRadius = 999; s.fills = dark ? fill(WHITE, 0.08) : fill("#E8EAEE");
  for (const l of ["RU", "UZ", "EN"]) {
    const on = l === active;
    const it = F("HORIZONTAL", { paddingTop: 5, paddingBottom: 5, paddingLeft: 12, paddingRight: 12 }); it.cornerRadius = 999;
    if (on) { it.fills = dark ? fill(WHITE, 0.16) : fill(WHITE); if (!dark) it.effects = [shadow(0.14, 1, 3)]; }
    it.appendChild(T(l, "Inter", on ? "Semi Bold" : "Medium", 13, dark ? (on ? WHITE : GRAY4) : (on ? NAVY : GRAY6)));
    s.appendChild(it);
  }
  return s;
}
function capsule(label, bg, fg, o = {}) {
  const b = F("HORIZONTAL", { itemSpacing: 8, counterAxisAlignItems: "CENTER", paddingTop: o.py ?? 15, paddingBottom: o.py ?? 15, paddingLeft: o.px ?? 28, paddingRight: o.px ?? 28, name: `Button · ${label}` });
  b.cornerRadius = o.r ?? 999; b.fills = bg ? fill(bg, o.bgOp ?? 1) : []; if (o.stroke) stroke(b, o.stroke, o.strokeOp ?? 1);
  if (o.icon) b.appendChild(icon(o.icon, o.iconSize ?? 18, fg));
  b.appendChild(T(label, o.fam ?? "Inter", o.style ?? "Medium", o.size ?? 17, fg));
  if (o.after) b.appendChild(T(o.after, o.fam ?? "Inter", "Medium", o.size ?? 17, fg));
  return b;
}
async function column(title, desc) {
  const col = F("VERTICAL", { name: title, itemSpacing: 48 });
  const head = F("VERTICAL", { itemSpacing: 12, name: "Label" });
  head.appendChild(T(title, "Inter", "Bold", 44, NAVY, { ls: -2 }));
  head.appendChild(T(desc, "Inter", "Regular", 18, GRAY6, { w: 1000, lh: 150 }));
  col.appendChild(head); return col;
}
const root = F("HORIZONTAL", { name: "Style exploration", itemSpacing: 200 }); root.x = 0; root.y = 0;

// ================= A · APPLE =================
const colA = await column("A · Apple-стиль", "Капсульные кнопки, скругления 28 px, матовая шапка, segmented control для языков, крупный гротеск Inter с плотным трекингом, светло-серые «сгруппированные» фоны и бенто-карточки без рамок."); root.appendChild(colA);
{
  const hero = box("VERTICAL", 1440, 900, { name: "A1 · Hero", counterAxisAlignItems: "CENTER" }); hero.fills = fill(WHITE); hero.clipsContent = true; colA.appendChild(hero);
  const nav = box("HORIZONTAL", 1440, 56, { name: "Nav · frosted", paddingLeft: 120, paddingRight: 120, counterAxisAlignItems: "CENTER", primaryAxisAlignItems: "SPACE_BETWEEN" });
  nav.fills = fill(WHITE, 0.72); nav.effects = [{ type: "BACKGROUND_BLUR", radius: 20, visible: true }]; nav.strokes = fill(NAVY, 0.08); nav.strokeBottomWeight = 1; nav.strokeTopWeight = 0; nav.strokeLeftWeight = 0; nav.strokeRightWeight = 0;
  const brand = F("HORIZONTAL", { itemSpacing: 10, counterAxisAlignItems: "CENTER" }); add(brand, logo(markSet, "Primary", 26), T("Pravoe Delo", "Inter", "Semi Bold", 15, NAVY, { ls: -1 }));
  const links = F("HORIZONTAL", { itemSpacing: 32 }); for (const l of ["Услуги", "О нас", "Команда", "Кейсы", "FAQ", "Контакты"]) links.appendChild(T(l, "Inter", "Regular", 13, NAVY, { op: 0.8 }));
  const right = F("HORIZONTAL", { itemSpacing: 16, counterAxisAlignItems: "CENTER" }); add(right, seg("light"), capsule("Консультация", NAVY, WHITE, { size: 13, py: 7, px: 16 }));
  add(nav, brand, links, right); hero.appendChild(nav); nav.layoutSizingHorizontal = "FILL";
  const c = F("VERTICAL", { counterAxisAlignItems: "CENTER", itemSpacing: 22, paddingTop: 104 }); hero.appendChild(c);
  add(c, T("Адвокаты и юристы Pravoe Delo", "Inter", "Semi Bold", 19, OCHRE7));
  add(c, T("Правовая защита.\nБез лишних слов.", "Inter", "Bold", 88, NAVY, { ls: -3.5, lh: 104, align: "CENTER" }));
  add(c, T("Бесплатная онлайн-консультация. Ответ в течение 24 часов.", "Inter", "Regular", 24, GRAY6, { ls: -1, align: "CENTER" }));
  const btns = F("HORIZONTAL", { itemSpacing: 28, counterAxisAlignItems: "CENTER", paddingTop: 12 }); add(btns, capsule("Получить консультацию", NAVY, WHITE), T("Написать в Telegram ›", "Inter", "Medium", 17, OCHRE7)); c.appendChild(btns);
  const sp = F("VERTICAL", { paddingTop: 36 }); const ph = figma.createRectangle(); ph.resize(1200, 420); ph.fills = img("library"); ph.cornerRadius = 28; sp.appendChild(ph); c.appendChild(sp);

  const blk = F("VERTICAL", { name: "A2 · Bento", itemSpacing: 48, paddingTop: 112, paddingBottom: 112, paddingLeft: 120, paddingRight: 120 }); blk.resize(1440, 100); blk.counterAxisSizingMode = "FIXED"; blk.fills = fill(APPLEBG); colA.appendChild(blk);
  const h = F("VERTICAL", { itemSpacing: 12 }); add(h, T("Чем мы поможем.", "Inter", "Bold", 56, NAVY, { ls: -3 }), T("Восемь практик. Одна команда. Понятная цена до начала работы.", "Inter", "Regular", 24, GRAY6, { ls: -1 })); blk.appendChild(h);
  const r1 = F("HORIZONTAL", { itemSpacing: 20 }); blk.appendChild(r1);
  const big = box("VERTICAL", 790, 420, { itemSpacing: 16, paddingTop: 44, paddingBottom: 44, paddingLeft: 44, paddingRight: 44 }); big.fills = fill(WHITE); big.cornerRadius = 28;
  add(big, icon("briefcase", 44, OCHRE), T("Бизнес-право", "Inter", "Bold", 36, NAVY, { ls: -2 }), T("Регистрация и ликвидация компаний, договоры, корпоративные и налоговые споры, сопровождение проверок.", "Inter", "Regular", 19, GRAY6, { w: 560, lh: 150 }));
  const sp2 = F("VERTICAL"); sp2.layoutGrow = 1; big.appendChild(sp2); sp2.layoutGrow = 1; big.appendChild(T("Подробнее ›", "Inter", "Medium", 17, OCHRE7));
  const stat = box("VERTICAL", 390, 420, { itemSpacing: 8, paddingTop: 44, paddingBottom: 44, paddingLeft: 44, paddingRight: 44, primaryAxisAlignItems: "MAX" }); stat.fills = fill(NAVY); stat.cornerRadius = 28;
  add(stat, T("1 200+", "Inter", "Bold", 80, WHITE, { ls: -4 }), T("выигранных дел с 2010 года", "Inter", "Regular", 19, GRAY4));
  add(r1, big, stat);
  const r2 = F("HORIZONTAL", { itemSpacing: 20 }); blk.appendChild(r2);
  const pc = figma.createRectangle(); pc.resize(386, 360); pc.fills = img("handshake"); pc.cornerRadius = 28; r2.appendChild(pc);
  for (const [ic, t, d] of [["house", "Семейные споры", "Развод, алименты, раздел имущества — деликатно и конфиденциально."], ["shield", "Уголовные дела", "Защита на всех стадиях: от допроса до суда и обжалования."]]) {
    const cd = box("VERTICAL", 387, 360, { itemSpacing: 14, paddingTop: 36, paddingBottom: 36, paddingLeft: 36, paddingRight: 36 }); cd.fills = fill(WHITE); cd.cornerRadius = 28;
    add(cd, icon(ic, 36, OCHRE), T(t, "Inter", "Bold", 28, NAVY, { ls: -2 }), T(d, "Inter", "Regular", 17, GRAY6, { w: 315, lh: 150 }));
    const g = F("VERTICAL"); cd.appendChild(g); g.layoutGrow = 1; cd.appendChild(T("Подробнее ›", "Inter", "Medium", 17, OCHRE7)); r2.appendChild(cd);
  }
}

// ================= B · EDITORIAL =================
const colB = await column("B · Редакционная роскошь", "Огромная антиква Cormorant, асимметричная сетка, тонкие линии вместо карточек, нумерация разделов, фото на всю ширину. Минимум элементов интерфейса — максимум типографики."); root.appendChild(colB);
{
  const hero = box("VERTICAL", 1440, 900, { name: "B1 · Hero", paddingLeft: 64, paddingRight: 64, paddingTop: 28 }); hero.fills = fill(WHITE); hero.clipsContent = true; colB.appendChild(hero);
  const nav = F("HORIZONTAL", { primaryAxisAlignItems: "SPACE_BETWEEN", counterAxisAlignItems: "CENTER", paddingBottom: 24 }); hero.appendChild(nav); nav.layoutSizingHorizontal = "FILL";
  nav.appendChild(T("PRAVOE DELO", "Cormorant Garamond", "SemiBold", 22, NAVY, { ls: 18 }));
  const r = F("HORIZONTAL", { itemSpacing: 40, counterAxisAlignItems: "CENTER" });
  for (const l of ["Практики", "Команда", "Кейсы", "Контакты"]) r.appendChild(T(l, "Manrope", "Medium", 14, NAVY));
  const langs = F("HORIZONTAL", { itemSpacing: 10 }); add(langs, T("RU", "Manrope", "SemiBold", 14, NAVY, { deco: "UNDERLINE" }), T("UZ", "Manrope", "Medium", 14, GRAY6), T("EN", "Manrope", "Medium", 14, GRAY6)); r.appendChild(langs);
  r.appendChild(T("Консультация →", "Manrope", "SemiBold", 14, OCHRE7)); nav.appendChild(r);
  const line = figma.createRectangle(); line.resize(1312, 1); line.fills = fill(NAVY, 0.15); hero.appendChild(line);
  const row = F("HORIZONTAL", { paddingTop: 56, counterAxisAlignItems: "MAX", primaryAxisAlignItems: "SPACE_BETWEEN" }); hero.appendChild(row); row.layoutSizingHorizontal = "FILL";
  row.appendChild(T("Право\nна вашей\nстороне.", "Cormorant Garamond", "Medium", 150, NAVY, { lh: 88, ls: -2 }));
  const side = F("VERTICAL", { itemSpacing: 28, paddingBottom: 24 });
  add(side, T("(01)", "Manrope", "Medium", 13, GRAY6), T("Pravoe Delo — адвокаты по бизнесу, гражданским, уголовным и семейным делам. Первая онлайн-консультация — бесплатно.", "Manrope", "Regular", 18, GRAY6, { w: 380, lh: 160 }));
  const ctas = F("HORIZONTAL", { itemSpacing: 24, counterAxisAlignItems: "CENTER" }); add(ctas, capsule("Получить консультацию", NAVY, WHITE, { r: 0, fam: "Manrope", style: "SemiBold", size: 15, after: "→", py: 18 }), T("Telegram ↗", "Manrope", "SemiBold", 15, NAVY, { deco: "UNDERLINE" })); side.appendChild(ctas);
  row.appendChild(side);
  const strip = F("VERTICAL", { paddingTop: 40 }); hero.appendChild(strip); const ph = figma.createRectangle(); ph.resize(1312, 320); ph.fills = img("library"); strip.appendChild(ph);

  const blk = F("VERTICAL", { name: "B2 · Practices", itemSpacing: 0, paddingTop: 112, paddingBottom: 112, paddingLeft: 64, paddingRight: 64 }); blk.resize(1440, 100); blk.counterAxisSizingMode = "FIXED"; blk.fills = fill(WHITE); colB.appendChild(blk);
  const hd = F("HORIZONTAL", { itemSpacing: 32, counterAxisAlignItems: "BASELINE", paddingBottom: 48 }); add(hd, T("(02)", "Manrope", "Medium", 13, GRAY6), T("Практики", "Cormorant Garamond", "Medium", 88, NAVY, { ls: -1 })); blk.appendChild(hd);
  for (const [n, t, d] of [["01", "Бизнес-право", "Компании, договоры, корпоративные споры"], ["02", "Гражданские дела", "Недвижимость, долги, защита прав потребителей"], ["03", "Уголовные дела", "Защита на следствии и в суде"], ["04", "Семейные споры", "Развод, алименты, раздел имущества"], ["05", "Налоги и проверки", "Споры с налоговой, сопровождение проверок"]]) {
    const rw = F("HORIZONTAL", { counterAxisAlignItems: "CENTER", paddingTop: 28, paddingBottom: 28 }); blk.appendChild(rw); rw.layoutSizingHorizontal = "FILL";
    rw.strokes = fill(NAVY, 0.15); rw.strokeTopWeight = 1; rw.strokeBottomWeight = 0; rw.strokeLeftWeight = 0; rw.strokeRightWeight = 0;
    const num = T(n, "Manrope", "Medium", 13, GRAY6, { w: 120 }); const tt = T(t, "Cormorant Garamond", "Medium", 48, NAVY, { w: 620 }); const dd = T(d, "Manrope", "Regular", 17, GRAY6, { w: 440 });
    add(rw, num, tt, dd); const g = F("HORIZONTAL"); rw.appendChild(g); g.layoutGrow = 1; rw.appendChild(T("↗", "Manrope", "Regular", 28, OCHRE));
  }
  const stats = F("HORIZONTAL", { itemSpacing: 0, paddingTop: 72 }); blk.appendChild(stats); stats.layoutSizingHorizontal = "FILL";
  for (const [v, c] of [["15+", "лет практики"], ["1 200+", "выигранных дел"], ["94%", "решений в пользу клиента"]]) {
    const s = F("VERTICAL", { itemSpacing: 8, paddingLeft: 24 }); s.strokes = fill(OCHRE); s.strokeLeftWeight = 1; s.strokeTopWeight = 0; s.strokeRightWeight = 0; s.strokeBottomWeight = 0;
    add(s, T(v, "Manrope", "ExtraLight", 88, NAVY, { ls: -3 }), T(c, "Manrope", "Regular", 15, GRAY6)); stats.appendChild(s); s.layoutGrow = 1;
  }
}

// ================= C · DARK TECH =================
const colC = await column("C · Тёмный tech-премиум", "Тёмно-синяя база, свечение охрой, «стеклянные» карточки с тонкой светлой границей, плавающая навигация-капсула, градиентный текст, бенто-сетки. В духе Linear и Vercel."); root.appendChild(colC);
{
  const hero = box("VERTICAL", 1440, 900, { name: "C1 · Hero", counterAxisAlignItems: "CENTER", paddingTop: 24, itemSpacing: 0 }); hero.fills = fill(NAVY); hero.clipsContent = true; colC.appendChild(hero);
  const glow = figma.createEllipse(); glow.resize(1000, 520); glow.fills = fill(OCHRE, 0.32); glow.effects = [{ type: "LAYER_BLUR", radius: 220, visible: true }]; abs(hero, glow, 220, -200);
  const grid = figma.createRectangle(); grid.resize(1440, 900); grid.fills = []; abs(hero, grid, 0, 0);
  const nav = box("HORIZONTAL", 1100, 60, { paddingLeft: 24, paddingRight: 10, counterAxisAlignItems: "CENTER", primaryAxisAlignItems: "SPACE_BETWEEN", name: "Nav · floating" }); nav.cornerRadius = 999; nav.fills = fill(WHITE, 0.05); stroke(nav, WHITE, 0.1); nav.effects = [{ type: "BACKGROUND_BLUR", radius: 24, visible: true }];
  const links = F("HORIZONTAL", { itemSpacing: 28 }); for (const l of ["Услуги", "Команда", "Кейсы", "Контакты"]) links.appendChild(T(l, "Inter", "Medium", 14, GRAY4));
  const right = F("HORIZONTAL", { itemSpacing: 12, counterAxisAlignItems: "CENTER" }); add(right, seg("dark"), capsule("Консультация", OCHRE, NAVY, { size: 14, py: 10, px: 18, style: "Semi Bold" }));
  add(nav, logo(hSet, "Inverse", 34), links, right); hero.appendChild(nav);
  const c = F("VERTICAL", { counterAxisAlignItems: "CENTER", itemSpacing: 28, paddingTop: 112 }); hero.appendChild(c);
  const chip = F("HORIZONTAL", { itemSpacing: 8, counterAxisAlignItems: "CENTER", paddingTop: 7, paddingBottom: 7, paddingLeft: 14, paddingRight: 14 }); chip.cornerRadius = 999; chip.fills = fill(WHITE, 0.04); stroke(chip, WHITE, 0.12);
  const dot = figma.createEllipse(); dot.resize(7, 7); dot.fills = fill(OCHRE); add(chip, dot, T("Бесплатная онлайн-консультация", "Inter", "Medium", 14, "#C9CED6")); c.appendChild(chip);
  const hl = T("Правовая защита\nнового уровня", "Inter", "Semi Bold", 84, WHITE, { ls: -3.5, lh: 104, align: "CENTER" });
  const start = hl.characters.indexOf("нового");
  hl.setRangeFills(start, hl.characters.length, [{ type: "GRADIENT_LINEAR", gradientTransform: [[1, 0, 0], [0, 1, 0]], gradientStops: [{ position: 0, color: { ...rgb(OCHRE), a: 1 } }, { position: 1, color: { ...rgb("#F3D8A8"), a: 1 } }] }]);
  c.appendChild(hl);
  c.appendChild(T("Адвокаты Pravoe Delo: бизнес, гражданские, уголовные и семейные дела.\nОтвет в течение 24 часов.", "Inter", "Regular", 20, GRAY4, { align: "CENTER", lh: 150 }));
  const btns = F("HORIZONTAL", { itemSpacing: 14, paddingTop: 8 }); add(btns, capsule("Получить консультацию", OCHRE, NAVY, { style: "Semi Bold" }), capsule("Telegram", WHITE, WHITE, { bgOp: 0.06, stroke: WHITE, strokeOp: 0.14, icon: "telegram" })); c.appendChild(btns);
  const st = F("HORIZONTAL", { itemSpacing: 16, paddingTop: 64 }); c.appendChild(st);
  for (const [v, l] of [["15+", "лет практики"], ["1 200+", "выигранных дел"], ["94%", "в пользу клиента"]]) {
    const g = box("VERTICAL", 300, 116, { itemSpacing: 4, paddingLeft: 24, paddingTop: 22 }); g.cornerRadius = 20; g.fills = fill(WHITE, 0.04); stroke(g, WHITE, 0.08);
    add(g, T(v, "Inter", "Semi Bold", 40, WHITE, { ls: -3 }), T(l, "Inter", "Regular", 15, GRAY4)); st.appendChild(g);
  }

  const blk = F("VERTICAL", { name: "C2 · Bento dark", itemSpacing: 48, paddingTop: 112, paddingBottom: 112, paddingLeft: 120, paddingRight: 120 }); blk.resize(1440, 100); blk.counterAxisSizingMode = "FIXED"; blk.fills = fill(NAVY); blk.clipsContent = true; colC.appendChild(blk);
  const g2 = figma.createEllipse(); g2.resize(700, 400); g2.fills = fill(OCHRE, 0.16); g2.effects = [{ type: "LAYER_BLUR", radius: 200, visible: true }]; abs(blk, g2, 800, 300);
  const h = F("VERTICAL", { itemSpacing: 12 }); add(h, T("Практики", "Inter", "Semi Bold", 56, WHITE, { ls: -3 }), T("Каждое дело ведёт партнёр фирмы — от первой встречи до решения суда.", "Inter", "Regular", 20, GRAY4)); blk.appendChild(h);
  const card = (w, hgt) => { const b = box("VERTICAL", w, hgt, { itemSpacing: 14, paddingTop: 36, paddingBottom: 36, paddingLeft: 36, paddingRight: 36 }); b.cornerRadius = 24; b.fills = fill(WHITE, 0.035); stroke(b, WHITE, 0.08); return b; };
  const ib = k => { const f = box("HORIZONTAL", 52, 52, { primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" }); f.cornerRadius = 14; f.fills = fill(OCHRE, 0.14); stroke(f, OCHRE, 0.3); f.appendChild(icon(k, 26, OCHRE)); return f; };
  const r1 = F("HORIZONTAL", { itemSpacing: 20 }); blk.appendChild(r1);
  const c1 = card(790, 380); add(c1, ib("briefcase"), T("Бизнес-право", "Inter", "Semi Bold", 32, WHITE, { ls: -2 }), T("Регистрация и ликвидация компаний, договоры, корпоративные и налоговые споры, сопровождение проверок.", "Inter", "Regular", 18, GRAY4, { w: 560, lh: 150 })); const gg = F("VERTICAL"); c1.appendChild(gg); gg.layoutGrow = 1; c1.appendChild(T("Подробнее →", "Inter", "Medium", 16, OCHRE));
  const c2 = card(390, 380); c2.primaryAxisAlignItems = "MAX";
  const big = T("94%", "Inter", "Semi Bold", 96, WHITE, { ls: -5 }); big.fills = [{ type: "GRADIENT_LINEAR", gradientTransform: [[1, 0, 0], [0, 1, 0]], gradientStops: [{ position: 0, color: { ...rgb("#F3D8A8"), a: 1 } }, { position: 1, color: { ...rgb(OCHRE), a: 1 } }] }];
  add(c2, big, T("дел решены в пользу клиента", "Inter", "Regular", 18, GRAY4)); add(r1, c1, c2);
  const r2 = F("HORIZONTAL", { itemSpacing: 20 }); blk.appendChild(r2);
  const ph = box("VERTICAL", 386, 340, {}); ph.cornerRadius = 24; ph.fills = [...img("docs"), ...fill(NAVY, 0.45)]; stroke(ph, WHITE, 0.08); r2.appendChild(ph);
  for (const [k, t, d] of [["house", "Семейные споры", "Развод, алименты, раздел имущества — конфиденциально."], ["shield", "Уголовные дела", "Защита на всех стадиях: от допроса до обжалования."]]) {
    const cd = card(387, 340); add(cd, ib(k), T(t, "Inter", "Semi Bold", 26, WHITE, { ls: -2 }), T(d, "Inter", "Regular", 17, GRAY4, { w: 315, lh: 150 })); r2.appendChild(cd);
  }
}
return { root: root.id, cols: [colA.id, colB.id, colC.id] };
