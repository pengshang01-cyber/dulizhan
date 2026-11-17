import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, writeFile, unlink, access, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { preview } from "astro";
import { chromium, type Page } from "playwright";
import { checkSeo } from "./seo-check.ts";
import { checkLinks } from "./links-check.ts";

const root = new URL("../", import.meta.url);
const first = "src/content/blog/cupcake-liner-sizes-chart.json";
const second = "src/content/blog/custom-printed-cupcake-liners.json";
const run = promisify(execFile);
const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";
async function exists(url: URL) {
  try {
    await access(url);
    return true;
  } catch {
    return false;
  }
}

// 临时发布只用于独立构建；原文件逐字节恢复，新建文件逐个删除。
async function fixtureBuild(files: Record<string, string>, outDir: URL) {
  const original = new Map<string, string | null>();
  try {
    for (const [name, content] of Object.entries(files)) {
      const path = new URL(name, root);
      if (name.includes("m7-fixture-") && (await exists(path))) {
        throw new Error("临时测试文件已经存在，停止覆盖：" + name);
      }
      original.set(
        name,
        (await exists(path)) ? await readFile(path, "utf8") : null,
      );
      await writeFile(path, content);
    }
    await run(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        'import {build} from "astro"; await build({outDir:process.argv[1],logLevel:"warn"});',
        fileURLToPath(outDir),
      ],
      {
        cwd: fileURLToPath(root),
        env: {
          ...process.env,
          ASTRO_TELEMETRY_DISABLED: "1",
          npm_config_update_notifier: "false",
        },
        maxBuffer: 8 * 1024 * 1024,
      },
    );
  } finally {
    for (const [name, content] of original) {
      if (content === null) await unlink(new URL(name, root));
      else await writeFile(new URL(name, root), content);
    }
  }
}

async function screenshot(page: Page, path: string) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map(async (image) => {
        image.loading = "eager";
        await image.decode();
      }),
    );
    window.scrollTo(0, 0);
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
    "博客页面横向溢出",
  );
  await page.screenshot({ path, fullPage: true });
}

