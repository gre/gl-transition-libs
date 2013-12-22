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

void main() {
  float p = smoothstep(texCoord.x-size, texCoord.x+size, progress*(1.+2.*size) - size);
  vec4 texTo = texture2D(to, texCoord);
  vec4 texFrom = texture2D(from, texCoord);
  vec4 pTo = vec4(
    smoothstep(0.00, 0.50, p), 
    smoothstep(0.25, 0.75, p),
    smoothstep(0.50, 1.00, p),
    p);
  vec4 pFrom = vec4(1. - p);
  gl_FragColor = texTo*pTo+texFrom*pFrom;
}

