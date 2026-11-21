const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const page = await figma.getNodeByIdAsync("41:4889");
const load = async t => { for (const s of t.getStyledTextSegments(["fontName"])) await figma.loadFontAsync(s.fontName); };
// 1) hero title
const h1 = page.findOne(n => n.type === "TEXT" && n.characters.startsWith("Бесплатная\nконсультация"));
await load(h1); const fills2 = h1.getRangeFills(h1.characters.indexOf("консультация"), h1.characters.indexOf("консультация") + 1);
h1.characters = "Бесплатная\nконсультация"; h1.setRangeFills(h1.characters.indexOf("консультация"), h1.characters.length, fills2);
h1.layoutSizingHorizontal = "FILL"; h1.textAutoResize = "HEIGHT";
const sub = page.findOne(n => n.type === "TEXT" && n.characters.startsWith("Расскажите о ситуации — адвокат")); await load(sub);
sub.characters = "Юрист Pravoe Delo изучит вашу ситуацию, честно оценит шансы и предложит план действий. Без обязательств и скрытых платежей.";
// 2) softer top glow
const g = page.findOne(n => n.name === "Glow · follows cursor"); g.fills = [{ ...g.fills[0], opacity: 0.22 }]; g.effects = [{ type: "LAYER_BLUR", radius: 220, visible: true }]; g.resize(1000, 480); g.x = 220; g.y = -300;
const cg = page.findOne(n => n.name === "CTA card").findOne(n => n.name === "Glow"); cg.fills = [{ ...cg.fills[0], opacity: 0.16 }];
// 3) wrap all heading texts inside the "Сроки" cards
const terms = page.findOne(n => n.name === "Section · Сроки");
for (const t of terms.findAll(n => n.type === "TEXT")) { t.layoutSizingHorizontal = "FILL"; t.textAutoResize = "HEIGHT"; }
// 4) topics: move the ghost link under the chips
const tp = page.findOne(n => n.name === "Section · Вопросы");
const head = tp.children[0]; const ghost = head.children.find(n => n.type === "INSTANCE"); tp.appendChild(ghost);
return { shot: await screenshot(page, { maxDimension: 2000 }) };
