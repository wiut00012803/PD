//@prelude2
const PHOTOS = {};
const TH = "Dark"; const PAGE_NAME = "Desktop 1440 · Тёмная · Главная"; const PAGE_W = 1440;
// Page-building helpers (needs _prelude2). TH / PAGE_NAME / PAGE_W must be defined by the caller.
const C = {};
for (const [k, id] of Object.entries({ header: "35:1932", btn: "35:1724", msg: "35:1757", chip: "35:1830", ib: "35:1843", stat: "35:1975", service: "35:1968", case: "35:1994", review: "35:2021", lawyer: "35:2046", faq: "35:2081", lang: "35:1802", toggle: "35:1821", logoH: "20:104", logoV: "20:157", mark: "20:47" })) C[k] = await figma.getNodeByIdAsync(id);
const KIT = await figma.getNodeByIdAsync("35:1557");
const ICN = Object.fromEntries(KIT.findOne(n => n.name === "Icons").findAll(n => n.type === "COMPONENT").map(c => [c.name.replace("icon/", ""), c]));
const pkey = (set, prefix) => Object.keys(set.componentPropertyDefinitions).find(k => k.startsWith(prefix));
const variant = (set, props) => set.children.find(c => Object.entries(props).every(([k, v]) => c.name.includes(`${k}=${v}`)));
function inst(set, props, texts = {}) { const i = variant(set, { ...props, Theme: TH }).createInstance(); const p = {}; for (const [k, v] of Object.entries(texts)) p[pkey(set, k)] = v; if (Object.keys(p).length) i.setProperties(p); return i; }
function ico(k, size, tok = "color/icon/primary") { const i = ICN[k].createInstance(); if (size !== 24) i.rescale(size / 24); recolor(i, tok, TH); return i; }
// Swap the first nested icon instance named exactly "Icon" (not wrappers like "Icon Box") and recolor it
function swapIcon(instance, k, tok = "color/icon/accent") { const inner = instance.findAll(n => n.type === "INSTANCE" && n.name === "Icon")[0]; if (inner) { inner.swapComponent(ICN[k]); recolor(inner, tok, TH); } return instance; }
function Fr(dir, o = {}) { const f = figma.createFrame(); f.layoutMode = dir; f.primaryAxisSizingMode = "AUTO"; f.counterAxisSizingMode = "AUTO"; f.fills = []; for (const k in o) f[k] = o[k]; return f; }
async function T(s, style, tok = "color/text/primary", w) { const t = await txt(s, style, tok, TH); if (w) { t.resize(w, t.height); t.textAutoResize = "HEIGHT"; } return t; }
function glowAt(parent, w, h, x, y, op = 0.3, tok = "color/glow/primary", name = "Glow") { const e = figma.createEllipse(); e.name = name; e.resize(w, h); e.fills = [{ ...paint(tok, TH), opacity: op }]; e.effects = [{ type: "LAYER_BLUR", radius: Math.max(w, h) / 4, visible: true }]; parent.appendChild(e); e.layoutPositioning = "ABSOLUTE"; e.x = x; e.y = y; return e; }
function imgFill(b64) { return { type: "IMAGE", imageHash: figma.createImage(figma.base64Decode(b64)).hash, scaleMode: "FILL" }; }
async function getPage() {
  const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
  let f = pg.children.find(n => n.name === PAGE_NAME);
  if (!f) { f = Fr("VERTICAL", { name: PAGE_NAME, itemSpacing: 0, counterAxisAlignItems: "CENTER" }); f.resize(PAGE_W, 100); f.counterAxisSizingMode = "FIXED"; f.primaryAxisSizingMode = "AUTO"; f.clipsContent = true; f.fills = [paint("color/bg/page", TH)]; pg.appendChild(f); }
  return f;
}
// Standard section: vertical, centered content column of width CW
function section(page, name, o = {}) {
  const s = Fr("VERTICAL", { name: `Section · ${name}`, itemSpacing: o.gap ?? 48, paddingTop: o.pt ?? 112, paddingBottom: o.pb ?? 112, paddingLeft: o.px ?? 120, paddingRight: o.px ?? 120 });
  page.appendChild(s); s.layoutSizingHorizontal = "FILL"; return s;
}
async function sectionTitle(s, over, title, sub, o = {}) {
  const h = Fr("VERTICAL", { name: "Title", itemSpacing: 14, counterAxisAlignItems: o.center ? "CENTER" : "MIN" }); s.appendChild(h);
  if (o.center) h.layoutSizingHorizontal = "FILL";
  h.appendChild(await T(over, "Overline", "color/text/accent"));
  const t = await T(title, "Heading/H1"); if (o.center) t.textAlignHorizontal = "CENTER"; h.appendChild(t);
  if (sub) { const st = await T(sub, "Body/L", "color/text/secondary", o.subW ?? 720); if (o.center) st.textAlignHorizontal = "CENTER"; h.appendChild(st); }
  return h;
}
function glassBox(dir, o = {}, strong = false) { const b = Fr(dir, o); rad(b, o.r ?? "radius/xl"); glass(b, TH, strong); return b; }

