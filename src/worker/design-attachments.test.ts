import { describe, it, expect, vi } from "vitest";
import { CUP, newDesign } from "../lib/blank-design";
import {
  checkBytes,
  checkFile,
  digest,
  proofNames,
  validatePackage,
  type Files,
} from "../lib/design-files";
import { handleRequest } from "./index";
import sharp from "sharp";
const png = await sharp({
  create: { width: 16, height: 16, channels: 3, background: "white" },
})
  .png()
  .toBuffer();
const jpg = await sharp(png).jpeg().toBuffer();
async function fixture() {
  const logo = new File([Uint8Array.from(png)], "art.png", {
    type: "image/png",
  });
  const d = {
    ...newDesign("outside", "#f0ece2"),
    logo: { name: logo.name, sha256: await digest(logo) },
  };
  const files: Files = { logo };
  for (const k of ["front", "angle", "top"] as const)
    files[k] = new File([Uint8Array.from(jpg)], proofNames[k], {
      type: "image/jpeg",
    });
  files.blank = new File([Uint8Array.from(png)], proofNames.blank, {
    type: "image/png",
  });
  files.parameters = new File([JSON.stringify(d)], proofNames.parameters, {
    type: "application/json",
  });
  return { files, d };
}
const payload = {
  name: "M20 TEST",
  email: "test@example.com",
  country: "US",
  message: "M20 test",
  locale: "en",
  samples: false,
  sourceUrl: "https://example.com/contact/",
  turnstileToken: "mock",
  quantity: "",
  utm: {},
  items: [
    {
      slug: CUP,
      category: "rolled-rim-baking-cups",
      title: "5039",
      quantity: null,
    },
  ],
};
const env = {
  ASSETS: { fetch: fetch },
  TURNSTILE_SECRET_KEY: "unit-test",
  RESEND_API_KEY: "unit-test",
  INQUIRY_TO_EMAIL: "team@example.com",
  INQUIRY_FROM_EMAIL: "factory@example.com",
};
function form(files: Files, input: unknown = payload) {
  const f = new FormData();
  f.append("payload", JSON.stringify(input));
  for (const [k, v] of Object.entries(files)) f.append(k, v, v.name);
  return new Request("https://example.com/api/inquiry", {
    method: "POST",
    body: f,
  });
}
describe("定制附件", () => {
  it("声明有随单设计的清单不能静默降级成普通询盘", async () => {
    const send = vi.fn<typeof fetch>();
    const response = await handleRequest(
      new Request("https://example.com/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          items: [{ ...payload.items[0], designId: "missing" }],
        }),
      }),
      env,
      { fetch: send },
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: "missing_design" });
    expect(send).not.toHaveBeenCalled();
  });
  it("保留原稿、三视角、平片和 JSON，生成中文参数表", async () => {
    const { files } = await fixture();
    const send = vi.fn<typeof fetch>(async (input) =>
      Response.json(
        String(input).includes("siteverify")
          ? { success: true }
          : { id: "test" },
      ),
    );
    const resp = await handleRequest(form(files), env, { fetch: send });
    expect(resp.status).toBe(200);
    const email = JSON.parse(String(send.mock.calls[1]![1]!.body));
    expect(email.attachments).toHaveLength(6);
    expect(email.html).toContain("环向拉宽补偿");
    expect(email.text).toContain("杯壁单标");
    expect(
      email.attachments.find(
        (x: { filename: string }) => x.filename === "art.png",
      ).content,
    ).toEqual(png.toString("base64"));
  });
  it("签名、实际字节、附件缺失与校验值失配均拒收", async () => {
    const { files } = await fixture();
    await expect(
      checkFile(new File(["plain"], "art.jpg", { type: "image/jpeg" }), "logo"),
    ).rejects.toThrow();
    expect(() =>
      checkBytes({ logo: new File([new Uint8Array(11_300_000)], "large.png") }),
    ).toThrow("payload_too_large");
    await expect(
      validatePackage({ ...files, angle: undefined }),
    ).rejects.toThrow();
    await expect(
      validatePackage({
        ...files,
        logo: new File([Uint8Array.from(png), "-"], "art.png", {
          type: "image/png",
        }),
      }),
    ).rejects.toThrow();
  });
  it("附 PDF / AI 时按原名和摘要核对，同样执行人机验证", async () => {
    const { files, d } = await fixture();
    for (const ext of ["pdf", "ai"]) {
      const production = new File(["%PDF-1.7\nfixture"], "print." + ext, {
        type: "application/pdf",
      });
      const design = {
        ...d,
        production: { name: production.name, sha256: await digest(production) },
      };
      const pack = {
        ...files,
        production,
        parameters: new File([JSON.stringify(design)], proofNames.parameters, {
          type: "application/json",
        }),
      };
      expect(await validatePackage(pack)).toEqual(design);
      const send = vi.fn<typeof fetch>(async () =>
        Response.json({ success: false }),
      );
      expect(
        (await handleRequest(form(pack), env, { fetch: send })).status,
      ).toBe(403);
      expect(send).toHaveBeenCalledTimes(1);
    }
  });
  it("普通询盘保持原来的 JSON 路径", async () => {
    const send = vi.fn<typeof fetch>(async (input) =>
      Response.json(
        String(input).includes("siteverify")
          ? { success: true }
          : { id: "test" },
      ),
    );
    const resp = await handleRequest(
      new Request("https://example.com/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      env,
      { fetch: send },
    );
    expect(resp.status).toBe(200);
    expect(JSON.parse(String(send.mock.calls[1]![1]!.body))).not.toHaveProperty(
      "attachments",
    );
  });
});
