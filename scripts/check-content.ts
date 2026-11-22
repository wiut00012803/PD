import { appendFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const contentDir = join(root, "src", "content");
const uploadsDir = join(root, "src", "assets", "uploads");
const inCi = Boolean(process.env.GITHUB_ACTIONS);

const escapeAnnotation = (s: string) => s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");

function markdownTable(headers: [string, string], rows: [string, string][]): string[] {
  return [`| ${headers[0]} | ${headers[1]} |`, "| --- | --- |", ...rows.map(([a, b]) => `| ${cell(a)} | ${cell(b)} |`)];
}

function report(summary: string) {
  console.log(summary);
  if (!inCi) return;
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, "reported=true\n");
}

function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

try {
  const sharp = (await import("sharp")).default;
  const { CONTENT_FILES, CONTENT_KEYS, IMAGE_EXTENSIONS, uploadKey } = await import("../src/content/schema.ts");
  const { validateContent } = await import("../src/content/validate.ts");
  type UploadStatus = import("../src/content/schema.ts").UploadStatus;

  const uploads = new Map<string, UploadStatus>();
  for (const file of listFiles(uploadsDir)) {
    const key = relative(uploadsDir, file).split(sep).join("/");
    const ext = extname(file).slice(1);
    if (!(IMAGE_EXTENSIONS as readonly string[]).includes(ext.toLowerCase())) continue;
    if (ext !== ext.toLowerCase() && ext !== ext.toUpperCase()) {
      uploads.set(key, "extension-case");
      continue;
    }
    try {
      const meta = await sharp(file).metadata();
      const unsupportedHeif = meta.format === "heif" && meta.compression !== "av1";
      uploads.set(key, unsupportedHeif ? "broken" : "ok");
    } catch {
      uploads.set(key, "broken");
    }
  }

  const raw: Partial<Record<(typeof CONTENT_KEYS)[number], string>> = {};
  for (const key of CONTENT_KEYS) {
    const path = join(contentDir, CONTENT_FILES[key].file);
    if (existsSync(path)) raw[key] = readFileSync(path, "utf8");
  }

  const result = validateContent(
    raw,
    {
      uploadStatus: (path) => {
        const key = uploadKey(path);
        if (key === null) return "outside";
        return uploads.get(key) ?? "missing";
      },
    },
    { strict: process.env.CONTENT_STRICT === "1" },
  );

  const time = new Intl.DateTimeFormat("ru-RU", { timeZone: "Asia/Tashkent", dateStyle: "long", timeStyle: "short" }).format(new Date());
  const lines: string[] = [];
  if (!result.ok) {
    lines.push("## ❌ Изменения НЕ опубликованы", "", "Сайт показывает **предыдущую версию** — с ним всё в порядке. Исправьте пункты ниже в Pages CMS и сохраните ещё раз.", "");
    lines.push(...markdownTable(["Где", "Что не так"], result.problems.map((p) => [p.where, p.message])));
  } else {
    lines.push("## ✅ Контент в порядке", "", `Проверка пройдена ${time} (время Ташкента). Дальше — сборка и публикация сайта.`);
  }
  if (result.warnings.length) {
    lines.push("", "### Можно улучшить", "", "Это не ошибки — сайт опубликуется, но эти места стоит заменить реальными данными.", "");
    lines.push(...markdownTable(["Где", "Что"], result.warnings.map((w) => [w.where, w.message])));
  }

  if (inCi) {
    if (!result.ok) for (const p of result.problems) console.log(`::error file=src/content/${p.file},title=Ошибка в контенте::${escapeAnnotation(`${p.where}: ${p.message}${p.detail ? `\n${p.detail}` : ""}`)}`);
    for (const w of result.warnings) console.log(`::notice file=src/content/${w.file},title=Заглушка или нет перевода::${escapeAnnotation(`${w.where}: ${w.message}`)}`);
  }
  report(`${lines.join("\n")}\n`);
  process.exitCode = result.ok ? 0 : 1;
} catch (error) {
  const detail = error instanceof Error ? (error.stack ?? error.message) : String(error);
  if (inCi) console.log(`::error title=Сбой проверки контента::${escapeAnnotation(detail)}`);
  else console.error(detail);
  report("## ❌ Изменения НЕ опубликованы\n\nСайт показывает **предыдущую версию**. Сама проверка контента завершилась сбоем — это техническая ошибка, а не ваша: отправьте ссылку на эту страницу разработчику.\n");
  process.exitCode = 1;
}
