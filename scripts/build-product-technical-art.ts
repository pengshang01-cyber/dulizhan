import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "astro/zod";
import { format, resolveConfig } from "prettier";
import sharp from "sharp";
import { sheetProfile } from "../src/lib/blank-profile.ts";
import { templateSvg } from "./blank-template.ts";
import {
  parseProductTechnicalSpec,
  productTechnicalSchema,
  verifiedValue,
} from "../src/lib/product-technical-schema.ts";
import {
  technicalDrawing,
  unfoldingReference,
} from "./product-technical-drawing.ts";

const records = resolve("data/product-specs");
await mkdir(records, { recursive: true });
const schema = {
  title: "Junbeili product technical data",
  ...z.toJSONSchema(productTechnicalSchema, { reused: "ref" }),
};
const schemaPath = resolve(records, "schema.json");
await writeFile(
  schemaPath,
  await format(JSON.stringify(schema), {
    ...(await resolveConfig(schemaPath)),
    filepath: schemaPath,
  }),
);
for (const filename of (await readdir(records)).sort()) {
  if (filename === "schema.json" || !filename.endsWith(".json")) continue;
  const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
  if (only && filename !== only + ".json") continue;
  const spec = parseProductTechnicalSpec(
    JSON.parse(await readFile(resolve(records, filename), "utf8")),
  );
  if (filename !== spec.slug + ".json")
    throw new Error("文件名与网址片段不一致：" + filename);
  const variant = spec.variants.find(
    ({ id }) => id === verifiedValue(spec.photographedVariant),
  );
  if (!variant) continue;
  const images = resolve("src/assets/images/products/m18", spec.slug);
  const publicSvg = resolve("public/product-media", spec.slug);
  const artwork = resolve(records, "artwork", spec.slug);
  await Promise.all(
    [images, publicSvg, artwork].map((folder) =>
      mkdir(folder, { recursive: true }),
    ),
  );
  for (const [name, part] of [
    ["body", variant.body],
    ["lid", variant.lid],
  ] as const) {
    if (!part) continue;
    const title = spec.slug + " · " + variant.label.en + " · " + name;
    const drawing = technicalDrawing(part, title);
    if (drawing) {
      const path = "technical-" + variant.id + "-" + name;
      await writeFile(resolve(publicSvg, path + ".svg"), drawing + "\n");
      await sharp(Buffer.from(drawing))
        .png({ compressionLevel: 9 })
        .toFile(resolve(images, path + ".png"));
    }
    if (name === "body") {
      const draft = spec.blank
        ? templateSvg(sheetProfile(spec), "en")
        : unfoldingReference(part, title);
      if (draft)
        await writeFile(
          resolve(artwork, "unfolding-reference.svg"),
          draft + "\n",
        );
    }
  }
}
