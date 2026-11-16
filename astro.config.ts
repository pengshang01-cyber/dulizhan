import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { isTodo, site } from "./src/config/site";
import { indexingIntegration } from "./scripts/indexing";

const siteUrl = isTodo(site.domain) ? undefined : site.domain;

export default defineConfig({
  output: "static",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh"],
    routing: { prefixDefaultLocale: false },
  },
  site: siteUrl,
  integrations: [
    ...(siteUrl
      ? [
          sitemap({
            filter: (page) =>
              !/^\/(?:zh\/)?(?:inquiry|styleguide)\/?$/.test(
                new URL(page).pathname,
              ),
          }),
        ]
      : []),
    indexingIntegration(site.allowIndexing, site.domain),
  ],
  vite: { plugins: [tailwindcss()] },
});
