// hand-written: the CJS build is `module.exports = fn`, which needs `export =`
import type { Regl, DrawCommand, Texture2D } from "regl";

declare function createTransition(
  regl: Regl,
  transition: createTransition.TransitionObjectLike,
  options?: createTransition.Options
): DrawCommand;

declare namespace createTransition {
  interface TransitionObjectLike {
    glsl: string;
    defaultParams: { [key: string]: unknown };
    paramsTypes: { [key: string]: string };
  }

  interface Options {
    resizeMode?: "cover" | "contain" | "stretch";
  }

  interface TransitionDrawProps {
    progress: number;
    from: Texture2D;
    to: Texture2D;
    [param: string]: unknown;
  }
}

export = createTransition;
