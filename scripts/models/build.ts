import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  parseProductTechnicalSpec,
  verifiedValue,
} from "../../src/lib/product-technical-schema.ts";
import { buildGeometry } from "./geometry.ts";
import { encodeModel } from "./glb.ts";

const folder = "data/product-specs";
for (const file of (await readdir(folder)).sort()) {
  if (!file.endsWith(".json") || file === "schema.json") continue;
  const spec = parseProductTechnicalSpec(
    JSON.parse(await readFile(join(folder, file), "utf8")),
  );
  if (!spec.modelAppearance) continue;
  if (file !== spec.slug + ".json")
    throw new Error("文件名与产品不符：" + file);
  const color = spec.colors.find(
    (c) => verifiedValue(c.name)?.en === spec.modelAppearance!.sampleColor.en,
  );
  const sample = (color && verifiedValue(color.hex)) ?? color?.display?.hex;
  if (!sample) throw new Error("需要核实的颜色或照片显示色：" + spec.slug);
  const output = join("public/models", spec.slug);
  await mkdir(output, { recursive: true });
  for (const variant of spec.variants) {
    const parts = buildGeometry(spec, variant);
    const bytes = await encodeModel(parts, sample, spec.shape !== "box");
    if (bytes.length > 2_000_000)
      throw new Error("模型超过 2 MB：" + spec.slug + "/" + variant.id);
    await writeFile(join(output, variant.id + ".glb"), bytes);
    console.log(
      spec.slug + "/" + variant.id + ".glb",
      bytes.length + " B",
      parts.map((p) => p.name).join(" + "),
    );
  }
}
