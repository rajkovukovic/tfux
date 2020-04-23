'use strict';

const path = require('path');
const childProcess = require('child_process');
const { JSPM_BIN_PATH } = require('../../../constants/constants.js');
const { parseJspmJSONDependency } = require('../tools/parse-jspm.js');

function jspmFormatDependencies(dependencyMap) {
  return Object.entries(dependencyMap)
    .filter(([moduleName, _]) => moduleName !== '@jspm/core')
    .map(([_, moduleJspmName]) => moduleJspmName);
}

function packageJsonFormatDependencies(dependencyMap) {
  return Object.entries(dependencyMap)
    .filter(([moduleName]) => moduleName !== '@jspm/core')
    .map(([moduleName, moduleVersion]) => `${moduleName}@${moduleVersion}`);
}

function installPeerDependenciesIfAny(engine, moduleJspmName, checkedDependencies) {
  if (!checkedDependencies.has(moduleJspmName)) {
    console.log('installPeerDependenciesIfAny', moduleJspmName);
    checkedDependencies.add(moduleJspmName);

    const packageJson = require(path.join(
      engine.installedModulesPath,
      moduleJspmName.split(':').join('/'),
      'package.json'
    ));

    const peerDependencies = packageJsonFormatDependencies(packageJson.peerDependencies);

    if (peerDependencies.length > 0) {
      installDependenciesWithPeer(engine, peerDependencies, true, checkedDependencies);
      const { jspmJSON } = engine;
      // const parentName = parseJspmJSONDependency(moduleJspmName)[1];
      peerDependencies.forEach((peerDep) => {
        const peerDepName = parseJspmJSONDependency(peerDep)[1];
        console.log({ moduleJspmName });
        console.log(
          `\n\n\nWriting: jspmJSON.dependencies.${moduleJspmName}.resolve.${peerDepName} = jspmJSON.resolve.${peerDepName} (${jspmJSON.resolve[peerDepName]})\n\n\n`
        );
        jspmJSON.dependencies[moduleJspmName].resolve[peerDepName] = jspmJSON.resolve[peerDepName];
      });
      engine.saveJspmJSON();
    }

    // checking if module's transitive dependencies have peerDependencies to install
    const moduleJspmInfo = engine.jspmJSON.dependencies[moduleJspmName];
    if (moduleJspmInfo.resolve) {
      const transitiveDeps = JSON.parse(
        JSON.stringify(jspmFormatDependencies(moduleJspmInfo.resolve))
      );

      console.log({
        transitive: true,
        moduleJspmName,
        transitiveDeps,
        moduleJspmName,
      });

      transitiveDeps.forEach((name) => {
        console.log({ transitiveDeps, name });
        installPeerDependenciesIfAny(engine, name, checkedDependencies);
      });
    }
  }
}

function installDependenciesWithPeer(
  engine,
  dependencies,
  installTransitiveDependencies,
  checkedDependencies
) {
  childProcess.execSync(
    `cd ${engine._installedModulesRootPath} && ${JSPM_BIN_PATH} install ${dependencies.join(' ')}`,
    {
      stdio: 'inherit',
    }
  );

  engine.reloadJspmJSON();

  if (installTransitiveDependencies) {
    const modules = jspmFormatDependencies(engine.jspmJSON.resolve);
    console.log({ modules });

    modules.forEach((name) => {
      installPeerDependenciesIfAny(engine, name, checkedDependencies);
    });
  }
}

exports.jspmFormatDependencies = jspmFormatDependencies;
exports.installDependenciesWithPeer = installDependenciesWithPeer;
