import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { LANG_KEY, THEME_KEY } from "../src/lib/storage-keys.ts";

const BASE = process.env.SHOTS_URL ?? "http://localhost:4321/PD/";
const OUT = process.env.SHOTS_DIR ?? "screenshots";

const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "1"] as const;
  }),
);

const widths = (args.get("w") ?? "1440,960,820,390").split(",").map(Number);
const themes = (args.get("theme") ?? "dark,light").split(",");
const langs = (args.get("lang") ?? "ru").split(",");
const pages = (args.get("page") ?? "home,consultation").split(",");
const full = args.get("full") !== "0";
const menu = args.has("menu");
const clip = args.get("clip");

const HEIGHT: Record<number, number> = { 1440: 900, 960: 1000, 820: 1180, 390: 844 };

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

for (const width of widths) {
  for (const theme of themes) {
    const context = await browser.newContext({
      viewport: { width, height: HEIGHT[width] ?? 900 },
      deviceScaleFactor: width <= 820 ? 2 : 1,
      colorScheme: theme === "dark" ? "dark" : "light",
      hasTouch: width <= 820,
      isMobile: width < 600,
    });
    await context.addInitScript(
      ({ t, themeKey, langKey }) => {
        localStorage.setItem(themeKey, t);
        localStorage.removeItem(langKey);
      },
      { t: theme, themeKey: THEME_KEY, langKey: LANG_KEY },
    );
    const page = await context.newPage();
    for (const lang of langs) {
      for (const p of pages) {
        const path = `${lang === "ru" ? "" : `${lang}/`}${p === "home" ? "" : `${p}/`}`;
        await page.goto(BASE + path, { waitUntil: "networkidle" });
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 600) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 40));
          }
          window.scrollTo(0, 0);
          await document.fonts.ready;
          await Promise.all(
            Array.from(document.images).map((img) => {
              img.loading = "eager";
              return img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; });
            }),
          );
        });
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(600);
        const name = `${OUT}/${width}-${theme}-${lang}-${p}`;
        if (clip) {
          const [y, h] = clip.split(":").map(Number);
          await page.screenshot({ path: `${name}-clip.png`, fullPage: true, clip: { x: 0, y, width, height: h } });
        } else {
          await page.screenshot({ path: `${name}.png`, fullPage: full });
        }
        if (menu && width < 900 && p === "home") {
          await page.click("[data-menu-open]");
          await page.waitForTimeout(400);
          await page.screenshot({ path: `${name}-menu.png` });
          await page.keyboard.press("Escape");
        }
        console.log(name);
      }
    }
    await context.close();
  }
}

await browser.close();
