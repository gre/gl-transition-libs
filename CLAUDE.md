# gl-transition-libs

pnpm monorepo for the gl-transitions.com libraries and website.

- Node 20/22 LTS only — headless-gl fails to compile on newer Node (repo pins 22 via `.prototools`).
- `pnpm install && pnpm build` then `pnpm test` (vitest + CLI smoke test needing headless-gl), `pnpm typecheck`, `pnpm dev` (website).
- Published packages (`gl-transition`, `regl-transition`, `react-gl-transition`, `gl-transition-utils`, `gl-transition-scripts`): TypeScript, built with tsdown to dual ESM+CJS; exports maps are hand-written and must match dist filenames (`.mjs`/`.cjs`/`.d.mts`/`.d.cts`). regl-transition's CJS is `module.exports = fn` with hand-kept `index.d.cts`.
- Website (`packages/website`): Vite + React 19 + react-router 7 + gl-react v6, plain `.jsx` (no TS). Deployed to GitHub Pages (gl-transitions.com) on master.
- Releases via Changesets (`pnpm changeset`); majors documented in `.changeset/`.
