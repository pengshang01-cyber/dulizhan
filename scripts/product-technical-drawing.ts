import {
  verifiedValue,
  type TechnicalPart,
} from "../src/lib/product-technical-schema.ts";

export function viewDimensions(part: TechnicalPart) {
  const g = part.geometry;
  const baseDiameter = verifiedValue(g.baseDiameterMm);
  const topDiameter = verifiedValue(g.topDiameterMm);
  const bottomLength = baseDiameter ?? verifiedValue(g.baseLengthMm);
  const bottomWidth = baseDiameter ?? verifiedValue(g.baseWidthMm);
  const topLength = topDiameter ?? verifiedValue(g.topLengthMm);
  const topWidth = topDiameter ?? verifiedValue(g.topWidthMm);
  const height = verifiedValue(g.heightMm);
  if (
    [bottomLength, bottomWidth, topLength, topWidth, height].some(
      (v) => v === undefined,
    )
  )
    return;
  return {
    bottomLength: bottomLength!,
    bottomWidth: bottomWidth!,
    topLength: topLength!,
    topWidth: topWidth!,
    height: height!,
    round: Boolean(topDiameter && baseDiameter),
    baseRadius: verifiedValue(g.baseCornerRadiusMm),
    topRadius: verifiedValue(g.topCornerRadiusMm),
  };
}

const n = (value: number) => Number(value.toFixed(4));
const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const line = (x: number, y: number, x2: number, y2: number, css = "") =>
  '<line x1="' +
  n(x) +
  '" y1="' +
  n(y) +
  '" x2="' +
  n(x2) +
  '" y2="' +
  n(y2) +
  '" class="' +
  css +
  '"/>';
const label = (
  x: number,
  y: number,
  value: string,
  css = "",
  anchor = "middle",
) =>
  '<text x="' +
  n(x) +
  '" y="' +
  n(y) +
  '" class="' +
  css +
  '" text-anchor="' +
  anchor +
  '">' +
  escapeXml(value) +
  "</text>";

function dimension(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  length: number,
) {
  const horizontal = y1 === y2;
  return [
    line(x1, y1, x2, y2, "dimension"),
    line(x1 - 6, y1 + 6, x1 + 6, y1 - 6, "tick"),
    line(x2 - 6, y2 + 6, x2 + 6, y2 - 6, "tick"),
    label(
      (x1 + x2) / 2 + (horizontal ? 0 : 14),
      (y1 + y2) / 2 - (horizontal ? 11 : 0),
      n(length) + " mm",
      "value",
      horizontal ? "middle" : "start",
    ),
  ].join("");
}

