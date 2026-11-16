import type { ImageMetadata } from "astro";

export interface TeamMember {
  name: string;
  role: string;
  image: ImageMetadata;
}

// 工厂提供真实姓名、职责及获授权的本地照片后再填写。
export const teamMembers: TeamMember[] = [];
