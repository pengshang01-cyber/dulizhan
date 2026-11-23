import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import readWorkbook from "read-excel-file/node";
import { format, resolveConfig } from "prettier";
import {
  bilingual,
  productMapping,
  unmatched,
  type BilingualText,
  type ImportVariant,
  type ProductShape,
} from "./product-specs-mapping.ts";
import {
  variantData,
  workbookVariants,
  type ProductSize,
  type SizeDimensions,
  type SpecItem,
  type WorkbookVariant,
} from "./product-specs-source.ts";
import {
  confirmedColors,
  useColorRequest,
  type CatalogColor,
} from "./product-specs-colors.ts";
import { imagePath, importCategories } from "./product-import-groups.ts";

interface ProductFile {
  sku: string;
  slug: string;
  category: string;
  title: BilingualText;
  summary: BilingualText;
  seoTitle?: BilingualText;
  seoDescription?: BilingualText;
  order: number;
  images: unknown[];
  material: BilingualText;
  gsm: number | string;
  sizes: ProductSize[];
  packaging?: BilingualText;
  cartonSpec?: BilingualText;
  packagingDetails?: BilingualText;
  colors: (BilingualText | CatalogColor)[];
  moreColorsOnRequest?: boolean;
  [key: string]: unknown;
}

interface Change {
  rows: string;
  product: string;
  field: string;
  before: string;
  after: string;
}

const shapeFields = [
  ["diameterMm", "直径"],
  ["baseDiameterMm", "底径"],
  ["topDiameterMm", "口径"],
  ["baseLengthMm", "底部长"],
  ["baseWidthMm", "底部宽"],
  ["topLengthMm", "顶部长"],
  ["topWidthMm", "顶部宽"],
  ["length", "长"],
  ["width", "宽"],
  ["heightMm", "高度"],
  ["lowHeightMm", "低边高度"],
  ["highHeightMm", "高边高度"],
  ["topWideMm", "杯口宽处"],
  ["topNarrowMm", "杯口窄处"],
] as const;
const dimensionsOnly = (data: SizeDimensions) =>
  shapeFields.filter(([key]) => typeof data[key] === "number");
const isConfirmed = (value: unknown) =>
  value != null && String(value).trim() !== "" && !/^TODO_/.test(String(value));
const normalize = (value: string) => value.replace(/\s/g, "").toLowerCase();
const nonempty = <T extends object>(value: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  ) as Partial<T>;
const unique = <T>(data: T[]) => [
  ...new Map(data.map((item) => [JSON.stringify(item), item])).values(),
];

function legacyShape(
  product: ProductFile,
  size: ProductSize,
): ProductShape | undefined {
  const { slug, category } = product;
  if (slug.endsWith("-rolls")) return "roll";
  if (
    category === "baking-wrapping-paper.json" ||
    category === "cake-boards.json"
  )
    return "sheet";
  if (/rectangular|square|paper-box|window-cake-box/.test(slug))
    return "rectangular";
  if (
    /boat|oblong|flame|flower|lotus|tulip|straw-hat|triangular|leaf|hexagonal/.test(
      slug,
    )
  )
    return "shaped";
  if (size.baseDiameterMm || size.topDiameterMm) return "round";
}

