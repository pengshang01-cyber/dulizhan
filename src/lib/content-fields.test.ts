import { describe, expect, it } from "vitest";
import {
  localizedText,
  optionalLocalizedText,
  sharedMeasurement,
} from "./content-fields";

describe("CMS bilingual fields", () => {
  it.each([undefined, null, {}, { en: "", zh: "" }])(
    "hides an empty optional block %j",
    (value) => {
      expect(optionalLocalizedText.parse(value)).toBeUndefined();
    },
  );
  it("requires English when a block contains Chinese", () => {
    expect(optionalLocalizedText.safeParse({ zh: "定制选项" }).success).toBe(
      false,
    );
    expect(localizedText.safeParse({ en: "", zh: "标题" }).success).toBe(false);
  });
  it("accepts CMS numeric text and TODO without inventing measurements", () => {
    expect(sharedMeasurement.parse("35.5")).toBe(35.5);
    expect(sharedMeasurement.parse(".5")).toBe(0.5);
    expect(sharedMeasurement.parse("0.5")).toBe(0.5);
    expect(sharedMeasurement.parse("TODO_HEIGHT_MM")).toBe("TODO_HEIGHT_MM");
    expect(sharedMeasurement.safeParse("35 mm").success).toBe(false);
    expect(sharedMeasurement.safeParse("0").success).toBe(false);
  });
});
