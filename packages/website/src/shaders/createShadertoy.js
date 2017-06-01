//@flow
import raf from "raf";
import React, { Component } from "react";
import { Node } from "gl-react";

type Props = {
  iChannels?: Array<*>,
};
type State = { t: number };
type UniformGetter = (props: Props, state: State) => *;

const uniformsTypes = {
  iResolution: "vec2",
  iGlobalTime: "float",
  iTimeDelta: "float",
  iFrame: "int",
  iChannelTime: ["float", "[4]"],
  iChannelResolution: ["vec3", "[4]"],
  iMouse: "vec4",
  iChannel0: "sampler2D",
  iChannel1: "sampler2D",
  iChannel2: "sampler2D",
  iChannel3: "sampler2D",
  iDate: "vec4",
  iSampleRate: "float",
};

// This wrap a shadertoy code into gl-react paradigm

export default (shaderCode: string, defaultChannels?: Array<*>) => {
  const uniformsGetters: { [_: string]: UniformGetter } = {
    iResolution: () => [1, 1],
    iGlobalTime: (props, { t }) => t,
    iTimeDelta: (props, { t }) => t,
    iFrame: () => 0,
    iChannelTime: (props, { t }) => [t, t, t, t],
    iChannelResolution: () => [[64, 64], [64, 64], [64, 64], [64, 64]], // not supported. giving random values
    iMouse: () => [0, 0, 0, 0], // not supported
    iDate: () => [0, 0, 0, 0], // not supported
    iSampleRate: () => 0, // not supported
    iChannel0: ({ iChannels }) =>
      (iChannels && iChannels[0]) ||
      (defaultChannels && defaultChannels[0]) ||
      null,
    iChannel1: ({ iChannels }) =>
      (iChannels && iChannels[1]) ||
      (defaultChannels && defaultChannels[1]) ||
      null,
    iChannel2: ({ iChannels }) =>
      (iChannels && iChannels[2]) ||
      (defaultChannels && defaultChannels[2]) ||
      null,
    iChannel3: ({ iChannels }) =>
      (iChannels && iChannels[3]) ||
      (defaultChannels && defaultChannels[3]) ||
      null,
  };

  // we need to filter out the uniforms for these really used by the shader or they would not even exists
  for (let key in uniformsTypes) {
    if (!shaderCode.includes(key)) {
      // it's a hacky way, I know right XD
      delete uniformsGetters[key];
    }
  }

  const frag = `\
precision highp float;
varying vec2 uv;
vec4 texture (sampler2D t, vec2 uv) {
  return texture2D(t, uv);
}
${Object.keys(uniformsGetters)
    .map(key => {
      let typ = uniformsTypes[key], typSuffix = "";
      if (typ instanceof Array) {
        [typ, typSuffix] = typ;
      }
      return `uniform ${typ} ${key}${typSuffix};`;
    })
    .join("\n")}
${shaderCode}
void main () {
  mainImage(gl_FragColor, uv);
}`;

  return class Shadertoy extends Component {
    props: Props;
    state: State = { t: 0 };
    _r: *;

    componentDidMount() {
      const loop = t => {
        this._r = raf(loop);
        this.setState({ t: t / 1000 });
      };
      this._r = raf(loop);
    }
    componentWillUnmount() {
      raf.cancel(this._r);
    }

    render() {
      const { props, state } = this;
      const uniforms = {};
      for (let k in uniformsGetters) {
        uniforms[k] = uniformsGetters[k](props, state);
      }
      return <Node shader={{ frag }} uniforms={uniforms} />;
    }
  };
};
