//@flow
import createGL from "gl";
import transformSource from "gl-transition-utils/lib/transformSource";
import createWebGLCompiler from "gl-transition-utils/lib/createWebGLCompiler";

// the size need to be > 256 just so we can be accurate enough on colors
const gl = createGL(512, 256, { preserveDrawingBuffer: true });
if (!gl) throw new Error("GL validation context could not be created");
const webGLCompiler = createWebGLCompiler(gl);
export default (filename: string, glsl: string) => {
  const compilation = webGLCompiler(glsl);
  const transition = transformSource(filename, glsl);
  return {
    data: {
      transition: transition.data,
      compilation: compilation.data,
    },
    errors: compilation.errors.concat(transition.errors),
  };
};
