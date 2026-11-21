const p = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(p);
const LOGO = new Set(["20:47", "20:104", "20:157", "21:177"]);
const off = [];
for (const i of p.findAllWithCriteria({ types: ["INSTANCE"] })) {
  const mc = await i.getMainComponentAsync(); if (!mc || !mc.parent || !LOGO.has(mc.parent.id)) continue;
  const r = mc.width / mc.height; if (Math.abs(i.width / i.height / r - 1) <= 0.0005) continue;
  let a = i.parent, path = [], misuse = false; while (a && a.type !== "PAGE") { path.push(a.name); if (a.name.startsWith("03 · Недопустимое")) misuse = true; a = a.parent; }
  let action = "kept (intentional misuse example)";
  if (!misuse) { i.resize(Math.round(i.height * r * 100) / 100, i.height); action = "fixed"; }
  off.push({ variant: `${mc.parent.name} / ${mc.name}`, path: path.slice(0, 4).reverse().join(" / "), action });
}
const renamed = [];
for (const n of p.findAll(n => n.type === "FRAME" && /PRAVOE DELO/.test(n.name))) { const nn = n.name.startsWith("Row") ? "Row · минимальные размеры" : "Stack · минимальный размер"; renamed.push(`${n.name} → ${nn}`); n.name = nn; }
return { off, renamed };
