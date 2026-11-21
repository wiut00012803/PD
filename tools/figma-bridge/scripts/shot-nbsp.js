const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const home = await figma.getNodeByIdAsync("43:19920"), cons = await figma.getNodeByIdAsync("43:20748");
const out = [];
const cs = home.findOne(n => n.name === "Section · Кейсы"); cs.fills = home.fills; out.push(await screenshot(cs, { scale: 1, name: "cases" })); cs.fills = [];
const ct = cons.findOne(n => n.name === "Section · Финальный CTA"); ct.fills = cons.fills; out.push(await screenshot(ct, { scale: 1, name: "cta" })); ct.fills = [];
return out.map(o => o.height);
