const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
const bb = await figma.getNodeByIdAsync("31:71");
for (const c of [...bb.children]) if (/^0[678] ·/.test(c.name)) c.remove();
const imgFill = key => [{ type: "IMAGE", imageHash: figma.createImage(figma.base64Decode(PHOTOS[key])).hash, scaleMode: "FILL" }];
const kit = await figma.getNodeByIdAsync("26:169");
const comp = name => kit.findOne(n => (n.type === "COMPONENT_SET" || n.type === "COMPONENT") && n.name === name);
const [btnSet, msgSet, langSet, faqSet, svcSet, statSet, lawyer, caseCard, review] = ["Button","Messenger Button","Lang Switcher","FAQ Item","Service Card","Stat","Lawyer Card","Case Card","Review Card"].map(comp);
const iconComp = k => kit.findOne(n => n.type === "COMPONENT" && n.name === `icon/${k}`);

function sheet(name, bgVar = "color/bg/page") { const s = figma.createFrame(); s.name = name; s.layoutMode = "VERTICAL"; s.resize(1440, 100); s.primaryAxisSizingMode = "AUTO"; s.counterAxisSizingMode = "FIXED"; s.paddingTop = s.paddingBottom = 96; s.paddingLeft = s.paddingRight = 120; s.itemSpacing = 56; s.fills = [paint(bgVar)]; bb.appendChild(s); return s; }
async function header(s, num, title, lead) { const h = al("VERTICAL", { name: "Header", itemSpacing: 16 }); s.appendChild(h); h.appendChild(await txt(`${num} — ${title.toUpperCase()}`, "Overline", "color/text/accent")); h.appendChild(await txt(title, "Heading/H1", "color/text/primary")); if (lead) wrapW(h, await txt(lead, "Body/L", "color/text/secondary"), 820); return h; }
async function sub(s, title) { const t = await txt(title, "Heading/H3", "color/text/primary"); s.appendChild(t); return t; }
function photo(key, w, h, name) { const r = figma.createRectangle(); r.name = name || `Photo / ${key}`; r.resize(w, h); r.fills = imgFill(key); rad(r, "radius/sm"); return r; }
async function photoItem(key, w, h, caption) { const c = al("VERTICAL", { itemSpacing: 10 }); c.appendChild(photo(key, w, h)); wrapW(c, await txt(caption, "Body/S", "color/text/secondary"), w); return c; }
async function list(parent, title, items, ok) {
  const col = al("VERTICAL", { itemSpacing: 12, name: title }); col.resize(588, 10); col.counterAxisSizingMode = "FIXED"; col.primaryAxisSizingMode = "AUTO"; parent.appendChild(col);
  col.appendChild(await txt(title, "Heading/H4", "color/text/primary"));
  for (const it of items) {
    const row = al("HORIZONTAL", { itemSpacing: 12 }); col.appendChild(row); row.layoutSizingHorizontal = "FILL";
    const i = iconComp(ok ? "ui/check" : "ui/x").createInstance(); i.rescale(20 / 24); recolor(i, ok ? "color/icon/accent" : "color/text/error"); row.appendChild(i);
    const t = await txt(it, "Body/M", "color/text/secondary"); row.appendChild(t); t.layoutGrow = 1; t.textAutoResize = "HEIGHT";
  }
  return col;
}