// 结构化已有精确的几何说明。保留未标明轴向或仅提供范围的旧资料。
export function migrateSize(
  product: ProductFile,
  size: ProductSize,
): ProductSize {
  if (size.shape) return size;
  const specification = size.specification?.en ?? "";
  const shape = legacyShape(product, size);
  const result = { ...size, shape };
  const paper = /^Paper weight (.+) g\/m²$/.exec(specification);
  const roll =
    /^Width × roll length (\d+(?:\.\d+)?) (mm|cm|m) × (\d+(?:\.\d+)?) (mm|cm|m)$/.exec(
      specification,
    );
  const box =
    /^Base (\d+(?:\.\d+)?)×(\d+(?:\.\d+)?) mm(?:, top (\d+(?:\.\d+)?)×(\d+(?:\.\d+)?) mm)?(?:, height (\d+(?:\.\d+)?) mm)?$/.exec(
      specification,
    );
  const overall =
    /^(\d+(?:\.\d+)?)×(\d+(?:\.\d+)?)(?:×(\d+(?:\.\d+)?))? (mm|cm)$/.exec(
      specification,
    );
  const diameter = /^Diameter (\d+(?:\.\d+)?) mm$/.exec(specification);
  if (roll) {
    result.shape = "roll";
    result.width = Number(roll[1]);
    result.widthUnit = roll[2] as SizeDimensions["widthUnit"];
    result.length = Number(roll[3]);
    result.lengthUnit = roll[4] as SizeDimensions["lengthUnit"];
  } else if (box) {
    result.shape = shape ?? "rectangular";
    result.baseLengthMm = Number(box[1]);
    result.baseWidthMm = Number(box[2]);
    if (box[3] && box[4]) {
      result.topLengthMm = Number(box[3]);
      result.topWidthMm = Number(box[4]);
    }
    if (box[5]) result.heightMm = Number(box[5]);
  } else if (overall && !/hexagonal/.test(product.slug)) {
    result.shape = shape ?? "rectangular";
    result.length = Number(overall[1]);
    result.width = Number(overall[2]);
    result.lengthUnit = overall[4] as SizeDimensions["lengthUnit"];
    result.widthUnit = result.lengthUnit;
    if (overall[3] && overall[4] === "mm") result.heightMm = Number(overall[3]);
  } else if (diameter) {
    result.shape = "round";
    result.diameterMm = Number(diameter[1]);
  } else if (paper) result.paperWeight = Number(paper[1]) || paper[1];
  else if (shape === "sheet" && typeof size.baseDiameterMm === "number") {
    result.shape = "round";
    result.diameterMm = size.baseDiameterMm;
    delete result.baseDiameterMm;
  } else return result;
  delete result.specification;
  return result;
}

function dimensionName(size: SpecItem) {
  const {
    baseLengthMm,
    baseWidthMm,
    length,
    width,
    heightMm,
    baseDiameterMm,
    diameterMm,
  } = size;
  if (baseLengthMm && baseWidthMm) return `${baseLengthMm} × ${baseWidthMm} mm`;
  if (length && width) {
    const unit = size.lengthUnit ?? "mm";
    return `${length} × ${width}${heightMm && unit === "mm" ? " × " + heightMm : ""} ${unit}`;
  }
  if (diameterMm) return `Ø ${diameterMm} mm`;
  if (baseDiameterMm && heightMm) return `${baseDiameterMm} × ${heightMm} mm`;
}

function sizeName(
  source: WorkbookVariant,
  item: SpecItem,
  group: (typeof productMapping)[number],
) {
  const model = /^(\d{4})(?=.*(?:卷口杯|花边杯))/.exec(source.name)?.[1];
  if (model) return bilingual(model);
  const nominal = /^(\d+(?:\.\d+)?)\s*cm/i.exec(source.name)?.[1];
  const dimensions = dimensionName(item);
  if (nominal && group.nominalRound)
    return bilingual(`${nominal} cm · ${dimensions}`);
  if (nominal && /cupcake-liners|liner-extra-sizes/.test(group.slug))
    return bilingual(`${nominal} cm blank`, `${nominal} cm 展开规格`);
  return bilingual(dimensions ?? nominal ?? "TODO_SIZE_NAME");
}

function findSize(
  sizes: ProductSize[],
  source: ImportVariant,
  name: BilingualText,
  incoming: SpecItem,
  single: boolean,
) {
  const named = sizes.findIndex((size) =>
    [name.en, source.previous].some(
      (label) => label && normalize(label) === normalize(size.name.en),
    ),
  );
  if (named >= 0) return named;
  const comparable = dimensionsOnly(incoming);
  if (
    comparable.length > 1 ||
    (comparable.length === 1 && comparable[0][0] === "diameterMm")
  ) {
    const matches = sizes
      .map((size, index) => ({ size, index }))
      .filter(({ size }) => {
        const common = comparable.filter(
          ([key]) => typeof size[key] === "number",
        );
        return (
          common.length >= Math.min(comparable.length, 2) &&
          common.every(([key]) => size[key] === incoming[key])
        );
      });
    if (matches.length === 1) return matches[0].index;
  }
  if (single && sizes.length === 1 && !source.packagingOnly) return 0;
  if (
    source.packagingOnly &&
    sizes.length === 1 &&
    dimensionsOnly(sizes[0]).length === 0
  )
    return 0;
  return -1;
}

