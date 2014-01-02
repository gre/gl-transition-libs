#ifdef GL_ES
precision highp float;
#endif

// General parameters
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform vec2 resolution;

uniform vec2 direction;
uniform float smoothness;

const vec2 center = vec2(0.5, 0.5);

void main() {
  vec2 p = gl_FragCoord.xy / resolution.xy;
  vec2 v = normalize(direction);
  v /= abs(v.x)+abs(v.y);
  float d = v.x * center.x + v.y * center.y;
  float m = smoothstep(-smoothness, 0.0, v.x * p.x + v.y * p.y - (d-0.5+progress*(1.+smoothness)));
  gl_FragColor = mix(texture2D(to, p), texture2D(from, p), m);
}



