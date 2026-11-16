import { z } from "astro/zod";

export const requiredText = z.string().trim().min(1);
export const localizedText = z.object({
  en: requiredText,
  zh: z.string().optional().nullable(),
});
export const localizedValue = z.object({
  en: z.union([requiredText, z.number()]),
  zh: z.string().optional().nullable(),
});
// 可选整块允许 CMS 写出空对象；有中文时也必须提供英文。
export const optionalLocalizedText = z.preprocess((value) => {
  if (value == null) return undefined;
  if (typeof value === "object" && !Array.isArray(value)) {
    const item = value as { en?: unknown; zh?: unknown };
    if (!String(item.en ?? "").trim() && !String(item.zh ?? "").trim())
      return undefined;
  }
  return value;
}, localizedText.optional());
export const contentId = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const sharedMeasurement = z.preprocess(
  (value) =>
    typeof value === "string" && /^(?:\d+(?:\.\d+)?|\.\d+)$/.test(value.trim())
      ? Number(value)
      : value,
  z.union([z.number().positive(), z.string().regex(/^TODO_.+/)]),
);
