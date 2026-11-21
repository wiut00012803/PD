//@prelude2
const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
const bb = await figma.getNodeByIdAsync("31:71");
const idxOf = name => bb.children.findIndex(c => c.name.startsWith(name));
const K = id => figma.getNodeByIdAsync(id);
const [hSet, vSet, markSet, btnSet, msgSet, langSet, tgSet, chipSet, ibSet, headerSet, svcSet, statSet, caseSet, reviewSet, lawyerSet, faqSet] = await Promise.all(["20:104","20:157","20:47","35:1724","35:1757","35:1802","35:1821","35:1830","35:1843","35:1932","35:1968","35:1975","35:1994","35:2021","35:2046","35:2081"].map(K));
const v = (set, name) => set.children.find(c => c.name === name);
const kLabel = Object.keys(btnSet.componentPropertyDefinitions).find(k => k.startsWith("Label"));
const kShow = Object.keys(btnSet.componentPropertyDefinitions).find(k => k.startsWith("Show icon"));
function F(dir, o = {}) { const f = figma.createFrame(); f.layoutMode = dir; f.primaryAxisSizingMode = "AUTO"; f.counterAxisSizingMode = "AUTO"; f.fills = []; for (const k in o) f[k] = o[k]; return f; }
function sheet(name, th = "Light", at) {
  const s = figma.createFrame(); s.name = name; s.layoutMode = "VERTICAL"; s.resize(1440, 100); s.primaryAxisSizingMode = "AUTO"; s.counterAxisSizingMode = "FIXED";
  s.paddingTop = s.paddingBottom = 96; s.paddingLeft = s.paddingRight = 120; s.itemSpacing = 56; s.fills = [paint("color/bg/page", th)]; s.clipsContent = true;
  bb.insertChild(at, s); return s;
}
async function header(s, num, title, lead, th = "Light") {
  const h = F("VERTICAL", { name: "Header", itemSpacing: 16 }); s.appendChild(h);
  h.appendChild(await txt(`${num} — ${title}`, "Overline", "color/text/accent", th));
  h.appendChild(await txt(title, "Heading/H1", "color/text/primary", th));
  if (lead) { const t = await txt(lead, "Body/L", "color/text/secondary", th); h.appendChild(t); t.resize(840, t.height); t.textAutoResize = "HEIGHT"; }
}
function glow(parent, w, h, x, y, name = "Glow", op = 0.3, th = "Light") { const e = figma.createEllipse(); e.name = name; e.resize(w, h); e.fills = [{ ...paint("color/glow/primary", th), opacity: op }]; e.effects = [{ type: "LAYER_BLUR", radius: 200, visible: true }]; parent.appendChild(e); e.layoutPositioning = "ABSOLUTE"; e.x = x; e.y = y; return e; }
const removed = [];
function drop(prefix) { const i = idxOf(prefix); if (i >= 0) { removed.push(bb.children[i].name); bb.children[i].remove(); } return i; }

// ===== 00 COVER (dark, style C)
{
  const at = drop("00 ·");
  const s = sheet("00 · Cover", "Dark", at); s.primaryAxisSizingMode = "FIXED"; s.resize(1440, 810); s.primaryAxisAlignItems = "SPACE_BETWEEN";
  glow(s, 1000, 520, 380, -220, "Glow", 0.35, "Dark");
  s.appendChild(v(hSet, "Color=Inverse").createInstance());
  const mid = F("VERTICAL", { name: "Title", itemSpacing: 24 }); s.appendChild(mid);
  mid.appendChild(v(chipSet, "Theme=Dark").createInstance());
  const t = await txt("Фирменный стиль\nPravoe Delo", "Display", "color/text/primary", "Dark"); t.setRangeFills(t.characters.indexOf("Pravoe"), t.characters.length, gradPaint("Dark")); mid.appendChild(t);
  const l = await txt("Логотип, цвета светлой и тёмной темы, типографика, фотографии и интерфейс в стиле «тёмный tech-премиум».", "Body/L", "color/text/secondary", "Dark"); mid.appendChild(l); l.resize(640, l.height); l.textAutoResize = "HEIGHT";
  s.appendChild(await txt("Брендбук · версия 2.0 · 2026", "Body/S", "color/text/tertiary", "Dark"));
  const deco = v(markSet, "Color=Mono Light").createInstance(); s.appendChild(deco); deco.layoutPositioning = "ABSOLUTE"; deco.rescale(520 / deco.height); deco.opacity = 0.06; deco.x = 1440 - deco.width - 60; deco.y = 150;
}

