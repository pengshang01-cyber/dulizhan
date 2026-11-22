import { configuredOrigin, type StructuredData } from "./seo";
import { site } from "../config/site";
import { confirmedLocalized, type Locale } from "../i18n/utils";
import type { BlogPost } from "./blog";
export function articleData(
  post: BlogPost,
  locale: Locale,
  url: string,
  image?: string,
): StructuredData {
  const data = post.data;
  const company = confirmedLocalized(site.companyName, locale);
  const origin = configuredOrigin(site.domain);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    url,
    mainEntityOfPage: url,
    headline: confirmedLocalized(data.title, locale),
    description: confirmedLocalized(data.description, locale),
    datePublished: data.date,
    dateModified: data.updated ?? data.date,
    inLanguage: locale === "zh" ? "zh-CN" : "en",
    ...(image && !/placeholder/i.test(data.cover.src) && { image }),
    ...(company && {
      publisher: {
        "@type": "Organization",
        name: company,
        ...(origin && { "@id": origin + "/#organization" }),
      },
    }),
  };
}
