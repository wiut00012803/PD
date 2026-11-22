import { parse, YAMLParseError } from "yaml";
import { z } from "zod";
import { CONTENT_FILES, CONTENT_KEYS, DEFAULT_LANG, LANGS, LANG_META, TEXT_TOKENS, createSchemas, isLang, isLocalizedText } from "./schema.ts";
import type { ContentKey, FieldMeta, SchemaContext, SiteContent } from "./schema.ts";

export interface ContentIssue {
  file: string;
  where: string;
  message: string;
  detail?: string;
}

export type ValidationResult =
  | { ok: true; data: SiteContent; warnings: ContentIssue[] }
  | { ok: false; problems: ContentIssue[]; warnings: ContentIssue[] };

export interface ValidateOptions {
  strict?: boolean;
}

export type SchemaNode = Partial<FieldMeta> & {
  type?: string | string[];
  enum?: string[];
  default?: unknown;
  properties?: Record<string, SchemaNode>;
  items?: SchemaNode;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  minimum?: number;
  maximum?: number;
};

interface Marker {
  test: RegExp;
  message: string;
  contact: boolean;
}

const PLACEHOLDER_MARKERS: Marker[] = [
  { test: /000-00-00|998000000000/, message: "номер телефона — заглушка", contact: true },
  { test: /zaglushka/i, message: "ссылка или имя — заглушка", contact: true },
  { test: /Имя Фамилия|Ism Familiya|Full Name/, message: "имя юриста — заглушка", contact: false },
  { test: /Примерная|Namuna ko|Sample St/i, message: "адрес — заглушка", contact: true },
  { test: /ООО «Пример»|«Namuna» MChJ|Primer LLC/, message: "отзыв — заглушка", contact: false },
  { test: /^Логотип \d+$|^Logo \d+$/, message: "логотип клиента — заглушка", contact: false },
];

const YAML_REASONS: Record<string, string> = {
  DUPLICATE_KEY: "одно и то же поле указано дважды",
  TAB_AS_INDENT: "для отступов использованы табуляции вместо пробелов",
  BAD_INDENT: "нарушены отступы",
  MULTIPLE_DOCS: "в файле несколько документов (строка ---)",
};

const TOKEN_PATTERN = /\{([^{}]*)\}/g;
const RU_PLURAL = new Intl.PluralRules("ru");

let cachedJsonSchemas: Record<ContentKey, SchemaNode> | undefined;

export function jsonSchemas(): Record<ContentKey, SchemaNode> {
  if (cachedJsonSchemas) return cachedJsonSchemas;
  const schemas = createSchemas({ uploadStatus: () => "ok" });
  const out = {} as Record<ContentKey, SchemaNode>;
  for (const key of CONTENT_KEYS) {
    out[key] = z.toJSONSchema(schemas[key], { io: "input", unrepresentable: "any" }) as SchemaNode;
  }
  cachedJsonSchemas = out;
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

export function renderSummary(template: string, item: unknown, index: number): string {
  return template
    .replace(/\{index\}/g, String(index + 1))
    .replace(/\{(?:fields\.)?([\w.]+)\}/g, (_m, path: string) => {
      const value = getAt(item, path.split("."));
      return typeof value === "string" || typeof value === "number" ? String(value) : "";
    })
    .trim();
}

function shorten(s: string, n = 40): string {
  const one = s.replace(/\s+/g, " ").trim();
  return one.length > n ? `${one.slice(0, n - 1)}…` : one;
}

function describePath(key: ContentKey, path: PropertyKey[], schema: SchemaNode, data: unknown): string {
  const parts: string[] = [CONTENT_FILES[key].label];
  let node: SchemaNode | undefined = schema;
  for (let i = 0; i < path.length; i++) {
    const seg = path[i];
    if (!node) {
      parts.push(String(seg));
      continue;
    }
    if (typeof seg === "number") {
      const summary = node.summary ? shorten(renderSummary(node.summary, getAt(data, path.slice(0, i + 1)), seg)) : "";
      parts.push(`${node.itemLabel ?? "Элемент"} №${seg + 1}${summary ? ` «${summary}»` : ""}`);
      node = node.items;
    } else {
      const child: SchemaNode | undefined = node.properties?.[String(seg)];
      parts.push(child?.label ?? (isLang(seg) ? `${LANG_META[seg].short} · ${LANG_META[seg].name}` : String(seg)));
      node = child;
    }
  }
  return parts.join(" → ");
}

function quoted(value: unknown): string {
  return typeof value === "string" ? `«${shorten(value, 30)}»` : String(value);
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
      if (issue.expected === "int") return "здесь нужно целое число, без дробной части";
      if (issue.expected === "number") return "здесь нужно число";
      if (issue.expected === "boolean") return "здесь нужен переключатель «да / нет»";
      if (issue.expected === "string") return "здесь нужен текст — возьмите значение в кавычки";
      if (issue.expected === "array") return "здесь нужен список";
      if (issue.expected === "object") return "неверная структура — верните поле к прежнему виду";
      return "неверный формат значения";
    case "invalid_value":
      return `${quoted(value)} — такого варианта нет, выберите из списка`;
    case "unrecognized_keys":
      return `лишнее поле ${issue.keys.map((k) => `«${k}»`).join(", ")} — сайт его не знает. Если это опечатка, исправьте название, иначе удалите`;
    case "custom":
    case "invalid_format":
      return issue.message;
    default:
      return `неожиданная ошибка проверки (${issue.code}) — отправьте ссылку на этот отчёт разработчику`;
  }
}

