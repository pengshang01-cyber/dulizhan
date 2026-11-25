import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";
import readWorkbook, { type Row } from "read-excel-file/node";
import {
  excludedShops,
  imagePath,
  importCategories,
  productFamilies,
} from "./product-import-groups.ts";
import {
  bilingual,
  sizeName,
  sourceDimensions,
  translateMaterial,
  translateOptions,
  translatePacking,
  type Bilingual,
  type SourceRow,
} from "./product-import-specs.ts";
import { importSpecs2026 } from "./product-specs-2026.ts";

const productHeaders = [
  "产品名称",
  "型号",
  "所属分类",
  "材质",
  "克重(g)",
  "底径(mm)",
  "高度(mm)",
  "口径(mm)",
  "颜色",
  "图案",
  "起订量",
  "包装方式",
  "外箱尺寸(cm)",
  "交期",
  "可定制",
  "照片已准备",
  "备注",
];

function cellText(value: Row[number]) {
  if (value == null) return "";
  if (typeof value !== "number" && typeof value !== "string")
    throw new Error("产品来源列只接受文字或数字");
  return String(value).trim();
}

function measurement(value: string, field: string, row: number) {
  if (!value) return undefined;
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0)
    throw new Error(`第 ${row} 行 ${field} 不是正数`);
  return number;
}

export function readSourceRows(sheet: Row[]) {
  const [header, ...body] = sheet;
  if (
    !header ||
    productHeaders.some((label, i) => label !== cellText(header[i]))
  )
    throw new Error("「产品资料」表头与导入列约定不一致");
  return body.flatMap((record, index): SourceRow[] => {
    const row = index + 2;
    if (record.every((cell) => cell == null || cell === "")) return [];
    const [
      title,
      model,
      shop,
      material,
      weight,
      base,
      height,
      top,
      color,
      pattern,
      moq,
      packaging,
      carton,
      lead,
      customizable,
      ,
      note,
    ] = productHeaders.map((_, i) => cellText(record[i]));
    if (!title || !shop || !["", "是", "否"].includes(customizable))
      throw new Error(`「产品资料」第 ${row} 行缺名称或类目，或定制值无效`);
    const gsm =
      weight && /^[\d.]+$/.test(weight)
        ? measurement(weight, "克重", row)
        : weight || undefined;
    if (
      typeof gsm === "string" &&
      !/^\d+(?:\.\d+)?(?:\s*[–/-]\s*\d+(?:\.\d+)?)+$/.test(gsm)
    )
      throw new Error(`第 ${row} 行克重范围或选项格式不正确`);
    return [
      {
        row,
        title,
        model,
        shop,
        material,
        gsm,
        baseDiameterMm: measurement(base, "底径", row),
        heightMm: measurement(height, "高度", row),
        topDiameterMm: measurement(top, "口径", row),
        color,
        pattern,
        moq,
        packaging,
        carton,
        lead,
        customizable,
        note,
        quote: title.endsWith("· 报价款"),
      },
    ];
  });
}

const categoryByShop = new Map<string, (typeof importCategories)[number]>();
for (const category of importCategories) {
  for (const shop of category[6]) {
    if (categoryByShop.has(shop))
      throw new Error("重复的店铺类目映射：" + shop);
    categoryByShop.set(shop, category);
  }
}
const excluded = new Set<string>(excludedShops);
type Group = {
  shop: string;
  category: (typeof importCategories)[number];
  slug: string;
  title: Bilingual;
  rows: SourceRow[];
};

