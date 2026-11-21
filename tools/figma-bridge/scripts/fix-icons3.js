const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const page = await figma.getNodeByIdAsync("40:3922");
const c = { r: 0.753, g: 0.541, b: 0.243 };
const ib = new Set((await figma.getNodeByIdAsync("35:1843")).children.map(x => x.id));
const out = [];
for (const icon of page.findAll(x => x.type === "INSTANCE" && x.name === "Icon")) {
  const parent = icon.parent; if (!parent || parent.type !== "INSTANCE") continue;
  const pm = await parent.getMainComponentAsync(); if (!pm || !ib.has(pm.id)) continue;
  let painted = 0;
  for (const v of icon.findAll(() => true)) { if (["FRAME", "INSTANCE", "GROUP"].includes(v.type)) continue; if (v.strokes && v.strokes.length) { v.strokes = [{ type: "SOLID", color: c }]; painted++; } if (Array.isArray(v.fills) && v.fills.length) { v.fills = [{ type: "SOLID", color: c }]; painted++; } }
  out.push(painted);
}
const ct = page.findOne(x => x.name === "Section · Контакты"); const p = ct.fills; ct.fills = page.fills;
const info = ct.findOne(x => x.type === "FRAME" && x.findOne(t => t.type === "TEXT" && t.characters === "Адрес") && x.layoutMode === "VERTICAL" && x.width > 400);
const s = await screenshot(info, { maxDimension: 500 }); ct.fills = p;
return { boxes: out.length, painted: out, s };
