import { fileURLToPath } from "node:url";
import readWorkbook from "read-excel-file/node";
import { describe, expect, it } from "vitest";
import { planGroups, productEntry, readSourceRows } from "./import-products.ts";
import { excludedShops } from "./product-import-groups.ts";

const workbook = await readWorkbook(
  fileURLToPath(
    new URL("../data-import/junbeili-products.xlsx", import.meta.url),
  ),
);
const rows = readSourceRows(
  workbook.find(({ sheet }) => sheet === "产品资料")!.data,
);
const { groups, mappings } = planGroups(rows);
const product = (slug: string) =>
  productEntry(
    groups.find((group) => group.slug === slug)!,
    1,
  );

describe("工厂产品导入", () => {
  it("只排除指定店铺类目，每行都能追溯", () => {
    const excluded = new Set<string>(excludedShops);
    expect(
      rows
        .filter(({ row }) => !mappings.has(row))
        .every(({ shop }) => excluded.has(shop)),
    ).toBe(true);
    expect(mappings.size).toBe(
      rows.filter(({ shop }) => !excluded.has(shop)).length,
    );
  });

  it("按材质和工艺分组，保留七个圆形 PET 型号", () => {
    const coated = product("pet-coated-round-rolled-rim-baking-cups");
    expect(coated.sizes.map(({ name }) => name.en)).toEqual([
      "2525",
      "3830",
      "4435",
      "5039",
      "6040",
      "7540",
      "8928",
    ]);
    expect(coated).not.toHaveProperty("moq");
    expect(coated.packaging?.en).toBe("100 pcs/pack × 30 packs");
    expect(product("greaseproof-round-rolled-rim-baking-cups").gsm).toBe(80);
  });

  it("把报价的起订量与装箱留在对应尺寸，并保留尺寸冲突", () => {
    const gold = product("single-sided-gold-round-rolled-rim-cups");
    expect(gold.sizes.map(({ topDiameterMm }) => topDiameterMm)).toEqual([
      50, 60, 70, 80, 58, 68,
    ]);
    expect(gold.packaging).toBeUndefined();
    expect(gold.packagingDetails?.en).toContain(
      "MOQ 2 cartons · Carton 32 × 28 × 27 cm",
    );
    const square = product("single-sided-gold-square-rolled-rim-cups");
    expect(square.sizes).toHaveLength(1);
    expect(square.sizes[0]?.specification?.en).toBe(
      "Base 65×65 mm, top 85×85 mm, height 35 mm",
    );
    expect(square.packagingDetails?.zh).toContain("外箱 52 × 40 × 44 cm");
    const trays = product("greaseproof-round-rolled-rim-trays");
    expect(trays.sizes).toHaveLength(2);
    expect(trays.packagingDetails?.zh).toContain("纸张克重 80 g/m²");
  });

  it("保留非圆形尺寸、多值克重和资料冲突中的空值", () => {
    const square = product("pet-coated-square-cups");
    expect(square.sizes).toHaveLength(3);
    expect(square.sizes[0]?.baseDiameterMm).toBeUndefined();
    expect(square.sizes[0]?.specification?.zh).toContain("60×60×30 mm");
    expect(product("translucent-cupcake-liners").gsm).toBe("24 / 31 / 40");
    expect(
      product("translucent-chiffon-liners").sizes[0]?.specification?.zh,
    ).toBe("100×50 mm");
    expect(
      product("square-paper-trays-with-lids").sizes[0]?.heightMm,
    ).toBeUndefined();
  });

  it("生成的产品不包含原始备注或内部资料位置", () => {
    const output = JSON.stringify(
      groups.map((group, index) => productEntry(group, index)),
    );
    expect(output).not.toMatch(
      /中文 PDF|英文 PDF|Junbeili_quotation|待核对|E:\\+1688店铺图|报价单第/,
    );
  });
});
