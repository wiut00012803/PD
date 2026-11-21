const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
// FAQ component: answer text fills width instead of fixed 620
const faq = await figma.getNodeByIdAsync("35:2081");
for (const vnt of faq.children) for (const t of vnt.findAll(n => n.type === "TEXT" && n.parent === vnt)) { t.layoutSizingHorizontal = "FILL"; }
const bb = await figma.getNodeByIdAsync("31:71");
const s7 = bb.children.find(c => c.name.startsWith("07 ·"));
for (const p of s7.children.filter(c => c.name.startsWith("Panel"))) {
  const rows = p.children.filter(c => c.type === "FRAME" && c.layoutMode === "HORIZONTAL");
  const r1 = rows[0]; r1.layoutSizingHorizontal = "FILL"; r1.layoutWrap = "WRAP"; r1.counterAxisSpacing = 12;
  const r3 = rows[2]; const fq = r3.children[1]; for (const f of fq.children) f.resize(512, f.height);
}
// Softer glow on cover
const cover = bb.children.find(c => c.name.startsWith("00 ·")); const g = cover.findOne(n => n.name === "Glow"); g.opacity = 0.55; g.resize(900, 420); g.x = 470; g.y = -260;
return { s7: await screenshot(s7, { maxDimension: 1400 }), cover: await screenshot(cover, { maxDimension: 1000 }) };
