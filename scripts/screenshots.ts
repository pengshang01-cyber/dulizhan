import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { preview } from "astro";
import { chromium } from "playwright";
import { installTurnstileFixture } from "./inquiry-browser-fixture.ts";

const milestone = process.argv[2];
if (
  !milestone ||
  !/^M\d+[a-z]?$/.test(milestone) ||
  process.argv.length !== 3
) {
  throw new Error("用法：npm run screenshots -- M0（或 M1b 等补充里程碑）");
}

const pages: {
  name: string;
  path: string;
  inquiryProducts?: string[];
  inquiryQuantities?: Record<string, string>;
  milestones?: string[];
  formState?: "validation" | "unavailable";
  cookie?: "banner" | "rejected";
}[] = JSON.parse(
  await readFile(new URL("./pages.json", import.meta.url), "utf8"),
);
const destination = new URL(`../docs/reviews/${milestone}/`, import.meta.url);
const sizes = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "mobile", width: 375, height: 812, isMobile: true },
];
const m5Pages = new Set([
  "contact",
  "contact-inquiry",
  "zh-contact",
  "zh-contact-inquiry",
  "product-detail",
  "zh-home",
  "zh-custom",
  "zh-about",
]);
const headingPages = new Set([
  "zh-home",
  "zh-custom",
  "zh-about",
  "zh-contact",
]);

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
  const routes = pages
    .filter(({ name, milestones }) => {
      if (milestones && !milestones.includes(milestone)) return false;
      if (["M6", "M7", "M7b"].includes(milestone))
        return Boolean(milestones?.includes(milestone));
      if (milestone === "M5") {
        return m5Pages.has(name) || milestones?.includes("M5");
      }
      return milestone !== "M4c" || name === "home" || name.startsWith("zh-");
    })
    .map(
      ({
        name,
        path,
        inquiryProducts,
        inquiryQuantities,
        formState,
        cookie,
      }) => {
        const url = new URL(path, origin);
        if (
          !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) ||
          !path.startsWith("/") ||
          url.origin !== origin ||
          (inquiryProducts &&
            !inquiryProducts.every((slug) =>
              /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
            )) ||
          (formState && !["validation", "unavailable"].includes(formState)) ||
          (inquiryQuantities &&
            !Object.entries(inquiryQuantities).every(
              ([slug, value]) =>
                inquiryProducts?.includes(slug) && typeof value === "string",
            ))
        ) {
          throw new Error(`scripts/pages.json 中的截图配置无效：${name}`);
        }
        return {
          name,
          path,
          url: url.href,
          inquiryProducts,
          inquiryQuantities,
          formState,
          cookie,
        };
      },
    );
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
        if (milestone === "M5" || milestone === "M6")
          await installTurnstileFixture(page);
        if (route.cookie === "rejected")
          await page.addInitScript(() => {
            try {
              localStorage.setItem("analytics-consent:v1", "rejected");
            } catch {
              /* 存储不可用时仍默认拒绝。 */
            }
          });
        if (route.formState === "unavailable") {
          await page.route("**/api/inquiry", (request) =>
            request.fulfill({
              status: 503,
              contentType: "application/json",
              body: JSON.stringify({ ok: false, code: "unavailable" }),
            }),
          );
        }
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
        if (route.inquiryQuantities) {
          await page.goto(origin + "/inquiry/");
          for (const [slug, quantity] of Object.entries(
            route.inquiryQuantities,
          )) {
            const input = page.locator(
              `[data-inquiry-item][data-slug="${slug}"] [data-inquiry-quantity]`,
            );
            await input.fill(quantity);
            await input.blur();
            if ((await input.getAttribute("aria-invalid")) !== "false") {
              throw new Error(`截图数量无效：${route.name} / ${slug}`);
            }
          }
        }
        const response = await page.goto(route.url);
        if (
          !response?.ok() &&
          !(route.path.endsWith("/404.html") && response?.status() === 404)
        ) {
          throw new Error(
            `无法截取 ${route.path}（${response?.status() ?? "无响应"}）`,
          );
        }

        if (
          milestone === "M7" &&
          (await page
            .locator(
              "[data-cookie-consent], [data-cookie-settings], [data-analytics-script]",
            )
            .count())
        ) {
          throw new Error(
            "GA 未配置时仍显示 Cookie 设置或加载统计：" + route.path,
          );
        }

        if (route.cookie === "banner")
          await page
            .locator("[data-cookie-consent]")
            .waitFor({ state: "visible" });
        if (
          /^\/(?:zh\/)?inquiry\/$/.test(new URL(route.url).pathname) &&
          route.inquiryProducts?.length
        ) {
          await page.waitForFunction(
            (count) =>
              document.querySelectorAll("[data-inquiry-item]").length === count,
            route.inquiryProducts.length,
          );
        }
        if (new URL(route.url).searchParams.get("from") === "inquiry") {
          await page
            .locator("[data-inquiry-summary], [data-form-products]")
            .waitFor({ state: "visible" });
          if (route.inquiryProducts?.length) {
            await page.waitForFunction(
              (count) =>
                document.querySelectorAll(
                  "[data-inquiry-summary-items] > li, [data-form-products-list] > li",
                ).length === count,
              route.inquiryProducts.length,
            );
          }
        }

        if (
          ["M5", "M6", "M7", "M7b"].includes(milestone) &&
          (await page.locator("[data-inquiry-form]").count())
        ) {
          await page.locator("[data-inquiry-form]").scrollIntoViewIfNeeded();
          await page
            .locator("[data-inquiry-form] [data-test-turnstile]")
            .waitFor();
        }
        if (route.formState) {
          const form = page.locator("[data-inquiry-form]");
          await form.locator("[data-test-turnstile]").waitFor();
          if (route.formState === "unavailable") {
            const chinese = route.path.startsWith("/zh/");
            await form
              .locator('[name="name"]')
              .fill(chinese ? "测试采购员" : "Test Buyer");
            await form.locator('[name="email"]').fill("buyer@example.com");
            await form
              .locator('[name="company"]')
              .fill(chinese ? "测试采购团队" : "Test purchasing team");
            await form
              .locator('[name="country"]')
              .selectOption(chinese ? "CN" : "US");
            await form
              .locator('[name="message"]')
              .fill(
                chinese
                  ? "这是一条截图测试询盘，请提供纸杯的批发报价与样品信息。"
                  : "Screenshot test inquiry: please share wholesale pricing and sample information for these baking cups.",
              );
          }
          await form.locator("[data-form-submit]").click();
          if (route.formState === "validation") {
            await form
              .locator('[data-field-error="name"]')
              .waitFor({ state: "visible" });
          } else {
            await form
              .locator("[data-form-error]")
              .waitFor({ state: "visible" });
          }
        }

        if (milestone === "M7b") {
          const { inspectSiteImages } =
            await import("./site-images-preview.ts");
          await inspectSiteImages(page, false);
        }
        await page.evaluate(() => document.fonts.ready.then(() => true));
        // 整页截图前加载并解码折叠区和首屏外的图片，避免懒加载留下空白。
        await page.evaluate(async () => {
          await Promise.all(
            [...document.images].map(async (img) => {
              img.loading = "eager";
              await img.decode();
            }),
          );
        });

        if (
          ["M5", "M6", "M7", "M7b"].includes(milestone) &&
          (await page.evaluate(
            () => document.documentElement.scrollWidth > window.innerWidth,
          ))
        ) {
          throw new Error(`截图页面横向溢出：${route.path} / ${width}`);
        }

        if (["M5", "M6", "M7", "M7b"].includes(milestone)) {
          await page.evaluate(() => window.scrollTo(0, 0));
        }
        const filename = `${route.name}-${size}.png`;
        await page.screenshot({
          fullPage: true,
          path: fileURLToPath(new URL(filename, destination)),
        });
        console.log(`docs/reviews/${milestone}/${filename}`);
        if (milestone === "M5" && route.name === "product-detail") {
          const formFile = `product-detail-form-${size}.png`;
          await page.locator("[data-inquiry-form]").screenshot({
            path: fileURLToPath(new URL(formFile, destination)),
            // 仅局部细节图暂隐吸顶页头，避免长表单截图中部被页头遮挡。
            style: "header { visibility: hidden !important; }",
          });
          console.log(`docs/reviews/${milestone}/${formFile}`);
        }
        if (milestone === "M6" && route.name.endsWith("contact-privacy")) {
          const form = page.locator("[data-inquiry-form]");
          await form.screenshot({
            path: fileURLToPath(
              new URL(`${route.name}-form-${size}.png`, destination),
            ),
            style: "header { visibility: hidden !important; }",
          });
        }
        await page.close();
      }
    }
    if (milestone === "M5") {
      const evidence = [];
      for (const viewport of [
        { name: "desktop", width: 1440, height: 900 },
        { name: "tablet", width: 1024, height: 900 },
        { name: "mobile", width: 375, height: 812 },
      ]) {
        for (const route of routes.filter(({ name }) =>
          headingPages.has(name),
        )) {
          const page = await browser.newPage({
            viewport: { width: viewport.width, height: viewport.height },
          });
          await installTurnstileFixture(page);
          await page.goto(route.url);
          await page.evaluate(() => document.fonts.ready.then(() => true));
          const result = await page.locator("main h1").evaluate((heading) => {
            const phrases = [
              ...heading.querySelectorAll(".display-heading-phrase"),
            ];
            const blocks = phrases.length ? phrases : [heading];
            return {
              fontSize: getComputedStyle(heading).fontSize,
              overflow:
                document.documentElement.scrollWidth > window.innerWidth,
              phrases: blocks.map((block) => {
                const lines: { top: number; text: string; hanCount: number }[] =
                  [];
                const walker = document.createTreeWalker(
                  block,
                  NodeFilter.SHOW_TEXT,
                );
                let textNode = walker.nextNode();
                while (textNode) {
                  const text = textNode.textContent ?? "";
                  for (let i = 0; i < text.length; i++) {
                    if (!text[i].trim()) continue;
                    const range = document.createRange();
                    range.setStart(textNode, i);
                    range.setEnd(textNode, i + 1);
                    const { top } = range.getBoundingClientRect();
                    let line = lines.find(
                      (item) => Math.abs(item.top - top) < 1,
                    );
                    if (!line) {
                      line = { top, text: "", hanCount: 0 };
                      lines.push(line);
                    }
                    line.text += text[i];
                    if (/\p{Script=Han}/u.test(text[i])) line.hanCount++;
                  }
                  textNode = walker.nextNode();
                }
                return { text: block.textContent?.trim(), lines };
              }),
            };
          });
          evidence.push({ path: route.path, width: viewport.width, ...result });
          if (
            result.overflow ||
            result.phrases.some(({ lines }) =>
              lines.some(({ hanCount }) => hanCount === 1),
            )
          ) {
            throw new Error(
              `中文标题存在溢出或单字行：${route.path} / ${viewport.width}`,
            );
          }
          const filename = `${route.name}-heading-${viewport.name}.png`;
          await page.locator("main h1").screenshot({
            path: fileURLToPath(new URL(filename, destination)),
          });
          console.log(`docs/reviews/${milestone}/${filename}`);
          await page.close();
        }
      }
      await writeFile(
        new URL("title-layout.json", destination),
        JSON.stringify(evidence, null, 2) + "\n",
      );
    }
  } finally {
    await browser.close();
  }
} finally {
  const closed = server.closed();
  await server.stop();
  await closed;
}

if (milestone === "M4b" || milestone === "M4c") {
  const { captureWechatPreview } = await import("./wechat-preview.ts");
  await captureWechatPreview(destination, milestone);
}

if (milestone === "M6") {
  const { verifySeoBrowser } = await import("./seo-browser-qa.ts");
  await verifySeoBrowser(destination);
}

if (milestone === "M7") {
  const { verifyBlogPreview } = await import("./blog-preview.ts");
  await verifyBlogPreview(destination);
  const { verifySeoBrowser } = await import("./seo-browser-qa.ts");
  await verifySeoBrowser(destination);
}

if (milestone === "M7b") {
  const { captureSiteImagesPreview } = await import("./site-images-preview.ts");
  await captureSiteImagesPreview(destination);
}
