//@prelude2
const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
const s = await figma.getNodeByIdAsync("37:2681");
const kit = await figma.getNodeByIdAsync("35:1557");
const IC = Object.fromEntries(kit.findOne(n => n.name === "Icons").findAll(n => n.type === "COMPONENT").map(c => [c.name.replace("icon/", ""), c]));
// 1) stat cards over photos: denser plate for legibility
for (const th of ["Light", "Dark"]) {
  const comp = s.findOne(n => n.name === `Composition ${th}`);
  const st = comp.findOne(n => n.name === "Photo stack").children.find(c => c.type === "INSTANCE");
  st.fills = [{ ...paint("color/bg/page", th), opacity: 0.78 }]; st.effects = [{ type: "BACKGROUND_BLUR", radius: 30, visible: true }, ...(th === "Light" ? [shadowFx(0.08, 12, 32)] : [])];
}
// 2) icon grids: plain accent icons instead of nested icon boxes
let swapped = 0;
for (const th of ["Light", "Dark"]) {
  const grid = s.findOne(n => n.name === `Icon grid ${th}`);
  for (const cell of grid.children) {
    const first = cell.children[0];
    const mc = first.type === "INSTANCE" ? await first.getMainComponentAsync() : null;
    if (mc && mc.parent && mc.parent.name === "Icon Box") {
      const name = cell.children[1].characters; const i = IC["ui/" + name].createInstance(); i.rescale(26 / 24); recolor(i, "color/icon/accent", th);
      cell.insertChild(0, i); first.remove(); swapped++;
    }
  }
}
return { swapped, a: await screenshot(s.findOne(n => n.name === "Composition Dark"), { maxDimension: 1000 }), b: await screenshot(s.findOne(n => n.name === "Icon grid Light"), { maxDimension: 900 }) };
