import { CUP, type Design } from "../lib/blank-design";
import {
  DesignFileError,
  MAX_ATTACHMENTS,
  proofNames,
  validatePackage,
  type Files,
  type Role,
} from "../lib/design-files";
import type { InquiryPayload } from "../lib/inquiry-payload";
const MAX_BODY = MAX_ATTACHMENTS + 130_000;
export async function readDesignForm(request: Request) {
  if (!request.body || Number(request.headers.get("content-length")) > MAX_BODY)
    throw new DesignFileError("payload_too_large");
  let bytes = 0,
    large = false;
  const limited = request.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        bytes += chunk.byteLength;
        if (bytes > MAX_BODY) {
          large = true;
          throw new Error("limit");
        }
        controller.enqueue(chunk);
      },
    }),
  );
  let form: FormData;
  try {
    form = await new Response(limited, {
      headers: { "Content-Type": request.headers.get("content-type")! },
    }).formData();
  } catch {
    throw new DesignFileError(large ? "payload_too_large" : "invalid_design");
  }
  const fields = form.getAll("payload");
  if (
    fields.length !== 1 ||
    typeof fields[0] !== "string" ||
    new TextEncoder().encode(fields[0]).length > 100_000
  )
    throw new DesignFileError();
  const input: unknown = JSON.parse(fields[0]);
  const files: Files = {};
  for (const [key, f] of form) {
    if (key === "payload") continue;
    if (
      !["logo", "production", ...Object.keys(proofNames)].includes(key) ||
      typeof f === "string" ||
      Object.hasOwn(files, key)
    )
      throw new DesignFileError();
    files[key as Role] = f;
  }
  return { input, files };
}
const modeNames: Record<Design["layout"], string> = {
  wall: "杯壁单标",
  base: "杯底单标",
  wrap: "横排环绕",
  vertical: "竖排",
  diagonal: "斜向满版",
  free: "自由摆放",
};
export function designRows(d: Design): [string, string][] {
  return [
    ["规格", "5039 · PET 淋膜圆形卷口杯"],
    ["原片", "圆形，直径 143 mm"],
    ["印刷面", d.printSide === "outside" ? "外侧" : "内侧"],
    ["排版", modeNames[d.layout]],
    ["标志宽度", d.widthMm + " mm"],
    ["旋转", d.rotationDeg + "°"],
    ["间距", d.spacingMm + " mm"],
    ["偏移 X / Y", d.offsetXmm + " / " + d.offsetYmm + " mm"],
    ["数量", d.count === null ? "自动" : String(d.count)],
    ["斜向角度", d.diagonalDeg + "°"],
    ["底色", d.background],
    ["颜色模式", d.colorMode === "mono" ? "单色 " + d.ink : "原色"],
    ["环向拉宽补偿", d.compensate ? "开启" : "关闭"],
    ["去白底", d.removeWhite ? "开启" : "关闭"],
    ["Logo 原稿", d.logo?.name ?? "未提供"],
    ["制作附件", d.production?.name ?? "未提供"],
  ];
}
export async function prepareDesign(files: Files, inquiry: InquiryPayload) {
  if (
    !inquiry.items.some(
      (i) => i.slug === CUP && i.category === "rolled-rim-baking-cups",
    )
  )
    throw new DesignFileError();
  const design = await validatePackage(files);
  const attachments = [];
  for (const f of Object.values(files)) {
    const data = new Uint8Array(await f.arrayBuffer());
    const pieces: string[] = [];
    for (let off = 0; off < data.length; off += 24576)
      pieces.push(
        btoa(String.fromCharCode(...data.subarray(off, off + 24576))),
      );
    attachments.push({ filename: f.name, content: pieces.join("") });
  }
  return { design, attachments };
}
