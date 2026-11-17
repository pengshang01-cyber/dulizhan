import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { inquiryUtm } from "./inquiry-form";
import { COUNTRY_CODES } from "./inquiry-countries";
import en from "../i18n/en.json";
import zh from "../i18n/zh.json";

class Script extends EventTarget {
  src = "";
  async = false;
  defer = false;
  remove = vi.fn();
}
const asyncError =
  "[Cloudflare Turnstile] Remove async/defer from the Turnstile api.js script tag before using turnstile.ready().";
function mockApi(script: Script) {
  return {
    ready: vi.fn((callback: () => void) => {
      if (script.async || script.defer) {
        const error = new Error(asyncError);
        error.name = "TurnstileError";
        throw error;
      }
      callback();
    }),
    render: vi.fn(() => "test-widget"),
    reset: vi.fn(),
  };
}
let scripts: Script[];
beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  scripts = [];
  vi.stubGlobal("window", { setTimeout, clearTimeout });
  vi.stubGlobal("document", {
    createElement: () => new Script(),
    head: { append: (script: Script) => scripts.push(script) },
  });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
function onload(script: Script) {
  const name = new URL(script.src).searchParams.get("onload");
  expect(name).toBe("onInquiryTurnstileLoad");
  const callback = window[name as "onInquiryTurnstileLoad"];
  expect(callback).toBeTypeOf("function");
  return callback!;
}

describe("async Turnstile loader", () => {
  it("waits for the official onload callback, shares one request and never calls ready", async () => {
    const { loadTurnstile } = await import("./inquiry-form");
    const pending = loadTurnstile();
    expect(loadTurnstile()).toBe(pending);
    expect(scripts).toHaveLength(1);
    const script = scripts[0];
    expect(script.async).toBe(true);
    expect(new URL(script.src).searchParams.get("render")).toBe("explicit");
    const api = mockApi(script);
    window.turnstile = api;
    // API 全局对象可能早于其 onload 回调出现，不能绕过正在等待的 Promise。
    expect(loadTurnstile()).toBe(pending);
    let resolved = false;
    void pending.then(() => {
      resolved = true;
    });
    script.dispatchEvent(new Event("load"));
    await Promise.resolve();
    expect(resolved).toBe(false);
    onload(script)();
    expect(await pending).toBe(api);
    expect(api.ready).not.toHaveBeenCalled();
    expect(window.onInquiryTurnstileLoad).toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
    expect(await loadTurnstile()).toBe(api);
    expect(scripts).toHaveLength(1);
    script.dispatchEvent(new Event("error"));
    expect(script.remove).not.toHaveBeenCalled();
  });

  it("models the real async/defer ready error in the test API", () => {
    for (const attribute of ["async", "defer"] as const) {
      const script = new Script();
      script[attribute] = true;
      expect(() => mockApi(script).ready(vi.fn())).toThrow(asyncError);
    }
    const callback = vi.fn();
    mockApi(new Script()).ready(callback);
    expect(callback).toHaveBeenCalledOnce();
  });

  it("removes a failed script and can load again on retry", async () => {
    const { loadTurnstile } = await import("./inquiry-form");
    const first = loadTurnstile();
    const rejected = expect(first).rejects.toThrow("Turnstile unavailable");
    scripts[0].dispatchEvent(new Event("error"));
    await rejected;
    expect(scripts[0].remove).toHaveBeenCalledOnce();
    expect(window.onInquiryTurnstileLoad).toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
    const retry = loadTurnstile();
    expect(scripts).toHaveLength(2);
    const api = mockApi(scripts[1]);
    window.turnstile = api;
    onload(scripts[1])();
    expect(await retry).toBe(api);
  });

  it("times out after 15 seconds and ignores the previous attempt's late callback", async () => {
    const { loadTurnstile } = await import("./inquiry-form");
    const pending = loadTurnstile();
    const lateCallback = onload(scripts[0]);
    const rejected = expect(pending).rejects.toThrow("Turnstile unavailable");
    await vi.advanceTimersByTimeAsync(15000);
    await rejected;
    expect(scripts[0].remove).toHaveBeenCalledOnce();
    expect(window.onInquiryTurnstileLoad).toBeUndefined();
    const retry = loadTurnstile();
    const currentCallback = onload(scripts[1]);
    lateCallback();
    expect(window.onInquiryTurnstileLoad).toBe(currentCallback);
    const api = mockApi(scripts[1]);
    window.turnstile = api;
    currentCallback();
    expect(await retry).toBe(api);
  });

  it("rejects an onload callback without an API and remains retryable", async () => {
    const { loadTurnstile } = await import("./inquiry-form");
    const pending = loadTurnstile();
    const rejected = expect(pending).rejects.toThrow("Turnstile unavailable");
    onload(scripts[0])();
    await rejected;
    expect(window.onInquiryTurnstileLoad).toBeUndefined();
    const retry = loadTurnstile();
    window.turnstile = mockApi(scripts[1]);
    onload(scripts[1])();
    expect(await retry).toBe(window.turnstile);
  });

  it("reuses an API already loaded by the page without calling ready", async () => {
    const { loadTurnstile } = await import("./inquiry-form");
    const script = new Script();
    script.async = true;
    const api = mockApi(script);
    window.turnstile = api;
    expect(await loadTurnstile()).toBe(api);
    expect(scripts).toHaveLength(0);
    expect(api.ready).not.toHaveBeenCalled();
  });
});

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
