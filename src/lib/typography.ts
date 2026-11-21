import type { Lang } from "../content/schema.ts";

const NBSP = String.fromCharCode(0xa0);

const RU_SHORT_WORDS = /(^|[\s(«"„“—–-])([а-яёА-ЯЁ]{1,2}|без|для|над|под|при|про|или|как|что|это|его|все|наш|ваш)[ \t]+/g;
const EN_SHORT_WORDS = /(^|[\s(“"])(a|an|the|of|to|in|on|at|by|for|and|or|is|we|our|your)[ \t]+/gi;
const UZ_SHORT_WORDS = /(^|[\s(«"])(va|bu|u|har|eng|bir)[ \t]+/gi;

export function typography(input: string, lang: Lang): string {
  if (!input) return input;
  let s = input;
  s = s.replace(/(\d) (?=\d{3}(\D|$))/g, `$1${NBSP}`);
  s = s.replace(/(\d)[ \t]+(?=[^\s\d–—-])/g, `$1${NBSP}`);
  s = s.replace(/[ \t]+([—–])(?=\s|$)/g, `${NBSP}$1`);
  s = s.replace(/(№|§)[ \t]+/g, `$1${NBSP}`);
  const shortWords = lang === "ru" ? RU_SHORT_WORDS : lang === "en" ? EN_SHORT_WORDS : UZ_SHORT_WORDS;
  for (let i = 0; i < 2; i++) s = s.replace(shortWords, `$1$2${NBSP}`);
  return s;
}
