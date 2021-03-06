'use strict';

const fs = require('fs');
const path = require('path');
const { logger } = require('../logger/logger.js');
const { generateTransformList } = require('./generate-transform-list');
const { copyFiles } = require('../filesystem/copy-files');
const { transformJsFile } = require('./transform-js-file');

/**
 *
 * @param {PathLike} modulesDestinationPath
 * @param {PathLike} installedModulesPath
 * @param {ModuleInfo} moduleInfo
 * @param {HashMap<string, ModuleInfo>} dependencyMap
 * @param {boolean} force
 */
async function transformModule(
  modulesDestinationPath,
  installedModulesPath,
  moduleInfo,
  dependencyMap,
  force = true
) {
  const modulePath = path.join(
    installedModulesPath,
    moduleInfo.group || 'npm',
    `${moduleInfo.name}@${moduleInfo.version}`
  );

  const destinationPath = path.join(modulesDestinationPath, moduleInfo.relativeInstallPath);

  // if already exists in destination path do not install again
  // except if force is true
  if (force || !fs.existsSync(destinationPath)) {
    const { jsFiles, restFiles } = generateTransformList(modulePath);

    copyFiles(modulePath, restFiles, destinationPath);

    // if no dependencies there are no imports to replace in js files
    if (!moduleInfo.dependencies) {
      copyFiles(modulePath, jsFiles, destinationPath);
    } else {
      // logger.info({
      //   modulePath,
      //   destinationPath,
      //   jsFiles: jsFiles.length,
      //   restFiles: restFiles.length
      // });

      for (let jsFile of jsFiles) {
        await transformJsFile({
          destinationPath,
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
