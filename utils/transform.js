"use strict";

const { generateTransformList } = require("./generate-transform-list");
const { copyFiles } = require("./copy-files");
const { transformJs } = require("./transformers/transform-js");

/**
 *
 * @param {PathLike} destinationPath
 * @param {PathLike} modulePath
 * @param {string} moduleName
 * @param {HashMap<string, string>} dependencyVersions
 */
async function transformToVatra(
  destinationPath,
  modulePath,
  moduleName,
  dependencyVersions
) {
  const { jsFiles, restFiles } = generateTransformList(modulePath);

  console.log(`transforming module "${moduleName}"`);

  copyFiles(modulePath, restFiles, destinationPath);

  for (let jsFile of jsFiles) {
    await transformJs({
      destinationPath,
      modulePath,
      jsFile,
      dependencyVersions
    });
  }
}

exports.transformToVatra = transformToVatra;
