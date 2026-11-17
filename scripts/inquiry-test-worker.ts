// 仅通过独立本地 Wrangler 配置加载；正式 wrangler.jsonc 不引用本文件。
// 保留真实 Siteverify 请求，只替换邮件出站请求，避免测试向任何邮箱发信。
import { handleRequest, type Env } from "../src/worker/index";

const messages: unknown[] = [];
let verified = 0;

const testFetch: typeof fetch = async (input, init) => {
  const request = new Request(input, init);
  const url = new URL(request.url);
  if (url.href === "https://api.resend.com/emails") {
    messages.push(await request.json());
    return Response.json({ id: "local-mock-email" });
  }
  if (
    url.href === "https://challenges.cloudflare.com/turnstile/v0/siteverify"
  ) {
    const response = await fetch(request);
    const result = (await response.clone().json()) as { success?: boolean };
    if (result.success) verified++;
    return response;
  }
  throw new Error("本地验收不允许其他出站请求");
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/__test__/messages") {
      if (request.method === "DELETE") {
        messages.length = 0;
        verified = 0;
      }
      return Response.json({ messages, verified });
    }
    return handleRequest(request, env, { fetch: testFetch });
  },
};
