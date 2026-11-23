import type { Row } from "read-excel-file/node";
import {
  bilingual,
  type BilingualText,
  type ProductShape,
} from "./product-specs-mapping.ts";

export interface SizeDimensions {
  shape?: ProductShape;
  diameterMm?: number;
  baseDiameterMm?: number | string;
  topDiameterMm?: number | string;
  baseLengthMm?: number;
  baseWidthMm?: number;
  topLengthMm?: number;
  topWidthMm?: number;
  length?: number;
  width?: number;
  lengthUnit?: "mm" | "cm" | "m";
  widthUnit?: "mm" | "cm" | "m";
  heightMm?: number | string;
  lowHeightMm?: number;
  highHeightMm?: number;
  topWideMm?: number;
  topNarrowMm?: number;
  specification?: BilingualText;
}

export interface ProductPackage {
  packaging?: BilingualText;
  cartonLoading?: BilingualText;
  packWeight?: string;
  packSize?: string;
  cartonWeight?: string;
  cartonSpec?: string;
}

export interface SpecItem extends SizeDimensions {
  material?: BilingualText;
  paperWeight?: string | number;
  unitWeight?: string;
  packages?: ProductPackage[];
}

export interface ProductSize extends SpecItem {
  name: BilingualText;
  hasLid?: boolean;
  lid?: SpecItem;
}

type Warn = (row: number, note: string) => void;
type DimensionUnit = NonNullable<SizeDimensions["lengthUnit"]>;
const cell = (value: Row[number] | undefined) => String(value ?? "").trim();
const decimal = "(\\d+(?:[.,]\\d+)?)";
const measure = new RegExp(
  `^${decimal}\\s*(mm|cm|m)?\\s*[×*]\\s*${decimal}\\s*(mm|cm|m)?$`,
  "i",
);
const scalar = new RegExp(`^([^0-9]+?)\\s*${decimal}\\s*(mm|cm|m)?$`, "i");
const number = (value: string) => Number(value.replace(",", "."));
const units = (value?: string) =>
  value?.toLowerCase() as DimensionUnit | undefined;

export interface WorkbookVariant {
  id: number;
  name: string;
  row: number;
  lines: { row: number; cells: Row }[];
}

export function workbookVariants(rows: Row[]) {
  const expected = [
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
  if (expected.some((label, index) => cell(rows[0]?.[index]) !== label))
    throw new Error("规格表 Sheet1 表头与 2026 年格式不符");
  const variants = new Map<number, WorkbookVariant>();
  const imageOnly: number[] = [];
  let current: WorkbookVariant | undefined;
  for (const [index, cells] of rows.slice(1).entries()) {
    const row = index + 2;
    const id = cell(cells[0]);
    if (!cells.some((value, col) => col !== 4 && cell(value))) {
      if (cell(cells[4])) imageOnly.push(row);
      continue;
    }
    if (id) {
      const key = Number(id);
      const name = cell(cells[1]);
      if (!Number.isSafeInteger(key) || key < 1 || !name || variants.has(key))
        throw new Error("规格行缺少唯一序号或品名：" + row);
      current = { id: key, name, row, lines: [] };
      variants.set(key, current);
    }
    if (!current || (cell(cells[1]) && cell(cells[1]) !== current.name))
      throw new Error("规格表续行归属不明：" + row);
    current.lines.push({ row, cells });
  }
  return { variants, imageOnly };
}

const measureNames = {
  直径: "diameterMm",
  底部直径: "baseDiameterMm",
  底部: "baseDiameterMm",
  顶部直径: "topDiameterMm",
  上口径: "topDiameterMm",
  顶部: "topDiameterMm",
  高度: "heightMm",
  低处高度: "lowHeightMm",
  矮处边高: "lowHeightMm",
  高度高度: "highHeightMm",
  高处边高: "highHeightMm",
  上口宽处: "topWideMm",
  顶部宽处: "topWideMm",
  上口窄处: "topNarrowMm",
  顶部窄处: "topNarrowMm",
  长度: "length",
  宽度: "width",
} as const;

export function parseDimensions(
  raw: string,
  shape: ProductShape,
): SizeDimensions {
  const dimensions: SizeDimensions = { shape };
  const commonUnit = /mm/i.test(raw) ? "mm" : undefined;
  for (const part of raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)) {
    const prefix = /^(底部|顶部)/.exec(part)?.[0];
    const pair = measure.exec(prefix ? part.slice(prefix.length).trim() : part);
    if (pair) {
      const a = units(pair[2] ?? pair[4]),
        b = units(pair[4] ?? pair[2]);
      const first = number(pair[1]),
        second = number(pair[3]);
      if (prefix && a === "mm" && b === "mm") {
        if (prefix === "底部") {
          dimensions.baseLengthMm = first;
          dimensions.baseWidthMm = second;
        } else {
          dimensions.topLengthMm = first;
          dimensions.topWidthMm = second;
        }
      } else if (!prefix && a && b) {
        dimensions.length = first;
        dimensions.width = second;
        dimensions.lengthUnit = a;
        dimensions.widthUnit = b;
      } else throw new Error("未确认长宽单位：" + part);
      continue;
    }
    const value = scalar.exec(part);
    const key = value && measureNames[value[1] as keyof typeof measureNames];
    const unit = value && units(value[3] ?? commonUnit);
    if (!key || !value || !unit) throw new Error("未确认尺寸写法：" + part);
    if (key === "length" || key === "width") {
      dimensions[key] = number(value[2]);
      if (key === "length") dimensions.lengthUnit = unit;
      else dimensions.widthUnit = unit;
    } else {
      if (unit !== "mm") throw new Error("圆形或杯盒尺寸单位不是 mm：" + part);
      dimensions[key] = number(value[2]);
    }
  }
  return dimensions;
}

