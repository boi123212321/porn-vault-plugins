module.exports = {
  $axios: require("axios"),
  $throw: (msg) => {
    throw new Error(msg);
  },
  $log: (msg) => {
    console.log(msg);
  },
  $cheerio: require("cheerio"),
  $createImage: () => {
    return Date.now().toString(36);
  },
  $createLocalImage: () => {
    return Date.now().toString(36);
  },
  $moment: require("moment"),
  $inquirer: require("inquirer"),
  $fs: require("fs"),
  $path: require("path"),
  $os: require("os"),
  $readline: require("readline"),
  $loader: require("ora"),
  $cwd: process.cwd(),
};
