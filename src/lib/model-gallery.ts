import type { ModelStudio } from "./model-studio";

export function setupModelGallery(root: HTMLElement) {
  const get = <T extends HTMLElement>(attribute: string) =>
    root.querySelector<T>("[data-" + attribute + "]")!;
  const canvas = get<HTMLCanvasElement>("model-canvas"),
    start = get<HTMLButtonElement>("model-start");
  const group = get("model-controls"),
    message = get("model-message");
  const variant = get<HTMLSelectElement>("model-variant"),
    color = get<HTMLSelectElement>("model-color");
  const auto = get<HTMLButtonElement>("model-auto"),
    quick = get<HTMLAnchorElement>("model-quicklook"),
    xr = get<HTMLButtonElement>("model-xr");
  const tabs = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-model-tab]"),
  );
  const panels = Array.from(
    root.querySelectorAll<HTMLElement>("[data-model-panel]"),
  );
  let studio: ModelStudio | undefined,
    selected = 0,
    loading = false,
    arRevision = 0,
    blob = "",
    arMode: "none" | "quick" | "xr" = "none",
    destroyed = false;
  let placeInSpace: typeof import("./model-ar").placeInSpace | undefined;
  function select(i: number) {
    selected = i;
    panels.forEach((p, idx) => {
      p.hidden = idx !== i;
    });
    tabs.forEach((b, idx) => b.setAttribute("aria-pressed", String(idx === i)));
    group.hidden = i !== 0 || !studio;
    studio?.setActive(i === 0 && !document.hidden);
  }
  function releaseAR() {
    arRevision++;
    quick.hidden = true;
    quick.removeAttribute("href");
    if (blob) {
      URL.revokeObjectURL(blob);
      blob = "";
    }
  }
  async function refreshAR() {
    releaseAR();
    if (!studio?.model || arMode !== "quick" || destroyed) return;
    const rev = arRevision;
    try {
      const current = studio.model,
        ar = await import("./model-ar");
      const url = await ar.quickLookUrl(current);
      if (arRevision !== rev || destroyed) {
        URL.revokeObjectURL(url);
        return;
      }
      blob = url;
      quick.href = blob + "#allowsContentScaling=0";
      quick.hidden = false;
    } catch {
      quick.hidden = true;
    }
  }
  function fallback() {
    studio?.dispose();
    studio = undefined;
    releaseAR();
    canvas.hidden = true;
    root.dataset.status = "fallback";
    tabs[0]!.hidden = true;
    start.hidden = true;
    message.textContent = root.dataset.loadError ?? "";
    select(1);
  }
  function options() {
    if (!studio) return;
    if (color?.value) studio.color(color.value);
    void refreshAR();
  }
  async function open() {
    if (loading || destroyed) return;
    loading = true;
    start.disabled = true;
    start.querySelector("span")!.hidden = true;
    get("loading").hidden = false;
    root.setAttribute("aria-busy", "true");
    root.dataset.status = "loading";
    try {
      const { createStudio } = await import("./model-studio");
      if (destroyed) return;
      canvas.hidden = false;
      studio = createStudio(canvas);
      if (!(await studio.load(variant.value)) || destroyed) return;
      start.hidden = true;
      group.hidden = selected !== 0;
      studio.setActive(selected === 0);
      root.dataset.status = "ready";
      options();
      if (selected === 0) canvas.focus({ preventScroll: true });
      if (navigator.maxTouchPoints > 0 && window.isSecureContext) {
        if (quick.relList.supports?.("ar")) {
          arMode = "quick";
          void refreshAR();
        } else if (
          await navigator.xr
            ?.isSessionSupported("immersive-ar")
            .catch(() => false)
        ) {
          // Request the session within the eventual click's user activation.
          placeInSpace = (await import("./model-ar").catch(() => undefined))
            ?.placeInSpace;
          if (placeInSpace && !destroyed) {
            arMode = "xr";
            xr.hidden = false;
          }
        }
      }
    } catch {
      if (!destroyed) fallback();
    } finally {
      loading = false;
      root.removeAttribute("aria-busy");
    }
  }
  start.addEventListener("click", open);
  tabs.forEach((tab, i) =>
    tab.addEventListener("click", () => {
      select(i);
      if (i === 0 && !studio) void open();
    }),
  );
  get("model-reset").addEventListener("click", () => studio?.reset());
  auto.addEventListener("click", () => {
    const value = auto.getAttribute("aria-pressed") !== "true";
    auto.setAttribute("aria-pressed", String(value));
    studio?.setAuto(value);
  });
  for (const button of root.querySelectorAll<HTMLButtonElement>(
    "[data-model-zoom]",
  )) {
    button.addEventListener("click", () =>
      studio?.zoom(button.dataset.modelZoom === "in" ? 1 / 1.2 : 1.2),
    );
  }
  variant.addEventListener("change", async () => {
    if (!studio) return;
    const url = variant.value;
    releaseAR();
    xr.hidden = true;
    root.setAttribute("aria-busy", "true");
    try {
      if (await studio.load(url)) {
        options();
        xr.hidden = arMode !== "xr";
      }
    } catch {
      if (variant.value === url && !destroyed) fallback();
    } finally {
      if (variant.value === url) root.removeAttribute("aria-busy");
    }
  });
  color?.addEventListener("change", options);
  xr.addEventListener("click", async () => {
    if (!studio || !placeInSpace) return;
    xr.disabled = true;
    try {
      await placeInSpace(studio);
    } catch (error) {
      message.textContent = root.dataset.arError ?? "";
      if (error instanceof DOMException && error.name === "NotSupportedError")
        xr.hidden = true;
    } finally {
      xr.disabled = false;
    }
  });
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    fallback();
  });
  document.addEventListener("visibilitychange", () =>
    studio?.setActive(!document.hidden && selected === 0),
  );
  window.addEventListener("pagehide", (event) => {
    if (!event.persisted) {
      destroyed = true;
      releaseAR();
      studio?.dispose();
    }
  });
  if (!("WebGL2RenderingContext" in window)) fallback();
  else {
    // 在空闲时验证真实上下文，有些浏览器保留 API 名称但禁用了 WebGL。
    const probe = () => {
      if (loading || studio || destroyed || root.dataset.status !== "poster")
        return;
      const context = document.createElement("canvas").getContext("webgl2");
      if (!context) fallback();
      else context.getExtension("WEBGL_lose_context")?.loseContext();
    };
    if ("requestIdleCallback" in window) window.requestIdleCallback(probe);
    else setTimeout(probe, 0);
  }
}
