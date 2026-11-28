import { site, type SiteConfig } from "../config/site";
import { confirmedLocalized, t, type Locale } from "../i18n/utils";
import { localePath, unlocalizedPath } from "../i18n/routing";
import type { ProductData } from "./products";
import { confirmedText } from "./placeholders";
import { configuredOrigin } from "./indexing";
export { confirmedText, configuredOrigin };

export function permanentlyNoindex(path: string) {
  return /^\/(?:zh\/)?(?:inquiry|thank-you|styleguide|404(?:\.html)?)\/?$/.test(
    path,
  );
}

const staticPages: Record<string, string> = {
  "/": "home",
  "/products/": "products",
  "/custom/": "custom",
  "/about/": "about",
  "/blog/": "blog",
  "/faq/": "faq",
  "/contact/": "contact",
  "/inquiry/": "inquiry",
  "/thank-you/": "thankYou",
  "/privacy-policy/": "privacy",
  "/styleguide/": "styleguide",
  "/404.html": "notFound",
};
export function staticPageMeta(path: string, locale: Locale) {
  const bare = unlocalizedPath(path);
  const key = staticPages[bare] ?? staticPages[bare + "/"];
  return key
    ? {
        title: t(`seo.${key}.title`, locale),
        description: t(`seo.${key}.description`, locale),
      }
    : undefined;
}

export function productMeta(data: ProductData, locale: Locale) {
  const name = confirmedLocalized(data.title, locale) ?? data.slug;
  return {
    title:
      confirmedLocalized(data.seoTitle, locale) ||
      t("seo.product.title", locale, { name }),
    description:
      confirmedLocalized(data.seoDescription, locale) ||
      t("seo.product.description", locale, { name }),
  };
}

export type StructuredData = Record<string, unknown>;
export function organizationData(
  locale: Locale,
  config: SiteConfig = site,
  logo?: string,
  image?: string,
): StructuredData {
  const origin = configuredOrigin(config.domain);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    ...(origin && { "@id": origin + "/#organization", url: origin + "/" }),
    name: confirmedLocalized(config.companyName, locale),
    logo: config.logo && confirmedText(config.logo) ? logo : undefined,
    image,
    email: confirmedText(config.email),
    telephone: confirmedText(config.phone),
    address: confirmedLocalized(config.factoryAddress, locale),
    sameAs: Object.values(config.socialLinks)
      .map(confirmedText)
      .filter((url) => url !== undefined && configuredOrigin(url)),
  };
}

export function productData(
  data: ProductData,
  locale: Locale,
  url: string,
): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    url,
    name: confirmedLocalized(data.title, locale),
    description: confirmedLocalized(data.summary, locale),
    sku: confirmedText(data.sku),
    material: confirmedLocalized(data.material, locale),
    // 产品结构化数据仅引用已核对产品图。
    image: data.images
      .filter(
        ({ scene, sizeComparison, technicalDrawing }) =>
          !scene && !sizeComparison && !technicalDrawing,
      )
      .map(({ image }) => image)
      .filter(({ src }) => !/placeholder/i.test(src))
      .map(({ src }) => new URL(src, url).href),
  };
}

export function faqData(
  items: { question: string; answer: string }[],
): StructuredData | undefined {
  const mainEntity = items
    .filter(
      ({ question, answer }) =>
        confirmedText(question) && confirmedText(answer),
    )
    .map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    }));
  return mainEntity.length
    ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity }
    : undefined;
}

export function breadcrumbData(
  items: { label: string; href?: string }[],
  locale: Locale,
  currentUrl: string,
): StructuredData | undefined {
  const valid = items.filter(({ label }) => confirmedText(label));
  if (valid.length < 2) return;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: valid.map(({ label, href }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: label,
      item: href
        ? new URL(localePath(href, locale), currentUrl).href
        : currentUrl,
    })),
  };
}

// JSON.stringify 不转义 </script>；CMS 内容必须在 HTML 脚本边界再转义。
export function serializeJsonLd(value: StructuredData) {
  return JSON.stringify(value, (_, item: unknown) =>
    Array.isArray(item) && !item.length ? undefined : item,
  )
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
