var Q = require("q");
var createShader = require("gl-shader");
var glslExports = require("glsl-exports"); // FIXME: temporary required because gl-shader does not expose types

var VERTEX_SHADER = 'attribute vec2 position; void main() { gl_Position = vec4(2.0*position-1.0, 0.0, 1.0);}';

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

// requestAnimationFrame polyfill
var requestAnimationFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          window.mozRequestAnimationFrame    ||
          window.webkitRequestAnimationFrame ||
          function (callback) {
            window.setTimeout(callback, 1000 / 60);
          };
})();

function identity (x) { return x; }

/**
 * API:
 * GlslTransition(canvas)(glslSource, options)(uniforms, duration, easing) // => Promise
 */

/**
 * ~~~ First Call in the API
 * GlslTransition(canvas)
 * Creates a Transitions context with a canvas.
 */
function GlslTransition (canvas) {
  if (arguments.length !== 1 || !("getContext" in canvas))
    throw new Error("Bad arguments. usage: GlslTransition(canvas)");

  // First level variables
  var gl, currentShader, currentAnimationD, transitions;

  function init () {
    transitions = [];
    gl = getWebGLContext(canvas);
    canvas.addEventListener("webglcontextlost", onContextLost, false);
    canvas.addEventListener("webglcontextrestored", onContextRestored, false);
  }

  function onContextLost (e) {
    e.preventDefault();
    gl = null;
    if (currentAnimationD) {
      currentAnimationD.reject(e);
      currentAnimationD = null;
    }
    for (var i=0; i<transitions.length; ++i) {
      transitions[i].onContextLost(e);
    }
  }

  function onContextRestored (e) {
    gl = getWebGLContext(canvas);
    for (var i=0; i<transitions.length; ++i) {
      transitions[i].onContextRestored(e);
    }
  }

  function createTexture () {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }

  function syncTexture (texture, image) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  }

  function loadTransitionShader (glsl) {
    var shader = createShader(gl, VERTEX_SHADER, glsl);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    shader.attributes.position.pointer();
    shader.attributes.position.enable();
    return shader;
  }
  
  function draw () {
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /**
   * ~~~ Second Call in the API
   * createTransition(glslSource, [options])
   * Creates a GLSL Transition for the current canvas context.
   */
  function createTransition (glsl, options) {
    var progressParameter = options && options.progress || "progress";
    var resolutionParameter = options && options.resolution || "resolution";
    var defaultUniforms = options && options.uniforms || {};
    if (arguments.length < 1 || arguments.length > 2 || typeof glsl !== "string" || typeof progressParameter !== "string")
      throw new Error("Bad arguments. usage: T(glsl [, options])");

    // Second level variables
    var shader, textureUnits, textures, currentAnimationD;

    var types = glslExports(glsl); // FIXME: we can remove the glslExports call when gl-shader gives access to those types
    function load () {
      if (!gl) return;
      shader = loadTransitionShader(glsl);
      textureUnits = {};
      textures = {};
      var i = 0;
      for (var name in types.uniforms) {
        var t = types.uniforms[name];
        if (t === "sampler2D") {
          gl.activeTexture(gl.TEXTURE0 + i);
          textureUnits[name] = i;
          textures[name] = createTexture();
          i ++;
        }
      }
    }

    function onContextLost () {
      shader = null;
    }

    function onContextRestored () {
      load();
    }

    function syncViewport () {
      var w = canvas.width, h = canvas.height;
      gl.viewport(0, 0, w, h);
      if (currentShader) {
        currentShader.uniforms[resolutionParameter] = [ w, h ];
      }
      var x1 = 0, x2 = w, y1 = 0, y2 = h;
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2
      ]), gl.STATIC_DRAW);
    }

    function setProgress (p) {
      shader.uniforms[progressParameter] = p;
    }

    function setUniform (name, value) {
      if (name in textureUnits) {
        var i = textureUnits[name];
        var texture = textures[name];
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        syncTexture(texture, value);
        shader.uniforms[name] = i;
      }
      else if (typeof value === "number") {
        shader.uniforms[name] = value;
      }
    }

    function animate (transitionDuration, transitionEasing) {
      var transitionStart = Date.now();
      var d = Q.defer();
      currentAnimationD = d;
      (function render () {
        if (!currentAnimationD) return;
        var now = Date.now();
        var p = (now-transitionStart)/transitionDuration;
        try {
          if (p<1) {
            requestAnimationFrame(render, canvas);
            setProgress(transitionEasing(p));
            draw();
          }
          else {
            setProgress(transitionEasing(1));
            draw();
            d.resolve(); // FIXME: what to resolve?
            currentAnimationD = null;
          }
        }
        catch (e) {
          d.reject(e);
          currentAnimationD = null;
        }
      }());
      return d.promise;
    }

    /**
     * ~~~ Third Call in the API
     * transition(uniforms, duration, [easing])
     * Perform a transition animation with uniforms paremeters to give in the GLSL, for a given duration and a custom easing function (default is linear).
     */
    function transition (uniforms, duration, easing) {
      if (!easing) easing = identity;
      // Validate Bad Arguments static errors
      if (arguments.length < 2 || arguments.length > 3 || typeof uniforms !== "object" || typeof duration !== "number" || duration <= 0 || typeof easing !== "function")
        throw new Error("Bad arguments. usage: t(uniforms, duration, easing) -- uniforms is an Object, duration an integer > 0, easing an optional function.");

      // Validate Runtime errors
      if (!gl) return Q.reject(new Error("WebGL context is null."));
      if (currentAnimationD) return Q.reject(new Error("another transition is already running."));
      try {
        if (!shader) load(); // Possibly shader was not loaded before because of no gl available.
      }
      catch (e) {
        return Q.reject(e);
      }

      // If shader has changed, we need to bind it
      if (currentShader !== shader) {
        currentShader = shader;
        shader.bind();
      }

      // Set all uniforms
      for (var name in shader.uniforms) {
        if (name === progressParameter || name === resolutionParameter) continue;
        if (name in defaultUniforms) {
          setUniform(name, defaultUniforms[name]);
        }
        else if (name in uniforms) {
          setUniform(name, uniforms[name]);
        }
        else {
          throw new Error("You must provide a value for uniform '"+name+"'.");
        }
      }
      syncViewport();
      setProgress(0);

      // Perform the transition
      return animate(duration, easing);
    }

    transition.onContextLost = onContextLost;
    transition.onContextRestored = onContextRestored;

    // Finally load the transition and put it in the transitions array
    load();
    transitions.push(transition);

    return transition;
  }

  // Finally init the GlslTransition context
  init();

  return createTransition;
}

GlslTransition.isSupported = function () {
  var c = document.createElement("canvas");
  return !!getWebGLContext(c);
};

module.exports = GlslTransition;
