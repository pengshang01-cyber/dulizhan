import assert from "node:assert/strict";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build, preview } from "astro";
import { chromium, type Page } from "playwright";
import sharp from "sharp";

// 只使用独立构建中的内存数据；测试图逐个创建、逐个清理，不改正式 JSON / dist。
export async function inspectSiteImages(page: Page, uploaded: boolean) {
  const path = new URL(page.url()).pathname;
  const about = path.includes("/about/");
  const chinese = path.startsWith("/zh/");
  const images = await page.locator("img").evaluateAll((nodes) =>
    nodes.map((img) => ({
      src: img.getAttribute("src"),
      width: Number(img.getAttribute("width")),
      height: Number(img.getAttribute("height")),
      loading: img.getAttribute("loading"),
      alt: img.getAttribute("alt"),
    })),
  );
  assert(
    images.every(
      (img) => img.width > 0 && img.height > 0 && img.src?.includes(".webp"),
    ),
  );
  assert.equal(
    await page.locator("[data-site-logo]").count(),
    uploaded ? 1 : 0,
  );
  const og = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  assert(og);
  assert.equal(
    await page.locator('meta[name="twitter:image"]').getAttribute("content"),
    og,
  );
  assert.equal(og.endsWith("/og-default.jpg"), !uploaded);
  const organization = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((nodes) =>
      nodes
        .map((n) => JSON.parse(n.textContent!))
        .flat()
        .find((data) => data["@type"] === "Organization"),
    );
  assert.equal(Boolean(organization?.logo), uploaded);
  if (uploaded) {
    for (const url of [og, organization.logo]) {
      const response = await page.request.get(
        new URL(new URL(url).pathname, page.url()).href,
      );
      assert.equal(response.status(), 200);
      const metadata = await sharp(await response.body()).metadata();
      assert.equal(metadata.format, "webp");
      if (url === og)
        assert.deepEqual([metadata.width, metadata.height], [1200, 630]);
    }
  }
  if (about) {
    const gallery = page.locator("[data-about-gallery]");
    assert.equal(await gallery.locator("img").count(), uploaded ? 2 : 4);
    assert(
      await gallery
        .locator("img")
        .evaluateAll((nodes) =>
          nodes.every((img) => img.getAttribute("loading") === "lazy"),
        ),
    );
    if (uploaded) {
      assert.deepEqual(
        await gallery
          .locator("img")
          .evaluateAll((nodes) => nodes.map((img) => img.getAttribute("alt"))),
        [
          chinese ? "CMS 测试车间一" : "CMS test workshop one",
          "CMS test workshop two",
        ],
      );
      assert(!(await gallery.innerText()).includes("Placeholder"));
      assert(!(await gallery.innerText()).includes("占位图"));
    }
  } else {
    const hero = page.locator("[data-home-hero]");
    assert.equal(await hero.getAttribute("loading"), "eager");
    assert.equal(await hero.getAttribute("fetchpriority"), "high");
    assert.equal(
      (await hero.getAttribute("src"))?.includes("m7b-test-hero"),
      uploaded,
    );
    if (uploaded) {
      assert.equal(
        await hero.getAttribute("alt"),
        chinese ? "CMS 测试首页主图" : "CMS test home hero",
      );
      assert(
        (
          await page.locator("#factory-video img").getAttribute("src")
        )?.includes("m7b-test-hero"),
      );
      assert.equal(
        await page.locator("#factory-video img").getAttribute("loading"),
        "lazy",
      );
    }
  }
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  return {
    path,
    uploaded,
    images,
    og,
    organizationLogo: organization?.logo ?? null,
  };
}

