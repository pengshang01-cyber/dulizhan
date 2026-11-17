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
  it("defaults to no indexing and requires an actual boolean to enable it", () => {
    const input = cmsSettings();
    delete input.allowIndexing;
    expect(siteSchema.parse(input).allowIndexing).toBe(false);
    input.allowIndexing = true;
    expect(siteSchema.parse(input).allowIndexing).toBe(true);
    input.allowIndexing = "true";
    expect(siteSchema.safeParse(input).success).toBe(false);
  });

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
      "logo",
      "ogImage",
      "homeHeroImage",
      "factoryVideoPoster",
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
    "replyTime",
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

describe("CMS page images", () => {
  it("restores gallery and alt defaults after CMS clears or omits fields", () => {
    for (const clear of [undefined, null]) {
      const result = siteSchema.parse({
        ...rawSite,
        aboutGallery: clear,
        homeHeroAlt: clear,
      });
      expect(result.aboutGallery).toEqual([]);
      expect(result.homeHeroAlt).toBeUndefined();
    }
    expect(
      siteSchema.parse({ ...rawSite, homeHeroAlt: {} }).homeHeroAlt,
    ).toBeUndefined();
  });
  it("accepts CMS-relative uploads, preserves order and optional Chinese captions", () => {
    const gallery = [
      {
        image: "../assets/images/site/packing.jpg",
        caption: { en: "Packing", zh: "包装" },
      },
      {
        image: "../assets/images/site/workshop/printing.webp",
        caption: { en: "Printing", zh: "" },
      },
    ];
    const result = siteSchema.parse({
      ...rawSite,
      aboutGallery: gallery,
      homeHeroAlt: { en: "Baking cups" },
    });
    expect(result.aboutGallery).toEqual(gallery);
    expect(result.homeHeroAlt?.en).toBe("Baking cups");
  });
  it.each(["logo", "ogImage", "homeHeroImage", "factoryVideoPoster"])(
    "rejects remote or escaping paths for %s",
    (key) => {
      for (const path of [
        "https://example.com/photo.jpg",
        "../assets/images/site/../private.jpg",
        "/public/logo.png",
        "../assets/images/site/image.svg",
      ]) {
        expect(siteSchema.safeParse({ ...rawSite, [key]: path }).success).toBe(
          false,
        );
      }
      expect(
        siteSchema.parse({
          ...rawSite,
          [key]: "../assets/images/site/cms-upload.png",
        })[key as "logo"],
      ).toBe("../assets/images/site/cms-upload.png");
    },
  );
  it("requires an uploaded image and English caption for a gallery item", () => {
    for (const item of [
      { caption: { en: "Workshop" } },
      { image: "../assets/images/site/a.jpg", caption: { zh: "车间" } },
    ]) {
      expect(
        siteSchema.safeParse({ ...rawSite, aboutGallery: [item] }).success,
      ).toBe(false);
    }
    expect(
      siteSchema.safeParse({ ...rawSite, homeHeroAlt: { zh: "纸杯" } }).success,
    ).toBe(false);
  });
});
