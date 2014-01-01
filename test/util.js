
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
    var sum = 0;
    for (var i=0; i<data1.length; i += 4) {
      var r = Math.abs(data1[i]-data2[i]) / 255;
      var g = Math.abs(data1[i+1]-data2[i+1]) / 255;
      var b = Math.abs(data1[i+2]-data2[i+2]) / 255;
      sum += r + b + g;
    }
    return (3/4) * sum / data1.length;
  }
};
