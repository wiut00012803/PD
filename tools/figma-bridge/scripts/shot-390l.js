const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const home = await figma.getNodeByIdAsync("43:21342"), cons = await figma.getNodeByIdAsync("43:22162"), menu = await figma.getNodeByIdAsync("43:22636");
const out = [];
for (const name of ["Section · Hero", "Section · Практики", "Section · Команда", "Section · Контакты"]) { const s = home.findOne(n => n.name === name && n.parent === home); s.fills = home.fills; out.push(await screenshot(s, { scale: 1, name: `L ${name}` })); s.fills = []; }
const ch = cons.findOne(n => n.name === "Section · Hero" && n.parent === cons); ch.fills = cons.fills; out.push(await screenshot(ch, { scale: 1, name: "L cons hero" })); ch.fills = [];
out.push(await screenshot(menu, { scale: 1, name: "L menu" }));
const sec = pg.children.find(n => n.name.startsWith("Макеты · Телефон")); out.push(await screenshot(sec, { maxDimension: 1200, name: "section 390" }));
return out.map(o => `${o.name} ${o.height}`);
