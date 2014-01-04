#ifdef GL_ES
precision highp float;
#endif

// General parameters
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform vec2 resolution;

bool inHeart (vec2 p, vec2 center, float size) {
  if (size == 0.0) return false;
  vec2 o = (p-center)/(2.0*size);
  return pow(o.x*o.x+o.y*o.y-0.3, 3.0) < o.x*o.x*pow(o.y, 3.0);
}

void main() {
  vec2 p = gl_FragCoord.xy / resolution.xy;
  float m = inHeart(p, vec2(0.5, 0.4), progress) ? 1.0 : 0.0;
  gl_FragColor = mix(texture2D(from, p), texture2D(to, p), m);
}