export function technicalDrawing(part: TechnicalPart, title: string) {
  const d = viewDimensions(part);
  if (!d) return;
  const s = Math.min(
    510 / Math.max(d.topLength, d.topWidth, d.bottomLength, d.bottomWidth),
    225 / d.height,
    310 / d.topWidth,
  );
  const h = d.height * s;
  const pleats = verifiedValue(part.pleatCount);
  const rim = verifiedValue(part.rimThicknessMm);
  const cap = verifiedValue(part.rimWidthMm);
  const exterior = (
    x: number,
    top: number,
    base: number,
    name: string,
    y: number,
  ) => {
    const a = (top * s) / 2,
      b = (base * s) / 2;
    const bottom = y + h;
    const lines =
      d.round && pleats && pleats <= 300
        ? Array.from({ length: pleats }, (_, i) =>
            Math.sin(((i + 0.5) * 2 * Math.PI) / pleats),
          )
            .filter(
              (value, i) =>
                Math.cos(((i + 0.5) * 2 * Math.PI) / pleats) > 0 &&
                Math.abs(value) < 0.995,
            )
            .map((value) =>
              line(
                x + a * value,
                y + (rim ?? 0) * s,
                x + b * value,
                bottom,
                "pleat",
              ),
            )
            .join("")
        : "";
    return [
      label(x, y - 79, name, "view"),
      '<path class="outline" d="M ' +
        n(x - a) +
        " " +
        n(y) +
        " H " +
        n(x + a) +
        " L " +
        n(x + b) +
        " " +
        n(bottom) +
        " H " +
        n(x - b) +
        ' Z"/>',
      lines,
      rim && rim < d.height
        ? line(x - a, y + rim * s, x + a, y + rim * s, "detail")
        : "",
      dimension(x - a, y - 29, x + a, y - 29, top),
      dimension(x - b, bottom + 38, x + b, bottom + 38, base),
      dimension(x + a + 23, y, x + a + 23, bottom, d.height),
    ].join("");
  };
  const tx = 800,
    ty = 752;
  const profile = (
    width: number,
    depth: number,
    r: number | undefined,
    css: string,
  ) =>
    d.round
      ? '<circle class="' +
        css +
        '" cx="' +
        tx +
        '" cy="' +
        ty +
        '" r="' +
        n((width * s) / 2) +
        '"/>'
      : '<rect class="' +
        css +
        (r === undefined ? " datum" : "") +
        '" x="' +
        n(tx - (width * s) / 2) +
        '" y="' +
        n(ty - (depth * s) / 2) +
        '" width="' +
        n(width * s) +
        '" height="' +
        n(depth * s) +
        '" rx="' +
        n((r ?? 0) * s) +
        '"/>';
  const note = d.round
    ? "Outer dimensions · mm" +
      (pleats === undefined ? "" : " · " + pleats + " pleats")
    : d.topRadius === undefined || d.baseRadius === undefined
      ? "Outer dimensions · dashed rectangles show the measured bounds"
      : "Outer dimensions · mm";
  const scale = d.topLength >= 150 ? 20 : 10;
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1060" viewBox="0 0 1600 1060"><title>' +
    escapeXml(title) +
    '</title><style>text{font:22px Arial,sans-serif;fill:#30271f}.title{font-size:32px}.view{font-size:20px;font-weight:bold;letter-spacing:3px}.value{font-size:21px;font-family:Arial,sans-serif}line,path,circle,rect{vector-effect:non-scaling-stroke}.outline{stroke:#30271f;stroke-width:2;fill:none}.detail{stroke:#67594f;stroke-width:1.5;fill:none}.datum{stroke-dasharray:8 5}.pleat{stroke:#9a8c80;stroke-width:1.2}.dimension,.tick{stroke:#67594f;stroke-width:1.2}.caption{font-size:19px;fill:#50453b}</style><rect width="1600" height="1060" fill="#fff"/>' +
    label(800, 72, title, "title") +
    exterior(407, d.topLength, d.bottomLength, "FRONT", 218) +
    exterior(1155, d.topWidth, d.bottomWidth, "SIDE", 218) +
    label(tx, 530, "TOP", "view") +
    profile(d.topLength, d.topWidth, d.topRadius, "outline") +
    profile(d.bottomLength, d.bottomWidth, d.baseRadius, "detail datum") +
    (d.round && cap && cap * 2 < d.topLength
      ? profile(
          d.topLength - 2 * cap,
          d.topWidth - 2 * cap,
          undefined,
          "detail",
        )
      : "") +
    dimension(
      tx - (d.topLength * s) / 2,
      ty - (d.topWidth * s) / 2 - 29,
      tx + (d.topLength * s) / 2,
      ty - (d.topWidth * s) / 2 - 29,
      d.topLength,
    ) +
    (!d.round
      ? dimension(
          tx + (d.topLength * s) / 2 + 32,
          ty - (d.topWidth * s) / 2,
          tx + (d.topLength * s) / 2 + 32,
          ty + (d.topWidth * s) / 2,
          d.topWidth,
        )
      : "") +
    dimension(102, 988, 102 + scale * s, 988, scale) +
    label(800, 1018, note, "caption") +
    "</svg>"
  );
}

