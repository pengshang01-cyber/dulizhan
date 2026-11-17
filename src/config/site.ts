import { isTodo } from "../lib/placeholders";
import { z } from "astro/zod";
import rawSite from "../data/site.json";
import { localizedText, optionalLocalizedText } from "../lib/content-fields";
export { localized } from "../i18n/utils";

export type SocialPlatform =
  "youtube" | "tiktok" | "instagram" | "facebook" | "pinterest" | "linkedin";

const optionalImagePath = z.preprocess(
  (value) => value ?? "",
  z
    .string()
    .refine(
      (value) =>
        !value ||
        /^TODO_.+/.test(value) ||
        /^\.\.\/assets\/images\/site\/[a-zA-Z0-9_/-]+\.(png|jpe?g|webp|avif)$/i.test(
          value,
        ),
      "图片必须来自网站资料媒体目录",
    ),
);
// Pages CMS 保存时会省略空字符串、空数组和空对象；读取时恢复可选项。
const optionalString = z.string().default("");

export const siteSchema = z.object({
  companyName: localizedText,
  shortName: localizedText,
  tagline: localizedText,
  topBarItems: z.array(localizedText).default([]),
  domain: optionalString,
  allowIndexing: z.boolean().default(false),
  logo: optionalImagePath,
  ogImage: optionalImagePath,
  homeHeroImage: optionalImagePath,
  homeHeroAlt: optionalLocalizedText,
  aboutGallery: z.preprocess(
    (value) => value ?? [],
    z.array(
      z.object({
        image: optionalImagePath.refine(
          (value) => Boolean(value) && !isTodo(value),
          "图库条目必须上传图片",
        ),
        caption: localizedText,
      }),
    ),
  ),
  factoryVideoPoster: optionalImagePath,
  analytics: z.preprocess(
    (value) => value ?? {},
    z.object({
      gaMeasurementId: optionalString.refine(
        (value) =>
          !value.trim() ||
          /^TODO_/.test(value.trim()) ||
          /^G-[A-Z0-9]+$/.test(value.trim()),
        "GA 衡量 ID 必须以 G- 开头，未配置时留空或 TODO",
      ),
    }),
  ),
  email: optionalString,
  phone: optionalString,
  whatsappNumber: optionalString,
  whatsappPrefillMessage: localizedText,
  factoryAddress: localizedText,
  stockMoq: localizedText,
  customMoq: localizedText,
  sampleLeadTime: localizedText,
  replyTime: localizedText,
  productionLeadTime: localizedText,
  sampleCost: localizedText,
  paymentTerms: localizedText,
  shippingMethods: localizedText,
  stats: z
    .array(
      z.object({
        value: z.union([z.string(), z.number()]),
        label: localizedText,
      }),
    )
    .default([]),
  youtubeVideoId: optionalString,
  certificates: z
    .array(z.object({ name: localizedText, imagePath: optionalImagePath }))
    .default([]),
  socialLinks: z.preprocess(
    (value) => value ?? {},
    z.object({
      youtube: optionalString,
      tiktok: optionalString,
      instagram: optionalString,
      facebook: optionalString,
      pinterest: optionalString,
      linkedin: optionalString,
    }),
  ),
  wechatId: optionalString,
  wechatQr: optionalImagePath,
});

export type SiteConfig = z.infer<typeof siteSchema>;
export type SiteStat = SiteConfig["stats"][number];
export const site: SiteConfig = siteSchema.parse(rawSite);

export { isTodo, display } from "../lib/placeholders";

export function getWhatsAppHref(number: string, message: string) {
  if (isTodo(number)) return undefined;
  const digits = number.replace(/\D/g, "");
  if (!digits) return undefined;
  const text =
    message && !isTodo(message) ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export const navigation = [
  { key: "nav.home", href: "/" },
  { key: "nav.products", href: "/products/" },
  { key: "nav.custom", href: "/custom/" },
  { key: "nav.about", href: "/about/" },
  { key: "nav.blog", href: "/blog/" },
  { key: "nav.faq", href: "/faq/" },
  { key: "nav.contact", href: "/contact/" },
] as const;
