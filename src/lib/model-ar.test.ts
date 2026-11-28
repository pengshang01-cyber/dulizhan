import { afterEach, expect, it, vi } from "vitest";
import {
  Group,
  Matrix4,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  Scene,
} from "three";
import { placeInSpace } from "./model-ar";
import type { ModelStudio } from "./model-studio";

afterEach(() => vi.unstubAllGlobals());
it("places the selected metre-scale object at a surface hit and resumes orbit on session end", async () => {
  const source = { cancel: vi.fn() };
  const space = {};
  const session = Object.assign(new EventTarget(), {
    requestReferenceSpace: vi.fn().mockResolvedValue(space),
    requestHitTestSource: vi.fn().mockResolvedValue(source),
  });
  const requestSession = vi.fn().mockResolvedValue(session);
  vi.stubGlobal("navigator", { xr: { requestSession } });
  let loop: ((time: number, frame: unknown) => void) | null = null;
  let rendered: Scene | undefined;
  const renderer = {
    xr: {
      enabled: false,
      setSession: vi.fn(),
      setReferenceSpaceType: vi.fn(),
      getReferenceSpace: () => space,
    },
    setAnimationLoop: (callback: typeof loop) => {
      loop = callback;
    },
    render: (scene: Scene) => {
      rendered = scene;
    },
  };
  const model = new Group();
  model.name = "MeasuredProduct";
  model.add(
    new Mesh(new BoxGeometry(0.187, 0.06, 0.087), new MeshStandardMaterial()),
  );
  const studio = { model, scene: new Scene(), renderer, setActive: vi.fn() };
  await placeInSpace(studio as unknown as ModelStudio);
  expect(requestSession).toHaveBeenCalledWith("immersive-ar", {
    requiredFeatures: ["hit-test"],
  });
  const nextFrame = loop as unknown as (time: number, frame: unknown) => void;
  const position = new Matrix4().makeTranslation(0.34, 0.56, -0.78);
  nextFrame(0, { getHitTestResults: () => [] });
  const object = rendered!.getObjectByName(model.name)!;
  session.dispatchEvent(new Event("select"));
  expect(object.visible).toBe(false);
  nextFrame(16, {
    getHitTestResults: () => [
      { getPose: () => ({ transform: { matrix: position.toArray() } }) },
    ],
  });
  session.dispatchEvent(new Event("select"));
  expect(object.visible).toBe(true);
  expect(object.matrix.toArray()).toEqual(position.toArray());
  expect(object.matrix.getMaxScaleOnAxis()).toBe(1);
  expect(studio.model.position.toArray()).toEqual([0, 0, 0]);
  session.dispatchEvent(new Event("end"));
  expect(source.cancel).toHaveBeenCalledOnce();
  expect(studio.setActive.mock.calls).toEqual([[false], [true]]);
  expect(loop).toBe(null);
});
