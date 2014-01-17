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
uniform int quality;

const GOLDEN_ANGLE = 2.399963229728653; // PI * (3.0 - sqrt(5.0))

vec4 blur(sampler2D t, vec2 c, float radius, int n) {
  vec4 sum = texture2D(t, c);
  // Using a "spiral" to propagate points.
  for (int i=0; i<n; ++i) {
    float a = i * GOLDEN_ANGLE;
    float r = sqrt(i / float(n)) * radius;
    vec2 p = vec2(c+cos(a)*r, c+sin(a)*r);
    sum += texture2D(t, p);
  }
   return sum / (1.0 + float(n));
}

void main()
{
  vec2 p = gl_FragCoord.xy / resolution.xy;
  float inv = 1.-progress;
  gl_FragColor = inv*blur(from, p, progress*size, quality) + progress*blur(to, p, inv*size);
}

