/** Inspect the bytes delivered to the viewer, including the meshopt post-filters. */
import { readFileSync } from "node:fs";
import { MeshoptDecoder } from "meshoptimizer/decoder";

interface Compression {
  byteOffset?: number;
  byteLength: number;
  byteStride: number;
  count: number;
  mode: string;
  filter?: string;
}
interface Primitive {
  indices: number;
  attributes: Record<string, number>;
  material: number;
}
interface Document {
  extensionsRequired: string[];
  bufferViews: {
    byteOffset?: number;
    byteLength: number;
    extensions?: { EXT_meshopt_compression: Compression };
  }[];
  accessors: {
    bufferView: number;
    byteOffset?: number;
    componentType: number;
    count: number;
    type: string;
  }[];
  nodes: {
    name: string;
    mesh?: number;
    children?: number[];
    translation?: number[];
    extras?: { surface: string; uvLayout: string };
  }[];
  meshes: { name: string; primitives: Primitive[] }[];
  images: { bufferView: number; mimeType: string }[];
  materials: {
    name: string;
    normalTexture?: { texCoord: number };
    pbrMetallicRoughness: { baseColorFactor?: number[] };
  }[];
}
type IndexArray = Uint16Array | Uint32Array;
export interface Surface {
  name: string;
  material: number;
  positions: Float32Array;
  normals: Float32Array;
  print: Float32Array;
  detail: Float32Array;
  tangents: Float32Array;
  indices: IndexArray;
}
export async function readModel(path: string) {
  await MeshoptDecoder.ready;
  const glb = readFileSync(path);
  if (
    glb.toString("ascii", 0, 4) !== "glTF" ||
    glb.readUInt32LE(8) !== glb.length
  )
    throw Error("Invalid GLB: " + path);
  const len = glb.readUInt32LE(12),
    gltf: Document = JSON.parse(glb.toString("utf8", 20, 20 + len)),
    bin = glb.subarray(28 + len);
  function buffer(index: number) {
    const a = gltf.accessors[index];
    const view = gltf.bufferViews[a.bufferView],
      x = view.extensions?.EXT_meshopt_compression;
    if (!x) throw Error("Missing compressed accessor");
    const bytes = new Uint8Array(x.count * x.byteStride),
      start = x.byteOffset ?? 0;
    MeshoptDecoder.decodeGltfBuffer(
      bytes,
      x.count,
      x.byteStride,
      bin.subarray(start, start + x.byteLength),
      x.mode,
      x.filter,
    );
    return bytes.buffer;
  }
  const surfaces = new Map<string, Surface>();
  for (const mesh of gltf.meshes) {
    const prim = mesh.primitives[0];
    const floats = (name: string) =>
      new Float32Array(buffer(prim.attributes[name]));
    const ind = buffer(prim.indices);
    surfaces.set(mesh.name, {
      name: mesh.name,
      material: prim.material,
      positions: floats("POSITION"),
      normals: floats("NORMAL"),
      print: floats("TEXCOORD_0"),
      detail: floats("TEXCOORD_1"),
      tangents: floats("TANGENT"),
      indices:
        gltf.accessors[prim.indices].componentType === 5125
          ? new Uint32Array(ind)
          : new Uint16Array(ind),
    });
  }
  const images = gltf.images.map((image) => {
    const v = gltf.bufferViews[image.bufferView],
      start = v.byteOffset ?? 0;
    return bin.subarray(start, start + v.byteLength);
  });
  return { gltf, surfaces, images, bytes: glb.length };
}

export function bounds(p: Float32Array, atHeight?: number) {
  const lo = [Infinity, Infinity, Infinity],
    hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < p.length; i += 3) {
    if (atHeight !== undefined && Math.abs(p[i + 1] - atHeight) > 0.000001)
      continue;
    for (let j = 0; j < 3; j++) {
      lo[j] = Math.min(lo[j], p[i + j]);
      hi[j] = Math.max(hi[j], p[i + j]);
    }
  }
  return {
    width: (hi[0] - lo[0]) * 1000,
    depth: (hi[2] - lo[2]) * 1000,
    top: hi[1] * 1000,
  };
}
const pointKey = (p: Float32Array, i: number) =>
  [p[i], p[i + 1], p[i + 2]].map((x) => Math.round(x * 1e7)).join("/");
