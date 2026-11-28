import { Color } from "three";
import { MeshoptEncoder } from "meshoptimizer/encoder";
import sharp from "sharp";
import type { ModelPart, Surface } from "./geometry.ts";

type Dict = Record<string, unknown>;
const extension = "EXT_meshopt_compression";
const align = (n: number) => (n + 3) & ~3;
async function paperGrain() {
  const bytes = Buffer.alloc(64 * 64 * 3);
  let seed = 31;
  for (let i = 0; i < bytes.length; i += 3) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    bytes[i] = 255;
    bytes[i + 1] = 206 + (seed >>> 27);
    bytes[i + 2] = 0;
  }
  return sharp(bytes, { raw: { width: 64, height: 64, channels: 3 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}
export async function encodeModel(
  parts: ModelPart[],
  hex: string,
  pet: boolean,
): Promise<Buffer> {
  await MeshoptEncoder.ready;
  const views: Dict[] = [],
    accessors: Dict[] = [],
    chunks: Buffer[] = [];
  let packedLength = 0,
    rawLength = 0;
  function append(data: Uint8Array) {
    const offset = packedLength;
    chunks.push(Buffer.from(data));
    packedLength += data.byteLength;
    const padding = align(packedLength) - packedLength;
    if (padding) {
      chunks.push(Buffer.alloc(padding));
      packedLength += padding;
    }
    return offset;
  }
  function accessor(
    data: Float32Array | Uint16Array,
    components: number,
    position = false,
  ) {
    const indices = data instanceof Uint16Array,
      count = data.length / components;
    const mode = indices ? "TRIANGLES" : "ATTRIBUTES",
      stride = data.BYTES_PER_ELEMENT * components;
    const raw = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    const compressed = MeshoptEncoder.encodeGltfBuffer(
      raw,
      count,
      stride,
      mode,
      0,
    );
    const info = {
      buffer: 0,
      byteOffset: append(compressed),
      byteLength: compressed.byteLength,
      count,
      byteStride: stride,
      mode,
    };
    const view =
      views.push({
        buffer: 1,
        byteOffset: rawLength,
        byteLength: data.byteLength,
        target: indices ? 34963 : 34962,
        extensions: { [extension]: info },
      }) - 1;
    rawLength += align(raw.byteLength);
    const entry: Dict = {
      bufferView: view,
      componentType: indices ? 5123 : 5126,
      count,
      type: ["", "SCALAR", "VEC2", "VEC3"][components],
    };
    if (position) {
      const min = [Infinity, Infinity, Infinity],
        max = [-Infinity, -Infinity, -Infinity];
      for (let i = 0; i < data.length; i++) {
        const k = i % 3;
        min[k] = Math.min(min[k]!, data[i]!);
        max[k] = Math.max(max[k]!, data[i]!);
      }
      entry.min = min;
      entry.max = max;
    }
    return accessors.push(entry) - 1;
  }
  const names: Surface["material"][] = ["outside", "inside", "rim", "lid"];
  const srgb = new Color(hex).toArray();
  const material = (name: string, color: number[], rough: number) => ({
    name,
    pbrMetallicRoughness: {
      baseColorFactor: [...color, 1],
      metallicFactor: 0,
      roughnessFactor: rough,
      metallicRoughnessTexture: {
        index: 0,
        extensions: { KHR_texture_transform: { scale: [12, 12] } },
      },
    },
    extensions: {
      KHR_materials_clearcoat: {
        clearcoatFactor: pet ? 0.24 : 0.12,
        clearcoatRoughnessFactor: 0.4,
      },
    },
  });
  const materials: Dict[] = [
    material("PaperExterior", srgb, 0.65),
    material("PaperLining", srgb, 0.52),
    material("RolledEdge", srgb, 0.54),
    {
      name: "ClearPET",
      alphaMode: "BLEND",
      pbrMetallicRoughness: {
        baseColorFactor: [0.94, 0.975, 1, 0.23],
        metallicFactor: 0.05,
        roughnessFactor: 0.15,
      },
      extensions: {
        KHR_materials_clearcoat: {
          clearcoatFactor: 0.88,
          clearcoatRoughnessFactor: 0.14,
        },
      },
    },
  ];
  const meshes = parts.map((part) => ({
    name: part.name,
    primitives: part.surfaces.map((s) => ({
      attributes: {
        POSITION: accessor(s.positions, 3, true),
        NORMAL: accessor(s.normals, 3),
        TEXCOORD_0: accessor(s.uvs, 2),
      },
      indices: accessor(s.indices, 1),
      material: names.indexOf(s.material),
      mode: 4,
      extras: {
        surface: s.name,
        uvLayout: ["Floor", "Underside", "Top", "Ceiling"].includes(s.name)
          ? "planar"
          : "unfolding-reference",
      },
    })),
  }));
  const grain = await paperGrain();
  const imageView =
    views.push({
      buffer: 0,
      byteOffset: append(grain),
      byteLength: grain.byteLength,
    }) - 1;
  const json = {
    asset: { version: "2.0", generator: "Junbeili product models" },
    scene: 0,
    scenes: [{ nodes: parts.map((_, i) => i) }],
    nodes: parts.map((p, i) => ({
      name: p.name,
      mesh: i,
      ...(p.elevation && { translation: [0, p.elevation, 0] }),
    })),
    meshes,
    materials,
    accessors,
    bufferViews: views,
    buffers: [
      { byteLength: packedLength },
      {
        byteLength: rawLength,
        extensions: { [extension]: { fallback: true } },
      },
    ],
    images: [{ bufferView: imageView, mimeType: "image/png" }],
    textures: [{ source: 0 }],
    extensionsUsed: [
      extension,
      "KHR_materials_clearcoat",
      "KHR_texture_transform",
    ],
    extensionsRequired: [extension],
  };
  const description = Buffer.from(JSON.stringify(json)),
    jsonLength = align(description.length);
  const header = Buffer.alloc(20);
  header.write("glTF");
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(28 + jsonLength + packedLength, 8);
  header.writeUInt32LE(jsonLength, 12);
  header.write("JSON", 16);
  const binaryHeader = Buffer.alloc(8);
  binaryHeader.writeUInt32LE(packedLength);
  binaryHeader.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([
    header,
    description,
    Buffer.alloc(jsonLength - description.length, 32),
    binaryHeader,
    ...chunks,
  ]);
}
