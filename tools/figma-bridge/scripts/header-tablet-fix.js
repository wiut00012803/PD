//@prelude2
const p2 = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(p2);
const set = await figma.getNodeByIdAsync("35:1932");
for (const th of ["Light", "Dark"]) {
  const v = set.children.find(c => c.name === `Size=Tablet, Theme=${th}`);
  const act = v.findOne(n => n.name === "Actions");
  const insts = act.children.filter(n => n.type === "INSTANCE");
  for (const i of insts) { const mc = await i.getMainComponentAsync(); if (mc && mc.parent && mc.parent.name === "Lang Switcher") i.remove(); if (mc && mc.parent && mc.parent.name === "Theme Toggle" && i.height < 44) i.rescale(44 / i.height); }
}
set.description = "Плавающая шапка-капсула. Size: Default (1440), Compact (960), Tablet (820, касания: тема и меню 44 px, языки — в меню), Mobile (390). Theme: Light / Dark.";
themeLayout(set, 1, 24, 48); await applyGlassStyles(set);
return { shot: await screenshot(set, { maxDimension: 1600 }) };
