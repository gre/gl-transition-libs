#!/usr/bin/env node
const request = require("request");
const fs = require("fs");
const path = require("path");
const sys = require("sys");
const child_process = require("child_process");
const transform = require("gl-transition-scripts/lib/transform").default;

const exec = (cmd, opts) =>
  new Promise((success, failure) => {
    child_process.exec(cmd, opts, (error, stdout, stderr) => {
      if (error) failure(error);
      else success(stdout);
    });
  });

const ms = n => (n < 1 ? n.toFixed(2) : Math.round(n)) + "ms";

const prNumber = process.env.PULL_REQUEST;
const pass = process.env.GITHUB_TOKEN;

if (!prNumber) {
  console.error("PULL_REQUEST env variable missing");
  process.exit(1);
}
if (!pass) {
  console.error("GITHUB_TOKEN env variable missing");
  process.exit(1);
}

exec('git diff --name-only master | grep "transitions/.*\.glsl$"')
  .then(r => r.split("\n").filter(r => r))
  .then(files => {
    if (files.length === 0) {
      console.error("No glsl file has changed in this PR.");
      process.exit(0);
    }
    const results = files.map(path => {
      const filename = path.indexOf("/") === -1
        ? path
        : path.match(/.*\/([^\/]+)/)[1];
      const glsl = fs.readFileSync(path);
      return Object.assign({ path }, transform(filename, glsl, path));
    });

    const haveErrors = results.filter(r => r.errors.length > 0).length > 0;

    const headMessage =
      "## " +
      (haveErrors
        ? "👇 Oops, I've found some things to fix!"
        : "👌 All good to me!");

    const summaryDetails = results
      .map(({ data, errors }) => {
        const { name } = data.transition;
        const success = errors.length === 0;
        const head = `<strong>${success ? "✔︎" : "✕"} ${name}<strong>`;
        if (success) {
          return `${head} (compile in ${ms(data.compilation.compileTime)}, draw in ${ms(data.compilation.drawTime)})`;
        }
        const errorMessagesWithoutLines = errors
          .filter(e => !e.line)
          .map(e => e.message);
        return errorMessagesWithoutLines.length > 0
          ? `<details><summary>${head}</summary>${errorMessagesWithoutLines.join("<br/>")}</details>`
          : head;
      })
      .map(line => "- " + line)
      .join("\n");

    return results
      .filter(r => r.errors.length === 0)
      .reduce(
        (promise, r) =>
          promise.then(array =>
            exec(path.join(__dirname, "gif-it.sh") + " " + r.path)
              .then(gif => {
                if (gif) return array.concat([gif]);
                else return array;
              })
              .catch(e => {
                console.error("Failed to generate a gif: ", e);
                return array;
              })
          ),
        Promise.resolve([])
      )
      .then(gifs => {
        const previews = gifs.map(gif => `![](${gif})`).join("\n");
        const event = haveErrors ? "REQUEST_CHANGES" : "APPROVE";
        const body = `${headMessage}\n\n${summaryDetails}\n\n${previews}`;
        const comments = results
          .map(({ errors, path }) =>
            errors.filter(e => e.line).map(e => ({
              path,
              position: e.line,
              body: e.message,
            }))
          )
          .reduce((acc, comments) => acc.concat(comments), []);

        return new Promise((success, failure) =>
          request(
            {
              method: "POST",
              url: `https://api.github.com/repos/gltransitions/gl-transitions/pulls/${prNumber}/reviews`,
              json: true,
              body: { event, body, comments },
              auth: {
                user: "gltransitions",
                pass,
              },
              headers: {
                "User-Agent": "gl-transitions-bot",
              },
            },
            (error, response, body) => {
              if (error || !response || response.statusCode !== 200) {
                failure(
                  new Error("Failed to review the Pull Request " + prNumber)
                );
                if (error) {
                  console.error(error);
                } else {
                  console.log(body);
                }
              } else {
                success();
              }
            }
          )
        );
      });
  })
  .then(
    () => {
      console.log("Successful reviewed the Pull Request " + prNumber);
      process.exit(0);
    },
    e => {
      console.error(e);
      process.exit(1);
    }
  );
