// Usage: node run.js <script.js> [timeoutSeconds]
// Sends a script to the PD Bridge plugin and prints the result (and screenshot paths).
const fs = require("fs");
const BASE = "http://localhost:7788";

async function main() {
  const file = process.argv[2];
  const timeout = Number(process.argv[3] || 180) * 1000;
  if (!file) throw new Error("Usage: node run.js <script.js> [timeoutSeconds]");
  const status = await (await fetch(`${BASE}/status`)).json();
  if (!status.pluginConnected) console.error("WARNING: plugin has not polled in the last 5s — is PD Bridge running in Figma?");
  let code = fs.readFileSync(file, "utf8");
  // Scripts whose first line is "//@prelude" get scripts/_prelude.js prepended.
  if (code.startsWith("//@prelude2")) code = fs.readFileSync(require("path").join(__dirname, "scripts", "_prelude2.js"), "utf8") + "\n" + code;
  else if (code.startsWith("//@prelude")) code = fs.readFileSync(require("path").join(__dirname, "scripts", "_prelude.js"), "utf8") + "\n" + code;
  const { id } = await (await fetch(`${BASE}/job`, { method: "POST", body: code })).json();
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const r = await fetch(`${BASE}/result/${id}`);
    if (r.status === 200) {
      const out = await r.json();
      console.log(JSON.stringify(out, null, 1));
      process.exit(out.ok ? 0 : 1);
    }
    await new Promise((res) => setTimeout(res, 500));
  }
  console.error(`Timed out waiting for job ${id}`);
  process.exit(2);
}
main().catch((e) => { console.error(e.message); process.exit(1); });
