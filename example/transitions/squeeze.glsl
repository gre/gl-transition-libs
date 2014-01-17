#ifdef GL_ES
precision highp float;
#endif

// General parameters
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform vec2 resolution;

uniform float colorSeparation;

float progressY (float y) {
  return 0.5 + (y-0.5) / (1.0-progress);
}

void main() {
  vec2 p = gl_FragCoord.xy / resolution.xy;

  float y = progressY(p.y);
  if (y < 0.0 || y > 1.0) {
    gl_FragColor = texture2D(to, p);
  }
  else {
    vec2 fp = vec2(p.x, y);
    vec3 c = vec3(
      texture2D(from, fp - progress*vec2(0.0, colorSeparation)).r,
      texture2D(from, fp).g,
      texture2D(from, fp + progress*vec2(0.0, colorSeparation)).b
    );
    gl_FragColor = vec4(c, 1.0);
  }
}

