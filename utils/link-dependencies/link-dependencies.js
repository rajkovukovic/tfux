'use strict';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { FIREX_LIB_NAME, FIREX_LIB_PATH } = require('../constants/constants.js');

/**
 *
 * @param {PathLike} destinationPath
 * @param {string[]} dependencies
 */
function linkDependencies(destinationPath, dependencies) {
  const destinationLibPath = path.join(destinationPath, FIREX_LIB_NAME);
  if (!fs.existsSync(destinationLibPath)) {
    mkdirp.sync(destinationLibPath);
  }
  if (dependencies && !Array.isArray(dependencies)) {
    throw new Error('linkDependencies(): dependencies must be of Array type');
  }
  dependencies.forEach((dependencyDirName) =>
    fs.symlinkSync(
      path.join(FIREX_LIB_PATH, dependencyDirName),
      path.join(destinationLibPath, dependencyDirName.split('.').slice(0, -1).join('.'))
    )
  );
}

exports.linkDependencies = linkDependencies;
