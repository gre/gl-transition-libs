import fs from "fs";
import ndarray, { type NdArray } from "ndarray";
import { PNG } from "pngjs";
import jpeg from "jpeg-js";

const readSource = (src: string): Promise<Buffer> => {
  if (/^https?:\/\//.test(src)) {
    return fetch(src).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${src}`);
      return res.arrayBuffer().then(Buffer.from);
    });
  }
  if (src.startsWith("data:")) {
    const comma = src.indexOf(",");
    const meta = src.slice(0, comma);
    const payload = src.slice(comma + 1);
    return Promise.resolve(
      meta.endsWith(";base64")
        ? Buffer.from(payload, "base64")
        : Buffer.from(decodeURIComponent(payload), "binary")
    );
  }
  return fs.promises.readFile(src);
};

const isPNG = (buf: Buffer) => buf[0] === 0x89 && buf[1] === 0x50;
const isJPEG = (buf: Buffer) => buf[0] === 0xff && buf[1] === 0xd8;

const toNdArray = (data: Uint8Array, width: number, height: number) =>
  // same layout as get-pixels: [width, height, 4] over row-major RGBA
  ndarray(data, [width, height, 4], [4, 4 * width, 1], 0);

export default (src: string): Promise<NdArray<Uint8Array>> =>
  readSource(src).then((buf) => {
    if (isPNG(buf)) {
      const png = PNG.sync.read(buf);
      return toNdArray(new Uint8Array(png.data), png.width, png.height);
    }
    if (isJPEG(buf)) {
      const { data, width, height } = jpeg.decode(buf, { useTArray: true });
      return toNdArray(data, width, height);
    }
    throw new Error(`Unsupported image format (expected PNG or JPEG): ${src}`);
  });
