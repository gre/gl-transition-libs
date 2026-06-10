[![CI](https://github.com/gre/gl-transition-libs/actions/workflows/ci.yml/badge.svg)](https://github.com/gre/gl-transition-libs/actions/workflows/ci.yml)

<img src="https://camo.githubusercontent.com/c42ecc6197b0f51a106fb50723f9bc6d2e1f925c/687474703a2f2f692e696d6775722e636f6d2f74573331704a452e676966" /><img src="https://camo.githubusercontent.com/7e34cd12d5a9afa94f470395b04b0914c978ce01/687474703a2f2f692e696d6775722e636f6d2f555a5a727775552e676966" /><img src="https://camo.githubusercontent.com/0456d4ed8753fbce027f1174dc8b22da548eeade/687474703a2f2f692e696d6775722e636f6d2f654974426a33582e676966" />

This repository hosts multiple packages for [gl-transitions](https://github.com/gl-transitions/gl-transitions).

- [gl-transition](packages/gl-transition): a light function to render a GL Transition frame with a WebGLRenderingContext.
- [regl-transition](packages/regl-transition): a function to render a GL Transition with a regl context.
- [react-gl-transition](packages/react-gl-transition): a React component to render a GL Transition in [gl-react](https://github.com/gre/gl-react) v6.
- [gl-transition-utils](packages/gl-transition-utils): GLSL transform, validation and WebGL compiler utilities.
- [gl-transition-scripts](packages/gl-transition-scripts): CLI tools (`gl-transition-transform`, `gl-transition-render`) using headless-gl.
- [website](packages/website): [gl-transitions.com](https://gl-transitions.com) source code. It automatically gets redeployed from the `master` branch via GitHub Pages.
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

Releases are managed with [Changesets](https://github.com/changesets/changesets): add a changeset with `pnpm changeset`, merge to `master`, and the release workflow opens a version PR / publishes to npm (requires the `NPM_TOKEN` repo secret).

## Website deployment (GitHub Pages + gl-transitions.com)

The `deploy-website.yml` workflow builds the website and deploys it to GitHub Pages on every push to `master`. One-time setup:

1. Repo Settings → Pages → Source: "GitHub Actions". Set the custom domain to `gl-transitions.com` and enable "Enforce HTTPS" (the `CNAME` file is already in `packages/website/public/`).
2. DNS — the domain is currently on Vercel DNS (`ns1/ns2.vercel-dns.com`). In the Vercel dashboard (or wherever DNS ends up), point the apex to GitHub Pages:
   - `A` records for `gl-transitions.com` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www` → `gre.github.io`

## Kudos

**Libraries**

- [React](https://react.dev) and [Vite](https://vite.dev)
- [headless-gl](https://github.com/stackgl/headless-gl) and bunch of other libs around [stackgl](https://github.com/stackgl/headless-gl).
- [gl-react](https://github.com/gre/gl-react)
- [regl](https://github.com/regl-project/regl)

**Services**

- [GitHub Actions](https://github.com/features/actions) for CI, npm releases and website deployment.
- [GitHub Pages](https://pages.github.com) for hosting the website.
- [Github](https://github.com) itself, for being a platform for hosting [gl-transitions](https://github.com/gl-transitions/gl-transitions)

**Others**

- [unsplash.com](https://unsplash.com/) for the images
