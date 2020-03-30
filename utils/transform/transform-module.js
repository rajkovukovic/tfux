"use strict";

const path = require("path");
const { generateTransformList } = require("./generate-transform-list");
const { copyFiles } = require("../filesystem/copy-files");
const { transformJsFile } = require("./transform-js-file");

/**
 *
 * @param {PathLike} modulesDestinationPath
 * @param {PathLike} installedModulesPath
 * @param {string} aModule
 * @param {HashMap<string, ModuleInfo>} dependencyMap
 */
async function transformModule(
  modulesDestinationPath,
  installedModulesPath,
  moduleInfo,
  dependencyMap
) {
  const modulePath = path.join(
    installedModulesPath,
    moduleInfo.group || "npm",
    `${moduleInfo.name}@${moduleInfo.version}`
  );

  const destinationPath = path.join(
    modulesDestinationPath,
    `${moduleInfo.group || "npm"}.${moduleInfo.name}@${moduleInfo.version}`
  );

  console.log({
    modulePath,
    destinationPath,
    moduleInfo
  });
  return;

  const { jsFiles, restFiles } = generateTransformList(modulePath);

  console.log({
    modulePath,
    destinationPath,
    jsFiles: jsFiles.length,
    restFiles: restFiles.length
  });

  // console.log(`transforming module "${aModule}"`);

  // copyFiles(modulePath, restFiles, destinationPath);

  // for (let jsFile of jsFiles) {
  //   await transformJsFile({
  //     destinationPath,
  //     modulePath,
  //     jsFile,
  //     dependencyMap
  //   });
  // }
}

exports.transformModule = transformModule;
