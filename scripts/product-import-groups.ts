export const excludedShops = [
  "单面金系列",
  "双面黑色系列",
  "圣诞系列",
  "垫盘纸",
  "塑料卷边杯",
  "寿司盒",
  "皇冠杯",
  "花花系列",
  "酸奶皮子",
  "香草蛋糕托",
  "大圆盘大长方",
] as const;

export const imagePath = (category: (typeof importCategories)[number]) =>
  `../../assets/images/categories/${category[5]}-placeholder.png`;

// 这些映射只用于导入，网站本身只读取内容集合。
export const importCategories = [
  [
    "cupcake-liners",
    "Cupcake Liners",
    "蛋糕纸托",
    "Plain, printed, translucent and foil-laminated liners for cupcakes and small cakes.",
    "用于蛋糕与小点心的素色、印花、半透明及铝箔复合纸托。",
    "standard-cupcake-liners",
    ["纸托", "半透明", "铝箔复合纸托"],
  ],
  [
    "pet-coated-baking-cups",
    "PET-Coated Baking Cups",
    "淋膜纸杯",
    "Coated paper baking cups in round, square, rectangular and shaped profiles.",
    "圆形、方形、长方形及异形淋膜纸杯。",
    "paper-baking-molds",
    ["淋膜杯"],
  ],
  [
    "rolled-rim-baking-cups",
    "Rolled-Rim Baking Cups",
    "卷口杯",
    "Round and straight-sided rolled-rim cups and trays in coated and greaseproof paper.",
    "包括淋膜纸和防油纸款的圆形、方形卷口杯及烤盘。",
    "rolled-rim-baking-cups",
    [
      "卷口杯",
      "卷口杯（方形）",
      "卷口杯（金银）",
      "大圆盘卷口杯",
      "大长方卷口杯",
    ],
  ],
  [
    "tulip-shaped-baking-cups",
    "Tulip & Shaped Baking Cups",
    "造型纸杯",
    "Tulip, lotus, scalloped and other shaped cups for baking and desserts.",
    "适合烘焙与甜品的郁金香杯、莲花杯、花边杯及其他造型纸杯。",
    "tulip-baking-cups",
    [
      "郁金香",
      "莲花杯",
      "花边杯",
      "火焰杯",
      "草帽杯",
      "花朵杯",
      "蘑菇杯",
      "星纹布丁杯",
      "泡芙杯",
    ],
  ],
  [
    "muffin-molded-cups",
    "Muffin & Molded Baking Cups",
    "机制杯与马芬杯",
    "Round, square, hexagonal and rectangular baking cups for muffins and individual cakes.",
    "适用于马芬与小蛋糕的圆形、正方形、六角形及长方形纸杯。",
    "muffin-cups",
    ["机制杯", "长方机制杯", "四方杯类", "玛芬杯"],
  ],
  [
    "basque-cheesecake-liners",
    "Basque Cheesecake Liners",
    "巴斯克蛋糕纸",
    "Basque cheesecake liners, coated baking cups and round greaseproof trays.",
    "巴斯克蛋糕纸托、淋膜烤杯和圆形防油纸烤盘。",
    "basque-cheesecake-liners",
    ["巴斯克纸托", "巴斯克淋膜纸", "防油纸大盘", "防油纸大盘子"],
  ],
  [
    "paper-baking-molds",
    "Paper Baking Molds",
    "纸质烤模",
    "Coated paper molds for chiffon cakes and shallow paper pans for pizza.",
    "戚风蛋糕用淋膜纸模与浅边纸质披萨盘。",
    "paper-baking-molds",
    ["戚风蛋糕模", "披萨盘"],
  ],
  [
    "pet-dessert-inserts",
    "PET Dessert Inserts",
    "PET 塑料托",
    "Round and square PET inserts for individual desserts.",
    "用于独立包装甜点的圆形和方形 PET 塑料托。",
    "dessert-cups",
    ["PET塑料托"],
  ],
  [
    "baking-wrapping-paper",
    "Baking & Wrapping Paper",
    "烘焙用纸",
    "Parchment sheets, rolls and wrapping papers for baking and food packaging.",
    "用于烘焙和食品包装的硅油纸片、纸卷和包装纸。",
    "greaseproof-cupcake-liners",
    ["包装纸", "硅油纸卷"],
  ],
  [
    "air-fryer-liners",
    "Air Fryer Liners",
    "空气炸锅纸",
    "Round, square and rectangular air fryer liners in silicone-coated and foil-laminated paper.",
    "圆形、方形及长方形空气炸锅用硅油纸与铝箔复合纸托。",
    "foil-baking-cups",
    ["空气炸锅纸"],
  ],
  [
    "cake-boards",
    "Cake Boards",
    "蛋糕底板",
    "Cake cards and boards in different shapes for presenting cakes and pastries.",
    "用于承托和展示蛋糕、点心的多种形状卡垫与底板。",
    "specialty-packaging",
    ["金卡", "白卡垫", "蛋糕板"],
  ],
  [
    "cake-boxes",
    "Cake Boxes & Packaging",
    "蛋糕盒与包装盒",
    "Paper boxes, window cake boxes, corrugated cartons and paper trays with lids.",
    "纸盒、开窗蛋糕盒、瓦楞盒和带盖纸塑盒。",
    "kraft-trays-boxes",
    ["纸盒", "开窗蛋糕包装盒", "瓦楞盒子", "纸塑盒"],
  ],
  [
    "paper-bowls-trays",
    "Paper Bowls & Food Trays",
    "纸碗与餐盒",
    "Round and octagonal paper bowls, boat trays and barbecue trays for food service.",
    "餐饮用圆形与八角纸碗、船形纸盒及烧烤纸盘。",
    "kraft-trays-boxes",
    ["八角碗", "圆形纸碗", "船盒", "烧烤盘"],
  ],
] as const;

