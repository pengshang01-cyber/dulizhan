import { z } from "astro/zod";
import { site } from "../config/site";
import { confirmedLocalized, type Locale } from "../i18n/utils";
import { localizedText } from "../lib/content-fields";
import data from "../data/faq.json";

export const faqTopics = [
  { id: "ordering", topic: "Ordering", key: "faq.topic.ordering" },
  { id: "samples", topic: "Samples", key: "faq.topic.samples" },
  {
    id: "shipping-payment",
    topic: "Shipping & Payment",
    key: "faq.topic.shippingPayment",
  },
  {
    id: "customization",
    topic: "Customization",
    key: "faq.topic.customization",
  },
  {
    id: "quality-safety",
    topic: "Quality & Safety",
    key: "faq.topic.qualitySafety",
  },
] as const;

const policyKeys = [
  "stockMoq",
  "customMoq",
  "sampleLeadTime",
  "productionLeadTime",
  "sampleCost",
  "paymentTerms",
  "shippingMethods",
] as const;
const rows = z
  .array(
    z.object({
      topic: z.enum([
        "Ordering",
        "Samples",
        "Shipping & Payment",
        "Customization",
        "Quality & Safety",
      ]),
      q: localizedText,
      a: localizedText,
      featured: z.boolean(),
    }),
  )
  .parse(data);

function answerText(value: string, locale: Locale) {
  let missing = false;
  const answer = value.replace(/\{\{site\.(\w+)\}\}/g, (_, key: string) => {
    const policy = policyKeys.find((item) => item === key);
    if (key !== "certificates" && !policy)
      throw new Error("FAQ 中的站点变量无效：" + key);
    const resolved = policy
      ? confirmedLocalized(site[policy], locale)
      : site.certificates
          .map(({ name }) => confirmedLocalized(name, locale))
          .filter(Boolean)
          .join(", ");
    if (!resolved) missing = true;
    return resolved ?? "";
  });
  return missing ? undefined : answer;
}

export function getFaqs(locale: Locale = "en") {
  return rows.flatMap(({ topic, q, a, featured }) => {
    const question = confirmedLocalized(q, locale);
    const template = confirmedLocalized(a, locale);
    const answer = template && answerText(template, locale);
    return question && answer ? [{ topic, question, answer, featured }] : [];
  });
}
