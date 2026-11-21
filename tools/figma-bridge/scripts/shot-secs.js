const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const s = pg.children.find(n => n.name.startsWith("Макеты · Планшет"));
return await screenshot(s, { maxDimension: 1400 });
