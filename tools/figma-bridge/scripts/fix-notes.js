const page = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(page);
const root = await figma.getNodeByIdAsync("39:3297");
const A = root.findOne(n => n.name === "Структура");
const cols = A.findAll(n => n.type === "FRAME" && n.layoutMode === "VERTICAL" && n.children.some(c => c.findOne && c.findOne(t => t.type === "TEXT" && (t.characters === "Обратная связь"))) && n.children.some(c => c.name === "Floating messenger"));
if (cols.length !== 2) return { error: "expected 2 note columns", n: cols.length };
const [orig, dup] = cols[0].findOne(t => t.type === "TEXT" && t.characters === "SPA и GitHub Pages") ? [cols[1], cols[0]] : cols;
const spa = dup.children.find(c => c.findOne && c.findOne(t => t.type === "TEXT" && t.characters === "SPA и GitHub Pages"));
orig.insertChild(1, spa); dup.remove();
const load = async t => { for (const s of t.getStyledTextSegments(["fontName"])) await figma.loadFontAsync(s.fontName); };
for (const t of A.findAll(t => t.type === "TEXT" && (t.characters === "index.html" || t.characters === "consultation.html"))) { await load(t); t.characters = t.characters === "index.html" ? "экран #/" : "экран #/consultation"; }
return { ok: true, notes: orig.children.map(c => c.name), shot: await screenshot(A, { maxDimension: 1200 }) };
