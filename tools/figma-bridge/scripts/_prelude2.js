// Style C helpers: Light/Dark token maps (two collections, same names), Inter text styles.
const L = {"color/bg/page":"VariableID:22:20","color/bg/subtle":"VariableID:22:21","color/bg/muted":"VariableID:22:22","color/bg/inverse":"VariableID:22:23","color/bg/inverse-raised":"VariableID:22:24","color/bg/accent":"VariableID:22:25","color/bg/accent-hover":"VariableID:22:26","color/bg/accent-subtle":"VariableID:22:27","color/surface/glass":"VariableID:35:1519","color/surface/glass-strong":"VariableID:35:1521","color/surface/glass-active":"VariableID:35:1523","color/glow/primary":"VariableID:35:1525","color/glow/secondary":"VariableID:35:1527","color/text/primary":"VariableID:22:28","color/text/secondary":"VariableID:22:29","color/text/tertiary":"VariableID:22:30","color/text/on-inverse":"VariableID:22:31","color/text/on-inverse-muted":"VariableID:22:32","color/text/accent":"VariableID:22:33","color/text/on-accent":"VariableID:22:34","color/text/error":"VariableID:22:35","color/text/gradient-start":"VariableID:35:1537","color/text/gradient-end":"VariableID:35:1539","color/border/default":"VariableID:22:36","color/border/strong":"VariableID:22:37","color/border/inverse":"VariableID:22:38","color/border/accent":"VariableID:22:39","color/border/glass":"VariableID:35:1545","color/border/glass-strong":"VariableID:35:1547","color/border/accent-subtle":"VariableID:35:1549","color/icon/primary":"VariableID:22:40","color/icon/secondary":"VariableID:22:41","color/icon/accent":"VariableID:22:42","color/icon/on-inverse":"VariableID:22:43"};
const D = {"color/bg/page":"VariableID:35:1511","color/bg/subtle":"VariableID:35:1512","color/bg/muted":"VariableID:35:1513","color/bg/inverse":"VariableID:35:1514","color/bg/inverse-raised":"VariableID:35:1515","color/bg/accent":"VariableID:35:1516","color/bg/accent-hover":"VariableID:35:1517","color/bg/accent-subtle":"VariableID:35:1518","color/surface/glass":"VariableID:35:1520","color/surface/glass-strong":"VariableID:35:1522","color/surface/glass-active":"VariableID:35:1524","color/glow/primary":"VariableID:35:1526","color/glow/secondary":"VariableID:35:1528","color/text/primary":"VariableID:35:1529","color/text/secondary":"VariableID:35:1530","color/text/tertiary":"VariableID:35:1531","color/text/on-inverse":"VariableID:35:1532","color/text/on-inverse-muted":"VariableID:35:1533","color/text/accent":"VariableID:35:1534","color/text/on-accent":"VariableID:35:1535","color/text/error":"VariableID:35:1536","color/text/gradient-start":"VariableID:35:1538","color/text/gradient-end":"VariableID:35:1540","color/border/default":"VariableID:35:1541","color/border/strong":"VariableID:35:1542","color/border/inverse":"VariableID:35:1543","color/border/accent":"VariableID:35:1544","color/border/glass":"VariableID:35:1546","color/border/glass-strong":"VariableID:35:1548","color/border/accent-subtle":"VariableID:35:1550","color/icon/primary":"VariableID:35:1551","color/icon/secondary":"VariableID:35:1552","color/icon/accent":"VariableID:35:1553","color/icon/on-inverse":"VariableID:35:1554"};
const S = {"spacing/2xs":"VariableID:22:45","spacing/xs":"VariableID:22:46","spacing/sm":"VariableID:22:47","spacing/md":"VariableID:22:48","spacing/lg":"VariableID:22:49","spacing/xl":"VariableID:22:50","spacing/2xl":"VariableID:22:51","spacing/3xl":"VariableID:22:52","spacing/4xl":"VariableID:22:53","spacing/5xl":"VariableID:22:54","radius/none":"VariableID:22:55","radius/sm":"VariableID:22:56","radius/md":"VariableID:22:57","radius/lg":"VariableID:22:58","radius/xl":"VariableID:35:1555","radius/2xl":"VariableID:35:1556","radius/full":"VariableID:22:59"};
const VV = {};
await Promise.all([...Object.values(L), ...Object.values(D), ...Object.values(S)].map(async id => { VV[id] = await figma.variables.getVariableByIdAsync(id); }));
await Promise.all([["Inter","Regular"],["Inter","Medium"],["Inter","Semi Bold"],["Inter","Bold"]].map(([family, style]) => figma.loadFontAsync({ family, style })));
const TS = Object.fromEntries((await figma.getLocalTextStylesAsync()).map(s => [s.name, s.id]));
const TV = th => th === "Dark" ? D : L;
const paint = (name, th = "Light") => figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", VV[TV(th)[name]]);
const sv = n => VV[S[n]];
function pad(n, v, h) { n.setBoundVariable("paddingTop", sv(v)); n.setBoundVariable("paddingBottom", sv(v)); n.setBoundVariable("paddingLeft", sv(h)); n.setBoundVariable("paddingRight", sv(h)); }
function rad(n, r) { for (const c of ["topLeftRadius","topRightRadius","bottomLeftRadius","bottomRightRadius"]) n.setBoundVariable(c, sv(r)); }
function gap(n, v) { n.setBoundVariable("itemSpacing", sv(v)); }
function recolor(node, name, th) { for (const n of node.findAll(() => true)) { if (["FRAME","INSTANCE","COMPONENT","GROUP"].includes(n.type)) continue; if (n.strokes && n.strokes.length) n.strokes = [paint(name, th)]; if (Array.isArray(n.fills) && n.fills.length) n.fills = [paint(name, th)]; } }
async function txt(str, style, colorName, th) { const t = figma.createText(); await t.setTextStyleIdAsync(TS[style]); t.characters = str; t.fills = [paint(colorName, th)]; return t; }
function wrapFill(parent, t) { parent.appendChild(t); t.textAutoResize = "HEIGHT"; t.layoutSizingHorizontal = "FILL"; return t; }
const hexRGB = h => ({ r: parseInt(h.slice(1,3),16)/255, g: parseInt(h.slice(3,5),16)/255, b: parseInt(h.slice(5,7),16)/255 });
const solid = (h, op = 1) => [{ type: "SOLID", color: hexRGB(h), opacity: op }];
const GRAD = { Light: ["#8A5F26", "#C08A3E"], Dark: ["#C08A3E", "#F3D8A8"] };
const gradPaint = th => [{ type: "GRADIENT_LINEAR", gradientTransform: [[1, 0, 0], [0, 1, 0]], gradientStops: [{ position: 0, color: { ...hexRGB(GRAD[th][0]), a: 1 } }, { position: 1, color: { ...hexRGB(GRAD[th][1]), a: 1 } }] }];
const shadowFx = (a, y, r) => ({ type: "DROP_SHADOW", color: { r: 0.055, g: 0.102, b: 0.169, a }, offset: { x: 0, y }, radius: r, spread: 0, visible: true, blendMode: "NORMAL" });
// Glass surface: fill + hairline border + (light only) soft shadow + background blur
function glass(n, th, strong = false) {
  n.fills = [paint(strong ? "color/surface/glass-strong" : "color/surface/glass", th)];
  n.strokes = [paint(strong ? "color/border/glass-strong" : "color/border/glass", th)]; n.strokeWeight = 1; n.strokeAlign = "INSIDE";
  n.effects = th === "Light" ? [shadowFx(0.04, 1, 2), shadowFx(0.06, 10, 30), { type: "BACKGROUND_BLUR", radius: 24, visible: true }] : [{ type: "BACKGROUND_BLUR", radius: 24, visible: true }];
  return n;
}
// Link every glass node under `root` to the shared effect styles "Glass / Light" | "Glass / Dark" (call at the end of a script).
async function applyGlassStyles(root) {
  const fx = Object.fromEntries((await figma.getLocalEffectStylesAsync()).map(s => [s.name, s.id]));
  const darkIds = new Set(Object.values(D));
  const inInst = n => { let p = n.parent; while (p && p.type !== "PAGE") { if (p.type === "INSTANCE") return true; p = p.parent; } return false; };
  let n = 0;
  for (const node of root.findAll(x => "effects" in x && x.effects.some(e => e.type === "BACKGROUND_BLUR"))) {
    if (node.type === "INSTANCE" || inInst(node)) continue;
    const f = Array.isArray(node.fills) ? node.fills.find(p => p.boundVariables && p.boundVariables.color) : null;
    await node.setEffectStyleIdAsync(f && darkIds.has(f.boundVariables.color.id) ? fx["Glass / Dark"] : fx["Glass / Light"]); n++;
  }
  return n;
}
function comp(name, dir) { const c = figma.createComponent(); c.name = name; c.layoutMode = dir; c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "AUTO"; c.fills = []; c.counterAxisAlignItems = "CENTER"; return c; }
// Lay out a component set: Light variants left on light bg, Dark variants right on navy (hard-split gradient).
function themeLayout(set, cols, gapPx = 24, padPx = 48) {
  set.layoutMode = "NONE";
  const groups = { Light: set.children.filter(c => /Theme=Light/.test(c.name)), Dark: set.children.filter(c => /Theme=Dark/.test(c.name)) };
  const colW = Math.max(...set.children.map(c => c.width));
  const rowsH = arr => { const hs = []; arr.forEach((c, i) => { const r = Math.floor(i / cols); hs[r] = Math.max(hs[r] || 0, c.height); }); return hs; };
  const groupW = cols * colW + (cols - 1) * gapPx;
  let maxH = 0;
  for (const [k, arr] of Object.entries(groups)) {
    const hs = rowsH(arr); const x0 = k === "Light" ? padPx : groupW + padPx * 3;
    arr.forEach((c, i) => { const r = Math.floor(i / cols), cc = i % cols; c.x = x0 + cc * (colW + gapPx); c.y = padPx + hs.slice(0, r).reduce((a, b) => a + b + gapPx, 0); });
    maxH = Math.max(maxH, hs.reduce((a, b) => a + b, 0) + (hs.length - 1) * gapPx);
  }
  const W = groupW * 2 + padPx * 4, H = maxH + padPx * 2;
  set.resizeWithoutConstraints(W, H);
  set.fills = [{ type: "GRADIENT_LINEAR", gradientTransform: [[1, 0, 0], [0, 1, 0]], gradientStops: [{ position: 0, color: { ...hexRGB("#F6F7F9"), a: 1 } }, { position: 0.5, color: { ...hexRGB("#F6F7F9"), a: 1 } }, { position: 0.5, color: { ...hexRGB("#0E1A2B"), a: 1 } }, { position: 1, color: { ...hexRGB("#0E1A2B"), a: 1 } }] }];
  set.cornerRadius = 20; set.strokes = []; return set;
}
