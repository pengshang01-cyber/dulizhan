export type SocialPlatform =
  "youtube" | "tiktok" | "instagram" | "facebook" | "pinterest" | "linkedin";

export interface SiteStat {
  value: string | number;
  label: string;
}

export interface SiteConfig {
  companyName: string;
  shortName: string;
  tagline: string;
  topBarItems: string[];
  domain: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  whatsappPrefillMessage: string;
  factoryAddress: string;
  stats: SiteStat[];
  youtubeVideoId: string;
  certificates: { name: string; imagePath: string }[];
  socialLinks: Record<SocialPlatform, string>;
}

export const site: SiteConfig = {
  companyName: "TODO_COMPANY_NAME",
  shortName: "TODO_COMPANY_SHORT_NAME",
  tagline: "TODO_COMPANY_TAGLINE",
  topBarItems: ["Factory Direct", "Custom Printing & OEM", "TODO_TOP_BAR_ITEM"],
  domain: "TODO_SITE_DOMAIN",
  email: "TODO_EMAIL",
  phone: "TODO_PHONE",
  whatsappNumber: "TODO_WHATSAPP_NUMBER",
  whatsappPrefillMessage: "TODO_WHATSAPP_PREFILL_MESSAGE",
  factoryAddress: "TODO_FACTORY_ADDRESS",
  stats: [
    { value: "TODO_FOUNDED_YEAR", label: "Founded" },
    { value: "TODO_DAILY_CAPACITY", label: "Daily Capacity" },
    { value: "TODO_EXPORT_COUNTRY_COUNT", label: "Export Countries" },
    { value: "TODO_PATTERN_COUNT", label: "Colors & Patterns" },
  ],
  youtubeVideoId: "TODO_YOUTUBE_VIDEO_ID",
  certificates: [
    { name: "TODO_CERTIFICATE_NAME", imagePath: "TODO_CERTIFICATE_IMAGE_PATH" },
  ],
  socialLinks: {
    youtube: "TODO_YOUTUBE_URL",
    tiktok: "TODO_TIKTOK_URL",
    instagram: "TODO_INSTAGRAM_URL",
    facebook: "TODO_FACEBOOK_URL",
    pinterest: "TODO_PINTEREST_URL",
    linkedin: "TODO_LINKEDIN_URL",
  },
};

export function isTodo(value: unknown): value is `TODO_${string}` {
  return typeof value === "string" && value.startsWith("TODO_");
}

export function display<T extends string | number>(
  value: T,
  label: string,
): T | `[TODO: ${string}]` {
  return isTodo(value) ? `[TODO: ${label}]` : value;
}

export function getWhatsAppHref(number: string, message: string) {
  if (isTodo(number)) return undefined;

  const digits = number.replace(/\D/g, "");
  if (!digits) return undefined;

  const text =
    message && !isTodo(message) ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products/" },
  { label: "Custom/OEM", href: "/custom/" },
  { label: "About", href: "/about/" },
  { label: "Blog", href: "/blog/" },
  { label: "FAQ", href: "/faq/" },
  { label: "Contact", href: "/contact/" },
] as const;
