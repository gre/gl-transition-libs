var GlslTransition = require("glsl-transition");
var Q = require("q");
var Qimage = require("qimage");
var BezierEasingEditor = require("./bezier-easing-editor");

var easingEditor = new BezierEasingEditor(document.getElementById("easing"));
var transitionDuration, stayTime, currentTransition;
var transitions;

var canvas = document.getElementById("viewport");
var Transition = GlslTransition(canvas);
transitions = {
  "page"       : Transition(require("./transitions/page.glsl"), {}),
  "squares1"   : Transition(require("./transitions/squares.glsl"), { size: [13, 9], smoothness: 0.5 }),
  "squares2"   : Transition(require("./transitions/squares.glsl"), { size: [64, 45], smoothness: 0.2 }),
  "flash"      : Transition(require("./transitions/flash.glsl"), { flashPhase: 0.3, flashIntensity: 3.0, flashZoomEffect: 0.5 }),
  "ripple"     : Transition(require("./transitions/ripple.glsl"), { amplitude: 100, speed: 50 }),
  "flyeye1"    : Transition(require("./transitions/flyeye.glsl"), { size: 0.04, zoom: 20.0 }),
  "flyeye2"    : Transition(require("./transitions/flyeye.glsl"), { size: 0.1, zoom: 40.0 }),
  "flyeye3"    : Transition(require("./transitions/flyeye.glsl"), { size: 0.2, zoom: 100.0 }),
  "doorway"    : Transition(require("./transitions/doorway.glsl"), { reflection: 0.4, perspective: 0.4, depth: 3.0 }),
  "swap"       : Transition(require("./transitions/swap.glsl"), { reflection: 0.4, perspective: 0.2, depth: 3.0 }),
  "wipe1"      : Transition(require("./transitions/wipe.glsl"), { direction: [1, 0], smoothness: 0.5 }),
  "wipe2"      : Transition(require("./transitions/wipe.glsl"), { direction: [0, -1], smoothness: 0.5 }),
  "wipe3"      : Transition(require("./transitions/wipe.glsl"), { direction: [1, 1], smoothness: 0.5 }),
  "wipe4"      : Transition(require("./transitions/wipe.glsl"), { direction: [1, -1], smoothness: 0.5 }),
  "rainbowwipe": Transition(require("./transitions/rainbowwipe.glsl"), { direction: [1, 0.5], smoothness: 0.6 }),
  "heartwipe"  : Transition(require("./transitions/heartwipe.glsl"), {}),
  "circleopen" : Transition(require("./transitions/circleopen.glsl"), { opening: true, smoothness: 0.3 }),
  "fadegrayscale": Transition(require("./transitions/fadegrayscale.glsl"), { grayPhase: 0.3 }),
  "fadetowhite": Transition(require("./transitions/fadetocolor.glsl"), { color: [1.0,1.0,1.0], colorPhase: 0.5 }),
  "fadetoblack": Transition(require("./transitions/fadetocolor.glsl"), { color: [0.0,0.0,0.0], colorPhase: 0.5 }),
  "blur"       : Transition(require("./transitions/blur.glsl"), { size: 0.03 }),
  "wind"       : Transition(require("./transitions/wind.glsl"), { size: 0.2 })
};

currentTransition = transitions.swap;

function loopForever (images) {
  return (function loop (i) {
    var next = i+1 === images.length ? 0 : i+1;
    return currentTransition({ from: images[i], to: images[next] }, transitionDuration, easingEditor.getEasing())
      .delay(stayTime)
      .then(function (){ return loop(next); });
  }(0));
}

// See here: https://commons.wikimedia.org/wiki/Commons:Picture_of_the_Year/2012
var awesomeWikimediaImages = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Pair_of_Merops_apiaster_feeding.jpg/1280px-Pair_of_Merops_apiaster_feeding.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Magnificent_CME_Erupts_on_the_Sun_-_August_31.jpg/1280px-Magnificent_CME_Erupts_on_the_Sun_-_August_31.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Gl%C3%BChlampe_explodiert.jpg/1280px-Gl%C3%BChlampe_explodiert.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/M%C3%A5b%C3%B8dalen%2C_2011_August.jpg/1280px-M%C3%A5b%C3%B8dalen%2C_2011_August.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Bos_grunniens_at_Yundrok_Yumtso_Lake.jpg/1280px-Bos_grunniens_at_Yundrok_Yumtso_Lake.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/%C5%A0marjetna_gora_03.jpg/1280px-%C5%A0marjetna_gora_03.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Park_zamkowy_w_Pszczynie_03promykjck.jpg/1280px-Park_zamkowy_w_Pszczynie_03promykjck.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Ponte_Vasco_da_Gama_25.jpg/1280px-Ponte_Vasco_da_Gama_25.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Tarvasj%C3%B5gi.jpg/1280px-Tarvasj%C3%B5gi.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Endeavour_silhouette_STS-130.jpg/1280px-Endeavour_silhouette_STS-130.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Arlington_Row_Bibury.jpg/1280px-Arlington_Row_Bibury.jpg"
];

var localImages = [
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
];

var images = awesomeWikimediaImages;

if (window.location.hostname === "localhost") {
  images = localImages;
}

function crossOriginLoading (src) {
  return Qimage(src, { crossorigin: "Anonymous" });
}

Q.all(images.map(crossOriginLoading))
 .then(loopForever)
 .done();

// Bind sliders
var $duration = document.getElementById("duration");
var $delay = document.getElementById("delay");
var $durationValue = document.getElementById("durationValue");
var $delayValue = document.getElementById("delayValue");
var $transition = document.getElementById("transition");
var $easingtext = document.getElementById("easingtext");

function syncEasing () {
  var easing = easingEditor.getEasing();
  $easingtext.innerHTML = easing.toString();
}
function syncDuration () {
  $durationValue.innerHTML = $duration.value;
  transitionDuration = parseInt($duration.value, 10);
}
function syncDelay () {
  $delayValue.innerHTML = $delay.value;
  stayTime = parseInt($delay.value, 10);
}
function syncTransition () {
  var name = $transition.value;
  currentTransition = transitions[name];
}

for (var name in transitions) {
  var option = document.createElement("option");
  option.innerHTML = name;
  option.value = name;
  $transition.appendChild(option);
}
syncEasing();
syncDuration();
syncDelay();
syncTransition();
easingEditor.onChange = syncEasing;
$duration.addEventListener("change", syncDuration, false);
$delay.addEventListener("change", syncDelay, false);
$transition.addEventListener("change", syncTransition, false);
