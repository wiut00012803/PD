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
for (const s of [...page.children]) if (["Section · Отзывы", "Section · Консультация", "Section · FAQ", "Section · Контакты", "Footer", "Floating messenger"].includes(s.name)) s.remove();

// ===== REVIEWS + LOGOS
const rv = section(page, "Отзывы"); rv.clipsContent = false;
await sectionTitle(rv, "Отзывы", "Нам доверяют", "Публикуем отзывы только с согласия клиентов.");
const rrow = Fr("HORIZONTAL", { itemSpacing: 20 }); rv.appendChild(rrow); rrow.layoutSizingHorizontal = "FILL";
for (const [t, i, n, c] of [["Обратились с налоговым спором, который казался безнадёжным. Команда разобралась за неделю и выиграла дело в суде.", "АК", "Азиз Каримов", "Директор, ООО «Пример»"], ["Сопровождали покупку коммерческой недвижимости. Нашли два риска, о которых продавец молчал, — сэкономили нам деньги и нервы.", "НР", "Нигора Расулова", "Учредитель, сеть клиник"], ["Деликатно и быстро помогли с разводом и разделом имущества. Всё объясняли простым языком и всегда были на связи.", "ДС", "Дмитрий С.", "Частный клиент"]]) {
  const r = inst(C.review, {}, { Text: t, Initials: i, Name: n, Company: c }); rrow.appendChild(r); r.layoutGrow = 1; r.layoutAlign = "STRETCH";
}
const logos = Fr("HORIZONTAL", { name: "Client logos", itemSpacing: 16, counterAxisAlignItems: "CENTER" }); rv.appendChild(logos); logos.layoutSizingHorizontal = "FILL";
const lt = await T("Среди клиентов", "Label", "color/text/tertiary"); logos.appendChild(lt);
for (let i = 1; i <= 5; i++) { const l = glassBox("HORIZONTAL", { primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", r: "radius/lg" }); l.resize(200, 64); l.primaryAxisSizingMode = "FIXED"; l.counterAxisSizingMode = "FIXED"; l.appendChild(await T(`Логотип ${i}`, "Label", "color/text/tertiary")); logos.appendChild(l); l.layoutGrow = 1; }
log("reviews");

// ===== FREE CONSULTATION TEASER
const cn = section(page, "Консультация", { pt: 56, pb: 56 }); cn.clipsContent = false;
const card = glassBox("HORIZONTAL", { name: "Consultation card", itemSpacing: 56, paddingTop: 64, paddingBottom: 64, paddingLeft: 64, paddingRight: 64, counterAxisAlignItems: "CENTER", r: "radius/2xl" }, true); cn.appendChild(card); card.layoutSizingHorizontal = "FILL"; card.clipsContent = true;
glowAt(card, 760, 420, 520, -180, TH === "Dark" ? 0.32 : 0.26);
const cl = Fr("VERTICAL", { itemSpacing: 20 }); card.appendChild(cl); cl.layoutGrow = 1;
cl.appendChild(inst(C.chip, {}, { Label: "Бесплатно · онлайн или в офисе" }));
const ch = await T("Бесплатная консультация\nс адвокатом", "Heading/H1"); ch.setRangeFills(ch.characters.indexOf("с адвокатом"), ch.characters.length, gradPaint(TH)); cl.appendChild(ch);
cl.appendChild(await T("Расскажите о ситуации — юрист изучит её, оценит шансы и предложит план действий. Ответ в течение 24 часов, всё конфиденциально.", "Body/L", "color/text/secondary", 520));
const cb = Fr("HORIZONTAL", { itemSpacing: 12, counterAxisAlignItems: "CENTER", paddingTop: 8 }); cl.appendChild(cb);
const b = inst(C.btn, { Style: "Primary", Size: "M", State: "Default" }, { Label: "Записаться на консультацию" }); b.setProperties({ [pkey(C.btn, "Show icon")]: true }); cb.appendChild(b);
cb.appendChild(inst(C.btn, { Style: "Ghost", Size: "M", State: "Default" }, { Label: "Как проходит консультация →" }));
const steps = Fr("VERTICAL", { itemSpacing: 12 }); card.appendChild(steps);
for (const [n, t, d] of [["1", "Заявка", "Форма, Telegram или WhatsApp — 2 минуты"], ["2", "Звонок юриста", "Уточним детали в течение 24 часов"], ["3", "Разбор ситуации", "Оценим шансы и риски"], ["4", "План действий", "Сроки и стоимость — до начала работы"]]) {
  const s = glassBox("HORIZONTAL", { itemSpacing: 16, counterAxisAlignItems: "CENTER", paddingTop: 16, paddingBottom: 16, paddingLeft: 16, paddingRight: 24, r: "radius/lg" }); s.resize(420, 10); s.counterAxisSizingMode = "AUTO"; s.primaryAxisSizingMode = "FIXED";
  const num = Fr("HORIZONTAL", { primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" }); num.resize(40, 40); num.primaryAxisSizingMode = "FIXED"; num.counterAxisSizingMode = "FIXED"; rad(num, "radius/full"); num.fills = [paint("color/bg/accent", TH)]; num.appendChild(await T(n, "Label", "color/text/on-accent"));
  s.appendChild(num); const tx = Fr("VERTICAL", { itemSpacing: 2 }); tx.appendChild(await T(t, "Label")); tx.appendChild(await T(d, "Body/S", "color/text/secondary")); s.appendChild(tx); steps.appendChild(s);
}
log("consult");

// ===== FAQ
const fq = section(page, "FAQ"); fq.clipsContent = false;
const fr = Fr("HORIZONTAL", { itemSpacing: 64 }); fq.appendChild(fr); fr.layoutSizingHorizontal = "FILL";
const fl = Fr("VERTICAL", { itemSpacing: 16 }); fr.appendChild(fl);
fl.appendChild(await T("FAQ", "Overline", "color/text/accent")); fl.appendChild(await T("Частые вопросы", "Heading/H1"));
fl.appendChild(await T("Не нашли ответ? Напишите нам — ответим лично.", "Body/M", "color/text/secondary", 360));
fl.appendChild(inst(C.msg, { Platform: "Telegram" }));
const fitems = Fr("VERTICAL", { itemSpacing: 12 }); fr.appendChild(fitems); fitems.layoutGrow = 1;
const FAQ = [["Сколько стоит консультация?", true], ["Есть ли гарантия результата?"], ["Как быстро вы ответите на заявку?"], ["Можно ли работать удалённо, из другого города?"], ["Как вы защищаете конфиденциальность?"]];
for (const [q, open] of FAQ) { const f = inst(C.faq, { Open: open ? "True" : "False" }, { Question: q }); fitems.appendChild(f); f.layoutSizingHorizontal = "FILL"; }
log("faq");

// ===== CONTACTS
const ct = section(page, "Контакты"); ct.clipsContent = false;
await sectionTitle(ct, "Контакты", "Приходите или напишите", null);
const crow = Fr("HORIZONTAL", { itemSpacing: 20 }); ct.appendChild(crow); crow.layoutSizingHorizontal = "FILL";
const info = glassBox("VERTICAL", { itemSpacing: 24, paddingTop: 40, paddingBottom: 40, paddingLeft: 40, paddingRight: 40, r: "radius/2xl" }); crow.appendChild(info); info.resize(460, 10); info.counterAxisSizingMode = "FIXED"; info.layoutAlign = "STRETCH";
for (const [k, t, d] of [["ui/map-pin", "Адрес", "г. Ташкент, ул. Примерная, 1, офис 101"], ["ui/phone", "Телефон", "+998 00 000-00-00"], ["ui/mail", "Email", "info@pravoedelo.uz"], ["ui/clock", "Часы работы", "Пн–Пт 9:00–19:00, Сб по записи"]]) {
  const r = Fr("HORIZONTAL", { itemSpacing: 16 }); const b0 = inst(C.ib, {}); swapIcon(b0, k); r.appendChild(b0);
  const tx = Fr("VERTICAL", { itemSpacing: 2 }); tx.appendChild(await T(t, "Body/S", "color/text/secondary")); tx.appendChild(await T(d, "Label")); r.appendChild(tx); info.appendChild(r);
}
const ib2 = Fr("HORIZONTAL", { itemSpacing: 10, paddingTop: 8 }); info.appendChild(ib2); ib2.layoutWrap = "WRAP"; ib2.layoutSizingHorizontal = "FILL"; ib2.counterAxisSpacing = 10;
ib2.appendChild(inst(C.msg, { Platform: "Telegram" })); ib2.appendChild(inst(C.msg, { Platform: "WhatsApp" }));
const bb2 = inst(C.btn, { Style: "Primary", Size: "M", State: "Default" }, { Label: "Получить консультацию" }); info.appendChild(bb2); bb2.layoutSizingHorizontal = "FILL";
// map placeholder
const map = Fr("VERTICAL", { name: "Map", primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", itemSpacing: 12 }); crow.appendChild(map); map.layoutGrow = 1; map.layoutAlign = "STRETCH"; rad(map, "radius/2xl"); map.clipsContent = true;
map.fills = [paint(TH === "Dark" ? "color/bg/subtle" : "color/bg/muted", TH)]; map.strokes = [paint("color/border/glass-strong", TH)]; map.strokeWeight = 1;
for (let i = 0; i < 9; i++) { const l = figma.createRectangle(); l.resize(2000, 1); l.fills = [paint("color/border/glass", TH)]; map.appendChild(l); l.layoutPositioning = "ABSOLUTE"; l.x = -200; l.y = 60 * i + 20; l.rotation = i % 2 ? 8 : -6; }
for (let i = 0; i < 9; i++) { const l = figma.createRectangle(); l.resize(1, 1200); l.fills = [paint("color/border/glass", TH)]; map.appendChild(l); l.layoutPositioning = "ABSOLUTE"; l.x = 90 * i + 30; l.y = -200; l.rotation = 10; }
const pin = Fr("HORIZONTAL", { primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" }); pin.resize(64, 64); pin.primaryAxisSizingMode = "FIXED"; pin.counterAxisSizingMode = "FIXED"; rad(pin, "radius/full"); pin.fills = [paint("color/bg/accent", TH)]; pin.appendChild(ico("ui/map-pin", 28, "color/text/on-accent")); map.appendChild(pin);
const mp = glassBox("VERTICAL", { name: "Glass plate", itemSpacing: 2, paddingTop: 10, paddingBottom: 10, paddingLeft: 16, paddingRight: 16, r: "radius/lg" }, true); mp.appendChild(await T("Pravoe Delo", "Label")); mp.appendChild(await T("Google Maps · встроенная карта", "Body/S", "color/text/secondary")); map.appendChild(mp);
log("contacts");

// ===== FOOTER
const ft = Fr("VERTICAL", { name: "Footer", itemSpacing: 40, paddingTop: 64, paddingBottom: 40, paddingLeft: 120, paddingRight: 120 }); page.appendChild(ft); ft.layoutSizingHorizontal = "FILL";
ft.strokes = [paint("color/border/glass", TH)]; ft.strokeTopWeight = 1; ft.strokeBottomWeight = 0; ft.strokeLeftWeight = 0; ft.strokeRightWeight = 0;
const ftr = Fr("HORIZONTAL", { itemSpacing: 64, primaryAxisAlignItems: "SPACE_BETWEEN" }); ft.appendChild(ftr); ftr.layoutSizingHorizontal = "FILL";
const brand = Fr("VERTICAL", { itemSpacing: 16 }); ftr.appendChild(brand);
const lg = variant(C.logoH, { Color: TH === "Dark" ? "Inverse" : "Primary" }).createInstance(); brand.appendChild(lg);
brand.appendChild(await T("Адвокатская фирма. Защищаем бизнес и людей с 2010 года.", "Body/S", "color/text/secondary", 300));
const soc = Fr("HORIZONTAL", { itemSpacing: 10 }); brand.appendChild(soc);
for (const k of ["social/telegram", "social/instagram", "social/facebook", "social/youtube", "social/whatsapp"]) { const s = glassBox("HORIZONTAL", { primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", r: "radius/full" }, true); s.resize(44, 44); s.primaryAxisSizingMode = "FIXED"; s.counterAxisSizingMode = "FIXED"; s.appendChild(ico(k, 20)); soc.appendChild(s); }
for (const [h, items] of [["Разделы", ["Услуги", "О нас", "Кейсы", "Команда", "FAQ"]], ["Клиентам", ["Бесплатная консультация", "Отзывы", "Контакты", "Политика конфиденциальности"]], ["Связь", ["+998 00 000-00-00", "info@pravoedelo.uz", "Telegram · WhatsApp"]]]) {
  const c = Fr("VERTICAL", { itemSpacing: 12 }); c.appendChild(await T(h, "Label")); for (const it of items) c.appendChild(await T(it, "Body/S", "color/text/secondary")); ftr.appendChild(c);
}
const fb = Fr("HORIZONTAL", { primaryAxisAlignItems: "SPACE_BETWEEN" }); ft.appendChild(fb); fb.layoutSizingHorizontal = "FILL";
fb.appendChild(await T("© 2026 Pravoe Delo. Все права защищены.", "Body/S", "color/text/tertiary"));
fb.appendChild(await T("RU · UZ · EN", "Body/S", "color/text/tertiary"));
log("footer");

// ===== FLOATING MESSENGER (fixed, bottom-right of viewport)
const fab = glassBox("HORIZONTAL", { name: "Floating messenger", itemSpacing: 6, paddingTop: 6, paddingBottom: 6, paddingLeft: 6, paddingRight: 6, r: "radius/full" }, true);
for (const [k, bg] of [["social/telegram", "#2AABEE"], ["social/whatsapp", "#25D366"]]) { const c = Fr("HORIZONTAL", { primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" }); c.resize(48, 48); c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "FIXED"; rad(c, "radius/full"); c.fills = [paint("color/bg/accent", TH)]; c.appendChild(ico(k, 22, "color/text/on-accent")); fab.appendChild(c); }
page.appendChild(fab); fab.layoutPositioning = "ABSOLUTE"; fab.x = PAGE_W - fab.width - 32; fab.y = 900 - fab.height - 32;
log("fab");
await applyGlassStyles(page);
const sects = page.children.filter(n => ["Section · Отзывы", "Section · Консультация", "Section · FAQ", "Section · Контакты", "Footer"].includes(n.name));
return { h: page.height, shot: await screenshot(page, { maxDimension: 3000 }) };
