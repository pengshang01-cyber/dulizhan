import { BufferAttribute, BufferGeometry } from "three";
import {
  verifiedValue,
  type ProductTechnicalSpec,
  type TechnicalPart,
} from "../../src/lib/product-technical-schema.ts";

type Appearance = NonNullable<ProductTechnicalSpec["modelAppearance"]>;
type Point = [number, number];
type Dimensions = {
  base: Point;
  top: Point;
  height: number;
  radii: Point;
  round: boolean;
};
type Ring = {
  y: number;
  width: number;
  depth: number;
  radius: number;
  crease: number;
};
export interface Surface {
  name: string;
  material: "outside" | "inside" | "rim" | "lid";
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  indices: Uint16Array;
}
export interface ModelPart {
  name: "Body" | "Lid";
  elevation: number;
  surfaces: Surface[];
}

function dimensions(
  part: TechnicalPart,
  appearance: Appearance,
): Dimensions | undefined {
  const g = part.geometry;
  const bd = verifiedValue(g.baseDiameterMm),
    td = verifiedValue(g.topDiameterMm);
  const bw = bd ?? verifiedValue(g.baseLengthMm),
    bz = bd ?? verifiedValue(g.baseWidthMm);
  const tw = td ?? verifiedValue(g.topLengthMm),
    tz = td ?? verifiedValue(g.topWidthMm);
  const height = verifiedValue(g.heightMm);
  if (!bw || !bz || !tw || !tz || !height) return;
  return {
    base: [bw, bz],
    top: [tw, tz],
    height,
    round: bd !== undefined,
    radii: [
      verifiedValue(g.baseCornerRadiusMm) ??
        Math.min(bw, bz) * (appearance.baseCornerFraction ?? 0),
      verifiedValue(g.topCornerRadiusMm) ??
        Math.min(tw, tz) * (appearance.topCornerFraction ?? 0),
    ],
  };
}
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
function ring(
  d: Dimensions,
  fraction: number,
  y: number,
  inset = 0,
  crease = 0,
): Ring {
  return {
    width: mix(d.base[0], d.top[0], fraction) - 2 * inset,
    depth: mix(d.base[1], d.top[1], fraction) - 2 * inset,
    radius: Math.max(0.01, mix(d.radii[0], d.radii[1], fraction) - inset),
    y,
    crease,
  };
}
// 从前侧左角中点沿口缘一圈。圆角弧和直边使用同一套参数生成内壁及卷边。
function perimeter(
  r: Ring,
  d: Dimensions,
  face: number,
  t: number,
  pleats: number,
): Point {
  if (d.round) {
    const angle = t * 2 * Math.PI;
    const groove = pleats
      ? r.crease * Math.pow((1 + Math.cos(pleats * angle)) * 0.5, 5)
      : 0;
    return [
      (r.width * 0.5 - groove) * Math.cos(angle),
      -(r.depth * 0.5 - groove) * Math.sin(angle),
    ];
  }
  const halfW = (face % 2 === 0 ? r.width : r.depth) * 0.5,
    halfD = (face % 2 === 0 ? r.depth : r.width) * 0.5;
  const radius = Math.min(r.radius, halfW, halfD);
  let x: number, z: number;
  if (t < 0.25 || t > 0.75) {
    const left = t < 0.25;
    const angle = left ? Math.PI * (0.75 - t) : Math.PI * (1.25 - t);
    x = (left ? -1 : 1) * (halfW - radius) + radius * Math.cos(angle);
    z = halfD - radius + radius * Math.sin(angle);
  } else {
    x = (t - 0.5) * 4 * (halfW - radius);
    z = halfD;
  }
  // 方杯原照的折线集中在角部；没有经实测的整圈褶数。
  if (r.crease)
    z -=
      r.crease *
      (Math.exp(-(((t - 0.2) / 0.033) ** 2)) +
        Math.exp(-(((t - 0.8) / 0.033) ** 2)));
  return (
    [
      [x, z],
      [z, -x],
      [-x, -z],
      [-z, x],
    ] as Point[]
  )[face]!;
}
function finish(
  name: string,
  material: Surface["material"],
  p: number[],
  uv: number[],
  ix: number[],
): Surface {
  const positions = Float32Array.from(p, (v) => v * 0.001);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setIndex(ix);
  geometry.computeVertexNormals();
  const normals = geometry.getAttribute("normal").array as Float32Array;
  // UV 接缝需要重复顶点，但两侧的几何法线应连续。
  const shared = new Map<string, number[]>();
  const keys: string[] = [];
  for (let i = 0; i < positions.length; i += 3) {
    const key = [p[i], p[i + 1], p[i + 2]]
      .map((v) => Math.round(v! * 10000))
      .join(",");
    keys.push(key);
    const n = shared.get(key) ?? [0, 0, 0];
    for (let j = 0; j < 3; j++) n[j] += normals[i + j]!;
    shared.set(key, n);
  }
  keys.forEach((key, i) => {
    const v = shared.get(key)!;
    const length = Math.hypot(...v) || 1;
    for (let j = 0; j < 3; j++) normals[i * 3 + j] = v[j]! / length;
  });
  return {
    name,
    material,
    positions,
    normals,
    uvs: Float32Array.from(uv),
    indices: Uint16Array.from(ix),
  };
}
// TEXCOORD_0 与 M18 展开 SVG 的 viewBox 一致，(0,0) 对应图纸左上角。
function wallUV(d: Dimensions, face: number, t: number, h: number): Point {
  const f = Math.min(1, Math.max(0, h / d.height));
  if (d.round) {
    const base = d.base[0] / 2,
      top = d.top[0] / 2,
      delta = top - base;
    if (Math.abs(delta) < 1e-6) return [t, 1 - f];
    const slant = Math.hypot(d.height, delta),
      r2 = (top * slant) / delta;
    const r = mix((base * slant) / delta, r2, f);
    const angle = -Math.PI / 2 + ((t - 0.5) * 2 * Math.PI * delta) / slant;
    return [
      (r2 + 10 + r * Math.cos(angle)) / (2 * r2 + 20),
      (r2 + 22 + r * Math.sin(angle)) / (r2 + 32),
    ];
  }
  const l = Math.max(d.base[0], d.top[0]),
    w = Math.max(d.base[1], d.top[1]);
  const slopes = [
    Math.hypot(d.height, (d.top[1] - d.base[1]) / 2),
    Math.hypot(d.height, (d.top[0] - d.base[0]) / 2),
  ];
  const axis = face % 2,
    slope = slopes[axis]!;
  const cx = axis ? 20 + l + w / 2 : 10 + l / 2,
    y = face < 2 ? 22 : 32 + slope;
  // 两侧的角部沿面板边线展开，直边的纹理长度和实际展开宽度成比例。
  const nominal = ring(d, f, h);
  const xy = perimeter(nominal, d, face, t, 0);
  const along = [xy[0], -xy[1], -xy[0], xy[1]][face]!;
  return [
    (cx + along) / (l + w + 30),
    (y + (1 - f) * slope) / (2 * Math.max(...slopes) + 43),
  ];
}
function strip(
  name: string,
  material: Surface["material"],
  rows: Ring[],
  d: Dimensions,
  pleats: number,
): Surface {
  const p: number[] = [],
    uv: number[] = [],
    ix: number[] = [];
  const faces = d.round ? 1 : 4,
    segments = d.round ? Math.max(128, pleats * 16) : 64;
  for (let face = 0; face < faces; face++) {
    const first = p.length / 3;
    rows.forEach((r, j) => {
      for (let i = 0; i <= segments; i++) {
        const t = i / segments,
          [x, z] = perimeter(r, d, face, t, pleats);
        p.push(x, r.y, z);
        uv.push(...wallUV(d, face, t, r.y));
        if (j < rows.length - 1 && i < segments) {
          const a = first + j * (segments + 1) + i,
            b = a + segments + 1;
          ix.push(a, a + 1, b, a + 1, b + 1, b);
        }
      }
    });
  }
  return finish(name, material, p, uv, ix);
}
function disk(
  name: string,
  material: Surface["material"],
  r: Ring,
  d: Dimensions,
  up: boolean,
  pleats: number,
): Surface {
  const p = [0, r.y, 0],
    uv = [0.5, 0.5],
    ix: number[] = [];
  const faces = d.round ? 1 : 4,
    steps = d.round ? Math.max(128, pleats * 16) : 64;
  for (let face = 0; face < faces; face++)
    for (let i = 0; i < steps; i++) {
      const [x, z] = perimeter(r, d, face, i / steps, pleats);
      p.push(x, r.y, z);
      uv.push(0.5 + x / r.width, 0.5 + z / r.depth);
      const a = p.length / 3 - 1,
        b = (a % (faces * steps)) + 1;
      if (up) ix.push(0, a, b);
      else ix.push(0, b, a);
    }
  return finish(name, material, p, uv, ix);
}
function bodyShell(
  part: TechnicalPart,
  d: Dimensions,
  shape: ProductTechnicalSpec["shape"],
): ModelPart {
  const count = verifiedValue(part.pleatCount) ?? 0;
  const w = verifiedValue(part.rimWidthMm) ?? Math.min(...d.top) * 0.011;
  const thickness = verifiedValue(part.rimThicknessMm) ?? w * 0.8;
  // 资料没有单层纸厚时采用比例化显示厚度，公开实测字段继续留空。
  const skin =
    verifiedValue(part.paperThicknessMm) ?? Math.min(...d.base) * 0.0045;
  const h = d.height,
    fold = d.round
      ? Math.min(...d.top) * 0.018
      : shape === "square-rolled-rim"
        ? 1.1
        : 0;
  const angles = [
    ...new Set([
      ...Array.from({ length: 34 }, (_, i) => -90 + (i * 325) / 33),
      0,
      90,
      180,
    ]),
  ].sort((a, b) => a - b);
  const lip = angles.map((degrees) => {
    const angle = (degrees * Math.PI) / 180;
    return ring(
      d,
      1,
      h - thickness / 2 + (thickness / 2) * Math.sin(angle),
      (w / 2) * (1 - Math.cos(angle)),
    );
  });
  const bottom = ring(d, 0, 0),
    underside = ring(d, 0, skin * 1.5, skin * 3);
  const exterior = [
    bottom,
    ...[0.035, 0.11, 0.4, 0.75, 0.94].map((f) =>
      ring(d, f, f * (h - thickness), w * 0.3 * f, fold * Math.min(1, f * 4)),
    ),
    lip[0]!,
  ];
  const floor = ring(d, 0, skin * 3.1, skin * 4);
  const interior = [
    lip.at(-1)!,
    ...[0.94, 0.75, 0.4, 0.11, 0.035].map((f) =>
      ring(
        d,
        f,
        f * (h - thickness) + skin * 0.6,
        skin + w * 0.3 * f,
        fold * Math.min(1, f * 4),
      ),
    ),
    floor,
  ];
  return {
    name: "Body",
    elevation: 0,
    surfaces: [
      disk("Underside", "outside", underside, d, false, count),
      strip("Foot", "outside", [underside, bottom], d, count),
      strip("Exterior", "outside", exterior, d, count),
      strip("Rim", "rim", lip, d, count),
      strip("Interior", "inside", interior, d, count),
      disk("Floor", "inside", floor, d, true, count),
    ],
  };
}
function cover(d: Dimensions, elevation: number): ModelPart {
  // 透明盖裙边和盖顶分别使用测得的外包尺寸，中间阶面参考图册中的侧面。
  const shell = Math.min(...d.top) * 0.003;
  const profile = [
    ring(d, 0, 0),
    ring(d, 0, d.height * 0.055),
    ring(d, 0.03, d.height * 0.095, shell * 2),
    ring(d, 0.16, d.height * 0.15, shell * 2),
    ring(d, 0.87, d.height * 0.88),
    ring(d, 1, d.height),
  ];
  const inside = [...profile].reverse().map((r) => ({
    ...r,
    y: Math.max(0, r.y - shell),
    width: r.width - 2 * shell,
    depth: r.depth - 2 * shell,
    radius: r.radius - shell,
  }));
  return {
    name: "Lid",
    elevation,
    surfaces: [
      strip("Skirt", "lid", profile, d, 0),
      disk("Top", "lid", profile.at(-1)!, d, true, 0),
      strip("InnerSkirt", "lid", inside, d, 0),
      disk("Ceiling", "lid", inside[0]!, d, false, 0),
      strip("SkirtEdge", "lid", [inside.at(-1)!, profile[0]!], d, 0),
    ],
  };
}
export function buildGeometry(
  spec: ProductTechnicalSpec,
  variant: ProductTechnicalSpec["variants"][number],
): ModelPart[] {
  const appearance = spec.modelAppearance!;
  const body = dimensions(variant.body, appearance);
  if (!body)
    throw new Error(
      "规格缺少盒身/杯身外部尺寸：" + spec.slug + "/" + variant.id,
    );
  const result = [bodyShell(variant.body, body, spec.shape)];
  const lid = variant.lid && dimensions(variant.lid, appearance);
  if (spec.shape === "box" && lid) result.push(cover(lid, body.height * 0.001));
  return result;
}
