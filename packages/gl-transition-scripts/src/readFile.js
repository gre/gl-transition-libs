//@flow
import fs from "fs";
export default (path: string, opts: string = "utf-8") =>
  new Promise((success, failure) => {
    fs.readFile(path, opts, (err, res) => {
      if (err) failure(err);
      else success(res);
    });
  });
