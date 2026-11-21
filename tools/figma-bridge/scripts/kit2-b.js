//@prelude2
const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
const kit = await figma.getNodeByIdAsync("35:1557");
for (const s of [...kit.children]) if (["Section / Header", "Section / Cards", "Section / FAQ Item"].includes(s.name)) s.remove();
const [btnSet, langSet, tgSet, ibSet, hSet] = await Promise.all(["35:1724", "35:1802", "35:1821", "35:1843", "20:104"].map(id => figma.getNodeByIdAsync(id)));
const v = (set, name) => set.children.find(c => c.name === name);
const IC = Object.fromEntries(kit.findOne(n => n.name === "Icons").findAll(n => n.type === "COMPONENT").map(c => [c.name.replace("icon/", ""), c]));
function icon(k, size, colorName, th) { const i = IC[k].createInstance(); if (size !== 24) i.rescale(size / 24); recolor(i, colorName, th); return i; }
const btnKeys = btnSet.componentPropertyDefinitions; const kLabel = Object.keys(btnKeys).find(k => k.startsWith("Label"));
async function section(title) { const s = figma.createFrame(); s.name = `Section / ${title}`; s.layoutMode = "VERTICAL"; s.primaryAxisSizingMode = "AUTO"; s.counterAxisSizingMode = "AUTO"; s.fills = []; s.itemSpacing = 20; s.appendChild(await txt(title, "Heading/H3", "color/text/primary", "Light")); kit.appendChild(s); return s; }
function card(name, w, th) { const c = figma.createComponent(); c.name = name; c.layoutMode = "VERTICAL"; c.resize(w, 100); c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "FIXED"; rad(c, "radius/xl"); glass(c, th); return c; }
function spacer(parent) { const g = figma.createFrame(); g.name = "Spacer"; g.fills = []; g.layoutMode = "VERTICAL"; parent.appendChild(g); g.layoutGrow = 1; g.resize(1, 1); return g; }
const ids = {};

// ---- Header (floating pill)
{
  const comps = [];
  for (const th of ["Light", "Dark"]) {
    const c = figma.createComponent(); c.name = `Theme=${th}`; c.layoutMode = "HORIZONTAL"; c.resize(1100, 60); c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "FIXED";
    c.primaryAxisAlignItems = "SPACE_BETWEEN"; c.counterAxisAlignItems = "CENTER"; c.paddingLeft = 24; c.paddingRight = 10; rad(c, "radius/full"); glass(c, th);
    const lg = v(hSet, th === "Light" ? "Color=Primary" : "Color=Inverse").createInstance(); lg.rescale(34 / lg.height); c.appendChild(lg);
    const links = figma.createFrame(); links.name = "Links"; links.layoutMode = "HORIZONTAL"; links.primaryAxisSizingMode = "AUTO"; links.counterAxisSizingMode = "AUTO"; links.fills = []; links.itemSpacing = 28;
    for (const l of ["Услуги", "О нас", "Команда", "Кейсы", "Контакты"]) links.appendChild(await txt(l, "Label", "color/text/secondary", th));
    c.appendChild(links);
    const right = figma.createFrame(); right.name = "Actions"; right.layoutMode = "HORIZONTAL"; right.primaryAxisSizingMode = "AUTO"; right.counterAxisSizingMode = "AUTO"; right.fills = []; right.itemSpacing = 10; right.counterAxisAlignItems = "CENTER";
    right.appendChild(v(langSet, `Active=RU, Theme=${th}`).createInstance());
    right.appendChild(v(tgSet, `Theme=${th}`).createInstance());
    const b = v(btnSet, `Style=Primary, Size=S, State=Default, Theme=${th}`).createInstance(); b.setProperties({ [kLabel]: "Консультация" }); right.appendChild(b);
    c.appendChild(right); comps.push(c);
  }
  const s = await section("Header");
  const set = figma.combineAsVariants(comps, s); set.name = "Header"; set.description = "Плавающая шапка-капсула (матовое стекло, sticky). Логотип, навигация, языки, переключатель темы, CTA. На мобильных — логотип + меню-бургер.";
  themeLayout(set, 1); ids.header = set.id;
}

const sCards = await section("Cards");
const row = figma.createFrame(); row.name = "Card sets"; row.layoutMode = "VERTICAL"; row.primaryAxisSizingMode = "AUTO"; row.counterAxisSizingMode = "AUTO"; row.fills = []; row.itemSpacing = 40; sCards.appendChild(row);