const page = await getPage();
for (const s of [...page.children]) if (["Section · Практики", "Section · Кейсы", "Section · Команда"].includes(s.name)) s.remove();
// tweaks to part 1
const g1 = page.findOne(n => n.name === "Glow · follows cursor"); g1.fills = [{ ...g1.fills[0], opacity: TH === "Dark" ? 0.3 : 0.26 }]; g1.effects = [{ type: "LAYER_BLUR", radius: 220, visible: true }];
const adv = page.findOne(n => n.name === "Advantages"); for (const c of adv.children) c.layoutAlign = "STRETCH";
log("tweaks");

// ===== SERVICES
const svc = section(page, "Практики"); svc.clipsContent = false;
const svHead = Fr("HORIZONTAL", { itemSpacing: 40, counterAxisAlignItems: "MAX", primaryAxisAlignItems: "SPACE_BETWEEN" }); svc.appendChild(svHead); svHead.layoutSizingHorizontal = "FILL";
const svT = Fr("VERTICAL", { itemSpacing: 14 }); svHead.appendChild(svT);
svT.appendChild(await T("Практики", "Overline", "color/text/accent")); svT.appendChild(await T("Чем мы поможем", "Heading/H1"));
svHead.appendChild(await T("Каждое дело ведёт партнёр фирмы — от первой встречи до решения суда. Стоимость согласуем до начала работы.", "Body/M", "color/text/secondary", 420));
const SERV = [["ui/briefcase", "Бизнес-право", "Регистрация и ликвидация компаний, договоры, корпоративные споры, сопровождение сделок."], ["ui/scale", "Гражданские дела", "Взыскание долгов, защита прав потребителей, наследство, споры по договорам."], ["ui/shield-check", "Уголовные дела", "Защита на всех стадиях: допрос, следствие, суд, обжалование приговора."], ["ui/house", "Семейные споры", "Развод, алименты, раздел имущества, определение места жительства детей."], ["ui/file-text", "Налоги и проверки", "Споры с налоговой, сопровождение проверок, обжалование штрафов."], ["ui/building-2", "Недвижимость", "Проверка объектов, сделки, споры с застройщиками, земельные вопросы."]];
for (let r = 0; r < 2; r++) {
  const row = Fr("HORIZONTAL", { itemSpacing: 20 }); svc.appendChild(row); row.layoutSizingHorizontal = "FILL";
  for (const [k, t, d] of SERV.slice(r * 3, r * 3 + 3)) { const c = inst(C.service, {}, { Title: t, Description: d }); swapIcon(c, k); row.appendChild(c); c.layoutGrow = 1; }
}
const svCta = glassBox("HORIZONTAL", { itemSpacing: 24, counterAxisAlignItems: "CENTER", primaryAxisAlignItems: "SPACE_BETWEEN", paddingTop: 24, paddingBottom: 24, paddingLeft: 32, paddingRight: 24, r: "radius/2xl" }, true); svc.appendChild(svCta); svCta.layoutSizingHorizontal = "FILL";
const ctaTxt = Fr("VERTICAL", { itemSpacing: 4 }); svCta.appendChild(ctaTxt);
ctaTxt.appendChild(await T("Не нашли свой вопрос?", "Heading/H4")); ctaTxt.appendChild(await T("Опишите ситуацию — юрист ответит в течение 24 часов и подскажет, как действовать.", "Body/M", "color/text/secondary"));
const b1 = inst(C.btn, { Style: "Primary", Size: "M", State: "Default" }, { Label: "Получить консультацию" }); b1.setProperties({ [pkey(C.btn, "Show icon")]: true }); svCta.appendChild(b1);
log("services");

