import { LANG_KEY, THEME_KEY } from "../lib/storage-keys.ts";

type Theme = "light" | "dark";

const DESKTOP_QUERY = "(min-width: 900px)";
const DARK_QUERY = "(prefers-color-scheme: dark)";

let sessionTheme: Theme | null = null;
let storageWarned = false;
let pageObservers: IntersectionObserver[] = [];

function warnStorage(error: unknown) {
  if (storageWarned) return;
  storageWarned = true;
  console.warn("pd: localStorage недоступен — тема и язык не сохранятся между визитами", error);
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    warnStorage(error);
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    warnStorage(error);
  }
}

function storedTheme(): Theme | null {
  const value = readStorage(THEME_KEY);
  if (value === "light" || value === "dark") return value;
  return sessionTheme;
}

function systemTheme(): Theme {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function currentTheme(): Theme {
  return storedTheme() ?? systemTheme();
}

function applyTheme(theme: Theme, root: HTMLElement = document.documentElement) {
  root.dataset.theme = theme;
}

function syncThemeButtons() {
  const theme = currentTheme();
  for (const btn of document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]")) {
    const label = theme === "dark" ? btn.dataset.labelLight : btn.dataset.labelDark;
    if (!label) continue;
    btn.setAttribute("aria-label", label);
    btn.title = label;
  }
}

function toggleTheme() {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  sessionTheme = next;
  writeStorage(THEME_KEY, next);
  applyTheme(next);
  syncThemeButtons();
}

function menuDialog(): HTMLDialogElement | null {
  return document.querySelector<HTMLDialogElement>("[data-menu]");
}

function openDialog(id: string | undefined) {
  const dialog = id ? document.getElementById(id) : null;
  if (dialog instanceof HTMLDialogElement) dialog.showModal();
  else console.error(`pd: окно #${id} не найдено`);
}

function revealMore(listId: string | undefined, button: Element) {
  const list = listId ? document.getElementById(listId) : null;
  if (!list) {
    console.error(`pd: список #${listId} не найден`);
    return;
  }
  const hidden = Array.from(list.querySelectorAll<HTMLElement>(".is-hidden-extra"));
  hidden.forEach((el) => el.classList.remove("is-hidden-extra"));
  document.querySelector(`[data-carousel-dots="${listId}"]`)?.querySelectorAll(".is-hidden-extra").forEach((el) => el.classList.remove("is-hidden-extra"));
  button.closest("[data-show-more-wrap]")?.remove();
  const first = hidden[0];
  if (first) {
    first.tabIndex = -1;
    first.focus({ preventScroll: false });
  }
}

function handleClick(event: MouseEvent) {
  const target = event.target as Element | null;
  if (!target) return;

  if (target.closest("[data-theme-toggle]")) toggleTheme();

  const langLink = target.closest<HTMLElement>("[data-set-lang]");
  if (langLink?.dataset.setLang) writeStorage(LANG_KEY, langLink.dataset.setLang);

  if (target.closest("[data-menu-open]")) menuDialog()?.showModal();
  if (target.closest("[data-menu-close], [data-menu-close-link]")) menuDialog()?.close();

  const dialogTrigger = target.closest<HTMLElement>("[data-dialog-open]");
  if (dialogTrigger) {
    event.preventDefault();
    openDialog(dialogTrigger.dataset.dialogOpen);
  }

  const dialogClose = target.closest("[data-dialog-close]");
  if (dialogClose) dialogClose.closest("dialog")?.close();
  if (target instanceof HTMLDialogElement && target.classList.contains("dialog")) target.close();

  const moreButton = target.closest<HTMLElement>("[data-show-more]");
  if (moreButton) revealMore(moreButton.dataset.showMore, moreButton);
}

function observeCarousels() {
  for (const track of document.querySelectorAll<HTMLElement>("[data-carousel]")) {
    const dots = document.querySelector<HTMLElement>(`[data-carousel-dots="${track.id}"]`);
    if (!dots) continue;
    const items = Array.from(track.children) as HTMLElement[];
    const buttons = Array.from(dots.querySelectorAll<HTMLButtonElement>("button"));
    buttons.forEach((b, i) => b.addEventListener("click", () => items[i]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" })));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = items.indexOf(entry.target as HTMLElement);
          buttons.forEach((b, i) => b.setAttribute("aria-current", i === index ? "true" : "false"));
        }
      },
      { root: track, threshold: 0.6 },
    );
    items.forEach((item) => observer.observe(item));
    pageObservers.push(observer);
  }
}

function observeLazyMaps() {
  const frames = document.querySelectorAll<HTMLIFrameElement>("iframe[data-src]");
  if (!frames.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const frame = entry.target as HTMLIFrameElement;
        if (frame.dataset.src) {
          frame.src = frame.dataset.src;
          frame.removeAttribute("data-src");
        }
        observer.unobserve(frame);
      }
    },
    { rootMargin: "400px" },
  );
  frames.forEach((frame) => observer.observe(frame));
  pageObservers.push(observer);
}

function initPage() {
  for (const [name, init] of [
    ["theme", syncThemeButtons],
    ["carousels", observeCarousels],
    ["maps", observeLazyMaps],
  ] as const) {
    try {
      init();
    } catch (error) {
      console.error(`pd: не удалось запустить «${name}»`, error);
    }
  }
}

function disposePage() {
  pageObservers.forEach((observer) => observer.disconnect());
  pageObservers = [];
}

export function initSite(): void {
  document.addEventListener("click", handleClick);

  document.addEventListener("astro:before-swap", (e) => {
    disposePage();
    const event = e as Event & { newDocument: Document };
    applyTheme(currentTheme(), event.newDocument.documentElement);
  });

  document.addEventListener("astro:page-load", initPage);

  const desktop = window.matchMedia(DESKTOP_QUERY);
  desktop.addEventListener("change", () => {
    if (desktop.matches) menuDialog()?.close();
  });

  window.matchMedia(DARK_QUERY).addEventListener("change", () => {
    if (storedTheme()) return;
    applyTheme(systemTheme());
    syncThemeButtons();
  });
}
