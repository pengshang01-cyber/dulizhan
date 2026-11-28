"""5039 可印刷纸面。几何回折与原片 UV 由同一条分段纸带生成，毫米。"""
import bisect
import math
from forming import Form, TAU, mix, smooth

class BlankForm(Form):
    def __init__(self, part, appearance, shape, blank):
        super().__init__(part, appearance, shape)
        self.zones = blank["zonesMm"]
        self.ends = [*blank["sectorStartsTurns"], 1.]
        self.coords = {}
        self.sectors = {}
        for s in self.st:
            # JSON 记录的褶距保留十位小数。避免恰在边界的点被舍入分到前一瓣。
            i = min(len(self.ends)-2, bisect.bisect_right(self.ends, s.q+1e-9)-1)
            a, b = self.ends[i:i+2]
            self.sectors[s] = i, a, b-a, min(1.,max(0.,(s.q-a)/(b-a)))

    def angles(self, s, r, R):
        i, start, span, t = self.sectors[s]
        count = len(self.ends)-1
        extra = max(0., TAU*(r-R)/count)
        land = TAU*R*span
        crest = .72*land
        back = extra/2
        if t <= .625:
            path = crest*t/.625
            projection = path
        elif t <= .718:
            turn = back*(t-.625)/(.718-.625)
            path, projection = crest+turn, crest-turn
        else:
            travel = (t-.718)/(1-.718)*(land-crest+back)
            path, projection = crest+back+travel, crest-back+travel
        paper = (TAU*R*start+i*extra+path)/(TAU*r)
        return start+projection/(TAU*R), paper

    def point(self, s, r, nominal, actual, z):
        angle, sheet = self.angles(s, r, nominal)
        a = TAU*(angle-.25)
        p = (actual*math.cos(a), actual*math.sin(a), z)
        k = r/(2*self.zones["rimEnd"])
        self.coords[p] = (.5+k*math.sin(TAU*sheet), .5+k*math.cos(TAU*sheet))
        return p

    def wall_point(self, s, f, inset=0):
        rb, end = self.zones["bottomEnd"], self.zones["wallEnd"]
        R = mix(rb, self.d.top[0]/2, f)
        # 折峰略凸，折回的两层分别压在峰后。杯底处褶深随多余纸长归零。
        # 叠压区的上层必须完整盖过折回的背面。按投影角确定共同基面，再按
        # 纸带走向留出层间距离，避免深褶的白色内衬从印刷正面穿出来。
        i, start, span, t = self.sectors[s]
        angle, _ = self.angles(s, mix(rb,end,f), R)
        along = (angle-start)/span
        crest = .72
        ridge = .49*math.exp(-((along-crest)/.12)**2)-.105*math.cos(TAU*along)
        if t <= .625:
            layer = 0.
        elif t <= .718:
            layer = .65*smooth((t-.625)/(.718-.625))
        else:
            # 第三层一直藏在折峰之下，过折峰后顺回下一片外壁。
            layer = .65*(1-smooth((along-crest)/(1-crest)))
        relief = (ridge-layer)*smooth(f/.72)
        actual = R - .8*self.rw*f + relief - inset
        z = f*(self.d.height-1.12*self.rh)
        contact = self.lip_point(s,-132,back=inset>0)
        join = smooth((f-.89)/.11)
        return self.point(s,mix(rb,end,f),R,
                          mix(actual,math.hypot(*contact[:2]),join),
                          mix(z,contact[2]-.16,join))

    def lip_point(self, s, degree, back=False):
        # 纸带长由剩余外圈确定。纸张退出截面后只将末尾略收入管内。
        t = (degree+132)/474
        r = mix(self.zones["wallEnd"],self.zones["rimEnd"],t)
        arc = -132 + math.degrees(t*(self.zones["rimEnd"]-self.zones["wallEnd"])/(self.rh/2))
        # 沿用 M19 的纸管高光、压痕与口缘起伏，外观参数不作为工厂量测。
        old = super().lip_point(s,arc,back)
        center = self.d.top[0]/2 - self.rw/2
        center_z = self.d.height-self.rh/2
        # 截面是随褶摆动的曲线。按穿过卷管的实测截面补偿斜切造成的外包增量。
        actual = center+(math.hypot(*old[:2])-center)*.979
        return self.point(s,r,self.d.top[0]/2,actual,center_z+(old[2]-center_z)*.978)

    def uv(self,p):
        if p in self.coords:
            return self.coords[p]
        d = 2*self.zones["rimEnd"]
        return .5+p[0]/d, .5-p[1]/d

    def strip(self,name,material,rows,uv_type="band"):
        super().strip(name,material,rows,uv_type)
        patch = self.patches[-1]
        patch.uv = [[self.uv(patch.points[i]) for i in face] for face in patch.faces]

    def disk(self,name,material,edge,up):
        super().disk(name,material,edge,up)
        patch = self.patches[-1]
        patch.uv = [[self.uv(patch.points[i]) for i in face] for face in patch.faces]