function collectStrings(value: unknown, path: PropertyKey[], out: { path: PropertyKey[]; value: string }[]) {
  if (typeof value === "string") out.push({ path, value });
  else if (Array.isArray(value)) value.forEach((v, i) => collectStrings(v, [...path, i], out));
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) collectStrings(v, [...path, k], out);
}

function countMissingTranslations(value: unknown, out: Record<string, number>) {
  if (Array.isArray(value)) value.forEach((v) => countMissingTranslations(v, out));
  else if (isLocalizedText(value)) {
    if (value[DEFAULT_LANG]) for (const lang of LANGS) if (lang !== DEFAULT_LANG && !value[lang]) out[lang] = (out[lang] ?? 0) + 1;
  } else if (value && typeof value === "object") for (const v of Object.values(value)) countMissingTranslations(v, out);
}

function fieldWord(count: number): string {
  return RU_PLURAL.select(count) === "one" ? "поле" : "полях";
}

function withoutLangSegment(path: PropertyKey[]): PropertyKey[] {
  return isLang(path[path.length - 1]) ? path.slice(0, -1) : path;
}

export function validateContent(raw: Partial<Record<ContentKey, string>>, ctx: SchemaContext, options: ValidateOptions = {}): ValidationResult {
  const schemas = createSchemas(ctx);
  const problems: ContentIssue[] = [];
  const warnings: ContentIssue[] = [];
  const data = {} as Record<ContentKey, unknown>;

  for (const key of CONTENT_KEYS) {
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
      const yamlError = error instanceof YAMLParseError ? error : null;
      const line = yamlError?.linePos ? `, строка ${yamlError.linePos[0].line}` : "";
      const reason = (yamlError && YAML_REASONS[yamlError.code]) || "нарушен формат YAML";
      problems.push({
        file,
        where: `${label} (файл ${file}${line})`,
        message: `файл повреждён: ${reason}. Откатите последнюю правку этого файла в истории репозитория`,
        detail: error instanceof Error ? error.message : String(error),
      });
      continue;
    }

    if (parsed === null || parsed === undefined) {
      problems.push({ file, where: `${label} (файл ${file})`, message: "файл пустой — верните предыдущую версию из истории репозитория" });
      continue;
    }

    const result = schemas[key].safeParse(parsed, { reportInput: true });
    if (!result.success) {
      const json = jsonSchemas()[key];
      for (const issue of result.error.issues) {
        problems.push({ file, where: describePath(key, issue.path, json, parsed), message: describeIssue(issue, issue.input ?? getAt(parsed, issue.path)), detail: issue.message });
      }
      continue;
    }
    data[key] = result.data;

    const json = jsonSchemas()[key];
    const strings: { path: PropertyKey[]; value: string }[] = [];
    collectStrings(result.data, [], strings);
    const seen = new Set<string>();
    for (const { path, value } of strings) {
      for (const match of value.matchAll(TOKEN_PATTERN)) {
        if (!(TEXT_TOKENS as readonly string[]).includes(match[1])) {
          problems.push({ file, where: describePath(key, path, json, result.data), message: `неизвестная вставка {${match[1]}} — можно использовать только ${TEXT_TOKENS.map((t) => `{${t}}`).join(" и ")}` });
        }
      }
      const marker = PLACEHOLDER_MARKERS.find((m) => m.test.test(value));
      if (!marker) continue;
      const where = describePath(key, withoutLangSegment(path), json, result.data);
      if (seen.has(where)) continue;
      seen.add(where);
      const issue = { file, where, message: marker.message };
      if (options.strict && marker.contact) problems.push({ ...issue, message: `${marker.message} — перед запуском сайта замените на настоящие данные` });
      else warnings.push(issue);
    }

    const missing: Record<string, number> = {};
    countMissingTranslations(result.data, missing);
    for (const [lang, count] of Object.entries(missing)) {
      const short = isLang(lang) ? LANG_META[lang].short : lang.toUpperCase();
      warnings.push({ file, where: label, message: `нет перевода ${short} в ${count} ${fieldWord(count)} — на сайте там будет показан русский текст` });
    }
  }

  if (problems.length) return { ok: false, problems, warnings };
  return { ok: true, data: data as SiteContent, warnings };
}

export function formatIssues(issues: ContentIssue[]): string {
  return issues.map((p) => `• ${p.where}: ${p.message}`).join("\n");
}