export function planGroups(rows: SourceRow[]) {
  const groups = new Map<string, Group>();
  const mappings = new Map<number, Group>();
  for (const row of rows) {
    if (excluded.has(row.shop)) continue;
    const category = categoryByShop.get(row.shop);
    if (!category)
      throw new Error(`第 ${row.row} 行店铺类目尚无映射：${row.shop}`);
    const candidates = productFamilies[row.shop]?.filter(([pattern]) =>
      pattern.test(`${row.title}|${row.material}|`),
    );
    if (candidates?.length !== 1)
      throw new Error(
        `第 ${row.row} 行需确认唯一产品组：${row.title}（匹配 ${candidates?.length ?? 0} 组）`,
      );
    const [, slug, en, zh] = candidates[0];
    const group = groups.get(slug) ?? {
      shop: row.shop,
      category,
      slug,
      title: bilingual(en, zh),
      rows: [],
    };
    if (
      group.shop !== row.shop ||
      group.rows.some((item) => item.material !== row.material)
    )
      throw new Error(`产品组混入不同类目或材质：${slug}，第 ${row.row} 行`);
    group.rows.push(row);
    groups.set(slug, group);
    mappings.set(row.row, group);
  }
  return { groups: [...groups.values()], mappings };
}

function verifyIndex(sheet: Row[]) {
  const header = sheet.findIndex(
    (row) =>
      cellText(row[0]) === "店铺类目" &&
      cellText(row[1]) === "英文参考名称" &&
      cellText(row[2]) === "资料类型",
  );
  if (header < 0) throw new Error("缺少「类目索引」的类目和资料类型表头");
  const shopTypes = new Map<string, string>();
  for (const row of sheet.slice(header + 1)) {
    const shop = cellText(row[0]);
    const type = cellText(row[2]);
    if (!shop || type === "网站素材") continue;
    if (shopTypes.has(shop)) throw new Error("类目索引有重复项：" + shop);
    shopTypes.set(shop, type);
  }
  for (const shop of categoryByShop.keys()) {
    if (shopTypes.get(shop) !== "产品")
      throw new Error("索引未标记为产品：" + shop);
  }
  for (const shop of excluded) {
    if (!["展示／待核", "素材合辑"].includes(shopTypes.get(shop) ?? ""))
      throw new Error("索引未标记为展示／待核或素材合辑：" + shop);
  }
  if (shopTypes.size !== categoryByShop.size + excluded.size)
    throw new Error("类目索引含未分配的店铺类目");
}

type Variant = {
  records: SourceRow[];
  dimensions: ReturnType<typeof sourceDimensions>;
  name: Bilingual;
};

function variantsFor(rows: SourceRow[]) {
  const variants: Variant[] = [];
  for (const row of [
    ...rows.filter((item) => !item.quote),
    ...rows.filter((item) => item.quote),
  ]) {
    const dimensions = sourceDimensions(row);
    const name = sizeName(row, dimensions);
    const size = { records: [row], dimensions, name };
    // 报价只与明确的相同外形和尺寸对应；不同口径、克重保留为独立规格。
    const matches = row.quote
      ? variants.filter((existing) => {
          const original = existing.records[0]!;
          const sameFootprint = dimensions
            ? dimensions.key === existing.dimensions?.key
            : row.baseDiameterMm !== undefined &&
              row.baseDiameterMm === original.baseDiameterMm &&
              row.heightMm !== undefined &&
              row.heightMm === original.heightMm;
          return (
            sameFootprint &&
            (!row.heightMm ||
              !original.heightMm ||
              row.heightMm === original.heightMm) &&
            (!row.topDiameterMm ||
              !original.topDiameterMm ||
              row.topDiameterMm === original.topDiameterMm) &&
            (!dimensions?.rim ||
              !existing.dimensions?.rim ||
              dimensions.rim === existing.dimensions.rim) &&
            (!row.gsm ||
              !original.gsm ||
              row.gsm === original.gsm ||
              (typeof original.gsm === "string" &&
                original.gsm.includes("/") &&
                original.gsm
                  .split("/")
                  .some((weight) => Number(weight) === row.gsm)))
          );
        })
      : [];
    if (matches.length === 1) {
      matches[0]!.records.push(row);
      if (dimensions?.rim && !matches[0]!.dimensions?.rim)
        matches[0]!.dimensions = dimensions;
    } else {
      variants.push(size);
    }
  }
  return variants;
}

