"""Blender 后台入口。生成实物网格、高模压纸与切线法线烘焙，以原生 glTF 导出器打包。"""
import argparse
import json
import math
import sys
from pathlib import Path
import bpy
import numpy as np

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from forming import Form, fact


def linear(c):
    return c / 12.92 if c <= .04045 else ((c + .055) / 1.055)**2.4


def configure():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1
    scene.render.engine = "CYCLES"
    scene.render.threads_mode = "FIXED"
    scene.render.threads = 1
    scene.cycles.device = "CPU"
    scene.cycles.samples = 1
    scene.cycles.seed = 5039
    return scene


def make_materials(hexcolor, coated):
    rgb = tuple(linear(int(hexcolor[i:i + 2], 16) / 255) for i in (1, 3, 5))
    materials = {}
    # 涂膜样品的内壁有最清晰的条形高光，外侧仍能分辨纸面细纹。非 PET 盒身沿用原涂层。
    settings = (("PaperExterior", .245, .68, .17), ("PaperLining", .165, .84, .105),
                ("RolledEdge", .19, .76, .125)) if coated else (
                ("PaperExterior", .44, .18, .24), ("PaperLining", .36, .222, .24),
                ("RolledEdge", .40, .198, .24))
    for name, rough, coat, coat_rough in settings:
        mat = bpy.data.materials.new(name)
        if not mat.node_tree:
            mat.use_nodes = True
        bs = mat.node_tree.nodes.get("Principled BSDF")
        bs.inputs["Base Color"].default_value = (*rgb, 1)
        bs.inputs["Roughness"].default_value = rough
        bs.inputs["Coat Weight"].default_value = coat
        bs.inputs["Coat Roughness"].default_value = coat_rough
        bs.inputs["IOR"].default_value = 1.53
        # 表面本身包含里外两层，仅绘制相应的正面。
        mat.use_backface_culling = True
        materials[name] = mat
    return materials


