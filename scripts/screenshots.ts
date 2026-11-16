import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { preview } from "astro";
import { chromium } from "playwright";

const milestone = process.argv[2];
if (
  !milestone ||
  !/^M\d+[a-z]?$/.test(milestone) ||
  process.argv.length !== 3
) {
  throw new Error("用法：npm run screenshots -- M0（或 M1b 等补充里程碑）");
}

const pages: { name: string; path: string; inquiryProducts?: string[] }[] =
  JSON.parse(await readFile(new URL("./pages.json", import.meta.url), "utf8"));
const destination = new URL(`../docs/reviews/${milestone}/`, import.meta.url);
const sizes = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "mobile", width: 375, height: 812, isMobile: true },
];

if (
  !pages.length ||
  new Set(pages.map(({ name }) => name)).size !== pages.length
) {
  throw new Error(
    "scripts/pages.json 必须包含至少一个页面，且文件名不能重复。",
  );
}

const server = await preview({
  root: fileURLToPath(new URL("../", import.meta.url)),
  server: { host: "127.0.0.1", port: 0 },
});
try {
  const origin = `http://127.0.0.1:${server.port}`;
  const routes = pages.map(({ name, path, inquiryProducts }) => {
    const url = new URL(path, origin);
    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) ||
      !path.startsWith("/") ||
      url.origin !== origin ||
      (inquiryProducts &&
        !inquiryProducts.every((slug) =>
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
        ))
    ) {
      throw new Error(`scripts/pages.json 中的截图配置无效：${name}`);
    }
    return { name, path, url: url.href, inquiryProducts };
  });
  const browser = await chromium.launch();
  try {
    await mkdir(destination, { recursive: true });
    for (const { name: size, width, height, isMobile } of sizes) {
      for (const route of routes) {
        const page = await browser.newPage({
          viewport: { width, height },
          isMobile,
          hasTouch: isMobile,
        });
        if (route.inquiryProducts?.length) {
          await page.goto(origin + "/products/");
          for (const slug of route.inquiryProducts) {
            const button = page.locator(`[data-inquiry-slug="${slug}"]`);
            await button.click();
            await page.waitForFunction(
              (slug) =>
                document
                  .querySelector(`[data-inquiry-slug="${slug}"]`)
                  ?.getAttribute("aria-pressed") === "true",
              slug,
            );
          }
        }
        const response = await page.goto(route.url);
        if (!response?.ok()) {
          throw new Error(
            `无法截取 ${route.path}（${response?.status() ?? "无响应"}）`,
          );
        }

        await page.evaluate(() => document.fonts.ready.then(() => true));

        const filename = `${route.name}-${size}.png`;
        await page.screenshot({
          fullPage: true,
          path: fileURLToPath(new URL(filename, destination)),
        });
        console.log(`docs/reviews/${milestone}/${filename}`);
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
} finally {
  const closed = server.closed();
  await server.stop();
  await closed;
}
