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

vec4 blur(sampler2D t, vec2 c, float b) {
   vec4 sum = texture2D(t, c);
   sum += texture2D(t, c+b*vec2(-0.326212, -0.405805));
   sum += texture2D(t, c+b*vec2(-0.840144, -0.073580));
   sum += texture2D(t, c+b*vec2(-0.695914,  0.457137));
   sum += texture2D(t, c+b*vec2(-0.203345,  0.620716));
   sum += texture2D(t, c+b*vec2( 0.962340, -0.194983));
   sum += texture2D(t, c+b*vec2( 0.473434, -0.480026));
   sum += texture2D(t, c+b*vec2( 0.519456,  0.767022));
   sum += texture2D(t, c+b*vec2( 0.185461, -0.893124));
   sum += texture2D(t, c+b*vec2( 0.507431,  0.064425));
   sum += texture2D(t, c+b*vec2( 0.896420,  0.412458));
   sum += texture2D(t, c+b*vec2(-0.321940, -0.932615));
   sum += texture2D(t, c+b*vec2(-0.791559, -0.597705));
   return sum / 13.0;
}

void main()
{
  vec2 p = gl_FragCoord.xy / resolution.xy;
  float inv = 1.-progress;
  gl_FragColor = inv*blur(from, p, progress*size) + progress*blur(to, p, inv*size);
}