function comparableDimensions(before: ProductSize, after: SpecItem) {
  const output: [string, string | number, string | number][] = [];
  for (const [key, label] of shapeFields) {
    const old = before[key];
    const value = after[key];
    if (typeof old === "number" && typeof value === "number" && old !== value) {
      const oldUnit =
        key === "length"
          ? before.lengthUnit
          : key === "width"
            ? before.widthUnit
            : "mm";
      const unit =
        key === "length"
          ? after.lengthUnit
          : key === "width"
            ? after.widthUnit
            : "mm";
      output.push([
        label,
        `${old} ${oldUnit ?? "mm"}`,
        `${value} ${unit ?? "mm"}`,
      ]);
    }
  }
  if (
    typeof before.heightMm === "number" &&
    after.highHeightMm &&
    before.heightMm !== after.highHeightMm
  )
    output.push([
      "高边高度",
      before.heightMm + " mm",
      after.highHeightMm + " mm",
    ]);
  if (
    typeof before.topDiameterMm === "number" &&
    after.topWideMm &&
    after.topNarrowMm
  )
    output.push([
      "杯口",
      "直径 " + before.topDiameterMm + " mm",
      `宽处 ${after.topWideMm} mm，窄处 ${after.topNarrowMm} mm`,
    ]);
  if (
    before.length &&
    before.width &&
    after.baseLengthMm &&
    after.baseWidthMm &&
    (before.length !== after.baseLengthMm || before.width !== after.baseWidthMm)
  )
    output.push([
      "长宽",
      `${before.length} × ${before.width} mm`,
      `底部 ${after.baseLengthMm} × ${after.baseWidthMm} mm`,
    ]);
  return output;
}

const quoteSuffix = /\s*\(quoted specification\)$|（该规格报价）$/;
function priorPackageMatches(prior: ProductSize, label: string) {
  const clean = normalize(label.replace(quoteSuffix, ""));
  if (
    [prior.name.en, prior.name.zh].some(
      (name) => typeof name === "string" && normalize(name) === clean,
    )
  )
    return true;
  // M9 的报价行有时用底径、高度和口径代替型号。
  const base = prior.baseDiameterMm ?? prior.baseLengthMm;
  const second = prior.baseDiameterMm ? prior.heightMm : prior.baseWidthMm;
  return (
    typeof base === "number" &&
    typeof second === "number" &&
    clean.startsWith(`${base}×${second}mm`) &&
    ((!clean.includes("ø") && !clean.includes("口径")) ||
      clean.endsWith(`${prior.topDiameterMm}mm`))
  );
}

function supersededPacking(
  details: BilingualText | undefined,
  replacements: { before: ProductSize; after: ProductSize }[],
) {
  if (!details) return undefined;
  const lines = (language: "en" | "zh") =>
    (details[language] || details.en)
      .split("\n")
      .flatMap((line) => {
        const [label, values] = line.split(" — ");
        const replaced = replacements.find(
          ({ before, after }) =>
            priorPackageMatches(before, label) ||
            priorPackageMatches(after, label),
        );
        if (!replaced || !values) return [line];
        const minimum = values
          .split(" · ")
          .find((part) => /^(?:MOQ|起订量)/.test(part));
        return minimum ? [`${replaced.after.name[language]} — ${minimum}`] : [];
      })
      .join("\n");
  const en = lines("en"),
    zh = lines("zh");
  return en ? bilingual(en, zh) : undefined;
}

function productIntro(title: BilingualText, material: BilingualText) {
  return isConfirmed(material.en)
    ? bilingual(
        `${title.en} made from ${material.en}.`,
        `${title.zh}，材质为 ${material.zh}。`,
      )
    : bilingual(
        `${title.en} for wholesale inquiries.`,
        `${title.zh}，欢迎咨询批发。`,
      );
}

function newProduct(
  group: (typeof productMapping)[number],
  order: number,
): ProductFile {
  if (!group.newProduct) throw new Error("匹配的现有产品不存在：" + group.slug);
  const {
    category,
    title,
    material = bilingual("TODO_MATERIAL", ""),
  } = group.newProduct;
  const categoryRecord = importCategories.find(([id]) => id === category);
  if (!categoryRecord) throw new Error("新增产品分类不存在：" + category);
  const summary = productIntro(title, material);
  return {
    sku: "TODO_SKU_" + group.slug.replaceAll("-", "_").toUpperCase(),
    slug: group.slug,
    category: category + ".json",
    title,
    summary,
    material,
    gsm: "TODO_GSM",
    images: [{ image: imagePath(categoryRecord) }],
    sizes: [],
    colors: [],
    patterns: [],
    customizable: "TODO_CUSTOMIZABLE",
    seoTitle: title,
    seoDescription: summary,
    featured: false,
    order,
  };
}

