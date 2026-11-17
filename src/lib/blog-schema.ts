import { z } from "astro/zod";
import { contentId, localizedText, requiredText } from "./content-fields";
import { validBlogDate } from "./blog-rules";
const date = z.string().refine(validBlogDate, "日期必须是有效的 YYYY-MM-DD");
export const blogFields = z.object({
  title: localizedText,
  description: localizedText,
  date,
  updated: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    date.optional(),
  ),
  tags: z.array(localizedText).default([]),
  relatedProducts: z.array(contentId).default([]),
  draft: z.boolean().default(true),
  bodyEn: requiredText,
  bodyZh: z
    .preprocess((value) => (value == null ? "" : value), z.string().trim())
    .default(""),
});
