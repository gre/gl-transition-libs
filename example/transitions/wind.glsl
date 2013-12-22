#ifdef GL_ES
precision highp float;
#endif

// General parameters
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
varying vec2 texCoord;
uniform vec2 resolution;

// Custom parameters
uniform float size;

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  float pTo = progress*(1.0+2.0*size) - size;
  float r = size * rand(vec2(0, texCoord.y));
  pTo = clamp(1.-(texCoord.x-pTo-r)/size, 0., 1.);
  float pFrom = 1.0 - pTo;
  gl_FragColor = pTo*texture2D(to,texCoord) + pFrom*texture2D(from,texCoord);
}
