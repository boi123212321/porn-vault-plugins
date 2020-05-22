import * as fs from "fs";
import * as nodepath from "path";
import Handlebars from "handlebars";
const table = require("markdown-table") as (val: any) => any;

const pluginTemplate = fs.readFileSync("plugin_template.md", "utf-8");

const pluginFolder = nodepath.resolve("../plugins");
const pluginNames = fs.readdirSync(pluginFolder);

const info: Record<string, any> = {};

const generatePluginDocs = () => {
  pluginNames.forEach((name) => {
    console.log(`Generating docs for ${name}...`);
    const pluginPath = nodepath.join(pluginFolder, name);

    const infoPath = nodepath.join(pluginPath, "info.json");
    const pluginInfo = JSON.parse(fs.readFileSync(infoPath, "utf-8"));
    info[name] = pluginInfo;

    const docPath = nodepath.join(pluginPath, "docs.md");
    const docs = fs.existsSync(docPath)
      ? fs.readFileSync(docPath, "utf-8")
      : null;

    const tableHeaders = ["Name", "Type", "Required", "Description"];
    const rendered = Handlebars.compile(pluginTemplate)({
      name,
      version: pluginInfo.version,
      description: pluginInfo.description,
      authors: pluginInfo.authors,
      docs,
      hasArgs: pluginInfo.arguments && pluginInfo.arguments.length,
      argsTable: table([
        tableHeaders,
        ...(pluginInfo.arguments || []).map((arg: any) => [
          arg.name,
          arg.type,
          arg.required,
          arg.description,
        ]),
      ]),
    });
    const readmePath = nodepath.join(pluginPath, "README.md");
    fs.writeFileSync(readmePath, rendered, "utf-8");
    console.log(`${name} done`);
  });

  console.log("Generating index...");

  const indexTemplate = fs.readFileSync("template.md", "utf-8");
  const tableHeaders = ["Plugin", "Description"];
  const rendered = Handlebars.compile(indexTemplate)({
    table: table([
      tableHeaders,
      ...Object.values(info).map((arg: any) => [arg.name, arg.description]),
    ]),
  });
  const indexReadmePath = nodepath.resolve("../README.md");
  fs.writeFileSync(indexReadmePath, rendered, "utf-8");
  console.log(`Index done`);
};

generatePluginDocs();
