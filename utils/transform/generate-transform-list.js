"use strict";

const fs = require("fs");
const path = require("path");
const { JS_EXTENSIONS } = require("../constants");

const jsExtensionsSet = new Set(JS_EXTENSIONS);

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
      const filePath = path.join(currentPath, filename);
      const stat = fs.lstatSync(filePath);
      if (stat.isDirectory()) {
        pathList.push(filePath);
      } else if (stat.isFile) {
        if (jsExtensionsSet.has(path.extname(filename).toLowerCase())) {
          // push filePath without modulePath prefix
          jsFiles.push(filePath.slice(modulePath.length + 1));
        } else {
          // push filePath without modulePath prefix
          restFiles.push(filePath.slice(modulePath.length + 1));
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
