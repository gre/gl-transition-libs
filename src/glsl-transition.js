/*jslint newcap: true */
(function (definition) {
  if (typeof exports === "object") {
    module.exports = definition(require("q"));
  }
  else if (typeof window.define === 'function' && window.define.amd) {
    window.define(["q"], definition);
  } else {
    window.GlslTransition = definition(window.Q);
  }
}(function (Q) {

  var CONTEXTS = ["webgl", "experimental-webgl"];
  function getWebGLContext (canvas) {
    if (!canvas.getContext) return;
    for (var i = 0; i < CONTEXTS.length; ++i) {
      try {
        var ctx = canvas.getContext(CONTEXTS[i]);
        if (ctx) return ctx;
      } catch(e) {
      }
    }
  }

  function identity (x) {
    return x;
  }

  function GlslTransition (canvas) {
    if (arguments.length !== 1 || !("getContext" in canvas))
      throw new Error("Bad arguments. usage: GlslTransition(canvas)");

    return function Transition (glsl, options) {
      var progressParameter = options && options.progress || "progress";
      if (arguments.length < 1 || arguments.length > 2 || typeof glsl !== "string" || typeof progressParameter !== "string")
        throw new Error("Bad arguments. usage: T(glsl [, options])");

      var gl = getWebGLContext(canvas);
      // TODO: create the program for this glsl
      
      return function transition (uniforms, duration, easing) {
        if (!easing) easing = identity;
        if (arguments.length < 2 || arguments.length > 3 || typeof duration !== "number" || duration <= 0 || typeof easing !== "function")
          throw new Error("Bad arguments. usage: t(imageFrom, imageTo, duration/*number>0*/ [, easing])");

        if (!gl) return Q.reject(new Error("WebGL is unsupported"));
        // TODO: is the program used? affect it if not and delete the (maybe) old one.
        // TODO implement the transition
        return Q();
      };
    };
  }

  GlslTransition.isSupported = function () {
    var c = document.createElement("canvas");
    return !!getWebGLContext(c);
  };

  return GlslTransition;
}));
