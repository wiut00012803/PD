const page = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(page);
const out = [];
for (const id of ["34:1116","34:1199","34:1273"]) { const n = await figma.getNodeByIdAsync(id); out.push(await screenshot(n, { maxDimension: 1600 })); log("shot " + n.name); }
return out;
