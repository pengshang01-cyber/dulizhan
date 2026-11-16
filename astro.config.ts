import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { site } from "./src/config/site";

const siteUrl = site.domain.startsWith("TODO_") ? undefined : site.domain;

export default defineConfig({
  output: "static",
  site: siteUrl,
  integrations: siteUrl ? [sitemap()] : [],
  vite: { plugins: [tailwindcss()] },
});
