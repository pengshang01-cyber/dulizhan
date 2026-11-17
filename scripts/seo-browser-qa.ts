import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build, preview } from "astro";
import { chromium, type Page } from "playwright";
import { installTurnstileFixture } from "./inquiry-browser-fixture.ts";

// 使用独立内存资料构建，不修改 site.json；所有 Google 请求均在浏览器中拦截。
export async function verifySeoBrowser(destination: URL) {
  const root = new URL("../", import.meta.url);
  const outDir = new URL("../.astro/m6-analytics-fixture/", import.meta.url);
  const original = await readFile(new URL("src/data/site.json", root), "utf8");
  const fixture = {
    ...JSON.parse(original),
    analytics: { gaMeasurementId: "G-TEST123" },
    email: "test@example.test",
    phone: "+10000000000",
    whatsappNumber: "+10000000000",
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
          name: "m6-analytics-fixture",
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
  const origin = `http://127.0.0.1:${server.port}`;
  const browser = await chromium.launch();
  const results: Record<string, unknown>[] = [];
  try {
    for (const locale of ["en", "zh"] as const) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const requests: string[] = [];
      const events: unknown[][] = [];
      const path = locale === "zh" ? "/zh" : "";
      const dictionary = JSON.parse(
        await readFile(new URL(`src/i18n/${locale}.json`, root), "utf8"),
      );
      await interceptGoogle(page, requests, events);
      await installTurnstileFixture(page);
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: { writeText: async () => {} },
        });
        // 保留点击冒泡及真实组件行为，但不离开本站测试环境。
        document.addEventListener(
          "click",
          (event) => {
            if (
              event.target instanceof Element &&
              event.target.closest("a[data-track]")
            )
              event.preventDefault();
          },
          true,
        );
      });
      await page.goto(origin + path + "/contact/");
      await page.locator("[data-cookie-consent]").waitFor({ state: "visible" });
      assert.equal(requests.length, 0, "同意前存在 Google 请求");
      const styles = await page
        .locator("[data-cookie-choice]")
        .evaluateAll((buttons) =>
          buttons.map((button) => {
            const s = getComputedStyle(button);
            return [
              s.backgroundColor,
              s.color,
              s.fontWeight,
              s.height,
              s.width,
            ];
          }),
        );
      assert.deepEqual(styles[0], styles[1], "接受/拒绝视觉不等同");
      await page.locator('[data-cookie-choice="rejected"]').click();
      await page.locator('[data-track="quote_button_click"]').first().click();
      assert.equal(requests.length, 0, "拒绝后存在 Google 请求");
      await page.locator("footer [data-cookie-settings]").click();
      await page.locator('[data-cookie-choice="accepted"]').click();
      await page.waitForFunction(() =>
        Boolean(
          (window as unknown as { __m6GoogleStub?: boolean }).__m6GoogleStub,
        ),
      );
      assert.equal(requests.length, 1);
      for (const event of [
        "email_click",
        "phone_click",
        "whatsapp_click",
        "quote_button_click",
      ])
        await page.locator(`[data-track="${event}"]`).first().click();
      if (locale === "zh") {
        await page.locator("[data-wechat-open]").click();
        await page.locator("[data-wechat-copy]").click();
        await page
          .locator("[data-wechat-status]")
          .filter({ hasText: dictionary["wechat.copied"] })
          .waitFor();
        await page.keyboard.press("Escape");
      }
      await page.goto(origin + path + "/products/");
      const add = page.locator("[data-inquiry-slug]").first();
      await add.click();
      await page.waitForFunction(
        () =>
          document
            .querySelector("[data-inquiry-slug]")
            ?.getAttribute("aria-pressed") === "true",
      );
      await page.waitForFunction(() =>
        Boolean(
          (window as unknown as { __m6GoogleStub?: boolean }).__m6GoogleStub,
        ),
      );
      const added = events.filter(
        (entry) => entry[1] === "add_to_inquiry",
      ).length;
      assert.equal(added, 1);
      await add.click();
      assert.equal(
        events.filter((entry) => entry[1] === "add_to_inquiry").length,
        added,
      );
      await add.click();
      let sendSuccess = false;
      await page.route("**/api/inquiry", (route) =>
        route.fulfill({
          status: sendSuccess ? 200 : 503,
          contentType: "application/json",
          body: JSON.stringify(
            sendSuccess ? { ok: true } : { ok: false, code: "unavailable" },
          ),
        }),
      );
      await page.goto(
        origin + path + "/contact/?from=inquiry&utm_source=m6-test",
      );
      const form = page.locator("[data-inquiry-form]");
      await form.locator("[data-form-submit]").click();
      await form
        .locator('[data-field-error="name"]')
        .waitFor({ state: "visible" });
      assert.equal(
        events.filter((entry) => entry[1] === "generate_lead").length,
        0,
      );
      await form.locator('[name="name"]').fill("M6 Test Buyer");
      await form.locator('[name="email"]').fill("buyer@example.test");
      await form
        .locator('[name="country"]')
        .selectOption(locale === "zh" ? "CN" : "US");
      await form
        .locator('[name="message"]')
        .fill(
          "M6 browser event verification; no real inquiry or email is sent.",
        );
      await page.waitForFunction(
        (ready) =>
          document.querySelector("[data-turnstile-status]")?.textContent ===
          ready,
        dictionary["form.verifyReady"],
      );
      await form.locator("[data-form-submit]").click();
      await form.locator("[data-form-error]").waitFor({ state: "visible" });
      assert.equal(
        events.filter((entry) => entry[1] === "generate_lead").length,
        0,
      );
      sendSuccess = true;
      await page.waitForFunction(
        (ready) =>
          document.querySelector("[data-turnstile-status]")?.textContent ===
          ready,
        dictionary["form.verifyReady"],
      );
      await form.locator("[data-form-submit]").click();
      await page.waitForURL("**/thank-you/");
      assert.equal(
        events.filter((entry) => entry[1] === "generate_lead").length,
        1,
      );
      const captured = events.filter((entry) => entry[0] === "event");
      for (const event of captured) {
        assert.equal((event[2] as { language: string }).language, locale);
        assert.ok(!JSON.stringify(event).includes("buyer@example.test"));
        assert.ok(!JSON.stringify(event).includes("M6 Test Buyer"));
      }
      await page.locator("footer [data-cookie-settings]").click();
      await page.locator('[data-cookie-choice="rejected"]').click();
      const before = events.length;
      const requestsBefore = requests.length;
      await page.locator('[data-track="quote_button_click"]').first().click();
      await page.goto(origin + path + "/");
      assert.equal(events.length, before, "撤回后仍采集事件");
      assert.equal(requests.length, requestsBefore, "撤回后仍加载 GA");
      results.push({
        locale,
        passed: true,
        beforeConsentGoogleRequests: 0,
        afterRejectionGoogleRequests: 0,
        acceptedEvents: [...new Set(captured.map((entry) => entry[1]))],
        generateLeadCount: 1,
        rejectionPersists: true,
      });
      await context.close();
    }
    for (const scenario of ["unconfigured", "storage-unavailable"] as const) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const requests: string[] = [];
      await interceptGoogle(page, requests, []);
      if (scenario === "unconfigured") {
        await page.route(origin + "/", async (route) => {
          const response = await route.fetch();
          await route.fulfill({
            response,
            body: (await response.text()).replace(
              'data-ga-id="G-TEST123"',
              'data-ga-id="TODO_GA_MEASUREMENT_ID"',
            ),
          });
        });
        await page.addInitScript(() =>
          localStorage.setItem("analytics-consent:v1", "accepted"),
        );
      } else {
        await page.addInitScript(() =>
          Object.defineProperty(window, "localStorage", {
            get() {
              throw new Error("storage blocked");
            },
          }),
        );
      }
      await page.goto(origin + "/");
      await page.locator("footer [data-cookie-settings]").click();
      await page.locator('[data-cookie-choice="accepted"]').click();
      if (scenario === "storage-unavailable")
        await page
          .locator("[data-cookie-status]")
          .filter({ hasText: "could not save" })
          .waitFor();
      assert.equal(await page.locator("[data-analytics-script]").count(), 0);
      assert.equal(requests.length, 0);
      results.push({ scenario, passed: true, googleRequests: 0 });
      await context.close();
    }
    assert.equal(
      await readFile(new URL("src/data/site.json", root), "utf8"),
      original,
    );
    await writeFile(
      new URL("analytics-browser.json", destination),
      JSON.stringify(
        {
          mode: "isolated fixture; Google scripts and inquiry POST mocked; no external collection or email",
          results,
        },
        null,
        2,
      ) + "\n",
    );
    console.log(
      "M6 browser QA: consent, rejection, revocation, all 8 event mappings, lead success/failure, no ID and storage failure passed.",
    );
  } finally {
    await browser.close();
    const closed = server.closed();
    await server.stop();
    await closed;
  }
}

async function interceptGoogle(
  page: Page,
  requests: string[],
  events: unknown[][],
) {
  await page.exposeFunction("m6Record", (entry: unknown[]) => {
    events.push(entry);
  });
  await page.route(
    /https:\/\/(?:[\w.-]+\.)?(?:googletagmanager|google-analytics)\.com\//,
    async (route) => {
      requests.push(route.request().url());
      if (route.request().url().includes("/gtag/js")) {
        await route.fulfill({
          contentType: "text/javascript",
          body: `const record = entry => { if (Object.prototype.toString.call(entry) !== '[object Arguments]') throw new Error('Expected official gtag arguments format'); window.m6Record(Array.from(entry)); }; const queued = window.dataLayer || []; queued.forEach(record); const push = queued.push.bind(queued); queued.push = function(entry) { record(entry); return push(entry); }; window.__m6GoogleStub = true;`,
        });
      } else await route.fulfill({ status: 204 });
    },
  );
}
