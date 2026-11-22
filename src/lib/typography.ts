import type { Lang } from "../content/schema.ts";

export const NBSP = "\u00a0";

const SHORT_WORDS: Record<Lang, RegExp> = {
  ru: /(^|[\s(«"„“—–-])([а-яёА-ЯЁ]{1,2}|без|для|над|под|при|про|или|как|что|это|его|все|наш|ваш)[ \t]+/g,
  uz: /(^|[\s(«"])(va|bu|u|har|eng|bir)[ \t]+/gi,
  en: /(^|[\s(“"])(a|an|the|of|to|in|on|at|by|for|and|or|is|we|our|your)[ \t]+/gi,
};

export function typography(input: string, lang: Lang): string {
  if (!input) return input;
  let s = input;
  s = s.replace(/(\d) (?=\d{3}(\D|$))/g, `$1${NBSP}`);
  s = s.replace(/(\d)[ \t]+(?=[^\s\d–—-])/g, `$1${NBSP}`);
  s = s.replace(/[ \t]+([—–])(?=\s|$)/g, `${NBSP}$1`);
  s = s.replace(/(№|§)[ \t]+/g, `$1${NBSP}`);
  for (let i = 0; i < 2; i++) s = s.replace(SHORT_WORDS[lang], `$1$2${NBSP}`);
  return s;
}
