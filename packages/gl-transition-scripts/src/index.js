//@flow
import program from "commander";
import fs from "fs";
import path from "path";
import transform from "./transform";

const args = process.argv.slice(2);

const ms = (n: number) => (n < 1 ? n.toFixed(2) : Math.round(n)) + "ms";

program
  .version("0.0.1")
  .command("transform <dir> <jsonOutputFile>")
  .action((dir, jsonOutputFile) => {
    const files = fs.readdirSync(dir).filter(n => n.match(/^.*\.glsl$/));
    const transitions = [];
    console.log(files.length + " transitions to transform...");
    console.log("");
    files.forEach(filename => {
      const glsl = fs.readFileSync(path.join(dir, filename), "utf-8");
      const result = transform(filename, glsl);
      if (result.errors.length > 0) {
        console.log(` ✕ ${result.data.transition.name}`);
        console.log("");
        result.errors.forEach(e => {
          console.error(`   ${e.message}`);
        });
        console.log("");
      } else {
        console.log(
          ` ✔︎ ${result.data.transition.name} (compile in ${ms(result.data.compilation.compileTime)}, draw in ${ms(result.data.compilation.drawTime)})`
        );
        transitions.push(result.data.transition);
      }
      return result;
    });
    console.log("");
    if (transitions.length === files.length) {
      // all pass!
      fs.writeFileSync(jsonOutputFile, JSON.stringify(transitions));
      console.log(
        transitions.length + " transitions exported in " + jsonOutputFile
      );
      process.exit(0);
    } else {
      console.error(
        files.length -
          transitions.length +
          " transitions have failed to pass validation."
      );
      process.exit(1);
    }
  });

program.parse(process.argv);
