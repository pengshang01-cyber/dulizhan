import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { isTodo, site } from "./src/config/site";

const siteUrl = isTodo(site.domain) ? undefined : site.domain;

export default defineConfig({
  output: "static",
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
    routing: { prefixDefaultLocale: false },
  },
  site: siteUrl,
  integrations: siteUrl ? [sitemap()] : [],
  vite: { plugins: [tailwindcss()] },
});
