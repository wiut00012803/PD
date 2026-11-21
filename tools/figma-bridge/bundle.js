// node bundle.js <body.js> <out.js> [THEME] [PAGE_NAME] [PAGE_W] [photo keys...]
// Produces: //@prelude2 + PHOTOS + TH/PAGE consts + scripts/_page-lib.js + body
const fs = require("fs"), path = require("path");
const [body, out, th = "Dark", name = "Desktop 1440 · Тёмная · Главная", w = "1440", ...keys] = process.argv.slice(2);
const PH = "C:/Users/User/AppData/Local/Temp/claude/3b5d072df1a0b8e7/458b78cd-fcde-4260-b33a-97df92ae8239/scratchpad/photos";
const files = { library: "library", handshake: "handshake", work: "work", docs: "doc1" };
const photos = {}; for (const k of keys) photos[k] = fs.readFileSync(path.join(PH, files[k] + ".jpg")).toString("base64");
const code = "//@prelude2\n" + `const PHOTOS = ${JSON.stringify(photos)};\nconst TH = ${JSON.stringify(th)}; const PAGE_NAME = ${JSON.stringify(name)}; const PAGE_W = ${Number(w)};\n` +
  fs.readFileSync(path.join(__dirname, "scripts", "_page-lib.js"), "utf8") + "\n" + fs.readFileSync(body, "utf8");
fs.writeFileSync(out, code); console.log(out, code.length);
