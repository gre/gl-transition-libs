#ifdef GL_ES
precision highp float;
#endif

// General parameters
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform vec2 resolution;

uniform float flashPhase; // if 0.0, the image directly turn grayscale, if 0.9, the grayscale transition phase is very important
uniform float flashIntensity;
uniform float flashZoomEffect;

const vec3 flashColor = vec3(1.0, 0.8, 0.3);
const float flashVelocity = 3.0;

void main() {
  vec2 p = gl_FragCoord.xy / resolution.xy;
  vec4 fc = texture2D(from, p);
  vec4 tc = texture2D(to, p);
  float intensity = mix(1.0, 2.0*distance(p, vec2(0.5, 0.5)), flashZoomEffect) * flashIntensity * pow(smoothstep(flashPhase, 0.0, distance(0.5, progress)), flashVelocity);
  vec4 c = mix(texture2D(from, p), texture2D(to, p), smoothstep(0.5*(1.0-flashPhase), 0.5*(1.0+flashPhase), progress));
  c += intensity * vec4(flashColor, 1.0);
  gl_FragColor = c;
}


