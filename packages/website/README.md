# [gl-transitions.com](https://gl-transitions.com) source code

## Commands

**IMPORTANT: to run at top level of this repository**.

### Run it locally

```
pnpm install
pnpm dev
```

### Build for production

```
pnpm build-website
```

### Generate Open Graph images

The `OG images` workflow renders them into the `og-images` GitHub release, which the website build downloads. They are never committed. To render locally (needs headless-gl, existing images are kept unless `--force`):

```
pnpm build
pnpm --filter og-images start
```
