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
uniform float zoom;

void main() {
  vec2 p = gl_FragCoord.xy / resolution.xy;
  float inv = 1. - progress;
  vec2 disp = size*vec2(cos(zoom*p.x), sin(zoom*p.y));
  vec4 texTo = texture2D(to, p + inv*disp);
  vec4 texFrom = texture2D(from, p + progress*disp);
  gl_FragColor = texTo*progress + texFrom*inv;
}
