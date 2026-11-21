log("start");
const hex = (h, a = 1) => ({ r: parseInt(h.slice(1,3),16)/255, g: parseInt(h.slice(3,5),16)/255, b: parseInt(h.slice(5,7),16)/255, a });
const css = n => `var(--${n.replace(/\//g, "-")})`;
const all = await figma.variables.getLocalVariablesAsync();
const prim = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:22:2");
const col = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:22:19");
const spc = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:22:44");
const pm = prim.modes[0].modeId, sm = spc.modes[0].modeId;
const byName = (c, n) => all.find(v => v.variableCollectionId === c.id && v.name === n);
// --- new primitives
const NEWP = { "ochre/400": hex("#D29E55"), "ochre/300": hex("#F3D8A8"), "gray/500": hex("#7A8494"), "red/400": hex("#F97066"), "blue/300": hex("#7FA3D9"),
  "white/a4": hex("#FFFFFF", 0.04), "white/a8": hex("#FFFFFF", 0.08), "white/a14": hex("#FFFFFF", 0.14), "white/a16": hex("#FFFFFF", 0.16), "white/a70": hex("#FFFFFF", 0.70), "white/a90": hex("#FFFFFF", 0.90),
  "navy/a8": hex("#0E1A2B", 0.08), "navy/a12": hex("#0E1A2B", 0.12), "ochre/a14": hex("#C08A3E", 0.14), "ochre/a30": hex("#C08A3E", 0.30) };
