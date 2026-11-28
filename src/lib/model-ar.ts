import * as THREE from "three";
import type { ModelStudio } from "./model-studio";

export async function quickLookUrl(model: THREE.Object3D) {
  const { USDZExporter } =
    await import("three/addons/exporters/USDZExporter.js");
  const group = new THREE.Group();
  group.add(model.clone(true));
  const bytes = await new USDZExporter().parseAsync(group, {
    maxTextureSize: 256,
  });
  return URL.createObjectURL(new Blob([bytes], { type: "model/vnd.usdz+zip" }));
}
export async function placeInSpace(studio: ModelStudio) {
  if (!studio.model || !navigator.xr) throw new Error("AR unavailable");
  const session = await navigator.xr.requestSession("immersive-ar", {
    requiredFeatures: ["hit-test"],
  });
  const { renderer } = studio;
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera();
  scene.environment = studio.scene.environment;
  for (const item of studio.scene.children)
    if (item instanceof THREE.Light) scene.add(item.clone());
  const placed = studio.model.clone(true);
  placed.visible = false;
  placed.matrixAutoUpdate = false;
  scene.add(placed);
  const marker = new THREE.Mesh(
    new THREE.RingGeometry(0.024, 0.026, 48).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
  );
  marker.matrixAutoUpdate = false;
  marker.visible = false;
  scene.add(marker);
  let source: XRHitTestSource | undefined;
  studio.setActive(false);
  const finish = () => {
    source?.cancel();
    renderer.setAnimationLoop(null);
    renderer.xr.enabled = false;
    marker.geometry.dispose();
    marker.material.dispose();
    studio.setActive(true);
  };
  session.addEventListener("end", finish, { once: true });
  try {
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local");
    await renderer.xr.setSession(session);
    const viewer = await session.requestReferenceSpace("viewer");
    source = await session.requestHitTestSource!({ space: viewer });
    if (!source) throw new Error("Hit testing unavailable");
    session.addEventListener("select", () => {
      if (!marker.visible) return;
      placed.matrix.copy(marker.matrix);
      placed.matrixWorldNeedsUpdate = true;
      placed.visible = true;
    });
    renderer.setAnimationLoop((_time, frame) => {
      const reference = renderer.xr.getReferenceSpace();
      const pose =
        reference && frame?.getHitTestResults(source!)[0]?.getPose(reference);
      marker.visible = Boolean(pose);
      if (pose) {
        marker.matrix.fromArray(pose.transform.matrix);
        marker.matrixWorldNeedsUpdate = true;
      }
      renderer.render(scene, camera);
    });
  } catch (error) {
    await session.end();
    throw error;
  }
}
