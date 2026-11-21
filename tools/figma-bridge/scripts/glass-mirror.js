//@prelude2
const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
const NEWBG = "#EFF1F5";
const prim = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:22:2"); const pm = prim.modes[0].modeId;
const allC = await figma.variables.getLocalVariablesAsync("COLOR");
const getP = n => { let v = allC.find(x => x.variableCollectionId === prim.id && x.name === n); if (!v) { v = figma.variables.createVariable(n, prim, "COLOR"); v.scopes = []; v.setVariableCodeSyntax("WEB", `var(--primitive-${n.replace(/\//g, "-")})`); } return v; };
const bgP = getP("gray/75"); bgP.setValueForMode(pm, { ...hexRGB(NEWBG), a: 1 });
const w80 = getP("white/a80"); w80.setValueForMode(pm, { r: 1, g: 1, b: 1, a: 0.8 });
const white = getP("white");
const lm = (await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:22:19")).modes[0].modeId;
const alias = v => ({ type: "VARIABLE_ALIAS", id: v.id });
VV[L["color/bg/page"]].setValueForMode(lm, alias(bgP));
VV[L["color/border/glass"]].setValueForMode(lm, alias(w80));
VV[L["color/border/glass-strong"]].setValueForMode(lm, alias(white));
log("tokens");
// identical glass effect in both themes: background blur only
const fx = await figma.getLocalEffectStylesAsync();
for (const s of fx) if (s.name === "Glass / Light" || s.name === "Glass / Dark") { s.effects = [{ type: "BACKGROUND_BLUR", radius: 24, visible: true }]; s.description = "Стекло: размытие фона 24. Заливка color/surface/glass(-strong) — чуть светлее фона; рамка color/border/glass — светлый блик (одинаково в обеих темах)."; }
// strip leftover raw drop shadows from light glass nodes not linked to the style (e.g. stat overrides)
let raw = 0;
for (const n of page.findAll(x => "effects" in x && !x.effectStyleId && x.effects.some(e => e.type === "BACKGROUND_BLUR") && x.effects.some(e => e.type === "DROP_SHADOW"))) { n.effects = n.effects.filter(e => e.type !== "DROP_SHADOW"); raw++; }
log("effects");
// component-set split backgrounds use the new light bg
const kit = await figma.getNodeByIdAsync("35:1557");
let sets = 0;
for (const s of kit.findAll(n => n.type === "COMPONENT_SET")) { const f = s.fills[0]; if (f && f.type === "GRADIENT_LINEAR" && f.gradientStops.length === 4) { const st = f.gradientStops.map((g, i) => i < 2 ? { ...g, color: { ...hexRGB(NEWBG), a: 1 } } : g); s.fills = [{ ...f, gradientStops: st }]; sets++; } }
// contrast table rows for light theme
const lum = h => { const c = hexRGB(h); const f = x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const bb = await figma.getNodeByIdAsync("31:71"); const tbl = bb.findOne(n => n.name === "Contrast" && n.parent.name.startsWith("04"));
const out = [];
for (const [label, fg] of [["Светлая: основной текст на фоне", "#0E1A2B"], ["Светлая: вторичный текст", "#5E6673"], ["Светлая: текст-акцент (ochre/700)", "#8A5F26"]]) {
  const row = tbl.children.find(r => r.children[1] && r.children[1].characters === label); if (!row) continue;
  row.children[0].fills = solid(NEWBG); const r = ratio(fg, NEWBG); row.children[2].characters = `${r.toFixed(1)} : 1`; row.children[3].characters = r >= 4.5 ? "AA — подходит" : "Только крупный текст"; out.push([label, r.toFixed(2)]);
}
log("contrast");
const s6 = bb.children.find(c => c.name.startsWith("06 ·")), s7 = bb.children.find(c => c.name.startsWith("07 ·"));
return { raw, sets, contrast: out,
  a: await screenshot(kit.findOne(n => n.name === "Section / Cards").children[1].children[0], { maxDimension: 1000 }),
  b: await screenshot(kit.findOne(n => n.name === "Section / Header"), { maxDimension: 1600 }),
  c: await screenshot(s6.findOne(n => n.name === "Composition Light"), { maxDimension: 1000 }),
  d: await screenshot(s7.children.find(n => n.name === "Panel Light"), { maxDimension: 1200 }) };
