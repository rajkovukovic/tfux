"use strict";

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const { VATRA_LIB_NAME } = require("../constants/constants.js");

/**
 *
 * @param {PathLike} destinationPath
 * @param {string[]} dependencies
 */
function linkDependencies(destinationPath, dependencies) {
  const destinationLib = path.join(destinationPath, VATRA_LIB_NAME);
  if (!fs.existsSync(destinationLib)) {
    mkdirp.sync(destinationLib);
  }
  
}

exports.linkDependencies = linkDependencies;
