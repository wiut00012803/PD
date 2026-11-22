import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CONTENT_FILES, CONTENT_KEYS } from "../src/content/schema.ts";
import type { ContentKey, SchemaContext, UploadStatus } from "../src/content/schema.ts";
import { validateContent } from "../src/content/validate.ts";
import type { ContentIssue } from "../src/content/validate.ts";

const contentDir = fileURLToPath(new URL("../src/content/", import.meta.url));
const original = Object.fromEntries(CONTENT_KEYS.map((key) => [key, readFileSync(contentDir + CONTENT_FILES[key].file, "utf8")])) as Record<ContentKey, string>;
const allUploadsOk: SchemaContext = { uploadStatus: () => "ok" };

function validateWith(changes: Partial<Record<ContentKey, string>>, ctx: SchemaContext = allUploadsOk, strict = false) {
  return validateContent({ ...original, ...changes }, ctx, { strict });
}

function problemsOf(changes: Partial<Record<ContentKey, string>>, ctx: SchemaContext = allUploadsOk, strict = false): ContentIssue[] {
  const result = validateWith(changes, ctx, strict);
  assert.equal(result.ok, false, "ожидалась ошибка проверки");
  return result.ok ? [] : result.problems;
}

function replaceOnce(key: ContentKey, from: string, to: string): Partial<Record<ContentKey, string>> {
  assert.ok(original[key].includes(from), `в ${key} нет фрагмента «${from}»`);
  return { [key]: original[key].replace(from, to) };
}

function assertProblem(problems: ContentIssue[], where: RegExp, message: RegExp) {
  const found = problems.some((p) => where.test(p.where) && message.test(p.message));
  assert.ok(found, `нет ожидаемой ошибки ${where} / ${message}. Получено:\n${problems.map((p) => `${p.where}: ${p.message}`).join("\n")}`);
}

describe("контент сайта", () => {
  it("текущий контент проходит проверку", () => {
    const result = validateWith({});
    assert.equal(result.ok, true, result.ok ? "" : result.problems.map((p) => `${p.where}: ${p.message}`).join("\n"));
  });

  it("пустое обязательное поле", () => {
    const problems = problemsOf(replaceOnce("team", "ru: Галимов Руслан Феликсович", 'ru: ""'));
    assertProblem(problems, /Команда → Юристы → Юрист №1 → Имя → RU · Русский/, /поле не заполнено/);
  });

  it("неверный формат телефона", () => {
    const problems = problemsOf(replaceOnce("settings", "phone: +998 00 000-00-00", 'phone: "90 123 45 67"'));
    assertProblem(problems, /Контакты и ссылки → Телефон/, /\+998 90 123-45-67/);
  });

  it("опечатка в названии поля", () => {
    const problems = problemsOf(replaceOnce("cases", "enabled: true", "enabld: false"));
    assertProblem(problems, /^Кейсы$/, /лишнее поле «enabld»/);
  });

  it("сломанный YAML", () => {
    const problems = problemsOf({ ui: "nav: [unclosed" });
    assertProblem(problems, /Подписи интерфейса \(файл ui\.yaml, строка \d+\)/, /файл повреждён/);
  });

  it("пустой файл", () => {
    const problems = problemsOf({ faq: "" });
    assertProblem(problems, /FAQ \(файл faq\.yaml\)/, /файл пустой/);
    assert.equal(problems.filter((p) => p.file === "faq.yaml").length, 1);
  });

  it("неизвестная вставка в тексте", () => {
    const problems = problemsOf(replaceOnce("home", '"{yearsWord} практики"', '"{year} практики"'));
    assertProblem(problems, /Главная → Цифры/, /неизвестная вставка \{year\}/);
  });

  it("дробное число там, где нужно целое", () => {
    const problems = problemsOf(replaceOnce("cases", "visible: 4", "visible: 4.5"));
    assertProblem(problems, /Кейсы → Сколько кейсов видно сразу/, /целое число/);
  });

  it("год практики в будущем", () => {
    const problems = problemsOf(replaceOnce("settings", "practiceSince: 2008", `practiceSince: ${new Date().getFullYear() + 1}`));
    assertProblem(problems, /Год начала адвокатской практики/, /в будущем/);
  });

  it("перевод без русского текста", () => {
    const problems = problemsOf(replaceOnce("home", "ru: Бесплатная онлайн-консультация", 'ru: ""'));
    assertProblem(problems, /Главная → Первый экран → Бейдж над заголовком/, /заполните русский вариант/);
  });

  it("фото: нет файла, путь вне медиатеки, неверный регистр расширения, битый файл", () => {
    const statuses: Record<string, UploadStatus> = {
      "/uploads/galimov-desk.jpg": "missing",
      "/uploads/galimov-portrait.jpg": "broken",
    };
    const ctx = { uploadStatus: (path: string): UploadStatus => statuses[path] ?? "ok" };
    const problems = problemsOf({}, ctx);
    assertProblem(problems, /Главная → О нас → Фото/, /не найден в медиатеке/);
    assertProblem(problems, /Команда → Юристы → Юрист №1 .* → Фото/, /не открывается как картинка/);

    const outside = problemsOf(replaceOnce("home", "/uploads/galimov-desk.jpg", "https://example.com/x.jpg"), { uploadStatus: () => "outside" });
    assertProblem(outside, /Главная → О нас → Фото/, /начинаться с \/uploads\//);
  });

  it("строгий режим превращает заглушки контактов в ошибки", () => {
    const relaxed = validateWith({});
    assert.equal(relaxed.ok, true);
    assert.ok(relaxed.warnings.some((w) => /Телефон/.test(w.where)));
    const problems = problemsOf({}, allUploadsOk, true);
    assertProblem(problems, /Контакты и ссылки → Телефон/, /перед запуском сайта/);
  });
});
