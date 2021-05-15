import inquirer from "inquirer";
import { readdirSync, mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";

function listPlugins() {
  return readdirSync("plugins");
}

function pluginExists(name: string): boolean {
  return listPlugins().includes(name);
}

(async () => {
  const result: {
    name: string;
    typescript: boolean;
    description: string;
    author: string;
  } = await inquirer.prompt([
    {
      type: "input",
      message: "Plugin name",
      name: "name",
      validate: (name: string) => {
        return /^[a-z0-9-_]+$/.test(name) || "Invalid name format";
      },
    },
    {
      type: "input",
      message: "Author (your user name)",
      name: "author",
    },
    {
      type: "input",
      message: "Plugin description",
      name: "description",
    },
  ]);

  if (pluginExists(result.name)) {
    console.error("Plugin name already in use");
    process.exit(1);
  }

  const pluginFolder = resolve("plugins", result.name);

  mkdirSync(pluginFolder);

  const infoJson = {
    name: result.name,
    version: "0.0.1",
    authors: [result.author],
    description: result.description,
    events: [],
  };
  const infoJsonPath = resolve(pluginFolder, "info.json");
  writeFileSync(infoJsonPath, JSON.stringify(infoJson, null, 2));

  const pluginEntryFile = resolve(pluginFolder, "main.ts");

  writeFileSync(
    pluginEntryFile,
    `import { applyMetadata, Plugin } from "../../types/plugin";
import { Context } from "../../types/plugin";

import info from "./info.json";

const handler: Plugin<Context /* adjust based on events */, any /* adjust based on output */> = async (ctx) => {
  // TODO: implement
  ctx.$log("Hello world from ${result.name}");
  return {};
};

handler.requiredVersion = ">=0.28"; // TODO: adjust version requirement here

applyMetadata(handler, info);

module.exports = handler;

export default handler;
  `
  );

  console.log("Plugin created, running to verify...");
  require(pluginEntryFile)({
    $log: console.log,
  });

  process.exit(0);
})();
