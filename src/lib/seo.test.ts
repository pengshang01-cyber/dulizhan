import { describe, expect, it } from "vitest";
import { site } from "../config/site";
import {
  breadcrumbData,
  confirmedText,
  configuredOrigin,
  faqData,
  organizationData,
  permanentlyNoindex,
  productData,
  productMeta,
  serializeJsonLd,
} from "./seo";
import rawProduct from "../content/products/sample-standard-liner.json";
import type { ProductData } from "./products";

const product = {
  ...rawProduct,
  images: [
    {
      src: "/_astro/product-placeholder.webp",
      width: 400,
      height: 400,
      format: "webp",
    },
  ],
} as unknown as ProductData;
describe("truthful bilingual SEO", () => {
  it.each([
    "TODO_NAME",
    "TODO-001",
    "[TODO: company]",
    "Policy: [TODO: lead time]",
    "",
    undefined,
  ])("omits unconfirmed text %s", (value) =>
    expect(confirmedText(value)).toBeUndefined(),
  );
  it("keeps the configured organization URL and omits unconfirmed facts", () => {
    const data = JSON.parse(serializeJsonLd(organizationData("zh")));
    expect(data["@type"]).toBe("Organization");
    expect(data.url).toBe(site.domain + "/");
    for (const key of ["name", "telephone", "email", "logo", "sameAs"])
      expect(data).not.toHaveProperty(key);
  });
  it("uses confirmed Chinese facts from configuration", () => {
    const config = {
      ...site,
      companyName: { en: "Example test company", zh: "测试企业" },
      email: "test@example.test",
    };
    expect(organizationData("zh", config).name).toBe("测试企业");
    expect(organizationData("en", config).email).toBe("test@example.test");
  });
  it("does not invent product offers, ratings, reviews, SKU or placeholder photography", () => {
    const data = JSON.parse(
      serializeJsonLd(
        productData(product, "zh", "https://example.test/zh/product/"),
      ),
    );
    expect(data.name).toBe(rawProduct.title.en);
    for (const key of [
      "offers",
      "review",
      "aggregateRating",
      "sku",
      "material",
      "description",
      "image",
    ])
      expect(data).not.toHaveProperty(key);
    expect(JSON.stringify(data)).not.toContain("TODO");
  });
  it("prefers localized product SEO but generates text when missing or TODO", () => {
    const data = {
      ...product,
      seoTitle: { en: "English title", zh: "中文标题" },
      seoDescription: { en: "TODO_DESCRIPTION", zh: "" },
    };
    expect(productMeta(data, "zh").title).toBe("中文标题");
    expect(productMeta(data, "zh").description).toContain("咨询");
    expect(productMeta(product, "en").description).toContain(
      rawProduct.title.en,
    );
  });
  it("omits unconfirmed FAQ answers without changing confirmed visible text", () => {
    const result = faqData([
      { question: "Q?", answer: "[TODO: policy]" },
      { question: "可定制吗？", answer: "可以，请发设计稿。" },
    ]);
    expect(result?.mainEntity).toEqual([
      {
        "@type": "Question",
        name: "可定制吗？",
        acceptedAnswer: { "@type": "Answer", text: "可以，请发设计稿。" },
      },
    ]);
    expect(faqData([{ question: "Q?", answer: "TODO_A" }])).toBeUndefined();
  });
  it("uses Chinese breadcrumb URLs and strips unconfirmed labels", () => {
    const result = breadcrumbData(
      [
        { label: "首页", href: "/" },
        { label: "产品", href: "/products/" },
        { label: "TODO_NAME" },
      ],
      "zh",
      "https://example.test/zh/products/a/",
    );
    expect(result?.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "首页",
        item: "https://example.test/zh/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "产品",
        item: "https://example.test/zh/products/",
      },
    ]);
  });
  it("escapes script boundaries but preserves JSON values", () => {
    const value = { name: "</script><script>alert(1)</script>" };
    const serialized = serializeJsonLd(value);
    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toEqual(value);
  });
  it.each([
    "/inquiry/",
    "/zh/inquiry/",
    "/thank-you/",
    "/zh/thank-you/",
    "/styleguide/",
    "/404.html",
    "/zh/404.html",
    "/zh/404/",
  ])("excludes %s from sitemap", (path) =>
    expect(permanentlyNoindex(path)).toBe(true),
  );
  it.each([
    "",
    "TODO_DOMAIN",
    "javascript:alert(1)",
    "https://user:pass@example.test",
  ])("rejects invalid site origin %s", (domain) =>
    expect(configuredOrigin(domain)).toBeUndefined(),
  );
});
