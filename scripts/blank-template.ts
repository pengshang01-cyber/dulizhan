import { hiddenBand, tau, type Sheet } from "../src/lib/blank-design.ts";
export function templateSvg(s: Sheet, locale: "en" | "zh") {
  const zh = locale === "zh",
    cx = 105,
    cy = 107,
    n = s.sectors.length;
  const pt = (r: number, t: number) =>
    [cx + r * Math.sin(t * tau), cy - r * Math.cos(t * tau)]
      .map((v) => v.toFixed(3))
      .join(",");
  const radii = Array.from(
    { length: 30 },
    (_, j) => s.base + ((s.radius - s.base) * j) / 29,
  );
  const folds = s.sectors
    .map((_, i) => {
      const side = (k: 0 | 1) =>
        radii.map((r) => pt(r, hiddenBand(s, r, i)[k]));
      return (
        '<polygon points="' +
        [...side(0), ...side(1).reverse()].join(" ") +
        '"/>'
      );
    })
    .join("");
  const ring = (r: number, color: string, dash = "") =>
    '<circle cx="' +
    cx +
    '" cy="' +
    cy +
    '" r="' +
    r +
    '" fill="none" stroke="' +
    color +
    '" stroke-width=".32" stroke-dasharray="' +
    dash +
    '"/>';
  const line = (y: number, txt: string, size = 3.6) =>
    '<text x="19" y="' + y + '" font-size="' + size + '">' + txt + "</text>";
  const dim = (v: number) => v.toFixed(2);
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297"><title>' +
    (zh ? "5039 原料圆纸片设计模板" : "5039 circular blank artwork template") +
    '</title><rect width="210" height="297" fill="white"/><g font-family="Arial, Microsoft YaHei, sans-serif" fill="#36291f">' +
    line(
      15,
      zh ? "5039 圆纸片设计模板" : "5039 circular blank artwork template",
      6.4,
    ) +
    line(
      23,
      zh
        ? "印前预览 · 原尺寸打印 100% · 单位 mm"
        : "Artwork proof · Print at 100% / actual size · All dimensions in mm",
    ) +
    '<g fill="#ebd9c7">' +
    folds +
    "</g>" +
    ring(s.radius + s.bleed, "#8a3244", "1.8 1") +
    ring(s.radius, "#36291f") +
    ring(s.radius - s.safe, "#376951", "2 1") +
    ring(s.wall, "#ad7446", "1 1") +
    ring(s.base, "#6f6358", "1 1") +
    '<path d="M102 107h6m-3 -3v6" stroke="#30271f" stroke-width=".25"/>' +
    line(
      192,
      zh
        ? "实线：纸片直径 " + s.radius * 2 + " mm"
        : "Solid line: blank diameter " + s.radius * 2 + " mm",
    ) +
    line(
      200,
      (zh
        ? "杯底半径 / 杯壁外界 / 卷边外界："
        : "Base / wall end / curl end, radii: ") +
        [s.base, s.wall, s.radius].map(dim).join(" / ") +
        " mm",
    ) +
    line(
      208,
      (zh
        ? "红虚线：出血 ｜ 绿虚线：安全区 ｜ "
        : "Red dash: bleed / green dash: safety / ") +
        s.bleed +
        " / " +
        s.safe +
        " mm",
    ) +
    line(
      216,
      zh
        ? "印刷面、出血和安全区以工厂签样为准。"
        : "Confirm the print face, bleed and safety allowances on the factory proof.",
    ) +
    line(
      227,
      zh
        ? "阴影为 " + n + " 道叠褶的预计隐藏区。"
        : "Shading marks the estimated concealed paper in " + n + " pleats.",
    ) +
    line(
      235,
      zh
        ? "这些区域的图案成型后会被遮挡；杯壁图案在环向压缩。"
        : "Ink in these bands is concealed after forming; wall artwork compresses circumferentially.",
      3.4,
    ) +
    line(
      243,
      zh
        ? "最外圈卷入口沿。请将商标和重要文字放在安全区内。"
        : "The outer band rolls into the rim. Keep important marks inside the safe line.",
    ) +
    '<g stroke="#30271f" stroke-width=".4"><path d="M19 261h50m-50 -2v4m50 -4v4"/></g>' +
    line(270, zh ? "校验尺 50 mm" : "Check bar: 50 mm") +
    "</g></svg>"
  );
}
