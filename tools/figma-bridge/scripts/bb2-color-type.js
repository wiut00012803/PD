//@prelude
const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
const bb = await figma.getNodeByIdAsync("31:71");
for (const c of [...bb.children]) if (c.name.startsWith("04 ·") || c.name.startsWith("05 ·")) c.remove();
const prims = Object.fromEntries((await figma.variables.getLocalVariablesAsync("COLOR")).filter(v => v.variableCollectionId === "VariableCollectionId:22:2").map(v => [v.name, v]));
const primPaint = n => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', prims[n]);
const HEX = {"white":"#FFFFFF","navy/900":"#0E1A2B","navy/800":"#18273D","navy/700":"#253750","navy/100":"#E7EAF0","ochre/700":"#8A5F26","ochre/600":"#A9772F","ochre/500":"#C08A3E","ochre/100":"#F6EEE2","gray/50":"#F6F7F9","gray/100":"#EEF0F3","gray/200":"#DDE1E6","gray/400":"#9AA3AF","gray/600":"#5E6673"};
const rgbStr = h => { const c = hexRGB(h); return `RGB ${Math.round(c.r*255)} ${Math.round(c.g*255)} ${Math.round(c.b*255)}`; };
const lum = h => { const c = hexRGB(h); const f = x => x <= 0.03928 ? x/12.92 : Math.pow((x+0.055)/1.055, 2.4); return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b); };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

function sheet(name) { const s = figma.createFrame(); s.name = name; s.layoutMode = "VERTICAL"; s.resize(1440, 100); s.primaryAxisSizingMode = "AUTO"; s.counterAxisSizingMode = "FIXED"; s.paddingTop = s.paddingBottom = 96; s.paddingLeft = s.paddingRight = 120; s.itemSpacing = 56; s.fills = [paint("color/bg/page")]; bb.appendChild(s); return s; }
async function header(s, num, title, lead) { const h = al("VERTICAL", { name: "Header", itemSpacing: 16 }); s.appendChild(h); h.appendChild(await txt(`${num} — ${title.toUpperCase()}`, "Overline", "color/text/accent")); h.appendChild(await txt(title, "Heading/H1", "color/text/primary")); if (lead) wrapW(h, await txt(lead, "Body/L", "color/text/secondary"), 820); return h; }
async function sub(s, title) { const t = await txt(title, "Heading/H3", "color/text/primary"); s.appendChild(t); return t; }

