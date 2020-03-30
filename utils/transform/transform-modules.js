"use strict";

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const childProcess = require("child_process");
const { transformModule } = require("../transform-module");

const { JSPM_BIN_PATH, VATRA_LIB_PATH, TMP_DIR } = require("../constants");

/**
 *
 * @param {string} dependency name with optional version i.e. "lodash@1.0"
 * @param {boolean} installTransitiveDependencies
 */
function installDependency(dependency, installTransitiveDependencies = true) {
  console.log(`installing "${dependency}"`);
  console.log({ VATRA_LIB_PATH, TMP_DIR });
  const [dependencyName, dependencyVersion] = dependency.split("@");

  // create vatra lib path if not exists
  if (!fs.existsSync(VATRA_LIB_PATH)) {
    mkdirp.sync(VATRA_LIB_PATH);
  }

  // create vatra TMP path if not exists
  if (fs.existsSync(TMP_DIR)) {
    rimraf.sync(TMP_DIR);
  }
  mkdirp.sync(TMP_DIR);

  // install dependency to TMP folder
  childProcess.execSync(`cd ${TMP_DIR} && npm init -y`);
  childProcess.execSync(
    `cd ${TMP_DIR} && ${JSPM_BIN_PATH} install ${dependency}`,
    {
      stdio: "inherit"
    }
  );

  console.log({ TMP_DIR });

  return;

  // make dependencies vatra compatible and copy them to the vatra lib
  transformAndCopyModule(
    VATRA_LIB_PATH,
    TMP_DIR,
    installTransitiveDependencies ? null : dependencyName
  );
}

/**
 *
 * @param {PathLike} destinationPath - a path where dependencies should be copied to
 * @param {PathLike} modulePath - a path where dependencies are installed
 * @param {string} moduleName to be copied, if falsy,
 * all dependencies defined by jspm.json,
 * or package.lock in case npm is used to install deps,
 * will be copied
 */
function transformAndCopyModule(
  destinationPath,
  modulePath,
  moduleName = null
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

exports.installDependency = installDependency;
