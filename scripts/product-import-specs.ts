export type Bilingual = { en: string; zh: string };
export const bilingual = (en: string, zh: string = en): Bilingual => ({
  en,
  zh,
});

export interface SourceRow {
  row: number;
  title: string;
  model: string;
  shop: string;
  material: string;
  gsm: number | string | undefined;
  baseDiameterMm?: number;
  heightMm?: number;
  topDiameterMm?: number;
  color: string;
  pattern: string;
  moq: string;
  packaging: string;
  carton: string;
  lead: string;
  customizable: string;
  note: string;
  quote: boolean;
}

const materialNames: Record<string, string> = {
  PET: "PET",
  "PE 淋膜纸": "PE-coated paper",
  "PET 淋膜纸": "PET-coated paper",
  "双面 PET 淋膜纸": "Double-sided PET-coated paper",
  "单面金 PET 淋膜纸": "Single-sided gold PET-coated paper",
  "双面金 PET 淋膜纸": "Double-sided gold PET-coated paper",
  彩色防油纸: "Colored greaseproof paper",
  防油纸: "Greaseproof paper",
  淋膜纸: "Coated paper",
  硅油纸: "Silicone-coated parchment paper",
  铝箔复合纸: "Foil-laminated paper",
  半透明纸: "Translucent paper",
  蛋糕纸: "Cake liner paper",
  烘焙纸: "Baking paper",
  卡纸: "Paperboard",
  食品级白卡: "Food-grade white paperboard",
  瓦楞纸: "Corrugated paperboard",
};
const optionNames: Record<string, string> = {
  单面金: "Single-sided gold",
  双面金: "Double-sided gold",
  玫瑰金: "Rose gold",
  白色: "White",
  本色: "Natural color",
  牛皮色: "Kraft color",
  彩色: "Assorted colors",
  金: "Gold",
  银: "Silver",
  金色: "Gold",
  纯色: "Solid color",
  单色: "Single color",
  染色: "Dyed",
  四色: "Four colors",
  多色: "Assorted colors",
  紫色: "Purple",
  绿色: "Green",
  蓝色: "Blue",
  金色印花: "Gold print",
  素色: "Plain",
  印花: "Printed",
  格纹: "Checked",
  波点: "Polka dots",
};

function translate(value: string, dictionary: Record<string, string>) {
  const en = dictionary[value];
  if (!en) throw new Error(`导入词汇缺少英文译法：${value}`);
  return bilingual(en, value);
}

export const translateMaterial = (value: string) =>
  value ? translate(value, materialNames) : bilingual("TODO_MATERIAL", "");

export function translateOptions(values: string[]) {
  const labels = [
    ...new Set(
      values.flatMap((value) => value.split(/\s*\/\s*/)).filter(Boolean),
    ),
  ];
  return labels.map((label) => translate(label, optionNames));
}

function unitCount(amount: string, single: string, plural: string) {
  return amount.replace(/,/g, "") === "1" ? single : plural;
}

export function translatePacking(value: string) {
  // 包装数字只来自专列，附带的来源标签不用于对外文案。
  const zh = value.replace(/（(?:英文)?图册）/g, "");
  const en = zh
    .replace(/([\d,]+)\s*个\/PVC\s*包/g, "$1 pcs/PVC pack")
    .replace(/([\d,]+)\s*个\/纸盒/g, "$1 pcs/box")
    .replace(
      /([\d,]+)\s*个\/(包|条|箱)/g,
      (_, amount: string, unit: string) =>
        `${amount} pcs/${{ 包: "pack", 条: "sleeve", 箱: "carton" }[unit]}`,
    )
    .replace(/([\d,]+)\s*张\/袋/g, "$1 sheets/bag")
    .replace(
      /([\d,]+)\s*(包|条|盒)\/箱/g,
      (_, amount: string, unit: string) =>
        `${amount} ${{ 包: "packs", 条: "sleeves", 盒: "boxes" }[unit]}/carton`,
    )
    .replace(
      /([\d,]+)\s*(包|条|盒|箱|卷)/g,
      (_, amount: string, unit: string) => {
        const titles = {
          包: ["pack", "packs"],
          条: ["sleeve", "sleeves"],
          盒: ["box", "boxes"],
          箱: ["carton", "cartons"],
          卷: ["roll", "rolls"],
        } as const;
        const [single, plural] = titles[unit as keyof typeof titles];
        return `${amount} ${unitCount(amount, single, plural)}`;
      },
    )
    .replace(/([\d,]+)\s*张/g, "$1 sheets")
    .replace(/([\d,]+)\s*个/g, "$1 pcs")
    .replace(/，/g, ", ");
  if (/[\p{Script=Han}]/u.test(en))
    throw new Error(`无法翻译包装数量：${value}`);
  return bilingual(en, zh);
}

const part = String.raw`\d+(?:\.\d+)?`;
const measures = String.raw`${part}(?:\s*[×xX]\s*${part}){1,2}`;
const normalizedDimensions = (value: string) =>
  value.replace(/\s*[xX×]\s*/g, "×");

function getDimension(text: string, label: string) {
  return text.match(
    new RegExp(`(?:${label})\\s*(${measures})\\s*(mm|cm)?`, "i"),
  );
}

