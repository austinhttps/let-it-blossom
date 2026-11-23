import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "cherryblossom.global": "src/global.ts"
  },
  format: ["esm", "cjs", "iife"],
  globalName: "CherryBlossomPkg",
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : format === "cjs" ? ".cjs" : ".global.js"
    };
  },
  dts: true,
  clean: true,
  sourcemap: true,
  minify: true,
  target: "es2022"
});
