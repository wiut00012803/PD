const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const page = await figma.getNodeByIdAsync("43:8497");
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
const adv = page.findOne(n => n.name === "Advantages");
for (const t of adv.findAll(n => n.type === "TEXT" && ["Профессионализм", "Конфиденциальность", "Результат"].includes(n.characters))) { t.fontSize = 20; const card = t.parent.parent; card.paddingLeft = card.paddingRight = 24; }
const sec = adv.parent; const pf = sec.fills; sec.fills = page.fills; const s = await screenshot(sec, { maxDimension: 1000 }); sec.fills = pf;
const cons = await figma.getNodeByIdAsync("43:9208");
return { s, c: await screenshot(cons, { maxDimension: 2000 }) };
