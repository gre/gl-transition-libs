var Q = require("q");
var createShader = require("gl-shader-core");
var glslExports = require("glsl-exports");

var VERTEX_SHADER = 'attribute vec2 position; void main() { gl_Position = vec4(2.0*position-1.0, 0.0, 1.0);}';
var VERTEX_TYPES = glslExports(VERTEX_SHADER);
var PROGRESS_UNIFORM = "progress";
var RESOLUTION_UNIFORM = "resolution";

var CONTEXTS = ["webgl", "experimental-webgl"];
function getWebGLContext (canvas, options) {
  if (!canvas.getContext) return;
  for (var i = 0; i < CONTEXTS.length; ++i) {
    try {
      var ctx = canvas.getContext(CONTEXTS[i], options||{});
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

function extend (obj) {
  for(var a=1; a<arguments.length; ++a) {
    var source = arguments[a];
    for (var prop in source)
      if (source[prop] !== void 0) obj[prop] = source[prop];
  }
  return obj;
}

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
function GlslTransition (canvas, opts) {
  if (arguments.length !== 1 || !("getContext" in canvas))
    throw new Error("Bad arguments. usage: GlslTransition(canvas)");

  var contextAttributes = extend({}, opts && opts.contextAttributes || {}, GlslTransition.defaults.contextAttributes);

  // First level variables
  var gl, currentShader, currentAnimationD, transitions;

  function init () {
    transitions = [];
    gl = getWebGLContext(canvas, contextAttributes);
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
    gl = getWebGLContext(canvas, contextAttributes);
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

  function loadTransitionShader (glsl, glslTypes) {
    var uniformsByName = extend({}, glslTypes.uniforms, VERTEX_TYPES.uniforms);
    var attributesByName = extend({}, glslTypes.attributes, VERTEX_TYPES.attributes);
    var name;
    var uniforms = [];
    var attributes = [];
    for (name in uniformsByName) {
      uniforms.push({ name: name, type: uniformsByName[name] });
    }
    for (name in attributesByName) {
      attributes.push({ name: name, type: attributesByName[name] });
    }
    var shader = createShader(gl, VERTEX_SHADER, glsl, uniforms, attributes);
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
   * createTransition(glslSource, [uniforms])
   * Creates a GLSL Transition for the current canvas context.
   */
  function createTransition (glsl, defaultUniforms) {
    if (!defaultUniforms) defaultUniforms = {};
    if (arguments.length < 1 || arguments.length > 2 || typeof glsl !== "string")
      throw new Error("Bad arguments. usage: T(glsl [, options])");

    var glslTypes = glslExports(glsl);

    for (var name in defaultUniforms) {
      if (name === RESOLUTION_UNIFORM) {
        throw new Error("The '"+name+"' uniform is reserved, you must not use it.");
      }
      if (!(name in glslTypes.uniforms)) {
        throw new Error("uniform '"+name+"': This uniform does not exist in your GLSL code.");
      }
    }

    // Second level variables
    var shader, textureUnits, textures, currentAnimationD;

    function load () {
      if (!gl) return;
      shader = loadTransitionShader(glsl, glslTypes);
      textureUnits = {};
      textures = {};
      var i = 0;
      for (var name in glslTypes.uniforms) {
        var t = glslTypes.uniforms[name];
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
        currentShader.uniforms[RESOLUTION_UNIFORM] = [ w, h ];
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
      shader.uniforms[PROGRESS_UNIFORM] = p;
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
      else {
        shader.uniforms[name] = value;
      }
    }

    function animate (transitionDuration, transitionEasing) {
      var transitionStart = Date.now();
      var frames = 0;
      var d = Q.defer();
      currentAnimationD = d;
      (function render () {
        if (!currentAnimationD) return;
        ++ frames;
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
            d.resolve({ startAt: transitionStart, endAt: now, elapsedTime: now-transitionStart, frames: frames }); // Resolve some meta-data of the successful transition.
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

      // Validate static errors: Bad arguments / missing uniforms
      if (arguments.length < 2 || arguments.length > 3 || typeof uniforms !== "object" || typeof duration !== "number" || duration <= 0 || typeof easing !== "function")
        throw new Error("Bad arguments. usage: t(uniforms, duration, easing) -- uniforms is an Object, duration an integer > 0, easing an optional function.");

      var allUniforms = extend({}, defaultUniforms, uniforms);
      allUniforms[PROGRESS_UNIFORM] = easing(0);
      var name;
      for (name in glslTypes.uniforms) {
        if (name === RESOLUTION_UNIFORM) continue;
        if (!(name in allUniforms)) {
          throw new Error("uniform '"+name+"': You must provide an initial value.");
        }
      }
      for (name in uniforms) {
        if (name === RESOLUTION_UNIFORM) {
          throw new Error("The '"+name+"' uniform is reserved, you must not use it.");
        }
        if (!(name in glslTypes.uniforms)) {
          throw new Error("uniform '"+name+"': This uniform does not exist in your GLSL code.");
        }
      }

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
      for (name in allUniforms) {
        setUniform(name, allUniforms[name]);
      }
      syncViewport();

      // Perform the transition
      return animate(duration, easing);
    }

    transition.getUniforms = function () {
      return extend({}, glslTypes);
    };

    transition.onContextLost = onContextLost;
    transition.onContextRestored = onContextRestored;

    // Finally load the transition and put it in the transitions array
    load();
    transitions.push(transition);

    return transition;
  }

  createTransition.getGL = function () {
    return gl;
  };

  // Finally init the GlslTransition context
  init();

  return createTransition;
}

GlslTransition.defaults = {
  contextAttributes: { preserveDrawingBuffer: true }
};

GlslTransition.isSupported = function () {
  var c = document.createElement("canvas");
  return !!getWebGLContext(c);
};

module.exports = GlslTransition;
