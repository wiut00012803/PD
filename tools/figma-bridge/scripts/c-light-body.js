const root = await figma.getNodeByIdAsync("34:1115");
for (const n of [...root.children]) if (n.name === "C · Light") n.remove();
const LIGHTBG = "#F6F7F9";
const glass = (n, op = 0.7) => { n.fills = fill(WHITE, op); stroke(n, NAVY, 0.08); n.effects = [shadow(0.04, 1, 2), shadow(0.05, 10, 30), { type: "BACKGROUND_BLUR", radius: 24, visible: true }]; return n; };
const grad = (a, b) => [{ type: "GRADIENT_LINEAR", gradientTransform: [[1, 0, 0], [0, 1, 0]], gradientStops: [{ position: 0, color: { ...rgb(a), a: 1 } }, { position: 1, color: { ...rgb(b), a: 1 } }] }];
function note(text) {
  const n = F("HORIZONTAL", { itemSpacing: 8, counterAxisAlignItems: "CENTER", paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12, name: "Annotation · cursor glow" });
  n.cornerRadius = 999; n.fills = fill(WHITE, 0.9); n.strokes = fill(OCHRE); n.strokeWeight = 1; n.dashPattern = [4, 3];
  const d = figma.createEllipse(); d.resize(8, 8); d.fills = fill(OCHRE); n.appendChild(d);
  n.appendChild(T(text, "Inter", "Medium", 12, OCHRE7)); return n;
}
const col = await column("C · Light", "Светлая версия стиля C: светлый фон, матовое «стекло» с тонкой тёмной границей и мягкой тенью, свечение охрой. Градиент текста темнее, чтобы сохранить контраст на светлом фоне.");
root.appendChild(col); col.fills = [{ type: "SOLID", color: { r: 0.91, g: 0.92, b: 0.937 } }]; col.paddingTop = col.paddingBottom = col.paddingLeft = col.paddingRight = 64;
{
  const hero = box("VERTICAL", 1440, 900, { name: "C1L · Hero", counterAxisAlignItems: "CENTER", paddingTop: 24 }); hero.fills = fill(LIGHTBG); hero.clipsContent = true; col.appendChild(hero);
  const glow = figma.createEllipse(); glow.resize(1000, 520); glow.fills = fill(OCHRE, 0.30); glow.effects = [{ type: "LAYER_BLUR", radius: 220, visible: true }]; abs(hero, glow, 220, -200); glow.name = "Glow · follows cursor";
  const glow2 = figma.createEllipse(); glow2.resize(700, 500); glow2.fills = fill("#7FA3D9", 0.16); glow2.effects = [{ type: "LAYER_BLUR", radius: 220, visible: true }]; abs(hero, glow2, 900, 500);
  const nav = box("HORIZONTAL", 1100, 60, { paddingLeft: 24, paddingRight: 10, counterAxisAlignItems: "CENTER", primaryAxisAlignItems: "SPACE_BETWEEN", name: "Nav · floating" }); nav.cornerRadius = 999; glass(nav, 0.7);
  const links = F("HORIZONTAL", { itemSpacing: 28 }); for (const l of ["Услуги", "Команда", "Кейсы", "Контакты"]) links.appendChild(T(l, "Inter", "Medium", 14, GRAY6));
  const right = F("HORIZONTAL", { itemSpacing: 12, counterAxisAlignItems: "CENTER" }); add(right, seg("light"), capsule("Консультация", OCHRE, NAVY, { size: 14, py: 10, px: 18, style: "Semi Bold" }));
  add(nav, logo(hSet, "Primary", 34), links, right); hero.appendChild(nav);
  const c = F("VERTICAL", { counterAxisAlignItems: "CENTER", itemSpacing: 28, paddingTop: 112 }); hero.appendChild(c);
  const chip = F("HORIZONTAL", { itemSpacing: 8, counterAxisAlignItems: "CENTER", paddingTop: 7, paddingBottom: 7, paddingLeft: 14, paddingRight: 14 }); chip.cornerRadius = 999; glass(chip, 0.6);
  const dot = figma.createEllipse(); dot.resize(7, 7); dot.fills = fill(OCHRE); add(chip, dot, T("Бесплатная онлайн-консультация", "Inter", "Medium", 14, GRAY6)); c.appendChild(chip);
  const hl = T("Правовая защита\nнового уровня", "Inter", "Semi Bold", 84, NAVY, { ls: -3.5, lh: 104, align: "CENTER" });
  hl.setRangeFills(hl.characters.indexOf("нового"), hl.characters.length, grad(OCHRE7, OCHRE)); c.appendChild(hl);
  c.appendChild(T("Адвокаты Pravoe Delo: бизнес, гражданские, уголовные и семейные дела.\nОтвет в течение 24 часов.", "Inter", "Regular", 20, GRAY6, { align: "CENTER", lh: 150 }));
  const btns = F("HORIZONTAL", { itemSpacing: 14, paddingTop: 8 }); const tg = capsule("Telegram", WHITE, NAVY, { bgOp: 0.7, stroke: NAVY, strokeOp: 0.12, icon: "telegram" });
  add(btns, capsule("Получить консультацию", OCHRE, NAVY, { style: "Semi Bold" }), tg); c.appendChild(btns);
  const st = F("HORIZONTAL", { itemSpacing: 16, paddingTop: 64 }); c.appendChild(st);
  for (const [v, l] of [["15+", "лет практики"], ["1 200+", "выигранных дел"], ["94%", "в пользу клиента"]]) {
    const g = box("VERTICAL", 300, 116, { itemSpacing: 4, paddingLeft: 24, paddingTop: 22 }); g.cornerRadius = 20; glass(g, 0.6);
    add(g, T(v, "Inter", "Semi Bold", 40, NAVY, { ls: -3 }), T(l, "Inter", "Regular", 15, GRAY6)); st.appendChild(g);
  }
  abs(hero, note("Пятно охры плавно следует за курсором"), 1010, 150);

  const blk = F("VERTICAL", { name: "C2L · Bento", itemSpacing: 48, paddingTop: 112, paddingBottom: 112, paddingLeft: 120, paddingRight: 120 }); blk.resize(1440, 100); blk.counterAxisSizingMode = "FIXED"; blk.primaryAxisSizingMode = "AUTO"; blk.fills = fill(LIGHTBG); blk.clipsContent = true; col.appendChild(blk);
  const g2 = figma.createEllipse(); g2.resize(700, 400); g2.fills = fill(OCHRE, 0.18); g2.effects = [{ type: "LAYER_BLUR", radius: 200, visible: true }]; abs(blk, g2, 800, 300);
  const h = F("VERTICAL", { itemSpacing: 12 }); add(h, T("Практики", "Inter", "Semi Bold", 56, NAVY, { ls: -3 }), T("Каждое дело ведёт партнёр фирмы — от первой встречи до решения суда.", "Inter", "Regular", 20, GRAY6)); blk.appendChild(h);
  const card = (w, hgt) => { const b = box("VERTICAL", w, hgt, { itemSpacing: 14, paddingTop: 36, paddingBottom: 36, paddingLeft: 36, paddingRight: 36 }); b.cornerRadius = 24; glass(b, 0.72); return b; };
  const ib = k => { const f = box("HORIZONTAL", 52, 52, { primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" }); f.cornerRadius = 14; f.fills = fill(OCHRE, 0.12); stroke(f, OCHRE, 0.3); f.appendChild(icon(k, 26, OCHRE7)); return f; };
  const r1 = F("HORIZONTAL", { itemSpacing: 20 }); blk.appendChild(r1);
  const c1 = card(790, 380); add(c1, ib("briefcase"), T("Бизнес-право", "Inter", "Semi Bold", 32, NAVY, { ls: -2 }), T("Регистрация и ликвидация компаний, договоры, корпоративные и налоговые споры, сопровождение проверок.", "Inter", "Regular", 18, GRAY6, { w: 560, lh: 150 })); const gg = F("VERTICAL"); c1.appendChild(gg); gg.layoutGrow = 1; c1.appendChild(T("Подробнее →", "Inter", "Medium", 16, OCHRE7));
  const c2 = card(390, 380); c2.primaryAxisAlignItems = "MAX";
  const big = T("94%", "Inter", "Semi Bold", 96, NAVY, { ls: -5 }); big.fills = grad(OCHRE7, OCHRE);
  add(c2, big, T("дел решены в пользу клиента", "Inter", "Regular", 18, GRAY6)); add(r1, c1, c2);
  const r2 = F("HORIZONTAL", { itemSpacing: 20 }); blk.appendChild(r2);
  const ph = box("VERTICAL", 386, 340, {}); ph.cornerRadius = 24; ph.fills = [...img("docs"), ...fill(WHITE, 0.1)]; stroke(ph, NAVY, 0.08); r2.appendChild(ph);
  for (const [k, t, d] of [["house", "Семейные споры", "Развод, алименты, раздел имущества — конфиденциально."], ["shield", "Уголовные дела", "Защита на всех стадиях: от допроса до обжалования."]]) {
    const cd = card(387, 340); add(cd, ib(k), T(t, "Inter", "Semi Bold", 26, NAVY, { ls: -2 }), T(d, "Inter", "Regular", 17, GRAY6, { w: 315, lh: 150 })); r2.appendChild(cd);
  }
}
// same annotation on the dark hero
const darkHero = await figma.getNodeByIdAsync("34:1277");
for (const n of [...darkHero.children]) if (n.name === "Annotation · cursor glow") n.remove();
abs(darkHero, note("Пятно охры плавно следует за курсором"), 1010, 150);
const lightHero = col.children[1], lightBlk = col.children[2];
return { col: col.id, s1: await screenshot(lightHero, { maxDimension: 1440 }), s2: await screenshot(lightBlk, { maxDimension: 1440 }) };
