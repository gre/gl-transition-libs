var githubhook = require("githubhook");
var path = require("path");
const child_process = require("child_process");

var github = githubhook({
  secret: process.env.GITHUB_HOOK_SECRET,
  port: process.env.PORT
});

github.listen();

const watchedActions = {
  opened: true,
  synchronize: true
};

github.on("pull_request:gl-transitions", (ref, data) => {
  if (!watchedActions[data.action]) return;
  if (data.pull_request.state !== "open") return;
  child_process.execFile(
    path.join(__dirname, "generate-review.sh"),
    {
      env: {
        ...process.env,
        PULL_REQUEST: data.number
      }
    },
    (error, stdout, stderr) => {
      if (error) console.error(error, stdout);
      else console.log(stdout);
    }
  );
});
