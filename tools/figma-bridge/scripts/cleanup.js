const page = await figma.getNodeByIdAsync("5:2"); await figma.setCurrentPageAsync(page);
const removed = [];
for (const id of ["31:697","31:698","31:715","31:716"]) {
  const n = await figma.getNodeByIdAsync(id);
  // safety: only top-level orphans with the expected shape
  if (n && n.parent === page && ((n.type === "FRAME" && n.children.length === 0) || (n.type === "RECTANGLE" && n.name === "Photo / meeting"))) { removed.push(`${n.type}:${n.name}`); n.remove(); }
}
let renamed = 0;
for (const rootId of ["26:169","31:71"]) {
  const root = await figma.getNodeByIdAsync(rootId);
  for (const n of root.findAll(n => n.type === "FRAME" && n.name === "Frame")) {
    const t = n.findOne(c => c.type === "TEXT");
    const kind = n.layoutMode === "VERTICAL" ? "Stack" : n.layoutMode === "HORIZONTAL" ? "Row" : "Group";
    n.name = t ? `${kind} · ${t.characters.replace(/\s+/g, " ").slice(0, 28)}` : kind;
    renamed++;
  }
}
const left = page.children.map(n => `${n.type}:${n.name}`);
const stillFrame = (await figma.getNodeByIdAsync("26:169")).findAll(n => n.name === "Frame").length + (await figma.getNodeByIdAsync("31:71")).findAll(n => n.name === "Frame").length;
return { removed, renamed, pageTop: left, stillNamedFrame: stillFrame };
