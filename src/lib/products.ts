import { getCollection, type CollectionEntry } from "astro:content";
import { confirmedLocalized, localized, t, type Locale } from "../i18n/utils";
import { visibleCategories } from "./category-visibility";
import { confirmedText } from "./placeholders";
export { productHref } from "../i18n/routing";

export type Product = CollectionEntry<"products">;
export type ProductData = Product["data"];
export type ProductCategory = CollectionEntry<"categories">["data"] & {
  id: string;
};

export async function getCategories(): Promise<ProductCategory[]> {
  const categories = await getCollection("categories");
  for (const category of categories) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category.id))
      throw new Error("分类文件名必须是小写字母数字与连字符：" + category.id);
  }
  return categories
    .map(({ id, data }) => ({ id, ...data }))
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

export async function getProducts(): Promise<Product[]> {
  const products = await getCollection("products");
  const categories = new Set((await getCategories()).map(({ id }) => id));
  const slugs = new Set<string>();
  const skus = new Set<string>();
  for (const { id, data } of products) {
    if (id !== data.slug) throw new Error("产品文件名必须与 slug 一致：" + id);
    if (!categories.has(data.category))
      throw new Error("未知产品分类：" + data.category);
    if (slugs.has(data.slug) || skus.has(data.sku))
      throw new Error("产品 slug 和 sku 必须唯一：" + data.slug);
    slugs.add(data.slug);
    skus.add(data.sku);
  }
  return products.sort(
    (a, b) =>
      a.data.order - b.data.order ||
      String(localized(a.data.title, "en")).localeCompare(
        String(localized(b.data.title, "en")),
      ),
  );
}

export async function getVisibleCategories(): Promise<ProductCategory[]> {
  return visibleCategories(await getCategories(), await getProducts());
}

export async function getProductCategory(id: string): Promise<ProductCategory> {
  const category = (await getCategories()).find((item) => item.id === id);
  if (!category) throw new Error("未知产品分类：" + id);
  return category;
}

export function inquiryProduct(data: ProductData, locale: Locale) {
  return {
    slug: data.slug,
    title:
      confirmedLocalized(data.title, locale) ??
      t("inquiry.productName", locale),
    sku: confirmedText(data.sku),
    category: data.category,
  };
}
export function sizeSummary(
  sizes: ProductData["sizes"],
  locale: Locale = "en",
) {
  for (const size of sizes) {
    if (
      typeof size.baseDiameterMm === "number" &&
      typeof size.heightMm === "number"
    )
      return t("products.sizeSummary", locale, {
        base: size.baseDiameterMm,
        height: size.heightMm,
      });
    const specification = confirmedLocalized(size.specification, locale);
    if (specification) return specification;
  }
}
