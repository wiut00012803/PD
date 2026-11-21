//@prelude2
const p2 = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(p2);
const set = await figma.getNodeByIdAsync("35:1932");
const kit = await figma.getNodeByIdAsync("35:1557");
const btnSet = await figma.getNodeByIdAsync("35:1724");
const menuC = kit.findOne(n => n.type === "COMPONENT" && n.name === "icon/ui/menu");
const kLabel = Object.keys(btnSet.componentPropertyDefinitions).find(k => k.startsWith("Label"));
// remove previously generated size variants (idempotent), normalise defaults
for (const v of [...set.children]) if (/Size=(Compact|Tablet|Mobile)/.test(v.name)) v.remove();
for (const v of set.children) if (!v.name.includes("Size=")) v.name = `Size=Default, ${v.name}`;
function burger(th) {
  const b = figma.createFrame(); b.name = "Menu button"; b.layoutMode = "HORIZONTAL"; b.resize(44, 44); b.primaryAxisSizingMode = "FIXED"; b.counterAxisSizingMode = "FIXED"; b.primaryAxisAlignItems = "CENTER"; b.counterAxisAlignItems = "CENTER";
  rad(b, "radius/full"); b.fills = [paint("color/surface/glass-strong", th)]; b.strokes = [paint("color/border/glass", th)]; b.strokeWeight = 1; b.strokeAlign = "INSIDE";
  const i = menuC.createInstance(); i.rescale(20 / 24); recolor(i, "color/icon/primary", th); b.appendChild(i); return b;
}
for (const th of ["Light", "Dark"]) {
  const base = set.children.find(v => v.name === `Size=Default, Theme=${th}`);
  // Compact 960
  const c = base.clone(); set.appendChild(c); c.name = `Size=Compact, Theme=${th}`; c.resize(912, 60);
  const links = c.findOne(n => n.name === "Links"); links.itemSpacing = 20; links.children.find(t => t.characters === "О нас").remove();
  // Tablet 820 (touch)
  const t = base.clone(); set.appendChild(t); t.name = `Size=Tablet, Theme=${th}`; t.resize(740, 64);
  t.findOne(n => n.name === "Links").remove();
  const act = t.findOne(n => n.name === "Actions"); const oldBtn = act.children.find(n => n.type === "INSTANCE" && n.name.includes("Style=") || n === act.children[2]);
  const btnM = btnSet.children.find(v => v.name === `Style=Primary, Size=M, State=Default, Theme=${th}`).createInstance(); btnM.setProperties({ [kLabel]: "Консультация" });
  act.insertChild(act.children.indexOf(act.children[2]), btnM); act.children[3].remove();
  act.appendChild(burger(th)); act.itemSpacing = 8;
  // Mobile 390
  const m = base.clone(); set.appendChild(m); m.name = `Size=Mobile, Theme=${th}`; m.resize(350, 60); m.paddingLeft = 18; m.paddingRight = 8;
  m.findOne(n => n.name === "Links").remove();
  const logo = m.children[0]; logo.rescale(28 / logo.height);
  const ma = m.findOne(n => n.name === "Actions"); ma.children[2].remove(); ma.children[0].remove();
  const tg = ma.children[0]; tg.rescale(44 / tg.height); ma.appendChild(burger(th)); ma.itemSpacing = 8;
}
// keep the split light/dark showcase layout
themeLayout(set, 1, 24, 48);
await applyGlassStyles(set);
const sec = set.parent;
return { variants: set.children.map(v => `${v.name} ${Math.round(v.width)}`), shot: await screenshot(set, { maxDimension: 1800 }) };
