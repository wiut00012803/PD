const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
const s6 = await figma.getNodeByIdAsync("31:717");
const ig = s6.findOne(n => n.name === "Icon grid"); ig.counterAxisSizingMode = "AUTO";
const docs = s6.findOne(n => n.name === "Photo / docs");
const info = docs ? { fills: docs.fills.map(f => ({ type: f.type, hash: f.imageHash })), w: docs.width, h: docs.height } : "missing";
const s8 = await figma.getNodeByIdAsync("31:1067");
const tone = s8.findOne(n => n.name === "Principles"); for (const c of tone.children) c.layoutAlign = "STRETCH";
return { info, shot: await screenshot(s6, { maxDimension: 1600 }) };
