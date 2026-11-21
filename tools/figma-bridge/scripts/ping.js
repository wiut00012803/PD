log("start");
const page = await figma.getNodeByIdAsync("20:2"); log("got page " + page.name);
await figma.setCurrentPageAsync(page); log("setCurrentPage");
for (const [f, s] of [["Inter","Regular"],["Inter","Medium"],["Inter","Semi Bold"],["Inter","Bold"],["Manrope","Light"],["Manrope","ExtraLight"],["Cormorant Garamond","Medium"]]) { await figma.loadFontAsync({ family: f, style: s }); log(`font ${f} ${s}`); }
for (const id of ["26:188","20:47","20:104"]) { await figma.getNodeByIdAsync(id); log(`node ${id}`); }
return { children: page.children.length };
