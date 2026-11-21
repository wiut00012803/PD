import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

const UI_ICONS = [
  "arrow-left", "arrow-right", "award", "baby", "banknote", "briefcase", "building-2", "car", "check", "chevron-down",
  "clock", "coins", "external-link", "file-search", "file-text", "gavel", "globe", "handshake", "hard-hat", "heart-handshake",
  "house", "key-round", "landmark", "lock", "mail", "map-pin", "menu", "message-circle", "minus", "moon", "phone", "plus",
  "quote", "receipt", "scale", "scroll-text", "shield", "shield-check", "sun", "target", "user-round", "users", "x",
];

const SOCIAL_ICONS = ["telegram", "whatsapp", "instagram", "facebook", "youtube", "x", "tiktok"];

function innerSvg(svg: string): string {
  return svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>[\s\S]*$/, "")
    .replace(/\s*\n\s*/g, "")
    .replace(/\s+\/>/g, "/>")
    .trim();
}

const ui: Record<string, string> = {};
for (const name of UI_ICONS) {
  ui[name] = innerSvg(readFileSync(`${root}node_modules/lucide-static/icons/${name}.svg`, "utf8"));
}

const social: Record<string, string> = {};
for (const name of SOCIAL_ICONS) {
  const svg = readFileSync(`${root}node_modules/simple-icons/icons/${name}.svg`, "utf8");
  social[name] = innerSvg(svg).replace(/<title>[\s\S]*?<\/title>/, "");
}

const out = `export const UI_ICONS = ${JSON.stringify(ui, null, 2)} as const;

export const SOCIAL_ICONS = ${JSON.stringify(social, null, 2)} as const;

export type UiIconName = keyof typeof UI_ICONS;
export type SocialIconName = keyof typeof SOCIAL_ICONS;
`;

writeFileSync(`${root}src/icons/icons.ts`, out);
console.log(`icons: ${Object.keys(ui).length} ui, ${Object.keys(social).length} social`);
