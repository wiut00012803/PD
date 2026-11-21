//@prelude2
const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const page = await figma.getNodeByIdAsync("40:3922");
for (const s of page.children) if (s.type === "FRAME") s.clipsContent = false;
const g1 = page.findOne(n => n.name === "Glow · follows cursor"); g1.opacity = 1; g1.fills = [{ ...g1.fills[0], opacity: 0.2 }]; g1.resize(1000, 480); g1.x = 220; g1.y = -300; g1.effects = [{ type: "LAYER_BLUR", radius: 240, visible: true }];
const g2 = page.findOne(n => n.name === "Glow · secondary"); g2.fills = [{ ...g2.fills[0], opacity: 0.08 }]; g2.effects = [{ type: "LAYER_BLUR", radius: 240, visible: true }]; g2.x = 980; g2.y = 420;
const ph = page.findOne(n => n.name === "Photo card");
const navy = hexRGB("#0E1A2B");
ph.fills = [ph.fills[0], { type: "GRADIENT_LINEAR", gradientTransform: [[0, 1, 0], [-1, 0, 1]], gradientStops: [{ position: 0.5, color: { ...navy, a: 0 } }, { position: 1, color: { ...navy, a: 0.85 } }] }];
const hero = page.findOne(n => n.name === "Section · Hero");
return { shot: await screenshot(hero, { maxDimension: 1200 }), p: await screenshot(ph, { maxDimension: 600 }) };
