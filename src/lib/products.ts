import { localePath } from "../i18n/routing";
import { getCollection, type CollectionEntry } from "astro:content";
import { display, isTodo } from "../config/site";
import { localized, t, type Locale } from "../i18n/utils";
import { visibleCategories } from "./category-visibility";

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

export function productHref(
  product: Pick<ProductData, "category" | "slug">,
  locale: Locale = "en",
) {
  return localePath(
    "/products/" + product.category + "/" + product.slug + "/",
    locale,
  );
}
export function sizeSummary(
  sizes: ProductData["sizes"],
  locale: Locale = "en",
) {
  const size = sizes[0];
  if (!size || isTodo(size.baseDiameterMm) || isTodo(size.heightMm))
    return display("TODO_SIZE", t("products.todo.size", locale));
  return t("products.sizeSummary", locale, {
    base: size.baseDiameterMm,
    height: size.heightMm,
  });
}
export function measurementLabel(
  value: number | string | undefined,
  label: string,
  locale: Locale = "en",
) {
  if (value === undefined) return t("products.notSpecified", locale);
  return typeof value === "number"
    ? t("products.measurement", locale, { value })
    : display(value, label);
}
