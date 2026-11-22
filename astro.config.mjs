import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const site = process.env.SITE_URL ?? "https://wiut00012803.github.io";
const base = process.env.SITE_BASE ?? "/PD";

export default defineConfig({
  site,
  base,
  trailingSlash: "always",
  compressHTML: true,
  devToolbar: { enabled: false },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  integrations: [
    sitemap({
      i18n: { defaultLocale: "ru", locales: { ru: "ru", uz: "uz", en: "en" } },
    }),
  ],
  image: {
    responsiveStyles: false,
  },
  vite: {
    server: { watch: { ignored: ["**/tools/figma-bridge/jobs/**"] } },
  },
});