export function sourceDimensions(row: SourceRow) {
  const { note, title, heightMm } = row;
  const base = getDimension(note, "底部(?!×高)|底(?=\\s*\\d+\\s*[×xX])");
  if (base) {
    const top = getDimension(note, "顶部|口(?=\\s*\\d+\\s*[×xX])");
    const bottom = normalizedDimensions(base[1]);
    const rim = top ? normalizedDimensions(top[1]) : "";
    return {
      key: bottom,
      rim,
      label: bilingual(`${bottom}${heightMm ? `×${heightMm}` : ""} mm`),
      description: bilingual(
        `Base ${bottom} mm${rim ? `, top ${rim} mm` : ""}${heightMm ? `, height ${heightMm} mm` : ""}`,
        `底部 ${bottom} mm${rim ? `，顶部 ${rim} mm` : ""}${heightMm ? `，高度 ${heightMm} mm` : ""}`,
      ),
    };
  }
  const roll = title.match(/(\d+)cm\s*×\s*(\d+)m/);
  if (roll) {
    const label = `${roll[1]} cm × ${roll[2]} m`;
    return {
      key: label,
      label: bilingual(label),
      description: bilingual(
        `Width × roll length ${label}`,
        `纸宽 × 卷长 ${label}`,
      ),
    };
  }
  const range = note.match(
    /系列范围\s*(\d+[–-]\d+)\s*英寸，厚度\s*(\d+[–-]\d+)\s*mm/,
  );
  if (range) {
    return {
      key: `${range[1]}:${range[2]}`,
      label: bilingual(`${range[1]} in`, `${range[1]} 英寸`),
      description: bilingual(
        `Series sizes ${range[1]} in, thickness ${range[2]} mm`,
        `系列尺寸 ${range[1]} 英寸，厚度 ${range[2]} mm`,
      ),
    };
  }
  const plain = getDimension(note, "长×宽|底部×高|尺寸\\s+(?=\\d)|原表尺寸");
  if (plain?.[2]) {
    const parts = normalizedDimensions(plain[1]).split("×");
    // 高度有冲突时只保留来源中一致的长宽。
    const uncertainHeight =
      !heightMm && parts.length === 3 && /标高.*待核对/.test(note);
    const numeric = (uncertainHeight ? parts.slice(0, 2) : parts).join("×");
    // 圆形的底径与高度已在独立列给出，不再重复普通两项尺寸。
    if (
      row.baseDiameterMm !== undefined &&
      heightMm !== undefined &&
      !numeric.match(/×.*×/)
    )
      return undefined;
    const dims = `${numeric} ${plain[2]}`;
    return {
      key: dims,
      label: bilingual(dims),
      description: bilingual(dims),
    };
  }
  const diameter = note.match(/(?:直径)\s*(\d+(?:\.\d+)?)\s*mm/);
  if (diameter && row.baseDiameterMm === undefined) {
    const dim = `${diameter[1]} mm`;
    return {
      key: dim,
      label: bilingual(`Ø ${dim}`),
      description: bilingual(`Diameter ${dim}`, `直径 ${dim}`),
    };
  }
  return undefined;
}

const sizesInWords: Record<string, string> = {
  迷你: "Mini",
  小号: "Small",
  中小号: "Medium-small",
  中号: "Medium",
  大号: "Large",
};

export function sizeName(
  row: SourceRow,
  dimensions: ReturnType<typeof sourceDimensions>,
) {
  if (row.model) {
    const model = row.model.match(/^(\d+)号$/);
    return model
      ? bilingual(`No. ${model[1]}`, row.model)
      : bilingual(row.model);
  }
  const capacity = row.title.match(/(\d+)\s*mL/i);
  if (capacity) return bilingual(`${capacity[1]} mL`);
  const cavities = row.title.match(/^(\d+)粒装/);
  if (cavities) return bilingual(`${cavities[1]}-count`, `${cavities[1]} 粒装`);
  const inches = row.title.match(/(\d+(?:\.\d+)?)寸(迷你|矮边|加高)?/);
  if (inches) {
    const tag =
      { 迷你: " · Mini", 矮边: " · Low edge", 加高: " · Tall" }[inches[2]] ??
      "";
    return bilingual(
      `${inches[1]} in${tag}`,
      `${inches[1]} 英寸${inches[2] ?? ""}`,
    );
  }
  const flat = row.title.match(/^(\d+(?:\.\d+)?)cm\s/);
  if (flat) return bilingual(`${flat[1]} cm blank`, `${flat[1]} cm 展开规格`);
  const nominal = row.title.match(/^(\d+)\s+(?:郁金香|圆角郁金香|莲花杯)/);
  if (nominal)
    return bilingual(
      `${nominal[1]} · ${row.baseDiameterMm}×${row.heightMm} mm`,
    );
  const size = row.title.match(/^(迷你|中小号|小号|中号|大号)/)?.[1];
  if (size) return bilingual(sizesInWords[size]!, size);
  if (dimensions) return dimensions.label;
  if (row.baseDiameterMm && row.heightMm) {
    const size = `${row.baseDiameterMm}×${row.heightMm} mm`;
    if (row.quote && row.topDiameterMm)
      return bilingual(
        `${size} · top Ø ${row.topDiameterMm} mm`,
        `${size} · 口径 ${row.topDiameterMm} mm`,
      );
    return bilingual(size);
  }
  if (row.color && row.title.includes("花色资料"))
    return translate(row.color, optionNames);
  return bilingual("TODO_SIZE_NAME", "");
}
