import { readFileSync } from "node:fs";
import { MeshoptDecoder } from "meshoptimizer/decoder";
import { describe, it, expect } from "vitest";
import {
  parseProductTechnicalSpec,
  verifiedValue,
} from "../../src/lib/product-technical-schema";

interface Accessor {
  bufferView: number;
  count: number;
  type: string;
  componentType: number;
}
interface Compressed {
  byteOffset: number;
  byteLength: number;
  byteStride: number;
  count: number;
  mode: string;
}
interface Primitive {
  indices: number;
  attributes: { POSITION: number; NORMAL: number; TEXCOORD_0: number };
  extras: { surface: string };
}
interface FileData {
  extensionsRequired: string[];
  bufferViews: { extensions: { EXT_meshopt_compression: Compressed } }[];
  accessors: Accessor[];
  meshes: { name: string; primitives: Primitive[] }[];
  nodes: { name: string; translation?: number[] }[];
}
function extent(points: Float32Array, axis: number, minY?: number) {
  let min = Infinity,
    max = -Infinity;
  for (let i = 0; i < points.length; i += 3) {
    if (minY !== undefined && Math.abs(points[i + 1]! - minY) > 0.000001)
      continue;
    min = Math.min(min, points[i + axis]!);
    max = Math.max(max, points[i + axis]!);
  }
  return (max - min) * 1000;
}
function expectDimension(measured: number, expected: number) {
  expect(Math.abs(measured / expected - 1)).toBeLessThanOrEqual(0.01);
}
const products = [
  "pet-coated-round-rolled-rim-baking-cups",
  "pet-coated-square-rolled-rim-cups",
  "rectangular-coated-paper-boxes",
];
describe.each(products)("模型 %s", (slug) => {
  const spec = parseProductTechnicalSpec(
    JSON.parse(readFileSync("data/product-specs/" + slug + ".json", "utf8")),
  );
  for (const v of spec.variants)
    it(v.id + " 的压缩网格、封闭表面和实物外包尺寸", async () => {
      await MeshoptDecoder.ready;
      const glb = readFileSync("public/models/" + slug + "/" + v.id + ".glb");
      expect(glb.length).toBeLessThanOrEqual(2_000_000);
      expect(glb.toString("utf8", 0, 4)).toBe("glTF");
      expect(glb.readUInt32LE(8)).toBe(glb.length);
      const len = glb.readUInt32LE(12),
        bin = glb.subarray(28 + len);
      const data: FileData = JSON.parse(glb.toString("utf8", 20, 20 + len));
      expect(data.extensionsRequired).toContain("EXT_meshopt_compression");
      function decode(index: number) {
        const a = data.accessors[index]!,
          x =
            data.bufferViews[a.bufferView]!.extensions.EXT_meshopt_compression;
        const bytes = new Uint8Array(x.count * x.byteStride);
        MeshoptDecoder.decodeGltfBuffer(
          bytes,
          x.count,
          x.byteStride,
          bin.subarray(x.byteOffset, x.byteOffset + x.byteLength),
          x.mode,
        );
        return bytes.buffer;
      }
      for (const mesh of data.meshes) {
        const lid = mesh.name === "Lid",
          part = lid ? v.lid! : v.body,
          g = part.geometry;
        const surface = (name: string) =>
          mesh.primitives.find((p) => p.extras.surface === name)!;
        const pos = (s: Primitive) =>
          new Float32Array(decode(s.attributes.POSITION));
        const base = pos(surface(lid ? "Skirt" : "Exterior")),
          upper = pos(surface(lid ? "Top" : "Rim"));
        const width =
          verifiedValue(g.baseLengthMm) ?? verifiedValue(g.baseDiameterMm)!;
        const depth = verifiedValue(g.baseWidthMm) ?? width;
        const tw =
          verifiedValue(g.topLengthMm) ?? verifiedValue(g.topDiameterMm)!;
        const td = verifiedValue(g.topWidthMm) ?? tw;
        const height = verifiedValue(g.heightMm)!;
        expectDimension(extent(base, 0, 0), width);
        expectDimension(extent(base, 2, 0), depth);
        expectDimension(extent(upper, 0), tw);
        expectDimension(extent(upper, 2), td);
        let top = -Infinity;
        for (let i = 1; i < upper.length; i += 3)
          top = Math.max(top, upper[i]!);
        expectDimension(top * 1000, height);
        if (!lid && verifiedValue(part.rimThicknessMm)) {
          expectDimension(
            extent(upper, 1),
            verifiedValue(part.rimThicknessMm)!,
          );
          // 读回卷边各高度环在 x 方向的直径，以最大与最小直径差的一半校验单边宽度。
          const sides = new Map<number, number>();
          for (let i = 0; i < upper.length; i += 3) {
            const y = upper[i + 1]!,
              x = Math.abs(upper[i]!);
            sides.set(y, Math.max(sides.get(y) ?? 0, x));
          }
          expectDimension(
            (Math.max(...sides.values()) - Math.min(...sides.values())) * 1000,
            verifiedValue(part.rimWidthMm)!,
          );
        }
        if (lid)
          expectDimension(
            data.nodes.find((n) => n.name === "Lid")!.translation![1]! * 1000,
            verifiedValue(v.body.geometry.heightMm)!,
          );
        const edges = new Map<string, number>();
        for (const primitive of mesh.primitives) {
          const p = pos(primitive),
            normals = new Float32Array(decode(primitive.attributes.NORMAL)),
            uv = new Float32Array(decode(primitive.attributes.TEXCOORD_0));
          expect(normals.length).toBe(p.length);
          expect(uv.length / 2).toBe(p.length / 3);
          expect(
            uv.every(
              (n) => Number.isFinite(n) && n >= -0.00001 && n <= 1.00001,
            ),
          ).toBe(true);
          if (
            primitive.extras.surface === "Floor" ||
            primitive.extras.surface === "Top"
          )
            expect(normals[1]).toBeCloseTo(1, 4);
          if (primitive.extras.surface === "Underside")
            expect(normals[1]).toBeCloseTo(-1, 4);
          const keys: string[] = [];
          for (let i = 0; i < p.length; i += 3)
            keys.push(
              [p[i], p[i + 1], p[i + 2]]
                .map((n) => Math.round(n! * 1e7))
                .join("/"),
            );
          const indices = new Uint16Array(decode(primitive.indices));
          for (let i = 0; i < indices.length; i += 3)
            for (let j = 0; j < 3; j++) {
              const a = keys[indices[i + j]!]!,
                b = keys[indices[i + ((j + 1) % 3)]!]!;
              const edge = a < b ? a + "|" + b : b + "|" + a;
              edges.set(edge, (edges.get(edge) ?? 0) + 1);
            }
        }
        expect([...edges.values()].every((uses) => uses === 2)).toBe(true);
        if (spec.shape === "round-rolled-rim") {
          const yLevels = Array.from(
            new Set(Array.from(base).filter((_, i) => i % 3 === 1)),
          ).sort((a, b) => a - b);
          const y = yLevels[Math.floor(yLevels.length / 2)]!,
            radii: number[] = [];
          for (let i = 0; i < base.length; i += 3)
            if (base[i + 1] === y)
              radii.push(Math.hypot(base[i]!, base[i + 2]!));
          radii.pop();
          const cut = (Math.min(...radii) + Math.max(...radii)) * 0.5;
          expect(
            radii.filter(
              (r, i) =>
                r < cut && radii[(i + radii.length - 1) % radii.length]! >= cut,
            ).length,
          ).toBe(verifiedValue(part.pleatCount));
        }
      }
    });
});
