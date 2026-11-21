const PAGEID = "43:18502";
const pg = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(pg);
const page = await figma.getNodeByIdAsync(PAGEID);
// export the page in vertical slices by temporarily wrapping nothing: use exportAsync with a clip via a temporary frame is not possible,
// so export groups of consecutive sections with the page background applied.
const groups = [["Section · Hero", "Section · О нас"], ["Section · Практики", "Section · Кейсы"], ["Section · Команда", "Section · Отзывы"], ["Section · Консультация", "Section · FAQ"], ["Section · Контакты", "Footer"]];
const out = [];
for (const g of groups) {
  for (const name of g) { const s = page.findOne(n => n.name === name && n.parent === page); s.setPluginData ? null : null; s.fills = page.fills; out.push(await screenshot(s, { scale: 1, name: `390 ${name}` })); s.fills = []; }
}
return out.map(o => `${o.name} ${o.height}`);