// ---- Service Card
{
  const comps = [], refs = [];
  for (const th of ["Light", "Dark"]) {
    const c = card(`Theme=${th}`, 384, th); c.minHeight = 340; pad(c, "spacing/xl", "spacing/xl"); gap(c, "spacing/sm");
    const ib = v(ibSet, `Theme=${th}`).createInstance(); ib.name = "Icon Box"; c.appendChild(ib);
    const sp0 = figma.createFrame(); sp0.fills = []; sp0.resize(1, 8); c.appendChild(sp0);
    const t = await txt("Бизнес-право", "Heading/H4", "color/text/primary", th); wrapFill(c, t);
    const d = await txt("Регистрация и ликвидация компаний, договоры, корпоративные и налоговые споры.", "Body/S", "color/text/secondary", th); wrapFill(c, d);
    spacer(c);
    const l = v(btnSet, `Style=Ghost, Size=S, State=Default, Theme=${th}`).createInstance(); l.setProperties({ [kLabel]: "Подробнее" }); c.appendChild(l);
    comps.push(c); refs.push({ t, d, ib });
  }
  const set = figma.combineAsVariants(comps, row); set.name = "Service Card"; set.description = "Карточка практики: иконка, название, описание, ссылка. Hover на сайте: граница glass-strong и подъём на 2px.";
  const kT = set.addComponentProperty("Title", "TEXT", "Бизнес-право"), kD = set.addComponentProperty("Description", "TEXT", "Регистрация и ликвидация компаний, договоры, корпоративные и налоговые споры.");
  for (const { t, d, ib } of refs) { t.componentPropertyReferences = { characters: kT }; d.componentPropertyReferences = { characters: kD }; ib.isExposedInstance = true; }
  themeLayout(set, 1); ids.service = set.id;
}
// ---- Stat Card
{
  const comps = [], refs = [];
  for (const th of ["Light", "Dark"]) {
    const c = card(`Theme=${th}`, 300, th); c.paddingTop = 22; c.paddingBottom = 22; c.paddingLeft = c.paddingRight = 24; gap(c, "spacing/2xs");
    const val = await txt("1 200+", "Stat", "color/text/primary", th); val.fontSize = 44; c.appendChild(val);
    const cap = await txt("выигранных дел", "Body/S", "color/text/secondary", th); c.appendChild(cap); comps.push(c); refs.push({ val, cap });
  }
  const set = figma.combineAsVariants(comps, row); set.name = "Stat Card"; set.description = "Цифра-достижение в стеклянной карточке.";
  const kV = set.addComponentProperty("Value", "TEXT", "1 200+"), kC = set.addComponentProperty("Caption", "TEXT", "выигранных дел");
  for (const { val, cap } of refs) { val.componentPropertyReferences = { characters: kV }; cap.componentPropertyReferences = { characters: kC }; }
  themeLayout(set, 1); ids.stat = set.id;
}
// ---- Case Card
{
  const comps = [], refs = [];
  for (const th of ["Light", "Dark"]) {
    const c = card(`Theme=${th}`, 588, th); pad(c, "spacing/xl", "spacing/xl"); gap(c, "spacing/md");
    const cat = await txt("Административное право", "Overline", "color/text/accent", th); wrapFill(c, cat);
    const title = await txt("Штраф $50 000 отменён", "Heading/H3", "color/text/primary", th); wrapFill(c, title);
    const blocks = {};
    for (const [lbl, body] of [["Ситуация", "Компании выписали штраф $50 000 за нарушение валютного законодательства по итогам проверки."], ["Результат", "Доказали процессуальные нарушения при проверке. Суд признал постановление незаконным, штраф отменён полностью."]]) {
      const b = figma.createFrame(); b.name = lbl; b.layoutMode = "VERTICAL"; b.primaryAxisSizingMode = "AUTO"; b.fills = []; b.itemSpacing = 4; c.appendChild(b); b.layoutSizingHorizontal = "FILL";
      b.appendChild(await txt(lbl, "Label", "color/text/primary", th)); blocks[lbl] = await txt(body, "Body/S", "color/text/secondary", th); wrapFill(b, blocks[lbl]);
    }
    comps.push(c); refs.push({ cat, title, s: blocks["Ситуация"], r: blocks["Результат"] });
  }
  const set = figma.combineAsVariants(comps, row); set.name = "Case Card"; set.description = "Кейс без имён клиентов, но с конкретными деталями.";
  const k = { c: set.addComponentProperty("Category", "TEXT", "Административное право"), t: set.addComponentProperty("Title", "TEXT", "Штраф $50 000 отменён"), s: set.addComponentProperty("Situation", "TEXT", refs[0].s.characters), r: set.addComponentProperty("Result", "TEXT", refs[0].r.characters) };
  for (const x of refs) { x.cat.componentPropertyReferences = { characters: k.c }; x.title.componentPropertyReferences = { characters: k.t }; x.s.componentPropertyReferences = { characters: k.s }; x.r.componentPropertyReferences = { characters: k.r }; }
  themeLayout(set, 1); ids.case = set.id;
}
// ---- Review Card
{
  const comps = [], refs = [];
  for (const th of ["Light", "Dark"]) {
    const c = card(`Theme=${th}`, 384, th); pad(c, "spacing/xl", "spacing/xl"); gap(c, "spacing/md");
    c.appendChild(icon("ui/quote", 28, "color/icon/accent", th));
    const text = await txt("Обратились с налоговым спором, который казался безнадёжным. Команда разобралась за неделю и выиграла дело в суде.", "Body/M", "color/text/primary", th); wrapFill(c, text);
    const div = figma.createRectangle(); div.name = "Divider"; div.resize(320, 1); div.fills = [paint("color/border/glass-strong", th)]; c.appendChild(div); div.layoutSizingHorizontal = "FILL";
    const who = figma.createFrame(); who.name = "Author"; who.layoutMode = "HORIZONTAL"; who.primaryAxisSizingMode = "AUTO"; who.counterAxisSizingMode = "AUTO"; who.fills = []; who.itemSpacing = 12; who.counterAxisAlignItems = "CENTER"; c.appendChild(who);
    const av = figma.createFrame(); av.name = "Avatar"; av.layoutMode = "HORIZONTAL"; av.resize(40, 40); av.primaryAxisSizingMode = "FIXED"; av.counterAxisSizingMode = "FIXED"; av.primaryAxisAlignItems = "CENTER"; av.counterAxisAlignItems = "CENTER"; rad(av, "radius/full"); av.fills = [paint("color/bg/accent-subtle", th)];
    const ini = await txt("АК", "Label", "color/text/accent", th); av.appendChild(ini); who.appendChild(av);
    const nm = figma.createFrame(); nm.layoutMode = "VERTICAL"; nm.primaryAxisSizingMode = "AUTO"; nm.counterAxisSizingMode = "AUTO"; nm.fills = []; nm.itemSpacing = 2; who.appendChild(nm);
    const name = await txt("Азиз Каримов", "Label", "color/text/primary", th); const co = await txt("Директор, ООО «Пример»", "Body/S", "color/text/secondary", th); nm.appendChild(name); nm.appendChild(co);
    comps.push(c); refs.push({ text, ini, name, co });
  }
  const set = figma.combineAsVariants(comps, row); set.name = "Review Card"; set.description = "Отзыв клиента с именем и компанией (только с согласия клиента).";
  const k = { t: set.addComponentProperty("Text", "TEXT", refs[0].text.characters), i: set.addComponentProperty("Initials", "TEXT", "АК"), n: set.addComponentProperty("Name", "TEXT", "Азиз Каримов"), c: set.addComponentProperty("Company", "TEXT", "Директор, ООО «Пример»") };
  for (const x of refs) { x.text.componentPropertyReferences = { characters: k.t }; x.ini.componentPropertyReferences = { characters: k.i }; x.name.componentPropertyReferences = { characters: k.n }; x.co.componentPropertyReferences = { characters: k.c }; }
  themeLayout(set, 1); ids.review = set.id;
}
// ---- Lawyer Card
{
  const comps = [], refs = [];
  for (const th of ["Light", "Dark"]) {
    const c = card(`Theme=${th}`, 384, th); c.paddingTop = c.paddingLeft = c.paddingRight = 10; c.paddingBottom = 28; gap(c, "spacing/md");
    const ph = figma.createFrame(); ph.name = "Photo"; ph.layoutMode = "HORIZONTAL"; ph.resize(364, 400); ph.primaryAxisSizingMode = "FIXED"; ph.counterAxisSizingMode = "FIXED"; ph.primaryAxisAlignItems = "CENTER"; ph.counterAxisAlignItems = "CENTER"; rad(ph, "radius/lg"); ph.fills = [paint("color/bg/muted", th)];
    ph.appendChild(icon("ui/users", 44, "color/icon/secondary", th)); c.appendChild(ph); ph.layoutSizingHorizontal = "FILL";
    const txtBox = figma.createFrame(); txtBox.name = "Text"; txtBox.layoutMode = "VERTICAL"; txtBox.primaryAxisSizingMode = "AUTO"; txtBox.fills = []; txtBox.itemSpacing = 8; txtBox.paddingLeft = txtBox.paddingRight = 18; c.appendChild(txtBox); txtBox.layoutSizingHorizontal = "FILL";
    const role = await txt("Управляющий партнёр", "Overline", "color/text/accent", th); wrapFill(txtBox, role);
    const name = await txt("Имя Фамилия", "Heading/H4", "color/text/primary", th); wrapFill(txtBox, name);
    const bio = await txt("Адвокат с 15-летним опытом. Корпоративные и налоговые споры. Член Палаты адвокатов Республики Узбекистан.", "Body/S", "color/text/secondary", th); wrapFill(txtBox, bio);
    comps.push(c); refs.push({ role, name, bio });
  }
  const set = figma.combineAsVariants(comps, row); set.name = "Lawyer Card"; set.description = "Карточка юриста: фото (Photo — заменить заливкой-изображением), должность, имя, биография.";
  const k = { r: set.addComponentProperty("Role", "TEXT", "Управляющий партнёр"), n: set.addComponentProperty("Name", "TEXT", "Имя Фамилия"), b: set.addComponentProperty("Bio", "TEXT", refs[0].bio.characters) };
  for (const x of refs) { x.role.componentPropertyReferences = { characters: k.r }; x.name.componentPropertyReferences = { characters: k.n }; x.bio.componentPropertyReferences = { characters: k.b }; }
  themeLayout(set, 1); ids.lawyer = set.id;
}
// ---- FAQ Item
{
  const comps = [], refs = [];
  for (const th of ["Light", "Dark"]) for (const open of ["False", "True"]) {
    const c = card(`Open=${open}, Theme=${th}`, 720, th); rad(c, "radius/lg"); c.paddingTop = c.paddingBottom = 22; c.paddingLeft = 28; c.paddingRight = 18; gap(c, "spacing/sm");
    const r = figma.createFrame(); r.name = "Question row"; r.layoutMode = "HORIZONTAL"; r.primaryAxisSizingMode = "FIXED"; r.counterAxisSizingMode = "AUTO"; r.fills = []; r.itemSpacing = 20; r.counterAxisAlignItems = "CENTER"; c.appendChild(r); r.layoutSizingHorizontal = "FILL";
    const q = await txt("Сколько стоит консультация?", "Heading/H4", "color/text/primary", th); q.fontSize = 18; r.appendChild(q); q.layoutGrow = 1; q.textAutoResize = "HEIGHT";
    const tg = figma.createFrame(); tg.name = "Toggle"; tg.layoutMode = "HORIZONTAL"; tg.resize(34, 34); tg.primaryAxisSizingMode = "FIXED"; tg.counterAxisSizingMode = "FIXED"; tg.primaryAxisAlignItems = "CENTER"; tg.counterAxisAlignItems = "CENTER"; rad(tg, "radius/full");
    tg.fills = [paint(open === "True" ? "color/bg/accent" : "color/surface/glass-strong", th)]; if (open !== "True") { tg.strokes = [paint("color/border/glass", th)]; tg.strokeWeight = 1; }
    tg.appendChild(icon(open === "True" ? "ui/minus" : "ui/plus", 18, open === "True" ? "color/text/on-accent" : "color/icon/primary", th)); r.appendChild(tg);
    let a = null; if (open === "True") { a = await txt("Первая онлайн-консультация бесплатна. Стоимость дальнейшей работы зависит от сложности дела и согласуется до подписания договора — без скрытых платежей.", "Body/M", "color/text/secondary", th); wrapFill(c, a); a.resize(620, a.height); a.layoutSizingHorizontal = "FIXED"; }
    comps.push(c); refs.push({ q, a });
  }
  const s = await section("FAQ Item");
  const set = figma.combineAsVariants(comps, s); set.name = "FAQ Item"; set.description = "Аккордеон FAQ (на сайте <details>/<summary>).";
  const kQ = set.addComponentProperty("Question", "TEXT", "Сколько стоит консультация?"), kA = set.addComponentProperty("Answer", "TEXT", refs[1].a.characters);
  for (const { q, a } of refs) { q.componentPropertyReferences = { characters: kQ }; if (a) a.componentPropertyReferences = { characters: kA }; }
  themeLayout(set, 1); ids.faq = set.id;
}
const shotA = await screenshot(kit.children.find(n => n.name === "Section / Header"), { maxDimension: 1600 });
const shotB = await screenshot(sCards, { maxDimension: 1800 });
const shotC = await screenshot(kit.children.find(n => n.name === "Section / FAQ Item"), { maxDimension: 1400 });
return { ids, shotA, shotB, shotC };