// ===== 04 COLORS
{
  const at = drop("04 ·");
  const s = sheet("04 · Цвета", "Light", at);
  await header(s, "04", "Цвета и темы", "Бренд держится на трёх цветах — тёмно-синий, белый, охра. Сайт работает в двух темах: тема по умолчанию берётся из настроек браузера, посетитель может переключить её вручную. Токены в обеих темах называются одинаково (одни CSS-переменные), меняются только значения.");
  const core = F("HORIZONTAL", { name: "Core", itemSpacing: 24 }); s.appendChild(core);
  for (const [hex, name, role, dark] of [["#0E1A2B", "Тёмно-синий", "Фон тёмной темы, текст и логотип в светлой", true], ["#FFFFFF", "Белый", "Текст в тёмной теме, стекло в светлой", false], ["#C08A3E", "Охра", "Акцент: CTA, свечение, иконки, градиенты", false]]) {
    const c = F("VERTICAL", { itemSpacing: 12 });
    const sw = F("VERTICAL", { itemSpacing: 4, paddingTop: 28, paddingBottom: 28, paddingLeft: 28, paddingRight: 28, primaryAxisAlignItems: "MAX" }); sw.resize(384, 220); sw.primaryAxisSizingMode = "FIXED"; sw.counterAxisSizingMode = "FIXED"; sw.fills = solid(hex); rad(sw, "radius/xl");
    if (hex === "#FFFFFF") { sw.strokes = [paint("color/border/glass-strong", "Light")]; sw.strokeWeight = 1; }
    const fg = dark ? "Dark" : "Light";
    sw.appendChild(await txt(name, "Heading/H4", hex === "#C08A3E" ? "color/text/on-accent" : "color/text/primary", fg));
    sw.appendChild(await txt(hex, "Body/S", hex === "#C08A3E" ? "color/text/on-accent" : "color/text/secondary", fg));
    c.appendChild(sw); const r = await txt(role, "Body/S", "color/text/secondary", "Light"); c.appendChild(r); r.resize(384, r.height); r.textAutoResize = "HEIGHT"; core.appendChild(c);
  }
  // gradient + glow strip
  const gr = F("HORIZONTAL", { name: "Gradient & glow", itemSpacing: 24 }); s.appendChild(gr);
  for (const th of ["Light", "Dark"]) {
    const g = F("VERTICAL", { itemSpacing: 8, paddingTop: 28, paddingBottom: 28, paddingLeft: 28, paddingRight: 28 }); g.resize(588, 160); g.primaryAxisSizingMode = "FIXED"; g.counterAxisSizingMode = "FIXED"; g.fills = [paint("color/bg/page", th)]; g.clipsContent = true; rad(g, "radius/xl");
    glow(g, 360, 220, 300, -40, "Glow", th === "Light" ? 0.32 : 0.38, th);
    const t = await txt("Градиент охры", "Heading/H2", "color/text/primary", th); t.fills = gradPaint(th); g.appendChild(t);
    g.appendChild(await txt(th === "Light" ? "Светлая тема: ochre/700 → ochre/500 · свечение охрой 30%" : "Тёмная тема: ochre/500 → ochre/300 · свечение охрой 35%", "Body/S", "color/text/secondary", th));
    gr.appendChild(g);
  }
  // semantic tokens per theme
  const sem = F("HORIZONTAL", { name: "Semantic tokens", itemSpacing: 24 }); s.appendChild(sem);
  const rows = [["color/bg/page", "Фон страницы"], ["color/surface/glass", "Стекло: карточки"], ["color/surface/glass-strong", "Стекло: шапка, кнопки"], ["color/border/glass", "Граница стекла"], ["color/text/primary", "Основной текст"], ["color/text/secondary", "Вторичный текст"], ["color/text/accent", "Текст-акцент"], ["color/bg/accent", "CTA / акцент"], ["color/bg/accent-subtle", "Фон иконок"]];
  for (const th of ["Light", "Dark"]) {
    const p = F("VERTICAL", { name: `Panel ${th}`, itemSpacing: 0, paddingTop: 28, paddingBottom: 20, paddingLeft: 28, paddingRight: 28 }); p.resize(588, 10); p.counterAxisSizingMode = "FIXED"; p.primaryAxisSizingMode = "AUTO"; p.fills = [paint("color/bg/page", th)]; rad(p, "radius/xl");
    p.strokes = [paint("color/border/glass", th)]; p.strokeWeight = 1;
    p.appendChild(await txt(th === "Light" ? "Светлая тема · Color · Light" : "Тёмная тема · Color · Dark", "Heading/H4", "color/text/primary", th));
    const sp = F("VERTICAL"); sp.resize(1, 16); p.appendChild(sp);
    for (const [tok, label] of rows) {
      const r = F("HORIZONTAL", { itemSpacing: 16, counterAxisAlignItems: "CENTER", paddingTop: 10, paddingBottom: 10 }); p.appendChild(r); r.layoutSizingHorizontal = "FILL";
      r.strokes = [paint("color/border/glass", th)]; r.strokeTopWeight = 1; r.strokeBottomWeight = 0; r.strokeLeftWeight = 0; r.strokeRightWeight = 0;
      const sw = figma.createRectangle(); sw.resize(40, 40); rad(sw, "radius/md"); sw.fills = [paint(tok, th)]; sw.strokes = [paint("color/border/glass-strong", th)]; sw.strokeWeight = 1; r.appendChild(sw);
      const col = F("VERTICAL", { itemSpacing: 2 }); r.appendChild(col); col.appendChild(await txt(label, "Label", "color/text/primary", th)); col.appendChild(await txt(tok, "Body/S", "color/text/tertiary", th));
    }
    sem.appendChild(p);
  }
  // contrast
  const lum = h => { const c = hexRGB(h); const f = x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  s.appendChild(await txt("Контрастность (WCAG 2.1)", "Heading/H3", "color/text/primary", "Light"));
  const tbl = F("VERTICAL", { name: "Contrast" }); s.appendChild(tbl); tbl.layoutSizingHorizontal = "FILL";
  for (const [fg, bg, label] of [["#0E1A2B", "#F6F7F9", "Светлая: основной текст на фоне"], ["#5E6673", "#F6F7F9", "Светлая: вторичный текст"], ["#8A5F26", "#F6F7F9", "Светлая: текст-акцент (ochre/700)"], ["#FFFFFF", "#0E1A2B", "Тёмная: основной текст"], ["#9AA3AF", "#0E1A2B", "Тёмная: вторичный текст"], ["#D29E55", "#0E1A2B", "Тёмная: текст-акцент (ochre/400)"], ["#0E1A2B", "#C08A3E", "Обе темы: текст на кнопке CTA"]]) {
    const r = ratio(fg, bg);
    const row = F("HORIZONTAL", { itemSpacing: 24, counterAxisAlignItems: "CENTER", paddingTop: 12, paddingBottom: 12 }); tbl.appendChild(row); row.layoutSizingHorizontal = "FILL";
    row.strokes = [paint("color/border/default", "Light")]; row.strokeBottomWeight = 1; row.strokeTopWeight = 0; row.strokeLeftWeight = 0; row.strokeRightWeight = 0;
    const chip = F("HORIZONTAL", { paddingTop: 6, paddingBottom: 6, paddingLeft: 12, paddingRight: 12 }); chip.fills = solid(bg); rad(chip, "radius/sm"); chip.strokes = [paint("color/border/default", "Light")]; chip.strokeWeight = 1;
    const ct = figma.createText(); await ct.setTextStyleIdAsync(TS["Label"]); ct.characters = "Аа Право"; ct.fills = solid(fg); chip.appendChild(ct); row.appendChild(chip);
    const lt = await txt(label, "Body/M", "color/text/primary", "Light"); row.appendChild(lt); lt.layoutGrow = 1;
    row.appendChild(await txt(`${r.toFixed(1)} : 1`, "Label", "color/text/primary", "Light"));
    const ps = await txt(r >= 4.5 ? "AA — подходит" : "Только крупный текст", "Body/S", r >= 4.5 ? "color/text/accent" : "color/text/secondary", "Light"); row.appendChild(ps); ps.resize(180, ps.height); ps.textAutoResize = "HEIGHT";
  }
}

// ===== 05 TYPOGRAPHY
{
  const at = drop("05 ·");
  const s = sheet("05 · Типографика", "Light", at);
  await header(s, "05", "Типографика", "Весь текст сайта набран Inter — современный гротеск с отличной кириллицей и латиницей (включая узбекские oʻ и gʻ), бесплатный (OFL). Заголовки — Semi Bold с плотным трекингом, как у Apple. Антиква Cormorant Garamond осталась только в логотипе.");
  const card = F("HORIZONTAL", { name: "Inter", itemSpacing: 48, paddingTop: 48, paddingBottom: 48, paddingLeft: 48, paddingRight: 48, counterAxisAlignItems: "CENTER" }); s.appendChild(card); card.layoutSizingHorizontal = "FILL"; card.fills = [paint("color/bg/page", "Dark")]; rad(card, "radius/2xl"); card.clipsContent = true;
  glow(card, 600, 400, 0, -200, "Glow", 0.35, "Dark");
  const big = figma.createText(); big.fontName = { family: "Inter", style: "Semi Bold" }; big.characters = "Аа"; big.fontSize = 200; big.letterSpacing = { unit: "PERCENT", value: -5 }; big.fills = gradPaint("Dark"); card.appendChild(big);
  const info = F("VERTICAL", { itemSpacing: 12 }); card.appendChild(info);
  info.appendChild(await txt("Inter", "Heading/H2", "color/text/primary", "Dark"));
  info.appendChild(await txt("Regular 400 · Medium 500 · Semi Bold 600", "Body/M", "color/text/secondary", "Dark"));
  const gl = figma.createText(); gl.fontName = { family: "Inter", style: "Regular" }; gl.characters = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ\nабвгдеёжзийклмнопрстуфхцчшщъыьэюя\nABCDEFGHIJKLMNOPQRSTUVWXYZ · oʻ gʻ Oʻ Gʻ\n0123456789 $ % № « » — → ?!"; gl.fontSize = 15; gl.lineHeight = { unit: "PERCENT", value: 165 }; gl.fills = [paint("color/text/secondary", "Dark")]; info.appendChild(gl);
  s.appendChild(await txt("Шкала стилей", "Heading/H3", "color/text/primary", "Light"));
  const scale = F("VERTICAL", { name: "Type scale" }); s.appendChild(scale); scale.layoutSizingHorizontal = "FILL";
  const order = ["Display", "Heading/H1", "Heading/H2", "Heading/H3", "Heading/H4", "Body/L", "Body/M", "Body/S", "Label", "Button", "Overline", "Stat"];
  const mobile = { "Display": 44, "Heading/H1": 36, "Heading/H2": 30, "Heading/H3": 24, "Stat": 44 };
  const styles = await figma.getLocalTextStylesAsync();
  for (const name of order) {
    const st = styles.find(x => x.name === name);
    const row = F("HORIZONTAL", { itemSpacing: 32, counterAxisAlignItems: "CENTER", paddingTop: 18, paddingBottom: 18 }); scale.appendChild(row); row.layoutSizingHorizontal = "FILL";
    row.strokes = [paint("color/border/default", "Light")]; row.strokeBottomWeight = 1; row.strokeTopWeight = 0; row.strokeLeftWeight = 0; row.strokeRightWeight = 0;
    const meta = F("VERTICAL", { itemSpacing: 4 }); meta.resize(260, 10); meta.counterAxisSizingMode = "FIXED"; meta.primaryAxisSizingMode = "AUTO"; row.appendChild(meta);
    meta.appendChild(await txt(name, "Label", "color/text/primary", "Light"));
    const lh = Math.round(st.fontSize * st.lineHeight.value / 100);
    const m = await txt(`Inter ${st.fontName.style} · ${st.fontSize}/${lh} · ${st.letterSpacing.value}%${mobile[name] ? ` · моб. ${mobile[name]}` : ""}`, "Body/S", "color/text/secondary", "Light"); meta.appendChild(m); m.resize(260, m.height); m.textAutoResize = "HEIGHT";
    const smp = figma.createText(); await smp.setTextStyleIdAsync(st.id);
    smp.characters = name === "Stat" ? "1 200+" : name === "Overline" ? "Бесплатная консультация" : name === "Button" ? "Получить консультацию" : (st.fontSize >= 32 ? "Правовая защита" : "Защищаем интересы клиентов в суде и в переговорах");
    smp.fills = [paint("color/text/primary", "Light")]; if (name === "Stat" || name === "Display") smp.fills = gradPaint("Light"); row.appendChild(smp); smp.layoutGrow = 1; smp.textAutoResize = "HEIGHT";
  }
  s.appendChild(await txt("Три языка сайта", "Heading/H3", "color/text/primary", "Light"));
  const langs = F("HORIZONTAL", { name: "Languages", itemSpacing: 24 }); s.appendChild(langs);
  for (const [code, h, p] of [["RU", "Правовая защита нового уровня", "Получите бесплатную онлайн-консультацию адвоката."], ["UZ", "Yangi darajadagi huquqiy himoya", "Advokatdan bepul onlayn maslahat oling. Oʻz vaqtida, gʻoyat aniq."], ["EN", "Legal protection, elevated", "Get a free online consultation with a lawyer."]]) {
    const c = F("VERTICAL", { itemSpacing: 12, paddingTop: 32, paddingBottom: 32, paddingLeft: 32, paddingRight: 32 }); c.resize(384, 10); c.counterAxisSizingMode = "FIXED"; c.primaryAxisSizingMode = "AUTO"; rad(c, "radius/xl"); glass(c, "Light");
    c.appendChild(await txt(code, "Overline", "color/text/accent", "Light")); wrapFill(c, await txt(h, "Heading/H3", "color/text/primary", "Light")); wrapFill(c, await txt(p, "Body/M", "color/text/secondary", "Light")); langs.appendChild(c);
  }
}

// ===== 07 UI (both themes)
{
  const at = drop("07 ·");
  const s = sheet("07 · UI-элементы", "Light", at);
  await header(s, "07", "Элементы интерфейса", "Компоненты UI Kit v2 в обеих темах. Главное действие — «Получить консультацию» (Primary, ведёт на Google Form); рядом всегда быстрые контакты Telegram и WhatsApp. Стекло, тонкие границы и мягкое свечение охрой вместо рамок и теней 2010-х.");
  for (const th of ["Light", "Dark"]) {
    const p = F("VERTICAL", { name: `Panel ${th}`, itemSpacing: 32, paddingTop: 40, paddingBottom: 40, paddingLeft: 40, paddingRight: 40 }); s.appendChild(p); p.layoutSizingHorizontal = "FILL"; p.fills = [paint("color/bg/page", th)]; rad(p, "radius/2xl"); p.clipsContent = true;
    if (th === "Light") { p.strokes = [paint("color/border/glass", th)]; p.strokeWeight = 1; }
    glow(p, 800, 420, 200, -220, "Glow", th === "Light" ? 0.28 : 0.35, th);
    p.appendChild(await txt(th === "Light" ? "Светлая тема" : "Тёмная тема", "Overline", "color/text/accent", th));
    p.appendChild(v(headerSet, `Theme=${th}`).createInstance());
    const r1 = F("HORIZONTAL", { itemSpacing: 12, counterAxisAlignItems: "CENTER" }); p.appendChild(r1);
    const b1 = v(btnSet, `Style=Primary, Size=M, State=Default, Theme=${th}`).createInstance(); b1.setProperties({ [kShow]: true }); r1.appendChild(b1);
    r1.appendChild(v(btnSet, `Style=Secondary, Size=M, State=Default, Theme=${th}`).createInstance());
    r1.appendChild(v(msgSet, `Platform=Telegram, Theme=${th}`).createInstance());
    r1.appendChild(v(msgSet, `Platform=WhatsApp, Theme=${th}`).createInstance());
    r1.appendChild(v(chipSet, `Theme=${th}`).createInstance());
    const r2 = F("HORIZONTAL", { itemSpacing: 20 }); p.appendChild(r2);
    r2.appendChild(v(svcSet, `Theme=${th}`).createInstance());
    const stCol = F("VERTICAL", { itemSpacing: 16 }); r2.appendChild(stCol);
    const kV = Object.keys(statSet.componentPropertyDefinitions).find(k => k.startsWith("Value")), kC = Object.keys(statSet.componentPropertyDefinitions).find(k => k.startsWith("Caption"));
    for (const [val, cap] of [["15+", "лет практики"], ["1 200+", "выигранных дел"], ["94%", "в пользу клиента"]]) { const i = v(statSet, `Theme=${th}`).createInstance(); i.setProperties({ [kV]: val, [kC]: cap }); stCol.appendChild(i); }
    r2.appendChild(v(reviewSet, `Theme=${th}`).createInstance());
    const r3 = F("HORIZONTAL", { itemSpacing: 20 }); p.appendChild(r3);
    r3.appendChild(v(caseSet, `Theme=${th}`).createInstance());
    const fq = F("VERTICAL", { itemSpacing: 12 }); r3.appendChild(fq);
    const kQ = Object.keys(faqSet.componentPropertyDefinitions).find(k => k.startsWith("Question"));
    const f1 = v(faqSet, `Open=True, Theme=${th}`).createInstance(); f1.resize(560, f1.height); fq.appendChild(f1);
    const f2 = v(faqSet, `Open=False, Theme=${th}`).createInstance(); f2.resize(560, f2.height); f2.setProperties({ [kQ]: "Есть ли гарантия результата?" }); fq.appendChild(f2);
    const f3 = v(faqSet, `Open=False, Theme=${th}`).createInstance(); f3.resize(560, f3.height); f3.setProperties({ [kQ]: "Как быстро вы ответите на заявку?" }); fq.appendChild(f3);
  }
}
const shots = [];
for (const n of ["00 ·", "04 ·", "05 ·", "07 ·"]) shots.push(await screenshot(bb.children[idxOf(n)], { maxDimension: 1500 }));
return { removed, order: bb.children.map(c => c.name), shots };
