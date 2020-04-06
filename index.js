#!/usr/bin/env node

"use strict";

const { name } = require("./package.json");
const { install } = require("./utils/install/install.js");

function main(command, args) {
  switch (command) {
    case "add":
    case "i":
    case "install":
      install("jspm", args[0]);
      break;
    case undefined:
      console.error(`${name} needs a command to run`);
      break;
    default:
      console.error(`${name}: Unknown command "${command}"`);
  }
}

main(process.argv[2], process.argv.slice(3));
