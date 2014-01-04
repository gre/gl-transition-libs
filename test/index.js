var GlslTransition = require("../src/glsl-transition.js");
var assert = require("assert");
var util = require("./util");
var Q = require("q");
var Qimage = require("qimage");
var WebGLDebugUtils = window.WebGLDebugUtils;

var GLSL_FADE = "#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform vec2 resolution;\nuniform float progress;\nuniform sampler2D from, to;\n\nvoid main (void) {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  gl_FragColor = mix(texture2D(from, p), texture2D(to, p), progress);\n}\n";
var GLSL_FADETOCOLOR = "#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform vec2 resolution;\nuniform float progress;\nuniform sampler2D from, to;\nuniform vec3 color;\nuniform float colorPhase;\n\nvoid main (void) {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  gl_FragColor = mix(mix(vec4(color, 1.0), texture2D(from, p), smoothstep(1.0-colorPhase, 0.0, progress)) , \n                 mix(vec4(color, 1.0), texture2D(to,   p), smoothstep(    colorPhase, 1.0, progress)), progress);\n}\n";
var GLSL_DEFORMATION = "#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform vec2 resolution;\nuniform float progress;\nuniform sampler2D from, to;\nuniform float size, zoom;\n\nvoid main (void) {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  \n  float inv = 1. - progress;\n  vec2 disp = size*vec2(cos(zoom*p.x), sin(zoom*p.y));\n  vec4 texTo = texture2D(to, p + inv*disp);\n  vec4 texFrom = texture2D(from, p + progress*disp);\n  gl_FragColor = texTo*progress + texFrom*inv;\n}\n";

var W = 300;
var H = 200;

function linear (x) {
  return x;
}

function success (msg) {
  return function () {
    assert(true, msg||"success");
  };
}
function failure (msg) {
  return function (e) {
    console.log(e);
    assert(false, msg||"failure");
  };
}

// Because Q unify exceptions into failure, this assert there is no exception
function safe (f) {
  return function () {
    try {
      return f.apply(this, arguments);
    }
    catch (e) {
      assert.doesNotThrow(function(){ throw e; });
    }
  };
}

var testcontainer = document.getElementById("testcontainer");
var lastCanvases = [];
function replace (c) {
  if (lastCanvases.length > 1) {
    testcontainer.removeChild(lastCanvases.pop());
  }
  testcontainer.appendChild(c);
  lastCanvases.unshift(c);
}

function createCanvas () {
  var canvas = util.createCanvas(W, H);
  replace(canvas);
  return canvas;
}

