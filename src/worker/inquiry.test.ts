import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  INQUIRY_LIMITS,
  validateInquiryPayload,
  type InquiryPayload,
} from "../lib/inquiry-payload";
import { buildInquiryEmail } from "./email";
import { handleRequest, type Env } from "./index";

const payload: InquiryPayload = {
  name: "Test Buyer",
  email: "buyer@example.com",
  company: "Test Company",
  country: "GB",
  phone: "+44 00000000",
  wechatId: "test-only",
  productInterest: "tulip-baking-cups",
  productSlug: "sample-cup",
  quantity: "10000-49999",
  message: "Please quote the attached selection.",
  samples: true,
  items: [
    {
      slug: "sample-cup",
      sku: "TODO-001",
      title: "Test cup",
      category: "tulip-baking-cups",
      quantity: null,
    },
    {
      slug: "second-cup",
      sku: "TODO-002",
      title: "Second test cup",
      category: "standard-cupcake-liners",
      quantity: 10000,
    },
  ],
  locale: "en",
  sourceUrl: "https://example.com/contact/?from=inquiry",
  utm: { utm_source: "test", utm_campaign: "test campaign" },
  turnstileToken: "test-only-token",
  website: "",
};

const environment = (): Env => ({
  ASSETS: { fetch: vi.fn(async () => new Response("static page")) },
  TURNSTILE_SECRET_KEY: "TEST_ONLY_NOT_A_SECRET",
  RESEND_API_KEY: "TEST_ONLY_NOT_AN_API_KEY",
  INQUIRY_TO_EMAIL: "sales@example.com",
  INQUIRY_FROM_EMAIL: "website@example.com",
});

function request(value: unknown = payload, options: RequestInit = {}) {
  return new Request("https://example.com/api/inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
    ...options,
  });
}
function successfulFetch() {
  return vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(Response.json({ success: true }))
    .mockResolvedValueOnce(Response.json({ id: "test-message-id" }));
}

describe("inquiry payload validation", () => {
  it("accepts the form contract with nullable line quantities", () => {
    expect(validateInquiryPayload(payload)).toEqual({
      ok: true,
      data: payload,
    });
  });
  it.each([
    "name",
    "email",
    "country",
    "message",
    "sourceUrl",
    "turnstileToken",
  ])("requires %s", (field) => {
    expect(validateInquiryPayload({ ...payload, [field]: "" })).toMatchObject({
      ok: false,
      fields: { [field]: "required" },
    });
  });
  it.each([
    ["name", "x".repeat(INQUIRY_LIMITS.name + 1)],
    ["message", "x".repeat(INQUIRY_LIMITS.message + 1)],
    ["turnstileToken", "x".repeat(INQUIRY_LIMITS.turnstileToken + 1)],
    ["phone", "x".repeat(INQUIRY_LIMITS.phone + 1)],
  ])("limits %s length", (field, value) => {
    expect(
      validateInquiryPayload({ ...payload, [field]: value }),
    ).toMatchObject({ ok: false, fields: { [field]: "too_long" } });
  });
  it.each([
    ["email", "invalid"],
    ["email", "buyer@example.com\nBcc:other@example.com"],
    ["name", "Buyer\r\nInjected"],
    ["country", "ZZ"],
    ["country", "cn"],
    ["locale", "fr"],
    ["sourceUrl", "javascript:alert(1)"],
    ["sourceUrl", "https://user:password@example.com"],
    ["quantity", "invented"],
    ["samples", "yes"],
    ["productSlug", "../path"],
    ["items", {}],
    ["utm", []],
  ])("rejects malformed %s", (field, value) => {
    expect(validateInquiryPayload({ ...payload, [field]: value }).ok).toBe(
      false,
    );
  });
  it.each([0, -1, 1.5, "10", "", Number.MAX_SAFE_INTEGER + 1, undefined])(
    "rejects invalid line quantity %s",
    (quantity) => {
      expect(
        validateInquiryPayload({
          ...payload,
          items: [{ ...payload.items[0], quantity }],
        }),
      ).toMatchObject({ ok: false, fields: { items: "invalid" } });
    },
  );
  it("accepts 50 products and rejects 51", () => {
    const items = Array.from({ length: 51 }, (_, index) => ({
      ...payload.items[0]!,
      slug: `test-${index}`,
    }));
    expect(
      validateInquiryPayload({ ...payload, items: items.slice(0, 50) }).ok,
    ).toBe(true);
    expect(validateInquiryPayload({ ...payload, items })).toMatchObject({
      ok: false,
      fields: { items: "too_long" },
    });
  });
  it("rejects duplicate products, oversized line metadata and unknown UTM keys", () => {
    expect(
      validateInquiryPayload({
        ...payload,
        items: [payload.items[0], payload.items[0]],
      }).ok,
    ).toBe(false);
    expect(
      validateInquiryPayload({
        ...payload,
        items: [{ ...payload.items[0], title: "x".repeat(301) }],
      }).ok,
    ).toBe(false);
    expect(
      validateInquiryPayload({ ...payload, utm: { secret: "not a campaign" } })
        .ok,
    ).toBe(false);
    expect(
      validateInquiryPayload({
        ...payload,
        utm: { utm_source: "x".repeat(301) },
      }).ok,
    ).toBe(false);
  });
  it.each([null, [], "text", 1])("rejects a non-object body %s", (value) => {
    expect(validateInquiryPayload(value).ok).toBe(false);
  });
});

