const out = {};
const t0 = Date.now();
out.page = (await figma.getNodeByIdAsync("5:2")).name; out.t1 = Date.now()-t0;
try { await figma.variables.getVariableByIdAsync("VariableID:22:20"); out.vars = "ok"; } catch(e){ out.vars = String(e); }
out.t2 = Date.now()-t0;
try { await figma.loadFontAsync({family:"Manrope",style:"Regular"}); out.font = "ok"; } catch(e){ out.font = String(e); }
out.t3 = Date.now()-t0;
try { await figma.getLocalTextStylesAsync(); out.styles = "ok"; } catch(e){ out.styles = String(e); }
try { const n = await figma.getNodeByIdAsync("20:47"); out.markSet = n && n.name; } catch(e){ out.markSet = String(e); }
out.t4 = Date.now()-t0;
return out;
