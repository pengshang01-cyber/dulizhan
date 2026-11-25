import { bilingual } from "./product-specs-mapping.ts";

const color = (en: string, zh: string, swatch: string) => ({
  ...bilingual(en, zh),
  swatch,
});
const palette = {
  white: color("White", "白色", "#ffffff"),
  whitePrint: color("White with print", "白底印花", "#f5f1eb"),
  clear: color("Clear", "透明", "#edf3f3"),
  kraft: color("Natural kraft", "本色", "#be9b70"),
  brown: color("Brown", "棕色", "#78584b"),
  darkBrown: color("Dark brown", "深棕色", "#4b352d"),
  charcoal: color("Charcoal", "炭灰色", "#4e5556"),
  black: color("Black", "黑色", "#28252a"),
  red: color("Red", "红色", "#c33938"),
  orange: color("Orange", "橙色", "#d78232"),
  yellow: color("Yellow", "黄色", "#d9b631"),
  lime: color("Yellow-green", "黄绿色", "#aeb63a"),
  green: color("Green", "绿色", "#6a9a4b"),
  mint: color("Mint green", "薄荷绿", "#71b9a6"),
  blue: color("Blue", "蓝色", "#438eae"),
  navy: color("Deep blue", "深蓝色", "#285797"),
  turquoise: color("Turquoise", "蓝绿色", "#4fb5b7"),
  purple: color("Purple", "紫色", "#8d5eaa"),
  lavender: color("Lavender", "浅紫色", "#b5a1cb"),
  pink: color("Pink", "粉色", "#d591a8"),
  hotPink: color("Magenta", "玫红色", "#c44081"),
  gold: color("Gold", "金色", "#c6a244"),
  goldInterior: color("Gold interior", "金色内壁", "#c6a244"),
  brownStripe: color("Brown stripe", "棕色条纹", "#825f4f"),
  silver: color("Silver", "银色", "#c0c5ca"),
  rose: color("Rose gold", "玫瑰金", "#c58591"),
  greenGrid: color("Green gingham", "绿格", "#8ebd75"),
  pinkGrid: color("Pink gingham", "粉格", "#d78caa"),
  blueGrid: color("Blue gingham", "蓝格", "#7fbccb"),
  yellowGrid: color("Yellow gingham", "黄格", "#d1b84e"),
} as const;
type Color = keyof typeof palette;

interface Evidence {
  slugs: string[];
  colors: Color[];
  source: string;
}
function evidence(
  slugs: string | string[],
  colors: Color[],
  source: string,
): Evidence {
  return { slugs: typeof slugs === "string" ? [slugs] : slugs, colors, source };
}