// ===== 06 PHOTO & ICONS
const s6 = sheet("06 · Фото и иконки");
await header(s6, "06", "Фотографии и иконки", "Фотографии документальные и спокойные: естественный свет, реальные люди и детали работы — документы, руки, переговоры, архитектура. Никаких молотков, весов и постановочных улыбок. Ниже — референсы стиля (CC0, Wikimedia Commons / StockSnap / Rawpixel); на сайте их заменят собственные фото команды и офиса.");
const pr1 = al("HORIZONTAL", { itemSpacing: 24, name: "Photos row 1" }); s6.appendChild(pr1);
pr1.appendChild(await photoItem("library", 792, 440, "Интерьеры и архитектура: классические детали, тёплый свет, глубина."));
pr1.appendChild(await photoItem("handshake", 384, 440, "Люди в работе: со спины или вполоборота, внимание на действии."));
const pr2 = al("HORIZONTAL", { itemSpacing: 24, name: "Photos row 2" }); s6.appendChild(pr2);
pr2.appendChild(await photoItem("work", 588, 320, "Консультация: детали рук, документов, рабочего стола."));
pr2.appendChild(await photoItem("docs", 588, 320, "Документы: мягкий фокус, приглушённые тона, без читаемых персональных данных."));
// overlay example
await sub(s6, "Фото на тёмных секциях");
const hero = figma.createFrame(); hero.name = "Overlay example"; hero.resize(1200, 360); hero.fills = imgFill("library"); rad(hero, "radius/sm"); hero.clipsContent = true; s6.appendChild(hero);
const ov = figma.createRectangle(); ov.resize(1200, 360); ov.fills = [paint("color/bg/inverse")]; ov.opacity = 0.78; hero.appendChild(ov);
const heroText = al("VERTICAL", { itemSpacing: 16 }); hero.appendChild(heroText); heroText.x = 64; heroText.y = 96;
heroText.appendChild(await txt("Наложение тёмно-синего 75–80%", "Overline", "color/bg/accent"));
heroText.appendChild(await txt("Защищаем то, что вам дорого", "Heading/H1", "color/text/on-inverse"));
wrapW(heroText, await txt("На тёмном фоне фото всегда затемняется тёмно-синим, чтобы текст читался, а палитра оставалась единой.", "Body/M", "color/text/on-inverse-muted"), 560);
const dd = al("HORIZONTAL", { itemSpacing: 24, name: "Do / Don't" }); s6.appendChild(dd);
await list(dd, "Так", ["Естественный свет, тёплые нейтральные тона", "Реальные люди и детали: руки, документы, переговоры", "Архитектура с колоннами и классическими деталями", "Портреты команды — в одном стиле, на нейтральном фоне"], true);
await list(dd, "Не так", ["Молоток судьи, весы Фемиды и другие клише", "Постановочные стоковые улыбки и рукопожатия на белом фоне", "Яркие насыщенные фильтры, сильная обработка", "Фото с Pinterest без лицензии — нарушение авторских прав"], false);
// icons
await sub(s6, "Иконки");
wrapW(s6, await txt("Набор Lucide (лицензия ISC): линейные иконки, обводка 1.5 px, сетка 24 px, скруглённые концы. Цвет — тёмно-синий или охра. Иконки соцсетей — Simple Icons (CC0), только в монохроме. Все иконки — компоненты icon/ui/* и icon/social/* в UI Kit.", "Body/M", "color/text/secondary"), 820);
const ig = al("HORIZONTAL", { name: "Icon grid", itemSpacing: 16, counterAxisSpacing: 16 }); ig.layoutWrap = "WRAP"; ig.primaryAxisSizingMode = "FIXED"; ig.resize(1200, 10); s6.appendChild(ig);
const showIcons = ["ui/briefcase","ui/users","ui/house","ui/shield-check","ui/file-text","ui/landmark","ui/building-2","ui/lock","ui/award","ui/clock","ui/phone","ui/mail","ui/map-pin","ui/message-circle","social/telegram","social/whatsapp","social/instagram","social/facebook","social/youtube","ui/arrow-right"];
for (const k of showIcons) {
  const cell = al("VERTICAL", { itemSpacing: 10, counterAxisAlignItems: "CENTER", primaryAxisAlignItems: "CENTER" }); cell.resize(104, 104); cell.primaryAxisSizingMode = "FIXED"; cell.counterAxisSizingMode = "FIXED"; cell.fills = [paint("color/bg/subtle")]; rad(cell, "radius/sm");
  const i = iconComp(k).createInstance(); i.rescale(32 / 24); if (["ui/shield-check","ui/award"].includes(k)) recolor(i, "color/icon/accent"); cell.appendChild(i);
  cell.appendChild(await txt(k.split("/")[1], "Body/S", "color/text/tertiary")); ig.appendChild(cell);
}

