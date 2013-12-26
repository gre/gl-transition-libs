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

void main() {
  vec2 p = gl_FragCoord.xy / resolution.xy;
  float x = smoothstep(p.x-size, p.x+size, progress*(1.+2.*size) - size);
  vec4 texTo = texture2D(to, p);
  vec4 texFrom = texture2D(from, p);
  vec4 xTo = vec4(
    smoothstep(0.00, 0.50, x), 
    smoothstep(0.25, 0.75, x),
    smoothstep(0.50, 1.00, x),
    x);
  vec4 xFrom = vec4(1. - x);
  gl_FragColor = texTo*xTo+texFrom*xFrom;
}

