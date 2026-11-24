import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { preview } from "astro";
import { chromium } from "playwright";
import { installTurnstileFixture } from "./inquiry-browser-fixture.ts";

const milestone = process.argv[2];
if (
  !milestone ||
  !/^M\d+(?:[a-z]|\.\d+)?$/.test(milestone) ||
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

const previewAddress =
  milestone === "M9.1"
    ? process.env.M9_PREVIEW_URL
    : process.env[`${milestone}_PREVIEW_URL`];
const externalPreview = previewAddress ? new URL(previewAddress) : undefined;
if (
  externalPreview &&
  (!["M9", "M9.1", "M10", "M11", "M12", "M13", "M14"].includes(milestone) ||
    externalPreview.protocol !== "https:" ||
    !externalPreview.hostname.endsWith(".workers.dev") ||
    externalPreview.username ||
    externalPreview.password)
)
  throw new Error("里程碑的线上截图仅接受 HTTPS Workers 预览地址");
const server = externalPreview
  ? undefined
  : await preview({
      root: fileURLToPath(new URL("../", import.meta.url)),
      server: { host: "127.0.0.1", port: 0 },
    });
try {
  const origin = externalPreview?.origin ?? `http://127.0.0.1:${server!.port}`;
  const routes = pages
    .filter(({ name, milestones }) => {
      if (milestones && !milestones.includes(milestone)) return false;
      if (
        [
          "M6",
          "M7",
          "M7b",
          "M9",
          "M9.1",
          "M10",
          "M11",
          "M12",
          "M13",
          "M14",
        ].includes(milestone)
      )
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
    const m13 =
      milestone === "M13" ? await import("./m13-preview.ts") : undefined;
    await m13?.verifyM13TabletHeader(browser, origin);
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
        if (milestone === "M9") {
          if (new URL(page.url()).origin !== origin)
            throw new Error("M9 页面离开截图源站：" + route.path);
          const layout = await page.evaluate(() => ({
            lang: document.documentElement.lang,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            cards: document.querySelectorAll("[data-product-card]").length,
            sizes: document.querySelectorAll("[data-size-table] tbody tr")
              .length,
          }));
          if (
            layout.overflow ||
            layout.lang !== (route.path.startsWith("/zh/") ? "zh-CN" : "en") ||
            (route.name.includes("detail")
              ? layout.sizes < 2
              : layout.cards < 2)
          )
            throw new Error(
              `M9 页面数据或布局异常：${route.path} ${JSON.stringify(layout)}`,
            );
          console.log(
            JSON.stringify({
              url: page.url(),
              width,
              status: response?.status(),
              ...layout,
            }),
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

        if (milestone === "M9.1") {
          const title = "PET-Coated Round Rolled-Rim Baking Cups";
          const isList = Boolean(route.inquiryProducts?.length);
          const product = page.locator(
            isList ? "[data-inquiry-product]" : "#product-title",
          );
          const layout = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            modelVisible: Boolean(
              document.querySelector(
                "[data-product-model], [data-inquiry-item] [data-inquiry-sku]:not([hidden])",
              ),
            ),
          }));
          if (
            new URL(page.url()).origin !== origin ||
            layout.overflow ||
            layout.modelVisible ||
            (await product.innerText()).trim() !== title ||
            /\[TODO|TODO_/i.test(await page.content())
          )
            throw new Error(
              `M9.1 产品资料或布局异常：${route.path} / ${width}`,
            );
          console.log(
            JSON.stringify({
              url: page.url(),
              width,
              status: response?.status(),
              ...layout,
            }),
          );
        }

        if (milestone === "M10") {
          const gallery = page.locator("[data-product-gallery]");
          const siteImages = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            primary: document
              .querySelector(
                "[data-home-hero], [data-gallery-panel]:not([hidden]) img",
              )
              ?.getAttribute("src"),
            realCards: document.querySelectorAll(
              "[data-product-card] img:not([src*='placeholder'])",
            ).length,
            factory: document.querySelectorAll(
              "[data-about-gallery] img:not([src*='placeholder'])",
            ).length,
          }));
          if (
            new URL(page.url()).origin !== origin ||
            siteImages.overflow ||
            siteImages.primary?.includes("placeholder") ||
            (route.name === "m10-home" &&
              !siteImages.primary?.includes("factory-")) ||
            (route.name === "m10-about" && siteImages.factory < 6) ||
            ((route.name === "m10-products" ||
              route.name.startsWith("m10-category")) &&
              !siteImages.realCards)
          )
            throw new Error(`M10 图片或页面布局异常：${route.path} / ${width}`);
          if (await gallery.count()) {
            const panels = gallery.locator("[data-gallery-panel] img");
            const firstAlt = await panels.first().getAttribute("alt");
            const secondAlt = await panels.nth(1).getAttribute("alt");
            const pictures = await panels.count();
            if (
              pictures < 2 ||
              pictures > 5 ||
              !firstAlt ||
              !secondAlt ||
              firstAlt === secondAlt
            )
              throw new Error("产品图库图片或替代文字无效：" + route.path);
            await gallery.locator("[data-gallery-index='1']").click();
            if (
              !(await panels.nth(1).isVisible()) ||
              (await panels.first().isVisible())
            )
              throw new Error("产品图库未切换：" + route.path);
            await gallery.locator("[data-gallery-index='0']").click();
            await page.evaluate(() => window.scrollTo(0, 0));
          }
          console.log(
            JSON.stringify({
              url: page.url(),
              width,
              status: response?.status(),
              ...siteImages,
            }),
          );
        }

        if (milestone === "M11") {
          const layout = await page.evaluate(() => {
            const logo = document.querySelector("[data-site-logo]");
            const nav = document.querySelector("header > div > nav a");
            const announcement = document.querySelector("[data-top-bar] li");
            const tagline = document.querySelector("[data-site-tagline]");
            return {
              lang: document.documentElement.lang,
              overflow: document.documentElement.scrollWidth > innerWidth + 1,
              logoHeight: logo?.getBoundingClientRect().height,
              footerLogo: Boolean(document.querySelector("[data-footer-logo]")),
              navFont: nav && getComputedStyle(nav).fontSize,
              taglineFont: tagline && getComputedStyle(tagline).fontSize,
              announcementFont:
                announcement && getComputedStyle(announcement).fontSize,
              trustSteps: document.querySelectorAll(
                "[data-production-steps] li",
              ).length,
              trustOptional: document.querySelectorAll(
                "[data-factory-profile], [data-factory-gallery], [data-quality-control], [data-certificates]",
              ).length,
              sizeColumns: document.querySelectorAll(
                "[data-size-table] th[scope=col]",
              ).length,
              lidRows: document.querySelectorAll("[data-lid-table] tbody tr")
                .length,
              colorOptions: document.querySelectorAll(
                "[data-color-options] li span[style]",
              ).length,
              qr: Boolean(document.querySelector("[data-wechat-card] img")),
            };
          });
          if (
            new URL(page.url()).origin !== origin ||
            layout.lang !== (route.path.startsWith("/zh/") ? "zh-CN" : "en") ||
            layout.overflow ||
            !layout.footerLogo ||
            layout.announcementFont !== "13px" ||
            !layout.logoHeight ||
            (isMobile
              ? layout.logoHeight < 40 || layout.logoHeight > 44
              : layout.logoHeight < 56 ||
                layout.logoHeight > 64 ||
                layout.navFont !== "16px" ||
                layout.taglineFont !== "13px") ||
            (["m11-home", "m11-about"].includes(route.name) &&
              (layout.trustSteps !== 6 || layout.trustOptional)) ||
            (route.name.startsWith("m11-shape") &&
              (layout.sizeColumns < 4 || !layout.lidRows)) ||
            (route.name.startsWith("m11-colors") && layout.colorOptions < 6) ||
            (route.name === "m11-contact" && !layout.qr)
          )
            throw new Error(
              `M11 资料或布局验收失败：${route.path} / ${width} ${JSON.stringify(layout)}`,
            );
          if (route.name === "m11-contact") {
            await page.locator("[data-wechat-open]").click();
            await page
              .locator("[data-wechat-dialog][open] [data-wechat-qr]")
              .waitFor({ state: "visible" });
            await page.keyboard.press("Escape");
            await page
              .locator("[data-wechat-dialog][open]")
              .waitFor({ state: "hidden" });
          }
          console.log(
            JSON.stringify({
              url: page.url(),
              width,
              status: response?.status(),
              ...layout,
            }),
          );
        }

        if (milestone === "M12") {
          const details = await page.evaluate(() => ({
            lang: document.documentElement.lang,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            hero: document
              .querySelector("[data-home-hero]")
              ?.getAttribute("src"),
            factory: document.querySelectorAll(
              "[data-about-gallery] img:not([src*='placeholder'])",
            ).length,
            examples: document.querySelectorAll("[data-design-example] img")
              .length,
            steps: document.querySelectorAll(
              "[data-customization-steps] li svg",
            ).length,
            cards: document.querySelectorAll("[data-product-card] img").length,
          }));
          if (
            new URL(page.url()).origin !== origin ||
            details.lang !== (route.path.startsWith("/zh/") ? "zh-CN" : "en") ||
            details.overflow ||
            (route.name === "m12-home" &&
              (!details.hero || details.hero.includes("placeholder"))) ||
            (route.name === "m12-about" && details.factory < 6) ||
            (route.name === "m12-custom" &&
              (details.examples !== 6 || details.steps !== 6)) ||
            (route.name.startsWith("m12-category") && !details.cards)
          ) {
            throw new Error(
              `M12 页面或资料异常：${route.path} / ${width} ${JSON.stringify(details)}`,
            );
          }
          if (route.name.startsWith("m12-detail")) {
            const first = page.locator("[data-gallery-panel]").first();
            const scene = page
              .locator("[data-gallery-panel][data-scene='closeup']")
              .first();
            if (
              (await first.getAttribute("data-scene")) ||
              !(await scene.count())
            )
              throw new Error("M12 缺少独立的产品封面或场景图：" + route.path);
            const index = await scene.evaluate((panel) =>
              Array.from(panel.parentElement!.children).indexOf(panel),
            );
            const toggle = page.locator(`[data-gallery-index='${index}']`);
            await toggle.click();
            if (
              (await first.isVisible()) ||
              !(await scene.isVisible()) ||
              !(await scene.locator("figcaption").innerText()) ||
              (await toggle.getAttribute("aria-pressed")) !== "true"
            )
              throw new Error("M12 场景切换异常：" + route.path);
            await page.evaluate(() => window.scrollTo(0, 0));
          }
          console.log(
            JSON.stringify({
              url: page.url(),
              width,
              status: response?.status(),
              ...details,
            }),
          );
        }

        await m13?.verifyM13Page(page, route.name, width);

        if (milestone === "M14") {
          const gallery = page.locator("[data-product-gallery]");
          const comparison = gallery
            .locator("[data-gallery-panel][data-size-comparison]")
            .first();
          if (
            (await gallery
              .locator("[data-gallery-panel][data-scene]")
              .count()) ||
            !(await comparison.count()) ||
            (await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth + 1,
            ))
          ) {
            throw new Error("M14 产品图库或视口检查失败 " + route.path);
          }
          const index = await comparison.evaluate((panel) =>
            [...panel.parentElement!.children].indexOf(panel),
          );
          await gallery.locator(`[data-gallery-index="${index}"]`).click();
          await comparison.waitFor({ state: "visible" });
          await page.evaluate(() => window.scrollTo(0, 0));
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
  if (server) {
    const closed = server.closed();
    await server.stop();
    await closed;
  }
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
