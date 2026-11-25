import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "../i18n/utils";
import { getProducts } from "./products";
import { visibleBlogPosts } from "./blog-rules";
export type BlogPost = CollectionEntry<"blog">;
export async function getBlogPosts(locale: Locale): Promise<BlogPost[]> {
  const posts = await getCollection("blog");
  const products = new Set(
    (await getProducts({ includeDrafts: true })).map(({ data }) => data.slug),
  );
  for (const post of posts) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.id))
      throw new Error("文章文件名必须是小写字母数字与连字符：" + post.id);
    if (
      !post.data.draft &&
      post.data.relatedProducts.some((slug) => !products.has(slug))
    )
      throw new Error("文章引用了不存在的产品：" + post.id);
  }
  return visibleBlogPosts(posts, locale);
}
