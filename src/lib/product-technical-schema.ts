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
  photographedVariant: fact(id),
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
