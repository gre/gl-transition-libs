
var distance = require("ndarray-distance");
var ndarray = require("ndarray");

module.exports = {
  createCanvas: function (w, h) {
    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    return canvas;
  },
  fromImage: function (img, w, h) {
    if (!w) w = img.width;
    if (!h) h = img.height;
    var c = this.createCanvas(w, h);
    var ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    return c;
  },
  snapshot: function (canvas) {
    var c = this.createCanvas(canvas.width, canvas.height);
    var ctx = c.getContext("2d");
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
    return c;
  },
  getColor: function (canvas, x, y) {
    return canvas.getContext("2d").getImageData(x, y, 1, 1).data;
  },
  diff: function (c1, c2) {
    if (c1.width !== c2.width && c1.height !== c2.height) throw new Error("diff need 2 canvas of same sizes");
    var data1 = c1.getContext("2d").getImageData(0, 0, c1.width, c1.height).data;
    var data2 = c2.getContext("2d").getImageData(0, 0, c2.width, c2.height).data;
    var diff = distance(ndarray(data1), ndarray(data2));
    return diff;
  }
};
