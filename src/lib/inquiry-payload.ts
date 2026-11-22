import { COUNTRY_CODES } from "./inquiry-countries";
import { confirmedText } from "./placeholders";

export const QUANTITY_RANGES = [
  "",
  "under-10000",
  "10000-49999",
  "50000-99999",
  "100000-plus",
  "discuss",
] as const;

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export const INQUIRY_LIMITS = {
  bodyBytes: 100_000,
  items: 50,
  name: 120,
  email: 254,
  company: 200,
  country: 2,
  phone: 80,
  wechatId: 100,
  productInterest: 100,
  productSlug: 120,
  productTitle: 300,
  quantity: 40,
  message: 5000,
  sourceUrl: 2000,
  turnstileToken: 2048,
  website: 300,
  sku: 100,
  title: 300,
  utm: 300,
} as const;

export interface InquiryLine {
  slug: string;
  sku?: string;
  title: string;
  category: string;
  quantity: number | null;
}

export interface InquiryPayload {
  name: string;
  email: string;
  company: string;
  country: string;
  phone: string;
  wechatId: string;
  productInterest: string;
  productSlug: string;
  productTitle?: string;
  quantity: string;
  message: string;
  samples: boolean;
  items: InquiryLine[];
  locale: "en" | "zh";
  sourceUrl: string;
  utm: Partial<Record<(typeof UTM_KEYS)[number], string>>;
  turnstileToken: string;
  website: string;
}

export type InquiryFieldError = "required" | "invalid" | "too_long";
export type InquiryValidationResult =
  | { ok: true; data: InquiryPayload }
  | { ok: false; fields: Record<string, InquiryFieldError> };

const identifier = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const record = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

export function validateInquiryPayload(
  input: unknown,
): InquiryValidationResult {
  if (!record(input)) return { ok: false, fields: { form: "invalid" } };
  const fields: Record<string, InquiryFieldError> = {};
  const text = (key: keyof typeof INQUIRY_LIMITS, required = false): string => {
    const value = input[key];
    if (value === undefined && !required) return "";
    if (typeof value !== "string") {
      fields[key] = required && value == null ? "required" : "invalid";
      return "";
    }
    const normalized = value.trim();
    if (required && !normalized) fields[key] = "required";
    else if (value.length > INQUIRY_LIMITS[key]) fields[key] = "too_long";
    else if (key !== "message" && /[\r\n\u0000]/.test(value))
      fields[key] = "invalid";
    return normalized;
  };
  const data: InquiryPayload = {
    name: text("name", true),
    email: text("email", true),
    company: text("company"),
    country: text("country", true),
    phone: text("phone"),
    wechatId: text("wechatId"),
    productInterest: text("productInterest"),
    productSlug: text("productSlug"),
    productTitle: confirmedText(text("productTitle")),
    quantity: text("quantity"),
    message: text("message", true),
    sourceUrl: text("sourceUrl", true),
    turnstileToken: text("turnstileToken", true),
    website: text("website"),
    samples: input.samples === true,
    items: [],
    locale: input.locale === "zh" ? "zh" : "en",
    utm: {},
  };
  if (data.email && !emailPattern.test(data.email)) fields.email = "invalid";
  if (
    data.country &&
    !(COUNTRY_CODES as readonly string[]).includes(data.country)
  )
    fields.country = "invalid";
  for (const key of ["productInterest", "productSlug"] as const)
    if (data[key] && !identifier.test(data[key])) fields[key] = "invalid";
  if (!(QUANTITY_RANGES as readonly string[]).includes(data.quantity))
    fields.quantity = "invalid";
  if (typeof input.samples !== "boolean") fields.samples = "invalid";
  if (input.locale !== "en" && input.locale !== "zh") fields.locale = "invalid";
  if (data.sourceUrl) {
    try {
      const source = new URL(data.sourceUrl);
      if (
        !/^https?:$/.test(source.protocol) ||
        source.username ||
        source.password
      )
        fields.sourceUrl = "invalid";
    } catch {
      fields.sourceUrl = "invalid";
    }
  }
  if (!Array.isArray(input.items)) fields.items = "invalid";
  else if (input.items.length > INQUIRY_LIMITS.items) fields.items = "too_long";
  else {
    const seen = new Set<string>();
    for (const item of input.items) {
      if (
        !record(item) ||
        typeof item.slug !== "string" ||
        !identifier.test(item.slug) ||
        item.slug.length > INQUIRY_LIMITS.productSlug ||
        typeof item.category !== "string" ||
        !identifier.test(item.category) ||
        item.category.length > INQUIRY_LIMITS.productInterest ||
        (item.sku != null &&
          (typeof item.sku !== "string" ||
            item.sku.length > INQUIRY_LIMITS.sku)) ||
        typeof item.title !== "string" ||
        !item.title.trim() ||
        item.title.length > INQUIRY_LIMITS.title ||
        (item.quantity !== null &&
          !(
            typeof item.quantity === "number" &&
            Number.isSafeInteger(item.quantity) &&
            item.quantity > 0
          )) ||
        seen.has(item.slug)
      ) {
        fields.items = "invalid";
        break;
      }
      seen.add(item.slug);
      const sku = confirmedText(item.sku);
      data.items.push({
        slug: item.slug,
        ...(sku ? { sku } : {}),
        title: confirmedText(item.title) ?? item.slug,
        category: item.category,
        quantity: item.quantity as number | null,
      });
    }
  }
  if (!record(input.utm)) fields.utm = "invalid";
  else {
    for (const [key, value] of Object.entries(input.utm)) {
      if (
        !(UTM_KEYS as readonly string[]).includes(key) ||
        typeof value !== "string"
      )
        fields.utm = "invalid";
      else if (value.length > INQUIRY_LIMITS.utm) fields.utm = "too_long";
      else data.utm[key as (typeof UTM_KEYS)[number]] = value.trim();
    }
  }
  return Object.keys(fields).length
    ? { ok: false, fields }
    : { ok: true, data };
}
