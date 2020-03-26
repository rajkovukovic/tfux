#!/usr/bin/env node

"use strict";

const { installDependency } = require('./utils/install');

function main(command, args) {
  switch (command) {
    case "add":
    case "i":
    case "install":
      installDependency(args[0]);
      break;
    default:
      if (!command) {
        console.error(`tfux needs a command to run`);
      } else {
        console.error(`Unknown command "${command}"`);
      }
  }
}

main(process.argv[2], process.argv.slice(3));
