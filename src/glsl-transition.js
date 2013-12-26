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

function GlslTransition (canvas) {
  if (arguments.length !== 1 || !("getContext" in canvas))
    throw new Error("Bad arguments. usage: GlslTransition(canvas)");

  var gl = getWebGLContext(canvas);
  var currentTransition;
  var drawing = false;

  canvas.addEventListener("webglcontextlost", function (e) {
    e.preventDefault();
    gl = null;
  });
  canvas.addEventListener("webglcontextrestored", function () {
    gl = getWebGLContext(canvas);
    // TODO trigger some internal events to being able to recompute all programs...
  });

  function createTexture (image) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
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

  return function createTransition (glsl, options) {
    var progressParameter = options && options.progress || "progress";
    var resolutionParameter = options && options.resolution || "resolution";
    var defaultUniforms = options && options.uniforms || {};
    if (arguments.length < 1 || arguments.length > 2 || typeof glsl !== "string" || typeof progressParameter !== "string")
      throw new Error("Bad arguments. usage: T(glsl [, options])");

    var shader, textureUnits;

    function load () {
      shader = loadTransitionShader(glsl);
      textureUnits = {};
      var types = glslExports(glsl); // FIXME: we can remove the glslExports call when gl-shader gives access to those types
      var i = 0;
      for (var name in types.uniforms) {
        var t = types.uniforms[name];
        if (t === "sampler2D") {
          textureUnits[name] = i++;
        }
      }
    }

    function syncViewport () {
      var w = canvas.width, h = canvas.height;
      gl.viewport(0, 0, w, h);
      if (currentTransition) {
        currentTransition.uniforms[resolutionParameter] = [ w, h ];
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
        gl.activeTexture(gl.TEXTURE0 + i);
        var texture = createTexture(value); // FIXME TODO: we may me able to create it once!
        gl.bindTexture(gl.TEXTURE_2D, texture);
        shader.uniforms[name] = i;
      }
      else if (typeof value === "number") {
        shader.uniforms[name] = value;
      }
    }

    function startRender (transitionDuration, transitionEasing) {
      // TODO: there is no error case handle yet! we have to stop when something goes wrong (context lost, exception in draw,...)
      var transitionStart = Date.now();
      var d = Q.defer();
      drawing = true;
      (function render () {
        var now = Date.now();
        var p = (now-transitionStart)/transitionDuration;
        if (p<1) {
          requestAnimationFrame(render, canvas);
          setProgress(transitionEasing(p));
          draw();
        }
        else {
          setProgress(transitionEasing(1));
          draw();
          drawing = false;
          d.resolve();
        }
      }());
      return d.promise;
    }

    load();
    // TODO on webglcontextrestored, recompute the shader..

    return function transition (uniforms, duration, easing) {
      if (!easing) easing = identity;
      if (arguments.length < 2 || arguments.length > 3 || typeof duration !== "number" || duration <= 0 || typeof easing !== "function")
        throw new Error("Bad arguments. usage: t(imageFrom, imageTo, duration, easing) -- duration must be an integer > 0 and easing is optional.");

      if (!gl) return Q.reject(new Error("WebGL context is null."));
      if (drawing) return Q.reject(new Error("another transition is already running."));

      if (currentTransition !== shader) {
        currentTransition = shader;
        shader.bind();
      }

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

      return startRender(duration, easing);
    };
  };
}

GlslTransition.isSupported = function () {
  var c = document.createElement("canvas");
  return !!getWebGLContext(c);
};

module.exports = GlslTransition;
