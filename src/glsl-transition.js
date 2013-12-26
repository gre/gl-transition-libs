/*jslint newcap: true */
var Q = require("q");
var createShader = require("gl-shader");

var VERTEX_SHADER = 'attribute vec2 position;attribute vec2 texCoord_in;uniform vec2 resolution;varying vec2 texCoord;void main() {vec2 zeroToOne = position / resolution;vec2 zeroToTwo = zeroToOne * 2.0;vec2 clipSpace = zeroToTwo - 1.0;gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);texCoord = texCoord_in;}';
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

function extend (obj) {
  for(var a=1; a<arguments.length; ++a) {
    var source = arguments[a];
    for (var prop in source)
      if (source[prop] !== void 0) obj[prop] = source[prop];
  }
  return obj;
}

function identity (x) {
  return x;
}

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
    // TODO trigger
  });

  function setRectangle (x, y, width, height) {
    var x1 = x, x2 = x + width, y1 = y, y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2
    ]), gl.STATIC_DRAW);
  }

  function syncUniformResolution (program, w, h) {
    var resolutionLocation = gl.getUniformLocation(program, "resolution");
    gl.uniform2f(resolutionLocation, w, h);
  }

  function syncViewport () {
    var w = canvas.width, h = canvas.height;
    gl.viewport(0, 0, w, h);

    if (currentTransition) {
      syncUniformResolution(currentTransition.program, w, h);
    }
    /*
    var img = images[sandbox.opt("slide")];
    if (img) h = Math.floor(w * img.height / img.width);
    */
    setRectangle(0, 0, w, h);
  }

  function createTexture (image) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // FIXME: the following line throw an error for cross domain images...
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

    // buffer
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), gl.STATIC_DRAW);

    // texCoord
    var texCoordLocation = gl.getAttribLocation(shader.program, "texCoord_in");
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // position
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    var positionLocation = gl.getAttribLocation(shader.program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    return shader;
  }
  
  function draw () {
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  return function createTransition (glsl, options) {
    var progressParameter = options && options.progress || "progress";
    var defaultUniforms = options && options.uniforms || {};
    if (arguments.length < 1 || arguments.length > 2 || typeof glsl !== "string" || typeof progressParameter !== "string")
      throw new Error("Bad arguments. usage: T(glsl [, options])");

    var shader = loadTransitionShader(glsl);
    var locations = {};

    function setProgress (p) {
      if(!(progressParameter in locations)) locations[progressParameter] = gl.getUniformLocation(shader.program, progressParameter);
      gl.uniform1f(locations[progressParameter], p);
    }

    function startRender (transitionDuration, transitionEasing) {
      // FIXME: there is no error case handle yet! we have to stop when something goes wrong (context lost, exception in draw,...)
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

    // TODO bind webglcontextrestored and recompute stuff..

    return function transition (uniforms, duration, easing) {
      if (!easing) easing = identity;
      if (arguments.length < 2 || arguments.length > 3 || typeof duration !== "number" || duration <= 0 || typeof easing !== "function")
        throw new Error("Bad arguments. usage: t(imageFrom, imageTo, duration/*number>0*/ [, easing])");

      if (currentTransition !== shader) {
        if (currentTransition) {
          currentTransition = null;
        }
        gl.useProgram(shader.program);
      }
      currentTransition = shader;

      var allUniforms = extend({}, defaultUniforms, uniforms);

      for (var name in allUniforms) {
        var value = allUniforms[value];
        // FIXME: if value is sampler, need to allocate texture
        shader.uniforms[name] = value;
      }

      // FIXME: this is for now static in the code...
      var fromTexture = createTexture(uniforms.from),
          toTexture = createTexture(uniforms.to);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fromTexture);
      shader.uniforms.from = 0;

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, toTexture);
      shader.uniforms.to = 1;

      syncViewport();
      setProgress(0);

      if (!gl) return Q.reject(new Error("WebGL is unsupported"));
      if (drawing) return Q.reject(new Error("another transition is already running."));
      return startRender(duration, easing);
    };
  };
}

GlslTransition.isSupported = function () {
  var c = document.createElement("canvas");
  return !!getWebGLContext(c);
};

module.exports = GlslTransition;
