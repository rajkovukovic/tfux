"use strict";

const { generateTransformList } = require("./generate-transform-list");
const { copyFiles } = require("./copy-files");
const { transformFile } = require("./transform-file");

/**
 *
 * @param {PathLike} destinationPath
 * @param {PathLike} modulePath
 * @param {string} moduleName
 * @param {HashMap<string, string>} dependencyVersions
 */
async function transformModule(
  destinationPath,
  modulePath,
  moduleName,
  dependencyVersions
) {
  const { jsFiles, restFiles } = generateTransformList(modulePath);

  console.log(`transforming module "${moduleName}"`);

  copyFiles(modulePath, restFiles, destinationPath);

  for (let jsFile of jsFiles) {
    await transformFile({
      destinationPath,
      modulePath,
      jsFile,
      dependencyVersions
    });
  }
}

exports.transformModule = transformModule;
