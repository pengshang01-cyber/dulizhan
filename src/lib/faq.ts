import { z } from "astro/zod";
import { display, site } from "../config/site";
import { localized, t, type Locale } from "../i18n/utils";
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
  return value.replace(/\{\{site\.(\w+)\}\}/g, (_, key: string) => {
    if (key === "certificates") {
      return site.certificates.length
        ? site.certificates
            .map(({ name }) =>
              display(
                localized(name, locale),
                t("faq.placeholder.certificateName", locale),
              ),
            )
            .join(", ")
        : display(
            "TODO_CERTIFICATES",
            t("faq.placeholder.certificates", locale),
          );
    }
    const policy = policyKeys.find((item) => item === key);
    if (!policy) throw new Error("FAQ 中的站点变量无效：" + key);
    return String(
      display(
        localized(site[policy], locale),
        t("faq.placeholder." + policy, locale),
      ),
    );
  });
}

export function getFaqs(locale: Locale = "en") {
  return rows.map(({ topic, q, a, featured }) => ({
    topic,
    question: localized(q, locale),
    answer: answerText(localized(a, locale), locale),
    featured,
  }));
}