describe("Worker inquiry API", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });
  afterEach(() => vi.restoreAllMocks());

  it.each(["GET", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])(
    "returns 405 for %s",
    async (method) => {
      const fetcher = successfulFetch();
      const response = await handleRequest(
        new Request("https://example.com/api/inquiry", { method }),
        environment(),
        { fetch: fetcher },
      );
      expect(response.status).toBe(405);
      expect(response.headers.get("Allow")).toBe("POST");
      expect(fetcher).not.toHaveBeenCalled();
    },
  );
  it("serves non-API requests through the original ASSETS binding", async () => {
    const env = environment();
    const incoming = new Request("https://example.com/zh/missing/");
    env.ASSETS.fetch = vi.fn(
      async () =>
        new Response("asset 404", {
          status: 404,
          headers: { "X-Robots-Tag": "noindex, nofollow" },
        }),
    );
    const response = await handleRequest(incoming, env);
    expect(env.ASSETS.fetch).toHaveBeenCalledWith(incoming);
    expect(response.status).toBe(404);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(await response.text()).toBe("asset 404");
  });
  it("returns a JSON 404 for an unknown API path", async () => {
    const env = environment();
    const response = await handleRequest(
      new Request("https://example.com/api/unknown"),
      env,
    );
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, code: "not_found" });
    expect(env.ASSETS.fetch).not.toHaveBeenCalled();
  });
  it("rejects non-JSON content and malformed JSON", async () => {
    expect(
      (
        await handleRequest(
          request(payload, { headers: { "Content-Type": "text/plain" } }),
          environment(),
        )
      ).status,
    ).toBe(415);
    expect(
      (await handleRequest(request(payload, { body: "{" }), environment()))
        .status,
    ).toBe(400);
  });
  it("limits the actual request bytes even without Content-Length", async () => {
    const response = await handleRequest(
      request({ ...payload, message: "中".repeat(INQUIRY_LIMITS.bodyBytes) }),
      environment(),
    );
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({
      ok: false,
      code: "payload_too_large",
    });
  });
  it("rejects an oversized announced body before parsing it", async () => {
    const response = await handleRequest(
      request(payload, {
        headers: {
          "Content-Type": "application/json",
          "Content-Length": String(INQUIRY_LIMITS.bodyBytes + 1),
        },
      }),
      environment(),
    );
    expect(response.status).toBe(413);
  });
  it("returns field errors without calling external services", async () => {
    const fetcher = successfulFetch();
    const response = await handleRequest(
      request({ ...payload, email: "wrong", message: "" }),
      environment(),
      { fetch: fetcher },
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      ok: false,
      code: "validation_error",
      fields: { email: "invalid", message: "required" },
    });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("silently accepts a filled honeypot without any credentials or mail", async () => {
    const fetcher = successfulFetch();
    const response = await handleRequest(
      request({ website: "spam.example" }),
      { ASSETS: environment().ASSETS },
      { fetch: fetcher },
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([
    "TURNSTILE_SECRET_KEY",
    "RESEND_API_KEY",
    "INQUIRY_TO_EMAIL",
    "INQUIRY_FROM_EMAIL",
  ] as const)("returns 503 when %s is missing", async (name) => {
    const env = environment();
    delete env[name];
    const fetcher = successfulFetch();
    const response = await handleRequest(request(), env, { fetch: fetcher });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, code: "unavailable" });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([
    Response.json({ success: false }),
    Response.json({ success: true }, { status: 503 }),
    new Response("broken"),
  ])(
    "never sends mail when verification fails",
    async (verificationResponse) => {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(verificationResponse);
      const response = await handleRequest(request(), environment(), {
        fetch: fetcher,
      });
      expect(response.status).toBe(403);
      expect(fetcher).toHaveBeenCalledTimes(1);
    },
  );
  it("handles Turnstile network failure without exposing the exception", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("private provider details"));
    const response = await handleRequest(request(), environment(), {
      fetch: fetcher,
    });
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toEqual({
      ok: false,
      code: "verification_failed",
      verification: { reason: "network_error", errorCodes: [] },
    });
    expect(
      JSON.stringify([body, vi.mocked(console.warn).mock.calls]),
    ).not.toContain("private provider");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("trims a copied Turnstile secret before verification", async () => {
    const env = environment();
    env.TURNSTILE_SECRET_KEY = " \nTEST_ONLY_NOT_A_SECRET\t ";
    const fetcher = successfulFetch();
    const response = await handleRequest(request(), env, { fetch: fetcher });
    expect(response.status).toBe(200);
    expect(JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body)).secret).toBe(
      "TEST_ONLY_NOT_A_SECRET",
    );
    expect(console.warn).not.toHaveBeenCalled();
  });
  it.each([" \n\t ", " \nTODO_TURNSTILE_SECRET\t "])(
    "rejects empty or placeholder secrets after trimming: %j",
    async (secret) => {
      const env = environment();
      env.TURNSTILE_SECRET_KEY = secret;
      const fetcher = successfulFetch();
      const response = await handleRequest(request(), env, { fetch: fetcher });
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ ok: false, code: "unavailable" });
      expect(fetcher).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    },
  );
  it.each([
    "invalid-input-secret",
    "invalid-input-response",
    "timeout-or-duplicate",
    "internal-error",
  ])(
    "reports the safe Siteverify code %s without sending mail",
    async (code) => {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          Response.json({ success: false, "error-codes": [code] }),
        );
      const response = await handleRequest(request(), environment(), {
        fetch: fetcher,
      });
      const verification = {
        reason: "rejected",
        upstreamStatus: 200,
        errorCodes: [code],
      };
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        ok: false,
        code: "verification_failed",
        verification,
      });
      expect(console.warn).toHaveBeenCalledExactlyOnceWith(
        "inquiry.turnstile_verification_failed",
        verification,
      );
      expect(fetcher).toHaveBeenCalledTimes(1);
    },
  );
  it("omits upstream secrets, token, customer data and unknown codes from both logs and responses", async () => {
    const env = environment();
    const privateValues = [
      env.TURNSTILE_SECRET_KEY!,
      env.RESEND_API_KEY!,
      payload.turnstileToken,
      payload.email,
      payload.message,
      payload.sourceUrl,
    ];
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        success: false,
        "error-codes": [
          "invalid-input-secret",
          ...privateValues,
          { message: "private" },
          "invalid-input-secret",
        ],
        message: privateValues.join(" "),
        secret: env.TURNSTILE_SECRET_KEY,
        response: payload.turnstileToken,
        hostname: "private-host.example.com",
      }),
    );
    const response = await handleRequest(request(), env, { fetch: fetcher });
    const body = await response.json();
    expect(body).toEqual({
      ok: false,
      code: "verification_failed",
      verification: {
        reason: "rejected",
        upstreamStatus: 200,
        errorCodes: ["invalid-input-secret"],
      },
    });
    const recorded = JSON.stringify([body, vi.mocked(console.warn).mock.calls]);
    for (const value of [...privateValues, "private-host.example.com"])
      expect(recorded).not.toContain(value);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it.each([
    null,
    [],
    {},
    { success: "true" },
    { success: 1 },
    { "error-codes": "invalid-input-secret" },
  ])(
    "classifies a malformed Siteverify response without trusting it: %j",
    async (result) => {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(Response.json(result));
      const response = await handleRequest(request(), environment(), {
        fetch: fetcher,
      });
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        ok: false,
        code: "verification_failed",
        verification: {
          reason: "invalid_response",
          upstreamStatus: 200,
          errorCodes: [],
        },
      });
      expect(fetcher).toHaveBeenCalledTimes(1);
    },
  );
  it("distinguishes an upstream HTTP failure from a rejected token", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ success: true }, { status: 503 }));
    const response = await handleRequest(request(), environment(), {
      fetch: fetcher,
    });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      ok: false,
      code: "verification_failed",
      verification: {
        reason: "http_error",
        upstreamStatus: 503,
        errorCodes: [],
      },
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("classifies a non-JSON Siteverify response without logging the response body", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("private upstream response body"));
    const response = await handleRequest(request(), environment(), {
      fetch: fetcher,
    });
    const body = await response.json();
    expect(body).toEqual({
      ok: false,
      code: "verification_failed",
      verification: { reason: "invalid_response", errorCodes: [] },
    });
    expect(
      JSON.stringify([body, vi.mocked(console.warn).mock.calls]),
    ).not.toContain("private upstream response body");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("sends HTML and text with Reply-To after successful verification", async () => {
    const fetcher = successfulFetch();
    const env = environment();
    const response = await handleRequest(request(), env, {
      fetch: fetcher,
      now: () => new Date("2026-11-16T12:00:00Z"),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(fetcher.mock.calls[0]?.[0]).toBe(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    );
    const verification = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body));
    expect(verification).toMatchObject({
      secret: env.TURNSTILE_SECRET_KEY,
      response: payload.turnstileToken,
    });
    expect(fetcher.mock.calls[1]?.[0]).toBe("https://api.resend.com/emails");
    const mail = JSON.parse(String(fetcher.mock.calls[1]?.[1]?.body));
    expect(mail).toMatchObject({
      from: env.INQUIRY_FROM_EMAIL,
      to: [env.INQUIRY_TO_EMAIL],
      reply_to: payload.email,
    });
    expect(mail.subject).toBe(
      "[EN] New Inquiry: Test Company - United Kingdom - 2",
    );
    expect(mail.html).toContain("<table");
    expect(mail.html).toContain("TODO-001");
    expect(mail.text).toContain("To be discussed");
    expect(mail.text).toContain("10000");
    expect(mail.text).toContain("2026-11-16T12:00:00.000Z");
    expect(mail.text).toContain("utm_campaign: test campaign");
    expect(mail.text).not.toContain(payload.turnstileToken);
  });
  it.each([
    Response.json({ message: "provider secret details" }, { status: 403 }),
    new Response("not JSON"),
    Response.json({}),
  ])("handles a rejected or malformed Resend result", async (mailResponse) => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ success: true }))
      .mockResolvedValueOnce(mailResponse);
    const response = await handleRequest(request(), environment(), {
      fetch: fetcher,
    });
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      ok: false,
      code: "delivery_failed",
    });
  });
  it("handles a Resend network failure", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ success: true }))
      .mockRejectedValueOnce(new Error("private"));
    expect(
      (await handleRequest(request(), environment(), { fetch: fetcher }))
        .status,
    ).toBe(502);
  });
  it.each([
    ["Turnstile", 403, "verification_failed"],
    ["Resend", 502, "delivery_failed"],
  ] as const)(
    "times out a stalled %s response body even when the mock ignores abort",
    async (provider, status, code) => {
      vi.useFakeTimers();
      let streamController: ReadableStreamDefaultController<Uint8Array>;
      const stalledResponse = new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            streamController = controller;
          },
        }),
      );
      try {
        const fetcher = vi.fn<typeof fetch>();
        if (provider === "Resend")
          fetcher.mockResolvedValueOnce(Response.json({ success: true }));
        fetcher.mockResolvedValueOnce(stalledResponse);
        const pending = handleRequest(request(), environment(), {
          fetch: fetcher,
        });
        await vi.advanceTimersByTimeAsync(0);
        expect(fetcher).toHaveBeenCalledTimes(provider === "Resend" ? 2 : 1);
        const signal = fetcher.mock.calls.at(-1)?.[1]?.signal;
        expect(signal?.aborted).toBe(false);
        await vi.advanceTimersByTimeAsync(10_000);
        const response = await pending;
        expect(response.status).toBe(status);
        expect(await response.json()).toEqual({
          ok: false,
          code,
          ...(provider === "Turnstile" && {
            verification: { reason: "timeout", errorCodes: [] },
          }),
        });
        expect(signal?.aborted).toBe(true);
      } finally {
        streamController!.enqueue(new TextEncoder().encode("{}"));
        streamController!.close();
        vi.useRealTimers();
      }
    },
  );
});

