import { CONSENT_KEY, createAnalytics } from "./analytics";
import { t } from "../i18n/utils";

type AnalyticsWindow = Window & {
  dataLayer?: IArguments[];
  gtag?: (...args: unknown[]) => void;
};

export function initializeAnalytics() {
  const panel = document.querySelector<HTMLElement>("[data-cookie-consent]");
  if (!panel || panel.dataset.initialized) return;
  panel.dataset.initialized = "true";
  const browser = window as AnalyticsWindow;
  const locale = document.documentElement.lang === "zh-CN" ? "zh" : "en";
  const status = panel.querySelector<HTMLElement>("[data-cookie-status]")!;
  let loaded = false;
  let pendingScript: HTMLScriptElement | undefined;
  let previousFocus: HTMLElement | null = null;
  const disabled = (id: string, value: boolean) => {
    (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = value;
  };
  const pageUrl = location.origin + location.pathname;
  function clearAnalyticsCookies() {
    const names = document.cookie
      .split(";")
      .map((cookie) => cookie.split("=")[0].trim())
      .filter((name) => /^_ga(?:_|$)/.test(name));
    const host = location.hostname.split(".");
    for (const name of names) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      for (let i = 0; i < host.length - 1; i++)
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.${host.slice(i).join(".")}; SameSite=Lax`;
    }
  }
  const analytics = createAnalytics(
    panel.dataset.gaId,
    () => window.localStorage,
    {
      load(id) {
        disabled(id, false);
        browser.dataLayer ??= [];
        browser.gtag ??= function () {
          // gtag 命令队列使用官方 arguments 格式，不能替换为普通数组。
          // eslint-disable-next-line prefer-rest-params -- Google tag requires IArguments commands.
          browser.dataLayer!.push(arguments);
        };
        // 基础同意模式：此函数只在已同意且 ID 有效时执行，拒绝时无 Google 请求。
        browser.gtag("consent", "default", {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
        browser.gtag("consent", "update", { analytics_storage: "granted" });
        browser.gtag("js", new Date());
        browser.gtag("config", id, {
          send_page_view: false,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
          page_location: pageUrl,
          page_referrer: "",
          language: locale,
        });
        browser.gtag("event", "page_view", {
          page_location: pageUrl,
          page_referrer: "",
          language: locale,
        });
        if (loaded || pendingScript) return;
        const script = document.createElement("script");
        script.async = true;
        script.src =
          "https://www.googletagmanager.com/gtag/js?id=" +
          encodeURIComponent(id);
        script.dataset.analyticsScript = "true";
        script.onload = () => {
          loaded = true;
          pendingScript = undefined;
        };
        script.onerror = () => {
          script.remove();
          pendingScript = undefined;
        };
        pendingScript = script;
        document.head.append(script);
      },
      disable(id) {
        // 先启用 Google 的禁用开关；不发送可能产生无 Cookie ping 的 denied 更新。
        disabled(id, true);
        if (pendingScript) {
          pendingScript.remove();
          pendingScript = undefined;
        }
        document.querySelector("[data-analytics-script]")?.remove();
        if (!loaded) browser.dataLayer = [];
        clearAnalyticsCookies();
      },
      send(event, params) {
        browser.gtag?.("event", event, params);
      },
    },
  );

  panel.hidden = analytics.choice !== null;
  const openSettings = () => {
    previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    status.textContent = "";
    panel.hidden = false;
    panel.querySelector<HTMLButtonElement>("[data-cookie-choice]")?.focus();
  };
  document
    .querySelectorAll("[data-cookie-settings]")
    .forEach((button) => button.addEventListener("click", openSettings));
  panel
    .querySelectorAll<HTMLButtonElement>("[data-cookie-choice]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        const saved = analytics.choose(
          button.dataset.cookieChoice === "accepted" ? "accepted" : "rejected",
        );
        status.textContent = t(
          saved ? "cookie.saved" : "cookie.storageError",
          locale,
        );
        panel.hidden = saved;
        if (saved) previousFocus?.focus();
      }),
    );
  window.addEventListener("storage", (event) => {
    if (event.key !== CONSENT_KEY && event.key !== null) return;
    analytics.refresh();
    panel.hidden = analytics.choice !== null;
  });
  document.addEventListener("click", (event) => {
    const target =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-track]")
        : null;
    if (target && !(target instanceof HTMLButtonElement && target.disabled))
      analytics.track(target.dataset.track ?? "", "click", locale);
  });
  document.addEventListener("analytics:complete", (event) => {
    const detail = (event as CustomEvent<{ event?: string }>).detail;
    if (typeof detail?.event === "string")
      analytics.track(detail.event, "completion", locale);
  });
  document.addEventListener("generate_lead", (event) => {
    if (
      event.target instanceof HTMLFormElement &&
      event.target.matches("[data-inquiry-form][data-track='generate_lead']")
    )
      analytics.track("generate_lead", "completion", locale);
  });
}
