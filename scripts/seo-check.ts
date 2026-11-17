import { readdir, readFile } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { parse, parseFragment, type DefaultTreeAdapterMap } from "parse5";

type Node = DefaultTreeAdapterMap["node"];
type Element = DefaultTreeAdapterMap["element"];
function elements(node: Node): Element[] {
  const children = "childNodes" in node ? node.childNodes : [];
  return [...("tagName" in node ? [node] : []), ...children.flatMap(elements)];
}
function text(node: Node): string {
  return "value" in node
    ? node.value
    : "childNodes" in node
      ? node.childNodes.map(text).join("")
      : "";
}
const attr = (node: Element, key: string) =>
  node.attrs.find(({ name }) => name === key)?.value ?? "";
const normalized = (value: string) => value.trim().replace(/\s+/g, " ");
function routeFor(file: string) {
  const path = "/" + file.replaceAll("\\", "/");
  return path.endsWith("/index.html") ? path.slice(0, -10) : path;
}
function routeKey(path: string) {
  return (
    decodeURI(path)
      .replace(/\/index\.html$/, "/")
      .replace(/\/$/, "") || "/"
  );
}
async function filesIn(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? filesIn(resolve(dir, entry.name))
          : [resolve(dir, entry.name)],
      ),
    )
  ).flat();
}
export async function checkSeo(directory: string) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const files = await filesIn(directory);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));
  if (!htmlFiles.length) errors.push("构建目录没有 HTML，请先 npm run build");
  const routes = new Set(
    htmlFiles.map((file) => routeKey(routeFor(relative(directory, file)))),
  );
  const seen = new Map<string, string>();
  const noindex = new Set<string>();
  let jsonLdCount = 0;
  let alternateCount = 0;
  for (const file of htmlFiles) {
    const route = routeFor(relative(directory, file));
    const nodes = elements(parse(await readFile(file, "utf8")));
    const language = attr(
      nodes.find((node) => node.tagName === "html")!,
      "lang",
    );
    const chinese = language === "zh-CN";
    const select = (tag: string, key?: string, value?: string) =>
      nodes.filter(
        (node) =>
          node.tagName === tag &&
          node.namespaceURI === "http://www.w3.org/1999/xhtml" &&
          (!key || attr(node, key).toLowerCase() === value),
      );
    const title = select("title");
    const description = select("meta", "name", "description");
    const h1 = select("h1");
    const canonical = nodes.filter(
      (node) =>
        node.tagName === "link" &&
        attr(node, "rel").toLowerCase().split(/\s+/).includes("canonical"),
    );
    for (const [name, list] of [
      ["title", title],
      ["description", description],
      ["H1", h1],
      ["canonical", canonical],
    ] as const) {
      if (list.length !== 1)
        errors.push(`${route}: ${name} 应有 1 个，实际 ${list.length}`);
    }
    for (const [name, value, limit] of [
      ["title", title[0] && text(title[0]), chinese ? 30 : 60],
      [
        "description",
        description[0] && attr(description[0], "content"),
        chinese ? 80 : 155,
      ],
    ] as const) {
      if (!value?.trim()) {
        errors.push(`${route}: ${name} 为空`);
        continue;
      }
      const key = language + ":" + name + ":" + normalized(value).toLowerCase();
      if (seen.has(key))
        errors.push(`${route}: ${name} 与 ${seen.get(key)} 重复`);
      else seen.set(key, route);
      if ([...value].length > limit)
        warnings.push(
          `${route}: ${name} ${[...value].length} 字符，超过 ${limit}`,
        );
    }
    if (h1.length === 1 && !text(h1[0]).trim())
      errors.push(`${route}: H1 为空`);
    if (canonical.length === 1) {
      try {
        const url = new URL(attr(canonical[0], "href"));
        if (
          !/^https?:$/.test(url.protocol) ||
          routeKey(url.pathname) !== routeKey(route) ||
          url.search ||
          url.hash
        )
          errors.push(`${route}: canonical 未指向当前语言自身网址`);
      } catch {
        errors.push(`${route}: canonical 必须是绝对 HTTP(S) 网址`);
      }
    }
    if (
      select("meta", "name", "robots").some((node) =>
        /\bnoindex\b/i.test(attr(node, "content")),
      )
    )
      noindex.add(routeKey(route));
    const alternates = nodes.filter(
      (node) => node.tagName === "link" && attr(node, "hreflang"),
    );
    if (!alternates.length) errors.push(`${route}: 缺少 hreflang`);
    for (const node of alternates) {
      alternateCount++;
      try {
        const url = new URL(attr(node, "href"));
        if (!routes.has(routeKey(url.pathname)))
          errors.push(`${route}: hreflang 目标不存在 ${url.pathname}`);
      } catch {
        errors.push(`${route}: hreflang 网址无效`);
      }
    }
    for (const script of select("script", "type", "application/ld+json")) {
      jsonLdCount++;
      try {
        const value: unknown = JSON.parse(text(script));
        if (!value || typeof value !== "object")
          errors.push(`${route}: JSON-LD 必须是对象或数组`);
        if (/TODO(?:[_\-\s:]|\])/i.test(JSON.stringify(value)))
          errors.push(`${route}: JSON-LD 含 TODO 占位`);
      } catch {
        errors.push(`${route}: JSON-LD 无法 JSON.parse`);
      }
    }
  }
  const sitemaps = files.filter((file) => /sitemap[^/\\]*\.xml$/.test(file));
  let sitemapPages = 0;
  for (const file of sitemaps) {
    const xml = await readFile(file, "utf8");
    for (const match of xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)) {
      try {
        const url = new URL(text(parseFragment(match[1])));
        if (url.pathname.endsWith(".xml")) continue;
        sitemapPages++;
        const key = routeKey(url.pathname);
        if (!routes.has(key))
          errors.push(`sitemap: 页面不存在 ${url.pathname}`);
        if (noindex.has(key))
          errors.push(`sitemap: 包含 noindex 页面 ${url.pathname}`);
      } catch {
        errors.push("sitemap: loc 网址无效");
      }
    }
    for (const node of elements(parse(xml)).filter(
      (node) => node.tagName === "xhtml:link",
    )) {
      try {
        const url = new URL(attr(node, "href"));
        if (
          !routes.has(routeKey(url.pathname)) ||
          noindex.has(routeKey(url.pathname))
        )
          errors.push(`sitemap: hreflang 目标不可收录 ${url.pathname}`);
      } catch {
        errors.push("sitemap: hreflang 网址无效");
      }
    }
  }
  return {
    pages: htmlFiles.length,
    jsonLdCount,
    alternateCount,
    noindexPages: noindex.size,
    sitemapPages,
    errors,
    warnings,
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const result = await checkSeo(resolve(process.argv[2] ?? "dist"));
  for (const warning of result.warnings) console.warn("WARNING " + warning);
  for (const error of result.errors) console.error("ERROR " + error);
  console.log(
    `SEO: ${result.pages} HTML pages; ${result.jsonLdCount} JSON-LD blocks; ${result.alternateCount} hreflang links`,
  );
  console.log(
    `Indexing: ${result.noindexPages} noindex pages; ${result.sitemapPages} sitemap page URLs`,
  );
  console.log(
    `Result: ${result.errors.length} errors, ${result.warnings.length} warnings`,
  );
  if (result.errors.length) process.exitCode = 1;
}
