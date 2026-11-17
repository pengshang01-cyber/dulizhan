import type { Locale } from "../i18n/utils";
import { localePath } from "../i18n/routing";

export const BLOG_PAGE_SIZE = 9;
export interface BlogVisibility {
  id: string;
  data: { draft: boolean; bodyZh?: string | null; date: string };
}
export function visibleBlogPosts<T extends BlogVisibility>(
  posts: T[],
  locale: Locale,
): T[] {
  return posts
    .filter(
      ({ data }) =>
        !data.draft && (locale === "en" || Boolean(data.bodyZh?.trim())),
    )
    .sort(
      (a, b) =>
        b.data.date.localeCompare(a.data.date) || a.id.localeCompare(b.id),
    );
}
export function blogPageCount(count: number) {
  return Math.max(1, Math.ceil(count / BLOG_PAGE_SIZE));
}
export function blogPageHref(page: number, locale: Locale) {
  return localePath(page === 1 ? "/blog/" : "/blog/page/" + page + "/", locale);
}
export function blogHref(slug: string, locale: Locale) {
  return localePath("/blog/" + slug + "/", locale);
}
export function pagePosts<T>(posts: T[], page: number): T[] {
  if (!Number.isInteger(page) || page < 1 || page > blogPageCount(posts.length))
    throw new Error("无效博客页码");
  return posts.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE);
}
export function validBlogDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T00:00:00Z");
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}
