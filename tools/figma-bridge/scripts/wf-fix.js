//@prelude2
const page = await figma.getNodeByIdAsync("20:2"); await figma.setCurrentPageAsync(page);
const root = await figma.getNodeByIdAsync("39:3297");
let n = 0;
for (const b of root.findAll(x => x.type === "FRAME" && x.name.startsWith("Block ·"))) { const h = b.height; b.primaryAxisSizingMode = "AUTO"; b.minHeight = h; n++; }
const fab = root.findOne(x => x.name === "Floating messenger");
const emo = fab.findOne(x => x.type === "TEXT" && x.characters === "💬");
const kit = await figma.getNodeByIdAsync("35:1557");
const tg = kit.findOne(x => x.type === "COMPONENT" && x.name === "icon/social/telegram").createInstance(); tg.rescale(18 / 24); recolor(tg, "color/icon/primary", "Light");
fab.insertChild(0, tg); emo.remove();
return { fixed: n, a: await screenshot(root.findOne(x => x.name === "Вариант A"), { maxDimension: 1400 }), b: await screenshot(root.findOne(x => x.name === "Page · Главная"), { maxDimension: 900 }) };
