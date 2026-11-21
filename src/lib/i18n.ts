import { LANGS } from "../content/schema.ts";
import type { Lang, LocalizedText } from "../content/schema.ts";
import { getContent } from "./content.ts";
import { typography } from "./typography.ts";

export { LANGS };
export type { Lang };

export const HTML_LANG: Record<Lang, string> = { ru: "ru", uz: "uz-Latn", en: "en" };
export const OG_LOCALE: Record<Lang, string> = { ru: "ru_RU", uz: "uz_UZ", en: "en_US" };
export const LANG_SHORT: Record<Lang, string> = { ru: "RU", uz: "UZ", en: "EN" };

export type PageKey = "home" | "consultation";

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, "/");

export function url(lang: Lang, page: PageKey = "home", hash = ""): string {
  const prefix = lang === "ru" ? "" : `${lang}/`;
  const path = page === "home" ? "" : `${page}/`;
  return `${BASE}${prefix}${path}${hash ? `#${hash}` : ""}`;
}

export function asset(path: string): string {
  return `${BASE}${path.replace(/^\//, "")}`;
}

export function yearsOfPractice(): number {
  return new Date().getFullYear() - getContent().settings.practiceSince;
}

export function yearsWord(n: number, lang: Lang): string {
  if (lang === "uz") return "yil";
  if (lang === "en") return n === 1 ? "year" : "years";
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "год";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "года";
  return "лет";
}

function applyTokens(s: string, lang: Lang): string {
  if (!s.includes("{")) return s;
  const years = yearsOfPractice();
  return s.replaceAll("{years}", String(years)).replaceAll("{yearsWord}", yearsWord(years, lang));
}

export function tr(value: LocalizedText | undefined, lang: Lang): string {
  if (!value) return "";
  const text = value[lang]?.trim() || value.ru?.trim() || "";
  return typography(applyTokens(text, lang), lang);
}

export function hasText(value: LocalizedText | undefined): boolean {
  return Boolean(value?.ru?.trim());
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function lines(value: LocalizedText | undefined, lang: Lang): string {
  return escapeHtml(tr(value, lang)).replace(/\s*\n\s*/g, ' <br class="br-wide" />');
}

export function paragraphs(value: LocalizedText | undefined, lang: Lang): string[] {
  return tr(value, lang).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

export function initials(name: string): string {
  const words = name.replace(/[«»"]/g, "").split(/\s+/).filter((w) => /^\p{L}/u.test(w));
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}
