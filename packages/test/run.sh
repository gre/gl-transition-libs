#!/usr/bin/env bash
# Smoke test for gl-transition-scripts CLIs against a fixed set of
# known-good transitions (luma and displacement cover the sampler2D path).
set -euo pipefail
cd "$(dirname "$0")"

# invoked via node: pnpm can't link these bins at install time (dist/ is built after)
TRANSFORM=../gl-transition-scripts/dist/gl-transition-transform.mjs
RENDER=../gl-transition-scripts/dist/gl-transition-render.mjs

rm -rf tmp test_results.json test_render.png
mkdir -p tmp
for t in fade burn cube directionalwipe crosswarp luma displacement; do
  cp "node_modules/gl-transitions/transitions/$t.glsl" tmp/
done

node "$TRANSFORM" -d tmp -o test_results.json
test -s test_results.json

node "$RENDER" \
  -t tmp/fade.glsl \
  -i fixtures/1.jpg \
  -i fixtures/2.jpg \
  -w 128 -h 128 -p 0.4 -o test_render.png
test -s test_render.png

rm -rf tmp
echo "smoke test OK"
