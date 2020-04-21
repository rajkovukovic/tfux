"use strict";

const { ncp } = require("ncp");

/**
 *
 * @param {PathLike} sourcePath
 * @param {PathLike} destinationPath
 */
function copyFolder(sourcePath, destinationPath) {
  return new Promise((resolve, reject) => {
    // ncp.limit = 16; concurrency-limit
    ncp(sourcePath, destinationPath, function (err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

exports.copyFolder = copyFolder;
