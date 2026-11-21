// converts the first variant that still has live text (one per run)
const p1 = await figma.getNodeByIdAsync("0:1"); await figma.setCurrentPageAsync(p1);
for (const id of ["20:104", "20:157"]) {
  const set = await figma.getNodeByIdAsync(id);
  const v = set.children.find(c => c.findOne(n => n.type === "TEXT")); if (!v) continue;
  log(`convert ${set.name} / ${v.name}`);
  const svg = await v.exportAsync({ format: "SVG_STRING", svgOutlineText: true, svgIdAttribute: false }); log("exported " + svg.length);
  const node = figma.createNodeFromSvg(svg); node.name = "Logo"; node.fills = []; log("svg node");
  for (const c of [...v.children]) c.remove(); log("cleared");
  v.layoutMode = "NONE"; v.resizeWithoutConstraints(node.width, node.height); v.appendChild(node); node.x = 0; node.y = 0; log("appended");
  for (const k of [node, ...node.findAll(() => true)]) if ("constraints" in k) k.constraints = { horizontal: "SCALE", vertical: "SCALE" };
  log("constraints");
  const left = (await Promise.all(["20:104", "20:157"].map(i => figma.getNodeByIdAsync(i)))).flatMap(s => s.children.filter(c => c.findOne(n => n.type === "TEXT")).map(c => `${s.name}/${c.name}`));
  return { done: `${set.name} / ${v.name}`, left };
}
return { done: null, left: [] };
