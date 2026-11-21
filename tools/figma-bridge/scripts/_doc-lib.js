// Shared "documentation" helpers for page tidy-up (needs _prelude2).
const LOGO_SET_IDS = new Set(["20:47", "20:104", "20:157", "21:177"]);
function DFr(dir, o = {}) { const f = figma.createFrame(); f.layoutMode = dir; f.primaryAxisSizingMode = "AUTO"; f.counterAxisSizingMode = "AUTO"; f.fills = []; for (const k in o) f[k] = o[k]; return f; }
async function DT(s, style, tok = "color/text/primary", w) { const t = await txt(s, style, tok, "Light"); if (w) { t.resize(w, t.height); t.textAutoResize = "HEIGHT"; } return t; }
// Doc frame look: light page bg, radius 28
function docLook(f) { f.fills = [paint("color/bg/page", "Light")]; f.cornerRadius = 28; }
async function statusChip(label, kind) {
  const c = DFr("HORIZONTAL", { itemSpacing: 6, counterAxisAlignItems: "CENTER", paddingTop: 5, paddingBottom: 5, paddingLeft: 10, paddingRight: 12 }); c.cornerRadius = 999;
  const map = { ok: ["color/bg/accent-subtle", "color/text/accent"], archive: ["color/bg/muted", "color/text/secondary"], lib: ["color/bg/subtle", "color/text/primary"] };
  const [bg, fg] = map[kind] || map.lib; c.fills = [paint(bg, "Light")]; c.strokes = [paint("color/border/default", "Light")]; c.strokeWeight = 1;
  const t = await txt(label, "Label", fg, "Light"); t.fontSize = 12; c.appendChild(t); return c;
}
// Page cover: overline, title, description, contents list with statuses
async function pageHeader(page, num, title, desc, items) {
  for (const n of [...page.children]) if (n.name === "Обложка страницы") n.remove();
  const h = DFr("VERTICAL", { name: "Обложка страницы", itemSpacing: 20, paddingTop: 72, paddingBottom: 72, paddingLeft: 80, paddingRight: 80 }); docLook(h);
  page.appendChild(h); h.resize(1440, 100); h.counterAxisSizingMode = "FIXED"; h.primaryAxisSizingMode = "AUTO";
  h.appendChild(await DT(`Страница ${num}`, "Overline", "color/text/accent"));
  h.appendChild(await DT(title, "Display"));
  h.appendChild(await DT(desc, "Body/L", "color/text/secondary", 900));
  const list = DFr("VERTICAL", { name: "Содержание", itemSpacing: 0, paddingTop: 16 }); h.appendChild(list); list.layoutSizingHorizontal = "FILL";
  for (const [name, note, label, kind] of items) {
    const r = DFr("HORIZONTAL", { itemSpacing: 24, counterAxisAlignItems: "CENTER", paddingTop: 14, paddingBottom: 14 }); list.appendChild(r); r.layoutSizingHorizontal = "FILL";
    r.strokes = [paint("color/border/default", "Light")]; r.strokeTopWeight = 1; r.strokeBottomWeight = 0; r.strokeLeftWeight = 0; r.strokeRightWeight = 0;
    const n0 = await DT(name, "Heading/H4"); n0.resize(420, n0.height); n0.textAutoResize = "HEIGHT"; r.appendChild(n0);
    const d0 = await DT(note, "Body/M", "color/text/secondary"); r.appendChild(d0); d0.layoutGrow = 1; d0.textAutoResize = "HEIGHT";
    r.appendChild(await statusChip(label, kind));
  }
  h.x = 0; h.y = 0; return h;
}
function sectionLook(sec, name) { sec.name = name; sec.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }]; }
// Keep logo instances perfectly proportional (vector logo with SCALE constraints)
async function normalizeLogos(root, skip = () => false) {
  let fixed = 0;
  for (const i of root.findAllWithCriteria({ types: ["INSTANCE"] })) {
    if (skip(i)) continue;
    const mc = await i.getMainComponentAsync(); if (!mc || !mc.parent || !LOGO_SET_IDS.has(mc.parent.id)) continue;
    const r = mc.width / mc.height; if (Math.abs(i.width / i.height / r - 1) < 0.0005) continue;
    i.resize(Math.round(i.height * r * 100) / 100, i.height); fixed++;
  }
  return fixed;
}
// Restyle legacy texts (Cormorant/Manrope labels) to Inter text styles; never touch logo lettering
async function restyleLegacyTexts(root) {
  let n = 0;
  for (const t of root.findAllWithCriteria({ types: ["TEXT"] })) {
    if (t.fontName === figma.mixed) continue;
    const fam = t.fontName.family, size = t.fontSize, s = t.characters.trim();
    if (fam !== "Manrope" && fam !== "Cormorant Garamond") continue;
    if (/^(PRAVOE|PD$|LAW FIRM)/.test(s) || /^PRAVOE\s*\n?DELO$/.test(s)) continue; // logo lettering in archive tiles
    let a = t.parent, inInst = false; while (a && a.type !== "PAGE") { if (a.type === "INSTANCE") inInst = true; a = a.parent; } if (inInst) continue;
    let style, tok = "color/text/primary";
    if (fam === "Cormorant Garamond") style = size >= 50 ? "Heading/H1" : size >= 36 ? "Heading/H2" : size >= 22 ? "Heading/H3" : "Heading/H4";
    else if (t.fontName.style === "Bold" && size <= 13) { style = "Overline"; tok = "color/text/accent"; }
    else if (t.fontName.style === "SemiBold" && size <= 14) { style = "Label"; }
    else { style = size >= 15 ? "Body/M" : "Body/S"; tok = "color/text/secondary"; }
    await t.setTextStyleIdAsync(TS[style]); t.fills = [paint(tok, "Light")]; n++;
  }
  return n;
}
