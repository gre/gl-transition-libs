#ifdef GL_ES
precision highp float;
#endif

// General parameters
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform vec2 resolution;

// Custom parameters
uniform float size;

float rand (vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec2 p = gl_FragCoord.xy / resolution.xy;
  float r = rand(vec2(0, p.y));
  float m = smoothstep(0.0, -size, p.x*(1.0-size) + size*r - (progress * (1.0 + size)));
  gl_FragColor = mix(texture2D(from, p), texture2D(to, p), m);
}
