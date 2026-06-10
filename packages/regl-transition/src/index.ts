import type { Regl, DrawCommand, Texture2D } from "regl";

export interface TransitionObjectLike {
  glsl: string;
  defaultParams: { [key: string]: unknown };
  paramsTypes: { [key: string]: string };
}

export interface Options {
  resizeMode?: "cover" | "contain" | "stretch";
}

export interface TransitionDrawProps {
  progress: number;
  from: Texture2D;
  to: Texture2D;
  [param: string]: unknown;
}

const VERT = `attribute vec2 _p;
varying vec2 _uv;
void main() {
gl_Position = vec4(_p,0.0,1.0);
_uv = vec2(0.5, 0.5) * (_p+vec2(1.0, 1.0));
}`;

// these functions make a GLSL code that map the texture2D uv to preserve ratio for a given ${r} image ratio.
// there are different modes:
const resizeModes: { [key: string]: (r: string) => string } = {
  cover: (r: string) =>
    `.5+(uv-.5)*vec2(min(ratio/${r},1.),min(${r}/ratio,1.))`,
  contain: (r: string) =>
    `.5+(uv-.5)*vec2(max(ratio/${r},1.),max(${r}/ratio,1.))`,
  stretch: () => "uv",
};

const makeFrag = (transitionGlsl: string, resizeMode: string): string => {
  const r = resizeModes[resizeMode];
  if (!r) throw new Error("invalid resizeMode=" + resizeMode);
  return `\
precision highp float;varying vec2 _uv;uniform sampler2D from, to;uniform float progress, ratio, _fromR, _toR;vec4 getFromColor(vec2 uv){uv=vec2(1.,-1.)*uv+vec2(0.,1.);return texture2D(from,${r("_fromR")});}vec4 getToColor(vec2 uv){uv=vec2(1.,-1.)*uv+vec2(0.,1.);return texture2D(to,${r("_toR")});}
${transitionGlsl}
void main(){gl_FragColor=transition(_uv);}`;
};

export default (
  regl: Regl,
  transition: TransitionObjectLike,
  options: Options = {}
): DrawCommand => {
  const { resizeMode } = { resizeMode: "cover", ...options };

  const passInParams: {
    [key: string]: (ctx: unknown, props: TransitionDrawProps) => unknown;
  } = {};
  Object.keys(transition.paramsTypes).forEach((key) => {
    if (transition.paramsTypes[key] === "sampler2D") {
      let emptyTexture: Texture2D;
      passInParams[key] = (ctx, props) =>
        key in props
          ? props[key]
          : emptyTexture || (emptyTexture = regl.texture({ shape: [2, 2] })); // empty texture fallback
    } else {
      const defaultValue = transition.defaultParams[key];
      passInParams[key] = (ctx, props) =>
        key in props ? props[key] : defaultValue;
    }
  });

  return regl({
    frag: makeFrag(transition.glsl, resizeMode),
    vert: VERT,
    attributes: {
      _p: regl.buffer([
        [-1, -1],
        [-1, 4],
        [4, -1],
      ]),
    },
    count: 3,
    uniforms: {
      ...passInParams,
      ratio: (context) => context.viewportWidth / context.viewportHeight,
      _fromR: (context, props: TransitionDrawProps) =>
        props.from.width / props.from.height,
      _toR: (context, props: TransitionDrawProps) =>
        props.to.width / props.to.height,
      from: regl.prop<TransitionDrawProps, "from">("from"),
      to: regl.prop<TransitionDrawProps, "to">("to"),
      progress: regl.prop<TransitionDrawProps, "progress">("progress"),
    },
  });
};
