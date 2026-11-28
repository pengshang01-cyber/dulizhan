import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { CUP } from "../src/lib/blank-design.ts";
import { sheetProfile } from "../src/lib/blank-profile.ts";
import { parseProductTechnicalSpec } from "../src/lib/product-technical-schema.ts";
import { templateSvg } from "./blank-template.ts";
const sheet = sheetProfile(
  parseProductTechnicalSpec(
    JSON.parse(await readFile("data/product-specs/" + CUP + ".json", "utf8")),
  ),
);
const out = "public/product-media/" + CUP + "/";
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
try {
  for (const locale of ["en", "zh"] as const) {
    const svg = templateSvg(sheet, locale),
      stem = out + "5039-blank-" + locale;
    await writeFile(stem + ".svg", svg + "\n");
    const page = await browser.newPage();
    await page.setContent(
      '<html lang="' +
        locale +
        '"><head><meta charset="utf-8"><title>5039 — ' +
        locale +
        "</title><style>@page{size:A4;margin:0}html,body{margin:0}svg{display:block}</style></head><body>" +
        svg +
        "</body></html>",
    );
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
      path: stem + ".pdf",
      preferCSSPageSize: true,
      printBackground: true,
    });
    await page.close();
  }
} finally {
  await browser.close();
}
