import { readdirSync } from "node:fs";
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import {
  contentId,
  localizedText,
  localizedValue,
  optionalLocalizedText,
  requiredText,
  sharedMeasurement,
} from "../lib/content-fields";

// 校验来源与分类 collection 相同；新增分类文件自动进入允许集合。
const categoryIds = new Set(
  readdirSync(new URL("./categories/", import.meta.url))
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.slice(0, -5)),
);
const categoryId = z
  .string()
  .transform((value) => value.replace(/\.json$/, ""))
  .pipe(contentId)
  .refine((id) => categoryIds.has(id), "分类必须引用已有的分类 JSON 文件");
const categories = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/categories" }),
  schema: ({ image }) =>
    z.object({
      label: localizedText,
      summary: localizedText,
      image: image(),
      order: z.number().int(),
      showOnHome: z.boolean(),
    }),
});
const products = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/products" }),
  schema: ({ image }) =>
    z.object({
      sku: requiredText,
      slug: contentId,
      category: categoryId,
      title: localizedText,
      badge: optionalLocalizedText,
      summary: localizedText,
      images: z.array(image()).min(1),
      material: localizedText,
      gsm: sharedMeasurement,
      sizes: z
        .array(
          z.object({
            name: localizedText,
            baseDiameterMm: sharedMeasurement,
            heightMm: sharedMeasurement,
            topDiameterMm: z.preprocess(
              (value) => (value === "" || value === null ? undefined : value),
              sharedMeasurement.optional(),
            ),
          }),
        )
        .min(1),
      colors: z.array(localizedText).default([]),
      patterns: z.array(localizedText).default([]),
      customizable: z.preprocess(
        (value) =>
          value === "true" ? true : value === "false" ? false : value,
        z.union([z.boolean(), z.string().regex(/^TODO_.+/)]),
      ),
      moq: localizedValue,
      packaging: localizedText,
      cartonSpec: localizedText,
      leadTime: localizedText,
      faqs: z
        .array(z.object({ q: localizedText, a: localizedText }))
        .default([]),
      seoTitle: optionalLocalizedText,
      seoDescription: optionalLocalizedText,
      customOptions: optionalLocalizedText,
      packagingDetails: optionalLocalizedText,
      applications: optionalLocalizedText,
      featured: z.boolean(),
      order: z.number().int(),
    }),
});
export const collections = { categories, products };
