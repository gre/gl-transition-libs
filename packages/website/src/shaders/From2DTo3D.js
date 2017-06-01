//@flow
import React, { Component } from "react";
import createShadertoy from "./createShadertoy";

export const credit = "https://www.shadertoy.com/view/lt2GWw";

export default createShadertoy(`
  const int MAX_RAY_STEPS = 64;
  #define time  iGlobalTime
  //Comment to see the 2D pattern
  #define pattern3D
  #define var1
  #ifdef var1
      float scale = 0.3;
      float size  = 0.45;
      float intens = 1.5;
  #else
      float scale = 0.55;
      float size  = 0.43;
      float intens = 1.21;
  #endif
  //-----------------------------
  vec3 rotationCoord(vec3 n, in float t)
  {
     vec3 result;
     vec2 sc = vec2(sin(t), cos(t));
     mat3 rotate;

        rotate = mat3( sc.y,  0.0, -sc.x,
                       0.0,   1.0,  0.0,
                       sc.x,  0.0, sc.y);
    result = n * rotate;
    return result;
  }
  //----------------------------------------------------
  float pattern(in vec3 p)
  {
     float v = 0.;
     p *= scale;
     for (int i = 0; i < 10; ++i)
           p = abs(p) / dot(p, p) - vec3(size);
     v = dot(p, p) * intens;
     return v;

  }
  //-------------------------------------------------
  float render(in vec3 posOnRay, in vec3 rayDir)
  {
    float t = 0.0;
    float maxDist = 30.;
    float d = 0.1;

    for(int i=0; i<MAX_RAY_STEPS; ++i)
    {
      if (abs(d) <0.0001 || t > maxDist)
           break;
      t += d;
      posOnRay += rayDir * 1.0/ (d + 0.35);
      d = pattern(posOnRay);;
    }

     return d;
  }

  //------------------------------------------

  void mainImage( out vec4 fragColor, in vec2 fragCoord )
  {
      vec2 pos     =  gl_FragCoord.xy / iResolution.xy * 2. - 1.;
      pos.x *= iResolution.x / iResolution.y;
      vec3 p= vec3(pos, 1. );
      #ifdef var1
          p *= scale;
      #endif

      vec3 col = vec3(0);
      float t = 0.;
    #ifdef pattern3D
    {
      vec3 camP =  vec3(0., 0., -1.);
      vec3 camUp = vec3(0. , 1., 0.);
      vec3 camDir = normalize(-camP);
      vec3 u = normalize(cross(camUp,camDir));
      vec3 v = cross(camDir,u);
      vec3 rayDir = normalize(camDir * 2. + pos.x * u + pos.y * v);

      vec4 color    = vec4(1.0);
      vec3 posOnRay = vec3(80., 0., 0.);
    //---------------------------
     posOnRay = rotationCoord(posOnRay,time / 2.0);
     rayDir = rotationCoord(rayDir,time / 2.0 + 3.14 / 2.0);
     t = render(posOnRay, rayDir);
    }
    #else
      t = pattern(p) ;
   #endif
      col = vec3(0.5 * t * t * t, 0.6 * t * t, 0.7 * t);
      col = min(col, 1.0) - 0.28 * (log(col + 1.));
      fragColor = vec4(sqrt(col.rgb), 1.0);
  }
`);