export function unfoldingReference(part: TechnicalPart, title: string) {
  const d = viewDimensions(part);
  if (!d) return;
  const paths: string[] = [];
  let width: number, height: number;
  if (d.round) {
    const base = d.bottomLength / 2,
      top = d.topLength / 2;
    const delta = top - base;
    if (delta <= 0) return;
    // 直线圆台外包络的几何展开。压褶、搭接及卷口余料由工厂实际刀模确定。
    const slant = Math.hypot(d.height, delta);
    const r1 = (base * slant) / delta,
      r2 = (top * slant) / delta;
    const sweep = (2 * Math.PI * delta) / slant;
    const point = (r: number, theta: number) =>
      [n(r2 + 10 + r * Math.cos(theta)), n(r2 + 22 + r * Math.sin(theta))].join(
        " ",
      );
    const a = -Math.PI / 2 - sweep / 2,
      b = a + sweep,
      flag = sweep > Math.PI ? 1 : 0;
    paths.push(
      "M " +
        point(r2, a) +
        " A " +
        n(r2) +
        " " +
        n(r2) +
        " 0 " +
        flag +
        " 1 " +
        point(r2, b) +
        " L " +
        point(r1, b) +
        " A " +
        n(r1) +
        " " +
        n(r1) +
        " 0 " +
        flag +
        " 0 " +
        point(r1, a) +
        " Z",
    );
    width = 2 * r2 + 20;
    height = r2 + 32;
  } else {
    const panel = (
      x: number,
      y: number,
      top: number,
      base: number,
      slant: number,
    ) =>
      "M " +
      n(x - top / 2) +
      " " +
      n(y) +
      " H " +
      n(x + top / 2) +
      " L " +
      n(x + base / 2) +
      " " +
      n(y + slant) +
      " H " +
      n(x - base / 2) +
      " Z";
    const length = Math.max(d.bottomLength, d.topLength);
    const depth = Math.max(d.bottomWidth, d.topWidth);
    const longSlope = Math.hypot(d.height, (d.topWidth - d.bottomWidth) / 2);
    const shortSlope = Math.hypot(d.height, (d.topLength - d.bottomLength) / 2);
    // 各侧面单独展平，省略未经核实的圆角连接、粘口和底面折料。
    paths.push(
      panel(10 + length / 2, 22, d.topLength, d.bottomLength, longSlope),
    );
    paths.push(
      panel(20 + length + depth / 2, 22, d.topWidth, d.bottomWidth, shortSlope),
    );
    paths.push(
      panel(
        10 + length / 2,
        32 + longSlope,
        d.topLength,
        d.bottomLength,
        longSlope,
      ),
    );
    paths.push(
      panel(
        20 + length + depth / 2,
        32 + shortSlope,
        d.topWidth,
        d.bottomWidth,
        shortSlope,
      ),
    );
    width = length + depth + 30;
    height = 2 * Math.max(longSlope, shortSlope) + 43;
  }
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="' +
    n(width) +
    'mm" height="' +
    n(height) +
    'mm" viewBox="0 0 ' +
    n(width) +
    " " +
    n(height) +
    '"><title>' +
    escapeXml(title) +
    ' - geometric reference</title><rect width="100%" height="100%" fill="#fff"/><text x="10" y="9" font-family="Arial,sans-serif" font-size="4">GEOMETRIC REFERENCE — PENDING FACTORY TOOLING APPROVAL</text><text x="10" y="15" font-family="Arial,sans-serif" font-size="3.4">Nominal outer geometry in mm · cut allowances, bleed and safe zone pending</text><g id="finished-reference" fill="none" stroke="#36291f" stroke-width=".25">' +
    paths.map((path) => '<path d="' + path + '"/>').join("") +
    '</g><g id="bleed" data-status="pending"/><g id="safe-area" data-status="pending"/></svg>'
  );
}
