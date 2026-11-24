import { describe, expect, it } from "vitest";
import {
  formatCartonDimensions,
  formatWeight,
  productSpecifications,
} from "./product-specifications";

const product = {
  material: { en: "   " },
  gsm: "TODO_GSM",
  customizable: "TODO_CUSTOMIZABLE",
  moq: { en: "TODO_MOQ" },
  packaging: { en: "TODO_PACKAGING" },
  leadTime: { en: "[TODO: lead time]" },
  sizes: [{ name: { en: "TODO_SIZE" } }],
};
const defaults = {
  stockMoq: { en: "Ask us about stock minimums" },
  customMoq: { en: "Ask us about custom minimums", zh: "欢迎咨询定制起订量" },
  productionLeadTime: { en: "Contact us for timing", zh: "交期请咨询" },
};

describe("public product specifications", () => {
  it("omits unavailable rows and columns and falls back to the site policies", () => {
    expect(productSpecifications(product, defaults, "en")).toMatchObject({
      rows: [
        ["Minimum order", defaults.stockMoq.en],
        ["Lead time", defaults.productionLeadTime.en],
      ],
      sizes: [],
      columns: [],
      lids: [],
      packages: [],
      hasLids: false,
    });
    expect(
      productSpecifications({ ...product, customizable: true }, defaults, "zh")
        .rows,
    ).toEqual([
      ["起订量", defaults.customMoq.zh],
      ["交期", defaults.productionLeadTime.zh],
    ]);
  });

  it("keeps the base, top, lid and packing of a rectangular size distinct", () => {
    const result = productSpecifications(
      {
        ...product,
        sizes: [
          {
            name: { en: "Medium", zh: "中号" },
            shape: "rectangular",
            baseLengthMm: 162,
            baseWidthMm: 58,
            topLengthMm: 188,
            topWidthMm: 85,
            heightMm: 60,
            hasLid: true,
            lid: { baseLengthMm: 195, baseWidthMm: 89, heightMm: 25 },
            packages: [
              {
                packaging: { en: "50 pcs / OPP bag", zh: "50 只 / OPP 袋" },
                cartonLoading: { en: "50 pcs × 20 packs", zh: "50 只 × 20 条" },
                cartonSpec: "56 × 45.5 × 39.5",
              },
            ],
          },
        ],
      },
      defaults,
      "zh",
    );
    expect(result.sizes[0]).toMatchObject({
      name: "中号",
      baseDimensions: "162 × 58 mm",
      topDimensions: "188 × 85 mm",
      height: "60 mm",
      lid: "有",
    });
    expect(result.lids[0]).toMatchObject({
      name: "中号",
      baseDimensions: "195 × 89 mm",
      height: "25 mm",
    });
    expect(result.packages[0]).toMatchObject({
      name: "中号",
      cartonLoading: "50 只 × 20 条",
      cartonSpec: "56 × 45.5 × 39.5 cm",
    });
    expect(result.columns.map(([field]) => field)).not.toContain("base");
  });

  it("shows sheet and roll units as supplied", () => {
    const result = productSpecifications(
      {
        ...product,
        sizes: [
          {
            name: { en: "Sheet" },
            shape: "sheet",
            length: 15,
            width: 15,
            lengthUnit: "cm",
            widthUnit: "cm",
          },
          {
            name: { en: "Roll" },
            shape: "roll",
            length: 5,
            width: 30,
            lengthUnit: "m",
            widthUnit: "cm",
          },
        ],
      },
      defaults,
      "en",
    );
    expect(result.sizes[0].overallDimensions).toBe("15 × 15 cm");
    expect(result.sizes[1]).toMatchObject({ width: "30 cm", length: "5 m" });
  });

  it("hides empty default policies and leaves confirmed square dimensions intact", () => {
    const result = productSpecifications(
      {
        ...product,
        sizes: [
          ...product.sizes,
          {
            name: { en: "Square", zh: "TODO_ZH" },
            heightMm: 35,
            specification: { en: "Base 65×65 mm", zh: "底部 65×65 mm" },
          },
        ],
      },
      {
        stockMoq: { en: "" },
        customMoq: { en: "" },
        productionLeadTime: { en: "TODO_LEAD" },
      },
      "zh",
    );
    expect(result.rows).toEqual([]);
    expect(result.columns.map(([column]) => column)).toEqual([
      "name",
      "height",
      "specification",
    ]);
    expect(result.sizes).toHaveLength(1);
    expect(result.sizes[0]).toMatchObject({
      name: "Square",
      height: "35 mm",
      specification: "底部 65×65 mm",
    });
    expect(JSON.stringify(result)).not.toContain("TODO");
  });
});

describe("carton dimensions and shipment weights", () => {
  it.each([
    ["32*32*29", "32 × 32 × 29 cm"],
    ["56 × 45,5 × 39.5 cm", "56 × 45.5 × 39.5 cm"],
    ["550 x 410 x 460 mm", "55 × 41 × 46 cm"],
    ["0.52×0.4×0.44米", "52 × 40 × 44 cm"],
    ["62*38.5*32.5kg", undefined],
  ])("formats carton dimensions %s", (input, expected) => {
    expect(formatCartonDimensions(input)).toBe(expected);
  });

  it.each([
    ["3.65KG", "3.65 kg"],
    ["110克", "110 g"],
    ["7 公斤", "7 kg"],
    ["114.8", undefined],
    ["TODO_WEIGHT", undefined],
  ])("keeps the verified unit for %s", (input, expected) => {
    expect(formatWeight(input)).toBe(expected);
  });
});
