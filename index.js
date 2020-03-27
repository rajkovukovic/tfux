#!/usr/bin/env node

"use strict";

const { name } = require("./package.json");
const { installDependency } = require("./utils/install");

function main(command, args) {
  switch (command) {
    case "add":
    case "i":
    case "install":
      installDependency(args[0], true);
      break;
    default:
      if (!command) {
        console.error(`${name} needs a command to run`);
      } else {
        console.error(`${name}: Unknown command "${command}"`);
      }
  }
}

main(process.argv[2], process.argv.slice(3));
