export interface BilingualText {
  en: string;
  zh: string;
}

export type ProductShape =
  "round" | "rectangular" | "sheet" | "roll" | "shaped";

export interface ImportVariant {
  id: number;
  name?: BilingualText;
  previous?: string;
  lid?: number;
  packagingOnly?: boolean;
}

interface ProductMapping {
  slug: string;
  shape: ProductShape;
  variants: ImportVariant[];
  materialOption?: "silicone" | "greaseproof";
  nominalRound?: boolean;
  newProduct?: {
    category: string;
    title: BilingualText;
    material?: BilingualText;
  };
  newTitle?: BilingualText;
}

export const bilingual = (en: string, zh: string = en): BilingualText => ({
  en,
  zh,
});
const range = (first: number, last: number) =>
  Array.from({ length: last - first + 1 }, (_, index) => first + index);
const ids = (...ids: number[]): ImportVariant[] => ids.map((id) => ({ id }));
const variant = (
  id: number,
  en: string,
  zh: string,
  previous?: string,
  lid?: number,
): ImportVariant => ({ id, name: bilingual(en, zh), previous, lid });
const withLid = (ids: number[], lid: number): ImportVariant[] =>
  ids.map((id) => ({ id, lid }));
const molded = (first: number) => [
  variant(first, "Small", "小号", "Small"),
  variant(first + 1, "Medium", "中号", "Medium"),
];
const sizeInches = (id: number, value: number) =>
  variant(id, value + " in", value + " 英寸", value + " in");
const tub = (
  id: number,
  previous?: string,
  name = bilingual("11 cm", "11 厘米"),
) => ({ id, name, previous, packagingOnly: true });
const tulips = [
  variant(94, "110", "110", "110 · 35×60 mm"),
  variant(95, "150", "150", "150 · 50×80 mm"),
  variant(97, "160", "160", "160 · 50×85 mm"),
  variant(98, "165", "165"),
  variant(99, "170", "170", "170 · 60×90 mm"),
  variant(100, "175", "175"),
];
const bowls = [4, 5, 6, 7, 8].flatMap((value, i) => [
  sizeInches(140 + i, value),
  sizeInches(145 + i, value),
]);

