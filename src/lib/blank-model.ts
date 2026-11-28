import * as THREE from "three";
import { createStudio } from "./model-studio";
import { canvasOf } from "./blank-canvas";
import type { Side } from "./blank-design";
export async function printModel(
  canvas: HTMLCanvasElement,
  modelUrl: string,
  art: HTMLCanvasElement,
) {
  const viewer = createStudio(canvas);
  try {
    await viewer.load(modelUrl);
  } catch (error) {
    viewer.dispose();
    throw error;
  }
  const texture = new THREE.CanvasTexture(art);
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(
    8,
    viewer.renderer.capabilities.getMaxAnisotropy(),
  );
  const originals = new Map<THREE.Mesh, THREE.MeshPhysicalMaterial>();
  viewer.model!.traverse((o) => {
    if (o instanceof THREE.Mesh) originals.set(o, o.material);
  });
  const copies: THREE.MeshPhysicalMaterial[] = [];
  function printSide(side: Side) {
    for (const m of copies) m.dispose();
    copies.length = 0;
    for (const [mesh, base] of originals) {
      const surface = mesh.userData.surface ?? mesh.name.split(".").at(-1);
      const use =
        side === "outside"
          ? ["Exterior", "Underside", "Foot"]
          : ["Interior", "Floor"];
      if (surface !== "Rim" && !use.includes(surface)) {
        mesh.material = base;
        continue;
      }
      const mat = base.clone();
      copies.push(mat);
      mesh.material = mat;
      mat.map = texture;
      mat.color.set(0xffffff);
      if (surface === "Rim") {
        // UV1 的两半对应卷纸正反两面；纸纹仍独立取样。
        mat.onBeforeCompile = (shader) => {
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <map_fragment>",
            "if (vNormalMapUv.y " +
              (side === "outside" ? ">=" : "<") +
              " 0.197) {\n#include <map_fragment>\n} else {diffuseColor.rgb *= vec3(" +
              base.color.toArray().join(",") +
              ");}",
          );
        };
        mat.customProgramCacheKey = () => "rolled-" + side;
      }
      mat.needsUpdate = true;
    }
    viewer.render();
  }
  function refresh() {
    texture.needsUpdate = true;
    viewer.render();
  }
  function capture() {
    const p = viewer.camera.position.clone(),
      up = viewer.camera.up.clone(),
      target = viewer.controls.target.clone();
    const proof: HTMLCanvasElement[] = [];
    try {
      for (const dir of [
        [0, 0, 1],
        [1, Math.SQRT2, 1],
        [0, 1, 0],
      ]) {
        viewer.setView(dir[0]!, dir[1]!, dir[2]!);
        const out = canvasOf(760);
        const ctx = out.getContext("2d")!,
          src = viewer.renderer.domElement,
          side = Math.min(src.width, src.height);
        ctx.drawImage(
          src,
          (src.width - side) / 2,
          (src.height - side) / 2,
          side,
          side,
          0,
          0,
          760,
          760,
        );
        proof.push(out);
      }
    } finally {
      viewer.controls.target.copy(target);
      viewer.camera.position.copy(p);
      viewer.camera.up.copy(up);
      viewer.controls.update();
      viewer.render();
    }
    return proof;
  }
  return {
    printSide,
    refresh,
    capture,
    reset: viewer.reset,
    setView: viewer.setView,
    active: viewer.setActive,
    dispose() {
      for (const [mesh, mat] of originals) mesh.material = mat;
      copies.forEach((m) => m.dispose());
      texture.dispose();
      viewer.dispose();
    },
  };
}
