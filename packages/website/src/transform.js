import { transformSource, createWebGLCompiler } from "gl-transition-utils";
import { supplyDefaultSampler2DToTransition } from "./defaultSampler2D";

const canvas = document.createElement("canvas");
// the size need to be > 256 just so we can be accurate enough on colors
canvas.width = 512;
canvas.height = 256;
const gl =
  canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
let browserWebGLCompiler = gl && createWebGLCompiler(gl);

canvas.addEventListener("webglcontextlost", event => {
  event.preventDefault();
  browserWebGLCompiler = null;
});
canvas.addEventListener("restore", () => {
  browserWebGLCompiler = gl && createWebGLCompiler(gl);
});

export default (filename, glsl, extraErrorsForTransitionResult = () => []) => {
  const transitionRes = transformSource(filename, glsl);
  const compilationRes = browserWebGLCompiler
    ? browserWebGLCompiler(transitionRes.data)
    : {
        data: null,
        errors: [
          {
            code: "WebGL_init_fail",
            type: "error",
            message: !gl
              ? "WebGL validation context could not be created!"
              : "WebGL validation context is lost!",
          },
        ],
      };
  const extraErrors = extraErrorsForTransitionResult(transitionRes);
  function priority(e) {
    if (typeof e.line === "number") {
      return e.line > glsl.length ? glsl.length + 1 : e.line;
    }
    return glsl.length + 1;
  }

  return {
    data: {
      transition: supplyDefaultSampler2DToTransition(transitionRes.data),
      compilation: compilationRes.data,
    },
    errors: compilationRes.errors
      .concat(transitionRes.errors)
      .concat(extraErrors)
      .sort((a, b) => priority(a) - priority(b)),
  };
};
