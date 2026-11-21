const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const page = await figma.getNodeByIdAsync("40:3922");
const ct = page.findOne(x => x.name === "Section · Контакты");
const info = ct.findOne(x => x.type === "FRAME" && x.findOne(t => t.type === "TEXT" && t.characters === "Адрес") && x.layoutMode === "VERTICAL" && x.width > 400);
const rows = [];
for (const i of info.findAll(x => x.type === "INSTANCE").slice(0, 6)) { const m = await i.getMainComponentAsync(); rows.push({ name: i.name, main: m && m.name, mainParent: m && m.parent && m.parent.name, parent: i.parent.name, kids: i.children.map(k => `${k.type}:${k.name}`).slice(0, 3) }); }
return rows;
