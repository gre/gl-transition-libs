#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { program } from "commander";
import createGL from "gl";
import createTransition from "gl-transition";
import createTexture, { type GLTexture2D } from "gl-texture2d";
import ndarray from "ndarray";
import savePixels from "save-pixels";
import { transformSource, TransitionQueryString } from "gl-transition-utils";
import getPixels from "./getPixels";
import readFile from "./readFile";

function collect(val: string, memo: string[]) {
  memo.push(val);
  return memo;
}

program
  .version("0.0.1")
  .option(
    "-t, --transition <file.glsl>",
    "add a transition to use (can be used multiple times)",
    collect,
    [] as string[]
  )
  .option(
    "-i, --images <images>",
    "add an image to use for the transition (use multiple times)",
    collect,
    [] as string[]
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

const { frames, delay, progress, transition, out, width, height, images, genericTexture } =
  program.opts<{
    frames?: number;
    delay: number;
    progress: number;
    transition: string[];
    out?: string;
    width?: number;
    height?: number;
    images: string[];
    genericTexture?: string;
  }>();

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

const extraImagesSrc: string[] = genericTexture ? [genericTexture] : [];

function readTransition(str: string) {
  const [filename, query] = str.split("?");
  const params = query ? TransitionQueryString.parse(query) : {};
  return readFile(filename).then((glsl) => {
    const res = transformSource("file.glsl", glsl);
    Object.keys(res.data.paramsTypes).forEach((key) => {
      const value = params[key];
      if (
        res.data.paramsTypes[key] === "sampler2D" &&
        typeof value === "string" &&
        !extraImagesSrc.includes(value)
      ) {
        extraImagesSrc.push(value);
      }
    });
    if (res.errors.length > 0) {
      throw new Error(
        "transition have errors:\n" + res.errors.map((e) => e.message).join("\n")
      );
    }
    return { params, ...res };
  });
}

// transitions are read first: readTransition collects the sampler2D image
// sources from query strings into extraImagesSrc
Promise.all(transition.map(readTransition))
  .then((transitionResults) =>
    Promise.all([
      Promise.all(images.map(getPixels)),
      Promise.all(extraImagesSrc.map(getPixels)),
    ]).then(([images, extraImages]) => ({
      transitionResults,
      images,
      extraImages,
    }))
  )
  .then(({ transitionResults, images, extraImages }) => {
    // Prepare GL
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 4, 4, -1]), // see a-big-triangle
      gl.STATIC_DRAW
    );
    gl.viewport(0, 0, width, height);

    // Prepare objects
    const textures = images.map((pixels) => {
      const t = createTexture(gl, pixels);
      t.minFilter = gl.LINEAR;
      t.magFilter = gl.LINEAR;
      return t;
    });

    const extraTextures = extraImages.map((pixels) => {
      const t = createTexture(gl, pixels);
      t.minFilter = gl.LINEAR;
      t.magFilter = gl.LINEAR;
      return t;
    });

    const transitions = transitionResults.map((t) =>
      createTransition(gl, t.data)
    );

    const transitionParams = transitionResults.map((t) => {
      const { paramsTypes } = t.data;
      const params: { [key: string]: unknown } = {};
      for (const key in paramsTypes) {
        if (paramsTypes[key] === "sampler2D") {
          const src = t.params[key];
          const i = extraImagesSrc.indexOf(
            (typeof src === "string" ? src : undefined) || genericTexture || ""
          );
          if (i !== -1) params[key] = extraTextures[i];
        } else if (key in t.params) {
          params[key] = t.params[key];
        }
      }
      return params;
    });

    // Draw function for every frame.
    const draw = (
      tIndex: number,
      progress: number,
      from: GLTexture2D,
      to: GLTexture2D,
      outStream: NodeJS.WritableStream
    ) =>
      new Promise((success) => {
        transitions[tIndex].draw(
          progress,
          from,
          to,
          width,
          height,
          transitionParams[tIndex]
        );
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
        const stream = savePixels(pixels, "png").pipe(outStream);
        stream.on("finish", success);
      });

    const nbTransitions = Math.max(textures.length - 1, transitions.length);
    if ((frames || 0) * nbTransitions > 1) {
      if (out !== "-") fs.mkdirSync(out);
      let frameIndex = 1;
      return Array(nbTransitions)
        .fill(null)
        .map((_, i) => i)
        .reduce(
          (promise, i) =>
            promise.then(() => {
              const tIndex = i % transitionResults.length;
              const fromTexture = textures[i % textures.length];
              const toTexture = textures[(i + 1) % textures.length];
              const incr = 1 / ((frames || 2) - 1);
              const framesArray = Array(delay || 0).fill(0);
              for (let progress = 0; progress <= 1; progress += incr) {
                framesArray.push(progress);
              }
              return framesArray.reduce(
                (promise, progress) =>
                  promise.then(() =>
                    draw(
                      tIndex,
                      progress,
                      fromTexture,
                      toTexture,
                      out === "-"
                        ? process.stdout
                        : fs.createWriteStream(
                            path.join(out, `${frameIndex++}.png`)
                          )
                    )
                  ),
                Promise.resolve() as Promise<unknown>
              );
            }),
          Promise.resolve() as Promise<unknown>
        );
    } else {
      const fromTexture = textures[0];
      const toTexture = textures[1 % textures.length];
      return draw(
        0,
        progress,
        fromTexture,
        toTexture,
        out === "-" ? process.stdout : fs.createWriteStream(out)
      );
    }
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
