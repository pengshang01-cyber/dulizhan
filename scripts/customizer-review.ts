import { join } from "node:path";
import type { Browser, Page } from "playwright";
import { CUP } from "../src/lib/blank-design.ts";

export async function openStudio(
  page: Page,
  origin: string,
  locale: "en" | "zh",
) {
  const url =
    origin +
    (locale === "zh" ? "/zh" : "") +
    "/products/rolled-rim-baking-cups/" +
    CUP +
    "/";
  const response = await page.goto(url, { waitUntil: "domcontentloaded" });
  if (response?.status() !== 200)
    throw Error("产品页 HTTP " + response?.status());
  await page.locator("[data-customize-5039]").first().click();
  await page.waitForSelector('#cup-customizer[data-model-state="ready"]', {
    timeout: 45_000,
  });
  return page.locator("#cup-customizer");
}
export async function captureCustomizer(
  browser: Browser,
  origin: string,
  out: string,
) {
  const states = [
    ["single", "wall", false],
    ["wrap", "wrap", false],
    ["diagonal", "diagonal", false],
    ["comp-off", "wrap", false],
    ["comp-on", "wrap", true],
  ] as const;
  for (const mobile of [false, true]) {
    const size = mobile ? "mobile" : "desktop",
      viewport = mobile
        ? { width: 375, height: 812 }
        : { width: 1440, height: 900 };
    const page = await browser.newPage({
      viewport,
      isMobile: mobile,
      hasTouch: mobile,
    });
    const errors: string[] = [];
    page.on("pageerror", (e) => {
      if (!/turnstile|challenge-platform/i.test(e.message))
        errors.push(e.message);
    });
    page.on("console", (m) => {
      if (
        m.type() === "error" &&
        /shader error|VALIDATE_STATUS/i.test(m.text())
      )
        errors.push(m.text());
    });
    try {
      const dialog = await openStudio(page, origin, mobile ? "zh" : "en");
      await dialog.locator("[data-sample]").click();
      await page.waitForFunction(
        () => document.querySelector('[data-name="logo"]')?.textContent,
      );
      for (const [name, layout, comp] of states) {
        await dialog.locator('[data-key="layout"]').selectOption(layout);
        await dialog
          .locator('[data-key="widthMm"]')
          .fill(name.startsWith("comp-") ? "32" : "28");
        await dialog.locator('[data-key="widthMm"]').press("Tab");
        await dialog.locator('[data-key="compensate"]').setChecked(comp);
        await dialog.evaluate((e) => {
          e.scrollTop = 0;
          const c = e.querySelector(".controls");
          if (c) c.scrollTop = 0;
        });
        await page.evaluate(
          () =>
            new Promise<void>((resolve) =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() => resolve()),
              ),
            ),
        );
        if (await dialog.evaluate((e) => e.scrollWidth > innerWidth + 1))
          throw Error("定制器横向溢出");
        await page.screenshot({
          path: join(out, name + "-" + size + ".png"),
          animations: "disabled",
        });
      }
      if (errors.length) throw Error(errors.join("\n"));
      console.log(
        mobile ? "中文 375px" : "英文 1440px",
        origin,
        "5 个定制状态通过",
      );
    } finally {
      await page.close();
    }
  }
}
