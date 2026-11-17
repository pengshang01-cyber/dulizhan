import { describe, expect, it } from "vitest";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { checkLinks } from "./links-check";

async function fixture(
  files: Record<string, string>,
  run: (root: string) => Promise<void>,
) {
  const root = await mkdtemp(join(tmpdir(), "m7-links-"));
  try {
    for (const [path, content] of Object.entries(files)) {
      const file = join(root, path);
      await mkdir(join(file, ".."), { recursive: true });
      await writeFile(file, content);
    }
    await run(root);
  } finally {
    // 仅删除本测试刚创建并持有的临时目录。
    if (!resolve(root).startsWith(join(resolve(tmpdir()), "m7-links-")))
      throw new Error("Unexpected cleanup path");
    await rm(root, { recursive: true, force: true });
  }
}
describe("internal links checker", () => {
  it("resolves both languages, encoded anchors, relative links and downloads", async () => {
    await fixture(
      {
        "index.html":
          '<link rel="canonical" href="https://factory.test/"><a href="/zh/#%E5%B0%BA%E5%AF%B8">Chinese</a><a href="/file.pdf">Download</a><a href="https://external.test/missing">External</a><a href="mailto:buyer@example.com">Mail</a>',
        "zh/index.html":
          '<h1 id="尺寸">尺寸</h1><a href="../?from=zh#top">Home</a><a href="https://factory.test/zh/#尺寸">Self</a>',
        "file.pdf": "fixture",
      },
      async (root) => {
        const result = await checkLinks(root);
        expect(result.errors).toEqual([]);
        expect(result.pages).toBe(2);
        expect(result.links).toBe(4);
        expect(result.anchors).toBe(2);
      },
    );
  });
  it("reports missing pages and fragments even when a 404 fallback exists", async () => {
    await fixture(
      {
        "index.html":
          '<a href="/missing/">Missing</a><a href="#missing">Fragment</a>',
        "404.html": "Not found",
      },
      async (root) => {
        const result = await checkLinks(root);
        expect(result.errors).toHaveLength(2);
        expect(result.errors.join(" ")).toContain("链接目标不存在");
        expect(result.errors.join(" ")).toContain("锚点不存在");
      },
    );
  });
  it("fails malformed encodings and unsafe schemes", async () => {
    await fixture(
      {
        "index.html":
          '<a href="/%zz">Invalid</a><a href="javascript:alert(1)">Unsafe</a>',
      },
      async (root) => {
        expect((await checkLinks(root)).errors).toHaveLength(2);
      },
    );
  });
  it("fails an empty build", async () => {
    await fixture({}, async (root) =>
      expect((await checkLinks(root)).errors).toHaveLength(1),
    );
  });
});
