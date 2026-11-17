import { describe, expect, it } from "vitest";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  collectTodos,
  END,
  isPending,
  leaves,
  START,
  updateGeneratedSection,
} from "./todo-report";

describe("launch checklist generation", () => {
  it("finds nested bilingual and list placeholders, including draft outlines", () => {
    const values = leaves({
      title: { en: "TODO_TITLE", zh: "" },
      sizes: [{ name: "TODO_SIZE" }],
      sku: "TODO-001",
      body: "[TODO]",
    });
    expect(values.filter((item) => isPending(item.value))).toHaveLength(4);
    expect(isPending("Approved factory description")).toBe(false);
  });
  it("updates only the generated region and is idempotent", () => {
    const doc =
      "Intro\n" + START + "\nold\n" + END + "\n- [x] Manual launch check\n";
    const next = updateGeneratedSection(doc, "New pending items");
    expect(next).toContain("- [x] Manual launch check");
    expect(next).toContain("Intro\n");
    expect(next).not.toContain("old");
    expect(updateGeneratedSection(next, "New pending items")).toBe(next);
    expect(() => updateGeneratedSection("Missing markers", "New")).toThrow(
      "保护人工内容",
    );
  });
  it("re-scans real data, reports images and removes completed fields", async () => {
    const root = await mkdtemp(join(tmpdir(), "m7-todos-"));
    try {
      await mkdir(join(root, "src/data"), { recursive: true });
      await mkdir(join(root, "src/content/products"), { recursive: true });
      const sitePath = join(root, "src/data/site.json");
      await writeFile(
        sitePath,
        JSON.stringify({ companyName: { en: "TODO_COMPANY" }, wechatQr: "" }),
      );
      await writeFile(
        join(root, "src/content/products/sample-cup.json"),
        JSON.stringify({
          title: { en: "Sample Cup" },
          sku: "TODO-001",
          images: ["../../assets/images/products/placeholder.png"],
        }),
      );
      const first = await collectTodos(root);
      expect(first.summary).toEqual({
        scannedFiles: 2,
        todoFields: 2,
        placeholderReferences: 1,
        emptyImages: 6,
        exampleProducts: 1,
      });
      expect(first.section).toContain("产品 → Sample Cup");
      expect(first.section).toContain("公司全称 → 英文");
      for (const label of [
        "首页主图",
        "关于我们车间与设备照片",
        "默认分享图",
        "网站 Logo",
        "工厂视频封面",
      ])
        expect(first.section).toContain(label);
      expect(first.section).not.toContain("目前无 CMS 字段");
      await writeFile(
        sitePath,
        JSON.stringify({ companyName: { en: "Verified name" }, wechatQr: "" }),
      );
      expect((await collectTodos(root)).summary.todoFields).toBe(1);
      await writeFile(
        sitePath,
        JSON.stringify({
          companyName: { en: "Verified name" },
          logo: "../assets/images/site/logo.png",
          ogImage: "../assets/images/site/share.jpg",
          homeHeroImage: "../assets/images/site/hero.jpg",
          factoryVideoPoster: "../assets/images/site/video.jpg",
          wechatQr: "../assets/images/site/qr.png",
          aboutGallery: [
            {
              image: "../assets/images/site/workshop.jpg",
              caption: { en: "Workshop", zh: "车间" },
            },
          ],
        }),
      );
      const complete = await collectTodos(root);
      expect(complete.summary.emptyImages).toBe(0);
      expect(complete.section).not.toContain("（目前为空）");
    } finally {
      if (!resolve(root).startsWith(join(resolve(tmpdir()), "m7-todos-")))
        throw new Error("Unexpected cleanup path");
      await rm(root, { recursive: true, force: true });
    }
  });
});
