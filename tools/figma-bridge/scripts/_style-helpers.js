const FONTS = [["Inter","Regular"],["Inter","Medium"],["Inter","Semi Bold"],["Inter","Bold"],["Manrope","Regular"],["Manrope","Medium"],["Manrope","SemiBold"],["Manrope","Light"],["Manrope","ExtraLight"],["Cormorant Garamond","Medium"],["Cormorant Garamond","SemiBold"]];
await Promise.all(FONTS.map(([family, style]) => figma.loadFontAsync({ family, style })));
const rgb = h => ({ r: parseInt(h.slice(1,3),16)/255, g: parseInt(h.slice(3,5),16)/255, b: parseInt(h.slice(5,7),16)/255 });
const fill = (h, op = 1) => [{ type: "SOLID", color: rgb(h), opacity: op }];
const NAVY = "#0E1A2B", NAVY8 = "#18273D", OCHRE = "#C08A3E", OCHRE7 = "#8A5F26", GRAY6 = "#5E6673", GRAY4 = "#9AA3AF", WHITE = "#FFFFFF", APPLEBG = "#F5F5F7";
const img = k => [{ type: "IMAGE", imageHash: figma.createImage(figma.base64Decode(PHOTOS[k])).hash, scaleMode: "FILL" }];
const shadow = (a = 0.12, y = 1, r = 3) => ({ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a }, offset: { x: 0, y }, radius: r, spread: 0, visible: true, blendMode: "NORMAL" });
function T(s, fam, style, size, hex, o = {}) {
  const t = figma.createText(); t.fontName = { family: fam, style }; t.characters = s; t.fontSize = size; t.fills = fill(hex, o.op ?? 1);
  if (o.ls != null) t.letterSpacing = { unit: "PERCENT", value: o.ls }; if (o.lh) t.lineHeight = { unit: "PERCENT", value: o.lh };
  if (o.align) t.textAlignHorizontal = o.align; if (o.deco) t.textDecoration = o.deco; if (o.name) t.name = o.name;
  if (o.w) { t.resize(o.w, t.height); t.textAutoResize = "HEIGHT"; } return t;
}
function F(dir, props = {}) { return al(dir, props); }
function box(dir, w, h, props = {}) { const f = al(dir, props); f.resize(w, h); f.primaryAxisSizingMode = "FIXED"; f.counterAxisSizingMode = "FIXED"; return f; }
function add(parent, ...kids) { for (const k of kids) parent.appendChild(k); return parent; }
function abs(parent, n, x, y) { parent.appendChild(n); n.layoutPositioning = "ABSOLUTE"; n.x = x; n.y = y; return n; }
function stroke(n, hex, op = 1, w = 1) { n.strokes = fill(hex, op); n.strokeWeight = w; n.strokeAlign = "INSIDE"; return n; }
const ICON_IDS = { briefcase: "26:188", users: "26:287", house: "26:225", gavel: "26:218", shield: "26:278", telegram: "26:303", scale: "26:271", file: "26:211", lock: "26:237", arrow: "26:180", whatsapp: "26:306" };
const ICONS = {}; for (const [k, id] of Object.entries(ICON_IDS)) ICONS[k] = await figma.getNodeByIdAsync(id);
function icon(k, size, hex) { const i = ICONS[k].createInstance(); i.rescale(size / 24); for (const n of i.findAll(() => true)) { if (["FRAME","INSTANCE","GROUP"].includes(n.type)) continue; if (n.strokes && n.strokes.length) n.strokes = fill(hex); if (Array.isArray(n.fills) && n.fills.length) n.fills = fill(hex); } return i; }
const markSet = await figma.getNodeByIdAsync("20:47"), hSet = await figma.getNodeByIdAsync("20:104");
const logo = (set, c, h) => { const i = set.children.find(v => v.name === `Color=${c}`).createInstance(); if (h) i.rescale(h / i.height); return i; };
function seg(theme, active = "RU") {
  const dark = theme === "dark";
  const s = F("HORIZONTAL", { name: "Lang segmented", paddingTop: 3, paddingBottom: 3, paddingLeft: 3, paddingRight: 3, itemSpacing: 2 });
  s.cornerRadius = 999; s.fills = dark ? fill(WHITE, 0.08) : fill("#E8EAEE");
  for (const l of ["RU", "UZ", "EN"]) {
    const on = l === active;
    const it = F("HORIZONTAL", { paddingTop: 5, paddingBottom: 5, paddingLeft: 12, paddingRight: 12 }); it.cornerRadius = 999;
    if (on) { it.fills = dark ? fill(WHITE, 0.16) : fill(WHITE); if (!dark) it.effects = [shadow(0.14, 1, 3)]; }
    it.appendChild(T(l, "Inter", on ? "Semi Bold" : "Medium", 13, dark ? (on ? WHITE : GRAY4) : (on ? NAVY : GRAY6)));
    s.appendChild(it);
  }
  return s;
}
function capsule(label, bg, fg, o = {}) {
  const b = F("HORIZONTAL", { itemSpacing: 8, counterAxisAlignItems: "CENTER", paddingTop: o.py ?? 15, paddingBottom: o.py ?? 15, paddingLeft: o.px ?? 28, paddingRight: o.px ?? 28, name: `Button · ${label}` });
  b.cornerRadius = o.r ?? 999; b.fills = bg ? fill(bg, o.bgOp ?? 1) : []; if (o.stroke) stroke(b, o.stroke, o.strokeOp ?? 1);
  if (o.icon) b.appendChild(icon(o.icon, o.iconSize ?? 18, fg));
  b.appendChild(T(label, o.fam ?? "Inter", o.style ?? "Medium", o.size ?? 17, fg));
  if (o.after) b.appendChild(T(o.after, o.fam ?? "Inter", "Medium", o.size ?? 17, fg));
  return b;
}
async function column(title, desc) {
  const col = F("VERTICAL", { name: title, itemSpacing: 48 });
  const head = F("VERTICAL", { itemSpacing: 12, name: "Label" });
  head.appendChild(T(title, "Inter", "Bold", 44, NAVY, { ls: -2 }));
  head.appendChild(T(desc, "Inter", "Regular", 18, GRAY6, { w: 1000, lh: 150 }));
  col.appendChild(head); return col;
}
