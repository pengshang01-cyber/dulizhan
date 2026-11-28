"""在同一影棚按工厂六个拍摄视角渲染旧版与新版 GLB。仅生成审核图。"""
import argparse
import json
import math
import sys
from pathlib import Path
import bpy
from mathutils import Vector


def area(name, pos, target, width, height, power):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = power
    data.shape = "RECTANGLE"
    data.size = width
    data.size_y = height
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = pos
    obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()
    return obj


def studio(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    s.cycles.device = "CPU"
    s.cycles.samples = 18
    s.cycles.seed = 5039
    s.cycles.use_denoising = True
    s.world = bpy.data.worlds.new("Neutral sweep")
    s.world.use_nodes = True
    world = s.world.node_tree.nodes.get("Background")
    world.inputs[0].default_value = (.84, .86, .88, 1)
    world.inputs[1].default_value = .46
    s.view_settings.view_transform = "AgX"
    s.render.resolution_x = 696
    s.render.resolution_y = 460
    s.render.resolution_percentage = 100
    s.render.image_settings.file_format = "PNG"
    s.render.film_transparent = True
    s.render.threads_mode = "FIXED"
    s.render.threads = 8
    bpy.ops.import_scene.gltf(filepath=str(path))
    lid = bpy.data.objects.get("Lid")
    if lid:
        for ob in [lid, *lid.children_recursive]:
            ob.hide_render = True
    cam = bpy.data.cameras.new("Inspection lens")
    camera = bpy.data.objects.new("Inspection camera", cam)
    s.collection.objects.link(camera)
    s.camera = camera
    cam.type = "ORTHO"
    cam.clip_start = .0003
    return s, camera


def render_views(path, shape, dim, out):
    s, camera = studio(path)
    w, d, h = (v * .001 for v in dim)
    views = [
        ("front", (-2, 7), (.00, 0, .46), 1.23 * w),
        ("three-quarter", ((-30 if shape == "square-rolled-rim" else 52 if shape == "box" else 32), 45), (.0, 0, .52), 1.82 * w if shape != "box" else 1.50 * w),
        ("top", (0, 89.96), (0, 0, .50), max(w * 1.17, d * 1.74)),
        ("bottom", (0, -89.96), (0, 0, .40), max(w * 1.17, d * 1.74)),
    ]
    if shape == "round-rolled-rim":
        views.extend([("rim", (4, -8), (.04, -.473, .946), .54 * w), ("fold", (5, -6), (.05, -.440, .60), .54 * w)])
    elif shape == "square-rolled-rim":
        views.extend([("rim", (21, 12), (.31, -.39, .956), .66 * w), ("fold", (25, 8), (.34, -.37, .49), .61 * w)])
    else:
        views.extend([("rim", (24, 18), (.32, -.43, .958), .49 * w), ("fold", (24, 12), (.39, -.39, .48), .43 * w)])
        if bpy.data.objects.get("Lid"):
            views.append(("covered", (-30, 35), (0, 0, .61), 1.45 * w))
    for name, (az, el), (cx, cy, cz), width in views:
        if name == "covered":
            lid = bpy.data.objects["Lid"]
            for ob in [lid, *lid.children_recursive]:
                ob.hide_render = False
        a, e = map(math.radians, (az, el))
        direction = Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))
        right = Vector((math.cos(a), math.sin(a), 0))
        up = direction.cross(right).normalized()
        target = Vector((cx * w, cy * d, cz * h))
        center = Vector((0, 0, h * .48))
        camera.location = target + direction * w * 3.2
        camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()
        if shape == "round-rolled-rim" and name in ("rim", "fold"):
            # 手持照中杯子在画面内向左倾。对齐摄影机，保留模型原有角度和尺寸。
            camera.rotation_euler.rotate_axis("Z", math.radians(-14))
        camera.data.ortho_scale = width
        # 光源随检查方向摆位，模拟拍摄 04 号时把杯子翻过来。窄条光揭示折脊和膜面高光。
        lights = [
            area("Strip", center + w * (direction * .66 - right * 1.52 + up * 1.16), center, .50 * w, 2.25 * w, 151 * w * w),
            area("White card", center + w * (direction * 1.42 + right * 1.43 + up * .33), center, 1.6 * w, 1.9 * w, 55 * w * w),
            area("Back edge", center + w * (-direction * .65 + right * .25 + up * 1.67), center, 1.65 * w, .62 * w, 120 * w * w)]
        if name == "bottom":
            lights.append(area("Bottom white card", center + w * direction * 1.45, center, 2 * w, 1.8 * w, 320 * w * w))
        s.render.filepath = str(out / (name + ".png"))
        bpy.ops.render.render(write_still=True)
        for obj in lights:
            bpy.data.objects.remove(obj, do_unlink=True)


ap = argparse.ArgumentParser()
ap.add_argument("--specs", type=Path, required=True)
ap.add_argument("--models", type=Path, required=True)
ap.add_argument("--previous", type=Path)
ap.add_argument("--out", type=Path, required=True)
ap.add_argument("--only")
args = ap.parse_args(sys.argv[sys.argv.index("--") + 1:])
for f in sorted(args.specs.glob("*.json")):
    spec = json.loads(f.read_text(encoding="utf8"))
    if not spec.get("modelAppearance") or (args.only and args.only != spec["slug"]):
        continue
    slug = spec["slug"]
    code = spec["photographedVariant"]["value"]
    v = next(v for v in spec["variants"] if v["id"] == code)
    g = v["body"]["geometry"]
    def val(key):
        return (g.get(key) or {}).get("value")
    dims = [val("topDiameterMm") or val("topLengthMm"), val("topDiameterMm") or val("topWidthMm"), val("heightMm")]
    for version, folder in (("previous", args.previous), ("blender", args.models)):
        if folder is None:
            continue
        out = (args.out / slug / version).resolve()
        out.mkdir(exist_ok=True, parents=True)
        render_views((folder / slug / (code + ".glb")).resolve(), spec["shape"], dims, out)
        print("REVIEW", slug, version, flush=True)