describe("inquiry email", () => {
  it("renders Chinese subject, all business fields and blank quantities", () => {
    const mail = buildInquiryEmail(
      { ...payload, company: "", country: "CN", locale: "zh" },
      new Date("2026-11-16T12:00:00Z"),
    );
    expect(mail.subject).toBe("[中文] 新询盘：Test Buyer - 中国 - 2");
    for (const value of [
      "待沟通",
      "TODO-001",
      "TODO-002",
      "采购需求",
      "是否需要样品: 是",
      "test-only",
      "tulip-baking-cups",
      "sample-cup",
      "10,000–49,999",
      "utm_source: test",
      "语言: zh",
      payload.sourceUrl,
    ])
      expect(mail.text).toContain(value);
    expect(mail.html).toContain('lang="zh-CN"');
  });
  it("escapes user HTML in fields and table cells while keeping plain text readable", () => {
    const malicious = '<img src=x onerror="alert(1)"> & quote';
    const mail = buildInquiryEmail(
      {
        ...payload,
        message: malicious,
        items: [{ ...payload.items[0]!, title: malicious }],
      },
      new Date(),
    );
    expect(mail.html).not.toContain("<img");
    expect(mail.html).toContain("&lt;img");
    expect(mail.html).toContain("&quot;");
    expect(mail.text).toContain(malicious);
  });
  it("counts a selected product not in the list and handles an empty list", () => {
    expect(
      buildInquiryEmail({ ...payload, productSlug: "third-cup" }, new Date())
        .subject,
    ).toMatch(/ - 3$/);
    expect(
      buildInquiryEmail({ ...payload, items: [], productSlug: "" }, new Date())
        .text,
    ).toContain("No products in the inquiry list");
  });
});
