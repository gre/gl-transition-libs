// kept apart from transform.js so importing the default sampler2D image
// doesn't pull the whole GLSL compiler chain into the entry bundle
import defaultSampler2DUrl from "./textures/luma/spiral-2.png";

export const defaultSampler2D = defaultSampler2DUrl;

export function defaultSampler2DParamsForType(types) {
  let res;
  Object.keys(types).forEach(key => {
    if (types[key] === "sampler2D") {
      if (!res) res = {};
      res[key] = defaultSampler2D;
    }
  });
  return res;
}

export function supplyDefaultSampler2DToTransition(transition) {
  // gl-transitions lists its sampler2D uniforms in `textures`, not paramsTypes
  const types = { ...transition.paramsTypes };
  (transition.textures || []).forEach(name => {
    types[name] = "sampler2D";
  });
  const sampler2DParams = defaultSampler2DParamsForType(types);
  if (!sampler2DParams) return transition;
  return {
    ...transition,
    defaultParams: {
      ...transition.defaultParams,
      ...sampler2DParams,
    },
  };
}