const P = {};
for (const v of all.filter(v => v.variableCollectionId === prim.id)) P[v.name] = v;
for (const [n, val] of Object.entries(NEWP)) { let v = P[n]; if (!v) { v = figma.variables.createVariable(n, prim, "COLOR"); v.scopes = []; v.setVariableCodeSyntax("WEB", css("primitive/" + n)); P[n] = v; } v.setValueForMode(pm, val); }
log("primitives");
// --- Light = existing "Color" collection (renamed); Dark = separate collection with the same names (Starter plan: 1 mode per collection)
col.name = "Color · Light"; const light = col.modes[0].modeId;
let dcol = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === "Color · Dark");
if (!dcol) { dcol = figma.variables.createVariableCollection("Color · Dark"); dcol.renameMode(dcol.modes[0].modeId, "Dark"); }
const dark = dcol.modes[0].modeId;
log("collections");
const BG = ["FRAME_FILL", "SHAPE_FILL"], TX = ["TEXT_FILL"], BD = ["STROKE_COLOR"], IC = ["SHAPE_FILL", "STROKE_COLOR"], ANY = ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL", "STROKE_COLOR"];
const MAP = [
 ["color/bg/page", "gray/50", "navy/900", BG], ["color/bg/subtle", "white", "navy/800", BG], ["color/bg/muted", "gray/100", "navy/800", BG],
 ["color/bg/inverse", "navy/900", "navy/800", BG], ["color/bg/inverse-raised", "navy/800", "navy/700", BG],
 ["color/bg/accent", "ochre/500", "ochre/500", BG], ["color/bg/accent-hover", "ochre/600", "ochre/400", BG], ["color/bg/accent-subtle", "ochre/a14", "ochre/a14", BG],
 ["color/surface/glass", "white/a70", "white/a4", BG], ["color/surface/glass-strong", "white/a90", "white/a8", BG], ["color/surface/glass-active", "white", "white/a16", BG],
 ["color/glow/primary", "ochre/500", "ochre/500", BG], ["color/glow/secondary", "blue/300", "ochre/500", BG],
 ["color/text/primary", "navy/900", "white", TX], ["color/text/secondary", "gray/600", "gray/400", TX], ["color/text/tertiary", "gray/400", "gray/500", TX],
 ["color/text/on-inverse", "white", "white", TX], ["color/text/on-inverse-muted", "gray/400", "gray/400", TX], ["color/text/accent", "ochre/700", "ochre/400", TX],
 ["color/text/on-accent", "navy/900", "navy/900", TX], ["color/text/error", "red/600", "red/400", TX],
 ["color/text/gradient-start", "ochre/700", "ochre/500", ANY], ["color/text/gradient-end", "ochre/500", "ochre/300", ANY],
 ["color/border/default", "gray/200", "navy/700", BD], ["color/border/strong", "navy/900", "white", BD], ["color/border/inverse", "navy/700", "navy/700", BD], ["color/border/accent", "ochre/500", "ochre/500", BD],
 ["color/border/glass", "navy/a8", "white/a8", BD], ["color/border/glass-strong", "navy/a12", "white/a14", BD], ["color/border/accent-subtle", "ochre/a30", "ochre/a30", BD],
 ["color/icon/primary", "navy/900", "white", IC], ["color/icon/secondary", "gray/600", "gray/400", IC], ["color/icon/accent", "ochre/700", "ochre/500", IC], ["color/icon/on-inverse", "white", "white", IC],
];
const ids = {};
const dids = {};
for (const [n, l, d, sc] of MAP) {
  let v = byName(col, n); if (!v) { v = figma.variables.createVariable(n, col, "COLOR"); }
  v.setVariableCodeSyntax("WEB", css(n)); v.scopes = sc; v.setValueForMode(light, { type: "VARIABLE_ALIAS", id: P[l].id }); ids[n] = v.id;
  let w = byName(dcol, n); if (!w) { w = figma.variables.createVariable(n, dcol, "COLOR"); }
  w.setVariableCodeSyntax("WEB", css(n)); w.scopes = sc; w.setValueForMode(dark, { type: "VARIABLE_ALIAS", id: P[d].id }); dids[n] = w.id;
}
log("semantic");
// --- radii for style C
for (const [n, val] of [["radius/sm", 8], ["radius/md", 14], ["radius/lg", 20], ["radius/xl", 24], ["radius/2xl", 28]]) {
  let v = byName(spc, n); if (!v) { v = figma.variables.createVariable(n, spc, "FLOAT"); v.scopes = ["CORNER_RADIUS"]; v.setVariableCodeSyntax("WEB", css(n)); } v.setValueForMode(sm, val); ids[n] = v.id;
}
log("radii");
// --- text styles → Inter
for (const s of ["Regular", "Medium", "Semi Bold"]) await figma.loadFontAsync({ family: "Inter", style: s });
const TS = {
 "Display": ["Semi Bold", 84, 104, -3.5, "ORIGINAL"], "Heading/H1": ["Semi Bold", 56, 108, -3, "ORIGINAL"], "Heading/H2": ["Semi Bold", 44, 112, -2.5, "ORIGINAL"],
 "Heading/H3": ["Semi Bold", 32, 120, -2, "ORIGINAL"], "Heading/H4": ["Semi Bold", 22, 130, -1, "ORIGINAL"], "Body/L": ["Regular", 20, 150, -0.5, "ORIGINAL"],
 "Body/M": ["Regular", 17, 150, 0, "ORIGINAL"], "Body/S": ["Regular", 15, 150, 0, "ORIGINAL"], "Label": ["Medium", 14, 140, 0, "ORIGINAL"],
 "Button": ["Semi Bold", 16, 120, 0, "ORIGINAL"], "Overline": ["Semi Bold", 12, 140, 8, "UPPER"], "Stat": ["Semi Bold", 64, 100, -4, "ORIGINAL"],
};
const styles = await figma.getLocalTextStylesAsync();
const fontsBefore = {};
for (const s of styles) { const t = TS[s.name]; if (!t) continue; fontsBefore[s.name] = s.fontName.family; s.fontName = { family: "Inter", style: t[0] }; s.fontSize = t[1]; s.lineHeight = { unit: "PERCENT", value: t[2] }; s.letterSpacing = { unit: "PERCENT", value: t[3] }; s.textCase = t[4]; }
log("text styles");
return { darkCollection: dcol.id, dids, semanticCount: MAP.length, ids, fontsBefore };
