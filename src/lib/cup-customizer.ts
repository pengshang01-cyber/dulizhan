import { t, type Locale } from "../i18n/utils";
import {
  CUP,
  newDesign,
  parseDesign,
  designAlerts,
  type Sheet,
  type Design,
} from "./blank-design";
import {
  canvasOf,
  readLogo,
  prepareInk,
  drawArtwork,
  flatProof,
  toBlob,
} from "./blank-canvas";
import {
  checkBytes,
  checkFile,
  digest,
  proofNames,
  type Files,
} from "./design-files";
import { loadDraft, saveDraft, saveQuote } from "./design-storage";
import { printModel } from "./blank-model";
import { addItem, type InquiryProduct } from "./inquiry";
export async function setup(dialog: HTMLDialogElement) {
  const get = <T extends HTMLElement = HTMLElement>(selector: string) =>
    dialog.querySelector<T>(selector)!;
  const locale = dialog.dataset.locale as Locale,
    copy = (s: string, vars: Record<string, string | number> = {}) =>
      t("customizer." + s, locale, vars);
  const sheet: Sheet = JSON.parse(dialog.dataset.sheet!),
    entry: InquiryProduct = JSON.parse(dialog.dataset.entry!);
  const flat = get<HTMLCanvasElement>("[data-flat]"),
    art = canvasOf(1024),
    msg = get("[data-message]"),
    add = get<HTMLButtonElement>("[data-add]");
  const controls = [
    ...dialog.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      "[data-key]",
    ),
  ];
  let design = newDesign(sheet.side, dialog.dataset.defaultColor!),
    logo: File | undefined,
    production: File | undefined;
  let original: Awaited<ReturnType<typeof readLogo>> | undefined;
  let model: Awaited<ReturnType<typeof printModel>> | undefined = undefined;
  let cacheKey = "",
    ink: HTMLCanvasElement | undefined,
    frame = 0,
    lastSide = "",
    busy = false,
    storageOk = true;
  const revisions = { logo: 0, production: 0 },
    loadingFiles = new Set<"logo" | "production">();
  const name = (kind: "logo" | "production") => {
    get('[data-name="' + kind + '"]').textContent = design[kind]?.name ?? "";
    get('[data-clear="' + kind + '"]').hidden = !design[kind];
  };
  function sync() {
    for (const e of controls) {
      const key = e.dataset.key as keyof Design,
        val = design[key];
      if (e instanceof HTMLInputElement && e.type === "checkbox")
        e.checked = val === true;
      else e.value = String(val ?? "");
    }
    name("logo");
    name("production");
  }
  function draw() {
    frame = 0;
    get("[data-layout-summary]").textContent =
      copy(design.layout) +
      " · " +
      copy(design.compensate ? "compOn" : "compOff");
    get("[data-side]").textContent =
      copy(design.printSide === "outside" ? "sideOutside" : "sideInside") +
      (sheet.sidePending ? " · " + copy("pending") : "");
    get('[data-for="diagonalDeg"]').hidden = design.layout !== "diagonal";
    get('[data-for="count"]').hidden = ![
      "wrap",
      "vertical",
      "diagonal",
    ].includes(design.layout);
    get('[data-for="ink"]').hidden = design.colorMode !== "mono";
    const key = [
      design.logo?.sha256,
      design.colorMode,
      design.ink,
      design.removeWhite,
    ].join("-");
    if (key !== cacheKey) {
      cacheKey = key;
      ink = original ? prepareInk(original.original, design) : undefined;
    }
    const { coverage, count, maxStretch } = drawArtwork(
      sheet,
      design,
      ink,
      art,
      flat,
    );
    const dpi =
      original && !original.vector
        ? (original.nativeWidth * 25.4) / (design.widthMm * maxStretch)
        : null;
    const alerts = ink ? designAlerts(coverage, design.widthMm, dpi) : [];
    get("[data-alerts]").replaceChildren(
      ...alerts.map((a) => {
        const li = document.createElement("li");
        li.textContent = copy(a);
        return li;
      }),
    );
    get("[data-coverage]").textContent = ink
      ? copy("coverage", { n: Math.round(coverage.hidden * 100) })
      : production
        ? copy("sourceOnly")
        : "";
    get("[data-count]").textContent = ink
      ? copy("actualCount", { n: count })
      : "";
    if (model) {
      if (lastSide !== design.printSide) {
        model.printSide(design.printSide);
        lastSide = design.printSide;
      }
      model.refresh();
    }
  }
  function redraw() {
    if (!frame) frame = requestAnimationFrame(draw);
  }
  let timer: number | undefined,
    chain = Promise.resolve();
  function persist() {
    clearTimeout(timer);
    const snapshot = { design: structuredClone(design), logo, production };
    chain = chain
      .then(() => saveDraft(snapshot))
      .then(() => {})
      .catch(() => {
        storageOk = false;
        msg.textContent = copy("storage");
      });
  }
  function change() {
    get("[data-next]").hidden = true;
    clearTimeout(timer);
    timer = window.setTimeout(persist, 200);
    redraw();
  }
  function error(e: unknown) {
    msg.textContent = copy(
      e instanceof Error && e.message === "payload_too_large"
        ? "large"
        : "fileError",
    );
  }
  const readyModel = printModel(
    get<HTMLCanvasElement>("[data-formed]"),
    dialog.dataset.modelUrl!,
    art,
  );
  // 先绑定失败处理，加载本地草稿和 GPU 模型可以独立完成。
  const modelResult = readyModel.then(
    (v) => v,
    () => undefined,
  );
  msg.textContent = copy("loading");
  try {
    const d = await loadDraft();
    if (d) {
      design = parseDesign(d.design);
      logo = d.logo;
      production = d.production;
      if (logo) original = await readLogo(logo);
    }
  } catch {
    storageOk = false;
    msg.textContent = copy("storage");
  }
  sync();
  draw();
  for (const e of controls)
    e.addEventListener("input", () => {
      const k = e.dataset.key as keyof Design;
      const numeric = e instanceof HTMLInputElement && e.type === "number";
      if (numeric && !e.validity.valid) return;
      const v =
        e instanceof HTMLInputElement && e.type === "checkbox"
          ? e.checked
          : numeric
            ? e.value === ""
              ? null
              : Number(e.value)
            : e.value;
      try {
        design = parseDesign({ ...design, [k]: v });
        change();
      } catch {
        /* 输入过程中允许暂时留空。 */
      }
    });
  for (const e of controls)
    e.addEventListener("change", () => {
      sync();
    });
  let awaiting = {
    logo: !!design.logo && !logo,
    production: !!design.production && !production,
  };
  async function setFile(kind: "logo" | "production", f: File) {
    const rev = ++revisions[kind];
    loadingFiles.add(kind);
    try {
      await checkFile(f, kind);
      const meta = { name: f.name, sha256: await digest(f) };
      if (
        awaiting[kind] &&
        design[kind] &&
        (design[kind]!.sha256 !== meta.sha256 ||
          design[kind]!.name !== meta.name)
      ) {
        msg.textContent = copy("missing");
        return;
      }
      const im = kind === "logo" ? await readLogo(f) : undefined;
      if (rev !== revisions[kind]) return;
      if (kind === "logo") {
        logo = f;
        original = im;
      } else production = f;
      design = { ...design, [kind]: meta };
      awaiting[kind] = false;
      cacheKey = "";
      name(kind);
      change();
      msg.textContent = storageOk ? copy("ready") : copy("storage");
    } finally {
      if (rev === revisions[kind]) loadingFiles.delete(kind);
    }
  }
  for (const kind of ["logo", "production"] as const) {
    const input = get<HTMLInputElement>('[data-file="' + kind + '"]');
    input.addEventListener("change", async () => {
      const f = input.files?.[0];
      if (f)
        try {
          await setFile(kind, f);
        } catch (e) {
          error(e);
        }
      input.value = "";
    });
    get('[data-clear="' + kind + '"]').addEventListener("click", () => {
      revisions[kind]++;
      loadingFiles.delete(kind);
      if (kind === "logo") {
        logo = undefined;
        original = undefined;
      } else production = undefined;
      design[kind] = null;
      awaiting[kind] = false;
      cacheKey = "";
      name(kind);
      change();
    });
  }
  get("[data-sample]").addEventListener("click", async () => {
    const rev = ++revisions.logo;
    loadingFiles.add("logo");
    try {
      const res = await fetch("/product-media/" + CUP + "/5039-sample.svg");
      if (!res.ok) throw Error();
      const sample = await res.blob();
      if (rev !== revisions.logo) return;
      awaiting.logo = false;
      await setFile(
        "logo",
        new File([sample], "pivoque-39.svg", {
          type: "image/svg+xml",
        }),
      );
    } catch (e) {
      error(e);
    } finally {
      if (rev === revisions.logo) loadingFiles.delete("logo");
    }
  });
  const imp = get<HTMLInputElement>("[data-import]");
  get("[data-import-button]").addEventListener("click", () => imp.click());
  imp.addEventListener("change", async () => {
    try {
      const f = imp.files?.[0];
      if (!f || f.size > 8192) throw Error();
      const next = parseDesign(JSON.parse(await f.text()));
      if (
        !Array.from(
          get<HTMLSelectElement>('[data-key="background"]').options,
        ).some((o) => o.value === next.background)
      )
        throw Error();
      if (
        logo?.name !== next.logo?.name ||
        design.logo?.sha256 !== next.logo?.sha256
      ) {
        logo = undefined;
        original = undefined;
      }
      if (
        production?.name !== next.production?.name ||
        design.production?.sha256 !== next.production?.sha256
      )
        production = undefined;
      revisions.logo++;
      revisions.production++;
      loadingFiles.clear();
      design = next;
      awaiting = {
        logo: !!next.logo && !logo,
        production: !!next.production && !production,
      };
      cacheKey = "";
      sync();
      change();
      msg.textContent = copy(
        awaiting.logo || awaiting.production ? "restore" : "ready",
      );
    } catch (e) {
      error(e);
    }
    imp.value = "";
  });
  const params = () =>
    new File([JSON.stringify(design, null, 2)], proofNames.parameters, {
      type: "application/json",
    });
  get("[data-export]").addEventListener("click", () => {
    const url = URL.createObjectURL(params());
    const a = document.createElement("a");
    a.href = url;
    a.download = proofNames.parameters;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  });
  function position(e: PointerEvent) {
    const r = flat.getBoundingClientRect(),
      width = 2 * sheet.radius + 10;
    const offset = (fraction: number) =>
      Math.max(
        -143,
        Math.min(143, Math.round((fraction - 0.5) * width * 10) / 10),
      );
    design.offsetXmm = offset((e.clientX - r.left) / r.width);
    design.offsetYmm = offset((e.clientY - r.top) / r.height);
    sync();
    change();
  }
  flat.addEventListener("pointerdown", (e) => {
    if (design.layout === "free") {
      flat.setPointerCapture(e.pointerId);
      position(e);
    }
  });
  flat.addEventListener("pointermove", (e) => {
    if (flat.hasPointerCapture(e.pointerId)) position(e);
  });
  function initialPose() {
    model?.setView(0, 0.42, 1);
  }
  get("[data-reset]").addEventListener("click", initialPose);
  for (const button of dialog.querySelectorAll<HTMLButtonElement>(
    "[data-pose]",
  ))
    button.addEventListener("click", () => {
      if (button.dataset.pose === "front") model?.setView(0, 0, 1);
      else if (button.dataset.pose === "bottom") model?.setView(0, -1, 0);
      else model?.setView(1, Math.SQRT2, 1);
    });
  add.addEventListener("click", async () => {
    if (busy) return;
    if (loadingFiles.size) {
      msg.textContent = copy("readingFiles");
      return;
    }
    if (!model) {
      msg.textContent = copy("unavailable");
      return;
    }
    if (
      awaiting.logo ||
      awaiting.production ||
      (design.logo && !logo) ||
      (design.production && !production)
    ) {
      msg.textContent = copy("restore");
      return;
    }
    if (!logo && !production) {
      msg.textContent = copy("need");
      return;
    }
    busy = true;
    add.disabled = true;
    const panel = get(".controls");
    panel.inert = true;
    msg.textContent = copy("busy");
    try {
      draw();
      const files: Files = { parameters: params() };
      if (logo) files.logo = logo;
      if (production) files.production = production;
      const proofs = model.capture();
      const paper = flatProof(flat, copy("proofTitle"), copy("guide"));
      for (const [i, role] of (["front", "angle", "top"] as const).entries()) {
        files[role] = new File(
          [await toBlob(proofs[i]!, "image/jpeg")],
          proofNames[role],
          { type: "image/jpeg" },
        );
      }
      files.blank = new File([await toBlob(paper)], proofNames.blank, {
        type: "image/png",
      });
      checkBytes(files);
      const id = crypto.randomUUID();
      await saveQuote(id, files);
      if (!addItem({ ...entry, designId: id })) throw Error("storage");
      get("[data-next]").hidden = false;
      msg.textContent = copy("added");
    } catch (e) {
      msg.textContent = copy(
        e instanceof Error && e.message === "payload_too_large"
          ? "large"
          : "storage",
      );
    } finally {
      busy = false;
      add.disabled = false;
      panel.inert = false;
    }
  });
  dialog.addEventListener("close", () => {
    persist();
    model?.active(false);
  });
  new MutationObserver(() => model?.active(dialog.open)).observe(dialog, {
    attributes: true,
    attributeFilter: ["open"],
  });
  model = await modelResult;
  dialog.dataset.modelState = model ? "ready" : "unavailable";
  if (model) {
    model.active(dialog.open);
    initialPose();
    draw();
    msg.textContent = copy(
      !storageOk
        ? "storage"
        : (design.logo && !logo) || (design.production && !production)
          ? "restore"
          : "ready",
    );
  } else {
    msg.textContent = copy("unavailable");
    add.disabled = true;
  }
}
