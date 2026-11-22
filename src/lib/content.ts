import type { ImageMetadata } from "astro";
import { CONTENT_FILES, CONTENT_KEYS, uploadKey } from "../content/schema.ts";
import type { ContentKey, SiteContent, UploadStatus } from "../content/schema.ts";
import { formatIssues, validateContent } from "../content/validate.ts";

const UPLOADS_DIR = "/src/assets/uploads/";
const RAW_FILES = import.meta.glob<string>("/src/content/*.yaml", { query: "?raw", import: "default", eager: true });
const UPLOADS = import.meta.glob<ImageMetadata>("/src/assets/uploads/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}", { import: "default", eager: true });

const fileName = (path: string) => path.split("/").pop() ?? path;
const RAW_BY_NAME = new Map(Object.entries(RAW_FILES).map(([path, source]) => [fileName(path), source]));
const IMAGES = new Map(Object.entries(UPLOADS).map(([path, meta]) => [path.slice(UPLOADS_DIR.length), meta]));

function uploadStatus(path: string): UploadStatus {
  const key = uploadKey(path);
  if (key === null) return "outside";
  return IMAGES.has(key) ? "ok" : "missing";
}

function load(): SiteContent {
  const raw: Partial<Record<ContentKey, string>> = {};
  for (const key of CONTENT_KEYS) raw[key] = RAW_BY_NAME.get(CONTENT_FILES[key].file);
  const result = validateContent(raw, { uploadStatus });
  if (!result.ok) throw new Error(`Ошибки в контенте сайта:\n${formatIssues(result.problems)}`);
  return result.data;
}

let cached: SiteContent | undefined;

export function getContent(): SiteContent {
  if (import.meta.env.DEV || !cached) cached = load();
  return cached;
}

export function getImage(path: string): ImageMetadata | undefined {
  const key = uploadKey(path);
  return key === null ? undefined : IMAGES.get(key);
}
