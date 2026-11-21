const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const page = await figma.getNodeByIdAsync("40:3922");
const ibSet = await figma.getNodeByIdAsync("35:1843");
let fixed = 0;
for (const box of page.findAll(n => n.type === "INSTANCE")) {
  const mc = await box.getMainComponentAsync(); if (!mc || mc.parent !== ibSet) continue;
  const inner = box.findAll(n => n.type === "INSTANCE" && n.name === "Icon")[0]; if (!inner) continue;
  const target = await inner.getMainComponentAsync();
  box.resetOverrides();
  const fresh = box.findAll(n => n.type === "INSTANCE" && n.name === "Icon")[0];
  if (target && fresh) fresh.swapComponent(target);
  fixed++;
}
// map stretches to the info card height
const ct = page.findOne(n => n.name === "Section · Контакты");
const row = ct.children.find(n => n.type === "FRAME" && n.findOne(x => x.name === "Map"));
const info = row.children[0], map = row.findOne(n => n.name === "Map");
info.layoutAlign = "INHERIT"; map.primaryAxisSizingMode = "FIXED"; map.layoutAlign = "STRETCH";
const prev = ct.fills; ct.fills = page.fills; const s1 = await screenshot(ct, { maxDimension: 1200 }); ct.fills = prev;
const sv = page.findOne(n => n.name === "Section · Практики"); const p2 = sv.fills; sv.fills = page.fills; const s2 = await screenshot(sv, { maxDimension: 1200 }); sv.fills = p2;
return { fixed, mapH: Math.round(map.height), infoH: Math.round(info.height), s1, s2 };
