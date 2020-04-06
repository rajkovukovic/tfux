const fs = require("fs");
const path = require("path");
const { calcDependencyDepth } = require("../tools/jspm-dependency-depth");

/**
 *
 * @param {PackageManagerEngine} this - implicit attribute
 */
function transformAndCopyModules() {
  const engine = this;
  const { installedModulesPath } = engine;
  const jspmJSONPath = path.join(installedModulesPath, "jspm.json");
  const modulesPath = path.join(installedModulesPath, "jspm_packages");
  if (!fs.existsSync(jspmJSONPath)) {
    throw new Error(`can not find "jspm.json" on path "${modulesPath}"`);
  }
  if (!fs.existsSync(jspmJSONPath)) {
    throw new Error(`can not find "jspm_package" on path "${dependencyPath}"`);
  }
  const jspmJSON = require(jspmJSONPath);

  const modulesMap = calcDependencyDepth(jspmJSON);

  const modulesToTransform = Array.from(modulesMap.values());

  const nodeInternalModulesMap = new Map();

  modulesMap.set("node", nodeInternalModulesMap);

  const nodeInternalModules = fs
    .readdirSync(
      path.join(modulesPath, "npm/@jspm/core@1.0.4/nodelibs"),
      "utf8"
    )
    .filter((filename) => path.extname(filename) === ".js")
    .forEach((filename) => {
      const filenameNoExtension = path.basename(
        filename,
        path.extname(filename)
      );
      nodeInternalModulesMap.set(filenameNoExtension, {
        fullName: null,
        group: "npm",
        name: `@jspm/core/${filenameNoExtension}`,
        version: "1.0.4",
        libDirectoryName: `npm.@jspm/core@1.0.4/nodelibs/${filename}`,
        dependencies: null,
        nestedDependencyLevel: 0,
      });
    });

  console.log({ nodeInternalModulesMap });

  modulesToTransform
    .sort((a, b) => a.nestedDependencyLevel - b.nestedDependencyLevel)
    .forEach((moduleInfo) => {
      engine.transformModule(moduleInfo, modulesMap);
    });
}

exports.transformAndCopyModules = transformAndCopyModules;
