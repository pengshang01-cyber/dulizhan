import { readFileSync } from "node:fs";
import sharp from "sharp";
import { describe, it, expect } from "vitest";
import {
  parseProductTechnicalSpec,
  verifiedValue,
} from "../../src/lib/product-technical-schema";
import {
  bounds,
  edgeUses,
  foldedSection,
  readModel,
  rimSection,
} from "./inspect";
import type { Surface } from "./inspect";

// Away from the lip and foot, horizontal edges of the paper-detail atlas run along its U axis.
// Compare their projected 3D directions with the tangent embedded in the delivered GLB.
function alignedAtlasEdges(surface: Surface, middle: number) {
  const { positions, normals, detail, tangents, indices } = surface;
  let edges = 0,
    aligned = 0;
  for (let i = 0; i < indices.length; i += 3) {
    for (let j = 0; j < 3; j++) {
      const a = indices[i + j],
        b = indices[i + ((j + 1) % 3)];
      if (
        Math.abs(positions[a * 3 + 1] - middle) > middle * 0.35 ||
        detail[a * 2 + 1] !== detail[b * 2 + 1] ||
        detail[b * 2] <= detail[a * 2] + 0.0005
      )
        continue;
      const direction = [0, 1, 2].map(
        (k) => positions[b * 3 + k] - positions[a * 3 + k],
      );
      const n = [0, 1, 2].map((k) => normals[a * 3 + k]);
      const dot = direction.reduce((s, v, k) => s + v * n[k], 0);
      const tangent = direction.map((v, k) => v - dot * n[k]);
      const length = Math.hypot(...tangent);
      if (length < 0.00002) continue;
      const agreement =
        tangent.reduce((s, v, k) => s + v * tangents[a * 4 + k], 0) / length;
      edges++;
      if (agreement > 0.98) aligned++;
    }
  }
  return aligned / edges;
}

