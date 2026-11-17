import { describe, it, expect } from "vitest";
import {
  visibleBlogPosts,
  blogPageCount,
  pagePosts,
  blogPageHref,
  validBlogDate,
} from "./blog-rules";
import { blogFields } from "./blog-schema";
import { renderBlogMarkdown } from "./blog-markdown";
const post = (
  id: string,
  draft = false,
  bodyZh = "中文",
  date = "2026-11-17",
) => ({ id, data: { draft, bodyZh, date } });
describe("博客发布规则", () => {
  it("英文排除草稿；中文还排除空白正文，不回退英文", () => {
    const data = [
      post("draft", true),
      post("english", false, ""),
      post("whitespace", false, "  "),
      post("both"),
    ];
    expect(visibleBlogPosts(data, "en").map((p) => p.id)).toEqual([
      "both",
      "english",
      "whitespace",
    ]);
    expect(visibleBlogPosts(data, "zh").map((p) => p.id)).toEqual(["both"]);
  });
  it("按日期倒序，同日保持稳定顺序，不修改原数组", () => {
    const data = [post("old", false, "中文", "2026-10-10"), post("new")];
    expect(visibleBlogPosts(data, "en").map((p) => p.id)).toEqual([
      "new",
      "old",
    ]);
    expect(data[0].id).toBe("old");
  });
  it("每页九篇，空列表保留首页，不生成额外空页", () => {
    expect([0, 1, 9, 10, 18, 19].map(blogPageCount)).toEqual([
      1, 1, 1, 2, 2, 3,
    ]);
    expect(
      pagePosts(
        Array.from({ length: 10 }, (_, i) => i),
        2,
      ),
    ).toEqual([9]);
    expect(() => pagePosts([], 2)).toThrow();
    expect(() => pagePosts([], 1.5)).toThrow();
    expect(blogPageHref(1, "zh")).toBe("/zh/blog/");
    expect(blogPageHref(2, "en")).toBe("/blog/page/2/");
  });
  it.each(["2026-02-30", "2026-13-01", "not-a-date", "2026-1-1"])(
    "拒绝无效日期 %s",
    (value) => expect(validBlogDate(value)).toBe(false),
  );
  it("接受闰年有效日期", () => expect(validBlogDate("2024-02-29")).toBe(true));
  it("新文章默认草稿、中文可空、英文正文必填", () => {
    const valid = {
      title: { en: "Guide" },
      description: { en: "Summary" },
      date: "2026-11-17",
      bodyEn: "## Start",
    };
    expect(blogFields.parse(valid)).toMatchObject({
      draft: true,
      bodyZh: "",
      relatedProducts: [],
    });
    expect(blogFields.safeParse({ ...valid, bodyEn: "  " }).success).toBe(
      false,
    );
    expect(
      blogFields.safeParse({ ...valid, relatedProducts: ["../invalid"] })
        .success,
    ).toBe(false);
  });
});
describe("Markdown、目录与图片", () => {
  const image = async () => ({
    src: "/_astro/photo.webp",
    width: 800,
    height: 450,
  });
  it("生成可访问的 H2/H3 目录、重复 ID 和中文锚点，正文 H1 不增加页面 H1", async () => {
    const result = await renderBlogMarkdown(
      "# Heading\n\n## 重复\n\n### Detail\n\n## 重复\n\n[Go](#重复)",
      "zh",
      image,
    );
    expect(result.html).not.toContain("<h1");
    expect(result.headings).toHaveLength(4);
    expect(new Set(result.headings.map((h) => h.slug)).size).toBe(4);
    expect(result.html).toContain(
      'href="#article-' + encodeURIComponent("重复") + '"',
    );
  });
  it("保留表格和列表，中文站内链接按语言生成", async () => {
    const result = await renderBlogMarkdown(
      "| A | B |\n| --- | --- |\n| One | Two |\n\n- Item\n\n[Contact](/contact/#quote)",
      "zh",
      image,
    );
    expect(result.html).toContain("<table>");
    expect(result.html).toContain("<ul>");
    expect(result.html).toContain('href="/zh/contact/#quote"');
  });
  it("正文图片须经过优化回调并带宽高和懒加载", async () => {
    const result = await renderBlogMarkdown(
      "![Cup](../../assets/images/blog/photo.png)",
      "en",
      image,
    );
    expect(result.html).toContain('src="/_astro/photo.webp"');
    expect(result.html).toContain('width="800"');
    expect(result.html).toContain('loading="lazy"');
    expect(result.html).not.toContain("__ASTRO_IMAGE_");
    await expect(
      renderBlogMarkdown(
        "![Remote](https://example.com/photo.jpg)",
        "en",
        image,
      ),
    ).rejects.toThrow("媒体库");
  });
  it("移除可执行 HTML 与危险链接", async () => {
    const result = await renderBlogMarkdown(
      '<script>alert(1)</script>\n\n<a href="javascript:alert(1)" onclick="alert(1)">Bad</a>\n\nSafe',
      "en",
      image,
    );
    expect(result.html).not.toContain("<script");
    expect(result.html).not.toContain("onclick");
    expect(result.html).not.toContain("javascript:");
    expect(result.html).toContain("Safe");
  });
});
