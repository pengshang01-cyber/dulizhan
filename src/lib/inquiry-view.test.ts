import { describe, expect, it } from "vitest";
import { inquiryDisplayItem, readInquiryCatalog } from "./inquiry-view";
import type { InquiryItem } from "./inquiry";

const stored: InquiryItem = {
  slug: "test-cup",
  sku: "TODO_SKU_TEST_CUP",
  title: "English cup",
  category: "old-category",
  quantity: null,
};
describe("shared inquiry list in two languages", () => {
  it("uses current localized product data without changing stored items or quantities", () => {
    const catalog = readInquiryCatalog(
      JSON.stringify([
        { ...stored, title: "测试纸杯", category: "new-category" },
      ]),
    );
    expect(inquiryDisplayItem(stored, catalog)).toEqual({
      slug: stored.slug,
      quantity: stored.quantity,
      title: "测试纸杯",
      category: "new-category",
    });
    expect(stored.title).toBe("English cup");
    expect(
      inquiryDisplayItem({ ...stored, quantity: 10000 }, catalog).quantity,
    ).toBe(10000);
  });
  it("keeps the legacy name and slug without returning its TODO model", () => {
    const item = inquiryDisplayItem(stored, new Map());
    expect(item).toMatchObject({
      title: stored.title,
      slug: stored.slug,
      category: stored.category,
    });
    expect(item).not.toHaveProperty("sku");
    expect(JSON.stringify(item)).not.toContain("TODO");
  });
  it("uses a verified model from the catalog and drops an obsolete stored model", () => {
    const supplemental = { ...stored, sku: "CONFIRMED-001" };
    const catalog = readInquiryCatalog(JSON.stringify([supplemental]));
    expect(inquiryDisplayItem(stored, catalog).sku).toBe(supplemental.sku);
    const unfilled = readInquiryCatalog(JSON.stringify([stored]));
    expect(inquiryDisplayItem(supplemental, unfilled)).not.toHaveProperty(
      "sku",
    );
  });
  it.each([undefined, "{", "null", '[{"slug":"x","title":3}]'])(
    "handles absent or invalid catalog %s",
    (value) => {
      expect(readInquiryCatalog(value).size).toBe(0);
    },
  );
});
