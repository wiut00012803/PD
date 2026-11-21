const p1 = await figma.getNodeByIdAsync("0:1"); await figma.setCurrentPageAsync(p1);
const out = [];
for (const id of ["20:104", "20:157"]) { const s = await figma.getNodeByIdAsync(id); s.fills = [{ type: "SOLID", color: { r: 0.55, g: 0.584, b: 0.639 } }]; out.push(await screenshot(s, { maxDimension: 1400 })); }
const show = await figma.getNodeByIdAsync("20:158");
const h = show.findOne(n => n.name === "Горизонтальный локап" || (n.type === "FRAME" && n.findOne(t => t.type === "TEXT" && t.characters === "Горизонтальный локап")));
out.push(await screenshot(show, { maxDimension: 1200 }));
return out;
