var BezierEasing = require("bezier-easing");

var cumulativeOffset = function(element) {
  var top = 0, left = 0;
  do {
    top += element.offsetTop  || 0;
    left += element.offsetLeft || 0;
    element = element.offsetParent;
  } while(element);

  return {
    top: top,
    left: left
  };
};

function BezierEasingEditor (canvas) {
  var ctx = canvas.getContext("2d");
  var self = this;
   
  var bezier;
  var fun;

  var currentStep = [0, 0];

  function setBezier (b) {
    bezier = b;
    for (var i = 0; i < b.length; ++i)
      b[i] = Math.floor(b[i]*100)/100;
    fun = BezierEasing.apply(this, b);
    if (self.onChange) self.onChange(fun);
  }
  function getBezierFunction () {
    return fun;
  }
  this.getEasing = getBezierFunction;

  var HANDLE_RADIUS = 0.03;

  // state variables
  // handles positions
  var handle = [ null, [0.25, 0.25], [0.75, 0.75] ];
  var draggingHandle = 0;
  var hoveringHandle = 0;

  var hasChanged;
  var hovering = false;
  var stime = +new Date();
  var oneHandleClicked = false;

  function positionWithE (e) {
    var o = cumulativeOffset(canvas);
    return { x: relativeX(e.clientX+window.scrollX-o.left), y: relativeY(e.clientY+window.scrollY-o.top) };
  }

  function setup() {
    canvas.addEventListener("mousedown", function (e) {
      e.preventDefault();
      var p = positionWithE(e);
      var hnum = findHandle(p.x, p.y);
      if (hnum) {
        draggingHandle = hnum;
        oneHandleClicked = true;
      }
    });
    canvas.addEventListener("mouseup", function (e) {
      var p = positionWithE(e);
      if (draggingHandle) {
        setHandle(draggingHandle, p.x, p.y);
        draggingHandle = 0;
      }
    });
    canvas.addEventListener("mousemove", function (e) {
      e.preventDefault();
      var p = positionWithE(e);
      if (draggingHandle) {
        setHandle(draggingHandle, p.x, p.y);
      }
      hoveringHandle = draggingHandle || findHandle(p.x, p.y);
    });
    canvas.addEventListener("mouseover", function () {
      hovering = true;
      hasChanged = true;
    });
    canvas.addEventListener("mouseout", function () {
      hovering = false;
      hasChanged = true;
      draggingHandle = 0;
      hoveringHandle = 0;
    });

    syncBezier();
  }

  function render () {
    var now = +new Date();

    ctx.save();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw grid

    ctx.translate(0, canvas.height);
    ctx.scale(canvas.width, -canvas.height);

    // Draw projections
    ctx.lineWidth = 0.01;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.moveTo(currentStep[0], 0);
    ctx.lineTo(currentStep[0], currentStep[1]);
    ctx.lineTo(0, currentStep[1]);
    ctx.stroke();

    // Draw bezier
    ctx.lineWidth = 0.02;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(handle[1][0], handle[1][1], handle[2][0], handle[2][1], 1, 1);
    ctx.stroke();

    // Draw handle
    ctx.strokeStyle = "red";
    ctx.fillStyle = "white";
    ctx.lineWidth = 0.01;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(handle[1][0], handle[1][1]);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(1, 1);
    ctx.lineTo(handle[2][0], handle[2][1]);
    ctx.stroke();

    var r = HANDLE_RADIUS;
    if (!oneHandleClicked) {
      r += 0.2*HANDLE_RADIUS*Math.cos((stime-now)/150);
    }
    for (var i=1; i<handle.length; ++i) {
      var h = handle[i];
      ctx.beginPath();
      ctx.arc(h[0], h[1], r, 0, Math.PI*2);
      ctx.fillStyle = (hoveringHandle === i) ? "red" : "white";
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function syncBezier () {
    setBezier([ handle[1][0], handle[1][1], handle[2][0], handle[2][1] ]);
  }

  function findHandle (x, y) {
    for (var i=1; i<handle.length; ++i) {
      var h = handle[i];
      var radius = HANDLE_RADIUS;
      var dx = x - h[0];
      var dy = y - h[1];
      if (dx*dx+dy*dy < radius*radius)
        return i;
    }
    return 0;
  }

  function setHandle (num, x, y) {
    handle [num] = [x, y];
    syncBezier();
    render();
  }

  function relativeX (x) {
    return x/canvas.width;
  }
  function relativeY (y) {
    return 1-y/canvas.height;
  }

  setup();
  (function loop () {
    window.requestAnimationFrame(function() {
      loop();
      render();
    }, canvas);
  }());
}

module.exports = BezierEasingEditor;
