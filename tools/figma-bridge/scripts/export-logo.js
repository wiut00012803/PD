const out = {};
const sets = { horizontal: "20:104", vertical: "20:157", mark: "20:47", favicon: "21:177" };
for (const [key, id] of Object.entries(sets)) {
  const set = await figma.getNodeByIdAsync(id);
  if (!set) { out[key] = null; continue; }
  const variants = set.type === "COMPONENT_SET" ? set.children : [set];
  for (const v of variants) {
    const name = `${key}:${v.name}`;
    out[name] = { w: Math.round(v.width * 100) / 100, h: Math.round(v.height * 100) / 100, svg: await v.exportAsync({ format: "SVG_STRING", svgOutlineText: true, svgIdAttribute: false, svgSimplifyStroke: true }) };
    log(name);
  }
}
return out;
