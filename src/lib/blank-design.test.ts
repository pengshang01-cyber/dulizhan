import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  Vector3,
} from "three";
import {
  CUP,
  newDesign,
  ratio,
  hiddenPerPleat,
  isHidden,
  placements,
  inkCoverage,
  designAlerts,
  parseDesign,
  tau,
} from "./blank-design";
import { parseProductTechnicalSpec } from "./product-technical-schema";
import { sheetProfile } from "./blank-profile";
import { readModel } from "../../scripts/models/inspect";
const s = sheetProfile(
  parseProductTechnicalSpec(
    JSON.parse(readFileSync("data/product-specs/" + CUP + ".json", "utf8")),
  ),
);
const d = newDesign("outside", "#f0ece2");
describe("5039 原片成型", () => {
  it("4 个高度各从 144 个方向看，叠褶外侧露出印刷面", async () => {
    const { surfaces } = await readModel("public/models/" + CUP + "/5039.glb");
    const skins = ["Exterior", "Interior"].map((name) => {
      const s = surfaces.get("Body." + name)!,
        geometry = new BufferGeometry();
      geometry.setAttribute("position", new BufferAttribute(s.positions, 3));
      geometry.setIndex(new BufferAttribute(s.indices, 1));
      const mesh = new Mesh(geometry, new MeshBasicMaterial());
      mesh.name = name;
      return mesh;
    });
    const ray = new Raycaster();
    for (const height of [0.011, 0.023, 0.032, 0.035]) {
      const nearest = new Set<string | undefined>();
      for (let i = 0; i < 144; i++) {
        const a = ((i + 0.39) * tau) / 144,
          x = Math.cos(a),
          z = Math.sin(a);
        ray.set(
          new Vector3(0.11 * x, height, 0.11 * z),
          new Vector3(-x, 0, -z),
        );
        nearest.add(ray.intersectObjects(skins)[0]?.object.name);
      }
      expect([...nearest]).toEqual(["Exterior"]);
    }
  });
  it("杯底等距，斜高结束后余纸接近卷管周长", () => {
    expect(s.base).toBe(25);
    expect(s.wall - s.base).toBeCloseTo(Math.hypot(39, 9.5), 4);
    expect(Math.abs(s.radius - s.wall - Math.PI * 2)).toBeLessThan(0.1);
    for (const r of [0, 12, 25]) expect(ratio(s, r)).toBe(1);
  });
  it.each([0.25, 0.5, 0.75, 1])("高度比例 %s 的展开与24个真实折返", (f) => {
    const r = 25 + (s.wall - 25) * f,
      R = 25 + 9.5 * f;
    expect(ratio(s, r)).toBeCloseTo(R / r, 7);
    expect(24 * hiddenPerPleat(s, r) + tau * R).toBeCloseTo(tau * r, 7);
    let hidden = 0;
    for (let n = 0; n < 24000; n++) if (isHidden(s, r, n / 24000)) hidden++;
    expect(hidden / 24000).toBeCloseTo(1 - R / r, 3);
  });
  it("发布的 Blender UV 以同一圆心和毫米比例覆盖底、壁和卷纸正反面", async () => {
    const { surfaces } = await readModel("public/models/" + CUP + "/5039.glb");
    const radius = (name: string) => {
      const uv = surfaces.get("Body." + name)!.print,
        r: number[] = [];
      for (let j = 0; j < uv.length; j += 2)
        r.push(143 * Math.hypot(uv[j]! - 0.5, uv[j + 1]! - 0.5));
      return [Math.min(...r), Math.max(...r)];
    };
    expect(radius("Underside")[0]).toBeLessThan(0.01);
    expect(radius("Underside")[1]).toBeCloseTo(25, 0);
    expect(radius("Exterior")[0]).toBeCloseTo(25, 3);
    expect(radius("Exterior")[1]).toBeCloseTo(s.wall, 3);
    expect(radius("Rim")[0]).toBeCloseTo(s.wall, 3);
    expect(radius("Rim")[1]).toBeCloseTo(71.5, 3);
  });
});
describe("排版、提醒及参数", () => {
  it("杯底、正面、环绕、竖排、倾斜和自由坐标均采用毫米", () => {
    expect(placements(s, { ...d, layout: "base" }, 2)[0]?.y).toBe(0);
    expect(placements(s, d, 2)[0]!.y).toBeCloseTo(-(s.base + s.wall) / 2);
    const wrap = placements(s, { ...d, layout: "wrap", count: 4 }, 2);
    expect(wrap).toHaveLength(4);
    expect(wrap[1]!.x).toBeCloseTo(-wrap[0]!.y);
    expect(placements(s, { ...d, layout: "wrap" }, 2).length).toBe(
      Math.floor((tau * (s.base + s.wall)) / 2 / (d.widthMm + d.spacingMm)),
    );
    const rows = placements(s, { ...d, layout: "vertical", count: 3 }, 2);
    expect(rows).toHaveLength(3);
    expect(rows[1]!.y - rows[0]!.y).toBe(13);
    expect(
      placements(s, { ...d, layout: "diagonal" }, 2).every(
        (m) => Math.abs(m.angle - Math.PI / 6) < 1e-7,
      ),
    ).toBe(true);
    expect(
      placements(s, { ...d, layout: "free", offsetXmm: 3, offsetYmm: 7 }, 2)[0],
    ).toEqual({ x: 3, y: 7, angle: 0 });
  });
  it("按墨迹面积与临界值提醒", () => {
    expect(
      inkCoverage(s, [
        { x: 0, y: 0, weight: 1 },
        { x: 0, y: 71, weight: 1 },
      ]),
    ).toMatchObject({ unsafe: true, rim: true });
    expect(
      designAlerts({ rim: true, unsafe: true, hidden: 0.21 }, 9, 299),
    ).toEqual(["rim", "fold", "safe", "small", "dpi"]);
    expect(
      designAlerts({ rim: false, unsafe: false, hidden: 0.2 }, 10, 300),
    ).toEqual([]);
  });
  it("导入导出保留设置并拒绝其他型号及越界数值", () => {
    expect(
      parseDesign(
        JSON.parse(
          JSON.stringify({ ...d, layout: "diagonal", compensate: true }),
        ),
      ),
    ).toEqual({ ...d, layout: "diagonal", compensate: true });
    for (const p of [
      { variant: "3830" },
      { widthMm: 0 },
      { diagonalDeg: 62 },
      { count: 1.5 },
      { unexpected: true },
      { logo: { sha256: "none", name: "a.svg" } },
    ])
      expect(() => parseDesign({ ...d, ...p })).toThrow();
  });
});
