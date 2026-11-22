import { DEFAULT_LANG, LANGS, LANG_META } from "../content/schema.ts";
import type { Lang, LocalizedText } from "../content/schema.ts";
import { getContent } from "./content.ts";
import { escapeHtml } from "./html.ts";
import { typography } from "./typography.ts";

export { DEFAULT_LANG, LANGS, LANG_META };
export type { Lang };

export type PageKey = "home" | "consultation" | "notFound";

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, "/");

export function url(lang: Lang, page: PageKey = "home", hash = ""): string {
  const prefix = lang === DEFAULT_LANG ? "" : `${lang}/`;
  const path = page === "consultation" ? "consultation/" : "";
  return `${BASE}${prefix}${path}${hash ? `#${hash}` : ""}`;
}

export function asset(path: string): string {
  return `${BASE}${path.replace(/^\//, "")}`;
}

const YEAR_WORDS: Record<Lang, Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }> = {
  ru: { one: "год", few: "года", many: "лет", other: "года" },
  uz: { other: "yil" },
  en: { one: "year", other: "years" },
};

const PLURALS = Object.fromEntries(LANGS.map((lang) => [lang, new Intl.PluralRules(lang)])) as Record<Lang, Intl.PluralRules>;

function yearsOfPractice(): number {
  return Math.max(0, new Date().getFullYear() - getContent().settings.practiceSince);
}

function yearsWord(n: number, lang: Lang): string {
  const words = YEAR_WORDS[lang];
  return words[PLURALS[lang].select(n)] ?? words.other;
}

function applyTokens(s: string, lang: Lang): string {
  if (!s.includes("{")) return s;
  const years = yearsOfPractice();
  return s.replaceAll("{years}", String(years)).replaceAll("{yearsWord}", yearsWord(years, lang));
}

export function tr(value: LocalizedText, lang: Lang): string {
  if (!value) throw new Error(`tr(): нет текста для языка ${lang} — поле переименовано в схеме, но не в компоненте`);
  const text = value[lang].trim() || value[DEFAULT_LANG].trim();
  return typography(applyTokens(text, lang), lang);
}

export function hasText(value: LocalizedText): boolean {
  return value[DEFAULT_LANG].trim() !== "";
}

export function lines(value: LocalizedText, lang: Lang): string {
  return escapeHtml(tr(value, lang)).replace(/\s*\n\s*/g, ' <br class="br-wide" />');
}

export function paragraphs(value: LocalizedText, lang: Lang): string[] {
  return tr(value, lang)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
