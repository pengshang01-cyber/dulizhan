import { describe, expect, it } from "vitest";
import type { Row } from "read-excel-file/node";
import {
  parseDimensions,
  variantData,
  workbookVariants,
} from "./product-specs-source.ts";

const heading: Row = [
  "序号",
  "品名",
  "单个产品尺寸",
  "包装方式",
  "样图",
  "装箱方式",
  "材质",
  "可选颜色",
  "单个重量",
  "单包重量",
  "单包尺寸",
  "单件重量",
  "单件箱规",
  "是否有盖",
];

describe("2026 product workbook", () => {
  it("keeps continuation rows as packaging choices for the same product size", () => {
    const sheet: Row[] = [
      heading,
      [
        1,
        "纸盒",
        "底部65*65mm\n顶部85*85mm\n高度35mm",
        "50只/opp袋",
        null,
        "50只*60条",
        "230g牛皮PE淋膜纸",
        null,
        "4.5g",
        null,
        null,
        null,
        "52*42*44",
        "是",
      ],
      [null, null, null, "100只/收缩膜", null, "100只*20条", null],
      [null, null, null, null, '=DISPIMG("IMAGE_ONLY",1)'],
    ];
    const { variants, imageOnly } = workbookVariants(sheet);
    expect(variants.size).toBe(1);
    expect(imageOnly).toEqual([4]);
    const issue = () => {
      throw new Error("Unexpected interpretation");
    };
    const data = variantData(variants.get(1)!, "rectangular", issue);
    expect(data).toMatchObject({
      baseLengthMm: 65,
      baseWidthMm: 65,
      topLengthMm: 85,
      topWidthMm: 85,
      heightMm: 35,
      unitWeight: "4.5 g",
      hasLid: true,
      paperWeight: 230,
      packages: [
        { packaging: { en: "50 pcs / OPP bag" }, cartonSpec: "52 × 42 × 44" },
        { cartonLoading: { en: "100 pcs × 20 packs" } },
      ],
    });
  });

  it("keeps two edge heights distinct and preserves the native sheet units", () => {
    expect(
      parseDimensions(
        "底部直径50mm\n矮处边高50mm\n高处边高80mm\n顶部直径80mm",
        "shaped",
      ),
    ).toEqual({
      shape: "shaped",
      baseDiameterMm: 50,
      lowHeightMm: 50,
      highHeightMm: 80,
      topDiameterMm: 80,
    });
    expect(parseDimensions("15cm×15cm", "sheet")).toEqual({
      shape: "sheet",
      length: 15,
      width: 15,
      lengthUnit: "cm",
      widthUnit: "cm",
    });
  });

  it("does not convert a retail package's outside dimensions into liner dimensions", () => {
    const rows: Row[] = [
      heading,
      [
        1,
        "11厘米盒装",
        "直径75mm\n高度65mm",
        "100只/PET桶",
        null,
        "100只*200桶",
        null,
        null,
        null,
        "43.1g",
        "7.5*7.5*6.5cm",
        "9.65kg",
        "62*38.5*32.5kg",
      ],
    ];
    const { variants } = workbookVariants(rows);
    const warnings: string[] = [];
    const item = variantData(
      variants.get(1)!,
      "round",
      (_row, warning) => warnings.push(warning),
      { packagingOnly: true },
    );
    expect(item.heightMm).toBeUndefined();
    expect(item.packages?.[0]).toMatchObject({
      packSize: "7.5 × 7.5 × 6.5 cm",
    });
    expect(item.packages?.[0].cartonSpec).toBeUndefined();
    expect(warnings).toHaveLength(1);
  });
});
