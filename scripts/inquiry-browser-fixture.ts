import type { Page } from "playwright";

// 仅供截图和本地浏览器验收；替换 widget 脚本，不绕过 Worker 的服务端验证。
// Token 为 Cloudflare 官方公开测试 token；测试 secret 由本地 .dev.vars 提供。
export async function installTurnstileFixture(page: Page): Promise<void> {
  await page.route(
    "https://challenges.cloudflare.com/turnstile/v0/api.js*",
    async (route) => {
      const callbackName = new URL(route.request().url()).searchParams.get(
        "onload",
      );
      const body = String.raw`
        (() => {
          const loadedScript = document.currentScript;
          const asyncScript = loadedScript?.async || loadedScript?.defer;
          const token = "XXXX.DUMMY.TOKEN.XXXX";
          const widgets = new Map();
          let nextId = 0;
          function complete(id) {
            const widget = widgets.get(id);
            if (widget) queueMicrotask(() => widget.options.callback?.(token));
          }
          window.turnstile = {
            ready(callback) {
              if (asyncScript) {
                const error = new Error("[Cloudflare Turnstile] Remove async/defer from the Turnstile api.js script tag before using turnstile.ready().");
                error.name = "TurnstileError";
                throw error;
              }
              queueMicrotask(callback);
            },
            render(target, options) {
              const element = typeof target === "string" ? document.querySelector(target) : target;
              if (!element) throw new Error("Turnstile test fixture container missing");
              const id = "test-widget-" + ++nextId;
              const note = document.createElement("div");
              note.dataset.testTurnstile = id;
              note.textContent = "Turnstile · Test fixture";
              note.style.cssText = "box-sizing:border-box;max-width:300px;border:1px solid #e8e1d7;background:#f4eee5;color:#50453b;padding:16px;font:12px sans-serif";
              element.append(note);
              widgets.set(id, { options, note });
              complete(id);
              return id;
            },
            reset(id) { complete(id); },
            execute(id) { complete(id); },
            getResponse(id) { return widgets.has(id ?? widgets.keys().next().value) ? token : ""; },
            isExpired() { return false; },
            remove(id) {
              widgets.get(id)?.note.remove();
              widgets.delete(id);
            },
          };
        })();
      `;
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body:
          body +
          (callbackName
            ? `\nqueueMicrotask(() => window[${JSON.stringify(callbackName)}]?.());`
            : ""),
      });
    },
  );
}
