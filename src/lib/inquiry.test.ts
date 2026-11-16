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
    expect(store.getItems()).toEqual([{ ...first, quantity: 1 }]);
    expect(store.setQuantity(first.slug, 250)).toBe(true);
    expect(store.addItem(first)).toBe(false);
    expect(store.getItems()[0]?.quantity).toBe(250);
    store.addItem(second);
    expect(store.removeItem(first.slug)).toBe(true);
    expect(store.getItems()).toEqual([{ ...second, quantity: 1 }]);
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
      expect(store.getItems()[0]?.quantity).toBe(1);
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
    store.setQuantity(first.slug, 1);
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
    expect(store.getItems()).toEqual([{ ...first, quantity: 1 }]);
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
    expect(store.getItems()).toEqual([{ ...first, quantity: 1 }]);
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
      { ...second, quantity: 1 },
    ]);
    browser.dispatchEvent(
      Object.assign(new Event("pageshow"), { persisted: true }),
    );
    expect(store.getItems()[0]?.quantity).toBe(7);
    store.removeItem(first.slug);
    expect(store.getItems()).toEqual([{ ...second, quantity: 1 }]);
    store.clearItems();
    expect(store.getItems()).toEqual([]);
  });

  it("recovers from malformed JSON on the next saved change", async () => {
    storage.setItem(key, "{broken");
    const store = await import("./inquiry");
    expect(store.getItems()).toEqual([]);
    store.addItem(first);
    expect(JSON.parse(storage.getItem(key) ?? "null")).toEqual([
      { ...first, quantity: 1 },
    ]);
  });

  it("filters invalid saved products, routes, quantities, and duplicates", async () => {
    storage.setItem(
      key,
      JSON.stringify([
        null,
        { ...first, slug: "../unsafe", quantity: 1 },
        { ...first, category: "unknown", quantity: 1 },
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
    expect(store.addItem({ ...second, category: "unknown" })).toBe(false);
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
