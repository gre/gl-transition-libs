#ifdef GL_ES
precision highp float;
#endif

// General parameters
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform vec2 resolution;

// Custom parameters
uniform vec2 size;
uniform float smoothness;

float rand (vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec2 p = gl_FragCoord.xy / resolution.xy;
  float r = rand(floor(size * p));
  float m = smoothstep(0.0, -smoothness, r - (progress * (1.0 + smoothness)));
  gl_FragColor = mix(texture2D(from, p), texture2D(to, p), m);
}
