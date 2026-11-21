const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const page = await figma.getNodeByIdAsync("40:3922");
const card = page.findOne(n => n.name === "Consultation card");
const g = card.findOne(n => n.name === "Glow"); g.fills = [{ ...g.fills[0], opacity: 0.18 }]; g.effects = [{ type: "LAYER_BLUR", radius: 220, visible: true }]; g.x = 560; g.y = -220;
const h = card.findOne(n => n.type === "TEXT" && n.characters.startsWith("Бесплатная консультация"));
const col = h.parent; col.layoutGrow = 1; h.layoutSizingHorizontal = "FILL"; h.textAutoResize = "HEIGHT";
for (const t of col.findAll(n => n.type === "TEXT" && n.parent === col)) { t.layoutSizingHorizontal = "FILL"; t.textAutoResize = "HEIGHT"; }
// export a crop: temporarily give the card section a page-coloured backdrop
const sec = card.parent; const prev = sec.fills; sec.fills = page.fills;
const shot = await screenshot(sec, { maxDimension: 1400 });
const faq = page.findOne(n => n.name === "Section · FAQ"); const pf = faq.fills; faq.fills = page.fills; const shot2 = await screenshot(faq, { maxDimension: 1400 }); faq.fills = pf;
const ct = page.findOne(n => n.name === "Section · Контакты"); const pc = ct.fills; ct.fills = page.fills; const shot3 = await screenshot(ct, { maxDimension: 1400 }); ct.fills = pc;
sec.fills = prev;
return { hW: Math.round(h.width), shot, shot2, shot3 };