// Excel 序号经题名、材质、图样及旧目录复核后才与网址绑定。
// 盖子只关联有明确适配依据的规格，不能按同口径跨产品自动传播。
export const productMapping: ProductMapping[] = [
  {
    slug: "square-coated-paper-boxes",
    shape: "rectangular",
    variants: [
      variant(1, "Mini", "迷你", "Mini", 2),
      variant(8, "Large", "大号", "95×95×50 mm", 9),
    ],
  },
  {
    slug: "mini-rectangular-paper-boxes",
    shape: "rectangular",
    variants: [variant(3, "Mini", "迷你", "Mini")],
  },
  {
    slug: "rectangular-coated-paper-boxes",
    shape: "rectangular",
    variants: [
      variant(4, "Medium", "中号", "160×60×58 mm", 5),
      variant(6, "Large", "大号", "130×80×50 mm", 7),
    ],
  },
  {
    slug: "square-paper-box-lids",
    shape: "rectangular",
    variants: [
      variant(2, "Mini", "迷你", "Mini"),
      variant(9, "Large", "大号", "133×133×35 mm"),
    ],
  },
  {
    slug: "rectangular-paper-box-lids",
    shape: "rectangular",
    variants: [
      variant(5, "Medium", "中号", "195×89×25 mm"),
      variant(7, "Large", "大号", "173×120×35 mm"),
    ],
  },
  {
    slug: "mushroom-baking-cups",
    shape: "round",
    variants: [variant(10, "Large", "大号", "45×50 mm", 11)],
  },
  {
    slug: "mushroom-cup-lids",
    shape: "round",
    variants: [variant(11, "Ø 88 mm", "直径 88 mm", "Ø 88 mm")],
  },
  { slug: "pet-coated-boat-cups", shape: "shaped", variants: ids(12, 13) },
  {
    slug: "pet-coated-round-cups",
    shape: "round",
    nominalRound: true,
    variants: ids(...range(14, 21), 26, 27, 31, 32, 33, 36, 37),
  },
  {
    slug: "paper-pizza-pans",
    shape: "round",
    variants: [4, 6, 7, 8].map((value, i) => sizeInches(22 + i, value)),
  },
  { slug: "pet-coated-triangular-cups", shape: "shaped", variants: ids(28) },
  { slug: "pet-coated-leaf-cups", shape: "shaped", variants: ids(29) },
  {
    slug: "pet-coated-square-cups",
    shape: "rectangular",
    variants: ids(30, 34, 35),
  },
  { slug: "plain-molded-baking-cups", shape: "round", variants: molded(38) },
  {
    slug: "kraft-look-molded-baking-cups",
    shape: "round",
    variants: molded(40),
  },
  {
    slug: "metallic-molded-baking-cups",
    shape: "round",
    variants: molded(42),
    newTitle: bilingual("Metallic Molded Baking Cups", "金银色机制杯"),
  },
  {
    slug: "foil-stamped-molded-baking-cups",
    shape: "round",
    variants: molded(44),
    newProduct: {
      category: "muffin-molded-cups",
      title: bilingual("Foil-Stamped Molded Baking Cups", "烫金机制杯"),
    },
  },
  {
    slug: "raised-molded-baking-cups",
    shape: "round",
    variants: [variant(47, "Small", "小号"), variant(46, "Medium", "中号")],
    newProduct: {
      category: "muffin-molded-cups",
      title: bilingual("Raised-Profile Molded Baking Cups", "立体机制杯"),
    },
  },
  {
    slug: "pet-coated-round-rolled-rim-baking-cups",
    shape: "round",
    variants: ids(...range(48, 52)),
  },
  {
    slug: "greaseproof-round-rolled-rim-baking-cups",
    shape: "round",
    variants: ids(...range(53, 56)),
  },
  {
    slug: "single-sided-gold-round-rolled-rim-cups",
    shape: "round",
    variants: ids(...range(57, 60)),
  },
  {
    slug: "double-sided-gold-round-rolled-rim-cups",
    shape: "round",
    variants: ids(...range(61, 64)),
  },
  { slug: "large-round-rolled-rim-trays", shape: "round", variants: ids(65) },
  {
    slug: "large-rectangular-rolled-rim-trays",
    shape: "rectangular",
    variants: ids(66),
  },
  ...[
    "pet-coated-square-rolled-rim-cups",
    "greaseproof-square-rolled-rim-cups",
    "single-sided-gold-square-rolled-rim-cups",
    "double-sided-gold-square-rolled-rim-cups",
  ].map((slug, i): ProductMapping => ({
    slug,
    shape: "rectangular",
    variants: withLid([67 + i], 71),
  })),
  ...[
    "pet-coated-rectangular-rolled-rim-cups",
    "greaseproof-rectangular-rolled-rim-cups",
    "single-sided-gold-rectangular-rolled-rim-cups",
    "double-sided-gold-rectangular-rolled-rim-cups",
  ].map((slug, i): ProductMapping => ({
    slug,
    shape: "rectangular",
    variants: withLid([72 + i], 76),
  })),
  ...[
    "flame-paper-baking-cups",
    "single-sided-gold-flame-cups",
    "double-sided-gold-flame-cups",
  ].map((slug, i): ProductMapping => ({
    slug,
    shape: "shaped",
    variants: [
      variant(77 + i, "140", "140", i === 1 ? "50×75 mm" : "TODO_SIZE_NAME"),
    ],
  })),
  { slug: "pet-coated-scalloped-rim-cups", shape: "shaped", variants: ids(80) },
  {
    slug: "single-sided-gold-scalloped-rim-cups",
    shape: "shaped",
    variants: ids(81),
  },
  {
    slug: "greaseproof-round-baking-trays",
    shape: "round",
    variants: [sizeInches(83, 4), sizeInches(84, 6)],
  },
  {
    slug: "large-greaseproof-round-baking-trays",
    shape: "round",
    variants: [sizeInches(85, 8)],
  },
  {
    slug: "parchment-basque-cheesecake-liners",
    shape: "round",
    variants: [
      variant(86, "2.5 in · Mini", "2.5 英寸迷你", "2.5 in · Mini"),
      ...[3, 3.5, 4, 5, 6, 8].map((value, i) => sizeInches(i + 88, value)),
    ],
  },
  {
    slug: "rolled-edge-parchment-basque-liners",
    shape: "round",
    variants: [sizeInches(87, 3.5)],
  },
  {
    slug: "tulip-baking-cups",
    shape: "shaped",
    variants: tulips,
    materialOption: "silicone",
  },
  {
    slug: "greaseproof-tulip-baking-cups",
    shape: "shaped",
    variants: tulips,
    materialOption: "greaseproof",
  },
  {
    slug: "rounded-tulip-baking-cups",
    shape: "shaped",
    variants: [variant(96, "150", "150", "150 · 50×70 mm")],
  },
  {
    slug: "lotus-baking-cups",
    shape: "shaped",
    variants: [variant(101, "150", "150", "150 · 50×70 mm")],
  },
  {
    slug: "straw-hat-baking-cups",
    shape: "shaped",
    variants: [variant(102, "45 × 50 mm", "45 × 50 mm", "45×50 mm")],
  },
  {
    slug: "star-fluted-pudding-cups",
    shape: "round",
    variants: [
      variant(103, "Small", "小号"),
      variant(104, "Medium", "中号"),
      variant(105, "Large", "大号"),
    ],
  },
  {
    slug: "gold-square-dessert-trays",
    shape: "rectangular",
    variants: ids(106),
    newProduct: {
      category: "muffin-molded-cups",
      title: bilingual("Gold Square Dessert Trays", "方形金托"),
    },
  },
  {
    slug: "mousse-square-dessert-trays",
    shape: "rectangular",
    variants: ids(107),
    newProduct: {
      category: "muffin-molded-cups",
      title: bilingual("Square Mousse Trays", "方形慕斯托"),
    },
  },
  {
    slug: "square-paper-trays-with-lids",
    shape: "rectangular",
    variants: [
      variant(108, "120 × 110 mm", "120 × 110 mm", "120×110 mm", 110),
      variant(109, "120 × 110 mm", "120 × 110 mm", "120×110 mm", 110),
    ],
  },
  {
    slug: "rectangular-paper-trays-with-lids",
    shape: "rectangular",
    variants: [
      variant(111, "175 × 70 mm", "175 × 70 mm", "175×70 mm", 113),
      variant(112, "175 × 70 mm", "175 × 70 mm", "175×70 mm", 113),
    ],
  },
  {
    slug: "foil-laminated-cupcake-liners",
    shape: "round",
    variants: ids(...range(114, 123)),
  },
  {
    slug: "plain-cupcake-liners",
    shape: "round",
    variants: ids(...range(124, 128)),
  },
  {
    slug: "translucent-cupcake-liners",
    shape: "round",
    variants: ids(...range(129, 133)),
  },
  {
    slug: "translucent-chiffon-liners",
    shape: "rectangular",
    variants: [variant(134, "100 × 50 mm", "100 × 50 mm", "100×50 mm")],
  },
  {
    slug: "translucent-oblong-liners",
    shape: "rectangular",
    variants: [variant(135, "70 × 35 mm", "70 × 35 mm", "72×35×25 mm")],
  },
  { slug: "triangular-white-cake-cards", shape: "sheet", variants: ids(136) },
  { slug: "square-white-cake-cards", shape: "sheet", variants: ids(137) },
  {
    slug: "paper-dessert-cups",
    shape: "round",
    variants: [variant(138, "85", "85", "85", 139)],
  },
  {
    slug: "paper-dessert-cup-lids",
    shape: "round",
    variants: [variant(139, "Ø 88 mm", "直径 88 mm", "88×25 mm")],
  },
  { slug: "round-paper-bowls", shape: "round", variants: bowls },
  {
    slug: "triangular-gold-cake-cards",
    shape: "sheet",
    variants: ids(150, 151),
  },
  {
    slug: "rectangular-gold-cake-cards",
    shape: "sheet",
    variants: ids(152, 153),
  },
  { slug: "round-gold-cake-cards", shape: "round", variants: ids(154, 155) },
  { slug: "square-gold-cake-cards", shape: "sheet", variants: ids(156, 157) },
  { slug: "gold-cake-card-strips", shape: "sheet", variants: ids(158) },
  {
    slug: "gold-tub-packed-cupcake-liners",
    shape: "round",
    variants: [tub(159)],
    newProduct: {
      category: "cupcake-liners",
      title: bilingual("Gold Tub-Packed Cupcake Liners", "金色桶装蛋糕纸托"),
    },
  },
  {
    slug: "colored-tub-packed-cupcake-liners",
    shape: "round",
    variants: [tub(160)],
    newProduct: {
      category: "cupcake-liners",
      title: bilingual("Colored Tub-Packed Cupcake Liners", "彩色桶装蛋糕纸托"),
    },
  },
  {
    slug: "white-cupcake-liners",
    shape: "round",
    variants: [tub(161, "White")],
  },
  {
    slug: "white-greaseproof-cupcake-liners",
    shape: "round",
    variants: [tub(162)],
    newProduct: {
      category: "cupcake-liners",
      title: bilingual("White Greaseproof Cupcake Liners", "白色防油蛋糕纸托"),
      material: bilingual("Grade 7 greaseproof paper", "7 级防油纸"),
    },
  },
  {
    slug: "natural-color-cupcake-liners",
    shape: "round",
    variants: [tub(164, "Natural")],
  },
  {
    slug: "colored-greaseproof-cupcake-liners",
    shape: "round",
    variants: [
      tub(165),
      tub(
        168,
        undefined,
        bilingual("11 cm · Six-color assortment", "11 厘米 · 六色混装"),
      ),
    ],
    newProduct: {
      category: "cupcake-liners",
      title: bilingual(
        "Colored Greaseproof Cupcake Liners",
        "彩色防油蛋糕纸托",
      ),
      material: bilingual("Colored greaseproof paper", "彩色防油纸"),
    },
  },
  {
    slug: "solid-color-cupcake-liners",
    shape: "round",
    variants: [tub(167, "Solid colors")],
  },
  {
    slug: "printed-cupcake-liners",
    shape: "round",
    variants: [
      ...ids(...range(169, 183).filter((id) => ![174, 176, 182].includes(id))),
      tub(163, "11 cm blank", bilingual("11 cm blank", "11 cm 展开规格")),
    ],
  },
  {
    slug: "printed-liner-extra-sizes",
    shape: "round",
    variants: ids(174, 176, 182),
  },
  {
    slug: "square-molded-baking-cups",
    shape: "rectangular",
    variants: [variant(184, "48×48×49 mm", "48×48×49 mm", "48×48×49 mm")],
  },
  {
    slug: "hexagonal-baking-cups",
    shape: "shaped",
    variants: [variant(185, "60×50 mm", "60×50 mm", "60×50 mm")],
  },
  {
    slug: "muffin-rolled-rim-baking-cups",
    shape: "round",
    variants: [variant(187, "TODO_SIZE_NAME", "")],
    newProduct: {
      category: "muffin-molded-cups",
      title: bilingual("Rolled-Rim Muffin Cups", "玛芬卷口杯"),
    },
  },
];

export const unmatched = {
  82: "品名写防油纸，材质列写 110g 双面金 PET 淋膜纸。样图无法核实纸材，暂不覆盖旧防油纸花边杯。",
  166: "11.5cm 天地盖与尺寸栏 50MM×3.25MM 含义不明，配套对象和材质均未标明，先留在审核清单。",
} as const;
