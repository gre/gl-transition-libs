import { test, expect } from "vitest";
import transformSource from "./transformSource";

test("parse correctly Burn.glsl", () => {
  const glsl = `
// author: gre
// license: MIT
uniform vec3 color; // = vec3(0.9, 0.4, 0.2)
vec4 transition (vec2 uv) {
  return mix(
    getFromColor(uv) + vec4(progress*color, 1.0),
    getToColor(uv) + vec4((1.0-progress)*color, 1.0),
    progress
  );
}
  `;
  expect(transformSource("Burn.glsl", glsl)).toMatchSnapshot();
});

test("not providing a default creates a warning", () => {
  const glsl = `
// Author: gre
// License: MIT
uniform vec3 color;
vec4 transition (vec2 uv) {
  return mix(
    getFromColor(uv) + vec4(progress*color, 1.0),
    getToColor(uv) + vec4((1.0-progress)*color, 1.0),
    progress
  );
}
  `;
  const res = transformSource("Burn2.glsl", glsl);
  expect(res.data).toMatchSnapshot();
  expect(res.errors.filter(e => e.type === "error")).toEqual([]);
  expect(res.errors.filter(e => e.type === "warn").length).toBe(1);
});

test("other example", () => {
  const res = transformSource(
    "Test.glsl",
    `
  // author: gre
  // License: MIT
  uniform vec3 color /* = vec3(0.9, 0.4, 0.2) */;
  uniform float foo; /* = 42. */
  uniform sampler2D yo;
  vec4 transition (/* weird comment in the middle */vec2 uv) {
    return mix(
    getFromColor(uv) + vec4(progress*color, 1.0),
    getToColor(uv) + vec4((1.0-progress)*color, 1.0),
    progress);
  }
  `
  );
  expect(res).toMatchSnapshot();
  expect(res.errors).toEqual([]);
});

test("must not override existing things", () => {
  const res = transformSource(
    "Test.glsl",
    `
uniform float from; /* = 42. */
uniform float to; /* = 42. */
vec4 transition (vec2 uv) {}
`
  );
  expect(res).toMatchSnapshot();
  expect(res.errors.length).toBeGreaterThan(0);
});

test("must define the transition function", () => {
  const res = transformSource(
    "Test.glsl",
    `

`
  );
  expect(res).toMatchSnapshot();
  expect(res.errors.length).toBeGreaterThan(0);
});

test("must define metas", () => {
  const res = transformSource(
    "Test.glsl",
    `
    vec4 transition (vec2 uv) {
      return vec4(0.0);
    }
`
  );
  expect(res).toMatchSnapshot();
  expect(res.errors.length).toBeGreaterThan(0);
});

test("simple transition function is fine", () => {
  const res = transformSource(
    "Test.glsl",
    `
      // Author: gre
      // License: MIT
      vec4 transition (vec2 uv) {
        return vec4(0.0);
      }
  `
  );
  expect(res).toMatchSnapshot();
  expect(res.errors).toEqual([]);
});

test("must define uv params", () => {
  const res = transformSource(
    "Test.glsl",
    `
      // Author: gre
      // License: MIT
      vec4 transition () {
        return vec4(0.0);
      }
  `
  );
  expect(res).toMatchSnapshot();
  expect(res.errors.length).toBeGreaterThan(0);
});

test("first meta comment is taken in priority", () => {
  const res = transformSource(
    "Test.glsl",
    `
      // Author: gre
      // License: MIT
      // Author: gre_2
      // License: GPLv2
      vec4 transition (vec2 p) {
        return vec4(p, 1.0, 1.0);
      }
  `
  );
  expect(res.errors).toEqual([]);
  expect(res.data).toMatchObject({
    author: "gre",
    license: "MIT"
  });
});

test("renaming param is fine", () => {
  const res = transformSource(
    "Test.glsl",
    `
      // Author: gre
      // License: MIT
      vec4 transition (vec2 p) {
        return vec4(p, 1.0, 1.0);
      }
  `
  );
  expect(res).toMatchSnapshot();
  expect(res.errors).toEqual([]);
});

test("must define the correct signature", () => {
  const res = transformSource(
    "Test.glsl",
    `
    // Author: gre
    // License: MIT
    void transition (vec2 uv) {}`
  );
  expect(res).toMatchSnapshot();
  expect(res.errors.length).toBeGreaterThan(0);
});

test("crazy defaults", () => {
  const res = transformSource(
    "Crazyyyy.glsl",
    `
 // Author: Gaetan
 // License: LGPL
 uniform int yo; // = 1
 uniform vec4 yo2; // = vec4(4.4)
 uniform vec2 yo3 /* = vec2(1.1, 2.2) */;
 uniform float a,b; // = 42.2
 uniform float c /* = 3.3*/, d /* = 5.5 */;
 vec4 transition (vec2 uv) { return vec4(0.); }`
  );
  expect(res.errors).toEqual([]);
  expect(res.data.defaultParams).toEqual({
    yo: 1,
    yo2: [4.4, 4.4, 4.4, 4.4],
    yo3: [1.1, 2.2],
    a: 42.2,
    b: 42.2,
    c: 3.3,
    d: 5.5
  });
  expect(res.data.author).toEqual("Gaetan");
  expect(res.data.license).toEqual("LGPL");
});

test("transition names must be PascalCase", () => {
  const glsl = `
// Author: gre
// License: MIT
vec4 transition (vec2 uv) { return getToColor(uv); }`;
  const filenameErrors = (filename: string) =>
    transformSource(filename, glsl).errors.filter(
      (e) => e.code === "GLT_invalid_filename"
    );
  for (const name of ["CrossZoom", "WipeLeft", "HsvFade", "Burn2"]) {
    expect(filenameErrors(name + ".glsl")).toEqual([]);
  }
  for (const name of [
    "crosszoom",
    "wipeLeft",
    "old_tv",
    "scale-in",
    "2Fade",
    "HSVFade",
    "RotateTransition",
    "New",
  ]) {
    expect(filenameErrors(name + ".glsl").length).toBe(1);
  }
});
