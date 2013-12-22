var GlslTransition = require("..");
var Q = require("q");
var Qimage = require("qimage");
var BezierEasing = require("bezier-easing");
var ease = BezierEasing.css.ease;

var canvas = document.getElementById("viewport");
var Transition = GlslTransition(canvas);
var transitions = [
  Transition(require("./transitions/deformation.glsl"), { uniforms: { size: 0.05, zoom: 20.0 } }),
  Transition(require("./transitions/blur.glsl"), { uniforms: { size: 0.05 } }),
  Transition(require("./transitions/wind.glsl"), { uniforms: { size: 0.2 } }),
  Transition(require("./transitions/rainbow.glsl"), { uniforms: { size: 0.5 } })
];

function rotateForever (images) {
  function recRotate (i) {
    var transition = transitions[Math.floor(Math.random() * transitions.length)];
    var next = i+1 === images.length ? 0 : i+1;
    return transition({ from: images[i], to: images[next] }, 2000, ease)
      .delay(1000)
      .then(function (){ return recRotate(next); });
  }
  return recRotate(0);
}

Q.all(["./images/4.jpg", "./images/5.jpg", "./images/6.jpg", "./images/7.jpg"].map(Qimage))
 .then(rotateForever)
 .done();
