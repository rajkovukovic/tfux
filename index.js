#!/usr/bin/env node

"use strict";

const { installDependency } = require("./utils/install");
const { generateTransformList } = require("./utils/generate-transform-list");

// console.log(
//   generateTransformList(
//     "/private/var/folders/g2/783ym1bx5g9c50p5ddt49b280000gn/T/tfux/node_modules/js-tokens"
//   )
// );

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