const materials: Record<string, BilingualText> = {
  竹浆PE淋膜纸: bilingual("Bamboo-pulp PE-coated paper", "竹浆 PE 淋膜纸"),
  牛皮PE淋膜纸: bilingual("Kraft PE-coated paper", "牛皮 PE 淋膜纸"),
  PET: bilingual("PET"),
  PET淋膜纸: bilingual("PET-coated paper", "PET 淋膜纸"),
  PE淋膜口杯纸: bilingual("PE-coated cupstock", "PE 淋膜口杯纸"),
  "PE淋膜口杯纸+外覆膜": bilingual(
    "PE-coated cupstock with outer film",
    "PE 淋膜口杯纸加外覆膜",
  ),
  单面金PET淋膜纸: bilingual(
    "Single-sided gold PET-coated paper",
    "单面金 PET 淋膜纸",
  ),
  双面金PET淋膜纸: bilingual(
    "Double-sided gold PET-coated paper",
    "双面金 PET 淋膜纸",
  ),
  防油纸: bilingual("Greaseproof paper", "防油纸"),
  彩色防油纸: bilingual("Colored greaseproof paper", "彩色防油纸"),
  进口本色防油纸: bilingual(
    "Imported natural greaseproof paper",
    "进口本色防油纸",
  ),
  硅油纸: bilingual("Silicone-coated paper", "硅油纸"),
  口杯纸: bilingual("Cupstock", "口杯纸"),
  "口杯纸+PET覆膜": bilingual("PET-laminated cupstock", "口杯纸加 PET 覆膜"),
  铝箔复合纸: bilingual("Aluminum foil composite paper", "铝箔复合纸"),
  蛋糕纸: bilingual("Cake liner paper", "蛋糕纸"),
  半透明纸: bilingual("Translucent paper", "半透明纸"),
  食品级白卡: bilingual("Food-grade white card", "食品级白卡"),
};

export function parseMaterial(
  raw: string,
  option?: "silicone" | "greaseproof",
) {
  const all = raw
    .split(/\r?\n/)
    .map((part) => /^(?:(\d+(?:\.\d+)?)(?:g|克)\s*)?(.+)$/i.exec(part.trim()))
    .filter((match) => match !== null)
    .map(([, weight, name]) => ({
      name: name.replaceAll(" ", ""),
      weight: weight && Number(weight),
    }));
  const selected = option
    ? all.filter(
        ({ name }) => name === (option === "silicone" ? "硅油纸" : "防油纸"),
      )
    : all;
  if (!selected.length) return {};
  const translated = selected.map(({ name }) => {
    const value = materials[name];
    if (!value) throw new Error("材质未录入可核实译名：" + name);
    return value;
  });
  const grades = Array.from(
    new Set(selected.map(({ weight }) => weight).filter(Boolean)),
  );
  return {
    material: bilingual(
      translated.map(({ en }) => en).join(" / "),
      translated.map(({ zh }) => zh).join(" / "),
    ),
    paperWeight:
      grades.length === 1 ? Number(grades[0]) : grades.join(" / ") || undefined,
  };
}

