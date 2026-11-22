import { createSatteriMarkdownProcessor } from "@astrojs/markdown-satteri";
import { parseFragment, serialize, type DefaultTreeAdapterMap } from "parse5";
import { localePath } from "../i18n/routing";
import type { Locale } from "../i18n/utils";
import { confirmedText, hasPlaceholder } from "./placeholders";

type Node = DefaultTreeAdapterMap["node"];
type Element = DefaultTreeAdapterMap["element"];
export type OptimizedBlogImage = {
  src: string;
  width: number;
  height: number;
  srcset?: string;
  sizes?: string;
};
const processor = createSatteriMarkdownProcessor({ syntaxHighlight: false });
const allowed = new Set(
  "p a h2 h3 h4 h5 h6 ul ol li blockquote strong em del hr pre code table thead tbody tr th td img br sup sub".split(
    " ",
  ),
);
const drop = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "svg",
  "math",
]);
const textBlocks = /^(?:p|li|h[1-6]|pre|tr)$/;
const attr = (node: Element, name: string) =>
  node.attrs.find((item) => item.name === name)?.value ?? "";
const content = (node: Node): string =>
  "value" in node
    ? node.value
    : "childNodes" in node
      ? node.childNodes.map(content).join("")
      : "";

// 富文本只输出文章排版元素；图片必须来自 CMS 博客媒体库并经 astro:assets 处理。
export async function renderBlogMarkdown(
  source: string,
  locale: Locale,
  image: (path: string) => Promise<OptimizedBlogImage>,
) {
  const result = await (await processor).render(source);
  const root = parseFragment(result.code);
  const headings: { depth: number; slug: string; text: string }[] = [];
  const ids = new Map<string, string>();
  const hiddenHeadings = new Set<string>();
  const anchors: Element[] = [];
  async function clean(node: Node): Promise<Node[]> {
    if (node.nodeName === "#comment") return [];
    if ("value" in node && hasPlaceholder(node.value)) return [];
    if ("tagName" in node) {
      if (drop.has(node.tagName)) return [];
      if (textBlocks.test(node.tagName) && hasPlaceholder(content(node))) {
        if (/^h[1-6]$/.test(node.tagName)) hiddenHeadings.add(attr(node, "id"));
        return [];
      }
      if (node.tagName === "h1") node.tagName = "h2";
      if (!allowed.has(node.tagName))
        return "childNodes" in node
          ? (await Promise.all(node.childNodes.map(clean))).flat()
          : [];
      const old = node.attrs;
      node.attrs = [];
      const read = (name: string) =>
        old.find((item) => item.name === name)?.value ?? "";
      if (/^h[2-6]$/.test(node.tagName)) {
        const original =
          confirmedText(read("id")) ?? "section-" + (ids.size + 1);
        const slug = "article-" + original;
        ids.set(original, slug);
        node.attrs.push({ name: "id", value: slug });
        if (node.tagName === "h2" || node.tagName === "h3")
          headings.push({
            depth: Number(node.tagName[1]),
            slug,
            text: content(node),
          });
      }
      if (node.tagName === "a") {
        const href = confirmedText(read("href"));
        if (
          href &&
          !/[\u0000-\u0020]/.test(href) &&
          !href.startsWith("//") &&
          (/^(?:https?:|mailto:|tel:)/i.test(href) || !/^[^/?#]*:/.test(href))
        ) {
          node.attrs.push({ name: "href", value: localePath(href, locale) });
          anchors.push(node);
        }
        const title = confirmedText(read("title"));
        if (title) node.attrs.push({ name: "title", value: title });
      }
      if (node.tagName === "img") {
        const marker = read("__astro_image_");
        const original: { src?: string; alt?: string } = marker
          ? JSON.parse(marker)
          : { src: read("src"), alt: read("alt") };
        if (original.src && hasPlaceholder(original.src)) return [];
        if (
          !original.src ||
          !/^(?:\.\.\/\.\.\/assets|\/src\/assets)\/images\/blog\/[a-zA-Z0-9_/-]+\.(?:png|jpe?g|webp|avif)$/i.test(
            original.src,
          )
        )
          throw new Error("正文图片请从博客图片媒体库上传：" + original.src);
        const optimized = await image(original.src);
        node.attrs = Object.entries({
          ...optimized,
          alt: confirmedText(original.alt) ?? "",
          loading: "lazy",
          decoding: "async",
        })
          .filter(([, value]) => value !== undefined)
          .map(([name, value]) => ({ name, value: String(value) }));
      }
      if (["th", "td"].includes(node.tagName)) {
        for (const name of ["colspan", "rowspan"])
          if (/^[1-9]\d?$/.test(read(name)))
            node.attrs.push({ name, value: read(name) });
      }
      if (node.tagName === "ol" && /^-?\d+$/.test(read("start")))
        node.attrs.push({ name: "start", value: read("start") });
    }
    if ("childNodes" in node) {
      const children: Node[] = [];
      for (const child of node.childNodes)
        children.push(...(await clean(child)));
      node.childNodes = children as typeof node.childNodes;
    }
    return [node];
  }
  await clean(root);
  for (const anchor of anchors) {
    const href = attr(anchor, "href");
    if (href.startsWith("#")) {
      let id: string;
      try {
        id = decodeURIComponent(href.slice(1));
      } catch {
        continue;
      }
      if (ids.has(id))
        anchor.attrs.find((item) => item.name === "href")!.value =
          "#" + encodeURIComponent(ids.get(id)!);
      else if (hiddenHeadings.has(id))
        anchor.attrs = anchor.attrs.filter(({ name }) => name !== "href");
    }
  }
  return { html: serialize(root), headings };
}
