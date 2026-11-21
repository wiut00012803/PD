const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const page = await figma.getNodeByIdAsync("40:3922");
const ibSet = await figma.getNodeByIdAsync("35:1843");
const hex = "#C08A3E", c = { r: 0.753, g: 0.541, b: 0.243 };
let n = 0;
for (const box of page.findAll(x => x.type === "INSTANCE")) {
  const mc = await box.getMainComponentAsync(); if (!mc || mc.parent !== ibSet) continue;
  const inner = box.findAll(x => x.type === "INSTANCE" && x.name === "Icon")[0]; if (!inner) continue;
  for (const v of inner.findAll(() => true)) { if (["FRAME", "INSTANCE", "GROUP"].includes(v.type)) continue; if (v.strokes && v.strokes.length) v.strokes = [{ type: "SOLID", color: c }]; if (Array.isArray(v.fills) && v.fills.length) v.fills = [{ type: "SOLID", color: c }]; }
  n++;
}
const ct = page.findOne(x => x.name === "Section · Контакты"); const p = ct.fills; ct.fills = page.fills;
const info = ct.findOne(x => x.type === "FRAME" && x.findOne(t => t.type === "TEXT" && t.characters === "Адрес") && x.layoutMode === "VERTICAL" && x.width > 400);
const s = await screenshot(info, { maxDimension: 700 }); ct.fills = p;
const sv = page.findOne(x => x.name === "Section · Практики"); const p2 = sv.fills; sv.fills = page.fills; const s2 = await screenshot(sv.children[1], { maxDimension: 900 }); sv.fills = p2;
return { n, s, s2 };
