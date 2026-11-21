const page = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: "Manrope", style: "SemiBold" }); await figma.loadFontAsync({ family: "Manrope", style: "Regular" });
const col = await figma.getNodeByIdAsync("34:1199");
const arrow = await figma.getNodeByIdAsync("26:180");
let n = 0;
for (const t of col.findAll(x => x.type === "TEXT" && x.characters.includes("↗"))) {
  if (t.characters.trim() === "↗") {
    const i = arrow.createInstance(); i.rescale(28 / 24);
    for (const v of i.findAll(() => true)) if (v.strokes && v.strokes.length) v.strokes = [{ type: "SOLID", color: { r: 0.753, g: 0.541, b: 0.243 } }];
    const p = t.parent; p.insertChild(p.children.indexOf(t), i); t.remove();
  } else t.characters = t.characters.replace("↗", "→");
  n++;
}
const hero = col.children[1], blk = col.children[2];
return { replaced: n, s1: await screenshot(hero, { maxDimension: 1000 }), s2: await screenshot(blk, { maxDimension: 900 }) };
