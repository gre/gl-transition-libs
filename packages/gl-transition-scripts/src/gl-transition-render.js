//@flow
import program from "commander";
import createShader from "gl-shader";
import createTexture from "gl-texture2d";
import fs from "fs";
import path from "path";
import createGL from "gl";
import ndarray from "ndarray";
import savePixels from "save-pixels";
import getPixels from "./getPixels";
import readFile from "./readFile";
import transformSource from "gl-transition-utils/lib/transformSource";
import TransitionQueryString
  from "gl-transition-utils/lib/TransitionQueryString";

function collect(val, memo) {
  memo.push(val);
  return memo;
}

program
  .version("0.0.1")
  .option(
    "-t, --transition <file.glsl>",
    "add a transition to use (can be used multiple times)",
    collect,
    []
  )
  .option(
    "-i, --images <images>",
    "add an image to use for the transition (use multiple times)",
    collect,
    []
  )
  .option("-w, --width <width>", "width in pixels", parseInt)
  .option("-h, --height <height>", "height in pixels", parseInt)
  .option(
    "-f, --frames [nb]",
    "number of frames to render for each transition",
    parseInt
  )
  .option(
    "-d, --delay [nb]",
    "number of frames to pause after each transition",
    parseInt,
    0
  )
  .option("-p, --progress [p]", "only render one frame", parseFloat, 0.4)
  .option(
    "-g, --generic-texture [image.png]",
    "provide a generic sampler2D image to use as default uniform sampler2D"
  )
  .option(
    "-o, --out <directory|out.png>",
    "a folder to create with the images OR the path of the image to save (if using progress). use '-' for stdout"
  )
  .parse(process.argv);

const {
  frames,
  delay,
  progress,
  transition,
  out,
  width,
  height,
  images,
  genericTexture,
} = program;

if (
  !width ||
  !height ||
  !images ||
  images.length === 0 ||
  !transition ||
  transition.length === 0 ||
  !out
) {
  program.outputHelp();
  process.exit(1);
}

const gl = createGL(width, height, { preserveDrawingBuffer: true });
if (!gl) throw new Error("GL validation context could not be created");

gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

const data = new Uint8Array(width * height * 4);
const pixels = ndarray(data, [height, width, 4])
  .transpose(1, 0, 2)
  .step(1, -1, 1);

const VERTEX_SHADER = `attribute vec2 _p;
varying vec2 uv;
void main() {
gl_Position = vec4(_p,0.0,1.0);
uv = vec2(0.5, 0.5) * (_p+vec2(1.0, 1.0));
}`;

const extraImages = genericTexture ? [genericTexture] : [];

function readTransition(str) {
  const [filename, query] = str.split("?");
  const params = query ? TransitionQueryString.parse(query) : {};
  return readFile(filename).then(glsl => {
    const res = transformSource("file.glsl", glsl);
    Object.keys(res.data.paramsTypes).forEach(key => {
      if (
        res.data.paramsTypes[key] === "sampler2D" &&
        typeof params[key] === "string" &&
        !extraImages.includes(params[key])
      ) {
        extraImages.push(params[key]);
      }
    });
    if (res.errors.length > 0) {
      throw new Error(
        "transition have errors:\n" + res.errors.map(e => e.message).join("\n")
      );
    }
    return { params, ...res };
  });
}

Promise.all([
  Promise.all(transition.map(readTransition)),
  Promise.all(images.map(getPixels)),
  Promise.all(extraImages.map(getPixels)),
])
  .then(([transitions, images, extraImages]) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 4, 4, -1]), // see a-big-triangle
      gl.STATIC_DRAW
    );
    gl.viewport(0, 0, width, height);

    const textures = images.map(pixels => {
      const t = createTexture(gl, pixels);
      t.minFilter = gl.LINEAR;
      t.magFilter = gl.LINEAR;
      return t;
    });
    const extraTextures = extraImages.map(pixels => {
      const t = createTexture(gl, pixels);
      t.minFilter = gl.LINEAR;
      t.magFilter = gl.LINEAR;
      return t;
    });

    function withoutSampler2D(params: *, types: *) {
      const obj = {};
      Object.keys(types).forEach(key => {
        if (types[key] !== "sampler2D") {
          obj[key] = params[key];
        }
      });
      return obj;
    }

    const shaders = transitions.map(t => {
      const shader = createShader(
        gl,
        VERTEX_SHADER,
        `\
    precision highp float;
    varying vec2 uv;
    uniform sampler2D from, to;
    uniform float progress, ratio;
    vec4 getFromColor (vec2 uv) { return texture2D(from, uv); }
    vec4 getToColor (vec2 uv) { return texture2D(to, uv); }
    ${t.data.glsl}
    void main () {
    gl_FragColor = transition(uv);
    }`
      );
      shader.bind();
      shader.attributes._p.pointer();
      shader.uniforms.ratio = width / height;
      const params = {
        ...t.data.defaultParams,
        ...withoutSampler2D(t.params, t.paramsTypes),
      };
      Object.assign(shader.uniforms, params);
      return shader;
    });

    let shader;
    const draw = (progress, outStream) =>
      new Promise(success => {
        shader.uniforms.progress = progress;
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
        const stream = savePixels(pixels, "png").pipe(outStream);
        stream.on("finish", success);
      });

    const nbTransitions = Math.max(textures.length - 1, shaders.length);
    if (frames * nbTransitions > 1) {
      if (out !== "-") fs.mkdirSync(out);
      let frameIndex = 1;
      return Array(nbTransitions).fill(null).map((_, i) => i).reduce(
        (promise, i) =>
          promise.then(() => {
            const fromTexture = textures[i % textures.length];
            const toTexture = textures[(i + 1) % textures.length];
            const tIndex = i % transitions.length;
            const transition = transitions[tIndex];
            shader = shaders[tIndex];
            shader.bind();
            shader.uniforms.from = fromTexture.bind(0);
            shader.uniforms.to = toTexture.bind(1);
            let unit = 2;
            Object.keys(transition.paramsTypes).forEach(key => {
              if (transition.paramsTypes[key] === "sampler2D") {
                const i = extraImages.indexOf(
                  transition.params[key] || genericTexture
                );
                shader.uniforms[key] = extraTextures[i].bind(unit++);
              }
            });
            const incr = 1 / (frames - 1);
            const framesArray = Array(delay || 0).fill(0);
            for (let progress = 0; progress <= 1; progress += incr) {
              framesArray.push(progress);
            }
            return framesArray.reduce(
              (promise, progress) =>
                promise.then(() =>
                  draw(
                    progress,
                    out === "-"
                      ? process.stdout
                      : fs.createWriteStream(
                          path.join(out, `${frameIndex++}.png`)
                        )
                  )
                ),
              Promise.resolve()
            );
          }),
        Promise.resolve()
      );
    } else {
      shader = shaders[0];
      shader.bind();
      const fromTexture = textures[0];
      const toTexture = textures[1 % textures.length];
      shader.uniforms.from = fromTexture.bind(0);
      shader.uniforms.to = toTexture.bind(1);
      return draw(
        progress,
        out === "-" ? process.stdout : fs.createWriteStream(out)
      );
    }
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
