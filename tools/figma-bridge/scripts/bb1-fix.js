//@prelude
const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
// 1) Clear space: fit the lockup inside the tile
const s2 = await figma.getNodeByIdAsync("31:232");
const box = s2.findOne(n => n.name === "Clear space");
const h = box.children[0];
h.rescale(430 / h.width);
const markH = h.findOne(n => n.name === "Mark").height; const X = Math.round(markH * 26 / 124);
box.paddingTop = box.paddingBottom = box.paddingLeft = box.paddingRight = X;
const lbl = box.parent.findOne(n => n.type === "TEXT" && n.characters.startsWith("X ="));
lbl.characters = `X = высота фронтона (${X} px при этом размере)`;
// 2) "Don't stretch": rebuild from an SVG export so geometry distorts correctly
const s3 = await figma.getNodeByIdAsync("31:313");
const tile = s3.findOne(n => n.name === "Don'ts").children[0].children[0];
for (const c of [...tile.children]) if (c.type !== "INSTANCE") c.remove();
const hSet = await figma.getNodeByIdAsync("20:104");
const tmp = variant(hSet, "Color=Primary").createInstance(); tmp.rescale(0.7);
const svg = await tmp.exportAsync({ format: "SVG_STRING" }); tmp.remove();
const n = figma.createNodeFromSvg(svg); n.name = "Stretched logo"; tile.insertChild(0, n);
n.resize(n.width * 1.2, n.height * 0.6);
return { X, shot1: await screenshot(box.parent, { maxDimension: 800 }), shot2: await screenshot(tile, { maxDimension: 600 }) };
