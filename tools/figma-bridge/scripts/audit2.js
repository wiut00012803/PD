const LOGO_SETS = ["20:47", "20:104", "20:157", "21:177"];
const logoSetIds = new Set(LOGO_SETS);
const out = { pages: [] };
for (const p of figma.root.children) {
  await p.loadAsync();
  const pi = { id: p.id, name: p.name, bg: p.backgrounds.map(b => b.type === "SOLID" ? `#${[b.color.r, b.color.g, b.color.b].map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join("")}` : b.type), top: [] };
  for (const n of p.children) {
    const t = { id: n.id, type: n.type, name: n.name, x: Math.round(n.x), y: Math.round(n.y), w: Math.round(n.width), h: Math.round(n.height) };
    if ("fills" in n && Array.isArray(n.fills) && n.fills[0] && n.fills[0].type === "SOLID") { const c = n.fills[0].color; t.fill = `#${[c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join("")}`; }
    if (n.type === "SECTION") t.children = n.children.map(k => `${k.type}:${k.name}`);
    pi.top.push(t);
  }
  // component sets / components (purple) locations
  pi.componentSets = p.findAllWithCriteria({ types: ["COMPONENT_SET"] }).map(s => `${s.name} (in ${s.parent.name})`);
  pi.looseComponents = p.findAllWithCriteria({ types: ["COMPONENT"] }).filter(c => c.parent.type !== "COMPONENT_SET").length;
  // logo usage
  let logoInst = 0, otherLogoLike = [];
  for (const i of p.findAllWithCriteria({ types: ["INSTANCE"] })) { const mc = await i.getMainComponentAsync(); if (mc && mc.parent && logoSetIds.has(mc.parent.id)) logoInst++; }
  pi.logoInstances = logoInst;
  // texts mentioning the firm name outside logo components/instances
  const firm = [];
  for (const t of p.findAllWithCriteria({ types: ["TEXT"] })) {
    if (!/pravoe\s*delo/i.test(t.characters)) continue;
    let a = t.parent, inLogo = false, inInst = false, path = [];
    while (a && a.type !== "PAGE") { if (a.type === "COMPONENT_SET" && logoSetIds.has(a.id)) inLogo = true; if (a.type === "INSTANCE") inInst = true; path.push(a.name); a = a.parent; }
    if (inLogo) continue;
    firm.push({ text: t.characters.slice(0, 60), font: t.fontName === figma.mixed ? "mixed" : `${t.fontName.family} ${t.fontName.style}`, inInstance: inInst, path: path.slice(0, 3).reverse().join(" / ") });
  }
  pi.firmNameTexts = firm.slice(0, 60); pi.firmNameCount = firm.length;
  // fonts used in non-instance texts
  const fonts = {}; for (const t of p.findAllWithCriteria({ types: ["TEXT"] })) { const f = t.fontName === figma.mixed ? "mixed" : t.fontName.family; fonts[f] = (fonts[f] || 0) + 1; }
  pi.fonts = fonts;
  out.pages.push(pi);
}
// logo component content check
const sets = await Promise.all(LOGO_SETS.map(id => figma.getNodeByIdAsync(id)));
out.logoSets = sets.map(s => ({ id: s.id, name: s.name, page: (() => { let a = s; while (a.type !== "PAGE") a = a.parent; return a.name; })(), variants: s.children.map(v => v.name), colors: [...new Set(s.findAll(n => "fills" in n && Array.isArray(n.fills)).flatMap(n => [...n.fills, ...(n.strokes || [])]).filter(f => f.type === "SOLID").map(f => `#${[f.color.r, f.color.g, f.color.b].map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join("")}`))] }));
return out;
