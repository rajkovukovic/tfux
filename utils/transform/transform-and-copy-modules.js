"use strict";

const fs = require("fs");
const path = require("path");
const { transformModule } = require("../transform-module");

/**
 *
 * @param {PathLike} destinationPath - a path where dependencies should be copied to
 * @param {PathLike} modulePath - a path where dependencies are installed
 */
function transformAndCopyModules(
  destinationPath,
  modulePath
) {
  const jspmJSONPath = path.join(modulePath, "jspm.json");
  const modulesPath = path.join(modulePath, "jspm_packages");
  if (!fs.existsSync(jspmJSONPath)) {
    throw new Error(`can not find "jspm.json" on path "${modulePath}"`);
  }
  if (!fs.existsSync(jspmJSONPath)) {
    throw new Error(`can not find "jspm_package" on path "${dependencyPath}"`);
  }
  const jspmJSON = require(jspmJSONPath);
  const dependencyVersions = Object.entries(jspmJSON.dependencies).reduce(
    (acc, [moduleName, dependencyInfo]) => {
      acc[moduleName] = dependencyInfo.version;
      return acc;
    },
    {}
  );

  // transforming and copying dependencies to vatra lib
  console.log(dependencyVersions);
  const moduleToCopy = moduleName
    ? [moduleName]
    : Object.keys(dependencyVersions);
  moduleToCopy.forEach(moduleName => {
    transformModule(
      path.join(
        destinationPath,
        moduleName + "@" + dependencyVersions[moduleName]
      ),
      path.join(modulesPath, moduleName),
      moduleName,
      dependencyVersions
    );
  });
}

exports.transformAndCopyModules = transformAndCopyModules;
