import { describe, expect, it } from "vitest";
import { articleData } from "./blog-seo";
import type { BlogPost } from "./blog";

const post = {
  collection: "blog",
  id: "buying-guide",
  data: {
    title: { en: "Buying guide", zh: "采购指南" },
    description: { en: "Prepare your specification.", zh: "整理采购规格。" },
    date: "2026-11-17",
    cover: {
      src: "/_astro/blog-placeholder.webp",
      width: 1600,
      height: 900,
      format: "webp",
    },
    tags: [],
    relatedProducts: [],
    draft: false,
    bodyEn: "## Guide",
    bodyZh: "## 指南",
  },
} satisfies BlogPost;

describe("Article structured data", () => {
  it("uses the current language and excludes placeholder image and company facts", () => {
    const result = articleData(
      post,
      "zh",
      "https://factory.test/zh/blog/buying-guide/",
      "https://factory.test/placeholder.webp",
    );
    expect(result).toMatchObject({
      "@type": "Article",
      headline: "采购指南",
      description: "整理采购规格。",
      inLanguage: "zh-CN",
      datePublished: "2026-11-17",
    });
    expect(result).not.toHaveProperty("image");
    expect(result).not.toHaveProperty("publisher");
    expect(JSON.stringify(result)).not.toContain("TODO");
  });
  it("includes a real cover and revision without emitting TODO metadata", () => {
    const revised = {
      ...post,
      data: {
        ...post.data,
        updated: "2026-11-18",
        description: { en: "TODO_DESCRIPTION", zh: "" },
        cover: { ...post.data.cover, src: "/_astro/approved-cover.webp" },
      },
    };
    const result = articleData(
      revised,
      "en",
      "https://factory.test/blog/buying-guide/",
      "https://factory.test/approved-cover.webp",
    );
    expect(result.image).toBe("https://factory.test/approved-cover.webp");
    expect(result.dateModified).toBe("2026-11-18");
    expect(result.description).toBeUndefined();
    expect(JSON.stringify(result)).not.toContain("TODO");
  });
});