/** Count physical edge uses after welding the render-only seams for normals and UVs. */
export function edgeUses(surfaces: Surface[]) {
  const counts = new Map<string, number>();
  for (const { positions, indices } of surfaces) {
    const keys: string[] = [];
    for (let p = 0; p < positions.length; p += 3)
      keys.push(pointKey(positions, p));
    for (let t = 0; t < indices.length; t += 3) {
      const [a, b, c] = [
        keys[indices[t]],
        keys[indices[t + 1]],
        keys[indices[t + 2]],
      ];
      if (a === b || b === c || a === c) continue;
      for (const [l, r] of [
        [a, b],
        [b, c],
        [c, a],
      ]) {
        const key = l < r ? l + "|" + r : r + "|" + l;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
  }
  return counts;
}
/** At a constant wall height follow the actual triangle edges, including backward Z-fold travel. */
export function foldedSection(surface: Surface, height: number) {
  const { positions: p, indices } = surface;
  const levels = new Set<number>();
  for (let i = 1; i < p.length; i += 3) levels.add(p[i]);
  const y = [...levels].sort(
    (a, b) => Math.abs(a - height) - Math.abs(b - height),
  )[0];
  const graph = new Map<string, Set<string>>(),
    angles = new Map<string, number>();
  for (let i = 0; i < indices.length; i += 3)
    for (let j = 0; j < 3; j++) {
      const a = indices[i + j] * 3,
        b = indices[i + ((j + 1) % 3)] * 3;
      if (p[a + 1] !== y || p[b + 1] !== y) continue;
      const ak = pointKey(p, a),
        bk = pointKey(p, b);
      if (ak === bk) continue;
      if (!graph.has(ak)) graph.set(ak, new Set());
      if (!graph.has(bk)) graph.set(bk, new Set());
      graph.get(ak)!.add(bk);
      graph.get(bk)!.add(ak);
      angles.set(ak, Math.atan2(p[a + 2], p[a]));
      angles.set(bk, Math.atan2(p[b + 2], p[b]));
    }
  const first = graph.keys().next().value;
  if (!first || [...graph.values()].some((n) => n.size !== 2))
    throw Error("Incomplete wall section");
  const increments: number[] = [],
    phases: number[] = [];
  let current = first,
    last = "";
  do {
    const next = [...graph.get(current)!].find((k) => k !== last)!;
    const delta = angles.get(next)! - angles.get(current)!;
    increments.push(Math.atan2(Math.sin(delta), Math.cos(delta)));
    phases.push(angles.get(current)!);
    last = current;
    current = next;
  } while (current !== first && increments.length <= graph.size);
  const direction = Math.sign(increments.reduce((a, b) => a + b, 0));
  const crests = phases
    .filter(
      (_, i) =>
        increments[i] * direction < 0 &&
        increments[(i + phases.length - 1) % phases.length] * direction >= 0,
    )
    .sort((a, b) => a - b);
  const pitches = crests.map(
    (p, i) =>
      (((crests[(i + 1) % crests.length] - p + 2 * Math.PI) % (2 * Math.PI)) *
        180) /
      Math.PI,
  );
  return {
    heightMm: y * 1000,
    folds: crests.length,
    minPitch: Math.min(...pitches),
    maxPitch: Math.max(...pitches),
  };
}
/** Intersect a radial half-plane with the exported roll; measure its tube separately from lip waviness. */
export function rimSection(s: Surface, angle: number) {
  const ca = Math.cos(angle),
    sa = Math.sin(angle),
    p = s.positions,
    idx = s.indices;
  let minR = Infinity,
    maxR = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  const segments: number[][] = [];
  for (let t = 0; t < idx.length; t += 3) {
    const cuts: number[] = [];
    for (let j = 0; j < 3; j++) {
      const a = idx[t + j] * 3,
        b = idx[t + ((j + 1) % 3)] * 3;
      const da = p[a] * sa - p[a + 2] * ca,
        db = p[b] * sa - p[b + 2] * ca;
      if (da > 0 === db > 0) continue;
      const f = da / (da - db);
      const x = p[a] + f * (p[b] - p[a]),
        z = p[a + 2] + f * (p[b + 2] - p[a + 2]);
      const r = x * ca + z * sa,
        y = p[a + 1] + f * (p[b + 1] - p[a + 1]);
      if (r <= 0) continue;
      minR = Math.min(minR, r);
      maxR = Math.max(maxR, r);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      cuts.push(r, y);
    }
    if (cuts.length === 4) segments.push(cuts);
  }
  const level = (minY + maxY) / 2,
    crossings = new Set<number>();
  for (const [r, y, r2, y2] of segments)
    if (y > level !== y2 > level)
      crossings.add(
        Math.round((r + ((r2 - r) * (level - y)) / (y2 - y)) * 1e7),
      );
  return {
    width: (maxR - minR) * 1000,
    thickness: (maxY - minY) * 1000,
    top: maxY * 1000,
    layers: crossings.size,
  };
}
