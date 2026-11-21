// 1) Convert live text in Logo / Horizontal and Logo / Vertical variants into vector outlines (single source of truth).
const p1 = await figma.getNodeByIdAsync("0:1"); await figma.setCurrentPageAsync(p1);
const LOGO = ["20:47", "20:104", "20:157", "21:177"];
const sets = await Promise.all(LOGO.map(id => figma.getNodeByIdAsync(id)));
const converted = [];
for (const set of [sets[1], sets[2]]) {
  for (const v of set.children) {
    if (!v.findOne(n => n.type === "TEXT")) continue; // already outlined
    const w = v.width, h = v.height;
    const svg = await v.exportAsync({ format: "SVG_STRING", svgOutlineText: true, svgIdAttribute: false });
    const node = figma.createNodeFromSvg(svg); node.name = "Logo"; node.fills = [];
    for (const c of [...v.children]) c.remove();
    v.layoutMode = "NONE"; v.resizeWithoutConstraints(node.width, node.height);
    v.appendChild(node); node.x = 0; node.y = 0;
    // children of the svg frame scale with the component
    node.constraints = { horizontal: "SCALE", vertical: "SCALE" };
    for (const k of node.findAll(() => true)) if ("constraints" in k) k.constraints = { horizontal: "SCALE", vertical: "SCALE" };
    converted.push(`${set.name} / ${v.name}: ${Math.round(w)}x${Math.round(h)} → ${Math.round(v.width)}x${Math.round(v.height)}`);
  }
}
// Mark & Favicon: make sure inner vectors scale too
for (const set of [sets[0], sets[3]]) for (const v of set.children) for (const k of v.findAll(() => true)) if ("constraints" in k) k.constraints = { horizontal: "SCALE", vertical: "SCALE" };
// 2) text left inside logo sets?
const textsLeft = sets.reduce((a, s) => a + s.findAll(n => n.type === "TEXT").length, 0);
// 3) re-layout the sets (they were auto-layout rows)
for (const s of sets) { s.layoutMode = "HORIZONTAL"; s.primaryAxisSizingMode = "AUTO"; s.counterAxisSizingMode = "AUTO"; s.itemSpacing = 32; s.paddingTop = s.paddingBottom = s.paddingLeft = s.paddingRight = 32; s.counterAxisAlignItems = "CENTER"; }
const shots = []; for (const s of [sets[1], sets[2]]) shots.push(await screenshot(s, { maxDimension: 1400 }));
return { converted, textsLeft, shots };
