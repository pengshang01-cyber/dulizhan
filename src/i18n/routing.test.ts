import { describe, expect, it } from "vitest";
import { localeFromPath, localePath, unlocalizedPath } from "./routing";

describe("localized routes", () => {
  it.each([
    "/",
    "/products/",
    "/products/tulip-baking-cups/sample-tulip-cup/",
    "/contact/?from=inquiry#quote",
  ])("keeps the same page across languages: %s", (path) => {
    expect(localePath(path, "en")).toBe(path);
    expect(localePath(path, "zh")).toBe("/zh" + path);
    expect(localePath(localePath(path, "zh"), "zh")).toBe("/zh" + path);
    expect(localePath(localePath(path, "zh"), "en")).toBe(path);
  });
  it("only recognizes the complete zh path segment", () => {
    expect(localeFromPath("/zh/products/")).toBe("zh");
    expect(localeFromPath("/zhongwen/")).toBe("en");
    expect(unlocalizedPath("/zh")).toBe("/");
    expect(localePath("/zh?from=inquiry#quote", "en")).toBe(
      "/?from=inquiry#quote",
    );
  });
  it.each([
    "https://example.test/contact/",
    "//example.test/",
    "#quote",
    "mailto:test@example.test",
  ])("leaves external and fragment links alone: %s", (path) => {
    expect(localePath(path, "zh")).toBe(path);
  });
  it("does not invent a Chinese styleguide route", () => {
    expect(localePath("/styleguide/", "zh")).toBe("/styleguide/");
  });
});