const isScoped = (row: SourceRow) =>
  row.quote || Boolean(row.moq || row.carton || row.lead);

function agreedValue<K extends "gsm" | "packaging" | "customizable">(
  rows: SourceRow[],
  field: K,
) {
  const values = new Set(rows.map((row) => row[field]));
  return values.size === 1 ? rows[0]?.[field] : undefined;
}

function packingDetails(
  variants: Variant[],
  commonPackaging: string | undefined,
) {
  const lines = variants.flatMap(({ records, name }) =>
    records.flatMap((row) => {
      const scoped = isScoped(row);
      if ((!row.packaging || commonPackaging) && !scoped) return [];
      const label =
        name.en === "TODO_SIZE_NAME"
          ? bilingual("This option", "此规格")
          : name;
      const pack = row.packaging ? translatePacking(row.packaging) : undefined;
      const moq = row.moq ? translatePacking(row.moq) : undefined;
      const carton = row.carton ? bilingual(`${row.carton} cm`) : undefined;
      const quotedWeight =
        row.quote && row.gsm && row.gsm !== records[0]!.gsm
          ? `${row.gsm} g/m²`
          : undefined;
      const time = row.lead.match(/^(\d+(?:[–-]\d+)?)\s*个?工作日$/);
      if (row.lead && !time)
        throw new Error(`第 ${row.row} 行交期待翻译：${row.lead}`);
      return [
        bilingual(
          `${label.en}${scoped ? " (quoted specification)" : ""} — ${[
            pack && pack.en,
            quotedWeight,
            moq && `MOQ ${moq.en}`,
            carton && `Carton ${carton.en}`,
            time && `Lead time ${time[1]} working days`,
          ]
            .filter(Boolean)
            .join(" · ")}`,
          `${label.zh}${scoped ? "（该规格报价）" : ""} — ${[
            pack && `包装 ${pack.zh}`,
            quotedWeight && `纸张克重 ${quotedWeight}`,
            moq && `起订量 ${moq.zh}`,
            carton && `外箱 ${carton.zh}`,
            time && `交期 ${row.lead}`,
          ]
            .filter(Boolean)
            .join(" · ")}`,
        ),
      ];
    }),
  );
  if (lines.length)
    return bilingual(
      lines.map((line) => line.en).join("\n"),
      lines.map((line) => line.zh).join("\n"),
    );
}

function productSummary(
  title: Bilingual,
  material: Bilingual,
  category: Group["category"],
) {
  return material.en !== "TODO_MATERIAL"
    ? bilingual(
        `${title.en} made from ${material.en.replace(/^[A-Z](?=[a-z])/, (letter) => letter.toLowerCase())}.`,
        `${title.zh}，材质为 ${material.zh}。`,
      )
    : bilingual(
        `${title.en} in the ${category[1].toLowerCase()} range.`,
        `${title.zh}，属于${category[2]}系列。`,
      );
}

