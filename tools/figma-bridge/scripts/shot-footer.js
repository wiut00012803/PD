const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const page = await figma.getNodeByIdAsync("43:15289");
const ft = page.findOne(n => n.name === "Footer"); const pf = ft.fills; ft.fills = page.fills; const s = await screenshot(ft, { maxDimension: 900 }); ft.fills = pf;
return s;
