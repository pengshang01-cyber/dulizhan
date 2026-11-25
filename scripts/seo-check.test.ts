import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { checkSeo } from "./seo-check";

const folders: string[] = [];
const prefix = join(resolve(tmpdir()), "dulizhan-seo-");
async function fixture(html: string) {
  const dir = await mkdtemp(prefix);
  folders.push(dir);
  await writeFile(join(dir, "index.html"), html);
  return dir;
}
afterEach(async () => {
  for (const dir of folders.splice(0)) {
    // 清理前核实目标是本测试生成的临时目录，绝不删除上级路径。
    if (
      !resolve(dir).startsWith(prefix) ||
      resolve(dir) === resolve(tmpdir()) + sep
    )
      throw new Error("Invalid test cleanup path");
    await rm(dir, { recursive: true, force: true });
  }
});
const valid =
  '<html lang="en"><head><title>Home &amp; products</title><meta name="description" content="About our products"><link rel="canonical" href="https://example.test/"><link rel="alternate" hreflang="en" href="https://example.test/"></head><body><h1>Home</h1><svg><title>Icon label</title></svg><script type="application/ld+json">{"@type":"Organization"}</script></body></html>';
describe("built HTML SEO check", () => {
  it("counts HTML titles without mistaking SVG labels or comments for titles", async () => {
    const dir = await fixture(valid + "<!-- <title>not a title</title> -->");
    expect((await checkSeo(dir)).errors).toEqual([]);
  });
  it.each([
    "<p>[TODO: Material]</p>",
    '<script type="application/json">{"sku":"TODO_SKU_CUP"}</script>',
    '<template><img alt="TO&#68;O_CAPTION"></template>',
  ])(
    "flags public placeholders in text, payloads and attributes: %s",
    async (markup) => {
      const dir = await fixture(valid.replace("</body>", markup + "</body>"));
      const result = await checkSeo(dir);
      expect(result.publicPlaceholderPages).toBe(1);
      expect(result.errors).toContain("/: 公开 HTML 含未填写的占位");
    },
  );
  it("allows text placeholders on the internal style guide", async () => {
    const dir = await fixture(valid);
    await mkdir(join(dir, "styleguide"));
    await writeFile(
      join(dir, "styleguide/index.html"),
      valid
        .replace(
          'rel="canonical" href="https://example.test/"',
          'rel="canonical" href="https://example.test/styleguide/"',
        )
        .replace("Home &amp; products", "Style guide")
        .replace("About our products", "Internal styles")
        .replace(
          "<h1>Home</h1>",
          '<h1>Style guide</h1><p>[TODO: Model]</p><img src="/image-placeholder.webp">',
        ),
    );
    const result = await checkSeo(dir);
    expect(result.publicPlaceholderPages).toBe(0);
    expect(result.publicPlaceholderImages).toEqual([]);
    expect(result.errors).toEqual([]);
  });
  it.each([
    '<img src="/_astro/cup-placeholder.hash.webp">',
    '<picture><source srcset="/real.webp 1x, /hero-placeholder.png 2x"></picture>',
    '<meta property="og:image" content="https://example.test/og-default.jpg">',
    '<script type="application/ld+json">{"image":"/product-placeholder.avif"}</script>',
    '<video poster="/warehouse-placeholder.jpg"></video>',
    '<img src="/photo.webp" alt="Placeholder product image">',
  ])("rejects a public placeholder image reference: %s", async (markup) => {
    const dir = await fixture(valid.replace("</body>", markup + "</body>"));
    const result = await checkSeo(dir);
    expect(result.publicPlaceholderImages).toEqual(["/"]);
    expect(result.errors).toContain("/: 公开 HTML 引用了占位图");
  });
  it("keeps ordinary form hints and real images valid", async () => {
    const markup =
      '<input placeholder="e.g. 500"><img src="/factory-exterior.webp" alt="Factory buildings">';
    const dir = await fixture(valid.replace("</body>", markup + "</body>"));
    expect((await checkSeo(dir)).errors).toEqual([]);
  });
  it("detects missing and duplicate required elements", async () => {
    const dir = await fixture(
      valid
        .replace("<h1>Home</h1>", "<h1>One</h1><h1>Two</h1>")
        .replace('<meta name="description" content="About our products">', ""),
    );
    const result = await checkSeo(dir);
    expect(result.errors.some((e) => e.includes("H1"))).toBe(true);
    expect(result.errors.some((e) => e.includes("description"))).toBe(true);
  });
  it("reports duplicates within a language", async () => {
    const dir = await fixture(valid);
    await mkdir(join(dir, "other"));
    await writeFile(
      join(dir, "other/index.html"),
      valid.replace(
        'rel="canonical" href="https://example.test/"',
        'rel="canonical" href="https://example.test/other/"',
      ),
    );
    const result = await checkSeo(dir);
    expect(result.errors.filter((e) => e.includes("重复"))).toHaveLength(2);
  });
  it("flags length without failing otherwise valid metadata", async () => {
    const dir = await fixture(
      valid.replace("Home &amp; products", "x".repeat(61)),
    );
    const result = await checkSeo(dir);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toHaveLength(1);
  });
  it.each(['{"name":"TODO_COMPANY"}', '{"name":broken}'])(
    "rejects unconfirmed or malformed JSON-LD %s",
    async (json) => {
      const dir = await fixture(
        valid.replace('{"@type":"Organization"}', json),
      );
      expect(
        (await checkSeo(dir)).errors.some((e) => e.includes("JSON-LD")),
      ).toBe(true);
    },
  );
  it("rejects missing hreflang targets and noindex sitemap entries", async () => {
    const dir = await fixture(
      valid.replace(
        "</head>",
        '<meta name="robots" content="noindex"><link rel="alternate" hreflang="zh-CN" href="https://example.test/zh/"></head>',
      ),
    );
    await writeFile(
      join(dir, "sitemap-0.xml"),
      "<urlset><url><loc>https://example.test/</loc></url></urlset>",
    );
    const result = await checkSeo(dir);
    expect(result.errors.some((e) => e.includes("hreflang 目标不存在"))).toBe(
      true,
    );
    expect(result.errors.some((e) => e.includes("包含 noindex"))).toBe(true);
  });
});
