const out = {};
for (const p of figma.root.children) {
  await p.loadAsync();
  out[p.name] = p.children.map(n => ({ id: n.id, type: n.type, name: n.name, x: Math.round(n.x), y: Math.round(n.y), w: Math.round(n.width), h: Math.round(n.height), kids: "children" in n ? n.children.length : 0 }));
}
// Inside UI Kit and Brandbook: anything that is not expected type at top level of sections
const kit = await figma.getNodeByIdAsync("26:169");
out.kitTop = kit.children.map(n => `${n.type}:${n.name}`);
const bb = await figma.getNodeByIdAsync("31:71");
out.bbTop = bb.children.map(n => `${n.type}:${n.name}`);
// Detached / empty frames or rectangles named Photo anywhere on page 02
const p2 = await figma.getNodeByIdAsync("5:2");
out.photos = p2.findAll(n => n.name.startsWith("Photo")).map(n => ({ id: n.id, name: n.name, parent: n.parent.name, fills: n.fills && n.fills.map ? n.fills.map(f => f.type) : null }));
out.emptyFrames = p2.findAll(n => n.type === "FRAME" && n.children.length === 0 && (!n.fills.length)).map(n => ({ id: n.id, name: n.name, parent: n.parent.name }));
return out;
