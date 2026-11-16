import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { InquiryProduct } from "./inquiry";

const key = "inquiry:v1";
const first: InquiryProduct = {
  slug: "example-standard-liner",
  sku: "TODO-001",
  title: "TODO_STANDARD_LINER",
  category: "standard-liners",
};
const second: InquiryProduct = {
  slug: "example-tulip-cup",
  sku: "TODO-002",
  title: "TODO_TULIP_CUP",
  category: "tulip-cups",
};

function createStorage() {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: vi.fn(() => data.clear()),
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    key: vi.fn((index: number) => [...data.keys()][index] ?? null),
    removeItem: vi.fn((key: string) => {
      data.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value);
    }),
  } satisfies Storage;
}

let storage: ReturnType<typeof createStorage>;
let browser: EventTarget & { localStorage: Storage };

beforeEach(() => {
  vi.resetModules();
  storage = createStorage();
  browser = Object.assign(new EventTarget(), { localStorage: storage });
  vi.stubGlobal("window", browser);
});

afterEach(() => vi.unstubAllGlobals());

describe("inquiry list", () => {
  it("adds products once, retains quantities, and removes and clears items", async () => {
    const store = await import("./inquiry");
    expect(store.addItem(first)).toBe(true);
    expect(store.getItems()).toEqual([{ ...first, quantity: null }]);
    expect(store.setQuantity(first.slug, 250)).toBe(true);
    expect(store.addItem(first)).toBe(false);
    expect(store.getItems()[0]?.quantity).toBe(250);
    store.addItem(second);
    expect(store.removeItem(first.slug)).toBe(true);
    expect(store.getItems()).toEqual([{ ...second, quantity: null }]);
    expect(store.clearItems()).toBe(true);
    expect(store.getItems()).toEqual([]);
    expect(JSON.parse(storage.getItem(key) ?? "null")).toEqual([]);
  });

  it("restores a saved list in a new page module", async () => {
    const store = await import("./inquiry");
    store.addItem(first);
    store.setQuantity(first.slug, 12);
    vi.resetModules();
    const nextPage = await import("./inquiry");
    expect(nextPage.getItems()).toEqual([{ ...first, quantity: 12 }]);
  });

  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid quantity %s without changing persisted data",
    async (quantity) => {
      const store = await import("./inquiry");
      store.addItem(first);
      const saved = storage.getItem(key);
      expect(store.setQuantity(first.slug, quantity)).toBe(false);
      expect(store.getItems()[0]?.quantity).toBe(null);
      expect(storage.getItem(key)).toBe(saved);
    },
  );

  it("dispatches change only for actual mutations", async () => {
    const changed = vi.fn();
    browser.addEventListener("inquiry:change", changed);
    const store = await import("./inquiry");
    store.getItems();
    store.clearItems();
    store.removeItem("missing");
    store.setQuantity("missing", 2);
    expect(changed).not.toHaveBeenCalled();
    store.addItem(first);
    store.addItem(first);
    store.setQuantity(first.slug, null);
    expect(changed).toHaveBeenCalledTimes(1);
    store.setQuantity(first.slug, 2);
    store.removeItem(first.slug);
    expect(changed).toHaveBeenCalledTimes(3);
  });

  it("protects stored state from mutation through returned objects", async () => {
    const store = await import("./inquiry");
    store.addItem(first);
    const exposed = store.getItems();
    exposed[0]!.quantity = 0;
    exposed.length = 0;
    expect(store.getItems()).toEqual([{ ...first, quantity: null }]);
  });

  it("continues in memory when the localStorage getter throws", async () => {
    Object.defineProperty(browser, "localStorage", {
      get() {
        throw new Error("Storage blocked");
      },
    });
    const store = await import("./inquiry");
    expect(() => store.addItem(first)).not.toThrow();
    store.setQuantity(first.slug, 8);
    store.addItem(second);
    store.removeItem(second.slug);
    expect(store.getItems()).toEqual([{ ...first, quantity: 8 }]);
    store.clearItems();
    expect(store.getItems()).toEqual([]);
  });

  it("continues in memory when reading storage fails", async () => {
    storage.getItem.mockImplementation(() => {
      throw new Error("Read blocked");
    });
    const store = await import("./inquiry");
    expect(store.getItems()).toEqual([]);
    store.addItem(first);
    expect(store.getItems()).toEqual([{ ...first, quantity: null }]);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("keeps recent mutations after writes fail instead of restoring stale storage", async () => {
    storage.setItem(key, JSON.stringify([{ ...first, quantity: 6 }]));
    storage.setItem.mockImplementation(() => {
      throw new Error("Quota exceeded");
    });
    const store = await import("./inquiry");
    expect(store.getItems()[0]?.quantity).toBe(6);
    expect(() => store.setQuantity(first.slug, 7)).not.toThrow();
    store.addItem(second);
    expect(store.getItems()).toEqual([
      { ...first, quantity: 7 },
      { ...second, quantity: null },
    ]);
    browser.dispatchEvent(
      Object.assign(new Event("pageshow"), { persisted: true }),
    );
    expect(store.getItems()[0]?.quantity).toBe(7);
    store.removeItem(first.slug);
    expect(store.getItems()).toEqual([{ ...second, quantity: null }]);
    store.clearItems();
    expect(store.getItems()).toEqual([]);
  });

  it("recovers from malformed JSON on the next saved change", async () => {
    storage.setItem(key, "{broken");
    const store = await import("./inquiry");
    expect(store.getItems()).toEqual([]);
    store.addItem(first);
    expect(JSON.parse(storage.getItem(key) ?? "null")).toEqual([
      { ...first, quantity: null },
    ]);
  });

  it("filters invalid saved products, routes, quantities, and duplicates", async () => {
    storage.setItem(
      key,
      JSON.stringify([
        null,
        { ...first, slug: "../unsafe", quantity: 1 },
        { ...first, category: "../invalid", quantity: 1 },
        { ...first, title: "", quantity: 1 },
        { ...first, sku: "", quantity: 1 },
        { ...first, quantity: "2" },
        { ...first, quantity: 3, unknown: "ignored" },
        { ...first, quantity: 4 },
        { ...second, quantity: -1 },
      ]),
    );
    const store = await import("./inquiry");
    expect(store.getItems()).toEqual([{ ...first, quantity: 3 }]);
    expect(store.addItem({ ...second, category: "../invalid" })).toBe(false);
  });

  it("restores fresh storage when returning through the browser back cache", async () => {
    const store = await import("./inquiry");
    store.addItem(first);
    storage.setItem(key, JSON.stringify([{ ...second, quantity: 2 }]));
    const changed = vi.fn();
    browser.addEventListener("inquiry:change", changed);
    browser.dispatchEvent(
      Object.assign(new Event("pageshow"), { persisted: true }),
    );
    expect(store.getItems()).toEqual([{ ...second, quantity: 2 }]);
    expect(changed).toHaveBeenCalledOnce();
  });

  it("saves a cleared quantity as null and restores it on the next page", async () => {
    const store = await import("./inquiry");
    store.addItem(first);
    store.setQuantity(first.slug, 10000);
    const changed = vi.fn();
    browser.addEventListener("inquiry:change", changed);
    expect(store.setQuantity(first.slug, null)).toBe(true);
    expect(store.setQuantity(first.slug, null)).toBe(false);
    expect(changed).toHaveBeenCalledOnce();
    expect(JSON.parse(storage.getItem(key) ?? "null")).toEqual([
      { ...first, quantity: null },
    ]);
    vi.resetModules();
    expect((await import("./inquiry")).getItems()).toEqual([
      { ...first, quantity: null },
    ]);
  });

  it("preserves legacy positive quantities including 1 and accepts missing quantities", async () => {
    storage.setItem(key, JSON.stringify([{ ...first, quantity: 1 }, second]));
    const store = await import("./inquiry");
    expect(store.getItems()).toEqual([
      { ...first, quantity: 1 },
      { ...second, quantity: null },
    ]);
  });

  it("keeps clearing quantities usable when storage writes fail", async () => {
    storage.setItem(key, JSON.stringify([{ ...first, quantity: 12 }]));
    storage.setItem.mockImplementation(() => {
      throw new Error("Quota exceeded");
    });
    const store = await import("./inquiry");
    expect(() => store.setQuantity(first.slug, null)).not.toThrow();
    expect(store.getItems()).toEqual([{ ...first, quantity: null }]);
    store.setQuantity(first.slug, 10000);
    expect(store.getItems()[0]?.quantity).toBe(10000);
    store.setQuantity(first.slug, null);
    expect(store.getItems()[0]?.quantity).toBe(null);
  });

  it("imports and reads safely without browser globals", async () => {
    vi.stubGlobal("window", undefined);
    const store = await import("./inquiry");
    expect(store.getItems()).toEqual([]);
    expect(store.addItem(first)).toBe(false);
    expect(store.removeItem(first.slug)).toBe(false);
    expect(store.setQuantity(first.slug, 1)).toBe(false);
    expect(store.clearItems()).toBe(false);
  });
});

describe("dynamic category ids", () => {
  it("accepts a newly created category without a bundled category list", async () => {
    const store = await import("./inquiry");
    expect(
      store.addItem({ ...first, category: "cms-added-category-2026" }),
    ).toBe(true);
    expect(store.getItems()[0]?.category).toBe("cms-added-category-2026");
  });

  it.each([
    "",
    "Upper-Case",
    "../category",
    "category.json",
    "category/child",
    "category_",
  ])("rejects unsafe category id %j", async (category) => {
    const store = await import("./inquiry");
    expect(store.addItem({ ...first, category })).toBe(false);
    expect(store.getItems()).toEqual([]);
  });
});

describe("quantity input", () => {
  it.each([
    ["", null],
    ["   ", null],
    ["1", 1],
    ["10000", 10000],
    ["10,000", 10000],
    ["1,000,000", 1000000],
    [" 250 ", 250],
    ["9007199254740991", Number.MAX_SAFE_INTEGER],
  ])("parses %j as %s", async (input, expected) => {
    const { parseQuantityInput } = await import("./inquiry");
    expect(parseQuantityInput(input as string)).toBe(expected);
  });

  it.each([
    "0",
    "-1",
    "1.5",
    "1e3",
    "+1",
    "NaN",
    "Infinity",
    "10,00",
    "1,00,000",
    "1000,000",
    "0,001",
    "10,",
    "9,007,199,254,740,992",
    "9007199254740992",
  ])("rejects invalid input %j", async (input) => {
    const { parseQuantityInput } = await import("./inquiry");
    expect(parseQuantityInput(input)).toBeUndefined();
  });
});
