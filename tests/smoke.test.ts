import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import type { Browser, Page } from "playwright";
import { LANG_KEY } from "../src/lib/storage-keys.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const PORT = 4329;
const BASE = process.env.SMOKE_URL ?? `http://127.0.0.1:${PORT}/PD/`;
const PAGES = ["", "consultation/", "uz/", "uz/consultation/", "en/", "en/consultation/"];

let server: ChildProcess | undefined;
let browser: Browser;

async function waitForServer(url: string, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`сервер ${url} не ответил за ${timeoutMs / 1000} с`);
}

async function openPage(width: number, height: number, mobile = false): Promise<{ page: Page; errors: string[]; close: () => Promise<void> }> {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile });
  await context.addInitScript((key) => localStorage.removeItem(key), LANG_KEY);
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text());
  });
  return { page, errors, close: () => context.close() };
}

before(async () => {
  if (!process.env.SMOKE_URL) {
    assert.ok(existsSync(`${root}dist/index.html`), "нет сборки dist — сначала выполните npm run build");
    server = spawn(process.execPath, [`${root}node_modules/astro/bin/astro.mjs`, "preview", "--port", String(PORT), "--host", "127.0.0.1"], { cwd: root, stdio: "ignore" });
  }
  await waitForServer(BASE);
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  server?.kill();
});

describe("собранный сайт", () => {
  it("все страницы открываются без ошибок и с заголовком", async () => {
    const { page, errors, close } = await openPage(1440, 900);
    for (const path of PAGES) {
      const res = await page.goto(BASE + path, { waitUntil: "load" });
      assert.equal(res?.status(), 200, `${path || "/"} вернул ${res?.status()}`);
      assert.ok(await page.locator("h1").first().isVisible(), `${path || "/"}: нет видимого h1`);
      assert.ok(await page.locator('link[rel="canonical"]').count(), `${path || "/"}: нет canonical`);
    }
    assert.deepEqual(errors, []);
    await close();
  });

  it("переход на консультацию без перезагрузки, тема переключается", async () => {
    const { page, errors, close } = await openPage(1440, 900);
    await page.goto(BASE, { waitUntil: "load" });
    await page.evaluate(() => ((window as unknown as Record<string, unknown>).__smoke = true));
    await page.click(".site-header__cta");
    await page.waitForURL("**/consultation/");
    assert.equal(await page.evaluate(() => (window as unknown as Record<string, unknown>).__smoke), true, "страница перезагрузилась");
    const before = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.click(".site-header__theme");
    const after = await page.evaluate(() => document.documentElement.dataset.theme);
    assert.notEqual(before, after);
    assert.deepEqual(errors, []);
    await close();
  });

  it("окно услуг открывается и закрывается", async () => {
    const { page, close } = await openPage(1440, 900);
    await page.goto(BASE, { waitUntil: "load" });
    await page.click(".practice__more >> nth=0");
    assert.equal(await page.evaluate(() => (document.getElementById("practice-1") as HTMLDialogElement).open), true);
    await page.click("#practice-1 [data-dialog-close]");
    assert.equal(await page.evaluate(() => (document.getElementById("practice-1") as HTMLDialogElement).open), false);
    await close();
  });

  it("мобильное меню открывается и закрывается по ссылке", async () => {
    const { page, errors, close } = await openPage(390, 844, true);
    await page.goto(BASE, { waitUntil: "load" });
    await page.click("[data-menu-open]");
    assert.equal(await page.evaluate(() => (document.querySelector("[data-menu]") as HTMLDialogElement).open), true);
    await page.click(".menu__link >> nth=0");
    assert.equal(await page.evaluate(() => (document.querySelector("[data-menu]") as HTMLDialogElement).open), false);
    assert.deepEqual(errors, []);
    await close();
  });

  it("нет горизонтальной прокрутки на узких экранах", async () => {
    for (const width of [320, 390]) {
      const { page, close } = await openPage(width, 800, true);
      for (const path of PAGES) {
        await page.goto(BASE + path, { waitUntil: "load" });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        assert.equal(overflow, 0, `${width}px ${path || "/"}: страница шире экрана на ${overflow}px`);
      }
      await close();
    }
  });

  it("страница 404 ведёт на главную и не индексируется", async () => {
    const { page, close } = await openPage(1440, 900);
    await page.goto(BASE + "missing-page/", { waitUntil: "load" });
    const hrefs = await page.evaluate(() => [...document.querySelectorAll(".site-header__nav a")].map((a) => a.getAttribute("href") ?? ""));
    assert.ok(hrefs.length > 0 && hrefs.every((h) => /\/PD\/#/.test(h)), `ссылки меню на 404: ${hrefs.join(", ")}`);
    assert.equal(await page.locator('meta[name="robots"][content="noindex"]').count(), 1);
    await close();
  });
});
