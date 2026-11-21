// Re-runnable layout for page 03 (needs _prelude2 + _doc-lib): cover on top, then wireframe section + one section per layout.
const PG3 = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(PG3);
const GROUPS = [["Desktop 1440", "Mockups · 1440 · Desktop landscape"], ["Desktop 960", "Mockups · 960 · Desktop portrait"], ["Tablet 820", "Mockups · 820 · Tablet & foldable"], ["Mobile 390", "Mockups · 390 · Mobile"]];
const KINDS = ["Home", "Consultation", "Menu"];
const RE = /^(Desktop 1440|Desktop 960|Tablet 820|Mobile 390) · (Dark|Light) · (Home|Consultation|Menu)$/;
for (const n of [...PG3.children]) if (n.type === "SECTION") { for (const k of [...n.children]) { const ax = k.absoluteTransform[0][2], ay = k.absoluteTransform[1][2]; PG3.appendChild(k); k.x = ax; k.y = ay; } n.remove(); }
const frames = PG3.children.filter(n => RE.test(n.name));
const cover = PG3.children.find(n => (n.name === "Page cover" || n.name === "Обложка страницы"));
const Y0 = cover ? cover.height + 240 : 0;
const GAP = 160, PAD = 120, ROWGAP = 400;
const darkMax = Math.max(...frames.filter(f => f.name.includes("Dark")).map(f => f.height));
const lightY = PAD + darkMax + ROWGAP;
let x = 0;
const WF3 = PG3.children.find(n => n.name.startsWith("Wireframe"));
if (WF3) { const s = figma.createSection(); PG3.appendChild(s); sectionLook(s, "Structure · Wireframe"); s.x = 0; s.y = Y0; s.resizeWithoutConstraints(WF3.width + PAD * 2, WF3.height + PAD * 2); s.appendChild(WF3); WF3.x = PAD; WF3.y = PAD; x = s.width + 400; }
for (const [key, title] of GROUPS) {
  const gf = frames.filter(f => f.name.startsWith(key + " ·")); if (!gf.length) continue;
  const W = gf[0].width; const kinds = KINDS.filter(k => gf.some(f => f.name.endsWith("· " + k)));
  const lightMax = Math.max(0, ...gf.filter(f => f.name.includes("Light")).map(f => f.height));
  const sec = figma.createSection(); PG3.appendChild(sec); sectionLook(sec, title); sec.x = x; sec.y = Y0;
  sec.resizeWithoutConstraints(PAD * 2 + kinds.length * W + (kinds.length - 1) * GAP, lightY + (lightMax || darkMax) + PAD);
  for (const f of gf) { const m = f.name.match(RE); sec.appendChild(f); f.x = PAD + kinds.indexOf(m[3]) * (W + GAP); f.y = m[2] === "Dark" ? PAD : lightY; }
  x += sec.width + 400;
}
const boxes = []; for (const s of PG3.children.filter(n => n.type === "SECTION")) for (const f of s.children) boxes.push({ n: f.name, x: s.x + f.x, y: s.y + f.y, w: f.width, h: f.height });
if (cover) boxes.push({ n: cover.name, x: cover.x, y: cover.y, w: cover.width, h: cover.height });
const overlaps = []; for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) { const a = boxes[i], b = boxes[j]; if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) overlaps.push(`${a.n} × ${b.n}`); }
const stray = PG3.children.filter(n => n.type !== "SECTION" && n !== cover).map(n => n.name);
const ARR = { overlaps, stray, sections: PG3.children.filter(n => n.type === "SECTION").map(s => `${s.name} (${s.children.length})`) };