export async function importSpecs2026(root: string, planOnly: boolean) {
  const workbook = await readWorkbook(
    resolve(root, "data-import/product-specs-2026.xlsx"),
  );
  const sheet = workbook.find(({ sheet }) => sheet === "Sheet1");
  if (!sheet) throw new Error("规格表没有 Sheet1");
  const { variants, imageOnly } = workbookVariants(sheet.data);
  const folder = resolve(root, "src/content/products");
  const files = (await readdir(folder))
    .filter((file) => file.endsWith(".json"))
    .sort();
  const catalog = new Map<string, ProductFile>();
  for (const file of files) {
    const value = JSON.parse(
      await readFile(resolve(folder, file), "utf8"),
    ) as ProductFile;
    if (file !== value.slug + ".json")
      throw new Error("产品网址片段与文件名不符：" + file);
    catalog.set(value.slug, {
      ...value,
      sizes: value.sizes.map((size) => migrateSize(value, size)),
    });
  }

  const newSlugs = new Set(
    productMapping.filter((group) => group.newProduct).map(({ slug }) => slug),
  );
  const lastOrder = Math.max(
    ...[...catalog.values()]
      .filter(({ slug }) => !newSlugs.has(slug))
      .map(({ order }) => order),
  );
  const changes: Change[] = [];
  const warnings = new Set<string>();
  const reviewRows = new Map<number, Set<string>>();
  const additions = [];
  const colors = [];
  const unspecifiedColors = [];
  const colorExceptions = [];
  const matchedSizes = [];
  const warn = (row: number, text: string) =>
    warnings.add(`行 ${row}｜${text}`);
  const lookup = (id: number, slug: string) => {
    const source = variants.get(id);
    if (!source) throw new Error(`映射的规格 ${id} 不在规格表中：${slug}`);
    const destinations = reviewRows.get(id) ?? new Set<string>();
    destinations.add(slug);
    reviewRows.set(id, destinations);
    return source;
  };

  for (const group of productMapping) {
    const { slug } = group;
    if (group.newProduct)
      additions.push({
        slug,
        title: group.newProduct.title.zh,
        category: group.newProduct.category,
        rows: group.variants.map(({ id }) => variants.get(id)?.row),
      });
    const existed = catalog.get(slug);
    const product = existed ?? newProduct(group, lastOrder + additions.length);
    const originalMaterial = product.material;
    const originalPaperWeight = product.gsm;
    const sizes = [...product.sizes];
    const touched = new Set<number>();
    const packed = new Set<number>();
    const replacements: { before: ProductSize; after: ProductSize }[] = [];
    const materials: BilingualText[] = [];
    const paperWeights: (string | number)[] = [];

    for (const entry of group.variants) {
      const source = lookup(entry.id, slug);
      const rowRange = source.lines.map(({ row }) => row).join(", ");
      const incoming = variantData(source, group.shape, warn, {
        packagingOnly: entry.packagingOnly,
        materialOption: group.materialOption,
      });
      if (entry.packagingOnly && source.lines.some(({ cells }) => cells[2]))
        warn(
          source.row,
          `桶装条目的尺寸栏与零售包装有关或未标明测量部位，未用作纸托底径、口径或高度：${source.lines[0].cells[2]}`,
        );
      const name = entry.name ?? sizeName(source, incoming, group);
      const index = findSize(
        sizes,
        entry,
        name,
        incoming,
        group.variants.length === 1,
      );
      const current = sizes[index];
      const variantName =
        entry.name && isConfirmed(entry.name.en)
          ? entry.name
          : (current?.name ?? name);
      const effectiveIndex = index >= 0 ? index : sizes.length;
      const record = (
        field: string,
        before: string | number,
        after: string | number,
      ) => {
        if (
          !isConfirmed(before) ||
          normalize(String(before)) === normalize(String(after))
        )
          return;
        changes.push({
          rows: rowRange,
          product: slug,
          field: `${variantName.zh || variantName.en} · ${field}`,
          before: String(before),
          after: String(after),
        });
      };
      if (current) {
        for (const [label, oldValue, newValue] of comparableDimensions(
          current,
          incoming,
        ))
          record(label, oldValue, newValue);
        if (incoming.hasLid !== undefined && current.hasLid !== undefined)
          record(
            "是否有盖",
            current.hasLid ? "是" : "否",
            incoming.hasLid ? "是" : "否",
          );
        if (incoming.unitWeight)
          record("单个重量", current.unitWeight ?? "", incoming.unitWeight);
      }
      if (incoming.paperWeight !== undefined) {
        paperWeights.push(incoming.paperWeight);
        record(
          "纸张克重",
          current?.paperWeight ?? originalPaperWeight,
          incoming.paperWeight,
        );
      }
      if (incoming.material) materials.push(incoming.material);
      const next: ProductSize = {
        ...current,
        ...nonempty(incoming),
        name: variantName,
      };
      if (incoming.packages?.length) {
        const oldPacking =
          (product.packagingDetails?.zh || product.packagingDetails?.en)
            ?.split("\n")
            .filter((line) => {
              const [label, values] = line.split(" — ");
              return (
                values &&
                !/^起订量[^·]*$/.test(values) &&
                ((current && priorPackageMatches(current, label)) ||
                  priorPackageMatches(next, label))
              );
            }) ?? [];
        const priorPacking = [
          product.packaging?.zh,
          product.cartonSpec?.zh,
          ...oldPacking,
        ]
          .filter(Boolean)
          .join("；");
        if (!packed.has(effectiveIndex) && priorPacking) {
          const currentPacking = incoming.packages
            .map((pack) =>
              [pack.packaging?.zh, pack.cartonLoading?.zh, pack.cartonSpec]
                .filter(Boolean)
                .join(" · "),
            )
            .join("；");
          record("包装或装箱字段以新表覆盖", priorPacking, currentPacking);
        }
        if (current) replacements.push({ before: current, after: next });
      }

      if (incoming.highHeightMm) delete next.heightMm;
      if (incoming.topWideMm && incoming.topNarrowMm) delete next.topDiameterMm;
      if (incoming.baseLengthMm && incoming.baseWidthMm) {
        delete next.baseDiameterMm;
        if (current?.length === incoming.baseLengthMm || !incoming.length) {
          delete next.length;
          delete next.width;
          delete next.lengthUnit;
          delete next.widthUnit;
        }
      }
      if (incoming.diameterMm && /cake-cards$/.test(slug))
        delete next.baseDiameterMm;
      if (incoming.packages?.length) {
        next.packages = unique([
          ...(packed.has(effectiveIndex) ? (current?.packages ?? []) : []),
          ...incoming.packages,
        ]);
        packed.add(effectiveIndex);
      }
      if (entry.lid !== undefined) {
        const lid = lookup(entry.lid, slug);
        const items = variantData(lid, group.shape, warn);
        delete items.hasLid;
        next.lid = nonempty(items);
        next.hasLid = true;
      } else if (incoming.hasLid === false) delete next.lid;
      sizes[effectiveIndex] = next;
      touched.add(effectiveIndex);
      matchedSizes.push({ slug, row: source.row, name: variantName.en });
    }

    if (packed.size > 0) {
      const legacyPack = {
        packaging: product.packaging,
        cartonSpec:
          product.cartonSpec?.en === product.cartonSpec?.zh
            ? product.cartonSpec?.en
            : undefined,
      };
      if (legacyPack.packaging || legacyPack.cartonSpec)
        sizes.forEach((size, i) => {
          if (!packed.has(i) && !size.packages?.length)
            size.packages = [nonempty(legacyPack)];
        });
      delete product.packaging;
      if (legacyPack.cartonSpec) delete product.cartonSpec;
      product.packagingDetails = supersededPacking(
        product.packagingDetails,
        replacements,
      );
    }

    const grades = unique(paperWeights);
    // 若规格表只覆盖系列的一部分，原克重只能留在原来未变更的尺寸上。
    const remaining = sizes.filter(
      (size, i) => !touched.has(i) && isConfirmed(size.name.en),
    );
    if (
      grades.length === 1 &&
      (!remaining.length || grades[0] === originalPaperWeight)
    )
      product.gsm = grades[0];
    else if (
      grades.length &&
      isConfirmed(originalPaperWeight) &&
      grades.some((grade) => grade !== originalPaperWeight)
    ) {
      for (const size of remaining) size.paperWeight ??= originalPaperWeight;
      product.gsm = "TODO_GSM";
    }
    const knownMaterials = unique(materials);
    if (knownMaterials.length === 1) {
      const material = knownMaterials[0];
      product.material = material;
      if (
        isConfirmed(originalMaterial.en) &&
        originalMaterial.en !== material.en
      )
        changes.push({
          rows: group.variants
            .map(({ id }) => variants.get(id)!.row)
            .join(", "),
          product: slug,
          field: "材质",
          before: originalMaterial.zh || originalMaterial.en,
          after: material.zh,
        });
    }
    if (group.newTitle && product.title.en !== group.newTitle.en)
      changes.push({
        rows: group.variants.map(({ id }) => variants.get(id)!.row).join(", "),
        product: slug,
        field: "工艺分组名称",
        before: product.title.zh,
        after: group.newTitle.zh,
      });
    if (group.newTitle) product.title = group.newTitle;
    if (
      !existed ||
      group.newTitle ||
      originalMaterial.en !== product.material.en
    ) {
      product.summary = productIntro(product.title, product.material);
      product.seoTitle = product.title;
      product.seoDescription = product.summary;
    }
    const hasNamed = sizes.some(({ name }) => isConfirmed(name.en));
    product.sizes = hasNamed
      ? sizes.filter((size, i) => touched.has(i) || isConfirmed(size.name.en))
      : sizes;
    catalog.set(slug, product);
  }

  const held = [...variants.values()].flatMap(({ id, row, name }) => {
    const note = unmatched[id as keyof typeof unmatched];
    return note ? [{ row, id, name, note }] : [];
  });
  for (const id of variants.keys())
    if (!reviewRows.has(id) && !held.some((item) => item.id === id))
      throw new Error("发现未经审核匹配的规格序号：" + id);

  for (const product of catalog.values()) {
    const source = confirmedColors(product.slug);
    if (useColorRequest(product.slug)) {
      product.moreColorsOnRequest = true;
      colorExceptions.push({ slug: product.slug, name: product.title.zh });
    } else if (source.colors.length) {
      product.colors = source.colors;
      colors.push({ slug: product.slug, title: product.title.zh, ...source });
    } else {
      unspecifiedColors.push({ slug: product.slug, title: product.title.zh });
      product.colors = [];
    }
  }
  const records = [...catalog.values()].sort(
    (a, b) => a.order - b.order || a.slug.localeCompare(b.slug),
  );
  if (!planOnly) {
    const prettier = await resolveConfig(
      resolve(folder, records[0].slug + ".json"),
    );
    for (const product of records) {
      const filepath = resolve(folder, product.slug + ".json");
      const document = await format(JSON.stringify(product), {
        ...prettier,
        filepath,
      });
      await writeFile(filepath, document, "utf8");
    }
  }
  return {
    summary: {
      dataRows: sheet.data.length - 1,
      identifiers: variants.size,
      matchedIdentifiers: reviewRows.size,
      continuedRows: [...variants.values()].reduce(
        (total, source) => total + source.lines.length - 1,
        0,
      ),
      imageOnlyRows: imageOnly.length,
      existingProducts: records.length - additions.length,
      newProducts: additions.length,
      totalProducts: records.length,
      productsWithConfirmedColors: colors.length,
      colorExceptions: colorExceptions.length,
      productsWithUnconfirmedColors: unspecifiedColors.length,
    },
    changes: unique(changes),
    warnings: [...warnings].sort(
      (a, b) =>
        Number(a.split(" ")[1].split("｜")[0]) -
        Number(b.split(" ")[1].split("｜")[0]),
    ),
    held,
    imageOnly,
    additions,
    colors,
    unspecifiedColors,
    colorExceptions,
    matchedSizes,
    sources: [...variants.values()].map(({ id, row, lines, name }) => ({
      id,
      row,
      name,
      rows: lines.map((line) => line.row),
      products: [...(reviewRows.get(id) ?? [])],
    })),
  };
}
