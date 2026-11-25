import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { configuredOrigin, permanentlyNoindex } from "./src/lib/seo";
import { site } from "./src/config/site";
import { localized404 } from "./scripts/static-404";
import { indexingIntegration } from "./scripts/indexing";
import { fileURLToPath } from "node:url";
import { checkSeo } from "./scripts/seo-check";

const siteUrl = configuredOrigin(site.domain);

export default defineConfig({
  image: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
    ],
  },
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
    {
      name: "public-image-check",
      hooks: {
        "astro:build:done": async ({ dir }) => {
          const { publicPlaceholderImages } = await checkSeo(
            fileURLToPath(dir),
          );
          if (publicPlaceholderImages.length)
            throw new Error(
              "公开页面引用了占位图：\n" + publicPlaceholderImages.join("\n"),
            );
        },
      },
    },
  ],
  vite: { plugins: [tailwindcss()] },
});
