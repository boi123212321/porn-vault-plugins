const fs = require("fs");
const path = require("path");

const pluginsFolder = path.resolve("plugins");

for (const name of fs.readdirSync(pluginsFolder)) {
  const infoPath = path.resolve("plugins", name, "info.json");
  if (!fs.existsSync(infoPath)) {
    process.exit(1);
  }
  console.log(`${name} OK`);
}
process.exit(0);
