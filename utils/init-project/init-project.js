"use strict";

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const { copyFolder } = require("../filesystem/copy-folder.js");
const {
  PROJECT_TEMPLATE_OPTIONS,
  VATRA_TEMPLATES_PATH,
} = require("../constants/constants.js");

const frameworkOptions = [
  PROJECT_TEMPLATE_OPTIONS.svelte,
  PROJECT_TEMPLATE_OPTIONS.vue,
];

const optionsPriority = [
  // frameworks
  ...frameworkOptions,
  // flags
  PROJECT_TEMPLATE_OPTIONS.typescript,
];

/**
 *
 * @param {PathLike} destinationPath
 * @param {Object}   options
 * @param {boolean}  options.jsx
 * @param {boolean}  options.typescript
 */
function initProject(destinationPath, options) {
  if (!fs.existsSync(destinationPath)) {
    mkdirp.sync(destinationPath);
  }
  const selectedFrameworkOptions = frameworkOptions.filter((option) =>
    Boolean(options[option])
  );
  if (selectedFrameworkOptions.length > 1) {
    throw new Error(
      `You can choose max one frontend framework. You have chosen ${JSON.stringify(
        selectedFrameworkOptions
      )}`
    );
  }
  let concatenatedOptions = optionsPriority
    .filter((option) => Boolean(options[option]))
    .join("-");
  concatenatedOptions = concatenatedOptions || "js";
  console.log({ concatenatedOptions });
  // if (svelte) {
  //   copyFolder(path.join(VATRA_TEMPLATES_PATH, "svelte"), destinationPath);
  // } else if (jsx) {
  // } else {
  //   copyFolder(path.join(VATRA_TEMPLATES_PATH, "js"), destinationPath);
  // }
  // link dependencies
  // create POM file
  fs.writeFileSync(path.join(destinationPath, "pom.xml"), "", "utf8");
}

exports.initProject = initProject;
