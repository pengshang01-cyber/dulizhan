import { dev } from "astro";
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import {
  parseProductTechnicalSpec,
  verifiedValue,
} from "../../src/lib/product-technical-schema.ts";
import type { ModelStudio } from "../../src/lib/model-studio.ts";
type RenderWindow = Window & { studio?: ModelStudio };

const review = "docs/reviews/M19";
await mkdir(review, { recursive: true });
const server = await dev({
  logLevel: "error",
  server: { host: "127.0.0.1", port: 0 },
});
try {
  const browser = await chromium.launch({
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 1200 },
      deviceScaleFactor: 1,
    });
    page.on("pageerror", (error) => console.error(error.message));
    await page.route("**/__model_studio", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<!DOCTYPE html><style>*{margin:0}canvas{width:100vw;height:100vh;display:block}</style><canvas></canvas>",
      }),
    );
    await page.goto(
      "http://127.0.0.1:" + server.address.port + "/__model_studio",
    );
    await page.evaluate(async (path) => {
      const { createStudio } = await import(path);
      (window as RenderWindow).studio = createStudio(
        document.querySelector("canvas")!,
      );
    }, "/src/lib/model-studio.ts");
    for (const file of (await readdir("data/product-specs")).sort()) {
      if (!file.endsWith(".json") || file === "schema.json") continue;
      const spec = parseProductTechnicalSpec(
        JSON.parse(await readFile("data/product-specs/" + file, "utf8")),
      );
      const id = verifiedValue(spec.photographedVariant);
      if (!spec.modelAppearance || !id) continue;
      const dir = "src/assets/images/products/m19/" + spec.slug;
      await page.evaluate(
        async (url) => {
          await (window as RenderWindow).studio!.load(url);
        },
        "/models/" + spec.slug + "/" + id + ".glb",
      );
      const tiles: Buffer[] = [];
      const directions = [[0, 0, 1], null, [0, 1, 0], [0, -1, 0]];
      for (const [i, direction] of directions.entries()) {
        await page.evaluate(async (dir) => {
          const studio = (window as RenderWindow).studio!;
          if (dir) studio.setView(dir[0]!, dir[1]!, dir[2]!);
          else studio.reset();
          await new Promise(requestAnimationFrame);
          studio.render();
        }, direction);
        const image = await page.locator("canvas").screenshot();
        if (i === 1)
          await sharp(image)
            .webp({ quality: 89 })
            .toFile(dir + "/poster.webp");
        tiles.push(
          await sharp(image)
            .resize(360, 320, { fit: "contain", background: "#f5f2ee" })
            .png()
            .toBuffer(),
        );
      }
      const art =
        "src/assets/images/products/m18/" +
        spec.slug +
        "/technical-" +
        id +
        "-";
      for (const path of [
        dir + "/three-quarter.webp",
        art + "body.png",
        ...(spec.shape === "box" ? [art + "lid.png"] : []),
      ]) {
        tiles.push(
          await sharp(path)
            .resize(360, 320, { fit: "contain", background: "white" })
            .png()
            .toBuffer(),
        );
      }
      const names = [
        "Front",
        "Three-quarter",
        "Top",
        "Underside",
        "Cleaned photograph",
        "Technical views",
        "Lid drawing",
      ];
      const layers: Parameters<ReturnType<typeof sharp>["composite"]>[0] = [];
      for (const [i, input] of tiles.entries()) {
        const left = 12 + (i % 3) * 375,
          top = 42 + Math.floor(i / 3) * 360;
        layers.push(
          { input, left, top: top + 28 },
          {
            input: Buffer.from(
              '<svg width="360" height="27"><text x="5" y="19" font-family="Arial" font-size="17" fill="#50453b">' +
                names[i] +
                "</text></svg>",
            ),
            top,
            left,
          },
        );
      }
      layers.push({
        input: Buffer.from(
          '<svg width="1100" height="35"><text x="15" y="25" font-family="Arial" font-size="22" fill="#36291f">' +
            spec.slug +
            " / " +
            id +
            "</text></svg>",
        ),
        top: 0,
        left: 0,
      });
      const result = await sharp({
        create: {
          width: 1130,
          height: 48 + Math.ceil(tiles.length / 3) * 360,
          channels: 3,
          background: "#faf7f1",
        },
      })
        .composite(layers)
        .jpeg({ quality: 88 })
        .toBuffer();
      await writeFile(review + "/model-check-" + spec.slug + ".jpg", result);
      console.log("Rendered", spec.slug, id);
    }
  } finally {
    await browser.close();
  }
} finally {
  await server.stop();
}
