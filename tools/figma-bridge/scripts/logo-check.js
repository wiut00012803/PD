const LOGO = new Set(["20:47", "20:104", "20:157", "21:177"]);
const res = [];
for (const pid of ["0:1", "5:2", "20:2"]) {
  const p = await figma.getNodeByIdAsync(pid); await p.loadAsync();
  for (const i of p.findAllWithCriteria({ types: ["INSTANCE"] })) {
    const mc = await i.getMainComponentAsync(); if (!mc || !mc.parent || !LOGO.has(mc.parent.id)) continue;
    // where is it
    let a = i.parent, path = []; while (a && a.type !== "PAGE") { path.push(a.name); a = a.parent; }
    const ratioOk = Math.abs(i.width / i.height - mc.width / mc.height) < 0.01;
    const ov = (i.overrides || []).filter(o => o.overriddenFields.some(f => ["fills", "strokes", "opacity", "effects", "characters", "fontName", "visible"].includes(f)));
    const flags = [];
    if (!ratioOk) flags.push(`ratio ${(i.width / i.height).toFixed(3)} vs ${(mc.width / mc.height).toFixed(3)}`);
    if (ov.length) flags.push(`overrides: ${ov.map(o => o.overriddenFields.join("+")).join("; ")}`);
    if (i.opacity < 1) flags.push(`opacity ${i.opacity}`);
    if (i.rotation) flags.push(`rotation ${Math.round(i.rotation)}`);
    if (flags.length) res.push({ page: p.name, variant: `${mc.parent.name} / ${mc.name}`, where: path.slice(0, 4).reverse().join(" / "), flags });
  }
}
// raw (non-instance) logo-like vectors outside the archive & logo masters: frames named "Mark"/"Stretched logo"
const raw = [];
for (const pid of ["5:2", "20:2"]) { const p = await figma.getNodeByIdAsync(pid); for (const n of p.findAll(n => (n.name === "Mark" || n.name === "Mark small" || n.name.includes("logo")) && n.type !== "INSTANCE")) { let a = n.parent, inLogoOrInst = false, path = []; while (a && a.type !== "PAGE") { if (a.type === "INSTANCE" || (a.type === "COMPONENT_SET" && LOGO.has(a.id))) inLogoOrInst = true; path.push(a.name); a = a.parent; } if (!inLogoOrInst) raw.push(`${p.name}: ${n.type} "${n.name}" in ${path.slice(0, 3).reverse().join(" / ")}`); } }
return { flagged: res, raw };
