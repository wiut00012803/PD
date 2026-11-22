import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ICONS, SOCIALS } from "../src/content/schema.ts";

const root = fileURLToPath(new URL("..", import.meta.url));

const INTERFACE_ICONS = ["arrow-left", "arrow-right", "chevron-down", "mail", "map-pin", "menu", "minus", "moon", "plus", "quote", "sun", "x"];

const uiNames = [...new Set([...Object.keys(ICONS), ...INTERFACE_ICONS])].sort();
const socialNames = Object.keys(SOCIALS).sort();

function readIcon(path: string, name: string): string {
  if (!existsSync(path)) throw new Error(`icons:generate: иконка «${name}» не найдена (${path}) — возможно, её переименовали в новой версии пакета`);
  return readFileSync(path, "utf8");
}

function innerSvg(svg: string, name: string): string {
  const body = svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>[\s\S]*$/, "")
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/\s*\n\s*/g, "")
    .replace(/\s+\/>/g, "/>")
    .trim();
  if (!body || body.includes("<svg")) throw new Error(`icons:generate: не удалось разобрать SVG иконки «${name}»`);
  return body;
}

const ui = Object.fromEntries(uiNames.map((name) => [name, innerSvg(readIcon(`${root}node_modules/lucide-static/icons/${name}.svg`, name), name)]));
const social = Object.fromEntries(socialNames.map((name) => [name, innerSvg(readIcon(`${root}node_modules/simple-icons/icons/${name}.svg`, name), name)]));

const out = `export const UI_ICONS = ${JSON.stringify(ui, null, 2)} as const;

export const SOCIAL_ICONS = ${JSON.stringify(social, null, 2)} as const;

export type UiIconName = keyof typeof UI_ICONS;
export type SocialIconName = keyof typeof SOCIAL_ICONS;
`;

writeFileSync(`${root}src/icons/icons.ts`, out);
console.log(`icons: ${uiNames.length} ui, ${socialNames.length} social`);
