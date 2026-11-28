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
      const lid = gltf.nodes.find((n) => n.name === "Lid");
      expect(Boolean(lid)).toBe(
        Boolean(variant.lid && verifiedValue(variant.lid.geometry.topLengthMm)),
      );
      if (lid)
        matchMm(
          lid.translation![1] * 1000,
          verifiedValue(variant.body.geometry.heightMm)!,
        );
      for (const partName of lid ? ["Body", "Lid"] : ["Body"]) {
        const isLid = partName === "Lid",
          part = isLid ? variant.lid! : variant.body,
          g = part.geometry;
        const s = (name: string) => surfaces.get(partName + "." + name)!;
        const lower = bounds(s(isLid ? "Skirt" : "Exterior").positions, 0),
          upper = bounds(s(isLid ? "Top" : "Rim").positions);
        const base =
          verifiedValue(g.baseLengthMm) ?? verifiedValue(g.baseDiameterMm)!;
        const top =
          verifiedValue(g.topLengthMm) ?? verifiedValue(g.topDiameterMm)!;
        matchMm(lower.width, base);
        matchMm(lower.depth, verifiedValue(g.baseWidthMm) ?? base);
        matchMm(upper.width, top);
        matchMm(upper.depth, verifiedValue(g.topWidthMm) ?? top);
        matchMm(upper.top, verifiedValue(g.heightMm)!);
        const physical = Array.from(surfaces.values()).filter((s) =>
          s.name.startsWith(partName + "."),
        );
        expect(
          Array.from(edgeUses(physical).values()).every((v) => v === 2),
        ).toBe(true);
        if (isLid) {
          expect(s("Top").normals[1]).toBeCloseTo(1, 4);
          expect(gltf.materials[s("Top").material].name).toBe("ClearPET");
          continue;
        }
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
        if (verifiedValue(part.rimWidthMm)) {
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
          const section = foldedSection(
            s("Exterior"),
            verifiedValue(g.heightMm)! * 0.00071,
          );
          const pleats = verifiedValue(part.pleatCount)!;
          expect(section.folds).toBe(pleats);
          expect(section.minPitch).toBeGreaterThanOrEqual((360 / pleats) * 0.9);
          expect(section.maxPitch).toBeLessThanOrEqual((360 / pleats) * 1.1);
        }
      }
    });
  }
});
