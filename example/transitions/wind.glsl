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

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec2 p = gl_FragCoord.xy / resolution.xy;
  float xTo = progress*(1.0+2.0*size) - size;
  float r = size * rand(vec2(0, p.y));
  xTo = clamp(1.-(p.x-xTo-r)/size, 0., 1.);
  float xFrom = 1.0 - xTo;
  gl_FragColor = xTo*texture2D(to, p) + xFrom*texture2D(from, p);
}