// 页码用 PDF 文件页序号。色块只代表样本可辨认的颜色名称。
const selections = [
  evidence(
    "round-pet-dessert-inserts",
    ["clear"],
    "中文 PDF 4，圆形 PET 透明托",
  ),
  evidence(
    "square-pet-dessert-inserts",
    ["clear"],
    "中文 PDF 4，方形 PET 透明托",
  ),
  evidence(
    "mushroom-baking-cups",
    ["white", "black", "red", "pink", "yellow", "green", "blue", "lavender"],
    "中文 PDF 5，蘑菇杯独立样杯",
  ),
  evidence(
    [
      "square-coated-paper-boxes",
      "rectangular-coated-paper-boxes",
      "mini-rectangular-paper-boxes",
    ],
    ["kraft"],
    "中文 PDF 6、英文 PDF 4 的本色盒；Excel 行 2、4、5、7、9",
  ),
  evidence(
    [
      "square-paper-box-lids",
      "rectangular-paper-box-lids",
      "paper-dessert-cup-lids",
      "mushroom-cup-lids",
    ],
    ["clear"],
    "中文 PDF 5、6、43 的透明配套盖，Excel 行 3、6、8、10、12、173",
  ),
  evidence(
    "corrugated-cake-boxes",
    ["kraft"],
    "中文 PDF 7、英文 PDF 5 的本色盒体",
  ),
  evidence(
    [
      "double-sided-gold-round-rolled-rim-cups",
      "double-sided-gold-square-rolled-rim-cups",
      "double-sided-gold-rectangular-rolled-rim-cups",
      "double-sided-gold-flame-cups",
    ],
    ["gold"],
    "中文 PDF 8、英文 PDF 6 金色款；Excel 双面金条目",
  ),
  evidence(
    "rose-gold-round-rolled-rim-cups",
    ["rose"],
    "中文 PDF 8、英文 PDF 6 圆形卷口杯的玫瑰金色样",
  ),
  evidence(
    "single-sided-gold-round-rolled-rim-cups",
    [
      "brown",
      "red",
      "mint",
      "white",
      "pink",
      "blue",
      "lavender",
      "turquoise",
      "purple",
      "navy",
      "green",
    ],
    "中文 PDF 9、英文 PDF 7，DMJ-01 至 DMJ-18 的外壁色样",
  ),
  evidence(
    [
      "single-sided-gold-square-rolled-rim-cups",
      "single-sided-gold-rectangular-rolled-rim-cups",
    ],
    ["brown", "blue", "pink", "red", "white", "mint"],
    "中文 PDF 10、英文 PDF 8，方形与长方形分栏",
  ),
  evidence(
    "single-sided-gold-flame-cups",
    ["darkBrown", "blue", "pink", "red", "white", "mint"],
    "中文 PDF 10、英文 PDF 8，底部单面金火焰杯",
  ),
  evidence(
    "single-sided-gold-scalloped-rim-cups",
    ["goldInterior"],
    "Excel 行 103 的单面金工艺；其余外壁颜色待核",
  ),
  evidence(
    "pet-coated-round-rolled-rim-baking-cups",
    [
      "lavender",
      "pink",
      "mint",
      "hotPink",
      "orange",
      "lime",
      "blue",
      "green",
      "purple",
      "red",
      "brown",
      "white",
      "kraft",
    ],
    "中文 PDF 12、32，英文 PDF 10、30，JK 色样与本色款",
  ),
  evidence(
    "pet-coated-scalloped-rim-cups",
    [
      "kraft",
      "lavender",
      "pink",
      "mint",
      "lime",
      "blue",
      "green",
      "purple",
      "hotPink",
      "orange",
      "red",
      "brown",
      "white",
    ],
    "中文 PDF 14、32，英文 PDF 12、30，HB 色样",
  ),
  evidence(
    "flame-paper-baking-cups",
    [
      "kraft",
      "pink",
      "mint",
      "lime",
      "blue",
      "green",
      "purple",
      "hotPink",
      "orange",
      "red",
      "brown",
    ],
    "中文 PDF 15、32，英文 PDF 13、30，HY-01 至 HY-24",
  ),
  evidence(
    "greaseproof-round-rolled-rim-baking-cups",
    [
      "white",
      "kraft",
      "pink",
      "lime",
      "blue",
      "green",
      "orange",
      "brown",
      "red",
      "charcoal",
    ],
    "中文 PDF 16、英文 PDF 14，FY-JB-01 至 FY-JB-10",
  ),
  evidence(
    "greaseproof-square-rolled-rim-cups",
    [
      "white",
      "kraft",
      "pink",
      "yellow",
      "blue",
      "green",
      "orange",
      "red",
      "darkBrown",
      "charcoal",
    ],
    "中文 PDF 17、英文 PDF 15，FX-JB-01 至 FX-JB-10",
  ),
  evidence(
    "greaseproof-rectangular-rolled-rim-cups",
    [
      "white",
      "pink",
      "yellow",
      "blue",
      "green",
      "orange",
      "red",
      "darkBrown",
      "charcoal",
    ],
    "中文 PDF 17、英文 PDF 15，同页长方形叠杯样品",
  ),
  evidence(
    "greaseproof-tulip-baking-cups",
    [
      "white",
      "kraft",
      "darkBrown",
      "brown",
      "pink",
      "turquoise",
      "yellow",
      "green",
      "orange",
      "red",
      "blue",
      "purple",
      "mint",
    ],
    "中文 PDF 18–19、英文 PDF 16–17，Y 系列防油纸郁金香",
  ),
  evidence(
    "lotus-baking-cups",
    ["white", "kraft", "darkBrown", "red", "yellow", "green"],
    "中文 PDF 20、英文 PDF 18，LH-01 至 LH-06",
  ),
  evidence(
    [
      "straw-hat-baking-cups",
      "greaseproof-scalloped-rim-cups",
      "greaseproof-muffin-cups",
    ],
    ["kraft", "white", "darkBrown"],
    "中文 PDF 21、英文 PDF 19，草帽杯、花边杯和马芬纸杯分栏",
  ),
  evidence(
    "foil-laminated-cupcake-liners",
    [
      "gold",
      "silver",
      "pink",
      "red",
      "green",
      "hotPink",
      "navy",
      "purple",
      "black",
    ],
    "中文 PDF 22–23、英文 PDF 20–21，LB-01 至 LB-09",
  ),
  evidence(
    "translucent-cupcake-liners",
    ["white", "yellow", "darkBrown", "pink"],
    "中文 PDF 24、英文 PDF 22，BTM-01 至 BTM-03",
  ),
  evidence(
    "translucent-chiffon-liners",
    ["white", "orange", "darkBrown"],
    "中文 PDF 24、英文 PDF 22，XF 样图",
  ),
  evidence(
    "greaseproof-cupcake-liners",
    [
      "kraft",
      "white",
      "black",
      "yellow",
      "pink",
      "blue",
      "red",
      "green",
      "orange",
    ],
    "中文 PDF 25、英文 PDF 23，FYZB-01 至 FYZB-09",
  ),
  evidence(
    [
      "pet-coated-round-cups",
      "pet-coated-square-cups",
      "pet-coated-boat-cups",
      "pet-coated-rectangular-cups",
      "paper-pizza-pans",
      "pet-coated-square-rolled-rim-cups",
      "pet-coated-rectangular-rolled-rim-cups",
    ],
    ["kraft"],
    "中文 PDF 32–33、英文 PDF 30–31 的本色 PET 分款",
  ),
  evidence(
    [
      "pet-coated-round-cups",
      "pet-coated-square-cups",
      "pet-coated-boat-cups",
      "pet-coated-rectangular-cups",
      "pet-coated-triangular-cups",
      "pet-coated-leaf-cups",
      "paper-pizza-pans",
    ],
    ["whitePrint"],
    "中文 PDF 31、英文 PDF 29，风车淋膜系列逐个杯型",
  ),
  evidence(
    ["large-round-rolled-rim-trays", "large-rectangular-rolled-rim-trays"],
    ["kraft"],
    "中文 PDF 32、英文 PDF 30；Excel 行 87、88",
  ),
  evidence(
    [
      "parchment-basque-cheesecake-liners",
      "rolled-edge-parchment-basque-liners",
    ],
    ["kraft", "white"],
    "中文 PDF 38–39、英文 PDF 36–37，硅油纸纸托与翻边款",
  ),
  evidence(
    [
      "greaseproof-round-rolled-rim-trays",
      "greaseproof-round-baking-trays",
      "large-greaseproof-round-baking-trays",
    ],
    ["kraft"],
    "中文 PDF 40、英文 PDF 38，本色防油纸圆盘；Excel 行 105–107",
  ),
  evidence(
    "round-parchment-air-fryer-liners",
    ["kraft", "white"],
    "中文 PDF 41、英文 PDF 39，最上方圆形硅油款",
  ),
  evidence(
    [
      "square-parchment-air-fryer-liners",
      "rectangular-parchment-air-fryer-liners",
    ],
    ["kraft"],
    "中文 PDF 41、英文 PDF 39，方形及长方形硅油款",
  ),
  evidence(
    "round-foil-air-fryer-liners",
    ["silver"],
    "中文 PDF 41、英文 PDF 39，下栏圆形铝箔复合纸示例",
  ),
  evidence(
    "star-fluted-pudding-cups",
    [
      "gold",
      "silver",
      "darkBrown",
      "turquoise",
      "pink",
      "lavender",
      "white",
      "lime",
      "green",
      "red",
    ],
    "中文 PDF 42、英文 PDF 40，BD 系列及同页金银色样；45/50/75 mm 对应 Excel 行 130–132",
  ),
  evidence(
    "paper-dessert-cups",
    ["white", "kraft", "yellowGrid", "pinkGrid", "blueGrid", "greenGrid"],
    "中文 PDF 43、英文 PDF 41，冰淇淋杯独立色样及 Excel 行 172",
  ),
  evidence(
    "chiffon-cake-paper-molds",
    ["white"],
    "中文 PDF 43、英文 PDF 41，戚风蛋糕模具实拍",
  ),
  evidence(
    ["square-paper-trays-with-lids", "rectangular-paper-trays-with-lids"],
    ["white", "kraft", "greenGrid", "pinkGrid", "blueGrid", "yellowGrid"],
    "中文 PDF 44–45、英文 PDF 42–43，逐项标注色样；Excel 行 135–140",
  ),
  evidence(
    "round-paper-bowls",
    ["white", "kraft"],
    "中文 PDF 46、英文 PDF 44；Excel 行 174–183 明列白色及本色",
  ),
  evidence(
    [
      "paper-barbecue-trays",
      "octagonal-paper-bowls",
      "boat-shaped-paper-trays",
    ],
    ["kraft"],
    "中文 PDF 46–47、英文 PDF 44–45，盘碗盒实际产品",
  ),
  evidence(
    "baking-parchment-rolls",
    ["white", "kraft"],
    "中文 PDF 48、英文 PDF 46，硅油纸卷样品",
  ),
  evidence(
    "window-cake-boxes",
    ["white", "kraft"],
    "中文 PDF 48、英文 PDF 46，开窗蛋糕盒样品",
  ),
  evidence(
    ["square-baking-parchment-sheets", "rectangular-baking-parchment-sheets"],
    ["white", "kraft"],
    "中文 PDF 49、英文 PDF 47，硅油纸方形与长方形共用色样",
  ),
  evidence(
    ["square-greaseproof-paper-sheets", "rectangular-greaseproof-paper-sheets"],
    ["white", "pinkGrid", "yellowGrid", "greenGrid", "blueGrid"],
    "中文 PDF 49、英文 PDF 47，下栏防油纸样图",
  ),
  evidence(
    [
      "triangular-gold-cake-cards",
      "rectangular-gold-cake-cards",
      "round-gold-cake-cards",
      "square-gold-cake-cards",
      "gold-cake-card-strips",
      "leaf-shaped-gold-cake-cards",
    ],
    ["gold"],
    "中文 PDF 50、英文 PDF 48，金卡图样",
  ),
  evidence(
    ["triangular-white-cake-cards", "square-white-cake-cards"],
    ["white"],
    "中文 PDF 50、英文 PDF 48，白卡图样；Excel 行 170–171",
  ),
  evidence(
    "gold-square-dessert-trays",
    ["gold"],
    "中文 PDF 55、英文 PDF 53 金托",
  ),
  evidence(
    "mousse-square-dessert-trays",
    ["brownStripe"],
    "中文 PDF 55、英文 PDF 53 慕斯托 MF-01",
  ),
  evidence("gold-tub-packed-cupcake-liners", ["gold"], "Excel 行 193 品名"),
  evidence(
    ["white-cupcake-liners", "white-greaseproof-cupcake-liners"],
    ["white"],
    "Excel 行 195–196 品名",
  ),
  evidence("natural-color-cupcake-liners", ["kraft"], "Excel 行 198 品名"),
];

export type CatalogColor = ReturnType<typeof color>;
export function confirmedColors(slug: string) {
  const evidence = selections.filter(({ slugs }) => slugs.includes(slug));
  const keys = new Set(evidence.flatMap(({ colors }) => colors));
  const sources = evidence.map(({ source }) => source);

  if (slug.startsWith("single-sided-gold-")) {
    keys.delete("goldInterior");
    return {
      colors: [
        palette.goldInterior,
        ...Array.from(
          new Set<Color>(["white", "red", "pink", ...keys]),
          (key) => {
            const { en, zh, swatch } = palette[key];
            return color(`${en} exterior`, `${zh}外壁`, swatch);
          },
        ),
      ],
      sources: [...sources, "2026-11-25 工厂确认单面金系列可选白、红、粉外壁"],
    };
  }

  return {
    colors: [...keys].map((key) => palette[key]),
    sources,
  };
}

export const useColorRequest = (slug: string) =>
  /(^printed-|^gold-print-|molded-baking-cups$|^hexagonal-baking-cups$|^muffin-rolled-rim-baking-cups$)/.test(
    slug,
  );
