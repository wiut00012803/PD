// Local bridge server for the PD Bridge Figma plugin. No dependencies.
// POST /job        body: JS code  -> { id }
// GET  /next       (plugin)       -> next job { id, code } or 204
// POST /result/:id (plugin)       -> stores result JSON + PNG screenshots in ./jobs
// GET  /result/:id                -> stored result or 202 while pending
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 7788;
const JOBS_DIR = path.join(__dirname, "jobs");
fs.mkdirSync(JOBS_DIR, { recursive: true });

const queue = [];
const results = new Map();
let counter = 0;
let lastPoll = 0;

function send(res, status, body, type = "application/json") {
  res.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  res.end(body === undefined ? "" : typeof body === "string" ? body : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204);
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "GET" && url.pathname === "/status") {
    return send(res, 200, { pluginConnected: Date.now() - lastPoll < 5000, queued: queue.length });
  }
  if (req.method === "POST" && url.pathname === "/job") {
    const code = await readBody(req);
    const id = `${Date.now()}-${++counter}`;
    queue.push({ id, code });
    return send(res, 200, { id });
  }
  if (req.method === "GET" && url.pathname === "/next") {
    lastPoll = Date.now();
    const job = queue.shift();
    return job ? send(res, 200, job) : send(res, 204);
  }
  const m = url.pathname.match(/^\/result\/([\w-]+)$/);
  if (m && req.method === "POST") {
    const msg = JSON.parse(await readBody(req));
    const files = (msg.images || []).map((img, i) => {
      const file = path.join(JOBS_DIR, `${m[1]}-${i + 1}-${img.name}.png`);
      fs.writeFileSync(file, Buffer.from(img.base64, "base64"));
      return file;
    });
    const stored = { id: m[1], ok: msg.ok, result: msg.result, error: msg.error, screenshots: files };
    fs.writeFileSync(path.join(JOBS_DIR, `${m[1]}.json`), JSON.stringify(stored, null, 1));
    results.set(m[1], stored);
    return send(res, 200, { saved: files.length });
  }
  if (m && req.method === "GET") {
    return results.has(m[1]) ? send(res, 200, results.get(m[1])) : send(res, 202, { pending: true });
  }
  send(res, 404, { error: "not found" });
}).listen(PORT, "127.0.0.1", () => console.log(`PD Bridge server on http://localhost:${PORT}`));
