export const CONSENT_KEY = "analytics-consent:v1";
export type Consent = "accepted" | "rejected" | null;
export type ConsentStorage = () => Pick<Storage, "getItem" | "setItem">;
export const trackedEvents = [
  "whatsapp_click",
  "wechat_open",
  "wechat_copy",
  "email_click",
  "phone_click",
  "quote_button_click",
  "add_to_inquiry",
  "generate_lead",
] as const;
export type TrackedEvent = (typeof trackedEvents)[number];
export type EventSource = "click" | "completion";
const completionEvents: readonly string[] = [
  "wechat_copy",
  "add_to_inquiry",
  "generate_lead",
];

export function measurementId(value: unknown): string | undefined {
  return typeof value === "string" && /^G-[A-Z0-9]+$/.test(value.trim())
    ? value.trim()
    : undefined;
}
export function mapTrackedEvent(
  name: string,
  source: EventSource,
): TrackedEvent | undefined {
  if (!(trackedEvents as readonly string[]).includes(name)) return;
  if (completionEvents.includes(name) !== (source === "completion")) return;
  return name as TrackedEvent;
}
export function readConsent(storage: ConsentStorage): Consent {
  try {
    const store = storage();
    const value = store.getItem(CONSENT_KEY);
    if (value !== "accepted" && value !== "rejected") return null;
    // 已保存的同意也要求存储仍可写，避免写失败后无法持久撤回。
    store.setItem(CONSENT_KEY, value);
    return value;
  } catch {
    return "rejected";
  }
}
export function saveConsent(
  storage: ConsentStorage,
  choice: Exclude<Consent, null>,
): boolean {
  try {
    const store = storage();
    store.setItem(CONSENT_KEY, choice);
    return store.getItem(CONSENT_KEY) === choice;
  } catch {
    return false;
  }
}

interface AnalyticsTransport {
  load: (id: string) => void;
  disable: (id: string) => void;
  send: (event: TrackedEvent, params: { language: "en" | "zh" }) => void;
}
export function createAnalytics(
  value: unknown,
  storage: ConsentStorage,
  transport: AnalyticsTransport,
) {
  const id = measurementId(value);
  let choice = readConsent(storage);
  let active = false;
  function sync() {
    const allowed = Boolean(id && choice === "accepted");
    if (allowed && !active) {
      active = true;
      transport.load(id!);
    } else if (!allowed && active) {
      active = false;
      transport.disable(id!);
    }
  }
  sync();
  return {
    get choice() {
      return choice;
    },
    get active() {
      return active;
    },
    choose(next: Exclude<Consent, null>) {
      const saved = saveConsent(storage, next);
      choice = saved ? next : "rejected";
      sync();
      return saved;
    },
    refresh() {
      choice = readConsent(storage);
      sync();
    },
    track(name: string, source: EventSource, language: "en" | "zh") {
      const event = mapTrackedEvent(name, source);
      if (active && event) transport.send(event, { language });
    },
  };
}

// 成功动作由业务组件发出，避免复制失败、移出清单和校验失败计为转化。
export function completedTracking(element: HTMLElement, event: TrackedEvent) {
  element.dispatchEvent(
    new CustomEvent("analytics:complete", { bubbles: true, detail: { event } }),
  );
}
