import fs from "fs";
import ndarray, { type NdArray } from "ndarray";
import { PNG } from "pngjs";
import jpeg from "jpeg-js";

const readSource = async (src: string): Promise<Buffer> => {
  if (/^https?:\/\//.test(src)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${src}`);
    return Buffer.from(await res.arrayBuffer());
  }
  if (src.startsWith("data:")) {
    const comma = src.indexOf(",");
    if (comma === -1) {
      throw new Error("Invalid data: URI (missing comma)");
    }
    const meta = src.slice(0, comma);
    const payload = src.slice(comma + 1);
    return meta.endsWith(";base64")
      ? Buffer.from(payload, "base64")
      : Buffer.from(decodeURIComponent(payload), "binary");
  }
  return fs.promises.readFile(src);
};

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const isPNG = (buf: Buffer) => PNG_SIGNATURE.every((b, i) => buf[i] === b);
const isJPEG = (buf: Buffer) => buf[0] === 0xff && buf[1] === 0xd8;

const toNdArray = (data: Uint8Array, width: number, height: number) =>
  // same layout as get-pixels: [width, height, 4] over row-major RGBA
  ndarray(data, [width, height, 4], [4, 4 * width, 1], 0);

// avoid dumping huge data: URIs into error messages
const displaySrc = (src: string) =>
  src.length > 100 ? src.slice(0, 100) + "…" : src;

export default (src: string): Promise<NdArray<Uint8Array>> =>
  readSource(src).then((buf) => {
    if (isPNG(buf)) {
      const png = PNG.sync.read(buf);
      // Buffer is a Uint8Array; no copy needed
      return toNdArray(png.data, png.width, png.height);
    }
    if (isJPEG(buf)) {
      const { data, width, height } = jpeg.decode(buf, { useTArray: true });
      return toNdArray(data, width, height);
    }
    throw new Error(
      `Unsupported image format (expected PNG or JPEG): ${displaySrc(src)}`
    );
  });
