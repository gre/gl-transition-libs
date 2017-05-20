//@flow
import React, { Component } from "react";
import { Node, connectSize } from "gl-react";

export default connectSize(
  class GLTransition extends Component {
    props: {
      transition: {
        glsl: string,
        defaultParams?: Object,
      },
      transitionParams?: Object,
      progress: number,
      from: string,
      to: string,
      // provided by connectSize
      width: number,
      height: number,
    };
    render() {
      const {
        transition: { defaultParams, glsl },
        transitionParams,
        progress,
        from,
        to,
        width,
        height,
      } = this.props;
      return (
        <Node
          shader={{
            frag: `
    precision highp float;
    varying vec2 uv;
    uniform float progress, ratio;
    uniform sampler2D from, to;
    vec4 getFromColor (vec2 uv) {
    return texture2D(from, uv);
    }
    vec4 getToColor (vec2 uv) {
    return texture2D(to, uv);
    }
    ${glsl}
    void main () {
    float r = ratio;${/* THIS IS A NO OP just so uniform still exists after GL compilation */ ""}
    gl_FragColor = transition(uv);
    }`,
          }}
          uniforms={{
            progress,
            from,
            to,
            ratio: width / height,
            ...defaultParams,
            ...transitionParams,
          }}
        />
      );
    }
  }
);
