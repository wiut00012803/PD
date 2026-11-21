const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
{ const old = pg.children.find(n => n.name === PAGE_NAME); if (old) old.remove(); }
const home = await figma.getNodeByIdAsync("40:3922");
const page = await getPage(); page.x = home.x + home.width + 200; page.y = 0;
const primary = (label, icon = true) => { const b = inst(C.btn, { Style: "Primary", Size: "M", State: "Default" }, { Label: label }); if (icon) b.setProperties({ [pkey(C.btn, "Show icon")]: true }); return b; };

// ===== HERO
const hero = Fr("VERTICAL", { name: "Section · Hero", counterAxisAlignItems: "CENTER", paddingTop: 24, paddingBottom: 96 }); page.appendChild(hero); hero.layoutSizingHorizontal = "FILL"; hero.clipsContent = false;
glowAt(hero, 1000, 480, 120, -300, TH === "Dark" ? 0.3 : 0.26, "color/glow/primary", "Glow · follows cursor");
hero.appendChild(inst(C.header, {}));
const hrow = Fr("HORIZONTAL", { itemSpacing: 64, paddingTop: 88, paddingLeft: 120, paddingRight: 120, counterAxisAlignItems: "CENTER" }); hero.appendChild(hrow); hrow.layoutSizingHorizontal = "FILL";
const hl = Fr("VERTICAL", { itemSpacing: 24 }); hrow.appendChild(hl); hl.layoutGrow = 1;
hl.appendChild(inst(C.btn, { Style: "Ghost", Size: "S", State: "Default" }, { Label: "← На главную" }));
hl.appendChild(inst(C.chip, {}, { Label: "Бесплатно · ответ в течение 24 часов" }));
const h1 = await T("Бесплатная\nконсультация юриста", "Display"); h1.setRangeFills(h1.characters.indexOf("консультация"), h1.characters.length, gradPaint(TH)); hl.appendChild(h1);
hl.appendChild(await T("Расскажите о ситуации — адвокат изучит её, честно оценит шансы и предложит план действий. Без обязательств и скрытых платежей.", "Body/L", "color/text/secondary", 600));
const hb = Fr("HORIZONTAL", { itemSpacing: 12, paddingTop: 8 }); hl.appendChild(hb);
hb.appendChild(primary("Заполнить заявку")); hb.appendChild(inst(C.msg, { Platform: "Telegram" })); hb.appendChild(inst(C.msg, { Platform: "WhatsApp" }));
hl.appendChild(await T("Заявка — Google Form, 2 минуты. Можно сразу написать в мессенджер.", "Body/S", "color/text/tertiary"));
// "what you get" card
const get = glassBox("VERTICAL", { name: "What you get", itemSpacing: 18, paddingTop: 36, paddingBottom: 36, paddingLeft: 36, paddingRight: 36, r: "radius/2xl" }, true); hrow.appendChild(get); get.resize(460, 10); get.counterAxisSizingMode = "FIXED"; get.primaryAxisSizingMode = "AUTO";
get.appendChild(await T("Что вы получите", "Heading/H4"));
for (const t of ["Оценку шансов и рисков по вашему делу", "План действий и сроки", "Ориентир по стоимости — до начала работы", "Ответы на все вопросы простым языком"]) {
  const r = Fr("HORIZONTAL", { itemSpacing: 12, counterAxisAlignItems: "CENTER" }); get.appendChild(r); r.layoutSizingHorizontal = "FILL";
  const d = Fr("HORIZONTAL", { primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" }); d.resize(28, 28); d.primaryAxisSizingMode = "FIXED"; d.counterAxisSizingMode = "FIXED"; rad(d, "radius/full"); d.fills = [paint("color/bg/accent-subtle", TH)]; d.appendChild(ico("ui/check", 16, "color/icon/accent")); r.appendChild(d);
  const tt = await T(t, "Body/M"); r.appendChild(tt); tt.layoutGrow = 1; tt.textAutoResize = "HEIGHT";
}
const div = figma.createRectangle(); div.resize(380, 1); div.fills = [paint("color/border/glass-strong", TH)]; get.appendChild(div); div.layoutSizingHorizontal = "FILL";
const conf = Fr("HORIZONTAL", { itemSpacing: 10, counterAxisAlignItems: "CENTER" }); conf.appendChild(ico("ui/lock", 18, "color/icon/accent")); conf.appendChild(await T("Конфиденциально — адвокатская тайна", "Label", "color/text/secondary")); get.appendChild(conf);
log("hero");

// ===== HOW IT WORKS
const how = section(page, "Как проходит"); how.clipsContent = false;
await sectionTitle(how, "Как проходит", "Четыре простых шага", "От заявки до плана действий — обычно 1–2 дня.");
const steps = Fr("HORIZONTAL", { itemSpacing: 20 }); how.appendChild(steps); steps.layoutSizingHorizontal = "FILL";
for (const [n, k, t, d, time] of [["01", "ui/file-text", "Заявка", "Заполните короткую форму или напишите в Telegram / WhatsApp.", "2 минуты"], ["02", "ui/phone", "Звонок юриста", "Юрист свяжется, уточнит детали и попросит документы, если нужны.", "до 24 часов"], ["03", "ui/scale", "Разбор ситуации", "Онлайн или в офисе: разбираем дело, оцениваем шансы и риски.", "30–40 минут"], ["04", "ui/target", "План действий", "Вы получаете план, сроки и стоимость. Решение — за вами.", "сразу после встречи"]]) {
  const c = glassBox("VERTICAL", { itemSpacing: 14, paddingTop: 28, paddingBottom: 28, paddingLeft: 28, paddingRight: 28 }); steps.appendChild(c); c.layoutGrow = 1; c.layoutAlign = "STRETCH";
  const top = Fr("HORIZONTAL", { primaryAxisAlignItems: "SPACE_BETWEEN", counterAxisAlignItems: "CENTER" }); c.appendChild(top); top.layoutSizingHorizontal = "FILL";
  const num = await T(n, "Stat"); num.fontSize = 40; num.fills = gradPaint(TH); top.appendChild(num);
  const b = inst(C.ib, {}); swapIcon(b, k); top.appendChild(b);
  c.appendChild(await T(t, "Heading/H4"));
  const dd = await T(d, "Body/S", "color/text/secondary"); c.appendChild(dd); dd.layoutSizingHorizontal = "FILL"; dd.textAutoResize = "HEIGHT";
  const tm = Fr("HORIZONTAL", { itemSpacing: 6, counterAxisAlignItems: "CENTER" }); tm.appendChild(ico("ui/clock", 14, "color/icon/secondary")); tm.appendChild(await T(time, "Label", "color/text/secondary")); c.appendChild(tm);
}
log("how");

// ===== TERMS & CONFIDENTIALITY
const terms = section(page, "Сроки", { pt: 0 }); terms.clipsContent = false;
const tr = Fr("HORIZONTAL", { itemSpacing: 20 }); terms.appendChild(tr); tr.layoutSizingHorizontal = "FILL";
for (const [k, t, d] of [["ui/clock", "Ответ в течение 24 часов", "В рабочие дни обычно в течение 2–3 часов. Срочные вопросы — сразу в Telegram или по телефону."], ["ui/lock", "Адвокатская тайна", "Всё, что вы расскажете, защищено законом. Данные не передаются третьим лицам."], ["ui/message-circle", "Удобный формат", "Телефон, Telegram, WhatsApp, видеозвонок или встреча в офисе — как вам удобнее."]]) {
  const c = glassBox("HORIZONTAL", { itemSpacing: 18, paddingTop: 28, paddingBottom: 28, paddingLeft: 28, paddingRight: 28 }); tr.appendChild(c); c.layoutGrow = 1; c.layoutAlign = "STRETCH";
  const b = inst(C.ib, {}); swapIcon(b, k); c.appendChild(b);
  const tx = Fr("VERTICAL", { itemSpacing: 6 }); c.appendChild(tx); tx.layoutGrow = 1;
  tx.appendChild(await T(t, "Heading/H4")); const dd = await T(d, "Body/S", "color/text/secondary"); tx.appendChild(dd); dd.layoutSizingHorizontal = "FILL"; dd.textAutoResize = "HEIGHT";
}
log("terms");

// ===== TOPICS
const tp = section(page, "Вопросы"); tp.clipsContent = false;
const tph = Fr("HORIZONTAL", { primaryAxisAlignItems: "SPACE_BETWEEN", counterAxisAlignItems: "MAX" }); tp.appendChild(tph); tph.layoutSizingHorizontal = "FILL";
const tpt = Fr("VERTICAL", { itemSpacing: 14 }); tph.appendChild(tpt);
tpt.appendChild(await T("С чем приходят", "Overline", "color/text/accent")); tpt.appendChild(await T("С какими вопросами можно обратиться", "Heading/H1"));
tph.appendChild(inst(C.btn, { Style: "Ghost", Size: "M", State: "Default" }, { Label: "Все практики на главной →" }));
const chips = Fr("HORIZONTAL", { itemSpacing: 12, counterAxisSpacing: 12 }); tp.appendChild(chips); chips.layoutWrap = "WRAP"; chips.layoutSizingHorizontal = "FILL";
for (const [k, t] of [["ui/briefcase", "Регистрация и договоры"], ["ui/scale", "Взыскание долгов"], ["ui/file-text", "Налоговые проверки и штрафы"], ["ui/shield-check", "Уголовное преследование"], ["ui/house", "Развод и алименты"], ["ui/users", "Наследство"], ["ui/building-2", "Покупка недвижимости"], ["ui/landmark", "Споры с госорганами"], ["ui/briefcase", "Трудовые споры"], ["ui/award", "Защита прав потребителей"]]) {
  const c = glassBox("HORIZONTAL", { itemSpacing: 10, counterAxisAlignItems: "CENTER", paddingTop: 14, paddingBottom: 14, paddingLeft: 18, paddingRight: 22, r: "radius/full" }, true);
  c.appendChild(ico(k, 20, "color/icon/accent")); c.appendChild(await T(t, "Label")); chips.appendChild(c);
}
log("topics");

// ===== FAQ
const fq = section(page, "FAQ"); fq.clipsContent = false;
const fr = Fr("HORIZONTAL", { itemSpacing: 64 }); fq.appendChild(fr); fr.layoutSizingHorizontal = "FILL";
const fl = Fr("VERTICAL", { itemSpacing: 16 }); fr.appendChild(fl);
fl.appendChild(await T("FAQ", "Overline", "color/text/accent")); fl.appendChild(await T("О консультации", "Heading/H1"));
fl.appendChild(await T("Остались вопросы? Напишите — ответим лично.", "Body/M", "color/text/secondary", 360)); fl.appendChild(inst(C.msg, { Platform: "WhatsApp" }));
const fi = Fr("VERTICAL", { itemSpacing: 12 }); fr.appendChild(fi); fi.layoutGrow = 1;
for (const [q, o] of [["Это правда бесплатно?", true], ["Сколько длится консультация?"], ["Какие документы подготовить?"], ["Можно ли проконсультироваться анонимно?"], ["Что происходит после консультации?"]]) { const f = inst(C.faq, { Open: o ? "True" : "False" }, o ? { Question: q, Answer: "Да. Первая консультация бесплатна и ни к чему вас не обязывает. Если решите работать с нами, стоимость согласуем заранее и зафиксируем в договоре." } : { Question: q }); fi.appendChild(f); f.layoutSizingHorizontal = "FILL"; }
log("faq");

// ===== FINAL CTA
const fc = section(page, "Финальный CTA", { pt: 24 }); fc.clipsContent = false;
const card = glassBox("VERTICAL", { name: "CTA card", itemSpacing: 24, paddingTop: 72, paddingBottom: 72, paddingLeft: 64, paddingRight: 64, counterAxisAlignItems: "CENTER", r: "radius/2xl" }, true); fc.appendChild(card); card.layoutSizingHorizontal = "FILL"; card.clipsContent = true;
glowAt(card, 800, 400, 200, -220, TH === "Dark" ? 0.22 : 0.2);
const ch = await T("Опишите ситуацию —\nответим в течение 24 часов", "Heading/H1"); ch.textAlignHorizontal = "CENTER"; ch.setRangeFills(ch.characters.indexOf("ответим"), ch.characters.length, gradPaint(TH)); card.appendChild(ch);
const cs = await T("Бесплатно, конфиденциально и без обязательств.", "Body/L", "color/text/secondary"); cs.textAlignHorizontal = "CENTER"; card.appendChild(cs);
const cb = Fr("HORIZONTAL", { itemSpacing: 12, paddingTop: 8 }); card.appendChild(cb);
cb.appendChild(primary("Заполнить заявку")); cb.appendChild(inst(C.msg, { Platform: "Telegram" })); cb.appendChild(inst(C.msg, { Platform: "WhatsApp" })); cb.appendChild(inst(C.msg, { Platform: "Phone" }));
log("cta");

// ===== FOOTER + FLOATING (cloned from home)
const ft = home.findOne(n => n.name === "Footer").clone(); page.appendChild(ft); ft.layoutSizingHorizontal = "FILL";
const fab = home.findOne(n => n.name === "Floating messenger").clone(); page.appendChild(fab); fab.layoutPositioning = "ABSOLUTE"; fab.x = PAGE_W - fab.width - 32; fab.y = 900 - fab.height - 32;
await applyGlassStyles(page);
// paint nested icon-box icons with raw accent (bound paints render black inside nested instances)
const c0 = hexRGB(ACCENT_HEX[TH]);
for (const box of page.findAll(x => x.type === "INSTANCE" && x.name === "Icon Box")) { const icon = box.children.find(k => k.type === "INSTANCE"); if (icon) for (const v of icon.findAll(() => true)) { if (["FRAME", "INSTANCE", "GROUP"].includes(v.type)) continue; if (v.strokes && v.strokes.length) v.strokes = [{ type: "SOLID", color: c0 }]; if (Array.isArray(v.fills) && v.fills.length) v.fills = [{ type: "SOLID", color: c0 }]; } }
return { page: page.id, h: page.height, shot: await screenshot(page, { maxDimension: 2400 }) };
