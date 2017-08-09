//@flow
import React, { Component } from "react";
import { Node, connectSize, Uniform } from "gl-react";

// these functions make a GLSL code that map the texture2D uv to preserve ratio for a given ${r} image ratio.
// there are different modes:
const resizeModes: { [_: string]: * } = {
  cover: (r: string) =>
    `.5+(uv-.5)*vec2(min(ratio/${r},1.),min(${r}/ratio,1.))`,
  contain: (r: string) =>
    `.5+(uv-.5)*vec2(max(ratio/${r},1.),max(${r}/ratio,1.))`,
  stretch: () => "uv"
};

const makeFrag = (
  transitionGlsl: string,
  resizeMode: string = "cover"
): string => {
  const r = resizeModes[resizeMode];
  if (!r) throw new Error("invalid resizeMode=" + resizeMode);
  return `\
precision highp float;varying vec2 uv;uniform sampler2D from, to;uniform float progress, ratio, _fromR, _toR;vec4 getFromColor(vec2 uv){return texture2D(from,${r(
    "_fromR"
  )});}vec4 getToColor(vec2 uv){return texture2D(to,${r("_toR")});}
${transitionGlsl}
void main(){gl_FragColor=transition(uv);}`;
};

export default connectSize(
  class GLTransition extends Component {
    props: {
      transition: {
        glsl: string,
        defaultParams?: Object
      },
      transitionParams?: Object,
      resizeMode?: string,
      progress: number,
      // from and to can be any value that are accepted by gl-react for textures.
      from: any,
      to: any,
      // provided by connectSize
      width: number,
      height: number
    };
    getUniformsWithProgress(progress: number) {
      const {
        transition: { defaultParams },
        transitionParams,
        from,
        to,
        width,
        height
      } = this.props;
      return {
        ...defaultParams,
        ...transitionParams,
        progress,
        from,
        to,
        ratio: width / height,
        _fromR: Uniform.textureSizeRatio(from),
        _toR: Uniform.textureSizeRatio(to)
      };
    }
    setProgress = (progress: number) => {
      this.refs.node.setDrawProps({
        uniforms: this.getUniformsWithProgress(progress)
      });
    };
    render() {
      const { transition: { glsl }, resizeMode, progress } = this.props;
      return (
        <Node
          ref="node"
          shader={{ frag: makeFrag(glsl, resizeMode) }}
          uniforms={this.getUniformsWithProgress(progress)}
        />
      );
    }
  }
);
