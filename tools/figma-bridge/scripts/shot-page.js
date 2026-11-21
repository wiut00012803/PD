const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const page = await figma.getNodeByIdAsync("40:3922");
return await screenshot(page, { maxDimension: 1500 });