// ===== CASES
const cs = section(page, "Кейсы"); cs.clipsContent = false;
await sectionTitle(cs, "Успешные дела", "Результаты, а не обещания", "Реальные истории без имён клиентов — с конкретными суммами и итогами.");
const CASES = [
  ["Административное право", "Штраф $50 000 отменён", "Компании выписали штраф $50 000 за нарушение валютного законодательства по итогам проверки.", "Доказали процессуальные нарушения при проверке. Суд признал постановление незаконным, штраф отменён полностью."],
  ["Гражданское право", "Возвращено 380 млн сум", "Поставщик получил предоплату и полгода не исполнял договор, ссылаясь на форс-мажор.", "Собрали доказательства, что форс-мажора не было. Суд взыскал долг, неустойку и судебные расходы."],
  ["Семейное право", "Дети остались с матерью", "Отец пытался через суд определить место жительства детей с ним и запретить выезд за границу.", "Подготовили заключения специалистов и свидетелей. Суд оставил детей с матерью, выезд разрешён."],
  ["Уголовное право", "Дело прекращено на следствии", "Директору предъявили обвинение в растрате средств предприятия.", "Финансовая экспертиза подтвердила законность операций. Уголовное дело прекращено за отсутствием состава."],
];
for (let r = 0; r < 2; r++) {
  const row = Fr("HORIZONTAL", { itemSpacing: 20 }); cs.appendChild(row); row.layoutSizingHorizontal = "FILL";
  for (const [c0, t, s, rr] of CASES.slice(r * 2, r * 2 + 2)) { const c = inst(C.case, {}, { Category: c0, Title: t, Situation: s, Result: rr }); row.appendChild(c); c.layoutGrow = 1; c.layoutAlign = "STRETCH"; }
}
log("cases");

// ===== TEAM
const tm = section(page, "Команда"); tm.clipsContent = false;
await sectionTitle(tm, "Команда", "Адвокаты, которые ведут ваше дело", "Партнёры фирмы лично участвуют в каждом деле. Фото и биографии заменим на реальные.");
const trow = Fr("HORIZONTAL", { itemSpacing: 20 }); tm.appendChild(trow); trow.layoutSizingHorizontal = "FILL";
for (const [role, name, bio] of [["Управляющий партнёр", "Имя Фамилия", "Адвокат с 18-летним опытом. Корпоративные и налоговые споры, сопровождение крупных сделок."], ["Партнёр", "Имя Фамилия", "15 лет в уголовной защите: от следствия до Верховного суда. Бывший следователь."], ["Старший юрист", "Имя Фамилия", "Семейные и гражданские дела. Медиатор, помогает решать споры без суда."]]) {
  const c = inst(C.lawyer, {}, { Role: role, Name: name, Bio: bio }); trow.appendChild(c); c.layoutGrow = 1;
}
log("team");
await applyGlassStyles(page);
return { shot: await screenshot(page, { maxDimension: 2400 }) };
