import fs from "fs";

export default (path: string): Promise<string> =>
  new Promise((success, failure) => {
    fs.readFile(path, "utf-8", (err, res) => {
      if (err) failure(err);
      else success(res);
    });
  });