// ===== 04 COLORS
const s4 = sheet("04 · Цвета");
await header(s4, "04", "Цвета", "Палитра строгая: тёмно-синий передаёт надёжность и статус, белый — ясность, охра — ценность и акцент. Охру используем дозированно: кнопки действия, тонкие линии, ключевые цифры.");
const main = al("HORIZONTAL", { name: "Main colors", itemSpacing: 24 }); s4.appendChild(main);
for (const [prim, name, fgVar, role, token] of [
  ["navy/900", "Тёмно-синий", "color/text/on-inverse", "Основной цвет: тёмные секции, текст, логотип.", "color/bg/inverse · color/text/primary"],
  ["white", "Белый", "color/text/primary", "Фон страниц, карточек, текст на тёмном.", "color/bg/page"],
  ["ochre/500", "Охра", "color/text/on-accent", "Акцент: кнопки CTA, линии, иконки, цифры.", "color/bg/accent"],
]) {
  const col = al("VERTICAL", { name, itemSpacing: 12 });
  const sw = al("VERTICAL", { name: "Swatch", itemSpacing: 6, paddingTop: 28, paddingLeft: 28, paddingRight: 28, paddingBottom: 28, primaryAxisAlignItems: "MAX" });
  sw.resize(384, 260); sw.primaryAxisSizingMode = "FIXED"; sw.counterAxisSizingMode = "FIXED"; sw.fills = [primPaint(prim)]; rad(sw, "radius/sm");
  if (prim === "white") { sw.strokes = [paint("color/border/default")]; sw.strokeWeight = 1; }
  sw.appendChild(await txt(name, "Heading/H4", fgVar));
  sw.appendChild(await txt(`${HEX[prim]} · ${rgbStr(HEX[prim])}`, "Body/S", fgVar));
  col.appendChild(sw);
  wrapW(col, await txt(role, "Body/S", "color/text/secondary"), 384);
  col.appendChild(await txt(token, "Body/S", "color/text/tertiary"));
  main.appendChild(col);
}
// proportions bar
const propWrap = al("VERTICAL", { name: "Proportions", itemSpacing: 12 }); s4.appendChild(propWrap);
propWrap.appendChild(await txt("Пропорции на макетах ≈ 60 / 30 / 10", "Label", "color/text/primary"));
const bar = al("HORIZONTAL", { name: "Bar" }); propWrap.appendChild(bar); bar.strokes = [paint("color/border/default")]; bar.strokeWeight = 1; bar.clipsContent = true; rad(bar, "radius/sm");
for (const [prim, w, label, fg] of [["white", 720, "Белый 60%", "color/text/primary"], ["navy/900", 360, "Тёмно-синий 30%", "color/text/on-inverse"], ["ochre/500", 120, "Охра 10%", "color/text/on-accent"]]) {
  const seg = al("HORIZONTAL", { paddingLeft: 16, counterAxisAlignItems: "CENTER" }); seg.resize(w, 48); seg.primaryAxisSizingMode = "FIXED"; seg.counterAxisSizingMode = "FIXED"; seg.fills = [primPaint(prim)];
  seg.appendChild(await txt(label, "Body/S", fg)); bar.appendChild(seg);
}
// secondary palette
await sub(s4, "Дополнительные оттенки");
const secRow = al("HORIZONTAL", { name: "Secondary", itemSpacing: 16, counterAxisSpacing: 24 }); secRow.layoutWrap = "WRAP"; secRow.primaryAxisSizingMode = "FIXED"; secRow.resize(1200, 100); s4.appendChild(secRow);
for (const [prim, use] of [["navy/800","Приподнятые блоки на тёмном"],["navy/700","Линии на тёмном"],["navy/100","Мягкий фон"],["ochre/700","Текст-акцент на белом"],["ochre/600","Hover кнопки"],["ochre/100","Фон иконок"],["gray/50","Фон секций"],["gray/100","Фон фото-заглушек"],["gray/200","Линии, рамки"],["gray/400","Подписи на тёмном"],["gray/600","Вторичный текст"]]) {
  const c = al("VERTICAL", { itemSpacing: 8, name: prim });
  const sw = figma.createRectangle(); sw.resize(201, 96); sw.fills = [primPaint(prim)]; rad(sw, "radius/sm"); sw.strokes = [paint("color/border/default")]; sw.strokeWeight = 1; c.appendChild(sw);
  c.appendChild(await txt(prim, "Label", "color/text/primary"));
  c.appendChild(await txt(HEX[prim], "Body/S", "color/text/secondary"));
  wrapW(c, await txt(use, "Body/S", "color/text/tertiary"), 201);
  secRow.appendChild(c);
}
// contrast table
await sub(s4, "Контрастность (WCAG 2.1)");
const table = al("VERTICAL", { name: "Contrast", itemSpacing: 0 }); s4.appendChild(table); table.layoutSizingHorizontal = "FILL";
for (const [fg, bg, label] of [["#0E1A2B","#FFFFFF","Тёмно-синий текст на белом"],["#5E6673","#FFFFFF","Вторичный текст (gray/600) на белом"],["#8A5F26","#FFFFFF","Текст-акцент (ochre/700) на белом"],["#0E1A2B","#C08A3E","Текст кнопки на охре (Primary)"],["#FFFFFF","#0E1A2B","Белый текст на тёмно-синем"],["#9AA3AF","#0E1A2B","Подписи (gray/400) на тёмно-синем"],["#C08A3E","#FFFFFF","Охра (ochre/500) на белом — только крупно/декор"]]) {
  const r = contrast(fg, bg); const pass = r >= 4.5 ? "AA ✓" : r >= 3 ? "AA для крупного текста" : "Только декор";
  const row = al("HORIZONTAL", { itemSpacing: 24, counterAxisAlignItems: "CENTER", paddingTop: 14, paddingBottom: 14 }); table.appendChild(row); row.layoutSizingHorizontal = "FILL";
  row.strokes = [paint("color/border/default")]; row.strokeTopWeight = 0; row.strokeLeftWeight = 0; row.strokeRightWeight = 0; row.strokeBottomWeight = 1;
  const chip = al("HORIZONTAL", { paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6 }); chip.fills = solid(bg); chip.strokes = [paint("color/border/default")]; chip.strokeWeight = 1; rad(chip, "radius/sm");
  const ct = figma.createText(); await ct.setTextStyleIdAsync(TS["Label"]); ct.characters = "Аа Право"; ct.fills = solid(fg); chip.appendChild(ct); row.appendChild(chip);
  const l = await txt(label, "Body/M", "color/text/primary"); row.appendChild(l); l.layoutGrow = 1;
  row.appendChild(await txt(`${r.toFixed(1)} : 1`, "Label", "color/text/primary"));
  const p = await txt(pass, "Body/S", r >= 4.5 ? "color/text/accent" : "color/text/secondary"); row.appendChild(p); p.resize(200, p.height); p.textAutoResize = "HEIGHT";
}

