import { z } from "astro/zod";

const text = z.string().min(1);
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const bilingual = z.strictObject({ en: text, zh: text.optional() });
const positive = z.number().positive();
const nonNegative = z.number().nonnegative();
const quantity = z.number().int().nonnegative();

function fact<T extends z.ZodType>(value: T) {
  return z.discriminatedUnion("status", [
    z.strictObject({ status: z.literal("verified"), value, source: id }),
    z.strictObject({
      status: z.literal("missing"),
      value: z.null(),
      note: text.optional(),
    }),
    z.strictObject({
      status: z.literal("pending"),
      value: z.null(),
      note: text.optional(),
    }),
  ]);
}

const measurement = fact(positive);
const radius = fact(nonNegative);
const geometry = z.strictObject({
  baseDiameterMm: measurement.optional(),
  topDiameterMm: measurement.optional(),
  baseLengthMm: measurement.optional(),
  baseWidthMm: measurement.optional(),
  topLengthMm: measurement.optional(),
  topWidthMm: measurement.optional(),
  heightMm: measurement.optional(),
  lengthMm: measurement.optional(),
  widthMm: measurement.optional(),
  baseCornerRadiusMm: radius.optional(),
  topCornerRadiusMm: radius.optional(),
});

const carton = z.strictObject({
  sides: z.tuple([positive, positive, positive]),
  unit: fact(z.enum(["mm", "cm", "m"])),
});

const packageOption = z.strictObject({
  method: fact(bilingual),
  cartonLoading: fact(bilingual),
  carton: fact(carton),
});

const part = z.strictObject({
  geometry,
  pleatCount: fact(quantity),
  rimWidthMm: measurement,
  rimThicknessMm: measurement,
  paperThicknessMm: measurement,
  grammageGsm: measurement,
  unitWeightG: measurement,
  material: fact(bilingual),
  coating: fact(bilingual),
  packaging: fact(z.array(packageOption).min(1)),
});

const shape = z.enum([
  "round-rolled-rim",
  "square-rolled-rim",
  "rectangular-rolled-rim",
  "paper-liner",
  "box",
  "sheet",
  "board",
  "complex",
]);

const photoNumber = z.enum([
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
]);
const photo = z.strictObject({
  number: photoNumber,
  angle: z.enum([
    "front",
    "side",
    "top",
    "bottom",
    "three-quarter",
    "interior",
    "detail",
    "scale",
    "stack",
    "packaging",
    "color-range",
    "rotation",
  ]),
  files: fact(z.array(text).min(1)),
});

const rotationFrame = z
  .string()
  .regex(/^\/product-media\/[a-z0-9-]+\/rotation\/\d{2}\.webp$/);