const packageNames: Record<string, BilingualText> = {
  opp袋: bilingual("OPP bag", "OPP 袋"),
  收缩膜: bilingual("shrink wrap", "收缩膜"),
  自封袋: bilingual("resealable bag", "自封袋"),
  吸塑盒: bilingual("thermoformed box", "吸塑盒"),
  pet桶: bilingual("PET tub", "PET 桶"),
  条: bilingual("packs", "条"),
  袋: bilingual("bags", "袋"),
  包: bilingual("packs", "包"),
  盒: bilingual("boxes", "盒"),
  桶: bilingual("tubs", "桶"),
};

function packing(
  raw: string,
  row: number,
  warn: Warn,
): BilingualText | undefined {
  if (!raw || raw === "无包装数据") return;
  const by = /^(\d+)[只个]\s*[/／]\s*(.+)$/i.exec(raw);
  const count = /^(?:(\d+)[只个]\s*[*×]\s*)?(\d+)([条袋包盒桶])$/.exec(raw);
  if (by) {
    const kind = packageNames[by[2].toLowerCase()];
    if (kind)
      return bilingual(`${by[1]} pcs / ${kind.en}`, `${by[1]} 只 / ${kind.zh}`);
  }
  if (count) {
    const kind = packageNames[count[3]];
    return bilingual(
      `${count[1] ? count[1] + " pcs × " : ""}${count[2]} ${kind.en}`,
      `${count[1] ? count[1] + " 只 × " : ""}${count[2]} ${kind.zh}`,
    );
  }
  warn(row, "包装写法需核实：" + raw);
}

function weight(raw: string, row: number, name: string, warn: Warn) {
  if (!raw) return;
  const found = /^(\d+(?:\.\d+)?)\s*(g|kg)$/i.exec(raw);
  if (found) return found[1] + " " + found[2].toLowerCase();
  warn(row, `${name}缺少可确认的重量单位：${raw}`);
}

function outside(raw: string, row: number, name: string, warn: Warn) {
  if (!raw) return;
  const match =
    /^(\d+(?:[.,]\d+)?)\s*[*×]\s*(\d+(?:[.,]\d+)?)\s*[*×]\s*(\d+(?:[.,]\d+)?)\s*(mm|cm|m)?$/i.exec(
      raw,
    );
  if (!match) {
    warn(row, `${name}单位或尺寸写法需核实：${raw}`);
    return;
  }
  if (raw.includes(",")) warn(row, `${name}中的小数逗号统一为小数点：${raw}`);
  return (
    match
      .slice(1, 4)
      .map((value) => value.replace(",", "."))
      .join(" × ") + (match[4] ? " " + match[4].toLowerCase() : "")
  );
}

export function variantData(
  source: WorkbookVariant,
  shape: ProductShape,
  warn: Warn,
  options: {
    packagingOnly?: boolean;
    materialOption?: "silicone" | "greaseproof";
  } = {},
): SpecItem & { hasLid?: boolean } {
  const find = (col: number) =>
    source.lines.find(({ cells }) => cell(cells[col]));
  const measureRow = find(2);
  const materialRow = find(6);
  const unitWeightRow = find(8);
  const lidRow = find(13);
  const dimensions =
    measureRow && !options.packagingOnly
      ? parseDimensions(cell(measureRow.cells[2]), shape)
      : { shape };
  const material = parseMaterial(
    cell(materialRow?.cells[6]),
    options.materialOption,
  );
  const packages = source.lines
    .map(({ row, cells }) => ({
      packaging: packing(cell(cells[3]), row, warn),
      cartonLoading: packing(cell(cells[5]), row, warn),
      packWeight: weight(cell(cells[9]), row, "单包重量", warn),
      packSize: outside(cell(cells[10]), row, "单包尺寸", warn),
      cartonWeight: weight(cell(cells[11]), row, "单件重量", warn),
      cartonSpec: outside(cell(cells[12]), row, "外箱规格", warn),
    }))
    .filter((pack) => Object.values(pack).some(Boolean));
  const lids = new Set(
    source.lines.map(({ cells }) => cell(cells[13])).filter(Boolean),
  );
  if (lids.size > 1) throw new Error("同一规格的盖子选项冲突：" + source.row);
  return {
    ...dimensions,
    ...material,
    unitWeight:
      unitWeightRow &&
      weight(cell(unitWeightRow.cells[8]), unitWeightRow.row, "单个重量", warn),
    packages: packages.length ? packages : undefined,
    hasLid: lidRow ? cell(lidRow.cells[13]) === "是" : undefined,
  };
}
