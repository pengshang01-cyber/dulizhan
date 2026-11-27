import { confirmedLocalized, t, type Locale } from "../i18n/utils";
import type { ImageMetadata } from "astro";
import {
  parseProductTechnicalSpec,
  verifiedValue,
  type ProductTechnicalSpec,
  type TechnicalPart,
} from "./product-technical-schema";

const sources = import.meta.glob<unknown>(
  ["/data/product-specs/*.json", "!/data/product-specs/schema.json"],
  { eager: true, import: "default" },
);
const drawings = import.meta.glob<ImageMetadata>(
  "/src/assets/images/products/m18/*/technical-*.png",
  { eager: true, import: "default" },
);
const views = import.meta.glob<ImageMetadata>(
  "/src/assets/images/products/m18/*/[0-9][0-9]-*.webp",
  { eager: true, import: "default" },
);

export function technicalPhotoViews(spec: ProductTechnicalSpec) {
  return ["01", "05", "02", "03", "06", "04"].flatMap((number) => {
    const photo = spec.photos.find((photo) => photo.number === number);
    const path = verifiedValue(photo?.files)?.[0];
    if (!path || !photo) return [];
    const image = views["/" + path];
    if (!image) throw new Error("已核实视图找不到图片：" + path);
    return [image];
  });
}

export function technicalDrawings(spec: ProductTechnicalSpec) {
  return spec.variants.flatMap(({ id, label, lid }) =>
    (lid ? (["body", "lid"] as const) : (["body"] as const)).flatMap((part) => {
      const file = "technical-" + id + "-" + part;
      const image =
        drawings[
          "/src/assets/images/products/m18/" + spec.slug + "/" + file + ".png"
        ];
      return image
        ? [
            {
              image,
              part,
              label,
              href: "/product-media/" + spec.slug + "/" + file + ".svg",
            },
          ]
        : [];
    }),
  );
}

export function technicalSpec(slug: string) {
  const raw = sources["/data/product-specs/" + slug + ".json"];
  if (!raw) return;
  const spec = parseProductTechnicalSpec(raw);
  if (spec.slug !== slug)
    throw new Error("产品技术资料文件名与 slug 不符：" + slug);
  return spec;
}

function publicPart(part: TechnicalPart) {
  return {
    geometryMm: Object.fromEntries(
      Object.entries(part.geometry).flatMap(([key, fact]) =>
        fact?.status === "verified"
          ? [[key.replace(/Mm$/, ""), fact.value]]
          : [],
      ),
    ),
    pleatCount: verifiedValue(part.pleatCount),
    rimWidthMm: verifiedValue(part.rimWidthMm),
    rimThicknessMm: verifiedValue(part.rimThicknessMm),
    paperThicknessMm: verifiedValue(part.paperThicknessMm),
    grammageGsm: verifiedValue(part.grammageGsm),
    unitWeightG: verifiedValue(part.unitWeightG),
    material: verifiedValue(part.material),
    coating: verifiedValue(part.coating),
    packaging: verifiedValue(part.packaging)?.map(
      ({ method, cartonLoading, carton }) => {
        const size = verifiedValue(carton);
        const unit = verifiedValue(size?.unit);
        return {
          method: verifiedValue(method),
          cartonLoading: verifiedValue(cartonLoading),
          carton: size && unit ? { sides: size.sides, unit } : undefined,
        };
      },
    ),
  };
}

export function publicTechnicalSpec(spec: ProductTechnicalSpec) {
  return {
    version: spec.version,
    slug: spec.slug,
    shape: spec.shape,
    photographedVariant: verifiedValue(spec.photographedVariant),
    variants: spec.variants.map(({ id, label, body, lid, hasLid }) => ({
      id,
      label,
      body: publicPart(body),
      hasLid: verifiedValue(hasLid),
      lid: lid ? publicPart(lid) : undefined,
    })),
    colors: spec.colors.flatMap(({ name, code, hex }) => {
      const label = verifiedValue(name);
      return label
        ? [{ name: label, code: verifiedValue(code), hex: verifiedValue(hex) }]
        : [];
    }),
  };
}

export function technicalProperties(
  spec: ReturnType<typeof publicTechnicalSpec>,
  locale: Locale,
) {
  const fields = spec.variants.flatMap(({ id, label, body, lid }) => {
    const variantName = confirmedLocalized(label, locale) ?? id;
    return (
      [
        ["body", body],
        ["lid", lid],
      ] as const
    ).flatMap(([part, values]) => {
      if (!values) return [];
      const common = (
        field: string,
        value: number | string,
        unitText?: string,
      ) => ({
        "@type": "PropertyValue",
        name: [
          variantName,
          t("technical." + part, locale),
          t("technical.fields." + field, locale),
        ].join(" · "),
        value,
        ...(unitText && { unitText }),
      });
      const weight = values.unitWeightG;
      const material = confirmedLocalized(values.material, locale);
      return [
        ...Object.entries(values.geometryMm).map(([key, value]) =>
          common(key, value, "mm"),
        ),
        ...(weight === undefined ? [] : [common("unitWeight", weight, "g")]),
        ...(material ? [common("material", material)] : []),
      ];
    });
  });
  const colors = spec.colors.flatMap(({ name }) => {
    const preferred = confirmedLocalized(name, locale);
    return preferred ? [preferred] : [];
  });
  return {
    ...(fields.length && { additionalProperty: fields }),
    ...(colors.length && { color: colors }),
  };
}
