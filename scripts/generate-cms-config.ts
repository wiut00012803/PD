import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { stringify } from "yaml";
import { CONTENT_FILES, CONTENT_KEYS, IMAGE_EXTENSIONS, LANGS } from "../src/content/schema.ts";
import { jsonSchemas } from "../src/content/validate.ts";
import type { SchemaNode } from "../src/content/validate.ts";

type CmsField = Record<string, unknown>;

const root = fileURLToPath(new URL("..", import.meta.url));
const target = `${root}.pages.yml`;
const checkOnly = process.argv.includes("--check");

const isType = (node: SchemaNode, t: string) => (Array.isArray(node.type) ? node.type.includes(t) : node.type === t);
const isRequired = (node: SchemaNode) => (node.minLength ?? 0) >= 1;

function fail(message: string): never {
  throw new Error(`cms:generate: ${message}`);
}

function base(name: string, node: SchemaNode): CmsField {
  const field: CmsField = { name, label: node.label ?? name };
  if (node.description) field.description = node.description;
  return field;
}

function textField(name: string, node: SchemaNode): CmsField {
  const field: CmsField = { ...base(name, node), type: node.multiline ? "text" : "string" };
  if (isRequired(node)) field.required = true;
  if (node.cmsPattern) {
    const regex = isRequired(node) ? node.cmsPattern.regex : `^$|${node.cmsPattern.regex}`;
    field.pattern = { regex, message: node.cmsPattern.message };
  }
  if (node.maxLength) field.options = { maxlength: node.maxLength };
  return field;
}

function i18nFields(path: string, node: SchemaNode): CmsField[] {
  return LANGS.map((lang) => {
    const child = node.properties?.[lang] ?? fail(`у поля «${path}» нет языка ${lang}`);
    return textField(lang, { ...child, multiline: node.multiline });
  });
}

function assertSummary(path: string, summary: string, item: SchemaNode) {
  for (const match of summary.matchAll(/\{(?:fields\.)?([\w.]+)\}/g)) {
    if (match[1] === "index") continue;
    let node: SchemaNode | undefined = item;
    for (const seg of match[1].split(".")) node = node?.properties?.[seg];
    if (!node) fail(`в подписи списка «${path}» указано несуществующее поле {${match[1]}}`);
  }
}

function toField(name: string, node: SchemaNode, path = name): CmsField {
  if (node.i18n) return { ...base(name, node), type: "object", fields: i18nFields(path, node) };

  if (isType(node, "array")) {
    const item = node.items ?? fail(`у списка «${path}» не описаны элементы`);
    const list: Record<string, unknown> = {};
    if (node.minItems) list.min = node.minItems;
    if (node.maxItems) list.max = node.maxItems;
    if (item.properties) {
      if (node.summary) assertSummary(path, node.summary, item);
      list.collapsible = { collapsed: true, ...(node.summary ? { summary: node.summary } : {}) };
      const fields = item.i18n ? i18nFields(path, item) : Object.entries(item.properties).map(([k, v]) => toField(k, v, `${path}.${k}`));
      return { ...base(name, node), type: "object", list, fields };
    }
    return { ...toField(name, { ...item, label: node.label, description: node.description }, path), list: Object.keys(list).length ? list : true };
  }

  if (node.properties) {
    return { ...base(name, node), type: "object", fields: Object.entries(node.properties).map(([k, v]) => toField(k, v, `${path}.${k}`)) };
  }

  if (node.image) {
    return { ...base(name, node), type: "image", ...(isRequired(node) ? { required: true } : {}), options: { extensions: IMAGE_EXTENSIONS } };
  }

  if (node.enum) {
    return { ...base(name, node), type: "select", required: true, options: { values: node.enum.map((v) => ({ name: v, label: node.choices?.[v] ?? v })) } };
  }

  if (isType(node, "integer") || isType(node, "number")) {
    const options: Record<string, number> = {};
    if (node.minimum !== undefined) options.min = node.minimum;
    if (node.maximum !== undefined) options.max = node.maximum;
    return { ...base(name, node), type: "number", required: true, ...(Object.keys(options).length ? { options } : {}) };
  }

  if (isType(node, "boolean")) return { ...base(name, node), type: "boolean", default: node.default ?? true };

  if (isType(node, "string")) return textField(name, node);

  return fail(`поле «${path}» типа ${JSON.stringify(node.type)} не поддерживается — добавьте обработку в toField()`);
}

const schemas = jsonSchemas();

const config = {
  media: {
    input: "src/assets/uploads",
    output: "/uploads",
    extensions: IMAGE_EXTENSIONS,
    rename: "safe",
  },
  content: CONTENT_KEYS.map((key) => ({
    name: key,
    label: CONTENT_FILES[key].label,
    type: "file",
    path: `src/content/${CONTENT_FILES[key].file}`,
    format: "yaml",
    fields: Object.entries(schemas[key].properties ?? {}).map(([k, v]) => toField(k, v, `${key}.${k}`)),
  })),
};

const output = stringify(config, { lineWidth: 0, aliasDuplicateObjects: false });

if (checkOnly) {
  const current = existsSync(target) ? readFileSync(target, "utf8").replace(/\r\n/g, "\n") : "";
  if (current !== output) {
    console.log("::error file=.pages.yml,title=Форма CMS устарела::.pages.yml не совпадает со схемой контента — выполните npm run cms:generate и закоммитьте результат");
    process.exitCode = 1;
  } else {
    console.log(".pages.yml совпадает со схемой контента");
  }
} else {
  writeFileSync(target, output);
  console.log(`.pages.yml: ${config.content.length} разделов`);
}
