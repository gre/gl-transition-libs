[![CI](https://github.com/gre/gl-transition-libs/actions/workflows/ci.yml/badge.svg)](https://github.com/gre/gl-transition-libs/actions/workflows/ci.yml)

<img src=".github/images/demo-1.gif" alt="GL Transition demo: animated transition effect between two photos" width="256" /><img src=".github/images/demo-2.gif" alt="GL Transition demo: a desert road photo transitioning to another scene" width="256" /><img src=".github/images/demo-3.gif" alt="GL Transition demo: animated shader transition between two photos" width="256" />

This repository hosts multiple packages for [gl-transitions](https://github.com/gl-transitions/gl-transitions).

- [gl-transition](packages/gl-transition): a light function to render a GL Transition frame with a WebGLRenderingContext.
- [regl-transition](packages/regl-transition): a function to render a GL Transition with a regl context.
- [react-gl-transition](packages/react-gl-transition): a React component to render a GL Transition in [gl-react](https://github.com/gre/gl-react) v6.
- [gl-transition-utils](packages/gl-transition-utils): GLSL transform, validation and WebGL compiler utilities.
- [gl-transition-scripts](packages/gl-transition-scripts): CLI tools (`gl-transition-transform`, `gl-transition-render`) using headless-gl.
- [website](packages/website): [gl-transitions.com](https://gl-transitions.com) source code. It automatically gets redeployed from the `master` branch via Vercel.
- [regl-transition-example](packages/regl-transition-example): example for regl-transition.

## Development

Requirements: Node 20 or 22 LTS and [pnpm](https://pnpm.io). [headless-gl](https://github.com/stackgl/headless-gl) currently fails to compile against newer Node headers (e.g. Node 25), so stick to an LTS — a `.prototools` file pins Node 22 for [proto](https://moonrepo.dev/proto) users.

```sh
pnpm install
pnpm build          # build all packages (tsdown + vite)
pnpm test           # unit tests (vitest) + CLI smoke test (needs headless-gl)
pnpm typecheck
pnpm dev            # run the website locally (vite)
```

## Releasing

Releases are managed with [Changesets](https://github.com/changesets/changesets): add a changeset with `pnpm changeset`, merge to `master`, and the release workflow opens a version PR / publishes to npm via [trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC — no token; each package declares this repo's `release.yml` as trusted publisher on npmjs.com).

## Website deployment (Vercel + gl-transitions.com)

The website deploys on [Vercel](https://vercel.com) (project connected to this repo; the domain lives on Vercel DNS). `vercel.json` scopes the build to the website subtree — `pnpm install --filter website...` skips `gl-transition-scripts` and its headless-gl native build, which the Vercel image cannot compile.

## Kudos

**Libraries**

- [React](https://react.dev) and [Vite](https://vite.dev)
- [headless-gl](https://github.com/stackgl/headless-gl) and bunch of other libs around [stackgl](https://github.com/stackgl/headless-gl).
- [gl-react](https://github.com/gre/gl-react)
- [regl](https://github.com/regl-project/regl)

**Services**

- [GitHub Actions](https://github.com/features/actions) for CI and npm releases.
- [Vercel](https://vercel.com) for hosting the website.
- [Github](https://github.com) itself, for being a platform for hosting [gl-transitions](https://github.com/gl-transitions/gl-transitions)

**Others**

- [unsplash.com](https://unsplash.com/) for the images
