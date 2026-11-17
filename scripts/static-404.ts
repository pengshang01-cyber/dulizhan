import { rename, rmdir } from "node:fs/promises";
import type { AstroIntegration } from "astro";

// Astro 只将根 /404 特判为单文件；Workers 的就近回退需要 zh/404.html。
export function localized404(): AstroIntegration {
  return {
    name: "localized-static-404",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        await rename(
          new URL("zh/404/index.html", dir),
          new URL("zh/404.html", dir),
        );
        await rmdir(new URL("zh/404/", dir));
      },
    },
  };
}
