const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const removed = [];
for (const [pid, cardName] of [["41:4889", "CTA card"], ["40:3922", "Consultation card"]]) {
  const page = await figma.getNodeByIdAsync(pid); const card = page.findOne(n => n.name === cardName);
  for (const g of card.findAll(n => n.type === "ELLIPSE" && n.name.startsWith("Glow"))) { removed.push(`${page.name} / ${cardName}`); g.remove(); }
}
// verify no other glows live inside cards/sections except the hero one
const left = [];
for (const pid of ["41:4889", "40:3922"]) { const page = await figma.getNodeByIdAsync(pid); for (const g of page.findAll(n => n.type === "ELLIPSE" && n.name.startsWith("Glow"))) left.push(`${page.name}: ${g.name} in ${g.parent.name}`); }
const page = await figma.getNodeByIdAsync("41:4889"); const sec = page.findOne(n => n.name === "Section · Финальный CTA"); const pf = sec.fills; sec.fills = page.fills; const s = await screenshot(sec, { maxDimension: 1200 }); sec.fills = pf;
return { removed, left, s };
