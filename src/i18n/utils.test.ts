import { describe, expect, it, vi } from "vitest";
import { localized, t } from "./utils";

vi.mock("./zh.json", async (importOriginal) => {
  const actual = await importOriginal<{ default: Record<string, string> }>();
  return { default: { ...actual.default, "about.factoryImageAlt": "" } };
});

describe("localized content", () => {
  it("uses English on the English site even when Chinese is available", () => {
    expect(localized({ en: "Baking cup", zh: "烘焙杯" }, "en")).toBe(
      "Baking cup",
    );
  });
  it("uses a supplied Chinese value", () => {
    expect(localized({ en: "Baking cup", zh: "烘焙杯" }, "zh")).toBe("烘焙杯");
  });
  it.each([undefined, null, "", "   "])(
    "falls back for missing translation %j",
    (zh) => {
      expect(localized({ en: "TODO_PRODUCT_TITLE", zh }, "zh")).toBe(
        "TODO_PRODUCT_TITLE",
      );
    },
  );
  it("preserves shared numeric values, including zero", () => {
    expect(localized({ en: 0, zh: "" }, "zh")).toBe(0);
    expect(localized({ en: 10000 }, "en")).toBe(10000);
  });
  it("falls back to English UI text and interpolates values", () => {
    expect(t("about.factoryImageAlt", "zh", { label: "Workshop" })).toBe(
      "Workshop placeholder — actual factory photograph to be supplied",
    );
  });
  it("rejects missing UI keys rather than leaking a key to visitors", () => {
    expect(() => t("missing.test.key", "en")).toThrow("缺少界面翻译");
  });
});
