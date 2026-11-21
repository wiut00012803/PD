const THEME_KEY = "pd-theme";
const LANG_KEY = "pd-lang";

type Theme = "light" | "dark";

function storedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
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
    if (label) {
      btn.setAttribute("aria-label", label);
      btn.title = label;
    }
  }
}

function toggleTheme() {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {}
  const root = document.documentElement;
  root.classList.add("theme-switching");
  applyTheme(next);
  syncThemeButtons();
  window.setTimeout(() => root.classList.remove("theme-switching"), 350);
}

function rememberLang(lang: string) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {}
}

function initMenu() {
  const menu = document.querySelector<HTMLDialogElement>("[data-menu]");
  if (!menu) return;
  const open = () => {
    menu.showModal();
    document.documentElement.classList.add("menu-open");
  };
  const close = () => menu.close();
  menu.addEventListener("close", () => document.documentElement.classList.remove("menu-open"));
  for (const b of document.querySelectorAll("[data-menu-open]")) b.addEventListener("click", open);
  for (const b of menu.querySelectorAll("[data-menu-close], [data-menu-close-link]")) b.addEventListener("click", close);
  const wide = window.matchMedia("(min-width: 900px)");
  wide.addEventListener("change", () => wide.matches && menu.open && close());
}

function initDialogs() {
  for (const trigger of document.querySelectorAll<HTMLElement>("[data-dialog-open]")) {
    const dialog = document.getElementById(trigger.dataset.dialogOpen ?? "") as HTMLDialogElement | null;
    if (!dialog) continue;
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      dialog.showModal();
    });
  }
  for (const dialog of document.querySelectorAll<HTMLDialogElement>("dialog.dialog")) {
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
    for (const b of dialog.querySelectorAll("[data-dialog-close]")) b.addEventListener("click", () => dialog.close());
  }
}

function initShowMore() {
  for (const btn of document.querySelectorAll<HTMLButtonElement>("[data-show-more]")) {
    const list = document.getElementById(btn.dataset.showMore ?? "");
    if (!list) continue;
    btn.addEventListener("click", () => {
      for (const el of list.querySelectorAll(".is-hidden-extra")) el.classList.remove("is-hidden-extra");
      btn.closest("[data-show-more-wrap]")?.remove();
    });
  }
}

function initCarousels() {
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
    items.forEach((it) => observer.observe(it));
  }
}

function initLazyMaps() {
  const frames = document.querySelectorAll<HTMLIFrameElement>("iframe[data-src]");
  if (!frames.length) return;
  const load = (f: HTMLIFrameElement) => {
    if (f.dataset.src) {
      f.src = f.dataset.src;
      f.removeAttribute("data-src");
    }
  };
  const observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          load(e.target as HTMLIFrameElement);
          observer.unobserve(e.target);
        }
      }
    },
    { rootMargin: "400px" },
  );
  frames.forEach((f) => observer.observe(f));
}

function initPage() {
  syncThemeButtons();
  initMenu();
  initDialogs();
  initShowMore();
  initCarousels();
  initLazyMaps();
}

export function initSite(): void {
  document.addEventListener("click", (e) => {
    const target = e.target as Element | null;
    if (target?.closest("[data-theme-toggle]")) toggleTheme();
    const langLink = target?.closest<HTMLElement>("[data-set-lang]");
    if (langLink?.dataset.setLang) rememberLang(langLink.dataset.setLang);
  });

  document.addEventListener("astro:before-swap", (e) => {
    const event = e as Event & { newDocument: Document };
    applyTheme(currentTheme(), event.newDocument.documentElement);
  });

  document.addEventListener("astro:page-load", initPage);

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!storedTheme()) {
      applyTheme(systemTheme());
      syncThemeButtons();
    }
  });
}
