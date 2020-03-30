"use strict";

const fs = require("fs");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const childProcess = require("child_process");

const { JSPM_BIN_PATH, VATRA_LIB_PATH, TMP_DIR } = require("../constants");
const {
  transformAndCopyModules
} = require("../transform/transform-and-copy-modules");

/**
 *
 * @param {string[]} dependencies array of name with optional version i.e. ["lodash@1.0", ...]
 */
function installDependenciesToTempPath(dependencies) {
  console.log(`vatra installing ${dependencies}`);

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

  // make dependencies vatra compatible and copy them to the vatra lib
  transformAndCopyModules(VATRA_LIB_PATH, TMP_DIR);
}

exports.installDependenciesToTempPath = installDependenciesToTempPath;
