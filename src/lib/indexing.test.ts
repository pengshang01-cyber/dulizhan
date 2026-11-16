import { describe, expect, it } from "vitest";
import { indexingAssets } from "./indexing";

describe("search indexing switch", () => {
  it("blocks crawling and indexing for every path before launch", () => {
    const files = indexingAssets(false, "TODO_SITE_DOMAIN");
    expect(files.robots).toBe("User-agent: *\nDisallow: /\n");
    expect(files.headers).toBe("/*\n  X-Robots-Tag: noindex, nofollow\n");
    expect(files.robots).not.toContain("Sitemap:");
  });

  it.each(["https://example.test", "https://example.test/"])(
    "restores crawling and the sitemap when enabled for %s",
    (domain) => {
      const files = indexingAssets(true, domain);
      expect(files.robots).toBe(
        "User-agent: *\nAllow: /\nSitemap: https://example.test/sitemap-index.xml\n",
      );
      expect(files.headers).not.toMatch(/X-Robots-Tag|noindex|nofollow/i);
      expect(files.robots).not.toContain("Disallow: /");
    },
  );

  it.each(["", "TODO_SITE_DOMAIN", "javascript:alert(1)"])(
    "refuses to enable indexing with an invalid domain %s",
    (domain) => {
      expect(() => indexingAssets(true, domain)).toThrow();
    },
  );
});
