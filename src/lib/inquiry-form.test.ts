import { describe, expect, it } from "vitest";
import { inquiryUtm } from "./inquiry-form";
import { COUNTRY_CODES } from "./inquiry-countries";
import en from "../i18n/en.json";
import zh from "../i18n/zh.json";

describe("inquiry form metadata", () => {
  it("includes only supported UTM parameters and preserves decoded values", () => {
    const url = new URL(
      "https://example.com/zh/contact/?utm_source=search&utm_medium=paid&utm_campaign=summer%20cups&utm_term=baking&utm_content=hero&email=private%40example.com&from=inquiry",
    );
    expect(inquiryUtm(url)).toEqual({
      utm_source: "search",
      utm_medium: "paid",
      utm_campaign: "summer cups",
      utm_term: "baking",
      utm_content: "hero",
    });
  });
  it("does not add missing or empty UTM values", () => {
    expect(inquiryUtm(new URL("https://example.com/?utm_source="))).toEqual({});
  });
  it("provides translated names for every unique country option", () => {
    expect(new Set(COUNTRY_CODES).size).toBe(COUNTRY_CODES.length);
    for (const code of COUNTRY_CODES) {
      expect((en as Record<string, string>)["country." + code]).toBeTruthy();
      expect((zh as Record<string, string>)["country." + code]).toBeTruthy();
    }
  });
});
