import { describe, expect, it } from "vitest";
import rawSite from "../data/site.json";
import { getWhatsAppHref, siteSchema } from "./site";

const emptySocialLinks = {
  youtube: "",
  tiktok: "",
  instagram: "",
  facebook: "",
  pinterest: "",
  linkedin: "",
};

function cmsSettings(): Record<string, unknown> {
  return structuredClone(rawSite);
}

describe("website settings saved by Pages CMS", () => {
  it("restores optional text and image fields omitted after clearing them", () => {
    const input = cmsSettings();
    const fields = [
      "domain",
      "email",
      "phone",
      "whatsappNumber",
      "youtubeVideoId",
      "wechatId",
      "wechatQr",
    ] as const;
    fields.forEach((key) => delete input[key]);

    const result = siteSchema.parse(input);
    fields.forEach((key) => expect(result[key]).toBe(""));
    expect(getWhatsAppHref(result.whatsappNumber, "")).toBeUndefined();
  });

  it("restores empty lists when CMS omits their keys", () => {
    const input = cmsSettings();
    delete input.topBarItems;
    delete input.stats;
    delete input.certificates;

    const result = siteSchema.parse(input);
    expect(result.topBarItems).toEqual([]);
    expect(result.stats).toEqual([]);
    expect(result.certificates).toEqual([]);
  });

  it("restores a missing social-links object and missing individual links", () => {
    const input = cmsSettings();
    delete input.socialLinks;
    expect(siteSchema.parse(input).socialLinks).toEqual(emptySocialLinks);

    input.socialLinks = { youtube: "https://example.test/channel" };
    expect(siteSchema.parse(input).socialLinks).toEqual({
      ...emptySocialLinks,
      youtube: "https://example.test/channel",
    });
  });

  it("preserves shared zero values and handles a missing certificate image", () => {
    const input = cmsSettings();
    input.stats = [{ value: 0, label: { en: "TODO_STAT_LABEL" } }];
    input.certificates = [{ name: { en: "TODO_CERTIFICATE_NAME" } }];

    const result = siteSchema.parse(input);
    expect(result.stats[0].value).toBe(0);
    expect(result.certificates[0].imagePath).toBe("");
  });

  it.each([
    "companyName",
    "shortName",
    "tagline",
    "factoryAddress",
    "whatsappPrefillMessage",
    "stockMoq",
    "customMoq",
    "sampleLeadTime",
    "productionLeadTime",
    "sampleCost",
    "paymentTerms",
    "shippingMethods",
  ])("still requires English for %s", (key) => {
    const input = cmsSettings();
    delete input[key];
    expect(siteSchema.safeParse(input).success).toBe(false);
    input[key] = { zh: "待工厂确认" };
    expect(siteSchema.safeParse(input).success).toBe(false);
  });

  it("does not accept invalid types as empty optional values", () => {
    const input = cmsSettings();
    input.email = 123;
    expect(siteSchema.safeParse(input).success).toBe(false);
    delete input.email;
    input.certificates = "invalid";
    expect(siteSchema.safeParse(input).success).toBe(false);
  });
});
