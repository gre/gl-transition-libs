#ifdef GL_ES
precision highp float;
#endif

// General parameters
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform vec2 resolution;

// Those could be uniforms if needed
const float reflection = 0.3;
const float perspective = 0.3;
const float maxDepth = 3.0;

const vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
const vec2 boundMin = vec2(0.0, 0.0);
const vec2 boundMax = vec2(1.0, 1.0);

bool inBounds (vec2 p) {
  return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));
}

vec4 bgColor (vec2 p, vec2 pfr, vec2 pto) {
  vec4 c = black;
  pfr = pfr * vec2(1.0, -1.0) + vec2(0.0, -0.02);
  if (inBounds(pfr)) {
    c += mix(black, texture2D(from, pfr), reflection * mix(1.0, -1.0, pfr.y));
  }
  pto = pto * vec2(1.0, -1.0) + vec2(0.0, -0.02);
  if (inBounds(pto)) {
    c += mix(black, texture2D(to, pto), reflection * mix(1.0, -1.0, pto.y));
  }
  return c;
}

void main() {
  vec2 p = gl_FragCoord.xy / resolution.xy;

  vec2 pfr, pto = vec2(-1.);

  float size = mix(1.0, maxDepth, progress);
  float persp = perspective * progress;
  pfr = (p + vec2(-0.0, -0.5)) * vec2(size/(1.0-perspective*progress), size/(1.0-size*persp*p.x)) + vec2(0.0, 0.5);

  size = mix(1.0, maxDepth, 1.-progress);
  persp = perspective * (1.-progress);
  pto = (p + vec2(-1.0, -0.5)) * vec2(size/(1.0-perspective*(1.0-progress)), size/(1.0-size*persp*(0.5-p.x))) + vec2(1.0, 0.5);

  bool fromOver = progress < 0.5;

  if (fromOver) {
    if (inBounds(pfr)) {
      gl_FragColor = texture2D(from, pfr);
    }
    else if (inBounds(pto)) {
      gl_FragColor = texture2D(to, pto);
    }
    else {
      gl_FragColor = bgColor(p, pfr, pto);
    }
  }
  else {
    if (inBounds(pto)) {
      gl_FragColor = texture2D(to, pto);
    }
    else if (inBounds(pfr)) {
      gl_FragColor = texture2D(from, pfr);
    }
    else {
      gl_FragColor = bgColor(p, pfr, pto);
    }
  }
  
}

