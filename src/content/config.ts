import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { productCategories } from "../config/categories";

const text = z.string().trim().min(1);
const todo = z.string().regex(/^TODO_.+/);
const measurement = z.union([z.number().positive(), todo]);
const categoryIds = productCategories.map(({ id }) => id) as [
  (typeof productCategories)[number]["id"],
  ...(typeof productCategories)[number]["id"][],
];

const products = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/products" }),
  schema: ({ image }) =>
    z.object({
      title: text,
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      sku: text,
      badge: text.optional(),
      category: z.enum(categoryIds),
      summary: text,
      images: z.array(image()).min(1),
      material: text,
      gsm: measurement,
      sizes: z
        .array(
          z.object({
            name: text,
            baseDiameterMm: measurement,
            heightMm: measurement,
            topDiameterMm: measurement.optional(),
          }),
        )
        .min(1),
      colors: z.array(text),
      patterns: z.array(text),
      customizable: z.union([z.boolean(), todo]),
      moq: z.union([z.number().int().positive(), text]),
      packaging: text,
      cartonSpec: text,
      leadTime: text,
      faqs: z.array(z.object({ q: text, a: text })),
      seoTitle: text.optional(),
      seoDescription: text.optional(),
      featured: z.boolean(),
      order: z.number().int(),
    }),
});

export const collections = { products };
