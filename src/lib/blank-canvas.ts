import {
  placements,
  hiddenBand,
  ratio,
  tau,
  inkCoverage,
  type Design,
  type Sheet,
} from "./blank-design";
export const canvasOf = (w: number, h = w) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};
type Ctx = CanvasRenderingContext2D;
function arc(c: Ctx, r: number) {
  c.beginPath();
  c.arc(0, 0, r, 0, tau);
}
export async function readLogo(file: File) {
  const url = URL.createObjectURL(file),
    image = new Image();
  try {
    image.src = url;
    await image.decode();
    const w = image.naturalWidth,
      h = image.naturalHeight;
    if (!w || !h || w * h > 64_000_000) throw Error("invalid_design");
    const vector = /\.svg$/i.test(file.name),
      scale = Math.min(vector ? Infinity : 1, 1536 / Math.max(w, h)),
      c = canvasOf(
        Math.max(1, Math.round(w * scale)),
        Math.max(1, Math.round(h * scale)),
      );
    c.getContext("2d")!.drawImage(image, 0, 0, c.width, c.height);
    return { original: c, nativeWidth: w, vector };
  } finally {
    URL.revokeObjectURL(url);
  }
}
export function prepareInk(image: HTMLCanvasElement, p: Design) {
  const c = canvasOf(image.width, image.height),
    ctx = c.getContext("2d")!;
  ctx.drawImage(image, 0, 0);
  if (p.removeWhite) {
    const frame = ctx.getImageData(0, 0, c.width, c.height);
    for (let i = 0; i < frame.data.length; i += 4) {
      const min = Math.min(
        frame.data[i]!,
        frame.data[i + 1]!,
        frame.data[i + 2]!,
      );
      if (min > 238)
        frame.data[i + 3] = Math.round((frame.data[i + 3]! * (255 - min)) / 17);
    }
    ctx.putImageData(frame, 0, 0);
  }
  if (p.colorMode === "mono") {
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = p.ink;
    ctx.fillRect(0, 0, c.width, c.height);
  }
  return c;
}
export function guide(c: Ctx, s: Sheet) {
  c.save();
  c.fillStyle = "rgba(164,91,48,.16)";
  s.sectors.forEach((_, i) => {
    c.beginPath();
    for (const k of [0, 1] as const) {
      for (let j = 0; j <= 22; j++) {
        const r = s.base + ((s.radius - s.base) * (k ? 22 - j : j)) / 22,
          a = hiddenBand(s, r, i)[k] * tau;
        const x = r * Math.sin(a),
          y = -r * Math.cos(a);
        if (!k && !j) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
    }
    c.closePath();
    c.fill();
  });
  for (const [r, color, dash] of [
    [s.base, "#6f6358", [1, 1]],
    [s.wall, "#a87552", [1, 1]],
    [s.radius - s.safe, "#416b55", [1.4, 1]],
    [s.radius, "#36291f", []],
  ] as const) {
    arc(c, r);
    c.setLineDash([...dash]);
    c.lineWidth = 0.34;
    c.strokeStyle = color;
    c.stroke();
  }
  c.restore();
}
export function drawArtwork(
  s: Sheet,
  p: Design,
  ink: HTMLCanvasElement | undefined,
  surface: HTMLCanvasElement,
  diagram: HTMLCanvasElement,
) {
  const D = s.radius * 2,
    size = surface.width,
    art = canvasOf(size),
    ctx = art.getContext("2d")!;
  ctx.translate(size / 2, size / 2);
  ctx.scale(size / D, size / D);
  const h = ink ? (p.widthMm * ink.height) / ink.width : p.widthMm;
  const marks = placements(s, p, p.widthMm / h);
  if (ink) {
    function paint(rLo: number, rHi: number, scale: number) {
      ctx.save();
      if (rLo || rHi < Infinity) {
        ctx.beginPath();
        ctx.arc(0, 0, rHi === Infinity ? D * 8 : rHi, 0, tau);
        if (rLo) ctx.arc(0, 0, rLo, 0, tau, true);
        ctx.clip("evenodd");
      }
      for (const m of marks) {
        const dist = Math.hypot(m.x, m.y),
          extent = Math.hypot(p.widthMm * scale, h * scale) / 2;
        if (dist + extent < rLo || dist - extent > rHi) continue;
        ctx.save();
        ctx.translate(m.x, m.y);
        if (scale !== 1) {
          const tangent = Math.atan2(m.x, -m.y);
          ctx.rotate(tangent);
          ctx.scale(scale, 1);
          ctx.rotate(-tangent);
        }
        ctx.rotate(m.angle);
        ctx.drawImage(ink!, -p.widthMm / 2, -h / 2, p.widthMm, h);
        ctx.restore();
      }
      ctx.restore();
    }
    if (p.compensate) {
      paint(0, s.base, 1);
      for (let j = 0; j < 20; j++) {
        const low = s.base + ((s.wall - s.base) * j) / 20,
          high = s.base + ((s.wall - s.base) * (j + 1)) / 20;
        paint(low, high, 1 / ratio(s, (low + high) / 2));
      }
      paint(s.wall, Infinity, 1);
    } else paint(0, Infinity, 1);
  }
  const sc = surface.getContext("2d")!;
  sc.clearRect(0, 0, size, size);
  sc.fillStyle = p.background;
  sc.fillRect(0, 0, size, size);
  sc.drawImage(art, 0, 0);
  const dc = diagram.getContext("2d")!,
    w = diagram.width,
    drawD = D + 10,
    k = w / drawD;
  dc.clearRect(0, 0, w, w);
  dc.fillStyle = "#fff";
  dc.fillRect(0, 0, w, w);
  dc.save();
  dc.translate(w / 2, w / 2);
  dc.scale(k, k);
  dc.save();
  arc(dc, s.radius);
  dc.clip();
  dc.drawImage(surface, -s.radius, -s.radius, D, D);
  dc.restore();
  guide(dc, s);
  dc.restore();
  // 用实际不透明墨迹面积估算被褶遮住的比例，透明底不计入分母。
  const mask = canvasOf(150),
    mc = mask.getContext("2d", { willReadFrequently: true })!;
  mc.drawImage(art, 0, 0, 150, 150);
  const pixels = mc.getImageData(0, 0, 150, 150).data;
  let maxStretch = 1;
  function* points() {
    for (let i = 3; i < pixels.length; i += 4) {
      const a = pixels[i]!;
      if (!a) continue;
      const j = (i - 3) / 4;
      const x = (((j % 150) + 0.5) / 150 - 0.5) * D,
        y = ((Math.floor(j / 150) + 0.5) / 150 - 0.5) * D;
      if (p.compensate) {
        const r = Math.hypot(x, y);
        if (r > s.base && r <= s.wall)
          maxStretch = Math.max(maxStretch, 1 / ratio(s, r));
      }
      yield { x, y, weight: a / 255 };
    }
  }
  const info = inkCoverage(s, points());
  if (
    ink &&
    marks.some(
      (m) => Math.hypot(m.x, m.y) - Math.hypot(p.widthMm, h) / 2 > s.radius,
    )
  )
    info.unsafe = true;
  return { coverage: info, count: marks.length, maxStretch };
}
export function flatProof(
  diagram: HTMLCanvasElement,
  description: string,
  legend: string,
) {
  const out = canvasOf(1100, 1220),
    c = out.getContext("2d")!;
  c.fillStyle = "white";
  c.fillRect(0, 0, out.width, out.height);
  c.drawImage(diagram, 30, 24, 1040, 1040);
  c.fillStyle = "#36291f";
  c.font = "26px Arial, sans-serif";
  c.fillText(description, 40, 1100, 1020);
  c.font = "20px Arial,sans-serif";
  c.fillText(legend, 40, 1150, 1020);
  return out;
}
export const toBlob = (c: HTMLCanvasElement, type = "image/png") =>
  new Promise<Blob>((ok, fail) =>
    c.toBlob((v) => (v ? ok(v) : fail(Error("image"))), type, 0.87),
  );
