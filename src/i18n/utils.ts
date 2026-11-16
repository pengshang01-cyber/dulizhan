import en from "./en.json";
import zh from "./zh.json";

export type Locale = "en" | "zh";
export interface LocalizedValue {
  en: string | number;
  zh?: string | null;
}

export function localized<T extends string | number>(
  value: { en: T; zh?: string | null },
  locale: Locale = "en",
): T | string {
  if (locale === "zh" && typeof value.zh === "string" && value.zh.trim())
    return value.zh;
  return value.en;
}

export function t(
  key: string,
  locale: Locale = "en",
  params: Record<string, string | number> = {},
): string {
  const english = (en as Record<string, string>)[key];
  if (english === undefined) throw new Error("缺少界面翻译：" + key);
  const chinese = (zh as Record<string, string>)[key];
  const template = locale === "zh" && chinese?.trim() ? chinese : english;
  return template.replace(/\{(\w+)\}/g, (token, name: string) =>
    Object.hasOwn(params, name) ? String(params[name]) : token,
  );
}
