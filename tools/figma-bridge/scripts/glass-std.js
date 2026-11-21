//@prelude2
const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
// 1) Lighter, truly translucent glass in the light theme
const prim = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:22:2"); const pm = prim.modes[0].modeId;
const allC = await figma.variables.getLocalVariablesAsync("COLOR");
const getP = n => { let v = allC.find(x => x.variableCollectionId === prim.id && x.name === n); if (!v) { v = figma.variables.createVariable(n, prim, "COLOR"); v.scopes = []; v.setVariableCodeSyntax("WEB", `var(--primitive-${n.replace(/\//g, "-")})`); } return v; };
const a55 = getP("white/a55"); a55.setValueForMode(pm, { r: 1, g: 1, b: 1, a: 0.55 });
const a65 = getP("white/a65"); a65.setValueForMode(pm, { r: 1, g: 1, b: 1, a: 0.65 });
const lm = (await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:22:19")).modes[0].modeId;
VV[L["color/surface/glass"]].setValueForMode(lm, { type: "VARIABLE_ALIAS", id: a55.id });
VV[L["color/surface/glass-strong"]].setValueForMode(lm, { type: "VARIABLE_ALIAS", id: a65.id });
log("tokens");
// 2) Effect styles = the single glass recipe
const fxStyles = await figma.getLocalEffectStylesAsync();
const mkStyle = (name, effects, desc) => { let s = fxStyles.find(x => x.name === name); if (!s) s = figma.createEffectStyle(); s.name = name; s.effects = effects; s.description = desc; return s; };
const blur = { type: "BACKGROUND_BLUR", radius: 24, visible: true };
const gL = mkStyle("Glass / Light", [shadowFx(0.04, 1, 2), shadowFx(0.06, 10, 30), blur], "Стекло светлой темы: размытие фона 24 + мягкая тень. Заливка color/surface/glass(-strong), рамка color/border/glass.");
const gD = mkStyle("Glass / Dark", [blur], "Стекло тёмной темы: размытие фона 24. Заливка color/surface/glass(-strong), рамка color/border/glass.");
log("styles");
// 3) Apply to every glass node on page 02 (outside instances)
const darkIds = new Set(Object.values(D));
const insideInstance = n => { let p = n.parent; while (p && p.type !== "PAGE") { if (p.type === "INSTANCE") return true; p = p.parent; } return false; };
let applied = { light: 0, dark: 0 };
for (const n of page.findAll(n => "effects" in n && n.effects.some(e => e.type === "BACKGROUND_BLUR"))) {
  if (n.type === "INSTANCE" || insideInstance(n)) continue;
  const f = Array.isArray(n.fills) ? n.fills.find(p => p.boundVariables && p.boundVariables.color) : null;
  const isDark = f ? darkIds.has(f.boundVariables.color.id) : false;
  await n.setEffectStyleIdAsync(isDark ? gD.id : gL.id); isDark ? applied.dark++ : applied.light++;
}
log("applied");
// 4) Photo compositions: drop the stat card, adjust copy
const s6 = await figma.getNodeByIdAsync("37:2681");
let removedStats = 0;
for (const th of ["Light", "Dark"]) {
  const c = s6.findOne(n => n.name === `Composition ${th}`); const stack = c.findOne(n => n.name === "Photo stack");
  for (const x of [...stack.children]) if (x.type === "INSTANCE") { x.remove(); removedStats++; }
  const card = stack.findOne(n => n.name === "Photo card"); card.x = 30; card.y = 10; card.resize(530, 400);
  const pl = card.findOne(n => n.name === "Glass plate"); pl.y = 400 - pl.height - 20;
  const t = c.findOne(n => n.type === "TEXT" && n.characters.startsWith("Фото — в карточке"));
  if (t) { for (const seg of t.getStyledTextSegments(["fontName"])) await figma.loadFontAsync(seg.fontName); t.characters = "Фото — в карточке со скруглением 24 px и тонкой стеклянной рамкой. Подпись — на матовой стеклянной плашке поверх нижнего края."; }
}
log("compositions");
const kit = await figma.getNodeByIdAsync("35:1557");
return { applied, removedStats,
  a: await screenshot(s6.findOne(n => n.name === "Composition Light"), { maxDimension: 1000 }),
  b: await screenshot(s6.findOne(n => n.name === "Composition Dark"), { maxDimension: 1000 }),
  c: await screenshot(kit.findOne(n => n.name === "Section / Cards"), { maxDimension: 1400 }),
  d: await screenshot(kit.findOne(n => n.name === "Section / Header"), { maxDimension: 1600 }) };
