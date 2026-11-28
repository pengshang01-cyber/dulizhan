"""按毫米构造压纸的中性展开位置、折回的实物截面，以及卷纸的两侧表面。"""
import math
import random
from dataclasses import dataclass, field

TAU = 2 * math.pi


def mix(a, b, f):
    return a + (b - a) * f


def clamp(x):
    return max(0.0, min(1.0, x))


def smooth(x):
    x = clamp(x)
    return x * x * (3 - 2 * x)


def fact(record, key):
    entry = record.get(key) or {}
    return entry.get("value") if entry.get("status") == "verified" else None


@dataclass
class Dimensions:
    base: tuple
    top: tuple
    height: float
    corners: tuple
    shape: str

    @classmethod
    def read(cls, part, appearance, shape):
        g = part["geometry"]
        def pair(end):
            diameter = fact(g, end + "DiameterMm")
            return (diameter, diameter) if diameter else (fact(g, end + "LengthMm"), fact(g, end + "WidthMm"))
        bottom, top, h = pair("base"), pair("top"), fact(g, "heightMm")
        if not all((*bottom, *top, h)):
            return None
        radii = tuple(fact(g, k + "CornerRadiusMm") or min(size) * appearance.get(k + "CornerFraction", 0)
                      for k, size in (("base", bottom), ("top", top)))
        return cls(bottom, top, h, radii, shape)

    def xy(self, f, u, inset=0):
        w, d = (mix(a, b, f) - 2 * inset for a, b in zip(self.base, self.top))
        if self.shape == "round-rolled-rim":
            angle = TAU * (u - .25)
            return w / 2 * math.cos(angle), d / 2 * math.sin(angle)
        face = math.floor(4 * u) % 4
        t = (4 * u) % 1
        half, depth = ((w / 2, d / 2) if face % 2 == 0 else (d / 2, w / 2))
        radius = max(.015, min(half, depth, mix(*self.corners, f) - inset))
        if t < .25 or t > .75:
            left = t < .25
            angle = math.pi * ((.75 if left else 1.25) - t)
            x = (-1 if left else 1) * (half - radius) + radius * math.cos(angle)
            y = -depth + radius - radius * math.sin(angle)
        else:
            x = (t - .5) * 4 * (half - radius)
            y = -depth
        return ((x, y), (-y, x), (-x, -y), (y, -x))[face]

    def print_uv(self, q, height, face):
        f = clamp(height / self.height)
        if self.shape == "round-rolled-rim":
            a, b = self.base[0] / 2, self.top[0] / 2
            slant = math.hypot(self.height, b - a)
            outer = b * slant / (b - a)
            rho = mix(a * slant / (b - a), outer, f)
            theta = -math.pi / 2 + (q - .5) * TAU * (b - a) / slant
            return ((outer + 10 + rho * math.cos(theta)) / (2 * outer + 20),
                    1 - (outer + 22 + rho * math.sin(theta)) / (outer + 32))
        length, width = (max(a, b) for a, b in zip(self.base, self.top))
        slopes = [math.hypot(self.height, (self.top[i] - self.base[i]) / 2) for i in (1, 0)]
        x, y = self.xy(f, q)
        along = (x, y, -x, -y)[face]
        center = 20 + length + width / 2 if face % 2 else 10 + length / 2
        slope = slopes[face % 2]
        y0 = 22 if face < 2 else 32 + slope
        return (center + along) / (length + width + 30), 1 - (y0 + (1 - f) * slope) / (2 * max(slopes) + 43)


@dataclass(frozen=True)
class Station:
    q: float
    shift: float = 0
    relief: float = 0
    crimp: float = 0
    lean: float = 0
    sharp: bool = False


