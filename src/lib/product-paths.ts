import type { GetStaticPaths } from "astro";
import { getProducts, getVisibleCategories } from "./products";
export const getCategoryPaths = (async () => {
  const products = await getProducts();
  return (await getVisibleCategories()).map((category) => ({
    params: { category: category.id },
    props: {
      category,
      products: products.filter(({ data }) => data.category === category.id),
    },
  }));
}) satisfies GetStaticPaths;
export const getProductPaths = (async () => {
  const products = await getProducts();
  return products.map((product) => ({
    params: { category: product.data.category, slug: product.data.slug },
    props: {
      product,
      related: products
        .filter(
          (item) =>
            item.data.category === product.data.category &&
            item.data.slug !== product.data.slug,
        )
        .slice(0, 4),
    },
  }));
}) satisfies GetStaticPaths;
