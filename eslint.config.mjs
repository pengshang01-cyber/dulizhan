import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([".astro/", "dist/"]),
  { files: ["**/*.{js,mjs,cjs}"], extends: [js.configs.recommended] },
  { files: ["**/*.ts"], extends: [tseslint.configs.recommended] },
  astro.configs.recommended,
);
