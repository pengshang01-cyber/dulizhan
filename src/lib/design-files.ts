import { parseDesign, validFileName, type Design } from "./blank-design";
export const MAX_SOURCE = 10_000_000,
  MAX_ATTACHMENTS = 15_000_000;
export const proofNames = {
  front: "5039-front.jpg",
  angle: "5039-45deg.jpg",
  top: "5039-top.jpg",
  blank: "5039-blank.png",
  parameters: "5039-design.json",
} as const;
export type Role = keyof typeof proofNames | "logo" | "production";
export type Files = Partial<Record<Role, File>>;
export class DesignFileError extends Error {
  code: "invalid_design" | "payload_too_large" | "missing_design";
  constructor(code: DesignFileError["code"] = "invalid_design") {
    super(code);
    this.code = code;
  }
}
export async function digest(blob: Blob) {
  const hash = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return Array.from(new Uint8Array(hash), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
const types: Record<string, string[]> = {
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  svg: ["image/svg+xml"],
  pdf: ["application/pdf"],
  ai: [
    "application/pdf",
    "application/postscript",
    "application/illustrator",
    "application/vnd.adobe.illustrator",
  ],
  json: ["application/json"],
};
export async function checkFile(f: File, role: Role) {
  if (!f.size || !validFileName(f.name)) throw new DesignFileError();
  if (
    f.size >
    (role === "logo" || role === "production"
      ? MAX_SOURCE
      : role === "parameters"
        ? 8192
        : MAX_ATTACHMENTS)
  )
    throw new DesignFileError("payload_too_large");
  const ext = f.name.toLowerCase().split(".").pop() ?? "";
  const allowed =
    role === "logo"
      ? ["png", "jpg", "jpeg", "svg"]
      : role === "production"
        ? ["pdf", "ai"]
        : role === "parameters"
          ? ["json"]
          : role === "blank"
            ? ["png"]
            : ["jpg"];
  if (
    !allowed.includes(ext) ||
    (role in proofNames &&
      f.name !== proofNames[role as keyof typeof proofNames]) ||
    (f.type &&
      f.type !== "application/octet-stream" &&
      !types[ext]?.includes(f.type.toLowerCase()))
  )
    throw new DesignFileError();
  const b = new Uint8Array(await f.slice(0, 512).arrayBuffer());
  const head = new TextDecoder().decode(b);
  let ok = false;
  if (ext === "png")
    ok =
      [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => b[i] === n) &&
      head.slice(12, 16) === "IHDR" &&
      b.length >= 24;
  else if (ext === "jpeg" || ext === "jpg")
    ok = b[0] === 255 && b[1] === 216 && b[2] === 255;
  else if (ext === "pdf" || ext === "ai")
    ok =
      head.startsWith("%PDF-") ||
      (ext === "ai" && head.startsWith("%!PS-Adobe-"));
  else if (ext === "json") ok = head.trimStart().startsWith("{");
  else if (ext === "svg") {
    const xml = (await f.text())
      .replace(/^\uFEFF/, "")
      .trim()
      .replace(/^<\?xml[^?]*\?>\s*/i, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim();
    const tags = Array.from(xml.matchAll(/<\/?([^\s/>]+)/g), (m) =>
      m[1]!.toLowerCase(),
    );
    const passive = new Set(
      "svg g path rect line circle ellipse polyline polygon text tspan title desc defs symbol use clippath mask lineargradient radialgradient stop pattern".split(
        " ",
      ),
    );
    ok =
      /^<svg(?:\s|>)/i.test(xml) &&
      /<\/svg\s*>$/i.test(xml) &&
      tags.every((t) => passive.has(t)) &&
      !/<[!?]|\s(?:on[\w:-]+|xml:base)\s*=|@import|javascript\s*:|expression\s*\(|\\|&#/i.test(
        xml,
      ) &&
      !/\b(?:href|src)\s*=\s*["'](?!#[\w.-]+["'])/i.test(xml) &&
      !/url\s*\(\s*['"]?(?!#[\w.-]+['"]?\s*\))/i.test(xml);
  }
  if (!ok) throw new DesignFileError();
}
export function checkBytes(files: Files) {
  if (
    Object.values(files).reduce((n, f) => n + 4 * Math.ceil(f.size / 3), 0) >
    MAX_ATTACHMENTS
  )
    throw new DesignFileError("payload_too_large");
}
export async function validatePackage(files: Files): Promise<Design> {
  for (const role of Object.keys(proofNames) as (keyof typeof proofNames)[])
    if (!files[role]) throw new DesignFileError();
  checkBytes(files);
  for (const [role, file] of Object.entries(files))
    await checkFile(file, role as Role);
  let design: Design;
  try {
    design = parseDesign(JSON.parse(await files.parameters!.text()));
  } catch {
    throw new DesignFileError();
  }
  if (!design.logo && !design.production) throw new DesignFileError();
  for (const k of ["logo", "production"] as const) {
    const meta = design[k],
      f = files[k];
    if (
      Boolean(meta) !== Boolean(f) ||
      (meta && f && (meta.name !== f.name || (await digest(f)) !== meta.sha256))
    )
      throw new DesignFileError();
  }
  return design;
}
