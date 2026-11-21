const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const page = await figma.getNodeByIdAsync("43:19330");
const out = [];
for (const name of ["Section · Hero", "Section · Финальный CTA"]) { const s = page.findOne(n => n.name === name && n.parent === page); s.fills = page.fills; out.push(await screenshot(s, { scale: 1, name: `390c ${name}` })); s.fills = []; }
const rv = (await figma.getNodeByIdAsync("43:18502")).findOne(n => n.name === "Section · Кейсы"); rv.fills = rv.parent.fills; out.push(await screenshot(rv, { scale: 1, name: "390 cases" })); rv.fills = [];
return out.map(o => o.height);