export const productTechnicalSchema = z.strictObject({
  $schema: z.literal("./schema.json"),
  version: z.literal(1),
  slug: id,
  shape,
  blank: z
    .strictObject({
      variant: id,
      shape: z.literal("circle"),
      diameterMm: measurement,
      sectorStartsTurns: z.array(z.number().min(0).lt(1)).min(1),
      zonesMm: z.strictObject({
        bottomEnd: positive,
        wallEnd: positive,
        rimEnd: positive,
      }),
      printSide: z.strictObject({
        value: z.enum(["outside", "inside"]),
        status: z.enum(["pending", "confirmed"]),
      }),
      margins: z.strictObject({
        bleedMm: nonNegative,
        safetyMm: nonNegative,
        status: z.enum(["pending", "confirmed"]),
      }),
    })
    .optional(),
  photographedVariant: fact(id),
  modelAppearance: z
    .strictObject({
      sampleColor: bilingual,
      note: text,
      // 这两个比例记录俯视照片的轮廓，只用于展示，不写入 geometry 的实测半径。
      topCornerFraction: z.number().min(0).max(0.5).optional(),
      baseCornerFraction: z.number().min(0).max(0.5).optional(),
    })
    .optional(),
  variants: z
    .array(
      z.strictObject({
        id,
        label: bilingual,
        body: part,
        hasLid: fact(z.boolean()),
        lid: part.nullable(),
      }),
    )
    .min(1),
  colors: z.array(
    z.strictObject({
      name: fact(bilingual),
      code: fact(text),
      hex: fact(z.string().regex(/^#[0-9a-fA-F]{6}$/)),
      display: z
        .strictObject({
          hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
          reference: text,
        })
        .optional(),
    }),
  ),
  printAreas: z.array(
    z.strictObject({
      part: z.enum(["body", "base", "interior", "lid"]),
      available: fact(z.boolean()),
      maxColors: fact(quantity),
      bleedMm: fact(nonNegative),
      safeMarginMm: fact(nonNegative),
    }),
  ),
  photos: z.array(photo).length(12),
  rotation: fact(z.array(rotationFrame).length(24)),
  sources: z
    .array(
      z.strictObject({
        id,
        kind: z.enum(["measurement", "spec-sheet", "catalog", "site", "photo"]),
        reference: text,
      }),
    )
    .min(1),
});

export type ProductTechnicalSpec = z.infer<typeof productTechnicalSchema>;
export type TechnicalPart = ProductTechnicalSpec["variants"][number]["body"];

export function verifiedValue<T>(
  fact: { status: string; value: T | null } | undefined,
) {
  return fact?.status === "verified" ? (fact.value ?? undefined) : undefined;
}

export function parseProductTechnicalSpec(input: unknown) {
  const spec = productTechnicalSchema.parse(input);
  const sources = new Set(spec.sources.map(({ id }) => id));
  const ids = new Set(spec.variants.map(({ id }) => id));
  const photographed = verifiedValue(spec.photographedVariant);
  const frames = verifiedValue(spec.rotation);
  if (spec.blank) {
    const b = spec.blank,
      v = spec.variants.find((v) => v.id === b.variant);
    const g = v?.body.geometry,
      rb = (verifiedValue(g?.baseDiameterMm) ?? 0) / 2;
    const rt = (verifiedValue(g?.topDiameterMm) ?? 0) / 2,
      height = verifiedValue(g?.heightMm) ?? 0;
    const outer = (verifiedValue(b.diameterMm) ?? 0) / 2;
    if (
      !v ||
      b.sectorStartsTurns.length !== verifiedValue(v.body.pleatCount) ||
      b.sectorStartsTurns[0] !== 0 ||
      b.sectorStartsTurns.some((x, i, a) => i > 0 && x <= a[i - 1]!) ||
      !rb ||
      !rt ||
      !height ||
      spec.shape !== "round-rolled-rim" ||
      Math.abs(b.zonesMm.bottomEnd - rb) > 0.001 ||
      Math.abs(b.zonesMm.wallEnd - rb - Math.hypot(height, rt - rb)) > 0.001 ||
      Math.abs(b.zonesMm.rimEnd - outer) > 0.001 ||
      outer <= b.zonesMm.wallEnd ||
      b.margins.safetyMm >= outer ||
      b.margins.bleedMm > outer
    )
      throw new Error("原料纸片与规格分区不符：" + spec.slug);
  }
  if (
    sources.size !== spec.sources.length ||
    ids.size !== spec.variants.length ||
    new Set(spec.photos.map(({ number }) => number)).size !== 12 ||
    (photographed && !ids.has(photographed)) ||
    (frames && new Set(frames).size !== frames.length)
  )
    throw new Error("产品技术资料引用或编号重复：" + spec.slug);

  function validateSources(value: unknown): void {
    if (Array.isArray(value)) {
      value.forEach(validateSources);
    } else if (value && typeof value === "object") {
      if (
        "status" in value &&
        value.status === "verified" &&
        (!("source" in value) ||
          typeof value.source !== "string" ||
          !sources.has(value.source))
      )
        throw new Error("产品技术资料缺少核实来源：" + spec.slug);
      Object.values(value).forEach(validateSources);
    }
  }
  validateSources(spec);
  return spec;
}
