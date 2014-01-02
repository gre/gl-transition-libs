#ifdef GL_ES
precision highp float;
#endif

// General parameters
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform vec2 resolution;

uniform float smoothness;
uniform bool opening;

const vec2 center = vec2(0.5, 0.5);
const float SQRT_2 = 1.414213562373;

void main() {
  vec2 p = gl_FragCoord.xy / resolution.xy;
  float x = opening ? progress : 1.-progress;
  float m = smoothstep(-smoothness, 0.0, SQRT_2*distance(center, p) - x*(1.+smoothness));
  gl_FragColor = mix(texture2D(from, p), texture2D(to, p), opening ? 1.-m : m);
}

