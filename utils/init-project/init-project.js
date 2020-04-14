"use strict";

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const { copyFolder } = require("../filesystem/copy-folder.js");
const { VATRA_TEMPLATES_PATH } = require("../constants/constants.js");

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
  const { jsx, typescript } = options;
  if (typescript) {
  } else if (jsx) {
  } else {
    copyFolder(path.join(VATRA_TEMPLATES_PATH, "js"), destinationPath);
  }
}

exports.initProject = initProject;
