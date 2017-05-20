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

export default (filename: string, glsl: string) => {
  const compilationRes = browserWebGLCompiler(glsl);
  const transitionRes = transformSource(filename, glsl);
  return {
    data: {
      transition: transitionRes.data,
      compilation: compilationRes.data,
    },
    errors: compilationRes.errors.concat(transitionRes.errors),
  };
};
