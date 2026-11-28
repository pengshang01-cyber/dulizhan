export const CUP = "pet-coated-round-rolled-rim-baking-cups";
export const SIZE = "5039";
export const modes = [
  "wall",
  "base",
  "wrap",
  "vertical",
  "diagonal",
  "free",
] as const;
export type Layout = (typeof modes)[number];
export type Side = "outside" | "inside";
export interface Sheet {
  base: number;
  mouth: number;
  wall: number;
  radius: number;
  sectors: number[];
  bleed: number;
  safe: number;
  side: Side;
  sidePending: boolean;
  marginsPending: boolean;
}
export interface Artwork {
  name: string;
  sha256: string;
}
export interface Design {
  version: 1;
  product: typeof CUP;
  variant: typeof SIZE;
  printSide: Side;
  layout: Layout;
  widthMm: number;
  rotationDeg: number;
  spacingMm: number;
  offsetXmm: number;
  offsetYmm: number;
  count: number | null;
  diagonalDeg: number;
  background: string;
  colorMode: "original" | "mono";
  ink: string;
  compensate: boolean;
  removeWhite: boolean;
  logo: Artwork | null;
  production: Artwork | null;
}
export function newDesign(side: Side, background: string): Design {
  return {
    version: 1,
    product: CUP,
    variant: SIZE,
    printSide: side,
    layout: "wall",
    widthMm: 18,
    rotationDeg: 0,
    spacingMm: 4,
    offsetXmm: 0,
    offsetYmm: 0,
    count: null,
    diagonalDeg: 30,
    background,
    colorMode: "original",
    ink: "#54392c",
    compensate: false,
    removeWhite: false,
    logo: null,
    production: null,
  };
}
const bounded = (v: unknown, lo: number, hi: number): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi;
const isHex = (v: unknown) =>
  typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
