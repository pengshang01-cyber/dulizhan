import { getCollection, type CollectionEntry } from "astro:content";
import { productCategories } from "../config/categories";
import { display, isTodo } from "../config/site";

export type Product = CollectionEntry<"products">;
export type ProductData = Product["data"];

export async function getProducts(): Promise<Product[]> {
  const products = await getCollection("products");
  const slugs = new Set<string>();
  const skus = new Set<string>();
  for (const { data } of products) {
    if (slugs.has(data.slug) || skus.has(data.sku)) {
      throw new Error("产品 slug 和 sku 必须唯一：" + data.slug);
    }
    slugs.add(data.slug);
    skus.add(data.sku);
  }
  return products.sort(
    (a, b) =>
      a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
  );
}

export function getProductCategory(id: ProductData["category"]) {
  const category = productCategories.find((item) => item.id === id);
  if (!category) throw new Error("未知产品分类：" + id);
  return category;
}

export function productHref(product: Pick<ProductData, "category" | "slug">) {
  return "/products/" + product.category + "/" + product.slug + "/";
}

export function sizeSummary(sizes: ProductData["sizes"]) {
  const size = sizes[0];
  if (!size || isTodo(size.baseDiameterMm) || isTodo(size.heightMm)) {
    return display("TODO_SIZE", "size");
  }
  return (
    "Base Ø " + size.baseDiameterMm + " mm · Height " + size.heightMm + " mm"
  );
}

export function measurementLabel(
  value: number | string | undefined,
  label: string,
) {
  if (value === undefined) return "—";
  return typeof value === "number" ? value + " mm" : display(value, label);
}
