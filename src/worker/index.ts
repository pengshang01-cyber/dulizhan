import site from "../data/site.json";
import { INQUIRY_LIMITS, validateInquiryPayload } from "../lib/inquiry-payload";
import { buildInquiryEmail } from "./email";

export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  INQUIRY_TO_EMAIL?: string;
  INQUIRY_FROM_EMAIL?: string;
}

export interface InquiryDependencies {
  fetch?: typeof fetch;
  now?: () => Date;
}

function json(
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(site.allowIndexing ? {} : { "X-Robots-Tag": "noindex, nofollow" }),
      ...extraHeaders,
    },
  });
}

class PayloadTooLarge extends Error {}

async function readJson(request: Request): Promise<unknown> {
  const announcedLength = Number(request.headers.get("content-length"));
  if (announcedLength > INQUIRY_LIMITS.bodyBytes) throw new PayloadTooLarge();
  if (!request.body) throw new SyntaxError();
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > INQUIRY_LIMITS.bodyBytes) {
        await reader.cancel();
        throw new PayloadTooLarge();
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return JSON.parse(text);
  } finally {
    reader.releaseLock();
  }
}

async function fetchJsonWithTimeout(
  fetcher: typeof fetch,
  url: string,
  init: RequestInit,
) {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error("外部服务响应超时"));
      controller.abort();
    }, 10_000);
  });
  try {
    // 响应头和正文共用截止时间；即使上游忽略 abort，也会按时返回失败。
    return await Promise.race([
      (async () => {
        const response = await fetcher(url, {
          ...init,
          signal: controller.signal,
        });
        const result: unknown = await response.json();
        return { response, result };
      })(),
      deadline,
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

export async function handleRequest(
  request: Request,
  env: Env,
  dependencies: InquiryDependencies = {},
): Promise<Response> {
  const pathname = new URL(request.url).pathname;
  if (!pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
  if (pathname !== "/api/inquiry")
    return json({ ok: false, code: "not_found" }, 404);
  if (request.method !== "POST")
    return json({ ok: false, code: "method_not_allowed" }, 405, {
      Allow: "POST",
    });
  if (
    request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !==
    "application/json"
  )
    return json({ ok: false, code: "unsupported_media_type" }, 415);
  let input: unknown;
  try {
    input = await readJson(request);
  } catch (error) {
    return error instanceof PayloadTooLarge
      ? json({ ok: false, code: "payload_too_large" }, 413)
      : json({ ok: false, code: "invalid_json" }, 400);
  }
  // 蜜罐先于凭据检查和外部调用，静默成功且不发送邮件。
  if (
    input &&
    typeof input === "object" &&
    "website" in input &&
    typeof input.website === "string" &&
    input.website.trim()
  )
    return json({ ok: true });
  const validated = validateInquiryPayload(input);
  if (!validated.ok)
    return json(
      { ok: false, code: "validation_error", fields: validated.fields },
      400,
    );
  const names = [
    "TURNSTILE_SECRET_KEY",
    "RESEND_API_KEY",
    "INQUIRY_TO_EMAIL",
    "INQUIRY_FROM_EMAIL",
  ] as const;
  if (
    names.some((name) => !env[name]?.trim() || env[name]?.startsWith("TODO_"))
  )
    return json({ ok: false, code: "unavailable" }, 503);
  const data = validated.data;
  const fetcher = dependencies.fetch ?? fetch;
  let verified = false;
  try {
    const { response, result } = await fetchJsonWithTimeout(
      fetcher,
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET_KEY,
          response: data.turnstileToken,
          remoteip: request.headers.get("CF-Connecting-IP") ?? undefined,
        }),
      },
    );
    verified =
      response.ok &&
      Boolean(
        result &&
        typeof result === "object" &&
        "success" in result &&
        result.success === true,
      );
  } catch {
    /* 网络或验证服务异常均不继续发信。 */
  }
  if (!verified) return json({ ok: false, code: "verification_failed" }, 403);
  const email = buildInquiryEmail(data, dependencies.now?.() ?? new Date());
  try {
    const { response, result } = await fetchJsonWithTimeout(
      fetcher,
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.INQUIRY_FROM_EMAIL,
          to: [env.INQUIRY_TO_EMAIL],
          reply_to: data.email,
          ...email,
        }),
      },
    );
    if (
      !response.ok ||
      !result ||
      typeof result !== "object" ||
      !("id" in result) ||
      typeof result.id !== "string" ||
      !result.id
    )
      return json({ ok: false, code: "delivery_failed" }, 502);
  } catch {
    return json({ ok: false, code: "delivery_failed" }, 502);
  }
  return json({ ok: true });
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
};
