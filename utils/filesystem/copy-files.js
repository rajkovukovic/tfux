"use strict";

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

/**
 *
 * @param {PathLike} sourceBasePath
 * @param {PathLike[]} sourceFiles
 * @param {PathLike} destination
 */
function copyFiles(sourceBasePath, sourceFiles, destination) {
  sourceFiles.forEach(sourceRelativePath => {
    const sourcePath = path.join(sourceBasePath, sourceRelativePath);
    const destinationPath = path.join(destination, sourceRelativePath);
    const destinationDir = path.dirname(destinationPath);
    if (!fs.existsSync(destinationDir)) {
      mkdirp.sync(destinationDir);
    }
    fs.copyFileSync(sourcePath, destinationPath);
  });
}

exports.copyFiles = copyFiles;
