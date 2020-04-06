"use strict";

import {
  DEFAULT_GROUP,
  GROUP_SEPARATOR,
  VERSION_SEPARATOR,
} from "../constants";

function generateModuleName(groupName, moduleName, version) {
  const cleanGroupName = !groupName
    ? DEFAULT_GROUP
    : groupName[0] === "@"
    ? groupName.slice(1)
    : groupName;
  return `${cleanGroupName}${GROUP_SEPARATOR}${moduleName}${VERSION_SEPARATOR}${version}`;
}

/**
 * 
 * @param {ModuleInfo} moduleInfo 
 */
function moduleNameFromModuleInfo(moduleInfo) {
  return generateModuleName(moduleInfo.group, moduleInfo.name, moduleInfo.version);
}

exports.generateModuleName = generateModuleName;
exports.moduleNameFromModuleInfo = moduleNameFromModuleInfo;
