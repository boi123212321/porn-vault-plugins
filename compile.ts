import * as rollup from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import jsonResolve from "@rollup/plugin-json";

import { readdirSync } from "fs";
import { resolve } from "path";

(async () => {
  const buildFolder = "build/plugins";
  const outputDir = "dist";

  for (const pluginName of readdirSync(buildFolder)) {
    const input = resolve(buildFolder, pluginName, "main.js");
    const outputFile = resolve(outputDir, `${pluginName}.js`);

    console.log(`Bundling ${input} -> ${outputFile}`);

    const bundle = await rollup.rollup({
      input,
      plugins: [nodeResolve(), commonjs(), jsonResolve()],
    });

    await bundle.write({
      file: outputFile,
      format: "cjs",
    });
  }

  console.log("Build done");
  process.exit(0);
})();
