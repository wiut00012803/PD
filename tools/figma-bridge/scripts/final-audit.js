const p1 = await figma.getNodeByIdAsync("0:1"); await figma.setCurrentPageAsync(p1);
// fit the approved-logo section to its content
const sec = p1.children.find(n => n.type === "SECTION" && n.name.startsWith("Утверждённый"));
const w = sec.children[0]; sec.resizeWithoutConstraints(w.width + 240, w.height + 240); w.x = 120; w.y = 120;
let x = 0; for (const s of p1.children.filter(n => n.type === "SECTION").sort((a, b) => a.x - b.x)) { s.x = x; x += s.width + 240; }
const LOGO = new Set(["20:47", "20:104", "20:157", "21:177"]);
const report = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  const r = { page: p.name };
  r.topLevel = p.children.map(n => `${n.type === "SECTION" ? "§" : "▭"} ${n.name}`);
  r.sectionFills = [...new Set(p.children.filter(n => n.type === "SECTION").map(s => s.fills[0] ? `#${["r","g","b"].map(k => Math.round(s.fills[0].color[k] * 255).toString(16).padStart(2, "0")).join("")}` : "none"))];
  r.componentSets = p.findAllWithCriteria({ types: ["COMPONENT_SET"] }).length;
  r.firmNameInLabels = p.findAllWithCriteria({ types: ["TEXT"] }).filter(t => /PRAVOE DELO ·|Pravoe Delo ·|— Pravoe Delo/.test(t.characters)).map(t => t.characters);
  r.framesWithFirmName = p.findAll(n => (n.type === "FRAME" || n.type === "SECTION") && /pravoe delo/i.test(n.name)).map(n => n.name).slice(0, 5);
  const fonts = {}; for (const t of p.findAllWithCriteria({ types: ["TEXT"] })) { const f = t.fontName === figma.mixed ? "mixed" : t.fontName.family; fonts[f] = (fonts[f] || 0) + 1; } r.fonts = fonts;
  let li = 0, bad = 0; for (const i of p.findAllWithCriteria({ types: ["INSTANCE"] })) { const mc = await i.getMainComponentAsync(); if (mc && mc.parent && LOGO.has(mc.parent.id)) { li++; if (Math.abs(i.width / i.height / (mc.width / mc.height) - 1) > 0.0005) bad++; } }
  r.logoInstances = li; r.logoRatioOff = bad;
  report.push(r);
}
const logoTexts = (await Promise.all([...LOGO].map(id => figma.getNodeByIdAsync(id)))).reduce((a, s) => a + s.findAll(n => n.type === "TEXT").length, 0);
return { report, liveTextInLogoMasters: logoTexts };