export function productEntry(group: Group, order: number) {
  const { rows, slug, category, title } = group;
  const variants = variantsFor(rows);
  const pack = rows.some(isScoped) ? undefined : agreedValue(rows, "packaging");
  const gsm = agreedValue(rows, "gsm");
  const custom = agreedValue(rows, "customizable");
  const material = translateMaterial(rows[0]!.material);
  const sku =
    variants.length === 1
      ? variants[0]?.records.find((row) => row.model)?.model
      : undefined;
  const sizes = variants.map(({ records, dimensions, name }) => {
    const {
      baseDiameterMm,
      heightMm,
      topDiameterMm,
      gsm: sizeGsm,
      title: sourceTitle,
    } = records[0]!;
    const shape =
      baseDiameterMm !== undefined && /船型/.test(sourceTitle)
        ? bilingual(
            `Base ${baseDiameterMm} mm${heightMm ? `, height ${heightMm} mm` : ""}`,
            `底部 ${baseDiameterMm} mm${heightMm ? `，高度 ${heightMm} mm` : ""}`,
          )
        : dimensions?.description;
    const detail =
      !gsm && sizeGsm
        ? bilingual(`Paper weight ${sizeGsm} g/m²`, `纸张克重 ${sizeGsm} g/m²`)
        : undefined;
    const specification =
      shape || detail
        ? bilingual(
            [shape?.en, detail?.en].filter(Boolean).join(" · "),
            [shape?.zh, detail?.zh].filter(Boolean).join(" · "),
          )
        : undefined;
    return {
      name,
      baseDiameterMm: /船型/.test(sourceTitle) ? undefined : baseDiameterMm,
      heightMm,
      topDiameterMm:
        topDiameterMm ??
        records.find((row) => row.topDiameterMm)?.topDiameterMm,
      specification,
    };
  });
  const summary = productSummary(title, material, category);
  return {
    sku: sku || `TODO_SKU_${slug.toUpperCase().replaceAll("-", "_")}`,
    slug,
    category: category[0] + ".json",
    title,
    summary,
    images: [{ image: imagePath(category) }],
    material,
    gsm: gsm ?? "TODO_GSM",
    sizes,
    colors: translateOptions(rows.map((row) => row.color)),
    patterns: translateOptions(rows.map((row) => row.pattern)),
    customizable:
      custom === "是" ? true : custom === "否" ? false : "TODO_CUSTOMIZABLE",
    packaging: pack ? translatePacking(pack) : undefined,
    packagingDetails: packingDetails(variants, pack),
    seoTitle: title,
    seoDescription: summary,
    featured: false,
    order,
  };
}

const quoteCsv = (value: number | string) =>
  '"' +
  String(value)
    .replace(/^[=+\-@\t\r]/, "'$&")
    .replaceAll('"', '""') +
  '"';
const csvRow = (values: (number | string)[]) => values.map(quoteCsv).join(",");
const tableText = (value: string) =>
  value.replaceAll("|", "\\|").replace(/\r?\n/g, " ");

