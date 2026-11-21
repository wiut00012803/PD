const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
await Promise.all([["Manrope","Regular"],["Manrope","Medium"],["Manrope","SemiBold"],["Manrope","Bold"],["Cormorant Garamond","SemiBold"]].map(([family,style])=>figma.loadFontAsync({family,style})));
const s5 = await figma.getNodeByIdAsync("31:587");
const scale = s5.findOne(n => n.name === "Type scale");
const order = ["Display","Heading/H1","Heading/H2","Heading/H3","Heading/H4","Body/L","Body/M","Body/S","Label","Button","Overline","Stat"];
const rows = [...scale.children];
for (const r of rows) { const meta = r.children[0]; meta.primaryAxisSizingMode = "AUTO"; }
rows.sort((a, b) => order.indexOf(a.children[0].children[0].characters) - order.indexOf(b.children[0].children[0].characters));
rows.forEach((r, i) => scale.insertChild(i, r));
const langs = s5.findOne(n => n.name === "Languages");
for (const c of langs.children) c.primaryAxisSizingMode = "AUTO";
const s4 = await figma.getNodeByIdAsync("31:453");
for (const t of s4.findAll(n => n.type === "TEXT" && n.characters === "AA ✓")) t.characters = "AA — подходит";
return { shot: await screenshot(s5, { maxDimension: 1600 }) };
