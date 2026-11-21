const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const page = await figma.getNodeByIdAsync("40:3922"); const g = page.findOne(n => n.name === "Glow · secondary"); if (g) g.remove();
return { left: page.findAll(n => n.type === "ELLIPSE" && n.name.startsWith("Glow")).map(n => n.name) };
