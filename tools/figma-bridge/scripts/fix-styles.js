const page = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(page);
const cols = await Promise.all(["34:1116","34:1199","34:1273"].map(id => figma.getNodeByIdAsync(id)));
const out = [];
for (const col of cols) {
  col.fills = [{ type: "SOLID", color: { r: 0.91, g: 0.92, b: 0.937 } }];
  col.paddingTop = col.paddingBottom = col.paddingLeft = col.paddingRight = 64;
  const blk = col.children[2]; blk.primaryAxisSizingMode = "AUTO";
  out.push({ col: col.name, h: Math.round(col.height), blk: blk.name, blkH: Math.round(blk.height) });
}
const shots = [];
for (const col of cols) { shots.push(await screenshot(col.children[1], { maxDimension: 1440 })); shots.push(await screenshot(col.children[2], { maxDimension: 1440 })); }
return { out, shots };
