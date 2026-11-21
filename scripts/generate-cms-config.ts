import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { stringify } from "yaml";
import { CONTENT_FILES, IMAGE_EXTENSIONS, LANGS } from "../src/content/schema.ts";
import type { ContentKey } from "../src/content/schema.ts";
import { jsonSchemas } from "../src/content/validate.ts";

type Node = {
  type?: string | string[];
  label?: string;
  description?: string;
  multiline?: boolean;
  i18n?: boolean;
  image?: boolean;
  itemLabel?: string;
  summary?: string;
  cmsPattern?: { regex: string; message: string };
  choices?: Record<string, string>;
  enum?: string[];
  properties?: Record<string, Node>;
  items?: Node;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  minimum?: number;
  maximum?: number;
};

type CmsField = Record<string, unknown>;

const root = fileURLToPath(new URL("..", import.meta.url));
const ORDER: ContentKey[] = ["settings", "home", "services", "cases", "team", "reviews", "faq", "consultation", "ui"];

const isType = (node: Node, t: string) => (Array.isArray(node.type) ? node.type.includes(t) : node.type === t);

function base(name: string, node: Node, fallbackLabel?: string): CmsField {
  const f: CmsField = { name, label: node.label ?? fallbackLabel ?? name };
  if (node.description) f.description = node.description;
  return f;
}

function textField(name: string, node: Node, label?: string): CmsField {
  const f = base(name, node, label);
  if (label) f.label = label;
  f.type = node.multiline ? "text" : "string";
  if ((node.minLength ?? 0) >= 1) f.required = true;
  if (node.cmsPattern) f.pattern = { regex: node.cmsPattern.regex, message: node.cmsPattern.message };
  if (node.maxLength) f.options = { maxlength: node.maxLength };
  return f;
}

function i18nFields(node: Node): CmsField[] {
  return LANGS.map((lang) => {
    const child = node.properties?.[lang] ?? {};
    return textField(lang, { ...child, multiline: node.multiline }, child.label);
  });
}

function toField(name: string, node: Node): CmsField {
  if (node.i18n) {
    return { ...base(name, node), type: "object", fields: i18nFields(node) };
  }
  if (isType(node, "array") && node.items) {
    const item = node.items;
    const list: Record<string, unknown> = {};
    if (node.minItems) list.min = node.minItems;
    if (node.maxItems) list.max = node.maxItems;
    if (item.properties) {
      list.collapsible = { collapsed: true, ...(node.summary ? { summary: node.summary } : {}) };
      const fields = item.i18n ? i18nFields(item) : Object.entries(item.properties).map(([k, v]) => toField(k, v));
      return { ...base(name, node), type: "object", list, fields };
    }
    return { ...toField(name, { ...item, label: node.label, description: node.description }), list: Object.keys(list).length ? list : true };
  }
  if (node.properties) {
    return { ...base(name, node), type: "object", fields: Object.entries(node.properties).map(([k, v]) => toField(k, v)) };
  }
  if (node.image) {
    const f = base(name, node);
    f.type = "image";
    if ((node.minLength ?? 0) >= 1) f.required = true;
    f.options = { extensions: IMAGE_EXTENSIONS };
    return f;
  }
  if (node.enum) {
    const f = base(name, node);
    f.type = "select";
    f.required = true;
    f.options = { values: node.enum.map((v) => ({ name: v, label: node.choices?.[v] ?? v })) };
    return f;
  }
  if (isType(node, "integer") || isType(node, "number")) {
    const f = base(name, node);
    f.type = "number";
    f.required = true;
    const options: Record<string, number> = {};
    if (node.minimum !== undefined) options.min = node.minimum;
    if (node.maximum !== undefined) options.max = node.maximum;
    if (Object.keys(options).length) f.options = options;
    return f;
  }
  if (isType(node, "boolean")) {
    return { ...base(name, node), type: "boolean", default: true };
  }
  return textField(name, node);
}

const schemas = jsonSchemas() as Record<ContentKey, Node>;

const config = {
  media: {
    input: "src/assets/uploads",
    output: "/uploads",
    extensions: IMAGE_EXTENSIONS,
  },
  content: ORDER.map((key) => ({
    name: key,
    label: CONTENT_FILES[key].label,
    type: "file",
    path: `src/content/${CONTENT_FILES[key].file}`,
    format: "yaml",
    fields: Object.entries(schemas[key].properties ?? {}).map(([k, v]) => toField(k, v)),
  })),
};

writeFileSync(`${root}.pages.yml`, stringify(config, { lineWidth: 0, aliasDuplicateObjects: false }));
console.log(`.pages.yml: ${config.content.length} sections`);
