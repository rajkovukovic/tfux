'use strict';
const {
  VATRA_LIB_PATH,
  GROUP_SEPARATOR,
  VERSION_SEPARATOR,
} = require('../constants/constants.js');
const { getGroupAndArt, getPom } = require('../versions/versions');
const {
  parseJspmJSONDependency,
} = require('../engines/jspm/tools/parse-jspm.js');
const path = require('path');

/**
 *
 * @param {dep[]} dependency
 */
function returnPomXml(dependency) {
  const dep = Object.entries(dependency)[0];
  const depVersionParts = parseJspmJSONDependency(dep[0]);
  const versionDep = getGroupAndArt(depVersionParts[1]);

  if (dep[1].resolve) {
    // get package.json
    try {
      const pack = require(path.join(
        VATRA_LIB_PATH,
        `${versionDep.group}${GROUP_SEPARATOR}${versionDep.artifact}${VERSION_SEPARATOR}${depVersionParts[2]}`,
        'package.json'
      ));
      let requiresMap = {};
      Object.entries(pack.dependencies).forEach((d) => {
        requiresMap[d[0]] = {
          name: d[0],
          versionRanges: [d[1]],
          resolvedVersion: parseJspmJSONDependency(dep[1].resolve[d[0]])[2],
        };
      });
      return getPom(
        `${versionDep.group}:${versionDep.artifact}#${depVersionParts[2]}`,
        Object.values(requiresMap)
      );
    } catch (error) {
      if (error.code == 'MODULE_NOT_FOUND') {
        console.log(
          'package.json not found. Pom will be generated with resolved versions!!!'
        );
        let requiresMap = {};
        Object.entries(dep[1].resolve).forEach((d) => {
          requiresMap[d[0]] = {
            name: d[0],
            versionRanges: [parseJspmJSONDependency(d[1])[2]],
            resolvedVersion: parseJspmJSONDependency(d[1])[2],
          };
        });
        return getPom(
          `${versionDep.group}:${versionDep.artifact}#${depVersionParts[2]}`,
          Object.values(requiresMap)
        );
      } else {
        console.error(error);
      }
    }
  } else {
    // create pom without dependencies
    return getPom(
      `${versionDep.group}:${versionDep.artifact}#${depVersionParts[2]}`,
      []
    );
  }
}

exports.returnPomXml = returnPomXml;
