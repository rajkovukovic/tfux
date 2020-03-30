const { parseJspmJSONDependency } = require("./parse-jspm");

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
    dependency.nestedDependencyLevel = Math.max(
      ...(dependency.dependencies.map(depName =>
        calcOneDependencyDepth(dependencyMap, depName)
      ) + 1)
    );
  }
  return dependency.nestedDependencyLevel;
}

function calcDependencyDepth(jspmJSON) {
  const deps = new Map();
  Object.entries(jspmJSON.dependencies).forEach(([fullName, info]) => {
    const [group, name, version] = parseJspmJSONDependency(fullName);
    deps.set(fullName, {
      fullName,
      group,
      name,
      version,
      dependencies: info.resolve ? Object.entries(info.resolve) : null
    });
  });
  deps
    .keys()
    .forEach(dependencyName =>
      calcOneDependencyDepth(dependencyMap, dependencyName)
    );
  return deps;
}

exports.calcDependencyDepth = calcDependencyDepth;
