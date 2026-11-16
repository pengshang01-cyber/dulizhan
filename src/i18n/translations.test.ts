import { describe, expect, it } from "vitest";
import en from "./en.json";
import zh from "./zh.json";
import faq from "../data/faq.json";
import customization from "../data/customization.json";

const tokens = (value: string) =>
  (value.match(/\{\{[^{}]+\}\}|\{[^{}]+\}/g) ?? []).sort();

describe("Chinese interface translations", () => {
  it("provides a nonempty Chinese translation for every English key", () => {
    expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort());
    for (const [key, value] of Object.entries(zh)) {
      expect(value.trim(), key).not.toBe("");
    }
  });

  it("preserves interface interpolation tokens", () => {
    const chinese = zh as Record<string, string>;
    for (const [key, value] of Object.entries(en)) {
      expect(tokens(chinese[key]), key).toEqual(tokens(value));
    }
  });

  it("translates FAQ and customization content without losing policy tokens", () => {
    const values = [
      ...faq.flatMap(({ q, a }) => [q, a]),
      ...customization.flatMap(({ title, description }) => [
        title,
        description,
      ]),
    ];
    for (const value of values) {
      expect(value.zh.trim(), value.en).not.toBe("");
      expect(tokens(value.zh), value.en).toEqual(tokens(value.en));
    }
  });
});
