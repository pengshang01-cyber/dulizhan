import { readdir, readFile } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { parse, type DefaultTreeAdapterMap } from "parse5";
type Node = DefaultTreeAdapterMap["node"];
type Element = DefaultTreeAdapterMap["element"];
const attr = (node: Element, name: string) =>
  node.attrs.find((item) => item.name === name)?.value ?? "";
function elements(node: Node): Element[] {
  return [
    ...("tagName" in node ? [node] : []),
    ...("childNodes" in node ? node.childNodes.flatMap(elements) : []),
  ];
}
async function list(dir: string): Promise<string[]> {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((entry) =>
        entry.isDirectory()
          ? list(resolve(dir, entry.name))
          : [resolve(dir, entry.name)],
      ),
    )
  ).flat();
}
const normalized = (value: string) =>
  value.replace(/\/index\.html$/, "/").replace(/\/$/, "") || "/";
export async function checkLinks(directory: string) {
  const files = await list(directory);
  const found = new Map<string, string>();
  const pages = new Map<string, { nodes: Element[]; ids: Set<string> }>();
  const origins = new Set(["https://internal.test"]);
  const errors: string[] = [];
  for (const file of files) {
    const path = "/" + relative(directory, file).replaceAll("\\", "/");
    found.set(normalized(path), file);
    if (!file.endsWith(".html")) continue;
    const nodes = elements(parse(await readFile(file, "utf8")));
    pages.set(file, {
      nodes,
      ids: new Set(
        nodes
          .flatMap((node) => [
            attr(node, "id"),
            ...(node.tagName === "a" ? [attr(node, "name")] : []),
          ])
          .filter(Boolean),
      ),
    });
    const canonical = nodes.find(
      (node) => node.tagName === "link" && attr(node, "rel") === "canonical",
    );
    try {
      if (canonical) origins.add(new URL(attr(canonical, "href")).origin);
    } catch {
      /* seo:check 负责 canonical 错误。 */
    }
  }
  if (!pages.size) errors.push("构建目录没有 HTML，请先 npm run build");
  let links = 0,
    anchors = 0;
  for (const [file, { nodes }] of pages) {
    const source =
      "/" +
      relative(directory, file)
        .replaceAll("\\", "/")
        .replace(/index\.html$/, "");
    const base = new URL(source, "https://internal.test");
    for (const node of nodes.filter(
      (node) => node.tagName === "a" || node.tagName === "area",
    )) {
      const href = attr(node, "href");
      if (!href || /^(?:mailto:|tel:|sms:)/i.test(href)) continue;
      let url: URL;
      try {
        url = new URL(href, base);
      } catch {
        errors.push(source + ": 无效链接 " + href);
        continue;
      }
      if (!/^https?:$/.test(url.protocol)) {
        errors.push(source + ": 不支持的链接协议 " + href);
        continue;
      }
      if (!origins.has(url.origin)) continue;
      links++;
      let path: string, hash: string;
      try {
        path = decodeURIComponent(url.pathname);
        hash = decodeURIComponent(url.hash.slice(1)).split(":~:text=")[0];
      } catch {
        errors.push(source + ": 无效 URL 编码 " + href);
        continue;
      }
      const target =
        found.get(normalized(path)) ??
        found.get(normalized(path + "/index.html"));
      if (!target) {
        errors.push(source + ": 链接目标不存在 " + href);
        continue;
      }
      if (hash && hash !== "top" && pages.has(target)) {
        anchors++;
        if (!pages.get(target)!.ids.has(hash))
          errors.push(source + ": 锚点不存在 " + href);
      }
    }
  }
  return { pages: pages.size, links, anchors, errors };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const result = await checkLinks(resolve(process.argv[2] ?? "dist"));
  for (const error of result.errors) console.error("ERROR " + error);
  console.log(
    "Links: " +
      result.pages +
      " HTML pages; " +
      result.links +
      " internal links; " +
      result.anchors +
      " anchors",
  );
  console.log("Result: " + result.errors.length + " errors");
  if (result.errors.length) process.exitCode = 1;
}
