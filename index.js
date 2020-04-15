#!/usr/bin/env node

"use strict";

const path = require("path");
const commandLineArgs = require("command-line-args");
const { install } = require("./utils/install/install.js");
const {
  CLI_TOOL_NAME,
  ENGINE_TYPES,
} = require("./utils/constants/constants.js");
const { initProject } = require("./utils/init-project/init-project.js");

function main(command, argv) {
  switch (command) {
    case "create":
    case "init":
      const { _unknown: projectNames = [], ...restOptions } = commandLineArgs(
        [
          { name: "deps", alias: "d", type: String, multiple: true },
          { name: "editor", type: Boolean }, // should launch a code editor
          { name: "jsx", type: Boolean },
          { name: "svelte", type: Boolean },
          { name: "vue", type: Boolean },
          { name: "typescript", alias: "t", type: Boolean },
        ],
        { argv, partial: true }
      );
      if (command === "create" && projectNames.length === 0)
        throw new Error("create command must be followed by project name");
      else if (command === "create" && projectNames.length > 1)
        throw new Error(
          `create command must be followed by only one project name. got ${JSON.stringify(
            projectNames
          )}`
        );

      initProject(
        path.join(process.cwd(), command === "create" ? projectNames[0] : ""),
        restOptions
      );
      break;
    case "i":
    case "install":
      const { _unknown: dependencies = [], global } = commandLineArgs(
        [{ name: "global", alias: "g", type: Boolean }],
        { argv, partial: true }
      );
      install(ENGINE_TYPES.jspm, argv[0]);
      break;
    case undefined:
      console.error(`${CLI_TOOL_NAME} needs a command to run`);
      break;
    default:
      console.error(`${CLI_TOOL_NAME}: Unknown command "${command}"`);
  }
}

main(process.argv[2], process.argv.slice(3));
