// Responsive page builder: builds Home + Consultation for one layout (LAYOUT) and theme (TH).
const LAYOUTS = {
  1440: { W: 1440, px: 120, py: 112, header: "Default", display: 84, h1: 56, statsCols: 4, about2: true, photo: [560, 520], advCols: 3, svcCols: 3, casesCols: 2, teamCols: 3, revCols: 3, logoCols: 5, consultStack: false, faqStack: false, contactsStack: false, touch: false, footerStack: false, label: "Desktop 1440" },
  960: { W: 960, px: 48, py: 96, header: "Compact", display: 64, h1: 44, statsCols: 4, about2: true, photo: [380, 480], advCols: 3, svcCols: 2, casesCols: 2, teamCols: 3, revCols: 3, logoCols: 5, consultStack: true, faqStack: true, contactsStack: false, touch: false, footerStack: false, label: "Desktop 960" },
  820: { W: 820, px: 40, py: 80, header: "Tablet", display: 56, h1: 40, statsCols: 2, about2: false, photo: [740, 400], advCols: 1, svcCols: 2, casesCols: 1, teamCols: 2, revCols: 2, logoCols: 3, consultStack: true, faqStack: true, contactsStack: true, touch: true, footerStack: true, label: "Tablet 820" },
  390: { W: 390, px: 20, py: 64, header: "Mobile", display: 40, h1: 32, statsCols: 2, about2: false, photo: [350, 280], advCols: 1, svcCols: 1, casesCols: 1, teamCols: 1, revCols: 1, logoCols: 2, consultStack: true, faqStack: true, contactsStack: true, touch: true, footerStack: true, label: "Mobile 390" },
};
const LY = LAYOUTS[PAGE_W];
const CW = LY.W - LY.px * 2;
const THN = TH;
const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
async function newPage(name, x, y) {
  for (const n of pg.findAll(x => x.type === "FRAME" && x.name === name && (x.parent === pg || x.parent.type === "SECTION"))) n.remove();
  const f = Fr("VERTICAL", { name, itemSpacing: 0, counterAxisAlignItems: "CENTER" }); f.resize(LY.W, 100); f.counterAxisSizingMode = "FIXED"; f.primaryAxisSizingMode = "AUTO"; f.clipsContent = true; f.fills = [paint("color/bg/page", TH)];
  pg.appendChild(f); f.x = x; f.y = y; return f;
}
function sec(page, name, o = {}) { const s = Fr("VERTICAL", { name: `Section · ${name}`, itemSpacing: o.gap ?? (LY.W < 600 ? 32 : 48), paddingTop: o.pt ?? LY.py, paddingBottom: o.pb ?? LY.py, paddingLeft: LY.px, paddingRight: LY.px }); page.appendChild(s); s.layoutSizingHorizontal = "FILL"; s.clipsContent = false; return s; }
async function H(s, style) { const t = await T(s, style); if (style === "Display") t.fontSize = LY.display; if (style === "Heading/H1") t.fontSize = LY.h1; return t; }
async function title(s, over, ttl, sub) { const h = Fr("VERTICAL", { name: "Title", itemSpacing: 14 }); s.appendChild(h); h.layoutSizingHorizontal = "FILL"; h.appendChild(await T(over, "Overline", "color/text/accent")); const t = await H(ttl, "Heading/H1"); h.appendChild(t); t.layoutSizingHorizontal = "FILL"; t.textAutoResize = "HEIGHT"; if (sub) { const st = await T(sub, "Body/L", "color/text/secondary"); h.appendChild(st); st.layoutSizingHorizontal = "FILL"; st.textAutoResize = "HEIGHT"; if (LY.W >= 960) { st.layoutSizingHorizontal = "FIXED"; st.resize(Math.min(720, CW), st.height); } } return h; }
function grid(parent, cols, items, gap = 20, name = "Grid") {
  const g = Fr("VERTICAL", { name, itemSpacing: gap }); parent.appendChild(g); g.layoutSizingHorizontal = "FILL";
  for (let i = 0; i < items.length; i += cols) { const r = Fr("HORIZONTAL", { itemSpacing: gap }); g.appendChild(r); r.layoutSizingHorizontal = "FILL"; for (const it of items.slice(i, i + cols)) { r.appendChild(it); it.layoutGrow = 1; it.layoutAlign = "STRETCH"; } for (let k = items.slice(i, i + cols).length; k < cols; k++) { const sp = Fr("VERTICAL"); r.appendChild(sp); sp.layoutGrow = 1; } }
  return g;
}
function carousel(parent, items, cardW, name) {
  const row = Fr("HORIZONTAL", { name: name + " · carousel", itemSpacing: 12 }); parent.appendChild(row);
  for (const it of items) { row.appendChild(it); it.resize(cardW, it.height); it.layoutAlign = "STRETCH"; }
  const dots = Fr("HORIZONTAL", { name: "Dots", itemSpacing: 6, counterAxisAlignItems: "CENTER" }); parent.appendChild(dots);
  items.forEach((_, i) => { const d = figma.createRectangle(); d.resize(i === 0 ? 20 : 6, 6); d.cornerRadius = 3; d.fills = [{ ...paint(i === 0 ? "color/bg/accent" : "color/text/tertiary", TH), opacity: i === 0 ? 1 : 0.5 }]; dots.appendChild(d); });
  return row;
}
const btnSize = LY.touch ? "M" : "M";
function primary(label, icon = true) { const b = inst(C.btn, { Style: "Primary", Size: btnSize, State: "Default" }, { Label: label }); if (icon) b.setProperties({ [pkey(C.btn, "Show icon")]: true }); return b; }
function wrapRow(parent, gap = 12) { const r = Fr("HORIZONTAL", { itemSpacing: gap, counterAxisSpacing: gap }); parent.appendChild(r); r.layoutWrap = "WRAP"; r.layoutSizingHorizontal = "FILL"; return r; }
function header() { return variant(C.header, { Size: LY.header, Theme: TH }).createInstance(); }
function glowHero(parent) { const w = Math.min(1000, LY.W * 0.9), h = w * 0.5; return glowAt(parent, w, h, (LY.W - w) / 2, -h * 0.8, TH === "Dark" ? 0.22 : 0.24, "color/glow/primary", "Glow · follows cursor"); }
function fab(page) { const f = glassBox("HORIZONTAL", { name: "Floating messenger", itemSpacing: 6, paddingTop: 6, paddingBottom: 6, paddingLeft: 6, paddingRight: 6, r: "radius/full" }, true); for (const k of ["social/telegram", "social/whatsapp"]) { const c = Fr("HORIZONTAL", { primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" }); c.resize(48, 48); c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "FIXED"; rad(c, "radius/full"); c.fills = [paint("color/bg/accent", TH)]; c.appendChild(ico(k, 22, "color/text/on-accent")); f.appendChild(c); } page.appendChild(f); f.layoutPositioning = "ABSOLUTE"; const vh = LY.W >= 960 ? 900 : LY.W >= 600 ? 1100 : 844; f.x = LY.W - f.width - (LY.W < 600 ? 16 : 32); f.y = vh - f.height - (LY.W < 600 ? 16 : 32); return f; }
async function footer(page) {
  const tch = LY.touch;
  const ft = Fr("VERTICAL", { name: "Footer", itemSpacing: tch ? 40 : 32, paddingTop: tch ? 64 : 56, paddingBottom: tch ? 40 : 32, paddingLeft: LY.px, paddingRight: LY.px }); page.appendChild(ft); ft.layoutSizingHorizontal = "FILL";
  ft.strokes = [paint("color/border/glass", TH)]; ft.strokeTopWeight = 1; ft.strokeBottomWeight = 0; ft.strokeLeftWeight = 0; ft.strokeRightWeight = 0;
  const top = Fr(LY.footerStack ? "VERTICAL" : "HORIZONTAL", { itemSpacing: LY.footerStack ? 40 : 40, primaryAxisAlignItems: LY.footerStack ? "MIN" : "SPACE_BETWEEN" }); ft.appendChild(top); top.layoutSizingHorizontal = "FILL";
  const brand = Fr("VERTICAL", { itemSpacing: tch ? 20 : 16 }); top.appendChild(brand);
  const lg = variant(C.logoH, { Color: TH === "Dark" ? "Inverse" : "Primary" }).createInstance(); if (tch) lg.rescale(48 / lg.height); brand.appendChild(lg);
  brand.appendChild(await T("Адвокатская фирма. Защищаем бизнес и людей с 2010 года.", tch ? "Body/M" : "Body/S", "color/text/secondary", tch ? Math.min(420, CW) : 280));
  const soc = Fr("HORIZONTAL", { itemSpacing: tch ? 12 : 10 }); brand.appendChild(soc);
  const sz = tch ? 48 : 44;
  for (const k of ["social/telegram", "social/instagram", "social/facebook", "social/youtube", "social/whatsapp"]) { const s0 = glassBox("HORIZONTAL", { primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", r: "radius/full" }, true); s0.resize(sz, sz); s0.primaryAxisSizingMode = "FIXED"; s0.counterAxisSizingMode = "FIXED"; s0.appendChild(ico(k, tch ? 22 : 20)); soc.appendChild(s0); }
  const cols = Fr("HORIZONTAL", { itemSpacing: tch ? (LY.W < 600 ? 24 : 48) : 40, counterAxisSpacing: 32 }); top.appendChild(cols); if (LY.footerStack) { cols.layoutWrap = "WRAP"; cols.layoutSizingHorizontal = "FILL"; }
  for (const [h, items] of [["Разделы", ["Услуги", "О нас", "Кейсы", "Команда", "FAQ"]], ["Клиентам", ["Бесплатная консультация", "Отзывы", "Контакты", "Политика конфиденциальности"]], ["Связь", ["+998 00 000-00-00", "info@pravoedelo.uz", "Telegram · WhatsApp"]]]) {
    const c = Fr("VERTICAL", { itemSpacing: tch ? 0 : 12 }); cols.appendChild(c);
    const hh = await T(h, tch ? "Overline" : "Label", tch ? "color/text/tertiary" : "color/text/primary"); c.appendChild(hh);
    if (tch) { const sp = Fr("VERTICAL"); sp.resize(1, 8); c.appendChild(sp); }
    for (const it of items) { if (tch) { const row = Fr("HORIZONTAL", { name: "Link", paddingTop: 10, paddingBottom: 10, counterAxisAlignItems: "CENTER" }); row.minHeight = 44; row.appendChild(await T(it, "Body/M")); c.appendChild(row); } else c.appendChild(await T(it, "Body/S", "color/text/secondary")); }
  }
  const fb = Fr(LY.footerStack ? "VERTICAL" : "HORIZONTAL", { primaryAxisAlignItems: "SPACE_BETWEEN", itemSpacing: 8 }); ft.appendChild(fb); fb.layoutSizingHorizontal = "FILL";
  fb.appendChild(await T("© 2026 Pravoe Delo. Все права защищены.", "Body/S", "color/text/tertiary")); fb.appendChild(await T("RU · UZ · EN", "Body/S", "color/text/tertiary"));
}
async function finish(page) { await applyGlassStyles(page); const c0 = hexRGB(ACCENT_HEX[TH]); for (const box of page.findAll(x => x.type === "INSTANCE" && x.name === "Icon Box")) { const icon = box.children.find(k => k.type === "INSTANCE"); if (icon) for (const v of icon.findAll(() => true)) { if (["FRAME", "INSTANCE", "GROUP"].includes(v.type)) continue; if (v.strokes && v.strokes.length) v.strokes = [{ type: "SOLID", color: c0 }]; if (Array.isArray(v.fills) && v.fills.length) v.fills = [{ type: "SOLID", color: c0 }]; } } }
function photoCard(w, h, b64, plateTitle, plateSub) {
  const ph = Fr("VERTICAL", { name: "Photo card", paddingLeft: 16, paddingBottom: 16, primaryAxisAlignItems: "MAX" }); ph.resize(w, h); ph.primaryAxisSizingMode = "FIXED"; ph.counterAxisSizingMode = "FIXED"; rad(ph, "radius/2xl"); ph.clipsContent = true;
  const fills = [imgFill(b64)]; if (TH === "Dark") fills.push({ type: "GRADIENT_LINEAR", gradientTransform: [[0, 1, 0], [-1, 0, 1]], gradientStops: [{ position: 0.5, color: { ...hexRGB("#0E1A2B"), a: 0 } }, { position: 1, color: { ...hexRGB("#0E1A2B"), a: 0.85 } }] });
  ph.fills = fills; ph.strokes = [paint("color/border/glass-strong", TH)]; ph.strokeWeight = 1; ph.strokeAlign = "INSIDE";
  return { ph, plate: async () => { const p = glassBox("VERTICAL", { name: "Glass plate", itemSpacing: 2, paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 16, r: "radius/lg" }, true); p.appendChild(await T(plateTitle, "Label")); p.appendChild(await T(plateSub, "Body/S", "color/text/secondary")); ph.appendChild(p); } };
}

// ======================= HOME =======================
const anchor = await figma.getNodeByIdAsync("41:4889");
const baseX = anchor.x + anchor.width + 400 + ({ 960: 0, 820: 2400, 390: 4600 }[LY.W] || 0);
const baseY = TH === "Dark" ? 0 : 10200;
const home = await newPage(`${LY.label} · ${THN} · Home`, baseX, baseY);
{
  const hero = Fr("VERTICAL", { name: "Section · Hero", counterAxisAlignItems: "CENTER", paddingTop: LY.W < 600 ? 16 : 24, paddingBottom: LY.py, paddingLeft: LY.W < 600 ? 20 : 24, paddingRight: LY.W < 600 ? 20 : 24 }); home.appendChild(hero); hero.layoutSizingHorizontal = "FILL"; hero.clipsContent = false;
  glowHero(hero); hero.appendChild(header());
  const hc = Fr("VERTICAL", { counterAxisAlignItems: "CENTER", itemSpacing: LY.W < 600 ? 20 : 28, paddingTop: LY.W < 600 ? 64 : 112, paddingLeft: LY.px - (LY.W < 600 ? 20 : 24), paddingRight: LY.px - (LY.W < 600 ? 20 : 24) }); hero.appendChild(hc); hc.layoutSizingHorizontal = "FILL";
  hc.appendChild(inst(C.chip, {}, { Label: "Бесплатная онлайн-консультация" }));
  const hl = await H("Правовая защита\nнового уровня", "Display"); hl.textAlignHorizontal = "CENTER"; hl.setRangeFills(hl.characters.indexOf("нового"), hl.characters.length, gradPaint(TH)); hc.appendChild(hl);
  if (LY.W < 600) { hl.layoutSizingHorizontal = "FILL"; hl.textAutoResize = "HEIGHT"; }
  const sub = await T("Адвокаты Pravoe Delo: бизнес, гражданские, уголовные и семейные дела. Ответ на заявку — в течение 24 часов.", "Body/L", "color/text/secondary"); sub.textAlignHorizontal = "CENTER"; hc.appendChild(sub); sub.layoutSizingHorizontal = "FILL"; sub.textAutoResize = "HEIGHT"; if (LY.W >= 600) { sub.layoutSizingHorizontal = "FIXED"; sub.resize(Math.min(640, CW), sub.height); }
  const hb = Fr(LY.W < 600 ? "VERTICAL" : "HORIZONTAL", { itemSpacing: 12, paddingTop: 8, counterAxisAlignItems: "CENTER" }); hc.appendChild(hb); if (LY.W < 600) hb.layoutSizingHorizontal = "FILL";
  const cta = primary("Получить консультацию"); hb.appendChild(cta); if (LY.W < 600) cta.layoutSizingHorizontal = "FILL";
  const ms = Fr("HORIZONTAL", { itemSpacing: 12 }); ms.appendChild(inst(C.msg, { Platform: "Telegram" })); ms.appendChild(inst(C.msg, { Platform: "WhatsApp" })); hb.appendChild(ms);
  if (LY.W < 600) { ms.layoutSizingHorizontal = "FILL"; for (const k of ms.children) k.layoutGrow = 1; }
  const stats = []; for (const [v, c] of (LY.W < 600 ? [["15+", "лет практики"], ["1 200+", "выигранных дел"], ["94%", "в пользу клиента"], ["24 ч", "ответ на заявку"]] : [["15+", "лет практики"], ["1 200+", "выигранных дел"], ["94%", "решений в пользу клиента"], ["24 ч", "срок ответа на заявку"]])) stats.push(inst(C.stat, {}, { Value: v, Caption: c }));
  const sw = Fr("VERTICAL", { paddingTop: LY.W < 600 ? 40 : 64 }); hc.appendChild(sw); sw.layoutSizingHorizontal = "FILL"; grid(sw, LY.statsCols, stats, LY.W < 600 ? 12 : 16, "Stats");
  for (const s of stats) s.resize(s.width, s.height);
}
log("hero");
{ // ABOUT
  const s = sec(home, "О нас", { gap: 48 });
  const row = Fr(LY.about2 ? "HORIZONTAL" : "VERTICAL", { itemSpacing: LY.about2 ? 48 : 32, counterAxisAlignItems: LY.about2 ? "CENTER" : "MIN" }); s.appendChild(row); row.layoutSizingHorizontal = "FILL";
  const col = Fr("VERTICAL", { itemSpacing: 20 }); row.appendChild(col); if (LY.about2) col.layoutGrow = 1; else col.layoutSizingHorizontal = "FILL";
  col.appendChild(await T("О нас", "Overline", "color/text/accent"));
  const ht = await H("15 лет защищаем\nбизнес и людей", "Heading/H1"); col.appendChild(ht); ht.layoutSizingHorizontal = "FILL"; ht.textAutoResize = "HEIGHT";
  for (const [t, st] of [["Pravoe Delo основана в 2010 году командой адвокатов, которые прошли путь от следствия и судов до корпоративной практики. Сегодня мы ведём дела компаний и частных клиентов по всему Узбекистану.", "Body/L"], ["Наша миссия — сделать квалифицированную юридическую помощь понятной: честная оценка шансов, прозрачная стоимость и результат, за который не стыдно.", "Body/M"]]) { const x = await T(t, st, "color/text/secondary"); col.appendChild(x); x.layoutSizingHorizontal = "FILL"; x.textAutoResize = "HEIGHT"; }
  const lic = wrapRow(col, 10); for (const l of ["Лицензия Минюста РУз", "Палата адвокатов РУз", "Адвокатская тайна"]) { const c = glassBox("HORIZONTAL", { itemSpacing: 8, counterAxisAlignItems: "CENTER", paddingTop: LY.touch ? 12 : 8, paddingBottom: LY.touch ? 12 : 8, paddingLeft: 12, paddingRight: 14, r: "radius/full" }, true); c.appendChild(ico("ui/check", 16, "color/icon/accent")); c.appendChild(await T(l, "Label")); lic.appendChild(c); }
  const pw = LY.about2 ? LY.photo[0] : CW; const { ph, plate } = photoCard(pw, LY.photo[1], PHOTOS.library, "Офис в центре Ташкента", "приём по предварительной записи"); row.appendChild(ph); await plate();
  const adv = []; for (const [k, t, d] of [["ui/award", "Профессионализм", "Адвокаты с опытом 10–20 лет в судах, следствии и корпоративной практике. Каждое дело ведёт партнёр."], ["ui/lock", "Конфиденциальность", "Адвокатская тайна с первой минуты разговора. Данные клиентов не публикуются — даже в кейсах."], ["ui/target", "Результат", "Честно оцениваем шансы до начала работы. 94% дел завершаются в пользу клиента."]]) {
    const c = glassBox(LY.advCols === 1 && LY.W >= 600 ? "HORIZONTAL" : "VERTICAL", { itemSpacing: 14, paddingTop: 28, paddingBottom: 28, paddingLeft: 28, paddingRight: 28 }); const b = inst(C.ib, {}); swapIcon(b, k); c.appendChild(b);
    const tx = Fr("VERTICAL", { itemSpacing: 8 }); c.appendChild(tx); tx.layoutGrow = c.layoutMode === "HORIZONTAL" ? 1 : 0; if (c.layoutMode === "VERTICAL") tx.layoutSizingHorizontal = "FILL";
    const h4 = await T(t, "Heading/H4"); if (LY.advCols > 1 && LY.W < 1440) { h4.fontSize = 20; c.paddingLeft = c.paddingRight = 24; } tx.appendChild(h4); h4.layoutSizingHorizontal = "FILL"; h4.textAutoResize = "HEIGHT"; const d0 = await T(d, "Body/M", "color/text/secondary"); tx.appendChild(d0); d0.layoutSizingHorizontal = "FILL"; d0.textAutoResize = "HEIGHT"; adv.push(c);
  }
  grid(s, LY.advCols, adv, 16, "Advantages");
}
log("about");
{ // SERVICES
  const s = sec(home, "Практики");
  await title(s, "Практики", "Чем мы поможем", "Каждое дело ведёт партнёр фирмы — от первой встречи до решения суда. Стоимость согласуем до начала работы.");
  const items = []; for (const [k, t, d] of [["ui/briefcase", "Бизнес-право", "Регистрация и ликвидация компаний, договоры, корпоративные споры, сопровождение сделок."], ["ui/scale", "Гражданские дела", "Взыскание долгов, защита прав потребителей, наследство, споры по договорам."], ["ui/shield-check", "Уголовные дела", "Защита на всех стадиях: допрос, следствие, суд, обжалование приговора."], ["ui/house", "Семейные споры", "Развод, алименты, раздел имущества, определение места жительства детей."], ["ui/file-text", "Налоги и проверки", "Споры с налоговой, сопровождение проверок, обжалование штрафов."], ["ui/building-2", "Недвижимость", "Проверка объектов, сделки, споры с застройщиками, земельные вопросы."]]) { const c = inst(C.service, {}, { Title: t, Description: d }); swapIcon(c, k); if (LY.W < 600) c.minHeight = null; items.push(c); }
  if (LY.W < 600) {
    for (const it of items) it.remove();
    const list = Fr("VERTICAL", { name: "Services · compact", itemSpacing: 10 }); s.appendChild(list); list.layoutSizingHorizontal = "FILL";
    for (const [k, t, d] of [["ui/briefcase", "Бизнес-право", "Компании, договоры, корпоративные споры"], ["ui/scale", "Гражданские дела", "Долги, наследство, права потребителей"], ["ui/shield-check", "Уголовные дела", "Защита на следствии и в суде"], ["ui/house", "Семейные споры", "Развод, алименты, раздел имущества"], ["ui/file-text", "Налоги и проверки", "Споры с налоговой, штрафы"], ["ui/building-2", "Недвижимость", "Сделки, застройщики, земля"]]) {
      const r = glassBox("HORIZONTAL", { itemSpacing: 14, counterAxisAlignItems: "CENTER", paddingTop: 16, paddingBottom: 16, paddingLeft: 16, paddingRight: 16, r: "radius/xl" }); list.appendChild(r); r.layoutSizingHorizontal = "FILL";
      const b = inst(C.ib, {}); swapIcon(b, k); r.appendChild(b);
      const tx = Fr("VERTICAL", { itemSpacing: 2 }); r.appendChild(tx); tx.layoutGrow = 1;
      const h4 = await T(t, "Heading/H4"); h4.fontSize = 18; tx.appendChild(h4); const dd = await T(d, "Body/S", "color/text/secondary"); tx.appendChild(dd); dd.layoutSizingHorizontal = "FILL"; dd.textAutoResize = "HEIGHT";
      r.appendChild(ico("ui/arrow-right", 20, "color/icon/secondary"));
    }
  } else grid(s, LY.svcCols, items, 20, "Services");
  const cta = glassBox(LY.W < 600 ? "VERTICAL" : "HORIZONTAL", { itemSpacing: 20, counterAxisAlignItems: LY.W < 600 ? "MIN" : "CENTER", primaryAxisAlignItems: "SPACE_BETWEEN", paddingTop: 24, paddingBottom: 24, paddingLeft: 28, paddingRight: 24, r: "radius/2xl" }, true); s.appendChild(cta); cta.layoutSizingHorizontal = "FILL";
  const tx = Fr("VERTICAL", { itemSpacing: 4 }); cta.appendChild(tx); tx.layoutGrow = LY.W < 600 ? 0 : 1; if (LY.W < 600) tx.layoutSizingHorizontal = "FILL";
  tx.appendChild(await T("Не нашли свой вопрос?", "Heading/H4")); const dd = await T("Опишите ситуацию — юрист ответит в течение 24 часов и подскажет, как действовать.", "Body/M", "color/text/secondary"); tx.appendChild(dd); dd.layoutSizingHorizontal = "FILL"; dd.textAutoResize = "HEIGHT";
  const b = primary("Получить консультацию"); cta.appendChild(b); if (LY.W < 600) b.layoutSizingHorizontal = "FILL";
}
log("services");
{ // CASES
  const s = sec(home, "Кейсы");
  await title(s, "Успешные дела", "Результаты, а не обещания", "Реальные истории без имён клиентов — с конкретными суммами и итогами.");
  const items = []; for (const [c0, t, si, r] of [["Административное право", "Штраф $50 000 отменён", "Компании выписали штраф $50 000 за нарушение валютного законодательства по итогам проверки.", "Доказали процессуальные нарушения при проверке. Суд признал постановление незаконным, штраф отменён полностью."], ["Гражданское право", "Возвращено 380 млн сум", "Поставщик получил предоплату и полгода не исполнял договор, ссылаясь на форс-мажор.", "Собрали доказательства, что форс-мажора не было. Суд взыскал долг, неустойку и судебные расходы."], ["Семейное право", "Дети остались с матерью", "Отец пытался через суд определить место жительства детей с ним и запретить выезд за границу.", "Подготовили заключения специалистов и свидетелей. Суд оставил детей с матерью, выезд разрешён."], ["Уголовное право", "Дело прекращено на следствии", "Директору предъявили обвинение в растрате средств предприятия.", "Финансовая экспертиза подтвердила законность операций. Уголовное дело прекращено за отсутствием состава."]]) items.push(inst(C.case, {}, { Category: c0, Title: t, Situation: si, Result: r }));
  if (LY.W < 600) carousel(s, items, 300, "Cases"); else grid(s, LY.casesCols, items, 20, "Cases");
}
log("cases");
{ // TEAM
  const s = sec(home, "Команда");
  await title(s, "Команда", "Адвокаты, которые ведут ваше дело", "Партнёры фирмы лично участвуют в каждом деле. Фото и биографии заменим на реальные.");
  const items = []; for (const [r, n, b] of [["Управляющий партнёр", "Имя Фамилия", "Адвокат с 18-летним опытом. Корпоративные и налоговые споры, сопровождение крупных сделок."], ["Партнёр", "Имя Фамилия", "15 лет в уголовной защите: от следствия до Верховного суда. Бывший следователь."], ["Старший юрист", "Имя Фамилия", "Семейные и гражданские дела. Медиатор, помогает решать споры без суда."]]) items.push(inst(C.lawyer, {}, { Role: r, Name: n, Bio: b }));
  if (LY.W < 600) carousel(s, items, 300, "Team"); else grid(s, LY.teamCols, items, 20, "Team");
}
log("team");
{ // REVIEWS
  const s = sec(home, "Отзывы");
  await title(s, "Отзывы", "Нам доверяют", "Публикуем отзывы только с согласия клиентов.");
  const items = []; for (const [t, i, n, c] of [["Обратились с налоговым спором, который казался безнадёжным. Команда разобралась за неделю и выиграла дело в суде.", "АК", "Азиз Каримов", "Директор, ООО «Пример»"], ["Сопровождали покупку коммерческой недвижимости. Нашли два риска, о которых продавец молчал, — сэкономили нам деньги и нервы.", "НР", "Нигора Расулова", "Учредитель, сеть клиник"], ["Деликатно и быстро помогли с разводом и разделом имущества. Всё объясняли простым языком и всегда были на связи.", "ДС", "Дмитрий С.", "Частный клиент"]]) items.push(inst(C.review, {}, { Text: t, Initials: i, Name: n, Company: c }));
  if (LY.W < 600) carousel(s, items, 300, "Reviews"); else grid(s, LY.revCols, items, 20, "Reviews");
  s.appendChild(await T("Среди клиентов", "Label", "color/text/tertiary"));
  const logos = []; for (let i = 1; i <= (LY.logoCols === 2 ? 4 : LY.logoCols === 3 ? 6 : 5); i++) { const l = glassBox("HORIZONTAL", { primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", r: "radius/lg" }); l.resize(100, 64); l.primaryAxisSizingMode = "FIXED"; l.counterAxisSizingMode = "FIXED"; l.appendChild(await T(`Логотип ${i}`, "Label", "color/text/tertiary")); logos.push(l); }
  grid(s, LY.logoCols, logos, 12, "Logos");
}
log("reviews");
{ // CONSULTATION TEASER
  const s = sec(home, "Консультация", { pt: LY.py / 2, pb: LY.py / 2 });
  const card = glassBox(LY.consultStack ? "VERTICAL" : "HORIZONTAL", { name: "Consultation card", itemSpacing: LY.W < 600 ? 28 : 40, paddingTop: LY.W < 600 ? 32 : 56, paddingBottom: LY.W < 600 ? 32 : 56, paddingLeft: LY.W < 600 ? 24 : 56, paddingRight: LY.W < 600 ? 24 : 56, r: "radius/2xl" }, true); s.appendChild(card); card.layoutSizingHorizontal = "FILL";
  const cl = Fr("VERTICAL", { itemSpacing: 20 }); card.appendChild(cl); cl.layoutSizingHorizontal = "FILL";
  cl.appendChild(inst(C.chip, {}, { Label: "Бесплатно · онлайн или в офисе" }));
  const ch = await H("Бесплатная консультация с адвокатом", "Heading/H1"); ch.setRangeFills(ch.characters.indexOf("с адвокатом"), ch.characters.length, gradPaint(TH)); cl.appendChild(ch); ch.layoutSizingHorizontal = "FILL"; ch.textAutoResize = "HEIGHT";
  const cd = await T("Расскажите о ситуации — юрист изучит её, оценит шансы и предложит план действий. Ответ в течение 24 часов, всё конфиденциально.", "Body/L", "color/text/secondary"); cl.appendChild(cd); cd.layoutSizingHorizontal = "FILL"; cd.textAutoResize = "HEIGHT";
  const cb = Fr(LY.W < 600 ? "VERTICAL" : "HORIZONTAL", { itemSpacing: 12, counterAxisAlignItems: LY.W < 600 ? "MIN" : "CENTER" }); cl.appendChild(cb); if (LY.W < 600) cb.layoutSizingHorizontal = "FILL";
  const b = primary("Записаться на консультацию"); cb.appendChild(b); if (LY.W < 600) b.layoutSizingHorizontal = "FILL";
  cb.appendChild(inst(C.btn, { Style: "Ghost", Size: "M", State: "Default" }, { Label: "Как проходит консультация →" }));
  const steps = []; for (const [n, t, d] of [["1", "Заявка", "Форма, Telegram или WhatsApp — 2 минуты"], ["2", "Звонок юриста", "Уточним детали в течение 24 часов"], ["3", "Разбор ситуации", "Оценим шансы и риски"], ["4", "План действий", "Сроки и стоимость — до начала работы"]]) {
    const st = glassBox("HORIZONTAL", { itemSpacing: 14, counterAxisAlignItems: "CENTER", paddingTop: 14, paddingBottom: 14, paddingLeft: 14, paddingRight: 18, r: "radius/lg" });
    const num = Fr("HORIZONTAL", { primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" }); num.resize(40, 40); num.primaryAxisSizingMode = "FIXED"; num.counterAxisSizingMode = "FIXED"; rad(num, "radius/full"); num.fills = [paint("color/bg/accent", TH)]; num.appendChild(await T(n, "Label", "color/text/on-accent")); st.appendChild(num);
    const tx = Fr("VERTICAL", { itemSpacing: 2 }); st.appendChild(tx); tx.layoutGrow = 1; tx.appendChild(await T(t, "Label")); const dd = await T(d, "Body/S", "color/text/secondary"); tx.appendChild(dd); dd.layoutSizingHorizontal = "FILL"; dd.textAutoResize = "HEIGHT"; steps.push(st);
  }
  if (LY.consultStack) grid(card, LY.W < 600 ? 1 : 2, steps, 12, "Steps"); else { const sc = Fr("VERTICAL", { itemSpacing: 12 }); card.appendChild(sc); for (const st of steps) { sc.appendChild(st); st.resize(420, st.height); } cl.layoutSizingHorizontal = "FIXED"; cl.layoutGrow = 1; }
}
log("consult");
{ // FAQ
  const s = sec(home, "FAQ");
  const row = Fr(LY.faqStack ? "VERTICAL" : "HORIZONTAL", { itemSpacing: LY.faqStack ? 28 : 64 }); s.appendChild(row); row.layoutSizingHorizontal = "FILL";
  const l = Fr("VERTICAL", { itemSpacing: 16 }); row.appendChild(l); if (LY.faqStack) l.layoutSizingHorizontal = "FILL";
  l.appendChild(await T("FAQ", "Overline", "color/text/accent")); l.appendChild(await H("Частые вопросы", "Heading/H1"));
  l.appendChild(await T("Не нашли ответ? Напишите нам — ответим лично.", "Body/M", "color/text/secondary")); l.appendChild(inst(C.msg, { Platform: "Telegram" }));
  const list = Fr("VERTICAL", { itemSpacing: 12 }); row.appendChild(list); if (LY.faqStack) list.layoutSizingHorizontal = "FILL"; else list.layoutGrow = 1;
  for (const [q, o] of [["Сколько стоит консультация?", true], ["Есть ли гарантия результата?"], ["Как быстро вы ответите на заявку?"], ["Можно ли работать удалённо, из другого города?"], ["Как вы защищаете конфиденциальность?"]]) { const f = inst(C.faq, { Open: o ? "True" : "False" }, { Question: q }); list.appendChild(f); f.layoutSizingHorizontal = "FILL"; }
}
log("faq");
{ // CONTACTS
  const s = sec(home, "Контакты");
  await title(s, "Контакты", "Приходите или напишите", null);
  const row = Fr(LY.contactsStack ? "VERTICAL" : "HORIZONTAL", { itemSpacing: 20 }); s.appendChild(row); row.layoutSizingHorizontal = "FILL";
  const info = glassBox("VERTICAL", { itemSpacing: 22, paddingTop: 32, paddingBottom: 32, paddingLeft: LY.W < 600 ? 20 : 32, paddingRight: LY.W < 600 ? 20 : 32, r: "radius/2xl" }); row.appendChild(info);
  if (LY.contactsStack) info.layoutSizingHorizontal = "FILL"; else { info.resize(400, 10); info.counterAxisSizingMode = "FIXED"; info.primaryAxisSizingMode = "AUTO"; }
  for (const [k, t, d] of [["ui/map-pin", "Адрес", "г. Ташкент, ул. Примерная, 1, офис 101"], ["ui/phone", "Телефон", "+998 00 000-00-00"], ["ui/mail", "Email", "info@pravoedelo.uz"], ["ui/clock", "Часы работы", "Пн–Пт 9:00–19:00, Сб по записи"]]) { const r = Fr("HORIZONTAL", { itemSpacing: 14 }); info.appendChild(r); r.layoutSizingHorizontal = "FILL"; const b0 = inst(C.ib, {}); swapIcon(b0, k); r.appendChild(b0); const tx = Fr("VERTICAL", { itemSpacing: 2 }); r.appendChild(tx); tx.layoutGrow = 1; tx.appendChild(await T(t, "Body/S", "color/text/secondary")); const dv = await T(d, "Label"); tx.appendChild(dv); dv.layoutSizingHorizontal = "FILL"; dv.textAutoResize = "HEIGHT"; }
  const mr = wrapRow(info, 10); mr.appendChild(inst(C.msg, { Platform: "Telegram" })); mr.appendChild(inst(C.msg, { Platform: "WhatsApp" }));
  const bb = primary("Получить консультацию", false); info.appendChild(bb); bb.layoutSizingHorizontal = "FILL";
  const map = Fr("VERTICAL", { name: "Map", primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", itemSpacing: 12 }); row.appendChild(map); rad(map, "radius/2xl"); map.clipsContent = true;
  if (LY.contactsStack) { map.layoutSizingHorizontal = "FILL"; map.primaryAxisSizingMode = "FIXED"; map.resize(map.width, LY.W < 600 ? 260 : 360); } else { map.layoutGrow = 1; map.primaryAxisSizingMode = "FIXED"; map.layoutAlign = "STRETCH"; }
  map.fills = [paint(TH === "Dark" ? "color/bg/subtle" : "color/bg/muted", TH)]; map.strokes = [paint("color/border/glass-strong", TH)]; map.strokeWeight = 1;
  for (let i = 0; i < 9; i++) { const l = figma.createRectangle(); l.resize(2000, 1); l.fills = [paint("color/border/glass", TH)]; map.appendChild(l); l.layoutPositioning = "ABSOLUTE"; l.x = -200; l.y = 50 * i + 20; l.rotation = i % 2 ? 8 : -6; }
  for (let i = 0; i < 12; i++) { const l = figma.createRectangle(); l.resize(1, 1200); l.fills = [paint("color/border/glass", TH)]; map.appendChild(l); l.layoutPositioning = "ABSOLUTE"; l.x = 80 * i + 20; l.y = -200; l.rotation = 10; }
  const pin = Fr("HORIZONTAL", { primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" }); pin.resize(56, 56); pin.primaryAxisSizingMode = "FIXED"; pin.counterAxisSizingMode = "FIXED"; rad(pin, "radius/full"); pin.fills = [paint("color/bg/accent", TH)]; pin.appendChild(ico("ui/map-pin", 26, "color/text/on-accent")); map.appendChild(pin);
  const mp = glassBox("VERTICAL", { name: "Glass plate", itemSpacing: 2, paddingTop: 10, paddingBottom: 10, paddingLeft: 16, paddingRight: 16, r: "radius/lg" }, true); mp.appendChild(await T("Pravoe Delo", "Label")); mp.appendChild(await T("Google Maps · встроенная карта", "Body/S", "color/text/secondary")); map.appendChild(mp);
}
log("contacts");
await footer(home); fab(home); await finish(home);
log("home done");

// ======================= CONSULTATION =======================
const cons = await newPage(`${LY.label} · ${THN} · Consultation`, baseX + LY.W + 200, baseY);
{
  const hero = Fr("VERTICAL", { name: "Section · Hero", counterAxisAlignItems: "CENTER", paddingTop: LY.W < 600 ? 16 : 24, paddingBottom: LY.py, paddingLeft: LY.W < 600 ? 20 : 24, paddingRight: LY.W < 600 ? 20 : 24 }); cons.appendChild(hero); hero.layoutSizingHorizontal = "FILL"; hero.clipsContent = false;
  glowHero(hero); hero.appendChild(header());
  const stackHero = LY.W < 1440;
  const hr = Fr(stackHero ? "VERTICAL" : "HORIZONTAL", { itemSpacing: stackHero ? 40 : 64, paddingTop: LY.W < 600 ? 48 : 80, paddingLeft: LY.px - (LY.W < 600 ? 20 : 24), paddingRight: LY.px - (LY.W < 600 ? 20 : 24), counterAxisAlignItems: stackHero ? "MIN" : "CENTER" }); hero.appendChild(hr); hr.layoutSizingHorizontal = "FILL";
  const hl = Fr("VERTICAL", { itemSpacing: 20 }); hr.appendChild(hl); hl.layoutSizingHorizontal = "FILL";
  hl.appendChild(inst(C.btn, { Style: "Ghost", Size: LY.touch ? "M" : "S", State: "Default" }, { Label: "← На главную" }));
  hl.appendChild(inst(C.chip, {}, { Label: "Бесплатно · ответ в течение 24 часов" }));
  const h1 = await H("Бесплатная\nконсультация", "Display"); h1.setRangeFills(h1.characters.indexOf("консультация"), h1.characters.length, gradPaint(TH)); hl.appendChild(h1);
  const sb = await T("Юрист Pravoe Delo изучит вашу ситуацию, честно оценит шансы и предложит план действий. Без обязательств и скрытых платежей.", "Body/L", "color/text/secondary"); hl.appendChild(sb); sb.layoutSizingHorizontal = "FILL"; sb.textAutoResize = "HEIGHT";
  const hb = Fr(LY.W < 600 ? "VERTICAL" : "HORIZONTAL", { itemSpacing: 12 }); hl.appendChild(hb); if (LY.W < 600) hb.layoutSizingHorizontal = "FILL";
  const p0 = primary("Заполнить заявку"); hb.appendChild(p0); if (LY.W < 600) p0.layoutSizingHorizontal = "FILL";
  const ms = Fr("HORIZONTAL", { itemSpacing: 12 }); ms.appendChild(inst(C.msg, { Platform: "Telegram" })); ms.appendChild(inst(C.msg, { Platform: "WhatsApp" })); hb.appendChild(ms); if (LY.W < 600) { ms.layoutSizingHorizontal = "FILL"; for (const k of ms.children) k.layoutGrow = 1; }
  const get = glassBox("VERTICAL", { name: "What you get", itemSpacing: 16, paddingTop: 28, paddingBottom: 28, paddingLeft: 28, paddingRight: 28, r: "radius/2xl" }, true); hr.appendChild(get); get.layoutSizingHorizontal = "FILL";
  get.appendChild(await T("Что вы получите", "Heading/H4"));
  for (const t of ["Оценку шансов и рисков по вашему делу", "План действий и сроки", "Ориентир по стоимости — до начала работы", "Ответы на все вопросы простым языком"]) { const r = Fr("HORIZONTAL", { itemSpacing: 12, counterAxisAlignItems: "CENTER" }); get.appendChild(r); r.layoutSizingHorizontal = "FILL"; const d = Fr("HORIZONTAL", { primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" }); d.resize(28, 28); d.primaryAxisSizingMode = "FIXED"; d.counterAxisSizingMode = "FIXED"; rad(d, "radius/full"); d.fills = [paint("color/bg/accent-subtle", TH)]; d.appendChild(ico("ui/check", 16, "color/icon/accent")); r.appendChild(d); const tt = await T(t, "Body/M"); r.appendChild(tt); tt.layoutGrow = 1; tt.textAutoResize = "HEIGHT"; }
  const conf = Fr("HORIZONTAL", { itemSpacing: 10, counterAxisAlignItems: "CENTER" }); conf.appendChild(ico("ui/lock", 18, "color/icon/accent")); conf.appendChild(await T("Конфиденциально — адвокатская тайна", "Label", "color/text/secondary")); get.appendChild(conf);
}
{
  const s = sec(cons, "Как проходит"); await title(s, "Как проходит", "Четыре простых шага", "От заявки до плана действий — обычно 1–2 дня.");
  const items = []; for (const [n, k, t, d, tm] of [["01", "ui/file-text", "Заявка", "Заполните короткую форму или напишите в Telegram / WhatsApp.", "2 минуты"], ["02", "ui/phone", "Звонок юриста", "Юрист свяжется, уточнит детали и попросит документы, если нужны.", "до 24 часов"], ["03", "ui/scale", "Разбор ситуации", "Онлайн или в офисе: разбираем дело, оцениваем шансы и риски.", "30–40 минут"], ["04", "ui/target", "План действий", "Вы получаете план, сроки и стоимость. Решение — за вами.", "сразу после встречи"]]) {
    const c = glassBox("VERTICAL", { itemSpacing: 12, paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 }); const top = Fr("HORIZONTAL", { primaryAxisAlignItems: "SPACE_BETWEEN", counterAxisAlignItems: "CENTER" }); c.appendChild(top); top.layoutSizingHorizontal = "FILL";
    const num = await T(n, "Stat"); num.fontSize = 36; num.fills = gradPaint(TH); top.appendChild(num); const b = inst(C.ib, {}); swapIcon(b, k); top.appendChild(b);
    c.appendChild(await T(t, "Heading/H4")); const dd = await T(d, "Body/S", "color/text/secondary"); c.appendChild(dd); dd.layoutSizingHorizontal = "FILL"; dd.textAutoResize = "HEIGHT";
    const tmr = Fr("HORIZONTAL", { itemSpacing: 6, counterAxisAlignItems: "CENTER" }); tmr.appendChild(ico("ui/clock", 14, "color/icon/secondary")); tmr.appendChild(await T(tm, "Label", "color/text/secondary")); c.appendChild(tmr); items.push(c);
  }
  grid(s, LY.W >= 1440 ? 4 : LY.W >= 600 ? 2 : 1, items, LY.W < 600 ? 12 : 16, "Steps");
  const tItems = []; for (const [k, t, d] of [["ui/clock", "Ответ в течение 24 часов", "В рабочие дни обычно в течение 2–3 часов. Срочные вопросы — сразу в Telegram или по телефону."], ["ui/lock", "Адвокатская тайна", "Всё, что вы расскажете, защищено законом. Данные не передаются третьим лицам."], ["ui/message-circle", "Удобный формат", "Телефон, Telegram, WhatsApp, видеозвонок или встреча в офисе — как вам удобнее."]]) {
    const c = glassBox("HORIZONTAL", { itemSpacing: 16, paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 }); const b = inst(C.ib, {}); swapIcon(b, k); c.appendChild(b); const tx = Fr("VERTICAL", { itemSpacing: 6 }); c.appendChild(tx); tx.layoutGrow = 1;
    const h4 = await T(t, "Heading/H4"); tx.appendChild(h4); h4.layoutSizingHorizontal = "FILL"; h4.textAutoResize = "HEIGHT"; const dd = await T(d, "Body/S", "color/text/secondary"); tx.appendChild(dd); dd.layoutSizingHorizontal = "FILL"; dd.textAutoResize = "HEIGHT"; tItems.push(c);
  }
  grid(s, LY.W >= 1440 ? 3 : 1, tItems, 12, "Terms");
}
{
  const s = sec(cons, "Вопросы"); await title(s, "С чем приходят", "С какими вопросами можно обратиться", null);
  const chips = wrapRow(s, 10); for (const [k, t] of [["ui/briefcase", "Регистрация и договоры"], ["ui/scale", "Взыскание долгов"], ["ui/file-text", "Налоговые проверки и штрафы"], ["ui/shield-check", "Уголовное преследование"], ["ui/house", "Развод и алименты"], ["ui/users", "Наследство"], ["ui/building-2", "Покупка недвижимости"], ["ui/landmark", "Споры с госорганами"], ["ui/briefcase", "Трудовые споры"], ["ui/award", "Защита прав потребителей"]]) { const c = glassBox("HORIZONTAL", { itemSpacing: 10, counterAxisAlignItems: "CENTER", paddingTop: LY.touch ? 14 : 12, paddingBottom: LY.touch ? 14 : 12, paddingLeft: 16, paddingRight: 20, r: "radius/full" }, true); c.appendChild(ico(k, 18, "color/icon/accent")); c.appendChild(await T(t, "Label")); chips.appendChild(c); }
  s.appendChild(inst(C.btn, { Style: "Ghost", Size: "M", State: "Default" }, { Label: "Все практики на главной →" }));
}
{
  const s = sec(cons, "FAQ"); const row = Fr(LY.faqStack ? "VERTICAL" : "HORIZONTAL", { itemSpacing: LY.faqStack ? 28 : 64 }); s.appendChild(row); row.layoutSizingHorizontal = "FILL";
  const l = Fr("VERTICAL", { itemSpacing: 16 }); row.appendChild(l); if (LY.faqStack) l.layoutSizingHorizontal = "FILL";
  l.appendChild(await T("FAQ", "Overline", "color/text/accent")); l.appendChild(await H("О консультации", "Heading/H1")); l.appendChild(await T("Остались вопросы? Напишите — ответим лично.", "Body/M", "color/text/secondary")); l.appendChild(inst(C.msg, { Platform: "WhatsApp" }));
  const list = Fr("VERTICAL", { itemSpacing: 12 }); row.appendChild(list); if (LY.faqStack) list.layoutSizingHorizontal = "FILL"; else list.layoutGrow = 1;
  for (const [q, o] of [["Это правда бесплатно?", true], ["Сколько длится консультация?"], ["Какие документы подготовить?"], ["Можно ли проконсультироваться анонимно?"], ["Что происходит после консультации?"]]) { const f = inst(C.faq, { Open: o ? "True" : "False" }, o ? { Question: q, Answer: "Да. Первая консультация бесплатна и ни к чему вас не обязывает. Если решите работать с нами, стоимость согласуем заранее и зафиксируем в договоре." } : { Question: q }); list.appendChild(f); f.layoutSizingHorizontal = "FILL"; }
}
{
  const s = sec(cons, "Финальный CTA", { pt: LY.py / 3 });
  const card = glassBox("VERTICAL", { name: "CTA card", itemSpacing: 20, paddingTop: LY.W < 600 ? 40 : 56, paddingBottom: LY.W < 600 ? 40 : 56, paddingLeft: LY.W < 600 ? 24 : 48, paddingRight: LY.W < 600 ? 24 : 48, counterAxisAlignItems: "CENTER", r: "radius/2xl" }, true); s.appendChild(card); card.layoutSizingHorizontal = "FILL";
  const ch = await H("Опишите ситуацию — ответим в течение 24 часов", "Heading/H1"); ch.textAlignHorizontal = "CENTER"; ch.setRangeFills(ch.characters.indexOf("ответим"), ch.characters.length, gradPaint(TH)); card.appendChild(ch); ch.layoutSizingHorizontal = "FILL"; ch.textAutoResize = "HEIGHT";
  const cs = await T("Бесплатно, конфиденциально и без обязательств.", "Body/L", "color/text/secondary"); cs.textAlignHorizontal = "CENTER"; card.appendChild(cs); cs.layoutSizingHorizontal = "FILL"; cs.textAutoResize = "HEIGHT";
  const cb = wrapRow(card, 12); cb.primaryAxisAlignItems = "CENTER";
  const p1 = primary("Заполнить заявку"); cb.appendChild(p1); for (const p of ["Telegram", "WhatsApp", "Phone"]) cb.appendChild(inst(C.msg, { Platform: p }));
  if (LY.W < 600) { cb.layoutMode = "VERTICAL"; cb.counterAxisAlignItems = "CENTER"; for (const k of cb.children) k.layoutSizingHorizontal = "FILL"; }
}
await footer(cons); fab(cons); await finish(cons);
log("consult done");
// ======================= TOUCH MENU (open burger) =======================
let menuId = null;
if (LY.touch) {
  const VH = LY.W >= 600 ? 1180 : 844;
  const menu = await newPage(`${LY.label} · ${THN} · Menu`, baseX + (LY.W + 200) * 2, baseY);
  menu.primaryAxisSizingMode = "FIXED"; menu.resize(LY.W, VH); menu.itemSpacing = 0; menu.counterAxisAlignItems = "MIN";
  glowAt(menu, LY.W * 0.9, LY.W * 0.45, LY.W * 0.05, -LY.W * 0.35, TH === "Dark" ? 0.22 : 0.24, "color/glow/primary", "Glow · follows cursor");
  const top = Fr("HORIZONTAL", { name: "Menu header", primaryAxisAlignItems: "SPACE_BETWEEN", counterAxisAlignItems: "CENTER", paddingTop: LY.W < 600 ? 16 : 24, paddingLeft: LY.px, paddingRight: LY.px }); menu.appendChild(top); top.layoutSizingHorizontal = "FILL";
  const lg = variant(C.logoH, { Color: TH === "Dark" ? "Inverse" : "Primary" }).createInstance(); lg.rescale((LY.W < 600 ? 32 : 40) / lg.height); top.appendChild(lg);
  const close = glassBox("HORIZONTAL", { name: "Close", primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", r: "radius/full" }, true); close.resize(48, 48); close.primaryAxisSizingMode = "FIXED"; close.counterAxisSizingMode = "FIXED"; close.appendChild(ico("ui/x", 22)); top.appendChild(close);
  const nav = Fr("VERTICAL", { name: "Menu links", paddingTop: LY.W < 600 ? 24 : 40, paddingLeft: LY.px, paddingRight: LY.px }); menu.appendChild(nav); nav.layoutSizingHorizontal = "FILL";
  for (const l of ["Услуги", "О нас", "Кейсы", "Команда", "Отзывы", "FAQ", "Контакты"]) {
    const r = Fr("HORIZONTAL", { primaryAxisAlignItems: "SPACE_BETWEEN", counterAxisAlignItems: "CENTER", paddingTop: LY.W < 600 ? 14 : 18, paddingBottom: LY.W < 600 ? 14 : 18 }); nav.appendChild(r); r.layoutSizingHorizontal = "FILL";
    r.strokes = [paint("color/border/glass", TH)]; r.strokeBottomWeight = 1; r.strokeTopWeight = 0; r.strokeLeftWeight = 0; r.strokeRightWeight = 0;
    const t = await T(l, "Heading/H3"); if (LY.W < 600) t.fontSize = 24; r.appendChild(t); r.appendChild(ico("ui/arrow-right", 22, "color/icon/secondary"));
  }
  const bottom = Fr("VERTICAL", { name: "Menu actions", itemSpacing: 16, paddingTop: 28, paddingLeft: LY.px, paddingRight: LY.px }); menu.appendChild(bottom); bottom.layoutSizingHorizontal = "FILL";
  const prefs = Fr("HORIZONTAL", { itemSpacing: 12, counterAxisAlignItems: "CENTER", primaryAxisAlignItems: "SPACE_BETWEEN" }); bottom.appendChild(prefs); prefs.layoutSizingHorizontal = "FILL";
  const lang = variant(C.lang, { Active: "RU", Theme: TH }).createInstance(); lang.rescale(44 / lang.height); prefs.appendChild(lang);
  const tg = variant(C.toggle, { Theme: TH }).createInstance(); tg.rescale(44 / tg.height); prefs.appendChild(tg);
  const cta = primary("Получить консультацию"); bottom.appendChild(cta); cta.layoutSizingHorizontal = "FILL";
  const ms = Fr("HORIZONTAL", { itemSpacing: 12 }); bottom.appendChild(ms); ms.layoutSizingHorizontal = "FILL";
  for (const p of ["Telegram", "WhatsApp"]) { const m = inst(C.msg, { Platform: p }); ms.appendChild(m); m.layoutGrow = 1; }
  const ph = inst(C.msg, { Platform: "Phone" }); bottom.appendChild(ph); ph.layoutSizingHorizontal = "FILL";
  await finish(menu); menuId = menu.id;
}

return { home: home.id, cons: cons.id, menu: menuId, ms: menuId ? await screenshot(await figma.getNodeByIdAsync(menuId), { maxDimension: 1200 }) : null, hs: await screenshot(home, { maxDimension: 3000 }), cs: await screenshot(cons, { maxDimension: 2400 }) };