async function run() {
  const args = process.argv.slice(2);
  if (
    args.some((arg) => arg !== "--plan" && arg !== "--legacy") ||
    new Set(args).size !== args.length
  )
    throw new Error("用法：npm run import:products [-- --plan] [-- --legacy]");
  const planOnly = args.includes("--plan");
  const root = fileURLToPath(new URL("../", import.meta.url));
  if (!args.includes("--legacy")) {
    const { summary, changes, warnings, held } = await importSpecs2026(
      root,
      planOnly,
    );
    console.log(
      JSON.stringify({
        ...summary,
        changes: changes.length,
        warnings: warnings.length,
        held,
      }),
    );
    return;
  }
  const workbook = await readWorkbook(
    resolve(root, "data-import/junbeili-products.xlsx"),
  );
  function sheet(name: string) {
    const found = workbook.find(({ sheet }) => sheet === name);
    if (!found) throw new Error("工作簿缺工作表：" + name);
    return found.data;
  }
  const rows = readSourceRows(sheet("产品资料"));
  verifyIndex(sheet("类目索引"));
  if (
    !sheet("公司资料").some(
      (row) =>
        cellText(row[1]) === "项目" && cellText(row[2]).startsWith("填写内容"),
    )
  )
    throw new Error("「公司资料」缺少项目或填写内容列");
  const { groups, mappings } = planGroups(rows);
  const entries = groups.map((group, index) => productEntry(group, index + 1));
  if (new Set(entries.map((entry) => entry.sku)).size !== entries.length)
    throw new Error("不同产品存在同一型号，需核对工作簿");
  for (const category of importCategories) {
    await access(resolve(root, "src/content/categories", imagePath(category)));
    if (!groups.some((group) => group.category === category))
      throw new Error("本轮分类缺产品：" + category[0]);
  }

  const docs = resolve(root, "docs/import");
  await mkdir(docs, { recursive: true });
  const csv = [
    csvRow([
      "原行号",
      "原产品名称",
      "店铺类目",
      "网站分类",
      "合并后产品网址片段",
      "合并后英文名称",
    ]),
    ...rows.map((row) => {
      const mapped = mappings.get(row.row);
      return csvRow([
        row.row,
        row.title,
        row.shop,
        mapped?.category[0] ?? "",
        mapped?.slug ?? "",
        mapped?.title.en ?? "",
      ]);
    }),
  ].join("\n");
  await writeFile(resolve(docs, "product-grouping.csv"), "\uFEFF" + csv + "\n");
  const images = [
    "# 待补产品图片",
    "按产品网址片段上传对应实拍。每个产品先选一张主图，再按需补充不同规格的细节图。图片路径从工厂电脑的原店铺类目查找。",
    "| 产品网址片段 | 中文名称 | 英文名称 | 店铺类目 | 本地素材目录 |",
    "| --- | --- | --- | --- | --- |",
    ...groups.map(
      ({ slug, title, shop }) =>
        `| \`${slug}\` | ${tableText(title.zh)} | ${tableText(title.en)} | ${shop} | \`E:\\1688店铺图\\${shop}\` |`,
    ),
  ];
  const imagesDoc = resolve(docs, "images-needed.md");
  const prettier = await resolveConfig(imagesDoc);
  await writeFile(
    imagesDoc,
    await format(
      images.slice(0, 3).join("\n\n") +
        "\n" +
        images.slice(3).join("\n") +
        "\n",
      {
        ...prettier,
        filepath: imagesDoc,
      },
    ),
  );

  if (!planOnly) {
    async function existingContent(path: string): Promise<{
      draft?: boolean;
      image?: string;
      imageAlt?: unknown;
      images?: unknown[];
    }> {
      try {
        return JSON.parse(await readFile(resolve(root, path), "utf8"));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
        throw error;
      }
    }
    async function json(path: string, value: unknown) {
      const filepath = resolve(root, path);
      await writeFile(
        filepath,
        await format(JSON.stringify(value), { ...prettier, filepath }),
      );
    }
    for (const [index, category] of importCategories.entries()) {
      const [id, en, zh, aboutEn, aboutZh] = category;
      const path = `src/content/categories/${id}.json`;
      const media = await existingContent(path);
      await json(path, {
        label: bilingual(en, zh),
        summary: bilingual(aboutEn, aboutZh),
        image: media.image || imagePath(category),
        imageAlt: media.imageAlt,
        order: index + 1,
        showOnHome: index < 6,
      });
    }
    for (const entry of entries) {
      const path = `src/content/products/${entry.slug}.json`;
      const { draft, images } = await existingContent(path);
      await json(path, {
        ...entry,
        images: images?.length ? images : entry.images,
        draft,
      });
    }
  }
  console.log(
    JSON.stringify(
      {
        mode: args[0] === "--plan" ? "plan" : "import",
        source: rows.length,
        excluded: rows.length - mappings.size,
        included: mappings.size,
        products: groups.length,
        variants: entries.reduce(
          (total, product) => total + product.sizes.length,
          0,
        ),
        missingSourceModel: rows.filter(
          (row) => mappings.has(row.row) && !row.model,
        ).length,
        missingSharedProductModel: entries.filter(({ sku }) =>
          sku.startsWith("TODO_"),
        ).length,
        categories: importCategories.map(([id]) => {
          const selected = groups.filter((group) => group.category[0] === id);
          return {
            id,
            rows: selected.reduce(
              (total, group) => total + group.rows.length,
              0,
            ),
            products: selected.length,
          };
        }),
      },
      null,
      2,
    ),
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await run();
