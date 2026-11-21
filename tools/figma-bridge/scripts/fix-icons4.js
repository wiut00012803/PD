const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const page = await figma.getNodeByIdAsync("40:3922");
const c = { r: 0.753, g: 0.541, b: 0.243 };
let n = 0;
for (const box of page.findAll(x => x.type === "INSTANCE" && x.name === "Icon Box")) {
  const icon = box.children.find(k => k.type === "INSTANCE"); if (!icon) continue;
  for (const v of icon.findAll(() => true)) { if (["FRAME", "INSTANCE", "GROUP"].includes(v.type)) continue; if (v.strokes && v.strokes.length) v.strokes = [{ type: "SOLID", color: c }]; if (Array.isArray(v.fills) && v.fills.length) v.fills = [{ type: "SOLID", color: c }]; }
  n++;
}
return { n, shot: await screenshot(page, { maxDimension: 2600 }) };