export async function captureSiteImagesPreview(destination: URL) {
  const root = new URL("../", import.meta.url);
  const outDir = new URL("../.astro/site-images-preview/", import.meta.url);
  const sitePath = new URL("src/data/site.json", root);
  const original = await readFile(sitePath, "utf8");
  const fields = {
    logo: "../assets/images/site/m7b-test-logo.png",
    ogImage: "../assets/images/site/m7b-test-hero.png",
    homeHeroImage: "../assets/images/site/m7b-test-hero.png",
    homeHeroAlt: { en: "CMS test home hero", zh: "CMS 测试首页主图" },
    aboutGallery: [
      {
        image: "../assets/images/site/m7b-test-workshop-one.png",
        caption: { en: "CMS test workshop one", zh: "CMS 测试车间一" },
      },
      {
        image: "../assets/images/site/m7b-test-workshop-two.png",
        caption: { en: "CMS test workshop two", zh: "" },
      },
    ],
    factoryVideoPoster: "../assets/images/site/m7b-test-hero.png",
    youtubeVideoId: "TESTVIDEO01",
  };
  const fixture = { ...JSON.parse(original), ...fields };
  const created: URL[] = [];
  const evidence = [];
  try {
    for (const [name, width, height, label, color] of [
      ["logo", 512, 512, "TEST LOGO", "#a55c39"],
      ["hero", 1600, 1200, "CMS TEST HERO", "#e8ddce"],
      ["workshop-one", 1600, 1067, "CMS TEST WORKSHOP 01", "#f4eee5"],
      ["workshop-two", 1600, 1067, "CMS TEST WORKSHOP 02", "#e8ddce"],
    ] as const) {
      const file = new URL(
        "src/assets/images/site/m7b-test-" + name + ".png",
        root,
      );
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="' +
        width +
        '" height="' +
        height +
        '"><rect width="100%" height="100%" fill="' +
        color +
        '"/><rect x="8%" y="12%" width="84%" height="76%" fill="none" stroke="#85786b" stroke-width="2"/><text x="50%" y="50%" text-anchor="middle" fill="#30271f" font-family="sans-serif" font-size="' +
        width / 26 +
        '">' +
        label +
        '</text><text x="50%" y="59%" text-anchor="middle" fill="#50453b" font-family="sans-serif" font-size="' +
        width / 50 +
        '">Placeholder / not factory photography</text></svg>';
      await writeFile(file, await sharp(Buffer.from(svg)).png().toBuffer(), {
        flag: "wx",
      });
      created.push(file);
    }
    await build({
      root: fileURLToPath(root),
      outDir: fileURLToPath(outDir),
      logLevel: "warn",
      vite: {
        plugins: [
          {
            name: "site-images-cms-fixture",
            enforce: "pre",
            load(id) {
              if (id.replaceAll("\\", "/").endsWith("/src/data/site.json"))
                return JSON.stringify(fixture);
            },
          },
        ],
      },
    });
    const server = await preview({
      root: fileURLToPath(root),
      outDir: fileURLToPath(outDir),
      server: { host: "127.0.0.1", port: 0 },
    });
    try {
      const browser = await chromium.launch();
      try {
        for (const viewport of [
          { name: "desktop", width: 1440, height: 900 },
          { name: "mobile", width: 375, height: 812 },
        ]) {
          for (const [name, path] of [
            ["home", "/"],
            ["zh-home", "/zh/"],
            ["about", "/about/"],
            ["zh-about", "/zh/about/"],
          ]) {
            const page = await browser.newPage({
              viewport: { width: viewport.width, height: viewport.height },
              isMobile: viewport.name === "mobile",
              hasTouch: viewport.name === "mobile",
            });
            const errors: string[] = [];
            page.on("pageerror", (error) => errors.push(error.message));
            assert(
              (await page.goto("http://127.0.0.1:" + server.port + path))?.ok(),
            );
            await page.evaluate(() => document.fonts.ready.then(() => true));
            evidence.push({
              viewport: viewport.width,
              ...(await inspectSiteImages(page, true)),
            });
            await page.evaluate(async () => {
              await Promise.all(
                [...document.images].map(async (img) => {
                  img.loading = "eager";
                  await img.decode();
                }),
              );
            });
            assert.deepEqual(errors, []);
            const filename =
              "images-uploaded-" + name + "-" + viewport.name + ".png";
            await page.screenshot({
              fullPage: true,
              path: fileURLToPath(new URL(filename, destination)),
            });
            console.log("docs/reviews/M7b/" + filename);
            await page.close();
          }
        }
        // 产品详情沿用全站默认分享图；本轮保持既有页面行为。
        const page = await browser.newPage();
        await page.goto(
          "http://127.0.0.1:" +
            server.port +
            "/products/tulip-shaped-baking-cups/greaseproof-tulip-baking-cups/",
        );
        const productOg = await page
          .locator('meta[property="og:image"]')
          .getAttribute("content");
        assert(productOg && productOg.includes("m7b-test-hero"));
        await page.close();
      } finally {
        await browser.close();
      }
    } finally {
      const closed = server.closed();
      await server.stop();
      await closed;
    }
    await writeFile(
      new URL("images-browser.json", destination),
      JSON.stringify(
        {
          fields,
          checks:
            "Default and uploaded images; bilingual alt fallback; gallery order; intrinsic sizes; WebP; eager/lazy; OG 1200x630; Organization logo; product page default OG; no 375px overflow",
          evidence,
        },
        null,
        2,
      ) + "\n",
    );
  } finally {
    for (const file of created) await unlink(file);
    assert.equal(
      await readFile(sitePath, "utf8"),
      original,
      "正式网站设置必须逐字节保持不变",
    );
  }
}
