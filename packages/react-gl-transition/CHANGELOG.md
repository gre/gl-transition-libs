# react-gl-transition

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
