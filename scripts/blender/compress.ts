import { MeshoptEncoder } from "meshoptimizer/encoder";

interface View {
  buffer: number;
  byteOffset?: number;
  byteLength: number;
  target?: number;
  byteStride?: number;
  extensions?: Record<string, unknown>;
}
interface Accessor {
  bufferView: number;
  byteOffset?: number;
  type: string;
  count: number;
  componentType: number;
}
interface Doc {
  accessors: Accessor[];
  bufferViews: View[];
  buffers: { byteLength: number; extensions?: Record<string, unknown> }[];
  meshes: {
    primitives: { attributes: Record<string, number>; indices: number }[];
  }[];
  extensionsUsed?: string[];
  extensionsRequired?: string[];
}
const name = "EXT_meshopt_compression";
const padded = (n: number) => Math.ceil(n / 4) * 4;
/** Preserve Blender's hierarchy, materials, UVs and baked PNG. The paper layers need higher position precision than the stock exporter's 12-bit shared exponent. */
export async function compressModel(raw: Buffer) {
  await MeshoptEncoder.ready;
  const len = raw.readUInt32LE(12),
    doc: Doc = JSON.parse(raw.toString("utf8", 20, 20 + len)),
    bin = raw.subarray(28 + len);
  const semantic = new Map<number, string>();
  for (const mesh of doc.meshes)
    for (const primitive of mesh.primitives) {
      for (const [key, i] of Object.entries(primitive.attributes))
        semantic.set(i, key);
      semantic.set(primitive.indices, "indices");
    }
  const perView = new Map<number, { accessor: Accessor; kind: string }>();
  for (const [i, kind] of semantic) {
    const accessor = doc.accessors[i];
    if (perView.has(accessor.bufferView))
      throw Error("Unexpected interleaved Blender buffer");
    perView.set(accessor.bufferView, { accessor, kind });
  }
  const chunks: Buffer[] = [];
  let encodedSize = 0,
    decodedSize = 0;
  const append = (data: Uint8Array) => {
    const offset = encodedSize;
    const block = Buffer.alloc(padded(data.length));
    block.set(data);
    chunks.push(block);
    encodedSize += block.length;
    return offset;
  };
  for (const [i, v] of doc.bufferViews.entries()) {
    const data = bin.subarray(
      v.byteOffset ?? 0,
      (v.byteOffset ?? 0) + v.byteLength,
    );
    const attr = perView.get(i);
    if (!attr) {
      v.byteOffset = append(data);
      continue;
    }
    const { accessor: a, kind } = attr,
      stride = v.byteLength / a.count;
    if ((a.byteOffset ?? 0) !== 0 || (v.byteStride && v.byteStride !== stride))
      throw Error("Unexpected Blender accessor offset");
    const mode = kind === "indices" ? "TRIANGLES" : "ATTRIBUTES";
    let input: Uint8Array = data;
    const filter = mode === "ATTRIBUTES" ? "EXPONENTIAL" : undefined;
    if (filter) {
      if (a.componentType !== 5126)
        throw Error("Expected Blender float attributes");
      const floats = new Float32Array(
        data.buffer,
        data.byteOffset,
        data.byteLength / 4,
      );
      const precision =
        kind === "POSITION" ? 21 : kind.startsWith("TEXCOORD") ? 19 : 12;
      input = MeshoptEncoder.encodeFilterExp(
        floats,
        a.count,
        stride,
        precision,
        kind === "POSITION" ? "Separate" : "SharedVector",
      );
    }
    const packed = MeshoptEncoder.encodeGltfBuffer(
      input,
      a.count,
      stride,
      mode,
    );
    const offset = append(packed);
    v.buffer = 1;
    v.byteOffset = decodedSize;
    decodedSize += padded(v.byteLength);
    v.extensions = {
      [name]: {
        buffer: 0,
        byteOffset: offset,
        byteLength: packed.length,
        byteStride: stride,
        count: a.count,
        mode,
        ...(filter ? { filter } : {}),
      },
    };
  }
  doc.extensionsUsed = [...new Set([...(doc.extensionsUsed ?? []), name])];
  doc.extensionsRequired = [
    ...new Set([...(doc.extensionsRequired ?? []), name]),
  ];
  doc.buffers = [
    { byteLength: encodedSize },
    { byteLength: decodedSize, extensions: { [name]: { fallback: true } } },
  ];
  const json = Buffer.from(JSON.stringify(doc)),
    jsonSize = padded(json.length);
  const output = Buffer.alloc(28 + jsonSize + encodedSize),
    binStart = 20 + jsonSize;
  output.write("glTF");
  output.writeUInt32LE(2, 4);
  output.writeUInt32LE(output.length, 8);
  output.writeUInt32LE(jsonSize, 12);
  output.write("JSON", 16);
  output.fill(32, 20, binStart);
  json.copy(output, 20);
  output.writeUInt32LE(encodedSize, binStart);
  output.write("BIN\0", binStart + 4);
  Buffer.concat(chunks).copy(output, binStart + 8);
  return output;
}