# 第一列沿未折叠纸张递增；第二列在折峰后倒退，随后再前进，形成真的 Z 形叠层。
# 窄小的转角平台保留纸片厚度和折边高光。段内的大部分宽度用于平纸面。
CREASE = (
    (0, 0, -.14, 0), (.14, .14, -.12, 0), (.32, .32, -.084, 0), (.45, .46, -.02, .02),
    (.53, .58, .06, .16), (.59, .70, .40, .65), (.615, .745, .51, .94),
    (.625, .752, .50, 1), (.637, .746, .36, .91), (.69, .591, .11, .47),
    (.706, .558, -.13, .34), (.718, .554, -.31, .24), (.73, .565, -.35, .17),
    (.77, .655, -.30, .08), (.86, .81, -.22, .01), (.94, .935, -.17, 0),
)


def stations(shape, count, seed=5039):
    rng = random.Random(seed)
    if shape == "round-rolled-rim":
        if not count:
            raise ValueError("圆杯需要核实的褶数")
        raw = [rng.uniform(-.057, .057) for _ in range(count)]
        mean = sum(raw) / count
        widths = [(1 + r - mean) / count for r in raw]
        spans, start = [], 0.0
        for width in widths:
            spans.append((start, start + width))
            start += width
    else:
        spans = []
        for face in range(4):
            # 07 号方杯的角部有多层窄折，平边保留较宽的完整面。
            local = ((.035, .211), (.750, .846), (.850, .995)) if shape == "square-rolled-rim" else (
                ((.210, .300), (.705, .795)) if face % 2 else ())
            for a, b in local:
                spans.append(((face + a) / 4, (face + b) / 4))
    result = []
    def plain(a, b):
        n = math.ceil((b - a) * 160 - 1e-8)
        for i in range(n):
            result.append(Station(mix(a, b, i / n)))
    start = 0
    for a, b in spans:
        plain(start, a)
        width = b - a
        amp = rng.uniform(.92, 1.08)
        slant = rng.uniform(-.020, .020) * width
        for q, t, rad, crimp in CREASE:
            result.append(Station(mix(a, b, q), (t - q) * width, rad * amp, crimp * amp,
                                  slant * math.sin(math.pi * q), q in (.625, .718)))
        start = b
    plain(start, 1)
    # 展开面的接缝必须有顶点，即便此处不在折纹上。
    if shape != "round-rolled-rim":
        for q in (0, .25, .5, .75):
            if all(abs(s.q - q) > 1e-8 for s in result):
                result.append(Station(q))
    return sorted(result, key=lambda s:s.q)


@dataclass
class Patch:
    name: str
    material: str
    points: list = field(default_factory=list)
    faces: list = field(default_factory=list)
    uv: list = field(default_factory=list)
    detail: list = field(default_factory=list)
    sharp_edges: set = field(default_factory=set)


ATLAS = {
    "Exterior": (.012, .014, .988, .342), "Interior": (.012, .36, .988, .68),
    "Rim": (.012, .704, .738, .902), "Foot": (.012, .922, .738, .985),
    "Floor": (.762, .705, .982, .838), "Underside": (.762, .855, .982, .985),
}


