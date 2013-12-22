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
  float pinv = 1.-p;
  vec4 texTo = texture2D(to, texCoord);
  vec4 texFrom = texture2D(from, texCoord);
  gl_FragColor = texTo*p+texFrom*pinv;
}