// ===== 05 TYPOGRAPHY
const s5 = sheet("05 · Типографика");
await header(s5, "05", "Типографика", "Две гарнитуры: классическая антиква Cormorant Garamond для заголовков и современный гротеск Manrope для текста и интерфейса. Обе бесплатны (Google Fonts, лицензия OFL) и поддерживают кириллицу и латиницу, включая узбекские oʻ и gʻ.");
const fonts = al("HORIZONTAL", { name: "Fonts", itemSpacing: 24 }); s5.appendChild(fonts);
for (const [fam, styleName, role, weights] of [["Cormorant Garamond", "Display", "Заголовки, цифры, цитаты", "Medium 500 · SemiBold 600"], ["Manrope", "Heading/H4", "Текст, кнопки, навигация, подписи", "Regular 400 · Medium 500 · SemiBold 600 · Bold 700"]]) {
  const card = al("VERTICAL", { name: fam, itemSpacing: 16, paddingTop: 40, paddingBottom: 40, paddingLeft: 40, paddingRight: 40 }); card.resize(588, 100); card.counterAxisSizingMode = "FIXED"; card.fills = [paint("color/bg/subtle")]; rad(card, "radius/sm");
  const big = figma.createText(); big.fontName = { family: fam, style: fam === "Manrope" ? "SemiBold" : "SemiBold" }; big.characters = "Аа Bb"; big.fontSize = 120; big.lineHeight = { unit: "PERCENT", value: 100 }; big.fills = [paint("color/text/primary")]; card.appendChild(big);
  card.appendChild(await txt(fam, "Heading/H3", "color/text/primary"));
  card.appendChild(await txt(role, "Body/M", "color/text/secondary"));
  card.appendChild(await txt(weights, "Body/S", "color/text/tertiary"));
  const glyphs = figma.createText(); glyphs.fontName = { family: fam, style: "Medium" }; glyphs.characters = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ\nабвгдеёжзийклмнопрстуфхцчшщъыьэюя\nABCDEFGHIJKLMNOPQRSTUVWXYZ oʻ gʻ Oʻ Gʻ\n0123456789 $ % № « » — ?!"; glyphs.fontSize = 15; glyphs.lineHeight = { unit: "PERCENT", value: 160 }; glyphs.fills = [paint("color/text/secondary")];
  wrapFill(card, glyphs);
  fonts.appendChild(card);
}
await sub(s5, "Шкала стилей");
const scale = al("VERTICAL", { name: "Type scale", itemSpacing: 0 }); s5.appendChild(scale); scale.layoutSizingHorizontal = "FILL";
const styles = await figma.getLocalTextStylesAsync();
const mobile = { "Display": 44, "Heading/H1": 36, "Heading/H2": 30, "Heading/H3": 24, "Stat": 44 };
for (const st of styles) {
  const row = al("HORIZONTAL", { itemSpacing: 32, counterAxisAlignItems: "CENTER", paddingTop: 20, paddingBottom: 20 }); scale.appendChild(row); row.layoutSizingHorizontal = "FILL";
  row.strokes = [paint("color/border/default")]; row.strokeTopWeight = 0; row.strokeLeftWeight = 0; row.strokeRightWeight = 0; row.strokeBottomWeight = 1;
  const meta = al("VERTICAL", { itemSpacing: 4 }); meta.resize(260, 10); meta.counterAxisSizingMode = "FIXED"; row.appendChild(meta);
  meta.appendChild(await txt(st.name, "Label", "color/text/primary"));
  const lh = st.lineHeight.unit === "PERCENT" ? Math.round(st.fontSize * st.lineHeight.value / 100) : "auto";
  wrapW(meta, await txt(`${st.fontName.family} ${st.fontName.style} · ${st.fontSize}/${lh}${mobile[st.name] ? ` · моб. ${mobile[st.name]}` : ""}`, "Body/S", "color/text/secondary"), 260);
  const sample = figma.createText(); await sample.setTextStyleIdAsync(st.id);
  sample.characters = st.name === "Stat" ? "1 200+" : st.name === "Overline" ? "Бесплатная консультация" : st.name === "Button" ? "Получить консультацию" : (st.fontSize >= 32 ? "Правовая защита бизнеса" : "Защищаем интересы клиентов в суде и в переговорах");
  sample.fills = [paint("color/text/primary")]; row.appendChild(sample); sample.layoutGrow = 1; sample.textAutoResize = "HEIGHT";
}
await sub(s5, "Три языка сайта");
const langs = al("HORIZONTAL", { name: "Languages", itemSpacing: 24 }); s5.appendChild(langs);
for (const [code, h, p] of [["RU", "Правовая защита вашего бизнеса", "Получите бесплатную онлайн-консультацию адвоката и узнайте, как решить ваш вопрос."], ["UZ", "Biznesingiz uchun huquqiy himoya", "Advokatdan bepul onlayn maslahat oling va masalangizni qanday hal qilishni bilib oling. Oʻzbekiston, gʻoya, oʻz vaqtida."], ["EN", "Legal protection for your business", "Get a free online consultation with a lawyer and find out how to resolve your case."]]) {
  const c = al("VERTICAL", { name: code, itemSpacing: 12, paddingTop: 32, paddingBottom: 32, paddingLeft: 32, paddingRight: 32 }); c.resize(384, 10); c.counterAxisSizingMode = "FIXED"; c.strokes = [paint("color/border/default")]; c.strokeWeight = 1; rad(c, "radius/sm");
  c.appendChild(await txt(code, "Overline", "color/text/accent"));
  wrapFill(c, await txt(h, "Heading/H3", "color/text/primary"));
  wrapFill(c, await txt(p, "Body/M", "color/text/secondary"));
  langs.appendChild(c);
}
const s4s = await screenshot(s4, { maxDimension: 1800 });
const s5s = await screenshot(s5, { maxDimension: 1800 });
return { s4: s4.id, s5: s5.id, s4s, s5s };
