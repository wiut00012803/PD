// ======================= TOUCH MENU (open burger) =======================
let menuId = null;
if (LY.touch) {
  const VH = LY.W >= 600 ? 1180 : 844;
  const menu = await newPage(`${LY.label} · ${THN} · Меню`, baseX + (LY.W + 200) * 2, baseY);
  menu.primaryAxisSizingMode = "FIXED"; menu.resize(LY.W, VH); menu.itemSpacing = 0; menu.counterAxisAlignItems = "MIN";
  glowAt(menu, LY.W * 0.9, LY.W * 0.45, LY.W * 0.05, -LY.W * 0.35, TH === "Dark" ? 0.22 : 0.24, "color/glow/primary", "Glow · follows cursor");
  const top = Fr("HORIZONTAL", { name: "Menu header", primaryAxisAlignItems: "SPACE_BETWEEN", counterAxisAlignItems: "CENTER", paddingTop: LY.W < 600 ? 16 : 24, paddingLeft: LY.px, paddingRight: LY.px }); menu.appendChild(top); top.layoutSizingHorizontal = "FILL";
  const lg = variant(C.logoH, { Color: TH === "Dark" ? "Inverse" : "Primary" }).createInstance(); lg.rescale((LY.W < 600 ? 32 : 40) / lg.height); top.appendChild(lg);
  const close = glassBox("HORIZONTAL", { name: "Close", primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", r: "radius/full" }, true); close.resize(48, 48); close.primaryAxisSizingMode = "FIXED"; close.counterAxisSizingMode = "FIXED"; close.appendChild(ico("ui/x", 22)); top.appendChild(close);
  const nav = Fr("VERTICAL", { name: "Menu links", paddingTop: LY.W < 600 ? 24 : 40, paddingLeft: LY.px, paddingRight: LY.px }); menu.appendChild(nav); nav.layoutSizingHorizontal = "FILL";
  for (const l of ["Услуги", "О нас", "Кейсы", "Команда", "Отзывы", "FAQ", "Контакты"]) {
    const r = Fr("HORIZONTAL", { primaryAxisAlignItems: "SPACE_BETWEEN", counterAxisAlignItems: "CENTER", paddingTop: LY.W < 600 ? 14 : 18, paddingBottom: LY.W < 600 ? 14 : 18 }); nav.appendChild(r); r.layoutSizingHorizontal = "FILL";
    r.strokes = [paint("color/border/glass", TH)]; r.strokeBottomWeight = 1; r.strokeTopWeight = 0; r.strokeLeftWeight = 0; r.strokeRightWeight = 0;
    const t = await T(l, "Heading/H3"); if (LY.W < 600) t.fontSize = 24; r.appendChild(t); r.appendChild(ico("ui/arrow-right", 22, "color/icon/secondary"));
  }
  const bottom = Fr("VERTICAL", { name: "Menu actions", itemSpacing: 16, paddingTop: 28, paddingLeft: LY.px, paddingRight: LY.px }); menu.appendChild(bottom); bottom.layoutSizingHorizontal = "FILL";
  const prefs = Fr("HORIZONTAL", { itemSpacing: 12, counterAxisAlignItems: "CENTER", primaryAxisAlignItems: "SPACE_BETWEEN" }); bottom.appendChild(prefs); prefs.layoutSizingHorizontal = "FILL";
  const lang = variant(C.lang, { Active: "RU", Theme: TH }).createInstance(); lang.rescale(44 / lang.height); prefs.appendChild(lang);
  const tg = variant(C.toggle, { Theme: TH }).createInstance(); tg.rescale(44 / tg.height); prefs.appendChild(tg);
  const cta = primary("Получить консультацию"); bottom.appendChild(cta); cta.layoutSizingHorizontal = "FILL";
  const ms = Fr("HORIZONTAL", { itemSpacing: 12 }); bottom.appendChild(ms); ms.layoutSizingHorizontal = "FILL";
  for (const p of ["Telegram", "WhatsApp"]) { const m = inst(C.msg, { Platform: p }); ms.appendChild(m); m.layoutGrow = 1; }
  const ph = inst(C.msg, { Platform: "Phone" }); bottom.appendChild(ph); ph.layoutSizingHorizontal = "FILL";
  await finish(menu); menuId = menu.id;
}
