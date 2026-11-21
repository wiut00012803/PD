//@prelude2
const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const D2NAME = Object.fromEntries(Object.entries(D).map(([n, id]) => [id, n]));
const rebind = paints => paints.map(p => (p.boundVariables && p.boundVariables.color && D2NAME[p.boundVariables.color.id]) ? figma.variables.setBoundVariableForPaint(p, "color", VV[L[D2NAME[p.boundVariables.color.id]]]) : p);
const insideInstance = n => { let p = n.parent; while (p && p.type !== "PAGE") { if (p.type === "INSTANCE") return true; p = p.parent; } return false; };
const res = [];
for (const id of ["42:5365", "42:6396"]) {
  const page = await figma.getNodeByIdAsync(id);
  page.fills = rebind(page.fills);
  let mixed = 0;
  for (const t of page.findAll(n => n.type === "TEXT" && n.fills === figma.mixed)) {
    if (insideInstance(t)) continue;
    for (const seg of t.getStyledTextSegments(["fills"])) {
      if (seg.fills.some(p => p.type === "GRADIENT_LINEAR")) t.setRangeFills(seg.start, seg.end, gradPaint("Light"));
      else t.setRangeFills(seg.start, seg.end, rebind(seg.fills));
    }
    mixed++;
  }
  // any remaining Dark-bound paints anywhere outside instances?
  let leftovers = 0;
  for (const n of page.findAll(() => true)) { if (n.type === "INSTANCE" || insideInstance(n)) continue; for (const k of ["fills", "strokes"]) { const a = n[k]; if (Array.isArray(a) && a.some(p => p.boundVariables && p.boundVariables.color && D2NAME[p.boundVariables.color.id])) leftovers++; } }
  res.push({ page: page.name, mixed, leftovers });
}
const shots = []; for (const id of ["42:5365", "42:6396"]) shots.push(await screenshot(await figma.getNodeByIdAsync(id), { maxDimension: 2600 }));
return { res, shots };
