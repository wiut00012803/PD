const pg = await figma.getNodeByIdAsync("20:2");
{ const old = (await (async () => { await figma.setCurrentPageAsync(pg); return pg.children.find(n => n.name === PAGE_NAME); })()); if (old) old.remove(); }
const page = await getPage();
const wf = pg.children.find(n => n.name.startsWith("Структура сайта")); page.x = wf ? wf.x + wf.width + 200 : 0; page.y = 0;
log("page");

// ===== HERO
const hero = Fr("VERTICAL", { name: "Section · Hero", counterAxisAlignItems: "CENTER", paddingTop: 24, paddingBottom: 120, itemSpacing: 0 }); page.appendChild(hero); hero.layoutSizingHorizontal = "FILL";
glowAt(hero, 1100, 560, 170, -260, TH === "Dark" ? 0.36 : 0.28, "color/glow/primary", "Glow · follows cursor");
glowAt(hero, 700, 460, 900, 520, TH === "Dark" ? 0.12 : 0.16, "color/glow/secondary", "Glow · secondary");
hero.appendChild(inst(C.header, {}));
const hc = Fr("VERTICAL", { counterAxisAlignItems: "CENTER", itemSpacing: 28, paddingTop: 128 }); hero.appendChild(hc);
hc.appendChild(inst(C.chip, {}, { Label: "Бесплатная онлайн-консультация" }));
const hl = await T("Правовая защита\nнового уровня", "Display"); hl.textAlignHorizontal = "CENTER";
hl.setRangeFills(hl.characters.indexOf("нового"), hl.characters.length, gradPaint(TH)); hc.appendChild(hl);
const sub = await T("Адвокаты Pravoe Delo: бизнес, гражданские, уголовные и семейные дела.\nОтвет на заявку — в течение 24 часов.", "Body/L", "color/text/secondary"); sub.textAlignHorizontal = "CENTER"; hc.appendChild(sub);
const hb = Fr("HORIZONTAL", { itemSpacing: 14, paddingTop: 8 }); hc.appendChild(hb);
const cta = inst(C.btn, { Style: "Primary", Size: "M", State: "Default" }, { Label: "Получить консультацию" }); cta.setProperties({ [pkey(C.btn, "Show icon")]: true }); hb.appendChild(cta);
hb.appendChild(inst(C.msg, { Platform: "Telegram" })); hb.appendChild(inst(C.msg, { Platform: "WhatsApp" }));
const st = Fr("HORIZONTAL", { itemSpacing: 16, paddingTop: 72 }); hc.appendChild(st);
for (const [v, c] of [["15+", "лет практики"], ["1 200+", "выигранных дел"], ["94%", "решений в пользу клиента"], ["24 ч", "срок ответа на заявку"]]) { const s = inst(C.stat, {}, { Value: v, Caption: c }); s.resize(276, s.height); st.appendChild(s); }
log("hero");

// ===== ABOUT
const about = section(page, "О нас", { gap: 56 });
const ar = Fr("HORIZONTAL", { itemSpacing: 64, counterAxisAlignItems: "CENTER" }); about.appendChild(ar); ar.layoutSizingHorizontal = "FILL";
const al1 = Fr("VERTICAL", { itemSpacing: 24 }); ar.appendChild(al1); al1.layoutGrow = 1;
al1.appendChild(await T("О нас", "Overline", "color/text/accent"));
al1.appendChild(await T("15 лет защищаем\nбизнес и людей", "Heading/H1"));
al1.appendChild(await T("Pravoe Delo основана в 2010 году командой адвокатов, которые прошли путь от следствия и судов до корпоративной практики. Сегодня мы ведём дела компаний и частных клиентов по всему Узбекистану.", "Body/L", "color/text/secondary", 540));
al1.appendChild(await T("Наша миссия — сделать квалифицированную юридическую помощь понятной: честная оценка шансов, прозрачная стоимость и результат, за который не стыдно.", "Body/M", "color/text/secondary", 540));
const lic = Fr("HORIZONTAL", { itemSpacing: 10, paddingTop: 8 }); al1.appendChild(lic); lic.layoutWrap = "WRAP"; lic.layoutSizingHorizontal = "FILL"; lic.counterAxisSpacing = 10;
for (const l of ["Лицензия Минюста РУз", "Палата адвокатов РУз", "Адвокатская тайна"]) { const c = glassBox("HORIZONTAL", { itemSpacing: 8, counterAxisAlignItems: "CENTER", paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 14, r: "radius/full" }, true); c.appendChild(ico("shield-check" in ICN ? "ui/shield-check" : "ui/check", 16, "color/icon/accent")); c.appendChild(await T(l, "Label")); lic.appendChild(c); }
const ph = Fr("VERTICAL", { name: "Photo card", paddingLeft: 20, paddingBottom: 20, primaryAxisAlignItems: "MAX" }); ph.resize(560, 520); ph.primaryAxisSizingMode = "FIXED"; ph.counterAxisSizingMode = "FIXED"; rad(ph, "radius/2xl"); ph.clipsContent = true;
ph.fills = [imgFill(PHOTOS.library)]; ph.strokes = [paint("color/border/glass-strong", TH)]; ph.strokeWeight = 1; ph.strokeAlign = "INSIDE"; ar.appendChild(ph);
const plate = glassBox("VERTICAL", { name: "Glass plate", itemSpacing: 2, paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 16, r: "radius/lg" }, true); plate.appendChild(await T("Офис в центре Ташкента", "Label")); plate.appendChild(await T("приём по предварительной записи", "Body/S", "color/text/secondary")); ph.appendChild(plate);
// advantages
const adv = Fr("HORIZONTAL", { name: "Advantages", itemSpacing: 20 }); about.appendChild(adv); adv.layoutSizingHorizontal = "FILL";
for (const [k, t, d] of [["ui/award", "Профессионализм", "Адвокаты с опытом 10–20 лет в судах, следствии и корпоративной практике. Каждое дело ведёт партнёр."], ["ui/lock", "Конфиденциальность", "Адвокатская тайна с первой минуты разговора. Данные клиентов не публикуются — даже в кейсах."], ["ui/target", "Результат", "Честно оцениваем шансы до начала работы. 94% дел завершаются в пользу клиента."]]) {
  const c = glassBox("VERTICAL", { itemSpacing: 14, paddingTop: 32, paddingBottom: 32, paddingLeft: 32, paddingRight: 32 }); adv.appendChild(c); c.layoutGrow = 1;
  const b = inst(C.ib, {}); swapIcon(b, k); c.appendChild(b);
  c.appendChild(await T(t, "Heading/H4")); const d0 = await T(d, "Body/M", "color/text/secondary"); c.appendChild(d0); d0.layoutSizingHorizontal = "FILL"; d0.textAutoResize = "HEIGHT";
}
log("about");
await applyGlassStyles(page);
return { page: page.id, shot: await screenshot(page, { maxDimension: 1600 }) };
