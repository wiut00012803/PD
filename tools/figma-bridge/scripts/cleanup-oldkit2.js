const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
const old = await figma.getNodeByIdAsync("26:169");
// verify every instance of old components lives inside the old kit itself
const comps = old.findAll(n => n.type === "COMPONENT"); const outside = [];
for (const c of comps) for (const i of await c.getInstancesAsync()) { let p = i; let inside = false; while (p) { if (p.id === old.id) { inside = true; break; } p = p.parent; } if (!inside) outside.push(i.id); }
if (outside.length) return { aborted: true, outside };
old.remove();
const kit = await figma.getNodeByIdAsync("35:1557"), bb = await figma.getNodeByIdAsync("31:71");
return { removed: true, top: page.children.map(n => `${n.name} @${Math.round(n.x)},${Math.round(n.y)}`) };
