const fs = require('fs');
const path = require('path');
const { calcDependencyDepth } = require('../tools/jspm-dependency-depth');
const { generateModuleName } = require('../../../naming-utils/generate-module-name.js');
/**
 *
 * @param {PackageManagerEngine} this - implicit attribute
 */
function transformAndCopyModules() {
  const engine = this;

  const { jspmCoreVersion } = engine;

  const { installedModulesPath, jspmJSON } = engine;

  if (!fs.existsSync(installedModulesPath)) {
    throw new Error(`can not find "jspm_packages" on path "${installedModulesPath}"`);
  }

  const modulesMap = calcDependencyDepth(jspmJSON);

  const modulesToTransform = Array.from(modulesMap.values());

  const nodeInternalModulesMap = new Map();

  modulesMap.set('node', nodeInternalModulesMap);

  fs.readdirSync(
    path.join(installedModulesPath, `npm/@jspm/core@${jspmCoreVersion}/nodelibs`),
    'utf8'
  )
    .filter((filename) => path.extname(filename) === '.js')
    .forEach((filename) => {
      const filenameNoExtension = path.basename(filename, path.extname(filename));
      nodeInternalModulesMap.set(filenameNoExtension, {
        fullName: null,
        group: 'npm',
        name: `@jspm/core/${filenameNoExtension}`,
        version: jspmCoreVersion,
        relativeDestinationPath: `${generateModuleName(
          'jspm',
          'core',
          jspmCoreVersion
        )}/nodelibs/${filename}`,
        importPath: `${generateModuleName(
          'jspm',
          'core',
          jspmCoreVersion.split('.').slice(0, -1).join('.')
        )}/nodelibs/${filename}`,
        relativeInstallPath: `@jspm/core@${jspmCoreVersion}/nodelibs/${filename}`,
        dependencies: null,
        nestedDependencyLevel: 0,
      });
    });

  modulesToTransform
    .sort((a, b) => a.nestedDependencyLevel - b.nestedDependencyLevel)
    .forEach((moduleInfo) => {
      engine.transformModule(moduleInfo, modulesMap);
      engine.addPomXml(moduleInfo);
      engine.copyToRepo(moduleInfo);
    });

  return modulesMap;
}

exports.transformAndCopyModules = transformAndCopyModules;
