const p = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(p);
const LOGO = new Set(["20:47", "20:104", "20:157", "21:177"]);
const sheet = p.findOne(n => n.type === "FRAME" && n.name.startsWith("03 · Недопустимое"));
let fixed = 0;
for (const i of sheet.findAllWithCriteria({ types: ["INSTANCE"] })) { const mc = await i.getMainComponentAsync(); if (!mc || !mc.parent || !LOGO.has(mc.parent.id)) continue; const r = mc.width / mc.height; if (Math.abs(i.width / i.height / r - 1) > 0.0005) { const rot = i.rotation; i.rotation = 0; i.resize(Math.round(i.height * r * 100) / 100, i.height); i.rotation = rot; fixed++; } }
const cover2 = p.children.find(n => n.name === "Обложка страницы");
return { fixed, misuse: await screenshot(sheet, { maxDimension: 1200 }), cover: await screenshot(cover2, { maxDimension: 1000 }) };
