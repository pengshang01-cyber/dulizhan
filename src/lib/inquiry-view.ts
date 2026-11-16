import type { InquiryItem, InquiryProduct } from "./inquiry";

// 页面只投影当前语言的目录资料，不改写跨语言共用的存储。
export function readInquiryCatalog(
  value: string | undefined,
): Map<string, InquiryProduct> {
  try {
    const rows: unknown = JSON.parse(value ?? "[]");
    if (!Array.isArray(rows)) return new Map();
    return new Map(
      rows
        .filter(
          (row): row is InquiryProduct =>
            row &&
            ["slug", "sku", "title", "category"].every(
              (key) => typeof row[key] === "string",
            ),
        )
        .map((row) => [row.slug, row]),
    );
  } catch {
    return new Map();
  }
}
export function inquiryDisplayItem(
  item: InquiryItem,
  catalog: Map<string, InquiryProduct>,
): InquiryItem {
  const current = catalog.get(item.slug);
  return current ? { ...item, ...current, quantity: item.quantity } : item;
}
