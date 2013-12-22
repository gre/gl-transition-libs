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
uniform float zoom;

void main() {
  float pinv = 1. - progress;
  vec2 disp = size*vec2(cos(zoom*texCoord.x), sin(zoom*texCoord.y));
  vec4 texTo = texture2D(to, texCoord + pinv*disp);
  vec4 texFrom = texture2D(from, texCoord + progress*disp);
  gl_FragColor = texTo*progress + texFrom*pinv;
}