def object_for(patch, parent, mat):
    mesh = bpy.data.meshes.new(parent.name + "." + patch.name)
    mesh.from_pydata([tuple(c * .001 for c in p) for p in patch.points], [], patch.faces)
    mesh.update(calc_edges=True)
    obj = bpy.data.objects.new(mesh.name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.parent = parent
    obj["surface"] = patch.name
    obj["uvLayout"] = "planar" if patch.name in ("Floor", "Underside") else (
        "unfolding-reference" if patch.name in ("Exterior", "Interior") else "rolled-band")
    obj.data.materials.append(mat)
    for poly in mesh.polygons:
        poly.use_smooth = True
    for e in mesh.edges:
        pair = tuple(sorted(e.vertices))
        if pair in patch.sharp_edges:
            e.use_edge_sharp = True
    for name, data in (("Print", patch.uv), ("PaperDetail", patch.detail)):
        layer = mesh.uv_layers.new(name=name)
        coords = [c for face in data for uv in face for c in uv]
        layer.uv.foreach_set("vector", coords)
    # glTF writes UV in layer order, but Blender calculates its exported tangent on the active layer.
    # UV0 stays the print layout; tangent-space normals must use the basis of the baked UV1.
    mesh.uv_layers.active_index = 1
    mesh.uv_layers[1].active_render = True
    return obj


def select(objects, active):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = active


def joined(objects):
    select(objects, objects[0])
    if len(objects) > 1:
        bpy.ops.object.join()
    return bpy.context.view_layer.objects.active


def pressure_wrinkles(mesh):
    """在高模壁面施加短而不规则的成形皱痕，再连同纤维烘焙；不改变低模及其尺寸。"""
    n = len(mesh.vertices)
    points = np.empty(n * 3, dtype=np.float32)
    normals = np.empty_like(points)
    mesh.vertices.foreach_get("co", points)
    mesh.vertices.foreach_get("normal", normals)
    pos = points.reshape(n, 3)
    phase = np.arctan2(pos[:, 1], pos[:, 0])
    radius = np.hypot(pos[:, 1], pos[:, 0])
    height = pos[:, 2]
    top = float(height.max())
    delta = np.zeros(n, dtype=np.float32)
    rng = np.random.default_rng(5039)
    for _ in range(38):
        angle = rng.uniform(-math.pi, math.pi)
        z = top * rng.uniform(.09, .96)
        along = ((phase - angle + math.pi) % (2 * math.pi) - math.pi) * radius
        across = (height - z - rng.uniform(-.65, .65) * along) / rng.uniform(.00020, .00037)
        falloff = (along / rng.uniform(.0014, .0032)) ** 2 + across ** 2
        delta += rng.uniform(.000044, .000087) * (1 - across ** 2) * np.exp(-.5 * falloff)
    pos += normals.reshape(n, 3) * delta[:, None]
    mesh.vertices.foreach_set("co", points)
    mesh.update()


def detail_high(low, part, depth, amplitude, textures, cup):
    high = low.copy()
    high.data = low.data.copy()
    bpy.context.collection.objects.link(high)
    select([high], high)
    group = high.vertex_groups.new(name="Forming pressure")
    ztop = max(v.co.z for v in high.data.vertices)
    for v in high.data.vertices:
        z = v.co.z / max(ztop, .000001)
        # 褶尖附近的短皱和上口压印比宽纸面更明显。底板保持平整。
        weight = (.22 + .70 * math.exp(-((z - .89) / .13)**2) + .34 * math.exp(-((z - .17) / .13)**2))
        if part == "Rim":
            weight = .59
        if part in ("Floor", "Foot", "Underside"):
            weight = .065
        group.add([v.index], min(1, weight), "REPLACE")
    sub = high.modifiers.new("细分后的高模", "SUBSURF")
    sub.subdivision_type = "SIMPLE"
    sub.levels = depth
    sub.render_levels = depth
    bpy.ops.object.modifier_apply(modifier=sub.name)
    for texture, strength, weighted in ((textures[0], amplitude, True), (textures[1], .000095, False)):
        mod = high.modifiers.new(texture.name, "DISPLACE")
        mod.texture = texture
        mod.strength = strength
        mod.texture_coords = "LOCAL"
        if weighted:
            mod.vertex_group = group.name
        bpy.ops.object.modifier_apply(modifier=mod.name)
    if cup and part in ("Exterior", "Interior"):
        pressure_wrinkles(high.data)
    return high


def bake(objects, materials, out, shape):
    paper = [o for o in objects if o.type == "MESH" and o.parent.name == "Body"]
    image = bpy.data.images.new("PressedPaperNormal", width=768, height=768, alpha=False)
    image.colorspace_settings.name = "Non-Color"
    image.generated_color = (.5, .5, 1, 1)
    targets = []
    for name, mat in materials.items():
        nodes = mat.node_tree.nodes
        target = nodes.new("ShaderNodeTexImage")
        target.image = image
        nodes.active = target
        targets.append((mat, target))
    textures = []
    for name, size, depth in (("形成压皱", .0022, 2), ("纸纤维", .00043, 1)):
        tx = bpy.data.textures.new(name, "CLOUDS")
        tx.noise_scale = size
        tx.noise_depth = depth
        textures.append(tx)
    lows = []
    highs = []
    for i, original in enumerate(paper):
        low = original.copy()
        low.data = original.data.copy()
        bpy.context.collection.objects.link(low)
        low.parent = None
        # 分开烘焙相邻曲面，防止隔着薄纸投射到另一侧。原物体留在原点。
        low.location.x = (i + 1) * .32
        low.data.uv_layers.active_index = 1
        low.data.uv_layers[1].active_render = True
        part = original["surface"]
        depth = 1 if part == "Rim" else 3 if part in ("Exterior", "Interior", "Floor", "Underside") else 2
        high = detail_high(low, part, depth, .00030 if shape != "box" else .00023, textures, shape != "box")
        lows.append(low)
        highs.append(high)
    low = joined(lows)
    high = joined(highs)
    print("BAKE", shape, len(low.data.polygons), "low faces /", len(high.data.polygons), "high faces", flush=True)
    select([high, low], low)
    result = bpy.ops.object.bake(type="NORMAL", normal_space="TANGENT", use_selected_to_active=True,
         uv_layer="PaperDetail", cage_extrusion=.00032, max_ray_distance=.00072, margin=4,
         use_clear=True, target="IMAGE_TEXTURES")
    if "FINISHED" not in result:
        raise RuntimeError("Cycles 法线烘焙失败")
    # Z 形回折靠得很近。遇到射线命中另一层背面的像素，用相邻有效法线补齐；
    # 层叠、卷管和锐边由实体网格表现，贴图只保留微表面斜率。
    pixels = np.empty(4 * image.size[0] * image.size[1], dtype=np.float32)
    image.pixels.foreach_get(pixels)
    pixels = pixels.reshape((image.size[1], image.size[0], 4))
    normals = pixels[:, :, :3] * 2 - 1
    valid = (normals[:, :, 2] > .62)
    for _ in range(5):
        if valid.all():
            break
        total = np.zeros_like(normals)
        count = np.zeros_like(valid, dtype=np.int16)
        for axis, step in ((0, -1), (0, 1), (1, -1), (1, 1)):
            trusted = np.roll(valid, step, axis)
            count += trusted
            total += np.roll(normals, step, axis) * trusted[:, :, None]
        fill = (~valid) & (count > 0)
        normals[fill] = total[fill] / count[fill, None]
        valid |= fill
    normals[~valid] = (0, 0, 1)
    normals /= np.maximum(np.linalg.norm(normals, axis=2, keepdims=True), 1e-8)
    pixels[:, :, :3] = normals * .5 + .5
    image.pixels.foreach_set(pixels.ravel())
    image.update()
    image.filepath_raw = str(out)
    image.file_format = "PNG"
    image.save()
    # 导出器直接使用原始 PNG，避免颜色空间往返。
    baked = bpy.data.images.load(str(out), check_existing=False)
    baked.name = "PressedPaperBaked"
    baked.colorspace_settings.name = "Non-Color"
    for mat, target in targets:
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        target.image = baked
        uv = nodes.new("ShaderNodeUVMap")
        uv.uv_map = "PaperDetail"
        normal = nodes.new("ShaderNodeNormalMap")
        normal.uv_map = "PaperDetail"
        normal.inputs["Strength"].default_value = (.74 if shape == "box" else
            {"PaperExterior": .55, "PaperLining": .32, "RolledEdge": .22}[mat.name])
        links.new(uv.outputs["UV"], target.inputs["Vector"])
        links.new(target.outputs["Color"], normal.inputs["Color"])
        links.new(normal.outputs["Normal"], nodes.get("Principled BSDF").inputs["Normal"])
    for o in (high, low):
        bpy.data.objects.remove(o, do_unlink=True)


def create(spec, variant, out):
    configure()
    appearance = spec["modelAppearance"]
    sample = next(c for c in spec["colors"] if fact(c, "name") == appearance["sampleColor"])
    materials = make_materials(fact(sample, "hex") or sample["display"]["hex"], fact(variant["body"], "coating")["en"] == "PET")
    blank = spec.get("blank")
    if blank and blank["variant"] == variant["id"]:
        from round_blank import BlankForm
        form = BlankForm(variant["body"], appearance, spec["shape"], blank)
    else:
        form = Form(variant["body"], appearance, spec["shape"])
    parent = bpy.data.objects.new("Body", None)
    bpy.context.collection.objects.link(parent)
    objects = [parent, *(object_for(p, parent, materials[p.material]) for p in form.body())]
    if blank and blank["variant"] == variant["id"]:
        for obj in objects[1:]:
            obj["uvLayout"] = "circular-paper-blank"
        parent["blankDiameterMm"] = blank["diameterMm"]["value"]
    output = out / spec["slug"]
    output.mkdir(parents=True, exist_ok=True)
    bake(objects, materials, output / (variant["id"] + "-normal.png"), spec["shape"])
    select(objects, objects[0])
    target = output / (variant["id"] + ".glb")
    bpy.ops.export_scene.gltf(filepath=str(target), use_selection=True, export_format="GLB",
        export_image_format="AUTO", export_texcoords=True, export_normals=True, export_tangents=True,
        export_meshopt_compression_enable=False,
        export_yup=True, export_extras=True, export_animations=False, export_cameras=False, export_lights=False)
    if not target.is_file():
        raise RuntimeError("缺少原生 GLB " + str(target))
    print("EXPORTED", spec["slug"], variant["id"], target.stat().st_size, flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--specs", required=True, type=Path)
    ap.add_argument("--output", required=True, type=Path)
    ap.add_argument("--only")
    args = ap.parse_args(sys.argv[sys.argv.index("--") + 1:])
    for f in sorted(args.specs.glob("*.json")):
        spec = json.loads(f.read_text(encoding="utf8"))
        if not spec.get("modelAppearance") or (args.only and args.only != spec["slug"]):
            continue
        if f.stem != spec["slug"]:
            raise ValueError("资料名不一致")
        for variant in spec["variants"]:
            create(spec, variant, args.output.resolve())


if __name__ == "__main__":
    main()
