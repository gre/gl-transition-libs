//@flow

import transformSource from "gl-transition-utils/lib/transformSource";

const t1 = transformSource(
  "fade.glsl",
  `// author: gre
// License: MIT
vec4 transition (vec2 uv) {
  return mix(
    getFromColor(uv),
    getToColor(uv),
    progress
  );
}
`
);

const t2 = transformSource(
  "burn.glsl",
  `// author: gre
// License: MIT
uniform vec3 color /* = vec3(0.9, 0.4, 0.2) */;
vec4 transition (vec2 uv) {
  return mix(
    getFromColor(uv) + vec4(progress*color, 1.0),
    getToColor(uv) + vec4((1.0-progress)*color, 1.0),
    progress
  );
}
`
);

export const transitions: Array<*> = [
  {
    ...t1.data,
    createdDate: new Date().toString(),
    modifiedDate: new Date().toString(),
  },
  {
    ...t2.data,
    createdDate: new Date().toString(),
    modifiedDate: new Date().toString(),
  },
];

export const transitionsByName = {};
transitions.forEach(t => {
  transitionsByName[t.name] = t;
});

export const transitionsByCreatedDate = transitions.sort(
  (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
);
export const transitionsByModifiedDate = transitions.sort(
  (a, b) => new Date(a.modifiedDate) - new Date(b.modifiedDate)
);
