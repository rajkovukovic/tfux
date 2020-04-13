"use strict";

const { parseJspmJSONDependency } = require("./parse-jspm.js");
const {
  generateModuleName,
} = require("../../../naming-utils/generate-module-name.js");

function calcOneDependencyDepth(dependencyMap, dependencyName) {
  const dependency = dependencyMap.get(dependencyName);
  if (!dependency) {
    throw new Error(
      `Can not find dependency "${dependencyName}" in dependencyMap`
    );
  }
  if (dependency && Number.isFinite(dependency.nestedDependencyLevel)) {
    return dependency.nestedDependencyLevel;
  }
  if (!dependency.dependencies) {
    dependency.nestedDependencyLevel = 0;
  } else {
    dependency.nestedDependencyLevel =
      Math.max(
        ...dependency.dependencies.map((depName) =>
          calcOneDependencyDepth(dependencyMap, depName)
        )
      ) + 1;
  }

  return dependency.nestedDependencyLevel;
}

function calcDependencyDepth(jspmJSON) {
  const dependencyMap = new Map();

  Object.entries(jspmJSON.dependencies).forEach(([fullName, info]) => {
    const [group, name, version] = parseJspmJSONDependency(fullName);
    dependencyMap.set(fullName, {
      fullName,
      group,
      name,
      version,
      relativeDestinationPath: generateModuleName(group, name, version),
      relativeInstallPath: `${group ? group + "/" : ""}${name}@${version}`,
      dependencies: info.resolve ? Object.values(info.resolve) : null,
      nestedDependencyLevel: null,
    });
  });

  Array.from(dependencyMap.keys()).forEach((dependencyName) =>
    calcOneDependencyDepth(dependencyMap, dependencyName)
  );

  return dependencyMap;
}

exports.calcDependencyDepth = calcDependencyDepth;
