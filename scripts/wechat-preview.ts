import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build, preview } from "astro";
import { chromium } from "playwright";

// 仅在独立截图构建的内存中替换资料，生产 JSON 和默认 dist 始终保持原值。
export async function captureWechatPreview(
  destination: URL,
  milestone = "M4b",
) {
  const root = new URL("../", import.meta.url);
  const outDir = new URL("../.astro/wechat-preview/", import.meta.url);
  const rawSite = JSON.parse(
    await readFile(new URL("src/data/site.json", root), "utf8"),
  );
  const fixture = {
    ...rawSite,
    wechatId: "PREVIEW_ONLY_NOT_A_WECHAT_ID",
    wechatQr: "../assets/images/site/wechat-qr-placeholder.png",
  };
  await build({
    root: fileURLToPath(root),
    outDir: fileURLToPath(outDir),
    logLevel: "warn",
    vite: {
      plugins: [
        {
          name: "wechat-screenshot-fixture",
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
  const browser = await chromium.launch();
  try {
    for (const viewport of [
      { name: "desktop", width: 1440, height: 900 },
      { name: "mobile", width: 375, height: 812 },
    ]) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: viewport.name === "mobile",
        hasTouch: viewport.name === "mobile",
      });
      await page.goto(
        `http://127.0.0.1:${server.port}/${milestone === "M4c" ? "zh/" : ""}contact/`,
      );
      const card = page.locator("[data-wechat-card]");
      await card.waitFor({ state: "visible" });
      if (!(await card.innerText()).includes(fixture.wechatId))
        throw new Error("微信截图没有使用明确测试资料");
      if ((await card.locator("img").count()) !== 1)
        throw new Error("微信二维码占位图未渲染");
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          [...document.images].map(async (img) => {
            img.loading = "eager";
            await img.decode();
          }),
        );
      });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      if (overflow) throw new Error("微信截图页面横向溢出");
      const filename = `${milestone === "M4c" ? "zh-" : ""}contact-wechat-preview-${viewport.name}.png`;
      await page.screenshot({
        fullPage: true,
        path: fileURLToPath(new URL(filename, destination)),
      });
      console.log(`docs/reviews/${milestone}/${filename}`);
      if (milestone === "M4c") {
        await page.locator("[data-wechat-open]").click();
        await page
          .locator("dialog[data-wechat-dialog]")
          .waitFor({ state: "visible" });
        const dialogFile = `zh-wechat-dialog-${viewport.name}.png`;
        await page.screenshot({
          path: fileURLToPath(new URL(dialogFile, destination)),
        });
        console.log(`docs/reviews/${milestone}/${dialogFile}`);
      }
      await page.close();
    }
  } finally {
    await browser.close();
    const closed = server.closed();
    await server.stop();
    await closed;
  }
}