// ===== 07 UI
const s7 = sheet("07 · UI-элементы");
await header(s7, "07", "Элементы интерфейса", "Компоненты сайта собраны в UI Kit на этой же странице и привязаны к переменным цвета и отступов. Главное действие на сайте — «Получить консультацию» (кнопка Primary, ведёт на Google Form); рядом всегда быстрые контакты Telegram и WhatsApp.");
const light = al("HORIZONTAL", { name: "On light", itemSpacing: 16, counterAxisAlignItems: "CENTER", paddingTop: 40, paddingBottom: 40, paddingLeft: 40, paddingRight: 40 }); s7.appendChild(light); light.layoutSizingHorizontal = "FILL"; light.fills = [paint("color/bg/subtle")]; rad(light, "radius/sm");
light.appendChild(variant(btnSet, "Style=Primary, State=Default").createInstance());
light.appendChild(variant(btnSet, "Style=Secondary, State=Default").createInstance());
light.appendChild(variant(msgSet, "Platform=Telegram, Theme=Light").createInstance());
light.appendChild(variant(msgSet, "Platform=WhatsApp, Theme=Light").createInstance());
light.appendChild(variant(langSet, "Active=RU, Theme=Light").createInstance());
const dark = al("HORIZONTAL", { name: "On dark", itemSpacing: 16, counterAxisAlignItems: "CENTER", paddingTop: 40, paddingBottom: 40, paddingLeft: 40, paddingRight: 40 }); s7.appendChild(dark); dark.layoutSizingHorizontal = "FILL"; dark.fills = [paint("color/bg/inverse")]; rad(dark, "radius/sm");
dark.appendChild(variant(btnSet, "Style=Primary, State=Default").createInstance());
dark.appendChild(variant(btnSet, "Style=Secondary Inverse, State=Default").createInstance());
dark.appendChild(variant(msgSet, "Platform=Telegram, Theme=Dark").createInstance());
dark.appendChild(variant(msgSet, "Platform=WhatsApp, Theme=Dark").createInstance());
dark.appendChild(variant(langSet, "Active=UZ, Theme=Dark").createInstance());
const cards = al("HORIZONTAL", { name: "Cards", itemSpacing: 24 }); s7.appendChild(cards);
cards.appendChild(variant(svcSet, "State=Default").createInstance());
cards.appendChild(review.createInstance());
const lw = lawyer.createInstance(); cards.appendChild(lw);
const lwPhoto = lw.findOne(n => n.name === "Photo"); if (lwPhoto) { for (const c of [...lwPhoto.children]) c.visible = false; lwPhoto.fills = imgFill("handshake"); }
const row2 = al("HORIZONTAL", { name: "Case + FAQ", itemSpacing: 24 }); s7.appendChild(row2);
row2.appendChild(caseCard.createInstance());
const faqCol = al("VERTICAL", { itemSpacing: 0 }); row2.appendChild(faqCol);
const f1 = variant(faqSet, "Open=True").createInstance(); f1.resize(588, f1.height); faqCol.appendChild(f1);
const f2 = variant(faqSet, "Open=False").createInstance(); f2.resize(588, f2.height); faqCol.appendChild(f2);
const qKey = Object.keys(faqSet.componentPropertyDefinitions).find(k => k.startsWith("Question"));
f2.setProperties({ [qKey]: "Есть ли гарантия результата?" });
const stats = al("HORIZONTAL", { name: "Stats", itemSpacing: 80, paddingTop: 48, paddingBottom: 48, paddingLeft: 48, paddingRight: 48 }); s7.appendChild(stats); stats.layoutSizingHorizontal = "FILL"; stats.fills = [paint("color/bg/inverse")]; rad(stats, "radius/sm");
const vKey = Object.keys(statSet.componentPropertyDefinitions).find(k => k.startsWith("Value")), cKey = Object.keys(statSet.componentPropertyDefinitions).find(k => k.startsWith("Caption"));
for (const [v, c] of [["15+", "лет практики"], ["1 200+", "выигранных дел"], ["94%", "дел решены в пользу клиента"], ["24 ч", "срок ответа на заявку"]]) { const s = variant(statSet, "Theme=Dark").createInstance(); s.setProperties({ [vKey]: v, [cKey]: c }); stats.appendChild(s); }

// ===== 08 TONE
const s8 = sheet("08 · Тон общения", "color/bg/subtle");
await header(s8, "08", "Тон общения", "Мы говорим с клиентом как опытный адвокат на первой встрече: спокойно, по делу и без канцелярита. Тексты одинаково звучат на русском, узбекском и английском.");
const tone = al("HORIZONTAL", { name: "Principles", itemSpacing: 24 }); s8.appendChild(tone);
for (const [title, desc, yes, no] of [
  ["Профессионально, но понятно", "Объясняем сложное простыми словами, без латыни и канцелярита.", "«Поможем вернуть деньги по договору поставки»", "«Осуществляем представление интересов в рамках претензионно-исковой работы»"],
  ["Спокойно и уверенно", "Не пугаем и не обещаем невозможного. Опираемся на факты и цифры.", "«В 94% похожих дел суд встал на сторону клиента»", "«100% гарантия победы!!!»"],
  ["Конфиденциально", "Подчёркиваем адвокатскую тайну. В кейсах — детали без имён.", "«Клиент — производственная компания, штраф $50 000 отменён»", "«Наш клиент ООО „Ромашка“ и его директор Иванов…»"],
]) {
  const c = al("VERTICAL", { itemSpacing: 16, paddingTop: 32, paddingBottom: 32, paddingLeft: 32, paddingRight: 32, name: title }); c.resize(384, 10); c.counterAxisSizingMode = "FIXED"; c.primaryAxisSizingMode = "AUTO"; c.fills = [paint("color/bg/page")]; rad(c, "radius/sm");
  wrapFill(c, await txt(title, "Heading/H3", "color/text/primary"));
  wrapFill(c, await txt(desc, "Body/M", "color/text/secondary"));
  for (const [ok, phrase] of [[true, yes], [false, no]]) {
    const r = al("HORIZONTAL", { itemSpacing: 10 }); c.appendChild(r); r.layoutSizingHorizontal = "FILL";
    const i = iconComp(ok ? "ui/check" : "ui/x").createInstance(); i.rescale(20 / 24); recolor(i, ok ? "color/icon/accent" : "color/text/error"); r.appendChild(i);
    const t = await txt(phrase, "Body/S", ok ? "color/text/primary" : "color/text/tertiary"); r.appendChild(t); t.layoutGrow = 1; t.textAutoResize = "HEIGHT";
  }
  tone.appendChild(c);
}
return { sheets: bb.children.map(c => c.name), s6: await screenshot(s6, { maxDimension: 1800 }), s7: await screenshot(s7, { maxDimension: 1800 }), s8: await screenshot(s8, { maxDimension: 1400 }) };
