import {
  readInquiryProduct,
  type InquiryItem,
  type InquiryProduct,
} from "./inquiry";

// 页面只投影当前语言的目录资料，不改写跨语言共用的存储。
export function readInquiryCatalog(
  value: string | undefined,
): Map<string, InquiryProduct> {
  try {
    const rows: unknown = JSON.parse(value ?? "[]");
    if (!Array.isArray(rows)) return new Map();
    return new Map(
      rows.flatMap((row) => {
        const product = readInquiryProduct(row);
        return product ? [[product.slug, product] as const] : [];
      }),
    );
  } catch {
    return new Map();
  }
}
export function inquiryDisplayItem(
  item: InquiryItem,
  catalog: Map<string, InquiryProduct>,
): InquiryItem {
  const current = catalog.get(item.slug) ?? item;
  const { slug, category } = current;
  return {
    ...(readInquiryProduct(current) ?? { slug, category, title: slug }),
    quantity: item.quantity,
    ...(item.designId ? { designId: item.designId } : {}),
  };
}
