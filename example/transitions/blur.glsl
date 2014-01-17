#ifdef GL_ES
precision highp float;
#endif

#define QUALITY 32

// General parameters
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform vec2 resolution;

// Custom parameters
uniform float size;

const float GOLDEN_ANGLE = 2.399963229728653; // PI * (3.0 - sqrt(5.0))

vec4 blur(sampler2D t, vec2 c, float radius) {
  vec4 sum = vec4(0.0);
  float q = float(QUALITY);
  // Using a "spiral" to propagate points.
  for (int i=0; i<QUALITY; ++i) {
    float fi = float(i);
    float a = fi * GOLDEN_ANGLE;
    float r = sqrt(fi / q) * radius;
    vec2 p = c + r * vec2(cos(a), sin(a));
    sum += texture2D(t, p);
  }
  return sum / q;
}

void main()
{
  vec2 p = gl_FragCoord.xy / resolution.xy;
  float inv = 1.-progress;
  gl_FragColor = inv*blur(from, p, progress*size) + progress*blur(to, p, inv*size);
}

