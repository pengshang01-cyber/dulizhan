interface ProductCategory {
  id: string;
  label: string;
  summary: string;
  image: string;
}

export const productCategories = [
  {
    id: "standard-liners",
    label: "Standard liners",
    summary: "Fluted paper liners for everyday cupcakes and muffins.",
    image: "/src/assets/images/categories/standard-liners-placeholder.png",
  },
  {
    id: "greaseproof-liners",
    label: "Greaseproof liners",
    summary: "Paper liners for recipes that call for grease resistance.",
    image: "/src/assets/images/categories/greaseproof-liners-placeholder.png",
  },
  {
    id: "foil-cups",
    label: "Foil cups",
    summary: "Baking cups with a metallic finish for display and presentation.",
    image: "/src/assets/images/categories/foil-cups-placeholder.png",
  },
  {
    id: "tulip-cups",
    label: "Tulip cups",
    summary: "Folded paper wraps with raised points for muffin displays.",
    image: "/src/assets/images/categories/tulip-cups-placeholder.png",
  },
  {
    id: "muffin-cups",
    label: "Muffin cups",
    summary: "Paper cups shaped for muffin and individual cake formats.",
    image: "/src/assets/images/categories/muffin-cups-placeholder.png",
  },
  {
    id: "hard-baking-cups",
    label: "Hard baking cups",
    summary:
      "Structured paper cups for baking and serving individual portions.",
    image: "/src/assets/images/categories/hard-baking-cups-placeholder.png",
  },
] as const satisfies readonly ProductCategory[];
