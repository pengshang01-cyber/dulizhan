import type { Browser, Page } from "playwright";

const pilots: Record<string, { scenes: number; comparisons: number }> = {
  "m13-pet-round": { scenes: 2, comparisons: 2 },
  "m13-greaseproof-round": { scenes: 0, comparisons: 1 },
  "m13-pet-square": { scenes: 2, comparisons: 1 },
  "m13-window-box": { scenes: 2, comparisons: 1 },
  "m13-air-fryer": { scenes: 0, comparisons: 0 },
};

export async function verifyM13TabletHeader(browser: Browser, origin: string) {
  for (const path of ["/", "/zh/"]) {
    const page = await browser.newPage({
      viewport: { width: 1024, height: 900 },
    });
    try {
      const response = await page.goto(new URL(path, origin).href);
      if (!response?.ok()) throw new Error("无法打开 M13 页眉测试页 " + path);
      await page.evaluate(() => document.fonts.ready.then(() => true));
      const layout = await page.evaluate(() => {
        const logo = document.querySelector("[data-site-logo]");
        const nav = document.querySelector("header > div > nav");
        const links = [...(nav?.querySelectorAll("a") ?? [])];
        return {
          logoHeight: logo?.getBoundingClientRect().height,
          navVisible: Boolean(nav?.getClientRects().length),
          links: links.length,
          navFont: links[0] ? getComputedStyle(links[0]).fontSize : null,
          lines: new Set(links.map((link) => link.getBoundingClientRect().top))
            .size,
          singleLineLabels: links.every((link) => {
            const range = document.createRange();
            range.selectNodeContents(link);
            return range.getClientRects().length === 1;
          }),
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
      });
      if (
        layout.logoHeight !== 72 ||
        !layout.navVisible ||
        !layout.links ||
        layout.navFont !== "17px" ||
        layout.lines !== 1 ||
        !layout.singleLineLabels ||
        layout.overflow
      ) {
        throw new Error("1024px 页眉检查失败 " + JSON.stringify(layout));
      }
      console.log(JSON.stringify({ page: path, headerWidth: 1024, ...layout }));
    } finally {
      await page.close();
    }
  }
}

export async function verifyM13Page(page: Page, name: string, width: number) {
  const measurements = await page.evaluate(() => {
    const productMeta = [
      ...document.querySelectorAll('script[type="application/ld+json"]'),
    ]
      .map((script) => JSON.parse(script.textContent || "{}"))
      .find((data) => data["@type"] === "Product");
    return {
      logoHeight: document
        .querySelector("[data-site-logo]")
        ?.getBoundingClientRect().height,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      tagline: Boolean(document.querySelector("[data-site-tagline]")),
      productMetaImage: productMeta?.image ?? [],
    };
  });
  if (
    measurements.logoHeight !== (width === 375 ? 48 : 72) ||
    measurements.overflow ||
    (width !== 375 && measurements.tagline)
  )
    throw new Error("M13 页眉或页面宽度检查失败 " + name);

  const pilot = pilots[name];
  if (pilot) {
    const gallery = page.locator("[data-product-gallery]");
    const panel = gallery.locator("[data-gallery-panel]");
    const first = panel.first();
    const scenes = gallery.locator("[data-gallery-panel][data-scene]");
    const comparisons = gallery.locator(
      "[data-gallery-panel][data-size-comparison]",
    );
    if (
      !(await first.isVisible()) ||
      (await first.getAttribute("data-scene")) !== null ||
      (await first.getAttribute("data-size-comparison")) !== null ||
      (await scenes.count()) !== pilot.scenes ||
      (await comparisons.count()) !== pilot.comparisons ||
      measurements.productMetaImage.some((url: string) =>
        /-(?:size-comparison|scene-0[12])\./.test(url),
      )
    ) {
      throw new Error(
        "M13 图库主图、辅图数量或 Product 结构化数据不符 " + name,
      );
    }
    const selected = pilot.scenes
      ? gallery.locator("[data-gallery-panel][data-scene=closeup]")
      : comparisons.first();
    if (await selected.count()) {
      const index = await selected.evaluate((item) =>
        Array.from(item.parentElement!.children).indexOf(item),
      );
      const button = gallery.locator(`[data-gallery-index="${index}"]`);
      await button.click();
      const caption = await selected.locator("figcaption").innerText();
      const visibleLabel = pilot.scenes
        ? /Illustrative image|效果示意图/
        : /Size comparison|尺寸对比图/;
      if (
        !(await selected.isVisible()) ||
        (await button.getAttribute("aria-pressed")) !== "true" ||
        !visibleLabel.test(caption)
      ) {
        throw new Error("M13 图库切换或图注失败 " + name);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
    }
  }

  if (name === "m13-carton" || name === "m13-pet-round") {
    const text = await page.locator("[data-package-table]").innerText();
    if (!/[\d.]+ × [\d.]+ × [\d.]+ cm\b/.test(text)) {
      throw new Error("M13 外箱单位缺少 cm " + name);
    }
    if (!/\d\s*kg\b/.test(text)) {
      throw new Error("M13 箱重单位缺少 kg " + name);
    }
  }
  console.log(
    JSON.stringify({
      page: page.url(),
      width,
      logoHeight: measurements.logoHeight,
      overflow: false,
      ...pilot,
    }),
  );
}
