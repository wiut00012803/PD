// PD Bridge — runs scripts sent from the local bridge server inside this Figma file.
// Scripts get: figma, screenshot(node, {maxDimension, scale}), al(direction, props), setProps(node, props).
figma.showUI(__html__, { width: 260, height: 132, title: "PD Bridge" });

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

function setProps(node, props) {
  if (!props) return node;
  const p = Object.assign({}, props);
  if (p.layoutMode) { node.layoutMode = p.layoutMode; delete p.layoutMode; }
  const w = p.width, h = p.height; delete p.width; delete p.height;
  if (w !== undefined || h !== undefined) node.resize(w !== undefined ? w : node.width, h !== undefined ? h : node.height);
  for (const k of Object.keys(p)) node[k] = p[k];
  return node;
}

// Auto-layout frame that hugs content on both axes, no fill.
function al(direction, props) {
  if (typeof direction === "object") { props = direction; direction = "HORIZONTAL"; }
  const f = figma.createFrame();
  f.layoutMode = direction || "HORIZONTAL";
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.fills = [];
  return setProps(f, props);
}

function safe(value) {
  const seen = new WeakSet();
  return JSON.parse(JSON.stringify(value === undefined ? null : value, (k, v) => {
    if (v && typeof v === "object") {
      if ("id" in v && "type" in v && typeof v.type === "string" && "parent" in v) return { id: v.id, type: v.type, name: v.name };
      if (seen.has(v)) return "[circular]";
      seen.add(v);
    }
    if (v instanceof Uint8Array) return "[bytes " + v.length + "]";
    return v;
  }));
}

figma.ui.onmessage = async (msg) => {
  if (!msg || msg.type !== "job") return;
  const images = [];
  const screenshot = async (node, opts) => {
    opts = opts || {};
    if (typeof node === "string") node = await figma.getNodeByIdAsync(node);
    if (!node) throw new Error("screenshot: node not found");
    let scale = opts.scale;
    if (!scale) { const max = opts.maxDimension || 1600; scale = Math.min(2, max / Math.max(node.width, node.height)); }
    const bytes = await node.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: scale } });
    images.push({ name: (opts.name || node.name || "shot").replace(/[^\wЀ-ӿ .-]+/g, "_"), base64: figma.base64Encode(bytes) });
    return { id: node.id, name: node.name, width: node.width, height: node.height, scale };
  };
  // Progress log + timeout so a hanging API call can't wedge the plugin forever.
  const progress = [];
  const t0 = Date.now();
  const log = (s) => { progress.push(`${Date.now() - t0}ms ${s}`); };
  const TIMEOUT = 150000;
  // Remember top-level nodes of already-loaded pages so a failed script can't leave orphans at (0,0).
  // Unloaded pages throw on .children (dynamic-page access) — skip them.
  const before = new Map();
  for (const p of figma.root.children) { try { before.set(p.id, new Set(p.children.map(n => n.id))); } catch (_) {} }
  try {
    const fn = new AsyncFunction("figma", "screenshot", "al", "setProps", "log", msg.code);
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error(`Timeout after ${TIMEOUT / 1000}s`)), TIMEOUT));
    const result = await Promise.race([fn(figma, screenshot, al, setProps, log), timeout]);
    figma.ui.postMessage({ type: "result", id: msg.id, ok: true, result: safe({ result, progress }), images });
  } catch (e) {
    const cleaned = [];
    for (const p of figma.root.children) {
      const known = before.get(p.id);
      if (!known) continue;
      try { for (const n of [...p.children]) if (!known.has(n.id)) { cleaned.push(n.type + ":" + n.name); n.remove(); } } catch (_) {}
    }
    figma.ui.postMessage({ type: "result", id: msg.id, ok: false, error: String(e) + (e && e.stack ? "\n" + e.stack : "") + "\nProgress:\n" + progress.join("\n") + (cleaned.length ? "\nRemoved orphans: " + cleaned.join(", ") : ""), images });
  }
};
