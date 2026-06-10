import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  // v1.x published `module.exports = fn`; CJS types are hand-kept in index.d.cts
  cjsDefault: true,
});
