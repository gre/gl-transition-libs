import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/gl-transition-transform.ts", "src/gl-transition-render.ts"],
  format: ["esm"],
  dts: false,
});
