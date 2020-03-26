"use strict";

const fs = require("fs");

/**
 *
 * @param {PathLike[]} files
 * @param {PathLike} destination
 */
function copyFiles(files, destination) {
  files.forEach(file => {
    fs.copyFileSync(file, destination);
  });
}

exports.generateTransformList;
