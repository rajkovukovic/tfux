'use strict';

const {
  DEFAULT_GROUP_FOR_3RD_PARTY,
  GROUP_SEPARATOR,
  VERSION_SEPARATOR,
} = require('../constants/constants.js');

function generateModuleName(groupName, moduleName, version) {
  if (groupName && typeof groupName !== 'string')
    throw new Error('groupName must be nill or a string');

  if (!moduleName || typeof moduleName !== 'string')
    throw new Error('moduleName must be a non-empty string');

  if (!version || typeof version !== 'string')
    throw new Error('version must be a non-empty string');

  let cleanGroupName = groupName;
  let cleanModuleName = moduleName;

  if (moduleName.includes('/')) {
    let split = moduleName.split('/');
    if (split.length > 2) {
      throw new Error(
        `module name must be in format "@group/module" or "module". Instead got "${moduleName}"`
      );
    }
    cleanGroupName = split[0];
    cleanModuleName = split[1];
  }

  if (!cleanGroupName || cleanGroupName === 'npm') cleanGroupName = DEFAULT_GROUP_FOR_3RD_PARTY;

  if (cleanGroupName[0] === '@') cleanGroupName = cleanGroupName.slice(1);

  return `${cleanGroupName}${GROUP_SEPARATOR}${cleanModuleName}${VERSION_SEPARATOR}${version}`;
}

/**
 *
 * @param {ModuleInfo} moduleInfo
 */
function moduleInfoToFolderName(moduleInfo) {
  if (typeof moduleInfo !== 'object' || moduleInfo === null) {
    throw new Error('moduleInfo must be an Object');
  }
  return generateModuleName(moduleInfo.group, moduleInfo.name, moduleInfo.version);
}

exports.generateModuleName = generateModuleName;
exports.moduleInfoToFolderName = moduleInfoToFolderName;
