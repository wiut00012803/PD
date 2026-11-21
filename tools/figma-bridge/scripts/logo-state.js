log("start");
const p1 = await figma.getNodeByIdAsync("0:1"); log("got page");
await figma.setCurrentPageAsync(p1); log("set page");
const out = [];
for (const id of ["20:104", "20:157"]) { const s = await figma.getNodeByIdAsync(id); log("got " + id); for (const v of s.children) out.push({ set: s.name, v: v.name, layout: v.layoutMode, kids: v.children.map(k => `${k.type}:${k.name}`), texts: v.findAll(n => n.type === "TEXT").length, w: Math.round(v.width), h: Math.round(v.height) }); }
return out;