export async function verifyBlogPreview(destination: URL) {
  await mkdir(destination, { recursive: true });
  const before = new Map(
    await Promise.all(
      [first, second, "src/data/site.json"].map(
        async (name) =>
          [name, await readFile(new URL(name, root), "utf8")] as const,
      ),
    ),
  );
  const article = JSON.parse(before.get(first)!);
  const another = JSON.parse(before.get(second)!);
  const outDir = new URL(".astro/m7-published/", root);
  // 仅一篇双语示例取消草稿；另外一篇继续隐藏。
  await fixtureBuild({ [first]: json({ ...article, draft: false }) }, outDir);
  const seo = await checkSeo(fileURLToPath(outDir));
  const links = await checkLinks(fileURLToPath(outDir));
  assert.deepEqual(seo.errors, []);
  assert.deepEqual(links.errors, []);
  assert.equal(
    await exists(
      new URL("blog/custom-printed-cupcake-liners/index.html", outDir),
    ),
    false,
  );
  const server = await preview({
    root: fileURLToPath(root),
    outDir: fileURLToPath(outDir),
    server: { host: "127.0.0.1", port: 0 },
  });
  const browser = await chromium.launch();
  const pages: Record<string, unknown>[] = [];
  try {
    const origin = `http://127.0.0.1:${server.port}`;
    for (const viewport of [
      { name: "desktop", width: 1440, height: 900 },
      { name: "mobile", width: 375, height: 812 },
    ]) {
      for (const locale of ["en", "zh"] as const) {
        const page = await browser.newPage({ viewport });
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        const prefix = locale === "zh" ? "/zh" : "";
        await page.goto(origin + prefix + "/blog/");
        assert.equal(await page.locator("[data-blog-card]").count(), 1);
        assert.equal(
          await page
            .locator("[data-cookie-consent], [data-cookie-settings]")
            .count(),
          0,
        );
        await screenshot(
          page,
          fileURLToPath(
            new URL(
              `${locale}-blog-published-${viewport.name}.png`,
              destination,
            ),
          ),
        );
        await page.locator("[data-blog-card] h2 a").click();
        await page.locator("[data-blog-body]").waitFor();
        assert.equal(await page.locator("main h1").count(), 1);
        const toc = page.locator('nav[aria-labelledby="blog-toc-title"] a');
        assert.ok((await toc.count()) >= 3);
        await toc.first().click();
        assert.ok(new URL(page.url()).hash.startsWith("#article-"));
        const translated = page
          .locator(
            `[data-language-switch] a[lang="${locale === "en" ? "zh-CN" : "en"}"]`,
          )
          .first();
        assert.equal(
          new URL((await translated.getAttribute("href")) ?? "", origin).hash,
          "",
        );
        const data = await page
          .locator('script[type="application/ld+json"]')
          .allTextContents();
        assert.ok(data.some((text) => JSON.parse(text)["@type"] === "Article"));
        assert.ok(data.every((text) => !text.includes("TODO")));
        const add = page.locator("[data-inquiry-slug]").first();
        await add.click();
        await page.waitForFunction(
          () =>
            document
              .querySelector("[data-inquiry-slug]")
              ?.getAttribute("aria-pressed") === "true",
        );
        // 截图恢复未加入状态，避免不同视口呈现不同的临时清单。
        await add.click();
        await screenshot(
          page,
          fileURLToPath(
            new URL(`${locale}-blog-article-${viewport.name}.png`, destination),
          ),
        );
        assert.deepEqual(errors, []);
        pages.push({
          locale,
          width: viewport.width,
          tocLinks: await toc.count(),
          relatedInquiryWorks: true,
          overflow: false,
          consoleErrors: errors.length,
        });
        await page.close();
      }
    }
  } finally {
    await browser.close();
    const closed = server.closed();
    await server.stop();
    await closed;
  }

  // 10 篇英文 / 1 篇中文：检查分页、缺少译文、上一篇下一篇、正文图片及可收录 sitemap。
  const pagingDir = new URL(".astro/m7-pagination/", root);
  const site = JSON.parse(before.get("src/data/site.json")!);
  const fixture: Record<string, string> = {
    [first]: json({ ...article, draft: false }),
    [second]: json({ ...another, draft: false, bodyZh: "" }),
    "src/data/site.json": json({
      ...site,
      domain: "https://m7-fixture.example",
      allowIndexing: true,
    }),
  };
  for (let index = 1; index <= 8; index++) {
    fixture[`src/content/blog/m7-fixture-${index}.json`] = json({
      ...article,
      draft: false,
      title: { en: `M7 pagination fixture ${index}`, zh: "" },
      description: {
        en: `Temporary article ${index} for checking nine articles per page.`,
        zh: "",
      },
      bodyEn:
        "## Test section\n\n![Placeholder](../../assets/images/blog/blog-cover-placeholder.png)\n\n[Products](/products/)",
      bodyZh: "",
    });
  }
  await fixtureBuild(fixture, pagingDir);
  const paginationSeo = await checkSeo(fileURLToPath(pagingDir));
  const paginationLinks = await checkLinks(fileURLToPath(pagingDir));
  assert.deepEqual(paginationSeo.errors, []);
  assert.deepEqual(paginationLinks.errors, []);
  const pageOne = await readFile(new URL("blog/index.html", pagingDir), "utf8");
  const pageTwo = await readFile(
    new URL("blog/page/2/index.html", pagingDir),
    "utf8",
  );
  const englishOnly = await readFile(
    new URL("blog/custom-printed-cupcake-liners/index.html", pagingDir),
    "utf8",
  );
  assert.equal((pageOne.match(/data-blog-card=/g) ?? []).length, 9);
  assert.equal((pageTwo.match(/data-blog-card=/g) ?? []).length, 1);
  assert.equal(
    await exists(new URL("zh/blog/page/2/index.html", pagingDir)),
    false,
  );
  assert.equal(
    await exists(
      new URL("zh/blog/custom-printed-cupcake-liners/index.html", pagingDir),
    ),
    false,
  );
  assert.equal(englishOnly.includes('hreflang="zh-CN"'), false);
  assert.equal(pageTwo.includes('hreflang="zh-CN"'), false);
  assert.equal(/<nav[^>]+data-language-switch/.test(englishOnly), false);
  assert.ok(
    englishOnly.includes('rel="prev"') && englishOnly.includes('rel="next"'),
  );
  const bodyImage = await readFile(
    new URL("blog/m7-fixture-1/index.html", pagingDir),
    "utf8",
  );
  assert.ok(
    /<img[^>]+src="\/_astro\/[^>]+width="\d+"[^>]+height="\d+"[^>]+loading="lazy"/.test(
      bodyImage,
    ),
  );
  assert.ok(paginationSeo.sitemapPages > 0);
  for (const [name, content] of before)
    assert.equal(
      await readFile(new URL(name, root), "utf8"),
      content,
      name + "未恢复",
    );
  await writeFile(
    new URL("blog-browser.json", destination),
    json({
      mode: "Temporary published content in isolated .astro output; sources restored before verification; no publication or real inquiries",
      published: { seo, links, pages },
      pagination: {
        enArticles: 10,
        zhArticles: 1,
        pageSizes: [9, 1],
        missingTranslationExcluded: true,
        bodyImageOptimized: true,
        previousNext: true,
        seo: paginationSeo,
        links: paginationLinks,
      },
      sourceDraftsRestored: true,
      finalAllowIndexing: false,
    }),
  );
  console.log(
    "M7 blog QA: bilingual publication, TOC, related inquiry, 9+1 pagination, missing Chinese body, draft exclusion, sitemap and restoration passed.",
  );
}
