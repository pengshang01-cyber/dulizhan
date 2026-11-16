import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { isTodo, site } from "./src/config/site";

const siteUrl = isTodo(site.domain) ? undefined : site.domain;

export default defineConfig({
  output: "static",
  site: siteUrl,
  integrations: siteUrl ? [sitemap()] : [],
  vite: { plugins: [tailwindcss()] },
});
