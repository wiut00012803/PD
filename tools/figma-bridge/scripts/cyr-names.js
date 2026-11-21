const CY = /[А-Яа-яЁё]/;
const counts = {};
for (const p of figma.root.children) {
  await p.loadAsync();
  if (CY.test(p.name)) counts[`PAGE: ${p.name}`] = 1;
  for (const n of p.findAll(n => n.type !== "TEXT" && CY.test(n.name))) {
    // instance sublayers inherit names from main components — count them under their own name
    const key = `${n.type}: ${n.name}`; counts[key] = (counts[key] || 0) + 1;
  }
}
const styles = [...(await figma.getLocalTextStylesAsync()), ...(await figma.getLocalEffectStylesAsync())].filter(s => CY.test(s.name)).map(s => s.name);
const vars = (await figma.variables.getLocalVariablesAsync()).filter(v => CY.test(v.name)).map(v => v.name);
const cols = (await figma.variables.getLocalVariableCollectionsAsync()).filter(c => CY.test(c.name) || c.modes.some(m => CY.test(m.name))).map(c => c.name);
return { unique: Object.keys(counts).length, names: Object.entries(counts).sort((a, b) => b[1] - a[1]), styles, vars, cols };
