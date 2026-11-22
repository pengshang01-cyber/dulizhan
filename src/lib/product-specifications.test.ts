import { describe, expect, it } from "vitest";
import { productSpecifications } from "./product-specifications";

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
    expect(productSpecifications(product, defaults, "en")).toEqual({
      rows: [
        ["Minimum order", defaults.stockMoq.en],
        ["Lead time", defaults.productionLeadTime.en],
      ],
      sizes: [],
      columns: [],
    });
    expect(
      productSpecifications({ ...product, customizable: true }, defaults, "zh")
        .rows,
    ).toEqual([
      ["起订量", defaults.customMoq.zh],
      ["交期", defaults.productionLeadTime.zh],
    ]);
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
