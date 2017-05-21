//@flow
import getPixelsF from "get-pixels";
export default (path: string) =>
  new Promise((success, failure) => {
    getPixelsF(path, (err, pixels) => {
      if (err) failure(err);
      else success(pixels);
    });
  });
