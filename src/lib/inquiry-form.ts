import { display } from "../config/site";
import { t, type Locale } from "../i18n/utils";
import { localePath } from "../i18n/routing";
import { clearItems, getItems, INQUIRY_CHANGE_EVENT } from "./inquiry";
import { inquiryDisplayItem, readInquiryCatalog } from "./inquiry-view";
import {
  INQUIRY_LIMITS,
  UTM_KEYS,
  validateInquiryPayload,
  type InquiryPayload,
} from "./inquiry-payload";

interface TurnstileApi {
  ready?: (callback: () => void) => void;
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let turnstileLoading: Promise<TurnstileApi> | undefined;
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileLoading) return turnstileLoading;
  turnstileLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    const timeout = window.setTimeout(() => fail(), 15000);
    function fail() {
      window.clearTimeout(timeout);
      script.remove();
      turnstileLoading = undefined;
      reject(new Error("Turnstile unavailable"));
    }
    script.addEventListener("error", fail, { once: true });
    script.addEventListener(
      "load",
      () => {
        window.clearTimeout(timeout);
        if (!window.turnstile) return fail();
        const api = window.turnstile;
        if (api.ready) api.ready(() => resolve(api));
        else resolve(api);
      },
      { once: true },
    );
    document.head.append(script);
  });
  return turnstileLoading;
}

export function inquiryUtm(url: URL): Record<string, string> {
  return Object.fromEntries(
    UTM_KEYS.map((key) => [key, url.searchParams.get(key) ?? ""]).filter(
      ([, value]) => value,
    ),
  );
}