class Form:
    def __init__(self, part, appearance, shape):
        self.d = Dimensions.read(part, appearance, shape)
        self.st = stations(shape, fact(part, "pleatCount"))
        self.skin = fact(part, "paperThicknessMm") or min(self.d.base) * .0035
        self.rw = fact(part, "rimWidthMm") or min(self.d.top) * .014
        self.rh = fact(part, "rimThicknessMm") or self.rw * .83
        self.box = shape == "box"
        self.round = shape == "round-rolled-rim"
        self.patches = []

    def wall_point(self, s, f, inset=0):
        # 在靠底处收起返折；到卷管下沿出现压肩，外壁折峰过渡到管口局部挤压。
        z = f * (self.d.height - self.rh * 1.25)
        strength = .055 + .945 * smooth(f / .70)
        if self.box:
            strength = .19 + .81 * smooth(f / .40)
        # 07 和手持照里，有些折脊近底处呈一个短折角，上段仍保持平的叠压面。
        crease_phase = math.sin(TAU * (7 * s.q + .21))
        kink = .0016 * crease_phase * math.exp(-((f - .22 - .035 * crease_phase) / .067)**2)
        angle = s.q + (s.shift * strength + s.lean * math.sin(f * math.pi) + kink * s.crimp) * (1 if not self.box else .70)
        depth = (1.45 if self.round else 1.13 if not self.box else 1.16)
        bow = math.sin(TAU * (s.q * 3 + .12)) * math.sin(f * math.pi) * .10
        # 卷边下面可见一条有断续的压线；侧光下宽纸面仍保持平整。
        collar = .874 + .018 * math.sin(TAU * (4 * s.q + .14)) + .013 * crease_phase
        continuity = .52 + .32 * math.cos(TAU * (3 * s.q + .02)) + .15 * crease_phase
        shoulder = (.44 if self.round else .17) * math.exp(-((f - collar) / .025)**2) * (1 - .62 * s.crimp) * continuity
        upper_roll = .21 * math.exp(-((f - collar - .036) / .030)**2) * continuity
        dent = .19 * crease_phase * math.exp(-((f - .22) / .058)**2) * s.crimp
        inner = inset + (self.rw * .44) * f - s.relief * depth * strength + shoulder - upper_roll - bow + dent
        x, y = self.d.xy(f, angle, inner)
        return x, y, z

    def lip_point(self, s, degree, back=False):
        d = self.d
        a = math.radians(degree)
        travel = (degree + 108) / 448
        # 一整圈以上的卷纸，末端回收入管；返回的一层是同一条纸的另一面。
        roll = 1 - .34 * smooth((travel - .54) / .46) - (self.skin / max(self.rw / 2, .2) if back else 0)
        fold = s.crimp
        # 预留整个杯口外包校准的余量，使未受挤压处卷管的典型直径保持实测值。
        h = self.rh * .510
        wave = (.22 * math.sin(TAU * (s.q * 3 + .12)) + .10 * math.sin(TAU * (s.q * 7 + .46)) +
              .40 * fold - .10) * (.12 if self.box else 1)
        oval = (.10 * math.sin(TAU * (s.q * 2 + .19)) + .23 * fold) * (.13 if self.box else 1)
        squeeze = 1 - .048 * fold
        inset = self.rw / 2 - oval - self.rw * .510 * roll * math.cos(a) * (1 + .034 * fold)
        x, y = d.xy(1, s.q + s.shift * .12, inset)
        return x, y, d.height - h + wave + h * roll * math.sin(a) * squeeze

    def strip(self, name, material, rows, uv_type="band"):
        result = Patch(name, material)
        n = len(self.st)
        result.points = [p for row in rows for p in row]
        atlas = ATLAS.get(name, (.01, .01, .99, .99))
        for h in range(len(rows) - 1):
            for i, s in enumerate(self.st):
                k = (i + 1) % n
                lo = s.q
                hi = self.st[k].q if k else 1
                a = h * n + i
                b = h * n + k
                vertices = (a, b, b + n, a + n)
                result.faces.append(vertices)
                chart = math.floor(((lo + hi) / 2) * 4) % 4
                uv = []
                detail = []
                for ix, q, j in zip(vertices, (lo, hi, hi, lo), (h, h, h + 1, h + 1)):
                    v = j / (len(rows) - 1)
                    if uv_type == "wall":
                        uv.append(self.d.print_uv(q, result.points[ix][2], chart))
                    else: uv.append((q, v))
                    detail.append((mix(atlas[0], atlas[2], q), mix(atlas[1], atlas[3], v)))
                result.uv.append(uv)
                result.detail.append(detail)
                if s.sharp and name in ("Interior", "Exterior"):
                    result.sharp_edges.add((a, a + n))
        self.patches.append(result)

    def disk(self, name, material, edge, up):
        result = Patch(name, material)
        result.points = [(0., 0., edge[0][2]), *edge]
        atlas = ATLAS.get(name, (.01, .01, .99, .99))
        xmax = max(abs(p[0]) for p in edge)
        ymax = max(abs(p[1]) for p in edge)
        for i in range(len(edge)):
            a = i + 1
            b = (i + 1) % len(edge) + 1
            tri = (0, a, b) if up else (0, b, a)
            result.faces.append(tri)
            uv = [(.5 + result.points[j][0] / (2 * xmax), .5 + result.points[j][1] / (2 * ymax)) for j in tri]
            result.uv.append(uv)
            result.detail.append([(mix(atlas[0], atlas[2], u), mix(atlas[1], atlas[3], v)) for u, v in uv])
        self.patches.append(result)

    def row(self, fn):
        return [fn(s) for s in self.st]

    def body(self):
        d = self.d
        levels = (0, .025, .085, .16, .21, .26, .32, .45, .62, .78, .824, .845, .865, .884, .903, .925, .954, .976, 1)
        outer = [self.row(lambda s:self.wall_point(s, f)) for f in levels]
        curl_angles = sorted(set([-108 + 448 * i / 49 for i in range(50)] + [-90, 0, 90, 180, 270]))
        outside = [self.row(lambda s:self.lip_point(s, a)) for a in curl_angles]
        inside = [self.row(lambda s:self.lip_point(s, a, True)) for a in reversed(curl_angles)]
        inner = [self.row(lambda s:self.wall_point(s, f, self.skin)) for f in reversed(levels[1:])]
        def bottom(s, factor, z):
            x, y = d.xy(0, s.q, self.skin * factor)
            return x, y, z
        underside = self.row(lambda s:bottom(s, 2.1, self.skin * .8))
        floor = self.row(lambda s:bottom(s, 3.3, self.skin * 2.4))
        self.disk("Underside", "PaperExterior", underside, False)
        self.strip("Foot", "PaperExterior", [underside, outer[0]])
        self.strip("Exterior", "PaperExterior", [*outer, outside[0]], "wall")
        self.strip("Rim", "RolledEdge", outside + inside)
        self.strip("Interior", "PaperLining", [inside[-1], *inner, floor], "wall")
        self.disk("Floor", "PaperLining", floor, True)
        self.fit(outer[0], outside + inside)
        return self.patches

    def cover(self):
        d = self.d
        self.st = [Station(i / 192) for i in range(192)]
        skin = min(d.top) * .0034
        def row(f, z, inset=0):
            return self.row(lambda s:(*d.xy(f, s.q, inset), z))
        # 图册中裙边、压合台阶、斜肩与平盖顶均可辨。闭合扣点的内侧细节缺照片。
        profile = [(0, 0, 0), (0, .045, 0), (.012, .075, 0), (.025, .108, skin * 2),
                 (.085, .14, skin * 2), (.13, .18, .15), (.77, .76, 0), (.93, .90, 0),
                 (.977, .973, 0), (1, 1, 0)]
        outer = [row(f, z * d.height, i) for f, z, i in profile]
        inner = [row(f, max(0, z * d.height - skin), i + skin) for f, z, i in reversed(profile)]
        self.strip("Skirt", "ClearPET", outer)
        self.disk("Top", "ClearPET", outer[-1], True)
        self.strip("InnerSkirt", "ClearPET", inner)
        self.disk("Ceiling", "ClearPET", inner[0], False)
        self.strip("SkirtEdge", "ClearPET", [inner[-1], outer[0]])
        return self.patches

    def fit(self, base, upper):
        top = [v for row in upper for v in row]
        def bounds(v):
            return [(min(p[i] for p in v), max(p[i] for p in v)) for i in (0, 1)]
        bottom_bounds, top_bounds = bounds(base), bounds(top)
        peak = max(p[2] for p in top)
        for patch in self.patches:
            adjusted = []
            for x, y, z in patch.points:
                f = smooth(z / (self.d.height * .85))
                xy = []
                for i, c in enumerate((x, y)):
                    def calibrate(size, bounds):
                        lo, hi = bounds[i]
                        return (c - (hi + lo) / 2) * size[i] / (hi - lo)
                    xy.append(mix(calibrate(self.d.base, bottom_bounds), calibrate(self.d.top, top_bounds), f))
                adjusted.append((*xy, z * self.d.height / peak))
            patch.points = adjusted
