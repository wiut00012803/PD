const page = await figma.getNodeByIdAsync("0:1"); await figma.setCurrentPageAsync(page);
const cover = await plainCover(page, "01", "Логотип", "Логотип B1 «Портик» в палитре белый / тёмно-синий / охра и история его разработки — концепции и итерации. Мастер-компоненты логотипа лежат на странице 02 в разделе UI Kit.", [
  ["Логотип B1 «Портик»", "Знак, горизонтальный и вертикальный локапы, монохром, иконка приложения и фавикон"],
  ["Итерации A и B", "8 итераций в двух палитрах"],
  ["Концепции", "4 первых направления логотипа"],
]);
for (const t of page.findAllWithCriteria({ types: ["TEXT"] })) {
  const s = t.characters;
  if (s === "Логотип · утверждён") await setText(t, "Логотип");
  else if (s === "Логотип · концепции (архив)") await setText(t, "Логотип · концепции");
  else if (s === "Логотип · итерации (архив)") await setText(t, "Логотип · итерации");
  else if (s.startsWith("Архив. Первые четыре направления")) await setText(t, "Первые четыре направления логотипа: A — лигатура, B — портик, C — вордмарк, D — печать.");
  else if (s.startsWith("Архив. По четыре итерации")) await setText(t, "По четыре итерации направлений A и B в двух палитрах: молочный / тёмно-коричневый / охра и белый / тёмно-синий / охра.");
  else if (s.startsWith("Портик: фронтон, антаблемент")) await setText(t, "Портик: фронтон, антаблемент и ступени, колонны образуют буквы P и D одной высоты. Палитра: белый #FFFFFF, тёмно-синий #0E1A2B, охра #C08A3E. Логотип хранится как вектор (надпись переведена в кривые). Мастер-компоненты Logo / Mark, Horizontal, Vertical, Favicon — на странице 02, раздел UI Kit. Здесь — витрина экземпляров.");
}
const r = await renameAll(page);
page.name = "01 · Logo";
const Y0 = cover.height + 240; let x = 0;
const order = ["Logo · B1 Portico", "Logo · Iterations A & B", "Logo · Concepts"];
for (const name of order) { const s = page.children.find(n => n.type === "SECTION" && n.name === name); if (s) { s.x = x; s.y = Y0; x += s.width + 240; } }
return { renamed: r.n, left: r.left, status: statusWords(page), top: page.children.map(n => n.name) };
