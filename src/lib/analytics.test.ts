import { describe, expect, it, vi } from "vitest";
import {
  CONSENT_KEY,
  createAnalytics,
  mapTrackedEvent,
  measurementId,
  readConsent,
  saveConsent,
  trackedEvents,
  type ConsentStorage,
} from "./analytics";

function fixture(initial: string | null = null) {
  let stored = initial;
  const storage = {
    getItem: vi.fn(() => stored),
    setItem: vi.fn((_key: string, value: string) => {
      stored = value;
    }),
  };
  const transport = { load: vi.fn(), disable: vi.fn(), send: vi.fn() };
  return { storage, transport, access: () => storage };
}
describe("optional analytics consent", () => {
  it.each(["", "  ", "TODO_GA_MEASUREMENT_ID", "TODO_GA", undefined, null])(
    "disables the shared server-side Cookie UI gate for %s",
    (value) => {
      expect(Boolean(measurementId(value))).toBe(false);
    },
  );
  it("restores the Cookie UI gate after entering a valid ID", () => {
    expect(Boolean(measurementId("G-ABC123"))).toBe(true);
  });
  it.each([
    undefined,
    "",
    "TODO_GA_MEASUREMENT_ID",
    "G-",
    "not-a-tag",
    "G-X?inject=1",
  ])("never loads or sends with ID %s, even after consent", (id) => {
    const f = fixture("accepted");
    const analytics = createAnalytics(id, f.access, f.transport);
    analytics.choose("accepted");
    analytics.track("generate_lead", "completion", "en");
    expect(f.transport.load).not.toHaveBeenCalled();
    expect(f.transport.send).not.toHaveBeenCalled();
  });
  it("does not load before consent, loads once after accepting and sends only later events", () => {
    const f = fixture();
    const analytics = createAnalytics("G-TEST123", f.access, f.transport);
    analytics.track("quote_button_click", "click", "en");
    expect(analytics.choice).toBeNull();
    expect(f.transport.load).not.toHaveBeenCalled();
    expect(analytics.choose("accepted")).toBe(true);
    analytics.choose("accepted");
    expect(f.transport.load).toHaveBeenCalledTimes(1);
    expect(f.transport.send).not.toHaveBeenCalled();
    analytics.track("quote_button_click", "click", "zh");
    expect(f.transport.send).toHaveBeenCalledExactlyOnceWith(
      "quote_button_click",
      { language: "zh" },
    );
    expect(f.storage.getItem()).toBe("accepted");
  });
  it("restores consent across pages and languages, and stops after revocation", () => {
    const f = fixture("accepted");
    const analytics = createAnalytics("G-TEST123", f.access, f.transport);
    expect(analytics.active).toBe(true);
    analytics.choose("rejected");
    analytics.track("email_click", "click", "en");
    expect(f.transport.disable).toHaveBeenCalledExactlyOnceWith("G-TEST123");
    expect(f.transport.send).not.toHaveBeenCalled();
    const next = createAnalytics("G-TEST123", f.access, f.transport);
    expect(next.choice).toBe("rejected");
    expect(f.transport.load).toHaveBeenCalledTimes(1);
  });
  it("honors a rejection made in another tab", () => {
    const f = fixture("accepted");
    const analytics = createAnalytics("G-TEST123", f.access, f.transport);
    f.storage.setItem(CONSENT_KEY, "rejected");
    analytics.refresh();
    expect(analytics.active).toBe(false);
    expect(f.transport.disable).toHaveBeenCalledTimes(1);
  });
  it.each(["getter", "read", "write"])(
    "defaults to rejection when storage %s fails",
    (failure) => {
      const f = fixture("accepted");
      const fail = () => {
        throw new Error("storage unavailable");
      };
      if (failure === "read") f.storage.getItem.mockImplementation(fail);
      if (failure === "write") f.storage.setItem.mockImplementation(fail);
      const access: ConsentStorage = failure === "getter" ? fail : f.access;
      expect(readConsent(access)).toBe("rejected");
      expect(saveConsent(access, "accepted")).toBe(false);
      const analytics = createAnalytics("G-TEST123", access, f.transport);
      analytics.choose("accepted");
      expect(analytics.active).toBe(false);
      expect(f.transport.load).not.toHaveBeenCalled();
    },
  );
  it("rejects an apparent write that did not persist", () => {
    const f = fixture();
    f.storage.setItem.mockImplementation(() => {});
    const analytics = createAnalytics("G-TEST123", f.access, f.transport);
    expect(analytics.choose("accepted")).toBe(false);
    expect(analytics.choice).toBe("rejected");
    expect(f.transport.load).not.toHaveBeenCalled();
  });
  it.each([null, "true", "yes", '{"accepted":true}'])(
    "does not interpret invalid stored value %s as consent",
    (value) => {
      const f = fixture(value);
      expect(readConsent(f.access)).toBeNull();
    },
  );
  it("accepts a trimmed valid measurement ID", () =>
    expect(measurementId(" G-ABC123 ")).toBe("G-ABC123"));
});
describe("event mapping", () => {
  it.each(trackedEvents)(
    "maps %s only from its intended action, always with language",
    (name) => {
      const source = [
        "wechat_copy",
        "add_to_inquiry",
        "generate_lead",
      ].includes(name)
        ? "completion"
        : "click";
      expect(mapTrackedEvent(name, source)).toBe(name);
      expect(
        mapTrackedEvent(name, source === "click" ? "completion" : "click"),
      ).toBeUndefined();
      const f = fixture("accepted");
      const analytics = createAnalytics("G-TEST123", f.access, f.transport);
      analytics.track(name, source, "zh");
      expect(f.transport.send).toHaveBeenCalledExactlyOnceWith(name, {
        language: "zh",
      });
    },
  );
  it("ignores unknown events and clicks on a successfully submitted form", () => {
    const f = fixture("accepted");
    const analytics = createAnalytics("G-TEST123", f.access, f.transport);
    analytics.track("unknown", "click", "en");
    analytics.track("generate_lead", "click", "en");
    expect(f.transport.send).not.toHaveBeenCalled();
  });
});
