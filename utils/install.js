"use strict";

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const childProcess = require("child_process");
const { transformToTfux } = require("./transform");

const { TFUX_LIB_PATH, TMP_DIR } = require("./constants");

/**
 *
 * @param {string} dependency name with optional version i.e. "lodash@1.0"
 * @param {boolean} installTransitiveDependencies
 */
function installDependency(dependency, installTransitiveDependencies = true) {
  console.log(`installing "${dependency}"`);
  console.log({ TFUX_LIB_PATH, TMP_DIR });
  const [dependencyName, dependencyVersion] = dependency.split("@");

  // create tfux lib path if not exists
  if (!fs.existsSync(TFUX_LIB_PATH)) {
    mkdirp.sync(TFUX_LIB_PATH);
  }

  // create tfux TMP path if not exists
  if (fs.existsSync(TMP_DIR)) {
    rimraf.sync(TMP_DIR);
  }
  mkdirp.sync(TMP_DIR);

  // install dependency to TMP folder
  childProcess.execSync(`cd ${TMP_DIR} && npm init -y`);
  childProcess.execSync(`cd ${TMP_DIR} && npm install ${dependency} --save`, {
    stdio: "inherit"
  });

  // make dependencies tfux compatible and copy them to the tfux lib
  transformAndCopyModule(
    TFUX_LIB_PATH,
    TMP_DIR,
    installTransitiveDependencies ? null : dependencyName
  );
}

/**
 *
 * @param {PathLike} destinationPath - a path where dependencies should be copied to
 * @param {PathLike} modulePath - a path where dependencies are installed
 * @param {string} moduleName to be copied, if falsy,
 * all dependencies defined by package.lock will be copied
 */
function transformAndCopyModule(
  destinationPath,
  modulePath,
  moduleName = null
) {
  const packageLockPath = path.join(modulePath, "package-lock.json");
  const nodeModulesPath = path.join(modulePath, "node_modules");
  if (!fs.existsSync(packageLockPath)) {
    throw new Error(`can not find "package-lock.json" on path "${modulePath}"`);
  }
  if (!fs.existsSync(packageLockPath)) {
    throw new Error(`can not find "node_modules" on path "${dependencyPath}"`);
  }
  const packageLock = require(packageLockPath);
  const dependencyVersions = Object.entries(packageLock.dependencies).reduce(
    (acc, [moduleName, dependencyInfo]) => {
      acc[moduleName] = dependencyInfo.version;
      return acc;
    },
    {}
  );

  // transforming and copying dependencies to tfux lib
  console.log(dependencyVersions);
  const moduleToCopy = moduleName
    ? [moduleName]
    : Object.keys(dependencyVersions);
  moduleToCopy.forEach(moduleName => {
    transformToTfux(
      path.join(
        destinationPath,
        moduleName + "@" + dependencyVersions[moduleName]
      ),
      path.join(nodeModulesPath, moduleName),
      moduleName
    );
  });
}

exports.installDependency = installDependency;
