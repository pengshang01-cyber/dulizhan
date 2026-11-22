import type { SiteConfig } from "../config/site";
import { confirmedLocalized, t, type Locale } from "../i18n/utils";
import { confirmedText } from "./placeholders";
import type { ProductData } from "./products";

const fieldLabels = [
  ["name", "products.size"],
  ["base", "products.baseDiameter"],
  ["height", "products.height"],
  ["top", "products.topDiameter"],
  ["specification", "products.sizeSpecification"],
] as const;
type Specifications = Pick<
  ProductData,
  | "material"
  | "gsm"
  | "moq"
  | "customizable"
  | "packaging"
  | "cartonSpec"
  | "leadTime"
  | "sizes"
>;

export function productSpecifications(
  product: Specifications,
  defaults: Pick<SiteConfig, "stockMoq" | "customMoq" | "productionLeadTime">,
  locale: Locale,
) {
  const weight = confirmedText(product.gsm);
  const rows = (
    [
      ["products.material", confirmedLocalized(product.material, locale)],
      [
        "products.paperWeight",
        weight && t("products.weightValue", locale, { value: weight }),
      ],
      [
        "products.minimumOrder",
        confirmedLocalized(product.moq, locale) ??
          confirmedLocalized(
            product.customizable === true
              ? defaults.customMoq
              : defaults.stockMoq,
            locale,
          ),
      ],
      ["products.packaging", confirmedLocalized(product.packaging, locale)],
      [
        "products.cartonSpecification",
        confirmedLocalized(product.cartonSpec, locale),
      ],
      [
        "products.leadTime",
        confirmedLocalized(product.leadTime, locale) ??
          confirmedLocalized(defaults.productionLeadTime, locale),
      ],
    ] as const
  ).flatMap(([label, value]) =>
    value ? [[t(label, locale), value] as const] : [],
  );
  const measurement = (value: number | string | undefined) =>
    typeof value === "number"
      ? t("products.measurement", locale, { value })
      : confirmedText(value);
  const sizes = product.sizes
    .map((size) => ({
      name: confirmedLocalized(size.name, locale),
      base: measurement(size.baseDiameterMm),
      height: measurement(size.heightMm),
      top: measurement(size.topDiameterMm),
      specification: confirmedLocalized(size.specification, locale),
    }))
    .filter((size) => Object.values(size).some(Boolean));
  const columns = fieldLabels.filter(([field]) =>
    sizes.some((size) => size[field]),
  );
  return { rows, sizes, columns };
}
