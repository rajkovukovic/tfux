"use strict";

const fs = require("fs");
const path = require("path");
const {
  generateTransformList,
} = require("../../utils/generate-transform-list.js");
const {
  moduleInfoToFolderName,
} = require("../../../naming-utils/generate-module-name.js");
const { copyFiles } = require("../../../filesystem/copy-files.js");

/**
 *
 * @param {PackageManagerEngine} this - implicit attribute
 * @param {ModuleInfo} moduleInfo
 * @param {HashMap<string, ModuleInfo>} dependencyMap
 * @param {boolean} force if true all previously installed modules will be overwritten
 */
async function transformModule(moduleInfo, dependencyMap, force = true) {
  const engine = this;

  const modulePath = path.join(
    engine.installedModulesPath,
    moduleInfo.relativeInstallPath
  );

  const destinationPath = path.join(
    engine.destinationPath,
    moduleInfo.relativeDestinationPath
  );

  // console.log({
  //   moduleInfo,
  //   modulePath,
  //   destinationPath,
  // });

  // if already exists in destination path do not install again
  // except if force is true
  if (force || !fs.existsSync(destinationPath)) {
    const { jsFiles, restFiles } = generateTransformList(modulePath);

    copyFiles(modulePath, restFiles, destinationPath);

    // if no dependencies there are no imports to replace in js files
    if (!moduleInfo.dependencies) {
      copyFiles(modulePath, jsFiles, destinationPath);
    } else {
      // console.log({
      //   modulePath,
      //   destinationPath,
      //   jsFiles: jsFiles.length,
      //   restFiles: restFiles.length,
      // });

      for (let jsFile of jsFiles) {
        await engine.transformJsFile({
          modulePath,
          moduleInfo,
          jsFile,
          dependencyMap,
        });
      }
    }
  }
}

exports.transformModule = transformModule;
