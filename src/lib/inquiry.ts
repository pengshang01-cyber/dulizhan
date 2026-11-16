import { productCategories } from "../config/categories";

export interface InquiryProduct {
  slug: string;
  sku: string;
  title: string;
  category: string;
}

export interface InquiryItem extends InquiryProduct {
  quantity: number | null;
}

export const INQUIRY_STORAGE_KEY = "inquiry:v1";
export const INQUIRY_CHANGE_EVENT = "inquiry:change";

const categories = new Set<string>(productCategories.map(({ id }) => id));
let items: InquiryItem[] = [];
let initialized = false;
let storage: Storage | null = null;

function isProduct(value: unknown): value is InquiryProduct {
  if (!value || typeof value !== "object") return false;
  const product = value as Record<string, unknown>;
  return (
    typeof product.slug === "string" &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug) &&
    typeof product.sku === "string" &&
    product.sku.trim().length > 0 &&
    typeof product.title === "string" &&
    product.title.trim().length > 0 &&
    typeof product.category === "string" &&
    categories.has(product.category)
  );
}

function isQuantity(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

// 空值表示待商议；输入框允许规范千分位，存储中只保留数值或 null。
export function parseQuantityInput(value: string): number | null | undefined {
  const input = value.trim();
  if (!input) return null;
  if (!/^\d+$/.test(input) && !/^[1-9]\d{0,2}(,\d{3})+$/.test(input)) {
    return undefined;
  }
  const quantity = Number(input.replaceAll(",", ""));
  return isQuantity(quantity) ? quantity : undefined;
}

function normalize(value: unknown): InquiryItem[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: InquiryItem[] = [];
  for (const candidate of value) {
    if (!isProduct(candidate)) continue;
    // 保留旧版本的正整数数量；缺少字段和显式 null 都归一为待商议。
    const quantity =
      (candidate as InquiryProduct & { quantity?: unknown }).quantity ?? null;
    if (
      (quantity !== null && !isQuantity(quantity)) ||
      seen.has(candidate.slug)
    ) {
      continue;
    }
    const { slug, sku, title, category } = candidate;
    result.push({ slug, sku, title, category, quantity });
    seen.add(slug);
  }
  return result;
}

function initialize(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  // localStorage 属性访问也可能抛错；读取失败后只保留当前页面内存。
  try {
    storage = window.localStorage;
    const saved = storage.getItem(INQUIRY_STORAGE_KEY);
    if (saved) {
      try {
        items = normalize(JSON.parse(saved));
      } catch {
        items = [];
      }
    }
  } catch {
    storage = null;
  }
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted || !storage) return;
    try {
      const next = normalize(
        JSON.parse(storage.getItem(INQUIRY_STORAGE_KEY) ?? "[]"),
      );
      if (JSON.stringify(next) !== JSON.stringify(items)) {
        items = next;
        window.dispatchEvent(new Event(INQUIRY_CHANGE_EVENT));
      }
    } catch {
      storage = null;
    }
  });
}

function save(next: InquiryItem[]): void {
  items = next;
  if (storage) {
    try {
      storage.setItem(INQUIRY_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // 写入失败后不再读取旧存储，避免覆盖用户本页的新操作。
      storage = null;
    }
  }
  window.dispatchEvent(new Event(INQUIRY_CHANGE_EVENT));
}

export function getItems(): InquiryItem[] {
  initialize();
  return typeof window === "undefined"
    ? []
    : items.map((item) => ({ ...item }));
}

export function addItem(product: InquiryProduct): boolean {
  initialize();
  if (
    typeof window === "undefined" ||
    !isProduct(product) ||
    items.some(({ slug }) => slug === product.slug)
  ) {
    return false;
  }
  const { slug, sku, title, category } = product;
  save([...items, { slug, sku, title, category, quantity: null }]);
  return true;
}

export function removeItem(slug: string): boolean {
  initialize();
  if (typeof window === "undefined") return false;
  const next = items.filter((item) => item.slug !== slug);
  if (next.length === items.length) return false;
  save(next);
  return true;
}

export function setQuantity(slug: string, quantity: number | null): boolean {
  initialize();
  if (
    typeof window === "undefined" ||
    (quantity !== null && !isQuantity(quantity))
  )
    return false;
  const item = items.find((item) => item.slug === slug);
  if (!item || item.quantity === quantity) return false;
  save(
    items.map((item) => (item.slug === slug ? { ...item, quantity } : item)),
  );
  return true;
}

export function clearItems(): boolean {
  initialize();
  if (typeof window === "undefined" || items.length === 0) return false;
  save([]);
  return true;
}
