const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
const old = await figma.getNodeByIdAsync("26:169");
const comps = old.findAll(n => n.type === "COMPONENT");
let used = [];
for (const c of comps) { const inst = await c.getInstancesAsync(); if (inst.length) used.push({ name: (c.parent.type === "COMPONENT_SET" ? c.parent.name + " / " : "") + c.name, n: inst.length, where: inst.slice(0, 3).map(i => { let p = i; while (p.parent && p.parent.type !== "PAGE") p = p.parent; return p.name; }) }); }
let removed = false;
if (!used.length) { old.remove(); removed = true; }
const kit = await figma.getNodeByIdAsync("35:1557"), bb = await figma.getNodeByIdAsync("31:71");
kit.x = 0; kit.y = 0; bb.x = kit.width + 200; bb.y = 0;
// softer glows on sheet 07 panels
const s7 = bb.children.find(c => c.name.startsWith("07 ·"));
for (const g of s7.findAll(n => n.name === "Glow")) g.opacity = 0.6;
return { checked: comps.length, used, removed, top: page.children.map(n => n.name) };
