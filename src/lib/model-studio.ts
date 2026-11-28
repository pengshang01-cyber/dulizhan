import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// 45° azimuth and 45° elevation. The catalogue poster uses the same reset pose.
const initialView = new THREE.Vector3(1, Math.SQRT2, 1).normalize();
const vertical = new THREE.Vector3(0, 1, 0);
function disposeModel(model: THREE.Object3D) {
  const materials = new Set<THREE.Material>(),
    textures = new Set<THREE.Texture>();
  model.traverse((item) => {
    if (!(item instanceof THREE.Mesh)) return;
    item.geometry.dispose();
    for (const m of Array.isArray(item.material)
      ? item.material
      : [item.material]) {
      materials.add(m);
      for (const value of Object.values(m))
        if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => t.dispose());
}
export function createStudio(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.94;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f2ee);
  const pmrem = new THREE.PMREMGenerator(renderer),
    room = new RoomEnvironment();
  // 影棚条形柔光箱与低位反光板让卷管与内壁随旋转掠过高光。与背景一起预滤成一个环境贴图。
  const stripGeometry = new THREE.PlaneGeometry();
  const stripMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(15.5, 15.0, 14.3),
    side: THREE.DoubleSide,
  });
  for (const [x, y, z, w, h] of [
    [-5.8, 11, -5.8, 3.0, 9.0],
    [1.6, 15, 0.5, 2.8, 9.0],
    [3.2, 0.8, 4.5, 1.3, 3.5],
  ] as const) {
    const strip = new THREE.Mesh(stripGeometry, stripMaterial);
    strip.position.set(x, y, z);
    strip.scale.set(w, h, 1);
    strip.lookAt(0, 3.5, 0);
    room.add(strip);
  }
  const env = pmrem.fromScene(room, 0.012);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.58;
  room.dispose();
  pmrem.dispose();
  const ambient = new THREE.HemisphereLight(0xfffaf3, 0xf9f7f3, 0.82);
  const light = new THREE.DirectionalLight(0xfff7eb, 2.05);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.normalBias = 0.0001;
  const fill = new THREE.DirectionalLight(0xe7f1ff, 0.55);
  fill.position.set(2.4, 1.5, -2.8);
  // 模拟影棚下方白色反光板，转到底部时仍可分辨白纸与卷起的脚边。
  const bounce = new THREE.DirectionalLight(0xfffcf7, 1.45);
  bounce.position.set(-0.32, -2.8, 0.38);
  scene.add(ambient, light, light.target, fill, bounce);
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(64, 64, 1, 64, 64, 63);
  grad.addColorStop(0, "rgba(82,65,51,.23)");
  grad.addColorStop(0.45, "rgba(93,74,58,.12)");
  grad.addColorStop(1, "rgba(93,74,58,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const shadowMap = new THREE.CanvasTexture(shadowCanvas);
  shadowMap.colorSpace = THREE.SRGBColorSpace;
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowMap,
    transparent: true,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.00035;
  scene.add(shadow);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.0008, 5);
  camera.position.copy(initialView).multiplyScalar(0.34);
  const controls = new TrackballControls(camera, canvas);
  controls.noPan = true;
  controls.staticMoving = true;
  controls.rotateSpeed = 2.5;
  controls.zoomSpeed = 1.2;
  // Arrow keys work only when the canvas has focus; leave letters free for the inquiry form.
  controls.keys.fill("");
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  let model: THREE.Group | undefined;
  let ticket = 0,
    frame = 0,
    engaged = false,
    auto = false,
    active = true,
    disposed = false,
    previous = 0;
  let focus = new THREE.Vector3(0, 0.03, 0),
    distance = 0.33;
  const render = () => {
    if (!disposed && active && !renderer.xr.isPresenting) {
      const below =
        (controls.target.y - camera.position.y) /
        camera.position.distanceTo(controls.target);
      bounce.intensity = 1.15 + 4.3 * THREE.MathUtils.smoothstep(below, 0, 0.9);
      renderer.render(scene, camera);
    }
  };
  function tick(time: number) {
    frame = 0;
    if (!active || disposed || renderer.xr.isPresenting) return;
    if (auto && !engaged && previous) {
      const delta = Math.min((time - previous) / 1000, 0.05) * 0.42;
      camera.position
        .sub(controls.target)
        .applyAxisAngle(vertical, delta)
        .add(controls.target);
      camera.up.applyAxisAngle(vertical, delta);
    }
    previous = time;
    controls.update();
    render();
    if (auto || engaged) invalidate();
  }
  function invalidate() {
    if (!frame && active && !disposed && !renderer.xr.isPresenting)
      frame = requestAnimationFrame(tick);
  }
  controls.addEventListener("start", () => {
    engaged = true;
    invalidate();
  });
  controls.addEventListener("end", () => {
    engaged = false;
    invalidate();
  });
  const resize = () => {
    const { width, height: h } = canvas.getBoundingClientRect();
    if (width < 2 || h < 2) return;
    renderer.setSize(width, h, false);
    camera.aspect = width / h;
    camera.updateProjectionMatrix();
    controls.handleResize();
    invalidate();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  function setView(x: number, y: number, z: number) {
    const direction = new THREE.Vector3(x, y, z).normalize();
    controls.target.copy(focus);
    camera.up.set(0, 1, 0);
    if (Math.abs(direction.y) > 0.998)
      camera.up.set(0, 0, direction.y > 0 ? -1 : 1);
    camera.position.copy(focus).addScaledVector(direction, distance);
    controls.update();
    render();
  }
  function reset() {
    controls.reset();
    setView(initialView.x, initialView.y, initialView.z);
  }
  function zoom(factor: number) {
    const offset = camera.position.clone().sub(controls.target);
    offset.setLength(
      THREE.MathUtils.clamp(
        offset.length() * factor,
        controls.minDistance,
        controls.maxDistance,
      ),
    );
    camera.position.copy(controls.target).add(offset);
    controls.update();
    invalidate();
  }
  function keyboard(event: KeyboardEvent) {
    if (
      ![
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "+",
        "=",
        "-",
      ].includes(event.key)
    )
      return;
    event.preventDefault();
    if (event.key === "Home") {
      reset();
      return;
    }
    if (["+", "=", "-"].includes(event.key)) {
      zoom(event.key === "-" ? 1.16 : 1 / 1.16);
      return;
    }
    const offset = camera.position.clone().sub(controls.target);
    const axis =
      event.key === "ArrowUp" || event.key === "ArrowDown"
        ? new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
        : camera.up.clone().normalize();
    const angle =
      ((event.key === "ArrowUp" || event.key === "ArrowRight" ? 1 : -1) *
        Math.PI) /
      12;
    camera.position
      .copy(controls.target)
      .add(offset.applyAxisAngle(axis, angle));
    camera.up.applyAxisAngle(axis, angle);
    controls.update();
    invalidate();
  }
  canvas.addEventListener("keydown", keyboard);
  async function load(url: string) {
    const sequence = ++ticket;
    const next = (await loader.loadAsync(url)).scene;
    if (disposed || sequence !== ticket) {
      disposeModel(next);
      return false;
    }
    if (model) {
      scene.remove(model);
      disposeModel(model);
    }
    model = next;
    scene.add(model);
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const sphere = bounds.getBoundingSphere(new THREE.Sphere());
    focus = sphere.center.clone();
    distance =
      (sphere.radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2))) *
      0.96;
    const span = sphere.radius * 1.45;
    light.position
      .copy(focus)
      .add(new THREE.Vector3(-2.3, 3.5, 1.7).multiplyScalar(span));
    light.target.position.copy(focus);
    Object.assign(light.shadow.camera, {
      left: -span,
      right: span,
      top: span,
      bottom: -span,
      near: 0.001,
      far: span * 8,
    });
    light.shadow.camera.updateProjectionMatrix();
    model.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    controls.minDistance = distance * 0.35;
    controls.maxDistance = distance * 3.7;
    shadow.scale.set(size.x * 1.55, size.z * 1.55, 1);
    reset();
    return true;
  }
  function color(hex: string) {
    model?.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material.name === "PaperExterior")
        obj.material.color.set(hex);
    });
    invalidate();
  }
  function setActive(value: boolean) {
    active = value;
    controls.enabled = value;
    previous = 0;
    if (value) {
      resize();
      invalidate();
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }
  function dispose() {
    disposed = true;
    ticket++;
    cancelAnimationFrame(frame);
    observer.disconnect();
    canvas.removeEventListener("keydown", keyboard);
    controls.dispose();
    if (model) disposeModel(model);
    env.dispose();
    light.shadow.dispose();
    shadow.geometry.dispose();
    shadowMaterial.dispose();
    shadowMap.dispose();
    renderer.dispose();
  }
  return {
    renderer,
    scene,
    camera,
    controls,
    load,
    reset,
    zoom,
    color,
    setView,
    render,
    dispose,
    setActive,
    setAuto(value: boolean) {
      auto = value;
      previous = 0;
      invalidate();
    },
    get model() {
      return model;
    },
  };
}
export type ModelStudio = ReturnType<typeof createStudio>;
