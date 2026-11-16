import type { ImageMetadata } from "astro";

export interface CustomizationCase {
  title: string;
  summary: string;
  image: ImageMetadata;
  imageAlt: string;
}

// 只添加经工厂确认、已获展示授权的案例与本地实拍图片。
export const customizationCases: CustomizationCase[] = [];
