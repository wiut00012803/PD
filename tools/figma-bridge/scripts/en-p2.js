const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
const cover = await plainCover(page, "02", "Брендбук и UI Kit", "Правила фирменного стиля и библиотека компонентов. Брендбук — документ для заказчика и подрядчиков: логотип, цвета светлой и тёмной темы, типографика, фото, интерфейс, тон. UI Kit — мастер-компоненты, из которых собраны макеты сайта.", [
  ["Брендбук", "9 листов: обложка, логотип, охранное поле, недопустимое использование, цвета, типографика, фото и иконки, UI, тон общения"],
  ["UI Kit", "Логотип, иконки, кнопки, мессенджеры, языки, тема, шапка, карточки, FAQ — в светлой и тёмной теме"],
]);
const r = await renameAll(page);
page.name = "02 · Brandbook & UI Kit";
const Y0 = cover.height + 240; let x = 0;
for (const name of ["Brandbook", "UI Kit"]) { const s = page.children.find(n => n.type === "SECTION" && n.name === name); if (s) { s.x = x; s.y = Y0; x += s.width + 240; } }
return { renamed: r.n, left: r.left, status: statusWords(page), top: page.children.map(n => n.name) };
