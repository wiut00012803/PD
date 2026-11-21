const CY = /[А-Яа-яЁё]/;
const left = [], status = [], pages = [];
for (const p of figma.root.children) {
  await p.loadAsync(); pages.push(p.name);
  for (const n of p.findAll(n => n.type !== "TEXT" && CY.test(n.name))) left.push(`${p.name} › ${n.type}: ${n.name}`);
  for (const t of p.findAllWithCriteria({ types: ["TEXT"] })) if (/утвержд|архив|выбранн|готово/i.test(t.characters)) status.push(`${p.name}: ${t.characters.slice(0, 80)}`);
}
const p1 = figma.root.children[0]; await figma.setCurrentPageAsync(p1);
const cover = p1.children.find(n => n.name === "Page cover");
return { pages, cyrillicServiceNames: left, statusWords: status, sections: figma.root.children.map(p => p.children.filter(n => n.type === "SECTION").map(s => s.name)), cover: await screenshot(cover, { maxDimension: 1000 }) };
