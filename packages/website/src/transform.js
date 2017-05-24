//@flow
import transformSource from "gl-transition-utils/lib/transformSource";
import createWebGLCompiler from "gl-transition-utils/lib/createWebGLCompiler";

const canvas = document.createElement("canvas");
// the size need to be > 256 just so we can be accurate enough on colors
canvas.width = 512;
canvas.height = 256;
const gl = canvas.getContext("webgl");
if (!gl) throw new Error("GL validation context could not be created");
const browserWebGLCompiler = createWebGLCompiler(gl);

export default (
  filename: string,
  glsl: string,
  extraErrorsForTransitionResult: * = (data: *) => []
) => {
  const compilationRes = browserWebGLCompiler(glsl);
  const transitionRes = transformSource(filename, glsl);
  const extraErrors = extraErrorsForTransitionResult(transitionRes);
  function priority(e) {
    if (typeof e.line === "number") {
      return e.line > glsl.length ? glsl.length + 1 : e.line;
    }
    return glsl.length + 1;
  }
  function sortErrors(a, b) {
    return priority(a) - priority(b);
  }
  return {
    data: {
      transition: transitionRes.data,
      compilation: compilationRes.data,
    },
    errors: compilationRes.errors
      .concat(transitionRes.errors)
      .concat(extraErrors)
      .sort(sortErrors),
  };
};
