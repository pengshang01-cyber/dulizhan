import { writeFile } from "node:fs/promises";
import type { AstroIntegration } from "astro";
import { indexingAssets } from "../src/lib/indexing";

export function indexingIntegration(
  allowIndexing: boolean,
  domain: string,
): AstroIntegration {
  return {
    name: "site-indexing-policy",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        // 仅写构建输出；public 保持默认禁止收录，切换设置后重新构建即可。
        const { robots, headers } = indexingAssets(allowIndexing, domain);
        await Promise.all([
          writeFile(new URL("robots.txt", dir), robots),
          writeFile(new URL("_headers", dir), headers),
        ]);
      },
    },
  };
}
