#!/usr/bin/env node

"use strict";

const { install } = require("./utils/install/install.js");
const { CLI_TOOL_NAME, ENGINE_TYPES } = require("./utils/constants/constants.js");

function main(command, args) {
  switch (command) {
    case "add":
    case "i":
    case "install":
      install(ENGINE_TYPES.jspm, args[0]);
      break;
    case undefined:
      console.error(`${CLI_TOOL_NAME} needs a command to run`);
      break;
    default:
      console.error(`${CLI_TOOL_NAME}: Unknown command "${command}"`);
  }
}

main(process.argv[2], process.argv.slice(3));
