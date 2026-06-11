# gl-transition-scripts

## 2.0.1

### Patch Changes

- d9dc19e: Replace `get-pixels` with a minimal internal PNG/JPEG loader (pngjs + jpeg-js + native fetch). This removes the deprecated `request` dependency chain and its security advisories (form-data, qs, uuid, tough-cookie). PNG, JPEG, http(s) URLs and data URIs are still supported; GIF input is no longer accepted (it previously decoded to a 4D array that the texture pipeline rejected anyway).
- Updated dependencies [fa34123]
  - gl-transition@2.1.0

## 2.0.0

### Major Changes

- d08f57e: Modernization to 2026 standards. Breaking changes across all packages:

  - **TypeScript**: all packages are now written in TypeScript and ship their own type definitions (Flow types removed).
  - **Dual ESM + CJS**: packages now have an `exports` map with both ESM (`import`) and CJS (`require`) entry points, built with tsdown.
  - **Node >= 18** is required (`engines` field added).
  - **react-gl-transition**: peer dependencies are now `gl-react@^6.0.0` and `react@>=18` (was gl-react 3 / React 15). The component no longer uses string refs; the imperative `setProgress` API (via `onConnectSizeComponentRef`) is unchanged.
  - **regl-transition**: `regl` is now a peer dependency (`>=1.3.0 <3`) instead of a dependency — you pass the regl instance anyway. regl 2.x is supported.
  - **gl-transition-utils**: deep imports like `gl-transition-utils/lib/transformSource` no longer exist. Use named imports from the package root instead: `import { transformSource, createWebGLCompiler, transformOldGLSLTransition, TransitionQueryString, acceptedLicenses, typeInfos } from "gl-transition-utils"`. The `performance-now` dependency was replaced with the native `performance.now()`.
  - **gl-transition-scripts**: CLIs are now ESM, built on commander 14 and headless `gl` 8 (Node >= 18).

### Patch Changes

- Updated dependencies [d08f57e]
  - gl-transition@2.0.0
  - gl-transition-utils@2.0.0
