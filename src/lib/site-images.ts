import type { ImageMetadata } from "astro";
import { confirmedText } from "./placeholders";

const images = import.meta.glob<ImageMetadata>(
  "/src/assets/images/site/**/*.{png,jpg,jpeg,webp,avif}",
  { eager: true, import: "default" },
);

// CMS 写入的相对路径以 src/data 下的数据文件为基准。
export function resolveSiteImage(
  path: string | null | undefined,
): ImageMetadata | undefined {
  const confirmedPath = confirmedText(path);
  if (!confirmedPath) return undefined;
  const key = confirmedPath.replace(/^\.\.\/assets\//, "/src/assets/");
  const image = images[key];
  if (!image) throw new Error("缺少网站资料图片：" + path);
  return image;
}
