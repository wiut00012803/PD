//@prelude2
const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const D2NAME = Object.fromEntries(Object.entries(D).map(([n, id]) => [id, n]));
const rebind = paints => paints.map(p => (p.boundVariables && p.boundVariables.color && D2NAME[p.boundVariables.color.id]) ? figma.variables.setBoundVariableForPaint(p, "color", VV[L[D2NAME[p.boundVariables.color.id]]]) : p);
const insideInstance = n => { let p = n.parent; while (p && p.type !== "PAGE") { if (p.type === "INSTANCE") return true; p = p.parent; } return false; };
const res = [];
for (const id of ["42:5365", "42:6396"]) {
  const page = await figma.getNodeByIdAsync(id); let n = 0;
  for (const i of page.findAll(x => x.type === "INSTANCE" && !insideInstance(x))) {
    const mc = await i.getMainComponentAsync(); if (!mc || !mc.name.startsWith("icon/")) continue;
    for (const v of i.findAll(() => true)) { for (const k of ["fills", "strokes"]) { const a = v[k]; if (Array.isArray(a) && a.some(p => p.boundVariables && p.boundVariables.color && D2NAME[p.boundVariables.color.id])) v[k] = rebind(a); } }
    n++;
  }
  res.push({ page: page.name, icons: n });
}
const page = await figma.getNodeByIdAsync("42:5365");
const ft = page.findOne(x => x.name === "Footer"); const pf = ft.fills; ft.fills = page.fills; const s1 = await screenshot(ft, { maxDimension: 1200 }); ft.fills = pf;
const cp = await figma.getNodeByIdAsync("42:6396"); const get = cp.findOne(x => x.name === "What you get");
return { res, s1, s2: await screenshot(get, { maxDimension: 600 }) };