function matchMm(measured: number, expected: number) {
  expect(Math.abs(measured / expected - 1)).toBeLessThanOrEqual(0.01);
}
const products = [
  "pet-coated-round-rolled-rim-baking-cups",
  "pet-coated-square-rolled-rim-cups",
  "rectangular-coated-paper-boxes",
];
describe.each(products)("Blender 模型 %s", (slug) => {
  const spec = parseProductTechnicalSpec(
    JSON.parse(readFileSync("data/product-specs/" + slug + ".json", "utf8")),
  );
  for (const variant of spec.variants) {
    it(variant.id + " 的实测尺寸、封闭折纸、印刷 UV 和烘焙纹理", async () => {
      const model = await readModel(
        "public/models/" + slug + "/" + variant.id + ".glb",
      );
      const { gltf, surfaces } = model;
      expect(model.bytes).toBeLessThanOrEqual(3_000_000);
      expect(gltf.extensionsRequired).toContain("EXT_meshopt_compression");
      expect(model.images).toHaveLength(1);
      const normalMap = sharp(model.images[0]),
        metadata = await normalMap.metadata();
      expect(metadata.format).toBe("png");
      expect(Math.max(metadata.width!, metadata.height!)).toBeLessThanOrEqual(
        1024,
      );
      const channels = (await normalMap.stats()).channels;
      expect(channels[0].stdev).toBeGreaterThan(1);
      expect(channels[1].stdev).toBeGreaterThan(1);
      expect(channels[2].mean).toBeGreaterThan(200);
      for (const s of surfaces.values()) {
        expect(s.normals.length).toBe(s.positions.length);
        expect(s.tangents.length / 4).toBe(s.positions.length / 3);
        expect(s.print.length / 2).toBe(s.positions.length / 3);
        expect(s.detail.length).toBe(s.print.length);
        expect(
          s.print.every(
            (n) => Number.isFinite(n) && n >= -0.00001 && n <= 1.00001,
          ),
        ).toBe(true);
        if (s.name.startsWith("Body.")) {
          expect(gltf.materials[s.material].normalTexture?.texCoord).toBe(1);
          expect(s.detail.some((n, i) => Math.abs(n - s.print[i]) > 0.01)).toBe(
            true,
          );
        }
      }
      expect(gltf.nodes.some((n) => n.name === "Body")).toBe(true);
      expect(
        [...surfaces.keys()].every((name) => name.startsWith("Body.")),
      ).toBe(true);
      expect(gltf.nodes.some((n) => /lid/i.test(n.name))).toBe(false);
      expect(gltf.materials.some((m) => m.name === "ClearPET")).toBe(false);
      const part = variant.body,
        g = part.geometry;
      const s = (name: string) => surfaces.get("Body." + name)!;
      const lower = bounds(s("Exterior").positions, 0),
        upper = bounds(s("Rim").positions);
      const base =
        verifiedValue(g.baseLengthMm) ?? verifiedValue(g.baseDiameterMm)!;
      const top =
        verifiedValue(g.topLengthMm) ?? verifiedValue(g.topDiameterMm)!;
      matchMm(lower.width, base);
      matchMm(lower.depth, verifiedValue(g.baseWidthMm) ?? base);
      matchMm(upper.width, top);
      matchMm(upper.depth, verifiedValue(g.topWidthMm) ?? top);
      matchMm(upper.top, verifiedValue(g.heightMm)!);
      expect(
        [...edgeUses([...surfaces.values()]).values()].every((v) => v === 2),
      ).toBe(true);
      expect(s("Underside").normals[1]).toBeCloseTo(-1, 4);
      expect(s("Floor").normals[1]).toBeCloseTo(1, 4);
      expect(s("Underside").material).toBe(s("Exterior").material);
      expect(
        gltf.materials[s("Floor").material].pbrMetallicRoughness
          .baseColorFactor,
      ).toEqual(
        gltf.materials[s("Exterior").material].pbrMetallicRoughness
          .baseColorFactor,
      );
      if (spec.shape !== "box") {
        const outside = gltf.materials[s("Exterior").material],
          lining = gltf.materials[s("Interior").material];
        for (const mat of [
          outside,
          lining,
          gltf.materials[s("Rim").material],
        ]) {
          expect(mat.pbrMetallicRoughness.metallicFactor).toBe(0);
          expect(mat.pbrMetallicRoughness.roughnessFactor).toBeLessThan(0.28);
          expect(
            mat.extensions?.KHR_materials_clearcoat?.clearcoatFactor,
          ).toBeGreaterThan(0.6);
        }
        expect(lining.pbrMetallicRoughness.roughnessFactor!).toBeLessThan(
          outside.pbrMetallicRoughness.roughnessFactor!,
        );
        const sample = spec.colors.find(
          (c) =>
            verifiedValue(c.name)?.en === spec.modelAppearance!.sampleColor.en,
        )!;
        const hex = verifiedValue(sample.hex) ?? sample.display!.hex;
        const srgb = outside.pbrMetallicRoughness
          .baseColorFactor!.slice(0, 3)
          .map((c) =>
            Math.round(
              255 *
                (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055),
            ),
          );
        expect(srgb).toEqual(
          [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)),
        );
      }
      if (verifiedValue(part.rimWidthMm)) {
        // 管口要突出侧壁。旧版卷管虽然量到 2 mm，侧纸却伸出了大部分管下空间。
        const wall = bounds(s("Exterior").positions);
        const clearance =
          Math.min(upper.width - wall.width, upper.depth - wall.depth) / 2;
        expect(clearance).toBeGreaterThan(
          verifiedValue(part.rimWidthMm)! * 0.6,
        );
        const sections = Array.from({ length: 24 }, (_, i) =>
          rimSection(
            s("Rim"),
            spec.shape === "round-rolled-rim"
              ? 0.0071 + i * 0.2688
              : -0.123 + i * 0.0111,
          ),
        );
        expect(sections.every((section) => section.layers >= 4)).toBe(true);
        const median = (axis: "width" | "thickness") =>
          sections.map((v) => v[axis]).sort((a, b) => a - b)[12];
        matchMm(median("width"), verifiedValue(part.rimWidthMm)!);
        matchMm(median("thickness"), verifiedValue(part.rimThicknessMm)!);
        if (spec.shape === "round-rolled-rim") {
          const y = sections.map((v) => v.top);
          expect(Math.max(...y) - Math.min(...y)).toBeGreaterThan(0.2);
        }
      }
      if (spec.shape === "round-rolled-rim") {
        expect(
          alignedAtlasEdges(s("Exterior"), upper.top * 0.0005),
        ).toBeGreaterThan(0.85);
        const pleats = verifiedValue(part.pleatCount)!;
        const uniform = 360 / pleats;
        for (const heightFraction of [
          0.23, 0.32, 0.42, 0.53, 0.63, 0.71, 0.78,
        ]) {
          const section = foldedSection(
            s("Exterior"),
            (upper.top * heightFraction) / 1000,
          );
          expect(section.folds).toBe(pleats);
          expect(section.minPitch).toBeGreaterThanOrEqual(uniform * 0.85);
          expect(section.maxPitch).toBeLessThanOrEqual(uniform * 1.15);
          expect(section.minPitch).toBeLessThan(uniform * 0.95);
          expect(section.maxPitch).toBeGreaterThan(uniform * 1.05);
        }
      }
      if (spec.shape === "square-rolled-rim") {
        const appearance = spec.modelAppearance!;
        for (const f of [0.34, 0.57, 0.76]) {
          const center =
            (base * (0.5 - appearance.baseCornerFraction!) * (1 - f) +
              top * (0.5 - appearance.topCornerFraction!) * f) /
            1000;
          const section = foldedSection(
            s("Exterior"),
            (upper.top * f) / 1000,
            center,
          );
          expect(section.corners).toEqual([5, 5, 5, 5]);
          expect(section.flatFolds).toBe(0);
          expect(section.folds).toBe(verifiedValue(part.pleatCount));
        }
      }
    });
  }
});
