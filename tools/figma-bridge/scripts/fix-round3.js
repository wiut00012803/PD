//@prelude2
const hex = (h, a = 1) => ({ ...hexRGB(h), a });
// 1) Light theme accent: deeper ochre + white text
const prim = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:22:2"); const pm = prim.modes[0].modeId;
const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
let o650 = allVars.find(v => v.variableCollectionId === prim.id && v.name === "ochre/650");
if (!o650) { o650 = figma.variables.createVariable("ochre/650", prim, "COLOR"); o650.scopes = []; o650.setVariableCodeSyntax("WEB", "var(--primitive-ochre-650)"); }
o650.setValueForMode(pm, hex("#9A6A2A"));
const P = n => allVars.find(v => v.variableCollectionId === prim.id && v.name === n) || (n === "ochre/650" ? o650 : null);
const lightCol = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:22:19"); const lm = lightCol.modes[0].modeId;
for (const [tok, p] of [["color/bg/accent", "ochre/650"], ["color/bg/accent-hover", "ochre/700"], ["color/text/on-accent", "white"]]) VV[L[tok]].setValueForMode(lm, { type: "VARIABLE_ALIAS", id: P(p).id });
log("tokens");

// 2) Remove "v2 / стиль C / версия 2.0 / tech-премиум" wording
const p2 = await figma.getNodeByIdAsync("5:2"), p3 = await figma.getNodeByIdAsync("20:2");
await p2.loadAsync(); await p3.loadAsync();
const TEXT_REPL = [
  ["Pravoe Delo · UI Kit v2", "Pravoe Delo · UI Kit"], ["UI-компоненты · стиль C", "UI-компоненты"], ["Брендбук · версия 2.0 · 2026", "Брендбук · 2026"],
  ["Логотип, цвета светлой и тёмной темы, типографика, фотографии и интерфейс в стиле «тёмный tech-премиум».", "Логотип, цвета светлой и тёмной темы, типографика, фотографии и элементы интерфейса."],
  ["Компоненты UI Kit v2 в обеих темах.", "Компоненты UI Kit в обеих темах."],
  ["A · Apple-стиль", "Альтернатива · Apple-стиль"], ["B · Редакционная роскошь", "Альтернатива · редакционный стиль"], ["C · Тёмный tech-премиум", "Выбранный стиль · тёмная тема"], ["C · Light", "Выбранный стиль · светлая тема"],
  ["Светлая версия стиля C:", "Светлая тема выбранного стиля:"],
];
const NAME_REPL = { "UI Kit v2 — Style C": "UI Kit — Pravoe Delo", "Style exploration": "Поиск стиля", "A · Apple-стиль": "Альтернатива · Apple-стиль", "B · Редакционная роскошь": "Альтернатива · редакционный стиль", "C · Тёмный tech-премиум": "Выбранный стиль · тёмная тема", "C · Light": "Выбранный стиль · светлая тема", "C1L · Hero": "Hero · светлая", "C2L · Bento": "Практики · светлая", "C1 · Hero": "Hero · тёмная", "C2 · Bento dark": "Практики · тёмная" };
const changed = [];
for (const pg of [p2, p3]) {
  for (const n of pg.findAll(() => true)) {
    if (NAME_REPL[n.name]) { changed.push(`name: ${n.name}`); n.name = NAME_REPL[n.name]; }
    if (n.type === "TEXT") {
      let s = n.characters, ns = s;
      for (const [a, b] of TEXT_REPL) ns = ns.split(a).join(b);
      ns = ns.replace(/UI Kit v2/g, "UI Kit");
      if (ns !== s) {
        for (const seg of n.getStyledTextSegments(["fontName"])) await figma.loadFontAsync(seg.fontName);
        n.characters = ns; changed.push(`text: ${s.slice(0, 50)}`);
      }
    }
    if ((n.type === "COMPONENT_SET" || (n.type === "COMPONENT" && n.parent.type !== "COMPONENT_SET")) && /v2|стил[ьея] C/.test(n.description)) { n.description = n.description.replace(/ v2/g, "").replace(/стил[ьея] C/g, "стиль бренда"); changed.push(`desc: ${n.name}`); }
  }
}
const leftovers = [];
for (const pg of [p2, p3]) for (const n of pg.findAll(n => n.type === "TEXT" || n.type === "FRAME" || n.type === "COMPONENT_SET")) {
  const s = n.type === "TEXT" ? n.characters : n.name;
  if (/\bv2\b|Style C|стил[ьея] C|вариант C|версия 2|tech-премиум|итерац/i.test(s)) leftovers.push(`${n.type}: ${s.slice(0, 70)}`);
}
log("rename");

// 3) Contrast table + ochre swatch label on sheet 04
const bb = await figma.getNodeByIdAsync("31:71");
const s4 = bb.children.find(c => c.name.startsWith("04 ·"));
const core = s4.findOne(n => n.name === "Core");
for (const t of core.findAll(n => n.type === "TEXT" && (n.characters === "Охра" || n.characters === "#C08A3E"))) t.fills = solid("#0E1A2B");
const roleT = core.findOne(n => n.type === "TEXT" && n.characters.startsWith("Акцент:"));
if (roleT && !roleT.characters.includes("#9A6A2A")) roleT.characters = "Акцент: CTA, свечение, иконки, градиенты. Кнопки в светлой теме — глубокая охра #9A6A2A с белым текстом.";
const tbl = s4.findOne(n => n.name === "Contrast");
const row = tbl.children.find(r => r.findOne(t => t.type === "TEXT" && t.characters.startsWith("Обе темы")));
if (row) {
  row.findOne(t => t.type === "TEXT" && t.characters.startsWith("Обе темы")).characters = "Тёмная: тёмный текст на кнопке CTA";
  const nr = row.clone(); tbl.insertChild(tbl.children.indexOf(row), nr);
  const chip = nr.children[0]; chip.fills = solid("#9A6A2A"); chip.children[0].fills = solid("#FFFFFF");
  nr.children[1].characters = "Светлая: белый текст на кнопке CTA (ochre/650)";
  const lum = h => { const c = hexRGB(h); const f = x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const r = (lum("#FFFFFF") + 0.05) / (lum("#9A6A2A") + 0.05);
  nr.children[2].characters = `${r.toFixed(1)} : 1`; nr.children[3].characters = r >= 4.5 ? "AA — подходит" : "Только крупный текст";
}
log("contrast");
const kit = await figma.getNodeByIdAsync("35:1557");
const btnShot = await screenshot(kit.findOne(n => n.name === "Section / Button"), { maxDimension: 1600 });
const tblShot = await screenshot(tbl, { maxDimension: 1000 });
return { changed, leftovers, btnShot, tblShot };
