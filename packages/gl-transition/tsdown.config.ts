import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    cjsDefault: false,
  },
  {
    // self-contained ESM for browsers/CDNs (gl-shader bundled, no bare imports)
    entry: { browser: "src/index.ts" },
    format: ["esm"],
    dts: false,
    deps: { alwaysBundle: ["gl-shader"] },
    minify: true,
  },
]);
