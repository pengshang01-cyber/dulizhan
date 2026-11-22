import type { Locale } from "./utils";

// 网址片段与语言无关；查询参数、锚点在语言切换时保留。
export function unlocalizedPath(path: string): string {
  return path.replace(/^\/zh(?=\/|\?|#|$)/, "") || "/";
}
export function localeFromPath(path: string): Locale {
  return /^\/zh(?:\/|\?|#|$)/.test(path) ? "zh" : "en";
}
export function localePath(path: string, locale: Locale): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const bare = unlocalizedPath(path);
  const normalized = /^[?#]/.test(bare) ? "/" + bare : bare;
  // 设计规范仅保留英文路由，正常导航不会导向此开发页面。
  if (normalized.split(/[?#]/)[0].replace(/\/$/, "") === "/styleguide")
    return normalized;
  return locale === "zh" ? "/zh" + normalized : normalized;
}

export function productHref(
  product: { category: string; slug: string },
  locale: Locale = "en",
) {
  return localePath(`/products/${product.category}/${product.slug}/`, locale);
}
