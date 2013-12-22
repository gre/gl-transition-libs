var GlslTransition = require("..");
var Q = require("q");
var Qimage = require("qimage");
var BezierEasing = require("bezier-easing");
var ease = BezierEasing.css.ease;

var blurGlsl = require("./blur.glsl");
var smoothlGlsl = require("./smoothl.glsl");

var canvas = document.getElementById("viewport");
var Transition = GlslTransition(canvas);
var blur = Transition(blurGlsl, { uniforms: { size: 0.02 } });
var smoothl = Transition(smoothlGlsl, { uniforms: { size: 0.3 } });
var transitions = [ blur, smoothl ];

function rotateForever (images) {
  function recRotate (i) {
    var transition = transitions[Math.floor(Math.random()*transitions.length)];
    var next = i+1 === images.length ? 0 : i+1;
    return transition({ from: images[i], to: images[next] }, 1000, ease)
      .delay(5000)
      .then(function (){ return recRotate(next); });
  }
  return recRotate(0);
}

Q.all(["./images/4.jpg", "./images/5.jpg", "./images/6.jpg", "./images/7.jpg"].map(Qimage))
 .then(rotateForever)
 .done();