function arrayEquals (a, b) {
  if (a.length !== b.length) return false;
  for (var i=0; i<a.length; ++i) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function randomDeformationUniforms () {
  return {
    size: 0.01 + 0.1 * Math.random(),
    zoom: 4 + 40 * Math.random()
  };
}
function randomFadeToColorUniforms () {
  return {
    color: [ Math.random(), Math.random(), Math.random() ],
    colorPhase: 0.1 + 0.8 * Math.random()
  };
}

describe('WebGL', function () {
  it('is supported', function () {
    assert(GlslTransition.isSupported(), "WebGL is supported. Required for the tests.");
  });
});

if (!GlslTransition.isSupported()) {
  mocha.checkLeaks();
  mocha.run();
  throw new Error("WebGL is not supported.");
}

Q.all([
  "./images/0.jpg",
  "./images/1.jpg",
  "./images/2.jpg",
  "./images/3.jpg",
  "./images/4.jpg",
  "./images/5.jpg",
  "./images/6.jpg",
  "./images/7.jpg",
  "./images/8.jpg",
  "./images/9.jpg"
].map(Qimage)).then(safe(function (images) {

  function random2ImageIndexes () {
    var i = Math.floor(images.length*Math.random());
    var j = Math.floor((images.length-1)*Math.random());
    if (j >= i) j++;
    return [i, j];
  }

  function randomFromTo (obj) {
    var indexes = random2ImageIndexes();
    if (!obj) obj = {};
    obj.from = images[indexes[0]];
    obj.to = images[indexes[1]];
    return obj;
  }

  function isValidDuration (obj, duration, imprecision) {
    return Math.abs(1 - obj.elapsedTime/duration) < imprecision;
  }

  describe('GlslTransition', function () {
    it('should be a function', function () {
      assert.equal(typeof GlslTransition, "function", "GlslTransition is a function");
    });
    it('should have .isSupported() function', function () {
      assert.equal(typeof GlslTransition.isSupported, "function", "GlslTransition.isSupported is a function");
      assert.equal(GlslTransition.isSupported(), true, "GlslTransition is supported.");
    });
  });

  describe('GlslTransition(canvas)', function () {
    it('should be instanciable', function () {
      var Transition = GlslTransition(createCanvas());
      assert.equal(typeof Transition, "function", "Transition(canvas) instance is a function");
    });
    it('should failed with bad arguments', function () {
      assert.throws(function () { GlslTransition(); });
      assert.throws(function () { GlslTransition(null); });
      assert.throws(function () { GlslTransition(1); });
      assert.throws(function () { GlslTransition({}); });
      assert.throws(function () { GlslTransition(document.createElement("div")); });
    });
  });

  describe('Transition(glsl, opts)', function () {
    it('should be instanciable', function () {
      var Transition = GlslTransition(createCanvas());
      assert.equal(typeof Transition(GLSL_FADE), "function", "GlslTransition(canvas) instance is a function");
    });
    it('can creates a few transitions', function () {
      var Transition = GlslTransition(createCanvas());
      for (var i=0; i<20; ++i) {
        if (i % 3 === 0) {
          Transition(GLSL_FADE);
        }
        else if (i % 3 === 1) {
          Transition(GLSL_FADETOCOLOR, randomFadeToColorUniforms() );
        }
        else {
          Transition(GLSL_DEFORMATION, randomDeformationUniforms() );
        }
      }
    });
    it('should fail if uniforms does not exist in the GLSL', function () {
      var Transition = GlslTransition(createCanvas());
      assert.throws(function () { Transition(GLSL_FADE, { foo: 0 }); });
      assert.throws(function () { Transition(GLSL_DEFORMATION, { size: 0.1, zoom: 1, foo: 0 }); });
    });
  });

  describe('transition(uniforms, duration, easing)', function () {
    it('should work with images', function (done) {
      GlslTransition(createCanvas(100, 100))(GLSL_FADE)(randomFromTo(), 50).then(success(), failure()).done(done);
    });
    it('should work with canvases', function (done) {
      var uniforms = randomFromTo();
      uniforms.from = util.fromImage(uniforms.from);
      uniforms.to = util.fromImage(uniforms.to);
      GlslTransition(createCanvas(100, 100))(GLSL_FADE)(uniforms, 50).then(success(), failure()).done(done);
    });
    it('should create transitions', function (done) {
      var Transition = GlslTransition(createCanvas());
      var fade = Transition(GLSL_FADE);
      var duration1 = 200;
      var anim1 = fade(randomFromTo(), duration1);
      assert(Q.isPromise(anim1), "result is a Promise.");
      var anim2 = anim1.then(function (obj) {
        assert.equal(typeof obj, "object", "Promise contains an object.");
        assert.equal(typeof obj.elapsedTime, "number", "Promise object should have elapsedTime value.");
        assert.equal(typeof obj.startAt, "number", "Promise object should have startAt value.");
        assert.equal(typeof obj.endAt, "number", "Promise object should have endAt value.");
        assert.equal(obj.endAt-obj.startAt, obj.elapsedTime, "endAt-startAt should equals elapsedTime");
        assert(isValidDuration(obj, duration1, 0.1), "duration seems to take the right time (10% tolerance)");
        return fade(randomFromTo(), 50, linear);
      });
      anim2.then(function(){
        assert.equal(anim1.isFulfilled(), true, "anim1 succeed.");
        assert.equal(anim2.isFulfilled(), true, "anim1+anim2 succeed.");
      }).done(done);
    });
    it('should failed with bad arguments', function () {
      var Transition = GlslTransition(createCanvas());
      var fade = Transition(GLSL_FADE);
      assert.throws(function () { fade(); });
      assert.throws(function () { fade(randomFromTo()); });
      assert.throws(function () { fade(randomFromTo(), null); });
      assert.throws(function () { fade(randomFromTo(), {}); });
      assert.throws(function () { fade({ from: images[0] }, 100); });
      assert.throws(function () { var obj = randomFromTo(); obj.foo = 1; fade(obj, 100); });
    });
    it('should lock: a second transition attempt is a failure if the first one has not ended', function (done) {
      var Transition = GlslTransition(createCanvas());
      var fade = Transition(GLSL_FADE);
      var anim1 = fade(randomFromTo(), 100);
      var anim2 = Q().delay(20).then(safe(function () { return fade(randomFromTo(), 100); }));
      Q.allSettled([ anim1, anim2 ]).then(function () {
        assert.equal(anim1.isFulfilled(), true, "anim1 succeed.");
        assert.equal(anim2.isFulfilled(), false, "anim2 failed.");
      }).done(done);
    });
    it('should fail if uniforms are not provided or if not defined uniforms.', function () {
      var Transition = GlslTransition(createCanvas());
      var deform1 = Transition(GLSL_DEFORMATION, {});
      var deform2 = Transition(GLSL_DEFORMATION, { size: 0.1 });
      var deform3 = Transition(GLSL_DEFORMATION, { size: 0.1, zoom: 1 });
      assert.throws(function () { deform1(randomFromTo({}), 100); });
      assert.throws(function () { deform2(randomFromTo({}), 100); });
      assert.throws(function () { deform2(randomFromTo({ zoom: 1, foo: 1 }), 100); });
      assert.throws(function () { deform3(randomFromTo({ foo: 1 }), 100); });
    });
    it('should handle context lost and restore', function (done) {
      var canvas = createCanvas();
      WebGLDebugUtils.makeLostContextSimulatingCanvas(canvas); // Enhance the canvas with some debugging properties
      var Transition = GlslTransition(canvas);
      var fade = Transition(GLSL_FADE);
      fade(randomFromTo(), 100)
        .then(success(), failure("first transition should work"))
        .then(safe(function () {
          canvas.loseContext();
          // a direct transition is accepted to fail (not sure)
          return fade(randomFromTo(), 100).then(success(), success());
        }))
        .delay(50)
        .then(safe(function () {
          // now it should work
          return fade(randomFromTo(), 100);
        }))
        .then(success(), failure("second transition should work"))
        .then(safe(function () {
          return Transition(GLSL_DEFORMATION, randomDeformationUniforms())(randomFromTo(), 100);
        }))
        .then(success(), failure("a new transition should work"))
        .then(safe(function () {
          return fade(randomFromTo(), 100);
        }))
        .then(success(), failure("third transition should work"))
        .done(done);
    });
    it('should complete non initialized uniforms', function (done) {
      var Transition = GlslTransition(createCanvas());
      var deform2 = Transition(GLSL_DEFORMATION, { size: 0.1 });
      deform2(randomFromTo({ zoom: 10 }), 100)
        .then(success(), failure())
        .done(done);
    });
    it('should work with a lot of transition() call', function (done) {
      var maxDuration = 20;
      var tries = 200;
      this.timeout((30+maxDuration) * tries);
      var transition = GlslTransition(createCanvas())(GLSL_FADE);
      (function loop (i) {
        if (i<=0) return;
        return transition(randomFromTo(), Math.ceil(maxDuration * Math.random()))
          .then(safe(function () {
            return loop(i-1);
          }));
      }(tries)).then(success(), failure()).done(done);
    });
    it('should work with a lot of transitions', function (done) {
      var maxDuration = 30;
      var tries = 100;
      this.timeout((30+maxDuration) * tries);
      var Transition = GlslTransition(createCanvas());
      var transitions = [
        Transition(GLSL_FADE),
        Transition(GLSL_DEFORMATION, randomDeformationUniforms()),
        Transition(GLSL_FADE),
        Transition(GLSL_DEFORMATION, randomDeformationUniforms()),
        Transition(GLSL_FADE),
        Transition(GLSL_DEFORMATION, randomDeformationUniforms()),
        Transition(GLSL_FADE),
        Transition(GLSL_DEFORMATION, randomDeformationUniforms()),
        Transition(GLSL_FADE),
        Transition(GLSL_DEFORMATION, randomDeformationUniforms()),
        Transition(GLSL_FADE),
        Transition(GLSL_DEFORMATION, randomDeformationUniforms())
      ];
      (function loop (i) {
        if (i<=0) return;
        var transition = transitions[Math.floor(Math.random()*transitions.length)];
        return transition(randomFromTo(), Math.ceil(maxDuration * Math.random()))
          .then(safe(function () {
            return loop(i-1);
          }));
      }(tries))
        .then(success(), failure())
        .done(done);
    });

    describe('fade transition', function () {
      it('should correctly fade', function (done) {
        var duration = 2000;
        var splits = 6;
        this.timeout(1000 + duration);
        var canvas = createCanvas();
        var Transition = GlslTransition(canvas);
        var fade = Transition(GLSL_FADE);
        var start = Date.now();
        var uniforms = randomFromTo();
        uniforms.from = util.fromImage(uniforms.from);
        var anim = fade(uniforms, duration);

        var snapshots = [];
        function snap () {
          var s = util.snapshot(canvas);
          snapshots.push(s);
        }
        setTimeout(snap, 1);
        setTimeout(function loop () {
          if (Date.now() - start > snapshots.length * duration / splits) snap();
          if (snapshots.length === splits+1) return;
          setTimeout(loop, 0);
        }, 30);

        anim.delay(50).then(safe(function (obj) {
          var i;
          var diffs = [];
          for (i=1; i<=splits; ++i) {
            diffs.push(util.diff(snapshots[0], snapshots[i]));
          }
          var a = diffs[diffs.length-1] / splits;
          var meanDiff = 0;
          for (i=0; i<splits; ++i) {
            meanDiff += Math.abs((i+1)*a - diffs[i]);
          }
          meanDiff /= splits;

          assert(util.diff(snapshots[0],      util.fromImage(uniforms.from, W, H)) < 0.05, "initially 'from' image");
          assert(util.diff(snapshots[splits], util.fromImage(uniforms.to  , W, H)) < 0.05, "ending 'to' image");
          assert(isValidDuration(obj, duration, 0.05), "duration seems to take the right time (5% tolerance)");
          assert(meanDiff < 0.05, "is a real fade, the image diff is proportional (5% tolerance)");
        })).done(done);
      });
      it('easing: should inverse when using (x)=>(1-x) easing', function (done) {
        var duration = 1000;
        this.timeout(1000 + duration);
        var canvas = createCanvas();
        var Transition = GlslTransition(canvas);
        var fade = Transition(GLSL_FADE);
        var uniforms = randomFromTo();
        uniforms.from = util.fromImage(uniforms.from);
        var snapshots = [];
        function snap () {
          snapshots.push(util.snapshot(canvas));
        }

        var anim = fade(uniforms, duration, function (x) { return 1 - x; });
        setTimeout(snap, 1);
        setTimeout(snap, duration);

        anim.delay(100).then(safe(function(){
          assert(util.diff(snapshots[0], util.fromImage(uniforms.to  , W, H)) < 0.05, "initially 'to' image");
          assert(util.diff(snapshots[1], util.fromImage(uniforms.from, W, H)) < 0.05, "ending 'from' image");
        })).done(done);
      });
    });

    describe('fadetocolor transition', function () {
      it('should works with different uniforms', function (done) {
        this.timeout(4000);
        var canvas = createCanvas();
        var Transition = GlslTransition(canvas);
        var anim1 = Transition(GLSL_FADETOCOLOR);
        var anim2 = Transition(GLSL_FADETOCOLOR, { colorPhase: 0.5 });
        var anim3 = Transition(GLSL_FADETOCOLOR, { color: [1, 0, 0], colorPhase: 0.5 });

        var snap1, snap2, snap3;

        var p = anim1(randomFromTo({ color: [0, 1, 0], colorPhase: 0.8 }), 1000, linear);
        Q.delay(500).then(safe(function () {
          snap1 = util.snapshot(canvas);
        }));
        p.then(function () {
            var p = anim2(randomFromTo({ color: [0, 0, 1] }), 1000);
            Q.delay(500).then(safe(function () {
              snap2 = util.snapshot(canvas);
            }));
            return p;
          })
          .then(safe(function () {
            var p = anim3(randomFromTo({ color: [1, 0, 1] }), 1000);
            Q.delay(500).then(safe(function () {
              snap3 = util.snapshot(canvas);
            }));
            return p;
          }))
          .done(function () {
            var c;
            c = util.getColor(snap1, 40, 40);
            assert(arrayEquals(c, [0, 255, 0, 255]), "snap1 is green");
            c = util.getColor(snap2, 40, 40);
            assert(arrayEquals(c, [0, 0, 255, 255]), "snap2 is blue");
            c = util.getColor(snap3, 40, 40);
            assert(arrayEquals(c, [255, 0, 255, 255]), "snap3 is purple");
            done();
          });
      });
    });
  });

  mocha.checkLeaks();
  mocha.run();
})).done();

