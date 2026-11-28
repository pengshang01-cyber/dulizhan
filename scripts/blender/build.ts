import { spawnSync } from "node:child_process";
import {
  mkdir,
  readFile,
  readdir,
  writeFile,
  mkdtemp,
  rm,
  rename,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseProductTechnicalSpec } from "../../src/lib/product-technical-schema.ts";
import { compressModel } from "./compress.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));
const work = join(root, ".astro", "model-studio-blender");
const input = join(root, "data", "product-specs");
async function blenderExecutable() {
  if (process.env.BLENDER_PATH) return process.env.BLENDER_PATH;
  if (process.platform === "win32") {
    const dir = join(
      process.env.ProgramFiles ?? "C:/Program Files",
      "Blender Foundation",
    );
    if (existsSync(dir)) {
      const versions = (await readdir(dir)).sort((a, b) =>
        b.localeCompare(a, "en", { numeric: true }),
      );
      for (const version of versions) {
        const file = join(dir, version, "blender.exe");
        if (/^Blender [\d.]+$/.test(version) && existsSync(file)) return file;
      }
    }
  }
  return "blender";
}
await mkdir(work, { recursive: true });
const config = join(work, "settings");
await mkdir(config, { recursive: true });
const executable = await blenderExecutable();
const env = {
  ...process.env,
  PYTHONHASHSEED: "0",
  PYTHONDONTWRITEBYTECODE: "1",
  PYTHONUTF8: "1",
  BLENDER_USER_RESOURCES: config,
};
const modelScript = join(root, "scripts", "blender", "model.py");
const stage = await mkdtemp(join(work, "bake-"));
try {
  // Adjacent UV islands share bake padding. A single bake worker gives those edge pixels a stable order.
  const args = [
    "--background",
    "--factory-startup",
    "--disable-autoexec",
    "--threads",
    "1",
    "--python-exit-code",
    "1",
    "--python",
    modelScript,
    "--",
    "--specs",
    input,
    "--output",
    stage,
  ];
  console.log("Blender:", executable);
  const run = spawnSync(executable, args, {
    cwd: root,
    env,
    stdio: "inherit",
    windowsHide: true,
  });
  if (run.error || run.status !== 0)
    throw new Error("Blender 后台建模失败，请检查 BLENDER_PATH 和构建日志。", {
      cause: run.error,
    });
  const verified: { from: string; to: string }[] = [];
  for (const name of (await readdir(input)).sort()) {
    if (name === "schema.json" || !name.endsWith(".json")) continue;
    const spec = parseProductTechnicalSpec(
      JSON.parse(await readFile(join(input, name), "utf8")),
    );
    if (!spec.modelAppearance) continue;
    for (const v of spec.variants) {
      const output = join(spec.slug, v.id + ".glb"),
        from = join(stage, output);
      const bytes = await compressModel(await readFile(from));
      if (
        bytes.length > 3_000_000 ||
        bytes.toString("ascii", 0, 4) !== "glTF" ||
        bytes.readUInt32LE(8) !== bytes.length
      )
        throw new Error("GLB 格式或体积不符合要求：" + output);
      const gltf = JSON.parse(
        bytes.toString("utf8", 20, 20 + bytes.readUInt32LE(12)),
      );
      if (
        !gltf.extensionsRequired?.includes("EXT_meshopt_compression") ||
        !gltf.materials.some(
          (m: { normalTexture?: { texCoord: number } }) =>
            m.normalTexture?.texCoord === 1,
        )
      )
        throw new Error("缺少压缩网格或独立法线 UV：" + output);
      verified.push({ from, to: resolve(root, "public", "models", output) });
      await writeFile(from, bytes);
      console.log(output, bytes.length + " B");
    }
  }
  for (const { from, to } of verified) {
    await mkdir(dirname(to), { recursive: true });
    await rename(from, to);
  }
} finally {
  await rm(stage, { recursive: true, force: true });
}
