import { blogFields } from "../lib/blog-schema";
import { readdirSync } from "node:fs";
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import {
  contentId,
  localizedText,
  optionalLocalizedText,
  optionalLocalizedValue,
  paperWeight,
  requiredText,
} from "../lib/content-fields";
import { colorFields, productSizeFields } from "../lib/product-size-fields";

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
      imageAlt: optionalLocalizedText,
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
      images: z
        .array(
          z.union([
            z.object({
              image: image(),
              alt: optionalLocalizedText,
              sizeComparison: z.boolean().nullish(),
              scene: z.preprocess(
                (value) => (value === "" || value === null ? undefined : value),
                z.enum(["closeup", "display"]).optional(),
              ),
            }),
            image().transform((image) => ({
              image,
              alt: undefined,
              sizeComparison: undefined,
              scene: undefined,
            })),
          ]),
        )
        .min(1)
        .refine(([cover]) => !cover?.scene && !cover?.sizeComparison, {
          path: [0, "image"],
          message: "成品展示图和尺寸对比图只能作为辅图",
        })
        .refine(
          (images) =>
            images.every((item) => !item.scene || !item.sizeComparison),
          {
            message: "同一张图只能标记为成品展示或尺寸对比",
          },
        )
        .refine(
          (images) => {
            const scenes = images.flatMap(({ scene }) =>
              scene ? [scene] : [],
            );
            return new Set(scenes).size === scenes.length;
          },
          { message: "使用中特写和商业陈列各最多一张" },
        ),
      material: localizedText,
      gsm: paperWeight,
      sizes: z.array(productSizeFields).min(1),
      colors: z.array(colorFields).default([]),
      moreColorsOnRequest: z.boolean().optional(),
      patterns: z.array(localizedText).default([]),
      customizable: z.preprocess(
        (value) =>
          value === "true" ? true : value === "false" ? false : value,
        z.union([z.boolean(), z.string().regex(/^TODO_.+/)]),
      ),
      moq: optionalLocalizedValue,
      packaging: optionalLocalizedText,
      cartonSpec: optionalLocalizedText,
      leadTime: optionalLocalizedText,
      faqs: z
        .array(z.object({ q: localizedText, a: localizedText }))
        .default([]),
      seoTitle: optionalLocalizedText,
      seoDescription: optionalLocalizedText,
      customOptions: optionalLocalizedText,
      packagingDetails: optionalLocalizedText,
      applications: optionalLocalizedText,
      draft: z.boolean().default(false),
      featured: z.boolean(),
      order: z.number().int(),
    }),
});
const blog = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/blog" }),
  schema: ({ image }) =>
    blogFields
      .extend({ cover: image() })
      .refine((data) => !data.updated || data.updated >= data.date, {
        message: "更新日期不能早于发布日期",
        path: ["updated"],
      }),
});
export const collections = { categories, products, blog };
