interface Category {
  id: string;
  order: number;
  showOnHome: boolean;
}
interface CategorizedProduct {
  data: { category: string };
}

export function visibleCategories<T extends Category>(
  categories: readonly T[],
  products: readonly CategorizedProduct[],
): T[] {
  const occupied = new Set(products.map(({ data }) => data.category));
  return categories
    .filter(({ id }) => occupied.has(id))
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

export function homeCategories<T extends Category>(
  categories: readonly T[],
  products: readonly CategorizedProduct[],
) {
  const eligible = visibleCategories(categories, products).filter(
    ({ showOnHome }) => showOnHome,
  );
  return { categories: eligible.slice(0, 6), hasMore: eligible.length > 6 };
}
