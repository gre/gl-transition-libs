// Usage: pnpm --filter og-images start [--force] [TransitionName...]
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import createGL from "gl";
import createTransition from "gl-transition";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const website = path.join(here, "..", "website");
const outDir = path.join(website, "public", "og");
const transitions = createRequire(import.meta.url)(
  "gl-transitions/gl-transitions.json"
);

const W = 1200;
const H = 630;
const QUALITY = 75;
const MAX_BYTES = 150 * 1024;
const DEFAULT_IMAGE = "Cube";
const FROM = "raw/barley.jpg";
const TO = "raw/hBd6EPoQT2C8VQYv65ys_White_Sands.jpg";
const TEXTURE = "src/textures/luma/spiral-2.png";

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((a) => !a.startsWith("--"));

function decode(file) {
  const buf = fs.readFileSync(file);
  if (file.endsWith(".png")) return PNG.sync.read(buf);
  return jpeg.decode(buf, { useTArray: true, maxMemoryUsageInMB: 2048 });
}

// center-crop to cover W x H, box-filter downscale, rows bottom-up for GL
function cover({ width, height, data }) {
  const scale = Math.min(width / W, height / H);
  const ox = (width - W * scale) / 2;
  const oy = (height - H * scale) / 2;
  const out = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) {
    const sy0 = Math.floor(oy + y * scale);
    const sy1 = Math.max(sy0 + 1, Math.floor(oy + (y + 1) * scale));
    for (let x = 0; x < W; x++) {
      const sx0 = Math.floor(ox + x * scale);
      const sx1 = Math.max(sx0 + 1, Math.floor(ox + (x + 1) * scale));
      let r = 0, g = 0, b = 0, n = 0;
      for (let sy = sy0; sy < sy1; sy++) {
        for (let sx = sx0; sx < sx1; sx++) {
          const i = (sy * width + sx) * 4;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          n++;
        }
      }
      const o = ((H - 1 - y) * W + x) * 4;
      out[o] = r / n;
      out[o + 1] = g / n;
      out[o + 2] = b / n;
      out[o + 3] = 255;
    }
  }
  return out;
}

const gl = createGL(W, H, { preserveDrawingBuffer: true });
if (!gl) throw new Error("headless-gl context could not be created");

function texture(pixels) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return {
    shape: [W, H],
    bind(unit) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      return unit;
    },
  };
}

const images = path.join(website, "src", "images");
const from = texture(cover(decode(path.join(images, FROM))));
const to = texture(cover(decode(path.join(images, TO))));
const luma = texture(cover(decode(path.join(website, TEXTURE))));

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 4, 4, -1]), gl.STATIC_DRAW);
gl.viewport(0, 0, W, H);

const pixels = new Uint8Array(W * H * 4);
const flipped = Buffer.alloc(W * H * 4);

function render(t, file) {
  const paramsTypes = { ...t.paramsTypes };
  const params = {};
  for (const name of t.textures || []) paramsTypes[name] = "sampler2D";
  for (const key in paramsTypes) {
    if (paramsTypes[key] === "sampler2D") params[key] = luma;
  }
  const transition = createTransition(gl, { ...t, paramsTypes });
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  transition.draw(t.preview, from, to, W, H, params);
  gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  transition.dispose();
  const err = gl.getError();
  if (err !== gl.NO_ERROR) throw new Error("GL error " + err);
  for (let y = 0; y < H; y++) {
    flipped.set(pixels.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);
  }
  let jpg;
  // noisy frames compress badly: trade quality for size
  for (let q = QUALITY; q >= 45; q -= 10) {
    jpg = jpeg.encode({ data: flipped, width: W, height: H }, q).data;
    if (jpg.length <= MAX_BYTES) break;
  }
  fs.writeFileSync(file, jpg);
  return jpg.length;
}

fs.mkdirSync(outDir, { recursive: true });
const jobs = transitions.map((t) => [t, t.name + ".jpg"]);
jobs.push([transitions.find((t) => t.name === DEFAULT_IMAGE), "default.jpg"]);

let rendered = 0;
let failed = 0;
for (const [t, filename] of jobs) {
  if (only.length && !only.includes(t.name)) continue;
  const file = path.join(outDir, filename);
  if (!force && fs.existsSync(file)) continue;
  try {
    const size = render(t, file);
    rendered++;
    console.log(`${filename} ${(size / 1024).toFixed(0)}KB`);
  } catch (e) {
    failed++;
    console.error(`${filename} failed: ${e.message}`);
  }
}
console.log(`og-images: rendered ${rendered}, failed ${failed}`);
if (failed) process.exitCode = 1;
