//@flow
import createGL from "gl";
import transformSource from "gl-transition-utils/lib/transformSource";
import createWebGLCompiler from "gl-transition-utils/lib/createWebGLCompiler";
import retrieveFileMeta from "./retrieveFileMeta";

// the size need to be > 256 just so we can be accurate enough on colors
const gl = createGL(512, 256, { preserveDrawingBuffer: true });
if (!gl) throw new Error("GL validation context could not be created");
const webGLCompiler = createWebGLCompiler(gl);
export default (filename: string, glsl: string, path: string) => {
  const transition = transformSource(filename, glsl);
  const compilation = webGLCompiler(transition.data);
  const gitFileMeta = retrieveFileMeta(path);
  return {
    data: {
      transition: transition.data,
      compilation: compilation.data,
      gitFileMeta: gitFileMeta.data,
    },
    errors: compilation.errors
      .concat(transition.errors)
      .concat(gitFileMeta.errors),
  };
};
