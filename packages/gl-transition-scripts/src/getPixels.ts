import getPixelsF from "get-pixels";
import type { NdArray } from "ndarray";

export default (path: string): Promise<NdArray<Uint8Array>> =>
  new Promise((success, failure) => {
    getPixelsF(path, (err, pixels) => {
      if (err) failure(err);
      else success(pixels);
    });
  });
