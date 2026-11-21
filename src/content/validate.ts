import { parse, YAMLParseError } from "yaml";
import { z } from "zod";
import { CONTENT_FILES, LANGS, createSchemas } from "./schema.ts";
import type { ContentKey, SchemaContext, SiteContent } from "./schema.ts";

export interface ContentProblem {
  file: string;
  where: string;
  message: string;
}

export interface ContentWarning {
  file: string;
  where: string;
  message: string;
}

export interface ValidationResult {
  data?: SiteContent;
  problems: ContentProblem[];
  warnings: ContentWarning[];
}

type JsonNode = {
  label?: string;
  itemLabel?: string;
  i18n?: boolean;
  properties?: Record<string, JsonNode>;
  items?: JsonNode;
  [key: string]: unknown;
};

const PLACEHOLDER_MARKERS: { test: RegExp; message: string }[] = [
  { test: /000-00-00|998000000000/, message: "номер телефона — заглушка" },
  { test: /zaglushka/i, message: "ссылка или имя — заглушка" },
  { test: /Имя Фамилия|Ism Familiya|Full Name/, message: "имя юриста — заглушка" },
  { test: /Примерная|Namuna ko|Primernaya|Sample St/i, message: "адрес — заглушка" },
  { test: /ООО «Пример»|«Namuna» MChJ|Primer LLC/, message: "отзыв — заглушка" },
  { test: /^Логотип \d+$|^Logo \d+$/, message: "логотип клиента — заглушка" },
  { test: /info@pravoedelo\.uz/, message: "email — заглушка" },
];

export function jsonSchemas(): Record<ContentKey, JsonNode> {
  const schemas = createSchemas({ imageExists: () => true });
  const out = {} as Record<ContentKey, JsonNode>;
  for (const key of Object.keys(schemas) as ContentKey[]) {
    out[key] = z.toJSONSchema(schemas[key], { io: "input", unrepresentable: "any" }) as JsonNode;
  }
  return out;
}

function getAt(data: unknown, path: PropertyKey[]): unknown {
  let cur: unknown = data;
  for (const seg of path) {
    if (cur === null || cur === undefined || typeof cur !== "object") return undefined;
    cur = (cur as Record<PropertyKey, unknown>)[seg];
  }
  return cur;
}

function itemSummary(item: unknown): string {
  if (!item || typeof item !== "object") return typeof item === "string" ? item : "";
  const record = item as Record<string, unknown>;
  if (typeof record.ru === "string") return record.ru;
  for (const key of ["title", "name", "question", "label", "value", "category", "text", "network"]) {
    const v = record[key];
    if (typeof v === "string" && v) return v;
    if (v && typeof v === "object" && typeof (v as Record<string, unknown>).ru === "string") return (v as Record<string, string>).ru;
  }
  return "";
}

function shorten(s: string, n = 40): string {
  const one = s.replace(/\s+/g, " ").trim();
  return one.length > n ? `${one.slice(0, n - 1)}…` : one;
}

export function describePath(key: ContentKey, path: PropertyKey[], schema: JsonNode, data: unknown): string {
  const parts = [CONTENT_FILES[key].label];
  let node: JsonNode | undefined = schema;
  for (let i = 0; i < path.length; i++) {
    const seg = path[i];
    if (!node) {
      parts.push(String(seg));
      continue;
    }
    if (typeof seg === "number") {
      const summary = shorten(itemSummary(getAt(data, path.slice(0, i + 1))));
      parts.push(`${node.itemLabel ?? "Элемент"} №${seg + 1}${summary ? ` «${summary}»` : ""}`);
      node = node.items;
    } else {
      const child: JsonNode | undefined = node.properties?.[String(seg)];
      parts.push(child?.label ?? String(seg));
      node = child;
    }
  }
  return parts.join(" → ");
}