export function initializeInquiryForms() {
  document
    .querySelectorAll<HTMLFormElement>("form[data-inquiry-form]")
    .forEach((form) => {
      if (form.dataset.initialized) return;
      form.dataset.initialized = "true";
      const locale: Locale = form.dataset.locale === "zh" ? "zh" : "en";
      const catalog = readInquiryCatalog(form.dataset.catalog);
      const productSelect = form.elements.namedItem(
        "productInterest",
      ) as HTMLSelectElement;
      const productSlug = form.elements.namedItem(
        "productSlug",
      ) as HTMLInputElement;
      const selectedProduct = form.querySelector<HTMLElement>(
        "[data-selected-product]",
      )!;
      const listSection = form.querySelector<HTMLElement>(
        "[data-form-products]",
      )!;
      const list = form.querySelector<HTMLUListElement>(
        "[data-form-products-list]",
      )!;
      const submit =
        form.querySelector<HTMLButtonElement>("[data-form-submit]")!;
      const submitLabel = form.querySelector<HTMLElement>(
        "[data-submit-label]",
      )!;
      const fields =
        form.querySelector<HTMLFieldSetElement>("[data-form-fields]")!;
      const error = form.querySelector<HTMLElement>("[data-form-error]")!;
      const errorMessage = form.querySelector<HTMLElement>(
        "[data-form-error-message]",
      )!;
      const status = form.querySelector<HTMLElement>("[data-form-status]")!;
      const widget = form.querySelector<HTMLElement>(
        "[data-turnstile-widget]",
      )!;
      const verificationStatus = form.querySelector<HTMLElement>(
        "[data-turnstile-status]",
      )!;
      const retryVerification = form.querySelector<HTMLButtonElement>(
        "[data-turnstile-retry]",
      )!;
      let token = "";
      let widgetId: string | undefined;
      let pending = false;
      let starting = false;
      // 这是 Cloudflare 官方公开测试 site key；secret 始终由 Worker 环境提供。
      const siteKey =
        form.dataset.siteKey?.trim() ||
        (["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname)
          ? "1x00000000000000000000AA"
          : "");

      function renderSelected() {
        const product = catalog.get(productSlug.value);
        selectedProduct.hidden = !product;
        if (product)
          selectedProduct.textContent = t("form.selectedProduct", locale, {
            title: display(product.title, t("inquiry.productName", locale)),
            sku: product.sku,
          });
      }
      const requestedSlug =
        new URLSearchParams(window.location.search).get("product") ||
        form.dataset.productSlug ||
        "";
      const requestedProduct = catalog.get(requestedSlug);
      if (requestedProduct) {
        productSlug.value = requestedProduct.slug;
        productSelect.value = requestedProduct.category;
      } else productSlug.value = "";
      renderSelected();
      productSelect.addEventListener("change", () => {
        if (catalog.get(productSlug.value)?.category !== productSelect.value)
          productSlug.value = "";
        renderSelected();
      });

      function currentItems() {
        return getItems().map((item) => inquiryDisplayItem(item, catalog));
      }
      function renderList() {
        const items = currentItems();
        listSection.hidden = items.length === 0;
        const fragment = document.createDocumentFragment();
        for (const item of items) {
          const row = document.createElement("li");
          row.className =
            "flex flex-wrap items-start justify-between gap-3 border-t border-line pt-3 text-sm";
          const link = document.createElement("a");
          link.className = "min-w-0 text-copper underline wrap-anywhere";
          link.href = localePath(
            `/products/${item.category}/${item.slug}/`,
            locale,
          );
          link.textContent = `${item.sku} · ${display(item.title, t("inquiry.productName", locale))}`;
          const quantity = document.createElement("span");
          quantity.textContent =
            item.quantity === null
              ? t("inquiry.toDiscuss", locale)
              : t("inquiry.quantityPcs", locale, {
                  quantity: item.quantity.toLocaleString(
                    locale === "zh" ? "zh-CN" : "en-US",
                  ),
                });
          row.append(link, quantity);
          fragment.append(row);
        }
        list.replaceChildren(fragment);
      }
      renderList();
      window.addEventListener(INQUIRY_CHANGE_EVENT, renderList);
      window.addEventListener("pageshow", renderList);

      function showError(code: string, focus = true) {
        const known = [
          "validation_error",
          "unavailable",
          "verification_failed",
          "delivery_failed",
          "network",
          "payload_too_large",
        ];
        errorMessage.textContent = t(
          "form.error." + (known.includes(code) ? code : "generic"),
          locale,
        );
        error.hidden = false;
        if (focus) error.focus();
      }
      function fieldErrors(errors: Record<string, string>) {
        form
          .querySelectorAll<HTMLElement>("[data-field-error]")
          .forEach((node) => {
            const name = node.dataset.fieldError!;
            const reason = errors[name];
            const control = form.elements.namedItem(name);
            node.hidden = !reason;
            if (control instanceof HTMLElement)
              control.setAttribute("aria-invalid", String(Boolean(reason)));
            node.textContent = reason
              ? t(
                  name === "email" && reason === "invalid"
                    ? "form.field.email"
                    : "form.field." + reason,
                  locale,
                )
              : "";
          });
        const first = form.querySelector<HTMLElement>('[aria-invalid="true"]');
        first?.focus();
      }
      function resetVerification() {
        token = "";
        if (widgetId !== undefined && window.turnstile) {
          verificationStatus.textContent = t("form.verifyLoading", locale);
          try {
            window.turnstile.reset(widgetId);
          } catch {
            verificationStatus.textContent = t("form.verifyError", locale);
          }
        }
      }
      async function startVerification() {
        if (starting || widgetId !== undefined || !siteKey) return;
        starting = true;
        retryVerification.hidden = true;
        verificationStatus.textContent = t("form.verifyLoading", locale);
        try {
          const api = await loadTurnstile();
          widgetId = api.render(widget, {
            sitekey: siteKey,
            language: locale === "zh" ? "zh-cn" : "en",
            theme: "light",
            size: widget.clientWidth < 300 ? "compact" : "flexible",
            callback: (value: string) => {
              token = value;
              verificationStatus.textContent = t("form.verifyReady", locale);
              retryVerification.hidden = true;
            },
            "error-callback": () => {
              token = "";
              verificationStatus.textContent = t("form.verifyError", locale);
              retryVerification.hidden = false;
            },
            "expired-callback": () => {
              token = "";
              verificationStatus.textContent = t("form.verifyExpired", locale);
              retryVerification.hidden = false;
            },
            "timeout-callback": () => {
              token = "";
              verificationStatus.textContent = t("form.verifyExpired", locale);
              retryVerification.hidden = false;
            },
          });
        } catch {
          token = "";
          verificationStatus.textContent = t("form.verifyError", locale);
          retryVerification.hidden = false;
        } finally {
          starting = false;
        }
      }
      retryVerification.addEventListener("click", () =>
        widgetId === undefined ? void startVerification() : resetVerification(),
      );
      if (!siteKey) {
        showError("unavailable", false);
        verificationStatus.textContent = "";
      } else if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries.some(({ isIntersecting }) => isIntersecting)) {
              observer.disconnect();
              void startVerification();
            }
          },
          { rootMargin: "300px" },
        );
        observer.observe(form);
      } else void startVerification();

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (pending) return;
        error.hidden = true;
        status.textContent = "";
        const data = new FormData(form);
        const value = (key: string) => String(data.get(key) ?? "").trim();
        const payload: InquiryPayload = {
          name: value("name"),
          email: value("email"),
          company: value("company"),
          country: value("country"),
          phone: value("phone"),
          wechatId: value("wechatId"),
          productInterest: value("productInterest"),
          productSlug: value("productSlug"),
          quantity: value("quantity"),
          message: value("message"),
          samples: data.has("samples"),
          items: currentItems(),
          locale,
          sourceUrl: window.location.href,
          utm: inquiryUtm(new URL(window.location.href)),
          turnstileToken: token,
          website: value("website"),
        };
        const result = validateInquiryPayload(payload);
        if (!result.ok) {
          const errors = { ...result.fields };
          delete errors.turnstileToken;
          if (Object.keys(errors).length) {
            showError("validation_error", false);
            if (payload.items.length > INQUIRY_LIMITS.items)
              errorMessage.textContent = t("form.itemsLimit", locale);
            fieldErrors(errors);
            return;
          }
        }
        fieldErrors({});
        if (!siteKey) {
          showError("unavailable");
          return;
        }
        if (!token) {
          verificationStatus.textContent = t("form.verifyRequired", locale);
          retryVerification.hidden = false;
          retryVerification.focus();
          void startVerification();
          return;
        }
        pending = true;
        submit.disabled = true;
        fields.disabled = true;
        submitLabel.textContent = t("form.submitting", locale);
        form.setAttribute("aria-busy", "true");
        try {
          const response = await fetch("/api/inquiry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(30000),
          });
          const body: {
            ok?: boolean;
            code?: string;
            fields?: Record<string, string>;
          } = await response.json();
          if (!response.ok || body.ok !== true) {
            showError(body.code ?? "generic");
            if (body.fields) fieldErrors(body.fields);
            resetVerification();
            return;
          }
          clearItems();
          form.dataset.track = "generate_lead";
          form.dispatchEvent(
            new CustomEvent("generate_lead", {
              bubbles: true,
              detail: {
                locale,
                productCount: new Set([
                  ...payload.items.map(({ slug }) => slug),
                  ...(payload.productSlug ? [payload.productSlug] : []),
                ]).size,
              },
            }),
          );
          status.textContent = t("form.success", locale);
          window.location.assign(localePath("/thank-you/", locale));
        } catch {
          showError("network");
          resetVerification();
        } finally {
          pending = false;
          submit.disabled = false;
          fields.disabled = false;
          submitLabel.textContent = t("form.submit", locale);
          form.removeAttribute("aria-busy");
        }
      });
    });
}
