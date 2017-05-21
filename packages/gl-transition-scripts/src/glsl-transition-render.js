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

program
  .version("0.0.1")
  .option("-t, --transition <file.glsl>")
  .option("--from <in.png>", "from image")
  .option("--to <out.png>", "to image")
  .option("-w, --width <width>", "width in pixels", parseInt)
  .option("-h, --height <height>", "height in pixels", parseInt)
  .option("-f, --frames [nb]", "number of frames to render", parseInt)
  .option("-p, --progress [p]", "only render one frame", parseInt, 0.4)
  .option("-P, --params [json object of trnansition params]", JSON.parse)
  .option(
    "-o, --out <directory|out.png>",
    "a folder to create with the images OR the path of the image to save (if using progress)"
  )
  .parse(process.argv);

const {
  frames,
  progress,
  params,
  transition,
  out,
  width,
  height,
  from,
  to,
} = program;

if (!width || !height || !from || !to || !transition || !out) {
  program.outputHelp();
  process.exit(1);
}

const gl = createGL(width, height, { preserveDrawingBuffer: true });
if (!gl) throw new Error("GL validation context could not be created");

const data = new Uint8Array(width * height * 4);
const pixels = ndarray(data, [height, width, 4]).transpose(1, 0, 2);

const VERTEX_SHADER = `attribute vec2 _p;
varying vec2 uv;
void main() {
gl_Position = vec4(_p,0.0,1.0);
uv = vec2(0.5, 0.5) * (_p+vec2(1.0, 1.0));
}`;

Promise.all([readFile(transition), getPixels(from), getPixels(to)])
  .then(([glsl, fromPixels, toPixels]) => {
    const { errors, data: { defaultParams } } = transformSource(
      "file.glsl",
      glsl
    );
    if (errors.length > 0) {
      throw new Error(
        "transition have errors:\n" + errors.map(e => e.message).join("\n")
      );
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 4, 4, -1]), // see a-big-triangle
      gl.STATIC_DRAW
    );
    gl.viewport(0, 0, width, height);

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
${glsl}
void main () {
  gl_FragColor = transition(uv);
}`
    );
    const fromTexture = createTexture(gl, fromPixels);
    const toTexture = createTexture(gl, toPixels);

    shader.bind();
    shader.attributes._p.pointer();
    Object.assign(shader.uniforms, defaultParams, params);
    shader.uniforms.ratio = width / height;
    shader.uniforms.from = fromTexture.bind(0);
    shader.uniforms.to = toTexture.bind(1);

    const draw = (progress, outStream) =>
      new Promise(success => {
        shader.uniforms.progress = progress;
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
        const stream = savePixels(pixels, "png").pipe(outStream);
        stream.on("finish", success);
      });

    if (frames > 1) {
      fs.mkdirSync(out);
      const incr = 1 / (frames - 1);
      const framesArray = [];
      for (let progress = 0, i = 1; i <= frames; (progress += incr), i++) {
        framesArray.push([i, progress]);
      }
      return framesArray.reduce(
        (promise, [i, progress]) =>
          promise.then(() =>
            draw(progress, fs.createWriteStream(path.join(out, `${i}.png`)))
          ),
        Promise.resolve()
      );
    } else {
      return draw(
        progress,
        out === "-" ? process.stdout : fs.createWriteStream(out)
      );
    }
  })
  .catch(e => {
    console.error(e.message);
    process.exit(1);
  });
