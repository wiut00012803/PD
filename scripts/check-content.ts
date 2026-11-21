import { appendFileSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import { CONTENT_FILES } from "../src/content/schema.ts";
import type { ContentKey } from "../src/content/schema.ts";
import { validateContent } from "../src/content/validate.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const contentDir = `${root}src/content/`;
const uploadsDir = `${root}src/assets/uploads/`;

const uploads = new Set(existsSync(uploadsDir) ? readdirSync(uploadsDir) : []);
const raw: Partial<Record<ContentKey, string>> = {};
for (const key of Object.keys(CONTENT_FILES) as ContentKey[]) {
  const path = contentDir + CONTENT_FILES[key].file;
  if (existsSync(path)) raw[key] = readFileSync(path, "utf8");
}

const { problems, warnings } = validateContent(raw, { imageExists: (p) => uploads.has(basename(p)) });

const inCi = Boolean(process.env.GITHUB_ACTIONS);
const escape = (s: string) => s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
const cell = (s: string) => s.replace(/\|/g, "\\|");
const time = new Intl.DateTimeFormat("ru-RU", { timeZone: "Asia/Tashkent", dateStyle: "long", timeStyle: "short" }).format(new Date());

const lines: string[] = [];
if (problems.length) {
  lines.push("## ❌ Изменения НЕ опубликованы", "", "Сайт показывает **предыдущую версию** — с ним всё в порядке. Исправьте пункты ниже в Pages CMS и сохраните ещё раз.", "");
  lines.push("| Где | Что не так |", "| --- | --- |");
  for (const p of problems) lines.push(`| ${cell(p.where)} | ${cell(p.message)} |`);
} else {
  lines.push("## ✅ Контент в порядке", "", `Проверка пройдена ${time} (время Ташкента). Через 1–2 минуты сайт обновится.`);
}
if (warnings.length) {
  lines.push("", "### Можно улучшить", "", "Это не ошибки — сайт опубликуется, но эти места стоит заменить реальными данными.", "");
  lines.push("| Где | Что |", "| --- | --- |");
  for (const w of warnings) lines.push(`| ${cell(w.where)} | ${cell(w.message)} |`);
}
const summary = lines.join("\n") + "\n";

if (inCi) {
  for (const p of problems) console.log(`::error file=src/content/${p.file},title=Ошибка в контенте::${escape(`${p.where}: ${p.message}`)}`);
  for (const w of warnings) console.log(`::notice file=src/content/${w.file},title=Заглушка или нет перевода::${escape(`${w.where}: ${w.message}`)}`);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
}

console.log(summary);
process.exit(problems.length ? 1 : 0);
