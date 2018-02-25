//@flow
import React, { Component } from "react";
import { Node, connectSize } from "gl-react";

export default connectSize(
  class GLTransition extends Component {
    props: {
      transition: {
        glsl: string,
        defaultParams?: Object
      },
      transitionParams?: Object,
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
        ratio: width / height
      };
    }
    setProgress = (progress: number) => {
      this.refs.node.setDrawProps({
        uniforms: this.getUniformsWithProgress(progress)
      });
    };
    render() {
      const { transition: { glsl }, progress } = this.props;
      return (
        <Node
          ref="node"
          shader={{
            frag: `
precision highp float;
varying vec2 uv;
uniform float progress, ratio;
uniform sampler2D from, to;
vec4 getFromColor(vec2 uv){return texture2D(from, uv);}
vec4 getToColor(vec2 uv){return texture2D(to, uv);}
${glsl}
void main(){gl_FragColor=transition(uv);}`
          }}
          ignoreUnusedUniforms={["ratio"]}
          uniforms={this.getUniformsWithProgress(progress)}
        />
      );
    }
  }
);