type Family = readonly [
  pattern: RegExp,
  slug: string,
  english: string,
  chinese: string,
];
const any = /./;
function geometry(
  prefix: string,
  en: string,
  zh: string,
  shape: RegExp,
  paper: readonly [RegExp, string, string, string],
): Family {
  const [material, suffix, enMaterial, zhMaterial] = paper;
  return [
    new RegExp(`^(?=.*${shape.source})(?=.*${material.source})`),
    `${suffix}-${prefix}`,
    `${enMaterial} ${en}`,
    `${zhMaterial}${zh}`,
  ];
}

const rimPapers = [
  [/\|PET 淋膜纸\|/, "pet-coated", "PET-Coated", "PET 淋膜"],
  [/\|彩色防油纸\|/, "greaseproof", "Greaseproof", "防油纸"],
  [/\|单面金 PET 淋膜纸\|/, "single-sided-gold", "Single-Sided Gold", "单面金"],
  [/\|双面金 PET 淋膜纸\|/, "double-sided-gold", "Double-Sided Gold", "双面金"],
  [/\|双面 PET 淋膜纸\|/, "gold-print", "Gold Print", "金色印花"],
] as const;

export const productFamilies: Readonly<Record<string, readonly Family[]>> = {
  PET塑料托: [
    [
      /圆形/,
      "round-pet-dessert-inserts",
      "Round PET Dessert Inserts",
      "圆形 PET 塑料托",
    ],
    [
      /方形/,
      "square-pet-dessert-inserts",
      "Square PET Dessert Inserts",
      "方形 PET 塑料托",
    ],
  ],
  八角碗: [[any, "octagonal-paper-bowls", "Octagonal Paper Bowls", "八角纸碗"]],
  包装纸: [
    [
      /^硅油纸片（(\d+)×\1 cm）/,
      "square-baking-parchment-sheets",
      "Square Baking Parchment Sheets",
      "正方形硅油纸片",
    ],
    [
      /^硅油纸片（(?!(\d+)×\1 cm）)/,
      "rectangular-baking-parchment-sheets",
      "Rectangular Baking Parchment Sheets",
      "长方形硅油纸片",
    ],
    [
      /^防油纸片（(\d+)×\1 cm）/,
      "square-greaseproof-paper-sheets",
      "Square Greaseproof Paper Sheets",
      "正方形防油纸片",
    ],
    [
      /^防油纸片（(?!(\d+)×\1 cm）)/,
      "rectangular-greaseproof-paper-sheets",
      "Rectangular Greaseproof Paper Sheets",
      "长方形防油纸片",
    ],
    [
      /^三明治包装纸（(\d+)×\1 cm）/,
      "square-sandwich-wrapping-paper",
      "Square Sandwich Wrapping Paper",
      "正方形三明治包装纸",
    ],
    [
      /^三明治包装纸（(?!(\d+)×\1 cm）)/,
      "rectangular-sandwich-wrapping-paper",
      "Rectangular Sandwich Wrapping Paper",
      "长方形三明治包装纸",
    ],
  ],
  半透明: [
    [
      /半透明纸托/,
      "translucent-cupcake-liners",
      "Translucent Cupcake Liners",
      "半透明纸托",
    ],
    [
      /雪芳/,
      "translucent-chiffon-liners",
      "Translucent Chiffon Cake Liners",
      "半透明雪芳杯",
    ],
    [
      /磨堡/,
      "translucent-oblong-liners",
      "Oblong Translucent Cake Liners",
      "半透明磨堡杯",
    ],
    [
      /正方杯/,
      "translucent-square-liners",
      "Square Translucent Cake Liners",
      "半透明正方杯",
    ],
  ],
  卷口杯: [
    [
      /\|PET 淋膜纸\|/,
      "pet-coated-round-rolled-rim-baking-cups",
      "PET-Coated Round Rolled-Rim Baking Cups",
      "PET 淋膜圆形卷口杯",
    ],
    [
      /\|彩色防油纸\|/,
      "greaseproof-round-rolled-rim-baking-cups",
      "Greaseproof Round Rolled-Rim Baking Cups",
      "防油纸圆形卷口杯",
    ],
    [
      /\|双面 PET 淋膜纸\|/,
      "double-coated-round-rolled-rim-cups",
      "Double-Coated Round Rolled-Rim Cups",
      "双面淋膜圆形卷口杯",
    ],
  ],
  "卷口杯（方形）": [
    ...rimPapers.map((paper) =>
      geometry(
        "square-rolled-rim-cups",
        "Square Rolled-Rim Cups",
        "正方形卷口杯",
        /(?:正方形|(?<!长)方形卷边杯)/,
        paper,
      ),
    ),
    ...rimPapers.map((paper) =>
      geometry(
        "rectangular-rolled-rim-cups",
        "Rectangular Rolled-Rim Cups",
        "长方形卷口杯",
        /长方形/,
        paper,
      ),
    ),
  ],
  "卷口杯（金银）": [
    [
      /单面玫瑰金/,
      "rose-gold-round-rolled-rim-cups",
      "Rose Gold Round Rolled-Rim Cups",
      "单面玫瑰金圆形卷口杯",
    ],
    [
      /\|单面金 PET/,
      "single-sided-gold-round-rolled-rim-cups",
      "Single-Sided Gold Round Rolled-Rim Cups",
      "单面金圆形卷口杯",
    ],
    [
      /\|双面金 PET/,
      "double-sided-gold-round-rolled-rim-cups",
      "Double-Sided Gold Round Rolled-Rim Cups",
      "双面金圆形卷口杯",
    ],
  ],
  四方杯类: [
    [
      /正方/,
      "square-molded-baking-cups",
      "Square Molded Baking Cups",
      "正方机制杯",
    ],
    [/六角/, "hexagonal-baking-cups", "Hexagonal Baking Cups", "六角杯"],
  ],
  圆形纸碗: [[any, "round-paper-bowls", "Round Paper Bowls", "圆形纸碗"]],
  大圆盘卷口杯: [
    [
      /\|防油纸\|/,
      "greaseproof-round-rolled-rim-trays",
      "Greaseproof Round Rolled-Rim Trays",
      "防油纸圆盘卷口杯",
    ],
    [
      /^大圆盘/,
      "large-round-rolled-rim-trays",
      "Large Round Rolled-Rim Trays",
      "大圆盘卷口杯",
    ],
  ],
  大长方卷口杯: [
    [
      any,
      "large-rectangular-rolled-rim-trays",
      "Large Rectangular Rolled-Rim Trays",
      "大长方卷口杯",
    ],
  ],
  巴斯克淋膜纸: [
    [
      any,
      "coated-basque-baking-cups",
      "Coated Basque Baking Cups",
      "巴斯克淋膜纸杯",
    ],
  ],
  巴斯克纸托: [
    [
      /翻边.*\|硅油纸\|/,
      "rolled-edge-parchment-basque-liners",
      "Rolled-Edge Parchment Basque Liners",
      "硅油纸翻边巴斯克纸托",
    ],
    [
      /翻边.*\|防油纸\|/,
      "rolled-edge-greaseproof-basque-liners",
      "Rolled-Edge Greaseproof Basque Liners",
      "防油纸翻边巴斯克纸托",
    ],
    [
      /翻边.*\|\|/,
      "rolled-edge-basque-liners",
      "Rolled-Edge Basque Liners",
      "翻边巴斯克纸托",
    ],
    [
      /^(?!.*翻边).*\|硅油纸\|/,
      "parchment-basque-cheesecake-liners",
      "Parchment Basque Cheesecake Liners",
      "硅油纸巴斯克纸托",
    ],
  ],
  开窗蛋糕包装盒: [
    [any, "window-cake-boxes", "Window Cake Boxes", "开窗蛋糕盒"],
  ],
  戚风蛋糕模: [
    [
      any,
      "chiffon-cake-paper-molds",
      "Chiffon Cake Paper Molds",
      "纸质戚风蛋糕模",
    ],
  ],
  披萨盘: [[any, "paper-pizza-pans", "Paper Pizza Pans", "纸质披萨盘"]],
  星纹布丁杯: [
    [any, "star-fluted-pudding-cups", "Star-Fluted Pudding Cups", "星纹布丁杯"],
  ],
  机制杯: [
    [
      /普通/,
      "plain-molded-baking-cups",
      "Plain Molded Baking Cups",
      "普通机制杯",
    ],
    [
      /牛皮/,
      "kraft-look-molded-baking-cups",
      "Kraft-Look Molded Baking Cups",
      "牛皮色机制杯",
    ],
    [
      /烫金/,
      "metallic-molded-baking-cups",
      "Metallic Molded Baking Cups",
      "金银烫金机制杯",
    ],
  ],
  泡芙杯: [
    [/甜品杯/, "paper-dessert-cups", "Paper Dessert Cups", "纸质甜品杯"],
    [
      /配套盖/,
      "paper-dessert-cup-lids",
      "Lids for Paper Dessert Cups",
      "甜品纸杯配套盖",
    ],
  ],
  淋膜杯: [
    [
      /三角/,
      "pet-coated-triangular-cups",
      "PET-Coated Triangular Baking Cups",
      "PET 淋膜三角形纸杯",
    ],
    [
      /四方/,
      "pet-coated-square-cups",
      "PET-Coated Square Baking Cups",
      "PET 淋膜正方形纸杯",
    ],
    [
      /树叶/,
      "pet-coated-leaf-cups",
      "PET-Coated Leaf-Shaped Baking Cups",
      "PET 淋膜树叶形纸杯",
    ],
    [
      /船型.*\|PET/,
      "pet-coated-boat-cups",
      "PET-Coated Boat-Shaped Baking Cups",
      "PET 淋膜船型纸杯",
    ],
    [
      /船型.*\|淋膜纸/,
      "coated-boat-cups",
      "Coated Boat-Shaped Baking Cups",
      "船型淋膜纸杯",
    ],
    [
      /长方形/,
      "pet-coated-rectangular-cups",
      "PET-Coated Rectangular Baking Cups",
      "PET 淋膜长方形纸杯",
    ],
    [
      /^(?!.*(?:三角|四方|树叶|船型|长方形)).*\|PET/,
      "pet-coated-round-cups",
      "PET-Coated Round Baking Cups",
      "PET 淋膜圆形纸杯",
    ],
    [
      /^(?!.*(?:三角|四方|树叶|船型|长方形)).*\|淋膜纸/,
      "coated-round-cups",
      "Coated Round Baking Cups",
      "圆形淋膜纸杯",
    ],
  ],
  火焰杯: [
    [
      /\|PET 淋膜纸\|/,
      "flame-paper-baking-cups",
      "Flame-Shaped Baking Cups",
      "火焰纸杯",
    ],
    [
      /\|单面金 PET/,
      "single-sided-gold-flame-cups",
      "Single-Sided Gold Flame Baking Cups",
      "单面金火焰杯",
    ],
    [
      /\|双面金 PET/,
      "double-sided-gold-flame-cups",
      "Double-Sided Gold Flame Baking Cups",
      "双面金火焰杯",
    ],
    [
      /\|双面 PET/,
      "double-coated-flame-cups",
      "Double-Coated Flame Baking Cups",
      "双面淋膜火焰纸杯",
    ],
  ],
  烧烤盘: [[any, "paper-barbecue-trays", "Paper Barbecue Trays", "烧烤纸盘"]],
  玛芬杯: [
    [
      any,
      "greaseproof-muffin-cups",
      "Greaseproof Muffin Cups",
      "防油纸玛芬翻边杯",
    ],
  ],
  瓦楞盒子: [
    [
      any,
      "corrugated-cake-boxes",
      "Corrugated Paper Cake Boxes",
      "长方形瓦楞纸盒",
    ],
  ],
  白卡垫: [
    [
      /三角/,
      "triangular-white-cake-cards",
      "Triangular White Cake Cards",
      "三角形白卡垫",
    ],
    [
      /正方/,
      "square-white-cake-cards",
      "Square White Cake Cards",
      "正方形白卡垫",
    ],
  ],
  硅油纸卷: [
    [any, "baking-parchment-rolls", "Baking Parchment Rolls", "硅油纸卷"],
  ],
  空气炸锅纸: [
    [
      /^圆形.*硅油纸/,
      "round-parchment-air-fryer-liners",
      "Round Parchment Air Fryer Liners",
      "圆形硅油空气炸锅纸",
    ],
    [
      /^方形.*硅油纸/,
      "square-parchment-air-fryer-liners",
      "Square Parchment Air Fryer Liners",
      "方形硅油空气炸锅纸",
    ],
    [
      /^长方形.*硅油纸/,
      "rectangular-parchment-air-fryer-liners",
      "Rectangular Parchment Air Fryer Liners",
      "长方形硅油空气炸锅纸",
    ],
    [
      /^圆形.*铝箔/,
      "round-foil-air-fryer-liners",
      "Round Foil-Laminated Air Fryer Liners",
      "圆形铝箔空气炸锅纸",
    ],
    [
      /^方形.*铝箔/,
      "square-foil-air-fryer-liners",
      "Square Foil-Laminated Air Fryer Liners",
      "方形铝箔空气炸锅纸",
    ],
  ],
  纸塑盒: [
    [
      /^正方/,
      "square-paper-trays-with-lids",
      "Square Paper Trays with Lids",
      "方形纸塑盒",
    ],
    [
      /^长方/,
      "rectangular-paper-trays-with-lids",
      "Rectangular Paper Trays with Lids",
      "长方形纸塑盒",
    ],
  ],
  纸托: [
    [
      /防油蛋糕纸托/,
      "greaseproof-cupcake-liners",
      "Greaseproof Cupcake Liners",
      "防油蛋糕纸托",
    ],
    [
      /印花蛋糕纸托.*\|蛋糕纸\|/,
      "printed-cupcake-liners",
      "Printed Cupcake Liners",
      "印花蛋糕纸托",
    ],
    [
      /印花蛋糕纸托.*\|\|/,
      "printed-liner-extra-sizes",
      "Printed Cupcake Liners — Additional Sizes",
      "印花蛋糕纸托补充规格",
    ],
    [
      /普通蛋糕纸托/,
      "plain-cupcake-liners",
      "Plain Cupcake Liners",
      "普通蛋糕纸托",
    ],
    [
      /小船型/,
      "boat-shaped-paper-liners",
      "Boat-Shaped Paper Liners",
      "小船型纸托",
    ],
    [/磨堡/, "oblong-cake-liners", "Oblong Paper Cake Liners", "磨堡纸托"],
    [
      /正方纸托/,
      "square-paper-liners",
      "Square Paper Cake Liners",
      "正方形纸托",
    ],
    [
      /^白色花边/,
      "white-scalloped-cupcake-liners",
      "White Scalloped Cupcake Liners",
      "白色花边蛋糕纸托",
    ],
    [
      /^彩色花边/,
      "colored-scalloped-cupcake-liners",
      "Colored Scalloped Cupcake Liners",
      "彩色花边蛋糕纸托",
    ],
    [
      /^白色蛋糕/,
      "white-cupcake-liners",
      "White Cupcake Liners",
      "白色蛋糕纸托",
    ],
    [
      /^本色蛋糕/,
      "natural-color-cupcake-liners",
      "Natural-Color Cupcake Liners",
      "本色蛋糕纸托",
    ],
    [
      /^纯色蛋糕/,
      "solid-color-cupcake-liners",
      "Solid-Color Cupcake Liners",
      "纯色蛋糕纸托",
    ],
    [
      /^单色蛋糕/,
      "single-color-cupcake-liners",
      "Single-Color Cupcake Liners",
      "单色蛋糕纸托",
    ],
    [/^染色蛋糕/, "dyed-cupcake-liners", "Dyed Cupcake Liners", "染色蛋糕纸托"],
    [
      /^四色蛋糕/,
      "four-color-cupcake-liners",
      "Four-Color Cupcake Liners",
      "四色蛋糕纸托",
    ],
  ],
  纸盒: [
    [
      /正方纸盒\|PE/,
      "square-coated-paper-boxes",
      "Square Coated Paper Cake Boxes",
      "正方形淋膜纸盒",
    ],
    [
      /长方纸盒\|PE/,
      "rectangular-coated-paper-boxes",
      "Rectangular Coated Paper Cake Boxes",
      "长方形淋膜纸盒",
    ],
    [
      /^迷你长方纸盒\|\|/,
      "mini-rectangular-paper-boxes",
      "Mini Rectangular Paper Cake Boxes",
      "迷你长方纸盒",
    ],
    [
      /正方纸盒盖/,
      "square-paper-box-lids",
      "Square Paper Box Lids",
      "正方形纸盒盖",
    ],
    [
      /长方纸盒盖/,
      "rectangular-paper-box-lids",
      "Rectangular Paper Box Lids",
      "长方形纸盒盖",
    ],
  ],
  船盒: [
    [any, "boat-shaped-paper-trays", "Boat-Shaped Paper Trays", "船形纸盒"],
  ],
  花朵杯: [
    [any, "flower-shaped-baking-cups", "Flower-Shaped Baking Cups", "花朵杯"],
  ],
  花边杯: [
    [
      /\|PET 淋膜纸\|/,
      "pet-coated-scalloped-rim-cups",
      "PET-Coated Scalloped-Rim Cups",
      "PET 淋膜花边杯",
    ],
    [
      /单面金/,
      "single-sided-gold-scalloped-rim-cups",
      "Single-Sided Gold Scalloped-Rim Cups",
      "单面金花边杯",
    ],
    [
      /\|防油纸\|/,
      "greaseproof-scalloped-rim-cups",
      "Greaseproof Scalloped-Rim Cups",
      "防油纸花边杯",
    ],
  ],
  草帽杯: [[any, "straw-hat-baking-cups", "Straw-Hat Baking Cups", "草帽纸杯"]],
  莲花杯: [[any, "lotus-baking-cups", "Lotus Baking Cups", "莲花杯"]],
  蘑菇杯: [
    [/配套盖/, "mushroom-cup-lids", "Mushroom Cup Lids", "蘑菇杯配套盖"],
    [
      /\|PET 淋膜纸\|/,
      "mushroom-baking-cups",
      "PET-Coated Mushroom Baking Cups",
      "PET 淋膜蘑菇杯",
    ],
  ],
  蛋糕板: [
    [
      /光面/,
      "scalloped-cake-boards",
      "Smooth Scalloped Cake Boards",
      "光面花边蛋糕板",
    ],
    [/瓦楞/, "corrugated-cake-boards", "Corrugated Cake Boards", "瓦楞蛋糕板"],
  ],
  郁金香: [
    [
      /圆角/,
      "rounded-tulip-baking-cups",
      "Rounded Tulip Baking Cups",
      "圆角郁金香纸杯",
    ],
    [
      /\|防油纸\|/,
      "greaseproof-tulip-baking-cups",
      "Greaseproof Tulip Baking Cups",
      "防油纸郁金香杯",
    ],
    [
      /(?<!圆角)郁金香纸杯.*\|\|/,
      "tulip-baking-cups",
      "Tulip Baking Cups",
      "郁金香纸杯",
    ],
  ],
  金卡: [
    [
      /三角/,
      "triangular-gold-cake-cards",
      "Triangular Gold Cake Cards",
      "三角形金卡垫",
    ],
    [
      /长方/,
      "rectangular-gold-cake-cards",
      "Rectangular Gold Cake Cards",
      "长方形金卡垫",
    ],
    [/圆形/, "round-gold-cake-cards", "Round Gold Cake Cards", "圆形金卡垫"],
    [
      /正方/,
      "square-gold-cake-cards",
      "Square Gold Cake Cards",
      "正方形金卡垫",
    ],
    [
      /细长条/,
      "gold-cake-card-strips",
      "Gold Cake Card Strips",
      "细长条金卡垫",
    ],
    [
      /树叶/,
      "leaf-shaped-gold-cake-cards",
      "Leaf-Shaped Gold Cake Cards",
      "树叶形金卡垫",
    ],
  ],
  铝箔复合纸托: [
    [
      any,
      "foil-laminated-cupcake-liners",
      "Foil-Laminated Cupcake Liners",
      "铝箔复合纸托",
    ],
  ],
  长方机制杯: [
    [
      any,
      "rectangular-molded-baking-cups",
      "Rectangular Molded Baking Cups",
      "长方机制杯",
    ],
  ],
  防油纸大盘: [
    [
      any,
      "greaseproof-round-baking-trays",
      "Greaseproof Round Baking Trays",
      "防油纸大圆盘",
    ],
  ],
  防油纸大盘子: [
    [
      any,
      "large-greaseproof-round-baking-trays",
      "Large Greaseproof Round Baking Trays",
      "大号防油纸圆盘",
    ],
  ],
};
