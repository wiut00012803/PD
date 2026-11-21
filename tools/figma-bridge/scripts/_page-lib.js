// Page-building helpers (needs _prelude2). TH / PAGE_NAME / PAGE_W must be defined by the caller.
const C = {};
for (const [k, id] of Object.entries({ header: "35:1932", btn: "35:1724", msg: "35:1757", chip: "35:1830", ib: "35:1843", stat: "35:1975", service: "35:1968", case: "35:1994", review: "35:2021", lawyer: "35:2046", faq: "35:2081", lang: "35:1802", toggle: "35:1821", logoH: "20:104", logoV: "20:157", mark: "20:47" })) C[k] = await figma.getNodeByIdAsync(id);
const KIT = await figma.getNodeByIdAsync("35:1557");
const ICN = Object.fromEntries(KIT.findOne(n => n.name === "Icons").findAll(n => n.type === "COMPONENT").map(c => [c.name.replace("icon/", ""), c]));
const pkey = (set, prefix) => Object.keys(set.componentPropertyDefinitions).find(k => k.startsWith(prefix));
const variant = (set, props) => set.children.find(c => Object.entries(props).every(([k, v]) => c.name.includes(`${k}=${v}`)));
function inst(set, props, texts = {}) { const i = variant(set, { ...props, Theme: TH }).createInstance(); const p = {}; for (const [k, v] of Object.entries(texts)) p[pkey(set, k)] = v; if (Object.keys(p).length) i.setProperties(p); return i; }
function ico(k, size, tok = "color/icon/primary") { const i = ICN[k].createInstance(); if (size !== 24) i.rescale(size / 24); recolor(i, tok, TH); return i; }
// Swap the first nested icon instance named exactly "Icon" (not wrappers like "Icon Box") and recolor it
// NB: never recolor nested instances with variable-bound paints — Figma drops the binding (renders black).
// Swapping keeps the colour override that the parent component (Icon Box) already defines.
// Colour overrides survive a swap only by layer name, which differs per icon → after swapping, paint nested vectors with the raw accent hex.
const ACCENT_HEX = { Light: "#8A5F26", Dark: "#C08A3E" };
function paintRaw(node, hex) { for (const n of node.findAll(() => true)) { if (["FRAME", "INSTANCE", "GROUP", "COMPONENT"].includes(n.type)) continue; if (n.strokes && n.strokes.length) n.strokes = solid(hex); if (Array.isArray(n.fills) && n.fills.length) n.fills = solid(hex); } }
function swapIcon(instance, k) { const inner = instance.findAll(n => n.type === "INSTANCE" && n.name === "Icon")[0]; if (inner) { inner.swapComponent(ICN[k]); paintRaw(inner, ACCENT_HEX[TH]); } return instance; }
function Fr(dir, o = {}) { const f = figma.createFrame(); f.layoutMode = dir; f.primaryAxisSizingMode = "AUTO"; f.counterAxisSizingMode = "AUTO"; f.fills = []; for (const k in o) f[k] = o[k]; return f; }
async function T(s, style, tok = "color/text/primary", w) { const t = await txt(s, style, tok, TH); if (w) { t.resize(w, t.height); t.textAutoResize = "HEIGHT"; } return t; }
function glowAt(parent, w, h, x, y, op = 0.3, tok = "color/glow/primary", name = "Glow") { const e = figma.createEllipse(); e.name = name; e.resize(w, h); e.fills = [{ ...paint(tok, TH), opacity: op }]; e.effects = [{ type: "LAYER_BLUR", radius: Math.max(w, h) / 4, visible: true }]; parent.appendChild(e); e.layoutPositioning = "ABSOLUTE"; e.x = x; e.y = y; return e; }
function imgFill(b64) { return { type: "IMAGE", imageHash: figma.createImage(figma.base64Decode(b64)).hash, scaleMode: "FILL" }; }
async function getPage() {
  const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
  let f = pg.children.find(n => n.name === PAGE_NAME);
  if (!f) { f = Fr("VERTICAL", { name: PAGE_NAME, itemSpacing: 0, counterAxisAlignItems: "CENTER" }); f.resize(PAGE_W, 100); f.counterAxisSizingMode = "FIXED"; f.primaryAxisSizingMode = "AUTO"; f.clipsContent = true; f.fills = [paint("color/bg/page", TH)]; pg.appendChild(f); }
  return f;
}
// Standard section: vertical, centered content column of width CW
function section(page, name, o = {}) {
  const s = Fr("VERTICAL", { name: `Section · ${name}`, itemSpacing: o.gap ?? 48, paddingTop: o.pt ?? 112, paddingBottom: o.pb ?? 112, paddingLeft: o.px ?? 120, paddingRight: o.px ?? 120 });
  page.appendChild(s); s.layoutSizingHorizontal = "FILL"; return s;
}
async function sectionTitle(s, over, title, sub, o = {}) {
  const h = Fr("VERTICAL", { name: "Title", itemSpacing: 14, counterAxisAlignItems: o.center ? "CENTER" : "MIN" }); s.appendChild(h);
  if (o.center) h.layoutSizingHorizontal = "FILL";
  h.appendChild(await T(over, "Overline", "color/text/accent"));
  const t = await T(title, "Heading/H1"); if (o.center) t.textAlignHorizontal = "CENTER"; h.appendChild(t);
  if (sub) { const st = await T(sub, "Body/L", "color/text/secondary", o.subW ?? 720); if (o.center) st.textAlignHorizontal = "CENTER"; h.appendChild(st); }
  return h;
}
function glassBox(dir, o = {}, strong = false) { const b = Fr(dir, o); rad(b, o.r ?? "radius/xl"); glass(b, TH, strong); return b; }
