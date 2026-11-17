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
