const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
const s = await figma.getNodeByIdAsync("37:2681");
const c = s.findOne(n => n.name === "Composition Light");
const st = c.findOne(n => n.name === "Photo stack").children.find(x => x.type === "INSTANCE");
return { fills: st.fills.map(f => ({ type: f.type, op: f.opacity, bound: f.boundVariables && f.boundVariables.color && f.boundVariables.color.id })), effects: st.effects.map(e => e.type), shot: await screenshot(c, { maxDimension: 1000 }) };
