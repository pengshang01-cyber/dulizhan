import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const origin = process.argv[2];
if (!origin) throw Error("Pass the Workers preview or local preview origin.");
const entries: { name: string; path: string; milestones?: string[] }[] =
  JSON.parse(await readFile("scripts/pages.json", "utf8"));
const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
try {
  for (const entry of entries.filter((row) =>
    row.milestones?.includes("M19"),
  )) {
    const samples: number[] = [];
    let transfer = 0;
    for (let i = 0; i < 3; i++) {
      const ctx = await browser.newContext({
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 2,
        hasTouch: true,
        isMobile: true,
      });
      try {
        const page = await ctx.newPage(),
          cdp = await ctx.newCDPSession(page);
        await cdp.send("Network.enable");
        await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
        await cdp.send("Network.emulateNetworkConditions", {
          offline: false,
          latency: 80,
          downloadThroughput: 500000,
          uploadThroughput: 125000,
          connectionType: "cellular4g",
        });
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
        const response = await page.goto(new URL(entry.path, origin).href, {
          waitUntil: "domcontentloaded",
        });
        assert.equal(response?.status(), 200);
        const start = page.locator("[data-model-start]");
        await start.scrollIntoViewIfNeeded();
        assert.equal(
          await page.evaluate(
            () =>
              performance
                .getEntriesByType("resource")
                .filter((e) => e.name.endsWith(".glb")).length,
          ),
          0,
        );
        await start.evaluate((button) =>
          button.addEventListener(
            "click",
            () => performance.mark("model-requested"),
            { once: true, capture: true },
          ),
        );
        await start.click();
        await page
          .locator('[data-model-gallery][data-status="ready"]')
          .waitFor({ timeout: 90000 });
        const result = await page.evaluate(async () => {
          await new Promise(requestAnimationFrame);
          await new Promise(requestAnimationFrame);
          const canvas = document.querySelector<HTMLCanvasElement>(
            "[data-model-canvas]",
          )!;
          canvas.getContext("webgl2")!.finish();
          const glb = performance
            .getEntriesByType("resource")
            .filter((e) =>
              e.name.endsWith(".glb"),
            ) as PerformanceResourceTiming[];
          return {
            ms: Math.round(
              performance.now() -
                performance.getEntriesByName("model-requested")[0].startTime,
            ),
            glbs: glb.length,
            bytes: glb[0]?.encodedBodySize,
          };
        });
        assert.equal(result.glbs, 1);
        assert.ok(result.bytes > 0);
        samples.push(result.ms);
        transfer = result.bytes;
      } finally {
        await ctx.close();
      }
    }
    console.log(
      JSON.stringify({
        route: entry.path,
        bytes: transfer,
        ms: samples,
        medianMs: [...samples].sort((a, b) => a - b)[1],
      }),
    );
  }
} finally {
  await browser.close();
}
