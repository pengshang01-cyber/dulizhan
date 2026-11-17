import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { preview } from "astro";
import { chromium } from "playwright";
import { installTurnstileFixture } from "./inquiry-browser-fixture.ts";

// 无参数使用本地替身；传入预览 HTTPS 地址时使用真实 Cloudflare 脚本和站点原有 key。
const remote = process.argv[2];
if (remote && new URL(remote).protocol !== "https:")
  throw new Error("预览必须使用 HTTPS");
const destination = new URL("../docs/reviews/fix-turnstile/", import.meta.url);
await mkdir(destination, { recursive: true });
const server = remote
  ? undefined
  : await preview({ server: { host: "127.0.0.1", port: 0 } });
const origin = remote ?? "http://127.0.0.1:" + server!.port;
const browser = await chromium.launch(
  remote
    ? { channel: "chrome", headless: process.env.TURNSTILE_HEADED !== "1" }
    : {},
);
const records = [];
try {
  for (const path of [
    "/contact/",
    "/zh/contact/",
    "/products/tulip-baking-cups/sample-tulip-cup/",
    "/zh/products/tulip-baking-cups/sample-tulip-cup/",
  ]) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    const errors: string[] = [];
    const apiRequests: string[] = [];
    let submissions = 0;
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && /turnstile/i.test(message.text()))
        errors.push(message.text());
    });
    page.on("request", (request) => {
      if (request.url().includes("/turnstile/v0/api.js"))
        apiRequests.push(request.url());
    });
    // 只验证 widget 与 token；即使误触提交也禁止真实询盘请求发出。
    await page.route("**/api/inquiry", (route) => {
      submissions++;
      return route.abort();
    });
    if (!remote) {
      await installTurnstileFixture(page);
      if (path === "/contact/") {
        let attempt = 0;
        await page.route(
          "https://challenges.cloudflare.com/turnstile/v0/api.js*",
          (route) => (++attempt === 1 ? route.abort() : route.fallback()),
        );
      }
    }
    assert((await page.goto(new URL(path, origin).href))?.ok());
    await page.locator("[data-inquiry-form]").scrollIntoViewIfNeeded();
    await page.locator("[data-turnstile-widget]").scrollIntoViewIfNeeded();
    if (!remote && path === "/contact/") {
      const retry = page.locator("[data-turnstile-retry]");
      await retry.waitFor({ state: "visible" });
      await retry.click();
    }
    try {
      await page.waitForFunction(
        () =>
          /Security check complete|安全验证已完成/.test(
            document.querySelector("[data-turnstile-status]")?.textContent ??
              "",
          ),
        undefined,
        { timeout: remote ? 45000 : 10000 },
      );
      assert(
        apiRequests.every(
          (url) =>
            new URL(url).searchParams.get("onload") ===
            "onInquiryTurnstileLoad",
        ),
      );
      const tokenLength = await page.evaluate(() => {
        const api = window.turnstile as unknown as {
          getResponse: () => string;
        };
        return api?.getResponse()?.length ?? 0;
      });
      assert(tokenLength > 0);
      assert.equal(submissions, 0);
      assert.deepEqual(errors, []);
      if (!remote) {
        const readyError = await page.evaluate(() => {
          try {
            (
              window.turnstile as unknown as { ready: (fn: () => void) => void }
            ).ready(() => undefined);
            return "";
          } catch (error) {
            return String(error);
          }
        });
        assert(
          readyError.includes(
            "TurnstileError: [Cloudflare Turnstile] Remove async/defer",
          ),
        );
      }
      const widgetBox = await page
        .locator("[data-turnstile-widget]")
        .boundingBox();
      assert(widgetBox && widgetBox.height > 0);
      const slug = path
        .replace(/^\//, "")
        .replaceAll("/", "-")
        .replace(/-$/, "");
      const filename = (remote ? "live-" : "fixture-") + slug + ".png";
      await page
        .locator("[data-turnstile-widget]")
        .screenshot({ path: fileURLToPath(new URL(filename, destination)) });
      records.push({
        url: page.url(),
        mode: remote ? "real Cloudflare / Chrome" : "strict fixture",
        tokenGenerated: true,
        tokenLength,
        widgetBox,
        apiRequests,
        errors,
        submissions,
        screenshot: filename,
      });
    } catch (error) {
      console.error(
        JSON.stringify({
          url: page.url(),
          errors,
          apiRequests,
          status: await page.locator("[data-turnstile-status]").innerText(),
          siteKeyConfigured: Boolean(
            await page
              .locator("[data-inquiry-form]")
              .getAttribute("data-site-key"),
          ),
          submissions,
        }),
      );
      await page.screenshot({
        path: fileURLToPath(
          new URL(
            remote ? "live-failure.png" : "fixture-failure.png",
            destination,
          ),
        ),
        fullPage: true,
      });
      throw error;
    } finally {
      await page.close();
    }
  }
  await writeFile(
    new URL(remote ? "live.json" : "fixture.json", destination),
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        browserVersion: browser.version(),
        records,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    JSON.stringify(
      records.map(({ url, mode, tokenGenerated, errors, submissions }) => ({
        url,
        mode,
        tokenGenerated,
        errors,
        submissions,
      })),
    ),
  );
} finally {
  await browser.close();
  if (server) {
    const closed = server.closed();
    await server.stop();
    await closed;
  }
}
