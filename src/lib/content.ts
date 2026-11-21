import type { ImageMetadata } from "astro";
import { CONTENT_FILES } from "../content/schema.ts";
import type { ContentKey, SiteContent } from "../content/schema.ts";
import { formatProblems, validateContent } from "../content/validate.ts";

const RAW_FILES = import.meta.glob<string>("/src/content/*.yaml", { query: "?raw", import: "default", eager: true });
const UPLOADS = import.meta.glob<ImageMetadata>("/src/assets/uploads/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}", { import: "default", eager: true });

const fileName = (path: string) => path.split(/[\\/]/).pop() ?? path;
const IMAGES = new Map(Object.entries(UPLOADS).map(([path, meta]) => [fileName(path), meta]));

function load(): SiteContent {
  const raw: Partial<Record<ContentKey, string>> = {};
  for (const key of Object.keys(CONTENT_FILES) as ContentKey[]) {
    const entry = Object.entries(RAW_FILES).find(([path]) => fileName(path) === CONTENT_FILES[key].file);
    if (entry) raw[key] = entry[1];
  }
  const result = validateContent(raw, { imageExists: (p) => IMAGES.has(fileName(p)) });
  if (!result.data) throw new Error(`Ошибки в контенте сайта:\n${formatProblems(result.problems)}`);
  return result.data;
}

let cached: SiteContent | undefined;

export function getContent(): SiteContent {
  if (import.meta.env.DEV || !cached) cached = load();
  return cached;
}

export function getImage(path: string | undefined): ImageMetadata | undefined {
  return path ? IMAGES.get(fileName(path)) : undefined;
}
