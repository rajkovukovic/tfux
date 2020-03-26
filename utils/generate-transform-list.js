"use strict";

const fs = require("fs");
const path = require("path");

const jsExtensions = new Set(["js", "mjs"]);

/**
 *
 * @param {PathLike} modulePath
 *
 * @returns {jsFiles: string[], restFiles: string[]}
 */
function generateTransformList(modulePath) {
  const jsFiles = [];
  const restFiles = [];
  const pathList = [modulePath];
  while (pathList.length > 0) {
    const currentPath = pathList.shift();
    const files = fs.readdirSync(currentPath, "utf8");
    files.forEach(filename => {
      const stat = fs.lstatSync(filename);
      if (stat.isDirectory) {
        pathList.push(filename);
      } else if (stat.isFile) {
        if (jsExtensions.has(path.extname())) {
          jsFiles.push(file);
        } else {
          restFiles.push(file);
        }
      }
    });
  }
  return {
    jsFiles,
    restFiles
  };
}

exports.generateTransformList = generateTransformList;