function artwork(v: unknown) {
  if (v === null) return true;
  if (!v || typeof v !== "object") return false;
  const a = v as Artwork;
  return (
    Object.keys(a).length === 2 &&
    validFileName(a.name) &&
    typeof a.sha256 === "string" &&
    /^[0-9a-f]{64}$/.test(a.sha256)
  );
}
export function validFileName(value: unknown): value is string {
  return (
    typeof value === "string" &&
    !!value.trim() &&
    value.length <= 160 &&
    !/[\\/]/.test(value) &&
    Array.from(value).every(
      (c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) !== 127,
    )
  );
}
export function parseDesign(input: unknown): Design {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw Error("design");
  const p = input as Design;
  if (
    p.version !== 1 ||
    p.product !== CUP ||
    p.variant !== SIZE ||
    !["outside", "inside"].includes(p.printSide) ||
    !modes.includes(p.layout) ||
    !bounded(p.widthMm, 2, 143) ||
    !bounded(p.rotationDeg, -180, 180) ||
    !bounded(p.spacingMm, 0, 100) ||
    !bounded(p.offsetXmm, -143, 143) ||
    !bounded(p.offsetYmm, -143, 143) ||
    !bounded(p.diagonalDeg, 15, 60) ||
    !(
      p.count === null ||
      (bounded(p.count, 1, 240) && Number.isInteger(p.count))
    ) ||
    !isHex(p.background) ||
    !isHex(p.ink) ||
    !["original", "mono"].includes(p.colorMode) ||
    typeof p.compensate !== "boolean" ||
    typeof p.removeWhite !== "boolean" ||
    !artwork(p.logo) ||
    !artwork(p.production)
  )
    throw Error("design");
  const result = newDesign(p.printSide, p.background);
  if (Object.keys(input).some((k) => !Object.hasOwn(result, k)))
    throw Error("design");
  for (const key of Object.keys(result) as (keyof Design)[])
    Object.assign(result, { [key]: p[key] });
  return result;
}
export const tau = 2 * Math.PI;
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
export function formedRadius(s: Sheet, r: number) {
  if (r <= s.base) return r;
  return (
    s.base + (s.mouth - s.base) * clamp((r - s.base) / (s.wall - s.base), 0, 1)
  );
}
export function ratio(s: Sheet, r: number) {
  return r > 0 ? formedRadius(s, r) / r : 1;
}
export function hiddenPerPleat(s: Sheet, r: number) {
  return (tau * (r - formedRadius(s, r))) / s.sectors.length;
}
export function hiddenBand(s: Sheet, r: number, i: number): [number, number] {
  const a = s.sectors[i]!,
    b = s.sectors[i + 1] ?? 1,
    k = ratio(s, r),
    excess = (1 - k) / s.sectors.length;
  const start = k * a + i * excess + 0.72 * k * (b - a);
  return [start, start + excess];
}
export function isHidden(s: Sheet, r: number, turn: number) {
  if (r <= s.base) return false;
  const angle = ((turn % 1) + 1) % 1;
  let lo = 0,
    hi = s.sectors.length;
  while (lo < hi) {
    const i = (lo + hi) >> 1,
      [a, b] = hiddenBand(s, r, i);
    if (angle < a) hi = i;
    else if (angle > b) lo = i + 1;
    else return true;
  }
  return false;
}
export interface Placement {
  x: number;
  y: number;
  angle: number;
}
export function placements(s: Sheet, p: Design, aspect: number): Placement[] {
  const h = p.widthMm / aspect,
    pitch = p.widthMm + p.spacingMm,
    line = Math.max(2, h + p.spacingMm);
  const middle = (s.base + s.wall) / 2,
    result: Placement[] = [];
  const add = (x: number, y: number, a = 0) =>
    result.push({
      x: x + p.offsetXmm,
      y: y + p.offsetYmm,
      angle: a + (p.rotationDeg * Math.PI) / 180,
    });
  if (p.layout === "wrap") {
    const n = p.count ?? Math.max(1, Math.floor((tau * middle) / pitch));
    for (let i = 0; i < n; i++) {
      const a = (tau * i) / n;
      add(middle * Math.sin(a), -middle * Math.cos(a), a);
    }
  } else if (p.layout === "vertical") {
    const n =
      p.count ??
      Math.max(1, Math.floor((s.wall - s.base + p.spacingMm) / line));
    for (let i = 0; i < n; i++) add(0, -middle + (i - (n - 1) / 2) * line);
  } else if (p.layout === "diagonal") {
    const angle = (p.diagonalDeg * Math.PI) / 180,
      cs = Math.cos(angle),
      sn = Math.sin(angle);
    const reach =
      s.radius +
      Math.hypot(p.widthMm, Math.min(h, 2 * s.radius)) / 2 +
      Math.hypot(p.offsetXmm, p.offsetYmm);
    for (let j = -Math.ceil(reach / line); j <= Math.ceil(reach / line); j++)
      for (
        let i = -Math.ceil(reach / pitch) - 1;
        i <= Math.ceil(reach / pitch) + 1;
        i++
      ) {
        const x = (i + (Math.abs(j) % 2) / 2) * pitch,
          y = j * line;
        if (Math.hypot(x, y) <= reach)
          add(x * cs - y * sn, x * sn + y * cs, angle);
      }
    if (p.count !== null)
      return result
        .sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y))
        .slice(0, p.count);
  } else add(0, p.layout === "wall" ? -middle : 0);
  return result;
}
export function inkCoverage(
  s: Sheet,
  points: Iterable<{ x: number; y: number; weight: number }>,
) {
  let total = 0,
    hidden = 0,
    rim = 0,
    unsafe = 0;
  for (const { x, y, weight } of points) {
    const r = Math.hypot(x, y);
    total += weight;
    if (r > s.radius - s.safe) unsafe += weight;
    if (r > s.wall && r <= s.radius) rim += weight;
    if (r <= s.radius && isHidden(s, r, Math.atan2(x, -y) / tau))
      hidden += weight;
  }
  return {
    hidden: total ? hidden / total : 0,
    rim: rim > 0,
    unsafe: unsafe > 0,
  };
}
export function designAlerts(
  coverage: ReturnType<typeof inkCoverage>,
  width: number,
  dpi: number | null,
) {
  return [
    coverage.rim && "rim",
    coverage.hidden > 0.2 && "fold",
    coverage.unsafe && "safe",
    width < 10 && "small",
    dpi !== null && dpi < 300 && "dpi",
  ].filter((a): a is string => typeof a === "string");
}
