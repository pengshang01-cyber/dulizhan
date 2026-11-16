import { describe, expect, it } from "vitest";
import { homeCategories, visibleCategories } from "./category-visibility";
const categories = [
  { id: "empty", order: 1, showOnHome: true },
  { id: "hidden-home", order: 3, showOnHome: false },
  { id: "visible", order: 2, showOnHome: true },
];
const products = [
  { data: { category: "visible" } },
  { data: { category: "hidden-home" } },
];
describe("category visibility", () => {
  it("hides empty categories and sorts occupied categories by order", () => {
    expect(visibleCategories(categories, products).map((c) => c.id)).toEqual([
      "visible",
      "hidden-home",
    ]);
    expect(categories[0]?.id).toBe("empty");
  });
  it("respects showOnHome while keeping the category in the full navigation", () => {
    expect(homeCategories(categories, products)).toEqual({
      categories: [categories[2]],
      hasMore: false,
    });
  });
  it("shows at most six home categories and flags additional eligible entries", () => {
    const many = Array.from({ length: 8 }, (_, index) => ({
      id: "category-" + index,
      order: index,
      showOnHome: true,
    }));
    const products = many.map(({ id }) => ({ data: { category: id } }));
    const result = homeCategories(many, products);
    expect(result.categories).toHaveLength(6);
    expect(result.hasMore).toBe(true);
    expect(homeCategories(many.slice(0, 6), products).hasMore).toBe(false);
  });
  it("handles no products and unknown product category references without showing empty categories", () => {
    expect(visibleCategories(categories, [])).toEqual([]);
    expect(
      visibleCategories(categories, [{ data: { category: "missing" } }]),
    ).toEqual([]);
    expect(homeCategories(categories, [])).toEqual({
      categories: [],
      hasMore: false,
    });
  });
});
