#ifdef GL_ES
precision highp float;
#endif

/**
 * Inspired from http://labs.calyptus.eu/pagecurl/
 * Copyright © 2010 Calyptus Life AB.
 */

// General parameters
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform vec2 resolution;

float PI = 3.141592;
float radius = 1.0 / PI / 2.0;
float scale = 512.0;
float sharpness = 3.0;

float amount () {
  return 1.3 * progress;
}

float cylinderCenter(){
  return amount();
}

float cylinderAngle(){
  return radians(360.0 * amount());
}

vec4 antiAlias(vec4 color1, vec4 color2, float d)
{
  d *= scale;
  if (d < 0.0) return color2;
  if (d > 2.0) return color1;
  float dd = pow(1.0 - d / 2.0, sharpness);
  return ((color2 - color1) * dd) + color1;
}

float distanceToEdge(vec3 point){
  float dx = abs(point.x > 0.5 ? 1.0 - point.x : point.x);
  float dy = abs(point.y > 0.5 ? 1.0 - point.y : point.y);
  if (point.x < 0.0) dx = -point.x;
  if (point.x > 1.0) dx = point.x - 1.0;
  if (point.y < 0.0) dy = -point.y;
  if (point.y > 1.0) dy = point.y - 1.0;
  if ((point.x < 0.0 || point.x > 1.0) && (point.y < 0.0 || point.y > 1.0)) return sqrt(dx * dx + dy * dy);
  return min(dx, dy);
}

vec4 seeThrough(float yc, vec2 p, mat3 rotation, mat3 rrotation){
  float hitAngle = mod(180.0 - degrees(acos(yc / radius) - cylinderAngle()), 360.0);
  float hitPoint = hitAngle / 360.0;
  vec3 point = rotation * vec3(p, 1.0);
  point.y = hitPoint;
  point = rrotation * point;

  if (yc <= 0.0 && (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0)){
    return vec4(0.0, 0.0, 0.0, 0.0);
  }

  if (yc > 0.0) return texture2D(from, p);

  vec4 color = texture2D(from, vec2(point.x, point.y));
  vec4 tcolor = vec4(0.0, 0.0, 0.0, 0.0);

  return antiAlias(color, tcolor, distanceToEdge(point));
}

vec4 seeThroughWithShadow(float yc, vec2 p, vec3 point, mat3 rotation, mat3 rrotation){
  float shadow = distanceToEdge(point) * 30.0;
  shadow = (1.0 - shadow) / 3.0;
  if (shadow < 0.0) shadow = 0.0;
  else shadow *= amount();

  vec4 shadowColor = seeThrough(yc, p, rotation, rrotation);
  shadowColor.r -= shadow;
  shadowColor.g -= shadow;
  shadowColor.b -= shadow;
  return shadowColor;
}

vec4 backside(float yc, vec3 point){
  vec4 color = texture2D(from, vec2(point.x, point.y));
  float gray = (color.r + color.b + color.g) / 15.0;
  gray += (8.0 / 10.0) * (pow(1.0 - abs(yc / radius), 2.0 / 10.0) / 2.0 + (5.0 / 10.0));
  color.r = gray;
  color.g = gray;
  color.b = gray;
  return color;
}

vec4 behindSurface(float yc, vec3 point, mat3 rrotation){
  float shado = (1.0 - ((-radius - yc) / amount() * 7.0)) / 6.0;
  shado *= 1.0 - abs(point.x - 5.0 / 10.0);

  yc = (-radius - radius - yc);

  float hitAngle = mod(degrees(acos(yc / radius) + cylinderAngle()) - 180.0, 360.0);

  float hitPoint = hitAngle / 360.0;

  point.y = hitPoint;

  point = rrotation * point;

  if (yc < 0.0 && point.x >= 0.0 && point.y >= 0.0 && point.x <= 1.0 && point.y <= 1.0 && (hitAngle < 180.0 || amount() > 5.0 / 10.0)){
    shado = 1.0 - (sqrt(pow(point.x - (5.0 / 10.0), 2.0) + pow(point.y - (5.0 / 10.0), 2.0)) / (71.0 / 100.0));
    shado *= pow(-yc / radius, 3.0);
    shado *= 5.0 / 10.0;
  } else
    shado = 0.0;

  return vec4(0.0, 0.0, 0.0, shado);
}

void main(void) {
  float angle = 30.0;
  float c = cos(radians(-angle));
  float s = sin(radians(-angle));

  mat3 rotation = mat3(
      c, s, 0,
      -s, c, 0,
      0.12, 0.258, 1
      );

  c = cos(radians(angle));
  s = sin(radians(angle));

  mat3 rrotation = mat3(
      c, s, 0,
      -s, c, 0,
      0.15, -0.5, 1
      );

  vec2 p = vec2(gl_FragCoord.x / resolution.x, gl_FragCoord.y / resolution.y);
  vec3 point = rotation * vec3(p, 1.0);
  float y = point.y;

  float yc = y - cylinderCenter();

  if (yc < -radius)
  {
    // Behind surface
    gl_FragColor = texture2D(to, p) - behindSurface(yc, point, rrotation);
    return;
  }

  if (yc > radius)
  {
    // Flat surface
    gl_FragColor = texture2D(from, p);
    return;
  }

  float hitAngle = mod(degrees(acos(yc / radius) + cylinderAngle()) - 180.0, 360.0);

  float hitPoint = hitAngle / 360.0;

  point.y = hitPoint;

  point = rrotation * point;


  if ((hitAngle > 180.0 && amount() < 5.0 / 10.0) || (hitAngle > 90.0 && amount() < 0.0))
  {
    gl_FragColor = seeThrough(yc, p, rotation, rrotation);
    return;
  }

  if (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0){
    gl_FragColor = seeThroughWithShadow(yc, p, point, rotation, rrotation);
    return;
  }

  vec4 color = backside(yc, point);

  vec4 otherColor;
  if (yc < 0.0){

    float shado = 1.0 - (sqrt(pow(point.x - 0.5, 2.0) + pow(point.y - 0.5, 2.0)) / 0.71);
    shado *= pow(-yc / radius, 3.0);
    shado *= 0.5;

    otherColor = texture2D(to, p) - vec4(0.0, 0.0, 0.0, shado);
  } else {
    otherColor = texture2D(from, p);
  }

  color = antiAlias(color, otherColor, radius - abs(yc));

  vec4 cl = seeThroughWithShadow(yc, p, point, rotation, rrotation);
  float dist = distanceToEdge(point);

  gl_FragColor = antiAlias(color, cl, dist);
}

