import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { configuredOrigin, permanentlyNoindex } from "./src/lib/seo";
import { site } from "./src/config/site";
import { localized404 } from "./scripts/static-404";
import { indexingIntegration } from "./scripts/indexing";

const siteUrl = configuredOrigin(site.domain);

export default defineConfig({
  output: "static",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh"],
    routing: { prefixDefaultLocale: false },
  },
  site: siteUrl,
  integrations: [
    ...(siteUrl && site.allowIndexing
      ? [
          sitemap({
            filter: (page) => !permanentlyNoindex(new URL(page).pathname),
            i18n: { defaultLocale: "en", locales: { en: "en", zh: "zh-CN" } },
          }),
        ]
      : []),
    indexingIntegration(site.allowIndexing, site.domain),
    localized404(),
  ],
  vite: { plugins: [tailwindcss()] },
});
