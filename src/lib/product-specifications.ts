import type { SiteConfig } from "../config/site";
import { confirmedLocalized, t, type Locale } from "../i18n/utils";
import { confirmedText } from "./placeholders";
import type { ProductData } from "./products";

const fieldLabels = [
  ["name", "products.size"],
  ["diameter", "products.diameter"],
  ["base", "products.baseDiameter"],
  ["top", "products.topDiameter"],
  ["baseDimensions", "products.baseDimensions"],
  ["topDimensions", "products.topDimensions"],
  ["overallDimensions", "products.overallDimensions"],
  ["width", "products.width"],
  ["length", "products.length"],
  ["height", "products.height"],
  ["lowHeight", "products.lowHeight"],
  ["highHeight", "products.highHeight"],
  ["topWide", "products.topWide"],
  ["topNarrow", "products.topNarrow"],
  ["material", "products.material"],
  ["paperWeight", "products.paperWeight"],
  ["unitWeight", "products.unitWeight"],
  ["lid", "products.companionLid"],
  ["specification", "products.sizeSpecification"],
] as const;
const packingLabels = [
  ["name", "products.size"],
  ["packaging", "products.packaging"],
  ["cartonLoading", "products.cartonLoading"],
  ["packWeight", "products.packWeight"],
  ["packSize", "products.packSize"],
  ["cartonWeight", "products.cartonWeight"],
  ["cartonSpec", "products.cartonSpecification"],
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
type Size = Specifications["sizes"][number];
type Dimensions = Omit<Size, "name" | "hasLid" | "lid">;

const measurement = (value: number | string | undefined, unit = "mm") =>
  typeof value === "number" ? `${value} ${unit}` : confirmedText(value);

function pair(length?: number | string, width?: number | string, unit = "mm") {
  if (typeof length === "number" && typeof width === "number")
    return `${length} × ${width} ${unit}`;
}

function dimensionCells(size: Dimensions, locale: Locale) {
  const weight = confirmedText(size.paperWeight);
  const roll = size.shape === "roll";
  const sheet = size.shape === "sheet";
  const round = size.shape === "round";
  const rectangular = size.shape === "rectangular";
  const showPair = !round && !roll;
  const showDiameters = !rectangular && !sheet && !roll;
  return {
    diameter: showDiameters ? measurement(size.diameterMm) : undefined,
    base: showDiameters ? measurement(size.baseDiameterMm) : undefined,
    top: showDiameters ? measurement(size.topDiameterMm) : undefined,
    baseDimensions:
      showPair && !sheet
        ? pair(size.baseLengthMm, size.baseWidthMm)
        : undefined,
    topDimensions:
      showPair && !sheet ? pair(size.topLengthMm, size.topWidthMm) : undefined,
    overallDimensions:
      showPair && size.widthUnit === size.lengthUnit
        ? pair(size.length, size.width, size.lengthUnit)
        : undefined,
    width:
      !round && (roll || !size.length || size.widthUnit !== size.lengthUnit)
        ? measurement(size.width, size.widthUnit)
        : undefined,
    length:
      !round && (roll || !size.width || size.widthUnit !== size.lengthUnit)
        ? measurement(size.length, size.lengthUnit)
        : undefined,
    height: !sheet && !roll ? measurement(size.heightMm) : undefined,
    lowHeight: !sheet && !roll ? measurement(size.lowHeightMm) : undefined,
    highHeight: !sheet && !roll ? measurement(size.highHeightMm) : undefined,
    topWide: !sheet && !roll ? measurement(size.topWideMm) : undefined,
    topNarrow: !sheet && !roll ? measurement(size.topNarrowMm) : undefined,
    material: confirmedLocalized(size.material, locale),
    paperWeight: weight && t("products.weightValue", locale, { value: weight }),
    unitWeight: confirmedText(size.unitWeight),
    specification: confirmedLocalized(size.specification, locale),
  };
}

function availableColumns(
  records: readonly Record<string, string | undefined>[],
  fields: readonly (readonly [string, string])[],
) {
  return fields.filter(([field]) => records.some((row) => row[field]));
}

export function structuredSizeSummary(size: Size, locale: Locale) {
  const cells = dimensionCells(size, locale);
  const roll =
    size.shape === "roll"
      ? [cells.width, cells.length].filter(Boolean).join(" × ")
      : undefined;
  return (
    cells.overallDimensions ??
    cells.baseDimensions ??
    cells.diameter ??
    (roll || undefined)
  );
}

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
  const hasLids = product.sizes.some(
    ({ hasLid, lid }) => hasLid === true || (hasLid !== false && lid),
  );
  const sharedMaterial = confirmedLocalized(product.material, locale);
  const sizes = product.sizes
    .map((size) => {
      const cells = dimensionCells(size, locale);
      return {
        name: confirmedLocalized(size.name, locale),
        ...cells,
        material:
          cells.material === sharedMaterial ? undefined : cells.material,
        paperWeight:
          confirmedText(size.paperWeight) === weight
            ? undefined
            : cells.paperWeight,
        lid:
          hasLids && (size.hasLid !== undefined || size.lid)
            ? t(
                size.hasLid === true || (size.hasLid !== false && size.lid)
                  ? "products.lidYes"
                  : "products.lidNo",
                locale,
              )
            : undefined,
      };
    })
    .filter((size) => Object.values(size).some(Boolean));
  const lids = product.sizes.flatMap(({ name, lid, hasLid }) =>
    lid && hasLid !== false
      ? [
          {
            name: confirmedLocalized(name, locale),
            ...dimensionCells(lid, locale),
          },
        ]
      : [],
  );
  const packages = product.sizes.flatMap(({ name, packages, lid, hasLid }) => {
    const label = confirmedLocalized(name, locale);
    return [
      ...(packages ?? []).map((pack) => ({ pack, name: label })),
      ...(hasLid === false ? [] : (lid?.packages ?? [])).map((pack) => ({
        pack,
        name: label
          ? t("products.lidFor", locale, { size: label })
          : t("products.companionLid", locale),
      })),
    ].map(({ pack, name }) => ({
      name,
      packaging: confirmedLocalized(pack.packaging, locale),
      cartonLoading: confirmedLocalized(pack.cartonLoading, locale),
      packWeight: confirmedText(pack.packWeight),
      packSize: confirmedText(pack.packSize),
      cartonWeight: confirmedText(pack.cartonWeight),
      cartonSpec: confirmedText(pack.cartonSpec),
    }));
  });
  return {
    rows,
    sizes,
    columns: availableColumns(sizes, fieldLabels),
    lids,
    lidColumns: availableColumns(
      lids,
      fieldLabels.filter(([field]) => field !== "lid"),
    ),
    packages,
    packageColumns: availableColumns(packages, packingLabels),
    hasLids,
  };
}
