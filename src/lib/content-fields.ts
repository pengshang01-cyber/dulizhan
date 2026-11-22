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
function omitEmptyTranslation(value: unknown) {
  if (value == null) return undefined;
  if (typeof value === "object" && !Array.isArray(value)) {
    const item = value as { en?: unknown; zh?: unknown };
    if (!String(item.en ?? "").trim() && !String(item.zh ?? "").trim())
      return undefined;
  }
  return value;
}
export const optionalLocalizedText = z.preprocess(
  omitEmptyTranslation,
  localizedText.optional(),
);
export const optionalLocalizedValue = z.preprocess(
  omitEmptyTranslation,
  localizedValue.optional(),
);
export const contentId = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const sharedMeasurement = z.preprocess(
  (value) =>
    typeof value === "string" && /^(?:\d+(?:\.\d+)?|\.\d+)$/.test(value.trim())
      ? Number(value)
      : value,
  z.union([z.number().positive(), z.string().regex(/^TODO_.+/)]),
);

export const optionalMeasurement = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  sharedMeasurement.optional(),
);

export const paperWeight = z.union([
  sharedMeasurement,
  requiredText.refine(
    (value) =>
      /^\d+(?:\.\d+)?(?:\s*[–/-]\s*\d+(?:\.\d+)?)+$/.test(value) &&
      value.split(/[–/-]/).every((part) => Number(part) > 0),
    "克重请输入正数、范围或多个正数，例如 260–300 或 24 / 31 / 40",
  ),
]);
