//@prelude2
const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const D2NAME = Object.fromEntries(Object.entries(D).map(([n, id]) => [id, n]));
const LOGO_MAP = { "Color=Inverse": "Color=Primary", "Color=Mono Light": "Color=Mono Dark" };
const insideInstance = n => { let p = n.parent; while (p && p.type !== "PAGE") { if (p.type === "INSTANCE") return true; p = p.parent; } return false; };
const rebind = paints => paints.map(p => (p.boundVariables && p.boundVariables.color && D2NAME[p.boundVariables.color.id]) ? figma.variables.setBoundVariableForPaint(p, "color", VV[L[D2NAME[p.boundVariables.color.id]]]) : p);
const isGrad = p => p && p.type === "GRADIENT_LINEAR";
const out = [];
for (const [srcId, newName] of [["40:3922", "Desktop 1440 · Светлая · Главная"], ["41:4889", "Desktop 1440 · Светлая · Консультация"]]) {
  for (const n of [...pg.children]) if (n.name === newName) n.remove();
  const src = await figma.getNodeByIdAsync(srcId);
  const page = src.clone(); page.name = newName; page.x = src.x; page.y = src.y + src.height + 400;
  log("cloned " + newName);
  // 1) swap top-level instances to Light / dark-logo variants
  let swapped = 0;
  for (const i of page.findAll(n => n.type === "INSTANCE" && !insideInstance(n))) {
    const mc = await i.getMainComponentAsync(); if (!mc || !mc.parent || mc.parent.type !== "COMPONENT_SET") continue;
    let target = mc.name.includes("Theme=Dark") ? mc.name.replace("Theme=Dark", "Theme=Light") : null;
    for (const [a, b] of Object.entries(LOGO_MAP)) if (mc.name.includes(a)) target = mc.name.replace(a, b);
    if (!target) continue;
    const t = mc.parent.children.find(c => c.name === target); if (t) { i.swapComponent(t); swapped++; }
  }
  log("swapped " + swapped);
  // 2) rebind Dark tokens → Light tokens on non-instance nodes; 3) gradients
  let rebound = 0;
  for (const n of page.findAll(() => true)) {
    if (n.type === "INSTANCE" || insideInstance(n)) continue;
    if ("fills" in n && Array.isArray(n.fills) && n.fills.length) {
      if (n.type === "TEXT") {
        for (const seg of n.getStyledTextSegments(["fills"])) {
          if (seg.fills.some(isGrad)) n.setRangeFills(seg.start, seg.end, gradPaint("Light"));
          else if (seg.fills.some(p => p.boundVariables && p.boundVariables.color && D2NAME[p.boundVariables.color.id])) { n.setRangeFills(seg.start, seg.end, rebind(seg.fills)); rebound++; }
        }
      } else if (n.name === "Photo card") { n.fills = n.fills.filter(p => p.type === "IMAGE"); }
      else { const f = rebind(n.fills); if (f.some((p, k) => p !== n.fills[k])) { n.fills = f; rebound++; } }
    }
    if ("strokes" in n && n.strokes.length) { const s = rebind(n.strokes); if (s.some((p, k) => p !== n.strokes[k])) { n.strokes = s; rebound++; } }
  }
  log("rebound " + rebound);
  // 4) icons inside Icon Boxes: light accent; 5) glow strength for light bg
  const acc = hexRGB("#8A5F26");
  for (const box of page.findAll(x => x.type === "INSTANCE" && x.name === "Icon Box")) { const icon = box.children.find(k => k.type === "INSTANCE"); if (icon) for (const v of icon.findAll(() => true)) { if (["FRAME", "INSTANCE", "GROUP"].includes(v.type)) continue; if (v.strokes && v.strokes.length) v.strokes = [{ type: "SOLID", color: acc }]; if (Array.isArray(v.fills) && v.fills.length) v.fills = [{ type: "SOLID", color: acc }]; } }
  for (const g of page.findAll(n => n.type === "ELLIPSE" && n.name.startsWith("Glow"))) g.fills = [{ ...g.fills[0], opacity: 0.28 }];
  const glassN = await applyGlassStyles(page);
  out.push({ page: page.id, name: newName, swapped, rebound, glassN });
}
const shots = []; for (const o of out) shots.push(await screenshot(await figma.getNodeByIdAsync(o.page), { maxDimension: 2400 }));
return { out, shots };