function describeIssue(issue: z.core.$ZodIssue, value: unknown): string {
  switch (issue.code) {
    case "too_small":
      if (issue.origin === "string") return Number(issue.minimum) <= 1 ? "поле не заполнено" : `нужно минимум ${issue.minimum} символов`;
      if (issue.origin === "array") return `нужно минимум ${issue.minimum} — добавьте ещё`;
      return `число должно быть не меньше ${issue.minimum}`;
    case "too_big":
      if (issue.origin === "string") return `слишком длинно: максимум ${issue.maximum} символов, сейчас ${typeof value === "string" ? value.length : "больше"}`;
      if (issue.origin === "array") return `слишком много: максимум ${issue.maximum}, сейчас ${Array.isArray(value) ? value.length : "больше"}`;
      return `число должно быть не больше ${issue.maximum}`;
    case "invalid_type":
      if (value === undefined || value === null) return "поле не заполнено";
      if (issue.expected === "number") return "здесь нужно число";
      if (issue.expected === "boolean") return "здесь нужен переключатель «да / нет»";
      if (issue.expected === "array") return "здесь нужен список";
      if (issue.expected === "object") return "неверная структура — верните поле к прежнему виду";
      return "неверный формат значения";
    case "invalid_value":
      return "выберите вариант из списка";
    case "custom":
    case "invalid_format":
      return issue.message;
    default:
      return issue.message;
  }
}

function collectStrings(value: unknown, path: PropertyKey[], out: { path: PropertyKey[]; value: string }[]) {
  if (typeof value === "string") out.push({ path, value });
  else if (Array.isArray(value)) value.forEach((v, i) => collectStrings(v, [...path, i], out));
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) collectStrings(v, [...path, k], out);
}

function collectMissingTranslations(value: unknown, path: PropertyKey[], out: Record<string, number>) {
  if (Array.isArray(value)) value.forEach((v, i) => collectMissingTranslations(v, [...path, i], out));
  else if (value && typeof value === "object") {
    const rec = value as Record<string, unknown>;
    if (typeof rec.ru === "string" && "uz" in rec && "en" in rec) {
      if (rec.ru) for (const lang of LANGS.slice(1)) if (!rec[lang]) out[lang] = (out[lang] ?? 0) + 1;
      return;
    }
    for (const [k, v] of Object.entries(rec)) collectMissingTranslations(v, [...path, k], out);
  }
}

export function validateContent(raw: Partial<Record<ContentKey, string>>, ctx: SchemaContext): ValidationResult {
  const schemas = createSchemas(ctx);
  const json = jsonSchemas();
  const problems: ContentProblem[] = [];
  const warnings: ContentWarning[] = [];
  const data = {} as Record<ContentKey, unknown>;

  for (const key of Object.keys(CONTENT_FILES) as ContentKey[]) {
    const { file, label } = CONTENT_FILES[key];
    const source = raw[key];
    if (source === undefined) {
      problems.push({ file, where: label, message: `файл src/content/${file} не найден` });
      continue;
    }
    let parsed: unknown;
    try {
      parsed = parse(source, { prettyErrors: true });
    } catch (error) {
      const line = error instanceof YAMLParseError && error.linePos ? `, строка ${error.linePos[0].line}` : "";
      problems.push({ file, where: `${label} (файл ${file}${line})`, message: "файл повреждён: нарушен формат YAML. Откатите последнюю правку этого файла в истории репозитория" });
      continue;
    }
    const result = schemas[key].safeParse(parsed ?? {}, { reportInput: true });
    if (!result.success) {
      for (const issue of result.error.issues) {
        problems.push({ file, where: describePath(key, issue.path, json[key], parsed), message: describeIssue(issue, getAt(parsed, issue.path)) });
      }
      continue;
    }
    data[key] = result.data;

    const strings: { path: PropertyKey[]; value: string }[] = [];
    collectStrings(result.data, [], strings);
    const seen = new Set<string>();
    for (const { path, value } of strings) {
      const marker = PLACEHOLDER_MARKERS.find((m) => m.test.test(value));
      if (!marker) continue;
      const last = path[path.length - 1];
      const fieldPath = typeof last === "string" && (LANGS as readonly string[]).includes(last) ? path.slice(0, -1) : path;
      const where = describePath(key, fieldPath, json[key], result.data);
      if (seen.has(where)) continue;
      seen.add(where);
      warnings.push({ file, where, message: marker.message });
    }
    const missing: Record<string, number> = {};
    collectMissingTranslations(result.data, [], missing);
    for (const [lang, count] of Object.entries(missing)) {
      const fields = count % 10 === 1 && count % 100 !== 11 ? "поле" : "полях";
      warnings.push({ file, where: label, message: `нет перевода ${lang.toUpperCase()} в ${count} ${fields} — на сайте там будет показан русский текст` });
    }
  }

  return { data: problems.length ? undefined : (data as SiteContent), problems, warnings };
}

export function formatProblems(problems: ContentProblem[]): string {
  return problems.map((p) => `• ${p.where}: ${p.message}`).join("\n");
}
